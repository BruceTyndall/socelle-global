# 02 — Information Architecture & User Flows
> Forensic audit — verified in code — February 2026

---

## Top-Level Information Architecture

```
SLOTFORCE App
│
├── Gate: Onboarding (first launch only)
│   ├── 1. Intro Scene         — product value proposition
│   ├── 2. Provider Profile    — role + name input
│   ├── 3. Booking Value       — avg appointment value ($)
│   ├── 4. Slot Duration       — appointment length (mins)
│   ├── 5. Working Hours       — per-day schedule
│   └── [Leakage Reveal]       — animated "you left $X on the table" moment
│
└── Shell: Authenticated App
    ├── Tab 0 — Dashboard      (primary, lands here by default)
    ├── Tab 1 — Messages       (placeholder UI only — not wired)
    ├── Tab 2 — Shop           (placeholder UI only — not wired)
    └── Tab 3 — Studio         (analytics + campaigns)
        └── Weekly Summary     (pushed from Studio)
```

**Routing model**: Single-navigator, no named routes. Navigation is state-driven via `navigationIndexProvider` (Riverpod StateProvider<int>). Modals use `showModalBottomSheet` and `showDialog`.

---

## Flow 1 — Onboarding (First Launch)

**Entry**: `main.dart` → `_RootFlow` → `onboardingCompleteProvider` returns `false` → renders `OnboardingPage`

**File**: `apps/mobile/lib/features/onboarding/onboarding_page.dart`

```
App Launch
    │
    ▼
[Firebase init + anonymous auth]
    │
    ▼
onboardingCompleteProvider == false?
    │ YES
    ▼
OnboardingPage (PageView, NeverScrollableScrollPhysics)
    │
    ├── Page 0: IntroSceneStep
    │   Content: App value prop, "let's go" CTA
    │   Action: Next
    │
    ├── Page 1: ProviderProfileStep
    │   Content: Name input, role selector (lash artist / nail tech / brow / esthetics / other)
    │   Action: Next
    │
    ├── Page 2: BookingValueStep
    │   Content: Average booking value ($) slider or text field
    │   Note: Used for leakage calculation — critical input
    │   Action: Next
    │
    ├── Page 3: SlotDurationStep
    │   Content: Appointment duration selector (30 / 45 / 60 / 90 / 120 min)
    │   Action: Next
    │
    ├── Page 4: WorkingHoursStep
    │   Content: Day-by-day toggle + start/end time per day
    │   Note: WorkingHours stored as Map<DayKey, WorkingDay>
    │   Action: Next
    │
    └── Page 5: CalendarConnectStep (implicit last step)
        Content: Google / Apple calendar connect options
        Actions:
            ├── Connect Google → GoogleOAuthService.getServerAuthCode()
            │       → storeCalendarTokens CF → success → _completeOnboarding()
            ├── Connect Apple → AppleCalendarService.requestPermissions()
            │       → success → _completeOnboarding()
            └── Skip → _completeOnboarding() (no calendar source saved)

_completeOnboarding():
    1. Save settings to SharedPrefs (SettingsStorage)
    2. Set onboarding_complete = true
    3. Invalidate userSettingsProvider + syncResultProvider
    4. Navigate to: Leakage Reveal screen (animated leakage number)
    5. Then navigate to AppShell (Dashboard tab)
```

**Estimated weekly leakage on reveal**: `avgBookingValue * 2` (hardcoded 2-slot assumption — no real computation at onboarding time).

**Back navigation**: Previous page via `_pageController.previousPage()`. Back on Page 0 = no-op.

---

## Flow 2 — Daily Loop (Core Engagement)

**Entry**: App open → dashboard tab (always restored by `IndexedStack`)

**File**: `apps/mobile/lib/features/dashboard/dashboard_page.dart`

```
Dashboard Opens
    │
    ▼
_autoSyncIfNeeded()
    ├── lastSyncAt == null → trigger sync now
    ├── lastSyncAt > 60 minutes ago → trigger sync now
    └── else → use cached syncResult

syncResultProvider state:
    ├── loading → ShimmerLoadingState (skeleton)
    ├── error → ErrorCard with retry CTA
    └── data (SyncResult) →
            │
            ▼
        LeakageHero (animated counter)
            ├── weeklyLeakage == 0 → "Booked & Dangerous" (green state)
            └── weeklyLeakage > 0 → "$X left on the table" (red counter, animated)

        DailyRitualRow (3 tasks: review / outreach / filled)
            ├── Task checked? → gradient pill + checkmark
            └── Task unchecked → grey pill

        FilterRow (All / Open / Filled / Intentional chips)

        GapList (sorted by start_time ASC)
            └── For each gap → GapCard

GapCard:
    ├── Shows: time range, leakage value ($), urgency tier
    ├── Urgency tiers (Timer.periodic 5min):
    │   ├── tier1: gap starts > 24h away → neutral border
    │   ├── tier2: gap starts 6–24h away → amber border
    │   └── tier3: gap starts < 6h away → red border + pulsing
    └── Tap → GapActionSheet
```

**Monthly leakage calculation**: `weeklyLeakage * 4.3` (displayed on paywall CTA card)

---

## Flow 3 — Gap Action (Primary Action Loop)

**Entry**: Tap GapCard on Dashboard

**Files**:
- `apps/mobile/lib/features/gap_action/gap_action_sheet.dart`
- `apps/mobile/lib/features/gap_action/fill_slot_flow.dart`

```
[GapCard Tap]
    │
    ▼
GapActionSheet (bottom sheet, 85% height)
    │
    ├── Option A: "Text a Client" (primary CTA)
    │       │
    │       ▼
    │   FillSlotFlow
    │       1. Build outreach message from template (gap time, provider name, CTA)
    │       2. SharePlus.share() → iOS/Android native share sheet
    │       3. Increment share count (paywall trigger 3 check)
    │       4. Add gap.leakageValue to cumulative leakage (paywall trigger 1 check)
    │       5. "Did you fill this slot?" dialog (Yes / Not yet)
    │           ├── Yes →
    │           │     updateGapStatus(gapId, "filled") → CF
    │           │     recordStreak()
    │           │     navigate to RecoveryConfirmationScreen
    │           └── Not yet → dismiss, gap stays "open"
    │
    ├── Option B: "Mark as Filled"
    │       │
    │       ▼
    │   updateGapStatus(gapId, "filled")
    │   gap.status mutated locally
    │   recordStreak()
    │   Dashboard refreshes (syncResultProvider invalidated)
    │
    └── Option C: "Mark as Intentional"
            │
            ▼
        MarkIntentionalSheet
            Reason options: Lunch / Buffer / Personal / Other
            Confirm →
                updateGapStatus(gapId, "intentional", reason)
                CF creates intentional_rule in Firestore
                gap.status mutated locally
                Dashboard: gap removed from "open" feed

[Error handling]:
    _updateGapStatus() catches all exceptions → logs → returns false
    UI: no error state shown to user (silent failure — BUG)
```

**Undo**: After marking intentional, an undo button is shown briefly. Undo calls `updateGapStatus(gapId, "open")`.

---

## Flow 4 — Messages (Placeholder)

**File**: `apps/mobile/lib/features/messages/messages_page.dart`

Status: UI scaffold only. No backend wiring. Shows:
- AI reconnect banner (hardcoded copy)
- Inbox filter chips (All / Needs reply / Miss you / VIP)
- Empty conversation list with CTA

**No callable CF for messages.** This tab is a product vision placeholder.

---

## Flow 5 — Shop (Placeholder)

**File**: `apps/mobile/lib/features/shop/shop_page.dart`

Status: UI scaffold only. No backend wiring. Shows:
- Storefront hero card
- Stats row (hardcoded zeros)
- Product category chips
- Empty product grid with "Add product" CTA

**No callable CF for shop.** This tab is a product vision placeholder.

---

## Flow 6 — Studio (Analytics + Campaigns)

**File**: `apps/mobile/lib/features/studio/studio_page.dart`

```
Studio Tab
    │
    ├── Revenue Studio Hero Card
    │   ├── Identity strip (provider name + role)
    │   └── Lifestyle campaign card
    │
    ├── Stats Row (3 tiles)
    │   ├── Open this week (from syncResult.currentWeekGapCount())
    │   ├── Slots to fill (from syncResult.currentWeekBookableSlots())
    │   └── Streak (from streakProvider)
    │
    ├── Momentum Card
    │   └── Weekly fill rate progress bar
    │
    ├── Action Queue (top 3 open gaps by urgency)
    │   └── Each gap → tap → GapActionSheet (same as Dashboard flow)
    │
    ├── AI Spotlight Card
    │   └── Generated campaign copy (from dashboardCampaignDraftProvider)
    │
    ├── Bump Signal Card
    │   └── "Best time to post" — static heuristic copy
    │
    ├── Match Lab Card
    │   └── "Ideal client match" — placeholder
    │
    └── Weekly Summary Button → WeeklySummaryPage (push)

WeeklySummaryPage:
    1. Call getWeeklySummary CF
    2. Show: recovered / leaked / openGaps / intentionalBlocks / nextWeekGapCount
    Note: nextWeekGapCount is WRONG — returns current week open gaps (BUG-003)
```

---

## Flow 7 — Settings

**File**: `apps/mobile/lib/features/settings/settings_page.dart`

```
Settings (pushed from Dashboard top-right icon)
    │
    ├── Profile Section
    │   ├── BookingValueEditor → update avgBookingValue in SharedPrefs → invalidate providers
    │   ├── SlotDurationEditor → update slotDurationMinutes
    │   └── WorkingHoursEditor → update per-day schedule
    │
    ├── Calendar Section (CalendarConnectionCard)
    │   ├── Connected Google → "Disconnect" → revokeCalendarTokens CF + clear local state
    │   ├── Connected Apple → "Disconnect" → clear calendarSource
    │   ├── Connect Google → GoogleOAuthService flow → storeCalendarTokens CF
    │   └── Apple note: "Improvements being finalized" (placeholder — no reconnect flow)
    │
    ├── Notifications Section
    │   └── NotificationFrequencyWidget → updateNotificationFrequency CF
    │
    ├── Subscription Section
    │   ├── Active → shows plan, renewal date
    │   └── Free / Trial → "Upgrade" → PaywallPage
    │
    ├── Cancel Subscription → CancelInterceptPage
    │
    ├── Support → SupportPage
    │
    ├── Referral Card
    │   └── "Refer a friend" → SharePlus.share() with referral link
    │
    └── Log Out
            → FirebaseAuth.signOut()
            → FirebaseAuth.signInAnonymously()  ← NEW anon account (BUG: data loss)
            → Clear all SharedPrefs
            → Navigate to OnboardingPage
```

---

## Flow 8 — Paywall

**Files**:
- `apps/mobile/lib/features/paywall/paywall_page.dart`
- `apps/mobile/lib/providers/paywall_trigger_provider.dart`
- `apps/mobile/lib/features/paywall/paywall_trigger_resolver.dart`

```
Paywall Triggers (evaluated in order, first match wins):

Trigger 1: Cumulative leakage ≥ $200 (A/B variant: may be $150)
    Source: paywallTriggerProvider watching fillSlotFlow leakage accumulation

Trigger 2: First recovery (24h delay)
    Source: paywallTriggerProvider checking firstRecoveryDate in SharedPrefs

Trigger 3: Repeated share use (≥ 3 share-sheet opens)
    Source: shareCount in SharedPrefs, incremented in fillSlotFlow

Trigger 4: Missed high-probability gap
    Source: missedHighProbGap flag in SharedPrefs (set when gap expires unfilled)

Trigger 5: Trial end with recovery (≤ 2 days left + ≥ 2 gaps filled)
    Source: subscription state + recoveredGapCount in SharedPrefs

PaywallPage:
    ├── Hero: contextual copy from PaywallTriggerResolver.resolve(trigger)
    │         Maps trigger type → heroLabel + heroValue + subText + ctaLabel
    │
    ├── Plan Cards:
    │   ├── Annual: $249/yr (saves ~30%)
    │   └── Monthly: $29/mo
    │
    ├── CTA: "Start Free Trial" (7 days)
    │   → _startTrial()
    │       → subscriptionProvider.notifier.startTrial()  ← LOCAL ONLY, no RevenueCat
    │       → navigate to AppShell
    │   CRITICAL BUG: No RevenueCat purchase sheet opened
    │
    ├── Restore Purchase → no-op (onPressed: () {})
    ├── Terms → no-op
    └── Privacy → no-op
```

---

## Flow 9 — Cancellation / Retention

**File**: `apps/mobile/lib/features/settings/cancel_intercept_page.dart`

```
"Cancel Subscription" tapped in Settings
    │
    ▼
CancelInterceptPage
    ├── Shows: recovered / leakage / open gaps summary
    │   Note: weeklyLeakage passed as 0 (BUG-013)
    │
    ├── Primary CTA: "Keep my subscription" → pop
    │
    └── Secondary: "Still cancel..." → ExitSurveySheet

ExitSurveySheet (reason picker):
    ├── not_using
    ├── no_results
    ├── too_expensive
    ├── switched_tool
    └── other

submitCancellation CF routing:
    ├── not_using → pause flow (email: "take a break")
    ├── no_results → support queue (high-touch follow-up)
    ├── too_expensive → annual plan offer
    ├── switched_tool → clean exit (competitor logged internally)
    └── other → support text

_cancelAnyway():
    → subscriptionProvider.notifier.cancelSubscription()  ← LOCAL ONLY
    → pop settings to dashboard
```

---

## Navigation State Machine

```
State: onboardingComplete = false
    → OnboardingPage
    → [complete] → AppShell

State: AppShell loaded
    → navigationIndexProvider = 0 → Dashboard
    → navigationIndexProvider = 1 → Messages
    → navigationIndexProvider = 2 → Shop
    → navigationIndexProvider = 3 → Studio

Modals (don't change navigationIndexProvider):
    → Gap card tap → GapActionSheet (showModalBottomSheet)
    → Fill slot → FillSlotFlow (Navigator.push or showDialog)
    → Mark intentional → MarkIntentionalSheet (showModalBottomSheet)
    → Weekly summary → WeeklySummaryPage (Navigator.push)
    → Paywall → PaywallPage (Navigator.push, full-screen)
    → Cancel intercept → CancelInterceptPage (Navigator.push)
    → Settings → SettingsPage (Navigator.push)
```

---

## Deep Link / Notification Tap Flow

**File**: `apps/mobile/lib/services/notification_service.dart`

Currently: `_handleNotificationTap()` logs an analytics event (`notification_tapped`) but does **not** navigate anywhere. There is no deep-link routing from notifications.

**Expected**: Tapping a gap notification should open GapActionSheet for that specific gap. This requires passing `gapId` in the FCM notification payload and routing to it on tap.

