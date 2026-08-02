import { accessErrorResponse, AccessError, requireRequestActor, requireRole } from "@/lib/server-identity";
import { ensureFinanceStorage, financeDatabase } from "@/lib/finance-storage";

function satang(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) throw new Error("จำนวนเงินไม่ถูกต้อง");
  return Math.round(amount * 100);
}

function validAccount(actor: { accountScope: string }, accountId: string) {
  if (actor.accountScope !== "*" && actor.accountScope !== accountId) throw new AccessError("ไม่มีสิทธิ์ดูข้อมูลลูกค้ารายนี้", 403);
}

export async function GET(request: Request) {
  try {
    const actor = await requireRequestActor(request);
    requireRole(actor, ["Executive", "Finance"]);
    await ensureFinanceStorage();
    const accountId = new URL(request.url).searchParams.get("accountId")?.trim() || "linna";
    validAccount(actor, accountId);
    const d1 = financeDatabase();
    const [claims, items, reviews] = await Promise.all([
      d1.prepare(`SELECT * FROM partner_marketing_claims
        WHERE tenant_id = ? AND account_id = ? ORDER BY report_month DESC LIMIT 12`)
        .bind(actor.tenantId, accountId).all(),
      d1.prepare(`SELECT i.*, f.file_name AS source_file_name, f.file_hash AS source_file_hash,
        f.status AS source_document_status
        FROM partner_marketing_claim_items i
        LEFT JOIN finance_document_registry f ON f.id = i.source_document_id AND f.tenant_id = i.tenant_id
        WHERE i.tenant_id = ? AND i.claim_id IN (
          SELECT id FROM partner_marketing_claims WHERE tenant_id = ? AND account_id = ?
        ) ORDER BY i.service_period_start DESC, i.created_at DESC`)
        .bind(actor.tenantId, actor.tenantId, accountId).all(),
      d1.prepare(`SELECT r.* FROM partner_marketing_claim_reviews r
        WHERE r.tenant_id = ? AND r.claim_id IN (
          SELECT id FROM partner_marketing_claims WHERE tenant_id = ? AND account_id = ?
        ) ORDER BY r.created_at DESC LIMIT 30`)
        .bind(actor.tenantId, actor.tenantId, accountId).all(),
    ]);
    return Response.json({ claims: claims.results, items: items.results, reviews: reviews.results, user: { displayName: actor.displayName, role: actor.role } });
  } catch (error) {
    const access = accessErrorResponse(error);
    if (access) return access;
    return Response.json({ error: error instanceof Error ? error.message : "โหลดข้อมูลค่าโฆษณาไม่สำเร็จ" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireRequestActor(request);
    requireRole(actor, ["Executive", "Finance"]);
    await ensureFinanceStorage();
    const body = await request.json() as Record<string, unknown>;
    const action = String(body.action || "save").trim();
    const accountId = String(body.accountId || "linna").trim();
    validAccount(actor, accountId);
    const d1 = financeDatabase();

    if (["comment", "request_changes", "approve"].includes(action)) {
      const claimId = String(body.claimId || "").trim();
      const comment = String(body.comment || "").trim().slice(0, 1000);
      if (!claimId) return Response.json({ error: "ไม่พบรายการค่าโฆษณาที่ต้องการตรวจ" }, { status: 400 });
      const claim = await d1.prepare(`SELECT * FROM partner_marketing_claims
        WHERE tenant_id = ? AND account_id = ? AND id = ? LIMIT 1`)
        .bind(actor.tenantId, accountId, claimId).first<Record<string, unknown>>();
      if (!claim) return Response.json({ error: "ไม่พบรายการค่าโฆษณา" }, { status: 404 });
      if (["comment", "request_changes"].includes(action) && !comment) return Response.json({ error: "กรุณาระบุความเห็น" }, { status: 400 });

      let reviewStatus = String(claim.review_status || "รอตรวจสอบ");
      let eventType = "Marketing evidence comment added";
      let actionLabel = "แสดงความคิดเห็น";
      if (action === "request_changes") {
        reviewStatus = "ขอเอกสารเพิ่มเติม";
        eventType = "Marketing evidence changes requested";
        actionLabel = "ขอเอกสารเพิ่มเติม";
      }
      if (action === "approve") {
        const evidenceStatus = String(claim.evidence_status || "");
        const invoiceDocumentId = String(claim.invoice_document_id || "");
        const paymentDocumentId = String(claim.payment_document_id || "");
        if (evidenceStatus !== "ได้รับใบเสร็จและหลักฐานการชำระครบ" || !invoiceDocumentId || !paymentDocumentId) {
          return Response.json({ error: "อนุมัติไม่ได้จนกว่าจะมีใบเสร็จและหลักฐานการชำระครบ" }, { status: 400 });
        }
        reviewStatus = "อนุมัติแล้ว";
        eventType = "Marketing evidence approved";
        actionLabel = "อนุมัติค่าโฆษณา";
      }
      const reviewId = `marketing-review-${crypto.randomUUID()}`;
      await d1.batch([
        d1.prepare(`UPDATE partner_marketing_claims SET review_status = ?, review_note = ?, updated_at = CURRENT_TIMESTAMP
          WHERE tenant_id = ? AND account_id = ? AND id = ?`)
          .bind(reviewStatus, comment || String(claim.review_note || ""), actor.tenantId, accountId, claimId),
        d1.prepare(`INSERT INTO partner_marketing_claim_reviews
          (id, tenant_id, claim_id, action, comment, actor_email, actor_display_name, actor_role)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
          .bind(reviewId, actor.tenantId, claimId, actionLabel, comment, actor.email, actor.displayName, actor.role),
        d1.prepare(`INSERT INTO audit_events (tenant_id, document_id, actor_email, actor_role, event_type, event_data)
          VALUES (?, ?, ?, ?, ?, ?)`)
          .bind(actor.tenantId, claimId, actor.email, actor.role, eventType, JSON.stringify({ accountId, claimId, reviewStatus, comment, actorDisplayName: actor.displayName })),
      ]);
      return Response.json({ ok: true, claimId, reviewId, reviewStatus, action: actionLabel, actorDisplayName: actor.displayName });
    }

    const reportMonth = String(body.reportMonth || "").trim();
    const submitted = satang(body.submittedAmount);
    const eligible = satang(body.eligibleAmount);
    const cap = 5_000_000;
    const evidenceStatus = String(body.evidenceStatus || "ยังไม่ได้รับหลักฐาน").trim();
    const reviewNote = String(body.reviewNote || "").trim().slice(0, 500);
    const invoiceDocumentId = String(body.invoiceDocumentId || "").trim();
    const paymentDocumentId = String(body.paymentDocumentId || "").trim();
    if (!/^20\d{2}-(0[1-9]|1[0-2])$/.test(reportMonth)) return Response.json({ error: "กรุณาระบุรอบเดือน" }, { status: 400 });
    if (eligible > submitted) return Response.json({ error: "ยอดเสนอให้หักต้องไม่เกินยอดที่ LINNA แจ้ง" }, { status: 400 });
    if (eligible > cap) return Response.json({ error: "ยอดเสนอให้หักเกินเพดาน 50,000 บาทต่อเดือน" }, { status: 400 });
    if (evidenceStatus === "ได้รับใบเสร็จและหลักฐานการชำระครบ" && (!invoiceDocumentId || !paymentDocumentId)) {
      return Response.json({ error: "กรุณาแนบใบเสร็จและหลักฐานการชำระให้ครบ" }, { status: 400 });
    }
    const id = `${accountId}-marketing-${reportMonth}`;
    const excluded = Math.max(submitted - eligible, 0);
    const reviewStatus = submitted === 0 ? "ไม่มีรายการ" : "รอตรวจสอบ";
    await d1.batch([
      d1.prepare(`INSERT INTO partner_marketing_claims
        (id, tenant_id, account_id, report_month, submitted_amount_satang, eligible_amount_satang,
         excluded_amount_satang, monthly_cap_satang, invoice_document_id, payment_document_id,
         evidence_status, review_status, review_note, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(tenant_id, account_id, report_month) DO UPDATE SET
          submitted_amount_satang = excluded.submitted_amount_satang,
          eligible_amount_satang = excluded.eligible_amount_satang,
          excluded_amount_satang = excluded.excluded_amount_satang,
          invoice_document_id = CASE WHEN excluded.invoice_document_id <> '' THEN excluded.invoice_document_id ELSE partner_marketing_claims.invoice_document_id END,
          payment_document_id = CASE WHEN excluded.payment_document_id <> '' THEN excluded.payment_document_id ELSE partner_marketing_claims.payment_document_id END,
          evidence_status = excluded.evidence_status, review_status = excluded.review_status,
          review_note = excluded.review_note, updated_at = CURRENT_TIMESTAMP`)
        .bind(id, actor.tenantId, accountId, reportMonth, submitted, eligible, excluded, cap, invoiceDocumentId, paymentDocumentId, evidenceStatus, reviewStatus, reviewNote),
      d1.prepare(`INSERT INTO audit_events (tenant_id, document_id, actor_email, actor_role, event_type, event_data)
        VALUES (?, ?, ?, ?, 'Partner marketing claim submitted for review', ?)`)
        .bind(actor.tenantId, id, actor.email, actor.role, JSON.stringify({ accountId, reportMonth, submitted, eligible, excluded, cap, evidenceStatus, reviewStatus, actorDisplayName: actor.displayName })),
    ]);
    return Response.json({ ok: true, id, submitted, eligible, excluded, cap, evidenceStatus, reviewStatus });
  } catch (error) {
    const access = accessErrorResponse(error);
    if (access) return access;
    return Response.json({ error: error instanceof Error ? error.message : "บันทึกค่าโฆษณาไม่สำเร็จ" }, { status: 500 });
  }
}
