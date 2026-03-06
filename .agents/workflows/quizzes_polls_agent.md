# QUIZZES / POLLS AGENT — Workflow

## 1) Purpose

Engagement and monetization tooling — quiz/poll creation, response collection, sponsor slot placement, results visualization, lead capture via interactive content. Placement rule: quizzes/polls appear AFTER intelligence context, never as the premise. Commerce flow (cart/checkout/orders) — NEVER MODIFY.

## 2) Authority

- `docs/command/AGENT_SCOPE_REGISTRY.md` §16
- `docs/command/SOCELLE_RELEASE_GATES.md`
- Doc Gate applies (FAIL 1–7). All outputs must pass.

## 3) Preconditions

**Required reads before any work:**
1. `/.claude/CLAUDE.md`
2. `/docs/command/SOCELLE_CANONICAL_DOCTRINE.md`
3. `/docs/command/AGENT_SCOPE_REGISTRY.md` — §16
4. `/docs/command/SOCELLE_RELEASE_GATES.md`
5. `/docs/command/SITE_MAP.md`
6. `SOCELLE-WEB/docs/build_tracker.md`

**WO ID rule:** WO IDs only valid if present in `SOCELLE-WEB/docs/build_tracker.md`. Do not build until WO exists.

## 4) Allowed Paths / Forbidden Paths

**Allowed:**
- `SOCELLE-WEB/src/pages/public/` — Public quiz/poll surfaces (WO required)
- `SOCELLE-WEB/src/pages/business/` — Operator quiz results surfaces (WO required)
- `SOCELLE-WEB/src/pages/brand/` — Brand-sponsored quiz management (WO required)
- `SOCELLE-WEB/src/pages/admin/` — Quiz/poll admin curation (ADD ONLY, WO required)
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (quizzes, polls, responses schema)

**Forbidden:**
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- Commerce flow (cart/checkout/orders) — NEVER MODIFY
- Outreach / cold acquisition — NEVER (FAIL 7)
- `SOCELLE-MOBILE-main/` — NEVER TOUCH
- `apps/marketing-site/` — NEVER TOUCH

## 5) Execution Loop

1. **Identify WO:** Confirm quiz/poll-related WO exists in `build_tracker.md`.
2. **Find targets:** Locate quiz/poll routes in `SITE_MAP.md`. Review existing engagement schema.
3. **Implement:** Quiz builder UI, response collection, sponsor slots, results visualization.
4. **Verify placement:** Quizzes/polls appear AFTER intelligence context (FAIL 6 enforcement).
5. **Verify RLS:** Response data tenant-scoped. Sponsor disclosures visible.
6. **Produce diffs:** Exact file paths, line ranges, and diffs.
7. **Run builds:** `npx tsc --noEmit` — zero errors.

## 6) Handoff Protocol

| Scenario | Action |
|---|---|
| Brand sponsorship data needed | Hand off to CRM Agent |
| Quiz placement violates intelligence-first | STOP — fix placement (FAIL 6) |
| Cross-tenant response access detected | STOP — fix RLS immediately |
| Commerce flow changes needed | REFUSE — NEVER MODIFY |

**Handoff artifact:** Quiz/poll spec (builder schema, response aggregation, sponsor slot placement rules, disclosure requirements).

## 7) Proof Checklist

- [ ] WO ID in `build_tracker.md` confirmed
- [ ] Quiz/poll placement follows intelligence context (never as premise)
- [ ] Sponsor disclosure visible on all sponsored content
- [ ] Response data tenant-scoped (RLS verified)
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `build_tracker.md` updated
- [ ] Doc Gate PASS (all 7 FAIL conditions checked)

## 8) Stop Conditions

- No active WO in `build_tracker.md` (do not build)
- Brand sponsorship data needed (hand off to CRM Agent)
- Quiz placement violates intelligence-first thesis (FAIL 6 — fix placement)
- Cross-tenant response data access detected (STOP — fix RLS)
- Commerce flow modification requested (REFUSE — NEVER MODIFY)
