"use client";

// Placeholder — full 4-stage Explorer lands in a follow-up commit.
// Reads the optional state hand-off from the Landing hero: ?g=m&v=front&area=arms&k=0

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AREAS, AreaId } from "@/lib/areas";
import { LOGO_LIGHT } from "@/lib/assets";

export default function ExplorerApp() {
  const sp = useSearchParams();
  const g = (sp.get("g") === "m" ? "ชาย" : "หญิง");
  const v = (sp.get("v") === "back" ? "ด้านหลัง" : "ด้านหน้า");
  const areaKey = (sp.get("area") || "arms") as AreaId;
  const k = Math.max(0, parseInt(sp.get("k") || "0", 10) || 0);
  const area = AREAS[areaKey] ?? AREAS.arms;
  const concern = area.k[Math.min(k, area.k.length - 1)];

  return (
    <main className="min-h-screen">
      <header className="border-b border-chalk">
        <div className="lp-wrap flex items-center gap-7 h-[72px] md:h-[80px]">
          <Link href="/" aria-label="กลับหน้าแรก BIB" className="flex items-center gap-3.5">
            <Image src={LOGO_LIGHT} alt="BIB" width={160} height={44} className="h-10 md:h-11 w-auto" priority />
            <span className="font-mono text-[12px] tracking-[0.14em] text-ink-2 hidden md:inline">
              PRECISION LAB
            </span>
          </Link>
          <nav className="flex-1 flex items-center justify-center gap-3.5 overflow-x-auto" aria-label="ขั้นตอน">
            {["บริบทคลินิก", "โจทย์ที่สนใจ", "เลือกหัวและโปรแกรม", "สรุปแนวทาง"].map((label, i) => (
              <span
                key={label}
                className={`h-[72px] md:h-20 flex items-center gap-1.5 border-b-2 px-0.5 text-[14.5px] font-mono whitespace-nowrap ${
                  i === 1 ? "border-rose text-ink font-semibold" : "border-transparent text-muted"
                }`}
              >
                <span className="font-mono text-[12.5px]">0{i + 1}</span>
                <span className="font-body">{label}</span>
              </span>
            ))}
          </nav>
          <span className="hidden lg:inline font-mono text-[12px] tracking-[0.18em]">
            SEE THE UNSEEN
          </span>
        </div>
      </header>

      <div className="lp-wrap py-16">
        <p className="font-mono text-[12px] tracking-[0.14em] uppercase text-muted">
          02 · โจทย์ที่สนใจ
        </p>
        <h1 className="mt-4 font-display text-[40px] md:text-[48px] leading-[1.1] font-semibold max-w-3xl">
          Explorer กำลังสร้าง · ตอนนี้โชว์ state ที่ได้มาจาก Landing
        </h1>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-x-6 gap-y-3 border-t border-chalk pt-6 max-w-3xl">
          <div className="font-mono text-[12.5px] uppercase tracking-[0.08em] text-muted">เพศหุ่น</div>
          <div className="text-[16px]">{g}</div>

          <div className="font-mono text-[12.5px] uppercase tracking-[0.08em] text-muted">มุมมอง</div>
          <div className="text-[16px]">{v}</div>

          <div className="font-mono text-[12.5px] uppercase tracking-[0.08em] text-muted">บริเวณ</div>
          <div className="text-[16px]">
            {area.th} <span className="font-mono text-[13px] text-ink-2">· {area.en}</span>
          </div>

          <div className="font-mono text-[12.5px] uppercase tracking-[0.08em] text-muted">โจทย์ที่เลือก</div>
          <div className="text-[16px]">
            {concern?.[0]}{" "}
            <span className="font-mono text-[13px] text-ink-2">
              · {concern?.[1].join(" · ")}
            </span>
          </div>
        </div>

        <div className="mt-10 p-5 rounded-xl border border-line bg-paper max-w-3xl text-[14.5px] text-ink-2 leading-[1.6]">
          <b className="text-ink">ยังไม่ใช่เวอร์ชันเต็ม</b> — Explorer ของจริงมี 4 ขั้น,
          หุ่น interactive, animation ใต้ผิว, Protocol cards จาก Airtable และ form สมัคร
          Pilot · ตามแผนที่ร่างไว้ใน audit (§01–§07) · ลงใน commit ถัดไป
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center min-h-[48px] px-5 rounded-full border border-ink text-ink hover:bg-ink hover:text-bg transition-colors"
          >
            ← กลับหน้าแรก
          </Link>
        </div>
      </div>
    </main>
  );
}
