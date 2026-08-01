import {
  accountScopeSql,
  boundedLimit,
  crmDb,
  crmErrorResponse,
  requireCrmActor,
} from "../_lib";

export async function GET(request: Request) {
  try {
    const actor = await requireCrmActor(request);
    const d1 = crmDb();
    const url = new URL(request.url);
    const limit = boundedLimit(url);
    const requestedAccount = (url.searchParams.get("accountId") || "").trim();
    if (requestedAccount && actor.accountScope !== "*" && requestedAccount !== actor.accountScope) {
      return Response.json({ error: "ไม่มีสิทธิ์เข้าถึงข้อมูลลูกค้านี้" }, { status: 403 });
    }
    const accountId = requestedAccount || (actor.accountScope === "*" ? "" : actor.accountScope);
    const owner = (url.searchParams.get("owner") || "").trim();
    const stage = (url.searchParams.get("stage") || "").trim();
    const status = (url.searchParams.get("status") || "").trim();
    const q = (url.searchParams.get("q") || "").trim().slice(0, 100);
    const like = `%${q}%`;

    const accountWhere = ["a.tenant_id = ?"];
    const accountValues: unknown[] = [actor.tenantId];
    if (accountId) { accountWhere.push("a.id = ?"); accountValues.push(accountId); }
    if (q) {
      accountWhere.push(`(a.display_name LIKE ? OR a.legal_name LIKE ? OR EXISTS (
        SELECT 1 FROM client_contacts cq WHERE cq.tenant_id = a.tenant_id
        AND cq.account_id = a.id AND cq.display_name LIKE ?))`);
      accountValues.push(like, like, like);
    }

    const entityFilter = (
      accountColumn: string,
      ownerColumn?: string,
      statusColumn?: string,
      searchColumns: string[] = [],
    ) => {
      const clauses: string[] = [];
      const values: unknown[] = [];
      if (accountId) { clauses.push(`${accountColumn} = ?`); values.push(accountId); }
      if (owner && ownerColumn) { clauses.push(`${ownerColumn} = ?`); values.push(owner); }
      if (status && statusColumn) { clauses.push(`${statusColumn} = ?`); values.push(status); }
      if (q && searchColumns.length) {
        clauses.push(`(${searchColumns.map((column) => `${column} LIKE ?`).join(" OR ")})`);
        values.push(...searchColumns.map(() => like));
      }
      return { sql: clauses.length ? ` AND ${clauses.join(" AND ")}` : "", values };
    };

    const leadFilter = entityFilter("l.account_id", "l.owner_user_id", "l.status", ["a.display_name", "c.display_name"]);
    const opportunityFilter = entityFilter("o.account_id", "o.owner_user_id", "o.status", ["a.display_name", "c.display_name", "o.name"]);
    const taskFilter = entityFilter("t.account_id", "t.owner_user_id", "t.status", ["a.display_name", "t.title"]);
    const activityFilter = entityFilter("x.account_id", "x.owner_user_id", undefined, ["a.display_name", "x.summary"]);
    const demoFilter = entityFilter("COALESCE(o.account_id, l.account_id)", undefined, undefined, ["a.display_name"]);
    const activityScope = accountScopeSql(actor, "x.account_id");
    const taskScope = accountScopeSql(actor, "t.account_id");
    const leadScope = accountScopeSql(actor, "l.account_id");
    const opportunityScope = accountScopeSql(actor, "o.account_id");
    const demoScope = accountScopeSql(actor, "COALESCE(o.account_id, l.account_id)");

    const [accounts, leads, opportunities, activities, tasks, demos] = await Promise.all([
      d1.prepare(`SELECT a.id, a.legal_name AS legalName, a.display_name AS displayName,
        a.business_segment AS businessSegment, a.province, a.commercial_model AS commercialModel,
        a.account_status AS accountStatus, a.created_at AS createdAt,
        COUNT(DISTINCT c.id) AS contactCount, COUNT(DISTINCT o.id) AS opportunityCount
        FROM client_accounts a
        LEFT JOIN client_contacts c ON c.tenant_id = a.tenant_id AND c.account_id = a.id
        LEFT JOIN crm_opportunities o ON o.tenant_id = a.tenant_id AND o.account_id = a.id
        WHERE ${accountWhere.join(" AND ")}
        GROUP BY a.id ORDER BY a.display_name LIMIT ?`).bind(...accountValues, limit).all(),
      d1.prepare(`SELECT l.id, l.account_id AS accountId, a.display_name AS accountName,
        l.contact_id AS contactId, c.display_name AS contactName, c.buying_role AS buyingRole,
        l.source_id AS sourceId, s.name AS sourceName, l.owner_user_id AS ownerUserId,
        l.status, l.score, l.temperature, l.evidence_json AS evidenceJson,
        l.last_contact_at AS lastContactAt, l.next_action AS nextAction,
        l.next_action_at AS nextActionAt, l.created_at AS createdAt, l.updated_at AS updatedAt
        FROM crm_leads l
        LEFT JOIN client_accounts a ON a.tenant_id = l.tenant_id AND a.id = l.account_id
        LEFT JOIN client_contacts c ON c.tenant_id = l.tenant_id AND c.id = l.contact_id
        LEFT JOIN lead_sources s ON s.tenant_id = l.tenant_id AND s.id = l.source_id
        WHERE l.tenant_id = ?${leadScope.sql}${leadFilter.sql}
        ORDER BY l.next_action_at, l.updated_at DESC LIMIT ?`)
        .bind(actor.tenantId, ...leadScope.values, ...leadFilter.values, limit).all(),
      d1.prepare(`SELECT o.id, o.account_id AS accountId, a.display_name AS accountName,
        o.primary_contact_id AS primaryContactId, c.display_name AS primaryContactName,
        o.owner_user_id AS ownerUserId, o.name, o.stage, o.commercial_model AS commercialModel,
        o.expected_value_satang AS expectedValueSatang, o.probability_bps AS probabilityBps,
        o.expected_close_date AS expectedCloseDate, o.next_action AS nextAction,
        o.next_action_at AS nextActionAt, o.risk_note AS riskNote, o.status,
        o.created_at AS createdAt, o.updated_at AS updatedAt
        FROM crm_opportunities o
        LEFT JOIN client_accounts a ON a.tenant_id = o.tenant_id AND a.id = o.account_id
        LEFT JOIN client_contacts c ON c.tenant_id = o.tenant_id AND c.id = o.primary_contact_id
        WHERE o.tenant_id = ?${opportunityScope.sql}${opportunityFilter.sql}${stage ? " AND o.stage = ?" : ""}
        ORDER BY o.expected_close_date, o.updated_at DESC LIMIT ?`)
        .bind(actor.tenantId, ...opportunityScope.values, ...opportunityFilter.values, ...(stage ? [stage] : []), limit).all(),
      d1.prepare(`SELECT x.id, x.account_id AS accountId, a.display_name AS accountName,
        x.contact_id AS contactId, x.lead_id AS leadId, x.opportunity_id AS opportunityId,
        x.activity_type AS activityType, x.channel, x.summary, x.outcome,
        x.occurred_at AS occurredAt, x.owner_user_id AS ownerUserId,
        x.source_record_id AS sourceRecordId, x.created_at AS createdAt
        FROM crm_activities x
        LEFT JOIN client_accounts a ON a.tenant_id = x.tenant_id AND a.id = x.account_id
        WHERE x.tenant_id = ?${activityScope.sql}${activityFilter.sql}
        ORDER BY x.occurred_at DESC LIMIT ?`)
        .bind(actor.tenantId, ...activityScope.values, ...activityFilter.values, limit).all(),
      d1.prepare(`SELECT t.id, t.owner_user_id AS ownerUserId, t.account_id AS accountId,
        a.display_name AS accountName, t.lead_id AS leadId, t.source_id AS sourceId,
        t.title, t.status, t.priority, t.due_date AS dueDate,
        t.created_at AS createdAt, t.updated_at AS updatedAt
        FROM workspace_tasks t
        LEFT JOIN client_accounts a ON a.tenant_id = t.tenant_id AND a.id = t.account_id
        WHERE t.tenant_id = ?${taskScope.sql}${taskFilter.sql}
        ORDER BY t.due_date, t.updated_at DESC LIMIT ?`)
        .bind(actor.tenantId, ...taskScope.values, ...taskFilter.values, limit).all(),
      d1.prepare(`SELECT d.id, d.lead_id AS leadId, d.opportunity_id AS opportunityId,
        COALESCE(o.account_id, l.account_id) AS accountId, a.display_name AS accountName,
        d.location_type AS locationType, d.site_id AS siteId, d.scheduled_at AS scheduledAt,
        d.decision_maker_attending AS decisionMakerAttending,
        d.qualification_score AS qualificationScore, d.approval_status AS approvalStatus,
        d.status, d.created_at AS createdAt, d.updated_at AS updatedAt
        FROM demo_appointments d
        LEFT JOIN crm_leads l ON l.tenant_id = d.tenant_id AND l.id = d.lead_id
        LEFT JOIN crm_opportunities o ON o.tenant_id = d.tenant_id AND o.id = d.opportunity_id
        LEFT JOIN client_accounts a ON a.tenant_id = d.tenant_id
          AND a.id = COALESCE(o.account_id, l.account_id)
        WHERE d.tenant_id = ?${demoScope.sql}${demoFilter.sql}${status ? " AND d.status = ?" : ""}
        ORDER BY CASE WHEN d.scheduled_at = '' THEN 1 ELSE 0 END, d.scheduled_at LIMIT ?`)
        .bind(actor.tenantId, ...demoScope.values, ...demoFilter.values, ...(status ? [status] : []), limit).all(),
    ]);

    return Response.json({
      actor: { displayName: actor.displayName, role: actor.role, accountScope: actor.accountScope },
      accounts: accounts.results,
      leads: leads.results,
      opportunities: opportunities.results,
      activities: activities.results,
      tasks: tasks.results,
      demos: demos.results,
      counts: {
        accounts: accounts.results.length,
        leads: leads.results.length,
        opportunities: opportunities.results.length,
        activities: activities.results.length,
        tasks: tasks.results.length,
        demos: demos.results.length,
      },
    });
  } catch (error) {
    return crmErrorResponse(error);
  }
}
