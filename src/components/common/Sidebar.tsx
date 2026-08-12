'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Ticket,
  ShoppingBag,
  ShieldAlert,
  Building2,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    title: 'Overview',
    href: '/student',
    icon: LayoutDashboard,
    roles: ['STUDENT'],
  },
  {
    title: 'Roommate Match',
    href: '/student/match',
    icon: Users,
    roles: ['STUDENT'],
  },
  {
    title: 'Maintenance Tickets',
    href: '/student/tickets',
    icon: Ticket,
    roles: ['STUDENT'],
  },
  {
    title: 'Marketplace',
    href: '/student/marketplace',
    icon: ShoppingBag,
    roles: ['STUDENT'],
  },
  {
    title: 'Warden Console',
    href: '/warden',
    icon: Building2,
    roles: ['WARDEN', 'SUPER_ADMIN'],
  },
  {
    title: 'Audit Logs',
    href: '/warden/audit',
    icon: ShieldAlert,
    roles: ['WARDEN', 'SUPER_ADMIN'],
  },
  {
    title: '2FA Security',
    href: '/mfa-setup',
    icon: KeyRound,
    roles: ['STUDENT', 'WARDEN', 'STAFF', 'SUPER_ADMIN'],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const userRole = user?.role || 'STUDENT';
  const filteredItems = navItems.filter((item) =>
    item.roles.includes(userRole),
  );

  return (
    <aside className="w-60 shrink-0 border-r border-zinc-800 bg-black hidden md:flex flex-col min-h-[calc(100vh-3.5rem)] p-3 justify-between">
      <nav className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">
          Menu
        </div>

        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all',
                isActive
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white',
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4',
                  isActive ? 'text-white' : 'text-zinc-400',
                )}
              />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-1 text-xs">
        <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-semibold text-[11px]">
          <ShieldCheck className="h-3.5 w-3.5" /> RLS Isolation
        </div>
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          Tenant session isolated via Supabase PostgreSQL policy.
        </p>
      </div>
    </aside>
  );
}
