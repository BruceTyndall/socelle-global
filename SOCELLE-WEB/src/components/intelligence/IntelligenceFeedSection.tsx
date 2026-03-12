/* ═══════════════════════════════════════════════════════════════
   IntelligenceFeedSection — Intelligence Hub main editorial feed
   Pearl Mineral V2 · Monocle terminal aesthetic
   ─────────────────────────────────────────────────────────────
   Layout: full-width editorial filter bar →
           lg: 2/3 main column + 1/3 sticky sidebar
   Filter: horizontal editorial tab nav (no pill buttons)
   Search: borderless terminal line input
   Feed:   featured card (lead) + 2-col standard card grid
   ═══════════════════════════════════════════════════════════════ */
import { useMemo, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, SlidersHorizontal, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type {
  IntelligenceSignal,
  MarketPulse,
  SignalType,
} from '../../lib/intelligence/types';
import { SignalCardFeatured, SignalCardStandard } from './SignalCardEditorial';
import FeedSidebar from './FeedSidebar';
import FeedSkeleton from './FeedSkeleton';

// ─── Editorial filter config ─────────────────────────────────────────────────
// Each filter maps to one or more signal_type values.
// Using 'all' shows every signal; others narrow by type.
interface FilterDef {
  key: string;
  label: string;
  types?: SignalType[];
}

// INTEL-UI-REMEDIATION-01: exported so Intelligence.tsx can derive signalTypes
// from the active filter key and pass them to useIntelligence() for server-side filtering.
export const FEED_FILTERS: FilterDef[] = [
  { key: 'all',        label: 'All Signals' },
  { key: 'treatment',  label: 'Treatment',  types: ['treatment_trend'] },
  { key: 'ingredient', label: 'Ingredients', types: ['ingredient_momentum', 'ingredient_trend'] },
  { key: 'regulatory', label: 'Regulatory', types: ['regulatory_alert'] },
  { key: 'pricing',    label: 'Pricing',    types: ['pricing_benchmark'] },
  { key: 'research',   label: 'Research',   types: ['research_insight'] },
  { key: 'market',     label: 'Market',     types: ['market_data', 'industry_news'] },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface IntelligenceFeedSectionProps {
  signals:        IntelligenceSignal[];
  loading:        boolean;
  isLive:         boolean;
  marketPulse:    MarketPulse;
  avgConfidence:  number | null | undefined;
  lastRunAt:      string | null | undefined;
  /** INTEL-UI-REMEDIATION-01: controlled filter state (lifted to Intelligence.tsx) */
  activeFilter:   string;
  onFilterChange: (key: string) => void;
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {/* Mineral illustration — thin ring + inner dot */}
      <div className="relative w-16 h-16 mb-6" aria-hidden>
        <div className="absolute inset-0 rounded-full border border-graphite/10" />
        <div className="absolute inset-3 rounded-full border border-graphite/8" />
        <div className="absolute inset-[26px] rounded-full bg-graphite/10" />
      </div>
      <p className="text-sm font-semibold text-graphite/45 mb-1.5 tracking-wide uppercase">
        {hasSearch ? 'No matching signals' : 'No signals in this category'}
      </p>
      <p className="text-sm text-graphite/30 max-w-xs leading-relaxed">
        {hasSearch
          ? 'Adjust your search query or clear the filter to see all available signals.'
          : 'Try a different filter category, or check back when new signals are ingested.'}
      </p>
    </div>
  );
}

// ─── IntelligenceFeedSection ─────────────────────────────────────────────────
export default function IntelligenceFeedSection({
  signals,
  loading,
  isLive,
  marketPulse,
  avgConfidence,
  lastRunAt,
  activeFilter,
  onFilterChange,
}: IntelligenceFeedSectionProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [minImpact, setMinImpact] = useState<number>(0);
  const searchRef = useRef<HTMLInputElement>(null);

  // ── Keyboard shortcut: "/" focuses search ─────────────────────
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Search logic ──────────────────────────────────────────────
  // INTEL-UI-REMEDIATION-01: type filtering is now server-side (via useIntelligence signalTypes).
  // This memo only applies client-side full-text search on the already-filtered signal set.
  const filteredSignals = useMemo<IntelligenceSignal[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return signals;
    return signals.filter((s) => {
      const haystack = [
        s.title,
        s.description,
        s.signal_type,
        s.category,
        s.source,
        s.source_name,
        ...(s.related_brands   ?? []),
        ...(s.related_products ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      
      const textMatch = haystack.includes(q);
      const impactMatch = (s.impact_score ?? 0) >= minImpact;
      
      return textMatch && impactMatch;
    });
  }, [signals, searchQuery, minImpact]);

  // ── INTEL-POWER-05: Sentiment Aggregation ─────────────────────
  const sentiment = useMemo(() => {
    let up = 0, down = 0, stable = 0;
    for (const s of filteredSignals) {
      if (s.direction === 'up') up++;
      else if (s.direction === 'down') down++;
      else stable++;
    }
    const total = up + down + stable;
    if (total === 0) return null;
    return {
      upPct: Math.round((up / total) * 100),
      downPct: Math.round((down / total) * 100),
      stablePct: Math.round((stable / total) * 100),
      dominant: up > down ? (up > stable ? 'up' : 'stable') : (down > stable ? 'down' : 'stable'),
    };
  }, [filteredSignals]);

  const featured    = filteredSignals[0]  ?? null;
  const gridSignals = filteredSignals.slice(1);
  const hasResults  = filteredSignals.length > 0;

  return (
    <section id="signal-feed" aria-label="Intelligence Signal Feed" className="bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20 lg:pb-28">

        {/* ════════════════════════════════════════════════════════
            Section header
        ════════════════════════════════════════════════════════ */}
        <div className="mb-10">
          <span className="text-eyebrow text-accent/75 block mb-3">Live Signal Feed</span>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h2 className="text-section text-graphite leading-tight">
              Active Market Signals
            </h2>
            {!isLive && (
              <span className="text-xs font-semibold bg-signal-warn/10 text-signal-warn px-2.5 py-1 rounded-pill shrink-0">
                PREVIEW — Live signals populate when feeds are enabled
              </span>
            )}
          </div>
          {/* Thin rule under heading */}
          <div className="border-t border-graphite/8 mt-5" />
        </div>

        {/* ════════════════════════════════════════════════════════
            Editorial filter bar — horizontal tab style
        ════════════════════════════════════════════════════════ */}
        <div className="mb-0 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 flex items-center justify-between gap-4 border-b border-graphite/8">
          <nav
            className="flex items-end gap-0 min-w-max"
            role="tablist"
            aria-label="Signal category filters"
          >
            {FEED_FILTERS.map((f) => {
              const isActive = f.key === activeFilter;
              return (
                <button
                  key={f.key}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onFilterChange(f.key)}
                  className={[
                    'px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200',
                    'border-b-2 -mb-px relative',
                    isActive
                      ? 'text-graphite border-graphite'
                      : 'text-graphite/40 border-transparent hover:text-graphite/65 hover:border-graphite/20',
                  ].join(' ')}
                >
                  {f.label}
                </button>
              );
            })}
          </nav>

          {/* INTEL-POWER-05: More Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-sans font-medium transition-colors shrink-0 mb-1.5 ${
              showFilters || minImpact > 0
                ? 'bg-accent/10 text-accent'
                : 'bg-graphite/[0.04] text-graphite/60 hover:bg-graphite/[0.08]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            More Filters
            {minImpact > 0 && (
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-accent text-white text-[9px] -ml-0.5">
                1
              </span>
            )}
          </button>
        </div>

        {/* INTEL-POWER-05: Expanded Filters Panel */}
        {showFilters && (
          <div className="mb-8 mt-4 p-5 rounded-xl border border-graphite/8 bg-mn-card shadow-soft animate-fade-in flex flex-wrap gap-8 items-start">
            <div>
              <label htmlFor="impact-filter" className="block text-xs font-semibold text-graphite/60 uppercase tracking-wider mb-3 font-sans">
                Minimum Impact Score
              </label>
              <div className="flex items-center gap-4">
                <input
                  id="impact-filter"
                  type="range"
                  min="0"
                  max="80"
                  step="10"
                  value={minImpact}
                  onChange={(e) => setMinImpact(parseInt(e.target.value, 10))}
                  className="w-48 accent-accent"
                />
                <span className="text-sm font-mono text-graphite/80 w-8">{minImpact}+</span>
              </div>
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-graphite/60 uppercase tracking-wider mb-2 font-sans">
                Active View
              </label>
              <p className="text-sm font-sans text-graphite/80 leading-relaxed">
                Currently showing {filteredSignals.length} signal{filteredSignals.length === 1 ? '' : 's'}. 
                Adjusting the minimum impact score isolates highly disruptive market movements.
              </p>
            </div>
          </div>
        )}
        
        <div className={`mt-8 mb-10 max-w-lg relative group ${showFilters ? 'hidden' : ''}`}>
          <label htmlFor="feed-search" className="sr-only">Search signals</label>
          <input
            id="feed-search"
            ref={searchRef}
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search signals, ingredients, brands… ( / )"
            className={[
              'w-full bg-transparent border-0 border-b pb-2.5 pt-0',
              'text-[0.9375rem] text-graphite placeholder:text-graphite/28',
              'font-sans leading-none',
              'focus:outline-none transition-colors duration-200',
              searchQuery
                ? 'border-graphite/30'
                : 'border-graphite/12 group-hover:border-graphite/20 focus:border-graphite/35',
            ].join(' ')}
          />
          <div className="absolute right-0 top-0 flex items-center gap-1 pointer-events-none group-focus-within:pointer-events-auto">
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-2.5 -mr-1.5 text-graphite/35 hover:text-graphite/65 transition-colors pointer-events-auto"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" aria-hidden />
              </button>
            ) : (
              <Search className="w-3.5 h-3.5 text-graphite/22" aria-hidden />
            )}
          </div>
        </div>

        {/* ── Signal count line ──────────────────────────────────────── */}
        {!loading && (
          <div className="flex items-center gap-2 mb-8 text-label text-graphite/35">
            <span className="font-mono tabular-nums">{filteredSignals.length}</span>
            <span>
              {filteredSignals.length === 1 ? 'signal' : 'signals'}
              {searchQuery.trim()
                ? ` matching "${searchQuery.trim()}"`
                : activeFilter !== 'all'
                  ? ` — ${FEED_FILTERS.find((f) => f.key === activeFilter)?.label}`
                  : ''}
            </span>
          </div>
        )}

        {/* ── INTEL-POWER-05: Sentiment Aggregate Banner ──────────────── */}
        {!loading && hasResults && sentiment && (
          <div className="mb-8 flex items-center justify-between gap-6 p-4 rounded-xl border border-graphite/8 bg-white shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                sentiment.dominant === 'up' ? 'bg-[#5F8A72]/10' :
                sentiment.dominant === 'down' ? 'bg-[#8E6464]/10' :
                'bg-graphite/[0.04]'
              }`}>
                {sentiment.dominant === 'up' && <TrendingUp className="w-5 h-5 text-[#5F8A72]" />}
                {sentiment.dominant === 'down' && <TrendingDown className="w-5 h-5 text-[#8E6464]" />}
                {sentiment.dominant === 'stable' && <Minus className="w-5 h-5 text-graphite/40" />}
              </div>
              <div>
                <p className="text-[10px] font-sans font-bold text-graphite/40 uppercase tracking-widest mb-0.5">
                  Feed Sentiment
                </p>
                <p className="text-sm font-sans font-medium text-graphite">
                  {sentiment.dominant === 'up' ? 'Positive Momentum' : 
                   sentiment.dominant === 'down' ? 'Downward Pressure' : 
                   'Stable Market'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 flex-1 max-w-[200px] h-2 bg-graphite/[0.04] rounded-full overflow-hidden shrink-0">
              {sentiment.upPct > 0 && <div className="h-full bg-[#5F8A72]" style={{ width: `${sentiment.upPct}%` }} title={`Up: ${sentiment.upPct}%`} />}
              {sentiment.stablePct > 0 && <div className="h-full bg-graphite/20" style={{ width: `${sentiment.stablePct}%` }} title={`Stable: ${sentiment.stablePct}%`} />}
              {sentiment.downPct > 0 && <div className="h-full bg-[#8E6464]" style={{ width: `${sentiment.downPct}%` }} title={`Down: ${sentiment.downPct}%`} />}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            Loading state
        ════════════════════════════════════════════════════════ */}
        {loading && <FeedSkeleton />}

        {/* ════════════════════════════════════════════════════════
            Feed + sidebar (two-column at lg)
        ════════════════════════════════════════════════════════ */}
        {!loading && (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">

            {/* ── Main feed column ──────────────────────────────────── */}
            <div className="flex-1 min-w-0">
              {!hasResults ? (
                <EmptyState hasSearch={!!searchQuery.trim()} />
              ) : (
                <div className="space-y-6">
                  {/* Featured lead card — slide-in if arrived in last 2 min */}
                  {featured && (
                    <div className={new Date(featured.updated_at).getTime() > Date.now() - 2 * 60 * 1000 ? 'signal-new-item' : undefined}>
                      <Link
                        to={`/intelligence/signals/${featured.id}`}
                        className="block focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none rounded-card"
                        aria-label={`Read signal: ${featured.title}`}
                      >
                        <SignalCardFeatured signal={featured} index={0} />
                      </Link>
                    </div>
                  )}

                  {/* Grid — 2 columns at sm+ */}
                  {gridSignals.length > 0 && (
                    <>
                      {/* Grid section label */}
                      {featured && (
                        <div className="flex items-center gap-3 pt-2">
                          <span className="text-eyebrow text-graphite/30">More Signals</span>
                          <div className="flex-1 border-t border-graphite/7" />
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {gridSignals.map((signal, i) => {
                          const isNew = new Date(signal.updated_at).getTime() > Date.now() - 2 * 60 * 1000;
                          return (
                            <div key={signal.id} className={isNew ? 'signal-new-item' : undefined}>
                              <Link
                                to={`/intelligence/signals/${signal.id}`}
                                className="block h-full focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none rounded-card"
                                aria-label={`Read signal: ${signal.title}`}
                              >
                                <SignalCardStandard signal={signal} index={i} />
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ── Sidebar ───────────────────────────────────────────── */}
            <aside className="w-full lg:w-72 xl:w-80 shrink-0">
              <div className="lg:sticky lg:top-24">
                <FeedSidebar
                  signals={signals}
                  marketPulse={marketPulse}
                  isLive={isLive}
                  avgConfidence={avgConfidence}
                  lastRunAt={lastRunAt}
                />
              </div>
            </aside>

          </div>
        )}

      </div>
    </section>
  );
}
