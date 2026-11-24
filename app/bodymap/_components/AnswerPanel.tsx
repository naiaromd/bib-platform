"use client";
import { useEffect, useMemo, useState } from "react";
import type { BodyMapData, Concern, Evidence, Zone } from "@/lib/bodymap/data";
import { track } from "@/lib/bodymap/events";
import { resolveAnswer, type Course, type Fit, type Solution, type SolutionStep } from "@/lib/bodymap/solution";
import ChanceTab from "./ChanceTab";
import MarketTab from "./MarketTab";
import { FACE_ZONES } from "@/lib/bodymap/pricing";
import EvidenceBlock, { evidenceCount } from "./EvidenceBlock";
import HandpiecePicker, { headText, type HeadChoice } from "./HandpiecePicker";
import LeadForm from "./LeadForm";
import ProblemPicker from "./ProblemPicker";
import ProgramIcon from "./ProgramIcon";
import { Sheet, Status, Tag } from "./ui";
import { GOAL_TH, LAYER, freqTh, planSub, planTitle, targetTh } from "./words";

type TabKey = "how" | "proof" | "chance" | "market" | "other";

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
              <p className="m-0 px-1 text-center text-xs text-muted">เลือก 1 โปรแกรม</p>
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

function Plan({ sol, data, onProgram }: { sol: Solution; data: BodyMapData; onProgram: (id: string) => void }) {
  const internal = data.mode === "internal";
  const ranges = sol.layer === "template" ? Array.from(new Set(sol.steps.map((s) => s.sessions ?? ""))) : [""];
  const min = (r: string) => sol.minutesByRange?.find((m) => m.range === r)?.minutes;
  const facts: [string, string][] = [];
  if (sol.layer === "template" && sol.totalMinutes != null) facts.push(["นาทีต่อครั้ง", `${sol.totalMinutes} นาที`]);
  if (sol.sessionsText) facts.push(["จำนวนครั้ง", `${sol.sessionsText.replace(/\s*\(.*\)/, "")} ครั้ง`]);
  if (sol.frequency) facts.push(["ความถี่", freqTh(sol.frequency)]);
  if (sol.target) facts.push(["คนไข้", targetTh(sol.target)]);
  return (
    <div className="min-w-0">
      {sol.steps.length === 0 ? <Status show={internal}>ต้นทางยังไม่มีขั้นโปรแกรมของแผนนี้</Status> : null}
      {ranges.map((r) => (
        <div key={r} className="mb-3">
          {r ? <p className="mb-1 mt-0 text-sm text-ink-2">ครั้งที่ {r}{min(r) != null && sol.totalMinutes == null ? ` · ${min(r)} นาที` : ""}</p> : null}
          <Steps steps={sol.steps.filter((s) => (s.sessions ?? "") === r)} data={data} onProgram={onProgram} />
        </div>
      ))}
      {facts.length ? (
        <dl className="m-0 mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {facts.map(([k, v]) => (<div key={k} className="min-w-0"><dt className="text-muted">{k}</dt><dd className="m-0 break-words text-ink">{v}</dd></div>))}
        </dl>
      ) : null}
      {sol.layer === "bib" && internal ? <p className="mb-0 mt-3"><Status show>นาทีรายโปรแกรมยังไม่มีในต้นทาง · แสดงเฉพาะนาทีรวม</Status></p> : null}
    </div>
  );
}

function PlanCard({ s, course, internal, selected, onClick }: { s: Solution; course: Course; internal: boolean; selected?: boolean; onClick?: () => void }) {
  const sub = planSub(s);
  const meta = [s.totalMinutes != null ? `${s.totalMinutes} นาทีต่อครั้ง` : "", s.layer === "program" ? "" : `คอร์ส ${s.course ?? course} ครั้ง`].filter(Boolean).join(" · ");
  const inner = (
    <>
      <span className="flex flex-wrap items-center gap-1.5">
        {internal ? <Tag tone={s.layer === "bib" ? "rose" : "line"}>{LAYER[s.layer]}</Tag> : null}
        {s.family ? <Tag>{GOAL_TH[s.family] ?? s.family}</Tag> : null}
        <Status show={internal}>ร่าง</Status>
      </span>
      <span className="mt-1 block break-words text-xl font-semibold leading-snug text-ink">{planTitle(s)}</span>
      {sub ? <span className="block break-words text-sm text-muted">{sub}</span> : null}
      {meta ? <span className="mt-1 block text-sm text-ink-2">{meta}</span> : null}
    </>
  );
  const cls = `block w-full rounded-xl border bg-card p-3 text-left ${selected === false ? "border-line hover:border-ink" : "border-ink"}`;
  return onClick ? <button type="button" onClick={onClick} className={cls}>{inner}</button> : <div className={cls}>{inner}</div>;
}

export default function AnswerPanel({
  data, zone, concerns, concern, onConcern, fit, head, onHead, onProgram, counts, onZone,
}: {
  data: BodyMapData; zone: Zone | null; concerns: Concern[]; concern: Concern | null; onConcern: (id: string) => void;
  fit: Fit; head: HeadChoice; onHead: (h: HeadChoice) => void; onProgram: (id: string) => void;
  counts?: Record<string, number>; onZone?: (id: string) => void;
}) {
  const internal = data.mode === "internal";
  const course: Course = fit.course ?? 5;
  const ans = useMemo(() => (concern ? resolveAnswer(concern, fit, data) : null), [concern, fit, data]);
  const [alt, setAlt] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("how");
  const [form, setForm] = useState<null | "demo" | "line">(null);
  const [doc, setDoc] = useState<Evidence | null>(null);
  // กลุ่มคนไข้ที่หมอเลือก · ใช้ร่วมกันระหว่างแท็บคืนทุนกับ Market Insight · ตั้งต้น = กลุ่มที่ผูกกับปัญหาที่เปิดอยู่
  const [segs, setSegs] = useState<string[]>(() => (concern ? [...concern.psPrimary, ...concern.psSecondary] : []));
  useEffect(() => { setSegs(concern ? [...concern.psPrimary, ...concern.psSecondary] : []); }, [concern]);
  const togglePs = (id: string) => setSegs((x) => (x.includes(id) ? x.filter((y) => y !== id) : [...x, id]));
  useEffect(() => { setAlt(null); setTab("how"); }, [concern?.id]);

  const picked = ans?.alternatives.find((s) => s.id === alt) ?? null;
  const main = picked ?? ans?.primary ?? null;
  const plan = picked ? null : ans?.coursePlan ?? null;
  const insight = concern ? data.insights.find((i) => i.painId === concern.id && i.course === course) : undefined;
  const others = ans ? [...(picked && ans.primary ? [ans.primary] : []), ...ans.alternatives.filter((s) => s.id !== alt)] : [];
  const tabs: [TabKey, string][] = [];
  if (main) tabs.push(["how", "วิธีทำ"]);
  if (concern && evidenceCount(concern, data) > 0) tabs.push(["proof", "หลักฐาน"]);
  tabs.push(["chance", "คำนวณการคืนทุน"]);
  tabs.push(["market", "Market Insight"]);
  if (others.length) tabs.push(["other", "ทางเลือกอื่น"]);
  const cur = tabs.some(([k]) => k === tab) ? tab : tabs[0]?.[0];
  const fitText = [fit.sex === "f" ? "หญิง" : fit.sex === "m" ? "ชาย" : "", fit.goal ? GOAL_TH[fit.goal] : "", `คอร์ส ${course} ครั้ง`].filter(Boolean).join(" · ");
  const go = (k: TabKey) => { setTab(k); if (k === "chance") track("เปิด Insight", { p: concern?.id }); if (k === "market") track("เปิด Insight", { p: concern?.id, note: "market" }); if (k === "proof") track("เปิดหลักฐานย่อ", { p: concern?.id }); };

  return (
    <div className={`flex min-w-0 flex-col rounded-2xl lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:border lg:border-line lg:bg-paper ${concern ? "border border-line bg-paper" : ""}`}>
      <div className={`min-w-0 p-4 md:p-5 ${concern ? "" : "hidden lg:block"}`}>
        <div className="hidden lg:block"><ProblemPicker zone={zone} concerns={concerns} concernId={concern?.id ?? null} internal={internal} onConcern={onConcern} zones={data.zones} counts={counts} onZone={onZone} /></div>
            {concern && ans ? (
              <div className="lg:mt-4">
                <p className="mb-2 mt-0 text-sm text-muted">แผนดูแล</p>
                {main ? <PlanCard s={main} course={course} internal={internal} /> : concern.scope === "study" ? (
                  <div className="rounded-xl border border-line bg-card p-3">
                    <p className="m-0 text-base font-semibold text-ink">icoone อาจเป็นส่วนหนึ่งของแผนดูแล</p>
                    <p className="m-0 mt-1 text-sm text-ink-2">ปัญหานี้มีได้หลายสาเหตุ และมักดูแลด้วยหลายวิธีร่วมกัน ทีมยังรวบรวมข้อมูลเฉพาะเรื่องนี้อยู่ กด &quot;ขอเดโม&quot; หรือ &quot;คุยทาง LINE&quot; เพื่อศึกษาร่วมกับทีม</p>
                  </div>
                ) : <Status show={internal}>ยังไม่มีแผนดูแลหรือโปรแกรมที่ผูกกับปัญหานี้</Status>}
                {ans.hidden.map((h) => <p key={h.id} className="mb-0 mt-2 text-sm text-muted">{h.reason}</p>)}
              </div>
            ) : null}
      </div>
      {concern && ans && tabs.length ? (
        <>
          <div role="tablist" aria-label="รายละเอียดแผนดูแล" className="flex min-w-0 flex-wrap gap-x-1 border-y border-line px-3 md:px-4">
            {tabs.map(([k, t]) => (
              <button key={k} type="button" role="tab" aria-selected={cur === k} onClick={() => go(k)}
                className={`-mb-px border-b-2 px-2.5 py-2.5 text-sm transition ${cur === k ? "border-ink font-semibold text-ink" : "border-transparent text-ink-2 hover:text-ink"}`}>
                {t}{k === "chance" ? <span aria-hidden className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-rose align-middle" /> : null}
              </button>
            ))}
          </div>
          <div role="tabpanel" className="min-h-0 min-w-0 flex-1 p-4 md:p-5 lg:overflow-y-auto">
            {cur === "how" && main ? (
              <>
                <Plan sol={main} data={data} onProgram={onProgram} />
                {plan ? (
                  <div className="mt-4 rounded-xl border border-line bg-card/60 p-3">
                    <p className="mb-2 mt-0 flex flex-wrap items-center gap-1.5 text-sm text-ink">
                      {internal ? <Tag>{LAYER.template}</Tag> : null}<Tag>คอร์ส {plan.course} ครั้ง</Tag>
                      <span className="break-words">แผนรายครั้ง · {planTitle(plan)}</span>
                    </p>
                    <Plan sol={plan} data={data} onProgram={onProgram} />
                  </div>
                ) : null}
                <HandpiecePicker value={head} onChange={onHead} />
              </>
            ) : null}
            {cur === "proof" ? <EvidenceBlock key={concern.id} concern={concern} data={data} onRequest={(e) => { setDoc(e); setForm("line"); }} /> : null}
            {cur === "chance" ? <ChanceTab insight={insight ?? null} concern={concern} data={data} picked={segs} onToggle={togglePs} internal={internal} face={concern.zones.every((z) => FACE_ZONES.includes(z))} sex={fit.sex} onDemo={() => { setDoc(null); setForm("demo"); }} onLine={() => { setDoc(null); setForm("line"); }} /> : null}
            {cur === "market" ? <MarketTab groups={data.patientSituations} picked={segs} onToggle={togglePs} /> : null}
            {cur === "other" ? (
              <div className="grid gap-2">
                {others.map((s) => (
                  <PlanCard key={s.id} s={s} course={course} internal={internal} selected={false}
                    onClick={() => { setAlt(s === ans.primary ? null : s.id); setTab("how"); }} />
                ))}
              </div>
            ) : null}
          </div>
        </>
      ) : <div className="hidden flex-1 lg:block" />}
      <div className={`fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-line bg-paper p-3 lg:static lg:z-auto lg:rounded-b-2xl${concern && cur === "chance" ? " hidden lg:hidden" : ""}`}>
        <button type="button" onClick={() => { setDoc(null); setForm("demo"); }} className="flex-1 rounded-full border border-ink bg-ink px-4 py-2.5 text-base text-paper">ขอเดโม</button>
        <button type="button" onClick={() => { setDoc(null); setForm("line"); }} className="flex-1 rounded-full border border-good bg-card px-4 py-2.5 text-base text-good hover:bg-good hover:text-paper">คุยทาง LINE</button>
      </div>
      {form ? (
        <Sheet title={doc ? "ขอฉบับเต็ม" : form === "demo" ? "ขอเดโม" : "คุยทาง LINE"} onClose={() => { setForm(null); setDoc(null); }}>
          <LeadForm viaLine={form === "line"} context={{ concern: concern?.id, concernLabel: concern?.label, zone: zone?.id, fit: fitText, plan: main ? planTitle(main) : undefined, head: main ? headText(head) : undefined, doc: doc?.id, docTitle: doc?.title }} />
        </Sheet>
      ) : null}
    </div>
  );
}
