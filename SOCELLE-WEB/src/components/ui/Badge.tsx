import { HTMLAttributes } from 'react';

type BadgeVariant = 'default' | 'navy' | 'gold' | 'green' | 'red' | 'amber' | 'gray';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-pro-stone text-pro-charcoal',
  navy: 'bg-pro-navy text-white',
  gold: 'bg-pro-gold-pale text-pro-navy',
  green: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  red: 'bg-red-50 text-red-700 border border-red-200',
  amber: 'bg-amber-50 text-amber-700 border border-amber-200',
  gray: 'bg-gray-100 text-gray-600',
};

const dotClasses: Record<BadgeVariant, string> = {
  default: 'bg-pro-charcoal',
  navy: 'bg-white',
  gold: 'bg-pro-gold',
  green: 'bg-emerald-500',
  red: 'bg-red-500',
  amber: 'bg-amber-500',
  gray: 'bg-gray-400',
};

export function Badge({ variant = 'default', dot, className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium font-sans ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotClasses[variant]}`} />}
      {children}
    </span>
  );
}
