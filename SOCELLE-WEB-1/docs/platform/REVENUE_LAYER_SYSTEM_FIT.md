# REVENUE LAYER SYSTEM FIT
**The PRO Edit — Revenue Intelligence Layer**
*Version 1.0 | February 2026 | Repo Reality Scan Results*

---

## Overview

This document is the output of a forensic repo scan performed before any Revenue Intelligence Layer code is written. It defines what already exists, what can be reused, where the new layer hooks in, and what minimal additions are required. It is the single source of truth for "what do we build vs what do we reuse."

**Bottom line:** The repo has significantly more revenue infrastructure than was visible from the UI. The Revenue Intelligence Layer requires very few net-new systems — primarily a presentation reframe and a thin calculation layer on top of existing data.

---

## A) Current Stack + Structure

### Frontend
```
React 18.3.1 + TypeScript 5.5.3 + Vite 5.4.2
React Router 7.12.0 (lazy-loaded routes)
Tailwind CSS 3.4.1 with custom pro-* token system:
  pro.navy (#1E3A5F), pro.gold (#C5A572), pro.ivory (#FAFAF7),
  pro.cream (#F5F1EC), pro.stone (#E8E3DA), pro.charcoal (#2D2D2D)
Fonts: DM Serif Display (headings) + Inter (body)
```

### Backend
```
Supabase (PostgreSQL + Auth + Storage + Edge Functions)
Supabase SDK 2.57.4
pgvector for semantic protocol matching
AI: Claude via Supabase Edge Functions only (never client-side)
```

### Deployment
```
Netlify (live: funny-lily-1fb045.netlify.app)
SPA routing via _redirects
```

---

## B) Existing Analytics / Events Infrastructure

**Result: Comprehensive event infrastructure exists. None of it is wired to the business portal UI yet.**

### `platform_events` table (migration: 20260222000001)
```
event_type       text     — page_view, menu_uploaded, brand_viewed, order_placed, etc.
event_category   text     — navigation | engagement | conversion | commerce
properties       jsonb    — arbitrary event properties
user_id          uuid
org_id           uuid
session_id       text
page_path        text
referrer         text
ip_hash          text
created_at       timestamptz
```
RLS: authenticated users can INSERT. Platform admins can SELECT all.

### `business_analytics` table (migration: 20260222000001)
```
Menu coverage:   total_services, mapped_services, unmapped_services, menu_coverage_rate
Brand activity:  brands_viewed, brands_matched, brands_ordered
Commerce:        total_orders, total_spend, avg_order_value
Retail:          retail_revenue, retail_uplift_pct
Plans:           plans_created, plans_activated
```

### `brand_analytics` table (migration: 20260222000001)
Full discovery + engagement + commerce + retention + lead conversion rollups. Scoped to brand_id.

### `revenue_attribution` table (migration: 20260222000001)
Multi-touch attribution framework:
```
attribution_source: organic_search | ai_recommendation | protocol_match | direct | concierge
first_touch_event_id, last_touch_event_id
days_to_conversion
order_value, commission_amount
```
This is pre-built for future ROI reporting. Not wired to any UI.

### `mapping_analytics` table
```
plan_id, service_name, protocol_id, match_score, match_type
accepted (boolean), rejected (boolean), feedback text
```
User feedback loop data. Not yet surfaced.

### `analyticsService.ts` (existing file in src/lib/)
```typescript
getBrandAnalytics(brandId, period)      → brand KPIs with trend calculation
getBusinessAnalytics(businessId, period) → business KPIs
mkTrend(cur, prev)                      → { changePct, direction: 'up'|'down'|'flat' }
```
This service is built but no business portal page currently calls it.

**Revenue Layer action:** Wire `getBusinessAnalytics()` into the new dashboard section. Zero new backend work.

---

## C) Existing "Money Logic" Modules

**Result: Deep revenue logic already exists in the AI engines. The business portal UI does not surface it.**

### `gapAnalysisEngine.ts` — Primary Revenue Source

**`calculateRevenueEstimate(servicePrice, utilizationRate, protocolCogs)`**
- Revenue = servicePrice × utilizationRate
- Profit = revenue − (protocolCogs × utilizationRate)
- Confidence: High (all 3 inputs) / Medium (2 inputs) / Low (1 input) / Unknown

**`getRevenueDefaults()`** — Reads from `revenue_model_defaults` table:
- `default_utilization_per_month` (treatments per month by spa type)
- `default_attach_rate` (retail attach %)
- `default_retail_conversion_rate`

**`getCategoryBenchmarks()`** — Reads from `service_category_benchmarks`:
- Min service count per category per spa type
- Used to identify category gaps

**Revenue defaults already seeded** (from `20260221000002_seed_benchmarks_and_revenue_defaults.sql`):

| Spa Type | Avg Price | Treatments/Mo | Attach % | Retail Txn | Utilization |
|---|---|---|---|---|---|
| MedSpa (Facials) | $350 | 40 | 45% | $125 | 70% |
| Resort Spa (Massage) | $175 | 80 | 20% | $60 | 75% |
| Day Spa (Hands/Feet) | $65 | 60 | 30% | $35 | 75% |
| Wellness (Massage) | $130 | 60 | 20% | $50 | 70% |
| General (Facials) | $155 | 40 | 28% | $70 | 65% |

**Revenue Layer action:** The Revenue Intelligence Layer reuses these exact defaults. No new default system needed.

---

### `retailAttachEngine.ts` — Existing Retail Scoring

**`calculateProductScore()`** scoring breakdown:
- Protocol allowed products match: +50 pts
- Exact category match: +25 pts
- Related category match: +15 pts
- Concern overlap: +0–30 pts
- Seasonal alignment: +10 pts

Outputs top 2 products per service with confidence score and rationale.

**Revenue Layer action:** The retail bundle builder (`retailBundleBuilder.ts`) is a new thin layer on top of this output. Does not change the engine.

---

### `openingOrderEngine.ts` — Investment Estimation

Calculates `estimatedBackbarInvestment` + `estimatedRetailInvestment` from wholesale prices.
Returns `total_estimated_investment`.

**Revenue Layer action:** Reuse this output for "payback period" calculation in the Pricing Simulator. Total investment ÷ weekly margin uplift = payback period in weeks.

---

### `planOutputGenerator.ts` — Revenue Summary Already Exists

```typescript
currentRevenue = mappings.reduce((sum, m) => sum + (m.estimated_monthly_revenue || 0))
growth_potential_percent = (gapRevenue / currentRevenue) * 100
```

The executive summary in `overview` output already contains a `growth_potential_percent`. The business portal does not prominently surface this. It is the most important number on the platform.

**Revenue Layer action:** Promote `growth_potential_percent` from buried plan detail to above-the-fold dashboard card.

---

### `protocol_costing` table

Per-protocol COGS data with confidence rating (High/Medium/Low).
Used by `calculateRevenueEstimate()` for profit calculations.

**Revenue Layer action:** Surface COGS/margin data in the Gap Detail page and Retail Attach cards. All data is already in DB.

---

### `pricing_uplift_rules` table

Fields: `spa_type`, `base_to_custom_uplift_percent`, `seasonal_premium_percent`
Status: Seeded as placeholder for future pricing optimization.

**Revenue Layer action:** Use `seasonal_premium_percent` in the Pricing Simulator's seasonal scenario preset. No new table needed.

---

## D) Existing Entities

### Services + Menus
```
spa_menus        — raw menu uploads (PDF/DOCX extracted text)
menu_uploads     — upload tracking (file_path, source_type, raw_text)
spa_services     — parsed services from menus
spa_service_mapping — service ↔ protocol mappings with service_price field
```

**Key field:** `spa_service_mapping.service_price` — actual prices from uploaded menus. Used by `calculateRevenueEstimate()`. This is the most accurate pricing input available.

### Protocols + SKUs
```
canonical_protocols           — master protocol library
canonical_protocol_steps      — step-by-step procedures
canonical_protocol_step_products — products per step
pro_products                  — professional/backbar products (with wholesale price)
retail_products               — consumer retail products (with MSRP + cost)
protocol_costing              — COGS per protocol (estimated_cogs, cogs_confidence)
```

### Plans + Outputs
```
plans                   — plan metadata (status: processing|ready|failed)
menu_uploads            — raw menu content
business_plan_outputs   — analysis results (output_type × output_data jsonb)
  output_type values: 'overview' | 'protocol_matches' | 'gaps' | 'retail_attach' | 'activation_assets'
service_gap_analysis    — detailed gap records with revenue fields
```

**`gaps` output shape** (from scan):
```json
{
  "gap_type": "category_gap|seasonal_gap|signature_missing|enhancement_missing",
  "gap_category": "string",
  "gap_description": "string",
  "priority_level": "High|Medium|Low",
  "recommended_protocol_id": "uuid",
  "estimated_monthly_revenue": 1200,
  "estimated_monthly_profit": 890,
  "impact_confidence": "High|Medium|Low|Unknown"
}
```

**`retail_attach` output shape**:
```json
{
  "service_name": "string",
  "products": [{
    "product_id": "uuid",
    "rank": 1,
    "confidence_score": 75,
    "rationale": "string",
    "matching_criteria": ["string"],
    "is_seasonally_relevant": true
  }]
}
```

**`activation_assets` output shape** — full investment summary with estimated_investment.total already computed.

### Orders + Commerce (COMPLETE — confirmed by second scan)
```
orders      — status: submitted|reviewing|sent_to_brand|confirmed|fulfilled|cancelled
              subtotal, commission_percent, commission_total, admin_fee
order_items — order_id, product_type (pro|retail), product_id, product_name, sku,
              unit_price, qty, line_total  ← ALREADY EXISTS (migration 20260216235428)
brand_shop_settings — shop_enabled, min_order_amount, fulfillment_email, featured_product_ids
```
**Correction from initial scan:** `order_items` table was confirmed in second scan — it exists. Previous note "no order_items table found yet" was incorrect.

### Subscriptions + Billing
```
NOT YET IMPLEMENTED — no subscriptions table, no Stripe integration
```

---

## E) Where to Hook In the Revenue Layer

### Hook 1 — Business Dashboard (Highest Priority)
**File:** `src/pages/business/Dashboard.tsx`
**Add:** `<RevenuePulseSection>` component above existing content
**Data:** `getBusinessAnalytics()` (already built in `analyticsService.ts`) + `business_settings` (new table or user_profiles JSONB)
**Net-new code:** ~200 lines (component + calculation utility)
**Zero changes to:** existing dashboard content, routing, auth

### Hook 2 — Gap Analysis → Leakage Reframe
**File:** `src/pages/business/PlanResults.tsx` (gaps tab)
**Add:** Replace `GapCard` component with `LeakageCard` component
**Data:** Existing `business_plan_outputs` WHERE output_type = 'gaps' — no schema change
**New file:** `src/lib/leakageEngine.ts` — pure transform function
```typescript
// Input: GapAnalysis[] + BusinessSettings → Output: LeakageItem[] sorted by LeakageScore
```
**Net-new code:** ~150 lines (engine transform + new card component)
**Zero changes to:** gapAnalysisEngine.ts, mapping engine, plan analysis flow

### Hook 3 — Retail Bundle Layer
**File:** `src/pages/business/PlanResults.tsx` (activation_assets / kit tab)
**Add:** `RetailBundleCard` component + `AttachScript` component
**Data:** Existing `retail_attach` output from `business_plan_outputs`
**New file:** `src/lib/retailBundleBuilder.ts` — pure transform
**Net-new code:** ~200 lines (bundle builder + 2 components)
**Zero changes to:** retailAttachEngine.ts

### Hook 4 — Pricing Simulator
**File:** `src/App.tsx` (new route) + `src/pages/business/PlanResults.tsx` (add CTA)
**New file:** `src/pages/business/PricingSimulator.tsx`
**New file:** `src/lib/pricingSimulator.ts` (pure calculation function)
**Data:** business_settings + openingOrderEngine output (total_estimated_investment)
**Net-new code:** ~350 lines
**No new tables needed** (use plan_outputs JSONB for saved scenarios)

### Hook 5 — Benchmarking Section
**File:** `src/pages/business/Dashboard.tsx` (add section below Revenue Pulse)
**New file:** `src/lib/benchmarkData.ts` (static TypeScript constants, no DB queries in V1)
**New file:** `src/components/business/BenchmarkCard.tsx`
**Net-new code:** ~200 lines
**No new tables needed for V1** (static benchmark data from industry reports)

---

## F) What Needs to Be Built vs Reused

### ✅ Reuse Directly (Zero Changes)
| Asset | Location | Used For |
|---|---|---|
| `calculateRevenueEstimate()` | `gapAnalysisEngine.ts:184` | Revenue calculations |
| `getRevenueDefaults()` | `gapAnalysisEngine.ts:59` | Default utilization/attach rates |
| `revenue_model_defaults` table | DB | Pricing + utilization benchmarks |
| `service_category_benchmarks` table | DB | Category gap benchmarking |
| `protocol_costing` table | DB | COGS for margin calculations |
| `retailAttachEngine.ts` scoring | `retailAttachEngine.ts:71` | Product recommendations |
| `getBusinessAnalytics()` | `analyticsService.ts:142` | Dashboard KPIs |
| `platform_events` table | DB | Event instrumentation |
| `business_plan_outputs` (gaps + retail) | DB | Leakage + retail data source |
| `activation_assets` investment estimate | DB/plan output | Payback period calculation |
| `pricing_uplift_rules.seasonal_premium_pct` | DB | Seasonal simulator preset |

### ⚡ New Thin Layers (Minimal Code, High Value)
| Asset | Type | Purpose | Est. Lines |
|---|---|---|---|
| `src/lib/leakageEngine.ts` | Pure function | Transform gaps → LeakageItem[] | ~80 |
| `src/lib/retailBundleBuilder.ts` | Pure function | Transform retail_attach → RetailBundle[] | ~100 |
| `src/lib/pricingSimulator.ts` | Pure function | Revenue impact calculations | ~120 |
| `src/lib/benchmarkData.ts` | Static constants | Industry benchmark data | ~80 |
| `src/lib/revenueCalculator.ts` | Pure function | Dashboard KPI calculations | ~100 |
| `src/components/business/RevenuePulseSection.tsx` | React component | Dashboard above-the-fold | ~150 |
| `src/components/business/LeakageCard.tsx` | React component | Replaces GapCard | ~100 |
| `src/components/business/RetailBundleCard.tsx` | React component | Retail bundle display | ~80 |
| `src/components/business/BenchmarkCard.tsx` | React component | Benchmark display | ~100 |
| `src/pages/business/PricingSimulator.tsx` | React page | Full simulator screen | ~250 |

### 🗄️ New Tables Required (Minimal)
| Table | Purpose | Alternative |
|---|---|---|
| `business_settings` | Rooms, hours, avg price, attach rate per business | Store in `user_profiles.metadata` JSONB (zero migration) |
| `revenue_simulations` | Saved simulator scenarios | Store in `business_plan_outputs` as new output_type (zero migration) |

**Not needed (confirmed existing):** `order_items` ✅, `orders` ✅, `brand_shop_settings` ✅
Second scan confirmed these exist in migration `20260216235428`. The Revenue Layer builds on top of them.

**Preferred approach for V1:** Use `user_profiles.metadata` JSONB for business_settings to avoid migration. Create proper `business_settings` table in V2 when aggregate benchmarking requires queryable fields.

---

## G) Missing Data Inputs (Critical)

The following data is NOT in the system and must be captured from users:

| Missing Input | Impact if Missing | How to Capture |
|---|---|---|
| Treatment rooms count | Capacity/utilization calculation broken | Business settings modal (6 fields) |
| Operating hours/days | Available hours denominator missing | Business settings modal |
| Avg sessions per day | Booked hours estimator broken | Business settings modal |
| Actual service prices | Revenue estimates use category defaults | Already partially in menu uploads (service_price field) |
| Retail attach rate | Retail metrics use industry default (15%) | Business settings modal |
| Avg retail transaction | Retail revenue calculation degraded | Business settings modal |

**Verdict:** 6 input fields in a `business_settings` profile captures everything needed for accurate Revenue Intelligence. Without these, the layer runs on industry defaults (always labeled "est."). With them, it runs on actual business data.

---

## H) Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Revenue estimates shown without "(est.)" label | 🔴 P0 Trust | Every estimated metric shows "est." — non-negotiable |
| business_analytics table not populated (no historical data) | 🟠 P1 | Fall back to calculated values from business_settings; real-time query for current state |
| platform_events not wired to UI | 🟡 P2 | V1 can use simple console events; wire to platform_events table in P2 sprint |
| revenue_model_defaults not found for specific business type | 🟡 P2 | Fall back to 'general' spa type defaults; already seeded |
| Benchmarks shown as facts when they're industry estimates | 🔴 P0 Trust | Every benchmark labeled with source + "ASSUMPTION" |

---

## Summary: Revenue Layer Build Profile

```
Net-new files:          ~12 files
Net-new lines of code:  ~1,400 lines
New DB tables:          0 required (2 optional for V2)
Engine changes:         0 (zero modifications to existing engines)
New backend services:   0
New Edge Functions:     0
Existing reuse:         8 functions / 6 tables / 1 service module

Estimated build time (single engineer):
  Phase 0 (bug fixes first):      2–3 days
  Phase 1 (dashboard + leakage):  5–7 days
  Phase 2 (simulator + benchmarks): 4–5 days
  Total Revenue Layer MVP:        ~2.5–3 weeks
```

---

*Last updated: 2026-02-22 | Scan performed by automated agents across full repo*
*Revenue Layer System Fit | The PRO Edit*
