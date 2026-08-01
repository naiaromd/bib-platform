import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { requirePageActor } from "@/lib/server-identity";

export const dynamic = "force-dynamic";

export default async function TherapistLayout({ children }: { children: React.ReactNode }) {
  await requireChatGPTUser("/therapist");
  await requirePageActor("/therapist");
  return children;
}
