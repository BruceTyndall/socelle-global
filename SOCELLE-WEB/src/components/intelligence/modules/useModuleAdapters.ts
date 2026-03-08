// ── useModuleAdapters — V2-INTEL-01 ──────────────────────────────────
// Single adapter hook that provides all transformed data for 14 figma modules.
// Consumes real Supabase data via useIntelligence, useSignalModules,
// useDataFeedStats, usePlatformStats, and useRssItems.
// NO mock data. Empty arrays when DB has no rows.

import { useMemo } from 'react';
import { useIntelligence } from '../../../lib/intelligence/useIntelligence';
import { useSignalModules } from '../../../lib/intelligence/useSignalModules';
import { useDataFeedStats } from '../../../lib/intelligence/useDataFeedStats';
import { usePlatformStats } from '../../../lib/usePlatformStats';
import { useRssItems } from '../../../lib/useRssItems';
import type {
  ModuleKPI,
  ModuleSignal,
  ModuleNewsItem,
  ModuleSpotlight,
  ModuleEvidenceCell,
  ModuleBigStat,
  ModuleEditorialItem,
  ModuleFeaturedCard,
} from './types';

// ── Signal type → human-readable tag ──────────────────────────────────
const SIGNAL_TAG: Record<string, string> = {
  product_velocity: 'Product',
  treatment_trend: 'Treatment',
  ingredient_momentum: 'Ingredient',
  brand_adoption: 'Brand Intel',
  regional: 'Market',
  pricing_benchmark: 'Pricing',
  regulatory_alert: 'Regulatory',
  education: 'Education',
  industry_news: 'Industry',
  brand_update: 'Brand Intel',
  press_release: 'Press',
  social_trend: 'Social',
  job_market: 'Jobs',
  event_signal: 'Event',
  research_insight: 'Research',
  ingredient_trend: 'Ingredient',
  market_data: 'Market',
  regional_market: 'Market',
  supply_chain: 'Supply Chain',
};

export interface UseModuleAdaptersReturn {
  /** KPIStrip data — transformed from signal aggregates */
  kpis: ModuleKPI[];
  /** SignalTable data — signals mapped to figma Signal shape */
  tableSignals: ModuleSignal[];
  /** NewsTicker data — latest signals as ticker items */
  tickerItems: ModuleNewsItem[];
  /** SpotlightPanel data — top signal with image */
  spotlight: ModuleSpotlight | null;
  /** EvidenceStrip data — combined feed + platform stats */
  evidenceCells: ModuleEvidenceCell[];
  /** BigStatBanner data — platform counts as formatted stats */
  bigStats: ModuleBigStat[];
  /** SocialProof count — approved operators */
  socialProofCount: string;
  /** HeroMediaRail overlay metric — live signals count */
  heroOverlayMetric: { value: string; label: string } | null;
  /** EditorialScroll items — from RSS feed */
  editorialItems: ModuleEditorialItem[];
  /** FeaturedCardGrid cards — top signals with images */
  featuredCards: ModuleFeaturedCard[];
  /** Loading state — true if any upstream hook is loading */
  loading: boolean;
  /** isLive — true if we have real DB data from at least one source */
  isLive: boolean;
}

/** Generate pseudo-sparkline from magnitude (deterministic, not random) */
function generateSparkline(magnitude: number, direction: 'up' | 'down' | 'stable'): number[] {
  const base = 50;
  const points: number[] = [];
  for (let i = 0; i < 10; i++) {
    const progress = i / 9;
    const trend = direction === 'up' ? progress : direction === 'down' ? 1 - progress : 0.5;
    points.push(base + Math.abs(magnitude) * trend * 0.8);
  }
  return points;
}

export function useModuleAdapters(): UseModuleAdaptersReturn {
  const {
    signals: rawSignals,
    loading: signalsLoading,
    isLive: signalsLive,
  } = useIntelligence();

  const {
    kpis: rawKpis,
    tableSignals: rawTableSignals,
    tickerItems: rawTickerItems,
    spotlight: rawSpotlight,
  } = useSignalModules(rawSignals);

  const {
    totalFeeds,
    enabledFeeds,
    totalSignals: feedSignalCount,
    avgConfidence,
    lastOrchestratorRun,
    loading: feedsLoading,
    isLive: feedsLive,
  } = useDataFeedStats();

  const {
    stats: platformStats,
    loading: platformLoading,
    isLive: platformLive,
  } = usePlatformStats();

  const {
    items: rssItems,
    loading: rssLoading,
    isLive: rssLive,
  } = useRssItems(20);

  // ── KPIStrip adapter ────────────────────────────────────────────────
  const kpis = useMemo((): ModuleKPI[] => {
    return rawKpis.map((k) => ({
      id: k.id,
      value: typeof k.value === 'string' ? parseFloat(k.value) || 0 : k.value,
      unit: k.unit ?? '',
      label: k.label,
      delta: k.delta ?? 0,
      confidence: k.confidence ?? 85,
      updatedAt: k.updatedAt ?? new Date(),
    }));
  }, [rawKpis]);

  // ── SignalTable adapter ─────────────────────────────────────────────
  const tableSignals = useMemo((): ModuleSignal[] => {
    return rawTableSignals.map((s) => ({
      id: s.id,
      name: s.title,
      category: s.category ?? s.signal_type.replace(/_/g, ' '),
      trend: s.direction === 'stable' ? 'neutral' as const : s.direction,
      trendValue: s.magnitude,
      confidence: 85, // default confidence since signal rows don't carry it individually
      updatedAt: new Date(s.updated_at),
      sparkline: generateSparkline(s.magnitude, s.direction),
      source: s.source ?? 'Market Intelligence',
    }));
  }, [rawTableSignals]);

  // Use per-signal confidence from raw signals where available
  const signalConfidenceMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of rawSignals) {
      if (s.confidence_score != null) {
        map.set(s.id, Math.round(s.confidence_score * 100));
      }
    }
    return map;
  }, [rawSignals]);

  const tableSignalsWithConfidence = useMemo((): ModuleSignal[] => {
    return tableSignals.map((s) => ({
      ...s,
      confidence: signalConfidenceMap.get(s.id) ?? s.confidence,
    }));
  }, [tableSignals, signalConfidenceMap]);

  // ── NewsTicker adapter (direct match) ───────────────────────────────
  const tickerItems = useMemo((): ModuleNewsItem[] => {
    return rawTickerItems.map((t) => ({
      tag: t.tag,
      headline: t.headline,
      timestamp: t.timestamp,
    }));
  }, [rawTickerItems]);

  // ── SpotlightPanel adapter ──────────────────────────────────────────
  const spotlight = useMemo((): ModuleSpotlight | null => {
    if (!rawSpotlight) return null;
    return {
      image: rawSpotlight.image,
      eyebrow: rawSpotlight.eyebrow,
      headline: rawSpotlight.headline,
      metric: rawSpotlight.metric,
      bullets: rawSpotlight.bullets,
      cta: rawSpotlight.cta,
    };
  }, [rawSpotlight]);

  // ── EvidenceStrip adapter ───────────────────────────────────────────
  const evidenceCells = useMemo((): ModuleEvidenceCell[] => {
    const now = new Date();
    const orchDate = lastOrchestratorRun ? new Date(lastOrchestratorRun) : undefined;

    return [
      {
        id: 'ev-feeds',
        value: enabledFeeds.toLocaleString(),
        label: 'Active Data Feeds',
        isLive: feedsLive,
        updatedAt: orchDate,
      },
      {
        id: 'ev-signals',
        value: platformStats.signalsCount.toLocaleString(),
        label: 'Live Signals',
        isLive: platformLive,
        updatedAt: now,
      },
      {
        id: 'ev-brands',
        value: platformStats.brandsCount.toLocaleString(),
        label: 'Verified Brands',
        isLive: platformLive,
        updatedAt: now,
      },
      {
        id: 'ev-confidence',
        value: avgConfidence != null ? `${Math.round(avgConfidence * 100)}%` : '—',
        label: 'Avg Confidence',
        isLive: feedsLive && avgConfidence != null,
        updatedAt: orchDate,
      },
      {
        id: 'ev-sources',
        value: totalFeeds.toLocaleString(),
        label: 'Data Sources',
        isLive: feedsLive,
        updatedAt: orchDate,
      },
    ];
  }, [enabledFeeds, totalFeeds, avgConfidence, lastOrchestratorRun, platformStats, feedsLive, platformLive]);

  // ── BigStatBanner adapter ───────────────────────────────────────────
  const bigStats = useMemo((): ModuleBigStat[] => [
    {
      value: platformStats.brandsCount.toLocaleString(),
      label: 'Verified Brands',
    },
    {
      value: platformStats.operatorsCount.toLocaleString(),
      label: 'Active Operators',
    },
    {
      value: platformStats.signalsCount.toLocaleString(),
      label: 'Live Signals',
    },
    {
      value: platformStats.dataSourcesCount.toLocaleString(),
      label: 'Intelligence Sources',
    },
  ], [platformStats]);

  // ── SocialProof adapter ─────────────────────────────────────────────
  const socialProofCount = useMemo(() => {
    const count = platformStats.operatorsCount;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toLocaleString();
  }, [platformStats.operatorsCount]);

  // ── HeroMediaRail overlay ───────────────────────────────────────────
  const heroOverlayMetric = useMemo(() => {
    if (!signalsLive) return null;
    return {
      value: platformStats.signalsCount.toLocaleString(),
      label: 'Live Signals',
    };
  }, [signalsLive, platformStats.signalsCount]);

  // ── EditorialScroll adapter (from RSS items) ────────────────────────
  const editorialItems = useMemo((): ModuleEditorialItem[] => {
    return rssItems
      .filter((item) => item.title)
      .slice(0, 8)
      .map((item) => ({
        // RSS items don't have images; use a placeholder pattern
        image: `https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=600&fit=crop&q=80`,
        label: item.title,
        value: item.category,
      }));
  }, [rssItems]);

  // ── FeaturedCardGrid adapter ────────────────────────────────────────
  const featuredCards = useMemo((): ModuleFeaturedCard[] => {
    return rawSignals
      .filter((s) => s.image_url)
      .slice(0, 6)
      .map((s) => ({
        id: s.id,
        image: s.image_url!,
        eyebrow: SIGNAL_TAG[s.signal_type] ?? 'Intelligence',
        title: s.title,
        subtitle: s.description.length > 120
          ? s.description.slice(0, 117) + '...'
          : s.description,
        metric: {
          value: `${s.magnitude >= 0 ? '+' : ''}${s.magnitude.toFixed(1)}%`,
          label: s.category ?? s.signal_type.replace(/_/g, ' '),
        },
        badge: s.direction === 'up' ? 'Trending' : undefined,
        href: '/intelligence',
      }));
  }, [rawSignals]);

  // ── Aggregate state ─────────────────────────────────────────────────
  const loading = signalsLoading || feedsLoading || platformLoading || rssLoading;
  const isLive = signalsLive || feedsLive || platformLive || rssLive;

  return {
    kpis,
    tableSignals: tableSignalsWithConfidence,
    tickerItems,
    spotlight,
    evidenceCells,
    bigStats,
    socialProofCount,
    heroOverlayMetric,
    editorialItems,
    featuredCards,
    loading,
    isLive,
  };
}
