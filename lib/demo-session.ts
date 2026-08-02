import { env } from "cloudflare:workers";
import type { RequestActor } from "@/lib/server-identity";

export const demoSessionCookie = "bib_demo_session";

type DemoProfile = "internal" | "client";

function runtimeValue(key: string, fallback: string) {
  const value = String((env as unknown as Record<string, unknown>)[key] || "").trim();
  if (!value) throw new Error("Required runtime configuration is missing");
  return value;
}

export function demoAccessPin() {
  return runtimeValue("BIB_DEMO_ACCESS_PIN", "");
}

export function tokenForDemoProfile(profile: DemoProfile) {
  return profile === "client"
    ? runtimeValue("BIB_DEMO_CLIENT_TOKEN", "")
    : runtimeValue("BIB_DEMO_INTERNAL_TOKEN", "");
}

export function demoActorFromRequest(request: Request): RequestActor | null {
  const cookie = request.headers.get("cookie") || "";
  const token = cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${demoSessionCookie}=`))
    ?.slice(demoSessionCookie.length + 1);
  if (!token) return null;

  if (token === tokenForDemoProfile("internal")) {
    return {
      email: "demo-internal@bib.local",
      displayName: "Redacted Person",
      tenantId: "bib",
      role: "Executive",
      accountScope: "*",
    };
  }
  if (token === tokenForDemoProfile("client")) {
    return {
      email: "demo-linna@bib.local",
      displayName: "ทีม LINNA Clinic",
      tenantId: "bib",
      role: "Customer",
      accountScope: "linna",
    };
  }
  return null;
}

export function demoCookieHeader(token: string, request: Request, maxAge = 60 * 60 * 12) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${demoSessionCookie}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export function clearDemoCookieHeader(request: Request) {
  return demoCookieHeader("", request, 0);
}
