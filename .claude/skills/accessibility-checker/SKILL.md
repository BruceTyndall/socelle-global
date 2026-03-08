---
name: accessibility-checker
description: "Audits SOCELLE's web interface for WCAG 2.1 accessibility compliance including ARIA labels, keyboard navigation, color contrast, screen reader support, and form accessibility. Use this skill whenever someone asks about accessibility, WCAG compliance, ADA compliance, screen reader support, keyboard navigation, color contrast, ARIA labels, or inclusive design. Also triggers on: 'accessibility', 'a11y', 'WCAG', 'ADA', 'screen reader', 'keyboard nav', 'color contrast', 'ARIA', 'alt text', 'focus management'. Accessibility failures create legal liability and exclude potential customers."
---

# Accessibility Checker

Audits for WCAG 2.1 AA compliance. Beyond legal obligation (ADA, Section 508), accessibility failures exclude professionals who use assistive technology — narrowing SOCELLE's addressable market. In B2B, inaccessible software is also a procurement blocker for enterprise clients.

## Step 1: ARIA and Semantic HTML

```bash
echo "=== ARIA & SEMANTICS ==="
cd SOCELLE-WEB

# ARIA label usage
echo "ARIA labels:"
grep -rn "aria-label\|aria-labelledby\|aria-describedby\|role=" src/ 2>/dev/null | grep -v node_modules | wc -l

# Semantic HTML elements
echo "Semantic elements:"
grep -rn "<main\|<nav\|<aside\|<header\|<footer\|<section\|<article" src/ 2>/dev/null | grep -v node_modules | wc -l

# Generic divs without roles (potential issue)
echo "Generic click handlers (may need role='button'):"
grep -rn "onClick.*div\|onClick.*span" src/ 2>/dev/null | grep -v node_modules | grep -v "role=" | wc -l

# Form labels
echo "Form inputs without labels:"
grep -rn "<input\|<select\|<textarea" src/ 2>/dev/null | grep -v node_modules | grep -v "aria-label\|id=.*label\|htmlFor" | wc -l
```

## Step 2: Keyboard Navigation

```bash
echo "=== KEYBOARD NAV ==="
cd SOCELLE-WEB

# Focus management
echo "Focus management:"
grep -rn "tabIndex\|tabindex\|autoFocus\|focus()\|onFocus\|onBlur" src/ 2>/dev/null | grep -v node_modules | wc -l

# Skip-to-content link
echo "Skip navigation:"
grep -rn "skip.*content\|skip.*nav\|skip.*main" src/ 2>/dev/null | grep -v node_modules | head -3

# Focus trap in modals
echo "Modal focus traps:"
grep -rn "FocusTrap\|focus.*trap\|inert\|aria-modal" src/ 2>/dev/null | grep -v node_modules | head -5
```

## Step 3: Color Contrast

Check Pearl Mineral V2 color combinations for WCAG AA contrast ratios (minimum 4.5:1 for normal text, 3:1 for large text):

| Combination | Foreground | Background | Ratio | Pass? |
|-------------|-----------|------------|-------|-------|
| Primary text on bg | #141418 on #F6F3EF | ~15.3:1 | AA ✓ |
| Accent on bg | #6E879B on #F6F3EF | ~3.8:1 | AA large only |
| White on accent | #FFFFFF on #6E879B | ~3.9:1 | AA large only |
| Primary on glass | #141418 on white/70 | Variable | Check |

```bash
echo "=== COLOR CONTRAST ISSUES ==="
cd SOCELLE-WEB

# Light text on light backgrounds
echo "Potential low-contrast text:"
grep -rn "text-gray-300\|text-gray-400\|text-white.*bg-white\|opacity-50" src/ 2>/dev/null | grep -v node_modules | head -10
```

## Step 4: Screen Reader Audit

```bash
echo "=== SCREEN READER ==="
cd SOCELLE-WEB

# Images with alt text
echo "Images with alt:"
grep -rn "alt=" src/ 2>/dev/null | grep -v node_modules | wc -l
echo "Images total:"
grep -rn "<img\|<Image" src/ 2>/dev/null | grep -v node_modules | wc -l

# Icon-only buttons
echo "Icon-only buttons (need aria-label):"
grep -rn "Icon.*onClick\|<button.*Icon\|<Button.*icon" src/ 2>/dev/null | grep -v node_modules | grep -v "aria-label" | wc -l

# Live regions for dynamic content
echo "Live regions:"
grep -rn "aria-live\|aria-atomic\|role.*alert\|role.*status" src/ 2>/dev/null | grep -v node_modules | wc -l
```

## Output

Write to `docs/qa/accessibility.json`:
```json
{
  "skill": "accessibility-checker",
  "aria_labels_count": 0,
  "semantic_elements_count": 0,
  "clickable_divs_without_role": 0,
  "forms_without_labels": 0,
  "images_with_alt_pct": 0,
  "skip_nav_exists": false,
  "focus_traps_in_modals": false,
  "contrast_issues": [],
  "wcag_level": "A|AA|AAA|FAIL",
  "timestamp": "ISO-8601"
}
```

## Verification (Deterministic)
- **Command:** `find docs/qa -name "accessibility-checker*.json" | wc -l  # expect >= 1`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/accessibility-checker-YYYY-MM-DD.json`
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
