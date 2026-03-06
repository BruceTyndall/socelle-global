# SOCIAL STUDIO AGENT — Workflow

## 1) Purpose

Social media management studio — content scheduling, social analytics, platform publishing, engagement tracking. Provides social media tooling for operators and brands within portal surfaces. No automated DM functionality. Commerce flow (cart/checkout/orders) — NEVER MODIFY.

## 2) Authority

- `docs/command/AGENT_SCOPE_REGISTRY.md` §14
- `docs/command/SOCELLE_RELEASE_GATES.md`
- Doc Gate applies (FAIL 1–7). All outputs must pass.

## 3) Preconditions

**Required reads before any work:**
1. `/.claude/CLAUDE.md`
2. `/docs/command/SOCELLE_CANONICAL_DOCTRINE.md`
3. `/docs/command/AGENT_SCOPE_REGISTRY.md` — §14
4. `/docs/command/SOCELLE_RELEASE_GATES.md`
5. `/docs/command/SITE_MAP.md` — Social studio routes
6. `SOCELLE-WEB/docs/build_tracker.md`

**WO ID rule:** WO IDs only valid if present in `SOCELLE-WEB/docs/build_tracker.md`. Do not build until WO exists.

## 4) Allowed Paths / Forbidden Paths

**Allowed:**
- `SOCELLE-WEB/src/pages/business/` — Social studio surfaces (WO required)
- `SOCELLE-WEB/src/pages/brand/` — Brand social surfaces (WO required)
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (social schema)
- `SOCELLE-WEB/supabase/functions/` — ADD ONLY (social API edge functions)

**Forbidden:**
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- Commerce flow (cart/checkout/orders) — NEVER MODIFY
- Outreach / cold acquisition messaging — NEVER (FAIL 7)
- Automated DM functionality — NEVER
- `SOCELLE-WEB/src/pages/public/` — Web Agent domain
- `SOCELLE-MOBILE-main/` — NEVER TOUCH
- `apps/marketing-site/` — NEVER TOUCH

## 5) Execution Loop

1. **Identify WO:** Confirm social studio WO exists in `build_tracker.md`.
2. **Find targets:** Locate social studio routes in `SITE_MAP.md`. Identify existing social schema.
3. **Implement:** Social scheduling UI, analytics dashboards, publishing edge functions.
4. **Verify LIVE vs DEMO:** All social data labeled LIVE or DEMO.
5. **Verify RLS:** RLS prevents cross-tenant social account access. No automated DM. No cold outreach.
6. **Produce diffs:** Exact file paths, line ranges, and diffs.
7. **Run builds:** `npx tsc --noEmit` — zero errors.

## 6) Handoff Protocol

| Scenario | Action |
|---|---|
| Platform API keys not provisioned | Owner must configure — External Setup |
| Automated DM or cold outreach requested | REFUSE — FAIL 7 |
| Cross-tenant social access detected | STOP — fix RLS immediately |
| Commerce flow changes needed | REFUSE — NEVER MODIFY |

**Handoff artifact:** Social integration spec (platform APIs, scheduling pipeline, analytics data model, tenant-scoped RLS policies).

## 7) Proof Checklist

- [ ] WO ID in `build_tracker.md` confirmed
- [ ] RLS prevents cross-tenant social account access
- [ ] No automated DM or cold outreach functionality scaffolded
- [ ] Social data labeled LIVE or DEMO on all surfaces
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `build_tracker.md` updated
- [ ] Doc Gate PASS (all 7 FAIL conditions checked)

## 8) Stop Conditions

- No active WO in `build_tracker.md` (do not build)
- Platform API keys not provisioned (owner must configure — External Setup)
- Automated DM or cold outreach requested (REFUSE — FAIL 7)
- Cross-tenant social account access detected (STOP — fix RLS)
- Commerce flow modification requested (REFUSE — NEVER MODIFY)
