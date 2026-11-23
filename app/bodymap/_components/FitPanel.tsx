"use client";
import type { Fit, Goal, Sex, Course } from "@/lib/bodymap/solution";

const GOALS: [Goal, string][] = [
  ["Toning", "กระชับ"], ["Reshaping", "ปรับรูปร่าง"], ["Anti-Ageing", "ต้านริ้วรอย"], ["Drainage", "ระบาย"], ["Healthcare", "ฟื้นฟู"],
];

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm transition ${on ? "border-ink bg-ink text-paper" : "border-line bg-card text-ink-2 hover:border-ink"}`}>
      {children}
    </button>
  );
}

/** 3 อย่างที่หมอปรับเองได้ · เพศ/เป้าหมาย กดซ้ำ = ยกเลิก · คอร์สมีค่าเสมอ (เริ่มที่ 5 ครั้ง) */
export default function FitPanel({ fit, onChange }: { fit: Fit; onChange: (f: Fit) => void }) {
  return (
    <aside className="min-w-0 space-y-4 rounded-2xl border border-line bg-paper p-5">
      <h2 className="m-0 text-xl font-semibold text-ink">ปรับตามคนไข้</h2>
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
          {GOALS.map(([v, t]) => (
            <Chip key={v} on={fit.goal === v} onClick={() => onChange({ ...fit, goal: fit.goal === v ? null : v })}>{t}</Chip>
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
    </aside>
  );
}
