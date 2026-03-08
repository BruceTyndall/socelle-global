// useProductSignals — cross-reference products with market intelligence signals
// V2-HUBS-10: Intelligence-enhanced commerce (trending badges, signal context)
// Migrated to TanStack Query v5.
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../supabase';
import type { Product } from './types';

export interface ProductSignalMatch {
  productId: string;
  productName: string;
  signalId: string;
  signalTitle: string;
  signalType: string;
  magnitude: number;
  direction: 'up' | 'down' | 'stable';
  category: string | null;
  region: string | null;
  updatedAt: string;
}

interface MarketSignalRow {
  id: string;
  signal_type: string;
  title: string;
  description: string;
  magnitude: number;
  direction: 'up' | 'down' | 'stable';
  category: string | null;
  region: string | null;
  related_products: string[] | null;
  updated_at: string;
}

/**
 * Returns trending signal matches for a list of products.
 * Matches by: product name appearing in signal related_products,
 * or signal category matching product category.
 */
export function useProductSignals(products: Product[]) {
  const { data: signals = [], isLoading: loading } = useQuery({
    queryKey: ['product_signals_cross_ref'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('market_signals')
        .select(
          'id, signal_type, title, description, magnitude, direction, category, region, related_products, updated_at'
        )
        .eq('active', true)
        .in('signal_type', [
          'product_velocity',
          'ingredient_momentum',
          'treatment_trend',
          'brand_adoption',
        ])
        .order('magnitude', { ascending: false })
        .limit(100);

      if (error) return [];
      return (data ?? []) as MarketSignalRow[];
    },
    enabled: isSupabaseConfigured && products.length > 0,
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  const matches = useMemo(() => {
    if (signals.length === 0 || products.length === 0) return new Map<string, ProductSignalMatch>();

    const matchMap = new Map<string, ProductSignalMatch>();

    for (const product of products) {
      const productNameLower = product.name.toLowerCase();

      for (const signal of signals) {
        // Match 1: product name mentioned in signal's related_products array
        const relatedLower = (signal.related_products ?? []).map(rp => rp.toLowerCase());
        const nameMatch = relatedLower.some(
          rp => productNameLower.includes(rp) || rp.includes(productNameLower)
        );

        // Match 2: signal category matches product category (loose)
        const catMatch =
          signal.category &&
          product.category_id &&
          signal.category.toLowerCase().includes('product');

        if (nameMatch || catMatch) {
          // Keep highest magnitude match per product
          const existing = matchMap.get(product.id);
          if (!existing || Math.abs(signal.magnitude) > Math.abs(existing.magnitude)) {
            matchMap.set(product.id, {
              productId: product.id,
              productName: product.name,
              signalId: signal.id,
              signalTitle: signal.title,
              signalType: signal.signal_type,
              magnitude: signal.magnitude,
              direction: signal.direction,
              category: signal.category,
              region: signal.region,
              updatedAt: signal.updated_at,
            });
          }
        }
      }
    }

    return matchMap;
  }, [signals, products]);

  return { matches, loading };
}

/**
 * Returns signal context for a single product (for product detail pages).
 * Finds related signals based on product name, category, and brand.
 */
export function useProductIntelligenceContext(product: Product | null) {
  const { data: relatedSignals = [], isLoading: loading } = useQuery({
    queryKey: ['product_intelligence_context', product?.id],
    queryFn: async () => {
      if (!product) return [];

      const { data, error } = await supabase
        .from('market_signals')
        .select(
          'id, signal_type, title, description, magnitude, direction, category, region, related_products, updated_at, source_name, confidence_score'
        )
        .eq('active', true)
        .order('magnitude', { ascending: false })
        .limit(50);

      if (error || !data) return [];

      const productNameLower = product.name.toLowerCase();
      const rows = data as Array<MarketSignalRow & { source_name: string | null; confidence_score: number | null }>;

      // Find signals related to this product
      return rows.filter(signal => {
        const relatedLower = (signal.related_products ?? []).map(rp => rp.toLowerCase());
        const nameMatch = relatedLower.some(
          rp => productNameLower.includes(rp) || rp.includes(productNameLower)
        );
        const catMatch =
          signal.category &&
          (signal.signal_type === 'product_velocity' ||
            signal.signal_type === 'ingredient_momentum');
        return nameMatch || catMatch;
      }).slice(0, 5);
    },
    enabled: isSupabaseConfigured && !!product?.id,
    staleTime: 5 * 60 * 1000,
  });

  return { relatedSignals, loading };
}
