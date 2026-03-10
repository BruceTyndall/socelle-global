# SITEMAP AND USER JOURNEYS AUDIT
**Updated:** 2026-03-10 | **Lane A** | **Evidence:** App.tsx (298 routes), 252 component files, 71 migrations, 8 edge functions

---

## Route Inventory Summary

**Total Routes:** 298 route definitions in App.tsx

| Hub | Route Count | Auth | Status |
|-----|-------------|------|--------|
| Public (`/`) | ~85 | None | MIXED (some LIVE, some DEMO) |
| Business Portal (`/portal`) | ~65 | `business_user` | Partial LIVE |
| Brand Portal (`/brand`) | ~45 | `brand_admin` | Partial LIVE |
| Admin Portal (`/admin`) | ~66 | `platform_admin` | Partial LIVE |
| Sales (`/sales`) | ~8 | Module-gated | In Development |
| Marketing (`/marketing`) | ~8 | Module-gated | In Development |
| Education (`/education`) | ~11 | Public + Module | LIVE |
| Claim (`/claim`) | 2 | Public | Placeholder |
| Dev | 1 | Dev only | N/A |

---

## Shell List by Hub

### Public Shells (8)
| Route | Gap |
|-------|-----|
| `/events` | No `events` table — EVT-WO-01 pending |
| `/jobs` + `/jobs/:slug` | No `job_postings` table — JOBS-WO-01 pending |
| `/api/docs` | Stub, no API doc source |
| `/api/pricing` | Stub, no Stripe pricing wired |
| `/insights` | Orphan — redirects to `/intelligence` |
| `/for-brands` | Hardcoded `STATS` array, no DEMO label |
| `/professionals` | Hardcoded `STATS` array, no DEMO label |

### Business Portal Shells (14)
| Route | Gap |
|-------|-----|
| `/portal/benchmarks` | Mock peer data, not live |
| `/portal/reseller` | All mock — no DB backing |
| `/portal/reseller/revenue` | Mock |
| `/portal/reseller/links` | Mock |
| `/portal/crm/segments` | Stub, no segmentation logic |
| `/portal/appointments/*` | Booking shell, no calendar sync |
| `/portal/locations` | LocationsDashboard mock |
| `/portal/studio` | StudioHome stub |
| `/portal/studio/course-builder` | CourseBuilder stub |

### Brand Portal Shells (6)
| Route | Gap |
|-------|-----|
| `/brand/intelligence-report` | Mock report, no live analysis |
| `/brand/intelligence-pricing` | Stub, no pricing table |
| `/brand/advisor` | AI advisor shell, no LLM wired |
| `/brand/hub/education` | Full stub |
| `/brand/hub/protocols` | Full stub |

### Admin Portal Shells (9)
| Route | Gap |
|-------|-----|
| `/admin/reports` | Reporting shell |
| `/admin/users` | User management stub |
| `/admin/regions` | RegionManagement stub |
| `/admin/intelligence` | Partially wired (INTEL-ADMIN-01) but limited |
| Others (~5) | Various stubs |

**Total identified shells: ~37**

---

## Top 10 User Journeys

### Journey 1: New User → Intelligence Access
```
/ → /request-access → (email) → /portal/login → /portal/signup → /portal/dashboard
```
- Tables: `access_requests`, `auth.users`, `user_profiles`, `subscriptions`
- Edge fns: `send-email`
- **Status: PARTIAL** — table exists, confirmation email pending

### Journey 2: Buyer → Market Intelligence (PRIMARY)
```
/ → /intelligence → signal detail → /portal/intelligence (auth)
```
- Tables: `market_signals`, `data_feeds`, `rss_items`
- Edge fns: `feed-orchestrator` (v11), `ingest-openfda` (v15)
- **Status: LIVE** — 47 active signals, 17 with impact_score ≥65

### Journey 3: Brand Discovery → Storefront → Purchase
```
/brands → /brands/:slug → /shop/product/:slug → /shop/checkout
```
- Tables: `brands`, `retail_products`, `orders`
- Edge fns: `stripe-webhook`, `create-checkout` (FROZEN)
- **Status: LIVE** — brands + products functional

### Journey 4: Business User → CRM Pipeline
```
/portal/login → /portal/crm → /portal/crm/contacts → /portal/crm/contacts/:id
```
- Tables: `crm_contacts`, `crm_companies`, `crm_interactions`
- **Status: PARTIAL LIVE** — CRUD working; segments mock; consent log live (CRM-WO-07)

### Journey 5: Medspa Owner → Education + CE Credits
```
/education → /education/courses/:slug → /portal/education → /portal/education/certificates
```
- Tables: `brand_training_modules`, `course_enrollments`, `certificates`
- **Status: LIVE** — EDU-WO-02/05 COMPLETE

### Journey 6: Medspa Owner → Benchmarking
```
/portal/dashboard → /portal/benchmarks → /portal/intelligence
```
- Tables: `market_signals`, `peer_benchmarks` (missing)
- **Status: DEMO** — mock peer data, no live aggregation

### Journey 7: Admin → System Monitoring
```
/admin/login → /admin/dashboard → /admin/intelligence → /admin/feeds → /admin/audit-log
```
- Tables: `audit_log`, `feed_run_log`, `feed_dlq`
- **Status: PARTIAL** — audit_log + feed_run_log exist; feed monitoring UI limited

### Journey 8: Reseller → Commission Tracking
```
/portal/reseller → /portal/reseller/revenue → /portal/affiliates/links
```
- Tables: `reseller_accounts`, `affiliate_clicks`
- **Status: MOCK** — all 3 pages hardcoded

### Journey 9: Brand Portal → Storefront Setup
```
/brand/login → /brand/products → /brand/storefront → /brand/performance
```
- Tables: `brands`, `retail_products`
- **Status: PARTIAL** — products CRUD works; analytics shell

### Journey 10: Sales User → Deal → Proposal
```
/portal/sales → /portal/sales/pipeline → /portal/sales/deals/:id → /portal/sales/proposals/new
```
- Tables: `crm_deals`, `deals`, `proposals`
- **Status: PARTIAL LIVE** — SALES-WO-05/08 COMPLETE; states wired

---

## Dead Ends (No Forward Path)

| Route | Issue |
|-------|-------|
| `/reset-password` (success) | No "return to login" CTA |
| `/forgot-password` (success) | No return link |
| `/admin/recovery` | No nav back |
| `/claim/brand/:slug` (complete) | No next action CTA |
| `/claim/business/:slug` (complete) | No portal link |
| `/shop/checkout` (success) | No order tracking link |
| `/education/certificates/verify/:token` | No nav |
| `/book/:slug` (post-booking) | No exit path |
| `/brand/apply/received` | No status tracker link |
| `/admin/debug-auth` | Dev-only, no main nav |

---

## Navigation Compliance

| Check | Status |
|-------|--------|
| Intelligence = nav position 1 | ✅ PASS |
| Ecommerce not in MainNav | ✅ PASS |
| Auth-aware portal pill present | ✅ PASS |
| `/insights` orphan handled | ✅ PASS (redirects to `/intelligence`) |

---

## PASS/FAIL Summary

| Category | Status | Count | Verdict |
|----------|--------|-------|---------|
| Routing structure | PASS | 298 routes | Well-structured |
| Live data surfaces | PARTIAL | ~45 live, ~85 demo/mock | More DEMO labels needed |
| Shell pages | FAIL | ~37 identified | Blocks ANTI-SHELL RULE |
| Dead ends | FAIL | 10 routes | Need forward CTAs |
| RLS protection | PASS | 176 routes | Properly gated |
| Module gating | PASS | ~50 routes | Correctly scoped |
| Navigation design | PASS | 8 links, correct priority | — |
| Missing tables | FAIL | 2 (events, job_postings) | Blocks EVT/JOBS WOs |

**OVERALL: CONDITIONAL PASS (routing) / FAIL (content completeness)**

---

## Next Actions
1. Add DEMO labels to `/for-brands` + `/professionals` STATS arrays (P0 stop condition)
2. Add forward CTAs to 10 dead-end routes (FOUND-WO-07)
3. Create `events` table + wire `/events` (EVT-WO-01)
4. Create `job_postings` table + wire `/jobs` (JOBS-WO-01)
5. Admin shells: RegionManagement + ReportsLibrary need dedicated WOs (ADMIN-WO-04/05)
6. Reseller suite: all 3 pages are mock — needs RESELL-WO-01..03
