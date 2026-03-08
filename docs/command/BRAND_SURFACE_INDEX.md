> Updated to align with V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md on 2026-03-08.

# BRAND SURFACE INDEX — SOCELLE PLATFORM
**Generated:** March 5, 2026
**Updated:** March 8, 2026 — V1 Master Alignment
**Authority:** `docs/command/V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` (V1 wins if conflicts exist)
**Cross-reference:** `GLOBAL_SITE_MAP.md`, `HARD_CODED_SURFACES.md`

---

## A) PUBLIC BRAND SURFACES (2 routes)

| Name | Route | File | Data Dependencies | Status | SEO-Ready |
|---|---|---|---|---|---|
| Brands Directory | `/brands` | `SOCELLE-WEB/src/pages/public/Brands.tsx` | `supabase.from('brands').select('*').eq('status', 'active')` | LIVE | **Yes** — Helmet meta, structured directory, in MainNav ("Brands"), in `sitemap-static.xml`, in marketing-site `sitemap.ts` |
| Brand Profile | `/brands/:slug` | `SOCELLE-WEB/src/pages/public/BrandStorefront.tsx` (1232 lines) | `brands` (by slug), `brand_seed_content`, `pro_products`, `retail_products`, `canonical_protocols`, `brand_interest_signals`, `useCart` (localStorage) | LIVE | **No** — `sitemap-brands.xml` referenced in sitemap index but `fetchBrandSlugs()` returns `[]` (Supabase query commented out). No dynamic `<meta>` per-brand. See §E. |

### Brand Profile Tabs (within BrandStorefront)

| Tab | Component | Data | Status |
|---|---|---|---|
| Overview | Inline sections | `brand_seed_content`, brand fields | LIVE |
| Products (PRO) | `BrandShop.tsx` | `pro_products` | LIVE |
| Products (Retail) | `BrandShop.tsx` | `retail_products` | LIVE |
| Protocols | Inline | `canonical_protocols` joined to brand | LIVE |
| Interest | Inline | `brand_interest_signals` count | LIVE (⚠️ zero-state — W10-09) |

---

## B) OPERATOR BRAND SURFACES — `/portal` (1 route)

| Name | Route | File | Commerce Dependencies | Status | Protected |
|---|---|---|---|---|---|
| Brand Detail | `/portal/brands/:slug` | `SOCELLE-WEB/src/pages/business/BrandDetail.tsx` (770+ lines) | `brands` (by slug), `useCart` hook (localStorage), `CartDrawer` component, `pro_products`, `retail_products` | LIVE | **Yes** — requires `business_user` role. **[DO NOT MODIFY]** commerce flow |

### Commerce Flow (within BrandDetail)

| Component | File | Data | Protected |
|---|---|---|---|
| Product list | Inline | `pro_products`, `retail_products` | **[DO NOT MODIFY]** |
| Add to Cart | Inline CTA | `useCart.addItem()` → localStorage | **[DO NOT MODIFY]** |
| Cart Drawer | `components/CartDrawer.tsx` | `useCart` state | **[DO NOT MODIFY]** |

---

## C) BRAND PORTAL SURFACES — `/brand/*` (22 routes)

| Name | Route | File | Data Dependencies | Status |
|---|---|---|---|---|
| Login | `/brand/login` | `pages/brand/Login.tsx` | `supabase.auth` | LIVE |
| Apply | `/brand/apply` | `pages/brand/Apply.tsx` | `brands` table (INSERT) | LIVE |
| Application Received | `/brand/apply/received` | `pages/brand/ApplicationReceived.tsx` | none | LIVE |
| Dashboard | `/brand/dashboard` | `pages/brand/Dashboard.tsx` | `brands`, `orders`, aggregates | LIVE |
| Claim Review | `/brand/claim/review` | `pages/brand/ClaimReview.tsx` | `brands`, `claim_brand` RPC | LIVE |
| Onboarding | `/brand/onboarding` | `pages/brand/Onboarding.tsx` | `brands` (UPDATE) | LIVE |
| Products | `/brand/products` | `pages/brand/Products.tsx` | `pro_products`, `retail_products` | LIVE |
| Orders | `/brand/orders` | `pages/brand/Orders.tsx` | `orders`, `order_items` | LIVE — **[DO NOT MODIFY]** |
| Order Detail | `/brand/orders/:id` | `pages/brand/OrderDetail.tsx` | `orders`, `order_items`, tracking | LIVE — **[DO NOT MODIFY]** |
| Performance | `/brand/performance` | `pages/brand/Performance.tsx` | `orders` aggregates, revenue queries | LIVE |
| Messages | `/brand/messages` | `pages/brand/Messages.tsx` | `conversations`, `messages` | LIVE |
| Campaigns | `/brand/campaigns` | `pages/brand/Campaigns.tsx` | `campaigns` (planned) | STUB |
| Campaign Builder | `/brand/campaigns/new` | `pages/brand/CampaignBuilder.tsx` | `campaigns` (planned) | STUB |
| Automations | `/brand/automations` | `pages/brand/Automations.tsx` | — | STUB |
| Promotions | `/brand/promotions` | `pages/brand/Promotions.tsx` | — | STUB |
| Customers | `/brand/customers` | `pages/brand/Customers.tsx` | `businesses` (retailers) | LIVE |
| Pipeline | `/brand/pipeline` | `pages/brand/Pipeline.tsx` | `businesses`, `business_interest_signals` | LIVE |
| Storefront | `/brand/storefront` | `pages/brand/Storefront.tsx` | `brands`, `brand_page_modules` | LIVE |
| Intelligence | `/brand/intelligence` | `pages/brand/BrandIntelligenceHub.tsx` | Mixed — **heavy mock** | **DEMO** |
| AI Advisor | `/brand/advisor` | `pages/brand/BrandAIAdvisor.tsx` | `ai-concierge` edge fn | LIVE |
| Notifications | `/brand/notifications` | `pages/brand/BrandNotificationPreferences.tsx` | `user_profiles` | LIVE |
| Intelligence Pricing | `/brand/intelligence-pricing` | `pages/brand/IntelligencePricing.tsx` | — | LIVE |
| Intelligence Report | `/brand/intelligence-report` | `pages/brand/IntelligenceReport.tsx` | Mock report data | **DEMO** |
| Plans (legacy) | `/brand/plans` | `pages/brand/Plans.tsx` | — | LEGACY |
| Leads (legacy) | `/brand/leads` | `pages/brand/Leads.tsx` | — | LEGACY |

**Count: 25 routes (22 active + 2 legacy + 1 redirect)**

---

## D) ADMIN BRAND SURFACES — `/admin` (12 routes)

| Name | Route | File | Data Dependencies | Status | Protected |
|---|---|---|---|---|---|
| Brand List | `/admin/brands` | `pages/admin/AdminBrandList.tsx` | `brands` table | LIVE | Admin role guard |
| New Brand | `/admin/brands/new` | `pages/admin/BrandAdminEditor.tsx` | `brands` (INSERT) | LIVE | Admin role guard |
| Brand Hub | `/admin/brands/:id` | `pages/admin/brand-hub/` (8 sub-routes) | `brands` by ID | LIVE | Admin role guard |
| → Profile | `.../profile` | `BrandAdminEditor.tsx` | `brands` (full CRUD) | LIVE | Admin |
| → Products | `.../products` | `brand-hub/HubProducts.tsx` | `pro_products`, `retail_products` | LIVE | Admin |
| → Protocols | `.../protocols` | `brand-hub/HubProtocols.tsx` | `canonical_protocols` | STUB | Admin |
| → Education | `.../education` | `brand-hub/HubEducation.tsx` | `brand_training_modules` | STUB | Admin |
| → Orders | `.../orders` | `brand-hub/HubOrders.tsx` | `orders` filtered by brand | LIVE | Admin — **[DO NOT MODIFY]** |
| → Retailers | `.../retailers` | `brand-hub/HubRetailers.tsx` | `businesses` filtered by brand | LIVE | Admin |
| → Analytics | `.../analytics` | `brand-hub/HubAnalytics.tsx` | Order/revenue aggregates | LIVE | Admin |
| → Settings | `.../settings` | `brand-hub/HubSettings.tsx` | `brands` config fields | LIVE | Admin |
| Approvals | `/admin/approvals` | `pages/admin/AdminApprovalQueue.tsx` | `brands` (status=pending), `businesses` | LIVE | Admin |

**Count: 12 routes (4 base + 8 hub sub-routes)**

---

## E) BRAND PAGE GENERATION READINESS

### Brand Slug Count

| Source | Count | Notes |
|---|---|---|
| Migration seed | **1** (Naturopathica, slug: `naturopathica`) | `20260124004115_create_brands_and_businesses_tables.sql` line 210 |
| Admin seeding tool | Unknown runtime count | Additional brands may have been created via `/admin/brands/new` or `/admin/seeding`. Actual count requires live DB query: `SELECT count(*) FROM brands WHERE status = 'active'` |
| Brand applications | Unknown runtime count | Brands can also apply via `/brand/apply` — created with `status='pending'` until admin approval |

### 404 Behavior on `/brands/:slug`

| Check | Status | Code Reference |
|---|---|---|
| Invalid slug handling | ✅ Correct | `BrandStorefront.tsx` line 788: `if (!brandData) { setError('Brand not found.'); setLoading(false); return; }` |
| Error rendering | ✅ Shows error state | Line 976: renders error message with branded styling |
| SEO 404 signal | ❌ Missing | SPA returns HTTP 200 even for non-existent brands. Search engines will index the error state as a valid page. Needs: server-side 404 or `<meta name="robots" content="noindex">` on error state. |

### Sitemap Coverage

| Sitemap Source | Includes Brand Slugs? | Status |
|---|---|---|
| `SOCELLE-WEB/public/sitemap.xml` | References `sitemap-brands.xml` | ⚠️ `sitemap-brands.xml` file does NOT exist. Reference is a TODO placeholder. |
| `apps/marketing-site/src/app/sitemap.ts` | Has `fetchBrandSlugs()` + brand route generation | ❌ **NOT WIRED** — Supabase query is commented out (line 27-28), function returns `[]`. Zero brand URLs in sitemap. |
| Dynamic sitemap generation | Not implemented | ❌ Needs: uncomment Supabase query in `fetchBrandSlugs()`, wire Supabase client to marketing-site, or create Edge Function sitemap generator (referenced as W11-10 in `build_tracker.md`) |

### Readiness Summary

| Requirement | Status | Action Needed |
|---|---|---|
| Brand slugs in DB | ✅ 1+ exists | Verify live count via Admin |
| `/brands/:slug` renders | ✅ Works | — |
| 404 on invalid slug | ⚠️ Partial | Shows "Brand not found" but returns HTTP 200 to crawlers |
| Per-brand `<title>` / `<meta>` | ❌ Missing | Add Helmet with `brand.name` for `<title>`, `brand.description` for meta description |
| Brand sitemap | ❌ Not generated | Uncomment `fetchBrandSlugs()` or build Edge Function |
| Canonical URL per brand | ❌ Missing | Add `<link rel="canonical" href="https://socelle.com/brands/{slug}">` |
| Open Graph per brand | ❌ Missing | Add `og:title`, `og:description`, `og:image` from brand data |
| Structured data (JSON-LD) | ❌ Missing | Add Organization or LocalBusiness schema markup per brand |

---

## COUNTS SUMMARY

| Section | Route Count |
|---|---|
| A) Public brand surfaces | 2 |
| B) Operator brand surfaces | 1 |
| C) Brand portal surfaces | 25 |
| D) Admin brand surfaces | 12 |
| **Total brand-related routes** | **40** |

---

---

## F) V1 ANTI-SHELL COMPLIANCE — BRANDS HUB

Per V1 §D, the Brands hub must satisfy all anti-shell requirements:

| Requirement | Status | Notes |
|---|---|---|
| Create action | LIVE | `/brand/apply`, `/admin/brands/new` |
| Library view | LIVE | `/brands` (public), `/admin/brands` |
| Detail view | LIVE | `/brands/:slug`, `/admin/brands/:id` |
| Edit + Delete | LIVE | `/brand/storefront`, `/admin/brands/:id/profile` |
| Permissions | LIVE | RLS + brand_admin role guard |
| Intelligence input | DEMO | Brand interest signals exist but intelligence hub is mock-heavy |
| Proof/metrics | LIVE | `/brand/performance`, `/admin/brands/:id/analytics` |
| Export | NOT YET | CSV export not implemented — needs Phase 5 work |
| Error/empty/loading | Partial | Some surfaces have loading skeletons, not all |
| Observability | NOT YET | Sentry not yet wired (Phase 3) |

## G) V1 CONTEXT — COMMERCE BOUNDARY (V1 §M)

Commerce is a **module**, never the IA backbone. Brand surfaces lead with intelligence, not commerce CTAs:

- No "Shop" as primary nav item.
- No "Shop Now" / "Buy Now" as the main CTA on Intelligence pages.
- All commerce routes gated (auth + tier).
- Affiliate engine must display FTC-compliant "Commission-linked" badges.

## H) MULTI-PLATFORM BRAND SURFACES (V1 §H)

| Platform | Brand Surface | Status |
|---|---|---|
| Web (React+Vite) | Full brand portal + public brand pages | Active |
| Mobile (Flutter) | Shop feature (stub) | Phase 6 |
| Desktop (Tauri) | Same as web (wraps React+Vite build) | Phase 6 |

---

*Per `/.claude/CLAUDE.md` §2 + `docs/command/SOCELLE_RELEASE_GATES.md` §9: All brand surfaces cited with file paths. Commerce surfaces flagged [DO NOT MODIFY].*
