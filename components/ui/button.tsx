import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'react';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-white hover:bg-accent-hover shadow-[0_0_0_0_transparent] hover:shadow-glow',
        secondary: 'bg-surface-raised text-fg hover:bg-surface-raised/70 border border-edge',
        ghost: 'text-fg-muted hover:text-fg hover:bg-surface-raised',
        danger: 'bg-danger text-white hover:bg-danger/90',
      },
      size: {
        sm: 'text-xs px-2.5 py-1.5',
        md: 'text-sm px-4 py-2.5',
        icon: 'p-2',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
