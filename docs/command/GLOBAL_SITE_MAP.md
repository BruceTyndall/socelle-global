# GLOBAL SITE MAP — SOCELLE PLATFORM
**Generated:** March 5, 2026 — Phase 1 Full Audit  
**Authority:** `/.claude/CLAUDE.md` + `docs/command/*`  
**Validated against:** `SITE_MAP.md`, `MODULE_BOUNDARIES.md`, `HARD_CODED_SURFACES.md`

> [!IMPORTANT]
> **WO ID Source Rule:** All Wave/WO IDs referenced in this document (W10-xx, W11-xx) are only valid if defined in `SOCELLE-WEB/docs/build_tracker.md`. Any WO ID not present in `build_tracker.md` is a proposed addition and must be added there before execution.
>
> **Status Truthfulness:** A route is LIVE only if its primary data source is DB-connected and verified. Pages with hardcoded mock data or unverified counts are DEMO regardless of whether the page renders. Pages awaiting a future WO to wire data remain DEMO until that WO is marked ✅ COMPLETE in `build_tracker.md`.

---

## PLATFORM IA (OUTLINE)

```
SOCELLE PLATFORM
├── PUBLIC WEB (Intelligence-First)
│   ├── Intelligence Hub
│   ├── Brands Directory + Brand Profiles
│   ├── Education + Protocols
│   ├── Events
│   ├── Jobs + Job Detail
│   ├── Landing Pages (For Buyers, For Brands, For Medspas, For Salons)
│   ├── How It Works
│   ├── Pricing
│   ├── About / FAQ / Privacy / Terms
│   ├── API Documentation
│   ├── Request Access + Auth Flows
│   └── Claim Flows (Brand + Business)
│
├── OPERATOR PORTAL (/portal/*)
│   ├── Dashboard
│   ├── Intelligence Hub
│   ├── AI Advisor
│   ├── Business Plans (wizard, results, compare)
│   ├── Orders + Order Detail
│   ├── Messages
│   ├── Marketing Calendar
│   ├── CE Credits
│   ├── Locations
│   ├── Benchmarks
│   ├── Account + Apply + Claim Review
│   └── Notifications
│
├── BRAND PORTAL (/brand/*)
│   ├── Dashboard
│   ├── Intelligence Hub + Reports + Pricing
│   ├── AI Advisor
│   ├── Products
│   ├── Orders + Order Detail
│   ├── Storefront Editor
│   ├── Campaigns + Automations + Promotions
│   ├── Customers + Pipeline
│   ├── Messages
│   ├── Plans (legacy)
│   ├── Onboarding + Apply + Claim Review
│   └── Notifications
│
├── ADMIN (/admin/*)
│   ├── Dashboard
│   ├── Brand Management (list, editor, hub)
│   ├── Intelligence (signals, market signals, dashboard)
│   ├── Orders
│   ├── Approvals
│   ├── Protocols + Ingestion + Mixing Rules
│   ├── Seeding + Products + Health
│   ├── Reports + API + Regions + Calendar
│   └── Debug + Inbox
│
├── ECOMMERCE MODULE (within portals — NOT a top-level surface)
│   ├── Brand Shop (component within BrandStorefront)
│   ├── Cart Drawer (component)
│   ├── Product Cards
│   ├── Order Management (operator, brand, admin views)
│   ├── PaywallGate + UpgradeGate (subscription gates)
│   └── Stripe Edge Functions (checkout, webhook)
│
├── MARKETING SITE (apps/marketing-site/ — Next.js)
│   ├── Layout
│   ├── Intelligence Landing
│   ├── Sitemap + Robots
│
└── MOBILE APP (Flutter)
    ├── Auth + Onboarding + Paywall
    ├── Dashboard + Feed + Discover
    ├── Shop + Schedule + Studio
    ├── Messages + Profile + Settings
    ├── Revenue + Weekly Summary
    ├── Support + Socelle AI
    └── Affiliate + Gaps + Share + Shell
```

---

## NAVIGATION GROUPINGS (IA)

### Public MainNav (verified in `MainNav.tsx`)
```
Intelligence | Brands | Education | Events | Jobs | For Buyers | For Brands | Pricing
```
Right pill (auth-aware): Sign In + Request Access / My Portal / Brand Portal / Admin

### Public Footer Links
About, How It Works, Protocols, For Medspas, For Salons, Privacy, Terms, FAQ, API Docs, API Pricing

### Intelligence Navigation
- `/intelligence` — Main hub (market signals, trends, categories)
- `/portal/intelligence` — Operator intelligence (business-specific)
- `/brand/intelligence` — Brand intelligence hub
- `/admin/intelligence` — Admin intelligence dashboard
- `/admin/market-signals` — Signal curation
- `/admin/signals` — Brand interest signals

### Jobs & Events
- `/jobs` — Job listings (filters: vertical, type, location)
- `/jobs/:slug` — Job detail
- `/events` — Events calendar (filters: type, location)

### Operator Portal Nav (`BusinessLayout.tsx`)
Dashboard, Intelligence, AI Advisor, Plans, Orders, Messages, Calendar, Locations, Benchmarks, CE Credits, Account, Apply, Notifications

### Brand Portal Nav (`BrandLayout.tsx`)
Dashboard, Intelligence, AI Advisor, Products, Orders, Storefront, Campaigns, Customers, Pipeline, Messages, Plans, Notifications

### Admin Nav (`AdminLayout.tsx`)
Dashboard, Brands, Approvals, Orders, Intelligence, Market Signals, Signals, Protocols, Ingestion, Products, Mixing Rules, Costs, Calendar, Rules, Health, Reports, API, Regions, Seeding, Inbox, Debug

### Ecommerce Surfaces (Module — NOT top-level nav)
Product browsing in BrandStorefront (`/brands/:slug`) and BrandDetail (`/portal/brands/:slug`), Cart via CartDrawer component, Orders across all 3 portals. PaywallGate in PlanWizard, UpgradeGate in PlanResults.

---

## WEB ROUTES — FULL TABLE

### Public Routes

| Name | Route | File | Audience | Status | Data Dependency | Primary Intent |
|---|---|---|---|---|---|---|
| Home | `/` | `pages/public/Home.tsx` | Public | **DEMO** | Hardcoded `INTELLIGENCE_SIGNALS` — fake timestamps, fake badge | Platform entry, intelligence preview |
| Home redirect | `/home` | → `/` | Public | LIVE | — | Redirect |
| Intelligence Hub | `/intelligence` | `pages/public/Intelligence.tsx` | Public | LIVE | `market_signals` via `useIntelligence()` | Market intelligence dashboard |
| Brands Directory | `/brands` | `pages/public/Brands.tsx` | Public | LIVE | `brands` table | Browse authorized brands |
| Brand Profile | `/brands/:slug` | `pages/public/BrandStorefront.tsx` | Public | LIVE | `brands`, `brand_seed_content`, `pro_products`, `retail_products`, `protocols`, `brand_interest_signals` | Brand discovery + wholesale shopping |
| Education Hub | `/education` | `pages/public/Education.tsx` | Public | LIVE | `brand_training_modules` | CE courses and training |
| Protocols | `/protocols` | `pages/public/Protocols.tsx` | Public | LIVE | `canonical_protocols` | Protocol library |
| Protocol Detail | `/protocols/:slug` | `pages/public/ProtocolDetail.tsx` | Public | LIVE | `canonical_protocols` | Protocol deep dive |
| Events | `/events` | `pages/public/Events.tsx` | Public | **DEMO** ⁑ | `events` table (W10-01) | Industry events calendar |
| Jobs | `/jobs` | `pages/public/Jobs.tsx` | Public | **DEMO** ⁑ | `job_postings` table (W10-02) | Beauty industry jobs |
| Job Detail | `/jobs/:slug` | `pages/public/JobDetail.tsx` | Public | **DEMO** ⁑ | `job_postings` by slug | Job application |

> ⁑ **Status Truthfulness Rule:** Events (W10-01), Jobs (W10-02), and Job Detail are marked DEMO until their respective WO IDs are ✅ COMPLETE in `SOCELLE-WEB/docs/build_tracker.md`. MASTER_STATUS.md reports them live, but `build_tracker.md` is the execution authority per §WO ID Source Rule above.
| For Buyers | `/for-buyers` | `pages/public/ForBuyers.tsx` | Public | LIVE | none | Landing — operator value prop |
| For Brands | `/for-brands` | `pages/public/ForBrands.tsx` | Public | **DEMO** | Hardcoded `STATS` array | Landing — brand value prop |
| For Medspas | `/for-medspas` | `pages/public/ForMedspas.tsx` | Public | LIVE | none | Landing — medspa value prop |
| For Salons | `/for-salons` | `pages/public/ForSalons.tsx` | Public | LIVE | none | Landing — salon value prop |
| Professionals | `/professionals` | `pages/public/Professionals.tsx` | Public | **DEMO** | Hardcoded `STATS` array | Landing — professional value prop |
| How It Works | `/how-it-works` | `pages/public/HowItWorks.tsx` | Public | LIVE | none | Platform explainer |
| Pricing | `/plans` | `pages/public/Plans.tsx` | Public | **DEMO** | Hardcoded `TIERS` | Subscription plans |
| About | `/about` | `pages/public/About.tsx` | Public | LIVE | none | Company story |
| FAQ | `/faq` | `pages/public/FAQ.tsx` | Public | LIVE | none | Common questions |
| Privacy | `/privacy` | `pages/public/Privacy.tsx` | Public | LIVE | none | Legal |
| Terms | `/terms` | `pages/public/Terms.tsx` | Public | LIVE | none | Legal |
| Request Access | `/request-access` | `pages/public/RequestAccess.tsx` | Public | LIVE | `access_requests` table | Conversion — request platform access |
| API Docs | `/api/docs` | `pages/public/ApiDocs.tsx` | Public | LIVE | none | Developer documentation |
| API Pricing | `/api/pricing` | `pages/public/ApiPricing.tsx` | Public | LIVE | none | API tier pricing |
| Forgot Password | `/forgot-password` | `pages/public/ForgotPassword.tsx` | Public | LIVE (⚠️ design) | `supabase.auth` | Password recovery |
| Reset Password | `/reset-password` | `pages/public/ResetPassword.tsx` | Public | LIVE (⚠️ design) | `supabase.auth` | Password reset |
| Insights redirect | `/insights` | → `/intelligence` | Public | LIVE | — | Redirect (W10-06) |

### Claim Flows

| Name | Route | File | Audience | Status | Data Dependency | Primary Intent |
|---|---|---|---|---|---|---|
| Claim Brand | `/claim/brand/:slug` | `pages/claim/ClaimBrand.tsx` | Public | LIVE | `claim_brand` RPC | Brand ownership claim |
| Claim Business | `/claim/business/:slug` | `pages/claim/ClaimBusiness.tsx` | Public | LIVE | `claim_business` RPC | Business ownership claim |

### Operator Portal (`/portal/*`)

| Name | Route | File | Audience | Status | Data Dependency | Primary Intent |
|---|---|---|---|---|---|---|
| Portal Home | `/portal` | `pages/business/PortalHome.tsx` | Operator | LIVE | — | Portal landing |
| Login | `/portal/login` | `pages/business/Login.tsx` | Operator | LIVE | `supabase.auth` | Authenticate |
| Signup | `/portal/signup` | `pages/business/Signup.tsx` | Operator | LIVE | `supabase.auth` | Register |
| Dashboard | `/portal/dashboard` | `pages/business/Dashboard.tsx` | Operator | LIVE | `brands`, `orders`, `market_signals` | Business overview |
| Intelligence Hub | `/portal/intelligence` | `pages/business/IntelligenceHub.tsx` | Operator | **DEMO** | Mixed — partial mock | Business intelligence |
| AI Advisor | `/portal/advisor` | `pages/business/AIAdvisor.tsx` | Operator | LIVE | `ai-concierge` edge fn | AI business advisor |
| Plans List | `/portal/plans` | `pages/business/PlansList.tsx` | Operator | LIVE | `plans` table | Saved business plans |
| New Plan | `/portal/plans/new` | `pages/business/PlanWizard.tsx` | Operator | LIVE | `plans`, `PaywallGate` | Create business plan |
| Plan Compare | `/portal/plans/compare` | `pages/business/PlanComparison.tsx` | Operator | LIVE | `plans` | Compare plans |
| Plan Results | `/portal/plans/:id` | `pages/business/PlanResults.tsx` | Operator | LIVE | `plans`, `UpgradeGate` | View plan output |
| Brand Detail | `/portal/brands/:slug` | `pages/business/BrandDetail.tsx` | Operator | LIVE | `brands`, `useCart` | Browse brand + add to cart |
| Orders | `/portal/orders` | `pages/business/Orders.tsx` | Operator | LIVE | `orders` | Order history |
| Order Detail | `/portal/orders/:id` | `pages/business/OrderDetail.tsx` | Operator | LIVE | `orders`, `order_items` | Order tracking |
| Account | `/portal/account` | `pages/business/Account.tsx` | Operator | LIVE | `user_profiles` | Profile settings |
| Messages | `/portal/messages` | `pages/business/Messages.tsx` | Operator | LIVE | `conversations`, `messages` | Brand↔operator messaging |
| Calendar | `/portal/calendar` | `pages/business/MarketingCalendar.tsx` | Operator | LIVE | calendar data | Marketing calendar |
| Apply | `/portal/apply` | `pages/business/Apply.tsx` | Operator | LIVE | `businesses` | Reseller application |
| Claim Review | `/portal/claim/review` | `pages/business/ClaimReview.tsx` | Operator | LIVE | `businesses` | Review claim status |
| CE Credits | `/portal/ce-credits` | `pages/business/CECredits.tsx` | Operator | LIVE | `brand_training_modules` | CE credit tracking |
| Locations | `/portal/locations` | `pages/business/LocationsDashboard.tsx` | Operator | LIVE | `businesses` | Multi-location mgmt |
| Benchmarks | `/portal/benchmarks` | `pages/business/BenchmarkDashboard.tsx` | Operator | **DEMO** | Hardcoded mock peer data | Peer benchmarks |
| Notifications | `/portal/notifications` | `pages/business/NotificationPreferences.tsx` | Operator | LIVE | `user_profiles` | Notification settings |

### Brand Portal (`/brand/*`)

| Name | Route | File | Audience | Status | Data Dependency | Primary Intent |
|---|---|---|---|---|---|---|
| Login | `/brand/login` | `pages/brand/Login.tsx` | Brand | LIVE | `supabase.auth` | Authenticate |
| Apply | `/brand/apply` | `pages/brand/Apply.tsx` | Brand | LIVE | `brands` | Brand application |
| Application Received | `/brand/apply/received` | `pages/brand/ApplicationReceived.tsx` | Brand | LIVE | none | Confirmation |
| Brand root | `/brand` | → `/brand/dashboard` | Brand | LIVE | — | Redirect |
| Dashboard | `/brand/dashboard` | `pages/brand/Dashboard.tsx` | Brand | LIVE | `brands`, `orders` | Brand overview |
| Claim Review | `/brand/claim/review` | `pages/brand/ClaimReview.tsx` | Brand | LIVE | `brands` | Claim status |
| Onboarding | `/brand/onboarding` | `pages/brand/Onboarding.tsx` | Brand | LIVE | `brands` | Brand setup wizard |
| Orders | `/brand/orders` | `pages/brand/Orders.tsx` | Brand | LIVE | `orders` | **[DO NOT MODIFY]** Order management |
| Order Detail | `/brand/orders/:id` | `pages/brand/OrderDetail.tsx` | Brand | LIVE | `orders`, `order_items` | **[DO NOT MODIFY]** Order detail |
| Products | `/brand/products` | `pages/brand/Products.tsx` | Brand | LIVE | `pro_products`, `retail_products` | Product catalog mgmt |
| Performance | `/brand/performance` | `pages/brand/Performance.tsx` | Brand | LIVE | `orders`, aggregates | Revenue analytics |
| Messages | `/brand/messages` | `pages/brand/Messages.tsx` | Brand | LIVE | `conversations`, `messages` | Messaging |
| Campaigns | `/brand/campaigns` | `pages/brand/Campaigns.tsx` | Brand | STUB | `campaigns` (planned) | Campaign management |
| Campaign Builder | `/brand/campaigns/new` | `pages/brand/CampaignBuilder.tsx` | Brand | STUB | `campaigns` (planned) | Build campaigns |
| Automations | `/brand/automations` | `pages/brand/Automations.tsx` | Brand | STUB | — | Marketing automations |
| Promotions | `/brand/promotions` | `pages/brand/Promotions.tsx` | Brand | STUB | — | Promotional offers |
| Customers | `/brand/customers` | `pages/brand/Customers.tsx` | Brand | LIVE | `businesses` | Retailer CRM |
| Pipeline | `/brand/pipeline` | `pages/brand/Pipeline.tsx` | Brand | LIVE | `businesses`, `business_interest_signals` | Prospect pipeline |
| Storefront | `/brand/storefront` | `pages/brand/Storefront.tsx` | Brand | LIVE | `brands`, `brand_page_modules` | Edit public storefront |
| Intelligence | `/brand/intelligence` | `pages/brand/BrandIntelligenceHub.tsx` | Brand | **DEMO** | Mixed — mock heavy | Brand intelligence |
| AI Advisor | `/brand/advisor` | `pages/brand/BrandAIAdvisor.tsx` | Brand | LIVE | `ai-concierge` edge fn | AI brand advisor |
| Notifications | `/brand/notifications` | `pages/brand/BrandNotificationPreferences.tsx` | Brand | LIVE | `user_profiles` | Settings |
| Intelligence Pricing | `/brand/intelligence-pricing` | `pages/brand/IntelligencePricing.tsx` | Brand | LIVE | — | Intelligence tier pricing |
| Intelligence Report | `/brand/intelligence-report` | `pages/brand/IntelligenceReport.tsx` | Brand | **DEMO** | Mock report data | Intelligence reports |
| Plans (legacy) | `/brand/plans` | `pages/brand/Plans.tsx` | Brand | LIVE | — | Legacy |
| Leads (legacy) | `/brand/leads` | `pages/brand/Leads.tsx` | Brand | LIVE | — | Legacy |

### Admin (`/admin/*`)

| Name | Route | File | Audience | Status | Data Dependency | Primary Intent |
|---|---|---|---|---|---|---|
| Login | `/admin/login` | `pages/admin/AdminLogin.tsx` | Admin | LIVE | `supabase.auth` | Authenticate |
| Debug Auth | `/admin/debug-auth` | `pages/admin/AuthDebug.tsx` | Admin | LIVE | `supabase.auth` | Dev tool |
| Admin root | `/admin` | → `/admin/brands` | Admin | LIVE | — | Redirect |
| Dashboard | `/admin/dashboard` | `pages/admin/AdminDashboard.tsx` | Admin | LIVE | aggregates | Platform overview |
| Inbox | `/admin/inbox` | `pages/admin/AdminInbox.tsx` | Admin | LIVE | `conversations` | All messages |
| Orders | `/admin/orders` | `pages/admin/AdminOrders.tsx` | Admin | LIVE | `orders` | **[DO NOT MODIFY]** |
| Order Detail | `/admin/orders/:id` | `pages/admin/AdminOrderDetail.tsx` | Admin | LIVE | `orders`, `order_items` | **[DO NOT MODIFY]** |
| Debug Panel | `/admin/debug` | `pages/admin/DebugPanel.tsx` | Admin | LIVE | — | Diagnostics |
| Submission Detail | `/admin/submissions/:id` | `pages/admin/SubmissionDetail.tsx` | Admin | LIVE | `submissions` | Review submissions |
| Bulk Protocol Import | `/admin/protocols/import` | `pages/admin/BulkProtocolImport.tsx` | Admin | LIVE | `canonical_protocols` | Import protocols |
| Ingestion | `/admin/ingestion` | `components/IngestionView.tsx` | Admin | LIVE | ingestion pipeline | Data ingestion |
| Protocols | `/admin/protocols` | `components/ProtocolsView.tsx` | Admin | LIVE | `canonical_protocols` | Protocol management |
| Mixing Rules | `/admin/mixing` | `components/MixingRulesView.tsx` | Admin | LIVE | mixing rules | Rule editor |
| Costs | `/admin/costs` | `components/CostsView.tsx` | Admin | LIVE | cost data | Cost analysis |
| Calendar | `/admin/calendar` | `components/MarketingCalendarView.tsx` | Admin | LIVE | calendar | Marketing calendar |
| Business Rules | `/admin/rules` | `components/BusinessRulesView.tsx` | Admin | LIVE | business rules | Rule configuration |
| Schema Health | `/admin/health` | `components/SchemaHealthView.tsx` | Admin | LIVE | schema meta | DB health check |
| Products | `/admin/products` | Inline (ProProducts + Retail) | Admin | LIVE | `pro_products`, `retail_products` | Product management |
| Approvals | `/admin/approvals` | `pages/admin/AdminApprovalQueue.tsx` | Admin | LIVE | `brands`, `businesses` | Approve brands/operators |
| Seeding | `/admin/seeding` | `pages/admin/AdminSeeding.tsx` | Admin | LIVE | seed functions | DB seeding |
| Signals | `/admin/signals` | `pages/admin/AdminSignals.tsx` | Admin | LIVE | `brand_interest_signals` | Interest signals |
| Market Signals | `/admin/market-signals` | `pages/admin/AdminMarketSignals.tsx` | Admin | LIVE | `market_signals` | Curate intelligence |
| Intelligence | `/admin/intelligence` | `pages/admin/IntelligenceDashboard.tsx` | Admin | LIVE | `market_signals` | Intelligence analytics |
| Reports | `/admin/reports` | `pages/admin/ReportsLibrary.tsx` | Admin | LIVE | reports | Report library |
| API | `/admin/api` | `pages/admin/ApiDashboard.tsx` | Admin | LIVE | API stats | API usage |
| Regions | `/admin/regions` | `pages/admin/RegionManagement.tsx` | Admin | LIVE | regions | Geo management |
| Brands | `/admin/brands` | `pages/admin/AdminBrandList.tsx` | Admin | LIVE | `brands` | Brand directory |
| New Brand | `/admin/brands/new` | `pages/admin/BrandAdminEditor.tsx` | Admin | LIVE | `brands` | Create brand |
| Brand Hub | `/admin/brands/:id` | Brand Hub (8 sub-routes) | Admin | LIVE | `brands` | Full brand CMS |
| → Profile | `.../profile` | `BrandAdminEditor.tsx` | Admin | LIVE | `brands` | Edit brand profile |
| → Products | `.../products` | `brand-hub/HubProducts.tsx` | Admin | LIVE | `pro_products`, `retail_products` | Product management |
| → Protocols | `.../protocols` | `brand-hub/HubProtocols.tsx` | Admin | STUB | `canonical_protocols` | Protocol assignment |
| → Education | `.../education` | `brand-hub/HubEducation.tsx` | Admin | STUB | `brand_training_modules` | Education content |
| → Orders | `.../orders` | `brand-hub/HubOrders.tsx` | Admin | LIVE | `orders` | Brand orders |
| → Retailers | `.../retailers` | `brand-hub/HubRetailers.tsx` | Admin | LIVE | `businesses` | Retailer management |
| → Analytics | `.../analytics` | `brand-hub/HubAnalytics.tsx` | Admin | LIVE | aggregates | Brand analytics |
| → Settings | `.../settings` | `brand-hub/HubSettings.tsx` | Admin | LIVE | `brands` | Brand settings |

### Legacy Redirects (9)

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

### Marketing Site (`apps/marketing-site/`)

| Name | Route | File | Status | Intent |
|---|---|---|---|---|
| Layout | `/` | `app/layout.tsx` | LIVE | Root layout |
| Intelligence | `/intelligence` | `app/intelligence/page.tsx` | LIVE | Intelligence landing |
| Sitemap | `/sitemap.xml` | `app/sitemap.ts` | LIVE | SEO sitemap |
| Robots | `/robots.txt` | `app/robots.ts` | LIVE | SEO robots |

---

## ECOMMERCE MODULE (WITHIN PORTALS — NOT TOP-LEVEL)

Per Canonical Doctrine: **Intelligence leads, marketplace follows.** Ecommerce is a module within portals, not a standalone surface.

### Commerce Components

| Component | File | Used By | Data | Status |
|---|---|---|---|---|
| CartDrawer | `components/CartDrawer.tsx` | BrandStorefront, BrandDetail | `useCart` (localStorage) | LIVE — **[DO NOT MODIFY]** |
| useCart hook | `lib/useCart.ts` | CartDrawer, BrandStorefront, BrandDetail | localStorage (per-brand) | LIVE — **[DO NOT MODIFY]** |
| ProductCard | `components/ProductCard.tsx` | BrandShop, product lists | product data | LIVE |
| BrandShop | `components/BrandShop.tsx` | BrandStorefront (tab) | `pro_products`, `retail_products` | LIVE |
| PaywallGate | `components/PaywallGate.tsx` | PlanWizard | `subscriptions`, `useSubscription` | LIVE (bypass active) — **[DO NOT MODIFY]** |
| UpgradeGate | `components/UpgradeGate.tsx` | PlanResults | `subscriptions`, `useSubscription` | LIVE (bypass active) — **[DO NOT MODIFY]** |
| useSubscription | `lib/useSubscription.ts` | PaywallGate, UpgradeGate | `subscriptions` table, `create-checkout` edge fn | LIVE (bypass active) — **[DO NOT MODIFY]** |
| paymentBypass | `lib/paymentBypass.ts` | Auth system | env flag `VITE_PAYMENT_BYPASS` | LIVE — all users treated as PRO |

### Commerce Routes (cross-reference from portal tables above)

| Surface | Route | Status | Protected |
|---|---|---|---|
| Brand wholesale shopping | `/brands/:slug` (Shop tab) | LIVE | No — **[DO NOT MODIFY]** |
| Operator brand shopping | `/portal/brands/:slug` | LIVE | Yes — **[DO NOT MODIFY]** |
| Operator orders | `/portal/orders` | LIVE | Yes — **[DO NOT MODIFY]** |
| Operator order detail | `/portal/orders/:id` | LIVE | Yes — **[DO NOT MODIFY]** |
| Brand orders | `/brand/orders` | LIVE | Yes — **[DO NOT MODIFY]** |
| Brand order detail | `/brand/orders/:id` | LIVE | Yes — **[DO NOT MODIFY]** |
| Admin orders | `/admin/orders` | LIVE | Yes — **[DO NOT MODIFY]** |
| Admin order detail | `/admin/orders/:id` | LIVE | Yes — **[DO NOT MODIFY]** |

### Commerce Edge Functions

| Function | Path | Status | Trigger |
|---|---|---|---|
| create-checkout | `supabase/functions/create-checkout/` | Deployed (Stripe postponed) | `useSubscription.startCheckout()` |
| stripe-webhook | `supabase/functions/stripe-webhook/` | Deployed (Stripe postponed) | Stripe webhook |

---

## MOBILE SCREENS (Flutter)

All paths relative to `SOCELLE-MOBILE-main/apps/mobile/lib/features/`

| Name | Screen | File | Audience | Status | Data Dependency | Primary Intent |
|---|---|---|---|---|---|---|
| Auth Gate | `AuthGatePage` | `auth/auth_gate_page.dart` | All | LIVE | Supabase Auth + Firebase | Authentication |
| Onboarding | `OnboardingPage` | `onboarding/onboarding_page.dart` | New user | LIVE | — | User setup (8 sub-steps) |
| Paywall | `PaywallPage` | `paywall/paywall_page.dart` | Free user | LIVE | RevenueCat | Subscription upsell |
| Dashboard | `DashboardPage` | `dashboard/dashboard_page.dart` | Operator | LIVE | Multiple | Daily intelligence hub (9 widgets) |
| Feed | `FeedPage` | `feed/feed_page.dart` | Operator | STUB | — | Activity feed |
| Discover | `DiscoverPage` | `discover/discover_page.dart` | Operator | STUB | — | Content discovery |
| Shop | `ShopPage` | `shop/shop_page.dart` | Operator | STUB | — | Wholesale shopping |
| Schedule | `SchedulePage` | `schedule/schedule_page.dart` | Operator | STUB | — | Appointment scheduling |
| Studio | `StudioPage` | `studio/studio_page.dart` | Operator | STUB | — | Creative workspace |
| Messages | `MessagesPage` | `messages/messages_page.dart` | Operator | STUB | — | In-app messaging |
| Profile | `ProfilePage` | `profile/profile_page.dart` | Operator | LIVE | user_profiles | User profile |
| Settings | `SettingsPage` | `settings/settings_page.dart` | Operator | LIVE | user_settings | App settings (8 items) |
| Cancel Intercept | `CancelInterceptPage` | `settings/cancel_intercept_page.dart` | Operator | LIVE | — | Retention flow |
| Revenue | `RevenuePage` | `revenue/revenue_page.dart` | Operator | STUB | — | Revenue analytics |
| Weekly Summary | `WeeklySummaryPage` | `weekly_summary/weekly_summary_page.dart` | Operator | STUB | — | Weekly intelligence digest |
| Support | `SupportPage` | `support/support_page.dart` | Operator | LIVE | — | Help & support |
| Socelle AI | `SocelleShowcasePage` | `socelle_showcase/socelle_showcase_page.dart` | Operator | LIVE | AI provider | AI assistant showcase |
| Affiliate | — | `affiliate/` | Operator | STUB | — | Affiliate system |
| Gap Actions | `FillSlotFlow` | `gap_action/fill_slot_flow.dart` | Operator | LIVE | gap_engine | Gap analysis actions (3 items) |
| Gaps | — | `gaps/` | Operator | STUB | — | Gap intelligence |
| Share | — | `share/` | Operator | STUB | — | Content sharing |
| Shell | — | `shell/` | All | LIVE | — | App navigation shell |

---

## APPENDIX: NO PAGE LEFT BEHIND

### A) Orphaned Routes/Screens

| Route/Screen | File | Issue |
|---|---|---|
| `/insights` | `pages/public/Insights.tsx` | **ORPHANED** — Route redirects to `/intelligence` (W10-06). File still exists with hardcoded `TREND_PLACEHOLDERS`. DELETE candidate. |
| `/brand/plans` | `pages/brand/Plans.tsx` | **LEGACY** — Not in brand nav. Kept for backward compat. |
| `/brand/leads` | `pages/brand/Leads.tsx` | **LEGACY** — Not in brand nav. Kept for backward compat. |

### B) Pages Not Linked From Nav (But Active in Router)

| Route | File | Why Not in Nav |
|---|---|---|
| `/how-it-works` | `HowItWorks.tsx` | In footer only (intentional) |
| `/protocols` | `Protocols.tsx` | In footer only — accessed via Education (intentional) |
| `/about` | `About.tsx` | In footer only (intentional) |
| `/for-medspas` | `ForMedspas.tsx` | Linked from For Buyers landing (intentional) |
| `/for-salons` | `ForSalons.tsx` | Linked from For Buyers landing (intentional) |
| `/professionals` | `Professionals.tsx` | Linked from For Buyers landing (intentional) |
| `/api/docs` | `ApiDocs.tsx` | Linked from API nav section (intentional) |
| `/api/pricing` | `ApiPricing.tsx` | Linked from API nav section (intentional) |
| `/claim/brand/:slug` | `ClaimBrand.tsx` | Accessed via admin tools / direct link (intentional) |
| `/claim/business/:slug` | `ClaimBusiness.tsx` | Accessed via admin tools / direct link (intentional) |
| `/admin/debug-auth` | `AuthDebug.tsx` | Dev tool — admin only (intentional) |
| `/admin/debug` | `DebugPanel.tsx` | Dev tool — admin only (intentional) |

### C) Pages With Hardcoded Mock Data (Doc Gate FAIL 4 / P1)

Cross-reference: `docs/command/HARD_CODED_SURFACES.md`

| Route | File | Identifier | Severity | Wave 10 WO | Rule Violated |
|---|---|---|---|---|---|
| `/` | `Home.tsx` | `INTELLIGENCE_SIGNALS` + "Live Market Feed" badge | **P0** | W10-05 | **FAIL 4** — fake live timestamps + pulsing badge |
| `/` | `Home.tsx` | Cocoa palette + `font-serif` | **P0** | W10-05 | **Doctrine §3** — wrong palette; **Doctrine §4** — serif on public page |
| `/forgot-password` | `ForgotPassword.tsx` | `pro-*` design tokens | P0 | W10-07 | **Doctrine §3** — wrong token set |
| `/reset-password` | `ResetPassword.tsx` | `pro-*` design tokens | P0 | W10-07 | **Doctrine §3** — wrong token set |
| `/for-brands` | `ForBrands.tsx` | `STATS` array ("500+", "$45M+") | P1 | W10-10 | **FAIL 4** — unverified claims |
| `/professionals` | `Professionals.tsx` | `STATS` array ("500+", "$45M+") | P1 | W10-10 | **FAIL 4** — unverified claims |
| `/plans` | `Plans.tsx` | `TIERS`, `COMPARISON` | P1 | W10-11 | Acceptable DEMO for beta — feature claims must match cadence |
| `/protocols/:slug` | `ProtocolDetail.tsx` | `adoptionCount` | P2 | W10-12 | May be seed data — needs verification |
| `/brands/:slug` | `BrandStorefront.tsx` | `interestCount` zero-state | P2 | W10-09 | No violation — missing empty-state handler |
| `/portal/intelligence` | `IntelligenceHub.tsx` | Heavy mock data | P1 | W11-04 | **FAIL 4** — portal-scoped, lower priority |
| `/portal/benchmarks` | `BenchmarkDashboard.tsx` | All mock peer data | P1 | W11-03 | **FAIL 4** — portal-scoped, lower priority |
| `/brand/intelligence` | `BrandIntelligenceHub.tsx` | Heavy mock data | P1 | W11-05 | **FAIL 4** — portal-scoped, lower priority |
| `/brand/intelligence-report` | `IntelligenceReport.tsx` | Mock report data | P1 | W11-05 | **FAIL 4** — portal-scoped, lower priority |
| (orphaned) | `Insights.tsx` | `TREND_PLACEHOLDERS` | P1 | DELETE | **FAIL 4** — orphaned page with mock data |

### D) Studio Routes (NOT YET CREATED)

No `/studio/*` routes exist in the current codebase. The following are planned per canonical doctrine:

| Studio | Planned Route | Status |
|---|---|---|
| Social Studio | `/studio/social/*` | NOT CREATED |
| CRM Studio | `/studio/crm/*` | NOT CREATED |
| Sales Studio | `/studio/sales/*` | NOT CREATED |
| Marketing Studio | `/studio/marketing/*` | NOT CREATED |
| Education Studio | `/studio/education/*` | NOT CREATED |

---

## ROUTE COUNT SUMMARY

| Surface | Count |
|---|---|
| Public routes | 30 (incl. 2 redirects, 1 orphaned) |
| Claim flows | 2 |
| Operator Portal | 22 |
| Brand Portal | 26 |
| Admin (incl. hub sub-routes) | 37 |
| Legacy redirects | 9 |
| Marketing site | 4 |
| Mobile features | 21 dirs |
| Studio routes | 0 (5 planned) |
| **TOTAL SURFACES** | **151+** |

> [!WARNING]
> **SEO Reality Note:** SPA `<Helmet>` tags set client-side `<head>` content but do NOT guarantee search engine indexation for deep routes. Googlebot can render JS but may deprioritize client-rendered meta. The marketing-site `sitemap.ts` is the current discovery mechanism for brand/job/event slugs. Until SSR brand routes exist in the marketing-site (Next.js), `/brands/:slug` indexation depends on sitemap + Googlebot JS rendering. Plan accordingly.

---

## APPENDIX E: EXTERNAL COMMERCE PROPERTIES (INFORMATIONAL ONLY)

> [!NOTE]
> This appendix is **informational only** — it documents what external commerce integrations exist or are referenced in the codebase. It is NOT authoritative for roadmap or execution priority. `SOCELLE-WEB/docs/build_tracker.md` remains the sole execution authority for integration scheduling.

External commerce channels, marketplaces, and portals that SOCELLE may integrate with. These are **NOT part of the monorepo codebase** but may be referenced in product copy, pricing pages, or integration specs.

| Property | Type | Integration Status | Codebase Reference |
|---|---|---|---|
| Shopify | Storefront / POS / inventory sync | **NOT INTEGRATED** — Zero code written. Referenced in `SOCELLE_COMPLETE_API_CATALOG.md` as planned. | `build_tracker.md`: "Shopify inventory sync" listed as Phase 2 Not Started |
| Stripe | Payment processing / subscriptions | **INFRASTRUCTURE READY** — `create-checkout` + `stripe-webhook` edge functions deployed. **NOT ACTIVE** — Stripe API keys not configured. Payment bypass active. | `lib/useSubscription.ts`, `supabase/functions/create-checkout/`, `supabase/functions/stripe-webhook/` |
| Stripe Connect | Brand payouts / marketplace splits | **NOT INTEGRATED** — Zero code written. | `build_tracker.md`: "Brand payouts (Stripe Connect)" Phase 3 Postponed |
| Faire | Wholesale marketplace | **NOT INTEGRATED** — Not referenced in codebase. | NOT FOUND |
| WooCommerce | WordPress commerce | **NOT INTEGRATED** — Referenced as Phase 3 backlog in `build_tracker.md`. | NOT FOUND in source code |
| BigCommerce | Enterprise commerce | **NOT INTEGRATED** — Referenced as Phase 3 backlog in `build_tracker.md`. | NOT FOUND in source code |
| RevenueCat | Mobile subscriptions (Flutter) | **INTEGRATED (MOBILE ONLY)** — Mobile paywall uses RevenueCat. | `SOCELLE-MOBILE-main/apps/mobile/lib/features/paywall/paywall_page.dart` |
| Resend | Transactional email | **INTEGRATED** — `send-email` edge function deployed. Requires `RESEND_API_KEY`. | `supabase/functions/send-email/` |
| Brevo | Marketing email / CRM | **NOT INTEGRATED** — Referenced as blocker in `MASTER_STATUS.md`. | NOT FOUND in source code |

**Search method used:** `grep -rn "shopify\|faire\|woocommerce\|bigcommerce\|revenuecat\|brevo\|stripe" src/ lib/ supabase/` across `SOCELLE-WEB/` and `SOCELLE-MOBILE-main/`.

---

---

**DOCUMENT STATUS: LOCKED — Doc Gate Reference**  
This document is the canonical "no page left behind" reference per `/.claude/CLAUDE.md` §2 + `docs/command/SOCELLE_RELEASE_GATES.md` §9 FAIL 5. All route/screen audits must validate against this file. Modifications require change control per `/.claude/CLAUDE.md` §5.
