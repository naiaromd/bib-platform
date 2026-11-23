// Body Map r05 · รับ webhook จาก LINE OA · ตรวจลายเซ็นด้วย channel secret
// หมอเพิ่มเพื่อนแล้วพิมพ์รหัสอ้างอิง (BM-…) → ผูก LINE userId กับ Web Lead ในตาราง LINE Contacts
// ไม่ตอบข้อความเองในขั้นนี้ (ข้อความถึงหมอใช้แม่แบบที่ไนน์อนุมัติเท่านั้น) · ยังไม่มี secret = ตอบ "รอ token"
import { T, createRows, findRows, hasToken } from "@/lib/bodymap/airtable";

export const runtime = "edge";

async function validSignature(secret: string, body: string, sig: string | null) {
  if (!sig) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)));
  return btoa(String.fromCharCode(...mac)) === sig;
}

export async function POST(req: Request) {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret || !hasToken()) return Response.json({ ok: false, error: "รอ token" }, { status: 503 });
  const raw = await req.text();
  if (!(await validSignature(secret, raw, req.headers.get("x-line-signature")))) return Response.json({ ok: false, error: "bad signature" }, { status: 401 });
  const events = ((JSON.parse(raw) as { events?: { type: string; source?: { userId?: string }; message?: { type: string; text?: string } }[] }).events) ?? [];
  let linked = 0;
  for (const e of events) {
    const userId = e.source?.userId;
    const ref = e.type === "message" && e.message?.type === "text" ? (e.message.text ?? "").match(/BM-[A-Z0-9]{4,12}-[A-Z0-9]{4}/)?.[0] : undefined;
    if (!userId || !ref) continue;
    const lead = (await findRows(T.leads, `{รหัสอ้างอิง LINE}="${ref}"`, 1))[0];
    const r = await createRows(T.line, [{
      fldg1ibSRnziGX4Cq: userId, fld8bWeQZzeru6UnV: ref, fld09Am2YXdAu7Eph: (e.message?.text ?? "").slice(0, 500),
      fld7hFFHt0iewHx7F: new Date().toISOString(), ...(lead ? { fldNaPyehUTDYwIfF: [lead.id] } : {}),
    }]);
    if (r.ok) linked++;
  }
  return Response.json({ ok: true, linked });
}
