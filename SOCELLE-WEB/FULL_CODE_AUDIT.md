# FULL CODE AUDIT — SOCELLE Platform

**Date:** February 26, 2026
**Scope:** SOCELLE WEB (React/Vite/TypeScript + Supabase) + SOCELLE Mobile (Flutter/Dart + Firebase + Shared TypeScript Packages)
**Auditor:** Automated Code Audit System

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Phase 1 — File Inventory](#phase-1--file-inventory)
3. [Phase 2 — Duplication & Logic Mapping](#phase-2--duplication--logic-mapping)
4. [Phase 3 — Gap Analysis](#phase-3--gap-analysis)
5. [Phase 4 — Unification Readiness](#phase-4--unification-readiness)
6. [Phase 5A — Planned vs Built (Doc Cross-Reference)](#phase-5a--planned-vs-built)
7. [Skipped / Excluded Files](#skipped--excluded-files)
8. [Critical Findings & Recommendations](#critical-findings--recommendations)
9. [Appendix: Detailed Reports](#appendix-detailed-reports)

---

## Executive Summary

### Platform Architecture

| Dimension | SOCELLE WEB | SOCELLE Mobile |
|-----------|------------|----------------|
| **Framework** | React + Vite | Flutter (Dart) |
| **Language** | TypeScript | Dart + TypeScript (backend) |
| **Backend** | Supabase (exclusive) | Firebase (primary) + Supabase (secondary) |
| **Auth** | Supabase Auth | Firebase Auth |
| **Deployment** | Netlify | Firebase Hosting + Cloud Functions |
| **State Mgmt** | React Context | Riverpod |
| **Styling** | Tailwind CSS | Material Design (custom widgets) |
| **Database** | Supabase PostgreSQL | Firestore + Supabase (marketplace) |

### Codebase Size

| Metric | Web | Mobile | Total |
|--------|-----|--------|-------|
| **Source Files** | 357 | 368 | 725 |
| **Lines of Code** | 50,610 | 57,258 (22K Dart + 35K TS) | 107,868 |
| **Core Source Files** | 190 TS/TSX | 102 Dart + 43 TS Functions | 335 |

### Overall Health Assessment

| Area | Score | Notes |
|------|-------|-------|
| **Code Completeness** | 8/10 | Web is feature-complete; mobile has 3 critical stubs |
| **Duplication** | 7/10 | Low cross-platform (8%); moderate web-internal (15%) |
| **Architecture** | 9/10 | Clean separation; shared packages well-structured |
| **Technical Debt** | 8/10 | 12 gaps total; 3 critical, all intentional for phased rollout |
| **Unification Readiness** | 7/10 | ~30% move-today, ~50% needs-refactor, ~20% full-rewrite |

### Top 10 Action Items (Updated with Doc Cross-Reference)

**REVENUE-BLOCKING (cannot collect money):**
1. **Order payment capture (Web)** — Stripe checkout only handles subscriptions. Orders submit to DB but have no payment mechanism. Zero orders can be completed. (~10 days)
2. **Stripe Connect payouts (Web)** — No settlement logic exists. Brands cannot receive money. (~14 days)
3. **RevenueCat production key + App Store products (Mobile)** — Still in test mode. App cannot accept real payments. (~0.5 days, external config)

**ENGAGEMENT-BLOCKING (core user loop broken):**
4. **BUG-002 timezone fix (Mobile)** — Gap detection is wrong for ~95% of non-UTC users. Revenue leakage calculations are incorrect. Code fixed, awaiting Cloud Function redeploy. (~1 day)
5. **Google Sign-In linking / BUG-004 (Mobile)** — Anonymous auth only. Users lose all data on reinstall. (~3 days)
6. **Fix brand/reseller messaging (Web)** — Brand inbox on legacy schema, reseller on new `conversations` table. DMs between parties completely broken. (~3 days)
7. **Reseller onboarding flow (Web)** — No signup path exists. Only admin seeding. Organic growth impossible. (~7 days)

**ARCHITECTURE/TECH DEBT:**
8. **Implement IdentityBridge** — Maps Firebase UID ↔ Supabase user_id. Blocks all cross-platform integrations. (~3 days)
9. **Consolidate web mapping engines** — `mappingEngine.ts` and `serviceMappingEngine.ts` share 70% logic. (~2 days)
10. **Extract shared packages** — `supabase-config`, `feature-flags`, `platform-constants`. (~5 days)

### Completion Status (from Planning Docs)

| Metric | Count | % |
|--------|-------|---|
| **Total planned features** | 287 | 100% |
| Built (fully functional) | 89 | 31% |
| Partial (started, incomplete/mocked) | 64 | 22% |
| Unbuilt (designed but no code) | 119 | 41% |
| Deferred (explicitly Phase 2+) | 15 | 5% |

---

## Phase 1 — File Inventory

### Summary Statistics

**Web Codebase (SOCELLE WEB):**
- 357 total source files, 50,610 LOC
- 190 TypeScript/TSX files (core application)
- 65 SQL migrations (Supabase schema evolution, Jan-Feb 2026)
- 75 markdown documentation files
- 5 Supabase Edge Functions
- 8 utility scripts

**Mobile Codebase (SOCELLE Mobile):**
- 368 total source files, 57,258 LOC
- 102 Dart files (22,376 LOC) — Flutter UI, services, providers, models
- 43 TypeScript files (34,882 LOC) — Firebase Cloud Functions
- 21 iOS native files (Swift, Objective-C, plist)
- Monorepo with 3 shared packages: `gap_engine`, `shared`, `functions`

### Key Architectural Components

**Web (src/):**
- `src/components/` — 46 React components + 11 UI primitives
- `src/pages/` — 68 page components across 5 portals (admin, brand, business, spa, public)
- `src/lib/` — 30+ services (auth, Supabase client, mapping engines, analytics, email)
- `src/layouts/` — 4 role-specific layout templates
- `supabase/` — 65 migrations + 5 Edge Functions

**Mobile (apps/mobile/lib/):**
- `features/` — 12 feature modules (dashboard, onboarding, settings, paywall, shop, messages, etc.)
- `providers/` — 11 Riverpod state providers
- `services/` — 10 service classes (API, auth, analytics, calendar, notifications)
- `models/` — 15 data model classes
- `repositories/` — 6 repository classes (3 interfaces + 3 implementations each for shop/messaging)
- `core/` — Design system widgets, constants, feature flags

**Shared Packages (packages/):**
- `gap_engine/` — Calendar gap detection algorithm (359 lines, well-tested)
- `shared/` — Zod validation schemas for cross-function data contracts (253 lines)
- `functions/` — Firebase Cloud Functions (30+ modules for notifications, retention, sync, email)

> Full file manifest with paths, sizes, and modification dates: see [CODE_INVENTORY.md](CODE_INVENTORY.md)

---

## Phase 2 — Duplication & Logic Mapping

### Cross-Platform Duplication: 8% (Low)

The web and mobile codebases are built in different languages (TypeScript vs. Dart) targeting different UI frameworks (React vs. Flutter), so direct code duplication is minimal. The overlap is in **shared concerns** — areas where both platforms implement similar logic independently.

### 8 Shared Concerns Identified

| Concern | Web | Mobile | Duplication Level |
|---------|-----|--------|-------------------|
| Supabase Client | `src/lib/supabase.ts` | `services/supabase_client.dart` | Near-duplicate (85%) |
| Data Models/Types | `src/lib/types.ts` (291 lines) | `packages/shared` Zod schemas + Dart models | Diverged |
| Authentication | Supabase Auth (`auth.tsx`) | Firebase Auth (separate) | Unique by design |
| Gap Detection | `gapAnalysisEngine.ts` (SPA gaps) | `packages/gap_engine` (calendar gaps) | Different domains |
| Calendar Sync | Not implemented | `packages/functions/src/sync/` | Mobile-only |
| Revenue Tracking | Embedded in analytics | `gap_engine` leakage functions | Partial overlap |
| Notifications | `emailService.ts` (transactional) | Firebase Functions (lifecycle) | Different strategies |
| Constants/Config | `platformConfig.ts` (spa matching) | `constants.dart` (pricing/slots) | Different domains |

### Within-Platform Duplication

**Web Internal (15% duplication):**

| Issue | Files | Overlap | Priority |
|-------|-------|---------|----------|
| Mapping engines | `mappingEngine.ts` vs `serviceMappingEngine.ts` | 70% | HIGH — consolidate |
| Dashboard components | Admin/Brand/Business dashboards | 50% | MEDIUM — extract base |
| Layout wrappers | Admin/Brand/Business/Spa layouts | 60% | MEDIUM — extract base |

**Mobile Internal (5% duplication):**

| Issue | Files | Overlap | Priority |
|-------|-------|---------|----------|
| Widget library | `sf_*.dart` components | Intentional modular design | None needed |
| Provider state | streak/revenue/ritual providers | 30% logic overlap | LOW — audit dependencies |

**Firebase Functions Internal:**

| Issue | Files | Overlap | Priority |
|-------|-------|---------|----------|
| Retention metrics | `retentionMetrics.ts` + `reengagementNotifications.ts` | 60% | MEDIUM — extract helpers |

### TypeScript Package Overlap

| Package | vs. Web | Status |
|---------|---------|--------|
| `gap_engine` | Web has SPA gap analysis (different domain) | No conflict — properly separated |
| `shared` schemas | Web has inline types in `auth.tsx` and `types.ts` | Diverged — align via shared Zod |
| `functions` | Web uses Edge Functions (different backend) | No overlap — architectural split |

> Full duplication analysis with code examples: see [DUPLICATION_REPORT.md](DUPLICATION_REPORT.md)

---

## Phase 3 — Gap Analysis

### Summary

| Category | Count |
|----------|-------|
| **Total Gaps** | 12 |
| Active TODOs | 2 |
| Stubbed Implementations | 8 |
| Unstarted/Blocked | 2 |
| **Critical** | 3 |
| **Medium** | 7 |
| **Low** | 2 |

### Critical Gaps (Blocking)

1. **IdentityBridge** (`services/identity_bridge.dart`) — All methods throw `UnimplementedError`. Must map Firebase UID ↔ Supabase user ID. Blocks all Socelle marketplace integrations.

2. **SupabaseProductRepository** (`repositories/shop/supabase_product_repository.dart`) — Complete stub. Requires Supabase backend tables (`pro_products`, `product_pricing`) + IdentityBridge + `supabase_flutter` package.

3. **SupabaseConversationRepository** (`repositories/messaging/supabase_conversation_repository.dart`) — Complete stub. Requires Supabase tables (`conversations`, `messages`, `message_read_status`) + IdentityBridge + Realtime subscriptions.

### Medium Gaps (Non-blocking but Limiting)

- **StubAiProvider** — Functional without LLM; generates deterministic suggestions from real gap data
- **MockProductRepository / MockConversationRepository** — Active mocks behind disabled feature flags (intentional for MVP)
- **Supabase not initialized in mobile** — `supabase_flutter` package not yet in `pubspec.yaml`
- **7 inactive feature flags** — Studio, Shop, Messages, Streaks, Share, Dashboards, A/B Test (phased rollout)

### Low Gaps (Tech Debt)

- Web About page team bios placeholder (line 247 of `About.tsx`)
- `MonthlyLeakageSummary.mock()` — data stub for loading states (expected pattern)

### Cross-Platform Feature Parity

**Web has, Mobile lacks:** Brand Portal (15+ pages), Business Portal (10+ pages), Admin Portal, Campaign Manager, Automation Builder, Education Hub, Protocol CRUD, Bulk Import

**Mobile has, Web lacks:** Gap Engine integration, Weekly Summary notifications, Streak tracking, AI suggestions

### Dependency Chain for Feature Activation

```
Shop + Messages activation requires:
├── IdentityBridge implementation
├── Supabase backend schema (5 tables)
├── supabase_flutter package in pubspec.yaml
├── Supabase environment variables configured
└── Supabase Realtime wired (Messages only)
```

> Full gap analysis with file references and severity ratings: see [GAP_ANALYSIS.md](GAP_ANALYSIS.md)

---

## Phase 4 — Unification Readiness

### Readiness Distribution

| Rating | % of Concerns | Description |
|--------|---------------|-------------|
| **Move Today** | ~30% | Identical or trivially reconcilable |
| **Needs Refactor** | ~50% | Same intent, different implementation |
| **Full Rewrite** | ~20% | Fundamentally diverged (by design) |

### Detailed Assessment by Concern

| Concern | Rating | Effort | Phase | Key Action |
|---------|--------|--------|-------|------------|
| Supabase Client Config | Needs Refactor | 1 day | 1 | Extract `packages/supabase-config` |
| Type Definitions | Move Today* | 2 days | 1 | Align web types with mobile Zod schemas |
| Feature Flags | Needs Refactor | 1 day | 1 | Create `packages/feature-flags` |
| Constants & Config | Needs Refactor | 2 days | 1 | Create `packages/platform-constants` |
| Gap Engine | Move Today | 0 days | N/A | Already properly shared |
| Brand Configuration | Needs Refactor | 2 days | 2 | Create `packages/brand-config` |
| Email Templates | Needs Refactor | 3 days | 2 | Create `packages/email-templates` |
| UI Design System | Full Rewrite | 1 day | 2 | Design tokens + API contracts only |
| Authentication | Full Rewrite | 3 days | 2 | IdentityBridge (planned, not urgent) |
| Analytics Schema | Needs Refactor | 3 days | 3 | Standardize events across platforms |
| Retention Metrics | Needs Refactor | 2 days | 3 | Evaluate web applicability |

**Total Estimated Effort:** ~18 working days across 6 weeks

### Proposed Shared Packages

| Package | Contents | Consumers |
|---------|----------|-----------|
| `supabase-config` | Client initialization, auth options, retry policies | Web, Mobile, Firebase |
| `platform-constants` | Working hours, slot durations, retry timings | Web, Mobile, Firebase |
| `feature-flags` | Flag enums, phase gates, descriptions | Web, Mobile |
| `brand-config` | Multi-brand customizations (colors, messaging) | Web, Mobile |
| `email-templates` | Template engine, event schemas, rendering | Web Edge Fn, Firebase |
| `design-tokens` | Colors, spacing, typography (JSON/TS) | Web, Mobile (reference) |

### Recommended Roadmap

**Phase 1 (Week 1):** Foundation packages — supabase-config, feature-flags, platform-constants, type alignment. 5 days, 1 engineer.

**Phase 2 (Weeks 2-3):** Domain logic — brand-config, email-templates, design system contracts, IdentityBridge planning. 8 days, 1-2 engineers.

**Phase 3 (Month 2+):** Cross-platform analytics, retention metrics, documentation, testing. 10+ days ongoing.

### Risk Mitigation

| Risk | Probability | Mitigation |
|------|-------------|------------|
| Package dependency conflicts | Medium | Monorepo structure + semver + CI validation |
| Breaking changes in shared packages | High (initially) | Deprecation strategy + changelog + coordination |
| Dart cannot import TypeScript | High (by design) | Code generation from Zod schemas; constants manually ported |
| Firebase/Supabase divergence grows | High without action | IdentityBridge is non-negotiable for Phase 2 |
| Type mismatches across platforms | High without alignment | Single source of truth: Zod schemas in `packages/shared` |

> Full unification assessment with implementation checklists: see [UNIFICATION_PLAN.md](UNIFICATION_PLAN.md)

---

## Phase 5A — Planned vs Built

Cross-referencing 14 planning documents (master prompts, build trackers, strategy docs, user journey maps, system overviews) against actual source code revealed that the code-only audit significantly understated the gap between what's designed and what's built.

### The Real Picture

The original Phases 1-4 audited what **exists in code**. This phase audited what **should exist according to the planning docs** — and found that **41% of planned features have zero implementation.**

### Web Platform (Socelle B2B): 63% of Phase 1 Critical Path Complete

**What's built and working:** Multi-brand cart, brand storefronts, order management (view/update), admin seeding, brand onboarding/apply, role-based dashboards, express interest signals, RLS policies, 15 migrations applied.

**What's missing from Phase 1 (not Phase 2+ deferrals):**
- Order payment capture (Stripe handles subscriptions only — orders have no checkout)
- Stripe Connect payouts (no settlement logic at all)
- Reseller application + approval flow (admin seeding only)
- Brand claim flow for seeded entries (UI for unverified pages exists, but no claim mechanism)
- Brand verification state machine (field exists, no transitions)
- Brand/reseller DMs (two incompatible messaging schemas)
- Email notifications (Brevo not configured)
- Basic product search (no full-text search)
- Order-linked messages (schema supports it, no UI)

### Mobile Platform (Socelle Pro): Phase 8 (SHIP) at 9/11

**What's built:** Gap detection engine, all 18 Cloud Functions deployed, paywall logic, onboarding flow, revenue page, schedule page, settings, cancel intercept, push notification framework.

**What blocks TestFlight submission:**
- Postmark API key not in Secret Manager (0 transactional emails possible)
- RevenueCat still on test key (0 real revenue possible)
- App Store products not created (subscription SKUs missing)
- Android RevenueCat key missing (BUG-008)

**Known bugs in code-fixed-but-undeployed state:**
- BUG-001: rolling_30d_leakage always equals weekly (fixed, awaiting CF deploy)
- BUG-002: Timezone makes gap detection wrong for non-UTC users (fixed, awaiting CF deploy)

**Phase 9-12 (50+ features) entirely unbuilt:** Revenue goal setting, waitlist + contact import, flash offers, Google review requests, calendar write, client database, automated outreach, streak activation, Pro+ tier, income tracking, tax estimator, referral rewards.

### Cross-Platform: Two Separate Products

The platforms share a brand name but cannot share users, data, or sessions. The identity bridge (`identity_bridge.dart`) throws `UnimplementedError` on every method. Until Phase 13 ships, they must be marketed and launched independently.

**What mobile cannot see from web:** Brand storefronts, product catalogs, marketplace orders, education content, marketing campaigns.

**What web cannot see from mobile:** Provider schedules, service capacity, gap leakage data, revenue recovery metrics, client satisfaction.

### Doc Conflicts Found

1. **Cart strategy** — Master prompt says localStorage (Phase 1), tech stack doc says server-side. Resolution: localStorage is correct for Phase 1.
2. **Messaging architecture** — Both docs agree it's broken (BUG-M01). Brand on legacy `brand_messages`, reseller on new `conversations`.
3. **Phase 1 scope (seeding vs. verification)** — Unverified brand page UI is built, but the claim flow that transitions brands from seeded → claimed is missing.
4. **Paywall trigger suppression** — Session-only suppression documented in user journey map, bug logged in tracker. Both agree it needs persistent cooldown (BUG-009, 0.5 day fix).

> Full feature-by-feature cross-reference with 287 planned items: see [PLANNED_VS_BUILT.md](PLANNED_VS_BUILT.md)

---

## Skipped / Excluded Files

The following were excluded from the audit as specified:

| Category | Location | Reason |
|----------|----------|--------|
| `node_modules/` | Both codebases | Third-party dependencies |
| `build/` / `dist/` / `.next/` | Both codebases | Build artifacts |
| `.git/` | Both codebases | Version control metadata |
| `.artifacts/` | Mobile | IDE/tool artifacts |
| `Pods/` | Mobile iOS | CocoaPods dependencies |
| `.firebase/` | Mobile | Firebase cache |
| `.DS_Store` | Both codebases | macOS metadata |
| `package-lock.json` | Both codebases | Lockfiles (not source) |
| Binary files (`.png`, `.ico`) | Both codebases | Image assets |
| `database.types.ts` | Web | Auto-generated (25K+ lines); not manually auditable |

### Large Files Noted but Not Fully Analyzed

| File | Size | Notes |
|------|------|-------|
| `PROJECT_SNAPSHOT.md` | 1.1 MB | Historical project documentation |
| `database.types.ts` | ~25K lines | Supabase auto-generated types |
| `dashboard_page.dart` | 103K | Largest single component; may benefit from decomposition |

---

## Critical Findings & Recommendations

### LAUNCH BLOCKERS — Web (Socelle B2B)

Without these, the marketplace cannot generate revenue:

1. **Order payment capture** (~10 days) — Stripe checkout only handles subscriptions. Need a Stripe Payment Intent flow for product orders. Without this: zero completed orders.

2. **Stripe Connect payouts** (~14 days) — No settlement logic. Brands cannot receive money from orders. Without this: brands have no incentive to list products.

3. **Reseller signup flow** (~7 days) — Only admin seeding exists. No public application path. Without this: zero organic supply-side growth.

4. **Fix messaging schema mismatch** (~3 days) — Brand inbox uses legacy `brand_messages` table, reseller inbox uses new `conversations` table. They cannot talk to each other.

5. **Brand claim flow** (~5 days) — Admin can seed brands, but seeded brands have no way to claim their listing and become verified.

### LAUNCH BLOCKERS — Mobile (Socelle Pro)

Without these, the app cannot ship to TestFlight:

6. **Postmark API key** (~0.5 days, external) — Zero transactional emails work. 9 templates designed but SMTP not configured.

7. **RevenueCat production key + App Store products** (~0.5 days, external) — Test mode. No real subscriptions possible.

8. **Redeploy 18 Cloud Functions** (~1 day) — Fixes BUG-001 (revenue metrics wrong) and BUG-002 (timezone makes gap detection wrong for 95% of users). Code is fixed, just needs deployment.

9. **Google Sign-In linking** (~3 days) — Anonymous auth only. Users lose all data on reinstall. Major churn risk.

### HIGH PRIORITY — Architecture

10. **Implement IdentityBridge** (~3 days) — Blocks all cross-platform features. Must decide approach: custom claims, lookup table, or shared JWT.

11. **Consolidate web mapping engines** (~2 days) — 70% code duplication between `mappingEngine.ts` and `serviceMappingEngine.ts`.

12. **Extract shared packages** (~5 days) — `supabase-config`, `feature-flags`, `platform-constants` for both platforms.

### STRATEGIC WARNING

**Do NOT market the platforms as integrated.** The identity bridge is empty. Users will encounter two logins, two dashboards, two subscription systems. Launch them separately: Web = wholesale marketplace for spas, Mobile = schedule optimization for providers. Unification is Phase 13 work (~3+ weeks after both platforms launch independently).

---

## Appendix: Detailed Reports

All phase reports are saved alongside this document:

- **[CODE_INVENTORY.md](CODE_INVENTORY.md)** — Complete file manifest with paths, sizes, modification dates, and LOC counts
- **[DUPLICATION_REPORT.md](DUPLICATION_REPORT.md)** — Side-by-side comparison of shared concerns, within-platform duplicates, and code examples
- **[GAP_ANALYSIS.md](GAP_ANALYSIS.md)** — Every TODO, stub, placeholder, and feature gap categorized by severity and implementation status
- **[UNIFICATION_PLAN.md](UNIFICATION_PLAN.md)** — Per-concern readiness assessment, effort estimates, risk analysis, and phased roadmap
- **[PLANNED_VS_BUILT.md](PLANNED_VS_BUILT.md)** — 287 planned features cross-referenced against actual implementation, ranked by business impact

---

**Report Generated:** 2026-02-26
**Total Files Audited:** 725
**Total Lines of Code Audited:** 107,868
**Audit Duration:** Single session
**Status:** Complete — Ready for team review and sprint planning
