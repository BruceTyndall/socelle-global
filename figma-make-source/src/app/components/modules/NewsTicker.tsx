import { useRef, useEffect, useState } from 'react';

/*
 * SUPABASE INTEGRATION — NewsTicker.tsx
 * ──────────────────────────────────────────────────────────────
 *
 * This component currently receives items as props. When Supabase
 * is connected, the parent pages (Home, Intelligence, ArticleFeed)
 * should query recent articles and pass them down. No changes
 * needed in this component itself — it's a pure presentation layer.
 *
 * For REALTIME updates (new stories appear in the ticker live):
 *   In the parent component, subscribe to Supabase Realtime:
 *
 *   const [tickerItems, setTickerItems] = useState<NewsItem[]>(initial);
 *
 *   useEffect(() => {
 *     const channel = supabase
 *       .channel('ticker-feed')
 *       .on('postgres_changes', {
 *         event: 'INSERT',
 *         schema: 'public',
 *         table: 'articles',
 *         filter: 'published_at=not.is.null',
 *       }, (payload) => {
 *         const newItem = {
 *           tag: payload.new.category,
 *           headline: payload.new.title,
 *           timestamp: 'Just now',
 *         };
 *         setTickerItems(prev => [newItem, ...prev.slice(0, 9)]);
 *       })
 *       .subscribe();
 *     return () => { supabase.removeChannel(channel); };
 *   }, []);
 *
 *   <NewsTicker items={tickerItems} />
 *
 * The ticker will seamlessly absorb new items as they publish
 * from the admin portal without any page refresh.
 * ──────────────────────────────────────────────────────────────
 */

interface NewsItem {
  tag: string;
  headline: string;
  timestamp?: string;
}

interface NewsTickerProps {
  items: NewsItem[];
  speed?: number; // pixels per second
}

const TAG_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  'Market Signal': { bg: 'bg-[#5F8A72]/15', text: 'text-[#5F8A72]', dot: 'bg-[#5F8A72]' },
  'Brand Intel': { bg: 'bg-[#3F5465]/15', text: 'text-[#8FAEC4]', dot: 'bg-[#8FAEC4]' },
  'Clinical Data': { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-400' },
  'Regulatory': { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400' },
  'Trending': { bg: 'bg-purple-500/10', text: 'text-purple-400', dot: 'bg-purple-400' },
  'Event': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', dot: 'bg-cyan-400' },
  'Breaking': { bg: 'bg-rose-500/15', text: 'text-rose-400', dot: 'bg-rose-400' },
};

function TickerTag({ tag }: { tag: string }) {
  const style = TAG_STYLES[tag] || TAG_STYLES['Market Signal'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] tracking-widest uppercase ${style.bg} ${style.text}`}>
      <span className={`w-1 h-1 rounded-full ${style.dot} animate-pulse`} />
      {tag}
    </span>
  );
}

export function NewsTicker({ items, speed = 40 }: NewsTickerProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let animationId: number;
    let position = 0;
    const contentWidth = track.scrollWidth / 2; // We duplicate items, so half is the real content

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
  }, [speed, isPaused]);

  // Duplicate items for seamless loop
  const doubled = [...items, ...items];

  return (
    <section className="relative bg-[#1F2428] overflow-hidden">
      {/* Top rule */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F7F5F2]/10 to-transparent" />

      {/* Live indicator bar */}
      <div className="border-b border-[#F7F5F2]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5F8A72] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5F8A72]" />
              </span>
              <span className="text-[#5F8A72] text-[10px] tracking-[0.25em] uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
                Live Feed
              </span>
            </span>
            <span className="text-[#F7F5F2]/20 text-[10px]">|</span>
            <span className="text-[#F7F5F2]/30 text-[10px] tracking-widest uppercase">
              Intelligence Wire
            </span>
          </div>
          <span className="text-[#F7F5F2]/20 text-[10px] hidden sm:block" style={{ fontFamily: 'var(--font-mono)' }}>
            Updated 3m ago
          </span>
        </div>
      </div>

      {/* Scrolling ticker */}
      <div
        className="relative py-5 cursor-default"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Edge fades */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-[#1F2428] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-[#1F2428] to-transparent pointer-events-none" />

        <div ref={trackRef} className="flex items-center whitespace-nowrap will-change-transform">
          {doubled.map((item, i) => (
            <div
              key={`${item.headline}-${i}`}
              className="inline-flex items-center gap-3 px-6 shrink-0"
            >
              <TickerTag tag={item.tag} />
              <span className="text-[#F7F5F2]/80 text-sm">
                {item.headline}
              </span>
              {item.timestamp && (
                <span className="text-[#F7F5F2]/25 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
                  {item.timestamp}
                </span>
              )}
              {/* Separator dot */}
              <span className="w-1 h-1 rounded-full bg-[#F7F5F2]/10 ml-3" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom rule */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#F7F5F2]/10 to-transparent" />
    </section>
  );
}