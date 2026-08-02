import { accessErrorResponse, requireRequestActor, requireRole } from "@/lib/server-identity";
import { ensureFinanceStorage, financeDatabase } from "@/lib/finance-storage";

type ActualRow = {
  period_month: string;
  revenue_satang: number;
  cogs_satang: number;
  gross_profit_satang: number;
  opex_satang: number;
  net_profit_satang: number;
  entry_method: string;
  status: string;
  source_document_id: string;
  note: string;
};

function toSatang(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) throw new Error("จำนวนเงินไม่ถูกต้อง");
  if (amount < 0) throw new Error("กรุณากรอกจำนวนเงินเป็นศูนย์หรือมากกว่า");
  return Math.round(amount * 100);
}

function aggregate(rows: ActualRow[], period: string) {
  const groups = new Map<string, ActualRow & { months: number }>();
  for (const row of rows) {
    const [year, monthText] = row.period_month.split("-");
    const month = Number(monthText);
    const key = period === "yearly" ? year : period === "quarterly" ? `${year}-Q${Math.ceil(month / 3)}` : row.period_month;
    const current = groups.get(key) || { ...row, period_month: key, revenue_satang: 0, cogs_satang: 0, gross_profit_satang: 0, opex_satang: 0, net_profit_satang: 0, months: 0 };
    current.revenue_satang += Number(row.revenue_satang || 0);
    current.cogs_satang += Number(row.cogs_satang || 0);
    current.gross_profit_satang += Number(row.gross_profit_satang || 0);
    current.opex_satang += Number(row.opex_satang || 0);
    current.net_profit_satang += Number(row.net_profit_satang || 0);
    current.months += 1;
    groups.set(key, current);
  }
  return Array.from(groups.values()).sort((a, b) => a.period_month.localeCompare(b.period_month));
}

export async function GET(request: Request) {
  try {
    const actor = await requireRequestActor(request);
    requireRole(actor, ["Executive", "Finance"]);
    await ensureFinanceStorage();
    const url = new URL(request.url);
    const year = /^20\d{2}$/.test(url.searchParams.get("year") || "") ? String(url.searchParams.get("year")) : "2026";
    const period = ["monthly", "quarterly", "yearly"].includes(url.searchParams.get("period") || "") ? String(url.searchParams.get("period")) : "monthly";
    const d1 = financeDatabase();
    const [actuals, documents] = await Promise.all([
      d1.prepare(`SELECT period_month, revenue_satang, cogs_satang, gross_profit_satang, opex_satang,
        net_profit_satang, entry_method, status, source_document_id, note
        FROM finance_monthly_actuals WHERE tenant_id = ? AND business_unit = 'icoone Thailand'
        AND period_month LIKE ? ORDER BY period_month`).bind(actor.tenantId, `${year}-%`).all<ActualRow>(),
      d1.prepare(`SELECT id, document_type, period_start, period_end, file_name, object_key, source_sheet,
        file_hash, byte_size, status, review_note, created_by, created_at
        FROM finance_document_registry WHERE tenant_id = ? ORDER BY period_end DESC, created_at DESC LIMIT 30`)
        .bind(actor.tenantId).all(),
    ]);
    const rows = aggregate(actuals.results, period);
    const totals = rows.reduce((sum, row) => ({
      revenue_satang: sum.revenue_satang + Number(row.revenue_satang || 0),
      cogs_satang: sum.cogs_satang + Number(row.cogs_satang || 0),
      gross_profit_satang: sum.gross_profit_satang + Number(row.gross_profit_satang || 0),
      opex_satang: sum.opex_satang + Number(row.opex_satang || 0),
      net_profit_satang: sum.net_profit_satang + Number(row.net_profit_satang || 0),
    }), { revenue_satang: 0, cogs_satang: 0, gross_profit_satang: 0, opex_satang: 0, net_profit_satang: 0 });
    return Response.json({ actor: { role: actor.role }, period, year, rows, totals, documents: documents.results });
  } catch (error) {
    const access = accessErrorResponse(error);
    if (access) return access;
    return Response.json({ error: error instanceof Error ? error.message : "โหลดข้อมูลการเงินไม่สำเร็จ" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireRequestActor(request);
    requireRole(actor, ["Executive", "Finance"]);
    await ensureFinanceStorage();
    const body = await request.json() as Record<string, unknown>;
    const periodMonth = String(body.periodMonth || "").trim();
    if (!/^20\d{2}-(0[1-9]|1[0-2])$/.test(periodMonth)) return Response.json({ error: "กรุณาระบุเดือนในรูปแบบ YYYY-MM" }, { status: 400 });
    const revenue = toSatang(body.revenue);
    const cogs = toSatang(body.cogs);
    const opex = toSatang(body.opex);
    const gross = revenue - cogs;
    const net = gross - opex;
    const note = String(body.note || "").trim().slice(0, 500);
    const id = `icoone-actual-${periodMonth}`;
    const sourceId = `manual-${periodMonth}-${crypto.randomUUID()}`;
    const [periodYear, periodMonthNumber] = periodMonth.split("-").map(Number);
    const periodEnd = `${periodMonth}-${String(new Date(periodYear, periodMonthNumber, 0).getDate()).padStart(2, "0")}`;
    const d1 = financeDatabase();
    await d1.batch([
      d1.prepare(`INSERT INTO finance_document_registry
        (id, tenant_id, document_type, period_start, period_end, file_name, status, review_note, created_by)
        VALUES (?, ?, 'บันทึกด้วยตนเอง', ?, ?, 'Manual entry', 'รอตรวจสอบ', ?, ?)`)
        .bind(sourceId, actor.tenantId, `${periodMonth}-01`, periodEnd, note || "บันทึกยอดสรุปด้วยตนเอง", actor.email),
      d1.prepare(`INSERT INTO finance_monthly_actuals
        (id, tenant_id, business_unit, period_month, revenue_satang, cogs_satang, gross_profit_satang,
         opex_satang, net_profit_satang, source_document_id, entry_method, status, note, created_by, updated_at)
        VALUES (?, ?, 'icoone Thailand', ?, ?, ?, ?, ?, ?, ?, 'Manual', 'กรอกเอง · รอตรวจ', ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(tenant_id, business_unit, period_month) DO UPDATE SET
          revenue_satang = excluded.revenue_satang, cogs_satang = excluded.cogs_satang,
          gross_profit_satang = excluded.gross_profit_satang, opex_satang = excluded.opex_satang,
          net_profit_satang = excluded.net_profit_satang, source_document_id = excluded.source_document_id,
          entry_method = 'Manual', status = 'กรอกเอง · รอตรวจ', note = excluded.note,
          created_by = excluded.created_by, updated_at = CURRENT_TIMESTAMP`)
        .bind(id, actor.tenantId, periodMonth, revenue, cogs, gross, opex, net, sourceId, note, actor.email),
      d1.prepare(`INSERT INTO audit_events (tenant_id, document_id, actor_email, actor_role, event_type, event_data)
        VALUES (?, ?, ?, ?, 'Finance actual entered manually', ?)`)
        .bind(actor.tenantId, sourceId, actor.email, actor.role, JSON.stringify({ periodMonth, revenue, cogs, opex, gross, net })),
    ]);
    return Response.json({ ok: true, id, sourceId, status: "กรอกเอง · รอตรวจ" });
  } catch (error) {
    const access = accessErrorResponse(error);
    if (access) return access;
    return Response.json({ error: error instanceof Error ? error.message : "บันทึกข้อมูลการเงินไม่สำเร็จ" }, { status: 500 });
  }
}
