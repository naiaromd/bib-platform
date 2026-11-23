// Body Map r05 · ฟังก์ชันเดียวที่ตอบว่า "ปัญหานี้ + Fit นี้ → ใช้อะไร"
// ลำดับ: Protocol BIB (ชื่อหน้าลูกค้า = เมนู) และ/หรือ Protocol ผู้ผลิต → ไม่มีทั้งคู่ = โปรแกรมตรง
// กติกา: ไม่เดานาที ไม่เดาหัวเครื่อง · ว่าง = null (หน้าแสดง "—")
import type { BodyMapData, Concern, Template } from "./data";

export type Sex = "f" | "m";
export type Goal = "Toning" | "Reshaping" | "Anti-Ageing" | "Drainage" | "Healthcare";
export type Course = 5 | 10;
export type Fit = { sex: Sex | null; goal: Goal | null; course: Course | null };

export type Layer = "bib" | "template" | "program";
export type SolutionStep = {
  programId: string | null;
  /** ขั้นที่ต้นทางให้เลือกโปรแกรม (ไม่ระบุตัวเดียว) */
  options: string[];
  minutes: number | null;
  /** ช่วงครั้ง เช่น "1–5" · มีเฉพาะ Protocol ผู้ผลิต */
  sessions?: string;
  /** null = ต้นทางยังไม่ระบุ → หน้าแสดง "เลือกตามบริเวณ" */
  handpiece: string | null;
};
export type Solution = {
  layer: Layer;
  id: string;
  /** ชื่อ Protocol ที่หมอเห็น */
  protocol?: string;
  /** ชื่อหน้าลูกค้า (เมนู) ของ Protocol BIB */
  menu?: string;
  steps: SolutionStep[];
  /** นาทีต่อครั้ง · Protocol ผู้ผลิตที่นาทีต่างกันตามช่วงครั้ง ดู minutesByRange */
  totalMinutes: number | null;
  minutesByRange?: { range: string; minutes: number | null }[];
  course?: Course;
  sessionsText?: string;
  frequency?: string;
  target?: string;
  family?: string;
  assessment?: string;
  status: string;
};
export type Resolved = { solutions: Solution[]; hidden: { id: string; reason: string }[] };

const num = (s: string | null | undefined) => (s && /^\d+$/.test(s) ? Number(s) : null);

function fromTemplate(t: Template, course: Course): Solution {
  const ranges = Array.from(new Set(t.steps.map((s) => s.range)));
  const byRange = ranges.map((r) => ({
    range: r,
    minutes: r.startsWith("1") ? num(t.minutes1to5) : num(t.minutes6to10),
  }));
  const same = byRange.every((b) => b.minutes === byRange[0]?.minutes);
  return {
    layer: "template",
    id: t.id,
    protocol: t.name,
    steps: t.steps.map((s) => ({
      programId: s.programId, options: [], minutes: s.minutes, sessions: s.range, handpiece: s.handpiece,
    })),
    totalMinutes: same ? byRange[0]?.minutes ?? null : null,
    minutesByRange: byRange,
    course,
    sessionsText: t.sessions,
    frequency: t.frequency,
    target: t.target,
    family: t.family,
    assessment: t.assessment,
    status: t.status,
  };
}

/** คืนทุก Solution ที่เข้ากับ Fit · ไม่เลือก Fit = แสดงทั้งหมด */
export function resolveSolutions(concern: Concern, fit: Fit, data: BodyMapData): Resolved {
  const solutions: Solution[] = [];
  const hidden: Resolved["hidden"] = [];

  for (const id of concern.bibProtocols) {
    const b = data.bibProtocols.find((x) => x.id === id);
    if (!b) continue;
    solutions.push({
      layer: "bib",
      id: b.id,
      protocol: b.name,
      menu: b.consumerLabel,
      steps: b.steps.map((s) => ({ programId: s.programId, options: s.options, minutes: null, handpiece: null })),
      totalMinutes: b.totalMinutes,
      status: b.status,
    });
  }

  const courses: Course[] = fit.course ? [fit.course] : [5, 10];
  for (const c of courses) {
    const tid = c === 5 ? concern.template5 : concern.template10;
    const t = tid ? data.templates.find((x) => x.id === tid) : undefined;
    if (!t) continue;
    if (fit.sex === "m" && t.target.trim() === "Women") {
      hidden.push({ id: t.id, reason: "ผู้ผลิตระบุ Protocol นี้สำหรับคนไข้หญิง" });
      continue;
    }
    solutions.push(fromTemplate(t, c));
  }

  if (solutions.length === 0 && concern.bibProtocols.length === 0 && !concern.template5 && !concern.template10) {
    const steps = concern.programs
      .map((l) => data.programs.find((p) => p.id === l.programId))
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .map((p) => ({ programId: p.id, options: [], minutes: p.defaultMinutes, handpiece: null }));
    if (steps.length) {
      solutions.push({ layer: "program", id: "PRG:" + concern.id, steps, totalMinutes: null, status: "draft" });
    }
  }
  return { solutions, hidden };
}

/** รูปแบบตามใบงาน: คืน Solution แรกตามลำดับชั้น (หรือ null เมื่อยังไม่มีข้อมูล) */
export function resolveSolution(concern: Concern, fit: Fit, data: BodyMapData): Solution | null {
  return resolveSolutions(concern, fit, data).solutions[0] ?? null;
}

/** เป้าหมายใน Fit กรองรายการปัญหา · ปัญหาที่ไม่มี Protocol ผู้ผลิต แสดงเสมอ */
export function concernMatchesGoal(concern: Concern, goal: Goal | null, data: BodyMapData): boolean {
  if (!goal) return true;
  const fams = [concern.template5, concern.template10]
    .map((id) => data.templates.find((t) => t.id === id)?.family)
    .filter(Boolean);
  const healthcare = concern.programs.some(
    (l) => data.programs.find((p) => p.id === l.programId)?.group.toLowerCase() === "healthcare"
  );
  if (goal === "Healthcare") return healthcare || fams.length === 0;
  if (fams.length === 0) return true;
  return fams.includes(goal);
}
