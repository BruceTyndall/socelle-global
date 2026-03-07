# SOCELLE GLOBAL — TWO-LAYER SKILLS DEFINITION SPEC
**Version:** 2.0
**Date:** March 7, 2026
**Authority:** `/.claude/CLAUDE.md` §A–§J, `/docs/command/*`
**Scope:** Program-wide (Claude app) + Project-specific (SOCELLE GLOBAL)
**Focus:** Capability Uplift Skills + Encoded Preference Skills
**Operating Model:** Multi-division platform (Consumer, Professional, Student/Education) with shared intelligence layer

---

## TABLE OF CONTENTS

1. [Skill Taxonomy](#1-skill-taxonomy)
2. [Environment Baseline](#2-environment-baseline)
3. [Deliverable A — Layer 1: Program-Wide Skills](#3-deliverable-a)
4. [Deliverable B — Layer 2: Project-Specific Skills](#4-deliverable-b)
5. [Deliverable C — Install Sequence](#5-deliverable-c)
6. [Deliverable D — Verification Checklist](#6-deliverable-d)
7. [Deliverable E — Agent Enablement + Coverage Matrix](#7-deliverable-e)
8. [Appendix: Encoded Preference Registry](#8-appendix)

---

## 1. SKILL TAXONOMY

Every skill in this spec belongs to exactly one of two categories:

### 1.1 Capability Uplift Skills

Skills that **expand what agents can DO**. They add new operational abilities that don't exist without the skill.

| Property | Description |
|---|---|
| **Purpose** | Grant agents new abilities: run audits, generate reports, automate browsers, inspect databases, create other skills |
| **Triggers** | Agent needs to perform an action it couldn't otherwise perform |
| **Examples** | Playwright E2E crawl, build proof pack generator, API inventory mapper, one-command audit suite |
| **Measure of success** | Agent can now accomplish tasks that were previously manual or impossible |
| **Dependency** | May depend on encoded preference skills for rule sets, but function independently as tools |

### 1.2 Encoded Preference Skills

Skills that **programmatically enforce the owner's standards, rules, and preferences**. They encode institutional knowledge into machine-executable checks.

| Property | Description |
|---|---|
| **Purpose** | Transform governance docs, style locks, voice rules, data integrity policies, and business rules into automated validators |
| **Triggers** | Any agent output, code change, or content generation that must comply with owner doctrine |
| **Examples** | Doc Gate validator, token drift scanner, ecommerce boundary guard, banned-language linter, LIVE/DEMO truth enforcer |
| **Measure of success** | Zero governance violations reach production; 200+ encoded rules enforced without human review |
| **Source material** | `/docs/command/*` canonical doctrine (9 documents, 200+ extractable rules) |

### 1.3 Why Both Categories Matter

```
┌─────────────────────────────────────────────────────────────┐
│                    AGENT EFFECTIVENESS                       │
│                                                              │
│   Capability Uplift         Encoded Preferences              │
│   ─────────────────         ─────────────────────            │
│   "Can the agent            "Does the agent know             │
│    DO the thing?"            HOW WE DO things here?"         │
│                                                              │
│   Without uplift:           Without preferences:             │
│   Agent can't audit,        Agent audits but misses          │
│   can't crawl, can't        banned colors, wrong voice,     │
│   generate proofs           fake-live violations, etc.       │
│                                                              │
│   BOTH required for compliant, autonomous operation          │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. ENVIRONMENT BASELINE

### 2.1 Verified Tooling (Cowork VM — Ubuntu 22)

| Tool | Version | Capability |
|---|---|---|
| Node.js | 22.x | Runtime for all .mjs scripts |
| npm | 10.9 | Package management |
| Python | 3.10 | Scripting, skill-creator eval runner |
| Git | 2.34 | Version control, diff generation |
| Playwright | 1.58 | Browser automation, E2E, screenshots |
| Turbo | 2.8 | Monorepo task runner |
| jq | 1.6 | JSON processing |
| curl | 7.81 | HTTP requests |
| pandoc | installed | Document format conversion |
| LibreOffice | installed | Office doc generation |

### 2.2 Not Available in Sandbox (Available on Host Mac)

| Tool | Workaround |
|---|---|
| `tsc` (global) | Use `npx tsc --noEmit` |
| `gh` CLI | Use GitHub MCP plugin |
| `supabase` CLI | Use Supabase MCP plugin |
| Docker | Not needed — Supabase runs as hosted service |

### 2.3 Active Plugins (MCP Servers)

| Plugin | Tools Provided | Category |
|---|---|---|
| **github** | Repo read/search/edit, PR creation, issue management | Capability Uplift |
| **figma** | `get_design_context`, `get_variable_defs`, `get_metadata`, `get_screenshot` | Capability Uplift |
| **supabase** | `execute_sql`, `list_tables`, `list_migrations`, `list_edge_functions`, `get_logs`, `deploy_edge_function`, `get_advisors` | Capability Uplift |

### 2.4 Active Cowork Skills

| Skill | Category |
|---|---|
| **skill-creator** | Capability Uplift (meta-skill — creates all other skills) |
| **docx** | Capability Uplift (professional document generation) |
| **xlsx** | Capability Uplift (spreadsheet/data export) |
| **pdf** | Capability Uplift (PDF manipulation) |
| **pptx** | Capability Uplift (presentation generation) |
| **schedule** | Capability Uplift (recurring task automation) |

### 2.5 Active Hooks

| Hook | Trigger | Purpose |
|---|---|---|
| `socelle-onboard.sh` | SessionStart | Environment initialization |

---

## 3. DELIVERABLE A — LAYER 1: PROGRAM-WIDE SKILLS

Layer 1 skills are installed once in Claude (`~/.claude/`) and available across all projects. They provide the **capability foundation** that Layer 2 skills build on.

### 3.1 Capability Uplift Skills — Layer 1

These satisfy the 7 hard requirements from the user prompt:

#### A.1.1 Repo Read/Search/Edit at Scale

| Requirement | Covered By | Status | Verification |
|---|---|---|---|
| Read any file in monorepo | `Read` tool (built-in) | ✅ ACTIVE | Read any file path → contents returned |
| Search by pattern across all files | `Glob` tool (file patterns) + `Grep` tool (content search) | ✅ ACTIVE | `Glob("**/*.tsx")` returns all TSX files |
| Edit files with surgical precision | `Edit` tool (string replacement) | ✅ ACTIVE | Edit specific lines without rewriting whole file |
| Write new files | `Write` tool (full file creation) | ✅ ACTIVE | Create new scripts, skills, configs |
| Scale across 165+ source files | `Agent` tool (parallel subagent dispatch) | ✅ ACTIVE | Launch Explore agents for multi-file analysis |

#### A.1.2 Automated Build/Typecheck/Test Runner

| Requirement | Covered By | Status | Verification |
|---|---|---|---|
| TypeScript type-check | `Bash` → `cd SOCELLE-WEB && npx tsc --noEmit` | ✅ ACTIVE | Exit 0 = clean |
| Production build | `Bash` → `cd SOCELLE-WEB && npm run build` | ✅ ACTIVE | Exit 0 = dist/ created |
| Lint | `Bash` → `cd SOCELLE-WEB && npm run lint` | ✅ ACTIVE | Exit 0 = clean |
| Route manifest check | `Bash` → `cd SOCELLE-WEB && npm run routes:check` | ✅ ACTIVE | Exit 0 = manifest current |
| E2E route coverage check | `Bash` → `cd SOCELLE-WEB && npm run routes:e2e-check` | ✅ ACTIVE | Exit 0 = all routes covered |
| Fake-live guard | `Bash` → `cd SOCELLE-WEB && npm run fakelive:check` | ✅ ACTIVE | Exit 0 = baseline matches |
| Playwright E2E specs | `Bash` → `cd SOCELLE-WEB && npm run e2e` | ✅ ACTIVE | 3 spec files pass |

#### A.1.3 Browser Automation for Full-Site Audits

| Requirement | Covered By | Status | Verification |
|---|---|---|---|
| Headless browser crawl | Playwright 1.58 via Bash | ✅ ACTIVE | Run any Playwright script |
| Screenshot capture | `page.screenshot()` in Playwright specs | ✅ ACTIVE | Screenshots saved to test-results/ |
| Interactive element testing | Playwright `click()`, `fill()`, `hover()` | ✅ ACTIVE | E2E specs exercise forms and navigation |
| Visual comparison | Playwright `expect(page).toHaveScreenshot()` | ✅ AVAILABLE (not yet in specs) | Needs Layer 2 skill to implement |
| Chrome MCP (live browser) | `Claude-in-Chrome` tools (read_page, find, computer, navigate) | ✅ ACTIVE | Control actual Chrome browser |

#### A.1.4 Database Inspection + Migration Safety

| Requirement | Covered By | Status | Verification |
|---|---|---|---|
| Query any table | Supabase MCP → `execute_sql` | ✅ ACTIVE | Run SELECT queries |
| List all tables with columns | Supabase MCP → `list_tables` (verbose mode) | ✅ ACTIVE | Returns schema, columns, PKs, FKs |
| List all migrations | Supabase MCP → `list_migrations` | ✅ ACTIVE | Returns 100 migration files |
| Apply new migrations | Supabase MCP → `apply_migration` | ✅ ACTIVE | DDL operations |
| Check security advisors | Supabase MCP → `get_advisors` (security/performance) | ✅ ACTIVE | RLS policy checks, index recommendations |
| Generate TypeScript types | Supabase MCP → `generate_typescript_types` | ✅ ACTIVE | Regenerate `database.types.ts` |

#### A.1.5 API/Edge Function Invocation + Logs

| Requirement | Covered By | Status | Verification |
|---|---|---|---|
| List all Edge Functions | Supabase MCP → `list_edge_functions` | ✅ ACTIVE | Returns function slugs |
| Read Edge Function source | Supabase MCP → `get_edge_function` | ✅ ACTIVE | Returns file contents |
| Deploy Edge Functions | Supabase MCP → `deploy_edge_function` | ✅ ACTIVE | Deploy with JWT verification |
| Read logs by service | Supabase MCP → `get_logs` (api/postgres/edge-function/auth/storage/realtime) | ✅ ACTIVE | Last 24hr logs |
| Invoke via curl | `Bash` → `curl` with Supabase project URL + anon key | ✅ ACTIVE | HTTP request/response |

#### A.1.6 Secrets/Env Validation

| Requirement | Covered By | Status | Verification |
|---|---|---|---|
| Check .env files exist | `Bash` → `ls -la .env*` | ✅ ACTIVE | List env files |
| Grep for env patterns | `Grep` tool → search for `VITE_`, `SUPABASE_`, `NEXT_PUBLIC_` | ✅ ACTIVE | Find all env references |
| Verify env vars are set | `Bash` → `grep -c 'VITE_SUPABASE_URL' .env` | ✅ ACTIVE | Count matches |
| Check for leaked secrets | `Grep` → patterns for API keys, tokens in committed files | ✅ ACTIVE | Flag any matches |
| Get project API keys | Supabase MCP → `get_publishable_keys` | ✅ ACTIVE | Returns anon key status |

#### A.1.7 Diff + PR Hygiene

| Requirement | Covered By | Status | Verification |
|---|---|---|---|
| Generate diffs | `Bash` → `git diff`, `git diff --stat` | ✅ ACTIVE | Show changes |
| Create branches | `Bash` → `git checkout -b` | ✅ ACTIVE | New branch from HEAD |
| Stage + commit | `Bash` → `git add`, `git commit` | ✅ ACTIVE | Commit changes |
| Create PRs | GitHub MCP → PR creation tools | ✅ ACTIVE | Create with title, body, reviewers |
| Pre-push validation | `SOCELLE-WEB/scripts/hooks/pre-push` | ✅ ACTIVE | Blocks push on tsc/build failure |

### 3.2 Encoded Preference Skills — Layer 1

| Skill | What It Encodes | Status |
|---|---|---|
| **skill-creator** | Encodes Anthropic's best practices for skill authoring: eval loops, description optimization, blind A/B comparison, variance analysis | ✅ INSTALLED (`~/.claude/skills/skill-creator/`, 18 files) |
| **schedule** | Encodes recurring execution patterns — connects to cron-based audit runs | ✅ ACTIVE (Cowork) |
| **figma** | Encodes design-to-code handoff rules — token naming parity (Figma→CSS→Tailwind→Flutter) per `SOCELLE_FIGMA_TO_CODE_HANDOFF.md` | ✅ ACTIVE (MCP) |

### 3.3 Layer 1 Assessment

**Layer 1 is 100% COMPLETE.** All 7 hard requirements are satisfied through existing plugins, Cowork skills, and CLI tools. No new program-level installations needed.

| Requirement | Coverage | Gaps |
|---|---|---|
| Repo read/search/edit at scale | 5/5 tools active | None |
| Automated build/typecheck/test | 7/7 scripts active | None |
| Browser automation | Playwright + Chrome MCP | Visual diff not yet wired (Layer 2) |
| DB inspection + migration safety | 6/6 MCP tools active | None |
| API/Edge Function invocation + logs | 5/5 tools active | None |
| Secrets/env validation | 5/5 patterns available | Automated sweep not yet wired (Layer 2) |
| Diff + PR hygiene | 5/5 tools active | None |

---

## 4. DELIVERABLE B — LAYER 2: PROJECT-SPECIFIC SKILLS

Layer 2 skills live inside the SOCELLE GLOBAL repo. They combine Layer 1 **capabilities** with SOCELLE-specific **encoded preferences** to create autonomous compliance enforcement.

### 4.1 Existing Artifacts (Verified Against Codebase)

| # | Artifact | Path | Type | Category | What It Does |
|---|---|---|---|---|---|
| 1 | Route Manifest Generator | `SOCELLE-WEB/scripts/route-manifest.mjs` | Script | Capability Uplift | Extracts 247 routes from App.tsx → `route_manifest.generated.json` |
| 2 | E2E Route Coverage Check | `SOCELLE-WEB/scripts/e2e-route-coverage.mjs` | Script | Capability Uplift | Cross-checks routes vs `routeTable.ts` E2E entries |
| 3 | Fake-Live Guard | `SOCELLE-WEB/scripts/fake-live-guard.mjs` | Script | Encoded Preference | Detects "coming soon/mock/stub" markers; baseline-tracked (83 entries) |
| 4 | Pre-Push Hook | `SOCELLE-WEB/scripts/hooks/pre-push` | Hook | Capability Uplift | Blocks push if tsc or build fails |
| 5 | E2E Routes Spec | `SOCELLE-WEB/e2e/routes.spec.ts` | E2E | Capability Uplift | Route smoke tests |
| 6 | E2E Auth Spec | `SOCELLE-WEB/e2e/auth.spec.ts` | E2E | Capability Uplift | Auth flow tests |
| 7 | E2E AI Flow Spec | `SOCELLE-WEB/e2e/ai-flow.spec.ts` | E2E | Capability Uplift | AI orchestration flow tests |
| 8 | E2E Route Table | `SOCELLE-WEB/e2e/routeTable.ts` | Config | Encoded Preference | 214 route entries defining expected behavior |
| 9 | CI Pipeline | `SOCELLE-WEB/.github/workflows/ci.yml` | CI | Capability Uplift | 7-job pipeline: typecheck→lint→build→e2e→deploy |
| 10 | ESLint Config | `SOCELLE-WEB/eslint.config.js` | Config | Encoded Preference | React hooks, TS strict, no-unused-vars(error), no-explicit-any(warn) |
| 11 | Tailwind Config | `SOCELLE-WEB/tailwind.config.js` | Config | Encoded Preference | Pearl Mineral V2 tokens (all locked values) |
| 12 | Playwright Config | `SOCELLE-WEB/playwright.config.ts` | Config | Encoded Preference | Chromium, 30s timeout, screenshot on-failure |
| 13 | skill-creator (project) | `.claude/skills/skill-creator/` | Skill | Capability Uplift | 18 files — creates/tests/benchmarks all other skills |
| 14 | Fake-Live Baseline | `SOCELLE-WEB/docs/qa/fake_live_baseline.json` | Data | Encoded Preference | 83 known demo surface entries |

**Summary: 14 existing artifacts (8 Capability Uplift, 6 Encoded Preference)**

### 4.2 Missing Skills — Full Specification

Each skill below includes its category, the encoded preferences it enforces, and which agent categories it serves.

---

#### B.2.1 — Doc Gate Validator

| Field | Value |
|---|---|
| **Category** | **ENCODED PREFERENCE** |
| **Path** | `.claude/skills/doc-gate-validator/SKILL.md` |
| **Status** | **MISSING — P0** |
| **Purpose** | Enforces `CLAUDE.md §B` Doc Gate on ALL agent output before it reaches production |
| **What it scans** | Any agent-generated text: PR descriptions, code comments, documentation, specs, reports |

**Encoded Preferences (from CLAUDE.md §B):**

7 FAIL conditions — each is a machine-checkable rule:

| FAIL # | Rule | Detection Pattern |
|---|---|---|
| FAIL-01 | External doc reference as authority | Regex: `Per \`(?!docs/command|CLAUDE\.md).*\`` or `According to \`.*GOVERNANCE.*\`` |
| FAIL-02 | New work order/master plan doc created outside build_tracker.md | File creation in `docs/` matching `*PLAN*`, `*ORDER*`, `*REBUILD*` not in build_tracker |
| FAIL-03 | Contradiction with command docs (design locks, provenance, entitlements) | Cross-reference output against 200+ encoded rules (see Appendix) |
| FAIL-04 | Fake-live claims — numbers/timestamps not tied to real `updated_at` | Pattern: `Updated \d+ (min|hour|day)` without DB column reference |
| FAIL-05 | Omitted routes/screens vs GLOBAL_SITE_MAP.md + SITE_MAP.md | Route count < canonical count |
| FAIL-06 | Ecommerce elevated above Intelligence Hub in IA or navigation | Pattern: `Shop` in MainNav, commerce in position 1, ecommerce as platform premise |
| FAIL-07 | Outreach/cold email content drafted or sent | Pattern: `reaching out`, `partnership opportunity`, `would love to connect`, cold email templates |

PASS requirements — each is a checklist item:

| # | Requirement | Automated Check |
|---|---|---|
| P-01 | Cite file paths | Count of file path references > 0 |
| P-02 | Provide diffs/patch lists | Diff block present in output |
| P-03 | LIVE vs DEMO labels | Every data surface mention has LIVE or DEMO tag |
| P-04 | Reference command docs | At least one `docs/command/` citation |
| P-05 | Complete coverage | No page/route/screen omitted vs canonical list |
| P-06 | Proof artifacts | Build logs, curl output, screenshots, or schema diffs present |
| P-07 | WO ID sourced correctly | All WO-* IDs exist in `build_tracker.md` |

**Install Steps:**
1. Create `.claude/skills/doc-gate-validator/SKILL.md` with FAIL/PASS rule engine
2. Embed all 7 FAIL regex patterns + 7 PASS checklist validators
3. Output: JSON verdict `{pass: bool, violations: [{fail_id, message, location}]}`

**Verification:** Run skill on a known-good agent output → PASS. Run on crafted bad output with FAIL-01 through FAIL-07 triggers → each FAIL detected.

**Agent Categories:** Executive/PMO, Product+Design, Engineering, QA, SEO/Editorial — ALL agents must pass Doc Gate.

---

#### B.2.2 — One-Command Audit Suite

| Field | Value |
|---|---|
| **Category** | **CAPABILITY UPLIFT** |
| **Path** | `SOCELLE-WEB/scripts/audit-all.mjs` + `package.json` script `audit:all` |
| **Status** | **MISSING — P0** |
| **Purpose** | Single entry point that runs ALL validation scripts in correct order |

**Execution Sequence:**
```
1. npx tsc --noEmit                    (typecheck)
2. npm run lint                        (ESLint)
3. npm run routes:check                (route manifest validation)
4. npm run routes:e2e-check            (E2E coverage check)
5. npm run fakelive:check              (LIVE/DEMO truth)
6. node scripts/ecommerce-guard.mjs    (§E boundary — when built)
7. node scripts/token-drift-scanner.mjs (design tokens — when built)
8. node scripts/schema-drift.mjs       (types↔DB — when built)
```

**Behavior:** Runs all checks sequentially. Reports pass/fail for each. Exits non-zero if ANY check fails. Outputs structured JSON summary.

**Install Steps:**
1. Create `SOCELLE-WEB/scripts/audit-all.mjs`
2. Add `"audit:all": "node scripts/audit-all.mjs"` to package.json
3. Gate: tolerant of missing optional scripts (6-8) until they're built

**Verification:** `cd SOCELLE-WEB && npm run audit:all` → structured output with pass/fail per check.

**Agent Categories:** ALL agents use this before any PR or deploy.

---

#### B.2.3 — LIVE/DEMO Compliance Scanner (Extend fake-live-guard)

| Field | Value |
|---|---|
| **Category** | **ENCODED PREFERENCE** |
| **Path** | `SOCELLE-WEB/scripts/fake-live-guard.mjs` (extend existing) |
| **Status** | **PARTIAL — P0** (exists but missing patterns) |
| **Purpose** | Enforces `CLAUDE.md §F` LIVE vs DEMO truth rules |

**Existing patterns detected:** "coming soon", "mock", "stub", "placeholder", "hardcoded"

**Missing patterns to add:**

| Pattern ID | What to Detect | Rule Source |
|---|---|---|
| FAKE-LIVE-01 | `animate-pulse` or `signal-pulse` CSS class on component not backed by real-time DB subscription | §F Rule 4 |
| FAKE-LIVE-02 | `timeAgo(` or `formatDistanceToNow(` without matching `updated_at` column in same hook | §F Rule 1 |
| FAKE-LIVE-03 | Hardcoded number array displayed with counter animation (`countUp`, `animateValue`) | §F Rule 4 |
| FAKE-LIVE-04 | "Live" badge or "LIVE" text on component using static import (not DB query) | §F Rule 4 |
| FAKE-LIVE-05 | Pulsing dot (`●` or `•` with animation) on non-WebSocket/non-Supabase-realtime component | §F Rule 4 |
| FAKE-LIVE-06 | `isLive` flag missing from data hooks that display temporal data | §F Rule 3 |
| FAKE-LIVE-07 | COUNT/SUM/AVG display without corresponding `COUNT(*)` or aggregate query | §F Rule 2 |
| FAKE-LIVE-08 | "Updated X ago" on canonical DEMO surfaces (home, plans, for-brands, professionals, events, jobs) | §F canonical list |

**Encoded Preferences (from CLAUDE.md §F):**
- Every data surface must be labeled LIVE or DEMO — no ambiguity
- LIVE = real DB column with verifiable `updated_at`
- DEMO = visible `DEMO` or `PREVIEW` badge to end user
- `isLive` flag pattern from `useIntelligence.ts` must be applied to ALL new data hooks
- Never display animated indicators on static data

**Install Steps:**
1. Add 8 new AST/regex patterns to existing `fake-live-guard.mjs`
2. Update `docs/qa/fake_live_baseline.json` with new baseline
3. Test against known DEMO surfaces (home, plans, for-brands)

**Verification:** `npm run fakelive:check` → catches all 8 new pattern types. Zero false positives on known-LIVE surfaces.

**Agent Categories:** Engineering, QA, Product+Design

---

#### B.2.4 — Build Proof Pack Generator

| Field | Value |
|---|---|
| **Category** | **CAPABILITY UPLIFT** |
| **Path** | `SOCELLE-WEB/scripts/build-proof-pack.mjs` + `package.json` script `proof:pack` |
| **Status** | **MISSING — P0** |
| **Purpose** | Collects all gate outputs + evidence into a single timestamped proof bundle for release gates |

**Outputs collected:**
```json
{
  "timestamp": "ISO-8601",
  "git_sha": "abc123",
  "git_branch": "main",
  "git_diff_stat": "... files changed ...",
  "tsc_output": { "exit_code": 0, "stderr": "" },
  "build_output": { "exit_code": 0, "duration_ms": 12345 },
  "lint_output": { "exit_code": 0 },
  "routes_check": { "exit_code": 0, "route_count": 247 },
  "fakelive_check": { "exit_code": 0, "baseline_count": 83 },
  "e2e_check": { "exit_code": 0 },
  "proof_file": "docs/qa/proof_pack_2026-03-07.json"
}
```

**Encoded Preferences (from SOCELLE_RELEASE_GATES.md):**
- Pre-merge: 22 checks (tsc clean, build clean, lint clean, routes valid, no new fake-live, etc.)
- Pre-deploy: 29 checks (all pre-merge + E2E pass, no console errors, performance budgets, etc.)

**Install Steps:**
1. Create `SOCELLE-WEB/scripts/build-proof-pack.mjs`
2. Add `"proof:pack": "node scripts/build-proof-pack.mjs"` to package.json
3. Output to `docs/qa/proof_pack_YYYY-MM-DD.json`

**Verification:** `npm run proof:pack` → JSON file with all sections populated, all exit codes.

**Agent Categories:** Engineering, QA, Executive/PMO (for release sign-off)

---

#### B.2.5 — Design Token Drift Scanner

| Field | Value |
|---|---|
| **Category** | **ENCODED PREFERENCE** |
| **Path** | `.claude/skills/token-drift-scanner/SKILL.md` + `SOCELLE-WEB/scripts/token-drift-scanner.mjs` |
| **Status** | **MISSING — P1** |
| **Purpose** | Enforces Pearl Mineral V2 design system locks from `SOCELLE_CANONICAL_DOCTRINE.md §3` |

**Encoded Preferences — Color Locks:**

| Token | Locked Value | CSS Variable | Tailwind Class |
|---|---|---|---|
| `graphite` (primary text) | `#141418` | `--scl-graphite` | `text-graphite` |
| `mn.bg` (mineral background) | `#F6F3EF` | `--scl-mn-bg` | `bg-mn-bg` |
| `mn.bg.deep` | `#EDE8E1` | `--scl-mn-bg-deep` | `bg-mn-bg-deep` |
| `accent` (muted steel-blue) | `#6E879B` | `--scl-accent` | `text-accent` |
| `accent.hover` | `#5A7185` | `--scl-accent-hover` | `hover:text-accent-hover` |
| `accent.soft` | `#E8EDF1` | `--scl-accent-soft` | `bg-accent-soft` |

**Banned Color Families:**
| Family | Rule |
|---|---|
| Neon/saturated primaries | `#FF0000`, `#00FF00`, `#0000FF` or similar high-saturation |
| Bootstrap defaults | `#007bff`, `#28a745`, `#dc3545`, `#ffc107` |
| Material defaults | `#6200EE`, `#03DAC5` |
| Chakra/Tailwind defaults | Any non-SCL-prefixed color utility |
| Black-on-white stark | `#000000` text on `#FFFFFF` background (use graphite on mn.bg) |

**Encoded Preferences — Font Locks:**

| Rule | Value |
|---|---|
| Primary font | General Sans (via `font-sans` Tailwind class, mapped to `--scl-font-sans`) |
| `font-serif` | **BANNED on all public pages** |
| SCL namespace | All custom tokens use `scl-` prefix |
| Banned fonts | Times New Roman, Georgia, Palatino, system serif |

**Encoded Preferences — Glass System Locks:**

| Token | CSS Value |
|---|---|
| `glass-bg` | `rgba(255,255,255,0.72)` |
| `glass-blur` | `backdrop-filter: blur(18px)` |
| `glass-saturate` | `backdrop-filter: saturate(1.8)` |
| `glass-brightness` | `backdrop-filter: brightness(1.06)` |
| `glass-border` | `1px solid rgba(255,255,255,0.18)` |
| `glass-shadow` | `0 8px 32px rgba(0,0,0,0.06)` |
| `glass-radius` | `1.25rem` (20px) |

**Scanner Logic:**
1. Parse `tailwind.config.js` → extract all locked token values
2. Grep all `.tsx`, `.css`, `.scss` files for:
   - Hardcoded hex colors not in the token set
   - `font-serif` usage on public routes
   - Non-SCL-prefixed custom color utilities
   - Raw `rgba()` values that should use glass tokens
   - Bootstrap/Material/Chakra default color values
3. Cross-reference public routes (from route manifest) vs serif usage
4. Output: violations list with `{file, line, rule_id, found_value, expected_value}`

**Verification:** Run scanner → zero violations on already-compliant files. Plant a `#007bff` in a test file → scanner catches it.

**Agent Categories:** Product+Design, Engineering, QA

---

#### B.2.6 — Ecommerce Boundary Guard

| Field | Value |
|---|---|
| **Category** | **ENCODED PREFERENCE** |
| **Path** | `SOCELLE-WEB/scripts/ecommerce-guard.mjs` |
| **Status** | **MISSING — P1** |
| **Purpose** | Enforces `CLAUDE.md §E` — ecommerce is a module, never the platform premise |

**Encoded Preferences (from CLAUDE.md §E):**

| Rule | Check |
|---|---|
| Ecommerce not in MainNav | Parse MainNav component → verify position 1 = Intelligence, no "Shop" link |
| Ecommerce never leads product messaging | Grep public page H1/H2 headings for commerce-first language |
| "Shop" is never the first action | Check all CTA buttons on `/`, `/for-brands`, `/professionals` for "Shop" as primary |
| Commerce routes are portal-scoped | Verify all `/portal/orders`, `/brand/orders`, `/brand/products`, `/admin/orders` are behind ProtectedRoute |
| Discovery→Intelligence→Trust→Transaction flow | Check canonical user flow in navigation components |

**Encoded Preferences — MainNav Position Locks:**

| Position | Required Link | Source |
|---|---|---|
| 1 | Intelligence | CLAUDE.md §E |
| 2-8 | Non-commerce (Brands, Education, Protocols, etc.) | SITE_MAP.md |

**Verification:** `node scripts/ecommerce-guard.mjs` → PASS. Modify MainNav to add "Shop" at position 1 → FAIL detected.

**Agent Categories:** Product+Design, Engineering, SEO/Editorial

---

#### B.2.7 — API/Feed Inventory + Route Map Generator

| Field | Value |
|---|---|
| **Category** | **CAPABILITY UPLIFT** |
| **Path** | `SOCELLE-WEB/scripts/api-inventory.mjs` |
| **Status** | **PARTIAL — P1** (route manifest exists, API/feed mapping missing) |
| **Purpose** | Maps the complete API surface: Edge Functions, hooks→tables, routes→data sources |

**Outputs:**
```json
{
  "edge_functions": [
    { "slug": "ai-orchestrator", "method": "POST", "path": "/functions/v1/ai-orchestrator", "jwt_required": true },
    { "slug": "feed-orchestrator", "method": "POST", "path": "/functions/v1/feed-orchestrator", "jwt_required": true }
  ],
  "hook_mappings": [
    { "hook": "useIntelligence", "table": "market_signals", "isLive": true },
    { "hook": "useBrands", "table": "brands", "isLive": true }
  ],
  "route_count": 247,
  "gated_route_count": 69,
  "public_route_count": 178
}
```

**Install Steps:**
1. Create `SOCELLE-WEB/scripts/api-inventory.mjs`
2. Parse all `use*.ts` files in `src/hooks/` → extract table names from Supabase queries
3. List Edge Functions via Supabase MCP or parse `supabase/functions/` directory
4. Cross-reference with route manifest for complete surface map
5. Output to `docs/qa/api_inventory.generated.json`

**Verification:** `node scripts/api-inventory.mjs` → JSON with all Edge Functions and hook mappings. Count matches expected.

**Agent Categories:** Engineering, Data/AI, Security

---

#### B.2.8 — Schema-Types Drift Detector

| Field | Value |
|---|---|
| **Category** | **CAPABILITY UPLIFT** |
| **Path** | `SOCELLE-WEB/scripts/schema-drift.mjs` |
| **Status** | **MISSING — P1** |
| **Purpose** | Detects drift between `database.types.ts` (1,647 lines, 70+ tables) and live Supabase schema |

**Logic:**
1. Parse `database.types.ts` → extract table names + column names + types
2. Query Supabase via MCP `list_tables` (verbose) → get live schema
3. Diff: tables in types but not in DB, tables in DB but not in types, column mismatches
4. Output: `{drift: [{table, column, types_value, db_value, action_needed}]}`

**Verification:** Run after `generate_typescript_types` → zero drift. Manually add a fake table to types → drift detected.

**Agent Categories:** Engineering, Data/AI

---

#### B.2.9 — Asset Merchandising Validator

| Field | Value |
|---|---|
| **Category** | **ENCODED PREFERENCE** |
| **Path** | `SOCELLE-WEB/scripts/asset-validator.mjs` |
| **Status** | **MISSING — P2** |
| **Purpose** | Ensures all visual assets are owner-approved; bans Figma placeholders and stock photos |

**Encoded Preferences (from DATA_PROVENANCE_POLICY + owner directives):**

| Rule | Check |
|---|---|
| No Figma placeholder URLs | Grep for `figma.com/`, `via.placeholder.com`, `placehold.co` |
| No stock photo domains | Grep for `unsplash.com`, `pexels.com`, `shutterstock.com`, `istockphoto.com`, `gettyimages.com` |
| No broken asset paths | Verify all `src=` and `url()` references resolve to files in `public/` or `assets/` |
| Hero media = owner assets only | Images in hero sections must be from approved asset list (owner decision required) |
| News/editorial images need attribution | Per DATA_PROVENANCE_POLICY — news images must cite source, date, confidence |

**Encoded Preferences — Confidence Scoring (from DATA_PROVENANCE_POLICY):**

| Field | Rule |
|---|---|
| Formula | `confidence = base_trust × recency_factor × corroboration_factor` |
| Display tiers | HIGH (≥0.8, green), MODERATE (0.5-0.79, amber), LOW (<0.5, red with disclaimer) |
| Attribution | Source name + retrieval date + confidence tier must be shown |

**Owner Decision Required:** Approved asset domain list (e.g., `assets.socelle.com`, `socelle-cdn.supabase.co`)

**Verification:** `node scripts/asset-validator.mjs` → list of flagged assets. Plant a `unsplash.com` URL → flagged.

**Agent Categories:** Product+Design, SEO/Editorial, Engineering

---

#### B.2.10 — Admin Toggles Audit

| Field | Value |
|---|---|
| **Category** | **CAPABILITY UPLIFT** + **ENCODED PREFERENCE** |
| **Path** | `.claude/skills/admin-toggles-audit/SKILL.md` |
| **Status** | **MISSING — P2** |
| **Purpose** | Verifies `data_feeds.is_enabled` flags match `feed-orchestrator` Edge Function wiring |

**Logic:**
1. Query `data_feeds` table via Supabase MCP → get all `is_enabled` flags
2. Read `feed-orchestrator` Edge Function source → extract handler mappings
3. Cross-reference: enabled feeds with no handler, disabled feeds still being called, handlers with no feed entry
4. Output: toggle status matrix with consistency verdict

**Encoded Preferences:** Feeds marked `is_enabled=true` MUST have a corresponding handler in `feed-orchestrator`. No orphan handlers. No phantom toggles.

**Verification:** Run skill → matrix shows all toggles consistent. Flip a toggle in test → mismatch detected.

**Agent Categories:** Engineering, Data/AI, QA

---

#### B.2.11 — Subscription Gate Verifier

| Field | Value |
|---|---|
| **Category** | **ENCODED PREFERENCE** |
| **Path** | `.claude/skills/subscription-gate-audit/SKILL.md` |
| **Status** | **MISSING — P2** |
| **Purpose** | Enforces `SOCELLE_ENTITLEMENTS_PACKAGING.md` mini-app unlock map against actual `ModuleRoute` wrappers |

**Encoded Preferences (from ENTITLEMENTS_PACKAGING.md):**

| Tier | Access Level |
|---|---|
| Free (Preview) | 9 free preview rules — limited views, no downloads, time-gated |
| Starter | Base intelligence + limited benchmarks |
| Professional | Full intelligence + benchmarks + brand reports |
| Enterprise | Everything + API access + custom feeds |

**Encoded Preferences — Free Preview Rules:**
1. Intelligence Hub: view top 3 signals only, no detail pages
2. Benchmarks: view summary only, no drill-down
3. Brand Profiles: view public info only, no analytics
4. Protocols: view titles + first paragraph, no full content
5. Education: view module titles, no video/quiz access
6. Events: view upcoming 3 events, no registration
7. Jobs: view 5 listings, no apply button
8. Reports: view cover page only, no download
9. Time gate: preview expires after 7 days without signup

**Encoded Preferences — Mini-App Unlock Map (12 rules):**
Each `ModuleRoute` in App.tsx (69 gated routes) maps to a tier. This skill verifies every gated route references the correct tier per the unlock map.

**Logic:**
1. Parse App.tsx → extract all `ModuleRoute` wrappers with their `requiredTier` prop
2. Cross-reference against ENTITLEMENTS_PACKAGING.md unlock map
3. Flag: wrong tier, missing gate, ungated route that should be gated
4. Check `paymentBypass.ts` status and flag if bypass is enabled in production

**Verification:** Run skill → compliance matrix. All 69 gated routes correctly mapped.

**Agent Categories:** Product+Design, Engineering, RevOps

---

#### B.2.12 — Outreach Email Blocker

| Field | Value |
|---|---|
| **Category** | **ENCODED PREFERENCE** |
| **Path** | `SOCELLE-WEB/scripts/outreach-guard.mjs` |
| **Status** | **MISSING — P2** |
| **Purpose** | Enforces `CLAUDE.md §G` — no outreach/cold email content anywhere |

**Encoded Preferences (from CLAUDE.md §G):**

| Rule | Detection |
|---|---|
| No cold email copy | Grep for: "reaching out", "partnership opportunity", "would love to connect", "Hi {name}", "Dear {name}" |
| No cold DM scripts | Grep for: "DM template", "LinkedIn message", "connection request" |
| No acquisition outreach | Grep for: "acquisition email", "outbound campaign", "email sequence" |
| `send-email` is transactional only | Parse Edge Function → verify only order confirmations, password resets, access notifications |
| Acquisition = on-site only | CTA flow: public pages → "Get Intelligence Access" → `/request-access` → `access_requests` table |

**Verification:** `node scripts/outreach-guard.mjs` → PASS. Plant cold email template → detected.

**Agent Categories:** SEO/Editorial, RevOps, Customer Ops

---

#### B.2.13 — Banned Language Linter

| Field | Value |
|---|---|
| **Category** | **ENCODED PREFERENCE** |
| **Path** | `.claude/skills/banned-language-linter/SKILL.md` |
| **Status** | **MISSING — P1** |
| **Purpose** | Enforces `SOCELLE_CANONICAL_DOCTRINE.md §9` — 67 banned SaaS terms + 10 banned CTAs |

**Encoded Preferences — Banned SaaS Terms (67 total, sample):**

| # | Banned Term | Replacement |
|---|---|---|
| 1 | "dashboard" | "portal", "hub", "workspace" |
| 2 | "onboard" / "onboarding" | "get started", "begin" |
| 3 | "leverage" | "use", "apply" |
| 4 | "scalable" | describe specific capacity |
| 5 | "ecosystem" | "network", "community" |
| 6 | "disrupt" / "disruptive" | describe specific change |
| 7 | "synergy" | describe specific benefit |
| 8 | "paradigm" | describe specific model |
| 9 | "empower" | describe specific ability gained |
| 10 | "unlock" (as marketing verb) | describe specific access granted |
| ... | (57 more in CANONICAL_DOCTRINE §9) | ... |

**Encoded Preferences — Banned CTAs (10 total):**

| # | Banned CTA | Why |
|---|---|---|
| 1 | "Sign Up Free" | Generic SaaS |
| 2 | "Start Your Free Trial" | Generic SaaS |
| 3 | "Get Started Today" | Generic SaaS |
| 4 | "Join Now" | Generic SaaS |
| 5 | "Subscribe" (as primary CTA) | Newsletter-coded |
| 6 | "Buy Now" | Commerce-first (violates §E) |
| 7 | "Shop Now" | Commerce-first (violates §E) |
| 8 | "Add to Cart" (as primary page CTA) | Commerce-first |
| 9 | "Book a Demo" | Enterprise SaaS |
| 10 | "Request a Quote" | Enterprise SaaS |

**Approved CTAs:** "Get Intelligence Access", "Request Access", "Explore Intelligence", "View Report"

**Scanner Logic:**
1. Read full banned terms list from `SOCELLE_CANONICAL_DOCTRINE.md §9`
2. Grep all `.tsx`, `.md`, `.json` (copy/content) files for banned terms
3. Context-aware: "unlock" in code logic (feature flags) is OK; "unlock" in user-facing copy is BANNED
4. Output: violations with file:line:term and suggested replacement

**Verification:** Plant "Start Your Free Trial" in a component → detected. "unlock" in `if (feature.unlock)` → NOT flagged.

**Agent Categories:** Product+Design, SEO/Editorial, Engineering, Customer Ops

---

#### B.2.14 — Voice + Controlled Vocabulary Enforcer

| Field | Value |
|---|---|
| **Category** | **ENCODED PREFERENCE** |
| **Path** | `.claude/skills/voice-enforcer/SKILL.md` |
| **Status** | **MISSING — P1** |
| **Purpose** | Enforces `SOCELLE_CANONICAL_DOCTRINE.md §8` voice rules + controlled vocabulary |

**Encoded Preferences — Voice Rules (9 rules):**

| # | Rule | Check |
|---|---|---|
| VOICE-01 | Authority without arrogance | Flag superlatives: "best", "leading", "premier", "#1" |
| VOICE-02 | Intelligence over hype | Flag hype words: "revolutionary", "game-changing", "cutting-edge" |
| VOICE-03 | Precision over vagueness | Flag vague claims: "many", "a lot of", "various" without specifics |
| VOICE-04 | Earned credibility | Flag unearned claims: "trusted by thousands", "industry-leading" without data |
| VOICE-05 | Calm confidence | Flag urgency language: "Don't miss out!", "Limited time!", "Act now!" |
| VOICE-06 | Mineral tone | Flag warm/casual: "Hey there!", "We're super excited!", emoji in copy |
| VOICE-07 | Professional equals | Flag condescending: "Simply do X", "Just follow these easy steps" |
| VOICE-08 | Show don't tell | Flag telling: "Our powerful platform" without demonstrating power |
| VOICE-09 | Understated elegance | Flag overstatement: exclamation marks in headlines, ALL CAPS in body |

**Encoded Preferences — Controlled Vocabulary (9 terms):**

| Internal Term | Public-Facing Term | Never Use |
|---|---|---|
| market_signals | Intelligence Signals | "data feed", "analytics" |
| brand_health | Brand Intelligence | "brand score", "brand rank" |
| canonical_protocols | Industry Protocols | "best practices", "guidelines" |
| brand_training_modules | Professional Education | "courses", "lessons" |
| access_requests | Intelligence Access Requests | "signup", "registration" |
| data_feeds | Intelligence Feeds | "APIs", "data streams" |
| subscription_tier | Intelligence Tier | "plan", "package", "pricing tier" |
| portal | Intelligence Portal | "dashboard", "admin panel" |
| benchmarks | Industry Benchmarks | "analytics", "KPIs" |

**Verification:** Plant "Hey there! We're super excited about our game-changing platform!" → 4 voice violations detected.

**Agent Categories:** SEO/Editorial, Product+Design, Customer Ops

---

#### B.2.15 — Data Provenance Validator

| Field | Value |
|---|---|
| **Category** | **ENCODED PREFERENCE** |
| **Path** | `.claude/skills/data-provenance-validator/SKILL.md` |
| **Status** | **MISSING — P2** |
| **Purpose** | Enforces `SOCELLE_DATA_PROVENANCE_POLICY.md` — source attribution, confidence, freshness |

**Encoded Preferences — Freshness SLAs:**

| Data Category | Max Staleness | Table/Source |
|---|---|---|
| Market signals | 1 hour | `market_signals.updated_at` |
| Job postings | 4 hours | `job_postings.updated_at` |
| Brand health | 24 hours | `brand_health.updated_at` |
| Events | 24 hours | `events.updated_at` |
| Benchmarks | 7 days | `benchmarks.updated_at` |

**Encoded Preferences — Allowed Sources:**

| Source Type | Allowed | Rule |
|---|---|---|
| Government databases | Yes | FDA, USDA, EPA, state licensing boards |
| Industry associations | Yes | With attribution + date |
| Brand-submitted data | Yes | Verified via brand portal |
| Social media scraping | No | Violates provenance policy |
| Competitor pricing scraping | No | Violates provenance policy |
| Anonymous tips | No | Unverifiable |
| AI-generated without citation | No | Must cite training data source |

**Encoded Preferences — Disallowed Sources (7):**
1. Social media scraping (any platform)
2. Competitor pricing/inventory scraping
3. Anonymous or unverified submissions
4. AI-generated content without source attribution
5. Paywalled content reproduced without license
6. User-generated reviews used as authoritative data
7. Outdated government data (>1 year for regulatory, >6 months for market)

**Verification:** Check `market_signals` freshness → confirm within 1hr SLA. Flag data with no source attribution.

**Agent Categories:** Data/AI, Engineering, QA

---

#### B.2.16 — Playwright Full-Crawl + Button-Click + Screenshot Diff (Extend E2E)

| Field | Value |
|---|---|
| **Category** | **CAPABILITY UPLIFT** |
| **Path** | `SOCELLE-WEB/e2e/` (extend existing specs) |
| **Status** | **PARTIAL — P2** (3 specs exist, missing button-click + screenshot diff + dead-end detection) |
| **Purpose** | Full visual regression baseline + interactive element coverage |

**Missing capabilities:**
1. Click ALL interactive elements per route (buttons, links, dropdowns, modals)
2. Capture screenshots via `page.screenshot()` per route (before + after interaction)
3. Visual diff via `expect(page).toHaveScreenshot()` (Playwright built-in)
4. Dead-end detection: pages with no outbound navigation links
5. Broken link detection: links that 404 or redirect unexpectedly

**Install Steps:**
1. Extend `routes.spec.ts` with interaction tests
2. Create `e2e/visual-regression.spec.ts` for screenshot baselines
3. Add `"e2e:screenshots"` and `"e2e:visual-diff"` scripts
4. Store baselines in `e2e/screenshots/` (gitignored, regenerated in CI)

**Verification:** Run E2E → all routes visited, all buttons clicked, screenshots captured, no dead-ends.

**Agent Categories:** QA, Engineering, Product+Design

---

#### B.2.17 — Env/Secrets Sweep

| Field | Value |
|---|---|
| **Category** | **ENCODED PREFERENCE** + **CAPABILITY UPLIFT** |
| **Path** | `SOCELLE-WEB/scripts/secrets-sweep.mjs` |
| **Status** | **MISSING — P1** |
| **Purpose** | Automated scan for leaked secrets, missing env vars, and env file hygiene |

**Scans:**
1. Grep committed files for patterns: API keys, JWT tokens, private keys, `sk_live_`, `pk_live_`
2. Verify `.env.example` has all variables referenced in code
3. Verify `.env` is in `.gitignore`
4. Check `VITE_PAYMENT_BYPASS` is not `true` in production env
5. Verify Supabase anon key is publishable (not service role key)

**Encoded Preferences:**
- `VITE_PAYMENT_BYPASS=true` → FAIL in production (all users treated as PRO)
- Service role key in client-side code → CRITICAL FAIL
- `.env` committed to git → CRITICAL FAIL

**Verification:** `node scripts/secrets-sweep.mjs` → PASS. Plant `sk_live_test123` in a file → detected.

**Agent Categories:** Security, Engineering, QA

---

#### B.2.18 — Release Gate Runner

| Field | Value |
|---|---|
| **Category** | **ENCODED PREFERENCE** |
| **Path** | `.claude/skills/release-gate-runner/SKILL.md` |
| **Status** | **MISSING — P1** |
| **Purpose** | Enforces ALL checks from `SOCELLE_RELEASE_GATES.md` as a single pass/fail gate |

**Encoded Preferences — Pre-Merge Checklist (22 checks):**
TypeScript clean, ESLint clean, build succeeds, route manifest current, E2E route coverage complete, fake-live baseline current, no new banned terms, no Figma placeholders, Doc Gate pass, WO ID valid, LIVE/DEMO labels present, diff provided, file paths cited, command doc referenced, proof artifacts present, no outreach copy, ecommerce boundary respected, design tokens compliant, schema in sync, env vars validated, performance budget met, no console errors.

**Encoded Preferences — Pre-Deploy Checklist (29 checks):**
All pre-merge checks + E2E specs pass, visual regression pass, broken link scan clean, SEO meta tags present, OG images valid, sitemap current, robots.txt correct, HTTPS enforced, CORS configured, rate limiting active, error pages styled.

**Verification:** Run full release gate → pass/fail with specific violation list.

**Agent Categories:** Engineering, QA, Executive/PMO

---

#### B.2.19 — SEO + Meta Compliance Scanner

| Field | Value |
|---|---|
| **Category** | **ENCODED PREFERENCE** + **CAPABILITY UPLIFT** |
| **Path** | `SOCELLE-WEB/scripts/seo-scanner.mjs` |
| **Status** | **MISSING — P2** |
| **Purpose** | Validates SEO requirements from `BRAND_SURFACE_INDEX.md` + canonical doctrine |

**Checks:**
1. Every public route has `<title>`, `<meta name="description">`, OG tags
2. No duplicate titles across routes
3. `robots.txt` allows public routes, blocks portal routes
4. `sitemap.xml` includes all public routes from route manifest
5. Canonical URLs present and correct
6. H1 tag present on every page (exactly one)
7. Image alt text on all `<img>` elements
8. Schema.org structured data on brand profile pages

**Verification:** `node scripts/seo-scanner.mjs` → compliance report. Missing OG tag → flagged.

**Agent Categories:** SEO/Editorial, Engineering

---

#### B.2.20 — Figma-to-Code Drift Checker

| Field | Value |
|---|---|
| **Category** | **ENCODED PREFERENCE** |
| **Path** | `.claude/skills/figma-code-drift/SKILL.md` |
| **Status** | **MISSING — P2** |
| **Purpose** | Enforces `SOCELLE_FIGMA_TO_CODE_HANDOFF.md` — token naming parity across Figma→CSS→Tailwind→Flutter |

**Encoded Preferences (from FIGMA_TO_CODE_HANDOFF.md):**

| Rule | Check |
|---|---|
| Token naming parity | Figma token `graphite` = CSS `--scl-graphite` = Tailwind `text-graphite` = Flutter `SocelleTheme.graphite` |
| Component naming | Figma `SCL/Button/Primary` = React `ButtonPrimary` = Flutter `SclButtonPrimary` |
| Breakpoints | Figma frames match Tailwind breakpoints (sm:640, md:768, lg:1024, xl:1280) |
| Grid system | 12-column grid, 24px gutter, 1280px max-width |
| Export rules | SVG for icons, WebP for photos, no PNG above 100KB |

**Logic:**
1. Use Figma MCP `get_variable_defs` → extract token names + values
2. Compare against `tailwind.config.js` token definitions
3. Compare against Flutter `socelle_theme.dart` (if accessible)
4. Flag any naming mismatches or value drift

**Verification:** Run skill → zero drift between Figma and code. Rename a Tailwind token → drift detected.

**Agent Categories:** Product+Design, Engineering

---

### 4.3 Summary Table

| Status | Count | Items |
|---|---|---|
| **Existing (verified)** | 14 | Route manifest, E2E coverage check, fake-live guard, pre-push hook, 3 E2E specs, route table, CI pipeline, ESLint config, Tailwind config, Playwright config, skill-creator, fake-live baseline |
| **Partial (extend)** | 3 | Fake-live guard (needs 8 new patterns), E2E specs (needs button-click + screenshots), API inventory (needs Edge Function + hook mapping) |
| **Missing (build)** | 17 | Doc Gate, audit-all, build proof pack, token drift, ecommerce guard, schema drift, asset validator, admin toggles, subscription gate, outreach guard, banned language linter, voice enforcer, data provenance, secrets sweep, release gate runner, SEO scanner, Figma-code drift |
| **TOTAL TO BUILD** | 20 | 3 extensions + 17 new |

**By Category:**

| Category | Count | Skills |
|---|---|---|
| **Capability Uplift** | 8 | audit-all, build proof pack, API inventory, schema drift, admin toggles, Playwright extend, secrets sweep, SEO scanner |
| **Encoded Preference** | 10 | Doc Gate, fake-live extend, token drift, ecommerce guard, asset validator, subscription gate, outreach guard, banned language, voice enforcer, data provenance, release gate, Figma-code drift |
| **Both** | 2 | admin toggles audit, secrets sweep (capability + preference) |

---

## 5. DELIVERABLE C — INSTALL SEQUENCE

### Phase 1: Governance Core (P0 — Launch Blockers)

**Dependency:** None — these are foundational.

```
Build Order:
  1. doc-gate-validator/SKILL.md        [ENCODED PREFERENCE]  — all other output must pass this
  2. audit-all.mjs                      [CAPABILITY UPLIFT]   — single command entry point
  3. fake-live-guard.mjs (extend)       [ENCODED PREFERENCE]  — add 8 new patterns
  4. build-proof-pack.mjs               [CAPABILITY UPLIFT]   — evidence collection

Verification Gate:
  ✓ npm run audit:all passes
  ✓ Doc Gate validates own output
  ✓ Proof pack generates valid JSON
```

### Phase 2: Design + Language Compliance (P1)

**Dependency:** Phase 1 complete (audit-all available to test).

```
Build Order:
  5. token-drift-scanner/SKILL.md       [ENCODED PREFERENCE]  — design system enforcement
  6. banned-language-linter/SKILL.md     [ENCODED PREFERENCE]  — 67 banned terms + 10 CTAs
  7. voice-enforcer/SKILL.md             [ENCODED PREFERENCE]  — 9 voice rules + vocabulary
  8. ecommerce-guard.mjs                 [ENCODED PREFERENCE]  — §E boundary
  9. release-gate-runner/SKILL.md        [ENCODED PREFERENCE]  — 22+29 checks unified

Verification Gate:
  ✓ Token scan finds zero violations in compliant code
  ✓ Banned language scan catches planted violations
  ✓ Voice enforcer flags test content
  ✓ Ecommerce guard confirms MainNav compliance
  ✓ Release gate runs all checks end-to-end
```

### Phase 3: Data Integrity (P1)

**Dependency:** Phase 1 complete.

```
Build Order:
  10. api-inventory.mjs (extend)        [CAPABILITY UPLIFT]   — Edge Function + hook→table map
  11. schema-drift.mjs                   [CAPABILITY UPLIFT]   — types↔DB comparison
  12. secrets-sweep.mjs                  [CAPABILITY + PREF]   — env hygiene + leak detection

Verification Gate:
  ✓ API inventory JSON has all Edge Functions
  ✓ Schema drift reports zero mismatch
  ✓ Secrets sweep finds no leaks
```

### Phase 4: Business Logic Compliance (P2)

**Dependency:** Phases 1-3 complete.

```
Build Order:
  13. asset-validator.mjs               [ENCODED PREFERENCE]  — merchandising rules
  14. admin-toggles-audit/SKILL.md      [CAPABILITY + PREF]   — feed toggle wiring
  15. subscription-gate-audit/SKILL.md   [ENCODED PREFERENCE]  — entitlements enforcement
  16. outreach-guard.mjs                 [ENCODED PREFERENCE]  — §G cold email block
  17. data-provenance-validator/SKILL.md [ENCODED PREFERENCE]  — source + freshness rules

Verification Gate:
  ✓ Asset validator catches placeholder URLs
  ✓ Toggle audit shows all feeds consistent
  ✓ Subscription gates match unlock map
  ✓ Outreach guard blocks cold email patterns
  ✓ Provenance validator checks freshness SLAs
```

### Phase 5: Visual Regression + SEO (P2)

**Dependency:** Phase 1 complete (proof pack for evidence).

```
Build Order:
  18. E2E extend (button-click + screenshots) [CAPABILITY UPLIFT]  — visual regression
  19. seo-scanner.mjs                          [CAPABILITY + PREF]  — meta + structured data
  20. figma-code-drift/SKILL.md                [ENCODED PREFERENCE]  — handoff compliance

Verification Gate:
  ✓ E2E screenshots captured for all routes
  ✓ SEO scanner finds all public routes have meta tags
  ✓ Figma-code drift reports zero mismatches
```

### Wire Into CI (After All Phases)

```
ci.yml additions:
  1. "audit:all" in lint job                    (Phase 1)
  2. "proof:pack" as post-build artifact        (Phase 1)
  3. token-drift-scanner in pre-push hook       (Phase 2)
  4. ecommerce-guard in pre-push hook           (Phase 2)
  5. banned-language check in lint job           (Phase 2)
  6. schema-drift in pre-deploy check           (Phase 3)
  7. secrets-sweep in pre-push hook             (Phase 3)
  8. release-gate-runner as deploy gatekeeper   (Phase 2)
  9. seo-scanner in pre-deploy check            (Phase 5)
```

---

## 6. DELIVERABLE D — VERIFICATION CHECKLIST

### Program-Level Verification

| # | Check | Command / Method | Expected |
|---|---|---|---|
| 1 | skill-creator installed | `ls ~/.claude/skills/skill-creator/SKILL.md` | File exists, 486 lines |
| 2 | GitHub plugin active | `~/.claude/settings.json` → `enabledPlugins` | `true` |
| 3 | Figma plugin active | `~/.claude/settings.json` → `enabledPlugins` | `true` |
| 4 | Supabase plugin active | `~/.claude/settings.json` → `enabledPlugins` | `true` |
| 5 | Context Mode removed | `ls ~/.claude/context-mode/ 2>&1` | "No such file or directory" |
| 6 | SessionStart hook active | `~/.claude/settings.json` → `hooks` | `socelle-onboard.sh` present |
| 7 | Cowork skills available | List skills in session | docx, xlsx, pdf, pptx, schedule present |
| 8 | CLI tools available | `node -v && npm -v && python3 -V && git --version` | All return versions |
| 9 | Playwright available | `npx playwright --version` | 1.58+ |

### Project-Level — Current State

| # | Check | Command | Expected |
|---|---|---|---|
| 1 | TypeScript clean | `cd SOCELLE-WEB && npx tsc --noEmit` | Exit 0 |
| 2 | Build succeeds | `cd SOCELLE-WEB && npm run build` | Exit 0 |
| 3 | Route manifest current | `cd SOCELLE-WEB && npm run routes:check` | Exit 0 |
| 4 | Fake-live baseline current | `cd SOCELLE-WEB && npm run fakelive:check` | Exit 0 |
| 5 | E2E route coverage | `cd SOCELLE-WEB && npm run routes:e2e-check` | Exit 0 |
| 6 | Lint clean | `cd SOCELLE-WEB && npm run lint` | Exit 0 |
| 7 | skill-creator in project | `ls .claude/skills/skill-creator/SKILL.md` | File exists |
| 8 | CI pipeline exists | `ls SOCELLE-WEB/.github/workflows/ci.yml` | File exists, 7 jobs |

### Project-Level — After Each Phase

**After Phase 1:**

| # | Check | Expected |
|---|---|---|
| 1 | `npm run audit:all` | All 5+ checks pass |
| 2 | Doc Gate on test output | PASS verdict |
| 3 | `npm run proof:pack` | JSON file generated |
| 4 | `npm run fakelive:check` (extended) | 8 new patterns active |

**After Phase 2:**

| # | Check | Expected |
|---|---|---|
| 5 | Token drift scan | Zero unapproved hex in public pages |
| 6 | Banned language scan | Zero banned terms in user-facing copy |
| 7 | Voice enforcer | Zero voice violations |
| 8 | Ecommerce guard | PASS — commerce not in MainNav |
| 9 | Release gate runner | Full 22+29 check suite passes |

**After Phase 3:**

| # | Check | Expected |
|---|---|---|
| 10 | API inventory | JSON with all Edge Functions + hook mappings |
| 11 | Schema drift | Zero type↔DB mismatches |
| 12 | Secrets sweep | No leaked keys, no env issues |

**After Phase 4:**

| # | Check | Expected |
|---|---|---|
| 13 | Asset validator | No placeholders or stock photos |
| 14 | Admin toggles audit | All feeds consistent |
| 15 | Subscription gate audit | All 69 gated routes correct |
| 16 | Outreach guard | No cold email patterns |
| 17 | Data provenance | All freshness SLAs met |

**After Phase 5:**

| # | Check | Expected |
|---|---|---|
| 18 | E2E screenshots | All routes captured |
| 19 | SEO scanner | All public routes have meta tags |
| 20 | Figma-code drift | Zero naming/value mismatches |

---

## 7. DELIVERABLE E — AGENT ENABLEMENT + COVERAGE MATRIX

### 7.1 Multi-Division Operating Model

SOCELLE operates across 3 divisions with shared platform infrastructure:

| Division | Audience | Key Portals | Unique Needs |
|---|---|---|---|
| **Consumer** | End consumers discovering beauty/wellness brands | Public site, `/intelligence` | Trust signals, brand discovery, ingredient transparency |
| **Professional** | Licensed professionals (estheticians, dermatologists, stylists) | `/portal/*` | Protocols, education modules, benchmarks, professional intelligence |
| **Student/Education** | Students and educators in beauty/wellness programs | `/education/*` | Training modules, certification paths, protocol study |

**Shared layer:** Intelligence Hub, brand profiles, canonical protocols, market signals — these serve ALL divisions through the same data infrastructure with tier-gated access.

### 7.2 Agent Category × Skill Coverage Matrix

| Skill | Exec/PMO | Prod+Design | Engineering | Data/AI | Security | QA | SEO/Edit | RevOps | CustOps |
|---|---|---|---|---|---|---|---|---|---|
| **Phase 1** | | | | | | | | | |
| Doc Gate Validator | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| Audit Suite (audit-all) | ● | ○ | ● | ○ | ○ | ● | ○ | ○ | ○ |
| LIVE/DEMO Scanner (extend) | ○ | ● | ● | ● | ○ | ● | ○ | ○ | ○ |
| Build Proof Pack | ● | ○ | ● | ○ | ○ | ● | ○ | ○ | ○ |
| **Phase 2** | | | | | | | | | |
| Token Drift Scanner | ○ | ● | ● | ○ | ○ | ● | ○ | ○ | ○ |
| Banned Language Linter | ○ | ● | ● | ○ | ○ | ● | ● | ○ | ● |
| Voice Enforcer | ○ | ● | ○ | ○ | ○ | ● | ● | ○ | ● |
| Ecommerce Guard | ○ | ● | ● | ○ | ○ | ● | ● | ○ | ○ |
| Release Gate Runner | ● | ○ | ● | ○ | ● | ● | ○ | ○ | ○ |
| **Phase 3** | | | | | | | | | |
| API Inventory | ○ | ○ | ● | ● | ● | ○ | ○ | ○ | ○ |
| Schema Drift | ○ | ○ | ● | ● | ○ | ● | ○ | ○ | ○ |
| Secrets Sweep | ○ | ○ | ● | ○ | ● | ● | ○ | ○ | ○ |
| **Phase 4** | | | | | | | | | |
| Asset Validator | ○ | ● | ● | ○ | ○ | ○ | ● | ○ | ○ |
| Admin Toggles Audit | ○ | ○ | ● | ● | ○ | ● | ○ | ○ | ○ |
| Subscription Gate Audit | ○ | ● | ● | ○ | ○ | ○ | ○ | ● | ○ |
| Outreach Guard | ○ | ○ | ○ | ○ | ○ | ○ | ● | ● | ● |
| Data Provenance Validator | ○ | ○ | ○ | ● | ○ | ● | ○ | ○ | ○ |
| **Phase 5** | | | | | | | | | |
| E2E Visual Regression | ○ | ● | ● | ○ | ○ | ● | ○ | ○ | ○ |
| SEO Scanner | ○ | ○ | ● | ○ | ○ | ○ | ● | ○ | ○ |
| Figma-Code Drift | ○ | ● | ● | ○ | ○ | ○ | ○ | ○ | ○ |

● = Primary user  ○ = Benefits from / may invoke

### 7.3 Skill Category Distribution by Agent

| Agent Category | Capability Uplift Skills | Encoded Preference Skills | Total |
|---|---|---|---|
| **Executive/PMO** | audit-all, build proof pack | Doc Gate, release gate | 4 |
| **Product+Design** | E2E visual regression | Doc Gate, token drift, banned language, voice, ecommerce guard, asset validator, subscription gate, Figma-code drift | 9 |
| **Engineering** | ALL capability skills (8) | ALL encoded preference skills (12) | 20 |
| **Data/AI** | API inventory, schema drift, admin toggles | Doc Gate, LIVE/DEMO scanner, data provenance | 6 |
| **Security** | API inventory, secrets sweep | Doc Gate, release gate | 4 |
| **QA** | audit-all, build proof pack, E2E extend, schema drift, admin toggles, secrets sweep | Doc Gate, LIVE/DEMO scanner, token drift, banned language, voice, ecommerce guard, release gate, data provenance | 14 |
| **SEO/Editorial** | SEO scanner | Doc Gate, banned language, voice, ecommerce guard, asset validator, outreach guard | 7 |
| **RevOps** | — | Doc Gate, subscription gate, outreach guard | 3 |
| **Customer Ops** | — | Doc Gate, banned language, voice, outreach guard | 4 |

### 7.4 Encoded Preferences Summary

Total encoded rules across all skills: **200+** from **9 governance documents** in `/docs/command/`:

| Source Document | Rule Count | Key Encodings |
|---|---|---|
| `CLAUDE.md` (root governance) | ~40 | 7 FAIL conditions, 7 PASS requirements, §E ecommerce, §F LIVE/DEMO, §G outreach |
| `SOCELLE_CANONICAL_DOCTRINE.md` | ~100 | 6 color locks, 5 banned families, 3 font locks, 4 banned fonts, 7 glass locks, 67 banned terms, 10 banned CTAs, 9 voice rules, 9 controlled vocab |
| `SOCELLE_ENTITLEMENTS_PACKAGING.md` | ~25 | Role matrix, 9 free preview rules, 12 mini-app unlock rules |
| `SOCELLE_DATA_PROVENANCE_POLICY.md` | ~30 | 9 attribution rules, 14 confidence scoring rules, 7 freshness SLAs, 7 disallowed sources |
| `SOCELLE_FIGMA_TO_CODE_HANDOFF.md` | ~15 | Token naming parity, component naming, breakpoints, grid, export rules |
| `SOCELLE_RELEASE_GATES.md` | ~55 | 22 pre-merge checks, 29 pre-deploy checks, rollback protocol |
| `GLOBAL_SITE_MAP.md` | ~10 | Route completeness rules |
| `SITE_MAP.md` | ~15 | File paths, auth requirements, data source labels |
| `BRAND_SURFACE_INDEX.md` | ~10 | Brand surfaces + SEO readiness requirements |

**Without encoded preference skills:** Agents operate blind to owner doctrine. They can build and deploy code that violates 200+ rules with zero automated detection.

**With encoded preference skills:** Every agent output, every PR, every deploy is automatically validated against the full doctrine. Violations are caught before they reach production. The owner's institutional knowledge operates as machine-enforceable law.

---

## 8. APPENDIX: ENCODED PREFERENCE REGISTRY

This appendix provides the machine-readable rule registry that encoded preference skills draw from. Each rule has a unique ID for traceability.

### 8.1 Doc Gate Rules

| Rule ID | Source | Category | Pattern |
|---|---|---|---|
| DG-FAIL-01 | CLAUDE.md §B | Authority | External doc reference as governance authority |
| DG-FAIL-02 | CLAUDE.md §B | Planning | New work order outside build_tracker.md |
| DG-FAIL-03 | CLAUDE.md §B | Compliance | Contradiction with command docs |
| DG-FAIL-04 | CLAUDE.md §B | Truth | Fake-live claims without DB backing |
| DG-FAIL-05 | CLAUDE.md §B | Coverage | Omitted routes vs canonical map |
| DG-FAIL-06 | CLAUDE.md §B | IA | Ecommerce elevated above Intelligence |
| DG-FAIL-07 | CLAUDE.md §B | Outreach | Cold email content |
| DG-PASS-01 | CLAUDE.md §B | Quality | File paths cited |
| DG-PASS-02 | CLAUDE.md §B | Quality | Diffs provided |
| DG-PASS-03 | CLAUDE.md §B | Truth | LIVE/DEMO labels on all data surfaces |
| DG-PASS-04 | CLAUDE.md §B | Authority | Command doc references present |
| DG-PASS-05 | CLAUDE.md §B | Coverage | Complete route/screen coverage |
| DG-PASS-06 | CLAUDE.md §B | Evidence | Proof artifacts present |
| DG-PASS-07 | CLAUDE.md §B | Tracking | WO IDs valid in build_tracker.md |

### 8.2 Design System Rules

| Rule ID | Source | Value | Enforcement |
|---|---|---|---|
| DS-COLOR-01 | Doctrine §3 | `#141418` (graphite) | Primary text color — no alternatives |
| DS-COLOR-02 | Doctrine §3 | `#F6F3EF` (mn.bg) | Mineral background — no alternatives |
| DS-COLOR-03 | Doctrine §3 | `#EDE8E1` (mn.bg.deep) | Deep background variant |
| DS-COLOR-04 | Doctrine §3 | `#6E879B` (accent) | Muted steel-blue accent |
| DS-COLOR-05 | Doctrine §3 | `#5A7185` (accent.hover) | Hover state |
| DS-COLOR-06 | Doctrine §3 | `#E8EDF1` (accent.soft) | Soft accent background |
| DS-FONT-01 | Doctrine §3 | General Sans | Primary font — via `font-sans` |
| DS-FONT-02 | Doctrine §3 | `font-serif` BANNED | All public pages |
| DS-FONT-03 | Doctrine §3 | `scl-` prefix | All custom tokens |
| DS-GLASS-01 | Doctrine §3 | `rgba(255,255,255,0.72)` | Glass background |
| DS-GLASS-02 | Doctrine §3 | `blur(18px)` | Glass blur |
| DS-GLASS-03 | Doctrine §3 | `saturate(1.8)` | Glass saturate |
| DS-GLASS-04 | Doctrine §3 | `brightness(1.06)` | Glass brightness |
| DS-GLASS-05 | Doctrine §3 | `1px solid rgba(255,255,255,0.18)` | Glass border |
| DS-GLASS-06 | Doctrine §3 | `0 8px 32px rgba(0,0,0,0.06)` | Glass shadow |
| DS-GLASS-07 | Doctrine §3 | `1.25rem` | Glass border-radius |

### 8.3 Voice + Language Rules

| Rule ID | Source | Category |
|---|---|---|
| VOICE-01 through VOICE-09 | Doctrine §8 | Voice tone enforcement (see B.2.14) |
| LANG-BANNED-001 through LANG-BANNED-067 | Doctrine §9 | Banned SaaS terms (see B.2.13) |
| CTA-BANNED-01 through CTA-BANNED-10 | Doctrine §9 | Banned CTAs (see B.2.13) |
| VOCAB-01 through VOCAB-09 | Doctrine §8 | Controlled vocabulary mapping (see B.2.14) |

### 8.4 Data Integrity Rules

| Rule ID | Source | Category |
|---|---|---|
| FRESH-01 | Provenance Policy | Market signals: 1hr max staleness |
| FRESH-02 | Provenance Policy | Job postings: 4hr max staleness |
| FRESH-03 | Provenance Policy | Brand health: 24hr max staleness |
| FRESH-04 | Provenance Policy | Events: 24hr max staleness |
| FRESH-05 | Provenance Policy | Benchmarks: 7d max staleness |
| CONF-01 | Provenance Policy | Confidence formula: base × recency × corroboration |
| CONF-02 | Provenance Policy | HIGH tier: ≥0.8 (green) |
| CONF-03 | Provenance Policy | MODERATE tier: 0.5–0.79 (amber) |
| CONF-04 | Provenance Policy | LOW tier: <0.5 (red + disclaimer) |
| SRC-BLOCK-01 through SRC-BLOCK-07 | Provenance Policy | 7 disallowed source types |
| ATTR-01 through ATTR-09 | Provenance Policy | 9 attribution requirements |

### 8.5 Entitlements Rules

| Rule ID | Source | Category |
|---|---|---|
| ENT-FREE-01 through ENT-FREE-09 | Entitlements doc | 9 free preview rules |
| ENT-UNLOCK-01 through ENT-UNLOCK-12 | Entitlements doc | 12 mini-app unlock rules |
| ENT-BYPASS-01 | CLAUDE.md observation | paymentBypass.ts must be OFF in production |

### 8.6 Release Gate Rules

| Rule ID | Source | Count |
|---|---|---|
| RG-MERGE-01 through RG-MERGE-22 | Release Gates doc | 22 pre-merge checks |
| RG-DEPLOY-01 through RG-DEPLOY-29 | Release Gates doc | 29 pre-deploy checks |

---

## DOCUMENT CONTROL

| Field | Value |
|---|---|
| Version | 2.0 |
| Author | SOCELLE Command Center Agent |
| Date | March 7, 2026 |
| Authority | `/.claude/CLAUDE.md` §A–§J |
| Source data | 165+ codebase artifacts inspected, 200+ encoded rules extracted, 9 governance docs analyzed |
| Predecessor | v1.0 (rejected — insufficient depth) |
| Next action | Use skill-creator to build Phase 1 skills (B.2.1–B.2.4) |

---

*SOCELLE GLOBAL Skills Definition Spec v2.0 — March 7, 2026*
*Capability Uplift + Encoded Preference Architecture*
*Authority: `/.claude/CLAUDE.md` §A–§J, `/docs/command/*`*
