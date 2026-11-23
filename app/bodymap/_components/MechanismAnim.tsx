"use client";
// ภาพจำลองกลไกหัว Roboderm ใต้ผิว แบบเคลื่อนไหว (ของ Body Map เอง · ไม่แก้ไฟล์ใน explorer)
// แสดง 5 ชั้น: หนังกำพร้า · หนังแท้ · ไขมันใต้ผิว · พังผืด · กล้ามเนื้อ
// ปรับได้: แรงดูด (ผิวถูกยกสูงขึ้น) · LED / Laser (เฉพาะ RoboSolo) · เล่น/หยุด
// เป็นภาพจำลองเพื่ออธิบายหลักการ ไม่ตามสัดส่วนจริง · ไม่ได้ระบุความลึกของแสงเป็นตัวเลข
import { useEffect, useState } from "react";

const W = 640, H = 380, SURFACE = 150;
// [ชื่อชั้น, ระยะจากผิวถึงขอบล่างของชั้น, สีพื้น, สัดส่วนที่ชั้นนี้ถูกยกตามผิว]
const LAYERS: [string, number, string, number][] = [
  ["หนังกำพร้า", 14, "#EED9D0", 1],
  ["หนังแท้", 58, "#E3BFB0", 0.85],
  ["ไขมันใต้ผิว", 138, "#F3E3B8", 0.55],
  ["พังผืด", 150, "#D9D2C2", 0.25],
  ["กล้ามเนื้อ", 230, "#C98F84", 0.1],
];
const N = 48;

export default function MechanismAnim({ suc, led, las, headName }: { suc: number; led: boolean; las: boolean; headName: string }) {
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
  const rot = (headX / R) * (180 / Math.PI); // ลูกกลิ้งหมุนตามระยะที่หัวเคลื่อน
  const surfC = yAt(headX, 0, 1);
  const light = led || las;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-paper">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="ภาพจำลองหัวเครื่องยกผิวด้วยแรงดูดและลูกกลิ้ง เห็นชั้นผิว 5 ชั้น" className="block h-auto w-full">
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
        {/* หัวเครื่อง: เปลือก + ช่องดูดกลาง + ลูกกลิ้ง 2 ตัว */}
        <g>
          <path d={`M${headX - 92},${SURFACE - 26} q0,-74 92,-74 q92,0 92,74 l0,6 l-184,0 Z`} fill="#FFFFFF" stroke="#8A7F70" strokeWidth={1.4} />
          <rect x={headX - 22} y={SURFACE - 62} width={44} height={50} rx={8} fill="#F4EFE5" stroke="#B9A999" />
          {[0, 1, 2].map((i) => {
            const y = SURFACE - 22 - ((t * 40 + i * 14) % 40);
            return <path key={i} d={`M${headX - 6},${y} l6,-7 l6,7`} fill="none" stroke="#C89B8A" strokeWidth={2} opacity={0.35 + suc / 160} />;
          })}
          {[-GAP, GAP].map((dx) => (
            <g key={dx} transform={`rotate(${rot} ${headX + dx} ${SURFACE - R + 4})`}>
              <circle cx={headX + dx} cy={SURFACE - R + 4} r={R} fill="#E4DCCD" stroke="#4A4641" strokeWidth={1.4} />
              {Array.from({ length: 8 }, (_, i) => {
                const a = (i / 8) * Math.PI * 2;
                return <circle key={i} cx={headX + dx + Math.cos(a) * 13} cy={SURFACE - R + 4 + Math.sin(a) * 13} r={2.2} fill="#4A4641" />;
              })}
            </g>
          ))}
          <text x={headX} y={SURFACE - 76} textAnchor="middle" fontSize={13} fill="#4A4641">{headName}</text>
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
