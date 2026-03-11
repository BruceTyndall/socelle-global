# SOCELLE API Logic Map
**Lane:** C — API Logic Mapper
**Generated:** 2026-03-10 (v2 — full re-audit with line-level evidence)
**Source:** Read-only analysis of `supabase/functions/`, `src/lib/`, `src/pages/`, `supabase/migrations/`
> **NON-EXECUTION DOCUMENT**
> This is historical/context only. Execution authority is docs/build_tracker.md. Governance is /.claude/CLAUDE.md.

**Edge functions total:** 34 | **Active:** 32 | **Blocked:** 2 (Square: W11-13)

---

## 1. Edge Function Inventory (34 functions — verified line counts included)

| Function | Lines | HTTP Trigger | Tables Read | Tables Written | Auth | External API | Status |
|---|---|---|---|---|---|---|---|
| `ai-orchestrator` | 633 | POST | `user_profiles`, `subscriptions`, `ai_rate_limits`, `credit_ledger` | `audit_logs`, `credit_ledger`, `ai_rate_limits` | JWT required | OpenRouter `https://openrouter.ai/api/v1/chat/completions` — `OPENROUTER_API_KEY` | ACTIVE |
| `ai-concierge` | 148 | POST | — (proxies to ai-orchestrator) | — | JWT required | via ai-orchestrator | ACTIVE |
| `generate-embeddings` | 246 | POST | `embedding_queue`, source tables (`retail_products`, `pro_products`, `canonical_protocols`) | `embedding_queue` (status), source tables (embedding col) | None (service key) | OpenAI `https://api.openai.com/v1/embeddings` — `OPENAI_API_KEY` | ACTIVE |
| `magic-link` | 174 | POST | — (auth.users via admin API) | — | Token-based | Supabase Auth Admin API | ACTIVE |
| `send-email` | 408 | POST | `orders` (order confirmation) | — | None (service) | Resend `https://api.resend.com/emails` | ACTIVE |
| `feed-orchestrator` | 818 | POST + pg_cron hourly | `data_feeds` | `market_signals`, `feed_run_log`, `data_feeds`, `feed_dlq` | Admin JWT | Per-feed RSS endpoint_url | ACTIVE |
| `rss-to-signals` | 511 | POST or GET + pg_cron | `rss_items` | `market_signals` | None (service) | — | ACTIVE |
| `ingest-rss` | 350 | POST/GET + pg_cron 5min | `rss_sources` | `rss_items`, `rss_sources` | None (service) | Each `rss_sources.feed_url` | ACTIVE |
| `ingest-openfda` | 324 | POST | `edge_function_controls` | `market_signals` | kill-switch only | `https://api.fda.gov` — no key | ACTIVE (no frontend trigger — needs pg_cron) |
| `ingest-npi` | 184 | POST | `edge_function_controls`, `businesses` | `businesses` (npi_verified) | kill-switch only | `https://npiregistry.cms.hhs.gov/api/` — no key | ACTIVE (no frontend trigger) |
| `open-beauty-facts-sync` | 247 | POST + manual | `edge_function_controls` | `ingredients` | kill-switch only | `https://world.openbeautyfacts.org` — no key | ACTIVE |
| `intelligence-briefing` | 171 | GET | `market_signals`, `businesses`, `brands` | — | None (public) | — | ACTIVE (no frontend caller found) |
| `jobs-search` | 148 | GET | `job_postings` | — | None (public) | — | ACTIVE |
| `ingredient-search` | 144 | GET | `ingredients`, `ingredient_aliases` | — | None (public) | — | ACTIVE |
| `sitemap-generator` | 230 | GET | `brands`, `canonical_protocols`, `job_postings`, `stories` | — | None (public) | — | ACTIVE |
| `refresh-live-data` | 337 | POST | `profiles`, `live_data_feeds` | `live_data_feeds` | Admin JWT | Each `live_data_feeds.source_url` | ACTIVE (no frontend trigger confirmed) |
| `test-api-connection` | 251 | POST | `user_profiles`, `api_registry` | `api_registry` (last_tested_at, status) | Admin JWT | probe any URL from api_registry | ACTIVE |
| `create-checkout` | 211 | POST | `subscriptions`, `subscription_plans` | `subscriptions` (stripe_customer_id) | JWT required | Stripe `https://api.stripe.com/v1` — `STRIPE_SECRET_KEY` | ACTIVE |
| `shop-checkout` | 359 | POST | `carts`, `cart_items`, `discount_codes`, `shipping_methods` | `orders`, `order_items`, `carts`, `discount_codes` | JWT required | Stripe `https://api.stripe.com/v1` — `STRIPE_SECRET_KEY` | ACTIVE |
| `stripe-webhook` | 211 | POST (Stripe webhook) | — | `subscriptions` | Stripe HMAC-SHA256 sig verify | Stripe event payload + re-fetch subscription | ACTIVE |
| `shop-webhook` | 296 | POST (Stripe webhook) | `order_items`, `products`, `product_variants` | `orders`, `products`, `product_variants` | Stripe HMAC-SHA256 sig verify | Stripe event payload | ACTIVE |
| `subscription-webhook` | 256 | POST (Stripe webhook) | `subscription_plans`, `studio_addons` | `subscriptions`, `user_addons` | Stripe HMAC-SHA256 sig verify | Stripe event payload | ACTIVE (potential overlap with stripe-webhook — audit needed) |
| `manage-subscription` | 341 | POST | `subscriptions`, `subscription_plans` | `subscriptions`, `user_addons`, `studio_addons` | JWT required | Stripe `https://api.stripe.com/v1` — `STRIPE_SECRET_KEY` | ACTIVE |
| `update-inventory` | 135 | POST | `order_items`, `products`, `product_variants` | `products`, `product_variants` (stock decrement) | Service role key only | — | ACTIVE (internal call from shop-webhook) |
| `validate-discount` | 151 | POST | `discount_codes` | — | None (public) | — | ACTIVE |
| `generate-certificate` | 267 | POST | `course_enrollments`, `courses`, `user_profiles`, `certificate_templates` | `certificates`, `course_enrollments` | JWT required | Supabase Storage | ACTIVE |
| `verify-certificate` | 97 | GET | `certificates`, `courses`, `user_profiles` | — | None (public) | — | ACTIVE |
| `scorm-runtime` | 253 | POST | `scorm_tracking` | `scorm_tracking` | JWT required | — | ACTIVE |
| `process-scorm-upload` | 205 | POST | `user_profiles`, `scorm_packages` | `scorm_packages` | Admin JWT | Supabase Storage | ACTIVE |
| `calendar-create-event` | 501 | POST | `calendar_connections`, `user_profiles`, `profiles` | `calendar_connections` (token refresh) | JWT required | Google Calendar API + Microsoft Graph API (OAuth tokens per-user) | ACTIVE |
| `calendar-oauth-callback` | 244 | GET (OAuth redirect) | `calendar_oauth_states` | `calendar_connections`, `calendar_oauth_states` | State param CSRF check | Google OAuth + Microsoft OAuth token endpoints | ACTIVE |
| `square-oauth-callback` | 225 | GET (OAuth redirect) | `square_oauth_states` | `square_connections`, `square_oauth_states` | State param CSRF check | Square OAuth token endpoint | **BLOCKED — W11-13** |
| `square-appointments-sync` | 442 | POST | `square_connections` | `square_appointments_cache`, `square_connections` | kill-switch only | Square Bookings API v2 — `SQUARE_APPLICATION_ID`/`SECRET` | **BLOCKED — W11-13** |
| `test-api-connection` | 251 | POST | `user_profiles`, `api_registry` | `api_registry` | Admin JWT | Ping URL from registry | ACTIVE (duplicate row — same as row 17, listed once) |

---

## 2. External API Inventory

| Provider | Purpose | Key Required | Secret Name | Status | Used By |
|---|---|---|---|---|---|
| OpenRouter | Multi-model AI gateway (Claude, GPT-4o, Gemini, Llama) | Yes | `OPENROUTER_API_KEY` | Active | `ai-orchestrator`, `ai-concierge` |
| OpenAI | Text embeddings (`text-embedding-ada-002`) | Yes | `OPENAI_API_KEY` | Active | `generate-embeddings` |
| Stripe | Subscription billing + product checkout + webhooks | Yes | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Active (bypass mode in dev) | `create-checkout`, `shop-checkout`, `stripe-webhook`, `shop-webhook`, `manage-subscription`, `subscription-webhook` |
| Resend | Transactional email delivery | Yes | `RESEND_API_KEY`, `FROM_EMAIL` | Active | `send-email` |
| CMS NPPES NPI Registry | NPI number verification for operators | No | — | Active | `ingest-npi` |
| OpenFDA | FDA cosmetics recalls + aesthetic device adverse events | No | — | Active | `ingest-openfda` |
| Open Beauty Facts | INCI ingredient data | No | — | Active | `open-beauty-facts-sync` |
| Google Calendar API | Create calendar events for business users | Yes | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Active | `calendar-create-event`, `calendar-oauth-callback` |
| Microsoft Graph API | Create calendar events (Outlook/Teams) | Yes | `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET` | Active | `calendar-create-event`, `calendar-oauth-callback` |
| Square Bookings API | Sync appointment data from connected operators | Yes | `SQUARE_APPLICATION_ID`, `SQUARE_APPLICATION_SECRET` | BLOCKED — W11-13 | `square-appointments-sync`, `square-oauth-callback` |
| Various RSS feeds | Industry news ingestion | No (some paywalled) | `data_feeds.api_key_env_var` (per-feed) | 18 healthy, 17 disabled | `ingest-rss`, `feed-orchestrator` |

---

## 3. Logic Map by Feature Area

### 3.1 Intelligence

| Route/Page | Hook | Query | Edge Function | Tables | RLS |
|---|---|---|---|---|---|
| `/intelligence` | `useIntelligence()` | `market_signals` (active + tier_min + vertical + 14-day window) | — (direct Supabase) | `market_signals` | Public read for active signals |
| `/intelligence` | `useIntelligence()` | Realtime: `postgres_changes` on `market_signals` | — | `market_signals` | As above |
| `/intelligence` (AI Toolbar) | `AIToolbar.tsx` direct invoke | — | `ai-orchestrator` | `credit_ledger`, `ai_rate_limits` | Admin JWT |
| `/admin/intelligence` | `useAdminIntelligence()` | COUNT on `market_signals`, `businesses`, `brands`; recent signals; `data_feeds` | — | `market_signals`, `data_feeds`, `businesses`, `brands` | Admin role |
| `/admin/intelligence` | `useAdminIntelligence()` | Realtime: `postgres_changes` on `market_signals` | — | `market_signals` | Admin role |
| Feed pipeline (cron) | — | — | `ingest-rss` → `rss_items`; `rss-to-signals` → `market_signals`; `feed-orchestrator` → `market_signals` | `rss_sources`, `rss_items`, `data_feeds`, `market_signals`, `feed_run_log` | Service role |
| FDA ingest | — | — | `ingest-openfda` | `market_signals` | Service role |
| Intelligence Briefing (public API) | — | — | `intelligence-briefing` | `market_signals`, `brands`, `businesses` | Public |
| Signal enrichment | `useEnrichment.ts` (raw useEffect — P0-3) | `brands`, `market_signals` | — | `brands`, `market_signals`, `businesses` | User-scoped |

### 3.2 CRM

| Route/Page | Hook | Query | Edge Function | Tables | Notes |
|---|---|---|---|---|---|
| `/portal/crm/*` | `useCrmContacts`, `useCrmCompanies`, `useCrmTasks`, `useCrmSegments`, `useCrmPurchaseHistory` | Direct Supabase via TanStack Query | — | `crm_contacts`, `crm_companies`, `crm_tasks`, `crm_segments`, `orders`, `order_items` | |
| `/portal/crm/tasks` | `CrmTasks.tsx` | — | `calendar-create-event` | `calendar_oauth_connections`, `business_calendar_events` | Auth: Google/MS OAuth |
| Calendar connect flow | — (redirect) | — | `calendar-oauth-callback` | `calendar_oauth_connections`, `calendar_oauth_states` | OAuth redirect |
| CRM signup sync | `crmRegistration.ts` | Direct `user_profiles` insert | `send-email` (welcome) | `user_profiles`, `crm_contacts` | |

### 3.3 Education / LMS

| Route/Page | Hook | Query | Edge Function | Tables |
|---|---|---|---|---|
| `/education`, `/portal/courses/*` | `useCourses`, `useCourse`, `useEnrollment`, `useCECredits`, `useQuiz`, `useStaffTraining` | Direct Supabase | — | `courses`, `enrollments`, `certificates`, `quiz_attempts`, `lesson_progress` |
| `ScormPlayer.tsx` | — | — | `scorm-runtime` | `scorm_tracking` |
| `AdminCoursesHub.tsx` | — | — | `process-scorm-upload` | `scorm_packages` |
| Certificate verify | `CertificateVerify.tsx` | — | `verify-certificate` | `certificates` |
| Certificate generate | `useCertificates.ts` | — | `generate-certificate` | `enrollments`, `certificates` |

### 3.4 Commerce / Shop

| Route/Page | Hook | Query | Edge Function | Tables |
|---|---|---|---|---|
| `/shop`, `/brand/*` | `useShopProducts`, `useShopCart`, `useShopOrders`, `useWishlist`, `useShopReviews` | Direct Supabase | — | `products`, `product_variants`, `cart_items`, `orders`, `order_items`, `wishlists`, `product_reviews` |
| `/checkout` (Checkout.tsx) | — | — | `shop-checkout` | `orders`, `order_items`, `discount_codes`, `shipping_methods` |
| Cart.tsx | — | — | `validate-discount` | `discount_codes` |
| Stripe product webhook | — | — | `shop-webhook` → calls `update-inventory` | `orders`, `order_items`, `products` |
| Subscription plans | `useSubscription` | `subscriptions` (TanStack Query) + realtime | `create-checkout`, `manage-subscription` | `subscriptions`, `user_profiles` |
| Stripe subscription webhook | — | — | `stripe-webhook`, `subscription-webhook` | `subscriptions`, `user_profiles` |

### 3.5 Auth

| Flow | Hook | Query | Edge Function | Tables |
|---|---|---|---|---|
| Sign in/up | `auth.tsx` (NEVER MODIFY) | `supabase.auth.*` | — | `auth.users`, `user_profiles` (trigger) |
| Mobile → Web handoff | — | — | `magic-link` | `auth.users` (admin API) |
| Session tracking | `auth.tsx` | Realtime auth state | — | `auth.users`, `user_profiles` |

### 3.6 Admin Hub

| Route/Page | Hook | Query | Edge Function | Tables |
|---|---|---|---|---|
| `/admin/api` (ApiDashboard) | — | — | `test-api-connection` | `api_registry` |
| `/admin/ingredients` (AdminIngredientsHub) | — | — | `open-beauty-facts-sync` | `ingredients` |
| `/admin/feeds` | `useDataFeedStats`, `useRssItems` | `market_signals`, `rss_items` | `feed-orchestrator` (manual trigger) | `data_feeds`, `market_signals`, `feed_run_log`, `rss_items` |
| Feature flags | `useFeatureFlag` | `feature_flags` (TanStack Query) | — | `feature_flags` |
| Edge fn controls | `useEdgeFunctionControls` | `edge_function_controls` | — | `edge_function_controls` |
| Audit logs | `useAuditLogs` | `audit_logs` | — | `audit_logs` |
| Platform stats | `usePlatformStats` | COUNT queries across `brands`, `market_signals`, `job_postings`, `events` | — | Multiple |

### 3.7 AI / Concierge

| Route/Page | Hook/Engine | Edge Function | External API | Tables |
|---|---|---|---|---|
| `AIAdvisor.tsx` | `aiConciergeEngine.ts` | `ai-orchestrator` | OpenRouter | `credit_ledger`, `ai_rate_limits` |
| `AIToolbar.tsx` | Direct invoke | `ai-orchestrator` | OpenRouter | `credit_ledger` |
| `useChatSession.ts` | Chat history state | `ai-concierge` → `ai-orchestrator` | OpenRouter | — |
| Vector search / semantic | `mappingEngine.ts` | `generate-embeddings` | OpenAI | `embedding_queue`, `retail_products`, `pro_products`, `canonical_protocols` |
| `useStudioSmartFill.ts` | Smart fill | — (direct DB) | — | `businesses`, `brands`, `market_signals` |

### 3.8 CMS

| Hook | Query | Tables |
|---|---|---|
| `useCmsPages`, `useCmsPageBlocks` | Direct Supabase | `cms_pages`, `cms_page_blocks`, `cms_block_types` |
| `useCmsPosts` | Direct Supabase | `cms_posts` |
| `useCmsBlocks` | Direct Supabase | `cms_block_library` |
| `useCmsTemplates` | Direct Supabase | `cms_templates` |
| `useCmsSpaces` | Direct Supabase | `cms_spaces` |
| `useCmsAssets` | Direct Supabase | `cms_assets` |
| `useIntelligencePosts`, `useEducationContent`, `useJobsContent`, `useMarketingPages`, `useSalesPlaybooks`, `useBrandsContent` | CMS views | `cms_posts` (by space) |

### 3.9 Ingredients

| Route/Page | Hook | Query | Edge Function | Tables |
|---|---|---|---|---|
| `/ingredients` | `useIngredients`, `useIngredientSearch`, `useIngredientDetail`, `useIngredientCollections` | Direct Supabase OR `ingredient-search` fn | `ingredient-search` | `ingredients`, `ingredient_aliases`, `ingredient_collections` |
| `/portal/ingredients` | `useProductIngredients` | Direct Supabase | — | `ingredients` |

### 3.10 Jobs & Events

| Route/Page | Hook | Query | Edge Function | Tables |
|---|---|---|---|---|
| `/jobs` | `useJobPostings` | `job_postings` + `market_signals` (intelligence cross-ref) | `jobs-search` | `job_postings`, `market_signals` |
| `/events` | `useEvents` | `events` | — | `events` |

---

## 4. Realtime Subscriptions

| Channel | Table | Filter | Consumer | Purpose |
|---|---|---|---|---|
| `intelligence-hub-signals` | `market_signals` | INSERT, UPDATE | `useIntelligence.ts:215` | Live signal feed refresh |
| `admin-intelligence-realtime` | `market_signals` | INSERT, UPDATE | `useAdminIntelligence.ts:153` | Admin dashboard signal count update |
| `subscription-changes` | `subscriptions` | UPDATE for current user | `useSubscription.ts:69` | Subscription tier sync |
| `module_access_${accountId}` | `account_module_access` | UPDATE for account | `ModuleAccessContext.tsx:77` | Module permission live update |
| `brand-thread-${activeConv.id}` | `messages` (brand) | INSERT | `Messages.tsx:269` | Real-time brand messaging |

---

## 5. pg_cron Scheduled Jobs

| Job Name | Schedule | Function | Purpose |
|---|---|---|---|
| `ingest-rss` | Every 5 min | `ingest-rss` | Fetch RSS feeds into rss_items |
| `rss-to-signals` | Scheduled (migration 20260309100001) | `rss-to-signals` | Promote rss_items → market_signals |
| `feed-orchestrator` | Hourly (migration 20260310000002) | `feed-orchestrator` | Central feed dispatcher |
| `open-beauty-facts-sync` | Set by owner post-initial-load | `open-beauty-facts-sync` | Paginated OBF sync continuation |

---

## 6. Database Tables Without Dedicated Hooks (consuming none or only edge functions)

| Table | Access Pattern | Gap |
|---|---|---|
| `api_registry` | Only via `test-api-connection` edge fn | No frontend hook; Admin UI reads via edge fn only |
| `live_data_feeds` | Only via `refresh-live-data` edge fn | No TanStack hook |
| `feed_run_log` | Read by Admin UI directly | No dedicated hook found in `src/lib/` |
| `feed_dlq` | No consuming hook found | Gap — no UI surfaces DLQ entries |
| `square_connections` | Only used by blocked Square edge fns | No frontend hook |
| `square_appointments_cache` | Only used by blocked Square edge fn | No frontend hook |
| `square_oauth_states` | Only used by blocked Square edge fn | Transient CSRF table |
| `market_stats` | Used by blocked Square edge fn only | No frontend hook |
| `embedding_queue` | Service role only via `generate-embeddings` | No frontend hook (by design) |
| `cms_versions` | Migration 20260313000010 — no hook found | Versioning not yet wired to Studio |
| `block_data_bindings` | Migration 20260313000011 — `DataBindingEngine.ts` (lib only) | No consuming TanStack hook |
| `brand_intelligence_report_jobs` | Migration 20260308213001 | No frontend hook found |
| `brand_automation_rules` / `brand_discount_campaigns` | Migration 20260308223001 | No frontend hooks |
| `crm_consent_log` | Migration 20260310000020 | No frontend hook found |
| `crm_churn_risk` | Migration 20260310000021 | No frontend hook found |
| `sales_signal_attribution` | Migration 20260310000030 | No frontend hook found |
| `signal_alerts` | Migration 20260310200001 — `useSignalAlerts.ts` | Hook exists but wiring to UI not confirmed |
| `calendar_oauth_states` | Transient — used only by `calendar-oauth-callback` edge fn | By design (CSRF token) |
| `notifications` | `useNotifications.ts` | Hook exists; wiring verified |
