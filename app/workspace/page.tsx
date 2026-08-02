import WorkspaceClient from "./WorkspaceClient";
import { requirePageActor } from "@/lib/server-identity";
import { loadCrmWorkspace } from "@/app/api/crm/workspace/query";

export const dynamic = "force-dynamic";

export default async function WorkspacePage() {
  const actor = await requirePageActor("/workspace");
  const initialPayload = await loadCrmWorkspace(actor);
  return <WorkspaceClient initialPayload={initialPayload as Record<string, unknown>} />;
}
