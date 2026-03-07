/* ═══════════════════════════════════════════════════════════════
   EvidenceStrip — W12-26 Section Primitive
   Horizontal scrolling metrics strip with DEMO/LIVE labels.
   Replaces card grids with a non-card evidence presentation.
   Pearl Mineral V2 tokens only.
   ═══════════════════════════════════════════════════════════════ */

interface EvidenceItem {
  label: string;
  value: string;
  /** Optional trend indicator */
  trend?: 'up' | 'down' | 'stable';
  /** Optional source attribution */
  source?: string;
}

interface EvidenceStripProps {
  /** Section title */
  title?: string;
  /** Array of evidence items */
  items: EvidenceItem[];
  /** Is data from a live DB source? */
  isLive?: boolean;
  /** Background tone */
  bg?: 'default' | 'surface' | 'dark';
  /** Extra className */
  className?: string;
}

export default function EvidenceStrip({
  title,
  items,
  isLive = false,
  bg = 'dark',
  className = '',
}: EvidenceStripProps) {
  const bgClass = bg === 'dark'
    ? 'bg-mn-dark'
    : bg === 'surface'
      ? 'bg-mn-surface'
      : 'bg-mn-bg';

  const textPrimary = bg === 'dark' ? 'text-white' : 'text-graphite';
  const textSecondary = bg === 'dark' ? 'text-white/50' : 'text-graphite/50';
  const borderColor = bg === 'dark' ? 'border-white/10' : 'border-graphite/10';

  const trendColor = (trend?: string) => {
    if (trend === 'up') return 'text-signal-up';
    if (trend === 'down') return 'text-signal-down';
    return textPrimary;
  };

  return (
    <section className={`py-16 lg:py-20 ${bgClass} ${className}`}>
      <div className="section-container">
        {/* ── Header row ── */}
        {(title || true) && (
          <div className="flex items-center justify-between mb-10">
            {title && (
              <h3 className={`font-sans text-eyebrow ${textSecondary}`}>
                {title}
              </h3>
            )}
            {/* DEMO / LIVE badge — Doc Gate §F compliance */}
            {isLive ? (
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                <span className="inline-flex rounded-full h-2 w-2 bg-emerald-400 animate-pulse" />
                Live Data
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                <span className="inline-flex rounded-full h-2 w-2 bg-amber-400" />
                Demo Data
              </div>
            )}
          </div>
        )}

        {/* ── Horizontal scroll strip ── */}
        <div
          className="flex gap-0 overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0"
          style={{ scrollbarWidth: 'none' }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              className={`flex-none w-[220px] lg:flex-1 lg:w-auto min-w-0 px-6 lg:px-8 py-6 overflow-hidden ${i < items.length - 1 ? `border-r ${borderColor}` : ''}`}
            >
              <div className={`font-mono text-2xl lg:text-3xl tracking-tight leading-none ${trendColor(item.trend)}`}>
                {item.value}
              </div>
              <div className={`font-sans text-sm font-medium mt-2 line-clamp-2 ${textPrimary}`}>
                {item.label}
              </div>
              {item.source && (
                <div className={`font-sans text-[10px] uppercase tracking-wider mt-1 truncate ${textSecondary}`}>
                  {item.source}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
