import ReviewApp from "./ReviewApp";
import { requireAuthorizedPage } from "@/lib/page-auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await requireAuthorizedPage("/");
  return <ReviewApp />;
}
