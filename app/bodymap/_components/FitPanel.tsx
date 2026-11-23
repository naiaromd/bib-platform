"use client";
import type { Fit, Goal, Sex, Course } from "@/lib/bodymap/solution";

const GOALS: [Goal, string][] = [
  ["Toning", "กระชับ"], ["Reshaping", "ปรับรูปร่าง"], ["Anti-Ageing", "ต้านริ้วรอย"], ["Drainage", "ระบาย"], ["Healthcare", "ฟื้นฟู"],
];

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm transition ${on ? "border-ink bg-ink text-paper" : "border-line bg-card text-ink-2 hover:border-ink"}`}
    >
      {children}
    </button>
  );
}

/** Fit = 3 อย่างที่หมอปรับเองได้ · กดซ้ำ = ยกเลิก (ไม่เลือก = แสดงทั้งหมด) */
export default function FitPanel({ fit, onChange }: { fit: Fit; onChange: (f: Fit) => void }) {
  const tog = <K extends keyof Fit>(k: K, v: Fit[K]) => onChange({ ...fit, [k]: fit[k] === v ? null : v });
  return (
    <aside className="space-y-5 rounded-2xl border border-line bg-paper p-5">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted">Fit</p>
        <h2 className="font-display text-xl text-ink">ปรับให้ตรงกับคนไข้</h2>
      </div>
      <div>
        <p className="mb-2 text-sm text-ink-2">เพศคนไข้</p>
        <div className="flex flex-wrap gap-2">
          {([["f", "หญิง"], ["m", "ชาย"]] as [Sex, string][]).map(([v, t]) => (
            <Chip key={v} on={fit.sex === v} onClick={() => tog("sex", v)}>{t}</Chip>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm text-ink-2">เป้าหมาย</p>
        <div className="flex flex-wrap gap-2">
          {GOALS.map(([v, t]) => (
            <Chip key={v} on={fit.goal === v} onClick={() => tog("goal", v)}>{t}</Chip>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm text-ink-2">คอร์ส</p>
        <div className="flex flex-wrap gap-2">
          {([5, 10] as Course[]).map((v) => (
            <Chip key={v} on={fit.course === v} onClick={() => tog("course", v)}>{v} ครั้ง</Chip>
          ))}
        </div>
      </div>
    </aside>
  );
}
