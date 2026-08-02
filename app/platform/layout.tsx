import { requireAuthorizedPage } from "@/lib/page-auth";

export const dynamic = "force-dynamic";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  await requireAuthorizedPage("/platform", ["Executive", "Finance", "Legal", "Sales", "Trainer", "Marketing", "After Sales"]);
  return children;
}
