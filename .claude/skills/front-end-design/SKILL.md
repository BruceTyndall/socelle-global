---
name: front-end-design
description: "Generates and audits React/Vite UI components aligned to SOCELLE's Pearl Mineral V2 design system. Use this skill whenever someone asks to create a new page, component, dashboard screen, wireframe, or UI module for SOCELLE. Also triggers on: 'new component', 'build a page', 'create a screen', 'UI wireframe', 'design a module', 'component scaffold', 'page layout'. This skill bridges the gap between Figma designs and production code by generating components that comply with design tokens, responsive breakpoints, and glass-morphism patterns from day one."
---

# Front-End Design Skill

Generates production-ready React + Tailwind components for the SOCELLE monorepo, ensuring every new surface ships aligned to Pearl Mineral V2 design locks from the start. This matters because design drift is one of the most expensive bugs to fix retroactively — catching it at generation time saves orders of magnitude of effort.

## Context

SOCELLE uses Vite + React 18 + Tailwind CSS with a locked design system:
- **Graphite**: `#141418` (primary text, nav backgrounds)
- **Mineral Background**: `#F6F3EF` (page backgrounds, cards)
- **Accent**: `#6E879B` (links, CTAs, interactive elements)
- **Glass**: `backdrop-blur-md bg-white/70` on elevated cards
- **Border Radius**: `rounded-2xl` (cards), `rounded-xl` (buttons)
- **Typography**: Inter font stack, no serif on public pages

## Step 1: Understand the Request

Before writing any code, clarify:
1. What portal/context does this component live in? (public, `/portal/*`, `/brand/*`, `/admin/*`)
2. What data does it consume? (Supabase table, hook name, static)
3. Is it a new page (needs route in App.tsx) or a component within a page?
4. Does it need entitlement gating? (free preview vs paid)

If the user provides a Figma URL or reference, check `figma-make-source/` for existing module mappings first.

## Step 2: Scaffold the Component

Generate a file structure following SOCELLE conventions:

```
src/components/[domain]/[ComponentName].tsx    # for shared components
src/pages/[portal]/[PageName].tsx              # for full pages
```

Every component must include:
- TypeScript props interface (no `any` types)
- Responsive breakpoints: `sm:`, `md:`, `lg:` (mobile-first)
- LIVE/DEMO data labeling via `isLive` pattern from `useIntelligence`
- Loading skeleton state
- Empty state with actionable message

### Component Template

```tsx
import React from 'react';

interface [Name]Props {
  // typed props
}

export const [Name]: React.FC<[Name]Props> = ({ ...props }) => {
  return (
    <div className="bg-mn-bg rounded-2xl p-6 backdrop-blur-md bg-white/70 border border-white/20">
      {/* Pearl Mineral V2 compliant content */}
    </div>
  );
};
```

## Step 3: Apply Design Locks

Run these checks against your generated code:

```bash
echo "=== DESIGN LOCK CHECK ==="
cd SOCELLE-WEB
FILE="$1"  # path to new component

# Check for banned colors
echo "Banned color usage:"
grep -n "#1E252B\|#000000\|bg-black\|text-black" "$FILE" 2>/dev/null

# Check for serif fonts
echo "Serif font usage (banned on public pages):"
grep -n "font-serif\|Georgia\|Times" "$FILE" 2>/dev/null

# Check for correct design tokens
echo "Token compliance:"
grep -cn "mn-bg\|#F6F3EF\|#141418\|#6E879B\|backdrop-blur" "$FILE" 2>/dev/null

# Check responsive
echo "Responsive breakpoints:"
grep -cn "sm:\|md:\|lg:" "$FILE" 2>/dev/null

# Check glass pattern
echo "Glass morphism:"
grep -cn "backdrop-blur\|bg-white/" "$FILE" 2>/dev/null
```

## Step 4: Wire Data

If the component needs data:
1. Check if a Supabase hook already exists in `src/hooks/` or `src/integrations/`
2. If yes, import and use it — do not create a duplicate
3. If no, create a new hook following the `useIntelligence` pattern with `isLive` flag
4. Never hardcode data without a `DEMO` badge visible to end users

## Step 5: Validate and Output

```bash
# Typecheck the new file
cd SOCELLE-WEB && npx tsc --noEmit

# Verify the component renders (basic import check)
grep -rn "import.*[ComponentName]" src/ 2>/dev/null
```

Write results to `docs/qa/front_end_design.json`:
```json
{
  "skill": "front-end-design",
  "component": "[Name]",
  "path": "src/components/...",
  "design_lock_pass": true,
  "responsive_breakpoints": 3,
  "data_source": "LIVE|DEMO",
  "typecheck_pass": true,
  "timestamp": "ISO-8601"
}
```

## Verification (Deterministic)
- **Command:** `find docs/qa -name "front-end-design*.json" | wc -l  # expect >= 1`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/front-end-design-YYYY-MM-DD.json`
- **Fail criteria:** Command returns unexpected value, report not generated, or any BLOCK-level issue found without resolution


## Stop Conditions
- **Hard stop:** Codebase does not compile (`npx tsc --noEmit` fails) — fix build before running this skill
- **Hard stop:** Target path does not exist or is empty — verify repo checkout
- **Hard stop:** Required command-line tool missing (grep, find, node) — install before proceeding
- **Soft stop (owner decision):** More than 50 issues found — present summary to owner for prioritization before attempting fixes
- **Soft stop (owner decision):** Findings contradict a command doc — escalate to owner; do not auto-fix governance


## Fade Protocol
- **Retest trigger:** Run quarterly or after any major refactor, migration, or dependency upgrade
- **Deprecation trigger:** Skill references files/patterns that no longer exist in codebase for 2+ consecutive quarters
- **Replacement path:** If deprecated, merge functionality into the relevant suite or rebuild via `skill-creator`
- **Last recertified:** 2026-03-08
