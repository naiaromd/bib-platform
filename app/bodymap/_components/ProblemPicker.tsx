"use client";
import { useState } from "react";
import type { Concern, Zone } from "@/lib/bodymap/data";

function Chip({ c, on, internal, onClick }: { c: Concern; on: boolean; internal: boolean; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick}
      className={`max-w-full rounded-full border px-3 py-1.5 text-left text-sm transition ${on ? "border-ink bg-ink text-paper" : "border-line bg-card text-ink-2 hover:border-ink"}`}>
      {c.label}{internal ? <span className="ml-1 text-[11px] opacity-60">{c.id}</span> : null}
    </button>
  );
}

/** บริเวณ + ชิปปัญหา · จอใหญ่อยู่บนสุดของคอลัมน์ขวา · มือถืออยู่ข้างรูปคนในจอแรก */
export default function ProblemPicker({
  zone, concerns, concernId, internal, onConcern,
}: { zone: Zone | null; concerns: Concern[]; concernId: string | null; internal: boolean; onConcern: (id: string) => void }) {
  const [openAny, setOpenAny] = useState(false);
  if (!zone) {
    return (
      <div className="min-w-0">
        <h3 className="mb-2 mt-0 text-xl font-semibold text-ink">แตะจุดบนร่างกาย</h3>
        <p className="m-0 text-ink-2">เลือกบริเวณที่คนไข้มาปรึกษา แล้วดูว่า icoone ใช้แผนดูแลไหน ทำกี่นาที และมีหลักฐานอะไรรองรับ</p>
      </div>
    );
  }
  const local = concerns.filter((c) => c.zoneType === "ประจำจุด");
  const anywhere = concerns.filter((c) => c.zoneType !== "ประจำจุด");
  return (
    <div className="min-w-0">
      <p className="m-0 text-sm text-muted">บริเวณ</p>
      <h3 className="mb-3 mt-0 text-xl font-semibold leading-snug text-ink">{zone.th}</h3>
      <p className="mb-2 mt-0 text-sm text-muted">ปัญหา</p>
      <div className="flex flex-wrap gap-2">
        {local.map((c) => <Chip key={c.id} c={c} on={concernId === c.id} internal={internal} onClick={() => onConcern(c.id)} />)}
      </div>
      {anywhere.length ? (
        <div className="mt-3">
          <button type="button" aria-expanded={openAny} onClick={() => setOpenAny(!openAny)} className="text-left text-sm text-ink underline underline-offset-4">
            ปัญหาอื่นที่เกิดได้ทุกบริเวณ {openAny ? "▴" : "▾"}
          </button>
          {openAny || anywhere.some((c) => c.id === concernId) ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {anywhere.map((c) => <Chip key={c.id} c={c} on={concernId === c.id} internal={internal} onClick={() => onConcern(c.id)} />)}
            </div>
          ) : null}
        </div>
      ) : null}
      {concerns.length === 0 ? <p className="m-0 text-sm text-ink-2">เป้าหมายที่เลือกอยู่ใช้กับบริเวณอื่น ลองแตะจุดอื่นบนร่างกาย</p> : null}
    </div>
  );
}
