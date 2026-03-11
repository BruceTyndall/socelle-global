# SOCELLE V3 BUILD PLAN — CMS-First Platform Build

> **Superseded for phase order and WO list by:** `SOCELLE-WEB/docs/command/CONSOLIDATED_BUILD_PLAN.md`. Use this doc only for **WO-CMS-01..06 substep detail** (§8). Execution status = build_tracker.md + verify_*.json.
>
> Authority: `/.claude/CLAUDE.md` → CONSOLIDATED_BUILD_PLAN.md  
> Created: 2026-03-08 | Updated: 2026-03-13 (consolidation)  
> Status: Phase order and WO list → CONSOLIDATED_BUILD_PLAN; this file = CMS WO substeps only.

---

## ⛔ §0 — SCOPE CLARIFICATION (CRITICAL)

**V2-TECH-01 through V2-TECH-07 are ALL COMPLETE and FROZEN.** Do not continue with any further V2-TECH tasks unless explicitly required as part of a CMS work order (e.g., types regen after CMS migrations = part of WO-CMS-01, not a separate V2-TECH item).

**From this point forward, the ONLY priorities are:**
1. The V3 internal CMS plan (SOCELLE CMS on Supabase)
2. Hub-by-hub V3 upgrades and user journeys (after CMS is live)

**Treat the internal SOCELLE CMS as another first-class hub (CMS Hub) and the backbone for content across the entire platform.**

**Do NOT touch:** V2-INTEL, V2-HUBS, V2-MULTI, V2-LAUNCH, W11, W12, or WAVE OVERHAUL items until all WO-CMS work orders are complete.

---

## §1 — Vision

SOCELLE V3 treats the **CMS as a first-class hub** — not an afterthought bolted on after launch. Every hub that displays content (Intelligence briefs, Education courses, Marketing campaigns, Blog/Stories, Brand pages) reads from a unified `cms_*` table set on Supabase. This eliminates hardcoded copy, enables admin-managed content, and makes every surface LIVE by default.

**One-liner:** "If it's words on screen, it comes from the CMS."

---

## §2 — Master Prompt (CMS-First Direction)

### Platform Identity

SOCELLE is a B2B intelligence platform for the professional beauty and medspa industry. Intelligence platform FIRST. Marketplace second. Always.

### CMS as Internal Headless CMS

- Built on Supabase (`cms_*` tables), not WordPress/Contentful/Sanity.
- Admin-managed via `/admin/cms/*` routes.
- Public-facing via `PageRenderer` component that reads `cms_pages` + `cms_blocks`.
- No external CMS dependency. No vendor lock-in. Full RLS control.

### CMS Table Set

| Table | Purpose |
|-------|---------|
| `cms_spaces` | Tenant/hub isolation (e.g., "blog", "education", "marketing", "intelligence") |
| `cms_pages` | Page records with slug, space_id, status (draft/published/archived), SEO fields |
| `cms_blocks` | Reusable content blocks (hero, text, CTA, image, video, embed, code, FAQ, testimonial) |
| `cms_page_blocks` | Junction: page → blocks with position ordering |
| `cms_posts` | Blog/story/brief entries (extends cms_pages with author, category, tags, reading_time) |
| `cms_assets` | Media library records (Supabase Storage refs, alt text, dimensions, mime) |
| `cms_docs` | Internal documentation entries (help articles, changelogs, release notes) |
| `cms_templates` | Page templates (landing page, article, hub index, detail page) |

### RLS Model

- `cms_spaces`: admin read/write, public read (published only)
- `cms_pages`: admin read/write, public read WHERE status = 'published'
- `cms_blocks`: admin read/write, public read (blocks belonging to published pages)
- `cms_posts`: admin read/write, public read WHERE status = 'published'
- `cms_assets`: admin read/write, public read
- `cms_docs`: admin read/write, authenticated read
- `cms_templates`: admin read/write only

---

## §3 — All-Hubs Requirements

Every hub must satisfy the anti-shell rule (V1 §D) AND integrate with CMS for its content surfaces.

### Intelligence Hub
- 10 modules wired to live `market_signals` data
- AI briefs stored as `cms_posts` (space = "intelligence")
- Signal explanations and category descriptions from `cms_blocks`
- Intelligence reports rendered via `PageRenderer` from `cms_pages`

### Jobs Hub
- Job postings from `job_postings` table (existing)
- Job market insights and career guides as `cms_posts` (space = "jobs")
- Employer branding pages via `cms_pages`

### CRM Hub
- Contact/company CRUD from CRM tables
- CRM help articles from `cms_docs`
- Onboarding guides as `cms_pages` (space = "crm")

### Education Hub
- Courses/modules from education tables (existing)
- Course descriptions, learning objectives as `cms_blocks`
- Blog-style education articles as `cms_posts` (space = "education")
- Certificate templates referencing `cms_templates`

### Marketing Hub
- Campaign content (email/social/landing) authored in `cms_blocks`
- Landing pages built from `cms_templates` + `cms_page_blocks`
- Marketing calendar entries reference `cms_posts` for content

### Sales Hub
- Sales playbooks and scripts as `cms_docs` (space = "sales")
- Proposal templates from `cms_templates`
- Case studies as `cms_posts` (space = "sales")

### Commerce Hub
- Product descriptions remain in `products` table (not CMS)
- Collection/category landing pages via `cms_pages` (space = "commerce")
- Buying guides as `cms_posts` (space = "commerce")

### Admin Hub
- All CMS admin screens live here (`/admin/cms/*`)
- Page editor, block editor, template manager, media library, space manager
- Settings and configuration docs from `cms_docs`

### Authoring Studio
- Rich block editor for `cms_blocks` (WYSIWYG-like, block-based)
- Preview mode showing `PageRenderer` output
- Version history on `cms_pages` (draft → published → archived)
- Collaboration: assigned author, review status

### CMS Hub (the hub itself)
- Space management (create/configure spaces)
- Global content search across all spaces
- Content analytics (views, engagement per page/post)
- Bulk operations (publish/archive/delete)
- SEO audit view (missing meta, missing OG, missing schema)

---

## §4 — User Outcomes & Timing

### Persona Success Criteria

| Persona | V3 Success = | Measurement |
|---------|-------------|-------------|
| Operator | Can read intelligence briefs, browse education content, book services — all from CMS-managed pages | Time-to-first-value < 5 minutes from signup |
| Provider | Finds career intelligence, education articles, protocol guides — all CMS-rendered | Content freshness < 7 days on home feed |
| Brand | Sees brand health content, marketing templates, buyer guides — CMS-managed | Admin can publish new brand page in < 10 minutes |
| Student | Accesses learning content, career guides, certification info — CMS-backed | 100% of education content editable via admin |

### Execution Expectations

| Phase | Scope | Estimate |
|-------|-------|----------|
| Phase 0 | Documentation: CMS_ARCHITECTURE, CMS_CONTENT_MODEL, JOURNEY_STANDARDS | 1 session |
| Phase 1 | CMS Schema + RLS (WO-CMS-01) | 1 session |
| Phase 2 | CMS Client hooks + PageRenderer (WO-CMS-02, WO-CMS-04) | 1-2 sessions |
| Phase 3 | CMS Hub UI + Authoring (WO-CMS-03, WO-CMS-05) | 2-3 sessions |
| Phase 4 | Hub integrations (WO-CMS-06) | 2-3 sessions |

### V3 vs Previous Builds

| Aspect | Previous | V3 |
|--------|----------|-----|
| Content management | Hardcoded arrays, mock data, inline strings | CMS-managed, admin-editable, versioned |
| Page creation | Developer writes TSX | Admin selects template, adds blocks, publishes |
| Content freshness | Stale until deploy | Updated via admin panel, instant |
| Multi-hub content | Each hub has its own content system | Unified CMS with space isolation |
| LIVE/DEMO | Manual labeling | CMS pages are LIVE by default (DB-backed) |

---

## §5 — Phases

### Phase 0 — Documentation (current)
- `CMS_ARCHITECTURE.md` — system design, table relationships, RLS model
- `CMS_CONTENT_MODEL.md` — content types, block types, template specs
- `JOURNEY_STANDARDS.md` — per-hub user journey definitions
- No code changes.

### Phase 1 — CMS Schema & RLS (WO-CMS-01)
- Supabase migrations for all `cms_*` tables
- RLS policies per table
- Indexes for slug lookups, space filtering, published status
- `database.types.ts` regeneration

### Phase 2 — CMS Client & Hooks (WO-CMS-02)
- `useCmsPages`, `useCmsBlocks`, `useCmsPosts`, `useCmsAssets` hooks (TanStack Query)
- `useCmsSpace` for space-scoped queries
- All hooks follow existing patterns: `isLive`, `enabled: isSupabaseConfigured`, 42P01 handling

### Phase 3 — CMS Hub UI (WO-CMS-03)
- `/admin/cms` — CMS dashboard
- `/admin/cms/pages` — page list + CRUD
- `/admin/cms/posts` — post list + CRUD
- `/admin/cms/blocks` — block library
- `/admin/cms/media` — media library (Supabase Storage)
- `/admin/cms/templates` — template manager
- `/admin/cms/spaces` — space configuration

### Phase 4 — PageRenderer & Public Pages (WO-CMS-04)
- `PageRenderer` component that reads `cms_pages` + `cms_page_blocks` + `cms_blocks`
- Public route: `/pages/:slug` renders CMS pages
- Blog route: `/blog/:slug` renders CMS posts
- SEO: Helmet meta from `cms_pages.seo_*` fields, JSON-LD from template type

### Phase 5 — Authoring Studio + CMS Integration (WO-CMS-05)
- Rich block editor in Authoring Studio
- Preview mode
- Version history (draft/published/archived status transitions)
- Assigned author + review workflow

### Phase 6 — Hub Integrations & Journeys (WO-CMS-06)
- Wire Intelligence briefs to `cms_posts` (space = "intelligence")
- Wire Education content to `cms_posts` (space = "education")
- Wire Marketing landing pages to `cms_pages` (space = "marketing")
- Wire Sales playbooks to `cms_docs` (space = "sales")
- Wire all remaining hub content surfaces to CMS

---

## §6 — Non-Negotiables

1. **No external CMS.** All content lives in Supabase `cms_*` tables.
2. **RLS on everything.** Public reads published only. Admin reads/writes all.
3. **LIVE by default.** CMS content is DB-backed = LIVE. No DEMO labeling needed for CMS surfaces.
4. **Block-based.** Pages are composed of blocks, not monolithic HTML blobs.
5. **Space isolation.** Each hub's content lives in its own space. No cross-contamination.
6. **SEO-first.** Every CMS page has title, description, OG image, canonical URL, JSON-LD.
7. **TanStack Query.** All CMS hooks use `useQuery`/`useMutation`. No raw `useEffect` for data fetching.
8. **Anti-shell.** CMS Hub itself must satisfy all 10 anti-shell requirements.

---

## §7 — Stop Conditions

Agents HALT and escalate if:
- CMS tables are created without RLS policies
- PageRenderer renders without checking `status = 'published'`
- Content is hardcoded instead of read from `cms_*` tables
- CMS admin routes lack auth guards
- Blocks are stored as raw HTML instead of structured JSON
- Media uploads bypass Supabase Storage

---

---

## §8 — Detailed WO Execution Specs

### WO-CMS-01: Schema & RLS (Substeps)
1. Implement add-only migrations for: `cms_spaces`, `cms_pages`, `cms_blocks`, `cms_page_blocks`, `cms_posts`, `cms_assets`, `cms_docs`, `cms_templates` — exactly as defined in `CMS_CONTENT_MODEL.md`.
2. Update `database.types.ts` with strongly typed `cms_*` definitions. Only do type regen if required for CMS — do NOT treat this as a separate V2-TECH goal.
3. Add RLS policies: tenant isolation via `tenant_id`, role-based access (admin/editor/viewer), published vs draft access for public vs authenticated users.
4. Run skills and record outputs in `docs/qa/`: `schema-db-suite`, `rls-auditor`, `db-inspector`, `migration-validator`, `schema-drift-detector`. Fix all P0 issues.

### WO-CMS-02: CMS Client & Hooks (Substeps)
1. Create `src/lib/cms/client.ts` — typed Supabase client functions for all `cms_*` tables, shared error handling, LIVE/DEMO awareness.
2. Refactor content hooks to use CMS via TanStack Query v5: `useBlogPosts → cms_posts`, `useCmsPage → cms_pages + cms_page_blocks + cms_blocks`, `useContentTemplates → cms_templates`, `useMediaLibrary → cms_assets`.
3. Maintain: LIVE/DEMO labels, standard error/empty/loading states, strict TypeScript (no `any`).
4. Replace hardcoded surfaces listed in `HARD_CODED_SURFACES.md` with CMS-backed equivalents where possible; log remaining TODOs.

### WO-CMS-03: CMS Hub UI (Substeps)
1. Define CMS Hub as a peer hub (like Intelligence, CRM, etc.) with routes per `GLOBAL_SITE_MAP.md`.
2. Implement: Pages Library (CRUD), Blocks Library (CRUD, type-safe editors, usage refs), Page Composition (ordering + region + preview), Posts/Stories Library (CRUD, signal_ids), Media Library (CRUD, license metadata), Docs Library (CRUD), Templates Library (CRUD).
3. Enforce NO SHELL on all CMS Hub pages: real `cms_*` queries, full list+detail+create+edit+delete/archive, RLS-aware, exports, error logging visible in Admin Hub.
4. Run: `hub-shell-detector` = 0, `route-mapper` alignment, `seo-audit`, `copy-quality-suite`.

### WO-CMS-04: PageRenderer & Public Pages (Substeps)
1. `PageRenderer` input: `cms_pages` + `cms_page_blocks` + `cms_blocks`. Output: composed modules per `MODULE_BOUNDARIES.md` + Figma specs.
2. Respect Pearl Mineral V2 tokens, layout, responsive behavior.
3. Migrate pages to CMS-driven: Home, ForBrands, ForMedspas, ForSalons, Pricing, HowItWorks, RequestAccess, StoriesIndex/StoryDetail, brand content surfaces.
4. Run: `playwright-crawler`, `visual-regression-checker`, `seo-audit`.

### WO-CMS-05: Authoring Studio + CMS Integration (Substeps)
1. Rich block editor in Authoring Studio. Preview mode via PageRenderer. Version history (draft/published/archived). Assigned author + review status.

### WO-CMS-06: Hub Integrations & Journeys (Substeps)
1. Wire Intelligence briefs → `cms_posts` (space="intelligence"). Education → `cms_posts` (space="education"). Marketing landing pages → `cms_pages` (space="marketing"). Sales playbooks → `cms_docs` (space="sales"). All remaining hub content surfaces to CMS.
2. For each hub, implement at least one full user journey per `JOURNEY_STANDARDS.md`: entry route, core steps, outcome (data change + user value), Playwright E2E test.

---

## §9 — Global Non-Negotiables (V3)

1. **Intelligence-first IA** — Intelligence platform FIRST; commerce and other hubs SECOND.
2. **NO SHELLS** — every hub and page has real data, actions, RLS, error/empty/loading, exports, observability.
3. **LIVE vs DEMO labels** on ALL data surfaces. No MOCK without a DEMO badge.
4. **Add-only migrations** — full RLS coverage, secrets never logged.
5. **Pearl Mineral V2** — tokens only, no rogue hex, no `font-serif` on public pages.
6. **AI safety + legal framework** enforced on ALL AI endpoints and surfaces.
7. **All work must pass Doc Gate** and produce proof packs.
8. **No external CMS** — all content lives in Supabase `cms_*` tables.

---

## §10 — Final QA, Proof Packs, and Stop Conditions

### Required Skill Runs Before CMS Launch

1. `design-audit-suite` + `copy-quality-suite`
2. `data-integrity-suite` + `schema-db-suite`
3. `billing-payments-suite`
4. `test-runner-suite` (smoke + E2E + crawler)
5. `hub-shell-detector` (must = 0 for CMS Hub)
6. `seo-audit` + `legal-compliance-checker`
7. `proof-pack` (aggregate all QA outputs)

### HALT Conditions (always active)

- Shell page exists (not explicitly DEFERRED and hidden from nav)
- Secrets in committed code
- PAYMENT_BYPASS=true in committed env
- Banned term in user-facing copy
- `font-serif` on public pages
- Intelligence-first IA or ecommerce boundaries violated
- CMS tables created without RLS policies
- PageRenderer renders without checking `status = 'published'`
- Content hardcoded instead of read from `cms_*` tables
- CMS admin routes lack auth guards
- Blocks stored as raw HTML instead of structured JSON
- Media uploads bypass Supabase Storage

---

*Quality and revenue outrank time. Nothing ships average. Intelligence platform first. Always.*
