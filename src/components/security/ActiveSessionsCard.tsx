'use client';

import React, { useState } from 'react';
import { ShieldAlert, Laptop, Smartphone, CheckCircle, RefreshCw } from 'lucide-react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';

export function ActiveSessionsCard() {
  const [isRevoking, setIsRevoking] = useState(false);
  const { logout } = useAuthStore();

  const handleRevokeAll = async () => {
    setIsRevoking(true);
    try {
      await api.post('/auth/revoke-all-sessions');
      toast.success('All active sessions revoked across all devices!');
      setTimeout(() => {
        logout();
      }, 1500);
    } catch (err: any) {
      toast.error('Failed to revoke sessions. Please try again.');
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#E5E4E8] bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6A4FE0]/10 flex items-center justify-center text-[#6A4FE0]">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-jakarta font-bold text-[#3C315B]">
              Active Sessions & Device Security
            </h3>
            <p className="text-xs text-[#3C315B]/60">
              Manage logged-in devices and invalidate compromised refresh tokens instantly.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle className="w-3.5 h-3.5" /> 1 Active Session
        </span>
      </div>

      <div className="divide-y divide-[#E5E4E8]/60 border border-[#E5E4E8] rounded-xl overflow-hidden bg-[#FAFAFA]">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E4E8] flex items-center justify-center text-[#3C315B]">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#3C315B] flex items-center gap-2">
                Current Browser Session
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#6A4FE0]/10 text-[#6A4FE0]">
                  This Device
                </span>
              </p>
              <p className="text-[11px] text-[#3C315B]/50">Chrome on Windows · IP: 127.0.0.1</p>
            </div>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Active now</span>
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[#3C315B]/50">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Revoking all sessions forces re-authentication on every device.</span>
        </div>
        <Button
          onClick={handleRevokeAll}
          disabled={isRevoking}
          variant="destructive"
          size="sm"
          className="rounded-xl text-xs font-semibold gap-2"
        >
          {isRevoking ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5" />
          )}
          Revoke All Devices
        </Button>
      </div>
    </div>
  );
}
