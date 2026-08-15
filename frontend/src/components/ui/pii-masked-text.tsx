'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

interface PiiMaskedTextProps {
  value?: string;
  fieldLabel: string;
  resourceId?: string;
  className?: string;
}

export function PiiMaskedText({
  value,
  fieldLabel,
  resourceId,
  className = '',
}: PiiMaskedTextProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  if (!value) return <span className="text-gray-400 font-mono text-xs">N/A</span>;

  const maskValue = (str: string) => {
    if (str.includes('@')) {
      const [name, domain] = str.split('@');
      return `${name.charAt(0)}***@${domain}`;
    }
    if (str.length >= 10) {
      return `${str.slice(0, 3)} ***** **${str.slice(-3)}`;
    }
    return '••••••••';
  };

  const handleToggle = async () => {
    if (!isRevealed) {
      try {
        await api.post('/audit/log-unmask', { field: fieldLabel, resourceId });
        toast.info(`Audit Logged: Unmasked ${fieldLabel}`, {
          description: 'This action was recorded in the immutable audit log.',
        });
      } catch (err) {
        // Silently continue showing if log fails
      }
    }
    setIsRevealed(!isRevealed);
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-xs ${className}`}>
      <span className={isRevealed ? 'text-[#3C315B] font-semibold' : 'text-[#3C315B]/60'}>
        {isRevealed ? value : maskValue(value)}
      </span>
      <button
        type="button"
        onClick={handleToggle}
        title={isRevealed ? 'Mask value' : `Unmask ${fieldLabel} (Audit Logged)`}
        className="p-1 rounded hover:bg-[#AB9FF2]/20 text-[#6A4FE0] transition-colors"
      >
        {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
    </span>
  );
}
