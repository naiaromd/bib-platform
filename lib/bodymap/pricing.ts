// ราคาเครื่อง icoone Laser Med · ไนน์ให้ข้อมูล 24 พ.ย. 2026 · แก้ราคาเครื่องเป็น 2,000,000 บาท 25 พ.ย. · ทุกแผนขึ้นอยู่กับการพิจารณาและเงื่อนไข
// แผน Leasing มาจากเอกสาร ICOONE FINANCING (ผ่อน 60 งวด · 41,666.67 บาท/เดือน)
export const FULL_PRICE = 2_000_000; // ราคาเครื่อง (ไนน์ 25 พ.ย.)
export type PayPlan = { id: string; label: string; perMonth: number; months: number; note: string; tag: string; title: string; sub: string };
// 3 ทางเลือก (ไนน์อนุมัติ 25 พ.ย. · ชุด B): 1 คุ้มสุด เป็นเจ้าของ · 2 เสี่ยงต่ำ ใช้ก่อน ซื้อทีหลังได้ · 3 เบา ไม่เป็นภาระ
export const PAY_PLANS: PayPlan[] = [
  { id: "p10", label: "ผ่อน 0% · 10 งวด", perMonth: 215_000, months: 10, note: "", tag: "THE EXCLUSIVE", title: "เส้นทางที่สั้นที่สุด สู่การเป็นเจ้าของ", sub: "ผ่อน 0% · 10 งวด" },
  { id: "rto24", label: "Rent to Own · 24 งวด", perMonth: 120_000, months: 24, note: "", tag: "THE PRELUDE", title: "สัมผัสก่อน ตัดสินใจเมื่อพร้อม", sub: "Rent to Own · 24 งวด" },
  { id: "lease60", label: "Leasing · 60 งวด", perMonth: 41_666.67, months: 60, note: "", tag: "THE ESSENTIAL", title: "เริ่มอย่างเบา เติบโตอย่างมั่นคง", sub: "Leasing · 60 งวด" },
];
export const PRICE_NOTE = "ทุกแผนขึ้นอยู่กับการพิจารณาและเงื่อนไข";
export const WORK_DAYS = 26; // วันทำการต่อเดือน ใช้แปลงเป็น treatment ต่อวัน

// ต้นทุนวัสดุสิ้นเปลืองต่อครั้ง (40 นาที) · จาก "Treatmment Costing 2024.pdf" ของ BIB (Drive: Icoone/Presentation)
// ตัว = ชุดใส่ทำ (Body Suit) + แผ่นลูกกลิ้ง RoboTwin/RoboSolo + ไส้กรอง · หน้า = แผ่นลูกกลิ้ง RoboMini + ไส้กรอง
export const CONSUMABLE = { bodyM: 78.5, bodyF: 71.5, face: 5.9 };
export const SAMPLE_PRICE = { body: 5000, face: 4500 }; // ราคาขายต่อครั้งในตารางเดียวกัน
export const COST_SOURCE = "ตาราง Treatment Costing ของ BIB";
export const FACE_ZONES = ["Z1", "Z2"]; // ใบหน้า และคอ·เนินอก ไม่ใช้ชุดใส่ทำ
