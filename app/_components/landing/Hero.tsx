"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AREAS, FIGURE_POINTS, FRONT_IDS, BACK_IDS, AreaId } from "@/lib/areas";
import { PROGRAM_ICON, FIGURES } from "@/lib/assets";
import { HANDPIECES } from "@/lib/handpieces";

type Gender = "f" | "m";
type View = "front" | "back";

// Handpieces suggested per area (from the prototype A{} object).
const AREA_HANDPIECES: Partial<Record<AreaId, ("RS" | "RT" | "RM" | "RC")[]>> = {
  face: ["RM", "RC"],
  arms: ["RS", "RT"],
  upper: ["RS", "RT"],
  abdomen: ["RS", "RT"],
  hips: ["RT", "RS"],
  legs: ["RT", "RS"],
};

export default function Hero() {
  const [gender, setGender] = useState<Gender>("f");
  const [view, setView] = useState<View>("front");
  const [area, setArea] = useState<AreaId>("arms");
  const [k, setK] = useState(0);

  const ids = view === "front" ? FRONT_IDS : BACK_IDS;
  const currentArea: AreaId = ids.includes(area) ? area : ids[0];
  const a = AREAS[currentArea];
  const kc = Math.min(k, a.k.length - 1);
  const pts = FIGURE_POINTS[gender][view];
  const fig = FIGURES[gender];
  const figSrc = view === "front" ? fig.front : fig.back;
  const figAlt = view === "front" ? fig.altFront : fig.altBack;

  const dots = useMemo(() => {
    const d: { x: number; y: number; id: AreaId; on: boolean; label: string }[] = [];
    ids.forEach((id, i) => {
      const positions = pts[id] || [];
      positions.forEach(([x, y]) => {
        d.push({
          x,
          y,
          id,
          on: id === currentArea,
          label: String(i + 1).padStart(2, "0"),
        });
      });
    });
    return d;
  }, [ids, pts, currentArea]);

  const progs = a.k[kc][1];
  const hands = (AREA_HANDPIECES[currentArea] || ["RS", "RT"]).map(
    (h) => HANDPIECES[h].name
  );

  const explorerHref = `/explorer?g=${gender}&v=${view}&area=${currentArea}&k=${kc}`;

  return (
    <section id="top">
      <div className="lp-wrap pt-6 pb-14 lg:pb-16 relative grid grid-cols-1 lg:grid-cols-12 gap-x-6 lg:min-h-[880px]">
        {/* Copy column */}
        <div className="lg:col-span-4 flex flex-col pt-10 lg:pt-[84px]">
          <p className="font-mono text-[12px] tracking-[0.14em] uppercase text-ink-2 font-medium">
            See the unseen · Forgotten
          </p>
          <h1 className="mt-5 font-display font-medium text-[56px] md:text-[72px] lg:text-[84px] leading-[0.98] tracking-tight">
            Beyond
            <br />
            the face.
          </h1>
          <p className="mt-5 text-[19px] md:text-[21px] leading-[1.55] max-w-[420px]">
            สำรวจการดูแลในหลายบริเวณของร่างกาย
          </p>
          <p className="mt-2.5 text-[15px] text-ink-2">
            <span className="font-mono font-medium text-ink">50</span> จุดทั่วร่างกายที่คุณอาจลืมดูแล
          </p>

          <div className="mt-10 border-t border-chalk">
            {ids.map((id, i) => {
              const on = id === currentArea;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setArea(id);
                    setK(0);
                  }}
                  aria-pressed={on}
                  className={`w-full grid grid-cols-[36px_1fr_auto] items-center min-h-[58px] border-0 border-b border-chalk bg-transparent text-left cursor-pointer transition-all ${
                    on
                      ? "pl-3.5 -ml-4 shadow-[inset_2px_0_0_var(--color-rose)]"
                      : "pl-0 hover:bg-paper/40"
                  }`}
                >
                  <span
                    className={`font-mono text-[12.5px] font-medium ${
                      on ? "text-rose-ink" : "text-ink-2"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex items-baseline gap-3">
                    <span
                      className={`text-[17px] ${
                        on ? "font-semibold text-ink" : "font-normal text-ink-2"
                      }`}
                    >
                      {AREAS[id].th}
                    </span>
                    <span className="font-mono text-[12.5px] text-ink-2">
                      {AREAS[id].en}
                    </span>
                  </span>
                  <span
                    className={`w-7 h-px ${on ? "bg-rose" : "bg-transparent"}`}
                    aria-hidden
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Figure column */}
        <div className="lg:col-span-4 relative flex flex-col items-center min-h-[560px] lg:min-h-[880px] mt-8 lg:mt-0">
          <div className="lg:absolute lg:left-1/2 lg:top-10 lg:-translate-x-1/2 flex gap-2.5 z-10">
            <ToggleGroup
              label="เพศ"
              value={gender}
              options={[
                ["f", "หญิง"],
                ["m", "ชาย"],
              ]}
              onChange={(v) => setGender(v as Gender)}
            />
            <ToggleGroup
              label="มุมมอง"
              value={view}
              options={[
                ["front", "ด้านหน้า"],
                ["back", "ด้านหลัง"],
              ]}
              onChange={(v) => {
                setView(v as View);
                setK(0);
              }}
            />
          </div>

          <div className="relative mt-4 lg:absolute lg:left-1/2 lg:top-[116px] lg:-translate-x-1/2 h-[500px] md:h-[600px] lg:h-[700px]">
            <Image
              src={figSrc}
              alt={figAlt}
              width={260}
              height={700}
              priority
              className="block h-full w-auto"
            />
            <div
              aria-hidden
              className="absolute left-1/2 -bottom-1 w-[150px] h-3 -ml-[75px] rounded-[50%] bg-ink/[0.08] blur-[4px]"
            />
            {dots.map((d, i) => (
              <button
                key={`${d.id}-${i}-${d.x}`}
                type="button"
                onClick={() => {
                  setArea(d.id);
                  setK(0);
                }}
                aria-label={AREAS[d.id].th}
                style={{ left: `${d.x}%`, top: `${d.y}%` }}
                className="absolute w-11 h-11 -m-[22px] border-0 bg-transparent cursor-pointer p-0"
              >
                {d.on ? (
                  <>
                    <span className="absolute inset-0 rounded-full border border-rose/60" />
                    <span className="absolute left-2 top-2 w-7 h-7 box-border rounded-full bg-paper border-[1.5px] border-rose flex items-center justify-center font-mono text-[10.5px] font-semibold text-ink">
                      {d.label}
                    </span>
                  </>
                ) : (
                  <span className="absolute left-[15px] top-[15px] w-3.5 h-3.5 rounded-full bg-paper/90 shadow-[0_0_0_1px_rgba(44,42,40,0.35)]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Side panel */}
        <div className="lg:col-span-4 lg:pt-[150px]">
          <div className="rounded-[18px] border border-line bg-paper p-7 lg:p-[30px] shadow-[0_1px_2px_rgba(44,42,40,0.04),0_18px_40px_rgba(44,42,40,0.05)]">
            <p className="text-[15px] text-ink-2">
              <span className="font-display text-[20px] text-ink font-semibold">
                {String(ids.indexOf(currentArea) + 1).padStart(2, "0")}
              </span>
              <span className="mx-1">/</span> บริเวณที่เลือก
            </p>
            <h2 className="mt-2.5 font-display font-medium text-[36px] md:text-[44px] leading-[1.02]">
              {a.en}
            </h2>
            <p className="mt-1 text-[20px] font-medium">{a.th}</p>

            <p className="mt-6 text-[17px] font-medium">อยากสำรวจเรื่องไหน?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {a.k.map(([label], i) => {
                const on = i === kc;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setK(i)}
                    aria-pressed={on}
                    className={`min-h-9 px-3.5 py-1 rounded-full text-[14px] cursor-pointer text-left transition-all ${
                      on
                        ? "bg-rose-soft text-rose-ink font-medium shadow-[inset_0_0_0_1px_#D9B3A5]"
                        : "bg-[#EAE3D7] text-ink-2 hover:bg-[#E0D8C8]"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 border-t border-line">
              <div className="grid grid-cols-[96px_1fr] gap-3 py-3.5 border-b border-line text-[15px]">
                <span className="text-ink-2">โปรแกรม</span>
                <span className="flex flex-wrap gap-1.5">
                  {progs.map((id) => (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 pl-0.5 rounded-md bg-[#ECE5D8] font-mono text-[12px] font-semibold"
                    >
                      <Image
                        src={PROGRAM_ICON[id] ?? ""}
                        alt=""
                        width={22}
                        height={22}
                        className="w-[22px] h-[22px] rounded-[3px] bg-white"
                      />
                      {id}
                    </span>
                  ))}
                </span>
              </div>
              <div className="grid grid-cols-[96px_1fr] gap-3 py-3.5 border-b border-line text-[15px]">
                <span className="text-ink-2">หัวที่ใช้</span>
                <span>{hands.join(" · ")}</span>
              </div>
              <a
                href="#technology"
                className="flex items-center justify-between min-h-[52px] border-b border-line text-[15px]"
              >
                <span>ดูกลไกการทำงาน</span>
                <span aria-hidden>↓</span>
              </a>
            </div>

            <Link
              href={explorerHref}
              className="mt-5 flex items-center justify-center min-h-[54px] rounded-xl bg-ink text-bg text-[16px] font-medium hover:bg-ink-2 transition-colors"
            >
              ดูรายละเอียดใน Explorer
            </Link>
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
            className={`min-h-[34px] px-4 border-0 rounded-full text-[14px] cursor-pointer transition-colors ${
              on
                ? "bg-ink text-bg font-medium"
                : "bg-transparent text-ink-2 font-normal hover:bg-ink/5"
            }`}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}
