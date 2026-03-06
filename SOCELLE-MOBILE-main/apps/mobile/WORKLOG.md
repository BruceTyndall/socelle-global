# Socelle Mobile — Build Worklog

## Phase 0 — Baseline Lock (2026-02-23)
- Confirmed repo root: apps/mobile
- Flutter 3.41.1 / Dart 3.11.0 (local Mac)
- 44 files modified (brand rename), 9 files created (new Socelle screens + feature flags)
- Created lib/services/socelle_api.dart (renamed from slotforce_api.dart)
- Created WORKLOG.md

## Phase 1 — Brand + Quarantine (2026-02-23)
- main.dart: SocelleApp + SocelleTheme.light (confirmed)
- app_shell.dart: 3-tab layout (Revenue/Schedule/Settings) (confirmed)
- lib/core/feature_flags.dart: all flags false (confirmed)
- docs/modules_dormant.md: 12 modules listed (confirmed)
- main_navigation_drawer.dart: updated to Revenue/Schedule/Settings, Socelle branding
- Grep proof: 0 matches in MVP surfaces
- Dormant modules quarantined: studio, shop, messages, share, dashboard, weekly_summary, celebration, streak, daily_ritual, ab_test

## Phase 2 — Onboarding Rebuild
- lib/features/onboarding/onboarding_flow.dart: new 3-screen flow (Hook, Input, Reveal)
- Replaced multi-step onboarding with minimal 3-page flow
- Hook screen: value proposition + connect calendar CTA
- Input screen: Google OAuth or manual 4-field entry
- Reveal screen: animated leakage number reveal

## Phase 3 — Core Revenue Loop
- lib/features/schedule/schedule_page.dart: rebuilt with gap list + actions
- Revenue page already complete (leakage hero, HVW card, AI card, Review Gaps CTA)
- Schedule shows gaps grouped by day with fill/intentional actions
- Recovered revenue updates on fill

## Phase 4 — AI Layer
- lib/services/ai_provider.dart: LLM provider interface with JSON schema
- Strict output schema: explanation, highestValueWindow, recoveryMessage
- Stub implementation for MVP (no API call until backend ready)

## Phase 5 — Trial + Paywall
- lib/features/paywall/paywall_page.dart: rebranded to Socelle tone
- 14-day trial via RevenueCat (server-side clock)
- $29/mo, $249/yr pricing
- Calm paywall copy per Frontend Authority Addendum

## Phase 6 — Supabase Migration
- lib/services/supabase_client.dart: Supabase init + auth
- lib/services/dual_write_bridge.dart: Firebase/Supabase dual-write
- RLS policies defined in docs/supabase_schema.sql

## Phase 7 — Ship Readiness (2026-02-23)
- Dormant module audit: found 4 imports (ab_test in main.dart + paywall_trigger, streak in gap_action x2)
- Added FeatureFlags.kEnableAbTest + kEnableStreaks, wrapped all dormant calls
- UI authority audit: found toUpperCase() in settings_page _SectionHeader — removed
- Null guard audit: revenue_page, schedule_page, main.dart — excellent. paywall_page, settings_page — already crash-safe with .valueOrNull ?? fallback patterns
- Empty state widgets confirmed: revenue_page (_RevenueEmptyState), schedule_page (_ScheduleEmptyState)
- Permission denial: calendar denial returns AppleCalendarPermissionDenied, onboarding shows manual entry fallback
- Final grep: 0 dormant module references reachable from MVP surfaces
- No gradients, no ALL CAPS, no bright blues, no charts in MVP
