---
name: credit-deduction-integration-tester
description: "Verifies server-side credit deduction flow (deduct_credits RPC, credit ledger write, balance decrease, and 402 on insufficient credits). Use this skill whenever ai-orchestrator or credit economy code changes."
---

# Credit Deduction Integration Tester

## Execution

```bash
cd SOCELLE-WEB
rg -n "deduct_credits|insufficient_credits|402|credit_ledger|balanceAfter" supabase/functions/ai-orchestrator/index.ts src/lib/analysis/creditGate.ts supabase/migrations/

# Contract/unit tests
npm run test -- src/lib/analysis/__tests__/creditGate.test.ts src/lib/credits/__tests__/useCreditBalance.test.ts
```

## PASS/FAIL Rules

- PASS: deduct RPC call exists before model call, 402 path exists, and tests pass.
- FAIL: missing server-side enforcement path or failing tests.

## Output

Write `SOCELLE-WEB/docs/qa/credit_deduction_integration_tester_results.json` with test summary and evidence lines.
