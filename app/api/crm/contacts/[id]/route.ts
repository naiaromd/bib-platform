import {
  buildUpdate,
  crmDb,
  crmErrorResponse,
  enumText,
  optionalBoolean,
  optionalText,
  record,
  requireCrmActor,
  resolveLinkedAccount,
  PayloadError,
} from "../../_lib";

type RouteContext = { params: Promise<{ id: string }> | { id: string } };

const preferredChannels = ["LINE", "โทรศัพท์", "อีเมล", "พบที่สถานที่", "ประชุมออนไลน์"] as const;
const decisionLevels = ["ผู้ตัดสินใจ", "ผู้มีอิทธิพล", "ผู้ประเมิน", "ผู้ประสานงาน", "ยังไม่ยืนยัน"] as const;
const consentStatuses = ["ติดต่อได้", "รอยืนยัน", "ไม่ประสงค์รับการติดต่อ", "ยังไม่ยืนยัน"] as const;

export async function PUT(request: Request, context: RouteContext) {
  try {
    const actor = await requireCrmActor(request);
    const { id } = await context.params;
    const current = await crmDb().prepare(`SELECT id, account_id AS accountId
      FROM client_contacts WHERE tenant_id = ? AND id = ? LIMIT 1`)
      .bind(actor.tenantId, id).first<{ id: string; accountId: string }>();
    if (!current) throw new PayloadError("ไม่พบข้อมูลผู้ติดต่อ", 404);
    await resolveLinkedAccount(actor, { accountId: current.accountId, contactId: id });

    const payload = record(await request.json());
    const email = optionalText(payload.email, "อีเมล", 180);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new PayloadError("รูปแบบอีเมลไม่ถูกต้อง");
    }
    const update = buildUpdate({
      display_name: optionalText(payload.displayName, "ชื่อผู้ติดต่อ", 160),
      position_title: optionalText(payload.positionTitle, "ตำแหน่ง", 160),
      buying_role: optionalText(payload.buyingRole, "บทบาทในการตัดสินใจ", 160),
      phone: optionalText(payload.phone, "เบอร์โทร", 40),
      email,
      line_id: optionalText(payload.lineId, "LINE ID", 100),
      preferred_channel: enumText(payload.preferredChannel, "ช่องทางที่สะดวก", preferredChannels),
      decision_level: enumText(payload.decisionLevel, "ระดับการตัดสินใจ", decisionLevels),
      consent_status: enumText(payload.consentStatus, "สถานะการติดต่อ", consentStatuses),
      notes: optionalText(payload.notes, "บันทึกผู้ติดต่อ", 1_200),
      active: optionalBoolean(payload.active, "สถานะใช้งาน") === undefined
        ? undefined
        : payload.active ? 1 : 0,
      updated_at: new Date().toISOString(),
    });
    await crmDb().prepare(`UPDATE client_contacts SET ${update.sql}
      WHERE tenant_id = ? AND id = ?`).bind(...update.values, actor.tenantId, id).run();
    return Response.json({ ok: true, id, accountId: current.accountId });
  } catch (error) {
    return crmErrorResponse(error);
  }
}
