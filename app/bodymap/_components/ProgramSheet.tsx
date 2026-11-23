"use client";
import { useState } from "react";
import type { BodyMapData } from "@/lib/bodymap/data";
import { Row, Sheet, Status, Tag } from "./ui";

/** แตะไอคอน → ย่อ (1 บรรทัด) · กด "ดูละเอียด" → ละเอียดจากคู่มือผู้ผลิต */
export default function ProgramSheet({ id, data, onClose }: { id: string; data: BodyMapData; onClose: () => void }) {
  const [detail, setDetail] = useState(false);
  const p = data.programs.find((x) => x.id === id);
  if (!p) return null;
  const internal = data.mode === "internal";
  const inTemplates = data.templates.filter((t) => t.steps.some((s) => s.programId === id)).map((t) => t.name);
  const inBib = data.bibProtocols.filter((b) => b.steps.some((s) => s.programId === id || s.options.includes(id))).map((b) => b.name);
  const ev = (data.evidenceByProgram[id] ?? []).map((e) => data.evidence.find((x) => x.id === e)).filter(Boolean);
  const group = { base: "Base", focus: "Focus", healthcare: "Healthcare" }[p.group.toLowerCase()] ?? p.group;
  return (
    <Sheet title={p.name} kicker={`โปรแกรม · ${group}`} onClose={onClose}>
      <div className="mb-3 flex flex-wrap gap-2">
        {p.effectTags ? <Tag>{p.effectTags}</Tag> : null}
        <Status show={internal && !p.locked}>ร่าง · ยังไม่ติ๊ก 🔒</Status>
      </div>
      {p.short ? <p className="text-lg leading-snug text-ink">{p.short}</p> : <Status show={internal}>รอเนื้อหาย่อ 1 บรรทัด</Status>}
      <button type="button" onClick={() => setDetail(!detail)} aria-expanded={detail} className="mt-4 rounded-full border border-ink px-4 py-1.5 text-sm text-ink hover:bg-ink hover:text-paper">
        {detail ? "ซ่อนรายละเอียด" : "ดูละเอียด"}
      </button>
      {detail ? (
        <dl className="mt-4">
          <Row k="เป้าหมายของโปรแกรม">{p.aim || "—"}</Row>
          <Row k="เหมาะกับสภาพผิวแบบไหน">{p.exam || "—"}</Row>
          <Row k="ท่าคนไข้">{p.position || "—"}</Row>
          <Row k="หัวที่ใช้">เลือกตามบริเวณ</Row>
          <Row k="นาทีตั้งต้น">{p.defaultMinutes != null ? `${p.defaultMinutes} นาที` : "—"}</Row>
          {p.notes ? <Row k="วิธีทำจากคู่มือ">{p.notes}</Row> : null}
          <Row k="อยู่ใน Protocol">
            {inBib.length + inTemplates.length === 0 ? "—" : (
              <span className="flex flex-wrap gap-1.5">
                {inBib.map((n) => <Tag key={"b" + n} tone="rose">{n}</Tag>)}
                {inTemplates.map((n, i) => <Tag key={"t" + i}>{n}</Tag>)}
              </span>
            )}
          </Row>
          <Row k="หลักฐานที่ผูก">
            {ev.length === 0 ? "—" : (
              <ul className="m-0 list-none space-y-1 p-0">
                {ev.map((e) => e && <li key={e.id}><span className="font-mono text-[11px] text-muted">{e.id}</span> {e.title}</li>)}
              </ul>
            )}
          </Row>
          {internal && p.sourcePage ? <Row k="ที่มา">คู่มือผู้ผลิต หน้า {p.sourcePage}</Row> : null}
        </dl>
      ) : null}
    </Sheet>
  );
}
