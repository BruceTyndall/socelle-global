# 06 — Testing & Observability
> Forensic audit — verified in code — February 2026

---

## Existing Test Inventory

### Backend (Vitest — `packages/functions/`)

**Test runner**: Vitest (configured in `vitest.config.ts` at repo root)
**Test location**: `packages/functions/src/__tests__/`
**Claimed count**: ~110 tests (all green per codebase state)

#### `notificationEligibility.test.ts`
Tests `checkNotificationEligibility()` from `decision_engine.ts`.

| Test ID | Description | Status |
|---------|-------------|--------|
| T-01 | Returns eligible when all conditions met | Verified in file |
| T-02 | Rejects when gap in past | Verified |
| T-03 | Rejects when gap > 72h away | Verified |
| T-04 | Rejects when weekly_digest mode and not Monday | Verified |
| T-05 | Rejects when daily_count >= limit (standard=3) | Verified |
| T-06 | Rejects when < 4h since last notification | Verified |
| T-07 | Passes when 7-day absence (inactivity override) | Verified |
| T-08 | Rejects always-intentional slot | Verified |
| T-09 | Rejects below value threshold (< 30% of avgBookingValue) | Verified |
| T-10 | Selects tier1 for gap > 24h | Verified |
| T-11 | Selects tier2 for gap 6–24h | Verified |
| T-12 | Selects tier3 for gap < 6h | Verified |
| T-13 | Rotates framing index | Verified |
| T-14 | Quiet hours check (isInQuietHours) | NOTE: function exists but is NOT called in decision_engine.ts — test passes but tests dead code |
| T-15 | Re-engagement eligibility after 7-day absence | Verified |

**Gap**: `isInQuietHours()` is defined in `decision_engine.ts` but never invoked in the main `shouldSendNotification()` flow. T-14 passes by testing the function in isolation, not its integration into the notification decision. This is a critical coverage gap — quiet hours are not actually enforced.

#### `emailClassification.test.ts`
Tests email marketing vs transactional classification for SendGrid routing.
Uses `vi.mock` for Firestore and `fetch`. All tests use fixed `NOW_ISO` timestamp.
Coverage includes:
- Marketing email opt-out check
- Transactional email bypass (always sent)
- Re-engagement email classification
- Resurrection email classification
- Weekly digest classification

#### Other test files (inferred from package.json scripts)
`packages/functions/src/__tests__/` may contain additional test files for:
- Gap engine unit tests (`gapEngine.test.ts`)
- Retention metrics tests (`retentionMetrics.test.ts`)
- Sync orchestrator tests

### Mobile (Flutter Test)

**Test runner**: Flutter test framework
**Test location**: `apps/mobile/test/`
**Current state**: `widget_test.dart` — minimal scaffold test only. Essentially empty beyond the default Flutter starter test.

**Coverage**: Near zero. No unit tests for providers, no widget tests for key screens, no integration tests.

---

## Critical Coverage Gaps

### Backend Gaps

| Area | Gap | Risk |
|------|-----|------|
| `isInQuietHours()` integration | Function exists but never called in `shouldSendNotification()` — quiet hours NOT enforced | P1: users receive notifications at 2am |
| `rolling_30d_leakage` calculation | No test verifying it differs from weekly leakage (BUG-001) | P0: data integrity |
| Timezone gap detection | No test for non-UTC user with 09:00-17:00 hours | P0: wrong gaps for all non-UTC users |
| `updateGapStatus` double-fill | No test preventing double-counting recovered revenue | P1: data corruption |
| `replaceGapsInRange` status preservation | No test verifying existing filled/intentional status is preserved on re-sync | P1: user markings lost on re-sync |
| `storeCalendarTokens` token exchange | Mocked — real Google token exchange never tested in CI | P1: integration blind spot |
| `intentionalRule` 30-min tolerance | Tolerance matching logic has no edge-case tests (exact boundary, > 30min, < 30min) | P2 |
| `getWeeklySummary` nextWeekGapCount | No test catching BUG-003 (returns current week count) | P1 |
| Cancellation routing | No test for all 5 routing branches | P2 |

### Mobile Gaps

| Area | Gap | Risk |
|------|-----|------|
| `SyncResultNotifier` | No test for build() → auto-sync → SyncResult state transitions | P1 |
| `PaywallTriggerNotifier` | No test for trigger evaluation (all 5 triggers) | P1 |
| `SubscriptionNotifier` | No test for trial → active → cancelled state machine | P1 |
| `onboardingCompleteProvider` | No test for onboarding gate | P2 |
| Gap card urgency tier | Timer-based tier changes have no test | P2 |
| Paywall trigger resolver | No test for trigger → copy mapping | P2 |
| `SettingsStorage` | No test for SharedPrefs read/write round-trips | P2 |
| Analytics events | No test verifying analytics events are fired on key actions | P2 |

---

## Proposed Backend Tests

### Test: `rolling_30d_leakage` (BUG-001 regression)

**File**: `packages/functions/src/__tests__/persistence.test.ts` (NEW)

```typescript
describe('updateUserSyncStats', () => {
  it('should compute rolling_30d_leakage independently from current_week_leakage', async () => {
    // Arrange: mock Firestore with gaps spanning 4 weeks
    const mockGaps = [
      { start_time: weeksAgo(3), leakage_value: 100, status: 'open' },
      { start_time: weeksAgo(2), leakage_value: 150, status: 'open' },
      { start_time: weeksAgo(1), leakage_value: 85, status: 'open' },
      { start_time: now(), leakage_value: 120, status: 'open' },
    ];
    
    // Act
    const result = await updateUserSyncStats({ weeklyLeakage: 120, uid });
    
    // Assert
    expect(result.rolling_30d_leakage).toBe(455);       // sum of all 4
    expect(result.current_week_leakage).toBe(120);       // only current week
    expect(result.rolling_30d_leakage).not.toBe(result.current_week_leakage);
  });
});
```

### Test: Timezone gap detection (BUG-002 regression)

**File**: `packages/gap_engine/src/__tests__/gapEngine.test.ts` (NEW or extend existing)

```typescript
describe('computeGaps timezone handling', () => {
  it('should detect gaps in user local time not UTC for EST user', () => {
    const userTimezone = 'America/New_York'; // UTC-5
    const workingHours = {
      mon: { enabled: true, start: '09:00', end: '17:00' }
    };
    // Event at 14:00 UTC = 09:00 EST — should be within working hours and block a gap
    const events = [{ start: '2026-02-23T14:00:00Z', end: '2026-02-23T15:00:00Z' }];
    
    const gaps = computeGaps({ events, workingHours, timezone: userTimezone, ... });
    
    // 09:00-17:00 EST = 14:00-22:00 UTC
    // Event at 14:00-15:00 UTC = 09:00-10:00 EST — fills first slot
    // Remaining gap: 10:00-17:00 EST = 7 hours
    expect(gaps).not.toContainGapOverlapping('09:00', '10:00', 'EST');
    expect(gaps).toContainGapAt('10:00', '17:00', 'EST');
  });
});
```

### Test: Quiet hours enforcement

**File**: `packages/functions/src/__tests__/notificationEligibility.test.ts` (extend)

```typescript
describe('quiet hours integration', () => {
  it('should NOT send notification during quiet hours (22:00 - 07:00 user local time)', async () => {
    // Gap is in the future, all other conditions met
    // But current time in user timezone is 23:30
    const result = await shouldSendNotification({
      gap, user, notifState,
      now: '2026-02-24T04:30:00Z',    // 23:30 EST
      userTimezone: 'America/New_York'
    });
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('quiet_hours');
  });
});
```

### Test: Double-fill prevention

**File**: `packages/functions/src/__tests__/persistence.test.ts` (NEW)

```typescript
describe('updateGapStatus', () => {
  it('should not double-count recovered revenue if gap already filled', async () => {
    // Arrange: gap is already status="filled"
    mockGapDoc({ status: 'filled', leakage_value: 85 });
    
    // Act: call updateGapStatus again with filled
    await updateGapStatus({ gapId, status: 'filled', uid });
    
    // Assert: recovered_revenue NOT incremented again
    expect(mockFirestore.transaction).toHaveBeenCalledOnce();
    expect(mockUserDoc.stats.recovered_revenue_self_reported).toBe(85); // not 170
  });
});
```

### Test: Status preservation on re-sync

**File**: `packages/functions/src/__tests__/persistence.test.ts`

```typescript
describe('replaceGapsInRange', () => {
  it('should preserve filled status from previous sync', async () => {
    // Arrange: existing gap with status="filled"
    const existingGap = { id: 'gap1', status: 'filled', filled_at: now() };
    mockExistingGaps([existingGap]);
    
    // Act: sync arrives with same gap as status="open"
    const newGaps = [{ id: 'gap1', status: 'open' }];
    await replaceGapsInRange({ uid, gaps: newGaps, windowStart, windowEnd });
    
    // Assert: Firestore gap still has status="filled"
    expect(mockGapWrite).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'filled', filled_at: existingGap.filled_at })
    );
  });
});
```

---

## Proposed Mobile Tests

### Provider Unit Tests

**File**: `apps/mobile/test/providers/paywall_trigger_provider_test.dart` (NEW)

```dart
group('PaywallTriggerNotifier', () {
  test('trigger 1: fires when cumulative leakage >= 200', () async {
    final container = ProviderContainer(overrides: [
      settingsStorageProvider.overrideWith((_) => MockSettingsStorage(
        cumulativeLeakage: 200,
        firedTriggers: {},
      )),
    ]);
    final notifier = container.read(paywallTriggerProvider.notifier);
    await notifier.evaluate();
    final trigger = container.read(paywallTriggerProvider);
    expect(trigger?.type, equals(PaywallTriggerType.cumulativeLeakage));
  });

  test('trigger 2: fires 24h after first recovery, not before', () async {
    // ... test with firstRecoveryDate < 24h ago → no trigger
    // ... test with firstRecoveryDate > 24h ago → trigger fires
  });

  test('trigger 3: fires after 3 share uses', () async {
    // ... 
  });
});
```

**File**: `apps/mobile/test/providers/sync_provider_test.dart` (NEW)

```dart
group('SyncResultNotifier', () {
  test('refresh() triggers sync and emits SyncResult', () async { ... });
  test('refresh() with null calendarSource emits calendarNotConnected error', () async { ... });
  test('auto-sync on build if > 60 min since last sync', () async { ... });
  test('does not auto-sync if synced recently', () async { ... });
});
```

**File**: `apps/mobile/test/providers/subscription_provider_test.dart` (NEW)

```dart
group('SubscriptionNotifier', () {
  test('startTrial() sets status=trialing with 7-day expiry', () async { ... });
  test('cancelSubscription() reverts to free', () async { ... });
  test('isTrial returns true when within 7-day window', () async { ... });
  test('isExpired returns true after trial window', () async { ... });
});
```

### Widget Tests

**File**: `apps/mobile/test/features/dashboard_test.dart` (NEW)

```dart
testWidgets('DashboardPage shows LeakageHero with correct amount', (tester) async {
  await tester.pumpWidget(ProviderScope(
    overrides: [
      syncResultProvider.overrideWith((_) => AsyncData(mockSyncResult(weeklyLeakage: 340))),
    ],
    child: const MaterialApp(home: DashboardPage()),
  ));
  await tester.pumpAndSettle();
  expect(find.text('\$340'), findsOneWidget);
});

testWidgets('DashboardPage shows empty state when calendar not connected', (tester) async {
  // ...
});

testWidgets('GapCard shows tier3 urgency style when gap < 6h away', (tester) async {
  // ...
});
```

---

## E2E Integration Test Spec

**Runner**: Flutter integration tests (`integration_test/` package)
**Target**: Real Firebase emulator suite

### E2E-01: Full onboarding flow
```
1. Fresh install (clear SharedPrefs)
2. App opens → Splash → Onboarding Page 0
3. Navigate through all 5 pages filling valid data
4. Skip calendar connect
5. Assert: dashboard loads, LeakageHero shows estimated leakage
6. Assert: onboarding_complete = true in SharedPrefs
```

### E2E-02: Google calendar sync
```
1. User in onboarding → Connect Google → OAuth flow completes
2. Assert: storeCalendarTokens CF called, calendarConnected = true in Firestore
3. Assert: syncCalendarEvents CF called on dashboard load
4. Assert: gaps appear in gap feed
```

### E2E-03: Fill a gap
```
1. Dashboard with ≥ 1 open gap
2. Tap gap card → GapActionSheet
3. Tap "Text a Client" → share sheet opens
4. "Did you fill it?" dialog → tap Yes
5. Assert: gap status = "filled" in Firestore
6. Assert: recovered_revenue incremented in Firestore
7. Assert: streak updated in SharedPrefs
8. Assert: Dashboard leakage counter decreases
```

### E2E-04: Paywall trigger
```
1. Trigger cumulative leakage > $200 via mock
2. Assert: PaywallPage shown
3. Assert: heroValue shows correct leakage figure
```

### E2E-05: Notification tap navigation (once implemented)
```
1. Send test FCM push with gapId payload
2. Tap notification (backgrounded app)
3. Assert: GapActionSheet opens for correct gap
```

---

## Analytics Audit

### Analytics Events Inventory

**Source**: `apps/mobile/lib/services/analytics_service.dart`

| Event | When fired | Status |
|-------|-----------|--------|
| `app_opened` | `_RootFlow._onAppForegrounded()` | Fired — source param always `organic` (BUG-005) |
| `onboarding_started` | `OnboardingPage` page 0 | Needs verification |
| `onboarding_completed` | `_completeOnboarding()` | Needs verification |
| `calendar_connected` | After successful OAuth | Needs verification |
| `sync_started` | `SyncResultNotifier.refresh()` | Needs verification |
| `sync_completed` | After sync result | Needs verification |
| `gap_action_opened` | `GapActionSheet` open | NOT verified in code — likely missing |
| `outreach_sent` | After `SharePlus.share()` | Needs verification |
| `gap_filled` | After `updateGapStatus(filled)` | NOT fired (BUG-010) |
| `revenue_recovered` | After fill confirmation | NOT fired (BUG-010) |
| `gap_intentional` | After `updateGapStatus(intentional)` | Needs verification |
| `paywall_shown` | `PaywallPage` build | Needs verification |
| `trial_started` | `_startTrial()` | Needs verification |
| `purchase_completed` | — | Never wired (no RevenueCat purchase) |
| `notification_tapped` | `_handleNotificationTap` | Fired — but no navigation follows |
| `cancel_flow_started` | `CancelInterceptPage` open | Needs verification |
| `cancelled` | `_cancelAnyway()` | Needs verification |

### Analytics Verification Plan
1. Enable Firebase Analytics debug mode: `adb shell setprop debug.firebase.analytics.app com.slotforce.app`
2. Use DebugView in Firebase Console
3. Walk through each user flow once
4. Verify each event appears with correct parameters
5. Fix all missing/incorrect events before launch

---

## Error Reporting Proposal

### Current State
- Backend: `console.error()` only — errors visible in Firebase Functions logs
- Mobile: `debugPrint()` only — no crash reporting
- No alerting, no PagerDuty, no Slack notifications on errors

### Recommended Stack

**Backend**:
- Firebase Functions structured logging is already available — add severity levels
- Add Google Cloud Error Reporting (free tier covers all Functions errors automatically)
- Add `functions.logger.error()` with structured context instead of `console.error()`

```typescript
// Replace: console.error('Failed:', e)
// With:
functions.logger.error('sync_failed', {
  uid: context.auth?.uid,
  error: e.message,
  calendarSource: params.calendarSource,
});
```

**Mobile (Flutter)**:
- Add Firebase Crashlytics (already available in Firebase project)
- Integration: `firebase_crashlytics` package + `FlutterError.onError` + `PlatformDispatcher.instance.onError`
- Set user identifier: `FirebaseCrashlytics.instance.setUserIdentifier(uid)`
- Log non-fatal errors: `FirebaseCrashlytics.instance.recordError(e, stack)`

```dart
// main.dart — add after Firebase.initializeApp():
FlutterError.onError = FirebaseCrashlytics.instance.recordFlutterFatalError;
PlatformDispatcher.instance.onError = (error, stack) {
  FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
  return true;
};
```

**Alerting**:
- Firebase Functions: set up log-based alerts in Google Cloud for `severity=ERROR` from Functions namespace
- Threshold: alert if > 5 errors in 5 minutes from any single CF

---

## Observability Checklist

### Before Launch (Required)
- [ ] Firebase Analytics DebugView: all 10 key events verified
- [ ] Firebase Crashlytics: integrated and test crash sent
- [ ] Firebase Functions logs: no ERROR-level logs in baseline test run
- [ ] Firestore: composite indexes deployed and tested under load
- [ ] RevenueCat: dashboard shows test purchase events (once wired)

### After Launch (First 7 days)
- [ ] Monitor `sync_failed` event rate (target < 2%)
- [ ] Monitor `gap_filled` conversion rate (target > 15% of gaps with action opened)
- [ ] Monitor `paywall_shown` → `trial_started` conversion (target > 20%)
- [ ] Monitor `notification_tapped` rate (target > 8%)
- [ ] Monitor `rolling_30d_leakage` in Firestore (verify it's accumulating correctly after BUG-001 fix)
- [ ] Check for `invalid_grant` errors in Functions logs (Google token expiry)

### Monthly Health Check
- [ ] Run `flutter analyze` → 0 errors
- [ ] Run `npm test` in functions → 110+ tests green
- [ ] Review Firebase Auth anonymous user count vs active user count
- [ ] Review Firestore read/write costs (composite index queries)
- [ ] RevenueCat: verify subscription renewal rates

