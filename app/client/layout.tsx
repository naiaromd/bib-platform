import { requireAuthorizedPage } from "@/lib/page-auth";

export const dynamic = "force-dynamic";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  await requireAuthorizedPage("/client");
  return children;
}
