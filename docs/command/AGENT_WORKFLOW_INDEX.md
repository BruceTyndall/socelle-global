> Updated to align with V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md on 2026-03-08.

# AGENT WORKFLOW INDEX
**Authority:** `V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` → `/.claude/CLAUDE.md` → `docs/command/AGENT_SCOPE_REGISTRY.md`
**Last Updated:** 2026-03-08
**Working Folders Reference:** `docs/command/AGENT_WORKING_FOLDERS.md` — deterministic WRITE/READ/FORBIDDEN map for every agent

---

## Purpose

Canonical index of all agent workflow runbooks in `/.agents/workflows/`. The agent roster aligns with V1 §L. All workflows use the 8-section template (Purpose, Authority, Preconditions, Allowed/Forbidden Paths, Execution Loop, Handoff Protocol, Proof Checklist, Stop Conditions).

**Anti-Shell Rule (V1 §D):** Every hub-owning agent is responsible for ensuring its hub meets ALL 10 minimum functional surface requirements: Create / List / Detail / Edit+Delete / Permissions (RLS+TierGuard) / Intelligence input / Proof+metrics / Export / Error+empty+loading states / Observability. **NO SHELLS.**

---

## Table 1: V1 Agent Roster — Agent to Workflow File to Hub Ownership

### Primary Hub-Owning Agents (V1 §L)

| Agent | Workflow File | Hub(s) Owned | Phase | Status |
|---|---|---|---|---|
| Command Agent | `/.agents/workflows/command_center_agent.md` | Admin | 0-7 | ACTIVE |
| Intelligence Architect | `/.agents/workflows/intelligence_architect_agent.md` | Intelligence | 4 | ACTIVE |
| Platform Engineer | `/.agents/workflows/platform_engineer_agent.md` | Jobs | 3, 5 | ACTIVE |
| Design Guardian | `/.agents/workflows/design_guardian_agent.md` | — (cross-cutting) | 0-7 | ACTIVE |
| Security Agent | `/.agents/workflows/security_agent.md` | — (cross-cutting) | 0-7 | ACTIVE |
| QA Agent | `/.agents/workflows/qa_agent.md` | — (cross-cutting) | 0-7 | ACTIVE |
| Copy Agent | `/.agents/workflows/copy_agent.md` | — (cross-cutting) | 0-7 | ACTIVE |
| Monetization Agent | `/.agents/workflows/monetization_agent.md` | Credit Economy, Affiliate/Wholesale Engine | 4-5 | ACTIVE |
| Data Architect | `/.agents/workflows/data_architect_agent.md` | — (cross-cutting) | 0-7 | ACTIVE |
| CRM Agent | `/.agents/workflows/crm_agent.md` | CRM, Professionals | 5 | ACTIVE |
| Education Agent | `/.agents/workflows/education_studio_agent.md` | Education | 5 | ACTIVE |
| Marketing Agent | `/.agents/workflows/marketing_agent.md` | Marketing, Brands | 5 | ACTIVE |
| Sales Agent | `/.agents/workflows/sales_studio_agent.md` | Sales | 5 | ACTIVE |
| Ecommerce Agent | `/.agents/workflows/ecommerce_agent.md` | Commerce | 5 | ACTIVE |
| Authoring Agent | `/.agents/workflows/authoring_agent.md` | Authoring Studio | 5 | ACTIVE |
| Multi-Platform Agent | `/.agents/workflows/multi_platform_agent.md` | Mobile App, Desktop App | 6 | ACTIVE |

### Supporting Agents (No Hub Ownership)

| Agent | Workflow File | Scope | Status |
|---|---|---|---|
| SEO / Schema Agent | `/.agents/workflows/seo_agent.md` | SEO, sitemaps, Schema.org | ACTIVE |
| Doc Gate QA Agent | `/.agents/workflows/doc_gate_qa_agent.md` | FAIL condition auditing (read-only) | ACTIVE |
| Events Pipeline Agent | `/.agents/workflows/events_pipeline_agent.md` | Event ingestion + surfaces | ACTIVE |
| Analytics / Attribution Agent | `/.agents/workflows/analytics_attribution_agent.md` | First-party analytics, CWV | ACTIVE |
| Infra / DevOps Agent | `/.agents/workflows/infra_devops_agent.md` | CI/CD, build tooling | ACTIVE |
| i18n / Localization Agent | `/.agents/workflows/i18n_localization_agent.md` | Translations, hreflang | ACTIVE |

### Legacy / Renamed Agents (mapped to V1 roster)

| Old Name | New V1 Name | Notes |
|---|---|---|
| Web Agent | Platform Engineer | Merged web dev + backend + infra into Platform Engineer role |
| Mobile Agent | Multi-Platform Agent | Expanded to cover Tauri desktop + Flutter mobile |
| Backend Agent | Platform Engineer + Data Architect | Split: schema to Data Architect, infra to Platform Engineer |
| AI Agent | Intelligence Architect | Expanded to own full Intelligence Hub (10 modules + 7 engines + 6 tools) |
| Admin Control Center Agent | Command Agent | Admin hub ownership moved to Command Agent |
| Affiliates Agent | Monetization Agent | Merged into Monetization Agent |
| Jobs Pipeline Agent | Platform Engineer | Jobs hub assigned to Platform Engineer |
| Jobs Marketplace Agent | Platform Engineer | Merged into Platform Engineer (Jobs hub) |
| Editorial / News Agent | Authoring Agent | Content creation merged into Authoring Agent |
| Marketing Studio Agent | Marketing Agent | Renamed |
| Education Studio Agent | Education Agent | Renamed |
| Social Studio Agent | Marketing Agent | Social merged into Marketing Agent |
| Sales Studio Agent | Sales Agent | Renamed |
| Quizzes / Polls Agent | Marketing Agent | Merged into Marketing Agent |
| Recruitment / Ops Agent | — | BLOCKED (V1 §P — no outreach) |
| Design Parity Agent | Design Guardian | Renamed |

---

## Table 2: Execution Phases (V1 §I — Sequence, Not Calendar)

Agents must respect phase order. Quality > time.

| Phase | Name | Key Agents | Gate |
|---|---|---|---|
| 0 | Design + Required Docs | Command Agent, Design Guardian, Copy Agent | All hub specs and required docs exist (V1 §K) |
| 1 | Skills Installation | Command Agent, all agents | 51+ skills installed and verified |
| 2 | Full-Platform Audit | QA Agent, Platform Engineer, Security Agent | Route manifest, API logic map, mock density report produced |
| 3 | Tech Upgrades (Baseline) | Platform Engineer, Data Architect | React 19, Vite 6, TS strict, TanStack Query, Sentry wired, `database.types.ts` regen. ~1 day total effort. |
| 4 | Intelligence Cloud Build | Intelligence Architect, Monetization Agent, Data Architect | 10 modules + 7 engines + 6 AI tools live. Feed pipeline active. Credit economy wired. |
| 5 | All Hubs Functional | ALL hub-owning agents | Every hub passes anti-shell rule (10 requirements). CMS + content surfaces implemented. |
| 6 | Multi-Platform | Multi-Platform Agent | PWA solid. Tauri desktop wrapper. Flutter mobile wired to APIs. |
| 7 | Launch | ALL agents | All launch non-negotiables passed (V1 §J). Launch comms executed. |

### Phase 5 Hub Build Order (recommended)

1. CRM + Professionals (foundation for other hubs)
2. Marketing + Brands (campaigns, brand directory)
3. Education (courses, protocols, CE credits)
4. Sales (pipeline, leads, commissions)
5. Commerce (catalog, orders — module, not backbone)
6. Authoring Studio (CMS tables first, then authoring UI)
7. Admin (admin panels for all hubs)

---

## Table 3: Agent to Required Proofs

| Agent | Required Proofs |
|---|---|
| Command Agent | No code modified, Doc Gate PASS, contradiction citations |
| Intelligence Architect | `npx tsc --noEmit`, credit deduction verified, no direct client-to-LLM, all 10 modules wired, Doc Gate PASS |
| Platform Engineer | `npx tsc --noEmit`, `npm run build`, RLS on all tables, `database.types.ts` regen, Sentry wired, Doc Gate PASS |
| Design Guardian | Token parity verified, no banned colors/fonts, `graphite`=`#141418`, Doc Gate PASS |
| Security Agent | RLS on all tables, no secrets in code, AI guardrails enforced, FTC badges, Doc Gate PASS |
| QA Agent | Playwright smoke pass, LIVE/DEMO labels verified, no unlabeled mocks, Doc Gate PASS |
| Copy Agent | Zero banned terms, no cold copy, voice matches guidelines, Doc Gate PASS |
| Monetization Agent | Credits deduct correctly, tier gating matches V1 §A, FTC badges on affiliate, Doc Gate PASS |
| Data Architect | RLS on tables, `database.types.ts` matches migrations, `updated_at` triggers, Doc Gate PASS |
| CRM Agent | `npx tsc --noEmit`, RLS cross-tenant prevention, no cold outreach, Doc Gate PASS |
| Education Agent | `npx tsc --noEmit`, CE credits from real events, intelligence-positioned, Doc Gate PASS |
| Marketing Agent | `npx tsc --noEmit`, no cold email, brand surfaces non-shell, Doc Gate PASS |
| Sales Agent | `npx tsc --noEmit`, commissions from DB, RLS tenant-scoped, Doc Gate PASS |
| Ecommerce Agent | `npx tsc --noEmit`, commerce never above Intelligence in nav, routes gated, Doc Gate PASS |
| Authoring Agent | `npx tsc --noEmit`, CMS tables operational, content has provenance, Doc Gate PASS |
| Multi-Platform Agent | `flutter analyze` + Tauri build, design token parity, no hardcoded data without DEMO, Doc Gate PASS |
| SEO Agent | `npx tsc --noEmit`, Schema.org validation, sitemap coverage, Doc Gate PASS |
| Doc Gate QA Agent | All FAIL conditions evaluated, no files modified, Doc Gate PASS |
| Events Pipeline Agent | `npx tsc --noEmit`, Schema.org Event, deduplication, Doc Gate PASS |
| Analytics / Attribution Agent | `npx tsc --noEmit`, no PII in payloads, CWV met, Doc Gate PASS |
| Infra / DevOps Agent | `npm run build`, CI/CD passes, no secrets committed, Doc Gate PASS |
| i18n / Localization Agent | `npx tsc --noEmit`, strings extracted, hreflang valid, Doc Gate PASS |

---

## Table 4: Hub to Anti-Shell Checklist

Every hub must pass ALL 10 requirements before it can be considered complete. **NO SHELLS.**

| # | Requirement | Verified By |
|---|------------|-------------|
| 1 | Create action (user creates primary object -> DB row) | Hub owner agent + QA Agent |
| 2 | Library/List view (sort/filter/search from Supabase) | Hub owner agent + QA Agent |
| 3 | Detail view (full object detail from DB) | Hub owner agent + QA Agent |
| 4 | Edit + Delete (update/archive with RLS respected) | Hub owner agent + Security Agent |
| 5 | Permissions (RLS + ModuleRoute/TierGuard) | Security Agent |
| 6 | Intelligence input (signal can spawn/update object) | Intelligence Architect |
| 7 | Proof/metrics (dashboard with real aggregated metrics + `updated_at`) | QA Agent |
| 8 | Export (CSV minimum; PDF for Pro+) | Hub owner agent |
| 9 | Error/empty/loading (premium states) | QA Agent + Design Guardian |
| 10 | Observability (errors visible in Sentry/logs) | Platform Engineer |

---

## Universal Forbidden Paths (All Agents)

- `SOCELLE-WEB/src/lib/auth.tsx` — NEVER MODIFY
- `SOCELLE-WEB/src/lib/useCart.ts` — NEVER MODIFY
- Commerce flow (cart/checkout/orders) — NEVER MODIFY

## Universal Rules

- **V1 is authority:** If any doc conflicts with `V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md`, V1 wins
- **WO ID rule:** All WO IDs must exist in `SOCELLE-WEB/docs/build_tracker.md`
- **Doc Gate:** All agent outputs must pass FAIL conditions
- **LIVE vs DEMO:** Every data surface must be explicitly labeled
- **Intelligence-first:** Intelligence Hub leads; ecommerce is a module beneath
- **NO SHELLS:** Every hub must be fully functional (10 requirements)
- **Surgical upgrades:** Tech baseline upgrades are incremental (~1 day total), not rewrites
- **React+Vite primary:** No Next.js as main runtime; web app is React+Vite SPA

---

## Table 5: Agent to Assigned Skills + Suites (v4.0 — March 8, 2026)

**97 skills installed** in `/.claude/skills/`. **6 suites** consolidate 26 skills into coordinated pipelines. Each agent should invoke its assigned skills before performing manual audits.

| Agent | Primary Skills | Suite(s) |
|---|---|---|
| Command Agent | doc-gate-enforcer, proof-pack, repo-auditor, changelog-generator | ALL (audit-only) |
| Intelligence Architect | ai-output-quality-checker, ai-service-menu-validator, confidence-scorer, feed-source-auditor, feed-pipeline-checker, signal-data-validator, provenance-checker | data-integrity-suite |
| Platform Engineer | build-gate, db-inspector, migration-validator, rls-auditor, edge-fn-health, type-generation-validator, route-mapper, dependency-scanner | schema-db-suite, test-runner-suite |
| Design Guardian | design-lock-enforcer, design-standard-enforcer, token-drift-scanner, figma-parity-checker | design-audit-suite |
| Security Agent | secrets-scanner, rls-auditor, legal-compliance-checker, risk-gatekeeper | — |
| QA Agent | smoke-test-suite, e2e-test-runner, playwright-crawler, live-demo-detector, hub-shell-detector | test-runner-suite |
| Copy Agent | voice-enforcer, tone-voice-auditor, banned-term-scanner, copy-system-enforcer, language-linter | copy-quality-suite |
| Monetization Agent | credit-economy-validator, billing-scenario-simulator, payment-flow-tester, stripe-integration-tester, affiliate-link-checker, entitlement-validator | billing-payments-suite |
| Data Architect | db-inspector, migration-validator, schema-drift-detector, type-generation-validator, materialized-view-checker | schema-db-suite |
| CRM Agent | rls-auditor, entitlement-validator | — |
| Education Agent | education-content-optimizer, education-module-creator, education-preference-alignor | — |
| Marketing Agent | marketing-alignment-checker, marketing-analytics-forecaster, marketing-campaign-builder, marketing-content-generator, cta-validator | copy-quality-suite |
| Sales Agent | sales-pipeline-optimizer, sales-output-refiner, sales-script-generator | billing-payments-suite |
| Ecommerce Agent | entitlement-validator, payment-flow-tester | billing-payments-suite |
| Authoring Agent | data-quality-auditor, provenance-checker | — |
| Multi-Platform Agent | mobile-parity-checker, build-gate, responsive-checker | design-audit-suite |
| Doc Gate QA Agent | doc-gate-enforcer, live-demo-detector, banned-term-scanner, secrets-scanner, proof-pack | ALL (audit-only) |

**Cross-cutting skills available to ALL agents:** build-gate, secrets-scanner, env-validator, doc-gate-enforcer, live-demo-detector, proof-pack, repo-auditor, risk-gatekeeper, legal-compliance-checker, changelog-generator

**Skill library location:** `/.claude/skills/` (97 active, 6 suites, re-certified March 8, 2026)
**Canonical reference:** `SOCELLE_SKILLS_MASTER_vNEXT.docx`

---

## Multi-Platform Strategy Reference (V1 §H)

| Platform | Runtime | Reuse Strategy |
|---|---|---|
| Web | React + Vite (SPA) | Source implementation. TanStack/React Router. |
| Desktop | Tauri | Wraps same React+Vite build. No Rust re-implementation of business logic. |
| Mobile | Flutter | Same Supabase API contracts + edge functions. No TS-to-Dart FFI. |
| Shared | Supabase schema, RLS, pg_cron, pgvector, edge functions, `intelligence-core` TS package, Pearl Mineral V2 tokens | 96%+ logic reuse via shared contracts |

**Primary runtime:** React + Vite. Next.js is NOT the core runtime.

---

## Supporting Files

| File | Purpose |
|---|---|
| `/.agents/workflows/README.md` | Workflow directory documentation, template definition, usage guide |
| `/.claude/skills/` | 97 installed skills + 6 suites (auto-discovered by Claude Code) |
| `SOCELLE_SKILLS_MASTER_vNEXT.docx` | Canonical skills master with inventory, patchpack, install checklist, verification matrix |
| `V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` | THE master plan. Every agent reads this FIRST. |

---

*SOCELLE AGENT WORKFLOW INDEX v2.0 — March 8, 2026 — Aligned to V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md — Command Center Authority*
