import type { Metadata } from "next";
import { currentMode, loadBodyMap } from "@/lib/bodymap/data";
import BodyMapApp from "./BodyMapApp";

export const dynamic = "force-static";
export const metadata: Metadata = {
  title: "แผนดูแลตามบริเวณ · icoone Laser Med",
  description: "เลือกบริเวณและปัญหา ดูแผนดูแล โปรแกรม และหลักฐานของ icoone Laser Med",
  robots: { index: false, follow: false },
};

export default function BodyMapPage() {
  const data = loadBodyMap(currentMode());
  return <BodyMapApp data={data} />;
}
