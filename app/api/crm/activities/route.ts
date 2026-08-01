import {
  buildUpdate,
  crmDb,
  crmErrorResponse,
  newId,
  optionalDate,
  optionalText,
  record,
  requiredText,
  requireCrmActor,
  resolveLinkedAccount,
} from "../_lib";

async function activityById(tenantId: string, id: string) {
  return crmDb().prepare(`SELECT id, account_id AS accountId, contact_id AS contactId,
    lead_id AS leadId, opportunity_id AS opportunityId, activity_type AS activityType,
    channel, summary, outcome, occurred_at AS occurredAt, owner_user_id AS ownerUserId,
    source_record_id AS sourceRecordId, created_at AS createdAt
    FROM crm_activities WHERE tenant_id = ? AND id = ? LIMIT 1`).bind(tenantId, id).first();
}

export async function POST(request: Request) {
  try {
    const actor = await requireCrmActor(request);
    const payload = record(await request.json());
    const links = {
      accountId: optionalText(payload.accountId, "บัญชีลูกค้า", 120),
      contactId: optionalText(payload.contactId, "ผู้ติดต่อ", 120),
      leadId: optionalText(payload.leadId, "ลีด", 120),
      opportunityId: optionalText(payload.opportunityId, "โอกาสขาย", 120),
    };
    const accountId = await resolveLinkedAccount(actor, links);
    const id = newId("activity");
    const occurredAt = optionalDate(payload.occurredAt, "วันและเวลากิจกรรม") || new Date().toISOString();
    const activityType = requiredText(payload.activityType, "ประเภทกิจกรรม", 80);
    const channel = optionalText(payload.channel, "ช่องทาง", 80) || "";
    const summary = requiredText(payload.summary, "สรุปกิจกรรม", 1000);
    const outcome = optionalText(payload.outcome, "ผลลัพธ์", 1000) || "";
    const ownerUserId = optionalText(payload.ownerUserId, "ผู้รับผิดชอบ", 160) || actor.displayName;
    const sourceRecordId = optionalText(payload.sourceRecordId, "ข้อมูลต้นทาง", 120) || "";

    await crmDb().prepare(`INSERT INTO crm_activities
      (id, tenant_id, account_id, contact_id, lead_id, opportunity_id, activity_type,
       channel, summary, outcome, occurred_at, owner_user_id, source_record_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(id, actor.tenantId, accountId, links.contactId || "", links.leadId || "",
        links.opportunityId || "", activityType, channel, summary, outcome,
        occurredAt, ownerUserId, sourceRecordId).run();
    return Response.json({ activity: await activityById(actor.tenantId, id) }, { status: 201 });
  } catch (error) {
    return crmErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const actor = await requireCrmActor(request);
    const payload = record(await request.json());
    const id = requiredText(payload.id, "รหัสกิจกรรม", 120);
    const existing = await activityById(actor.tenantId, id) as { accountId?: string } | null;
    if (!existing) return Response.json({ error: "ไม่พบกิจกรรม" }, { status: 404 });
    await resolveLinkedAccount(actor, { accountId: existing.accountId });
    const update = buildUpdate({
      activity_type: optionalText(payload.activityType, "ประเภทกิจกรรม", 80),
      channel: optionalText(payload.channel, "ช่องทาง", 80),
      summary: optionalText(payload.summary, "สรุปกิจกรรม", 1000),
      outcome: optionalText(payload.outcome, "ผลลัพธ์", 1000),
      occurred_at: optionalDate(payload.occurredAt, "วันและเวลากิจกรรม", false),
      owner_user_id: optionalText(payload.ownerUserId, "ผู้รับผิดชอบ", 160),
    });
    await crmDb().prepare(`UPDATE crm_activities SET ${update.sql}
      WHERE tenant_id = ? AND id = ?`).bind(...update.values, actor.tenantId, id).run();
    return Response.json({ activity: await activityById(actor.tenantId, id) });
  } catch (error) {
    return crmErrorResponse(error);
  }
}
