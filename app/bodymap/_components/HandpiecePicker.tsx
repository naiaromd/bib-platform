"use client";
// คัดจาก app/explorer/_components/Stage3Handpiece.tsx (ไม่แก้ไฟล์ต้นทาง) · ใช้ข้อมูล lib/handpieces.ts
// คู่มือผู้ผลิตให้แพทย์เลือกหัวตามบริเวณเอง · LED/Laser เปิดได้เฉพาะ RoboSolo
import { useState } from "react";
import { HANDPIECES, HANDPIECE_ORDER, type HandpieceKey } from "@/lib/handpieces";
import MechanismDiagram from "@/app/explorer/_components/MechanismDiagram";

export type HeadChoice = { hp: HandpieceKey; suc: number; led: boolean; las: boolean };
export const sucLabel = (v: number) => (v < 34 ? "เบา" : v < 67 ? "กลาง" : "แรง");
export const headText = (c: HeadChoice) =>
  `${HANDPIECES[c.hp].name} · แรงดูด${sucLabel(c.suc)}${HANDPIECES[c.hp].hasLight ? ` · LED ${c.led ? "เปิด" : "ปิด"} · Laser ${c.las ? "เปิด" : "ปิด"}` : ""}`;

export default function HandpiecePicker({ value, onChange }: { value: HeadChoice; onChange: (c: HeadChoice) => void }) {
  const h = HANDPIECES[value.hp];
  const light = h.hasLight;
  const [diagram, setDiagram] = useState(false);
  return (
    <div className="mt-4 rounded-xl border border-line bg-card p-3">
      <p className="m-0 text-sm text-ink">หัวเครื่อง · เลือกตามบริเวณ</p>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {HANDPIECE_ORDER.map((k) => {
          const x = HANDPIECES[k];
          const on = value.hp === k;
          return (
            <button key={k} type="button" aria-pressed={on} onClick={() => onChange({ ...value, hp: k, led: x.hasLight && value.led, las: x.hasLight && value.las })}
              className={`flex min-w-0 flex-col items-center gap-1 rounded-lg border p-2 text-center transition ${on ? "border-ink bg-paper" : "border-line hover:border-ink"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={x.img} alt="" className="h-12 w-12 object-contain" />
              <span className="text-xs text-ink">{x.name}</span>
            </button>
          );
        })}
      </div>
      <p className="mb-2 mt-2 text-sm text-ink-2">{h.desc} · กระตุ้น {h.ppm} ครั้งต่อนาที</p>
      <button type="button" aria-expanded={diagram} onClick={() => setDiagram(!diagram)} className="mb-2 text-sm text-ink underline underline-offset-4">
        {diagram ? "ซ่อนภาพกลไกใต้ผิว ▴" : "ดูภาพกลไกใต้ผิว ▾"}
      </button>
      {diagram ? <MechanismDiagram step={0} showNet={false} suc={value.suc} led={light && value.led} las={light && value.las} /> : null}
      <div className="grid gap-3 rounded-xl border border-line p-3 sm:grid-cols-2">
        <label className="block text-sm text-ink">
          <span className="flex justify-between"><span>แรงดูด (จำลอง)</span><span className="text-ink-2">{sucLabel(value.suc)}</span></span>
          <input type="range" min={0} max={100} value={value.suc} onChange={(e) => onChange({ ...value, suc: +e.target.value })} aria-label="แรงดูด" className="m-0 w-full accent-ink" />
        </label>
        {light ? (
          <div className="flex items-end gap-2">
            {([["led", "LED 650 nm"], ["las", "Laser 915 nm"]] as ["led" | "las", string][]).map(([k, t]) => (
              <button key={k} type="button" aria-pressed={value[k]} onClick={() => onChange({ ...value, [k]: !value[k] })}
                className={`flex-1 rounded-lg border px-2 py-1.5 text-sm transition ${value[k] ? "border-ink bg-ink text-paper" : "border-line bg-paper text-ink-2 hover:border-ink"}`}>
                {t} · {value[k] ? "เปิด" : "ปิด"}
              </button>
            ))}
          </div>
        ) : (
          <p className="m-0 self-end text-sm text-ink-2">{h.name} ทำงานด้วยแรงดูดและลูกกลิ้ง · Laser และ LED อยู่ที่หัว RoboSolo</p>
        )}
      </div>
    </div>
  );
}
