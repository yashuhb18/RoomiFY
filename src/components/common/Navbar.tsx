'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, LogOut, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'US';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-black/80 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black font-bold">
              <Shield className="h-4 w-4 text-black" />
            </div>
            <span className="font-bold tracking-tight text-base text-white">
              ROOMIFY
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800 hidden sm:inline-block">
              Zero-Trust
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg h-9 w-9"
          >
            <Bell className="h-4 w-4" />
          </Button>

          {user && (
            <div className="flex items-center gap-3 border-l border-zinc-800 pl-3">
              <div className="flex items-center gap-2 p-1 pr-3 rounded-full bg-zinc-900/60 border border-zinc-800">
                <Avatar className="h-7 w-7 border border-zinc-700">
                  <AvatarFallback className="bg-white text-black font-bold text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-semibold text-white line-clamp-1">{user.email}</span>
                  <span className="text-[9px] text-zinc-400 font-mono uppercase font-semibold">
                    {user.role}
                  </span>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Logout"
                className="text-zinc-400 hover:text-red-400 hover:bg-red-950/20 rounded-lg h-9 w-9"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
