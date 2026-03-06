import { GraduationCap } from 'lucide-react';

interface CEProgressBarProps {
  earned: number;
  goal: number;
}

export default function CEProgressBar({ earned, goal }: CEProgressBarProps) {
  const pct = Math.min((earned / goal) * 100, 100);

  return (
    <div className="bg-white rounded-xl border border-pro-stone/60 p-6 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-pro-gold/10">
            <GraduationCap className="w-5 h-5 text-pro-gold" />
          </div>
          <div>
            <p className="text-sm font-sans font-semibold text-pro-charcoal">
              CE Credits Progress
            </p>
            <p className="text-xs font-sans text-pro-warm-gray">
              Annual requirement tracker
            </p>
          </div>
        </div>
        <span className="font-serif text-2xl text-pro-gold tabular-nums">
          {earned}<span className="text-pro-warm-gray/50 text-lg">/{goal}</span>
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-pro-cream rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-pro-gold to-pro-gold-light rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Label */}
      <p className="mt-3 text-xs font-sans text-pro-warm-gray">
        <span className="font-semibold text-pro-charcoal">{earned} of {goal}</span>{' '}
        CE credits earned this cycle
      </p>
    </div>
  );
}
