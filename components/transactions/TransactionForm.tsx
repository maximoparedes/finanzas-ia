'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CATEGORIES,
  PAYMENT_METHODS,
  CATEGORY_ICONS,
  type Category,
  type PaymentMethod,
  type TransactionType,
} from '@/lib/types';
import type { Transaction } from '@/types';
import { format } from 'date-fns';

const schema = z.object({
  amount: z.number({ error: 'Ingresá un monto válido' }).positive({ message: 'El monto debe ser mayor a 0' }),
  description: z.string().min(2, 'Descripción muy corta').max(100),
  category: z.enum(CATEGORIES as [Category, ...Category[]]),
  date: z.string().min(1, 'Seleccioná una fecha'),
  paymentMethod: z.enum(['efectivo', 'debito', 'credito', 'transferencia', 'otro'] as [PaymentMethod, ...PaymentMethod[]]),
  type: z.enum(['fijo', 'variable'] as [TransactionType, ...TransactionType[]]),
  note: z.string().max(200).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  transaction?: Transaction;
  onSave: (data: FormData) => Promise<void> | void;
  onClose: () => void;
}

export function TransactionForm({ transaction, onSave, onClose }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: transaction?.amount,
      description: transaction?.description ?? '',
      category: transaction?.category ?? 'Otros',
      date: transaction?.date ?? format(new Date(), 'yyyy-MM-dd'),
      paymentMethod: transaction?.payment_method ?? 'efectivo',
      type: transaction?.type ?? 'variable',
      note: transaction?.note ?? '',
    },
  });

  const selectedCategory = watch('category');
  const selectedType = watch('type');

  const onSubmit = async (data: FormData) => {
    await onSave(data);
  };

  const inputClass =
    'w-full px-3 py-2.5 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50 transition-all';

  const errorClass = 'text-xs text-rose-500 mt-1';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between px-5 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-500/10">
              {transaction ? (
                <Pencil size={14} className="text-violet-500" />
              ) : (
                <Plus size={14} className="text-violet-500" />
              )}
            </div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {transaction ? 'Editar transacción' : 'Nueva transacción'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Monto *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">$</span>
              <input
                type="number"
                step="0.01"
                placeholder="0"
                {...register('amount', { valueAsNumber: true })}
                className={cn(inputClass, 'pl-7', errors.amount && 'border-rose-400 focus:ring-rose-500/40')}
              />
            </div>
            {errors.amount && <p className={errorClass}>{errors.amount.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Descripción *</label>
            <input
              type="text"
              placeholder="Ej: Almuerzo con el equipo"
              {...register('description')}
              className={cn(inputClass, errors.description && 'border-rose-400')}
            />
            {errors.description && <p className={errorClass}>{errors.description.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Categoría *</label>
            <div className="grid grid-cols-4 gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setValue('category', cat)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium transition-all border',
                    selectedCategory === cat
                      ? 'bg-violet-500/10 border-violet-500/40 text-violet-600 dark:text-violet-400'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700',
                  )}
                >
                  <span className="text-base leading-none">{CATEGORY_ICONS[cat]}</span>
                  <span className="leading-none text-center" style={{ fontSize: '10px' }}>
                    {cat}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Fecha *</label>
              <input
                type="date"
                {...register('date')}
                className={cn(inputClass, errors.date && 'border-rose-400')}
              />
              {errors.date && <p className={errorClass}>{errors.date.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Método de pago</label>
              <select {...register('paymentMethod')} className={inputClass}>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Tipo de gasto</label>
            <div className="flex gap-2">
              {(['variable', 'fijo'] as TransactionType[]).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setValue('type', t)}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-sm font-medium transition-all border',
                    selectedType === t
                      ? 'bg-violet-500 border-violet-500 text-white'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700',
                  )}
                >
                  {t === 'fijo' ? '🔒 Fijo' : '🔄 Variable'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              Nota <span className="text-slate-400">(opcional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Agregar nota..."
              {...register('note')}
              className={cn(inputClass, 'resize-none')}
            />
          </div>

          <div className="flex gap-3 pt-2 pb-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-violet-500 hover:bg-violet-600 text-white transition-colors disabled:opacity-60"
            >
              {transaction ? 'Guardar cambios' : 'Agregar transacción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
