# Socelle Platform — Code Audit Report

Date: 2026-03-07
Audited by: WO-OVERHAUL-20 Code Audit Agent
Authority: `/.claude/CLAUDE.md` (root governance)

---

## Executive Summary

**Overall: CONDITIONAL PASS**
**Total FAILs: 2 | Total WARNs: 7**

The platform builds cleanly (tsc 0 errors, Vite build success) and has strong security hygiene (no secrets in client code, Stripe signature verification in place, all 149 tables have RLS enabled). Key gaps are the absence of ModuleRoute subscription gate wrappers on module routes and 9 hardcoded hex values in public pages.

---

## Section 1 — Subscription Gate Integrity

### 1a. Web Route Audit — FAIL

No `ModuleRoute` wrapper component exists anywhere in the codebase. The following module routes are **unwrapped** (no subscription/entitlement gate):

| Module | Routes | Auth Gate | Module Gate |
|---|---|---|---|
| MODULE_SHOP | `/shop`, `/shop/category/:slug`, `/shop/product/:slug`, `/shop/cart`, `/shop/checkout`, `/shop/orders`, `/shop/orders/:id`, `/shop/wishlist`, `/shop/:slug`, `/cart`, `/checkout`, `/account/orders`, `/account/orders/:id`, `/account/wishlist` | ProtectedRoute on order/wishlist routes | NONE |
| MODULE_EDUCATION | `/education/*` (public), `/portal/education/*` (portal) | ProtectedRoute on portal routes | NONE |
| MODULE_INGREDIENTS | `/ingredients/*` (public) | None (public) | NONE |
| MODULE_SALES | `/sales`, `/sales/pipeline`, `/sales/deals/:id`, `/sales/proposals`, `/sales/commissions` | ProtectedRoute | NONE |
| MODULE_MARKETING | `/marketing`, `/marketing/campaigns`, `/marketing/segments`, `/marketing/templates`, `/marketing/landing-pages`, `/marketing/calendar` | ProtectedRoute | NONE |
| MODULE_RESELLER | No `/portal/reseller/*` routes found | N/A | NONE |
| MODULE_CRM | No `/portal/crm/*` routes found | N/A | NONE |
| MODULE_BOOKING | No `/portal/booking/*` routes found in App.tsx | N/A | NONE |

**Finding:** Routes use `ProtectedRoute` for role-based auth, but no `ModuleRoute` or subscription-tier gating exists. Any authenticated user with the right role can access any module regardless of subscription tier.

### 1b. Mobile ModuleGate — WARN

Found references to `ModuleGate` in mobile codebase:
- `SOCELLE-MOBILE-main/apps/mobile/lib/src/features/modules/module_gate.dart`
- `SOCELLE-MOBILE-main/apps/mobile/lib/src/features/modules/module_gate_screen.dart`

Mobile has the gate infrastructure but web does not.

### 1c. ModuleNavItem / Lock Badge — WARN

Found in `SOCELLE-WEB/src/`:
- `src/components/modules/ModuleNavItem.tsx` — exists
- `src/components/modules/LockBadge.tsx` — exists (or similar)

Navigation lock UI components exist but are not wired to route-level gating.

### 1d. account_module_access RLS — FAIL

No RLS policies reference `account_module_access` in any migration file. The `account_module_access` table may exist but has no row-level security policies enforcing module entitlements at the database layer.

### 1e. DELETE CASCADE — PASS

No `ON DELETE CASCADE` references involve module access tables. Existing cascades are on relational FKs (e.g., protocol steps -> protocols, spa services -> menus) which are appropriate parent-child relationships.

**Section 1 Score: FAIL** (no ModuleRoute wrapper; no RLS on module access)

---

## Section 2 — Security

### 2a. Client-side Secrets — PASS

No occurrences of `STRIPE_SECRET`, `BREVO_KEY`, or `private_key` in client-side code. References to `api_key_encrypted` are **comments only** (security documentation in `AdminApiControlHub.tsx`):
- Line 5: `// SECURITY: NEVER display api_key_encrypted field.`
- Line 28: `// SECURITY: api_key_encrypted is intentionally excluded from this interface.`
- Line 47: `// Safe columns — excludes api_key_encrypted`

### 2b. api_key_encrypted in Queries — PASS

`api_key_encrypted` appears only in:
- `AdminApiControlHub.tsx` — security exclusion comments
- `test-api-connection/index.ts` — explicit "NEVER select api_key_encrypted" documentation
- Safe columns pattern correctly excludes the field

### 2c. Admin Route Protection — PASS

All `/admin/*` routes are wrapped in:
```
<ProtectedRoute requireAdmin redirectTo="/admin/login">
  <AdminLayout />
</ProtectedRoute>
```
The parent layout route enforces `requireAdmin`. Child routes inherit this protection. `/admin/login` is correctly excluded. `/admin/debug-auth` has its own `requireAdmin` wrapper.

### 2d. RLS on All Tables — PASS

**149 tables created, 149 tables have `ENABLE ROW LEVEL SECURITY`.**
All tables have RLS enabled in migrations.

### 2e. Stripe Webhook Signature Verification — PASS

Both webhook functions verify Stripe signatures:

- **`stripe-webhook/index.ts`**: Custom HMAC-SHA256 verification with `verifyStripeSignature()`, checks `stripe-signature` header, validates timestamp within 5 minutes, computes HMAC against webhook secret.
- **`subscription-webhook/index.ts`**: Uses `stripe.webhooks.constructEvent(body, signature, webhookSecret)` — standard Stripe SDK verification. Returns 400 on missing signature or verification failure.

### 2f. Hardcoded Auth Bypasses — PASS

No instances of `isAdmin = true` or hardcoded auth bypasses found in source code.

**Section 2 Score: PASS**

---

## Section 3 — Design System

### 3a. Hardcoded Hex in Public Pages — WARN

**9 occurrences** of hardcoded hex values in `src/pages/public/`:

| File | Hex Value | Usage |
|---|---|---|
| `ForSalons.tsx` | `#F7F5F2` | text color in dark section |
| `ForMedspas.tsx` | `#F7F5F2` | text color in dark section |
| `ApiPricing.tsx` | `#F7F5F2` (x2) | badge text, heading text |
| `Plans.tsx` | `#F7F5F2` | heading text |
| `Brands.tsx` | `#F7F5F2`, `#1F2428` (x2) | hero text, filter button bg/border |

**Note:** `#F7F5F2` is the Pearl Mineral background color and `#1F2428` is close to graphite. These should be Tailwind tokens (`text-pearl`, `bg-graphite`, etc.) per `SOCELLE_CANONICAL_DOCTRINE.md`.

### 3b. font-serif in Public Pages — PASS (verified 2026-03-09)

`grep -rn "font-serif" src/ --include="*.tsx" --include="*.ts"` returns **0 lines** excluding comments. No actual `font-serif` class usage anywhere in `src/`. Archive copy at `.archive/SOCELLE-WEB-1/` has 146 legacy refs — dead code, not shipped.

### 3c. Mobile Hardcoded Colors — WARN

**144 occurrences** of `Color(0x...)` outside `socelle_theme.dart` in the mobile codebase. These should reference theme tokens.

### 3d. pro-* Token Compliance — PASS (migration complete 2026-03-09)

`grep -rn "text-pro-\|bg-pro-\|border-pro-\|from-pro-\|to-pro-\|via-pro-\|ring-pro-" src/ --include="*.tsx" --include="*.ts"` returns **0 lines**. Migration complete via Ultra Drive UD-A-01..UD-A-06. Prior audit (2026-03-08) found 2,027 usages across admin (748), business (587), brand (288), components (377), layouts (26) — all replaced with Pearl Mineral V2 equivalents. Prior "PASS — correctly scoped to portals" claim was a **false exemption**; all portals are now clean.

### 3e. TanStack Query Migration — PARTIAL (6 components remain)

`DEBT-TANSTACK-REAL-6` is **PENDING** as of 2026-03-09. Six components still use raw `useEffect + supabase.from()`: `BusinessRulesView`, `ReportsView`, `MappingView`, `PlanOutputView`, `ServiceIntelligenceView`, `MarketingCalendarView`. These must be migrated before launch gate §5/§23 pass. Prior agents migrated 73 of 79 pages (Session 48).

**Section 3 Score: WARN** (9 hardcoded hex web, 144 hardcoded colors mobile, 6 TanStack violations pending)

**144 occurrences** of `Color(0x...)` outside `socelle_theme.dart` in the mobile codebase. These should reference theme tokens.

**Section 3 Score: WARN** (9 hardcoded hex web, 144 hardcoded colors mobile)

---

## Section 4 — Type Safety + Build

### 4a. TypeScript Compilation — PASS

`npx tsc --noEmit` — **0 errors**. Clean compilation.

### 4b. Vite Build — PASS

`npm run build` — **success** in 4.64s. One warning:
- `vendor-docs` chunk is 850 KB (over 600 KB limit). Consider code-splitting.

### 4c. `as any` Count — WARN

**20 occurrences** of `as any` in `src/`. Low count for a codebase of this size but should be reduced over time.

### 4d. TODO/FIXME/HACK Count — PASS

**3 occurrences** total. Excellent — very clean.

**Section 4 Score: PASS** (build clean, minor `as any` debt)

---

## Section 5 — Data Integrity

### 5a. Total Migrations — INFO

**145 migration files** in `SOCELLE-WEB/supabase/migrations/`.

### 5b. Migration Editing — INFO

Cannot verify via git blame in this context. All 145 files exist. Reminder: migrations must be ADD-ONLY per governance rules.

### 5c. Tables Without RLS — PASS

All 149 tables have corresponding `ENABLE ROW LEVEL SECURITY` statements. No tables are missing RLS.

**Section 5 Score: PASS**

---

## Section 6 — Performance

### 6a. N+1 Query Patterns — PASS

**0 occurrences** of `.from().select()` inside loops (`forEach`, `map`, `for`, `while`). No N+1 patterns detected.

### 6b. Realtime Subscription Cleanup — PASS

Found 1 Supabase realtime subscription in `useSubscription.ts`:
- **Subscribe:** `supabase.channel('subscription-changes')...subscribe()` (line 76-92)
- **Cleanup:** `supabase.removeChannel(channel)` in useEffect return (line 96)

Auth subscription in `auth.tsx` also properly cleans up: `subscription.unsubscribe()` (line 241).

All realtime subscriptions have proper cleanup.

### 6c. Bundle Size — WARN

`vendor-docs` chunk at 850 KB exceeds the 600 KB warning threshold. Consider lazy-loading document-heavy dependencies.

**Section 6 Score: PASS** (with bundle size note)

---

## Section 7 — Feature Completeness

### 7a. Total Routes in App.tsx — **247**

### 7b. Total Pages in src/pages/ — **219**

### 7c. Total Hooks/Lib Files — **141**

### 7d. Total Admin Pages — **63**

### 7e. Total Mobile Screens — **39**

### 7f. /book/:slug Route — WARN

**Not found.** No `/book/:slug` route exists in App.tsx. If booking is a planned feature, this route is missing.

### 7g. /certificates/verify/:token Route — WARN

**Not found.** No `/certificates/verify/:token` route exists in App.tsx. The `generate-certificate` and `verify-certificate` edge functions exist, but no public verification page is wired.

**Section 7 Score: WARN** (missing /book/:slug and /certificates/verify/:token routes)

---

## Section 8 — Compliance

### 8a. GDPR Consent — WARN

- `consent_signed` column exists in `client_records` migration (`20260307900006_client_records.sql`)
- Square connections reference "operator-consented data" in comments
- No dedicated `gdpr_consent` column or GDPR-specific consent tracking table exists
- No cookie consent banner component detected

### 8b. Cold Email / Outreach References — PASS

All "outreach" references are **in-context portal features** (brand CRM pipeline, operator relationship management) or explicit **anti-cold-email comments**:
- `useCampaigns.ts:6` — `// ZERO cold email — all campaigns opt-in only`
- `AudienceSegments.tsx:19` — `// ZERO cold email/outreach`
- `CampaignDetail.tsx:22` — `// ZERO cold email/outreach`

No cold email drafting, sending, or template functionality exists. Compliant with `CLAUDE.md` Section G.

### 8c. Card Data in Database — PASS

**No occurrences** of `card_number`, `cvv`, `pan`, or `credit_card` in any migration file. Card data is handled entirely by Stripe.

### 8d. Stripe Elements for Card Input — PASS

Card input is handled via `@stripe/react-stripe-js` (v5.6.1):
- `Checkout.tsx` uses `<Elements>`, `<CardElement>`, `useStripe()`, `useElements()`
- No raw card input fields exist in the codebase

**Section 8 Score: PASS** (minor GDPR gap)

---

## Remediation Queue

### FAILs (Must Fix)

| # | Section | Issue | Files |
|---|---|---|---|
| F1 | 1a | No `ModuleRoute` subscription gate wrapper on any module route | `SOCELLE-WEB/src/App.tsx` — all `/shop/*`, `/sales/*`, `/marketing/*`, `/education/*`, `/ingredients/*` routes |
| F2 | 1d | `account_module_access` has no RLS policies enforcing module entitlements | `SOCELLE-WEB/supabase/migrations/` — needs new migration |

### WARNs (Should Fix)

| # | Section | Issue | Files |
|---|---|---|---|
| W1 | 1b | Mobile has `ModuleGate` but web does not | `SOCELLE-WEB/src/App.tsx` |
| W2 | 1c | `ModuleNavItem` / lock badge components exist but are not wired to route gating | `SOCELLE-WEB/src/components/modules/` |
| W3 | 3a | 9 hardcoded hex values in public pages (should use Tailwind tokens) | `ForSalons.tsx`, `ForMedspas.tsx`, `ApiPricing.tsx`, `Plans.tsx`, `Brands.tsx` |
| W4 | 3c | 144 hardcoded `Color(0x...)` in mobile outside theme file | Various files in `SOCELLE-MOBILE-main/` |
| W5 | 4c | 20 `as any` casts in source code | Various files in `SOCELLE-WEB/src/` |
| W6 | 7f/7g | Missing `/book/:slug` and `/certificates/verify/:token` public routes | `SOCELLE-WEB/src/App.tsx` |
| W7 | 8a | No dedicated GDPR consent tracking or cookie consent banner | `SOCELLE-WEB/src/`, `SOCELLE-WEB/supabase/migrations/` |

---

## Platform Statistics

| Metric | Count |
|---|---|
| Total web routes (App.tsx) | 247 |
| Total web pages (src/pages/) | 219 |
| Total hooks/lib files (src/lib/) | 141 |
| Total admin pages | 63 |
| Total mobile screens | 39 |
| Total migrations | 145 |
| Total edge functions | 30 |
| Total Supabase tables | 149 |
| Total `as any` casts | 20 |
| Total TODO/FIXME/HACK | 3 |
| TypeScript errors | 0 |
| Build status | SUCCESS (4.64s) |
| Largest chunk | vendor-docs: 850 KB |

---

## Edge Functions Inventory

| Function | Purpose |
|---|---|
| ai-concierge | AI chat assistant |
| ai-orchestrator | AI pipeline orchestration |
| create-checkout | Stripe checkout session creation |
| feed-orchestrator | RSS/data feed pipeline |
| generate-certificate | Certificate PDF generation |
| generate-embeddings | Vector embeddings for search |
| ingest-npi | NPI Registry data ingestion |
| ingest-rss | RSS feed ingestion |
| ingredient-search | Ingredient database search |
| intelligence-briefing | Market intelligence reports |
| jobs-search | Job postings search |
| magic-link | Passwordless auth |
| manage-subscription | Subscription lifecycle |
| open-beauty-facts-sync | Open Beauty Facts data sync |
| process-scorm-upload | eLearning SCORM processing |
| refresh-live-data | Live data refresh pipeline |
| rss-to-signals | RSS to market signals conversion |
| scorm-runtime | SCORM player runtime |
| send-email | Transactional email (Brevo) |
| shop-checkout | Shop checkout flow |
| shop-webhook | Shop order webhooks |
| sitemap-generator | XML sitemap generation |
| square-appointments-sync | Square POS appointment sync |
| square-oauth-callback | Square OAuth flow |
| stripe-webhook | Stripe payment webhooks |
| subscription-webhook | Subscription lifecycle webhooks |
| test-api-connection | API registry connection testing |
| update-inventory | Inventory sync |
| validate-discount | Discount code validation |
| verify-certificate | Certificate verification |

---

---

## LANE E CORRECTION — CURRENT OPEN DEBT (updated 2026-03-09)

**Source:** 2026-03-09 site-wide 5-agent audit. Artifact: `SOCELLE-WEB/docs/qa/verify_site_wide_audit_2026-03-09T22-00-00-000Z.json`

### Resolved (do not re-open)
- **`pro-*` tokens:** RESOLVED — 0 usages in `src/` (portals included). Migration complete via Ultra Drive UD-A-01..UD-A-06 verified 2026-03-09. Verification: `docs/qa/verify_UD-A-ALL_20260309T210000Z.json`
- **Sentry:** RESOLVED — 0 imports/packages in `src/`, `vite.config.ts`, `package.json`. One monitoring metric label in `AdminInventoryReport.tsx:39` (`label: '@sentry in src'`) is a health-check string, not an import. Verification: `docs/qa/build_gate_results.json`
- **`font-serif`:** RESOLVED — 0 usages in `src/`. Verified 2026-03-09.
- **DEBT-6 (tier filter bypass):** RESOLVED — `allowedTiers` filter now applies unconditionally on all signal paths in `useIntelligence.ts`.

### Open — P0 (fix before any new WO)
- **Cart.tsx:84 'Shop Now'** — §9 STOP CONDITION. Replace immediately. Blocks §16.8.
- **IntelligenceCommerce.tsx** — missing `isLive` LIVE/DEMO badge. Violates §8.
- **`useEnrichment.ts`** — 1 raw `useEffect + supabase.from()` (scheduling trigger). Must migrate to `useQuery`. Blocks §16.23.
- **8× 'AI-powered' in user-facing copy** — banned term per CANONICAL_DOCTRINE §9. Blocks §16.8.
- **`database.types.ts` drift** — 116 tables vs 165 migrations. Run `supabase gen types`. Blocks §16.13.

### Open — P1 (design token migration)
- **`brand-*` token violations: 19** — `StatCard`, `Button`, `EmptyState`, `UpgradeGate`, `index.css`. Defined in `tailwind.config.js` as legacy tokens. Migrate to Pearl Mineral V2 (`accent-soft`, etc.).
- **`intel-*` token violations: 30** — `GlowBadge`, `DarkPanel`, 5 business portal pages. Replace `intel-up/down/accent/dark` with `signal-up/down/warn/accent`.

### Open — P2 (TanStack migration)
- **`DEBT-TANSTACK-REAL-6` — 6 files pending:** `BusinessRulesView`, `ReportsView`, `MappingView`, `PlanOutputView`, `ServiceIntelligenceView`, `MarketingCalendarView`. Migrate from raw `useEffect + supabase.from()` to `useQuery`. Blocks launch gate §5/§23.
- **`StudioEditor.tsx`** — additional raw `useEffect + supabase.from()` violation detected in pages scan (2026-03-09 verification). Evaluate for migration.

### Open — P2 (test failures)
- **29 unit tests failing** — `@testing-library/react` v16.3.2 incompatible with React 19. Upgrade to `^17.x`. 163/192 passing.

### Open — P3 (SEO)
- **SEO coverage: 40.1%** — 109/272 pages have meta tags. 163 uncovered. Maps to SITE-WO-04.

---

*Report generated 2026-03-07 by WO-OVERHAUL-20 Code Audit Agent*
*Corrected 2026-03-09 by LANE-E audit: false PASS claims for pro-* and Sentry updated to reflect verified state. Open debt documented per site-wide audit artifact.*
*Authority: `/.claude/CLAUDE.md` Section B (Doc Gate)*
