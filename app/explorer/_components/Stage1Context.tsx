"use client";

import { CONTEXT_OPTIONS } from "./types";

export default function Stage1Context({
  ctx,
  onToggle,
  onNext,
}: {
  ctx: Record<string, boolean>;
  onToggle: (key: string) => void;
  onNext: () => void;
}) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-x-6 gap-y-10 pt-10">
      <div className="lg:col-span-6 flex flex-col gap-5">
        <p className="font-mono text-[12px] tracking-[0.14em] text-muted">
          SEE THE UNSEEN · FORGOTTEN
        </p>
        <h1 className="font-display font-semibold text-[40px] md:text-[48px] leading-[1.25]">
          คนไข้ดูแลใบหน้าแล้ว
          <br />
          ส่วนอื่นของร่างกายล่ะ
        </h1>
        <p className="max-w-[540px] text-[17px] md:text-[18px] leading-[1.7] text-ink-2">
          ลองดูว่าบริเวณไหน โจทย์แบบไหน และโปรแกรม icoone® ตัวไหน
          ที่คลินิกคุณจัดเป็นบริการได้ แล้วเก็บเป็นร่างไว้คุยกับทีม BIB
        </p>
        <div className="flex gap-0 mt-4 border-t border-chalk max-w-[540px]">
          <div className="flex-1 pt-4 pr-5">
            <div className="font-display font-medium text-[44px] md:text-[52px] leading-none">40</div>
            <div className="mt-1.5 text-[14px] text-ink-2">
              โปรแกรมในเครื่อง
              <br />
              <span className="font-mono text-[12.5px] text-muted">
                Base 8 · Focus 16 · Healthcare 16
              </span>
            </div>
          </div>
          <div className="flex-1 pt-4 pl-5 border-l border-chalk">
            <div className="font-display font-medium text-[44px] md:text-[52px] leading-none">7</div>
            <div className="mt-1.5 text-[14px] text-ink-2">
              บริเวณร่างกาย
              <br />
              <span className="font-mono text-[12.5px] text-muted">
                face · arms · upper · abdomen · hips · legs · whole
              </span>
            </div>
          </div>
        </div>
      </div>
      <aside className="lg:col-span-5 lg:col-start-8 flex flex-col gap-4 p-6 lg:p-[30px] bg-paper border border-line rounded-[18px] shadow-[0_18px_40px_rgba(44,42,40,0.05)]">
        <h2 className="font-semibold text-[22px] leading-[1.4]">
          คลินิกของคุณดูแลคนไข้กลุ่มไหนเป็นหลัก
        </h2>
        <p className="text-[14px] text-ink-2">
          เลือกได้มากกว่าหนึ่ง ใช้จัดลำดับเรื่องที่น่าจะเกี่ยวกับคลินิกคุณ
        </p>
        <div className="flex flex-col border-t border-line">
          {CONTEXT_OPTIONS.map(([key, label]) => {
            const on = !!ctx[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => onToggle(key)}
                aria-pressed={on}
                className="flex items-center gap-3.5 h-14 px-1 border-0 border-b border-line bg-transparent text-left cursor-pointer text-[16px] hover:bg-ink/5 transition-colors"
              >
                <span
                  aria-hidden
                  className={`flex-none w-5 h-5 rounded-md border-[1.5px] text-[12px] leading-[17px] text-center text-bg transition-colors ${
                    on ? "bg-ink border-ink" : "bg-white border-chalk"
                  }`}
                >
                  {on && "✓"}
                </span>
                <span className={on ? "font-semibold" : ""}>{label}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onNext}
          className="self-start h-[50px] mt-2 px-[26px] rounded-full bg-ink text-bg text-[15px] font-medium cursor-pointer hover:bg-ink-2 transition-colors"
        >
          เลือกเรื่องที่สนใจ →
        </button>
      </aside>
    </section>
  );
}
