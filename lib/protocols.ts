// Protocol Templates + their steps + the concern → card mapping.
// Source: BIB-handoff_r03/data/airtable_protocol_cards.json (read 22 Nov 2026)

export interface ProtocolStep {
  prog: string;
  min: number;
}

export interface ProtocolPhase {
  s: string; // session range, e.g. "1–5" or "6–10"
  st: ProtocolStep[];
}

export interface ProtocolCard {
  n: string;
  fam: string;
  sub: string;
  ses: string;
  min: number | null;
  freq: string;
  tg: string;
  ar: string;
  src: string;
  ph: ProtocolPhase[];
}

// 26 protocol cards from Airtable (read 22 Nov 2026)
export const CARDS: Record<string, ProtocolCard> = {
  "PRO-CARD-001": { n: "Inner Thigh 10", fam: "Toning", sub: "Firm Solution", ses: "10 (5+5)", min: 30, freq: "2 ครั้ง/สัปดาห์", tg: "Women", ar: "Inner thigh", src: "SRC-004 Master Matrix!A2", ph: [{ s: "1–5", st: [{ prog: "BIOYOUNG", min: 20 }, { prog: "INTON", min: 10 }] }, { s: "6–10", st: [{ prog: "ELASTO", min: 20 }, { prog: "INTON", min: 10 }] }] },
  "PRO-CARD-002": { n: "Inner Thigh 5", fam: "Toning", sub: "Firm Solution", ses: "5", min: 30, freq: "2 ครั้ง/สัปดาห์", tg: "Women", ar: "Inner thigh", src: "SRC-004 Master Matrix!A3", ph: [{ s: "1–5", st: [{ prog: "BIOYOUNG", min: 20 }, { prog: "INTON", min: 10 }] }] },
  "PRO-CARD-003": { n: "Buttocks 5", fam: "Toning", sub: "Firm Solution", ses: "5", min: 30, freq: "2 ครั้ง/สัปดาห์", tg: "Women", ar: "Buttocks", src: "SRC-004 Master Matrix!A4", ph: [{ s: "1–5", st: [{ prog: "BIOYOUNG", min: 20 }, { prog: "MODELPLUS", min: 10 }] }] },
  "PRO-CARD-004": { n: "Buttocks 10", fam: "Toning", sub: "Firm Solution", ses: "10 (5+5)", min: 30, freq: "2 ครั้ง/สัปดาห์", tg: "Women", ar: "Buttocks", src: "SRC-004 Master Matrix!A5", ph: [{ s: "1–5", st: [{ prog: "BIOYOUNG", min: 20 }, { prog: "MODELPLUS", min: 10 }] }, { s: "6–10", st: [{ prog: "ELASTO", min: 20 }, { prog: "MODELPLUS", min: 10 }] }] },
  "PRO-CARD-005": { n: "Specific Action 5", fam: "Toning", sub: "Firm Solution", ses: "5", min: 30, freq: "2 ครั้ง/สัปดาห์", tg: "Women + Men", ar: "Breast / Knees / Stretch marks", src: "SRC-004 Master Matrix!A6", ph: [{ s: "1–5", st: [{ prog: "ELASTO", min: 20 }, { prog: "BIOYOUNG", min: 10 }] }] },
  "PRO-CARD-006": { n: "Specific Action 10", fam: "Toning", sub: "Firm Solution", ses: "10 (5+5)", min: 30, freq: "2 ครั้ง/สัปดาห์", tg: "Women + Men", ar: "Breast / Knees / Stretch marks", src: "SRC-004 Master Matrix!A7", ph: [{ s: "1–5", st: [{ prog: "ELASTO", min: 20 }, { prog: "BIOYOUNG", min: 10 }] }, { s: "6–10", st: [{ prog: "ELASTO", min: 20 }, { prog: "BIOYOUNG", min: 10 }] }] },
  "PRO-CARD-007": { n: "Arms 5", fam: "Toning", sub: "Firm Solution", ses: "5", min: 30, freq: "2 ครั้ง/สัปดาห์", tg: "Women + Men", ar: "Arms", src: "SRC-004 Master Matrix!A8", ph: [{ s: "1–5", st: [{ prog: "BIOYOUNG", min: 20 }, { prog: "ARMTON", min: 10 }] }] },
  "PRO-CARD-008": { n: "Arms 10", fam: "Toning", sub: "Firm Solution", ses: "10 (5+5)", min: 40, freq: "2 ครั้ง/สัปดาห์", tg: "Women + Men", ar: "Arms", src: "SRC-004 Master Matrix!A9", ph: [{ s: "1–5", st: [{ prog: "BIOYOUNG", min: 20 }, { prog: "ARMTON", min: 10 }] }, { s: "6–10", st: [{ prog: "BIOYOUNG", min: 20 }, { prog: "ARMTON", min: 10 }, { prog: "ELASTO", min: 10 }] }] },
  "PRO-CARD-009": { n: "Abdomen 5", fam: "Toning", sub: "Firm Solution", ses: "5", min: 40, freq: "2 ครั้ง/สัปดาห์", tg: "Women + Men", ar: "Abdomen", src: "SRC-004 Master Matrix!A10", ph: [{ s: "1–5", st: [{ prog: "BIOYOUNG", min: 20 }, { prog: "ABDOTON", min: 10 }] }] },
  "PRO-CARD-010": { n: "Abdomen 10", fam: "Toning", sub: "Firm Solution", ses: "10 (5+5)", min: 30, freq: "2 ครั้ง/สัปดาห์", tg: "Women + Men", ar: "Abdomen", src: "SRC-004 Master Matrix!A11", ph: [{ s: "1–5", st: [{ prog: "BIOYOUNG", min: 20 }, { prog: "ABDOTON", min: 10 }] }, { s: "6–10", st: [{ prog: "ELASTO", min: 20 }, { prog: "ABDOTON", min: 10 }] }] },
  "PRO-CARD-011": { n: "Face 5", fam: "Toning", sub: "Firm Solution", ses: "5", min: 30, freq: "2 ครั้ง/สัปดาห์", tg: "Women", ar: "Face / Neck", src: "SRC-004 Master Matrix!A12", ph: [{ s: "1–5", st: [{ prog: "NECK-FACE DRAIN", min: 20 }, { prog: "NECK-FACE ONE", min: 10 }] }] },
  "PRO-CARD-012": { n: "Face 10", fam: "Toning", sub: "Firm Solution", ses: "10 (5+5)", min: 30, freq: "2 ครั้ง/สัปดาห์", tg: "Women + Men", ar: "Face / Neck", src: "SRC-004 Master Matrix!A13", ph: [{ s: "1–5", st: [{ prog: "NECK-FACE DRAIN", min: 20 }, { prog: "NECK-FACE ONE", min: 10 }] }, { s: "6–10", st: [{ prog: "NECK-FACE ONE", min: 20 }, { prog: "NECK-FACE TWO", min: 10 }] }] },
  "PRO-CARD-013": { n: "Full Body 5", fam: "Toning", sub: "Firm Solution", ses: "5", min: 60, freq: "2 ครั้ง/สัปดาห์", tg: "Women + Men*", ar: "Whole body", src: "SRC-004 Master Matrix!A14", ph: [{ s: "1–5", st: [{ prog: "BIOYOUNG", min: 20 }, { prog: "INTON", min: 10 }, { prog: "MODELPLUS", min: 10 }, { prog: "ABDOTON", min: 10 }, { prog: "ARMTON", min: 10 }] }] },
  "PRO-CARD-014": { n: "Full Body 10", fam: "Toning", sub: "Firm Solution", ses: "10 (5+5)", min: 60, freq: "2 ครั้ง/สัปดาห์", tg: "Women + Men*", ar: "Whole body", src: "SRC-004 Master Matrix!A15", ph: [{ s: "1–5", st: [{ prog: "BIOYOUNG", min: 20 }, { prog: "INTON", min: 10 }, { prog: "MODELPLUS", min: 10 }, { prog: "ABDOTON", min: 10 }, { prog: "ARMTON", min: 10 }] }, { s: "6–10", st: [{ prog: "ELASTO", min: 20 }, { prog: "ABDOTON", min: 10 }, { prog: "ARMTON", min: 10 }, { prog: "INTON", min: 10 }, { prog: "MODELPLUS", min: 10 }] }] },
  "PRO-CARD-015": { n: "Waist Line 5", fam: "Reshaping", sub: "Perfect Shape", ses: "5", min: 40, freq: "2 ครั้ง/สัปดาห์", tg: "Women + Men*", ar: "Abdomen / Waist", src: "SRC-004 Master Matrix!A16", ph: [{ s: "1–5", st: [{ prog: "CELLFAT", min: 20 }, { prog: "SILHOUETTE", min: 10 }, { prog: "MEN-ZONE", min: 10 }] }] },
  "PRO-CARD-016": { n: "Waist Line 10", fam: "Reshaping", sub: "Perfect Shape", ses: "10 (5+5)", min: 50, freq: "2 ครั้ง/สัปดาห์", tg: "Women + Men*", ar: "Abdomen / Waist", src: "SRC-004 Master Matrix!A17", ph: [{ s: "1–5", st: [{ prog: "CELLFAT", min: 20 }, { prog: "SILHOUETTE", min: 10 }, { prog: "MEN-ZONE", min: 10 }] }, { s: "6–10", st: [{ prog: "CELLDRAIN", min: 20 }, { prog: "SILHOUETTE", min: 10 }, { prog: "MEN-ZONE", min: 10 }, { prog: "FATZONE", min: 10 }] }] },
  "PRO-CARD-017": { n: "Upper Body 5", fam: "Reshaping", sub: "Perfect Shape", ses: "5", min: 30, freq: "2 ครั้ง/สัปดาห์", tg: "Women + Men", ar: "Arms / Back / Bison hump", src: "SRC-004 Master Matrix!A18", ph: [{ s: "1–5", st: [{ prog: "CELLFAT", min: 20 }, { prog: "HIGHPLUS", min: 10 }] }] },
  "PRO-CARD-018": { n: "Upper Body 10", fam: "Reshaping", sub: "Perfect Shape", ses: "10 (5+5)", min: 30, freq: "2 ครั้ง/สัปดาห์", tg: "Women + Men", ar: "Arms / Back / Bison hump", src: "SRC-004 Master Matrix!A19", ph: [{ s: "1–5", st: [{ prog: "CELLFAT", min: 20 }, { prog: "HIGHPLUS", min: 10 }] }, { s: "6–10", st: [{ prog: "CELLFAT", min: 20 }, { prog: "ARMTON", min: 10 }, { prog: "HIGHPLUS", min: 10 }] }] },
  "PRO-CARD-019": { n: "Full Body 5", fam: "Reshaping", sub: "Perfect Shape", ses: "5", min: 60, freq: "2 ครั้ง/สัปดาห์", tg: "Women + Men*", ar: "Abdomen, waist, hips, thighs, legs, ankles, arms, back", src: "SRC-004 Master Matrix!A20", ph: [{ s: "1–5", st: [{ prog: "CELLFAT", min: 20 }, { prog: "SILHOUETTE", min: 10 }, { prog: "MEN-ZONE", min: 10 }, { prog: "HIGHPLUS", min: 10 }, { prog: "REMOD", min: 10 }] }] },
  "PRO-CARD-020": { n: "Full Body 10", fam: "Reshaping", sub: "Perfect Shape", ses: "10 (5+5)", min: null, freq: "2 ครั้ง/สัปดาห์", tg: "Women + Men*", ar: "Abdomen, waist, hips, thighs, legs, ankles, arms, back", src: "SRC-004 Master Matrix!A21", ph: [{ s: "1–5", st: [{ prog: "CELLFAT", min: 20 }, { prog: "SILHOUETTE", min: 10 }, { prog: "MEN-ZONE", min: 10 }, { prog: "HIGHPLUS", min: 10 }, { prog: "REMOD", min: 10 }] }, { s: "6–10", st: [{ prog: "CELLDRAIN", min: 20 }, { prog: "SILHOUETTE", min: 10 }, { prog: "MEN-ZONE", min: 10 }, { prog: "HIGHPLUS", min: 10 }, { prog: "REMOD", min: 10 }, { prog: "FATZONE", min: 10 }] }] },
  "PRO-CARD-021": { n: "Face 5 (Double chin)", fam: "Reshaping", sub: "Perfect Shape", ses: "5", min: 30, freq: "2 ครั้ง/สัปดาห์", tg: "Women + Men", ar: "Double chin", src: "SRC-004 Master Matrix!A22", ph: [{ s: "1–5", st: [{ prog: "NECK-FACE DRAIN", min: 20 }, { prog: "CHINSCULPT", min: 10 }] }] },
  "PRO-CARD-022": { n: "Face 10 (Double chin)", fam: "Reshaping", sub: "Perfect Shape", ses: "10 (5+5)", min: 40, freq: "2 ครั้ง/สัปดาห์", tg: "Women + Men", ar: "Double chin", src: "SRC-004 Master Matrix!A23", ph: [{ s: "1–5", st: [{ prog: "NECK-FACE DRAIN", min: 20 }, { prog: "CHINSCULPT", min: 10 }] }, { s: "6–10", st: [{ prog: "NECK-FACE DRAIN", min: 20 }, { prog: "NECK-FACE ONE", min: 10 }, { prog: "CHINSCULPT", min: 10 }] }] },
  "PRO-CARD-023": { n: "Face 5", fam: "Anti-Ageing", sub: "Anti-Ageing", ses: "5", min: 30, freq: "2 ครั้ง/สัปดาห์", tg: "Women + Men", ar: "Face / Neck", src: "SRC-004 Master Matrix!A24", ph: [{ s: "1–5", st: [{ prog: "NECK-FACE ONE", min: 20 }, { prog: "SMOOTHFACE", min: 10 }] }] },
  "PRO-CARD-024": { n: "Face 10", fam: "Anti-Ageing", sub: "Anti-Ageing", ses: "10 (5+5)", min: 30, freq: "2 ครั้ง/สัปดาห์", tg: "Women + Men", ar: "Face / Neck", src: "SRC-004 Master Matrix!A25", ph: [{ s: "1–5", st: [{ prog: "NECK-FACE ONE", min: 20 }, { prog: "SMOOTHFACE", min: 10 }] }, { s: "6–10", st: [{ prog: "NECK-FACE ONE", min: 10 }, { prog: "NECK-FACE TWO", min: 10 }, { prog: "SMOOTHFACE", min: 10 }] }] },
  "PRO-CARD-025": { n: "Venous Drainage", fam: "Drainage", sub: "Immune Symmetry", ses: "5 or 10", min: 40, freq: "2 ครั้ง/สัปดาห์", tg: "Women + Men", ar: "Full body", src: "SRC-004 Master Matrix!A26", ph: [{ s: "1–5", st: [{ prog: "FLOWING", min: 20 }, { prog: "CELLDRAIN", min: 10 }, { prog: "REMOD", min: 10 }] }, { s: "6–10", st: [{ prog: "FLOWING", min: 20 }, { prog: "CELLDRAIN", min: 10 }, { prog: "REMOD", min: 10 }] }] },
  "PRO-CARD-026": { n: "Lymphatic Drainage", fam: "Drainage", sub: "Immune Symmetry", ses: "5 or 10", min: 50, freq: "2 ครั้ง/สัปดาห์", tg: "Women + Men", ar: "Full body", src: "SRC-004 Master Matrix!A27", ph: [{ s: "1–5", st: [{ prog: "CELLDRAIN", min: 20 }, { prog: "REMOD", min: 10 }, { prog: "TONUS", min: 10 }, { prog: "OPTIMUM", min: 10 }] }, { s: "6–10", st: [{ prog: "CELLDRAIN", min: 20 }, { prog: "REMOD", min: 10 }, { prog: "TONUS", min: 10 }, { prog: "OPTIMUM", min: 10 }] }] },
};

// concern key (area:index) → candidate Protocol Template IDs
export const CMAP: Record<string, string[]> = {
  "face:0": ["PRO-CARD-023", "PRO-CARD-024"],
  "face:1": ["PRO-CARD-021", "PRO-CARD-022"],
  "face:3": ["PRO-CARD-011", "PRO-CARD-012"],
  "face:4": ["PRO-CARD-011", "PRO-CARD-012"],
  "arms:0": ["PRO-CARD-007", "PRO-CARD-008"],
  "upper:0": ["PRO-CARD-017", "PRO-CARD-018"],
  "abdomen:0": ["PRO-CARD-009", "PRO-CARD-010"],
  "abdomen:1": ["PRO-CARD-015", "PRO-CARD-016"],
  "hips:3": ["PRO-CARD-003", "PRO-CARD-004"],
  "hips:5": ["PRO-CARD-001", "PRO-CARD-002"],
  "legs:0": ["PRO-CARD-025"],
  "legs:2": ["PRO-CARD-025"],
  "whole:0": ["PRO-CARD-019", "PRO-CARD-020"],
  "whole:1": ["PRO-CARD-026"],
};

// Cards whose stated duration doesn't match the sum of their step minutes.
// Surfaced in the Blueprint as a soft "pending verification" line.
export const WARN: Record<string, string> = {
  "PRO-CARD-009": "เวลาในการ์ด 40 นาที แต่ขั้นตอนรวม 30 นาที — รอตรวจกับการ์ดต้นฉบับ",
  "PRO-CARD-018": "เวลาในการ์ด 30 นาที แต่ครั้งที่ 6–10 รวม 40 นาที — รอตรวจ",
  "PRO-CARD-020": "การ์ดไม่มีเวลารวมต่อครั้ง — รอตรวจ",
};
