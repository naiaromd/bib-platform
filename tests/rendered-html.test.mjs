import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pageUrl = new URL("../app/ReviewApp.tsx", import.meta.url);
const routeUrl = new URL("../app/api/reviews/route.ts", import.meta.url);
const cssUrl = new URL("../app/globals.css", import.meta.url);
const hostingUrl = new URL("../.openai/hosting.json", import.meta.url);
const identityUrl = new URL("../lib/server-identity.ts", import.meta.url);
const workspaceUrl = new URL("../app/api/workspace/route.ts", import.meta.url);
const demoUrl = new URL("../app/api/public/demo-request/route.ts", import.meta.url);
const crmWorkspaceUrl = new URL("../app/api/crm/workspace/route.ts", import.meta.url);
const crmWorkspaceQueryUrl = new URL("../app/api/crm/workspace/query.ts", import.meta.url);
const crmContactUrl = new URL("../app/api/crm/contacts/[id]/route.ts", import.meta.url);
const evidenceUrl = new URL("../app/api/evidence/route.ts", import.meta.url);
const evidenceFilesUrl = new URL("../app/api/evidence/files/route.ts", import.meta.url);
const workspaceV2Url = new URL("../app/workspace/WorkspaceClient.tsx", import.meta.url);
const therapistUrl = new URL("../app/therapist/TherapistEvidenceApp.tsx", import.meta.url);
const therapistCssUrl = new URL("../app/therapist/therapist.module.css", import.meta.url);
const financeUrl = new URL("../app/api/finance/route.ts", import.meta.url);
const financeFilesUrl = new URL("../app/api/finance/files/route.ts", import.meta.url);
const financeModuleUrl = new URL("../app/platform/FinanceModule.tsx", import.meta.url);
const clientDashboardUrl = new URL("../app/api/client-dashboard/route.ts", import.meta.url);
const marketingClaimUrl = new URL("../app/api/finance/marketing/route.ts", import.meta.url);
const demoSessionUrl = new URL("../lib/demo-session.ts", import.meta.url);
const loginUrl = new URL("../app/login/page.tsx", import.meta.url);

test("ships the controlled review workflow", async () => {
  const [page, route] = await Promise.all([
    readFile(pageUrl, "utf8"),
    readFile(routeUrl, "utf8"),
  ]);
  assert.match(page, /เอกสารที่รอตรวจทาน/);
  assert.match(page, /ส่งกลับเพื่อแก้ไข/);
  assert.match(page, /ยืนยันเพื่อดำเนินการลงนาม/);
  assert.match(page, /เปิดอ่านแบบเต็มพื้นที่/);
  assert.match(page, /full-document/);
  assert.match(page, /\/api\/reviews/);
  assert.match(route, /DECISION_RECORDED/);
  assert.match(route, /COMMENT_CREATED/);
  assert.match(route, /not authorized/);
  assert.match(route, /Dr\.J is blocked until KYC/);
});

test("uses BIB CI and durable storage", async () => {
  const [css, hosting] = await Promise.all([
    readFile(cssUrl, "utf8"),
    readFile(hostingUrl, "utf8"),
  ]);
  assert.match(css, /font-family:\s*"Kanit"/);
  assert.match(css, /font-family:\s*"Muli"/);
  assert.match(css, /--canvas:\s*#f6f3ee/);
  assert.equal(JSON.parse(hosting).d1, "DB");
});

test("enforces server-side identity and tenant-scoped CRM", async () => {
  const [identity, reviews, workspace, demo] = await Promise.all([
    readFile(identityUrl, "utf8"),
    readFile(routeUrl, "utf8"),
    readFile(workspaceUrl, "utf8"),
    readFile(demoUrl, "utf8"),
  ]);
  assert.match(identity, /oai-authenticated-user-email/);
  assert.match(identity, /tenant_memberships/);
  assert.doesNotMatch(reviews, /x-bib-role/);
  assert.doesNotMatch(reviews, /requestedRole/);
  assert.match(workspace, /crm_opportunities/);
  assert.match(workspace, /WHERE l\.tenant_id = \?/);
  assert.match(demo, /INSERT INTO demo_appointments/);
  assert.match(demo, /INSERT INTO workspace_tasks/);
});

test("ships the focused CRM workspace and therapist evidence flow", async () => {
  const [crm, crmQuery, contact, evidence, files, workspace, therapist, therapistCss, hosting] = await Promise.all([
    readFile(crmWorkspaceUrl, "utf8"),
    readFile(crmWorkspaceQueryUrl, "utf8"),
    readFile(crmContactUrl, "utf8"),
    readFile(evidenceUrl, "utf8"),
    readFile(evidenceFilesUrl, "utf8"),
    readFile(workspaceV2Url, "utf8"),
    readFile(therapistUrl, "utf8"),
    readFile(therapistCssUrl, "utf8"),
    readFile(hostingUrl, "utf8"),
  ]);
  assert.match(crmQuery, /tenantId/);
  assert.match(crm, /accountScope/);
  assert.match(workspace, /งานวันนี้/);
  assert.match(workspace, /ลูกค้าและผู้สนใจ/);
  assert.match(workspace, /บุคคลที่เกี่ยวข้องกับการตัดสินใจ/);
  assert.match(workspace, /แก้ไขรายละเอียดผู้ติดต่อ/);
  assert.match(contact, /resolveLinkedAccount/);
  assert.match(contact, /preferred_channel/);
  assert.match(contact, /consent_status/);
  assert.match(evidence, /ห้ามบันทึกชื่อ เบอร์โทร หรืออีเมล/);
  assert.match(evidence, /Evidence case submitted/);
  assert.match(therapist, /capture="environment"/);
  assert.match(therapist, /MediaRecorder/);
  assert.match(therapist, /External publication/);
  assert.match(files, /filesBucket\(\)\.put/);
  assert.match(files, /SHA-256/);
  assert.match(therapistCss, /font-size:\s*16px/);
  assert.equal(JSON.parse(hosting).r2, "FILES");
});

test("ships period-based executive finance and LINNA marketing controls", async () => {
  const [finance, files, module, client, marketing] = await Promise.all([
    readFile(financeUrl, "utf8"),
    readFile(financeFilesUrl, "utf8"),
    readFile(financeModuleUrl, "utf8"),
    readFile(clientDashboardUrl, "utf8"),
    readFile(marketingClaimUrl, "utf8"),
  ]);
  assert.match(finance, /requireRole\(actor, \["Executive", "Finance"\]\)/);
  assert.match(finance, /period_month/);
  assert.match(finance, /กรอกเอง · รอตรวจ/);
  assert.match(files, /finance_document_registry/);
  assert.match(files, /filesBucket\(\)\.put/);
  assert.match(module, /รายเดือน/);
  assert.match(module, /รายไตรมาส/);
  assert.match(module, /รายปี/);
  assert.match(module, /แยกข้อมูลจริงออกจากงบประมาณและประมาณการ/);
  assert.match(client, /partner_marketing_claims/);
  assert.match(marketing, /ยอดที่หักได้เกินเพดาน 50,000 บาทต่อเดือน/);
  assert.match(marketing, /ได้รับใบเสร็จและหลักฐานการชำระครบ/);
});

test("records the named internal approver and limits the test profile to approval work", async () => {
  const [session, login, platform, reviews] = await Promise.all([
    readFile(demoSessionUrl, "utf8"),
    readFile(loginUrl, "utf8"),
    readFile(new URL("../app/platform/page.tsx", import.meta.url), "utf8"),
    readFile(routeUrl, "utf8"),
  ]);
  assert.match(session, /คุณผู้รับผิดชอบ/);
  assert.match(session, /role: "Approver"/);
  assert.match(login, /ผู้อนุมัติเอกสาร/);
  assert.match(platform, /Approver: \["approval"\]/);
  assert.match(platform, /อนุมัติโดย/);
  assert.match(await readFile(new URL("../app/platform/layout.tsx", import.meta.url), "utf8"), /"Approver"/);
  assert.match(reviews, /actor_display_name/);
  assert.match(reviews, /actorDisplayName: currentActor\.displayName/);
});
