import { env } from "cloudflare:workers";
import { accessErrorResponse, requireRequestActor } from "@/lib/server-identity";
import { ensureFinanceStorage } from "@/lib/finance-storage";

function db() {
  if (!env.DB) throw new Error("D1 binding DB is unavailable");
  return env.DB;
}

export async function GET(request: Request) {
  try {
    const actor = await requireRequestActor(request);
    await ensureFinanceStorage();
    const accountId = actor.accountScope === "*" ? "linna" : actor.accountScope;
    const d1 = db();

    const [account, performance, marketing, deployment, warranty, training, service, orders, reports] = await Promise.all([
      d1.prepare(`SELECT id, legal_name, display_name, business_segment, commercial_model, account_status
        FROM client_accounts WHERE tenant_id = ? AND id = ? LIMIT 1`).bind(actor.tenantId, accountId).first(),
      d1.prepare(`SELECT report_month, reported_paid_sessions, eligible_paid_sessions,
        complimentary_sessions, training_sessions, reported_gross_revenue, eligible_gross_revenue,
        bib_share_vat_inclusive, linna_share, deductible_marketing, approved_refunds,
        total_usage_minutes, exception_count, status, source_note
        FROM partner_performance_snapshots WHERE tenant_id = ? AND account_id = ?
        ORDER BY report_month DESC LIMIT 1`).bind(actor.tenantId, accountId).first(),
      d1.prepare(`SELECT report_month, submitted_amount_satang, eligible_amount_satang,
        excluded_amount_satang, monthly_cap_satang, evidence_status, review_status, review_note
        FROM partner_marketing_claims WHERE tenant_id = ? AND account_id = ?
        ORDER BY report_month DESC LIMIT 1`).bind(actor.tenantId, accountId).first(),
      d1.prepare(`SELECT model, serial_number, installed_at, cumulative_hours, status
        FROM device_deployments WHERE tenant_id = ? AND account_id = ? LIMIT 1`).bind(actor.tenantId, accountId).first(),
      d1.prepare(`SELECT w.starts_at, w.ends_at, w.status, w.document_version_id
        FROM warranties w JOIN device_deployments d ON d.id = w.deployment_id AND d.tenant_id = w.tenant_id
        WHERE w.tenant_id = ? AND d.account_id = ? ORDER BY w.ends_at DESC LIMIT 1`).bind(actor.tenantId, accountId).first(),
      d1.prepare(`SELECT COUNT(*) AS total,
        SUM(CASE WHEN competency_status = 'Complete' THEN 1 ELSE 0 END) AS completed
        FROM training_records WHERE tenant_id = ? AND account_id = ?`).bind(actor.tenantId, accountId).first(),
      d1.prepare(`SELECT COUNT(*) AS total FROM service_events s
        JOIN device_deployments d ON d.id = s.deployment_id AND d.tenant_id = s.tenant_id
        WHERE s.tenant_id = ? AND d.account_id = ? AND s.status NOT IN ('Closed', 'Completed')`).bind(actor.tenantId, accountId).first(),
      d1.prepare(`SELECT COUNT(*) AS total FROM customer_orders
        WHERE tenant_id = ? AND account_id = ?`).bind(actor.tenantId, accountId).first(),
      d1.prepare(`SELECT report_month, status, created_at FROM partner_monthly_reports
        WHERE tenant_id = ? AND account_id = ? ORDER BY created_at DESC LIMIT 5`).bind(actor.tenantId, accountId).all(),
    ]);

    return Response.json({
      account,
      performance,
      marketing,
      deployment,
      warranty,
      training,
      service,
      orders,
      reports: reports.results,
      sources: {
        legal: { status: "verified", label: "ยืนยันจากหนังสือรับรองนิติบุคคล", document: "/documents/linna-company-certificate.pdf" },
        performance: performance ? { status: "imported_needs_review", label: "นำเข้าจากรายงาน LINNA และรอตรวจสอบ" } : null,
        operational: { status: "database", label: "แสดงเฉพาะรายการที่บันทึกในฐานระบบ" },
      },
    });
  } catch (error) {
    const accessResponse = accessErrorResponse(error);
    if (accessResponse) return accessResponse;
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load client dashboard" }, { status: 500 });
  }
}
