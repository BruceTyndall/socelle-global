---
name: inventory-report-generator
description: "Generates SOCELLE global inventory report artifact from repository counts. Use this skill before each build gate to regenerate canonical inventory metrics."
---

# Inventory Report Generator

## Execution

```bash
cd SOCELLE-WEB
node scripts/generate-inventory.mjs

# Required artifact
test -f docs/inventory/SOCELLE_GLOBAL_INVENTORY_REPORT.md && echo "report exists"
```

## PASS/FAIL Rules

- PASS: script exits 0 and markdown artifact is produced.
- FAIL: script or artifact missing.

## Output

Write `SOCELLE-WEB/docs/qa/inventory_report_generator_results.json` with artifact path and timestamp.
