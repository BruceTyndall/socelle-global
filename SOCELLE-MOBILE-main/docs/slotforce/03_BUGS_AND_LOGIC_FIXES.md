# 03 — Bugs & Logic Fixes
> Forensic audit of verified issues — February 2026

## ✅ Fixed in PR0 (this session)

| Bug | Fix summary | File |
|-----|-------------|------|
| BUG-001 | `rolling_30d_leakage` no longer overwritten by weekly value; optional `rolling30dLeakage` param added | `packages/functions/src/sync/persistence.ts` |
| BUG-003 | Removed incorrect `nextWeekGapCount: openGaps` from `getWeeklySummary` response | `packages/functions/src/index.ts` |
| BUG-005 | `_onAppForegrounded` now passes `'cold_start'`/`'resume'` instead of always `'organic'` | `apps/mobile/lib/main.dart` |
| BUG-016 | Removed dead `isInQuietHours()`, `getQuota()`, and `dailyCount` from `decision_engine.ts`; all three are fully covered by the eligibility layer (T-05, T-06, T-08) | `packages/functions/src/notifications/decision_engine.ts` |

---

---

## P0 Bugs (App-breaking / Data corruption)

---

### BUG-001 · `rolling_30d_leakage` always equals `weeklyLeakage`

**File**: `packages/functions/src/sync/persistence.ts:360-363`

```typescript
const stats = {
  current_week_leakage: params.weeklyLeakage,
  rolling_30d_leakage: params.weeklyLeakage,   // ← WRONG: should be 30-day aggregate
  ...
}
```

**Impact**: `users/{uid}.stats.rolling_30d_leakage` always shows the same number as the current week. Any screen or email that shows "last 30 days" is lying to the user.

**Repro**: Run a sync, check `users/{uid}` in Firestore console. `rolling_30d_leakage === current_week_leakage`.

**Fix**: In `updateUserSyncStats`, accept an optional `rolling30dLeakage` parameter (separately computed from Firestore query) or compute it during sync by querying the past 30 days of gaps. Simplest safe fix: query `gaps` where `start_time >= 30 days ago && status == "open"` and sum `leakage_value`.

**Regression test**: Add test asserting `rolling_30d_leakage` ≠ `current_week_leakage` when there are prior-week gaps.

---

### BUG-002 · Timezone bug in gap detection — working hours treated as UTC

**File**: `packages/gap_engine/src/index.ts:175-176` + `packages/functions/src/sync/orchestrator.ts`

```typescript
// gap_engine: "09:00" is treated as UTC 09:00
const workingStart = minutesToDate(day, hhmmToMinutes(config.start));
// minutesToDate: dayStart.getTime() + minutes * 60_000
// dayStart = UTC midnight
```

**Impact**: A user in EST (UTC-5) who says their working hours are 9am–5pm will have gaps detected from UTC 9am–5pm, which is 4am–12pm their local time. **Gaps are detected at completely wrong times.** Revenue leakage numbers are incorrect. This affects every non-UTC user.

**Repro**: Set up a user in EST, set working hours 9:00-17:00, sync with events at local 10am. The event should block a gap; instead it doesn't match because the gap engine sees UTC 10am (3pm EST) not UTC 14:00.

**Fix**:
1. Store the user's IANA timezone string in `UserSettings` (capture during onboarding via device locale).
2. Pass timezone to `syncCalendarEvents` callable and to `computeGaps`.
3. In `gap_engine`, use the timezone to convert working hours to UTC offsets before comparison, OR convert event times to local time for comparison.
4. Alternatively: convert working hours strings to UTC offsets server-side based on user timezone before passing to gap engine.

**Regression test**: `gapEngine.test.ts` — add test for EST user with 09:00-17:00 hours; verify gaps align with local time not UTC.

---

### BUG-003 · `getWeeklySummary` uses wrong fields for some Firestore gap queries

**File**: `packages/functions/src/index.ts:793-824`

The `getWeeklySummary` function queries gaps using `start_time` (correct, it's a Firestore Timestamp field in the gap schema) but may miss gaps if `start_time` wasn't indexed with the exact composite index required. However the bigger issue:

```typescript
// Line 805: reads `d.leakage_value` — CORRECT (snake_case matches persistence.ts)
// Line 806: reads `d.status` — CORRECT
```

The immediate bug: `nextWeekGapCount` is incorrectly set to `openGaps` (current week count):
```typescript
nextWeekGapCount: openGaps,  // ← wrong: this is current week, not next week
```

**Impact**: Weekly summary shows wrong "next week forecast" — it shows this week's open gaps instead of next week's.

**Fix**: Either query next-week gaps from Firestore (they exist if a sync was run for the 2-week window), or remove the `nextWeekGapCount` field and replace with a note that next-week data requires a forward sync.

---

## P1 Bugs (Significant UX/data errors)

---

### BUG-004 · Anonymous auth — no account portability

**File**: `apps/mobile/lib/main.dart:55-57`

```dart
if (FirebaseAuth.instance.currentUser == null) {
  await FirebaseAuth.instance.signInAnonymously();
}
```

**Impact**: User installs app, uses it for weeks, builds up gap history and recovered revenue. They delete and reinstall the app. **All data is gone.** Firebase creates a new anonymous UID. This is a retention-destroying bug for power users.

**Fix options**:
1. Add Google Sign-In for account creation during onboarding (linking anonymous → permanent account).
2. Add email/magic-link auth as primary identity.
3. Minimum viable: prompt user after onboarding to "Save your account" with email link.

**Regression test**: Manual test — reinstall app, verify new UID, verify old data is inaccessible. Then test the account-linking flow.

---

### BUG-005 · `_onAppForegrounded` never differentiates source

**File**: `apps/mobile/lib/main.dart:247-256`

```dart
void _onAppForegrounded({required bool isInitial}) {
  AnalyticsService.appOpened(source: isInitial ? 'organic' : 'organic');
  // Both branches pass 'organic' — isInitial is ignored
```

**Impact**: Analytics cannot distinguish cold starts from resumes. Attribution is wrong. The CF `trackAppOpen` also always gets `source: 'organic'`.

**Fix**: Change `isInitial ? 'organic' : 'organic'` to `isInitial ? 'cold_start' : 'resume'`.

---

### BUG-006 · No calendar-not-connected error state on dashboard

**File**: `apps/mobile/lib/features/dashboard/dashboard_page.dart` (inferred) + `apps/mobile/lib/providers/sync_provider.dart:48-55`

```dart
if (settings.calendarSource == 'apple') {
  // fetches apple events
}
// If calendarSource == null or 'google' with no token:
// syncCalendarEvents CF is called but returns error
// Error is propagated via AsyncError → dashboard shows raw error
```

**Impact**: A user who skips calendar connect during onboarding (or loses Google token) sees an ugly error stack trace on the dashboard instead of a "Connect your calendar to get started" empty state.

**Fix**: In `SyncResultNotifier.refresh()`, catch `failed-precondition` errors from the CF and surface them as a typed `SyncError.calendarNotConnected` state. Dashboard renders `SfEmptyState` with "Connect calendar" CTA.

---

### BUG-007 · `intentionalRules` tolerance matching uses UTC minutes — timezone-compounding bug

**File**: `packages/gap_engine/src/index.ts:106-126`

```typescript
const startMinutes = candidateStart.getUTCHours() * 60 + candidateStart.getUTCMinutes();
```

**Impact**: Compounds BUG-002. Even if a user has set an intentional rule for "lunch 12:00-13:00", the matching uses UTC hours. Same fix as BUG-002 (timezone-aware gap engine).

---

### BUG-008 · RevenueCat only configured for iOS

**File**: `apps/mobile/lib/core/constants.dart` (inferred from main.dart:75)

```dart
PurchasesConfiguration(SlotforceConstants.revenueCatApiKeyIos)
```

**Impact**: Android users cannot subscribe. The app doesn't crash (RevenueCat SDK degrades gracefully) but purchases fail silently.

**Fix**: Add `revenueCatApiKeyAndroid` constant and use `Platform.isAndroid` to select the correct key. Update `_initRevenueCat` in `main.dart`.

---

### BUG-009 · `updateUserSyncStats` always overwrites recovered_revenue_self_reported when provided

**File**: `packages/functions/src/sync/persistence.ts:360-373`

The `updateUserSyncStats` function optionally accepts `recoveredRevenueSelfReported`. But it's never passed from the orchestrator. The value in `users/{uid}.stats.recovered_revenue_self_reported` is only updated via `updateGapStatus` transaction, which is correct. However `updateUserSyncStats` could overwrite it to `undefined`/`0` if ever called with that param.

Currently not called with it from the callable, so low immediate risk — but the interface is misleading.

**Fix**: Remove `recoveredRevenueSelfReported` from `updateUserSyncStats` params since it's managed separately. Or add a clear comment warning not to pass it from sync.

---

### BUG-010 · Gap Action analytics events not fired after fill

**File**: `apps/mobile/lib/features/gap_action/fill_slot_flow.dart:25-50` (inferred)

`fill_slot_flow.dart` calls `SharePlus.share()` and then asks the user if they filled it. If they confirm, it calls `updateGapStatus`. But there's no `AnalyticsService.gapFilled()` call after confirmation.

**Impact**: `gap_filled` and `revenue_recovered` analytics events are missing. Conversion funnel is blind.

**Fix**: After `updateGapStatus` succeeds with status=`filled`, fire:
```dart
AnalyticsService.gapFilled(leakageValue: gap.leakageValue);
AnalyticsService.revenueRecovered(amount: gap.leakageValue);
```

---

## P2 Bugs (Minor / polish)

---

### BUG-011 · `SyncResultNotifier.build()` returns null — triggers loading flash

**File**: `apps/mobile/lib/providers/sync_provider.dart:18-21`

```dart
@override
Future<SyncResult?> build() async {
  return null; // No data until first sync
}
```

On app launch, `syncResultProvider.state = AsyncData(null)`, which displays "empty" state rather than triggering a sync. The dashboard relies on the user manually tapping "Run sync". This is intentional per the current design but creates a confusing empty state on first load.

**Fix**: In `SyncResultNotifier.build()`, trigger an automatic sync if `settings.calendarSource != null` and `lastSyncAt` was > 4 hours ago. This makes the app feel live on relaunch.

---

### BUG-012 · `lastSyncAtProvider` creates a re-render loop potential

**File**: `apps/mobile/lib/providers/sync_provider.dart:74-78`

```dart
final lastSyncAtProvider = FutureProvider<DateTime?>((ref) async {
  ref.watch(syncResultProvider); // watches the whole async state
  ...
});
```

`ref.watch(syncResultProvider)` in a `FutureProvider` causes `lastSyncAtProvider` to rebuild every time `syncResultProvider` emits any state (loading, error, data). This can cause cascading rebuilds during sync.

**Fix**: Use `ref.watch(syncResultProvider.select((s) => s.valueOrNull))` to only rebuild when data actually changes.

---

### BUG-013 · `cancel_intercept_page.dart` PaywallPage weeklyLeakage defaults to 0

**File**: `apps/mobile/lib/features/settings/cancel_intercept_page.dart:226-229`

```dart
builder: (_) => const PaywallPage(
  weeklyLeakage: 0,           // ← hardcoded 0
  trigger: PaywallTrigger.none(),
```

**Impact**: When user navigates to PaywallPage from CancelInterceptPage, the paywall shows "$0 left on the table" instead of their real leakage value. This removes the loss-framing that would motivate retention.

**Fix**: Pass the actual `weeklyLeakage` from the sync result. Read it from `syncResultProvider` before navigating.

---

### BUG-014 · Silent failure on `NotificationService.initialize()`

**File**: `apps/mobile/lib/main.dart:61-63`

```dart
NotificationService.initialize().catchError((_) {}),
```

All errors are silently swallowed. On web (where FCM is unsupported in this config), this silently fails. The user never knows push notifications aren't working.

**Fix**: Log the error at minimum: `catchError((e) => debugPrint('NotificationService init failed: $e'))`. On iOS, if permission is denied, surface a gentle nudge in Settings.

---

### BUG-016 · Dead code in `decision_engine.ts` — quiet-hours and quota never enforced locally ✅ Fixed

**File**: `packages/functions/src/notifications/decision_engine.ts`

Three symbols were defined but never called:

```typescript
// 1. Variable computed but never read
const dailyCount = state.daily_count_date === today ? (state.daily_count ?? 0) : 0;

// 2. Function defined, never called
function isInQuietHours(timezone: string): boolean { … }  // line 236

// 3. Function defined, never called
function getQuota(frequency: string): number { … }  // line 250
```

**Why it wasn't a live bug**: All three concerns are already correctly enforced in `notificationEligibility.ts` via T-05 (quiet hours 21:00–07:00), T-06 (reduced-frequency daily cap), and T-08 (standard daily quota ≥ 2). The eligibility layer is called at line 77 of `shouldSendNotification()`, so push is properly gated.

**Fix applied**: Removed all three dead-code blocks. The eligibility layer is the single source of truth for these rules.

---

### BUG-015 · `getWeeklySummary` Firestore queries not using the composite index

**File**: `packages/functions/src/index.ts:793-795`

```typescript
.where("user_id", "==", userId)
.where("start_time", ">=", monday)
.where("start_time", "<=", sunday)
```

The Firestore index in `firestore.indexes.json` has `user_id ASC + start_time ASC`. The range query on `start_time` with equality on `user_id` should use this index. However the query for previous week also adds `.where("status", "==", "filled")` — this requires a composite index `user_id + status + start_time`. That index IS defined in `firestore.indexes.json` (status ASC, start_time ASC). But the query uses `start_time` range with `status == "filled"` — needs index `(user_id, status, start_time)` which exists ✅. However, the field order in the index is `user_id → status → start_time` and Firestore requires the range field to be last — this should work.

Actually the missing index issue: `(user_id, start_time)` for the current-week query with no status filter — this index IS defined. Low risk.

**Mark**: P2 — monitor query performance in production.

---

## Fix Priority Order

| Priority | Bug ID | Fix complexity | Owner |
|----------|--------|----------------|-------|
| P0 | BUG-001 | Medium (add 30d query) | Backend |
| P0 | BUG-002 | Large (timezone system) | Backend + Frontend |
| P0 | BUG-003 | Small (remove wrong field) | Backend |
| P1 | BUG-004 | Large (auth system) | Frontend |
| P1 | BUG-005 | Trivial (1-line fix) | Frontend |
| P1 | BUG-006 | Small (typed error + empty state) | Frontend |
| P1 | BUG-008 | Small (add Android key) | Frontend |
| P1 | BUG-010 | Small (add analytics calls) | Frontend |
| P2 | BUG-011 | Small (auto-sync on build) | Frontend |
| P2 | BUG-013 | Small (pass real leakage value) | Frontend |
| P2 | BUG-014 | Trivial (add logging) | Frontend |
| P2 | BUG-016 ✅ | Dead code removal (no behaviour change) | Backend |
