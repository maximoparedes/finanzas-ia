'use client';

import * as RadixTooltip from '@radix-ui/react-tooltip';
import type { ReactNode } from 'react';

export function TooltipProvider({ children }: { children: ReactNode }) {
  return (
    <RadixTooltip.Provider delayDuration={300}>
      {children}
    </RadixTooltip.Provider>
  );
}

export function Tooltip({ children, label }: { children: ReactNode; label: string }) {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          sideOffset={6}
          className="z-50 rounded-lg bg-surface-raised border border-edge px-2.5 py-1.5 text-xs text-fg shadow-elevated"
        >
          {label}
          <RadixTooltip.Arrow className="fill-surface-raised" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}
