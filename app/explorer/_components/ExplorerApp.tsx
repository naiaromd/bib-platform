"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AREAS, AreaId, FRONT_IDS_WITH_WHOLE, BACK_IDS_WITH_WHOLE } from "@/lib/areas";
import { PROGRAM_AIRTABLE_ID } from "@/lib/programs";
import { HANDPIECES, HandpieceKey } from "@/lib/handpieces";
import { buildBlueprint, computeLeadTier } from "@/lib/blueprint";
import StageNav from "./StageNav";
import Stage1Context from "./Stage1Context";
import Stage2Body from "./Stage2Body";
import Stage3Handpiece from "./Stage3Handpiece";
import Stage4Blueprint from "./Stage4Blueprint";
import {
  Course,
  ExplorerState,
  FormState,
  Gender,
  Stage,
  View,
  CONTEXT_OPTIONS,
} from "./types";

const EMPTY_FORM: FormState = {
  name: "",
  license: "",
  clinic: "",
  province: "",
  volume: "31–80",
  phone: "",
  line: "",
  consent: false,
  mkt: false,
};

export default function ExplorerApp() {
  const sp = useSearchParams();

  const [s, setS] = useState<ExplorerState>(() => {
    const g = (sp.get("g") === "m" ? "m" : "f") as Gender;
    const v = (sp.get("v") === "back" ? "back" : "front") as View;
    const areaParam = sp.get("area") as AreaId | null;
    const ids = v === "front" ? FRONT_IDS_WITH_WHOLE : BACK_IDS_WITH_WHOLE;
    const area: AreaId = areaParam && ids.includes(areaParam) ? areaParam : "arms";
    const k = Math.max(0, parseInt(sp.get("k") || "0", 10) || 0);
    const initialPick = `${area}:${Math.min(k, AREAS[area].k.length - 1)}`;
    return {
      stage: sp.get("area") ? 2 : 1,
      ctx: { body: true },
      view: v,
      gender: g,
      area,
      picked: { [initialPick]: true },
      draft: {},
      hp: "RS",
      suc: 50,
      led: true,
      las: false,
      lock: null,
      net: true,
      playing: true,
      ses: "5",
      form: { ...EMPTY_FORM },
      tried: false,
      done: false,
    };
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const patch = (p: Partial<ExplorerState>) => setS((prev) => ({ ...prev, ...p }));
  const patchForm = (k: keyof FormState, v: string) =>
    setS((prev) => ({ ...prev, form: { ...prev.form, [k]: v } }));
  const patchFormBool = (k: "consent" | "mkt", v: boolean) =>
    setS((prev) => ({ ...prev, form: { ...prev.form, [k]: v } }));

  const toggleCtx = (key: string) =>
    patch({ ctx: { ...s.ctx, [key]: !s.ctx[key] } });
  const toggleConcern = (key: string) =>
    patch({ picked: { ...s.picked, [key]: !s.picked[key] } });
  const toggleDraft = (id: string) =>
    patch({ draft: { ...s.draft, [id]: !s.draft[id] } });
  const toggleLight = (which: "led" | "las") => {
    if (!HANDPIECES[s.hp].hasLight) return;
    patch({ [which]: !s[which] } as Partial<ExplorerState>);
  };

  const pickedKeys = useMemo(
    () => Object.keys(s.picked).filter((k) => s.picked[k]),
    [s.picked]
  );

  const sucLabel = s.suc < 34 ? "เบา" : s.suc < 67 ? "กลาง" : "แรง";
  const okLight = HANDPIECES[s.hp].hasLight;
  const lightText = !okLight
    ? "ไม่มีแสงในหัวนี้"
    : s.led || s.las
      ? [s.led && "LED 650 nm", s.las && "Laser 915 nm"].filter(Boolean).join(" + ")
      : "ไม่ใช้แสง";

  const blueprint = useMemo(
    () => buildBlueprint(pickedKeys, s.hp, s.ses),
    [pickedKeys, s.hp, s.ses]
  );

  const sumCtx =
    CONTEXT_OPTIONS.filter(([id]) => s.ctx[id])
      .map(([, label]) => label)
      .join(" · ") || "ยังไม่ได้เลือก";

  const ctxChip =
    (CONTEXT_OPTIONS.find(([id]) => s.ctx[id])?.[1] ?? "ทุกกลุ่ม") +
    " · " +
    AREAS[s.area].th;

  const leadTier = computeLeadTier(s.ctx, pickedKeys.length);

  const payload = useMemo(() => {
    const draftIds = Object.keys(s.draft).filter((k) => s.draft[k]);
    const concerns = pickedKeys.map((k) => {
      const [ar, iStr] = k.split(":");
      const area = AREAS[ar as AreaId];
      const concern = area?.k[+iStr];
      return {
        key: k,
        area: ar,
        label: concern?.[0] ?? "",
        programs: (concern?.[1] ?? []).map((name) => ({
          name,
          airtable_id: PROGRAM_AIRTABLE_ID[name] ?? "",
        })),
      };
    });
    return JSON.stringify(
      {
        blueprint_id: blueprint.id,
        source: "explorer-r04",
        lead: {
          name: s.form.name,
          license: s.form.license || null,
          clinic: s.form.clinic,
          province: s.form.province,
          cases_per_month: s.form.volume,
          phone: s.form.phone,
          line_id: s.form.line,
          consent_contact: s.form.consent,
          consent_marketing: s.form.mkt,
          lead_tier: leadTier,
        },
        clinic_context: CONTEXT_OPTIONS.filter(([id]) => s.ctx[id]).map((c) => c[0]),
        concerns,
        draft_programs: draftIds.map((id) => ({
          name: id,
          airtable_id: PROGRAM_AIRTABLE_ID[id] ?? "",
        })),
        handpiece: HANDPIECES[s.hp].name,
        light: okLight ? { led: s.led, laser: s.las } : null,
        suction_sim: sucLabel,
        course: s.ses,
        protocol_cards: blueprint.cards.map((c) => c.id),
        no_card_concerns: blueprint.openConcerns,
      },
      null,
      2
    );
  }, [blueprint, pickedKeys, s, leadTier, sucLabel, okLight]);

  const canSubmit = () => {
    const miss =
      !s.form.name.trim() ||
      !s.form.clinic.trim() ||
      !s.form.province ||
      (s.form.phone || "").replace(/\D/g, "").length < 9 ||
      !s.form.line.trim();
    return !miss && s.form.consent;
  };

  const submit = async () => {
    if (!canSubmit()) {
      patch({ tried: true });
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setSubmitError(data.error || "ส่งข้อมูลไม่สำเร็จ · ลองอีกครั้ง");
        return;
      }
      patch({ tried: false, done: true });
    } catch (err) {
      setSubmitError((err as Error).message || "network error");
    } finally {
      setSubmitting(false);
    }
  };

  // Scroll top on stage change
  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [s.stage]);

  return (
    <>
      <StageNav stage={s.stage} onGo={(st) => patch({ stage: st })} />
      <main className="lp-wrap pb-20 pt-9">
        {s.stage === 1 && (
          <Stage1Context
            ctx={s.ctx}
            onToggle={toggleCtx}
            onNext={() => patch({ stage: 2 })}
          />
        )}
        {s.stage === 2 && (
          <Stage2Body
            gender={s.gender}
            view={s.view}
            area={s.area}
            picked={s.picked}
            onGender={(g) => patch({ gender: g })}
            onView={(v) => patch({ view: v, area: v === "front" ? "arms" : "upper" })}
            onArea={(id) => patch({ area: id })}
            onToggleConcern={toggleConcern}
            onNext={() => patch({ stage: 3 })}
          />
        )}
        {s.stage === 3 && (
          <Stage3Handpiece
            ctxLabel={ctxChip}
            hp={s.hp}
            suc={s.suc}
            led={s.led}
            las={s.las}
            lockStep={s.lock}
            showNet={s.net}
            picked={s.picked}
            draft={s.draft}
            onHp={(k: HandpieceKey) => patch({ hp: k })}
            onSuc={(v) => patch({ suc: v })}
            onToggleLight={toggleLight}
            onLockStep={(i) => patch({ lock: i })}
            onToggleNet={() => patch({ net: !s.net })}
            onToggleDraft={toggleDraft}
            onNext={() => patch({ stage: 4 })}
          />
        )}
        {s.stage === 4 && (
          <>
            <Stage4Blueprint
              blueprint={blueprint}
              sumCtx={sumCtx}
              pickedKeys={pickedKeys}
              hp={s.hp}
              sucLabel={sucLabel}
              lightText={lightText}
              course={s.ses}
              form={s.form}
              tried={s.tried}
              done={s.done}
              payload={payload}
              onCourse={(c: Course) => patch({ ses: c })}
              onFormChange={patchForm}
              onFormBool={patchFormBool}
              onSubmit={submit}
              onEdit={() => patch({ done: false })}
            />
            {submitting && (
              <p className="mt-4 text-sm text-ink-2">กำลังส่ง...</p>
            )}
            {submitError && (
              <p className="mt-4 text-sm text-bad">{submitError}</p>
            )}
          </>
        )}
      </main>
    </>
  );
}
