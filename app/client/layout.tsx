import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { requirePageActor } from "@/lib/server-identity";

export const dynamic = "force-dynamic";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  await requireChatGPTUser("/client");
  const actor = await requirePageActor("/client");
  if (actor.role === "Customer" && actor.accountScope !== "linna") {
    return <main style={{ padding: "48px", fontFamily: "Kanit, sans-serif" }}><h1>ยังไม่มีสิทธิ์เข้าถึงข้อมูลลูกค้ารายนี้</h1><p>กรุณาติดต่อผู้ดูแล BIB เพื่อกำหนดบัญชีลูกค้าให้ถูกต้อง</p></main>;
  }
  return children;
}
