import { FLAGS } from "@/lib/env";

const centres = [
  "SHA WELLNESS CLINIC",
  "NOMAD LONDON",
  "ANANTARA",
  "THE RITZ-CARLTON XI'AN",
  "PAXTON PARIS",
  "CLINIQUE LA PRAIRIE",
  "DIOR",
  "CARITA PARIS",
];

const awards = [
  {
    t: "Product Innovation of the Year",
    sub: "Asia Pacific Spa & Wellness Coalition Awards 2025",
  },
  {
    t: "Equipment Partner of the Year",
    sub: "Asia Pacific Spa & Wellness Coalition Awards 2025",
  },
  {
    t: "Professional Equipment of the Year",
    sub: "Thailand Spa & Well-being Award 2025",
  },
];

export default function Trust() {
  // Render nothing if every section is flagged off.
  if (!FLAGS.showGlobalStats && !FLAGS.showClientLogos && !FLAGS.showAwards) {
    return null;
  }

  return (
    <section className="border-t border-chalk">
      <div className="lp-wrap py-[72px] md:py-[88px]">
        {FLAGS.showGlobalStats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-7">
            <Stat n="4,500+" l="ศูนย์ทั่วโลก" />
            <Stat n="50+" l="ประเทศ · ไทยเป็นประเทศที่ 46" border />
            <Stat n="6,000,000+" l="ทรีตเมนต์ต่อปี" border />
            <Stat n="500,000+" l="ผู้รับบริการ" border />
          </div>
        )}

        {(FLAGS.showClientLogos || FLAGS.showAwards) && (
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {FLAGS.showClientLogos && (
              <div className="lg:col-span-6">
                <p className="font-mono text-[12px] tracking-[0.14em] uppercase text-ink-2">
                  ใช้งานในศูนย์ชั้นนำ
                </p>
                <div className="mt-[18px] grid grid-cols-1 sm:grid-cols-2 border-b border-chalk font-display text-[17px] md:text-[19px] tracking-[0.08em] text-ink-2">
                  {centres.map((c) => (
                    <span key={c} className="py-3 border-t border-chalk">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {FLAGS.showAwards && (
              <div className="lg:col-span-5 lg:col-start-8">
                <p className="font-mono text-[12px] tracking-[0.14em] uppercase text-ink-2">
                  Awards
                </p>
                <div className="mt-[18px] border-b border-chalk">
                  {awards.map((a) => (
                    <div key={a.t} className="py-3 border-t border-chalk">
                      <div className="font-medium">{a.t}</div>
                      <div className="font-mono text-[13px] text-ink-2">{a.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function Stat({ n, l, border = false }: { n: string; l: string; border?: boolean }) {
  return (
    <div className={`pr-6 ${border ? "lg:border-l lg:border-chalk lg:pl-6" : ""}`}>
      <div className="font-display text-[44px] md:text-[56px] leading-none">{n}</div>
      <div className="mt-1.5 text-[15px] text-ink-2">{l}</div>
    </div>
  );
}
