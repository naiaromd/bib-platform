"use client";
import { useState } from "react";
import { summary, track, flush, sessionId } from "@/lib/bodymap/events";

export type LeadContext = { concern?: string; concernLabel?: string; zone?: string; fit: string; plan?: string; head?: string };
const FIELDS: [string, string, boolean, string][] = [
  ["name", "ชื่อแพทย์", true, "text"], ["license", "เลขใบประกอบวิชาชีพ (ถ้าสะดวก)", false, "text"], ["clinic", "คลินิก", true, "text"],
  ["province", "จังหวัด", true, "text"], ["cases_per_month", "เคสหัตถการต่อเดือน (โดยประมาณ)", false, "text"],
  ["phone", "เบอร์โทร", true, "tel"], ["line_id", "ไอดี LINE", true, "text"],
];

/** ฟอร์มหลังกด "ขอเดโม" หรือ "คุยทาง LINE" · ส่งไม่สำเร็จ ข้อมูลที่กรอกไม่หาย */
export default function LeadForm({ context, viaLine }: { context: LeadContext; viaLine: boolean }) {
  const [v, setV] = useState<Record<string, string>>({});
  const [contact, setContact] = useState(false);
  const [line, setLine] = useState(viaLine);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [started, setStarted] = useState(false);
  const set = (k: string, x: string) => { if (!started) { setStarted(true); track("เริ่มกรอกฟอร์ม", { p: context.concern }); } setV((o) => ({ ...o, [k]: x })); };

  async function send() {
    setErr("");
    const miss = FIELDS.filter(([k, , req]) => req && !(v[k] ?? "").trim()).map(([, t]) => t);
    if (miss.length) return setErr("กรอกให้ครบ: " + miss.join(" · "));
    if ((v.phone ?? "").replace(/\D/g, "").length < 9) return setErr("เบอร์โทรต้องมีอย่างน้อย 9 หลัก");
    if (!contact) return setErr("ติ๊กยินยอมให้ทีมติดต่อกลับก่อนส่ง");
    if (viaLine && !line) return setErr("ติ๊กยินยอมให้ติดต่อทาง LINE ก่อนส่ง");
    setBusy(true);
    track(viaLine ? "กด LINE" : "ส่งฟอร์ม", { p: context.concern });
    try {
      const res = await fetch("/api/bodymap-lead", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead: { ...v, consent_contact: contact, consent_line: line }, website: v.website ?? "", via_line: viaLine, session: sessionId(), context, clicks: summary() }),
      });
      const j = (await res.json().catch(() => null)) as { ok?: boolean; ref?: string } | null;
      if (!res.ok || !j?.ok || !j.ref) throw new Error("fail");
      flush();
      window.location.assign(`/bodymap/thanks?ref=${encodeURIComponent(j.ref)}${viaLine ? "&line=1" : ""}`);
    } catch {
      setErr("ส่งไม่สำเร็จ ข้อมูลที่กรอกยังอยู่ครบ กดส่งอีกครั้งได้เลย");
      setBusy(false);
    }
  }

  return (
    <form className="grid gap-2" onSubmit={(e) => { e.preventDefault(); void send(); }} noValidate>
      <p className="m-0 text-sm text-ink-2">{viaLine ? "ทีมจะทักไปทาง LINE พร้อมแผนดูแลที่คุณเพิ่งดู" : "ทีมจะติดต่อกลับเพื่อนัดเดโมกับแผนดูแลที่คุณเพิ่งดู"}</p>
      {FIELDS.map(([k, label, req, type]) => (
        <label key={k} className="block min-w-0 text-sm text-ink-2">
          {label}{req ? " *" : ""}
          <input type={type} value={v[k] ?? ""} onChange={(e) => set(k, e.target.value)} required={req} autoComplete="on"
            className="mt-1 block w-full min-w-0 rounded-lg border border-line bg-card px-3 py-2 text-base text-ink outline-none focus:border-ink" />
        </label>
      ))}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" value={v.website ?? ""} onChange={(e) => setV((o) => ({ ...o, website: e.target.value }))} className="hidden" aria-hidden />
      <label className="flex items-start gap-2 text-sm text-ink">
        <input type="checkbox" checked={contact} onChange={(e) => setContact(e.target.checked)} className="mt-1 h-4 w-4 flex-none accent-ink" />
        <span>ยินยอมให้ BIB เก็บข้อมูลนี้และติดต่อกลับเรื่อง icoone Laser Med ตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล *</span>
      </label>
      <label className="flex items-start gap-2 text-sm text-ink">
        <input type="checkbox" checked={line} onChange={(e) => setLine(e.target.checked)} className="mt-1 h-4 w-4 flex-none accent-ink" />
        <span>ยินยอมให้ติดต่อทาง LINE{viaLine ? " *" : ""}</span>
      </label>
      {err ? <p role="alert" className="m-0 text-sm text-bad">{err}</p> : null}
      <button type="submit" disabled={busy} className="mt-1 rounded-full border border-ink bg-ink px-5 py-2.5 text-base text-paper disabled:opacity-50">
        {busy ? "กำลังส่ง…" : viaLine ? "คุยทาง LINE" : "ขอเดโม"}
      </button>
    </form>
  );
}
