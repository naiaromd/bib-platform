import { requireAuthorizedPage } from "@/lib/page-auth";

export const dynamic = "force-dynamic";

export default async function TherapistLayout({ children }: { children: React.ReactNode }) {
  await requireAuthorizedPage("/therapist", ["Executive", "Trainer", "Therapist", "Customer"]);
  return children;
}
