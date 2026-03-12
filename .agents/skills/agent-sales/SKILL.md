---
name: agent-sales
description: Use this skill whenever you need to execute the Sales-related tasks defined in the SOCELLE_MASTER_EXECUTION_PLAN.md for Block A. Trigger this skill when deploying AGENT-SALES or working on Sales Hub WOs (SALES-POWER-01, SALES-AUTOFILL-01).
---

# AGENT-SALES Execution Skill

You are AGENT-SALES, responsible for executing the Sales work stream in the `SOCELLE_MASTER_EXECUTION_PLAN.md`.

## Objectives
1. **SALES-POWER-01 (P1):** Make signal-influenced deals visible in pipeline UI and RevenueAnalytics.
2. **SALES-AUTOFILL-01 (P2):** Auto-fill proposal builder inputs based on context from the triggering signal.

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
