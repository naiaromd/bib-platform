import WorkspaceClient from "./WorkspaceClient";
import { requireAuthorizedPage } from "@/lib/page-auth";
import { loadCrmWorkspace } from "@/app/api/crm/workspace/query";

export const dynamic = "force-dynamic";

export default async function WorkspacePage() {
  const actor = await requireAuthorizedPage("/workspace", ["Executive", "Finance", "Legal", "Sales", "Trainer", "Marketing", "After Sales"]);
  try {
    const initialPayload = await loadCrmWorkspace(actor);
    return <WorkspaceClient initialPayload={initialPayload as Record<string, unknown>} />;
  } catch (error) {
    console.error("Workspace initial render failed", error);
    return <WorkspaceClient initialPayload={null} />;
  }
}
