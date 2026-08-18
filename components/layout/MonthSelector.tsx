'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatMonthLabel, getCurrentMonth } from '@/lib/utils';
import { format, addMonths, subMonths } from 'date-fns';

interface Props {
  month: string;
  onChange: (month: string) => void;
}

export function MonthSelector({ month, onChange }: Props) {
  const goToPrev = () => {
    const [year, m] = month.split('-').map(Number);
    const prev = subMonths(new Date(year, m - 1, 1), 1);
    onChange(format(prev, 'yyyy-MM'));
  };

  const goToNext = () => {
    const [year, m] = month.split('-').map(Number);
    const next = addMonths(new Date(year, m - 1, 1), 1);
    const nextStr = format(next, 'yyyy-MM');
    if (nextStr <= getCurrentMonth()) {
      onChange(nextStr);
    }
  };

  const isCurrentMonth = month === getCurrentMonth();

  return (
    <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1.5">
      <button
        onClick={goToPrev}
        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
        aria-label="Mes anterior"
      >
        <ChevronLeft size={14} />
      </button>
      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 select-none capitalize px-1">
        {formatMonthLabel(month)}
      </span>
      <button
        onClick={goToNext}
        disabled={isCurrentMonth}
        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Mes siguiente"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
