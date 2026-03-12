---
name: dlq-system-checker
description: "Verifies dead letter queue (DLQ) schema, write path, and admin visibility for failed feed items. Use this skill whenever feed failure handling is modified."
---

# DLQ System Checker

## Execution

```bash
cd SOCELLE-WEB
rg -n "dead letter|dlq|failed_items|failed feed|retry" supabase/migrations/ supabase/functions/ src/pages/admin src/lib
```

## PASS/FAIL Rules

- PASS: DLQ table exists, failed feed writes exist, and admin UI exposes DLQ data.
- FAIL: any of schema/write/view path missing.

## Output

Write `SOCELLE-WEB/docs/qa/dlq_system_checker_results.json`.
