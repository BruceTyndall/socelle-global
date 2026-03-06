import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { MapPin, DollarSign, Clock, ArrowRight, Briefcase, Building2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import SiteFooter from '../../components/sections/SiteFooter';
import { supabase } from '../../lib/supabase';

/* ══════════════════════════════════════════════════════════════════
   Jobs — Professional Beauty Job Board
   W10-02: Live data from Supabase `public.job_postings` table
   ══════════════════════════════════════════════════════════════════ */

type JobVertical = 'all' | 'spa' | 'medspa' | 'salon' | 'clinic';
type JobType = 'all' | 'full-time' | 'part-time' | 'contract' | 'per-diem';

export interface JobPosting {
  slug: string;
  title: string;
  company: string;
  location: string;
  vertical: Exclude<JobVertical, 'all'>;
  type: Exclude<JobType, 'all'>;
  salary_min?: number;
  salary_max?: number;
  salary_period: 'hour' | 'year';
  description: string;
  requirements: string[];
  posted_days_ago: number;
  featured?: boolean;
}

// Raw DB shape — matches 20260305090002_job_postings.sql schema
// employment_type (not 'type'), created_at (not 'posted_at')
interface DbJobPosting {
  slug: string;
  title: string;
  company: string;
  location: string;
  vertical: string;
  employment_type: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_period: string;
  description: string;
  requirements: string[];
  featured: boolean;
  created_at: string;
}

function computeDaysAgo(postedAt: string): number {
  const ms = Date.now() - new Date(postedAt).getTime();
  return Math.max(1, Math.round(ms / 86400000));
}

function dbToJob(row: DbJobPosting): JobPosting {
  return {
    slug: row.slug,
    title: row.title,
    company: row.company,
    location: row.location,
    vertical: row.vertical as JobPosting['vertical'],
    type: row.employment_type as JobPosting['type'],
    salary_min: row.salary_min ?? undefined,
    salary_max: row.salary_max ?? undefined,
    salary_period: row.salary_period as JobPosting['salary_period'],
    description: row.description,
    requirements: row.requirements ?? [],
    posted_days_ago: computeDaysAgo(row.created_at),
    featured: row.featured,
  };
}

const TYPE_LABELS: Record<Exclude<JobType, 'all'>, string> = {
  'full-time': 'Full-Time',
  'part-time': 'Part-Time',
  'contract': 'Contract',
  'per-diem': 'Per Diem',
};

const VERTICAL_FILTER_OPTS: { value: JobVertical; label: string }[] = [
  { value: 'all', label: 'All Verticals' },
  { value: 'spa', label: 'Spa' },
  { value: 'medspa', label: 'Medspa' },
  { value: 'salon', label: 'Salon' },
  { value: 'clinic', label: 'Clinic' },
];

const TYPE_FILTER_OPTS: { value: JobType; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'full-time', label: 'Full-Time' },
  { value: 'part-time', label: 'Part-Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'per-diem', label: 'Per Diem' },
];

export function formatSalary(job: Pick<JobPosting, 'salary_min' | 'salary_max' | 'salary_period'>): string {
  const fmt = (n: number) =>
    job.salary_period === 'year'
      ? `$${Math.round(n / 1000)}k`
      : `$${n}/hr`;
  if (job.salary_min && job.salary_max) return `${fmt(job.salary_min)}–${fmt(job.salary_max)}`;
  if (job.salary_min) return `From ${fmt(job.salary_min)}`;
  if (job.salary_max) return `Up to ${fmt(job.salary_max)}`;
  return '';
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Professional Beauty Jobs | Socelle',
  description: 'Job board for licensed estheticians, spa directors, medspa professionals, and beauty industry operators.',
  url: 'https://socelle.com/jobs',
  publisher: { '@type': 'Organization', name: 'Socelle', url: 'https://socelle.com' },
};

export default function Jobs() {
  const [verticalFilter, setVerticalFilter] = useState<JobVertical>('all');
  const [typeFilter, setTypeFilter] = useState<JobType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setJobs((data as DbJobPosting[]).map(dbToJob));
      }
      setLoading(false);
    }
    void fetchJobs();
  }, []);

  const filtered = jobs.filter((job) => {
    const vMatch = verticalFilter === 'all' || job.vertical === verticalFilter;
    const tMatch = typeFilter === 'all' || job.type === typeFilter;
    const q = searchQuery.toLowerCase().trim();
    const sMatch = !q || job.title.toLowerCase().includes(q) || job.company.toLowerCase().includes(q) || job.location.toLowerCase().includes(q);
    return vMatch && tMatch && sMatch;
  });

  const featured = filtered.filter((j) => j.featured);
  const rest = filtered.filter((j) => !j.featured);

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>Professional Beauty Jobs — Socelle</title>
        <meta
          name="description"
          content="Job board for licensed estheticians, spa directors, injectors, medical estheticians, and salon professionals. Posted by verified operators."
        />
        <meta property="og:title" content="Professional Beauty Jobs — Socelle" />
        <meta
          property="og:description"
          content="Find jobs at spas, medspas, salons, and clinics. Licensed beauty professionals only."
        />
        <link rel="canonical" href="https://socelle.com/jobs" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <MainNav />

      {/* ── Dark Hero ────────────────────────────────────────────── */}
      <section className="bg-mn-dark pt-24 pb-16 lg:pt-32 lg:pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <BlockReveal>
            <p className="text-[0.75rem] tracking-[0.18em] font-medium uppercase text-white/30 mb-5">
              CAREER INTELLIGENCE
            </p>
          </BlockReveal>
          <BlockReveal delay={80}>
            <h1 className="font-sans font-semibold text-section text-[#F7F5F2] mb-5 max-w-3xl leading-[1.08] tracking-[-0.02em]">
              Jobs Intelligence
            </h1>
          </BlockReveal>
          <BlockReveal delay={160}>
            <p className="text-[1.125rem] text-white/55 font-sans max-w-2xl mb-10">
              Verified live beauty and wellness roles — filtered by specialty, market, and demand.
            </p>
          </BlockReveal>

          <BlockReveal delay={200}>
            <div className="flex flex-wrap gap-4 mb-10">
              <Link to="/portal/signup" className="inline-flex items-center justify-center h-[48px] px-7 bg-accent text-white font-sans font-semibold text-sm rounded-full transition-all hover:bg-accent-hover hover:-translate-y-[1px]">
                Create Your Profile
              </Link>
              <Link to="/jobs" className="inline-flex items-center justify-center rounded-full h-[48px] px-7 bg-white/10 text-[#F7F5F2] border border-[rgba(247,245,242,0.16)] font-sans font-medium text-sm hover:bg-white/15 transition-all duration-200">
                View Job Demand
              </Link>
            </div>
          </BlockReveal>

          {/* Stats row */}
          <BlockReveal delay={240}>
            <div className="flex flex-wrap gap-8">
              <div>
                <p className="font-mono text-2xl font-bold text-[#F7F5F2]">
                  {loading ? '—' : jobs.length}
                </p>
                <p className="text-[0.8125rem] text-white/40 mt-0.5">open roles</p>
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-[#F7F5F2]">12</p>
                <p className="text-[0.8125rem] text-white/40 mt-0.5">markets</p>
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-[#F7F5F2]">4</p>
                <p className="text-[0.8125rem] text-white/40 mt-0.5">verticals</p>
              </div>
            </div>
          </BlockReveal>
        </div>
      </section>

      {/* ── Search + Filters ──────────────────────────────────────── */}
      <section className="border-b border-graphite/8 bg-white/40 backdrop-blur-[8px] sticky top-[72px] z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/35 pointer-events-none" />
              <input
                type="text"
                placeholder="Title, company, city…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-full bg-white/70 border border-graphite/10 text-[0.8125rem] font-sans text-graphite placeholder-graphite/35 focus:outline-none focus:ring-1 focus:ring-accent/30"
              />
            </div>

            {/* Vertical filters */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {VERTICAL_FILTER_OPTS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setVerticalFilter(f.value)}
                  className={`
                    inline-flex items-center h-8 px-3.5 rounded-full text-[0.8125rem] font-sans font-medium
                    transition-colors duration-150
                    ${verticalFilter === f.value
                      ? 'bg-graphite text-[#F7F5F2]'
                      : 'text-graphite/55 hover:text-graphite hover:bg-black/[0.04]'
                    }
                  `}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-graphite/12 hidden sm:block self-center" />

            {/* Type filters */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {TYPE_FILTER_OPTS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setTypeFilter(f.value)}
                  className={`
                    inline-flex items-center h-8 px-3.5 rounded-full text-[0.8125rem] font-sans font-medium
                    transition-colors duration-150
                    ${typeFilter === f.value
                      ? 'bg-accent/15 text-accent'
                      : 'text-graphite/55 hover:text-graphite hover:bg-black/[0.04]'
                    }
                  `}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <span className="ml-auto text-[0.8125rem] text-graphite/40 font-sans self-center hidden lg:block">
              {loading ? '…' : `${filtered.length} ${filtered.length === 1 ? 'role' : 'roles'}`}
            </span>
          </div>
        </div>
      </section>

      {/* ── Job Listings ──────────────────────────────────────────── */}
      <section className="pt-12 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-[16px] border border-graphite/8 px-6 py-5 animate-pulse">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="h-5 bg-graphite/[0.06] rounded w-1/3 mb-2" />
                      <div className="h-4 bg-graphite/[0.04] rounded w-1/4 mb-4" />
                      <div className="flex gap-4">
                        <div className="h-3 bg-graphite/[0.04] rounded w-24" />
                        <div className="h-3 bg-graphite/[0.04] rounded w-20" />
                        <div className="h-3 bg-graphite/[0.04] rounded w-16" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="h-6 bg-graphite/[0.06] rounded-full w-20" />
                      <div className="h-6 bg-accent/[0.06] rounded-full w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state (after load) */}
          {!loading && filtered.length === 0 && (
            <div className="text-center py-20">
              <Briefcase className="w-10 h-10 text-graphite/20 mx-auto mb-4" />
              <p className="text-graphite/50 font-sans">No jobs match your current filters.</p>
              <button
                onClick={() => { setVerticalFilter('all'); setTypeFilter('all'); setSearchQuery(''); }}
                className="mt-4 text-accent text-sm font-sans hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}

          {/* Featured */}
          {!loading && featured.length > 0 && (
            <div className="mb-10">
              <p className="text-[0.75rem] tracking-[0.14em] uppercase font-medium text-graphite/35 font-sans mb-5">FEATURED ROLES</p>
              <div className="space-y-3">
                {featured.map((job) => (
                  <JobRow key={job.slug} job={job} featured />
                ))}
              </div>
            </div>
          )}

          {/* All others */}
          {!loading && rest.length > 0 && (
            <div>
              {featured.length > 0 && (
                <p className="text-[0.75rem] tracking-[0.14em] uppercase font-medium text-graphite/35 font-sans mb-5">ALL ROLES</p>
              )}
              <div className="space-y-3">
                {rest.map((job) => (
                  <JobRow key={job.slug} job={job} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Post a job CTA ──────────────────────────────────────── */}
      <section className="bg-mn-dark py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Building2 className="w-8 h-8 text-white/20 mx-auto mb-4" />
          <h2 className="font-sans font-semibold text-subsection text-[#F7F5F2] mb-4">
            Hiring beauty professionals?
          </h2>
          <p className="text-white/55 font-sans max-w-lg mx-auto mb-8">
            Post roles to Socelle's verified operator network. Reach licensed professionals
            who are actively seeking positions in your vertical.
          </p>
          <Link
            to="/request-access"
            className="inline-flex items-center gap-2 h-[48px] px-7 bg-accent text-white font-sans font-semibold text-sm rounded-full transition-all hover:bg-accent-hover hover:-translate-y-[1px]"
          >
            Request Operator Access
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

// ── Job Row Component ─────────────────────────────────────────────────

function JobRow({ job, featured }: { job: JobPosting; featured?: boolean }) {
  const salaryStr = formatSalary(job);
  const daysLabel = job.posted_days_ago === 1 ? '1 day ago' : `${job.posted_days_ago} days ago`;

  return (
    <BlockReveal>
      <Link
        to={`/jobs/${job.slug}`}
        className={`
          block bg-white rounded-[16px] border border-graphite/8 px-6 py-5
          transition-all duration-200 hover:shadow-panel hover:-translate-y-[1px] hover:border-accent/20
          ${featured ? 'ring-1 ring-accent/20' : ''}
        `}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h3 className="font-sans font-semibold text-[1rem] text-graphite leading-snug">
                {job.title}
              </h3>
              {featured && (
                <span className="inline-flex items-center h-5 px-2 rounded-full text-[0.7rem] font-sans font-medium bg-accent/8 text-accent">
                  Featured
                </span>
              )}
            </div>
            <p className="text-[0.875rem] text-graphite/60 font-sans mb-3">{job.company}</p>

            <div className="flex flex-wrap items-center gap-4 text-[0.8125rem] text-graphite/50 font-sans">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {job.location}
              </span>
              {salaryStr && (
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  {salaryStr}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {daysLabel}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className="inline-flex items-center h-6 px-2.5 rounded-full text-[0.75rem] font-sans font-medium bg-graphite/[0.06] text-graphite/55">
              {TYPE_LABELS[job.type]}
            </span>
            <span className="inline-flex items-center h-6 px-2.5 rounded-full text-[0.75rem] font-sans font-medium bg-accent/8 text-accent capitalize">
              {job.vertical}
            </span>
          </div>
        </div>
      </Link>
    </BlockReveal>
  );
}
