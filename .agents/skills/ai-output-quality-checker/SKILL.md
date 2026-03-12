---
name: ai-output-quality-checker
description: "Validates AI-generated output quality: guardrails enforcement, no medical diagnoses, no financial advice, source citations, and hallucination detection patterns. Triggers on: 'AI quality', 'AI guardrails', 'AI safety', 'output quality', 'hallucination check', 'AI compliance'."
---

# AI Output Quality Checker

Validates AI output safety and quality guardrails.

## Guardrails implementation

```bash
echo "=== AI GUARDRAILS ==="
cd SOCELLE-WEB
grep -rn "guardrail\|Guardrail\|safety.*check\|content.*filter\|moderation" src/ supabase/ 2>/dev/null | grep -v node_modules | head -15
echo "---"
echo "Guardrails AI package:"
grep "guardrails" package.json 2>/dev/null || echo "NOT INSTALLED"
```

## Medical/financial advice blocks

```bash
echo "=== SAFETY BLOCKS ==="
cd SOCELLE-WEB
grep -rn "medical\|diagnos\|financial.*advice\|investment\|prescri" supabase/functions/ 2>/dev/null | head -10
echo "---"
echo "Disclaimer components:"
find src/ -name "*Disclaimer*" -o -name "*SafetyWarning*" -o -name "*AIDisclosure*" 2>/dev/null | grep -v node_modules
```

## Source citation in AI outputs

```bash
echo "=== AI SOURCE CITATIONS ==="
cd SOCELLE-WEB
grep -rn "citation\|source.*ref\|source_url\|cite\|reference" supabase/functions/ 2>/dev/null | grep -i "ai\|gpt\|Codex\|llm\|prompt" | head -10
```

## Provider override / PENDING_REVIEW

```bash
echo "=== PROVIDER OVERRIDE ==="
cd SOCELLE-WEB
grep -rn "PENDING_REVIEW\|provider.*override\|human.*review\|manual.*approval" src/ supabase/ 2>/dev/null | grep -v node_modules | head -10
echo "---"
echo "AI output review flow:"
grep -rn "review.*queue\|approval.*queue\|moderate" src/ supabase/ 2>/dev/null | grep -v node_modules | head -10
```

## Output
Write `docs/qa/ai_output_quality.json`

## Inputs
- **Required:** Target path or scope (default: `SOCELLE-WEB/src/`)
- **Optional:** Specific files, routes, or components to narrow the scan
- **Assumptions:** Codebase is checked out and dependencies installed (`npm ci` completed)


## Verification (Deterministic)
- **Command:** `grep -rn "guardrail\|medical\|financial.*advice" SOCELLE-WEB/src/ | wc -l  # expect > 0`
- **Pass criteria:** Command returns expected value (see comment); JSON report written to `docs/qa/ai-output-quality-checker-YYYY-MM-DD.json`
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
