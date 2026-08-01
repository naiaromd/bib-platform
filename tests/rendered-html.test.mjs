import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pageUrl = new URL("../app/page.tsx", import.meta.url);
const routeUrl = new URL("../app/api/reviews/route.ts", import.meta.url);
const cssUrl = new URL("../app/globals.css", import.meta.url);
const hostingUrl = new URL("../.openai/hosting.json", import.meta.url);
const identityUrl = new URL("../lib/server-identity.ts", import.meta.url);
const workspaceUrl = new URL("../app/api/workspace/route.ts", import.meta.url);
const demoUrl = new URL("../app/api/public/demo-request/route.ts", import.meta.url);

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
