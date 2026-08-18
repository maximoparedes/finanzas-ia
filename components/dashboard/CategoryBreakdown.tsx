import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import type { Transaction } from '@/types';

interface Props {
  transactions: Transaction[];
}

export function CategoryBreakdown({ transactions }: Props) {
  const totals = new Map<string, number>();
  for (const t of transactions) {
    totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount);
  }

  const rows = [...totals.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const max = rows[0]?.amount ?? 0;

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Por categoría</h2>
        <p className="text-sm text-slate-400">No hay gastos este mes.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5">
      <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Por categoría</h2>
      <div className="flex flex-col gap-3">
        {rows.map(({ category, amount }) => (
          <div key={category} className="flex items-center gap-3">
            <span className="w-6 text-center text-base shrink-0" aria-hidden>
              {CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]}
            </span>
            <span className="w-28 text-sm text-slate-600 dark:text-slate-400 shrink-0 truncate">{category}</span>
            <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${max > 0 ? (amount / max) * 100 : 0}%`,
                  backgroundColor: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS],
                }}
              />
            </div>
            <span className="w-24 text-right text-sm font-medium text-slate-700 dark:text-slate-300 tabular-nums shrink-0">
              {formatCurrency(amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
