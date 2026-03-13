## SKILL REGISTRY – SOCELLE WEB

**Purpose:** Map skill names referenced in governance and WOs to where they live, what they check, and how agents should think about running them.

> **Authority:** This file does not override `AGENTS.md` or individual `SKILL.md` files.  
> Always read the specific `SKILL.md` for exact usage.

---

### 1. Where skills live

- Primary skill definitions: `/.Codex/skills/**/SKILL.md`
- SOCELLE‑specific skills referenced in WOs:
  - Development / quality: `dev-best-practice-checker`, `build-gate`, `test-runner-suite`, `smoke-test-suite`.
  - Design / tokens: `design-audit-suite`, `design-lock-enforcer`, `token-drift-scanner`, `css-variable-font-system-validator`.
  - Intelligence: `intelligence-hub-api-contract`, `intelligence-module-checker`, `intelligence-merchandiser`, `data-integrity-suite`, `provenance-checker`, `confidence-scorer`, `live-demo-detector`.
  - CRM / Admin / Entitlements: `entitlement-validator`, `entitlement-chain-verifier`, `audit-log-auditor`, `system-health-dashboard-validator`, `feature-flag-validator`.
  - CMS / DB: `schema-db-suite`, `rls-auditor`, `migration-validator`, `database-types-generator`, `schema-drift-detector`.
  - Copy / SEO / Marketing: `copy-quality-suite`, `banned-term-scanner`, `marketing-alignment-checker`, `seo-audit`, `voice-enforcer`.
  - Shell & UX states: `hub-shell-detector`, `shell-detector-ci`, `empty-state-enforcer`, `loading-skeleton-enforcer`, `error-state-enforcer`, `shared-state-components-auditor`.

---

### 2. How to run skills (conceptual)

There is **no single universal CLI** for all skills. Instead:

1. **Find the skill**:
   - Open `/.Codex/skills/<skill-name>/SKILL.md`.
   - Read the “How to use” section; it may point to:
     - A node script (e.g., `node docs/qa/agents/run_<skill>.mjs`).
     - An npm script (e.g., `npm run skill:<skill-name>`).
     - A Playwright or test runner command.
2. **Execute according to SKILL.md**:
   - Prefer existing npm scripts if defined in `SOCELLE-WEB/package.json`.
   - If a SKILL.md describes a multi‑step manual process, follow it and capture evidence in the corresponding `verify_*.json`.
3. **Record results**:
   - For each WO, the `verify_<WO_ID>_<timestamp>.json` should:
     - List all skills in `skills_run`.
     - Capture per‑skill status, failures (if any), and evidence in `results`.

If a named skill appears in governance but **no SKILL.md exists**:
- Treat that as a missing implementation.
- Note it explicitly in the WO’s `verify_*.json` under `results` with `status: "FAIL"` or `"SKIPPED_MISSING"` and evidence describing the gap.
- Do **not** silently omit skills.

---

### 3. Required vs optional skills (by work type)

These mappings are already defined in `SESSION_START.md` and `AGENTS.md`; this section simply re‑states them for quick reference.

- **Any page edit**
  - MUST: `hub-shell-detector`, `live-demo-detector`
- **Token / design changes**
  - MUST: `token-drift-scanner`, `design-audit-suite`, `design-lock-enforcer`
- **Data / hook work**
  - MUST: `dev-best-practice-checker`, `hook-consolidator` (where relevant)
- **DB migrations**
  - MUST: `rls-auditor`, `schema-db-suite`, `migration-validator`
- **Pre‑completion of any WO**
  - MUST: `build-gate`, `banned-term-scanner`, `proof-pack`
- **Intelligence / feed work**
  - MUST: `intelligence-hub-api-contract`, `intelligence-module-checker`, `intelligence-merchandiser`

When in doubt, default to **running all skills listed for that work type in `SESSION_START.md`**.

