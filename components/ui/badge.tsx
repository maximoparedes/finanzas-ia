import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

const badgeVariants = cva('inline-flex items-center gap-1 rounded-full font-medium text-xs px-2 py-0.5', {
  variants: {
    variant: {
      neutral: 'bg-surface-raised text-fg-muted',
      accent: 'bg-accent/10 text-accent',
      success: 'bg-success/10 text-success',
      warning: 'bg-warning/10 text-warning',
      danger: 'bg-danger/10 text-danger',
      info: 'bg-info/10 text-info',
    },
  },
  defaultVariants: { variant: 'neutral' },
});

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export function CategoryChip({ label, icon, color }: { label: string; icon: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full text-xs font-medium px-2 py-0.5"
      style={{ backgroundColor: `${color}1f`, color }}
    >
      <span className="text-[13px] leading-none">{icon}</span>
      {label}
    </span>
  );
}
