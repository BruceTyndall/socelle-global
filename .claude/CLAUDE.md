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

## §1 — SKILL LIBRARY (98 skills — USE THEM)

You have **98 operational skills** at `/.claude/skills/`. These are auditors, validators, and generators that enforce quality gates.

**Before completing any WO, run the relevant skill(s) as acceptance verification.**

Key skill mappings for current work:

| WO | Required Skills |
|----|----------------|
| WO-CMS-01 (Schema+RLS) | `schema-db-suite`, `rls-auditor`, `migration-validator` |
| WO-CMS-02 (Hooks) | `dev-best-practice-checker`, `type-generation-validator` |
| WO-CMS-03 (Admin UI) | `hub-shell-detector`, `design-audit-suite`, `route-mapper` |
| WO-CMS-04 (PageRenderer) | `seo-audit`, `design-standard-enforcer`, `e2e-test-runner` |
| WO-CMS-05 (Authoring) | `hub-shell-detector`, `copy-quality-suite` |
| WO-CMS-06 (Hub Integrations) | `live-demo-detector`, `feed-pipeline-checker` |
| V2-INTEL-* | `intelligence-module-checker`, `ai-service-menu-validator`, `signal-data-validator`, `confidence-scorer` |
| V2-HUBS-* | `hub-shell-detector`, `design-audit-suite`, `entitlement-validator` |
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

**DO NOT** resume, extend, or create new V2-TECH or V2-COMMAND WOs.

---

## §3 — ACTIVE EXECUTION PRIORITY

Execute WOs in this order. Complete each before starting the next. Check `SOCELLE_MASTER_BUILD_WO.md` for full scope and acceptance criteria.

**Current queue:**
1. WO-CMS-01 through WO-CMS-06 (CMS foundation) — **ACTIVE**
2. V2-INTEL-01 through V2-INTEL-06 (Intelligence Cloud)
3. V2-HUBS-01 through V2-HUBS-14 (All hubs non-shell)
4. V2-PLAT-01 through V2-PLAT-05 (Platform features: search, notifications, SEO, onboarding, paywall)
5. V2-MULTI-01 through V2-MULTI-03 (PWA, Tauri, Flutter)
6. V2-LAUNCH-01 through V2-LAUNCH-02 (Launch gates)

**DO NOT** skip ahead. **DO NOT** work on V2-INTEL until all WO-CMS are complete. Phase order is non-negotiable.

---

## §4 — CRITICAL DEBT (FIX BEFORE NEW WOs)

**Verified 2026-03-08 by independent audit.** These issues exist NOW. Prior agents claimed some were done — they were not.

1. **`font-serif` violations: 0 in live `src/`** — ✅ Actually fixed. Confirmed 0 in SOCELLE-WEB/src/. Old violations exist only in `.archive/SOCELLE-WEB-1/` (146 refs) which is dead code.
2. **2,027 legacy `pro-*` Tailwind token usages in portals** — admin (748), business (587), brand (288), components (377), layouts (26). Public pages are clean (0). Prior agents claimed "correctly scoped to portals" as a PASS — **this was a false exemption**. ALL `pro-*` tokens must be replaced with Pearl Mineral V2 equivalents. See `ULTRA_DRIVE_PROMPT.md` §3 for the token replacement map.
3. **79 pages using raw `useEffect` + `supabase.from()` instead of TanStack Query** — The package is installed, QueryClient is wired, but 79 pages bypass it. Only CMS hooks (8 files) and a handful of newer files actually use TanStack Query. Prior agents counted "package installed" as "done."
4. **Sentry fully wired as production dependency** — `@sentry/react` + `@sentry/vite-plugin` in package.json, `Sentry.init()` in main.tsx, SentryUserContext in App.tsx, captureException in ErrorBoundary.tsx, Sentry Vite plugin + vendor chunk + CSP allowlist in vite.config.ts. Must be completely removed.
5. **2 unit tests and 4 E2E tests** for 220 pages — functionally untested.

**Active corrective sprint:** `ULTRA_DRIVE_PROMPT.md` — 5 parallel lanes addressing all 5 items above.

Run `design-audit-suite`, `token-drift-scanner`, `dev-best-practice-checker`, `dependency-scanner`, and `test-runner-suite` after fixing to verify.

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
