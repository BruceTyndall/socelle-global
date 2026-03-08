---
name: data-integrity-suite
description: End-to-end data pipeline validation suite — runs feed-source-auditor, feed-pipeline-checker, signal-data-validator, confidence-scorer, provenance-checker, and data-quality-auditor in sequence with consolidated output.
---

# data-integrity-suite

Coordinated execution of 6 data integrity skills in pipeline order. Produces a single unified report covering all SOCELLE data provenance, freshness, and quality rules.

## Member Skills (Execution Order)

1. `feed-source-auditor` — Allowed/disallowed source list validation
2. `feed-pipeline-checker` — DB to hook to component trace
3. `signal-data-validator` — Freshness SLA and updated_at compliance
4. `confidence-scorer` — Confidence tier on every signal
5. `provenance-checker` — Source citation display verification
6. `data-quality-auditor` — Coverage and completeness audit

## Inputs

| Input | Source | Required |
|---|---|---|
| SOCELLE-WEB/src/hooks/ | Codebase | Yes |
| SOCELLE-WEB/supabase/migrations/ | Codebase | Yes |
| docs/command/SOCELLE_DATA_PROVENANCE_POLICY.md | Command doc | Yes |

## Procedure

### Step 1 — Run feed-source-auditor

```bash
grep -rn 'fetch\|axios\|supabase.from' SOCELLE-WEB/src/hooks/ | head -20
```

Audit all data sources against the allowed/disallowed list in DATA_PROVENANCE_POLICY.md. Verify no disallowed sources are in use.

### Step 2 — Run feed-pipeline-checker

```bash
grep -rn 'useQuery\|supabase.from\|.select(' SOCELLE-WEB/src/hooks/ | wc -l
```

Map complete data flow: Supabase table -> hook -> component. Identify any broken links or orphaned queries.

### Step 3 — Run signal-data-validator

```bash
grep -rn 'updated_at\|isLive\|freshness' SOCELLE-WEB/src/hooks/ | wc -l
```

Verify every signal surface has:
- `updated_at` column in the source table
- Freshness SLA compliance (per DATA_PROVENANCE_POLICY.md)
- No fake timestamps or hardcoded "Updated X ago" strings

### Step 4 — Run confidence-scorer

```bash
grep -rn 'confidence\|score\|tier' SOCELLE-WEB/src/hooks/ | wc -l
```

Verify every data signal has a confidence tier (high/medium/low) derived from source quality and freshness.

### Step 5 — Run provenance-checker

```bash
grep -rn 'source\|citation\|attribution' SOCELLE-WEB/src/components/ | wc -l
```

Verify source citation is displayed on every intelligence surface where data is shown to users.

### Step 6 — Run data-quality-auditor

Audit data completeness: null rates, coverage gaps, stale records, and schema compliance.

### Step 7 — Consolidate Results

```json
{
  "suite": "data-integrity-suite",
  "timestamp": "YYYY-MM-DDTHH:MM:SSZ",
  "members_run": ["feed-source-auditor", "feed-pipeline-checker", "signal-data-validator", "confidence-scorer", "provenance-checker", "data-quality-auditor"],
  "disallowed_sources": 0,
  "broken_pipelines": 0,
  "stale_signals": 0,
  "missing_confidence": 0,
  "missing_provenance": 0,
  "data_quality_score": "95%",
  "overall": "PASS",
  "findings": []
}
```

Save to: `docs/qa/data-integrity-suite-YYYY-MM-DD.json`

## Outputs

| Output | Format | Location |
|---|---|---|
| Consolidated data integrity report | JSON | `docs/qa/data-integrity-suite-YYYY-MM-DD.json` |
| Pipeline trace map | Object in consolidated JSON | Same file |
| Stale signal inventory (if any) | Array in JSON | Same file |

## Verification

**Command:**
```bash
grep -rn 'isLive\|updated_at\|confidence' SOCELLE-WEB/src/hooks/ | wc -l
```
**Pass criteria:** Count > 0 AND `docs/qa/data-integrity-suite-*.json` exists with `"overall": "PASS"`.

## Stop Conditions

- STOP if `SOCELLE_DATA_PROVENANCE_POLICY.md` is not found.
- STOP if no hooks directory exists in SOCELLE-WEB/src/.
- STOP if disallowed sources are detected — must be remediated before proceeding.
- STOP if > 50% of signals lack `updated_at` — systemic issue requires schema work.

## Failure Modes

| Mode | Symptom | Resolution |
|---|---|---|
| Missing provenance doc | Cannot validate source list | Restore from `/docs/command/` |
| New table without updated_at | Signal freshness untrackable | Add `updated_at` column via migration |
| Hardcoded timestamps | Fake freshness on UI | Replace with DB-derived values per CLAUDE.md §F |

## Fade Protocol

**Quarterly re-certification required.** Data sources and pipeline architecture evolve. Re-run after any new table creation, hook addition, or data source onboarding. If DATA_PROVENANCE_POLICY.md is updated, re-certify immediately.
