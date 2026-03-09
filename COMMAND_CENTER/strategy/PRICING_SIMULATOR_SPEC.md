# PRICING SIMULATOR SPEC
**The PRO Edit — Revenue Intelligence Layer**
*Version 1.0 | February 2026 | B2C Beauty Revenue Operating System*

---

## Overview

The Pricing Simulator lets beauty operators test the financial impact of pricing and operational changes before committing. It is the primary tool for converting analytical insight ("I see I'm underpriced") into a concrete decision ("here's what a 10% price increase does to my monthly revenue").

**Design philosophy:**
- Math must be transparent and editable. No black boxes.
- Every number is a range, never a single point estimate.
- One screen, one decision at a time. No 8-slider cognitive overload.
- If elasticity modeling is too speculative, use sensitivity labels instead of equations.

**Hook point:** This is a new screen (`/portal/plans/:id/simulate`) that extends the existing plan results. It reads from the plan's mapped services and the user's business settings. It does NOT call any new backend services — it is a pure client-side calculation engine.

**Relationship to existing simulator concept:** The P1 backlog included a `RevenueSimulator` build. This spec replaces and supersedes that ticket with a more complete, beauty-operator-specific design.

---

## Section 1: Inputs

### 1.1 Input Groups

The simulator has three collapsible input groups. Only Group A is expanded by default.

**Group A — Pricing (Expanded by default)**
| Input | Type | Default | Range |
|---|---|---|---|
| Price change % | Slider + input | 0% | -30% to +50% |
| Apply to | Multi-select | All services | Per-service breakdown available |
| Current avg service price | $ input | From business settings or $85 | $20–$500 |

**Group B — Capacity (Collapsed by default — "Expand capacity assumptions")**
| Input | Type | Default | Range |
|---|---|---|---|
| Current utilization % | Slider | 60% (ASSUMPTION) | 10%–100% |
| Utilization change assumption | Slider | 0% | -20% to +40% |
| Sessions per week | Number | 24 (ASSUMPTION) | 1–100 |
| Operating weeks per year | Number | 48 | 20–52 |

**Group C — Retail Attach (Collapsed by default — "Expand retail assumptions")**
| Input | Type | Default | Range |
|---|---|---|---|
| Current retail attach rate | Slider % | 15% (ASSUMPTION) | 0%–80% |
| Retail attach change | Slider | 0% | -10% to +30% |
| Avg retail transaction | $ input | $45 (ASSUMPTION) | $5–$200 |

**ASSUMPTION labeling rule:** Every default that is estimated (not entered by the user) shows "est." in light gray beside the value. Clicking "est." opens a tooltip: "This is an industry default. Update it in Revenue Settings for more accurate projections."

---

### 1.2 Scenario Presets

Above the input groups, offer 4 one-click scenario presets that pre-fill all inputs:

| Preset | Label | What It Sets |
|---|---|---|
| 💲 Price Increase | "What if I raise prices 10%?" | price_change: +10%, util_change: -5% (mild elasticity), attach: unchanged |
| 📅 Fill Idle Time | "What if I fill 80% of my calendar?" | util_change to reach 80%, price: unchanged |
| 🛍️ Retail Push | "What if I double my retail attach?" | attach_rate: current × 2, cap at 45%, price: unchanged |
| 🚀 Full Optimization | "What if I do all three?" | price +8%, util +15%, attach rate +10% |

Preset selection updates all sliders/inputs immediately. User can then fine-tune.

---

## Section 2: Outputs

### 2.1 Primary Output Panel

Always visible, updates in real time as inputs change (< 100ms target).

```
┌────────────────────────────────────────────────────────────┐
│  PROJECTED IMPACT                                          │
│                                                            │
│  Weekly Revenue                                            │
│  Current: $2,040          Projected: $2,244 – $2,448      │
│  Change: +$204 – +$408 / week  (+10% – +20%)              │
│                                                            │
│  Monthly Revenue                                           │
│  Current: $8,840          Projected: $9,724 – $10,608     │
│  Change: +$884 – +$1,768 / month                          │
│                                                            │
│  Annual Revenue                                            │
│  Current: $106,080        Projected: $116,800 – $127,296  │
│  Change: +$10,720 – +$21,216 / year  ←── HERO NUMBER     │
│                                                            │
│  [How we calculate this ▼]                                │
└────────────────────────────────────────────────────────────┘
```

The annual range is the hero number — largest font, most prominent. Beauty operators make decisions on annual impact.

### 2.2 Secondary Output: Revenue Per Room Hour

```
Revenue / Room Hour
Current: $51 / hr       Projected: $56 – $61 / hr
Industry avg: $75 / hr  ← benchmark reference (grey)
```

### 2.3 Breakeven Analysis

For price increases only: show the utilization loss at which the price increase breaks even (revenue neutral).

```
BREAKEVEN POINT
A 10% price increase breaks even if you lose fewer than 9.1% of bookings.
(i.e., 80% → 72.7% utilization or better)

[Conservative] Assume -5% bookings:  Net change: +$884/mo
[Neutral]       Assume 0% bookings:  Net change: +$1,768/mo
[Aggressive]    Assume -10% bookings: Net change: -$88/mo
```

**Elasticity note:** Do not model price elasticity as a function — it is too speculative for individual beauty businesses. Instead, use the three scenario labels (Conservative/Neutral/Aggressive) with pre-set utilization impact percentages. Label: "ASSUMPTION: elasticity varies by market. These are illustrative scenarios."

### 2.4 Retail Impact Breakdown

Only shown when retail inputs are changed (Group C):

```
RETAIL IMPACT
Current: $286/mo (est.)    Projected: $572/mo (est.)
Change: +$286/mo / +$3,432/year

Based on: 24 sessions/week × 15% attach → 30% attach × $45 avg transaction × 48 weeks
```

### 2.5 "Explain the Math" Expander

Mandatory on the primary output panel. Content:

```
HOW WE CALCULATE THIS

Service revenue = sessions_per_week × avg_price × weeks_per_year
Retail revenue = sessions_per_week × attach_rate × avg_retail_transaction × weeks_per_year
Total revenue = service revenue + retail revenue

Price change impact: applies price_change_pct to avg_price
Utilization change impact: scales sessions_per_week proportionally
Retail attach change: applies to attach_rate

All figures shown as a range:
  Conservative = base × 0.8
  Optimistic = base × 1.2
```

---

## Section 3: Per-Service Breakdown (Advanced Mode)

Accessible via "See service-by-service breakdown →" toggle below the primary output.

Shows a table with one row per mapped service from the user's plan:

| Service | Current Price | New Price | Weekly Sessions | Weekly Revenue | Change |
|---|---|---|---|---|---|
| Hydrating Facial | $95 | $105 (+10%) | 4 | $420 | +$40/wk |
| Deep Tissue Massage | $85 | $94 (+10%) | 6 | $564 | +$54/wk |
| Body Wrap | $120 | $132 (+10%) | 2 | $264 | +$24/wk |

Rules:
- Services pulled from plan's matched services (existing plan data)
- Prices editable per-service for granular scenarios
- "Sessions/week" is user-editable
- Rows highlighted amber if price is below category benchmark

---

## Section 4: Save + Share

- **Save scenario:** stores current input state to `revenue_simulations` table (new, minimal — see Section 6)
- **Share link:** generates a read-only URL with inputs encoded in query params (no DB write needed)
  - URL format: `/portal/plans/:id/simulate?scenario=BASE64_ENCODED_INPUTS`
  - Valid for 30 days
- **Export:** PDF snapshot of current outputs with all assumptions listed

---

## Section 5: Paywall Placement

- Free tier (Starter): simulator accessible but inputs locked after first scenario
  - Show read-only preview of one preset scenario
  - "Customize assumptions → Upgrade to Growth"
- Growth + Pro: full access, all scenarios, save + share

---

## Section 6: Data Model (Minimal Addition)

Only one new table needed. All calculations are client-side.

```sql
-- Saved simulator scenarios per plan
CREATE TABLE revenue_simulations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id       uuid REFERENCES plans(id) ON DELETE CASCADE,
  business_id   uuid NOT NULL,
  scenario_name text NOT NULL DEFAULT 'My Scenario',
  inputs        jsonb NOT NULL,  -- all slider/input values
  outputs       jsonb,           -- cached output snapshot
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- RLS: business_id = auth user's business OR admin
```

**Alternative if table is too much for MVP:** Store scenario in `plan_outputs` JSONB using `output_type = 'revenue_simulation'`. Zero schema change. Acceptable for V1.

---

## Section 7: Calculation Engine (Client-Side)

New file: `src/lib/pricingSimulator.ts`

```typescript
interface SimulatorInputs {
  currentAvgPrice: number;          // $
  priceChangePct: number;           // e.g. 0.10 = 10%
  currentSessionsPerWeek: number;
  utilizationChangePct: number;     // e.g. 0.05 = 5% more bookings
  operatingWeeksPerYear: number;    // default 48
  currentAttachRate: number;        // e.g. 0.15 = 15%
  attachRateChangePct: number;      // e.g. 0.10 = +10pp
  avgRetailTransaction: number;     // $
  rooms: number;                    // for revenue/room/hr
  avgServiceDurationHours: number;  // for revenue/hr calc
}

interface SimulatorOutputs {
  current: {
    weeklyRevenue: number;
    monthlyRevenue: number;
    annualRevenue: number;
    revenuePerRoomHour: number;
    retailMonthly: number;
  };
  projected: {
    conservative: SimulatorOutputs['current'];
    base: SimulatorOutputs['current'];
    optimistic: SimulatorOutputs['current'];
  };
  breakeven?: {
    utilizationLossToBreakEven: number;   // % sessions lost before net-zero
    breakEvenUtilizationPct: number;
  };
}

export function runSimulation(inputs: SimulatorInputs): SimulatorOutputs { ... }
```

This function is pure (no side effects, no async). Can be unit tested with 100% coverage.

---

## Section 8: Hook Points (Minimal Diff)

| What | Where | Change Type |
|---|---|---|
| New route `/portal/plans/:id/simulate` | `src/App.tsx` | Add 1 lazy import + 1 route |
| Simulator nav link in plan results | `src/pages/business/PlanResults.tsx` | Add 1 tab/CTA |
| Simulation engine | `src/lib/pricingSimulator.ts` | NEW FILE (pure function) |
| Simulator page | `src/pages/business/PricingSimulator.tsx` | NEW FILE |
| Saved simulations table | Supabase migration | NEW TABLE (or use existing plan_outputs JSONB) |
| "Revenue Settings" in settings page | `src/pages/business/Settings.tsx` | Add business_settings form section |

Zero changes to: mapping engine, plan analysis flow, brand portal, admin portal.

---

## Section 9: Instrumentation Events

| Event | Trigger | Properties |
|---|---|---|
| simulator_opened | Page mount | plan_id, has_prior_simulation |
| preset_selected | Preset button clicked | preset_name |
| input_changed | Any input changes | input_name, old_value, new_value |
| scenario_saved | Save button | scenario_name, annual_base |
| share_link_generated | Share button | plan_id |
| breakeven_viewed | Breakeven section expanded | price_change_pct |

---

*Last updated: 2026-02-22 | Revenue Intelligence Layer v1.0*
