"use client";

import Image from "next/image";
import Link from "next/link";
import { LOGO_LIGHT } from "@/lib/assets";
import { STAGE_LABELS, Stage } from "./types";

export default function StageNav({
  stage,
  onGo,
}: {
  stage: Stage;
  onGo: (s: Stage) => void;
}) {
  return (
    <header className="border-b border-chalk sticky top-0 z-20 bg-bg/95 backdrop-blur-sm">
      <div className="lp-wrap flex items-center gap-4 lg:gap-7 h-[72px] md:h-[80px] flex-wrap">
        <Link
          href="/"
          aria-label="กลับหน้าแรก BIB"
          className="flex items-center gap-3.5 shrink-0"
        >
          <Image
            src={LOGO_LIGHT}
            alt="BIB"
            width={160}
            height={44}
            className="h-10 md:h-11 w-auto"
            priority
          />
          <span className="font-mono text-[12px] tracking-[0.14em] text-ink-2 hidden md:inline">
            PRECISION LAB
          </span>
        </Link>
        <nav
          aria-label="ขั้นตอน"
          className="order-3 md:order-none w-full md:w-auto md:flex-1 flex items-center md:justify-center gap-3.5 overflow-x-auto pb-1 md:pb-0"
        >
          {STAGE_LABELS.map((label, i) => {
            const n = (i + 1) as Stage;
            const on = stage === n;
            return (
              <button
                key={label}
                type="button"
                onClick={() => onGo(n)}
                aria-current={on ? "step" : "false"}
                className={`h-12 md:h-20 px-0.5 border-0 border-b-2 bg-transparent whitespace-nowrap cursor-pointer text-[14.5px] transition-colors ${
                  on
                    ? "border-rose text-ink font-semibold"
                    : "border-transparent text-muted hover:text-ink-2"
                }`}
              >
                <span className="font-mono text-[12.5px] mr-1.5">
                  0{i + 1}
                </span>
                {label}
              </button>
            );
          })}
        </nav>
        <span className="hidden lg:inline font-mono text-[12px] tracking-[0.18em] shrink-0">
          SEE THE UNSEEN
        </span>
      </div>
    </header>
  );
}
