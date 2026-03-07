import { useState, useMemo } from 'react';
import { MapPin, Clock, ChevronRight, Briefcase, Search, X, SlidersHorizontal } from 'lucide-react';
import { HeroMediaRail } from '../components/modules/HeroMediaRail';
import { SpotlightPanel } from '../components/modules/SpotlightPanel';
import { CTASection } from '../components/modules/CTASection';
import { BigStatBanner } from '../components/modules/BigStatBanner';
import { FeaturedCardGrid } from '../components/modules/FeaturedCardGrid';
import { IMAGES } from '../data/images';
import { jobs, formatTimeAgo, type Job } from '../data/mock';

const featured = jobs.find(j => j.isFeatured)!;
const allJobs = jobs.filter(j => !j.isFeatured);

const DEPARTMENTS = ['All', ...Array.from(new Set(jobs.map(j => j.department)))];
const LOCATIONS = ['All Locations', ...Array.from(new Set(jobs.map(j => j.location)))];
const TYPES = ['All Types', 'Full-time', 'Contract'];

function DeptBadge({ dept }: { dept: string }) {
  const colors: Record<string, string> = {
    Engineering: 'bg-blue-500/10 text-blue-600',
    'Business Development': 'bg-[#3F5465]/10 text-[#3F5465]',
    Marketing: 'bg-purple-500/10 text-purple-600',
    Design: 'bg-pink-500/10 text-pink-600',
    Sales: 'bg-[#5F8A72]/10 text-[#5F8A72]',
    Editorial: 'bg-amber-500/10 text-amber-600',
    Intelligence: 'bg-cyan-500/10 text-cyan-600',
    Operations: 'bg-orange-500/10 text-orange-600',
  };
  return (
    <span className={`text-[10px] tracking-widest uppercase px-2.5 py-0.5 rounded-full ${colors[dept] || 'bg-gray-500/15 text-gray-400'}`}>
      {dept}
    </span>
  );
}

function TagPill({ tag }: { tag: string }) {
  return (
    <span className="text-[10px] tracking-wide text-[#141418]/40 bg-[#141418]/[0.04] px-2 py-0.5 rounded-full">
      {tag}
    </span>
  );
}

function JobCard({ job, expanded, onToggle }: { job: Job; expanded: boolean; onToggle: () => void }) {
  return (
    <div
      className={`border-b border-[#141418]/8 transition-all duration-300 cursor-pointer group ${expanded ? 'bg-[#141418]/[0.02]' : 'hover:bg-[#141418]/[0.02]'}`}
    >
      {/* Main row */}
      <div
        className="flex items-center gap-4 lg:gap-6 py-5 px-4 -mx-4 rounded-xl"
        onClick={onToggle}
      >
        <div className="w-10 h-10 rounded-xl bg-[#3F5465]/10 flex items-center justify-center shrink-0">
          <Briefcase className="w-4 h-4 text-[#141418]/40" />
        </div>

        <div className="flex-1 min-w-0">
          <span className="text-[#141418] text-sm block truncate">{job.title}</span>
          <div className="flex flex-wrap gap-2 mt-1.5">
            <DeptBadge dept={job.department} />
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[#141418]/50 text-xs shrink-0">
          <MapPin className="w-3 h-3" />
          {job.location}
        </div>

        <div className="hidden md:block text-right shrink-0">
          <span className="text-[#141418] text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
            {job.salaryRange}
          </span>
        </div>

        <div className="hidden lg:block text-[#141418]/30 text-xs shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>
          Posted {formatTimeAgo(job.postedAt)}
        </div>

        <ChevronRight className={`w-4 h-4 text-[#141418]/20 group-hover:text-[#141418]/60 transition-all shrink-0 ${expanded ? 'rotate-90 text-[#141418]/60' : ''}`} />
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 -mx-4 pb-6 animate-in fade-in duration-200">
          <div className="ml-[3.5rem] border-l-2 border-[#3F5465]/15 pl-6">
            {/* Mobile metadata */}
            <div className="flex flex-wrap gap-3 mb-4 sm:hidden">
              <span className="flex items-center gap-1 text-[#141418]/50 text-xs">
                <MapPin className="w-3 h-3" /> {job.location}
              </span>
              <span className="flex items-center gap-1 text-[#141418]/50 text-xs">
                <Clock className="w-3 h-3" /> {job.type}
              </span>
            </div>
            <div className="md:hidden mb-3">
              <span className="text-[#141418] text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
                {job.salaryRange}
              </span>
            </div>

            <p className="text-[#141418]/60 text-sm mb-4 max-w-2xl">{job.description}</p>

            <div className="flex flex-wrap gap-1.5 mb-5">
              {job.tags.map(tag => <TagPill key={tag} tag={tag} />)}
            </div>

            <div className="flex items-center gap-3">
              <a href="#" className="btn-mineral btn-mineral-sm">Apply Now</a>
              <span className="text-[#141418]/30 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
                {job.type} · Posted {formatTimeAgo(job.postedAt)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Jobs() {
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('All');
  const [location, setLocation] = useState('All Locations');
  const [type, setType] = useState('All Types');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return allJobs.filter(job => {
      const matchesQuery = query === '' || [
        job.title,
        job.department,
        job.description,
        ...job.tags,
      ].some(field => field.toLowerCase().includes(query.toLowerCase()));

      const matchesDept = department === 'All' || job.department === department;
      const matchesLoc = location === 'All Locations' || job.location === location;
      const matchesType = type === 'All Types' || job.type === type;

      return matchesQuery && matchesDept && matchesLoc && matchesType;
    });
  }, [query, department, location, type]);

  const hasActiveFilters = department !== 'All' || location !== 'All Locations' || type !== 'All Types' || query !== '';

  const clearFilters = () => {
    setQuery('');
    setDepartment('All');
    setLocation('All Locations');
    setType('All Types');
  };

  return (
    <>
      <HeroMediaRail
        image={IMAGES.heroJobs}
        eyebrow="Open Roles"
        headline="Shape How the Industry Sees Itself"
        subtitle="Socelle is building the intelligence layer for professional aesthetics. We're hiring the people who will define it."
        primaryCTA={{ label: 'See Open Roles', href: '#roles' }}
        secondaryCTA={{ label: 'How We Work', href: '#culture' }}
        overlayMetric={{ value: String(jobs.length), label: 'Roles Open' }}
      />

      {/* Company stats */}
      <BigStatBanner
        backgroundImage={IMAGES.teamMeeting}
        eyebrow="Working Here"
        stats={[
          { value: String(jobs.length), label: 'Open Roles' },
          { value: '100%', label: 'Remote-First' },
          { value: '$70K–$230K', label: 'Compensation Range' },
          { value: '4', label: 'In-Person Summits / Year' },
        ]}
      />

      {/* Culture highlights — visual cards */}
      <FeaturedCardGrid
        eyebrow="Culture"
        headline="Precision, Ownership, Craft"
        columns={3}
        cards={[
          {
            id: 'jc1',
            image: IMAGES.remoteWork,
            eyebrow: 'Remote-First',
            title: 'Distributed by Design',
            subtitle: 'New York, Los Angeles, Miami, London — with quarterly summits where the full team convenes.',
          },
          {
            id: 'jc2',
            image: IMAGES.teamCollab,
            eyebrow: 'Ownership',
            title: 'Ownership, Not Options Theater',
            subtitle: 'Meaningful equity. Every team member holds a real stake in what we\'re building.',
          },
          {
            id: 'jc3',
            image: IMAGES.techOffice,
            eyebrow: 'Growth',
            title: 'Invest in Your Craft',
            subtitle: 'Annual learning stipends, conference attendance, and immersion time inside the clinics we serve.',
          },
        ]}
      />

      {/* Featured Role — Spotlight */}
      <section className="bg-[#FAF9F7] py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="eyebrow text-[#141418]/50 mb-3 block">Highlighted Role</span>
          <div className="card-mineral p-8 lg:p-10">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
              <div className="flex-1">
                <h2 className="text-[#141418] text-xl lg:text-2xl mb-3">{featured.title}</h2>
                <div className="flex flex-wrap gap-3 mb-4">
                  <DeptBadge dept={featured.department} />
                  <span className="flex items-center gap-1 text-[#141418]/50 text-xs">
                    <MapPin className="w-3 h-3" /> {featured.location}
                  </span>
                  <span className="flex items-center gap-1 text-[#141418]/50 text-xs">
                    <Clock className="w-3 h-3" /> {featured.type}
                  </span>
                </div>
                <p className="text-[#141418]/60 text-sm mb-4">
                  {featured.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {featured.tags.map(tag => <TagPill key={tag} tag={tag} />)}
                </div>
              </div>
              <div className="shrink-0 text-center lg:text-right">
                <div className="text-[#141418] text-3xl lg:text-4xl mb-1 relative z-10" style={{ fontFamily: 'var(--font-mono)' }}>
                  {featured.salaryRange}
                </div>
                <div className="text-[#141418]/40 text-xs mb-4">base salary</div>
                <a href="#" className="btn-mineral btn-mineral-sm">Apply Now</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Job List with Search */}
      <section id="roles" className="bg-[#FAF9F7] py-0 pb-14 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="eyebrow text-[#141418]/50 mb-3 block">All Roles</span>
              <h2 className="text-[#141418] text-2xl lg:text-3xl">Current Openings</h2>
            </div>
            <div className="text-[#141418]/40 text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
              {filtered.length} {filtered.length === 1 ? 'role' : 'roles'}
            </div>
          </div>

          {/* Search bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#141418]/30" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, department, skill, or keyword..."
                className="w-full pl-12 pr-12 py-3.5 bg-white rounded-2xl border border-[#141418]/8 text-[#141418] text-sm placeholder:text-[#141418]/30 focus:outline-none focus:border-[#3F5465]/40 focus:ring-1 focus:ring-[#3F5465]/20 transition-all"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-12 top-1/2 -translate-y-1/2 p-1 text-[#141418]/30 hover:text-[#141418]/60 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all cursor-pointer ${showFilters ? 'bg-[#141418]/10 text-[#141418]' : 'text-[#141418]/30 hover:text-[#141418]/60 hover:bg-[#141418]/[0.04]'}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter chips */}
          {showFilters && (
            <div className="mb-6 p-5 bg-white rounded-2xl border border-[#141418]/8 space-y-4">
              {/* Department */}
              <div>
                <div className="text-[#141418]/40 text-[10px] tracking-widest uppercase mb-2.5">Department</div>
                <div className="flex flex-wrap gap-2">
                  {DEPARTMENTS.map(dept => (
                    <button
                      key={dept}
                      onClick={() => setDepartment(dept)}
                      className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                        department === dept
                          ? 'bg-[#3F5465] text-[#F7F5F2]'
                          : 'bg-[#141418]/[0.04] text-[#141418]/50 hover:bg-[#141418]/[0.08] hover:text-[#141418]'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <div className="text-[#141418]/40 text-[10px] tracking-widest uppercase mb-2.5">Location</div>
                <div className="flex flex-wrap gap-2">
                  {LOCATIONS.map(loc => (
                    <button
                      key={loc}
                      onClick={() => setLocation(loc)}
                      className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                        location === loc
                          ? 'bg-[#3F5465] text-[#F7F5F2]'
                          : 'bg-[#141418]/[0.04] text-[#141418]/50 hover:bg-[#141418]/[0.08] hover:text-[#141418]'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type */}
              <div>
                <div className="text-[#141418]/40 text-[10px] tracking-widest uppercase mb-2.5">Type</div>
                <div className="flex flex-wrap gap-2">
                  {TYPES.map(t => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                        type === t
                          ? 'bg-[#3F5465] text-[#F7F5F2]'
                          : 'bg-[#141418]/[0.04] text-[#141418]/50 hover:bg-[#141418]/[0.08] hover:text-[#141418]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active filter summary */}
          {hasActiveFilters && (
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[#141418]/40 text-xs">Filtering by:</span>
              <div className="flex flex-wrap gap-1.5">
                {query && (
                  <span className="inline-flex items-center gap-1 text-xs bg-[#141418]/10 text-[#141418] px-2.5 py-1 rounded-full">
                    "{query}"
                    <button onClick={() => setQuery('')} className="hover:text-[#141418]/60 cursor-pointer"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {department !== 'All' && (
                  <span className="inline-flex items-center gap-1 text-xs bg-[#141418]/10 text-[#141418] px-2.5 py-1 rounded-full">
                    {department}
                    <button onClick={() => setDepartment('All')} className="hover:text-[#141418]/60 cursor-pointer"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {location !== 'All Locations' && (
                  <span className="inline-flex items-center gap-1 text-xs bg-[#141418]/10 text-[#141418] px-2.5 py-1 rounded-full">
                    {location}
                    <button onClick={() => setLocation('All Locations')} className="hover:text-[#141418]/60 cursor-pointer"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {type !== 'All Types' && (
                  <span className="inline-flex items-center gap-1 text-xs bg-[#141418]/10 text-[#141418] px-2.5 py-1 rounded-full">
                    {type}
                    <button onClick={() => setType('All Types')} className="hover:text-[#141418]/60 cursor-pointer"><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="text-[#141418]/30 hover:text-[#141418]/60 text-xs transition-colors cursor-pointer ml-auto"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Job list */}
          {filtered.length > 0 ? (
            <div className="space-y-0">
              {filtered.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  expanded={expandedId === job.id}
                  onToggle={() => setExpandedId(expandedId === job.id ? null : job.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-14 h-14 rounded-2xl bg-[#3F5465]/10 flex items-center justify-center mx-auto mb-5">
                <Search className="w-6 h-6 text-[#141418]/30" />
              </div>
              <h3 className="text-[#141418] text-lg mb-2">No roles match your search</h3>
              <p className="text-[#141418]/40 text-sm mb-6 max-w-md mx-auto">
                Try adjusting your filters or search terms. New roles are posted regularly.
              </p>
              <button
                onClick={clearFilters}
                className="btn-liquid-light btn-liquid-sm cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Company Culture — SplitFeature */}
      <SpotlightPanel
        id="culture"
        image={IMAGES.teamMeeting}
        imagePosition="right"
        eyebrow="How We Work"
        headline="Built Remote. Gathered Quarterly."
        bullets={[
          'Remote-first with quarterly in-person summits in New York and Los Angeles',
          'Meaningful equity — every team member holds a real stake in what we\'re building',
          'Annual learning stipends, conference attendance, and immersion time inside the clinics we serve',
        ]}
        cta={{ label: 'More on How We Work', href: '#' }}
      />

      <CTASection
        eyebrow="Join Us"
        headline="If This Resonates, We Should Talk."
        subtitle="Data, design, and clinical science — converging in a product that doesn't exist yet. That's the brief."
        primaryCTA={{ label: 'See All Roles', href: '#roles' }}
        secondaryCTA={{ label: 'Refer Someone', href: '#' }}
      />
    </>
  );
}