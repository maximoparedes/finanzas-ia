import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { TransactionUpdateSchema } from "@/lib/validation";
import { computeDedupeHash } from "@/lib/dedupe";
import type { Transaction } from "@/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = TransactionUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const { data: existing } = await supabaseAdmin
    .from("transactions")
    .select("*")
    .eq("id", id)
    .eq("user_id", session.user.id)
    .maybeSingle<Transaction>();

  if (!existing) {
    return NextResponse.json({ error: "Transacción no encontrada" }, { status: 404 });
  }

  const updates: Record<string, unknown> = {};
  const { amount, description, category, date, paymentMethod, type, note } = parsed.data;

  if (amount !== undefined) updates.amount = amount;
  if (description !== undefined) updates.description = description;
  if (category !== undefined) {
    updates.category = category;
    updates.category_source = "manual";
    updates.category_confidence = null;
  }
  if (date !== undefined) updates.date = date;
  if (paymentMethod !== undefined) updates.payment_method = paymentMethod;
  if (type !== undefined) updates.type = type;
  if (note !== undefined) updates.note = note || null;

  const affectsHash = amount !== undefined || description !== undefined || date !== undefined || paymentMethod !== undefined;
  if (affectsHash) {
    updates.dedupe_hash = computeDedupeHash({
      date: date ?? existing.date,
      amount: amount ?? existing.amount,
      description: description ?? existing.description,
      paymentMethod: paymentMethod ?? existing.payment_method,
    });
  }

  const { data: transaction, error } = await supabaseAdmin
    .from("transactions")
    .update(updates)
    .eq("id", id)
    .eq("user_id", session.user.id)
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Ya existe una transacción igual (mismo monto, fecha y descripción)" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "No se pudo actualizar la transacción" }, { status: 500 });
  }

  return NextResponse.json({ transaction });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { id } = await params;

  const { error } = await supabaseAdmin
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", session.user.id);

  if (error) {
    return NextResponse.json({ error: "No se pudo eliminar la transacción" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
