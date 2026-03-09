# SOCELLE MONOREPO — AGENT OPERATING DIRECTIVE

**Last updated:** March 8, 2026 (Ultra Drive revision)
**Authority:** This file is the root governance prompt. It controls all agent behavior in this monorepo.

---

## §0 — MANDATORY READING ORDER (EVERY SESSION)

**Before writing ANY code, running ANY command, or making ANY decision, read these files in this exact order:**

1. **`SOCELLE-WEB/docs/build_tracker.md`** — lines 1-50 only (current phase, active WOs, freeze directives)
2. **`SOCELLE_MASTER_BUILD_WO.md`** — the master work order document (36 WOs across 9 phases, full acceptance criteria)
3. **`SOCELLE-WEB/docs/command/V3_BUILD_PLAN.md`** — V3 canonical build plan with WO execution specs
4. **`SOCELLE-WEB/docs/command/CMS_ARCHITECTURE.md`** — CMS table definitions, hooks, admin routes, PageRenderer spec
5. **`SOCELLE-WEB/docs/command/CMS_CONTENT_MODEL.md`** — block types, content types, space definitions
6. **`SOCELLE-WEB/docs/command/JOURNEY_STANDARDS.md`** — per-hub user journey definitions and E2E test requirements

7. **`ULTRA_DRIVE_PROMPT.md`** — if it exists in repo root, this is the active corrective sprint. Read it and pick your lane.

**After reading those, check which WO you are executing and read the relevant skill(s) from `/.claude/skills/` before starting work.**

**Rule:** If you skip any of these reads, your output will drift from the owner's direction. Read first, build second.

---

## §1 — SKILL LIBRARY (99 skills — USE THEM)

You have **99 operational skills** at `/.claude/skills/`. These are auditors, validators, and generators that enforce quality gates.

**Before completing any WO, run the relevant skill(s) as acceptance verification.**

Key skill mappings by WO group:

| WO Group | Required Skills |
|----------|----------------|
| CTRL-WO-01..04 (Control Plane) | `feature-flag-validator`, `api-kill-switch-validator`, `audit-log-auditor`, `entitlement-chain-verifier` |
| FOUND-WO-01..15 (Foundation) | `schema-db-suite`, `rls-auditor`, `dev-best-practice-checker`, `live-demo-detector`, `shell-detector-ci` |
| INTEL-WO-01..11 (Intelligence) | `intelligence-hub-api-contract`, `intelligence-module-checker`, `ai-service-menu-validator`, `signal-data-validator`, `confidence-scorer` |
| FEED-WO-01..05 (Feed Pipeline) | `feed-pipeline-checker`, `feed-source-auditor`, `deduplication-logic-checker`, `dlq-system-checker`, `pg-cron-scheduler-validator` |
| PAY-WO-01..05 (Payments) | `stripe-integration-tester`, `credit-deduction-integration-tester`, `credit-economy-validator`, `affiliate-link-tracker-auditor` |
| CRM-WO-01..12 (CRM) | `hub-shell-detector`, `design-audit-suite`, `entitlement-validator`, `live-demo-detector` |
| EDU-WO-01..10 (Education) | `hub-shell-detector`, `authoring-core-schema-validator`, `entitlement-validator`, `copy-quality-suite` |
| SALES-WO-01..08 (Sales) | `hub-shell-detector`, `design-audit-suite`, `entitlement-validator` |
| COMMERCE-WO-01..07 (Commerce) | `hub-shell-detector`, `affiliate-link-checker`, `stripe-integration-tester` |
| AUTH-CORE-01..06 (Authoring Core) | `authoring-core-schema-validator`, `migration-validator`, `rls-auditor` |
| ADMIN-WO-01..05 (Admin Hub) | `system-health-dashboard-validator`, `feature-flag-validator`, `audit-log-auditor`, `hub-shell-detector` |
| MKT-WO-01..05 (Marketing) | `hub-shell-detector`, `design-audit-suite`, `live-demo-detector`, `cta-validator` |
| BOOK-WO-01..05 (Booking) | `hub-shell-detector`, `entitlement-validator`, `live-demo-detector` |
| BRAND-WO-01..05 (Brands Hub) | `hub-shell-detector`, `design-audit-suite`, `entitlement-validator` |
| PROF-WO-01..05 (Professionals) | `hub-shell-detector`, `live-demo-detector`, `entitlement-validator` |
| NOTIF-WO-01..05 (Notifications) | `realtime-subscription-checker`, `hub-shell-detector` |
| INGR-WO-01..06 (Ingredients) | `hub-shell-detector`, `data-integrity-suite`, `provenance-checker`, `rls-auditor` |
| JOBS-WO-01..06 (Jobs) | `hub-shell-detector`, `design-audit-suite`, `seo-audit` |
| EVT-WO-01..06 (Events) | `hub-shell-detector`, `design-audit-suite`, `seo-audit` |
| RESELL-WO-01..05 (Reseller) | `hub-shell-detector`, `affiliate-link-tracker-auditor`, `entitlement-validator` |
| SEARCH-WO-01..05 (Search) | `hub-shell-detector`, `performance-profiler`, `seo-audit` |
| SITE-WO-01..07 (Public Site) | `seo-audit`, `performance-profiler`, `banned-term-scanner`, `live-demo-detector` |
| STUDIO-UI-01..18 (Studio UI) | `export-fidelity-validator`, `authoring-core-schema-validator`, `hub-shell-detector`, `design-audit-suite` |
| MOBILE-WO-01..08 (Mobile) | `mobile-parity-checker`, `mobile-module-key-validator`, `signal-color-doctrine-checker` |
| TAURI-WO-01..03 (Tauri) | `env-validator`, `smoke-test-suite`, `build-gate` |
| PWA-WO-01..03 (PWA) | `smoke-test-suite`, `performance-profiler`, `e2e-test-runner` |
| Any UI work | `design-lock-enforcer`, `token-drift-scanner`, `banned-term-scanner` |
| Any data work | `data-integrity-suite`, `provenance-checker` |
| Pre-launch | `build-gate`, `smoke-test-suite`, `test-runner-suite`, `proof-pack` |

**Rule:** No WO is DONE until its corresponding skill(s) pass with 0 failures. If a skill doesn't exist for what you need, note it in the build tracker and proceed with manual verification.

---

## §1.1 — MANDATORY POST-PASS AUDIT (PERMANENT RULE)

**Context:** Prior agents filed false PASS reports by narrowing scope, self-grading, and skipping verification. This rule exists to prevent that permanently.

**DOUBLE-AGENT VERIFICATION PROTOCOL:**

1. The agent that BUILDS the code is **PROHIBITED** from writing "PASS", "DONE", "COMPLETE", or "✅" for their own work in any doc.
2. After completing any WO or sub-task, the agent MUST run the corresponding verification skill(s) from `/.claude/skills/`.
3. Skill output must be captured as a JSON artifact in `SOCELLE-WEB/docs/qa/verify_<WO_ID>_<timestamp>.json`.
4. If any skill returns FAIL → fix the failures → re-run the skill → repeat until 0 failures.
5. Only after skill verification produces 0 failures can the WO be marked DONE.

**Verification JSON format:**
```json
{
  "wo_id": "WO-ID",
  "timestamp": "ISO-8601",
  "skills_run": ["skill-name"],
  "results": { "skill-name": { "status": "PASS|FAIL", "failures": [], "evidence": "" } },
  "overall": "PASS|FAIL"
}
```

**PROHIBITED SELF-CERTIFICATION PATTERNS (these are now STOP CONDITIONS):**
- Writing "PASS — correctly scoped to portals" to exempt known violations
- Claiming "comments only" without running the actual grep
- Marking "COMPLETE" without a verification JSON in `docs/qa/`
- Creating exemption rules in build_tracker.md (e.g., "do not clean those without a dedicated audit WO") without owner approval
- Passing `build-gate` as a proxy for design compliance (build-gate checks tsc+build, NOT tokens)

**Required verification by work type:**

| Work Type | Verification Skills (run ALL) |
|-----------|-------------------------------|
| Token/design changes | `token-drift-scanner` → `design-audit-suite` → `design-lock-enforcer` |
| Data pattern migration | `dev-best-practice-checker` → `hook-consolidator` |
| Dependency changes | `dependency-scanner` → `build-gate` |
| Any page edit | `hub-shell-detector` → `live-demo-detector` |
| Any DB change | `rls-auditor` → `schema-db-suite` → `migration-validator` |
| Test writing | `test-runner-suite` → `e2e-test-runner` |
| Pre-completion of any WO | `build-gate` → `banned-term-scanner` → `proof-pack` |

---

## §2 — CURRENT STATE (FROZEN — DO NOT TOUCH)

| Milestone | Status |
|-----------|--------|
| V2-TECH (7/7) | ✅ FROZEN — React 19.2.4, Vite 6.4.1, TS strict, TanStack Query v5, Playwright, types regen |
| V2-COMMAND (3/3) | ✅ FROZEN — governance docs aligned |
| V3 Phase 0 (4/4) | ✅ FROZEN — CMS Architecture, Content Model, Journey Standards, Build Plan |
| BUILD 0 — Control Plane (CTRL-WO-01..04) | ✅ COMPLETE — commits cfa6f74, 6da673f, 8556d86, eee5ffc |
| BUILD 0 — Foundation (FOUND-WO-01..15) | ✅ COMPLETE — verified 2026-03-09 |
| BUILD 3 — Growth (MKT/BOOK/BRAND/PROF/NOTIF) | ✅ COMPLETE — commits ba59f01, 6a70c5c, 4c7ae53 |

**DO NOT** resume, extend, or create new V2-TECH or V2-COMMAND WOs.

---

## §3 — ACTIVE EXECUTION PRIORITY

Execute WOs in this order. Complete each before starting the next. Check `SOCELLE_MASTER_BUILD_WO.md` and `OPERATION_BREAKOUT.md` for full scope and acceptance criteria.

**Current queue:**

**IMMEDIATE (active debt — fix before any new WO):**
- **DEBT-6** (`useIntelligence.ts:193` tier filter bypassed for mock data) — P0, free-tier users see Pro signals in demo mode. Fix: apply `allowedTiers` filter to mock path. Verify with `live-demo-detector`.
- **DEBT: 6 raw useEffect+supabase components** — `CostsView`, `MixingRulesView`, `ProProductsView`, `RetailProductsView`, `SpaMenusView`, `brand/Products.tsx`. Replace with `useQuery`. Verify with `dev-best-practice-checker`.
- **DEBT: Sentry removal** — remove `@sentry/react`, `@sentry/vite-plugin`, `Sentry.init()`, `SentryUserContext`, `captureException` from codebase. Verify with `dependency-scanner`.
- **DEBT: 2,027 `pro-*` tokens in portals** — admin/business/brand/components. Replace with Pearl Mineral V2 equivalents. Verify with `token-drift-scanner` → `design-audit-suite`.

**BUILD 0 — COMPLETE ✅**
- CTRL-WO-01..04: Feature flags, API kill-switch, audit log, entitlement chain — all done
- FOUND-WO-01..15: Foundation — all done

**BUILD 1 (current — next priority):**
1. **INTEL-WO-01..11** — Wire 14 intelligence modules to live data, signal table, opportunity engine, AI toolbar, cross-hub actions. Skills: `intelligence-hub-api-contract`, `intelligence-module-checker`, `ai-service-menu-validator`
2. **FEED-WO-01..05** — pg_cron hourly schedule, 37 feeds verified, deduplication, DLQ, feed health monitoring. Skills: `feed-pipeline-checker`, `pg-cron-scheduler-validator`, `dlq-system-checker`
3. **PAY-WO-01..05** — Credit deduction end-to-end test, balance in nav, overage blocking, affiliate tracking, Stripe webhook. Skills: `stripe-integration-tester`, `credit-deduction-integration-tester`

**BUILD 2 (after BUILD 1):**
4. **CRM-WO-01..12** — Full CRM with rebooking engine, consent audit log, intelligence tab
5. **EDU-WO-01..10** — Education hub with Authoring Core integration, quiz, CE credit tracking
6. **SALES-WO-01..08** — Sales pipeline, ProposalBuilder full states, opportunity engine
7. **COMMERCE-WO-01..07** — Commerce hub, affiliate badges, FTC compliance
8. **AUTH-CORE-01..06** — Document model, 17 block types, versioning, PDF export, permissions
9. **ADMIN-WO-01..05** — System health dashboard, feature flag UI, audit log viewer, shell matrix

**BUILD 3 — COMPLETE ✅**
- MKT-WO-01..05, BOOK-WO-01..05, BRAND-WO-01..05, PROF-WO-01..05, NOTIF-WO-01..05 — all done

**BUILD 4 (after BUILD 2):**
10. **INGR-WO-01..06** — Ingredients directory, detail, formulary builder, intelligence linking, supplier, export
11. **JOBS-WO-01..06** — Job board, apply flow, employer dashboard, intelligence linking, salary benchmarks, mobile
12. **EVT-WO-01..06** — Event directory, detail, registration, host dashboard, intelligence linking, mobile
13. **RESELL-WO-01..05** — Reseller application, commission dashboard, referral links, distributor intelligence, payout reporting
14. **SEARCH-WO-01..05** — pgvector, site-wide search bar, /search page, semantic search, search analytics
15. **SITE-WO-01..07** — /for-brands and /professionals live wire, /plans Stripe connect, SEO final, Core Web Vitals, banned terms sweep, A/B test infra
16. **STUDIO-UI-01..18** — Full Studio canvas editor, templates, data binding, SCORM, collaboration, brand kit, export engine

**BUILD 5 (after BUILD 4):**
17. **MOBILE-WO-01..08** — Flutter parity for all Build 4 hubs + push notifications + full parity audit
18. **TAURI-WO-01..03** — Desktop shell, native integrations, auto-update
19. **PWA-WO-01..03** — PWA manifest + install, service worker + offline, web push

**True shell remediation (woven into BUILD 1/2):**
- Public content shells (Protocols, Education, BlogPostPage, CoursePlayer, ApiDocs, ApiPricing) → INTEL-WO-01 / BUILD 1
- Admin tool shells (IntelligenceDashboard, RegionManagement, ReportsLibrary) → ADMIN-WO-03..05 / BUILD 2
- Business portal shells (BenchmarkDashboard, LocationsDashboard, CECredits) → BUILD 2
- Brand shells (BrandAIAdvisor, IntelligencePricing) → already in BUILD 3 BRAND-WO-04/05

**DO NOT** start BUILD 1 app WOs while active DEBT items remain. Phase order is non-negotiable.

---

## §4 — CRITICAL DEBT (FIX BEFORE NEW WOs)

**Verified 2026-03-08 by independent audit.** These issues exist NOW. Prior agents claimed some were done — they were not.

1. **`font-serif` violations: 0 in live `src/`** — ✅ Actually fixed. Confirmed 0 in SOCELLE-WEB/src/. Old violations exist only in `.archive/SOCELLE-WEB-1/` (146 refs) which is dead code.
2. **2,027 legacy `pro-*` Tailwind token usages in portals** — admin (748), business (587), brand (288), components (377), layouts (26). Public pages are clean (0). Prior agents claimed "correctly scoped to portals" as a PASS — **this was a false exemption**. ALL `pro-*` tokens must be replaced with Pearl Mineral V2 equivalents. See `ULTRA_DRIVE_PROMPT.md` §3 for the token replacement map.
3. **6 components using raw `useEffect` + `supabase.from()` instead of TanStack Query** — ⚠️ Re-verified 2026-03-09 by automated grep audit (artifact: `docs/qa/verify_tanstack_audit_20260309T120000Z.json`). Original estimate of 79 was pre-migration. Session 48 Ultra Drive migrated 73 pages. 6 remain: `components/CostsView.tsx`, `components/MixingRulesView.tsx`, `components/ProProductsView.tsx`, `components/RetailProductsView.tsx`, `components/SpaMenusView.tsx`, `pages/brand/Products.tsx`. All are simple SELECT patterns needing useQuery replacement. See artifact for suggested hooks.
4. **Sentry fully wired as production dependency** — `@sentry/react` + `@sentry/vite-plugin` in package.json, `Sentry.init()` in main.tsx, SentryUserContext in App.tsx, captureException in ErrorBoundary.tsx, Sentry Vite plugin + vendor chunk + CSP allowlist in vite.config.ts. Must be completely removed.
5. **2 unit tests and 4 E2E tests** for 220 pages — functionally untested.

**Active corrective sprint:** `ULTRA_DRIVE_PROMPT.md` — 5 parallel lanes addressing all 5 items above.

Run `design-audit-suite`, `token-drift-scanner`, `dev-best-practice-checker`, `dependency-scanner`, and `test-runner-suite` after fixing to verify.

---

## §4.1 — SCRIPT-DISCOVERED DEBT (2026-03-09, `npm run shell:check / fakelive:check / routes:check`)

**Source:** Live repo scan. `routes:check` PASSED (267 routes clean). Two scripts returned failures.

### DEBT-6: fakelive:check FAIL — Tier filter bypassed for mock data (P0 — blocks launch gate §16 item 8)

**File:** `src/lib/intelligence/useIntelligence.ts:193`
**Violation:** `if (!isLive) return rawSignals;` — when `isLive=false`, the mock signal array skips tier-visibility filtering entirely. Free-tier users in demo mode see Pro/Enterprise signals they should not see.
**Fix:** Apply the same `allowedTiers` filter to mock data path, OR ensure mock signals all carry `tier_visibility: 'free'` so the filter below is correct regardless. Do NOT remove the guard — fix the data contract.
**Maps to:** FOUND-WO-13 (LIVE/DEMO enforcement at component level) in OPERATION_BREAKOUT.md
**Verification skill:** `live-demo-detector`

### DEBT-7: shell:check — 51 shells remain (18.8%), gate passed but launch requires 0

**Breakdown verified 2026-03-09. shell:check gate passed (no new regressions vs baseline of 65). 14 fixed this session. 51 remain.**

**Category A — False positives (21 pages): Detector needs exemption list, NOT code changes**

These pages are transactional flows (auth forms, commerce checkout) that legitimately have no `live_data`, empty state, or CRUD. They MUST NOT be modified per CLAUDE.md §B (NEVER MODIFY).

| Hub | Pages | Reason |
|-----|-------|--------|
| public (14) | Login flows (ForgotPassword, ResetPassword), Cart/Checkout/ShopCart/ShopCheckout/ShopOrders/ShopProduct/ShopWishlist/ShopOrderDetail/WishlistPage/OrderDetail/OrderHistory/ProductDetail | Auth + commerce transactional pages |
| brand (2) | Login, ApplicationReceived | Auth + confirmation pages |
| business (4) | Login, OnboardingWelcome/Role/Interests/Complete | Auth + onboarding wizard steps |
| admin (1) | AdminLogin | Auth page |

**Action:** Add `shell:exempt` annotation comment or exemption list to `scripts/shell-detector.mjs` covering these 21 files. Maps to **FOUND-WO-04** (Shell Detector CI gate).

**Category B — Detector false positives (7 CMS admin pages): Pattern recognition gap**

CmsDashboard, CmsPagesList, CmsPostsList, CmsBlockLibrary, CmsMediaLibrary, CmsSpacesConfig, CmsTemplatesList — all wired to Supabase via TanStack `useQuery` but the shell detector's `live_data` heuristic does not match the `useQuery`/`useCmsPages`/`useCmsPosts` hook naming pattern.

**Action:** Extend shell detector's `live_data` detection to include `useQuery`, `useCms*`, `useAdmin*` hook patterns. Maps to **FOUND-WO-04**.

**Category C — True shells requiring WOs (23 pages)**

| Priority | Hub | Pages | Gap |
|----------|-----|-------|-----|
| HIGH | public | Protocols.tsx, Education.tsx, BlogPostPage.tsx, CoursePlayer.tsx, Insights.tsx (orphan — W10-04), ApiDocs.tsx, ApiPricing.tsx | Missing live data wire, error/empty/loading states |
| HIGH | admin | IntelligenceDashboard.tsx, RegionManagement.tsx, ReportsLibrary.tsx | Full stubs — WOs needed |
| HIGH | admin/brand-hub | HubEducation.tsx, HubProtocols.tsx | Full stubs — admin brand-hub sub-pages |
| MED | business | BenchmarkDashboard.tsx, LocationsDashboard.tsx, CECredits.tsx | Missing live data + all states |
| MED | business/studio | StudioHome.tsx, CourseBuilder.tsx | Missing error state + live data signal |
| MED | brand | BrandAIAdvisor.tsx, IntelligencePricing.tsx | Full feature gap — WOs needed |
| LOW | education | QuizPlayer.tsx | Missing error/empty state |
| LOW | sales | ProposalBuilder.tsx | Missing loading/error/empty states |

**Remediation order by launch impact:**
1. Fix Insights.tsx (orphan redirect, 15 min) → maps to W10-04
2. Wire Protocols.tsx + Education.tsx + BlogPostPage.tsx to live DB (already have tables) — maps to **INTEL-WO-01** / **FEED-WO-02**
3. Add error/loading/empty to CoursePlayer, QuizPlayer, ProposalBuilder — maps to **FOUND-WO-07**
4. Build IntelligenceDashboard, RegionManagement, ReportsLibrary, HubEducation, HubProtocols as proper WOs — maps to **ADMIN-WO-03/04/05**
5. Build BrandAIAdvisor, IntelligencePricing — dedicated WOs needed

**Shell count projection after Category A + B fixes (detector only): 51 → ~23 true shells remaining.**

### DEBT-8: Shell detector scoring is overly strict for non-content page types

The detector applies identical scoring (live_data + demo_labeled + empty + error + loading + crud + export) to:
- Auth pages (never have live_data/crud/export by design)
- Commerce transactional pages (NEVER MODIFY — exempt)
- Onboarding wizards (multi-step forms, not data pages)

**Action:** Add `page_type` classification to detector (content | auth | commerce | wizard | admin-tool). Apply scoring only to `content` and `admin-tool` types. Reduces false-positive noise and makes the gate meaningful. Maps to **FOUND-WO-04**.

---

## §5 — TECH STACK (LOCKED)

| Package | Version | Notes |
|---------|---------|-------|
| React | 19.x | FROZEN — do not downgrade |
| Vite | 6.x | FROZEN |
| TypeScript | 5.5 strict | `noExplicitAny = true` |
| TanStack Query | v5 | ALL data fetching — no raw `useEffect` for server data |
| Tailwind | 3.4 | Tailwind 4 DEFERRED until pro-* tokens fully removed |
| Supabase | JS 2.57+ | RLS on every table |
| Playwright | Latest | E2E smoke tests required |
| Observability | Admin Hub dashboards + logs | NOT Sentry |

**Runtime:** React + Vite (SPA). Next.js is NOT the core runtime.

---

## §6 — DESIGN SYSTEM (Pearl Mineral V2 — ENFORCED)

| Token | Value | Usage |
|-------|-------|-------|
| background | `#F6F3EF` | Page backgrounds |
| graphite | `#141418` | Primary text |
| accent | `#6E879B` | Interactive, links |
| accent-hover | `#5A7185` | Hover |
| accent-soft | `#E8EDF1` | Soft panels |
| signal-up | `#5F8A72` | Positive |
| signal-warn | `#A97A4C` | Caution |
| signal-down | `#8E6464` | Negative |

**BANNED:** `font-serif` on public pages, hardcoded hex outside tokens, `pro-*` / `brand-*` / `natura-*` / `intel-*` / `edu-*` legacy tokens, Bootstrap/Material default blue.

---

## §7 — ANTI-SHELL RULE (NO SHELLS, EVER)

Every hub must have ALL 10:

1. Create action → DB row
2. Library view with sort/filter/search
3. Detail view from DB
4. Edit + Delete with RLS
5. Permissions (RLS + ModuleRoute + TierGuard)
6. Intelligence input (signal can spawn/update object)
7. Proof/metrics dashboard with real data
8. Export (CSV minimum, PDF for Pro+)
9. Error/empty/loading states (premium quality)
10. Observability (errors visible in Admin Hub)

If you detect a shell, **HALT** and raise a WO.

---

## §8 — LIVE vs DEMO

- **LIVE:** Backed by DB with verifiable `updated_at` + provenance
- **DEMO:** Clearly labeled DEMO to user
- **MOCK (unlabeled):** FORBIDDEN in any user-facing surface

All hooks use `isLive` pattern. Run `live-demo-detector` skill to verify.

---

## §9 — STOP CONDITIONS (HALT IMMEDIATELY)

1. Shell page about to ship
2. Secrets in committed code
3. PAYMENT_BYPASS=true in committed env
4. Banned term in user-facing copy
5. `font-serif` on public pages
6. Intelligence-first IA violated (commerce elevated above intelligence)
7. CMS table without RLS
8. PageRenderer skips `status = published` check
9. Hardcoded content on CMS-backed surface
10. Build or tsc fails
11. **Self-certification without verification skill run** — agent writes PASS/DONE without corresponding `docs/qa/verify_*.json`
12. **Scope narrowing to avoid failure** — agent redefines what "done" means to exclude known violations (e.g., "scoped to portals" exemption)
13. **Raw `useEffect` + `supabase.from()` in new code** — all new data fetching MUST use TanStack Query

---

## §10 — OBSERVABILITY

All observability is via **Admin Hub dashboards and CMS Hub publish/route health**.

- **No external Sentry dashboards.** Remove any Sentry references from new code.
- Error logging, key events, and content freshness are surfaced through Admin Hub internal tools.
- Every error should be catchable and visible in Admin Hub logs.

---

## §11 — ONE-TURN EXECUTION RULES

- **One turn = one WO** (or one sub-task of a WO). Don't try to do everything at once.
- **Don't re-read the full build tracker** every turn — read lines 1-50 for current state, then execute.
- **Append-only updates** to build_tracker.md — update the status line at the top, mark WO complete at the bottom.
- **No new planning docs** — all plans live in `build_tracker.md` or existing command docs.
- **No status summaries** — just build.

---

## §12 — COMMERCE BOUNDARY

Commerce is a **module**, never the IA backbone:
- No "Shop" as primary nav
- No "Shop Now" / "Buy Now" as main CTA on Intelligence pages
- All commerce routes gated (auth + tier)
- FTC-compliant "Commission-linked" badges on affiliated recommendations

---

## §13 — AI SAFETY

- Guardrails between LLM and user
- "Generated by AI" on every AI output
- Expandable "Evidence & Logic" panel with sources
- Hard block: dosing, diagnoses, prescriptions
- Provider override requires NPI + scope_of_practice + logged rationale
- Logs suitable for insurance/legal review

---

## §14 — ACQUISITION BOUNDARY

- No cold email, DM sequences, or outreach content
- `send-email` is transactional only (auth, receipts, briefs)
- Acquisition via on-platform flows (public pages → request access → app)

---

## §15 — MULTI-PLATFORM STRATEGY

- **Web:** React + Vite (source implementation)
- **Desktop:** Tauri shell wrapping same React+Vite build (no Rust business logic)
- **Mobile:** Flutter using same Supabase API contracts + edge functions (no TS FFI)
- **Shared:** Supabase schema, RLS, edge functions, design tokens

---

## §16 — LAUNCH NON-NEGOTIABLES (24 items)

Before first paying subscriber, ALL must pass:

1. `npx tsc --noEmit` → Exit 0
2. `npm run build` → Exit 0
3. `/` routes to Intelligence home
4. Errors visible in Admin Hub
5. TanStack Query on all data fetching
6. PAYMENT_BYPASS = false in production
7. 0 font-serif on public pages
8. 0 banned terms on public pages
9. Stripe webhooks functional
10. Signals fresh (≥5 rows < 24h)
11. AI briefs: 10 tests with 0 hallucinations
12. SEO baseline complete
13. database.types.ts matches migrations
14. Credits deduct correctly
15. Affiliate links show FTC badges
16. Playwright smoke tests pass
17. hub-shell-detector returns 0 for ALL hubs
18. CMS renders only status=published content
19. 0 `pro-*` token usages anywhere in `src/` (portals included)
20. 0 Sentry references in `src/`, `vite.config.ts`, `package.json`
21. ≥20 unit tests passing (`npm run test`)
22. ≥10 E2E Playwright tests passing (`npm run e2e`)
23. 0 pages using raw `useEffect` + `supabase.from()` without TanStack Query
24. Verification JSONs exist in `docs/qa/` for every completed WO

---

*Quality and revenue outrank time. Nothing ships average. Intelligence platform first. Always.*
