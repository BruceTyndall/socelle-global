## MONOREPO MAP – SOCELLE GLOBAL

High‑level structure and scope boundaries for agents.

---

### 1. Top‑level layout (simplified)

- `SOCELLE-WEB/`
  - React + Vite web application (primary focus of this handover).
  - Includes:
    - `src/` – app code (pages, components, hooks, lib).
    - `docs/` – governance, command docs, QA artifacts.
    - `package.json` – web app scripts and dependencies.
- `SOCELLE-MOBILE-main/`
  - Flutter mobile app(s). **Out of scope** for this handover unless a WO explicitly pulls mobile in.
- `supabase/`
  - Migrations and edge functions for the shared backend.
  - Schema changes must follow `AGENTS.md` + DB skill guidance.
- Root docs
  - `AGENTS.md`, `SOCELLE_MASTER_BUILD_WO.md`, global governance and plans.

---

### 2. Agent scope for this handover

For the **Claude Code Handover (2026‑03‑12)**, default scope is:

- **IN SCOPE**
  - `SOCELLE-WEB/`:
    - Code under `src/`.
    - Web‑specific docs under `SOCELLE-WEB/docs/**`.
    - Web scripts in `SOCELLE-WEB/package.json`.
  - Root governance / plan docs:
    - `AGENTS.md`, `SESSION_START.md`, `SOCELLE_MASTER_BUILD_WO.md`, `CONSOLIDATED_BUILD_PLAN.md`.
  - Supabase **types and read‑only inspection**:
    - `SOCELLE-WEB/src/lib/database.types.ts`.
    - Reading `supabase/migrations/` and SKILL.md instructions.

- **CONDITIONALLY IN SCOPE (only if WO explicitly says so)**
  - New Supabase migrations under `supabase/migrations/`.
  - Edge function code.
  - CI configuration files.

- **OUT OF SCOPE (for this handover)**
  - `SOCELLE-MOBILE-main/` (mobile apps).
  - Any other non‑web packages unless a specific WO requires them.

---

### 3. Safety rules

- Do **not**:
  - Introduce destructive migrations (DROP TABLE/COLUMN, TRUNCATE, etc.) unless a WO and `AGENTS.md` explicitly allow it.
  - Edit mobile or desktop apps from web WOs.
  - Change CI pipelines as part of app‑level WOs without a dedicated infra WO.

If a WO requires crossing boundaries (e.g., web + Supabase migration), note that explicitly in the WO’s verify file and in `build_tracker_v2.md`.

