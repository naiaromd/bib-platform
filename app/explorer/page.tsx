import { Suspense } from "react";
import ExplorerApp from "./_components/ExplorerApp";

export const metadata = {
  title: "Explorer · BIB × icoone",
  description:
    "4 ขั้น · บริบทคลินิก → โจทย์บนหุ่น → หัวและโปรแกรม → สรุปแนวทาง (Clinical Service Blueprint)",
};

export default function ExplorerPage() {
  return (
    <Suspense fallback={null}>
      <ExplorerApp />
    </Suspense>
  );
}
