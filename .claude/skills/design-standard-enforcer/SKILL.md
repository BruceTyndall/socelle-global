---
name: design-standard-enforcer
description: ALWAYS use this skill when enforcing Pearl Mineral V2 design standards on any UI component, prototype, landing page, or design artifact. Triggers on "enforce design standard", "Pearl Mineral check", "design compliance", "UI audit", "design lock check", "component design review". Validates color tokens, typography, glass morphism, border radius, spacing, and responsive behavior against SOCELLE canonical doctrine design locks.
---

# Design Standard Enforcer

## Purpose
Enforces Pearl Mineral V2 design system compliance across all UI surfaces — components, pages, prototypes, and design artifacts. Acts as the automated design reviewer that catches token drift, lock violations, and visual inconsistencies before they reach production.

## When to Use
- After `design-prototype-generator` or `front-end-design` produces output
- Before merging any PR with UI changes
- During design audit cycles
- When reviewing Figma-to-code handoff for token drift
- After any Tailwind config or theme file modification

## Procedure

### Step 1 — Identify Target Surfaces
Scan the target files or components for design-relevant code:

```bash
# Find all files with design tokens or styling
grep -rn "className\|style=\|bg-\|text-\|border-\|rounded-\|backdrop-\|font-" \
  --include="*.tsx" --include="*.jsx" --include="*.css" --include="*.html" \
  $TARGET_PATH | head -100
```

### Step 2 — Design Lock Validation
Check against the 5 canonical design locks from `SOCELLE_CANONICAL_DOCTRINE.md`:

```
DESIGN LOCK #1 — COLOR PALETTE:
  Primary Background: #F6F3EF (mn-bg) → bg-[#F6F3EF] or bg-mn-bg
  Primary Text: #141418 (graphite) → text-[#141418] or text-graphite
  Accent: #6E879B → text-[#6E879B] or text-accent
  Surface White: #FFFFFF with glass opacity
  Error: Standard red-500/600
  Success: Standard green-500/600

  VIOLATIONS TO CATCH:
  ❌ #1E252B used for primary text (old token)
  ❌ #000000 used for text (too harsh)
  ❌ Random hex colors not in palette
  ❌ Tailwind default colors (blue-500, gray-900) without override

DESIGN LOCK #2 — TYPOGRAPHY:
  Font Family: Inter (sans-serif) — ONLY
  Heading Scale: text-4xl (h1), text-2xl (h2), text-xl (h3), text-lg (h4)
  Body: text-base (16px)
  Small: text-sm (14px)

  VIOLATIONS TO CATCH:
  ❌ font-serif on any public page
  ❌ font-mono outside code blocks
  ❌ Custom font-family declarations
  ❌ Text sizes outside the approved scale

DESIGN LOCK #3 — GLASS MORPHISM:
  Standard: backdrop-blur-md bg-white/70
  Heavy: backdrop-blur-lg bg-white/80
  Light: backdrop-blur-sm bg-white/60
  Border: border border-white/20

  VIOLATIONS TO CATCH:
  ❌ backdrop-blur without bg-white opacity
  ❌ Solid white backgrounds where glass is specified
  ❌ Opacity values outside 60-80 range for glass surfaces

DESIGN LOCK #4 — BORDER RADIUS:
  Cards/Containers: rounded-2xl (16px)
  Buttons: rounded-xl (12px)
  Inputs: rounded-lg (8px)
  Tags/Badges: rounded-full

  VIOLATIONS TO CATCH:
  ❌ rounded-none on cards (too sharp)
  ❌ rounded-sm or rounded-md on cards (too subtle)
  ❌ Inconsistent radius on same component type

DESIGN LOCK #5 — SPACING & LAYOUT:
  Section Padding: py-16 or py-20
  Card Padding: p-6 or p-8
  Gap: gap-4 (default), gap-6 (spacious), gap-8 (sections)
  Max Width: max-w-7xl (content), max-w-4xl (reading)
```

### Step 3 — Automated Scan
Run the lock validation programmatically:

```bash
# Color violations
grep -rn '#1E252B\|#000000\|blue-500\|gray-900' --include="*.tsx" $TARGET_PATH

# Typography violations
grep -rn 'font-serif\|font-mono' --include="*.tsx" $TARGET_PATH | grep -v "code\|pre\|mono-"

# Glass violations — solid white where glass expected
grep -rn 'bg-white[^/]' --include="*.tsx" $TARGET_PATH | grep -i "card\|panel\|modal\|overlay"

# Border radius violations
grep -rn 'rounded-none\|rounded-sm\b\|rounded-md\b' --include="*.tsx" $TARGET_PATH | grep -i "card\|container\|panel"
```

### Step 4 — Responsive Behavior Check
Verify responsive design patterns:

```
RESPONSIVE RULES:
[ ] Mobile-first: base styles → sm: → md: → lg: → xl:
[ ] No fixed widths on container elements (w-[500px])
[ ] Grid columns collapse on mobile: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
[ ] Typography scales down on mobile (text-2xl → md:text-4xl)
[ ] Touch targets minimum 44x44px on mobile
[ ] Glass effects degrade gracefully (reduce blur on low-power devices)
```

### Step 5 — DEMO/LIVE Badge Check
Any data-displaying component must show proper labeling:

```
BADGE RULES (per CLAUDE.md §F):
[ ] Components with isLive=false show PREVIEW or DEMO badge
[ ] Pulsing dots only appear on verified live data connections
[ ] "Updated X ago" derives from real updated_at column
[ ] Static arrays never show "Live" indicators
```

### Step 6 — Generate Enforcement Report

```json
{
  "skill": "design-standard-enforcer",
  "files_scanned": 0,
  "violations_found": 0,
  "violations_by_lock": {
    "color": [],
    "typography": [],
    "glass": [],
    "border_radius": [],
    "spacing": []
  },
  "responsive_issues": [],
  "demo_live_issues": [],
  "auto_fixable": 0,
  "manual_review_needed": 0,
  "overall_compliance": "0-100%",
  "report_path": "docs/qa/design-standard-enforcer-YYYY-MM-DD.md"
}
```

### Step 7 — Auto-Fix (Optional)
For clear violations, generate a patch:

```
AUTO-FIX TABLE:
| Violation | Find | Replace |
|---|---|---|
| Old text color | #1E252B | #141418 |
| Harsh black | text-black | text-graphite |
| Serif font | font-serif | font-sans |
| Sharp cards | rounded-none (on cards) | rounded-2xl |
| Solid white glass | bg-white (on glass) | bg-white/70 backdrop-blur-md |
```

Save report and optional patch to `docs/qa/`.

## Fade Protocol
- **Review quarterly** — Sync design locks with any Figma updates via `SOCELLE_FIGMA_TO_CODE_HANDOFF.md`
- **Retest** — Scan 10 random components; if false positive rate >15%, recalibrate patterns
- **Retire** — If design system version changes (V3+), rebuild scan patterns from new tokens

## Verification (Deterministic)
- **Command:** `find docs/qa -name "design-standard-enforcer*.json" | wc -l  # expect >= 1`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/design-standard-enforcer-YYYY-MM-DD.json`
- **Fail criteria:** Command returns unexpected value, report not generated, or any BLOCK-level issue found without resolution


## Stop Conditions
- **Hard stop:** Codebase does not compile (`npx tsc --noEmit` fails) — fix build before running this skill
- **Hard stop:** Target path does not exist or is empty — verify repo checkout
- **Hard stop:** Required command-line tool missing (grep, find, node) — install before proceeding
- **Soft stop (owner decision):** More than 50 issues found — present summary to owner for prioritization before attempting fixes
- **Soft stop (owner decision):** Findings contradict a command doc — escalate to owner; do not auto-fix governance
