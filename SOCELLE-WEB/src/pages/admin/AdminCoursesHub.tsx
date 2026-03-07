/**
 * AdminCoursesHub — Admin courses: CRUD courses/modules/lessons, SCORM upload, certificate templates, enrollment management
 * Data source: courses, scorm_packages, certificate_templates, course_enrollments (LIVE)
 * Route: /admin/courses
 */
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Upload,
  Award,
  Users,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronRight,
  AlertCircle,
  FileArchive,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { CourseListItem } from '../../lib/useCourses';
import type { CertificateTemplate } from '../../lib/useCertificates';

/* ── Tabs ──────────────────────────────────────────────────────────── */

type Tab = 'courses' | 'scorm' | 'templates' | 'enrollments';

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'courses', label: 'Courses', icon: BookOpen },
  { key: 'scorm', label: 'SCORM Packages', icon: FileArchive },
  { key: 'templates', label: 'Certificate Templates', icon: Award },
  { key: 'enrollments', label: 'Enrollments', icon: Users },
];

/* ── Enrollment row type ───────────────────────────────────────────── */

interface EnrollmentRow {
  id: string;
  user_id: string;
  course_id: string;
  status: string;
  progress_pct: number;
  enrolled_at: string;
  completed_at: string | null;
}

/* ── SCORM package row type ────────────────────────────────────────── */

interface ScormRow {
  id: string;
  course_id: string;
  title: string;
  scorm_version: string;
  package_url: string;
  entry_point: string;
  uploaded_at: string;
}

/* ── Main component ────────────────────────────────────────────────── */

export default function AdminCoursesHub() {
  const [activeTab, setActiveTab] = useState<Tab>('courses');
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [scormPackages, setScormPackages] = useState<ScormRow[]>([]);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  /* ── Fetch helpers ─────────────────────────────────────────────── */

  const fetchCourses = useCallback(async () => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    setLoading(true);
    try {
      let query = supabase.from('courses').select('*').order('created_at', { ascending: false });
      if (search.trim()) query = query.ilike('title', `%${search.trim()}%`);
      const { data, error: e } = await query;
      if (e) { setError(e.message); setIsLive(false); }
      else { setCourses((data as CourseListItem[]) || []); setIsLive(true); }
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); setIsLive(false); }
    finally { setLoading(false); }
  }, [search]);

  const fetchScorm = useCallback(async () => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error: e } = await supabase.from('scorm_packages').select('*').order('uploaded_at', { ascending: false });
      if (e) setError(e.message);
      else setScormPackages((data as ScormRow[]) || []);
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  const fetchTemplates = useCallback(async () => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error: e } = await supabase.from('certificate_templates').select('*').order('created_at', { ascending: false });
      if (e) setError(e.message);
      else setTemplates((data as CertificateTemplate[]) || []);
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  const fetchEnrollments = useCallback(async () => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error: e } = await supabase.from('course_enrollments').select('*').order('enrolled_at', { ascending: false }).limit(100);
      if (e) setError(e.message);
      else setEnrollments((data as EnrollmentRow[]) || []);
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    setError(null);
    if (activeTab === 'courses') fetchCourses();
    else if (activeTab === 'scorm') fetchScorm();
    else if (activeTab === 'templates') fetchTemplates();
    else if (activeTab === 'enrollments') fetchEnrollments();
  }, [activeTab, fetchCourses, fetchScorm, fetchTemplates, fetchEnrollments]);

  /* ── Course actions ────────────────────────────────────────────── */

  const togglePublish = async (course: CourseListItem) => {
    if (!isSupabaseConfigured) return;
    await supabase.from('courses').update({ is_published: !course.is_published }).eq('id', course.id);
    fetchCourses();
  };

  const deleteCourse = async (id: string) => {
    if (!isSupabaseConfigured || !confirm('Delete this course? This cannot be undone.')) return;
    await supabase.from('courses').delete().eq('id', id);
    fetchCourses();
  };

  /* ── SCORM upload ──────────────────────────────────────────────── */

  const handleScormUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !isSupabaseConfigured) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { error: fnError } = await supabase.functions.invoke('process-scorm-upload', {
        body: formData,
      });

      if (fnError) {
        setError(fnError.message);
      } else {
        fetchScorm();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'SCORM upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  /* ── Render ────────────────────────────────────────────────────── */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-sans font-semibold text-graphite">Courses</h1>
          <p className="text-sm text-graphite/50 mt-0.5">
            Manage courses, SCORM packages, certificates, and enrollments
            {isLive && (
              <span className="ml-2 text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">LIVE</span>
            )}
          </p>
        </div>
        {activeTab === 'courses' && (
          <Link
            to="/admin/courses/new/edit"
            className="flex items-center gap-2 h-9 px-4 bg-mn-dark text-white text-xs font-semibold rounded-full hover:bg-graphite transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Course
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-graphite/5 rounded-xl p-1">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 h-9 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-graphite shadow-sm'
                  : 'text-graphite/50 hover:text-graphite/70'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* ── Courses tab ──────────────────────────────────────────── */}
      {activeTab === 'courses' && (
        <div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/30" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-white border border-graphite/10 rounded-lg text-sm text-graphite placeholder:text-graphite/30 focus:outline-none focus:border-accent/40"
            />
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-graphite/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12 text-sm text-graphite/40">No courses found.</div>
          ) : (
            <div className="space-y-2">
              {courses.map(course => (
                <div
                  key={course.id}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-graphite/8 hover:border-graphite/16 transition-colors"
                >
                  <div className="w-16 h-10 rounded-lg bg-graphite/5 overflow-hidden shrink-0">
                    {course.thumbnail_url && (
                      <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-graphite truncate">{course.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-graphite/40 mt-0.5">
                      <span className={course.is_published ? 'text-green-600' : 'text-graphite/40'}>
                        {course.is_published ? 'Published' : 'Draft'}
                      </span>
                      {course.level && <span>{course.level}</span>}
                      {course.enrollment_count != null && <span>{course.enrollment_count} enrolled</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => togglePublish(course)}
                      className="p-2 text-graphite/40 hover:text-graphite rounded-lg hover:bg-graphite/5 transition-colors"
                      title={course.is_published ? 'Unpublish' : 'Publish'}
                    >
                      {course.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <Link
                      to={`/admin/courses/${course.id}/edit`}
                      className="p-2 text-graphite/40 hover:text-graphite rounded-lg hover:bg-graphite/5 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => deleteCourse(course.id)}
                      className="p-2 text-graphite/40 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SCORM tab ────────────────────────────────────────────── */}
      {activeTab === 'scorm' && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <label className="flex items-center gap-2 h-9 px-4 bg-mn-dark text-white text-xs font-semibold rounded-full hover:bg-graphite transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              {uploading ? 'Uploading...' : 'Upload SCORM Package'}
              <input
                type="file"
                accept=".zip"
                onChange={handleScormUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <button onClick={fetchScorm} className="p-2 text-graphite/40 hover:text-graphite rounded-lg hover:bg-graphite/5 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 bg-graphite/5 rounded-xl animate-pulse" />)}</div>
          ) : scormPackages.length === 0 ? (
            <div className="text-center py-12 text-sm text-graphite/40">No SCORM packages uploaded.</div>
          ) : (
            <div className="space-y-2">
              {scormPackages.map(pkg => (
                <div key={pkg.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-graphite/8">
                  <FileArchive className="w-8 h-8 text-accent/60 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-graphite truncate">{pkg.title}</h3>
                    <div className="text-xs text-graphite/40 mt-0.5">
                      {pkg.scorm_version.replace('_', ' ').toUpperCase()} | Uploaded {new Date(pkg.uploaded_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Templates tab ────────────────────────────────────────── */}
      {activeTab === 'templates' && (
        <div>
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 bg-graphite/5 rounded-xl animate-pulse" />)}</div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12 text-sm text-graphite/40">No certificate templates configured.</div>
          ) : (
            <div className="space-y-2">
              {templates.map(tpl => (
                <div key={tpl.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-graphite/8">
                  <Award className="w-8 h-8 text-accent/60 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-graphite truncate">{tpl.name}</h3>
                    <div className="text-xs text-graphite/40 mt-0.5">
                      {tpl.is_default && <span className="text-accent font-semibold mr-2">Default</span>}
                      {tpl.description || 'No description'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Enrollments tab ──────────────────────────────────────── */}
      {activeTab === 'enrollments' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-graphite/50">{enrollments.length} enrollment{enrollments.length !== 1 ? 's' : ''}</p>
            <button onClick={fetchEnrollments} className="p-2 text-graphite/40 hover:text-graphite rounded-lg hover:bg-graphite/5 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-graphite/5 rounded-xl animate-pulse" />)}</div>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-12 text-sm text-graphite/40">No enrollments yet.</div>
          ) : (
            <div className="bg-white rounded-xl border border-graphite/8 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-graphite/8 text-left">
                    <th className="px-4 py-3 text-xs font-semibold text-graphite/40 uppercase tracking-wider">User ID</th>
                    <th className="px-4 py-3 text-xs font-semibold text-graphite/40 uppercase tracking-wider">Course ID</th>
                    <th className="px-4 py-3 text-xs font-semibold text-graphite/40 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-graphite/40 uppercase tracking-wider">Progress</th>
                    <th className="px-4 py-3 text-xs font-semibold text-graphite/40 uppercase tracking-wider">Enrolled</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map(enr => (
                    <tr key={enr.id} className="border-b border-graphite/4 last:border-b-0">
                      <td className="px-4 py-3 text-graphite font-mono text-xs truncate max-w-[120px]">{enr.user_id.slice(0, 8)}...</td>
                      <td className="px-4 py-3 text-graphite font-mono text-xs truncate max-w-[120px]">{enr.course_id.slice(0, 8)}...</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          enr.status === 'completed' ? 'bg-green-50 text-green-600' :
                          enr.status === 'active' ? 'bg-blue-50 text-blue-600' :
                          'bg-graphite/5 text-graphite/50'
                        }`}>
                          {enr.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-graphite/60">{enr.progress_pct}%</td>
                      <td className="px-4 py-3 text-graphite/40 text-xs">{new Date(enr.enrolled_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
