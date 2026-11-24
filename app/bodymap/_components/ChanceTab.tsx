"use client";
// แท็บ "คำนวณการคืนทุน" · หน้าที่สำคัญที่สุด (ไนน์ 24 พ.ย.)
// 1) กลุ่มคนไข้ 12 กลุ่ม (PS) เป็น tag · เลือกได้ไม่บังคับ · ตั้งต้นเลือกกลุ่มที่ตรงกับปัญหาที่เปิดอยู่
// 2) ตั้งต้น 5,000 บาท/ครั้ง (40 นาที) · คอร์ส 5 ครั้ง · แก้ได้ · หักค่าวัสดุสิ้นเปลืองแล้ว
// 3) คืนทุนต่อเดือนเป็นจำนวนคน แยกตามแผนชำระ · 4) ปุ่ม 3 อย่าง: ขอเดโม · ขอใบเสนอราคา (อีเมล) · สอบถามทาง LINE
import { useEffect, useRef, useState } from "react";
import type { BodyMapData, Concern, Insight } from "@/lib/bodymap/data";
import { CONSUMABLE, FULL_PRICE, PAY_PLANS, PRICE_NOTE } from "@/lib/bodymap/pricing";
import { QUOTE_EMAIL } from "@/lib/bodymap/cta";
import { track } from "@/lib/bodymap/events";
import { Status, Tag } from "./ui";

const baht = (n: number) => Math.round(n).toLocaleString("th-TH");
const num = (s: string) => { const n = Number(s.replace(/[^\d.]/g, "")); return Number.isFinite(n) && n > 0 ? n : null; };
const DEFAULT_PRICE = 5000; // ต่อครั้ง 40 นาที
const DEFAULT_COURSE = 5;

export default function ChanceTab({ insight, concern, data, internal, face, sex, onDemo, onLine }: {
  insight: Insight | null; concern: Concern; data: BodyMapData; internal: boolean; face: boolean; sex: "f" | "m" | null;
  onDemo: () => void; onLine: () => void;
}) {
  const [picked, setPicked] = useState<string[]>(() => [...concern.psPrimary, ...concern.psSecondary]);
  const [price, setPrice] = useState(String(DEFAULT_PRICE));
  const [course, setCourse] = useState(String(DEFAULT_COURSE));
  const [plan, setPlan] = useState("");
  useEffect(() => { setPicked([...concern.psPrimary, ...concern.psSecondary]); }, [concern]);

  const supply = face ? CONSUMABLE.face : sex === "f" ? CONSUMABLE.bodyF : CONSUMABLE.bodyM;
  const p = num(price), c = num(course);
  const perPerson = p && c ? (p - supply) * c : null;
  const people = (perMonth: number) => (perPerson && perPerson > 0 ? Math.ceil(perMonth / perPerson) : null);
  const groups = data.patientSituations;
  const pickedLabels = groups.filter((g) => picked.includes(g.id)).map((g) => g.label);
  const toggle = (id: string) => setPicked((x) => (x.includes(id) ? x.filter((y) => y !== id) : [...x, id]));

  const sent = useRef("");
  const note = `กลุ่มคนไข้ ${pickedLabels.join(", ") || "-"} · ราคา/ครั้ง ${price} · คอร์ส ${course} · แผนที่สนใจ ${PAY_PLANS.find((x) => x.id === plan)?.label ?? "-"}`;
  useEffect(() => {
    const id = window.setTimeout(() => { if (sent.current && sent.current !== note) track("คำนวณ ROI", { p: concern.id, note }); sent.current = note; }, 1200);
    return () => window.clearTimeout(id);
  }, [note, concern.id]);

  const quote = () => {
    const lines = [
      "เรียนทีม BIB", "", "ขอใบเสนอราคา icoone Laser Med", "",
      `ปัญหาที่ดู: ${concern.label}`,
      `กลุ่มคนไข้ที่คลินิกมี: ${pickedLabels.join(", ") || "-"}`,
      `ราคาต่อครั้งที่คิดไว้: ${price} บาท · คอร์ส ${course} ครั้ง`,
      `แผนชำระที่สนใจ: ${PAY_PLANS.find((x) => x.id === plan)?.label ?? "ยังไม่เลือก"}`, "",
      "ชื่อ:", "คลินิก/ธุรกิจ:", "เบอร์โทร:",
    ];
    track("ขอใบเสนอราคา", { p: concern.id, note });
    window.location.href = `mailto:${QUOTE_EMAIL}?subject=${encodeURIComponent("ขอใบเสนอราคา icoone Laser Med")}&body=${encodeURIComponent(lines.join("\n"))}`;
  };

  return (
    <div>
      {internal && insight ? <div className="mb-2 flex flex-wrap gap-1.5"><Status show={!insight.locked}>ร่าง</Status><Tag>{insight.id}</Tag></div> : null}

      <p className="m-0 text-sm text-muted">คลินิกคุณมีคนไข้กลุ่มไหนบ้าง (เลือกได้หลายกลุ่ม ไม่บังคับ)</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {groups.map((g) => (
          <button key={g.id} type="button" onClick={() => toggle(g.id)} aria-pressed={picked.includes(g.id)} title={g.canon}
            className={`rounded-full border px-3 py-1 text-sm ${picked.includes(g.id) ? "border-ink bg-ink text-paper" : "border-line bg-card text-ink-2 hover:border-ink"}`}>{g.label}</button>
        ))}
      </div>
      {picked.length ? <p className="m-0 mt-2 text-sm text-ink">โอกาสลูกค้าใหม่จาก <b>{picked.length} กลุ่ม</b></p> : null}

      <div className="mt-4 flex flex-wrap items-end gap-3 text-sm text-muted">
        <label>ราคาต่อครั้ง (40 นาที)
          <span className="mt-1 flex items-center gap-2"><input inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} className="w-28 rounded-lg border border-line bg-card px-3 py-2 text-base text-ink outline-none focus:border-ink" />บาท</span>
        </label>
        <label>คอร์ส
          <span className="mt-1 flex items-center gap-2"><input inputMode="numeric" value={course} onChange={(e) => setCourse(e.target.value)} className="w-16 rounded-lg border border-line bg-card px-3 py-2 text-base text-ink outline-none focus:border-ink" />ครั้ง</span>
        </label>
      </div>

      <p className="mb-1 mt-4 text-base font-semibold text-ink">คืนทุนเมื่อมีคนไข้ใหม่ต่อเดือน</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {PAY_PLANS.map((x) => (
          <button key={x.id} type="button" onClick={() => setPlan(x.id)} aria-pressed={plan === x.id}
            className={`min-w-0 rounded-xl border p-3 text-left ${plan === x.id ? "border-ink bg-ink text-paper" : "border-ink bg-paper text-ink"}`}>
            <span className="block text-sm">{x.label}</span>
            <span className={`block text-xs ${plan === x.id ? "text-paper/80" : "text-muted"}`}>{baht(x.perMonth)} บาท/เดือน{x.note ? ` · ${x.note}` : ""}</span>
            <span className="mt-2 block text-3xl font-semibold leading-none">{people(x.perMonth) ?? "—"} <span className="text-base font-normal">คน</span></span>
          </button>
        ))}
      </div>
      <p className="m-0 mt-2 text-xs text-muted">ราคาเต็ม {baht(FULL_PRICE)} บาท รวม VAT · หักค่าวัสดุ {supply} บาท/ครั้งแล้ว · {PRICE_NOTE}</p>

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        <button type="button" onClick={() => { track("คำนวณ ROI", { p: concern.id, note }); onDemo(); }} className="rounded-full border border-ink bg-ink px-4 py-3 text-base text-paper">ขอเดโม</button>
        <button type="button" onClick={quote} className="rounded-full border border-ink bg-paper px-4 py-3 text-base text-ink hover:bg-ink hover:text-paper">ขอใบเสนอราคา</button>
        <button type="button" onClick={() => { track("คำนวณ ROI", { p: concern.id, note }); onLine(); }} className="rounded-full border border-good bg-card px-4 py-3 text-base text-good hover:bg-good hover:text-paper">สอบถามทาง LINE</button>
      </div>
      <p className="m-0 mt-2 text-center text-xs text-muted">ขอใบเสนอราคาจะเปิดอีเมลถึง {QUOTE_EMAIL} พร้อมตัวเลขที่คุณคำนวณไว้</p>

      {internal && insight ? (
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer text-muted">(ภายใน) ข้อความโอกาสของคลินิกเดิม</summary>
          <p className="whitespace-pre-line text-ink-2">{[insight.who, insight.opportunity, insight.proof].filter(Boolean).join("\n\n")}</p>
        </details>
      ) : null}
    </div>
  );
}
