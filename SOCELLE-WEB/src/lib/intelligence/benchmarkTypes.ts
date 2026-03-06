// ── Operator Benchmarking Types ─────────────────────────────────────
// WO-19: Benchmarking Dashboard — all data mock until enrichment pipeline (WO-16)

export type BenchmarkDimension =
  | 'revenue'
  | 'sku_diversity'
  | 'category_coverage'
  | 'reorder_health'
  | 'brand_diversity'
  | 'avg_order_value';

export interface BenchmarkScore {
  dimension: BenchmarkDimension;
  label: string;
  score: number;          // 0–100
  percentile: number;     // 0–100
  peerMedian: number;     // raw value
  operatorValue: number;  // raw value
  unit: string;           // e.g. '$', 'products', 'brands', '%', 'categories'
  recommendation?: string;
}

export interface OverallBenchmark {
  compositeScore: number; // 0–100
  dimensions: BenchmarkScore[];
  peerGroupSize: number;
  peerGroupType: string;
  region: string;
}

export interface CategoryCoverage {
  category: string;
  operatorCount: number;
  peerAvg: number;
  maxPossible: number;
}

export interface ReorderHealthItem {
  productName: string;
  brand: string;
  lastOrderDaysAgo: number;
  status: 'healthy' | 'warning' | 'critical';
  avgReorderDays: number;
}

export interface PeerGroupInfo {
  type: string;
  region: string;
  size: number;
  avgRevenue: string;
}
