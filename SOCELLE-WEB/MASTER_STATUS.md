> Updated to align with V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md on 2026-03-08.

# SOCELLE — MASTER STATUS DOCUMENT
**Last Updated:** March 9, 2026 — V3 Wave 1.5 Complete (Session 48)
**Purpose:** Single source of truth for all agents. Replaces PLATFORM_STATUS.md and SOCELLE_MASTER_WORK_ORDER.md for current-state tracking.
**Authority:** `docs/command/V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` (V1 wins if conflicts exist)
**Wave Progress:** Waves 1–14 complete. V2-TECH FROZEN. V3 Wave 1.5 complete (CMS pipeline + hub upgrades + Authoring Studio + Admin Health + Media Library).

---

## BUILD STATUS (Verified March 9, 2026 — Session 48)

| Check | Status |
|---|---|
| `npx tsc --noEmit` | ✅ Zero errors |
| `npm run build` (Vite) | ✅ Passes — 5.08s |
| React | ✅ 19.2.4 (FROZEN) |
| Vite | ✅ 6.4.1 (FROZEN) |
| TypeScript | ✅ strict mode ON |
| TanStack Query | ✅ v5 on all data hooks |
| `graphite` token | ✅ `#141418` |
| `mn-bg` / BG token | ✅ `#F6F3EF` |
| `accent-hover` token | ✅ `#5A7185` |
| `accent-soft` token | ✅ `#E8EDF1` |
| `font-serif` on public pages | ✅ 0 instances |
| Banned SaaS phrases | ✅ 0 instances |
| `pro-*` tokens on public pages | ⚠️ 2 files (ForgotPassword, ResetPassword — auth-critical, low priority) |
| Supabase migrations | ✅ 76+ total — ADD ONLY policy |
| Edge functions deployed | ✅ 9+ (ai-concierge, ai-orchestrator, create-checkout, generate-embeddings, magic-link, send-email, stripe-webhook, ingest-npi, feed-orchestrator) |

## V3 SESSION 48 — COMPLETED WORK

### CMS Pipeline (WO-CMS-01 through WO-CMS-05) ✅
- Schema: 8 tables + RLS + indexes + triggers + 10 spaces + 4 templates
- Hooks: 9 TanStack Query v5 files (types + 7 hooks + barrel)
- Admin UI: 7 CMS admin pages (dashboard, pages, posts, blocks, media, templates, spaces)
- PageRenderer: 12 block types + blog + CMS page + help routes
- Authoring Studio: StudioHome (3 tabs, 9 templates), StudioEditor (3-panel, 17 block types), CourseBuilder (5-step wizard)

### Hub Upgrades (per Hub Feature Spec) ✅
- CRM: Today View dashboard, intelligence tab wired, churn risk flags, skeleton shimmers
- Sales: CSV export all pages, error states, skeleton shimmers, Pearl Mineral empty states
- Education: Intelligence recommendations, CSV export, skeleton shimmers, empty states
- Commerce: Intelligence-first shop, trending badges, FTC affiliate badges
- Admin: System Health Dashboard (KPI strip, feed errors, quick actions, feed status)
- Media Library: Full rewrite (drag-drop, grid/list, preview, metadata editor)

### Remaining (Wave 2+)
- WO-CMS-06: Hub Integrations
- V2-INTEL-01..06: Intelligence Cloud, AI tools, feed pipeline, credit economy, affiliate
- V2-HUBS-01..04, 08, 12, 13: Intelligence, Jobs, Brands, Professionals, Marketing, Credit Economy, Affiliate
- CRM: rebooking engine, consent audit log
- Admin: user management, audit log, API registry, feature flags

---

## PUBLIC PAGES — COMPLETE SWEEP

### LAUNCH-CRITICAL (deploying now)

| Page | File | Route | Design ✅ | Data Source | Issues |
|---|---|---|---|---|---|
| Home | `Home.tsx` | `/home` | ✅ Pearl V2 | Mock market pulse (labeled DEMO) | Mock signals hardcoded — needs W10 live wire |
| Intelligence Hub | `Intelligence.tsx` | `/intelligence` | ✅ Pearl V2 | `market_signals` Supabase → mock fallback | ✅ isLive flag + PREVIEW banner working |
| Brands | `Brands.tsx` | `/brands` | ✅ Pearl V2 | Supabase `brands` table (live) | Sort by `created_at` not yet in query |
| Brand Storefront | `BrandStorefront.tsx` | `/brands/:slug` | ✅ Pearl V2 | Supabase `brands` table (live) | Adoption metrics hardcoded — needs label |
| For Buyers | `ForBuyers.tsx` | `/for-buyers` | ✅ Pearl V2 | Static copy | None |
| For Brands | `ForBrands.tsx` | `/for-brands` | ✅ Pearl V2 | Static copy | None |
| For Medspas | `ForMedspas.tsx` | `/for-medspas` | ✅ Pearl V2 | Static copy | None |
| For Salons | `ForSalons.tsx` | `/for-salons` | ✅ Pearl V2 | Static copy | None |
| How It Works | `HowItWorks.tsx` | `/how-it-works` | ✅ Pearl V2 | Static copy | None |
| Pricing | `Pricing.tsx` | `/pricing` | ✅ Pearl V2 | Static copy | Prices are hardcoded — no Supabase `subscription_plans` wire |
| About | `About.tsx` | `/about` | ✅ Pearl V2 | Static copy | None |
| Request Access | `RequestAccess.tsx` | `/request-access` | ✅ Pearl V2 | Supabase `access_requests` (wired W9-01) | ✅ Form submits to DB |
| FAQ | `FAQ.tsx` | `/faq` | ✅ Pearl V2 | Static copy | None |
| Events | `Events.tsx` | `/events` | ✅ Pearl V2 | Supabase `events` table (live — W10-01) | ✅ 8 events seeded, loading skeleton, live data |
| Jobs | `Jobs.tsx` | `/jobs` | ✅ Pearl V2 | Supabase `job_postings` table (live — W10-02) | ✅ 12 jobs seeded, loading skeleton, live data |
| Job Detail | `JobDetail.tsx` | `/jobs/:slug` | ✅ Pearl V2 | Supabase `job_postings` by slug (live — W10-02) | ✅ Fetch by slug, loading skeleton, not-found redirect |
| Protocols | `Protocols.tsx` | `/protocols` | ✅ Pearl V2 | Supabase `canonical_protocols` (live) | Placeholder stat counters |
| Protocol Detail | `ProtocolDetail.tsx` | `/protocols/:slug` | ✅ Pearl V2 | Supabase (live) | None |
| Privacy | `Privacy.tsx` | `/privacy` | ✅ Pearl V2 | Static copy | None |
| Terms | `Terms.tsx` | `/terms` | ✅ Pearl V2 | Static copy | None |
| Education | `Education.tsx` | `/education` | ✅ Pearl V2 | Supabase `brand_training_modules` (live) | None |
| Insights | `Insights.tsx` | `/insights` | ✅ Pearl V2 | Redirects → `/intelligence` | ✅ W10-06 COMPLETE — Navigate redirect in App.tsx |
| API Docs | `ApiDocs.tsx` | `/api/docs` | ✅ Pearl V2 | Static copy | Pricing tiers hardcoded |
| API Pricing | `ApiPricing.tsx` | `/api/pricing` | ✅ Pearl V2 | Static copy / mock tiers | Marked placeholder |
| Forgot Password | `ForgotPassword.tsx` | `/forgot-password` | ⚠️ Still uses `pro-*` tokens | Supabase Auth | Functional — low design priority |
| Reset Password | `ResetPassword.tsx` | `/reset-password` | ⚠️ Still uses `pro-*` tokens | Supabase Auth | Functional — low design priority |
| Claim Brand | `ClaimBrand.tsx` | `/claim/brand/:slug` | Unknown | Supabase | Not audited this wave |
| Claim Business | `ClaimBusiness.tsx` | `/claim/business/:slug` | Unknown | Supabase | Not audited this wave |

---

## BUSINESS PORTAL — `/portal/*` (22 files)

**DO NOT MODIFY without explicit work order scope.**

| Page | File | Data Source | Mock/Stub? | Issues |
|---|---|---|---|---|
| Portal Home | `PortalHome.tsx` | Supabase | Some mock | Low |
| Dashboard | `Dashboard.tsx` | Supabase | Some mock | Low |
| AI Advisor | `AIAdvisor.tsx` | Supabase Edge (ai-concierge) | Some placeholder | Medium |
| Account | `Account.tsx` | Supabase | Minor mock | Low |
| Apply | `Apply.tsx` | Supabase | Some placeholder | Low |
| Benchmark Dashboard | `BenchmarkDashboard.tsx` | Mock/hardcoded | **HEAVY MOCK** | Route added W9-01; data needs live wire |
| Brand Detail | `BrandDetail.tsx` | Supabase | Live | None |
| CE Credits | `CECredits.tsx` | Supabase | Some mock | Medium |
| Claim Review | `ClaimReview.tsx` | Supabase | Minor | Low |
| Intelligence Hub | `IntelligenceHub.tsx` | Mixed (Supabase + mock) | **HEAVY MOCK** | Core portal feature — needs W10 live data |
| Locations Dashboard | `LocationsDashboard.tsx` | Supabase | Some mock | Medium |
| Login | `Login.tsx` | Supabase Auth | None | None |
| Marketing Calendar | `MarketingCalendar.tsx` | Supabase | Some mock | Low |
| Messages | `Messages.tsx` | Supabase | Some mock | Medium |
| Notification Preferences | `NotificationPreferences.tsx` | Supabase | Live | None |
| Order Detail | `OrderDetail.tsx` | Supabase | Some mock | Medium |
| Orders | `Orders.tsx` | Supabase | Live | None |
| Plan Comparison | `PlanComparison.tsx` | Supabase | Mock pricing | Medium |
| Plan Results | `PlanResults.tsx` | Supabase | Partial mock | Medium |
| Plan Wizard | `PlanWizard.tsx` | Supabase | Some mock | Medium |
| Plans List | `PlansList.tsx` | Supabase | Some mock | Medium |
| Signup | `Signup.tsx` | Supabase Auth | Minor placeholder | Low |

---

## BRAND PORTAL — `/brand/*` (25 files)

**DO NOT MODIFY without explicit work order scope.**

| Page | File | Data Source | Mock/Stub? | Issues |
|---|---|---|---|---|
| Apply | `Apply.tsx` | Supabase | Some placeholder | Low |
| Application Received | `ApplicationReceived.tsx` | Static | None | None |
| Automations | `Automations.tsx` | Supabase | **HEAVY MOCK** | UI complete; backend wiring partial |
| Brand AI Advisor | `BrandAIAdvisor.tsx` | Supabase Edge | Some placeholder | Medium |
| Brand Intelligence Hub | `BrandIntelligenceHub.tsx` | Mixed | **HEAVY MOCK** | Intelligence data all mocked |
| Campaign Builder | `CampaignBuilder.tsx` | Supabase | Some mock | Medium — UI complete, backend stubs |
| Campaigns | `Campaigns.tsx` | Supabase | Some mock | Medium |
| Claim Review | `ClaimReview.tsx` | Supabase | Minor | Low |
| Customers | `Customers.tsx` | Supabase | Some mock | Medium |
| Dashboard | `Dashboard.tsx` | Supabase | Live | None |
| Intelligence Pricing | `IntelligencePricing.tsx` | Supabase | Some mock | Medium |
| Intelligence Report | `IntelligenceReport.tsx` | Mixed | **HEAVY MOCK** | Reports from mock data |
| Leads | `Leads.tsx` | Supabase | Live | None |
| Login | `Login.tsx` | Supabase Auth | None | None |
| Messages | `Messages.tsx` | Supabase | Some mock | Medium |
| Notification Preferences | `BrandNotificationPreferences.tsx` | Supabase | Live | None |
| Onboarding | `Onboarding.tsx` | Supabase | Some mock | Medium |
| Order Detail | `OrderDetail.tsx` | Supabase | Some mock | Medium |
| Orders | `Orders.tsx` | Supabase | Live | None |
| Performance | `Performance.tsx` | Supabase | Some mock | Medium |
| Pipeline | `Pipeline.tsx` | Supabase | Some mock | Medium |
| Plans | `Plans.tsx` | Supabase | Some mock | Medium |
| Products | `Products.tsx` | Supabase | Live | None |
| Promotions | `Promotions.tsx` | Supabase | Some mock | Medium |
| Storefront | `Storefront.tsx` | Supabase | Some mock | Medium |

---

## ADMIN PORTAL — `/admin/*` (21 files)

**ADD ONLY — no modifications without explicit scope.**

| Page | File | Function | Mock? | Notes |
|---|---|---|---|---|
| Dashboard | `AdminDashboard.tsx` | Platform overview | Some mock | Core admin |
| Brand List | `AdminBrandList.tsx` | Brand management | Live | Working |
| Approval Queue | `AdminApprovalQueue.tsx` | Brand/operator approvals | Live | Working |
| Inbox | `AdminInbox.tsx` | Comms | Some mock | Medium |
| Login | `AdminLogin.tsx` | Auth | None | Working |
| Market Signals | `AdminMarketSignals.tsx` | Curate Intelligence Hub signals | Live (new W9-05) | ✅ New — route `/admin/market-signals` |
| Order Detail | `AdminOrderDetail.tsx` | Order mgmt | Some mock | Medium |
| Orders | `AdminOrders.tsx` | Order list | Live | Working |
| Seeding | `AdminSeeding.tsx` | DB seed tool | Live | Working |
| Signals | `AdminSignals.tsx` | Brand interest signals | Live | Working — distinct from market signals |
| API Dashboard | `ApiDashboard.tsx` | API usage stats | Some mock | Medium |
| Auth Debug | `AuthDebug.tsx` | Dev tool | N/A | Dev only — ensure not public |
| Brand Admin Editor | `BrandAdminEditor.tsx` | Full brand CMS | Live | Working |
| Brand Hub | `BrandHub.tsx` + `brand-hub/` | Brand content management | Mixed | Complex — partially mocked |
| Bulk Protocol Import | `BulkProtocolImport.tsx` | Protocol seeding | Live | Working |
| Debug Panel | `DebugPanel.tsx` | Dev diagnostics | N/A | Scoped to admin only ✅ |
| Intelligence Dashboard | `IntelligenceDashboard.tsx` | Signal analytics | Some mock | Medium |
| Region Management | `RegionManagement.tsx` | Geo management | Some mock | Medium |
| Reports Library | `ReportsLibrary.tsx` | Report management | Some mock | Medium |
| Submission Detail | `SubmissionDetail.tsx` | Form submissions | Live | Working |
| BenchmarkDashboard | (in business portal) | Benchmarks | **HEAVY MOCK** | Route `/portal/benchmarks` added W9-01 |

---

## DATA / API STATE — WHAT IS AND ISN'T LIVE

### What is genuinely live (hits Supabase)
- Auth (login, signup, magic link, password reset)
- Brand discovery (`brands` table — public RLS)
- Protocol library (`canonical_protocols` table)
- Education modules (`brand_training_modules`)
- Orders & order items
- Business portal intelligence (partial)
- Access requests form (`access_requests` table — wired W9-01)
- Market signals feed (`market_signals` table — seeded W9-05, 10 signals)
- Brand interest signals (tracking only)
- AI Concierge (OpenRouter via edge function)
- Checkout (Stripe via edge function)
- Email (Resend via edge function)

### What is mocked / hardcoded (needs real wiring)
- Home market pulse numbers (2,847 professionals, 156 brands, 342 signals — hardcoded)
- ~~Events page — 8 hardcoded events, no `events` table~~ ✅ DONE W10-01
- Jobs page — 12 hardcoded jobs, no live scraping
- Benchmark Dashboard — all mock peer data
- Business portal intelligence benchmarks — mock
- Brand portal intelligence reports — mock
- Operator enrichment (Google Reviews, website analysis, social presence) — ALL stubs
- Pricing page subscription tiers — hardcoded, no dynamic pricing from Supabase
- Brand storefront adoption metrics — hardcoded percentages

### External APIs — 0 of 90+ integrated
No external API keys exist in `.env` beyond Supabase + Stripe + OpenRouter + Resend.
**Full catalog documented in `SOCELLE_COMPLETE_API_CATALOG.md`.**
Highest-leverage zero-cost integrations to build next:
1. Open Beauty Facts (no key) — ingredient/product data
2. Open FDA (no key) — cosmetic safety data
3. NPI Registry (no key) — operator verification
4. Google Trends via RSS (no key) — trend signals
5. NewsAPI / GNews (free tier) — industry news for Insights page
6. RSS feeds — 49 feeds cataloged across beauty/spa/medspa/wellness publications

---

## WHAT NEEDS TO HAPPEN — PRIORITIZED

### 🔴 Fix Now (before any real users hit the site)

| # | Issue | File | Est. |
|---|---|---|---|
| 1 | `ForgotPassword.tsx` + `ResetPassword.tsx` — still use `pro-*` tokens | Both files | 1h |
| ~~2~~ | ~~`Insights.tsx` — orphaned page~~ | ~~`Insights.tsx` + Nav~~ | ✅ DONE — redirects to `/intelligence` |
| 3 | Home market pulse numbers (`2,847 professionals` etc.) — hardcoded, presented without disclaimer | `Home.tsx` | 0.5h |
| 4 | `BrandStorefront.tsx` adoption metrics presented without PREVIEW label | `BrandStorefront.tsx` | 0.5h |

### 🟡 Wave 10 — Short Term (1–2 weeks)

| # | Feature | Scope | Est. |
|---|---|---|---|
| W10-01 | `events` Supabase table + wire Events.tsx | Migration + page update | ✅ COMPLETE |
| W10-02 | `job_postings` Supabase table + wire Jobs.tsx | Migration + page update | 6h |
| W10-03 | RSS ingestion pipeline — Edge Function to poll 10 feeds, store in `rss_items` table, surface in Insights | Edge Fn + migration | 10h |
| W10-04 | Open Beauty Facts integration — Edge Function + `ingredients` table | Edge Fn + migration | 8h |
| W10-05 | Home market pulse — wire to live Supabase aggregates (COUNT professionals, COUNT brands, COUNT signals) | Migration view + Home.tsx | 3h |
| W10-06 | NPI Registry operator verification — lookup by business name/address | Edge Fn + businesses table column | 6h |
| W10-07 | ForgotPassword + ResetPassword token fix | Both files | 1h |
| W10-08 | Jobs live scraping pipeline (Tier 2 — paid) | Edge Fn + scraper service | 20h+ |

### 🔵 Wave 11 — Medium Term (1 month)

| # | Feature | Scope | Est. |
|---|---|---|---|
| W11-01 | Google Trends integration — track 30 beauty terms, surface in Intelligence Hub | Edge Fn + signals table | 8h |
| W11-02 | NewsAPI/GNews integration — wire Insights page with real articles | Edge Fn + rss_items | 6h |
| W11-03 | Benchmark Dashboard live data — wire peer benchmarks from real `businesses` aggregate queries | Portal page + migration | 10h |
| W11-04 | Business portal Intelligence Hub live data | IntelligenceHub.tsx + market_signals | 8h |
| W11-05 | Brand Intelligence Reports — wire to real signal data | IntelligenceReport.tsx | 8h |
| W11-06 | Open FDA safety data — ingredient compliance checks | Edge Fn + safety_events table | 6h |
| W11-07 | Google Places / Yelp enrichment — operator profiles | enrichmentService.ts upgrade | 12h |
| W11-08 | Operator enrichment pipeline — schedule, orchestrate, store | Edge Fn scheduler | 16h |
| W11-09 | WebM video conversion (all 6 videos — 30-40% size reduction) | Build pipeline | 2h |
| W11-10 | Dynamic sitemaps (brands, protocols, jobs from Supabase) | Edge Fn sitemap generator | 4h |
| W11-11 | WCAG accessibility audit | All public pages | 8h |
| W11-12 | Jobs international expansion (UK, CA, AU, UAE) | 4 route sets + hreflang | 16h |

### ⚪ Backlog (no timeline set)

- Social media API integrations (Instagram, TikTok, Pinterest) for brand content
- AI try-on APIs (4 cataloged — all paid)
- Patent data integration (Google Patents, USPTO)
- Service price benchmarking via scraping
- Reddit community monitoring (10 subreddits cataloged)
- BLS jobs data wire-in
- Industry classification code system (NAICS/SIC for operator segmentation)
- Multi-language support (translations stubbed for fr/es — need content)
- Mobile app (Flutter — sharing Supabase API contracts, Phase 6)
- Desktop app (Tauri wrapper around React+Vite build, Phase 6)

---

## DESIGN SYSTEM COMPLIANCE — CURRENT STATE

| Check | Status | Notes |
|---|---|---|
| Pearl Mineral V2 colors on public pages | ✅ 24/26 pages | ForgotPassword + ResetPassword still use `pro-*` |
| `font-serif` violations | ✅ 0 instances | Fully cleaned in W9-06 |
| Banned SaaS phrases | ✅ 0 instances | Cleaned in W9 |
| General Sans loading | ✅ Yes — Fontshare CDN in `index.html` | |
| Glass system | ✅ MainNav, cards | |
| `pro-*` on portal pages | ⚠️ Expected — portals use legacy tokens for backward compat | DO NOT clean portal pro-* tokens without full portal audit |

---

## NAVIGATION — CURRENT STATE

### Public MainNav (verified in code)
```
Intelligence | Brands | Education | Events | Jobs | For Buyers | For Brands | Pricing
```
✅ All 8 required links present (updated W9-01)

### Auth-Aware Right Pill (verified in code)
- Not logged in: Sign In + Request Access ✅
- `admin` / `platform_admin`: Admin → `/admin` ✅
- `business_user`: My Portal → `/portal/dashboard` ✅
- `brand_admin`: Brand Portal → `/brand/dashboard` ✅

### Missing from Nav (intentional or needs decision)
- `/insights` — page exists but not in nav. Orphaned. Decide: wire or remove.
- `/how-it-works` — in footer but not main nav (intentional)
- `/protocols` — in footer but not main nav (intentional)
- `/about` — in footer but not main nav (intentional)
- `/for-medspas`, `/for-salons` — linked from For Buyers but not main nav (intentional)

---

## CONVERSION FUNNEL — CURRENT STATE

```
Homepage CTA "Get Intelligence Access"
       ↓
/request-access (form)
       ↓  ✅ WIRED — inserts to access_requests table (fixed W9-01)
Success state: "We'll be in touch — check your email"
       ↓  ⚠️ No auto-email trigger yet (send-email edge function exists but not triggered)
/portal/signup (manual link from success state)
       ↓
Dashboard with intelligence preview
```

**Missing:** Auto-email trigger on `access_requests` insert. The `send-email` edge function exists — needs a Supabase database webhook or trigger to fire on `access_requests` INSERT.

---

## SUPABASE — CURRENT STATE

- **74 migrations** — all historical, ADD ONLY policy enforced
- **Key tables live:** `brands`, `businesses`, `user_profiles`, `canonical_protocols`, `orders`, `messages`, `access_requests`, `market_signals`, `events` (live W10-01), `job_postings` (live W10-02), `brand_interest_signals`, `subscriptions`
- **Tables still needed:** `rss_items`, `rss_sources`, `ingredient_data`, `enrichment_profiles`
- **7 Edge Functions deployed:** ai-concierge, ai-orchestrator, create-checkout, generate-embeddings, magic-link, send-email, stripe-webhook
- **Missing Edge Functions:** rss-ingestion, open-beauty-facts-sync, npi-lookup, sitemap-generator, intelligence-briefing, jobs-search

---

## V1 TECH BASELINE — SURGICAL UPGRADE (per V1 §E)

The current stack is a working React 18.3 + Vite 5.4 + TS 5.5 + Tailwind 3.4 app. V1 defines these as **surgical, incremental upgrades** (~1 working day total, zero rewrites):

| Package | Current | Target | Effort |
|---|---|---|---|
| React | 18.3 | 19.x | ~2 hours |
| Vite | 5.4 | 6.x | ~1 hour |
| TypeScript | 5.5 strict | strict + `noExplicitAny` | ~3-5 hours |
| TanStack Query | not yet | v5 (standardize all data fetching) | Phase 3 |
| Tailwind | 3.4 | **Stay on 3.4** — Tailwind 4 deferred until design debt cleared | — |
| Sentry | not yet | Web + edge | Phase 3 |

**Primary runtime:** React + Vite (SPA). Next.js is NOT the main runtime; only optional for SEO surfaces.

## V1 EXECUTION PHASES (per V1 §I)

1. Phase 0 — Design + Required Docs
2. Phase 1 — Skills Installation (51+ skills)
3. Phase 2 — Full-Platform Audit
4. Phase 3 — Tech Upgrades (React 19, Vite 6, TS strict, TanStack, Sentry) — ~1 day
5. Phase 4 — Intelligence Cloud Build (10 modules + 7 engines + 6 AI tools + credit economy + affiliate engine)
6. Phase 5 — All Hubs Functional (incl. CMS, Authoring Studio, all 15 hubs non-shell)
7. Phase 6 — Multi-Platform (Tauri desktop, Flutter mobile)
8. Phase 7 — Launch

## V1 15-HUB ANTI-SHELL STATUS

| Hub | Status | Notes |
|---|---|---|
| Intelligence | Partial DEMO | Needs live data wire (Phase 4) |
| Jobs | Routes exist | Needs anti-shell completion |
| Brands | Mostly LIVE | Strong coverage |
| Professionals | DEMO | Hardcoded stats |
| Admin | Mostly LIVE | 37+ routes |
| CRM | Route exists | Needs full build (Phase 5) |
| Education | LIVE | Protocols + training modules |
| Marketing | Partial | Calendar, campaigns partial |
| Sales | Route exists | Needs full build (Phase 5) |
| Commerce | Module (not nav) | Within portals |
| Authoring Studio | NOT CREATED | Phase 5 — CMS + blog + briefs |
| Mobile App | Flutter, 21 features | Phase 6 |
| Desktop App | NOT CREATED | Phase 6 — Tauri |
| Credit Economy | NOT CREATED | Phase 4 |
| Affiliate/Wholesale Engine | NOT CREATED | Phase 4 |

---

## AGENT COORDINATION RULES

1. This document is the single source of truth — update it when work is completed
2. All work must reference a Wave/WO number — no ad-hoc changes
3. Run `npx tsc --noEmit` AND `npm run build` before marking any WO complete
4. Portal routes (`/portal/*`, `/brand/*`, `/admin/*`) — DO NOT MODIFY without explicit WO scope
5. Supabase migrations — ADD ONLY, never modify existing
6. Commerce flow (cart, checkout, orders) — NEVER MODIFY
7. Auth system (ProtectedRoute, AuthProvider) — NEVER MODIFY
8. Read `/.claude/CLAUDE.md` and `/docs/command/*` before any design work
9. Intelligence leads, marketplace follows — visible in every output
10. No fake-live data — everything is either DB-connected or clearly labeled DEMO/PREVIEW
