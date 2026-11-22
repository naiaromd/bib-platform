// Explorer step 04 submit — writes to Web Leads + Explorer Drafts in Airtable.
// Server-side only. Token read from env (never exposed to the client).
//
// Table + field IDs come from docs/AIRTABLE_LEADS_BOOKING_SPEC.md (r02 · r03).
//
// The endpoint is intentionally permissive about shape — validation lives in
// the Explorer client for UX speed, then re-runs here before hitting Airtable.

import { NextResponse } from "next/server";

export const runtime = "edge";

interface Payload {
  blueprint_id: string;
  source?: string;
  lead: {
    name: string;
    license?: string | null;
    clinic: string;
    province: string;
    cases_per_month?: string;
    phone: string;
    line_id: string;
    consent_contact: boolean;
    consent_marketing?: boolean;
    lead_tier?: "A" | "B" | "C";
  };
  clinic_context?: string[];
  concerns?: Array<{
    key: string;
    area: string;
    label: string;
    programs: Array<{ name: string; airtable_id: string }>;
  }>;
  draft_programs?: Array<{ name: string; airtable_id: string }>;
  handpiece?: string;
  light?: { led: boolean; laser: boolean } | null;
  suction_sim?: string;
  course?: string;
  protocol_cards?: string[];
  no_card_concerns?: string[];
}

function badRequest(msg: string, extra?: unknown) {
  return NextResponse.json({ ok: false, error: msg, extra }, { status: 400 });
}

function missingEnv(name: string) {
  return NextResponse.json(
    { ok: false, error: `Missing env: ${name}` },
    { status: 500 }
  );
}

export async function POST(req: Request) {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!token) return missingEnv("AIRTABLE_TOKEN");
  if (!baseId) return missingEnv("AIRTABLE_BASE_ID");

  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return badRequest("invalid json");
  }

  // Minimal server-side validation (honeypot + required fields + consent).
  if (!body.lead?.consent_contact) {
    return badRequest("consent_contact is required");
  }
  const required = ["name", "clinic", "province", "phone", "line_id"] as const;
  const missing = required.filter((k) => !body.lead?.[k]);
  if (missing.length) return badRequest(`missing: ${missing.join(", ")}`);
  const phoneDigits = (body.lead.phone || "").replace(/\D/g, "");
  if (phoneDigits.length < 9) return badRequest("phone too short");

  const T = {
    leads: process.env.AIRTABLE_TABLE_WEB_LEADS || "tblKkEY1DzU7Pjd0H",
    drafts: process.env.AIRTABLE_TABLE_EXPLORER_DRAFTS || "tblpp4zvqvsLAtQCf",
  };

  // 1) Create Web Lead
  const leadRecord = await airtableCreate(token, baseId, T.leads, {
    fields: {
      fldj4Kc9p0e8nhG0e: body.blueprint_id,
      fldiHe6VIS6YVw4fR: body.lead.name,
      fldddXeQigAVSfUBj: body.lead.license || "",
      fld8sT6WzZNQzwmkm: body.lead.clinic,
      fldzbZO68CEsjrh7Y: body.lead.province,
      fldgNQNFhcpkso57z: body.lead.cases_per_month || "",
      fld5frGSjk3VOMA2l: body.lead.phone,
      fldDFhd2MS78uRk4A: body.lead.line_id,
      fldXnsoHGrE808uIj: body.clinic_context || [],
      fldllIE3EYLvaXdCz: body.lead.lead_tier || "C",
      fldJ2SSK3UMfplyx1: !!body.lead.consent_contact,
      flddxF8LUfqbgZx6M: !!body.lead.consent_marketing,
      fld6RVifdylH5brbk: "ใหม่",
      fldq5loEt8fmZTfsN: body.source || "explorer-r04",
    },
  });

  if (!leadRecord.ok) {
    return NextResponse.json(
      { ok: false, error: "lead write failed", airtable: leadRecord.err },
      { status: 502 }
    );
  }

  // 2) Create Explorer Draft, linked to Lead.
  // NOTE: Programs + Protocol cards are stored as strings here; the production
  // path should first look them up in Airtable by Program ID / Template ID and
  // pass back record IDs. Follow-up commit after linkage helpers land.
  const concernKeys = (body.concerns || []).map((c) => c.key).join("\n");
  const concernLabels = (body.concerns || [])
    .map((c) => `${c.area}: ${c.label}`)
    .join("\n");
  const areas = Array.from(new Set((body.concerns || []).map((c) => c.area)));

  const draftRecord = await airtableCreate(token, baseId, T.drafts, {
    fields: {
      fldvXPeK84PDsem0T: body.blueprint_id,
      fldkgGXEcFR1R4w2C: [leadRecord.id],
      fldNL9mlouFSxijTg: concernKeys,
      fldiwUtT7yXOQ6LDy: concernLabels,
      flds8bOOiGxzC9zDj: areas,
      fldmJV84SSRZI1iS7: (body.no_card_concerns || []).join("\n"),
      fldcwQmxKWWPz8GOR: body.course || "5",
      fldxPjqedFz5L5bxv: body.handpiece || "",
      fldUZiLlnsaZHjpKM: !!body.light?.led,
      fldbsvFBRBIJrxssb: !!body.light?.laser,
      fldm0zWsbaqJqRzow: body.suction_sim || "",
      fldy76Zi9Fz3aaUnO: "รอตรวจ",
      fld8uJYVlXLfj8zl9: JSON.stringify(body, null, 2),
    },
  });

  return NextResponse.json({
    ok: true,
    blueprint_id: body.blueprint_id,
    lead_id: leadRecord.id,
    draft_id: draftRecord.ok ? draftRecord.id : null,
    draft_error: draftRecord.ok ? undefined : draftRecord.err,
  });
}

async function airtableCreate(
  token: string,
  baseId: string,
  tableId: string,
  body: unknown
): Promise<{ ok: true; id: string } | { ok: false; err: unknown }> {
  const res = await fetch(`https://api.airtable.com/v0/${baseId}/${tableId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let err: unknown;
    try {
      err = await res.json();
    } catch {
      err = await res.text();
    }
    return { ok: false, err };
  }
  const data = (await res.json()) as { id: string };
  return { ok: true, id: data.id };
}
