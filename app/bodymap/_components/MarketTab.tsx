"use client";
// แท็บ "Market Insight" (ไนน์อนุมัติ 25 พ.ย. 2026)
// การ์ดของกลุ่มคนไข้ที่หมอเลือก · เนื้อหาเรียบเรียงจากข้อมูลจริงใน Airtable (ตาราง Patient Situations ช่อง MI …) · ช่องว่าง = ไม่แสดง ห้ามแต่งเพิ่ม
import type { PatientSituation } from "@/lib/bodymap/data";

const en = (label: string) => label.split(" · ")[0];

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-t border-line py-2.5 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-4">
      <span className="text-xs text-muted">{k}</span>
      <div className="min-w-0 text-sm leading-relaxed text-ink">{children}</div>
    </div>
  );
}

function Card({ g }: { g: PatientSituation }) {
  const m = g.mi;
  return (
    <article className="rounded-2xl border border-line bg-card p-4 md:p-5">
      <p className="m-0 font-display text-xl uppercase tracking-[0.08em] text-ink">{en(g.label)}</p>
      {m.summary ? <p className="m-0 mt-1.5 text-[15px] leading-relaxed text-ink-2">{m.summary}</p> : null}
      <div className="mt-3">
        {m.keywords.length ? (
          <Row k="คนไข้ค้นหาด้วยคำว่า">
            <span className="flex flex-wrap gap-1.5">
              {m.keywords.map((w) => <span key={w} className="rounded-full bg-paper px-2.5 py-0.5 text-[13px] text-ink-2">“{w}”</span>)}
            </span>
          </Row>
        ) : null}
        {m.reads ? <Row k="สิ่งที่คำค้นบอก">{m.reads}</Row> : null}
        {g.trigger ? <Row k="จุดเริ่มสนใจ">{g.trigger}</Row> : null}
        {g.avoid ? <Row k="สิ่งที่เขาไม่อยากเจอ">{g.avoid}</Row> : null}
        {m.key ? <Row k="กุญแจปิดการขาย"><b className="font-semibold">{m.key}</b></Row> : null}
        {m.services.length ? (
          <Row k="บริการที่เปิดได้">
            <ul className="m-0 list-none p-0">{m.services.map((s) => <li key={s}>{s}</li>)}</ul>
          </Row>
        ) : null}
        {m.crosssell ? <Row k="ต่อยอดได้">{m.crosssell}</Row> : null}
        {m.proof ? <Row k="หลักฐาน">{m.proof}</Row> : null}
      </div>
    </article>
  );
}

export default function MarketTab({ groups, picked, onToggle }: { groups: PatientSituation[]; picked: string[]; onToggle: (id: string) => void }) {
  const shown = groups.filter((g) => picked.includes(g.id));
  return (
    <div>
      <p className="m-0 text-[11px] uppercase tracking-[0.18em] text-rose-ink">Market Insight</p>
      <h3 className="m-0 mt-1 text-2xl font-semibold leading-snug text-ink">คนไข้กลุ่มที่คลินิกคุณมี</h3>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {groups.map((g) => {
          const on = picked.includes(g.id);
          return (
            <button key={g.id} type="button" onClick={() => onToggle(g.id)} aria-pressed={on} title={g.label}
              className={`rounded-full border px-3 py-1 text-[13px] tracking-wide transition-colors ${on ? "border-ink bg-ink text-paper" : "border-line bg-card text-ink-2 hover:border-ink"}`}>{en(g.label)}</button>
          );
        })}
      </div>
      <div className="mt-5 grid gap-3">
        {shown.length ? shown.map((g) => <Card key={g.id} g={g} />) : <p className="m-0 text-sm text-muted">เลือกกลุ่มคนไข้ด้านบน เพื่อดู Insight ของกลุ่มนั้น</p>}
      </div>
    </div>
  );
}
