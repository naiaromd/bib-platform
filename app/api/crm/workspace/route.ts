import { boundedLimit, crmErrorResponse, requireCrmActor } from "../_lib";
import { loadCrmWorkspace } from "./query";

export async function GET(request: Request) {
  try {
    const actor = await requireCrmActor(request);
    const url = new URL(request.url);
    const requestedAccount = (url.searchParams.get("accountId") || "").trim();
    if (requestedAccount && actor.accountScope !== "*" && requestedAccount !== actor.accountScope) {
      return Response.json({ error: "ไม่มีสิทธิ์เข้าถึงข้อมูลลูกค้านี้" }, { status: 403 });
    }
    const payload = await loadCrmWorkspace(actor, {
      limit: boundedLimit(url),
      accountId: requestedAccount,
      owner: url.searchParams.get("owner") || "",
      stage: url.searchParams.get("stage") || "",
      status: url.searchParams.get("status") || "",
      q: url.searchParams.get("q") || "",
    });
    return Response.json(payload, {
      headers: { "Cache-Control": "private, max-age=15, stale-while-revalidate=45" },
    });
  } catch (error) {
    return crmErrorResponse(error);
  }
}
