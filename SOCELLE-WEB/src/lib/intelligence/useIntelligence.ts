import { useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase';
import { mockSignals, mockMarketPulse } from './mockSignals';
import type { IntelligenceSignal, MarketPulse, SignalFilterKey, SignalType, TierVisibility } from './types';

// ── useIntelligence — V3 (W15-04): provenance columns + tier gating ──
// Fetches live signals from market_signals table (active + non-expired).
// Falls back to mockSignals when Supabase is unavailable.
// Returns isLive flag so UI can show DEMO/PREVIEW banners accordingly.
// V3: selects provenance fields (source_url, source_name, source_feed_id,
//     confidence_score, tier_visibility, image_url, is_duplicate).
//     Filters out duplicates. Applies tier gating based on userTier prop.

interface UseIntelligenceOptions {
  /** User's plan tier — controls which signals are visible. Default: 'free' */
  userTier?: TierVisibility;
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
  signal_type: SignalType;
  signal_key: string;
  title: string;
  description: string;
  magnitude: number;
  direction: 'up' | 'down' | 'stable';
  region: string | null;
  category: string | null;
  related_brands: string[] | null;
  related_products: string[] | null;
  updated_at: string;
  source: string | null;
  // W15-04: provenance + tier columns
  source_url: string | null;
  source_name: string | null;
  source_feed_id: string | null;
  confidence_score: number | null;
  tier_visibility: TierVisibility | null;
  image_url: string | null;
  is_duplicate: boolean;
}

function rowToSignal(row: MarketSignalRow): IntelligenceSignal {
  return {
    id: row.id,
    signal_type: row.signal_type,
    signal_key: row.signal_key,
    title: row.title,
    description: row.description,
    magnitude: row.magnitude,
    direction: row.direction,
    region: row.region ?? undefined,
    category: row.category ?? undefined,
    related_brands: row.related_brands ?? [],
    related_products: row.related_products ?? [],
    updated_at: row.updated_at,
    source: row.source ?? undefined,
    // W15-04: provenance fields
    source_url: row.source_url ?? undefined,
    source_name: row.source_name ?? undefined,
    source_feed_id: row.source_feed_id ?? undefined,
    confidence_score: row.confidence_score ?? undefined,
    tier_visibility: row.tier_visibility ?? undefined,
    image_url: row.image_url ?? undefined,
    is_duplicate: row.is_duplicate,
  };
}

/** Tier hierarchy for gating: admin sees everything, pro sees pro+free, free sees free only */
const TIER_ACCESS: Record<TierVisibility, TierVisibility[]> = {
  free: ['free'],
  pro: ['free', 'pro'],
  admin: ['free', 'pro', 'admin'],
};

export function useIntelligence(options?: UseIntelligenceOptions): UseIntelligenceReturn {
  const userTier = options?.userTier ?? 'free';
  const [activeFilter, setActiveFilter] = useState<SignalFilterKey>('all');
  const [rawSignals, setRawSignals] = useState<IntelligenceSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchSignals() {
      setLoading(true);

      if (!isSupabaseConfigured) {
        // No Supabase config — fall back immediately
        setRawSignals(mockSignals);
        setIsLive(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('market_signals')
          .select(
            'id, signal_type, signal_key, title, description, magnitude, direction, region, category, related_brands, related_products, updated_at, source, source_url, source_name, source_feed_id, confidence_score, tier_visibility, image_url, is_duplicate'
          )
          .eq('active', true)
          .eq('is_duplicate', false)
          .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
          .order('display_order', { ascending: true })
          .order('updated_at', { ascending: false });

        if (cancelled) return;

        if (error || !data || data.length === 0) {
          // Table empty or query error — use mock data as preview
          setRawSignals(mockSignals);
          setIsLive(false);
        } else {
          setRawSignals((data as MarketSignalRow[]).map(rowToSignal));
          setIsLive(true);
        }
      } catch {
        if (!cancelled) {
          setRawSignals(mockSignals);
          setIsLive(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSignals();
    return () => { cancelled = true; };
  }, []);

  // ── Derive marketPulse from live signal data ───────────────────────
  const marketPulse = useMemo((): MarketPulse => {
    if (!isLive) return mockMarketPulse;

    // Compute trending_category from most frequent category in live signals
    const catCounts = rawSignals.reduce<Record<string, number>>((acc, s) => {
      if (s.category) acc[s.category] = (acc[s.category] ?? 0) + 1;
      return acc;
    }, {});
    const trending_category =
      Object.entries(catCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ??
      mockMarketPulse.trending_category;

    return {
      ...mockMarketPulse,
      active_signals: rawSignals.length,
      signals_this_week: rawSignals.filter((s) => {
        const age = Date.now() - new Date(s.updated_at).getTime();
        return age < 7 * 24 * 60 * 60 * 1000;
      }).length,
      trending_category,
    };
  }, [isLive, rawSignals]);

  // ── Tier gating ────────────────────────────────────────────────────
  const allowedTiers = TIER_ACCESS[userTier];
  const tieredSignals = useMemo(() => {
    if (!isLive) return rawSignals; // mock data has no tier_visibility
    return rawSignals.filter((s) => {
      const tier = s.tier_visibility ?? 'free';
      return allowedTiers.includes(tier);
    });
  }, [rawSignals, isLive, allowedTiers]);

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
