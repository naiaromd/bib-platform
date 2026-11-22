"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { AREAS, AreaId } from "@/lib/areas";
import { Blueprint } from "@/lib/blueprint";
import { HANDPIECES, HandpieceKey } from "@/lib/handpieces";
import { FLAGS } from "@/lib/env";
import {
  CASES_OPTIONS,
  Course,
  FormState,
  PILOT_TIMELINE,
  PROVINCES,
} from "./types";

export default function Stage4Blueprint({
  blueprint,
  sumCtx,
  pickedKeys,
  hp,
  sucLabel,
  lightText,
  course,
  form,
  tried,
  done,
  payload,
  onCourse,
  onFormChange,
  onFormBool,
  onSubmit,
  onEdit,
}: {
  blueprint: Blueprint;
  sumCtx: string;
  pickedKeys: string[];
  hp: HandpieceKey;
  sucLabel: string;
  lightText: string;
  course: Course;
  form: FormState;
  tried: boolean;
  done: boolean;
  payload: string;
  onCourse: (c: Course) => void;
  onFormChange: (k: keyof FormState, v: string) => void;
  onFormBool: (k: "consent" | "mkt", v: boolean) => void;
  onSubmit: () => void;
  onEdit: () => void;
}) {
  const [showJson, setShowJson] = useState(false);
  const h = HANDPIECES[hp];
  const phone = (form.phone || "").replace(/\D/g, "");
  const phoneOk = phone.length >= 9;
  const missing = [
    !form.name.trim() && "ชื่อแพทย์",
    !form.clinic.trim() && "ชื่อคลินิก",
    !form.province && "จังหวัด",
    !phoneOk && "เบอร์โทร",
    !form.line.trim() && "LINE ID",
  ].filter(Boolean) as string[];
  const hasErr = tried && (missing.length > 0 || !form.consent);
  const bd = (bad: boolean) => (tried && bad ? "border-bad" : "border-chalk");

  const sumConcerns = useMemo(
    () =>
      pickedKeys
        .map((k) => {
          const [ar, iStr] = k.split(":");
          const area = AREAS[ar as AreaId];
          if (!area) return "";
          return `${area.th}: ${area.k[+iStr]?.[0] ?? ""}`;
        })
        .filter(Boolean)
        .join(" · ") || "ยังไม่ได้เลือก",
    [pickedKeys]
  );

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-x-6 gap-y-10 pt-6 items-start">
      <div className="lg:col-span-7 flex flex-col gap-5">
        <div className="flex flex-wrap justify-between items-end gap-3">
          <div>
            <p className="text-[14px] font-medium text-ink-2">04 · Clinical Service Blueprint</p>
            <h1 className="mt-1.5 font-semibold text-[26px] md:text-[32px] leading-[1.3]">
              ร่างแนวทางบริการของคลินิกคุณ
            </h1>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#ECE5D8] font-mono text-[13px] font-semibold">
            {blueprint.id}
          </span>
        </div>

        <div className="flex flex-col border-t border-ink">
          <SumRow label="กลุ่มคนไข้" value={sumCtx} />
          <SumRow label="โจทย์ที่เลือก" value={sumConcerns} />
          <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 py-3.5 border-b border-chalk items-center">
            <span className="text-[14px] font-semibold text-ink-2">หัวและพารามิเตอร์</span>
            <span className="flex items-center gap-3">
              <Image
                src={h.img}
                alt=""
                width={44}
                height={44}
                className="w-11 h-11 object-contain bg-white rounded-lg shadow-[0_0_0_1px_var(--color-line)]"
              />
              <span className="text-[15px]">
                <b className="font-semibold">{h.name}</b> · แรงดูด {sucLabel} · {lightText}
              </span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-3">
          <h2 className="text-[20px] font-semibold">สูตรอ้างอิงจาก Protocol card</h2>
          <div role="group" aria-label="จำนวนครั้งของคอร์ส" className="flex border border-chalk rounded-full p-[3px] bg-paper">
            {(["5", "10"] as Course[]).map((c) => {
              const on = course === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => onCourse(c)}
                  aria-pressed={on}
                  className={`min-h-9 px-4 border-0 rounded-full text-[14px] font-medium cursor-pointer transition-colors ${
                    on ? "bg-ink text-bg" : "bg-transparent text-ink-2 hover:bg-ink/5"
                  }`}
                >
                  คอร์ส {c} ครั้ง
                </button>
              );
            })}
          </div>
        </div>

        {blueprint.noCards && (
          <p className="p-4 border border-dashed border-chalk rounded-xl text-[15px] text-ink-2">
            โจทย์ที่เลือกยังไม่มี protocol card ใน Airtable ทีม BIB
            จะออกแบบสูตรร่วมกับคุณหมอ
          </p>
        )}

        {blueprint.cards.map((c) => (
          <article
            key={c.id}
            className="border border-line rounded-2xl bg-paper overflow-hidden"
          >
            <div className="flex flex-wrap justify-between gap-2 px-5 py-4 border-b border-line">
              <div>
                <p className="text-[13.5px] text-ink-2">สำหรับโจทย์: {c.for}</p>
                <h3 className="mt-1 text-[19px] font-semibold">
                  {c.n}{" "}
                  <span className="font-normal text-ink-2">· {c.fam} / {c.sub}</span>
                </h3>
              </div>
              <span className="self-start font-mono text-[12.5px] font-semibold px-2.5 py-1 rounded bg-[#ECE5D8]">
                {c.id}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-5 py-3 border-b border-line text-[14px]">
              <Meta k="จำนวนครั้ง" v={c.ses} />
              <Meta k="ความถี่" v={c.freq} />
              <Meta k="บริเวณ" v={c.ar} />
              <Meta k="กลุ่มคนไข้" v={c.tg} />
            </div>
            {c.ph.map((ph) => (
              <div key={ph.s} className="px-5 py-3 border-b border-line">
                <div className="flex justify-between text-[14px] mb-1.5">
                  <span className="font-semibold">ครั้งที่ {ph.s}</span>
                  <span className="font-mono text-ink-2">รวม {ph.tot} นาที/ครั้ง</span>
                </div>
                {ph.st.map((x) => (
                  <div
                    key={x.n + x.p}
                    className="grid grid-cols-[22px_1fr_auto] gap-2.5 items-center py-1 text-[14.5px]"
                  >
                    <span className="font-mono text-[12.5px] text-rose-ink font-semibold">
                      {x.n}
                    </span>
                    <span>
                      <span className="font-mono font-semibold text-[13.5px]">{x.p}</span>{" "}
                      <span className="text-ink-2">· {x.g}</span>
                    </span>
                    <span className="font-mono">{x.m}′</span>
                  </div>
                ))}
              </div>
            ))}
            <div className="px-5 py-3 text-[13px] leading-[1.6] text-ink-2">
              หัวต่อขั้น: หมอเลือกตามบริเวณ (ใน Airtable ยังไม่ระบุ) · แหล่ง {c.src} ·
              สถานะ: ร่างอ้างอิง รอเทียบการ์ดต้นฉบับ
              {c.warn && (
                <>
                  <br />
                  <span className="text-rose-ink">{c.warn}</span>
                </>
              )}
            </div>
          </article>
        ))}

        {blueprint.openConcerns.length > 0 && (
          <p className="text-[14.5px] leading-[1.65] text-ink-2">
            <b className="font-semibold text-ink">ยังไม่มี protocol card:</b>{" "}
            {blueprint.openConcerns.join(" · ")}
          </p>
        )}

        {FLAGS.showPilotOffer && (
          <div className="border-t border-ink pt-4">
            <h2 className="mb-1 text-[20px] font-semibold">
              5-Case Monitored Pilot กับทีม BIB
            </h2>
            <p className="mb-2.5 text-[14px] text-ink-2">
              ลองกับเคสจริงของคลินิก 5–10 ราย ก่อนตัดสินใจลงทุน
            </p>
            {PILOT_TIMELINE.map((p) => (
              <div
                key={p.d}
                className="grid grid-cols-[76px_1fr] gap-3 py-2.5 border-b border-chalk text-[15px]"
              >
                <span className="font-mono font-semibold text-rose-ink">{p.d}</span>
                <span>{p.t}</span>
              </div>
            ))}
          </div>
        )}

        <p className="text-[13px] leading-[1.6] text-ink-2">
          ร่างนี้ใช้ประกอบการคุยทางคลินิก ไม่ใช่คำสั่งรักษา
          การใช้กับคนไข้หลังผ่าตัดหรือมีภาวะเฉพาะต้องผ่านการประเมินของแพทย์
          และตรวจขอบเขตข้อบ่งใช้ตามเอกสารของรุ่นที่จำหน่ายจริง
        </p>
      </div>

      {/* Form */}
      <div className="lg:col-span-4 lg:col-start-9">
        {!done ? (
          <div className="flex flex-col gap-3 p-6 border border-line rounded-[18px] bg-paper shadow-[0_18px_40px_rgba(44,42,40,0.05)]">
            <h2 className="font-semibold text-[21px] leading-[1.4]">
              รับ Blueprint และนัด Pilot
            </h2>
            <p className="text-[14px] text-ink-2">
              ทีม BIB ติดต่อกลับเพื่อส่งสรุปและนัดเดโมในคลินิก
            </p>
            <TextField
              label="ชื่อแพทย์ / ผู้เชี่ยวชาญ *"
              value={form.name}
              onChange={(v) => onFormChange("name", v)}
              invalid={tried && !form.name.trim()}
              placeholder="นพ./พญ. ..."
              borderClass={bd(!form.name.trim())}
            />
            <TextField
              label="เลขใบประกอบวิชาชีพ (ไม่บังคับ)"
              value={form.license}
              onChange={(v) => onFormChange("license", v)}
              placeholder="ว.12345"
            />
            <TextField
              label="ชื่อคลินิก / โรงพยาบาล *"
              value={form.clinic}
              onChange={(v) => onFormChange("clinic", v)}
              invalid={tried && !form.clinic.trim()}
              borderClass={bd(!form.clinic.trim())}
            />
            <div className="grid grid-cols-2 gap-2.5">
              <label className="flex flex-col gap-1 text-[14px] font-medium">
                จังหวัด *
                <select
                  value={form.province}
                  onChange={(e) => onFormChange("province", e.target.value)}
                  aria-invalid={tried && !form.province}
                  className={`min-h-[44px] px-2 border rounded-xl bg-white font-normal ${bd(!form.province)}`}
                >
                  {PROVINCES.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-[14px] font-medium">
                เคสต่อเดือน *
                <select
                  value={form.volume}
                  onChange={(e) => onFormChange("volume", e.target.value)}
                  className="min-h-[44px] px-2 border border-chalk rounded-xl bg-white font-normal"
                >
                  {CASES_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <TextField
                label="เบอร์โทร *"
                value={form.phone}
                onChange={(v) => onFormChange("phone", v)}
                type="tel"
                placeholder="08X-XXX-XXXX"
                invalid={tried && !phoneOk}
                borderClass={bd(!phoneOk)}
              />
              <TextField
                label="LINE ID *"
                value={form.line}
                onChange={(v) => onFormChange("line", v)}
                invalid={tried && !form.line.trim()}
                borderClass={bd(!form.line.trim())}
              />
            </div>
            <label className={`flex gap-2.5 items-start p-2.5 border rounded-xl bg-white text-[13.5px] leading-[1.55] cursor-pointer ${bd(!form.consent)}`}>
              <input
                type="checkbox"
                checked={form.consent}
                onChange={(e) => onFormBool("consent", e.target.checked)}
                className="w-[18px] h-[18px] mt-0.5 accent-ink"
              />
              <span>
                ยินยอมให้ทีม BIB ติดต่อเพื่อส่ง Blueprint และนัด Live Demo / 5-Case
                Pilot ตามวัตถุประสงค์นี้เท่านั้น *
              </span>
            </label>
            <label className="flex gap-2.5 items-start px-2.5 text-[13.5px] leading-[1.55] cursor-pointer">
              <input
                type="checkbox"
                checked={form.mkt}
                onChange={(e) => onFormBool("mkt", e.target.checked)}
                className="w-[18px] h-[18px] mt-0.5 accent-ink"
              />
              <span>รับข่าวสารและงานอบรมจาก BIB (ไม่บังคับ)</span>
            </label>
            {hasErr && (
              <p role="alert" className="p-2.5 rounded-xl bg-bad-soft text-bad text-[14px]">
                {missing.length
                  ? `กรุณากรอก: ${missing.join(", ")}${form.consent ? "" : " และติ๊กยินยอม"}`
                  : "กรุณาติ๊กยินยอมให้ทีม BIB ติดต่อ"}
              </p>
            )}
            <button
              type="button"
              onClick={onSubmit}
              className="min-h-[52px] border-0 rounded-full bg-ink text-bg text-[15.5px] font-medium cursor-pointer hover:bg-ink-2 transition-colors"
            >
              ส่งร่างและขอนัด Pilot
            </button>
          </div>
        ) : (
          <div role="status" className="flex flex-col gap-3 p-6 border border-line rounded-[18px] bg-paper">
            <span className="self-start px-2.5 py-1 rounded-full bg-[#E3EBDD] text-good text-[13px] font-semibold">
              บันทึกแล้ว · {blueprint.id}
            </span>
            <h2 className="font-semibold text-[20px]">ขอบคุณ {form.name}</h2>
            <p className="text-[14.5px] leading-[1.6] text-ink-2">
              {form.clinic} · {form.province} — ทีม BIB จะติดต่อกลับทาง LINE หรือโทรศัพท์
            </p>
            {!FLAGS.showRealQr ? (
              <div className="self-center flex flex-col items-center gap-1.5">
                <div className="w-[140px] h-[140px] bg-white border border-line rounded-xl flex items-center justify-center text-muted text-[12px] text-center p-4">
                  QR · รอ LINE OA
                </div>
                <span className="px-2.5 py-1 rounded-full bg-rose-soft text-rose-ink text-[12.5px]">
                  ตัวอย่าง · ยังไม่มี LINE OA จริง
                </span>
              </div>
            ) : null}
            <details className="text-[13px]">
              <summary
                className="cursor-pointer font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  setShowJson((s) => !s);
                }}
              >
                ข้อมูลที่ส่งเข้า Airtable
              </summary>
              {showJson && (
                <pre className="mt-2 p-2.5 max-h-[260px] overflow-auto rounded-lg bg-white border border-line text-[11.5px] leading-[1.5] whitespace-pre-wrap">
                  {payload}
                </pre>
              )}
            </details>
            <button
              type="button"
              onClick={onEdit}
              className="min-h-[44px] border border-ink rounded-full bg-transparent text-[14.5px] cursor-pointer hover:bg-ink hover:text-bg transition-colors"
            >
              แก้ไขข้อมูล
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function SumRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-4 py-3.5 border-b border-chalk">
      <span className="text-[14px] font-semibold text-ink-2">{label}</span>
      <span className="text-[15.5px] leading-[1.7]">{value}</span>
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-ink-2">{k}</div>
      <div className="font-semibold">{v}</div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  invalid,
  placeholder,
  type = "text",
  borderClass = "border-chalk",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean;
  placeholder?: string;
  type?: string;
  borderClass?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-[14px] font-medium">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid}
        placeholder={placeholder}
        className={`min-h-[44px] px-3 border rounded-xl bg-white font-normal ${borderClass}`}
      />
    </label>
  );
}
