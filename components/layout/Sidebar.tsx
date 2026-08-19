'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'motion/react';
import { LayoutDashboard, ArrowLeftRight, Wallet, Sparkles, LogOut, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transacciones', label: 'Transacciones', icon: ArrowLeftRight },
  { href: '/presupuestos', label: 'Presupuestos', icon: Wallet },
  { href: '/chat', label: 'Asistente', icon: Sparkles },
];

function NavLinks({ pathname, orientation }: { pathname: string; orientation: 'vertical' | 'horizontal' }) {
  return (
    <div className={cn('flex gap-1', orientation === 'vertical' ? 'flex-col' : 'flex-row justify-around')}>
      {links.map((link) => {
        const active = pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'relative flex items-center gap-3 rounded-xl text-sm font-medium transition-colors',
              orientation === 'vertical' ? 'px-3 py-2.5' : 'flex-1 flex-col gap-1 px-2 py-2 text-[11px]',
              active ? 'text-fg' : 'text-fg-subtle hover:text-fg-muted',
            )}
          >
            {active && (
              <motion.div
                layoutId={orientation === 'vertical' ? 'sidebar-active' : 'tabbar-active'}
                className={cn(
                  'absolute inset-0 bg-accent/10',
                  orientation === 'vertical' ? 'rounded-xl' : 'rounded-lg',
                )}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <Icon size={orientation === 'vertical' ? 17 : 19} className={cn('relative', active && 'text-accent')} />
            <span className="relative">{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const nombre = session?.user?.name ?? session?.user?.email ?? 'Usuario';
  const inicial = nombre.charAt(0).toUpperCase();

  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-56 flex-col border-r border-edge bg-surface/60 backdrop-blur-xl px-3 py-5">
        <div className="flex items-center gap-2 px-2 mb-6">
          <div className="h-7 w-7 rounded-lg bg-accent shadow-glow" />
          <span className="text-sm font-semibold text-fg">finanzas-ia</span>
        </div>

        <nav className="flex-1">
          <NavLinks pathname={pathname} orientation="vertical" />
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-xl px-2 py-2 hover:bg-surface-raised transition-colors text-left">
              <div className="h-8 w-8 shrink-0 rounded-full bg-accent/15 text-accent flex items-center justify-center text-sm font-semibold">
                {inicial}
              </div>
              <span className="flex-1 truncate text-sm text-fg-muted">{nombre}</span>
              <ChevronDown size={14} className="text-fg-subtle" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem disabled className="opacity-70 cursor-default">
              {session?.user?.email}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => signOut({ callbackUrl: '/login' })} className="text-danger data-[highlighted]:text-danger">
              <LogOut size={14} />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-edge bg-surface/90 backdrop-blur-xl px-2 py-1.5">
        <NavLinks pathname={pathname} orientation="horizontal" />
      </nav>
    </>
  );
}
