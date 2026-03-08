> Updated to align with V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md on 2026-03-08.

# SOCELLE MONOREPO MAP
**Generated:** March 5, 2026 — Phase 1 Full Audit
**Updated:** March 8, 2026 — V1 Master Alignment
**Authority:** `docs/command/V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` (V1 wins if conflicts exist)

---

## 1. REPO TREE (depth 4, artifacts excluded)

```
SOCELLE GLOBAL/                          ← MONOREPO ROOT
├── .agents/workflows/                   ← Agent workflow definitions (3 files)
├── .claude/CLAUDE.md                    ← Global governance
├── .gitignore
├── SEO_GUIDELINES.md                    ← ROOT ORPHAN (not in /docs/command/)
├── package.json                         ← Turborepo root package
├── turbo.json                           ← Turborepo pipeline config
│
├── docs/
│   ├── command/                         ← CANONICAL DOCS (sole authority)
│   │   ├── SOCELLE_CANONICAL_DOCTRINE.md
│   │   ├── SOCELLE_ENTITLEMENTS_PACKAGING.md
│   │   ├── SOCELLE_DATA_PROVENANCE_POLICY.md
│   │   ├── SOCELLE_FIGMA_TO_CODE_HANDOFF.md
│   │   ├── SOCELLE_RELEASE_GATES.md
│   │   ├── SOCELLE_MONOREPO_MAP.md
│   │   ├── SITE_MAP.md
│   │   ├── HARD_CODED_SURFACES.md
│   │   ├── ASSET_MANIFEST.md
│   │   └── MODULE_BOUNDARIES.md
│   └── archive/                         ← DEPRECATED (reference only)
│       ├── DEPRECATED__2026-03-05__MODULE_MAP.md
│       └── DEPRECATED__2026-03-05__DRIFT_PATCHLIST.md
│
├── apps/
│   ├── marketing-site/                  ← Next.js marketing site
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/app/
│   │       ├── layout.tsx
│   │       ├── robots.ts
│   │       ├── sitemap.ts
│   │       └── intelligence/page.tsx
│   └── web-portal/                      ← STUB — package.json only
│       └── package.json
│
├── packages/
│   ├── supabase-config/
│   │   ├── package.json
│   │   └── src/index.ts
│   └── ui/
│       ├── package.json
│       └── src/index.ts
│
├── supabase/                            ← ROOT SUPABASE (monorepo-level)
│   ├── .agents/workflows/
│   ├── .env / .env.example
│   ├── config.toml
│   ├── README.md
│   ├── seed.sql
│   ├── migrations/                      ← 2 migrations
│   │   ├── 20260305000001_initial_schema.sql
│   │   └── 20260305000002_vector_search_fn.sql
│   └── functions/
│       └── ai-orchestrator/             ← 1 edge function
│
├── SOCELLE-WEB/                         ← WEB APP (Vite + React + Tailwind)
│   ├── .claude/CLAUDE.md                ← Web-specific governance
│   ├── .bolt/                           ← Bolt.new config
│   ├── .cursor/                         ← Cursor editor config
│   ├── .github/workflows/              ← CI/CD (GitHub Actions)
│   ├── .netlify/                        ← Netlify deployment config
│   ├── archive/                         ← 2 legacy docs (PLAYBOOK 87KB, WORK_ORDER 5KB)
│   ├── docs/
│   │   ├── audit/                       ← 1 file (SYSTEM_OVERVIEW.md)
│   │   ├── codex/                       ← 4 files (BUILD_SEQUENCE, MVP_FREEZE, etc.)
│   │   ├── platform/                    ← 22 spec docs (700KB+ total)
│   │   └── strategy/                    ← empty
│   ├── e2e/                             ← 4 Playwright test files
│   ├── Images and videos/               ← RAW ASSETS (23 swatches + 12 photo + 6 video)
│   │   ├── 1.svg – 23.svg              ← Ingredient swatch photos
│   │   ├── Photo Skincare Swatches/     ← 12 skincare texture photos
│   │   ├── air bubbles.mp4 – yellow drops.mp4  ← 6 product videos
│   ├── platform/                        ← 13 platform spec docs (SQL migrations, specs)
│   ├── playwright-report/               ← Playwright test reports
│   ├── public/                          ← Deployed static assets
│   │   ├── images/ (7 photos + swatches/)
│   │   └── videos/ (6 .mp4 files)
│   ├── scripts/                         ← 13 admin SQL/TS scripts
│   ├── slotforce/                       ← OUT OF SCOPE (SlotForce code)
│   ├── socelle-jobs-pipeline/           ← Python job scraping microservice
│   │   ├── main.py, config.py
│   │   ├── agents/ (5 files)
│   │   └── utils/ (4 files)
│   ├── src/
│   │   ├── components/                  ← 40 files + 9 subdirs
│   │   ├── layouts/                     ← 3 layouts (Business, Brand, Admin)
│   │   ├── lib/                         ← 34 files + 12 subdirs (services, engines)
│   │   ├── pages/
│   │   │   ├── admin/                   ← 20 files + brand-hub/ (7 files)
│   │   │   ├── brand/                   ← 26 files
│   │   │   ├── business/                ← 22 files
│   │   │   ├── claim/                   ← 2 files
│   │   │   └── public/                  ← 30 files
│   │   └── test/                        ← Unit tests
│   ├── supabase/                        ← APP-LEVEL SUPABASE
│   │   ├── functions/                   ← 7 edge functions
│   │   │   ├── ai-concierge/
│   │   │   ├── ai-orchestrator/
│   │   │   ├── create-checkout/
│   │   │   ├── generate-embeddings/
│   │   │   ├── magic-link/
│   │   │   ├── send-email/
│   │   │   └── stripe-webhook/
│   │   └── migrations/                  ← 70 migration files
│   ├── test-results/                    ← Playwright test results
│   └── SOCELLE-WEB/                     ← STALE NESTED CLONE (has own .git)
│
└── SOCELLE-MOBILE-main/                 ← MOBILE APP (Flutter + Riverpod)
    ├── .firebaserc
    ├── .prettierrc.json
    ├── README.md
    ├── eslint.config.js
    ├── firebase.json
    ├── firestore.indexes.json
    ├── firestore.rules
    ├── package.json
    ├── tsconfig.base.json
    ├── vitest.config.ts
    ├── Images Skincare Ingredient Swatches Square/  ← 23 hi-res SVG images
    ├── Photo Skincare Swatches/                     ← 12 hi-res SVG images
    ├── apps/mobile/
    │   ├── lib/
    │   │   ├── main.dart
    │   │   ├── firebase_options.dart
    │   │   ├── core/     (17 items)
    │   │   ├── data/     (16 items)
    │   │   ├── features/ (21 feature dirs)
    │   │   ├── models/   (14 items)
    │   │   ├── providers/ (12 items)
    │   │   ├── repositories/ (6 items)
    │   │   └── services/  (13 files)
    │   ├── ios/           ← Xcode project
    │   ├── web/           ← Flutter web target
    │   ├── test/
    │   └── docs/
    ├── docs/
    │   ├── USER_JOURNEY_MAP.md (37KB)
    │   ├── build_tracker.md (12KB)
    │   ├── master_prompt.md (18KB)
    │   ├── audit/ (4 files)
    │   └── slotforce/ (7 files) ← OUT OF SCOPE
    └── packages/
        ├── functions/ (40 items — email, google, notifications, reports, sync)
        ├── gap_engine/ (5 items)
        └── shared/ (6 items)
```

---

## 2. COVERAGE PROOF

### Directories Scanned — Checklist

| Directory | Scanned | Notes |
|---|---|---|
| `/` (root) | ✅ PASS | 8 subdirs, 5 root files |
| `/.agents/workflows/` | ✅ PASS | 3 workflow files |
| `/.claude/` | ✅ PASS | CLAUDE.md |
| `/docs/command/` | ✅ PASS | 10 canonical docs |
| `/apps/marketing-site/` | ✅ PASS | Next.js app, 4 routes |
| `/apps/web-portal/` | ✅ PASS | Stub — package.json only |
| `/packages/supabase-config/` | ✅ PASS | 2 files |
| `/packages/ui/` | ✅ PASS | 2 files |
| `/supabase/` | ✅ PASS | 2 migrations, 1 edge fn, config |
| `/supabase/.agents/workflows/` | ✅ PASS | Backend agent workflows |
| `/SOCELLE-WEB/` | ✅ PASS | Full scan including all subdirs |
| `/SOCELLE-WEB/archive/` | ✅ PASS | 2 legacy docs |
| `/SOCELLE-WEB/docs/audit/` | ✅ PASS | 1 file |
| `/SOCELLE-WEB/docs/codex/` | ✅ PASS | 4 files |
| `/SOCELLE-WEB/docs/platform/` | ✅ PASS | 22 spec docs |
| `/SOCELLE-WEB/docs/strategy/` | ✅ PASS | Empty |
| `/SOCELLE-WEB/e2e/` | ✅ PASS | 4 test files |
| `/SOCELLE-WEB/Images and videos/` | ✅ PASS | 23 SVG + 12 photo + 6 video |
| `/SOCELLE-WEB/platform/` | ✅ PASS | 13 spec/migration docs |
| `/SOCELLE-WEB/playwright-report/` | ✅ PASS | Test report artifacts |
| `/SOCELLE-WEB/public/` | ✅ PASS | Static assets (images, videos, configs) |
| `/SOCELLE-WEB/scripts/` | ✅ PASS | 13 admin SQL/TS scripts |
| `/SOCELLE-WEB/slotforce/` | ✅ PASS | Scanned — OUT OF SCOPE |
| `/SOCELLE-WEB/socelle-jobs-pipeline/` | ✅ PASS | Python microservice (6 files + 2 dirs) |
| `/SOCELLE-WEB/src/components/` | ✅ PASS | 40 files + 9 subdirs |
| `/SOCELLE-WEB/src/layouts/` | ✅ PASS | 3 layout files |
| `/SOCELLE-WEB/src/lib/` | ✅ PASS | 34 files + 12 subdirs |
| `/SOCELLE-WEB/src/pages/admin/` | ✅ PASS | 20 files + brand-hub/ (7 files) |
| `/SOCELLE-WEB/src/pages/brand/` | ✅ PASS | 26 files |
| `/SOCELLE-WEB/src/pages/business/` | ✅ PASS | 22 files |
| `/SOCELLE-WEB/src/pages/claim/` | ✅ PASS | 2 files |
| `/SOCELLE-WEB/src/pages/public/` | ✅ PASS | 30 files |
| `/SOCELLE-WEB/src/test/` | ✅ PASS | Unit tests |
| `/SOCELLE-WEB/supabase/functions/` | ✅ PASS | 7 edge functions |
| `/SOCELLE-WEB/supabase/migrations/` | ✅ PASS | 70 migration files |
| `/SOCELLE-WEB/test-results/` | ✅ PASS | 3 test result dirs |
| `/SOCELLE-WEB/SOCELLE-WEB/` | ✅ PASS | STALE NESTED CLONE — should be deleted |
| `/SOCELLE-MOBILE-main/` | ✅ PASS | Full Flutter app |
| `/SOCELLE-MOBILE-main/apps/mobile/lib/` | ✅ PASS | 7 subdirs + 2 root files |
| `/SOCELLE-MOBILE-main/apps/mobile/ios/` | ✅ PASS | Xcode project |
| `/SOCELLE-MOBILE-main/apps/mobile/web/` | ✅ PASS | Flutter web |
| `/SOCELLE-MOBILE-main/docs/` | ✅ PASS | 3 docs + 2 subdirs |
| `/SOCELLE-MOBILE-main/docs/slotforce/` | ✅ PASS | Scanned — OUT OF SCOPE |
| `/SOCELLE-MOBILE-main/docs/audit/` | ✅ PASS | 4 audit files |
| `/SOCELLE-MOBILE-main/Images Skincare.../` | ✅ PASS | 23 SVG images |
| `/SOCELLE-MOBILE-main/Photo Skincare.../` | ✅ PASS | 12 SVG images |
| `/SOCELLE-MOBILE-main/packages/functions/` | ✅ PASS | 40 items (email, google, notifications, reports, sync) |
| `/SOCELLE-MOBILE-main/packages/gap_engine/` | ✅ PASS | 5 items |
| `/SOCELLE-MOBILE-main/packages/shared/` | ✅ PASS | 6 items |

### Directories Excluded

| Directory | Reason |
|---|---|
| `*/node_modules/*` | Standard — npm dependencies |
| `*/.git/*` | Standard — version control internals |
| `*/.next/*` | Standard — Next.js build cache |
| `*/dist/*` | Standard — build output |
| `*/.dart_tool/*` | Standard — Dart tooling cache |
| `*/build/*` | Standard — build output |
| `*/.artifacts/*` | Standard — tool artifacts |
| `*/.gemini/*` | Standard — Gemini artifacts |
| `*/node-compile-cache/*` | Standard — V8 compile cache |
| `*/.firebase/*` | Standard — Firebase cache |
| `*/.pub-cache/*` | Standard — Dart pub cache |

**ZERO undiscovered directories remain.**

---

## 3. SCOPE SEPARATION

### IN SCOPE — SOCELLE Platform

| Directory | Scope |
|---|---|
| `/docs/command/` | Canonical governance |
| `/apps/marketing-site/` | SOCELLE Marketing |
| `/apps/web-portal/` | SOCELLE Web Portal (stub) |
| `/packages/supabase-config/` | Shared Supabase config |
| `/packages/ui/` | Shared UI (stub) |
| `/supabase/` | SOCELLE Backend |
| `/SOCELLE-WEB/` | SOCELLE Web App |
| `/SOCELLE-WEB/socelle-jobs-pipeline/` | SOCELLE jobs |
| `/SOCELLE-MOBILE-main/` (excl. slotforce) | SOCELLE Mobile |

### OUT OF SCOPE — Non-SOCELLE

| Directory | Content | Label |
|---|---|---|
| `SOCELLE-WEB/slotforce/` | SlotForce scheduling code | **OUT OF SCOPE** |
| `SOCELLE-MOBILE-main/docs/slotforce/` | SlotForce spec docs (7 files) | **OUT OF SCOPE** |
| `SOCELLE-WEB/SOCELLE-WEB/` | Stale nested clone with own `.git` | **DELETE CANDIDATE** |

---

## 4. APPS SUMMARY

| App | Path | Stack | Status |
|---|---|---|---|
| SOCELLE-WEB | `/SOCELLE-WEB/` | Vite 5.4 + React 18.3 + Tailwind 3.4 | Active (150+ routes) — **Primary runtime: React+Vite** (surgical upgrade to React 19 + Vite 6 planned, ~1 day effort) |
| SOCELLE-MOBILE | `/SOCELLE-MOBILE-main/` | Flutter + Riverpod | Active (21 features) — shares Supabase API contracts with web |
| Marketing Site | `/apps/marketing-site/` | Next.js | Partial (4 routes) — **NOT the primary runtime**; SEO-only surface |
| Web Portal | `/apps/web-portal/` | TBD | Stub only |
| Desktop (planned) | (not yet created) | Tauri wrapper around SOCELLE-WEB | Phase 6 — wraps same React+Vite build |

## 5. PACKAGES SUMMARY

| Package | Path | Purpose | Exports | Dependents |
|---|---|---|---|---|
| `supabase-config` | `/packages/supabase-config/` | Shared Supabase client/config | `index.ts` | Web, Mobile |
| `ui` | `/packages/ui/` | Shared UI primitives | `index.ts` (stub) | TBD |
| Mobile `functions` | `/SOCELLE-MOBILE-main/packages/functions/` | Cloud functions (email, Google, notifications, reports, sync) | Multiple | Mobile |
| Mobile `gap_engine` | `/SOCELLE-MOBILE-main/packages/gap_engine/` | Gap analysis engine | `src/` + `test/` | Mobile |
| Mobile `shared` | `/SOCELLE-MOBILE-main/packages/shared/` | Shared utilities | `src/` + `test/` | Mobile |

## 6. SUPABASE SUMMARY

### Root Supabase (`/supabase/`)
- **Migrations:** 2 (initial_schema, vector_search_fn)
- **Edge Functions:** 1 (ai-orchestrator)
- **Config:** config.toml, seed.sql, .env

### App-Level Supabase (`/SOCELLE-WEB/supabase/`)
- **Migrations:** 70 files (Jan 21, 2026 → Mar 5, 2026)
- **Edge Functions:** 7 (ai-concierge, ai-orchestrator, create-checkout, generate-embeddings, magic-link, send-email, stripe-webhook)

### Key Tables Referenced by UI (from migration filenames)
| Table | Migration | Used By |
|---|---|---|
| `brands` | `create_brands_and_businesses_tables` | Brands, BrandStorefront, Admin |
| `businesses` | same | Business portal |
| `orders` / `order_items` | `create_orders_and_order_items_tables` | All portals |
| `protocols` | `create_naturopathica_schema` | Protocols, Education |
| `profiles` | `create_user_profiles_and_submissions_schema` | Auth, all portals |
| `market_signals` | `create_intelligence_engine_schema` | Intelligence Hub |
| `subscriptions` | `create_subscriptions_table` | Paywall, Plans |
| `job_postings` | `job_postings` | Jobs |
| `events` | (migration in `platform/`) | Events |
| `access_requests` | `access_requests` | Request Access |
| `brand_seed_content` | `create_brand_seed_content` | BrandStorefront |
| `brand_interest_signals` | `create_brand_interest_signals` | BrandStorefront |
| `conversations` / `messages` | `create_conversations`, `create_messages` | Messaging |

---

---

## 7. V1 HUB COVERAGE (15 Hubs — Anti-Shell Rule)

Per V1 §D + §G, every hub must be non-shell and satisfy the full anti-shell checklist. Current monorepo coverage:

| Hub | Monorepo Location | Status |
|---|---|---|
| Intelligence | `SOCELLE-WEB/src/pages/public/Intelligence.tsx` + portal intelligence pages | Routes exist, partial DEMO |
| Jobs | `SOCELLE-WEB/src/pages/public/Jobs.tsx` | Routes exist |
| Brands | `SOCELLE-WEB/src/pages/public/Brands.tsx` + brand portal | Routes exist, LIVE |
| Professionals | `SOCELLE-WEB/src/pages/public/Professionals.tsx` | Route exists, DEMO |
| Admin | `SOCELLE-WEB/src/pages/admin/` | 37+ routes, mostly LIVE |
| CRM | `SOCELLE-WEB/src/pages/admin/CrmHub.tsx` | Route exists, needs anti-shell work |
| Education | `SOCELLE-WEB/src/pages/public/Education.tsx` | Route exists, LIVE |
| Marketing | `SOCELLE-WEB/src/pages/admin/` (calendar, campaigns) | Partial, needs hub build |
| Sales | `SOCELLE-WEB/src/pages/admin/SalesHub.tsx` | Route exists, needs anti-shell work |
| Commerce | Within portals (orders, products, cart) | Module — not top-level nav |
| Authoring Studio | NOT YET CREATED | Phase 5 — CMS + blog + briefs |
| Mobile App | `SOCELLE-MOBILE-main/` | Flutter app, 21 features |
| Desktop App | NOT YET CREATED | Phase 6 — Tauri wrapper |
| Credit Economy | NOT YET CREATED | Phase 4 — credit deduction + metering |
| Affiliate/Wholesale Engine | NOT YET CREATED | Phase 4 — FTC badges + tracked redirects |

## 8. MULTI-PLATFORM STRATEGY (V1 §H)

- **Web:** React + Vite (primary runtime). NOT Next.js.
- **Desktop:** Tauri shell wrapping same React+Vite build (Phase 6).
- **Mobile:** Flutter app using same Supabase API contracts (Phase 6).
- **Shared:** Supabase schema/RLS/edge functions, `intelligence-core` TS package, Pearl Mineral V2 tokens.
- **Goal:** 96%+ reuse of logic and contracts.

## 9. TECH BASELINE UPGRADE (V1 §E — "Surgical Upgrade")

Current → Target (total effort: ~1 working day):

| Package | Current | Target | Effort |
|---|---|---|---|
| React | 18.3 | 19.x | ~2 hours |
| Vite | 5.4 | 6.x | ~1 hour |
| TypeScript | 5.5 (strict ON, some `any` debt) | 5.5 strict + `noExplicitAny` | ~3-5 hours |
| TanStack Query | not yet | v5 (standardize all data fetching) | Phase 3 |
| Tailwind | 3.4 | **Stay on 3.4** (Tailwind 4 deferred) | — |
| Sentry | not yet | Web + edge | Phase 3 |

---

*Per `docs/command/SOCELLE_RELEASE_GATES.md` §9: Zero undiscovered directories. All paths cited. DEMO vs LIVE marked per surface.*
