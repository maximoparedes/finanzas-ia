'use client';

import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export const DropdownMenu = RadixDropdown.Root;
export const DropdownMenuTrigger = RadixDropdown.Trigger;

export function DropdownMenuContent({ children, align = 'end' }: { children: ReactNode; align?: 'start' | 'end' }) {
  return (
    <RadixDropdown.Portal>
      <RadixDropdown.Content
        align={align}
        sideOffset={8}
        className="z-50 min-w-[180px] rounded-xl bg-surface-raised border border-edge shadow-elevated p-1 data-[state=open]:[animation:dialog-content-in_120ms_ease-out]"
      >
        {children}
      </RadixDropdown.Content>
    </RadixDropdown.Portal>
  );
}

export function DropdownMenuItem({
  children,
  className,
  ...props
}: React.ComponentProps<typeof RadixDropdown.Item>) {
  return (
    <RadixDropdown.Item
      className={cn(
        'flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-fg-muted cursor-pointer outline-none transition-colors data-[highlighted]:bg-surface data-[highlighted]:text-fg',
        className,
      )}
      {...props}
    >
      {children}
    </RadixDropdown.Item>
  );
}

export function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-edge" />;
}
