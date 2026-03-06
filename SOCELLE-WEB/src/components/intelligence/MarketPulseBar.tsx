import { useEffect, useRef, useState } from 'react';
import { Activity, Users, Building2, Radio, TrendingUp } from 'lucide-react';
import type { MarketPulse } from '../../lib/intelligence/types';

// ── Animated counter ────────────────────────────────────────────────
function useAnimatedCount(target: number, duration = 1200): number {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);

  return count;
}

function PulseStat({
  icon: Icon,
  value,
  label,
  format,
}: {
  icon: React.ElementType;
  value: number;
  label: string;
  format?: 'number' | 'comma';
}) {
  const animated = useAnimatedCount(value);
  const ref = useRef<HTMLSpanElement>(null);

  const formatted =
    format === 'comma'
      ? animated.toLocaleString()
      : animated.toLocaleString();

  return (
    <div className="flex items-center gap-3 px-4 py-3 sm:px-5">
      <Icon className="w-4 h-4 text-accent flex-shrink-0" />
      <div className="min-w-0">
        <span ref={ref} className="block text-xl sm:text-2xl font-sans font-bold text-white tabular-nums leading-none">
          {formatted}
        </span>
        <span className="block text-[10px] sm:text-[11px] font-sans font-medium text-white/40 uppercase tracking-[0.1em] mt-1 whitespace-nowrap">
          {label}
        </span>
      </div>
    </div>
  );
}

interface MarketPulseBarProps {
  pulse: MarketPulse;
}

export default function MarketPulseBar({ pulse }: MarketPulseBarProps) {
  return (
    <div className="w-full bg-mn-dark border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between overflow-x-auto gap-0 sm:gap-2 -mx-4 sm:mx-0 scrollbar-hide">
          <PulseStat icon={Users} value={pulse.total_professionals} label="Professionals" />

          <div className="w-px h-8 bg-white/[0.08] flex-shrink-0 hidden sm:block" />

          <PulseStat icon={Building2} value={pulse.total_brands} label="Authorized Brands" />

          <div className="w-px h-8 bg-white/[0.08] flex-shrink-0 hidden sm:block" />

          <PulseStat icon={Activity} value={pulse.active_signals} label="Active Signals" />

          <div className="w-px h-8 bg-white/[0.08] flex-shrink-0 hidden sm:block" />

          <PulseStat icon={Radio} value={pulse.signals_this_week} label="This Week" />

          <div className="w-px h-8 bg-white/[0.08] flex-shrink-0 hidden sm:block" />

          <div className="flex items-center gap-3 px-4 py-3 sm:px-5">
            <TrendingUp className="w-4 h-4 text-accent flex-shrink-0" />
            <div className="min-w-0">
              <span className="block text-sm sm:text-base font-sans font-semibold text-white leading-tight">
                {pulse.trending_category}
              </span>
              <span className="block text-[10px] sm:text-[11px] font-sans font-medium text-white/40 uppercase tracking-[0.1em] mt-0.5 whitespace-nowrap">
                Top Category
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
