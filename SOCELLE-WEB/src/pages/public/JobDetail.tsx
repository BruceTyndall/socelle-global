import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  CheckCircle,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Link, useParams, Navigate } from 'react-router-dom';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import SiteFooter from '../../components/sections/SiteFooter';
import {
  useJobDetail,
  useRelatedJobs,
  useTalentSignals,
  formatSalary,
  daysAgo,
  daysAgoLabel,
} from '../../lib/useJobPostings';

/* ══════════════════════════════════════════════════════════════════
   JobDetail — V2-HUBS-02: Full non-shell Jobs Hub
   Route: /jobs/:slug
   - TanStack Query v5 via useJobDetail / useRelatedJobs / useTalentSignals
   - Schema.org JobPosting + BreadcrumbList JSON-LD
   - Related signals section
   - Related jobs section (3 similar by vertical)
   - Skeleton shimmer, error with retry
   ══════════════════════════════════════════════════════════════════ */

const TYPE_LABELS: Record<string, string> = {
  'full-time': 'Full-Time',
  'Full-time': 'Full-Time',
  'part-time': 'Part-Time',
  'Part-time': 'Part-Time',
  'contract': 'Contract',
  'Contract': 'Contract',
  'per-diem': 'Per Diem',
  'Per Diem': 'Per Diem',
};

const DirectionIcon = ({ direction }: { direction: string }) => {
  if (direction === 'up') return <TrendingUp className="w-4 h-4 text-[#5F8A72]" />;
  if (direction === 'down') return <TrendingDown className="w-4 h-4 text-[#8E6464]" />;
  return <Minus className="w-4 h-4 text-[#141418]/40" />;
};

const directionLabel = (d: string) => {
  if (d === 'up') return 'trending up';
  if (d === 'down') return 'trending down';
  return 'stable';
};

export default function JobDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { job, loading, error, isLive } = useJobDetail(slug);
  const { relatedJobs, loading: relatedLoading } = useRelatedJobs(job?.vertical, slug);
  const { signals: talentSignals, loading: signalsLoading } = useTalentSignals();

  // Not found → redirect to /jobs
  if (!loading && !error && !job && slug) {
    return <Navigate to="/jobs" replace />;
  }

  // ── Loading skeleton ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F3EF] font-sans">
        <MainNav />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 animate-pulse">
          <div className="h-4 bg-[#141418]/[0.06] rounded w-20 mb-8" />
          <div className="grid lg:grid-cols-[1fr_280px] gap-10">
            <div>
              <div className="flex gap-2 mb-4">
                <div className="h-6 bg-[#141418]/[0.06] rounded-full w-20" />
                <div className="h-6 bg-[#6E879B]/[0.06] rounded-full w-16" />
              </div>
              <div className="h-8 bg-[#141418]/[0.06] rounded w-2/3 mb-2" />
              <div className="h-5 bg-[#141418]/[0.04] rounded w-1/3 mb-8" />
              <div className="space-y-3 mb-8">
                <div className="h-4 bg-[#141418]/[0.04] rounded" />
                <div className="h-4 bg-[#141418]/[0.04] rounded w-5/6" />
                <div className="h-4 bg-[#141418]/[0.04] rounded w-4/6" />
              </div>
            </div>
            <div className="h-64 bg-white rounded-2xl border border-[#141418]/[0.08]" />
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-[#F6F3EF] font-sans">
        <MainNav />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 text-center">
          <AlertCircle className="w-10 h-10 text-[#8E6464] mx-auto mb-4" />
          <h1 className="font-sans font-semibold text-xl text-[#141418] mb-2">
            Unable to load this job
          </h1>
          <p className="text-sm text-[#141418]/50 mb-6">
            We encountered an issue fetching the job details. Please try again.
          </p>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#6E879B] text-white text-sm font-medium hover:bg-[#5A7185] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  if (!job) return null;

  const salaryStr = formatSalary(job);
  const days = daysAgo(job.posted_at);
  const daysLabel = daysAgoLabel(days);
  const typeLabel = TYPE_LABELS[job.type] || job.type;

  // JSON-LD JobPosting schema
  const datePostedIso = job.posted_at.split('T')[0];
  const validThroughMs = new Date(job.posted_at).getTime() + 30 * 86_400_000;
  const validThroughIso = new Date(validThroughMs).toISOString().split('T')[0];

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
    employmentType: job.type.toUpperCase().replace(/-/g, '_').replace(/ /g, '_'),
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
          unitText: job.salary_period === 'hour' ? 'HOUR' : 'YEAR',
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
    <div className="min-h-screen bg-[#F6F3EF] font-sans">
      <Helmet>
        <title>{job.title} at {job.company} - Socelle Jobs</title>
        <meta
          name="description"
          content={`${job.title} at ${job.company} in ${job.location}. ${job.description.slice(0, 120)}`}
        />
        <meta property="og:title" content={`${job.title} - ${job.company}`} />
        <meta property="og:description" content={job.description.slice(0, 160)} />
        <meta property="og:image" content="https://socelle.com/og-image.svg" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://socelle.com/jobs/${job.slug}`} />
        <meta name="robots" content="index, follow" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${job.title} at ${job.company}`} />
        <meta name="twitter:description" content={job.description.slice(0, 160)} />
        <link rel="canonical" href={`https://socelle.com/jobs/${job.slug}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
      </Helmet>
      <MainNav />

      <div className="relative">
        {/* Decorative brand photo */}
        <img
          src="/images/brand/photos/17.svg"
          alt=""
          aria-hidden="true"
          className="absolute right-0 top-0 h-[480px] w-1/3 object-cover opacity-[0.04] pointer-events-none select-none hidden lg:block"
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 relative z-10">
          {/* Back link */}
          <BlockReveal>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-1.5 text-[0.8125rem] font-sans text-[#141418]/50 hover:text-[#141418] transition-colors mb-8"
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
                    <span className="inline-flex items-center h-6 px-2.5 rounded-full text-[0.75rem] font-sans font-medium bg-[#141418]/[0.06] text-[#141418]/55">
                      {typeLabel}
                    </span>
                    <span className="inline-flex items-center h-6 px-2.5 rounded-full text-[0.75rem] font-sans font-medium bg-[#6E879B]/[0.08] text-[#6E879B] capitalize">
                      {job.vertical}
                    </span>
                    {job.featured && (
                      <span className="inline-flex items-center h-6 px-2.5 rounded-full text-[0.75rem] font-sans font-medium bg-[#5F8A72]/10 text-[#5F8A72]">
                        Featured
                      </span>
                    )}
                    {!isLive && (
                      <span className="inline-flex items-center h-6 px-2.5 rounded-full text-[0.75rem] font-sans font-semibold bg-[#A97A4C]/10 text-[#A97A4C]">
                        DEMO
                      </span>
                    )}
                  </div>

                  <h1 className="font-sans font-semibold text-[2rem] text-[#141418] leading-[1.15] tracking-[-0.02em] mb-2">
                    {job.title}
                  </h1>
                  <p className="text-[1.0625rem] text-[#141418]/60 font-sans">{job.company}</p>
                </div>
              </BlockReveal>

              {/* Meta row */}
              <BlockReveal delay={80}>
                <div className="flex flex-wrap gap-5 text-[0.875rem] text-[#141418]/55 font-sans mb-8 pb-8 border-b border-[#141418]/[0.08]">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </span>
                  {salaryStr !== 'Competitive' && (
                    <span className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      {salaryStr}
                    </span>
                  )}
                  <span className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    {typeLabel}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Posted {daysLabel}
                  </span>
                </div>
              </BlockReveal>

              {/* About the role */}
              <BlockReveal delay={120}>
                <section className="mb-8">
                  <h2 className="font-sans font-semibold text-[1.125rem] text-[#141418] mb-3">About the role</h2>
                  <p className="text-[#141418]/70 font-sans leading-[1.75] text-[0.9375rem]">
                    {job.description}
                  </p>
                </section>
              </BlockReveal>

              {/* Requirements */}
              {job.requirements.length > 0 && (
                <BlockReveal delay={160}>
                  <section className="mb-8">
                    <h2 className="font-sans font-semibold text-[1.125rem] text-[#141418] mb-4">Requirements</h2>
                    <ul className="space-y-3">
                      {job.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle className="w-4 h-4 text-[#5F8A72] flex-shrink-0 mt-[3px]" />
                          <span className="text-[0.9375rem] text-[#141418]/70 font-sans leading-[1.6]">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </BlockReveal>
              )}

              {/* ── Related Signals ────────────────────────────────── */}
              <BlockReveal delay={200}>
                <section className="mb-8">
                  <h2 className="font-sans font-semibold text-[1.125rem] text-[#141418] mb-4">
                    Demand Signals
                  </h2>
                  {signalsLoading ? (
                    <div className="space-y-3">
                      {[0, 1].map((i) => (
                        <div key={i} className="bg-white rounded-xl p-4 border border-[#141418]/5 animate-pulse">
                          <div className="h-4 w-3/4 bg-[#141418]/[0.06] rounded mb-2" />
                          <div className="h-3 w-full bg-[#141418]/[0.04] rounded" />
                        </div>
                      ))}
                    </div>
                  ) : talentSignals.length > 0 ? (
                    <div className="space-y-3">
                      {talentSignals.map((signal) => (
                        <div
                          key={signal.id}
                          className="bg-white rounded-xl p-4 border border-[#141418]/5"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-sans font-medium text-sm text-[#141418]">
                              {signal.title}
                            </p>
                            <DirectionIcon direction={signal.direction} />
                          </div>
                          <p className="text-xs text-[#141418]/50 leading-relaxed">
                            Demand for {job.vertical} roles is {directionLabel(signal.direction)}{signal.region ? ` in ${signal.region}` : ''}.
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#141418]/40">
                      No demand signals available for this role category at this time.
                    </p>
                  )}
                </section>
              </BlockReveal>

              {/* Posted by */}
              <BlockReveal delay={240}>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-[#141418]/[0.04] border border-[#141418]/[0.08]">
                  <div className="w-9 h-9 rounded-full bg-[#6E879B]/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-[#6E879B]" />
                  </div>
                  <div>
                    <p className="font-sans font-medium text-[0.875rem] text-[#141418]">{job.company}</p>
                    <p className="font-sans text-[0.8125rem] text-[#141418]/45">Verified Socelle operator</p>
                  </div>
                </div>
              </BlockReveal>
            </div>

            {/* ── Apply Sidebar ──────────────────────────────────── */}
            <div className="lg:sticky lg:top-28">
              <BlockReveal delay={100}>
                <div className="bg-white rounded-2xl border border-[#141418]/[0.08] p-6 shadow-sm">
                  <h3 className="font-sans font-semibold text-[1.0625rem] text-[#141418] mb-1">
                    Apply for this role
                  </h3>
                  <p className="text-[0.8125rem] text-[#141418]/50 font-sans mb-5">
                    Create your Socelle operator account to apply and track your application.
                  </p>

                  <Link
                    to="/portal/signup"
                    className="flex items-center justify-center gap-2 w-full h-[44px] bg-[#141418] text-[#F6F3EF] font-sans font-semibold text-sm rounded-full transition-all hover:bg-[#141418]/90 mb-3"
                  >
                    Apply Now
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <p className="text-center text-[0.75rem] text-[#141418]/35 font-sans">
                    Already have an account?{' '}
                    <Link to="/portal/login" className="text-[#6E879B] hover:underline">
                      Sign in
                    </Link>
                  </p>

                  {salaryStr !== 'Competitive' && (
                    <div className="mt-5 pt-5 border-t border-[#141418]/[0.08]">
                      <p className="text-[0.75rem] text-[#141418]/40 font-sans uppercase tracking-[0.08em] mb-1">Compensation</p>
                      <p className="font-sans font-medium text-[#141418] text-[0.9375rem]">{salaryStr}</p>
                    </div>
                  )}

                  <div className="mt-4">
                    <p className="text-[0.75rem] text-[#141418]/40 font-sans uppercase tracking-[0.08em] mb-1">Employment Type</p>
                    <p className="font-sans font-medium text-[#141418] text-[0.875rem]">{typeLabel}</p>
                  </div>

                  <div className="mt-4">
                    <p className="text-[0.75rem] text-[#141418]/40 font-sans uppercase tracking-[0.08em] mb-1">Location</p>
                    <p className="font-sans font-medium text-[#141418] text-[0.875rem]">{job.location}</p>
                  </div>
                </div>

                {/* Back to jobs */}
                <Link
                  to="/jobs"
                  className="flex items-center justify-center gap-1.5 mt-4 text-[0.8125rem] text-[#141418]/50 hover:text-[#141418] font-sans transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  View all jobs
                </Link>
              </BlockReveal>
            </div>
          </div>

          {/* ── Related Jobs ──────────────────────────────────────── */}
          {!relatedLoading && relatedJobs.length > 0 && (
            <section className="mt-16 pt-12 border-t border-[#141418]/[0.08]">
              <BlockReveal>
                <h2 className="font-sans font-semibold text-lg text-[#141418] mb-6">
                  Similar Positions
                </h2>
              </BlockReveal>
              <div className="grid sm:grid-cols-3 gap-4">
                {relatedJobs.map((rj) => {
                  const rSalary = formatSalary(rj);
                  const rDays = daysAgo(rj.posted_at);
                  return (
                    <BlockReveal key={rj.slug}>
                      <Link
                        to={`/jobs/${rj.slug}`}
                        className="block bg-white rounded-xl p-4 border border-[#141418]/5 hover:shadow-md transition-shadow"
                      >
                        <span className="text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full font-medium bg-[#6E879B]/[0.08] text-[#6E879B]">
                          {rj.vertical}
                        </span>
                        <h3 className="font-sans font-medium text-sm text-[#141418] mt-2 mb-1 leading-snug">
                          {rj.title}
                        </h3>
                        <p className="text-xs text-[#141418]/50">{rj.company}</p>
                        <div className="flex flex-wrap gap-2 mt-2 text-[10px] text-[#141418]/35">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {rj.location}
                          </span>
                          <span>{rSalary}</span>
                          <span>{daysAgoLabel(rDays)}</span>
                        </div>
                      </Link>
                    </BlockReveal>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
