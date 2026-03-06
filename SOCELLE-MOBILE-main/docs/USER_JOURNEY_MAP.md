# Socelle Pro — Complete User Journey Map

**Generated:** 2026-02-25
**Source:** Full codebase analysis — `apps/mobile/lib/`
**Scope:** Every navigable path in the current build

---

## Legend

```
→      Normal navigation (push/replace)
⇢      Tab switch (no push)
↩      Pop / dismiss
[ ]    Screen or sheet
{ }    State condition or branch
⚠️     Awkward transition
🔴     Dead end — user is stuck or stranded
🟡     Missing step — logic gap or broken link
🔵     Stubbed / unreachable (feature-flagged off)
```

---

## Flow 0 — Cold Launch

```
App opens
    │
    ├─ [Splash Screen]  ← Firebase + RevenueCat SDK init
    │      │
    │      │  {AsyncLoading → onboardingCompleteProvider}
    │      │
    │      ├─ onboarding == false  →  [Onboarding Page]           → see Flow 1
    │      ├─ onboarding == true   →  [App Shell]                 → see Flow 3
    │      └─ init error           →  [App Shell]  (defaults in)
    │
```

> **No error screen exists for init failure.** The app silently falls through
> to App Shell on any exception during Firebase init. If Firestore or Auth is
> broken, the user arrives at an unsynced shell with no explanation.

---

## Flow 1 — First-Time Onboarding

```
[Onboarding Page]  →  [OnboardingFlow — PageView, 3 screens]
    │
    ├─ SCREEN 1: Hook ("See what your calendar is hiding")
    │      │
    │      ├─ "Connect Google Calendar"
    │      │       │
    │      │       ├─ {OAuth succeeds}  →  _isGoogleConnected = true  →  Screen 2
    │      │       │
    │      │       └─ {OAuth fails / user cancels}
    │      │               │
    │      │               🔴 DEAD END — no error message shown, no fallback CTA.
    │      │               User is stuck on Screen 1 with the same two buttons.
    │      │               There is no "Try again" label or explanation.
    │      │               Fix: show inline error + "Try again" state.
    │      │
    │      └─ "I'll estimate manually"
    │              │
    │              └─ _isManualMode = true  →  Screen 2
    │
    │
    ├─ SCREEN 2: Input
    │      │
    │      │  {if Google connected AND not manual mode}
    │      │       └─ [GoogleSuccessState] — provider profile, booking value, hours
    │      │
    │      │  {if manual mode OR Google not connected}
    │      │       └─ Manual form — booking value, slot duration, working hours
    │      │
    │      ├─ [SkipButton]
    │      │       └─ Skips to next screen without saving input
    │      │               ⚠️  AWKWARD — "Skip" on a form with no data entered jumps
    │      │               to the leakage reveal with $0 in leakage. The reveal screen
    │      │               shows "You're losing $0/month" which is confusing and
    │      │               undermines the value proposition before the user even starts.
    │      │
    │      └─ "Continue" → Screen 3
    │
    │
    └─ SCREEN 3: Revenue Reveal
           │
           ├─ Animated leakage counter ($0 → estimated monthly leakage)
           │
           ├─ "Start recovering" → _completeOnboarding()
           │       │
           │       ├─ Saves settings to SharedPreferences
           │       ├─ setOnboardingComplete() = true
           │       ├─ Invalidates userSettingsProvider + onboardingCompleteProvider
           │       └─ Navigator.pushReplacement()  →  [App Shell]
           │
           └─ ← BACK
                   ⚠️  AWKWARD — pressing back from Screen 3 returns to Screen 2.
                   The PageView has no back-button guard. User can accidentally
                   navigate back and re-edit, then "Continue" again — which re-saves
                   settings and re-shows the reveal. This is fine functionally but
                   the animated counter re-fires which looks broken.
```

---

## Flow 2 — Returning User Launch

```
App opens
    │
    [Splash]  →  onboarding == true  →  [App Shell]
                                              │
                                              ├─ {syncResultProvider auto-evaluates}
                                              │       │
                                              │       ├─ last sync > 4 hours ago AND
                                              │       │   calendar configured  →  auto-sync fires
                                              │       └─ otherwise  →  uses cached data
                                              │
                                              └─ Lands on Revenue Tab (index 0)  →  see Flow 3
```

---

## Flow 3 — App Shell (Main Navigation)

```
[App Shell]  —  IndexedStack, 3 tabs always mounted
    │
    ├─ Tab 0: Revenue    →  see Flow 4
    ├─ Tab 1: Schedule   →  see Flow 5
    └─ Tab 2: Settings   →  see Flow 7
```

> **No deep links from push notifications.** Notification taps open the app
> but always land on Revenue Tab regardless of notification content.
> (Phase 10 backlog — but creates confusing UX today for any user receiving
> gap-specific notifications.)

---

## Flow 4 — Revenue Tab

```
[Revenue Page]
    │
    ├─ {AsyncLoading}  →  [_RevenueSkeleton]  (pulse animation)
    │
    ├─ {AsyncError}    →  [_RevenueEmptyState]
    │       🔴 DEAD END — the error empty state has no retry button.
    │       User sees a broken state with no action to recover.
    │       Fix: add "Try syncing again" CTA that calls syncResult.refresh().
    │
    └─ {AsyncData}
            │
            ├─ {calendarSource not set / no sync data}
            │       └─ [Empty State — "Connect your calendar"]
            │               │
            │               └─ "Connect Calendar" button
            │                       ⇢  Sets navigationIndexProvider = 2
            │                       ⇢  [Settings Tab]
            │                               🟡 MISSING STEP — navigates to Settings tab
            │                               root, not directly to the calendar connection
            │                               card. User has to scroll to find it.
            │                               Fix: scroll-to or highlight calendar card
            │                               on arrival, or use an anchor index.
            │
            └─ {has sync data}
                    │
                    ├─ [Leakage Hero Card]
                    │       └─ [Recovered Badge]
                    │               🔴 DEAD END — badge is display-only. No tap action,
                    │               no detail view, no history of what was recovered.
                    │
                    ├─ [Weekly Bar Chart]  (day-of-week leakage breakdown)
                    │       🔴 DEAD END — bars are not tappable. No drill-down to
                    │       see which gaps drove leakage on a given day.
                    │
                    ├─ {highestValueWindow != null}
                    │       └─ [Highest Value Window Card]
                    │               🔴 DEAD END — card is display-only. No CTA to
                    │               act on the window (e.g. "Fill this slot").
                    │               Should link to the specific gap on Schedule tab.
                    │
                    ├─ {aiSuggestion != null}
                    │       └─ [AI Recovery Suggestion Card]
                    │               🔴 DEAD END — card is display-only. No action.
                    │               The suggestion says things like "You have a
                    │               Thursday 2pm open" but tapping nothing happens.
                    │               Fix: CTA that opens that specific gap's action sheet.
                    │
                    ├─ [Trial Badge]  (if trial active)
                    │       └─ Countdown urgency levels: calm → warning → critical
                    │               🟡 MISSING STEP — badge is not tappable.
                    │               A critical-urgency badge ("Trial ends tomorrow")
                    │               should open PaywallPage directly.
                    │
                    ├─ [Paywall Trigger Card]  (if trigger fires)
                    │       └─ Tap  →  [PaywallPage]  →  see Flow 6
                    │
                    └─ "Review Gaps" button
                            ⇢  Sets navigationIndexProvider = 1
                            ⇢  [Schedule Tab]
                                    ⚠️  AWKWARD — simple tab switch with no context.
                                    User pushed "Review Gaps" and arrives at the
                                    full gap list sorted by date, not by value.
                                    The highest-value gap the card was referencing
                                    is not highlighted or scrolled-to.
```

---

## Flow 5 — Schedule Tab

```
[Schedule Page]
    │
    ├─ {AsyncLoading}  →  [_ScheduleSkeleton]
    │
    ├─ {AsyncError}    →  [_ScheduleEmptyState — "Try syncing again"]
    │
    └─ {AsyncData}
            │
            ├─ {syncResult == null OR no gaps this week}
            │       └─ [Empty State — "No gaps detected"]
            │               🟡 MISSING STEP — no distinction between:
            │               (a) calendar not connected → CTA to connect
            │               (b) calendar connected but fully booked → celebrate it
            │               (c) calendar connected but sync failed silently
            │               All three show the same empty message.
            │
            └─ {has gaps}
                    │
                    ├─ [Recovered Revenue Summary]  (top of list)
                    │
                    ├─ [Gap Cards, grouped by day]
                    │       │
                    │       └─ Tap any gap card
                    │               ↓
                    │       showModalBottomSheet → [GapActionSheet]
                    │               │
                    │               ├─ {gap.status == OPEN}
                    │               │       │
                    │               │       ├─ "Text a Client"
                    │               │       │       └─ FillSlotFlow.start()
                    │               │       │               ↓
                    │               │       │       SharePlus.share(composedMessage)
                    │               │       │               ↓
                    │               │       │       ⚠️  AWKWARD — native share sheet opens.
                    │               │       │       If user dismisses share WITHOUT sending,
                    │               │       │       the "Did you fill this slot?" dialog
                    │               │       │       still immediately appears. There is no
                    │               │       │       detection of whether a share actually
                    │               │       │       occurred. User has to answer "No" to get
                    │               │       │       out of it, which feels broken.
                    │               │       │               ↓
                    │               │       │       showDialog: "Did you fill this slot?"
                    │               │       │               │
                    │               │       │               ├─ "Yes" → API update (FILLED)
                    │               │       │               │           │
                    │               │       │               │     addRecoveredRevenue()
                    │               │       │               │     setFirstRecoveryDate()
                    │               │       │               │     incrementRecoveredGapCount()
                    │               │       │               │           ↓
                    │               │       │               │   Navigator.push → [RecoveryConfirmation]
                    │               │       │               │           │
                    │               │       │               │   Haptics → counter anim → 2.5s auto-dismiss
                    │               │       │               │           ↓
                    │               │       │               │   Navigator.pop()  →  [Schedule Page]
                    │               │       │               │           ⚠️  AWKWARD — user ends up on
                    │               │       │               │           Schedule but the GapActionSheet
                    │               │       │               │           was already dismissed before the
                    │               │       │               │           share dialog. Stack is:
                    │               │       │               │           Schedule → RecoveryConfirmation.
                    │               │       │               │           After pop: Schedule. This is
                    │               │       │               │           fine but the multi-sheet layering
                    │               │       │               │           is hard to mentally track.
                    │               │       │               │
                    │               │       │               └─ "No"  →  dialog dismissed
                    │               │       │                               ↩  Back to Schedule
                    │               │       │                               🔴 DEAD END — gap is not
                    │               │       │                               marked, share happened, nothing
                    │               │       │                               was recorded. Gap sits open.
                    │               │       │                               No way to go back and fill it
                    │               │       │                               unless user re-opens the card.
                    │               │       │
                    │               │       ├─ "Mark as Filled"
                    │               │       │       │
                    │               │       │       └─ API call (FILLED, no message)
                    │               │       │               ↓
                    │               │       │       Snackbar: "Gap marked as filled" + [Undo]
                    │               │       │               ↩  GapActionSheet auto-dismisses
                    │               │       │               ⚠️  AWKWARD — no RecoveryConfirmation
                    │               │       │               shown here (only shown via FillSlotFlow).
                    │               │       │               "Mark as Filled" and "Text a Client →
                    │               │       │               Yes" produce different post-fill UX
                    │               │       │               even though both fill the same gap.
                    │               │       │               One feels rewarding, one feels dry.
                    │               │       │
                    │               │       └─ "Mark as Intentional"
                    │               │               │
                    │               │       showModalBottomSheet → [MarkIntentionalSheet]
                    │               │               │
                    │               │               ├─ "Lunch break"    ┐
                    │               │               ├─ "Buffer time"    │  → API call (INTENTIONAL)
                    │               │               ├─ "Personal time"  │    → haptic feedback
                    │               │               └─ "Other"          ┘    → Navigator.pop()
                    │               │                                            → Snackbar + undo
                    │               │                       ⚠️  AWKWARD — MarkIntentionalSheet
                    │               │                       dismisses back to GapActionSheet,
                    │               │                       which is then still open underneath.
                    │               │                       User needs a second dismiss to fully
                    │               │                       close the flow. Consider closing both
                    │               │                       sheets in one step.
                    │               │
                    │               └─ {gap.status == FILLED or INTENTIONAL}
                    │                       │
                    │                       └─ Shows status card + "Undo" button
                    │                               🟡 MISSING STEP — undo is available inside
                    │                               GapActionSheet but the snackbar undo
                    │                               (from the initial action) and the in-sheet
                    │                               undo are two separate mechanisms. If the
                    │                               snackbar expired, the only undo path is
                    │                               re-opening the gap card. No clear affordance.
                    │
                    └─ [Pull-to-Refresh]  →  syncResult.refresh()  →  re-sync
```

---

## Flow 6 — Paywall

```
[PaywallPage]
  Entry points:
    A. Settings → "Subscription" tile
    B. CancelInterceptPage → "too_expensive" path → "Switch to Annual"
    C. Revenue tab → PaywallTrigger card tap

    │
    ├─ {trigger-specific hero copy + badge}
    │       e.g. "Stop the Leak" / "Keep Your Streak" / "Continue"
    │
    ├─ [Plan Selector]
    │       ├─ Annual  ($249.99/year)   ← default selected
    │       └─ Monthly ($29.99/month)
    │
    ├─ "Start 7-Day Trial"
    │       │
    │       └─ subscriptionProvider.startTrial()
    │               ↓
    │       Navigator.pop()  →  back to entry point
    │       Snackbar: "Your 7-day free trial has started!"
    │               ⚠️  AWKWARD (entry point B) — user is now:
    │               CancelInterceptPage → ExitSurveySheet (dismissed) →
    │               RetentionDialog (dismissed) → PaywallPage (popped).
    │               They are back on CancelInterceptPage with a trial active.
    │               Nothing has changed visually on that page.
    │               They need to manually back out — 2 more taps to exit.
    │               Fix: after trial start, pop ALL the way to Settings.
    │
    ├─ "Restore purchase"
    │       └─ subscriptionProvider.restorePurchases()
    │               🟡 MISSING STEP — no loading indicator during restore.
    │               RevenueCat restore is async but the button has no
    │               disabled/loading state. User may tap multiple times.
    │
    └─ External links  →  url_launcher (Terms / Privacy)
            🟡 MISSING STEP — no in-app WebView or graceful handling
            if url_launcher fails on a device with no browser.
```

---

## Flow 7 — Settings Tab

```
[Settings Page]
    │
    ├─ [Booking Value Editor]      (inline edit, auto-saves)
    ├─ [Slot Duration Picker]      (inline edit, auto-saves)
    ├─ [Working Hours Editor]      (inline edit, auto-saves)
    │
    ├─ [Calendar Section]
    │       │
    │       ├─ {calendarSource == 'google'}
    │       │       └─ [CalendarConnectionCard]
    │       │               ├─ Shows connected status
    │       │               └─ "Disconnect" → confirmation dialog → revoke + update state
    │       │
    │       └─ {calendarSource == 'apple' or unset}
    │               └─ [AppleSyncCard]  — info banner only
    │                       🟡 MISSING STEP — no "Connect Apple Calendar" button.
    │                       The Apple card is informational only. User reads it but
    │                       has no action to take. Apple Calendar is connected
    │                       implicitly via device permissions, not an explicit flow.
    │                       This is architecturally correct but confusing for new users
    │                       who don't know it auto-reads their device calendar.
    │
    ├─ [Notification Frequency]    (radio selector, auto-saves)
    │
    ├─ [Provider Type & Growth Goal]
    │
    ├─ "Subscription" tile
    │       └─ Navigator.push  →  [PaywallPage]  →  see Flow 6
    │
    ├─ "Cancel Subscription" section
    │       {only shown if subscription.isActive OR subscription.isTrial}
    │       └─ Navigator.push  →  [CancelInterceptPage]  →  see Flow 8
    │
    ├─ "Support" tile
    │       └─ Navigator.push  →  [SupportPage]
    │               ├─ Email deep link (mailto:)
    │               └─ Clipboard fallback
    │                       🟡 MISSING STEP — no in-app chat, no ticket creation.
    │                       Mailto may silently fail on devices with no mail client.
    │
    └─ "Log Out" button
            │
            └─ showDialog: "Are you sure?"
                    │
                    ├─ "Cancel"  →  dialog dismissed
                    │
                    └─ "Log Out"
                            │
                            ├─ Firebase signOut()
                            ├─ Firebase signInAnonymously() ← re-auths as new anon user
                            ├─ Resets navigationIndexProvider = 0
                            └─ Navigator pops to root
                                    │
                                    🔴 DEAD END / DATA LOSS — user is now an anonymous
                                    account with zero data. All their gap history,
                                    settings, and recovered revenue are orphaned on
                                    the old UID. There is NO warning about this before
                                    confirming log out.
                                    BUG-004 is the underlying cause. Until Google
                                    Sign-In linking (Phase 9, Task 9.5) is built,
                                    any user who logs out loses everything permanently.
                                    Fix (interim): disable Log Out entirely OR add a
                                    hard warning: "Logging out will permanently delete
                                    your data unless you've linked a Google account."
```

---

## Flow 8 — Cancellation

```
[CancelInterceptPage]
    │
    ├─ Shows: recovered revenue, weekly leakage, open gaps
    │
    ├─ "Tell us what's not working"
    │       ↓
    │   showModalBottomSheet → [ExitSurveySheet]
    │       │
    │       └─ Returns selected reason (or null if dismissed)
    │               │
    │               ├─ {reason == null}  →  nothing happens (sheet dismissed)
    │               │       🔴 DEAD END — if user swipes down to dismiss the survey
    │               │       without selecting a reason, they return to
    │               │       CancelInterceptPage with no visual change. The
    │               │       "Tell us what's not working" button is still there.
    │               │       No acknowledgment that they dismissed it.
    │               │
    │               ├─ not_using_consistently
    │               │       └─ showDialog: "Take a break instead?"
    │               │               ├─ "Keep my account"  →  dialog dismissed
    │               │               │       ↩  Back to CancelInterceptPage
    │               │               └─ "Cancel anyway"   →  _cancelAnyway()
    │               │                       └─ [see cancel sequence below]
    │               │
    │               ├─ didnt_see_results
    │               │       └─ showDialog: "That's on us to fix"
    │               │               ├─ "Talk to us" → mailto: support link
    │               │               │       ⚠️  AWKWARD — opens email client in
    │               │               │       external app. User leaves Socelle Pro
    │               │               │       entirely. On return, they're still on
    │               │               │       CancelInterceptPage with cancellation pending.
    │               │               └─ "Cancel anyway"  →  _cancelAnyway()
    │               │
    │               ├─ too_expensive
    │               │       └─ showDialog: "Switch to Annual — save 30%"
    │               │               ├─ "Switch to Annual"
    │               │               │       └─ Navigator.push → [PaywallPage]
    │               │               │               ⚠️  AWKWARD — see Flow 6 entry B note.
    │               │               │               After subscribing, user is back on
    │               │               │               CancelInterceptPage which no longer
    │               │               │               makes sense. They just upgraded, but
    │               │               │               the cancellation screen is still showing.
    │               │               │
    │               │               └─ "Cancel anyway"  →  _cancelAnyway()
    │               │
    │               ├─ switched_tool  →  _cancelAnyway() directly (no dialog)
    │               │
    │               └─ something_else  →  _cancelAnyway() directly (no dialog)
    │
    ├─ "Cancel anyway" button (bottom of page)
    │       └─ _cancelAnyway():
    │               ├─ subscriptionProvider.cancelSubscription()
    │               ├─ Navigator.popUntil(ModalRoute.withName('/'))
    │               └─ ScaffoldMessenger.showSnackBar("Subscription cancelled")
    │                       ⚠️  AWKWARD — popUntil goes back to AppShell root.
    │                       User lands on Revenue tab (index 0). The snackbar
    │                       briefly shows. No confirmation screen, no "here's what
    │                       you still have access to until X date", no offboarding.
    │                       Cancellation deserves a dedicated post-cancel state.
    │
    └─ ← BACK  →  Navigator.pop()  →  [Settings Page]
```

---

## Flow 9 — Paywall Triggers (Background)

These trigger evaluations run passively and surface within Revenue Tab.

```
PaywallTriggerNotifier — runs on Revenue tab rebuild
    │
    ├─ {user is NOT free or trial}  →  no trigger fires (subscribed users exempt)
    │
    └─ {user is free or trial}
            │
            ├─ Check 1: cumulative leakage ≥ $200
            │       Fires: PaywallTrigger.cumulativeLeakage
            │
            ├─ Check 2: firstRecoveryDate exists AND ≥ 24h ago
            │       Fires: PaywallTrigger.firstRecovery
            │
            ├─ Check 3: shareSheetUseCount ≥ 3
            │       Fires: PaywallTrigger.repeatedShareUse
            │
            ├─ Check 4: missedHighProbGapValue != null
            │       Fires: PaywallTrigger.missedHighProbGap
            │
            └─ Check 5: trial ≤ 2 days remaining AND recoveredGapCount ≥ 2
                    Fires: PaywallTrigger.trialEndWithRecovery

    Once fired → markTriggerSeen() → suppressed for rest of session

    🟡 MISSING STEP — trigger suppression is session-only via in-memory
    markTriggerSeen(). If the app is killed and relaunched, the same
    trigger can fire again. The fired_paywall_triggers key in
    SharedPreferences stores the set, but there is no expiry mechanism.
    A user who has seen the leakage trigger 10 times will keep seeing it
    on every cold launch until they subscribe.
    Fix: record trigger-shown timestamps and enforce a cooldown (e.g. 24h).
```

---

## Flow 10 — Returning User Re-engagement (Server-Side)

These flows are initiated by Cloud Functions, not user action.

```
Firebase Cloud Functions  →  FCM push notifications
    │
    ├─ Monday 7:45–8:15 AM (user's local TZ): Planning push
    ├─ Thursday: Momentum check push
    ├─ Tier 1 (4–7 days inactive): Re-engagement push
    ├─ Milestones: First recovery, 5-gap recovery, 7-day streak, personal best week
    │
    └─ User taps notification
            │
            🟡 MISSING STEP — all notification taps open the app to
            Revenue Tab (index 0) regardless of notification content.
            A "You have a high-value gap today" notification should open
            Schedule Tab or the specific gap card.
            Phase 10 backlog item — but creates confusing UX today.
            Fix: implement deep links via notification data payload.
```

---

## Flow 11 — Unreachable / Dormant Screens

All of these are feature-flagged off (`FeatureFlags.k* = false`).
**They are unreachable from any user path.**

```
🔵  Studio Page       — kEnableStudio = false
🔵  Shop Page         — kEnableShop = false
🔵  Messages Page     — kEnableMessages = false
🔵  Weekly Summary    — kEnableShare = false (hidden, linked from nowhere)
🔵  Share / Snapshot  — kEnableShare = false
🔵  Streaks display   — kEnableStreaks = false (streak logic runs but is hidden)
```

> ⚠️ **Note on Streaks:** The streak engine is fully computing (streak_provider.dart,
> streak.dart) and recording every gap action. The data exists and grows — but the
> user never sees it. The streak badge in the dashboard is hidden. When streaks are
> eventually enabled, users may have a 30+ day streak they never knew about, which
> is actually a great reveal moment — but it also means the streak "grace period save"
> mechanic is silently consuming the user's one-per-month save without their knowledge.

---

## Complete Issue Index

### 🔴 Dead Ends (user is stuck or has nowhere to go)

| # | Location | Issue | Fix |
|---|----------|-------|-----|
| D-01 | Onboarding Screen 1 | Google OAuth failure gives no feedback, no fallback CTA | Show inline error + "Try again" state |
| D-02 | Revenue Tab | Async error state has no retry CTA | Add "Try syncing again" that calls `syncResult.refresh()` |
| D-03 | Revenue Tab | Recovered Badge is display-only — no tap action or detail | Link to recovery history or a summary state |
| D-04 | Revenue Tab | Weekly bar chart bars are not tappable | Drill-down to gaps for that day, or leave intentionally and document |
| D-05 | Revenue Tab | Highest Value Window card has no action CTA | Add "Fill this slot" → opens gap action sheet for that gap |
| D-06 | Revenue Tab | AI Suggestion card has no action CTA | Add CTA linking to the referenced gap |
| D-07 | Schedule Tab | "Text a Client" → user dismisses share → "Did you fill?" fires anyway | Gate the dialog on share completion or add context |
| D-08 | Schedule Tab | After "Text a Client → No", gap remains open with no easy re-action | Gap card should stay accessible; consider returning focus to it |
| D-09 | Settings Tab | Log Out destroys all data with no warning | Disable button OR add "data will be lost" hard warning until BUG-004 is fixed |
| D-10 | Cancellation | ExitSurveySheet dismissed without selection — silent no-op | Show acknowledgment or re-prompt |

### 🟡 Missing Steps (logic gaps, broken links, incomplete flows)

| # | Location | Issue | Fix |
|---|----------|-------|-----|
| M-01 | Revenue Tab | "Connect Calendar" navigates to Settings tab root, not the calendar card | Scroll-to or highlight the calendar section on arrival |
| M-02 | Revenue Tab | Trial badge (critical urgency) is not tappable | Tapping it should open PaywallPage |
| M-03 | Schedule Tab | Empty state doesn't distinguish: no calendar vs. fully booked vs. sync failed | Three distinct empty state messages |
| M-04 | Settings Tab | Apple Calendar card is informational only — no connect action | Add explanation of implicit device-level connection + permissions link |
| M-05 | Settings Tab | Support mailto fails silently if no mail client | Add clipboard fallback or in-app form |
| M-06 | Paywall | "Restore purchase" has no loading state | Disable button + show spinner during async restore |
| M-07 | Paywall | External links (Terms/Privacy) have no fallback if url_launcher fails | Catch error, show in-app WebView or copy URL |
| M-08 | Cancellation | After subscribing via "too_expensive" path, CancelInterceptPage is still showing | `pop` all the way to Settings after successful subscription start |
| M-09 | Paywall Triggers | Trigger suppression resets on cold launch — no cooldown enforced | Store timestamp of last trigger-shown and enforce 24h cooldown per trigger |
| M-10 | Push notifications | All notification taps land on Revenue tab regardless of content | Implement deep links via notification data payload (Phase 10) |
| M-11 | Streaks | Grace-period save is consumed silently in background | Either surface streaks now or pause the grace-period mechanic until streaks are visible |

### ⚠️ Awkward Transitions (confusing jumps between screens or states)

| # | Location | Issue | Fix |
|---|----------|-------|-----|
| A-01 | Onboarding Screen 3 | Skip with no data → leakage reveal shows "$0/month" — undermines value prop | Require minimum booking value before allowing skip, or show placeholder copy |
| A-02 | Onboarding Screen 3 | Back-navigation re-fires animated counter — looks broken | Guard PageView back-gesture on Screen 3, or re-use last computed value |
| A-03 | Revenue Tab | "Review Gaps" switches tabs without scrolling to or highlighting the most relevant gap | Pass a "highlight" parameter or sort gaps by value |
| A-04 | Schedule Tab | "Text a Client" → share → dialog → RecoveryConfirmation: 4 context-switches | Consider a more linear single-sheet flow for the fill journey |
| A-05 | Schedule Tab | "Mark as Filled" via direct tap gives no celebration; "Text a Client → Yes" gives full RecoveryConfirmation | Unify post-fill UX — both paths should celebrate the recovery |
| A-06 | Schedule Tab | MarkIntentionalSheet dismisses back to GapActionSheet (two-dismiss required) | Close both sheets in a single call when reason is selected |
| A-07 | Paywall (entry B) | After trial start from CancelIntercept, user is dropped back on CancelInterceptPage | Pop all cancellation screens on successful subscription start |
| A-08 | Cancellation | _cancelAnyway() pops to root with a snackbar — no post-cancel moment | Add a dedicated post-cancel screen: "You're on the free plan. Here's what you still have." |
| A-09 | Settings | Log Out re-auths as anonymous immediately — user doesn't know they now have a new account | Show post-logout state clearly: "You're signed out. Your data has been saved to your Google account." (only true once BUG-004 is fixed) |

---

## Priority Ranking (What to Fix First)

These issues affect every user's first session or block core revenue loop actions.

```
CRITICAL (blocks value delivery or causes data loss)
    D-09  Log Out data loss — no warning (BUG-004)
    D-01  Google OAuth failure — silent dead end in onboarding
    M-11  Streak grace-period silently consumed

HIGH (breaks core loop or causes significant confusion)
    A-05  Mark as Filled gives no celebration (inconsistent with Text a Client)
    A-06  MarkIntentional requires two dismisses
    D-05  Highest Value Window has no action
    D-06  AI Suggestion has no action
    M-09  Paywall trigger suppression resets on cold launch

MEDIUM (UX friction, fixable without architectural change)
    M-01  "Connect Calendar" navigates to Settings root not calendar card
    M-02  Trial badge not tappable
    D-07  "Did you fill?" fires even when share was cancelled
    A-07  CancelIntercept persists after trial start
    A-08  Post-cancel screen is missing
    M-03  Schedule empty state not specific enough

LOW (polish / Phase 9 or Phase 10 scope)
    D-03  Recovered Badge not tappable
    D-04  Weekly bars not tappable
    A-01  Skip with no data shows $0 leakage
    A-03  Review Gaps doesn't highlight specific gap
    M-10  Push notification deep links
```

---

*This document was generated from live codebase analysis. Re-run after each phase to keep it current.*
