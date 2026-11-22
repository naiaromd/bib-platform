import { AreaId } from "@/lib/areas";
import { HandpieceKey } from "@/lib/handpieces";

export type Gender = "f" | "m";
export type View = "front" | "back";
export type Stage = 1 | 2 | 3 | 4;
export type Course = "5" | "10";

export interface FormState {
  name: string;
  license: string;
  clinic: string;
  province: string;
  volume: string;
  phone: string;
  line: string;
  consent: boolean;
  mkt: boolean;
}

export interface ExplorerState {
  stage: Stage;
  ctx: Record<string, boolean>;
  view: View;
  gender: Gender;
  area: AreaId;
  picked: Record<string, boolean>;
  draft: Record<string, boolean>;
  hp: HandpieceKey;
  suc: number;
  led: boolean;
  las: boolean;
  lock: number | null; // locked mechanism step (0-4) or null for autoplay
  net: boolean; // show the tissue mesh overlay
  playing: boolean;
  ses: Course;
  form: FormState;
  tried: boolean;
  done: boolean;
}

export const CONTEXT_OPTIONS: [string, string][] = [
  ["face", "ความงามผิวหน้า"],
  ["body", "รูปร่างและผิวกาย"],
  ["rehab", "เวชศาสตร์ฟื้นฟูและกายภาพ"],
  ["post", "ดูแลหลังผ่าตัดและหลังคลอด"],
  ["wellness", "Wellness และสปาทางการแพทย์"],
];

export const STAGE_LABELS = [
  "บริบทคลินิก",
  "โจทย์ที่สนใจ",
  "เลือกหัวและโปรแกรม",
  "สรุปแนวทาง",
];

export const MECHANISM_STEPS = [
  {
    k: "OVERVIEW",
    label: "ภาพรวม",
    t: "หัว Roboderm® ใช้แรงสุญญากาศสามช่องทำงานพร้อมลูกกลิ้งที่มีรูเล็ก เนื้อเยื่อจึงถูกยกและขยับเป็นจังหวะ",
  },
  {
    k: "1 · LIFT",
    label: "ช่องกลาง",
    t: "แรงดูดในช่องกลางยกผิวขึ้นเป็นโดมระหว่างลูกกลิ้งสองตัว",
  },
  {
    k: "2–3 · M.M.A.S.",
    label: "ลูกกลิ้ง",
    t: "แรงดูดผ่านรูบนลูกกลิ้งทั้งสองข้าง กระตุ้นผิวเป็นจุดเล็กจำนวนมากขณะหมุน",
  },
  {
    k: "TISSUE",
    label: "ใต้ผิว",
    t: "ภาพแสดงโครงข่ายเนื้อเยื่อเกี่ยวพันใต้ผิว ขณะผิวถูกยกและคลายเป็นจังหวะ",
  },
  {
    k: "LIGHT",
    label: "แสง",
    t: "Laser 915 nm · LED 650 nm ทำงานร่วมกับกลไกบนหัวเดียวกัน เฉพาะรุ่น icoone® LASER MED",
  },
];

export const PROVINCES: [string, string][] = [
  ["", "เลือก"],
  ["กรุงเทพมหานคร", "กรุงเทพมหานคร"],
  ["ปริมณฑล", "นนทบุรี / ปทุมธานี / สมุทรปราการ"],
  ["เชียงใหม่", "เชียงใหม่"],
  ["ชลบุรี", "ชลบุรี / พัทยา"],
  ["ภูเก็ต", "ภูเก็ต"],
  ["ขอนแก่น", "ขอนแก่น"],
  ["นครราชสีมา", "นครราชสีมา"],
  ["สงขลา", "สงขลา / หาดใหญ่"],
  ["อื่นๆ", "จังหวัดอื่น"],
];

export const CASES_OPTIONS = ["10–30", "31–80", "81–150", "150+"];

export const PILOT_TIMELINE = [
  { d: "D0", t: "รับสรุป Blueprint ของคลินิก และเอกสารประกอบจากทีม BIB" },
  { d: "D2–D3", t: "ยืนยันโจทย์ ทีมผู้ดูแล (แพทย์ / พยาบาล / นักกายภาพ) และผู้รับผิดชอบ Pilot ของคลินิก" },
  { d: "D7", t: "ประเมินพื้นที่และ Live Demo ในคลินิก 45–60 นาที กำหนดโปรโตคอลตั้งต้นและเกณฑ์คัดเลือกคนไข้" },
  { d: "W2–W6", t: "ติดตามเคสจริง 5–10 รายต่อเนื่อง บันทึกความสบาย ผลวัด และการมาตามนัด" },
  { d: "จบ Pilot", t: "ทบทวนผล ประสบการณ์คนไข้ และความคุ้มค่า ก่อนตัดสินใจลงทุน" },
];
