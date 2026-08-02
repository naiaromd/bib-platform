import { env } from "cloudflare:workers";
import { accessErrorResponse, requireRequestActor, requireRole } from "@/lib/server-identity";
import { ensureFinanceStorage, financeDatabase } from "@/lib/finance-storage";

const allowed = new Set([
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel", "text/csv", "application/pdf",
]);

function filesBucket() { const files = (env as unknown as { FILES?: R2Bucket }).FILES; if (!files) throw new Error("R2 binding FILES is unavailable"); return files; }
function safeFileName(value: string) { return value.normalize("NFKD").replace(/[^A-Za-z0-9._-]+/g, "-").replace(/-+/g, "-").slice(0, 140) || "finance-file"; }
function hex(buffer: ArrayBuffer) { return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join(""); }

export async function POST(request: Request) {
  try {
    const actor = await requireRequestActor(request);
    requireRole(actor, ["Executive", "Finance"]);
    await ensureFinanceStorage();
    const form = await request.formData();
    const file = form.get("file");
    const documentType = String(form.get("documentType") || "งบการเงิน").trim().slice(0, 80);
    const periodStart = String(form.get("periodStart") || "").trim();
    const periodEnd = String(form.get("periodEnd") || "").trim();
    if (!(file instanceof File)) return Response.json({ error: "กรุณาเลือกไฟล์" }, { status: 400 });
    if (!allowed.has(file.type.toLowerCase())) return Response.json({ error: "รองรับไฟล์ Excel, CSV และ PDF" }, { status: 400 });
    if (!/^20\d{2}-\d{2}-\d{2}$/.test(periodStart) || !/^20\d{2}-\d{2}-\d{2}$/.test(periodEnd)) return Response.json({ error: "กรุณาระบุช่วงเวลาของเอกสาร" }, { status: 400 });
    if (file.size < 1 || file.size > 20 * 1024 * 1024) return Response.json({ error: "ไฟล์ต้องมีขนาดไม่เกิน 20 MB" }, { status: 400 });
    const bytes = await file.arrayBuffer();
    const checksum = hex(await crypto.subtle.digest("SHA-256", bytes));
    const id = `finance-file-${crypto.randomUUID()}`;
    const objectKey = `${actor.tenantId}/finance/${periodStart.slice(0, 4)}/${id}/${safeFileName(file.name)}`;
    await filesBucket().put(objectKey, bytes, { httpMetadata: { contentType: file.type }, customMetadata: { tenantId: actor.tenantId, uploadedBy: actor.email, checksum, periodStart, periodEnd } });
    await financeDatabase().batch([
      financeDatabase().prepare(`INSERT INTO finance_document_registry
        (id, tenant_id, document_type, period_start, period_end, file_name, object_key, file_hash, byte_size, status, review_note, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'อัปโหลดแล้ว · รอตรวจ', 'ยังไม่ได้นำตัวเลขเข้าระบบ', ?)`)
        .bind(id, actor.tenantId, documentType, periodStart, periodEnd, file.name.slice(0, 220), objectKey, checksum, file.size, actor.email),
      financeDatabase().prepare(`INSERT INTO audit_events (tenant_id, document_id, actor_email, actor_role, event_type, event_data)
        VALUES (?, ?, ?, ?, 'Finance document uploaded', ?)`)
        .bind(actor.tenantId, id, actor.email, actor.role, JSON.stringify({ fileName: file.name, byteSize: file.size, checksum, periodStart, periodEnd })),
    ]);
    return Response.json({ ok: true, id, checksum, status: "อัปโหลดแล้ว · รอตรวจ" }, { status: 201 });
  } catch (error) {
    const access = accessErrorResponse(error);
    if (access) return access;
    return Response.json({ error: error instanceof Error ? error.message : "อัปโหลดไฟล์ไม่สำเร็จ" }, { status: 500 });
  }
}
