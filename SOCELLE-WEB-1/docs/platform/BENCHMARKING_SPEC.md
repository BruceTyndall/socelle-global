# BENCHMARKING SPEC
**The PRO Edit — Revenue Intelligence Layer**
*Version 1.0 | February 2026 | B2C Beauty Revenue Operating System*

---

## Overview

Benchmarking answers the question every beauty operator has but rarely asks out loud: *"Am I doing well compared to other businesses like mine?"*

**Design philosophy:**
- Show percentile position, not raw competitor data — ever.
- Frame benchmarks as motivation, not shame. "You're in the top 30%" is a win. "You're in the bottom 30%" is an opportunity with a CTA.
- Never reveal how many businesses are in the comparison pool if it's fewer than 5 (anonymization floor).
- Labels all industry-sourced figures as ASSUMPTION until real platform data reaches statistical significance.

**Privacy architecture:** Benchmarks are computed as anonymized aggregates. No business can identify another business from benchmark data. This is enforced at the query layer, not just the UI.

---

## Section 1: Benchmark Dimensions

Four primary dimensions. All four must be present for a benchmark to be shown.

| Dimension | Metric | Unit | Display |
|---|---|---|---|
| Utilization | Booked hours / available hours | % | Percentile band |
| Average Ticket | Service revenue per visit | $ | Percentile band |
| Retail Attach | % visits with retail purchase | % | Percentile band |
| Revenue / Room Hour | Revenue ÷ room-hours available | $/hr | Percentile band |

---

## Section 2: Peer Group Definition ("Businesses Like Yours")

A peer group is the comparison population. It must be defined precisely to be meaningful.

### 2.1 Peer Group Matching Criteria (in priority order)

1. **Business type** — spa / salon / medspa / barbershop (exact match required)
2. **Service categories** — must share ≥ 2 service categories in common (from plan's mapped services)
3. **Size tier** — rooms count:
   - Small: 1–2 rooms
   - Medium: 3–5 rooms
   - Large: 6+ rooms
4. **Geographic region** — US region (NE / SE / MW / SW / W) — ASSUMPTION: postal code from business profile
5. **Price tier** (optional, enhances match):
   - Budget: avg ticket < $60
   - Mid-market: avg ticket $60–$120
   - Premium: avg ticket > $120

### 2.2 Minimum Population Rule

A benchmark is only shown if the peer group contains **≥ 5 businesses**.

If fewer than 5 match all criteria, progressively loosen:
1. Drop geographic region → n ≥ 5? Show with "National average" label.
2. Drop price tier if was applied
3. Drop size tier → n ≥ 5? Show with "All [business_type] businesses" label.
4. If still < 5: do NOT show benchmark. Show: "Not enough data yet for your business type. Check back as more [spa/salon] owners join."

**V1 data source:** Until platform has ≥ 50 businesses with complete data, use industry-reported figures with clear ASSUMPTION labeling. Source: Professional Beauty Association, ISPA Industry Report (cite year). These are static defaults in code, not from DB.

### 2.3 Static Industry Benchmarks (V1 defaults)

All labeled ASSUMPTION. Update when platform data is sufficient.

**Day Spa:**
| Metric | P25 | P50 | P75 | Source |
|---|---|---|---|---|
| Utilization | 52% | 67% | 78% | ISPA 2024 ASSUMPTION |
| Avg Ticket | $68 | $89 | $115 | ISPA 2024 ASSUMPTION |
| Retail Attach | 12% | 22% | 34% | PBA 2024 ASSUMPTION |
| Revenue/Room Hr | $48 | $65 | $86 | ISPA 2024 ASSUMPTION |

**MedSpa:**
| Metric | P25 | P50 | P75 | Source |
|---|---|---|---|---|
| Utilization | 58% | 72% | 85% | AMPA 2024 ASSUMPTION |
| Avg Ticket | $185 | $265 | $380 | AMPA 2024 ASSUMPTION |
| Retail Attach | 28% | 42% | 58% | AMPA 2024 ASSUMPTION |
| Revenue/Room Hr | $85 | $120 | $175 | AMPA 2024 ASSUMPTION |

**Salon (Hair):**
| Metric | P25 | P50 | P75 | Source |
|---|---|---|---|---|
| Utilization | 55% | 70% | 82% | PBA 2024 ASSUMPTION |
| Avg Ticket | $45 | $68 | $95 | PBA 2024 ASSUMPTION |
| Retail Attach | 15% | 28% | 42% | PBA 2024 ASSUMPTION |
| Revenue/Room Hr | $38 | $55 | $72 | PBA 2024 ASSUMPTION |

**Barbershop:**
| Metric | P25 | P50 | P75 | Source |
|---|---|---|---|---|
| Utilization | 60% | 75% | 88% | NHCA 2024 ASSUMPTION |
| Avg Ticket | $32 | $48 | $68 | NHCA 2024 ASSUMPTION |
| Retail Attach | 8% | 16% | 26% | NHCA 2024 ASSUMPTION |
| Revenue/Room Hr | $42 | $60 | $78 | NHCA 2024 ASSUMPTION |

---

## Section 3: Display Format

### 3.1 Benchmark Card Design

Each metric gets a benchmark card with:

```
┌──────────────────────────────────────────────────────┐
│  RETAIL ATTACH RATE                                  │
│                                                      │
│  You: 15%                                            │
│                                                      │
│  ├───────────────────┬─────────────────────────┤    │
│  25%ile    50%ile     YOU       75%ile               │
│  12%       22%       15% ▲     34%                   │
│                                                      │
│  You're in the bottom 35% of spas like yours.        │
│  Reaching the median would add ~$4,200/year.         │
│                                                      │
│  [See how to improve →]                              │
│  Compared to: 47 day spas nationally  ASSUMPTION    │
└──────────────────────────────────────────────────────┘
```

### 3.2 Position Language

Map position to copy (never shame, always opportunity):

| Percentile | Label | Tone |
|---|---|---|
| > 75th | "You're a top performer" | ✅ Celebrate |
| 50th–75th | "You're above average" | 🟡 Sustain + push |
| 25th–50th | "You're right in the middle — room to grow" | 🟡 Motivate |
| < 25th | "This is your biggest opportunity" | 🟠 Urgent + CTA |

### 3.3 "What Moving to the Next Band Would Mean" Calculation

For each metric where the business is below the 50th percentile, show:

```
Reaching median [metric]:
→ +$X,XXX/year estimated

How: [specific action from leakage engine or retail attach engine]
```

This links benchmark insight directly to a concrete action. The insight must be actionable, not decorative.

### 3.4 Benchmark Detail Modal

Clicking any benchmark card opens a modal with:
- Full percentile distribution (P10, P25, P50, P75, P90)
- Business's position highlighted
- "What drives top performers in this category" — 3 bullet points (content managed, V1 can be static)
- Data source + methodology note
- "Adjust my peer group" button (opens peer group settings)

---

## Section 4: Data Architecture

### 4.1 V1: Static Benchmark Store (No DB Required)

For V1, benchmarks are stored as static TypeScript constants in `src/lib/benchmarkData.ts`:

```typescript
export const BENCHMARK_DATA: Record<BusinessType, BenchmarkSet> = {
  spa: {
    utilization:     { p25: 0.52, p50: 0.67, p75: 0.78, source: 'ISPA 2024' },
    avgTicket:       { p25: 68,   p50: 89,   p75: 115,  source: 'ISPA 2024' },
    retailAttach:    { p25: 0.12, p50: 0.22, p75: 0.34, source: 'PBA 2024'  },
    revenuePerRoomHr:{ p25: 48,   p50: 65,   p75: 86,   source: 'ISPA 2024' },
  },
  medspa: { ... },
  salon:  { ... },
  barbershop: { ... },
};
```

Zero DB queries needed in V1. Benchmarks are instant.

### 4.2 V2: Platform-Sourced Aggregates (When n ≥ 50)

When platform has sufficient data:

```sql
-- Materialized view (refresh daily) — NEVER exposes individual rows
CREATE MATERIALIZED VIEW benchmark_aggregates AS
SELECT
  business_type,
  service_category_profile,      -- hashed, not raw
  size_tier,
  PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY utilization_pct) AS util_p25,
  PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY utilization_pct) AS util_p50,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY utilization_pct) AS util_p75,
  -- same for avg_ticket, retail_attach, revenue_per_room_hr
  COUNT(*) AS sample_size    -- exposed in UI ("Based on XX businesses")
FROM business_analytics
WHERE
  sample_size >= 5          -- minimum anonymization floor
  AND is_active = true
GROUP BY business_type, size_tier;
```

**Security rule:** `sample_size` column is shown to users. If < 5, row is excluded entirely. No exceptions.

### 4.3 New Table: `business_settings` (Minimal Schema)

Needed to store the business inputs required for benchmark comparison:

```sql
CREATE TABLE business_settings (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id           uuid NOT NULL UNIQUE,
  business_type         text,    -- spa | salon | medspa | barbershop
  rooms_count           integer DEFAULT 1,
  operating_hours_day   numeric DEFAULT 8,
  operating_days_week   integer DEFAULT 5,
  avg_sessions_day      integer DEFAULT 6,
  avg_service_price     numeric DEFAULT 85,
  avg_service_duration  integer DEFAULT 60,  -- minutes
  avg_retail_transaction numeric DEFAULT 45,
  retail_attach_rate    numeric DEFAULT 0.15,
  size_tier             text,    -- auto-computed from rooms_count
  price_tier            text,    -- auto-computed from avg_service_price
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- RLS: business can read/write own row, admin reads all
```

**Alternative if schema change is too much for MVP:** Store in `user_profiles.metadata` JSONB. Zero migration needed, but less queryable for V2 aggregation.

---

## Section 5: Privacy + Anti-Leakage Rules

These are non-negotiable. Enforced in code AND policy.

1. **Aggregation floor:** Never show a benchmark computed from fewer than 5 businesses. This includes the "based on X businesses" count — if < 5, show "Limited data" not the count.
2. **No business identification:** Benchmark UI never shows business names, locations, revenue figures, or any identifying information.
3. **Brand data firewall:** Benchmark data is computed from `business_analytics`, which is owned by businesses. Brand admins have zero access to this endpoint.
4. **Admin access with audit:** Platform admins can query benchmark aggregates for product purposes, but every query logs to `audit_log`.
5. **User opt-in for their data to be included:** Business users must opt-in to contributing their data to the benchmark pool. Default: opted out. Opt-in unlocks the benchmark module. This is the ethical approach AND a strong conversion lever ("Turn on benchmarks to see how you compare").

---

## Section 6: Hook Points (Minimal Diff)

| What | Where | Type |
|---|---|---|
| Benchmark data constants | `src/lib/benchmarkData.ts` | NEW FILE (static TypeScript) |
| Benchmark calculation utility | `src/lib/benchmarkEngine.ts` | NEW FILE (pure function) |
| Benchmark cards component | `src/components/business/BenchmarkCard.tsx` | NEW FILE |
| Benchmark section in dashboard | `src/pages/business/Dashboard.tsx` | ADD section below KPI cards |
| Benchmark detail modal | Inline in BenchmarkCard | Contained to component |
| Business settings form | `src/pages/business/Settings.tsx` | ADD settings section |
| `business_settings` table | Supabase migration | NEW TABLE (or use user_profiles JSONB) |

Zero changes to: engines, plan flow, brand portal, admin portal, all existing routes.

---

## Section 7: Benchmark Module Paywall

| Tier | Access |
|---|---|
| Starter (free) | See own metrics only. Benchmark band visible but blurred. "Upgrade to see how you compare." |
| Growth | Full benchmark access. All 4 dimensions. Peer group matching. |
| Pro | Full access + historical trend (how your percentile has changed over time) |

The benchmark paywall is one of the strongest Growth tier conversion levers — seeing blurred percentile bars creates immediate curiosity and FOMO without revealing specific numbers.

---

## Section 8: Instrumentation Events

| Event | Trigger | Properties |
|---|---|---|
| benchmark_opt_in | User opts in to data sharing | business_type |
| benchmark_viewed | Section scrolled into view | dimensions_visible, percentile_positions |
| benchmark_detail_opened | Card clicked | dimension, user_percentile |
| peer_group_adjusted | User changes peer group | old_criteria, new_criteria, new_n |
| benchmark_action_clicked | "See how to improve →" clicked | dimension, gap_to_median_$ |

---

*Last updated: 2026-02-22 | Revenue Intelligence Layer v1.0*
