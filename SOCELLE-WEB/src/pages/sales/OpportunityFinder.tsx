import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  Loader2,
  Plus,
  Zap,
  Search,
  Filter,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useDeals, type NewDeal } from '../../lib/useDeals';
import { usePipelines } from '../../lib/usePipelines';

// ── V2-HUBS-09: Opportunity Finder ──────────────────────────────────────
// Data source: market_signals (LIVE when DB-connected) + deals
// Intelligence-driven deal creation: signals → opportunities → deals.
// NO outreach features (§P).

interface MarketSignal {
  id: string;
  signal_type: string;
  signal_key: string;
  title: string;
  description: string;
  magnitude: number;
  direction: 'up' | 'down' | 'stable';
  region: string | null;
  category: string | null;
  related_brands: string[] | null;
  updated_at: string;
  source: string | null;
  confidence_score: number | null;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

function estimateRevenue(magnitude: number): number {
  // Revenue estimate based on signal magnitude
  // Stronger signals = higher revenue potential
  const base = 5000;
  return Math.round(base * (1 + Math.abs(magnitude) / 10));
}

function DirectionIcon({ direction }: { direction: string }) {
  if (direction === 'up') return <TrendingUp className="w-4 h-4 text-signal-up" />;
  if (direction === 'down') return <TrendingDown className="w-4 h-4 text-signal-down" />;
  return <Minus className="w-4 h-4 text-graphite/40" />;
}

export default function OpportunityFinder() {
  const navigate = useNavigate();
  const { pipelines } = usePipelines();
  const { createDeal } = useDeals();
  const defaultPipeline = pipelines.find((p) => p.is_default) ?? pipelines[0];
  const firstStage = defaultPipeline?.stages?.[0];

  const [searchTerm, setSearchTerm] = useState('');
  const [directionFilter, setDirectionFilter] = useState<string>('up');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [creating, setCreating] = useState<string | null>(null);

  // Fetch high-value signals from market_signals
  const { data: signals = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ['opportunity_signals', directionFilter],
    queryFn: async () => {
      let query = supabase
        .from('market_signals')
        .select('id, signal_type, signal_key, title, description, magnitude, direction, region, category, related_brands, updated_at, source, confidence_score')
        .eq('is_active', true)
        .order('magnitude', { ascending: false })
        .limit(100);

      if (directionFilter) {
        query = query.eq('direction', directionFilter);
      }

      const { data, error } = await query;
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('does not exist') || error.code === '42P01') return [];
        throw new Error(error.message);
      }
      return (data ?? []) as MarketSignal[];
    },
  });

  const isLive = signals.length > 0 || !!queryError;

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const s of signals) {
      if (s.category) cats.add(s.category);
    }
    return Array.from(cats).sort();
  }, [signals]);

  // Apply client-side filters
  const filteredSignals = useMemo(() => {
    return signals.filter((s) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (!s.title.toLowerCase().includes(term) && !s.description.toLowerCase().includes(term)) return false;
      }
      if (categoryFilter && s.category !== categoryFilter) return false;
      return true;
    });
  }, [signals, searchTerm, categoryFilter]);

  // Create deal from signal
  const handleCreateDeal = useCallback(async (signal: MarketSignal) => {
    if (!defaultPipeline || !firstStage) return;
    setCreating(signal.id);
    try {
      const deal: NewDeal = {
        pipeline_id: defaultPipeline.id,
        stage_id: firstStage.id,
        title: `[Signal] ${signal.title}`,
        value: estimateRevenue(signal.magnitude),
        probability: Math.min(Math.round(signal.magnitude * 3), 90),
      };
      const created = await createDeal(deal);
      navigate(`/sales/deals/${created.id}`);
    } catch {
      // silent
    } finally {
      setCreating(null);
    }
  }, [defaultPipeline, firstStage, createDeal, navigate]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-accent" />
            <h1 className="text-3xl font-sans font-semibold text-graphite">
              Opportunity Finder
            </h1>
            {!isLive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-signal-warn/10 text-signal-warn font-sans">
                <AlertCircle className="w-3 h-3" />
                DEMO
              </span>
            )}
          </div>
          <p className="text-graphite/60 font-sans mt-1">
            Market signals with revenue potential. Create deals directly from intelligence.
          </p>
        </div>
        <button
          onClick={() => navigate('/sales/pipeline')}
          className="inline-flex items-center gap-2 h-10 px-5 border border-graphite/15 text-graphite text-sm font-sans font-semibold rounded-full hover:bg-mn-surface transition-colors"
        >
          View Pipeline <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/30" />
          <input
            type="text"
            placeholder="Search signals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 border border-graphite/15 rounded-xl text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-graphite/30" />
          <select
            value={directionFilter}
            onChange={(e) => setDirectionFilter(e.target.value)}
            className="h-10 px-3 border border-graphite/15 rounded-xl text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <option value="">All Directions</option>
            <option value="up">Trending Up</option>
            <option value="down">Trending Down</option>
            <option value="stable">Stable</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 px-3 border border-graphite/15 rounded-xl text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-graphite/8 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-xs font-sans text-graphite/50 uppercase tracking-wider">Signals Found</span>
          </div>
          <p className="text-2xl font-sans font-semibold text-graphite">{filteredSignals.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-graphite/8 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-signal-up" />
            <span className="text-xs font-sans text-graphite/50 uppercase tracking-wider">Total Revenue Potential</span>
          </div>
          <p className="text-2xl font-sans font-semibold text-graphite">
            {formatCurrency(filteredSignals.reduce((s, sig) => s + estimateRevenue(sig.magnitude), 0))}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-graphite/8 p-5">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-signal-warn" />
            <span className="text-xs font-sans text-graphite/50 uppercase tracking-wider">Avg Confidence</span>
          </div>
          <p className="text-2xl font-sans font-semibold text-graphite">
            {filteredSignals.length > 0
              ? `${Math.round(
                  filteredSignals.reduce((s, sig) => s + (sig.confidence_score ?? 70), 0) / filteredSignals.length
                )}%`
              : '--'}
          </p>
        </div>
      </div>

      {/* Signal Cards */}
      {filteredSignals.length === 0 ? (
        <div className="text-center py-20">
          <Zap className="w-12 h-12 text-graphite/15 mx-auto mb-3" />
          <p className="text-graphite/50 font-sans">No matching signals found.</p>
          <p className="text-graphite/30 font-sans text-sm mt-1">Try adjusting your filters or check back later for new signals.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSignals.map((signal) => (
            <div
              key={signal.id}
              className="bg-white rounded-2xl border border-graphite/8 p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mt-0.5">
                  <DirectionIcon direction={signal.direction} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-sans font-semibold text-graphite">{signal.title}</h3>
                      <p className="text-sm font-sans text-graphite/60 mt-1 line-clamp-2">{signal.description}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-lg font-sans font-semibold text-graphite">{formatCurrency(estimateRevenue(signal.magnitude))}</p>
                      <p className="text-xs font-sans text-graphite/40">est. revenue</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      signal.direction === 'up' ? 'bg-signal-up/10 text-signal-up'
                        : signal.direction === 'down' ? 'bg-signal-down/10 text-signal-down'
                          : 'bg-graphite/10 text-graphite/60'
                    }`}>
                      {signal.direction === 'up' ? '+' : signal.direction === 'down' ? '' : ''}{signal.magnitude}%
                    </span>
                    {signal.category && (
                      <span className="text-xs font-sans text-graphite/50 bg-mn-surface px-2 py-0.5 rounded-full">
                        {signal.category}
                      </span>
                    )}
                    {signal.region && (
                      <span className="text-xs font-sans text-graphite/40">{signal.region}</span>
                    )}
                    {signal.confidence_score != null && (
                      <span className="text-xs font-sans text-graphite/40">
                        {signal.confidence_score}% confidence
                      </span>
                    )}
                    <span className="text-xs font-sans text-graphite/30">
                      {new Date(signal.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  {signal.related_brands && signal.related_brands.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {signal.related_brands.slice(0, 5).map((brand) => (
                        <span key={brand} className="text-[10px] font-sans text-accent bg-accent/5 px-2 py-0.5 rounded-full">
                          {brand}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Create Deal CTA */}
                <div className="flex-shrink-0">
                  <button
                    onClick={() => handleCreateDeal(signal)}
                    disabled={creating === signal.id || !defaultPipeline}
                    className="inline-flex items-center gap-1.5 h-9 px-4 bg-graphite text-white text-sm font-sans font-semibold rounded-full hover:bg-graphite/90 transition-colors disabled:opacity-40"
                  >
                    {creating === signal.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Create Deal
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
