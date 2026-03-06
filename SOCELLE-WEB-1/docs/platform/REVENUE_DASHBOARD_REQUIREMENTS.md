# REVENUE DASHBOARD REQUIREMENTS
**The PRO Edit — Revenue Intelligence Layer**
*Version 1.0 | February 2026 | B2C Beauty Revenue Operating System*

---

## Overview

This document specifies the redesigned Business Owner home dashboard (`/portal/dashboard`). The current dashboard shows onboarding checklist + plan count + protocol/product stats. That is a **tool dashboard**. This becomes a **revenue operating system**.

**The shift:** Above the fold changes from "here's what you've done" to "here's your money, this week."

**Constraint:** This is a modification of `src/pages/business/Dashboard.tsx`, not a rebuild. The new revenue section is added above the existing content. The existing plan list, onboarding checklist, and stat cards are preserved below the fold.

**Data source:** All revenue metrics come from `business_settings` (user inputs) + existing plan outputs (gap analysis, retail attach) + orders table. No new backend services required.

---

## Section 1: Above-the-Fold Layout

### 1.1 Desktop Layout (≥ 1024px)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  REVENUE PULSE — This Week                           [Edit Assumptions ✏️]     │
│                                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐ │
│  │ Utilization  │  │ Idle $ Lost  │  │ Revenue est. │  │ Retail $          │ │
│  │              │  │              │  │              │  │                   │ │
│  │    67%  ●    │  │  $340 lost   │  │  $2,040      │  │  $286             │ │
│  │ ████████░░   │  │  this week   │  │  this week   │  │  est.             │ │
│  │ 27 / 40 hrs  │  │ [Fill gaps→] │  │  (est.)      │  │  15% attach       │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └───────────────────┘ │
│                                                                                │
│  ───────────────────────────────────────────────────────────────────────────── │
│  THIS MONTH                                                                    │
│                                                                                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────────────────┐   │
│  │ Revenue/Room Hr  │  │ Avg Total Ticket  │  │ Retail Attach Rate        │   │
│  │                  │  │                   │  │                           │   │
│  │   $51/hr         │  │   $97             │  │   15%                     │   │
│  │   ↓ vs $65 avg   │  │   ($85 svc + $12  │  │   ↓ 7pp below median      │   │
│  │   [Improve→]     │  │    retail)        │  │   [Improve→]              │   │
│  └──────────────────┘  └──────────────────┘  └───────────────────────────┘   │
│                                                                                │
│  ───────────────────────────────────────────────────────────────────────────── │
│  YOUR TOP 3 OPPORTUNITIES                            [View all 8 →]           │
│                                                                                │
│  1. 🔴 $14,400/yr  Hot Stone Add-On      Low complexity   [See plan →]        │
│  2. 🟠 $9,200/yr   Retail Attach Push    No cost          [See plan →]        │
│  3. 🟡 $6,800/yr   Express Facial Tier   Low complexity   [See plan →]        │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Mobile Layout (< 768px)

Single-column stack. Priority order:
1. "This Week" row — horizontal scroll of 4 metric chips
2. "This Month" — 3 stat cards stacked
3. "Top Opportunities" — 3 leakage items in cards

Bottom tab bar remains unchanged.

---

## Section 2: Component Specs

### 2.1 "Revenue Pulse" Header Block

**Component:** `RevenueHeader` (new, ~50 lines)

```
REVENUE PULSE — This Week
                          [Edit Assumptions ✏️]  [?]
```

- "Edit Assumptions" opens the business settings modal (6 fields max)
- [?] opens methodology tooltip: "These figures are estimated based on your revenue profile. Update your assumptions for more accurate numbers."
- Always shows "Last updated: today" or relative timestamp

---

### 2.2 This Week — 4 KPI Cards

**Component:** `WeeklyKpiRow` (new)

#### Card 1: Utilization Rate

```
UTILIZATION
67%  ●
████████░░
27 / 40 hrs (est.)
```

- Color coding: red <50%, amber 50–70%, green ≥70%
- Progress bar visualization
- "(est.)" label if based on assumed inputs
- Click → opens utilization detail modal with capacity breakdown

**Calculation:**
```
utilization = (avg_sessions_day × avg_service_duration_hrs) / (operating_hours_day × rooms_count)
booked_hrs = avg_sessions_day × operating_days_week × avg_service_duration_hrs
available_hrs = operating_hours_day × operating_days_week × rooms_count
```

**Empty state:** "Set up your capacity profile to see utilization" → [Complete Profile]

---

#### Card 2: Idle $ Lost (Loss-Framed)

```
IDLE CHAIR TIME
$340 lost
this week (est.)

13 hrs unfilled
[Fill this capacity →]
```

- Always amber/red — this is a loss framing
- Never neutral. The dollar sign and "lost" language is intentional.
- CTA links to leakage engine view
- "How we calculate: (available_hrs - booked_hrs) × revenue_per_hr"

**Calculation:**
```
idle_hrs = available_hrs - booked_hrs
revenue_per_hr = avg_service_price / avg_service_duration_hrs
idle_$ = idle_hrs × revenue_per_hr
```

---

#### Card 3: Revenue Estimate

```
REVENUE
$2,040
this week (est.)

[$8,840 this month]
```

- Green color
- Weekly figure prominent, monthly in smaller text below
- "(est.)" label mandatory
- Click → opens revenue detail with service + retail breakdown

---

#### Card 4: Retail Revenue

```
RETAIL $
$286
this week (est.)

15% attach rate
```

- Green color
- Attach rate shown as context
- If attach rate < industry average: amber tint on the attach rate text
- Click → opens retail detail with bundle suggestions

---

### 2.3 This Month — 3 Secondary Metrics

**Component:** `MonthlyMetricRow` (new)

#### Revenue Per Room Hour

```
REVENUE / ROOM HOUR
$51/hr
↓ vs. $65 industry avg.
[Gap: $14/hr = $2,240/mo]  ← only shown if below avg
[How to improve →]
```

- Gap calculation shown if below P50 benchmark
- Arrow links to benchmark detail

#### Average Total Ticket

```
AVG TOTAL TICKET
$97
$85 service + $12 retail
```

- Always shown as combined (service + retail)
- Breakdown in smaller text

#### Retail Attach Rate

```
RETAIL ATTACH RATE
15%
↓ 7pp below median (22%)
[Improving to 22%: +$4,200/yr]
```

- Shows gap to median in pp and $ impact
- Direct link to retail attach engine

---

### 2.4 Top 3 Opportunities

**Component:** `OpportunityStrip` (new, ~80 lines)

Data source: `leakageEngine.transform(gaps, businessSettings)` — pure client-side, reads from existing plan outputs.

```
YOUR TOP 3 OPPORTUNITIES                   [View all 8 →]

1. 🔴 $14,400/yr  Hot Stone Add-On          Low complexity  [See plan →]
2. 🟠 $9,200/yr   Retail Attach Push         No cost         [See plan →]
3. 🟡 $6,800/yr   Express Facial Tier        Low complexity  [See plan →]
```

- Color codes by urgency: red (high value + low complexity), orange (high value), yellow (medium)
- Annual figure prominent
- "Low complexity / No cost / Medium complexity" badge
- [See plan →] links to the specific gap in PlanResults

**Empty state (no plan yet):**
```
✨ Your top opportunities will appear here after your first analysis.
[Upload your menu to get started →]
```

**Empty state (plan exists but no gaps):**
```
✅ Your menu is comprehensive — no major gaps identified.
[View your full analysis →]
```

---

## Section 3: "Edit Assumptions" Modal

Triggered from the ✏️ button in the Revenue Pulse header.

**Component:** `RevenueAssumptionsModal` (new, ~120 lines)

Fields (6 max — no more):

| Field | Label | Type | Default |
|---|---|---|---|
| Treatment rooms | "How many treatment rooms?" | Number stepper | 1 |
| Services per day | "Avg services per day?" | Number stepper | 6 |
| Avg service price | "Avg service price?" | $ input | $85 |
| Avg service duration | "Avg service length?" | Dropdown (30/45/60/75/90 min) | 60 min |
| Retail attach rate | "Retail attach rate?" | % slider | 15% |
| Avg retail transaction | "Avg retail sale?" | $ input | $45 |

All fields show "(industry default)" if unchanged. Changed fields show "(your data)".

"Save assumptions" → updates `business_settings` table → all metrics recalculate instantly.

"Why are these important?" expander:
```
These inputs power your revenue estimates, utilization calculation, and opportunity ranking.
The more accurate they are, the more useful your recommendations.
You can update them anytime from Settings → Revenue Profile.
```

---

## Section 4: Loading States

### 4.1 KPI Cards Loading
Use `StatCardSkeleton` (already built) for each of the 4 weekly KPI cards.
Show 4 skeleton cards in the `WeeklyKpiRow` while `business_settings` loads.

### 4.2 Opportunities Loading
Show 3 skeleton rows in `OpportunityStrip` with shimmer animation.

### 4.3 First-Visit / No Settings State

If `business_settings` is null (new user, never set up):

```
┌────────────────────────────────────────────────────────────┐
│  📊  SET UP YOUR REVENUE PROFILE                           │
│                                                            │
│  Answer 6 quick questions to unlock:                       │
│  • Weekly revenue estimate                                 │
│  • Idle chair time ($ lost)                                │
│  • Your top 3 revenue opportunities                        │
│                                                            │
│  Takes 2 minutes. Always editable.                        │
│                                                            │
│  [Complete Revenue Profile →]                             │
└────────────────────────────────────────────────────────────┘
```

This appears in place of the 4 KPI cards. It is the highest-priority action on a new dashboard.

### 4.4 No Plan State (Settings exist but no plan)

Show KPI cards with available metrics (utilization, idle time from settings), but opportunities section shows:
```
Upload your menu to unlock personalized revenue opportunities.
[Upload Menu →]
```

---

## Section 5: Error States

### 5.1 Settings Load Failure
Show card with: "Revenue data unavailable" + retry button. Does not crash the page.

### 5.2 Plan Outputs Load Failure
KPI cards still show (from settings). Opportunities section shows:
"Opportunity data temporarily unavailable. [Retry]"

### 5.3 Calculation Error (Edge Case)
If any calculation produces NaN/Infinity (e.g., division by zero from 0 rooms):
- Catch in calculation function
- Show "—" in affected metric card
- Log error to console (not shown to user)
- Trigger re-prompt to complete settings

---

## Section 6: Trust Cues

### 6.1 "How We Calculate This" Expanders

Every metric card has a disclosure expander. Content for each:

**Utilization:**
> "Utilization = (average services per day × service duration) ÷ (rooms × operating hours). Based on your Revenue Profile settings. Update them to improve accuracy."

**Idle $ Lost:**
> "Idle $ = unfilled hours × your revenue per hour. Revenue per hour = your average service price ÷ service duration. This shows you the cost of empty rooms in dollars."

**Revenue/Room Hour:**
> "Revenue per room hour = weekly revenue ÷ total available room-hours. Higher is better. Industry average for day spas is ~$65/hr (ISPA 2024, est.)."

**Retail Attach:**
> "Attach rate = % of service visits that include a retail purchase. Industry average is ~22% for day spas (PBA 2024, est.). Your estimate is based on the rate you entered in your Revenue Profile."

### 6.2 Data Freshness Indicator

Below the header:
```
Based on your Revenue Profile updated [date]. [Update →]
```
If settings were last updated > 90 days ago: amber text: "Settings may be outdated. [Review →]"

### 6.3 ASSUMPTION Labeling

Any metric derived from platform defaults (not user-entered data) shows "est." in light gray. This is not optional.

---

## Section 7: Accessibility

- All KPI cards: `role="region"` + `aria-label` describing the metric
- Color is never the only indicator of status (red/green): always paired with icon + text label
- "Edit Assumptions" modal: focus trap, ESC closes, focus returns to trigger button
- Progress bars: `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- All charts/bars have text fallbacks
- WCAG 2.1 AA compliance required

---

## Section 8: Mobile Considerations

| Desktop | Mobile |
|---|---|
| 4 KPI cards in a row | Horizontal scroll row of chips (swipeable) |
| Monthly metrics in a row | 3 stacked full-width cards |
| Opportunities as a strip | Full-width cards with swipe |
| "Edit Assumptions" modal | Bottom sheet (full-width, slides up) |
| Hover states on cards | Touch-active states |

---

## Section 9: Implementation Notes

### Files Modified
- `src/pages/business/Dashboard.tsx` — add `<RevenuePulseSection>` above existing content

### New Files
- `src/components/business/RevenuePulseSection.tsx` — container
- `src/components/business/WeeklyKpiRow.tsx` — 4 KPI cards
- `src/components/business/MonthlyMetricRow.tsx` — 3 secondary metrics
- `src/components/business/OpportunityStrip.tsx` — top 3 leakage items
- `src/components/business/RevenueAssumptionsModal.tsx` — settings modal
- `src/lib/revenueCalculator.ts` — pure calculation functions (no async)
- `src/lib/leakageEngine.ts` — transforms gap outputs to leakage items

### Data Hooks
- `useBusinessSettings()` — fetches `business_settings` for current user
- `usePlanOutputs(planId)` — reuses existing plan output fetch pattern
- `useLeakageItems(gaps, settings)` — pure transform, no async

### Zero Changes To
- Existing dashboard stat cards (plan count, protocol count, etc.) — preserved below fold
- Onboarding checklist — preserved below fold
- Navigation, layout, routing — unchanged

---

*Last updated: 2026-02-22 | Revenue Intelligence Layer v1.0*
