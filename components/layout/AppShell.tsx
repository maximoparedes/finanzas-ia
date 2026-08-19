import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Sidebar />
      <div className="lg:pl-56 pb-16 lg:pb-0 min-h-full flex flex-col">{children}</div>
    </>
  );
}
