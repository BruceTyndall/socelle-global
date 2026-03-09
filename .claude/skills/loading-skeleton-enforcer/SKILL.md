---
name: loading-skeleton-enforcer
description: "Confirms loading skeleton presence on TanStack Query isLoading transitions. Use this skill whenever async page/component loading flows are edited."
---

# Loading Skeleton Enforcer

## Execution

```bash
cd SOCELLE-WEB
rg -n "isLoading|loading" src/pages src/components src/lib
rg -n "animate-pulse|Skeleton|LoadingSkeleton|shimmer" src/pages src/components
```

## PASS/FAIL Rules

- PASS: each major data surface using `isLoading` renders a skeleton/shimmer state.
- FAIL: loading branch missing or uses blank placeholder only.

## Output

Write `SOCELLE-WEB/docs/qa/loading_skeleton_enforcer_results.json`.
