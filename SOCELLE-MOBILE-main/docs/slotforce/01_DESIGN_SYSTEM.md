# 01 — SLOTFORCE Design System
> Standard for the full UI/UX rebuild — February 2026

---

## Design Principles

### 1. Money-first
Every screen has one financial number visible above the fold. Lost revenue is shown in dollars, not percentages or abstract scores. The number is always present, always honest, never hidden behind a tap.

### 2. Operator-simple
A lash artist or nail tech using this app between clients has 90 seconds and one free hand. Navigation is 4 taps maximum to any action. No jargon. No dashboards with 12 widgets. One job per screen.

### 3. Fast and calm
Transitions are smooth but instant. No loading spinners unless unavoidable. Skeleton screens over empty white. No gratuitous animation. The app feels like premium software, not a game.

### 4. Loss-framed, not shamey
Copy quantifies what was missed ("You left $340 on the table this week") but never blames ("You've been lazy"). Every loss message has an adjacent action. No loss without an exit.

### 5. Trust through transparency
Show the user exactly how we calculate their number. "Based on 60-min slots at $85 avg" appears near every leakage figure. No mystery math.

### 6. Accessible by default
44px minimum tap targets. WCAG AA contrast ratios enforced. All interactive elements labelled with `Semantics`. Form errors announced. Keyboard-safe on web.

### 7. Mobile-first, web-tolerant
Primary experience is iOS/Android portrait. Web (for demos and sharing) uses the same layout but with `max-width: 430px` centering. No separate web layout needed.

---

## Navigation Model

**4-tab bottom navigation** — `IndexedStack` preserving scroll position per tab.

```
[ Dashboard ]  [ Messages ]  [ Shop ]  [ Studio ]
```

| Tab | Icon | Purpose |
|-----|------|---------|
| Dashboard | `dashboard_rounded` | Primary loop: leakage + gap feed + daily ritual |
| Messages | `chat_bubble_rounded` | Client re-engagement + inbox + AI suggestions |
| Shop | `store_rounded` | Creator storefront + product grid |
| Studio | `auto_graph_rounded` | Revenue studio + campaigns + weekly insights |

Navigation rules:
- Active tab indicator: `glamHeroGradient` (plum → bordeaux → champagne gold) pill background
- Inactive: icon + label, `slateGrey` color
- Badge (red pill, white text) on Messages for unread count
- Tab switch fires `HapticFeedback.selectionClick()`
- Bottom nav height: 72px including safe area

**Modal navigation** (push over shell):
- Gap detail → action sheet: bottom sheet, 85% height
- Paywall: full-screen push
- Onboarding: replaces root
- Settings: push from any tab (accessible via top-right icon on Dashboard)

---

## Screen Hierarchy

```
Root
├── Splash (loading)
├── Onboarding (gates app shell)
│   ├── Intro Scene
│   ├── Provider Profile
│   ├── Working Hours
│   ├── Booking Value
│   ├── Calendar Connect
│   └── Leakage Reveal
└── App Shell (authenticated)
    ├── Dashboard
    │   ├── Leakage Hero
    │   ├── Daily Money Ritual
    │   ├── Gap Feed
    │   │   └── Gap Card → Gap Action Sheet
    │   │       ├── Fill Slot Flow → Recovery Confirmation
    │   │       └── Mark Intentional Sheet
    │   └── Benchmark Card
    ├── Messages
    │   ├── AI Reconnect Banner
    │   ├── Inbox Filters (All / Needs reply / Miss you / VIP)
    │   ├── Conversation List
    │   └── Chat Thread
    │       └── AI Suggestion Strip
    ├── Shop
    │   ├── Storefront Hero
    │   ├── Stats Row
    │   ├── Category Filter Chips
    │   ├── Product Grid
    │   └── Add Product Sheet
    └── Studio
        ├── Revenue Studio Card
        ├── Lifestyle Campaigns
        ├── Stats Row
        └── Weekly Summary Page (push)
```

---

## Typography Scale

Base: System font stack (`-apple-system`, `SF Pro`, `Roboto`)

| Token | Size | Weight | Line height | Usage |
|-------|------|--------|-------------|-------|
| `display` | 36px | 800 | 1.1 | Hero numbers ($1,240) |
| `headlineLarge` | 28px | 700 | 1.2 | Page titles |
| `headlineMedium` | 22px | 700 | 1.3 | Section headers |
| `titleLarge` | 18px | 600 | 1.4 | Card titles |
| `titleMedium` | 16px | 600 | 1.4 | List item primary |
| `bodyLarge` | 15px | 400 | 1.5 | Body copy |
| `bodyMedium` | 14px | 400 | 1.5 | Secondary text |
| `labelLarge` | 14px | 600 | 1.2 | Buttons, badges |
| `labelMedium` | 12px | 500 | 1.2 | Tags, chips |
| `caption` | 11px | 400 | 1.3 | Timestamps, footnotes |

Letter spacing:
- `display`, `headline`: -0.5px
- `label`, uppercase: +1.5px

---

## Spacing System (4px base grid)

```
2px  — micro gap (icon to label)
4px  — xs
8px  — sm
12px — md-sm
16px — md  (standard card padding)
20px — md-lg
24px — lg  (section spacing)
32px — xl
40px — xxl
48px — page top padding
```

Standard card padding: `EdgeInsets.all(16)`
Page horizontal padding: `EdgeInsets.symmetric(horizontal: 16)`
Section vertical gap: `24px`

---

## Color Palette

Source: `apps/mobile/lib/core/theme/slotforce_colors.dart`

### Brand Gradients
```dart
glamHeroGradient: LinearGradient(
  colors: [glamPlum, bordeaux, champagneGold],
  stops: [0.0, 0.55, 1.0]
)
```

### Primitive Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `glamPlum` | #3D1B4E | Primary brand, nav active, hero bg |
| `bordeaux` | #6B1E3D | Mid-gradient, accents |
| `champagneGold` | #C9A96E | Highlights, CTA, gold accents |
| `glamGold` | #D4AF37 | Stars, VIP badges |
| `pureWhite` | #FFFFFF | Card surfaces, text on dark |
| `creamBackground` | #FBF8F4 | App background (warm off-white) |
| `slateGrey` | #9E9E9E | Inactive icons, placeholder text |
| `lightGrey` | #F5F3F0 | Dividers, chip backgrounds |
| `successGreen` | #2E7D32 | Recovered revenue, filled badges |
| `errorRed` | #C62828 | Errors, unread badges |
| `warningAmber` | #F57F17 | Moderate urgency indicators |

### Semantic Aliases
| Semantic | Value |
|----------|-------|
| Background | `creamBackground` |
| Surface (card) | `pureWhite` |
| Primary text | `#1A1A1A` (near-black) |
| Secondary text | `#6B6B6B` |
| Disabled | `slateGrey` |
| Border | `lightGrey` (1px) |
| Leakage (money lost) | `errorRed` |
| Recovered (money saved) | `successGreen` |

---

## Elevation System

3 levels only:

| Level | Shadow | Usage |
|-------|--------|-------|
| Ground | none | Background, dividers |
| Card | `BoxShadow(offset: (0,2), blur: 8, color: black.08)` | Gap cards, stat cards |
| Modal | `BoxShadow(offset: (0,-4), blur: 24, color: black.15)` | Bottom sheets, paywall |

Active nav tab: `BoxShadow(color: glamPlum.withOpacity(0.3), blur: 12)`

---

## Component Library

### `SfButton` (Primary)
```
Height: 52px
Border radius: 14px
Background: glamHeroGradient (CTA) or pureWhite (secondary)
Text: labelLarge, white (primary) or glamPlum (secondary)
Padding: horizontal 24px
Min width: 160px
Disabled: 50% opacity
Loading: 20px CircularProgressIndicator replacing label
```

### `SfCard`
```
Background: pureWhite
Border radius: 16px
Padding: 16px
Shadow: Card level
Clip: hardEdge
```

### `SfHeroGradient`
```
Background: glamHeroGradient
Border radius: 20px
Padding: 20px 16px
Text color: pureWhite
```

### `SfEmptyState`
```
Icon: 72px, glamPlum @ 60% opacity
Title: titleLarge, center
Body: bodyMedium, slateGrey, center
CTA: SfButton (if action available)
Vertical padding: 48px
```

### `SfBadge`
```
Background: errorRed
Text: labelMedium, white
Min width: 18px, height: 18px
Border radius: 9px
Padding: horizontal 4px (if > 9)
Position: Positioned(-4, -6) relative to icon
```

### `SfStatCard`
```
Background: pureWhite
Border radius: 12px
Icon: 20px, glamPlum
Value: headlineMedium, primary text
Label: caption, slateGrey
```

### `SfActionSheet` (bottom sheet)
```
Background: pureWhite
Top border radius: 20px
Handle bar: 4px × 32px, lightGrey, centered, 8px from top
Max height: 85% screen
Actions: full-width SfButton stack, 12px gap
```

### `SfListTile`
```
Height: min 72px
Leading: 44px × 44px avatar/icon area
Title: titleMedium
Subtitle: bodyMedium, slateGrey
Trailing: caption or badge
Padding: horizontal 16px, vertical 12px
Divider: 1px lightGrey, inset 72px
```

### `SfProgressBar`
```
Height: 6px
Border radius: 3px
Background: lightGrey
Fill: glamHeroGradient
Animated: 300ms ease-in-out
```

### `SfChip`
```
Selected: glamPlum background, white text, 600 weight
Unselected: lightGrey background, secondary text
Border radius: 20px
Height: 36px
Padding: horizontal 16px
HapticFeedback.selectionClick on tap
```

---

## Motion

| Event | Duration | Curve |
|-------|----------|-------|
| Tab switch (IndexedStack) | instant (no anim) | — |
| Bottom sheet open | 280ms | `easeOutCubic` |
| Bottom sheet close | 220ms | `easeInCubic` |
| Card tap feedback | 80ms scale 0.97→1.0 | `easeOut` |
| Hero number update | 400ms | `easeInOutCubic` |
| Badge pulse (notification) | 1800ms repeat(reverse) | `easeInOut` |
| Celebration overlay | 1200ms fade+scale | `elasticOut` |
| Page push/pop | default MaterialRoute | — |

No spring animations for data — springs are for playful apps. We are a money app.

---

## Microcopy Rules

### Loss-framed language
✅ "You left $340 on the table this week"
✅ "3 slots went unfilled — that's $255 gone"
✅ "This gap could earn you $85"
❌ "You have 3 gaps" (no dollar context)
❌ "Productivity score: 67%" (abstract, not loss-framed)

### Not shamey
✅ "Ready to recover some of this?" (inviting)
✅ "One message could fill this" (empowering)
❌ "You've been ignoring your gaps" (blaming)
❌ "Your fill rate is terrible" (shaming)

### Urgency without panic
✅ "Thursday at 2pm — still open" (fact-based)
✅ "Last chance to fill this week" (clear deadline)
❌ "URGENT: You're losing money NOW!!!" (panic)

### Action-forward
Every insight ends with a CTA verb. "Send a message", "Fill this slot", "Copy campaign", "View details".

### Number formatting
- Always use `$` prefix
- Round to whole dollars for > $10
- Show cents only for < $10 (e.g. "$8.50")
- Use K notation for > $1000 (e.g. "$1.2K")
- Weekly timeframes: "this week" not "in the past 7 days"

---

## Accessibility Baseline

- **Tap targets**: Minimum 44×44px for all interactive elements. Expand hitboxes with `GestureDetector` + invisible padding if visual size is smaller.
- **Color contrast**: WCAG AA minimum (4.5:1 for body text, 3:1 for large text). Glamplum on white = ✅. Gold on plum = ✅. Light grey text on white = ⚠️ (needs check).
- **Semantics**: All `InkWell`/`GestureDetector` wrapped in `Semantics(label: ..., button: true)`. Images have `label`. Icons have `excludeSemantics: false` with meaningful labels.
- **Form labels**: All input fields have `InputDecoration(label:)` or visible `Text` label above. Error states use `errorText` not just color change.
- **Focus management**: After bottom sheet closes, focus returns to triggering element. Tab key order follows visual layout on web.
- **Reduced motion**: Check `MediaQuery.disableAnimations`. If true, skip `AnimationController` animations; use instant state transitions.
- **Screen reader**: Test with VoiceOver (iOS) and TalkBack (Android) before each release.
