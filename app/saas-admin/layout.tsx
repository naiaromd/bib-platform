import { requireAuthorizedPage } from "@/lib/page-auth";

export const dynamic = "force-dynamic";

export default async function SaasAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAuthorizedPage("/saas-admin", ["Executive"]);
  return children;
}
