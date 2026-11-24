// Body Map r05 · ชั้นข้อมูล
// ตอนนี้อ่านจากไฟล์ที่สร้างไว้ล่วงหน้า (CANON r03 + snapshot Airtable 23 พ.ย. 2026)
// สร้างใหม่ด้วย: /usr/bin/python3 _ai/tools/build_bodymap_data.py
// เมื่อมี AIRTABLE_TOKEN → เปลี่ยน loadAll() ไปอ่าน Airtable ฝั่ง server (ดู _ai/PENDING_BM-R05.html หัวข้อ ระบบ)
import raw from "./data.generated.json";

/** present = เว็บจริง (เฉพาะ 🔒) · internal = ทีมตรวจ (ทุกแถว + ป้าย + รหัส) · showcase = ทดสอบกับหมอ (ทุกแถว ไม่มีป้าย/รหัส) */
export type Mode = "present" | "internal" | "showcase";

export type Zone = { id: string; th: string; view: string };
export type ProgramLink = { programId: string; type: string };
export type Concern = {
  id: string; label: string; canon: string; consumerLabel: string; group: string; category: string;
  zones: string[]; zoneType: string; terms: string[]; question: string; status: string; altMeaning: string;
  fdaBadge: boolean; bibProtocols: string[]; template5: string | null; template10: string | null;
  templateMatch: string; programs: ProgramLink[]; evidence: string[]; cases: string[];
  psPrimary: string[]; psSecondary: string[]; locked: boolean;
  /** "study" = ยังไม่มีแผนดูแล · icoone อาจเป็นส่วนหนึ่งของการดูแล ชวนศึกษาเพิ่ม */
  scope?: string;
};
export type Program = {
  id: string; name: string; group: string; effectTags: string; aim: string; exam: string; position: string;
  notes: string; defaultMinutes: number | null; headCompat: string; short: string; shortStatus: string;
  ceMedical: string; locked: boolean; sourcePage: string; detail?: string;
};
export type TemplateStep = {
  range: string; phase: number; order: number; programId: string; minutes: number | null;
  handpiece: string | null; raw: string;
};
export type Template = {
  id: string; nameTh?: string; name: string; family: string; subline: string; target: string; area: string; sessions: string;
  frequency: string; statedMinutes: string; minutes1to5: string | null; minutes6to10: string | null;
  minutesCheck: string; assessment: string; aim: string; footnotes: string; steps: TemplateStep[];
  status: string; locked: boolean;
};
export type BibStep = {
  order: number; programId: string | null; options: string[]; stepType: string; raw: string; minutes: number | null;
};
export type BibProtocol = {
  id: string; nameTh?: string; name: string; consumerLabel: string; legacyAlias: string; category: string;
  totalMinutes: number | null; composition: string; steps: BibStep[]; status: string; locked: boolean;
};
export type PatientSituation = {
  id: string; canon: string; label: string; trigger: string; job: string; avoid: string; status: string; locked: boolean;
  mi: MarketInsight;
};
/** Market Insight ของกลุ่มคนไข้ · เรียบเรียงจากข้อมูลจริงใน Airtable (ไนน์อนุมัติ 25 พ.ย.) · ช่องว่าง = ไม่แสดง */
export type MarketInsight = { summary: string; keywords: string[]; reads: string; key: string; services: string[]; crosssell: string; proof: string };
export type QuestionKey = "works" | "how" | "protocol" | "safety" | "patient" | "peers";
export type Evidence = {
  id: string; title: string; year: number | null; authors: string; categories: string[]; questions: QuestionKey[];
  relation: string; level: string; n: number | null; summary: string; direction: string; canSay: string;
  limits: string; url: string; reviewStatus: string; pains: string[]; programs: string[]; short: string;
  rank: number[]; locked: boolean; detail?: string; headline?: string;
};
export type Case = {
  id: string; topic: string; quality: string; pains: string[]; country: string; programs: string[];
  sequence: string; sessions: number | null; minutesPerSession: number | null; frequency: string; goal: string;
  result: string; measure: string; limits: string; nearestTemplate: string[]; reviewStatus: string;
  short: string; locked: boolean;
};
export type Insight = {
  id: string; painId: string; course: 5 | 10; who: string; opportunity: string; proof: string; proofRef: string; status: string; locked: boolean;
};
export type FigurePoints = Record<string, Record<string, number[][]>>;
export type BodyMapData = {
  mode: Mode;
  zones: Zone[]; figurePoints: FigurePoints; concerns: Concern[]; programs: Program[]; templates: Template[];
  bibProtocols: BibProtocol[]; patientSituations: PatientSituation[]; evidence: Evidence[]; cases: Case[];
  evidenceByProgram: Record<string, string[]>; insights: Insight[];
};

type Raw = Omit<BodyMapData, "mode"> & { figurePoints: unknown };
const all = raw as unknown as Raw;

/** โหมดนำเสนอ = เฉพาะแถวที่ติ๊ก 🔒 ทุกตาราง · โหมดภายใน = ทุกแถว */
export function loadBodyMap(mode: Mode): BodyMapData {
  const base: BodyMapData = { ...(all as unknown as Omit<BodyMapData, "mode">), mode };
  base.insights = base.insights ?? [];
  return filterByMode(base, mode);
}

/** กรองตามโหมด · นำเสนอ = เฉพาะแถวที่ติ๊ก 🔒 (ใช้ทั้งกับไฟล์สำเนาและข้อมูลสดจาก Airtable) */
export function filterByMode(input: BodyMapData, mode: Mode): BodyMapData {
  const base: BodyMapData = { ...input, mode };
  if (mode === "internal" || mode === "showcase") return base;
  const keep = <T extends { locked: boolean }>(rows: T[]) => rows.filter((r) => r.locked);
  const programs = keep(base.programs);
  const templates = keep(base.templates);
  const bibProtocols = keep(base.bibProtocols);
  const evidence = keep(base.evidence);
  const cases = keep(base.cases);
  const ps = keep(base.patientSituations);
  const has = <T extends { id: string }>(rows: T[]) => new Set(rows.map((r) => r.id));
  const [pS, tS, bS, eS, cS, sS] = [has(programs), has(templates), has(bibProtocols), has(evidence), has(cases), has(ps)];
  const concerns = keep(base.concerns).map((c) => ({
    ...c,
    programs: c.programs.filter((x) => pS.has(x.programId)),
    template5: c.template5 && tS.has(c.template5) ? c.template5 : null,
    template10: c.template10 && tS.has(c.template10) ? c.template10 : null,
    bibProtocols: c.bibProtocols.filter((x) => bS.has(x)),
    evidence: c.evidence.filter((x) => eS.has(x)),
    cases: c.cases.filter((x) => cS.has(x)),
    psPrimary: c.psPrimary.filter((x) => sS.has(x)),
    psSecondary: c.psSecondary.filter((x) => sS.has(x)),
  }));
  return { ...base, concerns, programs, templates, bibProtocols, evidence, cases, patientSituations: ps, insights: keep(base.insights) };
}

export function currentMode(): Mode {
  if (process.env.BODYMAP_INTERNAL === "1") return "internal";
  if (process.env.BODYMAP_SHOWCASE === "1") return "showcase";
  return "present";
}
