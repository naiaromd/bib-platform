"use client";
// โหมดบูธ "Design your Signature" (ไนน์ 25 พ.ย. 2026) · จอทัชสกรีน 16:9 ที่งานแสดงสินค้า
// 3 ขั้น: 1 เลือกประเภทธุรกิจ → 2 Body Map เลือกบริเวณ + ปัญหา → 3 Your Signature (กลุ่มคนไข้ + Insight · กลไกเครื่องปรับได้ · คืนทุน 3 แผน) → QR ไปมือถือ
// อิง research (Drive: BIB_SeeTheUnseen_BoothKiosk_Research_v1.0): หน้ารอต้องบอกว่าแตะได้ · ปุ่มอยู่ครึ่งล่าง · animation 200–400 ms ease-out
// · ไม่เก็บข้อมูลบนจอ · ไม่มีใครแตะ 45 วินาที ถาม "ยังดูอยู่ไหม" 20 วินาที แล้วกลับหน้ารอ (WCAG 2.2.1)
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import type { BodyMapData, Concern, PatientSituation } from "@/lib/bodymap/data";
import { BUSINESS_TYPES, type BusinessType } from "@/lib/bodymap/business";
import { CONSUMABLE, FACE_ZONES, PAY_PLANS, PRICE_NOTE, SAMPLE_PRICE } from "@/lib/bodymap/pricing";
import { setContext, track } from "@/lib/bodymap/events";
import { DEFAULT_FIT, resolveAnswer } from "@/lib/bodymap/solution";
import { HANDPIECES, HANDPIECE_ORDER, type HandpieceKey } from "@/lib/handpieces";
import BodyFigure, { type View } from "../_components/BodyFigure";
import MechanismAnim from "../_components/MechanismAnim";
import { planSub, planTitle } from "../_components/words";

type Stage = "attract" | "business" | "focus" | "signature";
const IDLE_MS = 45_000;
const ASK_S = 20;
const COURSE = 5;
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

/** กลุ่มคนไข้ที่ตรงทั้งประเภทธุรกิจและปัญหา · หลักก่อนรอง · ไม่เกิน 3 · ไม่ตรงเลย = ใช้กลุ่มของปัญหา (โอกาสใหม่) */
function matchSegments(c: Concern, bt: BusinessType, all: PatientSituation[]) {
  const order = [...c.psPrimary, ...c.psSecondary];
  const hit = order.filter((id) => bt.ps.includes(id));
  const ids = (hit.length ? hit : order).slice(0, 3);
  return { list: ids.map((id) => all.find((g) => g.id === id)).filter(Boolean) as PatientSituation[], isNew: !hit.length };
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="m-0 font-display text-[0.95rem] uppercase tracking-[0.3em] text-[#C89B8A]">{children}</p>;
}

export default function BoothApp({ data: initial }: { data: BodyMapData }) {
  const [data, setData] = useState<BodyMapData>(initial);
  useEffect(() => {
    let alive = true;
    fetch("/api/bodymap-data", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null))
      .then((j: { data?: BodyMapData } | null) => { if (alive && j?.data && j.data.mode === initial.mode) setData(j.data); }).catch(() => undefined);
    return () => { alive = false; };
  }, [initial.mode]);

  const [stage, setStage] = useState<Stage>("attract");
  const [bt, setBt] = useState<BusinessType | null>(null);
  const [view, setView] = useState<View>("front");
  const [zoneId, setZoneId] = useState<string | null>(null);
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
    setStage("attract"); setBt(null); setZoneId(null); setConcernId(null); setView("front");
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

  const start = () => { setStage("business"); track("บูธ", { note: "เริ่ม" }); };
  const pickBt = (b: BusinessType) => { setBt(b); setStage("focus"); track("บูธ", { note: `ธุรกิจ ${b.th}` }); };
  const pickZone = (z: string) => { setZoneId(z); setConcernId(null); track("กดจุด", { z }); };
  const pickConcern = (c: Concern) => {
    setConcernId(c.id); track("เปิดปัญหา", { p: c.id, z: zoneId ?? undefined });
    const n = bumpCount(); setSerial(n); setCount(n);
    setStage("signature"); track("บูธ", { p: c.id, note: `Signature No.${n} · ${bt?.th ?? ""}` });
  };

  // QR → หน้าเดิมบนมือถือ เปิดปัญหาที่เลือกไว้ (เก็บลีดบนมือถือ ไม่เก็บบนจอ)
  useEffect(() => {
    if (stage !== "signature" || !concern) return;
    const url = `${window.location.origin}/bodymap?p=${concern.id}&bt=${bt?.id ?? ""}&src=booth`;
    QRCode.toDataURL(url, { margin: 1, width: 360, color: { dark: "#2C2A28", light: "#FAF7F1" } }).then(setQr).catch(() => setQr(""));
  }, [stage, concern, bt]);

  const dateTh = new Date().toLocaleDateString("en-GB").replace(/\//g, ".");

  return (
    <main className="booth relative h-screen w-screen select-none overflow-hidden bg-[#2C2A28] text-[#FAF7F1]" style={{ touchAction: "manipulation" }}>
      <style>{`html{font-size:clamp(12px,0.9vw,24px)}
.bfade{animation:bfade .4s cubic-bezier(.2,.8,.2,1) both}@keyframes bfade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.bsig{stroke-dasharray:1400;stroke-dashoffset:1400;animation:bsig 2s cubic-bezier(.6,0,.2,1) forwards,bsigfade .8s ease 2.1s forwards}@keyframes bsig{to{stroke-dashoffset:0}}@keyframes bsigfade{to{opacity:.12}}
.bpulse{animation:bpulse 2.4s ease-in-out infinite}@keyframes bpulse{0%,100%{opacity:.45}50%{opacity:1}}
`}</style>

      {/* ---------------- หน้ารอ ---------------- */}
      {stage === "attract" ? (
        <button type="button" onClick={start} className="flex h-full w-full flex-col items-center justify-center gap-6 text-center">
          <div className="flex items-center gap-4 opacity-90">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/brand/bib-logo.png" alt="BIB" className="h-12 w-auto invert" />
            <span aria-hidden className="h-8 w-px bg-[#6b655d]" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/brand/icoone-laser-med-logo.png" alt="icoone Laser Med" className="h-8 w-auto invert" />
          </div>
          <h1 className="m-0 font-display text-[5.5rem] font-medium leading-none tracking-wide">Design your Signature</h1>
          <p className="m-0 text-[1.6rem] text-[#E4DCCD]">ออกแบบทรีตเมนต์ซิกเนเจอร์ของคลินิกคุณ</p>
          <svg viewBox="0 0 600 60" className="w-[34rem]" aria-hidden><path d="M10 40 C 90 0, 140 0, 170 30 S 250 60, 290 25 S 370 0, 400 32 S 500 55, 590 18" fill="none" stroke="#C9A96E" strokeWidth="2" strokeLinecap="round" className="bsig" style={{ animation: "bsig 2.4s cubic-bezier(.6,0,.2,1) infinite alternate" }} /></svg>
          <span className="bpulse mt-4 rounded-full border border-[#C9A96E] px-10 py-4 text-[1.4rem] text-[#FAF7F1]">แตะเพื่อเริ่ม · 3 ขั้นตอน</span>
          {count ? <span className="absolute bottom-8 left-10 text-[1rem] text-[#B9AE9E]">วันนี้ออกแบบ Signature บนจอนี้แล้ว {count} แบบ</span> : null}
          <span className="absolute bottom-8 right-10 text-[0.85rem] text-[#8A7F70]">Advertise to Healthcare Professional and Health Official</span>
        </button>
      ) : null}

      {/* ---------------- ขั้น 1 ธุรกิจ ---------------- */}
      {stage === "business" ? (
        <section className="bfade flex h-full flex-col px-[6%] pb-[5%] pt-[5%]">
          <Eyebrow>01 · Your Business</Eyebrow>
          <h2 className="m-0 mt-2 text-[2.8rem] font-semibold">ธุรกิจของคุณคือ</h2>
          <div className="mt-auto grid grid-cols-5 gap-5">
            {BUSINESS_TYPES.map((b, i) => (
              <button key={b.id} type="button" onClick={() => pickBt(b)} style={{ animationDelay: `${i * 60}ms` }}
                className="bfade flex aspect-[3/4] flex-col justify-between rounded-2xl border border-[#6b655d] p-6 text-left transition-colors hover:border-[#C9A96E] active:bg-[#3a3733]">
                <span className="font-display text-[2.6rem] leading-none text-[#C9A96E]">0{i + 1}</span>
                <span className="text-[1.6rem] font-semibold leading-snug">{b.th}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {/* ---------------- ขั้น 2 Body Map ---------------- */}
      {stage === "focus" ? (
        <section className="bfade grid h-full grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-[4%] px-[6%] pb-[5%] pt-[5%]">
          <div className="flex min-h-0 flex-col">
            <Eyebrow>02 · Your Focus</Eyebrow>
            <h2 className="m-0 mt-2 text-[2.8rem] font-semibold">ดูแลตรงไหน</h2>
            <p className="m-0 mt-1 text-[1.2rem] text-[#B9AE9E]">{bt?.th} · แตะบริเวณบนร่างกาย</p>
            <div className="mt-4 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-2xl bg-[#F4EFE5] p-4 text-[#2C2A28] [&>div]:!static [&_.relative]:!max-w-[16vh] [&_.relative>button]:!h-11 [&_.relative>button]:!w-11 [&_.relative>button]:!text-base">
              <BodyFigure sex="f" view={view} zones={data.zones} points={data.figurePoints} counts={counts} active={zoneId} onView={setView} onPick={pickZone} />
            </div>
          </div>
          <div className="flex min-h-0 flex-col justify-end">
            {zone ? (
              <>
                <p className="m-0 font-display text-[1.1rem] uppercase tracking-[0.25em] text-[#C89B8A]">{zone.th}</p>
                <p className="m-0 mt-1 text-[1.6rem] font-semibold">เลือกปัญหาที่คนไข้ของคุณพบบ่อย</p>
                <div className="mt-5 grid max-h-[62vh] grid-cols-2 gap-3 overflow-y-auto pr-1">
                  {inZone.map((c, i) => (
                    <button key={c.id} type="button" onClick={() => pickConcern(c)} style={{ animationDelay: `${i * 40}ms` }}
                      className="bfade min-h-[5.5rem] rounded-xl border border-[#6b655d] px-5 py-4 text-left text-[1.35rem] leading-snug transition-colors hover:border-[#C9A96E] active:bg-[#3a3733]">{c.label}</button>
                  ))}
                </div>
              </>
            ) : (
              <p className="m-0 text-[1.6rem] text-[#B9AE9E]">แตะจุดบนร่างกายทางซ้าย เพื่อดูปัญหาของบริเวณนั้น</p>
            )}
            <button type="button" onClick={() => setStage("business")} className="mt-6 self-start text-[1.1rem] text-[#B9AE9E]">← เปลี่ยนประเภทธุรกิจ</button>
          </div>
        </section>
      ) : null}

      {/* ---------------- ขั้น 3 Your Signature ---------------- */}
      {stage === "signature" && concern && bt ? (
        <section className="relative grid h-full grid-rows-[auto_minmax(0,1fr)_auto] gap-[2.5%] px-[4.5%] pb-[2.5%] pt-[3%]">
          <svg viewBox="0 0 1600 900" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
            <path d="M260 560 C 380 300, 470 290, 520 430 S 620 620, 700 420 S 820 270, 880 470 S 1000 610, 1080 400 C 1130 290, 1230 300, 1300 380" fill="none" stroke="#C9A96E" strokeWidth="3" strokeLinecap="round" className="bsig" />
          </svg>

          <header className="bfade flex items-end justify-between border-b border-[#C9A96E] pb-4" style={{ animationDelay: "2000ms" }}>
            <div className="min-w-0">
              <Eyebrow>Your Signature · {bt.th}</Eyebrow>
              <h2 className="m-0 mt-1 text-[2.6rem] font-semibold leading-tight">{main ? planTitle(main) : concern.label}</h2>
              <p className="m-0 text-[1.2rem] text-[#B9AE9E]">
                {concern.label}{main && planSub(main) ? <span className="font-display text-[1.35rem]"> · {planSub(main)}</span> : null}
                {main?.totalMinutes ? ` · ${main.totalMinutes} นาทีต่อครั้ง` : ""} · คอร์ส {COURSE} ครั้ง
              </p>
            </div>
            <p className="m-0 font-display text-[1.2rem] tracking-[0.2em] text-[#B9AE9E]">No. {String(serial).padStart(3, "0")} · {dateTh}</p>
          </header>

          <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)] gap-[3%]">
            {/* 01 Clients */}
            <div className="bfade min-h-0 overflow-hidden" style={{ animationDelay: "2300ms" }}>
              <Eyebrow>01 · Your Clients</Eyebrow>
              {segs?.isNew ? <p className="m-0 mt-2 text-[1rem] text-[#C9A96E]">กลุ่มคนไข้ใหม่ที่คลินิกคุณยังไม่ได้ดูแล</p> : null}
              <div className="mt-3 grid gap-4">
                {segs?.list.map((g) => (
                  <div key={g.id} className="border-t border-[#4A4641] pt-3">
                    <p className="m-0 font-display text-[1.6rem] uppercase tracking-[0.08em]">{en(g.label)}</p>
                    {g.mi.summary ? <p className="m-0 mt-1 text-[1.05rem] leading-relaxed text-[#E4DCCD]">{g.mi.summary}</p> : null}
                    {g.mi.keywords.length ? <p className="m-0 mt-1 text-[0.95rem] text-[#B9AE9E]">ค้นหาด้วย {g.mi.keywords.slice(0, 3).map((k) => `“${k}”`).join(" · ")}</p> : null}
                    {g.mi.key ? <p className="m-0 mt-1 text-[1rem] text-[#C9A96E]">กุญแจ · {g.mi.key}</p> : null}
                  </div>
                ))}
              </div>
            </div>

            {/* 02 Machine */}
            <div className="bfade flex min-h-0 flex-col border-x border-[#4A4641] px-[6%]" style={{ animationDelay: "2700ms" }}>
              <Eyebrow>02 · Your Machine</Eyebrow>
              <div className="mt-3 rounded-xl bg-[#F4EFE5] p-2 text-[#2C2A28]">
                <MechanismAnim suc={suc} led={HANDPIECES[hp].hasLight && led} las={HANDPIECES[hp].hasLight && las} headName={HANDPIECES[hp].name} />
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {HANDPIECE_ORDER.map((k) => (
                  <button key={k} type="button" aria-pressed={hp === k} onClick={() => { setHp(k); track("เลือกหัวเครื่อง", { p: concern.id, note: `บูธ ${HANDPIECES[k].name}` }); }}
                    className={`rounded-lg border px-2 py-3 text-[1rem] transition-colors ${hp === k ? "border-[#FAF7F1] bg-[#FAF7F1] text-[#2C2A28]" : "border-[#6b655d] text-[#E4DCCD]"}`}>{HANDPIECES[k].name}</button>
                ))}
              </div>
              <label className="mt-4 block text-[1.05rem]">
                <span className="flex justify-between"><span>แรงดูด</span><span className="text-[#B9AE9E]">{suc < 34 ? "เบา" : suc < 67 ? "กลาง" : "แรง"}</span></span>
                <input type="range" min={0} max={100} value={suc} onChange={(e) => setSuc(+e.target.value)} aria-label="แรงดูด" className="mt-2 h-8 w-full accent-[#C9A96E]" />
              </label>
              {HANDPIECES[hp].hasLight ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {([["LED 650 nm", led, setLed], ["Laser 915 nm", las, setLas]] as [string, boolean, (v: boolean) => void][]).map(([t, v, set]) => (
                    <button key={t} type="button" aria-pressed={v} onClick={() => set(!v)}
                      className={`rounded-lg border px-3 py-3 text-[1rem] ${v ? "border-[#C9A96E] text-[#FAF7F1]" : "border-[#6b655d] text-[#8A7F70]"}`}>{t} · {v ? "เปิด" : "ปิด"}</button>
                  ))}
                </div>
              ) : <p className="m-0 mt-3 text-[0.95rem] text-[#B9AE9E]">Laser และ LED อยู่ที่หัว RoboSolo</p>}
            </div>

            {/* 03 Return */}
            <div className="bfade min-h-0" style={{ animationDelay: "3100ms" }}>
              <Eyebrow>03 · Your Return</Eyebrow>
              <p className="m-0 mt-3 text-[1rem] text-[#B9AE9E]">Consumable Cost</p>
              <p className="m-0 font-display text-[3.2rem] leading-none">{costPct}%</p>
              <p className="m-0 text-[0.95rem] text-[#B9AE9E]">ค่าวัสดุสิ้นเปลืองเพียง ฿{supply} ต่อครั้ง</p>
              <p className="m-0 mt-5 text-[1rem] text-[#E4DCCD]">คนไข้ใหม่ต่อเดือน ที่ครอบคลุมค่างวด</p>
              <div className="mt-2 grid gap-2">
                {PAY_PLANS.map((x) => (
                  <div key={x.id} className="flex items-baseline justify-between border-b border-[#4A4641] pb-2">
                    <span><span className="block font-display text-[1.05rem] tracking-[0.15em] text-[#C9A96E]">{x.tag}</span><span className="text-[0.9rem] text-[#B9AE9E]">{x.sub} · ฿{baht(x.perMonth)}/เดือน</span></span>
                    <span><span className="font-display text-[3rem] leading-none">{Math.ceil(x.perMonth / perPatient)}</span> <span className="text-[1rem]">คน</span></span>
                  </div>
                ))}
              </div>
              <p className="m-0 mt-2 text-[0.8rem] leading-relaxed text-[#8A7F70]">คนไข้ 1 คน = คอร์ส {COURSE} ครั้ง × ฿{baht(price)} หักค่าวัสดุแล้ว · ประมาณการ ไม่ใช่การรับประกันรายได้ · {PRICE_NOTE}</p>
            </div>
          </div>

          <footer className="bfade flex items-center justify-between" style={{ animationDelay: "3500ms" }}>
            <div className="flex items-center gap-6">
              <button type="button" onClick={() => { track("บูธ", { note: "เริ่มใหม่" }); reset(); }} className="rounded-full border border-[#6b655d] px-6 py-3 text-[1.1rem] text-[#E4DCCD]">↺ เริ่มใหม่</button>
              <span className="text-[0.85rem] text-[#8A7F70]">Advertise to Healthcare Professional and Health Official</span>
            </div>
            <div className="flex items-center gap-5">
              <p className="m-0 text-right text-[1.3rem] leading-snug">สแกนเพื่อรับ Signature ของคุณ<br /><span className="text-[1rem] text-[#B9AE9E]">ขอเดโม · ขอใบเสนอราคา · คุยทาง LINE</span></p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {qr ? <img src={qr} alt="QR code ไปหน้าบนมือถือ" className="h-[8.5rem] w-[8.5rem] rounded-md" /> : <span className="h-[8.5rem] w-[8.5rem] rounded-md bg-[#3a3733]" />}
            </div>
          </footer>
        </section>
      ) : null}

      {/* ---------------- ยังดูอยู่ไหม ---------------- */}
      {ask !== null && stage !== "attract" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-[#2C2A28]/85">
          <div className="bfade text-center">
            <p className="m-0 text-[2.4rem] font-semibold">ยังดูอยู่ไหม</p>
            <p className="m-0 mt-2 text-[1.3rem] text-[#B9AE9E]">แตะที่ใดก็ได้เพื่อดูต่อ · กลับหน้าแรกใน {ask} วินาที</p>
          </div>
        </div>
      ) : null}
    </main>
  );
}
