---
name: design-iteration-automator
description: "Iterates on UI prototypes and components by running design audits, applying fixes, and cleaning up code in automated cycles. Use this skill whenever someone asks to iterate on a design, clean up component code, refine a prototype, run design audit and fix cycles, or automate design reviews. Also triggers on: 'iterate design', 'design iteration', 'refine prototype', 'cleanup component', 'design audit loop', 'auto-fix design', 'iterate UI', 'polish component'."
---

# Design Iteration Automator

Runs automated audit-and-fix cycles on UI components. Instead of manually checking design compliance, fixing, re-checking, and repeating, this skill runs the full loop: audit → identify violations → generate fixes → validate → report. This is the "CI/CD for design" skill.

## Iteration Cycle

```
Audit → Categorize Violations → Generate Fixes → Apply → Re-audit → Report
```

## Step 1: Run Design Audit Battery

```bash
echo "=== DESIGN AUDIT BATTERY ==="
cd SOCELLE-WEB
TARGET="$1"  # Component or page path

# Color compliance
echo "1. COLOR AUDIT:"
violations=0
grep -n "#1E252B\|#000000\|bg-black\|text-black" "$TARGET" 2>/dev/null && violations=$((violations+1))

# Typography
echo "2. TYPOGRAPHY AUDIT:"
grep -n "font-serif\|Georgia\|Times.*Roman" "$TARGET" 2>/dev/null && violations=$((violations+1))

# Glass morphism
echo "3. GLASS PATTERN:"
has_glass=$(grep -c "backdrop-blur\|bg-white/" "$TARGET" 2>/dev/null)
[ "$has_glass" -eq 0 ] && echo "  MISSING: No glass pattern" && violations=$((violations+1))

# Border radius
echo "4. BORDER RADIUS:"
grep -n "rounded-sm\|rounded-md\|rounded-lg" "$TARGET" 2>/dev/null | grep -v "rounded-xl\|rounded-2xl" && violations=$((violations+1))

# Responsive
echo "5. RESPONSIVE:"
bp_count=$(grep -c "sm:\|md:\|lg:" "$TARGET" 2>/dev/null)
[ "$bp_count" -lt 3 ] && echo "  WARNING: Only $bp_count breakpoints (need 3+)" && violations=$((violations+1))

# DEMO/LIVE
echo "6. DATA TRUTH:"
grep -c "isLive\|DEMO\|PREVIEW" "$TARGET" 2>/dev/null || (echo "  MISSING: No LIVE/DEMO handling" && violations=$((violations+1)))

echo "---"
echo "Total violations: $violations"
```

## Step 2: Generate Fixes

For each violation category, apply automated fixes:

| Violation | Auto-Fix |
|-----------|----------|
| Wrong color hex | Replace with correct Pearl Mineral V2 token |
| Serif font | Replace with Inter stack |
| Missing glass | Add `backdrop-blur-md bg-white/70` to card containers |
| Wrong border radius | Replace `rounded-md` → `rounded-2xl` for cards |
| Missing breakpoints | Add responsive classes to layout elements |
| Missing DEMO badge | Add `isLive` prop and conditional badge |

## Step 3: Apply and Re-audit

After applying fixes:
1. Re-run the full audit battery
2. TypeScript check: `npx tsc --noEmit`
3. Compare before/after violation count
4. If violations remain, run another iteration (max 3 iterations)

## Step 4: Report

```markdown
## Design Iteration Report — [Component]

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| Color violations | X | 0 | -X |
| Typography violations | X | 0 | -X |
| Glass pattern | missing | present | ✓ |
| Responsive breakpoints | X | 3+ | +Y |
| DEMO/LIVE handling | missing | present | ✓ |
| Iterations needed | - | N | - |
| Typecheck | pass/fail | pass | ✓ |
```

## Output

Write to `docs/qa/design_iteration.json`:
```json
{
  "skill": "design-iteration-automator",
  "component": "",
  "iterations_run": 0,
  "violations_before": 0,
  "violations_after": 0,
  "fixes_applied": 0,
  "typecheck_pass": true,
  "timestamp": "ISO-8601"
}
```

## Fade Protocol
Update when design locks change (new colors, new patterns, new breakpoints).

## Verification (Deterministic)
- **Command:** `find docs/qa -name "design-iteration-automator*.json" | wc -l  # expect >= 1`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/design-iteration-automator-YYYY-MM-DD.json`
- **Fail criteria:** Command returns unexpected value, report not generated, or any BLOCK-level issue found without resolution


## Stop Conditions
- **Hard stop:** Codebase does not compile (`npx tsc --noEmit` fails) — fix build before running this skill
- **Hard stop:** Target path does not exist or is empty — verify repo checkout
- **Hard stop:** Required command-line tool missing (grep, find, node) — install before proceeding
- **Soft stop (owner decision):** More than 50 issues found — present summary to owner for prioritization before attempting fixes
- **Soft stop (owner decision):** Findings contradict a command doc — escalate to owner; do not auto-fix governance
