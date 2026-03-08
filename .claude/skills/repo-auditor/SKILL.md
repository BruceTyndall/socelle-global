---
name: repo-auditor
description: "Full monorepo inventory and structure audit. Use this skill whenever you need to understand what exists in the SOCELLE GLOBAL codebase: file counts, directory structure, route counts, component inventory, migration counts, edge function lists, hook lists, config file states, and dependency versions. Triggers on: 'audit the repo', 'what exists', 'inventory', 'codebase scan', 'how many pages', 'monorepo structure'."
---

# Repo Auditor

Produces a complete structural inventory of the SOCELLE GLOBAL monorepo.

## When to use

Any time an agent needs to understand the current state of the codebase before making decisions. This is the first skill to run in any audit sequence.

## Execution

Run the following bash commands in sequence. All paths are relative to the SOCELLE GLOBAL repo root.

### Step 1: Monorepo topology

```bash
echo "=== MONOREPO TOPOLOGY ==="
echo "--- Top-level ---"
ls -la
echo ""
echo "--- Apps ---"
for d in SOCELLE-WEB SOCELLE-MOBILE-main apps/marketing-site figma-make-source; do
  echo "$d/: $(test -d $d && echo 'EXISTS' || echo 'MISSING')"
done
echo ""
echo "--- Shared packages ---"
ls packages/ 2>/dev/null
echo ""
echo "--- Supabase (root) ---"
echo "Functions: $(ls supabase/functions/ 2>/dev/null | wc -l)"
echo "Migrations: $(ls supabase/migrations/ 2>/dev/null | wc -l)"
```

### Step 2: Web app scale

```bash
echo "=== SOCELLE-WEB SCALE ==="
cd SOCELLE-WEB
echo "Pages: $(find src/pages -name '*.tsx' 2>/dev/null | wc -l)"
echo "  admin/: $(find src/pages/admin -name '*.tsx' 2>/dev/null | wc -l)"
echo "  brand/: $(find src/pages/brand -name '*.tsx' 2>/dev/null | wc -l)"
echo "  business/: $(find src/pages/business -name '*.tsx' 2>/dev/null | wc -l)"
echo "  public/: $(find src/pages/public -name '*.tsx' 2>/dev/null | wc -l)"
echo "  education/: $(find src/pages/education -name '*.tsx' 2>/dev/null | wc -l)"
echo "  marketing/: $(find src/pages/marketing -name '*.tsx' 2>/dev/null | wc -l)"
echo "  sales/: $(find src/pages/sales -name '*.tsx' 2>/dev/null | wc -l)"
echo "Components: $(find src/components -name '*.tsx' 2>/dev/null | wc -l)"
echo "Hooks: $(find src -name 'use*.ts' -o -name 'use*.tsx' 2>/dev/null | wc -l)"
echo "Edge functions: $(ls supabase/functions/ 2>/dev/null | wc -l)"
echo "Migrations: $(ls supabase/migrations/ 2>/dev/null | wc -l)"
echo "Total TS/TSX: $(find src -name '*.ts' -o -name '*.tsx' 2>/dev/null | wc -l)"
```

### Step 3: Dependency versions

```bash
echo "=== KEY VERSIONS ==="
cd SOCELLE-WEB
node -e "const p=require('./package.json'); const d={...p.dependencies,...p.devDependencies}; ['react','react-dom','vite','typescript','@supabase/supabase-js','@stripe/stripe-js','tailwindcss','react-router-dom'].forEach(k => console.log(k + ': ' + (d[k]||'NOT INSTALLED')))"
```

### Step 4: Config state

```bash
echo "=== CONFIG STATE ==="
cd SOCELLE-WEB
echo "tsconfig strict: $(grep -o '"strict":\s*\w*' tsconfig.app.json 2>/dev/null || echo 'NOT FOUND')"
echo "Tailwind config lines: $(wc -l < tailwind.config.js 2>/dev/null || echo 'NOT FOUND')"
echo "Vite config lines: $(wc -l < vite.config.ts 2>/dev/null || echo 'NOT FOUND')"
echo "Routes in App.tsx: $(grep -c 'path:' src/App.tsx 2>/dev/null || grep -c '<Route' src/App.tsx 2>/dev/null || echo 'UNKNOWN')"
```

### Step 5: Integration check

```bash
echo "=== INTEGRATIONS ==="
cd SOCELLE-WEB
for pkg in "@sentry/react" "@tanstack/react-query" "posthog-js" "ioredis" "bullmq" "zod" "@guardrails-ai/core"; do
  echo "$pkg: $(grep -q "\"$pkg\"" package.json 2>/dev/null && echo 'INSTALLED' || echo 'NOT INSTALLED')"
done
```

## Output format

Produce a JSON artifact at `docs/qa/repo_inventory.json` with structure:

```json
{
  "scan_date": "ISO timestamp",
  "web": { "pages": N, "components": N, "hooks": N, "edge_functions": N, "migrations": N },
  "mobile": { "dart_files": N, "features": N },
  "shared": { "packages": [] },
  "versions": { "react": "", "vite": "", "typescript": "" },
  "integrations": { "sentry": false, "tanstack_query": false, "posthog": false },
  "routes_total": N,
  "route_breakdown": { "public": N, "portal": N, "brand": N, "admin": N }
}
```

## Verification (Deterministic)
- **Command:** `find SOCELLE-WEB/src -name "*.tsx" | wc -l  # expect > 50`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/repo-auditor-YYYY-MM-DD.json`
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
