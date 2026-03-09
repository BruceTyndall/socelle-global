# SOCELLE APP SEGMENTATION PLAN — DRAFT FOR REVIEW

**Date:** March 8, 2026
**Status:** DRAFT — Awaiting owner approval before detailed WO breakdowns
**Purpose:** Split the SOCELLE monorepo into logical sub-projects with dedicated agent teams, separate priorities, and independent work orders.

---

## THE PROBLEM

Right now, 265 pages, 110+ components, 95+ hooks, 31 edge functions, and 137 DB tables all live in one flat `src/` directory inside SOCELLE-WEB. Every agent working on any part of the app has to navigate the full codebase. This creates:

- Context overload (agents read irrelevant files and drift)
- Merge conflicts across unrelated features
- No clear ownership boundaries
- False completion reports because scope is blurry
- Impossible to parallelize — teams step on each other

---

## CODEBASE INVENTORY (CURRENT STATE)

### Pages by Portal
| Portal | Pages | Primary Data Dependencies | Layout |
|--------|-------|---------------------------|--------|
| Admin | 74 | supabase(47), shop(14), intelligence(4), campaigns(2) | AdminLayout |
| Business | 74 | auth(40), supabase(19), intelligence(9), CRM(8), campaigns(7) | BusinessLayout |
| Public | 61 | shop(52), CMS(23), intelligence(9), education(8), seo(6), protocols(5) | None (public) |
| Brand | 25 | auth(16), supabase(15), campaigns(8), intelligence(5), brandTiers(5) | BrandLayout |
| Education | 12 | education(12), auth(5), supabase(3) | BusinessLayout |
| Sales | 9 | deals(8), pipelines(5), proposals(3), csvExport(5) | BusinessLayout |
| Marketing | 8 | campaigns(10), audiences(3), landing pages(2), content templates(2) | MarketingLayout |
| Claim | 2 | supabase(2), auth(2) | None |
| Dev | 1 | — | None |
| **TOTAL** | **266** | | |

### Shared Core (Used by 3+ Portals)
- `lib/supabase` — imported by 106 pages across all portals
- `lib/auth` — imported by 79 pages across 6 portals
- `lib/intelligence/` — 15 files, used by admin, business, brand, public
- `lib/csvExport` — used by admin, education, sales
- `components/ui/` — 15 components used by admin(11), brand(12), business(3), public(1)
- `modules/_core/` — ModuleRoute, ModuleAccessContext, hooks (platform-wide)
- `database.types.ts` — shared type definitions
- `components/ErrorBoundary`, `ProtectedRoute`, `PrelaunchGuard` — platform-wide

### Edge Functions by Domain
| Domain | Functions |
|--------|----------|
| Intelligence | ai-concierge, ai-orchestrator, intelligence-briefing, generate-embeddings, ingredient-search, jobs-search, rss-to-signals, refresh-live-data |
| Commerce | create-checkout, shop-checkout, shop-webhook, stripe-webhook, subscription-webhook, manage-subscription, update-inventory, validate-discount |
| Content/CMS | feed-orchestrator, ingest-rss, open-beauty-facts-sync, sitemap-generator |
| Education | generate-certificate, verify-certificate, process-scorm-upload, scorm-runtime |
| Data Ingestion | ingest-npi, square-appointments-sync, square-oauth-callback, test-api-connection |
| Auth/Comms | magic-link, send-email |

---

## PROPOSED SEGMENTATION: 7 MINI-APPS + 1 SHARED CORE

### Cut Logic
The cut lines follow three principles:
1. **Data isolation** — each mini-app owns its DB tables and hooks
2. **Team independence** — each team can build/test/deploy without blocking others
3. **User journey alignment** — each mini-app maps to a distinct user type or workflow

---

### MINI-APP 1: PUBLIC SITE & MARKETING
**What it is:** Everything an unauthenticated or pre-signup visitor sees.

| Attribute | Detail |
|-----------|--------|
| Pages | 61 public + 8 marketing + 2 claim = **71 pages** |
| Components | `components/public/`, `components/sections/`, `components/seo/`, `components/modules/` |
| Hooks/Lib | `lib/cms/`, `lib/seo`, `lib/editorial/`, `lib/useCmsPage`, `lib/protocols/`, `lib/education/` (read-only), `lib/useIngredient*`, `lib/useRssItems` |
| Edge Functions | sitemap-generator, feed-orchestrator, ingest-rss |
| DB Tables | cms_*, protocols, ingredients, ingredient_collections, protocol_categories, stories, rss_items, landing_pages |
| Layout | None (public pages), MarketingLayout |
| Team Size | 2 agents |
| Priority Focus | CMS rendering (PageRenderer), SEO, persona pages, intelligence-first landing pages |
| Key WOs | WO-CMS-04 (PageRenderer), WO-CMS-05 (Authoring — public rendering side), V2-PLAT-03 (SEO) |

**Why it's separate:** Public site is the acquisition surface. It reads from CMS and intelligence data but never writes to business tables. Completely different user journey from authenticated portals.

---

### MINI-APP 2: INTELLIGENCE CLOUD
**What it is:** The signal processing engine, AI services, data ingestion pipelines, and intelligence display components.

| Attribute | Detail |
|-----------|--------|
| Pages | 0 standalone pages (intelligence surfaces INTO other apps) |
| Components | `components/intelligence/` (39 components — the biggest component group) |
| Hooks/Lib | `lib/intelligence/` (15 files), `lib/ai/`, `lib/enrichment/`, `lib/analysis/` |
| Edge Functions | ai-concierge, ai-orchestrator, intelligence-briefing, generate-embeddings, ingredient-search, jobs-search, rss-to-signals, refresh-live-data, open-beauty-facts-sync, ingest-npi |
| DB Tables | signals, ai_briefs, intelligence_*, embeddings, npi_data, ingredients, market_data |
| Layout | N/A (consumed as components/hooks by other apps) |
| Team Size | 3 agents (most complex subsystem) |
| Priority Focus | V2-INTEL-01 through V2-INTEL-06, signal freshness, AI guardrails, confidence scoring |
| Key WOs | V2-INTEL-01 (Signal Pipeline), V2-INTEL-02 (AI Service Menu), V2-INTEL-03 (Briefing Engine), V2-INTEL-04 (Trend Analysis), V2-INTEL-05 (Ingredient Intelligence), V2-INTEL-06 (Competitive Intelligence) |

**Why it's separate:** Intelligence is the platform's core differentiator. It's a service layer consumed by every other mini-app but owned by nobody else. Needs its own dedicated team that can iterate on AI quality without touching UI code.

---

### MINI-APP 3: BUSINESS PORTAL
**What it is:** The primary authenticated workspace for salon owners, medspa operators, and professionals.

| Attribute | Detail |
|-----------|--------|
| Pages | 74 pages (biggest authenticated portal) |
| Components | `components/BusinessNav`, CRM views, booking views, pipeline views |
| Hooks/Lib | `lib/auth`, `lib/useCrmContacts`, `lib/useCrmCompanies`, `lib/useCrmTasks`, `lib/useCrmSegments`, `lib/useBooking`, `lib/useClientRecords`, `lib/useProspects`, `lib/useDeals`, `lib/usePipelines`, `lib/useProposals`, `lib/useContentTemplates`, `lib/studio/`, `lib/affiliates/`, `lib/credits/` |
| Edge Functions | square-appointments-sync, square-oauth-callback |
| DB Tables | crm_*, bookings, client_records, prospects, deals, pipelines, proposals, content_templates, studio_docs, credits_*, affiliate_* |
| Layout | BusinessLayout |
| Team Size | 3 agents |
| Priority Focus | CRM completeness, booking, studio/authoring, credit economy |
| Key WOs | WO-CMS-05 (Authoring — studio side), V2-HUBS-01 through V2-HUBS-07, V2-HUBS-12 (Credits), V2-HUBS-13 (Affiliates) |

**Why it's separate:** This is the revenue-generating portal — where paying subscribers spend their time. It has the most pages, the most data dependencies, and the most complex user journeys. Needs its own team that's laser-focused on business user experience.

---

### MINI-APP 4: BRAND PORTAL
**What it is:** The authenticated workspace for beauty brands managing their presence, campaigns, and distribution.

| Attribute | Detail |
|-----------|--------|
| Pages | 25 pages |
| Components | `components/BrandCard`, `components/BrandPageRenderer`, `components/BrandShop` |
| Hooks/Lib | `lib/auth`, `lib/campaigns/`, `lib/brandTiers/`, `lib/enrichment/`, `lib/notifications/`, `lib/ai/` |
| Edge Functions | None dedicated (uses shared intelligence + commerce) |
| DB Tables | brands, brand_tiers, brand_campaigns, brand_products, brand_distributors |
| Layout | BrandLayout |
| Team Size | 1-2 agents |
| Priority Focus | Brand dashboard, tier management, campaign tools, distribution management |
| Key WOs | V2-HUBS-08 (Brand Hub), V2-HUBS-09 (Brand Campaigns), V2-HUBS-10 (Brand Distribution) |

**Why it's separate:** Brands are a distinct customer type with their own data model, campaigns system, and distribution logic. Clean data boundary from Business Portal.

---

### MINI-APP 5: ADMIN HUB
**What it is:** The internal operations dashboard for platform management.

| Attribute | Detail |
|-----------|--------|
| Pages | 74 pages |
| Components | Admin-specific views (shop management, subscription management, intelligence admin) |
| Hooks/Lib | `lib/supabase` (heavy direct queries — 47 imports), `lib/shop/` (14), `lib/intelligence/adminIntelligence` |
| Edge Functions | None dedicated (admin operates on all tables) |
| DB Tables | ALL tables (admin has cross-cutting read/write) |
| Layout | AdminLayout |
| Team Size | 2 agents |
| Priority Focus | CMS admin UI, shop management, subscription management, observability dashboards, content moderation |
| Key WOs | WO-CMS-03 (Admin CMS UI), WO-CMS-06 (Hub Integrations), V2-HUBS-14 (Admin Hub completion) |

**Why it's separate:** Admin is internal tooling. It touches every table but has zero public-facing surface. Different quality bar (functional > beautiful), different user (internal team, not customers). Can move fast without affecting customer experience.

---

### MINI-APP 6: EDUCATION HUB
**What it is:** Course creation, certification, SCORM hosting, and professional education platform.

| Attribute | Detail |
|-----------|--------|
| Pages | 12 pages |
| Components | `components/education/` (3 components) |
| Hooks/Lib | `lib/education/` (11 files — almost self-contained), `lib/useCourses`, `lib/useCertificates`, `lib/useEnrollments`, `lib/useQuizzes`, `lib/useScorm` |
| Edge Functions | generate-certificate, verify-certificate, process-scorm-upload, scorm-runtime |
| DB Tables | courses, certificates, enrollments, quizzes, quiz_attempts, scorm_packages, education_modules |
| Layout | BusinessLayout (shared) |
| Team Size | 1 agent |
| Priority Focus | Course builder, SCORM player, certificate system, quiz engine |
| Key WOs | V2-HUBS-11 (Education Hub) |

**Why it's separate:** Education is the most self-contained domain in the codebase. 11 dedicated lib files, 4 dedicated edge functions, its own DB tables. Almost zero overlap with other portals. Perfect candidate for independent team.

---

### MINI-APP 7: COMMERCE ENGINE
**What it is:** Shop, cart, checkout, orders, subscriptions, Stripe integration, and inventory management.

| Attribute | Detail |
|-----------|--------|
| Pages | Distributed — shop pages in public(15), admin shop(7), business subscription(1) = **~23 pages** |
| Components | `components/commerce/` (2), `components/CartDrawer`, `components/ProductCard` |
| Hooks/Lib | `lib/shop/` (10 files), `lib/useShopProducts`, `lib/useShopCart`, `lib/useShopOrders`, `lib/useShopReviews`, `lib/useWishlist`, `lib/useCart`, `lib/useSubscription`, `lib/useCommissions` |
| Edge Functions | create-checkout, shop-checkout, shop-webhook, stripe-webhook, subscription-webhook, manage-subscription, update-inventory, validate-discount |
| DB Tables | products, product_categories, orders, order_items, carts, cart_items, wishlists, subscriptions, subscription_plans, discounts, shipping_*, reviews, commissions |
| Layout | Uses parent app layouts (public, admin) |
| Team Size | 2 agents |
| Priority Focus | Stripe webhooks, subscription lifecycle, checkout flow, inventory, FTC compliance |
| Key WOs | V2-HUBS-12 (Credits — commerce overlap), V2-PLAT-05 (Paywall) |

**Why it's separate:** Commerce has its own Stripe integration, webhook handlers, and order lifecycle. It's a regulated surface (payments, FTC) that needs dedicated attention. The commerce boundary rule (§12 in CLAUDE.md) means commerce code should never bleed into intelligence surfaces.

---

### SHARED CORE (Not a mini-app — a shared package)
**What it is:** The foundation that every mini-app imports.

| Component | Files |
|-----------|-------|
| `lib/supabase` | Supabase client singleton |
| `lib/auth` | Auth context, hooks, session management |
| `lib/database.types.ts` | Generated types from migrations |
| `modules/_core/` | ModuleRoute, ModuleAccessContext, entitlement hooks |
| `components/ErrorBoundary` | Global error boundary |
| `components/ProtectedRoute` | Auth gate |
| `components/PrelaunchGuard` | Prelaunch gate |
| `components/Toast` | Notification system |
| `components/ui/` | 15 shared UI primitives |
| `lib/csvExport` | Export utility |
| `lib/logger` | Logging utility |
| `lib/errors` | Error types |
| Tailwind config | Pearl Mineral V2 tokens |
| Vite config | Build configuration |

**Rule:** Shared Core is FROZEN during mini-app development. Changes to Shared Core require owner approval and affect all teams.

---

## TEAM ALLOCATION SUMMARY

| Team | Mini-App | Agents | Active WOs |
|------|----------|--------|------------|
| Team 1 | Public Site & Marketing | 2 | WO-CMS-04, WO-CMS-05 (render), V2-PLAT-03 |
| Team 2 | Intelligence Cloud | 3 | V2-INTEL-01 through V2-INTEL-06 |
| Team 3 | Business Portal | 3 | V2-HUBS-01 through V2-HUBS-07, V2-HUBS-12, V2-HUBS-13 |
| Team 4 | Brand Portal | 1-2 | V2-HUBS-08 through V2-HUBS-10 |
| Team 5 | Admin Hub | 2 | WO-CMS-03, WO-CMS-06, V2-HUBS-14 |
| Team 6 | Education Hub | 1 | V2-HUBS-11 |
| Team 7 | Commerce Engine | 2 | V2-PLAT-05, commerce WOs |
| Core | Shared Core | 1 (maintenance) | Ultra Drive debt lanes |
| **TOTAL** | | **15-16 agents** | |

---

## EXECUTION PHASING

### Phase 1 — FOUNDATION (Before segmentation)
The Ultra Drive corrective sprint MUST complete first. You can't segment a codebase with 2,027 legacy tokens, no tests, and Sentry still wired in. These are cross-cutting issues that become 7x harder to fix after segmentation.

**Complete before splitting:**
- Ultra Drive Lane A (token purge) — affects all 7 mini-apps
- Ultra Drive Lane B (TanStack migration) — affects all 7 mini-apps
- Ultra Drive Lane C (Sentry removal) — affects shared core + admin + vite config
- Ultra Drive Lane D (test foundation) — needs to establish patterns before teams fork
- WO-CMS-01 (Schema + RLS) — CMS tables are shared infrastructure
- WO-CMS-02 (Hooks) — CMS hooks are consumed by public site + admin + business

### Phase 2 — SEGMENTATION
After Phase 1, extract each mini-app into its own directory structure:

```
SOCELLE-WEB/src/
  apps/
    public/          ← pages, components, hooks specific to public site
    business/        ← pages, components, hooks specific to business portal
    brand/           ← pages, components, hooks specific to brand portal
    admin/           ← pages, components, hooks specific to admin hub
    education/       ← pages, components, hooks specific to education hub
    commerce/        ← pages, components, hooks specific to commerce
  core/              ← shared auth, supabase, types, UI primitives, modules
  intelligence/      ← intelligence components, hooks, lib (consumed by apps/)
```

Each `apps/X/` directory gets its own:
- `TEAM_WO.md` — team-specific work orders
- `TEAM_TRACKER.md` — team-specific build tracker
- Verification skill mappings

### Phase 3 — PARALLEL EXECUTION
All 7 teams run simultaneously with:
- Independent WO queues per team
- Shared Core changes require cross-team PR review
- Intelligence Cloud publishes versioned exports consumed by other apps
- Weekly integration checkpoint (all apps must build together)

---

## OPEN QUESTIONS FOR BRUCE

1. **Sales + Marketing merge?** — Sales (9 pages) and Marketing (8 pages) are small. Should they merge into Business Portal, or stay independent? Sales has its own deals/pipeline data model which argues for independence, but 9 pages might not justify a separate team.

2. **Commerce pages live where?** — Commerce pages are currently split across public (shop storefront), admin (shop management), and business (subscription management). Should commerce own ALL commerce pages regardless of portal, or should each portal keep its commerce pages and just share the commerce hooks/edge functions?

3. **Agent count reality check** — 15-16 agents is the ideal. What's the actual budget? If we need to go leaner, the first cuts would be: merge Sales into Business (save 1), merge Education into Business (save 1), combine Brand + Marketing (save 1) = 12 agents minimum.

4. **Monorepo vs. multi-repo?** — This plan keeps everything in one repo with directory-level separation (monorepo with app boundaries). True multi-repo would mean separate git repos, separate CI/CD, separate deploys. Monorepo is simpler for now and still allows parallel teams. Want to go further?

5. **Intelligence Cloud API contract** — Should Intelligence Cloud expose a formal internal API (typed exports, versioned), or continue with direct component/hook imports? Formal API is cleaner but more upfront work.

---

*This is a plan draft. No code has been moved, no WOs have been created, no directories have been restructured. Awaiting Bruce's review and direction before proceeding.*
