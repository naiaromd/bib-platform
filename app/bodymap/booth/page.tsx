import type { Metadata } from "next";
import { currentMode, loadBodyMap } from "@/lib/bodymap/data";
import { Mrs_Saint_Delafield } from "next/font/google";
import BoothApp from "./BoothApp";
import { BOOTH_CHECK } from "@/lib/bodymap/boothCheck";

// ฟอนต์ลายมือสำหรับ "ลายเซ็น" (ไนน์: ทำให้เป็นลายเซ็นจริง) · เก็บไฟล์ในเว็บเอง ใช้ได้ตอนไม่มีเน็ต
const sig = Mrs_Saint_Delafield({ weight: "400", subsets: ["latin"], variable: "--font-sig", display: "block" });

export const dynamic = "force-static";
export const metadata: Metadata = {
  title: "Design your Signature · icoone Laser Med",
  description: "จอบูธ: เลือกประเภทธุรกิจ บริเวณ และปัญหา แล้วดู Signature ของคลินิก",
  robots: { index: false, follow: false },
};

export default function BoothPage() {
  const data = loadBodyMap(currentMode());
  return <div className={sig.variable}><script dangerouslySetInnerHTML={{ __html: BOOTH_CHECK }} /><BoothApp data={data} /></div>;
}
