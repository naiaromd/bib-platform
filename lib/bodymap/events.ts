// Body Map r05 · เก็บ event ฝั่ง browser · ไม่ระบุตัวตนจนกว่าจะส่งฟอร์ม
// ส่งเป็นชุดทุก 10 วินาที หรือเมื่อออกจากหน้า · ส่งเฉพาะเมื่อผู้ใช้กด "ยอมรับ" ที่แถบล่าง
export type EventType =
  | "เปิดหน้า" | "เลือก Fit" | "หมุนรูป" | "กดจุด" | "เปิดปัญหา" | "เปิด Program ย่อ" | "เปิด Program ละเอียด"
  | "เปิดหลักฐานย่อ" | "เปิดหลักฐานละเอียด" | "เปิด Insight" | "เลือกหัวเครื่อง" | "เริ่มกรอกฟอร์ม" | "ส่งฟอร์ม" | "กด LINE"
  | "คำนวณ ROI" | "ขอเอกสาร" | "ขอใบเสนอราคา";
export type BmEvent = {
  key: string; session: string; at: string; type: EventType; p?: string; z?: string; program?: string;
  evidence?: string; fit?: string; mode?: string; note?: string;
};

const CONSENT_KEY = "bm-consent";
const SESSION_KEY = "bm-session";
let queue: BmEvent[] = [];
const log: BmEvent[] = [];
let timer: ReturnType<typeof setInterval> | null = null;
let seq = 0;
let ctx: { fit?: string; mode?: string } = {};

const store = (k: string, v?: string) => {
  try {
    if (v === undefined) return window.localStorage.getItem(k);
    window.localStorage.setItem(k, v);
  } catch { /* storage ปิดอยู่ = ถือว่ายังไม่ตอบ */ }
  return null;
};
// ไนน์ตัดสิน 24 พ.ย.: ไม่ขึ้นแถบถาม · เก็บการใช้งานแบบไม่ระบุตัวตนเป็นค่าเริ่มต้น · ผูกกับตัวตนเมื่อหมอส่งฟอร์มและติ๊กยินยอมเท่านั้น
export const getConsent = (): "yes" | "no" | null => (typeof window === "undefined" ? null : store(CONSENT_KEY) === "no" ? "no" : "yes");
export function setConsent(v: "yes" | "no") { store(CONSENT_KEY, v); if (v === "no") queue = []; else start(); }
export function sessionId(): string {
  if (typeof window === "undefined") return "";
  let s = "";
  try { s = window.sessionStorage.getItem(SESSION_KEY) ?? ""; } catch { /* ignore */ }
  if (!s) {
    s = "BM-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 7).toUpperCase();
    try { window.sessionStorage.setItem(SESSION_KEY, s); } catch { /* ignore */ }
  }
  return s;
}
export function setContext(c: { fit?: string; mode?: string }) { ctx = { ...ctx, ...c }; }

export function track(type: EventType, d: Partial<Pick<BmEvent, "p" | "z" | "program" | "evidence" | "note">> = {}) {
  if (typeof window === "undefined") return;
  const session = sessionId();
  const e: BmEvent = { key: `${session}-${String(++seq).padStart(3, "0")}`, session, at: new Date().toISOString(), type, ...ctx, ...d };
  log.push(e);
  if (getConsent() === "yes") { queue.push(e); start(); }
}

export function flush(useBeacon = false) {
  if (!queue.length || getConsent() !== "yes") return;
  const body = JSON.stringify({ events: queue.splice(0, 50) });
  if (useBeacon && navigator.sendBeacon) { navigator.sendBeacon("/api/bodymap-event", new Blob([body], { type: "application/json" })); return; }
  fetch("/api/bodymap-event", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => undefined);
}
function start() {
  if (timer || typeof window === "undefined") return;
  timer = setInterval(() => flush(), 10000);
  window.addEventListener("pagehide", () => flush(true));
}

/** สรุปการกดของ session นี้ · แนบไปกับลีดเมื่อหมอส่งฟอร์ม */
export function summary() {
  const uniq = (xs: (string | undefined)[]) => Array.from(new Set(xs.filter(Boolean))) as string[];
  const of = (t: EventType) => log.filter((e) => e.type === t);
  return {
    session: sessionId(), events: log.length, fit: ctx.fit ?? "",
    zones: uniq(of("กดจุด").map((e) => e.z)), concerns: uniq(of("เปิดปัญหา").map((e) => e.p)),
    programs_short: uniq(of("เปิด Program ย่อ").map((e) => e.program)), programs_detail: uniq(of("เปิด Program ละเอียด").map((e) => e.program)),
    evidence_short: uniq(of("เปิดหลักฐานย่อ").map((e) => e.evidence)), evidence_detail: uniq(of("เปิดหลักฐานละเอียด").map((e) => e.evidence)),
    insights: uniq(of("เปิด Insight").map((e) => e.p)), handpiece: of("เลือกหัวเครื่อง").slice(-1)[0]?.note ?? "",
    roi: of("คำนวณ ROI").slice(-1)[0]?.note ?? "", docs_requested: uniq(of("ขอเอกสาร").map((e) => e.evidence)), quote_requested: of("ขอใบเสนอราคา").length > 0,
  };
}
