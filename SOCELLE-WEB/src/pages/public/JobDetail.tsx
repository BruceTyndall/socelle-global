import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, MapPin, DollarSign, Clock, Building2, CheckCircle, ArrowRight } from 'lucide-react';
import { Link, useParams, Navigate } from 'react-router-dom';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import SiteFooter from '../../components/sections/SiteFooter';
import { supabase } from '../../lib/supabase';
import { type JobPosting, formatSalary } from './Jobs';

/* ══════════════════════════════════════════════════════════════════
   JobDetail — Individual job posting page
   W10-02: Live data from Supabase `public.job_postings` (by slug)
   Route: /jobs/:slug
   ══════════════════════════════════════════════════════════════════ */

const TYPE_LABELS: Record<string, string> = {
  'full-time': 'Full-Time',
  'part-time': 'Part-Time',
  'contract': 'Contract',
  'per-diem': 'Per Diem',
};

// Matches 20260305090002_job_postings.sql: employment_type, created_at
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

export default function JobDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) { setNotFound(true); setLoading(false); return; }

    async function fetchJob() {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setJob(dbToJob(data as DbJobPosting));
      }
      setLoading(false);
    }
    void fetchJob();
  }, [slug]);

  if (notFound && !loading) return <Navigate to="/jobs" replace />;

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-mn-bg font-sans">
        <MainNav />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 animate-pulse">
          <div className="h-4 bg-graphite/[0.06] rounded w-20 mb-8" />
          <div className="grid lg:grid-cols-[1fr_280px] gap-10">
            <div>
              <div className="flex gap-2 mb-4">
                <div className="h-6 bg-graphite/[0.06] rounded-full w-20" />
                <div className="h-6 bg-accent/[0.06] rounded-full w-16" />
              </div>
              <div className="h-8 bg-graphite/[0.06] rounded w-2/3 mb-2" />
              <div className="h-5 bg-graphite/[0.04] rounded w-1/3 mb-8" />
              <div className="space-y-3 mb-8">
                <div className="h-4 bg-graphite/[0.04] rounded" />
                <div className="h-4 bg-graphite/[0.04] rounded w-5/6" />
                <div className="h-4 bg-graphite/[0.04] rounded w-4/6" />
              </div>
            </div>
            <div className="h-64 bg-white rounded-[20px] border border-graphite/8" />
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (!job) return null;

  const salaryStr = formatSalary(job);
  const daysLabel = job.posted_days_ago === 1 ? '1 day ago' : `${job.posted_days_ago} days ago`;

  // JSON-LD JobPosting schema — enhanced for Google Jobs rich results
  const datePostedIso = new Date(Date.now() - job.posted_days_ago * 86400000).toISOString().split('T')[0];
  // validThrough: 30-day window from posted date (removes from rich results automatically when expired)
  const validThroughIso = new Date(Date.now() - job.posted_days_ago * 86400000 + 30 * 86400000).toISOString().split('T')[0];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location.split(',')[0]?.trim(),
        addressRegion: job.location.split(',')[1]?.trim(),
        addressCountry: 'US',
      },
    },
    employmentType: job.type.toUpperCase().replace(/-/g, '_'),
    datePosted: datePostedIso,
    validThrough: validThroughIso,
    directApply: true,
    url: `https://socelle.com/jobs/${job.slug}`,
    ...(job.salary_min && {
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: 'USD',
        value: {
          '@type': 'QuantitativeValue',
          minValue: job.salary_min,
          maxValue: job.salary_max,
          unitText: job.salary_period === 'year' ? 'YEAR' : 'HOUR',
        },
      },
    }),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://socelle.com' },
      { '@type': 'ListItem', position: 2, name: 'Jobs', item: 'https://socelle.com/jobs' },
      { '@type': 'ListItem', position: 3, name: job.title, item: `https://socelle.com/jobs/${job.slug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>{job.title} at {job.company} — Socelle Jobs</title>
        <meta
          name="description"
          content={`${job.title} at ${job.company} in ${job.location}. ${job.description.slice(0, 120)}…`}
        />
        <meta property="og:title" content={`${job.title} — ${job.company}`} />
        <meta property="og:description" content={job.description.slice(0, 160)} />
        <meta property="og:image" content="https://socelle.com/og-image.svg" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${job.title} at ${job.company}`} />
        <meta name="twitter:description" content={job.description.slice(0, 160)} />
        <link rel="canonical" href={`https://socelle.com/jobs/${job.slug}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>
      <MainNav />


      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">

        {/* Back link */}
        <BlockReveal>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-[0.8125rem] font-sans text-graphite/50 hover:text-graphite transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All jobs
          </Link>
        </BlockReveal>

        <div className="grid lg:grid-cols-[1fr_280px] gap-10 items-start">

          {/* ── Main Content ─────────────────────────────────────── */}
          <div>
            {/* Header */}
            <BlockReveal delay={40}>
              <div className="mb-8">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center h-6 px-2.5 rounded-full text-[0.75rem] font-sans font-medium bg-graphite/[0.06] text-graphite/55">
                    {TYPE_LABELS[job.type] || job.type}
                  </span>
                  <span className="inline-flex items-center h-6 px-2.5 rounded-full text-[0.75rem] font-sans font-medium bg-accent/8 text-accent capitalize">
                    {job.vertical}
                  </span>
                  {job.featured && (
                    <span className="inline-flex items-center h-6 px-2.5 rounded-full text-[0.75rem] font-sans font-medium bg-signal-up/10 text-signal-up">
                      Featured
                    </span>
                  )}
                </div>

                <h1 className="font-sans font-semibold text-[2rem] text-graphite leading-[1.15] tracking-[-0.02em] mb-2">
                  {job.title}
                </h1>
                <p className="text-[1.0625rem] text-graphite/60 font-sans">{job.company}</p>
              </div>
            </BlockReveal>

            {/* Meta row */}
            <BlockReveal delay={80}>
              <div className="flex flex-wrap gap-5 text-[0.875rem] text-graphite/55 font-sans mb-8 pb-8 border-b border-graphite/8">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </span>
                {salaryStr && (
                  <span className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    {salaryStr}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Posted {daysLabel}
                </span>
              </div>
            </BlockReveal>

            {/* About the role */}
            <BlockReveal delay={120}>
              <section className="mb-8">
                <h2 className="font-sans font-semibold text-[1.125rem] text-graphite mb-3">About the role</h2>
                <p className="text-graphite/70 font-sans leading-[1.75] text-[0.9375rem]">
                  {job.description}
                </p>
              </section>
            </BlockReveal>

            {/* Requirements */}
            {job.requirements.length > 0 && (
              <BlockReveal delay={160}>
                <section className="mb-8">
                  <h2 className="font-sans font-semibold text-[1.125rem] text-graphite mb-4">Requirements</h2>
                  <ul className="space-y-3">
                    {job.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-signal-up flex-shrink-0 mt-[3px]" />
                        <span className="text-[0.9375rem] text-graphite/70 font-sans leading-[1.6]">{req}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </BlockReveal>
            )}

            {/* Posted by */}
            <BlockReveal delay={200}>
              <div className="flex items-center gap-3 p-4 rounded-[14px] bg-graphite/[0.04] border border-graphite/8">
                <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="font-sans font-medium text-[0.875rem] text-graphite">{job.company}</p>
                  <p className="font-sans text-[0.8125rem] text-graphite/45">Verified Socelle operator</p>
                </div>
              </div>
            </BlockReveal>
          </div>

          {/* ── Apply Sidebar ──────────────────────────────────── */}
          <div className="lg:sticky lg:top-28">
            <BlockReveal delay={100}>
              <div className="bg-white rounded-[20px] border border-graphite/8 p-6 shadow-soft">
                <h3 className="font-sans font-semibold text-[1.0625rem] text-graphite mb-1">
                  Apply for this role
                </h3>
                <p className="text-[0.8125rem] text-graphite/50 font-sans mb-5">
                  Create your Socelle operator account to apply and track your application.
                </p>

                <Link
                  to="/portal/signup"
                  className="flex items-center justify-center gap-2 w-full h-[44px] bg-[#1F2428] text-[#F7F5F2] font-sans font-semibold text-sm rounded-full transition-all hover:bg-[#2a3038] mb-3"
                >
                  Apply Now
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <p className="text-center text-[0.75rem] text-graphite/35 font-sans">
                  Already have an account?{' '}
                  <Link to="/portal/login" className="text-accent hover:underline">
                    Sign in
                  </Link>
                </p>

                {salaryStr && (
                  <div className="mt-5 pt-5 border-t border-graphite/8">
                    <p className="text-[0.75rem] text-graphite/40 font-sans uppercase tracking-[0.08em] mb-1">Compensation</p>
                    <p className="font-mono font-medium text-graphite text-[0.9375rem]">{salaryStr}</p>
                  </div>
                )}

                <div className="mt-4">
                  <p className="text-[0.75rem] text-graphite/40 font-sans uppercase tracking-[0.08em] mb-1">Employment Type</p>
                  <p className="font-sans font-medium text-graphite text-[0.875rem]">{TYPE_LABELS[job.type]}</p>
                </div>

                <div className="mt-4">
                  <p className="text-[0.75rem] text-graphite/40 font-sans uppercase tracking-[0.08em] mb-1">Location</p>
                  <p className="font-sans font-medium text-graphite text-[0.875rem]">{job.location}</p>
                </div>
              </div>

              {/* Back to jobs */}
              <Link
                to="/jobs"
                className="flex items-center justify-center gap-1.5 mt-4 text-[0.8125rem] text-graphite/50 hover:text-graphite font-sans transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                View all jobs
              </Link>
            </BlockReveal>
          </div>

        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
