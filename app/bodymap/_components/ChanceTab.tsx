"use client";
// แท็บ "คำนวณการคืนทุน" · ไนน์ 24 พ.ย.: ให้หมอคิดง่าย ข้อความน้อย
// 1) เลือกประเภทธุรกิจ → เห็นว่าดูแลคนไข้ได้กี่กลุ่ม (PS) · 2) ราคาต่อครั้ง · 3) คืนทุนต่อเดือนเป็น "จำนวนคน" แยกตามแผนชำระเงิน
// หักค่าวัสดุสิ้นเปลืองต่อครั้งให้แล้ว (Treatment Costing 2024) · ค่าที่หมอกรอกเก็บเป็น event "คำนวณ ROI" และติดไปกับลีด
import { useEffect, useRef, useState } from "react";
import type { BodyMapData, Concern, Insight } from "@/lib/bodymap/data";
import { BUSINESS_TYPES } from "@/lib/bodymap/business";
import { CONSUMABLE, FULL_PRICE, PAY_PLANS, PRICE_NOTE, SAMPLE_PRICE } from "@/lib/bodymap/pricing";
import { track } from "@/lib/bodymap/events";
import { Status, Tag } from "./ui";

const baht = (n: number) => Math.round(n).toLocaleString("th-TH");
const num = (s: string) => { const n = Number(s.replace(/[^\d.]/g, "")); return Number.isFinite(n) && n > 0 ? n : null; };

export default function ChanceTab({ insight, concern, data, course, internal, face, sex }: {
  insight: Insight | null; concern: Concern; data: BodyMapData; course: number; internal: boolean; face: boolean; sex: "f" | "m" | null;
}) {
  const [bt, setBt] = useState("");
  const [price, setPrice] = useState(String(face ? SAMPLE_PRICE.face : SAMPLE_PRICE.body));
  const [labour, setLabour] = useState("");
  useEffect(() => { setPrice(String(face ? SAMPLE_PRICE.face : SAMPLE_PRICE.body)); }, [face]);

  const supply = face ? CONSUMABLE.face : sex === "f" ? CONSUMABLE.bodyF : CONSUMABLE.bodyM;
  const p = num(price);
  const perPerson = p ? (p - supply - (num(labour) ?? 0)) * course : null; // กำไรต่อคนไข้ 1 คอร์ส
  const business = BUSINESS_TYPES.find((b) => b.id === bt) ?? null;
  const mine = new Set([...concern.psPrimary, ...concern.psSecondary]);
  const groups = business ? data.patientSituations.filter((s) => business.ps.includes(s.id)) : [];

  const sent = useRef("");
  useEffect(() => {
    const note = `ธุรกิจ ${business?.th ?? "-"} · ราคา/ครั้ง ${price || "-"} · ค่าแรง/ครั้ง ${labour || "-"} · วัสดุ/ครั้ง ${supply} · คอร์ส ${course}`;
    const id = window.setTimeout(() => { if (sent.current !== note && (bt || labour)) { sent.current = note; track("คำนวณ ROI", { p: concern.id, note }); } }, 1200);
    return () => window.clearTimeout(id);
  }, [bt, business, price, labour, supply, course, concern.id]);

  return (
    <div>
      {internal && insight ? <div className="mb-2 flex flex-wrap gap-1.5"><Status show={!insight.locked}>ร่าง</Status><Tag>{insight.id}</Tag></div> : null}

      <p className="m-0 text-sm text-muted">ธุรกิจของคุณ</p>
      <div className="mt-1 flex flex-wrap gap-2">
        {BUSINESS_TYPES.map((b) => (
          <button key={b.id} type="button" onClick={() => setBt(b.id)} aria-pressed={bt === b.id}
            className={`rounded-full border px-3 py-1.5 text-sm ${bt === b.id ? "border-ink bg-ink text-paper" : "border-line bg-card text-ink hover:border-ink"}`}>{b.th}</button>
        ))}
      </div>
      {business ? (
        <div className="mt-2 rounded-xl bg-card p-3">
          <p className="m-0 text-base text-ink">ดูแลคนไข้ได้ <b>{groups.length} กลุ่ม</b></p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {groups.map((s) => (
              <span key={s.id} className={`rounded-full px-2.5 py-1 text-xs ${mine.has(s.id) ? "bg-rose text-paper" : "border border-line text-ink-2"}`}>{s.label}</span>
            ))}
          </div>
        </div>
      ) : null}

      <label className="mt-4 block text-sm text-muted">
        ราคาต่อครั้ง
        <span className="mt-1 flex items-center gap-2">
          <input inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)}
            className="block w-40 min-w-0 rounded-lg border border-line bg-card px-3 py-2 text-base text-ink outline-none focus:border-ink" />
          <span className="text-sm text-muted">บาท · คอร์ส {course} ครั้ง</span>
        </span>
      </label>

      <p className="mb-1 mt-4 text-sm text-muted">คืนทุนเมื่อมีคนไข้ใหม่ต่อเดือน</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {PAY_PLANS.map((x) => {
          const people = perPerson && perPerson > 0 ? Math.ceil(x.perMonth / perPerson) : null;
          return (
            <div key={x.id} className="min-w-0 rounded-xl border border-ink bg-paper p-3">
              <p className="m-0 text-sm text-ink">{x.label}</p>
              <p className="m-0 text-xs text-muted">{baht(x.perMonth)} บาท/เดือน{x.note ? ` · ${x.note}` : ""}</p>
              <p className="m-0 mt-2 text-3xl font-semibold leading-none text-ink">{people ?? "—"} <span className="text-base font-normal">คน</span></p>
            </div>
          );
        })}
      </div>
      <p className="m-0 mt-2 text-xs text-muted">ราคาเต็ม {baht(FULL_PRICE)} บาท รวม VAT · หักค่าวัสดุ {supply} บาท/ครั้งแล้ว · {PRICE_NOTE}</p>

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-ink-2">มีค่าแรงหรือคอมมิชชั่นต่อครั้ง</summary>
        <span className="mt-2 flex items-center gap-2">
          <input inputMode="numeric" value={labour} onChange={(e) => setLabour(e.target.value)} placeholder="เช่น 500"
            className="block w-40 min-w-0 rounded-lg border border-line bg-card px-3 py-2 text-base text-ink outline-none focus:border-ink" />
          <span className="text-muted">บาท/ครั้ง</span>
        </span>
      </details>

      {internal && insight ? (
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer text-muted">(ภายใน) ข้อความโอกาสของคลินิกเดิม</summary>
          <p className="whitespace-pre-line text-ink-2">{[insight.who, insight.opportunity, insight.proof].filter(Boolean).join("\n\n")}</p>
        </details>
      ) : null}
    </div>
  );
}
