import {
  assertAccountAccess,
  crmDb,
  crmErrorResponse,
  requireCrmActor,
} from "../../_lib";

type RouteContext = { params: Promise<{ id: string }> | { id: string } };

export async function GET(request: Request, context: RouteContext) {
  try {
    const actor = await requireCrmActor(request);
    const { id } = await context.params;
    await assertAccountAccess(actor, id);
    const d1 = crmDb();

    const [account, contacts, leads, opportunities, activities, tasks, demos] = await Promise.all([
      d1.prepare(`SELECT id, legal_name AS legalName, display_name AS displayName,
        business_segment AS businessSegment, province, commercial_model AS commercialModel,
        account_status AS accountStatus, created_at AS createdAt
        FROM client_accounts WHERE tenant_id = ? AND id = ? LIMIT 1`)
        .bind(actor.tenantId, id).first(),
      d1.prepare(`SELECT id, email, display_name AS displayName,
        position_title AS positionTitle, buying_role AS buyingRole,
        portal_role AS portalRole, phone, line_id AS lineId,
        preferred_channel AS preferredChannel, decision_level AS decisionLevel,
        consent_status AS consentStatus, notes, active, updated_at AS updatedAt
        FROM client_contacts
        WHERE tenant_id = ? AND account_id = ? ORDER BY active DESC, display_name`)
        .bind(actor.tenantId, id).all(),
      d1.prepare(`SELECT l.id, l.contact_id AS contactId, c.display_name AS contactName,
        l.source_id AS sourceId, s.name AS sourceName, l.owner_user_id AS ownerUserId,
        l.status, l.score, l.temperature, l.evidence_json AS evidenceJson,
        l.last_contact_at AS lastContactAt, l.next_action AS nextAction,
        l.next_action_at AS nextActionAt, l.created_at AS createdAt, l.updated_at AS updatedAt
        FROM crm_leads l
        LEFT JOIN client_contacts c ON c.tenant_id = l.tenant_id AND c.id = l.contact_id
        LEFT JOIN lead_sources s ON s.tenant_id = l.tenant_id AND s.id = l.source_id
        WHERE l.tenant_id = ? AND l.account_id = ? ORDER BY l.updated_at DESC`)
        .bind(actor.tenantId, id).all(),
      d1.prepare(`SELECT o.id, o.primary_contact_id AS primaryContactId,
        c.display_name AS primaryContactName, o.owner_user_id AS ownerUserId, o.name,
        o.stage, o.commercial_model AS commercialModel,
        o.expected_value_satang AS expectedValueSatang, o.probability_bps AS probabilityBps,
        o.expected_close_date AS expectedCloseDate, o.next_action AS nextAction,
        o.next_action_at AS nextActionAt, o.risk_note AS riskNote, o.status,
        o.created_at AS createdAt, o.updated_at AS updatedAt
        FROM crm_opportunities o
        LEFT JOIN client_contacts c ON c.tenant_id = o.tenant_id AND c.id = o.primary_contact_id
        WHERE o.tenant_id = ? AND o.account_id = ? ORDER BY o.updated_at DESC`)
        .bind(actor.tenantId, id).all(),
      d1.prepare(`SELECT id, contact_id AS contactId, lead_id AS leadId,
        opportunity_id AS opportunityId, activity_type AS activityType, channel,
        summary, outcome, occurred_at AS occurredAt, owner_user_id AS ownerUserId,
        source_record_id AS sourceRecordId, created_at AS createdAt
        FROM crm_activities WHERE tenant_id = ? AND account_id = ?
        ORDER BY occurred_at DESC`).bind(actor.tenantId, id).all(),
      d1.prepare(`SELECT id, owner_user_id AS ownerUserId, lead_id AS leadId,
        source_id AS sourceId, title, status, priority, due_date AS dueDate,
        created_at AS createdAt, updated_at AS updatedAt
        FROM workspace_tasks WHERE tenant_id = ? AND account_id = ?
        ORDER BY due_date, updated_at DESC`).bind(actor.tenantId, id).all(),
      d1.prepare(`SELECT d.id, d.lead_id AS leadId, d.opportunity_id AS opportunityId,
        d.location_type AS locationType, d.site_id AS siteId, d.scheduled_at AS scheduledAt,
        d.decision_maker_attending AS decisionMakerAttending,
        d.qualification_score AS qualificationScore, d.approval_status AS approvalStatus,
        d.status, d.created_at AS createdAt, d.updated_at AS updatedAt
        FROM demo_appointments d
        LEFT JOIN crm_leads l ON l.tenant_id = d.tenant_id AND l.id = d.lead_id
        LEFT JOIN crm_opportunities o ON o.tenant_id = d.tenant_id AND o.id = d.opportunity_id
        WHERE d.tenant_id = ? AND COALESCE(o.account_id, l.account_id) = ?
        ORDER BY CASE WHEN d.scheduled_at = '' THEN 1 ELSE 0 END, d.scheduled_at`)
        .bind(actor.tenantId, id).all(),
    ]);

    const timeline = [
      ...activities.results.map((item) => ({
        type: "activity", date: String(item.occurredAt || item.createdAt || ""), data: item,
      })),
      ...tasks.results.map((item) => ({
        type: "task", date: String(item.dueDate || item.updatedAt || ""), data: item,
      })),
      ...demos.results.map((item) => ({
        type: "demo", date: String(item.scheduledAt || item.createdAt || ""), data: item,
      })),
    ].sort((a, b) => b.date.localeCompare(a.date));

    return Response.json({
      account,
      contacts: contacts.results,
      leads: leads.results,
      opportunities: opportunities.results,
      activities: activities.results,
      tasks: tasks.results,
      demos: demos.results,
      timeline,
    });
  } catch (error) {
    return crmErrorResponse(error);
  }
}
