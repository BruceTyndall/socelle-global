// ── useSignalModules — W15-04 ─────────────────────────────────────────
// Transforms IntelligenceSignal[] into data shapes consumed by:
//   KPIStrip, SignalTable, NewsTicker, SpotlightPanel
// Pure derivation — no fetching. Pair with useIntelligence().
// Tier gating is handled upstream in useIntelligence; this hook shapes only.

import { useMemo } from 'react';
import type { IntelligenceSignal, TierVisibility } from './types';

// ── Module data shapes (matching component prop interfaces) ───────────

export interface ModuleKPI {
  id: string;
  value: number | string;
  unit?: string;
  label: string;
  delta?: number;
  confidence?: number;
  updatedAt?: Date;
}

export interface ModuleSignalRow {
  id: string;
  signal_type: string;
  title: string;
  magnitude: number;
  direction: 'up' | 'down' | 'stable';
  category?: string;
  source?: string;
  updated_at: string;
}

export interface ModuleTickerItem {
  tag: string;
  headline: string;
  timestamp: string;
}

export interface ModuleSpotlightData {
  image: string;
  eyebrow: string;
  headline: string;
  metric?: { value: string; label: string };
  bullets: string[];
  cta?: { label: string; href: string };
  trending?: { label: string; value: string; trend: 'up' | 'down' | 'stable' }[];
}

// ── Return type ───────────────────────────────────────────────────────

export interface UseSignalModulesReturn {
  /** Top 4 KPIs derived from signal aggregates */
  kpis: ModuleKPI[];
  /** All signals shaped for SignalTable */
  tableSignals: ModuleSignalRow[];
  /** Latest 12 signals shaped for NewsTicker */
  tickerItems: ModuleTickerItem[];
  /** Top signal with image shaped for SpotlightPanel (null if none qualify) */
  spotlight: ModuleSpotlightData | null;
}

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

// ── Helpers ───────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function mostFrequent(arr: string[]): string | undefined {
  const counts: Record<string, number> = {};
  for (const v of arr) counts[v] = (counts[v] ?? 0) + 1;
  return Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0];
}

// ── Hook ──────────────────────────────────────────────────────────────

interface UseSignalModulesOptions {
  /** Max ticker items (default 12) */
  tickerMax?: number;
  /** Max table rows (default 20) */
  tableMax?: number;
  /** User tier — used for "upgrade" CTA in spotlight */
  userTier?: TierVisibility;
}

export function useSignalModules(
  signals: IntelligenceSignal[],
  options?: UseSignalModulesOptions,
): UseSignalModulesReturn {
  const tickerMax = options?.tickerMax ?? 12;
  const tableMax = options?.tableMax ?? 20;

  // ── KPI Strip (top 4 aggregate metrics) ─────────────────────────────
  const kpis = useMemo((): ModuleKPI[] => {
    if (signals.length === 0) return [];

    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const thisWeek = signals.filter((s) => now - new Date(s.updated_at).getTime() < weekMs);
    const avgMag = signals.reduce((sum, s) => sum + Math.abs(s.magnitude), 0) / signals.length;
    const upCount = signals.filter((s) => s.direction === 'up').length;
    const categories = signals.map((s) => s.category).filter(Boolean) as string[];
    const topCategory = mostFrequent(categories) ?? 'N/A';

    const newestDate = signals.reduce((latest, s) => {
      const d = new Date(s.updated_at);
      return d > latest ? d : latest;
    }, new Date(0));

    return [
      {
        id: 'kpi-active-signals',
        value: signals.length,
        label: 'Active Signals',
        delta: thisWeek.length > 0 ? Math.round((thisWeek.length / signals.length) * 100) : undefined,
        updatedAt: newestDate,
      },
      {
        id: 'kpi-this-week',
        value: thisWeek.length,
        label: 'This Week',
        updatedAt: newestDate,
      },
      {
        id: 'kpi-avg-magnitude',
        value: avgMag.toFixed(1),
        label: 'Avg Impact',
        delta: undefined,
        updatedAt: newestDate,
      },
      {
        id: 'kpi-bullish-ratio',
        value: `${Math.round((upCount / signals.length) * 100)}`,
        unit: '%',
        label: `Bullish · ${topCategory}`,
        delta: undefined,
        updatedAt: newestDate,
      },
    ];
  }, [signals]);

  // ── Signal Table rows ───────────────────────────────────────────────
  const tableSignals = useMemo((): ModuleSignalRow[] => {
    return signals.slice(0, tableMax).map((s) => ({
      id: s.id,
      signal_type: s.signal_type,
      title: s.title,
      magnitude: s.magnitude,
      direction: s.direction,
      category: s.category,
      source: s.source_name ?? s.source,
      updated_at: s.updated_at,
    }));
  }, [signals, tableMax]);

  // ── News Ticker items ───────────────────────────────────────────────
  const tickerItems = useMemo((): ModuleTickerItem[] => {
    // Sort by recency for ticker
    const sorted = [...signals].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
    return sorted.slice(0, tickerMax).map((s) => ({
      tag: SIGNAL_TAG[s.signal_type] ?? 'Signal',
      headline: s.title,
      timestamp: timeAgo(s.updated_at),
    }));
  }, [signals, tickerMax]);

  // ── Spotlight Panel (top signal with image) ─────────────────────────
  const spotlight = useMemo((): ModuleSpotlightData | null => {
    // Pick highest-magnitude signal that has an image_url
    const withImage = signals
      .filter((s) => s.image_url)
      .sort((a, b) => Math.abs(b.magnitude) - Math.abs(a.magnitude));

    const hero = withImage[0];
    if (!hero) return null;

    // Build trending sidebar from top 3 non-hero signals
    const trending = signals
      .filter((s) => s.id !== hero.id)
      .slice(0, 3)
      .map((s) => ({
        label: s.title.length > 40 ? s.title.slice(0, 37) + '...' : s.title,
        value: `${s.magnitude >= 0 ? '+' : ''}${s.magnitude.toFixed(1)}%`,
        trend: s.direction,
      }));

    // Build bullets from description sentences
    const bullets = hero.description
      .split(/\.\s+/)
      .filter((b) => b.length > 10)
      .slice(0, 3)
      .map((b) => (b.endsWith('.') ? b : b + '.'));

    return {
      image: hero.image_url!,
      eyebrow: SIGNAL_TAG[hero.signal_type] ?? 'Intelligence',
      headline: hero.title,
      metric: {
        value: `${hero.magnitude >= 0 ? '+' : ''}${hero.magnitude.toFixed(1)}%`,
        label: hero.category ?? hero.signal_type.replace(/_/g, ' '),
      },
      bullets,
      cta: { label: 'View Full Analysis', href: '/intelligence' },
      trending: trending.length > 0 ? trending : undefined,
    };
  }, [signals]);

  return { kpis, tableSignals, tickerItems, spotlight };
}
