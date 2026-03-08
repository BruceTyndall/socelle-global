// TrendingBadge.tsx — Intelligence-enhanced product badge
// V2-HUBS-10: Shows when a product matches trending market signals
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendingBadgeProps {
  direction: 'up' | 'down' | 'stable';
  magnitude: number;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Shows a trending indicator badge on products that match market signal data.
 * Uses Pearl Mineral V2 signal tokens.
 */
export default function TrendingBadge({
  direction,
  magnitude,
  label,
  size = 'sm',
  className = '',
}: TrendingBadgeProps) {
  const Icon = direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : Minus;

  const colorClasses = {
    up: 'bg-signal-up/10 text-signal-up border-signal-up/20',
    down: 'bg-signal-down/10 text-signal-down border-signal-down/20',
    stable: 'bg-accent/10 text-accent border-accent/20',
  }[direction];

  const sizeClasses = size === 'md'
    ? 'text-xs px-2.5 py-1 gap-1.5'
    : 'text-[10px] px-2 py-0.5 gap-1';

  const iconSize = size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3';

  const absPercent = Math.abs(magnitude);
  const sign = direction === 'up' ? '+' : direction === 'down' ? '-' : '';

  return (
    <span
      className={`inline-flex items-center ${sizeClasses} rounded-full font-sans font-semibold border ${colorClasses} ${className}`}
    >
      <Icon className={iconSize} />
      {label ?? `${sign}${absPercent}%`}
    </span>
  );
}
