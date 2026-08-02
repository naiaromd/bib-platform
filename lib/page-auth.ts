import { redirect } from "next/navigation";
import { AccessError, requirePageActor, requireRole, type AppRole } from "@/lib/server-identity";

export async function requireAuthorizedPage(pathname: string, allowed?: AppRole[]) {
  try {
    const actor = await requirePageActor(pathname);
    if (allowed) requireRole(actor, allowed);
    return actor;
  } catch (error) {
    // The public prototype uses its own short-lived demo session. Any stale
    // Sites/ChatGPT identity or role mismatch should return visitors to the
    // BIB login screen instead of escaping as an unhandled Worker error.
    if (error instanceof AccessError) {
      redirect(`/login?next=${encodeURIComponent(pathname)}`);
    }
    throw error;
  }
}
