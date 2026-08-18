'use client';

import { AlertTriangle, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { Transaction } from '@/types';

interface Props {
  transaction: Transaction;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirm({ transaction, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-rose-500/10">
            <AlertTriangle size={18} className="text-rose-500" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Eliminar transacción</h3>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">¿Querés eliminar esta transacción?</p>
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2.5 mb-5">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{transaction.description}</p>
          <p className="text-sm font-bold text-rose-500 mt-0.5">{formatCurrency(transaction.amount)}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white transition-colors"
          >
            <Trash2 size={14} />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
