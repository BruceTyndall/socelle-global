---
name: rate-limiter-tester
description: "Tests ai-orchestrator tiered rate limiting (Starter 5/min, Pro 15/min, Enterprise 60/min). Use this skill whenever ai_rate_limits schema or ai-orchestrator rate-limit logic changes."
---

# Rate Limiter Tester

## Execution

```bash
cd SOCELLE-WEB
rg -n "ai_rate_limits|check_ai_rate_limit|5/min|15/min|60/min" supabase/migrations/ supabase/functions/ai-orchestrator/index.ts

# Optional live test (requires env + auth tokens)
# curl -X POST "$VITE_SUPABASE_URL/functions/v1/ai-orchestrator" ... repeat 6x as starter user
```

## PASS/FAIL Rules

- PASS: schema + function checks exist and live test returns 429 at threshold when executed.
- FAIL: missing schema/function or live test shows no threshold enforcement.

## Output

Write `SOCELLE-WEB/docs/qa/rate_limiter_tester_results.json` including static checks and live test evidence.
