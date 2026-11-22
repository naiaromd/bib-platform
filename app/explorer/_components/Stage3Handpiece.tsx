"use client";

import Image from "next/image";
import { useMemo } from "react";
import { AREAS, AreaId } from "@/lib/areas";
import { PROGRAM_ICON } from "@/lib/assets";
import { HANDPIECES, HANDPIECE_ORDER, HandpieceKey } from "@/lib/handpieces";
import { PROGRAM_INFO } from "@/lib/programs";
import MechanismDiagram from "./MechanismDiagram";
import { MECHANISM_STEPS } from "./types";

export default function Stage3Handpiece({
  ctxLabel,
  hp,
  suc,
  led,
  las,
  lockStep,
  showNet,
  picked,
  draft,
  onHp,
  onSuc,
  onToggleLight,
  onLockStep,
  onToggleNet,
  onToggleDraft,
  onNext,
}: {
  ctxLabel: string;
  hp: HandpieceKey;
  suc: number;
  led: boolean;
  las: boolean;
  lockStep: number | null;
  showNet: boolean;
  picked: Record<string, boolean>;
  draft: Record<string, boolean>;
  onHp: (k: HandpieceKey) => void;
  onSuc: (v: number) => void;
  onToggleLight: (which: "led" | "las") => void;
  onLockStep: (i: number | null) => void;
  onToggleNet: () => void;
  onToggleDraft: (id: string) => void;
  onNext: () => void;
}) {
  const h = HANDPIECES[hp];
  const sucLabel = suc < 34 ? "เบา" : suc < 67 ? "กลาง" : "แรง";
  const okLight = h.hasLight;

  const programIds = useMemo(() => {
    const out: string[] = [];
    Object.keys(picked)
      .filter((k) => picked[k])
      .forEach((k) => {
        const [ar, iStr] = k.split(":");
        const area = AREAS[ar as AreaId];
        if (!area) return;
        area.k[+iStr]?.[1].forEach((p) => {
          if (!out.includes(p)) out.push(p);
        });
      });
    return out;
  }, [picked]);

  const stepIndex = lockStep ?? 0;
  const cap = MECHANISM_STEPS[stepIndex];

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-6 pb-4 border-b border-chalk">
        <div>
          <h1 className="font-semibold text-[26px] md:text-[32px] leading-[1.3]">
            หัวต่างกัน การดูแลก็มีรายละเอียดต่างกัน
          </h1>
          <p className="mt-1.5 text-[16px] text-ink-2">
            เลือกหัวและโปรแกรม แล้วเปิดดูกลไกที่อยู่ใต้จุดสัมผัส
          </p>
        </div>
        <span className="h-9 px-4 inline-flex items-center rounded-full bg-rose-soft text-rose-ink text-[14.5px] whitespace-nowrap">
          กำลังสำรวจ: {ctxLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-8">
        <aside className="flex flex-col gap-6">
          <div>
            <h3 className="mb-3 text-[16px] font-semibold">เลือกหัว</h3>
            <div className="flex flex-col gap-2">
              {HANDPIECE_ORDER.map((k) => {
                const on = hp === k;
                const hh = HANDPIECES[k];
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => onHp(k)}
                    aria-pressed={on}
                    className={`relative grid items-center w-full rounded-xl border text-left cursor-pointer transition-all ${
                      on
                        ? "border-ink bg-white shadow-[0_10px_28px_rgba(44,42,40,0.10)] p-2.5 pl-[14px] grid-cols-[88px_1fr] gap-3"
                        : "border-line bg-paper p-1.5 pl-3 grid-cols-[48px_1fr] gap-3 hover:bg-white"
                    }`}
                  >
                    <Image
                      src={hh.img}
                      alt={`หัว ${hh.name}`}
                      width={on ? 88 : 48}
                      height={on ? 88 : 48}
                      className={`block ${on ? "w-[88px] h-[88px]" : "w-12 h-12"} object-contain bg-white rounded-lg`}
                    />
                    <span>
                      <span
                        className={`block font-display font-semibold leading-[1.1] ${
                          on ? "text-[24px]" : "text-[19px]"
                        }`}
                      >
                        {hh.name}
                      </span>
                      {on && (
                        <>
                          <span className="block mt-1 text-[12.5px] leading-[1.45] text-muted">
                            {hh.desc}
                          </span>
                          <span className="block mt-1.5 font-mono text-[15px] font-medium">
                            {hh.ppm}{" "}
                            <span className="font-body text-[12px] font-normal text-muted">
                              จุด/นาที
                            </span>
                          </span>
                        </>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="mb-1 text-[16px] font-semibold">
              โปรแกรมที่เกี่ยวกับโจทย์
            </h3>
            <p className="mb-2.5 text-[13px] text-muted">
              เพิ่มลงร่างเพื่อคุยต่อในขั้น 04
            </p>
            {programIds.length === 0 ? (
              <p className="p-3.5 border border-dashed border-chalk rounded-lg text-[14px] text-ink-2">
                ยังไม่ได้เลือกโจทย์ — กลับไปที่ขั้น 02 แล้วเลือกอย่างน้อยหนึ่งโจทย์
              </p>
            ) : (
              <div className="flex flex-col border-t border-line">
                {programIds.map((id) => {
                  const on = !!draft[id];
                  const info = PROGRAM_INFO[id];
                  return (
                    <div
                      key={id}
                      className="grid grid-cols-[44px_1fr_auto] gap-2.5 items-center py-2 border-b border-line"
                    >
                      <Image
                        src={PROGRAM_ICON[id] ?? ""}
                        alt={`ไอคอนโปรแกรม ${id}`}
                        width={44}
                        height={43}
                        className="w-11 h-[43px] object-contain bg-white border border-chalk rounded-[5px]"
                      />
                      <span className="min-w-0">
                        <span className="block font-mono text-[12.5px] font-semibold">
                          {id}{" "}
                          <span className="font-normal text-muted">
                            · {info?.[0]}
                          </span>
                        </span>
                        <span className="block text-[13px] leading-[1.45] text-ink-2">
                          {info?.[1]}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => onToggleDraft(id)}
                        aria-pressed={on}
                        className={`h-9 px-3 rounded-full border text-[13px] whitespace-nowrap cursor-pointer transition-colors ${
                          on
                            ? "border-rose bg-rose-soft text-rose-ink"
                            : "border-chalk bg-white text-ink hover:bg-paper"
                        }`}
                      >
                        {on ? "อยู่ในร่าง ✓" : "เพิ่มในร่าง +"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 className="flex items-center gap-3.5 text-[22px] md:text-[24px] font-semibold">
              <Image
                src={h.img}
                alt=""
                width={48}
                height={48}
                className="w-12 h-12 object-contain bg-white rounded-[10px] shadow-[0_0_0_1px_var(--color-line)]"
              />
              <span>
                <span className="font-display text-[26px] md:text-[28px]">{h.name}</span>
                <span> — มองให้เห็นใต้จุดสัมผัส</span>
              </span>
            </h2>
            <span className="font-mono text-[13px] text-muted">{h.ppm} / นาที</span>
          </div>

          <MechanismDiagram
            step={stepIndex}
            showNet={showNet}
            suc={suc}
            led={okLight && led}
            las={okLight && las}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 border border-line border-t-0 rounded-b-[16px] bg-white">
            <div className="p-5">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-[16px] font-semibold">แรงดูด</span>
                <span className="px-3 py-0.5 rounded-full bg-rose-soft text-rose-ink font-semibold text-[14px]">
                  {sucLabel}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={suc}
                onChange={(e) => onSuc(+e.target.value)}
                aria-label="แรงดูด"
                className="w-full m-0 accent-ink"
              />
              <div className="flex justify-between mt-0.5 text-[13px] text-muted">
                <span>เบา</span>
                <span>กลาง</span>
                <span>แรง</span>
              </div>
            </div>
            <div className="p-5 border-t md:border-t-0 md:border-l border-line">
              <div className="flex items-baseline justify-between mb-2.5">
                <span className="text-[16px] font-semibold">แสง</span>
                <span className="text-[12.5px] text-ink-2">เฉพาะหัว RoboSolo</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <LightToggle
                  label="LED"
                  sub={`650 nm · ${!okLight ? "ไม่มีในหัวนี้" : led ? "เปิด" : "ปิด"}`}
                  on={okLight && led}
                  disabled={!okLight}
                  dot="#E06C5E"
                  onClick={() => onToggleLight("led")}
                />
                <LightToggle
                  label="Laser"
                  sub={`915 nm · ${!okLight ? "ไม่มีในหัวนี้" : las ? "เปิด" : "ปิด"}`}
                  on={okLight && las}
                  disabled={!okLight}
                  dot="#C08A5A"
                  onClick={() => onToggleLight("las")}
                />
              </div>
              <p
                className={`mt-2 text-[12.5px] leading-[1.5] ${
                  okLight ? "text-ink-2" : "text-rose-ink"
                }`}
              >
                {okLight
                  ? "แสงเปิด-ปิดที่เครื่องตามการตั้งค่าของคลินิก ภาพนี้เป็นการจำลอง"
                  : `Laser และ LED มีเฉพาะหัว RoboSolo · ${h.name} ทำงานด้วยแรงดูดและลูกกลิ้งอย่างเดียว`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-3.5">
            <button
              type="button"
              onClick={() => onLockStep(null)}
              aria-label="แสดงทุกขั้น"
              className="flex-none w-10 h-10 border border-chalk rounded-full bg-paper text-[12px] cursor-pointer hover:bg-white"
            >
              All
            </button>
            <div
              role="tablist"
              aria-label="ขั้นของกลไก"
              className="flex-1 grid grid-cols-5 gap-1.5"
            >
              {MECHANISM_STEPS.map((st, i) => {
                const on = stepIndex === i;
                return (
                  <button
                    key={st.k}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => onLockStep(i === 0 ? null : i)}
                    className={`relative h-10 pt-2.5 border-0 bg-transparent text-[13px] cursor-pointer transition-colors ${
                      on ? "text-ink font-semibold" : "text-muted hover:text-ink-2"
                    }`}
                  >
                    <span
                      aria-hidden
                      className="absolute left-0 right-0 top-0 h-[3px] rounded-sm bg-chalk"
                    />
                    <span
                      aria-hidden
                      style={{ width: on ? "100%" : "0%" }}
                      className="absolute left-0 top-0 h-[3px] rounded-sm bg-rose transition-all"
                    />
                    {st.label}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={onToggleNet}
              aria-pressed={showNet}
              className={`flex-none h-9 px-3.5 rounded-full border border-chalk text-[13.5px] cursor-pointer transition-colors ${
                showNet ? "bg-rose-soft" : "bg-paper hover:bg-white"
              }`}
            >
              โครงข่าย
            </button>
          </div>
          <p className="mt-2.5 text-[15px] text-ink-2">
            <span className="mr-2.5 font-mono text-[11.5px] font-medium tracking-[0.08em] text-rose">
              {cap.k}
            </span>
            {cap.t}
          </p>

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-chalk">
            <span className="text-[12.5px] text-muted">
              ภาพจำลองขยายเพื่ออธิบายกลไก ไม่ใช่มาตราส่วนหรือการคาดการณ์ผลการรักษา
            </span>
            <button
              type="button"
              onClick={onNext}
              className="h-[50px] px-6 rounded-full bg-ink text-bg text-[15px] font-medium cursor-pointer hover:bg-ink-2 transition-colors"
            >
              ดูสรุปที่เลือกไว้ →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function LightToggle({
  label,
  sub,
  on,
  disabled,
  dot,
  onClick,
}: {
  label: string;
  sub: string;
  on: boolean;
  disabled: boolean;
  dot: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      disabled={disabled}
      className={`flex items-center gap-2.5 p-2.5 border rounded-lg text-left cursor-pointer transition-all ${
        on ? "border-ink bg-white" : "border-line bg-paper hover:bg-white"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <span
        aria-hidden
        style={{ background: on ? dot : "var(--color-chalk)", boxShadow: on ? `0 0 0 3px ${dot}22, 0 0 12px ${dot}99` : "none" }}
        className="flex-none w-3 h-3 rounded-full"
      />
      <span>
        <span className="block text-[14.5px] font-semibold leading-[1.3]">{label}</span>
        <span className="block font-mono text-[12.5px] text-muted leading-[1.3]">{sub}</span>
      </span>
    </button>
  );
}
