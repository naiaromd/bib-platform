"use client";
import { useEffect, useMemo, useState } from "react";
import type { BodyMapData } from "@/lib/bodymap/data";
import { setContext, track } from "@/lib/bodymap/events";
import { concernMatchesGoal, DEFAULT_FIT, type Fit } from "@/lib/bodymap/solution";
import AnswerPanel from "./_components/AnswerPanel";
import BodyFigure, { type View } from "./_components/BodyFigure";
import ConsentBar from "./_components/ConsentBar";
import FitPanel from "./_components/FitPanel";
import { headText, type HeadChoice } from "./_components/HandpiecePicker";
import ProblemPicker from "./_components/ProblemPicker";
import ProgramSheet from "./_components/ProgramSheet";
import { GOAL_TH } from "./_components/words";

const fitLabel = (f: Fit) => [f.sex === "f" ? "หญิง" : f.sex === "m" ? "ชาย" : "ไม่ระบุเพศ", f.goal ? GOAL_TH[f.goal] : "ทุกเป้าหมาย", `คอร์ส ${f.course ?? 5}`].join(" · ");

export default function BodyMapApp({ data }: { data: BodyMapData }) {
  const [fit, setFitState] = useState<Fit>(DEFAULT_FIT);
  const [view, setView] = useState<View>("front");
  const [zoneId, setZoneId] = useState<string | null>(null);
  const [concernId, setConcernId] = useState<string | null>(null);
  const [programId, setProgramId] = useState<string | null>(null);
  const [head, setHead] = useState<HeadChoice>({ hp: "RS", suc: 50, led: false, las: false });

  useEffect(() => { setContext({ fit: fitLabel(DEFAULT_FIT), mode: data.mode === "internal" ? "ภายใน" : "นำเสนอ" }); track("เปิดหน้า"); }, [data.mode]);

  const shown = useMemo(() => data.concerns.filter((c) => concernMatchesGoal(c, fit.goal, data)), [data, fit.goal]);
  const counts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const c of shown) for (const z of c.zones) out[z] = (out[z] ?? 0) + 1;
    return out;
  }, [shown]);
  const zone = data.zones.find((z) => z.id === zoneId) ?? null;
  const inZone = zone ? shown.filter((c) => c.zones.includes(zone.id)) : [];
  const concern = inZone.find((c) => c.id === concernId) ?? null;

  const setFit = (f: Fit) => { setFitState(f); setContext({ fit: fitLabel(f) }); track("เลือก Fit", { note: fitLabel(f) }); };
  const pickConcern = (id: string) => { setConcernId(id); track("เปิดปัญหา", { p: id, z: zoneId ?? undefined }); };
  const changeHead = (h: HeadChoice) => { setHead(h); track("เลือกหัวเครื่อง", { p: concern?.id, note: headText(h) }); };

  return (
    <main className="mx-auto w-full max-w-[1280px] overflow-x-hidden px-4 pb-24 pt-4 lg:pb-8 lg:pt-8 md:px-8">
      <header className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 text-sm text-muted">icoone Laser Med</p>
          <h1 className="m-0 text-xl font-semibold leading-tight text-ink md:text-3xl">เครื่องเดียว ดูแลได้ทั้งตัว · ปรับตามคนไข้แต่ละคน</h1>
        </div>
        {data.mode === "internal" ? (
          <span className="rounded-full border border-warn px-3 py-1 text-xs text-warn">โหมดภายใน · ข้อมูลร่าง ยังไม่ผ่านการตรวจ</span>
        ) : null}
      </header>
      <div className="grid min-w-0 gap-3 lg:grid-cols-[230px_260px_minmax(0,1fr)] lg:items-start lg:gap-6">
        <FitPanel fit={fit} onChange={setFit} />
        <div className="grid min-w-0 grid-cols-[140px_minmax(0,1fr)] items-start gap-3 lg:block">
          <BodyFigure
            sex={fit.sex ?? "f"} view={view} zones={data.zones} points={data.figurePoints} counts={counts} active={zoneId}
            onView={(v) => { setView(v); track("หมุนรูป", { note: v === "front" ? "ด้านหน้า" : "ด้านหลัง" }); }}
            onPick={(z) => { setZoneId(z); setConcernId(null); track("กดจุด", { z }); }}
          />
          <div className="min-w-0 lg:hidden">
            <ProblemPicker zone={zone} concerns={inZone} concernId={concernId} internal={data.mode === "internal"} onConcern={pickConcern} />
          </div>
        </div>
        <AnswerPanel
          data={data} zone={zone} concerns={inZone} concern={concern} fit={fit} head={head} onHead={changeHead}
          onConcern={pickConcern}
          onProgram={setProgramId}
        />
      </div>
      {programId ? <ProgramSheet key={programId} id={programId} data={data} onClose={() => setProgramId(null)} /> : null}
      <ConsentBar onAnswer={(v) => { if (v === "yes") track("เปิดหน้า", { note: "ยอมรับการเก็บข้อมูล" }); }} />
    </main>
  );
}
