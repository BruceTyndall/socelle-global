---
name: ai-service-menu-validator
description: "Validates all 7 AI Service Menu engines are implemented and wired. Use this skill to: check each engine exists in code, verify edge function endpoints, check prompt templates, validate credit deduction logic, and produce an engine readiness report. Triggers on: 'AI service menu', 'engine check', '7 engines', 'menuOrchestrator', 'PlanWizard', 'AI tool audit'."
---

# AI Service Menu Validator

Verifies all 7 AI Service Menu engines per AI_SERVICE_MENU_STRESS_TEST.md.

## Engine code inventory

```bash
echo "=== 7 AI SERVICE MENU ENGINES ==="
cd SOCELLE-WEB
ENGINES="menuOrchestrator PlanWizard planOrchestrator documentExtraction mappingEngine gapAnalysisEngine retailAttachEngine"
for eng in $ENGINES; do
  files=$(grep -rl "$eng" src/ supabase/ 2>/dev/null | grep -v node_modules | head -3)
  if [ -n "$files" ]; then
    echo "FOUND: $eng"
    echo "$files" | head -2
  else
    echo "MISSING: $eng"
  fi
done
```

## AI tool endpoints

```bash
echo "=== 6 AI TOOLS ==="
cd SOCELLE-WEB
TOOLS="explain-signal intelligence-brief activation-plan content-repurposer competitive-synthesizer semantic-search"
for tool in $TOOLS; do
  fn=$(find supabase/functions -name "*$(echo $tool | tr '-' '_')*" -o -name "*$tool*" 2>/dev/null | head -1)
  hook=$(grep -rl "$(echo $tool | tr '-' '_')\|$(echo $tool | tr '-' ' ' | sed 's/ \(.\)/\U\1/g')" src/hooks/ 2>/dev/null | head -1)
  echo "$tool: fn=$(basename "$fn" 2>/dev/null || echo MISSING) hook=$(basename "$hook" 2>/dev/null || echo MISSING)"
done
```

## Credit deduction logic

```bash
echo "=== CREDIT SYSTEM ==="
cd SOCELLE-WEB
grep -rn "credit\|Credit\|CREDIT" src/ supabase/ 2>/dev/null | grep -v "node_modules\|\.d\.ts" | grep -i "deduct\|consume\|cost\|balance\|remaining" | head -15
echo "---"
echo "Credit cost definitions:"
grep -rn "credit.*cost\|creditCost\|CREDIT_COST" src/ supabase/ 2>/dev/null | grep -v node_modules | head -10
```

## Prompt template check

```bash
echo "=== AI PROMPT TEMPLATES ==="
cd SOCELLE-WEB
grep -rn "prompt\|systemMessage\|system_prompt\|PROMPT" supabase/functions/ 2>/dev/null | head -15
echo "---"
echo "OpenAI/Anthropic API calls:"
grep -rn "openai\|anthropic\|Codex\|gpt-4\|gpt-3" supabase/functions/ src/ 2>/dev/null | grep -v node_modules | head -10
```

## Output

Write `docs/qa/ai_service_menu_audit.json`:

```json
{
  "scan_date": "ISO",
  "engines": {},
  "tools": {},
  "credit_system_found": false,
  "prompt_templates_count": 0,
  "ai_api_calls": 0,
  "engines_ready": 0,
  "tools_ready": 0
}
```

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `ls SOCELLE-WEB/supabase/functions/ | grep -i "menu\|orchestrat\|wizard" | wc -l  # expect >= 7`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/ai-service-menu-validator-YYYY-MM-DD.json`
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
