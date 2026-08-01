import { env } from "cloudflare:workers";
import { accessErrorResponse, type RequestActor, requireRequestActor, requireRole } from "@/lib/server-identity";

const allowedMimeTypes = new Set([
  "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif",
  "audio/mpeg", "audio/mp4", "audio/wav", "audio/webm", "audio/x-m4a", "application/pdf",
]);
const mediaTypes = new Set(["Before image", "After image", "Progress image", "Voice note", "Measurement document"]);
const captureStages = new Set(["Before", "After", "Progress", "Narrative", "Measurement"]);

class UploadError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

function database() {
  if (!env.DB) throw new Error("D1 binding DB is unavailable");
  return env.DB;
}

function filesBucket() {
  const files = (env as unknown as { FILES?: R2Bucket }).FILES;
  if (!files) throw new Error("R2 binding FILES is unavailable");
  return files;
}

function assertAccountAccess(actor: RequestActor, accountId: string) {
  if (actor.accountScope === "*") return;
  const allowed = actor.accountScope.split(",").map((item) => item.trim()).filter(Boolean);
  if (!allowed.includes(accountId)) throw new UploadError("ไม่มีสิทธิ์เข้าถึงบัญชีลูกค้านี้", 403);
}

function safeFileName(value: string) {
  const normalized = value.normalize("NFKD").replace(/[^A-Za-z0-9._-]+/g, "-").replace(/-+/g, "-");
  return normalized.slice(0, 140) || "evidence-file";
}

function hex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function errorResponse(error: unknown) {
  const access = accessErrorResponse(error);
  if (access) return access;
  if (error instanceof UploadError) return Response.json({ error: error.message }, { status: error.status });
  return Response.json({ error: error instanceof Error ? error.message : "ไม่สามารถจัดเก็บไฟล์ได้" }, { status: 500 });
}

export async function POST(request: Request) {
  try {
    const actor = await requireRequestActor(request);
    requireRole(actor, ["Executive", "Trainer", "Therapist", "Customer"]);
    const form = await request.formData();
    const caseId = String(form.get("caseId") || "").trim();
    const mediaType = String(form.get("mediaType") || "").trim();
    const captureStage = String(form.get("captureStage") || "").trim();
    const takenAt = String(form.get("takenAt") || "").trim().slice(0, 40);
    const file = form.get("file");
    if (!caseId) throw new UploadError("ไม่พบรหัสเคส");
    if (!mediaTypes.has(mediaType) || !captureStages.has(captureStage)) throw new UploadError("ประเภทไฟล์หรือช่วงเวลาที่บันทึกไม่ถูกต้อง");
    if (!(file instanceof File)) throw new UploadError("กรุณาเลือกไฟล์");
    if (!allowedMimeTypes.has(file.type.toLowerCase())) throw new UploadError("รองรับเฉพาะภาพ เสียง และเอกสาร PDF ที่กำหนด");
    if (file.size < 1 || file.size > 20 * 1024 * 1024) throw new UploadError("ไฟล์ต้องมีขนาดไม่เกิน 20 MB");

    const evidenceCase = await database().prepare(`SELECT id, account_id, status FROM evidence_cases
      WHERE tenant_id = ? AND id = ? LIMIT 1`).bind(actor.tenantId, caseId)
      .first<{ id: string; account_id: string; status: string }>();
    if (!evidenceCase) throw new UploadError("ไม่พบกรณีศึกษาที่ระบุ", 404);
    assertAccountAccess(actor, evidenceCase.account_id);
    if (!["Draft", "Changes requested"].includes(evidenceCase.status)) throw new UploadError("กรณีศึกษานี้ถูกส่งตรวจแล้วและเพิ่มไฟล์ไม่ได้", 409);

    const bytes = await file.arrayBuffer();
    const checksum = hex(await crypto.subtle.digest("SHA-256", bytes));
    const mediaId = `media-${crypto.randomUUID()}`;
    const fileName = safeFileName(file.name);
    const objectKey = `${actor.tenantId}/${evidenceCase.account_id}/${caseId}/${mediaId}/${fileName}`;
    await filesBucket().put(objectKey, bytes, {
      httpMetadata: { contentType: file.type },
      customMetadata: { tenantId: actor.tenantId, accountId: evidenceCase.account_id, caseId, mediaId, uploadedBy: actor.email, checksum },
    });
    await database().batch([
      database().prepare(`INSERT INTO evidence_media
        (id, tenant_id, account_id, case_id, media_type, capture_stage, object_key,
         file_name, mime_type, byte_size, checksum, upload_status, taken_at, uploaded_by_email)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Uploaded', ?, ?)`).bind(
          mediaId, actor.tenantId, evidenceCase.account_id, caseId, mediaType, captureStage,
          objectKey, file.name.slice(0, 220), file.type.toLowerCase(), file.size, checksum, takenAt, actor.email,
        ),
      database().prepare(`INSERT INTO audit_events
        (tenant_id, document_id, actor_email, actor_role, event_type, event_data)
        VALUES (?, ?, ?, ?, 'Evidence file uploaded', ?)`).bind(
          actor.tenantId, caseId, actor.email, actor.role,
          JSON.stringify({ mediaId, mediaType, captureStage, byteSize: file.size, checksum }),
        ),
    ]);
    return Response.json({ ok: true, id: mediaId, caseId, mediaType, captureStage, uploadStatus: "Uploaded", checksum }, { status: 201 });
  } catch (error) { return errorResponse(error); }
}

export async function GET(request: Request) {
  try {
    const actor = await requireRequestActor(request);
    requireRole(actor, ["Executive", "Trainer", "Therapist", "Customer"]);
    const mediaId = new URL(request.url).searchParams.get("id")?.trim() || "";
    if (!mediaId) throw new UploadError("กรุณาระบุไฟล์");
    const media = await database().prepare(`SELECT account_id, object_key, file_name, mime_type, upload_status
      FROM evidence_media WHERE tenant_id = ? AND id = ? LIMIT 1`).bind(actor.tenantId, mediaId)
      .first<{ account_id: string; object_key: string; file_name: string; mime_type: string; upload_status: string }>();
    if (!media || media.upload_status !== "Uploaded" || !media.object_key) throw new UploadError("ไม่พบไฟล์หรือไฟล์ยังไม่พร้อม", 404);
    assertAccountAccess(actor, media.account_id);
    const object = await filesBucket().get(media.object_key);
    if (!object) throw new UploadError("ไม่พบไฟล์ในพื้นที่จัดเก็บ", 404);
    return new Response(object.body, { headers: {
      "content-type": media.mime_type,
      "content-disposition": `inline; filename="${safeFileName(media.file_name)}"`,
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
    } });
  } catch (error) { return errorResponse(error); }
}
