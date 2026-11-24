// Body Map r05 · งาน 6 · อ่าน Airtable สดฝั่ง server (token อยู่ใน env ไม่ไป browser)
// โครง (ปัญหา · แผนดูแล · ขั้นโปรแกรม · การผูก) มาจากไฟล์สำเนา data.generated.json ที่สร้างด้วย _ai/tools/build_bodymap_data.py
// ส่วนที่ทีมแก้ใน Airtable บ่อยและต้องเห็นบนหน้าทันที อ่านสดจาก Airtable แล้ววางทับ:
//   🔒 ทุกตาราง · ชื่อปัญหาหน้าหมอ · ชื่อไทยแผนดูแล · ย่อ/ละเอียดของโปรแกรม หลักฐาน เคส · Insight · นาทีตั้งต้นของโปรแกรม
// เก็บไว้ 10 นาที · /api/bodymap-revalidate สั่งล้างได้ (automation A4)
// แถวใหม่ทั้งแถว (ปัญหาใหม่ หลักฐานใหม่) ยังต้องรันสคริปต์สร้างไฟล์สำเนาแล้ว deploy ใหม่
import { loadBodyMap, filterByMode, type BodyMapData, type Mode } from "./data";

const BASE = () => process.env.AIRTABLE_BASE_ID || "app2HcsMi1mmqTLJi";
const TTL_MS = 10 * 60 * 1000;
type Row = { id: string; fields: Record<string, unknown> };
let memo: { at: number; data: BodyMapData; version: number } | null = null;
let version = 0;

async function fetchAll(table: string, fields: string[]): Promise<Row[]> {
  const out: Row[] = [];
  let offset = "";
  for (let i = 0; i < 20; i++) {
    const q = new URLSearchParams({ pageSize: "100", returnFieldsByFieldId: "true" });
    fields.forEach((f) => q.append("fields[]", f));
    if (offset) q.set("offset", offset);
    const res = await fetch(`https://api.airtable.com/v0/${BASE()}/${table}?${q}`, {
      // ไม่ใส่ cache option: Cloudflare Workers ไม่รองรับ (จะ error ทันที)
      headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` },
    });
    if (!res.ok) throw new Error(`airtable ${table} ${res.status}`);
    const j = (await res.json()) as { records: Row[]; offset?: string };
    out.push(...j.records);
    if (!j.offset) break;
    offset = j.offset;
  }
  return out;
}

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const byKey = (rows: Row[], key: string) => new Map(rows.map((r) => [str(r.fields[key]), r.fields]));

/** แยกข้อความ Insight ละเอียด 3 หัวข้อ (รูปแบบเดียวกับที่ push_content.py เขียน) */
function splitInsight(t: string) {
  const parts: Record<string, string> = {};
  const heads: [string, string][] = [["คนไข้กลุ่มไหนมาด้วยเรื่องนี้", "who"], ["โอกาสของคลินิก", "opportunity"], ["หลักฐานที่ใช้คุยกับคนไข้", "proof"]];
  for (const block of t.split(/\n\s*\n/)) {
    const [first, ...rest] = block.split("\n");
    const h = heads.find(([name]) => first.trim() === name);
    if (h) parts[h[1]] = rest.join("\n").trim();
  }
  return parts;
}

async function buildLive(): Promise<BodyMapData> {
  const base = loadBodyMap("internal");
  const [programs, evidence, cases, templates, protocols, menus, concerns, ps, content] = await Promise.all([
    fetchAll("tblCls7Ra523NAFZi", ["fldVsuhHbYugeVaOJ", "fldzmCXXnklKfCMEH", "fld82PShD7ka8qBMy", "fldO624FM2RiMjL9i", "fldVu3FROhL7OtWEy"]),
    fetchAll("tblqUf6RMxUvjxhrb", ["fld24fsyv4kRLUTqB", "fldewPNxxDVKO8af6", "fld595QKO8mTAhTGc", "fldXCdw6WnLhzkT52"]),
    fetchAll("tblkFaN6uZfUsSkP6", ["fldM1ioKMrTD5gBYp", "fldhWcExcnz1qOjZo", "fldysmpoQCX4B6f4d"]),
    fetchAll("tblz6u5DukC3p75e4", ["fldv6pDwpzNTPNYFI", "fld8jD8HWOz7O84oz", "fldj6i44jJEpoJcTB"]),
    fetchAll("tblxN0XvHZXhy3FlC", ["fldg0ZSL1ORhVX56D", "fldqCS21tsziTkuFY"]),
    fetchAll("tbld0RiSgMZy7BTkk", ["fldKlFB9FVbDhssg5", "fldFVE4G4eCvV76x8"]),
    fetchAll("tbloX37wnKCQ0q6XP", ["fldfjJNEat5e3J0CG", "fldJagQd06EnMKkXx", "fldts9Vj6ghnRcLFd"]),
    fetchAll("tblxFlB9j735dTN5i", ["fldmjxHmvwYazidjc", "fldoXwvvsK183ioRl"]),
    fetchAll("tblMeVbqZO3aiWRxF", ["fldX1RLSkjqhNVd8M", "fldmsxxdqDhgzTyQ8", "fld2DGMxrRWazBnPx"]),
  ]);
  const P = byKey(programs, "fldVsuhHbYugeVaOJ"), E = byKey(evidence, "fld24fsyv4kRLUTqB"), K = byKey(cases, "fldM1ioKMrTD5gBYp");
  const T = byKey(templates, "fldv6pDwpzNTPNYFI"), B = byKey(protocols, "fldg0ZSL1ORhVX56D"), M = byKey(menus, "fldKlFB9FVbDhssg5");
  const C = byKey(concerns, "fldfjJNEat5e3J0CG"), S = byKey(ps, "fldmjxHmvwYazidjc"), I = byKey(content, "fldX1RLSkjqhNVd8M");

  return {
    ...base,
    programs: base.programs.map((p) => {
      const f = P.get(p.id);
      if (!f) return p;
      const mins = typeof f.fldVu3FROhL7OtWEy === "number" ? f.fldVu3FROhL7OtWEy : p.defaultMinutes;
      return { ...p, short: str(f.fldzmCXXnklKfCMEH) || p.short, detail: str(f.fld82PShD7ka8qBMy) || p.detail, locked: f.fldO624FM2RiMjL9i === true, defaultMinutes: mins };
    }),
    evidence: base.evidence.map((e) => {
      const f = E.get(e.id);
      return f ? { ...e, short: str(f.fldewPNxxDVKO8af6) || e.short, detail: str(f.fld595QKO8mTAhTGc) || e.detail, locked: f.fldXCdw6WnLhzkT52 === true } : e;
    }),
    cases: base.cases.map((c) => {
      const f = K.get(c.id);
      return f ? { ...c, short: str(f.fldhWcExcnz1qOjZo) || c.short, locked: f.fldysmpoQCX4B6f4d === true } : c;
    }),
    templates: base.templates.map((t) => {
      const f = T.get(t.id);
      return f ? { ...t, nameTh: str(f.fld8jD8HWOz7O84oz) || t.nameTh, locked: f.fldj6i44jJEpoJcTB === true } : t;
    }),
    bibProtocols: base.bibProtocols.map((b) => {
      const f = B.get(b.name), m = M.get(b.name);
      return { ...b, nameTh: (f && str(f.fldqCS21tsziTkuFY)) || b.nameTh, locked: m ? m.fldFVE4G4eCvV76x8 === true : b.locked };
    }),
    concerns: base.concerns.map((c) => {
      const f = C.get(c.id);
      return f ? { ...c, label: str(f.fldJagQd06EnMKkXx) || c.label, locked: f.fldts9Vj6ghnRcLFd === true } : c;
    }),
    patientSituations: base.patientSituations.map((s) => {
      const f = S.get(s.id);
      return f ? { ...s, locked: f.fldoXwvvsK183ioRl === true } : s;
    }),
    insights: base.insights.map((i) => {
      const f = I.get(i.id);
      if (!f) return i;
      const parts = splitInsight(str(f.fldmsxxdqDhgzTyQ8));
      return { ...i, who: parts.who || i.who, opportunity: parts.opportunity || i.opportunity, proof: parts.proof ?? i.proof, locked: f.fld2DGMxrRWazBnPx === true };
    }),
  };
}

/** ข้อมูลของหน้า · มี token = อ่านสด (เก็บ 10 นาที) · ไม่มี token หรืออ่านไม่สำเร็จ = ใช้ไฟล์สำเนา */
let lastError = "";
export async function getBodyMap(mode: Mode): Promise<{ data: BodyMapData; source: "airtable" | "snapshot"; at: number; error?: string }> {
  if (!process.env.AIRTABLE_TOKEN) return { data: loadBodyMap(mode), source: "snapshot", at: 0 };
  const now = Date.now();
  if (!memo || memo.version !== version || now - memo.at > TTL_MS) {
    try {
      memo = { at: now, data: await buildLive(), version };
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
      if (!memo) return { data: loadBodyMap(mode), source: "snapshot", at: 0, error: lastError };
    }
  }
  return { data: filterByMode(memo.data, mode), source: "airtable", at: memo.at };
}

/** ล้างข้อมูลที่เก็บไว้ · ครั้งถัดไปจะอ่าน Airtable ใหม่ */
export function invalidateBodyMap() {
  version++;
}
