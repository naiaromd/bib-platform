// คำที่แสดงบนหน้า · กติกา v005 ข้อ 00.2 · คำเดียวกันทุกขนาดจอ
import type { Solution } from "@/lib/bodymap/solution";
export const LAYER: Record<Solution["layer"], string> = { bib: "แผนของ BIB", template: "แผนของผู้ผลิต", program: "โปรแกรม" };
export const GOAL_TH: Record<string, string> = { Toning: "กระชับ", Reshaping: "ปรับรูปร่าง", "Anti-Ageing": "ต้านริ้วรอย", Drainage: "ระบาย", Healthcare: "ฟื้นฟู" };
export const targetTh = (t: string) => (t.replace("*", "").trim() === "Women" ? "หญิง" : "หญิงและชาย");
export const freqTh = (f: string) => { const m = /^(\d+)x\/week$/.exec(f.trim()); return m ? `สัปดาห์ละ ${m[1]} ครั้ง` : f; };
export const planTitle = (s: Solution) => s.protocolTh || s.protocol || "ใช้โปรแกรมโดยตรง";
export const planSub = (s: Solution) => (s.protocolTh && s.protocol ? s.protocol : "");
