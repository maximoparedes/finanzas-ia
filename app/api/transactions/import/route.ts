import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { parseMercadoPagoExport } from "@/lib/import/mp-parser";
import { categorizeTransaction } from "@/lib/ai/categorize";
import type { CategorySource } from "@/lib/types";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });
  }

  const allowedExtensions = [".xlsx", ".csv"];
  const hasValidExtension = allowedExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
  if (!hasValidExtension) {
    return NextResponse.json({ error: "El archivo debe ser .xlsx o .csv" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let parsed;
  try {
    parsed = await parseMercadoPagoExport(buffer, file.name);
  } catch (err) {
    const message = err instanceof Error ? err.message : "No se pudo leer el archivo";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (parsed.rows.length === 0) {
    return NextResponse.json({
      inserted: 0,
      duplicates: 0,
      skipped: parsed.skipped,
      totalRows: parsed.totalRows,
    });
  }

  const userId = session.user.id;
  const toInsert = await Promise.all(
    parsed.rows.map(async (row) => {
      const categorization = await categorizeTransaction(row.description);
      const categorySource: CategorySource = !categorization
        ? "manual"
        : categorization.confidence === "alta"
          ? "ai"
          : "ai_low_confidence";
      return {
        user_id: userId,
        amount: row.amount,
        description: row.description,
        category: categorization?.category ?? "Otros",
        date: row.date,
        payment_method: row.paymentMethod,
        type: "variable" as const,
        source: "mercadopago" as const,
        category_source: categorySource,
        dedupe_hash: row.dedupeHash,
      };
    })
  );

  const { data, error } = await supabaseAdmin
    .from("transactions")
    .upsert(toInsert, { onConflict: "user_id,dedupe_hash", ignoreDuplicates: true })
    .select("id");

  if (error) {
    return NextResponse.json({ error: "No se pudieron importar las transacciones" }, { status: 500 });
  }

  const inserted = data?.length ?? 0;
  const duplicates = toInsert.length - inserted;

  return NextResponse.json({
    inserted,
    duplicates,
    skipped: parsed.skipped,
    totalRows: parsed.totalRows,
  });
}
