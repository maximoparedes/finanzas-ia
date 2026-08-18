import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { TransactionSchema } from "@/lib/validation";
import { computeDedupeHash } from "@/lib/dedupe";
import { monthRange } from "@/lib/queries/transactions";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const mes = searchParams.get("mes"); // "YYYY-MM"
  const soloParaRevisar = searchParams.get("review") === "true";

  let query = supabaseAdmin
    .from("transactions")
    .select("*")
    .eq("user_id", session.user.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (mes && /^\d{4}-\d{2}$/.test(mes)) {
    const { desde, hasta } = monthRange(mes);
    query = query.gte("date", desde).lte("date", hasta);
  }

  if (soloParaRevisar) {
    query = query.eq("category_source", "ai_low_confidence");
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: "No se pudieron obtener las transacciones" },
      { status: 500 }
    );
  }

  return NextResponse.json({ transactions: data });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = TransactionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const { amount, description, category, date, paymentMethod, type, note } = parsed.data;
  const userId = session.user.id;

  const dedupeHash = computeDedupeHash({ date, amount, description, paymentMethod });

  const { data: transaction, error } = await supabaseAdmin
    .from("transactions")
    .insert({
      user_id: userId,
      amount,
      description,
      category,
      date,
      payment_method: paymentMethod,
      type,
      note: note || null,
      source: "manual",
      category_source: "manual",
      dedupe_hash: dedupeHash,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Ya existe una transacción igual (mismo monto, fecha y descripción)" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "No se pudo crear la transacción" },
      { status: 500 }
    );
  }

  return NextResponse.json({ transaction }, { status: 201 });
}
