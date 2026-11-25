// คลังโปรแกรม icoone 2 ระดับ สำหรับหน้า Signature ของจอบูธ (แบบ C · ไนน์อนุมัติ 25 พ.ย. 2569)
// หลัก: ไม่สั่งสูตร ให้ "ตัวเลือก + ที่มา" แล้วให้หมอออกแบบเอง
//  · ระดับ 1 "ตามคู่มือ icoone" = เฉพาะเส้นเชื่อมชนิด "ตรงตามคู่มือ" เท่านั้น (ผู้ผลิตระบุเอง) · โชว์เลขหน้าคู่มือ
//  · ระดับ 2 "กลไกเดียวกัน · ทีม BIB ช่วยเลือก" = เส้นเชื่อม "เกี่ยวผ่านหน้าที่" (ทีมอนุมาน ยังไม่ตรวจ) · ไม่ใช่คำยืนยัน
//  · ไม่ใช้เส้น "ข้อเสนอรอทวน" · ไม่ใช้โปรแกรมที่เป็นเครื่องมือแพทย์ตาม CE (6 ตัว) · บนจอโชว์แค่ชื่อโปรแกรม + กลไก ไม่โชว์คำอธิบายที่มีคำเชิงการแพทย์
//  · เดิมตั้งใจใช้แค่ Base + Focus แต่จะเหลือ 24/48 ปัญหา และบริเวณคอ บ่า หลัง หายทั้งบริเวณ → ใช้ Healthcare ที่ไม่ใช่ CE การแพทย์ด้วย (34/48)
import type { BodyMapData, Concern, Program } from "./data";

export const MANUAL_LINK = "ตรงตามคู่มือ";
export const MECHANISM_LINK = "เกี่ยวผ่านหน้าที่";
export const BOOTH_GROUPS = ["base", "focus", "healthcare"];
export const boothProgram = (p: Program) => BOOTH_GROUPS.includes(p.group) && !p.ceMedical.startsWith("ใช่");
/** คำเชิงโรค/อาการทางการแพทย์ · ปัญหาที่มีคำเหล่านี้ไม่ขึ้นจอบูธ */
export const MEDICAL_WORDS = ["lymphoedema", "lymphedema", "ปลูกถ่าย", "แผลไหม้", "เรื้อรัง", "ปวดศีรษะ", "ปวดกราม"];
const EFFECT_TH: Record<string, string> = { Lymphatic: "ระบายของเหลว", Vascular: "ไหลเวียนเลือด", Connective: "เนื้อเยื่อเกี่ยวพัน", Muscle: "กล้ามเนื้อ", Endorphin: "ผ่อนคลาย" };

export const effectTh = (p: Program) =>
  p.effectTags.split(/[·,]/).map((s) => s.trim()).filter(Boolean).map((t) => EFFECT_TH[t] ?? t).join(" + ");

function linked(c: Concern, data: BodyMapData, type: string): Program[] {
  const ids = [...new Set(c.programs.filter((x) => x.type === type).map((x) => x.programId))];
  return ids.map((id) => data.programs.find((p) => p.id === id)).filter((p): p is Program => !!p && boothProgram(p));
}

/** ปัญหานี้ขึ้นจอบูธได้ไหม: ไม่มีคำเชิงการแพทย์ และมีโปรแกรม Base/Focus อย่างน้อย 1 ตัว */
export function boothEligible(c: Concern, data: BodyMapData): boolean {
  const label = c.label.toLowerCase();
  if (MEDICAL_WORDS.some((w) => label.includes(w))) return false;
  return linked(c, data, MANUAL_LINK).length + linked(c, data, MECHANISM_LINK).length > 0;
}

export type LibItem = { p: Program; concerns: Concern[] };
export type Library = { manual: LibItem[]; manualMore: number; mechanism: LibItem[]; mechanismMore: number };

const order = (a: LibItem, b: LibItem) =>
  BOOTH_GROUPS.indexOf(a.p.group) - BOOTH_GROUPS.indexOf(b.p.group) || b.concerns.length - a.concerns.length || a.p.id.localeCompare(b.p.id);

/** รวมโปรแกรมจากทุกปัญหาที่เลือก · ตัวที่อยู่ระดับคู่มือแล้วไม่ซ้ำในระดับกลไก · ตัดจำนวนให้อ่านง่าย (ตัวเลือกน้อย เรียงลำดับ) */
export function programLibrary(chosen: Concern[], data: BodyMapData, maxManual = 4, maxMechanism = 6): Library {
  const man = new Map<string, LibItem>(), mech = new Map<string, LibItem>();
  for (const c of chosen) {
    for (const p of linked(c, data, MANUAL_LINK)) { const it = man.get(p.id) ?? { p, concerns: [] }; it.concerns.push(c); man.set(p.id, it); }
  }
  for (const c of chosen) {
    for (const p of linked(c, data, MECHANISM_LINK)) {
      if (man.has(p.id)) continue;
      const it = mech.get(p.id) ?? { p, concerns: [] }; it.concerns.push(c); mech.set(p.id, it);
    }
  }
  const m = [...man.values()].sort(order), k = [...mech.values()].sort(order);
  return { manual: m.slice(0, maxManual), manualMore: Math.max(0, m.length - maxManual), mechanism: k.slice(0, maxMechanism), mechanismMore: Math.max(0, k.length - maxMechanism) };
}
