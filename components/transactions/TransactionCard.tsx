'use client';

import { Pencil, Trash2, StickyNote, Sparkles, AlertCircle } from 'lucide-react';
import { CATEGORY_COLORS, CATEGORY_ICONS, PAYMENT_METHODS } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
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
    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-edge hover:border-edge-strong transition-all group">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
        style={{ backgroundColor: `${color}22` }}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <p className="text-sm font-medium text-fg truncate flex-1">{transaction.description}</p>
          {transaction.note && (
            <Tooltip label={transaction.note}>
              <span>
                <StickyNote size={12} className="text-fg-subtle shrink-0 mt-0.5" />
              </span>
            </Tooltip>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span
            className="text-xs font-medium px-1.5 py-0.5 rounded-md"
            style={{ color, backgroundColor: `${color}18` }}
          >
            {transaction.category}
          </span>
          <span className="text-xs text-fg-subtle">{format(parseISO(transaction.date), 'd MMM', { locale: es })}</span>
          <span className="text-xs text-fg-subtle">{paymentLabel}</span>
          {transaction.category_source === 'ai' && (
            <Badge
              variant="accent"
              title={`Categorizado por IA (${Math.round((transaction.category_confidence ?? 0) * 100)}% de confianza)`}
            >
              <Sparkles size={10} /> IA
            </Badge>
          )}
          {needsReview && (
            <Badge variant="warning">
              <AlertCircle size={10} /> revisar
            </Badge>
          )}
          {transaction.source === 'mercadopago' && <Badge variant="info">MP</Badge>}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-bold text-fg tabular-nums">{formatCurrency(transaction.amount)}</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(transaction)}
            className="p-1.5 rounded-lg hover:bg-surface-raised text-fg-subtle hover:text-accent transition-colors"
            title="Editar"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(transaction)}
            className="p-1.5 rounded-lg hover:bg-danger/10 text-fg-subtle hover:text-danger transition-colors"
            title="Eliminar"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
