import { z } from "zod";
import { CATEGORIES, type Category, type PaymentMethod, type TransactionType } from "@/lib/types";

const categoryEnum = z.enum(CATEGORIES as [Category, ...Category[]]);
const paymentMethodEnum = z.enum(
  ["efectivo", "debito", "credito", "transferencia", "otro"] as [PaymentMethod, ...PaymentMethod[]]
);
const typeEnum = z.enum(["fijo", "variable"] as [TransactionType, ...TransactionType[]]);

export const TransactionSchema = z.object({
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  description: z.string().trim().min(1, "La descripción es obligatoria"),
  category: categoryEnum,
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida (YYYY-MM-DD)"),
  paymentMethod: paymentMethodEnum,
  type: typeEnum.default("variable"),
  note: z.string().trim().optional().or(z.literal("")),
});

export const TransactionUpdateSchema = TransactionSchema.partial();

export const BudgetSchema = z.object({
  month: z.string().trim().regex(/^\d{4}-\d{2}$/, "Mes inválido (YYYY-MM)"),
  category: categoryEnum.nullable().optional(),
  amount: z.coerce.number().positive("El presupuesto debe ser mayor a 0"),
});
