'use client';

import { useState } from 'react';
import { Plus, Sparkles, PartyPopper, Inbox } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { MonthSelector } from '@/components/layout/MonthSelector';
import { TransactionCard } from '@/components/transactions/TransactionCard';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { DeleteConfirm } from '@/components/transactions/DeleteConfirm';
import { ImportUpload } from '@/components/transactions/ImportUpload';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { staggerContainer, listItem } from '@/lib/motion';
import { cn, formatCurrency } from '@/lib/utils';
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
  const [reviewOnly, setReviewOnly] = useState(false);
  const [reviewCount, setReviewCount] = useState(
    initialTransactions.filter((t) => t.category_source === 'ai_low_confidence').length
  );

  const fetchTransactions = async (targetMonth: string, onlyReview = reviewOnly) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ mes: targetMonth });
      if (onlyReview) params.set('review', 'true');
      const res = await fetch(`/api/transactions?${params}`);
      const data = await res.json();
      const fetched: Transaction[] = data.transactions ?? [];
      setTransactions(fetched);
      if (onlyReview) {
        setReviewCount(fetched.length);
      } else {
        setReviewCount(fetched.filter((t) => t.category_source === 'ai_low_confidence').length);
      }
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

  const toggleReviewOnly = () => {
    const next = !reviewOnly;
    setReviewOnly(next);
    fetchTransactions(month, next);
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
          <h1 className="text-xl font-semibold text-fg">Transacciones</h1>
          <p className="text-sm text-fg-muted">
            Total del mes: <span className="font-semibold text-fg">{formatCurrency(total)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <MonthSelector month={month} onChange={handleMonthChange} />
          {(reviewCount > 0 || reviewOnly) && (
            <Button
              variant={reviewOnly ? 'primary' : 'secondary'}
              size="md"
              onClick={toggleReviewOnly}
              className={cn(!reviewOnly && 'bg-warning/10 text-warning border-transparent hover:bg-warning/20', reviewOnly && 'bg-warning hover:bg-warning/90')}
            >
              <Sparkles size={14} />
              Revisar ({reviewCount})
            </Button>
          )}
          <ImportUpload onImported={() => fetchTransactions(month)} />
          <Button
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
          >
            <Plus size={14} />
            Nueva transacción
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {loading && (
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[70px] w-full" />
            ))}
          </>
        )}
        {!loading && transactions.length === 0 && reviewOnly && (
          <div className="flex flex-col items-center gap-2 py-16 text-fg-subtle">
            <PartyPopper size={28} />
            <p className="text-sm">No hay transacciones para revisar.</p>
          </div>
        )}
        {!loading && transactions.length === 0 && !reviewOnly && (
          <div className="flex flex-col items-center gap-2 py-16 text-fg-subtle">
            <Inbox size={28} />
            <p className="text-sm">No hay transacciones este mes.</p>
          </div>
        )}
        {!loading && transactions.length > 0 && (
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col gap-2">
            {transactions.map((t) => (
              <motion.div variants={listItem} key={t.id}>
                <TransactionCard
                  transaction={t}
                  onEdit={(tx) => {
                    setEditing(tx);
                    setFormOpen(true);
                  }}
                  onDelete={setDeleting}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
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
