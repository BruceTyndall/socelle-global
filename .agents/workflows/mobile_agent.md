# MOBILE AGENT — Workflow

## 1) Purpose

Flutter mobile application development — AI Concierge, B2B marketplace, margin analysis, mobile-native features. Uses Riverpod for state management, connects to Supabase via `supabase_flutter`. Operates within `SOCELLE-MOBILE-main/apps/mobile/`. Commerce flow (cart/checkout/orders) — NEVER MODIFY.

## 2) Authority

- `docs/command/AGENT_SCOPE_REGISTRY.md` §2
- `docs/command/SOCELLE_RELEASE_GATES.md`
- `docs/command/SOCELLE_CANONICAL_DOCTRINE.md`
- Doc Gate applies (FAIL 1–7). All outputs must pass.

## 3) Preconditions

**Required reads before any work:**
1. `/.claude/CLAUDE.md`
2. `/docs/command/SOCELLE_CANONICAL_DOCTRINE.md`
3. `/docs/command/AGENT_SCOPE_REGISTRY.md` — §2
4. `/docs/command/SOCELLE_RELEASE_GATES.md`
5. `/docs/command/SOCELLE_FIGMA_TO_CODE_HANDOFF.md` — Mobile design tokens
6. `/docs/command/SITE_MAP.md` — Mobile screens
7. `SOCELLE-WEB/docs/build_tracker.md`

**WO ID rule:** WO IDs only valid if present in `SOCELLE-WEB/docs/build_tracker.md`. Do not build until WO exists.

## 4) Allowed Paths / Forbidden Paths

**Allowed:**
- `SOCELLE-MOBILE-main/apps/mobile/lib/` — Read/write (all mobile feature code)
- `SOCELLE-MOBILE-main/apps/mobile/pubspec.yaml` — Read/write (dependencies)
- `SOCELLE-MOBILE-main/apps/mobile/test/` — Read/write (tests)

**Forbidden:**
- `SOCELLE-WEB/` — NEVER TOUCH (Web Agent scope)
- `apps/marketing-site/` — NEVER TOUCH (SEO Agent domain)
- `supabase/migrations/` — NEVER MODIFY (Backend Agent scope)
- Commerce flow (cart/checkout/orders) — NEVER MODIFY
- Firebase Auth / Firestore — NEVER USE (migrated to Supabase)

## 5) Execution Loop

1. **Identify WO:** Confirm WO exists in `build_tracker.md`.
2. **Find targets:** Locate target screens in `SITE_MAP.md`. Review existing mobile features.
3. **Implement:** Flutter screens, Riverpod providers, Supabase data connections.
4. **Verify design parity:** Tokens match `socelle_theme.dart` and Figma handoff.
5. **Verify no Firebase:** Only `supabase_flutter` for auth and data.
6. **Produce diffs:** Exact file paths, line ranges, and diffs.
7. **Run builds:** `flutter analyze` — zero errors.

## 6) Handoff Protocol

| Scenario | Action |
|---|---|
| New backend feature/column needed | Draft request to Backend Agent |
| Web parity feature needed | Coordinate with Web Agent |
| Design token drift detected | Hand off to Design Parity Agent |
| Commerce flow changes needed | REFUSE — NEVER MODIFY |

**Handoff artifact:** Mobile feature spec (screen tree, Riverpod providers, Supabase queries, design token usage).

## 7) Proof Checklist

- [ ] WO ID in `build_tracker.md` confirmed
- [ ] Design tokens match `socelle_theme.dart` and Figma handoff
- [ ] Only `supabase_flutter` used (no Firebase)
- [ ] Riverpod providers are granular and testable
- [ ] `flutter analyze` — zero errors
- [ ] `build_tracker.md` updated
- [ ] Doc Gate PASS (all 7 FAIL conditions checked)

## 8) Stop Conditions

- No active WO in `build_tracker.md` (do not build)
- Backend schema change needed (hand off to Backend Agent)
- Commerce flow modification requested (REFUSE — NEVER MODIFY)
- Firebase usage detected (STOP — migrate to Supabase)
- Design token drift detected (hand off to Design Parity Agent)
