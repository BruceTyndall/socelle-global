import { useState, useEffect, useMemo } from 'react';
import { MapPin, Clock, Briefcase, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import HeroMediaRail from '../../components/public/HeroMediaRail';
import { BigStatBanner } from '../../components/modules/BigStatBanner';
import { SpotlightPanel } from '../../components/modules/SpotlightPanel';
import { CTASection } from '../../components/modules/CTASection';
import { StickyConversionBar } from '../../components/modules/StickyConversionBar';
import { supabase } from '../../lib/supabase';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1736939666660-d4c776e05233?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080';

interface Job {
  id: string;
  title: string;
  company: string;
  department: string;
  location: string;
  type: string;
  description: string;
  salary_range: string | null;
  posted_at: string;
  is_featured: boolean;
  status: string;
}

// ── Shared types & helpers (consumed by JobDetail.tsx) ──
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
  const fmt = (n: number) => n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
  if (job.salary_min && job.salary_max) return `${fmt(job.salary_min)} – ${fmt(job.salary_max)}/${job.salary_period ?? 'year'}`;
  if (job.salary_min) return `From ${fmt(job.salary_min)}/${job.salary_period ?? 'year'}`;
  return `Up to ${fmt(job.salary_max!)}/${job.salary_period ?? 'year'}`;
}

function DeptBadge({ dept }: { dept: string }) {
  const colors: Record<string, string> = {
    Engineering: 'bg-blue-500/10 text-blue-600',
    Marketing: 'bg-purple-500/10 text-purple-600',
    Sales: 'bg-signal-up/10 text-signal-up',
    Design: 'bg-pink-500/10 text-pink-600',
    Operations: 'bg-orange-500/10 text-orange-600',
    Intelligence: 'bg-cyan-500/10 text-cyan-600',
    Editorial: 'bg-amber-500/10 text-amber-600',
  };
  return (
    <span className={`text-[10px] tracking-widest uppercase px-2.5 py-0.5 rounded-full ${colors[dept] || 'bg-graphite/10 text-graphite/60'}`}>
      {dept}
    </span>
  );
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'Today';
  if (days === 1) return '1d ago';
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      try {
        const { data, error } = await supabase
          .from('job_postings')
          .select('*')
          .eq('status', 'active')
          .order('posted_at', { ascending: false });
        if (!cancelled && data && !error) {
          setJobs(data);
        }
      } catch {
        // empty state is acceptable
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetch();
    return () => { cancelled = true; };
  }, []);

  const departments = useMemo(() => ['All', ...Array.from(new Set(jobs.map(j => j.department)))], [jobs]);

  const filtered = useMemo(() => {
    let result = jobs;
    if (deptFilter !== 'All') result = result.filter(j => j.department === deptFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(j => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.location.toLowerCase().includes(q));
    }
    return result;
  }, [jobs, deptFilter, search]);

  const featured = jobs.find(j => j.is_featured);

  return (
    <>
      <HeroMediaRail
        image={HERO_IMAGE}
        eyebrow="Careers"
        headline="Build the Future of Aesthetics Intelligence"
        subtitle="Join the team redefining how practitioners and brands make decisions — with data, not guesswork."
        primaryCTA={{ label: 'View Open Roles', href: '#jobs' }}
        secondaryCTA={{ label: 'Post a Position', href: '/request-access' }}
        overlayMetric={{ value: jobs.length.toString(), label: 'Open Positions' }}
      />

      <BigStatBanner
        eyebrow="Team Growth"
        stats={[
          { value: jobs.length.toString(), label: 'Open Positions' },
          { value: departments.length > 1 ? (departments.length - 1).toString() : '0', label: 'Departments Hiring' },
          { value: jobs.filter(j => j.type === 'Full-time').length.toString(), label: 'Full-Time Roles' },
          { value: jobs.filter(j => j.location?.toLowerCase().includes('remote')).length.toString(), label: 'Remote Options' },
        ]}
      />

      {/* Featured Role */}
      {featured && (
        <section className="bg-mn-bg py-14 lg:py-20" id="jobs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="text-eyebrow text-accent mb-3 block">Featured Role</span>
            <div className="bg-white rounded-card p-6 lg:p-8 border border-graphite/5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <DeptBadge dept={featured.department} />
                  <h2 className="text-graphite text-subsection mt-3">{featured.title}</h2>
                  <p className="text-graphite/60 mt-1">{featured.company}</p>
                </div>
                <Link to="/request-access" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors">
                  Apply Now
                </Link>
              </div>
              <p className="text-graphite/60 leading-relaxed mb-4 max-w-3xl">{featured.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-graphite/40">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{featured.location}</span>
                <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" />{featured.type}</span>
                {featured.salary_range && <span className="flex items-center gap-1.5">{featured.salary_range}</span>}
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{timeAgo(featured.posted_at)}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Search & Filter */}
      <section className="bg-mn-surface py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-graphite/30 hover:text-graphite cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {departments.map((dept) => (
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

          {/* Job Listings */}
          <div className="space-y-3">
            {filtered.map((job) => (
              <div key={job.id} className="bg-white rounded-2xl p-5 border border-graphite/5 hover:shadow-soft transition-shadow group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <DeptBadge dept={job.department} />
                      <span className="text-graphite/30 text-xs font-mono">{timeAgo(job.posted_at)}</span>
                    </div>
                    <h3 className="text-graphite font-medium group-hover:text-accent transition-colors">{job.title}</h3>
                    <p className="text-graphite/50 text-sm mt-1">{job.company}</p>
                    <div className="flex flex-wrap gap-3 mt-3 text-xs text-graphite/40">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                      <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{job.type}</span>
                      {job.salary_range && <span>{job.salary_range}</span>}
                    </div>
                  </div>
                  <Link to="/request-access" className="shrink-0 px-5 py-2 rounded-full border border-graphite/10 text-graphite/60 text-xs font-medium hover:bg-graphite hover:text-white transition-all">
                    Apply
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {loading && <p className="text-center text-graphite/40 text-sm py-8">Loading positions...</p>}
          {!loading && filtered.length === 0 && (
            <p className="text-center text-graphite/40 text-sm py-8">
              {search || deptFilter !== 'All' ? 'No matching positions found.' : 'No open positions right now.'}
            </p>
          )}
        </div>
      </section>

      <SpotlightPanel
        image="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800"
        imagePosition="right"
        eyebrow="Why Socelle"
        headline="Intelligence-First Culture"
        metric={{ value: jobs.length > 0 ? jobs.length.toString() : '8', label: 'Open Roles' }}
        bullets={[
          'Work at the intersection of data science, beauty, and professional commerce',
          'Remote-first team with quarterly in-person gatherings',
          'Competitive comp, equity, and unlimited learning budget',
        ]}
        cta={{ label: 'See All Roles', href: '#jobs' }}
      />

      <CTASection
        eyebrow="Join Us"
        headline="Build Something That Matters"
        subtitle="Help practitioners make better decisions with better data. We're hiring across engineering, intelligence, editorial, and design."
        primaryCTA={{ label: 'View Open Roles', href: '#jobs' }}
      />

      <StickyConversionBar />
    </>
  );
}
