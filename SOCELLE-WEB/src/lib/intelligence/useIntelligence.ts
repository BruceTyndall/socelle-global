import { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../supabase';
import { useTier } from '../../hooks/useTier';
import type { IntelligenceSignal, MarketPulse, SignalFilterKey, SignalType, TierVisibility } from './types';

// ── useIntelligence — resilient live signal hook ──
// Fetches live signals from market_signals (active + non-expired) using a
// schema-safe column set so public pages do not hard-fail when optional
// provenance columns are absent in the current environment.
// Falls back to empty state when Supabase is unavailable.
// Returns isLive flag so UI can show DEMO/PREVIEW banners accordingly.
// Migrated to TanStack Query v5 (V2-TECH-04).

interface UseIntelligenceOptions {
  /** User's plan tier — controls which signals are visible. Default: 'free' */
  userTier?: TierVisibility;
  /**
   * INTEL-MEDSPA-01: Optional vertical filter.
   * 'medspa' | 'salon' | 'beauty_brand' | 'multi'
   * When set, only signals matching this vertical (or 'multi') are returned.
   */
  vertical?: 'medspa' | 'salon' | 'beauty_brand' | 'multi';
  /**
   * INTEL-MEDSPA-01: Explicit tier_min override for DB-level filtering.
   * 'free' = only tier_min='free' signals + 14-day window.
   * 'paid' = all signals, full history.
   * When omitted, derived from useTier() subscription state.
   */
  tierOverride?: 'free' | 'paid';
  /** INTEL-MEDSPA-01: Max signals to return (default 50). */
  limit?: number;
}

interface UseIntelligenceReturn {
  signals: IntelligenceSignal[];
  /** All signals before tier gating (for "upgrade to see N more" counts) */
  totalSignalCount: number;
  marketPulse: MarketPulse;
  loading: boolean;
  isLive: boolean;
  activeFilter: SignalFilterKey;
  setActiveFilter: (filter: SignalFilterKey) => void;
}

// ── DB row type (matches market_signals table) ─────────────────────

interface MarketSignalRow {
  id: string;
  signal_type: string | null;
  signal_key: string | null;
  title: string | null;
  description: string | null;
  magnitude: number | null;
  direction: string | null;
  region: string | null;
  category: string | null;
  related_brands: string[] | null;
  related_products: string[] | null;
  updated_at: string | null;
  source: string | null;
  source_type: string | null;
  data_source: string | null;
  confidence_score: number | null;
  // INTEL-MEDSPA-01: classification columns
  vertical: string | null;
  topic: string | null;
  tier_min: string | null;
  impact_score: number | null;
}

const VALID_SIGNAL_TYPES: ReadonlySet<SignalType> = new Set([
  'product_velocity',
  'treatment_trend',
  'ingredient_momentum',
  'brand_adoption',
  'regional',
  'pricing_benchmark',
  'regulatory_alert',
  'education',
  'industry_news',
  'brand_update',
  'press_release',
  'social_trend',
  'job_market',
  'event_signal',
  'research_insight',
  'ingredient_trend',
  'market_data',
  'regional_market',
  'supply_chain',
]);

function normalizeSignalType(value: string | null): SignalType {
  if (value && VALID_SIGNAL_TYPES.has(value as SignalType)) {
    return value as SignalType;
  }
  return 'market_data';
}

function normalizeDirection(value: string | null): 'up' | 'down' | 'stable' {
  if (value === 'up' || value === 'down' || value === 'stable') return value;
  return 'stable';
}

function rowToSignal(row: MarketSignalRow): IntelligenceSignal {
  const resolvedSource = row.source ?? row.data_source ?? row.source_type ?? undefined;

  return {
    id: row.id,
    signal_type: normalizeSignalType(row.signal_type),
    signal_key: row.signal_key ?? `signal-${row.id}`,
    title: row.title ?? 'Market signal',
    description: row.description ?? '',
    magnitude: typeof row.magnitude === 'number' ? row.magnitude : 0,
    direction: normalizeDirection(row.direction),
    region: row.region ?? undefined,
    category: row.category ?? undefined,
    related_brands: row.related_brands ?? [],
    related_products: row.related_products ?? [],
    updated_at: row.updated_at ?? new Date().toISOString(),
    source: resolvedSource,
    source_name: row.data_source ?? row.source_type ?? row.source ?? undefined,
    confidence_score: row.confidence_score ?? undefined,
    // Older/leaner environments may not have tier/provenance columns; default
    // to free visibility and non-duplicate for downstream UI compatibility.
    tier_visibility: 'free' as TierVisibility,
    is_duplicate: false,
  };
}

/** Tier hierarchy for gating: admin sees everything, pro sees pro+free, free sees free only */
const TIER_ACCESS: Record<TierVisibility, TierVisibility[]> = {
  free: ['free'],
  pro: ['free', 'pro'],
  admin: ['free', 'pro', 'admin'],
};

const EMPTY_MARKET_PULSE: MarketPulse = {
  total_professionals: 0,
  total_brands: 0,
  active_signals: 0,
  signals_this_week: 0,
  trending_category: 'No active category',
};

export function useIntelligence(options?: UseIntelligenceOptions): UseIntelligenceReturn {
  const userTier = options?.userTier ?? 'free';
  const [activeFilter, setActiveFilter] = useState<SignalFilterKey>('all');

  // INTEL-MEDSPA-01: resolve effective tier for tier_min DB filtering
  const { tier: subscriptionTier } = useTier();
  // Map subscription tier to tier_min gate: 'free' tier sees only free-labelled signals; any paid tier sees all
  const effectiveTierMin: 'free' | 'paid' = options?.tierOverride ?? (subscriptionTier === 'free' ? 'free' : 'paid');

  const { data: rawSignals = [], isLoading: loading } = useQuery({
    queryKey: ['market_signals', effectiveTierMin, options?.vertical, options?.limit],
    queryFn: async () => {
      let q = supabase
        .from('market_signals')
        .select(
          'id, signal_type, signal_key, title, description, magnitude, direction, region, category, related_brands, related_products, updated_at, source, source_type, data_source, confidence_score, vertical, topic, tier_min, impact_score'
        )
        .eq('active', true)
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
        .order('display_order', { ascending: true })
        .order('updated_at', { ascending: false })
        .limit(options?.limit ?? 50);

      // INTEL-MEDSPA-01: tier_min gate — free tier sees only free-labelled signals, 14-day window
      if (effectiveTierMin === 'free') {
        q = q.eq('tier_min', 'free');
        const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
        q = q.gte('updated_at', cutoff);
      }
      // Paid tier: no tier_min filter, full history

      // INTEL-MEDSPA-01: optional vertical filter (also includes 'multi' cross-vertical signals)
      if (options?.vertical) {
        q = (q as any).in('vertical', [options.vertical, 'multi']);
      }

      const { data, error } = await q;

      if (error) {
        console.warn('[useIntelligence] fetch error:', error.message);
        return [];
      }
      if (!data || data.length === 0) return [];
      return (data as MarketSignalRow[]).map(rowToSignal);
    },
    enabled: isSupabaseConfigured,
    staleTime: 60_000,
  });

  // ── Realtime: prepend new signals to top of feed with slide-in animation ──────
  const queryClient = useQueryClient();
  // Capture the exact queryKey used by this hook instance so the realtime
  // handler updates the same cache entry (not a bare ['market_signals'] ghost).
  const queryKey = ['market_signals', effectiveTierMin, options?.vertical, options?.limit];
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel('intelligence-hub-signals')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'market_signals' },
        (payload) => {
          const newSignal = rowToSignal(payload.new as MarketSignalRow);
          queryClient.setQueryData(
            queryKey,
            (old: IntelligenceSignal[] | undefined) => {
              if (!old) return [newSignal];
              return [newSignal, ...old].slice(0, 50);
            },
          );
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient, effectiveTierMin, options?.vertical, options?.limit]);

  const isLive = rawSignals.length > 0;

  // ── Derive marketPulse from live signal data ───────────────────────
  const marketPulse = useMemo((): MarketPulse => {
    if (!isLive) {
      const signalsThisWeek = rawSignals.filter((s) => {
        const age = Date.now() - new Date(s.updated_at).getTime();
        return age < 7 * 24 * 60 * 60 * 1000;
      }).length;

      return {
        ...EMPTY_MARKET_PULSE,
        active_signals: rawSignals.length,
        signals_this_week: signalsThisWeek,
      };
    }

    // Compute trending_category from most frequent category in live signals
    const catCounts = rawSignals.reduce<Record<string, number>>((acc, s) => {
      if (s.category) acc[s.category] = (acc[s.category] ?? 0) + 1;
      return acc;
    }, {});
    const trending_category =
      Object.entries(catCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ??
      EMPTY_MARKET_PULSE.trending_category;

    return {
      ...EMPTY_MARKET_PULSE,
      active_signals: rawSignals.length,
      signals_this_week: rawSignals.filter((s) => {
        const age = Date.now() - new Date(s.updated_at).getTime();
        return age < 7 * 24 * 60 * 60 * 1000;
      }).length,
      trending_category,
    };
  }, [isLive, rawSignals]);

  // ── Tier gating ────────────────────────────────────────────────────
  // Always filter by tier regardless of isLive. rowToSignal defaults
  // tier_visibility to 'free' for DB rows missing the column, so live
  // signals without the column pass correctly. Applying the filter to
  // all paths prevents tier bypass if signals are ever injected from
  // outside the DB query path.
  const allowedTiers = TIER_ACCESS[userTier];
  const tieredSignals = useMemo(() => {
    return rawSignals.filter((s) => {
      const tier = s.tier_visibility ?? 'free';
      return allowedTiers.includes(tier);
    });
  }, [rawSignals, allowedTiers]);

  // ── Filter + sort ──────────────────────────────────────────────────
  const signals = useMemo(() => {
    let filtered: IntelligenceSignal[];
    if (activeFilter === 'all') {
      filtered = [...tieredSignals];
    } else {
      filtered = tieredSignals.filter((s) => s.signal_type === activeFilter);
    }
    // Sort by magnitude descending (highest impact first)
    filtered.sort((a, b) => Math.abs(b.magnitude) - Math.abs(a.magnitude));
    return filtered;
  }, [tieredSignals, activeFilter]);

  return { signals, totalSignalCount: rawSignals.length, marketPulse, loading, isLive, activeFilter, setActiveFilter };
}
