# SOCELLE GLOBAL — SKILLS MASTER REGISTRY
**Total Skills Installed**: 89 custom + 1 skill-creator + 1 skill-selector = **91**
**Location**: `SOCELLE GLOBAL/.claude/skills/`
**Persistence**: On-disk, auto-discovered by Claude Code every session
**Last Updated**: March 8, 2026
**Maintenance**: Re-run `skill-creator` quarterly to refresh skills against model drift

---

## SKILL TAXONOMY

### Layer A: Program-Wide (Original 51 from Work Order)

#### P0: Repo / Build / Security (11 skills)

| # | Skill | Purpose |
|---|-------|---------|
| 1 | `repo-auditor` | Full monorepo inventory and structure audit |
| 2 | `build-gate` | TypeScript typecheck + production build gate |
| 3 | `playwright-crawler` | Headless route crawl + screenshots |
| 4 | `db-inspector` | Migration integrity, RLS audit, schema drift |
| 5 | `edge-fn-health` | Edge function inventory + wiring check |
| 6 | `secrets-scanner` | Secret patterns, env hygiene, PAYMENT_BYPASS |
| 7 | `proof-pack` | Aggregates all QA JSONs into gate decision |
| 8 | `rls-auditor` | RLS policies on all tables |
| 9 | `env-validator` | .env parity, hardcoded values |
| 10 | `dependency-scanner` | npm audit, outdated, unused packages |
| 11 | `migration-validator` | Sequential ordering, ADD-ONLY, naming conventions |

#### P1: Intelligence / Design / Copy (20 skills)

| # | Skill | Purpose |
|---|-------|---------|
| 12 | `live-demo-detector` | isLive flags, DEMO badges, fake timestamps |
| 13 | `token-drift-scanner` | Pearl Mineral V2 hex/font/glass compliance |
| 14 | `route-mapper` | App.tsx routes vs GLOBAL_SITE_MAP.md |
| 15 | `hub-shell-detector` | SHELL/STUB/LIVE page classification |
| 16 | `language-linter` | 67 banned terms, generic marketing, CTA quality |
| 17 | `voice-enforcer` | B2B tone, sales pressure, intelligence-first |
| 18 | `banned-term-scanner` | Deep banned-term scan with replacements |
| 19 | `cta-validator` | CTA hierarchy, commerce on intelligence surfaces |
| 20 | `intelligence-module-checker` | All 10 Intelligence Cloud modules verified |
| 21 | `ai-service-menu-validator` | 7 engines + 6 AI tools + credit deduction |
| 22 | `signal-data-validator` | Freshness, confidence scoring, source attribution |
| 23 | `feed-source-auditor` | RSS feeds, external APIs, scraping targets |
| 24 | `confidence-scorer` | Confidence tier implementation validation |
| 25 | `provenance-checker` | Source citation, freshness SLA, attribution |
| 26 | `design-lock-enforcer` | Color locks, typography, glass, border radius |
| 27 | `responsive-checker` | Breakpoints, mobile-first, touch targets |
| 28 | `component-library-auditor` | Component inventory, duplicates, reuse |
| 29 | `figma-parity-checker` | figma-make-source module mapping + wiring |
| 30 | `copy-system-enforcer` | Heading hierarchy, error msgs, empty/loading |
| 31 | `persona-page-validator` | ForBrands/ForMedspas/ForSalons completeness |

#### P1: Monetization / QA (10 skills)

| # | Skill | Purpose |
|---|-------|---------|
| 32 | `entitlement-validator` | Tier gates, PAYMENT_BYPASS, role access |
| 33 | `payment-flow-tester` | Stripe integration, checkout, subscriptions |
| 34 | `credit-economy-validator` | Credit allocation, AI costs, balance tracking |
| 35 | `affiliate-link-checker` | Link wrapper, FTC compliance, distributor map |
| 36 | `stripe-integration-tester` | Webhooks, products/prices, test vs prod |
| 37 | `onboarding-flow-tester` | Signup, role selection, first-value path |
| 38 | `smoke-test-suite` | Quick build+typecheck+critical file checks |
| 39 | `e2e-test-runner` | Playwright test execution + scaffold generation |
| 40 | `visual-regression-checker` | Screenshot baseline capture + comparison |
| 41 | `ai-output-quality-checker` | Guardrails, medical/financial blocks |

#### P2: Data / Platform / Multi (10 skills)

| # | Skill | Purpose |
|---|-------|---------|
| 42 | `feed-pipeline-checker` | Table-to-hook-to-component trace |
| 43 | `api-logic-mapper` | Edge function detail + orphan detection |
| 44 | `doc-gate-enforcer` | All 7 FAIL conditions from CLAUDE.md §B |
| 45 | `schema-drift-detector` | database.types.ts vs migrations parity |
| 46 | `materialized-view-checker` | Views, refresh schedules, RPC functions |
| 47 | `shared-package-validator` | Cross-app imports, package boundaries |
| 48 | `hook-consolidator` | Duplicate hooks, unused hooks, complexity |
| 49 | `type-generation-validator` | Strict mode, any-type usage, ts-ignore |
| 50 | `realtime-subscription-checker` | Realtime channels, cleanup patterns |
| 51 | `mobile-parity-checker` | Web-Flutter feature parity, theme consistency |

---

### Layer B: Capability Uplift (18 skills)
*Generate new business outputs — sales, marketing, education, design, dev, strategy*

| # | Skill | Purpose |
|---|-------|---------|
| 52 | `front-end-design` | Generate React/Tailwind components aligned to Pearl Mineral V2 |
| 53 | `marketing-content-generator` | Create B2B marketing copy with intelligence-first voice |
| 54 | `operations-optimizer` | Prioritize tasks, generate roadmaps and runbooks |
| 55 | `legal-compliance-checker` | Scan for FDA/FTC/HIPAA/GDPR regulatory risks |
| 56 | `data-quality-auditor` | Audit feed quality, freshness, coverage gaps |
| 57 | `growth-tactic-simulator` | Model PLG scenarios, retention, A/B test plans |
| 58 | `sales-script-generator` | Intelligence-first inbound sales scripts (no cold outreach) |
| 59 | `marketing-campaign-builder` | Multi-channel campaigns: email, social, landing pages |
| 60 | `education-module-creator` | Design learning modules from protocol data + intelligence |
| 61 | `design-prototype-generator` | Functional React prototypes with Pearl Mineral V2 |
| 62 | `dev-code-accelerator` | Production-grade TypeScript/React code generation |
| 63 | `strategy-simulator` | Business strategy scenario simulations (NRR, pricing, market entry) |
| 64 | `sales-pipeline-optimizer` | Lead scoring framework and pipeline segmentation |
| 65 | `marketing-analytics-forecaster` | Campaign ROI prediction across channels |
| 66 | `education-content-optimizer` | Refine modules with quizzes, certificates, analytics |
| 67 | `design-iteration-automator` | Automated design audit-and-fix cycles |
| 68 | `dev-workflow-scheduler` | Sequence dev tasks into executable pipelines |
| 69 | `business-forecast-modeler` | Multi-variable 5-year business forecasts |

---

### Layer C: Encoded Preferences (12 skills)
*Enforce SOCELLE-specific preferences across all outputs*

| # | Skill | Purpose |
|---|-------|---------|
| 70 | `idea-mining` | Mine docs for intelligence-first product ideas |
| 71 | `tone-voice-auditor` | Deep sentence-level tone/voice audit with rewrites |
| 72 | `geo-expansion-validator` | International readiness (data, regulatory, localization) |
| 73 | `risk-gatekeeper` | Last-line-of-defense risk scan before production |
| 74 | `retention-mechanic-tester` | Audit engagement loops, notifications, habit mechanics |
| 75 | `billing-scenario-simulator` | Test billing edge cases, proration, dunning, credits |
| 76 | `sales-output-refiner` | Refine sales content for ROI-first framing |
| 77 | `marketing-alignment-checker` | Validate marketing for trend-first alignment |
| 78 | `education-preference-alignor` | Align education content with governance preferences |
| 79 | `design-standard-enforcer` | Enforce Pearl Mineral V2 across all UI surfaces |
| 80 | `dev-best-practice-checker` | Validate code against strict TS/React best practices |
| 81 | `strategy-preference-validator` | Validate strategy for intelligence-first alignment |

---

### Layer D: Cross-Business Optimization (8 skills)

| # | Skill | Purpose |
|---|-------|---------|
| 82 | `seo-audit` | Meta tags, structured data, crawlability, page speed |
| 83 | `accessibility-checker` | WCAG 2.1 AA compliance, ARIA, keyboard nav |
| 84 | `performance-profiler` | Bundle size, render perf, Core Web Vitals |
| 85 | `error-handling-auditor` | Error boundaries, try/catch coverage |
| 86 | `api-documentation-generator` | Generate API docs for 31+ edge functions |
| 87 | `competitor-intelligence-mapper` | Feature parity analysis, differentiation mapping |
| 88 | `investor-readiness-checker` | Metrics availability, claims vs reality |
| 89 | `changelog-generator` | Generate changelogs from git history |

---

### System Skill (1)

| # | Skill | Purpose |
|---|-------|---------|
| 90 | `skill-creator` | Meta-skill for creating, testing, and maintaining all other skills |
| 91 | `skill-selector` | Auto-routes prompts to best-fit skill via keyword/intent matching |

---

## MAINTENANCE PROTOCOL

### Quarterly Refresh (Every 3 Months)
Skills "fade" over time due to model drift and evolving business needs. Every quarter:
1. Run `proof-pack` to test which skills still produce valid output
2. Re-read governance docs for any rule changes
3. Update skills that reference specific file paths or patterns that have changed
4. Retire skills for features that are fully LIVE and no longer need auditing
5. Add new skills for new business areas

### How to Add a New Skill
```bash
# 1. Create directory
mkdir -p .claude/skills/[skill-name]

# 2. Write SKILL.md with frontmatter (name + description) and procedure steps
# 3. Verify with: find .claude/skills -name "SKILL.md" | wc -l
# 4. Test by asking Claude to run the skill
```

### Recommended Audit Execution Order
1. **Security First:** `smoke-test-suite` → `secrets-scanner` → `build-gate`
2. **Data Layer:** `db-inspector` → `rls-auditor` → `schema-drift-detector`
3. **Page Completeness:** `route-mapper` → `hub-shell-detector` → `live-demo-detector`
4. **Design Compliance:** `design-lock-enforcer` → `design-standard-enforcer` → `token-drift-scanner` → `responsive-checker`
5. **Copy Quality:** `language-linter` → `voice-enforcer` → `banned-term-scanner`
6. **Code Quality:** `dev-best-practice-checker` → `dependency-scanner` → `error-handling-auditor`
7. **Core Product:** `intelligence-module-checker` → `ai-service-menu-validator` → `entitlement-validator`
8. **Business Outputs:** `sales-output-refiner` → `marketing-alignment-checker` → `education-preference-alignor` → `strategy-preference-validator`
9. **Risk Assessment:** `legal-compliance-checker` → `risk-gatekeeper`
10. **Governance Gate:** `doc-gate-enforcer` → `proof-pack`

---

## SKILL COUNTS SUMMARY

| Category | Count |
|----------|-------|
| Layer A: Program-Wide Foundation | 51 |
| Layer B: Capability Uplift | 18 |
| Layer C: Encoded Preferences | 12 |
| Layer D: Cross-Business | 8 |
| System (skill-creator + skill-selector) | 2 |
| **TOTAL** | **91** |

---

*SOCELLE SKILLS MASTER REGISTRY v3.1 — March 8, 2026 — 91 Skills Installed*
