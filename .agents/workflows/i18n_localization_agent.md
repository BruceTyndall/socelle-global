# I18N / LOCALIZATION AGENT — Workflow

## 1) Purpose

Internationalization and localization infrastructure — translation management, locale routing, hreflang tags, RTL support, currency/date formatting. Provides i18n foundation across web and mobile without modifying feature logic. Commerce flow (cart/checkout/orders) — NEVER MODIFY.

## 2) Authority

- `docs/command/SOCELLE_CANONICAL_DOCTRINE.md` — §9 (voice/tone for translations)
- `docs/command/SOCELLE_FIGMA_TO_CODE_HANDOFF.md` — Breakpoints, grids (RTL impact)
- Doc Gate applies (FAIL 1–7). All outputs must pass.

## 3) Preconditions

**Required reads before any work:**
1. `/.claude/CLAUDE.md`
2. `/docs/command/SOCELLE_CANONICAL_DOCTRINE.md` — §9 (voice/tone for translations)
3. `/docs/command/SOCELLE_FIGMA_TO_CODE_HANDOFF.md` — Breakpoints, grids (RTL impact)
4. `/docs/command/SITE_MAP.md` — All routes requiring localization
5. `SOCELLE-WEB/docs/build_tracker.md`

**WO ID rule:** WO IDs only valid if present in `SOCELLE-WEB/docs/build_tracker.md`. Do not build until WO exists.

## 4) Allowed Paths / Forbidden Paths

**Allowed:**
- `SOCELLE-WEB/src/lib/i18n/` — Read/write (i18n utilities)
- `SOCELLE-WEB/src/locales/` — Read/write (translation files)
- `apps/marketing-site/src/` — i18n integration only (no layout changes)
- `SOCELLE-MOBILE-main/apps/mobile/lib/l10n/` — Read/write (Flutter localization)
- `SOCELLE-MOBILE-main/apps/mobile/lib/core/` — Locale utilities only

**Forbidden:**
- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- Commerce flow (cart/checkout/orders) — NEVER MODIFY
- `SOCELLE-WEB/src/pages/` — Read only (extract strings, do not change UI logic)
- `supabase/` — NEVER TOUCH
- Feature code behavior — NEVER MODIFY (extract and replace strings only)

## 5) Execution Loop

1. **Identify WO:** Confirm i18n-related WO exists in `build_tracker.md`.
2. **Find targets:** Locate routes requiring localization in `SITE_MAP.md`. Identify user-facing strings.
3. **Implement:** Translation files, i18n configuration, hreflang tags, locale routing.
4. **Verify strings:** All user-facing strings extracted to locale files. No hardcoded strings in components.
5. **Verify hreflang:** hreflang tags valid for all supported locales.
6. **Produce diffs:** Exact file paths, line ranges, and diffs.
7. **Run builds:** `npx tsc --noEmit` — zero errors (web). `flutter analyze` — zero errors (mobile, if applicable).

## 6) Handoff Protocol

| Scenario | Action |
|---|---|
| Translations require native speaker review | Escalate to owner |
| Feature code changes needed for i18n support | Hand off to Web/Mobile Agent |
| New locale requires SEO hreflang updates | Coordinate with SEO Agent |
| Commerce flow changes needed | REFUSE — NEVER MODIFY |

**Handoff artifact:** i18n spec (locale file structure, hreflang mapping, RTL-affected components, string extraction manifest).

## 7) Proof Checklist

- [ ] WO ID in `build_tracker.md` confirmed
- [ ] All user-facing strings extracted to locale files
- [ ] hreflang tags valid for all supported locales
- [ ] No hardcoded user-facing strings in components
- [ ] `npx tsc --noEmit` — zero errors
- [ ] `build_tracker.md` updated
- [ ] Doc Gate PASS (all 7 FAIL conditions checked)

## 8) Stop Conditions

- No active WO in `build_tracker.md` (do not build)
- Translations require native speaker review (escalate to owner)
- Feature code changes needed for i18n support (hand off to Web/Mobile Agent)
- New locale requires SEO hreflang updates (coordinate with SEO Agent)
- Commerce flow modification requested (REFUSE — NEVER MODIFY)
