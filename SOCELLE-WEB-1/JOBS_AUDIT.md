# SOCELLE Jobs Platform Audit

**Date:** March 5, 2026  
**Status:** Jobs platform is NOT implemented  
**Priority:** P0 (referenced in navigation, but missing infrastructure)

---

## Current State

| Component | Status | Evidence |
|---|---|---|
| Jobs page (`/jobs`) | ❌ MISSING | No `src/pages/public/Jobs.tsx` found |
| Job detail page (`/jobs/[slug]`) | ❌ MISSING | No dynamic detail route in router |
| Jobs in main navigation | ✅ EXISTS (partial) | `MainNav.tsx` shows 6 links (Intelligence, Protocols, For Buyers, For Brands, Pricing, About) — **NO "Jobs" link** |
| `socelle-jobs-pipeline/` backend | ❌ MISSING | Not present at `/mnt/` level (checked all folders) |
| Jobs table in Supabase | ❌ MISSING | No migration creates `job_listings` or `job_postings` table |
| Jobs queries in codebase | ❌ MISSING | No TypeScript references to jobs/job_posting/job_listings |
| Router configuration | ⚠️ PARTIAL | `src/App.tsx` has 97 routes, but none for `/jobs` |

### Navigation Audit
Current `MainNav.tsx` NAV_LINKS:
- `/intelligence` — Intelligence Hub
- `/protocols` — Protocols marketplace
- `/for-buyers` — Buyer vertical
- `/for-brands` — Brand vertical
- `/pricing` — Pricing page
- `/about` — About page

**Missing:** `/jobs` link

---

## Infrastructure Gap Analysis

### 1. Frontend Routes Missing
```
❌ /jobs                          — Job board listing + filters
❌ /jobs/[slug]                   — Individual job detail + apply form
❌ /jobs/demand                   — Demand insights (international)
❌ /jobs/[country]               — Country-specific job board (Wave 1)
❌ /jobs/[vertical]              — Vertical job board (medspa/salon/spa/clinic)
```

### 2. Database Schema Missing
No Supabase migration creates:
```sql
❌ job_postings table
❌ job_applications table
❌ job_listings_view (for denormalization)
❌ job_activity_log table (for analytics)
```

### 3. Component Library Missing
```
❌ JobCard component (listing preview)
❌ JobDetail component (full job description)
❌ JobFilters component (role, location, vertical, remote, employment type)
❌ JobApplyForm component (application submission)
❌ JobBoardHeader component (hero/filters/search)
❌ JobDemandChart component (market insights for intelligence-first positioning)
```

### 4. Backend Pipeline Missing
```
❌ socelle-jobs-pipeline/ Python service
❌ Job scraping/aggregation logic
❌ Data transformation (to Supabase schema)
❌ Expiration SLA enforcement (>90 days → marked expired)
❌ De-duplication logic
❌ Cron job scheduler
```

### 5. Data Services Missing
```
❌ jobService.ts — fetch, filter, search jobs
❌ jobAnalyticsService.ts — demand metrics by vertical, location, role
❌ jobApplicationService.ts — submit, track, manage applications
```

---

## Professional Beauty Domain Context

### Target Job Titles (Wave 1)
- **Esthetician** — Spa, salon, medspa
- **Spa Director** — Operations, P&L ownership
- **Medspa Nurse** — RN/LPN for clinical esthetics
- **Aesthetics Manager** — Team lead, beauty director
- **Beauty Educator** — Training, CE content
- **Retail Manager** — Product sales, backbar
- **Sales Associate** — Commission-based retail
- **Brand Representative** — Brand education, in-spa training

### Job Filters (Professional Beauty Standard)
1. **Role Type** — Esthetician, Educator, Manager, RN, Director, Sales, Other
2. **Vertical** — Medspa, Salon, Day Spa, Clinic, Retail, Beauty School, Corporate
3. **Location** — City, State, Zip (searchable, autocomplete)
4. **Work Type** — Full-time, Part-time, Temporary, Contract, 1099
5. **Remote Option** — On-site, Hybrid, Remote (education/training roles)
6. **Experience Level** — Entry, Mid, Senior, Educator certified
7. **Salary Range** — $25k–$60k base + commission (where applicable)

---

## SEO Requirements

### JobPosting Schema (Google Jobs Integration)
Every job detail page must include:
```json
{
  "@context": "https://schema.org/",
  "@type": "JobPosting",
  "title": "Esthetician — Medical Spa (Full-time)",
  "description": "...",
  "datePosted": "2026-03-05",
  "validThrough": "2026-04-05",
  "employmentType": ["FULL_TIME"],
  "baseSalary": {
    "@type": "PriceSpecification",
    "currency": "USD",
    "value": 45000
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Los Angeles",
      "addressRegion": "CA",
      "postalCode": "90210",
      "addressCountry": "US"
    }
  },
  "applicantLocationRequirements": {
    "@type": "Country",
    "name": "US"
  },
  "url": "https://socelle.com/jobs/esthetician-medspa-los-angeles-2026",
  "hiringOrganization": {
    "@type": "Organization",
    "name": "SPA_NAME",
    "sameAs": "https://socelle.com/brands/[brand-id]",
    "logo": "..."
  }
}
```

### SEO Hub Pages (Content Marketing)
These pages drive organic traffic + authority:
```
/jobs/esthetician-jobs           — "Esthetician Jobs Near You" (3k+ monthly searches)
/jobs/medspa-jobs               — "Medspa Jobs Hiring Now" (1.5k monthly)
/jobs/spa-director-jobs         — "Spa Director & Manager Jobs" (800 monthly)
/jobs/salon-jobs                — "Salon Esthetician Jobs" (2.5k monthly)
/jobs/remote-beauty-jobs        — "Remote Beauty Educator Jobs" (400 monthly)
/jobs/beauty-educator-jobs      — "Beauty Education + CE Jobs" (600 monthly)
```

Each hub:
- Hero section (target role + market demand)
- Job board filtered to that role
- Salary insights (median pay by state)
- Skills trend data (which treatments trending in job descriptions)
- CTA to apply

### Meta Tags + Canonical
- Job listing page: `<title>Jobs in Beauty • Esthetician, Manager, RN | SOCELLE</title>`
- Job detail: `<title>[Job Title] — [Location] | SOCELLE Jobs</title>`
- Canonical: `/jobs/[slug]` (prevent duplicate job postings from other platforms)

---

## International Expansion — Wave 1 Countries

### Market Sizing (Beauty Professional Population)
| Country | Population | Beauty Professionals | Est. Annual Hires | Priority |
|---|---|---|---|---|
| 🇺🇸 United States | 330M | 350k+ | 28k+ | P0 (existing) |
| 🇨🇦 Canada | 38M | 45k+ | 3.5k | P1 (Wave 2) |
| 🇬🇧 UK | 67M | 60k+ | 5k | P1 (Wave 2) |
| 🇦🇺 Australia | 26M | 35k+ | 2.8k | P1 (Wave 2) |
| 🇦🇪 UAE | 9.9M | 8k+ | 600 | P1 (Wave 2) — Dubai beauty boom |

### Data Model for International Expansion
```
job_postings:
  id UUID
  country_code VARCHAR (US, CA, GB, AU, AE)
  country_name VARCHAR
  currency_code VARCHAR (USD, CAD, GBP, AUD, AED)
  salary_usd_equivalent NUMERIC (for comparison)
  ...
```

### Routes for International (Phase 2)
```
/jobs/ca                        — Canada job board
/jobs/gb                        — UK job board
/jobs/au                        — Australia job board
/jobs/ae                        — UAE job board
/jobs/ca/esthetician-jobs       — Canada + role targeting
/jobs/gb/medspa-jobs            — UK + vertical targeting
```

---

## Recommended Data Model

### `job_postings` Table (Supabase PostgreSQL)
```sql
CREATE TABLE job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Info
  title VARCHAR(150) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  company_id UUID NOT NULL REFERENCES brands(id),
  
  -- Classification
  job_type VARCHAR(50) NOT NULL, -- 'esthetician', 'spa_director', 'medspa_nurse', etc
  vertical VARCHAR(50) NOT NULL, -- 'medspa', 'salon', 'spa', 'clinic', 'retail', 'school'
  employment_type VARCHAR(50) NOT NULL, -- 'FULL_TIME', 'PART_TIME', 'TEMPORARY', 'CONTRACT'
  
  -- Location & Remote
  location_city VARCHAR(100) NOT NULL,
  location_state VARCHAR(2),
  location_country VARCHAR(2) DEFAULT 'US',
  location_zip VARCHAR(10),
  is_remote BOOLEAN DEFAULT FALSE,
  remote_eligible BOOLEAN DEFAULT FALSE,
  
  -- Compensation
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency VARCHAR(3) DEFAULT 'USD',
  salary_period VARCHAR(20) DEFAULT 'annually', -- 'hourly', 'annually'
  commission_notes TEXT,
  
  -- SEO & Content
  experience_level VARCHAR(50), -- 'entry', 'mid', 'senior', 'educator'
  required_certifications TEXT[], -- ['Esthetics License', 'CPR']
  responsibilities TEXT,
  required_skills TEXT[],
  nice_to_have TEXT[],
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  posted_date TIMESTAMP NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_expired BOOLEAN DEFAULT FALSE,
  
  -- Application Management
  application_url VARCHAR(500), -- External application link or internal form
  direct_apply BOOLEAN DEFAULT TRUE, -- If FALSE, redirect to external URL
  applications_count INTEGER DEFAULT 0,
  
  -- Source & Analytics
  source VARCHAR(100), -- 'socelle_pipeline', 'brand_posted', 'imported_linkedin'
  external_job_id VARCHAR(200), -- For deduplication
  featured BOOLEAN DEFAULT FALSE,
  featured_until TIMESTAMP,
  
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT salary_order CHECK (salary_min <= salary_max OR salary_min IS NULL)
);

CREATE INDEX idx_job_postings_country ON job_postings(location_country);
CREATE INDEX idx_job_postings_vertical ON job_postings(vertical);
CREATE INDEX idx_job_postings_job_type ON job_postings(job_type);
CREATE INDEX idx_job_postings_expired ON job_postings(is_expired);
CREATE INDEX idx_job_postings_company ON job_postings(company_id);
CREATE INDEX idx_job_postings_slug ON job_postings(slug);
```

### `job_applications` Table
```sql
CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  applicant_email VARCHAR(255) NOT NULL,
  applicant_name VARCHAR(150) NOT NULL,
  applicant_phone VARCHAR(20),
  applicant_resume_url VARCHAR(500),
  cover_letter TEXT,
  years_experience INTEGER,
  certifications TEXT[],
  
  status VARCHAR(50) DEFAULT 'submitted', -- 'submitted', 'viewed', 'rejected', 'interviewed', 'offered'
  applied_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  created_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT valid_email CHECK (applicant_email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$')
};

CREATE INDEX idx_job_applications_job ON job_applications(job_posting_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);
```

### `job_listings_view` (Denormalized for Performance)
```sql
CREATE VIEW job_listings_view AS
SELECT 
  jp.id,
  jp.slug,
  jp.title,
  jp.job_type,
  jp.vertical,
  jp.location_city,
  jp.location_state,
  jp.is_remote,
  jp.salary_min,
  jp.salary_max,
  jp.salary_currency,
  jp.employment_type,
  jp.posted_date,
  jp.expires_at,
  jp.is_expired,
  b.name AS company_name,
  b.logo_url,
  COUNT(ja.id) AS application_count,
  EXTRACT(DAY FROM NOW() - jp.posted_date) AS days_posted
FROM job_postings jp
LEFT JOIN brands b ON jp.company_id = b.id
LEFT JOIN job_applications ja ON jp.id = ja.job_posting_id
GROUP BY jp.id, b.id;
```

---

## Route Architecture

### Public Routes (No Auth Required)
```
GET  /jobs                       — Job board listing + filters
GET  /jobs/[slug]               — Job detail + apply form
GET  /jobs/demand               — Demand insights (trending roles, locations)
GET  /jobs/[country]            — Country-specific board (Phase 2)
GET  /jobs/[vertical]           — Vertical-specific board (medspa/salon/spa/clinic)
GET  /jobs/esthetician-jobs     — SEO hub (trending term)
GET  /jobs/medspa-jobs          — SEO hub
GET  /jobs/spa-director-jobs    — SEO hub
GET  /jobs/salon-jobs           — SEO hub
GET  /jobs/remote-beauty-jobs   — SEO hub
GET  /jobs/beauty-educator-jobs — SEO hub
```

### Business Portal Routes (Auth Required)
```
GET  /portal/jobs/posted        — Brand's posted jobs (if brand owner)
POST /portal/jobs/new           — Create job posting form
GET  /portal/jobs/[id]/edit     — Edit job
GET  /portal/jobs/[id]/applications — View applications
PATCH /portal/jobs/[id]/application/[app-id] — Change app status
DELETE /portal/jobs/[id]        — Remove job posting
```

### Admin Routes
```
GET  /admin/jobs                — Admin job board overview + moderation
GET  /admin/jobs/[id]           — Job detail + moderation options
PATCH /admin/jobs/[id]/featured — Feature/unfeature job
DELETE /admin/jobs/[id]         — Remove job (moderation)
GET  /admin/jobs/analytics      — Demand metrics by vertical, location, role
```

### API Routes (Enterprise Intelligence API, WO-21)
```
GET  /api/v1/jobs               — Paginated job listing (with filters)
GET  /api/v1/jobs/[slug]        — Job detail
GET  /api/v1/jobs/demand        — Aggregated demand metrics
GET  /api/v1/jobs/search        — Full-text search
```

---

## Component Architecture

### Page Components
```
src/pages/public/
  Jobs.tsx                      — Job board listing (filter + search + pagination)
  JobDetail.tsx                 — Individual job detail + apply form

src/pages/public/seo/
  EsthcianJobsHub.tsx          — SEO hub for "esthetician jobs"
  MedspaJobsHub.tsx            — SEO hub for "medspa jobs"
  SpaDirectorJobsHub.tsx       — SEO hub for "spa director jobs"
  SalonJobsHub.tsx             — SEO hub for "salon jobs"
  RemoteBeautyJobsHub.tsx      — SEO hub for remote roles
  BeautyEducatorJobsHub.tsx    — SEO hub for educators

src/pages/business/
  BusinessJobsPosted.tsx       — Brand owner's posted jobs
  BusinessJobsNew.tsx          — Job posting form (integrated with CMS)
  BusinessJobsEdit.tsx         — Edit job
  BusinessJobApplications.tsx  — Review applications
```

### UI Components
```
src/components/jobs/
  JobCard.tsx                  — Card component for job listing
  JobDetail.tsx                — Full job description (hero + details + apply CTA)
  JobFilters.tsx               — Filter sidebar (role, vertical, location, remote, salary)
  JobSearch.tsx                — Search bar + autocomplete
  JobBoardHeader.tsx           — Hero section for /jobs page
  JobApplyForm.tsx             — Application submission form
  JobDemandChart.tsx           — Intelligence-first: market insights
  JobPostingForm.tsx           — Form for creating/editing jobs (business portal)
  JobApplicationCard.tsx       — Application card (for business/admin review)
  LocationAutocomplete.tsx     — City/state picker (reusable)
```

---

## Pipeline Integration: `socelle-jobs-pipeline`

### Architecture (NOT YET CREATED)
```
socelle-jobs-pipeline/
├── main.py                    — Orchestrator (scrape, transform, dedupe, upload)
├── config.py                  — API keys, Supabase connection, schedules
├── requirements.txt           — Dependencies (requests, beautifulsoup4, psycopg2)
├── sources/
│   ├── linkedin_scraper.py    — LinkedIn job API (authenticated)
│   ├── indeed_scraper.py      — Indeed RSS feed
│   ├── ziprecruiter_scraper.py — ZipRecruiter API
│   ├── beautyjobs_scraper.py  — BeautyJobs.com RSS
│   └── indeed_beauty_scraper.py — Beauty-specific Indeed searches
├── transformers/
│   ├── job_normalizer.py      — Convert source format → job_postings schema
│   ├── location_enricher.py   — Add lat/lng, state codes
│   ├── salary_standardizer.py — Convert hourly → annual, deduplicate salary ranges
│   └── deduplicator.py        — Detect duplicate jobs by hash
├── loaders/
│   └── supabase_loader.py     — Batch insert/update to Supabase
├── schedulers/
│   ├── daily_scraper.py       — Run daily job refresh (6 AM UTC)
│   ├── expiration_enforcer.py — Mark >90 day old jobs as expired
│   └── featured_promo.py      — Auto-expire featured job promotions
└── tests/
    └── test_pipeline.py       — Unit + integration tests
```

### Data Flow
```
1. Daily Scheduler (6 AM UTC)
   ├─ LinkedIn Scraper → 500+ jobs/day
   ├─ Indeed → 300+ jobs/day
   ├─ ZipRecruiter → 200+ jobs/day
   └─ Beauty-specific RSS → 100+ jobs/day
        ↓
2. Transform Layer
   ├─ Normalize to job_postings schema
   ├─ Enrich location (lat/lng, autocomplete)
   ├─ Standardize salary (hourly → annual)
   └─ Classify vertical + job_type via NLP
        ↓
3. Deduplication
   ├─ Hash job title + company + city
   ├─ Detect duplicates across sources
   └─ Merge with existing job_postings
        ↓
4. Supabase Upload
   ├─ Batch insert new jobs
   ├─ Update posted_date on existing
   └─ Set expires_at = posted_date + 90 days
        ↓
5. Expiration Enforcement (Daily)
   ├─ Find jobs where expires_at < NOW()
   ├─ Set is_expired = TRUE
   └─ Remove from search results
```

### Deduplication Logic
```python
# Hash for matching
job_hash = hashlib.md5(
  f"{title}|{company}|{city}".lower().encode()
).hexdigest()

# Check if hash exists in DB
existing = supabase.table('job_postings').select('id').eq('job_hash', job_hash).execute()

if existing.data:
  # Merge: use source with highest salary + most recent date
  # Increment applications_count if tracked externally
  UPDATE job_postings SET posted_date = MAX(posted_date), updated_at = NOW()
else:
  # Insert new job
  INSERT INTO job_postings (...)
```

---

## Wave 1 Work Orders (Proposed)

| Work Order | Scope | Est. Hours | Dependencies |
|---|---|---|---|
| **WO-26** | Jobs DB Schema + Migrations | 8 | None |
| **WO-27** | Job Service Layer (fetch, filter, search) | 6 | WO-26 |
| **WO-28** | Jobs Page + Components (listing, detail, apply form) | 12 | WO-27 |
| **WO-29** | JobPosting SEO Schema + Meta Tags | 4 | WO-28 |
| **WO-30** | SEO Hub Pages (6× hub pages) | 10 | WO-28, WO-29 |
| **WO-31** | Jobs Analytics Dashboard (Admin) | 8 | WO-26, WO-27 |
| **WO-32** | Business Portal: Post/Manage Jobs | 10 | WO-28, WO-29 |
| **WO-33** | Pipeline Foundation (Python service structure) | 6 | None (can run in parallel) |
| **WO-34** | Pipeline Scrapers + Transformers (LinkedIn, Indeed, ZipRecruiter) | 20 | WO-26 |
| **WO-35** | Pipeline Deployment + Monitoring | 4 | WO-34 |
| **WO-36** | QA + Full Jobs Platform Integration | 8 | All above |

**Total: 96 hours (12 work days for 1 agent)** or **2 agents × 5 days parallel track**

---

## Risk & Constraints

### High Risk
1. **External Job Scraping Legal** — Must respect robots.txt, Terms of Service (LinkedIn, Indeed)
2. **Duplicate Job Management** — Brands may post same job across multiple platforms; pipeline must dedupe
3. **International Localization** — Salary, certifications, work authorization vary by country
4. **SEO Cannibalisation** — Too many job hub pages may dilute authority; must consolidate topically

### Technical Constraints
1. **Supabase RLS** — Job listing must be public; job applications must be private (only applicant + employer can view)
2. **Real-time Updates** — Jobs from scraper added 1–2× daily; frontend cache must invalidate
3. **Expiration SLA** — Jobs >90 days old automatically hidden (not deleted, for analytics)

### Business Constraints
1. **Pricing Model** — Does posting a job cost money for brands? (Recommend: Free tier 1 job, premium for multiple)
2. **Job Moderation** — Adult content, scams? (Recommend: AI flagging + admin review for featured jobs)
3. **Apply Workflow** — Redirect to external job link vs. internal application form? (Recommend: both, configurable per job)

---

## Completion Criteria

- [ ] Supabase migrations created + applied
- [ ] Job service layer fully tested
- [ ] `/jobs` page loads with sample data (no broken queries)
- [ ] `/jobs/[slug]` detail page renders with JobPosting schema
- [ ] All 6 SEO hub pages live and indexed
- [ ] Business portal: brand can post + manage jobs
- [ ] Admin moderation dashboard functional
- [ ] `npx tsc --noEmit` returns 0 errors
- [ ] Google Search Console: jobs indexed (can take 2–4 weeks)
- [ ] Pipeline running daily (✅ will emit 500–1100+ jobs/day)

---

## Reference: Professional Beauty Job Market

### Salary Baseline (US, 2026)
- **Esthetician (Entry):** $24–32k/year + commission
- **Esthetician (Senior):** $35–50k/year + commission
- **Spa Director:** $45–70k/year
- **Medspa Nurse (RN):** $55–80k/year
- **Beauty Educator:** $40–65k/year
- **Sales Manager:** $50–75k/year + commission

### Growth Drivers
- Remote beauty education (Zoom CE credits) — 40% CAGR
- Medspa clinical expansion (RN demand) — 25% CAGR
- Wellness tourism (hospitality) — 30% CAGR
- Brand rep roles (training partnerships) — 15% CAGR

### Competitive Landscape
- **BeautyJobs.com** — Long-tail beauty jobs, low traffic
- **Indeed + LinkedIn** — Generic job boards, no beauty domain expertise
- **Aesthetics Schools' Job Boards** — Regional, limited reach
- **Facebook Groups** — Informal, low signal-to-noise

**SOCELLE Differentiator:** Intelligence-first positioning. Show estheticians & spas WHERE jobs are growing (market demand), not just listing open positions. Jobs become a signal of industry trends.

---

## Next Steps

1. **Agent 9 (Database):** Create WO-26 migration files for job_postings + job_applications
2. **Agent 10 (Services):** Build jobService.ts + jobAnalyticsService.ts  
3. **Agent 11 (UI):** Create Jobs page, JobDetail, JobCard, JobFilters components
4. **Agent 12 (Scraping):** Initialize socelle-jobs-pipeline/ Python service structure
5. **Product:** Decide: free job posting (for brands) or premium tier?

