'use client';

import * as RadixProgress from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  className?: string;
  colorClassName?: string;
}

export function Progress({ value, className, colorClassName = 'bg-accent' }: ProgressProps) {
  const clamped = Math.min(Math.max(value, 0), 100);
  return (
    <RadixProgress.Root
      value={clamped}
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-surface-raised', className)}
    >
      <RadixProgress.Indicator
        className={cn('h-full rounded-full transition-[width] duration-500 ease-out', colorClassName)}
        style={{ width: `${clamped}%` }}
      />
    </RadixProgress.Root>
  );
}
