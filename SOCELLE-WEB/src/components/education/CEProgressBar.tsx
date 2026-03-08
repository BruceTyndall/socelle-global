import { GraduationCap } from 'lucide-react';

interface CEProgressBarProps {
  earned: number;
  goal: number;
}

export default function CEProgressBar({ earned, goal }: CEProgressBarProps) {
  const pct = Math.min((earned / goal) * 100, 100);

  return (
    <div className="bg-white rounded-xl border border-mn-surface p-6 shadow-soft">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-signal-warn/10">
            <GraduationCap className="w-5 h-5 text-signal-warn" />
          </div>
          <div>
            <p className="text-sm font-sans font-semibold text-graphite">
              CE Credits Progress
            </p>
            <p className="text-xs font-sans text-graphite/50">
              Annual requirement tracker
            </p>
          </div>
        </div>
        <span className="font-sans font-semibold text-2xl text-signal-warn tabular-nums">
          {earned}<span className="text-graphite/30 text-lg">/{goal}</span>
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-mn-surface rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-signal-warn to-signal-warn/70 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Label */}
      <p className="mt-3 text-xs font-sans text-graphite/50">
        <span className="font-semibold text-graphite">{earned} of {goal}</span>{' '}
        CE credits earned this cycle
      </p>
    </div>
  );
}
