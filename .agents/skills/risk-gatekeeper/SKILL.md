---
name: risk-gatekeeper
description: "Scans all agent outputs, code changes, and platform content for existential business risks including legal liability, data integrity violations, governance FAIL conditions, and security vulnerabilities. Use this skill whenever someone asks to check for risks, validate a deploy, review for compliance, assess a change for safety, or audit for kill-risk items. Also triggers on: 'risk check', 'risk assessment', 'kill risk', 'deploy safety', 'compliance review', 'is this safe to ship', 'pre-deploy risk', 'liability check', 'security review'. Think of this as the last line of defense before anything goes to production."
---

# Risk Gatekeeper

The final safety net before production. This skill scans for existential risks — the kind of issues that could kill the business, expose legal liability, or destroy user trust. It consolidates checks from multiple specialized skills into a single risk-focused pass.

## Risk Categories

| Category | Severity | Examples |
|----------|----------|---------|
| **Legal** | CRITICAL | Medical claims, missing disclaimers, HIPAA exposure |
| **Security** | CRITICAL | Leaked secrets, missing RLS, auth bypass |
| **Data integrity** | HIGH | Fake-live violations, stale timestamps, broken confidence scores |
| **Governance** | HIGH | Doc Gate FAIL conditions, commerce-first violations |
| **Financial** | HIGH | Payment flow bugs, entitlement bypass, credit miscalculation |
| **Reputation** | MEDIUM | Banned terms in production, broken pages, embarrassing copy |

## Step 1: Critical Risk Scan

```bash
echo "=== CRITICAL RISK SCAN ==="
cd SOCELLE-WEB

# 1. SECRETS (existential if leaked)
echo "--- Leaked Secrets ---"
grep -rn "sk_live_\|sk_test_\|password.*=.*['\"].*['\"]" src/ supabase/ 2>/dev/null | grep -v node_modules | grep -v "\.d\.ts" | head -5
echo "PAYMENT_BYPASS status:"
grep -rn "PAYMENT_BYPASS\|paymentBypass" src/lib/ 2>/dev/null | head -3

# 2. AUTH BYPASS (existential if exploited)
echo "--- Auth Bypass ---"
grep -rn "isAuthenticated.*false\|skipAuth\|noAuth\|auth.*disabled" src/ 2>/dev/null | grep -v node_modules | head -5

# 3. RLS MISSING (data exposure)
echo "--- RLS Coverage ---"
grep -c "enable row level security\|ENABLE ROW LEVEL SECURITY" supabase/migrations/*.sql 2>/dev/null | tail -1

# 4. MEDICAL CLAIMS (legal liability)
echo "--- Medical Language ---"
grep -rin "cure\|treat\|heal\|diagnose\|FDA.approved\|clinically.proven" src/pages/ src/components/ 2>/dev/null | grep -v node_modules | head -5
```

## Step 2: Governance FAIL Scan

Check all 7 FAIL conditions from AGENTS.md §B:

```bash
echo "=== DOC GATE FAIL CONDITIONS ==="
cd SOCELLE-WEB

# FAIL 1: External doc as authority
echo "FAIL 1 — External doc refs:"
grep -rn "Per.*GOVERNANCE\|Per.*MASTER.*PLAN\|Per.*WORK.*ORDER" docs/ src/ 2>/dev/null | grep -v "command\|build_tracker\|Codex" | head -3

# FAIL 4: Fake-live claims
echo "FAIL 4 — Fake-live:"
grep -rn "Updated.*ago\|min ago\|hour ago\|day ago" src/ 2>/dev/null | grep -v node_modules | grep -v "updated_at\|updatedAt" | head -5

# FAIL 6: Ecommerce above intelligence
echo "FAIL 6 — Commerce-first navigation:"
grep -rn "MainNav\|primary.*nav\|main.*navigation" src/components/ 2>/dev/null | grep -v node_modules | head -5

# FAIL 7: Outreach/cold email
echo "FAIL 7 — Cold outreach:"
grep -rin "reaching out\|touch base\|cold.*email\|outreach" src/ docs/ 2>/dev/null | grep -v node_modules | head -3
```

## Step 3: Financial Risk Check

```bash
echo "=== FINANCIAL RISK ==="
cd SOCELLE-WEB

# Payment bypass in production
echo "Payment bypass flag:"
grep -rn "PAYMENT_BYPASS" src/ 2>/dev/null | grep -v node_modules | head -5

# Stripe test vs live mode
echo "Stripe mode indicators:"
grep -rn "pk_test_\|pk_live_\|stripe.*test\|stripe.*live" src/ 2>/dev/null | grep -v node_modules | head -5

# Credit economy math
echo "Credit values:"
grep -rn "credit.*cost\|credit.*price\|deduct.*credit\|credit.*balance" src/ 2>/dev/null | grep -v node_modules | head -5
```

## Step 4: Risk Verdict

Classify overall risk level:
- **RED — DO NOT DEPLOY**: Any CRITICAL finding present
- **YELLOW — DEPLOY WITH CAUTION**: Only HIGH findings, all have mitigations
- **GREEN — CLEAR TO DEPLOY**: No CRITICAL or HIGH findings

## Output

Write to `docs/qa/risk_gatekeeper.json`:
```json
{
  "skill": "risk-gatekeeper",
  "verdict": "RED|YELLOW|GREEN",
  "critical_count": 0,
  "high_count": 0,
  "medium_count": 0,
  "critical_findings": [],
  "high_findings": [],
  "payment_bypass_active": false,
  "secrets_exposed": 0,
  "auth_bypass_found": false,
  "medical_claims_found": 0,
  "governance_fails": 0,
  "timestamp": "ISO-8601"
}
```

## Verification (Deterministic)
- **Command:** `find docs/qa -name "risk-gatekeeper*.json" | wc -l  # expect >= 1`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/risk-gatekeeper-YYYY-MM-DD.json`
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
