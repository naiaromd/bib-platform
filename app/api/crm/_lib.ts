import { env } from "cloudflare:workers";
import {
  accessErrorResponse,
  requireRequestActor,
  requireRole,
  type RequestActor,
} from "@/lib/server-identity";

export const internalRoles = [
  "Executive",
  "Finance",
  "Legal",
  "Sales",
  "Trainer",
  "Marketing",
  "After Sales",
] as const;

export class PayloadError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "PayloadError";
    this.status = status;
  }
}

export function crmDb() {
  if (!env.DB) throw new Error("D1 binding DB is unavailable");
  return env.DB;
}

export async function requireCrmActor(request: Request) {
  const actor = await requireRequestActor(request);
  requireRole(actor, [...internalRoles]);
  return actor;
}

export function crmErrorResponse(error: unknown) {
  const accessResponse = accessErrorResponse(error);
  if (accessResponse) return accessResponse;
  if (error instanceof PayloadError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error("CRM API error", error);
  return Response.json({ error: "ไม่สามารถดำเนินการได้ กรุณาลองใหม่" }, { status: 500 });
}

export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new PayloadError("รูปแบบข้อมูลไม่ถูกต้อง");
  }
  return value as Record<string, unknown>;
}

export function requiredText(value: unknown, label: string, max = 300) {
  const result = String(value ?? "").trim();
  if (!result) throw new PayloadError(`กรุณาระบุ${label}`);
  if (result.length > max) throw new PayloadError(`${label}ยาวเกินกำหนด`);
  return result;
}

export function optionalText(value: unknown, label: string, max = 300) {
  if (value === undefined) return undefined;
  const result = String(value ?? "").trim();
  if (result.length > max) throw new PayloadError(`${label}ยาวเกินกำหนด`);
  return result;
}

export function enumText<const T extends readonly string[]>(
  value: unknown,
  label: string,
  allowed: T,
  required = false,
): T[number] | undefined {
  if (value === undefined && !required) return undefined;
  const result = requiredText(value, label, 80);
  if (!allowed.includes(result)) {
    throw new PayloadError(`${label}ไม่ถูกต้อง`);
  }
  return result as T[number];
}

export function optionalInteger(value: unknown, label: string, min: number, max: number) {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    throw new PayloadError(`${label}ไม่ถูกต้อง`);
  }
  return value;
}

export function optionalBoolean(value: unknown, label: string) {
  if (value === undefined) return undefined;
  if (typeof value !== "boolean") throw new PayloadError(`${label}ไม่ถูกต้อง`);
  return value;
}

export function optionalDate(value: unknown, label: string, allowEmpty = true) {
  if (value === undefined) return undefined;
  const result = String(value ?? "").trim();
  if (!result && allowEmpty) return "";
  if (Number.isNaN(Date.parse(result))) throw new PayloadError(`${label}ไม่ถูกต้อง`);
  return result;
}

export function boundedLimit(url: URL) {
  const parsed = Number(url.searchParams.get("limit") || 100);
  if (!Number.isInteger(parsed)) return 100;
  return Math.min(Math.max(parsed, 1), 250);
}

export function accountScopeSql(actor: RequestActor, column: string) {
  return actor.accountScope === "*"
    ? { sql: "", values: [] as unknown[] }
    : { sql: ` AND ${column} = ?`, values: [actor.accountScope] as unknown[] };
}

export async function assertAccountAccess(actor: RequestActor, accountId: string) {
  if (!accountId) {
    if (actor.accountScope !== "*") throw new PayloadError("ไม่มีสิทธิ์เข้าถึงข้อมูลลูกค้านี้", 403);
    return;
  }
  const account = await crmDb().prepare(
    "SELECT id FROM client_accounts WHERE tenant_id = ? AND id = ? LIMIT 1",
  ).bind(actor.tenantId, accountId).first<{ id: string }>();
  if (!account || (actor.accountScope !== "*" && actor.accountScope !== account.id)) {
    throw new PayloadError("ไม่พบข้อมูลลูกค้าหรือไม่มีสิทธิ์เข้าถึง", 404);
  }
}

type LinkIds = {
  accountId?: string;
  contactId?: string;
  leadId?: string;
  opportunityId?: string;
};

export async function resolveLinkedAccount(actor: RequestActor, links: LinkIds) {
  const d1 = crmDb();
  const found: string[] = [];
  if (links.accountId) found.push(links.accountId);

  const lookups: Array<Promise<{ accountId: string } | null>> = [];
  if (links.contactId) {
    lookups.push(d1.prepare(`SELECT account_id AS accountId FROM client_contacts
      WHERE tenant_id = ? AND id = ? LIMIT 1`).bind(actor.tenantId, links.contactId)
      .first<{ accountId: string }>());
  }
  if (links.leadId) {
    lookups.push(d1.prepare(`SELECT account_id AS accountId FROM crm_leads
      WHERE tenant_id = ? AND id = ? LIMIT 1`).bind(actor.tenantId, links.leadId)
      .first<{ accountId: string }>());
  }
  if (links.opportunityId) {
    lookups.push(d1.prepare(`SELECT account_id AS accountId FROM crm_opportunities
      WHERE tenant_id = ? AND id = ? LIMIT 1`).bind(actor.tenantId, links.opportunityId)
      .first<{ accountId: string }>());
  }
  const records = await Promise.all(lookups);
  if (records.some((item) => !item)) throw new PayloadError("ไม่พบข้อมูลที่เชื่อมโยง", 404);
  for (const item of records) {
    if (item?.accountId) found.push(item.accountId);
  }
  const unique = [...new Set(found.filter(Boolean))];
  if (unique.length > 1) throw new PayloadError("ข้อมูลที่เชื่อมโยงอยู่คนละบัญชีลูกค้า");
  const accountId = unique[0] || "";
  await assertAccountAccess(actor, accountId);
  return accountId;
}

export function buildUpdate(fields: Record<string, unknown>) {
  const entries = Object.entries(fields).filter(([, value]) => value !== undefined);
  if (!entries.length) throw new PayloadError("ไม่มีข้อมูลที่ต้องการแก้ไข");
  return {
    sql: entries.map(([column]) => `${column} = ?`).join(", "),
    values: entries.map(([, value]) => value),
  };
}

export function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}
