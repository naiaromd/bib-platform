// ราคาเครื่อง icoone Laser Med · ไนน์ให้ข้อมูล 24 พ.ย. 2026 · ทุกแผนขึ้นอยู่กับการพิจารณาและเงื่อนไข
// แผน Leasing มาจากเอกสาร ICOONE FINANCING (ผ่อน 60 งวด · 41,666.67 บาท/เดือน)
export const FULL_PRICE = 2_500_000; // รวม VAT 7%
export type PayPlan = { id: string; label: string; perMonth: number; months: number; note: string };
export const PAY_PLANS: PayPlan[] = [
  { id: "p10", label: "ผ่อน 0% 10 เดือน", perMonth: 215_000, months: 10, note: "ราคาพิเศษในงาน" },
  { id: "rto24", label: "Rent to Own 24 เดือน", perMonth: 120_000, months: 24, note: "" },
  { id: "lease60", label: "Leasing 60 เดือน", perMonth: 41_666.67, months: 60, note: "" },
];
export const PRICE_NOTE = "ทุกแผนขึ้นอยู่กับการพิจารณาและเงื่อนไข";
