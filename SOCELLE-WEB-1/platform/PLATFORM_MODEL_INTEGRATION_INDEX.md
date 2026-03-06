# SOCELLE Platform Model — Master Integration Index

**Document type:** Coordination document — Agent 7 output
**Date:** March 4, 2026
**Status:** Complete — covers all 9 output files from Agents 1–6
**Authority:** This document supersedes no individual spec. It integrates and cross-references all agent outputs.

---

## Section 1: Executive Summary

### What Was Updated in This Platform Model Correction (March 2026)

The March 2026 platform model correction is a surgical update to existing SOCELLE strategy documents — not a strategic pivot. The core thesis (intelligence-first, web-first, Supabase backend) is unchanged. What changed is the depth of specification for six new content surfaces and the explicit documentation of the complete six-stream revenue model, two streams of which (affiliate commerce and brand claim subscriptions) were absent from the prior working documents.

### The 6 New Content Surfaces Added to SOCELLE

1. **Public Brand Intelligence Pages** (`/brands/[slug]`) — 500+ auto-generated, claimable brand profiles indexed for professional search queries. The single largest SEO surface in the platform.
2. **Brand Claim Funnel** (`/brands/[slug]/claim`) — 8-step self-serve monetization flow converting passive brand page traffic into $199–$999/month SaaS subscriptions.
3. **Industry Events Calendar** (`/events` and `/events/[slug]`) — 350–600 events per year from 17+ sources, auto-extracted, CE credit tracked, and integrated with affiliate commerce blocks.
4. **Contextual Affiliate Commerce** — Wirecutter-style editorial recommendation blocks embedded across all seven content surfaces (feed, brand pages, event pages, education, benchmarking, quiz results, email).
5. **RSS Industry News Aggregation** — 33+ feeds refreshed every 6 hours, auto-categorized by specialty, feeding the personalized daily briefing.
6. **Full Automation Pipeline** — 10 SOCELLE-specific pg-boss queues running within the shared Viaive infrastructure, targeting 90% content automation at steady state with 6–8 hours/week human editorial effort.

### Total New Database Tables

**13 new tables** across all agents (Brand Profiles: 5, Events: 5, Affiliate: 3). See Section 3 for full table-by-table breakdown.

### Total New pg-boss Queues

**10 SOCELLE-specific queues** added to the shared pg-boss instance. See Section 5 for complete queue registry.

### Revenue Streams Now Fully Documented

All six revenue streams are now explicitly specified across the platform documents:

| # | Stream | Activation | Price | Type |
|---|---|---|---|---|
| 0 | Premium Affiliate Commerce | Day 1 | $2K–$10K/mo aggregate | Transactional |
| 1 | Embedded Poll Sponsorship | Month 2–3 | $1K–$5K per placement | Campaign |
| 2 | Brand Intelligence Reports | Month 3–4 | $500–$5K per report | One-time |
| 3 | Sponsored Quizzes and Studies | Month 4–6 | $5K–$25K per study | Campaign |
| 4 | Brand Claim Subscriptions | Month 4–6 | $199–$999/mo per brand | SaaS MRR |
| 5 | Premium Operator Subscriptions | Month 6+ | $49–$149/mo per operator | SaaS MRR |

### One-Paragraph Summary: What SOCELLE Now Is vs. Before

Before this update, SOCELLE's planning documents described a paused marketplace with a wave 1 intelligence portal pivot — but the specifics of how that portal would generate day-one revenue, how it would scale its content surface through automation, and how passive brand traffic would convert to recurring SaaS revenue were either missing or underspecified. After this update, SOCELLE is fully specified as a living beauty intelligence portal with a complete automation architecture (10 pg-boss queues, 33+ RSS feeds, 17+ event sources), a 500+ page organic SEO footprint launched on day one, an affiliate commerce layer generating revenue from the first page view, a passive brand acquisition funnel that converts continuously at zero marginal cost, and a six-stream revenue model with explicit activation timelines. The platform now has both a clear product architecture and a clear monetization architecture, documented to engineering-ready specification.

---

## Section 2: Document Index

### Agent 1 — Wave Strategy Agent

---

#### Document 1: `WAVE1_BUILD_STRATEGY_UPDATED.md`

**Path:** `/Users/brucetyndall/Documents/GitHub/SOCELLE-WEB/SOCELLE-WEB/platform/WAVE1_BUILD_STRATEGY_UPDATED.md`

**Contains:** The authoritative Wave 1 build strategy document, updated to Version 2.0. Covers the strategic thesis (intelligence-first, web-first), the 8 Wave 1 deliverables, the complete 23-route site architecture with SEO keyword mapping, the 10-surface automation architecture, the full public brand intelligence page specification (page layout, database schema summary, SEO templates), the affiliate commerce schema summary, and the complete 6-stream revenue model. Sprint plan with 6 sprints over 12–14 weeks.

**Status:** Complete

**Key Decisions:**
- Wave 1 ships all 8 capabilities simultaneously, not sequentially
- Brand profile pages are the "single most important addition to the platform model"
- Affiliate commerce is day-one revenue requiring zero brand partnerships or user scale
- 500+ auto-generated brand profiles indexed at launch for immediate SEO coverage
- 90% content automation at steady state; 6–8 hours/week human editorial touch
- This document supersedes Wave 1 sections in `SOCELLE_FULL_BUILD_ALL_WAVES_v6.md` and `Socelle_Pro_Working_Channel_Roadmap.md`

**Dependencies on other documents:**
- References `SOCELLE_BRAND_CLAIM_SPEC.md` for brand claim subscription detail
- References `SOCELLE_AFFILIATE_SPEC.md` for affiliate placement detail
- References `BeautyIntel_DataArchitect_Spec.docx` for shared pipeline infrastructure
- References `Enterprise Hardening Appendix, section G.2` for pg-boss job system

---

#### Document 2: `WORKING_CHANNEL_ROADMAP_UPDATED.md`

**Path:** `/Users/brucetyndall/Documents/GitHub/SOCELLE-WEB/SOCELLE-WEB/platform/WORKING_CHANNEL_ROADMAP_UPDATED.md`

**Contains:** The updated working channel roadmap, superseding `Socelle_Pro_Working_Channel_Roadmap.md`. Covers the strategic shift rationale, what exists today in the codebase (preserve / pause decisions), Wave 1 pages to build, the intelligence portal positioning, dual-path brand portal entry (inquiry + claim), the channel roadmap for all four audience types, the complete 6-stream revenue model with per-stream detail, the automation architecture summary table, the 12–14 week launch timeline, Year 1 growth targets, and the bridge between Wave 1 (intelligence) and Wave 2 (commerce) via the Explore Profile data layer.

**Status:** Complete

**Key Decisions:**
- All instances of "intelligence hub" replaced with "intelligence portal" throughout
- Brand portal now explicitly documents two parallel entry paths: Brand Inquiry and Brand Claim
- Revenue model expanded from the original (which did not include affiliate commerce or brand claims) to 6 streams
- Year 1 revenue target: $150K–$300K (intelligence reports + brand claims + affiliate + marketplace commission)
- Month 6 target: 10,000 professionals, brand claim subscriptions active, marketplace activation begins

**Dependencies on other documents:**
- References `SOCELLE_BRAND_CLAIM_SPEC.md` for brand claim tier detail
- References `socelle_platform_model_update.docx` as source update
- Aligned with `WAVE1_BUILD_STRATEGY_UPDATED.md` — both documents are internally consistent

---

### Agent 2 — Public Brand Profile Agent

---

#### Document 3: `SOCELLE_BRAND_PROFILES_SPEC.md`

**Path:** `/Users/brucetyndall/Documents/GitHub/SOCELLE-WEB/SOCELLE-WEB/platform/SOCELLE_BRAND_PROFILES_SPEC.md`

**Contains:** Complete product specification for the `/brands/[slug]` page system. Covers page architecture (URL structure, unclaimed page layout, claimed page layout, 8 brand profile page sections with UX annotations), data source mapping for all auto-generated sections (pipeline sources, refresh cadence, fallback behavior, confidence score display), the claimed brand section specifications, the 56-brand seed list at launch, brand claim flow overview (full detail in Agent 3 document), affiliate block integration on brand pages, SEO specification (title template, meta description template, structured data schemas), and the automation pipeline connection to the `socelle-assemble-brand-profiles` pg-boss queue.

**Status:** Complete

**Key Decisions:**
- 56 seed brands explicitly named for launch (skincare, haircare, devices, injectables, tools, nail, color, wellness categories)
- Auto-generated pages require zero brand involvement and rank immediately via Google index
- Claim CTA is a persistent orange banner on every unclaimed page — not dismissable
- Confidence score badges displayed inline on all data-driven sections
- Stale data handled gracefully: displayed with age indicator, never hidden
- Brand page affiliate block is limited to 2 blocks per page maximum

**Dependencies on other documents:**
- `BRAND_PROFILES_MIGRATION.sql` — provides the actual database tables for all auto-generated data
- `SOCELLE_BRAND_CLAIM_SPEC.md` — provides full claim flow detail (referenced, not duplicated)
- `SOCELLE_AUTOMATION_SPEC.md` — provides queue 4 (`socelle-assemble-brand-profiles`) implementation detail
- `SOCELLE_AFFILIATE_SPEC.md` — provides affiliate placement schema used on brand pages

---

#### Document 4: `BRAND_PROFILES_MIGRATION.sql`

**Path:** `/Users/brucetyndall/Documents/GitHub/SOCELLE-WEB/SOCELLE-WEB/platform/BRAND_PROFILES_MIGRATION.sql`

**Contains:** Production-ready SQL migration for all 5 brand profile tables. Includes CREATE TABLE statements with full column definitions, check constraints, and column comments; 22+ indexes covering all primary query patterns (by slug, category, tier, claimed status, full-text search); 4 RLS policies per table (public read where appropriate, service_role write, claimant-scoped update for brand_profiles); 4 updated_at triggers; 2 materialized views (`brand_aggregate_ratings`, `brand_category_positioning`); 2 helper functions (`increment_brand_analytics`, `get_brand_claim_tier`); a DO block for seed data with instructions to replace with actual brand UUIDs; and a migration record tracking block.

**Status:** Complete

**Key Decisions:**
- Migration file number: implied as the next migration after WO-25 completion
- `socelle.set_updated_at()` function is created or replaced (may conflict with same function in `AFFILIATE_MIGRATION.sql` — see Section 7)
- Seed data is deliberately structured as a DO block with placeholder inserts; requires actual brand UUIDs from `socelle.brands` before production run
- `brand_page_analytics` does not have an `updated_at` column (counters incremented in real time via `increment_brand_analytics` function rather than full row updates)

**Dependencies on other documents:**
- `SOCELLE_BRAND_PROFILES_SPEC.md` — defines what data these tables store
- `SOCELLE_BRAND_CLAIM_SPEC.md` — `brand_claims` table is the financial layer for the claim funnel
- Must be run AFTER baseline migrations that create `socelle.brands` and `socelle.user_profiles`

---

### Agent 3 — Brand Claim Monetization Agent

---

#### Document 5: `SOCELLE_BRAND_CLAIM_SPEC.md`

**Path:** `/Users/brucetyndall/Documents/GitHub/SOCELLE-WEB/SOCELLE-WEB/platform/SOCELLE_BRAND_CLAIM_SPEC.md`

**Contains:** Complete monetization specification for Revenue Stream 4 (brand claim subscriptions). Covers the 8-step claim UX flow (Discovery → Banner Engagement → Claim Page → Authority Verification → Plan Selection → Stripe Checkout → Email Verification → Brand Dashboard Access), the three subscription tiers with complete feature matrices (Basic $199/mo, Pro $499/mo, Enterprise $999/mo), the brand dashboard specification for each tier, the Stripe integration architecture (Products, Prices, Webhooks, subscription lifecycle events), analytics data available to each tier (30-day / 90-day / 12-month windows gated by tier), the outbound email campaign strategy for unclaimed brand notification, and Year 1 revenue projections by conversion scenario.

**Status:** Complete

**Key Decisions:**
- Year 1 revenue projection: $20K+ MRR from brand subscriptions at maturity (conservative scenario: 30 Basic + 15 Pro + 5 Enterprise = $15,420/mo)
- Claim approval is manual (SOCELLE admin reviews proof of authority) — not automated
- Brand cannot self-approve its own claim — `brand_claims_update_service_role` RLS policy enforces this
- Feature gating for analytics: Basic = 30-day window, Pro = 90-day window, Enterprise = 12-month window
- Stripe Checkout is preferred over custom payment form for PCI compliance
- Enterprise tier includes API access to intelligence data — creates dependency on WO-21 (Enterprise Intelligence API)

**Dependencies on other documents:**
- `BRAND_PROFILES_MIGRATION.sql` — `brand_claims` and `brand_profiles` tables are the data layer for this spec
- `SOCELLE_BRAND_PROFILES_SPEC.md` — defines what a brand sees on their unclaimed page that motivates the claim
- `SOCELLE_AUTOMATION_SPEC.md` — queue 10 (`socelle-track-freshness`) monitors analytics freshness that feeds claimed brand dashboards

---

### Agent 4 — Industry Events Agent

---

#### Document 6: `SOCELLE_EVENTS_SPEC.md`

**Path:** `/Users/brucetyndall/Documents/GitHub/SOCELLE-WEB/SOCELLE-WEB/platform/SOCELLE_EVENTS_SPEC.md`

**Contains:** Complete specification for the industry events system. Covers the 17-source registry with full extraction detail for each source (URL patterns, CSS selectors, authentication status, robots.txt verification, rate limit recommendations, special handling notes), the event data normalization schema, event deduplication logic (`hash(source_url + event_start_date)`), the `/events` index page specification (filtering by type/specialty/location/date/CE credits, map view vs. list view toggle), the `/events/[slug]` detail page specification (SEO template, structured data with Event JSON-LD, affiliate "prepare for [event]" block), the personalized events digest email specification, and the weekly human review workflow (30 minutes/week).

**Status:** Complete

**Key Decisions:**
- 17 primary sources (not 14 as stated in the Automation Spec queue description — see Section 7: Contradictions)
- User-agent string: `SocelleBot/1.0 (+https://socelle.com/bot; data@socelle.com)`
- Eventbrite API is the only source requiring API key authentication (free developer account, 2,000 calls/day)
- Events are soft-deleted only (`is_cancelled = true`) — never hard-deleted
- CE credit count extracted as NUMERIC(5,1) to support 0.5-credit increments
- `specialty_tags` and `brand_sponsors` stored as PostgreSQL native TEXT[] arrays

**Dependencies on other documents:**
- `EVENTS_MIGRATION.sql` — provides the database schema for all event tables
- `SOCELLE_AFFILIATE_SPEC.md` — affiliate "prepare for [event]" blocks on event detail pages
- `SOCELLE_AUTOMATION_SPEC.md` — queue 1 (`socelle-crawl-events`) is the automation worker for this system

---

#### Document 7: `EVENTS_MIGRATION.sql`

**Path:** `/Users/brucetyndall/Documents/GitHub/SOCELLE-WEB/SOCELLE-WEB/platform/EVENTS_MIGRATION.sql`

**Contains:** Production-ready SQL migration for all 5 events system tables. Includes the main `socelle.events` table (full 35+ column schema with check constraints for event type, date ordering, price ordering, and virtual/location consistency), `socelle.event_saves` (user save/RSVP table with unique constraint per user per event), `socelle.crawl_logs` (pipeline execution log for all scraping runs), `socelle.crawler_configs` (per-source crawl configuration including rate limits, selectors, authentication), and `socelle.geocode_cache` (Google Maps geocoding cache to minimize API costs). Includes comprehensive indexes, RLS policies, and updated_at triggers.

**Status:** Complete

**Key Decisions:**
- Migration file intended to run before BRAND_PROFILES_MIGRATION.sql (events table exists; brand_profiles table references it implicitly via brand page education sections)
- `socelle.crawl_logs` is a shared infrastructure table also referenced by `SOCELLE_AUTOMATION_SPEC.md`
- `socelle.geocode_cache` prevents redundant Google Maps API calls — important cost control given 350–600 events/year
- `event_saves` creates the user engagement signal for personalized event recommendations

**Dependencies on other documents:**
- Requires `socelle.brands` table (for `organizer_brand_id` FK) — run after WO-10 migration
- Requires `public.user_profiles` table (for `event_saves.user_id` FK) — run after baseline auth migration
- `SOCELLE_EVENTS_SPEC.md` defines what these tables store and how they are populated

---

### Agent 5 — Affiliate Commerce Agent

---

#### Document 8: `SOCELLE_AFFILIATE_SPEC.md`

**Path:** `/Users/brucetyndall/Documents/GitHub/SOCELLE-WEB/SOCELLE-WEB/platform/SOCELLE_AFFILIATE_SPEC.md`

**Contains:** Complete specification for Revenue Stream 0 (affiliate commerce). Covers the 5 affiliate networks with application timelines, commission rates, and deep-link format documentation (ShareASale, Impact.com, CJ Affiliate, Amazon Associates, brand-direct); the 7 placement surfaces with max placements per page, example use cases, and label requirements; the editorial workflow for affiliate curation (human-only, never algorithmic); the sentiment auto-removal system (products removed when brand avg rating < 3.0 stars using `brand_reviews` data); the trust guardrails (all placements labeled "Socelle Pick," max 2 per page, transparency page at `/about/recommendations`); the admin dashboard specification for affiliate performance monitoring; and revenue projections by traffic tier.

**Status:** Complete

**Key Decisions:**
- Revenue estimate at 10,000 monthly page views: $2,000–$5,000/month in first 6 months
- Catalog strategy: 50 hero products at launch, expand by 20–30 per week, target 1,000+ by month 6
- `relevance_score >= 0.70` required for all live placements — human-set, never algorithmic
- Sentiment auto-removal is enforced at database level via `deactivate_low_sentiment_affiliate_products()` function — runs nightly
- All placements from `socelle-match-affiliates` queue arrive as `status = 'pending_review'` — no auto-publish
- Revenue firewall: `affiliate_clicks` table SELECT is restricted to service_role — never exposed to brand intelligence clients

**Dependencies on other documents:**
- `AFFILIATE_MIGRATION.sql` — provides the database tables for this spec
- `BRAND_PROFILES_MIGRATION.sql` — `brand_reviews` table is the data source for the sentiment auto-removal job
- `SOCELLE_AUTOMATION_SPEC.md` — queue 5 (`socelle-match-affiliates`) is the automation worker

---

#### Document 9: `AFFILIATE_MIGRATION.sql`

**Path:** `/Users/brucetyndall/Documents/GitHub/SOCELLE-WEB/SOCELLE-WEB/platform/AFFILIATE_MIGRATION.sql`

**Contains:** Production-ready SQL migration for all 3 affiliate tables. Migration identifier: `0072_affiliate_commerce_schema`. Includes `socelle.affiliate_products` (curated catalog with editorial controls, sentiment removal infrastructure, and price tracking), `socelle.affiliate_placements` (surface-to-product assignment with position cap enforcement), and `socelle.affiliate_clicks` (click and conversion tracking with dual anonymous/authenticated tracking). Also includes `socelle.affiliate_revenue_summary` view (admin-only, never exposed via public API); 13 indexes across all three tables; RLS policies (public SELECT for active products/placements, INSERT-only for clicks, service_role for all writes); `socelle.set_updated_at()` trigger function; `deactivate_low_sentiment_affiliate_products()` function; `get_affiliate_sentiment_warnings()` function; and `can_add_placement()` guard function. Wrapped in a single transaction (BEGIN/COMMIT).

**Status:** Complete

**Key Decisions:**
- Migration number 0072 — this is the next migration after the existing 71 Supabase migrations
- `socelle.affiliate_clicks` references `auth.users` (not `socelle.user_profiles`) for user_id FK — note difference from brand profile tables which reference `socelle.user_profiles`
- `deactivate_low_sentiment_affiliate_products()` joins against `brand_reviews.brand` (TEXT column) — this is a cross-table join to the brand_reviews table from BRAND_PROFILES_MIGRATION.sql
- `set_updated_at()` function is created here as `CREATE OR REPLACE` — same function created in BRAND_PROFILES_MIGRATION.sql (not a conflict, but verify execution order)

**Dependencies on other documents:**
- `BRAND_PROFILES_MIGRATION.sql` must be run first (AFFILIATE_MIGRATION.sql references `socelle.brand_reviews`)
- `SOCELLE_AFFILIATE_SPEC.md` defines the editorial and operational rules for these tables

---

### Agent 6 — Automation Architecture Agent

---

#### Document 10 (Reference): `SOCELLE_AUTOMATION_SPEC.md`

**Path:** `/Users/brucetyndall/Documents/GitHub/SOCELLE-WEB/SOCELLE-WEB/platform/SOCELLE_AUTOMATION_SPEC.md`

**Contains:** The authoritative engineering reference for the SOCELLE automation layer. Covers the 8 pipeline use case connections to SOCELLE content surfaces (with SQL/materialized view code for each), all 10 pg-boss queue specifications (complete config, worker registration TypeScript, process steps, success/failure handling, expected output), the 33+ RSS feed source registry with priority tiers and per-feed metadata, the automation vs. human decision matrix for all 10 surfaces, the compliance checklist for adding new data sources, the TypeScript pg-boss queue registry as importable config, and the steady-state weekly human effort budget (6.75 hours/week).

**Status:** Complete

**Key Decisions:**
- All 10 queues run within the SAME pg-boss instance as the shared Viaive pipeline — not a parallel system
- Queue priorities: `socelle-aggregate-news` (8 = highest), `socelle-enrich-profiles` and `socelle-send-briefings` (7 = high), `socelle-crawl-events`, `socelle-assemble-brand-profiles`, `socelle-compute-brand-scores`, `socelle-track-freshness` (5 = medium), `socelle-crawl-reddit` and `socelle-match-affiliates` (3 = low), `socelle-generate-polls` (2 = lowest)
- Poll auto-publishing is permanently disabled at database level via trigger — all polls require human approval
- User-agent string defined as `SocelleBot/1.0` (minor discrepancy with Agent 4 — see Section 7)
- `socelle-send-briefings` uses Resend (primary) with SendGrid as fallback — not Brevo (see Section 7)

**Dependencies on other documents:**
- References all 3 SQL migration files as the data layer for queue workers
- References `BeautyIntel_DataArchitect_Spec.docx` for shared pipeline (UC-1 through UC-8)
- References `Enterprise Hardening Appendix, section G.2` for pg-boss base configuration

---

## Section 3: Database Schema Summary — All New Tables

### Complete Master Table List (13 new tables)

---

#### From Agent 2 (Brand Profiles) — BRAND_PROFILES_MIGRATION.sql

| Table | Description | Agent | Migration File |
|---|---|---|---|
| `socelle.brand_profiles` | Public profile page data — one row per brand. Stores both auto-generated pipeline data and brand-controlled content (after claim). Contains slug, claim status, official/auto descriptions, logo/hero image URLs, category, tier, metadata JSONB. | Agent 2 | BRAND_PROFILES_MIGRATION.sql |
| `socelle.brand_claims` | Brand claim applications and active subscription records. Tracks claim workflow (pending/approved/rejected/revoked), plan tier, Stripe subscription ID, claimant identity, and proof of authority. | Agent 2 | BRAND_PROFILES_MIGRATION.sql |
| `socelle.brand_posts` | Brand-authored content posts (news, product launches, education, updates). Available to Pro and Enterprise tier claimed brands. Supports scheduling via future-dated `published_at`. | Agent 2 | BRAND_PROFILES_MIGRATION.sql |
| `socelle.brand_reviews` | Operator reviews of brands. One review per user per brand (database-enforced unique constraint). Includes overall rating (1.0–5.0), aspect scores JSONB (efficacy, value, support, training), and verified_purchase flag. | Agent 2 | BRAND_PROFILES_MIGRATION.sql |
| `socelle.brand_page_analytics` | Daily rollup of brand profile page metrics. One row per brand per calendar day. Counters: views, unique_visitors, claim_cta_clicks, affiliate_clicks, review_submissions. Computed fields refreshed nightly by pg-boss. | Agent 2 | BRAND_PROFILES_MIGRATION.sql |

**Materialized Views also created in BRAND_PROFILES_MIGRATION.sql:**
- `socelle.brand_aggregate_ratings` — pre-computed aggregate ratings per brand (review_count, avg_rating, aspect averages, verified_review_count)
- `socelle.brand_category_positioning` — relative sentiment ranking of each brand within its category and tier

**Helper Functions created in BRAND_PROFILES_MIGRATION.sql:**
- `socelle.increment_brand_analytics()` — atomic upsert for daily analytics counters
- `socelle.get_brand_claim_tier()` — returns active subscription tier for a brand (used for feature gating)

---

#### From Agent 4 (Events) — EVENTS_MIGRATION.sql

| Table | Description | Agent | Migration File |
|---|---|---|---|
| `socelle.events` | Main events table. 35+ columns covering event identity, organizer, registration, CE credits, date/time, virtual/physical location, classification tags (specialty_tags TEXT[], brand_sponsors TEXT[]), media, source attribution, status flags, and metadata JSONB. | Agent 4 | EVENTS_MIGRATION.sql |
| `socelle.event_saves` | User save/RSVP table. Tracks which professionals have saved events to their calendar. Unique constraint per user per event. | Agent 4 | EVENTS_MIGRATION.sql |
| `socelle.crawl_logs` | Pipeline execution log for all scraping runs. Records source, status, event counts, and error details per run. Also referenced by SOCELLE_AUTOMATION_SPEC.md as shared infrastructure. | Agent 4 | EVENTS_MIGRATION.sql |
| `socelle.crawler_configs` | Per-source crawl configuration. Stores rate limits, CSS selectors, authentication status, and schedule for each of the 17+ event sources. | Agent 4 | EVENTS_MIGRATION.sql |
| `socelle.geocode_cache` | Google Maps geocoding cache. Prevents redundant API calls for repeated address lookups. Critical cost control given 350–600 events/year with geocoding on each. | Agent 4 | EVENTS_MIGRATION.sql |

---

#### From Agent 5 (Affiliate) — AFFILIATE_MIGRATION.sql

| Table | Description | Agent | Migration File |
|---|---|---|---|
| `socelle.affiliate_products` | Editorially curated affiliate product catalog. Stores product identity, media, affiliate network and program data, commission rate, price (in cents), editorial controls (is_active, relevance_score >= 0.70 required), and deactivation tracking. | Agent 5 | AFFILIATE_MIGRATION.sql |
| `socelle.affiliate_placements` | Maps affiliate products to content surfaces. surface_type ENUM (feed, brand_page, event, education, benchmark, quiz_result, email). surface_entity_id = NULL means global placement for that surface type. Position (1 or 2) enforces page cap of 2 placements. | Agent 5 | AFFILIATE_MIGRATION.sql |
| `socelle.affiliate_clicks` | Click and conversion tracking. Supports both authenticated (user_id) and anonymous (session_id only) tracking. Conversion attribution recorded when affiliate network reports conversion (1–30 day delay). Revenue firewall: SELECT restricted to service_role. | Agent 5 | AFFILIATE_MIGRATION.sql |

**Views also created in AFFILIATE_MIGRATION.sql:**
- `socelle.affiliate_revenue_summary` — aggregated clicks, conversions, and commission by network, category, and month. Admin analytics only.

**Helper Functions created in AFFILIATE_MIGRATION.sql:**
- `socelle.deactivate_low_sentiment_affiliate_products()` — nightly sentiment check, deactivates products below 3.0 star average
- `socelle.get_affiliate_sentiment_warnings()` — returns brands in 3.0–3.5 warning zone for admin review
- `socelle.can_add_placement()` — validates page placement cap before insert

---

### Total New Tables: 13

| # | Table | Agent |
|---|---|---|
| 1 | socelle.brand_profiles | Agent 2 |
| 2 | socelle.brand_claims | Agent 2 |
| 3 | socelle.brand_posts | Agent 2 |
| 4 | socelle.brand_reviews | Agent 2 |
| 5 | socelle.brand_page_analytics | Agent 2 |
| 6 | socelle.events | Agent 4 |
| 7 | socelle.event_saves | Agent 4 |
| 8 | socelle.crawl_logs | Agent 4 |
| 9 | socelle.crawler_configs | Agent 4 |
| 10 | socelle.geocode_cache | Agent 4 |
| 11 | socelle.affiliate_products | Agent 5 |
| 12 | socelle.affiliate_placements | Agent 5 |
| 13 | socelle.affiliate_clicks | Agent 5 |

---

## Section 4: Revenue Model — All 6 Streams Unified

| Stream | Name | Price | Activation | Type | Spec Document | Year 1 Target |
|---|---|---|---|---|---|---|
| 0 | Premium Affiliate Commerce | $2K–$10K/mo aggregate | Day 1 | Transactional | SOCELLE_AFFILIATE_SPEC.md | $12K–$60K (Year 1 aggregate) |
| 1 | Embedded Poll Sponsorship | $1K–$5K/placement | Month 2–3 | Campaign sponsorship | WAVE1_BUILD_STRATEGY_UPDATED.md | Not specified (audience-scale dependent) |
| 2 | Brand Intelligence Reports | $500–$5K/report | Month 3–4 | One-time research | WAVE1_BUILD_STRATEGY_UPDATED.md | First 3 reports by Month 3: $7.5K–$15K |
| 3 | Sponsored Quizzes and Studies | $5K–$25K/study | Month 4–6 | Campaign research | WAVE1_BUILD_STRATEGY_UPDATED.md | Not specified (scale-dependent) |
| 4 | Brand Claim Subscriptions | $199–$999/mo per brand | Month 4–6 | SaaS MRR | SOCELLE_BRAND_CLAIM_SPEC.md | $20K+ MRR at maturity (conservative: 30 Basic + 15 Pro + 5 Enterprise = $15,420/mo) |
| 5 | Premium Operator Subscriptions | $49–$149/mo per operator | Month 6+ | SaaS MRR | WAVE1_BUILD_STRATEGY_UPDATED.md | Validated against operator behavior data Months 1–5 before activation |

**Combined Year 1 revenue target** (from WORKING_CHANNEL_ROADMAP_UPDATED.md): **$150K–$300K** across intelligence reports + brand claims + affiliate + marketplace commission.

### Stream 4 Tier Detail (Brand Claim Subscriptions)

| Tier | Monthly Price | Key Features |
|---|---|---|
| Free (Unclaimed) | $0 | Auto-generated profile from public data. No brand control. |
| Basic | $199/mo | Verified badge, editable description/logo, official news, page analytics (30-day window), operator feedback response |
| Pro | $499/mo | Basic + education content upload, product launch features, operator demographic data (90-day window), priority category placement |
| Enterprise | $999/mo | Pro + API access to intelligence data, survey sponsorship credits, co-branded reports, dedicated account support, commerce-ready product catalog, analytics (12-month window) |

---

## Section 5: Automation Architecture — All 10 pg-boss Queues

All queues are SOCELLE-specific additions to the shared pg-boss instance defined in the Beauty Intelligence Data Architecture. They do not create a parallel job system.

| # | Queue Name | Function | Cadence | Priority | Connected to |
|---|---|---|---|---|---|
| 1 | `socelle-crawl-events` | Extract events from 14+ sources, normalize, upsert to socelle.events | Weekly (Sunday 2:00 AM ET) | 5 (medium) | socelle.events, socelle.crawl_logs, feed_items (type=event) |
| 2 | `socelle-aggregate-news` | RSS aggregation from 33+ feeds, auto-categorize, publish to feed_items | Every 6 hours | 8 (highest) | feed_items (type=news), rss_feed_sources |
| 3 | `socelle-crawl-reddit` | Monitor 7 beauty subreddits for trending topics and brand mentions | Every 4 hours (high-signal subs) / Daily (others) | 3 (low) | reddit_signals → mv_trend_scores, socelle-generate-polls queue |
| 4 | `socelle-assemble-brand-profiles` | Monthly assembly of brand_profiles rows from all pipeline sources | Monthly (1st Sunday, 3:00 AM ET) | 5 (medium) | brand_profiles, mv_brand_sentiment, mv_brand_trend_profile, mv_education_content, mv_brand_adoption |
| 5 | `socelle-match-affiliates` | Auto-match affiliate products to content surfaces, create pending_review placements | Weekly (Wednesday 1:00 AM ET) | 3 (low) | affiliate_products, affiliate_placements, feed_items, socelle.events |
| 6 | `socelle-enrich-profiles` | Enrich new professional profiles from public license databases and social bios | On signup (event-triggered) | 7 (high) | user_profiles, explore_profiles, profile_enrichment_log |
| 7 | `socelle-generate-polls` | LLM-assisted poll generation from trending topics — creates draft only, never auto-publishes | Monday/Wednesday/Friday 8:00 AM ET | 2 (lowest) | mv_trend_scores, reddit_signals, socelle.polls |
| 8 | `socelle-compute-brand-scores` | Refresh brand-related materialized views between monthly full assemblies | Daily (1:00 AM ET) | 5 (medium) | mv_brand_sentiment, mv_brand_adoption, mv_brand_trend_profile, mv_brand_scores |
| 9 | `socelle-send-briefings` | Compile and send personalized daily briefing emails in batches of 500 | Daily (6:00 AM ET) | 7 (high) | feed_items, socelle.events, socelle.polls, affiliate_products, user_profiles |
| 10 | `socelle-track-freshness` | Monitor data freshness SLAs across all socelle.* tables, create alerts on breach | Nightly (12:00 AM ET) | 5 (medium) | All tables with updated_at / last_pulled_at — data_quality_alerts, Slack #data-alerts |

### Pipeline Use Case Connections (8 Use Cases to SOCELLE Surfaces)

| Pipeline Use Case | SOCELLE Surface | Tables | Refresh |
|---|---|---|---|
| UC-6: Brand/Product Assortment | Brand profile pages — product catalog and overview | brand_products → brand_profiles.auto_description | Monthly |
| UC-3: Review/Sentiment | Brand profile pages — professional sentiment section | reviews_processed → mv_brand_sentiment → brand_profiles | Weekly |
| UC-7: Trend Intelligence | Brand pages + feed trend items + homepage widget | trend_signals_weekly → mv_trend_scores → brand_profiles.trend_stage | Weekly |
| UC-8: Education/Content | Education content index + brand education section | youtube_signals + content_index → feed_items (type=education) | Daily |
| UC-5: Pricing Intelligence | Benchmarking pages + brand page pricing data | pricing_signals → mv_metro_benchmarks → brand_profiles.price_context | Weekly |
| UC-1 + UC-2: Business Intelligence | Provider adoption maps on brand pages | businesses_enriched → mv_competitive_landscape → brand_profiles.adoption_section | Weekly |
| UC-4: Local Competitor Intelligence | Operator benchmarking dashboard (premium tier) | market_opportunity → mv_business_scores → /portal/benchmarks | Daily |
| All: Confidence Scores | All surfaces — confidence badge component | All pipeline tables (.confidence_level columns) → ConfidenceBadge component | Continuous |

---

## Section 6: Key Cross-Document References — Dependency Map

The following dependencies must be respected in both build order and data flow. Listed as "A depends on B" meaning A cannot function without B being built/run first.

### Database Dependencies (Build Order)

```
Baseline migrations (brands, user_profiles, auth) — MUST EXIST FIRST
    ↓
EVENTS_MIGRATION.sql
  - socelle.events needs socelle.brands (FK: organizer_brand_id)
  - socelle.event_saves needs user_profiles (FK: user_id)
    ↓
BRAND_PROFILES_MIGRATION.sql
  - socelle.brand_profiles needs socelle.brands (FK: brand_id)
  - socelle.brand_claims needs socelle.brands + socelle.user_profiles (FK)
  - socelle.brand_posts needs socelle.brands + socelle.user_profiles (FK)
  - socelle.brand_reviews needs socelle.brands + socelle.user_profiles (FK)
  - socelle.brand_page_analytics needs socelle.brands (FK)
    ↓
AFFILIATE_MIGRATION.sql
  - socelle.affiliate_clicks references auth.users (FK: user_id — note: auth.users not socelle.user_profiles)
  - deactivate_low_sentiment_affiliate_products() queries socelle.brand_reviews (must exist)
  - get_affiliate_sentiment_warnings() joins socelle.brand_reviews (must exist)
```

### Feature Dependencies (Product Layer)

```
SOCELLE_BRAND_PROFILES_SPEC.md
  → requires BRAND_PROFILES_MIGRATION.sql (data tables)
  → requires SOCELLE_AUTOMATION_SPEC.md queue 4 (assembly pipeline)
  → references SOCELLE_BRAND_CLAIM_SPEC.md (claim CTA detail)
  → references SOCELLE_AFFILIATE_SPEC.md (affiliate block on brand pages)

SOCELLE_BRAND_CLAIM_SPEC.md
  → requires brand_profiles table from BRAND_PROFILES_MIGRATION.sql
  → requires brand_claims table from BRAND_PROFILES_MIGRATION.sql
  → requires Stripe integration (not yet specified in a dedicated migration)
  → Enterprise tier requires WO-21 (Enterprise Intelligence API, already built)

SOCELLE_EVENTS_SPEC.md
  → requires EVENTS_MIGRATION.sql (data tables)
  → requires SOCELLE_AUTOMATION_SPEC.md queue 1 (crawl-events pipeline)
  → references SOCELLE_AFFILIATE_SPEC.md (affiliate block on event pages)

SOCELLE_AFFILIATE_SPEC.md
  → requires AFFILIATE_MIGRATION.sql (data tables)
  → requires brand_reviews from BRAND_PROFILES_MIGRATION.sql (sentiment check)
  → requires SOCELLE_AUTOMATION_SPEC.md queue 5 (match-affiliates pipeline)
  → requires affiliate_placements to reference socelle.events entities (surface_entity_id)

SOCELLE_AUTOMATION_SPEC.md
  → requires ALL THREE SQL migrations (queue workers write to all tables)
  → requires BeautyIntel_DataArchitect_Spec.docx pipeline (shared UC-1 through UC-8)
  → requires Enterprise Hardening Appendix section G.2 (pg-boss base config)
```

### Revenue Stream Dependencies

```
Stream 0 (Affiliate) Day 1
  → requires AFFILIATE_MIGRATION.sql
  → requires editorial catalog (50 hero products curated before launch)
  → requires affiliate network approvals (ShareASale, Impact.com, CJ, Amazon)

Stream 4 (Brand Claim) Month 4–6
  → requires BRAND_PROFILES_MIGRATION.sql (brand_profiles, brand_claims)
  → requires Stream 0 to be live (brand profile pages with affiliate blocks validate page value)
  → requires Stripe Products and Prices configured (3 subscription products)
  → requires sufficient brand profile page traffic for organic claim discovery
```

---

## Section 7: Contradictions and Issues Found

A thorough review of all 9 output documents identified the following issues:

---

### Issue 1: Source Count Discrepancy — Events Sources

**Documents:** SOCELLE_EVENTS_SPEC.md (Section 1) vs. SOCELLE_AUTOMATION_SPEC.md (Queue 1)

**Nature:** SOCELLE_EVENTS_SPEC.md defines **17 primary sources** in its source registry table (plus 3 additional identified sources). SOCELLE_AUTOMATION_SPEC.md Queue 1 (`socelle-crawl-events`) states "14+ sources" in its function description and lists exactly 14 sources.

**Specific difference:** Sources 15 (Dermascope Magazine), 16 (Skin Inc Magazine), and 17 (ABMP — Associated Bodywork & Massage Professionals) appear in the Events Spec source table but are absent from the Automation Spec queue 1 source list.

**Severity:** Minor — both counts are "+" prefixed. The 17-source Events Spec is the more detailed document and should be authoritative.

**Recommended fix:** Update `socelle-crawl-events` queue documentation in SOCELLE_AUTOMATION_SPEC.md to read "17+ sources" and add Dermascope, Skin Inc, and ABMP to the sources list for Queue 1.

---

### Issue 2: Email Provider Discrepancy

**Documents:** WORKING_CHANNEL_ROADMAP_UPDATED.md vs. SOCELLE_AUTOMATION_SPEC.md (Queue 9)

**Nature:** WORKING_CHANNEL_ROADMAP_UPDATED.md specifies **Brevo (formerly Sendinblue)** as the CRM/email/SMS provider, with explicit rationale (100K free contacts, Claude MCP integration, API plugs into Supabase via Edge Functions). SOCELLE_AUTOMATION_SPEC.md Queue 9 (`socelle-send-briefings`) specifies **Resend** as primary email provider with **SendGrid** as fallback. Brevo is not mentioned.

**Severity:** Major — Brevo vs. Resend is an infrastructure decision with significant integration implications. The Automation Spec was written after the Channel Roadmap, and Resend is a more appropriate transactional email tool for high-volume briefing sends. However, Brevo was selected for its CRM capabilities (segmentation, contact attributes for Explore Profile targeting). These are not mutually exclusive — Brevo for CRM and segmentation, Resend for high-volume transactional sends — but this split is not documented anywhere.

**Recommended fix:** Add a clarifying note to both documents: "Brevo is the CRM/segmentation layer (contact management, Explore Profile attributes, list management). Resend is the transactional send layer for high-volume daily briefings. These operate in tandem." Confirm this architecture with the founding team before engineering begins.

---

### Issue 3: `set_updated_at()` Function Duplication

**Documents:** BRAND_PROFILES_MIGRATION.sql vs. AFFILIATE_MIGRATION.sql

**Nature:** Both SQL migration files create `socelle.set_updated_at()` using `CREATE OR REPLACE FUNCTION`. If run in sequence (as recommended), the second execution will silently replace the first. This is not a runtime error — both functions are identical — but it is a code smell and creates unnecessary dependency on execution order.

**Severity:** Minor — no functional impact since the functions are identical. `CREATE OR REPLACE` handles this gracefully.

**Recommended fix:** Extract `socelle.set_updated_at()` into a dedicated baseline migration (e.g., `0073_socelle_shared_functions.sql`) and remove it from both BRAND_PROFILES_MIGRATION.sql and AFFILIATE_MIGRATION.sql. Both files should add a `-- Requires: socelle.set_updated_at() from shared functions migration` comment.

---

### Issue 4: `affiliate_clicks` References `auth.users` Not `socelle.user_profiles`

**Documents:** AFFILIATE_MIGRATION.sql vs. BRAND_PROFILES_MIGRATION.sql (all other tables)

**Nature:** All tables in BRAND_PROFILES_MIGRATION.sql use `socelle.user_profiles(id)` as the FK for user references. `socelle.affiliate_clicks` in AFFILIATE_MIGRATION.sql uses `auth.users(id)` as the FK for `user_id`. This inconsistency exists because `auth.users` is the Supabase auth table and `socelle.user_profiles` is the application-level extension — and both are valid depending on what data is needed.

**Severity:** Minor — no functional impact, but inconsistency may confuse developers joining the project.

**Recommended fix:** Document the deliberate choice in a SQL comment: "References auth.users (not socelle.user_profiles) because click attribution needs only the auth identity for anonymization on account deletion (ON DELETE SET NULL). No profile data is needed for click records." This clarification should be added to AFFILIATE_MIGRATION.sql.

---

### Issue 5: Stripe Integration Not Specified in Any Migration

**Documents:** SOCELLE_BRAND_CLAIM_SPEC.md (references Stripe Products, Prices, webhooks, subscription lifecycle)

**Nature:** The Brand Claim Spec fully specifies the Stripe integration architecture (three Products, three Price objects, five webhook events, subscription lifecycle state machine). However, no migration file creates Stripe-related configuration tables or a Stripe webhook handler. The `stripe_subscription_id` and `monthly_price_cents` columns in `socelle.brand_claims` are the only database artifacts of the Stripe integration.

**Severity:** Major (gap) — Stripe configuration (API keys, webhook endpoint registration, product IDs) requires a configuration migration or Supabase Edge Function that is not yet specified.

**Recommended fix:** Create a `0074_stripe_integration_config.sql` migration that adds a `socelle.stripe_products` table (or Supabase Vault secrets for Stripe keys) and a `socelle.stripe_webhook_log` table. Alternatively, specify a Stripe Webhook edge function as a WO-26 deliverable.

---

### Issue 6: `brand_reviews.brand` Column Not Defined in Schema

**Documents:** AFFILIATE_MIGRATION.sql (`deactivate_low_sentiment_affiliate_products`) vs. BRAND_PROFILES_MIGRATION.sql

**Nature:** The `deactivate_low_sentiment_affiliate_products()` function in AFFILIATE_MIGRATION.sql joins against `socelle.brand_reviews` on the `brand` column (TEXT), matching it to `socelle.affiliate_products.brand` (TEXT). However, the `brand_reviews` table defined in BRAND_PROFILES_MIGRATION.sql does not have a `brand` TEXT column — it only has `brand_id UUID FK`. The join would fail at runtime.

**Severity:** Critical — the sentiment auto-removal function will raise a PostgreSQL error on execution because `brand_reviews.brand` does not exist.

**Recommended fix:** Update `deactivate_low_sentiment_affiliate_products()` to join via `brand_id` using a subquery through `brand_profiles`:

```sql
WITH flagged_brands AS (
    SELECT bp.id AS brand_id, AVG(br.rating) AS avg_rating
    FROM socelle.brand_reviews br
    JOIN socelle.brand_profiles bp ON bp.brand_id = br.brand_id
    GROUP BY bp.id
    HAVING AVG(br.rating) < 3.0
),
deactivated AS (
    UPDATE socelle.affiliate_products ap
    SET is_active = false,
        deactivation_reason = 'sentiment_flag',
        updated_at = NOW()
    FROM flagged_brands fb
    JOIN socelle.brand_profiles bp ON bp.id = fb.brand_id
    WHERE ap.brand = bp.slug  -- match on slug if brand TEXT = slug, or adjust to name
      AND ap.is_active = true
    RETURNING ap.id
)
```

Or, simpler: add a `brand_name TEXT` column to `brand_reviews` that mirrors the brand's name from `socelle.brands`, enabling a direct TEXT join. The exact fix depends on whether `affiliate_products.brand` stores the brand slug or brand name — this must be clarified before implementation.

---

## Section 8: Implementation Sequence

### Phase 1 (Week 1–2): Database Migrations

Run migrations in this strict order to respect foreign key dependencies:

**Step 1:** Verify baseline migrations are applied
- Confirm `socelle.brands` table exists (created in WO-10)
- Confirm `public.user_profiles` or `socelle.user_profiles` table exists (baseline auth migration)
- Confirm `socelle.schema` exists

**Step 2:** Fix Issue 6 before running migrations
- Update `deactivate_low_sentiment_affiliate_products()` in AFFILIATE_MIGRATION.sql to use a `brand_id` join instead of a `brand` TEXT join

**Step 3:** Run EVENTS_MIGRATION.sql
- Creates: events, event_saves, crawl_logs, crawler_configs, geocode_cache
- No dependency on brand_profiles tables
- Priority: highest (events pipeline starts immediately, events SEO surface goes live at launch)

**Step 4:** Run BRAND_PROFILES_MIGRATION.sql
- Creates: brand_profiles, brand_claims, brand_posts, brand_reviews, brand_page_analytics
- Creates: brand_aggregate_ratings and brand_category_positioning materialized views
- Creates: increment_brand_analytics and get_brand_claim_tier functions
- Must run AFTER EVENTS_MIGRATION.sql (crawl_logs referenced as shared infrastructure)

**Step 5:** Run AFFILIATE_MIGRATION.sql
- Creates: affiliate_products, affiliate_placements, affiliate_clicks
- Creates: affiliate_revenue_summary view
- Creates: deactivate_low_sentiment_affiliate_products, get_affiliate_sentiment_warnings, can_add_placement functions
- Must run AFTER BRAND_PROFILES_MIGRATION.sql (references brand_reviews)

**Step 6:** Seed the brand catalog
- Populate `socelle.brands` with initial brand list (56 seed brands named in SOCELLE_BRAND_PROFILES_SPEC.md Section 4)
- Run the brand_profiles DO block seed with actual UUIDs from socelle.brands

**Step 7:** Seed affiliate product catalog
- Enter 50 hero products into affiliate_products with human-reviewed relevance scores
- Do not activate any placements until editorial review is complete

---

### Phase 2 (Week 2–4): Automation Setup

**Priority order based on user-facing impact and queue priority:**

1. **Register `socelle-aggregate-news` (Queue 2, priority 8)** — highest priority queue. RSS feeds must be running before soft launch. Configure all 15 HIGH-priority feeds from Section 3 of SOCELLE_AUTOMATION_SPEC.md. Feeds include: Allure, Byrdie, WWD Beauty, Glossy, Beauty Independent, Modern Salon, Behind The Chair Blog, Dermascope, Skin Inc, Dermatology Times, AmSpa Blog, Spa Business Magazine, and 3 additional HIGH-priority feeds from the registry.

2. **Register `socelle-enrich-profiles` (Queue 6, priority 7)** — must be live before first professional signups. Requires state license API credentials for 14 states.

3. **Register `socelle-send-briefings` (Queue 9, priority 7)** — configure Resend API key. Set up Brevo contact list and segmentation attributes (specialty, location) as the CRM layer feeding the briefing send list.

4. **Register `socelle-crawl-events` (Queue 1, priority 5)** — register Eventbrite API key. Run initial seed crawl manually before the weekly job activates.

5. **Register `socelle-assemble-brand-profiles` (Queue 4, priority 5)** — run initial assembly job manually once brands table is seeded. Monthly cadence thereafter.

6. **Register `socelle-compute-brand-scores` (Queue 8, priority 5)** — daily materialized view refresh. Low setup overhead.

7. **Register `socelle-track-freshness` (Queue 10, priority 5)** — configure Slack webhook for `#data-alerts`. Nightly monitoring.

8. **Register `socelle-match-affiliates` (Queue 5, priority 3)** — weekly affiliate matching. Requires affiliate catalog to be seeded first.

9. **Register `socelle-crawl-reddit` (Queue 3, priority 3)** — no API key required. Feeds trend pipeline.

10. **Register `socelle-generate-polls` (Queue 7, priority 2)** — LLM integration required (OpenAI or Anthropic API key). Configure Slack notification for content editor.

---

### Phase 3 (Month 1–2): Public Pages

**Build `/brands/[slug]` — Brand Profile Page**
- Template: 8 sections as specified in SOCELLE_BRAND_PROFILES_SPEC.md
- Auto-generated sections first (no brand involvement required)
- Claim CTA banner on all unclaimed profiles
- Affiliate block: 2 placements max per page
- JSON-LD structured data: Organization + Product + AggregateRating schemas
- SEO title template: `[Brand Name] — Professional Reviews, Pricing & Intelligence | Socelle`

**Build `/events` — Events Index**
- Filter controls: event type, specialty, location, date range, CE credits filter
- Map view toggle with geocoded event markers
- Mobile-first — estheticians browse events on mobile

**Build `/events/[slug]` — Event Detail Page**
- Full event detail with registration CTA
- CE credits badge (prominent for esthetics/medspa events)
- Affiliate "prepare for [event]" block
- JSON-LD Event structured data

**Submit sitemap to Google Search Console for all new routes**
- Configure auto-submission on new brand_profile upsert (triggered by `socelle-assemble-brand-profiles`)
- Configure auto-submission on new event insert

---

### Phase 4 (Month 2–3): Monetization Activation

**Affiliate Commerce (Stream 0 — already live from Phase 1)**
- Complete affiliate network applications (ShareASale application typically 7–14 day approval)
- Activate first 10–15 placements on highest-traffic pages after editorial review
- Configure affiliate network webhook for conversion attribution

**Brand Claim Funnel (Stream 4 — activate after brand profile traffic establishes)**
- Configure Stripe: create 3 Products (Basic, Pro, Enterprise), 3 Prices ($199, $499, $999)
- Build `/brands/[slug]/claim` funnel (8 steps per SOCELLE_BRAND_CLAIM_SPEC.md)
- Set up Stripe webhook handler (Edge Function) for subscription lifecycle events
- Deploy first outbound email campaign notifying brands that their auto-generated profile exists

**Poll Sponsorship (Stream 1 — Month 2–3)**
- Requires first poll engagement data to demonstrate scale to brand partners
- Build poll sponsorship pitch deck using engagement data from `socelle-generate-polls` output

---

## Section 9: Open Questions for Human Review

The following decisions were flagged in agent outputs as requiring human decision before implementation. These are not agent decisions to make.

---

**Q1: Which Stripe products to create first?**
Should Stripe be configured for all three tiers (Basic/Pro/Enterprise) at launch, or start with Basic only and unlock higher tiers as the brand dashboard matures? Agent 3 recommends all three at launch.

---

**Q2: Which 15 RSS feeds to prioritize for launch week?**
SOCELLE_AUTOMATION_SPEC.md Section 3 lists 33+ feeds with HIGH/MEDIUM/LOW priority tiers. The 15 HIGH-priority feeds are identified but the exact launch week list requires founder sign-off. Recommended launch set: Allure, Byrdie, WWD Beauty, Glossy, Beauty Independent, Modern Salon, Behind The Chair Blog, Dermascope, Skin Inc, Dermatology Times, AmSpa Blog, Spa Business Magazine, Refinery29 Beauty, Allure, and one medspa-specific feed (Modern Aesthetics or Practical Dermatology).

---

**Q3: Brand claim approval — who is the first admin reviewer?**
The `approved_by` column in `socelle.brand_claims` references a SOCELLE admin user. Agent 3 specifies a 48-hour review SLA. Who is the designated approver for early brand claims? The Supabase admin role must be assigned to a specific email before the claim funnel launches.

---

**Q4: Affiliate network application timeline — which to apply to first?**
ShareASale and Impact.com have 7–14 day approval windows. CJ Affiliate has a 5–7 day window. Amazon Associates has a 1–3 day window for web publishers. Recommended application sequence to ensure Day 1 launch with at least one network live: apply to Amazon Associates first (fastest), then ShareASale and CJ simultaneously.

---

**Q5: User-agent string — SocelleBot or ViaiveBot?**
Agent 4 (SOCELLE_EVENTS_SPEC.md) and Agent 6 (SOCELLE_AUTOMATION_SPEC.md) both specify `SocelleBot/1.0 (+https://socelle.com/bot; data@socelle.com)`. The shared Viaive pipeline presumably uses a Viaive-specific user-agent. Confirm that SOCELLE scraping is attributed to `SocelleBot` (not `ViaiveBot`) for all SOCELLE-owned queues. This affects how SOCELLE appears in web server logs of the 17+ event sources.

---

**Q6: Brevo + Resend architecture — deliberate split or error?**
See Issue 2 in Section 7. Is Brevo the CRM layer and Resend the transactional email layer, or should one provider handle both? This decision affects integration cost and complexity.

---

**Q7: Events MIGRATION.sql migration number**
AFFILIATE_MIGRATION.sql is explicitly numbered as migration `0072`. EVENTS_MIGRATION.sql and BRAND_PROFILES_MIGRATION.sql do not have explicit migration numbers. What are the correct sequential migration numbers for these files given that 71 migrations already exist and the affiliate migration is 0072?

---
