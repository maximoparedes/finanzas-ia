'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { MonthSelector } from '@/components/layout/MonthSelector';
import { CATEGORIES, CATEGORY_ICONS, type Category } from '@/lib/types';
import { cn } from '@/lib/utils';
import type { MonthlyBudget } from '@/types';

interface Props {
  initialMonth: string;
  initialBudgets: MonthlyBudget[];
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

export function BudgetsClient({ initialMonth, initialBudgets }: Props) {
  const [month, setMonth] = useState(initialMonth);
  const [amounts, setAmounts] = useState<AmountsState>(toAmountsState(initialBudgets));
  const [saving, setSaving] = useState<string | null>(null);

  const fetchBudgets = async (targetMonth: string) => {
    const res = await fetch(`/api/budgets?mes=${targetMonth}`);
    const data = await res.json();
    setAmounts(toAmountsState(data.budgets ?? []));
  };

  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth);
    fetchBudgets(newMonth);
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

  const inputClass =
    'w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition-all tabular-nums';

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 max-w-2xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Presupuestos</h1>
        <MonthSelector month={month} onChange={handleMonthChange} />
      </div>

      <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4">
        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
          Presupuesto general del mes
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">$</span>
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
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
          Usado por el dashboard predictivo para avisar si vas a quedar en rojo.
        </p>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Por categoría (opcional)</h2>
        <div className="flex flex-col gap-2">
          {CATEGORIES.map((cat) => (
            <div key={cat} className="flex items-center gap-3">
              <span className="w-8 text-center text-base shrink-0">{CATEGORY_ICONS[cat]}</span>
              <span className="w-32 text-sm text-slate-600 dark:text-slate-400 shrink-0">{cat}</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">
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
          ))}
        </div>
      </div>
    </div>
  );
}
