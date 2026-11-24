"use client";
// แท็บ "โอกาสของคลินิก" · สรุปให้หมออ่านใน 20 วินาที + เครื่องคำนวณรายได้จากตัวเลขของคลินิกเอง
// ตัวเลขที่มาจากข้อมูล: นาทีต่อครั้ง · จำนวนครั้งของคอร์ส · ความถี่ · เราไม่ใส่ราคาให้ (ยังไม่มีราคายืนยัน) หมอกรอกเอง
// ค่าที่หมอกรอกเก็บเป็น event "คำนวณ ROI" และติดไปกับลีดเมื่อส่งฟอร์ม
import { useEffect, useRef, useState } from "react";
import type { Insight } from "@/lib/bodymap/data";
import { track } from "@/lib/bodymap/events";
import { Status, Tag } from "./ui";

type Line = { label: string; text: string; icon: string };
const ICONS: [RegExp, string, string][] = [
  [/^แผนดูแลที่เปิดขายได้:\s*/, "แผนดูแลที่เปิดขายได้", "◆"],
  [/^แผนดูแลอื่นที่ใช้ได้:\s*/, "ใช้แผนอื่นแทนได้", "◇"],
  [/^คอร์ส\s/, "คอร์ส", "◷"],
  [/^คนไข้กลุ่มเดียวกันมักมีเรื่อง\s*/, "ต่อยอดไปบริเวณอื่น", "↗"],
  [/^ใช้โปรแกรม\s/, "โปรแกรม", "◆"],
];
function parse(text: string): Line[] {
  return text.split("\n").map((t) => t.trim()).filter(Boolean).map((t) => {
    const hit = ICONS.find(([re]) => re.test(t));
    if (!hit) return { label: "", text: t, icon: "•" };
    const [re, label, icon] = hit;
    return { label, text: label === "คอร์ส" ? t : t.replace(re, ""), icon };
  });
}
const baht = (n: number) => n.toLocaleString("th-TH", { maximumFractionDigits: 0 });
const num = (s: string) => { const n = Number(s.replace(/[^\d.]/g, "")); return Number.isFinite(n) && n > 0 ? n : null; };

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-card p-3">
      <p className="m-0 text-xs text-muted">{label}</p>
      <p className="m-0 text-xl font-semibold leading-tight text-ink">{value}</p>
    </div>
  );
}

function Roi({ course, minutes, concernId }: { course: number; minutes: number | null; concernId: string }) {
  const [price, setPrice] = useState("");
  const [people, setPeople] = useState("");
  const [cost, setCost] = useState("");
  const p = num(price), n = num(people), c = num(cost);
  const perPerson = p ? p * course : null;
  const perMonth = perPerson && n ? perPerson * n : null;
  const hours = minutes && n ? (minutes * course * n) / 60 : null;
  const breakeven = perPerson && c ? Math.ceil(c / perPerson) : null;
  const sent = useRef("");
  useEffect(() => {
    const note = `ราคา/ครั้ง ${price || "-"} · คนไข้/เดือน ${people || "-"} · ค่าเครื่อง/เดือน ${cost || "-"} · คอร์ส ${course}`;
    if (!p && !n && !c) return;
    const id = window.setTimeout(() => { if (sent.current !== note) { sent.current = note; track("คำนวณ ROI", { p: concernId, note }); } }, 1200);
    return () => window.clearTimeout(id);
  }, [price, people, cost, course, concernId, p, n, c]);
  const field = (label: string, v: string, set: (x: string) => void, ph: string, unit: string) => (
    <label className="block min-w-0 text-sm text-ink-2">
      {label}
      <span className="mt-1 flex items-center gap-2">
        <input inputMode="numeric" value={v} onChange={(e) => set(e.target.value)} placeholder={ph}
          className="block w-full min-w-0 rounded-lg border border-line bg-card px-3 py-2 text-base text-ink outline-none focus:border-ink" />
        <span className="flex-none text-sm text-muted">{unit}</span>
      </span>
    </label>
  );
  return (
    <section className="mt-4 rounded-xl border border-ink bg-paper p-3">
      <h4 className="m-0 text-base font-semibold text-ink">คำนวณรายได้ด้วยตัวเลขของคลินิกคุณ</h4>
      <p className="m-0 mt-1 text-xs text-muted">ใส่ราคาและจำนวนคนไข้ของคุณเอง · คอร์ส {course} ครั้ง{minutes ? ` · ครั้งละ ${minutes} นาที` : ""} ตามแผนดูแลนี้</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {field("ราคาต่อครั้ง", price, setPrice, "เช่น 3500", "บาท")}
        {field("คนไข้ใหม่ต่อเดือน", people, setPeople, "เช่น 8", "คน")}
        {field("ค่าเครื่องต่อเดือน (ถ้ามี)", cost, setCost, "ค่าผ่อน", "บาท")}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Stat label="รายได้ต่อคนต่อคอร์ส" value={perPerson ? `฿${baht(perPerson)}` : "—"} />
        <Stat label="รายได้ต่อเดือน" value={perMonth ? `฿${baht(perMonth)}` : "—"} />
        <Stat label="เวลาเครื่องที่ใช้ต่อเดือน" value={hours ? `${baht(Math.round(hours))} ชม.` : "—"} />
        <Stat label="คนไข้ที่ต้องมีเพื่อคุ้มค่าเครื่อง" value={breakeven ? `${breakeven} คน/เดือน` : "—"} />
      </div>
    </section>
  );
}

export default function ChanceTab({ insight, course, minutes, internal }: { insight: Insight; course: number; minutes: number | null; internal: boolean }) {
  const lines = parse(insight.opportunity);
  const courseLine = lines.find((l) => l.label === "คอร์ส");
  const freq = courseLine?.text.match(/สัปดาห์ละ\s*\d+\s*ครั้ง/)?.[0] ?? "";
  return (
    <div>
      <div className="flex flex-wrap gap-1.5"><Status show={internal && !insight.locked}>ร่าง</Status>{internal ? <Tag>{insight.id}</Tag> : null}</div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        <Stat label="คอร์ส" value={`${course} ครั้ง`} />
        <Stat label="ต่อครั้ง" value={minutes ? `${minutes} นาที` : "—"} />
        <Stat label="ความถี่" value={freq ? freq.replace("สัปดาห์ละ", "").trim() + "/สัปดาห์" : "—"} />
      </div>
      {insight.who ? (
        <section className="mt-4">
          <h4 className="mb-1 mt-0 text-sm font-normal text-muted">คนไข้กลุ่มนี้</h4>
          <p className="m-0 text-base leading-relaxed text-ink">{insight.who}</p>
        </section>
      ) : null}
      <section className="mt-4">
        <h4 className="mb-2 mt-0 text-sm font-normal text-muted">โอกาสของคลินิก</h4>
        <ul className="m-0 grid list-none gap-2 p-0">
          {lines.map((l, i) => (
            <li key={i} className="flex min-w-0 gap-2 rounded-xl bg-card p-3">
              <span aria-hidden className="flex-none text-rose">{l.icon}</span>
              <span className="min-w-0 break-words text-sm text-ink">
                {l.label && l.label !== "คอร์ส" ? <span className="block text-xs text-muted">{l.label}</span> : null}
                {l.text}
              </span>
            </li>
          ))}
        </ul>
      </section>
      {insight.proof ? (
        <section className="mt-4 rounded-xl border-l-4 border-rose bg-card p-3" style={{ borderRadius: 0 }}>
          <h4 className="mb-1 mt-0 text-sm font-normal text-muted">หลักฐานที่ใช้คุยกับคนไข้</h4>
          <p className="m-0 text-base text-ink">{insight.proof}</p>
        </section>
      ) : null}
      <Roi course={course} minutes={minutes} concernId={insight.painId} />
    </div>
  );
}
