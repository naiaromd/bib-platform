// ประเภทธุรกิจ → กลุ่มคนไข้ (Patient Situations PS01–PS12) · ร่าง 24 พ.ย. 2026 รอไนน์ยืนยัน
// ที่มาการแบ่ง: BIB Customer Persona & Target Segmentation r01 (Segment A–F) · ต้นฉบับ _ai/content/business_types.csv
export type BusinessType = { id: string; th: string; ps: string[] };
export const BUSINESS_TYPES: BusinessType[] = [
  { id: "BT1", th: "คลินิกความงาม", ps: ["PS01", "PS05", "PS06", "PS07", "PS08", "PS09"] },
  { id: "BT2", th: "คลินิกศัลยกรรม · หลังหัตถการ", ps: ["PS06", "PS07", "PS10", "PS11", "PS12"] },
  { id: "BT3", th: "โรงแรม · สปา · เวลเนส", ps: ["PS02", "PS03", "PS04", "PS05", "PS08", "PS09"] },
  { id: "BT4", th: "ฟื้นฟู · ชะลอวัย · กายภาพ", ps: ["PS02", "PS03", "PS04", "PS08", "PS11", "PS12"] },
  { id: "BT5", th: "โรงพยาบาล", ps: ["PS06", "PS07", "PS10", "PS11", "PS12"] },
];
