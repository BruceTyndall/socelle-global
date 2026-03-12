/**
 * CourseDetail — /education/courses/:slug
 * Course detail page with curriculum, author, enroll button
 * Data: courses + course_modules + course_lessons (LIVE)
 */
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight,
  BookOpen,
  Clock,
  Users,
  Star,
  Award,
  Play,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Lock,
  CheckCircle,
  Loader2,
  Monitor,
} from 'lucide-react';
import { useState } from 'react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useCourse } from '../../lib/education/useCourse';
import { useEnrollment } from '../../lib/education/useEnrollment';
import { useAuth } from '../../lib/auth';
import { ErrorState } from '../../components/ui/ErrorState';

const LESSON_TYPE_ICON: Record<string, React.ElementType> = {
  video: Play,
  text: FileText,
  quiz: HelpCircle,
  scorm: Monitor,
};

const LEVEL_BADGE: Record<string, string> = {
  beginner: 'bg-signal-up/10 text-signal-up',
  intermediate: 'bg-signal-warn/10 text-signal-warn',
  advanced: 'bg-signal-down/10 text-signal-down',
};

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { course, loading, error, isLive } = useCourse(slug);
  const { isEnrolled, enroll, loading: enrollLoading } = useEnrollment(course?.id);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/portal/login');
      return;
    }
    if (course?.is_free || !course?.price_cents) {
      await enroll();
      navigate(`/education/learn/${slug}`);
    }
    // For paid courses, would integrate with payment flow
  };

  const totalLessons = course?.course_modules?.reduce(
    (sum, m) => sum + (m.course_lessons?.length || 0), 0
  ) || 0;

  // Schema.org Course JSON-LD
  const courseJsonLd = course ? {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description || '',
    provider: { '@type': 'Organization', name: 'Socelle', url: 'https://socelle.com' },
    ...(course.author_name ? { instructor: { '@type': 'Person', name: course.author_name } } : {}),
    ...(course.thumbnail_url ? { image: course.thumbnail_url } : {}),
    ...(course.is_free ? { isAccessibleForFree: true } : {}),
    url: `https://socelle.com/education/courses/${course.slug}`,
  } : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-mn-bg font-sans">
        <MainNav />
        <div className="pt-40 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-mn-bg font-sans">
        <MainNav />
        <div className="pt-40">
          <ErrorState 
            icon={BookOpen}
            title="Course not found"
            message={error || 'The course you are looking for does not exist.'}
            action={{ label: "Browse Courses", onClick: () => navigate('/education/courses') }}
          />
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>{course.title} | Socelle Education</title>
        <meta name="description" content={course.description || `Learn ${course.title} on Socelle`} />
        <meta property="og:title" content={`${course.title} | Socelle Education`} />
        <meta property="og:description" content={course.description || ''} />
        {course.thumbnail_url && <meta property="og:image" content={course.thumbnail_url} />}
        <link rel="canonical" href={`https://socelle.com/education/courses/${course.slug}`} />
        {courseJsonLd && <script type="application/ld+json">{JSON.stringify(courseJsonLd)}</script>}
      </Helmet>

      <MainNav />

      {!isLive && (
        <div className="bg-signal-warn/10 text-signal-warn text-xs font-medium px-4 py-2 text-center">
          PREVIEW — Course data is for demonstration purposes.
        </div>
      )}

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16">
        <div className="section-container">
          <div className="flex items-center gap-2 text-sm text-graphite/50 mb-6">
            <Link to="/education" className="hover:text-accent transition-colors">Education</Link>
            <span>/</span>
            <Link to="/education/courses" className="hover:text-accent transition-colors">Courses</Link>
            <span>/</span>
            <span className="text-graphite/80 truncate">{course.title}</span>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Left: info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {course.level && (
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${LEVEL_BADGE[course.level] || 'bg-graphite/10 text-graphite/60'}`}>
                    {course.level}
                  </span>
                )}
                {course.ce_credits && course.ce_credits > 0 && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                    {course.ce_credits} CE Credits
                  </span>
                )}
                {course.category && (
                  <span className="text-[10px] font-medium text-graphite/40 capitalize">
                    {course.category.replace(/_/g, ' ')}
                  </span>
                )}
              </div>

              <h1 className="font-sans font-semibold text-3xl lg:text-4xl text-graphite mb-4">
                {course.title}
              </h1>

              {course.description && (
                <p className="text-graphite/60 font-sans text-lg leading-relaxed mb-6">
                  {course.description}
                </p>
              )}

              <div className="flex items-center gap-6 text-sm text-graphite/50 mb-6">
                {course.author_name && (
                  <div className="flex items-center gap-2">
                    {course.author_avatar_url ? (
                      <img src={course.author_avatar_url} alt={course.author_name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold">
                        {course.author_name.charAt(0)}
                      </div>
                    )}
                    <span>{course.author_name}</span>
                  </div>
                )}
                {course.duration_minutes != null && (
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {course.duration_minutes} min</span>
                )}
                {totalLessons > 0 && (
                  <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {totalLessons} lessons</span>
                )}
                {course.enrollment_count != null && course.enrollment_count > 0 && (
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {course.enrollment_count} enrolled</span>
                )}
                {course.rating_avg != null && course.rating_avg > 0 && (
                  <span className="flex items-center gap-1"><Star className="w-4 h-4" /> {course.rating_avg.toFixed(1)}</span>
                )}
              </div>

              {/* Learning outcomes */}
              {course.learning_outcomes && course.learning_outcomes.length > 0 && (
                <div className="p-5 bg-mn-card rounded-xl border border-graphite/5 mb-6">
                  <h3 className="font-sans font-semibold text-sm text-graphite mb-3">What you will learn</h3>
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {course.learning_outcomes.map((outcome, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-graphite/70">
                        <CheckCircle className="w-4 h-4 text-signal-up flex-shrink-0 mt-0.5" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Long description */}
              {course.long_description && (
                <div className="prose prose-sm max-w-none text-graphite/70 mb-8">
                  <p>{course.long_description}</p>
                </div>
              )}

              {/* Author bio */}
              {course.author_bio && (
                <div className="p-5 bg-mn-card rounded-xl border border-graphite/5 mb-8">
                  <h3 className="font-sans font-semibold text-sm text-graphite mb-2">About the Instructor</h3>
                  <div className="flex items-start gap-4">
                    {course.author_avatar_url ? (
                      <img src={course.author_avatar_url} alt={course.author_name || ''} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                    ) : course.author_name ? (
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold flex-shrink-0">
                        {course.author_name.charAt(0)}
                      </div>
                    ) : null}
                    <div>
                      {course.author_name && <p className="font-sans font-medium text-sm text-graphite">{course.author_name}</p>}
                      <p className="text-sm text-graphite/60 mt-1">{course.author_bio}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: enrollment card */}
            <div>
              <div className="sticky top-24 bg-mn-card rounded-2xl border border-graphite/5 overflow-hidden">
                {course.thumbnail_url || course.trailer_url ? (
                  <div className="aspect-video bg-mn-surface overflow-hidden relative">
                    {course.trailer_url ? (
                      <video
                        src={course.trailer_url}
                        poster={course.thumbnail_url || undefined}
                        controls
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img src={course.thumbnail_url!} alt={course.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-mn-surface flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-graphite/20" />
                  </div>
                )}

                <div className="p-5">
                  <div className="text-2xl font-sans font-bold text-graphite mb-4">
                    {course.is_free ? 'Free' : course.price_cents ? `$${(course.price_cents / 100).toFixed(0)}` : 'Free'}
                  </div>

                  {isEnrolled ? (
                    <Link
                      to={`/education/learn/${course.slug}`}
                      className="w-full flex items-center justify-center gap-2 h-[44px] px-6 bg-accent text-white text-sm font-sans font-semibold rounded-full hover:bg-accent-hover transition-colors"
                    >
                      <Play className="w-4 h-4" /> Continue Learning
                    </Link>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      disabled={enrollLoading}
                      className="w-full flex items-center justify-center gap-2 h-[44px] px-6 bg-mn-dark text-mn-bg text-sm font-sans font-semibold rounded-full hover:bg-graphite/80 transition-colors disabled:opacity-50"
                    >
                      {enrollLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                      {course.is_free || !course.price_cents ? 'Enroll Free' : 'Enroll Now'}
                    </button>
                  )}

                  <div className="mt-4 space-y-2 text-sm text-graphite/60">
                    {course.duration_minutes != null && (
                      <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {course.duration_minutes} minutes</div>
                    )}
                    <div className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> {totalLessons} lessons</div>
                    {course.ce_credits && course.ce_credits > 0 && (
                      <div className="flex items-center gap-2"><Award className="w-4 h-4" /> {course.ce_credits} CE credits</div>
                    )}
                    {course.level && (
                      <div className="flex items-center gap-2 capitalize"><Star className="w-4 h-4" /> {course.level} level</div>
                    )}
                  </div>

                  {course.prerequisites && course.prerequisites.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-graphite/5">
                      <p className="text-xs font-semibold text-graphite mb-1">Prerequisites</p>
                      <ul className="text-xs text-graphite/50 space-y-1">
                        {course.prerequisites.map((p, i) => <li key={i}>{p}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Curriculum ────────────────────────────────────────────── */}
      {course.course_modules && course.course_modules.length > 0 && (
        <section className="py-16 lg:py-24">
          <div className="section-container max-w-4xl">
            <h2 className="font-sans font-semibold text-2xl text-graphite mb-6">Curriculum</h2>
            <div className="space-y-2">
              {course.course_modules.map((mod, mi) => {
                const isExpanded = expandedModules.has(mod.id);
                const lessons = mod.course_lessons || [];
                return (
                  <div key={mod.id} className="bg-mn-card rounded-xl border border-graphite/5 overflow-hidden">
                    <button
                      onClick={() => toggleModule(mod.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-mn-surface/50 transition-colors"
                    >
                      <div>
                        <span className="text-xs text-graphite/40 font-medium">Module {mi + 1}</span>
                        <h3 className="font-sans font-semibold text-sm text-graphite">{mod.title}</h3>
                        {mod.description && <p className="text-xs text-graphite/50 mt-0.5">{mod.description}</p>}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-graphite/40">{lessons.length} lesson{lessons.length !== 1 ? 's' : ''}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-graphite/30" /> : <ChevronDown className="w-4 h-4 text-graphite/30" />}
                      </div>
                    </button>
                    {isExpanded && lessons.length > 0 && (
                      <div className="border-t border-graphite/5">
                        {lessons.map(lesson => {
                          const Icon = LESSON_TYPE_ICON[lesson.lesson_type] || FileText;
                          return (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-3 px-4 py-3 border-b border-graphite/5 last:border-b-0"
                            >
                              <Icon className="w-4 h-4 text-graphite/30 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-graphite truncate">{lesson.title}</p>
                              </div>
                              {lesson.duration_minutes != null && (
                                <span className="text-xs text-graphite/40 flex-shrink-0">{lesson.duration_minutes}m</span>
                              )}
                              {lesson.is_preview ? (
                                <span className="text-xs text-accent font-medium flex-shrink-0">Preview</span>
                              ) : !isEnrolled ? (
                                <Lock className="w-3 h-3 text-graphite/20 flex-shrink-0" />
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
