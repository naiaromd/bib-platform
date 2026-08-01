import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { requirePageActor } from "@/lib/server-identity";

export const dynamic = "force-dynamic";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  await requireChatGPTUser("/platform");
  await requirePageActor("/platform");
  return children;
}
