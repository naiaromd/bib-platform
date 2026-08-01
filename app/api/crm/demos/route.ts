import {
  buildUpdate,
  crmDb,
  crmErrorResponse,
  enumText,
  newId,
  optionalBoolean,
  optionalDate,
  optionalInteger,
  optionalText,
  PayloadError,
  record,
  requiredText,
  requireCrmActor,
  resolveLinkedAccount,
} from "../_lib";

const locationTypes = ["On-site", "BIB Experience Center", "Event", "Online"] as const;
const approvalStatuses = ["Pending", "Approved", "Rejected", "Needs qualification"] as const;
const demoStatuses = ["Requested", "Scheduling", "Scheduled", "Completed", "Cancelled", "No-show"] as const;

async function demoById(tenantId: string, id: string) {
  return crmDb().prepare(`SELECT d.id, d.lead_id AS leadId, d.opportunity_id AS opportunityId,
    COALESCE(o.account_id, l.account_id) AS accountId,
    d.location_type AS locationType, d.site_id AS siteId, d.scheduled_at AS scheduledAt,
    d.decision_maker_attending AS decisionMakerAttending,
    d.qualification_score AS qualificationScore, d.approval_status AS approvalStatus,
    d.status, d.created_at AS createdAt, d.updated_at AS updatedAt
    FROM demo_appointments d
    LEFT JOIN crm_leads l ON l.tenant_id = d.tenant_id AND l.id = d.lead_id
    LEFT JOIN crm_opportunities o ON o.tenant_id = d.tenant_id AND o.id = d.opportunity_id
    WHERE d.tenant_id = ? AND d.id = ? LIMIT 1`).bind(tenantId, id).first();
}

export async function POST(request: Request) {
  try {
    const actor = await requireCrmActor(request);
    const payload = record(await request.json());
    const leadId = requiredText(payload.leadId, "ลีด", 120);
    const opportunityId = optionalText(payload.opportunityId, "โอกาสขาย", 120);
    await resolveLinkedAccount(actor, { leadId, opportunityId });
    const id = newId("demo");
    const locationType = enumText(payload.locationType, "สถานที่สาธิต", locationTypes, true)!;
    const siteId = optionalText(payload.siteId, "สถานที่", 120) || "";
    const scheduledAt = optionalDate(payload.scheduledAt, "วันและเวลาสาธิต") || "";
    const decisionMakerAttending = optionalBoolean(payload.decisionMakerAttending, "การเข้าร่วมของผู้มีอำนาจ") ?? false;
    const qualificationScore = optionalInteger(payload.qualificationScore, "คะแนนคุณภาพ", 0, 100) ?? 0;
    const approvalStatus = enumText(payload.approvalStatus ?? "Pending", "สถานะอนุมัติ", approvalStatuses, true)!;
    const status = enumText(payload.status ?? "Requested", "สถานะสาธิต", demoStatuses, true)!;
    if (status === "Scheduled" && !scheduledAt) throw new PayloadError("กรุณาระบุวันและเวลาสาธิต");

    await crmDb().prepare(`INSERT INTO demo_appointments
      (id, tenant_id, lead_id, opportunity_id, location_type, site_id, scheduled_at,
       decision_maker_attending, qualification_score, approval_status, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(id, actor.tenantId, leadId, opportunityId || "", locationType, siteId,
        scheduledAt, decisionMakerAttending ? 1 : 0, qualificationScore, approvalStatus, status).run();
    return Response.json({ demo: await demoById(actor.tenantId, id) }, { status: 201 });
  } catch (error) {
    return crmErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const actor = await requireCrmActor(request);
    const payload = record(await request.json());
    const id = requiredText(payload.id, "รหัสนัดสาธิต", 120);
    const existing = await demoById(actor.tenantId, id) as {
      accountId?: string;
      scheduledAt?: string;
      status?: string;
    } | null;
    if (!existing) return Response.json({ error: "ไม่พบนัดสาธิต" }, { status: 404 });
    await resolveLinkedAccount(actor, { accountId: existing.accountId });

    const status = enumText(payload.status, "สถานะสาธิต", demoStatuses);
    const scheduledAt = optionalDate(payload.scheduledAt, "วันและเวลาสาธิต");
    if (status === "Scheduled" && !(scheduledAt ?? existing.scheduledAt)) {
      throw new PayloadError("กรุณาระบุวันและเวลาสาธิต");
    }
    const decisionMakerAttending = optionalBoolean(payload.decisionMakerAttending, "การเข้าร่วมของผู้มีอำนาจ");
    const fields = {
      location_type: enumText(payload.locationType, "สถานที่สาธิต", locationTypes),
      site_id: optionalText(payload.siteId, "สถานที่", 120),
      scheduled_at: scheduledAt,
      decision_maker_attending: decisionMakerAttending === undefined ? undefined : decisionMakerAttending ? 1 : 0,
      qualification_score: optionalInteger(payload.qualificationScore, "คะแนนคุณภาพ", 0, 100),
      approval_status: enumText(payload.approvalStatus, "สถานะอนุมัติ", approvalStatuses),
      status,
    };
    if (Object.values(fields).every((value) => value === undefined)) {
      throw new PayloadError("ไม่มีข้อมูลที่ต้องการแก้ไข");
    }
    const update = buildUpdate({ ...fields, updated_at: new Date().toISOString() });
    await crmDb().prepare(`UPDATE demo_appointments SET ${update.sql}
      WHERE tenant_id = ? AND id = ?`).bind(...update.values, actor.tenantId, id).run();
    return Response.json({ demo: await demoById(actor.tenantId, id) });
  } catch (error) {
    return crmErrorResponse(error);
  }
}
