import Anthropic from "@anthropic-ai/sdk";
import { formatCurrency, formatMonthLabel } from "@/lib/utils";
import type { Transaction, MonthlyBudget } from "@/types";

export const client = new Anthropic();

export const CHAT_MODEL = "claude-sonnet-5";

export function buildFinancialContext(
  month: string,
  transactions: Transaction[],
  budgets: MonthlyBudget[]
): string {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  const presupuestoGeneral = budgets.find((b) => b.category === null)?.amount ?? null;

  const porCategoria = new Map<string, number>();
  for (const t of transactions) {
    porCategoria.set(t.category, (porCategoria.get(t.category) ?? 0) + t.amount);
  }
  const desglose = [...porCategoria.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([cat, amount]) => {
      const presupuestoCat = budgets.find((b) => b.category === cat)?.amount;
      const presupuestoTxt = presupuestoCat ? ` (presupuesto: ${formatCurrency(presupuestoCat)})` : "";
      return `- ${cat}: ${formatCurrency(amount)}${presupuestoTxt}`;
    })
    .join("\n");

  return `Datos financieros del usuario para ${formatMonthLabel(month)}:
Total gastado: ${formatCurrency(total)}
Presupuesto general del mes: ${presupuestoGeneral !== null ? formatCurrency(presupuestoGeneral) : "sin definir"}
Gasto por categoría:
${desglose || "(sin transacciones registradas este mes)"}`;
}

export function buildSystemPrompt(financialContext: string): string {
  return `Sos el asistente financiero personal de finanzas-ia, una app de gestión de gastos. Ayudás al usuario a entender sus gastos, cumplir su presupuesto y tomar mejores decisiones financieras.

${financialContext}

Respondé en español rioplatense, con cifras en pesos argentinos. Sé concreto y anclá tus respuestas en los datos de arriba cuando sean relevantes. Si el usuario pregunta algo fuera de lo financiero, respondé brevemente y llevalo de vuelta al tema.`;
}
