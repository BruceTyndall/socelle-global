---
name: database-types-generator
description: "Regenerates and validates database.types.ts freshness against migrations. Use this skill whenever Supabase schema migrations are added or modified."
---

# Database Types Generator

## Execution

```bash
cd SOCELLE-WEB
# If Supabase CLI configured:
# supabase gen types typescript --local > src/lib/database.types.ts

# Always run freshness checks:
ls supabase/migrations | wc -l
rg -n "Tables|Enums|Functions|feature_flags|audit_logs|edge_function_controls|ai_rate_limits" src/lib/database.types.ts
```

## PASS/FAIL Rules

- PASS: type file contains latest schema entities and generation command succeeds when available.
- FAIL: missing entities or stale type definitions.

## Output

Write `SOCELLE-WEB/docs/qa/database_types_generator_results.json` with migration count and entity coverage.
