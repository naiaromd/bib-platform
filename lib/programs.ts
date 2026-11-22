// All 40 icoone programs, grouped as Base / Focus / Healthcare.
// Program keys match the Airtable "Program ID" column (see PROGRAM_AIRTABLE_ID).
// Source: BIB-handoff_r03/data/airtable_protocol_cards.json (read 22 Nov 2026)

export type ProgramGroup = "Base" | "Focus" | "Healthcare";

export const PROGRAM_GROUP_NOTE: Record<ProgramGroup, string> = {
  Base: "ใช้เริ่มทรีตเมนต์บนทั้งร่างกาย เพื่อเตรียมผิวก่อนงานเฉพาะจุด",
  Focus: "ใช้ต่อจาก Base บนบริเวณเฉพาะ เพื่อดูแลโจทย์เฉพาะจุด",
  Healthcare: "งานฟื้นฟูและการแพทย์ ตั้งแต่ระบบไหลเวียน แผลเป็น จนถึงกล้ามเนื้อ",
};

export const PROGRAM_GROUP_COLOR: Record<ProgramGroup, string> = {
  Base: "#c7e588",
  Focus: "#9ec3dc",
  Healthcare: "#f7b1a5",
};

export const PROGRAMS: Record<ProgramGroup, [string, string][]> = {
  Base: [
    ["CELLDRAIN", "เซลลูไลท์จากการคั่งของน้ำ"],
    ["FLOWING", "ช่วยการทำงานของระบบไหลเวียน"],
    ["SILK", "เซลลูไลท์ที่มีพังผืดร่วม"],
    ["CELLFAT", "เซลลูไลท์จากไขมัน"],
    ["BIOYOUNG", "ชะลอวัย ฟื้นฟูผิว เติมออกซิเจน"],
    ["ELASTO", "กระตุ้นความยืดหยุ่นของเนื้อเยื่อ"],
    ["TONUS", "เสริมความกระชับของร่างกาย"],
    ["OPTIMUM", "ผ่อนคลายทั้งร่างกาย"],
  ],
  Focus: [
    ["SILHOUETTE", "ปรับรูปร่างและลดสัดส่วน"],
    ["MODELPLUS", "ปรับรูปทรงและกระชับบั้นท้าย"],
    ["REMOD", "เข่า น่อง และข้อเท้า"],
    ["HIGHPLUS", "ร่างกายช่วงบนและต้นคอด้านหลัง"],
    ["MEN-ZONE", "ช่วงเอว"],
    ["ABDOTON", "กระชับหน้าท้อง"],
    ["ARMTON", "ความยืดหยุ่นของต้นแขน"],
    ["INTON", "ต้นขาด้านใน"],
    ["FATZONE", "ไขมันเฉพาะที่ ต้นขาด้านนอก"],
    ["NECK-FACE DRAIN", "ระบายอกส่วนบน ใบหน้า ลำคอ"],
    ["NECK-FACE ONE", "กระตุ้นเนื้อเยื่อระดับตื้น"],
    ["NECK-FACE TWO", "กระตุ้นเนื้อเยื่อเข้มข้นขึ้น"],
    ["YOUNGTOUCH", "ฟื้นฟูและกระชับมือ"],
    ["CHINSCULPT", "ไขมันใต้คาง"],
    ["SMOOTHFACE", "ริ้วรอยที่เห็นชัดบนใบหน้า"],
    ["EYELIGHT", "ระบายรอบดวงตา"],
  ],
  Healthcare: [
    ["STIMFLUID", "กระตุ้นไหลเวียนระดับหลอดเลือดฝอย"],
    ["LINFA", "กระตุ้นท่อน้ำเหลืองฝอย"],
    ["SKINEW", "คุณภาพเนื้อเยื่อ บวมร่วมพังผืด"],
    ["NOVASKIN", "ลดพังผืด ช่วยเรื่องแผลเป็น"],
    ["SKINREPAIR", "แผลไฟไหม้และแผลเป็น"],
    ["IN-PULSE", "การบีบตัวของลำไส้"],
    ["FINAL", "ขับของเสีย เคลื่อนเนื้อเยื่อเกี่ยวพัน"],
    ["MASSMOTHER", "เนื้อเยื่อหลังคลอด"],
    ["PAINMASS", "คลายกล้ามเนื้อหดเกร็ง"],
    ["MIND", "หลังและต้นคอจากท่าทาง"],
    ["MASSTOTAL", "ผ่อนคลายกล้ามเนื้อทั้งร่างกาย"],
    ["BALANCING", "หลังออกกำลังกายหนัก"],
    ["NEUROMASS", "ปรับสมดุลระบบประสาทอัตโนมัติ"],
    ["MIOCONTRACT", "คลายการหดตัวของใยกล้ามเนื้อ"],
    ["APONEUROSIS", "เอ็นและพังผืดกล้ามเนื้อ"],
    ["VITAL JUMP", "เตรียมร่างกายก่อนแข่งขัน"],
  ],
};

// Lookup: program key → [group, description]
export const PROGRAM_INFO: Record<string, [ProgramGroup, string]> = (() => {
  const out: Record<string, [ProgramGroup, string]> = {};
  (Object.entries(PROGRAMS) as [ProgramGroup, [string, string][]][]).forEach(
    ([group, list]) => {
      list.forEach(([id, th]) => {
        out[id] = [group, th];
      });
    }
  );
  return out;
})();

// Airtable Program ID per program key (PRG-001 … PRG-040).
// Needed for the Explorer → Airtable submit path (resolves by Program ID).
export const PROGRAM_AIRTABLE_ID: Record<string, string> = {
  CELLDRAIN: "PRG-001",
  FLOWING: "PRG-002",
  SILK: "PRG-003",
  CELLFAT: "PRG-004",
  BIOYOUNG: "PRG-005",
  ELASTO: "PRG-006",
  TONUS: "PRG-007",
  OPTIMUM: "PRG-008",
  SILHOUETTE: "PRG-009",
  MODELPLUS: "PRG-010",
  REMOD: "PRG-011",
  HIGHPLUS: "PRG-012",
  "MEN-ZONE": "PRG-013",
  FATZONE: "PRG-014",
  ABDOTON: "PRG-015",
  ARMTON: "PRG-016",
  INTON: "PRG-017",
  "NECK-FACE DRAIN": "PRG-018",
  "NECK-FACE ONE": "PRG-019",
  "NECK-FACE TWO": "PRG-020",
  YOUNGTOUCH: "PRG-021",
  CHINSCULPT: "PRG-022",
  SMOOTHFACE: "PRG-023",
  EYELIGHT: "PRG-024",
  STIMFLUID: "PRG-025",
  LINFA: "PRG-026",
  SKINEW: "PRG-027",
  NOVASKIN: "PRG-028",
  SKINREPAIR: "PRG-029",
  "IN-PULSE": "PRG-030",
  FINAL: "PRG-031",
  MASSMOTHER: "PRG-032",
  PAINMASS: "PRG-033",
  MIND: "PRG-034",
  MASSTOTAL: "PRG-035",
  BALANCING: "PRG-036",
  NEUROMASS: "PRG-037",
  "VITAL JUMP": "PRG-038",
  MIOCONTRACT: "PRG-039",
  APONEUROSIS: "PRG-040",
};
