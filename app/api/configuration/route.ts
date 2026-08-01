import { env } from "cloudflare:workers";

type TemplateKind = "field" | "document" | "task" | "workflow";

function db() {
  if (!env.DB) throw new Error("D1 binding DB is unavailable");
  return env.DB;
}

async function initialize() {
  const d1 = db();
  await d1.batch([
    d1.prepare(`CREATE TABLE IF NOT EXISTS tenant_companies (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, brand_code TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Active', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS module_definitions (
      id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, module_key TEXT NOT NULL,
      name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', sort_order INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS field_definitions (
      id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, module_key TEXT NOT NULL,
      field_key TEXT NOT NULL, label TEXT NOT NULL, field_type TEXT NOT NULL,
      required INTEGER NOT NULL DEFAULT 0, options_json TEXT NOT NULL DEFAULT '[]',
      active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS document_template_registry (
      id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, module_key TEXT NOT NULL,
      template_code TEXT NOT NULL, name TEXT NOT NULL, approval_workflow TEXT NOT NULL,
      current_version TEXT NOT NULL DEFAULT '1.0', active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS task_template_registry (
      id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, module_key TEXT NOT NULL,
      name TEXT NOT NULL, default_owner_role TEXT NOT NULL, due_offset_days INTEGER NOT NULL DEFAULT 0,
      trigger_event TEXT NOT NULL DEFAULT 'Manual', active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS workflow_definitions (
      id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, module_key TEXT NOT NULL,
      workflow_code TEXT NOT NULL, name TEXT NOT NULL, steps_json TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
  ]);
  await d1.prepare(`INSERT OR IGNORE INTO tenant_companies (id, name, brand_code)
    VALUES ('bib', 'บริษัท ไอ พลัส คิว จำกัด', 'BIB')`).run();
  const modules = [
    ["mod-crm", "crm", "ลูกค้าและโอกาสขาย", "บุคคล องค์กร และโอกาสขาย", 1],
    ["mod-customer", "customers", "ลูกค้าที่ใช้งาน", "เครื่อง สัญญา รายได้ และบริการ", 2],
    ["mod-campaign", "campaigns", "กิจกรรมและแคมเปญ", "แหล่งที่มาของผู้สนใจและต้นทุน", 3],
    ["mod-approval", "approval", "ข้อเสนอและการอนุมัติ", "เอกสาร ความเห็น และผลอนุมัติ", 4],
    ["mod-training", "training", "การฝึกอบรม", "ทักษะ ผลประเมิน และการทบทวน", 5],
    ["mod-service", "service", "บริการหลังการขาย", "แจ้งปัญหา บำรุงรักษา และอะไหล่", 6],
  ];
  for (const row of modules) {
    await d1.prepare(`INSERT OR IGNORE INTO module_definitions
      (id, tenant_id, module_key, name, description, sort_order) VALUES (?, 'bib', ?, ?, ?, ?)`).bind(...row).run();
  }
  const count = await d1.prepare("SELECT COUNT(*) AS total FROM field_definitions WHERE tenant_id = 'bib'").first<{ total: number }>();
  if (!count?.total) {
    await d1.batch([
      d1.prepare(`INSERT INTO field_definitions VALUES
        ('fld-next-action', 'bib', 'crm', 'next_action', 'ขั้นตอนถัดไป', 'text', 1, '[]', 1, CURRENT_TIMESTAMP)`),
      d1.prepare(`INSERT INTO field_definitions VALUES
        ('fld-due-date', 'bib', 'crm', 'due_date', 'วันที่ต้องติดตาม', 'date', 1, '[]', 1, CURRENT_TIMESTAMP)`),
      d1.prepare(`INSERT INTO field_definitions VALUES
        ('fld-owner', 'bib', 'crm', 'owner', 'ผู้รับผิดชอบ', 'user', 1, '[]', 1, CURRENT_TIMESTAMP)`),
      d1.prepare(`INSERT INTO field_definitions VALUES
        ('fld-task-status', 'bib', 'crm', 'task_status', 'สถานะงาน', 'select', 1, '["ยังไม่เริ่ม","กำลังดำเนินการ","เสร็จแล้ว","ติดขัด"]', 1, CURRENT_TIMESTAMP)`),
      d1.prepare(`INSERT INTO document_template_registry VALUES
        ('doc-contract-a', 'bib', 'approval', 'TERM-A', 'ข้อเสนอรูปแบบ A', 'Finance → Executive', '1.0', 1, CURRENT_TIMESTAMP)`),
      d1.prepare(`INSERT INTO document_template_registry VALUES
        ('doc-policy-memo', 'bib', 'approval', 'POLICY-MEMO', 'บันทึกนโยบายภายใน', 'Finance → Executive', '2.0', 1, CURRENT_TIMESTAMP)`),
      d1.prepare(`INSERT INTO task_template_registry VALUES
        ('task-demo-followup', 'bib', 'crm', 'ติดตามผลหลังสาธิตเครื่อง', 'Sales', 1, 'Demo completed', 1, CURRENT_TIMESTAMP)`),
      d1.prepare(`INSERT INTO task_template_registry VALUES
        ('task-contract-check', 'bib', 'approval', 'ตรวจข้อมูลก่อนส่งสัญญา', 'Finance', 0, 'Contract requested', 1, CURRENT_TIMESTAMP)`),
      d1.prepare(`INSERT INTO workflow_definitions VALUES
        ('wf-document-approval', 'bib', 'approval', 'DOCUMENT-APPROVAL', 'การตรวจและอนุมัติเอกสาร',
        '["Draft","Review","Request changes","Internal approval","E-Signature","Active"]', 1, CURRENT_TIMESTAMP)`),
    ]);
  }
}

export async function GET() {
  try {
    await initialize();
    const d1 = db();
    const [tenants, modules, fields, documents, tasks, workflows] = await Promise.all([
      d1.prepare("SELECT * FROM tenant_companies ORDER BY created_at").all(),
      d1.prepare("SELECT * FROM module_definitions WHERE tenant_id = 'bib' AND active = 1 ORDER BY sort_order").all(),
      d1.prepare("SELECT * FROM field_definitions WHERE tenant_id = 'bib' AND active = 1 ORDER BY created_at DESC").all(),
      d1.prepare("SELECT * FROM document_template_registry WHERE tenant_id = 'bib' AND active = 1 ORDER BY created_at DESC").all(),
      d1.prepare("SELECT * FROM task_template_registry WHERE tenant_id = 'bib' AND active = 1 ORDER BY created_at DESC").all(),
      d1.prepare("SELECT * FROM workflow_definitions WHERE tenant_id = 'bib' AND active = 1 ORDER BY created_at DESC").all(),
    ]);
    return Response.json({ tenants: tenants.results, modules: modules.results, fields: fields.results, documents: documents.results, tasks: tasks.results, workflows: workflows.results });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to load configuration" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initialize();
    const payload = await request.json() as {
      kind?: TemplateKind; moduleKey?: string; label?: string; fieldType?: string;
      required?: boolean; name?: string; templateCode?: string; approvalWorkflow?: string;
      ownerRole?: string; dueOffsetDays?: number; triggerEvent?: string;
      workflowCode?: string; steps?: string[];
    };
    if (!payload.kind || !payload.moduleKey) return Response.json({ error: "กรุณาระบุประเภทและโมดูล" }, { status: 400 });
    const d1 = db();
    const id = crypto.randomUUID();
    if (payload.kind === "field") {
      if (!payload.label?.trim() || !payload.fieldType) return Response.json({ error: "กรุณาระบุชื่อช่องข้อมูลและประเภท" }, { status: 400 });
      const key = payload.label.trim().toLowerCase().replace(/\s+/g, "_").slice(0, 48) + "_" + id.slice(0, 6);
      await d1.prepare(`INSERT INTO field_definitions
        (id, tenant_id, module_key, field_key, label, field_type, required)
        VALUES (?, 'bib', ?, ?, ?, ?, ?)`).bind(id, payload.moduleKey, key, payload.label.trim(), payload.fieldType, payload.required ? 1 : 0).run();
    } else if (payload.kind === "document") {
      if (!payload.name?.trim() || !payload.templateCode?.trim()) return Response.json({ error: "กรุณาระบุชื่อและรหัสแม่แบบ" }, { status: 400 });
      await d1.prepare(`INSERT INTO document_template_registry
        (id, tenant_id, module_key, template_code, name, approval_workflow)
        VALUES (?, 'bib', ?, ?, ?, ?)`).bind(id, payload.moduleKey, payload.templateCode.trim(), payload.name.trim(), payload.approvalWorkflow || "Review → Approve").run();
    } else if (payload.kind === "task") {
      if (!payload.name?.trim()) return Response.json({ error: "กรุณาระบุชื่องาน" }, { status: 400 });
      await d1.prepare(`INSERT INTO task_template_registry
        (id, tenant_id, module_key, name, default_owner_role, due_offset_days, trigger_event)
        VALUES (?, 'bib', ?, ?, ?, ?, ?)`).bind(id, payload.moduleKey, payload.name.trim(), payload.ownerRole || "Sales", Number(payload.dueOffsetDays || 0), payload.triggerEvent || "Manual").run();
    } else if (payload.kind === "workflow") {
      if (!payload.name?.trim() || !payload.workflowCode?.trim() || !payload.steps?.length) return Response.json({ error: "กรุณาระบุชื่อ รหัส และขั้นตอน" }, { status: 400 });
      await d1.prepare(`INSERT INTO workflow_definitions
        (id, tenant_id, module_key, workflow_code, name, steps_json)
        VALUES (?, 'bib', ?, ?, ?, ?)`).bind(id, payload.moduleKey, payload.workflowCode.trim(), payload.name.trim(), JSON.stringify(payload.steps)).run();
    }
    return Response.json({ ok: true, id }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unable to save configuration" }, { status: 500 });
  }
}
