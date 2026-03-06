# Socelle Design System — Flutter Usage Guide

**Version:** 1.0 (M0 — Phase 0)
**File:** `lib/core/theme/socelle_design_system.dart`
**Import:** `import 'package:socelle_mobile/core/theme/socelle_design_system.dart';`

---

## Overview

The Socelle design system is the visual language for all **new intelligence surfaces** in Socelle Mobile. It translates the Socelle web design system into Flutter tokens, widgets, and a full `ThemeData`.

The aesthetic is: **warm cocoa glassmorphism** — frosted glass surfaces, shimmer gradient pill buttons, editorial light-weight typography, backdrop blur, and warm off-white backgrounds.

---

## When to Use SocelleTheme vs Legacy Theme

| Surface | Theme | Rule |
|---|---|---|
| Feed tab (Tab 0) | **SocelleTheme** | New intelligence surface |
| Discover tab (Tab 1) | **SocelleTheme** | New intelligence surface |
| Profile tab (Tab 4) | **SocelleTheme** | New intelligence surface |
| Revenue tab (Tab 2) | **Legacy theme** | Existing gap-recovery — DO NOT CHANGE |
| Schedule tab (Tab 3) | **Legacy theme** | Existing gap-recovery — DO NOT CHANGE |
| Settings | **Legacy theme** | Existing gap-recovery — DO NOT CHANGE |
| Dashboard / Gap Actions | **Legacy theme** | Existing gap-recovery — DO NOT CHANGE |
| Onboarding (Steps 1–4) | **Legacy theme** | Existing — DO NOT CHANGE |
| Onboarding (Step 5 — Explore) | **SocelleTheme** | New explore profile step |
| Paywall | **Legacy theme** | Existing — DO NOT CHANGE |
| Weekly Summary | **Legacy theme** | Existing — DO NOT CHANGE |

**Rule:** If the screen existed before the M0–M9 evolution, it uses the legacy theme. If it is new (added in M1–M9), it uses SocelleTheme.

---

## Token Reference

### SocelleColors

```dart
// Core brand
SocelleColors.primaryCocoa   // #47201C — primary text, headings, active states
SocelleColors.deepCocoa      // #29120F — dark backgrounds, footer areas
SocelleColors.neutralBeige   // #AC9B98 — muted text, placeholders, eyebrows

// Page backgrounds
SocelleColors.bgMain         // #F8F6F2 — warm off-white scaffold background
SocelleColors.bgAlt          // #F3E9E3 — peach section tint, alternate cards
SocelleColors.bgNearWhite    // #FAF9F5 — standard card background

// Semantic palette
SocelleColors.red400         // #FF6568
SocelleColors.orange400      // #FF8B1A
SocelleColors.orange700      // #C53C00
SocelleColors.yellow400      // #FAC800
SocelleColors.green400       // #05DF72
SocelleColors.green600       // #00A544
SocelleColors.green900       // #0D542B
SocelleColors.teal400        // #00D3BD
SocelleColors.blue400        // #54A2FF — use sparingly (no bright blue dominance)
SocelleColors.purple400      // #C07EFF

// Glass tints (for glassmorphic surfaces)
SocelleColors.glassLight     // rgba(134,134,134,0.10) — glass on light bg
SocelleColors.glassDark      // rgba(71,32,28,0.40)   — glass on dark bg
SocelleColors.glassWhite     // rgba(255,255,255,0.20) — white glass overlay
SocelleColors.glassDarkBg    // rgba(41,18,16,0.10)   — subtle dark tint

// Text on dark surfaces
SocelleColors.textOnDark      // #FFFFFF
SocelleColors.textOnDarkMuted // rgba(255,255,255,0.80)

// Shadows — use as BoxShadow in BoxDecoration
SocelleColors.shadowLight     // 10% black, blur 12, offset (0,6)
SocelleColors.shadowMedium    // 15% black, blur 14, offset (0,4)
SocelleColors.shadowDark      // 18% black, blur 12, offset (0,6)
```

### SocelleText

```dart
SocelleText.displayLarge     // 48px, w300 — hero numbers, major headings
SocelleText.displayMedium    // 32px, w300 — section headings
SocelleText.headlineLarge    // 24px, w300 — card headings
SocelleText.headlineMedium   // 20px, w400 — sub-headings
SocelleText.bodyLarge        // 16px, w400 — primary body text
SocelleText.bodyMedium       // 14px, w400, neutralBeige — secondary/muted text
SocelleText.label            // 13.8px, w500 — labels, tags
SocelleText.labelUppercase   // 13.8px, w500, neutralBeige — eyebrow/section labels
SocelleText.buttonLabel      // 16px, w500 — pill button text

// Convenience constructors
SocelleText.heading('My Heading')                   // displayMedium as Widget
SocelleText.eyebrow('Section Title')               // labelUppercase as Widget
```

**Key principle:** Socelle headings use `w300` (light weight). This is intentional and matches the web design system. Do not change to w500 or bold.

### SocelleRadius

```dart
SocelleRadius.small(context)   // 16dp mobile / 24dp tablet
SocelleRadius.medium(context)  // 24dp mobile / 32dp tablet
SocelleRadius.large(context)   // 48dp mobile / 80dp tablet
SocelleRadius.card(context)    // 32dp mobile / 48dp tablet
SocelleRadius.pill(height)     // height/2 — always circular pill
```

Tablet breakpoint: `shortestSide >= 600dp`. Always pass `BuildContext` for responsive radius.

### SocelleAnimation

```dart
SocelleAnimation.snap          // Curves.linear — instant state changes
SocelleAnimation.cinematic     // Cubic(0.75,0,0.25,1) — scroll reveal entrances
SocelleAnimation.standard      // Cubic(0.4,0,0.2,1) — default transitions

SocelleAnimation.dSnap         // 200ms — UI state changes
SocelleAnimation.dReveal       // 1200ms — scroll entrances
SocelleAnimation.dTransform    // 800ms — layout transitions
SocelleAnimation.dFill         // 100ms — micro-interactions (progress fills)
```

---

## Component Reference

### SocellePillButton

The primary interactive element. Three axes: **variant × tone × size**.

```dart
SocellePillButton(
  label: 'Get Started',
  variant: PillVariant.primary,    // primary | secondary | tertiary
  tone: PillTone.glass,            // light | dark | glass
  size: PillSize.medium,           // extraLarge | large | betweenLargeAndMedium | medium | small
  icon: Icons.arrow_forward,       // optional
  iconPosition: IconAlignment.end, // start | end
  onTap: () {},
  isActive: false,                 // active/selected state
  isDisabled: false,               // disabled state
  enableBlur: true,                // backdrop blur (default true)
  isDarkTheme: false,              // adapt colors for dark background
  expand: false,                   // fill available width
)
```

**Size guide:**
| Size | Height | Use case |
|---|---|---|
| extraLarge | 80px | Hero CTAs only |
| large | 60px | Primary page actions |
| betweenLargeAndMedium | 56px | Featured actions |
| medium | 48px | Standard buttons |
| small | 40px | Compact/inline actions |

**When to use shimmer border:** Automatically shown on `primary` variant + `glass` tone.
**When to use dark tone:** On `deepCocoa` or image backgrounds.

### SocelleGlassCard

```dart
SocelleGlassCard(
  child: YourContent(),
  isDark: false,                        // false = light glass, true = dark glass
  padding: const EdgeInsets.all(24),   // default
  blur: 6.0,                           // backdrop blur sigma
)
```

Use `SocelleGlassCard` for overlay content, featured items, and cards that sit on top of rich backgrounds. Use `SocelleCard` for standard content cards on the main background.

### SocelleCard

```dart
SocelleCard(
  child: YourContent(),
  padding: const EdgeInsets.all(24),
  color: SocelleColors.bgAlt,   // optional, defaults to bgNearWhite
  onTap: () {},              // optional, makes card tappable
)
```

### SocelleChip

```dart
SocelleChip(
  label: 'Hair',
  isSelected: false,
  isDark: false,     // adapt for dark backgrounds
  onTap: () {},
)
```

Use `SocelleChip` for category filters and specialty tags. Group in a `Wrap` for multi-select or a `SingleChildScrollView > Row` for horizontal scroll.

### SocelleNavPill

```dart
SocelleNavPill(
  items: ['Feed', 'Discover', 'Profile'],
  selectedIndex: _currentIndex,
  onTap: (index) => setState(() => _currentIndex = index),
)
```

Use for in-page horizontal tab navigation within a Socelle surface (not for the main app `BottomNavigationBar`).

### SocelleSectionLabel

```dart
const SocelleSectionLabel('Intelligence Feed')   // default: neutralBeige
SocelleSectionLabel('Trending', color: SocelleColors.orange400)
```

Always-uppercase eyebrow text. Used above content sections on Socelle surfaces.

### SocelleScaffold

```dart
SocelleScaffold(
  body: YourBody(),
  isDark: false,                 // dark = deepCocoa bg, light = bgMain
  backgroundColor: null,        // override if needed
  appBar: yourAppBar,           // optional
)
```

Use as the root widget for all new Socelle-themed screens.

### SocelleTheme

```dart
// In MaterialApp — only for Socelle-specific sub-routes/pages
// Do NOT apply to the root MaterialApp (that uses the legacy theme)
MaterialApp(
  theme: SocelleTheme.light,
  ...
)
```

---

## Design Principles

These principles are enforced in all Socelle surfaces:

1. **No gradients** — Use solid colors and glassmorphic tints instead.
2. **No ALL CAPS in content** — Section labels use `SocelleSectionLabel` (uppercase via code). Never write UI copy in ALL CAPS.
3. **No bright blues** — `blue400` exists but should not dominate any screen.
4. **Revenue numbers: 48px dominant** — Gap-recovery numbers keep their 48px treatment.
5. **Loading states everywhere** — Every async Socelle screen must have a Shimmer/skeleton state.
6. **Editorial light headings** — All `h1`/`h2` equivalents use `w300`. This is intentional.
7. **Calm, professional** — Avoid aggressive colors, excessive animation, or heavy visual noise.

---

## Boundary Rules for Agents M1–M9

- **NEVER** apply `SocelleTheme` to Revenue, Schedule, Settings, Dashboard, Paywall, or Onboarding Steps 1–4.
- **ALWAYS** use `SocelleColors` for color in new screens. Never use hardcoded hex values.
- **ALWAYS** use `SocellePillButton` for primary/secondary actions on Socelle screens.
- **ALWAYS** use `SocelleGlassCard` or `SocelleCard` for card containers on Socelle screens.
- **ALWAYS** check `FeatureFlags.kEnableSocelleShowcase` before rendering the showcase page.

---

## Visual QA

The `SocelleShowcasePage` renders every component for visual verification.

**To enable:**
1. Set `kEnableSocelleShowcase = true` in `lib/core/feature_flags.dart`
2. Navigate to `SocelleShowcasePage` (add a debug route or temporarily replace home)
3. Verify all 45 button combinations, cards, chips, nav pill, type scale, and color swatches
4. Reset `kEnableSocelleShowcase = false` before committing

**Location:** `lib/features/socelle_showcase/socelle_showcase_page.dart`

---

## Coexistence with Legacy Theme

Both design systems live in the same app simultaneously. This is intentional:

```
app/
  core/
    theme/
      socelle_colors.dart             ← Barrel re-export (points to socelle_design_system.dart)
      socelle_theme.dart              ← Gap-recovery theme (DO NOT TOUCH)
      slotforce_colors.dart           ← Legacy colors (DO NOT TOUCH)
      slotforce_theme.dart            ← Legacy theme (DO NOT TOUCH)
      socelle_design_system.dart      ← Unified tokens + widgets (intelligence + gap-recovery colors)
```

The two systems never conflict because they apply to different screens. `SocelleTheme.light` is only used when explicitly referenced — it does not override the root `MaterialApp` theme.
