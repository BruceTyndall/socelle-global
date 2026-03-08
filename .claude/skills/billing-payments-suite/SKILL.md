---
name: billing-payments-suite
description: Unified billing and payments validation suite — runs stripe-integration-tester, payment-flow-tester, billing-scenario-simulator, and credit-economy-validator in sequence with single verification entrypoint and consolidated output.
---

# billing-payments-suite

Coordinated execution of 4 billing/payments skills in dependency order. Produces a single unified report covering all SOCELLE payment infrastructure, subscription lifecycle, and credit economy rules.

## Member Skills (Execution Order)

1. `stripe-integration-tester` — Webhook handlers, product/price IDs, test vs prod mode
2. `payment-flow-tester` — Checkout components, subscription management UI
3. `billing-scenario-simulator` — Upgrade/downgrade/cancel edge cases
4. `credit-economy-validator` — Credit allocation, deduction logic, overage handling

## Inputs

| Input | Source | Required |
|---|---|---|
| SOCELLE-WEB/src/ | Codebase | Yes |
| SOCELLE-WEB/supabase/functions/ | Edge functions | Yes |
| docs/command/SOCELLE_ENTITLEMENTS_PACKAGING.md | Command doc | Yes |

## Procedure

### Step 1 — Run stripe-integration-tester

```bash
grep -rn 'stripe\|webhook\|price_\|prod_' SOCELLE-WEB/supabase/functions/ | wc -l
```

Verify:
- All Stripe webhook handlers exist and are wired
- Product/price IDs match entitlements doc
- Test mode vs production mode correctly configured
- No hardcoded Stripe keys in source (defer to secrets-scanner)

### Step 2 — Run payment-flow-tester

```bash
grep -rn 'checkout\|subscription\|payment\|billing' SOCELLE-WEB/src/components/ | wc -l
```

Verify checkout components, subscription management UI, and payment form rendering.

### Step 3 — Run billing-scenario-simulator

Simulate edge cases:
- New subscription (free -> paid)
- Upgrade (Starter -> Pro -> Enterprise)
- Downgrade (Enterprise -> Pro -> Starter)
- Cancellation (immediate vs end-of-period)
- Payment failure (retry logic, grace period)
- Proration calculations

### Step 4 — Run credit-economy-validator

```bash
grep -rn 'credit\|allocation\|deduction\|balance\|overage' SOCELLE-WEB/src/ | wc -l
```

Verify:
- Credit allocation per tier matches ENTITLEMENTS_PACKAGING.md
- Deduction logic is correct per AI action type
- Balance tracking is accurate
- Overage handling follows documented rules

### Step 5 — Consolidate Results

```json
{
  "suite": "billing-payments-suite",
  "timestamp": "YYYY-MM-DDTHH:MM:SSZ",
  "members_run": ["stripe-integration-tester", "payment-flow-tester", "billing-scenario-simulator", "credit-economy-validator"],
  "stripe_hooks_valid": true,
  "payment_flows_pass": true,
  "scenario_failures": 0,
  "credit_economy_valid": true,
  "overall": "PASS",
  "findings": []
}
```

Save to: `docs/qa/billing-payments-suite-YYYY-MM-DD.json`

## Outputs

| Output | Format | Location |
|---|---|---|
| Consolidated billing audit report | JSON | `docs/qa/billing-payments-suite-YYYY-MM-DD.json` |
| Scenario test results | Array in consolidated JSON | Same file |
| Credit economy validation | Object in JSON | Same file |

## Verification

**Command:**
```bash
grep -rn 'stripe\|subscription\|payment' SOCELLE-WEB/src/ | wc -l
```
**Pass criteria:** Count > 0 AND `docs/qa/billing-payments-suite-*.json` exists with `"overall": "PASS"`.

## Stop Conditions

- STOP if `SOCELLE_ENTITLEMENTS_PACKAGING.md` is not found.
- STOP if no Stripe-related code found in codebase — billing not yet implemented.
- STOP if Stripe test keys are exposed in source code — security issue takes priority.
- NEVER modify commerce flow code (CLAUDE.md §C: Commerce flow NEVER MODIFY).

## Failure Modes

| Mode | Symptom | Resolution |
|---|---|---|
| Missing entitlements doc | Cannot validate tier pricing | Restore from `/docs/command/` |
| Stripe key mismatch | Test vs prod mode confusion | Verify env vars via env-validator |
| Credit math error | Incorrect deduction amounts | Fix in credit economy hook, re-run suite |

## Fade Protocol

**Quarterly re-certification required.** Pricing and entitlements evolve with plan changes. Re-run after any tier modification, Stripe product/price update, or credit economy change. If ENTITLEMENTS_PACKAGING.md is updated, re-certify immediately.
