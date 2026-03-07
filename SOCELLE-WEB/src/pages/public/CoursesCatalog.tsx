/**
 * CoursesCatalog — Public course catalog with featured courses, category browse, search/filter
 * Data source: courses table (LIVE when DB connected, DEMO fallback)
 * Route: /courses
 */
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Search,
  BookOpen,
  Clock,
  Award,
  Star,
  Users,
  Filter,
  ChevronRight,
} from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useCourses } from '../../lib/useCourses';
import type { CourseListItem, CourseLevel, CoursePricing, CourseSortKey } from '../../lib/useCourses';

/* ── Category metadata ─────────────────────────────────────────────── */

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'treatment_protocols', label: 'Treatment Protocols' },
  { value: 'ingredient_science', label: 'Ingredient Science' },
  { value: 'business_operations', label: 'Business Operations' },
  { value: 'compliance_regulatory', label: 'Compliance & Regulatory' },
  { value: 'device_training', label: 'Device Training' },
  { value: 'retail_strategy', label: 'Retail Strategy' },
];

const LEVELS: { value: CourseLevel | 'all'; label: string }[] = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const SORT_OPTIONS: { value: CourseSortKey; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
];

/* ── Course card ───────────────────────────────────────────────────── */

function CourseCard({ course }: { course: CourseListItem }) {
  const priceLabel = course.is_free
    ? 'Free'
    : course.price_cents
      ? `$${(course.price_cents / 100).toFixed(0)}`
      : 'Free';

  return (
    <Link
      to={`/courses/${course.slug}`}
      className="group block bg-white rounded-2xl border border-graphite/8 overflow-hidden transition-all hover:shadow-lg hover:border-graphite/16"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-graphite/5 relative overflow-hidden">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <BookOpen className="w-10 h-10 text-graphite/20" />
          </div>
        )}
        {course.is_featured && (
          <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider bg-accent text-white px-2.5 py-1 rounded-full">
            Featured
          </span>
        )}
        <span className="absolute top-3 right-3 text-[11px] font-semibold bg-white/90 backdrop-blur-sm text-graphite px-2.5 py-1 rounded-full">
          {priceLabel}
        </span>
      </div>

      {/* Body */}
      <div className="p-5">
        {course.category && (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-accent mb-1.5">
            {course.category.replace(/_/g, ' ')}
          </p>
        )}
        <h3 className="text-base font-semibold text-graphite leading-snug mb-2 line-clamp-2 group-hover:text-accent transition-colors">
          {course.title}
        </h3>
        {course.description && (
          <p className="text-sm text-graphite/60 line-clamp-2 mb-3">
            {course.description}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-4 text-xs text-graphite/50">
          {course.duration_minutes && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {course.duration_minutes}m
            </span>
          )}
          {course.ce_credits != null && course.ce_credits > 0 && (
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              {course.ce_credits} CE
            </span>
          )}
          {course.rating_avg != null && (
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              {course.rating_avg.toFixed(1)}
            </span>
          )}
          {course.enrollment_count != null && course.enrollment_count > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {course.enrollment_count.toLocaleString()}
            </span>
          )}
        </div>

        {course.level && (
          <span className="mt-3 inline-block text-[10px] font-semibold uppercase tracking-wider text-graphite/40 border border-graphite/10 rounded-full px-2.5 py-0.5">
            {course.level}
          </span>
        )}
      </div>
    </Link>
  );
}

/* ── Main component ────────────────────────────────────────────────── */

export default function CoursesCatalog() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [level, setLevel] = useState<CourseLevel | 'all'>('all');
  const [pricing, setPricing] = useState<CoursePricing>('all');
  const [sort, setSort] = useState<CourseSortKey>('newest');
  const [showFilters, setShowFilters] = useState(false);

  const { courses, loading, error, isLive } = useCourses({
    category: category !== 'all' ? category : undefined,
    level,
    pricing,
    sort,
    search: search.trim() || undefined,
  });

  const { courses: featuredCourses } = useCourses({ featured: true });

  const hasActiveFilters = category !== 'all' || level !== 'all' || pricing !== 'all' || search.trim().length > 0;

  const filteredCount = courses.length;

  const jsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Course Catalog | Socelle',
    description: 'Professional beauty and medspa courses with CE credits. Browse treatment protocols, ingredient science, compliance, and business training.',
  }), []);

  return (
    <>
      <Helmet>
        <title>Course Catalog | Socelle</title>
        <meta name="description" content="Professional beauty and medspa courses with CE credits. Browse treatment protocols, ingredient science, compliance, and business training." />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <MainNav />

      <main className="min-h-screen bg-mn-bg pt-20">
        {/* Hero */}
        <section className="px-4 py-16 max-w-6xl mx-auto text-center">
          <p className="font-mono text-[0.7rem] tracking-[0.2em] uppercase text-accent mb-3">
            Professional Education
          </p>
          <h1 className="text-4xl md:text-5xl font-sans font-semibold text-graphite mb-4 leading-tight">
            Course Catalog
          </h1>
          <p className="text-graphite/60 text-lg max-w-2xl mx-auto mb-8">
            CE-eligible courses built for licensed beauty professionals. Treatment protocols, ingredient science, compliance, and business training.
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-graphite/30" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white border border-graphite/10 rounded-full text-sm text-graphite placeholder:text-graphite/30 focus:outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all"
            />
          </div>

          {!isLive && !loading && (
            <span className="mt-4 inline-block text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">
              DEMO
            </span>
          )}
        </section>

        {/* Featured courses */}
        {featuredCourses.length > 0 && !hasActiveFilters && (
          <section className="px-4 pb-12 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-sans font-semibold text-graphite">Featured Courses</h2>
              <ChevronRight className="w-5 h-5 text-graphite/30" />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.slice(0, 3).map(c => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          </section>
        )}

        {/* Filters */}
        <section className="px-4 max-w-6xl mx-auto mb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <p className="text-sm text-graphite/50">
              {loading ? 'Loading...' : `${filteredCount} course${filteredCount !== 1 ? 's' : ''}`}
            </p>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm text-graphite/60 hover:text-graphite transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-white rounded-xl border border-graphite/8">
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="h-10 px-3 bg-mn-bg border border-graphite/10 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/40"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <select
                value={level}
                onChange={e => setLevel(e.target.value as CourseLevel | 'all')}
                className="h-10 px-3 bg-mn-bg border border-graphite/10 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/40"
              >
                {LEVELS.map(l => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
              <select
                value={pricing}
                onChange={e => setPricing(e.target.value as CoursePricing)}
                className="h-10 px-3 bg-mn-bg border border-graphite/10 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/40"
              >
                <option value="all">All Pricing</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
              <select
                value={sort}
                onChange={e => setSort(e.target.value as CourseSortKey)}
                className="h-10 px-3 bg-mn-bg border border-graphite/10 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/40"
              >
                {SORT_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          )}
        </section>

        {/* Course grid */}
        <section className="px-4 pb-20 max-w-6xl mx-auto">
          {error && (
            <div className="text-center py-12">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-graphite/8 overflow-hidden animate-pulse">
                  <div className="aspect-video bg-graphite/5" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 bg-graphite/10 rounded-full w-1/3" />
                    <div className="h-4 bg-graphite/10 rounded-full w-3/4" />
                    <div className="h-3 bg-graphite/10 rounded-full w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && courses.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="w-12 h-12 text-graphite/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-graphite mb-2">No courses found</h3>
              <p className="text-sm text-graphite/50">
                {hasActiveFilters
                  ? 'Try adjusting your filters or search terms.'
                  : 'Courses will appear here once published.'}
              </p>
            </div>
          )}

          {!loading && !error && courses.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(c => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
