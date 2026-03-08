You are the COMMAND AGENT for the SOCELLE monorepo.

IMPORTANT CONTEXT:
- The ONLY document that reflects the OWNER’S CURRENT DIRECTION is:
  - `V3SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` (V3 master — supersedes V1)
- All other command/governance docs (including `SOCELLE_MASTER_CLAUDE_MD_COMPLETE.md`) are older and may conflict.
- Your job in this run is to:
  1) Read the new V1 master file.
  2) Treat it as the top authority.
  3) Rewrite the rest of the command-layer docs to match it.
  4) Register work orders so future agents execute the plan.

Do NOT touch application code, schemas, or runtime configs in this run.

========================================
STEP 0 — READ THE NEW MASTER
========================================

1. Read `V3SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` in full (supersedes V1).
2. Treat it as the **single source of truth** for:
   - Tech baseline: React 19 + Vite 6 + strict TypeScript, TanStack Query, Playwright, Supabase (RLS + pg_cron + pgvector), AI orchestrator with caching + eval harness.
   - Observability via Admin Hub dashboards and CMS Hub publish/route health (not external Sentry dashboards).
   - “Surgical upgrade, no rewrite” framing for React/Vite/TS:
     - React 18.3 → 19.x ≈ 2 hours.
     - Vite 5.x → 6.x ≈ 1 hour.
     - TS strict flip ≈ 3–5 hours.
   - Tailwind 3 now + token linting; Tailwind 4 later.
   - Multi-hub, no-shell rule and hub list.
   - Multi-platform plan: web (React+Vite) first, then Tauri desktop shell, then Flutter mobile using shared API contracts.
   - Execution phases and gates.

If anything in any other doc contradicts this V1 file, V1 wins.

========================================
STEP 1 — PROMOTE V1 AS THE MASTER
========================================

Update:

- `SOCELLE_MASTER_CLAUDE_MD_COMPLETE.md`
- `ROOT_CLAUDE.md`
- `SOCELLE_WEB_CLAUDE.md`

For each:

1. Insert at the top:

   “NOTE: This file is aligned to `V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md`. If this file conflicts with V1, the V1 file wins.”

2. In `SOCELLE_MASTER_CLAUDE_MD_COMPLETE.md`:
   - Rewrite its tech stack, execution order, and hub descriptions so they match the V1 version:
     - Emphasize React 19 + Vite 6 + TS strict as small, incremental upgrades on a working React 18.3 + Vite 5.4 + TS 5.5 codebase.
     - Explicitly state the one-day upgrade effort.
     - Clarify web runtime: React + Vite as primary; Next.js only optional/future.
     - Tailwind 3 now, Tailwind 4 later.
     - Phases exactly as in V1 (skills first, then audit, then tech upgrades, then Intelligence Cloud, then all hubs, then multi-platform, then launch).

3. In ROOT_CLAUDE and SOCELLE_WEB_CLAUDE:
   - Remove or soften anything that suggests:
     - Big rewrites rather than surgical upgrades.
     - Next.js as the main runtime.
   - Ensure they reference:
     - Web: React+Vite.
     - Desktop: Tauri wrapper.
     - Mobile: Flutter with shared API contracts.

========================================
STEP 2 — ALIGN OTHER GOVERNANCE DOCS
========================================

Using V1 as the authority, go through and update:

- `SOCELLE_CANONICAL_DOCTRINE.md`
- `SOCELLE_ENTITLEMENTS_PACKAGING.md`
- `SOCELLE_DATA_PROVENANCE_POLICY.md`
- `SOCELLE_FIGMA_DESIGN_BRIEF.md`
- `SOCELLE_FIGMA_TO_CODE_HANDOFF.md`
- `SOCELLE_RELEASE_GATES.md`
- `AGENT_SCOPE_REGISTRY.md`
- `AGENT_WORKFLOW_INDEX.md`
- `AGENT_WORKING_FOLDERS.md`
- `SOCELLE_MONOREPO_MAP.md`
- `GLOBAL_SITE_MAP.md`
- `SITE_MAP.md`
- `BRAND_SURFACE_INDEX.md`
- `MASTER_STATUS.md`
- `MONOREPO_TOOLING.md`
- `MONOREPO_PORT_VERIFICATION.md`
- `MIGRATION_INTEGRITY_REPORT.md`
- `MODULE_BOUNDARIES.md`
- `HARD_CODED_SURFACES.md`
- `ASSET_MANIFEST.md`

For each:

1. Read existing content.
2. Compare to V1.
3. Rewrite sections that conflict with V1 about:
   - Tech baseline and “surgical upgrade” framing.
   - Anti-shell rule and required hub completeness.
   - Multi-hub list and Intelligence-first IA.
   - Multi-platform strategy (React+Vite → Tauri → Flutter).
4. Add a short note at the top:
   - “Updated to align with V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md on <today’s date>.”

========================================
STEP 3 — UPDATE AGENT + WORKFLOW REGISTRIES
========================================

In:

- `AGENT_SCOPE_REGISTRY.md`
- `AGENT_WORKFLOW_INDEX.md`
- `AGENT_WORKING_FOLDERS.md`

Make sure they now reflect the agent roster and hub responsibilities as defined in V1:

- Command Agent, Intelligence Architect, Platform Engineer, Design Guardian, Security, QA, Copy, Monetization, Data Architect, Commerce/Ecommerce, Education, Marketing, Sales, Multi-Platform, etc.
- Each hub (Intelligence, Jobs, Brands, Professionals, Admin, CRM, Education, Marketing, Sales, Commerce, Authoring Studio, Mobile, Desktop, Credit Economy, Affiliate Engine) must:
  - Have an assigned owner agent role.
  - Explicitly reference “NO SHELLS” and list the minimum functional surface (Create/List/Detail/Edit/Permissions/Exports/Observability/Intelligence input).

========================================
STEP 4 — REGISTER REBUILD WORK ORDERS
========================================

In `build_tracker.md`:

1. Add a new top-level section: “SOCELLE V2 – Align With V1 Master + Rebuild Plan”.
2. Create work orders such as:
   - V2-COMMAND-01: Align command docs to V1 master.
   - V2-COMMAND-02: Refresh agent scopes and workflows.
   - V2-COMMAND-03: Update site maps and brand surfaces to V1.
   - V2-TECH-01: Execute tech baseline upgrades (React 19, Vite 6, TS strict, TanStack, Playwright, types regen). ALL COMPLETE + FROZEN.
   - V2-INTEL-01: Implement Intelligence Cloud v1 (10 modules, 7 engines, 6 AI tools).
   - V2-HUBS-01..N: Make each hub non-shell.

Each WO should have: scope, inputs (which docs), outputs (which files/artifacts), owner agent role, and which gate it helps satisfy.

========================================
STEP 5 — PROOF PACK (FINAL ANSWER)
========================================

At the end of this run, output a short Markdown report that includes:

- List of files you modified (paths).
- 2–3 bullets per file describing the major changes.
- List of new Work Orders in `build_tracker.md`.
- Any open questions or conflicts you found between V1 and existing docs.

Do NOT:
- Modify React/TS code or Supabase schema.
- Change pricing or tiers.
- Weaken safety, legal, or provenance requirements.

Your job in this run is ONLY: take the owner’s updated V1 master file and push that direction into all command/gov docs and build_tracker so future agents can execute the rebuild correctly.

Begin.
This uses your updated V1 file as the only authoritative input and tells Command to bring everything else up to match it. You don’t need to touch the other docs manually.

When are we implementing the CMS
You should implement the CMS after Intelligence Cloud is live but before you finish all other hubs — roughly alongside Marketing/Education, not at the very end.

Given your phases and current direction, a clean placement is:

Phase 4: Intelligence Cloud build (10 modules, 7 engines, 6 AI tools).

Phase 5: “All hubs functional” — this is where CMS lives, because:

CMS is the backbone for: blog, stories/briefs, launch comms, SEO content, education content, and in-app help.

It’s also where your “blog everywhere” and Authoring Studio will eventually connect.

So: Phase 5, early, in parallel with:

Marketing Hub (campaigns, content placements).

Education Hub (courses, articles, learning content).

Authoring Studio (later wires into CMS, but the CMS tables and admin go first).

If you want, I can outline a minimal CMS scope (tables + routes + admin screens) that fits your no-shell rule but can be built in about a week.

Yes you need to update this file with your new direction so we have one source of truth and then command can update everything else please update this in an md file

V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md
Here’s an updated V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md that bakes in the new direction: React 19 + Vite 6 + TS strict as surgical upgrades, React+Vite as the primary runtime, Tailwind 3 now (Tailwind 4 later), skills-first, and the multi-hub/multi‑platform plan.

You can paste this over your existing V1 file and commit it.

text
# SOCELLE — ONE SOURCE OF TRUTH (V1)
# This file IS the master plan. Every agent reads this FIRST.
# Last updated: March 8, 2026 (V1 direction lock)

SOCELLE is a B2B intelligence platform for the professional beauty and medspa industry.  
Intelligence platform FIRST. Marketplace second. Always.

**One-liner:** “Spate tracks consumers. SOCELLE tracks Licensed Pros.”

**Value flow:** Intelligence → Trust → Transaction → Retention (non‑negotiable order)

**Revenue model:** Tri‑sided — SaaS subscriptions + wholesale affiliate commission + AI add‑ons + B2B ad‑tech.

**Target:** $158,500/mo at 1,000 subscribers (~96% margin).

---

## §A — Personas & Pricing (Locked)

### Personas

| Persona | What they pay for | Tier |
|--------|--------------------|------|
| Operator (spa/salon/medspa owner) | Market intelligence → menu optimization → revenue growth | $49–149/mo |
| Provider (esthetician/stylist/NP) | Signals + protocols + education + career intelligence | $49/mo |
| Brand (beauty company) | Market share + competitive intelligence + R&D Scout + partner enablement | $149–499/mo |
| Student | Treatment demand signals + job market data + education | Free–$49/mo |

### Pricing (locked)

| Tier | Price | Credits | Intelligence | AI tools | Exports |
|------|-------|---------|-------------|----------|---------|
| Free | $0 | 0 | Top 3 national signals (current week) | Demo only | None |
| Starter | $49 | 500 | Full national + limited local, 30 days | Explain Signal + Search | CSV |
| Pro | $149 | 2,500 | All regions + historical + local | All 6 tools + briefs + plans | CSV + PDF + branded |
| Enterprise | $499 | 10,000 | Unlimited + API + custom feeds | Unlimited + R&D Scout + MoCRA | All + API + webhook |

Credit costs and entitlements follow `SOCELLE_ENTITLEMENTS_PACKAGING.md`.

---

## §B — Canonical Authority (Docs This File Controls)

These docs in `/docs/command/` must align with THIS file. If they conflict, **this file wins**:

- `SOCELLE_CANONICAL_DOCTRINE.md`
- `SOCELLE_ENTITLEMENTS_PACKAGING.md`
- `SOCELLE_DATA_PROVENANCE_POLICY.md`
- `SOCELLE_FIGMA_DESIGN_BRIEF.md`
- `SOCELLE_FIGMA_TO_CODE_HANDOFF.md`
- `SOCELLE_RELEASE_GATES.md`
- `GLOBAL_SITE_MAP.md`
- `SITE_MAP.md`
- `BRAND_SURFACE_INDEX.md`
- `AGENT_SCOPE_REGISTRY.md`
- `AGENT_WORKFLOW_INDEX.md`
- `AGENT_WORKING_FOLDERS.md`
- `MASTER_STATUS.md`
- `SOCELLE_MONOREPO_MAP.md`

**Rule:** If ANY file contradicts this V1 master, V1 is correct and the other file must be updated.

---

## §C — Doc Gate (Every Agent Output Must Pass)

FAIL (any = reject output):

- References external strategy/plan docs as authority (only this file + docs/command/* allowed).
- Creates new planning docs outside `build_tracker.md`.
- Contradicts V1 tech baseline or execution phases in this file.
- Claims something is LIVE without tying to real `updated_at` + source.
- Omits routes vs `GLOBAL_SITE_MAP` / `SITE_MAP`.
- Elevates ecommerce above Intelligence in nav or IA.
- Generates outreach / cold email / “partnership” copy.

PASS (all = accept):

- Cites file paths and diffs.
- Uses LIVE/DEMO labelling on data surfaces.
- References this V1 file or command docs when making decisions.
- Produces proof artifacts (audit JSON, screenshots) and a WO ID from `build_tracker.md`.

---

## §D — Anti‑Shell Rule (No Shells, Ever)

**NO SHELLS.** Any page, hub, or feature that renders UI must be fully functional.

A shell is a surface that:

- Renders only mock/static data when the hub is supposed to be live.
- Has no write path for its primary object (no Create/Edit/Delete).
- Does not enforce permissions or tier gating.
- Lacks proper error, empty, and loading states.
- Has no observability (errors never reach Admin Hub dashboards or logs).

**Every hub must have ALL of these:**

| Requirement | What it means in practice |
|------------|---------------------------|
| Create action | User can create the primary object → a row in DB |
| Library view | Browse all objects with sort/filter/search from Supabase |
| Detail view | Full detail of any object from DB |
| Edit + Delete | Update and archive/remove objects with RLS respected |
| Permissions | RLS + ModuleRoute/TierGuard enforcing roles & tiers |
| Intelligence input | A signal can spawn or update an object in this hub |
| Proof/metrics | Dashboard with real aggregated metrics (and `updated_at`) |
| Export | CSV minimum; PDF for Pro+ |
| Error/empty/loading | Premium states implemented and tested |
| Observability | Errors and slow paths visible in Admin Hub dashboards and logs |

If an agent detects a shell, they HALT and raise a WO to fix it.

---

## §E — Tech Stack (Locked, “Surgical Upgrade” Framing)

### Current reality (from build spec)

- React 18.3 (working, shipping).
- Vite 5.4.
- TypeScript 5.5 (strict mode ON, but some `any` debt).
- Tailwind 3.4.
- React Router DOM.
- Supabase JS 2.57.
- Playwright + Vitest wired but thin coverage.

### Target baseline (must be in place before big feature work)

| Package | Target | Notes |
|---------|--------|-------|
| React | 19.x | Incremental bump from 18.3 |
| Vite | 6.x | Incremental bump from 5.4 |
| TypeScript | 5.5 strict ON | `noExplicitAny = true` |
| TanStack Query | v5 | Standardize all data fetching |
| Router | React Router / TanStack Router | React+Vite primary; no Next.js as main runtime |
| Tailwind | 3.4 | Tailwind 4 deferred until design debt cleared |
| Observability | Admin Hub dashboards + logs | Errors and key events visible in Admin Hub |
| Playwright | E2E smoke | Route crawl, auth, paywall |

### Upgrade effort (realistic, non‑scary)

- React 18.3 → 19.x: ~2 hours  
  - `npm i react@^19 react-dom@^19 @types/react@^19 @types/react-dom@^19`  
  - `npm run build` + sanity checks.

- Vite 5.x → 6.x: ~1 hour  
  - `npm i vite@^6 @vitejs/plugin-react@^5`  
  - `npm run build` and fix any minor config warnings.

- TypeScript strict flip: ~3–5 hours  
  - In `tsconfig.json`: `"strict": true`, `"noExplicitAny": true`.  
  - `npx tsc --noEmit` and fix existing `any` usages with minimal changes.

**TOTAL tech baseline upgrade:** roughly **one working day**, zero rewrites.  
Agents MUST treat these as **surgical, incremental changes on a working app**, not multi‑week migrations.

### Primary runtime choice

- Web **primary** runtime: **React + Vite** (SPA with TanStack/React Router).
- Next.js: **not** the core runtime; only optional for future SEO‑specialized surfaces if needed.
- All planning assumes React+Vite as the app shell used by:
  - Web.
  - Desktop (Tauri wrapper) using the same build.

---

## §F — Design System (Pearl Mineral V2, Tailwind 3 Now)

**Canonical source:** `SOCELLE_CANONICAL_DOCTRINE.md` and Tailwind `theme.extend` tokens.

- Tailwind: stay on **v3.4** for V1. Tailwind 4 migration is **deferred** until:
  - Legacy color systems removed (`pro.*`, `brand.*`, `natura.*`, `intel.*`, `edu.*`).
  - All components use Pearl Mineral V2 tokens only.

Color tokens (must be enforced via lint rules):

| Token | Value | Usage |
|-------|-------|-------|
| background | `#F6F3EF` | Page backgrounds |
| graphite | `#141418` | Primary text |
| accent | `#6E879B` | Interactive, links |
| accent-hover | `#5A7185` | Hover |
| accent-soft | `#E8EDF1` | Soft panels |
| signal-up | `#5F8A72` | Positive |
| signal-warn | `#A97A4C` | Caution |
| signal-down | `#8E6464` | Negative |

Banned:

- `font-serif` on public pages.
- Hardcoded hex outside token system.
- Bootstrap/Material default blue, etc.

Implementation requirement:

- ESLint/plugin rules must block rogue colors and fonts.
- Pearl tokens must be enforced; figma must be updated to match these doctrine values (not the other way around).

---

## §G — Hubs & Intelligence Spine

SOCELLE is a **multi‑hub ecosystem**. Intelligence is the spine.

### Hub list (must all be non‑shell)

- Intelligence (core revenue surface)
- Jobs
- Brands
- Professionals
- Admin
- CRM
- Education
- Marketing
- Sales
- Commerce
- Authoring Studio
- Mobile App
- Desktop App
- Credit Economy
- Affiliate/Wholesale Engine

Each hub must satisfy the anti‑shell rule and have a defined relationship with Intelligence (signals create/update objects).

### Intelligence Hub (the revenue surface)

10 modules (must exist and be wired to real data):

- KPI Strip
- Signal Table
- Trend Stacks
- “What Changed” Timeline
- Opportunity Signals (revenue estimates)
- Confidence + Provenance
- Category Intelligence
- Competitive Benchmarking
- Brand Health Monitor
- Local Market View

7 AI engines and 6 AI tools live here (menuOrchestrator, planOrchestrator, gapAnalysisEngine, etc.), tied to credit usage.

---

## §H — Multi‑Platform Strategy (Build Once, Use Smartly)

Goal: **96%+ reuse of logic and contracts**, without forcing unnatural code sharing.

- Shared across all platforms:
  - Supabase schema, RLS, pg_cron, pgvector.
  - Edge functions (ai‑orchestrator, feed‑orchestrator, rss‑to‑signals, etc.).
  - `intelligence-core` business logic (TS package) used by React front‑ends.
  - Design tokens (Pearl Mineral V2).

- Web:
  - React + Vite app is the **source implementation**.
  - This app is what Tauri wraps.

- Desktop:
  - Tauri shell for Mac + Windows.
  - Wraps the **same React+Vite app**.
  - Adds desktop‑only features later (notifications, file export, auto‑update, secure storage).
  - No re‑implementation of business logic in Rust; only IPC plumbing.

- Mobile:
  - Flutter app.
  - Uses the same Supabase API contracts and edge functions.
  - No attempt to FFI TypeScript logic into Dart.
  - Shares: schemas, entitlement rules, credit system, AI endpoints.

---

## §I — Execution Phases (V1 Timeline, Quality > Time)

Phases are **sequence**, not calendar. Agents must respect order.

1. **PHASE 0 — Design + Required Docs**
   - All hub specs and required docs exist (see §S).
   - No new app code before this.

2. **PHASE 1 — Skills Installation**
   - 51+ skills installed and verified.
   - Skills cover: repo audit, token scanner, copy linter, QA smoke, data/provenance checks, etc.
   - SKILLS FIRST: no audit or upgrade work before the skill verification command passes.

3. **PHASE 2 — Full‑Platform Audit**
   - Run repo, route, data, and mock‑density audits.
   - Produce artifacts: route manifest, apilogic map, livedemo report, tokendrift report, mockdensity report, etc.
   - Command Agent proposes upgrades → owner approves.

4. **PHASE 3 — Tech Upgrades (Baseline)**
   - React 19, Vite 6, TypeScript strict, TanStack Query on all data hooks.
   - Observability: errors and key events visible in Admin Hub dashboards and logs.
   - Redis or equivalent caching for AI.
   - `database.types.ts` regenerated to match all migrations.
   - **Framing:** ~1 day of focused work on a working codebase, no rewrites.

5. **PHASE 4 — Intelligence Cloud Build**
   - Implement the 10 modules + 7 engines + 6 AI tools.
   - Live feed pipeline in place (37+ feeds, APIs).
   - Credit economy and affiliate engine wired.

6. **PHASE 5 — All Hubs Functional**
   - Each hub meets anti‑shell rule.
   - CMS and content surfaces implemented (blog, briefs, education content).
   - Authoring Studio MVP.

7. **PHASE 6 — Multi‑Platform**
   - PWA baseline solid.
   - Tauri desktop wrapper.
   - Flutter mobile wired to same APIs.

8. **PHASE 7 — Launch**
   - All launch non‑negotiables passed (see §K).
   - Launch comms executed (site, email, social).

---

## §J — Launch Non‑Negotiables (Must Pass All)

Before first paying subscriber:

- `npx tsc --noEmit` → Exit 0.
- `npm run build` → Exit 0.
- `/` routes to Intelligence home (not prelaunch quiz or a shell).
- Errors and key events visible in Admin Hub dashboards and logs.
- TanStack Query used for all data fetching (no raw `useEffect` + fetch for server data).
- PAYMENT_BYPASS = false in production.
- 0 `font-serif` on public pages.
- 0 banned terms on public pages (per doctrine).
- Stripe webhooks work (subscription state changes in DB).
- Signals fresh: `market_signals` has ≥5 rows with `fetched_at` < 24h.
- AI briefs: 10 test briefs with 0 hallucinations and correct citations.
- SEO baseline: all public routes with titles/meta/OG; `sitemap.xml` live.
- `database.types.ts` matches migrations.
- Credits deduct correctly on every AI action.
- Affiliate links show proper FTC badges and tracked redirects.
- Playwright smoke tests (routes + auth + paywall) pass.

---

## §K — Required Docs (Gate Before Major Work)

These must exist before stepping into the corresponding phases:

Program‑wide (governance):

- `AGENT_OPERATING_MANUAL.md`
- `SOCELLE_CANONICAL_DOCTRINE.md`
- `SOCELLE_ENTITLEMENTS_PACKAGING.md`
- `SOCELLE_DATA_PROVENANCE_POLICY.md`
- `SOCELLE_FIGMA_DESIGN_BRIEF.md`
- `SOCELLE_FIGMA_TO_CODE_HANDOFF.md`
- `SOCELLE_RELEASE_GATES.md`
- `SECURITY_BASELINE.md`
- `QA_TEST_STRATEGY.md`
- `AI_SAFETY_LEGAL_FRAMEWORK.md`
- `BRAND_VOICE_GUIDELINES.md`
- `MASTER_PROMPTING_GUIDELINE.md`
- `COPY_SYSTEM.md`
- `DATA_MODEL_GLOSSARY.md`
- `RISK_REGISTER.md`
- `INCIDENT_ROLLBACK_PLAYBOOK.md`
- `ADMIN_CONTROL_CENTER_SPEC.md`
- `LAUNCH_COMMS_PLAYBOOK.md`

Per hub:

- One **Hub Spec** each for:
  - Intelligence, Jobs, Brands, Professionals, Admin, CRM, Education, Marketing, Sales, Commerce, Authoring Studio, Mobile, Desktop, Credit Economy, Affiliate Engine.

Rule:

- If a required doc for a phase is missing, agents HALT implementation and file a WO in `build_tracker.md` to create it.

---

## §L — Agent Roster (Roles, Not People)

Key roles:

- Command Agent — sequencing, governance, gates.
- Intelligence Architect — Intelligence Hub, AI tools, feed pipeline.
- Platform Engineer — build system, tech upgrades, CI, observability.
- Design Guardian — design tokens, figma→code, responsiveness.
- Security Agent — RLS, secrets, AI guardrails, legal, FTC.
- QA Agent — tests, smoke, visual regression, LIVE/DEMO enforcement.
- Copy Agent — voice, banned terms, paywall/onboarding/empties, launch comms.
- Monetization Agent — entitlements, credits, pricing, onboarding.
- Data Architect — schema, types, MVs, first‑party events.
- CRM/Education/Marketing/Sales/Ecommerce/Authoring/Multi‑Platform Agents — each own their hub.

Each hub has exactly one primary owner. No orphan hubs.

---

## §M — Ecommerce Boundary (Non‑Negotiable)

Commerce is a **module**, never the IA backbone:

- No “Shop” as primary nav item.
- No “Shop Now” / “Buy Now” as the main CTA on Intelligence pages.
- All commerce routes gated (auth + tier).
- Intelligence pages lead with signals and value, then (optionally) actions that may include commerce.

Affiliate engine:

- Must display FTC‑compliant “Commission‑linked” badges on any monetized recommendation.

---

## §N — Live vs Demo Truth

Every data surface must declare its truth level:

- LIVE: backed by DB with verifiable `updated_at` + provenance.
- DEMO: clearly labeled DEMO to the user.
- MOCK (unlabeled) is forbidden in any user‑facing surface.

All hooks must follow the `isLive` pattern and route components must label surfaces correctly.

---

## §O — AI Safety (Beauty + Medspa Context)

- Guardrails between LLM and user.
- Always show “Generated by AI” and an expandable “Evidence & Logic” panel with sources.
- Hard block: dosing, diagnoses, prescriptions.
- Provider override for higher‑risk suggestions: NPI → scope_of_practice → rationale logged.
- Maintain logs suitable for insurance/legal review.

---

## §P — Acquisition Boundary (No Outreach)

- Acquisition is driven by on‑platform flows (public pages → request access → app).
- `send-email` is transactional only (auth, receipts, briefs, etc.).
- No cold email, DM sequences, or pseudo‑outreach content.

---

## §Q — Competitive Position (Anchors)

- Spate, Trendalytics, Revieve, Zenoti, Meevo, Canva are the comparison set.
- SOCELLE differentiates by:
  - Licensed pros focus.
  - Intelligence → action plans → revenue, not just charts.
  - Integrated AI Service Menu.
  - Medical‑adjacent compliance baked in.

---

## §R — Deferred Tech (Must Not Be Implemented Early)

High‑cost or optional tech (Perfect Corp, Haut.AI, Sora, Typesense, etc.) is listed as **deferred**.  
Agents MUST NOT implement them until revenue/scale triggers (documented elsewhere) are met.

---

## §S — Stop Conditions

Agents must HALT and escalate if:

- A shell is about to be shipped.
- Secrets are found in code.
- PAYMENT_BYPASS or similar flags are true in prod.
- Banned terms appear in public copy.
- Build or tests fail.

---

*Quality and revenue outrank time. Nothing ships average. Intelligence platform first. Always.*