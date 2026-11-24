"use client";
// แท็บ "คำนวณการคืนทุน" · หน้าที่สำคัญที่สุด (ไนน์ 24–25 พ.ย.)
// 1) Patient Segments 12 กลุ่ม · แสดงชื่ออังกฤษอย่างเดียว · เลือกได้ไม่บังคับ
// 2) สมมติฐาน: 5,000 บาท/ครั้ง (40 นาที) · คอร์ส 5 ครั้ง · หักค่าวัสดุสิ้นเปลืองแล้ว
// 3) 3 ทางเลือกการลงทุน · แต่ละแผนบอก "คนไข้ใหม่ต่อเดือน" ที่ครอบคลุมค่างวด
//    คนไข้ 1 คน = คอร์ส × (ราคาต่อครั้ง − ค่าวัสดุสิ้นเปลืองต่อครั้ง)
// 4) ปุ่ม 3 อย่าง: ขอเดโม · ขอใบเสนอราคา (อีเมล) · สอบถามทาง LINE
import { useEffect, useRef, useState } from "react";
import type { BodyMapData, Concern, Insight } from "@/lib/bodymap/data";
import { CONSUMABLE, PAY_PLANS, PRICE_NOTE } from "@/lib/bodymap/pricing";
import { QUOTE_EMAIL } from "@/lib/bodymap/cta";
import { track } from "@/lib/bodymap/events";
import { Status, Tag } from "./ui";

const baht = (n: number) => Math.round(n).toLocaleString("th-TH");
const num = (s: string) => { const n = Number(s.replace(/[^\d.]/g, "")); return Number.isFinite(n) && n > 0 ? n : null; };
const en = (label: string) => label.split(" · ")[0];
const DEFAULT_PRICE = 5000; // ต่อครั้ง 40 นาที
const DEFAULT_COURSE = 5;

function Field({ label, unit, value, onChange, prefix }: { label: string; unit: string; value: string; onChange: (v: string) => void; prefix?: string }) {
  return (
    <label className="block min-w-0">
      <span className="block text-[11px] uppercase tracking-[0.12em] text-muted">{label}</span>
      <span className="mt-1.5 flex items-baseline gap-1.5 border-b border-chalk pb-1.5 focus-within:border-ink">
        {prefix ? <span className="text-lg text-muted">{prefix}</span> : null}
        <input inputMode="numeric" value={value ? Number(value).toLocaleString("en-US") : ""} onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
          className="w-full min-w-0 bg-transparent font-display text-2xl text-ink outline-none" />
        <span className="flex-none text-sm text-muted">{unit}</span>
      </span>
    </label>
  );
}

export default function ChanceTab({ insight, concern, data, picked, onToggle, internal, face, sex, onDemo, onLine }: {
  insight: Insight | null; concern: Concern; data: BodyMapData; picked: string[]; onToggle: (id: string) => void; internal: boolean; face: boolean; sex: "f" | "m" | null;
  onDemo: () => void; onLine: () => void;
}) {
  const [price, setPrice] = useState(String(DEFAULT_PRICE));
  const [course, setCourse] = useState(String(DEFAULT_COURSE));
  const [plan, setPlan] = useState("");

  const supply = face ? CONSUMABLE.face : sex === "f" ? CONSUMABLE.bodyF : CONSUMABLE.bodyM;
  const p = num(price), c = num(course);
  const perPatient = p && c && p > supply ? (p - supply) * c : null; // ต่อคนไข้ 1 คน (1 คอร์ส) หลังหักค่าวัสดุ
  const costPct = p ? (Math.round((supply / p) * 1000) / 10).toLocaleString("en-US", { maximumFractionDigits: 1 }) : null;
  const patients = (perMonth: number) => (perPatient ? Math.ceil(perMonth / perPatient) : null);
  const groups = data.patientSituations;
  const pickedLabels = groups.filter((g) => picked.includes(g.id)).map((g) => g.label);
  const toggle = onToggle;
  const planLabel = PAY_PLANS.find((x) => x.id === plan)?.label;

  const sent = useRef("");
  const note = `กลุ่มคนไข้ ${pickedLabels.map(en).join(", ") || "-"} · ราคา/ครั้ง ${price} · คอร์ส ${course} · แผนที่สนใจ ${planLabel ?? "-"}`;
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
      `แผนชำระที่สนใจ: ${planLabel ?? "ยังไม่เลือก"}`, "",
      "ชื่อ:", "คลินิก/ธุรกิจ:", "เบอร์โทร:",
    ];
    track("ขอใบเสนอราคา", { p: concern.id, note });
    window.location.href = `mailto:${QUOTE_EMAIL}?subject=${encodeURIComponent("ขอใบเสนอราคา icoone Laser Med")}&body=${encodeURIComponent(lines.join("\n"))}`;
  };

  return (
    <div>
      {internal && insight ? <div className="mb-3 flex flex-wrap gap-1.5"><Status show={!insight.locked}>ร่าง</Status><Tag>{insight.id}</Tag></div> : null}

      {/* หัวเรื่อง */}
      <p className="m-0 text-[11px] uppercase tracking-[0.18em] text-rose-ink">Break-even Analysis</p>
      <h3 className="m-0 mt-1 text-2xl font-semibold leading-snug text-ink">จุดคุ้มทุนของคลินิก</h3>

      {/* กลุ่มคนไข้ */}
      <div className="mt-5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[11px] uppercase tracking-[0.12em] text-muted">Patient Segments</span>
          <span className="text-xs text-muted">{picked.length ? `เลือก ${picked.length} กลุ่ม` : "เลือกได้หลายกลุ่ม"}</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {groups.map((g) => {
            const on = picked.includes(g.id);
            return (
              <button key={g.id} type="button" onClick={() => toggle(g.id)} aria-pressed={on} title={g.label}
                className={`rounded-full border px-3 py-1 text-[13px] tracking-wide transition-colors ${on ? "border-ink bg-ink text-paper" : "border-line bg-card text-ink-2 hover:border-ink"}`}>{en(g.label)}</button>
            );
          })}
        </div>
      </div>

      {/* สมมติฐาน */}
      <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3">
        <Field label="ราคาต่อครั้ง · 40 นาที" prefix="฿" unit="" value={price} onChange={setPrice} />
        <Field label="คอร์สละ" unit="ครั้ง" value={course} onChange={setCourse} />
        <div className="col-span-2 min-w-0 sm:col-span-1">
          <span className="block text-[11px] uppercase tracking-[0.12em] text-muted">Consumable Cost</span>
          <span className="mt-1.5 block font-display text-2xl leading-tight text-rose-ink">{costPct ?? "—"}%</span>
          <span className="block text-xs text-muted">ค่าวัสดุสิ้นเปลืองเพียง ฿{supply} ต่อครั้ง</span>
        </div>
      </div>

      {/* 3 ทางเลือก */}
      <div className="mt-7">
        <p className="m-0 text-[11px] uppercase tracking-[0.12em] text-muted">3 ทางเลือกการลงทุน</p>
        <p className="m-0 mt-1 text-sm text-ink-2">จำนวนคนไข้ใหม่ต่อเดือน ที่ครอบคลุมค่างวดของแต่ละแผน</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {PAY_PLANS.map((x, i) => {
            const n = patients(x.perMonth), on = plan === x.id, dark = i === 0;
            return (
              <button key={x.id} type="button" onClick={() => setPlan(x.id)} aria-pressed={on}
                className={`relative flex min-w-0 flex-col overflow-hidden rounded-2xl border p-4 text-left transition ${dark ? "border-ink bg-ink text-paper" : "border-line bg-card text-ink hover:border-ink"} ${on ? "ring-2 ring-rose ring-offset-2 ring-offset-paper" : ""}`}>
                <span className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${dark ? "text-rose" : "text-rose-ink"}`}>{x.tag}</span>
                <span className="mt-1.5 block text-base font-semibold leading-snug">{x.title}</span>
                <span className={`mt-1 block text-xs leading-relaxed ${dark ? "text-paper/65" : "text-muted"}`}>{x.sub}</span>
                {x.note ? <span className={`mt-2 self-start rounded-full px-2 py-0.5 text-[11px] ${dark ? "bg-rose/25 text-paper" : "bg-rose-soft text-rose-ink"}`}>{x.note}</span> : null}
                <span className={`mt-auto block border-t pt-0 ${dark ? "border-paper/15" : "border-line"}`}>
                  <span className={`block pt-3 text-xs ${dark ? "text-paper/65" : "text-muted"}`}>฿{baht(x.perMonth)} ต่อเดือน</span>
                  <span className="mt-1 flex items-baseline gap-2">
                    <span className="font-display text-5xl leading-none">{n ?? "—"}</span>
                    <span className={`text-sm ${dark ? "text-paper/75" : "text-ink-2"}`}>คน / เดือน</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <p className="m-0 mt-3 text-[11px] leading-relaxed text-muted">
        คนไข้ 1 คน = คอร์ส {c ?? "—"} ครั้ง × ราคาต่อครั้ง หักค่าวัสดุสิ้นเปลืองแล้ว · ประมาณการเบื้องต้น · {PRICE_NOTE}
      </p>

      {/* CTA */}
      <div className="mt-6 grid gap-2 sm:grid-cols-[1.3fr_1fr_1fr]">
        <button type="button" onClick={() => { track("คำนวณ ROI", { p: concern.id, note }); onDemo(); }}
          className="rounded-full border border-ink bg-ink px-5 py-3 text-[15px] font-semibold text-paper hover:bg-ink-2">ขอเดโมในคลินิก</button>
        <button type="button" onClick={quote}
          className="rounded-full border border-ink bg-transparent px-5 py-3 text-[15px] text-ink hover:bg-ink hover:text-paper">ขอใบเสนอราคา</button>
        <button type="button" onClick={() => { track("คำนวณ ROI", { p: concern.id, note }); onLine(); }}
          className="rounded-full border border-good bg-transparent px-5 py-3 text-[15px] text-good hover:bg-good hover:text-paper">สอบถามทาง LINE</button>
      </div>
      <p className="m-0 mt-2 text-center text-[11px] text-muted">ใบเสนอราคาส่งถึง {QUOTE_EMAIL} พร้อมตัวเลขที่คำนวณไว้</p>

      {internal && insight ? (
        <details className="mt-5 text-sm">
          <summary className="cursor-pointer text-muted">(ภายใน) ข้อความโอกาสของคลินิกเดิม</summary>
          <p className="whitespace-pre-line text-ink-2">{[insight.who, insight.opportunity, insight.proof].filter(Boolean).join("\n\n")}</p>
        </details>
      ) : null}
    </div>
  );
}
