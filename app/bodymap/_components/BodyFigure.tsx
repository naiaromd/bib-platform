"use client";
import { FIGURES } from "@/lib/assets";
import type { FigurePoints, Zone } from "@/lib/bodymap/data";
import type { Sex } from "@/lib/bodymap/solution";

export type View = "front" | "back";

export default function BodyFigure({
  sex, view, onView, zones, points, counts, active, onPick,
}: {
  sex: Sex; view: View; onView: (v: View) => void; zones: Zone[]; points: FigurePoints;
  counts: Record<string, number>; active: string | null; onPick: (zoneId: string) => void;
}) {
  const fig = FIGURES[sex];
  const key = `${sex === "f" ? "female" : "male"}_${view}`;
  const pts = (points[key] ?? {}) as Record<string, number[][]>;
  return (
    <div className="flex min-w-0 flex-col items-center gap-3">
      <div className="relative w-full max-w-[300px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={view === "front" ? fig.front : fig.back} alt={view === "front" ? fig.altFront : fig.altBack} className="w-full select-none" draggable={false} />
        {zones.map((z) => {
          const n = z.id.slice(1);
          const count = counts[z.id] ?? 0;
          return (pts[n] ?? []).map(([x, y], i) => (
            <button
              key={z.id + i}
              type="button"
              onClick={() => onPick(z.id)}
              aria-label={`${z.th} · ${count} ปัญหา`}
              aria-pressed={active === z.id}
              style={{ left: `${x}%`, top: `${y}%` }}
              className={`absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-[11px] transition ${
                active === z.id ? "border-ink bg-ink text-paper scale-110" : count ? "border-rose bg-rose-soft text-ink hover:bg-rose hover:text-paper" : "border-line bg-paper/70 text-muted opacity-50"
              }`}
            >
              {n}
            </button>
          ));
        })}
      </div>
      <button
        type="button"
        onClick={() => onView(view === "front" ? "back" : "front")}
        className="rounded-full border border-line bg-card px-4 py-1.5 text-sm text-ink-2 hover:border-ink"
      >
        หมุนดู{view === "front" ? "ด้านหลัง" : "ด้านหน้า"}
      </button>
    </div>
  );
}
