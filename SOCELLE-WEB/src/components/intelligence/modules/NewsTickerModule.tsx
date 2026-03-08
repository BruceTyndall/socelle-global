// ── NewsTickerModule — V2-INTEL-01 ───────────────────────────────────
// Wrapper: renders scrolling ticker with live signal headlines.
// Data source: useModuleAdapters().tickerItems (from useSignalModules)

import { useRef, useEffect, useState } from 'react';
import { useModuleAdapters } from './useModuleAdapters';
import { ModuleLoading, ModuleEmpty, DemoBadge, LiveBadge } from './ModuleStates';
import { formatTimeAgo } from './freshness';
import type { ModuleNewsItem } from './types';

const TAG_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  'Product': { bg: 'bg-[#5F8A72]/15', text: 'text-[#5F8A72]', dot: 'bg-[#5F8A72]' },
  'Treatment': { bg: 'bg-[#5F8A72]/15', text: 'text-[#5F8A72]', dot: 'bg-[#5F8A72]' },
  'Ingredient': { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400' },
  'Brand Intel': { bg: 'bg-[#3F5465]/15', text: 'text-[#8FAEC4]', dot: 'bg-[#8FAEC4]' },
  'Market': { bg: 'bg-[#5F8A72]/15', text: 'text-[#5F8A72]', dot: 'bg-[#5F8A72]' },
  'Pricing': { bg: 'bg-purple-500/10', text: 'text-purple-400', dot: 'bg-purple-400' },
  'Regulatory': { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400' },
  'Education': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', dot: 'bg-cyan-400' },
  'Industry': { bg: 'bg-[#3F5465]/15', text: 'text-[#8FAEC4]', dot: 'bg-[#8FAEC4]' },
  'Press': { bg: 'bg-rose-500/15', text: 'text-rose-400', dot: 'bg-rose-400' },
  'Social': { bg: 'bg-purple-500/10', text: 'text-purple-400', dot: 'bg-purple-400' },
  'Jobs': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', dot: 'bg-cyan-400' },
  'Event': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', dot: 'bg-cyan-400' },
  'Research': { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400' },
  'Supply Chain': { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400' },
  'Signal': { bg: 'bg-[#5F8A72]/15', text: 'text-[#5F8A72]', dot: 'bg-[#5F8A72]' },
};

function TickerTag({ tag }: { tag: string }) {
  const style = TAG_STYLES[tag] || TAG_STYLES['Signal'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] tracking-widest uppercase ${style.bg} ${style.text}`}>
      <span className={`w-1 h-1 rounded-full ${style.dot} animate-pulse`} />
      {tag}
    </span>
  );
}

interface NewsTickerModuleProps {
  speed?: number;
}

export function NewsTickerModule({ speed = 40 }: NewsTickerModuleProps) {
  const { tickerItems, loading, isLive } = useModuleAdapters();
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || tickerItems.length === 0) return;

    let animationId: number;
    let position = 0;
    const contentWidth = track.scrollWidth / 2;

    const animate = () => {
      if (!isPaused) {
        position -= speed / 60;
        if (Math.abs(position) >= contentWidth) {
          position = 0;
        }
        track.style.transform = `translateX(${position}px)`;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [speed, isPaused, tickerItems.length]);

  if (loading) return <ModuleLoading label="Loading ticker..." dark />;
  if (tickerItems.length === 0) return <ModuleEmpty label="No recent signals." dark />;

  const doubled = [...tickerItems, ...tickerItems];

  return (
    <section className="relative bg-[#1F2428] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F7F5F2]/10 to-transparent" />

      <div className="border-b border-[#F7F5F2]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {isLive ? <LiveBadge /> : <DemoBadge dark />}
            <span className="text-[#F7F5F2]/20 text-[10px]">|</span>
            <span className="text-[#F7F5F2]/30 text-[10px] tracking-widest uppercase">
              Intelligence Wire
            </span>
          </div>
        </div>
      </div>

      <div
        className="relative py-5 cursor-default"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-[#1F2428] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-[#1F2428] to-transparent pointer-events-none" />

        <div ref={trackRef} className="flex items-center whitespace-nowrap will-change-transform">
          {doubled.map((item, i) => (
            <div key={`${item.headline}-${i}`} className="inline-flex items-center gap-3 px-6 shrink-0">
              <TickerTag tag={item.tag} />
              <span className="text-[#F7F5F2]/80 text-sm">{item.headline}</span>
              {item.timestamp && (
                <span className="text-[#F7F5F2]/25 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
                  {item.timestamp}
                </span>
              )}
              <span className="w-1 h-1 rounded-full bg-[#F7F5F2]/10 ml-3" />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F7F5F2]/10 to-transparent" />
    </section>
  );
}
