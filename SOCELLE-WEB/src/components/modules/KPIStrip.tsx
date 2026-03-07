import { useEffect, useRef, useState } from 'react';

interface KPI {
  id: string;
  value: number | string;
  unit?: string;
  label: string;
  delta?: number;
  confidence?: number;
  updatedAt?: Date;
}

interface KPIStripProps {
  kpis: KPI[];
  title?: string;
}

function formatValue(value: number | string): string {
  if (typeof value === 'string') return value;
  if (value >= 1000) return value.toLocaleString();
  return String(value);
}

function timeSince(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function KPIStrip({ kpis, title }: KPIStripProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-mn-dark py-10 lg:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-signal-up animate-pulse" />
              <h3 className="text-mn-bg/50 text-eyebrow">{title}</h3>
            </div>
            <span className="text-mn-bg/20 text-xs font-mono">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {kpis.map((kpi, i) => (
            <div
              key={kpi.id}
              className={`text-center lg:text-left transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="flex items-baseline gap-1 justify-center lg:justify-start mb-1">
                <span className="text-metric-lg text-mn-bg font-mono">{formatValue(kpi.value)}</span>
                {kpi.unit && <span className="text-mn-bg/40 text-lg font-mono">{kpi.unit}</span>}
              </div>
              <div className="text-mn-bg/40 text-xs tracking-widest uppercase mb-2">{kpi.label}</div>
              <div className="flex items-center gap-2 justify-center lg:justify-start">
                {kpi.delta !== undefined && (
                  <span className={`text-xs font-mono ${kpi.delta >= 0 ? 'text-signal-up' : 'text-signal-down'}`}>
                    {kpi.delta >= 0 ? '↑' : '↓'} {Math.abs(kpi.delta)}%
                  </span>
                )}
                {kpi.confidence !== undefined && (
                  <span className="text-mn-bg/20 text-[10px] font-mono">{kpi.confidence}% conf</span>
                )}
                {kpi.updatedAt && (
                  <span className="text-mn-bg/20 text-[10px] font-mono">{timeSince(kpi.updatedAt)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
