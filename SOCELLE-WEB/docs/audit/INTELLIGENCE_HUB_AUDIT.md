# Intelligence Hub Deep Audit
**Lane:** B — Intelligence Hub Deep Audit
**Date:** 2026-03-10
**Auditor:** Lane B agent (read-only, no code changes)

---

## Surfaces Audited (10)

| # | Surface | Route | File |
|---|---------|-------|------|
| 1 | Public Intelligence Feed | `/intelligence` | `pages/public/Intelligence.tsx` |
| 2 | Public Intelligence Home | `/home` | `pages/public/IntelligenceHome.tsx` |
| 3 | Public Intelligence Briefs | `/intelligence/briefs` | `pages/public/IntelligenceBriefs.tsx` |
| 4 | Public Intelligence Commerce | `/shop/intelligence` | `pages/public/IntelligenceCommerce.tsx` |
| 5 | Business Portal — Intelligence Hub | `/portal/intelligence` | `pages/business/IntelligenceHub.tsx` |
| 6 | Brand Portal — Intelligence Hub | `/brand/intelligence` | `pages/brand/BrandIntelligenceHub.tsx` |
| 7 | Brand Portal — Intelligence Report | `/brand/intelligence-report` | `pages/brand/IntelligenceReport.tsx` |
| 8 | Brand Portal — Intelligence Pricing | `/brand/intelligence-pricing` | `pages/brand/IntelligencePricing.tsx` |
| 9 | Admin — Intelligence Dashboard | `/admin/intelligence` | `pages/admin/IntelligenceDashboard.tsx` |
| 10 | SignalDetailPanel (cross-hub component) | slide-out panel | `components/intelligence/SignalDetailPanel.tsx` |

---

## Module-by-Module Scorecard

### Surface 1: Public Intelligence Feed (`/intelligence`)

**File:** `src/pages/public/Intelligence.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| DATA | PASS | Fetches from `market_signals` via `useIntelligence()` (TanStack Query v5). Also queries `data_feeds` via `useDataFeedStats()`, and `stories` table via `useStories()`. `isLive` flag active. |
| PRESS | PASS | KPI strip shows total signals, verified sources, avg confidence, active feeds — all live from DB when available. PREVIEW banner shown when not live. Confidence displayed via `avgConfidence`. Freshness shown via `timeAgo(updated_at)`. |
| VALUE | WARN | Vertical tab filter (medspa/salon/beauty_brand) wired. IntelligenceFeedSection provides full-text search and signal-type tabs. Editorial fallback is DEMO-labeled. No save-to-favorites, no export, no CRM action from this public surface (by design — auth gate). |
| PROVENANCE | PASS | SpotlightPanel explains provenance tiers and source scoring. ApiStatusRibbon shows live feed status. `source_name`, `source_url` carried in signal data. |
| ACTIONABILITY | WARN | Auth-aware CTAs: "Open Intelligence Dashboard" vs "Get Intelligence Access". No inline save/share action for anonymous users. Realtime subscription active (Supabase channel). |

**Assessment:** PASS on DATA and PRESS. WARN on VALUE/ACTIONABILITY is expected for a public unauthenticated surface. No FAIL conditions.

---

### Surface 2: Public Intelligence Home (`/home`)

**File:** `src/pages/public/IntelligenceHome.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| DATA | PASS | Uses `useIntelligence()` + `useDataFeedStats()`. KPI strip driven by live signal count, `enabledFeeds`, avg `confidence_score`. Signal cards sourced from DB. |
| PRESS | PASS | DEMO/PREVIEW banner shown when `!isLive`. Confidence score displayed per card. Freshness via `timeAgo(updated_at)`. |
| VALUE | PASS | Category navigation filters live signals. Skeleton shimmer on loading. Empty state with CTA. |
| PROVENANCE | WARN | No provenance panel or source attribution per card on this surface. Category + signal_type shown, but no `source_name` displayed inline. |
| ACTIONABILITY | WARN | CTAs lead to `/request-access`. No cross-hub actions from this surface (pre-auth, expected). |

**Assessment:** PASS on DATA and PRESS. Provenance gap (source attribution not displayed per card) is a WARN, not blocking.

---

### Surface 3: Public Intelligence Briefs (`/intelligence/briefs`)

**File:** `src/pages/public/IntelligenceBriefs.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| DATA | PASS | Queries `cms_posts` table via `useIntelligencePosts({ status: 'published' })`. `isLive` flag returned from hook. |
| PRESS | PASS | DEMO badge shown when not live. Freshness via `published_at`. Reading time estimated from word count or `reading_time` column. Category filter driven by live data. |
| VALUE | PASS | Search, category filter, pagination (12/page). Skeleton loading, error state with retry, empty state. |
| PROVENANCE | WARN | No author attribution. No `source_name` or evidence panel on list cards. The `hero_image`, `excerpt`, `category` from CMS are shown. |
| ACTIONABILITY | WARN | Cards link to detail page. No save, share, or CRM action from list. |

**Assessment:** PASS on DATA and PRESS. Provenance/authorship is a known CMS gap — not a FAIL.

---

### Surface 4: Public Intelligence Commerce (`/shop/intelligence`)

**File:** `src/pages/public/IntelligenceCommerce.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| DATA | PASS | Uses `useProducts()`, `useProductSignals()`, and `useIntelligence()`. All three are TanStack Query hooks against real tables (`retail_products`, `market_signals`). |
| PRESS | PASS | LIVE/DEMO banner based on `isLive`. Signal cards show `signal_type`, `title`, `direction`, `region`. |
| VALUE | WARN | Intelligence context strip wired. Trending products grid. Landing Cost Calculator explicitly labeled DEMO with `--` values. No export action. |
| PROVENANCE | WARN | Signal cards show signal_type and region but no `source_name` or confidence. The DEMO label on Landing Cost Calculator is correct but the calculator itself has no backend. |
| ACTIONABILITY | WARN | Products link to shop. Ingredient intelligence link to `/ingredients`. FTC affiliate badge shown when applicable. No save/brief/plan action without auth. |

**CRITICAL FINDING:** `IntelligenceCommerce.tsx` calls `useIntelligence()` and renders LIVE/DEMO badges (lines 94-103). The CLAUDE.md §4 item 9 ("IntelligenceCommerce.tsx missing isLive guard") is INCORRECT per current code — the guard EXISTS. However, no LIVE badge is shown on the individual signal cards themselves, only on the top banner. Acceptable for public surface.

**Assessment:** PASS on DATA and PRESS. WARN conditions are by-design for public, pre-auth surface.

---

### Surface 5: Business Portal — Intelligence Hub (`/portal/intelligence`)

**File:** `src/pages/business/IntelligenceHub.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| DATA | PASS | `useIntelligence()` fetches from `market_signals`. No raw `useEffect` + `supabase.from()` detected. |
| PRESS | PASS | DEMO badge in header when `!isLive`. All 10 cloud modules (`KPIStrip`, `SignalTable`, `TrendStacks`, `WhatChangedTimeline`, `OpportunitySignals`, `ConfidenceProvenance`, `CategoryIntelligence`, `CompetitiveBenchmarking`, `BrandHealthMonitor`, `LocalMarketView`) receive live `signals` prop. |
| VALUE | PASS | 6-tab navigation. AI Toolbar with 6 tools (Search, Explain, Brief, Plan, R&D Scout, MoCRA) at bottom. Signal detail slide-out panel with `CrossHubActionDispatcher`. Tier gates on Categories (starter+), Competitive (starter+), Local (pro+), Provenance (starter+). Credit gates on AI tools (2-40 credits). |
| PROVENANCE | PASS | Dedicated Provenance tab with `ConfidenceProvenance` component. SignalDetailPanel has full provenance block (source_name, source_url, region, confidence score). |
| ACTIONABILITY | PASS | `CrossHubActionDispatcher` wired in SignalDetailPanel. AI tools dispatch briefs, action plans, R&D queries, MoCRA checks. Signal search available. |

**Assessment:** PASS on all dimensions. This is the most complete intelligence surface.

**Minor gap:** `HubError` component (lines 117-135) uses hardcoded hex colors (`text-[#8E6464]`, `bg-[#6E879B]`) instead of design tokens (`text-signal-down`, `bg-accent`). Minor token drift.

---

### Surface 6: Brand Portal — Intelligence Hub (`/brand/intelligence`)

**File:** `src/pages/brand/BrandIntelligenceHub.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| DATA | FAIL | `getBrandMarketPosition()`, `getBrandPerformanceMetrics()`, `getResellerIntelligence()`, `getBrandCategoryPosition()` all call pure mock data functions from `brandPortalIntelligence.ts`. These are deterministic seeded values — NOT DB queries. Only the `topSignals` section (lines 131-135) uses live `useIntelligence()` data. SKU performance, operator network, revenue trend, category rankings are all synthetic. |
| PRESS | WARN | Header shows "Live Signals + Demo Metrics" when `signalsIsLive=true` — honest about the mixed state. Individual tab sections (SKU table, operator table, revenue chart) have NO per-section DEMO labels. |
| VALUE | WARN | Tab navigation across Brand Performance, Reseller Intelligence, Market Position. Market Position tab has Enterprise tier gate. CSV export MISSING on all tabs. No export action from SKU table or operator table. |
| PROVENANCE | FAIL | Reseller operator enrichment is derived/computed from mock order data via `deriveOperatorEnrichment()`, not from real DB enrichment records. The `provenance` array in `OperatorEnrichment` shows `status: 'degraded'` and `endpoint: null`. Synthetic enrichment data is presented in a professionally-styled table with no DEMO caveat. |
| ACTIONABILITY | WARN | Growth opportunity cards visible. At-risk operator list visible. No actions from operator cards (no contact, no CRM note, no signal link). Cross-hub action missing on brand metrics. |

**Assessment:** FAIL on DATA and PROVENANCE. The majority of displayed data (SKUs, revenue, operators, category rankings) is synthetic mock data presented in a portal context without sufficient DEMO labels. This violates CLAUDE.md §8.

---

### Surface 7: Brand Portal — Intelligence Report (`/brand/intelligence-report`)

**File:** `src/pages/brand/IntelligenceReport.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| DATA | PASS | Queries `market_signals` (active, non-duplicate, limit 300), `brands` (by brand_id), and `brand_intelligence_report_jobs` (by brand_id) via TanStack Query. Derives report sections from live signal data grouped by month. |
| PRESS | PASS | Report header shows DEMO badge — honest. Report date, generated timestamp, and brand name from live DB. Signal count, bullish %, regions, sources all computed from live signals. |
| VALUE | PASS | Month selector for previous reports. Queue PDF/Queue Email actions write to `brand_intelligence_report_jobs`. Delivery queue shows job status (queued/processing/completed/failed). |
| PROVENANCE | PASS | "Competitive Landscape" section shows `uniqueSources` from `source_name`/`source` columns. Primary sources listed. Source diversity recommendation shown. |
| ACTIONABILITY | PASS | PDF queue and email delivery are wired to DB. Queue status tracked. `artifact_url` linked when available. |

**Assessment:** PASS on all dimensions. Report generation is client-side (not edge function), but the queuing pattern is correct.

**Minor gap:** DEMO badge is hardcoded at line 471 regardless of whether signals are live. Should be conditional on whether `brandSignals.length > 0` (i.e., whether live brand-specific signals were found).

---

### Surface 8: Brand Portal — Intelligence Pricing (`/brand/intelligence-pricing`)

**File:** `src/pages/brand/IntelligencePricing.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| DATA | FAIL | `getTierPricing()` and `getTierFeatures()` imported from `lib/brandTiers/mockTierData`. Pricing, features, and tier data are all static hardcoded mock. No Supabase query. No `isLive` flag. |
| PRESS | FAIL | No DEMO/PREVIEW label anywhere on this page. Static pricing presented without any caveat that it is mock data. Violates CLAUDE.md §8 (unlabeled mock = FORBIDDEN). |
| VALUE | PASS | Tier comparison table, FAQ accordion, upgrade CTA wired to `useBrandTier()`. |
| PROVENANCE | FAIL | No data provenance applicable. As a portal page with all-static data and no DEMO label, it counts as a live-presenting shell. |
| ACTIONABILITY | WARN | Upgrade button calls `alert(msg)` — no Stripe integration. No real upgrade flow. |

**Additional finding:** Uses `font-playfair` class (lines 104, 201) — verify against `tailwind.config.js` whether this is a banned/legacy token.

**Assessment:** FAIL on DATA, PRESS, and PROVENANCE. No DEMO label on a page displaying mock pricing data in a paid portal.

---

### Surface 9: Admin Intelligence Dashboard (`/admin/intelligence`)

**File:** `src/pages/admin/IntelligenceDashboard.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| DATA | PASS | `useAdminIntelligence()` fetches from `market_signals`, `businesses`, `brands`, `account_subscriptions`, `api_registry`, `data_feeds` — all via TanStack Query v5. Realtime subscription on `market_signals` INSERT. |
| PRESS | PASS | LIVE/DEMO badge driven by `isLive` computed from query health. Signal table shows `confidence`, `source_name`, `status`, `direction`, `updated_at`. Feed status shows `signal_count`, `last_fetched_at`, errors. |
| VALUE | PASS | Status filter tabs (all/active/draft/archived). Create Signal modal (writes to DB). Archive and Delete actions (write to DB). Refresh button. API Health panel. Feed Status strip. |
| PROVENANCE | PASS | Source name shown inline on each signal row. API health shows `last_test_status`, `last_tested_at`, `last_test_latency_ms`. Feed health shows errors. |
| ACTIONABILITY | PASS | Full CRUD on signals (create/archive/delete). Realtime invalidation on new INSERT. |

**Assessment:** PASS on all dimensions. Well-constructed admin surface.

---

### Surface 10: SignalDetailPanel (cross-hub component)

**File:** `src/components/intelligence/SignalDetailPanel.tsx`

| Dimension | Score | Notes |
|-----------|-------|-------|
| DATA | PASS | Receives `signal: IntelligenceSignal` prop from parent — data comes from `useIntelligence()` hook, which fetches from `market_signals`. |
| PRESS | PASS | Shows `confidence_score` with HIGH/MODERATE/LOW label and numeric score. Shows `updated_at` as relative time. Shows `source_name` and `source_url` with external link. |
| VALUE | PASS | Metadata grid: category, signal_type, confidence, updated. Related brands and related products chips. CrossHubActionDispatcher integrated. |
| PROVENANCE | PASS | Dedicated provenance block with Shield icon. Shows source, source_name, region, source_url with clickable external link. ESC key closes panel. |
| ACTIONABILITY | PASS | `CrossHubActionDispatcher` dispatches signal to CRM, deals, campaigns per signal data. |

**Assessment:** PASS on all dimensions. Best provenance implementation in the codebase.

---

## Scorecard Summary

| Surface | DATA | PRESS | VALUE | PROVENANCE | ACTIONABILITY |
|---------|------|-------|-------|------------|---------------|
| Public Intelligence Feed | PASS | PASS | WARN | PASS | WARN |
| Public Intelligence Home | PASS | PASS | PASS | WARN | WARN |
| Public Intelligence Briefs | PASS | PASS | PASS | WARN | WARN |
| Public Intelligence Commerce | PASS | PASS | WARN | WARN | WARN |
| Business Portal Intel Hub | PASS | PASS | PASS | PASS | PASS |
| Brand Portal Intel Hub | **FAIL** | WARN | WARN | **FAIL** | WARN |
| Brand Portal Intel Report | PASS | PASS | PASS | PASS | PASS |
| Brand Portal Intel Pricing | **FAIL** | **FAIL** | PASS | **FAIL** | WARN |
| Admin Intelligence Dashboard | PASS | PASS | PASS | PASS | PASS |
| SignalDetailPanel | PASS | PASS | PASS | PASS | PASS |

**Overall: FAIL** — Brand Portal Intelligence Hub has mock data for all brand-specific metrics without DEMO labels. Brand Portal Intelligence Pricing has entirely static data with no DEMO label.

---

## Hook-to-Table Mapping

| Hook | Table(s) | Key Columns Used | Edge Function | UI Surface(s) |
|------|----------|-----------------|---------------|----------------|
| `useIntelligence()` | `market_signals` | id, signal_type, title, description, magnitude, direction, region, category, related_brands, related_products, updated_at, source, source_name, source_url, confidence_score, vertical, topic, tier_min, impact_score | Realtime channel (no edge fn) | Public Feed, IntelligenceHome, Business Portal, Brand Intel Hub (signals only) |
| `useAdminIntelligence()` | `market_signals`, `businesses`, `brands`, `account_subscriptions`, `api_registry`, `data_feeds` | Various count + health fields | Realtime channel on market_signals | Admin Intelligence Dashboard |
| `useDataFeedStats()` | `data_feeds` | count, enabled, signal_count, avg_confidence, last_orchestrator_run | None | Public Intelligence Feed, IntelligenceHome |
| `useStories()` | `stories` | title, category, hero_image_url | None | Public Intelligence Feed (editorial scroll) |
| `useIntelligencePosts()` | `cms_posts` | title, excerpt, category, published_at, hero_image, reading_time, slug | None | Intelligence Briefs |
| `useProducts()` | `retail_products` | name, price_cents, images, slug, is_featured, affiliate_url | None | Intelligence Commerce |
| `useProductSignals()` | Derived cross-reference of `retail_products` + `market_signals` | magnitude, direction, signalTitle | None | Intelligence Commerce |
| `useBrandIntelligence()` | `brands`, `orders`, `order_items` | id, name, slug, brand_id, subtotal, business_id, status, created_at | None | Brand Storefront pages |
| `brandPortalIntelligence.ts` | None (pure mock — seeded hash functions) | N/A | None | Brand Portal Intel Hub (Tabs 1, 2, 3 — all data) |
| `brandIntelligence.ts` | None (pure mock — hardcoded maps) | N/A | None | Brand Storefront pages, Brand Intel Hub fallback |
| IntelligenceReport (inline query) | `market_signals`, `brands`, `brand_intelligence_report_jobs` | id, title, description, signal_type, magnitude, direction, updated_at, source, source_name, related_brands, region | None | Brand Intel Report |
| Admin CRUD (inline) | `market_signals` (write) | title, summary, signal_type, direction, confidence, status, tier_visibility | None | Admin Intelligence Dashboard |
| `businessIntelligence.ts` | None (imports `mockSignals`) | N/A (static mock) | None | Business Portal intelligence insight components |

---

## Gap Analysis

### Demo-to-Live Gaps

1. **Brand Portal Intel Hub — Brand Performance tab**: `getBrandPerformanceMetrics()` returns seeded mock data. Required live source: brand-specific aggregations from `orders`, `order_items` filtered by `brand_id`. Columns needed: `subtotal`, `created_at`, `quantity`, SKU identifiers.

2. **Brand Portal Intel Hub — Reseller Intelligence tab**: `getResellerIntelligence()` returns 12 hardcoded operator names with seeded values. Required live source: `orders` + `businesses` joined by `brand_id`. Geographic distribution from `businesses.region`, tier distribution from `businesses.plan`.

3. **Brand Portal Intel Hub — Market Position tab**: `getBrandCategoryPosition()` returns seeded category rankings. Required live source: platform-wide adoption analytics (aggregate query across brands + orders). Requires a dedicated analytics edge function or materialized view.

4. **Brand Portal Intelligence Pricing**: `getTierPricing()` and `getTierFeatures()` are static mock arrays. Must be labeled DEMO until wired to real pricing (Stripe Products API or pricing table in Supabase).

5. **Brand Intelligence Storefront**: `brandIntelligence.ts` functions (`getBrandPeerData`, `getBrandAdoptionCount`, `getProfessionalsAlsoBought`) remain as mock fallbacks. `useBrandIntelligence()` attempts live wire but falls back immediately if `orders.length < 1`. Until real order data exists, these surfaces show mock data.

6. **Business Portal Intelligence**: `businessIntelligence.ts` imports `mockSignals`. All operator insights, growth opportunities, demand signals, and reorder risks are generated from mock data. No live Supabase queries exist in this module.

### Missing Exports

| Surface | Expected Export | Current State |
|---------|----------------|---------------|
| Business Portal Intel Hub — SignalTable | CSV export of filtered signals | Missing |
| Brand Portal Intel Hub — SKU Performance table | CSV export | Missing |
| Brand Portal Intel Hub — Operator Network table | CSV export | Missing |
| Brand Portal Intel Report | PDF live generation | Queued only — no edge function generating actual PDF |
| Admin Intelligence Dashboard — Signal table | CSV export | Missing |
| Public Intelligence Feed (signed-in) | Signal brief export | Missing |

### Missing Tier Gates

| Surface | Feature | Required Tier | Current State |
|---------|---------|---------------|---------------|
| Business Portal — `WhatChangedTimeline` | Timeline of signal changes | Consider: Pro | No tier gate |
| Business Portal — `OpportunitySignals` | Opportunity scoring | Consider: Starter | No tier gate — shown to all |
| Brand Portal Intel Hub — Reseller tab | Full operator network | Consider: Enterprise | No tier gate (only Market Position tab gated) |

### Missing Cross-Hub Actions

| From Surface | Missing Action | Target Hub |
|-------------|----------------|------------|
| Brand Portal Intel Hub — Signals section | "Create CRM note from signal" | CRM Hub |
| Brand Portal Intel Hub — SKU Performance | "Flag at-risk SKU to sales pipeline" | Sales Hub |
| Brand Portal Intel Hub — Operator table | "Open operator in CRM" | CRM Hub |
| Brand Portal Intel Report — Recommendations | "Create action plan from recommendation" | Sales / AI Tools |
| Public Intelligence Feed (signed-in users) | "Save signal" / "Add to watchlist" | Notifications Hub |
| Intelligence Commerce | "Request procurement proposal from signal" | Sales Hub |
| IntelligenceBriefs | "Share brief to team" / "Add to briefing book" | CRM / Education Hub |
| IntelligenceHome | "Subscribe to category alerts" | Notifications Hub |

---

## Additional Findings

### P0: Brand Portal Intelligence Hub — DEMO label missing on metric sections

`BrandIntelligenceHub.tsx` displays the header badge as "Live Signals + Demo Metrics" when `signalsIsLive=true`, but the KPI cards, SKU performance table, revenue trend chart, and operator network table have NO per-section DEMO labels. A brand admin user sees professional-looking tables and charts without knowing they are entirely synthetic. This violates CLAUDE.md §8.

### P0: Brand Portal Intelligence Pricing — No DEMO label, uses `font-playfair`

`IntelligencePricing.tsx`:
- Lines 104, 201: `font-playfair` class — verify if banned token
- Upgrade button calls `alert(msg)` — no Stripe integration
- Static pricing displayed without any DEMO label

### P1: `businessIntelligence.ts` imports `mockSignals`

The business portal intelligence module imports `mockSignals` for its data layer. All business portal intelligence insights (OperatorInsights, GrowthOpportunities, DemandSignals, ReorderRisks) are generated from static mock data. The IntelligenceHub page passes these through cloud components, but the data origin is not surfaced to the user.

### P1: IntelligenceReport DEMO badge is hardcoded

`IntelligenceReport.tsx` line 471 shows a hardcoded DEMO badge regardless of whether the signals used to build the report are live. Since `buildReports()` uses real `market_signals` data, the DEMO label is misleading when signals are populated.

### P2: `useIntelligence()` — `tier_visibility` always defaults to 'free' in rowToSignal

In `rowToSignal()` at line 132, `tier_visibility` is hardcoded to `'free'` for all DB rows regardless of what the DB column contains. The client-side `tieredSignals` filter is therefore a no-op (all signals pass for free tier, all signals also pass for pro since pro includes free). The DB-level `tier_min` filter at query time does provide effective gating, but the field `tier_visibility` in `IntelligenceSignal` is never populated from the actual DB value. This creates a correctness gap if pro-only signals (with `tier_visibility: 'pro'`) are ever inserted into the DB — they would not be gated client-side.

**Fix:** Change line 132 to: `tier_visibility: (row.tier_visibility as TierVisibility) ?? 'free'`

### P3: Signal count limit of 50 and 14-day window (free tier)

Free-tier users get max 50 signals from the last 14 days. With 81 signals currently in DB, this is not binding now but will need revisiting as signal volume scales.

---

## Overall Verdict

**FAIL** — 2 of 10 surfaces have material DATA or PRESS failures:

1. `BrandIntelligenceHub.tsx` — DATA FAIL (all brand-specific metrics are seeded mock data), PROVENANCE FAIL (synthetic enrichment presented as verified operator data without DEMO label)
2. `IntelligencePricing.tsx` — DATA FAIL (mock pricing without DEMO label), PRESS FAIL (no DEMO/PREVIEW disclosure)

All other 8 surfaces: materially PASS with WARN conditions appropriate for their surface type.

**Remediation priority:**
1. (P0) Add per-section DEMO badges to Brand Portal Intel Hub tabs using `brandPortalIntelligence.ts`
2. (P0) Add DEMO badge to Intelligence Pricing page
3. (P0) Label or replace `businessIntelligence.ts` mock data in Business Portal hub
4. (P1) Fix hardcoded DEMO badge in IntelligenceReport — make conditional
5. (P1) Fix `tier_visibility` in `rowToSignal()` — read from DB row
6. (P2) Add CSV export to SignalTable, SKU table, Operator table
7. (P2) Add tier gates to `OpportunitySignals` (Starter) and `WhatChangedTimeline` (Pro)
8. (P3) Wire Brand Portal performance metrics to live `orders`/`order_items` (maps to INTEL-WO or BRAND-WO)
