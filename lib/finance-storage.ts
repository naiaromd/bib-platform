import { env } from "cloudflare:workers";

export function financeDatabase() {
  if (!env.DB) throw new Error("D1 binding DB is unavailable");
  return env.DB;
}

let ready: Promise<void> | null = null;

export async function ensureFinanceStorage() {
  if (ready) return ready;
  ready = (async () => {
    const d1 = financeDatabase();
    await d1.batch([
      d1.prepare(`CREATE TABLE IF NOT EXISTS finance_document_registry (
        id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL DEFAULT 'bib', document_type TEXT NOT NULL,
        period_start TEXT NOT NULL, period_end TEXT NOT NULL, file_name TEXT NOT NULL,
        object_key TEXT NOT NULL DEFAULT '', source_sheet TEXT NOT NULL DEFAULT '', file_hash TEXT NOT NULL DEFAULT '',
        byte_size INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'รอตรวจสอบ',
        review_note TEXT NOT NULL DEFAULT '', created_by TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
      d1.prepare(`CREATE INDEX IF NOT EXISTS finance_document_period_idx
        ON finance_document_registry (tenant_id, period_start, period_end)`),
      d1.prepare(`CREATE TABLE IF NOT EXISTS finance_monthly_actuals (
        id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL DEFAULT 'bib', business_unit TEXT NOT NULL DEFAULT 'icoone Thailand',
        period_month TEXT NOT NULL, revenue_satang INTEGER NOT NULL DEFAULT 0, cogs_satang INTEGER NOT NULL DEFAULT 0,
        gross_profit_satang INTEGER NOT NULL DEFAULT 0, opex_satang INTEGER NOT NULL DEFAULT 0,
        net_profit_satang INTEGER NOT NULL DEFAULT 0, source_document_id TEXT NOT NULL,
        entry_method TEXT NOT NULL DEFAULT 'Imported', status TEXT NOT NULL DEFAULT 'นำเข้าแล้ว · รอตรวจ',
        note TEXT NOT NULL DEFAULT '', created_by TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
      d1.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS finance_monthly_actual_period_idx
        ON finance_monthly_actuals (tenant_id, business_unit, period_month)`),
      d1.prepare(`CREATE TABLE IF NOT EXISTS partner_marketing_claims (
        id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL DEFAULT 'bib', account_id TEXT NOT NULL, report_month TEXT NOT NULL,
        submitted_amount_satang INTEGER NOT NULL DEFAULT 0, eligible_amount_satang INTEGER NOT NULL DEFAULT 0,
        excluded_amount_satang INTEGER NOT NULL DEFAULT 0, monthly_cap_satang INTEGER NOT NULL DEFAULT 5000000,
        invoice_document_id TEXT NOT NULL DEFAULT '', payment_document_id TEXT NOT NULL DEFAULT '',
        evidence_status TEXT NOT NULL DEFAULT 'ยังไม่ได้รับหลักฐาน', review_status TEXT NOT NULL DEFAULT 'รอตรวจ',
        review_note TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
      d1.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS partner_marketing_claim_period_idx
        ON partner_marketing_claims (tenant_id, account_id, report_month)`),
      d1.prepare(`CREATE TABLE IF NOT EXISTS partner_marketing_claim_items (
        id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL DEFAULT 'bib', claim_id TEXT NOT NULL,
        channel TEXT NOT NULL, service_period_start TEXT NOT NULL DEFAULT '', service_period_end TEXT NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '', submitted_amount_satang INTEGER NOT NULL DEFAULT 0,
        source_document_id TEXT NOT NULL DEFAULT '', evidence_status TEXT NOT NULL DEFAULT 'รอเอกสารประกอบ',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
      d1.prepare(`CREATE INDEX IF NOT EXISTS partner_marketing_claim_items_idx
        ON partner_marketing_claim_items (tenant_id, claim_id)`),
      d1.prepare(`CREATE TABLE IF NOT EXISTS partner_marketing_claim_reviews (
        id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL DEFAULT 'bib', claim_id TEXT NOT NULL,
        action TEXT NOT NULL, comment TEXT NOT NULL DEFAULT '', actor_email TEXT NOT NULL,
        actor_display_name TEXT NOT NULL DEFAULT '', actor_role TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
      d1.prepare(`CREATE INDEX IF NOT EXISTS partner_marketing_claim_reviews_idx
        ON partner_marketing_claim_reviews (tenant_id, claim_id, created_at)`),
      d1.prepare(`INSERT OR IGNORE INTO finance_document_registry
        (id, tenant_id, document_type, period_start, period_end, file_name, source_sheet, file_hash, status, review_note, created_by)
        VALUES ('fin-source-actual-2026-05', 'bib', 'งบทดลองรายเดือน', '2026-01-01', '2026-05-31',
        'Icoone ค่าใช้จ่ายแยกรายเดือน UPDATE 31052026.xlsx', 'งบทดลองแยกรายเดือน.',
        '9d8c2d2a0aafa754ef62d72413de80f859b78a723c51434f8532b2c8d7c4a684',
        'นำเข้าข้อมูลสรุปแล้ว · รอตรวจ', 'ยอดไม่รวม VAT ตามหมายเหตุในไฟล์ต้นทาง และยังไม่ใช่งบการเงินที่ตรวจสอบแล้ว', 'ระบบนำเข้าข้อมูล')`),
      ...[
        ["2026-01", 201151401, 95692533, 105458868, 19146059, 86312809],
        ["2026-02", 4084112, 3603229, 480883, 81319165, -80838282],
        ["2026-03", 0, 769130, -769130, 22453418, -23222548],
        ["2026-04", 200934579, 96335128, 104599451, 19204392, 85395059],
        ["2026-05", 1775701, 1370495, 405206, 34708673, -34303467],
      ].map((row) => d1.prepare(`INSERT OR IGNORE INTO finance_monthly_actuals
        (id, tenant_id, business_unit, period_month, revenue_satang, cogs_satang, gross_profit_satang,
        opex_satang, net_profit_satang, source_document_id, entry_method, status, note, created_by)
        VALUES (?, 'bib', 'icoone Thailand', ?, ?, ?, ?, ?, ?, 'fin-source-actual-2026-05', 'Imported',
        'นำเข้าแล้ว · รอตรวจ', 'อ้างอิงงบทดลองแยกรายเดือน.', 'ระบบนำเข้าข้อมูล')`)
        .bind(`icoone-actual-${row[0]}`, ...row)),
      d1.prepare(`INSERT OR IGNORE INTO partner_marketing_claims
        (id, tenant_id, account_id, report_month, submitted_amount_satang, eligible_amount_satang,
        excluded_amount_satang, monthly_cap_satang, evidence_status, review_status, review_note)
        VALUES ('linna-marketing-2026-06', 'bib', 'linna', '2026-06', 0, 0, 0, 5000000,
        'ไม่มีค่าโฆษณาที่ยื่นในข้อมูลรอบนี้', 'ไม่มีรายการให้หัก',
        'ค่าโฆษณาที่หักได้ต้องเป็นสื่อดิจิทัลที่ชำระจริง มีใบเสร็จและหลักฐานการชำระ และไม่เกิน 50,000 บาทต่อเดือน')`),
      d1.prepare(`INSERT OR IGNORE INTO finance_document_registry
        (id, tenant_id, document_type, period_start, period_end, file_name, source_sheet, file_hash,
         byte_size, status, review_note, created_by)
        VALUES ('linna-ads-summary-1472136', 'bib', 'ตารางสรุปค่าโฆษณา LINNA', '2026-05-20', '2026-07-24',
        '1472136.jpg', 'ตารางการตลาดยิงแอด',
        '503dde6fb3fe7582c8778105a03f150ffa99718f42efb3f96a29da92ef3100f0', 82484,
        'ได้รับตารางสรุป · รอเอกสารประกอบ',
        'ตารางสรุประบุ Google 20,442.72 บาท และ Facebook/IG 1,640.00 บาท แต่ยังไม่มีใบเสร็จและหลักฐานการชำระ',
        'นำเข้าจากแฟ้ม LINNA')`),
      d1.prepare(`UPDATE partner_marketing_claims SET
        submitted_amount_satang = 2044272, eligible_amount_satang = 0, excluded_amount_satang = 2044272,
        evidence_status = 'ได้รับตารางสรุปแล้ว', review_status = 'รอใบเสร็จและหลักฐานการชำระ',
        review_note = 'Google Ads ช่วง 20 พ.ค.–24 มิ.ย. 2569 ต้องยืนยันรอบบัญชีและแนบเอกสารการชำระก่อนอนุมัติ',
        updated_at = CURRENT_TIMESTAMP
        WHERE tenant_id = 'bib' AND id = 'linna-marketing-2026-06' AND submitted_amount_satang = 0`),
      d1.prepare(`INSERT OR IGNORE INTO partner_marketing_claims
        (id, tenant_id, account_id, report_month, submitted_amount_satang, eligible_amount_satang,
         excluded_amount_satang, monthly_cap_satang, evidence_status, review_status, review_note)
        VALUES ('linna-marketing-2026-07', 'bib', 'linna', '2026-07', 164000, 0, 164000, 5000000,
        'ได้รับตารางสรุปแล้ว', 'รอใบเสร็จและหลักฐานการชำระ',
        'Facebook/IG เริ่มโฆษณา 24 ก.ค. 2569 ยังไม่ระบุวันสิ้นสุดและยังไม่มีหลักฐานการชำระ')`),
      d1.prepare(`INSERT OR IGNORE INTO partner_marketing_claim_items
        (id, tenant_id, claim_id, channel, service_period_start, service_period_end, description,
         submitted_amount_satang, source_document_id, evidence_status)
        VALUES ('linna-ads-google-2026-06', 'bib', 'linna-marketing-2026-06', 'Google',
        '2026-05-20', '2026-06-24', 'Google Ads ตามตารางสรุปค่าโฆษณา', 2044272,
        'linna-ads-summary-1472136', 'รอใบเสร็จและหลักฐานการชำระ')`),
      d1.prepare(`INSERT OR IGNORE INTO partner_marketing_claim_items
        (id, tenant_id, claim_id, channel, service_period_start, service_period_end, description,
         submitted_amount_satang, source_document_id, evidence_status)
        VALUES ('linna-ads-meta-2026-07', 'bib', 'linna-marketing-2026-07', 'Facebook/IG',
        '2026-07-24', '', 'เริ่มโฆษณา 24 ก.ค. 2569 ตามตารางสรุปค่าโฆษณา', 164000,
        'linna-ads-summary-1472136', 'รอวันสิ้นสุด ใบเสร็จ และหลักฐานการชำระ')`),
    ]);
  })().catch((error) => { ready = null; throw error; });
  return ready;
}
