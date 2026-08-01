import { env } from "cloudflare:workers";
import { headers } from "next/headers";

export const appRoles = ["Executive", "Finance", "Legal", "Sales", "Trainer", "Therapist", "Marketing", "After Sales", "Customer"] as const;
export type AppRole = (typeof appRoles)[number];

export type RequestActor = {
  email: string;
  displayName: string;
  tenantId: string;
  role: AppRole;
  accountScope: string;
};

export class AccessError extends Error {
  status: number;

  constructor(message: string, status = 403) {
    super(message);
    this.name = "AccessError";
    this.status = status;
  }
}

function database() {
  if (!env.DB) throw new Error("D1 binding DB is unavailable");
  return env.DB;
}

function decodeName(value: string | null, encoding: string | null) {
  if (!value || encoding !== "percent-encoded-utf-8") return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

async function initializeIdentity() {
  const d1 = database();
  await d1.batch([
    d1.prepare(`CREATE TABLE IF NOT EXISTS tenant_companies (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, brand_code TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Active', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    d1.prepare(`CREATE TABLE IF NOT EXISTS tenant_memberships (
      id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, user_email TEXT NOT NULL,
      display_name TEXT NOT NULL, role TEXT NOT NULL, account_scope TEXT NOT NULL DEFAULT '*',
      active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    d1.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS tenant_memberships_tenant_email_idx
      ON tenant_memberships (tenant_id, user_email)`),
    d1.prepare(`CREATE INDEX IF NOT EXISTS tenant_memberships_email_active_idx
      ON tenant_memberships (user_email, active)`),
    d1.prepare(`INSERT OR IGNORE INTO tenant_companies (id, name, brand_code)
      VALUES ('bib', 'BIB — Beauty Innovation & Beyond', 'BIB')`),
  ]);
}

export async function requireRequestActor(request: Request): Promise<RequestActor> {
  await initializeIdentity();
  const d1 = database();
  const url = new URL(request.url);
  const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  const authenticatedEmail = request.headers.get("oai-authenticated-user-email")?.trim().toLowerCase();
  if (!authenticatedEmail && !isLocal) {
    throw new AccessError("กรุณาเข้าสู่ระบบก่อนใช้งาน", 401);
  }

  const email = authenticatedEmail || "local-demo@bib.local";
  const headerName = decodeName(
    request.headers.get("oai-authenticated-user-full-name"),
    request.headers.get("oai-authenticated-user-full-name-encoding"),
  );
  let membership = await d1.prepare(`SELECT tenant_id, user_email, display_name, role, account_scope
    FROM tenant_memberships WHERE user_email = ? AND active = 1 ORDER BY created_at LIMIT 1`)
    .bind(email).first<{ tenant_id: string; user_email: string; display_name: string; role: string; account_scope: string }>();

  if (!membership) {
    const count = await d1.prepare("SELECT COUNT(*) AS total FROM tenant_memberships WHERE tenant_id = 'bib' AND active = 1")
      .first<{ total: number }>();
    if ((count?.total || 0) > 0 && !isLocal) {
      throw new AccessError("บัญชีนี้ยังไม่ได้รับสิทธิ์ในพื้นที่ BIB", 403);
    }
    const displayName = headerName || (isLocal ? "ผู้ดูแลระบบทดสอบ" : email);
    await d1.prepare(`INSERT OR IGNORE INTO tenant_memberships
      (id, tenant_id, user_email, display_name, role, account_scope)
      VALUES (?, 'bib', ?, ?, 'Executive', '*')`)
      .bind(`bib:${email}`, email, displayName).run();
    membership = { tenant_id: "bib", user_email: email, display_name: displayName, role: "Executive", account_scope: "*" };
  }

  if (!appRoles.includes(membership.role as AppRole)) {
    throw new AccessError("บทบาทผู้ใช้งานไม่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ", 403);
  }
  return {
    email: membership.user_email,
    displayName: membership.display_name,
    tenantId: membership.tenant_id,
    role: membership.role as AppRole,
    accountScope: membership.account_scope,
  };
}

export function requireRole(actor: RequestActor, allowed: AppRole[]) {
  if (!allowed.includes(actor.role)) {
    throw new AccessError("ไม่มีสิทธิ์ดำเนินการนี้", 403);
  }
}

export function accessErrorResponse(error: unknown) {
  if (error instanceof AccessError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  return null;
}

export async function requirePageActor(pathname: string) {
  const requestHeaders = await headers();
  return requireRequestActor(new Request(`https://protected.local${pathname}`, { headers: new Headers(requestHeaders) }));
}
