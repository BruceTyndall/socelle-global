# DOC CONFLICT PATCH PLAN — GOVERNANCE & AUTHORITY

**Project:** SOCELLE GLOBAL — SOCELLE-WEB  
**Date:** 2026-03-13  
**Anchor commit:** d1442d3  
**Authority:** `/.claude/CLAUDE.md` §0, §2–§4; `docs/command/SOURCE_OF_TRUTH_MAP.md` §1–§5; `docs/ops/DOC_INVENTORY_REPORT.md` §5–§6; `SOCELLE-WEB/docs/ops/SPLIT_AUDIT__LOST_WO_REPORT.md` §2; `SOCELLE-WEB/docs/ops/SPLIT_AUDIT__TRUTH_VALIDATION.md` §§1–2.

---

## 0. Purpose

This plan enumerates **known documentation conflicts**, classifies them under Tier‑0/1 authority rules, and proposes **exact patch text** to resolve them under a single docs‑only WO:

- **WO proposal:** `DOC-GOV-01 — Governance and Authority Doc Patch`.

No code changes are required; all edits are confined to documentation.

---

## 1. MASTER_STATUS authority pointer mismatch

### 1.1 Conflict

- **File:** `SOCELLE-WEB/MASTER_STATUS.md`  
- **Lines:** 3–7:

```markdown
L3:# SOCELLE — MASTER STATUS DOCUMENT
L4:**Last Updated:** March 9, 2026 — Session 49 (Ultra Drive completion)
L5:**Purpose:** Single source of truth for all agents. Replaces PLATFORM_STATUS.md and SOCELLE_MASTER_WORK_ORDER.md for current-state tracking.
L6:**Authority:** `docs/command/V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` (V1 wins if conflicts exist)
```

- **Conflict with:**  
  - Tier‑0/1 chain defined in `/.claude/CLAUDE.md` §0 and `docs/command/SOURCE_OF_TRUTH_MAP.md` lines 21–31.  
  - `SOURCE_OF_TRUTH_MAP.md` now says `/.claude/CLAUDE.md` is Tier 0; `build_tracker.md`, `MASTER_STATUS.md`, `SOCELLE_MASTER_BUILD_WO.md`, `V3_BUILD_PLAN.md` are Tier 1.

### 1.2 Patch (exact replacement block)

**New header block:**

```markdown
L3:# SOCELLE — MASTER STATUS DOCUMENT
L4:**Last Updated:** March 9, 2026 — Session 49 (Ultra Drive completion)
L5:**Purpose:** Build health snapshot for all agents. Replaces older PLATFORM_STATUS-style docs for current-state tracking.
L6:**Authority:** `/.claude/CLAUDE.md` (Tier 0) → `docs/command/SOURCE_OF_TRUTH_MAP.md` (Tier 1) → this file (Tier 1 status snapshot). If this file conflicts with `SOCELLE-WEB/docs/build_tracker.md` on WO status, `build_tracker.md` + QA artifacts win.
```

---

## 2. V1 vs V3 wording in SOCELLE_MONOREPO_MAP.md and MODULE_BOUNDARIES.md

### 2.1 `SOCELLE_MONOREPO_MAP.md`

- **File:** `docs/command/SOCELLE_MONOREPO_MAP.md`  
- **Lines:** 1–7:

```markdown
L1:> Updated to align with V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md on 2026-03-08.
L2:
L3:# SOCELLE MONOREPO MAP
L4:**Generated:** March 5, 2026 — Phase 1 Full Audit
L5:**Updated:** March 8, 2026 — V1 Master Alignment
L6:**Authority:** `docs/command/V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` (V1 wins if conflicts exist)
L7:
```

- **Conflict:** Authority pointer still claims “V1 wins if conflicts exist” while Tier‑0/1 chain now routes through `/.claude/CLAUDE.md` and `SOURCE_OF_TRUTH_MAP.md`.

**Patch (replace lines 1–6):**

```markdown
L1:> Updated to align with `/.claude/CLAUDE.md` and `docs/command/SOURCE_OF_TRUTH_MAP.md` on 2026-03-13.
L2:
L3:# SOCELLE MONOREPO MAP
L4:**Generated:** March 5, 2026 — Phase 1 Full Audit
L5:**Updated:** March 13, 2026 — Authority chain alignment
L6:**Authority:** `/.claude/CLAUDE.md` (Tier 0) → `docs/command/SOURCE_OF_TRUTH_MAP.md` (Tier 1). This file describes structure only; it does not override build_tracker or WO docs.
L7:
```

### 2.2 `MODULE_BOUNDARIES.md`

- **File:** `docs/command/MODULE_BOUNDARIES.md`  
- **Lines:** 3–6:

```markdown
L3:# MODULE BOUNDARIES — SOCELLE GLOBAL
L4:**Generated:** March 5, 2026 — Phase 1 Full Audit
L5:**Authority:** `V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` (master), `docs/command/SOCELLE_CANONICAL_DOCTRINE.md` §1
L6:
```

- **Conflict:** Same V1‑first wording as above.

**Patch (replace lines 3–5):**

```markdown
L3:# MODULE BOUNDARIES — SOCELLE GLOBAL
L4:**Generated:** March 5, 2026 — Phase 1 Full Audit
L5:**Authority:** `/.claude/CLAUDE.md` (Tier 0) → `docs/command/SOURCE_OF_TRUTH_MAP.md` (Tier 1) → this file (module boundaries). `SOCELLE_CANONICAL_DOCTRINE.md` §1 governs design and copy rules referenced here.
L6:
```

---

## 3. Legacy WO ID namespaces — API_LOGIC_MAP and WORK_ORDER_BACKLOG

### 3.1 `docs/operations/API_LOGIC_MAP.md`

- **File:** `docs/operations/API_LOGIC_MAP.md`  
- **Key lines:**
  - Authority header: line 5  
  - API‑WO series: lines 681–795 (defines `API-WO-01`..`API-WO-15`).
- **Conflict:**  
  - API‑WO IDs are no longer used in `SOCELLE-WEB/docs/build_tracker.md`, but the doc doesn’t label them as superseded.

**Patch snippets:**

1. **Append to authority header (around line 5):**

```markdown
L5:**Authority:** OPERATION_BREAKOUT.md + CLAUDE.md §16. **Note:** The API-WO-* IDs in §6 were planning aliases and are now superseded by CTRL-WO-0x, FEED-WO-0x, PAY-WO-0x, INTEL-MEDSPA-01, and API-DEPLOY-01 as recorded in `SOCELLE-WEB/docs/build_tracker.md`.
```

2. **Add a short banner above the API-WO table (before line 681):**

```markdown
> **Superseded planning IDs:**  
> The `API-WO-*` work order IDs below describe historical planning for API work.  
> Do **not** add these IDs to `build_tracker.md`. Use the current WO IDs in `/SOCELLE_MASTER_BUILD_WO.md` and `SOCELLE-WEB/docs/build_tracker.md` instead.
```

### 3.2 `SOCELLE-WEB/docs/audit/SOCELLE_WORK_ORDER_BACKLOG.md`

- **File:** `SOCELLE-WEB/docs/audit/SOCELLE_WORK_ORDER_BACKLOG.md`  
- **Key lines:** 1–4 (header), 8–334 (backlog entries).  
- **Conflict:**  
  - Backlog is easily misread as an active WO registry, though header does warn it is PROPOSED.

**Patch (insert stronger banner after line 4):**

```markdown
> **GENERATED SNAPSHOT — NOT EXECUTION AUTHORITY**  
> This file is an audit-era backlog snapshot. `SOCELLE-WEB/docs/build_tracker.md` is the sole execution authority for WO IDs.  
> Do not start work from this file without first adding or confirming a WO in `build_tracker.md` and cross-referencing `/SOCELLE_MASTER_BUILD_WO.md`.
```

This mirrors guidance from `docs/ops/DOC_INVENTORY_REPORT.md` lines 168–180, 280–282.

---

## 4. WO proposal — DOC-GOV-01

**WO ID:** `DOC-GOV-01`  
**Title:** Governance and Authority Doc Patch  
**Scope (docs only):**

1. Update `SOCELLE-WEB/MASTER_STATUS.md` header to reference `/.claude/CLAUDE.md` and `SOURCE_OF_TRUTH_MAP.md` as authority, and to clarify it is a **status snapshot**, not execution law.
2. Update `docs/command/SOCELLE_MONOREPO_MAP.md` and `docs/command/MODULE_BOUNDARIES.md` to remove V1‑wins wording and align with the Tier‑0/1 chain.
3. Add “superseded planning IDs” notes to:
   - `docs/operations/API_LOGIC_MAP.md` (API‑WO series).  
   - `SOCELLE-WEB/docs/audit/SOCELLE_WORK_ORDER_BACKLOG.md` (COPY‑WO‑01, SHELL‑WO‑01, INTEL‑WO‑12, etc.).
4. Optionally add short “AUDIT SNAPSHOT / NOT EXECUTION AUTHORITY” headers to:
   - `SOCELLE-WEB/docs/audit/SOCELLE_MASTER_ACTION_PLAN.md` and similar audit copies, per `DOC_INVENTORY_REPORT.md` recommendations.

**Acceptance criteria:**

- `docs/command/SOURCE_OF_TRUTH_MAP.md` §1–§5 remain accurate after patches.  
- A grep for `V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH` in Tier‑1 docs only appears in historical notes, not authority headers.  
- API‑WO and backlog WO IDs are clearly marked as **superseded** and do not appear in `SOCELLE-WEB/docs/build_tracker.md`.

**Proof:**

- QA note (markdown) appended to `docs/ops/EXECUTION_STATE_AUDIT.md` in a future session:
  - Summarizing the above edits with file+line citations.  
- `git diff` for the doc files listed above attached to a `verify_DOC-GOV-01_<timestamp>.json` artifact.

