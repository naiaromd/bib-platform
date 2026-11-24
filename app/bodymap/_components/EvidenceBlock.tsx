"use client";
import { useState } from "react";
import type { BodyMapData, Case, Concern, Evidence, QuestionKey } from "@/lib/bodymap/data";
import { track } from "@/lib/bodymap/events";
import { Row, Status, Tag } from "./ui";

const QUESTIONS: [QuestionKey, string][] = [
  ["works", "ได้ผลจริงไหม"], ["how", "ทำงานยังไง"], ["protocol", "ทำยังไง วัดยังไง"],
  ["safety", "ปลอดภัย ผ่านการรับรองไหม"], ["patient", "คนไข้ชอบไหม คุ้มไหม"], ["peers", "หมอคนอื่นใช้ไหม"],
];

function PaperCard({ e, internal, onRequest }: { e: Evidence; internal: boolean; onRequest?: (e: Evidence) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="rounded-xl border border-line bg-card p-4">
      <div className="mb-2 flex flex-wrap gap-1.5">
        {e.level ? <Tag tone="ink">{e.level}</Tag> : null}
        {e.relation ? <Tag tone="rose">{e.relation}</Tag> : null}
        {e.n != null ? <Tag>{e.n} คน</Tag> : null}
        <Status show={internal && !e.short}>รอเนื้อหาย่อ</Status>
        <Status show={internal && !e.locked}>{e.reviewStatus || "ร่าง"}</Status>
      </div>
      {e.headline ? <p className="m-0 text-2xl font-semibold leading-tight text-ink">{e.headline}</p> : null}
      <p className="m-0 text-base leading-snug text-ink">{e.short || e.title}</p>
      <p className="m-0 mt-1 text-xs text-muted">{[e.authors, e.year].filter(Boolean).join(" · ")}{internal ? ` · ${e.id}` : ""}</p>
      <button type="button" onClick={() => { if (!open) track("เปิดหลักฐานละเอียด", { evidence: e.id }); setOpen(!open); }} aria-expanded={open} className="mt-2 text-sm text-ink underline underline-offset-4">
        {open ? "ซ่อนรายละเอียด" : "ดูการ์ดงานวิจัย"}
      </button>
      {open ? (
        e.detail ? (
          <div className="mt-2 border-t border-line pt-2 text-sm text-ink">
            <p className="m-0 whitespace-pre-line break-words">{e.detail}</p>
            {e.url ? (
              <a href={e.url} target="_blank" rel="noreferrer" onClick={() => track("เปิดหลักฐานละเอียด", { evidence: e.id, note: "เปิดฉบับเต็ม" })} className="mt-2 inline-block rounded-full border border-ink px-4 py-1.5 text-sm text-ink hover:bg-ink hover:text-paper">อ่านฉบับเต็ม ↗</a>
            ) : onRequest ? (
              <button type="button" onClick={() => { track("ขอเอกสาร", { evidence: e.id }); onRequest(e); }} className="mt-2 rounded-full border border-ink px-4 py-1.5 text-sm text-ink hover:bg-ink hover:text-paper">ขอฉบับเต็มจากทีม</button>
            ) : null}
          </div>
        ) : (
        <dl className="m-0 mt-2">
          <Row k="ชื่องาน">{e.title}</Row>
          <Row k="ใคร · ปี">{[e.authors, e.year].filter(Boolean).join(" · ") || "—"}</Row>
          <Row k="กี่คน">{e.n != null ? `${e.n} คน` : "—"}</Row>
          <Row k="ออกแบบ">{e.level || "—"}</Row>
          <Row k="ผล">{e.summary || "—"}</Row>
          {e.canSay ? <Row k="พูดได้แค่ไหน">{e.canSay}</Row> : null}
          <Row k="ข้อจำกัด">{e.limits || "—"}</Row>
          <Row k="ลิงก์">{e.url ? <a href={e.url} target="_blank" rel="noreferrer" className="break-all underline">{e.url}</a> : "—"}</Row>
        </dl>
        )
      ) : null}
    </article>
  );
}

function CaseCard({ c, data }: { c: Case; data: BodyMapData }) {
  const [open, setOpen] = useState(false);
  const internal = data.mode === "internal";
  const names = c.programs.map((id) => data.programs.find((p) => p.id === id)?.name ?? id);
  return (
    <article className="rounded-xl border border-line bg-card p-4">
      <div className="mb-2 flex flex-wrap gap-1.5">
        <Tag tone="ink">เคสจริง</Tag>
        {c.quality ? <Tag tone="rose">คุณภาพ {c.quality}</Tag> : null}
        {c.sessions != null ? <Tag>{c.sessions} ครั้ง</Tag> : null}
        <Status show={internal && !c.short}>รอเนื้อหาย่อ</Status>
        <Status show={internal && !c.locked}>{c.reviewStatus || "ร่าง"}</Status>
      </div>
      <p className="m-0 text-base leading-snug text-ink">{c.short || c.result}</p>
      {internal ? <p className="m-0 mt-1 text-xs text-muted">{[c.topic, c.country, c.id].filter(Boolean).join(" · ")}</p> : null}
      <button type="button" onClick={() => { if (!open) track("เปิดหลักฐานละเอียด", { evidence: c.id }); setOpen(!open); }} aria-expanded={open} className="mt-2 text-sm text-ink underline underline-offset-4">
        {open ? "ซ่อนรายละเอียด" : "ดูรายละเอียดเคส"}
      </button>
      {open ? (
        <dl className="m-0 mt-2">
          {internal ? <Row k="เป้าหมาย (ต้นทาง)">{c.goal || "—"}</Row> : null}
          <Row k="ผลที่รายงาน">{c.result || "—"}</Row>
          <Row k="วิธีวัด">{c.measure || "—"}</Row>
          <Row k="จำนวนครั้ง">{c.sessions != null ? `${c.sessions} ครั้ง` : "—"}{c.frequency ? ` · ${c.frequency}` : ""}</Row>
          <Row k="นาทีต่อครั้ง">{c.minutesPerSession != null ? `${c.minutesPerSession} นาที` : "—"}</Row>
          <Row k="โปรแกรมที่ใช้">{names.length ? names.join(" + ") : c.sequence || "—"}</Row>
          <Row k="ข้อจำกัด">{c.limits || "—"}</Row>
        </dl>
      ) : null}
    </article>
  );
}

export function evidenceCount(concern: Concern, data: BodyMapData): number {
  const has = <T extends { id: string }>(rows: T[], ids: string[]) => ids.filter((i) => rows.some((r) => r.id === i)).length;
  return has(data.evidence, concern.evidence) + has(data.cases, concern.cases) + (concern.fdaBadge ? 1 : 0);
}

/** หลักฐาน = งานวิจัย + เคส · แยกตาม 6 คำถามที่หมอถาม */
export default function EvidenceBlock({ concern, data, onRequest }: { concern: Concern; data: BodyMapData; onRequest?: (e: Evidence) => void }) {
  const internal = data.mode === "internal";
  const papers = concern.evidence.map((id) => data.evidence.find((e) => e.id === id)).filter((e): e is Evidence => Boolean(e))
    .sort((a, b) => a.rank[0] - b.rank[0] || a.rank[1] - b.rank[1] || a.id.localeCompare(b.id));
  const cases = concern.cases.map((id) => data.cases.find((c) => c.id === id)).filter((c): c is Case => Boolean(c));
  const by = (q: QuestionKey) => ({
    papers: papers.filter((e) => e.questions.includes(q)),
    cases: q === "works" ? cases.filter((c) => c.quality === "A" || c.quality === "B") : q === "peers" ? cases : [],
    fda: q === "safety" && concern.fdaBadge,
  });
  const count = (q: QuestionKey) => { const x = by(q); return x.papers.length + x.cases.length + (x.fda ? 1 : 0); };
  const first = QUESTIONS.find(([q]) => count(q) > 0)?.[0] ?? "works";
  const [q, setQ] = useState<QuestionKey>(first);
  const visible = QUESTIONS.filter(([k]) => count(k) > 0);
  if (visible.length === 0) return null;
  const cur = by(visible.some(([k]) => k === q) ? q : visible[0][0]);
  const curKey = visible.some(([k]) => k === q) ? q : visible[0][0];
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2" role="tablist" aria-label="คำถามที่หมอถาม">
        {visible.map(([k, t]) => {
          const n = count(k);
          return (
            <button key={k} type="button" role="tab" aria-selected={curKey === k} onClick={() => { setQ(k); track("เปิดหลักฐานย่อ", { p: concern.id, note: t }); }}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${curKey === k ? "border-ink bg-ink text-paper" : "border-line bg-card text-ink-2 hover:border-ink"}`}>
              {t} <span className="text-xs">{n}</span>
            </button>
          );
        })}
      </div>
      <div className="space-y-3">
        {cur.fda ? (
          <div className="rounded-xl border border-good bg-card p-4">
            <Tag tone="good">FDA 510(k) cleared</Tag>
            <p className="m-0 mt-2 text-sm text-ink">ปัญหานี้อยู่ในข้อบ่งใช้ที่ FDA รับรอง · เลขทะเบียน K211272</p>
          </div>
        ) : null}
        {cur.papers.map((e) => <PaperCard key={e.id} e={e} internal={internal} onRequest={onRequest} />)}
        {cur.cases.map((c) => <CaseCard key={c.id} c={c} data={data} />)}
      </div>
    </div>
  );
}
