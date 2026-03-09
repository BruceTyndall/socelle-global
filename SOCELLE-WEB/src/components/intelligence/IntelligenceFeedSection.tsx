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
import { Search, X } from 'lucide-react';
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

const FEED_FILTERS: FilterDef[] = [
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
  signals:       IntelligenceSignal[];
  loading:       boolean;
  isLive:        boolean;
  marketPulse:   MarketPulse;
  avgConfidence: number | null | undefined;
  lastRunAt:     string | null | undefined;
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
}: IntelligenceFeedSectionProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery,  setSearchQuery]  = useState<string>('');
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

  // ── Filter + search logic ─────────────────────────────────────
  const filteredSignals = useMemo<IntelligenceSignal[]>(() => {
    const def  = FEED_FILTERS.find((f) => f.key === activeFilter);
    const q    = searchQuery.trim().toLowerCase();

    let result = signals;

    // Type filter
    if (def?.types && def.types.length > 0) {
      const allowed = new Set<string>(def.types);
      result = result.filter((s) => allowed.has(s.signal_type));
    }

    // Full-text search across key fields
    if (q) {
      result = result.filter((s) => {
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
        return haystack.includes(q);
      });
    }

    return result;
  }, [signals, activeFilter, searchQuery]);

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
        <div className="mb-8 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <nav
            className="flex items-end gap-0 border-b border-graphite/8 min-w-max"
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
                  onClick={() => setActiveFilter(f.key)}
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
        </div>

        {/* ════════════════════════════════════════════════════════
            Search — terminal line input style
        ════════════════════════════════════════════════════════ */}
        <div className="mb-10 max-w-lg relative group">
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
                className="p-1 text-graphite/35 hover:text-graphite/65 transition-colors pointer-events-auto"
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
                  {/* Featured lead card */}
                  {featured && (
                    <SignalCardFeatured signal={featured} index={0} />
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
                        {gridSignals.map((signal, i) => (
                          <SignalCardStandard key={signal.id} signal={signal} index={i} />
                        ))}
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
