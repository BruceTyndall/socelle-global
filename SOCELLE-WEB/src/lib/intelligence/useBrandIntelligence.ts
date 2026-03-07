// ── useBrandIntelligence — W12-04: Supabase live wiring ─────────────────────
// Queries orders + order_items + brands for real peer adoption, also-bought,
// and adoption count data. Falls back to mock maps in brandIntelligence.ts
// when Supabase is unavailable or data is insufficient.
// Returns isLive flag so UI can show PREVIEW badge on mock fallback.

import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase';
import {
  getBrandPeerData,
  getBrandAdoptionCount,
  getProfessionalsAlsoBought,
  isBrandTrending,
  type BrandPeerData,
  type ProfessionalAlsoBought,
} from './brandIntelligence';

// ── Return type ─────────────────────────────────────────────────────────────

export interface UseBrandIntelligenceReturn {
  peerData: BrandPeerData;
  adoptionCount: number;
  alsoBought: ProfessionalAlsoBought[];
  trending: boolean;
  loading: boolean;
  isLive: boolean;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useBrandIntelligence(brandSlug: string): UseBrandIntelligenceReturn {
  const [peerData, setPeerData] = useState<BrandPeerData>(getBrandPeerData(brandSlug));
  const [adoptionCount, setAdoptionCount] = useState<number>(getBrandAdoptionCount(brandSlug));
  const [alsoBought, setAlsoBought] = useState<ProfessionalAlsoBought[]>(getProfessionalsAlsoBought(brandSlug));
  const [trending, setTrending] = useState<boolean>(isBrandTrending(brandSlug));
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchLiveData() {
      setLoading(true);

      if (!isSupabaseConfigured || !brandSlug) {
        // No Supabase config — fall back to mock data
        setPeerData(getBrandPeerData(brandSlug));
        setAdoptionCount(getBrandAdoptionCount(brandSlug));
        setAlsoBought(getProfessionalsAlsoBought(brandSlug));
        setTrending(isBrandTrending(brandSlug));
        setIsLive(false);
        setLoading(false);
        return;
      }

      try {
        // Step 1: Resolve brand slug → brand ID
        const { data: brandRow, error: brandErr } = await supabase
          .from('brands')
          .select('id, name')
          .eq('slug', brandSlug)
          .maybeSingle();

        if (brandErr || !brandRow) {
          if (!cancelled) {
            setIsLive(false);
            setLoading(false);
          }
          return;
        }

        const brandId = brandRow.id;

        // Step 2: Query real order data for this brand
        const [ordersRes, businessCountRes, alsoBoughtRes] = await Promise.all([
          // Total orders + revenue for this brand
          supabase
            .from('orders')
            .select('id, business_id, subtotal, created_at')
            .eq('brand_id', brandId)
            .neq('status', 'cancelled'),

          // Count distinct businesses that ordered from this brand
          supabase
            .from('orders')
            .select('business_id', { count: 'exact', head: false })
            .eq('brand_id', brandId)
            .neq('status', 'cancelled'),

          // Also-bought: find other brands ordered by the same businesses
          // Get business IDs that ordered from this brand, then find their other brand orders
          supabase
            .from('orders')
            .select('business_id')
            .eq('brand_id', brandId)
            .neq('status', 'cancelled'),
        ]);

        if (cancelled) return;

        const orders = ordersRes.data ?? [];
        const businessOrders = businessCountRes.data ?? [];
        const alsoBoughtBusinessIds = alsoBoughtRes.data ?? [];

        // Determine if we have enough real data to go LIVE
        const hasRealData = orders.length >= 1;

        if (!hasRealData) {
          // Insufficient data — use mock with DEMO label
          setIsLive(false);
          setLoading(false);
          return;
        }

        // ── Compute live peer data ──────────────────────────────────────

        // Unique businesses that ordered from this brand
        const uniqueBusinessIds = new Set(
          businessOrders
            .map((r) => r.business_id as string)
            .filter(Boolean)
        );
        const professionalCount = uniqueBusinessIds.size;

        // Average SKUs per business (from order_items)
        let avgSkusStocked = 0;
        if (professionalCount > 0) {
          const { count: totalItemCount } = await supabase
            .from('order_items')
            .select('id', { count: 'exact', head: true })
            .in('order_id', orders.map((o) => o.id));

          avgSkusStocked = Math.round((totalItemCount ?? 0) / professionalCount);
        }

        if (cancelled) return;

        const livePeerData: BrandPeerData = {
          professionalCount,
          primarySegment: professionalCount > 50 ? 'All Professional Segments' : 'Early Adopter Professionals',
          peerAdoptionPercent: Math.min(100, Math.round((professionalCount / Math.max(professionalCount + 20, 50)) * 100)),
          avgSkusStocked: avgSkusStocked || 1,
          peerRecommendation: professionalCount >= 10
            ? `${professionalCount} professionals currently stock this brand on Socelle`
            : `Emerging brand — ${professionalCount} professional${professionalCount === 1 ? '' : 's'} and growing`,
        };

        setPeerData(livePeerData);
        setAdoptionCount(professionalCount);

        // ── Compute also-bought from co-purchasing ──────────────────────

        const buyerIds = alsoBoughtBusinessIds
          .map((r) => r.business_id as string)
          .filter(Boolean);
        const uniqueBuyerIds = [...new Set(buyerIds)];

        if (uniqueBuyerIds.length > 0) {
          // Find orders from these businesses for OTHER brands
          const { data: coPurchases } = await supabase
            .from('orders')
            .select('brand_id, subtotal')
            .in('business_id', uniqueBuyerIds.slice(0, 50)) // limit to first 50 for perf
            .neq('brand_id', brandId)
            .neq('status', 'cancelled');

          if (!cancelled && coPurchases && coPurchases.length > 0) {
            // Count orders per co-purchased brand
            const brandCounts: Record<string, number> = {};
            for (const cp of coPurchases) {
              if (cp.brand_id) {
                brandCounts[cp.brand_id as string] = (brandCounts[cp.brand_id as string] ?? 0) + 1;
              }
            }

            // Get top 4 co-purchased brand IDs
            const topBrandIds = Object.entries(brandCounts)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 4)
              .map(([id]) => id);

            if (topBrandIds.length > 0) {
              // Fetch brand names
              const { data: brandNames } = await supabase
                .from('brands')
                .select('id, name')
                .in('id', topBrandIds);

              if (!cancelled && brandNames) {
                const nameMap: Record<string, string> = {};
                for (const b of brandNames) {
                  nameMap[b.id] = b.name;
                }

                const totalBuyers = uniqueBuyerIds.length;
                const liveAlsoBought: ProfessionalAlsoBought[] = topBrandIds
                  .filter((id) => nameMap[id])
                  .map((id) => ({
                    productName: nameMap[id], // Using brand name since we don't have product-level co-purchase
                    brandName: nameMap[id],
                    category: 'Professional Skincare',
                    adoptionPercent: Math.round(((brandCounts[id] ?? 0) / totalBuyers) * 100),
                  }));

                if (liveAlsoBought.length > 0) {
                  setAlsoBought(liveAlsoBought);
                }
              }
            }
          }
        }

        if (cancelled) return;

        // ── Trending: based on recent order velocity ────────────────────

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const { count: recentOrders } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('brand_id', brandId)
          .neq('status', 'cancelled')
          .gte('created_at', thirtyDaysAgo.toISOString());

        const { count: priorOrders } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('brand_id', brandId)
          .neq('status', 'cancelled')
          .gte('created_at', sixtyDaysAgo.toISOString())
          .lt('created_at', thirtyDaysAgo.toISOString());

        if (!cancelled) {
          // Trending if recent orders exceed prior period
          const liveTrending = (recentOrders ?? 0) > (priorOrders ?? 0) && (recentOrders ?? 0) >= 2;
          setTrending(liveTrending);
          setIsLive(true);
        }
      } catch {
        // On any error, keep mock data with DEMO flag
        if (!cancelled) {
          setIsLive(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchLiveData();
    return () => { cancelled = true; };
  }, [brandSlug]);

  return { peerData, adoptionCount, alsoBought, trending, loading, isLive };
}
