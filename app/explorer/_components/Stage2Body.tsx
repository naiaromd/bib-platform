"use client";

import Image from "next/image";
import { useMemo } from "react";
import {
  AREAS,
  AreaId,
  FIGURE_POINTS,
  FRONT_IDS_WITH_WHOLE,
  BACK_IDS_WITH_WHOLE,
} from "@/lib/areas";
import { FIGURES } from "@/lib/assets";
import { Gender, View } from "./types";

export default function Stage2Body({
  gender,
  view,
  area,
  picked,
  onGender,
  onView,
  onArea,
  onToggleConcern,
  onNext,
}: {
  gender: Gender;
  view: View;
  area: AreaId;
  picked: Record<string, boolean>;
  onGender: (g: Gender) => void;
  onView: (v: View) => void;
  onArea: (id: AreaId) => void;
  onToggleConcern: (key: string) => void;
  onNext: () => void;
}) {
  const ids = view === "front" ? FRONT_IDS_WITH_WHOLE : BACK_IDS_WITH_WHOLE;
  const currentArea: AreaId = ids.includes(area) ? area : ids[0];
  const a = AREAS[currentArea];
  const pts = FIGURE_POINTS[gender][view];
  const fig = FIGURES[gender];
  const figSrc = view === "front" ? fig.front : fig.back;
  const figAlt = view === "front" ? fig.altFront : fig.altBack;
  const pickedKeys = Object.keys(picked).filter((k) => picked[k]);
  const countIn = (id: AreaId) =>
    pickedKeys.filter((k) => k.split(":")[0] === id).length;

  const spots = useMemo(() => {
    const arr: { id: AreaId; x: number; y: number; label: string }[] = [];
    ids.forEach((id, i) => {
      if (id === "whole") return;
      (pts[id] || []).forEach(([x, y]) => {
        arr.push({
          id,
          x,
          y,
          label: String(i + 1).padStart(2, "0"),
        });
      });
    });
    return arr;
  }, [ids, pts]);

  return (
    <section className="relative grid grid-cols-1 lg:grid-cols-12 gap-x-6 gap-y-10 lg:min-h-[860px]">
      {/* Area list */}
      <div className="lg:col-span-4 flex flex-col gap-7 pt-6">
        <div className="flex flex-col gap-2.5">
          <p className="text-[14px] font-medium text-muted">02 · โจทย์ที่สนใจ</p>
          <h1 className="font-semibold text-[28px] md:text-[34px] leading-[1.3]">
            เลือกบริเวณ
            <br />
            แล้วดูโจทย์ที่เกี่ยวข้อง
          </h1>
        </div>
        <div role="list" aria-label="บริเวณร่างกาย" className="flex flex-col border-t border-chalk">
          {ids.map((id, i) => {
            const on = id === currentArea;
            const c = countIn(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => onArea(id)}
                aria-current={on}
                className={`grid grid-cols-[34px_1fr_auto] items-center w-full h-14 border-0 border-b border-chalk bg-transparent text-left cursor-pointer transition-all ${
                  on
                    ? "pl-3.5 shadow-[inset_2px_0_0_var(--color-rose)]"
                    : "pl-0 hover:bg-paper/40"
                }`}
              >
                <span
                  className={`font-mono text-[12.5px] ${
                    on ? "text-rose" : "text-muted"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={`text-[17px] ${on ? "font-semibold text-ink" : "text-ink-2"}`}
                >
                  {AREAS[id].th}
                </span>
                <span className="text-[13px] text-muted pr-1">
                  {c ? `${c} โจทย์` : ""}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Figure */}
      <div className="lg:col-span-4 relative flex flex-col items-center lg:min-h-[860px]">
        <div className="relative lg:absolute lg:left-1/2 lg:top-4 lg:-translate-x-1/2 flex gap-2.5 z-10 flex-wrap justify-center">
          <ToggleGroup
            label="เพศของร่าง"
            value={gender}
            options={[
              ["f", "หญิง"],
              ["m", "ชาย"],
            ]}
            onChange={(v) => onGender(v as Gender)}
          />
          <ToggleGroup
            label="มุมมอง"
            value={view}
            options={[
              ["front", "ด้านหน้า"],
              ["back", "ด้านหลัง"],
            ]}
            onChange={(v) => onView(v as View)}
          />
        </div>

        <div className="relative mt-4 lg:absolute lg:left-1/2 lg:top-[92px] lg:-translate-x-1/2 h-[460px] md:h-[560px] lg:h-[740px]">
          <Image
            src={figSrc}
            alt={figAlt}
            width={260}
            height={740}
            priority
            className="block h-full w-auto"
          />
          <div
            aria-hidden
            className="absolute left-1/2 -bottom-1.5 w-[150px] h-3 -ml-[75px] rounded-[50%] bg-ink/[0.08] blur-[4px]"
          />
          {spots.map((s, i) => {
            const on = s.id === currentArea;
            return (
              <button
                key={`${s.id}-${i}-${s.x}`}
                type="button"
                onClick={() => onArea(s.id)}
                aria-label={AREAS[s.id].th}
                title={AREAS[s.id].th}
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
                className="absolute w-11 h-11 -m-[22px] border-0 bg-transparent cursor-pointer p-0"
              >
                {on ? (
                  <>
                    <span className="absolute inset-0 rounded-full border border-rose/55" />
                    <span className="absolute left-2 top-2 w-7 h-7 box-border rounded-full bg-paper border-[1.5px] border-rose flex items-center justify-center font-mono text-[10.5px] font-semibold text-ink">
                      {s.label}
                    </span>
                  </>
                ) : (
                  <span className="absolute left-[15px] top-[15px] w-3.5 h-3.5 rounded-full bg-paper/90 shadow-[0_0_0_1px_rgba(44,42,40,0.35)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Concerns panel */}
      <div className="lg:col-span-4 lg:pt-[120px]">
        <div className="flex flex-col p-7 rounded-[18px] border border-line bg-paper shadow-[0_18px_40px_rgba(44,42,40,0.05)]">
          <p className="text-[15px] text-muted">
            <span className="font-display text-[20px] font-semibold text-ink">
              {String(ids.indexOf(currentArea) + 1).padStart(2, "0")}
            </span>
            <span className="mx-1">/</span> บริเวณที่สนใจ
          </p>
          <h2 className="mt-2 font-semibold text-[26px] md:text-[30px] leading-[1.3]">
            {a.th}
          </h2>
          <p className="mt-2 text-[15px] leading-[1.6] text-ink-2">{a.note}</p>

          <p className="mt-5 text-[16px] font-semibold mb-2.5">
            โจทย์ที่เกี่ยวข้อง{" "}
            <span className="font-normal text-[14px] text-muted">· เลือกได้หลายข้อ</span>
          </p>
          <div className="flex flex-col border-t border-line">
            {a.k.map(([label, programs], i) => {
              const key = `${currentArea}:${i}`;
              const on = !!picked[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onToggleConcern(key)}
                  aria-pressed={on}
                  className="grid grid-cols-[22px_1fr] gap-3 items-start w-full py-3 px-0.5 border-0 border-b border-line bg-transparent text-left cursor-pointer hover:bg-ink/5 transition-colors"
                >
                  <span
                    aria-hidden
                    className={`w-5 h-5 mt-0.5 rounded-md border-[1.5px] text-[12px] leading-[17px] text-center text-bg transition-colors ${
                      on ? "bg-ink border-ink" : "bg-white border-chalk"
                    }`}
                  >
                    {on && "✓"}
                  </span>
                  <span>
                    <span
                      className={`block text-[15.5px] leading-[1.5] ${
                        on ? "font-semibold" : ""
                      }`}
                    >
                      {label}
                    </span>
                    <span className="block mt-0.5 font-mono text-[12px] text-muted">
                      {programs.join(" · ")}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-5">
            <span className="text-[14px] text-ink-2">
              เลือกไว้{" "}
              <span className="font-mono font-semibold text-ink">
                {pickedKeys.length}
              </span>{" "}
              โจทย์
            </span>
            <button
              type="button"
              onClick={onNext}
              className="h-[50px] px-6 rounded-full bg-ink text-bg text-[15px] font-medium cursor-pointer hover:bg-ink-2 transition-colors"
            >
              ลองจัดแนวทาง →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ToggleGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: [string, string][];
  onChange: (v: string) => void;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex border border-chalk rounded-full p-[3px] bg-paper"
    >
      {options.map(([v, l]) => {
        const on = v === value;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            aria-pressed={on}
            className={`h-[34px] px-4 border-0 rounded-full text-[14px] cursor-pointer transition-colors ${
              on
                ? "bg-ink text-bg font-medium"
                : "bg-transparent text-ink-2 hover:bg-ink/5"
            }`}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}
