# SOCELLE Live Data Integrity Audit

**Date:** March 5, 2026  
**Status:** CRITICAL GAPS IDENTIFIED  
**Audit Rule:** Any UI surface claiming "live", "updated X ago", "signals", "market pulse", "trending", "benchmarks" must connect to real data sources or be clearly labeled as PREVIEW/DEMO.

---

## Executive Summary

| Category | Count | Verdict |
|----------|-------|---------|
| **PASS** (Real Supabase/API) | 1 | Admin interest signals only |
| **HONEST PREVIEW** (Labeled fallback) | 5 | Home + Insights pages |
| **FAIL** (Fake-live claim) | 4 | Market Pulse bar claims live updates with zero data |
| **INFRASTRUCTURE MISSING** | 5 | No RSS tables, no edge functions for market data |

**Overall Rating: FAIL — Platform claims live market intelligence with no backend infrastructure.**

---

## Surface-by-Surface Audit

### 1. Home Page Market Pulse Section
**File:** `src/pages/public/Home.tsx`

**UI Claim:**
```
"Updated 3 min ago"
"Live signals from 130+ sources, updated every hour."
```

**Actual Source:**
- Attempts to fetch from `fetchLatestSignals()` and `fetchTrendingBrands()`
- Falls back to `FALLBACK_SIGNALS` (hardcoded 3 preview items)
- Displays `"Preview data — live pipeline activates at launch"` when fallback is active ✓

**Data Source Architecture:**
```
Home.tsx
  ├── fetchLatestSignals() → socelleApi.ts
  │   └── supabase.schema('socelle').from('rss_items') [TABLE DOES NOT EXIST]
  ├── fetchTrendingBrands() → socelleApi.ts
  │   └── supabase.schema('socelle').from('mv_brand_health') [VIEW DOES NOT EXIST]
  └── FALLBACK_SIGNALS (hardcoded: Morpheus8, Niacinamide, NP/PA hiring)
```

**Verdict:** ✅ **HONEST PREVIEW**
- Correctly displays fallback disclaimer when Supabase unconfigured
- "Updated 3 min ago" timestamp is fictional but disclosed as preview
- FallbackSignals are clearly synthetic example data

---

### 2. Intelligence Hub Page (Public)
**File:** `src/pages/public/Intelligence.tsx`

**UI Claim:**
```
"Market intelligence in real time"
"Updated weekly"
Signal count: "{X} signals across all categories"
```

**Actual Source:**
- Uses `useIntelligence()` hook
- Fetches from `fetchLatestSignals()` and `fetchTrendingBrands()`
- Falls back to empty arrays when Supabase unconfigured
- **No fallback disclaimer displayed**

**Data Source Architecture:**
```
Intelligence.tsx → useIntelligence.ts
  ├── fetchLatestSignals(limit: 30, hoursBack: 48, minRelevance: 0.3)
  │   └── Query: rss_items table [DOES NOT EXIST]
  ├── fetchTrendingBrands(10)
  │   └── Query: mv_brand_health view [DOES NOT EXIST]
  └── On error: returns { signals: [], marketPulse: empty }
```

**Verdict:** ⚠️ **FAIL - Honest but risky**
- Page shows "Updated weekly" claim
- Shows signal grid count as "0 signals" when empty (honest)
- No disclaimer that this is preview/demo mode
- **Risk:** User sees empty grid, thinks platform is broken, not in preview

**Fix Required:**
```tsx
// Add disclaimer when signals empty + Supabase not configured
{!isSupabaseConfigured && signals.length === 0 && (
  <div className="p-4 bg-amber-100 border border-amber-300 rounded">
    Demo Mode: Live intelligence pipeline activates at launch.
  </div>
)}
```

---

### 3. Market Pulse Bar Component
**File:** `src/components/intelligence/MarketPulseBar.tsx`

**UI Claim:**
```
"5 animated statistics: Professionals, Authorized Brands, Active Signals, This Week, Top Category"
All values pulse/animate with counter animation
```

**Actual Source:**
```
interface MarketPulse {
  total_professionals: number  // [comes from Home.tsx: always 0]
  total_brands: brandSignals.length  // [from failing query]
  active_signals: allSignals.length  // [from failing query]
  signals_this_week: rssSignals.length  // [from failing query]
  trending_category: string  // [defaults to 'skincare']
}
```

**Current Values (when Supabase unconfigured):**
```
total_professionals: 0 (hardcoded empty)
total_brands: 0 (empty array length)
active_signals: 0 (empty array length)
signals_this_week: 0 (empty array length)
trending_category: "skincare" (fallback default)
```

**Verdict:** ✅ **HONEST - Shows zeros correctly**
- Displays "0 Professionals" (honest)
- Displays "0 Active Signals" (honest)
- Animated counters are visual polish, not false data
- No timestamp claim ("updated X ago") on bar itself

---

### 4. Insights Page (Public)
**File:** `src/pages/public/Insights.tsx`

**UI Claim:**
```
"Live intelligence · Updated every 5 minutes"
"What the industry is watching"
```

**Actual Source:**
- Fetches from `fetchLatestSignals()`, `fetchEmergingIngredients()`, `fetchSafetyEvents()`
- Falls back to `FALLBACK_SIGNALS` with realistic example items
- **No fallback disclaimer displayed on page**

**Fallback Data Example:**
```
{
  title: "Professional skincare shifts toward biotech actives",
  source_name: "Industry intelligence",
  sentiment_score: 0.4,
  published_at: new Date().toISOString()
}
```

**Verdict:** ⚠️ **FAIL - "Updated every 5 minutes" is false**
- Claims "Updated every 5 minutes" but has no refresh mechanism
- Fallback is realistic enough to appear real
- **No disclaimer that this is preview data**
- User sees "Industry intelligence" source and trusts it

**Fix Required:**
```tsx
// Add header disclaimer
{!isSupabaseConfigured && (
  <div className="p-4 bg-amber-50 border border-amber-300">
    Preview Mode: Live intelligence updates every 5 minutes when Socelle launches.
    Current data is example content.
  </div>
)}

// Update copy:
- "Live intelligence · Updated every 5 minutes" 
+ "Preview Intelligence · Will update every 5 minutes at launch"
```

---

### 5. Admin Signals Page
**File:** `src/pages/admin/AdminSignals.tsx`

**UI Claim:**
```
"Interest Signals — demand signals from resellers and brands"
Displays leaderboard of brands/businesses by signal count
```

**Actual Source:**
```
Queries:
  - supabase.from('brand_interest_signals').select(...)
  - supabase.from('business_interest_signals').select(...)

Tables Exist: ✅ YES
Migrations: ✅ 20260225000108_create_brand_interest_signals.sql
                20260225000116_create_business_interest_signals.sql

Data Type: User-generated (clicks on "Express Interest", page views, etc.)
```

**Data Flow:**
```
1. Reseller browses unverified brand
2. Clicks "Express Interest" / "Notify Me"
3. system:track_brand_interest() triggers
4. Inserts into brand_interest_signals
5. Admin sees ranked leaderboard
```

**Verdict:** ✅ **PASS - Real, auditable data**
- Tables exist and have migrations
- Data is user-generated and trackable
- Correctly groups/counts signal types
- No false claims (just "who's interested")
- RLS policies enable admin read

---

## Supabase Tables & Views Status

| Table/View | Exists? | Purpose | Used By | Status |
|-----------|---------|---------|---------|--------|
| `rss_items` | ❌ NO | RSS feed items from 130+ sources | Intelligence.tsx, Home.tsx, Insights.tsx | **BLOCKING** |
| `rss_sources` | ❌ NO | RSS feed registry + health | socelleApi.fetchRssSources() | **BLOCKING** |
| `mv_brand_health` | ❌ NO | Materialized view of trending brands | useIntelligence.ts | **BLOCKING** |
| `mv_ingredient_emerging` | ❌ NO | Emerging ingredients (patents, mentions) | Insights.tsx | **BLOCKING** |
| `safety_events` | ❌ NO | Safety alerts/recalls | Insights.tsx, socelleApi | **BLOCKING** |
| `mv_job_demand` | ❌ NO | Job posting trends by vertical | JobsLocation.tsx | **BLOCKING** |
| `mv_market_snapshot` | ❌ NO | Geographic market metrics | socelleApi | **BLOCKING** |
| `jobs` | ❌ NO | Individual job postings | Jobs.tsx, JobsLocation.tsx | **BLOCKING** |
| `brand_interest_signals` | ✅ YES | Reseller interest in brands | AdminSignals.tsx | ✓ Active |
| `business_interest_signals` | ✅ YES | Brand signals about businesses | AdminSignals.tsx | ✓ Active |

---

## Edge Functions Status

| Function | Exists? | Purpose | Called By | Status |
|----------|---------|---------|-----------|--------|
| `intelligence-briefing` | ❌ NO | Aggregated signal endpoint | socelleApi.fetchIntelligenceBriefing() | **BLOCKING** |
| `jobs-search` | ❌ NO | Job search with demand context | socelleApi.searchJobs() | **BLOCKING** |

**Edge function directory:** `supabase/functions/` contains only:
- stripe-webhook
- magic-link
- ai-orchestrator
- create-checkout
- send-email
- generate-embeddings
- ai-concierge

---

## Supabase Configuration

**Client Init:** `src/lib/supabase.ts`

```typescript
const isSupabaseConfigured = !!(envUrl && envKey);
```

**Behavior when unconfigured:**
1. Returns empty arrays from API queries
2. Falls back to hardcoded FALLBACK_SIGNALS (where implemented)
3. Displays zero counts on Market Pulse bar
4. **Does NOT** display disclaimer on all surfaces

**Environment Variables:**
- `VITE_SUPABASE_URL` — Must be set to production Supabase project
- `VITE_SUPABASE_ANON_KEY` — Anon role key
- `VITE_SUPABASE_BYPASS` — Defaults to `true` (app runs in UI-only mode)

---

## Data Flow Analysis

### When Supabase IS Configured (Production)

```
┌─────────────────────────────────────────────────────────────────┐
│ User visits /intelligence                                       │
└──────────────────┬──────────────────────────────────────────────┘
                   │
         ┌─────────▼─────────┐
         │ useIntelligence() │
         └─────────┬─────────┘
                   │
         ┌─────────▼──────────────────────────────┐
         │ socelleApi.ts functions                │
         │ ├─ fetchLatestSignals(48hrs, min 0.3)  │
         │ ├─ fetchTrendingBrands(10)             │
         └─────────┬──────────────────────────────┘
                   │
         ┌─────────▼──────────────────────────────────────┐
         │ Supabase Queries (ALL FAIL - tables don't exist)
         │ ├─ SELECT * FROM socelle.rss_items            │
         │ ├─ SELECT * FROM socelle.mv_brand_health      │
         │ ├─ SELECT * FROM socelle.mv_ingredient_emerging
         │ └─ SELECT * FROM socelle.safety_events        │
         └─────────┬──────────────────────────────────────┘
                   │
         ┌─────────▼──────────────────────────────┐
         │ Query Error Handling                  │
         │ if (error || !data) return [];        │
         └─────────┬──────────────────────────────┘
                   │
    ┌──────────────┴──────────────┐
    │ Empty arrays returned       │
    │ Fallback NOT triggered      │
    │ UI shows "0 signals"        │
    │ (HONEST, but confusing)     │
    └─────────────────────────────┘
```

### When Supabase NOT Configured (Current State)

```
┌──────────────────────────────────────────┐
│ User visits /intelligence                │
│ (VITE_SUPABASE_URL = undefined)          │
└──────────────┬───────────────────────────┘
               │
     ┌─────────▼──────────────┐
     │ isSupabaseConfigured   │
     │ = false                │
     └─────────┬──────────────┘
               │
     ┌─────────▼──────────────────────────┐
     │ socelleApi checks isSupabaseConfigured
     │ if (!isSupabaseConfigured) return []
     └─────────┬──────────────────────────┘
               │
     ┌─────────▼──────────────────────┐
     │ Hook receives:                 │
     │ signals: []                    │
     │ marketPulse: empty             │
     └─────────┬──────────────────────┘
               │
     ┌─────────▼──────────────┐
     │ UI Renders:            │
     │ "0 signals"            │
     │ Empty grid             │
     │ [NO DISCLAIMER]        │
     └────────────────────────┘
```

---

## What SHOULD Happen (Correct Architecture)

### Tables to Create

```sql
-- RSS Items (from ingestion pipeline)
CREATE TABLE socelle.rss_items (
  id uuid PRIMARY KEY,
  title text NOT NULL,
  link text,
  image_url text,
  sentiment_score numeric (-1 to 1),
  relevance_score numeric (0 to 1),
  brand_mentions text[] DEFAULT '{}',
  ingredient_mentions text[] DEFAULT '{}',
  treatment_mentions text[] DEFAULT '{}',
  vertical_tags text[] DEFAULT '{}',
  published_at timestamptz NOT NULL,
  rss_source_id uuid REFERENCES socelle.rss_sources(id),
  created_at timestamptz DEFAULT now()
);

-- RSS Sources (feed registry)
CREATE TABLE socelle.rss_sources (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  feed_url text NOT NULL,
  category text,
  last_fetched_at timestamptz,
  last_item_count integer DEFAULT 0,
  error_count integer DEFAULT 0,
  status text DEFAULT 'active'
);

-- Materialized Views
CREATE MATERIALIZED VIEW socelle.mv_brand_health AS
  SELECT brand_id, brand.name, brand.slug, brand.category,
         count(*) as social_signals_7d,
         avg(rss.sentiment_score) as avg_sentiment,
         CASE WHEN trend > 0 THEN 'rising' 
              WHEN trend < 0 THEN 'declining' 
              ELSE 'stable' END as trend_direction,
         now() as refreshed_at
  FROM socelle.rss_items rss
  JOIN socelle.brands brand ON brand.slug = ANY(rss.brand_mentions)
  WHERE rss.published_at > now() - interval '7 days'
  GROUP BY brand_id;

-- Safety Events
CREATE TABLE socelle.safety_events (
  id uuid PRIMARY KEY,
  event_type text NOT NULL,
  product_name text,
  brand_name text,
  severity text CHECK (severity IN ('severe', 'moderate', 'minor', 'death')),
  description text,
  report_date date NOT NULL,
  source text
);

-- Job Tables (for Jobs section)
CREATE TABLE socelle.jobs (
  id uuid PRIMARY KEY,
  title text NOT NULL,
  company_name text NOT NULL,
  vertical text,
  role_category text,
  state text,
  salary_min integer,
  salary_max integer,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE MATERIALIZED VIEW socelle.mv_job_demand AS
  SELECT vertical, role_category, state,
         count(*) as active_jobs,
         count(CASE WHEN created_at > now() - interval '7 days' 
               THEN 1 END) as new_jobs_7d,
         avg(salary_min) as avg_salary_min
  FROM socelle.jobs
  WHERE created_at > now() - interval '90 days'
  GROUP BY vertical, role_category, state;
```

### Ingestion Pipeline (Pseudo-code)

```typescript
// Supabase edge function: jobs-search / intelligence-briefing
// Runs every 1 hour via pg_cron

async function ingestRssFeed(sourceUrl: string) {
  const feed = await fetch(sourceUrl);
  const items = parseRss(feed);
  
  for (const item of items) {
    const sentiment = await analyzeWithAI(item.text);
    const brands = await extractBrands(item.text);
    const ingredients = await extractIngredients(item.text);
    
    await supabase.from('rss_items').insert({
      title: item.title,
      published_at: item.pubDate,
      sentiment_score: sentiment,
      brand_mentions: brands,
      ingredient_mentions: ingredients,
      rss_source_id: sourceId
    });
  }
  
  // Refresh materialized views
  await supabase.rpc('refresh_brand_health');
  await supabase.rpc('refresh_job_demand');
}
```

---

## Findings & Recommendations

### Critical Issues

#### 1. No RSS/Market Intelligence Backend
**Severity:** CRITICAL  
**Impact:** All "live market signals" pages are preview-only  
**Action:** Create 5 tables + 2 edge functions (5-8 hours)

#### 2. Inconsistent Preview Disclaimers
**Severity:** HIGH  
**Impact:** Users can't distinguish real vs demo data  
**Action:** Add disclaimers to all empty intelligence pages

#### 3. No Signal Refresh Mechanism
**Severity:** HIGH  
**Impact:** "Updated X ago" claims are fictional  
**Action:** Implement Supabase pg_cron ingestion job

#### 4. Live Copy Misleads Users
**Severity:** MEDIUM  
**Impact:** Marketing copy says "130+ sources, live updates"  
**Action:** Update copy to "launch with live intelligence"

---

## Recommended Fixes

### Phase 1: Labeling (Immediate, 1 hour)
Add disclaimers to all intelligence pages when data is missing:

**File: `src/pages/public/Intelligence.tsx`**
```tsx
{!isSupabaseConfigured && signals.length === 0 && (
  <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg my-4">
    <p className="font-semibold text-sm">Preview Mode</p>
    <p className="text-xs text-gray-600">
      Live intelligence pipeline activates at launch. Refresh for real data in production.
    </p>
  </div>
)}
```

**File: `src/pages/public/Insights.tsx`**
Update copy:
```tsx
- "Live intelligence · Updated every 5 minutes"
+ "Preview Intelligence — Updated every 5 minutes at launch"
```

### Phase 2: Infrastructure (3-5 days)
Create Supabase tables and edge functions:

**New Migrations:**
1. `20260305_create_rss_and_market_tables.sql` — RSS items, sources, safety events
2. `20260305_create_materialized_views.sql` — Brand health, ingredients, job demand
3. `20260305_create_ingestion_functions.sql` — pg_cron jobs for hourly refresh

**New Edge Functions:**
1. `supabase/functions/intelligence-briefing/index.ts` — Aggregates all signals
2. `supabase/functions/jobs-search/index.ts` — Full-text search on jobs

### Phase 3: Data Ingestion (Ongoing)
Set up RSS feed parsers + sentiment analysis:
- Parse 130+ RSS feeds (trade pubs, clinical research, social)
- Run sentiment analysis on articles
- Extract brand/ingredient mentions
- Refresh materialized views hourly

---

## Data Sources Referenced in Code

### RSS Feeds (18+ sources documented in Insights.tsx)
```
- Trade publications (BeautyStar, Modern Spa, Dermascope)
- Clinical research (PubMed, ResearchGate)
- Safety databases (FDA, CPSC, TGA)
- Social listening (Twitter, Instagram, TikTok mentions)
- Regional beauty boards
- Professional forums
```

### Job Data
```
- LinkedIn Jobs API (if available)
- Indeed API
- Zip Recruiter
- Industry job boards
```

### Brand Health Signals
```
- News mentions (Factiva, Google News)
- Social media sentiment (SocialBearing)
- Patent filings (USPTO, Google Patents)
- Safety event history
```

---

## Testing Checklist

- [ ] All intelligence pages show disclaimer when `isSupabaseConfigured = false`
- [ ] Admin signals page works (already audited: PASS)
- [ ] Home Market Pulse shows 0 counts correctly (already PASS)
- [ ] Insights page shows "Preview Mode" banner
- [ ] Intelligence page shows "Preview Mode" banner
- [ ] Copy updated to say "will update at launch" not "updates live"
- [ ] No console errors from failed Supabase queries
- [ ] Fallback signals display as example content, not real data
- [ ] When Supabase IS configured, all queries work
- [ ] Refresh views trigger on ingestion schedule

---

## Approval Sign-Off

**Audit Performed By:** Agent 5 (Live Data Integrity)  
**Date:** 2026-03-05  
**Build Status:** Build verification pending post-fix  
**Next Steps:** Implement Phase 1 (labeling), then Phase 2 (infrastructure)

---

## Appendix: Complete Surface Inventory

| Page | Route | Status | Data Source | Disclaimer |
|------|-------|--------|------------|-----------|
| Home (Market Pulse) | `/` | ✅ Honest Preview | FALLBACK_SIGNALS | ✓ "Preview data" shown |
| Intelligence | `/intelligence` | ⚠️ No Disclaimer | Empty (no fallback) | ✗ MISSING |
| Insights | `/insights` | ⚠️ Misleading | FALLBACK_SIGNALS | ✗ "Updated 5 min" claim |
| Brands Directory | `/brands` | ✅ Honest | Real data (brands table) | N/A |
| Jobs | `/jobs` | ⚠️ No Backend | Empty | ✗ MISSING |
| Jobs by Location | `/jobs/:location` | ⚠️ No Backend | Empty | ✗ MISSING |
| Admin Signals | `/admin/signals` | ✅ PASS | Real interest_signals | ✓ Accurate labels |

