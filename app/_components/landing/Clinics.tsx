import { FLAGS } from "@/lib/env";

const journey = [
  { n: "01", t: "Project brief", d: "บอกข้อมูลโครงการ เพื่อรับใบเสนอราคาและข้อมูลเพิ่มเติม" },
  { n: "02", t: "Proposal discussion", d: "คุยรายละเอียดข้อเสนอและความคาดหวัง" },
  { n: "03", t: "Treatment experience", d: "ลองทรีตเมนต์จริงกับทีม BIB" },
  {
    n: "04",
    t: "Order confirmation",
    d: "ยืนยันคำสั่งซื้อ · กรณีไม่มีสินค้าในสต็อก ใช้เวลาประมาณ 45 วัน",
  },
  { n: "05", t: "Delivery", d: "จัดส่งถึงคลินิกในประเทศไทย" },
  {
    n: "06",
    t: "Quality check & warranty",
    d: "ตรวจเครื่องและเริ่มการรับประกัน 12 เดือน",
  },
  { n: "07", t: "Train your team", d: "หลักสูตรอบรม 3 วัน · Base · Focus · Healthcare" },
];

export default function Clinics() {
  return (
    <section id="clinics" className="bg-[#EAE2D4]">
      <div className="lp-wrap py-[72px] md:py-[104px] grid grid-cols-1 lg:grid-cols-12 gap-x-6 gap-y-10 items-start">
        <div className="lg:col-span-5">
          <p className="font-mono text-[12px] tracking-[0.14em] uppercase text-ink-2">
            07 · For clinics
          </p>
          <h2 className="mt-3.5 font-display font-medium text-[40px] md:text-[52px] lg:text-[60px] leading-none">
            Precision Beauty.
            <br />
            Trusted Growth.
          </h2>
          {FLAGS.showFdaBadge && (
            <div className="mt-7 flex flex-wrap gap-2">
              {["CE 0476", "CE-MDR", "FDA 510(k) cleared · K211272"].map((b) => (
                <span
                  key={b}
                  className="font-mono px-3 py-1.5 border border-ink-2 rounded text-[13px]"
                >
                  {b}
                </span>
              ))}
            </div>
          )}
          <div className="mt-8 grid grid-cols-2 border-t border-chalk">
            <div className="pt-5 pr-5">
              <div className="font-display text-[36px] md:text-[44px] leading-none">3 วัน</div>
              <div className="mt-1.5 text-[15px] text-ink-2">
                หลักสูตรอบรมทีม Base · Focus · Healthcare
              </div>
            </div>
            <div className="pt-5 pl-5 border-l border-chalk">
              <div className="font-display text-[36px] md:text-[44px] leading-none">12 เดือน</div>
              <div className="mt-1.5 text-[15px] text-ink-2">รับประกันเครื่อง</div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-6 lg:col-start-7 grid grid-cols-1 md:grid-cols-2 gap-x-8 border-t border-ink">
          {journey.map((j) => (
            <div
              key={j.n}
              className="grid grid-cols-[34px_1fr] py-4 border-b border-chalk"
            >
              <span className="font-mono text-[13px] text-rose-ink font-semibold pt-0.5">
                {j.n}
              </span>
              <div>
                <div className="font-medium">{j.t}</div>
                <div className="text-[14px] leading-[1.55] text-ink-2 mt-0.5">{j.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
