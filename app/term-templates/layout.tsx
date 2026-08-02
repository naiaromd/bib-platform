import { requireAuthorizedPage } from "@/lib/page-auth";

export const dynamic = "force-dynamic";

export default async function TermTemplatesLayout({ children }: { children: React.ReactNode }) {
  await requireAuthorizedPage("/term-templates", ["Executive", "Finance", "Legal", "Sales"]);
  return children;
}
