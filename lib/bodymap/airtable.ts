// Body Map r05 · ตัวช่วยเขียน Airtable ฝั่ง server (edge) · token อยู่ใน env เท่านั้น ไม่ส่งไป browser
export const BASE = () => process.env.AIRTABLE_BASE_ID || "app2HcsMi1mmqTLJi";
export const T = { leads: "tblKkEY1DzU7Pjd0H", events: "tblrsc5wipbc5AfCm", line: "tblZQobbQm1dTyol8" } as const;
export const hasToken = () => Boolean(process.env.AIRTABLE_TOKEN);
export const waitToken = () => Response.json({ ok: false, error: "รอ token", detail: "ยังไม่ได้ตั้ง AIRTABLE_TOKEN ใน env" }, { status: 503 });

type Rec = { id: string; fields: Record<string, unknown> };
async function call(path: string, init: RequestInit): Promise<{ ok: true; data: { records?: Rec[]; id?: string } } | { ok: false; err: unknown }> {
  const res = await fetch(`https://api.airtable.com/v0/${BASE()}/${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`, "Content-Type": "application/json" },
  });
  if (!res.ok) return { ok: false, err: await res.text().catch(() => res.status) };
  return { ok: true, data: (await res.json()) as { records?: Rec[]; id?: string } };
}
/** สร้างแถวใหม่ ชุดละไม่เกิน 10 · typecast เพื่อให้ตัวเลือกใหม่ของช่องเลือกถูกสร้างเอง */
export async function createRows(table: string, rows: Record<string, unknown>[]) {
  const ids: string[] = [];
  for (let i = 0; i < rows.length; i += 10) {
    const r = await call(table, { method: "POST", body: JSON.stringify({ typecast: true, records: rows.slice(i, i + 10).map((fields) => ({ fields })) }) });
    if (!r.ok) return { ok: false as const, err: r.err, ids };
    ids.push(...(r.data.records ?? []).map((x) => x.id));
  }
  return { ok: true as const, ids };
}
export async function findRows(table: string, formula: string, max = 100) {
  const q = new URLSearchParams({ filterByFormula: formula, pageSize: String(Math.min(max, 100)), returnFieldsByFieldId: "true" });
  const r = await call(`${table}?${q}`, { method: "GET" });
  return r.ok ? r.data.records ?? [] : [];
}
export async function patchRows(table: string, rows: { id: string; fields: Record<string, unknown> }[]) {
  for (let i = 0; i < rows.length; i += 10) {
    const r = await call(table, { method: "PATCH", body: JSON.stringify({ typecast: true, records: rows.slice(i, i + 10) }) });
    if (!r.ok) return { ok: false as const, err: r.err };
  }
  return { ok: true as const };
}
export const clean = (v: unknown, max = 500) => String(v ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);
