# LEAKAGE ENGINE SPEC — Reframing Gap Analysis as Revenue Leakage

## Overview

This spec describes a **presentation layer transformation** applied on top of the existing gap analysis engine. No underlying detection logic changes. The goal is to reframe "missing service categories" as "money you are leaving on the table" — a loss-framed, dollar-quantified view that drives action.

### What Changes
- Presentation layer: gap cards are replaced by leakage cards
- Ranking logic: gaps are re-sorted by a new LeakageScore (ROI-first)
- Dollar framing: every gap is expressed as an annual revenue estimate with a low/base/high range
- Complexity framing: implementation effort is translated into plain-English "what it takes" language

### What Does NOT Change
- `gapAnalysisEngine.ts` — untouched
- `mappingEngine.ts` — untouched
- `business_plan_outputs` table schema — no changes
- Plan analysis flow — untouched
- Confidence scoring logic — reused, not replaced

### Hook Point
```
business_plan_outputs WHERE output_type = 'gaps'
```

The new leakage layer sits **between** the raw gap data stored in `business_plan_outputs` and the UI rendering in `PlanResults.tsx`. It is a pure transformation function: reads existing gap output, computes LeakageScore and revenue ranges, returns `LeakageItem[]` for the UI to render.

---

## Section 1: Input Data (Existing Gap Output Shape)

The existing gap analysis engine stores results in `business_plan_outputs` with `output_type = 'gaps'`. Each item in `output_data` conforms to the following shape:

```typescript
interface GapAnalysis {
  id: string;                          // gap record ID
  gap_type:
    | 'missing_service'
    | 'underrepresented_category'
    | 'menu_imbalance'
    | 'price_gap';
  recommended_protocol: string;        // canonical protocol reference ID
  category: string;                    // e.g. "massage", "facial", "body_treatment"
  priority: 'High' | 'Medium' | 'Low';
  confidence: number;                  // 0–1, from existing confidence scoring
  revenue_model?: {
    monthly_revenue_est?: number;      // present if benchmark data available
    sessions_per_week_assumption?: number;
    price_assumption?: number;
  };
  implementation_complexity: 'Low' | 'Medium' | 'High';
  seasonal_relevance?: {
    is_seasonal: boolean;
    peak_months?: number[];            // 1–12
    demand_signal?: 'high' | 'standard';
  };
  rationale?: string;                  // human-readable reason this gap was flagged
}
```

### Fields Present vs. Missing for the Leakage Reframe

| Field | Present in Existing Output | Needed for Leakage Reframe | Source |
|---|---|---|---|
| `gap_type` | Yes | Yes — maps to leakage title template | Existing |
| `recommended_protocol` | Yes | Yes — links to protocol detail | Existing |
| `priority` | Yes | Used as urgency input | Existing |
| `confidence` | Yes | Displayed as plain-English confidence label | Existing |
| `revenue_model.monthly_revenue_est` | Sometimes | Yes — base for annual estimate | Existing (optional) |
| `implementation_complexity` | Yes | Yes — maps to "what it takes" | Existing |
| `seasonal_relevance` | Yes | Yes — feeds urgency_multiplier | Existing |
| `annual_low` | No | Must compute in leakage layer | Computed |
| `annual_base` | No | Must compute in leakage layer | Computed |
| `annual_high` | No | Must compute in leakage layer | Computed |
| `leakageScore` | No | Must compute in leakage layer | Computed |
| `leakage_title` | No | Must generate from template | Generated |
| `requiredInputs` | No | Must map from complexity | Mapped |
| `retailBundleUptick` | No | Must derive from retail attach data | Cross-referenced |
| `urgencySignal` | No | Must derive from seasonal + demand | Derived |

---

## Section 2: The Leakage Score Formula

Every gap record is assigned a `LeakageScore` used exclusively for sorting. It is computed in the presentation layer; it is never persisted.

```
LeakageScore = (annual_revenue_estimate × urgency_multiplier) / complexity_cost
```

### annual_revenue_estimate

Prefer the most specific available source, in this order:

1. `revenue_model.monthly_revenue_est × 12` (if present in existing gap output)
2. `sessions_per_week × service_price × 48` (computed from business settings)
3. Category benchmark default (see Section 5)

### urgency_multiplier

| Condition | Multiplier |
|---|---|
| Seasonal: peak season approaching (current month within 60 days of peak_months start) | 1.5 |
| High-demand category (`seasonal_relevance.demand_signal === 'high'`) | 1.3 |
| Standard (no signal) | 1.0 |

Only the highest applicable multiplier is applied (not stacked).

### complexity_cost

| Implementation Complexity | Divisor |
|---|---|
| Low (no new staff, no new equipment, SKU add only) | 1.0 |
| Medium (some training, 1–2 new SKUs) | 1.5 |
| High (new equipment, major training, long ramp) | 2.5 |

### Sort Order

Sort all gaps by `LeakageScore` **DESC**. The top 5 results are displayed as "Priority Leakage Points." All remaining gaps are accessible via "View all X leakage points →".

### Example Calculation

```
Gap: Missing hot stone massage upgrade
monthly_revenue_est: $1,200  →  annual_revenue_estimate: $14,400
seasonal_relevance: peak months [11, 12, 1]  →  urgency_multiplier: 1.5  (December approaching)
implementation_complexity: Low  →  complexity_cost: 1.0

LeakageScore = (14,400 × 1.5) / 1.0 = 21,600
```

---

## Section 3: New Display Format for Each Leakage Item

### Leakage Card Structure

Each leakage card renders six elements:

1. **Leakage title** — Plain English. Never use internal system terminology.
   - Example: "You're missing hot stone massage upgrade"
   - Example: "Chemical peel services are absent from your menu"

2. **$ framing** — Loss-framed annual range. Always annual, never monthly.
   - Format: "Estimated $X,XXX – $X,XXX walking out the door annually"
   - Uses `annualLow` and `annualHigh` for the range ends.

3. **Confidence** — Map existing `confidence` score (0–1) to plain English:
   - 0.8–1.0 → "High confidence — based on your menu analysis and verified industry benchmarks"
   - 0.6–0.79 → "Moderate confidence — based on your menu analysis and category averages"
   - 0.4–0.59 → "Estimated — based on category benchmarks; refine with your pricing"
   - < 0.4 → "Indicative only — limited data; treat as directional"

4. **What it takes** — Complexity badge (Low / Med / High) plus the human-readable requirement list (see Section 6).

5. **Retail bundle opportunity** — "This service typically attaches $XX in retail per visit." Value sourced from `retailBundleUptick` (cross-referenced from retail attach output; default $25 if unavailable).

6. **CTA** — "See the plan to capture this revenue →" Links to the protocol detail view for `protocolId`.

### Component Data Shape

```typescript
interface LeakageItem {
  id: string;

  // Display
  title: string;                // plain English leakage title
  leakageScore: number;         // computed score; used for sort order only

  // Revenue range
  annualLow: number;            // conservative estimate (60% of base)
  annualBase: number;           // base estimate
  annualHigh: number;           // optimistic estimate (140% of base)

  // Operational
  complexity: 'low' | 'medium' | 'high';
  requiredInputs: string[];     // e.g. ["Staff training: 4 hrs", "2 new SKUs"]
  implementationWeeks: string;  // e.g. "1–2 weeks"

  // Retail
  retailBundleUptick: number;   // $ per visit from retail attach

  // Links
  protocolId: string;           // links to canonical protocol for CTA
  urgencySignal?: string;       // human-readable signal, e.g. "Holiday season approaching"

  // Provenance
  sourceGapId: string;          // links back to original gap record in business_plan_outputs
  confidenceLabel: string;      // plain-English confidence string (mapped in leakageEngine.ts)
  isQuickWin: boolean;          // true if complexity === 'low' AND leakageScore in top 3
}
```

---

## Section 4: Ranking Display Rules

### Revenue Display
- Always show a 3-way range: low / base / high. Never display a single number.
- Always lead with the **annual** figure. Never lead with monthly.
  - Correct: "$14,400/year"
  - Incorrect: "$1,200/month"
- Format numbers with commas. No cents. No decimal places for amounts over $1,000.

### Color Coding
- Leakage framing (loss frame): **amber / orange** (`#F59E0B` / `#EA580C`)
- Opportunity framing (gain frame): **green** (`#16A34A`)
- Quick Win badge: **amber background**, bold label

### Sort Order
Sort `LeakageItem[]` by `leakageScore` DESC before rendering. This sort is performed once in `leakageEngine.ts`; the UI renders in the order it receives.

### Above-the-Fold Display
- Show top **5** leakage items above the fold.
- All remaining items hidden behind: **"View all X leakage points →"** (X = total count).
- The count includes ALL gaps, not just the top 5.

### Priority Badge
Display **"QUICK WIN"** badge when both conditions are true:
- `complexity === 'low'`
- `leakageScore` is in the top 3 of the ranked list

### Urgency Signal
If `urgencySignal` is present, display a secondary line beneath the title:
- Format: "Peak season approaching — act now for maximum capture"
- Color: amber

---

## Section 5: Revenue Range Calculation

Revenue ranges are computed in `leakageEngine.ts` from the following inputs. All inputs come from existing sources: the gap record, business settings, or hardcoded benchmark defaults.

### Base Formula

```
sessions_per_week = business_settings.utilization_inputs.sessions_per_week
                    OR revenue_model.sessions_per_week_assumption
                    OR default: 4

service_price     = revenue_model.price_assumption
                    OR service_category_benchmarks (by category)
                    OR hardcoded category default (see below)

weeks_per_year    = 48  (operating weeks — NOT 52)

base_annual  = sessions_per_week × service_price × weeks_per_year
low_annual   = base_annual × 0.6    // conservative: 60% ramp
high_annual  = base_annual × 1.4    // optimistic: 140% of base
```

### Priority Override

If `revenue_model.monthly_revenue_est` is present in the existing gap output:

```
base_annual = monthly_revenue_est × 12
low_annual  = base_annual × 0.6
high_annual = base_annual × 1.4
```

This takes priority over the sessions-based formula.

### Hardcoded Category Defaults

Used only when no price is available from the gap record or benchmarks table. Always label these values as **ASSUMPTION** in the UI.

| Service Category | Default Avg Price |
|---|---|
| Facial service | $95 |
| Massage | $85 |
| Body treatment | $110 |
| MedSpa service | $250 |
| Add-on / enhancement | $35 |
| Chemical peel | $130 |
| Waxing | $45 |
| Hair service | $75 |
| Nail service | $55 |

### Assumption Labeling

When a default price is used (not sourced from the business's actual menu or benchmark table), the UI must display:

> "Price based on category average — update with your actual pricing for a more accurate estimate"

This label appears inline beneath the revenue range on the leakage card.

---

## Section 6: Complexity Score → "What It Takes" Translation

Map `implementation_complexity` from the existing gap output to a human-readable requirements list. This mapping lives in `leakageEngine.ts`.

### Low Complexity

```
requiredInputs: [
  "No new staff training required",
  "Uses existing equipment",
  "1–2 new SKU additions only"
]
implementationWeeks: "1–2 weeks"
```

### Medium Complexity

```
requiredInputs: [
  "Staff training: 4–8 hours",
  "Minor equipment addition possible",
  "3–5 new SKUs",
]
implementationWeeks: "2–4 weeks"
```

### High Complexity

```
requiredInputs: [
  "Certification or advanced training required",
  "Equipment investment likely",
  "Complete protocol addition",
]
implementationWeeks: "4–12 weeks"
```

### Rendering in the UI

The `requiredInputs` array is rendered as a simple bulleted list under the complexity badge. The `implementationWeeks` string is rendered as: "Estimated time to implement: X weeks."

---

## Section 7: Hook Points (Where to Add Minimal Code)

### Existing File — Modified

**`src/pages/business/PlanResults.tsx`** (gaps tab)

- Import `leakageEngine` and `LeakageCard`
- Replace the existing `GapCard` render loop with `LeakageCard` render loop
- Pass `leakageEngine(gapData, businessSettings)` as the data source
- Add "View all X leakage points →" toggle beneath the top-5 slice
- No other changes to this file

### New File — Pure Transform

**`src/lib/leakageEngine.ts`**

```typescript
// Pure transformation function. No DB calls. No side effects.
// Input: GapAnalysis[] from business_plan_outputs + business_settings
// Output: LeakageItem[] sorted by leakageScore DESC

export function buildLeakageItems(
  gaps: GapAnalysis[],
  businessSettings: BusinessSettings
): LeakageItem[]
```

Internal steps:
1. For each `GapAnalysis`, compute `annualBase`, `annualLow`, `annualHigh` (Section 5 logic)
2. Compute `urgencyMultiplier` from `seasonal_relevance` (Section 2)
3. Compute `complexityCost` from `implementation_complexity` (Section 2)
4. Compute `leakageScore`
5. Map `complexity` to `requiredInputs` and `implementationWeeks` (Section 6)
6. Map `confidence` to `confidenceLabel` (Section 3)
7. Cross-reference retail attach output for `retailBundleUptick` (fallback: $25)
8. Generate `title` from gap type + category template
9. Set `isQuickWin` flag
10. Sort by `leakageScore` DESC
11. Return `LeakageItem[]`

### New Component

**`src/components/business/LeakageCard.tsx`**

Props: `LeakageItem` + `onCtaClick: (protocolId: string) => void`

Renders the six card elements defined in Section 3. Emits instrumentation events (Section 9).

### Route — No Change

Route remains: `/portal/plans/:id?tab=gaps`

The only change on this route is swapping `GapCard` for `LeakageCard` in the render loop. Tab label may optionally change from "Gaps" to "Revenue Leakage" — product decision, not a spec requirement.

---

## Section 8: What Does NOT Change

The following files and systems are **explicitly out of scope** for this spec. No modifications are permitted to these as part of leakage engine work.

| Asset | Status |
|---|---|
| `gapAnalysisEngine.ts` | Untouched |
| `mappingEngine.ts` | Untouched |
| `business_plan_outputs` table | No schema changes |
| Plan analysis flow (trigger, queue, job processing) | Untouched |
| Confidence scoring algorithm | Reused as-is; only the display label changes |
| Gap detection thresholds | Untouched |
| `GapAnalysis` interface | Read-only; `LeakageItem` wraps it, does not replace it |

Any change to the above requires a separate spec and separate review.

---

## Section 9: Instrumentation Events

All events are fired from `LeakageCard.tsx`. The leakage engine itself (`leakageEngine.ts`) emits no events — it is a pure function.

| Event Name | Trigger | Properties |
|---|---|---|
| `leakage_item_viewed` | Card scrolled into viewport (IntersectionObserver) | `item_id`, `leakage_score`, `annual_base` |
| `leakage_cta_clicked` | "See the plan to capture this revenue →" clicked | `item_id`, `complexity`, `protocol_id` |
| `leakage_expanded` | Card expanded to show full detail | `item_id`, `complexity`, `leakage_score` |
| `leakage_range_edited` | User edits a revenue assumption (price, sessions/week) | `item_id`, `field`, `old_value`, `new_value` |
| `leakage_view_all_clicked` | "View all X leakage points →" clicked | `total_count`, `plan_id` |

### Event Schema Notes

- `item_id` = `LeakageItem.id`
- `leakage_score` = rounded to 2 decimal places
- `annual_base` = integer (no decimals)
- `old_value` / `new_value` = numeric for revenue fields, string for categorical fields
- All events include standard session context (plan_id, user_id, timestamp) via the existing analytics wrapper
