/**
 * AdminEducationHub — /admin/education
 * Admin overview: all courses, enrollments, certificates, CE report
 * Data: courses, course_enrollments, certificates tables (LIVE)
 */
import {
  BookOpen,
  Users,
  Award,
  GraduationCap,
  Loader2,
  Eye,
  TrendingUp,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface AdminStats {
  totalCourses: number;
  publishedCourses: number;
  totalEnrollments: number;
  totalCertificates: number;
  totalCeCreditsIssued: number;
}

interface CourseRow {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  enrollment_count: number | null;
  category: string | null;
  level: string | null;
  created_at: string;
  updated_at: string;
}

interface EducationData {
  stats: AdminStats;
  courses: CourseRow[];
}

export default function AdminEducationHub() {
  const { data: eduData, isLoading: loading } = useQuery<EducationData>({
    queryKey: ['admin-education-hub'],
    queryFn: async () => {
      // Fetch courses
      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, title, slug, is_published, enrollment_count, category, level, created_at, updated_at')
        .order('created_at', { ascending: false });

      // Fetch enrollment count
      const { count: enrollmentCount } = await supabase
        .from('course_enrollments')
        .select('id', { count: 'exact', head: true });

      // Fetch certificate count + CE total
      const { data: certsData } = await supabase
        .from('certificates')
        .select('ce_credits');

      const coursesList = (coursesData as CourseRow[]) || [];
      const certs = (certsData as { ce_credits: number | null }[]) || [];
      const totalCE = certs.reduce((sum, c) => sum + (c.ce_credits || 0), 0);

      return {
        courses: coursesList,
        stats: {
          totalCourses: coursesList.length,
          publishedCourses: coursesList.filter(c => c.is_published).length,
          totalEnrollments: enrollmentCount || 0,
          totalCertificates: certs.length,
          totalCeCreditsIssued: totalCE,
        },
      };
    },
    enabled: isSupabaseConfigured,
  });

  const courses = eduData?.courses ?? [];
  const stats = eduData?.stats ?? { totalCourses: 0, publishedCourses: 0, totalEnrollments: 0, totalCertificates: 0, totalCeCreditsIssued: 0 };
  const isLive = !!eduData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-graphite font-sans">Education Hub</h1>
          <p className="text-graphite/60 font-sans text-sm mt-0.5">Courses, enrollments, certificates, and CE credits</p>
        </div>
        {!isLive && !loading && (
          <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">DEMO</span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-graphite animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 bg-white rounded-lg border border-accent-soft">
              <BookOpen className="w-5 h-5 text-graphite mb-2" />
              <p className="text-2xl font-bold text-graphite">{stats.totalCourses}</p>
              <p className="text-xs text-graphite/60">Total Courses</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-accent-soft">
              <Eye className="w-5 h-5 text-signal-up mb-2" />
              <p className="text-2xl font-bold text-graphite">{stats.publishedCourses}</p>
              <p className="text-xs text-graphite/60">Published</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-accent-soft">
              <Users className="w-5 h-5 text-accent mb-2" />
              <p className="text-2xl font-bold text-graphite">{stats.totalEnrollments}</p>
              <p className="text-xs text-graphite/60">Enrollments</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-accent-soft">
              <Award className="w-5 h-5 text-accent mb-2" />
              <p className="text-2xl font-bold text-graphite">{stats.totalCertificates}</p>
              <p className="text-xs text-graphite/60">Certificates</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-accent-soft">
              <TrendingUp className="w-5 h-5 text-signal-warn mb-2" />
              <p className="text-2xl font-bold text-graphite">{stats.totalCeCreditsIssued}</p>
              <p className="text-xs text-graphite/60">CE Credits Issued</p>
            </div>
          </div>

          {/* Courses table */}
          <div className="bg-white rounded-lg border border-accent-soft overflow-hidden">
            <div className="px-4 py-3 border-b border-accent-soft">
              <h2 className="font-semibold text-graphite font-sans text-sm">All Courses</h2>
            </div>
            {courses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-accent-soft bg-background/50">
                      <th className="text-left px-4 py-2 text-graphite/60 font-medium font-sans">Title</th>
                      <th className="text-left px-4 py-2 text-graphite/60 font-medium font-sans">Category</th>
                      <th className="text-left px-4 py-2 text-graphite/60 font-medium font-sans">Level</th>
                      <th className="text-center px-4 py-2 text-graphite/60 font-medium font-sans">Status</th>
                      <th className="text-right px-4 py-2 text-graphite/60 font-medium font-sans">Enrollments</th>
                      <th className="text-right px-4 py-2 text-graphite/60 font-medium font-sans">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map(course => (
                      <tr key={course.id} className="border-b border-accent-soft/50 hover:bg-background/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-graphite font-sans">{course.title}</td>
                        <td className="px-4 py-3 text-graphite/60 font-sans capitalize">{course.category?.replace(/_/g, ' ') || '—'}</td>
                        <td className="px-4 py-3 text-graphite/60 font-sans capitalize">{course.level || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            course.is_published ? 'bg-signal-up/10 text-signal-up' : 'bg-accent-soft/50 text-graphite/60'
                          }`}>
                            {course.is_published ? 'Live' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-graphite/60 font-sans">{course.enrollment_count || 0}</td>
                        <td className="px-4 py-3 text-right text-graphite/60 font-sans text-xs">
                          {new Date(course.updated_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <GraduationCap className="w-8 h-8 text-accent-soft mx-auto mb-3" />
                <p className="text-graphite/60 font-sans text-sm">No courses found</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
