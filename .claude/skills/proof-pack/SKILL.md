---
name: proof-pack
description: "Aggregates all QA audit outputs into a single proof-pack bundle for release gate review. Use this skill to: collect all docs/qa/*.json outputs, generate a summary report, create a timestamped proof archive, and produce a pass/fail gate decision. Triggers on: 'proof pack', 'bundle audits', 'release evidence', 'gate review', 'collect QA results', 'audit summary'."
---

# Proof Pack

Aggregates all QA audit JSON outputs into a single release-gate evidence bundle.

## Collect all audit outputs

```bash
echo "=== PROOF PACK COLLECTION ==="
cd SOCELLE-WEB
mkdir -p docs/qa
echo "Available audit files:"
ls -la docs/qa/*.json 2>/dev/null || echo "NO AUDIT FILES FOUND"
echo ""
echo "Available screenshots:"
ls docs/qa/screenshots/ 2>/dev/null | wc -l
echo " screenshot files"
```

## Generate summary

```bash
echo "=== PROOF PACK SUMMARY ==="
cd SOCELLE-WEB
for f in docs/qa/*.json; do
  if [ -f "$f" ]; then
    name=$(basename "$f" .json)
    echo "--- $name ---"
    cat "$f" | head -5
    echo "..."
  fi
done
```

## Gate decision

Read each audit JSON and produce a single pass/fail:

```bash
cd SOCELLE-WEB
echo "=== GATE DECISION ==="
PASS=true

# Check build gate
if [ -f docs/qa/build_gate_results.json ]; then
  BUILD=$(grep -o '"overall":"[^"]*"' docs/qa/build_gate_results.json 2>/dev/null | head -1)
  echo "Build Gate: $BUILD"
  echo "$BUILD" | grep -q "FAIL" && PASS=false
else
  echo "Build Gate: NOT RUN"
  PASS=false
fi

# Check secrets scan
if [ -f docs/qa/secrets_scan.json ]; then
  LEAKS=$(grep -o '"leaked_secrets":\[\]' docs/qa/secrets_scan.json 2>/dev/null)
  if [ -n "$LEAKS" ]; then
    echo "Secrets Scan: PASS (no leaks)"
  else
    echo "Secrets Scan: FAIL (leaks detected)"
    PASS=false
  fi
else
  echo "Secrets Scan: NOT RUN"
fi

echo ""
echo "OVERALL: $($PASS && echo 'PASS' || echo 'FAIL')"
```

## Output

Write `docs/qa/proof_pack_summary.json`:

```json
{
  "pack_date": "ISO",
  "audits_collected": ["build_gate", "secrets_scan", "db_inspection", "edge_fn_health", "crawl_results"],
  "gate_decision": "PASS/FAIL",
  "failures": [],
  "screenshots_count": 0
}
```

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `ls docs/qa/*.json 2>/dev/null | wc -l  # expect > 0 after audit run`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/proof-pack-YYYY-MM-DD.json`
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
