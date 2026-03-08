---
name: payment-flow-tester
description: "Tests payment flow infrastructure: Stripe integration, checkout components, subscription management, and payment bypass status. Triggers on: 'payment test', 'Stripe check', 'checkout flow', 'subscription test', 'payment integration', 'billing audit'."
---

# Payment Flow Tester

Validates payment/billing infrastructure readiness.

## Stripe integration

```bash
echo "=== STRIPE INTEGRATION ==="
cd SOCELLE-WEB
grep -rn "stripe\|Stripe\|STRIPE" src/ supabase/ 2>/dev/null | grep -v node_modules | head -20
echo "---"
echo "Stripe package installed:"
grep -c "stripe" package.json 2>/dev/null
echo "Stripe edge functions:"
find supabase/functions -name "*stripe*" -o -name "*payment*" -o -name "*checkout*" -o -name "*subscription*" 2>/dev/null
```

## Checkout components

```bash
echo "=== CHECKOUT COMPONENTS ==="
cd SOCELLE-WEB
find src/ -name "*Checkout*" -o -name "*Payment*" -o -name "*Billing*" -o -name "*Subscribe*" 2>/dev/null | grep -v node_modules | head -15
```

## Subscription management

```bash
echo "=== SUBSCRIPTION MANAGEMENT ==="
cd SOCELLE-WEB
grep -rn "subscription\|Subscription\|plan.*change\|upgrade\|downgrade" src/ 2>/dev/null | grep -v "node_modules\|\.d\.ts" | head -15
```

## Payment bypass check

```bash
echo "=== PAYMENT BYPASS ==="
cd SOCELLE-WEB
cat src/lib/paymentBypass.ts 2>/dev/null || echo "NOT FOUND"
echo "---"
echo "References to paymentBypass:"
grep -rn "paymentBypass\|PAYMENT_BYPASS" src/ 2>/dev/null | grep -v node_modules | head -10
```

## Output
Write `docs/qa/payment_flow_test.json`

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `grep -rn "stripe\|checkout\|subscription" SOCELLE-WEB/src/ | wc -l  # expect > 0`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/payment-flow-tester-YYYY-MM-DD.json`
- **Fail criteria:** Command returns unexpected value, report not generated, or any BLOCK-level issue found without resolution


## Stop Conditions
- **Hard stop:** Codebase does not compile (`npx tsc --noEmit` fails) — fix build before running this skill
- **Hard stop:** Target path does not exist or is empty — verify repo checkout
- **Hard stop:** Required command-line tool missing (grep, find, node) — install before proceeding
- **Soft stop (owner decision):** More than 50 issues found — present summary to owner for prioritization before attempting fixes
- **Soft stop (owner decision):** Findings contradict a command doc — escalate to owner; do not auto-fix governance


## Fade Protocol
- **Retest trigger:** Run quarterly or after any major refactor, migration, or dependency upgrade
- **Deprecation trigger:** Skill references files/patterns that no longer exist in codebase for 2+ consecutive quarters
- **Replacement path:** If deprecated, merge functionality into the relevant suite or rebuild via `skill-creator`
- **Last recertified:** 2026-03-08
