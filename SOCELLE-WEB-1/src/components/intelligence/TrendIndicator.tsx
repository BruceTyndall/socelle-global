import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import type { SignalDirection } from '../../lib/intelligence/types';

interface TrendIndicatorProps {
  direction: SignalDirection;
  magnitude: number;
  /** Display raw number (e.g. "2.3x") or default percentage */
  suffix?: string;
}

export default function TrendIndicator({ direction, magnitude, suffix }: TrendIndicatorProps) {
  const label = suffix ?? `${magnitude}%`;

  if (direction === 'up') {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-400 text-sm font-semibold font-sans">
        <ArrowUp className="w-3.5 h-3.5" />
        <span>+{label}</span>
      </span>
    );
  }

  if (direction === 'down') {
    return (
      <span className="inline-flex items-center gap-1 text-red-400 text-sm font-semibold font-sans">
        <ArrowDown className="w-3.5 h-3.5" />
        <span>-{label}</span>
      </span>
    );
  }

  // stable
  return (
    <span className="inline-flex items-center gap-1 text-white/50 text-sm font-semibold font-sans">
      <Minus className="w-3.5 h-3.5" />
      <span>{label}</span>
    </span>
  );
}
