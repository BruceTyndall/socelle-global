# REVENUE LAYER BACKLOG
**The PRO Edit — Revenue Intelligence Layer**
*Version 1.0 | February 2026 | Surgical, Scope-Controlled Tickets*

---

## Ground Rules

1. **No engine changes.** `gapAnalysisEngine.ts`, `retailAttachEngine.ts`, `mappingEngine.ts`, and `planOrchestrator.ts` are untouched.
2. **Minimal diffs.** Every ticket specifies exact files modified and why.
3. **Reuse existing data.** `revenue_model_defaults`, `protocol_costing`, `service_category_benchmarks`, and `business_plan_outputs` are the primary data sources.
4. **No new backend services.** All new logic is client-side pure functions or reads from existing tables.
5. **Each ticket has instrumentation.** Revenue Intelligence Layer instrumentation uses the existing `platform_events` table infrastructure.

---

## P0 — Safe Foundations (Required Before Any Revenue UI Ships)

### RL-P0-001 — Fix Active Race Condition (Plan Analysis → Results)
**Impact:** Trust — first-session wow moment fails 100% of the time without this
**Files touched:**
- `src/pages/business/PlanResults.tsx`

**Problem:** Navigation to PlanResults happens before `saveOutputs()` completes. User sees empty tabs on first analysis. Revenue data never loads. The Revenue Intelligence Layer cannot display anything meaningful if plan outputs don't load.

**Solution:**
```typescript
// PlanResults.tsx — on mount, subscribe to plans.status
const channel = supabase
  .channel(`plan-${planId}`)
  .on('postgres_changes', {
    event: 'UPDATE', schema: 'public', table: 'plans',
    filter: `id=eq.${planId}`
  }, (payload) => {
    if (payload.new.status === 'ready') {
      fetchPlanData();
      channel.unsubscribe();
    }
  })
  .subscribe();

// Show animated "Analyzing..." state while status = 'processing'
// Only render tabs when status = 'ready'
```

**Acceptance Criteria:**
- [ ] PlanResults shows processing state (not empty tabs) while analysis runs
- [ ] Results auto-populate when status changes to 'ready'
- [ ] Timeout after 3 minutes → show retry state
- [ ] Zero empty-tab first loads

**Tests:**
- E2E: create plan → verify processing screen shows → verify results auto-appear
- Unit: Supabase Realtime mock fires update → component re-fetches

**Instrumentation:** `plan_analysis_completed` event when status → ready (duration_ms property)

---

### RL-P0-002 — Create `business_settings` Store
**Impact:** Data foundation — every Revenue Intelligence calculation depends on this
**Files touched:**
- `src/lib/businessSettings.ts` (NEW)
- `src/lib/supabase.ts` (no change — reuses client)

**Problem:** No place to store rooms count, operating hours, avg price, etc. Without this, all revenue metrics default to industry averages. The layer works but is labeled "est." everywhere.

**Solution (V1 — zero migration):**
Store in `user_profiles.metadata` as JSONB. No new table.

```typescript
// src/lib/businessSettings.ts

export interface BusinessSettings {
  rooms_count: number;           // default: 1
  operating_hours_day: number;   // default: 8
  operating_days_week: number;   // default: 5
  avg_sessions_day: number;      // default: 6
  avg_service_price: number;     // default: from revenue_model_defaults by spa type
  avg_service_duration: number;  // minutes, default: 60
  avg_retail_transaction: number;// default: 45
  retail_attach_rate: number;    // default: 0.15
  spa_type: string;              // 'spa' | 'medspa' | 'salon' | 'barbershop'
  settings_completed: boolean;   // false = using defaults
  last_updated: string;
}

export async function getBusinessSettings(userId: string): Promise<BusinessSettings>
export async function saveBusinessSettings(userId: string, settings: Partial<BusinessSettings>): Promise<void>
export function getDefaultSettings(spaType: string): BusinessSettings
  // Uses existing revenue_model_defaults table defaults
```

**Acceptance Criteria:**
- [ ] `getBusinessSettings()` returns defaults if no settings saved
- [ ] Defaults sourced from `revenue_model_defaults` table (not hardcoded)
- [ ] `saveBusinessSettings()` updates `user_profiles.metadata.business_settings`
- [ ] `settings_completed: false` → all metrics labeled "est."
- [ ] `settings_completed: true` → metrics labeled with actual data

**Tests:**
- Unit: `getDefaultSettings('medspa')` returns revenue_model_defaults medspa values
- Unit: `saveBusinessSettings()` → `getBusinessSettings()` returns saved values
- Integration: user_profiles.metadata persists across sessions

**Instrumentation:** `business_settings_saved` (fields_entered count, settings_completed boolean)

---

### RL-P0-003 — Create `revenueCalculator.ts` (Core Math Layer)
**Impact:** Foundation for all Revenue Intelligence metrics
**Files touched:**
- `src/lib/revenueCalculator.ts` (NEW)

**Problem:** Revenue calculations are currently inside `gapAnalysisEngine.ts` and inaccessible to the frontend. The dashboard needs a pure client-side calculation layer that uses business_settings.

**Solution:**
```typescript
// src/lib/revenueCalculator.ts — pure functions, zero async

export interface RevenueMetrics {
  // Capacity
  availableHoursPerWeek: number;
  bookedHoursPerWeek: number;
  utilizationPct: number;
  idleDollarsPerWeek: number;

  // Weekly estimates
  weeklyServiceRevenue: number;
  weeklyRetailRevenue: number;
  weeklyTotalRevenue: number;

  // Monthly/Annual
  monthlyRevenue: number;
  annualRevenue: number;

  // Per-room
  revenuePerRoomHourPerWeek: number;

  // Ticket
  avgServiceTicket: number;
  avgTotalTicket: number;

  // Retail
  retailAttachRate: number;
  retailRevenuePerService: number;
  retailContributionPct: number;

  // Metadata
  isEstimated: boolean;      // true if any default used
  confidence: 'high' | 'medium' | 'low';
}

export function calculateRevenueMetrics(settings: BusinessSettings): RevenueMetrics
export function calculateIdleDollars(settings: BusinessSettings): number
export function calculateRevenueRange(base: number): { low: number; base: number; high: number }
  // low = base × 0.7, high = base × 1.3

// Reuse: pulls default_utilization_per_month from revenue_model_defaults
// when settings.avg_sessions_day is the default value
```

**Acceptance Criteria:**
- [ ] All functions are pure (no async, no side effects)
- [ ] `calculateRevenueRange()` always returns range (never single number)
- [ ] `isEstimated: true` when any input uses a default value
- [ ] Division by zero handled gracefully (returns 0, not NaN/Infinity)
- [ ] Unit tests cover all edge cases

**Tests:**
- Unit: `calculateRevenueMetrics({ rooms: 2, sessions: 8, price: $120 })` → correct values
- Unit: zero rooms_count → no crash, returns 0s
- Unit: `calculateRevenueRange(1000)` → `{ low: 700, base: 1000, high: 1300 }`

**Instrumentation:** None — pure function

---

### RL-P0-004 — Add "(est.)" Labeling to All Estimated Metrics
**Impact:** Trust — non-negotiable. Users must know what is estimated vs real.
**Files touched:**
- `src/components/ui/StatCard.tsx` (add optional `isEstimated` prop)
- `src/lib/revenueCalculator.ts` (from RL-P0-003)

**Solution:**
```typescript
// StatCard.tsx — add isEstimated prop
interface StatCardProps {
  // ... existing props
  isEstimated?: boolean;  // shows "est." label if true
}
// Render: value display shows "est." in light gray when isEstimated=true
```

**Acceptance Criteria:**
- [ ] Every revenue metric derived from defaults shows "est." label
- [ ] Every revenue metric from user-entered data shows no label (or "actual")
- [ ] "est." label has tooltip: "Estimated using industry defaults. Update your Revenue Profile for accurate numbers."
- [ ] Existing StatCard usage (non-revenue) unaffected

**Tests:**
- Snapshot: StatCard with isEstimated=true shows "est." suffix
- Snapshot: StatCard with isEstimated=false shows no suffix

---

## P1 — Core Revenue Intelligence UX

### RL-P1-001 — Revenue Pulse Section (Dashboard Above-the-Fold)
**Impact:** Conversion (primary upgrade trigger) + activation (new users see value immediately)
**Files touched:**
- `src/pages/business/Dashboard.tsx` — add `<RevenuePulseSection />` above existing content
- `src/components/business/RevenuePulseSection.tsx` (NEW)
- `src/components/business/WeeklyKpiRow.tsx` (NEW)
- `src/components/business/OpportunityStrip.tsx` (NEW)

**Data sources:**
- `getBusinessSettings()` (from RL-P0-002) → capacity/pricing inputs
- `calculateRevenueMetrics()` (from RL-P0-003) → KPI values
- Existing `business_plan_outputs` (gaps output) → top 3 opportunities
- `leakageEngine.transform()` (from RL-P1-002) → ranked opportunities

**4 weekly KPI cards:**
1. Utilization % (progress bar, color-coded red/amber/green)
2. Idle $ Lost (loss-framed, always amber/red, CTA to fill capacity)
3. Revenue estimate (weekly, green)
4. Retail $ (weekly, green, with attach rate context)

**Top 3 Opportunities strip:**
- Sorted by LeakageScore (from RL-P1-002)
- Annual $ estimate (range), complexity badge, CTA to plan

**Empty states:**
- No settings: "Complete your Revenue Profile to unlock" → 6-field modal
- No plan: "Upload your menu to unlock opportunities" → plan wizard CTA

**Acceptance Criteria:**
- [ ] Revenue Pulse section renders above existing dashboard content
- [ ] 4 KPI cards show with loading skeletons while data loads
- [ ] Idle $ Lost shown in amber/red, never green
- [ ] Top 3 opportunities linked to specific plan gaps
- [ ] "Edit Assumptions" opens 6-field modal
- [ ] Mobile: horizontal scroll for KPI row, stacked for opportunities
- [ ] Existing dashboard content (plan list, checklist) preserved below fold

**Tests:**
- E2E: new user → dashboard → settings prompt visible → complete settings → KPIs appear
- E2E: existing user with plan → opportunities visible and linked
- Unit: `calculateRevenueMetrics` outputs drive card values correctly

**Instrumentation:**
- `kpi_dashboard_viewed` (has_settings, has_plan, utilization_pct)
- `opportunity_clicked` (rank, annual_base_$, complexity)

---

### RL-P1-002 — Leakage Engine Transform
**Impact:** Revenue framing — converts abstract gaps into dollar-framed loss narrative
**Files touched:**
- `src/lib/leakageEngine.ts` (NEW — pure function, no DB calls)
- `src/components/business/LeakageCard.tsx` (NEW)
- `src/pages/business/PlanResults.tsx` — swap `GapCard` → `LeakageCard` in gaps tab

**What this does:** Transforms existing `GapAnalysis[]` output from `business_plan_outputs` into `LeakageItem[]` sorted by `LeakageScore`.

```typescript
// LeakageScore = (annual_revenue_estimate × urgency_multiplier) / complexity_cost
// annual = estimated_monthly_revenue × 12
// urgency: seasonal_gap = 1.5, High priority = 1.3, standard = 1.0
// complexity: Low = 1.0, Medium = 1.5, High = 2.5

// Revenue range: { low: annual × 0.6, base: annual, high: annual × 1.4 }
// If estimated_monthly_revenue null: derive from revenue_model_defaults by gap_category
```

**LeakageCard display:**
- Title (plain English — no "canonical protocol" language)
- "$X,XXX – $X,XXX walking out the door annually" (range, amber)
- Complexity badge: QUICK WIN / MODERATE / COMPLEX
- "What it takes" collapsed section
- Retail bundle attach $ (from retail_attach output)
- CTA: "See the plan to capture this revenue →" → links to existing protocol detail

**Acceptance Criteria:**
- [ ] Gaps sorted by LeakageScore (highest ROI first)
- [ ] "QUICK WIN" badge on low complexity + high score items
- [ ] Revenue shown as annual range, never monthly single number
- [ ] Zero technical jargon (no "canonical protocol", "pgvector", "confidence threshold")
- [ ] Existing gap analysis engine untouched
- [ ] Paywall gate: 3 items free, remainder locked (integrates with subscription tier check)

**Tests:**
- Unit: `leakageEngine.transform(gaps, settings)` → sorted LeakageItem[]
- Unit: LeakageScore ranks correctly across edge cases
- Unit: null `estimated_monthly_revenue` → falls back to category default
- E2E: gap tab shows leakage cards in correct order

**Instrumentation:**
- `leakage_item_viewed` (item_id, leakage_score, annual_base)
- `leakage_cta_clicked` (item_id, complexity)

---

### RL-P1-003 — Retail Bundle Layer
**Impact:** Revenue (retail attach is the highest-margin, lowest-effort revenue lever)
**Files touched:**
- `src/lib/retailBundleBuilder.ts` (NEW — pure function)
- `src/components/business/RetailBundleCard.tsx` (NEW)
- `src/components/business/AttachScript.tsx` (NEW)
- `src/pages/business/PlanResults.tsx` — extend activation_assets tab

**What this does:** Transforms existing `retail_attach` output into retail bundles with scripts and margin estimates. Extends the existing Activation Kit tab — does NOT create a new tab.

```typescript
// retailBundleBuilder.ts
// Input: RetailAttachOutput[] + BusinessSettings + product pricing from DB
// Output: RetailBundle[] with:
//   - 2-4 SKUs per service (uses existing rank + confidence from retailAttachEngine)
//   - suggestedSellPrice = bundleMsrp × 0.9
//   - estimatedMargin = (sellPrice - wholesale) / sellPrice
//   - attachProbabilityPct = category default from ATTACH_DEFAULTS map
//   - revenuePerService = sellPrice × attachProbabilityPct
//   - annualRevenue = revenuePerService × sessions_per_week × 48
```

**AttachScript component:**
```
Short (30s): "I used [hero product] during your [service] today — it [benefit].
              We have it at the front for $[price]."
Long (90s): "I wanted to mention a couple things I used today..."
[Copy Script] button (clipboard API)
```

**RetailBundleCard display:**
- Service name + hero product image (if available) + 1-2 support products
- Bundle price + margin %
- Attach probability slider (editable, defaults from category table)
- "If X% attach on this service: +$X,XXX/year" annual estimate
- [Shop Bundle] CTA → pre-populates cart with SKUs

**Acceptance Criteria:**
- [ ] Retail bundle section visible in existing Activation Kit tab
- [ ] Attach probability slider updates annual estimate in real time
- [ ] Script copy button works (clipboard)
- [ ] [Shop Bundle] CTA adds correct SKUs to cart (or links to PRO shop if cart not built yet)
- [ ] Zero changes to retailAttachEngine.ts

**Tests:**
- Unit: `retailBundleBuilder.transform(retail_attach, settings)` → RetailBundle[]
- Unit: attach probability slider → correct revenue calculation
- E2E: bundle card shows, script copy works

**Instrumentation:**
- `retail_bundle_viewed` (service_id, bundle_value)
- `script_copied` (service_id, version: 'short'|'long')
- `attach_probability_edited` (service_id, old_pct, new_pct)

---

### RL-P1-004 — Revenue Assumptions Settings Modal
**Impact:** Data quality — enables accurate metrics for all revenue calculations
**Files touched:**
- `src/components/business/RevenueAssumptionsModal.tsx` (NEW)
- `src/pages/business/Dashboard.tsx` — wire "Edit Assumptions" button
- `src/pages/business/Settings.tsx` — add "Revenue Profile" section

**6 fields (no more):**
1. Treatment rooms (number stepper, default: 1)
2. Services per day (number stepper, default: 6)
3. Avg service price ($ input, default: from revenue_model_defaults by business type)
4. Avg service duration (dropdown: 30/45/60/75/90 min, default: 60)
5. Retail attach rate (% slider 0–80%, default: 15%)
6. Avg retail transaction ($ input, default: $45)

**Acceptance Criteria:**
- [ ] Modal opens from "Edit Assumptions ✏️" button on dashboard
- [ ] All 6 fields show "(industry default)" label until user edits
- [ ] Saving updates `user_profiles.metadata.business_settings`
- [ ] After save: all dashboard metrics recalculate instantly (no page refresh)
- [ ] Settings also accessible from `/portal/settings` → "Revenue Profile" section
- [ ] Mobile: bottom sheet layout

**Tests:**
- E2E: open modal → change avg price → save → verify dashboard metrics update
- Unit: default values match revenue_model_defaults for each business type
- Accessibility: focus trap, ESC closes, focus returns to trigger

**Instrumentation:**
- `revenue_settings_opened` (trigger: 'dashboard_banner'|'edit_button'|'settings_page')
- `revenue_settings_saved` (fields_changed count, business_type)

---

## P2 — Simulator + Benchmarking

### RL-P2-001 — Pricing + Revenue Simulator
**Impact:** Conversion (primary Growth tier upgrade trigger)
**Files touched:**
- `src/pages/business/PricingSimulator.tsx` (NEW)
- `src/lib/pricingSimulator.ts` (NEW — pure function)
- `src/App.tsx` — add route `/portal/plans/:id/simulate`
- `src/pages/business/PlanResults.tsx` — add "Simulate Revenue Impact" CTA

**Simulator spec:** See `PRICING_SIMULATOR_SPEC.md` for full detail.

**Key requirements:**
- Pure client-side math (no new API calls)
- 4 scenario presets (Price Increase / Fill Idle Time / Retail Push / Full Optimization)
- All outputs shown as ranges (low/base/high)
- Breakeven analysis for price changes
- Behind Growth tier paywall (Starter sees read-only preview)
- Save state via `plan_outputs` JSONB (output_type: 'revenue_simulation')

**Acceptance Criteria:**
- [ ] Sliders update outputs in < 100ms
- [ ] All outputs shown as ranges, never single numbers
- [ ] Breakeven section shows for price change scenarios
- [ ] "Explain the math" expander on every output panel
- [ ] Saved scenario persists across sessions
- [ ] Free tier sees locked preview with upgrade CTA

**Tests:**
- Unit: `runSimulation(inputs)` → correct outputs
- Unit: all edge cases (zero sessions, 100% price increase, etc.)
- E2E: adjust slider → verify output updates
- E2E: save scenario → navigate away → return → scenario restored

**Instrumentation:**
- `simulator_opened` (plan_id, has_prior_simulation)
- `preset_selected` (preset_name)
- `input_changed` (input_name, direction: 'increase'|'decrease')
- `scenario_saved` (annual_base)

---

### RL-P2-002 — Benchmark Cards (Dashboard + Detail)
**Impact:** Retention + motivation + Pro tier conversion
**Files touched:**
- `src/lib/benchmarkData.ts` (NEW — static TypeScript constants)
- `src/lib/benchmarkEngine.ts` (NEW — percentile lookup function)
- `src/components/business/BenchmarkCard.tsx` (NEW)
- `src/pages/business/Dashboard.tsx` — add benchmark section below Revenue Pulse

**Benchmark spec:** See `BENCHMARKING_SPEC.md` for full detail.

**V1 approach:** Static TypeScript constants from industry reports (no DB queries).
- Day Spa, MedSpa, Salon, Barbershop × 4 dimensions × P25/P50/P75

**Benchmark cards display:**
- Business's position on a P25–P75 bar chart
- "You're in the top X%" text
- "Reaching median would add ~$X,XXX/year" calculation
- "[See how to improve →]" CTA linking to leakage or retail attach

**Paywall:**
- Starter: bars visible, position blurred. "Upgrade to Growth to see your percentile."
- Growth+: full access

**Acceptance Criteria:**
- [ ] All 4 benchmark dimensions visible on dashboard
- [ ] Position correctly calculated from business_settings metrics
- [ ] "ASSUMPTION" label + source visible on every benchmark
- [ ] Opt-in required before data is added to aggregate pool (separate toggle in settings)
- [ ] Free tier sees blurred percentile position

**Tests:**
- Unit: `getPercentilePosition(value, benchmarks)` → correct percentile
- Unit: all 4 business types return valid benchmark data
- Snapshot: BenchmarkCard renders correctly at P25, P50, P75 positions

**Instrumentation:**
- `benchmark_section_viewed` (business_type, dimensions_shown)
- `benchmark_detail_opened` (dimension, user_percentile)
- `benchmark_opt_in` (opted_in: true)

---

### RL-P2-003 — Wire `platform_events` to Revenue Layer Actions
**Impact:** Product intelligence + feature iteration velocity
**Files touched:**
- `src/lib/analytics.ts` (NEW — thin wrapper)
- All new Revenue Layer components (add event calls)

**Problem:** `platform_events` table exists and has RLS for user INSERTs but no UI component fires events.

**Solution:**
```typescript
// src/lib/analytics.ts
export async function trackEvent(
  eventType: string,
  category: 'engagement' | 'conversion' | 'commerce',
  properties: Record<string, unknown>
): Promise<void> {
  await supabase.from('platform_events').insert({
    event_type: eventType,
    event_category: category,
    properties,
    page_path: window.location.pathname,
  });
  // Non-blocking: fire and forget, never throw
}
```

**Events to wire (from all P1 specs):**
- `kpi_dashboard_viewed`, `opportunity_clicked`, `leakage_item_viewed`
- `retail_bundle_viewed`, `script_copied`, `assumption_edited`
- `revenue_settings_saved`, `plan_analysis_completed`

**Acceptance Criteria:**
- [ ] `trackEvent()` never throws (all errors caught and swallowed)
- [ ] Events appear in `platform_events` table after each user action
- [ ] No PII in event properties (no email, no names)
- [ ] Event calls are non-blocking (never delay UI interactions)

**Tests:**
- Unit: `trackEvent()` with Supabase mock → verify correct insert shape
- Unit: Supabase error → no exception propagated

---

### RL-P2-004 — Revenue Layer Integration into Plan Wizard (Pre-Analysis Framing)
**Impact:** Activation — sets expectation before analysis runs
**Files touched:**
- `src/pages/business/PlanWizard.tsx` — add revenue preview in Step 4 (Review)

**What to add:** In the existing Review step (Step 4) before "Analyze Menu" button, show:
```
WHAT YOU'LL DISCOVER
Based on your menu and [Brand X]:

  ✓ How much revenue you're leaving on the table
  ✓ Your top 3 quick-win opportunities (with $ estimates)
  ✓ Which retail products to add to each service
  ✓ A pricing simulation based on your service mix

Ready? This takes about 30 seconds.
[Analyze Menu →]
```

**Acceptance Criteria:**
- [ ] Revenue preview section visible in Step 4 before submit
- [ ] No mock/placeholder dollar numbers — only the feature list
- [ ] Does not delay or change the analysis flow
- [ ] Copy reviewed by product/marketing before shipping

---

## P3 — Polish

### RL-P3-001 — Revenue Uplift Summary in Plan Results Overview Tab
**Impact:** Value delivery — the `growth_potential_percent` field already exists in plan output
**Files touched:** `src/pages/business/PlanResults.tsx` (overview tab)

**What to add:** Promote the existing `growth_potential_percent` from the overview JSON to a hero banner:
```
REVENUE OPPORTUNITY IDENTIFIED
Your menu has a $X,XXX – $X,XXX/year growth potential (X% above current)
[See Revenue Breakdown →]
```

---

### RL-P3-002 — Revenue History Trend Cards (When ≥2 Plans Exist)
**Impact:** Retention — shows progress over time
**Files touched:** `src/pages/business/Dashboard.tsx`

**What to add:** When a business has ≥2 plans, show trend arrow comparing `growth_potential_percent` across plans. "Your gap opportunity decreased 12% — you're implementing." Positive reinforcement loop.

---

### RL-P3-003 — Idle Time Calendar Visualization
**Impact:** Urgency — visual representation of empty chair time
**Files touched:** `src/components/business/WeeklyKpiRow.tsx`

**What to add:** Small heatmap-style weekly calendar grid in the Utilization card showing estimated filled vs empty hour blocks. Visual > numbers for motivation.

---

### RL-P3-004 — "Share Your Results" for Revenue Simulator
**Impact:** Viral / referral loop
**Files touched:** `src/pages/business/PricingSimulator.tsx`

**What to add:** "Share with your accountant/partner" button that generates a read-only URL with inputs encoded in query params. No DB write needed.

---

### RL-P3-005 — Monthly Revenue Summary Email (Trigger-Based)
**Impact:** Retention / re-engagement
**Files touched:** New Edge Function `send-monthly-summary`

Trigger: 28 days after last login. Content: utilization trend, top opportunity not yet acted on, seasonal preview. Uses existing plan output data. Requires email service integration.

---

## Ticket Execution Order (Next Sprint)

| Sprint Order | Ticket | Est. Days | Unblocks |
|---|---|---|---|
| 1 | RL-P0-001 (race condition fix) | 1 | Everything |
| 2 | RL-P0-002 (business_settings store) | 1 | All KPIs |
| 3 | RL-P0-003 (revenueCalculator.ts) | 1 | Dashboard + Simulator |
| 4 | RL-P0-004 ("est." labeling) | 0.5 | Trust |
| 5 | RL-P1-004 (settings modal) | 1.5 | Accurate KPIs |
| 6 | RL-P1-002 (leakage engine transform) | 2 | Gap tab reframe |
| 7 | RL-P1-001 (revenue pulse dashboard) | 3 | Above-the-fold |
| 8 | RL-P1-003 (retail bundle layer) | 2 | Kit tab extension |
| 9 | RL-P2-001 (pricing simulator) | 3 | Upgrade trigger |
| 10 | RL-P2-002 (benchmark cards) | 2 | Retention |
| 11 | RL-P2-003 (event wiring) | 1 | Analytics |
| 12 | RL-P2-004 (wizard pre-framing) | 0.5 | Activation |

**Total: ~18 working days for full Revenue Intelligence Layer**

---

## File Creation Summary

| File | Type | Size Est. | Depends On |
|---|---|---|---|
| `src/lib/businessSettings.ts` | New | ~80 lines | Supabase client |
| `src/lib/revenueCalculator.ts` | New | ~120 lines | businessSettings |
| `src/lib/leakageEngine.ts` | New | ~80 lines | Gap output types |
| `src/lib/retailBundleBuilder.ts` | New | ~100 lines | Retail attach types |
| `src/lib/pricingSimulator.ts` | New | ~120 lines | businessSettings |
| `src/lib/benchmarkData.ts` | New | ~80 lines | Static only |
| `src/lib/benchmarkEngine.ts` | New | ~50 lines | benchmarkData |
| `src/lib/analytics.ts` | New | ~40 lines | Supabase client |
| `src/components/business/RevenuePulseSection.tsx` | New | ~150 lines | revenueCalculator |
| `src/components/business/WeeklyKpiRow.tsx` | New | ~100 lines | RevenuePulseSection |
| `src/components/business/OpportunityStrip.tsx` | New | ~80 lines | leakageEngine |
| `src/components/business/LeakageCard.tsx` | New | ~100 lines | leakageEngine |
| `src/components/business/RetailBundleCard.tsx` | New | ~80 lines | retailBundleBuilder |
| `src/components/business/AttachScript.tsx` | New | ~60 lines | RetailBundleCard |
| `src/components/business/RevenueAssumptionsModal.tsx` | New | ~120 lines | businessSettings |
| `src/components/business/BenchmarkCard.tsx` | New | ~100 lines | benchmarkEngine |
| `src/pages/business/PricingSimulator.tsx` | New | ~250 lines | pricingSimulator |
| `src/pages/business/Dashboard.tsx` | Modified | +~30 lines | RevenuePulseSection |
| `src/pages/business/PlanResults.tsx` | Modified | +~20 lines | LeakageCard |
| `src/App.tsx` | Modified | +~5 lines | PricingSimulator route |

**Total: ~17 new/modified files, ~1,740 net-new lines**
**Zero engine modifications. Zero new Edge Functions. Zero new Supabase migrations required for V1.**

---

*Last updated: 2026-02-22 | Revenue Intelligence Layer v1.0*
