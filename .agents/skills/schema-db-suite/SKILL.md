---
name: schema-db-suite
description: Database schema health suite — runs db-inspector, migration-validator, schema-drift-detector, and type-generation-validator in sequence. Single pass for migrations, drift, types, and RLS with consolidated output.
---

# schema-db-suite

Coordinated execution of 4 database/schema skills in dependency order. Produces a single unified report covering all Supabase schema health, migration integrity, and type safety rules.

## Member Skills (Execution Order)

1. `migration-validator` — Ordering, ADD-ONLY compliance, naming conventions
2. `schema-drift-detector` — database.types.ts vs actual migrations drift
3. `type-generation-validator` — TypeScript type coverage and strict mode
4. `db-inspector` — Full schema inventory + RLS policy check

## Inputs

| Input | Source | Required |
|---|---|---|
| SOCELLE-WEB/supabase/migrations/ | Codebase | Yes |
| SOCELLE-WEB/src/types/database.types.ts | Codebase | Yes |
| SOCELLE-WEB/supabase/ | Supabase config | Yes |

## Procedure

### Step 1 — Run migration-validator

```bash
ls SOCELLE-WEB/supabase/migrations/*.sql | wc -l
```

Verify:
- Migration files ordered by timestamp prefix
- ADD-ONLY compliance (no DROP in production migrations)
- Naming conventions followed (snake_case, descriptive)
- No conflicting migrations (same timestamp, different content)

### Step 2 — Run schema-drift-detector

```bash
grep -c 'export type' SOCELLE-WEB/src/types/database.types.ts 2>/dev/null || echo 0
```

Cross-reference database.types.ts against migration-defined tables. Detect:
- Tables in types but not in migrations (phantom types)
- Tables in migrations but not in types (missing generation)
- Column mismatches (type, nullability, defaults)

### Step 3 — Run type-generation-validator

```bash
grep -rn ': any' SOCELLE-WEB/src/ | wc -l
```

Verify:
- database.types.ts covers all tables
- No manual type overrides that conflict with generated types
- No `any` types where database types should be used
- Strict mode compliance (noImplicitAny, strictNullChecks)

### Step 4 — Run db-inspector

Full schema inventory including:
- All tables with column counts
- RLS policies per table (enabled/disabled, policy count)
- Indexes, foreign keys, triggers
- Storage buckets and their policies

### Step 5 — Consolidate Results

```json
{
  "suite": "schema-db-suite",
  "timestamp": "YYYY-MM-DDTHH:MM:SSZ",
  "members_run": ["migration-validator", "schema-drift-detector", "type-generation-validator", "db-inspector"],
  "migration_count": 0,
  "migration_valid": true,
  "drift_count": 0,
  "type_coverage": "100%",
  "any_type_count": 0,
  "rls_coverage": "100%",
  "overall": "PASS",
  "findings": []
}
```

Save to: `docs/qa/schema-db-suite-YYYY-MM-DD.json`

## Outputs

| Output | Format | Location |
|---|---|---|
| Consolidated schema health report | JSON | `docs/qa/schema-db-suite-YYYY-MM-DD.json` |
| Schema inventory | Object in consolidated JSON | Same file |
| Drift inventory (if any) | Array in JSON | Same file |

## Verification

**Command:**
```bash
ls SOCELLE-WEB/supabase/migrations/*.sql | wc -l
```
**Pass criteria:** Count > 0 AND `docs/qa/schema-db-suite-*.json` exists with `"overall": "PASS"`.

## Stop Conditions

- STOP if no migrations directory found — Supabase not initialized.
- STOP if database.types.ts does not exist — type generation not configured.
- STOP if DROP statements found in recent migrations — must review before proceeding.
- Only Backend Agent may create/modify Supabase migrations (AGENTS.md §C).

## Failure Modes

| Mode | Symptom | Resolution |
|---|---|---|
| Missing migrations dir | No schema to validate | Initialize Supabase project |
| Type generation stale | Drift between DB and types | Run `supabase gen types typescript` |
| RLS disabled on table | Security gap | Add RLS policies via migration |

## Fade Protocol

**Quarterly re-certification required.** Schema evolves with feature development. Re-run after any migration, type regeneration, or RLS policy change. If new tables are added, re-certify immediately.
