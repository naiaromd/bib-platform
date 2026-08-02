import { env } from "cloudflare:workers";
import { accessErrorResponse, type AppRole, requireRequestActor } from "@/lib/server-identity";

type DocumentId = "linna" | "drj" | "memo";

const documents = [
  ["linna", "LINNA Clinic", "Long-Term Revenue Share Agreement", "D2 · 40/60 · No MG", "v3.2", "Finance review", "Deposit waiver", "Nalin · Sales", 1, "Pending", "sha256:linna-v3.2"],
  ["drj", "Dr.J Clinic", "Rent-to-Own Agreement", "B · 24 months", "v1.4", "Open items", "KYC required", "Mook · Sales", 1, "Blocked", "sha256:drj-v1.4"],
  ["memo", "BIB Internal", "Commission Policy Memo", "Model A–D2", "v2.0", "Executive approval", "Policy change", "Sunai · Policy owner", 0, "Pending", "sha256:6661add482e1ec0dad92b3013b5d127b7bddac226f22cdabf3f545a6a05a81d6"],
] as const;

const actionRoles: Record<DocumentId, Record<string, AppRole[]>> = {
  linna: {
    "Changes requested": ["Executive", "Approver", "Finance", "Legal", "Sales", "Customer"],
    Conditional: ["Executive", "Finance", "Legal"],
    Approved: ["Executive", "Approver", "Finance", "Legal"],
    "Ready for E‑Signature": ["Customer"],
  },
  drj: {
    "Changes requested": ["Executive", "Finance", "Legal", "Sales", "Customer"],
    Conditional: ["Legal"],
    Approved: ["Legal"],
    "Ready for E‑Signature": ["Customer"],
  },
  memo: {
    "Changes requested": ["Executive", "Approver", "Finance", "Legal", "Sales"],
    Conditional: ["Executive", "Finance"],
    Approved: ["Executive", "Approver", "Finance"],
  },
};

function db() {
  if (!env.DB) throw new Error("D1 binding DB is unavailable");
  return env.DB;
}

async function initialize() {
  const d1 = db();
  await d1.batch([
    d1.prepare(`CREATE TABLE IF NOT EXISTS review_documents (
      id TEXT PRIMARY KEY, account TEXT NOT NULL, title TEXT NOT NULL, model TEXT NOT NULL,
      version TEXT NOT NULL, stage TEXT NOT NULL, risk TEXT NOT NULL, owner TEXT NOT NULL,
      customer_visible INTEGER NOT NULL DEFAULT 0, decision TEXT NOT NULL DEFAULT 'Pending',
      version_hash TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS review_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT, document_id TEXT NOT NULL, author_email TEXT NOT NULL,
      author_label TEXT NOT NULL, role TEXT NOT NULL, body TEXT NOT NULL, visibility TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS review_decisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT, document_id TEXT NOT NULL, version TEXT NOT NULL,
      actor_email TEXT NOT NULL, actor_role TEXT NOT NULL, decision TEXT NOT NULL,
      condition_text TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS approval_records (
      id TEXT PRIMARY KEY, document_id TEXT NOT NULL, document_version TEXT NOT NULL,
      version_hash TEXT NOT NULL, actor_email TEXT NOT NULL, actor_display_name TEXT NOT NULL DEFAULT '', actor_role TEXT NOT NULL,
      decision TEXT NOT NULL, approval_scope TEXT NOT NULL DEFAULT 'Internal workflow',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS audit_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT, document_id TEXT NOT NULL, actor_email TEXT NOT NULL,
      actor_role TEXT NOT NULL, event_type TEXT NOT NULL, event_data TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS partner_monthly_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT, account_id TEXT NOT NULL, report_month TEXT NOT NULL,
      paid_sessions INTEGER NOT NULL DEFAULT 0, package_sessions INTEGER NOT NULL DEFAULT 0,
      complimentary_sessions INTEGER NOT NULL DEFAULT 0, gross_revenue REAL NOT NULL DEFAULT 0,
      approved_refunds REAL NOT NULL DEFAULT 0, approved_marketing REAL NOT NULL DEFAULT 0,
      opening_hours REAL NOT NULL DEFAULT 0, closing_hours REAL NOT NULL DEFAULT 0,
      consumable_note TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'Submitted',
      submitted_by TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS client_accounts (
      id TEXT PRIMARY KEY, legal_name TEXT NOT NULL, display_name TEXT NOT NULL,
      business_segment TEXT NOT NULL, commercial_model TEXT NOT NULL,
      account_status TEXT NOT NULL DEFAULT 'Active', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS client_contacts (
      id TEXT PRIMARY KEY, account_id TEXT NOT NULL, email TEXT NOT NULL,
      display_name TEXT NOT NULL, buying_role TEXT NOT NULL, portal_role TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS device_deployments (
      id TEXT PRIMARY KEY, account_id TEXT NOT NULL, model TEXT NOT NULL,
      serial_number TEXT NOT NULL DEFAULT '', installed_at TEXT NOT NULL DEFAULT '',
      cumulative_hours REAL NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'Pending delivery')`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS warranties (
      id TEXT PRIMARY KEY, deployment_id TEXT NOT NULL, starts_at TEXT NOT NULL,
      ends_at TEXT NOT NULL, status TEXT NOT NULL, document_version_id TEXT NOT NULL)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS training_records (
      id TEXT PRIMARY KEY, account_id TEXT NOT NULL, contact_id TEXT NOT NULL,
      course_code TEXT NOT NULL, completed_at TEXT NOT NULL DEFAULT '',
      competency_status TEXT NOT NULL DEFAULT 'Scheduled',
      certificate_document_id TEXT NOT NULL DEFAULT '')`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS service_events (
      id TEXT PRIMARY KEY, deployment_id TEXT NOT NULL, event_type TEXT NOT NULL,
      status TEXT NOT NULL, scheduled_at TEXT NOT NULL DEFAULT '',
      completed_at TEXT NOT NULL DEFAULT '', summary TEXT NOT NULL DEFAULT '')`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS customer_orders (
      id TEXT PRIMARY KEY, account_id TEXT NOT NULL, order_type TEXT NOT NULL,
      status TEXT NOT NULL, total_amount REAL NOT NULL DEFAULT 0,
      quotation_document_id TEXT NOT NULL DEFAULT '',
      ordered_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS knowledge_entitlements (
      id TEXT PRIMARY KEY, account_id TEXT NOT NULL, commercial_model TEXT NOT NULL,
      resource_code TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS treatment_menus (
      id TEXT PRIMARY KEY, account_id TEXT NOT NULL, service_name TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL, price REAL NOT NULL,
      customer_description TEXT NOT NULL DEFAULT '', protocol_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Draft', version INTEGER NOT NULL DEFAULT 1)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS protocol_records (
      id TEXT PRIMARY KEY, account_id TEXT NOT NULL, approved_protocol_code TEXT NOT NULL,
      preparation_text TEXT NOT NULL DEFAULT '', follow_up_text TEXT NOT NULL DEFAULT '',
      internal_note TEXT NOT NULL DEFAULT '', locked_clinical_data TEXT NOT NULL DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'Draft', version INTEGER NOT NULL DEFAULT 1)`),
  ]);
  const approvalColumns = await d1.prepare("PRAGMA table_info(approval_records)").all<{ name: string }>();
  if (!approvalColumns.results.some((column) => column.name === "actor_display_name")) {
    try {
      await d1.prepare("ALTER TABLE approval_records ADD COLUMN actor_display_name TEXT NOT NULL DEFAULT ''").run();
    } catch (error) {
      if (!String(error).toLowerCase().includes("duplicate column")) throw error;
    }
  }
  for (const row of documents) {
    await d1.prepare(`INSERT OR IGNORE INTO review_documents
      (id, account, title, model, version, stage, risk, owner, customer_visible, decision, version_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(...row).run();
  }
  await d1.prepare(`UPDATE review_documents SET version = 'v2.0', stage = 'Executive approval',
    risk = 'Policy change', version_hash = 'sha256:6661add482e1ec0dad92b3013b5d127b7bddac226f22cdabf3f545a6a05a81d6',
    updated_at = CURRENT_TIMESTAMP WHERE id = 'memo' AND version <> 'v2.0'`).run();
  // Comments and decisions must come from an authenticated user action.
  // Do not seed example review activity into a live tenant.
}

export async function GET(request: Request) {
  try {
    await initialize();
    const currentActor = await requireRequestActor(request);
    const d1 = db();
    const customerScope = currentActor.role === "Customer" ? currentActor.accountScope : "*";
    const docs = await d1.prepare(`SELECT * FROM review_documents WHERE tenant_id = ?
      AND (? = '*' OR (id = ? AND customer_visible = 1)) ORDER BY id`)
      .bind(currentActor.tenantId, customerScope, customerScope).all();
    const comments = await d1.prepare(`SELECT * FROM review_comments WHERE tenant_id = ?
      AND (? = '*' OR (document_id = ? AND visibility = 'Customer-visible')) ORDER BY id`)
      .bind(currentActor.tenantId, customerScope, customerScope).all();
    const audits = currentActor.role === "Customer" ? { results: [] } : await d1.prepare("SELECT * FROM audit_events WHERE tenant_id = ? ORDER BY id DESC LIMIT 100").bind(currentActor.tenantId).all();
    const approvals = currentActor.role === "Customer" ? { results: [] } : await d1.prepare("SELECT * FROM approval_records WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 100").bind(currentActor.tenantId).all();
    return Response.json({ actor: currentActor, documents: docs.results, comments: comments.results, approvals: approvals.results, audits: audits.results });
  } catch (error) {
    const accessResponse = accessErrorResponse(error);
    if (accessResponse) return accessResponse;
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load reviews" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initialize();
    const payload = await request.json() as {
      type?: "comment" | "decision" | "monthly_report";
      documentId?: DocumentId;
      body?: string;
      visibility?: "Internal" | "Customer-visible";
      decision?: string;
      version?: string;
      reportMonth?: string;
      paidSessions?: string;
      packageSessions?: string;
      complimentarySessions?: string;
      grossRevenue?: string;
      approvedRefunds?: string;
      approvedMarketing?: string;
      openingHours?: string;
      closingHours?: string;
      consumableNote?: string;
    };
    if (!payload.documentId || !["linna", "drj", "memo"].includes(payload.documentId)) {
      return Response.json({ error: "Valid documentId is required" }, { status: 400 });
    }
    const currentActor = await requireRequestActor(request);
    if (currentActor.role === "Customer" && (currentActor.accountScope !== payload.documentId || payload.documentId === "memo")) {
      return Response.json({ error: "ไม่มีสิทธิ์เข้าถึงเอกสารนี้" }, { status: 403 });
    }
    const d1 = db();
    if (payload.type === "monthly_report") {
      if (currentActor.role !== "Customer" || payload.documentId !== "linna") {
        return Response.json({ error: "ไม่มีสิทธิ์ส่งรายงานสำหรับบัญชีนี้" }, { status: 403 });
      }
      if (!payload.reportMonth) {
        return Response.json({ error: "กรุณาระบุเดือนที่รายงาน" }, { status: 400 });
      }
      const values = [
        Number(payload.paidSessions || 0), Number(payload.packageSessions || 0),
        Number(payload.complimentarySessions || 0), Number(payload.grossRevenue || 0),
        Number(payload.approvedRefunds || 0), Number(payload.approvedMarketing || 0),
        Number(payload.openingHours || 0), Number(payload.closingHours || 0),
      ];
      if (values.some((value) => !Number.isFinite(value) || value < 0) || values[7] < values[6]) {
        return Response.json({ error: "กรุณาตรวจสอบตัวเลขรายได้และชั่วโมงเครื่อง" }, { status: 400 });
      }
      const info = await d1.prepare(`INSERT INTO partner_monthly_reports
        (account_id, report_month, paid_sessions, package_sessions, complimentary_sessions,
         gross_revenue, approved_refunds, approved_marketing, opening_hours, closing_hours,
         consumable_note, submitted_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
          currentActor.accountScope, payload.reportMonth, ...values, payload.consumableNote || "", currentActor.email
        ).run();
      await d1.prepare(`INSERT INTO audit_events
        (document_id, actor_email, actor_role, event_type, event_data)
        VALUES (?, ?, ?, ?, ?)`).bind(
          "linna", currentActor.email, currentActor.role, "MONTHLY_REPORT_SUBMITTED",
          JSON.stringify({ reportMonth: payload.reportMonth, reportId: info.meta.last_row_id })
        ).run();
      return Response.json({ ok: true, id: info.meta.last_row_id }, { status: 201 });
    }
    if (payload.type === "comment") {
      const body = payload.body?.trim();
      if (!body) return Response.json({ error: "Comment is required" }, { status: 400 });
      const visibility = currentActor.role === "Customer" ? "Customer-visible" : (payload.visibility || "Internal");
      const authorLabel = `${currentActor.displayName} · ${currentActor.role === "Customer" ? "ผู้ตรวจทาน" : "ผู้อนุมัติ"}`;
      const info = await d1.prepare(`INSERT INTO review_comments
        (document_id, author_email, author_label, role, body, visibility)
        VALUES (?, ?, ?, ?, ?, ?)`).bind(payload.documentId, currentActor.email, authorLabel, currentActor.role, body, visibility).run();
      await d1.prepare(`INSERT INTO audit_events
        (document_id, actor_email, actor_role, event_type, event_data)
        VALUES (?, ?, ?, ?, ?)`).bind(payload.documentId, currentActor.email, currentActor.role, "COMMENT_CREATED", JSON.stringify({ visibility })).run();
      return Response.json({ ok: true, id: info.meta.last_row_id }, { status: 201 });
    }
    if (payload.type === "decision") {
      const decision = payload.decision || "";
      const allowed = actionRoles[payload.documentId][decision] || [];
      if (!allowed.includes(currentActor.role)) {
        return Response.json({ error: `${currentActor.role} is not authorized for ${decision}` }, { status: 403 });
      }
      if (payload.documentId === "drj" && ["Executive", "Finance"].includes(currentActor.role) && decision !== "Changes requested") {
        return Response.json({ error: "Dr.J is blocked until KYC and site documents are complete" }, { status: 409 });
      }
      const version = payload.version || "unknown";
      const currentDocument = await d1.prepare("SELECT version, version_hash FROM review_documents WHERE id = ?").bind(payload.documentId).first<{ version: string; version_hash: string }>();
      if (!currentDocument || version.replace("ฉบับที่ ", "v") !== currentDocument.version) {
        return Response.json({ error: "ฉบับเอกสารบนหน้าจอไม่ตรงกับฉบับปัจจุบัน กรุณาโหลดใหม่" }, { status: 409 });
      }
      const approvalId = crypto.randomUUID();
      await d1.batch([
        d1.prepare(`INSERT INTO review_decisions
          (document_id, version, actor_email, actor_role, decision)
          VALUES (?, ?, ?, ?, ?)`).bind(payload.documentId, version, currentActor.email, currentActor.role, decision),
        d1.prepare(`INSERT INTO approval_records
          (id, document_id, document_version, version_hash, actor_email, actor_display_name, actor_role, decision)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).bind(approvalId, payload.documentId, currentDocument.version, currentDocument.version_hash, currentActor.email, currentActor.displayName, currentActor.role, decision),
        d1.prepare("UPDATE review_documents SET decision = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(decision, payload.documentId),
        d1.prepare(`INSERT INTO audit_events
          (document_id, actor_email, actor_role, event_type, event_data)
          VALUES (?, ?, ?, ?, ?)`).bind(payload.documentId, currentActor.email, currentActor.role, "DECISION_RECORDED", JSON.stringify({ decision, version, actorDisplayName: currentActor.displayName })),
      ]);
      return Response.json({ ok: true, decision, approvalId, versionHash: currentDocument.version_hash, actorDisplayName: currentActor.displayName, actorRole: currentActor.role, createdAt: new Date().toISOString(), scope: "Internal workflow" });
    }
    return Response.json({ error: "Unsupported action" }, { status: 400 });
  } catch (error) {
    const accessResponse = accessErrorResponse(error);
    if (accessResponse) return accessResponse;
    return Response.json({ error: error instanceof Error ? error.message : "Unable to save review" }, { status: 500 });
  }
}
