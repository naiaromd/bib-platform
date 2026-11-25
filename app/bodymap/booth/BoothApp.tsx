"use client";
// โหมดบูธ "Design your Signature" (ไนน์ 25 พ.ย. 2026) · จอ signage ทัชสกรีน "แนวตั้ง" 9:16 (1080×1920) ที่งานแสดงสินค้า
// 3 ขั้น: 1 เลือกประเภทธุรกิจ → 2 Body Map เลือกบริเวณ + ปัญหา → 3 Your Signature (กลุ่มคนไข้ + Insight · กลไกเครื่องปรับได้ · คืนทุน 3 แผน) → QR ไปมือถือ
// อิง research (Drive: BIB_SeeTheUnseen_BoothKiosk_Research_v1.0): หน้ารอต้องบอกว่าแตะได้ · ปุ่มอยู่ช่วงกลางถึงล่างของจอ (ระยะเอื้อมคนยืน)
// · animation 200–400 ms ease-out · ไม่เก็บข้อมูลบนจอ · ไม่มีใครแตะ 45 วินาที ถาม "ยังดูอยู่ไหม" 20 วินาที แล้วกลับหน้ารอ (WCAG 2.2.1)
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import type { BodyMapData, Concern, PatientSituation } from "@/lib/bodymap/data";
import { BUSINESS_TYPES, type BusinessType } from "@/lib/bodymap/business";
import { CONSUMABLE, FACE_ZONES, PAY_PLANS, PRICE_NOTE, SAMPLE_PRICE } from "@/lib/bodymap/pricing";
import { setContext, track } from "@/lib/bodymap/events";
import { DEFAULT_FIT, resolveAnswer } from "@/lib/bodymap/solution";
import { HANDPIECES, HANDPIECE_ORDER, type HandpieceKey } from "@/lib/handpieces";
import { FIGURES } from "@/lib/assets";
import BodyFigure, { type View } from "../_components/BodyFigure";
import MechanismAnim from "../_components/MechanismAnim";
import { planSub, planTitle } from "../_components/words";

type Stage = "attract" | "business" | "focus" | "signature";
const IDLE_MS = 45_000;
const ASK_S = 20;
const COURSE = 5;
const SHOW = 8; // ปัญหาที่แสดงก่อนกด "ดูเพิ่ม"
const GOLD = "#C9A96E";
const en = (label: string) => label.split(" · ")[0];
const baht = (n: number) => Math.round(n).toLocaleString("th-TH");
const today = () => new Date().toISOString().slice(0, 10);

/** จำนวน Signature ที่ออกแบบบนจอนี้วันนี้ (นับจริงในเครื่อง ไม่ใช่ตัวเลขสมมติ) */
function bumpCount(): number {
  try {
    const k = `bm-booth-count-${today()}`;
    const n = Number(localStorage.getItem(k) ?? "0") + 1;
    localStorage.setItem(k, String(n));
    return n;
  } catch { return 0; }
}
function readCount(): number {
  try { return Number(localStorage.getItem(`bm-booth-count-${today()}`) ?? "0"); } catch { return 0; }
}

/** ตัวเลขนับขึ้น · เริ่มหลัง delay ms */
function useCountUp(target: number, delay: number, dec = 0, run = true) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) { setV(0); return; }
    let raf = 0;
    const t0 = performance.now() + delay;
    const step = (t: number) => {
      const k = Math.min(1, Math.max(0, (t - t0) / 1100));
      setV(target * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, delay, run]);
  return dec ? v.toFixed(dec) : String(Math.round(v));
}

/** กลุ่มคนไข้ที่ตรงทั้งประเภทธุรกิจและปัญหา · หลักก่อนรอง · ไม่เกิน 3 · ไม่ตรงเลย = ใช้กลุ่มของปัญหา (โอกาสใหม่) */
function matchSegments(c: Concern, bt: BusinessType, all: PatientSituation[]) {
  const order = [...c.psPrimary, ...c.psSecondary];
  const hit = order.filter((id) => bt.ps.includes(id));
  const ids = (hit.length ? hit : order).slice(0, 3);
  return { list: ids.map((id) => all.find((g) => g.id === id)).filter(Boolean) as PatientSituation[], isNew: !hit.length };
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="m-0 font-display text-[1.15rem] uppercase tracking-[0.32em] text-[#C89B8A]">{children}</p>;
}
function Logos({ small }: { small?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/brand/bib-logo-white.png" alt="BIB · Beauty Innovation & Beyond" className={small ? "h-[3rem] w-auto" : "h-[6rem] w-auto"} />
      <span aria-hidden className={`${small ? "h-[2rem]" : "h-[4rem]"} w-px bg-[#6b655d]`} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/brand/icoone-logo-gold.png" alt="icoone" className={small ? "h-[1.7rem] w-auto" : "h-[3.2rem] w-auto"} />
    </div>
  );
}
function Steps({ n }: { n: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-2" aria-label={`ขั้นที่ ${n} จาก 3`}>
      {[1, 2, 3].map((i) => <span key={i} className={`h-[3px] w-10 rounded-full ${i <= n ? "bg-[#C9A96E]" : "bg-[#4A4641]"}`} />)}
    </div>
  );
}

export default function BoothApp({ data: initial }: { data: BodyMapData }) {
  const [data, setData] = useState<BodyMapData>(initial);
  useEffect(() => {
    let alive = true;
    fetch("/api/bodymap-data", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null))
      .then((j: { data?: BodyMapData } | null) => { if (alive && j?.data && j.data.mode === initial.mode) setData(j.data); }).catch(() => undefined);
    return () => { alive = false; };
  }, [initial.mode]);
  // ให้จอทำงานต่อได้แม้เน็ตหลุด หลังเปิดครั้งแรกแล้ว (เก็บหน้าและรูปไว้ในเครื่อง)
  useEffect(() => { if ("serviceWorker" in navigator) navigator.serviceWorker.register("/booth-sw.js", { scope: "/bodymap/booth" }).catch(() => undefined); }, []);

  const [stage, setStage] = useState<Stage>("attract");
  const [bt, setBt] = useState<BusinessType | null>(null);
  const [view, setView] = useState<View>("front");
  const [zoneId, setZoneId] = useState<string | null>(null);
  const [more, setMore] = useState(false);
  const [concernId, setConcernId] = useState<string | null>(null);
  const [hp, setHp] = useState<HandpieceKey>("RS");
  const [suc, setSuc] = useState(50);
  const [led, setLed] = useState(true);
  const [las, setLas] = useState(true);
  const [serial, setSerial] = useState(0);
  const [count, setCount] = useState(0);
  const [ask, setAsk] = useState<number | null>(null);
  const [qr, setQr] = useState("");

  useEffect(() => { setCount(readCount()); setContext({ fit: "บูธ", mode: data.mode === "internal" ? "ภายใน" : "นำเสนอ" }); }, [data.mode]);

  const reset = useCallback(() => {
    setStage("attract"); setBt(null); setZoneId(null); setConcernId(null); setView("front"); setMore(false);
    setHp("RS"); setSuc(50); setLed(true); setLas(true); setAsk(null); setQr(""); setCount(readCount());
  }, []);

  // ---- idle: 45 วินาทีไม่มีใครแตะ → ถาม 20 วินาที → กลับหน้ารอ
  const last = useRef(Date.now());
  useEffect(() => {
    const poke = () => { last.current = Date.now(); setAsk(null); };
    window.addEventListener("pointerdown", poke);
    const t = window.setInterval(() => {
      if (stage === "attract") return;
      const idle = Date.now() - last.current;
      if (idle >= IDLE_MS + ASK_S * 1000) { track("บูธ", { note: "หมดเวลา กลับหน้ารอ" }); reset(); }
      else if (idle >= IDLE_MS) setAsk(Math.ceil((IDLE_MS + ASK_S * 1000 - idle) / 1000));
    }, 500);
    return () => { window.removeEventListener("pointerdown", poke); window.clearInterval(t); };
  }, [stage, reset]);

  const counts = useMemo(() => {
    const out: Record<string, number> = {};
    for (const c of data.concerns) for (const z of c.zones) out[z] = (out[z] ?? 0) + 1;
    return out;
  }, [data.concerns]);
  const zone = data.zones.find((z) => z.id === zoneId) ?? null;
  const inZone = zone ? data.concerns.filter((c) => c.zones.includes(zone.id)) : [];
  const concern = data.concerns.find((c) => c.id === concernId) ?? null;
  const ans = useMemo(() => (concern ? resolveAnswer(concern, { ...DEFAULT_FIT, course: COURSE }, data) : null), [concern, data]);
  const main = ans?.primary ?? null;
  const segs = concern && bt ? matchSegments(concern, bt, data.patientSituations) : null;

  const face = concern ? concern.zones.every((z) => FACE_ZONES.includes(z)) : false;
  const price = face ? SAMPLE_PRICE.face : SAMPLE_PRICE.body;
  const supply = face ? CONSUMABLE.face : CONSUMABLE.bodyM;
  const perPatient = (price - supply) * COURSE;
  const costPct = Math.round((supply / price) * 1000) / 10;
  const sig = stage === "signature";
  const costShown = useCountUp(costPct, 3000, 1, sig);
  const p0 = useCountUp(Math.ceil(PAY_PLANS[0].perMonth / perPatient), 3200, 0, sig);
  const p1 = useCountUp(Math.ceil(PAY_PLANS[1].perMonth / perPatient), 3350, 0, sig);
  const p2 = useCountUp(Math.ceil(PAY_PLANS[2].perMonth / perPatient), 3500, 0, sig);
  const planNums = [p0, p1, p2];

  const start = () => { setStage("business"); track("บูธ", { note: "เริ่ม" }); };
  const pickBt = (b: BusinessType) => { setBt(b); setStage("focus"); track("บูธ", { note: `ธุรกิจ ${b.th}` }); };
  const pickZone = (z: string) => { setZoneId(z); setConcernId(null); setMore(false); track("กดจุด", { z }); };
  const pickConcern = (c: Concern) => {
    setConcernId(c.id); track("เปิดปัญหา", { p: c.id, z: zoneId ?? undefined });
    const n = bumpCount(); setSerial(n); setCount(n);
    setStage("signature"); track("บูธ", { p: c.id, note: `Signature No.${n} · ${bt?.th ?? ""}` });
  };

  // QR → หน้าเดิมบนมือถือ เปิดปัญหาที่เลือกไว้ (เก็บลีดบนมือถือ ไม่เก็บบนจอ) · สร้างในเครื่อง ไม่ต้องใช้เน็ต
  useEffect(() => {
    if (stage !== "signature" || !concern) return;
    const url = `${window.location.origin}/bodymap?p=${concern.id}&bt=${bt?.id ?? ""}&src=booth`;
    QRCode.toDataURL(url, { margin: 1, width: 420, color: { dark: "#2C2A28", light: "#FAF7F1" } }).then(setQr).catch(() => setQr(""));
  }, [stage, concern, bt]);

  const dateTh = new Date().toLocaleDateString("en-GB").replace(/\//g, ".");
  const shownProblems = more ? inZone : inZone.slice(0, SHOW);

  return (
    <main className="booth relative h-screen w-screen select-none overflow-hidden bg-[#2C2A28] text-[#FAF7F1]" style={{ touchAction: "manipulation" }}>
      <style>{`html{font-size:min(1.6vw,0.9vh)}
.bfade{animation:bfade .4s cubic-bezier(.2,.8,.2,1) both}@keyframes bfade{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.bsig{stroke-dasharray:1600;stroke-dashoffset:1600;animation:bsig 2s cubic-bezier(.6,0,.2,1) forwards,bsigfade .8s ease 2.1s forwards}@keyframes bsig{to{stroke-dashoffset:0}}@keyframes bsigfade{to{opacity:.1}}
.bloop{stroke-dasharray:900;stroke-dashoffset:900;animation:bloop 5s cubic-bezier(.6,0,.2,1) infinite}@keyframes bloop{0%{stroke-dashoffset:900;opacity:1}55%{stroke-dashoffset:0;opacity:1}85%{opacity:0}100%{stroke-dashoffset:0;opacity:0}}
.bpulse{animation:bpulse 2.4s ease-in-out infinite}@keyframes bpulse{0%,100%{opacity:.55}50%{opacity:1}}
.bdot{animation:bdot 2.4s ease-in-out infinite}@keyframes bdot{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.6);opacity:1}}
`}</style>

      {/* ---------------- หน้ารอ ---------------- */}
      {stage === "attract" ? (
        <button type="button" onClick={start} className="flex h-full w-full flex-col items-center px-[8%] pb-[6%] pt-[9%] text-center">
          <Logos />
          <div className="mt-[9%] flex flex-col items-center gap-5">
            <p className="m-0 font-display text-[1.3rem] uppercase tracking-[0.45em] text-[#C89B8A]">Precision Beauty</p>
            <h1 className="m-0 font-display text-[6.6rem] font-medium leading-[0.95] tracking-wide">Design<br />your Signature</h1>
            <svg viewBox="0 0 600 70" className="w-[30rem]" aria-hidden>
              <path d="M10 45 C 90 0, 140 0, 170 32 S 250 66, 290 28 S 370 0, 400 35 S 500 62, 590 18" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" className="bloop" />
            </svg>
            <p className="m-0 text-[1.9rem] leading-snug text-[#E4DCCD]">ออกแบบทรีตเมนต์ซิกเนเจอร์<br />ของคลินิกคุณ ใน 3 ขั้นตอน</p>
          </div>
          <div className="relative mx-auto my-[4%] min-h-0 flex-1" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={FIGURES.f.front} alt="" className="h-full w-auto opacity-25" draggable={false} />
            {Object.values((data.figurePoints["female_front"] ?? {}) as Record<string, number[][]>).flat().map(([x, y], i) => (
              <span key={i} className="bdot absolute -ml-1.5 -mt-1.5 h-3 w-3 rounded-full bg-[#C9A96E]" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${(i % 7) * 0.35}s` }} />
            ))}
          </div>
          <span className="bpulse flex items-center gap-4 rounded-full border border-[#C9A96E] px-14 py-6 text-[1.8rem]">
            <span className="bdot inline-block h-3 w-3 rounded-full bg-[#C9A96E]" />แตะเพื่อเริ่ม
          </span>
          <div className="mt-[6%] flex w-full items-end justify-between text-[0.95rem] text-[#8A7F70]">
            <span>{count ? `วันนี้ออกแบบ Signature บนจอนี้แล้ว ${count} แบบ` : ""}</span>
            <span>Advertise to Healthcare Professional and Health Official</span>
          </div>
        </button>
      ) : null}

      {/* ---------------- ขั้น 1 ธุรกิจ ---------------- */}
      {stage === "business" ? (
        <section className="bfade flex h-full flex-col px-[8%] pb-[7%] pt-[7%]">
          <Logos small />
          <div className="mt-[14%]"><Steps n={1} /></div>
          <div className="mt-5"><Eyebrow>01 · Your Business</Eyebrow></div>
          <h2 className="m-0 mt-2 text-[3.6rem] font-semibold leading-tight">ธุรกิจของคุณคือ</h2>
          <div className="mt-auto grid gap-4">
            {BUSINESS_TYPES.map((b, i) => (
              <button key={b.id} type="button" onClick={() => pickBt(b)} style={{ animationDelay: `${i * 60}ms` }}
                className="bfade flex items-center gap-8 rounded-2xl border border-[#5a554e] px-8 py-7 text-left transition-colors active:border-[#C9A96E] active:bg-[#3a3733]">
                <span className="w-16 font-display text-[3rem] leading-none text-[#C9A96E]">0{i + 1}</span>
                <span className="text-[2.1rem] font-semibold leading-snug">{b.th}</span>
                <span className="ml-auto text-[2rem] text-[#8A7F70]">→</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {/* ---------------- ขั้น 2 Body Map ---------------- */}
      {stage === "focus" ? (
        <section className="bfade flex h-full flex-col px-[7%] pb-[5%] pt-[6%]">
          <div className="flex items-center justify-between"><Steps n={2} /><button type="button" onClick={() => setStage("business")} className="text-[1.2rem] text-[#B9AE9E]">← {bt?.th}</button></div>
          <div className="mt-5"><Eyebrow>02 · Your Focus</Eyebrow></div>
          <h2 className="m-0 mt-2 text-[3.2rem] font-semibold leading-tight">ดูแลตรงไหน</h2>
          <div className="mt-5 flex h-[44%] flex-none items-center justify-center overflow-hidden rounded-3xl bg-[#F4EFE5] p-5 text-[#2C2A28] [&>div]:!static [&_.relative]:!max-w-[21vh] [&_.relative>button]:!h-12 [&_.relative>button]:!w-12 [&_.relative>button]:!text-lg [&>div>button]:!px-6 [&>div>button]:!py-3 [&>div>button]:!text-lg">
            <BodyFigure sex="f" view={view} zones={data.zones} points={data.figurePoints} counts={counts} active={zoneId} onView={setView} onPick={pickZone} />
          </div>
          <div className="mt-6 min-h-0 flex-1">
            {zone ? (
              <>
                <p className="m-0 text-[1.8rem] font-semibold">{zone.th} · <span className="font-normal text-[#B9AE9E]">ปัญหาที่คนไข้ของคุณพบบ่อย</span></p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {shownProblems.map((c, i) => (
                    <button key={c.id} type="button" onClick={() => pickConcern(c)} style={{ animationDelay: `${i * 35}ms` }}
                      className="bfade min-h-[5.6rem] rounded-xl border border-[#5a554e] px-6 py-4 text-left text-[1.5rem] leading-snug transition-colors active:border-[#C9A96E] active:bg-[#3a3733]">{c.label}</button>
                  ))}
                </div>
                {inZone.length > SHOW && !more ? (
                  <button type="button" onClick={() => setMore(true)} className="mt-4 text-[1.3rem] text-[#C9A96E]">ดูอีก {inZone.length - SHOW} ปัญหา ↓</button>
                ) : null}
              </>
            ) : (
              <p className="m-0 flex h-full items-start text-[1.8rem] text-[#B9AE9E]">แตะจุดบนร่างกาย เพื่อดูปัญหาของบริเวณนั้น</p>
            )}
          </div>
        </section>
      ) : null}

      {/* ---------------- ขั้น 3 Your Signature ---------------- */}
      {sig && concern && bt ? (
        <section className="relative flex h-full flex-col px-[6%] pb-[4%] pt-[5%]">
          <svg viewBox="0 0 900 1600" className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden>
            <path d="M120 820 C 220 560, 300 540, 340 700 S 430 900, 500 690 S 600 520, 650 740 S 740 900, 800 640" fill="none" stroke={GOLD} strokeWidth="3" strokeLinecap="round" className="bsig" />
          </svg>

          <header className="bfade border-b border-[#C9A96E] pb-5" style={{ animationDelay: "2000ms" }}>
            <div className="flex items-center justify-between"><Eyebrow>Your Signature · {bt.th}</Eyebrow><span className="font-display text-[1.2rem] tracking-[0.2em] text-[#B9AE9E]">No. {String(serial).padStart(3, "0")} · {dateTh}</span></div>
            <h2 className="m-0 mt-2 text-[3.4rem] font-semibold leading-tight">{main ? planTitle(main) : concern.label}</h2>
            <p className="m-0 mt-1 text-[1.35rem] text-[#B9AE9E]">
              {concern.label}{main && planSub(main) ? <span className="font-display text-[1.55rem]"> · {planSub(main)}</span> : null}
              {main?.totalMinutes ? ` · ${main.totalMinutes} นาทีต่อครั้ง` : ""} · คอร์ส {COURSE} ครั้ง
            </p>
          </header>

          {/* 01 Clients */}
          <div className="bfade mt-6" style={{ animationDelay: "2300ms" }}>
            <div className="flex items-baseline justify-between"><Eyebrow>01 · Your Clients</Eyebrow>{segs?.isNew ? <span className="text-[1.1rem] text-[#C9A96E]">กลุ่มคนไข้ใหม่ที่คลินิกคุณยังไม่ได้ดูแล</span> : null}</div>
            <div className="mt-3 grid gap-4" style={{ gridTemplateColumns: `repeat(${segs?.list.length ?? 1}, minmax(0,1fr))` }}>
              {segs?.list.map((g) => (
                <div key={g.id} className="min-w-0 rounded-2xl border border-[#4A4641] p-4">
                  <p className="m-0 font-display text-[1.6rem] uppercase leading-tight tracking-[0.06em]">{en(g.label)}</p>
                  {g.mi.summary ? <p className="m-0 mt-2 line-clamp-3 text-[1.1rem] leading-relaxed text-[#E4DCCD]">{g.mi.summary}</p> : null}
                  {g.mi.keywords.length ? <p className="m-0 mt-2 text-[1rem] leading-snug text-[#B9AE9E]">{g.mi.keywords.slice(0, 2).map((k) => `“${k}”`).join(" ")}</p> : null}
                  {g.mi.key ? <p className="m-0 mt-2 text-[1.05rem] leading-snug text-[#C9A96E]">{g.mi.key}</p> : null}
                </div>
              ))}
            </div>
          </div>

          {/* 02 Machine */}
          <div className="bfade mt-6" style={{ animationDelay: "2700ms" }}>
            <Eyebrow>02 · Your Machine</Eyebrow>
            <div className="mt-3 grid grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-5">
              <div className="rounded-2xl border border-[#C9A96E]/40 bg-[#F4EFE5] p-2 text-[#2C2A28]">
                <MechanismAnim suc={suc} led={HANDPIECES[hp].hasLight && led} las={HANDPIECES[hp].hasLight && las} headName={HANDPIECES[hp].name} />
              </div>
              <div className="flex min-w-0 flex-col gap-3">
                <div className="grid grid-cols-2 gap-2">
                  {HANDPIECE_ORDER.map((k) => (
                    <button key={k} type="button" aria-pressed={hp === k} onClick={() => { setHp(k); track("เลือกหัวเครื่อง", { p: concern.id, note: `บูธ ${HANDPIECES[k].name}` }); }}
                      className={`rounded-xl border px-2 py-4 text-[1.1rem] transition-colors ${hp === k ? "border-[#FAF7F1] bg-[#FAF7F1] text-[#2C2A28]" : "border-[#5a554e] text-[#E4DCCD]"}`}>{HANDPIECES[k].name}</button>
                  ))}
                </div>
                <label className="block text-[1.15rem]">
                  <span className="flex justify-between"><span>แรงดูด</span><span className="text-[#B9AE9E]">{suc < 34 ? "เบา" : suc < 67 ? "กลาง" : "แรง"}</span></span>
                  <input type="range" min={0} max={100} value={suc} onChange={(e) => setSuc(+e.target.value)} aria-label="แรงดูด" className="mt-2 h-10 w-full accent-[#C9A96E]" />
                </label>
                {HANDPIECES[hp].hasLight ? (
                  <div className="grid grid-cols-2 gap-2">
                    {([["LED 650", led, setLed], ["Laser 915", las, setLas]] as [string, boolean, (v: boolean) => void][]).map(([t, v, set]) => (
                      <button key={t} type="button" aria-pressed={v} onClick={() => set(!v)}
                        className={`rounded-xl border px-2 py-4 text-[1.1rem] ${v ? "border-[#C9A96E] text-[#FAF7F1]" : "border-[#5a554e] text-[#8A7F70]"}`}>{t} nm<br /><span className="text-[0.95rem]">{v ? "เปิด" : "ปิด"}</span></button>
                    ))}
                  </div>
                ) : <p className="m-0 text-[1rem] text-[#B9AE9E]">Laser และ LED อยู่ที่หัว RoboSolo</p>}
              </div>
            </div>
          </div>

          {/* 03 Return */}
          <div className="bfade mt-6" style={{ animationDelay: "3000ms" }}>
            <Eyebrow>03 · Your Return</Eyebrow>
            <div className="mt-3 grid grid-cols-[minmax(0,0.85fr)_repeat(3,minmax(0,1fr))] gap-3">
              <div className="rounded-2xl bg-[#3a3733] p-4">
                <p className="m-0 text-[1rem] text-[#B9AE9E]">Consumable Cost</p>
                <p className="m-0 mt-1 font-display text-[3.6rem] leading-none">{costShown}%</p>
                <p className="m-0 mt-1 text-[0.95rem] leading-snug text-[#B9AE9E]">ค่าวัสดุสิ้นเปลืองเพียง ฿{supply} ต่อครั้ง</p>
              </div>
              {PAY_PLANS.map((x, i) => (
                <div key={x.id} className={`flex flex-col rounded-2xl border p-4 ${i === 0 ? "border-[#C9A96E]" : "border-[#4A4641]"}`}>
                  <p className="m-0 font-display text-[1.05rem] tracking-[0.14em] text-[#C9A96E]">{x.tag}</p>
                  <p className="m-0 text-[0.9rem] text-[#B9AE9E]">{x.sub}</p>
                  <p className="m-0 mt-auto pt-2"><span className="font-display text-[3.6rem] leading-none">{planNums[i]}</span> <span className="text-[1.05rem]">คน/เดือน</span></p>
                  <p className="m-0 text-[0.85rem] text-[#8A7F70]">฿{baht(x.perMonth)}/เดือน</p>
                </div>
              ))}
            </div>
            <p className="m-0 mt-2 text-[0.85rem] leading-relaxed text-[#8A7F70]">คนไข้ใหม่ต่อเดือนที่ครอบคลุมค่างวด · คนไข้ 1 คน = คอร์ส {COURSE} ครั้ง × ฿{baht(price)} หักค่าวัสดุแล้ว · ประมาณการ ไม่ใช่การรับประกันรายได้ · {PRICE_NOTE}</p>
          </div>

          <footer className="bfade mt-auto flex items-center justify-between gap-6 pt-5" style={{ animationDelay: "3600ms" }}>
            <div className="flex flex-col gap-3">
              <button type="button" onClick={() => { track("บูธ", { note: "เริ่มใหม่" }); reset(); }} className="self-start rounded-full border border-[#5a554e] px-8 py-4 text-[1.3rem] text-[#E4DCCD]">↺ ออกแบบใหม่</button>
              <span className="text-[0.85rem] text-[#8A7F70]">Advertise to Healthcare Professional and Health Official</span>
            </div>
            <div className="flex items-center gap-5">
              <p className="m-0 text-right text-[1.6rem] leading-snug">รับ Signature ของคุณ<br /><span className="text-[1.15rem] text-[#B9AE9E]">ขอเดโม · ใบเสนอราคา · LINE</span></p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {qr ? <img src={qr} alt="QR code ไปหน้าบนมือถือ" className="h-[11rem] w-[11rem] rounded-lg" /> : <span className="h-[11rem] w-[11rem] rounded-lg bg-[#3a3733]" />}
            </div>
          </footer>
        </section>
      ) : null}

      {/* ---------------- ยังดูอยู่ไหม ---------------- */}
      {ask !== null && stage !== "attract" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-[#2C2A28]/90">
          <div className="bfade text-center">
            <p className="m-0 text-[3rem] font-semibold">ยังดูอยู่ไหม</p>
            <p className="m-0 mt-3 text-[1.6rem] text-[#B9AE9E]">แตะที่ใดก็ได้เพื่อดูต่อ<br />กลับหน้าแรกใน {ask} วินาที</p>
          </div>
        </div>
      ) : null}
    </main>
  );
}
