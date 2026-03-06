# 07 — PR Shipping Plan
> Autonomous execution plan — February 2026

---

## PR0 — Toolchain + Lint Green
**Complexity**: S | **Risk**: Low

### Goal
Zero analyzer errors, zero warnings in hot paths, pre-commit hooks wired.

### Files Changed
- `apps/mobile/lib/features/settings/notification_frequency_widget.dart` — fix import ✅ (done)
- `apps/mobile/lib/features/shell/app_shell.dart` — remove unused import ✅ (done)
- `apps/mobile/analysis_options.yaml` — tighten rules (prefer_const_constructors as warning not info)
- `packages/functions/src/sync/persistence.ts:361` — fix rolling_30d_leakage (BUG-001)
- `packages/functions/src/index.ts:247` — fix `_onAppForegrounded` source (BUG-005)
- `packages/functions/src/index.ts:848` — fix nextWeekGapCount (BUG-003)

### Test Evidence
- `flutter analyze --no-pub` → 0 errors
- `npm test` → 110/110 passing
- New test: `rolling_30d_leakage_test.ts`

---

## PR1 — Design System + App Shell
**Complexity**: M | **Risk**: Medium (visual-only changes)

### Goal
Implement the `SfButton`, `SfCard`, `SfEmptyState`, `SfStatCard`, `SfChip`, `SfProgressBar` component library. Apply consistently across existing screens. Refactor app shell nav to match design system spec.

### Files Changed / Created
- `apps/mobile/lib/core/widgets/sf_button.dart` — NEW
- `apps/mobile/lib/core/widgets/sf_card.dart` — NEW
- `apps/mobile/lib/core/widgets/sf_empty_state.dart` — NEW
- `apps/mobile/lib/core/widgets/sf_stat_card.dart` — NEW
- `apps/mobile/lib/core/widgets/sf_chip.dart` — NEW
- `apps/mobile/lib/core/widgets/sf_progress_bar.dart` — NEW
- `apps/mobile/lib/core/widgets/sf_action_sheet.dart` — NEW
- `apps/mobile/lib/features/shell/app_shell.dart` — refactor nav
- `apps/mobile/lib/core/theme/slotforce_theme.dart` — apply typography scale

### Screens Affected
Dashboard, Shell nav bar

### Risk Notes
- Do not change business logic, only visual layer
- Keep IndexedStack structure intact
- Verify all 4 tabs still render correctly

### Test Evidence
- `flutter analyze` clean
- Manual visual review of all 4 tabs
- Screenshot comparison

---

## PR2 — Onboarding + Calendar Connect
**Complexity**: M | **Risk**: Medium

### Goal
Refactor onboarding to use new design system components. Fix the calendar connect flow (proper error states, permission denial handling). Add account-save prompt (BUG-004 mitigation).

### Files Changed
- `apps/mobile/lib/features/onboarding/onboarding_page.dart` — refactor steps
- `apps/mobile/lib/features/onboarding/widgets/*.dart` — apply SfButton, SfCard
- `apps/mobile/lib/services/google_oauth_service.dart` — add proper error typing
- `apps/mobile/lib/features/onboarding/widgets/calendar_connect_step.dart` — NEW (extracted)
- `apps/mobile/lib/main.dart` — BUG-005 fix (source: 'cold_start' / 'resume')

### Screens Affected
Onboarding flow (all 5 steps), Calendar connect

### Risk Notes
- Calendar permission flow is platform-specific — test on real iOS device
- Google Sign-In for calendar requires `serverClientId` to be configured

### Test Evidence
- Manual E2E: fresh install → onboarding → calendar connect → dashboard
- Apple calendar permission denial → graceful empty state
- Google OAuth error → reconnect CTA shown

---

## PR3 — Gap Feed + Detail
**Complexity**: M | **Risk**: High (core product loop)

### Goal
Complete gap card redesign. Add gap detail page (currently missing — gap card opens action sheet directly with no intermediate detail view). Fix BUG-006 (calendar-not-connected error state). Fix BUG-013 (PaywallPage weeklyLeakage).

### Files Changed
- `apps/mobile/lib/features/dashboard/widgets/gap_card.dart` — redesign
- `apps/mobile/lib/features/gaps/gap_detail_page.dart` — NEW
- `apps/mobile/lib/features/dashboard/dashboard_page.dart` — wire gap card → detail
- `apps/mobile/lib/providers/sync_provider.dart` — BUG-011 (auto-sync on build), BUG-012 (selector fix)
- `apps/mobile/lib/features/settings/cancel_intercept_page.dart` — BUG-013 fix

### Gap Card New Design
```
┌─────────────────────────────────────────┐
│ $85 · Thu Feb 27  •  2:00 – 3:00pm      │  ← leakage value prominent
│ ──────────────────────────────────────  │
│ 1 bookable slot · 60 min                │
│ [Fill this slot →]                      │  ← CTA always visible
└─────────────────────────────────────────┘
```

### Screens Affected
Dashboard (gap feed), Gap Detail (new), Cancel Intercept

### Risk Notes
- `updateGapStatus` callable must be tested — Gap not found error if gapId format drifts
- Auto-sync in `build()` must not fire more than once per session

### Test Evidence
- Sync with Google calendar → verify gaps appear
- Tap gap card → gap detail appears
- Mark as filled → dashboard updates, recovery badge shows
- Calendar not connected → SfEmptyState with connect CTA

---

## PR4 — Action Flows + Outcomes
**Complexity**: M | **Risk**: Medium

### Goal
Fix BUG-010 (analytics events after fill). Refactor `gap_action_sheet.dart` to use SfActionSheet. Add outcome confirmation redesign. Add haptic feedback on key actions.

### Files Changed
- `apps/mobile/lib/features/gap_action/gap_action_sheet.dart` — refactor
- `apps/mobile/lib/features/gap_action/fill_slot_flow.dart` — add analytics events
- `apps/mobile/lib/features/gaps/recovery_confirmation.dart` — redesign
- `apps/mobile/lib/services/analytics_service.dart` — add `gapFilled()`, `revenueRecovered()` if missing

### Key Analytics Events to Wire
- `gap_action_opened` (which gap, leakage value)
- `outreach_sent` (share sheet used)
- `gap_filled` (leakage value recovered)
- `revenue_recovered` (cumulative total)
- `gap_intentional` (reason)
- `gap_snoozed`

### Test Evidence
- Firebase Analytics debug view: verify all events fire
- Fill a gap → recovery badge updates on dashboard
- Intentional mark → gap disappears from open list

---

## PR5 — Insights + Settings
**Complexity**: S | **Risk**: Low

### Goal
Refactor weekly summary page, settings page, notification settings. Apply design system. Fix BUG-014 (notification init logging).

### Files Changed
- `apps/mobile/lib/features/weekly_summary/weekly_summary_page.dart` — redesign
- `apps/mobile/lib/features/settings/settings_page.dart` — apply design system
- `apps/mobile/lib/features/settings/notification_frequency_widget.dart` — polish
- `apps/mobile/lib/main.dart` — BUG-014 (add error logging)
- `apps/mobile/lib/features/support/support_page.dart` — polish

### Screens Affected
Weekly Summary, Settings, Support

### Test Evidence
- getWeeklySummary CF returns correct data
- Notification frequency change reflects in Firestore

---

## PR6 — Hardening + Performance + Accessibility + Analytics Verification
**Complexity**: L | **Risk**: Low (polish + tests)

### Goal
Final production-readiness pass.

### Work Items
1. **BUG-002 (timezone fix)** — Full implementation: add `timezone` field to onboarding + `UserSettings` model + pass to syncCalendarEvents + update gap engine
2. **BUG-004 (account portability)** — Implement Google Sign-In account linking in Settings
3. **BUG-008 (Android RevenueCat)** — Add Android key
4. **Accessibility audit** — Add `Semantics` to all interactive elements, test with VoiceOver
5. **Performance** — Add `const` constructors where missing, memoize expensive `syncResult` computations, add `RepaintBoundary` around animated elements
6. **E2E test** — Flutter integration test: onboarding → sync → gap → fill → recovery
7. **Analytics verification** — Validate all 7 key events fire in Firebase DebugView
8. **Error reporting** — Wire Firebase Crashlytics (or Sentry) in `main.dart`

### Files Changed (major)
- `apps/mobile/lib/models/user_settings.dart` — add `timezone` field
- `apps/mobile/lib/services/slotforce_api.dart` — pass timezone in sync request
- `packages/shared/src/index.ts` — add optional `timezone` to SyncCalendarEventsRequestSchema
- `packages/functions/src/index.ts` — pass timezone to runCalendarSync
- `packages/gap_engine/src/index.ts` — timezone-aware working hours conversion
- `apps/mobile/lib/main.dart` — Crashlytics init
- `apps/mobile/test/integration/` — NEW integration tests

### Test Evidence
- 110+ tests passing (backend)
- Integration test passing (Flutter)
- Flutter analyze: 0 errors
- Firebase deploy clean

---

## Ship Order Summary

```
PR0 → (merge) → PR1 → PR2 → (parallel: PR3, PR4) → PR5 → PR6
```

Estimated total: 3–5 focused work sessions of 2–3 hours each.

---

## Decision Log

| Decision | Rationale |
|----------|-----------|
| Keep anonymous auth for PR0–PR5 | Account linking is a breaking change; defer to PR6 |
| Keep bottom nav (4 tabs) | Good UX, already implemented — refine don't replace |
| No i18n yet | Product-market fit first; localise in v2 |
| Keep RevenueCat | Already integrated; don't switch payment providers mid-build |
| Fix timezone in PR6 not PR0 | Needs shared schema change + gap engine update + migration |
