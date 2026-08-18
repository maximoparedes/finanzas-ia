'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { MonthSelector } from '@/components/layout/MonthSelector';
import { TransactionCard } from '@/components/transactions/TransactionCard';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { DeleteConfirm } from '@/components/transactions/DeleteConfirm';
import { ImportUpload } from '@/components/transactions/ImportUpload';
import { formatCurrency } from '@/lib/utils';
import type { Transaction } from '@/types';

interface Props {
  initialMonth: string;
  initialTransactions: Transaction[];
}

export function TransactionsClient({ initialMonth, initialTransactions }: Props) {
  const [month, setMonth] = useState(initialMonth);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | undefined>(undefined);
  const [deleting, setDeleting] = useState<Transaction | undefined>(undefined);

  const fetchTransactions = async (targetMonth: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions?mes=${targetMonth}`);
      const data = await res.json();
      setTransactions(data.transactions ?? []);
    } catch {
      toast.error('No se pudieron cargar las transacciones');
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth);
    fetchTransactions(newMonth);
  };

  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  const handleSave = async (data: {
    amount: number;
    description: string;
    category: Transaction['category'];
    date: string;
    paymentMethod: Transaction['payment_method'];
    type: Transaction['type'];
    note?: string;
  }) => {
    const isEditing = Boolean(editing);
    const url = isEditing ? `/api/transactions/${editing!.id}` : '/api/transactions';
    const res = await fetch(url, {
      method: isEditing ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();

    if (!res.ok) {
      toast.error(result.error ?? 'No se pudo guardar la transacción');
      return;
    }

    toast.success(isEditing ? 'Transacción actualizada' : 'Transacción agregada');
    setFormOpen(false);
    setEditing(undefined);
    fetchTransactions(month);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const res = await fetch(`/api/transactions/${deleting.id}`, { method: 'DELETE' });
    if (!res.ok) {
      toast.error('No se pudo eliminar la transacción');
      return;
    }
    toast.success('Transacción eliminada');
    setDeleting(undefined);
    fetchTransactions(month);
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Transacciones</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total del mes: <span className="font-semibold">{formatCurrency(total)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <MonthSelector month={month} onChange={handleMonthChange} />
          <ImportUpload onImported={() => fetchTransactions(month)} />
          <button
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
            className="flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold bg-violet-500 hover:bg-violet-600 text-white transition-colors"
          >
            <Plus size={14} />
            Nueva transacción
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {loading && <p className="text-sm text-slate-400">Cargando...</p>}
        {!loading && transactions.length === 0 && (
          <p className="text-sm text-slate-400">No hay transacciones este mes.</p>
        )}
        {transactions.map((t) => (
          <TransactionCard
            key={t.id}
            transaction={t}
            onEdit={(tx) => {
              setEditing(tx);
              setFormOpen(true);
            }}
            onDelete={setDeleting}
          />
        ))}
      </div>

      {formOpen && (
        <TransactionForm
          transaction={editing}
          onSave={handleSave}
          onClose={() => {
            setFormOpen(false);
            setEditing(undefined);
          }}
        />
      )}

      {deleting && (
        <DeleteConfirm transaction={deleting} onConfirm={handleDelete} onCancel={() => setDeleting(undefined)} />
      )}
    </div>
  );
}
