/**
 * AdminCourseEditor — Course authoring tool: module/lesson ordering, content editor, quiz builder
 * Data source: courses, course_modules, course_lessons, quizzes, quiz_questions (LIVE)
 * Route: /admin/courses/:id/edit
 */
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Play,
  FileText,
  HelpCircle,
  Box,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

/* ── Types ─────────────────────────────────────────────────────────── */

interface CourseForm {
  title: string;
  slug: string;
  description: string;
  long_description: string;
  category: string;
  level: string;
  thumbnail_url: string;
  trailer_url: string;
  author_name: string;
  author_bio: string;
  author_avatar_url: string;
  duration_minutes: string;
  ce_credits: string;
  price_cents: string;
  is_free: boolean;
  is_featured: boolean;
  is_published: boolean;
  prerequisites: string;
  learning_outcomes: string;
}

interface ModuleForm {
  id?: string;
  title: string;
  description: string;
  sort_order: number;
  lessons: LessonForm[];
}

interface LessonForm {
  id?: string;
  title: string;
  slug: string;
  lesson_type: 'video' | 'text' | 'quiz' | 'scorm';
  content: string;
  video_url: string;
  duration_minutes: string;
  sort_order: number;
  is_preview: boolean;
  quiz_id: string;
  scorm_package_id: string;
}

interface QuizQuestionForm {
  id?: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options: string;
  correct_answer: string;
  explanation: string;
  points: string;
  sort_order: number;
}

const EMPTY_COURSE: CourseForm = {
  title: '', slug: '', description: '', long_description: '', category: '', level: 'beginner',
  thumbnail_url: '', trailer_url: '', author_name: '', author_bio: '', author_avatar_url: '',
  duration_minutes: '', ce_credits: '', price_cents: '', is_free: true, is_featured: false,
  is_published: false, prerequisites: '', learning_outcomes: '',
};

const EMPTY_MODULE: ModuleForm = { title: '', description: '', sort_order: 0, lessons: [] };

const EMPTY_LESSON: LessonForm = {
  title: '', slug: '', lesson_type: 'text', content: '', video_url: '',
  duration_minutes: '', sort_order: 0, is_preview: false, quiz_id: '', scorm_package_id: '',
};

const EMPTY_QUESTION: QuizQuestionForm = {
  question_text: '', question_type: 'multiple_choice', options: '',
  correct_answer: '', explanation: '', points: '1', sort_order: 0,
};

/* ── Lesson type icons ─────────────────────────────────────────────── */

const LESSON_ICONS: Record<string, React.ElementType> = {
  video: Play,
  text: FileText,
  quiz: HelpCircle,
  scorm: Box,
};

/* ── Main component ────────────────────────────────────────────────── */

export default function AdminCourseEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [form, setForm] = useState<CourseForm>(EMPTY_COURSE);
  const [modules, setModules] = useState<ModuleForm[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeModuleIndex, setActiveModuleIndex] = useState<number | null>(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState<number | null>(null);
  const [showQuizBuilder, setShowQuizBuilder] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionForm[]>([]);
  const [quizMeta, setQuizMeta] = useState({ title: '', description: '', passing_score: '70', time_limit_minutes: '', max_attempts: '' });

  /* ── Load existing course ──────────────────────────────────────── */

  const loadCourse = useCallback(async () => {
    if (isNew || !isSupabaseConfigured) { setLoading(false); return; }

    try {
      const { data, error: fetchError } = await supabase
        .from('courses')
        .select(`
          *,
          course_modules (
            id, title, description, sort_order,
            course_lessons (
              id, title, slug, lesson_type, content, video_url,
              duration_minutes, sort_order, is_preview, quiz_id, scorm_package_id
            )
          )
        `)
        .eq('id', id)
        .single();

      if (fetchError) { setError(fetchError.message); return; }

      const c = data as Record<string, unknown>;
      setForm({
        title: (c.title as string) || '',
        slug: (c.slug as string) || '',
        description: (c.description as string) || '',
        long_description: (c.long_description as string) || '',
        category: (c.category as string) || '',
        level: (c.level as string) || 'beginner',
        thumbnail_url: (c.thumbnail_url as string) || '',
        trailer_url: (c.trailer_url as string) || '',
        author_name: (c.author_name as string) || '',
        author_bio: (c.author_bio as string) || '',
        author_avatar_url: (c.author_avatar_url as string) || '',
        duration_minutes: c.duration_minutes != null ? String(c.duration_minutes) : '',
        ce_credits: c.ce_credits != null ? String(c.ce_credits) : '',
        price_cents: c.price_cents != null ? String(c.price_cents) : '',
        is_free: (c.is_free as boolean) ?? true,
        is_featured: (c.is_featured as boolean) ?? false,
        is_published: (c.is_published as boolean) ?? false,
        prerequisites: Array.isArray(c.prerequisites) ? (c.prerequisites as string[]).join('\n') : '',
        learning_outcomes: Array.isArray(c.learning_outcomes) ? (c.learning_outcomes as string[]).join('\n') : '',
      });

      const mods = ((c.course_modules || []) as Array<Record<string, unknown>>)
        .sort((a, b) => (a.sort_order as number) - (b.sort_order as number))
        .map(m => ({
          id: m.id as string,
          title: (m.title as string) || '',
          description: (m.description as string) || '',
          sort_order: (m.sort_order as number) || 0,
          lessons: ((m.course_lessons || []) as Array<Record<string, unknown>>)
            .sort((a, b) => (a.sort_order as number) - (b.sort_order as number))
            .map(l => ({
              id: l.id as string,
              title: (l.title as string) || '',
              slug: (l.slug as string) || '',
              lesson_type: (l.lesson_type as LessonForm['lesson_type']) || 'text',
              content: (l.content as string) || '',
              video_url: (l.video_url as string) || '',
              duration_minutes: l.duration_minutes != null ? String(l.duration_minutes) : '',
              sort_order: (l.sort_order as number) || 0,
              is_preview: (l.is_preview as boolean) || false,
              quiz_id: (l.quiz_id as string) || '',
              scorm_package_id: (l.scorm_package_id as string) || '',
            })),
        }));

      setModules(mods);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [id, isNew]);

  useEffect(() => { loadCourse(); }, [loadCourse]);

  /* ── Save ──────────────────────────────────────────────────────── */

  const save = async () => {
    if (!isSupabaseConfigured) return;
    setSaving(true);
    setError(null);

    try {
      const courseData = {
        title: form.title,
        slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: form.description || null,
        long_description: form.long_description || null,
        category: form.category || null,
        level: form.level || null,
        thumbnail_url: form.thumbnail_url || null,
        trailer_url: form.trailer_url || null,
        author_name: form.author_name || null,
        author_bio: form.author_bio || null,
        author_avatar_url: form.author_avatar_url || null,
        duration_minutes: form.duration_minutes ? parseInt(form.duration_minutes) : null,
        ce_credits: form.ce_credits ? parseFloat(form.ce_credits) : null,
        price_cents: form.price_cents ? parseInt(form.price_cents) : null,
        is_free: form.is_free,
        is_featured: form.is_featured,
        is_published: form.is_published,
        prerequisites: form.prerequisites.trim() ? form.prerequisites.split('\n').filter(Boolean) : null,
        learning_outcomes: form.learning_outcomes.trim() ? form.learning_outcomes.split('\n').filter(Boolean) : null,
      };

      let courseId = id;

      if (isNew) {
        const { data, error: insertError } = await supabase.from('courses').insert(courseData).select('id').single();
        if (insertError) throw insertError;
        courseId = (data as { id: string }).id;
      } else {
        const { error: updateError } = await supabase.from('courses').update(courseData).eq('id', id);
        if (updateError) throw updateError;
      }

      // Save modules + lessons
      for (let mi = 0; mi < modules.length; mi++) {
        const mod = modules[mi];
        const moduleData = {
          course_id: courseId,
          title: mod.title,
          description: mod.description || null,
          sort_order: mi,
        };

        let moduleId = mod.id;
        if (moduleId) {
          await supabase.from('course_modules').update(moduleData).eq('id', moduleId);
        } else {
          const { data } = await supabase.from('course_modules').insert(moduleData).select('id').single();
          if (data) moduleId = (data as { id: string }).id;
        }

        if (!moduleId) continue;

        for (let li = 0; li < mod.lessons.length; li++) {
          const lesson = mod.lessons[li];
          const lessonData = {
            module_id: moduleId,
            title: lesson.title,
            slug: lesson.slug || lesson.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            lesson_type: lesson.lesson_type,
            content: lesson.content || null,
            video_url: lesson.video_url || null,
            duration_minutes: lesson.duration_minutes ? parseInt(lesson.duration_minutes) : null,
            sort_order: li,
            is_preview: lesson.is_preview,
            quiz_id: lesson.quiz_id || null,
            scorm_package_id: lesson.scorm_package_id || null,
          };

          if (lesson.id) {
            await supabase.from('course_lessons').update(lessonData).eq('id', lesson.id);
          } else {
            await supabase.from('course_lessons').insert(lessonData);
          }
        }
      }

      if (isNew) {
        navigate(`/admin/courses/${courseId}/edit`, { replace: true });
      } else {
        loadCourse();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  /* ── Module helpers ────────────────────────────────────────────── */

  const addModule = () => {
    setModules(prev => [...prev, { ...EMPTY_MODULE, sort_order: prev.length }]);
    setActiveModuleIndex(modules.length);
  };

  const removeModule = (mi: number) => {
    setModules(prev => prev.filter((_, i) => i !== mi));
    setActiveModuleIndex(null);
    setActiveLessonIndex(null);
  };

  const moveModule = (mi: number, dir: -1 | 1) => {
    const ni = mi + dir;
    if (ni < 0 || ni >= modules.length) return;
    setModules(prev => {
      const next = [...prev];
      [next[mi], next[ni]] = [next[ni], next[mi]];
      return next;
    });
  };

  /* ── Lesson helpers ────────────────────────────────────────────── */

  const addLesson = (mi: number) => {
    setModules(prev => {
      const next = [...prev];
      next[mi] = { ...next[mi], lessons: [...next[mi].lessons, { ...EMPTY_LESSON, sort_order: next[mi].lessons.length }] };
      return next;
    });
  };

  const removeLesson = (mi: number, li: number) => {
    setModules(prev => {
      const next = [...prev];
      next[mi] = { ...next[mi], lessons: next[mi].lessons.filter((_, i) => i !== li) };
      return next;
    });
    setActiveLessonIndex(null);
  };

  const moveLesson = (mi: number, li: number, dir: -1 | 1) => {
    const ni = li + dir;
    const lessons = modules[mi].lessons;
    if (ni < 0 || ni >= lessons.length) return;
    setModules(prev => {
      const next = [...prev];
      const ls = [...next[mi].lessons];
      [ls[li], ls[ni]] = [ls[ni], ls[li]];
      next[mi] = { ...next[mi], lessons: ls };
      return next;
    });
  };

  const updateLesson = (mi: number, li: number, updates: Partial<LessonForm>) => {
    setModules(prev => {
      const next = [...prev];
      const ls = [...next[mi].lessons];
      ls[li] = { ...ls[li], ...updates };
      next[mi] = { ...next[mi], lessons: ls };
      return next;
    });
  };

  /* ── Quiz builder ──────────────────────────────────────────────── */

  const saveQuiz = async () => {
    if (!isSupabaseConfigured || activeModuleIndex === null || activeLessonIndex === null) return;
    setSaving(true);
    try {
      const { data, error: e } = await supabase
        .from('quizzes')
        .insert({
          title: quizMeta.title,
          description: quizMeta.description || null,
          passing_score: parseInt(quizMeta.passing_score) || 70,
          time_limit_minutes: quizMeta.time_limit_minutes ? parseInt(quizMeta.time_limit_minutes) : null,
          max_attempts: quizMeta.max_attempts ? parseInt(quizMeta.max_attempts) : null,
        })
        .select('id')
        .single();

      if (e) throw e;

      const quizId = (data as { id: string }).id;

      for (let qi = 0; qi < quizQuestions.length; qi++) {
        const q = quizQuestions[qi];
        await supabase.from('quiz_questions').insert({
          quiz_id: quizId,
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options.trim() ? q.options.split('\n').filter(Boolean) : null,
          correct_answer: q.correct_answer,
          explanation: q.explanation || null,
          points: parseInt(q.points) || 1,
          sort_order: qi,
        });
      }

      updateLesson(activeModuleIndex, activeLessonIndex, { quiz_id: quizId });
      setShowQuizBuilder(false);
      setQuizQuestions([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save quiz');
    } finally {
      setSaving(false);
    }
  };

  /* ── Render ────────────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-graphite/10 rounded-full w-1/3 animate-pulse" />
        <div className="h-64 bg-graphite/5 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/courses" className="p-2 text-graphite/40 hover:text-graphite rounded-lg hover:bg-graphite/5 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-xl font-sans font-semibold text-graphite">
            {isNew ? 'New Course' : 'Edit Course'}
          </h1>
        </div>
        <button
          onClick={save}
          disabled={saving || !form.title.trim()}
          className="flex items-center gap-2 h-9 px-5 bg-mn-dark text-white text-xs font-semibold rounded-full hover:bg-graphite transition-colors disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Course details form */}
      <div className="bg-white rounded-xl border border-graphite/8 p-6">
        <h2 className="text-sm font-semibold text-graphite mb-4">Course Details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-graphite/60 mb-1 block">Title *</label>
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full h-10 px-3 border border-graphite/10 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/40" />
          </div>
          <div>
            <label className="text-xs font-semibold text-graphite/60 mb-1 block">Slug</label>
            <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              placeholder="auto-generated"
              className="w-full h-10 px-3 border border-graphite/10 rounded-lg text-sm text-graphite placeholder:text-graphite/30 focus:outline-none focus:border-accent/40" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-graphite/60 mb-1 block">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
              className="w-full px-3 py-2 border border-graphite/10 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/40 resize-none" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-graphite/60 mb-1 block">Long Description</label>
            <textarea value={form.long_description} onChange={e => setForm(f => ({ ...f, long_description: e.target.value }))} rows={4}
              className="w-full px-3 py-2 border border-graphite/10 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/40 resize-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-graphite/60 mb-1 block">Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full h-10 px-3 border border-graphite/10 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/40">
              <option value="">Select category</option>
              <option value="treatment_protocols">Treatment Protocols</option>
              <option value="ingredient_science">Ingredient Science</option>
              <option value="business_operations">Business Operations</option>
              <option value="compliance_regulatory">Compliance & Regulatory</option>
              <option value="device_training">Device Training</option>
              <option value="retail_strategy">Retail Strategy</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-graphite/60 mb-1 block">Level</label>
            <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
              className="w-full h-10 px-3 border border-graphite/10 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/40">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-graphite/60 mb-1 block">Author Name</label>
            <input type="text" value={form.author_name} onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))}
              className="w-full h-10 px-3 border border-graphite/10 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/40" />
          </div>
          <div>
            <label className="text-xs font-semibold text-graphite/60 mb-1 block">Thumbnail URL</label>
            <input type="text" value={form.thumbnail_url} onChange={e => setForm(f => ({ ...f, thumbnail_url: e.target.value }))}
              className="w-full h-10 px-3 border border-graphite/10 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/40" />
          </div>
          <div>
            <label className="text-xs font-semibold text-graphite/60 mb-1 block">Duration (minutes)</label>
            <input type="number" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))}
              className="w-full h-10 px-3 border border-graphite/10 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/40" />
          </div>
          <div>
            <label className="text-xs font-semibold text-graphite/60 mb-1 block">CE Credits</label>
            <input type="number" step="0.5" value={form.ce_credits} onChange={e => setForm(f => ({ ...f, ce_credits: e.target.value }))}
              className="w-full h-10 px-3 border border-graphite/10 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/40" />
          </div>
          <div>
            <label className="text-xs font-semibold text-graphite/60 mb-1 block">Price (cents)</label>
            <input type="number" value={form.price_cents} onChange={e => setForm(f => ({ ...f, price_cents: e.target.value }))}
              className="w-full h-10 px-3 border border-graphite/10 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/40" />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-graphite cursor-pointer">
              <input type="checkbox" checked={form.is_free} onChange={e => setForm(f => ({ ...f, is_free: e.target.checked }))} className="accent-accent" />
              Free
            </label>
            <label className="flex items-center gap-2 text-sm text-graphite cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} className="accent-accent" />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm text-graphite cursor-pointer">
              <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} className="accent-accent" />
              Published
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-graphite/60 mb-1 block">Learning Outcomes (one per line)</label>
            <textarea value={form.learning_outcomes} onChange={e => setForm(f => ({ ...f, learning_outcomes: e.target.value }))} rows={3}
              className="w-full px-3 py-2 border border-graphite/10 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/40 resize-none" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-graphite/60 mb-1 block">Prerequisites (one per line)</label>
            <textarea value={form.prerequisites} onChange={e => setForm(f => ({ ...f, prerequisites: e.target.value }))} rows={2}
              className="w-full px-3 py-2 border border-graphite/10 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/40 resize-none" />
          </div>
        </div>
      </div>

      {/* Modules + Lessons */}
      <div className="bg-white rounded-xl border border-graphite/8 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-graphite">Modules & Lessons</h2>
          <button
            onClick={addModule}
            className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-accent border border-accent/20 rounded-full hover:bg-accent/5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Module
          </button>
        </div>

        {modules.length === 0 && (
          <p className="text-sm text-graphite/40 text-center py-8">No modules yet. Add a module to start building your curriculum.</p>
        )}

        <div className="space-y-4">
          {modules.map((mod, mi) => (
            <div key={mi} className="border border-graphite/10 rounded-xl overflow-hidden">
              {/* Module header */}
              <div className="flex items-center gap-3 p-4 bg-graphite/3">
                <GripVertical className="w-4 h-4 text-graphite/20 cursor-grab" />
                <div className="flex-1">
                  <input
                    type="text"
                    value={mod.title}
                    onChange={e => {
                      setModules(prev => {
                        const next = [...prev];
                        next[mi] = { ...next[mi], title: e.target.value };
                        return next;
                      });
                    }}
                    placeholder="Module title"
                    className="w-full bg-transparent text-sm font-semibold text-graphite placeholder:text-graphite/30 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveModule(mi, -1)} disabled={mi === 0} className="p-1.5 text-graphite/30 hover:text-graphite disabled:opacity-30 transition-colors"><ChevronUp className="w-3.5 h-3.5" /></button>
                  <button onClick={() => moveModule(mi, 1)} disabled={mi === modules.length - 1} className="p-1.5 text-graphite/30 hover:text-graphite disabled:opacity-30 transition-colors"><ChevronDown className="w-3.5 h-3.5" /></button>
                  <button onClick={() => removeModule(mi)} className="p-1.5 text-graphite/30 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              {/* Lessons */}
              <div className="p-3">
                {mod.lessons.map((lesson, li) => {
                  const Icon = LESSON_ICONS[lesson.lesson_type] || FileText;
                  const isActive = activeModuleIndex === mi && activeLessonIndex === li;

                  return (
                    <div key={li}>
                      <div
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          isActive ? 'bg-accent/5 border border-accent/20' : 'hover:bg-graphite/2'
                        }`}
                        onClick={() => { setActiveModuleIndex(mi); setActiveLessonIndex(li); }}
                      >
                        <GripVertical className="w-3.5 h-3.5 text-graphite/15 cursor-grab" />
                        <Icon className="w-3.5 h-3.5 text-graphite/40" />
                        <span className="flex-1 text-sm text-graphite truncate">{lesson.title || 'Untitled lesson'}</span>
                        {lesson.is_preview && <Eye className="w-3.5 h-3.5 text-accent/60" />}
                        <div className="flex items-center gap-0.5">
                          <button onClick={e => { e.stopPropagation(); moveLesson(mi, li, -1); }} disabled={li === 0} className="p-1 text-graphite/20 hover:text-graphite disabled:opacity-30"><ChevronUp className="w-3 h-3" /></button>
                          <button onClick={e => { e.stopPropagation(); moveLesson(mi, li, 1); }} disabled={li === mod.lessons.length - 1} className="p-1 text-graphite/20 hover:text-graphite disabled:opacity-30"><ChevronDown className="w-3 h-3" /></button>
                          <button onClick={e => { e.stopPropagation(); removeLesson(mi, li); }} className="p-1 text-graphite/20 hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      </div>

                      {/* Inline lesson editor */}
                      {isActive && (
                        <div className="mt-2 p-4 bg-mn-bg rounded-lg border border-graphite/8 space-y-3">
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-semibold text-graphite/50 mb-1 block">Title</label>
                              <input type="text" value={lesson.title}
                                onChange={e => updateLesson(mi, li, { title: e.target.value })}
                                className="w-full h-9 px-3 border border-graphite/10 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/40" />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-graphite/50 mb-1 block">Type</label>
                              <select value={lesson.lesson_type}
                                onChange={e => updateLesson(mi, li, { lesson_type: e.target.value as LessonForm['lesson_type'] })}
                                className="w-full h-9 px-3 border border-graphite/10 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/40">
                                <option value="text">Text</option>
                                <option value="video">Video</option>
                                <option value="quiz">Quiz</option>
                                <option value="scorm">SCORM</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-graphite/50 mb-1 block">Duration (min)</label>
                              <input type="number" value={lesson.duration_minutes}
                                onChange={e => updateLesson(mi, li, { duration_minutes: e.target.value })}
                                className="w-full h-9 px-3 border border-graphite/10 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/40" />
                            </div>
                            <div className="flex items-center">
                              <label className="flex items-center gap-2 text-sm text-graphite cursor-pointer">
                                <input type="checkbox" checked={lesson.is_preview}
                                  onChange={e => updateLesson(mi, li, { is_preview: e.target.checked })}
                                  className="accent-accent" />
                                Free preview
                              </label>
                            </div>
                          </div>

                          {lesson.lesson_type === 'video' && (
                            <div>
                              <label className="text-xs font-semibold text-graphite/50 mb-1 block">Video URL</label>
                              <input type="text" value={lesson.video_url}
                                onChange={e => updateLesson(mi, li, { video_url: e.target.value })}
                                className="w-full h-9 px-3 border border-graphite/10 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/40" />
                            </div>
                          )}

                          {lesson.lesson_type === 'text' && (
                            <div>
                              <label className="text-xs font-semibold text-graphite/50 mb-1 block">Content</label>
                              <textarea value={lesson.content}
                                onChange={e => updateLesson(mi, li, { content: e.target.value })}
                                rows={6}
                                className="w-full px-3 py-2 border border-graphite/10 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/40 resize-none font-mono" />
                            </div>
                          )}

                          {lesson.lesson_type === 'quiz' && (
                            <div>
                              <label className="text-xs font-semibold text-graphite/50 mb-1 block">Quiz ID</label>
                              <div className="flex gap-2">
                                <input type="text" value={lesson.quiz_id}
                                  onChange={e => updateLesson(mi, li, { quiz_id: e.target.value })}
                                  placeholder="Existing quiz UUID"
                                  className="flex-1 h-9 px-3 border border-graphite/10 rounded-lg text-sm text-graphite placeholder:text-graphite/30 focus:outline-none focus:border-accent/40" />
                                <button
                                  onClick={() => { setShowQuizBuilder(true); setQuizQuestions([{ ...EMPTY_QUESTION }]); }}
                                  className="h-9 px-3 text-xs font-semibold text-accent border border-accent/20 rounded-lg hover:bg-accent/5 transition-colors"
                                >
                                  Build Quiz
                                </button>
                              </div>
                            </div>
                          )}

                          {lesson.lesson_type === 'scorm' && (
                            <div>
                              <label className="text-xs font-semibold text-graphite/50 mb-1 block">SCORM Package ID</label>
                              <input type="text" value={lesson.scorm_package_id}
                                onChange={e => updateLesson(mi, li, { scorm_package_id: e.target.value })}
                                placeholder="SCORM package UUID"
                                className="w-full h-9 px-3 border border-graphite/10 rounded-lg text-sm text-graphite placeholder:text-graphite/30 focus:outline-none focus:border-accent/40" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                <button
                  onClick={() => addLesson(mi)}
                  className="w-full mt-2 flex items-center justify-center gap-1.5 h-9 text-xs font-semibold text-graphite/40 border border-dashed border-graphite/15 rounded-lg hover:text-graphite/60 hover:border-graphite/30 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Lesson
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quiz Builder Modal */}
      {showQuizBuilder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-graphite">Quiz Builder</h3>
              <button onClick={() => setShowQuizBuilder(false)} className="text-graphite/40 hover:text-graphite">
                <span className="sr-only">Close</span>&times;
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-graphite/50 mb-1 block">Quiz Title</label>
                  <input type="text" value={quizMeta.title} onChange={e => setQuizMeta(m => ({ ...m, title: e.target.value }))}
                    className="w-full h-9 px-3 border border-graphite/10 rounded-lg text-sm focus:outline-none focus:border-accent/40" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-graphite/50 mb-1 block">Passing Score (%)</label>
                  <input type="number" value={quizMeta.passing_score} onChange={e => setQuizMeta(m => ({ ...m, passing_score: e.target.value }))}
                    className="w-full h-9 px-3 border border-graphite/10 rounded-lg text-sm focus:outline-none focus:border-accent/40" />
                </div>
              </div>

              {quizQuestions.map((q, qi) => (
                <div key={qi} className="p-4 border border-graphite/10 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-accent">Question {qi + 1}</span>
                    <button onClick={() => setQuizQuestions(prev => prev.filter((_, i) => i !== qi))} className="text-graphite/30 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <input type="text" value={q.question_text} onChange={e => setQuizQuestions(prev => { const n = [...prev]; n[qi] = { ...n[qi], question_text: e.target.value }; return n; })}
                    placeholder="Question text"
                    className="w-full h-9 px-3 border border-graphite/10 rounded-lg text-sm focus:outline-none focus:border-accent/40" />
                  <div className="grid grid-cols-2 gap-3">
                    <select value={q.question_type} onChange={e => setQuizQuestions(prev => { const n = [...prev]; n[qi] = { ...n[qi], question_type: e.target.value as QuizQuestionForm['question_type'] }; return n; })}
                      className="h-9 px-3 border border-graphite/10 rounded-lg text-sm focus:outline-none focus:border-accent/40">
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="true_false">True/False</option>
                      <option value="short_answer">Short Answer</option>
                    </select>
                    <input type="text" value={q.correct_answer}
                      onChange={e => setQuizQuestions(prev => { const n = [...prev]; n[qi] = { ...n[qi], correct_answer: e.target.value }; return n; })}
                      placeholder="Correct answer"
                      className="h-9 px-3 border border-graphite/10 rounded-lg text-sm focus:outline-none focus:border-accent/40" />
                  </div>
                  {q.question_type === 'multiple_choice' && (
                    <textarea value={q.options}
                      onChange={e => setQuizQuestions(prev => { const n = [...prev]; n[qi] = { ...n[qi], options: e.target.value }; return n; })}
                      rows={3} placeholder="Options (one per line)"
                      className="w-full px-3 py-2 border border-graphite/10 rounded-lg text-sm focus:outline-none focus:border-accent/40 resize-none" />
                  )}
                </div>
              ))}

              <button
                onClick={() => setQuizQuestions(prev => [...prev, { ...EMPTY_QUESTION, sort_order: prev.length }])}
                className="w-full h-9 border border-dashed border-graphite/15 rounded-lg text-xs font-semibold text-graphite/40 hover:text-graphite/60 transition-colors"
              >
                + Add Question
              </button>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowQuizBuilder(false)} className="h-9 px-4 text-xs font-semibold text-graphite/60 hover:text-graphite transition-colors">Cancel</button>
              <button onClick={saveQuiz} disabled={saving || !quizMeta.title.trim() || quizQuestions.length === 0}
                className="h-9 px-5 bg-mn-dark text-white text-xs font-semibold rounded-full hover:bg-graphite transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : 'Create Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
