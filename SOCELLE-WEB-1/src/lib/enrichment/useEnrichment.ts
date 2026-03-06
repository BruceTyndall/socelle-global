// ── External Enrichment Pipeline — React Hook ─────────────────────
// WO-16: Hook for consuming enrichment data in portal components
// V1: Returns mock data synchronously (simulates loading state)
// V2: Supabase query from enrichment_profiles table with real-time subscription

import { useState, useEffect } from 'react';
import type { OperatorEnrichment, BrandEnrichment } from './types';
import { getOperatorEnrichment, getBrandEnrichment } from './mockEnrichment';

// ── Operator Enrichment Hook ───────────────────────────────────────

interface UseOperatorEnrichmentResult {
  data: OperatorEnrichment | null;
  loading: boolean;
  error: string | null;
  /** Days since last enrichment run */
  daysSinceEnrichment: number | null;
  /** Trigger a manual re-enrichment (stubbed — logs intent) */
  refreshEnrichment: () => void;
}

export function useOperatorEnrichment(
  operatorId: string | null | undefined
): UseOperatorEnrichmentResult {
  const [data, setData] = useState<OperatorEnrichment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!operatorId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate async fetch (V2: replace with Supabase query)
    const timer = setTimeout(() => {
      try {
        const enrichment = getOperatorEnrichment(operatorId);
        setData(enrichment);
      } catch (err) {
        setError('Failed to load enrichment data');
        console.error('[useOperatorEnrichment] Error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [operatorId]);

  const daysSinceEnrichment = data
    ? Math.round(
        (Date.now() - new Date(data.enrichment_date).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  const refreshEnrichment = () => {
    // V2: Call Supabase Edge Function to trigger enrichment pipeline
  };

  return { data, loading, error, daysSinceEnrichment, refreshEnrichment };
}

// ── Brand Enrichment Hook ──────────────────────────────────────────

interface UseBrandEnrichmentResult {
  data: BrandEnrichment | null;
  loading: boolean;
  error: string | null;
}

export function useBrandEnrichment(
  brandId: string | null | undefined
): UseBrandEnrichmentResult {
  const [data, setData] = useState<BrandEnrichment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!brandId) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      try {
        const enrichment = getBrandEnrichment(brandId);
        setData(enrichment);
      } catch (err) {
        setError('Failed to load brand enrichment data');
        console.error('[useBrandEnrichment] Error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [brandId]);

  return { data, loading, error };
}
