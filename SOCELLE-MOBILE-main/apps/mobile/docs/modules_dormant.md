# Dormant Modules — Socelle Mobile

> Status: **Dormant (Phase 2+)**
> Last updated: 2026-02-23

## Quarantined module paths

| Module | Path | Status |
|---|---|---|
| Studio | `lib/features/studio/` | Dormant (Phase 2+) |
| Shop | `lib/features/shop/` | Dormant (Phase 2+) |
| Messages | `lib/features/messages/` | Dormant (Phase 2+) |
| Share | `lib/features/share/` | Dormant (Phase 2+) |
| Dashboard | `lib/features/dashboard/` | Dormant (Phase 2+) |
| Weekly Summary | `lib/features/weekly_summary/` | Dormant (Phase 2+) |
| Celebration Overlay | `lib/core/widgets/celebration_overlay.dart` | Dormant (Phase 2+) |
| Streak Provider | `lib/providers/streak_provider.dart` | Dormant (Phase 2+) |
| Streak Model | `lib/models/streak.dart` | Dormant (Phase 2+) |
| Daily Ritual Provider | `lib/providers/daily_ritual_provider.dart` | Dormant (Phase 2+) |
| Daily Ritual Model | `lib/models/daily_ritual.dart` | Dormant (Phase 2+) |
| A/B Test Service | `lib/services/ab_test_service.dart` | Dormant (Phase 2+) |

## Activation rule

No imports or routes from MVP surfaces (Revenue, Schedule, Settings, Shell, Onboarding) unless:

1. The corresponding feature flag in `lib/core/feature_flags.dart` is set to `true`
2. An explicit directive has been issued to activate the module
3. The module has been reviewed for branding compliance (Socelle tokens, no gradients per Frontend Authority Addendum)
