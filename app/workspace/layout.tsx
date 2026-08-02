import { requireAuthorizedPage } from "@/lib/page-auth";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  await requireAuthorizedPage("/workspace", ["Executive", "Finance", "Legal", "Sales", "Trainer", "Marketing", "After Sales"]);
  return children;
}
