---
name: feed-health-monitor-auditor
description: "Audits feed health monitoring for retry and freshness checks, including last_run_at and failure escalation. Use this skill whenever feed orchestration or admin health dashboards are updated."
---

# Feed Health Monitor Auditor

## Execution

```bash
cd SOCELLE-WEB
rg -n "last_run_at|last_error|retry|failure|alert|feed_run_log" supabase/functions/feed-orchestrator src/pages/admin/AdminDashboard.tsx src/pages/admin/AdminFeedsHub.tsx supabase/migrations/
```

## PASS/FAIL Rules

- PASS: retry + failure counting logic exists and dashboard surfaces stale/error feed states.
- FAIL: missing retry policy or missing health telemetry visibility.

## Output

Write `SOCELLE-WEB/docs/qa/feed_health_monitor_auditor_results.json`.
