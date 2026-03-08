Shell Command: Install 'code' command in PATH# WEB AGENT — Workflow

## 1) Purpose

Web application development — public pages, portal pages (business/brand/admin), React components, Supabase data hooks, page-level UX. Operates within `SOCELLE-WEB/` as the primary feature agent for the web Intelligence Hub. Commerce flow (cart/checkout/orders) — NEVER MODIFY.

## 2) Authority

- `docs/command/AGENT_SCOPE_REGISTRY.md` §1
- `docs/command/SOCELLE_RELEASE_GATES.md`
- `docs/command/SOCELLE_CANONICAL_DOCTRINE.md`
- Doc Gate applies (FAIL 1–7). All outputs must pass.

## 3) Preconditions

**Required reads before any work:**
1. `/.claude/CLAUDE.md`
2. `/docs/command/SOCELLE_CANONICAL_DOCTRINE.md`
3. `/docs/command/AGENT_SCOPE_REGISTRY.md` — §1
4. `/docs/command/SOCELLE_RELEASE_GATES.md`
5. `/docs/command/SITE_MAP.md` — All web routes
6. `/docs/command/SOCELLE_FIGMA_TO_CODE_HANDOFF.md` — Design tokens, breakpoints
7. `SOCELLE-WEB/docs/build_tracker.md`

**WO ID rule:** WO IDs only valid if present in `SOCELLE-WEB/docs/build_tracker.md`. Do not build until WO exists.

## 4) Allowed Paths / Forbidden Paths

**Allowed:**
- `SOCELLE-WEB/src/pages/` — Read/write (all page components, WO required for portal pages)
- `SOCELLE-WEB/src/components/` — Read/write (shared components)
- `SOCELLE-WEB/src/lib/` — Read/write (hooks, utilities — except forbidden files)
- `SOCELLE-WEB/src/App.tsx` — Read/write (routing)

**Forbidden:**
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- Commerce flow (cart/checkout/orders) — NEVER MODIFY
- `SOCELLE-MOBILE-main/` — NEVER TOUCH
- `apps/marketing-site/` — NEVER TOUCH (SEO Agent domain)
- `supabase/migrations/` — NEVER MODIFY (Backend Agent scope)

## 5) Execution Loop

1. **Identify WO:** Confirm WO exists in `build_tracker.md`.
2. **Find targets:** Locate target routes in `SITE_MAP.md`. Review existing page components.
3. **Implement:** Page components, data hooks, UI elements per Figma handoff.
4. **Verify LIVE vs DEMO:** All data surfaces labeled. `isLive` pattern applied to all new hooks.
5. **Verify design parity:** Tokens match `SOCELLE_FIGMA_TO_CODE_HANDOFF.md`.
6. **Produce diffs:** Exact file paths, line ranges, and diffs.
7. **Run builds:** `npx tsc --noEmit` — zero errors.

## 6) Handoff Protocol

| Scenario | Action |
|---|---|
| Supabase migration needed | Hand off to Backend Agent |
| Marketing site changes needed | Hand off to SEO Agent |
| Mobile feature parity needed | Coordinate with Mobile Agent |
| Commerce flow changes needed | REFUSE — NEVER MODIFY |

**Handoff artifact:** Page component spec (route, component tree, data hooks, RLS requirements, LIVE/DEMO labels).

## 7) Proof Checklist

- [ ] WO ID in `build_tracker.md` confirmed
- [ ] All data surfaces labeled LIVE or DEMO
- [ ] `isLive` pattern applied to new data hooks
- [ ] Design tokens match Figma handoff
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `build_tracker.md` updated
- [ ] Doc Gate PASS (all 7 FAIL conditions checked)

## 8) Stop Conditions

- No active WO in `build_tracker.md` (do not build)
- Supabase migration required (hand off to Backend Agent)
- Marketing site changes requested (hand off to SEO Agent)
- Commerce flow modification requested (REFUSE — NEVER MODIFY)
- Auth system modification requested (REFUSE — NEVER MODIFY)
