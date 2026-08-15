'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WardenLoginRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#070510] flex items-center justify-center text-white/40 text-xs font-mono">
      Redirecting to Admin & Warden Login Portal...
    </div>
  );
}
