"use client";

import { useRef, useState } from "react";
import { TECH_POSTER, TECH_VIDEO } from "@/lib/assets";

export default function Technology() {
  const vref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);

  const toggle = () => {
    const v = vref.current;
    if (!v) return;
    if (playing) v.pause();
    else v.play().catch(() => {});
    setPlaying((p) => !p);
  };

  return (
    <section id="technology" className="bg-ink text-bg">
      <div className="lp-wrap py-[72px] md:py-[104px]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
          <div>
            <p className="font-mono text-[12px] tracking-[0.14em] uppercase text-chalk">
              02 · Technology revealed
            </p>
            <h2 className="mt-3.5 font-display font-medium text-[40px] md:text-[56px] lg:text-[68px] leading-none">
              See what happens beneath.
            </h2>
          </div>
          <p className="max-w-[400px] text-[16px] md:text-[17px] leading-[1.7] text-[#E4DDD0]">
            ลูกกลิ้งที่มีรูเล็กจำนวนมาก แรงดูดผ่านรูกระตุ้นผิวเป็นจุดเล็กๆ ขณะหมุน ·
            Multi Micro Alveolar Stimulation
          </p>
        </div>
        <div className="mt-10 md:mt-[52px] relative rounded-2xl overflow-hidden bg-black aspect-video">
          <video
            ref={vref}
            src={TECH_VIDEO}
            poster={TECH_POSTER}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="วิดีโอหัว Roboderm กลิ้งบนผิว"
            className="w-full h-full object-cover block"
          />
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "หยุดวิดีโอ" : "เล่นวิดีโอ"}
            className="absolute right-4 bottom-4 w-11 h-11 rounded-full border border-white/50 bg-ink/55 text-white text-[13px] hover:bg-ink/75 transition-colors"
          >
            {playing ? "❚❚" : "▶"}
          </button>
        </div>
        <div className="mt-9 grid grid-cols-2 lg:grid-cols-4 border-t border-[#4a4642]">
          <StatCell n="21,600" l="จุดกระตุ้นต่อนาที · RoboTwins" />
          <StatCell n="+25%" l="พื้นที่สัมผัสจากรูบนลูกกลิ้ง" border />
          <StatCell n="915 nm" l="Laser" border />
          <StatCell n="650 nm" l="LED" border />
        </div>
      </div>
    </section>
  );
}

function StatCell({ n, l, border = false }: { n: string; l: string; border?: boolean }) {
  return (
    <div className={`pt-[22px] pr-6 pb-0 ${border ? "md:border-l md:border-[#4a4642] md:pl-6" : ""}`}>
      <div className="font-mono text-[26px] md:text-[30px] leading-[1.1]">{n}</div>
      <div className="text-[14px] text-[#CFC6B8] mt-1">{l}</div>
    </div>
  );
}
