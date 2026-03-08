---
name: billing-scenario-simulator
description: "Tests billing edge cases, subscription lifecycle scenarios, and payment failure handling for SOCELLE's multi-tier subscription model. Use this skill whenever someone asks about billing edge cases, subscription proration, dunning sequences, upgrade/downgrade flows, grace periods, credit top-ups, multi-seat billing, or payment failure handling. Also triggers on: 'billing test', 'subscription edge case', 'proration', 'dunning', 'payment failure', 'grace period', 'upgrade flow', 'downgrade flow', 'credit top-up', 'multi-seat', 'billing scenario'."
---

# Billing Scenario Simulator

Tests billing edge cases that break revenue if unhandled. Billing bugs are uniquely dangerous: they either lose money (undercharging, credit leaks) or lose customers (overcharging, failed renewals, locked accounts). This skill systematically tests every scenario in SOCELLE's subscription + credit economy.

## SOCELLE Billing Architecture

| Component | Implementation | Status |
|-----------|---------------|--------|
| Subscriptions | Stripe Billing (4 tiers: Free/$49/$149/Custom) | In codebase |
| AI Credits | Per-query deduction from tier allocation | In codebase |
| Wholesale Affiliate | Commission on B2B transactions | Defined in entitlements |
| PAYMENT_BYPASS | Dev flag in `src/lib/paymentBypass.ts` | Currently ON |

## Step 1: Map Current Billing Code

```bash
echo "=== BILLING CODE MAP ==="
cd SOCELLE-WEB

# Stripe integration points
echo "Stripe references:"
grep -rn "stripe\|Stripe\|STRIPE" src/ supabase/ 2>/dev/null | grep -v node_modules | wc -l

# Subscription management
echo "Subscription hooks/components:"
grep -rn "subscription\|subscribe\|unsubscribe\|cancel.*plan\|upgrade.*plan\|downgrade" src/ 2>/dev/null | grep -v node_modules | head -15

# Credit economy
echo "Credit system:"
grep -rn "credit.*balance\|deduct.*credit\|add.*credit\|credit.*check\|insufficient.*credit" src/ 2>/dev/null | grep -v node_modules | head -10

# Payment bypass
echo "Payment bypass status:"
cat src/lib/paymentBypass.ts 2>/dev/null || echo "File not found"

# Webhook handlers
echo "Stripe webhooks:"
ls supabase/functions/ 2>/dev/null | grep -i "stripe\|webhook\|payment\|billing"
```

## Step 2: Run Scenario Tests

Test each scenario by tracing the code path:

### Subscription Lifecycle
| # | Scenario | Expected Behavior | Check |
|---|----------|-------------------|-------|
| 1 | New user → Free tier | Account created, 0 credits (or starter allocation) | Verify default tier assignment |
| 2 | Free → Pro upgrade | Stripe checkout session, immediate access, credit allocation | Verify webhook + entitlement update |
| 3 | Pro → Enterprise upgrade | Proration calculated, credit balance adjusted | Verify proration math |
| 4 | Enterprise → Pro downgrade | End-of-period transition, no immediate credit loss | Verify grace period |
| 5 | Cancellation | Access until period end, then revert to Free | Verify scheduled cancellation |
| 6 | Payment failure | Grace period, retry logic, dunning email | Verify Stripe retry + notification |
| 7 | Card update | Stripe customer portal, no disruption | Verify portal redirect |

### Credit Economy
| # | Scenario | Expected Behavior | Check |
|---|----------|-------------------|-------|
| 8 | AI tool use with sufficient credits | Credits deducted, tool executes | Verify deduction amount |
| 9 | AI tool use with insufficient credits | Block with upgrade prompt | Verify gate + CTA |
| 10 | Monthly credit reset | Credits refill to tier allocation | Verify reset mechanism |
| 11 | Credit top-up purchase | One-time Stripe charge, credits added | Verify top-up flow |

### Edge Cases
| # | Scenario | Expected Behavior | Check |
|---|----------|-------------------|-------|
| 12 | Double-click subscribe button | Idempotent, single charge | Verify idempotency |
| 13 | Webhook arrives before redirect | Account still upgrades correctly | Verify async handling |
| 14 | PAYMENT_BYPASS ON in production | MUST be flagged as CRITICAL risk | Verify bypass detection |
| 15 | Currency mismatch | Handle gracefully or restrict | Verify currency handling |

## Step 3: Validate Each Scenario

For each scenario, trace through the code:

```bash
# Example: Trace upgrade flow
echo "=== UPGRADE FLOW TRACE ==="
cd SOCELLE-WEB

# 1. UI trigger
grep -rn "upgrade\|Upgrade.*Plan\|checkout.*session" src/components/ src/pages/ 2>/dev/null | grep -v node_modules | head -5

# 2. API call
grep -rn "create.*checkout\|stripe.*session\|billing.*portal" src/ supabase/functions/ 2>/dev/null | grep -v node_modules | head -5

# 3. Webhook handler
grep -rn "customer.subscription\|invoice.paid\|checkout.session.completed" supabase/functions/ 2>/dev/null | head -5

# 4. Database update
grep -rn "UPDATE.*subscription\|UPDATE.*tier\|UPDATE.*plan" supabase/ 2>/dev/null | head -5
```

## Output

Write to `docs/qa/billing_scenarios.json`:
```json
{
  "skill": "billing-scenario-simulator",
  "scenarios_tested": 15,
  "scenarios_passed": 0,
  "scenarios_failed": 0,
  "scenarios_untestable": 0,
  "payment_bypass_active": true,
  "critical_findings": [],
  "stripe_integration_complete": false,
  "credit_economy_wired": false,
  "timestamp": "ISO-8601"
}
```

## Verification (Deterministic)
- **Command:** `find docs/qa -name "billing-scenario-simulator*.json" | wc -l  # expect >= 1`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/billing-scenario-simulator-YYYY-MM-DD.json`
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
