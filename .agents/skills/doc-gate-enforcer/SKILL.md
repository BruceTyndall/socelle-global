---
name: doc-gate-enforcer
description: "Enforces the Doc Gate rules from AGENTS.md §B against agent outputs and codebase state. Use this skill to: check for unauthorized governance docs, verify WO IDs exist in build_tracker.md, detect ecommerce elevation violations, find outreach email content, and validate command doc citations. Triggers on: 'doc gate', 'governance check', 'WO validation', 'ecommerce elevation check', 'outreach check', 'FAIL condition scan'."
---

# Doc Gate Enforcer

Checks all 7 FAIL conditions from `/.Codex/AGENTS.md` §B.

## FAIL 1: External doc reference as authority

```bash
echo "=== FAIL 1: EXTERNAL DOC REFERENCES ==="
cd SOCELLE-WEB
# Find references to non-command docs used as authority
grep -rn "Per.*\.md\|According to.*\.md\|as defined in.*\.md" src/ docs/ 2>/dev/null | grep -v "command/" | grep -v "node_modules" | head -10
echo "---"
# Check for unauthorized governance docs
find . -name "GOVERNANCE*.md" -o -name "MASTER_PLAN*.md" -o -name "REBUILD_PLAN*.md" 2>/dev/null | grep -v node_modules
```

## FAIL 2: Unauthorized work orders

```bash
echo "=== FAIL 2: WO ID VALIDATION ==="
cd SOCELLE-WEB
# Extract all WO IDs referenced in codebase
grep -rn "W[0-9]\+-[0-9]\+\|WO-[0-9]\+" src/ docs/ 2>/dev/null | grep -v "node_modules\|build_tracker" | head -20
echo "---"
echo "WO IDs in build_tracker.md:"
grep -c "W[0-9]\+-[0-9]\+" docs/build_tracker.md 2>/dev/null || echo "build_tracker.md NOT FOUND"
```

## FAIL 5: Route coverage check

```bash
echo "=== FAIL 5: ROUTE COVERAGE ==="
cd SOCELLE-WEB
echo "Routes in GLOBAL_SITE_MAP.md:"
grep -c "^|.*/" ../docs/command/GLOBAL_SITE_MAP.md 2>/dev/null || echo "NOT FOUND"
echo "Routes in App.tsx:"
grep -c "path=" src/App.tsx 2>/dev/null || echo "NOT FOUND"
```

## FAIL 6: Ecommerce elevation

```bash
echo "=== FAIL 6: ECOMMERCE ELEVATION ==="
cd SOCELLE-WEB
# Check MainNav for commerce links
grep -n "shop\|Store\|Buy\|Cart\|ecommerce" src/components/navigation/ 2>/dev/null | grep -vi "portal\|brand\|admin" | head -10
echo "---"
# Check if commerce routes are public (not portal-scoped)
grep -n "path=.*shop\|path=.*store\|path=.*cart" src/App.tsx 2>/dev/null | grep -v "portal\|brand\|admin" | head -5
```

## FAIL 7: Outreach email content

```bash
echo "=== FAIL 7: OUTREACH CONTENT ==="
cd SOCELLE-WEB
grep -rn "cold.*email\|outreach\|cold.*DM\|acquisition.*email" src/ supabase/ 2>/dev/null | grep -v node_modules | head -10
echo "---"
# Check edge functions for non-transactional email usage
grep -rn "send.*email\|sendEmail" supabase/functions/ 2>/dev/null | head -10
```

## Output

Write `docs/qa/doc_gate_results.json`:

```json
{
  "scan_date": "ISO",
  "fail_1_external_refs": [],
  "fail_2_invalid_wos": [],
  "fail_5_route_gaps": 0,
  "fail_6_ecommerce_elevation": [],
  "fail_7_outreach_content": [],
  "overall": "PASS/FAIL"
}
```

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `ls docs/command/*.md | wc -l  # expect >= 8`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/doc-gate-enforcer-YYYY-MM-DD.json`
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
