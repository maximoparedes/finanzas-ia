import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { monthRange } from "@/lib/queries/transactions";
import { formatCurrency, formatMonthLabel } from "@/lib/utils";
import type { MonthlyBudget, Transaction, Usuario } from "@/types";

const THRESHOLDS = [100, 80] as const;

interface BudgetAlert {
  category: string | null;
  categoryLabel: string;
  spent: number;
  budget: number;
  pct: number;
  threshold: number;
}

interface AlertsResult {
  alerts: BudgetAlert[];
  toLog: { category: string | null; threshold: number }[];
}

function computeNewAlerts(
  budgets: MonthlyBudget[],
  transactions: Transaction[],
  alreadyLogged: Set<string>
): AlertsResult {
  const alerts: BudgetAlert[] = [];
  const toLog: { category: string | null; threshold: number }[] = [];

  for (const budget of budgets) {
    const relevant =
      budget.category === null ? transactions : transactions.filter((t) => t.category === budget.category);
    const spent = relevant.reduce((sum, t) => sum + t.amount, 0);
    const pct = (spent / budget.amount) * 100;

    // THRESHOLDS está en orden descendente: el primero que se cruza es el más alto.
    const maxCrossed = THRESHOLDS.find((t) => pct >= t);
    if (maxCrossed === undefined) continue;

    const key = `${budget.category ?? "general"}:${maxCrossed}`;
    if (!alreadyLogged.has(key)) {
      alerts.push({
        category: budget.category,
        categoryLabel: budget.category ?? "General",
        spent,
        budget: budget.amount,
        pct,
        threshold: maxCrossed,
      });
    }

    // Registrar como enviados todos los umbrales <= al cruzado (el 100% implica el 80%),
    // así un umbral más bajo no dispara un alerta redundante en una corrida futura.
    for (const threshold of THRESHOLDS) {
      if (threshold <= maxCrossed && !alreadyLogged.has(`${budget.category ?? "general"}:${threshold}`)) {
        toLog.push({ category: budget.category, threshold });
      }
    }
  }

  return { alerts, toLog };
}

function buildEmailHtml(month: string, alerts: BudgetAlert[]): string {
  const rows = alerts
    .map(
      (a) => `
        <tr>
          <td style="padding:8px 0;color:#1e293b;">${a.categoryLabel}</td>
          <td style="padding:8px 0;text-align:right;color:#1e293b;">${formatCurrency(a.spent)} / ${formatCurrency(a.budget)}</td>
          <td style="padding:8px 0;text-align:right;font-weight:600;color:${a.threshold >= 100 ? "#dc2626" : "#d97706"};">${Math.round(a.pct)}%</td>
        </tr>`
    )
    .join("");

  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
      <h2 style="color:#1e293b;">Alerta de presupuesto — ${formatMonthLabel(month)}</h2>
      <p style="color:#475569;">Estos son los presupuestos que acabás de alcanzar o superar:</p>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="border-bottom:1px solid #e2e8f0;text-align:left;">
            <th style="padding:8px 0;color:#64748b;font-size:12px;">Categoría</th>
            <th style="padding:8px 0;color:#64748b;font-size:12px;text-align:right;">Gastado</th>
            <th style="padding:8px 0;color:#64748b;font-size:12px;text-align:right;">%</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="color:#94a3b8;font-size:12px;margin-top:24px;">finanzas-ia</p>
    </div>`;
}

export async function checkAndSendBudgetAlerts(month: string): Promise<{ usersNotified: number }> {
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data: usuarios } = await supabaseAdmin.from("usuarios").select("*").returns<Usuario[]>();

  let usersNotified = 0;

  for (const usuario of usuarios ?? []) {
    const [{ data: budgets }, { data: transactions }, { data: logged }] = await Promise.all([
      supabaseAdmin
        .from("monthly_budgets")
        .select("*")
        .eq("user_id", usuario.id)
        .eq("month", month)
        .returns<MonthlyBudget[]>(),
      supabaseAdmin
        .from("transactions")
        .select("*")
        .eq("user_id", usuario.id)
        .gte("date", monthRange(month).desde)
        .lte("date", monthRange(month).hasta)
        .returns<Transaction[]>(),
      supabaseAdmin
        .from("budget_alerts_log")
        .select("category, threshold_pct")
        .eq("user_id", usuario.id)
        .eq("month", month)
        .eq("channel", "email")
        .returns<{ category: string | null; threshold_pct: number }[]>(),
    ]);

    const alreadyLogged = new Set((logged ?? []).map((l) => `${l.category ?? "general"}:${l.threshold_pct}`));
    const { alerts, toLog } = computeNewAlerts(budgets ?? [], transactions ?? [], alreadyLogged);

    if (toLog.length > 0) {
      await supabaseAdmin.from("budget_alerts_log").insert(
        toLog.map((l) => ({
          user_id: usuario.id,
          month,
          category: l.category,
          threshold_pct: l.threshold,
          channel: "email",
        }))
      );
    }

    if (alerts.length === 0) continue;

    await resend.emails.send({
      from: "finanzas-ia <onboarding@resend.dev>",
      to: usuario.email,
      subject: `Alerta de presupuesto — ${formatMonthLabel(month)}`,
      html: buildEmailHtml(month, alerts),
    });

    usersNotified += 1;
  }

  return { usersNotified };
}
