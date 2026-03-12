---
name: token-drift-scanner
description: "Detects design token drift between Figma specs, Tailwind config, and actual component usage. Use this skill to: verify color tokens match SOCELLE_CANONICAL_DOCTRINE.md, find hardcoded hex values not from the design system, check font family compliance, and detect unauthorized style overrides. Triggers on: 'token drift', 'design system audit', 'color check', 'font audit', 'Tailwind config check', 'style drift', 'Figma parity'."
---

# Token Drift Scanner

Detects drift between canonical design tokens and actual codebase usage.

## Canonical token verification

Per SOCELLE_CANONICAL_DOCTRINE.md Pearl Mineral V2:

```bash
echo "=== CANONICAL TOKEN CHECK ==="
cd SOCELLE-WEB
echo "--- tailwind.config ---"
grep -A5 "colors" tailwind.config.* 2>/dev/null | head -30
echo "---"
echo "--- CSS variables ---"
grep -n "var(--" src/index.css 2>/dev/null | head -20
```

## Hardcoded hex detection

```bash
echo "=== HARDCODED HEX VALUES ==="
cd SOCELLE-WEB
# Find hex colors in components that aren't from the design system
grep -rn "#[0-9A-Fa-f]\{6\}" src/components/ src/pages/ 2>/dev/null | grep -v "node_modules\|\.css\|tailwind" | head -20
echo "---"
echo "Unique hex values in components:"
grep -roh "#[0-9A-Fa-f]\{6\}" src/components/ src/pages/ 2>/dev/null | sort -u | head -20
```

## Font family compliance

```bash
echo "=== FONT COMPLIANCE ==="
cd SOCELLE-WEB
# Canonical: no serif on public pages
echo "Serif usage in public pages:"
grep -rn "font-serif\|serif" src/pages/ 2>/dev/null | grep -v "node_modules\|\.d\.ts" | head -10
echo "---"
echo "Font family declarations:"
grep -rn "fontFamily\|font-family" src/ tailwind.config.* 2>/dev/null | grep -v node_modules | head -10
```

## Glass/blur effect compliance

```bash
echo "=== GLASS EFFECT CHECK ==="
cd SOCELLE-WEB
# Pearl Mineral V2 uses glass/blur effects
grep -rn "backdrop-blur\|glass\|bg-opacity\|bg-white/\|bg-black/" src/ 2>/dev/null | grep -v node_modules | head -15
```

## Figma token mapping check

```bash
echo "=== FIGMA TOKEN PARITY ==="
cd SOCELLE-WEB
# Check if Figma handoff doc tokens are reflected in Tailwind config
echo "Design system tokens in tailwind.config:"
grep -c "mn-\|socelle-\|pearl-\|mineral-" tailwind.config.* 2>/dev/null
echo "CSS custom properties:"
grep -c "\-\-mn-\|\-\-socelle-\|\-\-pearl-" src/index.css 2>/dev/null
```

## Output

Write `docs/qa/token_drift_scan.json`:

```json
{
  "scan_date": "ISO",
  "hardcoded_hex_values": [],
  "unauthorized_fonts": [],
  "glass_effects_count": 0,
  "tailwind_custom_tokens": 0,
  "css_custom_properties": 0,
  "drift_items": [],
  "compliance": "PASS/FAIL"
}
```

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `grep -c "#141418\|#F6F3EF\|#6E879B" SOCELLE-WEB/tailwind.config.* | head -1  # expect > 0`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/token-drift-scanner-YYYY-MM-DD.json`
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
