## WORK ORDER STATUS GLOSSARY

Canonical meanings for WO status labels used in `build_tracker_v2.md`.

---

### 1. Status values

- **OPEN**
  - Work is defined but not yet started.
  - No current implementation branch or verify JSON for this WO in the current phase.

- **IN_PROGRESS**
  - Work is actively being implemented.
  - There may be partial verify artifacts (e.g., intermediate `verify_*.json` with `overall: "FAIL"` or “BLOCKED”).

- **BLOCKED**
  - Work cannot proceed due to a dependency or failing gate, such as:
    - Build failing.
    - Required skill or infra not available.
    - Another WO not yet complete (explicit dependency).
  - `blocker_summary` in the latest `verify_*.json` SHOULD describe the reason.

- **READY_FOR_REVIEW**
  - Implementation is believed complete by the builder.
  - `tsc` and `build` are passing.
  - Required skills for that WO type have been run and captured in `verify_*.json`.
  - Awaiting independent review / certification.

- **PASS / COMPLETE / DONE** (in verify JSONs)
  - `overall: "PASS"` in `verify_*.json` AND
  - WO status in `build_tracker_v2.md` has been updated by a **reviewer** (not the builder) to reflect completion.
  - Per `AGENTS.md` §1.1, the builder MUST NOT self‑certify PASS/DONE/COMPLETE/✅.

---

### 2. Relationship between tracker and verify files

- `build_tracker_v2.md`:
  - Single source of truth for **current WO status**.
- `docs/qa/verify_<WO_ID>_<timestamp>.json`:
  - Single source of truth for **what actually ran and passed/failed**.

Rules:
- A WO must **not** be marked DONE/PASS/COMPLETE unless:
  - There exists a `verify_*.json` with `overall: "PASS"`.
  - That file is referenced from the WO’s row in `build_tracker_v2.md`.
- If verify says FAIL/BLOCKED:
  - Status in `build_tracker_v2.md` MUST reflect `BLOCKED` or `OPEN`, not DONE.

