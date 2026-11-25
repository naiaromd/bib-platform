"use client";
// ภาพจำลองกลไกหัว Roboderm ใต้ผิว แบบเคลื่อนไหว (ของ Body Map เอง · ไม่แก้ไฟล์ใน explorer)
// แสดง 5 ชั้น: หนังกำพร้า · หนังแท้ · ไขมันใต้ผิว · พังผืด · กล้ามเนื้อ
// ปรับได้: แรงดูด (ผิวถูกยกสูงขึ้น) · LED / Laser (เฉพาะ RoboSolo) · เล่น/หยุด
// เป็นภาพจำลองเพื่ออธิบายหลักการ ไม่ตามสัดส่วนจริง · ไม่ได้ระบุความลึกของแสงเป็นตัวเลข
import { useEffect, useState } from "react";
import { HEAD_SVG } from "@/lib/bodymap/handpieceArt";

const W = 640, H = 440, SURFACE = 210;
// [ชื่อชั้น, ระยะจากผิวถึงขอบล่างของชั้น, สีพื้น, สัดส่วนที่ชั้นนี้ถูกยกตามผิว]
const LAYERS: [string, number, string, number][] = [
  ["หนังกำพร้า", 14, "#EED9D0", 1],
  ["หนังแท้", 58, "#E3BFB0", 0.85],
  ["ไขมันใต้ผิว", 138, "#F3E3B8", 0.55],
  ["พังผืด", 150, "#D9D2C2", 0.25],
  ["กล้ามเนื้อ", 230, "#C98F84", 0.1],
];
const N = 48;

// ภาพหัวเครื่องจริงแบบ vector (ไนน์ 25 พ.ย. · BIB/4_Media/handpiece_svg_r01 · เอาเงาพื้นออก) วางให้ลูกกลิ้งแนบผิว
// [จุดกึ่งกลางลูกกลิ้ง x, ขอบล่างลูกกลิ้ง y] ในกรอบภาพ 400×400 · RoboMicro หมุน -55° ให้หน้าลูกกลิ้งคว่ำลงผิว
const HEAD_ART: Record<string, { cx: number; bottom: number; rot: number; size?: number }> = {
  RS: { cx: 242, bottom: 327, rot: 0 },
  RT: { cx: 200, bottom: 317, rot: 0 },
  RM: { cx: 200, bottom: 307, rot: 0 },
  RC: { cx: 185, bottom: 383, rot: -55, size: 0.8 },
};
const ART = 230; // ขนาดภาพหัวเครื่องในภาพจำลอง (หน่วยเดียวกับ viewBox)

export default function MechanismAnim({ suc, led, las, headName, headKey = "RS" }: { suc: number; led: boolean; las: boolean; headName: string; headKey?: string }) {
  const [t, setT] = useState(0);
  const [play, setPlay] = useState(true);
  // เครื่องที่ตั้ง "ลดการเคลื่อนไหว" ไว้: เริ่มแบบหยุดนิ่ง แล้วให้กดเล่นเอง
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) setPlay(false);
  }, []);
  useEffect(() => {
    if (!play) return;
    const id = window.setInterval(() => setT((x) => x + 0.04), 40);
    return () => window.clearInterval(id);
  }, [play]);

  const headX = W / 2 + Math.sin(t * 0.9) * 150; // หัวเคลื่อนไปกลับบนผิว
  const pulse = 0.82 + 0.18 * Math.sin(t * 6); // จังหวะดูด–คลาย
  const lift = (10 + (suc / 100) * 34) * pulse; // แรงดูดมาก = โดมผิวสูง
  const R = 20, GAP = 46; // ลูกกลิ้ง 2 ตัว ห่างจากกึ่งกลางหัว
  const bump = (x: number) => Math.exp(-(((x - headX) / 34) ** 2));
  const dent = (x: number) => Math.exp(-(((x - (headX - GAP)) / 20) ** 2)) + Math.exp(-(((x - (headX + GAP)) / 20) ** 2));
  const yAt = (x: number, depth: number, k: number) => SURFACE + depth - lift * k * bump(x) + 5 * k * dent(x);
  const line = (depth: number, k: number) => Array.from({ length: N + 1 }, (_, i) => { const x = (i / N) * W; return `${x.toFixed(1)},${yAt(x, depth, k).toFixed(1)}`; });
  const band = (top: number, kTop: number, bottom: number, kBottom: number) => `M${line(top, kTop).join(" L")} L${line(bottom, kBottom).reverse().join(" L")} Z`;
  const surfC = yAt(headX, 0, 1);
  const light = led || las;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-paper">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`ภาพจำลองหัว ${headName} ยกผิวด้วยแรงดูดและลูกกลิ้ง เห็นชั้นผิว 5 ชั้น`} className="block h-auto w-full">
        <rect width={W} height={H} fill="#FAF7F1" />
        {LAYERS.map(([name, bottom, fill, k], i) => {
          const top = i === 0 ? 0 : LAYERS[i - 1][1];
          const kTop = i === 0 ? 1 : LAYERS[i - 1][3];
          return <path key={name} d={band(top, kTop, bottom, k)} fill={fill} stroke="#B9A999" strokeWidth={0.6} />;
        })}
        {/* ก้อนไขมันและผนังกั้นในชั้นไขมันใต้ผิว */}
        {Array.from({ length: 15 }, (_, i) => {
          const x = 22 + i * 43;
          const y1 = yAt(x, 62, 0.8), y2 = yAt(x, 134, 0.55);
          return (
            <g key={i}>
              <line x1={x - 21} y1={y1} x2={x - 21} y2={y2} stroke="#CDB98A" strokeWidth={1.2} />
              <ellipse cx={x} cy={(y1 + y2) / 2} rx={17} ry={(y2 - y1) / 2 - 3} fill="#F8EDCB" stroke="#DCC98F" strokeWidth={0.8} />
            </g>
          );
        })}
        {/* ใยในชั้นหนังแท้ */}
        {Array.from({ length: 26 }, (_, i) => {
          const x = 10 + i * 25;
          return <path key={i} d={`M${x},${yAt(x, 24, 0.95)} q8,8 16,0`} fill="none" stroke="#C99F8E" strokeWidth={0.9} />;
        })}
        {/* ใยกล้ามเนื้อ */}
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={0} x2={W} y1={SURFACE + 164 + i * 12} y2={SURFACE + 164 + i * 12} stroke="#B67A70" strokeWidth={0.8} />)}
        {/* แสงจากหัว (เฉพาะเมื่อเปิด) */}
        {light ? (
          <g>
            {led ? <path d={`M${headX - 14},${surfC} L${headX - 46},${SURFACE + 120} L${headX + 18},${SURFACE + 120} L${headX + 2},${surfC} Z`} fill="#E06C5E" opacity={0.28 + 0.1 * pulse} /> : null}
            {las ? <path d={`M${headX - 2},${surfC} L${headX - 18},${SURFACE + 150} L${headX + 46},${SURFACE + 150} L${headX + 14},${surfC} Z`} fill="#C08A5A" opacity={0.3 + 0.1 * pulse} /> : null}
          </g>
        ) : null}
        {/* หัวเครื่อง: ภาพจริง (ฝังในหน้า) ลูกกลิ้งกดแนบผิว · โยกเบาๆ ตามจังหวะกลิ้ง */}
        {(() => {
          const a = HEAD_ART[headKey] ?? HEAD_ART.RS;
          const k = (ART * (a.size ?? 1)) / 400;
          const x = headX - a.cx * k, y = SURFACE + 3 - a.bottom * k;
          const rock = Math.sin(t * 6) * 1.2;
          const art = HEAD_SVG[headKey] ?? HEAD_SVG.RS;
          return (
            <g transform={`rotate(${rock} ${headX} ${SURFACE})`}>
              <g transform={`translate(${x} ${y}) scale(${k}) rotate(${a.rot} 200 200)`}>
                <svg x={0} y={0} width={400} height={400} viewBox="0 0 400 400" overflow="visible" dangerouslySetInnerHTML={{ __html: art }} />
              </g>
            </g>
          );
        })()}
        {/* แสงที่ลูกกลิ้ง (เมื่อเปิด LED / Laser) · เรืองตามจังหวะ */}
        {led || las ? (
          <g style={{ mixBlendMode: "multiply" }}>
            {led ? <ellipse cx={headX - 10} cy={SURFACE + 6} rx={46} ry={9} fill="#E06C5E" opacity={0.25 + 0.2 * pulse} /> : null}
            {las ? <ellipse cx={headX + 10} cy={SURFACE + 8} rx={36} ry={7} fill="#C08A5A" opacity={0.3 + 0.2 * pulse} /> : null}
          </g>
        ) : null}
        {/* แรงดูด: ลูกศรยกผิวขึ้น ยิ่งดูดแรงยิ่งเข้มและถี่ */}
        {[0, 1, 2].map((i) => {
          const span = 34, y0 = SURFACE + 34;
          const yy = y0 - ((t * (30 + suc * 0.5) + i * (span / 3)) % span);
          return <path key={i} d={`M${headX - 9},${yy} l9,-9 l9,9`} fill="none" stroke="#8A5A4A" strokeWidth={2.4} strokeLinecap="round" opacity={(0.15 + suc / 140) * (1 - (y0 - yy) / span)} />;
        })}
        <g>
          <rect x={headX - 44} y={SURFACE + 46} width={88} height={20} rx={10} fill="#FFFFFF" opacity={0.85} />
          <text x={headX} y={SURFACE + 60} textAnchor="middle" fontSize={11.5} fill="#4A4641">แรงดูด {suc < 34 ? "เบา" : suc < 67 ? "กลาง" : "แรง"}{led || las ? ` · ${[led ? "LED" : "", las ? "Laser" : ""].filter(Boolean).join("+")}` : ""}</text>
        </g>
        {/* ป้ายชื่อชั้นผิว */}
        {LAYERS.map(([name, bottom], i) => {
          const top = i === 0 ? 0 : LAYERS[i - 1][1];
          return (
            <g key={name}>
              <rect x={6} y={SURFACE + (top + bottom) / 2 - 9 + (i === 0 ? 2 : 0) + (i === 3 ? 0 : 0)} width={name.length * 8.4 + 12} height={18} rx={9} fill="#FFFFFF" opacity={0.86} />
              <text x={12} y={SURFACE + (top + bottom) / 2 + 4 + (i === 0 ? 2 : 0)} fontSize={12} fill="#2C2A28">{name}</text>
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-3 py-2">
        <p className="m-0 text-xs text-muted">ภาพจำลองหลักการ ไม่ตามสัดส่วนจริง</p>
        <button type="button" aria-pressed={!play} onClick={() => setPlay(!play)} className="rounded-full border border-line bg-card px-3 py-1 text-sm text-ink-2 hover:border-ink">
          {play ? "หยุดภาพ" : "เล่นภาพ"}
        </button>
      </div>
    </div>
  );
}
