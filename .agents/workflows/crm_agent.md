# CRM AGENT — Workflow

## 1) Purpose

Customer relationship management — operator CRM, brand CRM, pipeline management, contact database, interaction history tracking. Provides CRM data foundation that Sales Studio and Marketing Studio agents depend on. Commerce flow (cart/checkout/orders) — NEVER MODIFY.

## 2) Authority

- `docs/command/AGENT_SCOPE_REGISTRY.md` §11
- `docs/command/SOCELLE_RELEASE_GATES.md`
- `/.claude/CLAUDE.md` §G (No Outreach Emails Rule)
- Doc Gate applies (FAIL 1–7). All outputs must pass.

## 3) Preconditions

**Required reads before any work:**
1. `/.claude/CLAUDE.md` — §G (outreach prohibition)
2. `/docs/command/SOCELLE_CANONICAL_DOCTRINE.md`
3. `/docs/command/AGENT_SCOPE_REGISTRY.md` — §11
4. `/docs/command/SOCELLE_RELEASE_GATES.md`
5. `/docs/command/SITE_MAP.md` — CRM-related portal routes
6. `SOCELLE-WEB/docs/build_tracker.md`

**WO ID rule:** WO IDs only valid if present in `SOCELLE-WEB/docs/build_tracker.md`.

## 4) Allowed Paths / Forbidden Paths

**Allowed:**
- `SOCELLE-WEB/src/pages/business/` — Business CRM surfaces (WO required)
- `SOCELLE-WEB/src/pages/brand/` — Brand CRM surfaces (`/brand/customers`, `/brand/pipeline`) (WO required)
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (CRM schema)

**Forbidden:**
- Cross-tenant CRM data access — NEVER (RLS must prevent)
- Outreach / cold acquisition email — NEVER (FAIL 7)
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- `SOCELLE-WEB/src/pages/public/` — NEVER TOUCH
- `SOCELLE-WEB/src/pages/admin/` — Admin CRM is Admin Control Center scope
- `SOCELLE-MOBILE-main/` — NEVER TOUCH
- Commerce flow (cart/checkout/orders) — NEVER MODIFY

## 5) Execution Loop

1. **Identify WO:** Confirm CRM-related WO exists in `build_tracker.md`.
2. **Find targets:** Locate CRM portal routes in `SITE_MAP.md` (`/portal/customers`, `/brand/customers`, `/brand/pipeline`). Identify existing CRM tables in Supabase schema.
3. **Implement:** CRM schema migrations (contacts, interactions, pipeline stages), portal page components, pipeline state machine.
4. **Verify LIVE vs DEMO:** All CRM data surfaces must be labeled LIVE (DB with `updated_at`) or DEMO (mock data with visible badge).
5. **Verify RLS:** Run policy test confirming tenant A cannot read tenant B data. Cross-tenant access = immediate STOP.
6. **Produce diffs:** Output exact file paths, line ranges, and diffs for all changes.
7. **Run builds:** `npx tsc --noEmit` — zero errors.

## 6) Handoff Protocol

| Scenario | Action |
|---|---|
| Sales Studio needs CRM data | CRM Agent completes contact/pipeline schema first → Sales Studio Agent builds pipeline UI |
| Marketing Studio needs campaign contacts | CRM Agent provides contact schema → Marketing Studio Agent builds campaign targeting |
| Admin CRM surface needed | Hand off to Admin Control Center Agent |
| Quizzes/Polls needs brand sponsorship data | CRM Agent provides brand contact → Quizzes/Polls Agent manages sponsor placement |

**Handoff artifact:** Schema documentation (table names, column types, RLS policies, RPC signatures).

## 7) Proof Checklist

- [ ] WO ID in `build_tracker.md` confirmed
- [ ] RLS prevents cross-tenant data leakage (verified by policy test)
- [ ] No cold outreach scaffolding in any CRM feature
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `build_tracker.md` updated
- [ ] Doc Gate PASS (all 7 FAIL conditions checked)

## 8) Stop Conditions

- No active WO in `build_tracker.md` (do not build)
- Cross-tenant data access detected (STOP — fix RLS immediately)
- Cold outreach functionality requested (REFUSE — FAIL 7)
- Admin CRM surface needed (hand off to Admin Control Center Agent)
- Commerce flow modification requested (REFUSE — NEVER MODIFY)
