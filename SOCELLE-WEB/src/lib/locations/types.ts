// ── Multi-Location Operator Types ──────────────────────────────────────
// WO-22: All data is mock/local state — no Supabase migrations

export type BusinessType = 'medspa' | 'day_spa' | 'salon' | 'esthetician_studio' | 'clinic';

export interface OperatorLocation {
  id: string;
  parentOperatorId: string;
  locationName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  businessType: BusinessType;
  isPrimary: boolean;
}

export interface LocationSummary {
  location: OperatorLocation;
  revenue: number;
  growth: number;       // percentage, e.g. 12.3 = +12.3%
  skuCount: number;
  benchmarkScore: number; // 0–100
  status: 'active' | 'onboarding' | 'paused';
}

export interface LocationContext {
  selectedLocationId: string | 'all';
  locations: OperatorLocation[];
}

export interface CrossLocationInsight {
  type: 'product_gap' | 'performance_delta' | 'opportunity';
  title: string;
  description: string;
  locationIds: string[];
  impact: 'high' | 'medium' | 'low';
}
