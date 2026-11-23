"use client";
import { useState } from "react";
import type { Fit, Goal, Sex, Course } from "@/lib/bodymap/solution";
import { GOAL_TH } from "./words";

const GOALS: Goal[] = ["Toning", "Reshaping", "Anti-Ageing", "Drainage", "Healthcare"];

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm transition ${on ? "border-ink bg-ink text-paper" : "border-line bg-card text-ink-2 hover:border-ink"}`}>
      {children}
    </button>
  );
}

/** ออกแบบทรีทเม้นท์ (เดิม "ปรับตามคนไข้" · ไนน์เปลี่ยน 23 พ.ย.) · จอใหญ่กางตลอด · มือถือพับเหลือ 1 แถว กดเพื่อกาง · คอร์สมีค่าเสมอ (เริ่มที่ 5 ครั้ง) */
export default function FitPanel({ fit, onChange }: { fit: Fit; onChange: (f: Fit) => void }) {
  const [open, setOpen] = useState(false);
  const now = [fit.sex === "f" ? "หญิง" : fit.sex === "m" ? "ชาย" : "", fit.goal ? GOAL_TH[fit.goal] : "", `${fit.course ?? 5} ครั้ง`].filter(Boolean);
  return (
    <aside className="min-w-0 self-start rounded-2xl border border-line bg-paper p-3 lg:p-5">
      <h2 className="m-0 hidden text-xl font-semibold text-ink lg:block">ออกแบบทรีทเม้นท์</h2>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="flex w-full items-center gap-2 text-left lg:hidden">
        <span className="min-w-0 flex-1">
          <span className="block text-base font-semibold text-ink">ออกแบบทรีทเม้นท์</span>
          <span className="mt-1 flex flex-wrap gap-1">
            {now.map((t) => <span key={t} className="rounded-full border border-line bg-card px-2 py-0.5 text-xs text-ink-2">{t}</span>)}
          </span>
        </span>
        <span className="flex-none rounded-full border border-ink bg-ink px-3 py-1.5 text-sm text-paper">{open ? "ปิด ▴" : "เปลี่ยน ▾"}</span>
      </button>
      {!open ? <p className="m-0 mt-2 text-xs text-muted lg:hidden">แตะ "เปลี่ยน" เพื่อเลือกเพศ เป้าหมาย และคอร์ส</p> : null}
      <div className={`${open ? "mt-3 block" : "hidden"} space-y-4 lg:mt-4 lg:block`}>
        <div>
          <p className="mb-2 mt-0 text-sm text-ink-2">เพศคนไข้</p>
          <div className="flex flex-wrap gap-2">
            {([["f", "หญิง"], ["m", "ชาย"]] as [Sex, string][]).map(([v, t]) => (
              <Chip key={v} on={fit.sex === v} onClick={() => onChange({ ...fit, sex: fit.sex === v ? null : v })}>{t}</Chip>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 mt-0 text-sm text-ink-2">เป้าหมาย</p>
          <div className="flex flex-wrap gap-2">
            {GOALS.map((v) => (
              <Chip key={v} on={fit.goal === v} onClick={() => onChange({ ...fit, goal: fit.goal === v ? null : v })}>{GOAL_TH[v]}</Chip>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 mt-0 text-sm text-ink-2">คอร์ส</p>
          <div className="flex flex-wrap gap-2">
            {([5, 10] as Course[]).map((v) => (
              <Chip key={v} on={(fit.course ?? 5) === v} onClick={() => onChange({ ...fit, course: v })}>{v} ครั้ง</Chip>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
