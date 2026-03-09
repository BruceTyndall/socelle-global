# SYSTEM STATUS
**SOCELLE Platform — Live Build Tracker**
*Last updated: 2026-02-28 (Session 23 — synced with build_tracker.md)*

---

## A) Architecture Snapshot

### Stack
| Layer | Technology | Version | Status |
|---|---|---|---|
| Frontend | React + TypeScript | 18.3.1 / 5.5.3 | ✅ Working |
| Build tool | Vite | 5.4.2 | ✅ Working |
| Routing | React Router | 7.12.0 | ✅ Working |
| Styling | Tailwind CSS + custom `pro-*` tokens | 3.4.1 | ✅ Working |
| Backend/Auth | Supabase (PostgreSQL + Auth + Storage) | SDK 2.57.4 | ✅ Working |
| Vector search | pgvector via Supabase RPC | — | ✅ Working |
| AI (LLM) | OpenRouter 4-tier via `ai-orchestrator` Edge Function | — | ✅ Working |
| Payments | Stripe (Checkout + Webhooks) | — | [POSTPONED] Payment bypass active; code ready, needs API keys |
| Deployment | Cloudflare Pages (backlogged) / Netlify | — | ✅ Config present |

### Scale
- **73+ pages** across 6 portals (public, business, brand, admin, spa/legacy)
- **Phase 1: 15 migrations + extra (e.g. 20260228000001 credit banking, 20260228000002 pipeline RLS)**
- **Edge Functions:** `ai-orchestrator` (4-tier), `ai-concierge`, `create-checkout`, `generate-embeddings`, `magic-link`, `send-email`, `stripe-webhook`
- **~50 PostgreSQL tables** with full RLS; `tenant_balances` + `deduct_credits()` for AI banking

### Auth Model
```
5 roles: spa_user | business_user | brand_admin | admin | platform_admin

Role resolution:
  isAdmin        = admin OR platform_admin
  isBrandAdmin   = brand_admin OR admin OR platform_admin
  isSpaUser      = spa_user OR business_user (normalized)

Route protection:  ProtectedRoute + AdminLayout role guard
Profile:           auto-created on signup (default: business_user)
```

---

## B) Phase Completion — Real Status

### Phase 1 — Core Commerce: ~90% complete

**✅ Done:**
- All Phase 1 migrations (15) applied; extra: tenant_balances/deduct_credits, pipeline RLS (brand read unverified businesses)
- Full multi-tenant architecture (brands, businesses, admins)
- Brand storefronts (public) + brand discovery page `/brands`
- Product catalog management (brand-side, PRO + Retail)
- Tiered wholesale pricing + product pricing table
- Multi-brand cart (localStorage) + in-portal shopping
- Full order lifecycle: submitted → confirmed → fulfilled → shipped → delivered
- Order management — brand view, reseller view, admin view
- **Order tracking:** Brand sets tracking in BrandOrderDetail; reseller sees tracking section + “Track package” link (UPS/FedEx/USPS/DHL) in BusinessOrderDetail
- Brand onboarding (direct apply flow)
- Role-based dashboards — all 3 portals
- Reseller business profile
- **Reseller application:** `/portal/apply` (Apply.tsx) — business details + license; sets pending_verification; Dashboard “Apply Now” / “Under review” banners
- Express Interest signal (reseller → brand)
- **Flag as Potential Fit (brand → business):** `/brand/pipeline` — unverified business listing, “Flag as Fit” → business_interest_signals
- Admin approval queue (brands + businesses)
- Admin seeding dashboard
- Admin signals dashboard
- Admin orders (platform view)
- **Admin Brand Hub:** All 5 data tabs wired to DB (Orders, Products, Retailers, Analytics, Settings); Protocols/Education = Phase 2 placeholders
- Reseller + **brand** messaging inbox (both on conversations + messages; DMs brand↔reseller live)
- Conversations + messages data model (threading, read status, broadcasts)
- Brand analytics dashboard wired to real data structure
- **Payment bypass active:** PAYMENT_BYPASS; PaywallGate/UpgradeGate/auth mock PRO (Master Brain / Identity Bridge focus)
- Subscriptions table + Stripe Checkout Edge Function + Webhook handler (live when bypass off)
- PaywallGate component (G_max=3 gap analyses/month, $29/mo) — wired to PlanWizard
- UpgradeGate component (Pro-only tabs in PlanResults)
- Admin role guard implemented in AdminLayout
- PlanWizard race condition — confirmed fixed
- **AI:** 4-tier ai-orchestrator (OpenRouter), ai-concierge delegates; credit banking (tenant_balances, deduct_credits)
- **Basic product search:** tsvector on pro_products + retail_products; searchService.searchProducts full-text + filters (migration 20260228100001)
- **Brand claim flow:** /claim/brand/:slug, claim_brand RPC, /brand/claim/review (migration 20260228100002)
- **Business claim flow:** /claim/business/:slug, claim_business RPC, /portal/claim/review (migration 20260228100003)
- **Returns workflow:** order return fields + request_return/resolve_return RPCs (migration 20260228100004); reseller Request return, brand Approve/Reject (refund execution postponed)
- **Order-linked messages:** get_or_create_order_conversation RPC (migration 20260228100005); Reseller/Brand OrderDetail "Message about this order" / "Message reseller"; Messages ?conversation=; inbox "Order #…" labels
- **Email transactional:** send-email Edge Function (Resend). new_order → brand on submit; order_status → reseller on status update (recipient from order_id). Welcome + plan_complete already wired. RESEND_API_KEY + FROM_EMAIL required.

**❌ Not done (internal — buildable now):**
- Brand/business verification state machines (full UX beyond claim flows; logic in DB)

**⏳ Not done (blocked on external accounts):**
- Stripe checkout live (needs Stripe account + API keys) — [POSTPONED]
- Stripe Connect brand payouts — [POSTPONED]
- Transactional email sending requires RESEND_API_KEY + FROM_EMAIL in Supabase secrets (code wired; Resend)
- Password reset emails (needs Supabase Auth SMTP or Resend)
- Cloudflare Pages deploy (backlogged)

**⏳ Not done (lower priority seeding/automation):**
- Shopify `/products.json` importer
- Google Places business lookup
- Brand website scraper (Firecrawl)
- Seeding automation tools

---

### Phase 2 — Education + Messaging Depth + Commerce: ~55% complete

**✅ Done:**
- Marketing Calendar (full — quarterly themes, product/protocol launches, webinars)
- Brand CMS/Storefront editor with page modules (hero variants, gallery, featured products)
- Brand Training Assets schema + Hub Education page (video, PDF, links, learning modules)
- Brand Assets table (images, logos, commercial content)
- Conversations system (DMs, order-linked, broadcast-ready, threading, read status)
- Message threading (parent-child structure)
- Admin inbox with all-conversation view
- AI Concierge (Claude-powered, 5 modes: discovery, protocol, retail, analytics, support)
- Gap analysis, Retail Attach, Phased Rollout Planner, Opening Order (all working)
- Performance Analytics — revenue by retailer, product, protocol (real data queries)
- Interest Signals (brand + business engagement tracking)
- `generate-embeddings` Edge Function (semantic search foundation)
- `send-email` Edge Function (email service — needs Brevo keys)

**⏳ Partially done:**
- Campaigns page (`/brand/campaigns`) — UI exists, marked "Coming Soon", backend broadcast infrastructure ready
- Shopify order push — referenced in UI/pricing but zero integration code written

**❌ Not done:**
- Course enrollment, progress tracking, certification (student side)
- Course library UX (reseller takes courses)
- Certification unlocking pricing tiers
- Live training scheduler (Zoom integration)
- Socelle Academy v1 (platform-owned content)
- Shopify inventory sync + catalog import
- Server-side cart + abandoned cart recovery
- Broadcast segmentation UI (by tier, location, order date)
- Conversation archiving
- File attachments in messages

---

### Phase 3 — Marketing Studio + Payments: ~15% complete

**✅ Done:**
- Brand assets table + commercial assets table (DB layer)
- Campaigns page scaffold (route + placeholder UI)
- Automations + Promotions pages (stubs/routes)
- Stripe infrastructure complete (checkout, webhooks, subscriptions)

**❌ Not done:**
- Campaign builder UI (templates, scheduling, send)
- Asset library (brand uploads co-brand templates)
- Co-brand template customizer
- Email/SMS campaigns to retailer network
- Social content toolkit
- Loyalty program
- Net-30 terms for qualified resellers
- WooCommerce / BigCommerce integrations
- Platform announcements system
- Message templates

---

### Phases 4–7: 0–5% complete

Phase 4 (Business Tools), Phase 5 (Brand CRM), Phase 6 (Consumer Tools), Phase 7 (Scale + Intelligence) are not started, with one exception: the Marketing Calendar from the pre-Socelle era is live at `/portal/calendar` and `/admin/calendar`.

---

## C) Active Blockers

### BLOCKER 1 — Stripe API Keys Not Configured [POSTPONED]
**What breaks:** Checkout sessions cannot be created. Subscriptions cannot be activated.
**Status:** Payment bypass active; focus is Master Brain + Identity Bridge. When ready: set up Stripe account, add secrets to Edge Functions.

### BLOCKER 2 — Brevo Not Configured
**What breaks:** All transactional email (signup confirmation, password reset, order notifications) silently fails.
**Fix:** Set up Brevo account, add API key to `send-email` Edge Function.

### BLOCKER 3 — Brand Analytics Partially Mocked (lower priority)
**Files:** `src/pages/brand/Dashboard.tsx`, `src/pages/brand/Performance.tsx`
**Status:** Some stats wired to real data; some cards may still use placeholders. Admin Brand Hub Analytics tab is now real (Session 18).

---

## D) Resolved — Previously Listed as Blockers

| Old Blocker | Was | Now |
|---|---|---|
| Race condition on PlanWizard | `handleAnalyze()` navigated before save | `await runMenuAnalysis()` confirmed fixed |
| No subscription/billing system | Didn't exist | `subscriptions` table + Stripe Edge Functions complete |
| No commerce/ordering layer | Mock data only | Full order lifecycle implemented |
| Admin has no role guard | Missing | `AdminLayout.tsx` has explicit role check |
| No paywall enforcement | No gate | `PaywallGate` (G_max=3) wired to PlanWizard |
| **BUG-M01: Brand inbox legacy schema** | Brand inbox on `brand_messages`; no DMs to resellers | Brand Messages.tsx migrated to conversations + messages (Session 18); DMs live |
| **Reseller onboarding / apply** | No apply flow after signup | `/portal/apply` (Apply.tsx) + Dashboard banners; admin approval queue reviews (Session 18) |
| **Admin Brand Hub mock data** | 7 tabs used MOCK_* arrays | Orders, Products, Retailers, Analytics, Settings wired to DB; Protocols/Education Phase 2 placeholders (Session 18) |
| **Order tracking (reseller view)** | Reseller couldn’t see tracking | BusinessOrderDetail shows tracking section + Track package link (Session 19) |

---

## E) Graduated Funnel / Mobile Bridge (2026-02-27)

Work completed connecting the Mobile app (SOCELLE-MOBILE) to the Web platform:

| Component | Status |
|---|---|
| `firebase_uid_map` migration | ✅ Applied |
| `identity_bridge.dart` (Option B lookup table) | ✅ Implemented |
| `SocelleSupabaseClient.initialize()` in `main.dart` | ✅ Wired |
| `upgradeToWeb` PaywallTrigger (fires at $500 recovered) | ✅ Implemented |
| `GapHandoffService` (gap categories → URL params) | ✅ Implemented |
| `MagicLinkService` (calls `magic-link` Edge Function) | ✅ Implemented |
| `magic-link` Supabase Edge Function | ✅ Deployed |
| `paywall_page.dart` upgradeToWeb case | ✅ Added (hero card + CTA routing) |
| WCAG 2.2 AA touch target fixes (3 locations) | ✅ Applied |
| `inkFaint` contrast fix (2.2:1 → 4.5:1) | ✅ Applied |

---

## F) External Dependencies Summary

| Item | Blocks | Status |
|---|---|---|
| Stripe account + API keys | Checkout, subscriptions | ⏳ Not set up |
| Stripe Connect | Brand payouts | ⏳ Not set up |
| Brevo account + API key | All email notifications | ⏳ Not set up |
| Supabase Auth SMTP → Brevo | Password reset emails | ⏳ Depends on Brevo |
| Cloudflare Pages deploy | Hosting | ⏳ Backlogged |
| Shopify Partner account | Shopify integration | ❌ No code written yet |

---

*Next internal priorities: (1) Brevo + email notifications, (2) Basic product search, (3) Brand/business claim flows. See /docs/build_tracker.md for full feature list.*
