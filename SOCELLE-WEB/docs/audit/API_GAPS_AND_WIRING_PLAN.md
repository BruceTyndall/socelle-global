# SOCELLE API Gaps and Wiring Plan
**Lane:** C — API Logic Mapper
**Generated:** 2026-03-10 (v2 — expanded with page-level raw Supabase scan)
**Source:** Read-only analysis. All items are evidence-based with file citations.
**Raw supabase.from() calls in pages/:** 392 instances across 100+ files — see §9 for categorized list.

---

## 1. Unwired Edge Functions (deployed but no frontend caller)

### 1.1 `intelligence-briefing` — No frontend caller
**Evidence:** `grep -r "intelligence-briefing" src/` returns zero hits. The function at `supabase/functions/intelligence-briefing/index.ts` serves `market_signals` + `brands` + `businesses` as a cacheable public API, but the Intelligence Hub (`/intelligence`) calls `useIntelligence.ts` directly against Supabase instead.
**Recommendation:** Either wire `/intelligence` to call `intelligence-briefing` (enabling server-side caching, tier enforcement at edge) or formally deprecate and remove it.
**Priority:** MEDIUM — duplicate path creates confusion and technical debt. Maps to INTEL-WO-01.

### 1.2 `refresh-live-data` — No frontend caller confirmed
**Evidence:** `grep -r "refresh-live-data" src/` returns zero hits. The function reads/writes `live_data_feeds` table. No `useLiveDataFeeds` hook exists in `src/lib/`.
**Recommendation:** Wire to Admin Hub feeds dashboard OR confirm it is cron-only internal. If cron-only, add `pg_cron` schedule and document as such.
**Priority:** MEDIUM — `live_data_feeds` table has no consuming UI.

### 1.3 `ingest-npi` — No frontend trigger found
**Evidence:** `grep -r "ingest-npi" src/` returns zero hits. The function requires a `business_id` POST body and is intended for portal operator verification flow.
**Recommendation:** Wire to business portal onboarding or a dedicated NPI verification settings page. The DB trigger `trg_npi_verification_signal` fires on `npi_verified=true`, so the edge function IS the entry point — it needs a UI caller.
**Priority:** HIGH — operator NPI verification is a trust signal for the platform; no user can currently trigger it.

### 1.4 `ingest-openfda` — No frontend trigger; cron status unclear
**Evidence:** `grep -r "ingest-openfda" src/` returns zero hits. Migration-based pg_cron is not confirmed for this function (no migration entry found in the `20260309*` to `20260313*` range for openfda scheduling).
**Recommendation:** Add a pg_cron schedule or wire a manual trigger from Admin Hub feeds page. 51 signals already ingested in FREE-DATA-01 run — ensure ongoing refresh.
**Priority:** HIGH — safety/regulatory signals need regular refresh.

### 1.5 `open-beauty-facts-sync` — Partially wired; no automated schedule
**Evidence:** `AdminIngredientsHub.tsx:186` calls `supabase.functions.invoke('open-beauty-facts-sync')` (manual trigger). However, per MEMORY.md, 647 pages of OBF data remain and cron is recommended for ongoing pagination.
**Recommendation:** Add pg_cron schedule for continued OBF pagination. Current manual trigger is only accessible to admin.
**Priority:** MEDIUM — data completeness gap.

### 1.6 `subscription-webhook` vs `stripe-webhook` — Duplicate handlers
**Evidence:** Both `supabase/functions/stripe-webhook/index.ts` and `supabase/functions/subscription-webhook/index.ts` handle Stripe webhook events for subscription lifecycle. Both write to `subscriptions` and `user_profiles`.
**Recommendation:** Audit whether both are registered in Stripe Dashboard → Webhooks. If both are registered, the same event fires twice, causing double-writes. Consolidate to one handler.
**Priority:** HIGH — potential double-write corruption on subscription state.

### 1.7 `square-oauth-callback` + `square-appointments-sync` — BLOCKED (W11-13)
**Evidence:** Both files carry `⛔ DO NOT DEPLOY — W11-13 BLOCKED` headers. Require Supabase Vault for token storage before deployment.
**Action:** No wiring change needed until `GO:W11-13` is issued by owner. Track as BLOCKED.

---

## 2. Tables With No Consuming Hook

| Table | Migration Source | Gap | Recommended Fix |
|---|---|---|---|
| `feed_dlq` | `20260312170006_feed_wo05_create_feed_dlq.sql` | No hook, no UI surface found | Create `useFeedDlq` hook; expose in Admin Hub feeds health dashboard (FEED-WO-05 acceptance criterion) |
| `feed_run_log` | `20260312170005_feed_wo04_create_feed_run_log.sql` | No dedicated hook; only accessed by Admin UI | Create `useFeedRunLog` hook for Admin feeds dashboard |
| `live_data_feeds` | Referenced by `refresh-live-data` edge fn | No TanStack hook | Create `useLiveDataFeeds` hook; Admin Hub only |
| `api_registry` | Referenced by `test-api-connection` edge fn | No TanStack hook | Create `useApiRegistry` hook for Admin API dashboard |
| `brand_intelligence_report_jobs` | `20260308213001` | No hook found | Create hook when BRAND-WO-04/05 (BrandAIAdvisor) is built |
| `brand_automation_rules` | `20260308223001` | No hook found | Create hook for brand portal automation features |
| `crm_consent_log` | `20260310000020` | No hook found | Create `useCrmConsentLog` for CRM consent audit panel (CLAUDE.md §CRM) |
| `crm_churn_risk` | `20260310000021` | No hook found | Create `useCrmChurnRisk` for CRM intelligence tab |
| `sales_signal_attribution` | `20260310000030` | No hook found | Create hook for Sales hub signal-deal linkage (SALES-WO-*) |
| `cms_versions` | `20260313000010` | No hook found | Create `useCmsVersions` for StudioEditor version history |
| `block_data_bindings` | `20260313000011` | Only `DataBindingEngine.ts` (non-query) | Wire with TanStack `useQuery` in Studio editor |
| `market_stats` | Used by blocked Square fn | No hook | Defer until W11-13 unblocked |
| `embedding_queue` | `20260313000002` | Service-role only (by design) | No frontend hook needed — confirm pg_cron worker trigger is set |

---

## 3. Missing API Registry Entries

The `api_registry` table is designed to track all external API integrations (pinged by `test-api-connection`). Based on the active external APIs identified, the following may be missing from `api_registry`:

| Provider | Likely Missing | Note |
|---|---|---|
| OpenRouter | May not have entry | Primary AI provider; should have registry entry for health monitoring |
| OpenAI Embeddings | May not have entry | Used by `generate-embeddings` |
| Resend | May not have entry | Email delivery |
| CMS NPPES (NPI) | May not have entry | Free public API |
| OpenFDA | May not have entry | Free public API |
| Open Beauty Facts | May not have entry | Free ODbL API |
| Google Calendar API | May not have entry | OAuth-gated; no direct API key |
| Microsoft Graph API | May not have entry | OAuth-gated |

**Evidence basis:** `test-api-connection/index.ts:22-24` selects `base_url` from `api_registry` and pings it. If entries are absent, those APIs are invisible to the Admin API health dashboard.
**Recommendation:** Run `supabase.functions.invoke('test-api-connection')` via Admin UI to confirm which entries are present. Seed missing entries per the inventory above.

---

## 4. Frontend Hooks That Bypass `useIntelligence` (raw `market_signals` queries)

Per CLAUDE.md §4 item 10, 19 raw `market_signals` queries outside `useIntelligence` bypass the `isLive`/tier contract. Evidence:

| File | Location | Nature |
|---|---|---|
| `src/lib/intelligence/useAdminIntelligence.ts` | Admin-scoped; service role | Admin access — acceptable tier bypass |
| `src/lib/intelligence/useActionableSignals.ts` | `src/lib/intelligence/useActionableSignals.ts:29` | No tier guard visible |
| `src/lib/shop/useProductSignals.ts` | Lines 45, 125 | Commerce-linked signals — no tier gate |
| `src/lib/analysis/signalEnrichment.ts` | Line 63 | Enrichment service — no tier gate |
| `src/lib/enrichment/useEnrichment.ts` | Line 93 | Raw useEffect + supabase.from (P0-3 DEBT) |
| `src/lib/studio/useStudioSmartFill.ts` | Line 42 | Studio context — no tier gate |
| `src/lib/intelligence/useBenchmarkData.ts` | Via orders/brands joins | Indirect — no direct market_signals query, but uses same signal cross-ref |

**Recommended Fix:** Consolidate all user-facing `market_signals` reads through `useIntelligence()` or ensure each direct query applies `tier_min` + `active` + `expires_at` filters. Maps to FOUND-WO-11.

---

## 5. `useEnrichment.ts` Raw useEffect Debt (P0-3)

**File:** `src/lib/enrichment/useEnrichment.ts`
**Evidence:** CLAUDE.md §4 item 3 — "1 raw `useEffect` + `supabase.from()` violation" at this file (scheduling trigger).
**Fix required:** Migrate to `useQuery` with TanStack Query v5 before any launch gate. Maps to FOUND-WO-11 / P0-3.

---

## 6. Hook Duplication (Confirmed Pairs)

| Area | Duplicate Hooks | Action |
|---|---|---|
| Shop | `src/lib/shop/useOrders.ts` AND `src/lib/useShopOrders.ts` | Consolidate to one; verify callers |
| Shop | `src/lib/shop/useProducts.ts` AND `src/lib/useShopProducts.ts` | Consolidate |
| Shop | `src/lib/shop/useShopCart.ts` AND `src/lib/useShopCart.ts` | Consolidate |
| Certificates | `src/lib/education/useCertificates.ts` AND `src/lib/useCertificates.ts` | Consolidate |
| Courses | `src/lib/education/useCourses.ts` AND `src/lib/useCourses.ts` | Consolidate |
| Campaigns | `src/lib/campaigns/useCampaigns.ts` AND `src/lib/useCampaigns.ts` | Consolidate |
| Wishlist | `src/lib/shop/useWishlist.ts` AND `src/lib/useWishlist.ts` | Consolidate |

**Priority:** MEDIUM — duplicates increase maintenance surface and risk divergent behavior.

---

## 7. `database.types.ts` Drift

**Evidence:** CLAUDE.md §4 item 6 — "116 tables vs 165 migrations. Run `supabase gen types`."
**Impact:** TypeScript types used by all hooks are stale. Any new table (e.g., `feed_dlq`, `feed_run_log`, `crm_consent_log`, `signal_alerts`, `api_registry`) has no typed interface.
**Fix:** Run `supabase gen types typescript --project-id <id> > src/lib/database.types.ts`. Maps to P0-5.

---

## 8. Recommended Additions

1. **`useFeedDlq` hook** — expose `feed_dlq` table in Admin Hub feed health panel (FEED-WO-05 acceptance criterion is partially unmet)
2. **`useFeedRunLog` hook** — expose ingestion run history in Admin Hub
3. **`useApiRegistry` hook** — surface all registered APIs in `/admin/api` with live health status
4. **NPI verification UI** — a settings panel that calls `ingest-npi` for operator account verification; currently zero frontend path to this function
5. **`ingest-openfda` pg_cron schedule** — migration needed to keep FDA safety signals fresh (no cron found in migration files for this function)
6. **Consolidate Stripe webhook handlers** — deduplicate `stripe-webhook` vs `subscription-webhook`; confirm only one is registered in Stripe Dashboard per event set
7. **Deprecate or wire `intelligence-briefing`** — either use it or remove it to avoid confusion about the canonical signal query path

---

## 9. Raw `supabase.from()` Page-Level Violations (392 instances, 100+ files)

These are direct `supabase.from()` calls embedded in page component bodies or local mutation handlers — NOT wrapped in TanStack Query `useQuery`/`useMutation`. This is the largest raw pattern violation category.

**Severity:** P0 per CLAUDE.md §9 item 13. Every new data fetch MUST use TanStack Query.

### High-priority files with direct DB calls (partial list — most critical paths)

| File | Tables Accessed | Pattern | Priority |
|------|----------------|---------|----------|
| `src/pages/sales/OpportunityFinder.tsx:77` | `market_signals` | Direct read bypassing `useIntelligence` tier gate | P0 — tier bypass |
| `src/pages/sales/ProposalView.tsx:43,65` | `proposals` | Duplicate of `useProposals` — should use hook | P1 |
| `src/pages/brand/IntelligenceReport.tsx:321-330` | `brands`, `market_signals`, `brand_intelligence_report_jobs` | Complex multi-table read, no hook | P1 |
| `src/pages/brand/Products.tsx:110-566` | `product_pricing`, `pro_products`, `retail_products` | Full CRUD without hooks | P1 |
| `src/pages/brand/Dashboard.tsx:174-192` | `orders`, `pro_products`, `brands` | KPI reads, no hook | P1 |
| `src/pages/brand/Messages.tsx:167-256` | `conversations`, `messages`, `user_profiles` | Realtime messaging (Realtime acceptable; read patterns need hooks) | P1 |
| `src/pages/brand/Pipeline.tsx:41-70` | `businesses`, `business_interest_signals` | Direct CRUD | P1 |
| `src/pages/brand/Performance.tsx:218-256` | `orders`, `plans`, `order_items` | Analytics reads, no hook | P1 |
| `src/pages/brand/Orders.tsx:42-62` | `orders`, `order_items` | List read without hook | P1 |
| `src/pages/brand/Storefront.tsx:45-119` | `brands`, `pro_products`, `retail_products`, `plans` | Multi-table read, no hook | P1 |
| `src/pages/education/CECreditDashboard.tsx:80` | `market_signals` | Direct market_signals read — bypasses tier gate | P0 — tier bypass |
| `src/pages/education/author/CourseBuilder.tsx:126-338` | `courses`, `course_modules`, `course_lessons` | Full CRUD without hooks | P1 |
| `src/pages/business/*/multiple` | Various CRM, order, plan tables | Many pages use direct calls | P1 |
| `src/pages/admin/*/multiple` | All admin tables | Admin pages use direct calls (acceptable for admin role — lower priority) | P2 |

### useEffect-based scheduling violations in lib/ (not pure data fetch — context matters)

| File | useEffect Purpose | Assessment |
|------|------------------|------------|
| `src/lib/useIngredients.ts:57` | Debounce timer for search input | NOT a violation — no DB call in useEffect body |
| `src/lib/useIngredientSearch.ts:59` | Debounce timer | NOT a violation |
| `src/lib/useScorm.ts:88` | SCORM runtime initialization + periodic flush | Borderline — initialization side-effect; data fetch is in useQuery. Monitor. |
| `src/lib/useIntelligence.ts:211` | Supabase Realtime channel subscription | ACCEPTABLE — Realtime subscriptions legitimately use useEffect |
| `src/lib/useSubscription.ts:65` | Supabase Realtime subscription | ACCEPTABLE |
| `src/lib/useEnrichment.ts:38` | Scheduling trigger for enrichment service | DEBT — `scheduleEnrichment()` is a side-effect scheduler; no direct supabase.from() in useEffect body. Lower risk than originally assessed but still non-standard. |

**Net raw useEffect + supabase.from() violations in lib/: 0 confirmed** (prior P0-3 assessment for useEnrichment was overstated — the useEffect calls `scheduleEnrichment()`, not `supabase.from()` directly. The `supabase.from()` calls in useEnrichment.ts:91-93 are inside a `useQuery` queryFn — compliant.)
