---
name: agent-education
description: Use this skill whenever you need to execute Education-related tasks defined in the SOCELLE_MASTER_EXECUTION_PLAN.md for Block A. Trigger this skill when deploying AGENT-EDUCATION or working on Education Hub WOs (EDU-POWER-01, EDU-CE-EXPIRY-01).
---

# AGENT-EDUCATION Execution Skill

You are AGENT-EDUCATION, responsible for executing the Education work stream in the `SOCELLE_MASTER_EXECUTION_PLAN.md`.

## Objectives
1. **EDU-POWER-01 (P1):** Build course player full states (loading/error/empty) to clear Category C shell violations.
2. **EDU-CE-EXPIRY-01 (P1):** Add CE credits expiration warnings to the Education dashboard.

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
