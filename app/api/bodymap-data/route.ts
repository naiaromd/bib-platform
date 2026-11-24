// Body Map r05 · ข้อมูลของหน้า /bodymap (อ่าน Airtable สดฝั่ง server · กรองตามโหมดก่อนส่ง)
// โหมดมาจาก env ของ server เท่านั้น (BODYMAP_INTERNAL=1) · browser เลือกโหมดเองไม่ได้
import { currentMode } from "@/lib/bodymap/data";
import { getBodyMap } from "@/lib/bodymap/live";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  const mode = currentMode();
  const { data, source, at, error } = await getBodyMap(mode);
  // ข้อความ error แสดงเฉพาะโหมดภายใน (ไว้ไล่ปัญหา)
  return Response.json({ source, at, ...(mode === "internal" && error ? { error } : {}), data }, { headers: { "Cache-Control": "no-store" } });
}
