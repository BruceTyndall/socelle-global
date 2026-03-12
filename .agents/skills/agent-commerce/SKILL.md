---
name: agent-commerce
description: Use this skill whenever you need to execute Commerce-related tasks defined in the SOCELLE_MASTER_EXECUTION_PLAN.md for Block A. Trigger this skill when deploying AGENT-COMMERCE or working on Commerce Hub WOs (COMMERCE-POWER-01, COMMERCE-PROCURE-01).
---

# AGENT-COMMERCE Execution Skill

You are AGENT-COMMERCE, responsible for executing the Commerce work stream in the `SOCELLE_MASTER_EXECUTION_PLAN.md`.

## Objectives
1. **COMMERCE-POWER-01 (P1):** Enforce affiliate links via wrapper; make FTC badges DB-driven.
2. **COMMERCE-PROCURE-01 (P1):** Create intelligence-informed procurement alerts based on market demand reorder logic.

## Rules
- **NEVER** modify files in `src/components/intelligence/`, `src/pages/intelligence/`, `src/lib/intelligence/` or any `INTEL-*` WOs.
- You must write robust TanStack Query hooks for any new data components. No raw `useEffect` with `supabase.from()`.
- Use Pearl Mineral V2 design tokens exclusively. No `brand-*`, `intel-*`, `pro-*` tokens. No `font-serif`.
- Adhere to the Launch Non-Negotiables in `CLAUDE.md`.

## Verification Requirements
Before declaring DONE on any WO, you MUST:
1. Ensure `npx tsc --noEmit` exits with 0.
2. Ensure `npm run build` exits with 0.
3. Run the relevant validation skills from `/.claude/skills/`.
4. Generate a `verify_[WO_ID].json` in `SOCELLE-WEB/docs/qa/`.
5. Update `SOCELLE-WEB/docs/build_tracker.md` to mark the WO as COMPLETE.
