// ── useBrandAnalytics — W12-08: Brand Analytics live order/product aggregates ─
// Wraps analyticsService.getBrandAnalytics with isLive flag detection.
// Migrated to TanStack Query v5 (V2-TECH-04).

import { useQuery } from '@tanstack/react-query';
import { isSupabaseConfigured } from '../supabase';
import { getBrandAnalytics, type BrandAnalyticsData, type KpiTrend } from '../analyticsService';

// ── Return type ─────────────────────────────────────────────────────────────

export interface UseBrandAnalyticsReturn {
  data: BrandAnalyticsData;
  loading: boolean;
  isLive: boolean;
  orderCount: number;
  totalRevenue: number;
  productCount: number;
}

// ── Empty fallback ──────────────────────────────────────────────────────────

const flatTrend: KpiTrend = { value: 0, previousValue: 0, changePercent: 0, direction: 'flat' };

const emptyData: BrandAnalyticsData = {
  kpis: {
    totalViews: flatTrend,
    protocolMatches: flatTrend,
    totalOrders: flatTrend,
    totalRevenue: flatTrend,
  },
  topProducts: [],
  businessesReachedTrend: [],
  matchRate: 0,
  recentOrders: [],
};

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useBrandAnalytics(brandId?: string): UseBrandAnalyticsReturn {
  const { data, isLoading: loading } = useQuery({
    queryKey: ['brand_analytics', brandId],
    queryFn: async () => {
      const result = await getBrandAnalytics(brandId!);
      const hasRealData =
        result.kpis.totalOrders.value > 0 ||
        result.kpis.totalRevenue.value > 0 ||
        result.kpis.totalViews.value > 0 ||
        result.recentOrders.length > 0;
      return { result, isLive: hasRealData };
    },
    enabled: isSupabaseConfigured && !!brandId,
  });

  const analyticsData = data?.result ?? emptyData;
  const isLive = data?.isLive ?? false;

  const orderCount = analyticsData.kpis.totalOrders.value;
  const totalRevenue = analyticsData.kpis.totalRevenue.value;
  const productCount = analyticsData.topProducts.length;

  return { data: analyticsData, loading, isLive, orderCount, totalRevenue, productCount };
}
