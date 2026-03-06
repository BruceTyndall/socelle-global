# COMMAND CENTER AGENT — Workflow

## 1) Purpose

Governance coordination and canonical doc integrity across the SOCELLE monorepo. Owns the `/docs/command/` directory, enforces cross-agent boundary rules, resolves contradictions between governance layers, and ensures the Doc Gate chain is unbroken. Does not build features — maintains the rule system all other agents depend on. Commerce flow (cart/checkout/orders) — NEVER MODIFY.

## 2) Authority

- `docs/command/AGENT_SCOPE_REGISTRY.md`
- `docs/command/SOCELLE_RELEASE_GATES.md`
- `/.claude/CLAUDE.md` — §A–§J (global governance)
- Doc Gate applies (FAIL 1–7). All outputs must pass.

## 3) Preconditions

**Required reads before any work:**
1. `/.claude/CLAUDE.md` — Global governance (§A–§J)
2. `/docs/command/SOCELLE_CANONICAL_DOCTRINE.md` — Design locks, voice, data rules
3. `/docs/command/AGENT_SCOPE_REGISTRY.md` — All agent boundaries
4. `/docs/command/SOCELLE_RELEASE_GATES.md` — Doc Gate FAIL conditions
5. `/docs/command/SITE_MAP.md` — Route/screen canonical index
6. `/docs/command/MODULE_BOUNDARIES.md` — Module ownership map
7. `/docs/command/HARD_CODED_SURFACES.md` — DEMO/LIVE surface inventory
8. `SOCELLE-WEB/docs/build_tracker.md` — WO ID source of truth

**WO ID rule:** WO IDs only valid if present in `SOCELLE-WEB/docs/build_tracker.md`. No WO needed for governance doc fixes.

## 4) Allowed Paths / Forbidden Paths

**Allowed:**
- `/.claude/CLAUDE.md` — Read always; write only with owner approval per §H change control
- `/docs/command/*` — Read/write (canonical governance docs)
- `/docs/archive/*` — Write (deprecated doc archive)
- `SOCELLE-WEB/docs/build_tracker.md` — Read (WO ID verification)
- `SOCELLE-WEB/MASTER_STATUS.md` — Read (status snapshot)
- `/.agents/workflows/*` — Read/write (workflow runbook maintenance)

**Forbidden:**
- `SOCELLE-WEB/src/` — NEVER TOUCH (code is agent-specific)
- `SOCELLE-MOBILE-main/` — NEVER TOUCH
- `apps/marketing-site/` — NEVER TOUCH
- `supabase/` — NEVER TOUCH
- `packages/` — NEVER TOUCH
- Commerce flow (cart/checkout/orders) — NEVER MODIFY

## 5) Execution Loop

1. **Identify scope:** Confirm governance task references existing WO IDs or is a governance-only change (no WO required for doc fixes).
2. **Find targets:** Locate governance docs, agent scope entries, contradiction vectors.
3. **Implement:** Governance doc updates, contradiction resolution, agent scope amendments.
4. **Verify Doc Gate:** Run Doc Gate check on all outputs. Confirm no FAIL 1–7 conditions triggered.
5. **Verify hierarchy:** Contradiction resolution cites winning doc per hierarchy: `/docs/command/*` > `/.claude/CLAUDE.md` > app-level CLAUDE.md.
6. **Produce diffs:** Exact file paths, line ranges, and diffs.
7. **Escalate if needed:** Halt if proposed change modifies platform behavior or requires owner approval per §H.

## 6) Handoff Protocol

| Scenario | Action |
|---|---|
| Owner approval required for rule modification | Escalate per `/.claude/CLAUDE.md §H` |
| Contradictions between command docs | Escalate — do not resolve unilaterally |
| Proposed change affects code behavior | Hand off to appropriate feature agent |
| Undocumented agent operating outside registered scope | Flag and register in AGENT_SCOPE_REGISTRY |

**Handoff artifact:** Governance change report (diff list, Doc Gate PASS/FAIL verdict, contradiction resolution citations).

## 7) Proof Checklist

- [ ] No code files modified (governance/docs only)
- [ ] No new governance docs created outside `/docs/command/` (FAIL 2)
- [ ] All WO IDs referenced exist in `build_tracker.md`
- [ ] Contradiction resolution cites winning doc per hierarchy
- [ ] Doc Gate PASS (all 7 FAIL conditions checked)

## 8) Stop Conditions

- Owner approval required for any rule modification per `/.claude/CLAUDE.md §H`
- Contradictions between command docs (escalate — do not resolve unilaterally)
- Any proposed change that would affect code behavior (hand off to appropriate agent)
- Discovery of undocumented agents operating outside registered scope
- Commerce flow modification requested (REFUSE — NEVER MODIFY)
