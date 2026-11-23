"use client";
import { useMemo, useState } from "react";
import type { BodyMapData, Concern, Zone } from "@/lib/bodymap/data";
import { resolveAnswer, type Course, type Fit, type Solution, type SolutionStep } from "@/lib/bodymap/solution";
import EvidenceBlock from "./EvidenceBlock";
import HandpiecePicker, { headText, type HeadChoice } from "./HandpiecePicker";
import LeadForm from "./LeadForm";
import ProgramIcon from "./ProgramIcon";
import { Status, Tag } from "./ui";

const LAYER: Record<Solution["layer"], string> = { bib: "เมนู BIB", template: "Protocol ผู้ผลิต", program: "โปรแกรม" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0 border-t border-line py-5 first:border-t-0 first:pt-0">
      <h3 className="mb-3 mt-0 text-xl font-semibold text-ink">{title}</h3>
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
            <ProgramIcon program={prog(s.programId)!} minutes={s.minutes} showMinutes={s.minutes != null} onOpen={onProgram} />
          ) : s.options.length ? (
            <div className="rounded-xl border border-dashed border-chalk p-1">
              <p className="m-0 px-1 text-center text-[11px] text-muted">เลือก 1 โปรแกรม</p>
              <div className="flex flex-wrap">
                {s.options.map((o) => prog(o) ? <ProgramIcon key={o} program={prog(o)!} onOpen={onProgram} /> : null)}
              </div>
            </div>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function Facts({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="m-0 mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
      {rows.map(([k, v]) => (<div key={k} className="min-w-0"><dt className="text-muted">{k}</dt><dd className="m-0 break-words text-ink">{v}</dd></div>))}
    </dl>
  );
}

function Plan({ sol, data, onProgram }: { sol: Solution; data: BodyMapData; onProgram: (id: string) => void }) {
  const internal = data.mode === "internal";
  const ranges = sol.layer === "template" ? Array.from(new Set(sol.steps.map((s) => s.sessions ?? ""))) : [""];
  const min = (r: string) => sol.minutesByRange?.find((m) => m.range === r)?.minutes;
  const facts: [string, string][] = [];
  if (sol.layer === "bib") facts.push(["นาทีต่อครั้ง", sol.totalMinutes != null ? `${sol.totalMinutes} นาที` : "—"]);
  if (sol.layer === "template" && sol.totalMinutes != null) facts.push(["นาทีต่อครั้ง", `${sol.totalMinutes} นาที`]);
  if (sol.sessionsText) facts.push(["จำนวนครั้ง", `${sol.sessionsText} ครั้ง`]);
  if (sol.frequency) facts.push(["ความถี่", sol.frequency]);
  if (sol.target) facts.push(["คนไข้", sol.target.replace("*", "")]);
  return (
    <div className="min-w-0">
      {sol.steps.length === 0 ? <Status show={internal}>ต้นทางยังไม่มีขั้นโปรแกรมของ Protocol นี้</Status> : null}
      {ranges.map((r) => (
        <div key={r} className="mb-3">
          {r ? <p className="mb-1 mt-0 text-sm text-ink-2">ครั้งที่ {r}{min(r) != null && sol.totalMinutes == null ? ` · ${min(r)} นาที` : ""}</p> : null}
          <Steps steps={sol.steps.filter((s) => (s.sessions ?? "") === r)} data={data} onProgram={onProgram} />
        </div>
      ))}
      {facts.length ? <Facts rows={facts} /> : null}
      {sol.assessment ? <p className="mb-0 mt-3 text-sm text-ink-2"><span className="text-muted">สภาพผิวที่ผู้ผลิตระบุ · </span>{sol.assessment}</p> : null}
      {sol.layer === "bib" && internal ? <p className="mb-0 mt-3"><Status show>นาทีรายโปรแกรมยังไม่มีในต้นทาง · แสดงเฉพาะนาทีรวม</Status></p> : null}
    </div>
  );
}

function Chip({ c, on, internal, onClick }: { c: Concern; on: boolean; internal: boolean; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick}
      className={`max-w-full rounded-full border px-3 py-1.5 text-left text-sm transition ${on ? "border-ink bg-ink text-paper" : "border-line bg-card text-ink-2 hover:border-ink"}`}>
      {c.label}{internal ? <span className="ml-1 text-[10px] opacity-60">{c.id}</span> : null}
    </button>
  );
}

export default function AnswerPanel({
  data, zone, concerns, concern, onConcern, fit, head, onHead, onProgram, onInsight,
}: {
  data: BodyMapData; zone: Zone | null; concerns: Concern[]; concern: Concern | null; onConcern: (id: string) => void;
  fit: Fit; head: HeadChoice; onHead: (h: HeadChoice) => void; onProgram: (id: string) => void; onInsight: () => void;
}) {
  const internal = data.mode === "internal";
  const course: Course = fit.course ?? 5;
  const ans = useMemo(() => (concern ? resolveAnswer(concern, fit, data) : null), [concern, fit, data]);
  const [alt, setAlt] = useState<string | null>(null);
  const [showAlt, setShowAlt] = useState(false);
  const local = concerns.filter((c) => c.zoneType === "ประจำจุด");
  const anywhere = concerns.filter((c) => c.zoneType !== "ประจำจุด");
  const [openAny, setOpenAny] = useState(false);
  const picked = ans?.alternatives.find((s) => s.id === alt) ?? null;
  const main = picked ?? ans?.primary ?? null;
  const plan = picked ? null : ans?.coursePlan ?? null;
  const hasInsight = concern ? data.insights.some((i) => i.painId === concern.id && i.course === course) : false;
  const fitText = [fit.sex === "f" ? "หญิง" : fit.sex === "m" ? "ชาย" : "", fit.goal ?? "", `คอร์ส ${course} ครั้ง`].filter(Boolean).join(" · ");
  const pick = (id: string) => { setAlt(null); setShowAlt(false); onConcern(id); };

  return (
    <div className="min-w-0 rounded-2xl border border-line bg-paper p-5 md:p-6">
      {!zone ? (
        <Section title="แตะจุดบนร่างกาย">
          <p className="m-0 text-ink-2">เลือกบริเวณที่คนไข้มาปรึกษา แล้วดูว่า icoone ใช้ Protocol ไหน ทำกี่นาที และมีหลักฐานอะไรรองรับ</p>
        </Section>
      ) : (
        <>
          <Section title={`บริเวณ · ${zone.th}`}>
            <p className="mb-2 mt-0 text-sm text-muted">คนไข้มาด้วยปัญหาอะไร</p>
            <div className="flex flex-wrap gap-2">
              {local.map((c) => <Chip key={c.id} c={c} on={concern?.id === c.id} internal={internal} onClick={() => pick(c.id)} />)}
            </div>
            {anywhere.length ? (
              <div className="mt-3">
                <button type="button" aria-expanded={openAny} onClick={() => setOpenAny(!openAny)} className="text-sm text-ink underline underline-offset-4">
                  เกิดได้ทุกบริเวณ ({anywhere.length}) {openAny ? "▴" : "▾"}
                </button>
                {openAny || anywhere.some((c) => c.id === concern?.id) ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {anywhere.map((c) => <Chip key={c.id} c={c} on={concern?.id === c.id} internal={internal} onClick={() => pick(c.id)} />)}
                  </div>
                ) : null}
              </div>
            ) : null}
            {concerns.length === 0 ? <p className="m-0 text-sm text-ink-2">เป้าหมายที่เลือกอยู่ใช้กับบริเวณอื่น ลองแตะจุดอื่นบนร่างกาย</p> : null}
          </Section>
          {concern && ans ? (
            <>
              <Section title="Protocol ที่ใช้">
                {main ? (
                  <div className="rounded-xl border border-ink bg-card p-3">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <Tag tone={main.layer === "bib" ? "rose" : "line"}>{LAYER[main.layer]}</Tag>
                      {main.course ? <Tag>คอร์ส {main.course} ครั้ง</Tag> : null}
                      {main.family ? <Tag>{main.family}</Tag> : null}
                      <Status show={internal}>ร่าง</Status>
                    </span>
                    <span className="mt-1 block break-words text-lg text-ink">{main.protocol ?? "ใช้โปรแกรมตรง"}</span>
                  </div>
                ) : <Status show={internal}>ยังไม่มี Protocol หรือโปรแกรมที่ผูกกับปัญหานี้</Status>}
                {ans.hidden.map((h) => <p key={h.id} className="mb-0 mt-2 text-sm text-muted">{h.reason}</p>)}
                {ans.alternatives.length ? (
                  <div className="mt-2">
                    <button type="button" aria-expanded={showAlt} onClick={() => setShowAlt(!showAlt)} className="text-sm text-ink underline underline-offset-4">
                      ดูทางเลือกอื่น ({ans.alternatives.length}) {showAlt ? "▴" : "▾"}
                    </button>
                    {showAlt ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {picked ? <button type="button" onClick={() => setAlt(null)} className="rounded-full border border-line bg-card px-3 py-1.5 text-sm text-ink-2 hover:border-ink">กลับไปคำตอบหลัก</button> : null}
                        {ans.alternatives.map((s) => (
                          <button key={s.id} type="button" aria-pressed={alt === s.id} onClick={() => setAlt(s.id)}
                            className={`rounded-full border px-3 py-1.5 text-sm transition ${alt === s.id ? "border-ink bg-ink text-paper" : "border-line bg-card text-ink-2 hover:border-ink"}`}>
                            {s.protocol ?? "โปรแกรมตรง"} · {LAYER[s.layer]}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {hasInsight ? (
                  <button type="button" onClick={onInsight} className="mt-3 rounded-full border border-rose bg-rose-soft px-4 py-1.5 text-sm text-ink hover:bg-rose hover:text-paper">
                    โอกาสของ Treatment นี้
                  </button>
                ) : null}
              </Section>
              {main ? (
                <Section title="วิธีทำ">
                  <Plan sol={main} data={data} onProgram={onProgram} />
                  {plan ? (
                    <div className="mt-4 rounded-xl border border-line bg-card/60 p-3">
                      <p className="mb-2 mt-0 flex flex-wrap items-center gap-1.5 text-sm text-ink">
                        <Tag>Protocol ผู้ผลิต</Tag><Tag>คอร์ส {plan.course} ครั้ง</Tag>
                        <span className="break-words">แผนรายครั้ง · {plan.protocol}</span>
                      </p>
                      <Plan sol={plan} data={data} onProgram={onProgram} />
                    </div>
                  ) : null}
                  <HandpiecePicker value={head} onChange={onHead} />
                </Section>
              ) : null}
              <Section title="หลักฐาน">
                <EvidenceBlock key={concern.id} concern={concern} data={data} />
                {concern.evidence.length + concern.cases.length === 0 && !concern.fdaBadge ? <Status show={internal}>ยังไม่มีหลักฐานหรือเคสที่ผูกกับปัญหานี้</Status> : null}
              </Section>
            </>
          ) : null}
        </>
      )}
      <LeadForm context={{ concern: concern?.id, concernLabel: concern?.label, zone: zone?.id, fit: fitText, protocol: main?.protocol, head: main ? headText(head) : undefined }} />
    </div>
  );
}
