"use client";
import { useState } from "react";
import { summary, track, flush, sessionId } from "@/lib/bodymap/events";

type Props = { context: { concern?: string; concernLabel?: string; zone?: string; fit: string; protocol?: string; head?: string } };
const FIELDS: [string, string, boolean, string][] = [
  ["name", "ชื่อแพทย์", true, "text"], ["license", "เลขใบประกอบวิชาชีพ (ถ้าสะดวก)", false, "text"], ["clinic", "คลินิก", true, "text"],
  ["province", "จังหวัด", true, "text"], ["cases_per_month", "เคสหัตถการต่อเดือน (โดยประมาณ)", false, "text"],
  ["phone", "เบอร์โทร", true, "tel"], ["line_id", "LINE ID", true, "text"],
];

/** ฟอร์มติดต่อ + ปุ่ม LINE · อยู่ปลายคอลัมน์ขวาเสมอ · ส่งไม่สำเร็จ ข้อมูลที่กรอกไม่หาย */
export default function LeadForm({ context }: Props) {
  const [v, setV] = useState<Record<string, string>>({});
  const [contact, setContact] = useState(false);
  const [line, setLine] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [started, setStarted] = useState(false);
  const set = (k: string, x: string) => { if (!started) { setStarted(true); track("เริ่มกรอกฟอร์ม", { p: context.concern }); } setV((o) => ({ ...o, [k]: x })); };

  async function send(viaLine: boolean) {
    setErr("");
    const miss = FIELDS.filter(([k, , req]) => req && !(v[k] ?? "").trim()).map(([, t]) => t);
    if (miss.length) return setErr("กรอกให้ครบ: " + miss.join(" · "));
    if ((v.phone ?? "").replace(/\D/g, "").length < 9) return setErr("เบอร์โทรต้องมีอย่างน้อย 9 หลัก");
    if (!contact) return setErr("ติ๊กยินยอมให้ทีมติดต่อกลับก่อนส่ง");
    if (viaLine && !line) return setErr("ติ๊กยินยอมให้ติดต่อทาง LINE ก่อนกดคุยต่อทาง LINE");
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
    <section className="border-t border-line pt-5" aria-label="ติดต่อทีม">
      <h3 className="mb-1 mt-0 text-xl font-semibold text-ink">ให้ทีมพาดูเครื่องจริงกับคนไข้ของคุณ</h3>
      <p className="mb-3 mt-0 text-sm text-ink-2">ทีมจะติดต่อกลับพร้อม Protocol ที่คุณเพิ่งดู</p>
      <form className="grid gap-2 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); void send(false); }} noValidate>
        {FIELDS.map(([k, label, req, type]) => (
          <label key={k} className="block min-w-0 text-sm text-ink-2">
            {label}{req ? " *" : ""}
            <input type={type} value={v[k] ?? ""} onChange={(e) => set(k, e.target.value)} required={req} autoComplete="on"
              className="mt-1 block w-full min-w-0 rounded-lg border border-line bg-card px-3 py-2 text-base text-ink outline-none focus:border-ink" />
          </label>
        ))}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={v.website ?? ""} onChange={(e) => setV((o) => ({ ...o, website: e.target.value }))} className="hidden" aria-hidden />
        <label className="flex items-start gap-2 text-sm text-ink sm:col-span-2">
          <input type="checkbox" checked={contact} onChange={(e) => setContact(e.target.checked)} className="mt-1 h-4 w-4 flex-none accent-ink" />
          <span>ยินยอมให้ BIB เก็บข้อมูลนี้และติดต่อกลับเรื่อง icoone Laser Med ตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล *</span>
        </label>
        <label className="flex items-start gap-2 text-sm text-ink sm:col-span-2">
          <input type="checkbox" checked={line} onChange={(e) => setLine(e.target.checked)} className="mt-1 h-4 w-4 flex-none accent-ink" />
          <span>ยินยอมให้ติดต่อทาง LINE</span>
        </label>
        {err ? <p role="alert" className="m-0 text-sm text-bad sm:col-span-2">{err}</p> : null}
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <button type="submit" disabled={busy} className="rounded-full border border-ink bg-ink px-5 py-2 text-sm text-paper disabled:opacity-50">{busy ? "กำลังส่ง…" : "ส่งให้ทีมติดต่อกลับ"}</button>
          <button type="button" disabled={busy} onClick={() => void send(true)} className="rounded-full border border-good px-5 py-2 text-sm text-good hover:bg-good hover:text-paper disabled:opacity-50">คุยต่อทาง LINE</button>
        </div>
      </form>
    </section>
  );
}
