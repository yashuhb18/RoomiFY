'use client';

import React from 'react';
import { Check, X, ShieldAlert, ShieldCheck } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password?: string;
  showChecklist?: boolean;
}

export function PasswordStrengthMeter({
  password = '',
  showChecklist = true,
}: PasswordStrengthMeterProps) {
  const hasMinLength = password.length >= 12;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const criteria = [
    { label: 'At least 12 characters', met: hasMinLength },
    { label: 'Uppercase letter (A-Z)', met: hasUppercase },
    { label: 'Lowercase letter (a-z)', met: hasLowercase },
    { label: 'Number (0-9)', met: hasNumber },
    { label: 'Special character (!@#$...)', met: hasSpecial },
  ];

  const metCount = criteria.filter((c) => c.met).length;

  let score = 0;
  if (password.length > 0) {
    if (metCount <= 2) score = 1; // Weak
    else if (metCount === 3) score = 2; // Fair
    else if (metCount === 4) score = 3; // Good
    else if (metCount === 5) score = 4; // Strong
  }

  const getStrengthLabel = () => {
    if (!password) return 'Enter a password';
    switch (score) {
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong (12+ Chars)';
      default:
        return 'Too short';
    }
  };

  const getStrengthColor = () => {
    switch (score) {
      case 1:
        return 'bg-red-500 text-red-700';
      case 2:
        return 'bg-amber-500 text-amber-700';
      case 3:
        return 'bg-blue-500 text-blue-700';
      case 4:
        return 'bg-emerald-500 text-emerald-700';
      default:
        return 'bg-gray-200 text-gray-400';
    }
  };

  return (
    <div className="space-y-2 text-xs">
      {/* Bar indicator */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-medium text-[#3C315B]/60 flex items-center gap-1">
            {score >= 3 ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            )}
            Strength:
          </span>
          <span className={`font-bold uppercase tracking-wider ${
            score === 1 ? 'text-red-600' :
            score === 2 ? 'text-amber-600' :
            score === 3 ? 'text-blue-600' :
            score === 4 ? 'text-emerald-600' : 'text-gray-400'
          }`}>
            {getStrengthLabel()}
          </span>
        </div>

        {/* 4 segmented bar */}
        <div className="grid grid-cols-4 gap-1.5 h-1.5">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-full rounded-full transition-all duration-300 ${
                step <= score ? getStrengthColor().split(' ')[0] : 'bg-[#E5E4E8]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Criteria checklist */}
      {showChecklist && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1 text-[11px]">
          {criteria.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-1.5 transition-colors ${
                item.met ? 'text-emerald-700 font-medium' : 'text-[#3C315B]/40'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                  item.met ? 'bg-emerald-100 text-emerald-700' : 'bg-[#FAFAFA] border border-[#E5E4E8] text-gray-300'
                }`}
              >
                {item.met ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
              </div>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
