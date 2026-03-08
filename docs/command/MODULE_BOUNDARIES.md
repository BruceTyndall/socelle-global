> Updated to align with V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md on 2026-03-08.

# MODULE BOUNDARIES — SOCELLE GLOBAL
**Generated:** March 5, 2026 — Phase 1 Full Audit
**Authority:** `V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` (master), `docs/command/SOCELLE_CANONICAL_DOCTRINE.md` §1

---

## SHARED vs APP-SPECIFIC

### Shared Across All Apps

| Module | Path | Used By |
|---|---|---|
| Global Governance | `/.claude/CLAUDE.md` | All agents |
| Canonical Docs | `/docs/command/*` | All agents |
| Turborepo Config | `/turbo.json`, `/package.json` | All apps |
| Supabase Config pkg | `/packages/supabase-config/` | Web, Mobile, Marketing |
| UI Primitives pkg | `/packages/ui/` (stub) | Planned — Web, Mobile |
| Root Supabase | `/supabase/` | All apps (monorepo-level schema) |

### SOCELLE-WEB — App-Specific

| Module | Path | Files | Purpose |
|---|---|---|---|
| Auth | `src/lib/auth.tsx` | 1 | React auth context + ProtectedRoute |
| Supabase Client | `src/lib/supabase.ts` | 1 | Web-specific Supabase init |
| DB Types | `src/lib/database.types.ts` | 1 | Generated Supabase types |
| App Types | `src/lib/types.ts` | 1 | Platform models |
| Intelligence Engine | `src/lib/intelligence/` | 9 | `useIntelligence`, signals, market pulse |
| AI Concierge | `src/lib/ai/` | 3 | AI chat engine |
| AI Concierge Engine | `src/lib/aiConciergeEngine.ts` | 1 | Orchestration |
| Analytics | `src/lib/analyticsService.ts` | 1 | Event tracking |
| Brand Tiers | `src/lib/brandTiers/` | 3 | Tier logic |
| Campaigns | `src/lib/campaigns/` | 3 | Campaign builder |
| Education | `src/lib/education/` | 3 | CE credits, curriculum |
| Enrichment | `src/lib/enrichment/` | 4 | Data enrichment |
| i18n | `src/lib/i18n/` | 8 | Internationalization |
| Locations | `src/lib/locations/` | 3 | Multi-location management |
| Motion | `src/lib/motion/` | 3 | Animation utilities |
| Notifications | `src/lib/notifications/` | 3 | Push/in-app notifications |
| Protocols | `src/lib/protocols/` | 3 | Protocol data layer |
| Gap Analysis | `src/lib/gapAnalysisEngine.ts` | 1 | Gap intelligence |
| Ingestion | `src/lib/ingestionService.ts` | 1 | Data ingestion |
| Mapping Engine | `src/lib/mappingEngine.ts` | 1 | Product/protocol mapping |
| Menu Orchestrator | `src/lib/menuOrchestrator.ts` | 1 | Menu analysis |
| Plan Orchestrator | `src/lib/planOrchestrator.ts` | 1 | Business plan generation |
| Report Generator | `src/lib/reportGenerator.ts` | 1 | PDF/report generation |
| Retail Attach | `src/lib/retailAttachEngine.ts` | 1 | Retail product pairing |
| Search Service | `src/lib/searchService.ts` | 1 | Full-text search |
| SEO | `src/lib/seo.ts` | 1 | SEO utilities |
| Cart | `src/lib/useCart.ts` | 1 | Shopping cart |
| Subscriptions | `src/lib/useSubscription.ts` | 1 | Stripe subscription |
| Data Integrity | `src/lib/dataIntegrityRules.ts` | 1 | Validation rules |

### SOCELLE-WEB — Components (Shared Internal)

| Component Group | Path | Files | Used By |
|---|---|---|---|
| AI | `src/components/ai/` | 1 | Portal pages |
| Analytics | `src/components/analytics/` | 5 | Dashboards |
| Education | `src/components/education/` | 3 | Education pages |
| Intelligence | `src/components/intelligence/` | 5 | Intelligence Hub (all portals) |
| Locations | `src/components/locations/` | 1 | Business portal |
| Motion | `src/components/motion/` | 4 | All pages (BlockReveal, WordReveal) |
| Notifications | `src/components/notifications/` | 1 | Portal pages |
| Sections | `src/components/sections/` | 5 | Public pages (Footer, Accordion, etc.) |
| UI | `src/components/ui/` | 16 | All pages (primitives) |
| Root-level | `src/components/` | 40 | Mixed (views, cards, nav, etc.) |

### SOCELLE-WEB — Layouts

| Layout | Path | Routes |
|---|---|---|
| BusinessLayout | `src/layouts/BusinessLayout.tsx` | `/portal/*` |
| BrandLayout | `src/layouts/BrandLayout.tsx` | `/brand/*` |
| AdminLayout | `src/layouts/AdminLayout.tsx` | `/admin/*` |

### SOCELLE-WEB — Supabase (App-Level)

| Resource | Path | Count |
|---|---|---|
| Migrations | `supabase/migrations/` | 70 files |
| Edge: ai-concierge | `supabase/functions/ai-concierge/` | 1 |
| Edge: ai-orchestrator | `supabase/functions/ai-orchestrator/` | 2 |
| Edge: create-checkout | `supabase/functions/create-checkout/` | 1 |
| Edge: generate-embeddings | `supabase/functions/generate-embeddings/` | 1 |
| Edge: magic-link | `supabase/functions/magic-link/` | 1 |
| Edge: send-email | `supabase/functions/send-email/` | 1 |
| Edge: stripe-webhook | `supabase/functions/stripe-webhook/` | 1 |

### SOCELLE-WEB — Scripts

| Script | Path | Purpose |
|---|---|---|
| `create_test_users.sql` | `scripts/` | Test user creation |
| `grant_bruce_admin.sql` | `scripts/` | Admin role grant |
| `seedTestUsers.ts` | `scripts/` | Seed test users |
| `extractProtocolsFromPDFs.ts` | `scripts/` | Protocol PDF extraction |
| `ingestAllProtocols.ts` | `scripts/` | Bulk protocol ingestion |
| `seedRetailAttachRules.ts` | `scripts/` | Retail attach rule seeding |
| (+ 7 more) | `scripts/` | Various admin/debug SQL |

### SOCELLE-WEB — E2E Tests

| Test | Path | Coverage |
|---|---|---|
| `auth.spec.ts` | `e2e/` | Auth flows |
| `routes.spec.ts` | `e2e/` | Route existence |
| `ai-flow.spec.ts` | `e2e/` | AI concierge |
| `routeTable.ts` | `e2e/` | Route table definitions |

### SOCELLE-WEB — Jobs Pipeline (Python)

| File | Path | Purpose |
|---|---|---|
| `main.py` | `socelle-jobs-pipeline/` | Entry point |
| `config.py` | `socelle-jobs-pipeline/` | Configuration |
| `agents/` | `socelle-jobs-pipeline/agents/` | 5 scraping agents |
| `utils/` | `socelle-jobs-pipeline/utils/` | 4 utility modules |

---

### SOCELLE-MOBILE — App-Specific

| Module | Path | Files | Purpose |
|---|---|---|---|
| Core | `apps/mobile/lib/core/` | 17 | Theme, widgets, constants, navigation |
| Data | `apps/mobile/lib/data/` | 16 | Data sources, repositories |
| Features | `apps/mobile/lib/features/` | 21 dirs | Feature modules (see SITE_MAP) |
| Models | `apps/mobile/lib/models/` | 14 | Data models |
| Providers | `apps/mobile/lib/providers/` | 12 | Riverpod providers |
| Repositories | `apps/mobile/lib/repositories/` | 6 | Data repositories |
| Services | `apps/mobile/lib/services/` | 13 | API clients, auth, analytics |

### SOCELLE-MOBILE — Packages

| Package | Path | Items | Purpose |
|---|---|---|---|
| Functions | `packages/functions/` | 40 | Cloud functions (email, Google, notifications, reports, sync) |
| Gap Engine | `packages/gap_engine/` | 5 | Gap analysis engine |
| Shared | `packages/shared/` | 6 | Shared utilities |

### SOCELLE-MOBILE — Firebase Config

| File | Purpose |
|---|---|
| `.firebaserc` | Firebase project binding |
| `firebase.json` | Firebase hosting/functions config |
| `firestore.indexes.json` | Firestore indexes |
| `firestore.rules` | Firestore security rules |

---

### Marketing Site — App-Specific

| File | Path | Purpose |
|---|---|---|
| `layout.tsx` | `apps/marketing-site/src/app/` | Root layout |
| `sitemap.ts` | `apps/marketing-site/src/app/` | Programmatic sitemap |
| `robots.ts` | `apps/marketing-site/src/app/` | Robots.txt generation |
| `page.tsx` | `apps/marketing-site/src/app/intelligence/` | Intelligence landing page |

---

## NON-CANONICAL DOCS (Not in `/docs/command/`)

These exist in the repo but are **NOT authoritative** per Doc Gate rules.

| File | Location | Size | Status |
|---|---|---|---|
| `SOCELLE_MASTER_PROMPT_FINAL.md` | `SOCELLE-WEB/docs/` | 90KB | Legacy — do not treat as authority |
| `SOCELLE_Master_Strategy_Build_Directive.md` | `SOCELLE-WEB/docs/` | 3KB | Legacy |
| `MASTER_BRAIN_ARCHITECTURE.md` | `SOCELLE-WEB/docs/` | 7KB | Legacy |
| `MASTER_PROMPT_VS_RESEARCH.md` | `SOCELLE-WEB/docs/` | 10KB | Legacy |
| `CONTENT_AND_TRENDS_DEEP_DIVE.md` | `SOCELLE-WEB/docs/` | 8KB | Legacy |
| `build_tracker.md` | `SOCELLE-WEB/docs/` | 16KB | Operational |
| `daily_standup.md` | `SOCELLE-WEB/docs/` | 0.5KB | Operational |
| 22 files in `SOCELLE-WEB/docs/platform/` | — | 700KB+ | Spec/planning (reference only) |
| 4 files in `SOCELLE-WEB/docs/codex/` | — | 42KB | Status tracking |
| 13 files in `SOCELLE-WEB/platform/` | — | 500KB+ | SQL migrations + specs |
| `SOCELLE_PLAYBOOK.md` | `SOCELLE-WEB/archive/` | 87KB | ARCHIVED |
| `SOCELLE_WORK_ORDER.md` | `SOCELLE-WEB/archive/` | 6KB | ARCHIVED |
| `USER_JOURNEY_MAP.md` | `SOCELLE-MOBILE-main/docs/` | 37KB | Operational |
| `build_tracker.md` | `SOCELLE-MOBILE-main/docs/` | 12KB | Operational |
| `master_prompt.md` | `SOCELLE-MOBILE-main/docs/` | 18KB | Legacy — review for conflicts |
| 4 files in `SOCELLE-MOBILE-main/docs/audit/` | — | — | Audit reference |
| `SEO_GUIDELINES.md` | `/` (root) | 5KB | ORPHAN — absorb into `/docs/command/` |

---

## CROSS-BOUNDARY RULES

Per `V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` §L (Agent Roster) and §D (Anti-Shell Rule):

### Agent Ownership (V1 §L)

| Agent Role | Owns |
|---|---|
| **Command Agent** | Sequencing, governance, gates, `/docs/command/*` |
| **Platform Engineer** | `SOCELLE-WEB/` build system, tech upgrades, CI, observability |
| **Intelligence Architect** | Intelligence Hub, AI tools, feed pipeline (`src/lib/intelligence/`, `src/lib/ai/`, AI edge functions) |
| **Data Architect** | `supabase/` — only role that may create migrations; schema, types, MVs, first-party events |
| **Design Guardian** | Design tokens (Tailwind `theme.extend`), figma-to-code, responsiveness |
| **Security Agent** | RLS, secrets, AI guardrails, legal, FTC |
| **QA Agent** | Tests, smoke, visual regression, LIVE/DEMO enforcement |
| **Copy Agent** | Voice, banned terms, paywall/onboarding/empties, launch comms |
| **Monetization Agent** | Entitlements, credits, pricing, onboarding |
| **Multi-Platform Agent** | `apps/socelle-mobile/`, Tauri desktop wrapper, shared API contracts |
| **CRM/Education/Marketing/Sales/Ecommerce/Authoring Agents** | Each owns their respective hub |

### Boundary Rules

1. **Primary runtime:** React + Vite (SPA). Next.js is NOT the main runtime (V1 §E).
2. **Tech upgrades are surgical:** React 18.3 → 19.x (~2h), Vite 5.4 → 6.x (~1h), TS strict (~3-5h). Total ~1 day, zero rewrites (V1 §E).
3. **Tailwind 3.4 now.** Tailwind 4 deferred until legacy color systems removed (V1 §F).
4. **Multi-platform strategy (V1 §H):**
   - Web: React + Vite (source implementation).
   - Desktop: Tauri wraps the same React+Vite build.
   - Mobile: Flutter with shared Supabase API contracts (no TS FFI into Dart).
5. **Design tokens** changes require coordinated updates across Web Tailwind + Mobile Flutter theme.
6. **Shared types** live in `lib/types.ts` (web) and must mirror mobile models.
7. No app-level doc may override `/docs/command/` governance.
8. Each hub has exactly one primary owner agent. No orphan hubs (V1 §L).

### 15 Hubs — All Must Pass Anti-Shell Rule (V1 §D, §G)

Every hub must have: Create, Library, Detail, Edit+Delete, Permissions (RLS + TierGuard), Intelligence input, Proof/metrics, Export (CSV min), Error/empty/loading states, Observability (Sentry).

| Hub | Owner Agent | Primary Module Path |
|---|---|---|
| Intelligence | Intelligence Architect | `src/lib/intelligence/`, `src/pages/intelligence/` |
| Jobs | Platform Engineer | `socelle-jobs-pipeline/`, `src/pages/jobs/` |
| Brands | Ecommerce Agent | `src/pages/brand/` |
| Professionals | Platform Engineer | `src/pages/public/Professionals.tsx` |
| Admin | Platform Engineer | `src/pages/admin/` |
| CRM | CRM Agent | TBD (Phase 5) |
| Education | Education Agent | `src/lib/education/`, `src/pages/education/` |
| Marketing | Marketing Agent | TBD (Phase 5) |
| Sales | Sales Agent | TBD (Phase 5) |
| Commerce | Ecommerce Agent | `src/lib/useCart.ts`, commerce edge functions |
| Authoring Studio | Authoring Agent | TBD (Phase 5) |
| Mobile App | Multi-Platform Agent | `apps/socelle-mobile/` |
| Desktop App | Multi-Platform Agent | Tauri wrapper (Phase 6) |
| Credit Economy | Monetization Agent | Credit system, entitlements |
| Affiliate/Wholesale Engine | Monetization Agent | Affiliate links, FTC badges |

### Execution Phase Order (V1 §I)

0. Design + Required Docs → 1. Skills Installation → 2. Full-Platform Audit → 3. Tech Upgrades (Baseline) → 4. Intelligence Cloud Build → 5. All Hubs Functional (incl. CMS) → 6. Multi-Platform → 7. Launch.

---

*Per `docs/command/SOCELLE_RELEASE_GATES.md` §9: All modules cited with paths. No undiscovered directories.*
