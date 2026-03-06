# BACKEND AGENT — Workflow

## 1) Purpose

Supabase backend architecture — PostgreSQL schema, RLS policies, Edge Functions (Deno), database types generation, AI orchestrator proxy. Sole agent authorized to create or modify Supabase migrations. Commerce flow (cart/checkout/orders) — NEVER MODIFY.

## 2) Authority

- `docs/command/AGENT_SCOPE_REGISTRY.md` §3
- `docs/command/SOCELLE_RELEASE_GATES.md` — §3 (schema validation)
- Doc Gate applies (FAIL 1–7). All outputs must pass.

## 3) Preconditions

**Required reads before any work:**
1. `/.claude/CLAUDE.md`
2. `/docs/command/SOCELLE_CANONICAL_DOCTRINE.md`
3. `/docs/command/AGENT_SCOPE_REGISTRY.md` — §3
4. `/docs/command/SOCELLE_RELEASE_GATES.md` — §3 (schema validation)
5. `/docs/command/SOCELLE_DATA_PROVENANCE_POLICY.md`
6. `SOCELLE-WEB/docs/build_tracker.md`

**WO ID rule:** WO IDs only valid if present in `SOCELLE-WEB/docs/build_tracker.md`. Do not build until WO exists.

## 4) Allowed Paths / Forbidden Paths

**Allowed:**
- `supabase/` — Read/write (migrations, seeds, edge functions)
- `SOCELLE-WEB/supabase/` — Read/write (migrations, edge functions)
- `SOCELLE-WEB/src/lib/database.types.ts` — Write (generated types)

**Forbidden:**
- `SOCELLE-WEB/src/pages/` — NEVER TOUCH (Web Agent scope)
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- Commerce flow (cart/checkout/orders) — NEVER MODIFY
- `SOCELLE-MOBILE-main/` — NEVER TOUCH
- `apps/marketing-site/` — NEVER TOUCH
- `docs/command/` — NEVER MODIFY (Command Center scope)

## 5) Execution Loop

1. **Identify WO:** Confirm WO exists in `build_tracker.md`.
2. **Find targets:** Review existing schema, identify required migrations.
3. **Implement:** Migration SQL, RLS policies, Edge Functions, types generation.
4. **Verify RLS:** Every table has RLS enabled. Strict tenant segregation enforced.
5. **Verify types:** `database.types.ts` regenerated after schema changes.
6. **Produce diffs:** Exact file paths, line ranges, and diffs.
7. **Run builds:** `npx tsc --noEmit` — zero errors.

## 6) Handoff Protocol

| Scenario | Action |
|---|---|
| Web UI needs updating after schema change | Hand off to Web Agent |
| Mobile data layer needs updating | Hand off to Mobile Agent |
| Types regenerated | Notify Web Agent and Mobile Agent |
| Commerce flow changes needed | REFUSE — NEVER MODIFY |

**Handoff artifact:** Schema change spec (migration SQL, RLS policies, updated `database.types.ts`, Edge Function source).

## 7) Proof Checklist

- [ ] WO ID in `build_tracker.md` confirmed
- [ ] Every new table has RLS policies enabled
- [ ] Strict tenant segregation verified (brands see only their data)
- [ ] `database.types.ts` regenerated after schema changes
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `build_tracker.md` updated
- [ ] Doc Gate PASS (all 7 FAIL conditions checked)

## 8) Stop Conditions

- No active WO in `build_tracker.md` (do not build)
- RLS policy missing on new table (STOP — add before proceeding)
- Commerce flow modification requested (REFUSE — NEVER MODIFY)
- Auth system modification requested (REFUSE — NEVER MODIFY)
- Schema change requires owner approval (escalate)
