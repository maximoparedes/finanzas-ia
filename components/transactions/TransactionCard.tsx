'use client';

import { Pencil, Trash2, StickyNote, Sparkles, AlertCircle } from 'lucide-react';
import { CATEGORY_COLORS, CATEGORY_ICONS, PAYMENT_METHODS } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import type { Transaction } from '@/types';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export function TransactionCard({ transaction, onEdit, onDelete }: Props) {
  const color = CATEGORY_COLORS[transaction.category];
  const icon = CATEGORY_ICONS[transaction.category];
  const paymentLabel =
    PAYMENT_METHODS.find((m) => m.value === transaction.payment_method)?.label ?? transaction.payment_method;
  const needsReview = transaction.category_source === 'ai_low_confidence';

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all group">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
        style={{ backgroundColor: `${color}22` }}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate flex-1">
            {transaction.description}
          </p>
          {transaction.note && (
            <span title={transaction.note}>
              <StickyNote size={12} className="text-slate-400 shrink-0 mt-0.5" />
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span
            className="text-xs font-medium px-1.5 py-0.5 rounded-md"
            style={{ color, backgroundColor: `${color}18` }}
          >
            {transaction.category}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {format(parseISO(transaction.date), 'd MMM', { locale: es })}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">{paymentLabel}</span>
          {transaction.category_source === 'ai' && (
            <span
              className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-md bg-violet-500/10 text-violet-500"
              title={`Categorizado por IA (${Math.round((transaction.category_confidence ?? 0) * 100)}% de confianza)`}
            >
              <Sparkles size={10} /> IA
            </span>
          )}
          {needsReview && (
            <span className="flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertCircle size={10} /> revisar
            </span>
          )}
          {transaction.source === 'mercadopago' && (
            <span className="text-xs px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400">MP</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 tabular-nums">
          {formatCurrency(transaction.amount)}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(transaction)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-violet-500 transition-colors"
            title="Editar"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(transaction)}
            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors"
            title="Eliminar"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
