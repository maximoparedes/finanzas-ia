'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { daysInMonth, dayOfMonth, formatCurrency } from '@/lib/utils';
import type { Transaction } from '@/types';

interface Props {
  month: string;
  transactions: Transaction[];
  presupuestoGeneral: number | null;
  hastaHoy: number | null;
}

export function SpendingChart({ month, transactions, presupuestoGeneral, hastaHoy }: Props) {
  const totalDias = daysInMonth(month);

  const gastoPorDia = new Array(totalDias + 1).fill(0);
  for (const t of transactions) {
    gastoPorDia[dayOfMonth(t.date)] += t.amount;
  }

  const acumuladoPorDia = gastoPorDia.reduce<number[]>((acc, gasto, dia) => {
    if (dia === 0) return acc;
    acc.push((acc[acc.length - 1] ?? 0) + gasto);
    return acc;
  }, []);

  const data = Array.from({ length: totalDias }, (_, i) => {
    const dia = i + 1;
    const esFuturo = hastaHoy !== null && dia > hastaHoy;
    return {
      dia,
      real: esFuturo ? null : acumuladoPorDia[dia - 1],
      ritmo: presupuestoGeneral !== null ? (presupuestoGeneral / totalDias) * dia : null,
    };
  });

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5">
      <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
        Gasto acumulado en el mes
      </h2>
      <div className="h-64 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" vertical={false} />
            <XAxis
              dataKey="dia"
              tick={{ fontSize: 11 }}
              className="text-slate-400"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              className="text-slate-400"
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={(v) => formatCurrency(v)}
            />
            <Tooltip
              formatter={(value, name) => [formatCurrency(Number(value)), name]}
              labelFormatter={(dia) => `Día ${dia}`}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            {presupuestoGeneral !== null && (
              <Legend verticalAlign="top" height={24} wrapperStyle={{ fontSize: 12 }} />
            )}
            <Line
              type="monotone"
              dataKey="real"
              name="Gasto real"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
            {presupuestoGeneral !== null && (
              <Line
                type="linear"
                dataKey="ritmo"
                name="Ritmo de presupuesto"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
