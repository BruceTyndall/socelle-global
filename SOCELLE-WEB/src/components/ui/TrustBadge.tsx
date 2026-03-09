import { Shield, CheckCircle, BadgeCheck, Lock } from 'lucide-react';

type TrustVariant = 'licensed' | 'verified' | 'authorized' | 'pricing';
type TrustSize = 'sm' | 'md';

interface TrustBadgeProps {
  variant: TrustVariant;
  size?: TrustSize;
  className?: string;
}

const VARIANT_CONFIG: Record<TrustVariant, { icon: typeof Shield; label: string }> = {
  licensed:   { icon: Shield,     label: 'Licensed Professionals Only' },
  verified:   { icon: CheckCircle, label: 'Verified Professional Pricing' },
  authorized: { icon: BadgeCheck,  label: 'Authorized Brands Only' },
  pricing:    { icon: Lock,        label: 'Transparent Wholesale Pricing' },
};

const sizeClasses: Record<TrustSize, { wrapper: string; icon: string; text: string }> = {
  sm: { wrapper: 'gap-1.5', icon: 'w-3.5 h-3.5', text: 'text-xs' },
  md: { wrapper: 'gap-2',   icon: 'w-4 h-4',     text: 'text-sm' },
};

export function TrustBadge({ variant, size = 'sm', className = '' }: TrustBadgeProps) {
  const { icon: Icon, label } = VARIANT_CONFIG[variant];
  const s = sizeClasses[size];

  return (
    <span
      className={`inline-flex items-center ${s.wrapper} font-sans font-medium ${s.text} text-graphite/70 ${className}`}
    >
      <Icon className={`${s.icon} text-graphite flex-shrink-0`} />
      {label}
    </span>
  );
}
