import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { BudgetSchema } from "@/lib/validation";
import type { MonthlyBudget } from "@/types";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const mes = searchParams.get("mes"); // "YYYY-MM"

  if (!mes || !/^\d{4}-\d{2}$/.test(mes)) {
    return NextResponse.json({ error: "Falta el parámetro mes (YYYY-MM)" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("monthly_budgets")
    .select("*")
    .eq("user_id", session.user.id)
    .eq("month", mes);

  if (error) {
    return NextResponse.json({ error: "No se pudieron obtener los presupuestos" }, { status: 500 });
  }

  return NextResponse.json({ budgets: data });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = BudgetSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const { month, amount } = parsed.data;
  const category = parsed.data.category ?? null;
  const userId = session.user.id;

  let existingQuery = supabaseAdmin
    .from("monthly_budgets")
    .select("*")
    .eq("user_id", userId)
    .eq("month", month);

  existingQuery = category === null ? existingQuery.is("category", null) : existingQuery.eq("category", category);

  const { data: existing } = await existingQuery.maybeSingle<MonthlyBudget>();

  if (existing) {
    const { data: budget, error } = await supabaseAdmin
      .from("monthly_budgets")
      .update({ amount })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: "No se pudo actualizar el presupuesto" }, { status: 500 });
    }
    return NextResponse.json({ budget });
  }

  const { data: budget, error } = await supabaseAdmin
    .from("monthly_budgets")
    .insert({ user_id: userId, month, category, amount })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: "No se pudo crear el presupuesto" }, { status: 500 });
  }

  return NextResponse.json({ budget }, { status: 201 });
}
