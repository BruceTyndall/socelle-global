---
name: design-lock-enforcer
description: "Enforces Pearl Mineral V2 design locks: specific hex values, glass effects, border radius, spacing scale, and component patterns. Triggers on: 'design lock', 'Pearl Mineral', 'design system enforcement', 'component patterns', 'spacing audit', 'border radius check'."
---

# Design Lock Enforcer

Enforces all Pearl Mineral V2 design system locks from CANONICAL_DOCTRINE.md.

## Color lock verification

```bash
echo "=== COLOR LOCKS ==="
cd SOCELLE-WEB
echo "Doctrine colors:"
echo "  graphite=#141418 (primary text)"
echo "  mn-bg=#F6F3EF (background)"
echo "  accent=#6E879B (accent)"
echo "---"
echo "Tailwind config color definitions:"
grep -A20 "colors" tailwind.config.* 2>/dev/null | head -25
echo "---"
echo "Non-doctrine colors in components:"
grep -roh "#[0-9A-Fa-f]\{6\}" src/components/ src/pages/ 2>/dev/null | sort -u | grep -vi "141418\|F6F3EF\|6E879B\|ffffff\|000000" | head -20
```

## Typography lock

```bash
echo "=== TYPOGRAPHY LOCKS ==="
cd SOCELLE-WEB
echo "Font family declarations:"
grep -rn "fontFamily\|font-family" tailwind.config.* src/index.css 2>/dev/null | head -10
echo "---"
echo "Serif violations on public pages (BANNED):"
grep -rn "font-serif\|serif" src/pages/public/ src/pages/Home* src/pages/Intelligence* 2>/dev/null | head -10
echo "Count: $(grep -rn "font-serif\|serif" src/pages/public/ src/pages/Home* src/pages/Intelligence* 2>/dev/null | wc -l)"
```

## Glass effect pattern

```bash
echo "=== GLASS EFFECTS ==="
cd SOCELLE-WEB
echo "backdrop-blur usage:"
grep -rc "backdrop-blur\|backdrop-filter" src/ 2>/dev/null | grep -v ":0$\|node_modules" | head -10
echo "---"
echo "bg-opacity/alpha patterns:"
grep -rn "bg-white/\|bg-black/\|rgba\|bg-opacity" src/components/ 2>/dev/null | grep -v node_modules | head -10
```

## Border radius consistency

```bash
echo "=== BORDER RADIUS ==="
cd SOCELLE-WEB
echo "Unique border-radius values:"
grep -roh "rounded-[a-z]*\|border-radius:\s*[^;]*" src/components/ 2>/dev/null | sort | uniq -c | sort -rn | head -15
```

## Output

Write `docs/qa/design_lock_enforcement.json`

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `grep -c "141418\|F6F3EF\|6E879B" SOCELLE-WEB/tailwind.config.* | head -1  # expect 3+`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/design-lock-enforcer-YYYY-MM-DD.json`
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
