// Body Map r05 · รับ event เป็นชุดจากหน้า /bodymap → ตาราง Body Map Events (ไม่ระบุตัวตน)
import { T, clean, createRows, hasToken, waitToken } from "@/lib/bodymap/airtable";

export const runtime = "edge";
const TYPES = new Set(["เปิดหน้า", "เลือก Fit", "หมุนรูป", "กดจุด", "เปิดปัญหา", "เปิด Program ย่อ", "เปิด Program ละเอียด", "เปิดหลักฐานย่อ", "เปิดหลักฐานละเอียด", "เปิด Insight", "เลือกหัวเครื่อง", "เริ่มกรอกฟอร์ม", "ส่งฟอร์ม", "กด LINE", "คำนวณ ROI", "ขอเอกสาร"]);

export async function POST(req: Request) {
  if (!hasToken()) return waitToken();
  let body: { events?: Record<string, unknown>[] };
  try { body = await req.json(); } catch { return Response.json({ ok: false, error: "invalid json" }, { status: 400 }); }
  const events = (Array.isArray(body.events) ? body.events : []).filter((e) => TYPES.has(String(e.type)) && /^BM-[A-Z0-9-]{6,40}$/.test(String(e.session))).slice(0, 50);
  if (!events.length) return Response.json({ ok: true, written: 0 });
  const rows = events.map((e) => ({
    fld5kjwDt83hvZbeV: clean(e.key, 60), fld3ypxt3sndZV88v: clean(e.session, 40), fldzSM5QF97JClzgK: clean(e.at, 30),
    fldqys0RlMuQGxWum: clean(e.type, 40), fldJw6yOkTjVoPj5k: clean(e.p, 8), fldswdpm2YGolkC2I: clean(e.z, 4),
    fldBtRwQeIL1lwECT: clean(e.program, 12), fldooMwYSz2EBnC0O: clean(e.evidence, 12),
    fldF4lb4S4N9BXHdJ: clean([e.fit, e.note].filter(Boolean).join(" | "), 300), fldMsMLCZ4M5mObcd: clean(e.mode, 12),
  }));
  const r = await createRows(T.events, rows);
  return Response.json({ ok: r.ok, written: r.ids.length }, { status: r.ok ? 200 : 502 });
}
