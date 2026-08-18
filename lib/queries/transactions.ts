import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { Transaction } from "@/types";

export function monthRange(month: string): { desde: string; hasta: string } {
  const [anio, mesNum] = month.split("-").map(Number);
  const desde = `${month}-01`;
  const ultimoDia = new Date(anio, mesNum, 0).getDate();
  const hasta = `${month}-${String(ultimoDia).padStart(2, "0")}`;
  return { desde, hasta };
}

export async function getTransactionsForMonth(userId: string, month: string): Promise<Transaction[]> {
  const { desde, hasta } = monthRange(month);

  const { data } = await supabaseAdmin
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .gte("date", desde)
    .lte("date", hasta)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  return data ?? [];
}
