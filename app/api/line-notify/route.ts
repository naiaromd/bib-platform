// Body Map r05 · ทางเดียวที่ automation ใช้ส่งข้อความเข้ากลุ่ม LINE ของทีม (A1 · A3 · A5)
// ต้องมี header x-bodymap-secret ตรงกับ env BODYMAP_SECRET · ยังไม่มี LINE token = ตอบ "รอ token" ไม่ส่งอะไร
export const runtime = "edge";

export async function POST(req: Request) {
  const secret = process.env.BODYMAP_SECRET;
  if (!secret || req.headers.get("x-bodymap-secret") !== secret) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const to = process.env.LINE_TEAM_GROUP_ID;
  if (!token || !to) return Response.json({ ok: false, error: "รอ token", detail: "ยังไม่ได้ตั้ง LINE_CHANNEL_ACCESS_TOKEN / LINE_TEAM_GROUP_ID" }, { status: 503 });
  let b: { text?: string };
  try { b = await req.json(); } catch { return Response.json({ ok: false, error: "invalid json" }, { status: 400 }); }
  const text = String(b.text ?? "").slice(0, 4500);
  if (!text) return Response.json({ ok: false, error: "missing text" }, { status: 400 });
  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ to, messages: [{ type: "text", text }] }),
  });
  return Response.json({ ok: res.ok }, { status: res.ok ? 200 : 502 });
}
