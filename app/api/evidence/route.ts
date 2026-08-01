import { env } from "cloudflare:workers";
import {
  accessErrorResponse,
  type RequestActor,
  requireRequestActor,
  requireRole,
} from "@/lib/server-identity";

const assignmentStatuses = ["Draft", "Open", "Closed", "Cancelled"] as const;
const editableCaseStatuses = ["Draft", "Changes requested"] as const;
const consentTypes = ["Clinical documentation", "Internal evidence", "External publication"] as const;
const consentStatuses = ["Pending", "Granted", "Declined", "Withdrawn"] as const;
const mediaTypes = ["Before image", "After image", "Progress image", "Voice note", "Measurement document"] as const;
const captureStages = ["Before", "After", "Progress", "Narrative", "Measurement"] as const;
const allowedMimeTypes = new Set([
  "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif",
  "audio/mpeg", "audio/mp4", "audio/wav", "audio/webm", "audio/x-m4a",
  "application/pdf",
]);

type EvidenceAction =
  | "create-assignment"
  | "save-case"
  | "submit-case"
  | "add-media"
  | "record-consent"
  | "review-case";

type JsonRecord = Record<string, unknown>;

function db() {
  if (!env.DB) throw new Error("D1 binding DB is unavailable");
  return env.DB;
}

function cleanText(value: unknown, max: number, field: string, required = false) {
  const result = typeof value === "string" ? value.trim().slice(0, max) : "";
  if (required && !result) throw new InputError(`กรุณาระบุ${field}`);
  return result;
}

function cleanInteger(value: unknown, min: number, max: number, field: string) {
  const result = Number(value);
  if (!Number.isInteger(result) || result < min || result > max) {
    throw new InputError(`${field}ไม่ถูกต้อง`);
  }
  return result;
}

function cleanStringArray(value: unknown, field: string, maxItems = 20) {
  if (!Array.isArray(value) || value.length > maxItems) throw new InputError(`${field}ไม่ถูกต้อง`);
  return value.map((item) => cleanText(item, 80, field, true));
}

function cleanObject(value: unknown, field: string) {
  if (value === undefined || value === null) return {};
  if (typeof value !== "object" || Array.isArray(value)) throw new InputError(`${field}ไม่ถูกต้อง`);
  const serialized = JSON.stringify(value);
  if (serialized.length > 12_000) throw new InputError(`${field}มีขนาดใหญ่เกินไป`);
  return value as JsonRecord;
}

function isOneOf<T extends readonly string[]>(value: unknown, allowed: T): value is T[number] {
  return typeof value === "string" && allowed.includes(value);
}

function scopedAccounts(actor: RequestActor) {
  if (actor.accountScope === "*") return null;
  return actor.accountScope.split(",").map((item) => item.trim()).filter(Boolean);
}

function assertAccountAccess(actor: RequestActor, accountId: string) {
  if (["Therapist", "Customer"].includes(actor.role) && actor.accountScope === "*") {
    throw new InputError("บัญชีนี้ยังไม่ได้ผูกกับสถานประกอบการ กรุณาติดต่อผู้ดูแลระบบ", 403);
  }
  const allowed = scopedAccounts(actor);
  if (allowed && !allowed.includes(accountId)) throw new InputError("ไม่มีสิทธิ์เข้าถึงบัญชีลูกค้านี้", 403);
}

async function assertAccountExists(tenantId: string, accountId: string) {
  const account = await db().prepare(
    "SELECT id FROM client_accounts WHERE tenant_id = ? AND id = ? LIMIT 1",
  ).bind(tenantId, accountId).first();
  if (!account) throw new InputError("ไม่พบบัญชีลูกค้าที่ระบุ", 404);
}

async function loadAssignment(tenantId: string, assignmentId: string) {
  const assignment = await db().prepare(
    "SELECT * FROM evidence_assignments WHERE tenant_id = ? AND id = ? LIMIT 1",
  ).bind(tenantId, assignmentId).first<Record<string, unknown>>();
  if (!assignment) throw new InputError("ไม่พบการบ้านที่ระบุ", 404);
  return assignment;
}

async function loadCase(tenantId: string, caseId: string) {
  const evidenceCase = await db().prepare(
    "SELECT * FROM evidence_cases WHERE tenant_id = ? AND id = ? LIMIT 1",
  ).bind(tenantId, caseId).first<Record<string, unknown>>();
  if (!evidenceCase) throw new InputError("ไม่พบกรณีศึกษาที่ระบุ", 404);
  return evidenceCase;
}

async function audit(actor: RequestActor, recordId: string, eventType: string, eventData: JsonRecord) {
  await db().prepare(`INSERT INTO audit_events
    (tenant_id, document_id, actor_email, actor_role, event_type, event_data)
    VALUES (?, ?, ?, ?, ?, ?)`).bind(
      actor.tenantId,
      recordId,
      actor.email,
      actor.role,
      eventType,
      JSON.stringify(eventData),
    ).run();
}

async function ensureSeedAssignment() {
  await db().prepare(`INSERT INTO evidence_assignments
    (id, tenant_id, account_id, title, period_key, instructions, required_case_count,
     due_at, assigned_role, status, created_by_email)
    SELECT 'assignment-linna-2026-08', 'bib', 'linna',
      'การบ้านผลลัพธ์ประจำเดือน สิงหาคม 2569', '2026-08',
      'ส่งกรณีศึกษาที่ใช้รหัสแทนผู้รับบริการ พร้อมภาพหรือเสียง ข้อมูลโปรแกรม จำนวนครั้ง และผลที่สังเกตได้ โดยไม่บันทึกชื่อหรือข้อมูลติดต่อของผู้รับบริการ',
      1, '2026-08-31', 'Therapist', 'Open', 'system@bib.local'
    WHERE EXISTS (
      SELECT 1 FROM client_accounts WHERE tenant_id = 'bib' AND id = 'linna'
    ) AND NOT EXISTS (
      SELECT 1 FROM evidence_assignments
      WHERE tenant_id = 'bib' AND account_id = 'linna' AND period_key = '2026-08'
    )`).run();
}

class InputError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "InputError";
    this.status = status;
  }
}

function errorResponse(error: unknown) {
  const accessResponse = accessErrorResponse(error);
  if (accessResponse) return accessResponse;
  if (error instanceof InputError) return Response.json({ error: error.message }, { status: error.status });
  return Response.json(
    { error: error instanceof Error ? error.message : "ไม่สามารถดำเนินการกับข้อมูลหลักฐานได้" },
    { status: 500 },
  );
}

async function createAssignment(actor: RequestActor, payload: JsonRecord) {
  requireRole(actor, ["Executive", "Trainer"]);
  const accountId = cleanText(payload.accountId, 80, "บัญชีลูกค้า", true);
  assertAccountAccess(actor, accountId);
  await assertAccountExists(actor.tenantId, accountId);
  const status = isOneOf(payload.status, assignmentStatuses) ? payload.status : "Draft";
  const id = `assignment-${crypto.randomUUID()}`;
  await db().prepare(`INSERT INTO evidence_assignments
    (id, tenant_id, account_id, title, period_key, instructions, required_case_count,
     due_at, assigned_role, status, created_by_email)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Therapist', ?, ?)`).bind(
      id,
      actor.tenantId,
      accountId,
      cleanText(payload.title, 180, "ชื่อการบ้าน", true),
      cleanText(payload.periodKey, 20, "รอบการบ้าน", true),
      cleanText(payload.instructions, 4_000, "คำแนะนำ"),
      cleanInteger(payload.requiredCaseCount ?? 1, 1, 100, "จำนวนกรณีศึกษา"),
      cleanText(payload.dueAt, 40, "วันครบกำหนด"),
      status,
      actor.email,
    ).run();
  await audit(actor, id, "Evidence assignment created", { accountId, status });
  return Response.json({ ok: true, id, status }, { status: 201 });
}

async function saveCase(actor: RequestActor, payload: JsonRecord) {
  requireRole(actor, ["Executive", "Trainer", "Therapist", "Customer"]);
  if ("patientName" in payload || "customerName" in payload || "patientPhone" in payload || "patientEmail" in payload) {
    throw new InputError("ห้ามบันทึกชื่อ เบอร์โทร หรืออีเมลของผู้รับบริการในกรณีศึกษา");
  }

  const requestedId = cleanText(payload.caseId, 100, "รหัสกรณีศึกษา");
  const assignmentId = cleanText(payload.assignmentId, 100, "การบ้าน", true);
  const assignment = await loadAssignment(actor.tenantId, assignmentId);
  const accountId = String(assignment.account_id);
  assertAccountAccess(actor, accountId);
  if (["Therapist", "Customer"].includes(actor.role) && assignment.status !== "Open") {
    throw new InputError("การบ้านนี้ยังไม่เปิดรับหรือปิดรับแล้ว", 409);
  }

  const caseReference = cleanText(payload.caseReference, 64, "รหัสอ้างอิงกรณีศึกษา", true);
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{2,63}$/.test(caseReference)) {
    throw new InputError("รหัสอ้างอิงต้องมี 3–64 ตัว และใช้เฉพาะตัวอักษรอังกฤษ ตัวเลข - หรือ _");
  }
  const programCodes = cleanStringArray(payload.programCodes ?? [], "โปรแกรมที่ใช้");
  const values = {
    therapistContactId: cleanText(payload.therapistContactId, 100, "ผู้ปฏิบัติงาน"),
    ageBand: cleanText(payload.ageBand, 40, "ช่วงอายุ"),
    concernCode: cleanText(payload.concernCode, 100, "เป้าหมายการดูแล", true),
    protocolCode: cleanText(payload.protocolCode, 100, "รหัสแนวทาง"),
    programCodesJson: JSON.stringify(programCodes),
    sessionCount: cleanInteger(payload.sessionCount ?? 0, 0, 500, "จำนวนครั้ง"),
    baselineDate: cleanText(payload.baselineDate, 20, "วันที่เริ่มต้น"),
    followUpDate: cleanText(payload.followUpDate, 20, "วันที่ติดตาม"),
    outcomeMeasuresJson: JSON.stringify(cleanObject(payload.outcomeMeasures, "ผลการวัด")),
    customerFeedbackJson: JSON.stringify(cleanObject(payload.customerFeedback, "ความคิดเห็นผู้รับบริการ")),
    therapistSummary: cleanText(payload.therapistSummary, 6_000, "ข้อสังเกตของผู้ปฏิบัติงาน"),
    voiceTranscript: cleanText(payload.voiceTranscript, 12_000, "ข้อความจากเสียง"),
  };

  let id = requestedId;
  if (id) {
    const current = await loadCase(actor.tenantId, id);
    assertAccountAccess(actor, String(current.account_id));
    if (current.account_id !== accountId || current.assignment_id !== assignmentId) {
      throw new InputError("กรณีศึกษาไม่ตรงกับการบ้านหรือบัญชีลูกค้า", 409);
    }
    if (!editableCaseStatuses.includes(current.status as typeof editableCaseStatuses[number])) {
      throw new InputError("กรณีศึกษานี้ถูกส่งตรวจแล้วและแก้ไขไม่ได้", 409);
    }
    await db().prepare(`UPDATE evidence_cases SET
      therapist_contact_id = ?, case_reference = ?, age_band = ?, concern_code = ?,
      protocol_code = ?, program_codes_json = ?, session_count = ?, baseline_date = ?,
      follow_up_date = ?, outcome_measures_json = ?, customer_feedback_json = ?,
      therapist_summary = ?, voice_transcript = ?, status = 'Draft', updated_at = CURRENT_TIMESTAMP
      WHERE tenant_id = ? AND id = ?`).bind(
        values.therapistContactId, caseReference, values.ageBand, values.concernCode,
        values.protocolCode, values.programCodesJson, values.sessionCount, values.baselineDate,
        values.followUpDate, values.outcomeMeasuresJson, values.customerFeedbackJson,
        values.therapistSummary, values.voiceTranscript, actor.tenantId, id,
      ).run();
  } else {
    const duplicate = await db().prepare(`SELECT id FROM evidence_cases
      WHERE tenant_id = ? AND account_id = ? AND case_reference = ? LIMIT 1`).bind(
        actor.tenantId, accountId, caseReference,
      ).first();
    if (duplicate) throw new InputError("รหัสอ้างอิงกรณีศึกษานี้ถูกใช้แล้ว", 409);
    id = `case-${crypto.randomUUID()}`;
    await db().prepare(`INSERT INTO evidence_cases
      (id, tenant_id, account_id, assignment_id, therapist_contact_id, created_by_email,
       case_reference, age_band, concern_code, protocol_code, program_codes_json,
       session_count, baseline_date, follow_up_date, outcome_measures_json,
       customer_feedback_json, therapist_summary, voice_transcript, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Draft')`).bind(
        id, actor.tenantId, accountId, assignmentId, values.therapistContactId, actor.email,
        caseReference, values.ageBand, values.concernCode, values.protocolCode,
        values.programCodesJson, values.sessionCount, values.baselineDate,
        values.followUpDate, values.outcomeMeasuresJson, values.customerFeedbackJson,
        values.therapistSummary, values.voiceTranscript,
      ).run();
  }
  await audit(actor, id, requestedId ? "Evidence case saved" : "Evidence case created", {
    accountId, assignmentId, status: "Draft",
  });
  return Response.json({ ok: true, id, status: "Draft" }, { status: requestedId ? 200 : 201 });
}

async function addMedia(actor: RequestActor, payload: JsonRecord) {
  requireRole(actor, ["Executive", "Trainer", "Therapist", "Customer"]);
  const caseId = cleanText(payload.caseId, 100, "กรณีศึกษา", true);
  const evidenceCase = await loadCase(actor.tenantId, caseId);
  const accountId = String(evidenceCase.account_id);
  assertAccountAccess(actor, accountId);
  if (!editableCaseStatuses.includes(evidenceCase.status as typeof editableCaseStatuses[number])) {
    throw new InputError("ไม่สามารถเพิ่มไฟล์หลังส่งกรณีศึกษาแล้ว", 409);
  }
  if (!isOneOf(payload.mediaType, mediaTypes) || !isOneOf(payload.captureStage, captureStages)) {
    throw new InputError("ประเภทหลักฐานหรือช่วงเวลาที่บันทึกไม่ถูกต้อง");
  }
  const mimeType = cleanText(payload.mimeType, 100, "ชนิดไฟล์", true).toLowerCase();
  if (!allowedMimeTypes.has(mimeType)) throw new InputError("รองรับเฉพาะไฟล์ภาพ เสียง และ PDF ที่กำหนด");
  const byteSize = cleanInteger(payload.byteSize ?? 0, 0, 100_000_000, "ขนาดไฟล์");
  const id = `media-${crypto.randomUUID()}`;
  await db().prepare(`INSERT INTO evidence_media
    (id, tenant_id, account_id, case_id, media_type, capture_stage, file_name,
     mime_type, byte_size, upload_status, taken_at, uploaded_by_email)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending upload', ?, ?)`).bind(
      id, actor.tenantId, accountId, caseId, payload.mediaType, payload.captureStage,
      cleanText(payload.fileName, 220, "ชื่อไฟล์", true), mimeType, byteSize,
      cleanText(payload.takenAt, 40, "วันที่บันทึก"), actor.email,
    ).run();
  await audit(actor, caseId, "Evidence media metadata added", {
    mediaId: id, mediaType: payload.mediaType, uploadStatus: "Pending upload",
  });
  return Response.json({ ok: true, id, uploadStatus: "Pending upload" }, { status: 201 });
}

async function recordConsent(actor: RequestActor, payload: JsonRecord) {
  requireRole(actor, ["Executive", "Trainer", "Therapist", "Customer"]);
  const caseId = cleanText(payload.caseId, 100, "กรณีศึกษา", true);
  const evidenceCase = await loadCase(actor.tenantId, caseId);
  const accountId = String(evidenceCase.account_id);
  assertAccountAccess(actor, accountId);
  if (!isOneOf(payload.consentType, consentTypes) || !isOneOf(payload.status, consentStatuses)) {
    throw new InputError("ประเภทหรือสถานะความยินยอมไม่ถูกต้อง");
  }
  const id = `consent-${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  await db().prepare(`INSERT INTO consent_records
    (id, tenant_id, account_id, case_id, consent_type, status, scope_json,
     consented_at, expires_at, withdrawn_at, captured_by_email, evidence_document_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
      id, actor.tenantId, accountId, caseId, payload.consentType, payload.status,
      JSON.stringify(cleanObject(payload.scope, "ขอบเขตความยินยอม")),
      payload.status === "Granted" ? cleanText(payload.consentedAt, 40, "วันที่ให้ความยินยอม") || now : "",
      cleanText(payload.expiresAt, 40, "วันหมดอายุ"),
      payload.status === "Withdrawn" ? cleanText(payload.withdrawnAt, 40, "วันที่ถอนความยินยอม") || now : "",
      actor.email,
      cleanText(payload.evidenceDocumentId, 160, "เอกสารยืนยัน"),
    ).run();
  await audit(actor, caseId, "Evidence consent recorded", {
    consentId: id, consentType: payload.consentType, status: payload.status,
  });
  return Response.json({ ok: true, id, status: payload.status }, { status: 201 });
}

async function submitCase(actor: RequestActor, payload: JsonRecord) {
  requireRole(actor, ["Executive", "Trainer", "Therapist", "Customer"]);
  const caseId = cleanText(payload.caseId, 100, "กรณีศึกษา", true);
  const evidenceCase = await loadCase(actor.tenantId, caseId);
  const accountId = String(evidenceCase.account_id);
  assertAccountAccess(actor, accountId);
  if (!editableCaseStatuses.includes(evidenceCase.status as typeof editableCaseStatuses[number])) {
    throw new InputError("กรณีศึกษานี้ไม่อยู่ในสถานะที่ส่งตรวจได้", 409);
  }
  if (!evidenceCase.protocol_code || Number(evidenceCase.session_count) < 1) {
    throw new InputError("กรุณาระบุแนวทางที่ใช้และจำนวนครั้งก่อนส่งตรวจ");
  }
  if (!evidenceCase.therapist_summary && !evidenceCase.voice_transcript) {
    throw new InputError("กรุณาบันทึกข้อสังเกตหรือข้อความจากเสียงก่อนส่งตรวจ");
  }
  const consent = await db().prepare(`SELECT id FROM consent_records
    WHERE tenant_id = ? AND case_id = ? AND consent_type = 'Clinical documentation'
    AND status = 'Granted' ORDER BY created_at DESC LIMIT 1`).bind(actor.tenantId, caseId).first();
  if (!consent) throw new InputError("ต้องบันทึกความยินยอมสำหรับการเก็บข้อมูลทางคลินิกก่อนส่งตรวจ", 409);
  const media = await db().prepare(`SELECT id, media_type, capture_stage, upload_status, checksum
    FROM evidence_media WHERE tenant_id = ? AND case_id = ? ORDER BY created_at`).bind(
      actor.tenantId, caseId,
    ).all<Record<string, unknown>>();
  if (!media.results.length) throw new InputError("กรุณาเพิ่มภาพ เสียง หรือเอกสารผลการวัดอย่างน้อยหนึ่งรายการ", 409);

  const latest = await db().prepare(`SELECT COALESCE(MAX(version), 0) AS version
    FROM evidence_submissions WHERE tenant_id = ? AND case_id = ?`).bind(
      actor.tenantId, caseId,
    ).first<{ version: number }>();
  const version = Number(latest?.version || 0) + 1;
  const id = `submission-${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const snapshot = {
    caseReference: evidenceCase.case_reference,
    ageBand: evidenceCase.age_band,
    concernCode: evidenceCase.concern_code,
    protocolCode: evidenceCase.protocol_code,
    programCodes: JSON.parse(String(evidenceCase.program_codes_json || "[]")),
    sessionCount: evidenceCase.session_count,
    baselineDate: evidenceCase.baseline_date,
    followUpDate: evidenceCase.follow_up_date,
    outcomeMeasures: JSON.parse(String(evidenceCase.outcome_measures_json || "{}")),
    customerFeedback: JSON.parse(String(evidenceCase.customer_feedback_json || "{}")),
    therapistSummary: evidenceCase.therapist_summary,
    voiceTranscript: evidenceCase.voice_transcript,
    media: media.results,
  };
  await db().batch([
    db().prepare(`INSERT INTO evidence_submissions
      (id, tenant_id, account_id, case_id, version, status, snapshot_json,
       submitted_by_email, submitted_at)
      VALUES (?, ?, ?, ?, ?, 'Submitted', ?, ?, ?)`).bind(
        id, actor.tenantId, accountId, caseId, version, JSON.stringify(snapshot), actor.email, now,
      ),
    db().prepare(`UPDATE evidence_cases SET status = 'Submitted', submitted_at = ?,
      updated_at = CURRENT_TIMESTAMP WHERE tenant_id = ? AND id = ?`).bind(now, actor.tenantId, caseId),
    db().prepare(`UPDATE evidence_media SET submission_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE tenant_id = ? AND case_id = ? AND submission_id = ''`).bind(id, actor.tenantId, caseId),
  ]);
  await audit(actor, caseId, "Evidence case submitted", { submissionId: id, version });
  return Response.json({ ok: true, id, caseId, version, status: "Submitted" }, { status: 201 });
}

async function reviewCase(actor: RequestActor, payload: JsonRecord) {
  requireRole(actor, ["Executive", "Trainer"]);
  const caseId = cleanText(payload.caseId, 100, "กรณีศึกษา", true);
  const evidenceCase = await loadCase(actor.tenantId, caseId);
  const accountId = String(evidenceCase.account_id);
  assertAccountAccess(actor, accountId);
  const submissionId = cleanText(payload.submissionId, 120, "ฉบับที่ส่งตรวจ", true);
  const submission = await db().prepare(`SELECT * FROM evidence_submissions
    WHERE tenant_id = ? AND account_id = ? AND case_id = ? AND id = ? LIMIT 1`).bind(
      actor.tenantId, accountId, caseId, submissionId,
    ).first<Record<string, unknown>>();
  if (!submission) throw new InputError("ไม่พบฉบับที่ส่งตรวจ", 404);
  if (submission.status !== "Submitted" && submission.status !== "In review") {
    throw new InputError("ฉบับนี้ได้รับการตัดสินแล้ว", 409);
  }
  const decision = payload.decision === "Approve" ? "Approve" : payload.decision === "Return" ? "Return" : "";
  if (!decision) throw new InputError("กรุณาเลือกส่งกลับแก้ไขหรืออนุมัติ");
  const comment = cleanText(payload.comment, 4_000, "ความเห็น");
  if (decision === "Return" && !comment) throw new InputError("กรุณาระบุสิ่งที่ต้องแก้ไข");
  if (decision === "Approve") {
    const pending = await db().prepare(`SELECT COUNT(*) AS total FROM evidence_media
      WHERE tenant_id = ? AND case_id = ? AND upload_status <> 'Uploaded'`).bind(
        actor.tenantId, caseId,
      ).first<{ total: number }>();
    if (pending?.total) {
      throw new InputError("ยังอนุมัติไม่ได้ เนื่องจากมีไฟล์ที่ยังอัปโหลดไม่สมบูรณ์", 409);
    }
  }
  const reviewId = `review-${crypto.randomUUID()}`;
  const submissionStatus = decision === "Approve" ? "Approved" : "Changes requested";
  const caseStatus = submissionStatus;
  const now = new Date().toISOString();
  await db().batch([
    db().prepare(`INSERT INTO evidence_reviews
      (id, tenant_id, account_id, case_id, submission_id, reviewer_email,
       reviewer_role, decision, comment)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
        reviewId, actor.tenantId, accountId, caseId, submissionId, actor.email,
        actor.role, decision, comment,
      ),
    db().prepare(`UPDATE evidence_submissions SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE tenant_id = ? AND id = ?`).bind(submissionStatus, actor.tenantId, submissionId),
    db().prepare(`UPDATE evidence_cases SET status = ?, approved_at = ?,
      updated_at = CURRENT_TIMESTAMP WHERE tenant_id = ? AND id = ?`).bind(
        caseStatus, decision === "Approve" ? now : "", actor.tenantId, caseId,
      ),
  ]);
  await audit(actor, caseId, decision === "Approve" ? "Evidence case approved" : "Evidence case returned", {
    submissionId, reviewId, status: caseStatus,
  });
  return Response.json({ ok: true, reviewId, caseId, submissionId, status: caseStatus });
}

export async function GET(request: Request) {
  try {
    const actor = await requireRequestActor(request);
    requireRole(actor, ["Executive", "Trainer", "Therapist", "Customer"]);
    await ensureSeedAssignment();
    const url = new URL(request.url);
    const requestedAccount = cleanText(url.searchParams.get("accountId"), 80, "บัญชีลูกค้า");
    const caseId = cleanText(url.searchParams.get("caseId"), 100, "กรณีศึกษา");
    const allowedAccounts = scopedAccounts(actor);
    if (["Therapist", "Customer"].includes(actor.role) && !allowedAccounts) {
      throw new InputError("บัญชีนี้ยังไม่ได้ผูกกับสถานประกอบการ กรุณาติดต่อผู้ดูแลระบบ", 403);
    }
    if (requestedAccount) assertAccountAccess(actor, requestedAccount);
    if (!requestedAccount && allowedAccounts?.length === 1) {
      url.searchParams.set("accountId", allowedAccounts[0]);
    } else if (!requestedAccount && allowedAccounts && allowedAccounts.length > 1) {
      throw new InputError("กรุณาระบุบัญชีลูกค้า");
    }
    const accountId = requestedAccount || url.searchParams.get("accountId") || "";
    const d1 = db();

    if (caseId) {
      const evidenceCase = await loadCase(actor.tenantId, caseId);
      assertAccountAccess(actor, String(evidenceCase.account_id));
      const [submissions, media, reviews, consents] = await Promise.all([
        d1.prepare(`SELECT * FROM evidence_submissions WHERE tenant_id = ? AND case_id = ?
          ORDER BY version DESC`).bind(actor.tenantId, caseId).all(),
        d1.prepare(`SELECT id, case_id, submission_id, media_type, capture_stage, file_name,
          mime_type, byte_size, upload_status, taken_at, created_at
          FROM evidence_media WHERE tenant_id = ? AND case_id = ? ORDER BY created_at`).bind(actor.tenantId, caseId).all(),
        d1.prepare(`SELECT id, submission_id, reviewer_email, reviewer_role, decision, comment, created_at
          FROM evidence_reviews WHERE tenant_id = ? AND case_id = ? ORDER BY created_at DESC`).bind(actor.tenantId, caseId).all(),
        d1.prepare(`SELECT id, consent_type, status, scope_json, consented_at, expires_at,
          withdrawn_at, evidence_document_id, created_at
          FROM consent_records WHERE tenant_id = ? AND case_id = ? ORDER BY created_at DESC`).bind(actor.tenantId, caseId).all(),
      ]);
      return Response.json({ case: evidenceCase, submissions: submissions.results, media: media.results, reviews: reviews.results, consents: consents.results });
    }

    const accountClause = accountId ? " AND account_id = ?" : "";
    const bindings = accountId ? [actor.tenantId, accountId] : [actor.tenantId];
    const [assignments, cases] = await Promise.all([
      d1.prepare(`SELECT * FROM evidence_assignments WHERE tenant_id = ?${accountClause}
        ORDER BY period_key DESC, due_at, created_at DESC`).bind(...bindings).all(),
      d1.prepare(`SELECT c.*,
        (SELECT COUNT(*) FROM evidence_media m WHERE m.tenant_id = c.tenant_id AND m.case_id = c.id) AS media_count,
        (SELECT COUNT(*) FROM evidence_submissions s WHERE s.tenant_id = c.tenant_id AND s.case_id = c.id) AS submission_count
        FROM evidence_cases c WHERE c.tenant_id = ?${accountClause}
        ORDER BY c.updated_at DESC`).bind(...bindings).all(),
    ]);
    return Response.json({ assignments: assignments.results, cases: cases.results });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireRequestActor(request);
    await ensureSeedAssignment();
    const payload = await request.json() as JsonRecord;
    const action = cleanText(payload.action, 40, "การดำเนินการ", true) as EvidenceAction;
    if (action === "create-assignment") return createAssignment(actor, payload);
    if (action === "save-case") return saveCase(actor, payload);
    if (action === "submit-case") return submitCase(actor, payload);
    if (action === "add-media") return addMedia(actor, payload);
    if (action === "record-consent") return recordConsent(actor, payload);
    if (action === "review-case") return reviewCase(actor, payload);
    throw new InputError("ไม่รองรับการดำเนินการที่ระบุ");
  } catch (error) {
    return errorResponse(error);
  }
}
