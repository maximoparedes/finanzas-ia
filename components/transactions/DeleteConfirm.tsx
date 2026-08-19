'use client';

import { AlertTriangle, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Transaction } from '@/types';

interface Props {
  transaction: Transaction;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirm({ transaction, onConfirm, onCancel }: Props) {
  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent variant="centered">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-danger/10">
            <AlertTriangle size={18} className="text-danger" />
          </div>
          <h3 className="text-base font-semibold text-fg">Eliminar transacción</h3>
        </div>

        <p className="text-sm text-fg-muted mb-2">¿Querés eliminar esta transacción?</p>
        <div className="bg-surface-raised rounded-lg px-3 py-2.5 mb-5">
          <p className="text-sm font-medium text-fg">{transaction.description}</p>
          <p className="text-sm font-bold text-danger mt-0.5">{formatCurrency(transaction.amount)}</p>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm}>
            <Trash2 size={14} />
            Eliminar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
