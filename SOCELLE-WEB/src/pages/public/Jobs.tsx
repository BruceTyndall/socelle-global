import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, MapPin, Clock, Briefcase, Search, X } from 'lucide-react';
import JsonLd from '../../components/seo/JsonLd';
import {
  DEFAULT_OG_IMAGE,
  buildCanonical,
  buildCollectionPageSchema,
} from '../../lib/seo';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import WordReveal from '../../components/motion/WordReveal';
import SiteFooter from '../../components/sections/SiteFooter';

/* ── Shared types (consumed by JobDetail.tsx) ────────────────── */
export interface JobPosting {
  slug: string;
  title: string;
  company: string;
  location: string;
  vertical: 'aesthetics' | 'dermatology' | 'wellness' | 'cosmetics' | 'medical' | string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | string;
  salary_min?: number;
  salary_max?: number;
  salary_period: 'year' | 'month' | 'hour' | string;
  description: string;
  requirements: string[];
  posted_days_ago: number;
  featured: boolean;
}

export function formatSalary(job: JobPosting): string {
  if (!job.salary_min && !job.salary_max) return 'Competitive';
  const fmt = (n: number) => (n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`);
  if (job.salary_min && job.salary_max)
    return `${fmt(job.salary_min)} -- ${fmt(job.salary_max)}/${job.salary_period ?? 'year'}`;
  if (job.salary_min) return `From ${fmt(job.salary_min)}/${job.salary_period ?? 'year'}`;
  return `Up to ${fmt(job.salary_max!)}/${job.salary_period ?? 'year'}`;
}

/* ── DEMO Data ─── job_postings table is stub (W10-06) ───────── */
interface DemoJob {
  id: string;
  title: string;
  company: string;
  department: string;
  location: string;
  type: string;
  description: string;
  salary_range: string | null;
  posted_days_ago: number;
  is_featured: boolean;
}

const DEMO_JOBS: DemoJob[] = [
  {
    id: 'demo-1',
    title: 'Senior Intelligence Engineer',
    company: 'Socelle',
    department: 'Engineering',
    location: 'Remote (US)',
    type: 'Full-time',
    description: 'Build the market signal pipeline that powers procurement intelligence for professional beauty operators.',
    salary_range: '$150k -- $190k/year',
    posted_days_ago: 2,
    is_featured: true,
  },
  {
    id: 'demo-2',
    title: 'Product Designer',
    company: 'Socelle',
    department: 'Design',
    location: 'Remote (US)',
    type: 'Full-time',
    description: 'Design intelligence surfaces, data visualizations, and operator workflows for the Socelle platform.',
    salary_range: '$130k -- $160k/year',
    posted_days_ago: 5,
    is_featured: false,
  },
  {
    id: 'demo-3',
    title: 'Category Intelligence Analyst',
    company: 'Socelle',
    department: 'Intelligence',
    location: 'Miami, FL',
    type: 'Full-time',
    description: 'Research and curate market signals across treatment categories, ingredients, and brand performance.',
    salary_range: '$85k -- $110k/year',
    posted_days_ago: 8,
    is_featured: false,
  },
  {
    id: 'demo-4',
    title: 'Editorial Lead',
    company: 'Socelle',
    department: 'Editorial',
    location: 'Remote (US)',
    type: 'Full-time',
    description: 'Lead content strategy for intelligence summaries, protocol write-ups, and brand education modules.',
    salary_range: '$100k -- $130k/year',
    posted_days_ago: 12,
    is_featured: false,
  },
  {
    id: 'demo-5',
    title: 'Brand Partnerships Manager',
    company: 'Socelle',
    department: 'Sales',
    location: 'New York, NY',
    type: 'Full-time',
    description: 'Manage relationships with professional beauty brands and coordinate onboarding onto the marketplace.',
    salary_range: '$95k -- $125k/year',
    posted_days_ago: 15,
    is_featured: false,
  },
  {
    id: 'demo-6',
    title: 'Frontend Engineer',
    company: 'Socelle',
    department: 'Engineering',
    location: 'Remote (US)',
    type: 'Contract',
    description: 'Build React components for intelligence dashboards, portal experiences, and public-facing pages.',
    salary_range: '$70 -- $95/hour',
    posted_days_ago: 3,
    is_featured: false,
  },
];

const DEPARTMENTS = ['All', 'Engineering', 'Design', 'Intelligence', 'Editorial', 'Sales'];

function DeptBadge({ dept }: { dept: string }) {
  const colors: Record<string, string> = {
    Engineering: 'bg-blue-500/10 text-blue-600',
    Marketing: 'bg-purple-500/10 text-purple-600',
    Sales: 'bg-emerald-500/10 text-emerald-600',
    Design: 'bg-pink-500/10 text-pink-600',
    Operations: 'bg-orange-500/10 text-orange-600',
    Intelligence: 'bg-cyan-500/10 text-cyan-600',
    Editorial: 'bg-amber-500/10 text-amber-600',
  };
  return (
    <span
      className={`text-[10px] tracking-widest uppercase px-2.5 py-0.5 rounded-full font-medium ${
        colors[dept] || 'bg-graphite/10 text-graphite/60'
      }`}
    >
      {dept}
    </span>
  );
}

function DemoBadge() {
  return (
    <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">
      DEMO
    </span>
  );
}

function timeAgo(days: number): string {
  if (days < 1) return 'Today';
  if (days === 1) return '1d ago';
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function Jobs() {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  const filtered = useMemo(() => {
    let result = DEMO_JOBS.filter((j) => !j.is_featured);
    if (deptFilter !== 'All') result = result.filter((j) => j.department === deptFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q),
      );
    }
    return result;
  }, [deptFilter, search]);

  const featured = DEMO_JOBS.find((j) => j.is_featured);

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>Jobs -- Socelle</title>
        <meta
          name="description"
          content="Careers in professional beauty intelligence. Join the team building smarter procurement for operators and brands."
        />
        <meta property="og:title" content="Jobs -- Socelle" />
        <meta
          property="og:description"
          content="Build the future of professional beauty intelligence. Open roles in engineering, design, intelligence, and more."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={buildCanonical('/jobs')} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={buildCanonical('/jobs')} />
      </Helmet>
      <JsonLd data={buildCollectionPageSchema({
        name: 'Careers at Socelle',
        description: 'Careers in professional beauty intelligence. Open roles in engineering, design, intelligence, and more.',
        url: buildCanonical('/jobs'),
      })} />
      <MainNav />

      {/* ── Hero — photo 20 with glass overlay ──────────────────── */}
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
              <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40">
                Careers
              </p>
              <DemoBadge />
            </div>
          </BlockReveal>
          <WordReveal
            text="Careers in Professional Beauty"
            as="h1"
            className="font-sans font-semibold text-hero text-graphite mb-8 max-w-3xl mx-auto justify-center"
          />
          <BlockReveal delay={200}>
            <p className="text-body-lg text-graphite/60 max-w-2xl mx-auto">
              Join the team redefining how practitioners and brands make
              decisions -- with data, not guesswork.
            </p>
          </BlockReveal>
        </div>
      </section>

      {/* ── DEMO Banner ──────────────────────────────────────────── */}
      <div className="bg-signal-warn/10 text-signal-warn text-xs font-medium px-4 py-2 text-center">
        PREVIEW -- This data is for demonstration purposes. Jobs will be live when the job_postings table is wired.
      </div>

      {/* ── Featured Role ────────────────────────────────────────── */}
      {featured && (
        <section className="py-14 lg:py-20" id="jobs">
          <div className="section-container">
            <BlockReveal>
              <div className="flex items-center gap-3 mb-6">
                <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-accent">
                  Featured Role
                </p>
                <DemoBadge />
              </div>
            </BlockReveal>
            <BlockReveal delay={100}>
              <div className="bg-white rounded-2xl p-6 lg:p-8 border border-graphite/5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <DeptBadge dept={featured.department} />
                    <h2 className="font-sans font-semibold text-subsection text-graphite mt-3">
                      {featured.title}
                    </h2>
                    <p className="text-graphite/60 mt-1">{featured.company}</p>
                  </div>
                  <Link
                    to="/request-access"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-accent text-white text-sm font-medium hover:bg-accent/80 transition-colors"
                  >
                    Apply Now
                  </Link>
                </div>
                <p className="text-graphite/60 leading-relaxed mb-4 max-w-3xl">
                  {featured.description}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-graphite/40">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {featured.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" />
                    {featured.type}
                  </span>
                  {featured.salary_range && <span>{featured.salary_range}</span>}
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {timeAgo(featured.posted_days_ago)}
                  </span>
                </div>
              </div>
            </BlockReveal>
          </div>
        </section>
      )}

      {/* ── Search + Filter + Listings ────────────────────────────── */}
      <section className="py-14 lg:py-20 bg-mn-surface">
        <div className="section-container">
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/30" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search roles..."
                className="w-full h-11 pl-10 pr-10 rounded-xl border border-graphite/10 bg-white text-graphite text-sm placeholder:text-graphite/30 outline-none focus:border-accent/30 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-graphite/30 hover:text-graphite cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setDeptFilter(dept)}
                  className={`px-4 py-2 rounded-full text-xs tracking-wide transition-all cursor-pointer ${
                    deptFilter === dept
                      ? 'bg-graphite text-white'
                      : 'bg-white border border-graphite/10 text-graphite/60 hover:border-graphite/20'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* ── Job Listings ─────────────────────────────────────── */}
          <div className="space-y-3">
            {filtered.map((job, i) => (
              <BlockReveal key={job.id} delay={i * 40}>
                <div className="bg-white rounded-2xl p-5 border border-graphite/5 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <DeptBadge dept={job.department} />
                        <span className="text-graphite/30 text-xs">
                          {timeAgo(job.posted_days_ago)}
                        </span>
                      </div>
                      <h3 className="font-sans font-medium text-graphite group-hover:text-accent transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-graphite/50 text-sm mt-1">
                        {job.company}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-3 text-xs text-graphite/40">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" />
                          {job.type}
                        </span>
                        {job.salary_range && <span>{job.salary_range}</span>}
                      </div>
                    </div>
                    <Link
                      to="/request-access"
                      className="shrink-0 px-5 py-2 rounded-full border border-graphite/10 text-graphite/60 text-xs font-medium hover:bg-graphite hover:text-white transition-all"
                    >
                      Apply
                    </Link>
                  </div>
                </div>
              </BlockReveal>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-graphite/40 text-sm py-8">
              {search || deptFilter !== 'All'
                ? 'No matching positions found.'
                : 'No open positions right now.'}
            </p>
          )}
        </div>
      </section>

      {/* ── Dark CTA ─────────────────────────────────────────────── */}
      <section className="bg-mn-dark py-20 lg:py-24 rounded-section mx-4 lg:mx-8 mb-20">
        <div className="section-container text-center">
          <BlockReveal>
            <h2 className="font-sans font-semibold text-section text-mn-bg mb-5">
              Build something that matters
            </h2>
          </BlockReveal>
          <BlockReveal delay={100}>
            <p className="text-body text-mn-bg/65 max-w-md mx-auto mb-10">
              Help practitioners make better decisions with better data. We are
              hiring across engineering, intelligence, editorial, and design.
            </p>
          </BlockReveal>
          <BlockReveal delay={200}>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/request-access" className="btn-mineral-dark">
                Request Access
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </BlockReveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
