# PLATFORM PRE-MORTEM: FAILURE MODES AND MITIGATIONS
**The PRO Edit — Brand Discovery & Activation Platform**
*Version 1.0 | February 2026 | Principal Product Design + Architecture Review*

---

## Overview

A pre-mortem asks: "It's 18 months from now. The platform has failed. What killed it?" This document enumerates the most likely failure modes, their likelihood, severity, early warning signals, and concrete mitigations. Every item here must have an owner and a mitigation strategy before launch of the affected feature.

**Severity scale:**
- 🔴 **P0 — Existential:** Platform-destroying if unmitigated. Stops here.
- 🟠 **P1 — Critical:** Material revenue or trust damage. Must fix before scale.
- 🟡 **P2 — Significant:** Conversion or retention impact. Fix within 90 days.
- 🟢 **P3 — Moderate:** Quality degradation. Fix within 180 days.

---

## Failure Mode 1 — Garbage-In Menu Uploads → Garbage-Out Recommendations
**Severity:** 🔴 P0
**Likelihood:** High (this is the primary data input and it's unstructured)

### What Happens
A spa uploads a poorly formatted service menu: "Lux Facial + Nails Combo ($175 — ask front desk for details)". The AI confidently maps this to a 90-minute HydraFacial protocol with 6 SKUs. The business owner follows the recommendation, orders $3,000 in backbar products, and the "protocol" turns out to be completely wrong for their service mix. Trust collapses. Chargeback. Negative review.

### Root Causes
- Current `PlanWizard` has no minimum menu quality check before running analysis
- No validation that extracted services are parseable (length, structure, numeric price)
- No confidence floor on mappings (a 15% confidence match still surfaces as a recommendation)
- No human review gate for low-quality inputs

### Mitigations

| Mitigation | Priority | Implementation |
|---|---|---|
| Menu quality pre-check | P0 | Before running analysis, check: >3 services detected, at least 1 has a price or duration, total text >100 chars. Reject with specific guidance if below threshold. |
| Confidence floor enforcement | P0 | Never surface a mapping with confidence <30%. Show "No Match" instead. Current engine shows candidates regardless of score. |
| Parsed services preview step | P1 | After menu extraction, show user "We found X services. Are these correct?" before running full analysis. Allow edits. |
| Revenue estimate caps | P1 | If estimated uplift >300% of inferred current revenue, flag as "estimate may be inaccurate — please verify assumptions." |
| Low-confidence plan alert | P1 | If overall plan confidence <50%, show warning banner: "Your menu had limited information. Results may be incomplete. [Improve your menu] →" |
| Admin QA queue for low-confidence plans | P2 | Plans with avg confidence <40% auto-queue for human review before outputting activation kit |

### Early Warning Signals
- Reanalyze rate >30% (users finding results wrong)
- Gap analysis → purchase conversion <5% (user doesn't trust the gaps)
- Support tickets about "wrong products recommended"

---

## Failure Mode 2 — Overpromising ROI → Trust Collapse
**Severity:** 🔴 P0
**Likelihood:** Medium-high (revenue simulator is a key conversion tool AND a liability)

### What Happens
The revenue simulator shows "$8,400/month additional revenue" for adding hot stone massage. Business owner upgrades, orders $5,000 in products, trains staff, promotes the service. Three months later: $600/month in hot stone revenue, not $8,400. The business owner is furious. They post about it. The platform gets tagged as a "scam."

### Root Causes
- Revenue model assumes 100% utilization of modeled capacity (unrealistic)
- No disclosure that estimates are projections, not guarantees
- No acknowledgment that staff training, marketing, and implementation take time
- Single-number outputs ("$8,400/month") feel more like promises than estimates

### Mitigations

| Mitigation | Priority | Implementation |
|---|---|---|
| Range outputs, never single numbers | P0 | Display "$4,200 – $8,400/month" (conservative to optimistic) based on utilization sensitivity. Never a single number. |
| Methodology disclosure | P0 | Every revenue estimate must link to an expandable "How we calculate this" section. No exceptions. |
| Conservative default assumptions | P0 | Default utilization: 60% (not 100%). Default attach rate: 25% (not 50%). Label defaults clearly. |
| "Ramp-up" model | P1 | Show Month 1/3/6/12 projections assuming gradual ramp-up (Month 1: 20% of max, Month 3: 50%, Month 6: 80%, Month 12: full). This is more honest and still compelling. |
| Legal disclaimer | P1 | Every simulator output: "These are estimates based on industry benchmarks and your inputs. Actual results depend on implementation, staff training, and local market conditions." |
| Post-purchase tracking | P2 | 90 days after first order, prompt: "How's [Brand X] performing? Track your actual results." Builds feedback loop AND shows platform cares about real outcomes. |

### Early Warning Signals
- Refund requests citing "results not as projected"
- Support tickets comparing simulation to reality
- Churn cohort analysis shows high churn at 90-day mark (post first-order disappointment)

---

## Failure Mode 3 — Brand vs Platform Incentives Misaligned
**Severity:** 🟠 P1
**Likelihood:** Medium

### What Happens
A brand pays for Featured placement, which boosts their protocol match rate in recommendations. Their protocols start appearing in business plans even when they're not the best fit. Business owners act on recommendations, order products that don't serve their clients well, get poor client outcomes, and lose trust in the platform. OR: Brands realize their analytics data is being used to compete against them (platform white-labels their insights to competitor brands).

### Root Causes
- No separation between "organic" recommendation rank and "paid" placement
- No disclosure to businesses that some placements are paid
- Brand subscription revenue creates pressure to favor paying brands in recommendations
- Analytics data from one brand's performance could theoretically inform catalog decisions for another

### Mitigations

| Mitigation | Priority | Implementation |
|---|---|---|
| Algorithmic / paid separation | P0 | Organic recommendations are ALWAYS based on confidence score, never on brand payment tier. Paid placement is ONLY in: (1) brand directory ordering, (2) "Suggested brands" widget, (3) email features. NEVER in the AI match output. |
| Mandatory "Sponsored" labeling | P0 | Any placement product surface must carry "Sponsored" or "Featured Partner" label visible to business users. No exceptions. |
| Brand data firewall | P0 | Brand analytics data is read-only to the brand that owns it. Platform ops cannot use brand-specific data to benefit competitor brands. Audit logging on admin reads of brand analytics. |
| Incentive audit | P1 | Quarterly review: are paid brands getting significantly higher match rates than their catalog quality would justify? If yes, investigate. |
| Brand contract clause | P1 | Brand agreements must specify: "Placement products affect discoverability, not algorithmic match quality." Legal protection AND sets expectation. |

### Early Warning Signals
- Business user complaints about "biased recommendations"
- Brand asks "why is Competitor X appearing in every plan?"
- Internal data shows strong correlation between payment tier and match rate (should be weak/zero)

---

## Failure Mode 4 — Data Leakage Across Tenants
**Severity:** 🔴 P0
**Likelihood:** Low (with proper RLS) but catastrophic if it occurs

### What Happens
A brand admin navigates to their analytics page and can see the number of plans for a specific competitor brand. OR: A business user sees another business's plan in their plan list. OR: A query returns cross-tenant data due to a missing RLS policy. One incident of brand data leakage = immediate contract termination, potential legal action.

### Root Causes
- Current codebase relies entirely on Supabase RLS (no client-side permission verification)
- Admin pages have no explicit `user.role === 'admin'` check — rely solely on RLS
- No automated tests for data isolation
- BrandAdminEditor currently has no user permission check at load

### Mitigations

| Mitigation | Priority | Implementation |
|---|---|---|
| Defense-in-depth: RLS + client checks | P0 | Every data-sensitive query: (1) RLS at DB level, (2) explicit role check in ProtectedRoute, (3) explicit ownership check on data received. Never trust just one layer. |
| Automated tenant isolation tests | P0 | E2E test suite: create 2 businesses, 2 brands, verify zero cross-visibility. Run on every deploy. |
| Admin reads require audit log | P0 | Any admin read of brand/business data must write to `audit_log` table. No silent access. |
| Brand analytics: anonymization layer | P0 | All aggregate metrics returned to brands must pass through anonymization function that removes any identifying information. Code review gate. |
| Penetration test before launch | P1 | Third-party pen test specifically for multi-tenant data isolation. Required before opening to paying brands. |
| Incident response plan | P1 | Define: what to do if leakage is detected. Notification, remediation, legal. Document before needed. |

### Early Warning Signals
- Any support ticket mentioning seeing another business's or brand's data
- Unusual query patterns (brand admin querying multiple brand_ids)
- RLS policy changes without security review

---

## Failure Mode 5 — Catalog Ingestion Drift (SKUs Change, Items Discontinued)
**Severity:** 🟠 P1
**Likelihood:** High (inevitable in any physical product business)

### What Happens
A spa generates a plan in January recommending "HydraLux Serum — $42 wholesale." In July, the brand discontinues that serum and replaces it with "HydraLux Serum Pro — $58 wholesale." The spa's plan still shows the old product. They try to order it, it's unavailable. Or worse: they see the "Pro" version and assume it's a different, more expensive product. Opening order calculations are wrong.

### Root Causes
- No SKU lifecycle management in current data model (no `discontinued_at`, no `replaces_sku_id`)
- No alert system for catalog changes affecting active plans
- `canonical_protocol_step_products` references product IDs that can become stale

### Mitigations

| Mitigation | Priority | Implementation |
|---|---|---|
| SKU lifecycle fields | P1 | Add to `pro_products` + `retail_products`: `status` (active/discontinued/seasonal), `discontinued_at`, `replaces_product_id`, `available_from`, `available_until` |
| Stale plan alerts | P1 | When a product is marked discontinued: find all plans referencing it → send in-app alert "Your plan includes a discontinued product. [Update Plan →]" |
| Catalog change log | P1 | Every product/protocol change by brand admin writes to `brand_catalog_changelog` table. Admins can audit. |
| Plan staleness indicator | P2 | Plans older than 90 days with no reanalysis show "Last analyzed 94 days ago. Brands may have updated their catalog. [Refresh →]" |
| Brand admin catalog completeness score | P2 | Dashboard metric showing % of protocols with complete, active product links. Encourages brands to maintain catalog quality. |
| Automated consistency checks | P2 | Weekly job: find `canonical_protocol_step_products` referencing discontinued products → alert brand admin |

### Early Warning Signals
- Order fulfillment failures due to unavailable SKUs
- Brand admin updating products frequently (normal, but track for plan impact)
- Business users complaining "the product I ordered isn't what was recommended"

---

## Failure Mode 6 — Excessive Complexity → Abandonment
**Severity:** 🟠 P1
**Likelihood:** Medium (the platform is objectively complex — the UX must hide it)

### What Happens
A spa owner uploads their menu, gets to the analysis screen, sees 5 tabs with dense data, a Gap Analysis tab with 12 items and industry jargon ("canonical protocol," "pgvector confidence"), a Revenue Simulator with 8 sliders, and immediately closes the tab. Never comes back.

### Root Causes
- Current PlanResults page has 5 tabs with no opinionated summary of "what matters most"
- Technical language from the engine surfaces in the UI
- No "one thing to do next" guidance after analysis
- Gap Analysis tab shows all gaps equally — no visual hierarchy separating quick wins from complex additions
- Revenue Simulator (not yet built) risks being too complicated

### Mitigations

| Mitigation | Priority | Implementation |
|---|---|---|
| "What to do next" primary CTA | P0 | After analysis, every screen has ONE primary action. Overview tab: "Start with these 3 quick wins →". Never leave the user in analysis paralysis. |
| Plain language everywhere | P0 | Audit every string in the UI for jargon. "Canonical protocol" → "service protocol". "Retail attach recommendation" → "products to recommend after this service". |
| Quick Wins section (above the fold) | P0 | Gap Analysis: First visible section is always "Quick Wins" — max 3 items, low complexity, highest ROI. The rest is below the fold. |
| Progressive complexity | P1 | Revenue Simulator default state: only 3 sliders visible (sessions/week, avg price, retail attach rate). "Advanced assumptions" expander reveals the rest. |
| Onboarding checklist | P1 | New users see a 5-item checklist on their dashboard. Each item has one action. Completion drives activation. |
| "Explain this" tooltips | P1 | Every metric/score has a "?" tooltip with a 1-sentence plain-English explanation. |
| User testing gate | P1 | Before shipping Gap Analysis and Simulator, run 5 unmoderated user tests with actual spa owners. Simplify until task completion >80% without prompting. |

### Early Warning Signals
- Plan created / menu uploaded ratio < 60% (users upload but don't run analysis)
- Time-on-page for Gap Analysis < 30 seconds (skimming without engaging)
- Revenue Simulator completion rate < 40%
- Reanalyze clicks as proxy for "I don't trust/understand the first result"

---

## Failure Mode 7 — AI Analysis Race Condition (Current Active Bug)
**Severity:** 🔴 P0 (already in production)
**Likelihood:** 100% (confirmed in code audit)

### What Happens
User completes Plan Wizard, clicks "Analyze Menu." App navigates to PlanResults immediately. `saveOutputs()` hasn't completed yet. User sees "No results — click Reanalyze." User clicks Reanalyze. OR user is confused and abandons. This is the first-session wow moment breaking at the critical point.

### Root Cause
In `PlanWizard.tsx handleAnalyze()`: navigation to `/portal/plans/:id` happens immediately after `runMenuAnalysis()` is called, but `runMenuAnalysis` internally awaits async DB writes. The navigation races the write. The first `fetchPlanData()` in `PlanResults` executes before outputs are saved.

### Mitigations (in priority order)

| Mitigation | Priority | Implementation |
|---|---|---|
| Realtime status polling | P0 | After navigation to PlanResults, poll `plans.status` every 3 seconds. While status = 'processing', show animated progress screen. When status = 'ready', fetch outputs and reveal. |
| OR: Supabase Realtime subscription | P0 (preferred) | Subscribe to `plans` row changes on mount in PlanResults. No polling overhead. Status change triggers refetch. |
| Processing screen (not empty state) | P0 | While processing, show: "Your analysis is running... (animated services list)" not an empty tab UI. Estimated time: ~15–30 seconds. |
| Timeout + error state | P0 | If status still 'processing' after 3 minutes, set status = 'failed', show "Analysis timed out. Please try again." with one-click retry. |
| Navigate only on success confirmation | P1 | Alternative approach: don't navigate until `runMenuAnalysis` returns success. Keep user on wizard with progress indicator. Only navigate when plan status = 'ready'. This is simpler but blocks the wizard for 15–30 seconds — acceptable with a good progress screen. |

---

## Failure Mode 8 — Platform Admin Actions Without Audit Trail
**Severity:** 🟠 P1
**Likelihood:** High (current code has no audit logging on admin writes)

### What Happens
An admin modifies a brand's catalog (changes a protocol, deletes a product). The brand disputes the change. There's no log of who did what, when. OR: A malicious admin reads a brand's analytics. There's no record. Trust collapses with brand partners.

### Root Causes
- `audit_log` table exists but no current writes to it in admin pages
- No MFA on admin accounts
- No session audit (how long was admin logged in, what did they access)

### Mitigations

| Mitigation | Priority | Implementation |
|---|---|---|
| Write to audit_log on every admin mutation | P0 | Middleware wrapper for all admin Supabase writes: record actor, action, table, row_id, before_state, after_state, timestamp |
| Admin read logging for sensitive tables | P1 | brand_analytics, business data reads by admin → logged |
| MFA for admin accounts | P1 | Enforce TOTP on all `admin` + `platform_admin` accounts |
| Session timeout | P1 | Admin sessions expire after 2 hours of inactivity |
| Immutable audit log | P1 | RLS: audit_log is INSERT-only, no UPDATE or DELETE even for admins |

---

## Failure Mode 9 — Promise.all() Failure Cascades
**Severity:** 🟡 P2
**Likelihood:** High under real-world network conditions

### What Happens
`Dashboard.tsx` uses `Promise.all([plansQuery, protocolsQuery, productsQuery, ordersQuery])`. If Supabase has a 5-second spike on the `orders` table, the entire dashboard fails to load, showing an error state. User refreshes. Same thing. They give up.

### Current Affected Locations
- `business/Dashboard.tsx` line 33
- `brand/Dashboard.tsx` (similar pattern)
- `mappingEngine.ts` line 124

### Mitigation
Replace `Promise.all()` with `Promise.allSettled()`. Render whatever data loaded successfully. Show partial-failure indicators only for the specific widget that failed.

---

## Failure Mode 10 — Brand Onboarding Stalls (Incomplete Catalog)
**Severity:** 🟡 P2
**Likelihood:** High (brands underestimate the work of catalog ingestion)

### What Happens
Brand signs a contract. Gets access to portal. Starts uploading protocols. Gets busy. Catalog is 40% complete — 6 protocols loaded, 0 products linked, no assets. Platform starts recommending their brand to businesses (because they're "active"). Businesses analyze the brand and get low-confidence results. "Why are there no product recommendations?" The brand looks bad. The platform looks bad.

### Mitigations

| Mitigation | Priority | Implementation |
|---|---|---|
| Catalog completeness score | P1 | Per brand: % of protocols with complete steps, linked products, assets. Display in brand dashboard and admin view. |
| "Not yet discoverable" status | P1 | Brand is NOT surfaced in business recommendations until catalog completeness > 70%. They can see their draft profile but are not in the live index. |
| Onboarding email cadence | P2 | Days 3, 7, 14 after brand access: "Your catalog is X% complete. Here's what's missing." |
| Admin catalog gate | P1 | Admin must approve brand before it goes live in recommendations. Checklist: protocols complete, products linked, brand profile filled. |

---

## Risk Summary Matrix

| # | Failure Mode | Severity | Likelihood | Mitigation Status |
|---|---|---|---|---|
| 1 | Garbage-in menu → garbage recommendations | 🔴 P0 | High | ⚠️ Partially implemented — add quality gates |
| 2 | Overpromising ROI → trust collapse | 🔴 P0 | Medium-High | ❌ Revenue simulator not built — design correctly from start |
| 3 | Brand vs platform incentive misalignment | 🟠 P1 | Medium | ❌ No placement disclosure exists yet |
| 4 | Data leakage across tenants | 🔴 P0 | Low | ⚠️ RLS exists but no defense-in-depth; no automated tests |
| 5 | Catalog ingestion drift | 🟠 P1 | High | ❌ No SKU lifecycle management exists |
| 6 | Excessive complexity → abandonment | 🟠 P1 | Medium | ⚠️ Some empty states exist; no plain-language audit done |
| 7 | **AI analysis race condition** | 🔴 P0 | **100% (confirmed)** | ❌ **Active bug — fix immediately** |
| 8 | Admin actions without audit trail | 🟠 P1 | High | ⚠️ audit_log table exists, not written to |
| 9 | Promise.all() failure cascades | 🟡 P2 | High | ❌ Confirmed in 3 locations |
| 10 | Brand onboarding stalls | 🟡 P2 | High | ❌ No catalog completeness gate |

---

*Last updated: 2026-02-22 | Owner: Platform Architecture + Product Design*
