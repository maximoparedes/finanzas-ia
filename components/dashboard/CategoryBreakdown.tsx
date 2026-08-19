import { motion } from 'motion/react';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { CategoryChip } from '@/components/ui/badge';
import { staggerContainer, listItem } from '@/lib/motion';
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
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-fg mb-1">Por categoría</h2>
        <p className="text-sm text-fg-subtle">No hay gastos este mes.</p>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-fg mb-4">Por categoría</h2>
      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col gap-3">
        {rows.map(({ category, amount }) => {
          const color = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS];
          return (
            <motion.div variants={listItem} key={category} className="flex items-center gap-3">
              <div className="w-32 shrink-0">
                <CategoryChip
                  label={category}
                  icon={CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]}
                  color={color}
                />
              </div>
              <div className="flex-1 h-2 rounded-full bg-surface-raised overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${max > 0 ? (amount / max) * 100 : 0}%` }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <span className="w-24 text-right text-sm font-medium text-fg tabular-nums shrink-0">
                {formatCurrency(amount)}
              </span>
            </motion.div>
          );
        })}
      </motion.div>
    </Card>
  );
}
