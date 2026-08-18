'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SignOutButton } from '@/components/SignOutButton';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/transacciones', label: 'Transacciones' },
  { href: '/presupuestos', label: 'Presupuestos' },
  { href: '/chat', label: 'Asistente' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              pathname.startsWith(link.href)
                ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800',
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <SignOutButton />
    </nav>
  );
}
