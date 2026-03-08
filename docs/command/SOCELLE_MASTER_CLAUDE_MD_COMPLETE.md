> NOTE: This file is aligned to `V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md`. If this file conflicts with V1, the V1 file wins.

# SOCELLE MASTER CLAUDE MD — COMPLETE REFERENCE

**Last Updated:** March 8, 2026 (V1 alignment pass)
**Purpose:** Comprehensive master reference that expands on V1 for agents who need more detail. V1 is the authority; this document provides operational depth.
**V1 Master:** `docs/command/V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md`

---

## 1. PLATFORM IDENTITY

SOCELLE is a B2B intelligence platform for the professional beauty and medspa industry.

- **Intelligence platform FIRST. Marketplace second. Always.**
- One-liner: "Spate tracks consumers. SOCELLE tracks Licensed Pros."
- Value flow: Intelligence -> Trust -> Transaction -> Retention (non-negotiable order).
- Revenue model: Tri-sided -- SaaS subscriptions + wholesale affiliate commission + AI add-ons + B2B ad-tech.
- Target: $158,500/mo at 1,000 subscribers (~96% margin).

---

## 2. PERSONAS & PRICING (LOCKED)

### Personas

| Persona | What they pay for | Tier |
|---|---|---|
| Operator (spa/salon/medspa owner) | Market intelligence -> menu optimization -> revenue growth | $49-149/mo |
| Provider (esthetician/stylist/NP) | Signals + protocols + education + career intelligence | $49/mo |
| Brand (beauty company) | Market share + competitive intelligence + R&D Scout + partner enablement | $149-499/mo |
| Student | Treatment demand signals + job market data + education | Free-$49/mo |

### Pricing Tiers (locked)

| Tier | Price | Credits | Intelligence | AI tools | Exports |
|---|---|---|---|---|---|
| Free | $0 | 0 | Top 3 national signals (current week) | Demo only | None |
| Starter | $49 | 500 | Full national + limited local, 30 days | Explain Signal + Search | CSV |
| Pro | $149 | 2,500 | All regions + historical + local | All 6 tools + briefs + plans | CSV + PDF + branded |
| Enterprise | $499 | 10,000 | Unlimited + API + custom feeds | Unlimited + R&D Scout + MoCRA | All + API + webhook |

Credit costs and entitlements follow `SOCELLE_ENTITLEMENTS_PACKAGING.md`.

---

## 3. TECH STACK -- SURGICAL UPGRADE FRAMING

### Current Reality (working, shipping)

| Package | Current | Status |
|---|---|---|
| React | 18.3 | Working, shipping |
| Vite | 5.4 | Working, shipping |
| TypeScript | 5.5 | strict mode ON, some `any` debt |
| Tailwind | 3.4 | Custom tokens in `tailwind.config.js` |
| React Router | DOM v7 | SPA routing |
| Supabase JS | 2.57 | Auth + DB + Edge Functions |
| Playwright + Vitest | Wired | Thin coverage |

### Target Baseline (before big feature work)

| Package | Target | Notes |
|---|---|---|
| React | 19.x | Incremental bump from 18.3 |
| Vite | 6.x | Incremental bump from 5.4 |
| TypeScript | 5.5 strict ON | `noExplicitAny = true` |
| TanStack Query | v5 | Standardize all data fetching |
| Router | React Router / TanStack Router | React+Vite primary; NO Next.js as main runtime |
| Tailwind | 3.4 | Tailwind 4 deferred until design debt cleared |
| Sentry | Web + edge | Errors + performance |
| Playwright | E2E smoke | Route crawl, auth, paywall |

### Upgrade Effort (realistic, non-scary)

| Upgrade | Time | How |
|---|---|---|
| React 18.3 -> 19.x | ~2 hours | `npm i react@^19 react-dom@^19 @types/react@^19 @types/react-dom@^19` + `npm run build` + sanity checks |
| Vite 5.x -> 6.x | ~1 hour | `npm i vite@^6 @vitejs/plugin-react@^5` + `npm run build` + fix warnings |
| TypeScript strict flip | ~3-5 hours | `"strict": true`, `"noExplicitAny": true` in tsconfig + `npx tsc --noEmit` + fix `any` usages |

**TOTAL tech baseline upgrade: roughly one working day, zero rewrites.**

Agents MUST treat these as **surgical, incremental changes on a working app**, not multi-week migrations.

### Primary Runtime Choice

- Web **primary** runtime: **React + Vite** (SPA with TanStack/React Router).
- Next.js: **NOT** the core runtime. Only optional for future SEO-specialized surfaces if needed.
- All planning assumes React+Vite as the app shell.

### Tailwind Strategy

- Stay on **Tailwind 3.4** for V1.
- Tailwind 4 migration is **deferred** until:
  - Legacy color systems removed (`pro.*`, `brand.*`, `natura.*`, `intel.*`, `edu.*`).
  - All components use Pearl Mineral V2 tokens only.

---

## 4. DESIGN SYSTEM -- PEARL MINERAL V2

Canonical source: `SOCELLE_CANONICAL_DOCTRINE.md` and Tailwind `theme.extend` tokens.

### Color Tokens (enforced via lint rules)

| Token | Value | Usage |
|---|---|---|
| background | `#F6F3EF` | Page backgrounds |
| graphite | `#141418` | Primary text |
| accent | `#6E879B` | Interactive, links |
| accent-hover | `#5A7185` | Hover |
| accent-soft | `#E8EDF1` | Soft panels |
| signal-up | `#5F8A72` | Positive |
| signal-warn | `#A97A4C` | Caution |
| signal-down | `#8E6464` | Negative |

### Banned

- `font-serif` on public pages.
- Hardcoded hex outside token system.
- Bootstrap/Material default blue.
- `pro-*` tokens in `src/pages/public/`.

### Font

- General Sans (Fontshare CDN) -- primary.
- SCL namespace (`--scl-font-*`) approved for `.scl-*` classes only (Cormorant Garamond/DM Sans/DM Mono).

---

## 5. HUBS & INTELLIGENCE SPINE

SOCELLE is a **multi-hub ecosystem**. Intelligence is the spine. Every hub must satisfy the anti-shell rule.

### Hub List (15 hubs, all must be non-shell)

| Hub | Primary Owner | Relationship to Intelligence |
|---|---|---|
| Intelligence | Intelligence Architect | Core revenue surface -- 10 modules, 7 engines, 6 AI tools |
| Jobs | CRM Agent | Signals feed job demand forecasts |
| Brands | Commerce Agent | Intelligence drives brand discovery and benchmarking |
| Professionals | Platform Engineer | Provider signals and career intelligence |
| Admin | Platform Engineer | System-wide monitoring, user management |
| CRM | CRM Agent | Intelligence-driven relationship management |
| Education | Education Agent | Signals inform curriculum and protocol relevance |
| Marketing | Marketing Agent | Intelligence-first campaign targeting |
| Sales | Sales Agent | Signal-backed pipeline and outreach prioritization |
| Commerce | Commerce Agent | Transaction module beneath intelligence layer |
| Authoring Studio | Copy Agent | Content creation powered by intelligence context |
| Mobile App | Mobile Agent | Flutter app with shared API contracts |
| Desktop App | Multi-Platform Agent | Tauri wrapper of React+Vite build |
| Credit Economy | Monetization Agent | Credit deduction on AI actions, tier gating |
| Affiliate/Wholesale Engine | Monetization Agent | FTC-compliant tracked redirects, commission badges |

### Anti-Shell Rule (NO SHELLS, EVER)

A shell is a surface that:
- Renders only mock/static data when it should be live.
- Has no write path (no Create/Edit/Delete).
- Does not enforce permissions or tier gating.
- Lacks proper error, empty, and loading states.
- Has no observability (errors never reach Sentry/logs).

**Every hub must have ALL of these:**

| Requirement | What it means |
|---|---|
| Create action | User can create the primary object -> row in DB |
| Library view | Browse all objects with sort/filter/search from Supabase |
| Detail view | Full detail of any object from DB |
| Edit + Delete | Update and archive/remove with RLS respected |
| Permissions | RLS + ModuleRoute/TierGuard enforcing roles & tiers |
| Intelligence input | A signal can spawn or update an object in this hub |
| Proof/metrics | Dashboard with real aggregated metrics (and `updated_at`) |
| Export | CSV minimum; PDF for Pro+ |
| Error/empty/loading | Premium states implemented and tested |
| Observability | Errors and slow paths visible in Sentry / logs |

If an agent detects a shell, they **HALT** and raise a WO in `build_tracker.md` to fix it.

### Intelligence Hub Modules (10)

1. KPI Strip
2. Signal Table
3. Trend Stacks
4. "What Changed" Timeline
5. Opportunity Signals (revenue estimates)
6. Confidence + Provenance
7. Category Intelligence
8. Competitive Benchmarking
9. Brand Health Monitor
10. Local Market View

7 AI engines and 6 AI tools live here (menuOrchestrator, planOrchestrator, gapAnalysisEngine, etc.), tied to credit usage.

---

## 6. MULTI-PLATFORM STRATEGY

Goal: **96%+ reuse of logic and contracts**, without forcing unnatural code sharing.

### Shared Across All Platforms

- Supabase schema, RLS, pg_cron, pgvector.
- Edge functions (ai-orchestrator, feed-orchestrator, rss-to-signals, etc.).
- `intelligence-core` business logic (TS package) used by React front-ends.
- Design tokens (Pearl Mineral V2).

### Web

- React + Vite app is the **source implementation**.
- Deployed to Cloudflare.
- This app is what Tauri wraps.

### Desktop

- Tauri shell for Mac + Windows.
- Wraps the **same React+Vite app**.
- Adds desktop-only features later (notifications, file export, auto-update, secure storage).
- No re-implementation of business logic in Rust; only IPC plumbing.

### Mobile

- Flutter app.
- Uses the same Supabase API contracts and edge functions.
- No attempt to FFI TypeScript logic into Dart.
- Shares: schemas, entitlement rules, credit system, AI endpoints.

---

## 7. EXECUTION PHASES (V1 Timeline, Quality > Time)

Phases are **sequence**, not calendar. Agents must respect order.

### Phase 0 -- Design + Required Docs

All hub specs and required docs exist. No new app code before this.

**Required docs (gate before major work):**

Program-wide governance:
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

Per hub: One Hub Spec each for all 15 hubs.

Rule: If a required doc for a phase is missing, agents HALT implementation and file a WO in `build_tracker.md` to create it.

### Phase 1 -- Skills Installation

51+ skills installed and verified. Skills cover: repo audit, token scanner, copy linter, QA smoke, data/provenance checks. **SKILLS FIRST:** no audit or upgrade work before skill verification passes.

### Phase 2 -- Full-Platform Audit

Run repo, route, data, and mock-density audits. Produce artifacts: route manifest, apilogic map, livedemo report, tokendrift report, mockdensity report. Command Agent proposes upgrades -> owner approves.

### Phase 3 -- Tech Upgrades (Baseline)

- React 19, Vite 6, TypeScript strict.
- TanStack Query on all data hooks.
- Sentry wired (web + edge).
- Redis or equivalent caching for AI.
- `database.types.ts` regenerated to match all migrations.
- **Framing:** ~1 day of focused work on a working codebase, no rewrites.

### Phase 4 -- Intelligence Cloud Build

- Implement the 10 modules + 7 engines + 6 AI tools.
- Live feed pipeline in place (37+ feeds, APIs).
- Credit economy and affiliate engine wired.

### Phase 5 -- All Hubs Functional

- Each hub meets anti-shell rule.
- **CMS and content surfaces implemented** (blog, stories/briefs, launch comms, SEO content, education content, in-app help).
- Authoring Studio MVP.
- CMS is the backbone for: blog, stories/briefs, launch comms, SEO content, education content, and in-app help.
- CMS tables + routes + admin screens built early in this phase, in parallel with Marketing Hub and Education Hub.

### Phase 6 -- Multi-Platform

- PWA baseline solid.
- Tauri desktop wrapper.
- Flutter mobile wired to same APIs.

### Phase 7 -- Launch

All launch non-negotiables passed (see next section).

---

## 8. LAUNCH NON-NEGOTIABLES

Before first paying subscriber, ALL must pass:

- [ ] `npx tsc --noEmit` -> Exit 0.
- [ ] `npm run build` -> Exit 0.
- [ ] `/` routes to Intelligence home (not prelaunch quiz or a shell).
- [ ] Sentry active (web + edge).
- [ ] TanStack Query used for all data fetching (no raw `useEffect` + fetch for server data).
- [ ] PAYMENT_BYPASS = false in production.
- [ ] 0 `font-serif` on public pages.
- [ ] 0 banned terms on public pages (per doctrine).
- [ ] Stripe webhooks work (subscription state changes in DB).
- [ ] Signals fresh: `market_signals` has >=5 rows with `fetched_at` < 24h.
- [ ] AI briefs: 10 test briefs with 0 hallucinations and correct citations.
- [ ] SEO baseline: all public routes with titles/meta/OG; `sitemap.xml` live.
- [ ] `database.types.ts` matches migrations.
- [ ] Credits deduct correctly on every AI action.
- [ ] Affiliate links show proper FTC badges and tracked redirects.
- [ ] Playwright smoke tests (routes + auth + paywall) pass.

---

## 9. AGENT ROSTER

| Role | Responsibility | Owns |
|---|---|---|
| Command Agent | Sequencing, governance, gates | All docs, phase gates |
| Intelligence Architect | Intelligence Hub, AI tools, feed pipeline | Intelligence Hub |
| Platform Engineer | Build system, tech upgrades, CI, observability | Professionals Hub, Admin Hub |
| Design Guardian | Design tokens, figma->code, responsiveness | Design system enforcement |
| Security Agent | RLS, secrets, AI guardrails, legal, FTC | Security across all hubs |
| QA Agent | Tests, smoke, visual regression, LIVE/DEMO enforcement | Quality across all hubs |
| Copy Agent | Voice, banned terms, paywall/onboarding/empties, launch comms | Authoring Studio |
| Monetization Agent | Entitlements, credits, pricing, onboarding | Credit Economy, Affiliate Engine |
| Data Architect | Schema, types, MVs, first-party events | Data model across all hubs |
| CRM Agent | CRM + Jobs hubs | CRM Hub, Jobs Hub |
| Education Agent | Education hub | Education Hub |
| Marketing Agent | Marketing hub | Marketing Hub |
| Sales Agent | Sales hub | Sales Hub |
| Commerce Agent | Commerce + Brands hubs | Commerce Hub, Brands Hub |
| Mobile Agent | Flutter mobile app | Mobile App Hub |
| Multi-Platform Agent | Tauri desktop, cross-platform coordination | Desktop App Hub |

Each hub has exactly one primary owner. No orphan hubs.

---

## 10. DOC GATE

Every agent output must pass. See V1 §C for FAIL/PASS conditions.

**FAIL (any = reject):**
- References external strategy/plan docs as authority.
- Creates new planning docs outside `build_tracker.md`.
- Contradicts V1 tech baseline or execution phases.
- Claims something is LIVE without tying to real `updated_at` + source.
- Omits routes vs `GLOBAL_SITE_MAP` / `SITE_MAP`.
- Elevates ecommerce above Intelligence in nav or IA.
- Generates outreach / cold email / "partnership" copy.

**PASS (all = accept):**
- Cites file paths and diffs.
- Uses LIVE/DEMO labelling on data surfaces.
- References V1 or command docs when making decisions.
- Produces proof artifacts and a WO ID from `build_tracker.md`.

---

## 11. ECOMMERCE BOUNDARY

Commerce is a **module**, never the IA backbone:
- No "Shop" as primary nav item.
- No "Shop Now" / "Buy Now" as the main CTA on Intelligence pages.
- All commerce routes gated (auth + tier).
- Intelligence pages lead with signals and value, then (optionally) actions that may include commerce.

Affiliate engine must display FTC-compliant "Commission-linked" badges on any monetized recommendation.

---

## 12. LIVE VS DEMO TRUTH

Every data surface must declare its truth level:
- **LIVE:** backed by DB with verifiable `updated_at` + provenance.
- **DEMO:** clearly labeled DEMO to the user.
- **MOCK (unlabeled):** forbidden in any user-facing surface.

All hooks must follow the `isLive` pattern and route components must label surfaces correctly.

---

## 13. AI SAFETY (BEAUTY + MEDSPA CONTEXT)

- Guardrails between LLM and user.
- Always show "Generated by AI" and expandable "Evidence & Logic" panel with sources.
- Hard block: dosing, diagnoses, prescriptions.
- Provider override for higher-risk suggestions: NPI -> scope_of_practice -> rationale logged.
- Maintain logs suitable for insurance/legal review.

---

## 14. ACQUISITION BOUNDARY

- Acquisition is driven by on-platform flows (public pages -> request access -> app).
- `send-email` is transactional only (auth, receipts, briefs, etc.).
- No cold email, DM sequences, or pseudo-outreach content.

---

## 15. COMPETITIVE POSITION

- Comparison set: Spate, Trendalytics, Revieve, Zenoti, Meevo, Canva.
- SOCELLE differentiates by:
  - Licensed pros focus.
  - Intelligence -> action plans -> revenue, not just charts.
  - Integrated AI Service Menu.
  - Medical-adjacent compliance baked in.

---

## 16. DEFERRED TECH

High-cost or optional tech (Perfect Corp, Haut.AI, Sora, Typesense, etc.) is listed as **deferred**. Agents MUST NOT implement them until revenue/scale triggers are met.

---

## 17. STOP CONDITIONS

Agents must HALT and escalate if:
- A shell is about to be shipped.
- Secrets are found in code.
- PAYMENT_BYPASS or similar flags are true in prod.
- Banned terms appear in public copy.
- Build or tests fail.

---

## 18. AUTHORITY CHAIN

1. `V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` (ultimate authority)
2. `/.claude/CLAUDE.md` (root governance)
3. `/docs/command/*` (canonical command docs)
4. `SOCELLE-WEB/docs/build_tracker.md` (execution authority for WOs)
5. App-level `CLAUDE.md` files (operational context only)

If any file contradicts V1, V1 wins. Update the contradicting file, not V1.

---

*SOCELLE Master Claude MD Complete v1.0 -- March 8, 2026 -- Aligned to V1 Master -- Command Center Authority*

*Quality and revenue outrank time. Nothing ships average. Intelligence platform first. Always.*
