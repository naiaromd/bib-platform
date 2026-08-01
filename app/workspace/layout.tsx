import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { requirePageActor } from "@/lib/server-identity";

export const dynamic = "force-dynamic";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  await requireChatGPTUser("/workspace");
  await requirePageActor("/workspace");
  return children;
}
