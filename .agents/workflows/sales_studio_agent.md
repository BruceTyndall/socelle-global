# SALES STUDIO AGENT — Workflow

## 1) Purpose

Sales pipeline and revenue tooling — lead scoring, deal tracking, commission management, sales analytics. Depends on CRM Agent for contact/pipeline schema foundation. Commerce flow (cart/checkout/orders) — NEVER MODIFY.

## 2) Authority

- `docs/command/AGENT_SCOPE_REGISTRY.md` §15
- `docs/command/SOCELLE_RELEASE_GATES.md`
- Doc Gate applies (FAIL 1–7). All outputs must pass.

## 3) Preconditions

**Required reads before any work:**
1. `/.claude/CLAUDE.md`
2. `/docs/command/SOCELLE_CANONICAL_DOCTRINE.md`
3. `/docs/command/AGENT_SCOPE_REGISTRY.md` — §15
4. `/docs/command/SOCELLE_RELEASE_GATES.md`
5. `/docs/command/SITE_MAP.md` — Sales-related portal routes
6. `SOCELLE-WEB/docs/build_tracker.md`

**WO ID rule:** WO IDs only valid if present in `SOCELLE-WEB/docs/build_tracker.md`. Do not build until WO exists.

## 4) Allowed Paths / Forbidden Paths

**Allowed:**
- `SOCELLE-WEB/src/pages/business/` — Sales pipeline surfaces (WO required)
- `SOCELLE-WEB/src/pages/brand/` — Brand sales/leads surfaces (`/brand/leads`, `/brand/pipeline`) (WO required)
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (sales schema)

**Forbidden:**
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- Commerce flow (cart/checkout/orders) — NEVER MODIFY
- Outreach / cold acquisition email — NEVER (FAIL 7)
- `SOCELLE-WEB/src/pages/public/` — NEVER TOUCH
- `SOCELLE-MOBILE-main/` — NEVER TOUCH
- `apps/marketing-site/` — NEVER TOUCH

## 5) Execution Loop

1. **Identify WO:** Confirm sales studio WO exists in `build_tracker.md`.
2. **Find targets:** Locate sales portal routes in `SITE_MAP.md`. Verify CRM contact/pipeline schema exists.
3. **Implement:** Sales pipeline UI, lead scoring RPCs, commission logic.
4. **Verify LIVE vs DEMO:** Commission rates from DB, not hardcoded. All surfaces labeled.
5. **Verify RLS:** Lead data strictly tenant-scoped. No cold outreach tooling.
6. **Produce diffs:** Exact file paths, line ranges, and diffs.
7. **Run builds:** `npx tsc --noEmit` — zero errors.

## 6) Handoff Protocol

| Scenario | Action |
|---|---|
| CRM contact/pipeline schema not ready | Wait for CRM Agent |
| Cold outreach functionality requested | REFUSE — FAIL 7 |
| Cross-tenant lead access detected | STOP — fix RLS immediately |
| Commerce flow changes needed | REFUSE — NEVER MODIFY |

**Handoff artifact:** Sales pipeline spec (state machine: lead → qualified → proposal → closed, scoring model, commission rules).

## 7) Proof Checklist

- [ ] WO ID in `build_tracker.md` confirmed
- [ ] Commission rates sourced from DB, not hardcoded
- [ ] Lead data strictly tenant-scoped (RLS verified)
- [ ] No cold outreach tooling scaffolded
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `build_tracker.md` updated
- [ ] Doc Gate PASS (all 7 FAIL conditions checked)

## 8) Stop Conditions

- No active WO in `build_tracker.md` (do not build)
- CRM Agent has not completed contact/pipeline schema (wait for CRM Agent)
- Cold outreach functionality requested (REFUSE — FAIL 7)
- Cross-tenant lead access detected (STOP — fix RLS)
- Commerce flow modification requested (REFUSE — NEVER MODIFY)
