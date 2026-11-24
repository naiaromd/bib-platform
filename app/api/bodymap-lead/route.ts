// Body Map r05 · รับฟอร์มติดต่อ → Web Leads (ชุดช่องเดียวกับ /api/submit) · แหล่งที่มา bodymap-r05
// ตรวจซ้ำฝั่ง server: honeypot · ช่องบังคับ · ยินยอมให้ติดต่อ · ยินยอม LINE เมื่อกดคุยทาง LINE
import { T, clean, createRows, findRows, hasToken, patchRows, waitToken } from "@/lib/bodymap/airtable";

export const runtime = "edge";
const bad = (error: string) => Response.json({ ok: false, error }, { status: 400 });

export async function POST(req: Request) {
  let b: { lead?: Record<string, unknown>; website?: string; via_line?: boolean; session?: string; context?: Record<string, unknown>; clicks?: unknown };
  try { b = await req.json(); } catch { return bad("invalid json"); }
  if (!b || typeof b !== "object") return bad("invalid json");
  if (b.website) return Response.json({ ok: true, ref: "BM-OK" }); // honeypot: ตอบเหมือนสำเร็จ ไม่เขียนอะไร
  const L = b.lead ?? {};
  const miss = ["name", "clinic"].filter((k) => !clean(L[k]));
  if (!clean(L.phone) && !clean(L.line_id)) miss.push("phone or line_id");
  if (b.via_line && !clean(L.line_id)) miss.push("line_id");
  if (miss.length) return bad("missing: " + miss.join(", "));
  if (clean(L.phone) && clean(L.phone).replace(/\D/g, "").length < 9) return bad("phone too short");
  if (L.consent_contact !== true) return bad("consent_contact is required");
  if (b.via_line && L.consent_line !== true) return bad("consent_line is required for LINE");
  if (!hasToken()) return waitToken();

  const session = /^BM-[A-Z0-9-]{6,40}$/.test(String(b.session)) ? String(b.session) : "";
  const ref = "BM-" + Date.now().toString(36).toUpperCase() + "-" + crypto.randomUUID().slice(0, 4).toUpperCase();
  const clicks = JSON.stringify({ ref, via_line: !!b.via_line, context: b.context ?? {}, clicks: b.clicks ?? {} }, null, 1).slice(0, 90000);
  const lead = await createRows(T.leads, [{
    fldj4Kc9p0e8nhG0e: ref, fldiHe6VIS6YVw4fR: clean(L.name, 120), fldddXeQigAVSfUBj: clean(L.license, 40), fld8sT6WzZNQzwmkm: clean(L.clinic, 160),
    fldzbZO68CEsjrh7Y: clean(L.province, 60), fldgNQNFhcpkso57z: clean(L.cases_per_month, 40), fld5frGSjk3VOMA2l: clean(L.phone, 30),
    fldDFhd2MS78uRk4A: clean(L.line_id, 60), fldJ2SSK3UMfplyx1: true, fldt8lMtBD2jAqLKm: L.consent_line === true,
    fld6RVifdylH5brbk: "ใหม่", fldq5loEt8fmZTfsN: "bodymap-r05", fldKBanVLExL41vUH: clicks, fld2gkNW13nDvfHmo: ref,
  }]);
  if (!lead.ok || !lead.ids[0]) return Response.json({ ok: false, error: "lead write failed" }, { status: 502 });

  // ผูก event ทั้ง session เข้ากับลีด (event ที่ส่งมาก่อนหน้า)
  let linked = 0;
  if (session) {
    const evs = await findRows(T.events, `{Session ID}="${session}"`);
    if (evs.length) { const r = await patchRows(T.events, evs.map((e) => ({ id: e.id, fields: { fldt8UXzFoDCmumu6: [lead.ids[0]] } }))); if (r.ok) linked = evs.length; }
  }
  return Response.json({ ok: true, ref, lead_id: lead.ids[0], events_linked: linked });
}
