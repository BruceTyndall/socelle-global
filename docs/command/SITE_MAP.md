> Updated to align with V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md on 2026-03-08.

# SITE MAP — SOCELLE GLOBAL
**Generated:** March 5, 2026 — Phase 1 Full Audit
**Updated:** March 8, 2026 — V1 Master Alignment
**Authority:** `docs/command/V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` (V1 wins if conflicts exist)
**Source:** `App.tsx` routes, Flutter features, Next.js `app/` dir, e2e `routeTable.ts`
**Primary runtime:** React + Vite (SPA). Next.js is SEO-only, NOT the primary runtime.

---

## WEB PUBLIC (34 routes)

| # | Route | File | Data Source |
|---|---|---|---|
| 1 | `/` | `pages/public/Home.tsx` | **DEMO** — hardcoded `INTELLIGENCE_SIGNALS` |
| 2 | `/home` | → redirect `/` | — |
| 3 | `/brands` | `pages/public/Brands.tsx` | **LIVE** — `supabase.from('brands')` |
| 4 | `/brands/:slug` | `pages/public/BrandStorefront.tsx` | **LIVE** — brands + seed + products |
| 5 | `/intelligence` | `pages/public/Intelligence.tsx` | **LIVE** — `useIntelligence()` |
| 6 | `/insights` | → redirect `/intelligence` | — |
| 7 | `/events` | `pages/public/Events.tsx` | **LIVE** — `supabase.from('events')` |
| 8 | `/jobs` | `pages/public/Jobs.tsx` | **LIVE** — `supabase.from('job_postings')` |
| 9 | `/jobs/:slug` | `pages/public/JobDetail.tsx` | **LIVE** — `supabase.from('job_postings')` |
| 10 | `/plans` | `pages/public/Plans.tsx` | **DEMO** — hardcoded TIERS |
| 11 | `/about` | `pages/public/About.tsx` | Static |
| 12 | `/education` | `pages/public/Education.tsx` | **LIVE** — protocols |
| 13 | `/protocols` | `pages/public/Protocols.tsx` | **LIVE** — protocols |
| 14 | `/protocols/:slug` | `pages/public/ProtocolDetail.tsx` | **LIVE** — protocol detail |
| 15 | `/professionals` | `pages/public/Professionals.tsx` | **DEMO** — hardcoded STATS |
| 16 | `/for-brands` | `pages/public/ForBrands.tsx` | **DEMO** — hardcoded STATS |
| 17 | `/for-medspas` | `pages/public/ForMedspas.tsx` | Static |
| 18 | `/for-salons` | `pages/public/ForSalons.tsx` | Static |
| 19 | `/how-it-works` | `pages/public/HowItWorks.tsx` | Static |
| 20 | `/request-access` | `pages/public/RequestAccess.tsx` | **LIVE** — `access_requests` |
| 21 | `/faq` | `pages/public/FAQ.tsx` | Static |
| 22 | `/privacy` | `pages/public/Privacy.tsx` | Static |
| 23 | `/terms` | `pages/public/Terms.tsx` | Static |
| 24 | `/forgot-password` | `pages/public/ForgotPassword.tsx` | **LIVE** — auth |
| 25 | `/reset-password` | `pages/public/ResetPassword.tsx` | **LIVE** — auth |
| 26 | `/api/docs` | `pages/public/ApiDocs.tsx` | Static |
| 27 | `/api/pricing` | `pages/public/ApiPricing.tsx` | Static |
| 28 | `/claim/brand/:slug` | `pages/claim/ClaimBrand.tsx` | LIVE |
| 29 | `/claim/business/:slug` | `pages/claim/ClaimBusiness.tsx` | LIVE |
| 30 | `/stories` | `pages/public/StoriesIndex.tsx` | **LIVE** — `supabase.from('stories')` |
| 31 | `/stories/:slug` | `pages/public/StoryDetail.tsx` | **LIVE** — `supabase.from('stories')` |
| 32 | `/ingredients` | `pages/public/Ingredients.tsx` | **LIVE** — ingredients data |
| 33 | `/for-buyers` | → redirect `/professionals` | — |
| 34 | (orphaned) | `pages/public/Insights.tsx` | **DEMO** — TREND_PLACEHOLDERS (route redirected) |

---

## WEB BUSINESS PORTAL (22 routes, `/portal/*`)

| # | Route | File | Auth |
|---|---|---|---|
| 1 | `/portal` | `pages/business/PortalHome.tsx` | — |
| 2 | `/portal/login` | `pages/business/Login.tsx` | — |
| 3 | `/portal/signup` | `pages/business/Signup.tsx` | — |
| 4 | `/portal/dashboard` | `pages/business/Dashboard.tsx` | business_user |
| 5 | `/portal/intelligence` | `pages/business/IntelligenceHub.tsx` | business_user |
| 6 | `/portal/advisor` | `pages/business/AIAdvisor.tsx` | business_user |
| 7 | `/portal/notifications` | `pages/business/NotificationPreferences.tsx` | business_user |
| 8 | `/portal/plans` | `pages/business/PlansList.tsx` | business_user |
| 9 | `/portal/plans/new` | `pages/business/PlanWizard.tsx` | business_user |
| 10 | `/portal/plans/compare` | `pages/business/PlanComparison.tsx` | business_user |
| 11 | `/portal/plans/:id` | `pages/business/PlanResults.tsx` | business_user |
| 12 | `/portal/brands/:slug` | `pages/business/BrandDetail.tsx` | — |
| 13 | `/portal/orders` | `pages/business/Orders.tsx` | business_user |
| 14 | `/portal/orders/:id` | `pages/business/OrderDetail.tsx` | business_user |
| 15 | `/portal/account` | `pages/business/Account.tsx` | business_user |
| 16 | `/portal/messages` | `pages/business/Messages.tsx` | business_user |
| 17 | `/portal/calendar` | `pages/business/MarketingCalendar.tsx` | business_user |
| 18 | `/portal/apply` | `pages/business/Apply.tsx` | business_user |
| 19 | `/portal/claim/review` | `pages/business/ClaimReview.tsx` | business_user |
| 20 | `/portal/ce-credits` | `pages/business/CECredits.tsx` | business_user |
| 21 | `/portal/locations` | `pages/business/LocationsDashboard.tsx` | business_user |
| 22 | `/portal/benchmarks` | `pages/business/BenchmarkDashboard.tsx` | business_user |

---

## WEB BRAND PORTAL (26 routes, `/brand/*`)

| # | Route | File | Auth |
|---|---|---|---|
| 1 | `/brand/login` | `pages/brand/Login.tsx` | — |
| 2 | `/brand/apply` | `pages/brand/Apply.tsx` | — |
| 3 | `/brand/apply/received` | `pages/brand/ApplicationReceived.tsx` | — |
| 4 | `/brand` | → redirect `/brand/dashboard` | brand_admin |
| 5 | `/brand/dashboard` | `pages/brand/Dashboard.tsx` | brand_admin |
| 6 | `/brand/claim/review` | `pages/brand/ClaimReview.tsx` | brand_admin |
| 7 | `/brand/onboarding` | `pages/brand/Onboarding.tsx` | brand_admin |
| 8 | `/brand/orders` | `pages/brand/Orders.tsx` | brand_admin |
| 9 | `/brand/orders/:id` | `pages/brand/OrderDetail.tsx` | brand_admin |
| 10 | `/brand/products` | `pages/brand/Products.tsx` | brand_admin |
| 11 | `/brand/performance` | `pages/brand/Performance.tsx` | brand_admin |
| 12 | `/brand/messages` | `pages/brand/Messages.tsx` | brand_admin |
| 13 | `/brand/campaigns` | `pages/brand/Campaigns.tsx` | brand_admin |
| 14 | `/brand/campaigns/new` | `pages/brand/CampaignBuilder.tsx` | brand_admin |
| 15 | `/brand/automations` | `pages/brand/Automations.tsx` | brand_admin |
| 16 | `/brand/promotions` | `pages/brand/Promotions.tsx` | brand_admin |
| 17 | `/brand/customers` | `pages/brand/Customers.tsx` | brand_admin |
| 18 | `/brand/pipeline` | `pages/brand/Pipeline.tsx` | brand_admin |
| 19 | `/brand/storefront` | `pages/brand/Storefront.tsx` | brand_admin |
| 20 | `/brand/intelligence` | `pages/brand/BrandIntelligenceHub.tsx` | brand_admin |
| 21 | `/brand/advisor` | `pages/brand/BrandAIAdvisor.tsx` | brand_admin |
| 22 | `/brand/notifications` | `pages/brand/BrandNotificationPreferences.tsx` | brand_admin |
| 23 | `/brand/intelligence-pricing` | `pages/brand/IntelligencePricing.tsx` | brand_admin |
| 24 | `/brand/intelligence-report` | `pages/brand/IntelligenceReport.tsx` | brand_admin |
| 25 | `/brand/plans` | `pages/brand/Plans.tsx` (legacy) | brand_admin |
| 26 | `/brand/leads` | `pages/brand/Leads.tsx` (legacy) | brand_admin |

---

## WEB ADMIN (46 routes + 8 brand-hub, `/admin/*`)

| # | Route | File |
|---|---|---|
| 1 | `/admin/login` | `pages/admin/AdminLogin.tsx` |
| 2 | `/admin/debug-auth` | `pages/admin/AuthDebug.tsx` |
| 3 | `/admin` | → redirect `/admin/brands` |
| 4 | `/admin/dashboard` | `pages/admin/AdminDashboard.tsx` |
| 5 | `/admin/inbox` | `pages/admin/AdminInbox.tsx` |
| 6 | `/admin/orders` | `pages/admin/AdminOrders.tsx` |
| 7 | `/admin/orders/:id` | `pages/admin/AdminOrderDetail.tsx` |
| 8 | `/admin/debug` | `pages/admin/DebugPanel.tsx` |
| 9 | `/admin/submissions/:id` | `pages/admin/SubmissionDetail.tsx` |
| 10 | `/admin/protocols/import` | `pages/admin/BulkProtocolImport.tsx` |
| 11 | `/admin/ingestion` | `components/IngestionView.tsx` |
| 12 | `/admin/protocols` | `components/ProtocolsView.tsx` |
| 13 | `/admin/mixing` | `components/MixingRulesView.tsx` |
| 14 | `/admin/costs` | `components/CostsView.tsx` |
| 15 | `/admin/calendar` | `components/MarketingCalendarView.tsx` |
| 16 | `/admin/rules` | `components/BusinessRulesView.tsx` |
| 17 | `/admin/health` | `components/SchemaHealthView.tsx` |
| 18 | `/admin/products` | Inline (ProProductsView + RetailProductsView) |
| 19 | `/admin/approvals` | `pages/admin/AdminApprovalQueue.tsx` |
| 20 | `/admin/seeding` | `pages/admin/AdminSeeding.tsx` |
| 21 | `/admin/signals` | `pages/admin/AdminSignals.tsx` |
| 22 | `/admin/market-signals` | `pages/admin/AdminMarketSignals.tsx` |
| 23 | `/admin/intelligence` | `pages/admin/IntelligenceDashboard.tsx` |
| 24 | `/admin/reports` | `pages/admin/ReportsLibrary.tsx` |
| 25 | `/admin/api` | `pages/admin/ApiDashboard.tsx` |
| 26 | `/admin/regions` | `pages/admin/RegionManagement.tsx` |
| 27 | `/admin/brands` | `pages/admin/AdminBrandList.tsx` |
| 28 | `/admin/brands/new` | `pages/admin/BrandAdminEditor.tsx` |
| 29 | `/admin/brands/:id` | Brand Hub → 8 sub-routes: |
| 29a | `.../profile` | `BrandAdminEditor.tsx` |
| 29b | `.../products` | `brand-hub/HubProducts.tsx` |
| 29c | `.../protocols` | `brand-hub/HubProtocols.tsx` |
| 29d | `.../education` | `brand-hub/HubEducation.tsx` |
| 29e | `.../orders` | `brand-hub/HubOrders.tsx` |
| 29f | `.../retailers` | `brand-hub/HubRetailers.tsx` |
| 29g | `.../analytics` | `brand-hub/HubAnalytics.tsx` |
| 29h | `.../settings` | `brand-hub/HubSettings.tsx` |
| 30 | `/admin/crm` | `pages/admin/CrmHub.tsx` |
| 31 | `/admin/social` | `pages/admin/SocialHub.tsx` |
| 32 | `/admin/sales` | `pages/admin/SalesHub.tsx` |
| 33 | `/admin/editorial` | `pages/admin/EditorialHub.tsx` |
| 34 | `/admin/affiliates` | `pages/admin/AffiliatesHub.tsx` |
| 35 | `/admin/events` | `pages/admin/EventsHub.tsx` |
| 36 | `/admin/jobs` | `pages/admin/JobsHub.tsx` |
| 37 | `/admin/recruitment` | `pages/admin/RecruitmentHub.tsx` |
| 38 | `/admin/feeds` | `pages/admin/AdminFeedsHub.tsx` |
| 39 | `/admin/blog` | `pages/admin/AdminBlogHub.tsx` |
| 40 | `/admin/pages` | `pages/admin/AdminPagesHub.tsx` |
| 41 | `/admin/media` | `pages/admin/AdminMediaHub.tsx` |
| 42 | `/admin/seo` | `pages/admin/AdminSeoHub.tsx` |
| 43 | `/admin/live-data` | `pages/admin/AdminLiveDataHub.tsx` |
| 44 | `/admin/api-control` | `pages/admin/AdminApiControlHub.tsx` |
| 45 | `/admin/api-sitemap` | `pages/admin/AdminApiSitemapHub.tsx` |
| 46 | `/admin/settings` | `pages/admin/AdminSettingsHub.tsx` |

---

## WEB LEGACY REDIRECTS (9)

| Route | Target |
|---|---|
| `/spa/login` | `/portal/login` |
| `/spa/signup` | `/portal/signup` |
| `/spa/dashboard` | `/portal/dashboard` |
| `/spa/plans` | `/portal/plans` |
| `/spa/plan/new` | `/portal/plans/new` |
| `/spa/plan/:id` | `/portal/plans/:id` |
| `/spa/plans/new` | `/portal/plans/new` |
| `/spa/plans/:id` | `/portal/plans/:id` |
| `/spa/*` | `/portal` |

---

## MARKETING SITE (`apps/marketing-site/` — Next.js, SEO-only surface, NOT primary runtime)

| # | Route / File | Type |
|---|---|---|
| 1 | `/` | `app/layout.tsx` (Next.js root layout) |
| 2 | `/intelligence` | `app/intelligence/page.tsx` |
| 3 | `/sitemap.xml` | `app/sitemap.ts` (programmatic) |
| 4 | `/robots.txt` | `app/robots.ts` (programmatic) |

---

## MOBILE FEATURES (`SOCELLE-MOBILE-main/apps/mobile/lib/features/`)

| # | Feature | Page File | Children |
|---|---|---|---|
| 1 | `auth/` | `auth_gate_page.dart` | 1 |
| 2 | `onboarding/` | `onboarding_page.dart` | 8 |
| 3 | `paywall/` | `paywall_page.dart` | 3 |
| 4 | `dashboard/` | `dashboard_page.dart` | 9 |
| 5 | `feed/` | `feed_page.dart` | 1 |
| 6 | `discover/` | `discover_page.dart` | 1 |
| 7 | `shop/` | `shop_page.dart` | 1 |
| 8 | `schedule/` | `schedule_page.dart` | 1 |
| 9 | `studio/` | `studio_page.dart` | 1 |
| 10 | `messages/` | `messages_page.dart` | 1 |
| 11 | `profile/` | `profile_page.dart` | 1 |
| 12 | `settings/` | `settings_page.dart` | 8 |
| 13 | `revenue/` | `revenue_page.dart` | 1 |
| 14 | `weekly_summary/` | `weekly_summary_page.dart` | 1 |
| 15 | `support/` | `support_page.dart` | 1 |
| 16 | `socelle_showcase/` | `socelle_showcase_page.dart` | 1 |
| 17 | `affiliate/` | — | 1 |
| 18 | `gap_action/` | `fill_slot_flow.dart` | 3 |
| 19 | `gaps/` | — | 1 |
| 20 | `share/` | — | 1 |
| 21 | `shell/` | — | 1 |

---

## TOTAL COUNTS

| Surface | Routes/Features |
|---|---|
| Web Public | 34 |
| Web Business Portal | 22 |
| Web Brand Portal | 26 |
| Web Admin | 54 (46 + 8 hub) |
| Web Legacy Redirects | 9 |
| Marketing Site | 4 |
| Mobile Features | 21 dirs |
| **TOTAL** | **170+** |

---

---

## PLANNED SURFACES — V1 HUBS NOT YET ROUTED

Per V1 §G, all 15 hubs must be non-shell. The following hubs do not yet have dedicated route coverage and are planned for future phases:

| Hub | Planned Phase | Notes |
|---|---|---|
| Authoring Studio | Phase 5 | CMS + blog + briefs + education content authoring |
| Desktop App | Phase 6 | Tauri shell wrapping same React+Vite build |
| Credit Economy | Phase 4 | Credit metering, deduction, usage dashboard |
| Affiliate/Wholesale Engine | Phase 4 | FTC badges, tracked redirects, commission reporting |
| CRM | Phase 5 | `/admin/crm` exists as route — needs full hub build |
| Sales | Phase 5 | `/admin/sales` exists as route — needs full hub build |

## V1 TECH + RUNTIME NOTES

- **Primary runtime:** React + Vite (SPA with React Router). Surgical upgrade to React 19 + Vite 6 planned (~1 day total effort).
- **Next.js:** Optional SEO surface only. NOT the main runtime.
- **Tailwind:** Stay on 3.4. Tailwind 4 deferred until design debt cleared.
- **Desktop:** Tauri wrapper around same React+Vite build (Phase 6).
- **Mobile:** Flutter app sharing same Supabase API contracts (Phase 6).

---

*Per `docs/command/SOCELLE_RELEASE_GATES.md` §9 FAIL 5: No route or screen omitted.*
