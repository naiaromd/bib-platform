// 7 body areas (6 + "whole") with 31 concerns in total.
// Hotspot coordinates (x, y as % of figure) and view visibility come
// from the prototype in BIB-handoff_r03/prototypes/Explorer.dc.html.

export type AreaId =
  | "face"
  | "arms"
  | "upper"
  | "abdomen"
  | "hips"
  | "legs"
  | "whole";

export type Concern = readonly [label: string, programs: readonly string[]];

export interface Area {
  th: string;
  en: string;
  note: string;
  view: readonly ("front" | "back")[];
  k: readonly Concern[];
}

export const AREAS: Record<AreaId, Area> = {
  face: {
    th: "ใบหน้าและลำคอ",
    en: "Face & neck",
    note: "บริเวณที่คนไข้คุ้นเคยที่สุด เริ่มจากตรงนี้แล้วต่อไปยังส่วนอื่นได้",
    view: ["front"],
    k: [
      ["ริ้วรอยที่เห็นชัดบนใบหน้า", ["SMOOTHFACE"]],
      ["ไขมันใต้คาง", ["CHINSCULPT"]],
      ["บวมรอบดวงตา", ["EYELIGHT"]],
      ["ระบายใบหน้า ลำคอ และอกส่วนบน", ["NECK-FACE DRAIN"]],
      ["กระตุ้นเนื้อเยื่อใบหน้าและลำคอ", ["NECK-FACE ONE", "NECK-FACE TWO"]],
      ["คุณภาพผิวและการชะลอวัย", ["BIOYOUNG"]],
    ],
  },
  arms: {
    th: "ต้นแขนและมือ",
    en: "Arms & hands",
    note: "บริเวณที่คนไข้มักสังเกตเมื่ออายุมากขึ้น แต่ไม่ค่อยมีบริการรองรับ",
    view: ["front"],
    k: [
      ["ความยืดหยุ่นของต้นแขน", ["ARMTON", "ELASTO"]],
      ["ผิวและความกระชับของมือ", ["YOUNGTOUCH"]],
      ["คุณภาพผิวและการชะลอวัย", ["BIOYOUNG"]],
    ],
  },
  upper: {
    th: "หลังช่วงบนและต้นคอ",
    en: "Upper back & neck",
    note: "เกี่ยวทั้งรูปทรงและความตึงจากท่าทางในชีวิตประจำวัน",
    view: ["back"],
    k: [
      ["รูปทรงร่างกายช่วงบนและต้นคอด้านหลัง", ["HIGHPLUS"]],
      ["ต้นคอและหลังตึงจากท่าทาง", ["MIND"]],
      ["กล้ามเนื้อหดเกร็ง", ["PAINMASS", "MIOCONTRACT"]],
    ],
  },
  abdomen: {
    th: "หน้าท้องและเอว",
    en: "Abdomen & waist",
    note: "รวมทั้งงานรูปร่างและการดูแลหลังคลอด",
    view: ["front"],
    k: [
      ["ความกระชับของหน้าท้อง", ["ABDOTON"]],
      ["ช่วงเอวในคนไข้ชาย", ["MEN-ZONE"]],
      ["เนื้อเยื่อหลังคลอด", ["MASSMOTHER"]],
      ["การบีบตัวของลำไส้", ["IN-PULSE"]],
    ],
  },
  hips: {
    th: "สะโพก บั้นท้าย และต้นขา",
    en: "Hips & thighs",
    note: "แยกโจทย์เซลลูไลท์ตามลักษณะ ช่วยให้เลือกโปรแกรมได้ตรงขึ้น",
    view: ["front", "back"],
    k: [
      ["เซลลูไลท์จากการคั่งของน้ำ", ["CELLDRAIN", "SKINEW"]],
      ["เซลลูไลท์จากไขมัน", ["CELLFAT"]],
      ["เซลลูไลท์ที่มีพังผืด", ["SILK"]],
      ["รูปทรงบั้นท้าย", ["MODELPLUS"]],
      ["ต้นขาด้านนอก", ["FATZONE"]],
      ["ต้นขาด้านใน", ["INTON"]],
    ],
  },
  legs: {
    th: "น่องและข้อเท้า",
    en: "Legs & ankles",
    note: "ทั้งรูปทรงและการไหลเวียนของขา",
    view: ["front", "back"],
    k: [
      ["ไขมันบริเวณเข่า น่อง และข้อเท้า", ["REMOD"]],
      ["น้ำเหลืองไหลเวียนไม่ดี", ["LINFA"]],
      ["การไหลเวียนของหลอดเลือด", ["STIMFLUID", "FLOWING"]],
    ],
  },
  whole: {
    th: "ทั้งร่างกาย",
    en: "Whole body",
    note: "งานรูปร่างโดยรวม การฟื้นตัว และงานฟื้นฟูหลังผ่าตัด",
    view: ["front", "back"],
    k: [
      ["รูปร่างและสัดส่วนโดยรวม", ["SILHOUETTE", "TONUS"]],
      ["ผ่อนคลายและฟื้นตัว", ["OPTIMUM", "MASSTOTAL", "NEUROMASS"]],
      ["ก่อนและหลังออกกำลังกายหนัก", ["VITAL JUMP", "BALANCING"]],
      ["แผลเป็นและพังผืดหลังผ่าตัด", ["NOVASKIN", "SKINREPAIR"]],
      ["เอ็นและพังผืดกล้ามเนื้อ", ["APONEUROSIS"]],
      ["ของเสียและเนื้อเยื่อเกี่ยวพัน", ["FINAL"]],
    ],
  },
};

// Hotspot positions on the hero figure (% of image).
// Separate per gender and per view. "whole" has no hotspot — pick from the list.
export const FIGURE_POINTS: Record<
  "f" | "m",
  { front: Partial<Record<AreaId, [number, number][]>>; back: Partial<Record<AreaId, [number, number][]>> }
> = {
  f: {
    front: {
      face: [[50, 15.5]],
      arms: [[13.8, 31.5], [84.5, 31.5]],
      abdomen: [[50, 41.6]],
      hips: [[35.7, 59], [64.3, 59]],
      legs: [[42.4, 88.8], [57.6, 88.8]],
    },
    back: {
      upper: [[50, 24.4]],
      hips: [[37.3, 46.1], [62.7, 46.1]],
      legs: [[39.2, 77.8], [60.8, 77.8]],
    },
  },
  m: {
    front: {
      face: [[50.9, 17.3]],
      arms: [[11.8, 35.6], [89.7, 35.6]],
      abdomen: [[50.9, 42.2]],
      hips: [[35.4, 62.6], [64.6, 62.6]],
      legs: [[32, 90.3], [63.2, 90.3]],
    },
    back: {
      upper: [[50, 25.6]],
      hips: [[37.9, 47.8], [62.1, 47.8]],
      legs: [[34.5, 77.8], [65.5, 77.8]],
    },
  },
};

// IDs visible per view (Landing uses 5/3, Explorer adds "whole" as a list-only entry)
export const FRONT_IDS: AreaId[] = ["face", "arms", "abdomen", "hips", "legs"];
export const BACK_IDS: AreaId[] = ["upper", "hips", "legs"];
export const FRONT_IDS_WITH_WHOLE: AreaId[] = [...FRONT_IDS, "whole"];
export const BACK_IDS_WITH_WHOLE: AreaId[] = [...BACK_IDS, "whole"];
