// ── useBrandAnalytics — W12-08: Brand Analytics live order/product aggregates ─
// Wraps analyticsService.getBrandAnalytics with isLive flag detection.
// Queries brand_analytics + orders tables for real brand performance data.
// Falls back to empty/zero state when Supabase is unavailable or no data exists.
// Returns isLive flag so UI can show DEMO badge on mock/empty fallback.

import { useState, useEffect, useCallback } from 'react';
import { isSupabaseConfigured } from '../supabase';
import { getBrandAnalytics, type BrandAnalyticsData, type KpiTrend } from '../analyticsService';
import { createScopedLogger } from '../logger';

const log = createScopedLogger('useBrandAnalytics');

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
  const [data, setData] = useState<BrandAnalyticsData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);

    if (!isSupabaseConfigured || !brandId) {
      setData(emptyData);
      setIsLive(false);
      setLoading(false);
      return;
    }

    try {
      const result = await getBrandAnalytics(brandId);

      // Determine if we got real data back
      // If all KPI values are 0 and no recent orders, it's effectively empty
      const hasRealData =
        result.kpis.totalOrders.value > 0 ||
        result.kpis.totalRevenue.value > 0 ||
        result.kpis.totalViews.value > 0 ||
        result.recentOrders.length > 0;

      setData(result);
      setIsLive(hasRealData);
    } catch (err) {
      log.error('Failed to fetch brand analytics', { err });
      setData(emptyData);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived convenience values
  const orderCount = data.kpis.totalOrders.value;
  const totalRevenue = data.kpis.totalRevenue.value;
  const productCount = data.topProducts.length;

  return { data, loading, isLive, orderCount, totalRevenue, productCount };
}
