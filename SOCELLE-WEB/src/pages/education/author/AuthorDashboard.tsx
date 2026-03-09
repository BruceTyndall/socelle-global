/**
 * AuthorDashboard — /education/author
 * Lists instructor's courses with create new button
 * Data: courses table filtered by author (LIVE)
 */
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import {
  Plus,
  BookOpen,
  Users,
  Star,
  Clock,
  Edit,
  Eye,
  Loader2,
  BarChart3,
  GraduationCap,
} from 'lucide-react';
import MainNav from '../../../components/MainNav';
import SiteFooter from '../../../components/sections/SiteFooter';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { useAuth } from '../../../lib/auth';
import type { CourseListItem } from '../../../lib/education/useCourses';

export default function AuthorDashboard() {
  const { user } = useAuth();

  const { data: courses = [], isLoading: loading } = useQuery({
    queryKey: ['author-courses', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('courses')
        .select('*')
        .eq('author_id', user!.id)
        .order('updated_at', { ascending: false });

      return (data as CourseListItem[]) || [];
    },
    enabled: !!user?.id && isSupabaseConfigured,
  });

  const publishedCount = courses.filter(c => c.is_published).length;
  const totalEnrollments = courses.reduce((sum, c) => sum + (c.enrollment_count || 0), 0);

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>Author Dashboard | Socelle Education</title>
      </Helmet>

      <MainNav />

      <section className="pt-32 pb-8 lg:pt-40 lg:pb-12">
        <div className="section-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-sans font-semibold text-3xl text-graphite mb-2">My Courses</h1>
              <p className="text-graphite/60">Create and manage your course content.</p>
            </div>
            <Link
              to="/education/author/courses/new"
              className="flex items-center gap-2 h-[44px] px-6 bg-mn-dark text-mn-bg text-sm font-semibold rounded-full hover:bg-graphite/80 transition-colors"
            >
              <Plus className="w-4 h-4" /> New Course
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-mn-card rounded-xl border border-graphite/5">
              <BookOpen className="w-5 h-5 text-accent mb-2" />
              <p className="text-2xl font-bold text-graphite">{courses.length}</p>
              <p className="text-xs text-graphite/50">Total Courses</p>
            </div>
            <div className="p-4 bg-mn-card rounded-xl border border-graphite/5">
              <Eye className="w-5 h-5 text-signal-up mb-2" />
              <p className="text-2xl font-bold text-graphite">{publishedCount}</p>
              <p className="text-xs text-graphite/50">Published</p>
            </div>
            <div className="p-4 bg-mn-card rounded-xl border border-graphite/5">
              <Users className="w-5 h-5 text-signal-warn mb-2" />
              <p className="text-2xl font-bold text-graphite">{totalEnrollments}</p>
              <p className="text-xs text-graphite/50">Enrollments</p>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 lg:pb-24">
        <div className="section-container">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
            </div>
          ) : courses.length > 0 ? (
            <div className="space-y-3">
              {courses.map(course => (
                <div key={course.id} className="bg-mn-card rounded-xl border border-graphite/5 p-5 flex items-center gap-5">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className="w-20 h-14 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-14 rounded-lg bg-mn-surface flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-graphite/20" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-sans font-semibold text-sm text-graphite truncate">{course.title}</h3>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        course.is_published ? 'bg-signal-up/10 text-signal-up' : 'bg-graphite/10 text-graphite/50'
                      }`}>
                        {course.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-graphite/50">
                      {course.enrollment_count != null && (
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {course.enrollment_count}</span>
                      )}
                      {course.rating_avg != null && course.rating_avg > 0 && (
                        <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {course.rating_avg.toFixed(1)}</span>
                      )}
                      {course.duration_minutes != null && (
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration_minutes}m</span>
                      )}
                      <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> {course.level || 'All levels'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      to={`/education/author/courses/${course.id}/edit`}
                      className="p-2 rounded-lg text-graphite/40 hover:text-accent hover:bg-accent/5 transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/education/courses/${course.slug}`}
                      className="p-2 rounded-lg text-graphite/40 hover:text-accent hover:bg-accent/5 transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-mn-card rounded-2xl border border-graphite/5">
              <GraduationCap className="w-10 h-10 text-graphite/20 mx-auto mb-4" />
              <h3 className="font-sans font-semibold text-graphite mb-2">No courses yet</h3>
              <p className="text-graphite/60 text-sm mb-4">Create your first course to start teaching.</p>
              <Link to="/education/author/courses/new" className="btn-mineral-primary">
                <Plus className="w-4 h-4 mr-2 inline" /> Create Course
              </Link>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
