import Image from "next/image";
import { DEVICE_PHOTO } from "@/lib/assets";

const studies = [
  {
    y: "2008",
    who: "Palmieri et al. · University of Modena, Italy",
    topic:
      "เซลลูไลท์และเนื้อเยื่อใต้ผิว · การฟื้นตัวหลังผ่าตัด แผลเป็นและการหดรั้ง",
  },
  {
    y: "2011",
    who: "Maullu G., Palmieri B. · Minerva Medica",
    topic:
      "Stroma and its cosmetic-functional reactivation: Multi Micro Alveolar Stimulation",
  },
  {
    y: "2016",
    who: "Smirnov et al. · Russia",
    topic: "ภาวะหลอดเลือดดำเรื้อรัง (CVI): อาการบวม ปวด หนักขา",
  },
  {
    y: "2018",
    who: "Yutskovskaya et al. · Russia",
    topic:
      "icoone Laser ในผู้หญิง 10 ราย: เซลลูไลท์ ไขมัน อาการบวม รอบเอวและสะโพก",
  },
  {
    y: "2019",
    who: "Palmieri et al.",
    topic: "ภาวะขาบวมน้ำ: เส้นรอบวงขาและความยืดหยุ่นของผิว",
  },
  {
    y: "2022",
    who: "Proskurina et al.",
    topic: "หลังผ่าตัดคลอด: การหายของแผลและอาการบวม",
  },
  {
    y: "2022",
    who: "Healthy Planet Medical Centre · Russia",
    topic: "รอยแตกลายหลังคลอด",
  },
];

export default function Evidence() {
  return (
    <section id="evidence">
      <div className="lp-wrap py-[72px] md:py-[112px] grid grid-cols-1 lg:grid-cols-12 gap-x-6 gap-y-10">
        <div className="lg:col-span-4">
          <p className="font-mono text-[12px] tracking-[0.14em] uppercase text-ink-2">
            05 · Evidence
          </p>
          <h2 className="mt-3.5 font-display font-medium text-[40px] md:text-[52px] lg:text-[60px] leading-none">
            Journal &amp; research.
          </h2>
          <p className="mt-4 text-[16px] text-ink-2">
            งานวิจัยและเคสจากศูนย์การแพทย์ที่ใช้ icoone® เรียงตามปี
          </p>
          <Image
            src={DEVICE_PHOTO}
            alt="เครื่อง icoone Laser Med"
            width={340}
            height={340}
            className="mt-9 w-full max-w-[340px] aspect-square object-contain mix-blend-multiply"
          />
        </div>
        <div className="lg:col-span-7 lg:col-start-6 border-t border-ink">
          {studies.map((e) => (
            <div
              key={e.y + e.who}
              className="grid grid-cols-[72px_1fr] md:grid-cols-[96px_1fr] gap-5 py-5 border-b border-chalk"
            >
              <span className="font-display text-[26px] md:text-[30px] leading-none font-semibold">
                {e.y}
              </span>
              <div>
                <div className="text-[15.5px] md:text-[16.5px] font-medium leading-[1.5]">
                  {e.topic}
                </div>
                <div className="mt-1 font-mono text-[12.5px] md:text-[13px] text-ink-2">
                  {e.who}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
