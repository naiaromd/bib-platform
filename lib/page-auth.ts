import { redirect } from "next/navigation";
import { AccessError, requirePageActor, requireRole, type AppRole } from "@/lib/server-identity";

export async function requireAuthorizedPage(pathname: string, allowed?: AppRole[]) {
  try {
    const actor = await requirePageActor(pathname);
    if (allowed) requireRole(actor, allowed);
    return actor;
  } catch (error) {
    if (error instanceof AccessError && error.status === 401) {
      redirect(`/login?next=${encodeURIComponent(pathname)}`);
    }
    throw error;
  }
}
