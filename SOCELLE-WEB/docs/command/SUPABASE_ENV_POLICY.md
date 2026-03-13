## SUPABASE & ENVIRONMENT POLICY – SOCELLE

Guidelines for agents interacting with Supabase, environment variables, and deployments.

---

### 1. Supabase environments

- **Production**
  - Treat as **read‑only** from the perspective of agents unless a WO explicitly authorizes a change.
  - No schema changes, data backfills, or manual writes without a clearly scoped WO and owner approval.

- **Staging / Dev**
  - Preferred targets for:
    - Running migrations.
    - Testing edge functions.
    - Verifying new features.
  - Follow the same RLS and safety expectations as production.

---

### 2. Migrations & schema changes

- **Default rule:** ADD‑ONLY, non‑destructive by default.
- Do **NOT**:
  - Drop tables or columns.
  - Truncate critical tables.
  - Disable RLS.
- Before adding or modifying migrations:
  - Read `AGENTS.md` sections for DB and migrations.
  - Run relevant skills:
    - `schema-db-suite`
    - `rls-auditor`
    - `migration-validator`
    - `database-types-generator` (to regenerate `database.types.ts`).

Any destructive change must be:
- Explicitly specified in a WO.
- Documented in `build_tracker_v2.md`.
- Paired with a rollback plan.

---

### 3. Environment variables

- Do:
  - Use `.env.example` as the canonical list of required variables.
  - Add new env vars to `.env.example` when truly needed, with safe placeholder values.
  - Reference env vars via configuration utilities or `import.meta.env` in Vite, not hardcoded strings.

- Do **NOT**:
  - Commit real secrets to the repo.
  - Rotate or overwrite production secrets from within code or scripts unless explicitly instructed.
  - Log secrets or tokens in verification output.

If you suspect a secret has leaked:
- Immediately flag it in `build_tracker_v2.md` and to the owner.
- Do not attempt unilateral secret rotation; await explicit instructions.

---

### 4. Deployments

- Agents with push access:
  - Should prefer **feature branches and PRs** over direct pushes to `main`.
  - Must ensure `npx tsc --noEmit` and `npm run build` pass before any merge that can trigger a deploy.
- If a deployment or main build fails:
  - Identify the offending commit.
  - Prefer `git revert` to restore a healthy state, then open a new WO/PR for a corrected attempt.

