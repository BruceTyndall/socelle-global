# SPLIT-WO CLUSTER — HUB & APP PACKAGING

**Project:** SOCELLE GLOBAL — SOCELLE-WEB  
**Date:** 2026-03-13  
**Authority:** `/.claude/CLAUDE.md` §2–§4, §11; `docs/command/SOCELLE_ENTITLEMENTS_PACKAGING.md` §4–§7; `docs/command/SOCELLE_MONOREPO_MAP.md` §1–§3; `docs/command/MODULE_BOUNDARIES.md` §9–§23; `SOCELLE_MASTER_BUILD_WO.md` Phase table; `SOCELLE-WEB/docs/build_tracker.md` P1/P2 queues; `SOCELLE-WEB/MASTER_STATUS.md` PUBLIC/PORTAL/ADMIN sections.

---

## 0. Purpose and scope

This document defines a **first-class SPLIT-* WO cluster** for preparing hubs/apps to operate in a **turn‑on / turn‑off subscription model** without losing any existing work or requirements.

- **Split mode (chosen):** **B) Multi-app repo packaging** (per `MODULE_BOUNDARIES.md` lines 214–221):
  - Single shared schema and entitlement/credit system (Supabase + edge functions).
  - Multiple app entrypoints: SOCELLE‑WEB (Vite), mobile (Flutter), desktop (Tauri), marketing site (Next.js).
  - Hubs remain logical modules within SOCELLE‑WEB but can be **packaged and exposed as separate apps** (entrypoints and bundles) over time.

The SPLIT-* cluster is **required** because:

- Hub boundaries and entitlement rules already exist (`SOCELLE_ENTITLEMENTS_PACKAGING.md`, `MODULE_BOUNDARIES.md`, `SOCELLE_MONOREPO_MAP.md`),  
  **but** there is no single WO family that:
  - Confirms each hub’s surfaces are fully enumerated,
  - Ensures turn‑on/turn‑off behaviour is consistent across web, mobile, and desktop,
  - And prepares packaging for future independent deployment, **without** rewriting the architecture.

This cluster does **not** create new features; it **organizes and packages existing ones** into explicit, verifiable units.

---

## 1. SPLIT WOs — IDs, scopes, success criteria

### 1.1 SPLIT-INTEL-01 — Intelligence Hub packaging

- **WO ID:** `SPLIT-INTEL-01`  
- **Scope boundaries:**
  - **Routes:**
    - Public: `SOCELLE-WEB/src/pages/public/Intelligence.tsx`, `/intelligence`.
    - Public supporting: `Home.tsx` (`/home`, intelligence hero), `Insights.tsx` (`/insights` redirect).
    - Business portal: `SOCELLE-WEB/src/pages/business/IntelligenceHub.tsx`, `/portal/intelligence`.
    - Brand portal: `SOCELLE-WEB/src/pages/brand/BrandIntelligenceHub.tsx`, `/brand/intelligence`.
    - Admin: `SOCELLE-WEB/src/pages/admin/IntelligenceDashboard.tsx`, `/admin/intelligence`.
  - **Components:**
    - `SOCELLE-WEB/src/components/intelligence/*` (signal cards, tables, filters, detail panels).
    - `SOCELLE-WEB/src/components/analytics/*` KPIs directly tied to intelligence.
  - **Lib / hooks:**
    - `SOCELLE-WEB/src/lib/intelligence/*` (useIntelligence, useSignalImage, useDataFeedStats, etc.).
    - `SOCELLE-WEB/src/lib/intelligence/*` TanStack Query hooks (no raw supabase).
  - **Data:**
    - Tables and views: `market_signals`, `data_feeds`, `rss_items`, `rss_sources` (per `SOCELLE_MONOREPO_MAP.md` and `API_LOGIC_MAP`).
  - **Entitlements:**
    - Intelligence unlock rules from `SOCELLE_ENTITLEMENTS_PACKAGING.md` §4 (Intelligence Hub, Brand Intelligence, Jobs Intelligence).
- **Success criteria (what “packaged” means):**
  - All Intelligence UI surfaces are **enumerated** in this doc under SPLIT‑INTEL‑01.
  - All public, portal, brand, and admin Intelligence routes:
    - Use `useIntelligence` and associated hooks (no raw `supabase.from('market_signals')` lingering per DEBT‑11).
    - Display LIVE/DEMO badges correctly (per `live-demo-detector` and `PRODUCT_SURFACE_AUDIT.md`).
  - Entitlement and credit logic:
    - For each Intelligence surface, a single source of entitlements is documented (`useEntitlement` + RLS from `SOCELLE_ENTITLEMENTS_PACKAGING.md` §7).
  - Packaging readiness:
    - Route map (`SOCELLE-WEB/docs/qa/route_map.json`) shows a clear Intelligence route cluster that can be mapped to a dedicated app entrypoint in future (e.g. `/apps/intel`).
- **Proof pack requirements:**
  - `SOCELLE-WEB/docs/qa/verify_SPLIT-INTEL-01_<timestamp>.json` containing:
    - Route manifest snapshot (filter: Intelligence routes).
    - Results from `intelligence-hub-api-contract`, `live-demo-detector`, `entitlement-validator`.
    - Link to updated `SPLIT_WO_CLUSTER.md` section confirming boundaries and checks.

### 1.2 SPLIT-CRM-01 — CRM Hub packaging

- **WO ID:** `SPLIT-CRM-01`  
- **Scope boundaries:**
  - **Routes:**
    - `SOCELLE-WEB/src/pages/business/Crm*.tsx`, `/portal/crm`, `/portal/crm/consent`, relevant CRM detail routes defined in `App.tsx`.
  - **Components:**
    - CRM‑specific components under `src/components/*` (contact lists, timelines, consent tables).
  - **Lib / hooks:**
    - `SOCELLE-WEB/src/lib/crm/*` (if present), RLS / hooks touching `crm_contacts`, `crm_consent_log`, `crm_churn_risk`.
  - **Data:**
    - Tables: `crm_contacts`, `crm_consent_log`, `crm_churn_risk`, and any related views (per `SOCELLE_MONOREPO_MAP.md`).
  - **Entitlements:**
    - Roles and tiers that unlock CRM behaviours (e.g., Brand CRM Studio add‑on from `SOCELLE_ENTITLEMENTS_PACKAGING.md` §3–§4).
- **Success criteria:**
  - All CRM routes and data hooks are listed in this SPLIT section.
  - `useEntitlement` mapping shows which roles/tiers can see CRM surfaces and which actions they can take.
  - CRM WOs (CRM‑WO‑0x) from `build_tracker.md` and `SOCELLE_MASTER_BUILD_WO.md` are traced to the same files/routes, with no orphaned CRM features.
  - CRM can conceptually be moved to its own bundle/entrypoint (e.g. `/apps/crm`) without crossing module boundaries (no direct cross‑hub imports violating `MODULE_BOUNDARIES.md`).
- **Proof pack requirements:**
  - `docs/qa/verify_SPLIT-CRM-01_<timestamp>.json`:
    - Route manifest subset for CRM.
    - `hub-shell-detector` report confirming no CRM shells (beyond explicitly open ones).
    - `entitlement-validator` results for CRM routes/components.

### 1.3 SPLIT-EDU-01 — Education Hub packaging

- **WO ID:** `SPLIT-EDU-01`  
- **Scope boundaries:**
  - **Routes:**
    - Public: `SOCELLE-WEB/src/pages/public/Education.tsx`, `/education`, `/education/:course`.
    - Portal: `SOCELLE-WEB/src/pages/business/EducationDashboard.tsx`, `/portal/education`.
  - **Components:**
    - `src/components/education/*` (CoursePlayer, quiz components, CE credits views).
  - **Lib / hooks:**
    - `src/lib/education/*` (useCECredits, course hooks).
  - **Data:**
    - Tables: `brand_training_modules`, `course_enrollments`, `certificates` and any education/quiz tables.
  - **Entitlements:**
    - Education Studio and Education Academy entitlements from `SOCELLE_ENTITLEMENTS_PACKAGING.md` §2–§4.
- **Success criteria:**
  - Education routes and components fully enumerated under SPLIT‑EDU‑01.
  - DEMO vs LIVE labelling enforced (stats vs live modules) with `live-demo-detector` PASS.
  - CE credit journeys (public → portal) are mapped and matched to EDU‑WO‑0x in `build_tracker.md`.
- **Proof pack requirements:**
  - `docs/qa/verify_SPLIT-EDU-01_<timestamp>.json`:
    - Education routes, entitlement checks, and LIVE/DEMO badges.
    - `authoring-core-schema-validator` and `loading-skeleton-enforcer` runs on Education pages.

### 1.4 SPLIT-COMMERCE-01 — Commerce / Procurement packaging

- **WO ID:** `SPLIT-COMMERCE-01`  
- **Scope boundaries:**
  - **Routes:**
    - Public: `Cart.tsx`, `/cart` and product/shop surfaces under `/public/*`.
    - Portal: `/portal/procurement`, `/brand/products`, `/brand/orders`, relevant commerce‑related pages.
  - **Components:**
    - Product cards, cart, procurement dashboards, affiliate badges (`ProductCard`, `AffiliateDisclosureBadge`, etc.).
  - **Lib / hooks:**
    - `src/lib/useCart.ts`, `src/lib/commerce/*`, any pricing/plan helpers tied to entitlements.
  - **Data:**
    - `products`, `orders`, `affiliate_clicks`, `subscription_plans` tables and related RPCs.
  - **Entitlements:**
    - E‑commerce and wholesale entitlements from `SOCELLE_ENTITLEMENTS_PACKAGING.md` §4 (Ecommerce mini‑app).
- **Success criteria:**
  - All commerce routes/components/hook files are assigned to SPLIT‑COMMERCE‑01.
  - FTC compliance paths (affiliate badges, disclosures) are clearly documented and validated by `affiliate-link-checker` and `affiliate-link-tracker-auditor`.
  - PAY/COMMERCE WOs in `build_tracker.md` are directly traceable to files in this scope.
- **Proof pack requirements:**
  - `docs/qa/verify_SPLIT-COMMERCE-01_<timestamp>.json`:
    - Commerce route subset from `route_map.json`.
    - `affiliate-link-checker`, `affiliate-link-tracker-auditor`, `entitlement-validator` reports.

### 1.5 SPLIT-ADMIN-01 — Admin / Control plane packaging

- **WO ID:** `SPLIT-ADMIN-01`  
- **Scope boundaries:**
  - **Routes:** All `/admin/*` routes per `SOCELLE-WEB/MASTER_STATUS.md` lines 114–121:
    - Admin dashboard, system health, feeds, CMS admin, user management, feature flags, audit log, etc.
  - **Components:**
    - Admin health widgets, feed dashboards, feature flag UI, audit log tables.
  - **Lib / hooks:**
    - Admin‑specific hooks under `src/lib/*` (system health, API registry, feature flags).
  - **Data:**
    - `platform_health`, `api_registry`, `api_route_map`, `audit_log`, `feature_flags` tables.
- **Success criteria:**
  - All admin/control‑plane codepaths are grouped under SPLIT‑ADMIN‑01 and can be wired to a dedicated admin app entrypoint (or continue as `/admin` routes) without crossing boundaries.
  - Control plane WOs (CTRL‑WO‑0x, ADMIN‑WO‑0x, system‑health WOs) map 1‑to‑1 to this cluster.
  - `system-health-dashboard-validator`, `feature-flag-validator`, `audit-log-auditor` PASS on these surfaces.
- **Proof pack requirements:**
  - `docs/qa/verify_SPLIT-ADMIN-01_<timestamp>.json`:
    - Admin routes + health metrics coverage.
    - Skills run logs and status for the three validators above.

### 1.6 SPLIT-SALES-01 — Sales Hub packaging

- **WO ID:** `SPLIT-SALES-01`  
- **Scope boundaries:**
  - **Routes:**
    - Business portal Sales hub surfaces (e.g. `/portal/sales`, deals pipeline, revenue analytics), as listed in `SOCELLE-WEB/MASTER_STATUS.md` hub upgrades (lines 44–47).  
  - **Components:**
    - Sales‑specific components (OpportunityFinder, ProposalBuilder, Sales analytics views).  
  - **Lib / hooks:**
    - Any hooks and services under `src/lib/*` that are Sales‑only (deals, pipelines, revenue metrics).  
  - **Data:**
    - Tables/FKs: `sales_deals` (and related `signal_id` columns), any sales‑specific views used by Sales WOs.
  - **Entitlements:**
    - Sales Studio and Sales mini‑app entitlements from `SOCELLE_ENTITLEMENTS_PACKAGING.md` §3–§4.
- **Success criteria:**
  - All Sales routes/components/hooks/tables are enumerated under this SPLIT section.  
  - SALES‑WO‑0x in `SOCELLE_MASTER_BUILD_WO.md` and `build_tracker.md` map cleanly to this cluster.  
  - Entitlement and credit logic for Sales features is documented and validated via `entitlement-validator`.  
  - Route map shows Sales surfaces grouped such that they could be exposed as a dedicated Sales app entrypoint without violating `MODULE_BOUNDARIES.md`.
- **Proof pack requirements:**
  - `docs/qa/verify_SPLIT-SALES-01_<timestamp>.json`:
    - Sales route subset in route map.  
    - `hub-shell-detector`, `live-demo-detector`, and `entitlement-validator` reports scoped to Sales.

### 1.7 SPLIT-MKT-01 — Marketing Hub + Marketing Studio packaging

- **WO ID:** `SPLIT-MKT-01`  
- **Scope boundaries:**
  - **Routes:**
    - Business portal marketing surfaces: `/portal/marketing`, `/portal/marketing-hub/*`, and any Marketing Studio routes, as referenced in `MASTER_STATUS.md` and `PRODUCT_SURFACE_AUDIT.md` (DEBT‑03b).  
  - **Components:**
    - Campaign builder, marketing calendar, audience selection, and marketing analytics views.  
  - **Lib / hooks:**
    - Marketing‑specific hooks and services under `src/lib/*` (campaigns, marketing plans, studio hooks).  
  - **Data:**
    - Tables/views backing marketing campaigns and audiences (e.g. campaign tables, segments).  
  - **Entitlements:**
    - Marketing Studio and Marketing mini‑app entitlements in `SOCELLE_ENTITLEMENTS_PACKAGING.md` §3–§4.
- **Success criteria:**
  - All marketing and Marketing Studio routes/components/hooks/tables are grouped under SPLIT‑MKT‑01.  
  - MKT‑WO‑0x in `SOCELLE_MASTER_BUILD_WO.md` and `build_tracker.md` can be traced to these assets.  
  - DEBT‑03b (dual marketing routes) and DEBT‑04 (Brand→Signal→Campaign) are referenced so SPLIT‑MKT‑01 does not hide those debts; instead it makes their resolution a prerequisite for “packaged” status.  
  - Entitlement and LIVE/DEMO behaviour are consistent across marketing surfaces.
- **Proof pack requirements:**
  - `docs/qa/verify_SPLIT-MKT-01_<timestamp>.json`:
    - Marketing route subset.  
    - `hub-shell-detector`, `live-demo-detector`, `cta-validator`, and `entitlement-validator` results.

---

## 2. Cross-cutting SPLIT rules

Regardless of hub, every SPLIT‑* WO must:

1. **Respect entitlements and packaging model**
   - Hub unlock rules from `SOCELLE_ENTITLEMENTS_PACKAGING.md` §4 must be **enforced and documented**:
     - Each SPLIT‑* WO must list which mini‑apps it covers and which tiers/roles can “turn on” that package.
2. **Preserve LIVE/DEMO labelling**
   - `live-demo-detector` and `live-demo-component-enforcer` must be part of the proof pack:
     - No new “fake live” surfaces introduced as a result of split.
3. **Avoid cross‑boundary imports**
   - Cross‑hub code sharing must go through shared modules (`src/lib/*`, `packages/ui`) and respect `MODULE_BOUNDARIES.md` (§192–§247).
4. **Stay deployment‑agnostic in this phase**
   - SPLIT‑* WOs in this cluster **stop at packaging + documentation**:
     - They prepare, but do **not** yet change, deployment units.
   - Any deployment‑specific split (separate deploys per hub) would require an explicit new WO family (e.g. `DEPLOY-SPLIT-*`), approved separately.

---

## 3. Why SPLIT-* cluster is required

Per the lost‑WO audit (`SOCELLE-WEB/docs/ops/SPLIT_AUDIT__LOST_WO_REPORT.md`) and coverage matrix (`SPLIT_AUDIT__WO_COVERAGE_MATRIX.md`):

- All major hub requirements (Intelligence, CRM, Education, Commerce, Admin, etc.) **already have** WOs and execution status.
- What is missing is a **single, enforceable work‑order cluster** that:
  - Connects documented hub boundaries and entitlement rules,
  - With actual route/module structure,
  - And prepares those hubs to be flipped on/off as modular apps in a subscription model.

Therefore:

- **SPLIT-* cluster is required** to:
  - Prevent future “soft” split work that bypasses governance.
  - Ensure each hub’s split readiness is tied to explicit success criteria and proof packs.
  - Make the split plan **evidence‑based and WO‑complete**, not ad‑hoc.

No new product scope is invented here; SPLIT‑* WOs simply package and verify what is already defined in Tier‑0/1 docs and implemented in code.

