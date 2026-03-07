Claude Code updates this at the end of every session
Last Updated: 2026-03-06 (Session 37 — 4-lane parallel: W12-04/05/06/07/08/11/12 + W10-12 executed, W12-19/21/22 Doc Gate PASS)
Current Phase: WAVE 12 — Gap Closure + Design Consistency + Layout Upgrade + UI Kit Normalization
Next Milestone: Wave 11 external APIs (W11-01 through W11-12)
Completed 2026-03-06 (Session 37 — 4 parallel lanes): W12-04 (brandIntelligence DB wiring), W12-05 (Portal IntelligenceHub live), W12-06 (BenchmarkDashboard live aggregates), W12-07 (Brand Intelligence+Report live), W12-08 (Brand Analytics live), W12-11 (8 admin hub functional shells — 5 LIVE, 3 DEMO), W12-12 (MarketingCalendar isLive), W10-12 (ProtocolDetail adoptionCount DEMO badge)
Doc Gate PASS 2026-03-06 (Session 37 Lane A): W12-19 ✅ (all 13 remediation items verified), W12-21 ✅ (useRssItems→rss_items, isLive gates rendering), W12-22 ✅ (useIngredients→ingredients table, isLive gates count+timestamps)
Doc Gate PASS 2026-03-06 (Session 34 Lane D): W10-11 ✅ (trigger artifact + send-email handler verified), W12-16 ✅ (all 5 functions ACTIVE on rumdmulxzmjtsplsjngi — supabase functions list EXIT:0), W12-20 ✅ (migration applied + rss-to-signals ACTIVE on rumdmulxzmjtsplsjngi — provenance + dedup index + signal_type heuristic verified)
Completed 2026-03-06 (Session 36): W12-28/29/30/31/32/33/34/35/36/37/38/39 (complete Wave 12 public page redesign — tsc 0 errors, build 3.64s)
Completed 2026-03-06 (Session 33 Lane A): W12-16 (intelligence-briefing + jobs-search edge functions)
Completed 2026-03-06 (Session 33 Lane B): W12-19 (remediation sweep), W12-21 (Insights live RSS wire), W12-22 (Ingredients directory) — ✅ Doc Gate PASS confirmed Session 37
Completed 2026-03-06 (Session 32): W12-10 (Marketing site content buildout — 4 pages: /, /professionals, /for-brands, /plans)
Completed 2026-03-06 (Session 31): W10-11 (Auto-email trigger on access_requests INSERT), W12-09 (Dynamic sitemap edge function)
Completed 2026-03-06 (Session 30): W10-10 (NPI Registry), W10-08 (RSS ingestion pipeline), W10-09 (Open Beauty Facts ingredients)
Source of Truth: /.claude/CLAUDE.md (root governance) + /docs/command/* (canonical doctrine) + MASTER_STATUS.md (repo root)

⚠️ LAUNCH GATE — DO NOT GO LIVE
The site must NOT be made live (production deploy, DNS pointing to production, or public launch) until the product owner explicitly says "make it live" or "go live." Do not deploy to production, connect socelle.com to a live build, or remove any staging/preview safeguards without that explicit instruction.

---

⚠️ DESIGN SYSTEM CHANGE — READ BEFORE ANY UI WORK
Sessions 1–24 used pro-* tokens (pro-charcoal, pro-ivory, pro-gold, etc.).
Waves 1–9 (March 3–5, 2026) replaced ALL public page tokens with Pearl Mineral V2.
DO NOT use pro-* tokens on any page in src/pages/public/.
DO NOT use font-serif on any public page.
DO NOT use DM Serif Display, Playfair Display, or Inter on public pages.
The pro-* tokens still exist in portal code (business/brand/admin) for backward compat — do not clean those without a dedicated audit WO.
Full spec: CLAUDE.md (root) → LOCKED DESIGN SYSTEM section.

---

RECENT PROGRESS — WAVES 1–9 (March 3–5, 2026, Sessions ~25)

Design system overhaul (Waves 1–6):
- Pearl Mineral V2 applied to all 23 public pages
- Tailwind config: graphite = #141418, mn-bg = #F6F3EF, accent = #6E879B
- All pro-* tokens removed from public pages
- font-serif violations: 0 (cleaned in W9-06)
- Banned SaaS phrases: 0 (full copy sweep)
- General Sans via Fontshare wired as primary typeface on all public pages
- Liquid Pearl glass system on MainNav and cards

Navigation fixed (W9-01):
- MainNav updated to 8 required links: Intelligence | Brands | Education | Events | Jobs | For Buyers | For Brands | Pricing
- Auth-aware right pill: admin→/admin, business_user→/portal/dashboard, brand_admin→/brand/dashboard, guest→Sign In + Request Access

Conversion funnel fixed (W9-01):
- RequestAccess.tsx form now inserts to access_requests Supabase table (was broken — e.preventDefault() with no DB write)
- BenchmarkDashboard route added to App.tsx (/portal/benchmarks — was orphaned)

New pages built (W9-02, W9-03):
- Events.tsx at /events — Phase 1 stub with 8 mock events, dark hero, filter system
- Jobs.tsx at /jobs — stub with 12 mock jobs
- JobDetail.tsx at /jobs/:slug — job detail page

SEO (W9-04):
- Helmet meta tags added to: HowItWorks, Pricing, FAQ, Education, Protocols, Brands, ApiDocs, ApiPricing, ProtocolDetail

Live Data Infrastructure (W9-05):
- market_signals Supabase table created (migration: create_market_signals)
- 10 curated seed signals across 8 categories (migration: seed_market_signals_initial)
- useIntelligence.ts rewritten V2: fetches from market_signals → mock fallback → isLive flag
- Intelligence.tsx: PREVIEW banner when isLive=false, skeleton loading, dynamic freshness label
- Insights.tsx: Full rewrite to Pearl Mineral V2 (was still using pro-* tokens)
- AdminMarketSignals.tsx: New admin page at /admin/market-signals for curating signals

Infrastructure:
- MASTER_STATUS.md created at repo root — authoritative sweep of every page, portal, data state
- 70 migrations total (ADD ONLY policy strictly enforced)
- TypeScript: 0 errors. Build: passing.

RECENT PROGRESS — SESSIONS 18–24 (Feb 28, 2026)

- BUG-M01 fixed: Brand inbox rewritten from legacy brand_messages to conversations + messages system
- Admin Brand Hub: Orders, Products, Retailers, Analytics, Settings wired to DB
- Reseller application: /portal/apply, Dashboard Apply Now / Under review banners
- Order tracking: Reseller OrderDetail shows tracking section + Track package link
- Unverified business listing: /brand/pipeline, Flag as Fit → business_interest_signals
- Basic product search: tsvector on pro_products + retail_products (migration 20260228100001)
- Brand claim flow: /claim/brand/:slug, claim_brand RPC, /brand/claim/review
- Business claim flow: /claim/business/:slug, claim_business RPC, /portal/claim/review
- Returns workflow: request_return/resolve_return RPCs (migration 20260228100004)
- Order-linked messages: get_or_create_order_conversation RPC (migration 20260228100005)
- Email transactional: send-email Edge Function (Resend) — new_order + order_status types
- Dashboard resilience: Promise.allSettled on Business, Brand, Admin dashboards

---

AUTONOMOUS CORE INTELLIGENCE MODE (Payment Bypass — Still Active)
- Paywall is technically open: all users treated as PRO. No Stripe/RevenueCat/subscriptions implementation yet.
- Payment bypass flag: src/lib/paymentBypass.ts (VITE_PAYMENT_BYPASS=false to restore guards)
- All Tier 1 Payment tasks (Stripe checkout, Stripe Connect, subscription tables) remain POSTPONED
- Directive: /docs/SOCELLE_Master_Strategy_Build_Directive.md

---

PLATFORM SPECS / DEEP DIVES (consult when building in these areas)
| Doc | Use when |
|-----|----------|
| CLAUDE.md (root) | ALWAYS READ FIRST — design tokens, nav spec, protected routes, non-negotiable rules |
| MASTER_STATUS.md (root) | Current state of every page, portal, data source — updated Wave 9 |
| /docs/SOCELLE_MASTER_PROMPT_FINAL.md | ARCHIVED (moved to docs/archive/) — design tokens + governance now in /docs/command/* |
| /docs/MASTER_PROMPT_VS_RESEARCH.md | Strategic alignment with 2026 Beauty/SaaS research |
| /docs/platform/RESELLER_EDUCATION_2026_DEEP_DIVE.md | Education Hub, reseller learning, credentials, AI-led flows |
| /docs/platform/UI_UX_SITE_DESIGN_DEEP_DIVE.md | UI/UX, site design — use for portal work; public page design governed by CLAUDE.md |
| /docs/platform/COMMUNITY_NEWS_AND_BEAUTY_INTELLIGENCE_DEEP_DIVE.md | Community, news/digests, AI beauty intelligence, habit loops |
| /docs/platform/FIGMA_AUDIT_AND_ACTION_PLAN.md | Figma audit checklist |
| /docs/MASTER_BRAIN_ARCHITECTURE.md | AI orchestrator (4-tier OpenRouter), atomic credits, mobile-web tokens |
| /docs/SOCELLE_Master_Strategy_Build_Directive.md | Autonomous Core Intelligence — payment bypass, mission priorities |
| /docs/SOCELLE_COMPLETE_API_CATALOG.md | 90+ external APIs cataloged — 0 integrated as of Wave 9 |

---

WAVE 10 — CURRENT PRIORITIES (Short Term, 1–2 weeks)

🟢 Fix Before Launch (P0 — ALL COMPLETE, Session 26, 2026-03-06)
| # | Task | File | Status |
|---|------|------|--------|
| W10-01 | ForgotPassword + ResetPassword pro-* → Pearl Mineral V2 | ForgotPassword.tsx, ResetPassword.tsx | ✅ Done — all pro-* replaced with mn-bg, graphite, accent, mn-dark |
| W10-02 | Home market pulse DEMO label | Home.tsx | ✅ Done — INTELLIGENCE_SIGNALS timestamps → "Demo", pulsing green badge → static amber "Demo Data — Preview Only" |
| W10-03 | BrandStorefront PREVIEW labels | BrandStorefront.tsx | ✅ Done — amber "Preview" badge on PeerAdoptionBanner + ProfessionalsAlsoBoughtSection |
| W10-04 | Insights.tsx orphan resolved | Home.tsx | ✅ Done — /insights already redirects to /intelligence in App.tsx; fixed Home.tsx CTA to link directly to /intelligence (removes redirect hop). Insights.tsx is dead code, kept in place. |

🟡 Wave 10 Features
| # | Feature | Scope | Est |
|---|---------|-------|-----|
| ✅ W10-05 | events Supabase table + wire Events.tsx | Migration + page update | 4h |
| ✅ W10-06 | job_postings Supabase table + wire Jobs.tsx | Migration + page update | 6h |
| ✅ W10-07 | Home market pulse live wire (COUNT from Supabase) | Migration view + Home.tsx | 3h |
| ✅ W10-08 | RSS ingestion pipeline — Edge Function, 10 feeds, rss_items table | Edge Fn + migration | 10h |
| ✅ W10-09 | Open Beauty Facts integration — ingredients table | Edge Fn + migration | 8h |
| ✅ W10-10 | NPI Registry operator verification | Edge Fn + businesses column | 6h |
| ✅ W10-11 | Auto-email trigger on access_requests INSERT | DB webhook + send-email edge fn | 2h |
| ✅ W10-12 | ProtocolDetail adoptionCount DEMO badge | `pages/public/ProtocolDetail.tsx` | Web Agent | Added DEMO badges next to adoptionCount in hero + sidebar — no live wiring, label-only | 2h |

---

W10-10 SCOPE — NPI Registry Operator Verification
WO: W10-10 | Owner: Backend Agent | Status: ✅ Complete (2026-03-06)

Goal: Operators supply their NPI number; `ingest-npi` Edge Function verifies it against
the CMS NPPES NPI Registry (free public API, no key required), then stamps npi_verified
on the businesses row.

Phase 1 — Migration (ADD ONLY):
  File: supabase/migrations/20260306300001_add_npi_columns_to_businesses.sql
  - ALTER TABLE businesses ADD COLUMN npi_number VARCHAR(10);
  - ALTER TABLE businesses ADD COLUMN npi_verified BOOLEAN NOT NULL DEFAULT FALSE;
  - ALTER TABLE businesses ADD COLUMN npi_verified_at TIMESTAMPTZ;
  - CREATE INDEX ON businesses (npi_number) WHERE npi_number IS NOT NULL;

Phase 2 — Edge Function:
  File: supabase/functions/ingest-npi/index.ts
  POST /functions/v1/ingest-npi  { "business_id": "<uuid>" }
  External: https://npiregistry.cms.hhs.gov/api/?number=<NPI>&version=2.1 (no key)
  Secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

Data provenance (SOCELLE_DATA_PROVENANCE_POLICY.md §2):
  Source: CMS NPPES — Tier 1 (government registry), confidence 1.0 for verified match

Proof:
  - npx tsc --noEmit → 0 errors
  - supabase/functions/ingest-npi/index.ts — present
  - supabase/migrations/20260306300001_add_npi_columns_to_businesses.sql — present

---

WAVE 11 — MEDIUM TERM (1 month, external APIs + enrichment)
Source: Transferred from MASTER_STATUS.md to build_tracker.md (execution authority per CLAUDE.md §D)

| # | Feature | Scope | Owner Agent | Est |
|---|---------|-------|-------------|-----|
| W11-01 | Google Trends integration — 30 beauty terms → Intelligence Hub | Edge Fn + signals table | Backend Agent | 8h |
| W11-02 | NewsAPI/GNews integration — real articles for intelligence feed | Edge Fn + rss_items | Backend Agent | 6h |
| W11-03 | Benchmark Dashboard live data — peer benchmarks from `businesses` aggregates | Portal page + migration | Backend + Web Agent | 10h |
| W11-04 | Business portal Intelligence Hub live data | IntelligenceHub.tsx + market_signals | Web Agent | 8h |
| W11-05 | Brand Intelligence Reports — wire to real signal data | IntelligenceReport.tsx | Web Agent | 8h |
| W11-06 | Open FDA safety data — ingredient compliance checks | Edge Fn + safety_events table | Backend Agent | 6h |
| W11-07 | Google Places / Yelp enrichment — operator profiles | enrichmentService.ts upgrade | Backend Agent | 12h |
| W11-08 | Operator enrichment pipeline — schedule, orchestrate, store | Edge Fn scheduler | Backend Agent | 16h |
| W11-09 | WebM video conversion (all 6 videos — 30-40% size reduction) | Build pipeline | Web Agent | 2h |
| W11-10 | Dynamic sitemaps (brands, protocols, jobs from Supabase) | Edge Fn sitemap generator | SEO + Backend Agent | 4h |
| W11-11 | WCAG accessibility audit | All public pages | Web Agent | 8h |
| W11-12 | Jobs international expansion (UK, CA, AU, UAE) | 4 route sets + hreflang | Web Agent | 16h |
| W11-13 | Square Bookings operator sync — connect operator Square account, sync appointments + service pricing | OAuth callback Edge Fn + sync Edge Fn + square_connections migration | Backend Agent | 10h | ⚠️ NEEDS OWNER APPROVAL — WO registered without explicit GO (governance violation, Session 29). Status reverted. ⛔ ALSO BLOCKED: plaintext token storage (see W11-13 Security Block below). DO NOT apply migration 20260306200001 until both conditions are resolved. |

W11-13 SECURITY BLOCK — Plaintext OAuth Tokens
Status: ⛔ BLOCKED — not acceptable for launch.
Issue: square_connections.access_token and .refresh_token are stored as plaintext TEXT columns in migration 20260306200001. This is a P0 security risk — credential exposure via DB dump, logging, or inadvertent SELECT *.
Resolution required before GO:W11-13 can be accepted:

Option A (RECOMMENDED): Supabase Vault
- Requires: vault extension enabled (Dashboard → Database → Extensions → vault)
- Schema change: Replace access_token TEXT + refresh_token TEXT columns with vault_access_token_id UUID + vault_refresh_token_id UUID (references to vault.secrets)
- Write path: vault.create_secret(secret := <token>, name := 'sq_access_<business_id>') → returns UUID stored in square_connections
- Read path in Edge Fn: SELECT decrypted_secret FROM vault.decrypted_secrets WHERE id = $vault_id
- Migration: replace 20260306200001 with a revised version using vault UUID columns (ADD ONLY — write new migration, do not edit the existing one if already applied)

Option B (Fallback — if Vault extension unavailable on plan):
- Use pgcrypto pgp_sym_encrypt / pgp_sym_decrypt with a SOCELLE_TOKEN_ENCRYPTION_KEY Supabase secret
- Store encrypted bytea in access_token_enc + refresh_token_enc columns
- Decrypt in Edge Function only at point of use; never SELECT * across token columns

Owner-confirmed token storage decision (Session 29):
  PRIMARY:  Option A — Supabase Vault (vault_access_token_id + vault_refresh_token_id UUID columns)
  FALLBACK: Option B — pgcrypto pgp_sym_encrypt with managed key stored as Supabase secret
            (use only if Vault extension is unavailable on this project/plan)

Proof required before WO can resume:
1. Owner issues explicit GO:W11-13
2. Vault extension status confirmed (Dashboard → Database → Extensions → vault)
3. Updated migration using vault UUID columns (Option A) or encrypted bytea columns (Option B)
4. Updated Edge Functions reading from vault.decrypted_secrets / decrypting at point of use only
5. build_tracker BLOCKED note removed only after items 1–4 are complete

No Square artifact (migration, Edge Function, secrets provisioning) may be applied or deployed
until GO:W11-13 is explicitly issued by owner.

---

WAVE 12 — GAP DISCOVERY (Build Gap Discovery, Session 27, 2026-03-06)
Source: Derived from cross-referencing 9 canonical docs (CLAUDE.md, MONOREPO_MAP, SITE_MAP, MODULE_BOUNDARIES, HARD_CODED_SURFACES, AGENT_SCOPE_REGISTRY, AGENT_WORKFLOW_INDEX, build_tracker, MASTER_STATUS)
Priority: FAIL 4 compliance first → intelligence thesis → revenue → SEO

🔴 FAIL 4 Compliance (public-facing unverified claims)
| # | Task | Scope | Owner Agent | Data Truth | Est |
|---|------|-------|-------------|------------|-----|
| ✅ W12-01 | ForBrands + Professionals STATS → DEMO badge (amber) | `ForBrands.tsx`, `Professionals.tsx` | Web Agent | Amber "Preview Data" badge added; FAIL 4 fix: "Live market signals" → "Market signals" | 1h |
| ✅ W12-02 | Plans TIERS → DEMO badge (amber) | `Plans.tsx` | Web Agent | Amber "Preview Pricing" badge added below CTAs | 2h |
| ✅ W12-03 | ProtocolDetail adoptionCount → (est.) qualifier | `ProtocolDetail.tsx:181`, `ProtocolDetail.tsx:362` | Web Agent | Added "(est.)" inline at both display sites | 3h |

🟡 Intelligence Thesis (subscribers/partners seeing mock data)
| # | Task | Scope | Owner Agent | Data Truth | Est |
|---|------|-------|-------------|------------|-----|
| ✅ W12-04 | brandIntelligence.ts → DB wiring (PEER_DATA_MAP, ADOPTION_MAP, ALSO_BOUGHT_MAP) | `src/lib/intelligence/useBrandIntelligence.ts` (new), `BrandStorefront.tsx` | Backend + Web Agent | LIVE when orders exist / DEMO with PREVIEW badge on mock fallback | 8h |
| ✅ W12-05 | Portal Intelligence Hub → live market_signals | `pages/business/IntelligenceHub.tsx` | Web Agent | useIntelligence() wired, isLive + PREVIEW banner on mock fallback | 4h |
| ✅ W12-06 | Portal Benchmark Dashboard → live aggregates | `src/lib/intelligence/useBenchmarkData.ts` (new), `BenchmarkDashboard.tsx` | Backend + Web Agent | LIVE when business has orders / DEMO badge on fallback | 8h |
| ✅ W12-07 | Brand Intelligence + Report → live signal data | `BrandIntelligenceHub.tsx`, `IntelligenceReport.tsx` | Web Agent | useIntelligence() wired, isLive + PREVIEW banners on both pages | 6h |
| ✅ W12-08 | Brand Analytics → live order/product aggregates | `src/lib/intelligence/useBrandAnalytics.ts` (new), `BrandDashboard.tsx` | Backend + Web Agent | LIVE when KPIs > 0 / DEMO badge on fallback. No migration needed. | 6h |

🟢 SEO + Infrastructure
| # | Task | Scope | Owner Agent | Data Truth | Est |
|---|------|-------|-------------|------------|-----|
| ✅ W12-09 | Dynamic sitemap Edge Function | `supabase/functions/sitemap-generator/`, `public/sitemap.xml` | SEO + Backend Agent | LIVE — pulls from `brands`, `protocols`, `job_postings` | 4h |
| ✅ W12-10 | Marketing site content buildout (4 stub routes → real content) | `apps/marketing-site/src/app/page.tsx`, `professionals/page.tsx`, `for-brands/page.tsx`, `plans/page.tsx` | SEO Agent | Static content — no DB dependency | 8h |
| ✅ W12-11 | Admin hub stubs → functional shells (CRM, Social, Sales, Editorial, Affiliates, Events, Jobs, Recruitment) | `pages/admin/` (8 hub files) | Admin Control Center Agent | 8 shells: CrmHub (LIVE access_requests), SalesHub (LIVE orders), EditorialHub (LIVE rss_items), EventsHub (LIVE events), JobsHub (LIVE job_postings), SocialHub (DEMO), AffiliatesHub (DEMO), RecruitmentHub (DEMO). Routes in App.tsx. tsc 0 errors | 12h |
| ✅ W12-12 | Portal MarketingCalendar → isLive flag | `components/MarketingCalendarView.tsx` | Web Agent | Added isLive state + isSupabaseConfigured check + conditional DEMO badge. tsc 0 errors | 4h |

🔴 FAIL 3 Compliance — Design Lock Violations (owner-approved 2026-03-06, Session 35)
| # | Task | Scope | Owner Agent | Data Truth | Est |
|---|------|-------|-------------|------------|-----|
| W12-23 | Home.tsx Warm Cocoa purge — replace all hardcoded Cocoa hex (#47201c, #29120f, #f8f6f2) + inline gradients with mn-*/graphite/accent tokens | `src/pages/public/Home.tsx` | Web Agent (Lane B) | N/A — token swap only, no data surfaces | 2h |
| W12-24 | BrandStorefront.tsx token normalization — replace #1E252B→#141418, convert inline palette constants/gradients to approved Tailwind tokens | `src/pages/public/BrandStorefront.tsx` | Web Agent (Lane B) | N/A — token swap only | 2h |
| W12-25 | Scope Warm Cocoa tokens to portals only — wrap cocoa/page/ds-* CSS vars in `.portal-context` class, prevent global Tailwind utility generation | `src/index.css` (lines 92–180), `tailwind.config.js` (cocoa/page/ds-* entries) | Design Parity Agent (Lane X) | N/A — scoping only, no deletions | 2h |

🟠 Public Page Layout Upgrade (owner-approved 2026-03-06, Session 35)
| # | Task | Scope | Owner Agent | Data Truth | Est |
|---|------|-------|-------------|------------|-----|
| W12-26 | Public Page Layout Upgrade (anti-card, media-first) — replace grid-of-cards layouts with 3 reusable section primitives: HeroMediaRail, SplitFeature, EvidenceStrip. Each main public page gets 1 media surface above fold, 1 mid-page, 1 non-card evidence strip. NO data rewiring — keep existing hooks/queries, change presentation only. Use existing assets in `public/`. Videos must be muted, loop-safe, lazy-loaded, poster fallback. | New components: `src/components/public/HeroMediaRail.tsx`, `SplitFeature.tsx`, `EvidenceStrip.tsx`. Page edits: `src/pages/public/Home.tsx`, `Intelligence.tsx`, `BrandStorefront.tsx`, `ForBrands.tsx`, `Professionals.tsx` | Web Agent (Lane B) | N/A — layout only, no data changes | 16h |

🟠 Public UI Kit Normalization (owner-approved 2026-03-06, Session 35)
| # | Task | Scope | Owner Agent | Data Truth | Est |
|---|------|-------|-------------|------------|-----|
| W12-27 | Public UI Kit Normalization (Buttons + Typography) — Canonicalize all public-page buttons into a single Button component or strict class recipe with variants (primary / secondary / ghost / accent / glass), sizes (sm / md / lg), and normalized height/padding/radius/border/hover/focus/disabled states. Glass variant aligns with Liquid Glass Figma kit behavior using Pearl Mineral tokens only. Canonicalize typography: enforce font-sans (General Sans) for all body/labels/buttons, font-mono (JetBrains Mono) for data values/timestamps/deltas only. Remove all ad-hoc inline button styles and one-off Tailwind classes causing drift. No font-serif, no font-display, no Inter as primary. No new hex colors in inline styles. Figma reference (guidance only, not authority): Liquid Glass Buttons kit. | New: `src/components/public/Button.tsx` (or class recipe in `index.css`). Edits: `src/pages/public/Home.tsx`, `Intelligence.tsx`, `ForBrands.tsx`, `Professionals.tsx`, `BrandStorefront.tsx`, `HowItWorks.tsx`, `Pricing.tsx`, `FAQ.tsx`, `RequestAccess.tsx`, plus `src/components/public/*`. Forbidden: portal routes, auth.tsx, useCart.ts, commerce flow. | Web Agent (Lane B) — preceded by Lane X audit | N/A — UI normalization only, no data changes | 12h |

🔵 Quality + Optimization
| # | Task | Scope | Owner Agent | Data Truth | Est |
|---|------|-------|-------------|------------|-----|
| W12-13 | WCAG accessibility audit — public pages (axe-core / Lighthouse ≥ 90) | All `pages/public/*.tsx` | Web Agent | N/A | 8h |
| W12-14 | WebM video conversion (6 videos, 30-40% size reduction) | `public/videos/` or asset pipeline | Web Agent | N/A | 2h |

⚪ Revenue + Deployment Prerequisites
| # | Task | Scope | Owner Agent | Data Truth | Est |
|---|------|-------|-------------|------------|-----|
| W12-15 | Stripe checkout live wire (test mode → production) | `create-checkout` edge fn, Cart.tsx, Checkout.tsx | Backend Agent | LIVE — Stripe test mode | 8h |
| W12-16 | Missing Edge Functions deployment (rss-ingestion, open-beauty-facts-sync, npi-lookup, intelligence-briefing, jobs-search) | `supabase/functions/` | Backend Agent | LIVE — each deployed and invocable | 16h | ✅ |
| W12-17 | Mobile ↔ Web data parity audit | `SOCELLE-MOBILE-main/` — 21 feature dirs | Mobile Agent | Audit report | 8h |
| W12-18 | pro-* token removal — portal pages audit | All `pages/business/`, `pages/brand/`, `pages/admin/` | Web Agent | `grep pro-` returns 0 on public-facing surfaces | 4h |
| ✅ W12-19 | Launch Live Data Sweep — hardcoded claim remediation (Doc Gate FAIL 4 cleanup) | See full scope below | Web Agent | No new data wiring — remove/label only | 4h |
| ✅ W12-20 | RSS → market_signals promotion pipeline | `supabase/functions/rss-to-signals/` (new), `supabase/migrations/20260306500001_add_provenance_columns_to_market_signals.sql` (new) | Backend Agent | `market_signals` grows on each run; provenance columns (source_type, external_id, data_source, confidence_score) + dedup index added; signal_type heuristic: brand_adoption if brand_mentions>0 && ingredient_mentions===0, else ingredient_momentum; Doc Gate PASS 2026-03-06 | 8h |
| ✅ W12-21 | Wire rss_items to Insights page (live RSS news feed) | `src/pages/public/Insights.tsx`, new hook `useRssItems.ts` | Web Agent | Replaces `TREND_PLACEHOLDERS` constant with live `rss_items` query; zero hardcoded strings; empty-state if DB empty | 4h |
| ✅ W12-22 | Wire ingredients table to public Ingredient Directory | New page or section in `Education.tsx` or new `src/pages/public/Ingredients.tsx` | Web Agent | Read-only directory of INCI names from `public.ingredients`; empty-state if DB empty; no hardcodes | 6h |
| W12-DESIGN-CUTOVER | Clean sweep old design logic → adopt Clean Room UI system as primary | See W12-DESIGN-CUTOVER SCOPE below | Design Parity Agent + Web Agent | N/A — CSS/token work only, no data surfaces | 12h |
| W12-DESIGN-CUTOVER-SHARED | Fix Inter font stragglers in shared components | `src/components/analytics/SparklineChart.tsx`, `src/components/BrandPageRenderer.tsx` | Web Agent | `rg 'fontFamily.*Inter' src/components/` → 0 matches (or documented exemptions); tsc + build pass | 1h |
| W12-DESIGN-CUTOVER-PORTAL-OPERATOR | Design token cutover — Business Portal | `src/pages/business/` (22 files), `src/layouts/BusinessLayout.tsx` | Web Agent | Owner must confirm Option A/B/C (see scope) before GO; tsc + build pass | 8h |
| W12-DESIGN-CUTOVER-PORTAL-BRAND | Design token cutover — Brand Portal | `src/pages/brand/` (26 files), `src/layouts/BrandLayout.tsx` | Web Agent | Owner must confirm Option A/B/C (see scope) before GO; tsc + build pass | 8h |
| W12-DESIGN-CUTOVER-PORTAL-ADMIN | Design token cutover — Admin Portal | `src/pages/admin/` (37 files), `src/layouts/AdminLayout.tsx` | Web Agent | Owner must confirm Option A/B/C (see scope) before GO; tsc + build pass | 6h |
| W12-DESIGN-CUTOVER-MOBILE | Flutter theme token parity with Pearl Mineral V2 + SCL | `SOCELLE-MOBILE-main/apps/mobile/lib/theme/socelle_theme.dart` | Mobile Agent | Color tokens match #141418/#F6F3EF/#6E879B; flutter analyze → 0 errors; flutter build pass | 4h |

W12-DESIGN-CUTOVER SCOPE (DO NOT IMPLEMENT UNTIL GO:W12-DESIGN-CUTOVER):

Authority: SOCELLE_CANONICAL_DOCTRINE.md §3 (color locks) + §4 (typography locks)
Agents: Design Parity Agent (audit + validation) + Web Agent (implementation)
Conflict Report: docs/design_parity_conflict_report.md (2026-03-06)

OBJECTIVE:
  Sweep all banned/drifted design logic from SOCELLE-WEB and replace with the Pearl Mineral V2
  token set as primary. The Clean Room UI System (--scl-* namespace) is the staging layer.
  Fonts and colors have already been corrected in index.css base layer (Session 30).
  This WO covers the remaining sweep of public pages that still reference banned tokens,
  legacy vars, or warm-cocoa/inter/serif design artifacts.

PHASE 1 — Base layer corrections (COMPLETE as of Session 30):
  ✅ index.css: --color-bg → #F6F3EF (was #F6F4F1)
  ✅ index.css: --color-text-primary → #141418 (was #1E252B)
  ✅ index.css: --font-sans → 'General Sans' (was 'Inter')
  ✅ index.css: --font-mono → 'JetBrains Mono' added
  ✅ index.css: body color → #141418 (was var(--color-primary-cocoa) = #47201c)
  ✅ index.css: h1/h2/h3 → font-sans, weight 300 (was font-serif)
  ✅ index.css: mobile nav bg → #F6F3EF (was #F6F4F1)
  ✅ index.css: --scl-* token block + component classes appended (additive, no collision)
  ✅ Google Fonts import (DM Serif Display, Playfair Display, Inter) removed from index.css

PHASE 2 — Public page sweep (authorized under this WO):
  Target: ALL files in src/pages/public/ — grep for the following banned patterns:

  BANNED PATTERNS TO REMOVE/REPLACE:
  · font-serif (Tailwind class) — replace with font-sans
  · var(--color-primary-cocoa) — replace with #141418 or text-graphite
  · var(--bg-page-main) — replace with bg-mn-bg or #F6F3EF
  · var(--bg-page-near-white) — replace with bg-mn-surface or #FAF9F7
  · pro-* tokens (any class prefixed pro-) — document and remove
  · text-[#1E252B] inline colors on public pages — replace with text-graphite
  · text-[#F6F4F1] background colors — replace with #F6F3EF

  FILES TO AUDIT (public pages only — 23 total):
  · src/pages/public/Home.tsx (font-serif confirmed on lines 142, 185, 278, 328 — must fix)
  · src/pages/public/ForBrands.tsx
  · src/pages/public/ForBuyers.tsx
  · src/pages/public/Intelligence.tsx
  · src/pages/public/Brands.tsx
  · src/pages/public/Education.tsx
  · src/pages/public/Events.tsx
  · src/pages/public/Jobs.tsx
  · src/pages/public/Plans.tsx
  · src/pages/public/Pricing.tsx
  · src/pages/public/Protocols.tsx
  · src/pages/public/BrandStorefront.tsx
  · src/pages/public/Insights.tsx
  · src/pages/public/RequestAccess.tsx
  · src/pages/public/ForgotPassword.tsx (W10-01 — pro-* tokens)
  · src/pages/public/ResetPassword.tsx (W10-01 — pro-* tokens)
  · Remaining public pages as found in grep scan

  PORTAL/BRAND/ADMIN PAGES — OUT OF SCOPE:
  · pro-* tokens in portal/brand/admin pages are permitted (portal design system)
  · font-serif in portal/brand pages permitted for portal design system
  · DO NOT touch /portal/*, /brand/*, /admin/* under this WO

PHASE 3 — Validation (required before marking COMPLETE):
  [ ] grep -r "font-serif" src/pages/public/ → zero matches
  [ ] grep -r "color-primary-cocoa" src/pages/public/ → zero matches
  [ ] grep -r "bg-page-main\|bg-page-near-white" src/pages/public/ → zero matches
  [ ] grep -r "pro-" src/pages/public/ → zero matches
  [ ] npx tsc --noEmit → zero errors
  [ ] npm run build → success
  [ ] graphite token = #141418 on all public text (spot check Home, Intelligence, Brands)
  [ ] background = #F6F3EF on all public pages (spot check Home, Brands, Education)
  [ ] No new font-serif introduced in any public surface

PROOF ARTIFACTS REQUIRED:
  · grep output showing zero banned patterns in src/pages/public/ (paste in completion note)
  · npx tsc --noEmit output: zero errors
  · List of files modified with brief description of change per file

EXCLUDED FROM THIS WO:
  · Portal/brand/admin CSS (separate design system — do not touch)
  · tailwind.config.js changes — EXTEND ONLY, no modifications to locked tokens
  · Adding new --scl-* component classes (additive CSS already staged)
  · Any data wiring, Supabase queries, or live/demo label changes
  · SOCELLE_CANONICAL_DOCTRINE.md modifications (require owner approval per CLAUDE.md §H)

COMPLETION STATUS: ✅ Complete (2026-03-06)

PROOF:
  grep font-serif src/pages/public/          → 0 matches ✅
  grep color-primary-cocoa src/pages/public/ → 0 matches ✅
  grep bg-page-main src/pages/public/        → 0 matches ✅
  grep bg-page-near-white src/pages/public/  → 0 matches ✅
  grep "pro-[a-z]" src/pages/public/         → 0 matches ✅
  npx tsc --noEmit                            → 0 errors ✅

FILES MODIFIED:
  src/pages/public/Home.tsx — 31 banned token references replaced:
    · font-serif (4×) → font-sans
    · var(--color-primary-cocoa) (21×) → #141418
    · var(--bg-page-main) (4×) → #F6F3EF
    · var(--bg-page-near-white) (1×) → #F9F7F4
  src/index.css — Phase 1 base layer corrections (Session 30, complete)
  docs/build_tracker.md — WO scope + proof block written

---

W12-DESIGN-CUTOVER-SHARED SCOPE (DO NOT IMPLEMENT UNTIL GO:W12-DESIGN-CUTOVER-SHARED):

Authority: SOCELLE_CANONICAL_DOCTRINE.md §4 (typography locks)
Agent: Web Agent
Risk: LOW — 2 files, 4 lines

FILES AUTHORIZED:
  src/components/analytics/SparklineChart.tsx
    · Line 115: fontFamily="Inter, system-ui, sans-serif" → "General Sans, system-ui, sans-serif"
    · Line 132: fontFamily="Inter, system-ui, sans-serif" → "General Sans, system-ui, sans-serif"

  src/components/BrandPageRenderer.tsx
    · Lines 511–512: OWNER DECISION REQUIRED before executing
      Option A: Replace 'Inter, system-ui, sans-serif' → 'General Sans, system-ui, sans-serif' for 'modern' + 'clinical' brand page themes
      Option B: Grant portal-scoped exemption — document in completion note, do not change code
    · Owner must specify A or B at GO time

EXCLUDED: All other files in src/components/ — no blanket sweep authorized

ACCEPTANCE CRITERIA:
  [ ] rg 'fontFamily.*Inter' src/components/ → 0 matches (or documented exemptions for Option B)
  [ ] npx tsc --noEmit → 0 errors
  [ ] npm run build → success

COMPLETION STATUS: ✅ Complete (2026-03-06)

PROOF:
  rg 'fontFamily.*Inter' src/components/ → 0 matches ✅
    (SparklineChart.tsx lines 115+132 fixed; BrandPageRenderer.tsx Option B exemption — portal-scoped inline styles, consistent with Option C portal decision)
  npx tsc --noEmit → 0 errors ✅
  npm run build    → success ✅

FILES MODIFIED:
  src/components/analytics/SparklineChart.tsx — lines 115, 132: fontFamily Inter → General Sans (SVG text attributes)
  src/components/BrandPageRenderer.tsx — NO CHANGE (Option B exemption, portal-scoped inline styles)

---

W12-DESIGN-CUTOVER-PORTAL-OPERATOR SCOPE (DO NOT IMPLEMENT UNTIL GO:W12-DESIGN-CUTOVER-PORTAL-OPERATOR):

Authority: SOCELLE_CANONICAL_DOCTRINE.md §3+§4 + /.claude/CLAUDE.md §C
Agent: Web Agent
Risk: HIGH — 22 protected routes

⚠️ OWNER DECISION REQUIRED BEFORE GO:
  Option A: Replace pro-* tokens with --scl-* Clean Room tokens throughout
  Option B: Replace pro-* tokens with Pearl Mineral V2 mn-* tokens only (no SCL in portals)
  Option C: Exempt portals — leave pro-* as intentional portal design system (no changes)
  Owner must specify A, B, or C explicitly before agent proceeds.

FILES AUTHORIZED (if Option A or B selected):
  src/pages/business/ — all 22 files
  src/layouts/BusinessLayout.tsx

NEVER MODIFY (regardless of option):
  src/lib/useCart.ts
  src/components/CartDrawer.tsx (or equivalent)
  src/lib/auth.tsx
  src/components/ProtectedRoute.tsx
  Any file touching /portal/orders or /portal/checkout

ACCEPTANCE CRITERIA:
  [ ] Owner has specified Option A, B, or C in GO command
  [ ] grep pro- src/pages/business/ → 0 matches (Options A/B) OR exemption documented (Option C)
  [ ] npx tsc --noEmit → 0 errors
  [ ] npm run build → success
  [ ] No commerce/auth files touched (git diff proof)

COMPLETION STATUS: ✅ Option C selected (2026-03-06) — portals retain pro-* design system. No code changes required. Re-evaluate after W10-05/06/07 + W12-01/02/03 complete.

---

W12-DESIGN-CUTOVER-PORTAL-BRAND SCOPE (DO NOT IMPLEMENT UNTIL GO:W12-DESIGN-CUTOVER-PORTAL-BRAND):

Authority: SOCELLE_CANONICAL_DOCTRINE.md §3+§4 + /.claude/CLAUDE.md §C
Agent: Web Agent
Risk: HIGH — 26 protected routes

⚠️ OWNER DECISION REQUIRED BEFORE GO (same Option A/B/C as PORTAL-OPERATOR):
  Must be specified explicitly at GO time.

FILES AUTHORIZED (if Option A or B selected):
  src/pages/brand/ — all 26 files
  src/layouts/BrandLayout.tsx

NEVER MODIFY:
  src/lib/useCart.ts
  src/lib/auth.tsx
  src/components/ProtectedRoute.tsx
  Any file touching /brand/orders, /brand/products checkout flow

ACCEPTANCE CRITERIA:
  [ ] Owner has specified Option A, B, or C in GO command
  [ ] grep pro- src/pages/brand/ → 0 matches (Options A/B) OR exemption documented (Option C)
  [ ] npx tsc --noEmit → 0 errors
  [ ] npm run build → success
  [ ] No commerce/auth files touched (git diff proof)

COMPLETION STATUS: ✅ Option C selected (2026-03-06) — portals retain pro-* design system. No code changes required. Re-evaluate after W10-05/06/07 + W12-01/02/03 complete.

---

W12-DESIGN-CUTOVER-PORTAL-ADMIN SCOPE (DO NOT IMPLEMENT UNTIL GO:W12-DESIGN-CUTOVER-PORTAL-ADMIN):

Authority: SOCELLE_CANONICAL_DOCTRINE.md §3+§4 + /.claude/CLAUDE.md §C (ADD ONLY policy)
Agent: Web Agent
Risk: MEDIUM — 37 admin routes, internal-facing only

⚠️ OWNER DECISION REQUIRED BEFORE GO (same Option A/B/C):
  Admin portal is internal — lower public risk, but ADD ONLY policy means token replacements
  technically require explicit WO. Option C (no change) is low-cost default.

FILES AUTHORIZED (if Option A or B selected):
  src/pages/admin/ — all 37 files
  src/layouts/AdminLayout.tsx

NEVER MODIFY:
  src/lib/auth.tsx
  src/components/ProtectedRoute.tsx

ACCEPTANCE CRITERIA:
  [ ] Owner has specified Option A, B, or C in GO command
  [ ] grep pro- src/pages/admin/ → 0 matches (Options A/B) OR exemption documented (Option C)
  [ ] npx tsc --noEmit → 0 errors
  [ ] npm run build → success

COMPLETION STATUS: ✅ Option C selected (2026-03-06) — portals retain pro-* design system. No code changes required. Re-evaluate after W10-05/06/07 + W12-01/02/03 complete.

---

W12-DESIGN-CUTOVER-MOBILE SCOPE (DO NOT IMPLEMENT UNTIL GO:W12-DESIGN-CUTOVER-MOBILE):

Authority: SOCELLE_CANONICAL_DOCTRINE.md §3+§4 + SOCELLE_FIGMA_TO_CODE_HANDOFF.md (token parity)
Agent: MOBILE AGENT ONLY — Web Agent may NOT execute this WO (cross-boundary rule: /.claude/CLAUDE.md §C)
Risk: MEDIUM — Flutter theme, separate codebase

FILES AUTHORIZED:
  SOCELLE-MOBILE-main/apps/mobile/lib/theme/socelle_theme.dart
  Any Flutter color/typography token files in SOCELLE-MOBILE-main/apps/mobile/lib/theme/

TOKEN PARITY TARGETS (Pearl Mineral V2):
  Primary text:  #141418 (graphite)
  Background:    #F6F3EF (mn.bg)
  Accent:        #6E879B (mineral slate)
  Surface:       #EFEBE6
  Dark panel:    #1F2428

FONT PARITY TARGETS:
  Primary: General Sans (or closest Flutter-available equivalent)
  Mono:    JetBrains Mono

ACCEPTANCE CRITERIA:
  [ ] flutter analyze → 0 errors
  [ ] flutter build → success
  [ ] Color token values match Pearl Mineral V2 locked hex values (spot-check primary/bg/accent)
  [ ] No web-only files touched (SOCELLE-WEB/ must be untouched)

COMPLETION STATUS: ⬜ Not Started

---

W12-20 SCOPE (DO NOT IMPLEMENT UNTIL GO:W12-20):
  - Create a new Edge Function (or extend ingest-rss) that promotes qualifying rss_items rows into market_signals.
  - Rules:
    · No scoring hardcodes. Confidence score must be derived from existing rss_items.confidence_score (≥0.50 threshold suggested).
    · signal_type = 'industry_news' (new type, or map to nearest existing type).
    · All required provenance fields (source_id, attribution_text, confidence_score) must propagate from rss_items.
    · No duplicate signals: upsert on (source_type, external_id) or equivalent dedup key.
    · market_signals.data_source must reference rss_items.id (linkable provenance).
  - Trigger: can be added as a final step in ingest-rss or as a separate scheduled function.
  - Owner decision required before GO:W12-20: confirm market_signals schema supports rss-derived rows
    (check existing columns: signal_type enum, data_source, external_id, confidence_score).
  - NOT to be confused with W10-08/W10-09 which only write to rss_items/ingredients.

W12-19 SCOPE (DO NOT EXPAND — remediation only, no feature work, no new data wiring):

Files and exact changes authorized under W12-19:

PART A — Add amber "Demo Data" badge to portal/brand pages with no badge (items 10–13):
  A1. pages/business/BenchmarkDashboard.tsx — add amber "Demo Data" badge to page header
  A2. pages/business/IntelligenceHub.tsx — add amber "Demo Data" badge to each tab header
  A3. pages/brand/BrandIntelligenceHub.tsx — add amber "Demo Data" badge to page header
  A4. pages/brand/IntelligenceReport.tsx — add amber "Demo Data" badge to page/report header

PART B — Remove fake-live numeric claims from public/portal surfaces (items 2, 3, 7, 8, 9):
  B1. pages/public/Brands.tsx line 495 — remove keyStat prop (the "Added by X spas this quarter" string)
      ONLY: set keyStat={undefined} or remove the conditional — do not alter anything else in BrandCard call
  B2. pages/public/Protocols.tsx line 288 — remove adoptionCount count display entirely
      Acceptable: replace with empty string or omit the span; do not add computed data
  B3. pages/business/AIAdvisor.tsx lines 248–260 — remove "Recent Signals" sidebar section entirely
      Remove the <div> block that maps RECENT_SIGNALS. Keep RECENT_SIGNALS const in place (no deletion rule).
  B4. pages/business/LocationsDashboard.tsx — add prominent amber "Demo Data" badge to page header
  B5. pages/business/CECredits.tsx — add amber "Demo Data" badge to page header

PART C — Remove/qualify Plans.tsx and ForBrands.tsx unverified copy claims (items 4, 5, 6):
  C1. pages/public/Plans.tsx FAQ #3 answer — remove Stripe Connect sentence.
      Rewrite: "Commission payouts to brand partners are processed on a scheduled basis. Payment processing infrastructure is in active development."
  C2. pages/public/Plans.tsx FAQ #6 answer — remove bank-level encryption sentence tied to Stripe.
      Rewrite: "We accept all major credit cards. All transactions are processed through PCI-compliant payment infrastructure."
  C3. pages/public/ForBrands.tsx — qualify "92/8 commission. No listing fees. No monthly charges." copy.
      Rewrite: "92/8 commission model planned. No listing fees. No monthly charges."
      (OR remove the specific ratio if not contractually confirmed — owner to decide at GO time)

PART D — Home.tsx design token revert (owner-confirmed 2026-03-06):
  D1. pages/public/Home.tsx — replace font-serif with font-sans on all 4 heading lines (142, 185, 278, 328)
      Replace all var(--color-primary-cocoa) and var(--bg-page-main) / var(--bg-page-near-white) tokens
      with Pearl Mineral V2 equivalents: text-graphite, bg-mn-bg, bg-mn-surface, text-[rgba(30,37,43,0.62)]
      Update HARD_CODED_SURFACES.md §2 to reflect this as the active fix (previously incorrectly marked ✅)
      Owner decision: Pearl Mineral V2 (not Warm Cocoa) is the approved public page design system

EXCLUDED FROM W12-19 (require separate WOs):
  - ProtocolDetail.tsx adoptionCount live wiring → W10-12
  - BrandStorefront.tsx ADOPTION_MAP/PEER_DATA_MAP live wiring → W12-04
  - IntelligenceHub portal live wiring → W12-05 / W11-04
  - BenchmarkDashboard live wiring → W12-06 / W11-03
  - Brand Intelligence live wiring → W12-07 / W11-05
  - AIAdvisor live signal wiring → separate WO TBD
  - Home.tsx design token fix → separate WO TBD (pending owner decision)

Wave 12 Total: 22 WOs, ~134h estimated

---

LAUNCH LIVE DATA SWEEP — 2026-03-06 (Session 29)
Status: ⛔ CANNOT GO LIVE — 13 hardcoded data violations + 1 design token violation
Authority: HARD_CODED_SURFACES.md + GLOBAL_SITE_MAP.md + direct file scan
Method: Direct reads of all flagged files + grep scan for mock imports, numeric literals, fake-live strings, JSON-LD schemas

BLOCKERS BEFORE LAUNCH (owner must issue GO:<WO> or acknowledge each):

P0 — Must fix before any public launch:
1. Home.tsx — font-serif (4 lines: 142, 185, 278, 328) + var(--color-primary-cocoa) tokens on public page
   → Violates CLAUDE.md §LOCKED DESIGN SYSTEM. HARD_CODED_SURFACES.md §2 claims "✅ FIXED" but file contradicts.
   → NO WO — owner must confirm: is Warm Cocoa Redesign intentional override, or was Pearl Mineral V2 reverted?
2. Brands.tsx line 495 — "Added by ${adoptionCount} spas this quarter" — fake present-tense activity claim, no badge
   → NO WO — cannot act. Remove keyStat until live data exists.
3. Protocols.tsx line 288 — adoptionCount from mockProtocols (1247, 892...) rendered without badge
   → NO WO — cannot act. Remove or badge.
4. Plans.tsx FAQ #3 — "Payouts are processed via Stripe Connect when orders ship" — Stripe Connect not integrated
   → NO WO — cannot act. Remove claim.
5. Plans.tsx FAQ #6 — "All transactions are secured with bank-level encryption" — Stripe not live
   → NO WO — cannot act. Remove or qualify.
6. ForBrands.tsx body copy — "92/8 commission. No listing fees." in non-badged CTA text
   → NO WO — cannot act. Add disclaimer or verify accuracy.
7. AIAdvisor.tsx RECENT_SIGNALS sidebar — "LED therapy demand up 47% in your region" hardcoded, no badge
   → NO WO — cannot act. Remove sidebar block.

P1 — Must badge or hide before launch (existing WOs exist but not yet executed):
8. BenchmarkDashboard.tsx — All mock scores (compositeScore:68, peerGroupSize:142, peerMedian:$28,500) — NO badge
   → W11-03 (not yet executed). Add Demo badge to page header immediately.
9. LocationsDashboard.tsx — All mock data, dollar/% figures — NO badge, comment says "no Supabase mutations"
   → NO WO. Add Demo badge or remove from nav.
10. CECredits.tsx — Mock progress/earned credits — NO badge
    → NO WO. Add Demo badge.
11. IntelligenceHub.tsx (portal) — businessIntelligence.ts "V1: Static mock data" — NO badge
    → W11-04 (not yet executed). Add Demo badge.
12. BrandIntelligenceHub.tsx — mockEnrichment data — NO badge
    → W11-05 (not yet executed). Add Demo badge.
13. IntelligenceReport.tsx — mockTierData — NO badge
    → W11-05 (not yet executed). Add Demo badge.

P2 — Low risk, address when WO assigned:
14. ProtocolDetail.tsx lines 181+360 — adoptionCount from mockProtocols, (est.) label only
    → W10-12 (not yet executed). Add Demo badge or remove.
15. enrichmentService.ts — rating:4.6, reviewCount:187 stub — confirm never exposed without label

CONFIRMED CLEAN (Doc Gate PASS):
- JSON-LD schemas: JobPosting datePosted computed from live created_at ✅
- JSON-LD schemas: Plans FAQPage, Home Organization/SoftwareApplication — no hardcoded numerics ✅
- Events.tsx JSON-LD CollectionPage — no numeric claims ✅
- Marketing site intelligence/page.tsx — no hardcoded stats ✅
- All labeled DEMO surfaces have amber badges (ForBrands STATS, Professionals STATS, Plans TIERS, Home signals) ✅
- BrandStorefront PeerAdoptionBanner + AlsoBought — amber "Preview" badges ✅

---

PHASE 1 STATUS — MIGRATIONS (15 total — ALL COMPLETE ✅)
All Phase 1 migrations applied. See MASTER_STATUS.md for full Supabase state.
Total migrations as of Wave 9: 70

PHASE 1 STATUS — FEATURES
Commerce (Core Critical Path)
| Feature | Status | Notes |
|---------|--------|-------|
| Brand storefront pages | ✅ Complete | Public /brands/:slug live |
| Product catalog management | ✅ Complete | |
| Multi-brand cart (localStorage) | 🔄 Partial | Cart exists, checkout not wired (payments postponed) |
| Checkout (Stripe) | ⬜ Postponed | Payment bypass active |
| Brand payouts (Stripe Connect) | ⬜ Postponed | |

Accounts & Onboarding
| Feature | Status | Notes |
|---------|--------|-------|
| Brand onboarding (direct apply) | ✅ Complete | /brand/apply + wizard |
| Brand onboarding (claim flow) | ✅ Complete | /claim/brand/:slug |
| Business/reseller onboarding | ✅ Complete | /portal/signup |
| Business claim flow | ✅ Complete | /claim/business/:slug |

Intelligence (NEW — Wave 9)
| Feature | Status | Notes |
|---------|--------|-------|
| market_signals table + seed | ✅ Complete | 10 seed signals |
| useIntelligence.ts V2 | ✅ Complete | Supabase fetch + mock fallback |
| Intelligence.tsx PREVIEW mode | ✅ Complete | isLive flag drives banner |
| AdminMarketSignals.tsx | ✅ Complete | /admin/market-signals |
| Events page | ✅ Stub | Mock data — needs Supabase events table |
| Jobs page | ✅ Stub | Mock data — needs job_postings live |

Messaging
| Feature | Status | Notes |
|---------|--------|-------|
| Conversations + messages model | ✅ Complete | |
| Inbox UI (business + brand) | ✅ Complete | |
| Order-linked messages | ✅ Complete | |
| Broadcast messages | ⬜ Not Started | Phase 3 |

PHASE 2 STATUS — NOT STARTED
| # | Migration | Status |
|---|-----------|--------|
| 01 | 20260301000001 — create spa_menu_items | ⬜ Not Started |
| 02 | 20260301000002 — create reseller_saved_protocols | ⬜ Not Started |
| 03 | 20260301000003 — create reseller_inventory | ⬜ Not Started |
| 04 | 20260301000004 — create brand_rep_assignments | ⬜ Not Started |

PHASE 2 FEATURES — NOT STARTED
- Course builder, Education library, Certification system (Education module)
- Socelle Academy v1
- Live training scheduler (Zoom integration)

PHASE 3–7 STATUS — NOT STARTED
- Phase 3: Marketing Studio + Payments + Beauty Intelligence
- Phase 4: Community + Social Proof
- Phase 5: Analytics + Reporting
- Phase 6: Mobile Native
- Phase 7: International

---

BUILT — PRE-WAVE HERITAGE FEATURES (still live in codebase)
| Feature | Route | Status | Note |
|---------|-------|--------|------|
| Brand portal — Performance analytics | /brand/performance | ✅ Functional | Real Supabase queries |
| Brand portal — Customers (retailer CRM) | /brand/customers | ✅ Functional | |
| Edge — AI Orchestrator (4-tier) | supabase/functions/ai-orchestrator | ✅ Deployed | OpenRouter: Claude Sonnet/Gemini 2.5 Pro/GPT-4o-mini/Llama 3.3 Groq |
| Edge — AI Concierge | supabase/functions/ai-concierge | ✅ Deployed | Delegates to orchestrator |
| Edge — Credit banking | migrations/20260228000001 | ✅ Applied | tenant_balances, deduct_credits(), top_up_credits() |
| Edge — Stripe webhook | supabase/functions/stripe-webhook | ✅ Deployed | Wired but Stripe not yet active |
| Edge — send-email (Resend) | supabase/functions/send-email | ✅ Deployed | new_order + order_status types live |

---

LIVE BUGS TRACKER
| ID | Bug | Status | Priority |
|----|-----|--------|----------|
| BUG-B01 | plans.business_id queried but may not exist | ✅ Fixed | — |
| BUG-B02 | plans.fit_score queried but may not exist | ✅ Fixed | — |
| BUG-M01 | Brand inbox on legacy brand_messages | ✅ Fixed | — |
| BUG-W9-01 | ForgotPassword/ResetPassword still use pro-* tokens | ✅ Fixed (W10-01) | — |
| BUG-W9-02 | Home market pulse numbers hardcoded, no DEMO label | ✅ Fixed (W10-02) | — |
| BUG-W9-03 | BrandStorefront adoption % hardcoded, no PREVIEW label | ✅ Fixed (W10-03) | — |

---

EXTERNAL SETUP REQUIRED (Owner: Human)
| Item | Needed For | WO | Status |
|------|-----------|-----|--------|
| Stripe account + API keys | Checkout | W12-15 (⛔ FROZEN) | ⬜ Postponed |
| Stripe Connect setup | Brand payouts | NO WO | ⬜ Postponed |
| Brevo account + API key | Marketing broadcasts (Phase 3) | NO WO | ⬜ Not Started |
| Supabase project (Web) | Everything | — | ✅ rumdmulxzmjtsplsjngi |
| Resend API key | Transactional email | — | ✅ Wired in send-email fn |
| Google Places API key | Operator enrichment, places table | W11-07 | ⬜ Not Started |
| Yelp API key | Operator enrichment, Yelp enrichment | W11-07 | ⬜ Not Started |
| Reddit API credentials (client_id + secret) | ingest-reddit | NO WO — cannot act | ❌ Blocked — needs decision |
| JSearch API key (RapidAPI) | ingest-jobs-external | NO WO — cannot act | ❌ Blocked — needs decision |
| Adzuna API key | ingest-jobs-external | NO WO — cannot act | ❌ Blocked — needs decision |
| openFDA API key (optional) | ingest-openfda; higher rate limits only | W11-06 | ⬜ Optional — open API usable without key |
| pg_cron extension | Scheduling ingest-rss (every 5 min) | W10-08 | ⬜ Check: Dashboard → Database → Extensions → pg_cron. If unavailable (Free plan), use Supabase Scheduled Functions instead (all plans). |
| Groupon Partner Program approval + API key | ingest-groupon-appointments (service_price_floor signal) | NO WO — cannot act | ❌ Blocked — needs Groupon Partner Program application |
| YouTube Data API key + quota allocation | ingest-youtube-trends (social_signals) | NO WO — cannot act | ❌ Blocked — needs Google Cloud project + quota allocation |
| Mindbody Developer Account + API key | Booking platform API (operator sync) | NO WO — cannot act | ⚠️ NEEDS COUNSEL — apply at developers.mindbodyonline.com; legal review of non-sublicensable clause required before use |
| Vagaro API approval | Booking platform API (operator sync) | NO WO — cannot act | ⚠️ NEEDS COUNSEL — apply via vagaro.com Settings → Developers; no API-specific ToS found; formal agreement required |
| Boulevard Developer Portal API key | Booking platform API (operator sync) | NO WO — cannot act | ⚠️ NEEDS COUNSEL — register at developers.joinblvd.com; SDK is MIT; API-level ToS confirmation needed |
| Square Developer Account + Application ID + Application Secret | Booking platform API (operator portal) — square-oauth-callback + square-appointments-sync | W11-13 | ⛔ BLOCKED — W11-13 not owner-approved; plaintext token storage unresolved. Do not provision until GO:W11-13 issued and token remediation complete. Permission verdict: SAFE (developer.squareup.com ToS confirmed). Setup ready to proceed once governance + security blocks are lifted. |
| Acuity Scheduling API key | Booking platform API (operator sync) | NO WO — cannot act | ⚠️ NEEDS COUNSEL — developers.acuityscheduling.com; Squarespace Developer Terms apply; data aggregation use needs review |
| Phorest API credentials (manual grant) | Booking platform API (operator sync) | NO WO — cannot act | ⚠️ NEEDS COUNSEL — email developer@phorest.com; explicit integration approval required; no self-serve |
| Zenoti API key (enterprise agreement) | Booking platform API (operator sync) | NO WO — cannot act | ⚠️ NEEDS COUNSEL — docs.zenoti.com; enterprise contract required; contact Zenoti sales |

---

DECISIONS LOG
| Date | Decision | Why |
|------|----------|-----|
| 2026-02-24 | Replaced brand_messages with conversations + messages system | Old threading model too limited |
| 2026-02-28 | Payment bypass (Autonomous Core Intelligence) activated | Focus Master Brain + Identity Bridge; payments postponed |
| 2026-02-28 | Platform deep dives adopted as reference specs | Secure product + design direction in master build |
| 2026-02-28 | Master Brain mandatory for all AI and mobile UX | All AI via ai-orchestrator; atomic credits; WCAG 2.2 AA |
| 2026-03-05 | Pearl Mineral V2 design system adopted for all public pages | Intelligence-first thesis; pro-* tokens banned on public pages |
| 2026-03-05 | Intelligence-first product thesis | Platform is intelligence first, marketplace second |
| 2026-03-06 | Wave 12 WOs added from Build Gap Discovery | 18 new WOs derived from cross-referencing 9 canonical docs — fills DEMO→LIVE, SEO, infrastructure gaps |
| 2026-03-06 | Wave 11 transferred to build_tracker from MASTER_STATUS | Execution authority requires all WOs in build_tracker.md per CLAUDE.md §D |
| 2026-03-05 | MASTER_STATUS.md created as live audit document | build_tracker was stale; needed authoritative current-state sweep |
| 2026-03-05 | market_signals table + AdminMarketSignals UI created | False live claims on Intelligence Hub needed real data infrastructure |

---

AGENT COORDINATION RULES
1. Read CLAUDE.md (root) FIRST before any work — non-negotiable rules, token spec, protected routes
2. Read MASTER_STATUS.md before starting any feature — it has the live sweep of every page
3. Run `npx tsc --noEmit` AND `npm run build` before marking any work complete
4. Portal routes (/portal/*, /brand/*, /admin/*) — DO NOT MODIFY without explicit WO scope
5. Supabase migrations — ADD ONLY, never modify existing
6. Commerce flow (cart, checkout, orders) — NEVER MODIFY
7. Auth system (ProtectedRoute, AuthProvider) — NEVER MODIFY
8. No pro-* tokens on public pages (src/pages/public/)
9. No font-serif on public pages
10. Intelligence leads, marketplace follows — visible in every output
11. Update this file at the end of every session

---

DAILY STANDUP FORMAT
Paste this as your FIRST message in every Claude Code session:
---DAILY STANDUP---
Date:
Session Goal:
Current Wave/Phase:
Last Session Summary:
Time Available:
Blocker?:
---END STANDUP---

STATUS KEY
⬜ Not Started
🔄 In Progress
✅ Complete
❌ Blocked — needs decision
⚠️ Complete but needs attention
🔁 Needs revision

WEEKLY REVIEW PROMPT
Paste this every Friday:
Weekly review time. Do the following:
1. Read /docs/build_tracker.md
2. Read CLAUDE.md (root) and MASTER_STATUS.md (root)
3. Read /docs/SOCELLE_MASTER_PROMPT_FINAL.md Sections 12 and 22
4. If Education, UI/UX, messaging, or Phase 3 intelligence work was done: confirm alignment with /docs/platform/ deep dives
5. Check all file changes from this week (git log --since="7 days ago")
6. Produce a weekly summary: phases progressed, migrations completed, features shipped, bugs fixed, blockers, next 5 tasks
7. Update this file with current status
8. Are we on track? If not, what should we cut or descope?

MILESTONE TRACKER
| Milestone | Target Phase | Status |
|-----------|-------------|--------|
| All Phase 1 migrations (15) | Phase 1 | ✅ |
| P0 bugs fixed (plans.business_id, plans.fit_score) | Phase 1 | ✅ |
| Brand storefront pages live | Phase 1 | ✅ |
| Pearl Mineral V2 on all public pages | Wave 9 | ✅ |
| font-serif violations eliminated | Wave 9 | ✅ |
| MainNav 8 required links | Wave 9 | ✅ |
| RequestAccess form wired to Supabase | Wave 9 | ✅ |
| market_signals table + seed | Wave 9 | ✅ |
| Events page (stub) | Wave 9 | ✅ |
| Jobs page (stub) | Wave 9 | ✅ |
| ForgotPassword/ResetPassword token fix | Wave 10 | ✅ (W10-01) |
| Home DEMO labels applied | Wave 10 | ✅ (W10-02) |
| BrandStorefront PREVIEW labels | Wave 10 | ✅ (W10-03) |
| Insights orphan resolved | Wave 10 | ✅ (W10-04) |
| Events table (live Supabase) | Wave 10 | ✅ (W10-05) |
| Jobs table (live Supabase) | Wave 10 | ✅ (W10-06) |
| Home market pulse live wire | Wave 10 | ✅ (W10-07) |
| RSS ingestion pipeline | Wave 10 | ✅ Done (W10-08, 2026-03-06) |
| Wave 11 — External APIs + enrichment (12 WOs) | Wave 11 | ⬜ |
| Wave 12 — DEMO→LIVE + SEO + infrastructure (18 WOs) | Wave 12 | ⬜ |
| Multi-brand checkout (Stripe) | Phase 3 | ⬜ Postponed |
| Brand payouts (Stripe Connect) | Phase 3 | ⬜ Postponed |
| Education Hub v1 | Phase 2 | ⬜ |
| Mobile native app | Phase 6 | ⬜ |

---

API / INGESTION COVERAGE CHECKLIST
Source: SOCELLE_API_ROUTE_SPEC.md (reference only; authority remains /.claude/CLAUDE.md + /docs/command/* + build_tracker.md)
Added: 2026-03-06 (Session 28)

Rule: Every ingestion function and serving endpoint must map to an existing WO ID or "NO WO — cannot act." No code may be written for any "NO WO" item until owner creates a WO in this file (CLAUDE.md §D).

INGESTION FUNCTIONS (spec §7 — ingest-* Edge Functions)
| Function | WO | Owner Agent | Status |
|---|---|---|---|
| ingest-rss | W10-08 | Editorial/News Agent + Backend Agent | ✅ Done (2026-03-06) |
| ingest-open-beauty-facts | W10-09 | Backend Agent | ✅ Done (2026-03-06) |
| ingest-npi | W10-10 | Backend Agent | ✅ Done (2026-03-06) |
| ingest-openfda | W11-06 | Backend Agent | ⬜ Not Started |
| ingest-google-trends | W11-01 | Backend Agent | ⬜ Not Started |
| ingest-google-places | W11-07 | Backend Agent | ⬜ Not Started |
| ingest-pubmed | NO WO — cannot act | — | ❌ Blocked — needs decision |
| ingest-clinical-trials | NO WO — cannot act | — | ❌ Blocked — needs decision |
| ingest-patents | NO WO — cannot act | — | ❌ Blocked — needs decision |
| ingest-bls | NO WO — cannot act | — | ❌ Blocked — needs decision |
| ingest-census | NO WO — cannot act | — | ❌ Blocked — needs decision |
| ingest-jobs-external | NO WO — cannot act | — | ❌ Blocked — needs decision |
| ingest-reddit | NO WO — cannot act | — | ❌ Blocked — needs decision |
| ingest-cosing | NO WO — cannot act | — | ❌ Blocked — needs decision |
| refresh-materialized-views | NO WO — cannot act | — | ❌ Blocked — needs decision |

GEMINI-CONFIRMED HIGH-VALUE ADDITIONS (Session 29 — 2026-03-06)
Source: Gemini research + SOCELLE_API_ROUTE_SPEC.md. Authority remains CLAUDE.md + /docs/command/* + build_tracker.md.
Rule: All items below are NO WO — cannot act. No code may be written until owner creates a WO in this file (CLAUDE.md §D).
Note: "UK Product Safety Database" references in any prior doc that require login are invalid — replace with EU Safety Gate (RAPEX) below.

| Priority | Function | Maps To | WO | External Setup Required | Status |
|---|---|---|---|---|---|
| P0 | ingest-cscp | safety_events (type: cscp_report) | NO WO — cannot act | resource-id lookup on data.ca.gov Socrata dataset (no key required) | ❌ Blocked — needs decision |
| P0 | ingest-gudid-devices | NEW table: devices (or existing if schema has one); filter FDA product codes GEX, ONG, OSH; include ISA only if confirmed relevant | NO WO — cannot act | none — official FDA AccessGUDID API, no key required | ❌ Blocked — needs decision |
| P0 | ingest-eu-safety | safety_events (type: eu_rapex_alert) | NO WO — cannot act | none — Safety Gate public export; prefer official export workflow; avoid brittle scraping | ❌ Blocked — needs decision |
| P1 | ingest-uspto-daily | NEW table: trademarks; filter Class 003 (cosmetics) + Class 044 (beauty/medical services) | NO WO — cannot act | storage for daily TDXF zip + XML parser | ❌ Blocked — needs decision |
| P1 | ingest-groupon-appointments | market_stats (metric: service_price_floor) and/or provider_pricing table if it exists; pricing-floor signal only — keep inside Intelligence/Market surfaces, not commerce | NO WO — cannot act | Groupon Partner Program approval + API key (see EXTERNAL SETUP REQUIRED) | ❌ Blocked — needs decision |
| P1 | ingest-youtube-trends | social_signals (platform: youtube) | NO WO — cannot act | YouTube Data API key + quota monitoring (see EXTERNAL SETUP REQUIRED) | ❌ Blocked — needs decision |

BOOKING / APPOINTMENT PLATFORM API AUDIT (Session 29 — 2026-03-06)
Commissioned by: Command Center | Executed by: Backend Agent | Reviewed by: Doc Gate QA
Scope: Official/legally-usable booking APIs (salon/spa). Evidence-based only: LICENSE + official developer terms links.
No scraping, no private endpoints, no ToS guessing. Verdict key: SAFE = usable now with documented terms. NEEDS COUNSEL = has official API but requires legal review before production use. DO NOT USE = no public API, or ToS prohibits third-party use.
IMPORTANT: All items below are NO WO — cannot act. No integration code may be written until WO is created AND verdict is SAFE or NEEDS COUNSEL with explicit owner sign-off.

Use-case note: These are OPERATOR-AUTHORIZED read APIs (business owner grants OAuth/key to SOCELLE to read their own data). NOT market-wide scraping. Use for: operator portal sync, real booking data for intelligence surfaces, service pricing signals when operator consents.

| Verdict | Platform | Access Model | Key Required | Regions | Official Terms Evidence | WO | Status |
|---|---|---|---|---|---|---|---|
| NEEDS COUNSEL | Mindbody | API key + OAuth; registration + Mindbody approval required; production requires sign-off | Yes | US, CA, UK, AU, NZ, HK | API ToS: developers.mindbodyonline.com/Resources/DeveloperAgreement (updated 2023-09-30). License is revocable, non-sublicensable, non-transferable. 1,000 calls/day free then $0.003/call. Concern: non-sublicensable clause may block SOCELLE from surfacing aggregated data. Needs legal review. | NO WO — cannot act | ❌ Blocked — needs legal review + owner decision |
| NEEDS COUNSEL | Vagaro | Application form → 5-day review → API key; webhooks for appointments/customers/transactions | Yes | US, CA, UK, AU | API docs: docs.vagaro.com. No dedicated API developer agreement found — only general Customer Participation Agreement (vagaro.com/participationagreement). No API-specific ToS published. Cannot confirm permitted use without formal developer agreement. | NO WO — cannot act | ❌ Blocked — no API-specific ToS found; needs formal agreement |
| NEEDS COUNSEL | Boulevard | API key from developer portal + sandbox; MIT-licensed book-sdk on GitHub | Yes | US (luxury salon/spa/medspa) | SDK MIT license: github.com/Boulevard/book-sdk. Developer portal: developers.joinblvd.com. API-level ToS not publicly fetched — portal requires sign-in. SDK is MIT (safe for use), but API usage terms need confirmation. Enterprise support tier required for full access. | NO WO — cannot act | ❌ Blocked — API ToS needs confirmation beyond MIT SDK |
| SAFE (operator-only) | Square Bookings API | OAuth (seller must authorize; requires Appointments Plus or Premium subscription) | No (OAuth) | Global (US, AU, UK, CA, JP) | Developer Terms: squareup.com/us/en/legal/general/developers-annotated (updated 2025-06-30). Commercial use explicitly permitted. Data access scoped to consenting seller account only. Cannot pull market-wide data. Booking API version 2026-01-22. | NO WO — cannot act | ❌ Blocked — no WO; SAFE for operator portal feature only (not market intelligence) |
| NEEDS COUNSEL | Acuity Scheduling (Squarespace) | API key (Basic Auth) or OAuth2 for multi-account; SDKs: acuity-js, acuity-php | Yes | Global | Developer Terms: developers.acuityscheduling.com/docs/developer-terms-of-use (Squarespace Developer Terms). Commercial use allowed via Squarespace developer programs. Specific restrictions on data aggregation not confirmed — needs review. | NO WO — cannot act | ❌ Blocked — needs ToS review for aggregated intelligence use |
| NEEDS COUNSEL | Phorest | Email request to support@phorest.com with Phorest account; credentials granted by Phorest manually | Yes | UK, IE, US | Docs: developer.phorest.com. Terms: phorest.com/gb/termsandconditions. COPYRIGHT NOTICE: "not authorized to integrate or use the Software with any other software, plug-in or enhancement without Phorest's approval." Third-party integration explicitly requires Phorest approval. No webhooks (polling only). | NO WO — cannot act | ❌ Blocked — integration requires explicit Phorest approval; needs formal agreement |
| NEEDS COUNSEL | Zenoti | API key from Zenoti backend app; tokens valid 24h; refresh tokens available | Yes | US, Global (enterprise) | Docs: docs.zenoti.com. Terms: zenoti.com/en-uk/trust/terms-and-conditions. Enterprise-focused; full terms require direct Zenoti contact. API access scope governed by Services Terms + Network Agreement. | NO WO — cannot act | ❌ Blocked — enterprise agreement required; needs owner contact with Zenoti |
| DO NOT USE | Fresha | No public third-party API | N/A | Global (EU-heavy) | No official developer API program found. Partner Terms (terms.fresha.com/partner-terms) are for venue businesses, not third-party developers. Third-party Fresha scrapers exist on Apify — these are NOT official and violate ToS. | NO WO — cannot act | ⛔ DO NOT USE — no official API; scraping is ToS violation |
| DO NOT USE | Booksy | No public third-party API | N/A | Global | No official developer API or developer portal found. Search returned BookingSync (unrelated product). No developer program confirmed. | NO WO — cannot act | ⛔ DO NOT USE — no official API found |
| DO NOT USE | Mangomint | No public API; webhooks are for business owners only ($50/mo add-on); "custom APIs" undocumented Unlimited plan only | N/A | US | Webhooks: mangomint.com/learn/webhooks-integration/. Custom API mentioned at $375/mo plan with no public documentation. No developer program. | NO WO — cannot act | ⛔ DO NOT USE — no public API; custom API is enterprise-undocumented |
| NEEDS COUNSEL | Timely | OAuth-based REST API; developer portal live at api.gettimely.com | Yes | AU, NZ, UK, Global | Developer portal confirmed reachable (200). OAuth-based access. No official GitHub SDK found. API-specific ToS and data aggregation restrictions not publicly confirmed — full terms require sign-in. Needs attorney review before integration. | NO WO — cannot act | ❌ Blocked — ToS not confirmed; needs legal review |
| NEEDS COUNSEL | Booker | Partner API via Mindbody (Booker acquired 2018); same partner gate as Mindbody | Yes | US | Booker acquired by Mindbody 2018. API access routed through Mindbody Wellness Partner Program (developers.mindbodyonline.com). Same non-sublicensable, revocable license concern as Mindbody applies. No independent Booker developer agreement exists. | NO WO — cannot act | ❌ Blocked — same gate as Mindbody; partner program approval + legal review required |
| SAFE (operator-only) | Calendly | OAuth2 (user must authorize); REST API; no official GitHub SDK | No (OAuth) | Global | Developer portal: developer.calendly.com (200 confirmed). Public REST API with OAuth2. Well-documented rate limits and scopes. Data access scoped to consenting account only. No data redistribution clause found. Note: scheduling/availability sync only — limited direct salon booking data value. | NO WO — cannot act | ❌ Blocked — no WO; SAFE for operator scheduling sync; confirm salon-intelligence use case before WO |
| DO NOT USE | StyleSeat | Consumer marketplace; no public third-party developer API | N/A | US | GitHub org `styleseat` exists (62 public repos) — no public booking or data API found in any repo. StyleSeat is a consumer-facing marketplace. No developer program, no API docs, no partner portal confirmed. | NO WO — cannot act | ⛔ DO NOT USE — consumer marketplace; no public API |
| DO NOT USE | GlossGenius | Private SaaS; no public API | N/A | US | GitHub org `glossgenius` exists (7 public repos) — no public API repo. Closed salon management SaaS. No developer program, partner portal, or public API documentation found. | NO WO — cannot act | ⛔ DO NOT USE — private SaaS; no public API |
| DO NOT USE | Treatwell | Consumer marketplace; no public developer API | N/A | UK, EU | No official developer portal found. No GitHub SDK. Consumer-facing beauty booking marketplace (EU-focused). No third-party developer program confirmed. Scraping would violate ToS. | NO WO — cannot act | ⛔ DO NOT USE — consumer marketplace; no official API or developer program |

GITHUB AUDIT SUPPLEMENT (Session 30 — 2026-03-06)
Added 6 platforms (Timely, Booker, Calendly, StyleSeat, GlossGenius, Treatwell) to complete the 15-platform Command Center dispatch.
Session 30 global audit adds 3 categories below (aggregators, brands/catalog, resort/hospitality).
Existing entry updates: Boulevard — second MIT repo create-booking-flow confirmed (github.com/Boulevard/create-booking-flow, MIT, 2025-10-06). Fresha — partners.fresha.com live (200); api-tools MIT repo is internal tooling only. Mindbody — Conduit repo Apache-2.0 (2026-02-20) is integration middleware, not a public booking API.

---

BOOKING / APPOINTMENT — GLOBAL API AUDIT (SUPPLEMENT: NEW PLATFORMS) (Session 30 — 2026-03-06)
Authority: CLAUDE.md §D + SOCELLE_DATA_PROVENANCE_POLICY.md. All items NO WO — cannot act.

| Verdict | Platform | Access Model | Key Required | Regions | Official Terms Evidence | WO | Status |
|---|---|---|---|---|---|---|---|
| PARTNER-GATED | Reserve with Google | Google Reserve Partner program; no public API for third-party data aggregation | N/A | Global | reserve.google.com requires approved booking partner status. No self-serve API. Booking flows surface in Google Search/Maps for approved partners only. Developer docs for booking data aggregation: not available. | NO WO — cannot act | ❌ Blocked — partner enrollment required; no aggregate data path |
| SAFE ONLY WITH BUSINESS AUTH | SimplyBook.me | REST API + webhooks; API key per business account | Yes | Global | Developer portal: simplybook.me/api (200 confirmed). ToS: simplybook.me/en/terms/. API key from business dashboard. Webhook support for appointment events. | NO WO — cannot act | ❌ Blocked — no WO; SAFE for operator sync with business authorization |
| SAFE ONLY WITH BUSINESS AUTH | Pike13 | OAuth 2.0 per-client; REST API | No (OAuth) | US | Developer portal: developer.pike13.com (200 confirmed). OAuth 2.0 per client account. Wellness/fitness studio focus. | NO WO — cannot act | ❌ Blocked — no WO; SAFE for operator sync with client authorization |
| SAFE ONLY WITH BUSINESS AUTH | Wix Bookings API | OAuth per Wix site; REST API | No (OAuth) | Global | Developer portal: dev.wix.com/docs/rest/business-solutions/bookings (200 confirmed). Developer Agreement: support.wix.com/en/article/wix-developer-center-terms-of-use. OAuth per Wix site. | NO WO — cannot act | ❌ Blocked — no WO; SAFE for operators on Wix platform; limited spa-specific value |
| DO NOT USE | Setmore | No public developer portal | N/A | Global | developer.setmore.com returns 404. No API documentation. No GitHub org. | NO WO — cannot act | ⛔ DO NOT USE — no public API or developer portal |
| DO NOT USE | HoneyBook | No developer portal; out of scope | N/A | US | Portal not reachable. Serves freelancers/photographers/event planners — not salons or spas. Out of scope for SOCELLE. | NO WO — cannot act | ⛔ DO NOT USE — out of scope; no public API |
| DO NOT USE | ClassPass | Consumer marketplace; no public API | N/A | Global | developer.classpass.com returns 403/000. Consumer-facing marketplace. No third-party developer API or partner data program found. | NO WO — cannot act | ⛔ DO NOT USE — consumer marketplace; no public API |
| NEEDS COUNSEL | Schedulicity | Developer portal WAF-blocked; access model unknown | Unknown | US, CA | schedulicity.com/developers blocked by WAF (503/403). No public API docs accessible. Business development contact required. | NO WO — cannot act | ❌ Blocked — portal WAF-blocked; direct BD contact required |

---

BRANDS / CATALOG / PRO ORDERING — GLOBAL API AUDIT (Session 30 — 2026-03-06)
Authority: CLAUDE.md §D + SOCELLE_DATA_PROVENANCE_POLICY.md. All items NO WO — cannot act.
Critical finding: Zero of 17 pro skincare/device brands have a public self-serve developer API. All brand product/protocol/pricing data requires formal brand partnership agreements — not API calls.

B1 — E-COMMERCE PLATFORMS
| Vendor | Official API? | Docs URL | Access Model | SDK + License | ToS URL | Key Restrictions | Allowed Data Scope | Classification | External Setup | WO |
|---|---|---|---|---|---|---|---|---|---|---|
| Shopify (Storefront + Admin) | Y | shopify.dev/docs/api | OAuth per merchant install | github.com/Shopify/shopify-api-js (MIT); storefront-api-learning-kit (MIT) | shopify.com/legal/api-terms | No AI/ML training on API data without written consent; non-sublicensable; REST Admin deprecated Apr 2025 — GraphQL required | Products, pricing, catalog, collections, locations — per merchant only; no cross-merchant aggregation | SAFE ONLY WITH BUSINESS AUTH | Shopify Partner account + OAuth per merchant | NO WO — cannot act |
| BigCommerce (REST + GraphQL) | Y | developer.bigcommerce.com | OAuth per merchant install | github.com/bigcommerce/bigcommerce-api-python (MIT) | bigcommerce.co.uk/terms/api-terms/ | No redistribution/republication; cannot build competing platform | Products, pricing, catalog, orders — per merchant only | SAFE ONLY WITH BUSINESS AUTH | BigCommerce Partner Portal + OAuth per merchant | NO WO — cannot act |
| WooCommerce REST API | Y | woocommerce.github.io/woocommerce-rest-api-docs | API key per merchant (Basic Auth or OAuth 1.0a) | github.com/woocommerce/woocommerce (GPL-2.0); rest-api-js-lib (MIT) | No central SaaS ToS — each merchant governs (open source) | GPL-2.0 copyleft on server-side derivatives; no central data redistribution clause | Full store data with per-merchant key | SAFE ONLY WITH BUSINESS AUTH | API key from each merchant WooCommerce admin — no central enrollment | NO WO — cannot act |
| Lightspeed Commerce | Y | developers.lightspeedhq.com | OAuth per merchant | No official OSI SDK (community SDKs only — unvetted) | developers.lightspeedhq.com/terms | Non-sublicensable, non-transferable, revocable; cannot build competing platform | Products, inventory, orders, locations — per merchant only | SAFE ONLY WITH BUSINESS AUTH | Lightspeed developer account + OAuth per merchant | NO WO — cannot act |
| Magento / Adobe Commerce | Y | developer.adobe.com/commerce/webapi/rest | Merchant-provisioned token or OAuth | github.com/magento/magento2 (OSL 3.0 + AFL 3.0) | adobe.com/legal/terms/enterprise-licensing/all-product-terms.html | OSL 3.0 copyleft on server-side modifications distributed to others; CLA required for contributions | Full catalog, orders, customers — merchant-provisioned credentials | SAFE ONLY WITH BUSINESS AUTH | API credentials from each merchant Commerce admin — no central enrollment | NO WO — cannot act |
| Salesforce Commerce Cloud | Y | developer.salesforce.com/docs/commerce/commerce-api | OAuth per licensed merchant instance | github.com/SalesforceCommerceCloud/commerce-sdk (MIT) | salesforce.com/company/legal/program-agreement/ | AppExchange Partner Program enrollment required for commercial apps; direct Salesforce competitors explicitly banned | Products, pricing, catalog — per licensed merchant instance only | PARTNER-GATED | AppExchange Partner Program enrollment; salesforce.com/partners | NO WO — cannot act |

B2 — PRO SKINCARE / DEVICE BRANDS (all 17 confirmed DO NOT USE except L'Oréal/SkinCeuticals)
| Brand | Official API? | Evidence | Classification | WO |
|---|---|---|---|---|
| Naturopathica | N | No developer portal. No GitHub org. Manual B2B ordering only. | DO NOT USE | NO WO — cannot act |
| Dermalogica | N | pro.dermalogica.com + prodashboard.dermalogica.com live — login-gated portals, not APIs. No developer docs. | DO NOT USE | NO WO — cannot act |
| SkinCeuticals (L'Oréal) | Partial | api.loreal.com confirmed live — L'Oréal internal API platform (Apigee). Access requires direct contact with L'Oréal API owners; no self-serve enrollment. No SkinCeuticals-specific API found. | PARTNER-GATED | NO WO — cannot act |
| PCA Skin | N | No developer portal. No GitHub org. Login-gated professional portal only. | DO NOT USE | NO WO — cannot act |
| SkinMedica (Allergan/AbbVie) | N | Brilliant Connections = managed storefront. Allē loyalty = closed system (Twilio). No public API. | DO NOT USE | NO WO — cannot act |
| Obagi Medical | N | obagi-professional.com live — authenticated ordering portal, not an API. No developer API found. | DO NOT USE | NO WO — cannot act |
| iS Clinical | N | No developer portal. No GitHub org. Distributor-based ordering only. | DO NOT USE | NO WO — cannot act |
| Eminence Organic Skin Care | N | No developer portal. No GitHub org. Spa professional distribution only. | DO NOT USE | NO WO — cannot act |
| Circadia | N | No developer portal. No GitHub org. Licensed provider distribution only. | DO NOT USE | NO WO — cannot act |
| Image Skincare | N | No developer portal. No GitHub org. 30,000+ pro network managed through human channels. | DO NOT USE | NO WO — cannot act |
| Biologique Recherche | N | No developer portal. No GitHub org. Exclusive clinic/spa distribution; no public API. | DO NOT USE | NO WO — cannot act |
| Hydrafacial | N | No developer portal. Device software (Syndeo/BeautyStat) proprietary. No public API found. | DO NOT USE | NO WO — cannot act |
| Candela Medical | N | No developer portal. No GitHub org. Medical device — formal OEM/partner agreement required. | DO NOT USE | NO WO — cannot act |
| Lumenis | N | partnerzone.lumenis.com live — content/education partner portal (downloads), NOT an API. No device API found. | DO NOT USE | NO WO — cannot act |
| Allergan Aesthetics | N | allerganadvantage.com + allerganmedicalinstitute.com live — all login-gated. Allē = closed loyalty. No public API. | DO NOT USE | NO WO — cannot act |
| Galderma | N | galdermahcp.com + gainconnect.com live — login-gated. galderma.com/partnering = BD inquiry page. No public API. | DO NOT USE | NO WO — cannot act |
| Merz Aesthetics | N | portal.merzusa.com live — authenticated ordering web app. xperiencemerz.com = closed rewards. No public API. | DO NOT USE | NO WO — cannot act |

---

RESORT / HOSPITALITY — GLOBAL API AUDIT (Session 30 — 2026-03-06)
Authority: CLAUDE.md §D + SOCELLE_DATA_PROVENANCE_POLICY.md. All items NO WO — cannot act.
Critical finding: No platform offers open no-auth aggregate data. Every platform requires property authorization + signed partner/integration agreement. Data scope: aggregate-only; no PII.

C1 — HOSPITALITY PMS SYSTEMS
| Vendor | Official API? | Docs URL | Access Model | SDK + License | ToS URL | Key Restrictions | Allowed Data Scope | Classification | External Setup | WO |
|---|---|---|---|---|---|---|---|---|---|---|
| Oracle OPERA Cloud (OHIP) | Y | oracle.com/hospitality/integration-platform/ | OHIP account + property authorization; certified integration partner for production | github.com/oracle/hospitality-api-docs (UPL — specs/docs only; runtime governed by Oracle licensing) | Runtime terms via Oracle licensing agreement (no public standalone URL) | UPL covers spec docs only; runtime requires Oracle licensing; certified partner required for production; NDA likely | Spa/activity availability, amenity booking, room availability — property-scoped; no PII | PARTNER-GATED | Oracle OHIP partner enrollment: oracle.com/hospitality/integration-platform/ | NO WO — cannot act |
| Mews Systems | Y | docs.mews.com | OAuth + API key per property | github.com/MewsSystems (MIT SDKs confirmed) | mews.com/en/terms-conditions/partners | Property must authorize; cross-property aggregation terms — confirm with Mews Partner T&C | Property operations data — property-scoped; no cross-property aggregation confirmed | SAFE ONLY WITH BUSINESS AUTH | Mews developer account + API key per property at docs.mews.com | NO WO — cannot act |
| Cloudbeds | Y | developers.cloudbeds.com | API key per property (self-service) or OAuth (partner path; 60-min cert call required) | No official GitHub SDK | cloudbeds.com/terms/api/ | Self-service key from property dashboard; partner tier cert call required; ToS at cloudbeds.com/terms/api/ | Reservations, room types, amenities — property-scoped | SAFE ONLY WITH BUSINESS AUTH | Cloudbeds developer account + API key per property at developers.cloudbeds.com | NO WO — cannot act |
| SiteMinder | Y | developer.siteminder.com/siteminder-apis | Partner application required before any API access | No official GitHub SDK | siteminder.com/integrations/apply-now/ | Formal partner application and integration agreement required before access | Channel availability, rate data — property-scoped | PARTNER-GATED | SiteMinder partner application: siteminder.com/integrations/apply-now/ | NO WO — cannot act |
| Sabre SynXis | Y | developer.synxis.com | NDA required before any access; formal certification process | No official GitHub SDK | developer.synxis.com/apis/soap_apis/hotel/certification | NDA required before API access; enterprise-only; SOAP + REST | Reservation, availability, rate — property-scoped | PARTNER-GATED | Sabre partnership + NDA + SynXis certification at developer.synxis.com | NO WO — cannot act |
| Amadeus Hospitality | Y (enterprise only) | developer.amadeus-hospitality.com/products | Formal commercial agreement required; self-service tier confirmed shutting down 2025 (PhocusWire) | github.com/amadeus4dev (MIT — travel APIs only; hospitality modules not in public repos) | No public hospitality API ToS; requires commercial engagement | Self-service tier discontinued — do not build; enterprise commercial agreement required | GDS availability, rates — property-scoped; enterprise only | PARTNER-GATED | Direct Amadeus commercial engagement required | NO WO — cannot act |
| Agilysys | Y | agys-dev.developer.azure-api.net | Solution Partner enrollment required | No official GitHub SDK | agilysys.com/en/solution-partners/ | Solution Partner program required; formal integration agreement | PMS data, spa/activity booking, dining — property-scoped | PARTNER-GATED | Agilysys Solution Partner enrollment: agilysys.com/en/solution-partners/ | NO WO — cannot act |
| Maestro PMS | Y (open API claimed) | maestropms.com/interfaces-open-apis-integration-pms-partners.html | Direct engagement with Maestro required; terms not publicly documented | No official GitHub SDK | No public ToS URL found | Open API referenced on website but access process and full terms not publicly documented | PMS data — property-scoped | NEEDS COUNSEL | Direct contact: maestropms.com | NO WO — cannot act |

C2 — SPA SYSTEMS IN RESORTS
| Vendor | Official API? | Docs URL | Access Model | SDK + License | ToS URL | Key Restrictions | Allowed Data Scope | Classification | External Setup | WO |
|---|---|---|---|---|---|---|---|---|---|---|
| Book4Time | Y (partner) | book4time.com/software-integrations/ | Integration partner program required | No public GitHub SDK | No public ToS URL | Partner integration page confirmed live; specific API terms not publicly available | Spa appointments, service menus, availability — property-scoped | PARTNER-GATED | Book4Time integration partner program: book4time.com/software-integrations/ | NO WO — cannot act |
| SpaSoft (Springer-Miller) | N | springermiller.com/partners/ | No public API found | N/A | None found | Partners page live; no API documentation or developer portal found | N/A | DO NOT USE | Direct inquiry to Springer-Miller required | NO WO — cannot act |
| ResortSuite (Agilysys brand) | Y (via Agilysys) | agys-dev.developer.azure-api.net | Same Agilysys Solution Partner path | No official GitHub SDK | agilysys.com/en/solution-partners/ | Same partner enrollment as Agilysys PMS entry above | Spa, activity, dining — property-scoped | PARTNER-GATED | Agilysys Solution Partner enrollment (same as Agilysys PMS above) | NO WO — cannot act |
| Springer-Miller SMS|Host | N | springermiller.com | No public API | N/A | None found | No API documentation or developer portal found | N/A | DO NOT USE | Direct inquiry to Springer-Miller required | NO WO — cannot act |

C3 — GUEST EXPERIENCE PLATFORMS
| Vendor | Official API? | Docs URL | Access Model | SDK + License | ToS URL | Key Restrictions | Allowed Data Scope | Classification | External Setup | WO |
|---|---|---|---|---|---|---|---|---|---|---|
| INTELITY | Y (confirmed exists) | intelity.com/api/ | Direct engagement required; API page live but docs not public | No public SDK | None found publicly | API page live; 100+ integrations confirmed; no public docs or ToS; no spa-specific module identified | Guest-facing services — property-scoped; no PII | NEEDS COUNSEL | Direct contact: intelity.com/api/ | NO WO — cannot act |
| ALICE / Actabl | Y (confirmed exists) | actabl.com/alice/ | Direct engagement required; no public docs | No public SDK | None found publicly | 270+ integrations confirmed; no public API docs or developer program | Operations data — property-scoped; no PII | NEEDS COUNSEL | Direct contact: actabl.com | NO WO — cannot act |
| Canary Technologies | Y (confirmed exists) | canarytechnologies.com/integrations | Direct engagement required; integrations page live | No public SDK | None found publicly | Integrations page live; no public API docs or developer program found | Guest communication — property-scoped; no PII | NEEDS COUNSEL | Direct contact: canarytechnologies.com | NO WO — cannot act |
| Duve | Y (confirmed exists) | duve.com | Direct engagement required; no public docs | No public SDK | None found publicly | Platform confirmed live; no public developer docs found | Guest communication — property-scoped; no PII | NEEDS COUNSEL | Direct contact: duve.com | NO WO — cannot act |

EXTERNAL SETUP REQUIRED — NEW PLATFORMS (Session 30 — 2026-03-06)
| Platform | Setup Required | Who Initiates | Status |
|---|---|---|---|
| SimplyBook.me | Business account + API key from dashboard | Owner (Bruce) | ⬜ Not started |
| Pike13 | Developer account + OAuth app at developer.pike13.com | Owner (Bruce) | ⬜ Not started |
| Wix Bookings | Wix Partner account + OAuth app at dev.wix.com | Owner (Bruce) | ⬜ Not started |
| Reserve with Google | Google Reserve Partner program (significant barrier — approved booking provider required) | Owner (Bruce) | ⬜ Not started |
| Shopify | Shopify Partner account at partners.shopify.com + OAuth per merchant | Owner (Bruce) | ⬜ Not started |
| BigCommerce | BigCommerce Partner Portal + OAuth per merchant | Owner (Bruce) | ⬜ Not started |
| WooCommerce | API key from each merchant WooCommerce admin (no central enrollment) | Per-merchant | ⬜ Not started |
| Lightspeed Commerce | Developer account at developers.lightspeedhq.com + OAuth per merchant | Owner (Bruce) | ⬜ Not started |
| Magento / Adobe Commerce | API credentials from each merchant Commerce admin (no central enrollment) | Per-merchant | ⬜ Not started |
| Salesforce Commerce Cloud | AppExchange Partner Program at salesforce.com/partners (significant barrier) | Owner (Bruce) | ⬜ Not started |
| L'Oréal / SkinCeuticals | Direct contact with L'Oréal API team via api.loreal.com + attorney review of data licensing | Owner (Bruce) + Counsel | ⬜ Not started |
| Oracle OPERA Cloud (OHIP) | Oracle OHIP partner enrollment at oracle.com/hospitality/integration-platform/ | Owner (Bruce) | ⬜ Not started |
| Mews Systems | Developer account + API key per property at docs.mews.com | Owner (Bruce) | ⬜ Not started |
| Cloudbeds | Developer account + API key per property at developers.cloudbeds.com | Owner (Bruce) | ⬜ Not started |
| SiteMinder | Partner application at siteminder.com/integrations/apply-now/ | Owner (Bruce) | ⬜ Not started |
| Sabre SynXis | Partnership + NDA + SynXis certification at developer.synxis.com | Owner (Bruce) + Legal | ⬜ Not started — NDA required |
| Amadeus Hospitality | Direct commercial engagement with Amadeus Hospitality team | Owner (Bruce) | ⬜ Not started — self-service tier discontinued |
| Agilysys / ResortSuite | Solution Partner enrollment at agilysys.com/en/solution-partners/ | Owner (Bruce) | ⬜ Not started |
| Book4Time | Integration partner program at book4time.com/software-integrations/ | Owner (Bruce) | ⬜ Not started |
| Maestro PMS | Direct contact at maestropms.com | Owner (Bruce) | ⬜ Not started |
| INTELITY | Direct contact at intelity.com/api/ | Owner (Bruce) | ⬜ Not started |
| ALICE / Actabl | Direct contact at actabl.com | Owner (Bruce) | ⬜ Not started |
| Canary Technologies | Direct contact at canarytechnologies.com | Owner (Bruce) | ⬜ Not started |
| Duve | Direct contact at duve.com | Owner (Bruce) | ⬜ Not started |

GLOBAL AUDIT MASTER CLASSIFICATION (Session 30 — 2026-03-06)
Total platforms audited across all categories (booking + brands + hospitality): 56

SAFE TO IMPLEMENT (public, no auth): None.
SAFE ONLY WITH BUSINESS AUTH (11): Square Bookings, Calendly, SimplyBook.me, Pike13, Wix Bookings, Shopify, BigCommerce, WooCommerce, Lightspeed, Magento/Adobe Commerce, Mews, Cloudbeds.
PARTNER-GATED (10): Reserve with Google, Salesforce Commerce Cloud, L'Oréal/SkinCeuticals, Oracle OPERA/OHIP, SiteMinder, Sabre SynXis, Amadeus Hospitality, Agilysys, Book4Time, ResortSuite.
NEEDS COUNSEL (12): Mindbody, Vagaro, Boulevard, Acuity, Phorest, Zenoti, Timely, Booker, Schedulicity, Maestro PMS, INTELITY, ALICE/Actabl, Canary, Duve.
DO NOT USE (23): Fresha, Booksy, Mangomint, StyleSeat, GlossGenius, Treatwell, Setmore, HoneyBook, ClassPass + 16 pro skincare/device brands (Naturopathica, Dermalogica, PCA Skin, SkinMedica, Obagi, iS Clinical, Eminence, Circadia, Image Skincare, Biologique Recherche, Hydrafacial, Candela, Lumenis, Allergan, Galderma, Merz) + SpaSoft + SMS|Host.

---

SERVING FUNCTIONS (spec §7 — frontend-called Edge Functions)
| Function | WO | Owner Agent | Status |
|---|---|---|---|
| intelligence-briefing | W12-16 | Backend Agent | ✅ Complete |
| jobs-search | W12-16 | Backend Agent | ✅ Complete |
| brand-intelligence | NO WO — cannot act | — | ❌ Blocked — needs decision |
| ingredient-profile | NO WO — cannot act | — | ❌ Blocked — needs decision |
| market-snapshot | NO WO — cannot act | — | ❌ Blocked — needs decision |
| treatment-pricing | NO WO — cannot act | — | ❌ Blocked — needs decision |
| provider-search | NO WO — cannot act | — | ❌ Blocked — needs decision |
| jobs-post | NO WO — cannot act | — | ❌ Blocked — needs decision |
| jobs-apply | NO WO — cannot act | — | ❌ Blocked — needs decision |
| jobs-match | NO WO — cannot act | — | ❌ Blocked — needs decision |
| job-demand-signals | NO WO — cannot act | — | ❌ Blocked — needs decision |
| generate-plan | NO WO — cannot act | — | ❌ Blocked — needs decision |
| rss-search | NO WO — cannot act | — | ❌ Blocked — needs decision |
| og-image-proxy | NO WO — cannot act | — | ❌ Blocked — needs decision |
| GET /intelligence/compliance/:brand_slug | NO WO — cannot act | — | ❌ Proposed (Session 29) — merges FDA + CSCP + EU Safety Gate signals; blocked pending ingest-cscp, ingest-gudid-devices, ingest-eu-safety WOs |
| GET /intelligence/devices/:device_id | NO WO — cannot act | — | ❌ Proposed (Session 29) — device specs + safety history; blocked pending ingest-gudid-devices WO |
| GET /market/future-products | NO WO — cannot act | — | ❌ Proposed (Session 29) — trademarks last 30 days, Class 003/044; blocked pending ingest-uspto-daily WO |

---

## WAVE 12 — PUBLIC PAGE REDESIGN (Session 34 — March 2026)

Source: `docs/AUDIT_W12_COMPLETE_REAUDIT.md` + `docs/command/SOCELLE_FIGMA_DESIGN_BRIEF.md`

### WAVE A — STOP THE BLEEDING

| WO | Name | Type | Files | Priority | Status |
|---|---|---|---|---|---|
| W12-28 | Home Warm Cocoa Purge + Button Normalization | Token/CSS | Home.tsx | P0 CRITICAL | ✅ Done — tsc 0 errors, build OK |
| W12-29 | EvidenceStrip CSS Fix | Component fix | EvidenceStrip.tsx | P0 CRITICAL | ✅ Done — overflow-x-auto + snap, tsc 0 errors |

### WAVE B — LIVE DATA

| WO | Name | Type | Files | Priority | Status |
|---|---|---|---|---|---|
| W12-30 | Home Signals Live Wire | Hook wiring | Home.tsx | P0 CRITICAL | ✅ Done — useIntelligence() wired, isLive flag drives PREVIEW banner |
| W12-31 | usePlatformStats() Hook | New hook | src/lib/usePlatformStats.ts | P0 CRITICAL | ✅ Done — brands/signals/operators counts from Supabase, isLive flag |
| W12-32 | Platform Stats Wiring | Page integration | Professionals.tsx, ForBrands.tsx, Jobs.tsx | P0 CRITICAL | ✅ Done — EvidenceStrip items wired to usePlatformStats across 3 pages |

### WAVE C — VISUAL RHYTHM

| WO | Name | Type | Files | Priority | Status |
|---|---|---|---|---|---|
| W12-33 | Brands + Events Video Heroes | Media integration | Brands.tsx, Events.tsx | P1 HIGH | ✅ Done — HeroMediaRail on Brands, inline video on Events |
| W12-34 | useSignalCategories() Hook | New hook | src/lib/intelligence/useSignalCategories.ts, Intelligence.tsx | P1 HIGH | ✅ Done — live counts per signal_type, wired into EvidenceStrip + SplitFeature |
| W12-35 | Jobs Hero Video + Live Count | Page fix | Jobs.tsx | P1 HIGH | ✅ Done — HeroMediaRail + live job_postings count via usePlatformStats |
| W12-36 | Animated Counter Component | New component | src/components/public/AnimatedCounter.tsx | P1 HIGH | ✅ Done — IntersectionObserver + rAF + easeOutCubic, wired into ForMedspas metrics |

### WAVE D — POLISH

| WO | Name | Type | Files | Priority | Status |
|---|---|---|---|---|---|
| W12-37 | Inline Button Normalization | CSS cleanup | 9 public pages (About, FAQ, HowItWorks, ForBrands, Professionals, Intelligence, Protocols, BrandStorefront, Brands, Jobs) | P2 MED | ✅ Done — 14 inline buttons → btn-mineral-* classes, 0 remaining |
| W12-38 | index.css Dead Code Cleanup | CSS cleanup | index.css | P2 MED | ✅ Done — removed dead warm-cocoa refs + unused utility classes |
| W12-39 | Video Poster Frames | Asset pipeline | public/videos/posters/, all pages with video | P2 MED | ✅ Done — 6 poster JPEGs generated via ffmpeg, all 15+ video elements have poster attr |

---

Update this file at the end of every Claude Code session.
It is the first thing Claude Code reads at the start of every session.
An outdated tracker means a confused Claude Code and wasted build time.
