// ── Mock Multi-Location Data ───────────────────────────────────────────
// WO-22: Local mock data — no Supabase mutations

import type { OperatorLocation, LocationSummary, CrossLocationInsight } from './types';

const MOCK_OPERATOR_ID = 'op_multi_001';

export const MOCK_LOCATIONS: OperatorLocation[] = [
  {
    id: 'loc_001',
    parentOperatorId: MOCK_OPERATOR_ID,
    locationName: 'Downtown Austin Flagship',
    address: '401 Congress Ave, Suite 200',
    city: 'Austin',
    state: 'TX',
    zip: '78701',
    businessType: 'medspa',
    isPrimary: true,
  },
  {
    id: 'loc_002',
    parentOperatorId: MOCK_OPERATOR_ID,
    locationName: 'Lakeway Wellness Center',
    address: '1205 Lohmans Crossing Rd',
    city: 'Lakeway',
    state: 'TX',
    zip: '78734',
    businessType: 'day_spa',
    isPrimary: false,
  },
  {
    id: 'loc_003',
    parentOperatorId: MOCK_OPERATOR_ID,
    locationName: 'Round Rock Medical Spa',
    address: '2000 S IH-35, Suite 110',
    city: 'Round Rock',
    state: 'TX',
    zip: '78681',
    businessType: 'medspa',
    isPrimary: false,
  },
  {
    id: 'loc_004',
    parentOperatorId: MOCK_OPERATOR_ID,
    locationName: 'Cedar Park Studio',
    address: '700 E Whitestone Blvd',
    city: 'Cedar Park',
    state: 'TX',
    zip: '78613',
    businessType: 'esthetician_studio',
    isPrimary: false,
  },
];

export const MOCK_LOCATION_SUMMARIES: LocationSummary[] = [
  {
    location: MOCK_LOCATIONS[0],
    revenue: 12_400,
    growth: 14.2,
    skuCount: 87,
    benchmarkScore: 72,
    status: 'active',
  },
  {
    location: MOCK_LOCATIONS[1],
    revenue: 8_700,
    growth: 8.5,
    skuCount: 54,
    benchmarkScore: 65,
    status: 'active',
  },
  {
    location: MOCK_LOCATIONS[2],
    revenue: 6_200,
    growth: -2.1,
    skuCount: 41,
    benchmarkScore: 58,
    status: 'active',
  },
  {
    location: MOCK_LOCATIONS[3],
    revenue: 4_100,
    growth: 22.7,
    skuCount: 29,
    benchmarkScore: 71,
    status: 'onboarding',
  },
];

export const MOCK_CROSS_LOCATION_INSIGHTS: CrossLocationInsight[] = [
  {
    type: 'product_gap',
    title: 'Lakeway missing top-selling SKU from Flagship',
    description:
      'Downtown Austin\'s #1 retinol serum (SkinCeuticals Retinol 0.5) drives $1,800/mo but is not stocked at Lakeway Wellness Center. Adding it could capture similar demand.',
    locationIds: ['loc_001', 'loc_002'],
    impact: 'high',
  },
  {
    type: 'performance_delta',
    title: 'Round Rock benchmark score declining',
    description:
      'Round Rock Medical Spa dropped 6 points in benchmark score over the past quarter. Peer medspas in the area average 68 — consider a menu audit.',
    locationIds: ['loc_003'],
    impact: 'high',
  },
  {
    type: 'opportunity',
    title: 'Cedar Park outpacing growth targets',
    description:
      'Cedar Park Studio is growing at 22.7% — the fastest across all locations. Consider expanding its SKU assortment to capitalize on momentum.',
    locationIds: ['loc_004'],
    impact: 'medium',
  },
  {
    type: 'product_gap',
    title: 'Sunscreen category underrepresented at 3 locations',
    description:
      'Only Downtown Austin carries the EltaMD UV Clear line. Lakeway, Round Rock, and Cedar Park could each add 2–3 SPF SKUs to match regional demand.',
    locationIds: ['loc_002', 'loc_003', 'loc_004'],
    impact: 'medium',
  },
  {
    type: 'opportunity',
    title: 'Bundle purchasing across locations for volume discount',
    description:
      'Combined ordering of shared SKUs across all 4 locations could unlock tier-2 pricing with SkinCeuticals and EltaMD, saving an estimated $620/mo.',
    locationIds: ['loc_001', 'loc_002', 'loc_003', 'loc_004'],
    impact: 'high',
  },
];

// ── Public accessors ────────────────────────────────────────────────────

export function getLocations(): OperatorLocation[] {
  return MOCK_LOCATIONS;
}

export function getLocationSummaries(): LocationSummary[] {
  return MOCK_LOCATION_SUMMARIES;
}

export function isMultiLocation(): boolean {
  return MOCK_LOCATIONS.length > 1;
}

export function getCrossLocationInsights(): CrossLocationInsight[] {
  return MOCK_CROSS_LOCATION_INSIGHTS;
}

export function getLocationById(id: string): OperatorLocation | undefined {
  return MOCK_LOCATIONS.find((l) => l.id === id);
}
