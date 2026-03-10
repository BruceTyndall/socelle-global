# OPERATION BREAKOUT v2 — CORRECTED MASTER PLAN
# SOCELLE GLOBAL — The Single Source of Truth
# Generated: March 8, 2026 | All owner decisions locked
# Commit to: docs/operations/OPERATION_BREAKOUT.md
# Also paste key sections into Claude Code session prompts

> **CORRECTION LOG (2026-03-08 — independent audit against live repo)**
>
> All corrections below were verified by running actual commands against the SOCELLE-WEB repo. Items marked `(corrected 2026-03-08)` in the doc body were changed from the original draft.
>
> **Inventory fixes (8 metrics corrected):**
> Pages 220→266, Components 99→155, Routes 241→288, ModuleRoute 64→76, Edge functions 30→31, Migrations 150→153, Skills 51→97, font-serif 202→0 (already purged). LIVE 114→137, SHELL 106→129, Shell rate recalculated to 48.5%.
>
> **Infrastructure status fixes (4 items corrected):**
> - INFRA-01: Server-side credit check changed NOT PRESENT→VERIFIED (deduct_credits RPC exists at ai-orchestrator line 371)
> - INFRA-03: ErrorBoundary changed UNKNOWN→VERIFIED (ErrorBoundary.tsx exists, wraps App)
> - INFRA-06: deduct_credits RPC changed UNKNOWN→VERIFIED (migration 20260228000001 creates it)
> - INFRA-06: Server-side credit check changed NOT PRESENT→VERIFIED (same as INFRA-01)
> - INFRA-06: creditConstants.ts renamed to creditGate.ts (correct filename)
>
> **WO scope adjustments (2 WOs reduced):**
> - FOUND-WO-02: Server-side credit check already exists → scope reduced to verification + integration test
> - FOUND-WO-06: font-serif already 0 → scope reduced to CSS variable font system only
>
> **FIX section updates (2 fixes partially complete):**
> - FIX 3: Server-side credit enforcement already implemented
> - FIX 7: font-serif purge already complete, only CSS variable system remains

---

## OWNER DECISIONS (ALL LOCKED — DO NOT RE-ASK)

| # | Decision | Answer |
|---|----------|--------|
| 1 | Session 49 code | All app code committed to main. 47 uncommitted = reports/docs (gitignore) |
| 2 | Worktrees | All agents on main directly. No worktrees. |
| 3 | Mobile timing | Build mobile per-hub as each web hub completes |
| 4 | Home page | PrelaunchQuiz stays on `/`. Build secondary Intelligence Home at `/home`. Owner toggles when ready. |
| 5 | Sentry | Skip. Use Admin Hub health dashboard for observability. |
| 6 | Font strategy | ~~202 font-serif~~ → **0 in src/** (already purged). Remaining work: build universal font system (CSS variable-based) so fonts are swappable without touching component code. |
| 7 | Rate limits | 5/min Starter, 15/min Pro, 60/min Enterprise. Enforced server-side in ai-orchestrator edge function. Sliding window on user.id via Supabase table. No Redis needed. |
| 8 | Studio timing | Minimal Studio (block editor only) moves to Build 2 with Education |
| 9 | Admin Hub | Polish now. System health dashboard + feature flags + audit log. |
| 10 | Plan location | Both — commit to repo AND paste key sections in prompts |
| 11 | Intelligence gating | Always accessible. Tier limits signal count. Not module-gated. |
| 12 | Feature flags | Full feature flag system with per-user targeting and gradual rollout |

---

## INVENTORY REPORT (generated from repo scan — canonical numbers)

**Command used:** `find`, `grep -c`, `ls | wc -l` against live SOCELLE-WEB/ and SOCELLE-MOBILE-main/

| Metric | Count | Evidence | Status |
|--------|-------|----------|--------|
| Web pages | 266 | `find src/pages -name "*.tsx" \| wc -l` | VERIFIED (corrected 2026-03-08) |
| Web components | 155 | `find src/components -name "*.tsx" \| wc -l` | VERIFIED (corrected 2026-03-08) |
| Web routes | 288 | `grep -c 'path=' src/App.tsx` | VERIFIED (corrected 2026-03-08) |
| ModuleRoute wrappers | 76 | `grep -c "ModuleRoute" src/App.tsx` | VERIFIED (corrected 2026-03-08) |
| Hooks | 75 | `find src -name "use*.ts" -o -name "use*.tsx" \| wc -l` | VERIFIED |
| Edge functions | 31 | `ls supabase/functions/ \| wc -l` | VERIFIED (corrected 2026-03-08) |
| Migrations | 153 | `ls supabase/migrations/ \| wc -l` | VERIFIED (corrected 2026-03-08) |
| Unit test files | 11 | Owner confirmed: 86 tests, all passing | VERIFIED |
| E2E spec files | 9 | Owner confirmed: smoke, auth, routes, intelligence, ai-flow, navigation, seo, accessibility, design-compliance | VERIFIED |
| CMS files | 37 | Session 49 audit | VERIFIED (owner confirmed code committed) |
| Mobile dart files | 180 | `find lib -name "*.dart" \| wc -l` | VERIFIED |
| Mobile screens | 67 | `find lib -name "*screen*" -o -name "*page*" \| wc -l` | VERIFIED |
| Mobile module gates | 8 | grep MODULE_ in module_access.dart | VERIFIED |
| LIVE pages (has DB query) | 137 | grep for useQuery/supabase.from in pages | VERIFIED (corrected 2026-03-08) |
| SHELL pages (no DB query) | 129 | inverse of LIVE count | VERIFIED (corrected 2026-03-08) |
| Shell rate | 48.5% | 129/266 | VERIFIED (corrected 2026-03-08) |
| font-serif instances | 0 | `grep -rn font-serif src/` — **all 202 already purged from src/** | VERIFIED (corrected 2026-03-08) |
| Banned terms on public pages | 17 | grep for banned terms | VERIFIED |
| Payment bypass | defaults false | `cat src/lib/paymentBypass.ts` | VERIFIED |
| Installed skills | 97 | `find .claude/skills -name SKILL.md` | VERIFIED (corrected 2026-03-08) |

**Corrected 2026-03-08:** Original inventory used stale counts. All numbers above re-verified against live repo by independent audit. Regenerate before each build using the commands above.

---

## SHARED INFRASTRUCTURE STATUS (VERIFIED / UNKNOWN / INTENDED)

### INFRA-01: Auth + Roles + Entitlements
| Item | Status | Evidence |
|------|--------|----------|
| Supabase Auth | VERIFIED | `supabase.ts` exists, auth context wraps app |
| ModuleRoute (76 routes gated) | VERIFIED | `grep -c ModuleRoute src/App.tsx` = 76 (corrected 2026-03-08) |
| useModuleAccess hook | VERIFIED | File exists, reads from ModuleAccessContext |
| UpgradePrompt on !hasAccess | VERIFIED | ModuleRoute.tsx renders UpgradePrompt |
| TierGate component | VERIFIED | Tests exist (4 tests, passing) |
| CreditGate component | VERIFIED | Tests exist (useCreditBalance: 3 tests, passing) |
| PaywallGate component | VERIFIED | Referenced in codebase |
| subscription_plans.modules_included | UNKNOWN | Table exists per migrations, but column shape not confirmed via live DB query |
| RLS policies on subscription tables | UNKNOWN | Migrations exist but RLS correctness not verified against live DB |
| Server-side credit check in ai-orchestrator | VERIFIED | ai-orchestrator calls `deduct_credits()` RPC at line 371 with atomic row-level locking, returns 402 on insufficient balance. Cost reconciliation at lines 440-451. (corrected 2026-03-08) |
| Rate limiting in ai-orchestrator | **NOT PRESENT** | No rate limit check exists — MUST BUILD |

### INFRA-02: Data + API + Query Patterns
| Item | Status | Evidence |
|------|--------|----------|
| Supabase client | VERIFIED | `src/lib/supabase.ts` exists |
| TanStack Query v5 | VERIFIED | package.json shows 5.90.21 |
| 75 hooks in TanStack pattern | VERIFIED | All admin pages migrated per Session 49 |
| database.types.ts | UNKNOWN | File exists but freshness vs 150 migrations not confirmed |

### INFRA-03: Observability
| Item | Status | Evidence |
|------|--------|----------|
| Sentry | **SKIPPED** (owner decision) | Use Admin Hub health dashboard instead |
| logger.ts | VERIFIED | 8 tests passing |
| Error boundaries | VERIFIED | ErrorBoundary.tsx exists in src/, wraps App in main.tsx (corrected 2026-03-08) |

### INFRA-04: QA Automation
| Item | Status | Evidence |
|------|--------|----------|
| Vitest (11 files, 86 tests) | VERIFIED | Owner confirmed committed and passing |
| Playwright (9 E2E specs) | VERIFIED | Owner confirmed committed |
| Shell detection in CI | **NOT PRESENT** | No automated shell scanner — MUST BUILD |
| Token/placeholder validator in CI | **NOT PRESENT** | asset-validator skill exists but not in CI pipeline |

### INFRA-05: Feed Pipeline
| Item | Status | Evidence |
|------|--------|----------|
| feed-orchestrator edge function | VERIFIED | File exists, reads data_feeds + writes market_signals |
| ingest-rss edge function | VERIFIED | File exists |
| rss-to-signals edge function | VERIFIED | File exists, promotes at confidence >= 0.50 |
| pg_cron hourly schedule | UNKNOWN | Edge function exists but cron job not verified in live DB |
| 37 feeds in data_feeds table | UNKNOWN | Table exists per migrations, row count not verified |
| Deduplication logic | **NOT PRESENT** | No dedup in rss-to-signals — MUST BUILD |
| Dead letter queue | **NOT PRESENT** | No DLQ table or logic — MUST BUILD |

### INFRA-06: AI Orchestrator + Safety
| Item | Status | Evidence |
|------|--------|----------|
| ai-orchestrator edge function | VERIFIED | File exists |
| 9 AI engines | VERIFIED | 9 files in src/lib/analysis/ |
| guardrails.ts | VERIFIED | 15 tests passing |
| credit_ledger table | VERIFIED | Per migrations |
| useCreditBalance hook | VERIFIED | Tests passing (3 tests) |
| creditGate.ts | VERIFIED | ENGINE_CREDIT_COSTS map exists (file is `creditGate.ts`, not `creditConstants.ts` — corrected 2026-03-08) |
| deduct_credits RPC | VERIFIED | Exists in migration `20260228000001_create_tenant_balances_and_credit_deduction.sql`. Called by ai-orchestrator at line 371. (corrected 2026-03-08) |
| Server-side credit check | VERIFIED | ai-orchestrator calls `deduct_credits()` RPC with atomic row-level locking before model call. Returns 402 on insufficient balance. (corrected 2026-03-08) |
| Rate limiting (5/15/60) | **NOT PRESENT** | No rate limit in edge function — MUST BUILD |
| Rate limit table (sliding window) | **NOT PRESENT** | Need ai_rate_limits table + check logic |

### INFRA-07: CMS + Media + Editorial
| Item | Status | Evidence |
|------|--------|----------|
| CMS tables (cms_pages, cms_posts, cms_blocks, cms_spaces, cms_templates, cms_assets) | VERIFIED | V2-CMS-01 complete |
| 14 block components | VERIFIED | Session 49 audit |
| 13 CMS hooks | VERIFIED | Session 49 audit |
| 7 CMS admin pages | VERIFIED | TanStack migrated |
| PageRenderer | VERIFIED | Session 49 audit |
| media_library table | VERIFIED | Per migrations |

### INFRA-08: Search
| Item | Status | Evidence |
|------|--------|----------|
| pgvector extension | UNKNOWN | generate-embeddings edge function exists but extension activation not verified |
| generate-embeddings edge function | VERIFIED | File exists |
| Unified search UI | **NOT PRESENT** | No site-wide search bar — MUST BUILD |

### INFRA-09: Payments + Credits
| Item | Status | Evidence |
|------|--------|----------|
| Stripe 8.9.0 | VERIFIED | In package.json |
| create-checkout edge function | VERIFIED | File exists, writes to subscriptions |
| stripe-webhook edge function | VERIFIED | File exists |
| PaywallGate | VERIFIED | Component exists |
| PAYMENT_BYPASS defaults false | VERIFIED | `cat src/lib/paymentBypass.ts` confirmed |
| Affiliate link tracking | **NOT PRESENT** | No affiliate_clicks table or wrapper — MUST BUILD |
| distributor_mappings table | UNKNOWN | Referenced in plans but not verified |

---

## ADVISOR-REQUIRED FIXES (7 non-negotiable changes)

### FIX 1: Generated Inventory Report Artifact
**What:** Create `SOCELLE_GLOBAL_INVENTORY_REPORT.md` generated by script, checked into repo, regenerated before each build.
**How:** Script runs the `find`/`grep` commands from the inventory table above, outputs markdown.
**WO:** INFRA-WO-11

### FIX 2: Shell Detector CI Gate
**What:** Automated shell detection that blocks merges. A route is a shell if: no DB query, no CRUD, no empty/error/loading states.
**How:** Skill + script that scans all page files, classifies LIVE/DEMO/SHELL, fails CI if new shells introduced.
**WO:** INFRA-WO-12

### FIX 3: Server-Side Credit Enforcement — **ALREADY IMPLEMENTED** (corrected 2026-03-08)
**What:** ai-orchestrator already checks credit balance and deducts BEFORE calling OpenRouter. `deduct_credits()` RPC at line 371 with atomic row-level locking. Returns 402 on insufficient balance. Cost reconciliation at lines 440-451 corrects estimate vs actual after model call.
**Remaining work:** Add integration test to verify the flow end-to-end. Verify overage handling (0 credits → 402 → UI shows upgrade CTA).
**WO:** FOUND-WO-02 (scope reduced to verification + test)

### FIX 4: Rate Limiting in ai-orchestrator
**What:** Tiered rate limits enforced server-side before model call. Sliding window on user.id.
**How:** Create `ai_rate_limits` table (user_id, request_count, window_start). Check in edge function: if count >= tier_limit within 60-second window, return 429.
| Tier | Rate | Burst |
|------|------|-------|
| Starter | 5/min | 5 instant |
| Pro | 15/min | 10 instant |
| Enterprise | 60/min | 30 instant |
**WO:** INFRA-WO-13

### FIX 5: CrossHubActionDispatcher + Signal Action Contract
**What:** One shared component + one data contract for all signal→action flows. Every hub consumes the same dispatcher.
**Signal Action Contract:**
```typescript
interface SignalAction {
  signal_id: string;
  signal_title: string;
  signal_category: string;
  signal_delta: number;
  signal_confidence: number;
  signal_source: string;
  action_type: 'create_deal' | 'add_to_crm' | 'create_campaign' | 'assign_training' | 'price_alert' | 'create_brief' | 'create_alert' | 'add_to_note' | 'create_protocol';
  target_hub: string;
  context?: Record<string, unknown>;
}
```
**How:** Build `CrossHubActionDispatcher` component (right-click menu or action button → dispatches SignalAction → routes to target hub's handler).
**WO:** INFRA-WO-14

### FIX 6: Missing Mobile MODULE_* Keys
**What:** Mobile has 8 module keys. Missing: INTELLIGENCE (N/A — tier-gated per owner decision), BOOKING, BRANDS, JOBS, EVENTS, STUDIO.
**How:** Add MODULE_BOOKING, MODULE_BRANDS, MODULE_JOBS, MODULE_EVENTS, MODULE_STUDIO to mobile module_access.dart + web ModuleRoute usage.
**WO:** INFRA-WO-15

### FIX 7: Universal Font System — **PARTIALLY COMPLETE** (corrected 2026-03-08)
**What:** CSS variable-based font system so fonts can be swapped without touching component code.
**Status:** All 202 font-serif instances already purged from src/ (0 remaining). Only the CSS variable system remains.
**How:** Define `--font-primary`, `--font-display`, `--font-mono` CSS variables. Map Tailwind `font-sans` to `var(--font-primary)`. Change font = change one CSS variable.
**WO:** FOUND-WO-06 (scope reduced to CSS variable system only)

---

## FEATURE FLAG SYSTEM (owner decision: full per-user targeting)

### Architecture
```
feature_flags table:
  id, flag_key, display_name, description,
  default_enabled (bool),
  enabled_tiers (text[]),     -- ['starter', 'pro', 'enterprise']
  enabled_user_ids (uuid[]),  -- per-user override
  rollout_percentage (int),   -- 0-100 for gradual rollout
  created_at, updated_at

Check order:
  1. User override (enabled_user_ids) — highest priority
  2. Tier match (enabled_tiers)
  3. Rollout percentage (hash user_id → bucket)
  4. Default (default_enabled)

UI: Admin → Feature Flags page
  - Toggle per flag
  - Add user IDs for per-user override
  - Slider for rollout percentage
  - Preview: "This flag is ON for 47% of Pro users"

Client hook: useFeatureFlag('FLAG_KEY') → boolean
Edge function check: checkFlag(user_id, 'FLAG_KEY') → boolean
```
**WO:** INFRA-WO-16

---

## FORMAL GROUP MODEL (advisor-corrected)

```
GROUP 0: PRODUCT CONTROL PLANE (turn things on/off safely)
  ├── Entitlements + Module Gating (EXISTS — verify)
  ├── Feature Flags (per user/tier/rollout) — MUST BUILD
  ├── API/Edge Function Controls (health, kill-switch, rate limits) — MUST BUILD
  ├── Content Controls (CMS publish, scheduling, media governance) — EXISTS
  └── Audit Logs (admin actions, AI actions, entitlement changes) — MUST BUILD

GROUP A: FOUNDATION (hard prerequisite — no app work starts without this)
  ├── A1. Data + Contracts: types regen, query conventions, Zod validation
  ├── A2. Enforcement: RLS audit, LIVE/DEMO at component level, secrets/env
  ├── A3. Reliability: feed scheduling, AI guardrails + rate limits, error strategy
  └── A4. Platform QA: shell detection CI gate, Playwright crawl, proof-pack

GROUP B: REVENUE WEDGE (Build 1)
  ├── Intelligence App
  ├── Feed Pipeline App
  ├── Payments + Credits App
  └── Public Site (conversion surfaces)

GROUP C: OPERATOR CORE (Build 2)
  ├── CRM App
  ├── Education App
  ├── Sales App
  ├── Commerce App
  ├── Authoring Core (platform capability — NOT Studio UI)
  └── Admin Hub (health + flags + audit)

GROUP D: GROWTH (Build 3)
  ├── Marketing App
  ├── Booking App
  ├── Brands App
  ├── Professionals App
  └── Notification Engine App

GROUP E: FULL PLATFORM (Build 4)
  ├── Ingredients App, Jobs App, Events App, Reseller App
  ├── Authoring Studio UI (full canvas, templates, collaboration)
  ├── Search Engine App
  └── Public Site polish

GROUP F: MULTI-PLATFORM (Build 5)
  ├── Flutter mobile full parity
  ├── Tauri desktop app
  └── PWA enhancements
```

### AUTHORING SPLIT (advisor-required — removes circular dependency)

| Layer | What | When | Why |
|-------|------|------|-----|
| **Authoring Core** (platform capability) | Document model (JSON schema), blocks system, versioning + publish states, asset binding rules, export primitives (PDF + image), permission model, "embed intelligence" blocks | **Build 2** (with Education) | Education, Marketing, Sales, CMS all depend on this. It's infrastructure, not a hub. |
| **Authoring Studio UI** (app) | Studio home, 3-panel editor, canvas editor (Fabric.js), 50+ templates, collaboration, SCORM builder, data binding to live signals, social image export | **Build 4** (full platform) | This is the Canva-competitor UX. Depends on Authoring Core being solid. |

**This resolves the circular dependency:** Education uses Authoring Core (blocks + versioning + publish) without waiting for Studio UI (canvas + templates + collaboration).

---

## RELEASE BUILDS (updated with Group model + Authoring split)

### BUILD 0: CONTROL PLANE + FOUNDATION (hard gate — NOTHING starts without this)

**Group 0 WOs (Product Control Plane):**

| WO ID | Scope | Status | Gate? |
|-------|-------|--------|-------|
| CTRL-WO-01 | Feature flag system: feature_flags table + admin UI + useFeatureFlag hook + checkFlag in edge fns | NOT PRESENT | GATE |
| CTRL-WO-02 | API kill-switch: per-edge-function disable toggle in admin (is_enabled pattern exists on feeds, extend to all) | INTENDED | GATE |
| CTRL-WO-03 | Audit log table + writer: every admin action, AI action, entitlement change logged | NOT PRESENT | GATE |
| CTRL-WO-04 | Verify entitlements chain: subscription_plans → modules_included → ModuleRoute → UpgradePrompt end-to-end | UNKNOWN | GATE |

**Group A WOs (Foundation):**

| WO ID | Scope | Status | Gate? |
|-------|-------|--------|-------|
| FOUND-WO-01 | Regenerate database.types.ts + verify against 153 migrations | UNKNOWN | GATE |
| FOUND-WO-02 | Server-side credit check in ai-orchestrator — **ALREADY EXISTS** (deduct_credits RPC at line 371). Scope reduced to: verify + add integration test. | VERIFIED (corrected 2026-03-08) | GATE |
| FOUND-WO-03 | Rate limiting in ai-orchestrator (5/15/60, sliding window, Supabase table) | NOT PRESENT | GATE |
| FOUND-WO-04 | Shell Detector: skill + CI gate that blocks merges if new shells introduced | NOT PRESENT | GATE |
| FOUND-WO-05 | CrossHubActionDispatcher + SignalActionContract (shared component) | NOT PRESENT | GATE |
| FOUND-WO-06 | Universal font system (CSS vars). ~~batch purge 202 font-serif~~ — **font-serif already 0 in src/**. Remaining: build CSS variable font system only. | PARTIAL (corrected 2026-03-08) | GATE |
| FOUND-WO-07 | Verify/build EmptyState + ErrorState + LoadingSkeleton shared components | UNKNOWN | GATE |
| FOUND-WO-08 | Purge 17 banned terms from public pages | NOT PRESENT | GATE |
| FOUND-WO-09 | Fix mobile signal colors (match doctrine) | NOT PRESENT | GATE |
| FOUND-WO-10 | Missing mobile MODULE_* keys (BOOKING, BRANDS, JOBS, EVENTS, STUDIO) | NOT PRESENT | GATE |
| FOUND-WO-11 | Generated Inventory Report script (regenerated before each build) | NOT PRESENT | GATE |
| FOUND-WO-12 | Wire pg_cron hourly schedule for feed-orchestrator | UNKNOWN | GATE |
| FOUND-WO-13 | LIVE/DEMO enforcement at COMPONENT level (not just page) | NOT PRESENT | GATE |
| FOUND-WO-14 | Add playwright-report/ to .gitignore + clean stale deletions | Owner requested | Cleanup |
| FOUND-WO-15 | RLS audit: run rls-audit skill, verify policies on all writable tables | UNKNOWN | GATE |

**BUILD 0 GATE CHECK (all must pass):**
```
[ ] CTRL-WO-01 through CTRL-WO-04: ALL DONE
[ ] FOUND-WO-01 through FOUND-WO-15: ALL DONE
[ ] npx tsc --noEmit = Exit 0
[ ] npm run build = Exit 0
[ ] Shell Detector returns current baseline (48.5% — 129/266 — known, tracked)
[ ] Inventory Report generated and committed
[ ] Feature flag system operational (admin can toggle flags)
[ ] Rate limiting tested (curl 6 requests in 60s as Starter → 6th returns 429)
[ ] Credit deduction tested (AI action → balance decreases server-side)
ONLY THEN → proceed to Build 1
```

### BUILD 1: Intelligence + Revenue

**Apps:** Intelligence (#1), Feed Pipeline (#19), Payments + Credits (#20)
**Prerequisite:** BUILD 0 complete
**WO count:** 21

| WO ID | App | Scope | Acceptance Test |
|-------|-----|-------|-----------------|
| INTEL-WO-01 | Intelligence | Wire 14 figma-make-source modules to live data | All 14 render with real market_signals |
| INTEL-WO-02 | Intelligence | Signal Table: sortable, filterable, exportable | Sort/filter/export all work |
| INTEL-WO-03 | Intelligence | Trend Stacks (Recharts, click→filter) | Click bar → table filters |
| INTEL-WO-04 | Intelligence | Opportunity Engine (signal gaps → revenue estimates) | "$X/mo untapped" cards render |
| INTEL-WO-05 | Intelligence | AI toolbar (6 tools, credits deduct server-side) | Each tool: input → output → credits deducted |
| INTEL-WO-06 | Intelligence | Signal detail slide-out (provenance, trend, actions) | Click signal → panel with all sections |
| INTEL-WO-07 | Intelligence | Cross-hub actions via dispatcher | Right-click signal → create deal/CRM/campaign works |
| INTEL-WO-08 | Intelligence | Empty/error/loading on all intel surfaces | All 3 states render correctly |
| INTEL-WO-09 | Intelligence | Mobile: signal cards + detail sheet | Swipeable cards, bottom sheet, AI button |
| INTEL-WO-10 | Intelligence | Saved searches + alerts | Save filter → notification on match |
| INTEL-WO-11 | Intelligence | Build secondary Intelligence Home at /home | /home renders intelligence-focused page |
| FEED-WO-01 | Feed Pipeline | Verify/wire pg_cron hourly schedule | cron.job shows hourly |
| FEED-WO-02 | Feed Pipeline | Verify 37 feeds ingest | 37 rows in data_feeds with recent last_run_at |
| FEED-WO-03 | Feed Pipeline | Deduplication logic | Duplicates detected + skipped |
| FEED-WO-04 | Feed Pipeline | Feed health monitoring + alerting | Failed feeds retry, alert after 3 failures |
| FEED-WO-05 | Feed Pipeline | Dead letter queue | Failed items in DLQ, visible in admin |
| PAY-WO-01 | Payments | Verify credit deduction (server-side from INFRA-WO-05) | AI action → credit_ledger row |
| PAY-WO-02 | Payments | Credit balance in portal nav | "2,147 credits" visible |
| PAY-WO-03 | Payments | Overage blocking with upgrade CTA | 0 credits → tools locked |
| PAY-WO-04 | Payments | Affiliate link wrapper + tracking | URL → tracked affiliate link |
| PAY-WO-05 | Payments | Verify Stripe webhook tier updates | Test webhook → tier updates |

### BUILD 2: Core Experience + Authoring Core + Admin

**Apps:** CRM (#2), Education (#3), Sales (#5), Commerce (#4), **Authoring Core** (platform capability), Admin (#15)
**Prerequisite:** BUILD 1 complete
**WO count:** 50

*(CRM 12 + Education 10 + Sales 8 + Commerce 7 + Authoring Core 4 + Admin 5 + mobile per-hub 4)*

**Authoring Core WOs (platform capability — NOT Studio UI):**

| WO ID | App | Scope | Acceptance Test |
|-------|-----|-------|-----------------|
| AUTH-CORE-01 | Authoring Core | Document model (JSON schema for blocks + metadata + versioning) | Schema validated, documents can be created/read/updated |
| AUTH-CORE-02 | Authoring Core | Block system (17 block types: heading, paragraph, bullets, KPI, signal embed, table, media, CTA, disclaimer, chart, quote, hero, text, image, video, FAQ, testimonial) | All 17 types render via PageRenderer |
| AUTH-CORE-03 | Authoring Core | Versioning + publish states (draft → published → archived) | Save creates version, publish changes status, revert works |
| AUTH-CORE-04 | Authoring Core | Export primitives (PDF + image at minimum) | Document → PDF export works |
| AUTH-CORE-05 | Authoring Core | "Embed intelligence" blocks (bind to signals/benchmarks) | KPI block shows live signal data |
| AUTH-CORE-06 | Authoring Core | Permission model (author, reviewer, publisher roles) | Only publisher can set status to published |

**Admin WOs:**

| WO ID | App | Scope | Acceptance Test |
|-------|-----|-------|-----------------|
| ADMIN-WO-01 | Admin | System health dashboard (live: feeds + AI costs + users + errors) | Dashboard shows real-time data |
| ADMIN-WO-02 | Admin | Feature flag UI (full per-user from CTRL-WO-01) | Toggle flags, user overrides, rollout slider |
| ADMIN-WO-03 | Admin | Audit log viewer (from CTRL-WO-03) | Search who-did-what-when |
| ADMIN-WO-04 | Admin | Shell detection dashboard | Show shell matrix + remediation status |
| ADMIN-WO-05 | Admin | Inventory report viewer | Show generated report |

### BUILD 3: Growth

**Apps:** Marketing (#6), Booking (#7), Brands (#10), Professionals (#9), Notifications (#17)
**Prerequisite:** BUILD 2 complete
**WO count:** 25
**Status:** COMPLETE (commit `ba59f01`, `6a70c5c`, `4c7ae53` — verified 2026-03-09)

**Marketing WOs:**

| WO ID | App | Scope | Acceptance Test |
|-------|-----|-------|-----------------|
| MKT-WO-01 | Marketing | Campaign dashboard: live DB-backed campaign list, KPI strip (impressions, conversions, cost-per-lead) | Campaigns load from DB; KPIs render from aggregated rows |
| MKT-WO-02 | Marketing | Campaign builder wizard (4-step: audience → content → schedule → budget) | Complete wizard → campaign row created in DB |
| MKT-WO-03 | Marketing | Template library (pull from cms_templates where space=marketing) | Templates grid loads, click → wizard pre-populated |
| MKT-WO-04 | Marketing | Analytics + export (channel performance, conversion funnel, CSV export) | Charts load from DB; CSV downloads all campaigns |
| MKT-WO-05 | Marketing | Intelligence linking (signal → Create Campaign via CrossHubActionDispatcher) | Signal right-click → Create Campaign → pre-filled with signal context |

**Booking WOs:**

| WO ID | App | Scope | Acceptance Test |
|-------|-----|-------|-----------------|
| BOOK-WO-01 | Booking | Booking calendar (live from bookings table, day/week/month views) | Calendar loads from DB; appointments display correctly |
| BOOK-WO-02 | Booking | Appointment CRUD (create/edit/cancel + confirmation email) | Create → DB row + email; cancel → row updated + notification |
| BOOK-WO-03 | Booking | Client linking (appointment → CRM contact, history timeline) | Booking detail shows CRM contact; contact shows booking history |
| BOOK-WO-04 | Booking | Follow-up automation (post-appointment notification trigger via notifications system) | Completed appointment → follow-up notification fires |
| BOOK-WO-05 | Booking | Intelligence linking (booking_trend signal type, capacity signal → schedule action) | booking_count signals surface in Intelligence Hub |

**Brands Hub WOs:**

| WO ID | App | Scope | Acceptance Test |
|-------|-----|-------|-----------------|
| BRAND-WO-01 | Brands | Brand directory (live from brands table, search/filter by category/region/tier) | Directory loads from DB; all filters work |
| BRAND-WO-02 | Brands | Brand detail page (profile, products, protocols, intelligence mentions) | All sections load from DB; intelligence tab shows signals |
| BRAND-WO-03 | Brands | Brand claim flow (claim form → access_requests → admin review → brand_admin role granted) | Claim → row created → admin approves → role granted |
| BRAND-WO-04 | Brands | Brand competitive intelligence (brand_adoption signals, share-of-voice, trend chart) | Intelligence tab shows signal_type=brand_adoption filtered to this brand |
| BRAND-WO-05 | Brands | Brand portal upgrades (live analytics, CSV export, AI advisor using live signal context) | All portal metrics DB-backed; AI advisor uses signal context |

**Professionals Hub WOs:**

| WO ID | App | Scope | Acceptance Test |
|-------|-----|-------|-----------------|
| PROF-WO-01 | Professionals | Professional directory (live from user_profiles where role=practitioner, search/filter) | Directory loads from DB; search and specialty filters work |
| PROF-WO-02 | Professionals | Professional profile page (bio, specialties, certifications, NPI verification badge) | Profile renders all fields from DB |
| PROF-WO-03 | Professionals | NPI verification badge (registry check via NPI edge function → verified badge display) | NPI check → badge shown; unverified → pending state |
| PROF-WO-04 | Professionals | Intelligence linking (treatment_trend → training recommendation → Assign Training action) | Signal → Assign Training routes to Education hub |
| PROF-WO-05 | Professionals | CE credit tracking (live from education_completions, PDF export for licensing boards) | CE credits count from DB; PDF export renders correctly |

**Notifications Hub WOs:**

| WO ID | App | Scope | Acceptance Test |
|-------|-----|-------|-----------------|
| NOTIF-WO-01 | Notifications | Notification center UI (bell icon + panel, unread count badge, mark-as-read, mark-all-read) | Panel loads from DB; unread badge count is accurate |
| NOTIF-WO-02 | Notifications | Notification types (signal alerts, booking reminders, credit low, system announcements) | All 4 types render with correct icons and Pearl Mineral V2 signal colors |
| NOTIF-WO-03 | Notifications | Push notification subscription (PWA + mobile: subscribe → receive via web-push edge function) | Subscribe → test push received in browser and on device |
| NOTIF-WO-04 | Notifications | Notification preferences (per-type enable/disable, digest frequency, quiet hours) | Toggle off a type → notifications of that type no longer delivered |
| NOTIF-WO-05 | Notifications | Notification trigger wiring (all system events → notification_events table writers) | Booking created → notification row; signal alert → notification row |

### BUILD 4: Full Platform + Authoring Studio UI

**Apps:** Ingredients (#8), Jobs (#11), Events (#12), Reseller (#13), **Authoring Studio UI** (#14b), Search (#18), Public Site polish (#16)
**Prerequisite:** BUILD 3 complete
**WO count:** 53 (18 Studio UI + 35 across 6 apps)

*(Full Studio UI adds canvas editor, data binding, SCORM builder, collaboration, export engine, 50+ templates, social image export — all on top of Authoring Core from Build 2)*

**Ingredients App WOs:**

| WO ID | App | Scope | Acceptance Test |
|-------|-----|-------|-----------------|
| INGR-WO-01 | Ingredients | Ingredient directory (from ingredients table, search/filter by category/safety rating/supplier) | Directory loads from DB; filters work; empty state has CTA |
| INGR-WO-02 | Ingredients | Ingredient detail page (INCI name, CIR safety rating, Open Beauty Facts data, formula usage, supplier listing) | All fields render from DB including external API data |
| INGR-WO-03 | Ingredients | Formulary builder (select ingredients → compose formula document via Authoring Core blocks) | Select ingredients → document created with ingredient embed blocks |
| INGR-WO-04 | Ingredients | Intelligence linking (ingredient_momentum signals, regulatory_alert signals on ingredient detail) | Ingredient detail shows linked signals; signal → View Ingredient action works |
| INGR-WO-05 | Ingredients | Supplier linking (ingredient → approved distributor mappings, price benchmark from signals) | Supplier list renders from DB with pricing_benchmark signal data |
| INGR-WO-06 | Ingredients | Export + mobile (ingredient list CSV, formula document PDF, Flutter ingredient search + detail screen) | CSV and PDF export work; Flutter screen renders and navigates |

**Jobs App WOs:**

| WO ID | App | Scope | Acceptance Test |
|-------|-----|-------|-----------------|
| JOBS-WO-01 | Jobs | Job board directory (from job_postings table, search/filter by role/location/specialty/salary range) | Directory loads from DB; all filters work; Schema.org JobPosting JSON-LD present |
| JOBS-WO-02 | Jobs | Job detail + apply (full description, apply form → job_applications row, confirmation email) | Apply → application row created → confirmation email sent |
| JOBS-WO-03 | Jobs | Employer dashboard (post/edit/close listings, applicant list, applicant CSV export) | Post listing → visible on board; applicants list loads; CSV downloads |
| JOBS-WO-04 | Jobs | Intelligence linking (job_market signals surface on board; signal → Create Listing action) | job_market signals visible in hub; Create Listing action works |
| JOBS-WO-05 | Jobs | Salary benchmarks (pricing_benchmark signals for roles + regional comparison chart) | Benchmark panel renders with signal data per role and region |
| JOBS-WO-06 | Jobs | Mobile (Flutter job cards, job detail sheet, apply bottom sheet) | Apply flow completes on mobile; Flutter screen navigates correctly |

**Events App WOs:**

| WO ID | App | Scope | Acceptance Test |
|-------|-----|-------|-----------------|
| EVT-WO-01 | Events | Event directory (from events table, calendar + list view, filter by type/location/date range) | Directory loads from DB; both views work; filters apply; Schema.org Event JSON-LD |
| EVT-WO-02 | Events | Event detail page (description, speakers, agenda, location map, registration count, capacity) | All fields render from DB |
| EVT-WO-03 | Events | Event registration (RSVP → event_registrations row → confirmation email; waitlist if at capacity) | Register → DB row → email fired; full event → waitlisted with notification |
| EVT-WO-04 | Events | Host dashboard (create/edit/publish events, attendee management, attendee CSV export) | Create event → appears on public board; attendee CSV downloads with correct data |
| EVT-WO-05 | Events | Intelligence linking (event_signal type surfaces in Intelligence Hub; signal → Create Event action) | event_signal type renders in hub; Create Event action pre-fills form from signal |
| EVT-WO-06 | Events | Mobile (Flutter event cards, event detail sheet, RSVP bottom sheet) | Cards render; RSVP completes on mobile |

**Reseller App WOs:**

| WO ID | App | Scope | Acceptance Test |
|-------|-----|-------|-----------------|
| RESELL-WO-01 | Reseller | Reseller application + approval flow (apply form → pending → admin review → approved status + portal access) | Application → DB row → admin approves → reseller portal unlocked |
| RESELL-WO-02 | Reseller | Commission dashboard (live from affiliate_clicks + commission_ledger, payout history, period comparison) | Dashboard loads from DB; commissions calculated correctly |
| RESELL-WO-03 | Reseller | Referral link manager (generate tracked affiliate links, QR code, performance per link) | Generate link → affiliate_link row created → click tracking fires correctly |
| RESELL-WO-04 | Reseller | Distributor intelligence (supply_chain signals relevant to reseller's product categories) | supply_chain signals filtered to reseller's category visible in hub |
| RESELL-WO-05 | Reseller | Payout reporting (commission summary CSV by period, running total, W-9 acknowledgment notice) | CSV exports commission history; W-9 notice visible on payout page |

**Search App WOs:**

| WO ID | App | Scope | Acceptance Test |
|-------|-----|-------|-----------------|
| SEARCH-WO-01 | Search | pgvector activation + embedding pipeline (verify extension enabled, wire generate-embeddings to market_signals, brands, education tables) | pgvector active in live DB; embeddings generated on insert for all 3 tables |
| SEARCH-WO-02 | Search | Site-wide search bar (visible in authenticated nav on all surfaces, ⌘K keyboard shortcut, instant results) | Search bar renders; ⌘K opens it; typing shows results within 300ms |
| SEARCH-WO-03 | Search | Search results page (/search?q=) with type facets (signals, brands, education, jobs, events, ingredients) | /search renders; facets filter correctly; each result links to detail page |
| SEARCH-WO-04 | Search | Semantic search (vector similarity via generate-embeddings edge function, synonym resolution) | Synonym search returns relevant results (e.g. "hair growth" finds "hair loss" signals) |
| SEARCH-WO-05 | Search | Search analytics (admin dashboard: top queries, zero-result rate, click-through rate for last 30 days) | Admin shows top 20 queries, zero-result%, CTR metrics |

**Public Site Polish WOs:**

| WO ID | App | Scope | Acceptance Test |
|-------|-----|-------|-----------------|
| SITE-WO-01 | Public Site | /for-brands live wire (replace hardcoded STATS array with real DB counts from brands + users tables) | Stats load from DB; no hardcoded values remain; DEMO label removed |
| SITE-WO-02 | Public Site | /professionals live wire (replace hardcoded STATS with real counts from user_profiles) | Stats load from DB; professional count matches actual verified professionals |
| SITE-WO-03 | Public Site | /plans live wire (connect TIERS to Stripe Products API, show real prices + feature list from DB) | Prices reflect Stripe products; toggling billing period updates price correctly |
| SITE-WO-04 | Public Site | SEO final audit (all public pages pass seo-audit skill: 100% meta, Open Graph, JSON-LD, sitemap.xml complete) | seo-audit skill returns 0 failures on all public pages |
| SITE-WO-05 | Public Site | Core Web Vitals pass (LCP < 2.5s, CLS < 0.1, FID < 100ms on /, /intelligence, /brands) | Lighthouse CI ≥ 90 performance score on all 3 pages |
| SITE-WO-06 | Public Site | Banned terms final sweep (0 violations across all public pages + portal copy) | banned-term-scanner returns 0 violations site-wide |
| SITE-WO-07 | Public Site | Conversion A/B test infrastructure (feature-flag-gated headline variants, conversion events logged to analytics table) | Feature flag controls variant; conversion events inserted to analytics_events table |

**Authoring Studio UI WOs (the Canva-competitor):**

| WO ID | App | Scope | Acceptance Test |
|-------|-----|-------|-----------------|
| STUDIO-UI-01 | Studio UI | 3-panel editor layout (block picker + canvas + properties) | Layout renders, panels resize |
| STUDIO-UI-02 | Studio UI | Canvas editor (Fabric.js artboard + layers + shapes) | Drag elements, resize, rotate, z-order |
| STUDIO-UI-03 | Studio UI | Data binding (connect elements to live signals/KPIs) | KPI card on canvas shows live signal delta |
| STUDIO-UI-04 | Studio UI | Template library (50+ organized by category) | Browse, pick, fill variables, preview |
| STUDIO-UI-05 | Studio UI | Full export engine (PNG/JPG/PDF/PPTX/SCORM/SVG/GIF) | Each format exports correctly |
| STUDIO-UI-06 | Studio UI | SCORM course builder + export | Create course → export .zip → validates |
| STUDIO-UI-07 | Studio UI | Collaboration (comments + approve/reject + presence) | Two users see each other, comment resolves |
| STUDIO-UI-08 | Studio UI | Brand kit system (colors/fonts/logo per org) | Apply brand kit → elements recolor |
| STUDIO-UI-09 | Studio UI | Mobile quick authoring (template → fill → share in 30s) | Pick template → fill → export → share sheet |
| STUDIO-UI-10 | Studio UI | Template variable system + Smart Fill (`{business_name}`, `{city}`, `{offer}`, `{price}`, `{date}`, `{cta}`, `{brand_kit.primary}`, `{signal.metric}`) | Duplicate template resolves variables; unresolved variables surfaced in Fix panel |
| STUDIO-UI-11 | Studio UI | Multi-format output presets (IG Post/Story/Reel cover, TikTok cover, Email header, Flyer, Menu insert, Staff SOP sheet, Slide 16:9) | Selecting preset resizes artboard, applies safe margins, and export matches spec |
| STUDIO-UI-12 | Studio UI | Asset governance + licensing rules (owner assets only where required, source + rights tracking, external placeholder blocking) | Banned/unlicensed source is blocked with remediation guidance |
| STUDIO-UI-13 | Studio UI | Version history + branching UI (draft/published states, who/when/why metadata, restore) | Create 3 versions then restore v1; content and canvas revert correctly |
| STUDIO-UI-14 | Studio UI | Review/approval workflow (author/reviewer/publisher roles, threaded comments, approve/reject) | Non-publisher cannot publish; reviewer can request changes; audit log entry exists |
| STUDIO-UI-15 | Studio UI | Embed Intelligence widgets (KPI tile, trend sparkline, signal callout, what-changed timeline snippet, source citation block) | Bind widget to `signal_id` and render live data + provenance + cached fallback |
| STUDIO-UI-16 | Studio UI | Export reliability harness (pixel/font/layout fidelity golden tests for PDF/PPTX/PNG across 5 templates) | CI suite runs; failures produce diff artifacts/metrics |
| STUDIO-UI-17 | Studio UI | Content distribution hooks (copy blocks, UTM links, QR code, share-pack ZIP with assets + captions) | Generate share pack returns ZIP with required files and `manifest.json` |
| STUDIO-UI-18 | Studio UI | Abuse/safety + compliance layer (restricted categories require disclaimer block before publish) | Restricted template cannot publish without disclaimer; violation logged in audit trail |

### BUILD 5: Multi-Platform Polish

**Apps:** Flutter mobile full parity, Tauri desktop, PWA enhancements
**Prerequisite:** BUILD 4 complete
**WO count:** 14

**Flutter Mobile Full Parity WOs:**

| WO ID | App | Scope | Acceptance Test |
|-------|-----|-------|-----------------|
| MOBILE-WO-01 | Mobile | Flutter Ingredients hub (ingredient directory + detail screen + formulary viewer) | Screens render; live data loads; formulary doc opens in viewer |
| MOBILE-WO-02 | Mobile | Flutter Jobs hub (job board cards + job detail sheet + apply bottom sheet) | Apply flow completes on mobile; application row created |
| MOBILE-WO-03 | Mobile | Flutter Events hub (event cards + event detail sheet + RSVP bottom sheet) | RSVP flow completes; event_registrations row created |
| MOBILE-WO-04 | Mobile | Flutter Reseller hub (commission dashboard screen + referral link generator) | Commission data loads from DB; link generates correctly |
| MOBILE-WO-05 | Mobile | Flutter global search (search bar in app header + results screen with type facets) | Typing query returns results; tapping result navigates to detail screen |
| MOBILE-WO-06 | Mobile | Flutter Studio quick authoring (template → fill variables → export → native share sheet) | Template → export completes in under 30 seconds; share sheet presents correctly |
| MOBILE-WO-07 | Mobile | Push notification delivery (FCM/APNs integration, subscribe to push, receive all notification types) | Subscribe → test push received on iOS and Android devices |
| MOBILE-WO-08 | Mobile | Flutter full parity audit (every web hub has a mobile counterpart; no orphaned web routes on mobile) | mobile-parity-checker skill returns 0 parity gaps |

**Tauri Desktop WOs:**

| WO ID | App | Scope | Acceptance Test |
|-------|-----|-------|-----------------|
| TAURI-WO-01 | Tauri | Desktop shell setup (Tauri wrapping React+Vite build; installers for macOS + Windows) | App installs and launches to /intelligence; no console errors |
| TAURI-WO-02 | Tauri | Native integrations (file-system access for exports saves to ~/Downloads; OS-level notifications) | Export → file saved to ~/Downloads; notification appears in OS notification center |
| TAURI-WO-03 | Tauri | Auto-update (Tauri updater checks for new release, prompts user, installs without data loss) | New version → update prompt → installs; data intact after update |

**PWA WOs:**

| WO ID | App | Scope | Acceptance Test |
|-------|-----|-------|-----------------|
| PWA-WO-01 | PWA | PWA manifest + install prompt (meets all installability criteria on iOS, Android, and desktop Chrome) | App installs to home screen on all 3 platforms without errors |
| PWA-WO-02 | PWA | Service worker + offline mode (intelligence hub renders cached signals when offline) | Airplane mode → /intelligence renders with cached data; stale badge shown |
| PWA-WO-03 | PWA | Web Push subscriptions (subscribe in browser → receive push on browser/mobile when new signal fires) | Subscribe → trigger signal alert → push delivered in browser and on mobile |

---

## DONE GATES (every app must pass ALL 16)

| # | Gate | Test | Method |
|---|------|------|--------|
| 1 | TSC clean | 0 errors | `npx tsc --noEmit` |
| 2 | Build clean | success | `npm run build` |
| 3 | Shell scan | 0 shells for this app | Shell Detector CI gate |
| 4 | LIVE/DEMO labeled | 0 unlabeled surfaces | LIVE/DEMO scanner |
| 5 | Empty state | illustrated empty on every list | Visual + E2E |
| 6 | Error state | retry + cached fallback | Error boundary test |
| 7 | Loading state | skeleton shimmer | TanStack isLoading → Skeleton |
| 8 | CRUD complete | create/read/update/delete for primary objects | E2E per action |
| 9 | Export works | CSV on every table | Click export → file downloads |
| 10 | Tier gate | ModuleRoute on all gated routes | grep ModuleRoute |
| 11 | RLS verified | policies exist for all writable tables | rls-audit skill |
| 12 | Intelligence linked | >= 1 signal→action path | Demo: signal → action completes |
| 13 | Responsive | 1440, 768, 375 breakpoints | E2E screenshots |
| 14 | No font-serif | 0 instances in app files | grep |
| 15 | No banned terms | 0 in user-facing copy | Linter |
| 16 | Mobile screen | renders and navigates (if app has mobile) | Flutter build |

---

## PER-APP SPEC TEMPLATE

Each app gets a lightweight spec page using this template. The 20 specs are separate files (one per app) committed alongside this master plan.

```
# APP [#]: [NAME]

## Purpose
[One sentence]

## Primary Objects + CRUD Matrix
| Object | Create | Read | Update | Delete/Archive |
|--------|--------|------|--------|----------------|

## Routes
| Platform | Route | Component | Status (LIVE/DEMO/SHELL) |
|----------|-------|-----------|--------------------------|

## Tables + Edge Functions + Hooks
| Table | Edge Function | Hook | Used On |
|-------|--------------|------|---------|

## Entitlement Keys
MODULE_[KEY] | Tier minimum | Feature flags

## Required Exports
CSV / PDF / branded / social image

## Required States
Loading (skeleton) | Empty (illustration + CTA) | Error (retry + fallback)

## Intelligence Linking
Signal → [action] → [target in this hub]

## Mobile Screens
| Screen | Adapts from web route | Mobile-unique features |

## Test Requirements
| Test | Type | Acceptance |

## Done Gates Checklist
[ ] All 16 gates from master plan pass
```

---

## PATTERN LIBRARY INPUTS — IDEA-MINING-01 (binding for all Intelligence Hub UI work)

**Reference:** `docs/research/IDEA-MINING-01-comparables.md` (commit 951fd5a, 2026-03-13)
**Proof:** `docs/qa/verify_IDEA-MINING-01.json` — overall: PASS

### Mandatory Rules for Intelligence UI Work

1. **UI changes must cite at least one pattern ID from IDEA-MINING-01.** If a proposed change cannot be traced to a pattern in `IDEA-MINING-01-comparables.md`, it must be deferred until a pattern is documented and approved.
2. **No UI changes allowed if they reduce DATA density, PRESS credibility, or value/session.** Every change must demonstrate how it increases at least one of: signal count visible per session, source provenance visible per signal, or operator action rate per visit.
3. **IDEA-MINING-01 completion does NOT override GUARDRAIL-01.** GUARDRAIL-01 is gated on verify artifact status (see `docs/build_tracker.md` § GUARDRAIL-01 STATUS). Idea mining is an input to design decisions, not a green light to ship.
4. **Anti-patterns from IDEA-MINING-01 are binding prohibitions.** Any implementation that matches a documented anti-pattern (e.g., Boolean query as primary search, blank widget canvas, static PDF as primary delivery) is a STOP CONDITION.

### Acceptable WARNs in verify_INTEL_MERCH.json (owner acknowledged — does NOT block GUARDRAIL-01)

The following 6 WARN rules are explicitly accepted. Each has a documented resolution path. 0 FAIL is confirmed.

| Rule | WARN Reason | Resolution Path |
|------|------------|----------------|
| FEED-MERCH-02 | Vertical filter optional, not default-enforced | INTEL-WO-01 scope |
| FEED-MERCH-06 | Paid:free ratio = 0.14:1 (target ≥3:1) | Owner decision: commercial API budget (Mintel, Euromonitor) |
| FEED-MERCH-07 | No cross-source 6hr topic-window dedup | Separate dedup WO after MERCH-INTEL-03-FINAL |
| FEED-MERCH-08 | FDA MDR titles ALL CAPS; " - SourceName" appended on trade press | ingest-openfda title normalization + PRESS-INGEST-01 |
| FEED-MERCH-11 | Failed/degraded-first ordering unconfirmed in live admin view | AdminFeedsHub audit WO |
| FEED-MERCH-12 | No explicit paywall-boundary signal curation in useIntelligence.ts | INTEL-WO-01 scope |

**Evidence:** `docs/qa/verify_INTEL_MERCH.json` → `summary.fail = 0`, `note: "6 WARN rules are acceptable per skill spec (ship with owner acknowledgment)."`

### Top 10 Patterns (mapped to SOCELLE surfaces)

| # | Pattern | Source | SOCELLE Surface |
|---|---------|--------|----------------|
| 1 | Snapshot / Today View as hub entry | Pulsar | Intelligence Hub landing — summarize the day before showing raw feed |
| 2 | Narrative clustering (Smart Clusters) | New Sloth, Sprinklr | Signal list — collapse same-story duplicates under one expandable row |
| 3 | Impact score badge on every list item | PeakMetrics | `SignalCard.tsx` — color-coded badge using existing `impact_score` column |
| 4 | Peer benchmark KPI strip (your/median/top quartile) | AMP, Benchmarkit, Listrak | Intelligence Hub KPI strip — benchmark operator metrics vs. vertical peers |
| 5 | List / Card view toggle (persisted) | Inoreader | Signal list — List mode for power users, Card for operators |
| 6 | Sentiment aggregate banner above signal list | NewsData.io, Sprinklr | Signal list header — "47 signals: 62% positive" bar for current filter |
| 7 | Spot → Understand → Act arc on every signal | PeakMetrics, AMP | `SignalCard.tsx` — signal + "What this means" + cross-hub action link |
| 8 | Entity recognition chips (brand/ingredient/regulator) | New Sloth, Sprinklr | Signal cards — filterable chips below headline |
| 9 | Filter panel: Primary (6 visible) + "More filters" | Pulsar | Intelligence Hub filter sidebar — reduce cognitive load for non-analysts |
| 10 | AI Brief Builder (bulk select → prompt → synthetic signal) | Inoreader, PeakMetrics | Intelligence Hub — maps to INTEL-WO-07 AI toolbar, future `signal_type='ai_brief'` |

---

## EXECUTION RULES (non-negotiable)

1. **BUILD 0 completes before ANY app work.** Foundation is the hard prerequisite.
2. **All agents on main.** No worktrees. Commit after each agent completes.
3. **Mobile per-hub.** When web hub completes, build mobile screen before moving on.
4. **Shell Detector runs after every merge.** If new shell introduced, merge blocked.
5. **Server-side enforcement.** Credits checked in edge function. Rate limits in edge function. UI gates are supplementary.
6. **CrossHubActionDispatcher for ALL signal→action flows.** No hub-specific implementations.
7. **Feature flags for gradual rollout.** New features start behind flags.
8. **Inventory Report regenerated before each build.** Numbers must match reality.
9. **Quality outranks time.** No shells. No stubs. No "coming soon." Functional or don't ship.
10. **Every claim labeled VERIFIED / UNKNOWN / INTENDED.** No blended assertions.

---

## TOTALS

| Metric | Count | Status |
|--------|-------|--------|
| Apps | 20 (+ Authoring split into Core + Studio UI) | — |
| Group 0 (Control Plane) WOs | 4 | ✅ COMPLETE |
| Group A (Foundation) WOs | 15 | ✅ COMPLETE |
| Build 0 total (Group 0 + A) | 19 | ✅ COMPLETE |
| Build 1 (Revenue Wedge) WOs | 21 | ⏳ IN PROGRESS — PAY-WO bypassed |
| Build 2 (Core + Authoring Core + Admin) WOs | 50 | ⏳ IN PROGRESS — partial via V3 waves |
| Build 3 (Growth) WOs | 25 | ✅ COMPLETE — commit ba59f01 |
| Build 4 (Full Platform + Studio UI) WOs | 53 (18 Studio UI + 35 across 6 apps) | ⬜ NOT STARTED |
| Build 5 (Multi-Platform) WOs | 14 (8 Mobile + 3 Tauri + 3 PWA) | ⬜ NOT STARTED |
| **Total WOs** | **182** | — |
| Existing skills | 99 (updated 2026-03-09) | — |
| Current shell rate | 48.5% (129/266) | Target: 0% |

---

*OPERATION BREAKOUT v2 — CORRECTED MASTER PLAN*
*All owner decisions locked. All advisor fixes incorporated.*
*VERIFIED / UNKNOWN / INTENDED on every claim.*
*182 work orders. 20 apps. 6 builds. 0 shells at completion.*
*Intelligence platform first. Always.*
