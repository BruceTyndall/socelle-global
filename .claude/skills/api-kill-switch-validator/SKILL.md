---
name: api-kill-switch-validator
description: "Validates OPERATION BREAKOUT CTRL-WO-02 API kill-switch coverage. Use this skill whenever edge function controls, admin API controls UI, or runtime disable checks are changed."
---

# API Kill-Switch Validator

Checks edge-function control schema, admin toggle surface, and runtime enforcement readiness.

## Execution

Run from repo root.

```bash
cd SOCELLE-WEB

echo "=== EDGE FUNCTION CONTROLS SCHEMA ==="
rg -n "CREATE TABLE IF NOT EXISTS public\.edge_function_controls|is_enabled|last_toggled" supabase/migrations/*edge_function_controls* supabase/migrations/

echo "=== SEEDED CONTROLS ==="
rg -n "INSERT INTO public\.edge_function_controls" supabase/migrations/*edge_function_controls*

echo "=== ADMIN KILL-SWITCH UI + HOOK ==="
rg -n "AdminApiControls|edge_function_controls|is_enabled|useEdgeFunctionControls|useToggleEdgeFunction" src/pages/admin/AdminApiControls.tsx src/lib/useEdgeFunctionControls.ts

echo "=== EDGE FUNCTION INVENTORY COUNT ==="
ls supabase/functions | wc -l

echo "=== RUNTIME ENFORCEMENT CHECKS ==="
rg -n "edge_function_controls|is_enabled|kill-switch|kill switch" supabase/functions/
```

## PASS/FAIL Rules

- PASS: control table exists with toggle fields, admin toggle UI/hook exists, seeded controls present, and runtime enforcement path is implemented for edge functions.
- FAIL: missing schema/UI or no runtime enforcement checks.

## Output

Write `SOCELLE-WEB/docs/qa/api_kill_switch_validator_results.json`:

```json
{
  "skill": "api-kill-switch-validator",
  "timestamp": "ISO-8601",
  "status": "PASS|FAIL",
  "checks": [
    { "name": "control_schema", "status": "PASS|FAIL", "evidence": "" },
    { "name": "seeded_controls", "status": "PASS|FAIL", "evidence": "" },
    { "name": "admin_toggle_surface", "status": "PASS|FAIL", "evidence": "" },
    { "name": "runtime_enforcement", "status": "PASS|FAIL", "evidence": "" }
  ],
  "summary": { "pass_count": 0, "fail_count": 0 }
}
```

## Stop Conditions

- Hard stop: cannot enumerate `supabase/functions`.
- Soft stop: seeded controls count is lower than function count; record explicit gap list.
