"use client";
import type { BodyMapData, Concern } from "@/lib/bodymap/data";
import { Row, Sheet, Status, Tag } from "./ui";

/** Insight = ชั้นลึก · สร้างจากกลุ่มคนไข้ที่มักมากับปัญหานี้ (จุดเริ่ม · สิ่งที่อยากได้ · สิ่งที่ไม่อยากเจอ) */
export default function InsightDrawer({ concern, data, onClose }: { concern: Concern; data: BodyMapData; onClose: () => void }) {
  const internal = data.mode === "internal";
  const pick = (ids: string[]) => ids.map((i) => data.patientSituations.find((p) => p.id === i)).filter(Boolean);
  const groups: [string, ReturnType<typeof pick>][] = [["พบบ่อยที่สุด", pick(concern.psPrimary)], ["พบร่วมด้วย", pick(concern.psSecondary)]];
  return (
    <Sheet title={concern.label} kicker="Insight · คนไข้ที่มาด้วยปัญหานี้" onClose={onClose}>
      <Status show={internal}>วัตถุดิบ Insight · ร่าง · รอเขียนเนื้อหาเต็ม</Status>
      {groups.map(([title, list]) => list.length ? (
        <section key={title} className="mt-5">
          <h4 className="mb-2 text-sm text-muted">{title}</h4>
          <div className="space-y-4">
            {list.map((p) => p && (
              <article key={p.id} className="rounded-xl border border-line bg-card p-4">
                <div className="mb-1 flex items-center gap-2">
                  <h5 className="m-0 text-base text-ink">{p.label}</h5>
                  {internal ? <Tag>{p.id}</Tag> : null}
                </div>
                <dl className="m-0">
                  <Row k="จุดเริ่ม">{p.trigger || "—"}</Row>
                  <Row k="สิ่งที่อยากได้">{p.job || "—"}</Row>
                  <Row k="สิ่งที่ไม่อยากเจอ">{p.avoid || "—"}</Row>
                </dl>
              </article>
            ))}
          </div>
        </section>
      ) : null)}
    </Sheet>
  );
}
