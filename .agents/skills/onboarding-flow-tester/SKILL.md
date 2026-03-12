---
name: onboarding-flow-tester
description: "Tests the onboarding flow: signup, role selection, initial configuration, and time-to-first-value measurement. Triggers on: 'onboarding test', 'signup flow', 'first-run experience', 'activation flow', 'time to value', 'new user flow'."
---

# Onboarding Flow Tester

Validates the new user onboarding experience.

## Signup/auth flow

```bash
echo "=== SIGNUP FLOW ==="
cd SOCELLE-WEB
find src/ -name "*SignUp*" -o -name "*Register*" -o -name "*Signup*" -o -name "*Auth*" 2>/dev/null | grep -v node_modules | head -10
echo "---"
echo "Auth provider:"
grep -rn "AuthProvider\|useAuth\|supabase\.auth" src/ 2>/dev/null | grep -v "node_modules\|\.d\.ts" | head -10
```

## Role selection

```bash
echo "=== ROLE SELECTION ==="
cd SOCELLE-WEB
grep -rn "role.*select\|selectRole\|RoleSelect\|operator\|provider\|brand" src/ 2>/dev/null | grep -i "onboard\|signup\|register\|welcome\|first" | grep -v node_modules | head -10
```

## Request access flow

```bash
echo "=== REQUEST ACCESS ==="
cd SOCELLE-WEB
find src/ -name "*RequestAccess*" -o -name "*request-access*" -o -name "*Waitlist*" 2>/dev/null | grep -v node_modules | head -5
echo "---"
echo "access_requests table:"
grep -rn "access_requests" supabase/migrations/ 2>/dev/null | head -5
```

## First-value path

```bash
echo "=== FIRST VALUE PATH ==="
cd SOCELLE-WEB
echo "Homepage route:"
grep "path=.*/" src/App.tsx 2>/dev/null | head -3
echo "---"
echo "First screen after login:"
grep -rn "redirect\|navigate.*after.*login\|post.*auth\|onAuthSuccess" src/ 2>/dev/null | grep -v node_modules | head -10
```

## Output
Write `docs/qa/onboarding_flow_test.json`

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `grep -rn "onboard\|signup\|welcome" SOCELLE-WEB/src/ | wc -l  # expect > 0`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/onboarding-flow-tester-YYYY-MM-DD.json`
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
