import Image from "next/image";
import { HANDPIECES, HANDPIECE_ORDER } from "@/lib/handpieces";

export default function Handpieces() {
  return (
    <section id="handpieces">
      <div className="lp-wrap py-[72px] md:py-[112px]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
          <div>
            <p className="font-mono text-[12px] tracking-[0.14em] uppercase text-ink-2">
              03 · Handpieces
            </p>
            <h2 className="mt-3.5 font-display font-medium text-[40px] md:text-[52px] lg:text-[60px] leading-none">
              One device. Four precise hands.
            </h2>
          </div>
          <p className="max-w-[380px] text-[16px] text-ink-2">
            หัว Roboderm® ที่ออกแบบต่างกันตามขนาดและลักษณะของบริเวณ
          </p>
        </div>
        <div className="mt-10 md:mt-12 grid grid-cols-2 lg:grid-cols-4 border-t border-b border-chalk">
          {HANDPIECE_ORDER.map((k, i) => {
            const h = HANDPIECES[k];
            return (
              <div
                key={k}
                className={`px-5 py-7 flex flex-col ${
                  i > 0 ? "lg:border-l lg:border-chalk" : ""
                } ${i > 0 && i < 2 ? "border-l border-chalk" : ""} ${
                  i === 2 ? "lg:border-l lg:border-chalk" : ""
                } ${i === 3 ? "border-l border-chalk lg:border-l" : ""}`}
              >
                <div className="aspect-square bg-white rounded-[10px] overflow-hidden">
                  <Image
                    src={h.img}
                    alt={`หัว ${h.name}`}
                    width={320}
                    height={320}
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="mt-[18px] font-mono text-[11.5px] tracking-[0.14em] uppercase text-ink-2">
                  {h.line}
                </p>
                <div className="font-display text-[26px] md:text-[30px] leading-[1.1] mt-1">
                  {h.name}
                </div>
                <p className="mt-2.5 text-[14.5px] text-ink-2 min-h-[48px]">{h.desc}</p>
                <div className="mt-4 pt-3 border-t border-chalk flex items-baseline justify-between">
                  <span className="text-[13.5px] text-ink-2">จุดกระตุ้นต่อนาที</span>
                  <span className="font-mono text-[16px] font-medium">{h.ppm}</span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3.5 font-mono text-[12.5px] text-ink-2">
          ข้อมูลจาก beautyinbeyond.com/products
        </p>
      </div>
    </section>
  );
}
