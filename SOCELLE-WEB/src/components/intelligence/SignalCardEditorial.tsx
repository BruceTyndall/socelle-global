/* ═══════════════════════════════════════════════════════════════
   SignalCardEditorial — Intelligence Hub Public Feed
   Pearl Mineral V2 · Monocle-magazine aesthetic
   Variants: 'featured' (lead / full-width) | 'standard' (grid)
   Scroll-triggered entry via IntersectionObserver — no deps
   ═══════════════════════════════════════════════════════════════ */
import { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { IntelligenceSignal, SignalDirection, SignalType } from '../../lib/intelligence/types';

// ─── Editorial section labels ────────────────────────────────────────────────
const TYPE_LABELS: Partial<Record<SignalType, string>> = {
  product_velocity:    'Product Velocity',
  treatment_trend:     'Treatment Trend',
  ingredient_momentum: 'Ingredient Science',
  ingredient_trend:    'Ingredient Science',
  brand_adoption:      'Brand Adoption',
  brand_update:        'Brand Update',
  regional:            'Regional Markets',
  regional_market:     'Regional Markets',
  pricing_benchmark:   'Pricing Intelligence',
  regulatory_alert:    'Regulatory Alert',
  education:           'Education',
  industry_news:       'Industry',
  press_release:       'Press',
  social_trend:        'Social Trend',
  job_market:          'Workforce',
  event_signal:        'Events',
  research_insight:    'Research Insight',
  market_data:         'Market Data',
  supply_chain:        'Supply Chain',
};

// ─── Static class resolvers — JIT-safe (no string interpolation) ─────────────
function getTextClass(dir: SignalDirection, type: SignalType): string {
  if (type === 'regulatory_alert') return 'text-signal-warn';
  if (dir === 'up')   return 'text-signal-up';
  if (dir === 'down') return 'text-signal-down';
  return 'text-graphite/40';
}

function getBarClass(dir: SignalDirection, type: SignalType): string {
  if (type === 'regulatory_alert') return 'bg-signal-warn';
  if (dir === 'up')   return 'bg-signal-up';
  if (dir === 'down') return 'bg-signal-down';
  return 'bg-accent';
}

function getBorderLClass(dir: SignalDirection, type: SignalType): string {
  if (type === 'regulatory_alert') return 'border-l-signal-warn';
  if (dir === 'up')   return 'border-l-signal-up';
  if (dir === 'down') return 'border-l-signal-down';
  return 'border-l-accent';
}

// ─── Utilities ───────────────────────────────────────────────────────────────
function timeAgo(iso: string): string {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function formatMag(mag: number, dir: SignalDirection): string | null {
  if (mag === 0) return null;
  const sign = dir === 'up' ? '+' : dir === 'down' ? '−' : '';
  return `${sign}${Math.abs(mag)}%`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function DirGlyph({ dir, cls = 'w-4 h-4' }: { dir: SignalDirection; cls?: string }) {
  if (dir === 'up')   return <TrendingUp   className={`${cls} text-signal-up`}   aria-hidden />;
  if (dir === 'down') return <TrendingDown className={`${cls} text-signal-down`} aria-hidden />;
  return <Minus className={`${cls} text-graphite/30`} aria-hidden />;
}

function ConfidenceBar({
  score, dir, type,
}: {
  score: number; dir: SignalDirection; type: SignalType;
}) {
  const bar = getBarClass(dir, type);
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-14 h-[2px] bg-graphite/8 rounded-full overflow-hidden"
        role="meter"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Confidence ${Math.round(score)}%`}
      >
        <div
          className={`h-full rounded-full ${bar} opacity-70`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="font-mono text-label text-graphite/38 tabular-nums">
        {Math.round(score)}%
      </span>
    </div>
  );
}

// ─── Scroll reveal hook ───────────────────────────────────────────────────────
// One observer per card, disconnects after first intersection.
function useReveal(delayMs: number) {
  const ref  = useRef<HTMLElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const t = setTimeout(() => setOn(true), delayMs);
        obs.disconnect();
        return () => clearTimeout(t);
      },
      { threshold: 0.06, rootMargin: '0px 0px -20px 0px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delayMs]);

  return { ref, on };
}

// ══════════════════════════════════════════════════════════════════════════════
// Featured — lead signal, full-width, large typographic treatment
// ══════════════════════════════════════════════════════════════════════════════
export function SignalCardFeatured({
  signal,
  index = 0,
}: {
  signal: IntelligenceSignal;
  index?: number;
}) {
  const { ref, on } = useReveal(index * 50);
  const label      = TYPE_LABELS[signal.signal_type] ?? signal.signal_type;
  const mag        = formatMag(signal.magnitude, signal.direction);
  const textClass  = getTextClass(signal.direction, signal.signal_type);
  const barClass   = getBarClass(signal.direction, signal.signal_type);
  const borderL    = getBorderLClass(signal.direction, signal.signal_type);
  const source     = signal.source_name ?? signal.source;

  return (
    <article
      ref={ref as React.RefObject<HTMLElement>}
      className={[
        'relative bg-mn-card overflow-hidden rounded-card',
        'border border-graphite/8 border-l-[3px]',
        borderL,
        'transition-all duration-700',
        on ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5',
        'hover:shadow-glass hover:border-graphite/14 group cursor-pointer',
      ].join(' ')}
      style={{ transitionTimingFunction: 'cubic-bezier(0.25,0.46,0.45,0.94)' }}
    >
      <div className="px-8 py-8 lg:px-10 lg:py-9">

        {/* ── Eyebrow row ──────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-eyebrow text-accent/80 shrink-0">{label}</span>
            {signal.category && (
              <>
                <span className="text-graphite/18 text-xs select-none">·</span>
                <span className="text-eyebrow text-graphite/32 truncate">
                  {signal.category.toUpperCase()}
                </span>
              </>
            )}
          </div>

          {mag && (
            <div className={`flex items-center gap-1.5 shrink-0 ${textClass}`}>
              <DirGlyph dir={signal.direction} cls="w-5 h-5" />
              <span className="font-mono text-metric-md leading-none tabular-nums">{mag}</span>
            </div>
          )}
        </div>

        {/* ── Headline ─────────────────────────────────────────── */}
        <h2 className="text-subsection text-graphite leading-tight tracking-tight mb-5 pr-6 group-hover:text-graphite/78 transition-colors duration-300">
          {signal.title}
        </h2>

        {/* ── Hairline ─────────────────────────────────────────── */}
        <div className="border-t border-graphite/7 mb-5" />

        {/* ── Description ──────────────────────────────────────── */}
        {signal.description && (
          <p className="text-body text-graphite/52 leading-relaxed line-clamp-3 mb-7">
            {signal.description}
          </p>
        )}

        {/* ── Footer ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            {signal.confidence_score != null && (
              <ConfidenceBar
                score={signal.confidence_score}
                dir={signal.direction}
                type={signal.signal_type}
              />
            )}
            {source && (
              <span className="text-label text-graphite/28 truncate max-w-[180px]">{source}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`w-1.5 h-1.5 rounded-full ${barClass} opacity-50 animate-pulse-subtle`}
              aria-hidden
            />
            <span className="font-mono text-label text-graphite/28 tabular-nums">
              {timeAgo(signal.updated_at)} ago
            </span>
          </div>
        </div>

      </div>
    </article>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Standard — editorial grid card
// ══════════════════════════════════════════════════════════════════════════════
export function SignalCardStandard({
  signal,
  index = 0,
}: {
  signal: IntelligenceSignal;
  index?: number;
}) {
  const { ref, on } = useReveal(index * 55 + 100);
  const label     = TYPE_LABELS[signal.signal_type] ?? signal.signal_type;
  const mag       = formatMag(signal.magnitude, signal.direction);
  const textClass = getTextClass(signal.direction, signal.signal_type);
  const barClass  = getBarClass(signal.direction, signal.signal_type);
  const source    = signal.source_name ?? signal.source;

  return (
    <article
      ref={ref as React.RefObject<HTMLElement>}
      className={[
        'relative bg-mn-card border border-graphite/8 rounded-card overflow-hidden',
        'flex flex-col h-full',
        'transition-all duration-700',
        on ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5',
        'hover:border-graphite/16 hover:shadow-soft group cursor-pointer',
      ].join(' ')}
      style={{ transitionTimingFunction: 'cubic-bezier(0.25,0.46,0.45,0.94)' }}
    >
      {/* Top accent strip */}
      <div className={`h-[3px] w-full ${barClass} opacity-55 shrink-0`} aria-hidden />

      <div className="px-6 pt-5 pb-6 flex flex-col flex-1">

        {/* ── Eyebrow + magnitude ──────────────────────────────── */}
        <div className="flex items-start justify-between gap-2 mb-3.5">
          <span className="text-eyebrow text-accent/65 leading-none">{label}</span>
          {mag && (
            <span className={`font-mono text-sm font-semibold shrink-0 tabular-nums ${textClass}`}>
              {mag}
            </span>
          )}
        </div>

        {/* ── Headline ─────────────────────────────────────────── */}
        <h3 className="text-[1.0625rem] font-semibold text-graphite leading-snug tracking-tight mb-3 line-clamp-3 flex-1 group-hover:text-graphite/72 transition-colors duration-300">
          {signal.title}
        </h3>

        {/* ── Description ──────────────────────────────────────── */}
        {signal.description && (
          <p className="text-sm text-graphite/48 leading-relaxed line-clamp-3 mb-4">
            {signal.description}
          </p>
        )}

        {/* ── Footer ───────────────────────────────────────────── */}
        <div className="border-t border-graphite/6 pt-3 mt-auto">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {signal.confidence_score != null && (
                <>
                  <div
                    className="w-10 h-[2px] bg-graphite/8 rounded-full overflow-hidden shrink-0"
                    role="meter"
                    aria-valuenow={signal.confidence_score}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Confidence ${Math.round(signal.confidence_score)}%`}
                  >
                    <div
                      className={`h-full rounded-full ${barClass} opacity-65`}
                      style={{ width: `${signal.confidence_score}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-graphite/32 tabular-nums">
                    {Math.round(signal.confidence_score)}%
                  </span>
                </>
              )}
              {source && (
                <span className="text-[10px] text-graphite/26 truncate">{source}</span>
              )}
            </div>
            <span className="font-mono text-[10px] text-graphite/22 shrink-0 tabular-nums">
              {timeAgo(signal.updated_at)}
            </span>
          </div>
        </div>

      </div>
    </article>
  );
}
