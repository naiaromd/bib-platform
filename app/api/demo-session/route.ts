import {
  clearDemoCookieHeader,
  demoAccessPin,
  demoCookieHeader,
  tokenForDemoProfile,
} from "@/lib/demo-session";

const destinations = {
  internal: "/workspace",
  approver: "/platform?view=approval",
  client: "/client",
  prospect: "/explore",
} as const;

function safeDestination(value: unknown, profile: "internal" | "approver" | "client") {
  const fallback = destinations[profile];
  const destination = String(value || "");
  if (!destination.startsWith("/") || destination.startsWith("//")) return fallback;
  const allowed = profile === "client"
    ? ["/client", "/linna", "/therapist", "/"]
    : profile === "approver"
      ? ["/platform", "/platform?view=approval"]
      : ["/workspace", "/platform", "/client", "/linna", "/therapist", "/term-templates", "/"];
  return allowed.includes(destination) ? destination : fallback;
}

function sameText(left: string, right: string) {
  const longest = Math.max(left.length, right.length);
  let different = left.length ^ right.length;
  for (let index = 0; index < longest; index += 1) {
    different |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }
  return different === 0;
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({})) as Record<string, unknown>;
  const profile = String(payload.profile || "") as keyof typeof destinations;
  if (!Object.hasOwn(destinations, profile)) {
    return Response.json({ error: "กรุณาเลือกพื้นที่ที่ต้องการทดลอง" }, { status: 400 });
  }
  if (profile === "prospect") {
    return Response.json({ ok: true, redirectTo: destinations.prospect });
  }
  if (!sameText(String(payload.pin || "").trim(), demoAccessPin())) {
    return Response.json({ error: "รหัสทดสอบไม่ถูกต้อง" }, { status: 401 });
  }

  return Response.json(
    { ok: true, redirectTo: safeDestination(payload.next, profile) },
    { headers: { "Set-Cookie": demoCookieHeader(tokenForDemoProfile(profile), request) } },
  );
}

export async function DELETE(request: Request) {
  return Response.json(
    { ok: true, redirectTo: "/login" },
    { headers: { "Set-Cookie": clearDemoCookieHeader(request) } },
  );
}
