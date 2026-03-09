---
name: system-health-dashboard-validator
description: "Validates Admin Hub system health dashboard coverage for feed health, AI cost/usage, users, and error metrics. Use this skill whenever Admin dashboard telemetry code changes."
---

# System Health Dashboard Validator

## Execution

```bash
cd SOCELLE-WEB
rg -n "AdminDashboard|feed|last_run_at|error|users|AI cost|credits|health" src/pages/admin src/lib
rg -n "data_feeds|audit_logs|credit_ledger|ai_|errors" src/pages/admin/AdminDashboard.tsx src/lib/usePlatformStats.ts src/lib
```

## PASS/FAIL Rules

- PASS: dashboard has live data paths for feed status, AI/credit metrics, user counts, and error summaries.
- FAIL: any required telemetry category missing.

## Output

Write `SOCELLE-WEB/docs/qa/system_health_dashboard_validator_results.json`.
