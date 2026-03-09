/* ═══════════════════════════════════════════════════════════════
   FeedSidebar — Intelligence Hub right-rail panel
   Pearl Mineral V2 · sticky on desktop
   Sections: Signal Index · Trending · Category distribution
   ═══════════════════════════════════════════════════════════════ */
import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Radio } from 'lucide-react';
import type { IntelligenceSignal, MarketPulse, SignalType } from '../../lib/intelligence/types';

// ─── Humanise signal type for sidebar labels ─────────────────────────────────
const SHORT_LABELS: Partial<Record<SignalType, string>> = {
  product_velocity:    'Product',
  treatment_trend:     'Treatment',
  ingredient_momentum: 'Ingredient',
  ingredient_trend:    'Ingredient',
  brand_adoption:      'Brand',
  brand_update:        'Brand',
  regional:            'Regional',
  regional_market:     'Regional',
  pricing_benchmark:   'Pricing',
  regulatory_alert:    'Regulatory',
  education:           'Education',
  industry_news:       'Industry',
  press_release:       'Press',
  social_trend:        'Social',
  job_market:          'Workforce',
  event_signal:        'Events',
  research_insight:    'Research',
  market_data:         'Market',
  supply_chain:        'Supply Chain',
};

function timeAgo(iso: string): string {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Direction icon ───────────────────────────────────────────────────────────
function MiniDir({ dir }: { dir: 'up' | 'down' | 'stable' }) {
  if (dir === 'up')   return <TrendingUp   className="w-3 h-3 text-signal-up shrink-0"   aria-hidden />;
  if (dir === 'down') return <TrendingDown className="w-3 h-3 text-signal-down shrink-0" aria-hidden />;
  return <Minus className="w-3 h-3 text-graphite/30 shrink-0" aria-hidden />;
}

// ─── Section header ───────────────────────────────────────────────────────────
function SidebarSection({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-eyebrow text-graphite/40 leading-none">{label}</span>
      <div className="flex-1 border-t border-graphite/8" />
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface FeedSidebarProps {
  signals:       IntelligenceSignal[];
  marketPulse:   MarketPulse;
  isLive:        boolean;
  avgConfidence: number | null | undefined;
  lastRunAt:     string | null | undefined;
}

export default function FeedSidebar({
  signals,
  marketPulse,
  isLive,
  avgConfidence,
  lastRunAt,
}: FeedSidebarProps) {

  // ── Top 5 trending by absolute magnitude ──────────────────────
  const trending = useMemo(
    () =>
      [...signals]
        .sort((a, b) => Math.abs(b.magnitude) - Math.abs(a.magnitude))
        .slice(0, 7),
    [signals],
  );

  // ── Category distribution ──────────────────────────────────────
  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of signals) {
      const key = SHORT_LABELS[s.signal_type] ?? s.signal_type;
      counts[key] = (counts[key] ?? 0) + 1;
    }
    const sorted = Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6);
    const max = sorted[0]?.[1] ?? 1;
    return sorted.map(([label, count]) => ({ label, count, pct: Math.round((count / max) * 100) }));
  }, [signals]);

  const confDisplay = avgConfidence != null ? `${Math.round(avgConfidence)}%` : '—';

  return (
    <aside className="space-y-8">

      {/* ── Signal Index ──────────────────────────────────────────── */}
      <div className="bg-mn-card border border-graphite/8 rounded-card px-5 py-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-eyebrow text-graphite/50">Signal Index</span>
          <div className="flex items-center gap-1.5">
            {isLive ? (
              <>
                <Radio className="w-3 h-3 text-signal-up" aria-hidden />
                <span className="text-[10px] font-mono font-semibold text-signal-up tracking-wide">LIVE</span>
              </>
            ) : (
              <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-pill">
                DEMO
              </span>
            )}
          </div>
        </div>

        {/* Big count */}
        <p className="font-mono text-metric-xl text-graphite leading-none mb-1 tabular-nums">
          {signals.length.toLocaleString()}
        </p>
        <p className="text-label text-graphite/35">active signals</p>

        {/* Divider */}
        <div className="border-t border-graphite/7 my-4" />

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="font-mono text-lg font-semibold text-graphite tabular-nums">
              {marketPulse.signals_this_week}
            </p>
            <p className="text-label text-graphite/35">this week</p>
          </div>
          <div>
            <p className="font-mono text-lg font-semibold text-graphite tabular-nums">
              {confDisplay}
            </p>
            <p className="text-label text-graphite/35">avg confidence</p>
          </div>
        </div>

        {/* Last run */}
        {lastRunAt && (
          <div className="mt-4 pt-4 border-t border-graphite/6">
            <p className="text-label text-graphite/30">
              Feed updated {timeAgo(lastRunAt)}
            </p>
          </div>
        )}
      </div>

      {/* ── Trending Now ──────────────────────────────────────────── */}
      {trending.length > 0 && (
        <div className="bg-mn-card border border-graphite/8 rounded-card px-5 py-5">
          <SidebarSection label="Trending Now" />
          <ol className="space-y-3.5" aria-label="Trending signals">
            {trending.map((signal, i) => {
              const mag =
                signal.magnitude !== 0
                  ? `${signal.direction === 'up' ? '+' : signal.direction === 'down' ? '−' : ''}${Math.abs(signal.magnitude)}%`
                  : null;
              return (
                <li key={signal.id} className="flex items-start gap-3 group cursor-pointer">
                  {/* Rank */}
                  <span className="font-mono text-[11px] text-graphite/22 w-4 shrink-0 pt-0.5 tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  {/* Direction */}
                  <MiniDir dir={signal.direction} />

                  {/* Title */}
                  <span className="text-sm text-graphite/65 leading-snug line-clamp-2 flex-1 group-hover:text-graphite/90 transition-colors duration-200">
                    {signal.title}
                  </span>

                  {/* Magnitude */}
                  {mag && (
                    <span
                      className={[
                        'font-mono text-[11px] font-semibold shrink-0 tabular-nums',
                        signal.signal_type === 'regulatory_alert'
                          ? 'text-signal-warn'
                          : signal.direction === 'up'
                            ? 'text-signal-up'
                            : signal.direction === 'down'
                              ? 'text-signal-down'
                              : 'text-graphite/40',
                      ].join(' ')}
                    >
                      {mag}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* ── Category Distribution ─────────────────────────────────── */}
      {categories.length > 0 && (
        <div className="bg-mn-card border border-graphite/8 rounded-card px-5 py-5">
          <SidebarSection label="By Category" />
          <ul className="space-y-3" aria-label="Signal category distribution">
            {categories.map(({ label, count, pct }) => (
              <li key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-medium text-graphite/55">{label}</span>
                  <span className="font-mono text-[10px] text-graphite/30 tabular-nums">{count}</span>
                </div>
                <div
                  className="h-[2px] bg-graphite/6 rounded-full overflow-hidden"
                  role="meter"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${label}: ${count} signals`}
                >
                  <div
                    className="h-full bg-accent/50 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Trending Category ─────────────────────────────────────── */}
      {marketPulse.trending_category && marketPulse.trending_category !== 'No active category' && (
        <div className="bg-accent-soft border border-accent/12 rounded-card px-5 py-4">
          <span className="text-eyebrow text-accent/60 block mb-1.5">Most Active</span>
          <p className="text-sm font-semibold text-graphite/75 leading-snug">
            {marketPulse.trending_category}
          </p>
        </div>
      )}

    </aside>
  );
}
