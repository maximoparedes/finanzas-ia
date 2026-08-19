'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { MonthSelector } from '@/components/layout/MonthSelector';
import { Progress } from '@/components/ui/progress';
import { CATEGORIES, CATEGORY_ICONS, type Category } from '@/lib/types';
import { cn, formatCurrency } from '@/lib/utils';
import type { MonthlyBudget, Transaction } from '@/types';

function toSpentByCategory(transactions: Transaction[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const t of transactions) totals[t.category] = (totals[t.category] ?? 0) + t.amount;
  return totals;
}

interface Props {
  initialMonth: string;
  initialBudgets: MonthlyBudget[];
  initialTransactions: Transaction[];
}

type AmountsState = { general: string } & Record<Category, string>;

function toAmountsState(budgets: MonthlyBudget[]): AmountsState {
  const state = { general: '' } as AmountsState;
  for (const cat of CATEGORIES) state[cat] = '';

  for (const b of budgets) {
    const value = String(b.amount);
    if (b.category === null) state.general = value;
    else state[b.category] = value;
  }
  return state;
}

export function BudgetsClient({ initialMonth, initialBudgets, initialTransactions }: Props) {
  const [month, setMonth] = useState(initialMonth);
  const [amounts, setAmounts] = useState<AmountsState>(toAmountsState(initialBudgets));
  const [spentByCategory, setSpentByCategory] = useState<Record<string, number>>(
    toSpentByCategory(initialTransactions),
  );
  const [saving, setSaving] = useState<string | null>(null);

  const fetchBudgets = async (targetMonth: string) => {
    const res = await fetch(`/api/budgets?mes=${targetMonth}`);
    const data = await res.json();
    setAmounts(toAmountsState(data.budgets ?? []));
  };

  const fetchSpent = async (targetMonth: string) => {
    const res = await fetch(`/api/transactions?mes=${targetMonth}`);
    const data = await res.json();
    setSpentByCategory(toSpentByCategory(data.transactions ?? []));
  };

  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth);
    fetchBudgets(newMonth);
    fetchSpent(newMonth);
  };

  const saveAmount = async (category: Category | null, key: string, rawValue: string) => {
    const value = Number(rawValue);
    if (!rawValue || !Number.isFinite(value) || value <= 0) return;

    setSaving(key);
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, category, amount: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? 'No se pudo guardar el presupuesto');
        return;
      }
      toast.success('Presupuesto guardado');
    } finally {
      setSaving(null);
    }
  };

  const totalSpent = Object.values(spentByCategory).reduce((sum, v) => sum + v, 0);

  const inputClass =
    'w-full px-3 py-2 rounded-lg text-sm bg-surface-raised border border-edge text-fg focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition-all tabular-nums';

  const progressColor = (spent: number, budget: number) => {
    if (budget <= 0) return 'bg-accent';
    const pct = (spent / budget) * 100;
    if (pct > 100) return 'bg-danger';
    if (pct > 80) return 'bg-warning';
    return 'bg-success';
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 max-w-2xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-fg">Presupuestos</h1>
        <MonthSelector month={month} onChange={handleMonthChange} />
      </div>

      <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
        <label className="block text-sm font-semibold text-fg mb-1.5">Presupuesto general del mes</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-fg-subtle font-medium">$</span>
          <input
            type="number"
            step="0.01"
            placeholder="0"
            value={amounts.general}
            onChange={(e) => setAmounts((prev) => ({ ...prev, general: e.target.value }))}
            onBlur={(e) => saveAmount(null, 'general', e.target.value)}
            className={cn(inputClass, 'pl-7', saving === 'general' && 'opacity-60')}
          />
        </div>
        {Number(amounts.general) > 0 && (
          <Progress
            value={(totalSpent / Number(amounts.general)) * 100}
            className="mt-2.5 h-1.5"
            colorClassName={progressColor(totalSpent, Number(amounts.general))}
          />
        )}
        <p className="text-xs text-fg-subtle mt-1.5">
          Usado por el dashboard predictivo para avisar si vas a quedar en rojo.
        </p>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-fg mb-2">Por categoría (opcional)</h2>
        <div className="flex flex-col gap-3">
          {CATEGORIES.map((cat) => {
            const budget = Number(amounts[cat]);
            const spent = spentByCategory[cat] ?? 0;
            return (
              <div key={cat} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-3">
                  <span className="w-8 text-center text-base shrink-0">{CATEGORY_ICONS[cat]}</span>
                  <span className="w-32 text-sm text-fg-muted shrink-0">{cat}</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-fg-subtle font-medium">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Sin definir"
                      value={amounts[cat]}
                      onChange={(e) => setAmounts((prev) => ({ ...prev, [cat]: e.target.value }))}
                      onBlur={(e) => saveAmount(cat, cat, e.target.value)}
                      className={cn(inputClass, 'pl-7', saving === cat && 'opacity-60')}
                    />
                  </div>
                </div>
                {budget > 0 && (
                  <div className="pl-11 flex items-center gap-2">
                    <Progress
                      value={(spent / budget) * 100}
                      className="h-1.5 flex-1"
                      colorClassName={progressColor(spent, budget)}
                    />
                    <span className="text-xs text-fg-subtle tabular-nums shrink-0">{formatCurrency(spent)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
