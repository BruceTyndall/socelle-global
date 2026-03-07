interface TickerItem {
  tag: string;
  headline: string;
  timestamp: string;
}

interface NewsTickerProps {
  items: TickerItem[];
  speed?: number;
}

const TAG_STYLES: Record<string, string> = {
  Ingredient: 'bg-signal-up/10 text-signal-up',
  Ingredients: 'bg-signal-up/10 text-signal-up',
  Clinical: 'bg-accent/10 text-accent',
  'Brand Intel': 'bg-signal-warn/10 text-signal-warn',
  Market: 'bg-accent/10 text-accent',
  Regulatory: 'bg-signal-down/10 text-signal-down',
  Breaking: 'bg-signal-down/15 text-signal-down',
  Event: 'bg-signal-warn/10 text-signal-warn',
  Research: 'bg-accent/10 text-accent',
  Pricing: 'bg-signal-warn/10 text-signal-warn',
};

export function NewsTicker({ items, speed = 40 }: NewsTickerProps) {
  if (!items.length) return null;

  const doubled = [...items, ...items];
  const duration = items.length * speed;

  return (
    <section className="bg-mn-dark border-y border-mn-bg/5 overflow-hidden py-3 relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-mn-dark to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-mn-dark to-transparent z-10 pointer-events-none" />

      <div
        className="flex gap-8 whitespace-nowrap"
        style={{
          animation: `ticker-scroll ${duration}s linear infinite`,
          width: 'max-content',
        }}
      >
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-3 shrink-0">
            <span className={`text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full ${TAG_STYLES[item.tag] || 'bg-accent/10 text-accent'}`}>
              {item.tag}
            </span>
            <span className="text-mn-bg/70 text-sm">{item.headline}</span>
            <span className="text-mn-bg/30 text-xs font-mono">{item.timestamp}</span>
            <span className="text-mn-bg/10">•</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
