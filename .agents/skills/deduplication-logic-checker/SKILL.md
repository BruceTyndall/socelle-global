---
name: deduplication-logic-checker
description: "Validates feed dedup logic in rss-to-signals and related ingestion paths. Use this skill whenever feed ingestion code or signal creation logic changes."
---

# Deduplication Logic Checker

## Execution

```bash
cd SOCELLE-WEB
rg -n "duplicate|dedup|dedupe|existing signal|source_url|title" supabase/functions/rss-to-signals supabase/functions/feed-orchestrator src/lib src/
rg -n "insert\(|upsert\(" supabase/functions/rss-to-signals/index.ts
```

## PASS/FAIL Rules

- PASS: dedup guards exist for duplicate URL/title/source identity before insert.
- FAIL: direct insert path with no duplicate check.

## Output

Write `SOCELLE-WEB/docs/qa/deduplication_logic_checker_results.json` with missing guard list.
