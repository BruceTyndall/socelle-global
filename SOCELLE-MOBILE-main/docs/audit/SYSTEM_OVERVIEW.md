# SYSTEM OVERVIEW — SLOTFORCE Forensic Audit
Generated: 2026-02-22

---

## 1. Tech Stack

| Layer | Technology | Version / Notes |
|---|---|---|
| Mobile Frontend | Flutter / Dart | SDK >=3.3.0, Material 3 |
| State Management | flutter_riverpod | ^2.5.0 |
| Auth | Firebase Auth (Anonymous) | Auto-signs in anonymously on launch |
| IAP / Subscriptions | RevenueCat (purchases_flutter) | ^9.12.2; iOS only configured |
| Calendar (Google) | google_sign_in + server auth code flow | ^6.2.1 |
| Calendar (Apple) | device_calendar (EventKit) | ^4.3.1 |
| Push Notifications | firebase_messaging (FCM) | ^15.1.3 |
| Analytics | firebase_analytics | ^11.3.3 |
| A/B Testing | firebase_remote_config | ^5.1.3 |
| Backend | Firebase Cloud Functions v2 (Node 20) | TypeScript |
| Database | Cloud Firestore | |
| Email | Postmark | via REST API (fetch) |
| Schema Validation | Zod | shared/src/index.ts |
| Gap Detection Engine | packages/gap_engine | Local TypeScript package |
| Shared Schemas | packages/shared | Zod schemas + TypeScript types |
| Hosting | Firebase Hosting (inferred from firebase.json) | |
| Secrets | Firebase Secret Manager | GOOGLE_TOKEN_ENCRYPTION_KEY_B64, GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, POSTMARK_API_KEY |
| Test Framework | Vitest | vitest.config.ts at root |
| Linting | ESLint (eslint.config.js at root), flutter_lints | |

---

## 2. Auth Method & User Model

### Auth Method
- **Anonymous Firebase Auth** exclusively. On first launch, `FirebaseAuth.instance.signInAnonymously()` runs if no current user exists (`main.dart:55-57`).
- No email/password, social, or phone auth. User identity is an anonymous Firebase UID.
- RevenueCat is identified with the Firebase UID (`main.dart:79-82`), so IAP receipts are tied to the anonymous UID.

### User Model
Stored in Firestore at `users/{uid}`. Schema defined in `packages/shared/src/index.ts` (UserDocumentSchema):

```
users/{uid}:
  email?              string
  display_name?       string
  subscription_status "trial" | "active" | "expired" | "cancelled"
  subscription_plan?  "monthly" | "annual"
  trial_end_date?     datetime
  subscription_renewal_date? datetime
  onboarding_complete boolean
  settings:           UserSettingsSchema (avgBookingValue, slotDurationMinutes, timezone, calendarSource, workingHours)
  stats?:             UserStatsSchema (recovered/leakage metrics)
  last_open_at?       datetime
  inactivity_tier?    0-5
  last_intervention_at? datetime
  last_recovery_amount? number
  resurrection_day30_sent? boolean
  resurrection_seasonal_sent_season? string
  cancellation_reason? string
  notification_frequency? "standard" | "focused" | "weekly_digest"
```

**NOTE**: Settings are stored BOTH locally (SharedPreferences via `SettingsStorage`) and in Firestore. There is a **schema divergence**: the Flutter `UserSettings` model does NOT include `timezone` (present in the Zod schema), and it includes `providerType` and `growthGoal` (NOT in the Zod schema). This is a critical gap — see Backend Findings.

### Role System
There is **no role-based access control**. All users are equal. There is no admin role, no front-desk role, no team management. All Firestore rules are owner-only (`isOwner(uid)` / `docOwner()`). All Cloud Functions check `request.auth?.uid`.

---

## 3. Data Layer — Firestore Collections

| Collection | Description | Key Fields | Owner Access |
|---|---|---|---|
| `users/{uid}` | User profile + settings + stats | subscription_status, inactivity_tier, settings, stats | Owner only |
| `users/{uid}/metricsLatest/current` | Server-computed derived metrics | daysSinceLastOpen, fillProbabilityScore, inactivityTier, computedAt | Owner read, CF write |
| `users/{uid}/events/{eventId}` | Analytics/audit events | event, createdAt | Owner append-only |
| `users/{uid}/email_idempotency/{keyId}` | Dedup guard for emails | sentAt, templateId | CF write only |
| `gaps/{docId}` | Gap records (docId = userId_startISO_endISO) | user_id, start_time, end_time, status, leakage_value, day_of_week, week_key | Owner |
| `intentional_rules/{docId}` | Recurring intentional gap patterns | user_id, day_of_week, approx_start_minutes, approx_end_minutes, reason, active | Owner |
| `weekly_reports/{docId}` | Weekly aggregated reports | user_id, week_key, total_leakage, recovered_revenue | Owner read, CF write |
| `notification_state/{uid}` | Push notification quotas/state | consecutive_dismissed, daily_count, last_sent_at, last_weekly_push_week | Owner read, CF write |
| `fcm_tokens/{uid}` | Device push token | token, platform, updated_at | Owner read/write |
| `weekly_summaries/{uid}` | Weekly summary cache | Server write only | Owner read |
| `support_queue/{docId}` | Cancellation/support cases | userId, type, reason, status | CF write only |

---

## 4. Hosting / Env Config / Secrets Management

- `firebase.json` — Firebase project configuration
- **Secrets**: Managed via Firebase Secret Manager. Referenced in Cloud Functions via `callableOptions.secrets` array.
  - `GOOGLE_TOKEN_ENCRYPTION_KEY_B64` — AES key for encrypting stored Google refresh tokens
  - `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET` — Google OAuth credentials
  - `POSTMARK_API_KEY` — Email sending
- **Client-side placeholder keys** (CRITICAL SECURITY GAP):
  - `SlotforceConstants.revenueCatApiKeyIos = 'appl_REPLACE_WITH_REVENUECAT_IOS_KEY'` (constants.dart:64)
  - `SlotforceConstants.googleServerClientId = 'REPLACE_WITH_WEB_CLIENT_ID.apps.googleusercontent.com'` (constants.dart:72)
  - These placeholder values are committed to source. RevenueCat will fail silently; Google OAuth will fail to connect.
- No `.env` files found. No `firebase.json` hosting or emulator configuration beyond the file itself.

---

## 5. Frontend Screens / Routes

The app uses a flat navigation model — `AppShell` with an `IndexedStack` (4 tabs) + `MaterialPageRoute` for modal flows. No named routes or go_router.

### Main Navigation (AppShell — IndexedStack)
| Index | Page | File |
|---|---|---|
| 0 | DashboardPage | `lib/features/dashboard/dashboard_page.dart` |
| 1 | MessagesPage | `lib/features/messages/messages_page.dart` |
| 2 | ShopPage | `lib/features/shop/shop_page.dart` |
| 3 | StudioPage | `lib/features/studio/studio_page.dart` |

### Modal / Push Routes
| Route | File | Trigger |
|---|---|---|
| OnboardingPage | `lib/features/onboarding/onboarding_page.dart` | Before AppShell if !onboardingComplete |
| LeakageReveal | `lib/features/onboarding/widgets/leakage_reveal.dart` | After onboarding completion |
| GapActionSheet (bottom sheet) | `lib/features/gap_action/gap_action_sheet.dart` | Tap gap card |
| FillSlotFlow | `lib/features/gap_action/fill_slot_flow.dart` | From GapActionSheet |
| MarkIntentionalSheet | `lib/features/gap_action/mark_intentional_sheet.dart` | From GapActionSheet |
| RecoveryConfirmation | `lib/features/gaps/recovery_confirmation.dart` | After fill slot |
| PaywallPage | `lib/features/paywall/paywall_page.dart` | paywallTriggerProvider fires |
| SettingsPage | `lib/features/settings/settings_page.dart` | Drawer or nav |
| CancelInterceptPage | `lib/features/settings/cancel_intercept_page.dart` | Settings → Cancel |
| ExitSurveySheet | `lib/features/settings/exit_survey_sheet.dart` | CancelInterceptPage → "Cancel Anyway" |
| SupportPage | `lib/features/support/support_page.dart` | Settings |
| WeeklySummaryPage | `lib/features/weekly_summary/weekly_summary_page.dart` | Trigger from dashboard |
| RevenueSnapshot (share) | `lib/features/share/revenue_snapshot.dart` | Dashboard share button |
| CelebrationOverlay | `lib/core/widgets/celebration_overlay.dart` | Post-recovery milestone |
| MainNavigationDrawer | `lib/core/widgets/main_navigation_drawer.dart` | AppBar hamburger |

### Onboarding Steps (PageView, 6 pages)
1. IntroSceneStep
2. ProviderProfileStep (providerType + growthGoal)
3. BookingValueStep (avgBookingValue)
4. SlotDurationStep (slotDurationMinutes)
5. WorkingHoursStep (Mon–Sun schedule)
6. LossInductionStep (leakage estimate + calendar source selection)

---

## 6. Backend Services / Cloud Functions

All functions are in `packages/functions/src/`. Exported from `index.ts`.

### Callable Functions (onCall)
| Function Name | File | Auth Required |
|---|---|---|
| `healthcheck` | index.ts:52 | No |
| `trackAppOpen` | index.ts:63 | Yes |
| `storeCalendarTokens` | index.ts:177 | Yes |
| `syncCalendarEvents` | index.ts:181 | Yes |
| `updateGapStatus` | index.ts:185 | Yes |
| `revokeCalendarTokens` | index.ts:189 | Yes |
| `getCalendarConnectionStatus` | index.ts:193 | Yes |
| `storeFcmToken` | index.ts:667 | Yes |
| `updateNotificationFrequency` | index.ts:714 | Yes |
| `getWeeklySummary` | index.ts:764 | Yes |
| `submitCancellation` | cancelRouting.ts:35 | Yes (throws plain Error not HttpsError) |

### Scheduled Functions
| Function Name | Schedule | File |
|---|---|---|
| `computeRetentionMetrics` | every 6 hours | retentionMetrics.ts:232 |
| `tier4RenewalAwarenessJob` | daily 09:00 UTC | scheduledEmails.ts:68 |
| `tier4AccountHealthJob` | Monday 09:00 UTC | scheduledEmails.ts:155 |
| `weeklyMondayPush` | Mon 07:30, 08:00, 08:30 UTC | weeklyNotifications.ts:229 |
| `resurrectionEngine` | daily 10:00 UTC | resurrectionEmails.ts:190 |

### Firestore-Triggered Functions
| Function Name | Trigger | File |
|---|---|---|
| `onInactivityTierUpdated` | `users/{userId}` write | reengagementNotifications.ts:71 |
| `onCancelledSubscription` | `users/{userId}` write | index.ts:587 |

### Key Internal Modules
| Module | Purpose | File |
|---|---|---|
| `runCalendarSync` | Orchestrates event fetch + gap computation + persistence | sync/orchestrator.ts |
| `FirestoreSyncPersistence` | Firestore CRUD for gaps + intentional rules | sync/persistence.ts |
| `checkNotificationEligibility` | 10-rule gate before any notification send | notificationEligibility.ts |
| `sendPushNotification` | FCM send + notification_state update | notifications/fcm_sender.ts |
| `sendEmail` / `sendRenderedEmail` | Postmark send + idempotency + event logging | email.ts |
| `computeMetricsForUser` | 9 derived metrics per user | retentionMetrics.ts |
| `GoogleCalendarApi` | Google OAuth token exchange + calendar event fetch | google/googleApi.ts |
| `FirestoreTokenStore` | Encrypted Google refresh token storage | google/tokenStore.ts |
| `encryptRefreshToken` | AES-256-GCM encryption of OAuth tokens | google/tokenCrypto.ts |

---

## 7. Key Async Flows

### Auth Boot
`main.dart → _AppBootstrapState._init()`:
1. `Firebase.initializeApp()`
2. `FirebaseAuth.instance.signInAnonymously()` (if no currentUser)
3. Parallel: `AbTestService.initialize()`, `NotificationService.initialize()`, `_initRevenueCat()`
4. `FutureBuilder` renders `_SplashScreen` until done
5. `_RootFlowState` watches `onboardingCompleteProvider` (SharedPreferences)
6. Routes to `OnboardingPage` or `AppShell`

### Calendar Sync
`DashboardPage._autoSyncIfNeeded()`:
1. Check last sync timestamp (SharedPreferences)
2. If stale (>60 min) or null → `syncResultProvider.notifier.refresh()`
3. `SyncResultNotifier.refresh()` → reads settings, computes date range (Mon–Sun+next week)
4. Apple Calendar: `AppleCalendarService.fetchEvents()` (EventKit, device-local)
5. `SlotforceApi.syncCalendarEvents()` → `syncCalendarEvents` CF callable
6. CF: `handleSyncCalendarEventsCallable()` → loads intentional rules from Firestore → fetches Google Calendar events → `computeGaps()` (gap_engine) → `persistence.replaceGapsInRange()` → returns merged gaps with status
7. Local: `storage.setLastSyncAt()`

### Gap Detection
`gap_engine/src/index.ts computeGaps()`:
1. Iterates working hours day by day across analysis range
2. Merges calendar events (sorted by start time)
3. Identifies free blocks between events that meet slotDurationMinutes threshold
4. Applies intentional rules (±30-min tolerance match)
5. Returns `GapCandidate[]` with leakageValue = durationMinutes/slotDurationMinutes * avgBookingValue

### Paywall Trigger
`paywallTriggerProvider._evaluate()`:
1. Only for free/trial users
2. Checks 5 triggers in priority order (SharedPreferences-backed):
   - Cumulative leakage >= $200 (A/B gated)
   - First recovery + 24h delay
   - 3+ share-sheet uses
   - Missed high-prob gap
   - Trial ending + 2+ recoveries
3. Returns first active trigger

### Notification Flow
`weeklyMondayPush` (scheduled):
1. Load all active/trial users
2. Compute target UTC offset range for 07:45–08:15 local delivery
3. Per user: parse timezone → check offset → `sendWeeklyPush()`
4. `sendWeeklyPush()` → idempotency check (last_weekly_push_week) → `checkNotificationEligibility()` (10 rules) → `getWeeklyGapSummary()` → build copy variant → `sendPushNotification()` → FCM → update notification_state

### Re-engagement Tier Escalation
`computeRetentionMetrics` (every 6h) → computes `inactivity_tier` per user → writes to `users/{uid}`:
- If tier transitions to 1 → `onInactivityTierUpdated` Firestore trigger fires → sends tier-1 push
- Tier 4 email jobs run independently on their own schedules

### Cancellation Flow
`SettingsPage → CancelInterceptPage → ExitSurveySheet → submitCancellation CF`:
1. `CancelInterceptPage` shows account summary (recovered revenue, open gaps)
2. User taps "Cancel Anyway" → `ExitSurveySheet` shown
3. Survey result → `submitCancellation` CF called
4. CF writes `cancellationReason`, `cancelled_at` to user doc; routes to support queue
5. `onCancelledSubscription` Firestore trigger fires on status→"cancelled": revokes tokens, anonymizes gaps

---

## 8. Top 10 Load-Bearing Files by Impact

| Rank | File | Why It Matters |
|---|---|---|
| 1 | `packages/functions/src/index.ts` | All callable CF registrations; sync, gap-status, auth-code exchange, weekly summary |
| 2 | `packages/functions/src/sync/persistence.ts` | Core gap read/write logic; replaceGapsInRange, updateGapStatus (transaction), intentional rules |
| 3 | `packages/gap_engine/src/index.ts` | Revenue calculation engine — gap detection algorithm and leakage formula |
| 4 | `apps/mobile/lib/main.dart` | App bootstrap, anonymous auth, RevenueCat init — any failure prevents all use |
| 5 | `apps/mobile/lib/features/shell/app_shell.dart` | Root navigation shell, IndexedStack renders all 4 tabs |
| 6 | `packages/functions/src/notificationEligibility.ts` | 10-rule gate applied before every notification; governs all re-engagement |
| 7 | `apps/mobile/lib/providers/sync_provider.dart` | SyncResultNotifier — all gap data flows through here |
| 8 | `apps/mobile/lib/providers/paywall_trigger_provider.dart` | Revenue trigger logic — controls all monetization decision points |
| 9 | `packages/shared/src/index.ts` | Zod schemas — single source of truth for API contract between Flutter and functions |
| 10 | `packages/functions/src/retentionMetrics.ts` | Every-6h metric computation; inactivity_tier feeds all notification suppression decisions |
