import {
  buildUpdate,
  crmDb,
  crmErrorResponse,
  enumText,
  optionalDate,
  optionalInteger,
  optionalText,
  PayloadError,
  record,
  requireCrmActor,
  resolveLinkedAccount,
} from "../../_lib";

const stages = [
  "New", "Qualified", "Demo Requested", "Demo Scheduled", "Demo Completed",
  "Proposal", "Negotiation", "Contracting", "Closed Won", "Closed Lost", "On Hold",
] as const;
const statuses = ["Open", "Won", "Lost", "On Hold"] as const;
const commercialModels = ["", "A", "B", "C", "D", "D2"] as const;
type RouteContext = { params: Promise<{ id: string }> | { id: string } };

async function opportunityById(tenantId: string, id: string) {
  return crmDb().prepare(`SELECT id, account_id AS accountId,
    primary_contact_id AS primaryContactId, owner_user_id AS ownerUserId, name, stage,
    commercial_model AS commercialModel, expected_value_satang AS expectedValueSatang,
    probability_bps AS probabilityBps, expected_close_date AS expectedCloseDate,
    next_action AS nextAction, next_action_at AS nextActionAt, risk_note AS riskNote,
    status, created_at AS createdAt, updated_at AS updatedAt
    FROM crm_opportunities WHERE tenant_id = ? AND id = ? LIMIT 1`).bind(tenantId, id).first();
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const actor = await requireCrmActor(request);
    const { id } = await context.params;
    const existing = await opportunityById(actor.tenantId, id) as { accountId?: string } | null;
    if (!existing) return Response.json({ error: "ไม่พบโอกาสขาย" }, { status: 404 });
    await resolveLinkedAccount(actor, { accountId: existing.accountId });
    const payload = record(await request.json());
    const stage = enumText(payload.stage, "ขั้นตอนการขาย", stages);
    const explicitStatus = enumText(payload.status, "สถานะโอกาสขาย", statuses);
    const inferredStatus = stage === "Closed Won" ? "Won" : stage === "Closed Lost" ? "Lost" : undefined;
    const fields = {
      name: optionalText(payload.name, "ชื่อโอกาสขาย", 300),
      owner_user_id: optionalText(payload.ownerUserId, "ผู้รับผิดชอบ", 160),
      stage,
      commercial_model: enumText(payload.commercialModel, "รูปแบบการค้า", commercialModels),
      expected_value_satang: optionalInteger(payload.expectedValueSatang, "มูลค่าคาดการณ์", 0, 1_000_000_000_00),
      probability_bps: optionalInteger(payload.probabilityBps, "ความน่าจะเป็น", 0, 10_000),
      expected_close_date: optionalDate(payload.expectedCloseDate, "วันที่คาดว่าจะปิดการขาย"),
      next_action: optionalText(payload.nextAction, "งานถัดไป", 500),
      next_action_at: optionalDate(payload.nextActionAt, "กำหนดงานถัดไป"),
      risk_note: optionalText(payload.riskNote, "ความเสี่ยง", 1000),
      status: explicitStatus || inferredStatus,
    };
    if (Object.values(fields).every((value) => value === undefined)) {
      throw new PayloadError("ไม่มีข้อมูลที่ต้องการแก้ไข");
    }
    const update = buildUpdate({ ...fields, updated_at: new Date().toISOString() });
    await crmDb().prepare(`UPDATE crm_opportunities SET ${update.sql}
      WHERE tenant_id = ? AND id = ?`).bind(...update.values, actor.tenantId, id).run();
    return Response.json({ opportunity: await opportunityById(actor.tenantId, id) });
  } catch (error) {
    return crmErrorResponse(error);
  }
}
