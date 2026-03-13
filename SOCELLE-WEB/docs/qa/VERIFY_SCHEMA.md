## VERIFY JSON – Canonical Schema

All WO verification artifacts must live under:

`SOCELLE-WEB/docs/qa/verify_<WO_ID>_<timestamp>.json`

This file describes the **expected shape** and fields for those JSON documents.

---

### 1. Top‑level structure

Each verify file MUST be a single JSON object with the following fields:

```json
{
  "wo_id": "WO-ID",
  "timestamp": "ISO-8601",
  "tsc": { "exit_code": 0 },
  "build": { "exit_code": 0 },
  "skills_run": ["skill-name-1", "skill-name-2"],
  "results": {
    "skill-name-1": { "status": "PASS", "failures": [], "evidence": "..." },
    "skill-name-2": { "status": "FAIL", "failures": ["..."], "evidence": "..." }
  },
  "files_changed": ["relative/path1.tsx", "relative/path2.ts"],
  "usability_checks": {
    "no_dead_ends": true,
    "loading_empty_error_states": true,
    "cta_hierarchy_ok": true,
    "demo_live_labeling_ok": true,
    "provenance_visible_or_linked": true,
    "a11y_smoke_ok": true,
    "specialist_inputs": {}
  },
  "overall": "PASS",
  "blocker_summary": ""
}
```

---

### 2. Field semantics

- **`wo_id`**
  - MUST match an entry in `build_tracker_v2.md`.
- **`timestamp`**
  - MUST be a valid ISO‑8601 string (e.g., `"2026-03-14T05:30:00Z"`).
- **`tsc` / `build`**
  - `exit_code` MUST be `0` for `overall: "PASS"`.
  - Non‑zero exit codes MUST set `overall: "FAIL"` and include a non‑empty `blocker_summary`.
- **`skills_run`**
  - Array of skill identifiers (strings) that were actually executed.
- **`results`**
  - Keys MUST correspond to entries in `skills_run`.
  - Each value MUST have:
    - `status`: `"PASS"`, `"FAIL"`, or `"SKIPPED_MISSING"`.
    - `failures`: array of human‑readable failure descriptions (empty if PASS).
    - `evidence`: short free‑text, log snippet, or pointer to an artifact.
- **`files_changed`**
  - Array of paths (relative to `SOCELLE-WEB/`) touched by this WO.
- **`usability_checks`**
  - `no_dead_ends`: all primary flows have onward navigation.
  - `loading_empty_error_states`: true if loading/empty/error states are present and coherent.
  - `cta_hierarchy_ok`: true if CTAs respect CANONICAL_DOCTRINE.
  - `demo_live_labeling_ok`: true if LIVE vs DEMO is correctly labeled.
  - `provenance_visible_or_linked`: true if data sources are visible or easily inspectable.
  - `a11y_smoke_ok`: true if a11y checks pass at a smoke‑test level.
  - `specialist_inputs`: optional object mapping specialist roles to comments/inputs.
- **`overall`**
  - `"PASS"` ONLY when:
    - `tsc.exit_code === 0`
    - `build.exit_code === 0`
    - All required skills for the WO type have `status: "PASS"`.
  - `"FAIL"` otherwise.
- **`blocker_summary`**
  - Optional string explaining why `overall` is `"FAIL"` or why the WO is BLOCKED.

---

### 3. Relationship to build tracker

- Each WO row in `build_tracker_v2.md` MUST:
  - Reference at least one `verify_<WO_ID>_<timestamp>.json`.
  - Match the **latest** verify file’s `overall` result when setting its own status.
- Agents MUST NOT:
  - Mark a WO as DONE / PASS / COMPLETE in docs without a corresponding `verify_*.json`.

