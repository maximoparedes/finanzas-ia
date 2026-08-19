'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { daysInMonth, dayOfMonth, formatCurrency } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import type { Transaction } from '@/types';

interface Props {
  month: string;
  transactions: Transaction[];
  presupuestoGeneral: number | null;
  hastaHoy: number | null;
}

const EDGE = 'rgba(255,255,255,0.08)';
const FG_SUBTLE = '#6b6b76';

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
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-fg mb-4">Gasto acumulado en el mes</h2>
      <div className="h-64 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
            <defs>
              <filter id="line-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={EDGE} vertical={false} />
            <XAxis
              dataKey="dia"
              tick={{ fontSize: 11, fill: FG_SUBTLE }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: FG_SUBTLE }}
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={(v) => formatCurrency(v)}
            />
            <Tooltip
              formatter={(value, name) => [formatCurrency(Number(value)), name]}
              labelFormatter={(dia) => `Día ${dia}`}
              contentStyle={{
                fontSize: 12,
                borderRadius: 10,
                background: '#1c1c24',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#f4f4f6',
              }}
              itemStyle={{ color: '#f4f4f6' }}
              labelStyle={{ color: '#a1a1ab' }}
            />
            {presupuestoGeneral !== null && (
              <Legend verticalAlign="top" height={24} wrapperStyle={{ fontSize: 12, color: '#a1a1ab' }} />
            )}
            <Line
              type="monotone"
              dataKey="real"
              name="Gasto real"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              dot={false}
              connectNulls={false}
              style={{ filter: 'url(#line-glow)' }}
            />
            {presupuestoGeneral !== null && (
              <Line
                type="linear"
                dataKey="ritmo"
                name="Ritmo de presupuesto"
                stroke="#6b6b76"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
