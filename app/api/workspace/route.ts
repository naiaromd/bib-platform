import { env } from "cloudflare:workers";
import { afterSalesActivities, businessIssues, companyContacts, eventRecords, kpiSource, trainingActivities } from "@/lib/kpi-import-data";

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
      id TEXT PRIMARY KEY, account_id TEXT NOT NULL DEFAULT '', contact_id TEXT NOT NULL DEFAULT '',
      source_id TEXT NOT NULL, owner_user_id TEXT NOT NULL, status TEXT NOT NULL,
      score INTEGER NOT NULL DEFAULT 0, next_action TEXT NOT NULL DEFAULT '',
      next_action_at TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    d1.prepare(`CREATE INDEX IF NOT EXISTS crm_leads_source_idx ON crm_leads (source_id)`),
    d1.prepare(`CREATE INDEX IF NOT EXISTS crm_leads_owner_status_idx ON crm_leads (owner_user_id, status)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS client_accounts (
      id TEXT PRIMARY KEY, legal_name TEXT NOT NULL, display_name TEXT NOT NULL,
      business_segment TEXT NOT NULL, commercial_model TEXT NOT NULL,
      account_status TEXT NOT NULL DEFAULT 'Active', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
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
    VALUES ('deployment-linna', 'linna', 'icoone Laser Med', '', '', 0, 'ใช้งานภายใต้ D2')`).run();
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

export async function GET() {
  try {
    await initialize();
    const d1 = db();
    const tasks = await d1.prepare("SELECT * FROM workspace_tasks WHERE owner_user_id = ? ORDER BY due_date, created_at").bind("nine").all();
    const target = await d1.prepare("SELECT * FROM sales_targets WHERE owner_user_id = ? AND period_key = ? AND metric_code = ?").bind("nine", "2026", "MACHINES_SOLD").first();
    const customers = await d1.prepare(`SELECT a.*, d.model AS device_model, d.serial_number,
      d.installed_at, d.status AS deployment_status FROM client_accounts a
      LEFT JOIN device_deployments d ON d.account_id = a.id
      WHERE a.account_status = 'Active' ORDER BY CASE WHEN a.id = 'linna' THEN 1 ELSE 0 END, a.display_name`).all();
    const linnaPerformance = await d1.prepare(`SELECT * FROM partner_performance_snapshots
      WHERE account_id = 'linna' ORDER BY report_month DESC LIMIT 1`).first();
    const events = await d1.prepare("SELECT * FROM kpi_event_records ORDER BY period_key, source_row").all();
    const training = await d1.prepare("SELECT * FROM training_activity_records ORDER BY activity_date DESC, source_row DESC").all();
    const afterSales = await d1.prepare("SELECT * FROM after_sales_activity_records ORDER BY CASE WHEN activity_date = '' THEN 1 ELSE 0 END, activity_date DESC, source_row DESC").all();
    const team = await d1.prepare("SELECT * FROM company_team_directory ORDER BY responsibility, display_name").all();
    const issues = await d1.prepare("SELECT * FROM business_issues ORDER BY CASE WHEN status = 'Overdue' THEN 0 ELSE 1 END, due_date").all();
    const sourceImport = await d1.prepare("SELECT * FROM source_imports WHERE id = ?").bind(kpiSource.id).first();
    return Response.json({
      user: { id: "nine", displayName: "ไนน์", role: "ผู้บริหารการขาย" },
      tasks: tasks.results, target, customers: customers.results, linnaPerformance,
      events: events.results, training: training.results, afterSales: afterSales.results,
      team: team.results, issues: issues.results, sourceImport,
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load workspace" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initialize();
    const payload = await request.json() as Record<string, unknown>;
    const d1 = db();
    if (payload.action === "create_task") {
      const title = String(payload.title || "").trim();
      const dueDate = String(payload.dueDate || "");
      if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return Response.json({ error: "กรุณาระบุชื่องานและวันที่" }, { status: 400 });
      const id = `task-${crypto.randomUUID()}`;
      await d1.prepare(`INSERT INTO workspace_tasks
        (id, owner_user_id, title, status, priority, due_date) VALUES (?, ?, ?, ?, ?, ?)`)
        .bind(id, "nine", title, "ยังไม่เริ่ม", "กลาง", dueDate).run();
      return Response.json({ ok: true, id }, { status: 201 });
    }
    if (payload.action === "update_task") {
      const id = String(payload.id || "");
      const status = String(payload.status || "");
      if (!id || !["ยังไม่เริ่ม", "กำลังทำ", "รอตรวจ", "เสร็จแล้ว"].includes(status)) return Response.json({ error: "สถานะไม่ถูกต้อง" }, { status: 400 });
      await d1.prepare("UPDATE workspace_tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND owner_user_id = ?").bind(status, id, "nine").run();
      return Response.json({ ok: true });
    }
    if (payload.action === "save_target") {
      const targetValue = Number(payload.targetValue);
      const actualValue = Number(payload.actualValue);
      if (!Number.isFinite(targetValue) || !Number.isFinite(actualValue) || targetValue < 0 || actualValue < 0 || actualValue > targetValue) return Response.json({ error: "กรุณาตรวจสอบเป้าหมายและยอดขายจริง" }, { status: 400 });
      await d1.prepare(`UPDATE sales_targets SET target_value = ?, actual_value = ?, status = 'Active',
        updated_at = CURRENT_TIMESTAMP WHERE owner_user_id = ? AND period_key = ? AND metric_code = ?`)
        .bind(targetValue, actualValue, "nine", "2026", "MACHINES_SOLD").run();
      return Response.json({ ok: true });
    }
    return Response.json({ error: "ไม่พบคำสั่ง" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to update workspace" }, { status: 500 });
  }
}
