"use client";

import Image from "next/image";
import { useState } from "react";
import {
  PROGRAMS,
  PROGRAM_GROUP_COLOR,
  PROGRAM_GROUP_NOTE,
  ProgramGroup,
} from "@/lib/programs";
import { PROGRAM_ICON } from "@/lib/assets";

const GROUPS: ProgramGroup[] = ["Base", "Focus", "Healthcare"];

export default function Programs() {
  const [tab, setTab] = useState<ProgramGroup>("Focus");
  const list = PROGRAMS[tab];

  return (
    <section id="programs" className="bg-paper border-t border-b border-chalk">
      <div className="lp-wrap py-[72px] md:py-[104px]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
          <div>
            <p className="font-mono text-[12px] tracking-[0.14em] uppercase text-ink-2">
              04 · 40 Programs
            </p>
            <h2 className="mt-3.5 font-display font-medium text-[40px] md:text-[52px] lg:text-[60px] leading-none">
              Designed for every area.
            </h2>
          </div>
          <div role="tablist" aria-label="กลุ่มโปรแกรม" className="flex flex-wrap gap-2">
            {GROUPS.map((g) => {
              const on = g === tab;
              return (
                <button
                  key={g}
                  type="button"
                  role="tab"
                  onClick={() => setTab(g)}
                  aria-selected={on}
                  className={`min-h-[44px] px-[18px] inline-flex items-center gap-2.5 rounded-md text-[14px] font-medium transition-colors cursor-pointer border ${
                    on
                      ? "border-ink bg-ink text-bg"
                      : "border-chalk bg-transparent text-ink hover:bg-ink/5"
                  }`}
                >
                  <i
                    style={{ background: PROGRAM_GROUP_COLOR[g] }}
                    className="w-2 h-2 rounded-sm"
                  />
                  {g} · {PROGRAMS[g].length}
                </button>
              );
            })}
          </div>
        </div>
        <p className="mt-[18px] text-[16px] text-ink-2">{PROGRAM_GROUP_NOTE[tab]}</p>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 border-t border-l border-chalk">
          {list.map(([id, th]) => (
            <div
              key={id}
              className="px-2.5 pt-5 pb-4 border-r border-b border-chalk flex flex-col items-center text-center"
            >
              <Image
                src={PROGRAM_ICON[id] ?? ""}
                alt=""
                width={72}
                height={71}
                className="w-[72px] h-[71px] object-contain border border-chalk rounded-[4px] bg-white"
              />
              <div className="mt-2.5 font-mono text-[12px] font-semibold tracking-[0.02em]">
                {id}
              </div>
              <div className="mt-0.5 text-[13.5px] leading-[1.45] text-ink-2">{th}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
