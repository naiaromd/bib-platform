import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pageUrl = new URL("../app/page.tsx", import.meta.url);
const routeUrl = new URL("../app/api/reviews/route.ts", import.meta.url);
const cssUrl = new URL("../app/globals.css", import.meta.url);
const hostingUrl = new URL("../.openai/hosting.json", import.meta.url);

test("ships the controlled review workflow", async () => {
  const [page, route] = await Promise.all([
    readFile(pageUrl, "utf8"),
    readFile(routeUrl, "utf8"),
  ]);
  assert.match(page, /My Review Queue/);
  assert.match(page, /Request changes/);
  assert.match(page, /Approve for E‑Signature/);
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
