# EDUCATION STUDIO AGENT — Workflow

## 1) Purpose

Education Hub — course builder, protocol library, CE credits system, training scheduler. Builds on existing `brand_training_modules` and `canonical_protocols` tables. Education content is intelligence-layer content, not ecommerce. Commerce flow (cart/checkout/orders) — NEVER MODIFY.

## 2) Authority

- `docs/command/AGENT_SCOPE_REGISTRY.md` §13
- `docs/command/SOCELLE_RELEASE_GATES.md`
- Doc Gate applies (FAIL 1–7). All outputs must pass.

## 3) Preconditions

**Required reads before any work:**
1. `/.claude/CLAUDE.md`
2. `/docs/command/SOCELLE_CANONICAL_DOCTRINE.md`
3. `/docs/command/AGENT_SCOPE_REGISTRY.md` — §13
4. `/docs/command/SOCELLE_RELEASE_GATES.md`
5. `/docs/command/SITE_MAP.md` — Education routes (`/education`, `/protocols`, `/protocols/:slug`)
6. `SOCELLE-WEB/docs/build_tracker.md`

**WO ID rule:** WO IDs only valid if present in `SOCELLE-WEB/docs/build_tracker.md`. Do not build until WO exists.

## 4) Allowed Paths / Forbidden Paths

**Allowed:**
- `SOCELLE-WEB/src/pages/public/Education.tsx` — Read/write (WO required)
- `SOCELLE-WEB/src/pages/business/CECredits.tsx` — Read/write (WO required)
- `SOCELLE-WEB/src/pages/admin/` — Education admin surfaces (ADD ONLY, WO required)
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (education schema — Phase 2 migrations)
- `SOCELLE-MOBILE-main/apps/mobile/lib/features/studio/` — Mobile education features (WO required)

**Forbidden:**
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- Commerce flow (cart/checkout/orders) — NEVER MODIFY
- Brand portal education surfaces without explicit WO
- `apps/marketing-site/` — NEVER TOUCH

## 5) Execution Loop

1. **Identify WO:** Confirm education-related WO exists in `build_tracker.md`.
2. **Find targets:** Locate education routes in `SITE_MAP.md`. Review `brand_training_modules` and `canonical_protocols` schema.
3. **Implement:** Course builder, CE credits system, education schema migrations.
4. **Verify LIVE vs DEMO:** CE credits tied to real completion events (not hardcoded). All surfaces labeled.
5. **Verify positioning:** Education lives under intelligence layer (not ecommerce).
6. **Produce diffs:** Exact file paths, line ranges, and diffs.
7. **Run builds:** `npx tsc --noEmit` — zero errors.

## 6) Handoff Protocol

| Scenario | Action |
|---|---|
| Zoom/live scheduler not provisioned | Phase 2 dependency — escalate to owner |
| Brand portal education surfaces need changes without WO | STOP — WO required |
| Mobile education feature requires new schema | Hand off to Backend Agent for migration |
| Commerce flow changes needed | REFUSE — NEVER MODIFY |

**Handoff artifact:** Education spec (course schema, CE credit issuance rules, completion event triggers, protocol library structure).

## 7) Proof Checklist

- [ ] WO ID in `build_tracker.md` confirmed
- [ ] Phase 2 migrations follow ADD ONLY policy
- [ ] CE credits tied to real completion events, not hardcoded
- [ ] Education content positioned under intelligence layer (not ecommerce)
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `build_tracker.md` updated
- [ ] Doc Gate PASS (all 7 FAIL conditions checked)

## 8) Stop Conditions

- No active WO in `build_tracker.md` (do not build)
- Zoom/live scheduler not provisioned (Phase 2 dependency — escalate)
- Brand portal education surfaces need changes without WO (STOP)
- Mobile education feature requires schema not yet created (hand off to Backend Agent)
- Commerce flow modification requested (REFUSE — NEVER MODIFY)
