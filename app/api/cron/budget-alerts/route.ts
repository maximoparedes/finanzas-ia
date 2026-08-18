import { NextResponse } from "next/server";
import { checkAndSendBudgetAlerts } from "@/lib/alerts/budget";
import { getCurrentMonth } from "@/lib/utils";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const result = await checkAndSendBudgetAlerts(getCurrentMonth());
  return NextResponse.json({ ok: true, ...result });
}
