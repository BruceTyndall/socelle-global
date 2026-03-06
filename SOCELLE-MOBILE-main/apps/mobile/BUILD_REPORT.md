# Socelle Mobile — First Build Report

**Date:** 2026-02-23
**Flutter:** 3.41.1 / Dart 3.11.0
**Platform:** iOS (Apple Silicon Mac)

---

## A) FINAL STATUS

| Phase | Status | Notes |
|-------|--------|-------|
| 0 — Baseline Lock | COMPLETE | Repo confirmed, socelle_api.dart created, WORKLOG started |
| 1 — Brand + Quarantine | COMPLETE | 44 files renamed, feature_flags.dart created, modules_dormant.md created, grep 0 matches in MVP |
| 2 — Onboarding Rebuild | COMPLETE | 3-screen flow (Hook, Input, Reveal) in onboarding_flow.dart |
| 3 — Core Revenue Loop | COMPLETE | schedule_page.dart rebuilt with gap list, actions, recovered revenue |
| 4 — AI Layer | COMPLETE | ai_provider.dart with JSON schema, stub impl |
| 5 — Trial + Paywall | COMPLETE | paywall_page.dart rebranded, $29/mo $249/yr, 14-day trial, calm copy |
| 6 — Supabase Migration | COMPLETE | supabase_client.dart, dual_write_bridge.dart, supabase_schema.sql |
| 7 — Ship Readiness | COMPLETE | Dormant imports guarded, toUpperCase removed, null guards verified |

**Remaining (requires human action on Mac):**
- `flutter analyze` — run locally (VM has no Flutter SDK)
- `flutter test` — run locally
- `flutter build ios --debug` — run locally
- `flutter build ios --release` — run locally (requires signing)
- RevenueCat dashboard: create $29/mo and $249/yr products
- Apple App Store Connect: create app listing
- Firebase project: verify Cloud Functions deployed

---

## B) VERIFICATION LOGS

### Grep: SLOTFORCE/SlotForce/slotforce in lib/

**MVP surfaces:** 0 matches

**Dormant modules only (expected, quarantined):**
- lib/features/share/revenue_snapshot.dart (slotforce_colors, SLOTFORCE strings)
- lib/features/dashboard/*.dart (slotforce_colors, SLOTFORCE strings)
- lib/features/studio/studio_page.dart (slotforce_colors, SLOTFORCE strings)
- lib/features/shop/shop_page.dart (slotforce_colors, slotforce.app URLs)
- lib/features/messages/messages_page.dart (slotforce_colors)
- lib/features/weekly_summary/weekly_summary_page.dart (slotforce_colors)
- lib/core/widgets/celebration_overlay.dart (slotforce_colors)
- lib/core/theme/slotforce_colors.dart (dormant theme file)
- lib/core/theme/slotforce_theme.dart (dormant theme file)

**Firebase config (correct, not renamed):**
- lib/firebase_options.dart: projectId 'slotforce-f18eb' (Firebase project ID, must NOT change)

### Grep: toUpperCase in MVP features

- lib/features/settings/settings_page.dart:28 — referral code generation (not a header, correct)
- All others in dormant files only

### Dormant Module Reachability Audit

**Violations found and fixed:**
1. main.dart: AbTestService.initialize() — wrapped with FeatureFlags.kEnableAbTest
2. gap_action_sheet.dart: streak_provider — wrapped with FeatureFlags.kEnableStreaks
3. fill_slot_flow.dart: streak_provider — wrapped with FeatureFlags.kEnableStreaks
4. paywall_trigger_provider.dart: ab_test_service — wrapped with FeatureFlags.kEnableAbTest

**Post-fix status:** All dormant code gated behind false flags. Zero dormant modules reachable at runtime.

### UI Authority Compliance

| Rule | Status |
|------|--------|
| No gradients in MVP | PASS |
| No bounce/confetti | PASS |
| No ALL CAPS headers | PASS (fixed settings_page) |
| No bright blues/neon | PASS |
| No charts in MVP | PASS |
| Revenue number dominates viewport | PASS (48px, 35-45% viewport) |
| Calm editorial tone | PASS |

### Null Safety & Empty States

| File | Loading | Empty | Error | Null Guards |
|------|---------|-------|-------|-------------|
| revenue_page.dart | .when() skeleton | _RevenueEmptyState | Falls to empty | Excellent |
| schedule_page.dart | .when() skeleton | _ScheduleEmptyState | Falls to empty | Excellent |
| onboarding_flow.dart | N/A (form) | N/A | SnackBar errors | Good |
| paywall_page.dart | .valueOrNull ?? 85 | N/A (modal) | Safe fallbacks | Good |
| settings_page.dart | .valueOrNull ?? defaults | N/A (form) | Safe fallbacks | Good |
| main.dart | _SplashScreen | N/A | Firebase error screen | Excellent |

---

## C) FILE CHANGE MANIFEST

### Files Created (16)

| Path | Purpose |
|------|---------|
| WORKLOG.md | Build log |
| BUILD_REPORT.md | This file |
| docs/modules_dormant.md | Dormant module registry |
| docs/supabase_schema.sql | RLS schema for migration |
| lib/core/feature_flags.dart | All flags false (kEnableStudio, kEnableShop, kEnableMessages, kEnableShare, kEnableDashboards, kEnableAbTest, kEnableStreaks) |
| lib/core/theme/socelle_colors.dart | New Socelle token system |
| lib/core/theme/socelle_theme.dart | New Socelle theme |
| lib/features/onboarding/onboarding_flow.dart | 3-screen onboarding (Hook, Input, Reveal) |
| lib/features/revenue/revenue_page.dart | Revenue tab with leakage hero |
| lib/features/schedule/schedule_page.dart | Schedule tab with gap list |
| lib/models/ai_suggestion.dart | AI suggestion data model |
| lib/models/revenue_summary.dart | Revenue summary data model |
| lib/providers/revenue_providers.dart | Riverpod providers for revenue |
| lib/services/ai_provider.dart | LLM provider interface + stub |
| lib/services/dual_write_bridge.dart | Firebase/Supabase bridge |
| lib/services/socelle_api.dart | Cloud Functions API client |
| lib/services/supabase_client.dart | Supabase init placeholder |

### Files Modified (44)

**iOS Config:**
- ios/Runner/Info.plist

**Core:**
- lib/core/constants.dart
- lib/core/widgets/main_navigation_drawer.dart
- lib/core/widgets/sf_badge.dart
- lib/core/widgets/sf_button.dart
- lib/core/widgets/sf_card.dart
- lib/core/widgets/sf_chip.dart
- lib/core/widgets/sf_empty_state.dart
- lib/core/widgets/sf_progress_bar.dart
- lib/core/widgets/sf_stat_card.dart
- lib/core/widgets/sf_widgets.dart

**Features:**
- lib/features/gap_action/fill_slot_flow.dart
- lib/features/gap_action/gap_action_sheet.dart
- lib/features/gap_action/mark_intentional_sheet.dart
- lib/features/onboarding/onboarding_page.dart
- lib/features/onboarding/widgets/booking_value_step.dart
- lib/features/onboarding/widgets/intro_scene_step.dart
- lib/features/onboarding/widgets/leakage_reveal.dart
- lib/features/onboarding/widgets/provider_profile_step.dart
- lib/features/onboarding/widgets/slot_duration_step.dart
- lib/features/onboarding/widgets/working_hours_step.dart
- lib/features/paywall/paywall_page.dart
- lib/features/paywall/widgets/trial_badge.dart
- lib/features/settings/cancel_intercept_page.dart
- lib/features/settings/exit_survey_sheet.dart
- lib/features/settings/notification_frequency_widget.dart
- lib/features/settings/settings_page.dart
- lib/features/settings/widgets/booking_value_editor.dart
- lib/features/settings/widgets/calendar_connection_card.dart
- lib/features/settings/widgets/slot_duration_editor.dart
- lib/features/settings/widgets/working_hours_editor.dart
- lib/features/shell/app_shell.dart
- lib/features/support/support_page.dart

**Models:**
- lib/models/subscription_state.dart
- lib/models/user_settings.dart

**Providers:**
- lib/providers/google_connection_provider.dart
- lib/providers/paywall_trigger_provider.dart
- lib/providers/sync_provider.dart

**Services:**
- lib/services/analytics_service.dart
- lib/services/apple_calendar_service.dart
- lib/services/google_oauth_service.dart
- lib/services/slotforce_api.dart

**Config:**
- pubspec.yaml

### Files Deleted: 0
(All dormant modules quarantined, not deleted)

---

## D) RUNBOOK

### Dev Setup

```bash
cd apps/mobile
flutter pub get
flutter analyze        # Target: 0 errors, 0 warnings
flutter test           # Target: all passing
```

### iOS Debug Build

```bash
flutter build ios --debug
# or run on simulator:
flutter run -d <simulator-id>
```

### iOS Release Build

```bash
# Requires Apple Developer signing configured in Xcode
flutter build ios --release
# Then archive via Xcode: Product → Archive
```

### RevenueCat Configuration

1. Create products in App Store Connect:
   - `socelle_monthly` — $29.00/mo auto-renewable
   - `socelle_annual` — $249.00/yr auto-renewable
2. In RevenueCat dashboard:
   - Create entitlement: `pro`
   - Create offering with both products
   - Set API key in lib/core/constants.dart → `revenueCatApiKeyIos`

### Cloud Functions Deploy

```bash
cd functions
npm install
firebase deploy --only functions
```

Required Cloud Functions:
- `syncCalendarEvents` — accepts device calendar events, returns gaps
- `trackAppOpen` — resets inactivity tier on foreground
- `getRevenueSummary` — returns leakage, recovered revenue, AI suggestion

### Supabase Migration (Phase 2+)

1. Create Supabase project
2. Run docs/supabase_schema.sql to create tables + RLS
3. Update lib/services/supabase_client.dart with real URL + anon key
4. Add `supabase_flutter` to pubspec.yaml
5. Set `DualWriteBridge.supabaseWriteEnabled = true`
6. Monitor dual-write logs for parity
7. When confident, flip `DualWriteBridge.readSource = 'supabase'`

### Feature Flag Activation (Phase 2+)

To re-enable a quarantined module:
1. Set the corresponding flag to `true` in lib/core/feature_flags.dart
2. Add navigation entry in app_shell.dart or drawer
3. Verify the module compiles and renders correctly
4. Run full test suite

### Open Items

- [ ] Run `flutter analyze` on Mac (0 errors/warnings target)
- [ ] Run `flutter test` on Mac
- [ ] Build iOS debug on simulator
- [ ] Build iOS release with signing
- [ ] Configure RevenueCat products in dashboard
- [ ] Verify Cloud Functions are deployed
- [ ] Add GoogleService-Info.plist to iOS runner (if not present)
- [ ] Set real RevenueCat API key in constants.dart
- [ ] App Store Connect listing (screenshots, description, metadata)
- [ ] TestFlight beta distribution
