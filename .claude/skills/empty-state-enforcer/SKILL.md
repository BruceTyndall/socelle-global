---
name: empty-state-enforcer
description: "Scans list/table surfaces for illustrated empty states with CTA actions. Use this skill whenever table/list pages or data hooks are changed."
---

# Empty State Enforcer

## Execution

```bash
cd SOCELLE-WEB
rg -n "empty state|No .* found|EmptyState|illustration|CTA|Try again|Create" src/pages src/components
rg -n "table|list|rows\.length|data\.length|isEmpty" src/pages src/components
```

## PASS/FAIL Rules

- PASS: list/table surfaces include explicit empty-state branch with CTA.
- FAIL: detected list/table with no empty-state handling.

## Output

Write `SOCELLE-WEB/docs/qa/empty_state_enforcer_results.json` with `missing_empty_state` entries and evidence.
