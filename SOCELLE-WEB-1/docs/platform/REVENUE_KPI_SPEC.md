# REVENUE KPI SPEC

**Platform:** The PRO Edit  
**Module:** Revenue Intelligence Layer  
**Version:** 1.0  
**Last Updated:** 2026-02-22  
**Status:** Specification — Ready for Engineering Review

---

## Overview

### Purpose

This specification defines the complete metric model for The PRO Edit's Revenue Intelligence Layer. The goal is to surface actionable, money-framed insights for beauty operators — spa owners, salon owners, medspa directors, and barbershop operators — who understand their business through dollars earned or dollars left on the table, not through abstract performance percentages.

Every metric in this spec exists to answer one of two questions for the operator:

1. **How much money am I currently losing that I could recover?**
2. **What specific action will generate the most new revenue for the least operational effort?**

### Design Principles

**1. Frame everything as money, never as abstraction.**  
Utilization is not "72%." It is "$312 in idle chair time this week." The percentage is a supporting data point, not the headline. Every metric card that can be converted to a dollar impact must be.

**2. Distinguish estimates from facts, always.**  
The platform operates under conditions where most businesses lack POS or booking software integration. Every calculated or assumed figure must be labeled "est." and must be editable by the operator. Trust is built by transparency, not by presenting estimates as facts.

**3. Benchmarks are reference lines, not goals.**  
Industry benchmarks are shown as context. They are never framed as targets without explicit operator opt-in. An operator running a $300/hour medical-grade treatment business should not be compared against a $55/hour budget facial shop.

**4. Every insight must have a clear next action.**  
A leakage point without a recommended action is noise. Every metric that surfaces a problem must link directly to either an operator input that improves the estimate, a platform feature that addresses the gap, or an educational resource that explains why the gap exists.

**5. The Revenue Intelligence Layer is additive, not a rebuild.**  
This layer is built on top of the existing data model: `spa_services`, `spa_menus`, `canonical_protocols`, `treatment_costs`, `protocol_costing`, `service_category_benchmarks`, `business_plan_outputs`, `plans`, and `orders`. No existing tables are replaced. New tables or JSONB fields are introduced only for net-new data capture.

---

### Data Availability Tiers

| Tier | Name | Description | Requires |
|---|---|---|---|
| Tier 1 | Auto (AI Analysis) | Metrics derivable entirely from existing plan analysis, protocol mappings, and service menu data. No user action needed. | Plan must exist |
| Tier 2 | User Input | Metrics that require the operator to enter basic business parameters: rooms, hours, sessions/week, pricing. Captured in onboarding or a revenue profile modal. | Operator completes revenue profile |
| Tier 3 | POS Integration | Metrics using real appointment and transaction data from a connected booking or POS system. Maximum accuracy. | Active integration |

Tier 1 produces estimates. Tier 2 produces informed estimates. Tier 3 produces actuals. The platform must be fully functional and valuable at Tier 2. Tier 3 is a future enhancement that improves precision, not a prerequisite for value delivery.

---

## Section 1: Capacity and Utilization Metrics

Capacity metrics establish the economic ceiling of the business. Before discussing revenue per service or retail attach, the operator must understand how much of their available production capacity is actually generating revenue. An empty treatment room is a cash loss, not a neutral state.

---

### 1.1 Available Hours

**Definition**  
The total number of productive treatment room hours available in a given period, based on the operator's physical space and operating schedule.

**Formula**

```
available_hours_per_week = treatment_rooms × operating_hours_per_day × operating_days_per_week
```

**Input Source**  
User profile — captured during onboarding or in Settings → Revenue Assumptions. Fields: `treatment_rooms`, `operating_hours_per_day`, `operating_days_per_week`.

**Default Assumption** *(ASSUMPTION — editable)*  
If the operator has not completed their revenue profile:

```
treatment_rooms        = 1
operating_hours_per_day = 8
operating_days_per_week = 5
available_hours_per_week = 1 × 8 × 5 = 40 hours
```

**Display Format**

> `40 hrs available this week`  *(est.)*

Show "est." badge when defaults are in use. Show pencil icon to trigger edit modal. When real inputs are saved, remove "est." badge.

**Data Tier:** Tier 2 (User Input primary). No Tier 1 derivation is possible without operator confirmation of room count and hours.

**Notes**  
- "Available hours" represents room hours, not staff hours. A business with 2 rooms and 1 practitioner still has 80 room hours available — the constraint becomes staffing, not capacity.
- If `staff_count` is provided, display a secondary note: "Staffing constraint: X practitioners limits effective capacity to Y hrs/week."
- Available hours is the denominator for utilization rate and the multiplier for idle time loss calculation.

---

### 1.2 Booked Hours (Estimated)

**Definition**  
The estimated number of treatment room hours that are generating revenue in a given week, derived from session volume and average service duration.

**Formula**

```
booked_hours_per_week = sessions_per_week × avg_service_duration_hours
```

Where:

```
avg_service_duration_hours = avg_service_duration_minutes / 60
sessions_per_week = avg_services_per_day × operating_days_per_week
```

**Input Source**  
- `avg_services_per_day`: user-entered in revenue profile
- `avg_service_duration_minutes`: derived from plan analysis output (mapped services with durations from `canonical_protocols`) OR user-entered default
- If neither source is available, fallback to default assumption

**Default Assumption** *(ASSUMPTION — editable)*  
If no session data or plan data is available:

```
utilization_rate_assumed = 60%
booked_hours_per_week    = available_hours_per_week × 0.60
                         = 40 × 0.60 = 24 hours
```

**Display Format**

> `24 hrs booked (estimated)`  *(est.)*

**Data Tier:** Tier 1 partial (service durations from plan analysis) + Tier 2 (session volume from user input). Tier 3 (real booking data from POS) replaces estimate with actual.

**Notes**  
- The plan analysis in `business_plan_outputs` may contain mapped services with associated protocol durations from `canonical_protocols`. Where available, use the weighted average duration across the operator's service mix rather than a flat default.
- When Tier 3 data is available, this field becomes "Booked Hours (Actual)" and the "est." badge is removed.
- If `sessions_per_week` is user-entered but `avg_service_duration` is still estimated from protocols, display: "Sessions entered by you, duration estimated from your service menu."

---

### 1.3 Utilization Rate

**Definition**  
The proportion of available room hours that are actively generating revenue.

**Formula**

```
utilization_rate = booked_hours / available_hours × 100
```

**Display Format**  
Primary display is the dollar impact (see 1.4). Utilization rate is a supporting data point shown beneath the primary metric.

> `60% utilization`

Color coding rules (non-negotiable):

| Range | Color | Label |
|---|---|---|
| < 50% | Red | Below threshold |
| 50% – 69% | Amber | Improving |
| 70% – 84% | Yellow-Green | On track |
| ≥ 85% | Green | Optimized |

**Industry Benchmark** *(ASSUMPTION — label as such)*  
- Spa / medspa: 65–80% considered healthy utilization
- Salon: 70–85% considered healthy utilization
- Source: Industry association estimates (ISPA, Associated Hair Professionals). Display as grey reference line, not as operator's personal target.

**Data Tier:** Tier 2 (calculated from user inputs). Tier 3 (calculated from real booking data).

**Notes**  
- Never show utilization as the headline metric. It is context for the dollar-loss metric (1.4). The dashboard card should show: large dollar figure first, utilization percentage second.
- "How we calculate this" expander: "We divide your estimated booked hours by your available room hours each week. Available hours are based on the rooms, days, and hours you entered in your Revenue Profile."

---

### 1.4 Idle Time Dollar Loss

**Definition**  
The estimated revenue lost each week due to treatment room capacity that is available but not generating income. This is the single most motivating metric in the Revenue Intelligence Layer and must be the most prominent figure on the dashboard.

**Formula**

```
idle_hours           = available_hours - booked_hours
revenue_per_hour     = avg_service_ticket / avg_service_duration_hours
idle_time_dollar_loss = idle_hours × revenue_per_hour
```

Where `avg_service_ticket` and `avg_service_duration_hours` come from user inputs or plan defaults (see Section 2.1 and 1.2).

**Example Calculation**

```
available_hours       = 40
booked_hours          = 24
idle_hours            = 16
avg_service_ticket    = $85
avg_service_duration  = 1.0 hour
revenue_per_hour      = $85 / 1.0 = $85/hr
idle_time_dollar_loss = 16 × $85 = $1,360 this week
```

**Display Format**

> `$1,360 in idle chair time this week`  *(est.)*

This text is loss-framed and must use red or amber text on the dashboard card. It is never shown in green or neutral grey. The word "lost" or "idle" must appear in the label.

Annual extrapolation (shown as secondary):

```
annual_idle_loss = idle_time_dollar_loss × 52
```

> `$70,720 in idle capacity annually if current pattern holds`  *(est.)*

**Data Tier:** Tier 2 primary. Tier 1 partial (avg_service_duration from protocol data). Tier 3 (actual booking gaps replace estimated idle time).

**Editability**  
All inputs driving this calculation must be editable via pencil icon:
- Treatment rooms
- Operating hours/day
- Operating days/week
- Avg services/day
- Avg service price
- Avg service duration

**Notes**  
- This metric is the emotional anchor of the Revenue Intelligence Layer. The design team must ensure it is the first number an operator sees when they open the Revenue Dashboard.
- "How we calculate this" expander: "We multiply your empty room hours by your average revenue per hour. Your empty room hours are the difference between how many hours your rooms are available and how many hours they're estimated to be booked. All figures are estimates based on the information in your Revenue Profile and service menu."

---

### 1.5 Revenue per Room Hour

**Definition**  
The average revenue generated for every hour that a treatment room is available — whether booked or not. This is the productivity benchmark for the physical space.

**Formula**

```
revenue_per_room_hour = weekly_revenue_estimate / available_room_hours_per_week
```

Where:

```
weekly_revenue_estimate = booked_hours × revenue_per_hour
```

**Alternative formula when only service ticket and session data are available:**

```
revenue_per_room_hour = (sessions_per_week × avg_service_ticket) / available_room_hours
```

**Industry Benchmark** *(ASSUMPTION — label as such)*

| Business Type | Benchmark Range |
|---|---|
| Spa / Medspa | $65 – $95 per room hour |
| Salon / Barbershop | $45 – $75 per room hour |

These benchmarks are derived from industry revenue per square foot estimates and typical room sizing. They are assumptions and must be labeled as such. Operators in high-cost urban markets or medical-grade medspa settings will exceed these ranges.

**Display Format**

> `$51/room hr` *(est.)*  
> `Industry benchmark: $65–$95` (grey reference)

Color the operator's number relative to benchmark:
- Below low end of benchmark range → amber
- Within benchmark range → neutral
- Above benchmark range → green with note "Above benchmark"

**Data Tier:** Tier 2 primary. Tier 3 (actual revenue from POS divided by room hours).

---

## Section 2: Service Economics Metrics

Service economics metrics define the revenue performance of the core service delivery operation — before retail is factored in. These metrics identify whether individual services are priced appropriately, whether the service mix is optimized for revenue, and where pricing or duration changes could meaningfully increase total output.

---

### 2.1 Average Ticket (Service Only)

**Definition**  
The average revenue generated per client visit from service charges only, excluding any retail purchases.

**Input Source**  
- **Preferred:** User enters or confirms average service price in Revenue Profile
- **Derived:** If service prices are captured in the operator's menu upload (`spa_services`, `spa_menus`), calculate weighted average from mapped services with their associated prices
- **Fallback default** *(ASSUMPTION — editable)*:

| Business Type | Default Avg Service Ticket |
|---|---|
| Spa / Medspa | $85 |
| Salon | $55 |
| Barbershop | $35 |

**Formula (when service menu prices are available)**

```
avg_service_ticket = SUM(service_price[i] × booking_weight[i]) / COUNT(services)
```

Where `booking_weight` reflects estimated relative booking frequency from plan analysis. If no frequency data exists, treat all services as equally weighted.

**Display Format**

> `$85 avg service ticket`  *(est.)*

**Data Tier:** Tier 1 partial (derived from menu upload prices). Tier 2 (user confirms or enters). Tier 3 (real average ticket from POS transaction data).

---

### 2.2 Average Ticket (Total: Service Plus Retail)

**Definition**  
The average revenue generated per client visit including both service charges and retail purchases.

**Formula**

```
avg_total_ticket = avg_service_ticket + (retail_attach_rate × avg_retail_transaction_value)
```

Where `retail_attach_rate` is defined in Section 3.1 and `avg_retail_transaction_value` is user-entered or defaulted to $35 *(ASSUMPTION)*.

**Example**

```
avg_service_ticket         = $85
retail_attach_rate         = 0.22 (22%)
avg_retail_transaction     = $35
retail_contribution        = 0.22 × $35 = $7.70
avg_total_ticket           = $85 + $7.70 = $92.70
```

**Display Format**

> `$92.70 total avg ticket`  *(est.)*  
> Breakdown: `$85 service` + `$7.70 retail`

Show breakdown as a stacked bar or segmented figure beneath the headline number.

**Data Tier:** Tier 2 primary. Tier 3 (real transaction averages from POS).

---

### 2.3 Revenue per Service Hour

**Definition**  
The revenue generated per hour of active service delivery time. This is distinct from Revenue per Room Hour (1.5), which divides by total available room hours including idle time.

**Formula**

```
revenue_per_service_hour = avg_service_ticket / avg_service_duration_hours
```

**Example**

```
avg_service_ticket    = $85
avg_service_duration  = 60 minutes = 1.0 hour
revenue_per_hr        = $85 / 1.0 = $85/hr
```

**Display Format**

> `$85/hr service revenue`  *(est.)*

**Use Case**  
This metric is used to detect underperforming services (Section 2.5) and to evaluate whether adding or extending a service will increase or dilute hourly revenue. It is also used to calculate idle time loss (Section 1.4).

**Data Tier:** Tier 2 primary. Tier 1 partial (service duration from protocol data).

---

### 2.4 Service Mix Analysis

**Definition**  
A breakdown of the operator's service categories by their estimated contribution to total weekly service revenue. This answers: "Which services are driving the most money, and which are dragging performance?"

**Data Source**  
Derived from the operator's plan analysis in `business_plan_outputs`. The plan maps the operator's service menu to `canonical_protocols`, which carry duration and category data. Prices come from `spa_services` / `spa_menus` where available, or from the average ticket default if not.

**Formula**

For each service category `c`:

```
category_revenue_share[c] = (sessions_per_week[c] × avg_price[c]) / total_weekly_revenue_estimate × 100
```

Where `sessions_per_week[c]` is estimated from plan analysis frequency signals or assumed to be evenly distributed if no frequency data exists.

**Display Format**  
Horizontal stacked bar chart or sorted bar chart with percentage and dollar value for each category.

Example:

| Service Category | % of Revenue | Est. Weekly Revenue |
|---|---|---|
| Facial Treatments | 45% | $918 |
| Massage / Body | 30% | $612 |
| Waxing / Hair Removal | 15% | $306 |
| Add-on Services | 10% | $204 |

**Badges**  
- "Top Performer" badge on the highest revenue-per-hour category
- "Underperformer" badge on services flagged by the detection logic in Section 2.5
- "Missing Category" badge on canonical high-revenue categories not present in the operator's service menu (from gap analysis in `business_plan_outputs`)

**Data Tier:** Tier 1 (from plan analysis and menu data). Tier 2 enhances with user-confirmed pricing. Tier 3 replaces with real booking frequency data.

---

### 2.5 Underperformer Detection

**Definition**  
Automated identification of services in the operator's menu that are generating meaningfully below-average revenue per hour compared to the business average. These are services that are either underpriced, running too long for their price point, or both.

**Detection Logic**

```
location_avg_revenue_per_hour = total_weekly_service_revenue / total_booked_hours

FOR each service s:
    service_revenue_per_hour[s] = service_price[s] / service_duration_hours[s]
    IF service_revenue_per_hour[s] < location_avg_revenue_per_hour × 0.70:
        flag_as_underperformer(s)
```

The threshold is 70% of the location average. This threshold is intentionally conservative to avoid over-flagging. It surfaces services that are structurally dragging performance, not simply lower-margin offerings that serve a strategic purpose.

**Additional Flag Conditions**  
A service is also flagged as an underperformer if:
- Its estimated booking frequency is less than 10% of the most-booked service (low demand signal)
- Its price is more than 20% below the `service_category_benchmarks` reference price for that category *(ASSUMPTION — labeled)*

**Display Format**

> `3 services are underperforming — here's why`

Clicking the banner expands a list:

| Service | Your Price | Your Revenue/Hr | Location Avg Revenue/Hr | Issue |
|---|---|---|---|---|
| Basic Facial | $65 | $65/hr | $85/hr | Underpriced vs. your menu average |
| Deep Tissue Massage (90 min) | $110 | $73/hr | $85/hr | Long duration vs. price |
| Eyebrow Wax | $18 | $54/hr | $85/hr | Low price, short duration — consider bundling |

Each row links to: "See pricing guidance" (from `service_category_benchmarks`) or "See upsell opportunity."

**Data Tier:** Tier 1 partial (protocol durations and category benchmarks) + Tier 2 (operator-confirmed pricing).

---

## Section 3: Retail Economics Metrics

Retail is the highest-margin revenue stream available to beauty operators and the most consistently underleveraged. Professional retail products carry operator margins of 40–55%, compared to 20–40% on services after labor and room costs. The Revenue Intelligence Layer must make the retail opportunity visible in dollar terms, not as an aspirational percentage.

---

### 3.1 Retail Attach Rate

**Definition**  
The percentage of service appointments that result in at least one retail product sale. This is the primary lever for retail revenue improvement.

**Industry Benchmark** *(ASSUMPTION — label as such)*

| Business Type | Average Attach Rate | High-Performer Attach Rate |
|---|---|---|
| Spa / Medspa | 15–25% | 30–40% |
| Salon | 20–35% | 40–55% |
| Barbershop | 10–20% | 25–35% |

Source: Professional Beauty Association industry estimates. These are assumptions and must be labeled clearly.

**Input Source**  
User-entered in Revenue Profile. If not entered, default to 15% *(ASSUMPTION)* with "est." badge.

**Display Format**

> `15% retail attach`  *(est.)*  
> `Industry average: 22%`  (grey reference)

The gap between operator's attach rate and industry average must be visible. Show the dollar value of that gap (see Section 3.5).

**Data Tier:** Tier 2 primary (user-entered). Tier 3 (real attach rate from POS transaction data matched to appointments).

---

### 3.2 Retail Revenue per Service

**Definition**  
The average retail revenue generated per service appointment across all clients, including clients who do not purchase retail. This is an absolute dollar figure, not a conditional average.

**Formula**

```
retail_revenue_per_service = avg_retail_transaction_value × retail_attach_rate
```

**Example**

```
avg_retail_transaction_value = $35
retail_attach_rate           = 0.15
retail_revenue_per_service   = $35 × 0.15 = $5.25
```

**Display Format**

> `$5.25 retail per service`  *(est.)*

Show in context of what it could be at benchmark attach rate:

> `At 22% attach: $7.70 per service` *(+$2.45/service)*

**Data Tier:** Tier 2 primary.

---

### 3.3 Retail Contribution to Total Revenue

**Definition**  
The share of total estimated revenue (service + retail) that comes from retail product sales.

**Formula**

```
total_weekly_retail_revenue   = sessions_per_week × retail_revenue_per_service
total_weekly_service_revenue  = sessions_per_week × avg_service_ticket
total_weekly_revenue          = total_weekly_service_revenue + total_weekly_retail_revenue
retail_contribution_pct       = total_weekly_retail_revenue / total_weekly_revenue × 100
```

**Industry Benchmark** *(ASSUMPTION — label as such)*

| Business Type | Typical Range | High-Performer Range |
|---|---|---|
| Spa | 10–18% | 18–28% |
| Medspa | 8–15% | 15–25% |
| Salon | 12–20% | 20–30% |

**Display Format**

> `8% of revenue is retail`  *(est.)*  
> `High-performing spas: 18–28%`  (grey reference)

**Data Tier:** Tier 2 primary. Tier 3 (real revenue split from POS).

---

### 3.4 Estimated Retail Gross Margin

**Definition**  
The estimated gross profit from retail sales after deducting the wholesale cost of goods sold.

**Formula**

```
estimated_retail_margin = total_retail_revenue × (1 - wholesale_cost_pct)
```

**Default Cost of Goods Assumption** *(ASSUMPTION — editable)*

```
wholesale_cost_pct = 50% of MSRP (retail selling price)
```

This is the standard professional retail wholesale cost structure for brands distributed through salon/spa channels (e.g., Dermalogica, Eminence, Aveda). Operators who have negotiated better terms or carry different brands must be able to edit this.

**Example**

```
total_weekly_retail_revenue = $157.50
wholesale_cost_pct          = 0.50
weekly_retail_gross_margin  = $157.50 × 0.50 = $78.75
monthly_retail_gross_margin = $78.75 × 4.33 = $341
```

**Display Format**

> `$341 gross retail margin this month`  *(est.)*

**Data Tier:** Tier 2 primary. Operator can adjust wholesale cost percentage in Revenue Assumptions if they know their actual COGS.

---

### 3.5 Retail Upside

**Definition**  
The estimated incremental annual revenue available if the operator improved their retail attach rate from their current level to the industry average for their business type.

**Formula**

```
retail_upside_annual = (benchmark_attach_rate - current_attach_rate) 
                       × sessions_per_week 
                       × avg_retail_transaction_value 
                       × 52
```

**Example**

```
benchmark_attach_rate     = 0.22
current_attach_rate       = 0.15
attach_rate_gap           = 0.07
sessions_per_week         = 30
avg_retail_transaction    = $35
annual_retail_upside      = 0.07 × 30 × $35 × 52 = $3,822/year
```

**Display Format**

> `If you matched the industry average attach rate: +$3,822/year`  *(est.)*

This is an "Upside Play" (see Section 4.2) and must also appear in the Opportunity Engine.

**Data Tier:** Tier 2 primary.

---

## Section 4: Opportunity Engine (Derived Metrics)

The Opportunity Engine synthesizes all capacity, service, and retail metrics into a ranked, actionable priority list. It answers the operator's most important question: "Of everything I could work on, what will make me the most money?"

The Opportunity Engine surfaces two lists: the five highest revenue **leakage points** (money currently being lost) and the five highest-ROI **upside plays** (actions that would generate new revenue). Together these form the core of the Revenue Dashboard.

---

### 4.1 Top 5 Revenue Leakage Points

**Definition**  
The five specific revenue loss mechanisms with the highest estimated annual dollar impact on this business, ranked in descending order of estimated loss.

**Leakage Point Definitions and Calculation Logic**

**Leakage 1: Idle Capacity**

```
annual_idle_loss = (available_hours_per_week - booked_hours_per_week) 
                   × revenue_per_hour 
                   × 52
```

Label: "Empty room time"  
Description: "Your treatment rooms are available but not generating revenue for an estimated X hours per week."

**Leakage 2: Below-Market Pricing**

For each service where `service_price < service_category_benchmark_price × 0.90`:

```
annual_pricing_gap = (benchmark_price - current_price) 
                     × estimated_sessions_per_year_for_service
```

Aggregate across all underpriced services.

Label: "Underpriced services"  
Description: "X services in your menu are priced below the market range for their category."

Data source: `service_category_benchmarks` table. Flag only where operator price is confirmed, not defaulted.

**Leakage 3: Missing Service Categories**

From `business_plan_outputs` gap analysis: identify canonical service categories that the operator does not offer, with estimated annual revenue potential.

```
missing_category_annual_loss = avg_sessions_per_week_for_category 
                                × avg_price_for_category 
                                × 52
```

Where `avg_sessions_per_week_for_category` is estimated from benchmark data for the operator's business type and market segment *(ASSUMPTION)*.

Label: "Missing service categories"  
Description: "Your menu is missing X high-revenue service categories that businesses like yours typically offer."

**Leakage 4: Low Retail Attach**

```
retail_attach_gap_annual = (benchmark_attach_rate - current_attach_rate) 
                            × sessions_per_week 
                            × avg_retail_transaction 
                            × 52
```

This is identical to the Retail Upside calculation (Section 3.5) reframed as a loss.

Label: "Retail attach below benchmark"  
Description: "You're leaving an estimated $X/year in retail revenue on the table compared to similar businesses."

**Leakage 5: Duration Inefficiency (Upsell Gap)**

For services where `service_duration < canonical_protocol_duration × 0.85`:

```
duration_gap_annual = sessions_per_year × avg_upsell_value_per_additional_15min
```

Where `avg_upsell_value_per_additional_15min` is estimated as `revenue_per_service_hour × 0.25` *(ASSUMPTION — 15 minutes of additional service time)*.

Label: "Short service durations — upsell gap"  
Description: "X services are running shorter than protocol standard. Clients may be leaving before full-value delivery, and upsell opportunities are being missed."

Data source: `canonical_protocols` for standard durations vs. operator's service menu durations.

**Ranking Logic**

```
rank leakage points BY estimated_annual_dollar_loss DESC
display top 5
```

If fewer than 5 leakage points are detectable from available data, display only those that can be calculated with reasonable confidence. Do not fabricate a leakage point that cannot be substantiated.

**Display Format**  
Ranked card list on Revenue Dashboard. Each card:

```
[Rank #] [Leakage Label]
$XX,XXX / year  (est.)
[One-sentence description]
[→ See how to close this gap]
```

Dollar amounts in amber or red. Rank 1 is the most prominent.

---

### 4.2 Top 5 Revenue Upside Plays

**Definition**  
The five specific actions with the highest estimated return, ranked by estimated annual revenue impact, weighted by operational complexity. Each play is a concrete recommendation, not a general suggestion.

**Upside Play Definitions**

**Play 1: Add the Highest-Revenue-Gap Service**

Source: `business_plan_outputs` gap analysis. The service category with the largest estimated annual revenue potential that the operator does not currently offer.

```
annual_revenue_potential = avg_sessions_per_week_for_category 
                            × avg_price_for_category 
                            × 52
```

Operational Complexity: Medium to High (requires training, inventory, or equipment depending on service type)  
Time to Implement: 30–90 days

Display:

> "Add [Service Category]: estimated +$X,XXX/year"

**Play 2: Raise Prices on Underpriced Services**

Source: Underperformer Detection (Section 2.5) + `service_category_benchmarks`.

```
annual_pricing_upside = SUM over underpriced services of:
    (benchmark_price - current_price) × sessions_per_year_for_service
```

Operational Complexity: Low  
Time to Implement: 1–7 days (update menu and pricing)

Display:

> "Raise prices on X services to market rate: estimated +$X,XXX/year"

Link to Pricing Simulator (future feature) where operator can model price increase scenarios.

**Play 3: Improve Retail Attach to Industry Average**

Source: Retail Upside calculation (Section 3.5).

```
annual_upside = retail_attach_gap_annual (from Section 3.5)
```

Operational Complexity: Low to Medium (requires staff training and product placement, not capital investment)  
Time to Implement: 14–30 days

Display:

> "Close your retail attach gap: estimated +$X,XXX/year"

**Play 4: Add a Retail Bundle to Your Top Service**

Definition: Pair the operator's highest-revenue service with a curated product bundle at a slight discount to standard retail price. This increases average transaction value and introduces clients to home care products.

```
bundle_upside_annual = (bundle_price - standard_retail_price_differential) 
                        × sessions_per_week × estimated_bundle_attach_rate × 52
```

Where `estimated_bundle_attach_rate` defaults to 30% *(ASSUMPTION)* — the estimated proportion of clients who will add a bundle when presented at checkout.

Operational Complexity: Low  
Time to Implement: 7–14 days

Display:

> "Create a product bundle for your [Top Service]: estimated +$X,XXX/year"

**Play 5: Fill Idle Capacity with Express Services**

Definition: Use the operator's highest idle time windows (e.g., weekday mornings) to offer shorter, lower-price-point express services that can fill gaps without displacing full-priced appointments.

```
express_service_revenue = idle_hours_per_week × express_service_price_per_hour × 52
```

Where `express_service_price_per_hour` is estimated at 70% of the operator's standard `revenue_per_service_hour` *(ASSUMPTION — express services trade some per-hour yield for volume)*.

Operational Complexity: Medium (requires menu addition and marketing)  
Time to Implement: 14–30 days

Display:

> "Add express services to fill idle capacity: estimated +$X,XXX/year"

**Ranking Logic**

```
adjusted_score = estimated_annual_$ / complexity_multiplier

complexity_multiplier:
    Low    = 1.0
    Medium = 1.5
    High   = 2.5

rank upside plays BY adjusted_score DESC
display top 5
```

The complexity multiplier ensures that a Low-complexity play generating $3,000/year ranks above a High-complexity play generating $4,000/year, reflecting the reality that most operators will not execute high-complexity recommendations.

**Display Format**  
Each upside play card:

```
[Play Label]
+$XX,XXX / year  (est.)
[One-sentence description]
Complexity: [Low / Medium / High]   Time to implement: [X days]
[→ Start this play]
```

Dollar amounts in green. Complexity badge color: Low = green, Medium = amber, High = red.

---

## Section 5: Minimum Viable Input Capture

Most operators of independent beauty businesses do not use appointment booking software or POS systems with accessible API integrations. The platform must deliver meaningful Revenue Intelligence without requiring any third-party data connection. The following input model defines the minimum data needed to unlock the full Revenue Intelligence Layer, and the rules for capturing it.

---

### 5.1 Required Inputs

These fields are required to generate any Revenue Intelligence output. Without them, the dashboard can only show placeholder cards with "Complete your revenue profile to see your numbers."

| Field | Input Type | Default (Assumption) | Why It Is Needed |
|---|---|---|---|
| Treatment rooms | Integer | 1 | Capacity denominator for all utilization calculations |
| Operating days per week | Integer (1–7) | 5 | Available hours per week |
| Operating hours per day | Decimal (0.5 increments) | 8 | Available hours per week |
| Avg services per day | Integer | 6 | Session volume estimate for utilization and revenue |
| Avg service price | Dollar | $85 spa / $55 salon / $35 barber | Revenue per session calculation |
| Avg service duration | Minutes (15 increments) | 60 | Revenue per hour calculation |

When all 6 fields are present, the system can calculate:
- Available hours (1.1)
- Booked hours estimate (1.2)
- Utilization rate (1.3)
- Idle time dollar loss (1.4)
- Revenue per room hour (1.5)
- Average ticket (2.1)
- Revenue per service hour (2.3)
- All retail metrics (Section 3)
- All opportunity engine outputs (Section 4)

---

### 5.2 Optional Inputs

These fields are not required but materially improve the accuracy of specific metrics. The platform should prompt for these after the required inputs are complete.

| Field | Input Type | Default (Assumption) | What It Improves |
|---|---|---|---|
| Retail sales per week | Dollar | $0 | Retail attach rate, retail contribution metrics |
| Current retail attach rate | Percentage | 15% | All retail metrics, retail upside calculation |
| Top 3 services and their prices | Text / Dollar | From menu upload if available | Service mix analysis, underperformer detection |
| Staff count (practitioners) | Integer | 1 | Staffing constraint warning on capacity metrics |
| Average retail transaction value | Dollar | $35 | Retail revenue per service, retail upside |
| Wholesale cost percentage | Percentage | 50% | Retail gross margin calculation |

---

### 5.3 Input Capture UI Specification

**When Shown**  
The revenue profile input flow is triggered on the first visit to the Revenue Dashboard if required inputs are missing. It is also shown when any metric card displays a "Complete your profile to see this number" placeholder.

**Entry Point**  
Inline banner at the top of the Revenue Dashboard:

> "Your revenue numbers are ready to calculate — just 2 minutes to set up your Revenue Profile."  
> `[Complete Profile →]`

Banner dismissal is not permitted. It persists until the profile is complete or the operator explicitly chooses "Skip for now" (which sets a 7-day dismissal timer and reduces profile completion nudging).

**Modal Format**  
A single-screen modal with 6 fields (the required inputs from Section 5.1). Fields should be:
- Pre-filled with defaults where applicable (show defaults as placeholder text, not as entered values, so the operator actively confirms rather than passively accepting)
- Grouped logically: Capacity section (rooms, days, hours), Volume section (services/day), Pricing section (avg price, avg duration)
- Labeled with a brief tooltip explaining why each field matters ("This helps us calculate how much revenue your empty room time represents")

**Persistence**  
Required inputs are saved to `user_profiles.business_metadata` (JSONB field) using the following schema:

```json
{
  "revenue_profile": {
    "treatment_rooms": 2,
    "operating_days_per_week": 5,
    "operating_hours_per_day": 8,
    "avg_services_per_day": 10,
    "avg_service_price_cents": 8500,
    "avg_service_duration_minutes": 60,
    "retail_sales_per_week_cents": 15000,
    "retail_attach_rate_pct": 22,
    "avg_retail_transaction_cents": 3500,
    "wholesale_cost_pct": 50,
    "staff_count": 2,
    "profile_completed_at": "2026-02-22T14:30:00Z",
    "profile_version": 1
  }
}
```

If the `user_profiles` table does not have a `business_metadata` JSONB column, create a new `business_settings` table with `user_id`, `setting_key`, `setting_value` (JSONB), `updated_at`.

**Editability**  
All revenue profile fields are always editable at: **Settings → Revenue Assumptions**. When a field is edited, all dependent metrics are recalculated immediately on the next dashboard load (or in real-time if the settings page includes a live preview). An audit log of changes is maintained in `business_metadata` for support and debugging purposes.

**Versioning**  
Each time the revenue profile is saved, increment `profile_version`. Store previous versions in a `business_settings_history` table or as a versioned JSONB array if the history requirement is lightweight. This enables "before / after" comparisons when operators change assumptions.

---

## Section 6: Data Availability Matrix

This matrix defines, for each KPI, which data tier produces the output and what quality level that represents.

| KPI | Tier 1 (Auto from AI Analysis) | Tier 2 (User Input Primary) | Tier 3 (POS / Booking System) |
|---|---|---|---|
| Idle Dollar Loss | Partial (duration from protocols, no session volume) | Primary — unlocked by revenue profile | Actual (real gap data from booking system) |
| Utilization Rate | Estimate only (no session data) | Primary — sessions/day input enables calculation | Actual (real bookings vs. capacity) |
| Avg Service Ticket | Derived from menu upload prices if present | Primary — user confirms or enters pricing | Actual (real transaction averages) |
| Revenue per Room Hour | Calculated from Tier 2 data | Primary | Actual |
| Retail Attach Rate | Not available without transaction data | Primary — user-entered | Actual (POS transaction matching) |
| Retail Revenue per Service | Not available without Tier 2 | Primary | Actual |
| Retail Contribution % | Not available without Tier 2 | Primary | Actual |
| Retail Gross Margin | Not available without Tier 2 | Primary (with wholesale cost assumption) | Actual (with real COGS) |
| Retail Upside | Not available without Tier 2 | Primary | Actual |
| Service Mix Analysis | Partial (categories and durations from plan analysis, no prices) | Primary (with confirmed pricing) | Actual (real revenue by service) |
| Underperformer Detection | Partial (duration vs. benchmark, no price confirmation) | Primary (with confirmed service prices) | Actual |
| Leakage: Idle Capacity | Partial | Primary | Actual |
| Leakage: Below-Market Pricing | Partial (benchmark comparison available) | Primary (requires price confirmation) | Actual |
| Leakage: Missing Categories | Full (from gap analysis in business_plan_outputs) | Enhanced by pricing inputs | Actual |
| Leakage: Low Retail Attach | Not available without Tier 2 | Primary | Actual |
| Leakage: Duration Inefficiency | Partial (protocol durations available) | Enhanced by confirmed durations | Actual |
| Upside: Add Missing Service | Full (from gap analysis) | Enhanced | Actual |
| Upside: Raise Prices | Partial (benchmark available) | Primary | Actual |
| Upside: Improve Retail Attach | Not available without Tier 2 | Primary | Actual |
| Upside: Retail Bundle | Not available without Tier 2 | Primary | Actual |
| Upside: Fill Idle Capacity | Not available without Tier 2 | Primary | Actual |

**Summary Interpretation**

- **Tier 1 only (no revenue profile):** The platform can show gap analysis leakage (missing categories) and partial service mix from plan data. All financial figures are unavailable or clearly marked as uncalculable. Dashboard shows teaser state with "unlock" prompt.
- **Tier 1 + Tier 2 (revenue profile complete):** Full Revenue Intelligence Layer is operational. All 20+ KPIs are calculable. All figures are estimates labeled "est." with editability.
- **Tier 1 + Tier 2 + Tier 3 (POS connected):** All figures are actuals. "est." labels are replaced with real data timestamps. Trends over time become calculable.

---

## Section 7: Metric Display Rules

These rules are non-negotiable and apply to every metric card, chart, and figure in the Revenue Intelligence Layer. They encode the trust and transparency principles from the Overview.

---

**Rule 1: Estimated figures must always show the "est." label**

Any metric derived from assumed or user-entered inputs (as opposed to real transaction data) must display the text "est." immediately adjacent to the value. The label must be visually distinct but not alarming — use a small, light-grey superscript or inline badge. Never omit this label to make the UI look cleaner.

> Correct: `$1,360 est.`  
> Incorrect: `$1,360`  (when based on estimates)

---

**Rule 2: Every assumption must be editable inline**

Every metric card that contains an estimated or assumed figure must include a pencil icon (edit icon) that opens a modal allowing the operator to change the underlying assumption. The modal must:
- Show the current value
- Show what the value is being used for
- Show what the metric will recalculate to if the value is changed (live preview)
- Save and immediately recalculate on submit

This applies to: room count, hours, session volume, average ticket, average duration, attach rate, retail transaction value, wholesale cost percentage, and any benchmark reference shown alongside a metric.

---

**Rule 3: Dollar figures for losses are shown in red or amber, never in green**

Any figure representing money the operator is losing, leaving on the table, or performing below benchmark on must be displayed in red (severe) or amber (moderate). The specific threshold for red vs. amber is:

- **Red:** The loss represents more than 20% of estimated weekly revenue
- **Amber:** The loss represents 5–20% of estimated weekly revenue
- **Neutral grey:** Loss represents less than 5% of estimated weekly revenue (informational, not urgent)

---

**Rule 4: Dollar figures for gains are shown in green**

Upside plays, retail margin, and revenue improvement opportunities are shown in green. This creates an unambiguous visual language: red/amber = losing money, green = making or gaining money.

---

**Rule 5: Industry benchmarks are shown as grey reference lines, never as the operator's goal**

Benchmark data from `service_category_benchmarks` or industry estimates must be displayed as:
- A light grey reference line or secondary label beneath the operator's figure
- Labeled explicitly as "Industry benchmark" or "Industry average"
- Never framed as "Your goal" or "Target" without the operator having explicitly set that benchmark as their goal

Operators in premium or niche markets may legitimately and correctly exceed benchmarks. Operators in low-cost markets may not reach benchmarks and should not be made to feel they are failing for serving their actual market position.

---

**Rule 6: Every metric card must include a "How we calculate this" expander**

Each metric card includes a collapsible section labeled "How we calculate this" (or a small info icon that opens a tooltip/popover). The explanation must:
- Be 2–4 sentences maximum
- State what inputs drive the calculation
- State clearly which inputs are user-entered vs. assumed
- Include a link to "Edit your Revenue Profile" if any assumption is involved

Example for Idle Dollar Loss:

> "We multiply your empty room hours by your average revenue per hour. Empty room hours are calculated from your available capacity (rooms × hours × days) minus your estimated booked hours (services per day × duration). Your average revenue per hour is your average service price divided by your average service duration. All figures are estimates based on your Revenue Profile."

---

**Rule 7: Never show a partial calculation as complete**

If a required input is missing and a metric cannot be calculated, the card must show a clear placeholder state: "Complete your Revenue Profile to see this number" with a direct link to the input modal. Never show $0, 0%, or a zero value that could be misread as an actual zero result.

---

## Section 8: Instrumentation Events

The following analytics events must be implemented to track operator engagement with the Revenue Intelligence Layer. These events enable the product team to understand which metrics operators find most useful, which inputs create friction, and which opportunity signals lead to action.

**Implementation Note:** In the absence of a dedicated analytics platform (e.g., Segment, Amplitude, Mixpanel), implement via a custom `analytics_events` table with columns: `event_name`, `user_id`, `business_id`, `properties` (JSONB), `created_at`. The schema is forward-compatible with any event-based analytics platform.

---

| Event Name | Trigger | Required Properties |
|---|---|---|
| `kpi_dashboard_viewed` | Revenue Dashboard component mounts | `business_id`, `user_id`, `data_tier` (1/2/3), `has_revenue_profile` (boolean), `profile_completion_pct` |
| `kpi_input_completed` | Operator saves Revenue Profile (all required fields) | `business_id`, `user_id`, `fields_filled` (array of field names), `business_type`, `time_to_complete_seconds` |
| `kpi_input_partial_saved` | Operator saves Revenue Profile with some required fields | `business_id`, `fields_filled`, `fields_missing` |
| `leakage_point_clicked` | Operator clicks a leakage item in Top 5 list | `business_id`, `leakage_type` (idle_capacity / below_market_price / missing_category / low_retail_attach / duration_inefficiency), `leakage_rank` (1–5), `estimated_annual_dollars` |
| `upside_play_clicked` | Operator clicks an upside play card | `business_id`, `play_type` (add_service / raise_prices / retail_attach / retail_bundle / fill_idle), `play_rank` (1–5), `estimated_annual_dollars`, `complexity` (low/medium/high) |
| `assumption_edited` | Operator changes a default value via pencil icon | `business_id`, `field_name`, `old_value`, `new_value`, `metric_context` (which card triggered the edit) |
| `benchmark_viewed` | Operator opens benchmark comparison or info tooltip | `business_id`, `kpi_name`, `operator_value`, `benchmark_value`, `percentile_vs_benchmark` |
| `metric_expander_opened` | Operator opens "How we calculate this" on a metric card | `business_id`, `metric_name` |
| `revenue_profile_dismissed` | Operator clicks "Skip for now" on profile completion banner | `business_id`, `fields_filled_at_dismissal`, `days_since_first_prompt` |
| `revenue_profile_prompted` | Revenue profile completion banner is shown | `business_id`, `trigger_context` (first_visit / metric_placeholder_click / settings_visit) |

---

**Event Implementation Guidance**

Each event must be fired with a consistent `business_id` and `user_id` so that events can be attributed at the business level (for cohort analysis) and the user level (for individual engagement tracking). In multi-user businesses (e.g., owner + manager both using the platform), user-level attribution is important for understanding who is engaging with the Revenue Intelligence Layer.

The `estimated_annual_dollars` property on leakage and upside events must capture the value shown to the operator at the time of the click, not a recalculated value. This ensures that event analysis reflects what the operator was responding to.

For `assumption_edited` events, store both `old_value` and `new_value` as strings with units implied by field name (e.g., `"old_value": "85"` for avg_service_price in dollars, `"new_value": "95"`). Do not store raw cent values in event properties — use the display-unit value for human-readability in analytics dashboards.

---

## Appendix A: Default Assumption Reference Table

This table consolidates all platform-level assumptions used when operator-specific data is unavailable. All assumptions must be editable by the operator.

| Assumption | Default Value | Source / Rationale | Editable Via |
|---|---|---|---|
| Treatment rooms | 1 | Conservative minimum | Revenue Profile |
| Operating days/week | 5 | Standard work week | Revenue Profile |
| Operating hours/day | 8 | Standard business day | Revenue Profile |
| Avg services/day | 6 | Moderate utilization baseline | Revenue Profile |
| Avg service price — Spa | $85 | ISPA industry estimates | Revenue Profile |
| Avg service price — Salon | $55 | PBA industry estimates | Revenue Profile |
| Avg service price — Barbershop | $35 | Industry association estimates | Revenue Profile |
| Avg service duration | 60 min | Most common facial / massage increment | Revenue Profile |
| Utilization rate (when no session data) | 60% | Conservative mid-range | Revenue Profile |
| Retail attach rate | 15% | Below industry average — conservative | Revenue Profile |
| Avg retail transaction value | $35 | Standard professional skincare unit | Revenue Profile |
| Wholesale cost (COGS) percentage | 50% of MSRP | Standard professional distribution margin | Revenue Profile |
| Utilization benchmark — Spa | 65–80% | ISPA estimates | Read-only (benchmark) |
| Utilization benchmark — Salon | 70–85% | PBA estimates | Read-only (benchmark) |
| Revenue/room hr benchmark — Spa | $65–$95 | Industry revenue per sq ft estimates | Read-only (benchmark) |
| Revenue/room hr benchmark — Salon | $45–$75 | Industry revenue per sq ft estimates | Read-only (benchmark) |
| Retail attach benchmark — Spa | 15–25% avg, 30–40% high | PBA / ISPA estimates | Read-only (benchmark) |
| Retail attach benchmark — Salon | 20–35% avg, 40–55% high | PBA estimates | Read-only (benchmark) |
| Retail contribution — High-performer | 18–28% | Professional Beauty Association | Read-only (benchmark) |
| Express service hourly rate discount | 70% of standard rate | Conservative estimate for shorter services | Settings → Revenue Assumptions |
| Bundle attach rate | 30% | Estimated when no data available | Settings → Revenue Assumptions |

---

## Appendix B: Existing Table Integration Reference

The Revenue Intelligence Layer reads from but does not modify the following existing tables:

| Table | How It Is Used |
|---|---|
| `spa_services` | Service names, prices (where captured), durations for service mix analysis |
| `spa_menus` | Operator's current service menu for gap analysis baseline |
| `canonical_protocols` | Standard protocol names, durations, and categories for duration benchmarking and gap identification |
| `treatment_costs` | Cost of service delivery for margin calculations where available |
| `protocol_costing` | Protocol-level cost structures for service margin estimates |
| `service_category_benchmarks` | Industry pricing benchmarks for below-market pricing detection and benchmark reference lines |
| `business_plan_outputs` | Gap analysis results (missing categories, identified revenue opportunities), retail attach analysis |
| `plans` | Operator's active plan context — which services have been analyzed |
| `orders` | Order history for operators who have transacted within the platform |

New data written by the Revenue Intelligence Layer goes to:
- `user_profiles.business_metadata` (JSONB) — Revenue Profile inputs
- `business_settings` (new table, if JSONB field is insufficient) — Revenue assumptions with versioning
- `analytics_events` (new table) — Instrumentation event log

