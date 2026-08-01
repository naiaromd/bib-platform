import { env } from "cloudflare:workers";

function db() {
  if (!env.DB) throw new Error("D1 binding DB is unavailable");
  return env.DB;
}

function text(value: unknown, max = 200) {
  return String(value || "").trim().slice(0, max);
}

export async function POST(request: Request) {
  try {
    const payload = await request.json() as Record<string, unknown>;
    const contactName = text(payload.contactName, 120);
    const organizationName = text(payload.organizationName, 180);
    const phone = text(payload.phone, 40);
    const email = text(payload.email, 160).toLowerCase();
    const segment = text(payload.segment, 80);
    const buyingRole = text(payload.buyingRole, 80);
    const goal = text(payload.goal, 160);
    const locationType = payload.locationType === "On-site" ? "On-site" : "BIB Experience Center";
    const timeline = text(payload.timeline, 80);
    const siteReady = payload.siteReady === true;
    const consent = payload.consent === true;

    if (!contactName || !organizationName || !phone || !segment || !buyingRole || !consent) {
      return Response.json({ error: "กรุณากรอกข้อมูลที่จำเป็นและยืนยันความยินยอม" }, { status: 400 });
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return Response.json({ error: "รูปแบบอีเมลไม่ถูกต้อง" }, { status: 400 });
    }

    let score = 20; // ยืนยันองค์กร/ผู้ติดต่อ และส่งคำขอสาธิต
    if (["เจ้าของกิจการ", "แพทย์ผู้ตัดสินใจ", "ผู้บริหาร"].includes(buyingRole)) score += 5;
    if (["ภายใน 3 เดือน", "3–6 เดือน"].includes(timeline)) score += 10;
    if (locationType === "On-site" && !siteReady) score -= 20;
    const temperature = score >= 60 ? "Hot" : score >= 30 ? "Warm" : "Cold";
    const approvalStatus = locationType === "On-site" && (!siteReady || score < 30) ? "Needs qualification" : "Pending";
    const now = new Date().toISOString();
    const accountId = `account-${crypto.randomUUID()}`;
    const contactId = `contact-${crypto.randomUUID()}`;
    const leadId = `lead-${crypto.randomUUID()}`;
    const opportunityId = `opp-${crypto.randomUUID()}`;
    const demoId = `demo-${crypto.randomUUID()}`;
    const d1 = db();

    await d1.batch([
      d1.prepare(`INSERT OR IGNORE INTO lead_sources
        (id, tenant_id, source_type, name, owner_user_id, status)
        VALUES ('SRC-WEB-DEMO', 'bib', 'Online', 'icoone Discovery Demo Request', 'ทีมขาย', 'Active')`),
      d1.prepare(`INSERT INTO client_accounts
        (id, tenant_id, legal_name, display_name, business_segment, province, commercial_model, account_status)
        VALUES (?, 'bib', ?, ?, ?, '', '', 'Prospect')`).bind(accountId, organizationName, organizationName, segment),
      d1.prepare(`INSERT INTO client_contacts
        (id, tenant_id, account_id, email, display_name, buying_role, portal_role)
        VALUES (?, 'bib', ?, ?, ?, ?, 'Contact')`).bind(contactId, accountId, email, contactName, buyingRole),
      d1.prepare(`INSERT INTO crm_leads
        (id, tenant_id, account_id, contact_id, source_id, owner_user_id, status, score,
         temperature, evidence_json, last_contact_at, next_action, next_action_at)
        VALUES (?, 'bib', ?, ?, 'SRC-WEB-DEMO', 'ทีมขาย', 'Demo Requested', ?, ?, ?, ?, 'ติดต่อเพื่อยืนยันนัดสาธิต', ?)`)
        .bind(leadId, accountId, contactId, score, temperature, JSON.stringify(["ส่งข้อมูลติดต่อและองค์กร", `ขอสาธิตแบบ ${locationType}`, `เป้าหมาย: ${goal}`]), now, now),
      d1.prepare(`INSERT INTO crm_opportunities
        (id, tenant_id, account_id, primary_contact_id, owner_user_id, name, stage,
         expected_value_satang, probability_bps, next_action, next_action_at, risk_note)
        VALUES (?, 'bib', ?, ?, 'ทีมขาย', ?, 'Demo Requested', 215000000, 1500,
         'ติดต่อเพื่อยืนยันนัดสาธิต', ?, ?)`)
        .bind(opportunityId, accountId, contactId, `${organizationName} — icoone`, now, locationType === "On-site" && !siteReady ? "ยังไม่ยืนยันความพร้อมของสถานที่" : ""),
      d1.prepare(`INSERT INTO demo_appointments
        (id, tenant_id, lead_id, opportunity_id, location_type, decision_maker_attending,
         qualification_score, approval_status, status)
        VALUES (?, 'bib', ?, ?, ?, ?, ?, ?, 'Requested')`)
        .bind(demoId, leadId, opportunityId, locationType, ["เจ้าของกิจการ", "แพทย์ผู้ตัดสินใจ", "ผู้บริหาร"].includes(buyingRole) ? 1 : 0, score, approvalStatus),
      d1.prepare(`INSERT INTO crm_activities
        (id, tenant_id, account_id, contact_id, lead_id, opportunity_id, activity_type,
         channel, summary, outcome, occurred_at, owner_user_id, source_record_id)
        VALUES (?, 'bib', ?, ?, ?, ?, 'Demo Request', 'Web', ?, ?, ?, 'ทีมขาย', ?)`)
        .bind(`activity-${crypto.randomUUID()}`, accountId, contactId, leadId, opportunityId, `ขอสาธิตแบบ ${locationType}`, `Lead score ${score} · ${temperature}`, now, demoId),
      d1.prepare(`INSERT INTO workspace_tasks
        (id, tenant_id, owner_user_id, account_id, lead_id, source_id, title, status, priority, due_date)
        VALUES (?, 'bib', 'ทีมขาย', ?, ?, 'SRC-WEB-DEMO', 'ติดต่อยืนยันคำขอสาธิต', 'ยังไม่เริ่ม', 'สูง', ?)`)
        .bind(`task-${crypto.randomUUID()}`, accountId, leadId, now.slice(0, 10)),
    ]);

    return Response.json({ ok: true, leadId, demoId, score, temperature, approvalStatus }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "ไม่สามารถบันทึกคำขอสาธิตได้" }, { status: 500 });
  }
}
