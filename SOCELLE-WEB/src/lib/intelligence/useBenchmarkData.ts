// ── useBenchmarkData — W12-06: Portal Benchmark Dashboard live aggregates ───
// Queries business_analytics + orders tables for real operator benchmarks.
// Falls back to mock data from computeBenchmarks.ts when Supabase is
// unavailable or when the logged-in user has no business_id.
// Migrated to TanStack Query v5 (V2-TECH-04).

import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../supabase';
import {
  computeOverallBenchmark,
  getCategoryCoverage,
  getReorderHealth,
  getPeerGroupInfo,
} from './computeBenchmarks';
import type {
  OverallBenchmark,
  CategoryCoverage,
  ReorderHealthItem,
  PeerGroupInfo,
  BenchmarkScore,
} from './benchmarkTypes';

// ── Return type ─────────────────────────────────────────────────────────────

export interface UseBenchmarkDataReturn {
  benchmark: OverallBenchmark;
  categories: CategoryCoverage[];
  reorderItems: ReorderHealthItem[];
  peerGroup: PeerGroupInfo;
  loading: boolean;
  isLive: boolean;
}

// ── Helper: clamp score 0–100 ───────────────────────────────────────────────

function clamp(val: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(val)));
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useBenchmarkData(businessId?: string | null): UseBenchmarkDataReturn {
  const mockBenchmark = computeOverallBenchmark();
  const mockCategories = getCategoryCoverage();
  const mockReorder = getReorderHealth();
  const mockPeerGroup = getPeerGroupInfo();

  const { data, isLoading: loading } = useQuery({
    queryKey: ['benchmark_data', businessId],
    queryFn: async () => {
      // ── 1. Fetch this operator's orders ──────────────────────────────
      const { data: myOrders, error: ordersErr } = await supabase
        .from('orders')
        .select('id, brand_id, subtotal, created_at, status')
        .eq('business_id', businessId!)
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false });

      if (ordersErr || !myOrders || myOrders.length === 0) {
        return null; // Use mock
      }

      // ── 2. Fetch this operator's order items ─────────────────────────
      const orderIds = myOrders.map((o) => o.id);
      const { data: myItems } = await supabase
        .from('order_items')
        .select('order_id, product_id, product_name, unit_price, qty, line_total, created_at')
        .in('order_id', orderIds.slice(0, 200));

      const items = myItems ?? [];

      // ── 3. Fetch peer data: total businesses count ───────────────────
      const { count: totalBusinesses } = await supabase
        .from('businesses')
        .select('id', { count: 'exact', head: true });

      // ── 4. Fetch peer aggregate from business_analytics (monthly) ────
      const { data: peerAnalytics } = await supabase
        .from('business_analytics')
        .select('total_orders, total_spend, avg_order_value, brands_ordered')
        .eq('period_type', 'month')
        .order('period_start', { ascending: false })
        .limit(50);

      // ── Compute operator metrics ─────────────────────────────────────
      const operatorRevenue = myOrders.reduce((sum, o) => sum + Number(o.subtotal ?? 0), 0);
      const uniqueProducts = new Set(items.map((i) => i.product_id));
      const operatorSkuCount = uniqueProducts.size;
      const uniqueBrands = new Set(myOrders.map((o) => o.brand_id).filter(Boolean));
      const operatorBrandCount = uniqueBrands.size;
      const operatorAov = myOrders.length > 0 ? operatorRevenue / myOrders.length : 0;

      // ── Compute peer medians ─────────────────────────────────────────
      const peerRecords = peerAnalytics ?? [];
      let peerRevenue = 28500;
      let peerSkus = 35;
      let peerBrands = 8;
      let peerAov = 312;

      if (peerRecords.length > 0) {
        const peerSpends = peerRecords.map((p) => Number(p.total_spend ?? 0)).filter((v) => v > 0);
        const peerAovs = peerRecords.map((p) => Number(p.avg_order_value ?? 0)).filter((v) => v > 0);
        const peerBrandsOrdered = peerRecords.map((p) => Number(p.brands_ordered ?? 0)).filter((v) => v > 0);

        if (peerSpends.length > 0) peerRevenue = peerSpends.reduce((a, b) => a + b, 0) / peerSpends.length;
        if (peerAovs.length > 0) peerAov = peerAovs.reduce((a, b) => a + b, 0) / peerAovs.length;
        if (peerBrandsOrdered.length > 0) peerBrands = Math.round(peerBrandsOrdered.reduce((a, b) => a + b, 0) / peerBrandsOrdered.length);
      }

      // ── Build dimension scores ───────────────────────────────────────
      const revenueScore = clamp(Math.round((operatorRevenue / Math.max(peerRevenue, 1)) * 70));
      const skuScore = clamp(Math.round((operatorSkuCount / Math.max(peerSkus, 1)) * 70));
      const brandScore = clamp(Math.round((operatorBrandCount / Math.max(peerBrands, 1)) * 70));
      const aovScore = clamp(Math.round((operatorAov / Math.max(peerAov, 1)) * 70));

      // Category coverage
      const productCategories = new Set<string>();
      for (const item of items) {
        const name = (item.product_name ?? '').toLowerCase();
        if (name.includes('serum') || name.includes('active')) productCategories.add('Serums & Actives');
        else if (name.includes('cleanser') || name.includes('toner')) productCategories.add('Cleansers & Toners');
        else if (name.includes('moisturi') || name.includes('spf') || name.includes('sunscreen')) productCategories.add('Moisturizers & SPF');
        else if (name.includes('peel') || name.includes('exfoli')) productCategories.add('Peels & Exfoliants');
        else if (name.includes('mask') || name.includes('treatment')) productCategories.add('Masks & Treatments');
        else if (name.includes('body')) productCategories.add('Body Care');
        else if (name.includes('device') || name.includes('tool')) productCategories.add('Devices & Tools');
        else if (name.includes('supplement') || name.includes('ingest')) productCategories.add('Supplements & Ingestibles');
        else productCategories.add('Other');
      }
      const catCoverageScore = clamp(Math.round((productCategories.size / 8) * 100));

      // Reorder health
      const reorderedProducts = new Map<string, Date[]>();
      for (const item of items) {
        const dates = reorderedProducts.get(item.product_id) ?? ([] as Date[]);
        dates.push(new Date(item.created_at));
        reorderedProducts.set(item.product_id, dates);
      }
      let healthyReorders = 0;
      let totalTracked = 0;
      reorderedProducts.forEach((dates) => {
        if (dates.length >= 2) {
          totalTracked++;
          dates.sort((a, b) => b.getTime() - a.getTime());
          const daysBetween = (dates[0].getTime() - dates[1].getTime()) / (1000 * 60 * 60 * 24);
          if (daysBetween <= 45) healthyReorders++;
        }
      });
      const reorderPct = totalTracked > 0 ? Math.round((healthyReorders / totalTracked) * 100) : 65;
      const reorderScore = clamp(Math.round((reorderPct / 78) * 70));

      const compositeScore = clamp(Math.round(
        (revenueScore + skuScore + catCoverageScore + reorderScore + brandScore + aovScore) / 6
      ));

      const dimensions: BenchmarkScore[] = [
        {
          dimension: 'revenue', label: 'Monthly Revenue', score: revenueScore,
          percentile: clamp(revenueScore - 5), peerMedian: Math.round(peerRevenue),
          operatorValue: Math.round(operatorRevenue), unit: '$',
          ...(revenueScore < 65 ? { recommendation: `Expand high-margin treatment SKUs to close the revenue gap with peers at $${Math.round(peerRevenue).toLocaleString()}/mo.` } : {}),
        },
        {
          dimension: 'sku_diversity', label: 'SKU Diversity', score: skuScore,
          percentile: clamp(skuScore - 5), peerMedian: peerSkus,
          operatorValue: operatorSkuCount, unit: 'products',
          ...(skuScore < 65 ? { recommendation: `Add ${Math.max(1, peerSkus - operatorSkuCount)} more SKUs to match peer median.` } : {}),
        },
        {
          dimension: 'category_coverage', label: 'Category Coverage', score: catCoverageScore,
          percentile: clamp(catCoverageScore - 5), peerMedian: 6.2,
          operatorValue: productCategories.size, unit: 'categories',
          ...(catCoverageScore < 65 ? { recommendation: 'Expand into missing product categories to improve treatment room coverage.' } : {}),
        },
        {
          dimension: 'reorder_health', label: 'Reorder Health', score: reorderScore,
          percentile: clamp(reorderScore - 5), peerMedian: 78,
          operatorValue: reorderPct, unit: '%',
        },
        {
          dimension: 'brand_diversity', label: 'Brand Diversity', score: brandScore,
          percentile: clamp(brandScore - 5), peerMedian: peerBrands,
          operatorValue: operatorBrandCount, unit: 'brands',
          ...(brandScore < 65 ? { recommendation: `Diversify with ${Math.max(1, peerBrands - operatorBrandCount)} additional brand(s). Single-brand dependency increases supply-chain risk.` } : {}),
        },
        {
          dimension: 'avg_order_value', label: 'Avg Order Value', score: aovScore,
          percentile: clamp(aovScore - 5), peerMedian: Math.round(peerAov),
          operatorValue: Math.round(operatorAov), unit: '$',
        },
      ];

      const liveBenchmark: OverallBenchmark = {
        compositeScore,
        peerGroupSize: totalBusinesses ?? 142,
        peerGroupType: 'Operators',
        region: 'All Regions',
        dimensions,
      };

      // Live category coverage
      const baseCats = getCategoryCoverage();
      const liveCats: CategoryCoverage[] = baseCats.map((cat) => ({
        ...cat,
        operatorCount: productCategories.has(cat.category)
          ? items.filter((it) => {
              const name = (it.product_name ?? '').toLowerCase();
              const catLower = cat.category.toLowerCase();
              return name.includes(catLower.split(' ')[0].replace('&', ''));
            }).length || cat.operatorCount
          : 0,
      }));

      // Live reorder health
      const liveReorderItems: ReorderHealthItem[] = [];
      const productOrders = new Map<string, { name: string; brandId: string; dates: Date[] }>();
      for (const item of items) {
        const existing = productOrders.get(item.product_id) ?? { name: item.product_name, brandId: '', dates: [] as Date[] };
        existing.dates.push(new Date(item.created_at));
        productOrders.set(item.product_id, existing);
      }

      const orderBrandMap: Record<string, string> = {};
      for (const o of myOrders) orderBrandMap[o.id] = o.brand_id ?? '';
      for (const item of items) {
        const entry = productOrders.get(item.product_id);
        if (entry && !entry.brandId && orderBrandMap[item.order_id]) entry.brandId = orderBrandMap[item.order_id];
      }

      const brandIdsForLookup = [...new Set([...productOrders.values()].map((v) => v.brandId).filter(Boolean))];
      let brandNameMap: Record<string, string> = {};
      if (brandIdsForLookup.length > 0) {
        const { data: brandRows } = await supabase.from('brands').select('id, name').in('id', brandIdsForLookup.slice(0, 20));
        if (brandRows) for (const b of brandRows) brandNameMap[b.id] = b.name;
      }

      productOrders.forEach((entry) => {
        if (entry.dates.length === 0) return;
        entry.dates.sort((a, b) => b.getTime() - a.getTime());
        const lastOrderDate = entry.dates[0];
        const daysAgo = Math.round((Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24));
        let avgReorderDays = 30;
        if (entry.dates.length >= 2) {
          const gaps: number[] = [];
          for (let i = 0; i < entry.dates.length - 1; i++) {
            gaps.push((entry.dates[i].getTime() - entry.dates[i + 1].getTime()) / (1000 * 60 * 60 * 24));
          }
          avgReorderDays = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
        }

        let status: 'healthy' | 'warning' | 'critical' = 'healthy';
        if (daysAgo > avgReorderDays * 1.5) status = 'critical';
        else if (daysAgo > avgReorderDays * 1.1) status = 'warning';

        liveReorderItems.push({ productName: entry.name, brand: brandNameMap[entry.brandId] ?? 'Unknown', lastOrderDaysAgo: daysAgo, avgReorderDays, status });
      });

      const statusOrder = { critical: 0, warning: 1, healthy: 2 };
      liveReorderItems.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

      const avgPeerRevenue = peerRevenue > 0 ? `$${Math.round(peerRevenue).toLocaleString()}/mo` : '$26,400/mo';
      const livePeerGroup: PeerGroupInfo = {
        type: 'Operators',
        region: 'All Regions',
        size: totalBusinesses ?? 142,
        avgRevenue: avgPeerRevenue,
      };

      return {
        benchmark: liveBenchmark,
        categories: liveCats,
        reorderItems: liveReorderItems.length > 0 ? liveReorderItems.slice(0, 15) : getReorderHealth(),
        peerGroup: livePeerGroup,
        isLive: true,
      };
    },
    enabled: isSupabaseConfigured && !!businessId,
    staleTime: 10 * 60 * 1000, // 10 minutes — benchmark data doesn't change frequently
  });

  return {
    benchmark: data?.benchmark ?? mockBenchmark,
    categories: data?.categories ?? mockCategories,
    reorderItems: data?.reorderItems ?? mockReorder,
    peerGroup: data?.peerGroup ?? mockPeerGroup,
    loading,
    isLive: data?.isLive ?? false,
  };
}
