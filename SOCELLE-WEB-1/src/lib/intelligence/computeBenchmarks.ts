// ── Operator Benchmarking Engine ────────────────────────────────────
// WO-19: All data is mock — will connect to Supabase post-WO-16

import type {
  OverallBenchmark,
  CategoryCoverage,
  ReorderHealthItem,
  PeerGroupInfo,
} from './benchmarkTypes';

// ── Composite benchmark with 6 dimension breakdowns ────────────────
export function computeOverallBenchmark(): OverallBenchmark {
  return {
    compositeScore: 68,
    peerGroupSize: 142,
    peerGroupType: 'Medspas',
    region: 'Southwest',
    dimensions: [
      {
        dimension: 'revenue',
        label: 'Monthly Revenue',
        score: 62,
        percentile: 35,
        peerMedian: 28500,
        operatorValue: 22800,
        unit: '$',
        recommendation:
          'Expand high-margin treatment SKUs to close the revenue gap. Top performers average 12+ treatment-linked products.',
      },
      {
        dimension: 'sku_diversity',
        label: 'SKU Diversity',
        score: 58,
        percentile: 40,
        peerMedian: 35,
        operatorValue: 28,
        unit: 'products',
        recommendation:
          'Add 7 more SKUs to match peer median. Consider retinol serums and peptide lines — fastest-growing categories this quarter.',
      },
      {
        dimension: 'category_coverage',
        label: 'Category Coverage',
        score: 65,
        percentile: 42,
        peerMedian: 6.2,
        operatorValue: 5,
        unit: 'categories',
        recommendation:
          'You are missing Body Care and Devices categories. 78% of top performers stock both.',
      },
      {
        dimension: 'reorder_health',
        label: 'Reorder Health',
        score: 72,
        percentile: 55,
        peerMedian: 78,
        operatorValue: 65,
        unit: '%',
      },
      {
        dimension: 'brand_diversity',
        label: 'Brand Diversity',
        score: 64,
        percentile: 38,
        peerMedian: 8,
        operatorValue: 6,
        unit: 'brands',
        recommendation:
          'Diversify with 2 additional clinical brands. Single-brand dependency increases supply-chain risk by 34%.',
      },
      {
        dimension: 'avg_order_value',
        label: 'Avg Order Value',
        score: 74,
        percentile: 52,
        peerMedian: 312,
        operatorValue: 287,
        unit: '$',
      },
    ],
  };
}

// ── Category coverage: 8 categories ────────────────────────────────
export function getCategoryCoverage(): CategoryCoverage[] {
  return [
    { category: 'Cleansers & Toners',    operatorCount: 6,  peerAvg: 5.8, maxPossible: 12 },
    { category: 'Serums & Actives',      operatorCount: 8,  peerAvg: 7.2, maxPossible: 15 },
    { category: 'Moisturizers & SPF',    operatorCount: 5,  peerAvg: 4.9, maxPossible: 10 },
    { category: 'Peels & Exfoliants',    operatorCount: 4,  peerAvg: 3.6, maxPossible: 8  },
    { category: 'Masks & Treatments',    operatorCount: 3,  peerAvg: 4.1, maxPossible: 9  },
    { category: 'Body Care',             operatorCount: 0,  peerAvg: 2.8, maxPossible: 7  },
    { category: 'Devices & Tools',       operatorCount: 0,  peerAvg: 1.9, maxPossible: 5  },
    { category: 'Supplements & Ingestibles', operatorCount: 2, peerAvg: 2.3, maxPossible: 6 },
  ];
}

// ── Reorder health: 10 products ────────────────────────────────────
export function getReorderHealth(): ReorderHealthItem[] {
  return [
    { productName: 'Vitamin C Brightening Serum',     brand: 'Environ',       lastOrderDaysAgo: 12, status: 'healthy',  avgReorderDays: 30 },
    { productName: 'Hydra-Repair Moisturizer',         brand: 'iS Clinical',   lastOrderDaysAgo: 8,  status: 'healthy',  avgReorderDays: 28 },
    { productName: 'Retinol 0.5% Night Cream',         brand: 'SkinCeuticals', lastOrderDaysAgo: 15, status: 'healthy',  avgReorderDays: 35 },
    { productName: 'Enzymatic Peel 15%',               brand: 'PCA Skin',      lastOrderDaysAgo: 22, status: 'healthy',  avgReorderDays: 28 },
    { productName: 'HA Intensive Hydrating Serum',     brand: 'SkinMedica',    lastOrderDaysAgo: 18, status: 'healthy',  avgReorderDays: 30 },
    { productName: 'Daily Physical Defense SPF 30',    brand: 'SkinCeuticals', lastOrderDaysAgo: 25, status: 'healthy',  avgReorderDays: 30 },
    { productName: 'Clarifying Toner',                 brand: 'Environ',       lastOrderDaysAgo: 26, status: 'warning',  avgReorderDays: 25 },
    { productName: 'Niacinamide Brightening Gel',      brand: 'iS Clinical',   lastOrderDaysAgo: 35, status: 'warning',  avgReorderDays: 30 },
    { productName: 'Peptide Complex Serum',            brand: 'PCA Skin',      lastOrderDaysAgo: 52, status: 'critical', avgReorderDays: 28 },
    { productName: 'Multi-Acid Resurfacing Peel',      brand: 'SkinMedica',    lastOrderDaysAgo: 48, status: 'critical', avgReorderDays: 30 },
  ];
}

// ── Peer group metadata ────────────────────────────────────────────
export function getPeerGroupInfo(): PeerGroupInfo {
  return {
    type: 'Medspas',
    region: 'Southwest',
    size: 142,
    avgRevenue: '$26,400/mo',
  };
}
