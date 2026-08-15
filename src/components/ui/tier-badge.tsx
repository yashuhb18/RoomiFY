import React from 'react';
import { cn } from '@/lib/utils';
import { CreditTier } from '@/store/useActivityHubStore';
import { Shield, Sparkles, Award, Crown, Zap } from 'lucide-react';

interface TierBadgeProps {
  tier: CreditTier;
  className?: string;
  showDiscount?: boolean;
}

const TIER_CONFIG: Record<
  CreditTier,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    icon: React.ComponentType<{ className?: string }>;
    discount: string;
    glow: string;
  }
> = {
  BRONZE: {
    label: 'BRONZE',
    bg: 'bg-[#F4E8E1]',
    text: 'text-[#8C4A27]',
    border: 'border-[#D9BBA8]',
    icon: Shield,
    discount: '0%',
    glow: 'shadow-sm',
  },
  SILVER: {
    label: 'SILVER',
    bg: 'bg-[#F0F2F5]',
    text: 'text-[#4A5568]',
    border: 'border-[#CBD5E0]',
    icon: Award,
    discount: '5%',
    glow: 'shadow-[0_0_10px_rgba(203,213,224,0.5)]',
  },
  GOLD: {
    label: 'GOLD',
    bg: 'bg-[#FEF9C3]',
    text: 'text-[#854D0E]',
    border: 'border-[#FDE047]',
    icon: Sparkles,
    discount: '10%',
    glow: 'shadow-[0_0_12px_rgba(234,179,8,0.4)]',
  },
  PLATINUM: {
    label: 'PLATINUM',
    bg: 'bg-[#E0F2FE]',
    text: 'text-[#0369A1]',
    border: 'border-[#7DD3FC]',
    icon: Zap,
    discount: '15%',
    glow: 'shadow-[0_0_15px_rgba(56,189,248,0.5)]',
  },
  DIAMOND: {
    label: 'DIAMOND',
    bg: 'bg-gradient-to-r from-[#E0E7FF] via-[#EDE9FE] to-[#FCE7F3]',
    text: 'text-[#4338CA]',
    border: 'border-[#A5B4FC]',
    icon: Crown,
    discount: '20%',
    glow: 'shadow-[0_0_20px_rgba(99,102,241,0.6)] animate-pulse',
  },
};

export function TierBadge({ tier, className, showDiscount = false }: TierBadgeProps) {
  const config = TIER_CONFIG[tier] || TIER_CONFIG.BRONZE;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-pill border text-xs font-semibold tracking-wider uppercase transition-all duration-300',
        config.bg,
        config.text,
        config.border,
        config.glow,
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{config.label}</span>
      {showDiscount && (
        <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/60 text-[10px]">
          {config.discount} OFF
        </span>
      )}
    </div>
  );
}
