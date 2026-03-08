// ── useBrandIntelligence — W12-04: Supabase live wiring ─────────────────────
// Queries orders + order_items + brands for real peer adoption, also-bought,
// and adoption count data. Falls back to mock maps in brandIntelligence.ts
// when Supabase is unavailable or data is insufficient.
// Migrated to TanStack Query v5 (V2-TECH-04).

import { useQuery } from '@tanstack/react-query';
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
  const mockPeerData = getBrandPeerData(brandSlug);
  const mockAdoptionCount = getBrandAdoptionCount(brandSlug);
  const mockAlsoBought = getProfessionalsAlsoBought(brandSlug);
  const mockTrending = isBrandTrending(brandSlug);

  const { data, isLoading: loading } = useQuery({
    queryKey: ['brand_intelligence', brandSlug],
    queryFn: async () => {
      // Step 1: Resolve brand slug → brand ID
      const { data: brandRow, error: brandErr } = await supabase
        .from('brands')
        .select('id, name')
        .eq('slug', brandSlug)
        .maybeSingle();

      if (brandErr || !brandRow) {
        return { peerData: mockPeerData, adoptionCount: mockAdoptionCount, alsoBought: mockAlsoBought, trending: mockTrending, isLive: false };
      }

      const brandId = brandRow.id;

      // Step 2: Query real order data for this brand
      const [ordersRes, businessCountRes, alsoBoughtRes] = await Promise.all([
        supabase
          .from('orders')
          .select('id, business_id, subtotal, created_at')
          .eq('brand_id', brandId)
          .neq('status', 'cancelled'),
        supabase
          .from('orders')
          .select('business_id', { count: 'exact', head: false })
          .eq('brand_id', brandId)
          .neq('status', 'cancelled'),
        supabase
          .from('orders')
          .select('business_id')
          .eq('brand_id', brandId)
          .neq('status', 'cancelled'),
      ]);

      const orders = ordersRes.data ?? [];
      const businessOrders = businessCountRes.data ?? [];
      const alsoBoughtBusinessIds = alsoBoughtRes.data ?? [];

      if (orders.length < 1) {
        return { peerData: mockPeerData, adoptionCount: mockAdoptionCount, alsoBought: mockAlsoBought, trending: mockTrending, isLive: false };
      }

      // Unique businesses that ordered from this brand
      const uniqueBusinessIds = new Set(
        businessOrders.map((r) => r.business_id as string).filter(Boolean)
      );
      const professionalCount = uniqueBusinessIds.size;

      // Average SKUs per business
      let avgSkusStocked = 0;
      if (professionalCount > 0) {
        const { count: totalItemCount } = await supabase
          .from('order_items')
          .select('id', { count: 'exact', head: true })
          .in('order_id', orders.map((o) => o.id));
        avgSkusStocked = Math.round((totalItemCount ?? 0) / professionalCount);
      }

      const livePeerData: BrandPeerData = {
        professionalCount,
        primarySegment: professionalCount > 50 ? 'All Professional Segments' : 'Early Adopter Professionals',
        peerAdoptionPercent: Math.min(100, Math.round((professionalCount / Math.max(professionalCount + 20, 50)) * 100)),
        avgSkusStocked: avgSkusStocked || 1,
        peerRecommendation: professionalCount >= 10
          ? `${professionalCount} professionals currently stock this brand on Socelle`
          : `Emerging brand — ${professionalCount} professional${professionalCount === 1 ? '' : 's'} and growing`,
      };

      // Also-bought from co-purchasing
      let liveAlsoBought: ProfessionalAlsoBought[] = mockAlsoBought;
      const buyerIds = alsoBoughtBusinessIds.map((r) => r.business_id as string).filter(Boolean);
      const uniqueBuyerIds = [...new Set(buyerIds)];

      if (uniqueBuyerIds.length > 0) {
        const { data: coPurchases } = await supabase
          .from('orders')
          .select('brand_id, subtotal')
          .in('business_id', uniqueBuyerIds.slice(0, 50))
          .neq('brand_id', brandId)
          .neq('status', 'cancelled');

        if (coPurchases && coPurchases.length > 0) {
          const brandCounts: Record<string, number> = {};
          for (const cp of coPurchases) {
            if (cp.brand_id) {
              brandCounts[cp.brand_id as string] = (brandCounts[cp.brand_id as string] ?? 0) + 1;
            }
          }

          const topBrandIds = Object.entries(brandCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 4)
            .map(([id]) => id);

          if (topBrandIds.length > 0) {
            const { data: brandNames } = await supabase
              .from('brands')
              .select('id, name')
              .in('id', topBrandIds);

            if (brandNames) {
              const nameMap: Record<string, string> = {};
              for (const b of brandNames) nameMap[b.id] = b.name;

              const totalBuyers = uniqueBuyerIds.length;
              const computed = topBrandIds
                .filter((id) => nameMap[id])
                .map((id) => ({
                  productName: nameMap[id],
                  brandName: nameMap[id],
                  category: 'Professional Skincare',
                  adoptionPercent: Math.round(((brandCounts[id] ?? 0) / totalBuyers) * 100),
                }));
              if (computed.length > 0) liveAlsoBought = computed;
            }
          }
        }
      }

      // Trending: based on recent order velocity
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

      const liveTrending = (recentOrders ?? 0) > (priorOrders ?? 0) && (recentOrders ?? 0) >= 2;

      return {
        peerData: livePeerData,
        adoptionCount: professionalCount,
        alsoBought: liveAlsoBought,
        trending: liveTrending,
        isLive: true,
      };
    },
    enabled: isSupabaseConfigured && !!brandSlug,
  });

  return {
    peerData: data?.peerData ?? mockPeerData,
    adoptionCount: data?.adoptionCount ?? mockAdoptionCount,
    alsoBought: data?.alsoBought ?? mockAlsoBought,
    trending: data?.trending ?? mockTrending,
    loading,
    isLive: data?.isLive ?? false,
  };
}
