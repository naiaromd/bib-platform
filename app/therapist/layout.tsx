import { requireChatGPTUser } from "@/app/chatgpt-auth";

export const dynamic = "force-dynamic";

export default async function TherapistLayout({ children }: { children: React.ReactNode }) {
  await requireChatGPTUser("/therapist");
  return children;
}
