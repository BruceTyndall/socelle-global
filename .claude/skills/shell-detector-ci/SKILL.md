---
name: shell-detector-ci
description: "Runs OPERATION BREAKOUT shell detection CI gate. Use this skill whenever pages/routes change to classify LIVE/DEMO/SHELL and fail if new shells are introduced."
---

# Shell Detector CI

## Execution

```bash
cd SOCELLE-WEB
node scripts/shell-detector.mjs --json > docs/qa/shell_detector_report.json
node scripts/shell-detector.mjs --baseline docs/qa/shell_detector_baseline.json
```

## PASS/FAIL Rules

- PASS: report generated and no new shells beyond baseline.
- FAIL: report missing, baseline missing, or new shells detected.

## Output

Write `SOCELLE-WEB/docs/qa/shell_detector_ci_results.json` with `status`, `new_shells`, and evidence paths.
