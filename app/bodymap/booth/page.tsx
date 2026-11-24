import type { Metadata } from "next";
import { currentMode, loadBodyMap } from "@/lib/bodymap/data";
import BoothApp from "./BoothApp";

export const dynamic = "force-static";
export const metadata: Metadata = {
  title: "Design your Signature · icoone Laser Med",
  description: "จอบูธ: เลือกประเภทธุรกิจ บริเวณ และปัญหา แล้วดู Signature ของคลินิก",
  robots: { index: false, follow: false },
};

export default function BoothPage() {
  const data = loadBodyMap(currentMode());
  return <BoothApp data={data} />;
}
