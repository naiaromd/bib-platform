// Blueprint math — concern picks + handpiece + course length
// → protocol cards, open concerns (no card), stable blueprint ID.

import { AREAS, AreaId } from "./areas";
import { CARDS, CMAP, WARN, ProtocolCard } from "./protocols";
import { PROGRAM_INFO } from "./programs";

export interface BlueprintCard {
  id: string;
  n: string;
  fam: string;
  sub: string;
  ses: string;
  freq: string;
  ar: string;
  tg: string;
  src: string;
  for: string;
  warn?: string;
  ph: {
    s: string;
    tot: number;
    st: { n: number; p: string; g: string; m: number }[];
  }[];
}

export interface Blueprint {
  id: string;
  cards: BlueprintCard[];
  openConcerns: string[];
  noCards: boolean;
}

function pickCardForCourse(ids: string[], course: "5" | "10"): string {
  if (ids.length === 1) return ids[0];
  const want = course === "10" ? "10" : "5";
  return ids.find((id) => CARDS[id].ses.indexOf(want) === 0) ?? ids[0];
}

function stableHash(parts: string[]): string {
  const seed = parts.join("|");
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return "BIB-PL-" + String(1000 + (h % 9000));
}

export function buildBlueprint(
  pickedKeys: string[],
  handpiece: string,
  course: "5" | "10"
): Blueprint {
  const open: string[] = [];
  const used: Record<string, BlueprintCard> = {};
  const list: BlueprintCard[] = [];

  pickedKeys.forEach((k) => {
    const [ar, iStr] = k.split(":");
    const area = AREAS[ar as AreaId];
    if (!area) return;
    const i = Number(iStr);
    const concern = area.k[i];
    if (!concern) return;
    const label = area.th + ": " + concern[0];

    const candidates = CMAP[k];
    if (!candidates || candidates.length === 0) {
      open.push(label);
      return;
    }

    const id = pickCardForCourse(candidates, course);
    if (used[id]) {
      // Second concern sharing this card — accumulate "for" list.
      used[id].for = used[id].for + " · " + concern[0];
      return;
    }
    const c: ProtocolCard = CARDS[id];
    const card: BlueprintCard = {
      id,
      n: c.n,
      fam: c.fam,
      sub: c.sub,
      ses: c.ses,
      freq: c.freq,
      ar: c.ar,
      tg: c.tg,
      src: c.src,
      for: concern[0],
      warn: WARN[id],
      ph: c.ph.map((ph) => ({
        s: ph.s,
        tot: ph.st.reduce((sum, st) => sum + st.min, 0),
        st: ph.st.map((st, idx) => ({
          n: idx + 1,
          p: st.prog,
          m: st.min,
          g: PROGRAM_INFO[st.prog]?.[0] ?? "",
        })),
      })),
    };
    used[id] = card;
    list.push(card);
  });

  const id = stableHash([pickedKeys.join(","), handpiece, course]);
  return {
    id,
    cards: list,
    openConcerns: open,
    noCards: list.length === 0,
  };
}

// Lead tier logic per spec: A = face-centered OR post-op · B = 3+ concerns · C = other.
// Site-only, never shown to the doctor.
export function computeLeadTier(
  ctx: Record<string, boolean>,
  pickedCount: number
): "A" | "B" | "C" {
  if (ctx.face || ctx.post) return "A";
  if (pickedCount >= 3) return "B";
  return "C";
}
