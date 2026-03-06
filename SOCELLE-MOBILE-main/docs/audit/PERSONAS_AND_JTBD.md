# PERSONAS AND JOBS-TO-BE-DONE — SLOTFORCE Forensic Audit
Generated: 2026-02-22

---

## How Personas Were Identified

All personas were inferred directly from code evidence:
- `providerType` options in `ProviderProfileStep` (onboarding): `hair_stylist`, `barber`, `nail_tech`, `esthetician`, `massage_therapist`, `tattoo_artist`, `brow_lash`
- `growthGoal` options: `fill_gaps`, `grow_revenue`, `reclaim_time`, `scale_team`
- Subscription tiers: `free`, `trial`, `monthly`, `annual`
- Inactivity tiers 0–5 in `retentionMetrics.ts`
- Cancellation reasons in `exit_survey_sheet.dart`: `not_using_consistently`, `didnt_see_results`, `too_expensive`, `switched_tool`, `something_else`
- No multi-user / team / admin roles exist in the codebase

---

## Persona 1: Solo Beauty Pro — Active (Primary User)

**Who**: A self-employed hair stylist, barber, nail tech, esthetician, massage therapist, tattoo artist, or brow/lash tech. Works solo. Books clients directly (DMs, texts, scheduling app). Has a booking calendar (Google or Apple).

**Example**: A hair stylist with a chair at a salon suite, $85–$150 avg booking, 5-day working week. Uses Instagram to fill gaps.

**Growth Goal Variants** (from code):
- `fill_gaps` — fill empty slots immediately
- `grow_revenue` — increase overall income
- `reclaim_time` — protect personal/buffer time intentionally
- `scale_team` — planning to add staff (NOTE: no team features exist yet — gap)

### Primary JTBD
1. **Core**: "When I see empty slots on my calendar, I want to know exactly how much revenue I'm losing so I can act before it's too late."
2. **Secondary**: "When I fill a gap, I want confirmation and a running total of what I've recovered so I feel like SLOTFORCE is paying for itself."
3. **Tertiary**: "When I'm not filling gaps consistently, I want a nudge that reminds me of the money at stake — not a generic 'we miss you.'"

### Critical Success Metrics (from code)
- `cumulativeRecoveredUsd` (retentionMetrics.ts:46)
- `weeklyRecoveryRate` (retentionMetrics.ts:71)
- `fillProbabilityScore` (retentionMetrics.ts:83)
- `syncStalenessDays` — if >3, user is drifting
- Streak continuity (`streak_provider.dart`)

### Primary UI Surfaces
- **Dashboard**: leakage hero, gap cards, filter (open/filled/intentional), bump board, campaign draft, daily ritual
- **GapActionSheet**: mark filled / mark intentional / copy message / bump
- **RecoveryConfirmation**: post-fill celebration + streak update
- **StudioPage**: analytics view, gap list sorted by leakage value
- **WeeklySummaryPage**: Monday morning check-in

### Permissions / Data Boundaries
- Owns all gaps where `user_id == auth.uid`
- Owns FCM token, notification_state (read only), user doc
- No access to other users' data
- Settings stored locally (SharedPreferences) AND in Firestore (partial sync — schema divergence noted)

### Identified in Code
- `_campaignDraft()` in `dashboard_page.dart:178` generates copy for `hair_stylist`, `barber`, `nail_tech`, `esthetician`, `massage_therapist`, `tattoo_artist`, `brow_lash`
- `getCohortAverageGaps()` in `resurrectionEmails.ts:32` references `hair_stylist`, `barber`, `massage`, `esthetician`, `nail_tech`, `personal_trainer`
- NOTE: `brow_lash`, `tattoo_artist` appear in Flutter but NOT in the CF resurrection cohort averages → resurrection emails for these types fall back to default cohort

---

## Persona 2: New User in Onboarding

**Who**: First-time install. Has never synced a calendar. May or may not have a Google calendar. May be skeptical about value.

**Entry State**: `onboardingCompleteProvider` returns `false`. Routed to `OnboardingPage` by `_RootFlowState`.

### Primary JTBD
1. "When I first open this app, I want to understand what it does and whether it's worth connecting my calendar — without feeling tricked into giving permissions."
2. "When I get to the end of onboarding, I want to see a concrete dollar estimate of what I'm losing so I'm motivated to connect my calendar."

### Critical Success Metrics
- Reaches step 6 (LossInductionStep) without dropping
- Connects calendar (sets `calendarSource` to 'google' or 'apple')
- Does NOT skip calendar connection
- Triggers first sync within 24h of onboarding completion

### Primary UI Surfaces
- `OnboardingPage` (6-step PageView)
  1. IntroSceneStep
  2. ProviderProfileStep (providerType + growthGoal)
  3. BookingValueStep
  4. SlotDurationStep
  5. WorkingHoursStep
  6. LossInductionStep (leakage reveal + calendar selector)
- `LeakageReveal` (post-onboarding modal)
- `DashboardPage` (first view after LeakageReveal → AppShell)

### Onboarding Completion Logic
`onboarding_page.dart:77 _completeOnboarding()`:
- Saves `UserSettings` to SharedPreferences
- Sets `onboardingComplete = true`
- Invalidates `userSettingsProvider` and `onboardingCompleteProvider`
- Navigates to `LeakageReveal` with estimated leakage (hardcoded formula: `enabledDays * 1.5 * avgBookingValue`)
- From LeakageReveal → `AppShell`

### Identified Gaps
- No calendar connection happens during onboarding — user must go to Settings after. The "Connect your calendar" button on step 6 is misleadingly labeled; it actually just saves `calendarSource` and completes onboarding. Actual OAuth happens in Settings or on first sync.
- `calendarSource` can be set to empty string (`''`) via "Skip" button — this is not a valid enum value per Zod schema (`calendarSource: z.enum(["google", "apple"])`). This will cause sync to fail silently.

---

## Persona 3: Trial User (Active, Engaged)

**Who**: Active user on 7-day free trial. Has completed onboarding, connected calendar, seen at least one gap.

**Entry State**: `subscription.isTrial == true`, `subscription.trialDaysRemaining > 0`

### Primary JTBD
1. "When my trial is running out, I want to see the ROI I've already gotten (recovered revenue) so the upgrade feels like a no-brainer, not a gamble."
2. "When I've recovered money during my trial, I want the paywall to show me exactly how much I've recovered vs the subscription cost."

### Critical Success Metrics
- `recoveredRevenueProvider` > 0 before trial ends
- `recoveredGapCount >= 2` (paywall trigger 5 condition)
- Trial-to-paid conversion rate

### Primary UI Surfaces
- All the same as Solo Pro (active)
- `TrialBadge` in dashboard AppBar (shows days remaining)
- `PaywallPage` (triggered by `paywallTriggerProvider`)
- `paywall/widgets/trial_badge.dart`

### Paywall Triggers That Fire During Trial
From `paywall_trigger_provider.dart`:
- T1: cumulativeLeakage >= $200 (A/B gated by `AbTestService.paywallTriggerTiming()`)
- T2: firstRecovery + 24h delay
- T3: 3+ share-sheet uses
- T4: missed high-prob gap
- T5: trialDaysRemaining <= 2 AND recoveredGapCount >= 2

---

## Persona 4: Churning / At-Risk User

**Who**: Active subscriber who has stopped opening the app. Inactivity tier 1–4 (3–29 days since last open). Paying but not engaging.

**Entry State**: `inactivity_tier >= 1`, `subscription_status == "active"`

### Primary JTBD
1. "When I haven't used the app in a while, I want a reminder that's about my actual money — not a generic 'come back' message."
2. "When I'm thinking about cancelling, I want to see what I've actually recovered so I weigh it fairly."

### Notification Touchpoints (from code)
- **Tier 1 (3–7 days)**: `onInactivityTierUpdated` trigger → push (4 copy variants, round-robin)
- **Tier 2 (8–14 days)**: `sendTier2Email()` in `reengagementEmails.ts` → email (prior_recovery / leakage_only / stale_sync variants)
- **Tier 3 (15–29 days)**: `sendTier3Email()` → account summary email
- **Tier 4 (30+ days, active sub)**: `tier4AccountHealthJob` → weekly email; `tier4RenewalAwarenessJob` at 7 days before renewal

### Cancel Intercept
`CancelInterceptPage` shows:
- Recovered revenue to date
- Current-week leakage (open gaps)
- Optionally routes to `PaywallPage` for "annual" offer before confirming cancel

### Identified Gaps
- No in-app re-engagement flow — all re-engagement is push/email only. If the user opens the app (tier drops to 0), there's no "welcome back" moment in the UI.
- `trackAppOpen` CF call resets `inactivity_tier` to 0 immediately (`index.ts:79`), but the 6-hour `computeRetentionMetrics` job uses `daysSinceLastOpen` as the canonical calculation. This creates a window of inconsistency.

---

## Persona 5: Cancelled / Churned User

**Who**: User who has cancelled their subscription. `subscription_status == "cancelled"`.

**Entry State**: `cancelled_at` is set, `subscription_status = "cancelled"`

### Primary JTBD
1. "After I cancelled, if I see that I was leaving money on the table, I might come back — but don't spam me."
2. "I want my data deleted if I'm no longer a paying user (privacy expectation)."

### Retention Touchpoints (from code)
- **Day 30 post-cancel**: `resurrectionEngine` runs daily → `sendDay30Resurrection()` — uses cohort averages only, no personal calendar data
- **Seasonal**: `sendSeasonalReEntry()` — fired during `new_year`, `spring`, `back_to_school`, `holiday` windows, 30–90 days post-cancel
- **T-01 suppression**: All notifications suppressed >90 days after cancellation

### Data Deletion
`onCancelledSubscription` Firestore trigger (`index.ts:587`):
1. Revokes Google OAuth token
2. Clears `calendarConnected`, `calendarSource`, `stats.last_sync_at` from user doc
3. Anonymizes gaps: removes `calendarEventId` (but retains leakage_value, status, weekday for aggregates)
4. Logs `calendar_data_deleted` event

### Identified Gaps
- Calendar data anonymization happens in `onCancelledSubscription` but requires `subscription_status` to be written as "cancelled" in Firestore — this only happens if `cancelSubscription()` in the Flutter app writes to Firestore (it does not — it only updates local SharedPreferences). The server-side cleanup trigger will never fire unless RevenueCat/billing system updates the Firestore user document directly.
- No `email_opt_out` is set during cancellation flow.

---

## Persona 6: Admin (Implicit — No Role in Code)

**Finding**: There is **no admin user type** in the codebase. No admin Cloud Function, no admin role in Firestore rules, no admin UI. The `support_queue` collection is CF-write-only with no read surface. The `weekly_reports` collection is server-write-only with owner read.

**Implication**: Support cases from cancellation (the `support_queue` docs written by `submitCancellation` CF) have no read path. They are written but never surfaced to any admin tool. This is a gap that should be flagged.

---

## Persona 7: Pro with Team / Front Desk (Gap — Not Implemented)

**Finding**: The `growthGoal` option `scale_team` exists in onboarding (`ProviderProfileStep`), but there is no team management, staff accounts, multi-user permissions, or front-desk role anywhere in the codebase.

**Implication**: Users who select `scale_team` as their growth goal will complete onboarding and receive a dashboard experience identical to the solo pro. The growth goal is passed to the CF in sync requests but is not used in any logic on the backend. It is an unfulfilled promise in the UX.

**Recommendation**: Either remove `scale_team` from the growth goal options until team features are built, or show a "Coming Soon" state when it is selected.
