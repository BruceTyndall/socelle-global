---
name: pg-cron-scheduler-validator
description: "Validates pg_cron scheduling for feed-orchestrator and confirms recent execution telemetry when available. Use this skill whenever feed scheduling migrations or cron jobs are updated."
---

# PG Cron Scheduler Validator

## Execution

```bash
cd SOCELLE-WEB
rg -n "pg_cron|cron\.schedule|feed-orchestrator-hourly|feed-orchestrator" supabase/migrations/
rg -n "feed-orchestrator|last_run_at|feed_run_log" src/pages/admin src/lib supabase/functions/

# Optional live DB verification:
# select * from cron.job where jobname like '%feed-orchestrator%';
# select * from cron.job_run_details order by end_time desc limit 20;
```

## PASS/FAIL Rules

- PASS: hourly schedule migration exists and runtime telemetry paths are present.
- FAIL: missing schedule migration or no operational telemetry surface.

## Output

Write `SOCELLE-WEB/docs/qa/pg_cron_scheduler_validator_results.json` with static and optional live evidence.
