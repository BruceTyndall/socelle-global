---
name: dev-code-accelerator
description: "Generates and audits TypeScript/React code for SOCELLE features, enforcing strict types, Supabase patterns, hook conventions, and monorepo boundaries. Use this skill whenever someone asks to generate feature code, scaffold a new module, create hooks or components, audit code quality, or accelerate development. Also triggers on: 'generate code', 'scaffold feature', 'create hook', 'code audit', 'TypeScript strict', 'code quality', 'feature code', 'accelerate dev', 'code generation', 'write the code for'. This skill generates production-grade code, not prototypes — it includes error handling, types, tests, and documentation."
---

# Dev Code Accelerator

Generates production-grade TypeScript/React code following SOCELLE monorepo conventions. The difference between this and `front-end-design` (which focuses on visual components) or `design-prototype-generator` (which creates quick prototypes) is that this skill produces complete, tested, documented code ready for PR review.

## SOCELLE Code Conventions

| Convention | Standard |
|-----------|----------|
| Language | TypeScript strict mode |
| Framework | React 18 + Vite |
| Styling | Tailwind CSS + Pearl Mineral V2 tokens |
| State | React hooks, Supabase Realtime |
| Data | Supabase client via `@supabase/supabase-js` |
| Types | Generated from `database.types.ts`, no `any` |
| Hooks | `use[Domain]` naming, single responsibility |
| Components | Functional with explicit props interface |
| Testing | Vitest + Playwright |
| Imports | Absolute paths from `src/` |

## Step 1: Understand the Feature

Before generating code:
1. Which app boundary? (`SOCELLE-WEB/`, `SOCELLE-MOBILE-main/`, `supabase/`)
2. Which portal? (public, `/portal/*`, `/brand/*`, `/admin/*`)
3. What data tables/hooks does it need?
4. What existing components can be reused?
5. Does it need new migrations? (Only Backend Agent can create those)

```bash
echo "=== FEATURE CONTEXT ==="
cd SOCELLE-WEB

# Existing hooks in the domain
echo "Related hooks:"
grep -rn "export.*function use\|export.*const use" src/hooks/ 2>/dev/null | grep -v node_modules | head -15

# Existing components in the domain
echo "Related components:"
ls src/components/ 2>/dev/null | head -20

# Type definitions
echo "Available types:"
grep -rn "export.*interface\|export.*type " src/types/ src/integrations/ 2>/dev/null | grep -v node_modules | head -15
```

## Step 2: Generate Code

### Hook Template
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// OR if TanStack not installed:
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type TableRow = Database['public']['Tables']['table_name']['Row'];

export function useDomainData() {
  const [data, setData] = useState<TableRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: result, error: queryError } = await supabase
          .from('table_name')
          .select('*')
          .order('created_at', { ascending: false });

        if (queryError) throw queryError;
        setData(result ?? []);
        setIsLive(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch'));
        setIsLive(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return { data, isLoading, error, isLive };
}
```

### Component Template
```typescript
import React from 'react';

interface FeatureProps {
  // Explicit typed props — no `any`
}

export const Feature: React.FC<FeatureProps> = (props) => {
  // Hook usage at top
  // Error boundary handling
  // Loading states
  // Empty states
  // Data display
  return (/* JSX */);
};

Feature.displayName = 'Feature';
```

## Step 3: Enforce Quality

```bash
echo "=== CODE QUALITY ==="
cd SOCELLE-WEB

# TypeScript strict check
echo "Typecheck:"
npx tsc --noEmit 2>&1 | tail -10

# Any-type usage
echo "'any' types in new code:"
grep -rn ": any\|as any" "$NEW_FILE" 2>/dev/null

# ts-ignore usage
echo "ts-ignore/ts-expect-error:"
grep -rn "@ts-ignore\|@ts-expect-error" "$NEW_FILE" 2>/dev/null

# Console.log (remove before PR)
echo "Console statements:"
grep -rn "console\." "$NEW_FILE" 2>/dev/null

# Monorepo boundary check
echo "Cross-boundary imports:"
grep -rn "from.*SOCELLE-MOBILE\|from.*marketing-site" "$NEW_FILE" 2>/dev/null
```

## Output

Write to `docs/qa/code_accelerator.json`:
```json
{
  "skill": "dev-code-accelerator",
  "feature_name": "",
  "files_generated": [],
  "typecheck_pass": true,
  "any_types": 0,
  "ts_ignores": 0,
  "cross_boundary_violations": 0,
  "hooks_created": 0,
  "components_created": 0,
  "timestamp": "ISO-8601"
}
```

## Fade Protocol
Update when: React version changes, Supabase client API changes, new TypeScript version with new features, hook patterns evolve.

## Verification (Deterministic)
- **Command:** `find docs/qa -name "dev-code-accelerator*.json" | wc -l  # expect >= 1`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/dev-code-accelerator-YYYY-MM-DD.json`
- **Fail criteria:** Command returns unexpected value, report not generated, or any BLOCK-level issue found without resolution


## Stop Conditions
- **Hard stop:** Codebase does not compile (`npx tsc --noEmit` fails) — fix build before running this skill
- **Hard stop:** Target path does not exist or is empty — verify repo checkout
- **Hard stop:** Required command-line tool missing (grep, find, node) — install before proceeding
- **Soft stop (owner decision):** More than 50 issues found — present summary to owner for prioritization before attempting fixes
- **Soft stop (owner decision):** Findings contradict a command doc — escalate to owner; do not auto-fix governance
