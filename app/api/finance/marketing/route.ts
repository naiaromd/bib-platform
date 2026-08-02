import { accessErrorResponse, requireRequestActor, requireRole } from "@/lib/server-identity";
import { ensureFinanceStorage, financeDatabase } from "@/lib/finance-storage";

function satang(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) throw new Error("จำนวนเงินไม่ถูกต้อง");
  return Math.round(amount * 100);
}

export async function POST(request: Request) {
  try {
    const actor = await requireRequestActor(request);
    requireRole(actor, ["Executive", "Finance"]);
    await ensureFinanceStorage();
    const body = await request.json() as Record<string, unknown>;
    const accountId = String(body.accountId || "linna").trim();
    const reportMonth = String(body.reportMonth || "").trim();
    const submitted = satang(body.submittedAmount);
    const eligible = satang(body.eligibleAmount);
    const cap = 5_000_000;
    const evidenceStatus = String(body.evidenceStatus || "ยังไม่ได้รับหลักฐาน").trim();
    const reviewNote = String(body.reviewNote || "").trim().slice(0, 500);
    if (!/^20\d{2}-(0[1-9]|1[0-2])$/.test(reportMonth)) return Response.json({ error: "กรุณาระบุรอบเดือน" }, { status: 400 });
    if (eligible > submitted) return Response.json({ error: "ยอดที่หักได้ต้องไม่เกินยอดที่ยื่น" }, { status: 400 });
    if (eligible > cap) return Response.json({ error: "ยอดที่หักได้เกินเพดาน 50,000 บาทต่อเดือน" }, { status: 400 });
    if (eligible > 0 && evidenceStatus !== "ได้รับหลักฐานครบ") return Response.json({ error: "ต้องได้รับใบเสร็จและหลักฐานการชำระครบก่อนอนุมัติยอดหัก" }, { status: 400 });
    const id = `${accountId}-marketing-${reportMonth}`;
    const excluded = Math.max(submitted - eligible, 0);
    const reviewStatus = submitted === 0 ? "ไม่มีรายการให้หัก" : eligible > 0 ? "ตรวจแล้ว" : "รอหลักฐานหรือไม่ผ่านเกณฑ์";
    const d1 = financeDatabase();
    await d1.batch([
      d1.prepare(`INSERT INTO partner_marketing_claims
        (id, tenant_id, account_id, report_month, submitted_amount_satang, eligible_amount_satang,
         excluded_amount_satang, monthly_cap_satang, evidence_status, review_status, review_note, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(tenant_id, account_id, report_month) DO UPDATE SET
          submitted_amount_satang = excluded.submitted_amount_satang,
          eligible_amount_satang = excluded.eligible_amount_satang,
          excluded_amount_satang = excluded.excluded_amount_satang,
          evidence_status = excluded.evidence_status, review_status = excluded.review_status,
          review_note = excluded.review_note, updated_at = CURRENT_TIMESTAMP`)
        .bind(id, actor.tenantId, accountId, reportMonth, submitted, eligible, excluded, cap, evidenceStatus, reviewStatus, reviewNote),
      d1.prepare(`INSERT INTO audit_events (tenant_id, document_id, actor_email, actor_role, event_type, event_data)
        VALUES (?, ?, ?, ?, 'Partner marketing claim reviewed', ?)`)
        .bind(actor.tenantId, id, actor.email, actor.role, JSON.stringify({ accountId, reportMonth, submitted, eligible, excluded, cap, evidenceStatus, reviewStatus })),
    ]);
    return Response.json({ ok: true, id, submitted, eligible, excluded, cap, evidenceStatus, reviewStatus });
  } catch (error) {
    const access = accessErrorResponse(error);
    if (access) return access;
    return Response.json({ error: error instanceof Error ? error.message : "บันทึกค่าโฆษณาไม่สำเร็จ" }, { status: 500 });
  }
}
