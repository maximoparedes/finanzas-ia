'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { CircleCheck, TriangleAlert, CircleAlert, TrendingUp } from 'lucide-react';
import { MonthSelector } from '@/components/layout/MonthSelector';
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown';
import { SpendingChart } from '@/components/dashboard/SpendingChart';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fadeInUp, staggerContainer } from '@/lib/motion';
import { cn, formatCurrency, getCurrentMonth, daysInMonth } from '@/lib/utils';
import type { Transaction, MonthlyBudget } from '@/types';

interface Props {
  nombre: string;
  initialMonth: string;
  initialTransactions: Transaction[];
  initialBudgets: MonthlyBudget[];
}

type Estado = 'sin-presupuesto' | 'bien' | 'atencion' | 'excedido';

const ESTADO_INFO: Record<
  Exclude<Estado, 'sin-presupuesto'>,
  { label: string; variant: 'success' | 'warning' | 'danger'; Icon: typeof CircleCheck }
> = {
  bien: { label: 'Vas bien', variant: 'success', Icon: CircleCheck },
  atencion: { label: 'Vas a pasarte', variant: 'warning', Icon: TriangleAlert },
  excedido: { label: 'Te pasaste', variant: 'danger', Icon: CircleAlert },
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

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-fg">Hola, {nombre}</h1>
        <MonthSelector month={month} onChange={handleMonthChange} />
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className={cn('grid grid-cols-1 sm:grid-cols-3 gap-4', loading && 'opacity-60 transition-opacity')}
      >
        <motion.div variants={fadeInUp}>
          <Card className="p-5">
            <p className="text-xs font-medium text-fg-subtle mb-1.5">Gastado este mes</p>
            <p className="text-3xl font-semibold text-fg tabular-nums tracking-tight">{formatCurrency(total)}</p>
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card className="p-5">
            <p className="text-xs font-medium text-fg-subtle mb-1.5">Presupuesto general</p>
            {presupuestoGeneral !== null ? (
              <p className="text-3xl font-semibold text-fg tabular-nums tracking-tight">
                {formatCurrency(presupuestoGeneral)}
              </p>
            ) : (
              <Link href="/presupuestos" className="text-sm text-accent hover:underline">
                Definir presupuesto
              </Link>
            )}
          </Card>
        </motion.div>

        <motion.div variants={fadeInUp}>
          <Card className="p-5">
            <p className="text-xs font-medium text-fg-subtle mb-1.5 flex items-center gap-1.5">
              <TrendingUp size={12} aria-hidden />
              Proyección fin de mes
            </p>
            <p className="text-3xl font-semibold text-fg tabular-nums tracking-tight">{formatCurrency(proyeccion)}</p>
            {estado !== 'sin-presupuesto' && (
              <Badge variant={ESTADO_INFO[estado].variant} className="mt-2">
                {(() => {
                  const Icon = ESTADO_INFO[estado].Icon;
                  return <Icon size={12} aria-hidden />;
                })()}
                {ESTADO_INFO[estado].label}
              </Badge>
            )}
          </Card>
        </motion.div>
      </motion.div>

      <SpendingChart month={month} transactions={transactions} presupuestoGeneral={presupuestoGeneral} hastaHoy={hastaHoy} />

      <CategoryBreakdown transactions={transactions} />
    </div>
  );
}
