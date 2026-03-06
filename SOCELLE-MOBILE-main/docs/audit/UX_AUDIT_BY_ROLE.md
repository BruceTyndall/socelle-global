# UX AUDIT BY ROLE — SLOTFORCE Forensic Audit
Generated: 2026-02-22

Priority tags: P0=blocking/broken, P1=major friction, P2=polish, P3=nice-to-have

---

## NEW USER IN ONBOARDING

### Screen: OnboardingPage (6-step PageView)
File: `apps/mobile/lib/features/onboarding/onboarding_page.dart`

**[P0] Calendar source skip creates invalid state**
- The "Skip — connect from Settings later" button sets `_calendarSource = ''` then calls `_completeOnboarding()`.
- This writes `calendarSource: ''` to SharedPreferences.
- The Zod schema requires `calendarSource: z.enum(["google", "apple"])`. An empty string will cause `SyncCalendarEventsRequestSchema` validation to fail on every sync attempt.
- Reproduction: Tap skip on step 6 → go to Dashboard → pull to refresh → see cryptic "Sync failed" error.
- Fix: Set `calendarSource` to a sentinel value like `'none'` and add a branch to `syncCalendarEvents` callable to return empty result for `'none'`. Or add `z.enum(["google", "apple", "none"])` to the schema.

**[P0] Final step CTA copy mismatch**
- The primary button on step 6 says "Connect your calendar" (`onboarding_page.dart:235`) but pressing it does NOT connect a calendar — it just saves settings and navigates to `LeakageReveal`.
- Actual OAuth connection happens only from Settings → CalendarConnectionCard.
- Users will expect to see a Google sign-in sheet and feel confused when they go directly to the dashboard.
- Fix: Change CTA to "See my leakage estimate" or "Calculate my gaps". Add a separate "Connect Google" button on step 6 that triggers the OAuth flow.

**[P1] No loading indicator on the final step button during async save**
- `_syncing` state shows a `CircularProgressIndicator` inside the button (`onboarding_page.dart:222`), but `saveSettings` → `storage.saveSettings` is local (SharedPreferences) and typically < 10ms. The spinner flash can feel jarring.
- However, if `storage.saveSettings()` throws, the catch shows `ScaffoldMessenger.showSnackBar('Something went wrong: $e')` which exposes raw exception text to the user.
- Fix: Show a friendly error message, not the raw exception.

**[P1] Step 3 (BookingValueStep): No validation for zero or negative booking value**
- `_avgBookingValue` initialized to `SlotforceConstants.defaultAvgBookingValue` (85.0). No min value enforced in `BookingValueStep`.
- If user enters 0, all leakage calculations will show $0. The leakage reveal on the next screen will be unimpressive and may cause drop-off.
- Fix: Enforce minimum of $1 in the slider/input with inline validation.

**[P1] LossInductionStep leakage estimate is a fixed formula, not personalized**
- `estimatedWeeklyLeakage = avgBookingValue * 2` (`onboarding_page.dart:285`). This is hardcoded as "2 gaps per week" regardless of the working hours the user just entered.
- The `_completeOnboarding` function uses `enabledDays * 1.5 * avgBookingValue` for the `LeakageReveal` screen, but the step itself shows `avgBookingValue * 2`.
- Two different formulas for the same "estimate" = inconsistency. Fix: Use the same formula in both places, informed by working hours.

**[P2] Progress indicator is dots, not numbers**
- `_ProgressDots` widget is used alongside the appbar "N / 6" counter. Redundant dual indicators.
- Fix: Choose one indicator — remove the dots or the "N / 6" text.

**[P2] Back navigation on step 1 shows no back button but hardware back (Android) can exit the app**
- `_currentPage > 0` check hides the back arrow on page 0 (`onboarding_page.dart:135`), but Android hardware back will pop the onboarding page entirely, leaving the user on a blank screen since `OnboardingPage` is the root route.
- Fix: Add `WillPopScope` (or `PopScope` in Flutter 3.x) to intercept hardware back on page 0.

**[P2] WorkingHoursStep has no visual affordance for "all-day" or cross-midnight schedules**
- Assumption based on `WorkingDay` model — no time validation to prevent `end` being before `start`. If a user accidentally sets end < start, gap detection will produce zero gaps silently.

---

## SOLO BEAUTY PRO — ACTIVE USER

### Screen: DashboardPage
File: `apps/mobile/lib/features/dashboard/dashboard_page.dart`

**[P0] Navigation index bug: "Open Studio" taps to index 1 (Messages), not index 3 (Studio)**
- In `dashboard_page.dart:313`, the `_LifestyleEdgeCard` calls:
  ```dart
  ref.read(navigationIndexProvider.notifier).state = 1;
  ```
- Studio is at index 3 in the `IndexedStack`. Index 1 is Messages.
- Users clicking "Open Studio" will land on the Messages tab.
- Fix: Change to `state = 3`.

**[P1] Auto-sync checks Google connection using `valueOrNull ?? false` before provider has loaded**
- `_autoSyncIfNeeded()` at `dashboard_page.dart:58`:
  ```dart
  final googleConnected = ref.read(googleConnectionProvider).valueOrNull ?? false;
  ```
- `googleConnectionProvider` is an `AsyncNotifierProvider` that makes a CF call. On cold start, it may still be loading when `_autoSyncIfNeeded()` runs via `addPostFrameCallback`.
- If `valueOrNull` is null (still loading), `googleConnected = false`, and `usingGoogle && !googleConnected` causes the sync to be skipped silently.
- Fix: `await ref.read(googleConnectionProvider.future)` or add a retry after the provider resolves.

**[P1] Error messages expose internal CF error strings to users**
- `_mapError()` pattern-matches on raw exception strings (`raw.contains('Google calendar is not connected yet')`). This is fragile — CF error messages could change and break the mapping. Also, `'Sync failed. Pull down to try again.'` is shown but the error banner has no retry button inline.
- Fix: Use structured error codes from CF responses, not substring matching.

**[P1] Empty state (no sync yet) shows "Run First Sync" feature preview card but the CTA calls `_runSync()` which will fail if Google is not connected — with no guidance**
- The `_FeaturePreviewCard` with label 'Run First Sync' (`dashboard_page.dart:339`) calls `_runSync()`. If Google is not connected, this will result in the sync error banner ("`Connect your Google calendar in Settings`") but no inline deep-link to Settings.
- Fix: Check connection status; if not connected, navigate directly to Settings→CalendarConnectionCard.

**[P1] Gap filter chip shows "Open (N)" counts but the count is re-computed on every build from the filtered list**
- The filter count is derived each render by filtering `result.gaps`. No memoization. On dashboards with many gaps, this could be a performance concern. Minor for <100 gaps.

**[P1] _bumpedGapIds is local setState, not persisted**
- Bumped gaps are stored in `_bumpedGapIds` (a `Set<String>` in state). This is reset every time the widget rebuilds from scratch (e.g. hot restart, app resume, tab switch).
- Users who bump a gap, switch tabs, and come back will see the bump is gone.
- Fix: Persist bumped gap IDs in SharedPreferences (short-lived, week-keyed).

**[P2] Dashboard appbar shows StreakBadge, TrialBadge, and share icon simultaneously — crowded on small phones**
- Three action icons in appbar when all are visible. No max width enforcement.
- Fix: Collapse to overflow menu on small screens, or only show one priority item.

**[P2] `monthlyLeakage = currentWeekLeakage * 4.3` — hardcoded multiplier displayed as "monthly" figure**
- Used in `RevenueSnapshot.shareSnapshot()` (`dashboard_page.dart:265`) and `StudioPage`.
- 4.3 weeks/month is a reasonable approximation but it's not labeled as "estimated" in the UI. This could mislead users who trust the precision.
- Fix: Label as "~estimated monthly" or compute from actual 4-week gap data.

**[P3] Campaign draft copy is generic — not personalized to actual gap dates/times**
- `_campaignDraft()` generates: `"Last-minute opening: I can fit you in for a [service] this week."` — no specific day or time from the actual focused gap.
- Fix: Pass the `focusGap` into `_campaignDraft()` and include the specific day/time.

---

### Screen: GapActionSheet + FillSlotFlow
Files: `lib/features/gap_action/gap_action_sheet.dart`, `fill_slot_flow.dart`

**[P1] No confirmation step when marking a gap as "Intentional"**
- Tapping "Mark as Intentional" → `MarkIntentionalSheet` → user selects reason → gap is marked. No confirmation summary showing what will happen (gap disappears from open list, intentional rule will be created for this time slot).
- Users may accidentally mark a gap intentional without understanding the recurring rule consequence.
- Fix: Add a one-line explanation: "This time slot will be excluded from future gap detection."

**[P1] FillSlotFlow message template uses unresolved placeholders**
- `SlotforceConstants.fillSlotMessageTemplate` = `"Hey! I have an opening on {day} at {time}."` (constants.dart:46).
- If `FillSlotFlow` renders this template without substitution, users will see literal `{day}` and `{time}` in the copy field.
- Verification needed: check `fill_slot_flow.dart` to confirm substitution logic exists. If not, this is a P0.

**[P2] GapActionSheet is passed `WidgetRef ref` directly into a StatelessWidget constructor**
- `_GapActionSheetContent(gap: gap, ref: ref)` at `gap_action_sheet.dart:22`. Passing `WidgetRef` outside of a `ConsumerWidget` build context is generally an anti-pattern and can cause stale ref issues if the sheet outlives the parent widget.
- Fix: Convert `_GapActionSheetContent` to a `ConsumerStatelessWidget`.

---

### Screen: RecoveryConfirmation
File: `apps/mobile/lib/features/gaps/recovery_confirmation.dart`

**[P2] Assumed: no loading/error states visible**
- Based on import patterns and role in the fill flow, this screen updates streak and recovered revenue. If the CF call to `updateGapStatus` fails, the local state (SharedPreferences) may update but the Firestore record may not — leading to a divergence.
- Fix: Show an error state if the CF call fails and roll back local state, or retry.

---

### Screen: StudioPage
File: `apps/mobile/lib/features/studio/studio_page.dart`

**[P1] No empty state for first-time users who haven't synced**
- `result?.gaps ?? const <GapItem>[]` is used without an explicit empty state widget. If `result` is null, the page renders with no gaps and no explanation.
- Fix: Show a prominent "Run your first sync" CTA when `result == null`.

**[P1] `_runSync()` catch swallows the error and shows a generic snackbar**
- `studio_page.dart:23`: `catch (_) { ... SnackBar(content: Text('Sync failed...')) }`. Error detail is lost.
- Fix: Surface actionable error message consistent with Dashboard's `_mapError()`.

**[P2] `monthlyLeakage = weeklyLeakage * 4.3` same hardcoded multiplier issue as Dashboard**

---

## SHOP (NEW — JUST BUILT)

### Screen: ShopPage
File: `apps/mobile/lib/features/shop/shop_page.dart`

**[P0] Entire Shop feature is UI-only mock with no backend**
- `shop_page.dart` uses `_kMockProducts` (hardcoded static data, inferred from the `_ProductSliverGrid` using a category-filtered local list).
- There are no Firestore collections for products, no Cloud Functions for orders, no payment processing for shop items, no storefront URL generation.
- The "Add Product" FAB (`_AddProductFab`) does not connect to any data layer.
- The `_StorefrontHero` "Copy Link" button likely copies a placeholder URL.
- The analytics icon button in the appbar (`onPressed: () {}`) is a no-op.
- **This is a preview/shell screen only. It should not be shipped to production users as a functional feature without a clear "Coming Soon" label.**
- Fix: Either add a prominent "Coming Soon" overlay, or hide the Shop tab behind a feature flag until the backend is built.

**[P1] Messages badge on Shop tab nav bar is hardcoded to 3 (app_shell.dart:38)**
- `badge: 3` is a static value in `_NavItemData` — it will always show "3" regardless of actual unread message count.
- Fix: Drive this value from a provider that queries actual unread count.

---

## MESSAGES (NEW — JUST BUILT)

### Screen: MessagesPage
File: `apps/mobile/lib/features/messages/messages_page.dart`

**[P0] Entire Messages feature is UI-only mock with no backend**
- `messages_page.dart:29`: `final clients = _kMockClients...` — all conversation data is hardcoded mock data.
- No Firestore collection for messages, threads, or clients.
- No Cloud Function for sending messages.
- AI suggestion feature (`_MissYouBanner`) appears to be static copy.
- The search bar filters mock data but does not query any real store.
- The "New Message" FAB (`_NewMessageFab`) is presumably a no-op or shows a placeholder sheet.
- The broadcast campaign button (`onPressed: () {}`) is a no-op.
- Same issue as Shop: **should not be presented as a functional feature to paying users**.

**[P1] Messages tab shows a hardcoded badge of 3 on the nav bar (same bug as Shop)**
- The badge is on the Messages item (`app_shell.dart:37-38`), not Shop. Same fix applies.

**[P2] Search controller not cleared when filter changes**
- Changing `_InboxFilter` does not clear `_searchQuery` or `_searchController`. If a user has typed a name and then taps a filter, they may be confused by the combined filter result.

---

## PAYWALL

### Screen: PaywallPage
File: `apps/mobile/lib/features/paywall/paywall_page.dart`

**[P1] `_startTrial()` only updates local state via `subscriptionProvider.notifier.startTrial()` — does NOT validate or purchase via RevenueCat**
- `paywall_page.dart:31-40`. The trial is started by writing a local `SubscriptionState` to SharedPreferences. There is no RevenueCat `Purchases.purchasePackage()` call.
- This means the trial state is client-side only and not validated against the App Store. A user could manipulate SharedPreferences to appear as a paying user.
- The `revenueCatApiKeyIos` in constants is still a placeholder: `'appl_REPLACE_WITH_REVENUECAT_IOS_KEY'` — so RevenueCat is not functional at all.
- Fix: Replace `startTrial()` with a proper RevenueCat `Purchases.purchasePackage()` flow. Block until API key is real.

**[P1] No loading state on trial CTA button**
- Tapping "Start 7-Day Trial" triggers an async call (`_startTrial()`) but the button has no loading indicator. User may tap multiple times.
- Fix: Add `_loading` state with button disabled + spinner while async is in progress.

**[P1] Annual vs Monthly toggle persists `_annualSelected = true` but no price is shown**
- The toggle starts with Annual selected but it's unclear from the code whether price labels are rendered. If not, users can't compare plans without guessing.
- Fix: Display `$${SlotforceConstants.monthlyPrice}/mo` and `$${SlotforceConstants.annualPrice}/yr (~$${SlotforceConstants.annualMonthlyEquivalent}/mo)` prominently.

**[P2] Paywall trigger copy references `t.leakageAmount` / `t.recoveredAmount` but these are nullable**
- Null-safe fallback copy exists for each case, but the copy structure is complex. If the trigger fires before values are populated, users see the generic fallback which is less compelling.

---

## SETTINGS

### Screen: SettingsPage
File: `apps/mobile/lib/features/settings/settings_page.dart`

**[P1] Referral code is generated from Firebase UID but the referral system has no backend**
- `referralCodeProvider` in `settings_page.dart:22` generates a `SLOT-XXXXXX` code from the Firebase UID. There is no CF that processes referral codes, no Firestore collection for referrals, and no reward mechanism.
- Copying the referral code and sharing it produces a dead end for the recipient.
- Fix: Either hide the referral section or mark it as "Coming Soon" until the backend exists.

**[P1] Calendar disconnect (revokeGoogleTokens) has no confirmation dialog**
- Tapping "Disconnect Google" in `CalendarConnectionCard` calls `googleConnectionProvider.notifier.disconnect()` immediately. No confirmation dialog.
- This revokes the OAuth token on the backend — a destructive action.
- Fix: Add an `AlertDialog` confirmation before calling `disconnect()`.

**[P2] Settings edits are saved individually (per field), not batch-saved**
- `BookingValueEditor`, `SlotDurationEditor`, `WorkingHoursEditor` each call `ref.read(userSettingsProvider.notifier).updateXxx()` on change. Each write triggers a SharedPreferences write.
- No "Save" button exists. Changes are auto-saved. Users accustomed to "Save/Cancel" patterns may not realize changes are immediate.
- Fix: Add a subtle "Settings saved" SnackBar on any change, or add explicit Save/Revert.

**[P2] `notification_frequency_widget.dart` calls `updateNotificationFrequency` CF on every change with no debounce**
- Each tap on a frequency option calls the CF. If the user taps rapidly or the network is slow, multiple requests fire.
- Fix: Debounce the CF call by 500ms.

---

## CANCEL INTERCEPT

### Screen: CancelInterceptPage
File: `apps/mobile/lib/features/settings/cancel_intercept_page.dart`

**[P0] `cancelSubscription()` only updates local SharedPreferences — does not cancel via App Store / RevenueCat**
- `cancel_intercept_page.dart:39`: calls `ref.read(subscriptionProvider.notifier).cancelSubscription()`.
- `SubscriptionNotifier.cancelSubscription()` (`subscription_provider.dart:42`) only writes `SubscriptionState.freeTier()` to SharedPreferences.
- There is no `Purchases.restorePurchases()` or Apple subscription management URL call.
- The user will think they've cancelled but their App Store subscription continues to charge.
- Fix: Open `https://apps.apple.com/account/subscriptions` via `url_launcher` and/or call RevenueCat to reflect the cancellation intent.

**[P1] `popUntil(route.isFirst)` after cancel may navigate incorrectly if the route stack is not as expected**
- On iOS, if `CancelInterceptPage` was pushed from the drawer (which is part of the Scaffold), `isFirst` may not pop back to Dashboard reliably.
- Fix: Use a named route or explicit route key instead of `isFirst`.

**[P1] Exit survey reason IDs (`not_using_consistently`, `didnt_see_results`) don't match CF `cancelRouting.ts` expected values (`not_using`, `no_results`)**
- Flutter `ExitSurveySheet` options: `not_using_consistently`, `didnt_see_results`, `too_expensive`, `switched_tool`, `something_else`
- CF `cancelRouting.ts` switch cases: `not_using`, `no_results`, `too_expensive`, `switched_tool`, `other`
- The mismatch means `not_using_consistently` and `didnt_see_results` will fall through to the `default` case (`"other"`) in the CF, getting routed as `"support_text"` instead of `"pause"` / `"support"` respectively.
- Fix: Align IDs between Flutter and CF. Add a shared constants file or document the contract.

---

## GAP RECOVERY FLOW

### Screen: mark_intentional_sheet.dart

**[P1] Intentional reason options not shown with explanatory copy**
- Users select `lunch`, `buffer`, `personal`, or `other` but there's no explanation that selecting this creates a recurring rule for this time slot in future syncs.
- Fix: Add a one-line explanation per option and a note about the recurring rule.

---

## GENERAL / CROSS-CUTTING UX ISSUES

**[P0] Messages nav badge hardcoded to 3 — static value regardless of real data**
- `app_shell.dart:38`: `badge: 3` — always shows "3" unread messages. No real-time data.
- Fix: Replace with a provider-driven value or hide badge until Messages backend exists.

**[P1] `MainNavigationDrawer` exists but its contents are not audited**
- The drawer is rendered in `DashboardPage` and `SettingsPage`. Its nav items need to match the bottom nav and not duplicate/contradict route destinations.

**[P1] No deep-link handling from push notifications**
- `NotificationService.onNotificationDismissed` is used as the "Open" button callback in the foreground SnackBar (`main.dart:233`). The callback appears to be a dismiss handler, not a navigation handler.
- Users tapping the "Open" button on a push notification snackbar will dismiss it without navigating to the relevant gap.
- Fix: Parse `RemoteMessage.data` (type field) and navigate to the appropriate screen.

**[P2] Accessibility: no semantic labels on icon buttons throughout the app**
- Icon buttons (`Icons.ios_share_rounded`, `Icons.bar_chart_rounded`, etc.) have `tooltip` set in some places but not all. Screen reader users will hear "button" with no context.
- Fix: Audit all `IconButton` widgets and ensure `tooltip` is set consistently.

**[P2] No error boundary at the app level**
- If any provider throws during initialization, the `_RootFlowState.build()` error handler just routes to `AppShell` (`main.dart:268-269`): `error: (_, __) => const AppShell()`. This silently swallows initialization errors.
- Fix: Show a user-friendly error state if `onboardingCompleteProvider` errors.
