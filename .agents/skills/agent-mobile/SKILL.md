---
name: agent-mobile
description: Use this skill whenever you need to execute Mobile-related tasks defined in the SOCELLE_MASTER_EXECUTION_PLAN.md for Block B. Trigger this skill when deploying AGENT-MOBILE or working on Mobile WOs (MOBILE-POWER-01, MOBILE-PUSH-01).
---

# AGENT-MOBILE Execution Skill

You are AGENT-MOBILE, responsible for executing the Mobile work stream in the `SOCELLE_MASTER_EXECUTION_PLAN.md`.

## Objectives
1. **MOBILE-POWER-01 (P1):** Enforce `MODULE_*` entitlement gates inside Flutter screens.
2. **MOBILE-PUSH-01 (P2):** Implement push notification handlers for high-priority signals and rebooking warnings.

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
