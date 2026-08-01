import {
  buildUpdate,
  crmDb,
  crmErrorResponse,
  enumText,
  newId,
  optionalDate,
  optionalText,
  PayloadError,
  record,
  requiredText,
  requireCrmActor,
  resolveLinkedAccount,
} from "../_lib";

const taskStatuses = ["ยังไม่เริ่ม", "กำลังทำ", "เสร็จแล้ว", "ยกเลิก"] as const;
const priorities = ["ต่ำ", "กลาง", "สูง", "เร่งด่วน"] as const;

async function taskById(tenantId: string, id: string) {
  return crmDb().prepare(`SELECT id, owner_user_id AS ownerUserId, account_id AS accountId,
    lead_id AS leadId, source_id AS sourceId, title, status, priority, due_date AS dueDate,
    created_at AS createdAt, updated_at AS updatedAt
    FROM workspace_tasks WHERE tenant_id = ? AND id = ? LIMIT 1`).bind(tenantId, id).first();
}

export async function POST(request: Request) {
  try {
    const actor = await requireCrmActor(request);
    const payload = record(await request.json());
    const accountInput = optionalText(payload.accountId, "บัญชีลูกค้า", 120);
    const leadId = optionalText(payload.leadId, "ลีด", 120);
    const accountId = await resolveLinkedAccount(actor, { accountId: accountInput, leadId });
    const id = newId("task");
    const dueDate = optionalDate(payload.dueDate, "วันครบกำหนด", false);
    if (!dueDate) throw new PayloadError("กรุณาระบุวันครบกำหนด");
    const title = requiredText(payload.title, "ชื่องาน", 300);
    const status = enumText(payload.status ?? "ยังไม่เริ่ม", "สถานะงาน", taskStatuses, true)!;
    const priority = enumText(payload.priority ?? "กลาง", "ลำดับความสำคัญ", priorities, true)!;
    const ownerUserId = optionalText(payload.ownerUserId, "ผู้รับผิดชอบ", 160) || actor.displayName;
    const sourceId = optionalText(payload.sourceId, "ข้อมูลต้นทาง", 120) || "";
    await crmDb().prepare(`INSERT INTO workspace_tasks
      (id, tenant_id, owner_user_id, account_id, lead_id, source_id, title, status, priority, due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(id, actor.tenantId, ownerUserId, accountId, leadId || "", sourceId,
        title, status, priority, dueDate).run();
    return Response.json({ task: await taskById(actor.tenantId, id) }, { status: 201 });
  } catch (error) {
    return crmErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const actor = await requireCrmActor(request);
    const payload = record(await request.json());
    const id = requiredText(payload.id, "รหัสงาน", 120);
    const existing = await taskById(actor.tenantId, id) as { accountId?: string; leadId?: string } | null;
    if (!existing) return Response.json({ error: "ไม่พบงาน" }, { status: 404 });
    await resolveLinkedAccount(actor, { accountId: existing.accountId, leadId: existing.leadId });
    const fields = {
      title: optionalText(payload.title, "ชื่องาน", 300),
      status: enumText(payload.status, "สถานะงาน", taskStatuses),
      priority: enumText(payload.priority, "ลำดับความสำคัญ", priorities),
      due_date: optionalDate(payload.dueDate, "วันครบกำหนด", false),
      owner_user_id: optionalText(payload.ownerUserId, "ผู้รับผิดชอบ", 160),
    };
    if (Object.values(fields).every((value) => value === undefined)) {
      throw new PayloadError("ไม่มีข้อมูลที่ต้องการแก้ไข");
    }
    const update = buildUpdate({ ...fields, updated_at: new Date().toISOString() });
    await crmDb().prepare(`UPDATE workspace_tasks SET ${update.sql}
      WHERE tenant_id = ? AND id = ?`).bind(...update.values, actor.tenantId, id).run();
    return Response.json({ task: await taskById(actor.tenantId, id) });
  } catch (error) {
    return crmErrorResponse(error);
  }
}
