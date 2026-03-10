/**
 * EducationDashboard — /portal/education
 * EDU-WO-02: Live enrollment data via TanStack Query
 * Data: course_enrollments (joined with courses) + certificates tables
 */
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  GraduationCap,
  CheckCircle,
  Clock,
  Award,
  AlertTriangle,
  ArrowRight,
  Play,
  RotateCcw,
  TrendingUp,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { exportToCSV } from '../../lib/csvExport';
import { useCertificates } from '../../lib/education/useCertificates';

// ── Types ─────────────────────────────────────────────────────────────

interface EnrolledCourse {
  id: string;
  course_id: string;
  status: 'active' | 'completed' | 'paused' | 'expired';
  progress_pct: number;
  enrolled_at: string;
  completed_at: string | null;
  last_accessed_at: string | null;
  course_title: string | null;
  course_slug: string | null;
  course_thumbnail_url: string | null;
  course_duration_minutes: number | null;
  course_ce_credits: number | null;
  course_level: string | null;
  course_category: string | null;
}

// ── Hook: all user enrollments with course join ────────────────────────

function useMyEnrollments() {
  const { user } = useAuth();

  return useQuery<EnrolledCourse[]>({
    queryKey: ['my_enrollments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          id,
          course_id,
          status,
          progress_pct,
          enrolled_at,
          completed_at,
          last_accessed_at,
          courses:course_id (
            title,
            slug,
            thumbnail_url,
            duration_minutes,
            ce_credits,
            level,
            category
          )
        `)
        .eq('user_id', user!.id)
        .order('last_accessed_at', { ascending: false, nullsFirst: false });

      if (error) throw new Error(error.message);

      type RawRow = {
        id: string;
        course_id: string;
        status: 'active' | 'completed' | 'paused' | 'expired';
        progress_pct: number;
        enrolled_at: string;
        completed_at: string | null;
        last_accessed_at: string | null;
        courses: { title: string | null; slug: string | null; thumbnail_url: string | null; duration_minutes: number | null; ce_credits: number | null; level: string | null; category: string | null } | Array<{ title: string | null; slug: string | null; thumbnail_url: string | null; duration_minutes: number | null; ce_credits: number | null; level: string | null; category: string | null }> | null;
      };

      return ((data ?? []) as RawRow[]).map(row => {
        const course = Array.isArray(row.courses) ? row.courses[0] : row.courses;
        return {
          id: row.id,
          course_id: row.course_id,
          status: row.status,
          progress_pct: row.progress_pct ?? 0,
          enrolled_at: row.enrolled_at,
          completed_at: row.completed_at,
          last_accessed_at: row.last_accessed_at,
          course_title: course?.title ?? null,
          course_slug: course?.slug ?? null,
          course_thumbnail_url: course?.thumbnail_url ?? null,
          course_duration_minutes: course?.duration_minutes ?? null,
          course_ce_credits: course?.ce_credits ?? null,
          course_level: course?.level ?? null,
          course_category: course?.category ?? null,
        };
      });
    },
    enabled: isSupabaseConfigured && !!user?.id,
    staleTime: 2 * 60 * 1000,
  });
}

// ── Status badge ──────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, string> = {
  active: 'bg-accent/10 text-accent',
  completed: 'bg-signal-up/10 text-signal-up',
  paused: 'bg-signal-warn/10 text-signal-warn',
  expired: 'bg-signal-down/10 text-signal-down',
};

// ── Component ─────────────────────────────────────────────────────────

export default function EducationDashboard() {
  const { data: enrollments = [], isLoading, error, refetch } = useMyEnrollments();
  const { certificates = [] } = useCertificates();
  const isLive = !isLoading && !error;

  // Derived KPIs
  const enrolled = enrollments.length;
  const completed = enrollments.filter(e => e.status === 'completed').length;
  const inProgress = enrollments.filter(e => e.status === 'active').length;
  const ceEarned = enrollments
    .filter(e => e.status === 'completed')
    .reduce((sum, e) => sum + (e.course_ce_credits ?? 0), 0);

  const inProgressCourses = enrollments.filter(e => e.status === 'active');
  const completedCourses = enrollments.filter(e => e.status === 'completed');

  const handleExport = () => {
    if (enrollments.length === 0) return;
    exportToCSV(
      enrollments.map(e => ({
        course: e.course_title ?? '—',
        status: e.status,
        progress: `${e.progress_pct}%`,
        enrolled: new Date(e.enrolled_at).toLocaleDateString(),
        completed: e.completed_at ? new Date(e.completed_at).toLocaleDateString() : '—',
        ce_credits: e.course_ce_credits ?? 0,
      })),
      'socelle_my_courses',
      [
        { key: 'course', label: 'Course' },
        { key: 'status', label: 'Status' },
        { key: 'progress', label: 'Progress' },
        { key: 'enrolled', label: 'Enrolled' },
        { key: 'completed', label: 'Completed' },
        { key: 'ce_credits', label: 'CE Credits' },
      ]
    );
  };

  return (
    <div>
      <Helmet>
        <title>Education Dashboard | Socelle Portal</title>
        <meta name="description" content="Track your enrolled courses, CE credits, and learning progress." />
      </Helmet>

      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="w-5 h-5 text-accent" />
          <span className="text-sm font-sans font-semibold text-accent uppercase tracking-wide">
            Education
          </span>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <h1 className="font-sans text-2xl text-graphite">My Courses</h1>
            {isLive && (
              <span className="text-[10px] font-semibold text-signal-up bg-signal-up/10 px-2 py-0.5 rounded-full">LIVE</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {enrollments.length > 0 && (
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent border border-accent/30 rounded-lg hover:bg-accent/5 transition-colors"
              >
                Export CSV
              </button>
            )}
            <Link
              to="/education/courses"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-graphite text-mn-bg rounded-lg hover:bg-graphite/80 transition-colors"
            >
              Browse Courses <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
        <p className="text-sm font-sans text-graphite/60 mt-1">
          Track your enrolled courses, learning progress, and CE credit status.
        </p>
      </div>

      {/* ── Loading: skeleton shimmer ─────────────────────────── */}
      {isLoading && (
        <div className="space-y-6" aria-busy="true" aria-label="Loading education dashboard">
          {/* KPI strip skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl border border-accent-soft p-5">
                <div className="h-3 w-20 bg-graphite/10 rounded animate-pulse mb-3" />
                <div className="h-8 w-12 bg-graphite/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
          {/* Course list skeleton */}
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-accent-soft p-5 flex items-center gap-4">
              <div className="w-14 h-14 bg-graphite/10 rounded-lg animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-graphite/10 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-graphite/8 rounded animate-pulse w-1/2" />
                <div className="h-2 bg-graphite/10 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Error state ───────────────────────────────────────── */}
      {!isLoading && error && (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-signal-warn/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-signal-warn" />
          </div>
          <h3 className="text-base font-semibold text-graphite mb-2">Could not load your courses</h3>
          <p className="text-graphite/60 text-sm mb-5">{error instanceof Error ? error.message : 'An unexpected error occurred.'}</p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-graphite text-mn-bg text-sm font-semibold rounded-full hover:bg-graphite/80 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Retry
          </button>
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────── */}
      {!isLoading && !error && enrollments.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-accent-soft rounded-3xl flex items-center justify-center mx-auto mb-5">
            <GraduationCap className="w-10 h-10 text-accent" />
          </div>
          <h3 className="text-lg font-semibold text-graphite mb-2">Start your first course</h3>
          <p className="text-graphite/60 max-w-md mx-auto mb-6 text-sm">
            Explore CE-eligible courses, treatment protocols, and professional training built for licensed practitioners.
          </p>
          <Link
            to="/education/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-graphite text-mn-bg text-sm font-semibold rounded-full hover:bg-graphite/80 transition-colors"
          >
            Browse Courses <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* ── Live content ──────────────────────────────────────── */}
      {!isLoading && !error && enrollments.length > 0 && (
        <div className="space-y-8">

          {/* ── KPI strip ─────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-accent-soft p-5">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-accent" />
                <span className="text-xs font-sans text-graphite/60">Enrolled Courses</span>
              </div>
              <p className="text-3xl font-sans text-graphite">{enrolled}</p>
            </div>
            <div className="bg-white rounded-xl border border-accent-soft p-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-signal-up" />
                <span className="text-xs font-sans text-graphite/60">Completed</span>
              </div>
              <p className="text-3xl font-sans text-graphite">{completed}</p>
            </div>
            <div className="bg-white rounded-xl border border-accent-soft p-5">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-signal-warn" />
                <span className="text-xs font-sans text-graphite/60">In Progress</span>
              </div>
              <p className="text-3xl font-sans text-graphite">{inProgress}</p>
            </div>
            <div className="bg-white rounded-xl border border-accent-soft p-5">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-accent" />
                <span className="text-xs font-sans text-graphite/60">CE Credits Earned</span>
              </div>
              <p className="text-3xl font-sans text-graphite">{ceEarned}</p>
            </div>
          </div>

          {/* ── In-Progress Courses ───────────────────────────── */}
          {inProgressCourses.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-sans text-lg text-graphite">Continue Learning</h2>
                <span className="text-xs text-graphite/50">{inProgressCourses.length} in progress</span>
              </div>
              <div className="space-y-3">
                {inProgressCourses.map(enrollment => (
                  <div
                    key={enrollment.id}
                    className="bg-white rounded-xl border border-accent-soft p-5 flex items-start gap-4 hover:shadow-sm transition-shadow"
                  >
                    {/* Thumbnail / Placeholder */}
                    <div className="w-14 h-14 rounded-lg bg-accent-soft flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {enrollment.course_thumbnail_url ? (
                        <img
                          src={enrollment.course_thumbnail_url}
                          alt={enrollment.course_title ?? ''}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Play className="w-6 h-6 text-accent" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="font-sans font-semibold text-sm text-graphite line-clamp-1">
                          {enrollment.course_title ?? 'Untitled Course'}
                        </h3>
                        {enrollment.course_level && (
                          <span className="text-[10px] font-semibold text-graphite/50 capitalize flex-shrink-0">
                            {enrollment.course_level}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-graphite/50 mb-2.5">
                        {enrollment.course_duration_minutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {enrollment.course_duration_minutes}m
                          </span>
                        )}
                        {enrollment.course_ce_credits && enrollment.course_ce_credits > 0 && (
                          <span className="flex items-center gap-1 text-accent font-medium">
                            <GraduationCap className="w-3 h-3" /> {enrollment.course_ce_credits} CE
                          </span>
                        )}
                        {enrollment.last_accessed_at && (
                          <span>
                            Last accessed {new Date(enrollment.last_accessed_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between text-xs text-graphite/50 mb-1">
                          <span>{enrollment.progress_pct}% complete</span>
                        </div>
                        <div className="h-1.5 bg-graphite/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full transition-all duration-300"
                            style={{ width: `${enrollment.progress_pct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {enrollment.course_slug && (
                      <Link
                        to={`/education/learn/${enrollment.course_slug}`}
                        className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold bg-graphite text-mn-bg rounded-lg hover:bg-graphite/80 transition-colors"
                      >
                        Resume
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Completed Courses ─────────────────────────────── */}
          {completedCourses.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-sans text-lg text-graphite">Completed</h2>
                <Link
                  to="/portal/ce-credits"
                  className="text-sm font-medium text-accent hover:text-accent-hover flex items-center gap-1"
                >
                  View CE credits <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="bg-white rounded-xl border border-accent-soft overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-accent-soft/50">
                      <th className="text-left text-xs font-sans font-semibold text-graphite/60 uppercase tracking-wide px-6 py-3">Course</th>
                      <th className="text-left text-xs font-sans font-semibold text-graphite/60 uppercase tracking-wide px-6 py-3">Completed</th>
                      <th className="text-right text-xs font-sans font-semibold text-graphite/60 uppercase tracking-wide px-6 py-3">CE Credits</th>
                      <th className="text-center text-xs font-sans font-semibold text-graphite/60 uppercase tracking-wide px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-accent-soft/60">
                    {completedCourses.map(enrollment => (
                      <tr key={enrollment.id} className="hover:bg-accent-soft/30 transition-colors">
                        <td className="px-6 py-3.5">
                          <span className="text-sm font-sans font-medium text-graphite">
                            {enrollment.course_title ?? '—'}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-sm font-sans text-graphite/60 whitespace-nowrap">
                          {enrollment.completed_at
                            ? new Date(enrollment.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : '—'}
                        </td>
                        <td className="px-6 py-3.5 text-right text-sm font-sans font-semibold text-graphite">
                          {enrollment.course_ce_credits ?? 0}
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <span className={`inline-flex items-center gap-1 text-xs font-sans font-medium rounded-full px-2.5 py-1 ${STATUS_STYLE[enrollment.status] ?? 'bg-graphite/10 text-graphite/60'}`}>
                            <CheckCircle className="w-3 h-3" />
                            Completed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Certificates quick view ───────────────────────── */}
          {certificates.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-sans text-lg text-graphite">My Certificates</h2>
                <Link
                  to="/education/certificates"
                  className="text-sm font-medium text-accent hover:text-accent-hover flex items-center gap-1"
                >
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {certificates.slice(0, 3).map(cert => (
                  <div key={cert.id} className="bg-white rounded-xl border border-accent-soft p-5 flex items-start gap-3">
                    <Award className="w-8 h-8 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-sans font-semibold text-sm text-graphite mb-0.5">
                        {cert.course_title ?? 'Certificate'}
                      </h3>
                      <p className="text-xs text-graphite/50">
                        Issued {new Date(cert.issued_at).toLocaleDateString()}
                        {cert.ce_credits ? ` — ${cert.ce_credits} CE` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CE credits quick link ─────────────────────────── */}
          <div className="bg-accent-soft/50 rounded-xl border border-accent-soft p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-graphite">CE Credit Tracker</p>
                <p className="text-xs text-graphite/60">
                  {ceEarned} credits earned this period — track compliance and renewal requirements
                </p>
              </div>
            </div>
            <Link
              to="/portal/ce-credits"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-graphite text-mn-bg rounded-lg hover:bg-graphite/80 transition-colors flex-shrink-0"
            >
              View tracker <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}
