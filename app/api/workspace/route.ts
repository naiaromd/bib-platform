import { env } from "cloudflare:workers";

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
}

export async function GET() {
  try {
    await initialize();
    const d1 = db();
    const tasks = await d1.prepare("SELECT * FROM workspace_tasks WHERE owner_user_id = ? ORDER BY due_date, created_at").bind("nine").all();
    const target = await d1.prepare("SELECT * FROM sales_targets WHERE owner_user_id = ? AND period_key = ? AND metric_code = ?").bind("nine", "2026", "MACHINES_SOLD").first();
    return Response.json({ user: { id: "nine", displayName: "ไนน์", role: "ผู้บริหารการขาย" }, tasks: tasks.results, target });
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
