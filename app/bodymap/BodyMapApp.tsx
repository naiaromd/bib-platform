"use client";
import { useMemo, useState } from "react";
import type { BodyMapData } from "@/lib/bodymap/data";
import { concernMatchesGoal, type Fit } from "@/lib/bodymap/solution";
import AnswerPanel from "./_components/AnswerPanel";
import BodyFigure, { type View } from "./_components/BodyFigure";
import FitPanel from "./_components/FitPanel";
import InsightDrawer from "./_components/InsightDrawer";
import ProgramSheet from "./_components/ProgramSheet";

export default function BodyMapApp({ data }: { data: BodyMapData }) {
  const [fit, setFit] = useState<Fit>({ sex: null, goal: null, course: null });
  const [view, setView] = useState<View>("front");
  const [zoneId, setZoneId] = useState<string | null>(null);
  const [concernId, setConcernId] = useState<string | null>(null);
  const [programId, setProgramId] = useState<string | null>(null);
  const [insight, setInsight] = useState(false);

  const shown = useMemo(() => data.concerns.filter((c) => concernMatchesGoal(c, fit.goal, data)), [data, fit.goal]);
  const counts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const c of shown) for (const z of c.zones) out[z] = (out[z] ?? 0) + 1;
    return out;
  }, [shown]);
  const zone = data.zones.find((z) => z.id === zoneId) ?? null;
  const inZone = zone ? shown.filter((c) => c.zones.includes(zone.id)) : [];
  const concern = inZone.find((c) => c.id === concernId) ?? null;

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-8 md:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="m-0 font-mono text-[11px] uppercase tracking-widest text-muted">icoone Laser Med · Body Map</p>
          <h1 className="m-0 font-display text-3xl leading-tight text-ink md:text-4xl">เครื่องเดียว ดูแลได้ทั้งตัว · ปรับตามคนไข้แต่ละคน</h1>
        </div>
        {data.mode === "internal" ? (
          <span className="rounded-full border border-warn px-3 py-1 text-xs text-warn">โหมดภายใน · ข้อมูลร่าง ยังไม่ผ่านการตรวจ</span>
        ) : null}
      </header>
      <div className="grid gap-6 lg:grid-cols-[250px_340px_1fr]">
        <FitPanel fit={fit} onChange={setFit} />
        <BodyFigure
          sex={fit.sex ?? "f"} view={view} onView={setView} zones={data.zones} points={data.figurePoints}
          counts={counts} active={zoneId}
          onPick={(z) => { setZoneId(z); setConcernId(null); }}
        />
        <AnswerPanel
          data={data} zone={zone} concerns={inZone} concern={concern} onConcern={setConcernId} fit={fit}
          onProgram={setProgramId} onInsight={() => setInsight(true)}
        />
      </div>
      {programId ? <ProgramSheet key={programId} id={programId} data={data} onClose={() => setProgramId(null)} /> : null}
      {insight && concern ? <InsightDrawer concern={concern} data={data} onClose={() => setInsight(false)} /> : null}
    </main>
  );
}
