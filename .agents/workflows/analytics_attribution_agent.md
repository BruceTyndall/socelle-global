# ANALYTICS / ATTRIBUTION AGENT — Workflow

## 1) Purpose

Analytics and attribution infrastructure — GA4 integration, conversion tracking, attribution modeling, performance dashboards, Core Web Vitals monitoring. Provides measurement layer for all surfaces without modifying feature code. Commerce flow (cart/checkout/orders) — NEVER MODIFY.

## 2) Authority

- `docs/command/SOCELLE_RELEASE_GATES.md` — §5 (performance budgets)
- `docs/command/SOCELLE_CANONICAL_DOCTRINE.md`
- Doc Gate applies (FAIL 1–7). All outputs must pass.

## 3) Preconditions

**Required reads before any work:**
1. `/.claude/CLAUDE.md`
2. `/docs/command/SOCELLE_CANONICAL_DOCTRINE.md`
3. `/docs/command/SOCELLE_RELEASE_GATES.md` — §5 (performance budgets)
4. `/docs/command/SITE_MAP.md` — All routes requiring analytics coverage
5. `/docs/command/HARD_CODED_SURFACES.md` — Surfaces needing attribution
6. `SOCELLE-WEB/docs/build_tracker.md`

**WO ID rule:** WO IDs only valid if present in `SOCELLE-WEB/docs/build_tracker.md`. Do not build until WO exists.

## 4) Allowed Paths / Forbidden Paths

**Allowed:**
- `SOCELLE-WEB/src/lib/analytics/` — Read/write (analytics utilities)
- `SOCELLE-WEB/src/lib/tracking.ts` — Read/write (event tracking)
- `SOCELLE-WEB/supabase/migrations/` — ADD ONLY (analytics schema)
- `apps/marketing-site/src/` — Analytics integration only (no layout changes)
- `SOCELLE-WEB/src/components/` — Analytics wrapper components only

**Forbidden:**
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- Commerce flow (cart/checkout/orders) — NEVER MODIFY
- `SOCELLE-WEB/src/pages/` — Read only (add tracking calls via hooks, no UI changes)
- `SOCELLE-MOBILE-main/` — NEVER TOUCH (mobile analytics is Mobile Agent scope)
- Feature code logic — NEVER MODIFY (instrument only, do not change behavior)

## 5) Execution Loop

1. **Identify WO:** Confirm analytics-related WO exists in `build_tracker.md`.
2. **Find targets:** Locate routes requiring analytics in `SITE_MAP.md`. Review existing tracking setup.
3. **Implement:** Analytics hooks, conversion tracking, attribution schema, performance monitoring.
4. **Verify privacy:** No PII in any analytics payload.
5. **Verify performance:** Core Web Vitals within budget (LCP < 2.5s, FID < 100ms, CLS < 0.1).
6. **Produce diffs:** Exact file paths, line ranges, and diffs.
7. **Run builds:** `npx tsc --noEmit` — zero errors.

## 6) Handoff Protocol

| Scenario | Action |
|---|---|
| Page structure changes needed | Hand off to Web Agent |
| PII detected in analytics payload | STOP — remove immediately |
| Performance budget exceeded | Escalate to Infra/DevOps Agent |
| Commerce flow changes needed | REFUSE — NEVER MODIFY |

**Handoff artifact:** Analytics spec (GA4 event map, conversion funnel, attribution model, performance budget report).

## 7) Proof Checklist

- [ ] WO ID in `build_tracker.md` confirmed
- [ ] GA4 events fire correctly on tracked surfaces
- [ ] No PII in analytics payloads
- [ ] Core Web Vitals within performance budgets
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `build_tracker.md` updated
- [ ] Doc Gate PASS (all 7 FAIL conditions checked)

## 8) Stop Conditions

- No active WO in `build_tracker.md` (do not build)
- Page structure changes needed (hand off to Web Agent)
- PII detected in analytics payload (STOP — remove immediately)
- Performance budget exceeded (escalate to Infra/DevOps Agent)
- Commerce flow modification requested (REFUSE — NEVER MODIFY)
