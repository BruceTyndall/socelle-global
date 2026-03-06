# Jobs Platform Implementation Patch List

**Wave:** Wave 9 (Post-Launch Infrastructure)  
**Total Effort:** 96 hours (11 work orders)  
**Timeline:** 2 weeks (2-agent parallel track) or 3 weeks (1-agent sequential)

---

## P0 — Foundation (Database + Services)

### WO-26: Jobs Database Schema + Migrations
**Scope:** Create Supabase migration files for job_postings, job_applications, and denormalized view  
**Status:** ❌ NOT STARTED  
**Effort:** 8 hours  
**Dependencies:** None (can start immediately)

**Files to Create:**
```
supabase/migrations/20260305000001_create_job_postings_table.sql
supabase/migrations/20260305000002_create_job_applications_table.sql
supabase/migrations/20260305000003_create_job_listings_view.sql
supabase/migrations/20260305000004_setup_job_rls_policies.sql
```

**Acceptance Criteria:**
- [ ] `job_postings` table with 25 columns (id, title, slug, description, company_id, job_type, vertical, location_*, compensation_*, SEO, metadata, application_*, source, featured, timestamps)
- [ ] `job_applications` table with 13 columns (id, job_posting_id, applicant_*, status, timestamps)
- [ ] `job_listings_view` denormalized query (for performance)
- [ ] RLS policies: job_postings readable by all (anon), writable by brands + admin; job_applications private
- [ ] Indexes on: country, vertical, job_type, expired, company_id, slug
- [ ] Migration rollback tested
- [ ] `psql` can execute: `SELECT COUNT(*) FROM job_postings` (empty table, no errors)

**Notes:**
- Use `gen_random_uuid()` for UUID defaults
- job_type enum: 'esthetician', 'spa_director', 'medspa_nurse', 'aesthetics_manager', 'beauty_educator', 'retail_manager', 'sales_associate', 'brand_representative', 'other'
- vertical enum: 'medspa', 'salon', 'spa', 'clinic', 'retail', 'beauty_school', 'corporate'
- employment_type enum: 'FULL_TIME', 'PART_TIME', 'TEMPORARY', 'CONTRACT', '1099'
- Set `created_at`, `updated_at` to `TIMESTAMP DEFAULT NOW()`
- Set `posted_date` and `expires_at` as required fields
- Add CHECK constraint: `salary_min <= salary_max OR salary_min IS NULL`
- Add email validation CHECK on applicant_email in job_applications

---

### WO-27: Job Service Layer
**Scope:** Create TypeScript service files for fetching, filtering, searching, and analyzing jobs  
**Status:** ❌ NOT STARTED  
**Effort:** 6 hours  
**Dependencies:** WO-26 (migrations must be applied)

**Files to Create:**
```
src/lib/jobService.ts              — Fetch, filter, search, paginate jobs
src/lib/jobApplicationService.ts  — Submit, retrieve, manage applications
src/lib/jobAnalyticsService.ts    — Demand metrics by vertical, location, role
```

#### `src/lib/jobService.ts`
```typescript
import { createClient } from '@supabase/supabase-js';

export interface JobListingFilter {
  job_type?: string[];
  vertical?: string[];
  location_city?: string;
  location_state?: string;
  location_country?: string;
  is_remote?: boolean;
  employment_type?: string[];
  salary_min?: number;
  salary_max?: number;
  search_query?: string; // Full-text search on title + description
  exclude_expired?: boolean; // Default: true
  featured_only?: boolean;
  page?: number; // 1-indexed
  limit?: number; // Default: 20, max: 100
}

export interface JobPosting {
  id: string;
  title: string;
  slug: string;
  description: string;
  company_id: string;
  job_type: string;
  vertical: string;
  employment_type: string;
  location_city: string;
  location_state: string;
  location_country: string;
  location_zip?: string;
  is_remote: boolean;
  remote_eligible: boolean;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  salary_period: string;
  commission_notes?: string;
  experience_level?: string;
  required_certifications?: string[];
  responsibilities?: string;
  required_skills?: string[];
  nice_to_have?: string[];
  created_at: string;
  updated_at: string;
  posted_date: string;
  expires_at: string;
  is_expired: boolean;
  application_url?: string;
  direct_apply: boolean;
  applications_count: number;
  source: string;
  featured: boolean;
  featured_until?: string;
  created_by?: string;
}

export class JobService {
  private supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

  /**
   * Fetch jobs with filters, pagination, and search
   */
  async getJobs(filters: JobListingFilter): Promise<{ data: JobPosting[], count: number, error?: string }> {
    // Implementation:
    // 1. Build query from job_listings_view (denormalized)
    // 2. Apply filters: job_type, vertical, location, remote, employment_type, salary range
    // 3. Apply search: full-text on title + description if search_query provided
    // 4. Filter: is_expired = FALSE (unless exclude_expired = false)
    // 5. Order: featured DESC, posted_date DESC
    // 6. Paginate: offset = (page - 1) * limit
    // 7. Return count() for total
  }

  /**
   * Fetch single job by slug
   */
  async getJobBySlug(slug: string): Promise<{ data: JobPosting | null, error?: string }> {
    // Implementation:
    // 1. Query job_postings WHERE slug = slug
    // 2. LEFT JOIN brands to get company_name, logo_url
    // 3. Return full job detail with company info
  }

  /**
   * Fetch single job by ID
   */
  async getJobById(id: string): Promise<{ data: JobPosting | null, error?: string }> {
    // Similar to getJobBySlug but by ID
  }

  /**
   * Get job detail with related jobs (same vertical/location)
   */
  async getJobDetailWithRelated(slug: string): Promise<{ 
    job: JobPosting | null, 
    related: JobPosting[],
    error?: string 
  }> {
    // Implementation:
    // 1. Fetch main job by slug
    // 2. Fetch 4-6 related jobs (same vertical + location, excluding current job)
    // 3. Order related by posted_date DESC
  }

  /**
   * Search jobs by query (full-text search)
   */
  async searchJobs(query: string, limit: number = 10): Promise<{ data: JobPosting[], error?: string }> {
    // Implementation:
    // 1. Use Supabase full-text search on title + description
    // 2. Return top N results (default: 10)
  }

  /**
   * Get jobs by vertical
   */
  async getJobsByVertical(vertical: string, limit: number = 20): Promise<{ data: JobPosting[], error?: string }> {
    // Filter: vertical = vertical, is_expired = FALSE
    // Order: posted_date DESC, featured DESC
  }

  /**
   * Get jobs by location (city)
   */
  async getJobsByLocation(city: string, state?: string, limit: number = 20): Promise<{ data: JobPosting[], error?: string }> {
    // Filter: location_city = city, [location_state = state], is_expired = FALSE
    // Order: posted_date DESC
  }

  /**
   * Get featured jobs
   */
  async getFeaturedJobs(limit: number = 6): Promise<{ data: JobPosting[], error?: string }> {
    // Filter: featured = TRUE, featured_until > NOW(), is_expired = FALSE
    // Order: featured_until DESC, posted_date DESC
  }

  /**
   * Get recently posted jobs (last 7 days)
   */
  async getRecentJobs(limit: number = 10): Promise<{ data: JobPosting[], error?: string }> {
    // Filter: posted_date >= NOW() - INTERVAL '7 days', is_expired = FALSE
    // Order: posted_date DESC
  }

  /**
   * Get autocomplete suggestions (cities, roles, companies)
   */
  async getAutocomplete(query: string, type: 'city' | 'role' | 'company'): Promise<{ data: string[], error?: string }> {
    // Implementation:
    // - type='city': DISTINCT location_city WHERE location_city ILIKE '%query%'
    // - type='role': DISTINCT job_type WHERE job_type ILIKE '%query%'
    // - type='company': DISTINCT company_name WHERE company_name ILIKE '%query%'
    // Return top 5-10 results
  }
}

export const jobService = new JobService();
```

#### `src/lib/jobApplicationService.ts`
```typescript
export interface JobApplication {
  id: string;
  job_posting_id: string;
  applicant_email: string;
  applicant_name: string;
  applicant_phone?: string;
  applicant_resume_url?: string;
  cover_letter?: string;
  years_experience?: number;
  certifications?: string[];
  status: 'submitted' | 'viewed' | 'rejected' | 'interviewed' | 'offered';
  applied_at: string;
  updated_at: string;
}

export class JobApplicationService {
  /**
   * Submit job application
   */
  async submitApplication(jobPostingId: string, data: {
    applicant_name: string;
    applicant_email: string;
    applicant_phone?: string;
    applicant_resume_url?: string;
    cover_letter?: string;
    years_experience?: number;
    certifications?: string[];
  }): Promise<{ data: JobApplication | null, error?: string }> {
    // Implementation:
    // 1. Validate email format
    // 2. Insert into job_applications table
    // 3. Increment job_postings.applications_count
    // 4. Return created application
  }

  /**
   * Get applications for a job (brand/admin only)
   */
  async getApplicationsForJob(jobPostingId: string, userId: string): Promise<{ 
    data: JobApplication[], 
    error?: string 
  }> {
    // Implementation:
    // 1. Verify user owns the job (query job_postings WHERE id = jobPostingId AND created_by = userId)
    // 2. Fetch applications WHERE job_posting_id = jobPostingId
    // 3. Order: applied_at DESC
  }

  /**
   * Update application status
   */
  async updateApplicationStatus(appId: string, status: string, userId: string): Promise<{ 
    data: JobApplication | null, 
    error?: string 
  }> {
    // Implementation:
    // 1. Verify user owns the job (via job_applications -> job_postings)
    // 2. Update job_applications.status = status
    // 3. Return updated application
  }

  /**
   * Get user's submitted applications
   */
  async getUserApplications(userEmail: string): Promise<{ data: JobApplication[], error?: string }> {
    // Filter: applicant_email = userEmail
    // Order: applied_at DESC
  }
}

export const jobApplicationService = new JobApplicationService();
```

#### `src/lib/jobAnalyticsService.ts`
```typescript
export interface JobDemandMetric {
  job_type: string;
  count: number;
  trend: 'up' | 'down' | 'stable'; // Compare vs. last 30 days
  avg_salary?: number;
  locations: string[]; // Top 3 cities
}

export interface LocationDemandMetric {
  location_city: string;
  location_state: string;
  count: number;
  top_jobs: string[]; // Top 3 job types
  avg_salary?: number;
}

export interface VerticalDemandMetric {
  vertical: string;
  count: number;
  avg_salary?: number;
  growth_rate: number; // % vs. last 30 days
  top_roles: string[];
}

export class JobAnalyticsService {
  /**
   * Get top job types by demand
   */
  async getTopJobTypes(limit: number = 10): Promise<{ data: JobDemandMetric[], error?: string }> {
    // Implementation:
    // 1. COUNT jobs by job_type
    // 2. Calculate trend vs. last 30 days
    // 3. Get avg_salary per type
    // 4. Get top 3 locations per type
    // 5. Order: count DESC
  }

  /**
   * Get top locations by demand
   */
  async getTopLocations(limit: number = 10): Promise<{ data: LocationDemandMetric[], error?: string }> {
    // Implementation:
    // 1. COUNT jobs by location_city + location_state
    // 2. Get avg_salary per location
    // 3. Get top 3 job types per location
    // 4. Order: count DESC
  }

  /**
   * Get demand by vertical
   */
  async getVerticalDemand(): Promise<{ data: VerticalDemandMetric[], error?: string }> {
    // Implementation:
    // 1. COUNT jobs by vertical
    // 2. Calculate growth_rate vs. last 30 days
    // 3. Get avg_salary per vertical
    // 4. Get top job types per vertical
    // 5. Order: count DESC
  }

  /**
   * Get salary insights (min, max, avg, median by role/location)
   */
  async getSalaryInsights(filters: { job_type?: string, vertical?: string, location_state?: string }): Promise<{
    data: {
      min: number,
      max: number,
      avg: number,
      median: number,
      percentile_25: number,
      percentile_75: number
    } | null,
    error?: string
  }> {
    // Implementation:
    // 1. Query job_postings with salary data
    // 2. Apply filters
    // 3. Calculate percentiles
  }

  /**
   * Get growth trends (last 30/60/90 days)
   */
  async getGrowthTrends(days: number = 30): Promise<{
    data: { date: string, job_count: number, new_applications: number }[],
    error?: string
  }> {
    // Implementation:
    // 1. Aggregate by day: COUNT(job_postings) WHERE posted_date >= NOW() - INTERVAL 'X days'
    // 2. Aggregate applications by day
    // 3. Return time series
  }
}

export const jobAnalyticsService = new JobAnalyticsService();
```

**Acceptance Criteria:**
- [ ] All three service classes exported and typed correctly
- [ ] No `any` types (strict TypeScript)
- [ ] Error handling: all methods return `{ data, error }` tuple
- [ ] Methods documented with JSDoc
- [ ] Import paths correct (uses `createClient` from supabase-js)
- [ ] Build: `npx tsc --noEmit` succeeds for src/lib/job*.ts

**Notes:**
- Use Supabase RLS for row-level security (RLS policies handle auth)
- All queries use `job_listings_view` for denormalized reads (faster)
- Writes to `job_postings`, `job_applications` directly
- Full-text search: use Postgres `tsvector` or Supabase's built-in search
- Pagination: use OFFSET/LIMIT pattern

---

## P1 — Pages + Components

### WO-28: Jobs Page + Core Components
**Scope:** Create `/jobs` public page + Job components (card, detail, filters, apply form)  
**Status:** ❌ NOT STARTED  
**Effort:** 12 hours  
**Dependencies:** WO-27 (jobService must be complete)

**Files to Create:**
```
src/pages/public/Jobs.tsx
src/components/jobs/JobCard.tsx
src/components/jobs/JobDetail.tsx
src/components/jobs/JobFilters.tsx
src/components/jobs/JobSearch.tsx
src/components/jobs/JobBoardHeader.tsx
src/components/jobs/JobApplyForm.tsx
src/components/jobs/JobDemandChart.tsx
src/components/jobs/LocationAutocomplete.tsx
```

#### `src/pages/public/Jobs.tsx`
```typescript
import { lazy, Suspense, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { jobService } from '../../lib/jobService';
import JobBoardHeader from '../../components/jobs/JobBoardHeader';
import JobFilters from '../../components/jobs/JobFilters';
import JobCard from '../../components/jobs/JobCard';

// Lazy-load detail modal
const JobDetailModal = lazy(() => import('../../components/jobs/JobDetailModal'));

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    exclude_expired: true,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [selectedJobSlug, setSelectedJobSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch jobs when filters change
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      const result = await jobService.getJobs(filters);
      if (result.error) {
        setError(result.error);
      } else {
        setJobs(result.data || []);
        setTotalCount(result.count || 0);
      }
      setLoading(false);
    };
    
    fetchJobs();
  }, [filters]);

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const totalPages = Math.ceil(totalCount / filters.limit);

  return (
    <>
      <Helmet>
        <title>Beauty Jobs • Esthetician, Manager, Educator | SOCELLE</title>
        <meta name="description" content="Find your next role in professional beauty. Browse esthetician, spa director, medspa nurse, and educator jobs." />
        <meta property="og:title" content="Beauty Jobs | SOCELLE" />
        <meta property="og:description" content="Find your next role in professional beauty." />
        <link rel="canonical" href="https://socelle.com/jobs" />
      </Helmet>

      <div className="min-h-screen bg-[--bg]">
        {/* Hero Section */}
        <JobBoardHeader totalJobs={totalCount} />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-5 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <aside className="lg:col-span-1">
              <JobFilters
                onFilterChange={handleFilterChange}
                currentFilters={filters}
              />
            </aside>

            {/* Job Listings */}
            <main className="lg:col-span-3">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  {error}
                </div>
              )}

              {loading && (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-48 bg-[--surface-alt] rounded-lg animate-pulse" />
                  ))}
                </div>
              )}

              {!loading && jobs.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-lg text-graphite/60">No jobs found matching your filters.</p>
                  <button
                    onClick={() => handleFilterChange({})}
                    className="mt-4 text-[--accent] hover:text-[--accent-hover] font-medium"
                  >
                    Clear filters
                  </button>
                </div>
              )}

              {!loading && jobs.length > 0 && (
                <>
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onClick={() => setSelectedJobSlug(job.slug)}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                      {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => handleFilterChange({ page: i + 1 })}
                          className={`px-3 py-2 rounded ${
                            filters.page === i + 1
                              ? 'bg-[--accent] text-white'
                              : 'border border-graphite/10 hover:bg-[--surface-alt]'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>

        {/* Job Detail Modal */}
        {selectedJobSlug && (
          <Suspense fallback={null}>
            <JobDetailModal
              slug={selectedJobSlug}
              onClose={() => setSelectedJobSlug(null)}
            />
          </Suspense>
        )}
      </div>
    </>
  );
}
```

#### `src/components/jobs/JobCard.tsx`
```typescript
import { JobPosting } from '../../lib/jobService';
import { MapPin, Briefcase, DollarSign, Clock } from 'lucide-react';

interface JobCardProps {
  job: JobPosting;
  onClick?: () => void;
}

export default function JobCard({ job, onClick }: JobCardProps) {
  const salaryDisplay = job.salary_min && job.salary_max 
    ? `$${(job.salary_min / 1000).toFixed(0)}k – $${(job.salary_max / 1000).toFixed(0)}k`
    : job.salary_min
    ? `$${(job.salary_min / 1000).toFixed(0)}k+`
    : 'Competitive';

  const daysAgo = Math.floor((Date.now() - new Date(job.posted_date).getTime()) / (1000 * 60 * 60 * 24));
  const postedLabel = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`;

  return (
    <div
      onClick={onClick}
      className="bg-[--card] border border-graphite/10 rounded-lg p-6 hover:shadow-lg hover:border-graphite/20 cursor-pointer transition-all duration-200"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium px-2 py-1 bg-[--surface-alt] text-graphite/70 rounded-full">
              {job.job_type.replace('_', ' ').toTitle()}
            </span>
            {job.featured && (
              <span className="text-xs font-medium px-2 py-1 bg-[--signal-up]/10 text-[--signal-up] rounded-full">
                Featured
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-graphite mb-1">{job.title}</h3>
          <p className="text-sm text-graphite/60 mb-4">{job.company_name || 'Company Name'}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex items-center gap-2 text-graphite/70">
          <MapPin className="w-4 h-4" />
          <span>
            {job.location_city}, {job.location_state || job.location_country}
            {job.is_remote && ' • Remote eligible'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-graphite/70">
          <Briefcase className="w-4 h-4" />
          <span>{job.employment_type === 'FULL_TIME' ? 'Full-time' : job.employment_type}</span>
        </div>

        <div className="flex items-center gap-2 text-graphite/70">
          <DollarSign className="w-4 h-4" />
          <span>{salaryDisplay}</span>
        </div>

        <div className="flex items-center gap-2 text-graphite/70">
          <Clock className="w-4 h-4" />
          <span>Posted {postedLabel}</span>
        </div>
      </div>

      <p className="text-sm text-graphite/60 line-clamp-2 mb-4">{job.description}</p>

      <div className="flex justify-between items-center pt-4 border-t border-graphite/5">
        <span className="text-xs text-graphite/50">{job.applications_count} applications</span>
        <button className="text-[--accent] hover:text-[--accent-hover] font-medium text-sm">
          View Details →
        </button>
      </div>
    </div>
  );
}
```

#### `src/components/jobs/JobFilters.tsx`
```typescript
import { useState, useEffect } from 'react';
import { jobService } from '../../lib/jobService';
import LocationAutocomplete from './LocationAutocomplete';

interface JobFiltersProps {
  onFilterChange: (filters: any) => void;
  currentFilters: any;
}

const JOB_TYPES = [
  'esthetician',
  'spa_director',
  'medspa_nurse',
  'aesthetics_manager',
  'beauty_educator',
  'retail_manager',
  'sales_associate',
  'brand_representative',
];

const VERTICALS = ['medspa', 'salon', 'spa', 'clinic', 'retail', 'beauty_school'];

export default function JobFilters({ onFilterChange, currentFilters }: JobFiltersProps) {
  const [expanded, setExpanded] = useState(true);
  const [selectedJobTypes, setSelectedJobTypes] = useState(currentFilters.job_type || []);
  const [selectedVerticals, setSelectedVerticals] = useState(currentFilters.vertical || []);
  const [selectedLocation, setSelectedLocation] = useState(currentFilters.location_city || '');
  const [remoteOnly, setRemoteOnly] = useState(currentFilters.is_remote || false);
  const [salaryMin, setSalaryMin] = useState(currentFilters.salary_min || 25000);
  const [salaryMax, setSalaryMax] = useState(currentFilters.salary_max || 75000);

  const handleJobTypeChange = (jobType: string) => {
    const updated = selectedJobTypes.includes(jobType)
      ? selectedJobTypes.filter(t => t !== jobType)
      : [...selectedJobTypes, jobType];
    setSelectedJobTypes(updated);
    onFilterChange({ job_type: updated });
  };

  const handleVerticalChange = (vertical: string) => {
    const updated = selectedVerticals.includes(vertical)
      ? selectedVerticals.filter(v => v !== vertical)
      : [...selectedVerticals, vertical];
    setSelectedVerticals(updated);
    onFilterChange({ vertical: updated });
  };

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    onFilterChange({ location_city: location });
  };

  const handleRemoteToggle = () => {
    setRemoteOnly(!remoteOnly);
    onFilterChange({ is_remote: !remoteOnly });
  };

  const handleSalaryChange = () => {
    onFilterChange({ salary_min: salaryMin, salary_max: salaryMax });
  };

  return (
    <div className="bg-[--card] rounded-lg p-6 border border-graphite/10 sticky top-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex justify-between items-center mb-4 lg:mb-0"
      >
        <h3 className="text-lg font-semibold text-graphite">Filters</h3>
        <span className="lg:hidden text-graphite/60">{expanded ? '−' : '+'}</span>
      </button>

      {expanded && (
        <div className="space-y-6">
          {/* Job Type */}
          <div>
            <h4 className="text-sm font-medium text-graphite mb-3">Job Type</h4>
            <div className="space-y-2">
              {JOB_TYPES.map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedJobTypes.includes(type)}
                    onChange={() => handleJobTypeChange(type)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-graphite/70">{type.replace('_', ' ').toTitle()}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Vertical */}
          <div>
            <h4 className="text-sm font-medium text-graphite mb-3">Industry</h4>
            <div className="space-y-2">
              {VERTICALS.map(vertical => (
                <label key={vertical} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedVerticals.includes(vertical)}
                    onChange={() => handleVerticalChange(vertical)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-graphite/70">{vertical.toTitle()}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <h4 className="text-sm font-medium text-graphite mb-3">Location</h4>
            <LocationAutocomplete
              value={selectedLocation}
              onChange={handleLocationChange}
              placeholder="Search city or state..."
            />
          </div>

          {/* Remote */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={handleRemoteToggle}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm font-medium text-graphite">Remote eligible</span>
            </label>
          </div>

          {/* Salary Range */}
          <div>
            <h4 className="text-sm font-medium text-graphite mb-3">Salary Range</h4>
            <div className="space-y-2">
              <input
                type="range"
                min="20000"
                max="150000"
                value={salaryMin}
                onChange={(e) => setSalaryMin(Number(e.target.value))}
                className="w-full"
              />
              <input
                type="range"
                min="20000"
                max="150000"
                value={salaryMax}
                onChange={(e) => setSalaryMax(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-graphite/70">
                ${(salaryMin / 1000).toFixed(0)}k – ${(salaryMax / 1000).toFixed(0)}k
              </div>
              <button
                onClick={handleSalaryChange}
                className="w-full mt-2 px-3 py-2 bg-[--accent] text-white rounded font-medium text-sm hover:bg-[--accent-hover]"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSelectedJobTypes([]);
              setSelectedVerticals([]);
              setSelectedLocation('');
              setRemoteOnly(false);
              setSalaryMin(25000);
              setSalaryMax(75000);
              onFilterChange({
                job_type: [],
                vertical: [],
                location_city: '',
                is_remote: false,
              });
            }}
            className="w-full text-[--accent] hover:text-[--accent-hover] text-sm font-medium py-2"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
```

**Remaining Components:**
- `JobSearch.tsx` — Search bar with autocomplete
- `JobBoardHeader.tsx` — Hero section with featured jobs
- `JobApplyForm.tsx` — Application submission form
- `JobDemandChart.tsx` — Market insights visualization
- `JobDetailModal.tsx` — Full job detail view + apply CTA
- `LocationAutocomplete.tsx` — City/state autocomplete input

**Acceptance Criteria:**
- [ ] Jobs page loads without errors (network requests mocked if DB not ready)
- [ ] Filter sidebar functional (job type, vertical, location, remote, salary)
- [ ] Job cards display with all relevant info (title, company, location, salary, posted date)
- [ ] Pagination working (if >20 jobs)
- [ ] Modal opens on job card click
- [ ] Helmet meta tags set correctly
- [ ] Responsive design (mobile: filters collapse, sidebar moves below jobs)
- [ ] `npx tsc --noEmit` succeeds
- [ ] No console errors

---

### WO-29: JobPosting SEO Schema + Meta Tags
**Scope:** Add JobPosting JSON-LD schema to detail page + optimize meta tags  
**Status:** ❌ NOT STARTED  
**Effort:** 4 hours  
**Dependencies:** WO-28 (Jobs page components)

**Files to Modify/Create:**
```
src/components/jobs/JobDetailModal.tsx  — Add Helmet + schema
src/lib/seoHelpers.ts                   — New helper for job schema generation
```

**Implementation:**
- JobDetailModal: use Helmet to render `<script type="application/ld+json">` with JobPosting schema
- Schema includes: title, description, datePosted, validThrough, employmentType, baseSalary, jobLocation, hiringOrganization, url
- Meta tags: og:title, og:description, og:image (company logo), canonical
- validThrough = expires_at (90 days from posted_date)

**Acceptance Criteria:**
- [ ] JobPosting schema valid (test with google.com/test/rich-results)
- [ ] Meta tags rendered in <head>
- [ ] Canonical URL correct
- [ ] og:image resolves to company logo (or default)
- [ ] validThrough date is future-dated

---

## P2 — SEO & Content Marketing

### WO-30: SEO Hub Pages (6× Pages)
**Scope:** Create dedicated landing pages for top job searches (esthetician, medspa, director, etc.)  
**Status:** ❌ NOT STARTED  
**Effort:** 10 hours  
**Dependencies:** WO-28, WO-29

**Files to Create:**
```
src/pages/public/EsthcianJobsHub.tsx     — /jobs/esthetician-jobs
src/pages/public/MedspaJobsHub.tsx       — /jobs/medspa-jobs
src/pages/public/SpaDirectorJobsHub.tsx  — /jobs/spa-director-jobs
src/pages/public/SalonJobsHub.tsx        — /jobs/salon-jobs
src/pages/public/RemoteBeautyJobsHub.tsx — /jobs/remote-beauty-jobs
src/pages/public/BeautyEducatorJobsHub.tsx — /jobs/beauty-educator-jobs
```

**Each hub includes:**
1. **Hero Section** — Role + market insights ("Esthetician jobs growing 12% YoY")
2. **Featured Jobs** — Top 3 featured jobs for that role
3. **Filtered Job Board** — Full job list filtered to that role
4. **Salary Insights** — Min/max/avg salary by state (chart)
5. **Skills Trend Data** — Most requested skills + certifications
6. **CTA** — "Post a job" for brands

**Example: EsthcianJobsHub.tsx**
```typescript
import { Helmet } from 'react-helmet-async';
import JobBoardHeader from '../../components/jobs/JobBoardHeader';
import JobCard from '../../components/jobs/JobCard';
import { jobService, jobAnalyticsService } from '../../lib/jobService';
import { useEffect, useState } from 'react';

export default function EsthcianJobsHub() {
  const [jobs, setJobs] = useState([]);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    // Fetch esthetician jobs + analytics
    (async () => {
      const jobsResult = await jobService.getJobs({ job_type: ['esthetician'], limit: 50 });
      const analyticsResult = await jobAnalyticsService.getSalaryInsights({ job_type: 'esthetician' });
      setJobs(jobsResult.data || []);
      setInsights(analyticsResult.data);
    })();
  }, []);

  return (
    <>
      <Helmet>
        <title>Esthetician Jobs Hiring Now • Beauty Salons, Spas, Medspas | SOCELLE</title>
        <meta name="description" content="Find esthetician jobs near you. Browse flexible, full-time, and part-time opportunities in salons, spas, and medspas." />
        <link rel="canonical" href="https://socelle.com/jobs/esthetician-jobs" />
      </Helmet>

      <div className="min-h-screen bg-[--bg]">
        {/* Hero */}
        <section className="bg-[--card] border-b border-graphite/10 py-12">
          <div className="max-w-5xl mx-auto px-4">
            <h1 className="text-4xl font-bold text-graphite mb-4">Esthetician Jobs Hiring Now</h1>
            <p className="text-xl text-graphite/70 mb-6">
              Browse {jobs.length} esthetician positions across spas, salons, and medspas.
              Average salary: ${insights?.avg ? `$${(insights.avg / 1000).toFixed(0)}k` : '—'}
            </p>
            {insights && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[--surface-alt] p-4 rounded">
                  <p className="text-graphite/60 text-sm">Median Salary</p>
                  <p className="text-2xl font-bold text-graphite">${(insights.median / 1000).toFixed(0)}k</p>
                </div>
                <div className="bg-[--surface-alt] p-4 rounded">
                  <p className="text-graphite/60 text-sm">Range</p>
                  <p className="text-2xl font-bold text-graphite">${(insights.min / 1000).toFixed(0)}k – ${(insights.max / 1000).toFixed(0)}k</p>
                </div>
                <div className="bg-[--surface-alt] p-4 rounded">
                  <p className="text-graphite/60 text-sm">Growth</p>
                  <p className="text-2xl font-bold text-[--signal-up]">+12% YoY</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Featured Jobs */}
        <section className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-graphite mb-6">Featured Positions</h2>
          <div className="space-y-4">
            {jobs.slice(0, 3).map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </section>

        {/* All Jobs */}
        <section className="max-w-5xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-graphite mb-6">All Esthetician Jobs</h2>
          <div className="space-y-4">
            {jobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
```

**Routes to Add in App.tsx:**
```
GET /jobs/esthetician-jobs        → EsthcianJobsHub
GET /jobs/medspa-jobs            → MedspaJobsHub
GET /jobs/spa-director-jobs      → SpaDirectorJobsHub
GET /jobs/salon-jobs             → SalonJobsHub
GET /jobs/remote-beauty-jobs     → RemoteBeautyJobsHub
GET /jobs/beauty-educator-jobs   → BeautyEducatorJobsHub
```

**Acceptance Criteria:**
- [ ] All 6 hub pages created + routed
- [ ] Each page has: hero, featured jobs, salary insights, full job board
- [ ] Meta titles + descriptions optimized for target keywords
- [ ] Pages load <2s (with mock data if DB not ready)
- [ ] Responsive design
- [ ] Links between hubs (e.g., "Browse other roles" footer)

---

## P3 — Business Portal + Admin

### WO-31: Jobs Analytics Dashboard (Admin)
**Scope:** Admin dashboard to view job demand metrics, moderation, and analytics  
**Status:** ❌ NOT STARTED  
**Effort:** 8 hours  
**Dependencies:** WO-27 (jobAnalyticsService)

**Files to Create:**
```
src/pages/admin/AdminJobsAnalytics.tsx
src/pages/admin/AdminJobsModeration.tsx
src/components/jobs/JobDemandChart.tsx
src/components/jobs/JobAnalyticsCards.tsx
```

**Metrics Displayed:**
- Total jobs posted + active jobs
- Applications submitted (last 30 days)
- Top job types by demand (bar chart)
- Top locations (map or list)
- Salary distribution (by vertical, location)
- Growth trends (30/60/90 day comparison)
- Featured job performance (clicks, applies, conversions)
- Moderation queue (flagged/pending jobs)

**Moderation Features:**
- Flag job (spam, adult content, scam indicators)
- Feature/unfeature job
- Delete job
- View applications for job
- Bulk actions (feature multiple, delete multiple)

**Acceptance Criteria:**
- [ ] Dashboard loads without errors
- [ ] Charts render correctly (use recharts or similar)
- [ ] Admin can feature/unfeature/delete jobs
- [ ] Analytics data refreshes daily
- [ ] Moderation queue functional

---

### WO-32: Business Portal: Post/Manage Jobs
**Scope:** Allow brands to post, edit, and manage job listings  
**Status:** ❌ NOT STARTED  
**Effort:** 10 hours  
**Dependencies:** WO-27 (jobService, jobApplicationService)

**Files to Create:**
```
src/pages/business/BusinessJobsPosted.tsx
src/pages/business/BusinessJobsNew.tsx
src/pages/business/BusinessJobsEdit.tsx
src/pages/business/BusinessJobApplications.tsx
src/components/jobs/JobPostingForm.tsx
src/components/jobs/JobApplicationCard.tsx
```

**Features:**
1. **Posted Jobs List** — View all jobs posted by brand
   - Status: Draft, Active, Expired, Archived
   - Actions: Edit, View Applications, Feature, Archive, Delete
   - Metrics: Views, Applications, Conversion rate

2. **Post New Job** — Form with fields:
   - Title, Description, Requirements
   - Job Type, Vertical, Employment Type
   - Location (city, state, zip)
   - Salary (min, max, period: hourly/annual)
   - Commission notes (if applicable)
   - Experience level, Required certs, Skills
   - Apply URL (internal or external)
   - Featured promotion (optional paid add-on)

3. **Edit Job** — Update any field, republish

4. **Manage Applications** — View applicants, change status (submitted → viewed → rejected/interviewed/offered)
   - Download resume
   - Send email
   - Schedule interview (future: integration with Calendly)

**Acceptance Criteria:**
- [ ] Brand can post a job without errors
- [ ] Job appears on /jobs immediately
- [ ] Brand can view + manage applications
- [ ] Email notifications sent on new applications
- [ ] Validation: required fields, email format, date range
- [ ] Draft jobs not visible to public

---

## P4 — Pipeline Infrastructure

### WO-33: Pipeline Foundation (Python Service Structure)
**Scope:** Set up socelle-jobs-pipeline/ directory structure + dependencies  
**Status:** ❌ NOT STARTED  
**Effort:** 6 hours  
**Dependencies:** None (can run in parallel)

**Files to Create:**
```
socelle-jobs-pipeline/
├── main.py
├── config.py
├── requirements.txt
├── README.md
├── sources/
│   ├── __init__.py
│   ├── base_scraper.py
│   ├── linkedin_scraper.py
│   ├── indeed_scraper.py
│   ├── ziprecruiter_scraper.py
│   └── beautyjobs_scraper.py
├── transformers/
│   ├── __init__.py
│   ├── job_normalizer.py
│   ├── location_enricher.py
│   ├── salary_standardizer.py
│   └── deduplicator.py
├── loaders/
│   ├── __init__.py
│   └── supabase_loader.py
├── schedulers/
│   ├── __init__.py
│   ├── daily_scraper.py
│   ├── expiration_enforcer.py
│   └── featured_promo.py
├── tests/
│   ├── __init__.py
│   ├── test_normalizer.py
│   └── test_deduplicator.py
├── logs/
├── .env.example
└── Dockerfile
```

**Key Files:**

`requirements.txt`:
```
requests==2.31.0
beautifulsoup4==4.12.2
psycopg2-binary==2.9.9
python-dotenv==1.0.0
supabase==2.0.0
feedparser==6.0.10
schedule==1.2.0
```

`config.py`:
```python
import os
from dotenv import load_dotenv

load_dotenv()

# Supabase
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

# Scraper configs
LINKEDIN_API_KEY = os.getenv('LINKEDIN_API_KEY', None)  # Optional
INDEED_PUBLISHER_ID = os.getenv('INDEED_PUBLISHER_ID', None)
ZIPRECRUITER_API_KEY = os.getenv('ZIPRECRUITER_API_KEY', None)

# Scheduler
SCHEDULE_TIME = '06:00'  # 6 AM UTC daily
EXPIRATION_DAYS = 90

# Logging
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
```

`main.py`:
```python
import logging
import schedule
import time
from datetime import datetime
from config import SCHEDULE_TIME
from sources import LinkedInScraper, IndeedScraper, ZipRecruiterScraper
from transformers import JobNormalizer, Deduplicator
from loaders import SupabaseLoader
from schedulers import ExpirationEnforcer, FeaturedPromoEnforcer

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_daily_job_scrape():
    """Main orchestrator: scrape, transform, dedupe, load"""
    logger.info(f"[{datetime.now()}] Starting daily job scrape...")
    
    try:
        # 1. Scrape from all sources
        scrapers = [
            LinkedInScraper(),
            IndeedScraper(),
            ZipRecruiterScraper(),
        ]
        
        all_jobs = []
        for scraper in scrapers:
            jobs = scraper.fetch()
            logger.info(f"Scraped {len(jobs)} jobs from {scraper.__class__.__name__}")
            all_jobs.extend(jobs)
        
        # 2. Transform
        normalizer = JobNormalizer()
        normalized = [normalizer.normalize(job) for job in all_jobs]
        logger.info(f"Normalized {len(normalized)} jobs to schema")
        
        # 3. Deduplicate
        deduplicator = Deduplicator()
        deduped, duplicates_removed = deduplicator.deduplicate(normalized)
        logger.info(f"Deduplicated: {len(deduped)} unique, {duplicates_removed} removed")
        
        # 4. Load to Supabase
        loader = SupabaseLoader()
        inserted, updated = loader.bulk_upsert(deduped)
        logger.info(f"Loaded: {inserted} inserted, {updated} updated")
        
        # 5. Enforce expiration
        expiration_enforcer = ExpirationEnforcer()
        expired_count = expiration_enforcer.mark_expired()
        logger.info(f"Marked {expired_count} jobs as expired")
        
        logger.info("Daily job scrape completed successfully")
        
    except Exception as e:
        logger.error(f"Error during job scrape: {e}", exc_info=True)

def schedule_jobs():
    """Set up daily scheduler"""
    schedule.every().day.at(SCHEDULE_TIME).do(run_daily_job_scrape)
    
    logger.info(f"Scheduled daily job scrape at {SCHEDULE_TIME} UTC")
    
    while True:
        schedule.run_pending()
        time.sleep(60)

if __name__ == '__main__':
    schedule_jobs()
```

**Acceptance Criteria:**
- [ ] Directory structure created
- [ ] requirements.txt installs without errors (`pip install -r requirements.txt`)
- [ ] config.py reads .env correctly
- [ ] main.py imports all modules without errors
- [ ] Logging configured correctly
- [ ] Can run: `python main.py` (will wait for scheduled time, or run once for test)
- [ ] .gitignore excludes .env, __pycache__, logs/
- [ ] README documents setup + deployment

---

### WO-34: Pipeline Scrapers + Transformers
**Scope:** Implement scrapers for LinkedIn, Indeed, ZipRecruiter + transform layer  
**Status:** ❌ NOT STARTED  
**Effort:** 20 hours  
**Dependencies:** WO-26 (schema), WO-33 (pipeline structure)

**Key Implementations:**

`sources/base_scraper.py`:
```python
from abc import ABC, abstractmethod
from typing import List, Dict

class BaseScraper(ABC):
    """Base class for job scrapers"""
    
    @abstractmethod
    def fetch(self) -> List[Dict]:
        """Fetch jobs from source, return raw job data"""
        pass
    
    def rate_limit(self, delay: float = 1.0):
        """Rate limiting helper"""
        import time
        time.sleep(delay)
```

`sources/indeed_scraper.py`:
```python
import requests
from bs4 import BeautifulSoup
from .base_scraper import BaseScraper

class IndeedScraper(BaseScraper):
    """Scrape Indeed job board using RSS feed"""
    
    def fetch(self) -> List[Dict]:
        """Fetch beauty-related jobs from Indeed RSS"""
        jobs = []
        search_terms = [
            'esthetician',
            'spa director',
            'medspa nurse',
            'beauty educator',
        ]
        
        for term in search_terms:
            url = f"https://www.indeed.com/rss?q={term}&l=&jt=fulltime&radius=100"
            try:
                response = requests.get(url, timeout=10)
                # Parse RSS XML
                # Extract job data (title, company, location, URL, posted_date)
                # Yield job dicts
                jobs.extend(self._parse_rss(response.content))
            except Exception as e:
                print(f"Error fetching Indeed for '{term}': {e}")
                continue
        
        return jobs
    
    def _parse_rss(self, content):
        """Parse Indeed RSS feed"""
        import feedparser
        feed = feedparser.parse(content)
        jobs = []
        for entry in feed.entries:
            jobs.append({
                'source': 'indeed',
                'title': entry.title,
                'url': entry.link,
                'company': entry.get('author', ''),
                'location': entry.get('location', ''),
                'posted_date': entry.published,
                'description': entry.description,
            })
        return jobs
```

`transformers/job_normalizer.py`:
```python
from datetime import datetime, timedelta

class JobNormalizer:
    """Normalize raw job data to job_postings schema"""
    
    def normalize(self, raw_job: dict) -> dict:
        """Convert source job to Supabase schema"""
        return {
            'title': self._normalize_title(raw_job.get('title', '')),
            'slug': self._generate_slug(raw_job),
            'description': raw_job.get('description', ''),
            'company_id': None,  # Will be matched by company name
            'job_type': self._classify_job_type(raw_job),
            'vertical': self._classify_vertical(raw_job),
            'employment_type': self._classify_employment_type(raw_job),
            'location_city': self._extract_city(raw_job),
            'location_state': self._extract_state(raw_job),
            'location_country': 'US',
            'is_remote': self._is_remote(raw_job),
            'salary_min': self._extract_salary_min(raw_job),
            'salary_max': self._extract_salary_max(raw_job),
            'salary_currency': 'USD',
            'salary_period': 'annually',
            'experience_level': self._classify_experience(raw_job),
            'posted_date': self._parse_date(raw_job.get('posted_date')),
            'expires_at': datetime.now() + timedelta(days=90),
            'is_expired': False,
            'application_url': raw_job.get('url', ''),
            'direct_apply': True,
            'source': raw_job.get('source', 'unknown'),
            'external_job_id': self._generate_external_id(raw_job),
        }
    
    def _classify_job_type(self, job: dict) -> str:
        """Classify job type from title + description"""
        keywords = {
            'esthetician': ['esthetician', 'aesthetician', 'esthetician'],
            'spa_director': ['director', 'manager', 'owner operator'],
            'medspa_nurse': ['nurse', 'rn', 'lpn', 'medical esthetician'],
            # ... more mappings
        }
        text = f"{job.get('title', '')} {job.get('description', '')}".lower()
        for job_type, words in keywords.items():
            if any(word in text for word in words):
                return job_type
        return 'other'
    
    # ... more helper methods
```

`transformers/deduplicator.py`:
```python
import hashlib

class Deduplicator:
    """Detect and remove duplicate jobs"""
    
    def deduplicate(self, jobs: list) -> tuple:
        """Remove duplicate jobs, return (unique_jobs, duplicates_removed_count)"""
        seen = {}
        unique = []
        duplicates = 0
        
        for job in jobs:
            job_hash = self._hash_job(job)
            if job_hash not in seen:
                unique.append(job)
                seen[job_hash] = job
            else:
                duplicates += 1
        
        return unique, duplicates
    
    def _hash_job(self, job: dict) -> str:
        """Create hash of job for deduplication"""
        key = f"{job['title']}|{job['company_id']}|{job['location_city']}".lower()
        return hashlib.md5(key.encode()).hexdigest()
```

**Acceptance Criteria:**
- [ ] Scrapers fetch data from Indeed, LinkedIn, ZipRecruiter without errors
- [ ] Raw job data transformed to schema (title, location, salary, etc.)
- [ ] Deduplicator removes duplicate jobs (same title + company + city)
- [ ] Transformers handle missing data gracefully (null values)
- [ ] Unit tests pass: `pytest tests/`
- [ ] Log output shows: "Scraped X jobs", "Normalized Y jobs", "Deduplicated Z unique"

---

### WO-35: Pipeline Deployment + Monitoring
**Scope:** Deploy pipeline to production (Supabase Edge Functions or AWS Lambda), add monitoring  
**Status:** ❌ NOT STARTED  
**Effort:** 4 hours  
**Dependencies:** WO-34 (pipeline ready)

**Options:**
1. **Supabase Edge Functions** (recommended) — Deploy as HTTP endpoint, trigger daily via Vercel Cron
2. **AWS Lambda** — Scheduled via CloudWatch Events
3. **GitHub Actions** — Scheduled workflow (no infrastructure cost)
4. **Self-hosted** — EC2 instance running main.py with systemd timer

**Recommended: GitHub Actions**

`.github/workflows/daily-job-scrape.yml`:
```yaml
name: Daily Job Scrape
on:
  schedule:
    - cron: '0 6 * * *'  # 6 AM UTC daily

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r socelle-jobs-pipeline/requirements.txt
      - run: python socelle-jobs-pipeline/main.py
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
      - name: Notify Slack on failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            text: "Job scrape failed"
```

**Monitoring:**
- Slack notifications on pipeline failures
- Email alerts if jobs count drops <100
- Dashboard: logs stored in CloudWatch or GitHub Actions
- Metrics: jobs scraped, inserted, updated, duplicates removed

**Acceptance Criteria:**
- [ ] Pipeline deployed + runs on schedule
- [ ] Jobs appear in Supabase 1–2 hours after scheduled time
- [ ] Slack notified on failures
- [ ] Logs stored + accessible
- [ ] Can manually trigger via CLI: `gh workflow run daily-job-scrape.yml`

---

## P5 — QA & Integration

### WO-36: Final QA + Platform Integration
**Scope:** End-to-end testing, build verification, performance, SEO validation  
**Status:** ❌ NOT STARTED  
**Effort:** 8 hours  
**Dependencies:** All above WOs

**Test Plan:**

1. **Build Verification**
   - [ ] `npx tsc --noEmit` — 0 TypeScript errors
   - [ ] `npm run build` succeeds
   - [ ] Cloudflare deployment successful

2. **Route Testing**
   - [ ] All 15 job routes live + 200 OK (see Route Architecture above)
   - [ ] `/jobs` loads with mock data
   - [ ] `/jobs/[slug]` loads with single job + applies
   - [ ] 6 SEO hubs load + are indexed by Google Search Console

3. **Functionality Testing**
   - [ ] Filter jobs: by role, vertical, location, remote, salary
   - [ ] Search jobs: autocomplete, full-text search
   - [ ] Apply for job: form submits, confirmation email sent
   - [ ] Brand posting job: job appears on /jobs immediately
   - [ ] Admin moderation: can feature/delete/review applications

4. **SEO Testing**
   - [ ] JobPosting schema valid (google.com/test/rich-results)
   - [ ] Meta titles + descriptions present on all pages
   - [ ] Canonical URLs correct
   - [ ] og:image resolves
   - [ ] 6 hub pages indexed in Google Search Console

5. **Performance Testing**
   - [ ] /jobs loads <2s (Lighthouse: >80 performance)
   - [ ] Pagination handles 1000+ jobs
   - [ ] Filters respond <500ms
   - [ ] No N+1 queries (Supabase query analysis)

6. **Mobile Testing**
   - [ ] Filters collapse on mobile
   - [ ] Job cards stack vertically
   - [ ] Apply form responsive
   - [ ] Touch targets >= 44x44px

7. **Accessibility Testing**
   - [ ] Color contrast >= 4.5:1 (WCAG AA)
   - [ ] Form labels associated with inputs
   - [ ] Keyboard navigation works
   - [ ] Screen reader compatible (test with VoiceOver)

**Acceptance Criteria:**
- [ ] Zero TypeScript errors
- [ ] All routes tested + 200 OK
- [ ] No console errors or warnings
- [ ] JobPosting schema valid
- [ ] Lighthouse score >80 (all metrics)
- [ ] Mobile viewport: 320px–1920px tested
- [ ] Form validation working (required fields, email format)
- [ ] Database queries < 500ms (p95)
- [ ] 6 SEO hubs visible in GSC (can take 2–4 weeks)
- [ ] Platform ready for launch

---

## Integration Checklist

### MainNav Update (Post-WO-28)
Add `/jobs` to NAV_LINKS in `src/components/MainNav.tsx`:
```typescript
const NAV_LINKS = [
  { to: '/intelligence', label: 'Intelligence' },
  { to: '/jobs',         label: 'Jobs' },        // ← NEW
  { to: '/protocols',    label: 'Protocols' },
  { to: '/for-buyers',   label: 'For Buyers' },
  { to: '/for-brands',   label: 'For Brands' },
  { to: '/pricing',      label: 'Pricing' },
  { to: '/about',        label: 'About' },
];
```

### Router Update (Post-WO-28, WO-30)
Add routes to `src/App.tsx`:
```typescript
// Jobs
const Jobs = lazy(() => import('./pages/public/Jobs'));
const EsthcianJobsHub = lazy(() => import('./pages/public/EsthcianJobsHub'));
const MedspaJobsHub = lazy(() => import('./pages/public/MedspaJobsHub'));
const SpaDirectorJobsHub = lazy(() => import('./pages/public/SpaDirectorJobsHub'));
const SalonJobsHub = lazy(() => import('./pages/public/SalonJobsHub'));
const RemoteBeautyJobsHub = lazy(() => import('./pages/public/RemoteBeautyJobsHub'));
const BeautyEducatorJobsHub = lazy(() => import('./pages/public/BeautyEducatorJobsHub'));

// In routes array:
<Route path="/jobs" element={<Suspense><Jobs /></Suspense>} />
<Route path="/jobs/esthetician-jobs" element={<Suspense><EsthcianJobsHub /></Suspense>} />
<Route path="/jobs/medspa-jobs" element={<Suspense><MedspaJobsHub /></Suspense>} />
<Route path="/jobs/spa-director-jobs" element={<Suspense><SpaDirectorJobsHub /></Suspense>} />
<Route path="/jobs/salon-jobs" element={<Suspense><SalonJobsHub /></Suspense>} />
<Route path="/jobs/remote-beauty-jobs" element={<Suspense><RemoteBeautyJobsHub /></Suspense>} />
<Route path="/jobs/beauty-educator-jobs" element={<Suspense><BeautyEducatorJobsHub /></Suspense>} />

// Business portal routes
<Route path="/portal/jobs/posted" element={<ProtectedRoute><BusinessJobsPosted /></ProtectedRoute>} />
<Route path="/portal/jobs/new" element={<ProtectedRoute><BusinessJobsNew /></ProtectedRoute>} />
<Route path="/portal/jobs/:id/edit" element={<ProtectedRoute><BusinessJobsEdit /></ProtectedRoute>} />
<Route path="/portal/jobs/:id/applications" element={<ProtectedRoute><BusinessJobApplications /></ProtectedRoute>} />

// Admin routes
<Route path="/admin/jobs" element={<ProtectedRoute><AdminJobsAnalytics /></ProtectedRoute>} />
<Route path="/admin/jobs/moderation" element={<ProtectedRoute><AdminJobsModeration /></ProtectedRoute>} />
```

### Footer Update
Add Jobs link to footer (if applicable):
```
Quick Links
- Protocols
- Intelligence
- Jobs        ← NEW
- About
```

---

## Deployment Sequence

**Day 1–2 (WO-26, WO-27, WO-33)**
- Create migrations, apply to Supabase
- Build service layer (jobService, jobApplicationService, jobAnalyticsService)
- Set up Python pipeline directory

**Day 3–4 (WO-28, WO-29)**
- Build Jobs page + components
- Add JobPosting schema + SEO

**Day 5 (WO-30)**
- Create 6 SEO hub pages
- Update MainNav, router, footer

**Day 6–7 (WO-31, WO-32)**
- Admin analytics dashboard
- Business portal job posting

**Day 8 (WO-34, WO-35)**
- Implement pipeline scrapers + transformers
- Deploy + schedule

**Day 9 (WO-36)**
- Full QA, build verification
- Launch

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| Supabase RLS complexity | High | Test RLS policies thoroughly; use existing auth patterns |
| Pipeline scraper legal | High | Respect robots.txt, implement User-Agent headers, rate limiting |
| Job board spam | Medium | Implement moderation queue + AI content filtering (future) |
| Performance at scale | Medium | Use materialized view, cache job listings in Redis |
| International expansion | Medium | Scope to Wave 2; don't over-engineer country logic in WO-26 |

---

## Files Modified Summary

| File | WO | Change |
|---|---|---|
| src/components/MainNav.tsx | WO-30 | Add `/jobs` link to NAV_LINKS |
| src/App.tsx | WO-28, WO-30 | Add 13 new routes (jobs pages + hubs) |
| supabase/migrations/ | WO-26 | 4 new migration files |
| src/lib/ | WO-27 | 3 new service files |
| src/pages/public/ | WO-28, WO-30 | 8 new page files |
| src/components/jobs/ | WO-28, WO-29 | 10 new component files |
| src/pages/admin/ | WO-31 | 2 new admin pages |
| src/pages/business/ | WO-32 | 4 new business portal pages |
| socelle-jobs-pipeline/ | WO-33, WO-34, WO-35 | Complete Python service |
| .github/workflows/ | WO-35 | daily-job-scrape.yml |

**Total New Files: 42**  
**Total Lines of Code (Est.): 12,000–15,000**

---

## Success Metrics (Post-Launch)

- Jobs page: 500+ monthly visits (within 3 months)
- Job applications: 50+ per month (within 3 months)
- Brand job postings: 20+ active listings (within 6 months)
- SEO hub traffic: 10k+ monthly visits (within 6 months)
- Pipeline reliability: 99.5% uptime (jobs scraped daily)

