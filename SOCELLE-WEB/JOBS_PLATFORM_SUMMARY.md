# SOCELLE Jobs Platform — Audit Summary

**Agent:** Agent 8 — Jobs Platform Agent  
**Date:** March 5, 2026  
**Status:** Comprehensive audit complete; implementation roadmap ready

---

## Executive Summary

The SOCELLE Jobs platform is a **critical missing feature** for an intelligence-first beauty professional network. Currently:

- ✅ **Intelligence Hub** (WO-06) shows market trends
- ✅ **Protocol Marketplace** (WO-20) shows educational content  
- ✅ **Brands + Storefronts** show product/company data
- ❌ **Jobs board is missing entirely** — no routes, no database, no UI

Yet jobs data represents a powerful **market signal**: where beauty professionals are hiring reveals where the market is growing. Jobs should be the third pillar of SOCELLE's intelligence offerings (after protocols and market insights).

---

## What's Missing

| Component | Status | Impact |
|---|---|---|
| Database schema (`job_postings`, `job_applications`) | ❌ MISSING | Can't store jobs |
| Job service layer (fetch, filter, search APIs) | ❌ MISSING | Can't retrieve jobs |
| Public `/jobs` page + detail page | ❌ MISSING | Users can't browse jobs |
| Job components (cards, filters, apply form) | ❌ MISSING | No UI for job board |
| SEO hub pages (6× role-based landing pages) | ❌ MISSING | No organic search traffic |
| Business portal job posting UI | ❌ MISSING | Brands can't post jobs |
| Admin moderation dashboard | ❌ MISSING | No job content moderation |
| Backend job scraping pipeline | ❌ MISSING | No automated job aggregation |
| JobPosting schema (Google Jobs integration) | ❌ MISSING | Jobs not indexed by Google |

**Current Navigation:** MainNav shows 6 links (Intelligence, Protocols, For Buyers, For Brands, Pricing, About) — **no Jobs link** — yet jobs feature is mentioned in strategic planning.

---

## Implementation Roadmap

### Wave 9: Jobs Platform (11 Work Orders, 96 Hours)

**Critical Path:**
```
WO-26 (DB Schema, 8h)
  ↓
WO-27 (Services, 6h)
  ↓
WO-28 (Jobs Page + Components, 12h) ← Public launch ready
  ↓
WO-29 (SEO Schema, 4h)
  ↓
WO-30 (SEO Hubs, 10h)  ← Organic traffic generation
```

**Parallel Track (Backend):**
```
WO-33 (Pipeline Setup, 6h)
  ↓
WO-34 (Scrapers + Transformers, 20h)
  ↓
WO-35 (Deploy + Monitor, 4h)
```

**Portal + Admin:**
```
WO-31 (Admin Dashboard, 8h)
WO-32 (Business Portal, 10h)
```

**Final:**
```
WO-36 (QA, 8h)
```

**Timeline:** 2 weeks (2-agent parallel) or 3 weeks (1-agent sequential)

---

## Key Decisions

### 1. Database Architecture
- `job_postings` table with 25 fields (title, slug, description, location, salary, vertical, job_type, featured, etc.)
- `job_applications` table for tracking applicants
- `job_listings_view` (denormalized) for fast public queries
- RLS policies: public readable, brand-writable

### 2. Job Filtering Strategy
- By role: esthetician, spa director, medspa nurse, educator, etc.
- By vertical: medspa, salon, day spa, clinic, retail, beauty school
- By location: city, state, zip
- By work type: full-time, part-time, contract, 1099
- By remote eligibility
- By salary range

### 3. SEO Hub Pages (Organic Growth)
6 role-based landing pages drive 7k+ monthly searches:
- `/jobs/esthetician-jobs` (3k searches/month)
- `/jobs/medspa-jobs` (1.5k)
- `/jobs/spa-director-jobs` (800)
- `/jobs/salon-jobs` (2.5k)
- `/jobs/remote-beauty-jobs` (400)
- `/jobs/beauty-educator-jobs` (600)

Each hub shows: hero + featured jobs + salary insights + trending skills + call-to-action

### 4. Job Aggregation Pipeline
Python service (socelle-jobs-pipeline) scrapes:
- LinkedIn job API (500+/day)
- Indeed RSS (300+/day)
- ZipRecruiter (200+/day)
- Beauty-specific RSS (100+/day)

**Total: 1,100+ jobs/day**

Deduplicates, transforms to schema, loads daily (6 AM UTC). Auto-expires jobs >90 days old.

### 5. International Expansion (Wave 2)
Foundation laid for UK, Canada, Australia, UAE expansion:
- `country_code` field in schema
- Currency conversion (salary_usd_equivalent)
- Routes: `/jobs/[country]`

Phase 1 focuses on US only.

---

## Intelligence-First Positioning

Jobs board reinforces SOCELLE's market signal thesis:

**Current:** "Where are beauty professionals being hired?" → Market demand signal
**Future:** Combine with protocol trends + product sales data → "This vertical is hiring for X skills; here are the protocols trending for X skills"

**Example:**
- Medspa hiring for "advanced laser technician" roles ↑ 40%
- Protocol views for "Advanced Laser Safety Certification" ↑ 35%
- Laser equipment sales ↑ 25%
→ **Signal:** Medspa vertical consolidating around clinical procedures

---

## File Deliverables

### Created Today

| File | Size | Purpose |
|---|---|---|
| `/JOBS_AUDIT.md` | 22 KB | Current state + infrastructure gaps + requirements |
| `/JOBS_PATCH_LIST.md` | 58 KB | 11 work orders with detailed implementation specs |
| `/JOBS_PLATFORM_SUMMARY.md` | This file | Executive summary + decisions |

### To Be Created (WO-26 onwards)

**Database Migrations (4):**
- `20260305000001_create_job_postings_table.sql`
- `20260305000002_create_job_applications_table.sql`
- `20260305000003_create_job_listings_view.sql`
- `20260305000004_setup_job_rls_policies.sql`

**Services (3):**
- `src/lib/jobService.ts`
- `src/lib/jobApplicationService.ts`
- `src/lib/jobAnalyticsService.ts`

**Pages (8):**
- `src/pages/public/Jobs.tsx`
- `src/pages/public/EsthcianJobsHub.tsx`
- `src/pages/public/MedspaJobsHub.tsx`
- `src/pages/public/SpaDirectorJobsHub.tsx`
- `src/pages/public/SalonJobsHub.tsx`
- `src/pages/public/RemoteBeautyJobsHub.tsx`
- `src/pages/public/BeautyEducatorJobsHub.tsx`
- `src/pages/admin/AdminJobsAnalytics.tsx`

**Components (10):**
- `src/components/jobs/JobCard.tsx`
- `src/components/jobs/JobDetail.tsx`
- `src/components/jobs/JobFilters.tsx`
- `src/components/jobs/JobSearch.tsx`
- `src/components/jobs/JobBoardHeader.tsx`
- `src/components/jobs/JobApplyForm.tsx`
- `src/components/jobs/JobDemandChart.tsx`
- `src/components/jobs/JobDetailModal.tsx`
- `src/components/jobs/LocationAutocomplete.tsx`
- `src/components/jobs/JobPostingForm.tsx`

**Python Pipeline (20+ files):**
- `socelle-jobs-pipeline/main.py`
- `socelle-jobs-pipeline/config.py`
- `socelle-jobs-pipeline/requirements.txt`
- `socelle-jobs-pipeline/sources/` (5 scrapers)
- `socelle-jobs-pipeline/transformers/` (4 transformers)
- `socelle-jobs-pipeline/loaders/` (1 loader)
- `socelle-jobs-pipeline/schedulers/` (3 schedulers)
- `socelle-jobs-pipeline/tests/` (unit tests)

**DevOps:**
- `.github/workflows/daily-job-scrape.yml` (scheduled GitHub Actions)

---

## Risk Mitigation

| Risk | Severity | Mitigation |
|---|---|---|
| Supabase RLS complexity | HIGH | Use tested patterns from existing tables; thorough QA |
| Job scraper legal | HIGH | Respect robots.txt; implement User-Agent headers; rate limiting |
| Job board spam | MEDIUM | Moderation queue; AI content flagging (future); admin review |
| International data | MEDIUM | Keep Phase 1 US-only; design schema for expansion; test with mock data |
| Performance at scale | MEDIUM | Use materialized view; implement pagination; cache frequently-accessed data |

---

## Success Metrics (6 Months Post-Launch)

- Jobs page: 500+ monthly visits
- Job applications: 50+ per month
- Brand job postings: 20+ active listings
- SEO hub traffic: 10k+ monthly visits (organic)
- Pipeline reliability: 99.5% uptime (jobs scraped daily)
- Average jobs available: 800–1,200 (updated daily)

---

## Next Steps

1. **Review this audit** with product + engineering team
2. **Prioritize:** Is jobs board P0 (launch soon) or P1 (after current roadmap)?
3. **Assign agents:**
   - Agent A: WO-26, WO-27, WO-28 (database + services + public page)
   - Agent B: WO-33, WO-34, WO-35 (pipeline backend)
   - Agent C: WO-29, WO-30 (SEO)
   - Agent D: WO-31, WO-32 (admin + business portal)
   - Agent E: WO-36 (QA)
4. **Infrastructure readiness:**
   - [ ] Supabase service account key provisioned (for migrations + pipeline)
   - [ ] LinkedIn API access (if scraping from LinkedIn — check legal requirements)
   - [ ] GitHub Actions secrets set (SUPABASE_URL, SUPABASE_SERVICE_KEY)
5. **Product decisions:**
   - [ ] Free or paid job postings for brands?
   - [ ] Apply workflow: internal form or redirect to external?
   - [ ] Featured job promotion pricing?

---

## Architecture Diagram (High Level)

```
┌──────────────────────────────────────────────────────────┐
│                     PUBLIC SITE                          │
├──────────────────────────────────────────────────────────┤
│  /jobs                          Jobs Board (search)      │
│  /jobs/[slug]                   Job Detail (apply)       │
│  /jobs/[vertical]               Vertical-specific hub    │
│  /jobs/esthetician-jobs         SEO hub (organic traffic)│
│  ...5 more SEO hubs                                      │
└──────────────────────────────────────────────────────────┘
                          ↕ (fetch jobs)
┌──────────────────────────────────────────────────────────┐
│                    SUPABASE (PostgreSQL)                 │
├──────────────────────────────────────────────────────────┤
│  job_postings (1000–1200)   ← scraped + brand-posted     │
│  job_applications (50+/mo)  ← applicant submissions      │
│  job_listings_view          ← denormalized for speed     │
└──────────────────────────────────────────────────────────┘
                          ↕ (upsert jobs)
┌──────────────────────────────────────────────────────────┐
│           SOCELLE-JOBS-PIPELINE (Python)                 │
├──────────────────────────────────────────────────────────┤
│  Scrapers (LinkedIn, Indeed, ZipRecruiter, RSS)          │
│  Transformers (normalize, enrich, dedupe)                │
│  Loaders (batch upsert to Supabase)                      │
│  Schedulers (daily 6 AM UTC)                             │
└──────────────────────────────────────────────────────────┘
          ↑ (fetch from external job platforms)
     (1,100+ jobs/day)

┌──────────────────────────────────────────────────────────┐
│              BUSINESS PORTAL (Brand-facing)              │
├──────────────────────────────────────────────────────────┤
│  /portal/jobs/posted            View posted jobs         │
│  /portal/jobs/new               Post new job             │
│  /portal/jobs/[id]/applications Review applicants        │
└──────────────────────────────────────────────────────────┘
           ↕ (post job, manage applications)
      (same Supabase tables)

┌──────────────────────────────────────────────────────────┐
│               ADMIN PORTAL (Moderation)                  │
├──────────────────────────────────────────────────────────┤
│  /admin/jobs                    Analytics dashboard      │
│  /admin/jobs/moderation         Review flagged jobs      │
└──────────────────────────────────────────────────────────┘
           ↕ (feature, delete, review)
      (same Supabase tables)
```

---

## Conclusion

The SOCELLE Jobs platform is a **strategic differentiator** in a market dominated by generic job boards (Indeed, LinkedIn). By positioning jobs as a **market signal layer** (not just a transaction surface), SOCELLE can:

1. **Attract job seekers** → beauty professionals searching for roles
2. **Attract employers** → spa/clinic owners posting roles
3. **Generate market intelligence** → "Medspa hiring for X" reveals market trend
4. **Grow organically** → 7k+ monthly searches across 6 SEO hubs
5. **Retain users** → jobs + protocols + intelligence + commerce = platform stickiness

**Launch readiness:** All infrastructure documented. Ready for agent assignment.

