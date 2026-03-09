# OPERATION BREAKOUT — SESSION PROMPTS
# Paste the relevant prompt into each agent's Claude Code session
# Generated: March 8, 2026

---

## HOW TO USE

1. Open a Claude Code session
2. Copy the relevant prompt block below
3. Paste it as the first message in the session
4. Agent reads the plan, picks up its WOs, and executes

Each prompt tells the agent: what it's building, what to read first, what WOs to complete, and what skills to run for verification.

---

## PROMPT: BUILD 0 — CONTROL PLANE (Group 0)

```
OPERATION BREAKOUT — BUILD 0, GROUP 0: CONTROL PLANE

You are assigned to the Product Control Plane. Read these files first:
1. SOCELLE-WEB/docs/operations/OPERATION_BREAKOUT.md — full plan (your WOs are in BUILD 0 section)
2. .claude/CLAUDE.md — governance rules, design system, stop conditions
3. ULTRA_DRIVE_PROMPT.md — active corrective sprint (if it exists)

YOUR WOs (complete in order):
- CTRL-WO-01: Feature flag system — feature_flags table + admin UI + useFeatureFlag hook + checkFlag in edge functions
- CTRL-WO-02: API kill-switch — per-edge-function disable toggle in admin
- CTRL-WO-03: Audit log table + writer — every admin action, AI action, entitlement change logged
- CTRL-WO-04: Verify entitlements chain end-to-end — subscription_plans → modules_included → ModuleRoute → UpgradePrompt

RULES:
- All data fetching uses TanStack Query (useQuery/useMutation). No raw useEffect + supabase.from().
- All new tables MUST have RLS policies.
- Run verification skills after each WO: schema-db-suite, rls-auditor, build-gate
- Save verification JSON to docs/qa/verify_CTRL-WO-XX_<timestamp>.json
- Do NOT self-certify. Run the skills. 0 failures = done.
- Do NOT touch anything outside your WO scope.

DONE WHEN: All 4 WOs pass verification. Feature flags toggleable in admin. Audit log captures actions. Entitlements chain verified E2E.
```

---

## PROMPT: BUILD 0 — FOUNDATION (Group A, Lane 1: Data + Types)

```
OPERATION BREAKOUT — BUILD 0, GROUP A, LANE 1: DATA + TYPES

You are assigned to Foundation data integrity work. Read these files first:
1. SOCELLE-WEB/docs/operations/OPERATION_BREAKOUT.md — full plan (your WOs are in BUILD 0, Group A)
2. .claude/CLAUDE.md — governance rules, tech stack, stop conditions
3. SOCELLE-WEB/docs/command/CMS_ARCHITECTURE.md — CMS table definitions

YOUR WOs:
- FOUND-WO-01: Regenerate database.types.ts and verify against all 153 migrations
- FOUND-WO-07: Verify/build EmptyState + ErrorState + LoadingSkeleton shared components
- FOUND-WO-13: LIVE/DEMO enforcement at COMPONENT level (not just page level)
- FOUND-WO-15: RLS audit — run rls-auditor skill, verify policies on all writable tables

RULES:
- TanStack Query for ALL data fetching. No raw useEffect + supabase.from().
- Run verification skills: type-generation-validator, schema-db-suite, rls-auditor, live-demo-detector, build-gate
- Save verification JSON to docs/qa/
- Do NOT self-certify. Run the skills. 0 failures = done.

DONE WHEN: Types regenerated and match migrations. Shared state components exist. LIVE/DEMO enforced at component level. RLS on all writable tables.
```

---

## PROMPT: BUILD 0 — FOUNDATION (Group A, Lane 2: AI Safety + Rate Limits)

```
OPERATION BREAKOUT — BUILD 0, GROUP A, LANE 2: AI SAFETY + RATE LIMITS

You are assigned to AI orchestrator hardening. Read these files first:
1. SOCELLE-WEB/docs/operations/OPERATION_BREAKOUT.md — full plan (your WOs in BUILD 0, Group A)
2. .claude/CLAUDE.md — governance rules, AI safety rules (§13)
3. supabase/functions/ai-orchestrator/index.ts — the edge function you're hardening

CONTEXT: Server-side credit check ALREADY EXISTS at line 371 (deduct_credits RPC with atomic row-level locking, 402 on insufficient). You do NOT need to build it. You need to verify it and add rate limiting.

YOUR WOs:
- FOUND-WO-02: Verify existing server-side credit check + add integration test (deduct_credits at line 371 already works — scope is verification + test only)
- FOUND-WO-03: Build rate limiting in ai-orchestrator — create ai_rate_limits table, sliding window on user.id, check before model call, return 429 when exceeded
  - Starter: 5/min, 5 burst
  - Pro: 15/min, 10 burst
  - Enterprise: 60/min, 30 burst
- FOUND-WO-12: Wire pg_cron hourly schedule for feed-orchestrator

RULES:
- New table (ai_rate_limits) MUST have RLS.
- Migration for the table. Edge function logic for the check.
- Test: curl 6 requests in 60s as Starter → 6th returns 429.
- Run verification skills: schema-db-suite, rls-auditor, edge-fn-health, build-gate
- Save verification JSON to docs/qa/

DONE WHEN: Rate limiting returns 429 at tier thresholds. Credit check has integration test. Feed cron verified.
```

---

## PROMPT: BUILD 0 — FOUNDATION (Group A, Lane 3: Shell Detection + QA)

```
OPERATION BREAKOUT — BUILD 0, GROUP A, LANE 3: SHELL DETECTION + QA

You are assigned to QA infrastructure. Read these files first:
1. SOCELLE-WEB/docs/operations/OPERATION_BREAKOUT.md — full plan (your WOs in BUILD 0, Group A)
2. .claude/CLAUDE.md — governance rules, anti-shell rule (§7)

CONTEXT: Current shell rate is 48.5% (129 shells out of 266 pages). You are building the detection system, NOT fixing all shells.

YOUR WOs:
- FOUND-WO-04: Shell Detector — skill + CI gate script that classifies pages as LIVE/DEMO/SHELL and blocks merges if new shells introduced
- FOUND-WO-08: Purge 17 banned terms from public pages
- FOUND-WO-11: Generated Inventory Report script — runs find/grep commands from inventory table, outputs markdown, committed before each build
- FOUND-WO-14: Add playwright-report/ to .gitignore + clean stale deletions

RULES:
- Shell = page with no DB query, no CRUD, no empty/error/loading states
- Shell Detector must output JSON with per-page classification
- Run verification skills: hub-shell-detector, banned-term-scanner, build-gate
- Save verification JSON to docs/qa/

DONE WHEN: Shell detector script runs and outputs baseline (129 shells). Banned terms at 0 on public pages. Inventory report script committed.
```

---

## PROMPT: BUILD 0 — FOUNDATION (Group A, Lane 4: Design + Fonts)

```
OPERATION BREAKOUT — BUILD 0, GROUP A, LANE 4: DESIGN SYSTEM + FONTS

You are assigned to design system enforcement. Read these files first:
1. SOCELLE-WEB/docs/operations/OPERATION_BREAKOUT.md — full plan (your WOs in BUILD 0, Group A)
2. .claude/CLAUDE.md — design system tokens (§6), banned tokens

CONTEXT: font-serif is ALREADY 0 in src/ (all 202 purged). You do NOT need to purge font-serif. You need to build the CSS variable font system and the CrossHubActionDispatcher.

YOUR WOs:
- FOUND-WO-05: CrossHubActionDispatcher + SignalActionContract — one shared component for all signal→action flows across hubs. See OPERATION_BREAKOUT.md FIX 5 for the TypeScript interface.
- FOUND-WO-06: Universal font system (CSS variable-based) — define --font-primary, --font-display, --font-mono. Map Tailwind font-sans to var(--font-primary). font-serif purge is already done.
- FOUND-WO-09: Fix mobile signal colors to match Pearl Mineral V2 doctrine
- FOUND-WO-10: Missing mobile MODULE_* keys (BOOKING, BRANDS, JOBS, EVENTS, STUDIO)

RULES:
- No font-serif anywhere. No pro-* / brand-* / natura-* legacy tokens.
- CrossHubActionDispatcher must handle all action_types from the SignalAction contract.
- Run verification skills: design-audit-suite, token-drift-scanner, mobile-parity-checker, build-gate
- Save verification JSON to docs/qa/

DONE WHEN: Font system uses CSS vars (change one var = change all fonts). CrossHubActionDispatcher dispatches to all target hubs. Mobile colors match. Mobile MODULE_* keys added.
```

---

## PROMPT: BUILD 1 — INTELLIGENCE APP

```
OPERATION BREAKOUT — BUILD 1: INTELLIGENCE APP

PREREQUISITE: BUILD 0 must be COMPLETE before you start. Check docs/qa/ for verification JSONs on all CTRL-WO and FOUND-WO items. If any are missing, STOP.

Read these files first:
1. SOCELLE-WEB/docs/operations/OPERATION_BREAKOUT.md — your WOs are in BUILD 1 section
2. .claude/CLAUDE.md — governance rules, intelligence-first IA
3. SOCELLE-WEB/docs/command/V3_BUILD_PLAN.md — V3 build specs

YOUR WOs (INTEL-WO-01 through INTEL-WO-11):
- Wire 14 figma-make-source modules to live data
- Signal Table: sortable, filterable, exportable
- Trend Stacks (Recharts, click→filter)
- Opportunity Engine (signal gaps → revenue estimates)
- AI toolbar (6 tools, credits deduct server-side)
- Signal detail slide-out (provenance, trend, actions)
- Cross-hub actions via CrossHubActionDispatcher
- Empty/error/loading on all surfaces
- Mobile: signal cards + detail sheet
- Saved searches + alerts
- Build secondary Intelligence Home at /home

RULES:
- ALL data fetching via TanStack Query. No raw useEffect + supabase.from().
- Use CrossHubActionDispatcher for signal→action flows (built in Build 0).
- Use useFeatureFlag for any new feature rollout (built in Build 0).
- Every surface needs empty state, error state, loading skeleton.
- Run verification skills: intelligence-module-checker, signal-data-validator, hub-shell-detector, design-audit-suite, build-gate
- Save verification JSON to docs/qa/
- All 16 done gates must pass for the Intelligence app.

DONE WHEN: All 14 modules render live data. AI tools deduct credits. Signal actions dispatch to other hubs. Mobile screens work. 0 shells.
```

---

## PROMPT: BUILD 1 — FEED PIPELINE + PAYMENTS

```
OPERATION BREAKOUT — BUILD 1: FEED PIPELINE + PAYMENTS

PREREQUISITE: BUILD 0 must be COMPLETE. Check docs/qa/ for verification JSONs.

Read these files first:
1. SOCELLE-WEB/docs/operations/OPERATION_BREAKOUT.md — your WOs in BUILD 1 (FEED-WO and PAY-WO sections)
2. .claude/CLAUDE.md — governance rules

YOUR WOs — FEED PIPELINE (FEED-WO-01 through FEED-WO-05):
- Verify/wire pg_cron hourly schedule
- Verify 37 feeds ingest (recent last_run_at)
- Deduplication logic (detect + skip duplicates)
- Feed health monitoring + alerting (retry, alert after 3 failures)
- Dead letter queue (failed items visible in admin)

YOUR WOs — PAYMENTS (PAY-WO-01 through PAY-WO-05):
- Verify server-side credit deduction (already exists — add E2E test)
- Credit balance visible in portal nav
- Overage blocking with upgrade CTA (0 credits → tools locked)
- Affiliate link wrapper + tracking
- Verify Stripe webhook tier updates

RULES:
- TanStack Query for all data fetching.
- New tables need RLS.
- Run verification skills: feed-pipeline-checker, signal-data-validator, payment-flow-tester, credit-economy-validator, stripe-integration-tester, build-gate
- Save verification JSON to docs/qa/

DONE WHEN: Feeds ingest hourly with dedup + DLQ. Credits deduct and display. Affiliates tracked. Stripe webhooks update tiers. All 16 done gates pass.
```

---

## PROMPT: SKILL CREATOR AGENT — 26 NEW SKILLS

```
OPERATION BREAKOUT — SKILL CREATOR AGENT: BUILD 26 VERIFICATION SKILLS

You are the Skill Creator agent. Your job is to create 26 new verification skills that the build teams need.

Read these files first:
1. SOCELLE-WEB/docs/operations/OPERATION_BREAKOUT.md — full plan (see WO definitions for what each skill must validate)
2. .claude/CLAUDE.md — §1 has the skill library and mappings, §1.1 has the verification protocol
3. .claude/skills/skill-creator/SKILL.md — how to create skills

CONTEXT: 97 skills exist. The plan requires 26 more. Each skill is a verification tool that build agents run to confirm their WO is actually done. Without these skills, agents will self-certify (which is banned).

CREATE THESE 26 SKILLS (in priority order — Build 0 teams need theirs first):

BATCH 1 — BUILD 0 CONTROL PLANE (create first, teams are waiting):
1. feature-flag-validator — Verifies feature_flags table schema, useFeatureFlag hook, checkFlag in edge functions, admin UI toggle, per-user overrides, rollout percentage logic
2. audit-log-auditor — Validates audit log table exists, admin actions logged, AI actions logged, entitlement changes logged, searchable
3. api-kill-switch-validator — Verifies per-edge-function is_enabled toggle in admin for all 31 edge functions
4. entitlement-chain-verifier — E2E test: subscription_plans → modules_included → ModuleRoute → UpgradePrompt renders correctly

BATCH 2 — BUILD 0 FOUNDATION (create second):
5. shell-detector-ci — CI gate script that classifies pages as LIVE/DEMO/SHELL, outputs JSON, blocks merges if new shells introduced
6. rate-limiter-tester — Tests tiered rate limiting (5/15/60 per min by tier) in ai-orchestrator, verifies 429 at thresholds, sliding window on user.id
7. inventory-report-generator — Runs find/grep commands from OPERATION_BREAKOUT inventory table, outputs SOCELLE_GLOBAL_INVENTORY_REPORT.md
8. credit-deduction-integration-tester — E2E: AI action → deduct_credits RPC → credit_ledger row → balance decreases → 402 on insufficient
9. cross-hub-dispatcher-validator — Verifies SignalAction contract interface, CrossHubActionDispatcher routing to all target hubs, all action_types handled
10. css-variable-font-system-validator — Checks --font-primary, --font-display, --font-mono CSS vars exist, Tailwind font-sans maps to var(--font-primary), 0 font-serif
11. database-types-generator — Regenerates database.types.ts from migrations and validates freshness/coverage
12. live-demo-component-enforcer — Extends LIVE/DEMO detection to component level (not just page), verifies isLive hook pattern
13. mobile-module-key-validator — Checks MODULE_BOOKING, MODULE_BRANDS, MODULE_JOBS, MODULE_EVENTS, MODULE_STUDIO exist in mobile module_access.dart
14. signal-color-doctrine-checker — Validates mobile signal colors match Pearl Mineral V2 (signal-up=#5F8A72, signal-warn=#A97A4C, signal-down=#8E6464)
15. pg-cron-scheduler-validator — Confirms pg_cron hourly job for feed-orchestrator exists and shows recent execution

BATCH 3 — BUILD 0 QA + STATE ENFORCEMENT:
16. empty-state-enforcer — Scans all list/table surfaces for illustrated empty states with CTAs
17. error-state-enforcer — Validates error boundaries with retry + cached fallback on all surfaces
18. loading-skeleton-enforcer — Confirms skeleton shimmer on all TanStack Query isLoading transitions
19. shared-state-components-auditor — Validates EmptyState, ErrorState, LoadingSkeleton shared components used consistently across pages
20. banned-terms-purger — Scans + removes 17 banned terms from public-facing copy (extends banned-term-scanner with auto-fix)

BATCH 4 — BUILD 1 SUPPORT:
21. deduplication-logic-checker — Validates RSS dedup logic in rss-to-signals: detects duplicate URLs/titles, skips already-processed signals
22. dlq-system-checker — Verifies dead letter queue table exists, failed feed items captured, visible in admin
23. feed-health-monitor-auditor — Checks feed retry logic (3 failures → alert), data_feeds.last_run_at freshness
24. affiliate-link-tracker-auditor — Validates affiliate_clicks table, link wrapper edge function, FTC badge on tracked links
25. system-health-dashboard-validator — Verifies Admin Hub dashboard shows live feeds status, AI costs, user counts, error metrics

BATCH 5 — BUILD 2 SUPPORT:
26. authoring-core-schema-validator — Validates document model JSON schema, 17 block types, versioning (draft→published→archived), publish states

RULES FOR SKILL CREATION:
- Each skill gets its own folder at .claude/skills/<skill-name>/SKILL.md
- Each skill must be runnable by agents via the verification protocol
- Each skill must output structured results (PASS/FAIL with evidence)
- Follow the pattern of existing skills (look at rls-auditor, hub-shell-detector, build-gate as examples)
- Create Batch 1 first, commit, then Batch 2, commit, etc.
- After creating all 26, run: find .claude/skills -name SKILL.md | wc -l — must return 123

DONE WHEN: 123 skills exist. All 26 new skills are runnable and return structured PASS/FAIL output.
```

---

## PROMPT: ULTRA DRIVE — CORRECTIVE SPRINT (5 LANES)

```
OPERATION BREAKOUT — ULTRA DRIVE CORRECTIVE SPRINT

You are an Ultra Drive agent. Read ULTRA_DRIVE_PROMPT.md at the repo root for your lane assignment.

Read these files first:
1. ULTRA_DRIVE_PROMPT.md — pick your lane (A through E)
2. .claude/CLAUDE.md — governance rules, critical debt list (§4)
3. SOCELLE-WEB/docs/operations/OPERATION_BREAKOUT.md — master plan context

LANES:
- Lane A: Replace 2,027 legacy pro-* Tailwind tokens with Pearl Mineral V2 equivalents
- Lane B: Migrate 79 pages from raw useEffect+supabase.from() to TanStack Query hooks
- Lane C: Remove all Sentry references (ALREADY DONE — verify 0 refs remain)
- Lane D: Write unit tests (target: ≥20 passing)
- Lane E: Write E2E Playwright tests (target: ≥10 passing)

RULES:
- Each lane is independent. Pick ONE lane and execute it fully.
- Run the corresponding verification skill when done.
- Lane A: token-drift-scanner + design-audit-suite
- Lane B: dev-best-practice-checker + hook-consolidator
- Lane C: dependency-scanner (verify 0 Sentry)
- Lane D: test-runner-suite (≥20 tests passing)
- Lane E: e2e-test-runner (≥10 specs passing)
- Save verification JSON to docs/qa/

DONE WHEN: Your lane's acceptance criteria met. Verification skill returns 0 failures.
```

---

## PROMPT: BUILD 2 — CRM APP (12 WOs)

```
OPERATION BREAKOUT — BUILD 2: CRM APP

PREREQUISITE: BUILD 1 must be COMPLETE. Check docs/qa/ for all Build 1 verification JSONs. If any are missing, STOP.

Read these files first:
1. SOCELLE-WEB/docs/operations/OPERATION_BREAKOUT.md — full plan (Build 2 section)
2. .claude/CLAUDE.md — governance, anti-shell rule (§7), design system (§6)
3. SOCELLE-WEB/docs/command/JOURNEY_STANDARDS.md — CRM user journeys

YOU ARE BUILDING: CRM App (#2) — 12 WOs
The CRM app manages client relationships, contact records, notes, tags, lifecycle stages, and activity timelines for beauty professionals.

REQUIREMENTS PER WO:
- CRUD on all primary objects (contacts, companies, notes, tags, activities)
- Library view with sort/filter/search on contacts
- Detail view with activity timeline from DB
- Edit + Delete with RLS
- ModuleRoute + TierGuard on all routes
- Intelligence input: signals can create/update CRM records via CrossHubActionDispatcher
- Proof/metrics dashboard with real client data
- Export CSV on every table
- Empty/error/loading states (premium quality)
- Observability (errors visible in Admin Hub)
- Mobile: contact list + detail screen

RULES:
- TanStack Query for ALL data fetching. No raw useEffect + supabase.from().
- Use CrossHubActionDispatcher for signal→CRM flows.
- All new tables MUST have RLS policies.
- Run verification skills: hub-shell-detector, design-audit-suite, rls-auditor, entitlement-validator, live-demo-detector, build-gate
- Save verification JSON to docs/qa/
- All 16 done gates must pass.

DONE WHEN: CRM is fully functional with 0 shells. Contacts CRUD works. Signal→CRM dispatch works. Mobile screen renders. All 16 gates pass.
```

---

## PROMPT: BUILD 2 — EDUCATION APP (10 WOs)

```
OPERATION BREAKOUT — BUILD 2: EDUCATION APP

PREREQUISITE: BUILD 1 complete + Authoring Core available (AUTH-CORE WOs complete or in parallel).

Read these files first:
1. SOCELLE-WEB/docs/operations/OPERATION_BREAKOUT.md — Build 2 section
2. .claude/CLAUDE.md — governance, anti-shell rule
3. SOCELLE-WEB/docs/command/JOURNEY_STANDARDS.md — Education user journeys

YOU ARE BUILDING: Education App (#3) — 10 WOs
Education manages courses, modules, lessons, quizzes, certifications, and learning paths for beauty professionals. Uses Authoring Core for content.

REQUIREMENTS PER WO:
- CRUD on courses, modules, lessons, quizzes, certificates
- Course library with sort/filter/search
- Lesson viewer with progress tracking from DB
- Quiz engine with scoring + certificate generation
- ModuleRoute + TierGuard
- Intelligence input: signals can recommend training via dispatcher
- Learning analytics dashboard with real data
- Export: certificates (PDF), progress reports (CSV)
- Empty/error/loading states
- Mobile: course list + lesson viewer

RULES:
- Uses Authoring Core blocks for lesson content (NOT Studio UI).
- TanStack Query for all data fetching.
- All new tables need RLS.
- Run verification skills: hub-shell-detector, design-audit-suite, rls-auditor, education-content-optimizer, build-gate
- Save verification JSON to docs/qa/

DONE WHEN: Courses fully functional. Quiz→certificate flow works. Signal→training dispatch works. Mobile screen renders. All 16 gates pass.
```

---

## PROMPT: BUILD 2 — SALES APP (8 WOs)

```
OPERATION BREAKOUT — BUILD 2: SALES APP

PREREQUISITE: BUILD 1 complete.

Read these files first:
1. SOCELLE-WEB/docs/operations/OPERATION_BREAKOUT.md — Build 2 section
2. .claude/CLAUDE.md — governance, commerce boundary (§12)

YOU ARE BUILDING: Sales App (#5) — 8 WOs
Sales manages deals, pipelines, proposals, and revenue tracking for beauty businesses.

REQUIREMENTS PER WO:
- CRUD on deals, pipeline stages, proposals
- Pipeline kanban view with drag-and-drop
- Deal detail with activity timeline from DB
- Proposal builder using Authoring Core blocks
- ModuleRoute + TierGuard
- Intelligence input: signals can create deals via dispatcher
- Revenue dashboard with real pipeline data
- Export CSV on deals + PDF on proposals
- Empty/error/loading states
- Mobile: deal list + pipeline view

RULES:
- Commerce is a MODULE, not the IA backbone. No "Shop Now" as primary CTA.
- TanStack Query for all data fetching. All new tables need RLS.
- Run verification skills: hub-shell-detector, design-audit-suite, rls-auditor, sales-pipeline-optimizer, build-gate
- Save verification JSON to docs/qa/

DONE WHEN: Pipeline fully functional. Signal→deal dispatch works. Proposals export to PDF. Mobile renders. All 16 gates pass.
```

---

## PROMPT: BUILD 2 — COMMERCE APP (7 WOs)

```
OPERATION BREAKOUT — BUILD 2: COMMERCE APP

PREREQUISITE: BUILD 1 complete.

Read these files first:
1. SOCELLE-WEB/docs/operations/OPERATION_BREAKOUT.md — Build 2 section
2. .claude/CLAUDE.md — commerce boundary (§12), affiliate rules

YOU ARE BUILDING: Commerce App (#4) — 7 WOs
Commerce manages product catalog, pricing, inventory, and distribution for professional beauty products. Commerce is a MODULE — never the IA backbone.

REQUIREMENTS PER WO:
- CRUD on products, pricing tiers, inventory levels
- Product catalog with sort/filter/search
- Price comparison views from DB
- Distribution channel management
- ModuleRoute + TierGuard (auth + tier gated)
- Intelligence input: price signals trigger alerts via dispatcher
- Product performance dashboard with real data
- Export CSV, FTC-compliant affiliate badges on all linked products
- Empty/error/loading states
- Mobile: product browser + price alerts

RULES:
- No "Shop" as primary nav. No "Buy Now" as main CTA on Intelligence pages.
- FTC-compliant "Commission-linked" badges on affiliated recommendations.
- TanStack Query. RLS on all new tables.
- Run verification skills: hub-shell-detector, design-audit-suite, rls-auditor, affiliate-link-checker, build-gate
- Save verification JSON to docs/qa/

DONE WHEN: Catalog functional. Affiliate badges present. Signal→price alert dispatch works. Mobile renders. All 16 gates pass.
```

---

## PROMPT: BUILD 2 — AUTHORING CORE (6 WOs)

```
OPERATION BREAKOUT — BUILD 2: AUTHORING CORE (PLATFORM CAPABILITY)

PREREQUISITE: BUILD 1 complete.

Read these files first:
1. SOCELLE-WEB/docs/operations/OPERATION_BREAKOUT.md — Build 2, Authoring Core WOs (AUTH-CORE-01 through AUTH-CORE-06)
2. .claude/CLAUDE.md — governance
3. SOCELLE-WEB/docs/command/CMS_ARCHITECTURE.md — existing CMS block definitions

YOU ARE BUILDING: Authoring Core — the platform document layer. This is NOT Studio UI (that's Build 4). This is infrastructure that Education, Marketing, Sales, and CMS all depend on.

YOUR WOs:
- AUTH-CORE-01: Document model (JSON schema for blocks + metadata + versioning)
- AUTH-CORE-02: Block system (17 block types: heading, paragraph, bullets, KPI, signal embed, table, media, CTA, disclaimer, chart, quote, hero, text, image, video, FAQ, testimonial)
- AUTH-CORE-03: Versioning + publish states (draft → published → archived)
- AUTH-CORE-04: Export primitives (PDF + image at minimum)
- AUTH-CORE-05: "Embed intelligence" blocks (bind to signals/benchmarks — KPI block shows live signal data)
- AUTH-CORE-06: Permission model (author, reviewer, publisher roles)

RULES:
- This is infrastructure, not a hub. No shell pages — only working components and hooks.
- All 17 block types must render via PageRenderer.
- Versioning must support save→version→publish→revert.
- TanStack Query. RLS on all new tables.
- Run verification skills: authoring-core-schema-validator, hub-shell-detector, rls-auditor, build-gate
- Save verification JSON to docs/qa/

DONE WHEN: 17 block types render. Versioning works. PDF export works. Live signal blocks render data. Permission model enforced. Other Build 2 apps can consume Authoring Core.
```

---

## PROMPT: BUILD 2 — ADMIN HUB (5 WOs)

```
OPERATION BREAKOUT — BUILD 2: ADMIN HUB

PREREQUISITE: BUILD 1 complete + Build 0 CTRL-WOs complete (feature flags, audit logs exist).

Read these files first:
1. SOCELLE-WEB/docs/operations/OPERATION_BREAKOUT.md — Build 2, Admin WOs (ADMIN-WO-01 through ADMIN-WO-05)
2. .claude/CLAUDE.md — observability (§10)

YOU ARE BUILDING: Admin Hub (#15) — the system operations center. 5 WOs.

YOUR WOs:
- ADMIN-WO-01: System health dashboard (live: feeds status + AI costs + active users + error rates)
- ADMIN-WO-02: Feature flag UI (toggle per flag, user overrides, rollout slider, preview "ON for X% of Pro users")
- ADMIN-WO-03: Audit log viewer (search who-did-what-when, filter by action type/user/date)
- ADMIN-WO-04: Shell detection dashboard (shell matrix per app, remediation status, trend over time)
- ADMIN-WO-05: Inventory report viewer (display generated inventory report, diff against previous)

RULES:
- All dashboards must show REAL data from DB, not mock data.
- Feature flag UI consumes feature_flags table from CTRL-WO-01.
- Audit log viewer consumes audit_log table from CTRL-WO-03.
- TanStack Query. RLS (admin-only policies).
- Run verification skills: hub-shell-detector, system-health-dashboard-validator, feature-flag-validator, audit-log-auditor, build-gate
- Save verification JSON to docs/qa/

DONE WHEN: All 5 dashboards render live data. Feature flags toggleable. Audit log searchable. Shell matrix shows current state. All 16 gates pass.
```

---

## PROMPT: BUILD 3 — GROWTH APPS (Marketing, Booking, Brands, Professionals, Notifications)

```
OPERATION BREAKOUT — BUILD 3: GROWTH APPS

PREREQUISITE: BUILD 2 must be COMPLETE. Check docs/qa/ for all Build 2 verification JSONs.

Read these files first:
1. SOCELLE-WEB/docs/operations/OPERATION_BREAKOUT.md — Build 3 section
2. .claude/CLAUDE.md — governance, acquisition boundary (§14)
3. SOCELLE-WEB/docs/command/JOURNEY_STANDARDS.md — per-hub journeys

YOU ARE BUILDING: 5 Growth Apps — 25 WOs total
- Marketing (#6): campaigns, content calendar, analytics, multi-channel distribution
- Booking (#7): appointment scheduling, availability, confirmations, reminders
- Brands (#10): brand profiles, portfolio management, distribution tracking
- Professionals (#9): professional profiles, credentials, specializations, network
- Notifications (#17): notification engine, preferences, delivery channels, templates

EACH APP MUST HAVE ALL 10 ANTI-SHELL REQUIREMENTS:
1. Create action → DB row
2. Library view with sort/filter/search
3. Detail view from DB
4. Edit + Delete with RLS
5. Permissions (RLS + ModuleRoute + TierGuard)
6. Intelligence input (signal can spawn/update object via CrossHubActionDispatcher)
7. Proof/metrics dashboard with real data
8. Export (CSV minimum, PDF for Pro+)
9. Error/empty/loading states (premium quality)
10. Observability (errors visible in Admin Hub)

RULES:
- No cold email, DM sequences, or outreach content (§14 acquisition boundary).
- Notification engine is transactional only (auth, receipts, briefs, alerts).
- TanStack Query. RLS. ModuleRoute on all gated routes.
- Mobile screen per hub when web hub completes.
- Run verification skills per app: hub-shell-detector, design-audit-suite, rls-auditor, entitlement-validator, build-gate
- Save verification JSON to docs/qa/ per app.

DONE WHEN: All 5 apps functional with 0 shells. All 16 done gates pass per app. Mobile screens render.
```

---

## PROMPT: BUILD 4 — FULL PLATFORM + AUTHORING STUDIO UI

```
OPERATION BREAKOUT — BUILD 4: FULL PLATFORM + AUTHORING STUDIO UI

PREREQUISITE: BUILD 3 must be COMPLETE.

Read these files first:
1. SOCELLE-WEB/docs/operations/OPERATION_BREAKOUT.md — Build 4 section + Studio UI WOs
2. .claude/CLAUDE.md — governance

YOU ARE BUILDING: 7 apps + Studio UI — 35 WOs total
- Ingredients (#8): ingredient database, safety data, formulation tools
- Jobs (#11): job board, postings, applications, matching
- Events (#12): event calendar, registration, ticketing, check-in
- Reseller (#13): reseller network, territory management, performance
- Authoring Studio UI (#14b): the Canva-competitor — canvas editor, templates, collaboration
- Search (#18): unified site-wide search across all hubs
- Public Site polish (#16): conversion optimization, SEO, responsive refinement

STUDIO UI WOs (STUDIO-UI-01 through STUDIO-UI-09):
- 3-panel editor layout (block picker + canvas + properties)
- Canvas editor (Fabric.js artboard + layers + shapes)
- Data binding (connect elements to live signals/KPIs)
- Template library (50+ organized by category)
- Full export engine (PNG/JPG/PDF/PPTX/SCORM/SVG/GIF)
- SCORM course builder + export
- Collaboration (comments + approve/reject + presence)
- Brand kit system (colors/fonts/logo per org)
- Mobile quick authoring (template → fill → share in 30s)

RULES:
- Studio UI builds ON TOP of Authoring Core (Build 2). Do NOT duplicate block system or versioning.
- All other apps follow the same 10 anti-shell requirements.
- TanStack Query. RLS. ModuleRoute. Mobile per hub.
- Run verification skills per app: hub-shell-detector, design-audit-suite, rls-auditor, build-gate
- Save verification JSON to docs/qa/ per app.

DONE WHEN: All 7 apps + Studio UI functional. 0 shells. Canvas editor works. Templates render. SCORM exports. All 16 gates pass per app.
```

---

## PROMPT: BUILD 5 — MULTI-PLATFORM

```
OPERATION BREAKOUT — BUILD 5: MULTI-PLATFORM

PREREQUISITE: BUILD 4 must be COMPLETE.

Read these files first:
1. SOCELLE-WEB/docs/operations/OPERATION_BREAKOUT.md — Build 5 section
2. .claude/CLAUDE.md — multi-platform strategy (§15)

YOU ARE BUILDING: Multi-platform parity
- Flutter mobile: full parity with all web hubs (same Supabase API contracts + edge functions)
- Tauri desktop: shell wrapping same React+Vite build (no Rust business logic)
- PWA enhancements: offline support, push notifications, install prompts

RULES:
- Flutter uses same Supabase schema, RLS, edge functions as web. No TS FFI.
- Tauri is a thin wrapper — do NOT add Rust business logic.
- All MODULE_* keys must exist in mobile module_access.dart.
- Signal colors must match Pearl Mineral V2 doctrine.
- Run verification skills: mobile-parity-checker, signal-color-doctrine-checker, build-gate
- Save verification JSON to docs/qa/

DONE WHEN: Mobile has full feature parity. Desktop app launches. PWA installable. All 16 gates pass.
```

---

## NOTES FOR ALL TEAMS

1. **Read OPERATION_BREAKOUT.md first.** It has the full inventory, infrastructure status, and WO definitions.
2. **Do NOT skip verification.** Every WO needs a verification JSON in docs/qa/. No JSON = not done.
3. **Do NOT self-certify.** Run the skills listed in your prompt. 0 failures = done.
4. **All agents on main.** No worktrees. Commit after completing each WO.
5. **One WO at a time.** Complete, verify, commit, then move to next.
6. **If you find a shell, HALT and raise it.** Do not ship shells.
7. **Quality outranks time.** Nothing ships average.
