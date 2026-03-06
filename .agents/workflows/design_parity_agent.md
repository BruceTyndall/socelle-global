# DESIGN PARITY AGENT — Workflow

## 1) Purpose

Design token parity enforcement across web (Tailwind) and mobile (Flutter) — color tokens, typography scale, spacing grid, glass effects, component naming. Ensures Figma design decisions translate 1:1 into code without drift. Does not build features — validates and synchronizes design tokens. Commerce flow (cart/checkout/orders) — NEVER MODIFY.

## 2) Authority

- `docs/command/SOCELLE_FIGMA_TO_CODE_HANDOFF.md`
- `docs/command/SOCELLE_CANONICAL_DOCTRINE.md` — §3 (colors), §4 (typography), §5 (glass)
- Doc Gate applies (FAIL 1–7). All outputs must pass.

## 3) Preconditions

**Required reads before any work:**
1. `/.claude/CLAUDE.md`
2. `/docs/command/SOCELLE_CANONICAL_DOCTRINE.md` — §3 (colors), §4 (typography), §5 (glass)
3. `/docs/command/SOCELLE_FIGMA_TO_CODE_HANDOFF.md` — Full document
4. `/docs/command/AGENT_SCOPE_REGISTRY.md`
5. `SOCELLE-WEB/docs/build_tracker.md`

**WO ID rule:** WO IDs only valid if present in `SOCELLE-WEB/docs/build_tracker.md`. No WO needed for drift corrections.

## 4) Allowed Paths / Forbidden Paths

**Allowed:**
- `SOCELLE-WEB/tailwind.config.js` — Read/write (token updates)
- `SOCELLE-WEB/src/index.css` — Read/write (CSS custom properties)
- `SOCELLE-MOBILE-main/apps/mobile/lib/core/theme/socelle_theme.dart` — Read/write (Flutter tokens)
- `docs/command/SOCELLE_FIGMA_TO_CODE_HANDOFF.md` — Read (source of truth)
- `docs/command/SOCELLE_CANONICAL_DOCTRINE.md` — Read (design locks)

**Forbidden:**
- `SOCELLE-WEB/src/pages/` — NEVER TOUCH (component code is agent-specific)
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- Commerce flow (cart/checkout/orders) — NEVER MODIFY
- `supabase/` — NEVER TOUCH
- `apps/marketing-site/src/` — Read only (verify token usage)

## 5) Execution Loop

1. **Identify scope:** Confirm design token change has WO or is a parity fix (no WO needed for drift corrections).
2. **Find targets:** Compare token files across web and mobile against Figma spec.
3. **Implement:** Token file updates — `tailwind.config.js`, `index.css`, `socelle_theme.dart`.
4. **Verify parity:** Run no-drift checklist. All tokens match across web and mobile.
5. **Verify locks:** No banned colors or banned fonts used.
6. **Produce diffs:** Exact file paths, line ranges, and diffs.
7. **Run builds:** `npx tsc --noEmit` — zero errors (web). `flutter analyze` — zero errors (mobile, if applicable).

## 6) Handoff Protocol

| Scenario | Action |
|---|---|
| Component-level UI changes needed | Hand off to Web/Mobile Agent |
| New design tokens from Figma not approved | Escalate to owner |
| Contradiction between Figma spec and Doctrine | Escalate to Command Center |
| Commerce flow changes needed | REFUSE — NEVER MODIFY |

**Handoff artifact:** Token parity report (web vs mobile vs Figma, drift items, no-drift checklist results).

## 7) Proof Checklist

- [ ] All color tokens match: Figma → Tailwind → Flutter
- [ ] Typography scale matches across platforms
- [ ] Glass/blur effects match Doctrine §5
- [ ] No banned colors used (`SOCELLE_CANONICAL_DOCTRINE.md` §3)
- [ ] No banned fonts used (`SOCELLE_CANONICAL_DOCTRINE.md` §4)
- [ ] `npx tsc --noEmit` — zero errors (if applicable)
- [ ] `build_tracker.md` updated (if WO-scoped)
- [ ] Doc Gate PASS (all 7 FAIL conditions checked)

## 8) Stop Conditions

- Component-level UI changes needed (hand off to Web/Mobile Agent)
- New design tokens from Figma not yet approved by owner (escalate)
- Contradiction between Figma spec and Doctrine design locks (escalate to Command Center)
- Commerce flow modification requested (REFUSE — NEVER MODIFY)
