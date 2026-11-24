"use client";
// แท็บ "โอกาสของคลินิก" · เครื่องคำนวณอยู่บนสุด (หมอใช้ตัวเลขของคลินิกเอง) แล้วตามด้วยสรุปกลุ่มคนไข้และทางต่อยอด
// ตัวเลขจากข้อมูล: จำนวนครั้งของคอร์ส · นาทีต่อครั้งของแผนที่เลือก (แก้ได้) · เราไม่ใส่ราคาให้ (ยังไม่มีราคายืนยัน)
// ค่าที่หมอกรอกเก็บเป็น event "คำนวณ ROI" และติดไปกับลีดเมื่อส่งฟอร์ม
import { useEffect, useRef, useState } from "react";
import type { Insight } from "@/lib/bodymap/data";
import { track } from "@/lib/bodymap/events";
import { Status, Tag } from "./ui";

type Line = { label: string; text: string; icon: string };
const RULES: [RegExp, string, string][] = [
  [/^แผนดูแลที่เปิดขายได้:\s*/, "แผนของ BIB ที่เปิดขายได้", "◆"],
  [/^แผนดูแลอื่นที่ใช้ได้:\s*/, "ใช้แผนอื่นแทนได้", "◇"],
  [/^คอร์ส\s\d+\sครั้ง\sตามแผนของผู้ผลิต\s*/, "หรือทำตามแผนของผู้ผลิต (นาทีต่างจากแผนของ BIB)", "◷"],
  [/^คนไข้กลุ่มเดียวกันมักมีเรื่อง\s*/, "ต่อยอดไปเรื่องอื่น", "↗"],
  [/^ใช้โปรแกรม\s/, "โปรแกรม", "◆"],
];
function parse(text: string): Line[] {
  return text.split("\n").map((t) => t.trim()).filter(Boolean).map((t) => {
    const hit = RULES.find(([re]) => re.test(t));
    return hit ? { label: hit[1], text: t.replace(hit[0], ""), icon: hit[2] } : { label: "", text: t, icon: "•" };
  });
}
const baht = (n: number) => Math.round(n).toLocaleString("th-TH");
const num = (s: string) => { const n = Number(s.replace(/[^\d.]/g, "")); return Number.isFinite(n) && n > 0 ? n : null; };

function Stat({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`min-w-0 rounded-xl p-3 ${strong ? "bg-ink text-paper" : "bg-card"}`}>
      <p className={`m-0 text-xs ${strong ? "text-paper/80" : "text-muted"}`}>{label}</p>
      <p className={`m-0 text-xl font-semibold leading-tight ${strong ? "text-paper" : "text-ink"}`}>{value}</p>
    </div>
  );
}

function Roi({ course, minutes, concernId }: { course: number; minutes: number | null; concernId: string }) {
  const [price, setPrice] = useState("");
  const [costPer, setCostPer] = useState("");
  const [people, setPeople] = useState("");
  const [machine, setMachine] = useState("");
  const [mins, setMins] = useState(minutes ? String(minutes) : "");
  useEffect(() => { setMins(minutes ? String(minutes) : ""); }, [minutes]);
  const p = num(price), cp = num(costPer) ?? 0, n = num(people), m = num(machine), mi = num(mins);
  const marginPerPerson = p ? (p - cp) * course : null;
  const perMonth = marginPerPerson && n ? marginPerPerson * n : null;
  const hours = mi && n ? (mi * course * n) / 60 : null;
  const breakeven = marginPerPerson && marginPerPerson > 0 && m ? Math.ceil(m / marginPerPerson) : null;
  const sent = useRef("");
  useEffect(() => {
    if (!p && !n && !m) return;
    const note = `ราคา/ครั้ง ${price || "-"} · ต้นทุน/ครั้ง ${costPer || "-"} · คนไข้ใหม่/เดือน ${people || "-"} · ค่าเครื่อง/เดือน ${machine || "-"} · นาที/ครั้ง ${mins || "-"} · คอร์ส ${course}`;
    const id = window.setTimeout(() => { if (sent.current !== note) { sent.current = note; track("คำนวณ ROI", { p: concernId, note }); } }, 1200);
    return () => window.clearTimeout(id);
  }, [price, costPer, people, machine, mins, course, concernId, p, n, m]);
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
  const sample = () => { setPrice("3500"); setCostPer("500"); setPeople("8"); setMachine("60000"); };
  return (
    <section className="rounded-xl border border-ink bg-paper p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="m-0 text-base font-semibold text-ink">คุ้มไหม · คิดด้วยตัวเลขของคลินิกคุณ</h4>
          <p className="m-0 mt-1 text-xs text-muted">คอร์ส {course} ครั้งตามแผนนี้ · ตัวเลขทั้งหมดเป็นของคลินิกคุณเอง</p>
        </div>
        <button type="button" onClick={sample} className="flex-none rounded-full border border-line bg-card px-3 py-1 text-xs text-ink-2 hover:border-ink">ลองตัวเลขตัวอย่าง</button>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {field("ราคาต่อครั้ง", price, setPrice, "เช่น 3500", "บาท")}
        {field("ต้นทุนต่อครั้ง (ค่าแรง วัสดุ คอมมิชชั่น)", costPer, setCostPer, "เช่น 500", "บาท")}
        {field("คนไข้ใหม่ที่เริ่มคอร์สต่อเดือน", people, setPeople, "เช่น 8", "คน")}
        {field("ค่าเครื่องต่อเดือน (ค่าผ่อนหรือค่าเช่า)", machine, setMachine, "เช่น 60000", "บาท")}
        {field("นาทีต่อครั้ง", mins, setMins, "นาที", "นาที")}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Stat label="กำไรต่อคนต่อคอร์ส (หลังหักต้นทุนต่อครั้ง)" value={marginPerPerson ? `฿${baht(marginPerPerson)}` : "—"} />
        <Stat label="กำไรจากคนไข้ใหม่ทั้งเดือน (เมื่อทำครบคอร์ส)" value={perMonth ? `฿${baht(perMonth)}` : "—"} />
        <Stat label="เวลาเครื่องที่ต้องใช้ (ทั้งคอร์สของคนไข้เดือนนี้)" value={hours ? `${baht(hours)} ชม.` : "—"} />
        <Stat strong label="คนไข้ใหม่ที่ต้องมีต่อเดือนเพื่อคุ้มค่าเครื่อง" value={breakeven ? `${breakeven} คน` : "—"} />
      </div>
      <p className="m-0 mt-2 text-xs text-muted">ยังไม่รวมค่าการตลาดและค่าใช้จ่ายคงที่อื่นของคลินิก</p>
    </section>
  );
}

export default function ChanceTab({ insight, course, minutes, internal }: { insight: Insight; course: number; minutes: number | null; internal: boolean }) {
  const lines = parse(insight.opportunity);
  return (
    <div>
      {internal ? <div className="mb-2 flex flex-wrap gap-1.5"><Status show={!insight.locked}>ร่าง</Status><Tag>{insight.id}</Tag></div> : null}
      <Roi course={course} minutes={minutes} concernId={insight.painId} />
      {insight.who ? (
        <section className="mt-4">
          <h4 className="mb-1 mt-0 text-sm font-normal text-muted">คนไข้กลุ่มนี้</h4>
          <p className="m-0 text-base leading-relaxed text-ink">{insight.who}</p>
        </section>
      ) : null}
      <section className="mt-4">
        <h4 className="mb-2 mt-0 text-sm font-normal text-muted">ทางขายและต่อยอด</h4>
        <ul className="m-0 grid list-none gap-2 p-0">
          {lines.map((l, i) => (
            <li key={i} className="flex min-w-0 gap-2 rounded-xl bg-card p-3">
              <span aria-hidden className="flex-none text-rose">{l.icon}</span>
              <span className="min-w-0 break-words text-sm text-ink">
                {l.label ? <span className="block text-xs text-muted">{l.label}</span> : null}
                {l.text}
              </span>
            </li>
          ))}
        </ul>
      </section>
      {insight.proof ? (
        <section className="mt-4 border-l-4 border-rose bg-card p-3">
          <h4 className="mb-1 mt-0 text-sm font-normal text-muted">หลักฐานที่ใช้คุยกับคนไข้</h4>
          <p className="m-0 text-base text-ink">{insight.proof}</p>
        </section>
      ) : null}
    </div>
  );
}
