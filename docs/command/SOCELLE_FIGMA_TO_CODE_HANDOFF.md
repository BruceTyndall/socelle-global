# SOCELLE FIGMA-TO-CODE HANDOFF
**Version:** 1.0  
**Effective:** March 5, 2026  
**Authority:** SOCELLE Command Center — D1 Design System Architect  
**Scope:** All design-to-code transitions across web (Vite/React/Tailwind), mobile (Flutter), and studio mini-apps

---

## 1. TOKEN NAMING CONVENTIONS

### Figma Variables → CSS Custom Properties → Tailwind Config → Flutter Theme

| Layer | Naming Convention | Example |
|---|---|---|
| **Figma Variables** | `collection/category/name` | `Mineral/Background/Primary` |
| **CSS Custom Properties** | `--{category}-{name}` | `--bg-primary` |
| **Tailwind Config** | `{category}.{name}` | `mn.bg` |
| **Flutter Theme** | `SocelleColors.{category}{Name}` | `SocelleColors.bgPrimary` |

### Color Token Parity Table

| Figma Variable | CSS Variable | Tailwind Token | Flutter |
|---|---|---|---|
| `Mineral/Background/Primary` | `--bg` | `mn.bg` | `SocelleColors.bgPrimary` |
| `Mineral/Background/Alt` | `--surface-alt` | `mn.surface` | `SocelleColors.surfaceAlt` |
| `Mineral/Background/Card` | `--card` | `mn.card` | `SocelleColors.card` |
| `Mineral/Background/DarkPanel` | `--panel-dark` | `mn.dark` | `SocelleColors.panelDark` |
| `Mineral/Background/Footer` | `--footer` | `mn.footer` | `SocelleColors.footer` |
| `Mineral/Text/Primary` | `--ink` | `graphite` | `SocelleColors.ink` |
| `Mineral/Text/Secondary` | `--ink-sec` | — (CSS var) | `SocelleColors.inkSecondary` |
| `Mineral/Text/Muted` | `--ink-muted` | — (CSS var) | `SocelleColors.inkMuted` |
| `Mineral/Text/OnDark` | `--on-dark` | — (CSS var) | `SocelleColors.onDark` |
| `Mineral/Text/OnDarkSecondary` | `--on-dark-sec` | — (CSS var) | `SocelleColors.onDarkSec` |
| `Mineral/Accent/Default` | `--accent` | `accent.DEFAULT` | `SocelleColors.accent` |
| `Mineral/Accent/Hover` | `--accent-hover` | `accent.hover` | `SocelleColors.accentHover` |
| `Mineral/Accent/Tint` | `--accent-tint` | — (CSS var) | `SocelleColors.accentTint` |
| `Mineral/Signal/Up` | `--signal-up` | `signal.up` | `SocelleColors.signalUp` |
| `Mineral/Signal/Warn` | `--signal-warn` | `signal.warn` | `SocelleColors.signalWarn` |
| `Mineral/Signal/Down` | `--signal-down` | `signal.down` | `SocelleColors.signalDown` |

### Typography Token Parity

| Figma Text Style | CSS / Tailwind | Flutter TextStyle |
|---|---|---|
| `Display/Hero` | `text-hero` | `SocelleTypography.hero` |
| `Display/Section` | `text-section` | `SocelleTypography.section` |
| `Display/Subsection` | `text-subsection` | `SocelleTypography.subsection` |
| `Body/Large` | `text-body-lg` | `SocelleTypography.bodyLarge` |
| `Body/Regular` | `text-body` | `SocelleTypography.bodyRegular` |
| `Label/Eyebrow` | `text-eyebrow` | `SocelleTypography.eyebrow` |
| `Label/Small` | `text-label` | `SocelleTypography.label` |
| `Data/Metric-XL` | `text-metric-xl` | `SocelleTypography.metricXL` |
| `Data/Metric-LG` | `text-metric-lg` | `SocelleTypography.metricLG` |

---

## 2. COMPONENT NAMING & VARIANTS

### Naming Convention

| Platform | Convention | Example |
|---|---|---|
| **Figma** | `ComponentName / Variant` | `Button / Primary / Large` |
| **Web (React)** | `PascalCase` + props | `<Button variant="primary" size="lg" />` |
| **Mobile (Flutter)** | `PascalCase` + named params | `SocelleButton(variant: ButtonVariant.primary, size: ButtonSize.lg)` |

### Core Component Inventory

| Component | Figma Name | Web File | Mobile File | Variants |
|---|---|---|---|---|
| Button | `Button` | `src/components/ui/Button.tsx` | `lib/core/widgets/socelle_button.dart` | primary, secondary, ghost, accent / sm, md, lg |
| Card | `Card` | `src/components/ui/Card.tsx` | `lib/core/widgets/socelle_card.dart` | default, glass, dark, elevated |
| SignalCard | `SignalCard` | `src/components/intelligence/SignalCard.tsx` | `lib/features/intelligence/signal_card.dart` | compact, expanded / up, warn, down |
| NavPill | `NavPill` | `src/components/layout/MainNav.tsx` | `lib/core/widgets/nav_pill.dart` | default, scrolled |
| GlassSurface | `GlassSurface` | `src/components/ui/GlassSurface.tsx` | `lib/core/widgets/glass_surface.dart` | light, dark, strong |
| Badge | `Badge` | `src/components/ui/Badge.tsx` | `lib/core/widgets/socelle_badge.dart` | default, confidence, signal, tier |
| Input | `Input` | `src/components/ui/Input.tsx` | `lib/core/widgets/socelle_input.dart` | default, search, filter |
| FilterPill | `FilterPill` | `src/components/ui/FilterPill.tsx` | `lib/core/widgets/filter_pill.dart` | default, active |
| MetricDisplay | `MetricDisplay` | `src/components/intelligence/MetricDisplay.tsx` | `lib/features/intelligence/metric_display.dart` | xl, lg, md / animated, static |
| UpgradeGate | `UpgradeGate` | `src/components/entitlements/UpgradeGate.tsx` | `lib/core/widgets/upgrade_gate.dart` | modal, inline, banner |

### Variant Prop Mapping (Figma → Code)

```
Figma: Button / Primary / Large / Disabled
Web:   <Button variant="primary" size="lg" disabled />
Mobile: SocelleButton(variant: .primary, size: .lg, enabled: false)
```

---

## 3. LAYOUT GRID RULES & BREAKPOINTS

### Breakpoint System

| Name | Figma Frame Width | CSS Breakpoint | Tailwind Prefix | Flutter |
|---|---|---|---|---|
| Mobile S | 320px | — (default) | — | `< 375` |
| Mobile | 375px | `min-width: 375px` | `xs:` | `375–413` |
| Mobile L | 414px | `min-width: 414px` | `sm:` | `414–599` |
| Tablet | 768px | `min-width: 768px` | `md:` | `600–1023` |
| Desktop | 1024px | `min-width: 1024px` | `lg:` | `1024–1279` |
| Desktop L | 1280px | `min-width: 1280px` | `xl:` | `1280–1535` |
| Desktop XL | 1536px | `min-width: 1536px` | `2xl:` | `≥ 1536` |

### Grid System

| Breakpoint | Columns | Gutter | Margin | Max Content Width |
|---|---|---|---|---|
| Mobile (< 768) | 4 | 16px | 20px | 100% |
| Tablet (768–1023) | 8 | 24px | 32px | 100% |
| Desktop (1024–1279) | 12 | 24px | 48px | 1200px |
| Desktop L (1280+) | 12 | 32px | auto | 1280px |

### Section Spacing

| Element | Mobile | Tablet | Desktop |
|---|---|---|---|
| Section padding (vertical) | 64px | 96px | 120–160px |
| Card gap | 16px | 20px | 24px |
| Component internal padding | 16px | 20px | 24px |
| Hero height | 100vh | 100vh | 100vh |

### Responsive Component Behavior

| Component | Mobile | Tablet | Desktop |
|---|---|---|---|
| Signal grid | 1 column stack | 2 columns | 3 columns |
| Brand grid | 2 columns | 3 columns | 4 columns |
| Job listing | Card stack | Card stack | Table view |
| Nav | Hamburger + drawer | Pill (condensed) | Pill (full) |
| Studio sidebar | Bottom sheet | Side panel (48%) | Side panel (320px fixed) |

---

## 4. EXPORT RULES

### Icons

| Property | Standard |
|---|---|
| Format | SVG (optimized, no embedded fonts) |
| Size | 24×24 default, 16×16 small, 32×32 large |
| Stroke width | 1.5px (consistent with Lucide set) |
| Color | `currentColor` (inherits from parent) |
| Naming | `icon-{name}.svg` lowercase, hyphenated |
| Web delivery | Inline SVG or React component (`<IconName />`) |
| Mobile delivery | Flutter `Icons` or custom SVG via `flutter_svg` |

### Images

| Property | Standard |
|---|---|
| Format | AVIF (primary) + WebP (fallback) + JPEG (legacy fallback) |
| Responsive | `srcset` with 1x, 2x, 3x variants |
| Lazy loading | `loading="lazy"` on all below-fold images |
| Aspect ratios | Hero: 16:9, Card thumbnail: 4:5, Avatar: 1:1, Brand logo: 3:2 |
| Max file size | Hero: < 200KB (AVIF), Card: < 80KB, Thumbnail: < 30KB |
| Naming | `{context}-{description}-{size}.{ext}` (e.g., `brand-logo-naturopathica-2x.avif`) |

### Video

| Property | Standard |
|---|---|
| Format | MP4 (H.264) + WebM (VP9) |
| Hero video | < 2MB, 1080p max, 8–15s loop, no audio track |
| Ambient video | < 1MB, 720p, seamless loop, no audio |
| Autoplay | `autoplay muted loop playsinline` |
| Poster frame | AVIF still frame for pre-load state |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` → show poster only |
| Mobile behavior | Poster frame only below 768px (save bandwidth) |

---

## 5. "NO DRIFT" ENFORCEMENT CHECKLIST

Run this checklist before every PR that touches design system tokens or components:

### Token Parity Check

- [ ] Every color used in code maps to a Figma variable (no orphan hex values)
- [ ] Every Figma color variable maps to a CSS custom property
- [ ] Every CSS custom property maps to a Tailwind token (where applicable)
- [ ] Flutter theme tokens match Figma variables (same hex values)
- [ ] No hardcoded hex values in component JSX/TSX/Dart files (use tokens only)

### Typography Parity Check

- [ ] Font family in code matches Figma text styles (General Sans primary, no serif)
- [ ] Font size scale in Tailwind matches Figma type scale
- [ ] Letter spacing and line height values match Figma exactly
- [ ] Font weight values match Figma (400/500/600/700 only)

### Component Parity Check

- [ ] All component variants in Figma have corresponding props in code
- [ ] All component states (hover, active, disabled, focus) match Figma
- [ ] Border radius values match Figma rounded corners
- [ ] Padding/margin values match Figma auto-layout spacing
- [ ] Shadow values match Figma effect styles

### Layout Parity Check

- [ ] Grid columns match Figma layout grids at each breakpoint
- [ ] Gutters and margins match Figma auto-layout gaps
- [ ] Max content width matches Figma frame constraints
- [ ] Section spacing matches Figma vertical padding

### Glass System Parity Check

- [ ] Glass blur/saturate/brightness values match Figma backdrop blur effect
- [ ] Glass border values match Figma stroke
- [ ] Glass shadow values match Figma drop shadow + inner shadow
- [ ] Pearl highlight edge (inset top shadow) present in both Figma and code

### Drift Prevention Protocol

1. **Figma is source of truth** for visual design decisions (color, spacing, layout).
2. **Code is source of truth** for interaction behavior (animations, transitions, state management).
3. **When a discrepancy is found:** Update the side that drifted, not the one that's correct. Document which side was wrong.
4. **Token changes require both:** A Figma update AND a code update in the same PR.
5. **Monthly audit:** D1 agent runs full parity check first Wednesday of each month.

---

*SOCELLE FIGMA-TO-CODE HANDOFF v1.0 — March 5, 2026 — Command Center Authority*
