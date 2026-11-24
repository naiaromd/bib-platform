// Body Map r05 · ล้างข้อมูลที่เก็บไว้ ให้หน้าอ่าน Airtable ใหม่ (automation A4 เรียกเมื่อไนน์ติ๊ก 🔒)
// ต้องมี header x-bodymap-secret ตรงกับ env BODYMAP_SECRET
import { invalidateBodyMap } from "@/lib/bodymap/live";

export const runtime = "edge";

export async function POST(req: Request) {
  const secret = process.env.BODYMAP_SECRET;
  if (!secret || req.headers.get("x-bodymap-secret") !== secret) return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  invalidateBodyMap();
  return Response.json({ ok: true });
}
