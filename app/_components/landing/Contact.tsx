import Image from "next/image";
import { LOGO_DARK } from "@/lib/assets";
import { AIRTABLE_FORM_URL } from "@/lib/env";

export default function Contact() {
  return (
    <section id="contact" className="bg-ink text-bg">
      <div className="lp-wrap pt-[72px] md:pt-[88px] pb-9">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 lg:gap-8">
          <div>
            <p className="font-mono text-[12px] tracking-[0.14em] uppercase text-chalk">
              See the unseen
            </p>
            <h2 className="mt-3.5 font-display font-medium text-[40px] md:text-[52px] lg:text-[60px] leading-[1.02]">
              Start with the parts
              <br />
              your patients forgot.
            </h2>
          </div>
          <div className="flex flex-col lg:items-end gap-2.5">
            <a
              href="/explorer"
              className="inline-flex items-center min-h-[50px] px-6 rounded-md bg-bg text-ink text-[15px] font-medium hover:bg-chalk transition-colors"
            >
              เริ่มสำรวจใน Explorer
            </a>
            <a
              href={AIRTABLE_FORM_URL}
              className="text-[14px] text-[#E4DDD0] border-b border-[#8f877c] pb-[2px] hover:text-bg transition-colors"
            >
              ขอให้ทีม BIB ติดต่อกลับ
            </a>
          </div>
        </div>
        <div className="mt-16 pt-7 border-t border-[#4a4642] flex flex-col lg:flex-row justify-between items-start gap-7">
          <Image
            src={LOGO_DARK}
            alt="BIB"
            width={180}
            height={54}
            className="h-12 md:h-[54px] w-auto"
          />
          <div className="flex flex-wrap gap-x-14 gap-y-7 text-[14px] leading-[1.8] text-[#E0D8CB]">
            <div className="flex flex-col">
              <span className="font-mono text-[11px] tracking-[0.14em] text-[#CFC6B8]">CONTACT</span>
              <a href="tel:+6629697745">02-969-7745</a>
              <a href="tel:+66659452505">06-5945-2505</a>
              <a href="mailto:info@beautyinbeyond.com">info@beautyinbeyond.com</a>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[11px] tracking-[0.14em] text-[#CFC6B8]">VISIT</span>
              <span>I plus Q Co., Ltd.</span>
              <span>9/1 Rattanathibet Soi 10, Bangkrasor</span>
              <span>Muang Nonthaburi 11000</span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[11px] tracking-[0.14em] text-[#CFC6B8]">FOLLOW</span>
              <span>LINE @beautyinbeyondTH</span>
            </div>
          </div>
        </div>
        <p className="mt-7 text-[13px] text-[#BDB4A7]">
          © 2026 Beauty Innovation &amp; Beyond · ตัวแทนจำหน่าย icoone® อย่างเป็นทางการในประเทศไทย
        </p>
      </div>
    </section>
  );
}
