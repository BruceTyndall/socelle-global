# CRM STUDIO AGENT — Workflow Runbook
**Authority:** `docs/command/AGENT_SCOPE_REGISTRY.md` §11, `docs/command/SOCELLE_RELEASE_GATES.md`

---

## A) Mission

Customer relationship management — operator CRM, brand CRM, pipeline management, contact database, interaction history tracking. Provides CRM data foundation that Sales Studio and Marketing Studio agents depend on.

## B) Required Skills

- CRM data model (contacts, interactions, pipeline stages)
- React studio builder UI
- Supabase RLS (CRM data strictly tenant-scoped)
- Campaign integration (CRM → Marketing Studio handoff)
- Pipeline state machine (lead → qualified → proposal → closed)

## C) Allowed Paths

- `SOCELLE-WEB/src/pages/business/` — Business CRM surfaces (WO required)
- `SOCELLE-WEB/src/pages/brand/` — Brand CRM surfaces (`/brand/customers`, `/brand/pipeline`) (WO required)
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (CRM schema)

## D) Forbidden Paths

- Cross-tenant CRM data access — NEVER (RLS must prevent)
- Outreach / cold acquisition email — NEVER (FAIL 7)
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- `SOCELLE-WEB/src/pages/public/` — NEVER TOUCH
- `SOCELLE-WEB/src/pages/admin/` — Admin CRM is Admin Control Center scope
- `SOCELLE-MOBILE-main/` — NEVER TOUCH
- `apps/marketing-site/` — NEVER TOUCH

## E) Mandatory Pre-Reads

1. `/.claude/CLAUDE.md`
2. `/docs/command/SOCELLE_CANONICAL_DOCTRINE.md`
3. `/docs/command/AGENT_SCOPE_REGISTRY.md` — §11
4. `/docs/command/SOCELLE_RELEASE_GATES.md`
5. `/docs/command/SITE_MAP.md` — CRM-related portal routes
6. `SOCELLE-WEB/docs/build_tracker.md`

## F) Standard Operating Loop

1. **Identify WO IDs:** Confirm CRM-related WO exists in `build_tracker.md`.
2. **Execute within boundaries:** CRM schema, portal CRM surfaces, pipeline UI only.
3. **Produce outputs:** CRM schema migrations, portal CRM components, pipeline state machine.
4. **Verification:** RLS prevents cross-tenant data leakage. No cold outreach scaffolding.
5. **Stop condition:** Halt if Sales Studio or Marketing Studio needs CRM data not yet modeled (coordinate handoff).

## G) Output Contract

- Migration SQL for CRM tables with tenant-scoped RLS
- Portal CRM page components
- `npx tsc --noEmit` — zero errors
- RLS verification (cross-tenant access impossible)
- LIVE vs DEMO labels on all CRM data surfaces

## H) Proof Checklist

- [ ] WO ID in `build_tracker.md` confirmed
- [ ] RLS prevents cross-tenant data leakage (verified by policy test)
- [ ] No cold outreach scaffolding in any CRM feature
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `build_tracker.md` updated

## I) Stop Conditions

- No active WO in `build_tracker.md` (do not build)
- Cross-tenant data access detected (STOP — fix RLS immediately)
- Cold outreach functionality requested (REFUSE — FAIL 7)
- Admin CRM surface needed (hand off to Admin Control Center Agent)
