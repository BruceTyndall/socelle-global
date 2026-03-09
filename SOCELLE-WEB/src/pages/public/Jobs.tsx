import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight,
  MapPin,
  Clock,
  Briefcase,
  Search,
  X,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  RefreshCw,
  FileSearch,
} from 'lucide-react';
import JsonLd from '../../components/seo/JsonLd';
import {
  DEFAULT_OG_IMAGE,
  buildCanonical,
  buildCollectionPageSchema,
} from '../../lib/seo';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import SiteFooter from '../../components/sections/SiteFooter';
import {
  useJobPostings,
  useTalentSignals,
  formatSalary,
  daysAgo,
  daysAgoLabel,
  jobsToCsv,
  type JobPostingRow,
} from '../../lib/useJobPostings';

/* ══════════════════════════════════════════════════════════════════
   Jobs — V2-HUBS-02: Full non-shell Jobs Hub
   - TanStack Query v5 via useJobPostings / useTalentSignals
   - Filters: category, location, type, salary range, search
   - CSV export, skeleton shimmer, empty state, error with retry
   - Talent intelligence section from market_signals
   - Schema.org CollectionPage JSON-LD
   ══════════════════════════════════════════════════════════════════ */

const CATEGORIES = ['All', 'Esthetician', 'Stylist', 'Medspa Provider', 'Educator', 'Front Desk', 'Manager'] as const;
const JOB_TYPES = ['All', 'Full-time', 'Part-time', 'Contract', 'Per Diem'] as const;

function CategoryBadge({ vertical }: { vertical: string }) {
  return (
    <span className="text-[10px] tracking-widest uppercase px-2.5 py-0.5 rounded-full font-medium bg-accent/8 text-accent">
      {vertical}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span className="text-[10px] tracking-widest uppercase px-2.5 py-0.5 rounded-full font-medium bg-graphite/[0.06] text-graphite/55">
      {type}
    </span>
  );
}

const DirectionIcon = ({ direction }: { direction: string }) => {
  if (direction === 'up') return <TrendingUp className="w-4 h-4 text-signal-up" aria-hidden="true" />;
  if (direction === 'down') return <TrendingDown className="w-4 h-4 text-signal-down" aria-hidden="true" />;
  return <Minus className="w-4 h-4 text-graphite/40" aria-hidden="true" />;
};

/* ── Skeleton shimmer ──────────────────────────────────────────── */
function JobCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-graphite/5 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <div className="h-5 w-20 bg-graphite/[0.06] rounded-full" />
            <div className="h-5 w-16 bg-graphite/[0.06] rounded-full" />
          </div>
          <div className="h-5 w-2/3 bg-graphite/[0.06] rounded" />
          <div className="h-4 w-1/3 bg-graphite/[0.04] rounded" />
          <div className="flex gap-3">
            <div className="h-4 w-24 bg-graphite/[0.04] rounded" />
            <div className="h-4 w-20 bg-graphite/[0.04] rounded" />
          </div>
        </div>
        <div className="h-9 w-20 bg-graphite/[0.06] rounded-full" />
      </div>
    </div>
  );
}

function SignalCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 border border-graphite/5 animate-pulse">
      <div className="h-4 w-3/4 bg-graphite/[0.06] rounded mb-2" />
      <div className="h-3 w-full bg-graphite/[0.04] rounded mb-1" />
      <div className="h-3 w-2/3 bg-graphite/[0.04] rounded" />
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function Jobs() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const { jobs, loading, error, isLive, refetch } = useJobPostings({
    category: categoryFilter !== 'All' ? categoryFilter : undefined,
    type: typeFilter !== 'All' ? typeFilter : undefined,
    search: search || undefined,
  });

  const { signals: talentSignals, loading: signalsLoading, isLive: signalsLive } = useTalentSignals();

  // Split featured vs. rest
  const featured = useMemo(() => jobs.find((j) => j.featured), [jobs]);
  const listings = useMemo(() => jobs.filter((j) => !j.featured), [jobs]);

  // CSV export
  const handleExport = useCallback(() => {
    const csv = jobsToCsv(jobs);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `socelle-jobs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [jobs]);

  // Schema.org JobPosting JSON-LD for each job
  const jobPostingSchemas = useMemo(
    () =>
      jobs.slice(0, 20).map((j) => ({
        '@context': 'https://schema.org' as const,
        '@type': 'JobPosting' as const,
        title: j.title,
        description: j.description,
        hiringOrganization: { '@type': 'Organization' as const, name: j.company },
        jobLocation: {
          '@type': 'Place' as const,
          address: {
            '@type': 'PostalAddress' as const,
            addressLocality: j.location.split(',')[0]?.trim(),
            addressRegion: j.location.split(',')[1]?.trim(),
            addressCountry: 'US',
          },
        },
        employmentType: j.type.toUpperCase().replace(/-/g, '_').replace(/ /g, '_'),
        datePosted: j.posted_at.split('T')[0],
        url: `https://socelle.com/jobs/${j.slug}`,
        ...(j.salary_min && {
          baseSalary: {
            '@type': 'MonetaryAmount' as const,
            currency: 'USD',
            value: {
              '@type': 'QuantitativeValue' as const,
              minValue: j.salary_min,
              maxValue: j.salary_max,
              unitText: j.salary_period === 'hour' ? 'HOUR' : 'YEAR',
            },
          },
        }),
      })),
    [jobs],
  );

  return (
    <div className="min-h-screen bg-[#F6F3EF] font-sans">
      <Helmet>
        <title>Jobs - Socelle</title>
        <meta
          name="description"
          content="Find careers in professional beauty, medspa, and aesthetics. Browse open positions for estheticians, stylists, medspa providers, educators, and managers."
        />
        <meta property="og:title" content="Jobs - Socelle" />
        <meta
          property="og:description"
          content="Professional beauty and medspa career opportunities. Positions for estheticians, stylists, medspa providers, and more."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={buildCanonical('/jobs')} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={buildCanonical('/jobs')} />
      </Helmet>
      <JsonLd
        data={buildCollectionPageSchema({
          name: 'Professional Beauty Jobs',
          description:
            'Browse open positions in professional beauty, medspa, and aesthetics.',
          url: buildCanonical('/jobs'),
        })}
      />
      {/* Individual JobPosting schemas */}
      {jobPostingSchemas.map((schema, i) => (
        <JsonLd key={i} data={schema} />
      ))}
      <MainNav />

      <main id="main-content">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[55vh] flex items-center overflow-hidden">
        <img
          src="/images/brand/photos/20.svg"
          alt="Careers in professional beauty"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0 bg-white/60 backdrop-blur-xl"
          aria-hidden="true"
        />
        <div className="relative section-container text-center py-24 lg:py-32">
          <BlockReveal>
            <div className="flex items-center justify-center gap-3 mb-5">
              <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-[#141418]/40">
                Careers
              </p>
              {!isLive && !loading && (
                <span className="text-[10px] font-semibold bg-[#A97A4C]/10 text-[#A97A4C] px-2 py-0.5 rounded-full">
                  DEMO
                </span>
              )}
            </div>
          </BlockReveal>
          <BlockReveal delay={60}>
            <h1 className="font-sans font-semibold text-hero text-[#141418] mb-8 max-w-3xl mx-auto">
              Professional Beauty Careers
            </h1>
          </BlockReveal>
          <BlockReveal delay={120}>
            <p className="text-body-lg text-[#141418]/60 max-w-2xl mx-auto">
              Find your next role in aesthetics, medspa, wellness, and professional
              beauty. Positions for estheticians, stylists, providers, educators,
              and more.
            </p>
          </BlockReveal>
        </div>
      </section>

      {/* ── DEMO Banner (only when not live) ───────────────────────── */}
      {!isLive && !loading && (
        <div className="bg-[#A97A4C]/10 text-[#A97A4C] text-xs font-medium px-4 py-2 text-center">
          PREVIEW - This data is for demonstration purposes. Job listings will be
          live when the job_postings table is populated.
        </div>
      )}

      {/* ── Talent Intelligence Section ────────────────────────────── */}
      <section className="py-10 lg:py-14">
        <div className="section-container">
          <BlockReveal>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="font-sans font-semibold text-lg text-[#141418]">
                Talent Intelligence
              </h2>
              {signalsLive && (
                <span className="text-[10px] font-semibold bg-[#5F8A72]/10 text-[#5F8A72] px-2 py-0.5 rounded-full">
                  LIVE
                </span>
              )}
              {!signalsLive && !signalsLoading && (
                <span className="text-[10px] font-semibold bg-[#A97A4C]/10 text-[#A97A4C] px-2 py-0.5 rounded-full">
                  DEMO
                </span>
              )}
            </div>
          </BlockReveal>

          {signalsLoading ? (
            <div className="grid sm:grid-cols-3 gap-4">
              {[0, 1, 2].map((i) => (
                <SignalCardSkeleton key={i} />
              ))}
            </div>
          ) : talentSignals.length > 0 ? (
            <div className="grid sm:grid-cols-3 gap-4">
              {talentSignals.map((signal) => (
                <BlockReveal key={signal.id}>
                  <div className="bg-white rounded-xl p-4 border border-[#141418]/5 shadow-sm">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-sans font-medium text-sm text-[#141418] leading-snug">
                        {signal.title}
                      </h3>
                      <DirectionIcon direction={signal.direction} />
                    </div>
                    <p className="text-xs text-[#141418]/50 leading-relaxed line-clamp-2 mb-2">
                      {signal.description}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-[#141418]/35">
                      {signal.region && <span>{signal.region}</span>}
                      {signal.category && (
                        <>
                          {signal.region && <span aria-hidden="true">|</span>}
                          <span>{signal.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                </BlockReveal>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#141418]/40">
              No talent demand signals available at this time.
            </p>
          )}
        </div>
      </section>

      {/* ── Featured Role ────────────────────────────────────────── */}
      {featured && (
        <section className="pb-10 lg:pb-14">
          <div className="section-container">
            <BlockReveal>
              <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-[#6E879B] mb-4">
                Featured Role
              </p>
            </BlockReveal>
            <BlockReveal delay={60}>
              <FeaturedJobCard job={featured} />
            </BlockReveal>
          </div>
        </section>
      )}

      {/* ── Search + Filters + Listings ────────────────────────────── */}
      <section className="py-14 lg:py-20 bg-white/60">
        <div className="section-container">
          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#141418]/30" aria-hidden="true" />
              <label htmlFor="job-search" className="sr-only">Search jobs</label>
              <input
                id="job-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, company, or location..."
                className="w-full h-11 pl-10 pr-10 rounded-xl border border-[#141418]/10 bg-white text-[#141418] text-sm placeholder:text-[#141418]/30 outline-none focus:border-[#6E879B]/30 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#141418]/30 hover:text-[#141418] cursor-pointer"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>

            {/* CSV export */}
            {jobs.length > 0 && (
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#141418]/10 bg-white text-[#141418]/60 text-sm font-medium hover:border-[#141418]/20 hover:text-[#141418] transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" aria-hidden="true" />
                Export CSV
              </button>
            )}
          </div>

          {/* Filter pills — category */}
          <div className="flex gap-2 flex-wrap mb-3">
            <span className="text-xs text-[#141418]/40 self-center mr-1">Category:</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-xs tracking-wide transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-[#141418] text-white'
                    : 'bg-white border border-[#141418]/10 text-[#141418]/60 hover:border-[#141418]/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Filter pills — type */}
          <div className="flex gap-2 flex-wrap mb-8">
            <span className="text-xs text-[#141418]/40 self-center mr-1">Type:</span>
            {JOB_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-4 py-1.5 rounded-full text-xs tracking-wide transition-all cursor-pointer ${
                  typeFilter === t
                    ? 'bg-[#141418] text-white'
                    : 'bg-white border border-[#141418]/10 text-[#141418]/60 hover:border-[#141418]/20'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* ── Loading skeleton ────────────────────────────────────── */}
          {loading && (
            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* ── Error state ────────────────────────────────────────── */}
          {!loading && error && (
            <div className="text-center py-16">
              <AlertCircle className="w-10 h-10 text-[#8E6464] mx-auto mb-4" aria-hidden="true" />
              <h3 className="font-sans font-semibold text-[#141418] mb-2">
                Unable to load job listings
              </h3>
              <p className="text-sm text-[#141418]/50 mb-6 max-w-md mx-auto">
                We encountered an issue fetching jobs. Please try again.
              </p>
              <button
                onClick={() => void refetch()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#6E879B] text-white text-sm font-medium hover:bg-[#5A7185] transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                Retry
              </button>
            </div>
          )}

          {/* ── Empty state ────────────────────────────────────────── */}
          {!loading && !error && listings.length === 0 && !featured && (
            <div className="text-center py-16">
              <FileSearch className="w-10 h-10 text-[#141418]/20 mx-auto mb-4" aria-hidden="true" />
              <h3 className="font-sans font-semibold text-[#141418] mb-2">
                No jobs matching your criteria
              </h3>
              <p className="text-sm text-[#141418]/50 mb-6 max-w-md mx-auto">
                {search || categoryFilter !== 'All' || typeFilter !== 'All'
                  ? 'Try adjusting your filters or search terms to see more results.'
                  : 'No open positions at this time. Check back soon for new opportunities in professional beauty.'}
              </p>
              {(search || categoryFilter !== 'All' || typeFilter !== 'All') && (
                <button
                  onClick={() => {
                    setSearch('');
                    setCategoryFilter('All');
                    setTypeFilter('All');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#141418]/10 text-[#141418]/60 text-sm font-medium hover:border-[#141418]/20 transition-all cursor-pointer"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* ── Job listings ───────────────────────────────────────── */}
          {!loading && !error && listings.length > 0 && (
            <div className="space-y-3">
              {listings.map((job, i) => (
                <BlockReveal key={job.slug} delay={i * 40}>
                  <JobListingCard job={job} />
                </BlockReveal>
              ))}
            </div>
          )}

          {/* Result count */}
          {!loading && !error && jobs.length > 0 && (
            <p className="text-xs text-[#141418]/35 mt-6 text-center">
              Showing {jobs.length} position{jobs.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </section>

      {/* ── Dark CTA ─────────────────────────────────────────────── */}
      <section className="bg-[#141418] py-20 lg:py-24 rounded-3xl mx-4 lg:mx-8 mb-20">
        <div className="section-container text-center">
          <BlockReveal>
            <h2 className="font-sans font-semibold text-section text-[#F6F3EF] mb-5">
              Build something that matters
            </h2>
          </BlockReveal>
          <BlockReveal delay={100}>
            <p className="text-body text-[#F6F3EF]/65 max-w-md mx-auto mb-10">
              Help practitioners make better decisions with better data. We are
              hiring across aesthetics, medspa, wellness, and more.
            </p>
          </BlockReveal>
          <BlockReveal delay={200}>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/request-access"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#F6F3EF] text-[#141418] text-sm font-semibold hover:bg-white transition-colors"
              >
                Request Access
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </BlockReveal>
        </div>
      </section>

      </main>

      <SiteFooter />
    </div>
  );
}

/* ── Featured Job Card ─────────────────────────────────────────── */
function FeaturedJobCard({ job }: { job: JobPostingRow }) {
  const salary = formatSalary(job);
  const days = daysAgo(job.posted_at);
  return (
    <div className="bg-white rounded-2xl p-6 lg:p-8 border border-[#141418]/5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CategoryBadge vertical={job.vertical} />
            <TypeBadge type={job.type} />
          </div>
          <h2 className="font-sans font-semibold text-subsection text-[#141418]">
            {job.title}
          </h2>
          <p className="text-[#141418]/60 mt-1">{job.company}</p>
        </div>
        <Link
          to={`/jobs/${job.slug}`}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#6E879B] text-white text-sm font-medium hover:bg-[#5A7185] transition-colors"
        >
          View Role
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <p className="text-[#141418]/60 leading-relaxed mb-4 max-w-3xl line-clamp-3">
        {job.description}
      </p>
      <div className="flex flex-wrap gap-4 text-sm text-[#141418]/40">
        <span className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4" aria-hidden="true" />
          {job.location}
        </span>
        <span className="flex items-center gap-1.5">
          <Briefcase className="w-4 h-4" aria-hidden="true" />
          {job.type}
        </span>
        <span>{salary}</span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" aria-hidden="true" />
          {daysAgoLabel(days)}
        </span>
      </div>
    </div>
  );
}

/* ── Job Listing Card ──────────────────────────────────────────── */
function JobListingCard({ job }: { job: JobPostingRow }) {
  const salary = formatSalary(job);
  const days = daysAgo(job.posted_at);
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#141418]/5 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <CategoryBadge vertical={job.vertical} />
            <TypeBadge type={job.type} />
            <span className="text-[#141418]/30 text-xs">{daysAgoLabel(days)}</span>
          </div>
          <Link
            to={`/jobs/${job.slug}`}
            className="font-sans font-medium text-[#141418] group-hover:text-[#6E879B] transition-colors"
          >
            {job.title}
          </Link>
          <p className="text-[#141418]/50 text-sm mt-1">{job.company}</p>
          <div className="flex flex-wrap gap-3 mt-3 text-xs text-[#141418]/40">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              {job.location}
            </span>
            <span>{salary}</span>
          </div>
        </div>
        <Link
          to={`/jobs/${job.slug}`}
          className="shrink-0 px-5 py-2 rounded-full border border-[#141418]/10 text-[#141418]/60 text-xs font-medium hover:bg-[#141418] hover:text-white transition-all"
        >
          View
        </Link>
      </div>
    </div>
  );
}
