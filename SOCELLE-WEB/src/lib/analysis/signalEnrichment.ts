/**
 * Live Signal Enrichment — SOCELLE V3
 *
 * Queries the `market_signals` table for real-time pricing/demand data
 * relevant to each engine's analysis context.
 *
 * Engines call `fetchRelevantSignals()` to enrich their outputs with
 * live market context: trending categories, pricing benchmarks, demand
 * shifts, and confidence tiers.
 */

import { supabase } from '../supabase';
import { createScopedLogger } from '../logger';

const log = createScopedLogger('SignalEnrichment');

// ── Types ────────────────────────────────────────────────────────────────────

export interface MarketSignal {
  id: string;
  signalKey: string;
  signalType: string;
  direction: string;
  magnitude: number;
  description: string;
  category: string | null;
  region: string | null;
  confidenceScore: number | null;
  confidenceTier: string | null;
  dataSource: string | null;
  relatedBrands: string[] | null;
  relatedProducts: string[] | null;
  updatedAt: string;
}

export interface SignalEnrichment {
  signals: MarketSignal[];
  signalCount: number;
  fetchedAt: string;
  isLive: boolean;
  categories: string[];
  trendingUp: MarketSignal[];
  trendingDown: MarketSignal[];
  pricingSignals: MarketSignal[];
}

// ── Fetch Signals ────────────────────────────────────────────────────────────

/**
 * Fetch market signals relevant to the given categories and/or brands.
 * Returns at most `limit` signals, ordered by freshness.
 */
export async function fetchRelevantSignals(opts: {
  categories?: string[];
  brandIds?: string[];
  region?: string;
  limit?: number;
}): Promise<SignalEnrichment> {
  const { categories, brandIds, region, limit = 20 } = opts;

  try {
    let query = supabase
      .from('market_signals')
      .select('*')
      .eq('active', true)
      .order('updated_at', { ascending: false })
      .limit(limit);

    // Filter by category if provided
    if (categories && categories.length > 0) {
      // Use OR filter across categories
      const categoryFilters = categories
        .map((c) => `category.ilike.%${c.replace(/'/g, '')}%`)
        .join(',');
      query = query.or(categoryFilters);
    }

    // Filter by region if provided
    if (region) {
      query = query.or(`region.eq.${region},region.is.null`);
    }

    const { data, error } = await query;

    if (error) {
      log.warn('Failed to fetch market signals', { error: error.message });
      return emptyEnrichment();
    }

    if (!data || data.length === 0) {
      log.info('No relevant signals found', { categories, region });
      return emptyEnrichment();
    }

    // Filter by brand relevance if brandIds provided
    let filteredData = data;
    if (brandIds && brandIds.length > 0) {
      const brandRelevant = data.filter(
        (s) =>
          s.related_brands &&
          s.related_brands.some((b: string) => brandIds.includes(b)),
      );
      // Use brand-filtered if we got results, otherwise use all
      if (brandRelevant.length > 0) {
        filteredData = brandRelevant;
      }
    }

    const signals: MarketSignal[] = filteredData.map(mapSignalRow);

    const uniqueCategories = [
      ...new Set(signals.map((s) => s.category).filter(Boolean) as string[]),
    ];

    return {
      signals,
      signalCount: signals.length,
      fetchedAt: new Date().toISOString(),
      isLive: true,
      categories: uniqueCategories,
      trendingUp: signals.filter((s) => s.direction === 'up'),
      trendingDown: signals.filter((s) => s.direction === 'down'),
      pricingSignals: signals.filter(
        (s) =>
          s.signalType === 'pricing' ||
          s.signalKey.toLowerCase().includes('price'),
      ),
    };
  } catch (err) {
    log.error('Signal enrichment error', {
      error: err instanceof Error ? err.message : String(err),
    });
    return emptyEnrichment();
  }
}

/**
 * Fetch signals specifically for service categories found in a menu.
 * Maps common service categories to signal categories.
 */
export async function fetchSignalsForServiceCategories(
  serviceCategories: string[],
  region?: string,
): Promise<SignalEnrichment> {
  // Map spa service categories to market signal categories
  const signalCategories = serviceCategories.flatMap(mapServiceToSignalCategory);
  const unique = [...new Set(signalCategories)];

  return fetchRelevantSignals({
    categories: unique,
    region,
  });
}

/**
 * Fetch pricing benchmark signals for revenue estimation.
 */
export async function fetchPricingBenchmarks(
  categories: string[],
  region?: string,
): Promise<MarketSignal[]> {
  const enrichment = await fetchRelevantSignals({
    categories,
    region,
    limit: 10,
  });

  return enrichment.pricingSignals;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function mapSignalRow(row: Record<string, unknown>): MarketSignal {
  return {
    id: row.id as string,
    signalKey: row.signal_key as string,
    signalType: row.signal_type as string,
    direction: row.direction as string,
    magnitude: row.magnitude as number,
    description: row.description as string,
    category: (row.category as string) ?? null,
    region: (row.region as string) ?? null,
    confidenceScore: (row.confidence_score as number) ?? null,
    confidenceTier: (row.confidence_tier as string) ?? null,
    dataSource: (row.data_source as string) ?? null,
    relatedBrands: (row.related_brands as string[]) ?? null,
    relatedProducts: (row.related_products as string[]) ?? null,
    updatedAt: row.updated_at as string,
  };
}

function mapServiceToSignalCategory(serviceCategory: string): string[] {
  const lower = serviceCategory.toLowerCase();

  if (lower.includes('facial') || lower.includes('face') || lower.includes('skin')) {
    return ['facial', 'skincare', 'aesthetics'];
  }
  if (lower.includes('body') || lower.includes('wrap') || lower.includes('scrub')) {
    return ['body treatment', 'wellness'];
  }
  if (lower.includes('massage') || lower.includes('therapeutic')) {
    return ['massage', 'wellness'];
  }
  if (lower.includes('hand') || lower.includes('foot') || lower.includes('nail')) {
    return ['nail', 'hand and foot'];
  }
  if (lower.includes('med') || lower.includes('laser') || lower.includes('peel')) {
    return ['medspa', 'aesthetics', 'injectable'];
  }
  if (lower.includes('eye') || lower.includes('lip')) {
    return ['aesthetics', 'skincare'];
  }

  return [serviceCategory.toLowerCase()];
}

function emptyEnrichment(): SignalEnrichment {
  return {
    signals: [],
    signalCount: 0,
    fetchedAt: new Date().toISOString(),
    isLive: false,
    categories: [],
    trendingUp: [],
    trendingDown: [],
    pricingSignals: [],
  };
}
