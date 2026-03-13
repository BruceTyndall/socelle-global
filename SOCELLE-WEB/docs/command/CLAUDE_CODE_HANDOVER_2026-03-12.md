## SOCELLE – Claude Code Handover (2026‑03‑12)

### TL;DR — Agent Quick Brief

1. **Read chain (mandatory, in order)**: `AGENTS.md` → `SESSION_START.md` → `SOCELLE_CANONICAL_DOCTRINE.md` → `build_tracker_v2.md` → this handover → hub‑specific docs (`CMS_ARCHITECTURE`, `JOURNEY_STANDARDS`, etc.).
2. **First infra WO = PWA‑V1**: PWA is currently disabled to keep builds green. Implement `injectManifest` in `vite.config.ts`, add `src/sw.ts` + `public/offline.html`, gate PWA to prod with `disable: !isProd`, and get `tsc` + `npm run build` passing. Details are in §2 (and should later live in `PWA_V1_SPEC.md`).
3. **CURRENT_QUEUE**: ~16 non‑mobile WOs remain. Several are `READY_FOR_REVIEW` but need *real* skill runs with fresh `verify_*.json` artifacts; others are `OPEN` or `BLOCKED`. Canonical status is always `build_tracker_v2.md`, not this file.
4. **Top product priority**: Owner considers the Intelligence Hub **not acceptable for paid use**. After infra/platform WOs are stable, define and ship “Intelligence Cloud v1” as a focused, spec‑driven WO cluster (spec first, then code).
5. **Lane order**: Infra (PWA‑V1 → CMS‑POWER‑01) → Intelligence → Admin → Commercial (Commerce+Sales) → Growth (Site+Onboarding).
6. **Before mini‑apps**: Clear AGENTS.md §4 critical debt, finish platform WOs in CURRENT_QUEUE, lock v1 of shared contracts (intelligence, entitlements, CMS), and ensure every DONE WO has a real `verify_*.json` with skills PASS and `usability_checks` filled.
7. **Never**: Self‑certify a WO you built, skip verify JSONs, change shared contracts without an infra WO, use banned terms from CANONICAL_DOCTRINE, or push directly to `main` with a failing build.

---

### 0. Environment & Git workflow

> If any detail here conflicts with `SESSION_START.md` or `AGENTS.md`, those files win.

**Environment setup (SOCELLE‑WEB)**
- **Node**: Use the version specified in `.nvmrc` or `package.json > engines` (do not downgrade).
- **Package manager**: Use the repo’s default (assume `npm` unless a `pnpm-lock.yaml` / `yarn.lock` exists).
- **Install**:
  - `cd SOCELLE-WEB`
  - `npm install`
- **Env vars**:
  - Copy `.env.example` → `.env.local` (or the environment file documented in `SESSION_START.md`).
  - Fill Supabase URL, anon key, and any required Stripe/host config exactly as in existing `.env` patterns.
- **Common commands**:
  - Dev server: `npm run dev`
  - Type check: `npx tsc --noEmit`
  - Build: `npm run build`

**Git workflow (for agents with push access)**
- **Branching**:
  - Branch from `main` as `wo/<WO-ID>` (e.g. `wo/PWA-V1`, `wo/CMS-POWER-01`).
- **Commits**:
  - Format: `[WO-ID] short description` (e.g. `[PWA-V1] wire injectManifest config`).
- **PRs**:
  - Push feature branch → open PR → CI must pass (tsc + build at minimum) → human owner review → merge.
- **If build breaks on main**:
  - Identify offending commit quickly.
  - Prefer `git revert <sha>` to restore a green build, then open a follow‑up WO/PR to re‑attempt with fixes.

**LIVE vs DEMO**
- Develop against DEMO data by default where possible.
- Do not introduce new unlabeled MOCK data on any user‑facing surface.
- Any intelligence surface must:
  - Use the shared `isLive` contract and DEMO/LIVE labeling patterns.
  - Pass `live-demo-detector` before the WO can be certified.

---

### 1. Primary sources of truth

**Governance & execution**
- **`/.Codex/AGENTS.md`** (and `/.claude/CLAUDE.md`): Root governance, stop conditions, launch gates, debt list.
- **`SOCELLE-WEB/docs/command/SESSION_START.md`**: Mandatory read chain + proof requirements.
- **`SOCELLE-WEB/docs/GOVERNANCE.md`**: Web app–specific rules, WO lifecycle, skill mappings.
- **`SOCELLE-WEB/docs/command/SOCELLE_CANONICAL_DOCTRINE.md`**: Banned terms, IA rules, commerce boundary, intelligence‑first doctrine.
- **`SOCELLE_MASTER_BUILD_WO.md`**: Master WO registry and acceptance criteria.
- **`SOCELLE-WEB/docs/command/CONSOLIDATED_BUILD_PLAN.md`**: Phase ordering, WO registry and cross‑hub dependencies.
- **`SOCELLE-WEB/docs/command/CMS_ARCHITECTURE.md`** + **`CMS_CONTENT_MODEL.md`**: Authoring Core, tables, spaces, block types.
- **`SOCELLE-WEB/docs/command/JOURNEY_STANDARDS.md`**: Per‑hub journeys and E2E expectations.

**Execution ledgers & QA**
- **`SOCELLE-WEB/docs/build_tracker_v2.md`** (and legacy `build_tracker.md`): Single execution ledger for CURRENT_QUEUE.
- **`SOCELLE-WEB/docs/qa/verify_<WO_ID>_<timestamp>.json`**: Verification artifacts (tsc, build, skills, usability_checks).
- **`SOCELLE-WEB/MASTER_STATUS.md`**: Build health, LIVE/DEMO, API/data status.

**Core contracts**
- **Intelligence**: `SOCELLE-WEB/src/lib/intelligence/useIntelligence.ts` (+ related hooks: `useIntelligenceChannels`, `useDataFeedStats`, `useBrandIntelligence`, `useActionableSignals`).
- **Entitlements & credits**: `SOCELLE-WEB/src/hooks/useTier.ts`, `ModuleRoute` + `useModuleAccess`, credit deduction RPC + credit dashboard.
- **CMS**: `SOCELLE-WEB/src/components/cms/PageRenderer.tsx` and related CMS hooks (`useContentPlacements`, `usePages`, etc.).
- **Routing**: `SOCELLE-WEB/src/App.tsx` (route map and hub boundaries).
- **Supabase types & schema**: `SOCELLE-WEB/src/lib/database.types.ts`, migrations under `supabase/migrations/`.

> **Authority rule:** If anything in this handover conflicts with `AGENTS.md`, `CLAUDE.md`, `SESSION_START.md`, `build_tracker_v2.md`, or the latest `verify_*.json` files, **those documents win**.

---

### 2. PWA / build gate – what’s been done and what you should implement

**Summary**

- PWA previously used `generateSW` + terser and broke `npm run build`.
- Temporary fix: PWA is **disabled** to keep the build green.
- Target state: **PWA‑V1** implemented via `injectManifest` + `src/sw.ts` + `public/offline.html`, gated to production with `disable: !isProd`, and fully passing `tsc` + `npm run build`.

> The full technical specification for this WO lives in `SOCELLE-WEB/docs/command/PWA_V1_SPEC.md`.  
> Use that file for all implementation details and verification steps.

At a minimum for PWA‑V1:
- Update `vite.config.ts` according to `PWA_V1_SPEC.md`.
- Add `src/sw.ts` with the Workbox routes defined there.
- Add `public/offline.html` (simple, on‑brand offline page).
- Run `npx tsc --noEmit` and `npm run build` in production mode and ensure both exit `0`.
- Create `verify_PWA-V1_<timestamp>.json` and a `PWA‑V1` WO row in `build_tracker_v2.md` marked `READY_FOR_REVIEW`.

**WO naming note**
- Existing naming in docs includes `PWA-BUILD-GATE-RESTORE-01` and the new infra concept `PWA‑V1`.
- Before you implement:
  - Decide whether to:
    - Map PWA‑V1 work into the existing `PWA-BUILD-GATE-RESTORE-01` WO, or
    - Create a dedicated infra WO row called `PWA‑V1`.
  - Reflect that decision clearly in `build_tracker_v2.md` so future agents have a single canonical ID for this work.

---

### 3. CURRENT_QUEUE snapshot (non‑mobile) – what’s left

> **Snapshot only.** This section is illustrative as of 2026‑03‑12.  
> The **only** authoritative source of WO status is `SOCELLE-WEB/docs/build_tracker_v2.md`.

**Outstanding WOs in CURRENT_QUEUE (non‑mobile)** (snapshot)

- **CRM / Sales / Marketing**
  - `CRM-POWER-01` — READY_FOR_REVIEW.
  - `CRM-POWER-02` — READY_FOR_REVIEW.
  - `CRM-CONSENT-01` — READY_FOR_REVIEW.
  - `SALES-POWER-01` — READY_FOR_REVIEW (has a clean PASS verify).
  - `SALES-AUTOFILL-01` — OPEN.
  - `MKT-POWER-01` — READY_FOR_REVIEW.

- **Intelligence**
  - `INTEL-MONETIZATION-01` — READY_FOR_REVIEW (depends on `WO-TAXONOMY-03` + AGENT‑17 dataset checks).
  - `INTEL-MONETIZATION-02` — READY_FOR_REVIEW (same dependency).
  - `INTEL-HUB-FEED-UX-01` — BLOCKED (skills not yet executed for re‑verify).

- **Commerce**
  - `COMMERCE-POWER-01` — OPEN.
  - `COMMERCE-PROCURE-01` — OPEN.

- **Admin**
  - `ADMIN-POWER-01` — OPEN.

- **CMS**
  - `CMS-POWER-01` — BLOCKED (build gate failure from PWA; now unblocked only via temporary PWA disable and still missing skill runs).

- **Site**
  - `SITE-POWER-01` — OPEN.
  - `SITE-ONBOARD-01` — OPEN.

- **Education**
  - `EDU-CE-EXPIRY-01` — OPEN.

> Mobile WOs (`MOBILE-POWER-01`, `MOBILE-PUSH-01`) exist but are explicitly **out of scope** for this handover.

**Known WO dependencies**
- `PWA‑V1` → unblocks the build gate for:
  - `CMS-POWER-01` (was previously BLOCKED by PWA failure).
- `CMS-POWER-01`:
  - Should only be re‑verified **after** PWA‑V1 is implemented and the build is stable.
- `INTEL-MONETIZATION-01` and `INTEL-MONETIZATION-02`:
  - Depend on taxonomy work (`WO-TAXONOMY-03`) and AGENT‑17 dataset checks as noted in build tracker / command docs.

Always check `build_tracker_v2.md` for the most up‑to‑date dependency/blocked‑by chain before starting a WO.

---

### 4. Intelligence Hub – blunt assessment and plan

**Owner’s position (to take seriously):**

> “The current Intelligence Hub is not acceptable for a paid intelligence product. It’s shallow, feels like a demo shell, and is barely worth looking at for free — let alone charging for.”

**Technical reality (front + back):**

- **Back‑end / data layer is strong:**
  - `market_signals` is rich: verticals, topics, tier_min/tier_visibility, impact_score, provenance_tier, sentiment, tags, enrichment metadata, premium article content, etc.
  - `useIntelligence`:
    - TanStack Query v5, vertical filters, tier gating, free‑tier 14‑day window, server‑side signal_type filtering, content_segment filtering, stricter timeline rules, realtime updates, and LIVE vs DEMO flags.
  - Personalization:
    - Preference scoring (`buildPreferenceScoreMap`), anonymous + user tag preferences, decently thought‑out scoring logic.

- **Front‑end / UX is visually impressive but shallow for “paid”**:
  - Public `Intelligence.tsx`:
    - Strong hero, stats, vertical tabs, board rows, editorial notes, CMS placements, etc.
  - Portal `business/IntelligenceHub.tsx`:
    - Tabbed experience (overview/trends/categories/competitive/local/provenance), AI toolbar, DEMO/LIVE banners, tier + credit gates.
  - But:
    - Journeys are **data‑first, not operator‑first**.
    - Very little “Here is what changed for you and here’s exactly what to do.”
    - AI tools are floating buttons, not integrated workflows.
    - The free vs paid story is not viscerally obvious on‑screen.

**Net:** From a paying operator’s POV it currently feels like a well‑designed **demo feed**, not a must‑have intelligence product, even though the data and hooks are much closer to “real” than that feeling suggests.

**Claude’s mandate – “Intelligence Cloud v1”**

- Treat **the entire current Intelligence Hub as DEBT** and:
  - **First produce a spec before writing code**:
    - Create `SOCELLE-WEB/docs/command/INTELLIGENCE_CLOUD_V1_SPEC.md` that:
      - Locks the **v1 module list** to a small, focused set (max 4–5 modules).
      - Defines per‑module data contracts (inputs/outputs, tables/hooks used).
      - States acceptance criteria and tier expression rules (free vs Starter vs Pro vs Enterprise).
    - Do not implement new Intelligence Cloud code until this spec is reviewed/approved by the owner.
  - Define an “Intelligence Cloud v1” spec as a WO cluster:
    - Modules aligned to operator jobs:
      - e.g. Pricing Guardrail, Menu Architect, Retail Mix Optimizer, Compliance Radar, Training Planner, Capacity Planning, Launch Playbooks.
    - Each module must have:
      - A dedicated hook (data contract) built on top of `useIntelligence` + other tables.
      - A primary surface with a clear “what changed” storyline.
      - Concrete **action CTAs**.
      - Tiered value expression (free vs Starter vs Pro vs Enterprise).
  - Re‑merchandise signals:
    - Use impact_score, provenance_tier, tier, tags, and verticals to build **curated boards**, not generic feeds.
    - Free: thin, top‑of‑funnel, safe; Paid: deep, multi‑panel boards and history.
  - AI orchestration:
    - Move from per‑signal tools to **module‑level workflows**:
      - “Turn these 7 Medspa safety shifts into a staff briefing + checklist.”
      - “Draft a pricing change announcement for retail SKUs impacted by signals X/Y/Z.”
  - Verification:
    - Run and capture:
      - `intelligence-hub-api-contract`
      - `intelligence-module-checker`
      - `intelligence-merchandiser`
      - `data-integrity-suite`
      - `provenance-checker`
      - `confidence-scorer`
      - `live-demo-detector`
    - Publish a consolidated **Intelligence Module Readiness Matrix** as a JSON or markdown artifact in `docs/qa/`.

---

### 5. Area‑by‑area audits (high‑level)

#### 5.1 Cross‑cutting platform

- **Strengths**
  - Modern stack: React 19, Vite 6, TS strict, TanStack Query v5, Supabase, Playwright.
  - Governance: AGENTS.md, SESSION_START, CANONICAL_DOCTRINE, build trackers, skills, and verify JSONs.
  - Shared UI: skeletons, error states, gates, Pearl Mineral V2 tokens.
- **Weaknesses**
  - Narrative gaps: many hubs look v1 but don’t yet feel indispensable.
  - Uneven verification: some WOs fully verified, others only “conceptually” verified or blocked.
  - PWA layer half‑done (design ready, code not implemented as a proper WO).
- **Claude actions**
  - Implement PWA‑V1 WO (above).
  - Normalize verification discipline across all WOs touched.
  - Enforce zero shells using `hub-shell-detector` + `shell-detector-ci`.

#### 5.2 CRM Hub

- **Strengths**
  - Clear WOs: `CRM-POWER-01`, `CRM-POWER-02`, `CRM-CONSENT-01`.
  - Consent and rebooking flows are recognized as first‑class needs.
  - Code generally follows the shared patterns (Supabase hooks, TanStack, entitlements).
- **Gaps**
  - Missing a clear chain: Intelligence → CRM actions → pipeline analytics.
  - Consent and logging need strong QA:
    - `entitlement-validator`, `audit-log-auditor`, `schema-db-suite`, `dev-best-practice-checker`.
- **Claude actions**
  - Take the three CRM WOs from READY_FOR_REVIEW to truly verified:
    - Run the skills above + `hub-shell-detector`, `live-demo-detector`, `copy-quality-suite`, `seo-audit` where relevant.
  - Wire full flows so signals can drive segment builds, cadences, rebooking, and win‑backs.

#### 5.3 Education Hub (incl. CE expiry)

- **Strengths**
  - Authoring Core is well‑specified; CMS table + block model exists.
  - `EDU-CE-EXPIRY-01` targets a real, sticky professional need.
- **Gaps**
  - Weak integration between intelligence and education:
    - Signals don’t obviously route into suggested CE/education.
  - CE expiry flows need full UX + data audits (reminders, certification logs, evidence).
- **Claude actions**
  - Implement and verify `EDU-CE-EXPIRY-01`:
    - Use `education-preference-alignor`, `education-module-creator`, `education-content-optimizer` + base DB and error‑state skills.
  - Bind CE content to intelligence topics so major shifts always have “learn this now” modules.

#### 5.4 Sales Hub (Proposals, Autofill)

- **Strengths**
  - `SALES-POWER-01` is in good shape with a clean PASS verify.
  - Proposal builder exists and is wired to intelligence concepts at a high level.
- **Gaps**
  - Autofill (`SALES-AUTOFILL-01`) is still open:
    - Proposals should pull SKUs, menu items, prices, and relevant signals automatically.
  - Sales and intelligence still feel separated.
- **Claude actions**
  - Complete `SALES-AUTOFILL-01`:
    - Implement hook‑driven autofill, handle edge cases, and verify with `dev-best-practice-checker`, `error-state-enforcer`, `loading-skeleton-enforcer`.
  - Embed intelligence context blocks into proposals as a first‑class pattern.

#### 5.5 Commerce Hub + Procurement

- **Strengths**
  - Cart, checkout, affiliates, procurement layers already exist.
  - Stripe and affiliate infrastructure have dedicated audit skills.
- **Gaps**
  - `COMMERCE-POWER-01` and `COMMERCE-PROCURE-01` are open:
    - Procurement flows not tightly married to intelligence (signals → inventory / purchase orders).
  - Intelligence vs commerce often feel like separate systems.
- **Claude actions**
  - Finish the two commerce WOs:
    - Use `affiliate-link-checker`, `affiliate-link-tracker-auditor`, `stripe-integration-tester`, `credit-economy-validator`, `cta-validator`, `banned-term-scanner`.
  - Implement intelligence‑driven merchandising and procurement views.

#### 5.6 Admin Hub

- **Strengths**
  - Admin routes exist for feature flags, health, audit logs.
  - Control Plane WOs (feature flags, kill‑switch, audit log, entitlements) are already complete.
- **Gaps**
  - `ADMIN-POWER-01` is open:
    - System health, feed health, AI usage/costs, credit balances, shell/DEMO status not fully surfaced.
- **Claude actions**
  - Build out `ADMIN-POWER-01` as the **single pane of glass**:
    - Use `system-health-dashboard-validator`, `schema-db-suite`, `data-integrity-suite`, `error-handling-auditor`.
    - Provide per‑hub status, feed freshness, and kill‑risk visibility.

#### 5.7 CMS + Public Site & Onboarding

- **CMS**
  - Strengths:
    - Strong PageRenderer, content model, CMS docs; admin pages wired to data via hooks.
  - Gaps:
    - `CMS-POWER-01` blocked and then partially unblocked, but still missing **real skills** and a fresh verify.
  - Claude actions:
    - After PWA‑V1 is implemented and builds are stable:
      - Run: `authoring-core-schema-validator`, `schema-db-suite`, `rls-auditor`, `hub-shell-detector`, `live-demo-detector`, `copy-quality-suite`.
      - Emit `verify_CMS-POWER-01_<timestamp>.json` with real PASS/FAIL and update `build_tracker_v2.md`.

- **Public Site & Onboarding**
  - Strengths:
    - Persona pages, quiz landings, waitlist, onboarding flows, SEO utilities.
  - Gaps:
    - `SITE-POWER-01` and `SITE-ONBOARD-01` open; persona journeys not yet tightly wired to the real product capabilities.
  - Claude actions:
    - Complete both WOs with journeys that clearly channel visitors into real hubs (Intelligence, CRM, Education, etc.).
    - Verify with `seo-audit`, `persona-page-validator`, `cta-validator`, `marketing-alignment-checker`, `banned-term-scanner`, `accessibility-checker`.

---

### 6. Mini‑app readiness & priorities

**You asked:** “When can we start working on mini apps separately, and what has to be prioritized first?”

**Pre‑mini‑app prerequisites**

1. **Clear critical debt (AGENTS.md §4)**
   - Remaining `brand-*` / `intel-*` token issues; raw `useEffect + supabase.from` violations; banned terms; `database.types.ts` drift; failing tests; LIVE/DEMO guard gaps; scattered `market_signals` callers.
   - Use: `token-drift-scanner`, `design-audit-suite`, `dev-best-practice-checker`, `banned-term-scanner`, `database-types-generator`, `schema-db-suite`, `live-demo-detector`.

2. **Finish platform‑level WOs in CURRENT_QUEUE**
   - PWA‑BUILD‑GATE‑RESTORE‑01 → **PWA‑V1 WO** (this doc).
   - `CMS-POWER-01` (once PWA‑V1 is in place).
   - `ADMIN-POWER-01`.
   - `COMMERCE-POWER-01`, `COMMERCE-PROCURE-01`, `SITE-POWER-01`, `SITE-ONBOARD-01`, `EDU-CE-EXPIRY-01`, `SALES-AUTOFILL-01`.

3. **Lock v1 of the shared contracts**
   - **Intelligence API contract**:
     - `useIntelligence`, merchandising rules, LIVE/DEMO behavior.
   - **Entitlements + credits**:
     - `useTier`, ModuleRoute, credit deduction, credit dashboards.
   - **CMS contract**:
     - PageRenderer, spaces, block model, RLS.
   - Verify with:
     - `intelligence-hub-api-contract`, `intelligence-module-checker`, `entitlement-chain-verifier`, `credit-economy-validator`, `schema-db-suite`, `rls-auditor`.

4. **Governance hygiene**
   - `build_tracker_v2.md` must match reality for all CURRENT_QUEUE WOs.
   - Every WO marked done must have:
     - `tsc` PASS.
     - `build` PASS.
     - Required skills PASS.
     - `verify_<WO_ID>_<timestamp>.json` with `overall: "PASS"` and filled `usability_checks`.
   - No self‑certification by the same agent that built the code.

> Practically: Claude can build code and prepare `verify_*.json`, but a **separate human or agent** must certify PASS/DONE/COMPLETE in docs or trackers per `AGENTS.md` §1.1.

**When mini‑apps are safe**

- Once the above are true, you can treat the platform as **v1‑frozen** and:
  - Slice work by hub (mini‑apps): Intelligence, CRM, Education, Sales, Commerce, Admin, Site.
  - For each lane:
    - Keep 1 active WO at a time per lane.
    - Do not silently change shared contracts; any such change must get its own infra WO + skills + verify.

---

### 7. Documents to amend or add for sub‑app individual projects

**Docs to update**

- **`SOCELLE-WEB/docs/build_tracker_v2.md`**
  - Add:
    - `PWA-V1` infra WO (this handover).
    - Any new “Intelligence Cloud v1” WOs.
  - Ensure all CURRENT_QUEUE entries reflect true status, blockers, and verify filenames.

- **`SOCELLE_MASTER_BUILD_WO.md`**
  - Add/clarify sections for:
    - Intelligence Cloud v1 modules as a dedicated WO group.
    - Mini‑app lanes (Intelligence, CRM, Education, Sales, Commerce, Admin, Site) and their cross‑dependencies.

- **`SOCELLE-WEB/docs/command/CONSOLIDATED_BUILD_PLAN.md`**
  - Reflect:
    - The new infra WO for PWA‑V1.
    - The “lane” structure for mini‑apps and ordering constraints.

- **`SOCELLE-WEB/docs/command/JOURNEY_STANDARDS.md`**
  - Enrich:
    - Intelligence and CRM/Education/Sales journeys to reflect Intelligence Cloud v1, CE expiry flows, proposals, onboarding updates.

- **`SOCELLE-WEB/docs/GOVERNANCE.md`**
  - Clarify:
    - Rules for “shared contract” changes (Intelligence API, entitlements, CMS).
    - Lane‑based mini‑app execution pattern.

**Docs that might be worth adding**

- **`SOCELLE-WEB/docs/command/INTELLIGENCE_CLOUD_V1_SPEC.md`**
  - Single source for:
    - Intelligence module list, per‑module contracts, data inputs, KPIs, and CTAs.

- **`SOCELLE-WEB/docs/command/ADMIN_HEALTH_DASHBOARD_SPEC.md`**
  - What `ADMIN-POWER-01` must show and how it aggregates metrics.

- **`SOCELLE-WEB/docs/command/PWA_V1_SPEC.md`**
  - To lock in the decisions from this handover for future PWA‑V2 work.

---

### 8. Suggested Claude lane plan (for you to assign)

- **Infra lane**
  - Implement PWA‑V1 (this doc) and unblock/verify `CMS-POWER-01`.
- **Intelligence lane**
  - Design and ship “Intelligence Cloud v1” across public, portal, and admin, then close `INTEL-HUB-FEED-UX-01` and both `INTEL-MONETIZATION-*` WOs with real skill runs.
- **Admin lane**
  - Build `ADMIN-POWER-01` as the unified health and observability console.
- **Commercial lane**
  - Finish `COMMERCE-POWER-01`, `COMMERCE-PROCURE-01`, `SALES-AUTOFILL-01` with intelligence‑driven flows and full monetization/FTC audits.
- **Growth lane**
  - Finish `SITE-POWER-01` and `SITE-ONBOARD-01`, and align public intelligence surfaces with the real Intelligence Cloud v1.

This file is intended as the **March 12th Claude code handover**: it captures the PWA fix design, current WO state, hub‑by‑hub audits, and the gating conditions for safe mini‑app lane work.

