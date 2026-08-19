'use client';

import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;

interface DialogContentProps {
  children: ReactNode;
  className?: string;
  /** sheet: se pega abajo en mobile y se centra en desktop (para formularios largos). centered: siempre centrado (para confirmaciones cortas). */
  variant?: 'sheet' | 'centered';
}

export function DialogContent({ children, className, variant = 'centered' }: DialogContentProps) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:[animation:dialog-overlay-in_150ms_ease-out]"
      />
      <RadixDialog.Content
        className={cn(
          'fixed z-50 bg-surface border border-edge shadow-elevated overflow-y-auto',
          'data-[state=open]:[animation:dialog-content-in_180ms_ease-out]',
          variant === 'sheet' &&
            'inset-x-0 bottom-0 sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[95vh]',
          variant === 'centered' &&
            'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-sm rounded-2xl p-6',
          className,
        )}
      >
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}

export function DialogHeader({
  icon,
  title,
  onClose,
  sticky = false,
}: {
  icon?: ReactNode;
  title: string;
  onClose: () => void;
  sticky?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-5 py-4 border-b border-edge',
        sticky && 'sticky top-0 bg-surface z-10 rounded-t-2xl',
      )}
    >
      <div className="flex items-center gap-2">
        {icon && <div className="p-1.5 rounded-lg bg-accent/10">{icon}</div>}
        <RadixDialog.Title className="text-base font-semibold text-fg">{title}</RadixDialog.Title>
      </div>
      <RadixDialog.Close asChild>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-surface-raised text-fg-subtle transition-colors"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>
      </RadixDialog.Close>
    </div>
  );
}
