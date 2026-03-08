/**
 * CourseCatalog — /education/courses
 * Full course catalog with filters and sorting
 * Data: courses table (LIVE)
 */
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  BookOpen,
  Clock,
  Users,
  Star,
  Search,
  Filter,
  ArrowRight,
  GraduationCap,
  X,
} from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useCourses, type CourseLevel, type CoursePricing, type CourseSortKey } from '../../lib/education/useCourses';

const LEVEL_BADGE: Record<string, string> = {
  beginner: 'bg-signal-up/10 text-signal-up',
  intermediate: 'bg-signal-warn/10 text-signal-warn',
  advanced: 'bg-signal-down/10 text-signal-down',
};

const LEVEL_OPTIONS: { value: CourseLevel | 'all'; label: string }[] = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const PRICING_OPTIONS: { value: CoursePricing; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'free', label: 'Free' },
  { value: 'paid', label: 'Paid' },
];

const SORT_OPTIONS: { value: CourseSortKey; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
];

export default function CourseCatalog() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [level, setLevel] = useState<CourseLevel | 'all'>('all');
  const [pricing, setPricing] = useState<CoursePricing>('all');
  const [sort, setSort] = useState<CourseSortKey>('newest');
  const [showFilters, setShowFilters] = useState(false);

  const { courses, loading, isLive, categories } = useCourses({
    category,
    level,
    pricing,
    sort,
    search: search.length >= 2 ? search : undefined,
  });

  const hasActiveFilters = category !== 'all' || level !== 'all' || pricing !== 'all' || search.length >= 2;

  const clearFilters = () => {
    setCategory('all');
    setLevel('all');
    setPricing('all');
    setSearch('');
  };

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>Course Catalog | Socelle Education</title>
        <meta name="description" content="Browse CE-eligible courses, treatment protocols, and professional training for licensed beauty professionals." />
        <link rel="canonical" href="https://socelle.com/education/courses" />
      </Helmet>

      <MainNav />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16">
        <div className="section-container">
          <div className="flex items-center gap-2 text-sm text-graphite/50 mb-4">
            <Link to="/education" className="hover:text-accent transition-colors">Education</Link>
            <span>/</span>
            <span className="text-graphite/80">Courses</span>
          </div>
          <h1 className="font-sans font-semibold text-3xl lg:text-4xl text-graphite mb-3">
            Course Catalog
          </h1>
          <p className="text-graphite/60 font-sans max-w-2xl">
            Professional training designed for licensed practitioners. Filter by category, level, and format.
          </p>
        </div>
      </section>

      {!isLive && !loading && (
        <div className="bg-signal-warn/10 text-signal-warn text-xs font-medium px-4 py-2 text-center">
          PREVIEW — Course data is for demonstration purposes.
        </div>
      )}

      {/* ── Search + Filters ──────────────────────────────────────── */}
      <section className="pb-4">
        <div className="section-container">
          {/* Search bar */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/30" />
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-mn-card border border-graphite/10 rounded-xl text-sm text-graphite placeholder:text-graphite/30 focus:outline-none focus:border-accent/40 transition-colors"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                showFilters ? 'bg-accent text-white border-accent' : 'bg-mn-card border-graphite/10 text-graphite hover:border-accent/30'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Filter bar */}
          {showFilters && (
            <div className="flex flex-wrap gap-3 p-4 bg-mn-card rounded-xl border border-graphite/5 mb-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-graphite/50 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="text-sm bg-mn-bg border border-graphite/10 rounded-lg px-3 py-1.5 text-graphite focus:outline-none focus:border-accent/40"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-graphite/50 block mb-1">Level</label>
                <select
                  value={level}
                  onChange={e => setLevel(e.target.value as CourseLevel | 'all')}
                  className="text-sm bg-mn-bg border border-graphite/10 rounded-lg px-3 py-1.5 text-graphite focus:outline-none focus:border-accent/40"
                >
                  {LEVEL_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-graphite/50 block mb-1">Pricing</label>
                <select
                  value={pricing}
                  onChange={e => setPricing(e.target.value as CoursePricing)}
                  className="text-sm bg-mn-bg border border-graphite/10 rounded-lg px-3 py-1.5 text-graphite focus:outline-none focus:border-accent/40"
                >
                  {PRICING_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-graphite/50 block mb-1">Sort</label>
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value as CourseSortKey)}
                  className="text-sm bg-mn-bg border border-graphite/10 rounded-lg px-3 py-1.5 text-graphite focus:outline-none focus:border-accent/40"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {hasActiveFilters && (
                <div className="flex items-end">
                  <button onClick={clearFilters} className="text-xs text-accent hover:text-accent-hover flex items-center gap-1 pb-1.5">
                    <X className="w-3 h-3" /> Clear filters
                  </button>
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-graphite/50">
            {courses.length} course{courses.length !== 1 ? 's' : ''}
            {hasActiveFilters ? ' (filtered)' : ''}
          </p>
        </div>
      </section>

      {/* ── Course Grid ───────────────────────────────────────────── */}
      <section className="py-8 lg:py-12">
        <div className="section-container">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-mn-card rounded-2xl h-80 animate-pulse" />
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <Link
                  key={course.id}
                  to={`/education/courses/${course.slug}`}
                  className="group bg-mn-card rounded-2xl overflow-hidden border border-graphite/5 hover:border-accent/20 hover:shadow-lg transition-all"
                >
                  {course.thumbnail_url ? (
                    <div className="aspect-video bg-mn-surface overflow-hidden">
                      <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="aspect-video bg-mn-surface flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-graphite/20" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {course.level && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${LEVEL_BADGE[course.level] || 'bg-graphite/10 text-graphite/60'}`}>
                          {course.level}
                        </span>
                      )}
                      {course.ce_credits && course.ce_credits > 0 && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                          {course.ce_credits} CE
                        </span>
                      )}
                      {course.category && (
                        <span className="text-[10px] font-medium text-graphite/40 capitalize">
                          {course.category.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                    <h3 className="font-sans font-semibold text-graphite text-sm mb-1 group-hover:text-accent transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    {course.author_name && (
                      <p className="text-xs text-graphite/50 mb-2">{course.author_name}</p>
                    )}
                    {course.description && (
                      <p className="text-xs text-graphite/40 mb-3 line-clamp-2">{course.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-graphite/40">
                      {course.duration_minutes != null && (
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration_minutes}m</span>
                      )}
                      {course.enrollment_count != null && course.enrollment_count > 0 && (
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {course.enrollment_count}</span>
                      )}
                      {course.rating_avg != null && course.rating_avg > 0 && (
                        <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {course.rating_avg.toFixed(1)}</span>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-graphite/5 flex items-center justify-between">
                      <span className="text-sm font-semibold text-graphite">
                        {course.is_free ? 'Free' : course.price_cents ? `$${(course.price_cents / 100).toFixed(0)}` : 'Free'}
                      </span>
                      <span className="text-xs text-accent group-hover:text-accent-hover flex items-center gap-1">
                        View course <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-accent-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-graphite mb-2">No courses found</h3>
              <p className="text-graphite/60 max-w-md mx-auto mb-6">
                {hasActiveFilters ? 'Try adjusting your filters to find more courses.' : 'New courses are being added regularly. Check back soon.'}
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover text-sm">
                  Clear filters →
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
