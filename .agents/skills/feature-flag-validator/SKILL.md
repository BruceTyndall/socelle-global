---
name: feature-flag-validator
description: "Validates the full feature flag implementation for OPERATION BREAKOUT CTRL-WO-01. Use this skill whenever feature flag schema, useFeatureFlag behavior, edge-function flag checks, or Admin Feature Flags UI changes are introduced."
---

# Feature Flag Validator

Validates end-to-end feature flag readiness: schema, hook logic, admin controls, and server-side checks.

## Execution

Run from repo root.

```bash
cd SOCELLE-WEB

echo "=== FEATURE FLAG TABLE SCHEMA ==="
rg -n "CREATE TABLE IF NOT EXISTS public\.feature_flags|flag_key|default_enabled|enabled_tiers|enabled_user_ids|rollout_percentage" supabase/migrations/

echo "=== useFeatureFlag LOGIC ==="
rg -n "export function useFeatureFlag|evaluateFlag|enabled_user_ids|enabled_tiers|rollout_percentage|default_enabled" src/lib/useFeatureFlag.ts

echo "=== ADMIN FEATURE FLAGS UI ==="
rg -n "feature_flags|enabled_user_ids|rollout_percentage|default_enabled|New Flag|Feature Flags" src/pages/admin/AdminFeatureFlags.tsx

echo "=== EDGE FUNCTION FLAG CHECKS ==="
rg -n "checkFlag\(|check_feature_access\(|feature_flags" supabase/functions/ supabase/migrations/
```

## PASS/FAIL Rules

- PASS: All required schema columns exist, `useFeatureFlag` evaluates in owner-defined order, admin UI supports toggle/tier/user/rollout controls, and at least one server-side check path exists for edge functions.
- FAIL: Missing required schema fields, missing hook logic, missing admin controls, or no server-side flag check path.

## Output

Write `SOCELLE-WEB/docs/qa/feature_flag_validator_results.json`:

```json
{
  "skill": "feature-flag-validator",
  "timestamp": "ISO-8601",
  "status": "PASS|FAIL",
  "checks": [
    { "name": "schema", "status": "PASS|FAIL", "evidence": "" },
    { "name": "client_hook", "status": "PASS|FAIL", "evidence": "" },
    { "name": "admin_ui", "status": "PASS|FAIL", "evidence": "" },
    { "name": "edge_checks", "status": "PASS|FAIL", "evidence": "" }
  ],
  "summary": { "pass_count": 0, "fail_count": 0 }
}
```

## Stop Conditions

- Hard stop: `SOCELLE-WEB/` missing.
- Hard stop: migrations or source files cannot be read.
- Soft stop: flag schema variants conflict across multiple migrations; escalate before auto-fixing.
