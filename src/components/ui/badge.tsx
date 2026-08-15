import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[#3C315B] text-white',
        secondary:
          'border-transparent bg-[#EDEAFD] text-[#3C315B]',
        destructive:
          'border-transparent bg-red-50 text-red-600 border-red-200',
        outline: 'border-[#E5E4E8] bg-white text-[#3C315B]',
        success:
          'border-transparent bg-[#E6F9F0] text-[#2EC08B]',
        warning:
          'border-transparent bg-amber-50 text-amber-600 border-amber-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
