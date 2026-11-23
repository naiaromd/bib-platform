"use client";
import type { BodyMapData, Concern } from "@/lib/bodymap/data";
import type { Course } from "@/lib/bodymap/solution";
import { Sheet, Status, Tag } from "./ui";

/** โอกาสของ Treatment นี้ · เตรียมไว้ล่วงหน้า 1 ชิ้นต่อ ปัญหา × คอร์ส (ไม่สร้างสดบนหน้า) */
export default function InsightDrawer({ concern, course, data, onClose }: { concern: Concern; course: Course; data: BodyMapData; onClose: () => void }) {
  const internal = data.mode === "internal";
  const it = data.insights.find((i) => i.painId === concern.id && i.course === course);
  const parts: [string, string][] = it ? [["คนไข้กลุ่มไหนมาด้วยเรื่องนี้", it.who], ["โอกาสของคลินิก", it.opportunity], ["หลักฐานที่ใช้คุยกับคนไข้", it.proof]] : [];
  return (
    <Sheet title={concern.label} kicker={`โอกาสของ Treatment นี้ · คอร์ส ${course} ครั้ง`} onClose={onClose}>
      <div className="flex flex-wrap gap-1.5">
        <Status show={internal && !!it && !it.locked}>ร่าง</Status>
        {internal && it ? <Tag>{it.id}</Tag> : null}
      </div>
      {parts.filter(([, t]) => t).map(([h, t]) => (
        <section key={h} className="mt-5">
          <h4 className="mb-1 mt-0 text-sm font-normal text-muted">{h}</h4>
          <p className="m-0 whitespace-pre-line text-base leading-relaxed text-ink">{t}</p>
        </section>
      ))}
      {!it ? <Status show={internal}>ยังไม่มีเนื้อหาสำหรับปัญหานี้กับคอร์สนี้</Status> : null}
    </Sheet>
  );
}
