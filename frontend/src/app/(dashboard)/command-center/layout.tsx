'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, Building2, ShieldCheck, FileText,
  LogOut, Bell, Search, Shield, BedDouble, Ticket,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

const sidebarLinks = [
  { title: 'Overview', href: '/command-center', icon: LayoutDashboard },
  { title: 'User Management', href: '/command-center/users', icon: Users },
  { title: 'Hostel Properties', href: '/command-center/hostels', icon: Building2 },
  { title: 'Rooms & Vacancies', href: '/command-center/rooms', icon: BedDouble },
  { title: 'Ticket SLA Monitor', href: '/command-center/tickets', icon: Ticket },
  { title: 'Security Audit', href: '/command-center/security', icon: ShieldCheck },
  { title: 'Audit Logs', href: '/command-center/audit', icon: FileText },
];

export default function CommandCenterLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/superadmin');
    } else if (user?.role !== 'SUPER_ADMIN') {
      toast.error('Access denied. Super Admin platform owner credentials required.');
      router.push('/superadmin');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-[#070510] flex items-center justify-center text-white/40 text-xs font-mono">
        Authenticating Super Admin session...
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    toast.success('Logged out from Command Hub');
    router.push('/superadmin');
  };

  return (
    <div className="flex min-h-screen bg-[#F1F5F9] font-sans text-[#1E293B]">
      {/* Royal Blue Sidebar */}
      <aside className="w-64 bg-[#1D2786] text-white shrink-0 hidden lg:flex flex-col justify-between p-4 shadow-xl">
        <div className="space-y-6">
          {/* Brand */}
          <div className="flex items-center gap-3 px-2 pt-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-lg text-white">
              R
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-white leading-none">RoomiFY</h1>
              <span className="text-[10px] text-blue-200/60 tracking-wider font-mono">COMMAND HUB</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 text-xs font-medium">
            {sidebarLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className="block relative">
                  {isActive && (
                    <motion.div
                      layoutId="cmd-sidebar-pill"
                      className="absolute inset-0 bg-white/15 rounded-xl border border-white/10 shadow-sm"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'text-white font-bold'
                      : 'text-blue-100/70 hover:bg-white/10 hover:text-white'
                  }`}>
                    <Icon className="w-4 h-4" />
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer: Auth Status + Logout */}
        <div className="space-y-3">
          <div className="p-3 rounded-2xl bg-white/10 border border-white/10 text-xs space-y-1">
            <p className="text-white/60 text-[10px] font-mono uppercase">Authenticated As</p>
            <p className="font-bold text-white flex items-center gap-1.5 truncate">
              <Shield className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              {user?.email || 'Super Admin'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-red-300 hover:bg-red-500/15 hover:text-red-200 text-xs font-medium transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout from Command Hub
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between gap-4 shadow-sm">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search students, rooms, bookings..."
              className="w-full h-9 pl-9 pr-4 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D2786]/20 focus:border-[#1D2786] transition-all text-[#1E293B]"
            />
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-[#475569]">
            <div className="relative p-2 rounded-full hover:bg-[#F1F5F9] cursor-pointer">
              <Bell className="w-4 h-4 text-[#64748B]" />
            </div>
            <div className="flex items-center gap-2 pl-2 border-l border-[#E2E8F0]">
              <div className="w-8 h-8 rounded-full bg-[#1D2786] text-white font-bold flex items-center justify-center text-xs shadow-sm">
                SA
              </div>
              <span className="text-xs font-bold text-[#1E293B] hidden sm:inline">{user?.email}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
