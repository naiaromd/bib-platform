import Image from "next/image";
import { LOGO_LIGHT } from "@/lib/assets";
import { AIRTABLE_FORM_URL } from "@/lib/env";

const nav = [
  { href: "#top", label: "Explore", current: true },
  { href: "#technology", label: "Technology" },
  { href: "#handpieces", label: "Handpieces" },
  { href: "#programs", label: "Programs" },
  { href: "#evidence", label: "Evidence" },
  { href: "#clinics", label: "For clinics" },
];

export default function Header() {
  return (
    <header className="border-b border-chalk sticky top-0 bg-bg/95 backdrop-blur-sm z-20">
      <div className="lp-wrap flex items-center justify-between gap-6 h-[72px] md:h-[88px]">
        <a href="#top" aria-label="BIB หน้าแรก" className="shrink-0">
          <Image
            src={LOGO_LIGHT}
            alt="BIB Beauty Innovation & Beyond"
            width={160}
            height={50}
            className="h-10 md:h-[50px] w-auto"
            priority
          />
        </a>
        <nav aria-label="เมนูหลัก" className="hidden lg:flex items-center gap-8 text-[15px] text-ink-2">
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className={
                n.current
                  ? "text-ink font-medium border-b border-rose pb-[3px]"
                  : "hover:text-ink transition-colors"
              }
            >
              {n.label}
            </a>
          ))}
        </nav>
        <a
          href={AIRTABLE_FORM_URL}
          className="hidden md:inline-flex items-center min-h-[42px] px-5 rounded-md bg-ink text-bg text-[14px] font-medium hover:bg-ink-2 transition-colors"
        >
          ขอนัดเดโม
        </a>
      </div>
    </header>
  );
}
