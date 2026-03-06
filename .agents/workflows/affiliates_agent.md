# AFFILIATES AGENT — Workflow

## 1) Purpose

Affiliate program infrastructure (first-class revenue channel) — sources/programs index, affiliate tracking schema, referral links, commission logic, placement rules, disclosure compliance, affiliate portal surfaces. Placement rule: affiliate content appears AFTER intelligence context, never as the premise. Commerce flow (cart/checkout/orders) — NEVER MODIFY.

## 2) Authority

- `docs/command/AGENT_SCOPE_REGISTRY.md` §7
- `docs/command/SOCELLE_RELEASE_GATES.md`
- `docs/command/SOCELLE_CANONICAL_DOCTRINE.md`
- Doc Gate applies (FAIL 1–7). All outputs must pass.

## 3) Preconditions

**Required reads before any work:**
1. `/.claude/CLAUDE.md`
2. `/docs/command/SOCELLE_CANONICAL_DOCTRINE.md`
3. `/docs/command/AGENT_SCOPE_REGISTRY.md` — §7
4. `/docs/command/SOCELLE_RELEASE_GATES.md`
5. `/docs/command/SOCELLE_DATA_PROVENANCE_POLICY.md`
6. `/docs/command/SITE_MAP.md`
7. `SOCELLE-WEB/docs/build_tracker.md`

**WO ID rule:** WO IDs only valid if present in `SOCELLE-WEB/docs/build_tracker.md`. Do not build until WO exists.

## 4) Allowed Paths / Forbidden Paths

**Allowed:**
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (affiliate schema)
- `SOCELLE-WEB/src/pages/` — Affiliate portal surfaces only (path TBD in WO)
- `SOCELLE-MOBILE-main/apps/mobile/lib/features/affiliate/` — Mobile affiliate feature

**Forbidden:**
- All portal paths without explicit WO
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- Commerce flow (cart/checkout/orders) — NEVER MODIFY
- `apps/marketing-site/` — NEVER TOUCH

## 5) Execution Loop

1. **Identify WO:** Confirm affiliate-related WO exists in `build_tracker.md`.
2. **Find targets:** Locate affiliate portal routes in `SITE_MAP.md`. Identify existing affiliate tables in Supabase schema.
3. **Implement:** Affiliate schema migrations, attribution token generation, referral URL tracking, dashboard components.
4. **Verify LIVE vs DEMO:** Commission rates from DB, not hardcoded. All surfaces labeled.
5. **Verify placement:** Affiliate content after intelligence context (FAIL 6 enforcement).
6. **Verify disclosure:** FTC disclosure present on all affiliate surfaces.
7. **Produce diffs:** Exact file paths, line ranges, and diffs.
8. **Run builds:** `npx tsc --noEmit` — zero errors.

## 6) Handoff Protocol

| Scenario | Action |
|---|---|
| Stripe Connect not provisioned | Owner must configure — External Setup |
| Commerce flow changes needed | REFUSE — NEVER MODIFY |
| Mobile affiliate feature needs schema | Backend Agent migration first |

**Handoff artifact:** Attribution spec (token format, referral URL pattern, commission rules, payout triggers).

## 7) Proof Checklist

- [ ] WO ID in `build_tracker.md` confirmed
- [ ] Attribution logic verifiable (no ghost clicks, no unattributed payouts)
- [ ] Commission rates sourced from DB, not hardcoded
- [ ] Affiliate placement follows intelligence context (never as premise)
- [ ] FTC disclosure present on all affiliate surfaces
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `build_tracker.md` updated
- [ ] Doc Gate PASS (all 7 FAIL conditions checked)

## 8) Stop Conditions

- No active WO in `build_tracker.md` (do not build)
- Stripe Connect not provisioned (owner must configure)
- Commerce flow modifications requested (REFUSE — NEVER MODIFY)
- Affiliate placement violates intelligence-first thesis (FAIL 6)
