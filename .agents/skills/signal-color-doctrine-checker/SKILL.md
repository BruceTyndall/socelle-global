---
name: signal-color-doctrine-checker
description: "Checks Pearl Mineral V2 signal color doctrine on mobile surfaces. Use this skill whenever signal badges/charts/theme colors are changed in mobile code."
---

# Signal Color Doctrine Checker

## Execution

```bash
cd /Users/brucetyndall/Documents/GitHub/SOCELLE\ GLOBAL/SOCELLE-MOBILE-main
rg -n "5F8A72|A97A4C|8E6464|signal-up|signal-warn|signal-down" apps/mobile/lib
```

## PASS/FAIL Rules

- PASS: all required doctrine colors are present in mobile signal styling.
- FAIL: missing color mappings or mismatched hex values.

## Output

Write `/Users/brucetyndall/Documents/GitHub/SOCELLE GLOBAL/SOCELLE-WEB/docs/qa/signal_color_doctrine_checker_results.json`.
