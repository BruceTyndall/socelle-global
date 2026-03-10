# SOCELLE API UPDATE PACK
# Generated: 2026-03-10
# Mode: AUDIT + SPEC
# Source: Live repo scan — App.tsx, supabase/functions/*, src/lib/*, build_tracker.md
# Authority: This document is a read-only audit artifact. Changes require build_tracker.md WO.

---

## 1) EXEC SUMMARY

SOCELLE GLOBAL is a React 19 + Vite 6 SPA backed by Supabase (PostgreSQL + Edge Functions + Storage + Realtime). As of the date of this audit, the platform has completed BUILD 0, BUILD 1, BUILD 2, and BUILD 3 milestones. The following summarizes the current API and integration posture:

**Total Edge Functions:** 33 (including 2 blocked/undeployed: `square-appointments-sync`, `square-oauth-callback`)

**External API providers in active use:**
- OpenRouter (single LLM gateway — ai-orchestrator, ai-concierge)
- Stripe (subscriptions via create-checkout, manage-subscription, stripe-webhook, subscription-webhook; product checkout via shop-checkout, shop-webhook)
- Resend (transactional email via send-email)
- Google OAuth + Calendar API (calendar-oauth-callback, calendar-create-event)
- Microsoft OAuth + Graph API (calendar-oauth-callback, calendar-create-event)
- OpenFDA (ingest-openfda — public, no key)
- CMS NPPES NPI Registry (ingest-npi — public, no key)
- Open Beauty Facts (open-beauty-facts-sync — public, no key)
- OpenAI (generate-embeddings — text-embedding-ada-002; CURRENTLY BLOCKED: OPENAI_API_KEY not set)
- Square (square-oauth-callback, square-appointments-sync — BLOCKED per governance decision W11-13)

**Realtime usage:** 2 active subscriptions — market_signals INSERT (useIntelligence.ts), useSubscription.ts channel

**Storage buckets in use:** `certificates`, `scorm-packages`, `media` (via useCmsAssets.ts, AdminMediaHub.tsx, BrandAdminEditor.tsx)

**Intelligence wiring status:** useIntelligence hook is LIVE (market_signals table, TanStack Query, realtime). 8 page files call useIntelligence directly. 47 files reference market_signals (many are analysis/service layers, not direct DB calls).

**Feature flag system:** LIVE — feature_flags table + useFeatureFlag hook. 3 files use it. Edge functions use edge_function_controls table via _shared/edgeControl.ts (kill-switch pattern).

**Critical gaps (P0):**
1. OPENAI_API_KEY not configured — generate-embeddings is deployed but non-functional. EMBED-01 WO marked complete but embeddings cannot be generated in production.
2. Square integration is governance-blocked (W11-13) — square_oauth_states, square_connections tables exist in schema but functions are not deployed.
3. Stripe stripe_price_id = null on subscription plans — PAY-WO-05 partial; Stripe checkout will fail without price IDs configured in Stripe Dashboard.
4. RESEND_API_KEY status: UNKNOWN — send-email will silently fail (logs warning, does not throw) if not set.
5. database.types.ts at 109 tables as of last regen; 74 migrations were pending push at P0-03 time — types may have drifted again after BUILD 2 additions.

---

## 2) API REGISTRY (MASTER TABLE)

| API / System | Provider | Category | Where Configured | Primary Code Touchpoints | Data Touched | Used By Routes | Status | Risk | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Supabase Auth | Supabase | Auth | VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY | src/lib/auth.tsx, src/lib/supabase.ts, all ProtectedRoute | auth.users, user_profiles | All portal routes | LIVE | LOW | JWT via GoTrue. Admin hardening migration in place. |
| Supabase DB | Supabase | Database | VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY | 46 .tsx files, 20+ lib files | 109+ tables | All portals | LIVE | LOW | RLS on all tables per policy. |
| Supabase Realtime | Supabase | Realtime | VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY | useIntelligence.ts, useSubscription.ts | market_signals, tenant_subscriptions | /intelligence, /portal/intelligence | LIVE | LOW | 2 channels. market_signals INSERT fires slide-in animation. |
| Supabase Storage | Supabase | Storage | VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY | AdminMediaHub.tsx, BrandAdminEditor.tsx, useCmsAssets.ts | certificates bucket, scorm-packages bucket, media bucket | /admin/cms/media, /brand/*, /education/* | LIVE | LOW | 3 buckets confirmed. |
| OpenRouter | OpenRouter | AI / LLM | OPENROUTER_API_KEY (Supabase secret) | supabase/functions/ai-orchestrator, supabase/functions/ai-concierge | audit_log, tenant_balances, credit_ledger | /portal/intelligence, AI Toolbar, AI Concierge | LIVE | HIGH | Single gateway for all 4 AI tiers. Key rotation = all AI down. Credit deduction before each call. |
| OpenAI Embeddings | OpenAI | AI / Embeddings | OPENAI_API_KEY (Supabase secret) | supabase/functions/generate-embeddings | embedding_queue, retail_products, pro_products, canonical_protocols | /search, /admin/seeding | BLOCKED | HIGH | EMBED-01 complete but OPENAI_API_KEY not set in production. Embeddings non-functional. |
| Stripe (Subscriptions) | Stripe | Payments | STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET (Supabase secrets); VITE_STRIPE_PUBLISHABLE_KEY (frontend) | create-checkout, manage-subscription, stripe-webhook, subscription-webhook, Checkout.tsx | tenant_subscriptions, tenant_balances, user_profiles | /plans, /portal/subscription, /pricing | PARTIAL | HIGH | stripe_price_id = null on plans (PAY-WO-05 partial). Webhooks deployed but will fail without price IDs. |
| Stripe (Products/Checkout) | Stripe | Payments | STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET + SHOP_WEBHOOK_SECRET (Supabase secrets) | shop-checkout, shop-webhook, update-inventory, validate-discount | orders, order_items, products, variants, discount_codes | /shop/checkout, /cart, /checkout | PARTIAL | HIGH | PaymentIntent flow wired. No Stripe product IDs seeded for shop products confirmed. |
| Resend | Resend | Email | RESEND_API_KEY + FROM_EMAIL (Supabase secrets) | send-email | orders (for order_status), access_requests | /portal/*, /brand/*, /admin/* (triggered) | UNKNOWN | MEDIUM | send-email silently no-ops if RESEND_API_KEY missing. Status of key in production: UNKNOWN. Verify with supabase secrets list. |
| Google OAuth + Calendar | Google | Calendar | VITE_GOOGLE_OAUTH_CLIENT_ID (frontend); GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REDIRECT_URI (Supabase secrets) | calendar-oauth-callback, calendar-create-event, CrmTasks.tsx | calendar_connections, calendar_oauth_states, crm_tasks | /portal/crm/tasks | LIVE | MEDIUM | OAuth PKCE flow. Tokens stored in calendar_connections. Refresh token rotation handled in calendar-create-event. |
| Microsoft OAuth + Graph | Microsoft | Calendar | VITE_MICROSOFT_OAUTH_CLIENT_ID (frontend); MICROSOFT_OAUTH_CLIENT_SECRET, MICROSOFT_OAUTH_REDIRECT_URI (Supabase secrets) | calendar-oauth-callback, calendar-create-event, CrmTasks.tsx | calendar_connections, calendar_oauth_states, crm_tasks | /portal/crm/tasks | LIVE | MEDIUM | Same callback function handles Google + Microsoft. |
| OpenFDA | FDA / Public | Data Ingestion | No key required | ingest-openfda | market_signals | Admin-triggered | LIVE | LOW | Public domain. 240 req/min limit. Inserts regulatory_alert signals. |
| CMS NPPES NPI Registry | CMS / Public | Data Ingestion | No key required | ingest-npi | businesses (npi_verified, npi_verified_at), market_signals (via trigger) | Admin-triggered | LIVE | LOW | ~120 req/min. Trigger emits market signal on NPI verification. |
| Open Beauty Facts | OBF / Public | Data Ingestion | No key required | open-beauty-facts-sync | ingredients | Admin-triggered | LIVE | LOW | ODbL license. Page-by-page pagination. 2,950 rows ingested at last count. |
| Square Appointments | Square | Bookings / Data | SQUARE_APPLICATION_ID + SQUARE_APPLICATION_SECRET (Supabase secrets) | square-appointments-sync, square-oauth-callback | square_connections, square_appointments_cache, market_stats | /portal/integrations (planned) | BLOCKED | HIGH | W11-13 governance block. Tokens must use Supabase Vault before deployment. DO NOT DEPLOY. |
| VAPID / Web Push | Browser Push | Notifications | VITE_VAPID_PUBLIC_KEY (frontend); VAPID_PRIVATE_KEY (Supabase secret, implied) | PWAInstallPrompt.tsx, sw.js | (browser push subscription — no DB table confirmed) | All pages (PWA) | PARTIAL | LOW | PWA manifest + sw.js wired. Push subscription opt-in implemented. Server-side VAPID sending not confirmed in edge functions. |
| Supabase pg_cron | PostgreSQL | Scheduling | Via Supabase SQL migrations | feed-orchestrator, ingest-rss, open-beauty-facts-sync | data_feeds, rss_items, market_signals, feed_run_log | Server-side only | LIVE | LOW | Hourly schedule for feed-orchestrator. 5-min schedule for ingest-rss (per function comment). |

---

## 3) EDGE FUNCTION INVENTORY

| Function Name | Purpose | Auth | Inputs | Outputs | Tables Touched | Called By | Rate Limits | Credit Gate | Kill Switch | Status | Gaps |
|---|---|---|---|---|---|---|---|---|---|---|---|
| ai-orchestrator | Single LLM gateway. Routes tasks to 4 model tiers via OpenRouter. Deducts credits before each call. | JWT (required) | task_type, messages[], context? | { response: string, model, tokens_used, credits_deducted } | audit_log, tenant_balances (deduct_credits RPC), credit_ledger | ai-concierge (forwarding), AIToolbar, BriefGenerator, ActionPlanGenerator, etc. | OpenRouter rate limits (per model) | YES — deduct_credits RPC, returns 402 if insufficient | YES — edge_function_controls | LIVE | credit_ledger vs tenant_balances inconsistency: useCreditBalance was fixed to use tenant_balances but confirm ai-orchestrator calls same RPC. |
| ai-concierge | Thin adapter: maps 5 concierge modes (discovery, protocol, retail, analytics, support) → chat_concierge task type → ai-orchestrator. | JWT (required) | question, retrievedData, mode, userRole, contextPage, conversationHistory? | Forwarded response from ai-orchestrator | (reads via ai-orchestrator) | AIAdvisor.tsx, BrandAIAdvisor.tsx | Inherited from ai-orchestrator | YES (via ai-orchestrator) | YES — edge_function_controls | LIVE | Stable public endpoint. No direct DB writes. |
| calendar-create-event | Creates Google or Microsoft calendar events for CRM tasks. Refreshes expired OAuth tokens automatically. | JWT (required) | provider, title, starts_at, duration_minutes?, notes?, attendee_email?, timezone?, location? | { event_id, event_url, provider } | calendar_connections (reads tokens, updates on refresh), crm_tasks (read) | CrmTasks.tsx (POST on save task) | Google: 1M req/day. Microsoft: 10k req/10sec | NO | YES — edge_function_controls | LIVE | No explicit feature flag check (uses checkFlag import but not observed in HEAD snippet). Verify token vault security — tokens stored plaintext in calendar_connections. |
| calendar-oauth-callback | OAuth 2.0 callback handler for Google and Microsoft calendar connections. Exchanges code for tokens, upserts connection. | None (public redirect) | code, state (query params) | HTTP redirect to /portal/crm/tasks | calendar_oauth_states (delete after use), calendar_connections (upsert) | Google/Microsoft OAuth redirect | N/A | NO | YES — edge_function_controls | LIVE | Tokens stored plaintext in calendar_connections. Supabase Vault migration recommended before prod launch. |
| create-checkout | Creates a Stripe Checkout Session for subscription plans. | JWT (required) | { plan_id, return_url } | { checkout_url } | user_profiles (read), tenant_subscriptions (upsert) | Pricing pages, Plans pages | Stripe API limits | NO | YES — edge_function_controls | PARTIAL | stripe_price_id = null on plans — checkout will fail until Stripe Dashboard configured and price IDs seeded. |
| feed-orchestrator | Central dispatcher for data_feeds ingestion. Routes by feed_type (rss, api). Classifies topic + computes impact_score. Logs to feed_run_log. Writes DLQ on failure. | JWT (admin-required) | { category?, feed_ids?, dry_run? } | { processed, signals_created, errors } | data_feeds (read), market_signals (upsert), feed_run_log (insert), feed_dlq (insert on error) | pg_cron hourly, AdminFeedsHub.tsx (manual trigger) | 15s timeout per feed fetch | NO | YES — edge_function_controls | LIVE | 17 feeds disabled (paywall/bot-blocked). 18 feeds healthy. Manual trigger available in admin. |
| generate-certificate | Generates PDF-style HTML certificate for completed course enrollments. Uploads to Supabase Storage. | JWT (required, must own enrollment) | { enrollment_id } | { certificate_id, certificate_url, certificate_number } | course_enrollments (read+update), certificates (insert), storage: certificates bucket | EduCoursePlayer.tsx, generate-certificate button | N/A | NO | YES — edge_function_controls | LIVE | Certificate number uses Math.random() — not cryptographically unique. Low risk but worth noting. |
| generate-embeddings | Two modes: (1) single text embedding query; (2) batch worker — polls embedding_queue, generates + stores vector embeddings. | None (mode 1 for search queries); Service role (mode 2) | { text: string } OR { batch: true, limit?: number } | { embedding: number[] } OR { processed, errors } | embedding_queue (read+update), retail_products, pro_products, canonical_protocols (update embedding columns) | SearchPage.tsx (mode 1), pg_cron batch (mode 2 — UNKNOWN if scheduled) | OpenAI: 3000 RPM tier 1 | NO | YES — edge_function_controls | BLOCKED | OPENAI_API_KEY not set in production. All embedding generation non-functional. EMBED-01 marked complete but key missing. |
| ingest-npi | Verifies operator NPI number against NPPES Registry. Updates businesses table. DB trigger emits market_signals row on success. | Service role (implicit — no JWT validation in function) | { business_id: uuid } | { verified: boolean, npi_data } | businesses (npi_verified, npi_verified_at, npi_number), market_signals (via DB trigger) | Admin-triggered, business onboarding (UNKNOWN if wired to UI) | ~120 req/min | NO | YES — inlined edgeControl | LIVE | edgeControl inlined (not imported from _shared). No JWT auth — relies on service role key check. Should add JWT validation for operator self-verification flow. |
| ingest-openfda | Pulls FDA cosmetics recalls + aesthetic device adverse events from OpenFDA. Inserts as market_signals rows. | Service role (implicit) | {} (no params) | { inserted, skipped } | market_signals (upsert on source_type+external_id) | Admin-triggered, pg_cron (UNKNOWN if scheduled) | 240 req/min | NO | YES — inlined edgeControl | LIVE | 51 FDA signals inserted at last count. No pg_cron schedule confirmed — manual trigger only currently. |
| ingest-rss | Fetches RSS 2.0 / Atom feeds from rss_sources. Deduplicates by (source_id, guid). Upserts into rss_items. | None (bare deployment) | { batch_size?: number, source_ids?: string[] } | { processed, inserted, errors } | rss_sources (read), rss_items (upsert) | pg_cron every 5 min | 12s timeout per feed | NO | YES — edge_function_controls | LIVE | Rotates sources by last_fetched_at. Parallel to feed-orchestrator (different table: rss_items vs market_signals). |
| ingredient-search | Full-text search on ingredients + ingredient_aliases tables. Public access. Supports skin_type, vegan, max_ewg filters. | None (public) | ?q=, ?limit=, ?skin_type=, ?vegan=, ?max_ewg= | { ingredients: IngredientRow[] } | ingredients (read), ingredient_aliases (read) | Ingredients.tsx, IngredientDetail.tsx, IngredientCollection.tsx | N/A | NO | YES — edge_function_controls | LIVE | Trending ingredients (no query) sorted by trending_score. |
| intelligence-briefing | Returns live market_signals + MarketPulse. Filters by category/limit. Cache-Control: 60s. | None (public) | ?category=, ?limit= | { signals: IntelligenceSignal[], pulse: MarketPulse } | market_signals (read), brands (read), businesses (read) | IntelligenceBriefs.tsx, IntelligenceBriefDetail.tsx (UNKNOWN if wired) | N/A | YES — edge_function_controls | LIVE | Parallel to useIntelligence hook. Confirm which pages use hook vs edge function. |
| jobs-search | Filtered, paginated job search. Cache-Control: 120s. | None (public) | ?vertical=, ?type=, ?q=, ?featured=, ?page=, ?limit= | { jobs: DbJobPosting[], total, page, pages } | job_postings (read, status=active) | Jobs.tsx, JobDetail.tsx, jobs-search edge fn | N/A | NO | YES — edge_function_controls | LIVE | Jobs.tsx may use hook (useJobPostings.ts) OR edge function — confirm which path is active. |
| magic-link | Issues Supabase magic link for mobile app graduated funnel. Validates origin against allowlist. | None (origin-validated) | { email, redirectTo? } | { magicLinkToken, expiresAt } | (Supabase auth API — no direct table reads) | Mobile app (Flutter) deep-link upgrade flow | N/A | NO | YES — edge_function_controls | LIVE | Allowlist: app.socelle.com + localhost:5173. Any new origin requires code change. |
| manage-subscription | Handles subscription lifecycle: create, cancel, upgrade, downgrade, add/remove addons. | JWT (required) | { action, plan_slug?, addon_slug?, billing_cycle? } | { subscription: StripeSubscription } | user_profiles, tenant_subscriptions, plans, addons | SubscriptionManagement.tsx, Pricing.tsx | Stripe limits | NO | YES — edge_function_controls | PARTIAL | Same price_id gap as create-checkout. Also: addon tables not confirmed in schema. |
| open-beauty-facts-sync | Fetches 100 products/page from Open Beauty Facts API. Extracts INCI names → ingredients table. Paginated, iterative. | Service role (implicit) | { page: 1 } | { inserted, skipped, next_page } | ingredients (upsert on inci_name) | Admin-triggered, pg_cron (UNKNOWN if scheduled) | No rate limit documented (OBF is open) | NO | YES — inlined edgeControl | LIVE | edgeControl inlined. 2,950 rows at last count. Safety scores (CAS, CosIng) pending future enrichment WOs. |
| process-scorm-upload | Accepts SCORM ZIP, stores in Storage, parses imsmanifest.xml, updates scorm_packages record. | JWT (admin only) | multipart/form-data: file (ZIP), scorm_package_id (uuid) | { scorm_package_id, launch_url, title, version } | scorm_packages (update) | AdminCourseEditor.tsx | Upload size limit: Supabase default (50MB) | NO | YES — edge_function_controls | LIVE | Uses deno.land/x/zipjs. scorm_packages table confirmed in schema. |
| refresh-live-data | Refreshes live_data_feeds table entries. Fetches source_url, updates data_payload, last_refreshed_at. Admin/service only. | JWT (admin/super_admin) OR service_role key | ?feed_name= OR ?feed_key= | { success, feed_key, refreshed_at } | live_data_feeds (read+update) | AdminLiveDataHub.tsx, pg_cron (UNKNOWN) | N/A | NO | YES — edge_function_controls | LIVE | Different table from data_feeds (feed pipeline). live_data_feeds = admin health check feeds. |
| rss-to-signals | Promotes qualifying rss_items (confidence_score >= 0.50) to market_signals. Applies topic classification + impact scoring. | None (GET or POST) | { limit?: number } | { promoted, skipped } | rss_items (read), rss_sources (read), market_signals (upsert on source_type+external_id) | pg_cron (schedule UNKNOWN), AdminFeedsHub.tsx | N/A | NO | YES — edge_function_controls | LIVE | INTEL-MEDSPA-01 enhancements: vertical, tier_min, topic, impact_score derived from rss_sources. |
| scorm-runtime | SCORM 1.2/2004 runtime API. Handles Initialize, GetValue, SetValue, Commit, Finish commands. | JWT (required) | { command, element?, value?, scorm_package_id, enrollment_id } | { result, value? } | scorm_tracking (read+write), course_enrollments (update on completion) | EduCoursePlayer.tsx (SCORM iframe postMessage bridge) | N/A | NO | YES — edge_function_controls | LIVE | Maps CMI element names to scorm_tracking columns. |
| send-email | Transactional email via Resend. Types: welcome, plan_complete, order_status, new_order, access_request. | None (public endpoint — caller must validate) | { type, to?, data? } | { sent: boolean } | orders (read for order_status), access_requests (UNKNOWN if read) | Various triggers: signup, plan completion, order state changes | Resend limits (100 req/s) | NO | YES — edge_function_controls | UNKNOWN | Silently no-ops if RESEND_API_KEY missing. No auth on endpoint — rate limit abuse risk. Confirm FROM_EMAIL is set. |
| shop-checkout | Creates Stripe PaymentIntent for product checkout (not subscription). | JWT (required) | { cart_id, shipping_method_id, discount_code?, shipping_address, billing_address } | { client_secret, order_id, order_number } | carts, cart_items, orders, order_items, products, discount_codes | ShopCheckout.tsx | Stripe limits | NO | YES — edge_function_controls | LIVE | Parallel to create-checkout (products vs subscriptions). |
| shop-webhook | Stripe webhook for product checkout. Handles payment_intent.succeeded/failed, charge.refunded. HMAC verified. | Stripe signature (not JWT) | Raw Stripe event body | HTTP 200 | orders (update status), order_items (read), products/variants (via update-inventory) | Stripe webhook delivery | N/A | NO | YES — edge_function_controls | LIVE | Calls update-inventory as internal service-role call after payment success. |
| sitemap-generator | Dynamic XML sitemap generation. Routes by ?type= (static, brands, protocols, jobs). | None (public) | ?type= query param | application/xml | brands (slug, updated_at), canonical_protocols (slug, updated_at), job_postings (slug, updated_at) | Public sitemap consumers, AdminApiSitemapHub.tsx | Cache-Control: 1hr | NO | YES — edge_function_controls | LIVE | events not included in sitemap. IntelligenceBriefs/blog posts not included. Gap. |
| square-appointments-sync | Syncs Square appointment data to square_appointments_cache. Generates market_stats pricing signals. | JWT (admin) + Square OAuth token | { batch_size?, connection_ids?, lookback_days? } | { synced, signals_created } | square_connections (read), square_appointments_cache (upsert), market_stats (upsert) | Intended: pg_cron every 4h | N/A | NO | YES — edge_function_controls | BLOCKED | W11-13 governance block. DO NOT DEPLOY. Tokens must use Supabase Vault first. |
| square-oauth-callback | Square OAuth 2.0 callback. Exchanges code for tokens, upserts square_connections. | None (redirect) | code, state (query params) | HTTP redirect | square_oauth_states (delete), square_connections (upsert) | Square OAuth redirect | N/A | NO | YES — edge_function_controls | BLOCKED | W11-13 governance block. DO NOT DEPLOY. |
| stripe-webhook | Stripe webhook for subscriptions. Events: checkout.session.completed, customer.subscription.updated/deleted, invoice.payment_failed. HMAC verified. | Stripe signature (not JWT) | Raw Stripe event body | HTTP 200 | tenant_subscriptions (upsert), user_profiles (update stripe_customer_id) | Stripe webhook delivery | N/A | NO | YES — edge_function_controls | LIVE | HMAC implemented in pure crypto.subtle (no Stripe SDK). Verify secret is set in Stripe Dashboard. |
| subscription-webhook | Alternative Stripe subscription webhook using Stripe SDK (Stripe npm). Mirrors stripe-webhook functionality. | Stripe signature (Stripe SDK verify) | Raw Stripe event body | HTTP 200 | tenant_subscriptions, user_profiles | Stripe webhook delivery | N/A | NO | YES — edge_function_controls | LIVE | Two webhook functions for subscriptions (stripe-webhook + subscription-webhook) — potential duplicate event processing risk. Owner decision needed on which is canonical. |
| test-api-connection | Pings an API registry entry by UUID. Records latency + HTTP status. Writes to api_registry. Admin only. | JWT (admin or platform_admin) | { registry_id: uuid } OR ?api_registry_id= | { latency_ms, status_code, success } | api_registry (read name/base_url, write last_tested_at/last_test_status/last_test_latency_ms) | AdminApiDashboard.tsx, ApiStatusRibbon.tsx | 5s ping timeout | NO | YES — edge_function_controls | LIVE | NEVER reads api_key_encrypted. 3 timeouts on Google Trends, NPI Registry, OpenFDA in last test run. |
| update-inventory | Decrements product/variant stock_quantity based on order items. Service-role-only internal call. | Service role key (not JWT) | { order_id } | { updated: number } | order_items (read), products (update stock_quantity), variants (update stock_quantity) | shop-webhook (internal) | N/A | NO | YES — edge_function_controls | LIVE | Skips products with track_inventory = false. Not directly callable from frontend. |
| validate-discount | Validates a discount code. Public endpoint for cart UX. | None (public) | { code, cart_subtotal_cents } | { valid, discount_amount_cents?, type?, message } | discount_codes (read) | ShopCart.tsx (via VITE_SUPABASE_URL + /functions/v1/validate-discount) | N/A | NO | YES — edge_function_controls | LIVE | Public — no rate limiting in function. Could be abused for code enumeration. |
| verify-certificate | Public certificate verification by token. Returns course name, holder name, issue date. No PII beyond name. | None (public) | ?token= | { valid, certificate: { holder_name, course_name, issued_at, certificate_number } } | certificates (read by verification_token) | CertificateVerify.tsx | N/A | NO | YES — edge_function_controls | LIVE | Intentionally public for third-party verification. |

---

## 4) ROUTE → DATA → API MAP

Routes extracted from src/App.tsx. LIVE/DEMO/SHELL status based on build_tracker.md audit + grep evidence.

### A — Public Routes

| Route | Page | User Types | Gating | What It Displays | Data Sources | APIs Used | LIVE/DEMO/SHELL | Merchandising Opportunity |
|---|---|---|---|---|---|---|---|---|
| / | Home.tsx | All | PrelaunchGuard (VITE_PRELAUNCH_MODE) | Intelligence pulse, platform stats, featured brands | market_signals (partial), hardcoded stats | useIntelligence (partial) | DEMO (pulse numbers hardcoded) | Add live signal count from market_signals.count(). usePlatformStats.ts partially wired. |
| /intelligence | Intelligence.tsx | All | None | Market signals feed, filters, signal detail panel | market_signals via useIntelligence | useIntelligence hook (LIVE) | LIVE | ApiStatusRibbon present. Upsell to /portal/intelligence for full access. |
| /intelligence/home | IntelligenceHome.tsx | All | None | Intelligence landing / overview | market_signals via useIntelligence | useIntelligence hook | LIVE | Conversion funnel entry. CTA to Request Access. |
| /intelligence/briefs | IntelligenceBriefs.tsx | All | None | Published intelligence briefs from CMS | cms_posts (status=published) | useIntelligence hook (also) | LIVE | Free preview → gated full content for subscribers. |
| /intelligence/briefs/:slug | IntelligenceBriefDetail.tsx | All | None | Single brief detail | cms_posts | useIntelligence hook | LIVE | Inline upsell: "Get the full signal data →" |
| /intelligence/commerce | IntelligenceCommerce.tsx | All | None | Commerce-linked intelligence signals | market_signals | useIntelligence hook | LIVE (LIVE/DEMO badge present — P0-02 resolved) | Affiliate product recommendations tied to signals. |
| /brands | Brands.tsx | All | None | Active brand directory | brands table (status=active), market_signals (signal badges) | Direct supabase.from, useIntelligence | LIVE | Brand tier upsell: verified badge, intelligence score. |
| /brands/:slug | BrandStorefront.tsx | All | None | Brand profile, products, protocols, signals | brands, brand_seed_content, products, canonical_protocols, market_signals | Direct supabase.from | LIVE | "Claim this brand" CTA → claim flow. |
| /education | Education.tsx | All | None | Education hub: courses, modules | brand_training_modules, courses | Direct supabase.from | LIVE | CE credit upsell for Pro subscribers. |
| /courses | CoursesCatalog.tsx | All | None | Course catalog | courses | TanStack Query (UNKNOWN if wired) | UNKNOWN — verify | Enrollment CTA. Free preview → paywall for CE credit. |
| /courses/:slug | CourseDetail.tsx | All | None | Course detail + enrollment | courses, course_enrollments | TanStack Query (UNKNOWN) | UNKNOWN — verify | Enrollment conversion. |
| /courses/:slug/player | CoursePlayer.tsx | Auth (implied) | ProtectedRoute? | SCORM course player | scorm_tracking, scorm_packages | scorm-runtime edge function | LIVE (shell states added per QuizPlayer-states WO) | Completion → generate-certificate |
| /protocols | Protocols.tsx | All | None | Treatment protocols directory | canonical_protocols | Direct supabase.from (UNKNOWN if TanStack) | UNKNOWN — verify | Protocol intelligence linking to market_signals. |
| /protocols/:slug | ProtocolDetail.tsx | All | None | Protocol detail | canonical_protocols | Direct supabase.from | UNKNOWN — verify | Signal correlation display. |
| /ingredients | Ingredients.tsx | All | None | Ingredient directory + search | ingredients | ingredient-search edge function | LIVE | Formulary builder upsell for Pro. |
| /ingredients/:id | IngredientDetail.tsx | All | None | Single ingredient detail | ingredients, ingredient_aliases | ingredient-search, direct supabase | LIVE | Safety score prominence → formulary builder CTA. |
| /ingredients/collections/:slug | IngredientCollection.tsx | All | None | Curated ingredient collection | ingredient_collections, ingredients | TanStack Query (UNKNOWN) | UNKNOWN — verify | |
| /jobs | Jobs.tsx | All | None | Job board | job_postings | jobs-search edge fn OR useJobPostings hook | LIVE (events crash fix applied, Jobs similar) | Featured listing upsell for employers. |
| /jobs/:slug | JobDetail.tsx | All | None | Single job detail | job_postings | TanStack Query | LIVE | Apply CTA. |
| /events | Events.tsx | All | None | Events directory | events table | useEvents.ts hook (TanStack Query) | LIVE (partial — WO EVT-WO-01 partial) | Ticketing upsell. |
| /professionals | Professionals.tsx | All | None | Professionals directory | user_profiles (professionals) | Direct supabase.from | DEMO (hardcoded STATS) | NPI verification badge upsell. |
| /professionals/:id | ProfessionalDetail.tsx | All | None | Professional profile | user_profiles | TanStack Query (UNKNOWN) | UNKNOWN — verify | |
| /for-brands | ForBrands.tsx | All | None | Brand pitch page | Hardcoded STATS | None | DEMO | Wire to live brand_count, avg_leads data from DB. |
| /for-medspas | ForMedspas.tsx | All | None | Medspa pitch page | Hardcoded content | None | DEMO | |
| /for-salons | ForSalons.tsx | All | None | Salon pitch page | Hardcoded content | None | DEMO | |
| /plans | Plans.tsx | All | None | Pricing plans | Hardcoded TIERS, COMPARISON | None | DEMO | Wire to plans table + live subscriber counts. Stripe checkout CTA. |
| /pricing | Pricing.tsx | All | None | Subscription pricing | plans table + Stripe | manage-subscription | PARTIAL | Full pricing table with feature comparison. |
| /search | SearchPage.tsx | All | None | Site-wide search | brands, products, searchService | generate-embeddings (vector search) | PARTIAL (SEARCH-WO-02/03 partial) | Premium semantic search for Pro tier. |
| /intelligence/map | (IntelligenceHome map view) | All | None | Geographic intelligence | market_signals | useIntelligence | UNKNOWN | |
| /stories | StoriesIndex.tsx | All | None | Case studies / stories | cms_posts (type=story?) | TanStack Query | UNKNOWN — verify | |
| /stories/:slug | StoryDetail.tsx | All | None | Single story | cms_posts | TanStack Query | UNKNOWN — verify | |
| /blog | BlogListPage.tsx | All | None | Blog listing | cms_posts (type=blog, status=published) | useCmsPosts hook | LIVE | SEO surface. Intelligence signal cross-links. |
| /blog/:slug | BlogPostPage.tsx | All | None | Single blog post | cms_posts via PageRenderer | PageRenderer + useCmsPage | LIVE | Content → intelligence CTA. |
| /help | HelpCenter.tsx | All | None | Help center | cms_pages (space=help, status=published) | PageRenderer | LIVE | |
| /help/:slug | CmsHelpRoute (PageRenderer) | All | None | Help article | cms_pages | PageRenderer | LIVE | |
| /p/:slug | CmsPageRoute (PageRenderer) | All | None | CMS-managed public page | cms_pages | PageRenderer | LIVE | |
| /request-access | RequestAccess.tsx | All | None | Access request form | access_requests (insert) | send-email (access_request type) | LIVE | Primary acquisition funnel. |
| /about, /faq, /how-it-works, /terms, /privacy | Static pages | All | None | Static content | None | None | LIVE (static) | |
| /api-docs | ApiDocs.tsx | All | None | Enterprise API documentation | Hardcoded or CMS | UNKNOWN | SHELL | Wire to api_registry or CMS content. |
| /api-pricing | ApiPricing.tsx | All | None | Enterprise API pricing | Hardcoded | None | SHELL | Wire to plans + Stripe. |
| /certificates/verify | CertificateVerify.tsx | All | None | Certificate verification | certificates | verify-certificate edge fn | LIVE | |
| /shop | Shop.tsx | All | None | Product shop | products, categories | Direct supabase.from | LIVE | Commerce is module — not primary nav. |
| /shop/category/:slug | ShopCategory.tsx | All | None | Shop category | products (by category) | Direct supabase.from | LIVE | |
| /shop/product/:id | ShopProduct.tsx | Auth (implied) | None | Product detail + add to cart | products, variants | Direct supabase.from | LIVE | Affiliate badge (COMMERCE-WO-03) |
| /shop/cart | ShopCart.tsx | Auth (implied) | None | Cart + discount code | carts, cart_items | validate-discount edge fn | LIVE | |
| /shop/checkout | ShopCheckout.tsx | Auth (required) | ProtectedRoute | Checkout form + Stripe | orders | shop-checkout edge fn | LIVE | |
| /cart | Cart.tsx | Auth (implied) | None | Legacy cart | carts, cart_items | useCart | LIVE (NEVER MODIFY) | |
| /checkout | Checkout.tsx | Auth (implied) | None | Legacy checkout | orders | VITE_STRIPE_PUBLISHABLE_KEY | LIVE (NEVER MODIFY) | |
| /booking/:businessId | BookingWidget.tsx | All | None | Public booking widget | appointments, services | Direct supabase.from | LIVE | Square integration future (W11-13 blocked). |

### B — Business Portal Routes

| Route | Page | User Types | Gating | What It Displays | Data Sources | APIs Used | LIVE/DEMO/SHELL | Merchandising Opportunity |
|---|---|---|---|---|---|---|---|---|
| /portal/dashboard | Dashboard.tsx | business_user | ProtectedRoute | KPI strip, recent orders, signals summary | Multiple tables via TanStack Query | useIntelligence | LIVE | Churn risk signal → rebooking CTA. |
| /portal/intelligence | IntelligenceHub.tsx | business_user | ProtectedRoute + ModuleRoute | Full intelligence feed, AI toolbar, signal filters | market_signals + ai-orchestrator tools | useIntelligence + CreditGate | LIVE | CreditGate on 6 AI tools. Upgrade prompt for depleted credits. |
| /portal/ai-advisor | AIAdvisor.tsx | business_user | ProtectedRoute | AI concierge chat | market_signals | ai-concierge → ai-orchestrator | LIVE | Credit metering visible. |
| /portal/crm | CrmDashboard.tsx | business_user | ProtectedRoute | CRM today view: contacts, tasks, churn risk | crm_contacts, crm_tasks, market_signals | TanStack Query, useIntelligence | LIVE | Rebooking risk badge → booking CTA. |
| /portal/crm/contacts | ContactList.tsx | business_user | ProtectedRoute | Contact list with churn_risk_score | crm_contacts | TanStack Query | LIVE | |
| /portal/crm/contacts/:id | ContactDetail.tsx | business_user | ProtectedRoute | Contact detail with intelligence tab | crm_contacts, market_signals, signal_id FK | TanStack Query | LIVE | Signal-linked rebooking suggestion. |
| /portal/crm/tasks | CrmTasks.tsx | business_user | ProtectedRoute | Tasks with Google/Microsoft calendar sync | crm_tasks, calendar_connections | calendar-create-event, calendar-oauth-callback | LIVE | |
| /portal/crm/consent | CrmConsent.tsx | business_user | ProtectedRoute | GDPR/consent audit log | crm_consent_log | TanStack Query | LIVE | |
| /portal/crm/segments | CrmSegments.tsx | business_user | ProtectedRoute | Contact segments | crm_segments | TanStack Query | LIVE | |
| /portal/booking | BookingDashboard.tsx | business_user | ProtectedRoute | Appointment overview + rebooking | appointments, crm_contacts | TanStack Query | LIVE | |
| /portal/booking/calendar | AppointmentCalendar.tsx | business_user | ProtectedRoute | Calendar view | appointments | TanStack Query | LIVE | |
| /portal/sales | BusinessSalesDashboard.tsx | business_user | ProtectedRoute | Sales pipeline overview | deals, opportunities | TanStack Query | LIVE | |
| /portal/sales/pipeline | BusinessPipelineBoard.tsx | business_user | ProtectedRoute | Kanban pipeline | deals | TanStack Query | LIVE | |
| /portal/sales/deals/:id | BusinessDealDetail.tsx | business_user | ProtectedRoute | Deal detail with signal attribution | deals, market_signals (signal_id FK) | TanStack Query | LIVE | |
| /portal/plans | PlansList.tsx | business_user | ProtectedRoute | Saved plans list | plans | TanStack Query | LIVE | |
| /portal/plans/wizard | PlanWizard.tsx | business_user | ProtectedRoute + ModuleRoute | Multi-step plan wizard | products, protocols, businesses | TanStack Query | LIVE | |
| /portal/education | BusinessEducationDashboard.tsx | business_user | ProtectedRoute | Course enrollment KPIs, progress | course_enrollments, courses | TanStack Query (useCECredits) | LIVE | CE credit upsell for Pro. |
| /portal/education/credits | BusinessCECredits.tsx | business_user | ProtectedRoute | CE certificate tracking | certificates, course_enrollments | TanStack Query (useCECredits) | LIVE | |
| /portal/procurement | ProcurementDashboard.tsx | business_user | ProtectedRoute | Procurement KPIs, reorder alerts | orders, products | TanStack Query | LIVE | |
| /portal/marketing | BusinessMarketingDashboard.tsx | business_user | ProtectedRoute | Marketing dashboard | campaigns, campaign_metrics | TanStack Query | LIVE | |
| /portal/subscription | SubscriptionManagement.tsx | business_user | ProtectedRoute | Subscription management | tenant_subscriptions | manage-subscription edge fn | PARTIAL | |
| /portal/credits | CreditDashboard.tsx | business_user | ProtectedRoute | Credit balance + ledger | tenant_balances, credit_ledger | deduct_credits RPC | LIVE | Credit purchase → CreditPurchase.tsx |
| /portal/reseller | ResellerDashboard.tsx | business_user | ProtectedRoute | Reseller dashboard | (UNKNOWN — check reseller tables) | TanStack Query | UNKNOWN | |
| /portal/studio | StudioHome.tsx | business_user | ProtectedRoute | Studio document list | canvas_blocks, cms_documents? | TanStack Query | LIVE (STUDIO-UI-01..05 WIRED) | |
| /portal/studio/:id | StudioEditor.tsx | business_user | ProtectedRoute | Studio canvas editor | canvas_blocks, templates | TanStack Query | LIVE | Export to PDF/PNG/SCORM. |
| /portal/benchmarks | BenchmarkDashboard.tsx | business_user | ProtectedRoute | Benchmark dashboard | (UNKNOWN — peer data) | UNKNOWN | SHELL (§4.1 DEBT-7 Category C) | |
| /portal/locations | LocationsDashboard.tsx | business_user | ProtectedRoute | Locations dashboard | (UNKNOWN) | UNKNOWN | SHELL (§4.1 DEBT-7 Category C) | |

### C — Brand Portal Routes

| Route | Page | User Types | Gating | What It Displays | Data Sources | APIs Used | LIVE/DEMO/SHELL | Merchandising Opportunity |
|---|---|---|---|---|---|---|---|---|
| /brand/dashboard | BrandDashboard.tsx | brand_admin | ProtectedRoute | Brand overview KPIs | brands, products, orders, leads | TanStack Query | LIVE | |
| /brand/intelligence | BrandIntelligenceHub.tsx | brand_admin | ProtectedRoute | Intelligence signals for brand | market_signals | useIntelligence | LIVE | |
| /brand/intelligence-report | IntelligenceReport.tsx | brand_admin | ProtectedRoute | Full intelligence report | market_signals (direct supabase.from) | Direct DB | DEMO (per wave-9 audit note) | |
| /brand/ai-advisor | BrandAIAdvisor.tsx | brand_admin | ProtectedRoute | AI advisor chat | ai-concierge / ai-orchestrator | ai-concierge edge fn | SHELL (§4.1 Category C) | |
| /brand/intelligence-pricing | IntelligencePricing.tsx | brand_admin | ProtectedRoute | Intelligence tier pricing | Hardcoded? | None | SHELL (§4.1 Category C) | |
| /brand/products | Products.tsx | brand_admin | ProtectedRoute | Product catalog management | products | TanStack Query (DEBT-TANSTACK-6 resolved) | LIVE | Affiliate flag + FTC badge (COMMERCE-WO-03) |
| /brand/orders | Orders.tsx | brand_admin | ProtectedRoute | Order management | orders | TanStack Query | LIVE | |
| /brand/leads | Leads.tsx | brand_admin | ProtectedRoute | Lead management | leads | TanStack Query | LIVE | |
| /brand/pipeline | Pipeline.tsx | brand_admin | ProtectedRoute | Sales pipeline | deals (direct supabase.from) | Direct DB | LIVE | |
| /brand/campaigns | Campaigns.tsx | brand_admin | ProtectedRoute | Marketing campaigns | campaigns | TanStack Query | LIVE | |
| /brand/storefront | Storefront.tsx | brand_admin | ProtectedRoute | Storefront configurator | brands, brand_seed_content | TanStack Query | LIVE | |
| /brand/performance | Performance.tsx | brand_admin | ProtectedRoute | Performance analytics | (UNKNOWN tables) | TanStack Query | UNKNOWN | |
| /brand/customers | Customers.tsx | brand_admin | ProtectedRoute | Customer list | (UNKNOWN) | TanStack Query | UNKNOWN | |

### D — Admin Routes

| Route | Page | User Types | Gating | What It Displays | Data Sources | APIs Used | LIVE/DEMO/SHELL | Merchandising Opportunity |
|---|---|---|---|---|---|---|---|---|
| /admin/dashboard | AdminDashboard.tsx | platform_admin | ProtectedRoute (admin role) | System health KPIs, feed status, signal count | market_signals, data_feeds, user_profiles | TanStack Query, useAdminIntelligence | LIVE | |
| /admin/intelligence | IntelligenceDashboard.tsx | platform_admin | ProtectedRoute | Intelligence command center: signal stats, API health, feed strip, realtime | market_signals, api_registry, data_feeds | useAdminIntelligence + realtime | LIVE (INTEL-ADMIN-01 complete) | |
| /admin/market-signals | AdminMarketSignals.tsx | platform_admin | ProtectedRoute | Signal management + edit | market_signals | Direct supabase.from | LIVE | |
| /admin/feeds | AdminFeedsHub.tsx | platform_admin | ProtectedRoute | Feed pipeline management, manual triggers | data_feeds, feed_run_log | feed-orchestrator edge fn | LIVE | |
| /admin/api-dashboard | ApiDashboard.tsx | platform_admin | ProtectedRoute | API registry + health testing | api_registry, api_route_map | test-api-connection edge fn | LIVE | |
| /admin/brands | AdminBrandList.tsx | platform_admin | ProtectedRoute | Brand management | brands | TanStack Query | LIVE | |
| /admin/brands/:id | BrandAdminEditor.tsx | platform_admin | ProtectedRoute | Brand editor | brands, products, storage | Direct supabase.from + storage | LIVE | |
| /admin/orders | AdminOrders.tsx | platform_admin | ProtectedRoute | Order management | orders | Direct supabase.from | LIVE | |
| /admin/users | AdminUsers.tsx | platform_admin | ProtectedRoute | User management | user_profiles | TanStack Query | LIVE | |
| /admin/audit-log | AdminAuditLog.tsx | platform_admin | ProtectedRoute | Audit log viewer | audit_log | TanStack Query | LIVE | |
| /admin/feature-flags | AdminFeatureFlags.tsx | platform_admin | ProtectedRoute | Feature flag management | feature_flags | Direct supabase.from | LIVE | |
| /admin/cms | CmsDashboard.tsx | platform_admin | ProtectedRoute | CMS overview | cms_pages, cms_posts | useCmsPages, useCmsPosts (TanStack) | LIVE | |
| /admin/cms/pages | CmsPagesList.tsx | platform_admin | ProtectedRoute | Page management | cms_pages | useCmsPages | LIVE | |
| /admin/cms/posts | CmsPostsList.tsx | platform_admin | ProtectedRoute | Post management | cms_posts | useCmsPosts | LIVE | |
| /admin/cms/media | CmsMediaLibrary.tsx | platform_admin | ProtectedRoute | Media library | storage (media bucket) | supabase.storage | LIVE | |
| /admin/ingredients | AdminIngredientsHub.tsx | platform_admin | ProtectedRoute | Ingredient management | ingredients, ingredient_collections | Direct supabase.from | LIVE | |
| /admin/courses | AdminCoursesHub.tsx | platform_admin | ProtectedRoute | Course management | courses, course_enrollments | Direct supabase.from | LIVE | |
| /admin/courses/:id | AdminCourseEditor.tsx | platform_admin | ProtectedRoute | Course editor + SCORM upload | courses, scorm_packages | process-scorm-upload edge fn | LIVE | |
| /admin/shop | AdminShopHub.tsx | platform_admin | ProtectedRoute | Shop management hub | products, orders, categories | Direct supabase.from | LIVE | |
| /admin/region-management | RegionManagement.tsx | platform_admin | ProtectedRoute | Region management | (UNKNOWN — regional tables) | UNKNOWN | SHELL (§4.1 Category C) | |
| /admin/reports | ReportsLibrary.tsx | platform_admin | ProtectedRoute | Reports library | (UNKNOWN) | UNKNOWN | SHELL (§4.1 Category C) | |

---

## 5) MERCHANDISING STRATEGY

### 5.1 Intelligence-First Funnel (Confirmed Working)

The platform correctly implements intelligence-first merchandising:
- Primary nav position 1: `/intelligence`
- Public `/intelligence` page is LIVE with real market_signals data
- ApiStatusRibbon shows LIVE/DEMO badge with API health
- useIntelligence applies tier gating: free tier sees only `tier_min=free` signals in a 14-day window; paid tier sees all history
- IntelligenceCommerce.tsx has LIVE/DEMO badge (P0-02 resolved)

### 5.2 Upgrade Triggers (Active Gates)

| Gate | Component | Where Used | Trigger |
|---|---|---|---|
| TierGate | src/components/gates/TierGate.tsx | IntelligenceHub.tsx, PlanWizard.tsx | Signals gated by tier_visibility. Admin bypasses all. |
| CreditGate | src/components/gates/CreditGate.tsx | AIToolbar.tsx (6 tools), RnDScout.tsx, MoCRAChecker.tsx | AI tool calls deduct credits via deduct_credits RPC. Returns 402 if insufficient. |
| ModuleRoute | src/modules/_core/components/ModuleRoute.tsx | App.tsx (86 usages across portal routes) | Module entitlement check via ModuleAccessContext. |
| PaywallGate | src/components/PaywallGate.tsx | Various (test coverage confirmed) | Generic paywall gate for feature access. |

### 5.3 Merchandise Opportunities (Not Yet Implemented)

1. **Live subscriber count on /plans** — plans are hardcoded (DEMO). Wire to `SELECT COUNT(*) FROM tenant_subscriptions WHERE status = 'active'` for social proof.
2. **Live brand count on /for-brands** — STATS array is hardcoded. Pull from `brands` table.
3. **Signal count on / (Home)** — Home.tsx pulse numbers are hardcoded. usePlatformStats.ts exists but UNKNOWN if fully wired to live data.
4. **Affiliate FTC badges on shop products** — COMMERCE-WO-03 complete: `is_affiliated` flag + `AffiliateDisclosureBadge` component. Verify all product cards use it.
5. **Sitemap gaps** — sitemap-generator omits events, intelligence briefs, blog posts. Fix for SEO: 40.1% coverage is far below target.
6. **CE credit premium upsell** — CE certificate generation is a Pro+ feature opportunity. Currently behind auth only. Add TierGate for CE export.

---

## 6) ON/OFF + FEATURE CONTROL MODEL

### 6.1 Feature Flags (DB-backed)

**Table:** `public.feature_flags`
**Hook:** `src/lib/useFeatureFlag.ts`
**Admin UI:** `/admin/feature-flags` (AdminFeatureFlags.tsx)
**Usage:** 3 files reference feature_flags — database.types.ts (type), AdminFeatureFlags.tsx (CRUD), useFeatureFlag.ts (hook)

Feature flags provide per-feature on/off control. Admin can toggle via UI. Hook returns boolean. Used for optional features that can be disabled without code changes.

### 6.2 Edge Function Kill Switches (DB-backed)

**Table:** `public.edge_function_controls`
**Mechanism:** `supabase/functions/_shared/edgeControl.ts` — `enforceEdgeFunctionEnabled(functionName, req)`
**Coverage:** All 33 edge functions call this before any processing. Returns HTTP 503 with `edge_function_disabled` error if disabled.
**Admin UI:** `/admin/api-controls` (AdminApiControls.tsx) — UNKNOWN if wired to edge_function_controls table specifically.

3 functions (ingest-npi, ingest-openfda, open-beauty-facts-sync) have edgeControl inlined rather than imported from _shared — this was a workaround for MCP deploy cross-directory import issues. Functionally identical.

### 6.3 Prelaunch Guard

**Env var:** `VITE_PRELAUNCH_MODE=true`
**Component:** `src/components/PrelaunchGuard.tsx`
**Behavior:** When VITE_PRELAUNCH_MODE=true, all routes render PrelaunchQuiz instead of the actual page. Bypassed by admin role.

### 6.4 Staging Banner

**Env vars:** `VITE_TEST_MODE=true`, `VITE_DEPLOY_BRANCH`, `VITE_DEPLOY_SHA`
**Component:** `src/components/StagingBanner.tsx`
**Behavior:** Shows staging/test mode banner with branch + SHA. Visible to all users in test mode.

### 6.5 Supabase Bypass

**Env var:** `VITE_SUPABASE_BYPASS=true`
**Component:** `src/components/ConfigCheck.tsx`
**Behavior:** When bypass is true AND `VITE_SUPABASE_BYPASS !== 'false'`, disables Supabase config requirement check. Used for pure UI testing.

### 6.6 Dev Admin Login

**Env vars:** `VITE_DEV_ADMIN_EMAIL`, `VITE_DEV_ADMIN_PASSWORD`
**Pages:** AdminLogin.tsx (quick-login button), AdminRecovery.tsx (recovery page — DEV only)
**Behavior:** In DEV mode, shows quick-login button. Production renders nothing. NEVER include real credentials in these vars in production builds.

---

## 7) GAP LIST (ACTIONABLE)

### P0 — Blocking / Launch-Critical

| # | Problem | Evidence | Impact | Suggested Fix | Owner Decision? |
|---|---|---|---|---|---|
| P0-A | OPENAI_API_KEY not set in production | build_tracker.md line 6: "EMBED-01 blocked: no OPENAI_API_KEY"; generate-embeddings confirmed requires it | Vector search (/search) non-functional. All embedding generation broken. EMBED-01 WO marked complete but key missing. | Set OPENAI_API_KEY via `supabase secrets set OPENAI_API_KEY=sk-...` | YES — owner must obtain OpenAI key or switch to alternative embedding model |
| P0-B | Duplicate Stripe subscription webhook functions | stripe-webhook + subscription-webhook both deployed, both handle checkout.session.completed | Risk of double-processing subscription events — double-crediting, double-updating subscription status | Owner must designate one canonical webhook function. Remove or disable the other. Update Stripe Dashboard webhook URL to point to canonical. | YES |
| P0-C | Stripe stripe_price_id = null on subscription plans | build_tracker.md PAY-WO-05: "stripe_price_id=null pending Stripe dashboard config" | Stripe Checkout Sessions will fail for subscription plans. No paid subscriptions can be created. | Configure plans in Stripe Dashboard → seed price IDs → update plans table stripe_price_id column | YES — requires Stripe Dashboard access and plan design decision |
| P0-D | RESEND_API_KEY status unknown | send-email silently no-ops (logs warning, does not throw) if key missing. No verification JSON confirms it is set. | All transactional email silently failing: welcome emails, order confirmations, access request notifications | Run `supabase secrets list` to verify. Set `supabase secrets set RESEND_API_KEY=re_...` if missing | VERIFY FIRST |
| P0-E | database.types.ts may have drifted post-BUILD 2 | P0-03: 109 tables at last regen (2026-03-09). BUILD 2 added 5 new migrations (consent log, churn risk, affiliate flag, signal attribution, cms versions). | TypeScript type errors on new tables. Queries may use incorrect types. tsc may not catch schema mismatches. | Run `supabase gen types --linked > src/lib/database.types.ts` and verify tsc=0 | NO — run immediately |
| P0-F | Calendar OAuth tokens stored plaintext in calendar_connections | calendar-create-event and calendar-oauth-callback store access_token + refresh_token in plaintext DB column | Token exfiltration risk if DB is breached. Compliance concern. | Migrate to Supabase Vault (vault.create_secret) before production launch. Same pattern needed for Square (W11-13 already blocks this). | YES — security architecture decision |

### P1 — High Priority / Pre-Launch Required

| # | Problem | Evidence | Impact | Suggested Fix | Owner Decision? |
|---|---|---|---|---|---|
| P1-A | SEO coverage 40.1% (109/272 pages) | Site-wide audit 2026-03-09; E2E-triage confirms 32 SEO failures | Poor organic search acquisition. 163 pages without meta tags. | Wire react-helmet-async meta tags to all public pages. Priority: /intelligence, /brands, /jobs, /education, /protocols. Maps to SITE-WO-04. | NO — execute SITE-WO-04 |
| P1-B | Sitemap generator missing key content types | sitemap-generator does not include events, intelligence briefs, blog posts, courses | Missing SEO value for content-heavy pages | Add ?type=events, ?type=briefs, ?type=blog, ?type=courses handlers to sitemap-generator | NO |
| P1-C | 6 raw useEffect + supabase.from violations (DEBT-TANSTACK-REAL-6) | build_tracker.md line 70: BusinessRulesView, ReportsView, MappingView, PlanOutputView, ServiceIntelligenceView, MarketingCalendarView | Violates §16 launch gate item 23: 0 raw useEffect+supabase pages | Migrate each to useQuery. Maps to DEBT-TANSTACK-REAL-6 WO | NO — execute WO |
| P1-D | 19 raw market_signals queries outside useIntelligence | Site-wide audit; 47 files reference market_signals | Bypasses isLive/tier contract. Free users may see ungated data. | Consolidate to useIntelligence hook or useAdminIntelligence for admin surfaces. Maps to FOUND-WO-11. | NO |
| P1-E | send-email has no authentication | Edge function is public — no JWT or shared secret required to trigger | Anyone can trigger transactional emails to any address (access_request type sends to admin; welcome type requires email param) | Add rate limiting or shared secret header validation. At minimum, validate email format and restrict type parameter. | YES — security trade-off decision |
| P1-F | 29 unit tests failing (React 19 @testing-library compat) | Site-wide audit: @testing-library/react v16.3.2 incompatible with React 19. 163/192 passing. | Launch gate §16 item 21 requires ≥20 unit tests passing (currently met at 163). But 29 failures mask real regressions. | Upgrade @testing-library/react to ^17.x | NO — straightforward dependency upgrade |

### P2 — Medium Priority / Post-Launch Acceptable

| # | Problem | Evidence | Impact | Suggested Fix | Owner Decision? |
|---|---|---|---|---|---|
| P2-A | 3 true shell pages in Admin: RegionManagement, ReportsLibrary + brand-hub HubEducation, HubProtocols | §4.1 Category C; build_tracker.md | Admin completeness gap. No data display. | Wire to relevant tables or create as dedicated WOs (ADMIN-WO-03/04/05). | YES — scope WOs |
| P2-B | BrandAIAdvisor + IntelligencePricing are shells | §4.1 Category C; confirmed in App.tsx lazy imports | Brand portal completeness gap | Implement as dedicated WOs. BrandAIAdvisor → wire to ai-concierge with brand context. IntelligencePricing → wire to plans + Stripe. | YES |
| P2-C | BenchmarkDashboard + LocationsDashboard are shells | §4.1 Category C | Business portal completeness gap | Wire to peer comparison data (benchmarks) and businesses/locations table. | YES |
| P2-D | PWA push notifications server side not confirmed | PWAInstallPrompt.tsx opts users in; sw.js handles pushsubscriptionchange. No edge function for sending push. | Push notification delivery non-functional even after opt-in. | Create send-push-notification edge function using VAPID_PRIVATE_KEY. Store subscriptions in DB table. | YES — new WO needed |
| P2-E | pg_cron schedule for ingest-openfda + open-beauty-facts-sync not confirmed | Functions have edgeControl inline; no schedule migration found for these | FDA + OBF data only updated on manual admin trigger | Add pg_cron schedule entries (e.g., daily for FDA, weekly for OBF) in migration file | NO |
| P2-F | intelligence-briefing edge function vs useIntelligence hook — unclear which is canonical | Both return market_signals data. Hook used in 8 files. Edge function exists for IntelligenceBriefs. | Potential data inconsistency if either is updated without updating the other | Audit which pages use edge function vs hook. Consolidate to hook or document split. | NO — audit task |
| P2-G | validate-discount is public with no rate limiting | Any caller can enumerate discount codes by brute-forcing codes | Discount code scraping risk | Add supabase anon key rate limit via Supabase dashboard, or add captcha/honeypot to cart UI | YES — security risk assessment needed |
| P2-H | certificate number uses Math.random() in generate-certificate | `Math.floor(Math.random() * 999999)` — not cryptographically unique | Certificate number collisions theoretically possible (1-in-999,999 per year) | Replace with crypto.randomUUID() or a sequence from certificates_seq PostgreSQL sequence | NO |

---

## 8) VERIFICATION COMMANDS

Run these commands to verify current state of APIs, configurations, and data:

```bash
# 1. Verify Supabase secrets (run from SOCELLE-WEB directory)
supabase secrets list
# Expected: OPENROUTER_API_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
#           RESEND_API_KEY, FROM_EMAIL, GOOGLE_OAUTH_CLIENT_SECRET,
#           MICROSOFT_OAUTH_CLIENT_SECRET, OPENAI_API_KEY (likely missing)

# 2. Regenerate TypeScript types (run from SOCELLE-WEB directory)
supabase gen types --linked > src/lib/database.types.ts
npx tsc --noEmit

# 3. Check edge function kill-switch table
# (run in Supabase SQL editor or via supabase execute_sql)
SELECT function_name, is_enabled FROM edge_function_controls ORDER BY function_name;
# Expected: all 33 functions present with is_enabled = true (except blocked ones)

# 4. Check market_signals freshness (launch gate §16 item 10)
SELECT COUNT(*), MAX(updated_at) FROM market_signals WHERE updated_at > NOW() - INTERVAL '24 hours';
# Expected: >= 5 rows

# 5. Check Stripe price IDs on plans
SELECT id, name, stripe_price_id FROM plans ORDER BY name;
# Expected: all rows have non-null stripe_price_id

# 6. Check api_registry health (last test results)
SELECT name, last_test_status, last_test_latency_ms, last_tested_at
FROM api_registry ORDER BY last_tested_at DESC NULLS LAST;
# Expected: recent tests, most returning 200. 3 known timeouts (Google Trends, NPI, OpenFDA).

# 7. Check feed health
SELECT name, health_status, consecutive_failures, last_success_at
FROM data_feeds WHERE is_enabled = true ORDER BY consecutive_failures DESC;
# Expected: 18 healthy feeds, consecutive_failures = 0

# 8. Check raw useEffect violations (DEBT-TANSTACK-REAL-6)
grep -rn "useEffect" src/components/BusinessRulesView.tsx \
  src/components/MarketingCalendarView.tsx 2>/dev/null | grep supabase
# Expected: 0 matches after migration

# 9. Check for remaining banned terms in user-facing copy
grep -rn "AI-powered\|Shop Now\|seamless\|game-changer" src/pages/public/ src/components/
# Expected: 0 matches

# 10. Check token violations
grep -rn "brand-\|intel-" src/pages/ src/components/ --include="*.tsx" \
  | grep -v "brand-hub\|brand-admin\|IntelligenceHub\|// " | head -50
# Expected: brand-* violations ~19 (StatCard etc), intel-* violations ~30 (per audit)

# 11. Test edge function kill-switch
curl -X POST https://rumdmulxzmjtsplsjngi.supabase.co/functions/v1/test-api-connection \
  -H "Authorization: Bearer <ADMIN_JWT>" \
  -H "Content-Type: application/json" \
  -d '{"registry_id": "<api_registry_uuid>"}'
# Expected: { latency_ms: N, status_code: 200, success: true }

# 12. Verify embedding queue status
SELECT table_name, COUNT(*) as queued, COUNT(CASE WHEN processed_at IS NOT NULL THEN 1 END) as done
FROM embedding_queue GROUP BY table_name;
# Expected: all rows processed (processed_at not null) — or non-zero queue if OPENAI_API_KEY missing

# 13. Check certificate uniqueness
SELECT certificate_number, COUNT(*) FROM certificates GROUP BY certificate_number HAVING COUNT(*) > 1;
# Expected: 0 rows (no collisions yet)

# 14. Verify affiliate badges on products
SELECT COUNT(*) as total, COUNT(CASE WHEN is_affiliated = true THEN 1 END) as affiliated
FROM products;
# Informational: shows what percentage of products have affiliate flags set

# 15. Confirm send-email is configured
# Test via admin action (access_request type) or check Resend dashboard for recent sends
```

---

*SOCELLE API UPDATE PACK — End of Document*
*This is a read-only audit artifact. All changes require a WO in build_tracker.md.*
*Next re-audit recommended: after BUILD 3 gate verification or after any new external API integration.*
