# FRONTEND TECH FINDINGS — SLOTFORCE Forensic Audit
Generated: 2026-02-22

---

## 1. Auth Boot Race Conditions

### Finding 1.1 — Google Connection Status Checked Before Provider Resolves
**File**: `apps/mobile/lib/features/dashboard/dashboard_page.dart:55-67`
**Risk**: Incorrect sync skip on cold start

```dart
// dashboard_page.dart:58 — reads valueOrNull before async CF call resolves
final googleConnected =
    ref.read(googleConnectionProvider).valueOrNull ?? false;
final usingGoogle = settings?.calendarSource != 'apple';

if (usingGoogle && !googleConnected) return; // BAD: skips sync if provider is loading
```

`googleConnectionProvider` calls `getCalendarConnectionStatus` CF on `build()`. This is an async network call. On cold start, `_autoSyncIfNeeded()` runs via `addPostFrameCallback` — milliseconds after the widget mounts. The provider will almost certainly still be in `AsyncLoading` state at this point, so `valueOrNull` returns null, `googleConnected = false`, and sync is skipped.

**Reproduction**: Cold launch → Dashboard → gap data never loads despite Google being connected. User must pull-to-refresh.

**Fix Pattern**:
```dart
// Wait for the provider to resolve before deciding:
final googleConnected = await ref.read(googleConnectionProvider.future);
```
Or restructure to use `ref.listen` to trigger sync once the provider resolves from loading.

**Effort**: 30 min

---

### Finding 1.2 — Anonymous Auth + RevenueCat Race Condition
**File**: `apps/mobile/lib/main.dart:60-64`

```dart
await Future.wait([
  AbTestService.initialize().catchError((_) {}),
  NotificationService.initialize().catchError((_) {}),
  _initRevenueCat().catchError((_) {}),   // RevenueCat identifies by uid
]);
```

`_initRevenueCat()` calls `Purchases.logIn(uid)` where `uid` comes from `FirebaseAuth.instance.currentUser?.uid`. The anonymous sign-in `await FirebaseAuth.instance.signInAnonymously()` at line 56-57 runs before this block, so the uid should be available. However, if `signInAnonymously()` returns a partial result before the auth token propagates, `currentUser?.uid` could theoretically be null (race between auth state stream and direct currentUser access).

**Risk**: Low probability on happy path, but RevenueCat will be initialized without user identification if uid is null, meaning IAP purchases won't be tied to the Firebase user.

**Fix Pattern**: `final uid = FirebaseAuth.instance.currentUser?.uid ?? await FirebaseAuth.instance.authStateChanges().firstWhere((u) => u != null).then((u) => u!.uid);`

**Effort**: 20 min

---

## 2. Navigation Guard Bugs

### Finding 2.1 — onboardingCompleteProvider Error State Routes to AppShell
**File**: `apps/mobile/lib/main.dart:262-269`

```dart
return onboardingComplete.when(
  data: (complete) {
    if (!complete) return const OnboardingPage();
    return const AppShell();
  },
  loading: () => const _SplashScreen(),
  error: (_, __) => const AppShell(), // ← silent error swallow
);
```

If `SettingsStorage.isOnboardingComplete()` throws (e.g. SharedPreferences corruption), the error is silently swallowed and the user is routed to `AppShell`. A user in this broken state has `onboardingComplete = true` by default behavior, so they skip onboarding, have no settings, and get a broken dashboard with no gaps and no calendar connected.

**Fix Pattern**: Route to `OnboardingPage` on error, or show a recoverable error screen.

**Effort**: 15 min

---

### Finding 2.2 — Hard Navigation Index Literal in Dashboard
**File**: `apps/mobile/lib/features/dashboard/dashboard_page.dart:313`

```dart
ref.read(navigationIndexProvider.notifier).state = 1; // should be 3 for Studio
```

See UX Audit for full context. Studio is at index 3 in the `IndexedStack`. This causes navigation to Messages instead of Studio.

**Fix Pattern**: Replace magic integers with named constants or an enum.

```dart
enum AppTab { dashboard, messages, shop, studio }
ref.read(navigationIndexProvider.notifier).state = AppTab.studio.index;
```

**Effort**: 15 min

---

### Finding 2.3 — No Navigation Guard When Paywall Is Active
**File**: `apps/mobile/lib/features/paywall/paywall_trigger_resolver.dart` (file exists but not read — inferred from imports)

The `paywallTriggerProvider` is evaluated but there's no route guard that prevents premium features from being used during a free/trial-expired state. The paywall is purely reactive (shown as a modal when a trigger fires), not a wall. A motivated user can dismiss the paywall modal and continue using all features.

**Assumption**: This may be intentional (freemium model) but should be explicitly documented.

---

## 3. Data Fetching Bugs

### Finding 3.1 — SyncResultNotifier Does Not Invalidate on Settings Change
**File**: `apps/mobile/lib/providers/sync_provider.dart`

`SyncResultNotifier.build()` returns `null` initially. It does not `ref.watch(userSettingsProvider)`. This means if the user changes their working hours or booking value in Settings, the displayed gap data and leakage amounts are stale until the next manual pull-to-refresh.

**Fix Pattern**: Add `ref.watch(userSettingsProvider)` in the `build()` method body (or listen and invalidate).

**Effort**: 20 min

---

### Finding 3.2 — lastSyncAtProvider Uses ref.watch(syncResultProvider) Incorrectly
**File**: `apps/mobile/lib/providers/sync_provider.dart:74-79`

```dart
final lastSyncAtProvider = FutureProvider<DateTime?>((ref) async {
  ref.watch(syncResultProvider); // Forces re-eval when sync completes
  final storage = ref.read(settingsStorageProvider);
  return storage.getLastSyncAt();
});
```

`ref.watch(syncResultProvider)` inside a `FutureProvider` body is unusual. When `syncResultProvider` emits `AsyncLoading`, this provider will re-run its async function, calling `getLastSyncAt()` again while sync is in progress. This is not harmful but causes unnecessary reads.

**Fix Pattern**: Use `ref.listen` outside the provider or restructure so `lastSyncAt` is part of `SyncResultNotifier`.

**Effort**: 30 min

---

### Finding 3.3 — recoveredRevenueProvider Has No Server Sync
**File**: `apps/mobile/lib/providers/sync_provider.dart:82-106`

`RecoveredRevenueNotifier` reads/writes from SharedPreferences only. It does not sync with Firestore `users/{uid}.stats.recovered_revenue_self_reported`. The Firestore value is written by `FirestoreSyncPersistence.updateGapStatus()` via a transaction. If the user reinstalls the app or switches devices, their recovered revenue resets to $0.

**Risk**: Data loss of recovered revenue tracking across device reinstalls. This undermines the core retention metric (cumulative recovered USD).

**Fix Pattern**: On `build()`, read from Firestore first, fall back to SharedPreferences.

**Effort**: 2 hours

---

### Finding 3.4 — paywallTriggerProvider Uses ref.read Instead of ref.watch for subscriptionProvider
**File**: `apps/mobile/lib/providers/paywall_trigger_provider.dart:28`

```dart
final subscription = await ref.read(subscriptionProvider.future);
```

Using `ref.read` means the paywall trigger is evaluated once on build and does not re-run if `subscriptionProvider` changes (e.g., after a successful purchase that updates the subscription state). The paywall may not dismiss automatically after a successful purchase.

**Fix Pattern**: Use `ref.watch(subscriptionProvider.future)` or `ref.watch(subscriptionProvider)` with a guard to re-evaluate.

**Effort**: 30 min

---

## 4. Form / State Issues

### Finding 4.1 — Onboarding PageController Not Synchronized with _currentPage State
**File**: `apps/mobile/lib/features/onboarding/onboarding_page.dart:57-75`

```dart
void _nextPage() {
  _pageController.nextPage(duration: ..., curve: ...);
  setState(() => _currentPage++);
}
```

Both `_pageController` and `_currentPage` are updated on `_nextPage`/`_prevPage`. However, swipe gestures are disabled (`NeverScrollableScrollPhysics`), so this can't desync via gesture. But if `_nextPage` is called while the animation is in progress, `_currentPage` increments immediately while the visual page is mid-scroll, potentially causing the progress dots or `N / 6` counter to jump ahead of the visual.

**Fix Pattern**: Call `setState` inside the `.then()` callback of `nextPage` or use a `PageController.page` listener.

**Effort**: 20 min

---

### Finding 4.2 — BookingValueStep onChange Not Using setState
**File**: `apps/mobile/lib/features/onboarding/onboarding_page.dart:183`

```dart
BookingValueStep(
  initialValue: _avgBookingValue,
  onChanged: (v) => _avgBookingValue = v, // no setState
),
```

`_avgBookingValue` is updated directly without `setState`. This is fine for the booking value itself (it's only read at completion), but if any parent widget display depends on `_avgBookingValue` (e.g., the leakage estimate shown in `LossInductionStep`), it won't reflect the updated value until a rebuild is triggered by other means.

The `LossInductionStep` receives `avgBookingValue: _avgBookingValue` as a parameter and shows `avgBookingValue * 2`. If the user changes their booking value and navigates forward, the LossInductionStep may show the old value.

**Reproduction**: Set booking value to $200 → move to next steps → leakage estimate on step 6 still shows the default $85 * 2 estimate.

**Fix Pattern**: Add `setState` to the `onChanged` callback.

**Effort**: 5 min

---

### Finding 4.3 — WorkingHoursEditor Has No "Enabled Days" Count Shown
**File**: `apps/mobile/lib/features/settings/widgets/working_hours_editor.dart`

No direct read but inferred from the Settings page hero text: `settings.workingHours.values.where((d) => d.enabled).length` is shown in the hero. If a user disables all days, the hero will show "0 working days" but there's no validation or warning that this will produce zero gaps (and zero leakage), which may confuse users who expect to see gaps.

**Fix Pattern**: Show a warning when all days are disabled.

**Effort**: 30 min

---

## 5. Error Handling Gaps

### Finding 5.1 — SyncResultNotifier.refresh() Exposes Raw Exception via rethrow
**File**: `apps/mobile/lib/providers/sync_provider.dart:67-69`

```dart
} catch (e, st) {
  state = AsyncError(e, st);
  rethrow;
}
```

The caught exception is set as `AsyncError` AND rethrown. The Dashboard calls `ref.read(syncResultProvider.notifier).refresh()` in a try/catch and maps the error. But any other caller that uses `await` on `refresh()` without a try/catch will get an unhandled exception.

**Finding**: `studio_page.dart:23` catches `_` (all errors silently). This is fine but loses context.

**Fix Pattern**: Don't rethrow — allow callers to read `syncResultProvider` state rather than catching the rethrown exception.

**Effort**: 30 min

---

### Finding 5.2 — cancel_intercept_page.dart Exposes Raw Exception in SnackBar
**File**: `apps/mobile/lib/features/settings/cancel_intercept_page.dart:49`

```dart
SnackBar(content: Text('Could not cancel: $e'))
```

Raw exception stringified to user. Should be a friendly message.

**Effort**: 5 min

---

### Finding 5.3 — onboarding_page.dart Exposes Raw Exception
**File**: `apps/mobile/lib/features/onboarding/onboarding_page.dart:122`

```dart
ScaffoldMessenger.of(context).showSnackBar(
  SnackBar(content: Text('Something went wrong: $e')),
);
```

**Effort**: 5 min

---

## 6. Performance Pitfalls

### Finding 6.1 — IndexedStack Instantiates All 4 Tab Pages on First Render
**File**: `apps/mobile/lib/features/shell/app_shell.dart:51-59`

```dart
body: IndexedStack(
  index: currentIndex,
  children: const [
    DashboardPage(),
    MessagesPage(),
    ShopPage(),
    StudioPage(),
  ],
),
```

`IndexedStack` preserves state across tab switches (good) but instantiates all 4 children immediately on the first build. `DashboardPage` calls `_autoSyncIfNeeded()` in `initState`. `StudioPage` and `MessagesPage` also start rendering immediately even if the user is on Dashboard.

On a slow device or slow network, this means 4 pages with their provider subscriptions all fire on launch.

**Fix Pattern**: Use `Offstage` + lazy initialization, or accept the cost since the pages are lightweight stubs (Messages/Shop are mock data only).

**Effort**: 1 hour for lazy loading. Low priority until real data is behind all tabs.

---

### Finding 6.2 — BackdropFilter in Bottom Nav Bar on Every Frame
**File**: `apps/mobile/lib/features/shell/app_shell.dart:83-86`

```dart
BackdropFilter(
  filter: ImageFilter.blur(sigmaX: 14, sigmaY: 14),
  child: ...
)
```

`BackdropFilter` with blur is GPU-expensive, especially on mid-range Android devices. It re-renders on every navigation state change.

**Fix Pattern**: Cache the bottom nav as a `RepaintBoundary`. Consider removing the blur on Android where it's more expensive.

**Effort**: 30 min

---

### Finding 6.3 — Dashboard Gap List Built Without ListView.builder Optimization
**File**: `apps/mobile/lib/features/dashboard/dashboard_page.dart` (inferred from ListView usage)

The dashboard uses a regular `ListView` with all gap cards as children (not `ListView.builder`). For users with many gaps (e.g., 50+ over 2 weeks), all widgets are instantiated at once.

**Fix Pattern**: Replace with `ListView.builder` using `itemCount: filteredGaps.length` and `itemBuilder`.

**Effort**: 30 min

---

## 7. State Management Patterns

### Finding 7.1 — navigationIndexProvider is StateProvider (Not Appropriate for App Nav)
**File**: `apps/mobile/lib/providers/navigation_provider.dart:3`

```dart
final navigationIndexProvider = StateProvider<int>((ref) => 0);
```

`StateProvider` for navigation index is functional but brittle. Direct writes (`notifier.state = i`) from multiple locations (dashboard, app_shell) can cause state ownership confusion. Also, `StateProvider` is not suitable if navigation needs to carry associated data (e.g., deep-link to a specific gap).

**Fix Pattern**: Replace with a `NotifierProvider<NavigationNotifier, int>` with typed navigation methods, or adopt go_router for proper deep-link support.

**Effort**: 1 hour

---

### Finding 7.2 — settingsStorageProvider is Provider<SettingsStorage> — Not Scoped or Mockable
**File**: `apps/mobile/lib/providers/user_settings_provider.dart:6-8`

```dart
final settingsStorageProvider = Provider<SettingsStorage>((ref) {
  return SettingsStorage();
});
```

`SettingsStorage` creates a `SharedPreferences` instance lazily inside itself. This is not overridable in widget tests without a `ProviderScope` override. It also means all providers that `ref.read(settingsStorageProvider)` get the real SharedPreferences — making unit testing any provider that depends on it require `SharedPreferences.setMockInitialValues()` setup.

**Fix Pattern**: Acceptable for now. Document in testing guide that `ProviderScope` overrides are needed in widget tests.

**Effort**: No immediate fix needed; document.

---

### Finding 7.3 — Multiple Providers Call ref.read(settingsStorageProvider) Instead of ref.watch
**Files**: `user_settings_provider.dart`, `sync_provider.dart`, `paywall_trigger_provider.dart`, `subscription_provider.dart`, etc.

All providers use `ref.read(settingsStorageProvider)` in their `build()` methods. This is correct for service objects (no need to re-run on change), but it means if `SettingsStorage` itself needs to change (e.g., path override for testing), the providers won't see the new instance.

**Finding**: Acceptable pattern — `SettingsStorage` is a singleton service, not reactive data. No change needed.

---

### Finding 7.4 — DailyRitualProvider.markTask() Called Without Awaiting in App Shell
**File**: `apps/mobile/lib/features/shell/app_shell.dart:116-119`

```dart
if (i == 3) {
  ref.read(dailyRitualProvider.notifier).markTask('review');
}
```

`markTask()` is async but is called without `await` or `unawaited()`. The lint will flag this as an unawaited future. If `markTask` throws, the exception is silently swallowed.

**Fix Pattern**: Add `unawaited(ref.read(dailyRitualProvider.notifier).markTask('review'));` to make intent explicit.

**Effort**: 5 min

---

## 8. Missing const Constructors

The following widgets are instantiated without `const` where possible:

- `apps/mobile/lib/features/shell/app_shell.dart` — `_NavItemData` uses `const` correctly. `AppShell` itself is `const` correctly.
- `apps/mobile/lib/features/dashboard/widgets/empty_state.dart` — likely missing `const` on `EmptyState` if it has no mutable fields
- `apps/mobile/lib/features/dashboard/widgets/gap_card.dart` — `GapCard` widgets in list builders cannot be `const` due to dynamic data
- `apps/mobile/lib/core/widgets/main_navigation_drawer.dart` — if stateless, should be `const`

**General Pattern**: Run `dart fix --apply` to auto-apply `const` suggestions from `flutter_lints`.

**Effort**: 15 min (automated)

---

## 9. AnimationController Dispose Patterns

### Finding 9.1 — No AnimationController Usage Identified in Current Screens
Review of the loaded files shows no explicit `AnimationController` usage. Animations are handled via `AnimatedContainer`, `AnimatedSwitcher`, and `AnimatedOpacity` widgets which manage their own lifecycle. No dispose issue identified.

**Exception**: `celebration_overlay.dart` (file exists, content not read). If it uses `AnimationController`, a dispose pattern must be verified.

**Recommendation**: Verify `celebration_overlay.dart` and any new animated widgets added in Shop/Messages features follow the standard `SingleTickerProviderStateMixin` + `dispose()` pattern.

---

## 10. Additional Findings

### Finding 10.1 — _AppBootstrapState.initFuture Leaks Across Hot Reloads
**File**: `apps/mobile/lib/main.dart:48`

```dart
late final Future<void> _initFuture = _init();
```

`late final` ensures `_init()` runs once. In debug mode, hot reload does NOT re-run `initState`, so `_initFuture` will correctly not re-run Firebase init. However, hot restart WILL re-run the entire widget tree from scratch. This is the expected behavior and is not a bug.

**Finding**: No issue. Pattern is correct.

---

### Finding 10.2 — UnsupportedError Catch Is Too Broad
**File**: `apps/mobile/lib/main.dart:65-68`

```dart
} on UnsupportedError {
  // Firebase not configured for this platform — skip auth.
  debugPrint('Firebase not configured for this platform. Running in UI-only mode.');
}
```

This catches `UnsupportedError` to handle missing Firebase config, but `UnsupportedError` is a very broad exception class. Any other `UnsupportedError` thrown during Firebase init (e.g., from a dependency bug) would be silently swallowed as "running in UI-only mode."

**Fix Pattern**: Check for the specific Firebase config error by exception message, or use a more specific exception type.

**Effort**: 10 min

---

### Finding 10.3 — AnalyticsService Source Parameter Is Always 'organic'
**File**: `apps/mobile/lib/main.dart:249-255`

```dart
void _onAppForegrounded({required bool isInitial}) {
  AnalyticsService.appOpened(source: isInitial ? 'organic' : 'organic');
  unawaited(AnalyticsService.trackAppOpenRemote(
    source: isInitial ? 'organic' : 'organic',
  ));
}
```

Both `isInitial: true` and `isInitial: false` pass `'organic'` as source. The push notification attribution path (`source: 'push'`) is never used here. If the app is opened from a push notification, the source will be misreported as organic.

**Fix Pattern**: Check `FirebaseMessaging.instance.getInitialMessage()` on cold start and `RemoteMessage` on resume to detect push-opened sessions.

**Effort**: 1 hour
