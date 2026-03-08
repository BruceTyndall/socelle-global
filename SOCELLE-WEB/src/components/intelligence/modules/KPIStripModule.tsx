// ── KPIStripModule — V2-INTEL-01 ─────────────────────────────────────
// Wrapper: renders KPI strip with live signal aggregate data.
// Data source: useModuleAdapters().kpis (from useSignalModules)

import { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useModuleAdapters } from './useModuleAdapters';
import { ModuleLoading, ModuleEmpty, DemoBadge, LiveBadge } from './ModuleStates';
import { formatTimeAgo, getFreshnessColor } from './freshness';
import type { ModuleKPI } from './types';

function AnimatedNumber({ value, duration = 800 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(value * eased);
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration]);

  const formatted = value >= 100
    ? Math.round(display).toLocaleString()
    : display.toFixed(1);

  return <div ref={ref}>{formatted}</div>;
}

interface KPIStripModuleProps {
  title?: string;
  dark?: boolean;
}

export function KPIStripModule({ title, dark = false }: KPIStripModuleProps) {
  const { kpis, loading, isLive } = useModuleAdapters();

  if (loading) return <ModuleLoading label="Loading KPIs..." dark={dark} />;
  if (kpis.length === 0) return <ModuleEmpty label="No signal data available." dark={dark} />;

  const bgClass = dark ? 'bg-[#1F2428]' : 'bg-[#FAF9F7]';
  const valueColor = dark ? 'text-[#F7F5F2]' : 'text-[#141418]';
  const textClass = dark ? 'text-[#F7F5F2]' : 'text-[#141418]';
  const subtextClass = dark ? 'text-[#F7F5F2]/60' : 'text-[#141418]/60';
  const badgeBorder = dark ? 'border-[#F7F5F2]/10' : 'border-[#141418]/10';
  const badgeText = dark ? 'text-[#F7F5F2]/30' : 'text-[#141418]/30';
  const gridColor = dark ? 'rgba(63,84,101,0.3)' : 'rgba(63,84,101,0.15)';

  return (
    <section className={`${bgClass} py-16 lg:py-24 relative overflow-hidden`}>
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
        style={{ background: 'radial-gradient(circle, #3F5465 0%, transparent 70%)', opacity: dark ? 0.03 : 0.05 }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {title && (
          <div className="text-center mb-14">
            <span className="flex items-center justify-center gap-2 mb-4">
              <span className="eyebrow text-[#141418]/50">Live Data</span>
              {isLive ? <LiveBadge dark={dark} /> : <DemoBadge dark={dark} />}
            </span>
            <h2 className={`${textClass} text-3xl lg:text-5xl`}>{title}</h2>
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-10">
          {kpis.map((kpi) => (
            <div key={kpi.id} className="text-center group panel-mineral p-6 relative">
              <div className={`${valueColor} text-4xl lg:text-5xl xl:text-6xl mb-3 relative z-10`} style={{ fontFamily: 'var(--font-mono)' }}>
                <AnimatedNumber value={kpi.value} />
                {kpi.unit && <span className="text-2xl lg:text-3xl ml-0.5">{kpi.unit}</span>}
              </div>
              <div className={`${subtextClass} text-xs tracking-widest uppercase mb-3`}>
                {kpi.label}
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span
                  className={`flex items-center gap-0.5 text-xs ${kpi.delta >= 0 ? 'text-[#5F8A72]' : 'text-[#8E6464]'}`}
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {kpi.delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {kpi.delta >= 0 ? '+' : ''}{kpi.delta}%
                </span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span
                  className={`${badgeText} text-[10px] px-2 py-0.5 rounded-full border ${badgeBorder}`}
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {kpi.confidence}% confidence
                </span>
              </div>
              <div
                className={`text-[10px] mt-1.5 ${getFreshnessColor(kpi.updatedAt)}`}
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {formatTimeAgo(kpi.updatedAt)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
