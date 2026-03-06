# JOBS MARKETPLACE AGENT — Workflow

## 1) Purpose

Operator-facing job posting UX — brand/operator job creation, applicant tracking, portal job management surfaces. Owns portal UX; Jobs Pipeline Agent owns data pipeline and public surfaces. Commerce flow (cart/checkout/orders) — NEVER MODIFY.

## 2) Authority

- `docs/command/AGENT_SCOPE_REGISTRY.md` §9
- `docs/command/SOCELLE_RELEASE_GATES.md`
- Doc Gate applies (FAIL 1–7). All outputs must pass.

## 3) Preconditions

**Required reads before any work:**
1. `/.claude/CLAUDE.md`
2. `/docs/command/SOCELLE_CANONICAL_DOCTRINE.md`
3. `/docs/command/AGENT_SCOPE_REGISTRY.md` — §9
4. `/docs/command/SOCELLE_RELEASE_GATES.md`
5. `/docs/command/SITE_MAP.md` — portal job routes
6. `SOCELLE-WEB/docs/build_tracker.md`

**WO ID rule:** WO IDs only valid if present in `SOCELLE-WEB/docs/build_tracker.md`. Requires `job_postings` table (W10-06) complete first.

## 4) Allowed Paths / Forbidden Paths

**Allowed:**
- `SOCELLE-WEB/src/pages/business/` — Job posting / applicant management (WO required)
- `SOCELLE-WEB/src/pages/brand/` — Brand-side job management (WO required)
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (applicant tracking schema)

**Forbidden:**
- `SOCELLE-WEB/src/pages/public/` — Jobs Pipeline Agent domain
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- `SOCELLE-MOBILE-main/` — NEVER TOUCH
- `apps/marketing-site/` — NEVER TOUCH
- Commerce flow (cart/checkout/orders) — NEVER MODIFY

## 5) Execution Loop

1. **Identify WO:** Confirm marketplace WO exists in `build_tracker.md`. Verify `job_postings` table exists.
2. **Find targets:** Locate portal job routes in `SITE_MAP.md`. Review `job_postings` schema from Jobs Pipeline Agent.
3. **Implement:** Job posting wizard, applicant tracking UI, brand job management components.
4. **Verify LIVE vs DEMO:** All portal job data labeled LIVE or DEMO.
5. **Verify RLS:** Operator-scoped access enforced. Applicant data never publicly accessible.
6. **Produce diffs:** Exact file paths, line ranges, and diffs.
7. **Run builds:** `npx tsc --noEmit` — zero errors.

## 6) Handoff Protocol

| Scenario | Action |
|---|---|
| `job_postings` table not yet created | Wait for Jobs Pipeline Agent / W10-06 |
| Public job surface changes needed | Hand off to Jobs Pipeline Agent |
| Cross-tenant data access detected | STOP — fix RLS immediately |

**Handoff artifact:** Portal component spec (route, component name, applicant state machine, RLS policy).

## 7) Proof Checklist

- [ ] WO ID in `build_tracker.md` confirmed
- [ ] Applicant data never publicly accessible (RLS enforced)
- [ ] Job posting creation conforms to `job_postings` schema from Jobs Pipeline Agent
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `build_tracker.md` updated
- [ ] Doc Gate PASS (all 7 FAIL conditions checked)

## 8) Stop Conditions

- No active WO in `build_tracker.md`
- `job_postings` table not yet created (wait for Jobs Pipeline Agent / W10-06)
- Public job surface changes needed (hand off to Jobs Pipeline Agent)
- Cross-tenant data access detected (STOP — fix RLS)
- Commerce flow modification requested (REFUSE — NEVER MODIFY)
