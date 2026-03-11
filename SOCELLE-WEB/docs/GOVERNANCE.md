# SOCELLE BUILD GOVERNANCE

**Authority:** This is the operating system for all build work. Supersedes `.claude/CLAUDE.md` for operational rules (CLAUDE.md remains the design doctrine and stop conditions reference).
**Last updated:** 2026-03-10
**Owner:** Bruce Tyndall

---

## §1 — Source of Truth (What File Governs What)

| Question | File | Rule |
|----------|------|------|
| What are we building and in what order? | `SOCELLE-WEB/docs/command/CONSOLIDATED_BUILD_PLAN.md` §2-§3 | Phase order and WO registry. Do not invent new plans. |
| What is the acceptance criteria for a WO? | `SOCELLE_MASTER_BUILD_WO.md` §2-§9 | Full scope, owner, dependencies, acceptance per WO. |
| Is a WO done or open? | `SOCELLE-WEB/docs/build_tracker.md` + `docs/qa/verify_*.json` | Only these two. Never infer status from plan docs. |
| What are the design rules and stop conditions? | `.claude/CLAUDE.md` §6-§9, §12-§16 | Pearl Mineral V2, banned terms, anti-shell, launch gates. |
| What are the operational rules? | This file (`GOVERNANCE.md`) | WO lifecycle, branch policy, agent model, verification. |
| What skills exist for verification? | `.claude/skills/` (130 skills) | Skill-to-WO mapping in `.claude/CLAUDE.md` §1. |

**No other documents create work.** If work doesn't map to a WO in `CONSOLIDATED_BUILD_PLAN.md` or `build_tracker.md`, it does not get executed.

---

## §2 — Work Order Lifecycle

```
OPEN → IN_PROGRESS → PR_OPEN → VERIFIED → MERGED → RELEASED
```

| State | Definition | Who moves it | Evidence required |
|-------|-----------|-------------|-------------------|
| OPEN | In CONSOLIDATED_BUILD_PLAN or build_tracker, not started | — | — |
| IN_PROGRESS | Agent assigned, branch created, coding active | Agent | Branch name in build_tracker |
| PR_OPEN | Code complete, PR opened against `main` | Agent | PR URL in build_tracker |
| VERIFIED | `tsc --noEmit` = 0, `npm run build` = 0, required skills pass | Orchestrator | `docs/qa/verify_<WO_ID>_<timestamp>.json` |
| MERGED | PR merged to `main` | Orchestrator | Merge commit hash in build_tracker |
| RELEASED | Deployed (Netlify/Supabase) | Owner decision | Deploy URL |

**Rules:**
- No WO skips VERIFIED. No exceptions.
- The agent that writes code CANNOT mark its own WO as VERIFIED (anti-self-certification).
- If a WO has no matching entry in `CONSOLIDATED_BUILD_PLAN.md` §3, create one BEFORE coding.
- PARTIAL is allowed: record what's done and what's missing in build_tracker.

---

## §3 — Verification Protocol

Every WO must pass this gate before moving to VERIFIED:

### Mandatory (all WOs)
```bash
cd SOCELLE-WEB
npx tsc --noEmit          # must exit 0
npm run build             # must exit 0
```

### Required skills (by work type — run ALL that apply)

| Work touches... | Run these skills |
|----------------|-----------------|
| Edge functions / DB | `rls-auditor`, `schema-db-suite`, `migration-validator` |
| AI / Intelligence | `intelligence-hub-api-contract`, `ai-service-menu-validator`, `live-demo-detector` |
| UI components | `hub-shell-detector`, `design-lock-enforcer`, `token-drift-scanner` |
| Payments / credits | `stripe-integration-tester`, `credit-economy-validator` |
| Copy / text | `banned-term-scanner`, `cta-validator` |
| Any page edit | `hub-shell-detector`, `live-demo-detector` |
| Pre-merge (all) | `build-gate`, `banned-term-scanner` |

### Evidence format
Save to `SOCELLE-WEB/docs/qa/verify_<WO_ID>_<timestamp>.json`:
```json
{
  "wo_id": "WO-ID",
  "pr_number": 3,
  "timestamp": "2026-03-10T21:00:00Z",
  "tsc": { "exit_code": 0 },
  "build": { "exit_code": 0, "duration_s": 5.7 },
  "skills_run": ["skill-name"],
  "results": {
    "skill-name": { "status": "PASS", "failures": [], "evidence": "..." }
  },
  "files_changed": ["path/to/file.ts"],
  "overall": "PASS"
}
```

### Anti-false-PASS rules
- No PASS without the verification JSON existing in `docs/qa/`.
- Every FAIL in a skill must cite file path + line number.
- Every PASS must cite what was checked (not just "it passed").
- Scope-narrowing to avoid failure is a stop condition (e.g., "PASS — scoped to portals").

---

## §4 — Branch and PR Policy

### Naming
```
phase<N>/<wo-id>-<short-description>
```
Examples: `phase0/v2-intel-05-credit-economy`, `phase5/v2-plat-04-onboarding`

### Scope limits
- One PR = one WO (or tightly coupled WO group, e.g., `PAY-WO-01..05`).
- If a PR touches files outside its WO scope, it must document why.
- Maximum 30 files changed per PR. Split larger work into sequential PRs.

### Required checks before merge
1. `tsc --noEmit` = 0
2. `npm run build` = 0
3. Verification JSON exists in `docs/qa/`
4. No merge conflicts with `main`
5. Build_tracker updated with PR URL and status

### Merge order
- Merge in dependency order (lower phases before higher).
- After each merge: pull main, run `tsc + build`, confirm green.
- Tag last known good: `git tag lkg-<date>-<wo-id>` after each successful merge.

### Backout
- If a merge breaks `tsc` or `build`: revert immediately with `git revert`, tag `broken-<commit>`.
- Do not attempt to fix forward on main. Fix on branch, re-verify, re-merge.

---

## §5 — Agent Operating Model

### Limits
- Maximum 5 concurrent coding agents.
- Every agent MUST be assigned one or more WO IDs before it starts.
- No "exploratory" or "free work" agents. No agent writes code without a WO.

### Agent spec requirements
Before launching an agent, create a spec file at `/home/user/workspace/agent-specs/<wo-id>.md` containing:
1. WO ID(s) assigned
2. Branch name
3. Files the agent MAY touch (allowlist)
4. Files the agent MUST NOT touch (blocklist — other agents' zones)
5. Acceptance criteria (copied from `SOCELLE_MASTER_BUILD_WO.md`)
6. Required verification skills

### Conflict prevention
- Each agent gets a non-overlapping file zone. Orchestrator enforces this via the spec.
- If two WOs need the same file, they run sequentially, not in parallel.
- Shared code (`_shared/`, `components/ui/`, `lib/`) changes require orchestrator review before merge.

### Post-completion
- Agent pushes branch and opens PR.
- Agent does NOT mark WO as VERIFIED or MERGED.
- Orchestrator runs verification protocol and updates build_tracker.

---

## §6 — Daily Cycle Format

Every work session ends with this log (appended to conversation, not to repo):

```
## Cycle <N> — <date>

### Changed
- <what was modified, file-level>

### Tested
- tsc: <exit code>
- build: <exit code>
- skills: <which ran, PASS/FAIL>

### Logged
- build_tracker: <what was updated>
- verify JSONs: <which were created>

### Merged
- PR #<N> → main (commit <hash>) — or "nothing merged this cycle"

### Next cycle (max 5 bullets)
1. ...
```

---

## §7 — Stop Conditions (Halt and Ask Owner)

Inherited from `.claude/CLAUDE.md` §9 plus:

1. Any code that doesn't map to a WO in `CONSOLIDATED_BUILD_PLAN.md` §3.
2. An agent spec that requires touching another agent's file zone.
3. A merge that breaks `tsc` or `build` and can't be reverted cleanly.
4. Any DB migration that drops data (destructive op).
5. Any change to Stripe production keys or PAYMENT_BYPASS.
6. Conflicting acceptance criteria between `CONSOLIDATED_BUILD_PLAN` and `SOCELLE_MASTER_BUILD_WO`.
7. More than 5 PRs open simultaneously without merges.

---

## §8 — Build Plan Lineage (Strategic Planning Documents)

The complete strategic roadmap for SOCELLE exists across two versioned planning documents. Both are authoritative for understanding the full product vision, revenue sequencing, and phase structure. The governance system (this file + build_tracker + CONSOLIDATED_BUILD_PLAN) controls execution; the build plans control strategy.

| Document | Pages | Scope | Authority |
|----------|-------|-------|-----------|
| `SOCELLE_COMPLETE_BUILD_PLAN.pdf` (V1) | 10 | Original audit: codebase state (176K LOC, 278 pages, 136 tables), 6 revenue streams, 10 phases (0-9), 18-week timeline, 379-515h estimate. Priority: Speed to Profit + Product Quality. | Strategic baseline. Superseded by V2 for phase structure but remains the original audit record. |
| `SOCELLE_COMPLETE_BUILD_PLAN_V2.pdf` (V2) | 14 | Expanded audit: added AI tools (6 built), AI Orchestrator, credit economy, affiliate program, Service Intelligence, quiz-driven acquisition. 8 revenue streams (added AI Tools Premium, Affiliate Program, Service Menu Intelligence). 9 phases (0-8), 19-week timeline, 470-629h estimate. Full WO tracker (pp. 12-13). | Current strategic plan. All phase sequencing, revenue prioritization, and WO identification flows from this document. |

### Key differences V1 → V2
- Phase 0 expanded to include AI orchestrator security lockdown (CRITICAL: any auth user can call OpenAI unlimited)
- AI Tools Premium added as HIGHEST priority revenue stream alongside Intelligence Subscriptions
- Affiliate Program elevated from LOWER to HIGH priority with quiz-driven acquisition model
- Service Menu Intelligence added as standalone MEDIUM revenue feature
- Phase 2 expanded from "Brand Portal Go-Live" to "Brand Portal + Affiliate Engine"
- Phase 4 expanded from "Commerce Engine" to "Commerce + Service Intelligence"
- Phase 5 merged Business Portal + Education (was separate phases 5+6 in V1)
- Total estimate increased from 379-515h to 470-629h reflecting expanded scope
- V2 WO Tracker (pp. 12-13) lists 45 WOs with status mapping

### Rule
The V2 build plan is the active strategic document. V1 is retained as the historical audit baseline. Neither document creates work directly — all execution flows through `CONSOLIDATED_BUILD_PLAN.md` §2-§3 and `build_tracker.md`. But strategic decisions (what to build next, revenue prioritization, phase ordering) reference V2.

Both documents are stored in the workspace and were shared as the "SOCELLE Business Strategy" asset.

---

## §9 — What This File Replaces

This GOVERNANCE.md replaces the operational sections of:
- `.claude/CLAUDE.md` §0 (reading order → simplified to §1 above)
- `.claude/CLAUDE.md` §1.1 (post-pass audit → §3 above)
- `.claude/CLAUDE.md` §3 (execution priority → use CONSOLIDATED_BUILD_PLAN §2)
- `.claude/CLAUDE.md` §11 (one-turn rules → §6 above)
- Ad-hoc strategic notes → consolidated in §8 Build Plan Lineage

It does NOT replace:
- `.claude/CLAUDE.md` §5 (tech stack) — still authoritative
- `.claude/CLAUDE.md` §6 (Pearl Mineral V2 design) — still authoritative
- `.claude/CLAUDE.md` §7-§10 (anti-shell, LIVE/DEMO, stop conditions, observability) — still authoritative
- `.claude/CLAUDE.md` §12-§16 (boundaries, safety, launch gates) — still authoritative
- `CONSOLIDATED_BUILD_PLAN.md` — still the WO registry and phase order
- `SOCELLE_MASTER_BUILD_WO.md` — still the acceptance criteria source

---

*Quality outranks time. Intelligence platform first. No work without a WO. No merge without verification.*
