import { requireAuthorizedPage } from "@/lib/page-auth";

export const dynamic = "force-dynamic";

export default async function LinnaLayout({ children }: { children: React.ReactNode }) {
  await requireAuthorizedPage("/linna");
  return children;
}
