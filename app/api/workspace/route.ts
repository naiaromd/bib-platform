import { env } from "cloudflare:workers";
import { afterSalesActivities, businessIssues, companyContacts, eventRecords, kpiSource, trainingActivities } from "@/lib/kpi-import-data";
import { accessErrorResponse, requireRequestActor, requireRole } from "@/lib/server-identity";
import { ensureFinanceStorage } from "@/lib/finance-storage";

function db() {
  if (!env.DB) throw new Error("D1 binding DB is unavailable");
  return env.DB;
}

async function initialize() {
  const d1 = db();
  await d1.batch([
    d1.prepare(`CREATE TABLE IF NOT EXISTS workspace_tasks (
      id TEXT PRIMARY KEY, owner_user_id TEXT NOT NULL, account_id TEXT NOT NULL DEFAULT '',
      lead_id TEXT NOT NULL DEFAULT '', source_id TEXT NOT NULL DEFAULT '', title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ยังไม่เริ่ม', priority TEXT NOT NULL DEFAULT 'กลาง',
      due_date TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    d1.prepare(`CREATE INDEX IF NOT EXISTS workspace_tasks_owner_due_idx
      ON workspace_tasks (owner_user_id, due_date)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS sales_targets (
      id TEXT PRIMARY KEY, owner_user_id TEXT NOT NULL, period_key TEXT NOT NULL,
      metric_code TEXT NOT NULL, target_value INTEGER NOT NULL DEFAULT 0,
      actual_value INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'Draft',
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    d1.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS sales_targets_owner_period_metric_idx
      ON sales_targets (owner_user_id, period_key, metric_code)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS lead_sources (
      id TEXT PRIMARY KEY, source_type TEXT NOT NULL, name TEXT NOT NULL,
      owner_user_id TEXT NOT NULL, start_date TEXT NOT NULL DEFAULT '',
      end_date TEXT NOT NULL DEFAULT '', budget INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Active', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS crm_leads (
      id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL DEFAULT 'bib', account_id TEXT NOT NULL DEFAULT '', contact_id TEXT NOT NULL DEFAULT '',
      source_id TEXT NOT NULL, owner_user_id TEXT NOT NULL, status TEXT NOT NULL,
      score INTEGER NOT NULL DEFAULT 0, temperature TEXT NOT NULL DEFAULT 'Cold',
      evidence_json TEXT NOT NULL DEFAULT '[]', last_contact_at TEXT NOT NULL DEFAULT '', next_action TEXT NOT NULL DEFAULT '',
      next_action_at TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    d1.prepare(`CREATE INDEX IF NOT EXISTS crm_leads_source_idx ON crm_leads (source_id)`),
    d1.prepare(`CREATE INDEX IF NOT EXISTS crm_leads_owner_status_idx ON crm_leads (owner_user_id, status)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS crm_opportunities (
      id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL DEFAULT 'bib', account_id TEXT NOT NULL,
      primary_contact_id TEXT NOT NULL DEFAULT '', owner_user_id TEXT NOT NULL, name TEXT NOT NULL,
      stage TEXT NOT NULL, commercial_model TEXT NOT NULL DEFAULT '', expected_value_satang INTEGER NOT NULL DEFAULT 0,
      probability_bps INTEGER NOT NULL DEFAULT 0, expected_close_date TEXT NOT NULL DEFAULT '',
      next_action TEXT NOT NULL DEFAULT '', next_action_at TEXT NOT NULL DEFAULT '', risk_note TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'Open', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    d1.prepare(`CREATE INDEX IF NOT EXISTS crm_opportunities_tenant_stage_idx
      ON crm_opportunities (tenant_id, stage, status)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS crm_activities (
      id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL DEFAULT 'bib', account_id TEXT NOT NULL DEFAULT '',
      contact_id TEXT NOT NULL DEFAULT '', lead_id TEXT NOT NULL DEFAULT '', opportunity_id TEXT NOT NULL DEFAULT '',
      activity_type TEXT NOT NULL, channel TEXT NOT NULL DEFAULT '', summary TEXT NOT NULL,
      outcome TEXT NOT NULL DEFAULT '', occurred_at TEXT NOT NULL, owner_user_id TEXT NOT NULL,
      source_record_id TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    d1.prepare(`CREATE INDEX IF NOT EXISTS crm_activities_account_date_idx
      ON crm_activities (tenant_id, account_id, occurred_at)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS demo_appointments (
      id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL DEFAULT 'bib', lead_id TEXT NOT NULL,
      opportunity_id TEXT NOT NULL DEFAULT '', location_type TEXT NOT NULL, site_id TEXT NOT NULL DEFAULT '',
      scheduled_at TEXT NOT NULL DEFAULT '', decision_maker_attending INTEGER NOT NULL DEFAULT 0,
      qualification_score INTEGER NOT NULL DEFAULT 0, approval_status TEXT NOT NULL DEFAULT 'Pending',
      status TEXT NOT NULL DEFAULT 'Requested', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS client_accounts (
      id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL DEFAULT 'bib', legal_name TEXT NOT NULL, display_name TEXT NOT NULL,
      business_segment TEXT NOT NULL, province TEXT NOT NULL DEFAULT '', commercial_model TEXT NOT NULL,
      account_status TEXT NOT NULL DEFAULT 'Active', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS client_contacts (
      id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL DEFAULT 'bib', account_id TEXT NOT NULL, email TEXT NOT NULL DEFAULT '',
      display_name TEXT NOT NULL, position_title TEXT NOT NULL DEFAULT '', buying_role TEXT NOT NULL,
      portal_role TEXT NOT NULL DEFAULT 'Contact', phone TEXT NOT NULL DEFAULT '', line_id TEXT NOT NULL DEFAULT '',
      preferred_channel TEXT NOT NULL DEFAULT 'LINE', decision_level TEXT NOT NULL DEFAULT 'ยังไม่ยืนยัน',
      consent_status TEXT NOT NULL DEFAULT 'ยังไม่ยืนยัน', notes TEXT NOT NULL DEFAULT '',
      active INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS device_deployments (
      id TEXT PRIMARY KEY, account_id TEXT NOT NULL, model TEXT NOT NULL,
      serial_number TEXT NOT NULL DEFAULT '', installed_at TEXT NOT NULL DEFAULT '',
      cumulative_hours REAL NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'Pending delivery')`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS partner_performance_snapshots (
      id TEXT PRIMARY KEY, account_id TEXT NOT NULL, report_month TEXT NOT NULL,
      reported_paid_sessions INTEGER NOT NULL DEFAULT 0, eligible_paid_sessions INTEGER NOT NULL DEFAULT 0,
      complimentary_sessions INTEGER NOT NULL DEFAULT 0, training_sessions INTEGER NOT NULL DEFAULT 0,
      reported_gross_revenue REAL NOT NULL DEFAULT 0, eligible_gross_revenue REAL NOT NULL DEFAULT 0,
      bib_share_rate_bps INTEGER NOT NULL DEFAULT 4000, bib_share_vat_inclusive REAL NOT NULL DEFAULT 0,
      linna_share REAL NOT NULL DEFAULT 0, deductible_marketing REAL NOT NULL DEFAULT 0,
      approved_refunds REAL NOT NULL DEFAULT 0, total_usage_minutes REAL NOT NULL DEFAULT 0,
      exception_count INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'Needs Review',
      source_note TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS source_imports (
      id TEXT PRIMARY KEY, source_file_id TEXT NOT NULL, file_name TEXT NOT NULL,
      source_modified_at TEXT NOT NULL, imported_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      status TEXT NOT NULL DEFAULT 'Imported')`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS company_team_directory (
      id TEXT PRIMARY KEY, display_name TEXT NOT NULL, responsibility TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', source_import_id TEXT NOT NULL)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS kpi_event_records (
      id TEXT PRIMARY KEY, period_key TEXT NOT NULL, name TEXT NOT NULL, activity_type TEXT NOT NULL,
      target_leads INTEGER NOT NULL DEFAULT 0, actual_leads INTEGER NOT NULL DEFAULT 0,
      demos INTEGER NOT NULL DEFAULT 0, quotations INTEGER NOT NULL DEFAULT 0,
      potential_sales INTEGER NOT NULL DEFAULT 0, closed_sales INTEGER NOT NULL DEFAULT 0,
      follow_up TEXT NOT NULL DEFAULT '', status TEXT NOT NULL, source_sheet TEXT NOT NULL,
      source_row INTEGER NOT NULL, source_import_id TEXT NOT NULL)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS training_activity_records (
      id TEXT PRIMARY KEY, activity_date TEXT NOT NULL DEFAULT '', project_name TEXT NOT NULL,
      target_segment TEXT NOT NULL DEFAULT '', location TEXT NOT NULL DEFAULT '', topic TEXT NOT NULL,
      student_count INTEGER NOT NULL DEFAULT 0, duration_label TEXT NOT NULL DEFAULT '',
      trainers TEXT NOT NULL DEFAULT '', trainer_note TEXT NOT NULL DEFAULT '', source_sheet TEXT NOT NULL,
      source_row INTEGER NOT NULL, source_import_id TEXT NOT NULL)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS after_sales_activity_records (
      id TEXT PRIMARY KEY, client_name TEXT NOT NULL, activity_date TEXT NOT NULL DEFAULT '',
      activity TEXT NOT NULL, status TEXT NOT NULL, source_sheet TEXT NOT NULL,
      source_row INTEGER NOT NULL, source_import_id TEXT NOT NULL)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS business_issues (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, details TEXT NOT NULL DEFAULT '', due_date TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL, source_import_id TEXT NOT NULL)`),
  ]);

  const existing = await d1.prepare("SELECT COUNT(*) AS total FROM workspace_tasks WHERE owner_user_id = ?").bind("nine").first<{ total: number }>();
  if (!existing?.total) {
    await d1.batch([
      d1.prepare("INSERT INTO workspace_tasks (id, owner_user_id, account_id, title, status, priority, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)").bind("task-drj-contract", "nine", "drj", "ตรวจข้อมูลก่อนส่งสัญญาแบบ B", "กำลังทำ", "สูง", "2026-08-01"),
      d1.prepare("INSERT INTO workspace_tasks (id, owner_user_id, account_id, title, status, priority, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)").bind("task-linna-report", "nine", "linna", "ตรวจรายงานรายได้และข้อยกเว้น", "รอตรวจ", "สูง", "2026-08-02"),
      d1.prepare("INSERT INTO workspace_tasks (id, owner_user_id, account_id, source_id, title, status, priority, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind("task-cme-followup", "nine", "modiolistics", "CMP-2608-01", "เชิญร่วมงาน CME และโทรติดตาม", "ยังไม่เริ่ม", "กลาง", "2026-08-04"),
      d1.prepare("INSERT INTO workspace_tasks (id, owner_user_id, account_id, source_id, title, status, priority, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind("task-citycare-demo", "nine", "citycare", "EVT-2605-01", "ยืนยันวันสาธิตนอกสถานที่", "กำลังทำ", "สูง", "2026-08-05"),
      d1.prepare("INSERT INTO workspace_tasks (id, owner_user_id, account_id, title, status, priority, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)").bind("task-wholeness-demo", "nine", "wholeness", "ติดตามคำเชิญทดลองเครื่อง", "ยังไม่เริ่ม", "กลาง", "2026-08-06"),
    ]);
  }
  await d1.prepare(`INSERT OR IGNORE INTO sales_targets
    (id, owner_user_id, period_key, metric_code, target_value, actual_value, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)`).bind("target-nine-2026-machine", "nine", "2026", "MACHINES_SOLD", 0, 0, "Draft").run();
  await d1.prepare(`UPDATE sales_targets SET target_value = 15, actual_value = 1,
    status = 'Imported', updated_at = CURRENT_TIMESTAMP
    WHERE id = 'target-nine-2026-machine' AND status = 'Draft'`).run();

  const prospectAccounts = [
    ["bangkok-hospital-chiangmai", "Bangkok Hospital Chiangmai Co., Ltd.", "โรงพยาบาลกรุงเทพ เชียงใหม่", "โรงพยาบาล", "เชียงใหม่", "A"],
    ["drj", "Dr. J Clinic", "Dr. J Clinic", "คลินิกความงาม", "กรุงเทพฯ", "B"],
    ["modiolistics", "Modiolistics Clinic", "Modiolistics Clinic", "คลินิกความงาม", "กรุงเทพฯ", ""],
    ["citycare", "Citycare Clinic", "Citycare Clinic", "คลินิก", "ภูเก็ต", ""],
    ["wholeness", "Wholeness Way Clinic", "Wholeness Way Clinic", "กายภาพบำบัด", "กรุงเทพฯ", ""],
  ];
  for (const account of prospectAccounts) {
    await d1.prepare(`INSERT OR IGNORE INTO client_accounts
      (id, tenant_id, legal_name, display_name, business_segment, province, commercial_model, account_status)
      VALUES (?, 'bib', ?, ?, ?, ?, ?, 'Prospect')`).bind(...account).run();
  }
  const contactRows = [
    ["contact-bhc", "bangkok-hospital-chiangmai", "", "ฝ่ายจัดซื้อและทีมแพทย์", "ผู้ประเมินโครงการ"],
    ["contact-drj", "drj", "", "Dr. J", "แพทย์และผู้ตัดสินใจ"],
    ["contact-modiolistics", "modiolistics", "", "ผู้รับผิดชอบ", "แพทย์"],
    ["contact-citycare", "citycare", "", "ผู้รับผิดชอบ", "ผู้ประสานงาน"],
    ["contact-wholeness", "wholeness", "", "ผู้รับผิดชอบ", "ผู้ประสานงาน"],
  ];
  for (const contact of contactRows) {
    await d1.prepare(`INSERT OR IGNORE INTO client_contacts
      (id, tenant_id, account_id, email, display_name, buying_role, portal_role)
      VALUES (?, 'bib', ?, ?, ?, ?, 'Contact')`).bind(...contact).run();
  }
  const sourceRows = [
    ["SRC-DIRECT", "Direct", "การติดต่อโดยตรง", "ผู้รับผิดชอบ"],
    ["SRC-REFERRAL", "Referral", "การแนะนำ", "ผู้รับผิดชอบ"],
    ["SRC-OUTBOUND", "Outbound", "ค้นหารายชื่อโดยทีมขาย", "ผู้รับผิดชอบ"],
    ["SRC-CUSTOMER", "Customer", "ลูกค้าปัจจุบัน", "ผู้รับผิดชอบ"],
    ["CMP-2608-01", "Campaign", "CME Evidence Outreach", "ผู้รับผิดชอบ"],
    ["EVT-2605-01", "Event", "Phuket Demo Roadshow 2026", "ผู้รับผิดชอบ"],
  ];
  for (const source of sourceRows) {
    await d1.prepare(`INSERT OR IGNORE INTO lead_sources
      (id, tenant_id, source_type, name, owner_user_id, status)
      VALUES (?, 'bib', ?, ?, ?, 'Active')`).bind(...source).run();
  }
  const leadRows = [
    ["lead-bhc", "bangkok-hospital-chiangmai", "contact-bhc", "SRC-DIRECT", "ผู้รับผิดชอบ", "นัดสาธิต", 75, "Hot", ["ยืนยันนิติบุคคล", "ประชุมเบื้องต้น", "ผู้มีอำนาจร่วมสาธิต"], "2026-07-31", "ส่ง Term Sheet แบบ A", "2026-08-01"],
    ["lead-drj", "drj", "contact-drj", "SRC-REFERRAL", "ผู้รับผิดชอบ", "ตรวจสัญญา", 60, "Hot", ["แพทย์เป็นผู้ตัดสินใจ", "ขอเอกสารสัญญา", "แจ้งสถานที่ติดตั้งแล้ว"], "2026-07-31", "ขอข้อมูลยืนยันตัวตน", "2026-08-01"],
    ["lead-modiolistics", "modiolistics", "contact-modiolistics", "CMP-2608-01", "ผู้รับผิดชอบ", "ติดต่อแล้ว", 35, "Warm", ["ยืนยันสถานประกอบการ", "มีข้อมูลผู้ติดต่อ", "ติดต่อแล้ว"], "2025-08-10", "เชิญร่วมงาน CME และโทรติดตาม", "2026-08-04"],
    ["lead-citycare", "citycare", "contact-citycare", "EVT-2605-01", "ผู้รับผิดชอบ", "สนใจสาธิต", 70, "Hot", ["ตอบรับการสาธิต", "แจ้งช่วงวันที่สะดวก", "มีกรณีใช้งานที่ต้องการทดลอง"], "2026-05-30", "ยืนยันวันสาธิตนอกสถานที่", "2026-08-05"],
    ["lead-wholeness", "wholeness", "contact-wholeness", "SRC-OUTBOUND", "ผู้รับผิดชอบ", "ขอนัดทดลอง", 50, "Warm", ["ขอข้อมูลเพิ่มเติม", "แจ้งผู้รับผิดชอบ", "ส่งอีเมลแล้ว"], "2025-08-06", "ติดตามคำเชิญทดลองเครื่อง", "2026-08-06"],
  ] as const;
  for (const lead of leadRows) {
    await d1.prepare(`INSERT OR IGNORE INTO crm_leads
      (id, tenant_id, account_id, contact_id, source_id, owner_user_id, status, score,
       temperature, evidence_json, last_contact_at, next_action, next_action_at)
      VALUES (?, 'bib', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(lead[0], lead[1], lead[2], lead[3], lead[4], lead[5], lead[6], lead[7], JSON.stringify(lead[8]), lead[9], lead[10], lead[11]).run();
  }
  const opportunityRows = [
    ["opp-bhc", "bangkok-hospital-chiangmai", "contact-bhc", "ผู้รับผิดชอบ", "โครงการ icoone โรงพยาบาลกรุงเทพ เชียงใหม่", "Demo Scheduled", "A", 215000000, 5000, "2026-09-30", "ส่ง Term Sheet แบบ A", "2026-08-01", "ต้องยืนยันงบประมาณและรอบจัดซื้อ"],
    ["opp-drj", "drj", "contact-drj", "ผู้รับผิดชอบ", "Dr. J Rent-to-Own", "Contracting", "B", 260000000, 7000, "2026-08-31", "ขอข้อมูลยืนยันตัวตน", "2026-08-01", "ทำสัญญาในนามบุคคล ต้องตรวจรายได้และเครดิต"],
    ["opp-modiolistics", "modiolistics", "contact-modiolistics", "ผู้รับผิดชอบ", "Modiolistics icoone", "Qualified", "", 215000000, 2000, "2026-12-31", "เชิญร่วมงาน CME และโทรติดตาม", "2026-08-04", "ยังไม่มีการยืนยันนัดสาธิต"],
    ["opp-citycare", "citycare", "contact-citycare", "ผู้รับผิดชอบ", "Citycare On-site Demo", "Demo Requested", "", 215000000, 3500, "2026-10-31", "ยืนยันวันสาธิตนอกสถานที่", "2026-08-05", "ต้องยืนยันว่าผู้มีอำนาจเข้าร่วม"],
    ["opp-wholeness", "wholeness", "contact-wholeness", "ผู้รับผิดชอบ", "Wholeness Way icoone", "Demo Requested", "", 215000000, 2500, "2026-12-31", "ติดตามคำเชิญทดลองเครื่อง", "2026-08-06", "ยังไม่ยืนยันผู้มีอำนาจและวันสาธิต"],
  ];
  for (const opportunity of opportunityRows) {
    await d1.prepare(`INSERT OR IGNORE INTO crm_opportunities
      (id, tenant_id, account_id, primary_contact_id, owner_user_id, name, stage, commercial_model,
       expected_value_satang, probability_bps, expected_close_date, next_action, next_action_at, risk_note)
      VALUES (?, 'bib', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(...opportunity).run();
  }
  const activityRows = [
    ["activity-bhc-meeting", "bangkok-hospital-chiangmai", "contact-bhc", "lead-bhc", "opp-bhc", "Meeting", "In person", "ประชุมเบื้องต้นและยืนยันความสนใจสาธิต", "เตรียม Term Sheet แบบ A", "2026-07-31T10:00:00+07:00", "ผู้รับผิดชอบ"],
    ["activity-drj-line", "drj", "contact-drj", "lead-drj", "opp-drj", "Follow-up", "LINE", "ขอข้อมูลสำหรับจัดทำสัญญา", "ลูกค้าแจ้งว่าทำสัญญาในนามบุคคล", "2026-07-31T17:50:00+07:00", "ผู้รับผิดชอบ"],
    ["activity-citycare-event", "citycare", "contact-citycare", "lead-citycare", "opp-citycare", "Event", "In person", "พูดคุยใน Phuket Demo Roadshow", "ลูกค้าสนใจสาธิตนอกสถานที่", "2026-05-30T15:00:00+07:00", "ผู้รับผิดชอบ"],
  ];
  for (const activity of activityRows) {
    await d1.prepare(`INSERT OR IGNORE INTO crm_activities
      (id, tenant_id, account_id, contact_id, lead_id, opportunity_id, activity_type,
       channel, summary, outcome, occurred_at, owner_user_id)
      VALUES (?, 'bib', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(...activity).run();
  }
  await d1.prepare(`INSERT OR IGNORE INTO demo_appointments
    (id, tenant_id, lead_id, opportunity_id, location_type, scheduled_at,
     decision_maker_attending, qualification_score, approval_status, status)
    VALUES ('demo-bhc', 'bib', 'lead-bhc', 'opp-bhc', 'On-site', '', 1, 75, 'Approved', 'Scheduling')`).run();
  await d1.prepare(`INSERT OR IGNORE INTO demo_appointments
    (id, tenant_id, lead_id, opportunity_id, location_type, scheduled_at,
     decision_maker_attending, qualification_score, approval_status, status)
    VALUES ('demo-citycare', 'bib', 'lead-citycare', 'opp-citycare', 'On-site', '', 0, 70, 'Pending', 'Requested')`).run();

  await d1.prepare(`INSERT OR IGNORE INTO source_imports
    (id, source_file_id, file_name, source_modified_at, status) VALUES (?, ?, ?, ?, 'Imported')`)
    .bind(kpiSource.id, kpiSource.sourceFileId, kpiSource.fileName, kpiSource.modifiedAt).run();
  for (const row of companyContacts) {
    await d1.prepare(`INSERT OR IGNORE INTO company_team_directory
      (id, display_name, responsibility, email, phone, source_import_id) VALUES (?, ?, ?, ?, ?, ?)`)
      .bind(...row, kpiSource.id).run();
  }
  for (const row of eventRecords) {
    await d1.prepare(`INSERT OR IGNORE INTO kpi_event_records
      (id, period_key, name, activity_type, target_leads, actual_leads, demos, quotations,
       potential_sales, closed_sales, follow_up, status, source_sheet, source_row, source_import_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(...row, kpiSource.id).run();
  }
  for (const row of trainingActivities) {
    await d1.prepare(`INSERT OR IGNORE INTO training_activity_records
      (id, activity_date, project_name, target_segment, location, topic, student_count,
       duration_label, trainers, trainer_note, source_sheet, source_row, source_import_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(...row, kpiSource.id).run();
  }
  for (const row of afterSalesActivities) {
    await d1.prepare(`INSERT OR IGNORE INTO after_sales_activity_records
      (id, client_name, activity_date, activity, status, source_sheet, source_row, source_import_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(...row, kpiSource.id).run();
  }
  for (const row of businessIssues) {
    await d1.prepare(`INSERT OR IGNORE INTO business_issues
      (id, title, details, due_date, status, source_import_id) VALUES (?, ?, ?, ?, ?, ?)`)
      .bind(...row, kpiSource.id).run();
  }
  const customers = [
    ["anantara-wellness", "Anantara Wellness", "Anantara Wellness", "Luxury resort spa", "A"],
    ["amanpuri", "Amanpuri", "Amanpuri", "Luxury resort", "A"],
    ["sincere-beauty", "Sincere Beauty Clinic", "Sincere Beauty Clinic", "Beauty clinic", "A"],
    ["unwa-wellness", "Unwa Wellness (TCM)", "Unwa Wellness", "TCM wellness", "A"],
    ["kmb-hospital", "KMB Hospital", "KMB Hospital", "Hospital", "A"],
    ["kihava", "Kihava", "Kihava", "Wellness", "A"],
    ["phuket-detox", "Phuket Detox", "Phuket Detox", "Detox/wellness", "A"],
    ["detoxea", "Detoxea", "Detoxea", "Detox/wellness", "A"],
    ["linna", "บริษัท ซีเคแอล เฮลท์ แอนด์ บิวตี้ อินเตอร์เนชั่นแนล จำกัด", "LINNA Clinic", "Wellness", "D2"],
  ];
  for (const customer of customers) {
    await d1.prepare(`INSERT OR IGNORE INTO client_accounts
      (id, legal_name, display_name, business_segment, commercial_model, account_status)
      VALUES (?, ?, ?, ?, ?, 'Active')`).bind(...customer).run();
  }
  for (const customer of customers.slice(0, 8)) {
    await d1.prepare(`INSERT OR IGNORE INTO device_deployments
      (id, account_id, model, serial_number, installed_at, cumulative_hours, status)
      VALUES (?, ?, 'icoone Laser Med', '', '', 0, 'ต้องยืนยันข้อมูลเครื่อง')`)
      .bind(`deployment-${customer[0]}`, customer[0]).run();
  }
  await d1.prepare(`INSERT OR IGNORE INTO device_deployments
    (id, account_id, model, serial_number, installed_at, cumulative_hours, status)
    VALUES ('deployment-linna', 'linna', 'icoone Laser Med', '', '', 0, 'รอหมายเลขเครื่องและวันติดตั้ง')`).run();
  await d1.prepare(`INSERT OR REPLACE INTO partner_performance_snapshots
    (id, account_id, report_month, reported_paid_sessions, eligible_paid_sessions,
     complimentary_sessions, training_sessions, reported_gross_revenue, eligible_gross_revenue,
     bib_share_rate_bps, bib_share_vat_inclusive, linna_share, deductible_marketing,
     approved_refunds, total_usage_minutes, exception_count, status, source_note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind("linna-2026-06", "linna", "2026-06", 5, 4, 2, 1, 19940.80, 15580.60,
      4000, 6232.24, 9348.36, 0, 0, 316.33, 2, "Needs Review",
      "Paid Session_ICOONE.xlsx; one paid row dated 1969-05-29 is outside June and all workbook dates use 1969 instead of 2569/2026").run();
}

let initializationPromise: Promise<void> | null = null;

async function ensureInitialized() {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      try {
        const ready = await db().prepare("SELECT id FROM source_imports WHERE id = ? LIMIT 1")
          .bind(kpiSource.id).first();
        if (ready) return;
      } catch {
        // A new environment may not have the tables yet; initialize them below.
      }
      await initialize();
    })().catch((error) => {
      initializationPromise = null;
      throw error;
    });
  }
  return initializationPromise;
}

export async function GET(request: Request) {
  try {
    await ensureInitialized();
    const actor = await requireRequestActor(request);
    requireRole(actor, ["Executive", "Finance", "Legal", "Sales", "Trainer", "Marketing", "After Sales"]);
    await ensureFinanceStorage();
    const d1 = db();
    const showAll = ["Executive", "Finance", "Legal"].includes(actor.role);
    const tasks = showAll
      ? await d1.prepare("SELECT * FROM workspace_tasks WHERE tenant_id = ? ORDER BY due_date, created_at").bind(actor.tenantId).all()
      : await d1.prepare(`SELECT * FROM workspace_tasks WHERE tenant_id = ?
          AND (owner_user_id = ? OR owner_user_id = ?) ORDER BY due_date, created_at`)
        .bind(actor.tenantId, actor.displayName, actor.email).all();
    const target = await d1.prepare(`SELECT * FROM sales_targets WHERE tenant_id = ?
      AND period_key = ? AND metric_code = ? ORDER BY updated_at DESC LIMIT 1`)
      .bind(actor.tenantId, "2026", "MACHINES_SOLD").first();
    const customers = await d1.prepare(`SELECT a.*, d.model AS device_model, d.serial_number,
      d.installed_at, d.status AS deployment_status FROM client_accounts a
      LEFT JOIN device_deployments d ON d.account_id = a.id AND d.tenant_id = a.tenant_id
      WHERE a.tenant_id = ? AND a.account_status = 'Active'
      AND (? = '*' OR a.id = ?)
      ORDER BY CASE WHEN a.id = 'linna' THEN 1 ELSE 0 END, a.display_name`)
      .bind(actor.tenantId, actor.accountScope, actor.accountScope).all();
    const linnaPerformance = await d1.prepare(`SELECT * FROM partner_performance_snapshots
      WHERE tenant_id = ? AND account_id = 'linna' ORDER BY report_month DESC LIMIT 1`)
      .bind(actor.tenantId).first();
    const linnaMarketing = await d1.prepare(`SELECT * FROM partner_marketing_claims
      WHERE tenant_id = ? AND account_id = 'linna' ORDER BY report_month DESC LIMIT 1`)
      .bind(actor.tenantId).first();
    const leadQuery = await d1.prepare(`SELECT l.id, l.status, l.score, l.temperature, l.evidence_json,
      l.last_contact_at, l.next_action, l.next_action_at, l.owner_user_id,
      a.id AS account_id, a.display_name AS account_name, a.business_segment, a.province,
      c.display_name AS contact_name, c.buying_role, s.id AS source_id, s.name AS source_name,
      o.id AS opportunity_id, o.stage, o.commercial_model, o.expected_value_satang,
      o.probability_bps, o.risk_note
      FROM crm_leads l
      JOIN client_accounts a ON a.id = l.account_id AND a.tenant_id = l.tenant_id
      LEFT JOIN client_contacts c ON c.id = l.contact_id AND c.tenant_id = l.tenant_id
      LEFT JOIN lead_sources s ON s.id = l.source_id AND s.tenant_id = l.tenant_id
      LEFT JOIN crm_opportunities o ON o.account_id = l.account_id AND o.tenant_id = l.tenant_id AND o.status = 'Open'
      WHERE l.tenant_id = ? AND (? = 1 OR l.owner_user_id = ?)
      ORDER BY l.score DESC, l.next_action_at`).bind(actor.tenantId, showAll ? 1 : 0, actor.displayName).all<Record<string, unknown>>();
    const leads = leadQuery.results.map((row) => {
      let evidence: string[] = [];
      try { evidence = JSON.parse(String(row.evidence_json || "[]")); } catch { evidence = []; }
      return {
        id: String(row.id), accountId: String(row.account_id), name: String(row.account_name),
        status: String(row.status), score: Number(row.score), temperature: String(row.temperature),
        next: String(row.next_action), nextActionAt: String(row.next_action_at), owner: String(row.owner_user_id),
        segment: String(row.business_segment), model: String(row.commercial_model || "ยังไม่เลือก"),
        contact: String(row.contact_name || "ยังไม่มีผู้ติดต่อ"), role: String(row.buying_role || "ยังไม่ระบุ"),
        city: String(row.province || "ยังไม่ระบุ"), source: String(row.source_name || "ยังไม่ระบุ"),
        sourceId: String(row.source_id), lastContactAt: String(row.last_contact_at), evidence,
        risk: String(row.risk_note || "ยังไม่มีความเสี่ยงที่บันทึก"), opportunityId: String(row.opportunity_id || ""),
        stage: String(row.stage || "Lead"), expectedValueSatang: Number(row.expected_value_satang || 0),
        probabilityBps: Number(row.probability_bps || 0),
      };
    });
    const funnel = await d1.prepare(`SELECT stage, COUNT(*) AS total,
      SUM(expected_value_satang) AS value_satang FROM crm_opportunities
      WHERE tenant_id = ? AND status = 'Open' GROUP BY stage ORDER BY stage`)
      .bind(actor.tenantId).all();
    const forecast = await d1.prepare(`SELECT COUNT(*) AS open_opportunities,
      COALESCE(SUM(expected_value_satang), 0) AS pipeline_satang,
      COALESCE(SUM(expected_value_satang * probability_bps / 10000), 0) AS weighted_satang,
      MAX(updated_at) AS updated_at FROM crm_opportunities WHERE tenant_id = ? AND status = 'Open'`)
      .bind(actor.tenantId).first();
    const events = await d1.prepare("SELECT * FROM kpi_event_records WHERE tenant_id = ? ORDER BY period_key, source_row").bind(actor.tenantId).all();
    const training = await d1.prepare("SELECT * FROM training_activity_records WHERE tenant_id = ? ORDER BY activity_date DESC, source_row DESC").bind(actor.tenantId).all();
    const afterSales = await d1.prepare("SELECT * FROM after_sales_activity_records WHERE tenant_id = ? ORDER BY CASE WHEN activity_date = '' THEN 1 ELSE 0 END, activity_date DESC, source_row DESC").bind(actor.tenantId).all();
    const team = await d1.prepare("SELECT * FROM company_team_directory WHERE tenant_id = ? ORDER BY responsibility, display_name").bind(actor.tenantId).all();
    const issues = await d1.prepare("SELECT * FROM business_issues WHERE tenant_id = ? ORDER BY CASE WHEN status = 'Overdue' THEN 0 ELSE 1 END, due_date").bind(actor.tenantId).all();
    const sourceImport = await d1.prepare("SELECT * FROM source_imports WHERE tenant_id = ? AND id = ?").bind(actor.tenantId, kpiSource.id).first();
    return Response.json({
      user: { email: actor.email, displayName: actor.displayName, role: actor.role, tenantId: actor.tenantId },
      tasks: tasks.results, target, customers: customers.results, linnaPerformance, linnaMarketing,
      events: events.results, training: training.results, afterSales: afterSales.results,
      team: team.results, issues: issues.results, sourceImport, leads, funnel: funnel.results,
      forecast: { ...forecast, source: "CRM Opportunities", status: "Calculated", currency: "THB", amountUnit: "satang" },
    });
  } catch (error) {
    const accessResponse = accessErrorResponse(error);
    if (accessResponse) return accessResponse;
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load workspace" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureInitialized();
    const actor = await requireRequestActor(request);
    requireRole(actor, ["Executive", "Sales", "Marketing", "Trainer", "After Sales"]);
    const payload = await request.json() as Record<string, unknown>;
    const d1 = db();
    if (payload.action === "create_task") {
      const title = String(payload.title || "").trim();
      const dueDate = String(payload.dueDate || "");
      if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return Response.json({ error: "กรุณาระบุชื่องานและวันที่" }, { status: 400 });
      const id = `task-${crypto.randomUUID()}`;
      await d1.prepare(`INSERT INTO workspace_tasks
        (id, tenant_id, owner_user_id, title, status, priority, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)`)
        .bind(id, actor.tenantId, actor.displayName, title, "ยังไม่เริ่ม", "กลาง", dueDate).run();
      return Response.json({ ok: true, id }, { status: 201 });
    }
    if (payload.action === "update_task") {
      const id = String(payload.id || "");
      const status = String(payload.status || "");
      if (!id || !["ยังไม่เริ่ม", "กำลังทำ", "รอตรวจ", "เสร็จแล้ว"].includes(status)) return Response.json({ error: "สถานะไม่ถูกต้อง" }, { status: 400 });
      if (actor.role === "Executive") {
        await d1.prepare("UPDATE workspace_tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE tenant_id = ? AND id = ?")
          .bind(status, actor.tenantId, id).run();
      } else {
        await d1.prepare(`UPDATE workspace_tasks SET status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE tenant_id = ? AND id = ? AND (owner_user_id = ? OR owner_user_id = ?)`)
          .bind(status, actor.tenantId, id, actor.displayName, actor.email).run();
      }
      return Response.json({ ok: true });
    }
    if (payload.action === "save_target") {
      requireRole(actor, ["Executive"]);
      const targetValue = Number(payload.targetValue);
      const actualValue = Number(payload.actualValue);
      if (!Number.isFinite(targetValue) || !Number.isFinite(actualValue) || targetValue < 0 || actualValue < 0 || actualValue > targetValue) return Response.json({ error: "กรุณาตรวจสอบเป้าหมายและยอดขายจริง" }, { status: 400 });
      await d1.prepare(`UPDATE sales_targets SET target_value = ?, actual_value = ?, status = 'Active',
        updated_at = CURRENT_TIMESTAMP WHERE tenant_id = ? AND period_key = ? AND metric_code = ?`)
        .bind(targetValue, actualValue, actor.tenantId, "2026", "MACHINES_SOLD").run();
      return Response.json({ ok: true });
    }
    return Response.json({ error: "ไม่พบคำสั่ง" }, { status: 400 });
  } catch (error) {
    const accessResponse = accessErrorResponse(error);
    if (accessResponse) return accessResponse;
    return Response.json({ error: error instanceof Error ? error.message : "Unable to update workspace" }, { status: 500 });
  }
}
