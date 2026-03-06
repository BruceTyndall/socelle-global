# SOCELLE GLOBAL — MONOREPO GOVERNANCE
**Authority:** This is the root governance file for the entire SOCELLE monorepo.  
**Last Updated:** March 5, 2026  
**Canonical Command Docs:** `docs/command/*`

---

## A) CANONICAL AUTHORITY

The following documents in `/docs/command/` are the **sole source of truth** for all platform decisions. No other document may override, contradict, or redefine what these documents establish.

| Document | Governs |
|---|---|
| `SOCELLE_CANONICAL_DOCTRINE.md` | Platform thesis, dual-requirement doctrine, style locks (color/type/glass), banned language, conversion CTAs, voice, visual rules, data integrity rules |
| `SOCELLE_ENTITLEMENTS_PACKAGING.md` | Roles, plan tiers, free preview rules, mini-app unlock map, subscription hooks, entitlement enforcement |
| `SOCELLE_DATA_PROVENANCE_POLICY.md` | Allowed/disallowed sources, attribution, confidence scoring, freshness SLAs, influencer monitoring, truthfulness policy |
| `SOCELLE_FIGMA_TO_CODE_HANDOFF.md` | Token naming parity (Figma→CSS→Tailwind→Flutter), component naming, breakpoints, grids, export rules, no-drift checklist |
| `SOCELLE_RELEASE_GATES.md` | Pre-merge checklist, pre-deploy checklist, schema validation, no-fake-live validation, performance budgets, broken links, rollback protocol, Doc Gate |
| `GLOBAL_SITE_MAP.md` | Canonical route/screen index — "no page left behind" reference |
| `SITE_MAP.md` | Detailed route/screen/feature index with file paths, auth requirements, and data source labels (web + mobile + marketing) |
| `BRAND_SURFACE_INDEX.md` | Brand-related surfaces across all portals + SEO readiness |
| `AGENT_SCOPE_REGISTRY.md` | Agent boundaries, allowed/forbidden paths, handoff protocol |

**Rule:** If any file outside `/docs/command/` contradicts a command doc, the command doc wins. Update the contradicting file, not the command doc.

**Intelligence-First Thesis:** Intelligence platform first, marketplace second. This is non-negotiable across all apps, agents, and surfaces. The Intelligence Hub is the product hook. **Ecommerce is a transaction module beneath the intelligence layer — it is never the IA center, never leads navigation, and never defines the platform premise.**

---

## B) DOC GATE (GLOBAL QA ENFORCEMENT — NON-NEGOTIABLE)

Authoritative docs:
- `/docs/command/*` (global canonical)
- This file: `/.claude/CLAUDE.md` (global governance)
- Each app may have a local `CLAUDE.md` for stack-specific rules, but **local files may NOT override global doctrine.**

Every agent output, every PR, every document must pass the Doc Gate. Violations are **automatic FAIL — no exceptions.**

### FAIL Conditions

| # | Condition | Example |
|---|---|---|
| FAIL 1 | External doc reference as authority | "Per `GOVERNANCE.md`..." or "Per `SOCELLE_MASTER_WORK_ORDER.md`..." |
| FAIL 2 | New work order / master plan doc created outside `build_tracker.md` | Creating `REBUILD_PLAN_V2.md` anywhere; inventing WO IDs not in `build_tracker.md` |
| FAIL 3 | Contradiction with command docs (design locks, provenance, entitlements) | Using `#1E252B` for primary text; `font-serif` on public pages |
| FAIL 4 | Fake-live claims — numbers, timestamps, signals not tied to real `updated_at` | Hardcoded `"Updated 3 min ago"` with no DB column |
| FAIL 5 | Omitted routes/screens vs `GLOBAL_SITE_MAP.md` + `SITE_MAP.md` | Spec covering 20 of 30 public routes |
| FAIL 6 | Ecommerce elevated above Intelligence Hub in IA or navigation | MainNav leading with "Shop"; ecommerce framed as the platform premise |
| FAIL 7 | Outreach/cold email content drafted or sent | Any cold email copy, cold DM scripts, or acquisition outreach |

**Exception:** App-level `CLAUDE.md` files may contain stack-specific runtime rules that do not contradict command docs. These are operational context, not governance authority.

### PASS Requirements

| Requirement | Standard |
|---|---|
| **Cite file paths** | Every recommendation maps to a specific file path, route, endpoint, table, or component. No vague references. |
| **Provide diffs/patch lists** | Any proposed change includes a diff or patch list showing exactly what changes and where. |
| **LIVE vs DEMO labels** | Every data surface in output is explicitly labeled `DEMO` (mock/hardcoded) or `LIVE` (DB-connected with real `updated_at`). No ambiguity. |
| **Reference command docs** | Cite the specific command doc and section for any governance rule applied. |
| **Complete coverage** | No page, route, screen, or surface may be omitted. "No page left behind." |
| **Proof artifacts** | Build logs (`npx tsc --noEmit`), curl output, screenshots, or schema diffs as required by task. |
| **WO ID sourced correctly** | All WO IDs referenced in output must exist in `SOCELLE-WEB/docs/build_tracker.md`. |

---

## C) MONOREPO BOUNDARY RULES

### App Boundaries

| App | Path | Runtime | Owner Agent |
|---|---|---|---|
| Web (Public + Portals) | `SOCELLE-WEB/` | Vite + React + Tailwind + Supabase | Web Agent |
| Mobile | `SOCELLE-MOBILE-main/apps/mobile/` | Flutter + Riverpod + Supabase | Mobile Agent |
| Marketing Site | `apps/marketing-site/` | Next.js | SEO Agent |
| Supabase Backend | `supabase/` + `SOCELLE-WEB/supabase/` | PostgreSQL + Edge Functions (Deno) | Backend Agent |
| Shared Packages | `packages/` | Shared config + UI primitives | All (read), Backend (write) |

### Cross-Boundary Rules

1. **Mobile may not modify** `SOCELLE-WEB/` files or Supabase migrations.
2. **Web may not modify** `SOCELLE-MOBILE-main/` files.
3. **Both may read** `packages/` and `supabase/` schemas.
4. **Only Backend Agent** may create or modify Supabase migrations.
5. **Design token changes** require updates in both web (`tailwind.config.js`) and mobile (`socelle_theme.dart`) — coordinated by the Figma-to-Code handoff doc.
6. **Portal routes** (`/portal/*`, `/brand/*`, `/admin/*`) — DO NOT MODIFY without explicit WO scope.
7. **Commerce flow** (cart, checkout, orders) — NEVER MODIFY.
8. **Auth system** (ProtectedRoute, AuthProvider) — NEVER MODIFY.

---

## D) WO ID SOURCE RULE (GLOBAL — NON-NEGOTIABLE)

- **Wave/WO IDs are only valid if present in `SOCELLE-WEB/docs/build_tracker.md`.**
- No agent may invent, reference, or execute new WO IDs without adding them to `build_tracker.md` first.
- `build_tracker.md` is the **sole execution authority** for WO scheduling, priority, and completion status.
- `MASTER_STATUS.md` is a status snapshot only. If it contradicts `build_tracker.md`, `build_tracker.md` wins.
- App-level `CLAUDE.md` files must not duplicate or redefine WO completion status — they must point to `build_tracker.md` as the source of truth.

---

## E) ECOMMERCE MODULE RULE (NON-NEGOTIABLE)

Ecommerce (cart, checkout, wholesale orders, brand payouts) is **a module** — not the platform premise, not the IA center, and not the primary navigation hook.

| Rule | Enforcement |
|---|---|
| Ecommerce does not appear in MainNav | MainNav position 1 is Intelligence. Commerce is inside portals only. |
| Ecommerce never leads product messaging | All CTAs, headlines, and landing experiences lead with intelligence. |
| "Shop" is never the first action | Discovery → Intelligence → Trust → Transaction is the canonical flow. |
| Commerce routes are portal-scoped | `/portal/orders`, `/brand/orders`, `/brand/products`, `/admin/orders` — not public IA. |

Violation of this rule = **FAIL 6**, blocks deploy.

---

## F) LIVE vs DEMO TRUTH RULES (NON-NEGOTIABLE)

Every data surface in every output must be explicitly labeled **LIVE** or **DEMO**. No ambiguity, no implicit assumptions.

| Label | Meaning | Enforcement |
|---|---|---|
| **LIVE** | Data connects to a real DB column with verifiable `updated_at` | JS hook must reference Supabase table; no hardcoded fallback presented as live |
| **DEMO** | Data is hardcoded, mocked, or seeded for demonstration | Must display visible `DEMO` or `PREVIEW` badge to end user |

Rules:
1. Any surface showing "Updated X ago" must derive that value from a real `updated_at` DB column.
2. Any surface showing counts, benchmarks, or trend signals must `COUNT(*)` from a real table or show a `DEMO` badge.
3. `isLive` flags (see `useIntelligence.ts`) drive PREVIEW banners — this pattern must be applied to all new data hooks.
4. Never display a pulsing dot, "Live" badge, or animated counter on data that is a static array.

Canonical DEMO surfaces (as of Wave 10 — verify against `build_tracker.md` for current state):
- `/` (Home) — hardcoded signals; no DEMO label yet (W10-02 / BUG-W9-02)
- `/plans` — hardcoded tiers
- `/for-brands`, `/professionals` — hardcoded stats
- `/events` — stub pending `events` Supabase table (W10-05)
- `/jobs` — stub pending `job_postings` live wire (W10-06)
- `/portal/intelligence`, `/portal/benchmarks`, `/brand/intelligence`, `/brand/intelligence-report` — mock data

Canonical LIVE surfaces (confirmed Wave 9+):
- `/intelligence` — `market_signals` via `useIntelligence()` with `isLive` flag
- `/brands`, `/brands/:slug` — `brands` table (active status)
- `/education`, `/protocols`, `/protocols/:slug` — `brand_training_modules`, `canonical_protocols`
- `/request-access` — `access_requests` table

---

## G) NO OUTREACH EMAILS RULE

- Do **not** write, draft, or send outreach emails, cold DMs, or acquisition email copy of any kind.
- Acquisition uses on-site flows only: public pages → "Get Intelligence Access" CTA → `/request-access` form → `access_requests` table → portal signup.
- The `send-email` Edge Function is for **transactional emails only** (order confirmations, password resets, access notifications).
- This rule is in effect until the product owner explicitly lifts it in writing.

---

## H) CHANGE CONTROL

### Modifying Command Docs

| Action | Process |
|---|---|
| Fix a typo or formatting | Direct edit, no approval needed |
| Clarify existing rule (no semantic change) | Direct edit, note in commit message |
| Add a new rule or section | Requires owner (Bruce) approval before merge |
| Modify an existing rule | Requires owner approval + impact assessment |
| Remove a rule | Requires owner approval + migration plan |
| Add a new command doc | Requires owner approval |

### Modifying App-Level CLAUDE.md

| Action | Process |
|---|---|
| Update wave status / blockers to match `build_tracker.md` | Direct edit |
| Add stack-specific build commands | Direct edit |
| Add design rules that contradict command docs | **FORBIDDEN** |
| Redefine WO completion status (vs `build_tracker.md`) | **FORBIDDEN** |

### No Parallel Plans Enforcement

ONE canonical plan. Updates go in command docs. No side channels.

- ❌ Creating `MY_IMPLEMENTATION_PLAN.md` that duplicates governance
- ❌ Creating a "v2" of any command doc alongside the original
- ❌ Inventing WO IDs not tracked in `build_tracker.md`
- ✅ All changes to platform rules flow through `/docs/command/` updates
- ✅ Implementation specs in app directories reference (not redefine) command doc rules

### Contradiction Resolution

1. `/docs/command/*` wins over everything
2. `/.claude/CLAUDE.md` (this file) wins over app-level CLAUDE.md files
3. App-level CLAUDE.md wins over inline code comments
4. `build_tracker.md` wins over `MASTER_STATUS.md` for WO completion status

---

## I) AGENT OPERATING RULES

### Before Starting Any Work

1. Read this file (`/.claude/CLAUDE.md`)
2. Read the relevant command docs in `/docs/command/`
3. Read the app-level CLAUDE.md for your target app
4. Read `SOCELLE-WEB/MASTER_STATUS.md` (live status snapshot)
5. Read `SOCELLE-WEB/docs/build_tracker.md` (execution authority for WO IDs + wave status)
6. Read `docs/command/AGENT_SCOPE_REGISTRY.md` (your scope, allowed/forbidden paths)
7. Confirm you know which mini-app boundary you're operating in
8. Confirm your output will pass the Doc Gate (§B above)

### During Work

- Reference command docs by path: `docs/command/SOCELLE_CANONICAL_DOCTRINE.md §3`
- Do not create new governance documents outside `/docs/command/`
- Do not modify existing command docs without change control process
- Coordinate cross-boundary changes with the relevant app agent
- Do not invent WO IDs — all WOs must be in `build_tracker.md`

### After Work

- Run the Doc Gate check on your output
- Run the pre-merge checklist from `docs/command/SOCELLE_RELEASE_GATES.md`
- Run the no-drift checklist from `docs/command/SOCELLE_FIGMA_TO_CODE_HANDOFF.md` (if design changes)
- Update `build_tracker.md` if WO status changed

---

## J) DEFINITION OF DONE FOR GOVERNANCE

The governance layer is complete when:
1. `/.claude/CLAUDE.md` exists and contains §A–§J above
2. `/docs/command/AGENT_SCOPE_REGISTRY.md` exists with all recognized agent scopes
3. `/SOCELLE-WEB/.claude/CLAUDE.md` exists with operational context only (no governance redefinitions)
4. All 3 files are consistent (no contradictions between them)
5. Ecommerce is scoped as a module (not IA center) across all 3 files
6. LIVE vs DEMO labels are applied to all data surfaces in all agent outputs
7. No outreach email copy exists in any agent output

---

*SOCELLE GLOBAL GOVERNANCE v4.0 — March 5, 2026 — Command Center Authority*
