"use client";
import { useMemo, useState } from "react";
import type { BodyMapData, Concern, Zone } from "@/lib/bodymap/data";
import { resolveSolutions, type Fit, type Solution, type SolutionStep } from "@/lib/bodymap/solution";
import EvidenceBlock from "./EvidenceBlock";
import ProgramIcon from "./ProgramIcon";
import { Status, Tag } from "./ui";

const LAYER: Record<Solution["layer"], string> = { bib: "Protocol BIB", template: "Protocol ผู้ผลิต", program: "โปรแกรม" };

function Section({ no, title, children }: { no: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line py-5 first:border-t-0 first:pt-0">
      <p className="m-0 font-mono text-[11px] uppercase tracking-widest text-muted">{no}</p>
      <h3 className="mb-3 mt-0 font-display text-xl text-ink">{title}</h3>
      {children}
    </section>
  );
}

function Steps({ steps, data, onProgram }: { steps: SolutionStep[]; data: BodyMapData; onProgram: (id: string) => void }) {
  const prog = (id: string) => data.programs.find((p) => p.id === id);
  return (
    <ol className="m-0 flex list-none flex-wrap items-start gap-1 p-0">
      {steps.map((s, i) => (
        <li key={i} className="flex items-start gap-1">
          {i > 0 ? <span className="mt-6 text-muted" aria-hidden>→</span> : null}
          {s.programId && prog(s.programId) ? (
            <ProgramIcon program={prog(s.programId)!} minutes={s.minutes} showMinutes onOpen={onProgram} />
          ) : s.options.length ? (
            <div className="rounded-xl border border-dashed border-chalk p-1">
              <p className="m-0 px-1 text-center text-[11px] text-muted">เลือก 1 โปรแกรม</p>
              <div className="flex">
                {s.options.map((o) => prog(o) ? <ProgramIcon key={o} program={prog(o)!} minutes={s.minutes} showMinutes onOpen={onProgram} /> : null)}
              </div>
            </div>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function How({ sol, data, onProgram }: { sol: Solution; data: BodyMapData; onProgram: (id: string) => void }) {
  const internal = data.mode === "internal";
  const ranges = sol.layer === "template" ? Array.from(new Set(sol.steps.map((s) => s.sessions ?? ""))) : [""];
  const facts: [string, string][] = [];
  if (sol.layer !== "program") facts.push(["นาทีต่อครั้ง", sol.totalMinutes != null ? `${sol.totalMinutes} นาที` : sol.minutesByRange?.length ? sol.minutesByRange.map((m) => `ครั้งที่ ${m.range}: ${m.minutes ?? "—"} นาที`).join(" · ") : "—"]);
  if (sol.sessionsText) facts.push(["จำนวนครั้ง", `${sol.sessionsText} ครั้ง`]);
  if (sol.frequency) facts.push(["ความถี่", sol.frequency]);
  if (sol.target) facts.push(["คนไข้", sol.target.replace("*", "")]);
  facts.push(["หัวเครื่อง", "เลือกตามบริเวณ"]);
  return (
    <div>
      {sol.steps.length === 0 ? <Status show={internal}>ต้นทางยังไม่มีขั้นโปรแกรมของ Protocol นี้</Status> : null}
      {ranges.map((r) => (
        <div key={r} className="mb-3">
          {r ? <p className="mb-1 mt-0 text-sm text-ink-2">ครั้งที่ {r}</p> : null}
          <Steps steps={sol.steps.filter((s) => (s.sessions ?? "") === r)} data={data} onProgram={onProgram} />
        </div>
      ))}
      <dl className="m-0 mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {facts.map(([k, v]) => (
          <div key={k}><dt className="text-muted">{k}</dt><dd className="m-0 text-ink">{v}</dd></div>
        ))}
      </dl>
      {sol.assessment ? <p className="mb-0 mt-3 text-sm text-ink-2"><span className="text-muted">สภาพผิวที่ผู้ผลิตระบุ · </span>{sol.assessment}</p> : null}
      {sol.layer === "bib" && internal ? <p className="mb-0 mt-3"><Status show>นาทีรายโปรแกรมยังไม่มีในต้นทาง · แสดงเฉพาะนาทีรวม</Status></p> : null}
    </div>
  );
}

export default function AnswerPanel({
  data, zone, concerns, concern, onConcern, fit, onProgram, onInsight,
}: {
  data: BodyMapData; zone: Zone | null; concerns: Concern[]; concern: Concern | null;
  onConcern: (id: string) => void; fit: Fit; onProgram: (id: string) => void; onInsight: () => void;
}) {
  const internal = data.mode === "internal";
  const resolved = useMemo(() => (concern ? resolveSolutions(concern, fit, data) : null), [concern, fit, data]);
  const [pick, setPick] = useState<string | null>(null);
  const sols = resolved?.solutions ?? [];
  const sol = sols.find((s) => s.id === pick) ?? sols[0] ?? null;
  const hasInsight = concern ? concern.psPrimary.length + concern.psSecondary.length > 0 : false;

  if (!zone) {
    return (
      <div className="rounded-2xl border border-line bg-paper p-6">
        <p className="m-0 font-mono text-[11px] uppercase tracking-widest text-muted">01 Area</p>
        <h3 className="mt-0 font-display text-2xl text-ink">แตะจุดบนร่างกาย</h3>
        <p className="m-0 text-ink-2">เลือกบริเวณที่คนไข้มาปรึกษา แล้วดูว่า icoone ใช้ Protocol ไหน ทำกี่นาที และมีหลักฐานอะไรรองรับ</p>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-line bg-paper p-6">
      <Section no="01 Area" title={zone.th}>
        <p className="m-0 text-sm text-muted">{concerns.length} ปัญหาในบริเวณนี้</p>
      </Section>
      <Section no="02 Problem" title="คนไข้มาด้วยปัญหาอะไร">
        <div className="flex flex-wrap gap-2">
          {concerns.map((c) => (
            <button key={c.id} type="button" aria-pressed={concern?.id === c.id} onClick={() => { setPick(null); onConcern(c.id); }}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${concern?.id === c.id ? "border-ink bg-ink text-paper" : "border-line bg-card text-ink-2 hover:border-ink"}`}>
              {c.label}{internal ? <span className="ml-1 font-mono text-[10px] opacity-60">{c.id}</span> : null}
            </button>
          ))}
        </div>
      </Section>
      {concern ? (
        <>
          <Section no="03 Solution" title="ใช้ Protocol ไหน">
            {sols.length === 0 ? <Status show={internal}>ยังไม่มี Protocol หรือโปรแกรมที่ผูกกับปัญหานี้</Status> : (
              <div className="grid gap-2">
                {sols.map((s) => (
                  <button key={s.id} type="button" aria-pressed={sol?.id === s.id} onClick={() => setPick(s.id)}
                    className={`rounded-xl border p-3 text-left transition ${sol?.id === s.id ? "border-ink bg-card" : "border-line bg-card/60 hover:border-ink"}`}>
                    <span className="flex flex-wrap items-center gap-1.5">
                      <Tag tone={s.layer === "bib" ? "rose" : "line"}>{LAYER[s.layer]}</Tag>
                      {s.course ? <Tag>คอร์ส {s.course} ครั้ง</Tag> : null}
                      {s.family ? <Tag>{s.family}</Tag> : null}
                      <Status show={internal}>ร่าง</Status>
                    </span>
                    <span className="mt-1 block text-base text-ink">{s.protocol ?? "ใช้โปรแกรมตรง"}</span>
                    {s.layer === "bib" && internal && s.menu ? <span className="block text-xs text-muted">ชื่อหน้าลูกค้า: {s.menu}</span> : null}
                  </button>
                ))}
              </div>
            )}
            {(resolved?.hidden ?? []).map((h) => <p key={h.id} className="mb-0 mt-2 text-sm text-muted">{h.reason}</p>)}
            {hasInsight ? (
              <button type="button" onClick={onInsight} className="mt-3 rounded-full border border-rose bg-rose-soft px-4 py-1.5 text-sm text-ink hover:bg-rose hover:text-paper">
                ดู Insight คนไข้กลุ่มนี้
              </button>
            ) : null}
          </Section>
          {sol ? (
            <Section no="04 How" title="ทำยังไง">
              <How sol={sol} data={data} onProgram={onProgram} />
            </Section>
          ) : null}
          <Section no="05 Evidence" title="หลักฐาน">
            <EvidenceBlock key={concern.id} concern={concern} data={data} />
            {concern.evidence.length + concern.cases.length === 0 && !concern.fdaBadge ? <Status show={internal}>ยังไม่มีหลักฐานหรือเคสที่ผูกกับปัญหานี้</Status> : null}
          </Section>
        </>
      ) : null}
    </div>
  );
}
