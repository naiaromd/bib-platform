// Feature flags — read on the client via NEXT_PUBLIC_* env vars.
// All default to false; flip via Cloudflare dashboard once Nine approves.
export const FLAGS = {
  showClientLogos: process.env.NEXT_PUBLIC_SHOW_CLIENT_LOGOS === "true",
  showGlobalStats: process.env.NEXT_PUBLIC_SHOW_GLOBAL_STATS === "true",
  showAwards: process.env.NEXT_PUBLIC_SHOW_AWARDS === "true",
  showFdaBadge: process.env.NEXT_PUBLIC_SHOW_FDA_BADGE === "true",
  showStudyDetails: process.env.NEXT_PUBLIC_SHOW_STUDY_TABLE_DETAILS === "true",
  showPilotOffer: process.env.NEXT_PUBLIC_SHOW_PILOT_OFFER === "true",
  showRealQr: process.env.NEXT_PUBLIC_SHOW_REAL_QR === "true",
} as const;

// Airtable form fallback — used while the real backend API isn't wired yet.
export const AIRTABLE_FORM_URL =
  "https://airtable.com/app2HcsMi1mmqTLJi/pagVEw4HhnmAuhF29/form";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://bib.wiseofwellness.com";
