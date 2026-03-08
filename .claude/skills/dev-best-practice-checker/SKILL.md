---
name: dev-best-practice-checker
description: ALWAYS use this skill when checking code for SOCELLE development best practices including strict TypeScript, React patterns, Supabase usage, and codebase hygiene. Triggers on "check best practices", "code review", "dev standards", "TypeScript strict", "code quality audit", "dev compliance". Enforces strict TS (no any-types, no ts-ignore), proper React patterns, Supabase query safety, cross-boundary rules, and SOCELLE architectural conventions.
---

# Dev Best-Practice Checker

## Purpose
Validates code against SOCELLE development best practices — strict TypeScript, React pattern conventions, Supabase query safety, cross-boundary rules, and codebase hygiene. Catches anti-patterns, type safety violations, and architectural drift before they accumulate as tech debt.

## When to Use
- After `dev-code-accelerator` generates code
- Before merging any PR with code changes
- During code review cycles
- When onboarding new code patterns or components
- After refactoring sessions

## Procedure

### Step 1 — Identify Target Scope
Determine what code to check:

```bash
# Check specific files
TARGET_FILES="src/components/MyComponent.tsx src/hooks/useMyHook.ts"

# Or check all changed files
git diff --name-only HEAD~1 --diff-filter=ACMR -- '*.ts' '*.tsx'
```

### Step 2 — TypeScript Strict Mode Audit
Enforce strict TypeScript without escape hatches:

```
STRICT TS RULES:
[ ] No `any` type annotations
    → grep -rn ': any\|as any\|<any>' $TARGET_FILES
[ ] No @ts-ignore or @ts-expect-error without documented reason
    → grep -rn '@ts-ignore\|@ts-expect-error' $TARGET_FILES
[ ] No non-null assertions (!) without documented reason
    → grep -rn '[a-zA-Z]!' $TARGET_FILES | grep -v '!=' | grep -v '!important'
[ ] All function parameters typed (no implicit any)
[ ] Return types explicit on exported functions
[ ] No type assertions (as Type) where type guards are appropriate
[ ] Enums use string values, not numeric
[ ] Interfaces over types for object shapes (consistency convention)

SEVERITY:
- `any` type: BLOCK — must be resolved before merge
- ts-ignore: BLOCK — must add justification comment or remove
- Non-null assertion: WARN — acceptable with comment explaining why
- Missing return type: WARN on exports, INFO on internal functions
```

### Step 3 — React Pattern Validation
Enforce SOCELLE React conventions:

```
REACT RULES:
[ ] Functional components only (no class components)
[ ] Hooks follow Rules of Hooks (no conditional hooks)
[ ] Custom hooks prefixed with "use" and return typed values
[ ] useEffect has exhaustive deps array (no eslint-disable)
[ ] No inline function definitions in JSX props (extract to useCallback)
[ ] Error boundaries wrap major sections
[ ] Loading states handled (not just null/undefined checks)
[ ] Keys use stable identifiers, not array index

COMPONENT STRUCTURE:
1. Imports (external → internal → types)
2. Type definitions
3. Component function
4. Hooks (state → effects → custom)
5. Event handlers
6. Render helpers
7. Return JSX
8. Default export
```

### Step 4 — Supabase Query Safety
Validate database interaction patterns:

```
SUPABASE RULES:
[ ] All queries use typed client (Database type from generated types)
[ ] Error handling on every .from() call (.error check or throw)
[ ] No raw SQL strings in client-side code (use RPC or Edge Functions)
[ ] RLS policies assumed — no .service_role client in frontend
[ ] Pagination on list queries (no unbounded SELECT *)
[ ] updated_at checked when displaying "freshness" indicators
[ ] Real-time subscriptions cleaned up in useEffect return

QUERY PATTERN:
✅ const { data, error } = await supabase.from('table').select('*').limit(50)
   if (error) throw error
❌ const { data } = await supabase.from('table').select('*')  // no error check, no limit
```

### Step 5 — Cross-Boundary Rules (CLAUDE.md §C)
Enforce monorepo boundaries:

```
BOUNDARY RULES:
[ ] No imports from SOCELLE-MOBILE-main/ in SOCELLE-WEB/ code
[ ] No imports from SOCELLE-WEB/ in SOCELLE-MOBILE-main/ code
[ ] No direct Supabase migration files modified by non-Backend agent
[ ] Portal routes (/portal/*, /brand/*, /admin/*) not modified without WO scope
[ ] Commerce flow (cart, checkout, orders) NOT modified
[ ] Auth system (ProtectedRoute, AuthProvider) NOT modified
[ ] Shared packages (packages/*) read by all, write only by Backend

DETECTION:
grep -rn "from.*SOCELLE-MOBILE\|from.*SOCELLE-WEB" --include="*.ts" --include="*.tsx" $TARGET_PATH
```

### Step 6 — Code Hygiene Scan
General quality checks:

```
HYGIENE RULES:
[ ] No console.log in production code (console.error OK for error paths)
[ ] No TODO/FIXME/HACK without linked issue or WO ID
[ ] No hardcoded URLs — use environment variables
[ ] No hardcoded credentials or API keys
[ ] No duplicate utility functions (check existing hooks/utils)
[ ] Import paths use aliases (@/ or relative) consistently
[ ] No unused imports or variables
[ ] File length under 300 lines (split if larger)

DETECTION:
grep -rn 'console\.log\b' --include="*.tsx" --include="*.ts" $TARGET_PATH | grep -v '\.test\.\|\.spec\.\|__tests__'
grep -rn 'TODO\|FIXME\|HACK' --include="*.tsx" --include="*.ts" $TARGET_PATH
```

### Step 7 — Generate Best Practice Report

```json
{
  "skill": "dev-best-practice-checker",
  "files_checked": 0,
  "total_issues": 0,
  "blockers": 0,
  "warnings": 0,
  "info": 0,
  "categories": {
    "typescript_strict": {"blockers": 0, "warnings": 0, "details": []},
    "react_patterns": {"blockers": 0, "warnings": 0, "details": []},
    "supabase_safety": {"blockers": 0, "warnings": 0, "details": []},
    "cross_boundary": {"blockers": 0, "warnings": 0, "details": []},
    "code_hygiene": {"blockers": 0, "warnings": 0, "details": []}
  },
  "merge_recommendation": "PASS | PASS_WITH_WARNINGS | BLOCK",
  "report_path": "docs/qa/dev-best-practice-checker-YYYY-MM-DD.md"
}
```

Save report to `docs/qa/`.

## Fade Protocol
- **Review quarterly** — Sync with any new React/TS/Supabase patterns adopted by the team
- **Retest** — Run against 10 recent PRs; if false positive rate >20%, recalibrate
- **Retire** — If stack changes (e.g., migrate off React), rebuild rules from scratch

## Verification (Deterministic)
- **Command:** `find docs/qa -name "dev-best-practice-checker*.json" | wc -l  # expect >= 1`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/dev-best-practice-checker-YYYY-MM-DD.json`
- **Fail criteria:** Command returns unexpected value, report not generated, or any BLOCK-level issue found without resolution


## Stop Conditions
- **Hard stop:** Codebase does not compile (`npx tsc --noEmit` fails) — fix build before running this skill
- **Hard stop:** Target path does not exist or is empty — verify repo checkout
- **Hard stop:** Required command-line tool missing (grep, find, node) — install before proceeding
- **Soft stop (owner decision):** More than 50 issues found — present summary to owner for prioritization before attempting fixes
- **Soft stop (owner decision):** Findings contradict a command doc — escalate to owner; do not auto-fix governance
