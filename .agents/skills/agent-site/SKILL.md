---
name: agent-site
description: Use this skill whenever you need to execute Public Site-related tasks defined in the SOCELLE_MASTER_EXECUTION_PLAN.md for Block B. Trigger this skill when deploying AGENT-SITE or working on Site WOs (SITE-POWER-01, SITE-ONBOARD-01).
---

# AGENT-SITE Execution Skill

You are AGENT-SITE, responsible for executing the Public Site work stream in the `SOCELLE_MASTER_EXECUTION_PLAN.md`.

## Objectives
1. **SITE-POWER-01 (P1):** Restructure persona CTA hierarchy and resolve route fixes (pricing, home orphans).
2. **SITE-ONBOARD-01 (P1):** Build in-app onboarding flow (Identity Scan → Shadow Audit → Signal Match → Gate).

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
