# 00 — SLOTFORCE System Overview
> Forensic audit — verified in code — February 2026

---

## Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Flutter / Dart | SDK ≥3.3.0 |
| State management | flutter_riverpod | ^2.5.0 |
| Auth | Firebase Auth (anonymous + Google Sign-In) | ^5.3.3 |
| Database | Cloud Firestore | via firebase_core ^3.8.0 |
| Backend | Cloud Functions for Firebase (TypeScript) | Node 24 runtime |
| Payments | RevenueCat (purchases_flutter) | ^9.12.2 |
| Push notifications | Firebase Cloud Messaging | ^15.1.3 |
| Analytics | Firebase Analytics | ^11.3.3 |
| Remote config | Firebase Remote Config (A/B tests) | ^5.1.3 |
| Calendar — Google | Google OAuth + Cloud Function proxy | google_sign_in ^6.2.1 |
| Calendar — Apple | device_calendar plugin (on-device) | ^4.3.1 |
| Storage (local) | shared_preferences | ^2.2.0 |
| Email | SendGrid (via Cloud Functions) | — |
| Project | slotforce-f18eb (Firebase) | — |

---

## Monorepo Structure

```
SLOTFORCE/
├── apps/
│   └── mobile/                   Flutter app (iOS / Android / Web)
│       └── lib/
│           ├── main.dart          App bootstrap + auth + routing
│           ├── core/
│           │   ├── constants.dart
│           │   └── theme/         SlotforceColors, SlotforceTheme
│           ├── features/          One folder per screen domain
│           ├── models/            Dart data classes
│           ├── providers/         Riverpod providers
│           └── services/          API wrappers, calendar, notifications
├── packages/
│   ├── gap_engine/                Pure TypeScript gap-detection library
│   │   └── src/index.ts           computeGaps(), weeklyLeakage(), etc.
│   ├── functions/                 Cloud Functions (Firebase)
│   │   └── src/
│   │       ├── index.ts           Callable + triggered function exports
│   │       ├── sync/              Calendar sync orchestrator + adapters
│   │       ├── google/            OAuth token storage + Google API client
│   │       ├── notifications/     FCM decision engine, framing, scheduled
│   │       ├── email/             SendGrid client + email templates
│   │       └── reports/           Weekly report generator
│   └── shared/                    Zod schemas shared between Flutter + CF
│       └── src/index.ts
├── firestore.rules
├── firestore.indexes.json
├── firebase.json
└── vitest.config.ts               Test runner (110 tests, all green)
```

---

## Auth Flow

1. `Firebase.initializeApp()` → `signInAnonymously()` on first launch
2. Auth UID persists in Firebase Auth local storage across sessions
3. **Critical gap**: No account-linking mechanism. If a user deletes the app, they lose their UID and all data. No email/password or Google login for the main auth identity.
4. Google Sign-In is used **only** for calendar OAuth (scoped to `calendar.readonly`), not for Firebase identity.
5. RevenueCat is initialized with the anonymous Firebase UID → purchases tied to anon user.

---

## Screen Inventory

| Screen | File | Description |
|--------|------|-------------|
| App Bootstrap | `main.dart` | Firebase init, anonymous auth, RevenueCat init |
| Splash | `main.dart:_SplashScreen` | Loading state while bootstrap runs |
| Root Flow | `main.dart:_RootFlow` | Reads `onboardingCompleteProvider` → routes to Onboarding or AppShell |
| Onboarding | `features/onboarding/onboarding_page.dart` | 5-step wizard: Intro → Profile → Working Hours → Ticket Value → Calendar connect |
| App Shell | `features/shell/app_shell.dart` | 4-tab IndexedStack: Dashboard · Messages · Shop · Studio |
| Dashboard | `features/dashboard/dashboard_page.dart` | Leakage hero + gap list + daily ritual |
| Messages | `features/messages/messages_page.dart` | AI re-engagement + client inbox + threads |
| Shop | `features/shop/shop_page.dart` | Creator storefront + product grid |
| Studio | `features/studio/studio_page.dart` | Revenue studio + campaigns |
| Gap Action Sheet | `features/gap_action/gap_action_sheet.dart` | Bottom sheet: Fill slot / Mark intentional / Snooze |
| Fill Slot Flow | `features/gap_action/fill_slot_flow.dart` | Share-sheet → confirmation → outcome |
| Recovery Confirmation | `features/gaps/recovery_confirmation.dart` | "Did you fill it?" dialog |
| Mark Intentional Sheet | `features/gap_action/mark_intentional_sheet.dart` | Reason picker for intentional gaps |
| Weekly Summary | `features/weekly_summary/weekly_summary_page.dart` | 7-day review with recovered vs leaked |
| Paywall | `features/paywall/paywall_page.dart` | Subscription offers + trial CTA |
| Cancel Intercept | `features/settings/cancel_intercept_page.dart` | Retention flow before unsubscribe |
| Exit Survey | `features/settings/exit_survey_sheet.dart` | Cancellation reason capture |
| Settings | `features/settings/settings_page.dart` | Pricing · Calendar · Notifications · Subscription |
| Support | `features/support/support_page.dart` | Help + feedback |
| Revenue Snapshot | `features/share/revenue_snapshot.dart` | Shareable weekly revenue card |
| Celebration Overlay | `core/widgets/celebration_overlay.dart` | Milestone confetti animation |

---

## Top 20 Load-Bearing Files

| # | File | Why it matters |
|---|------|----------------|
| 1 | `packages/gap_engine/src/index.ts` | Core business logic: all gap detection, leakage calculation, intentional rule matching |
| 2 | `packages/functions/src/index.ts` | All callable Cloud Functions: sync, updateGapStatus, getWeeklySummary, trackAppOpen, etc. |
| 3 | `packages/functions/src/sync/persistence.ts` | Firestore gap CRUD: replaceGapsInRange, updateGapStatus transaction, intentional rules |
| 4 | `packages/functions/src/sync/orchestrator.ts` | Orchestrates gap engine + adapter → normalised result |
| 5 | `apps/mobile/lib/main.dart` | Bootstrap: Firebase init, anon auth, RevenueCat, app lifecycle |
| 6 | `apps/mobile/lib/providers/sync_provider.dart` | Riverpod sync state: SyncResultNotifier, recovered revenue |
| 7 | `apps/mobile/lib/services/slotforce_api.dart` | All callable CF wrappers: syncCalendarEvents, updateGapStatus, etc. |
| 8 | `apps/mobile/lib/features/dashboard/dashboard_page.dart` | Primary revenue dashboard: leakage hero, gap list, ritual |
| 9 | `apps/mobile/lib/providers/user_settings_provider.dart` | Settings loading, onboardingCompleteProvider — gates the entire app |
| 10 | `apps/mobile/lib/features/onboarding/onboarding_page.dart` | First-run onboarding: 5 steps, calendar connect gate |
| 11 | `packages/functions/src/notifications/decision_engine.ts` | Push notification decision logic: tier, frequency, cooldowns |
| 12 | `packages/functions/src/google/googleApi.ts` | Google Calendar API client: token exchange, event fetch |
| 13 | `packages/functions/src/google/tokenStore.ts` | Encrypted Google OAuth token storage in Firestore |
| 14 | `packages/shared/src/index.ts` | Zod schemas for all callable function I/O — the API contract |
| 15 | `apps/mobile/lib/features/gap_action/gap_action_sheet.dart` | Primary action surface: what happens when user taps a gap |
| 16 | `apps/mobile/lib/providers/paywall_trigger_provider.dart` | Paywall logic: 3 triggers ($200 leakage, 3 actions, repeat share) |
| 17 | `apps/mobile/lib/features/paywall/paywall_page.dart` | Subscription UI: RevenueCat offerings, trial, purchase |
| 18 | `apps/mobile/lib/services/apple_calendar_service.dart` | On-device Apple Calendar access via device_calendar plugin |
| 19 | `packages/functions/src/retentionMetrics.ts` | Inactivity tier computation → drives re-engagement email/push |
| 20 | `firestore.rules` | Security rules for all collections — data access enforcement |

---

## Data Model Map

### `users/{uid}`
```
{
  last_open_at: ISO string,
  inactivity_tier: 0-4,
  notifications_enabled: bool,
  subscription_status: "active" | "trialing" | "cancelled" | "free",
  calendar_source: "google" | "apple" | null,
  calendarConnected: bool,
  stats: {
    current_week_leakage: number,
    rolling_30d_leakage: number,         ← BUG: always equals weekly_leakage
    recovered_revenue_self_reported: number,
    last_sync_at: Timestamp
  }
}
```

### `gaps/{userId_startIso_endIso}`
```
{
  user_id: string,
  date: Timestamp,                        ← UTC start-of-day
  day_of_week: DayKey,
  start_time: Timestamp,                  ← UTC datetime
  end_time: Timestamp,
  duration_minutes: number,
  bookable_slots: number,
  leakage_value: number,
  status: "open" | "filled" | "intentional",
  source_calendar: string | null,
  intentional_reason: "lunch"|"buffer"|"personal"|"other"|null,
  filled_at: Timestamp | null,
  fill_confidence: "self_reported" | null,
  filled_method: "manual_mark" | null,
  created_at: Timestamp,
  week_key: "YYYY-Www"
}
```

### `intentional_rules/{docId}`
```
{
  user_id: string,
  day_of_week: DayKey,
  approx_start_minutes: number,          ← 0-1440, UTC-based
  approx_end_minutes: number,
  reason: "lunch"|"buffer"|"personal"|"other",
  active: bool,
  created_at: Timestamp,
  updated_at: Timestamp
}
```

### `weekly_reports/{docId}` — Server-written
```
{
  user_id: string,
  week_key: "YYYY-Www",
  total_leakage: number,
  recovered_revenue: number,
  gap_count: number,
  fill_rate: number                       ← 0.0-1.0
}
```

### `notification_state/{uid}` — Server-written
```
{
  last_notified_at: ISO string,
  consecutive_dismissed: number,
  daily_count: number,
  framing_index: number,
  notification_frequency: "standard"|"focused"|"weekly_digest",
  inactivity_tier: 0-4
}
```

### `fcm_tokens/{uid}`
```
{
  token: string,
  platform: "ios" | "android",
  updated_at: ISO string
}
```

### `weekly_summaries/{uid}` — Server-written
### `support_queue/{docId}` — Server-written (cancellations with reason=no_results)
### `email_idempotency/{keyId}` — Server-written

---

## Callable Cloud Functions

| Function | Auth | Purpose |
|----------|------|---------|
| `healthcheck` | public | Liveness check |
| `trackAppOpen` | required | Resets inactivity_tier, updates last_open_at |
| `storeCalendarTokens` | required | Stores encrypted Google refresh token |
| `syncCalendarEvents` | required | Core sync: fetch events → compute gaps → persist |
| `updateGapStatus` | required | Mark gap filled/intentional + update recovered revenue |
| `revokeCalendarTokens` | required | Remove stored Google tokens |
| `getCalendarConnectionStatus` | required | Check if Google token exists |
| `storeFcmToken` | required | Register/rotate push notification token |
| `updateNotificationFrequency` | required | Set user push cadence preference |
| `getWeeklySummary` | required | Aggregated weekly leakage + recovery stats |
| `computeRetentionMetrics` | scheduled | Compute inactivity tiers for all users |
| `submitCancellation` | required | Route cancellation reason → Firestore/email |

## Triggered / Scheduled Functions

| Function | Trigger | Purpose |
|----------|---------|---------|
| `onCancelledSubscription` | Firestore write on `users/{uid}` | Privacy cleanup on cancel: revoke tokens, anonymize gaps |
| `onInactivityTierUpdated` | Scheduled | Send re-engagement push/email on tier change |
| `resurrectionEngine` | Scheduled | Resurrection emails for churned users |
| `tier4RenewalAwarenessJob` | Scheduled | Email nudge for users near renewal |
| `tier4AccountHealthJob` | Scheduled | Account health emails |
| `weeklyMondayPush` | Scheduled (Mon 9am) | Weekly leakage summary push notification |

---

## Calendar Integrations

### Google Calendar
- User taps "Connect Google" → `google_sign_in` requests `calendar.readonly` scope
- `serverAuthCode` from mobile OAuth is sent to `storeCalendarTokens` CF
- CF exchanges code for refresh token via Google OAuth2 token endpoint
- Refresh token is AES-256 encrypted and stored in Firestore (field: `encrypted_refresh_token`)
- Subsequent syncs: CF loads encrypted token, decrypts, calls Google Calendar API
- Token rotation handled by Google on each use
- Expiry: `GoogleInvalidGrantError` thrown → surfaces as `failed-precondition` to client

### Apple Calendar (iOS only)
- `device_calendar` plugin reads device calendar directly
- User must grant calendar permission (standard iOS permission dialog)
- Events are fetched on-device, serialised to ISO strings, sent to `syncCalendarEvents` CF
- No server-side token storage for Apple

---

## Payments (RevenueCat)

- `purchases_flutter` SDK initialized with iOS API key in `SlotforceConstants.revenueCatApiKeyIos`
- User identified with Firebase anonymous UID via `Purchases.logIn(uid)`
- Offerings fetched in `paywall_page.dart`
- Subscription status read from `subscriptionProvider` (RevenueCat CustomerInfo)
- Paywall triggers: 3 conditions tracked via `paywallTriggerProvider`:
  1. $200+ cumulative leakage seen
  2. 3+ gap actions taken
  3. 3+ share-sheet uses

---

## Known Gaps / Missing Pieces

1. **No real account system** — anonymous auth only; users cannot transfer data between devices
2. **No Google Calendar on web** — `google_sign_in` only configured for iOS/Android
3. **rolling_30d_leakage is broken** — always equals current week leakage (persistence.ts:361)
4. **Timezone bug in gap detection** — working hours treated as UTC; wrong for non-UTC users
5. **No offline fallback** — sync failure shows error with no cached data display
6. **Messages/Shop are UI-only mocks** — no backend for messaging or creator storefront
7. **RevenueCat Android key missing** — only iOS key present in constants.dart
8. **No Sentry/crash reporting** — errors are only logged to Firebase/console
9. **App source not differentiated** — `_onAppForegrounded` always logs `source: 'organic'`
10. **No web push** — FCM token storage only handles `ios`/`android`; web unsupported
