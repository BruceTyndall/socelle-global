# SOCELLE MASTER EXECUTION PLAN

## Overview
This document outlines the parallel execution strategy for all non-Intelligence Hubs.
INTELLIGENCE HUB: **EXTERNAL AGENT — DO NOT TOUCH** (No changes permitted in `src/components/intelligence/`, `src/pages/intelligence/`, `src/lib/intelligence/` or any `INTEL-*` WOs).

## Hub-Based Work Streams & Agent Objectives

### Block A (Parallel Execution)

#### AGENT-CRM
**Objectives:**
1. **DEBT-MONETIZATION-01 (P0):** Close `ai-shopping-assistant` credit gate bypass — route through `ai-orchestrator`.
2. **CRM-POWER-01 (P1):** Implement signal-attributed timeline markers in CRM UI.
3. **CRM-POWER-02 (P1):** Wire rebooking engine CTA to `churn_risk_score`.
4. **CRM-CONSENT-01 (P1):** Build 1-click consent audit modal with `agreed_at` and `source IP` in timeline.

#### AGENT-SALES
**Objectives:**
1. **SALES-POWER-01 (P1):** Make signal-influenced deals visible in pipeline UI and RevenueAnalytics.
2. **SALES-AUTOFILL-01 (P2):** Auto-fill proposal builder inputs based on context from the triggering signal.

#### AGENT-MARKETING
**Objectives:**
1. **ROUTE-CLEANUP-01 (P0):** Consolidate `/portal/marketing` and `/portal/marketing-hub`. Single `/plans` pricing route. Remove orphan routes.
2. **MKT-POWER-01 (P1):** Build the Signal → Campaign CTA to complete Journey #8.

#### AGENT-EDUCATION
**Objectives:**
1. **EDU-POWER-01 (P1):** Build course player full states (loading/error/empty) to clear Category C shell violations.
2. **EDU-CE-EXPIRY-01 (P1):** Add CE credits expiration warnings to the Education dashboard.

#### AGENT-COMMERCE
**Objectives:**
1. **COMMERCE-POWER-01 (P1):** Enforce affiliate links via wrapper; make FTC badges DB-driven.
2. **COMMERCE-PROCURE-01 (P1):** Create intelligence-informed procurement alerts based on market demand reorder logic.

#### AGENT-ADMIN
**Objectives:**
1. **ADMIN-POWER-01 (P1):** Build unified system health dashboard merging feeds, API status, feature flags, and audit log into a single view.

---

### Block B (Sequential Execution after Block A)

#### AGENT-CMS
**Objectives:**
1. **CMS-POWER-01 (P1):** Automate feeds-to-drafts pipeline and editorial approval workflow (draft → review → approve → publish) with `review_status` gating.

#### AGENT-SITE
**Objectives:**
1. **SITE-POWER-01 (P1):** Restructure persona CTA hierarchy and resolve route fixes (pricing, home orphans).
2. **SITE-ONBOARD-01 (P1):** Build in-app onboarding flow (Identity Scan → Shadow Audit → Signal Match → Gate).

#### AGENT-MOBILE
**Objectives:**
1. **MOBILE-POWER-01 (P1):** Enforce `MODULE_*` entitlement gates inside Flutter screens.
2. **MOBILE-PUSH-01 (P2):** Implement push notification handlers for high-priority signals and rebooking warnings.

---

## Dependency Graph
1. **P0 Blockers:**
   - `DEBT-MONETIZATION-01` blocks CRM flows.
   - `ROUTE-CLEANUP-01` blocks Marketing and Site alignment.
2. **Block A → Block B:**
   - `ADMIN-POWER-01` (System Health) must stabilize before `CMS-POWER-01` introduces automated feeds-to-drafts telemetry.
3. **Cross-Hub Limitations:**
   - Any signal passing MUST read from DB / use Intelligence hooks. DO NOT modify Intelligence hooks themselves.

## Verification Protocol
Every agent must:
1. List every file to create/modify.
2. Run `npx tsc --noEmit` and `npm run build` locally.
3. Produce `docs/qa/verify_[WO-ID].json` as proof.
4. Update `build_tracker.md` row to COMPLETE.
