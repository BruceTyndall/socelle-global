/**
 * AdminEducationHub — /admin/education
 * Admin overview: all courses, enrollments, certificates, CE report
 * Data: courses, course_enrollments, certificates tables (LIVE)
 */
import { useState, useEffect } from 'react';
import {
  BookOpen,
  Users,
  Award,
  GraduationCap,
  Loader2,
  Eye,
  TrendingUp,
} from 'lucide-react';
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

export default function AdminEducationHub() {
  const [stats, setStats] = useState<AdminStats>({
    totalCourses: 0,
    publishedCourses: 0,
    totalEnrollments: 0,
    totalCertificates: 0,
    totalCeCreditsIssued: 0,
  });
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchData() {
      try {
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

        if (cancelled) return;

        const coursesList = (coursesData as CourseRow[]) || [];
        const certs = (certsData as { ce_credits: number | null }[]) || [];
        const totalCE = certs.reduce((sum, c) => sum + (c.ce_credits || 0), 0);

        setCourses(coursesList);
        setStats({
          totalCourses: coursesList.length,
          publishedCourses: coursesList.filter(c => c.is_published).length,
          totalEnrollments: enrollmentCount || 0,
          totalCertificates: certs.length,
          totalCeCreditsIssued: totalCE,
        });
        setIsLive(true);
      } catch {
        setIsLive(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-pro-charcoal font-sans">Education Hub</h1>
          <p className="text-pro-warm-gray font-sans text-sm mt-0.5">Courses, enrollments, certificates, and CE credits</p>
        </div>
        {!isLive && !loading && (
          <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">DEMO</span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-pro-navy animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 bg-white rounded-lg border border-pro-stone">
              <BookOpen className="w-5 h-5 text-pro-navy mb-2" />
              <p className="text-2xl font-bold text-pro-charcoal">{stats.totalCourses}</p>
              <p className="text-xs text-pro-warm-gray">Total Courses</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-pro-stone">
              <Eye className="w-5 h-5 text-signal-up mb-2" />
              <p className="text-2xl font-bold text-pro-charcoal">{stats.publishedCourses}</p>
              <p className="text-xs text-pro-warm-gray">Published</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-pro-stone">
              <Users className="w-5 h-5 text-pro-gold mb-2" />
              <p className="text-2xl font-bold text-pro-charcoal">{stats.totalEnrollments}</p>
              <p className="text-xs text-pro-warm-gray">Enrollments</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-pro-stone">
              <Award className="w-5 h-5 text-accent mb-2" />
              <p className="text-2xl font-bold text-pro-charcoal">{stats.totalCertificates}</p>
              <p className="text-xs text-pro-warm-gray">Certificates</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-pro-stone">
              <TrendingUp className="w-5 h-5 text-signal-warn mb-2" />
              <p className="text-2xl font-bold text-pro-charcoal">{stats.totalCeCreditsIssued}</p>
              <p className="text-xs text-pro-warm-gray">CE Credits Issued</p>
            </div>
          </div>

          {/* Courses table */}
          <div className="bg-white rounded-lg border border-pro-stone overflow-hidden">
            <div className="px-4 py-3 border-b border-pro-stone">
              <h2 className="font-semibold text-pro-charcoal font-sans text-sm">All Courses</h2>
            </div>
            {courses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-pro-stone bg-pro-ivory/50">
                      <th className="text-left px-4 py-2 text-pro-warm-gray font-medium font-sans">Title</th>
                      <th className="text-left px-4 py-2 text-pro-warm-gray font-medium font-sans">Category</th>
                      <th className="text-left px-4 py-2 text-pro-warm-gray font-medium font-sans">Level</th>
                      <th className="text-center px-4 py-2 text-pro-warm-gray font-medium font-sans">Status</th>
                      <th className="text-right px-4 py-2 text-pro-warm-gray font-medium font-sans">Enrollments</th>
                      <th className="text-right px-4 py-2 text-pro-warm-gray font-medium font-sans">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map(course => (
                      <tr key={course.id} className="border-b border-pro-stone/50 hover:bg-pro-ivory/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-pro-charcoal font-sans">{course.title}</td>
                        <td className="px-4 py-3 text-pro-warm-gray font-sans capitalize">{course.category?.replace(/_/g, ' ') || '—'}</td>
                        <td className="px-4 py-3 text-pro-warm-gray font-sans capitalize">{course.level || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            course.is_published ? 'bg-signal-up/10 text-signal-up' : 'bg-pro-stone/50 text-pro-warm-gray'
                          }`}>
                            {course.is_published ? 'Live' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-pro-warm-gray font-sans">{course.enrollment_count || 0}</td>
                        <td className="px-4 py-3 text-right text-pro-warm-gray font-sans text-xs">
                          {new Date(course.updated_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <GraduationCap className="w-8 h-8 text-pro-stone mx-auto mb-3" />
                <p className="text-pro-warm-gray font-sans text-sm">No courses found</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
