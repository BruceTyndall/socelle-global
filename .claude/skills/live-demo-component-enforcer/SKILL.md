---
name: live-demo-component-enforcer
description: "Enforces LIVE/DEMO labeling at component level, not just page level. Use this skill whenever data-bound components or hooks are changed."
---

# LIVE/DEMO Component Enforcer

## Execution

```bash
cd SOCELLE-WEB
rg -n "isLive|DEMO|LIVE|data label" src/components src/lib src/pages
rg -n "useQuery|supabase\.from\(" src/components src/pages
```

## PASS/FAIL Rules

- PASS: data-bound components expose clear LIVE/DEMO state labeling and fallback behavior.
- FAIL: unlabeled mock surfaces or missing state labels on data components.

## Output

Write `SOCELLE-WEB/docs/qa/live_demo_component_enforcer_results.json` with unlabeled component list.
