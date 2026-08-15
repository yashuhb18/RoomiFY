'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Navbar } from '@/components/common/Navbar';
import { Sidebar } from '@/components/common/Sidebar';

export default function WardenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user?.role === 'STUDENT') {
      router.push('/student');
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen bg-[#EDEAFD] flex flex-col">
      <Navbar />
      <div className="flex flex-1 bg-[#EDEAFD]">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full bg-[#EDEAFD] min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
