// useProductSignals — cross-reference products with market intelligence signals
// V2-HUBS-10: Intelligence-enhanced commerce (trending badges, signal context)
// Migrated to TanStack Query v5.
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { isSupabaseConfigured } from '../supabase';
import { useIntelligence } from '../intelligence/useIntelligence';
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
  const { signals: allSignals, loading } = useIntelligence({
    signalTypes: [
      'product_velocity',
      'ingredient_momentum',
      'treatment_trend',
      'brand_adoption'
    ],
    limit: 100
  });

  const matches = useMemo(() => {
    if (allSignals.length === 0 || products.length === 0) return new Map<string, ProductSignalMatch>();

    const signals = [...allSignals].sort((a, b) => Math.abs(b.magnitude || 0) - Math.abs(a.magnitude || 0));

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
              signalTitle: signal.title || '',
              signalType: signal.signal_type || 'trend',
              magnitude: signal.magnitude || 0,
              direction: (signal.direction === 'up' || signal.direction === 'down' || signal.direction === 'stable' ? signal.direction : 'stable') as 'up' | 'down' | 'stable',
              category: signal.category || null,
              region: signal.region || null,
              updatedAt: signal.updated_at || signal.published_at || new Date().toISOString(),
            });
          }
        }
      }
    }

    return matchMap;
  }, [allSignals, products]);

  return { matches, loading };
}

/**
 * Returns signal context for a single product (for product detail pages).
 * Finds related signals based on product name, category, and brand.
 */
export function useProductIntelligenceContext(product: Product | null) {
  const { signals: allSignals = [], loading } = useIntelligence({ limit: 50 });

  const relatedSignals = useMemo(() => {
    if (!product || allSignals.length === 0) return [];

    const productNameLower = product.name.toLowerCase();
    
    // Sort by magnitude
    const sorted = [...allSignals].sort((a, b) => Math.abs(b.magnitude || 0) - Math.abs(a.magnitude || 0));

      // Find signals related to this product
      return sorted.filter(signal => {
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
  }, [allSignals, product]);

  return { relatedSignals, loading };
}
