---
name: shared-state-components-auditor
description: "Audits consistency of shared EmptyState, ErrorState, and LoadingSkeleton components across pages. Use this skill whenever shared UI state components or page state handling changes."
---

# Shared State Components Auditor

## Execution

```bash
cd SOCELLE-WEB
rg -n "export .*EmptyState|export .*ErrorState|export .*LoadingSkeleton|function EmptyState|function ErrorState|function LoadingSkeleton" src/components src/
rg -n "EmptyState|ErrorState|LoadingSkeleton" src/pages src/components
```

## PASS/FAIL Rules

- PASS: shared components exist and are reused consistently by pages.
- FAIL: pages duplicate bespoke state UIs without shared components.

## Output

Write `SOCELLE-WEB/docs/qa/shared_state_components_auditor_results.json` with duplicate implementations list.
