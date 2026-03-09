/**
 * CourseBuilder — /education/author/courses/new AND /education/author/courses/:id/edit
 * Step-based course creation/editing wizard
 * Step 1: Course settings
 * Step 2: Curriculum builder (modules + lessons)
 * Step 3: Review + Publish
 * Data: courses, course_modules, course_lessons tables (LIVE)
 */
import { useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Plus,
  Trash2,
  GripVertical,
  Play,
  FileText,
  HelpCircle,
  Monitor,
  Upload,
  Eye,
  Loader2,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';
import MainNav from '../../../components/MainNav';
import SiteFooter from '../../../components/sections/SiteFooter';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { useAuth } from '../../../lib/auth';

interface CourseForm {
  title: string;
  slug: string;
  description: string;
  long_description: string;
  category: string;
  level: string;
  price_cents: number;
  is_free: boolean;
  ce_credits: number;
  thumbnail_url: string;
  trailer_url: string;
  learning_outcomes: string[];
  prerequisites: string[];
}

interface LessonForm {
  id?: string;
  title: string;
  lesson_type: 'video' | 'text' | 'quiz' | 'scorm';
  content: string;
  video_url: string;
  duration_minutes: number;
  is_preview: boolean;
  sort_order: number;
}

interface ModuleForm {
  id?: string;
  title: string;
  description: string;
  sort_order: number;
  lessons: LessonForm[];
  expanded: boolean;
}

const STEPS = ['Settings', 'Curriculum', 'Review'];

const CATEGORIES = [
  'treatment_protocols',
  'ingredient_science',
  'business_operations',
  'compliance_regulatory',
  'device_technology',
  'retail_strategy',
];

const LEVELS = ['beginner', 'intermediate', 'advanced'];

const LESSON_TYPE_OPTIONS = [
  { value: 'video', label: 'Video', icon: Play },
  { value: 'text', label: 'Text', icon: FileText },
  { value: 'quiz', label: 'Quiz', icon: HelpCircle },
  { value: 'scorm', label: 'SCORM', icon: Monitor },
] as const;

export default function CourseBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<CourseForm>({
    title: '',
    slug: '',
    description: '',
    long_description: '',
    category: '',
    level: 'beginner',
    price_cents: 0,
    is_free: true,
    ce_credits: 0,
    thumbnail_url: '',
    trailer_url: '',
    learning_outcomes: [''],
    prerequisites: [],
  });

  const [modules, setModules] = useState<ModuleForm[]>([
    { title: 'Module 1', description: '', sort_order: 0, lessons: [], expanded: true },
  ]);

  // Load existing course for editing
  const { isLoading: loading } = useQuery({
    queryKey: ['course-builder', id],
    queryFn: async () => {
      const { data: course } = await supabase
        .from('courses')
        .select(`
          *,
          course_modules (
            id, title, description, sort_order,
            course_lessons (
              id, title, lesson_type, content, video_url, duration_minutes, is_preview, sort_order
            )
          )
        `)
        .eq('id', id!)
        .single();

      if (!course) return null;

      const c = course as Record<string, unknown>;
      setForm({
        title: (c.title as string) || '',
        slug: (c.slug as string) || '',
        description: (c.description as string) || '',
        long_description: (c.long_description as string) || '',
        category: (c.category as string) || '',
        level: (c.level as string) || 'beginner',
        price_cents: (c.price_cents as number) || 0,
        is_free: (c.is_free as boolean) ?? true,
        ce_credits: (c.ce_credits as number) || 0,
        thumbnail_url: (c.thumbnail_url as string) || '',
        trailer_url: (c.trailer_url as string) || '',
        learning_outcomes: (c.learning_outcomes as string[]) || [''],
        prerequisites: (c.prerequisites as string[]) || [],
      });

      const mods = (c.course_modules as Array<Record<string, unknown>>) || [];
      if (mods.length > 0) {
        setModules(
          mods
            .sort((a, b) => ((a.sort_order as number) || 0) - ((b.sort_order as number) || 0))
            .map(m => ({
              id: m.id as string,
              title: (m.title as string) || '',
              description: (m.description as string) || '',
              sort_order: (m.sort_order as number) || 0,
              expanded: false,
              lessons: ((m.course_lessons as Array<Record<string, unknown>>) || [])
                .sort((a, b) => ((a.sort_order as number) || 0) - ((b.sort_order as number) || 0))
                .map(l => ({
                  id: l.id as string,
                  title: (l.title as string) || '',
                  lesson_type: (l.lesson_type as LessonForm['lesson_type']) || 'text',
                  content: (l.content as string) || '',
                  video_url: (l.video_url as string) || '',
                  duration_minutes: (l.duration_minutes as number) || 0,
                  is_preview: (l.is_preview as boolean) || false,
                  sort_order: (l.sort_order as number) || 0,
                })),
            }))
        );
      }

      return course;
    },
    enabled: !!id && isSupabaseConfigured,
  });

  const updateForm = (key: keyof CourseForm, value: unknown) => {
    setForm(prev => ({ ...prev, [key]: value }));
    // Auto-generate slug
    if (key === 'title') {
      const slug = (value as string)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setForm(prev => ({ ...prev, slug }));
    }
  };

  const addModule = () => {
    setModules(prev => [
      ...prev,
      { title: `Module ${prev.length + 1}`, description: '', sort_order: prev.length, lessons: [], expanded: true },
    ]);
  };

  const removeModule = (index: number) => {
    setModules(prev => prev.filter((_, i) => i !== index));
  };

  const updateModule = (index: number, key: keyof ModuleForm, value: unknown) => {
    setModules(prev => prev.map((m, i) => i === index ? { ...m, [key]: value } : m));
  };

  const addLesson = (moduleIndex: number) => {
    setModules(prev => prev.map((m, i) => {
      if (i !== moduleIndex) return m;
      return {
        ...m,
        lessons: [
          ...m.lessons,
          {
            title: `Lesson ${m.lessons.length + 1}`,
            lesson_type: 'text' as const,
            content: '',
            video_url: '',
            duration_minutes: 0,
            is_preview: false,
            sort_order: m.lessons.length,
          },
        ],
      };
    }));
  };

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    setModules(prev => prev.map((m, i) => {
      if (i !== moduleIndex) return m;
      return { ...m, lessons: m.lessons.filter((_, li) => li !== lessonIndex) };
    }));
  };

  const updateLesson = (moduleIndex: number, lessonIndex: number, key: keyof LessonForm, value: unknown) => {
    setModules(prev => prev.map((m, mi) => {
      if (mi !== moduleIndex) return m;
      return {
        ...m,
        lessons: m.lessons.map((l, li) => li === lessonIndex ? { ...l, [key]: value } : l),
      };
    }));
  };

  const handleSave = useCallback(async (publish = false) => {
    if (!user?.id || !isSupabaseConfigured) return;

    setSaving(true);
    try {
      const courseData = {
        title: form.title,
        slug: form.slug,
        description: form.description || null,
        long_description: form.long_description || null,
        category: form.category || null,
        level: form.level || null,
        price_cents: form.is_free ? 0 : form.price_cents,
        is_free: form.is_free,
        ce_credits: form.ce_credits || null,
        thumbnail_url: form.thumbnail_url || null,
        trailer_url: form.trailer_url || null,
        learning_outcomes: form.learning_outcomes.filter(Boolean),
        prerequisites: form.prerequisites.filter(Boolean),
        author_id: user.id,
        is_published: publish,
        duration_minutes: modules.reduce(
          (sum, m) => sum + m.lessons.reduce((ls, l) => ls + (l.duration_minutes || 0), 0),
          0
        ),
      };

      let courseId = id;

      if (isEditing && id) {
        await supabase.from('courses').update(courseData).eq('id', id);
      } else {
        const { data: newCourse } = await supabase
          .from('courses')
          .insert(courseData)
          .select('id')
          .single();
        courseId = (newCourse as { id: string } | null)?.id;
      }

      if (!courseId) throw new Error('Failed to save course');

      // Save modules and lessons
      for (let mi = 0; mi < modules.length; mi++) {
        const mod = modules[mi];
        const moduleData = {
          course_id: courseId,
          title: mod.title,
          description: mod.description || null,
          sort_order: mi,
        };

        let moduleId = mod.id;
        if (mod.id) {
          await supabase.from('course_modules').update(moduleData).eq('id', mod.id);
        } else {
          const { data: newMod } = await supabase
            .from('course_modules')
            .insert(moduleData)
            .select('id')
            .single();
          moduleId = (newMod as { id: string } | null)?.id;
        }

        if (!moduleId) continue;

        for (let li = 0; li < mod.lessons.length; li++) {
          const lesson = mod.lessons[li];
          const lessonData = {
            module_id: moduleId,
            title: lesson.title,
            slug: lesson.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            lesson_type: lesson.lesson_type,
            content: lesson.content || null,
            video_url: lesson.video_url || null,
            duration_minutes: lesson.duration_minutes || null,
            is_preview: lesson.is_preview,
            sort_order: li,
          };

          if (lesson.id) {
            await supabase.from('course_lessons').update(lessonData).eq('id', lesson.id);
          } else {
            await supabase.from('course_lessons').insert(lessonData);
          }
        }
      }

      navigate('/education/author');
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }, [form, modules, user?.id, id, isEditing, navigate]);

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

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>{isEditing ? 'Edit Course' : 'Create Course'} | Socelle Education</title>
      </Helmet>

      <MainNav />

      <section className="pt-32 pb-8 lg:pt-40 lg:pb-12">
        <div className="section-container max-w-3xl">
          <Link to="/education/author" className="text-sm text-graphite/50 hover:text-accent flex items-center gap-1 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to dashboard
          </Link>
          <h1 className="font-sans font-semibold text-2xl text-graphite mb-6">
            {isEditing ? 'Edit Course' : 'Create New Course'}
          </h1>

          {/* Steps indicator */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <button
                key={s}
                onClick={() => setStep(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  step === i
                    ? 'bg-mn-dark text-mn-bg'
                    : step > i
                    ? 'bg-signal-up/10 text-signal-up'
                    : 'bg-mn-card text-graphite/50 border border-graphite/10'
                }`}
              >
                {step > i ? <Check className="w-3.5 h-3.5" /> : <span className="text-xs">{i + 1}</span>}
                {s}
              </button>
            ))}
          </div>

          {/* Step 1: Settings */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-semibold text-graphite block mb-1">Course Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => updateForm('title', e.target.value)}
                  placeholder="e.g. Advanced Chemical Peel Protocols"
                  className="w-full px-4 py-2.5 bg-mn-card border border-graphite/10 rounded-xl text-sm text-graphite placeholder:text-graphite/30 focus:outline-none focus:border-accent/40"
                />
                <p className="text-xs text-graphite/40 mt-1">Slug: {form.slug || '...'}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-graphite block mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => updateForm('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-mn-card border border-graphite/10 rounded-xl text-sm text-graphite placeholder:text-graphite/30 focus:outline-none focus:border-accent/40 resize-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-graphite block mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={e => updateForm('category', e.target.value)}
                    className="w-full px-4 py-2.5 bg-mn-card border border-graphite/10 rounded-xl text-sm text-graphite focus:outline-none focus:border-accent/40"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-graphite block mb-1">Level</label>
                  <select
                    value={form.level}
                    onChange={e => updateForm('level', e.target.value)}
                    className="w-full px-4 py-2.5 bg-mn-card border border-graphite/10 rounded-xl text-sm text-graphite focus:outline-none focus:border-accent/40"
                  >
                    {LEVELS.map(lv => (
                      <option key={lv} value={lv}>{lv}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-graphite block mb-1">Pricing</label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={form.is_free} onChange={() => updateForm('is_free', true)} className="accent-accent" />
                      <span className="text-sm text-graphite">Free</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={!form.is_free} onChange={() => updateForm('is_free', false)} className="accent-accent" />
                      <span className="text-sm text-graphite">Paid</span>
                    </label>
                  </div>
                  {!form.is_free && (
                    <input
                      type="number"
                      value={form.price_cents / 100}
                      onChange={e => updateForm('price_cents', Math.round(parseFloat(e.target.value || '0') * 100))}
                      placeholder="Price in $"
                      className="w-full mt-2 px-4 py-2.5 bg-mn-card border border-graphite/10 rounded-xl text-sm text-graphite focus:outline-none focus:border-accent/40"
                    />
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-graphite block mb-1">CE Credits</label>
                  <input
                    type="number"
                    value={form.ce_credits}
                    onChange={e => updateForm('ce_credits', parseInt(e.target.value || '0'))}
                    className="w-full px-4 py-2.5 bg-mn-card border border-graphite/10 rounded-xl text-sm text-graphite focus:outline-none focus:border-accent/40"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-graphite block mb-1">Thumbnail URL</label>
                <input
                  type="url"
                  value={form.thumbnail_url}
                  onChange={e => updateForm('thumbnail_url', e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 bg-mn-card border border-graphite/10 rounded-xl text-sm text-graphite placeholder:text-graphite/30 focus:outline-none focus:border-accent/40"
                />
              </div>

              {/* Learning outcomes */}
              <div>
                <label className="text-xs font-semibold text-graphite block mb-1">Learning Outcomes</label>
                {form.learning_outcomes.map((outcome, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={outcome}
                      onChange={e => {
                        const next = [...form.learning_outcomes];
                        next[i] = e.target.value;
                        updateForm('learning_outcomes', next);
                      }}
                      placeholder="Students will be able to..."
                      className="flex-1 px-4 py-2 bg-mn-card border border-graphite/10 rounded-lg text-sm text-graphite placeholder:text-graphite/30 focus:outline-none focus:border-accent/40"
                    />
                    {form.learning_outcomes.length > 1 && (
                      <button
                        onClick={() => updateForm('learning_outcomes', form.learning_outcomes.filter((_, idx) => idx !== i))}
                        className="p-2 text-graphite/30 hover:text-signal-down"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => updateForm('learning_outcomes', [...form.learning_outcomes, ''])}
                  className="text-xs text-accent hover:text-accent-hover flex items-center gap-1 mt-1"
                >
                  <Plus className="w-3 h-3" /> Add outcome
                </button>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-mn-dark text-mn-bg text-sm font-semibold rounded-full hover:bg-graphite/80 transition-colors"
                >
                  Next: Curriculum <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Curriculum */}
          {step === 1 && (
            <div className="space-y-4">
              {modules.map((mod, mi) => (
                <div key={mi} className="bg-mn-card rounded-xl border border-graphite/5 overflow-hidden">
                  {/* Module header */}
                  <div className="flex items-center gap-3 p-4 border-b border-graphite/5">
                    <GripVertical className="w-4 h-4 text-graphite/20 flex-shrink-0 cursor-grab" />
                    <input
                      type="text"
                      value={mod.title}
                      onChange={e => updateModule(mi, 'title', e.target.value)}
                      className="flex-1 bg-transparent text-sm font-semibold text-graphite focus:outline-none"
                      placeholder="Module title"
                    />
                    <button onClick={() => updateModule(mi, 'expanded', !mod.expanded)} className="p-1 text-graphite/30">
                      {mod.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {modules.length > 1 && (
                      <button onClick={() => removeModule(mi)} className="p-1 text-graphite/30 hover:text-signal-down">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Lessons */}
                  {mod.expanded && (
                    <div className="p-4 space-y-3">
                      {mod.lessons.map((lesson, li) => {
                        const TypeIcon = LESSON_TYPE_OPTIONS.find(o => o.value === lesson.lesson_type)?.icon || FileText;
                        return (
                          <div key={li} className="p-3 bg-mn-bg rounded-lg border border-graphite/5">
                            <div className="flex items-center gap-3 mb-3">
                              <GripVertical className="w-3 h-3 text-graphite/20 cursor-grab flex-shrink-0" />
                              <TypeIcon className="w-4 h-4 text-graphite/30 flex-shrink-0" />
                              <input
                                type="text"
                                value={lesson.title}
                                onChange={e => updateLesson(mi, li, 'title', e.target.value)}
                                className="flex-1 bg-transparent text-sm text-graphite focus:outline-none"
                                placeholder="Lesson title"
                              />
                              <button onClick={() => removeLesson(mi, li)} className="p-1 text-graphite/30 hover:text-signal-down">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="grid sm:grid-cols-3 gap-3">
                              <div>
                                <label className="text-[10px] text-graphite/40 block mb-1">Type</label>
                                <select
                                  value={lesson.lesson_type}
                                  onChange={e => updateLesson(mi, li, 'lesson_type', e.target.value)}
                                  className="w-full px-3 py-1.5 bg-mn-card border border-graphite/10 rounded-lg text-xs text-graphite focus:outline-none"
                                >
                                  {LESSON_TYPE_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-[10px] text-graphite/40 block mb-1">Duration (min)</label>
                                <input
                                  type="number"
                                  value={lesson.duration_minutes || ''}
                                  onChange={e => updateLesson(mi, li, 'duration_minutes', parseInt(e.target.value || '0'))}
                                  className="w-full px-3 py-1.5 bg-mn-card border border-graphite/10 rounded-lg text-xs text-graphite focus:outline-none"
                                />
                              </div>
                              <div className="flex items-end">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={lesson.is_preview}
                                    onChange={e => updateLesson(mi, li, 'is_preview', e.target.checked)}
                                    className="accent-accent"
                                  />
                                  <span className="text-xs text-graphite">Preview</span>
                                </label>
                              </div>
                            </div>

                            {lesson.lesson_type === 'video' && (
                              <div className="mt-3">
                                <label className="text-[10px] text-graphite/40 block mb-1">Video URL</label>
                                <input
                                  type="url"
                                  value={lesson.video_url}
                                  onChange={e => updateLesson(mi, li, 'video_url', e.target.value)}
                                  placeholder="https://..."
                                  className="w-full px-3 py-1.5 bg-mn-card border border-graphite/10 rounded-lg text-xs text-graphite placeholder:text-graphite/30 focus:outline-none"
                                />
                              </div>
                            )}

                            {lesson.lesson_type === 'text' && (
                              <div className="mt-3">
                                <label className="text-[10px] text-graphite/40 block mb-1">Content</label>
                                <textarea
                                  value={lesson.content}
                                  onChange={e => updateLesson(mi, li, 'content', e.target.value)}
                                  rows={4}
                                  className="w-full px-3 py-1.5 bg-mn-card border border-graphite/10 rounded-lg text-xs text-graphite focus:outline-none resize-none"
                                />
                              </div>
                            )}

                            {lesson.lesson_type === 'scorm' && (
                              <div className="mt-3 p-3 bg-mn-card rounded-lg border border-dashed border-graphite/10 text-center">
                                <Upload className="w-5 h-5 text-graphite/20 mx-auto mb-1" />
                                <p className="text-xs text-graphite/40">SCORM ZIP upload via process-scorm-upload edge function</p>
                                <p className="text-[10px] text-graphite/30 mt-1">Upload will be available after course save</p>
                              </div>
                            )}

                            {lesson.lesson_type === 'quiz' && (
                              <div className="mt-3 p-3 bg-mn-card rounded-lg border border-dashed border-graphite/10 text-center">
                                <HelpCircle className="w-5 h-5 text-graphite/20 mx-auto mb-1" />
                                <p className="text-xs text-graphite/40">Quiz builder available after course save</p>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      <button
                        onClick={() => addLesson(mi)}
                        className="w-full py-2.5 border border-dashed border-graphite/10 rounded-lg text-xs text-graphite/40 hover:text-accent hover:border-accent/30 transition-colors flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Lesson
                      </button>
                    </div>
                  )}
                </div>
              ))}

              <button
                onClick={addModule}
                className="w-full py-3 border border-dashed border-graphite/10 rounded-xl text-sm text-graphite/40 hover:text-accent hover:border-accent/30 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Module
              </button>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep(0)}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-graphite/60 hover:text-graphite transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-mn-dark text-mn-bg text-sm font-semibold rounded-full hover:bg-graphite/80 transition-colors"
                >
                  Next: Review <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review + Publish */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-mn-card rounded-xl border border-graphite/5 p-5">
                <h3 className="font-sans font-semibold text-graphite mb-3">Course Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-graphite/50">Title</span><span className="text-graphite font-medium">{form.title || '(untitled)'}</span></div>
                  <div className="flex justify-between"><span className="text-graphite/50">Category</span><span className="text-graphite capitalize">{form.category?.replace(/_/g, ' ') || '—'}</span></div>
                  <div className="flex justify-between"><span className="text-graphite/50">Level</span><span className="text-graphite capitalize">{form.level}</span></div>
                  <div className="flex justify-between"><span className="text-graphite/50">Pricing</span><span className="text-graphite">{form.is_free ? 'Free' : `$${(form.price_cents / 100).toFixed(0)}`}</span></div>
                  <div className="flex justify-between"><span className="text-graphite/50">CE Credits</span><span className="text-graphite">{form.ce_credits}</span></div>
                  <div className="flex justify-between"><span className="text-graphite/50">Modules</span><span className="text-graphite">{modules.length}</span></div>
                  <div className="flex justify-between"><span className="text-graphite/50">Total Lessons</span><span className="text-graphite">{modules.reduce((s, m) => s + m.lessons.length, 0)}</span></div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-end pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-graphite/60 hover:text-graphite transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 border border-graphite/20 text-sm font-semibold text-graphite rounded-full hover:bg-mn-surface transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Draft
                </button>
                <button
                  onClick={() => handleSave(true)}
                  disabled={saving || !form.title}
                  className="flex items-center gap-2 px-6 py-2.5 bg-mn-dark text-mn-bg text-sm font-semibold rounded-full hover:bg-graphite/80 transition-colors disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                  Publish
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
