'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CircleCheck, TriangleAlert, CircleAlert, TrendingUp } from 'lucide-react';
import { MonthSelector } from '@/components/layout/MonthSelector';
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown';
import { SpendingChart } from '@/components/dashboard/SpendingChart';
import { cn, formatCurrency, getCurrentMonth, daysInMonth } from '@/lib/utils';
import type { Transaction, MonthlyBudget } from '@/types';

interface Props {
  nombre: string;
  initialMonth: string;
  initialTransactions: Transaction[];
  initialBudgets: MonthlyBudget[];
}

type Estado = 'sin-presupuesto' | 'bien' | 'atencion' | 'excedido';

const ESTADO_INFO: Record<Exclude<Estado, 'sin-presupuesto'>, { label: string; className: string; Icon: typeof CircleCheck }> = {
  bien: { label: 'Vas bien', className: 'text-emerald-600 dark:text-emerald-400', Icon: CircleCheck },
  atencion: { label: 'Vas a pasarte', className: 'text-amber-600 dark:text-amber-400', Icon: TriangleAlert },
  excedido: { label: 'Te pasaste', className: 'text-red-600 dark:text-red-400', Icon: CircleAlert },
};

export function DashboardClient({ nombre, initialMonth, initialTransactions, initialBudgets }: Props) {
  const [month, setMonth] = useState(initialMonth);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [budgets, setBudgets] = useState<MonthlyBudget[]>(initialBudgets);
  const [loading, setLoading] = useState(false);

  const handleMonthChange = async (newMonth: string) => {
    setMonth(newMonth);
    setLoading(true);
    try {
      const [transRes, budgetRes] = await Promise.all([
        fetch(`/api/transactions?mes=${newMonth}`),
        fetch(`/api/budgets?mes=${newMonth}`),
      ]);
      const transData = await transRes.json();
      const budgetData = await budgetRes.json();
      setTransactions(transData.transactions ?? []);
      setBudgets(budgetData.budgets ?? []);
    } finally {
      setLoading(false);
    }
  };

  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  const presupuestoGeneral = budgets.find((b) => b.category === null)?.amount ?? null;

  const esMesActual = month === getCurrentMonth();
  const hastaHoy = esMesActual ? new Date().getDate() : null;
  const totalDias = daysInMonth(month);
  const diasTranscurridos = esMesActual ? Math.max(hastaHoy!, 1) : totalDias;
  const proyeccion = (total / diasTranscurridos) * totalDias;

  let estado: Estado = 'sin-presupuesto';
  if (presupuestoGeneral !== null) {
    if (total > presupuestoGeneral) estado = 'excedido';
    else if (proyeccion > presupuestoGeneral) estado = 'atencion';
    else estado = 'bien';
  }
  const EstadoIcon = estado !== 'sin-presupuesto' ? ESTADO_INFO[estado].Icon : null;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Hola, {nombre}</h1>
        <MonthSelector month={month} onChange={handleMonthChange} />
      </div>

      <div className={cn('grid grid-cols-1 sm:grid-cols-3 gap-4', loading && 'opacity-60')}>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Gastado este mes</p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {formatCurrency(total)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Presupuesto general</p>
          {presupuestoGeneral !== null ? (
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
              {formatCurrency(presupuestoGeneral)}
            </p>
          ) : (
            <Link href="/presupuestos" className="text-sm text-violet-600 dark:text-violet-400 hover:underline">
              Definir presupuesto
            </Link>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
            <TrendingUp size={12} aria-hidden />
            Proyección fin de mes
          </p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {formatCurrency(proyeccion)}
          </p>
          {estado !== 'sin-presupuesto' && EstadoIcon && (
            <p className={cn('text-xs font-medium mt-1 flex items-center gap-1', ESTADO_INFO[estado].className)}>
              <EstadoIcon size={12} aria-hidden />
              {ESTADO_INFO[estado].label}
            </p>
          )}
        </div>
      </div>

      <SpendingChart
        month={month}
        transactions={transactions}
        presupuestoGeneral={presupuestoGeneral}
        hastaHoy={hastaHoy}
      />

      <CategoryBreakdown transactions={transactions} />
    </div>
  );
}
