'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  Users,
  Ticket,
  ShoppingBag,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  UserCheck,
  FileSpreadsheet,
  User,
  MessageSquare,
  CreditCard,
  Shield,
  HelpCircle,
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
  // Warden Nav Items (11 Core Features)
  {
    title: 'Rooms',
    href: '/warden/rooms',
    icon: Building2,
    roles: ['WARDEN', 'SUPER_ADMIN'],
  },
  {
    title: 'Room Requests',
    href: '/warden/requests',
    icon: FileSpreadsheet,
    roles: ['WARDEN', 'SUPER_ADMIN'],
  },
  {
    title: 'Students',
    href: '/warden/students',
    icon: Users,
    roles: ['WARDEN', 'SUPER_ADMIN'],
  },
  {
    title: 'Tickets',
    href: '/warden/tickets',
    icon: Ticket,
    roles: ['WARDEN', 'SUPER_ADMIN'],
  },
  {
    title: 'Marketplace',
    href: '/warden/marketplace',
    icon: ShoppingBag,
    roles: ['WARDEN', 'SUPER_ADMIN'],
  },
  {
    title: 'Messages',
    href: '/warden/messages',
    icon: MessageSquare,
    roles: ['WARDEN', 'SUPER_ADMIN'],
  },
  {
    title: 'Payments',
    href: '/warden/payments',
    icon: CreditCard,
    roles: ['WARDEN', 'SUPER_ADMIN'],
  },
  {
    title: 'Audit Logs',
    href: '/warden/audit',
    icon: ShieldAlert,
    roles: ['WARDEN', 'SUPER_ADMIN'],
  },
  {
    title: 'Security Sentinel',
    href: '/warden/security-sentinel',
    icon: Shield,
    roles: ['WARDEN', 'SUPER_ADMIN'],
  },
  {
    title: 'Profile',
    href: '/warden/profile',
    icon: User,
    roles: ['WARDEN', 'SUPER_ADMIN'],
  },

  // Student Nav Items (10 Core Features including Messages!)
  {
    title: 'Rooms',
    href: '/student/rooms',
    icon: Building2,
    roles: ['STUDENT'],
  },
  {
    title: 'Bookings',
    href: '/student/bookings',
    icon: FileSpreadsheet,
    roles: ['STUDENT'],
  },
  {
    title: 'Roommate Match',
    href: '/student/match',
    icon: UserCheck,
    roles: ['STUDENT'],
  },
  {
    title: 'Tickets',
    href: '/student/tickets',
    icon: Ticket,
    roles: ['STUDENT'],
  },
  {
    title: 'Messages',
    href: '/student/messages',
    icon: MessageSquare,
    roles: ['STUDENT'],
  },
  {
    title: 'Marketplace',
    href: '/student/marketplace',
    icon: ShoppingBag,
    roles: ['STUDENT'],
  },
  {
    title: 'Payments',
    href: '/student/payments',
    icon: CreditCard,
    roles: ['STUDENT'],
  },
  {
    title: 'Help Center',
    href: '/student/help',
    icon: HelpCircle,
    roles: ['STUDENT'],
  },
  {
    title: 'Profile',
    href: '/student/profile',
    icon: User,
    roles: ['STUDENT'],
  },
  {
    title: '2FA Security',
    href: '/student/mfa-setup',
    icon: KeyRound,
    roles: ['STUDENT'],
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
    <aside className="w-60 shrink-0 bg-[#EFEBFD] hidden md:flex flex-col min-h-[calc(100vh-4rem)] p-4 justify-between border-r-2 border-[#B8A7F6] shadow-sm">
      <div>
        <div className="px-4 text-xs font-bold text-[#3C315B]/70 tracking-widest mb-3 uppercase">
          MENU
        </div>
        <nav className="space-y-1.5">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all',
                  isActive
                    ? 'bg-[#D7CBFE] text-[#3C315B] font-bold border border-[#B7A6F6] shadow-sm'
                    : 'text-[#3C315B]/80 hover:bg-white hover:text-[#3C315B]',
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 shrink-0',
                    isActive ? 'text-[#6A4FE0]' : 'text-[#3C315B]/60',
                  )}
                />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* RLS Security Footer Card */}
      <div className="p-4 rounded-2xl bg-white border border-[#E5E4E8] space-y-1 text-xs shadow-sm mt-4">
        <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
          <CheckCircle2 className="h-4 w-4" /> RLS Active
        </div>
        <p className="text-xs text-[#3C315B]/70 leading-relaxed font-normal">
          Tenant-isolated PostgreSQL session.
        </p>
      </div>
    </aside>
  );
}
