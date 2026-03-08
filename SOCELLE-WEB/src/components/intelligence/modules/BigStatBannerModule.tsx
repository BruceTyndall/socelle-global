// ── BigStatBannerModule — V2-INTEL-01 ────────────────────────────────
// Wrapper: renders big stat banner with live platform counts.
// Data source: useModuleAdapters().bigStats (from usePlatformStats)

import { useEffect, useRef, useState } from 'react';
import { useModuleAdapters } from './useModuleAdapters';
import { ModuleLoading, ModuleEmpty, DemoBadge, LiveBadge } from './ModuleStates';
import { ImageWithFallback } from './ImageWithFallback';

interface BigStatBannerModuleProps {
  backgroundImage?: string;
  eyebrow?: string;
}

export function BigStatBannerModule({ backgroundImage, eyebrow }: BigStatBannerModuleProps) {
  const { bigStats, loading, isLive } = useModuleAdapters();
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  if (loading) return <ModuleLoading label="Loading stats..." dark />;
  if (bigStats.length === 0) return <ModuleEmpty label="No platform stats available." dark />;

  return (
    <section ref={ref} className="relative py-16 lg:py-24 overflow-hidden">
      {backgroundImage && (
        <div className="absolute inset-0">
          <ImageWithFallback src={backgroundImage} alt="Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#1F2428]/85" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1F2428]/95 via-[#1F2428]/80 to-[#1F2428]/95" />
        </div>
      )}
      {!backgroundImage && <div className="absolute inset-0 bg-[#1F2428]" />}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {eyebrow && (
          <div className="text-center mb-12 flex items-center justify-center gap-3">
            <span className="eyebrow text-[#F7F5F2]/50">{eyebrow}</span>
            {isLive ? <LiveBadge dark /> : <DemoBadge dark />}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
          {bigStats.map((stat, i) => (
            <div
              key={i}
              className={`text-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div
                className="text-[#F7F5F2] text-5xl lg:text-7xl xl:text-8xl mb-3 tracking-tight"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {stat.prefix}{stat.value}{stat.suffix}
              </div>
              <div className="text-[#F7F5F2]/50 text-sm tracking-widest uppercase">
                {stat.label}
              </div>
              <div className="w-12 h-px bg-[#3F5465]/30 mx-auto mt-4" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
