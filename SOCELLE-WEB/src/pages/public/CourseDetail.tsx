/**
 * CourseDetail — Course detail page: hero, description, curriculum accordion, free preview, enroll, reviews
 * Data source: courses + course_modules + course_lessons (LIVE), course_enrollments (LIVE)
 * Route: /courses/:slug
 */
import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  BookOpen,
  Clock,
  Award,
  Star,
  Users,
  ChevronDown,
  ChevronRight,
  Play,
  FileText,
  HelpCircle,
  Box,
  Lock,
  Eye,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useCourse } from '../../lib/useCourses';
import type { CourseModule } from '../../lib/useCourses';
import { useEnrollment } from '../../lib/useEnrollments';
import { useAuth } from '../../lib/auth';

/* ── Lesson type icons ─────────────────────────────────────────────── */

const LESSON_ICONS: Record<string, React.ElementType> = {
  video: Play,
  text: FileText,
  quiz: HelpCircle,
  scorm: Box,
};

/* ── Curriculum accordion ──────────────────────────────────────────── */

function ModuleAccordion({ module, isEnrolled }: { module: CourseModule; isEnrolled: boolean }) {
  const [open, setOpen] = useState(false);
  const lessonCount = module.course_lessons?.length ?? 0;
  const totalMin = module.course_lessons?.reduce((sum, l) => sum + (l.duration_minutes ?? 0), 0) ?? 0;

  return (
    <div className="border border-graphite/8 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-graphite/2 transition-colors"
      >
        <div className="flex items-center gap-3">
          <ChevronDown className={`w-4 h-4 text-graphite/40 transition-transform ${open ? 'rotate-180' : ''}`} />
          <div>
            <h3 className="text-sm font-semibold text-graphite">{module.title}</h3>
            {module.description && (
              <p className="text-xs text-graphite/50 mt-0.5">{module.description}</p>
            )}
          </div>
        </div>
        <div className="text-xs text-graphite/40 flex items-center gap-3 shrink-0">
          <span>{lessonCount} lesson{lessonCount !== 1 ? 's' : ''}</span>
          {totalMin > 0 && <span>{totalMin}m</span>}
        </div>
      </button>

      {open && module.course_lessons && (
        <div className="border-t border-graphite/8">
          {module.course_lessons.map(lesson => {
            const Icon = LESSON_ICONS[lesson.lesson_type] || FileText;
            const isPreview = lesson.is_preview;
            const canAccess = isEnrolled || isPreview;

            return (
              <div
                key={lesson.id}
                className={`flex items-center gap-3 px-6 py-3 text-sm border-b border-graphite/4 last:border-b-0 ${
                  canAccess ? 'text-graphite' : 'text-graphite/40'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{lesson.title}</span>
                {lesson.duration_minutes && (
                  <span className="text-xs text-graphite/40">{lesson.duration_minutes}m</span>
                )}
                {isPreview && !isEnrolled && (
                  <span className="text-[10px] font-semibold text-accent border border-accent/30 rounded-full px-2 py-0.5 flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Preview
                  </span>
                )}
                {!canAccess && <Lock className="w-3.5 h-3.5 text-graphite/30" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────────── */

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { course, loading, error, isLive } = useCourse(slug);
  const { enrollment, isEnrolled, enroll, loading: enrollLoading } = useEnrollment(course?.id);
  const [enrolling, setEnrolling] = useState(false);

  const totalLessons = useMemo(() => {
    if (!course?.course_modules) return 0;
    return course.course_modules.reduce((sum, m) => sum + (m.course_lessons?.length ?? 0), 0);
  }, [course]);

  const priceLabel = course?.is_free
    ? 'Free'
    : course?.price_cents
      ? `$${(course.price_cents / 100).toFixed(0)}`
      : 'Free';

  const handleEnroll = async () => {
    if (!user) {
      navigate('/portal/login');
      return;
    }
    setEnrolling(true);
    const result = await enroll();
    setEnrolling(false);
    if (result) {
      navigate(`/courses/${slug}/learn`);
    }
  };

  const jsonLd = useMemo(() => {
    if (!course) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: course.title,
      description: course.description,
      provider: { '@type': 'Organization', name: 'Socelle' },
      ...(course.rating_avg ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: course.rating_avg } } : {}),
    };
  }, [course]);

  if (loading) {
    return (
      <>
        <MainNav />
        <div className="min-h-screen bg-mn-bg pt-20 flex items-center justify-center">
          <div className="space-y-3 w-40">
            <div className="h-2.5 bg-graphite/10 rounded-full animate-pulse" />
            <div className="h-2.5 bg-graphite/10 rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      </>
    );
  }

  if (error || !course) {
    return (
      <>
        <MainNav />
        <div className="min-h-screen bg-mn-bg pt-20 flex items-center justify-center">
          <div className="text-center">
            <BookOpen className="w-12 h-12 text-graphite/20 mx-auto mb-4" />
            <h1 className="text-2xl font-sans font-semibold text-graphite mb-2">Course not found</h1>
            <p className="text-sm text-graphite/50 mb-6">{error || 'This course does not exist or has been removed.'}</p>
            <Link to="/courses" className="text-sm text-accent hover:underline">Browse all courses</Link>
          </div>
        </div>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{course.title} | Socelle Courses</title>
        <meta name="description" content={course.description || `Learn ${course.title} on Socelle`} />
        {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
      </Helmet>

      <MainNav />

      <main className="min-h-screen bg-mn-bg pt-20">
        {/* Hero */}
        <section className="bg-mn-dark text-white">
          <div className="max-w-6xl mx-auto px-4 py-16 grid lg:grid-cols-[1fr_340px] gap-10 items-start">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Link to="/courses" className="text-white/50 text-sm hover:text-white transition-colors">Courses</Link>
                <ChevronRight className="w-3.5 h-3.5 text-white/30" />
                {course.category && (
                  <span className="text-white/50 text-sm">{course.category.replace(/_/g, ' ')}</span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-sans font-semibold leading-tight mb-4">
                {course.title}
              </h1>
              <p className="text-white/70 text-lg mb-6 max-w-2xl">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-5 text-sm text-white/60">
                {course.author_name && (
                  <span className="flex items-center gap-2">
                    {course.author_avatar_url ? (
                      <img src={course.author_avatar_url} alt="" className="w-7 h-7 rounded-full" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-white/10" />
                    )}
                    {course.author_name}
                  </span>
                )}
                {course.rating_avg != null && (
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    {course.rating_avg.toFixed(1)}
                  </span>
                )}
                {course.enrollment_count != null && (
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {course.enrollment_count.toLocaleString()} enrolled
                  </span>
                )}
                {course.level && (
                  <span className="uppercase text-[10px] font-semibold tracking-wider border border-white/20 px-2.5 py-0.5 rounded-full">
                    {course.level}
                  </span>
                )}
              </div>

              {!isLive && (
                <span className="mt-4 inline-block text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">
                  DEMO
                </span>
              )}
            </div>

            {/* Sidebar card */}
            <div className="bg-white text-graphite rounded-2xl p-6 shadow-xl">
              {course.thumbnail_url && (
                <img src={course.thumbnail_url} alt="" className="w-full aspect-video object-cover rounded-xl mb-4" />
              )}

              <div className="text-3xl font-semibold text-graphite mb-4">{priceLabel}</div>

              {isEnrolled ? (
                <Link
                  to={`/courses/${slug}/learn`}
                  className="w-full flex items-center justify-center gap-2 h-12 bg-mn-dark text-white text-sm font-semibold rounded-full hover:bg-graphite transition-colors mb-3"
                >
                  Continue Learning <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling || enrollLoading}
                  className="w-full h-12 bg-mn-dark text-white text-sm font-semibold rounded-full hover:bg-graphite transition-colors disabled:opacity-50 mb-3"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
              )}

              <div className="space-y-3 text-sm">
                {course.duration_minutes && (
                  <div className="flex items-center gap-3 text-graphite/60">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration_minutes} minutes total</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-graphite/60">
                  <BookOpen className="w-4 h-4" />
                  <span>{totalLessons} lessons across {course.course_modules?.length ?? 0} modules</span>
                </div>
                {course.ce_credits != null && course.ce_credits > 0 && (
                  <div className="flex items-center gap-3 text-graphite/60">
                    <Award className="w-4 h-4" />
                    <span>{course.ce_credits} CE credits</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-graphite/60">
                  <CheckCircle className="w-4 h-4" />
                  <span>Certificate of completion</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Long description */}
        {course.long_description && (
          <section className="max-w-4xl mx-auto px-4 py-12">
            <h2 className="text-xl font-sans font-semibold text-graphite mb-4">About this course</h2>
            <div className="prose prose-sm text-graphite/70 max-w-none">
              {course.long_description.split('\n').map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        )}

        {/* Learning outcomes */}
        {course.learning_outcomes && course.learning_outcomes.length > 0 && (
          <section className="max-w-4xl mx-auto px-4 pb-12">
            <h2 className="text-xl font-sans font-semibold text-graphite mb-4">What you will learn</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {course.learning_outcomes.map((outcome, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-graphite/8">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-graphite/70">{outcome}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Prerequisites */}
        {course.prerequisites && course.prerequisites.length > 0 && (
          <section className="max-w-4xl mx-auto px-4 pb-12">
            <h2 className="text-xl font-sans font-semibold text-graphite mb-4">Prerequisites</h2>
            <ul className="space-y-2">
              {course.prerequisites.map((prereq, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-graphite/60">
                  <ChevronRight className="w-3.5 h-3.5 text-accent" />
                  {prereq}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Curriculum */}
        <section className="max-w-4xl mx-auto px-4 pb-12">
          <h2 className="text-xl font-sans font-semibold text-graphite mb-6">Curriculum</h2>
          {course.course_modules && course.course_modules.length > 0 ? (
            <div className="space-y-3">
              {course.course_modules.map(mod => (
                <ModuleAccordion key={mod.id} module={mod} isEnrolled={isEnrolled} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-graphite/50">Curriculum details are provided inside the course player after enrollment.</p>
          )}
        </section>

        {/* Instructor */}
        {course.author_name && (
          <section className="max-w-4xl mx-auto px-4 pb-16">
            <h2 className="text-xl font-sans font-semibold text-graphite mb-4">Instructor</h2>
            <div className="flex items-start gap-5 p-6 bg-white rounded-2xl border border-graphite/8">
              {course.author_avatar_url ? (
                <img src={course.author_avatar_url} alt="" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-graphite/5 flex items-center justify-center">
                  <Users className="w-6 h-6 text-graphite/20" />
                </div>
              )}
              <div>
                <h3 className="text-base font-semibold text-graphite">{course.author_name}</h3>
                {course.author_bio && (
                  <p className="text-sm text-graphite/60 mt-1">{course.author_bio}</p>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
