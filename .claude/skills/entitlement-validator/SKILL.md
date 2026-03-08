---
name: entitlement-validator
description: "Validates entitlement enforcement across the SOCELLE codebase against SOCELLE_ENTITLEMENTS_PACKAGING.md. Use this skill to: check that tier gates exist on premium features, verify PAYMENT_BYPASS status, find ungated premium content, validate role-based access patterns, and audit subscription hook usage. Triggers on: 'entitlement check', 'tier gate audit', 'subscription validation', 'payment bypass', 'role access check', 'premium gate audit'."
---

# Entitlement Validator

Validates tier/role entitlement enforcement against the canonical packaging spec.

## PAYMENT_BYPASS status

```bash
echo "=== PAYMENT_BYPASS STATUS ==="
cd SOCELLE-WEB
cat src/lib/paymentBypass.ts 2>/dev/null || echo "paymentBypass.ts NOT FOUND"
echo "---"
grep -rn "PAYMENT_BYPASS\|paymentBypass\|payment_bypass" src/ 2>/dev/null | head -10
echo "---"
grep -rn "PAYMENT_BYPASS" .env* 2>/dev/null
```

## Tier gate detection

```bash
echo "=== TIER GATES IN CODE ==="
cd SOCELLE-WEB
# Find tier/plan checks
grep -rn "tier\|plan.*===\|subscription\|isPro\|isBusiness\|isEnterprise\|entitlement" src/ 2>/dev/null | grep -v "node_modules\|\.d\.ts" | head -20
echo "---"
echo "Files with tier checks:"
grep -rl "tier\|isPro\|isBusiness\|entitlement" src/ 2>/dev/null | grep -v node_modules | wc -l
```

## Role-based access patterns

```bash
echo "=== ROLE-BASED ACCESS ==="
cd SOCELLE-WEB
# Find role checks (Operator, Provider, Brand, Admin)
grep -rn "role.*===\|isAdmin\|isBrand\|isOperator\|isProvider\|userRole" src/ 2>/dev/null | grep -v "node_modules\|\.d\.ts" | head -20
echo "---"
# Check ProtectedRoute for role enforcement
grep -A3 "ProtectedRoute\|RequireRole\|roleGuard" src/components/ 2>/dev/null | head -20
```

## Ungated premium content

```bash
echo "=== UNGATED PREMIUM CONTENT ==="
cd SOCELLE-WEB
# Portal pages without tier checks
for f in src/pages/portal/*.tsx src/pages/brand/*.tsx src/pages/admin/*.tsx; do
  if [ -f "$f" ]; then
    name=$(basename "$f" .tsx)
    has_gate=$(grep -c "tier\|entitlement\|isPro\|paymentBypass\|ProtectedRoute" "$f" 2>/dev/null)
    if [ "$has_gate" -eq 0 ]; then
      echo "UNGATED: $name (portal page with no tier check)"
    fi
  fi
done 2>/dev/null
```

## Subscription hooks

```bash
echo "=== SUBSCRIPTION HOOKS ==="
cd SOCELLE-WEB
grep -rn "useSubscription\|useEntitlement\|useTier\|usePlan" src/ 2>/dev/null | grep -v node_modules | head -10
echo "---"
# Check Stripe integration
grep -rn "stripe\|STRIPE" src/ supabase/ 2>/dev/null | grep -v node_modules | head -10
```

## Output

Write `docs/qa/entitlement_validation.json`:

```json
{
  "scan_date": "ISO",
  "payment_bypass": { "file": "path", "status": "ON/OFF" },
  "tier_gates_count": 0,
  "role_checks_count": 0,
  "ungated_portal_pages": [],
  "subscription_hooks": [],
  "stripe_integration": "FOUND/NOT_FOUND",
  "compliance": "PASS/FAIL"
}
```

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `grep -rn "PAYMENT_BYPASS\|tier\|subscription" SOCELLE-WEB/src/lib/ | wc -l  # expect > 0`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/entitlement-validator-YYYY-MM-DD.json`
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
