# SOCELLE V3 — ONE SOURCE OF TRUTH
# Internal CMS-First Build, Intelligence Spine

Last updated: March 8, 2026
Applies to: All agents, all hubs, all platforms

SOCELLE is a B2B intelligence platform for the professional beauty and medspa industry.
Intelligence platform FIRST. Everything else (commerce, CRM, education, CMS, authoring) is built on top of the intelligence spine.

One-liner
Spate tracks consumers. SOCELLE tracks Licensed Pros.

Value flow (non-negotiable order)
Intelligence → Trust → Transaction → Retention

Revenue model
Tri-sided: SaaS subscriptions, wholesale/affiliate commission, AI add-ons, B2B ad-tech.

Target
158,500 MRR at 1,000 subscribers, ~96% gross margin.

---

## A. Personas & Pricing (Locked)

Personas

- Operator (spa / salon / medspa owner)
  - Pays for: market intelligence, menu optimization, revenue growth.
- Provider (esthetician / stylist / NP)
  - Pays for: signals, protocols, education, career intelligence.
- Brand (beauty company)
  - Pays for: market share, competitive intelligence, R&D scout, partner enablement.
- Student
  - Pays for: treatment-demand signals, job market data, education.

Tiers (locked)

- Free:
  - Price: 0
  - Credits: 0
  - Intelligence: Top 3 national signals (current week), demo only.
  - AI tools: None.
  - Exports: None.

- Starter:
  - Price: 49
  - Credits: 500
  - Intelligence: Full national, limited local, 30 days.
  - AI tools: Explain Signal, Search.
  - Exports: CSV.

- Pro:
  - Price: 149
  - Credits: 2,500
  - Intelligence: All regions, historical + local depth.
  - AI tools: All 6 tools (briefs, plans, synth, etc.).
  - Exports: CSV, PDF (branded).

- Enterprise:
  - Price: 499
  - Credits: 10,000
  - Intelligence: Unlimited, API, custom feeds, RD Scout, MoCRA.
  - AI tools: All, with custom workflows.
  - Exports: All formats, webhooks.

All credit behavior and entitlements must match `SOCELLE_ENTITLEMENTS_PACKAGING.md`.

---

## B. Canonical Authority

This file controls:

- Tech baseline and execution phases.
- Hub list, Intelligence-first information architecture.
- Internal SOCELLE CMS and CMS Hub.
- Multi-platform strategy (web, desktop, mobile).
- Anti-shell rule and hub completeness.
- Live vs demo truth, AI safety, acquisition boundaries.

If ANY other document contradicts this file, THIS file wins and the other document must be updated.

Command-docs that MUST align with this file:

- SOCELLE_CANONICAL_DOCTRINE.md
- SOCELLE_ENTITLEMENTS_PACKAGING.md
- SOCELLE_DATA_PROVENANCE_POLICY.md
- SOCELLE_FIGMA_DESIGN_BRIEF.md
- SOCELLE_FIGMA_TO_CODE_HANDOFF.md
- SOCELLE_RELEASE_GATES.md
- GLOBAL_SITE_MAP.md
- SITEMAP.md
- BRAND_SURFACE_INDEX.md
- AGENT_SCOPE_REGISTRY.md
- AGENT_WORKFLOW_INDEX.md
- AGENT_WORKING_FOLDERS.md
- MASTER_STATUS.md
- SOCELLE_MONOREPO_MAP.md
- HARD_CODED_SURFACES.md
- MODULE_BOUNDARIES.md
- PORT_BASELINE_MANIFEST.md
- MONOREPO_PORT_VERIFICATION.md

Rule
If ANY file contradicts this V3 master, V3 is correct and the other file must be updated.

---

## C. Doc Gate & Anti-Shell Rule

Doc Gate (PASS = required, FAIL = halt)

FAIL if:

- Referencing external strategy docs as authority (only this file + docs/command are allowed).
- Creating new planning docs outside `build_tracker.md`.
- Contradicting V3 tech baseline or execution phases.
- Claiming something is LIVE without tying to real `updated_at` and provenance.
- Omitting required routes vs `GLOBAL_SITE_MAP`.
- Elevating ecommerce above Intelligence in nav or IA.
- Generating outreach (cold email, DMs, partnership pitches).

PASS only if:

- Cites file paths and diff summaries.
- Uses LIVE/DEMO labels on data surfaces.
- References this V3 file or command docs when making decisions.
- Produces proof artifacts (JSON, screenshots) and references a WO ID from `build_tracker.md`.

Anti-Shell Rule

NO SHELLS. Any page, hub, or feature that renders UI must be fully functional.

A SHELL is a surface that:

- Renders only mock / static data where hub is supposed to be live.
- Has no write path for its primary object (no Create/Edit/Delete where appropriate).
- Does not enforce permissions or tier gating.
- Lacks proper error, empty, and loading states.
- Has no observability (errors never reach Admin Hub dashboards or logs).

Each functional hub MUST have:

- Create: user can create the primary object (DB row).
- Library: user can browse objects (sort/filter/search via Supabase + TanStack).
- Detail: full details from DB with correct RLS.
- Edit/Delete/Archive: update and removal respecting RLS.
- Permissions: module-level route guards + RLS.
- Intelligence input: a signal can spawn or update an object in this hub.
- Metrics: at least one dashboard with real aggregated metrics and recent `updated_at`.
- Export: CSV minimum; PDF for Pro where it makes sense.
- Error/Empty/Loading: premium, designed states.
- Observability: errors and key events visible in Admin Hub dashboards and logs.

If an agent detects a shell, they HALT and create a WO to fix it.

---

## D. Tech Baseline (V3)

Current reality (from build spec):

- React 19.x (upgraded)
- Vite 6.x (upgraded)
- TypeScript 5.5 (strict ON, `any` debt remains)
- Tailwind 3.4
- React Router DOM
- Supabase JS 2.57
- TanStack Query v5 (migrated)
- Playwright & Vitest wired (expanding coverage)

Target baseline (already mostly met):

- React 19.x (DONE).
- Vite 6.x (DONE).
- TypeScript strict ON, `noExplicitAny` cleanup tracked as debt.
- TanStack Query v5 for all server data hooks (DONE).
- `database.types.ts` regenerated whenever new tables are added (e.g., cms_*).
- No big rewrites; all upgrades are **surgical** on a working app.

React Vite SPA is the primary runtime.
Next.js is NOT the core runtime (only optional for future SEO micro-surfaces).

Observability model:
- Errors and key events must be visible in Admin Hub dashboards and logs.
- CMS Hub must show publishing history and route health for CMS-backed pages.
- Edge function errors logged to console and surfaced via Admin Hub system health.

---

## E. Hubs & Internal CMS

SOCELLE is a multi-hub ecosystem. Intelligence is the spine. CMS supports all hubs.

Hubs:

- Intelligence (core revenue surface)
- Jobs
- CRM
- Education
- Marketing
- Sales
- Commerce
- Admin
- Brand / Operator portals
- **CMS Hub (SOCELLE CMS)**
- Authoring Studio
- Mobile App (Flutter)
- Desktop App (Tauri)
- Credit Economy
- Affiliate / Wholesale Engine

SOCELLE CMS (Internal, multi-tenant)

Backbone tables:

- `cms_spaces`
- `cms_pages`
- `cms_blocks`
- `cms_page_blocks`
- `cms_posts`
- `cms_assets`
- `cms_docs`
- `cms_templates`

CMS Requirements:

- Add-only migrations; full RLS keyed by `tenant_id`.
- Typed access via `database.types.ts` + TanStack hooks.
- **CMS Hub**: admin UI for Pages, Blocks, Posts, Assets, Docs, Templates, with full CRUD and previews.
- All public/brand marketing surfaces eventually backed by `cms_*` instead of hard-coded content.

Authoring Studio

- Built on top of CMS (`cms_docs` + `cms_templates`).
- Block-based canvas per Figma specs.
- Can create, edit, version, and export intelligence-bound assets (protocol one-pagers, CE posters, decks, etc.).
- At least one cross-hub flow: Authoring → Marketing/Education/Brand surfaces.

Every hub must state how it consumes:

- Signals (intelligence).
- CMS content (`cms_*`).
- Authoring docs/templates where relevant.

---

## F. Live vs Demo Truth

Every data surface must declare its truth level:

- LIVE
  - Backed by real DB data with verifiable `updated_at` and provenance.
- DEMO
  - Clearly labeled DEMO to the user. Data may be static or synthetic.
- MOCK (unlabeled)
  - Forbidden on any user-facing surface.

Hooks and components:

- Must follow `isLive` / `sourceType` patterns.
- Route components must label surfaces correctly (LIVE / DEMO badges).
- Never show "real-time" visual cues (pulsing dots, skeleton loops) on static DEMO data.

---

## G. AI Safety & Acquisition

AI Safety (beauty / medspa context)

- Guardrails layer between LLM and user on ALL endpoints.
- Every AI output clearly labeled "Generated by AI" with an expandable Evidence panel showing sources.
- Hard block:
  - No dosing.
  - No diagnoses.
  - No prescriptions.
- Provider override flows for higher-risk suggestions (logs: NPI, scope-of-practice, rationale).
- Logs must be exportable for insurance/legal review.

Acquisition Boundary (No Outreach)

- Public acquisition flows: request access, marketing site CTAs only.
- `send-email` is transactional only (auth, receipts, briefs, etc.).
- No cold email, DM scripts, outreach sequences, or pseudo-"outbound" content.

---

## H. Execution Phases (V3, CMS-First)

Phases are sequence, not calendar. Respect this order.

1. Phase 0 — Design & Governance
   - V3_BUILD_PLAN.md, CMS_ARCHITECTURE.md, CMS_CONTENT_MODEL.md, JOURNEY_STANDARDS.md exist and are owner-approved.
   - No new application code before this.

2. Phase 1 — Tech Baseline Confirmed
   - React 19 / Vite 6 / TS strict / TanStack v5 / `database.types.ts` synced.
   - These are confirmation tasks; do not reopen them unless V3 requires it (e.g., new cms_* tables).

3. Phase 2 — SOCELLE CMS Foundation
   - Implement `cms_*` schema + RLS + types.
   - Implement CMS client + hooks (TanStack).
   - Build CMS Hub (pages, blocks, posts, assets, docs, templates). No shells.

4. Phase 3 — Public & Brand CMS Surfaces
   - Implement PageRenderer.
   - Migrate key public/brand pages (Home, plans, personas, stories) to CMS-driven layouts.
   - Remove or mark DEFERRED hard-coded surfaces from HARD_CODED_SURFACES.md.

5. Phase 4 — Intelligence Cloud Build
   - Implement 10 Intelligence modules, 7 engines, 6 AI tools, all wired to live signals.
   - At least one complete journey from Intelligence into CRM/Marketing/Sales/Education/Commerce.

6. Phase 5 — Hubs Functional (No Shells)
   - Each hub (Intelligence, Jobs, CRM, Education, Marketing, Sales, Commerce, Admin, CMS, Authoring) has at least one complete, tested journey per JOURNEY_STANDARDS.md.
   - CMS powers content everywhere.
   - Authoring Studio MVP live and wired to CMS.

7. Phase 6 — Multi-Platform
   - PWA baseline ready.
   - Tauri desktop shell wrapping the same React/Vite app.
   - Flutter mobile consuming same Supabase APIs.

8. Phase 7 — Launch
   - All launch non-negotiables pass.
   - Launch comms executed via CMS/Authoring.

---

## I. Launch Non-Negotiables

Before first paying subscriber:

- `npx tsc --noEmit` → 0 errors.
- `npm run build` → success.
- Default route points to Intelligence home (not prelaunch quiz, not a shell).
- LIVE/DEMO labels on all data surfaces.
- 0 `font-serif` usage on public pages.
- 0 banned terms on public pages.
- Stripe webhooks working; subscription state changes persist.
- `market_signals` has fresh rows (<24h).
- AI briefs pass 10 canned tests without obvious hallucinations; citations valid.
- `database.types.ts` matches schema (including cms_*).
- Credits deduct correctly on AI actions.
- Playwright smoke + at least one E2E per hub pass.
- hub-shell-detector = 0 for all non-DEFERRED hubs and routes.
- Errors and key events visible in Admin Hub dashboards and logs.

---

## J. Agent Roster & Rule of 3

Key roles:

- Command Agent — sequencing, governance, gates.
- Intelligence Architect — Intelligence Hub, signals, engines, AI tools.
- Platform Engineer — build, CI, observability.
- Design Guardian — Pearl Mineral V2, layout, responsive.
- Security Agent — RLS, secrets, AI guardrails, legal.
- QA Agent — tests, LIVE/DEMO, visual regression.
- Copy Agent — voice, banned terms, paywalls/onboarding/empties.
- Monetization Agent — entitlements, pricing, credits.
- Data Architect — schema, types, MVs, events.
- CRM/Education/Marketing/Sales/Commerce/Authoring/Multiplatform Agents — each own a hub.
- CMS Agent — owns SOCELLE CMS and CMS Hub.

Rule of 3
Max 3 agents active per phase. Others queued.

Every hub has exactly one primary owner. No orphan hubs.

---

## K. Ecommerce Boundary

Commerce is a module, never the platform premise.

- No "Shop" as primary nav item.
- No "Shop Now / Buy Now" as primary CTA on Intelligence pages.
- All commerce flows behind ProtectedRoute and tier gates.
- Intelligence pages always lead with signal value first; commerce is a follow-on action.

Affiliate engine must:

- Show FTC-compliant commission badges on monetized recommendations.

---

## L. Stop Conditions

Agents MUST HALT and escalate if:

- A shell is about to be shipped.
- Secrets are found in code.
- PAYMENT_BYPASS (or similar) is true in prod.
- Banned terms appear in public copy.
- Build or tests fail.
- A change conflicts with this V3 master.

Quality and revenue outrank time.
Nothing ships average.
Intelligence platform first. Always.
