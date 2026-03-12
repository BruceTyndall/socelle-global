---
name: error-state-enforcer
description: "Validates error-state handling with retry and fallback patterns across data surfaces. Use this skill whenever data fetching and page-level error handling changes."
---

# Error State Enforcer

## Execution

```bash
cd SOCELLE-WEB
rg -n "isError|errorObj|ErrorBoundary|retry|Retry|fallback|stale data|cached" src/pages src/components src/lib
rg -n "useQuery\(|queryFn" src/pages src/components src/lib
```

## PASS/FAIL Rules

- PASS: error paths render user-facing retry and fallback guidance.
- FAIL: data surface has no explicit error rendering path.

## Output

Write `SOCELLE-WEB/docs/qa/error_state_enforcer_results.json` with missing paths and evidence.
