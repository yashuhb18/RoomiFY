'use client';

import React, { useState } from 'react';
import { ShieldAlert, Lock, Check } from 'lucide-react';
import api from '@/lib/axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface StepUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  actionDescription: string;
}

export function StepUpModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  actionDescription,
}: StepUpModalProps) {
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleVerifyAndProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsVerifying(true);
    setErrorMsg(null);

    try {
      await api.post('/auth/step-up-verify', { password });
      toast.success('Step-Up Action Verified');
      setPassword('');
      onConfirm();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Invalid password. Action blocked.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-3xl border border-[#E5E4E8] bg-white text-[#3C315B] max-w-md p-7">
        <DialogHeader className="space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <DialogTitle className="text-xl font-bold text-[#3C315B]">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-[#3C315B]/70 leading-relaxed font-normal">
            {actionDescription} High-risk administrative actions require current password verification under AEGIS Zero-Trust security rules.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleVerifyAndProceed} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#3C315B] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#6A4FE0]" /> Confirm Current Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="h-11 rounded-2xl border-[#E5E4E8] bg-[#FAFAFA] text-xs font-medium text-[#3C315B] focus:bg-white"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-full text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isVerifying || !password}
              className="rounded-full bg-[#3C315B] hover:bg-[#2D2447] text-white text-xs font-bold px-6 shadow-md"
            >
              {isVerifying ? 'Verifying...' : 'Authorize Action'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
