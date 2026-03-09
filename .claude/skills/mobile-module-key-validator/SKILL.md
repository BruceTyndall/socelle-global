---
name: mobile-module-key-validator
description: "Validates required mobile MODULE_* keys for OPERATION BREAKOUT. Use this skill whenever mobile entitlement keys or module access mappings change."
---

# Mobile Module Key Validator

## Execution

```bash
cd /Users/brucetyndall/Documents/GitHub/SOCELLE\ GLOBAL/SOCELLE-MOBILE-main
rg -n "MODULE_BOOKING|MODULE_BRANDS|MODULE_JOBS|MODULE_EVENTS|MODULE_STUDIO" apps/mobile/lib
```

## PASS/FAIL Rules

- PASS: all five required module keys exist in mobile module access model/logic.
- FAIL: any key missing.

## Output

Write `/Users/brucetyndall/Documents/GitHub/SOCELLE GLOBAL/SOCELLE-WEB/docs/qa/mobile_module_key_validator_results.json`.
