---
name: stripe-integration-tester
description: "Deep audit of Stripe integration: webhook handlers, product/price IDs, customer portal, subscription lifecycle, and test vs production mode. Triggers on: 'Stripe audit', 'webhook check', 'Stripe products', 'subscription lifecycle', 'Stripe test mode', 'Stripe production'."
---

# Stripe Integration Tester

Deep audit of Stripe payment infrastructure.

## Stripe webhook handlers

```bash
echo "=== STRIPE WEBHOOKS ==="
cd SOCELLE-WEB
grep -rn "webhook\|event\.type\|checkout\.session\|customer\.subscription\|invoice\." supabase/functions/ 2>/dev/null | head -20
echo "---"
echo "Webhook edge functions:"
find supabase/functions -name "*webhook*" -o -name "*stripe*" 2>/dev/null
```

## Product/Price configuration

```bash
echo "=== STRIPE PRODUCTS ==="
cd SOCELLE-WEB
grep -rn "price_\|prod_\|STRIPE.*PRICE\|STRIPE.*PRODUCT" src/ supabase/ .env* 2>/dev/null | grep -v node_modules | head -15
```

## Test vs production mode

```bash
echo "=== STRIPE MODE ==="
cd SOCELLE-WEB
echo "Test keys in code:"
grep -rn "sk_test_\|pk_test_" src/ supabase/ 2>/dev/null | grep -v node_modules | head -5
echo "Live keys in code:"
grep -rn "sk_live_\|pk_live_" src/ supabase/ 2>/dev/null | grep -v node_modules | head -5
echo "Key in env:"
grep "STRIPE" .env* 2>/dev/null | head -5
```

## Customer portal

```bash
echo "=== CUSTOMER PORTAL ==="
cd SOCELLE-WEB
grep -rn "customer.*portal\|billing.*portal\|createPortalSession\|portal_session" src/ supabase/ 2>/dev/null | grep -v node_modules | head -10
```

## Output
Write `docs/qa/stripe_integration_test.json`

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `grep -rn "stripe\|webhook\|sk_test" SOCELLE-WEB/supabase/functions/ | wc -l  # expect > 0`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/stripe-integration-tester-YYYY-MM-DD.json`
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
