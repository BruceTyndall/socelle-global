# Agent Workflows — SOCELLE GLOBAL

## Purpose

This directory contains operational workflow runbooks for every registered agent in the SOCELLE monorepo. Each workflow defines exactly what an agent may do, where it may operate, and what proofs it must produce before marking work complete.

Workflows are the execution layer beneath governance. They translate the rules in `/docs/command/AGENT_SCOPE_REGISTRY.md` into step-by-step operating procedures.

## Authority

All workflows are governed by:

1. `/.claude/CLAUDE.md` — Global governance + Doc Gate (FAIL 1–7)
2. `/docs/command/AGENT_SCOPE_REGISTRY.md` — Agent scopes, allowed/forbidden paths, proof checklists, handoff protocol
3. `/docs/command/SOCELLE_CANONICAL_DOCTRINE.md` — Design locks, voice, data integrity
4. `/docs/command/SOCELLE_RELEASE_GATES.md` — Pre-merge/pre-deploy checklists, no-fake-live validation
5. `/docs/command/SOCELLE_DATA_PROVENANCE_POLICY.md` — Data sourcing, freshness SLAs, confidence scoring

**If any workflow contradicts a command doc, the command doc wins.**

## Workflow Template (Required Sections)

Every workflow file MUST contain these 8 sections:

| # | Section | Purpose |
|---|---|---|
| 1 | **Purpose** | One paragraph defining the agent's mission |
| 2 | **Authority** | Exact governing docs + "Doc Gate applies" |
| 3 | **Preconditions** | Required reads + WO ID sourcing rule |
| 4 | **Allowed Paths / Forbidden Paths** | Must match AGENT_SCOPE_REGISTRY exactly |
| 5 | **Execution Loop** | Step-by-step: find targets, verify LIVE/DEMO, produce diffs, run builds |
| 6 | **Handoff Protocol** | When to hand off and what artifact to produce |
| 7 | **Proof Checklist** | Domain-appropriate build checks; references AGENT_SCOPE_REGISTRY proofs |
| 8 | **Stop Conditions** | What triggers STOP + escalation to owner |

## Doc Gate Checks (Every Workflow Must Include)

Every agent output must pass the Doc Gate before completion:

| # | Check | Enforcement |
|---|---|---|
| FAIL 1 | No external doc cited as authority | Only `/docs/command/*` is authoritative |
| FAIL 2 | No new work order docs outside `build_tracker.md` | WO IDs only valid if in `SOCELLE-WEB/docs/build_tracker.md` |
| FAIL 3 | No contradiction with command docs | Design locks, provenance, entitlements |
| FAIL 4 | No fake-live claims | Numbers/timestamps must derive from real `updated_at` or show DEMO badge |
| FAIL 5 | No omitted routes vs SITE_MAP.md | Complete coverage required |
| FAIL 6 | Ecommerce never elevated above Intelligence Hub | Commerce is a module, not the IA center |
| FAIL 7 | No outreach/cold email content | `send-email` is transactional only |

## Universal Forbidden Paths (All Agents)

These paths are off-limits to every agent unless explicitly allowed in AGENT_SCOPE_REGISTRY:

- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- Commerce flow (cart, checkout, orders) — NEVER MODIFY

## WO ID Rule

WO IDs are only valid if present in `SOCELLE-WEB/docs/build_tracker.md`. No agent may invent, reference, or execute WO IDs not tracked there.

## File Index

See `/docs/command/AGENT_WORKFLOW_INDEX.md` for the complete mapping of agents to workflow files.
