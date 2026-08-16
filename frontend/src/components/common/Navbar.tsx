'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, Bell, Search, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Logo } from '@/components/common/logo';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'US';

  const isWarden = user?.role === 'WARDEN' || user?.role === 'SUPER_ADMIN';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#EFEBFD] border-b-2 border-[#B8A7F6] shadow-sm backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6 w-full">
        {/* Left: Logo */}
        <Logo size="md" href={isWarden ? '/warden' : '/student'} />

        {/* Center: Top Pill Navigation Bar */}
        <div className="hidden md:flex items-center gap-1.5 bg-white border border-[#E5E4E8] rounded-full px-3 py-1.5 shadow-sm text-sm font-semibold text-[#3C315B]">
          {isWarden ? (
            <>
              <Link
                href="/warden"
                className={`px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1 ${
                  pathname === '/warden' ? 'bg-[#ECE8FE] font-bold text-[#3C315B]' : 'hover:bg-[#F4F2F8]'
                }`}
              >
                Console <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link
                href="/warden/rooms"
                className={`px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1 ${
                  pathname === '/warden/rooms' ? 'bg-[#ECE8FE] font-bold text-[#3C315B]' : 'hover:bg-[#F4F2F8]'
                }`}
              >
                Rooms <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link
                href="/warden/students"
                className={`px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1 ${
                  pathname === '/warden/students' ? 'bg-[#ECE8FE] font-bold text-[#3C315B]' : 'hover:bg-[#F4F2F8]'
                }`}
              >
                Students <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link
                href="/warden/tickets"
                className={`px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1 ${
                  pathname === '/warden/tickets' ? 'bg-[#ECE8FE] font-bold text-[#3C315B]' : 'hover:bg-[#F4F2F8]'
                }`}
              >
                Tickets <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/student"
                className={`px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1 ${
                  pathname === '/student' ? 'bg-[#ECE8FE] font-bold text-[#3C315B]' : 'hover:bg-[#F4F2F8]'
                }`}
              >
                Console <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link
                href="/student/bookings"
                className={`px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1 ${
                  pathname === '/student/bookings' ? 'bg-[#ECE8FE] font-bold text-[#3C315B]' : 'hover:bg-[#F4F2F8]'
                }`}
              >
                Bookings <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link
                href="/student/marketplace"
                className={`px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1 ${
                  pathname === '/student/marketplace' ? 'bg-[#ECE8FE] font-bold text-[#3C315B]' : 'hover:bg-[#F4F2F8]'
                }`}
              >
                Marketplace <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link
                href="/student/tickets"
                className={`px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1 ${
                  pathname === '/student/tickets' ? 'bg-[#ECE8FE] font-bold text-[#3C315B]' : 'hover:bg-[#F4F2F8]'
                }`}
              >
                Tickets <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </>
          )}
        </div>

        {/* Right: Search, Bell, User Pill, Logout */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="w-9 h-9 rounded-full bg-white border border-[#E5E4E8] flex items-center justify-center text-[#3C315B]/60 hover:text-[#3C315B] transition-colors shadow-sm"
          >
            <Search className="h-4 w-4" />
          </button>

          <button
            type="button"
            className="w-9 h-9 rounded-full bg-white border border-[#E5E4E8] flex items-center justify-center text-[#3C315B]/60 hover:text-[#3C315B] transition-colors shadow-sm"
          >
            <Bell className="h-4 w-4" />
          </button>

          {user && (
            <div className="flex items-center gap-2">
              <Link
                href={isWarden ? '/warden/profile' : '/student/profile'}
                className="flex items-center gap-2 px-2 py-1 rounded-full bg-white border border-[#E5E4E8] hover:bg-[#F4F2F8] transition-colors shadow-sm text-xs font-medium text-[#3C315B]"
              >
                <div className="w-7 h-7 rounded-full bg-[#ECE8FE] text-[#3C315B] font-bold flex items-center justify-center text-xs">
                  {initials}
                </div>
                <span className="max-w-[120px] truncate font-medium text-[#3C315B]">
                  {user.email}
                </span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                title="Logout"
                className="w-9 h-9 rounded-full bg-white border border-[#E5E4E8] flex items-center justify-center text-[#3C315B]/60 hover:text-red-500 transition-colors shadow-sm ml-1"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
