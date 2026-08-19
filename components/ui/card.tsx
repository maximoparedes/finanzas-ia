import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-2xl bg-surface border border-edge shadow-elevated', className)}
      {...props}
    />
  );
}
