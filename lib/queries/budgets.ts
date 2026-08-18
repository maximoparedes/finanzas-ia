import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { MonthlyBudget } from "@/types";

export async function getBudgetsForMonth(userId: string, month: string): Promise<MonthlyBudget[]> {
  const { data } = await supabaseAdmin
    .from("monthly_budgets")
    .select("*")
    .eq("user_id", userId)
    .eq("month", month);

  return data ?? [];
}
