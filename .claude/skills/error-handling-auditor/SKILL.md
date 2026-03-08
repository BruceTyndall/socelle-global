---
name: error-handling-auditor
description: "Audits error handling patterns across SOCELLE including try/catch coverage, error boundaries, API error responses, user-facing error messages, and error monitoring integration. Use this skill whenever someone asks about error handling, error boundaries, try/catch patterns, error messages, error monitoring, crash reporting, or graceful degradation. Also triggers on: 'error handling', 'error boundary', 'try catch', 'error message', 'crash report', 'Sentry', 'error monitoring', 'graceful degradation', 'fallback UI', 'unhandled rejection'."
---

# Error Handling Auditor

Audits error handling completeness across the stack. Unhandled errors create two problems: users see cryptic failures (destroying trust in an intelligence platform), and developers lose visibility into what's breaking. This skill checks that every error path has a graceful handler and a monitoring hook.

## Step 1: Error Boundary Coverage

```bash
echo "=== ERROR BOUNDARIES ==="
cd SOCELLE-WEB

# React error boundaries
echo "Error boundary components:"
grep -rn "ErrorBoundary\|componentDidCatch\|getDerivedStateFromError" src/ 2>/dev/null | grep -v node_modules | head -10

# Pages without error boundaries
echo "Route-level error handling:"
grep -rn "errorElement\|ErrorBoundary" src/App.tsx 2>/dev/null | head -10

# Suspense boundaries (loading fallbacks)
echo "Suspense boundaries:"
grep -rn "<Suspense\|fallback=" src/ 2>/dev/null | grep -v node_modules | wc -l
```

## Step 2: Try/Catch Coverage

```bash
echo "=== TRY/CATCH AUDIT ==="
cd SOCELLE-WEB

# Async operations without try/catch
echo "Async functions:"
grep -rn "async " src/hooks/ src/integrations/ 2>/dev/null | grep -v node_modules | wc -l
echo "With try/catch:"
grep -rn "try {" src/hooks/ src/integrations/ 2>/dev/null | grep -v node_modules | wc -l

# Unhandled promise rejections
echo "Unhandled .then() without .catch():"
grep -rn "\.then(" src/ 2>/dev/null | grep -v node_modules | grep -v "\.catch(" | wc -l

# Supabase calls without error handling
echo "Supabase calls without error check:"
grep -rn "supabase.*from\|supabase.*rpc\|supabase.*functions" src/ 2>/dev/null | grep -v node_modules | grep -v "error\|catch\|try" | wc -l
```

## Step 3: User-Facing Error Messages

```bash
echo "=== ERROR MESSAGES ==="
cd SOCELLE-WEB

# Generic error messages (bad UX)
echo "Generic error strings:"
grep -rn "Something went wrong\|An error occurred\|Error!\|Oops" src/ 2>/dev/null | grep -v node_modules | head -10

# Technical errors exposed to users
echo "Technical errors in UI:"
grep -rn "stack.*trace\|undefined.*is.*not\|cannot.*read.*property\|TypeError\|ReferenceError" src/ 2>/dev/null | grep -v node_modules | head -5

# Good error patterns (contextual, actionable)
echo "Contextual error messages:"
grep -rn "please try\|contact support\|check your\|unable to load" src/ 2>/dev/null | grep -v node_modules | wc -l
```

## Step 4: Error Monitoring

```bash
echo "=== MONITORING ==="
cd SOCELLE-WEB

# Sentry integration (locked decision — may not be installed yet)
echo "Sentry:"
grep -rn "sentry\|Sentry\|@sentry" src/ package.json 2>/dev/null | grep -v node_modules | head -5

# Console.error usage (temporary debugging, should be replaced)
echo "Console.error calls:"
grep -rn "console.error\|console.warn" src/ 2>/dev/null | grep -v node_modules | wc -l

# Error logging to Supabase
echo "Error logging tables:"
grep -rn "error.*log\|error.*table\|log.*error" supabase/migrations/ 2>/dev/null | head -5
```

## Output

Write to `docs/qa/error_handling.json`:
```json
{
  "skill": "error-handling-auditor",
  "error_boundaries": 0,
  "async_functions": 0,
  "async_with_trycatch": 0,
  "unhandled_promises": 0,
  "generic_error_messages": 0,
  "sentry_installed": false,
  "console_errors": 0,
  "recommendations": [],
  "timestamp": "ISO-8601"
}
```

## Verification (Deterministic)
- **Command:** `find docs/qa -name "error-handling-auditor*.json" | wc -l  # expect >= 1`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/error-handling-auditor-YYYY-MM-DD.json`
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
