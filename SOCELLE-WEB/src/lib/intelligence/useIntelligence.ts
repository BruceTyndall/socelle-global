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
  /**
   * MERCH-REMEDIATION-01 MERCH-10: Timeline eligibility mode.
   * When true, applies stricter filter vs main table:
   * - impact_score >= 60 only
   * - signals updated within 72 hours
   * - excludes 'other' / 'general' topics
   * Used for "What Changed" feed.
   */
  timeline?: boolean;
  /**
   * INTEL-UI-REMEDIATION-01: Server-side signal_type filter.
   * When provided, only signals whose signal_type is in this array are returned.
   * Maps to the active editorial filter tab in IntelligenceFeedSection.
   * When undefined/empty, all signal types are returned.
   */
  signalTypes?: SignalType[];
  /**
   * INTEL-PREMIUM-01: Content segment filter.
   * When provided (not 'all'), only signals matching this content_segment are returned.
   */
  contentSegment?: string;
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
  // provenance columns (added by migrations — may be null in older rows)
  source_name: string | null;
  source_url: string | null;
  image_url: string | null;
  // original tier gate column — client-side gating (DB-level uses tier_min)
  tier_visibility: string | null;
  // MERCH-REMEDIATION-01: source authority tier (1=regulatory, 2=academic, 3=trade_pub)
  provenance_tier: number | null;
  // INTEL-PREMIUM-01: premium content columns
  article_body: string | null;
  article_html: string | null;
  hero_image_url: string | null;
  image_urls: string[] | null;
  content_segment: string | null;
  topic_tags: string[] | null;
  reading_time_minutes: number | null;
  word_count: number | null;
  quality_score: number | null;
  is_enriched: boolean | null;
  enriched_at: string | null;
  author: string | null;
  published_at: string | null;
  geo_source: string | null;
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
    // Use DB source_name column first; fall back to derived value for older rows
    source_name: row.source_name ?? row.data_source ?? row.source_type ?? row.source ?? undefined,
    source_url: row.source_url ?? undefined,
    image_url: row.image_url ?? undefined,
    confidence_score: row.confidence_score ?? undefined,
    // Read tier_visibility from DB; fall back to tier_min mapping; finally 'free' for older rows.
    tier_visibility: (row.tier_visibility === 'pro' || row.tier_visibility === 'admin'
      ? row.tier_visibility
      : row.tier_min === 'paid' ? 'pro' : 'free') as TierVisibility,
    is_duplicate: false,
    // INTEL-MEDSPA-01: classification + scoring — previously computed at ingest but dropped here
    impact_score: row.impact_score ?? undefined,
    vertical: row.vertical ?? undefined,
    topic: row.topic ?? undefined,
    tier_min: row.tier_min ?? undefined,
    // MERCH-REMEDIATION-01: source authority tier (1=regulatory, 2=academic, 3=trade_pub)
    provenance_tier: row.provenance_tier ?? 3,
    // INTEL-PREMIUM-01: premium content fields
    article_body: row.article_body ?? undefined,
    article_html: row.article_html ?? undefined,
    hero_image_url: row.hero_image_url ?? undefined,
    image_urls: row.image_urls ?? undefined,
    content_segment: row.content_segment ?? undefined,
    topic_tags: row.topic_tags ?? undefined,
    reading_time_minutes: row.reading_time_minutes ?? undefined,
    word_count: row.word_count ?? undefined,
    quality_score: row.quality_score ?? undefined,
    is_enriched: row.is_enriched ?? undefined,
    enriched_at: row.enriched_at ?? undefined,
    author: row.author ?? undefined,
    published_at: row.published_at ?? undefined,
    geo_source: row.geo_source ?? undefined,
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
    queryKey: ['market_signals', effectiveTierMin, options?.vertical, options?.limit, options?.timeline ?? false, options?.signalTypes ?? null, options?.contentSegment ?? null],
    queryFn: async () => {
      let q = supabase
        .from('market_signals')
        .select(
          'id, signal_type, signal_key, title, description, magnitude, direction, region, category, related_brands, related_products, updated_at, source, source_type, source_name, source_url, image_url, data_source, confidence_score, vertical, topic, tier_min, tier_visibility, impact_score, provenance_tier, article_body, article_html, hero_image_url, image_urls, content_segment, topic_tags, reading_time_minutes, word_count, quality_score, is_enriched, enriched_at, author, published_at, geo_source'
        )
        .eq('active', true)
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
        // INTEL-PREMIUM-01: quality_score DESC surfaces premium content first,
        // then provenance authority (tier 1=regulatory > tier 3=trade),
        // then display_order for editorial overrides, then published_at for freshness.
        // Decayed impact score re-ranking happens client-side (MERCH-04/05).
        .order('quality_score', { ascending: false, nullsFirst: false })
        .order('provenance_tier', { ascending: true })
        .order('display_order', { ascending: true })
        .order('published_at', { ascending: false, nullsFirst: false })
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

      // INTEL-UI-REMEDIATION-01: Server-side signal_type filter (category tab → DB filter)
      if (options?.signalTypes && options.signalTypes.length > 0) {
        q = (q as any).in('signal_type', options.signalTypes);
      }

      // INTEL-PREMIUM-01: Content segment filter
      if (options?.contentSegment && options.contentSegment !== 'all') {
        q = q.eq('content_segment', options.contentSegment);
      }

      // MERCH-10: Timeline eligibility — stricter filter for "What Changed" feed
      if (options?.timeline) {
        const cutoff72h = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
        q = q
          .gte('impact_score', 60)
          .gte('updated_at', cutoff72h)
          .not('topic', 'in', '("other","general")');
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
  const queryKey = ['market_signals', effectiveTierMin, options?.vertical, options?.limit, options?.timeline ?? false, options?.signalTypes ?? null, options?.contentSegment ?? null];
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
  // Belt-and-suspenders client-side gate. DB already filters by tier_min.
  // rowToSignal now reads tier_visibility from DB; falls back to tier_min
  // mapping (paid→pro); finally 'free' for rows predating the column.
  // This prevents bypass if signals are injected outside the DB query path.
  const allowedTiers = TIER_ACCESS[userTier];
  const tieredSignals = useMemo(() => {
    return rawSignals.filter((s) => {
      const tier = s.tier_visibility ?? 'free';
      return allowedTiers.includes(tier);
    });
  }, [rawSignals, allowedTiers]);

  // ── MERCH-04: Freshness decay multipliers ──────────────────────────
  // Applied to impact_score before ranking. Keeps recent signals competitive
  // against high-scoring but stale content.
  function freshnessDecay(updatedAt: string): number {
    const hoursOld = (Date.now() - new Date(updatedAt).getTime()) / 3_600_000;
    if (hoursOld < 2)  return 1.0;
    if (hoursOld < 6)  return 0.875;
    if (hoursOld < 24) return 0.75;
    if (hoursOld < 72) return 0.625;
    return 0.375;
  }

  // ── MERCH-01: Provenance authority weights ──────────────────────────
  // Tier 1 (regulatory/FDA) gets highest multiplier; trade press gets 1×.
  const PROVENANCE_WEIGHTS: Record<number, number> = {
    1: 2.0,   // regulatory authority (FDA, FTC, EPA)
    2: 1.4,   // academic/clinical
    3: 1.0,   // trade press / brand news (default)
  };

  // ── MERCH-05: Compute ranked score (decay × provenance × impact) ─────
  function rankedScore(s: IntelligenceSignal): number {
    const base   = s.impact_score ?? 50;
    const decay  = freshnessDecay(s.updated_at);
    const prov   = PROVENANCE_WEIGHTS[s.provenance_tier ?? 3] ?? 1.0;
    return base * decay * prov;
  }

  // ── Filter + sort + MERCH-03 safety pin + MERCH-09 topic cap ──────
  const signals = useMemo(() => {
    let filtered: IntelligenceSignal[];
    if (activeFilter === 'all') {
      filtered = [...tieredSignals];
    } else {
      filtered = tieredSignals.filter((s) => s.signal_type === activeFilter);
    }

    // MERCH-03: Safety pinning — regulatory_alert signals float to top.
    // Within each group, sort by rankedScore (MERCH-01 + MERCH-04 + MERCH-05).
    const safetySignals = filtered
      .filter((s) => s.signal_type === 'regulatory_alert')
      .sort((a, b) => rankedScore(b) - rankedScore(a));

    const otherSignals = filtered
      .filter((s) => s.signal_type !== 'regulatory_alert')
      .sort((a, b) => rankedScore(b) - rankedScore(a));

    const sorted = [...safetySignals, ...otherSignals];

    // MERCH-09: Topic distribution cap — no single topic exceeds 40% of feed.
    // Applied after safety pinning so safety signals still lead.
    const total = sorted.length;
    if (total === 0) return sorted;
    const cap = Math.ceil(total * 0.4);
    const topicCounts: Record<string, number> = {};
    const capped: IntelligenceSignal[] = [];
    for (const s of sorted) {
      const topic = s.topic ?? 'general';
      const count = topicCounts[topic] ?? 0;
      if (count < cap) {
        capped.push(s);
        topicCounts[topic] = count + 1;
      }
    }
    return capped;
  }, [tieredSignals, activeFilter]);

  return { signals, totalSignalCount: rawSignals.length, marketPulse, loading, isLive, activeFilter, setActiveFilter };
}
