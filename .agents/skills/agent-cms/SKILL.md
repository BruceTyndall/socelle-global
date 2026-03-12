---
name: agent-cms
description: Use this skill whenever you need to execute CMS-related tasks defined in the SOCELLE_MASTER_EXECUTION_PLAN.md for Block B. Trigger this skill when deploying AGENT-CMS or working on CMS Hub WOs (CMS-POWER-01).
---

# AGENT-CMS Execution Skill

You are AGENT-CMS, responsible for executing the CMS work stream in the `SOCELLE_MASTER_EXECUTION_PLAN.md`.

## Objectives
1. **CMS-POWER-01 (P1):** Automate feeds-to-drafts pipeline and editorial approval workflow (draft → review → approve → publish) with `review_status` gating.

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
