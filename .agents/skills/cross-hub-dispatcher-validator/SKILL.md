---
name: cross-hub-dispatcher-validator
description: "Validates SignalAction contract and CrossHubActionDispatcher wiring across action types and target hubs. Use this skill whenever signal-to-action flow code changes."
---

# Cross-Hub Dispatcher Validator

## Execution

```bash
cd SOCELLE-WEB
rg -n "interface SignalAction|action_type|target_hub|CrossHubActionDispatcher" src/components/CrossHubActionDispatcher.tsx src/
rg -n "create_deal|add_to_crm|create_campaign|assign_training|price_alert|create_brief|create_alert|add_to_note|create_protocol" src/components/CrossHubActionDispatcher.tsx
```

## PASS/FAIL Rules

- PASS: contract fields exist and all required `action_type` variants are handled.
- FAIL: missing contract field or unhandled action type.

## Output

Write `SOCELLE-WEB/docs/qa/cross_hub_dispatcher_validator_results.json` with missing fields/types arrays.
