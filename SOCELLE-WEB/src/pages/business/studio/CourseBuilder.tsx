// ── CourseBuilder — WO-CMS-05 ───────────────────────────────────────
// Step wizard for course creation: Settings > Curriculum > Assessment > Review > Publish.
// Stores to cms_docs (doc_type='course', space='education').
// Data label: LIVE — reads/writes from Supabase CMS tables.

import { useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Settings,
  BookOpen,
  ClipboardList,
  Eye,
  Send,
  Plus,
  Trash2,
  GripVertical,
  Video,
  FileText,
  ListChecks,
  Upload,
  Layers,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useStudioDoc, useStudioDocs } from '../../../lib/studio/useStudioDocs';
import type { Json } from '../../../lib/database.types';

// ── Types ───────────────────────────────────────────────────────────

type WizardStep = 'settings' | 'curriculum' | 'assessment' | 'review' | 'publish';

type LessonType = 'video' | 'interactive' | 'document' | 'quiz' | 'scorm_import';
type QuestionType = 'multiple_choice' | 'true_false' | 'matching' | 'short_answer';

interface CourseLesson {
  id: string;
  title: string;
  type: LessonType;
  content: string;
  duration_minutes: number;
}

interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessons: CourseLesson[];
}

interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options: string[];
  correct_answer: string;
}

interface CourseSettings {
  title: string;
  description: string;
  objectives: string[];
  ce_credits: number;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  thumbnail: string;
}

interface AssessmentSettings {
  questions: QuizQuestion[];
  pass_threshold: number;
  retake_policy: 'unlimited' | 'limited';
  max_retakes: number;
  time_limit_minutes: number;
}

interface CourseData {
  settings: CourseSettings;
  modules: CourseModule[];
  assessment: AssessmentSettings;
}

// ── Steps config ────────────────────────────────────────────────────

const STEPS: { key: WizardStep; label: string; icon: React.ElementType }[] = [
  { key: 'settings', label: 'Settings', icon: Settings },
  { key: 'curriculum', label: 'Curriculum', icon: BookOpen },
  { key: 'assessment', label: 'Assessment', icon: ClipboardList },
  { key: 'review', label: 'Review', icon: Eye },
  { key: 'publish', label: 'Publish', icon: Send },
];

const LESSON_TYPE_ICONS: Record<LessonType, React.ElementType> = {
  video: Video,
  interactive: Layers,
  document: FileText,
  quiz: ListChecks,
  scorm_import: Upload,
};

const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  video: 'Video',
  interactive: 'Interactive (Block Editor)',
  document: 'Document Upload',
  quiz: 'Quiz',
  scorm_import: 'SCORM Import',
};

// ── Default data ────────────────────────────────────────────────────

function defaultCourseData(): CourseData {
  return {
    settings: {
      title: '',
      description: '',
      objectives: [''],
      ce_credits: 0,
      category: '',
      level: 'beginner',
      thumbnail: '',
    },
    modules: [],
    assessment: {
      questions: [],
      pass_threshold: 70,
      retake_policy: 'unlimited',
      max_retakes: 3,
      time_limit_minutes: 0,
    },
  };
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Skeleton ────────────────────────────────────────────────────────

function CourseSkeleton() {
  return (
    <div className="p-6 max-w-4xl mx-auto animate-pulse">
      <div className="h-8 bg-[#141418]/5 rounded-lg w-48 mb-6" />
      <div className="flex gap-2 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 bg-[#141418]/5 rounded-lg w-28" />
        ))}
      </div>
      <div className="space-y-4">
        <div className="h-12 bg-[#141418]/5 rounded-lg" />
        <div className="h-32 bg-[#141418]/5 rounded-lg" />
        <div className="h-12 bg-[#141418]/5 rounded-lg" />
      </div>
    </div>
  );
}

// ── Component ───────────────────────────────────────────────────────

export default function CourseBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id;

  const { doc, isLoading: docLoading, error: docError } = useStudioDoc(id ?? '');
  const { updateDoc, createDoc, publishDoc } = useStudioDocs();

  const [step, setStep] = useState<WizardStep>('settings');
  const [courseData, setCourseData] = useState<CourseData>(defaultCourseData());
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initialize from doc
  if (doc && !initialized) {
    const meta = doc.metadata as Record<string, unknown> | null;
    const saved = meta?.course_data as CourseData | undefined;
    if (saved) {
      setCourseData(saved);
    } else {
      setCourseData({
        ...defaultCourseData(),
        settings: { ...defaultCourseData().settings, title: doc.title },
      });
    }
    setInitialized(true);
  }

  if (isNew && !initialized) {
    setInitialized(true);
  }

  // ── Navigation helpers ────────────────────────────────────────────

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  function goNext() {
    if (stepIndex < STEPS.length - 1) setStep(STEPS[stepIndex + 1].key);
  }

  function goBack() {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1].key);
  }

  // ── Settings handlers ─────────────────────────────────────────────

  const updateSettings = useCallback(
    (patch: Partial<CourseSettings>) => {
      setCourseData((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...patch },
      }));
    },
    []
  );

  // ── Module handlers ───────────────────────────────────────────────

  function addModule() {
    setCourseData((prev) => ({
      ...prev,
      modules: [
        ...prev.modules,
        { id: uid(), title: '', description: '', lessons: [] },
      ],
    }));
  }

  function updateModule(moduleId: string, patch: Partial<CourseModule>) {
    setCourseData((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId ? { ...m, ...patch } : m
      ),
    }));
  }

  function removeModule(moduleId: string) {
    setCourseData((prev) => ({
      ...prev,
      modules: prev.modules.filter((m) => m.id !== moduleId),
    }));
  }

  function addLesson(moduleId: string) {
    setCourseData((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              lessons: [
                ...m.lessons,
                { id: uid(), title: '', type: 'video' as LessonType, content: '', duration_minutes: 0 },
              ],
            }
          : m
      ),
    }));
  }

  function updateLesson(
    moduleId: string,
    lessonId: string,
    patch: Partial<CourseLesson>
  ) {
    setCourseData((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              lessons: m.lessons.map((l) =>
                l.id === lessonId ? { ...l, ...patch } : l
              ),
            }
          : m
      ),
    }));
  }

  function removeLesson(moduleId: string, lessonId: string) {
    setCourseData((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId
          ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
          : m
      ),
    }));
  }

  // ── Assessment handlers ───────────────────────────────────────────

  function addQuestion() {
    setCourseData((prev) => ({
      ...prev,
      assessment: {
        ...prev.assessment,
        questions: [
          ...prev.assessment.questions,
          {
            id: uid(),
            type: 'multiple_choice' as QuestionType,
            question: '',
            options: ['', '', '', ''],
            correct_answer: '',
          },
        ],
      },
    }));
  }

  function updateQuestion(qId: string, patch: Partial<QuizQuestion>) {
    setCourseData((prev) => ({
      ...prev,
      assessment: {
        ...prev.assessment,
        questions: prev.assessment.questions.map((q) =>
          q.id === qId ? { ...q, ...patch } : q
        ),
      },
    }));
  }

  function removeQuestion(qId: string) {
    setCourseData((prev) => ({
      ...prev,
      assessment: {
        ...prev.assessment,
        questions: prev.assessment.questions.filter((q) => q.id !== qId),
      },
    }));
  }

  // ── Save ──────────────────────────────────────────────────────────

  async function handleSave() {
    setSaving(true);
    try {
      const currentMeta = doc?.metadata as Record<string, unknown> | null;
      const currentVersion = (currentMeta?.version as number) ?? 0;
      const metadata: Json = {
        ...(currentMeta ?? {}),
        course_data: courseData as unknown as Json,
        doc_type: 'course',
        space: 'education',
        version: currentVersion + 1,
      };

      if (id && doc) {
        await updateDoc.mutateAsync({
          id,
          title: courseData.settings.title || 'Untitled Course',
          metadata,
        });
      } else {
        const result = await createDoc.mutateAsync({
          title: courseData.settings.title || 'Untitled Course',
          slug: `course-${Date.now()}`,
          space_id: '',
          status: 'draft',
          scheduled_at: null,
          seo_twitter_card: 'summary_large_image',
          category: 'course',
          body: null,
          metadata,
        });
        navigate(`/portal/studio/course/${result.id}`, { replace: true });
      }
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    await handleSave();
    if (id) {
      await publishDoc.mutateAsync(id);
    }
    navigate('/portal/studio');
  }

  // ── Loading / Error ───────────────────────────────────────────────

  if (!isNew && docLoading) return <CourseSkeleton />;

  if (!isNew && docError) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 text-[#8E6464] bg-[#8E6464]/10 rounded-lg p-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>Failed to load course: {docError}</span>
          <button
            onClick={() => window.location.reload()}
            className="ml-auto flex items-center gap-1 text-sm text-[#6E879B] hover:text-[#5A7185]"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Total stats for review ────────────────────────────────────────

  const totalLessons = courseData.modules.reduce(
    (acc, m) => acc + m.lessons.length,
    0
  );
  const totalDuration = courseData.modules.reduce(
    (acc, m) =>
      acc + m.lessons.reduce((la, l) => la + l.duration_minutes, 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#F6F3EF]">
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#E8EDF1] px-6 py-3 flex items-center justify-between">
        <Link
          to="/portal/studio"
          className="flex items-center gap-1 text-sm text-[#6E879B] hover:text-[#5A7185]"
        >
          <ArrowLeft className="w-4 h-4" /> Studio
        </Link>
        <h1 className="text-lg font-semibold text-[#141418]">
          Course Builder
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1 text-sm text-white bg-[#6E879B] hover:bg-[#5A7185] px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Draft'}
        </button>
      </div>

      {/* ── Step indicator ──────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#E8EDF1] px-6 py-2">
        <div className="flex items-center gap-1 max-w-4xl mx-auto">
          {STEPS.map((s, idx) => {
            const isCurrent = s.key === step;
            const isComplete = idx < stepIndex;
            return (
              <button
                key={s.key}
                onClick={() => setStep(s.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isCurrent
                    ? 'bg-[#6E879B]/10 text-[#6E879B]'
                    : isComplete
                    ? 'text-[#5F8A72]'
                    : 'text-[#141418]/40'
                }`}
              >
                {isComplete ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <s.icon className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Step content ────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto p-6">
        {/* ── Settings ──────────────────────────────────────────────── */}
        {step === 'settings' && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#141418] mb-1">
                Course Title
              </label>
              <input
                type="text"
                value={courseData.settings.title}
                onChange={(e) => updateSettings({ title: e.target.value })}
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-[#141418] focus:outline-none focus:border-[#6E879B]"
                placeholder="Enter course title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#141418] mb-1">
                Description
              </label>
              <textarea
                value={courseData.settings.description}
                onChange={(e) =>
                  updateSettings({ description: e.target.value })
                }
                rows={4}
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-[#141418] focus:outline-none focus:border-[#6E879B] resize-y"
                placeholder="Course description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#141418] mb-1">
                Learning Objectives
              </label>
              {courseData.settings.objectives.map((obj, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={obj}
                    onChange={(e) => {
                      const next = [...courseData.settings.objectives];
                      next[idx] = e.target.value;
                      updateSettings({ objectives: next });
                    }}
                    className="flex-1 border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
                    placeholder={`Objective ${idx + 1}`}
                  />
                  {courseData.settings.objectives.length > 1 && (
                    <button
                      onClick={() =>
                        updateSettings({
                          objectives: courseData.settings.objectives.filter(
                            (_, i) => i !== idx
                          ),
                        })
                      }
                      className="p-2 text-[#8E6464] hover:bg-[#8E6464]/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() =>
                  updateSettings({
                    objectives: [...courseData.settings.objectives, ''],
                  })
                }
                className="flex items-center gap-1 text-sm text-[#6E879B] hover:text-[#5A7185] mt-1"
              >
                <Plus className="w-4 h-4" /> Add objective
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#141418] mb-1">
                  CE Credits
                </label>
                <input
                  type="number"
                  value={courseData.settings.ce_credits}
                  onChange={(e) =>
                    updateSettings({
                      ce_credits: parseFloat(e.target.value) || 0,
                    })
                  }
                  min={0}
                  step={0.5}
                  className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-[#141418] focus:outline-none focus:border-[#6E879B]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#141418] mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={courseData.settings.category}
                  onChange={(e) =>
                    updateSettings({ category: e.target.value })
                  }
                  className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-[#141418] focus:outline-none focus:border-[#6E879B]"
                  placeholder="e.g. Esthetics, Business"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#141418] mb-1">
                  Level
                </label>
                <select
                  value={courseData.settings.level}
                  onChange={(e) =>
                    updateSettings({
                      level: e.target.value as CourseSettings['level'],
                    })
                  }
                  className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-[#141418] focus:outline-none focus:border-[#6E879B]"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#141418] mb-1">
                Thumbnail URL
              </label>
              <input
                type="text"
                value={courseData.settings.thumbnail}
                onChange={(e) =>
                  updateSettings({ thumbnail: e.target.value })
                }
                className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-[#141418] focus:outline-none focus:border-[#6E879B]"
                placeholder="https://..."
              />
            </div>
          </div>
        )}

        {/* ── Curriculum ─────────────────────────────────────────────── */}
        {step === 'curriculum' && (
          <div className="space-y-4">
            {courseData.modules.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-[#E8EDF1] flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-[#6E879B]" />
                </div>
                <h2 className="text-lg font-semibold text-[#141418] mb-2">
                  No modules yet
                </h2>
                <p className="text-sm text-[#141418]/60 max-w-sm mb-4">
                  Add modules to organize your course content into sections.
                </p>
                <button
                  onClick={addModule}
                  className="flex items-center gap-1.5 bg-[#6E879B] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#5A7185] transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Module
                </button>
              </div>
            ) : (
              <>
                {courseData.modules.map((mod, modIdx) => (
                  <div
                    key={mod.id}
                    className="bg-white rounded-lg border border-[#E8EDF1] p-5"
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <GripVertical className="w-4 h-4 text-[#141418]/20 mt-2 flex-shrink-0" />
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-[#6E879B] bg-[#6E879B]/10 px-2 py-0.5 rounded-full">
                            Module {modIdx + 1}
                          </span>
                          <button
                            onClick={() => removeModule(mod.id)}
                            className="ml-auto p-1 text-[#8E6464] hover:bg-[#8E6464]/10 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={mod.title}
                          onChange={(e) =>
                            updateModule(mod.id, { title: e.target.value })
                          }
                          className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
                          placeholder="Module title"
                        />
                        <input
                          type="text"
                          value={mod.description}
                          onChange={(e) =>
                            updateModule(mod.id, {
                              description: e.target.value,
                            })
                          }
                          className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-xs text-[#141418]/70 focus:outline-none focus:border-[#6E879B]"
                          placeholder="Module description (optional)"
                        />

                        {/* Lessons */}
                        <div className="space-y-2 ml-2 border-l-2 border-[#E8EDF1] pl-4">
                          {mod.lessons.map((lesson) => {
                            const LessonIcon = LESSON_TYPE_ICONS[lesson.type];
                            return (
                              <div
                                key={lesson.id}
                                className="flex items-center gap-2 bg-[#F6F3EF] rounded-lg p-3"
                              >
                                <LessonIcon className="w-4 h-4 text-[#6E879B] flex-shrink-0" />
                                <input
                                  type="text"
                                  value={lesson.title}
                                  onChange={(e) =>
                                    updateLesson(mod.id, lesson.id, {
                                      title: e.target.value,
                                    })
                                  }
                                  className="flex-1 bg-transparent border-none text-sm text-[#141418] focus:outline-none"
                                  placeholder="Lesson title"
                                />
                                <select
                                  value={lesson.type}
                                  onChange={(e) =>
                                    updateLesson(mod.id, lesson.id, {
                                      type: e.target.value as LessonType,
                                    })
                                  }
                                  className="text-xs border border-[#E8EDF1] rounded px-2 py-1 text-[#141418]/60 focus:outline-none focus:border-[#6E879B]"
                                >
                                  {(
                                    Object.entries(LESSON_TYPE_LABELS) as [
                                      LessonType,
                                      string,
                                    ][]
                                  ).map(([val, label]) => (
                                    <option key={val} value={val}>
                                      {label}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  type="number"
                                  value={lesson.duration_minutes}
                                  onChange={(e) =>
                                    updateLesson(mod.id, lesson.id, {
                                      duration_minutes:
                                        parseInt(e.target.value, 10) || 0,
                                    })
                                  }
                                  className="w-16 text-xs border border-[#E8EDF1] rounded px-2 py-1 text-[#141418]/60 focus:outline-none focus:border-[#6E879B]"
                                  placeholder="min"
                                  min={0}
                                />
                                <button
                                  onClick={() =>
                                    removeLesson(mod.id, lesson.id)
                                  }
                                  className="p-1 text-[#8E6464] hover:bg-[#8E6464]/10 rounded"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                          <button
                            onClick={() => addLesson(mod.id)}
                            className="flex items-center gap-1 text-xs text-[#6E879B] hover:text-[#5A7185] py-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Lesson
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addModule}
                  className="flex items-center gap-1.5 text-sm text-[#6E879B] hover:text-[#5A7185] border border-dashed border-[#E8EDF1] rounded-lg px-4 py-3 w-full justify-center hover:border-[#6E879B] transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Module
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Assessment ─────────────────────────────────────────────── */}
        {step === 'assessment' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white rounded-lg border border-[#E8EDF1] p-4">
              <div>
                <label className="block text-xs font-medium text-[#141418]/60 mb-1">
                  Pass Threshold (%)
                </label>
                <input
                  type="number"
                  value={courseData.assessment.pass_threshold}
                  onChange={(e) =>
                    setCourseData((prev) => ({
                      ...prev,
                      assessment: {
                        ...prev.assessment,
                        pass_threshold: parseInt(e.target.value, 10) || 0,
                      },
                    }))
                  }
                  min={0}
                  max={100}
                  className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#141418]/60 mb-1">
                  Retake Policy
                </label>
                <select
                  value={courseData.assessment.retake_policy}
                  onChange={(e) =>
                    setCourseData((prev) => ({
                      ...prev,
                      assessment: {
                        ...prev.assessment,
                        retake_policy: e.target.value as 'unlimited' | 'limited',
                      },
                    }))
                  }
                  className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
                >
                  <option value="unlimited">Unlimited Retakes</option>
                  <option value="limited">Limited Retakes</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#141418]/60 mb-1">
                  Time Limit (minutes, 0 = none)
                </label>
                <input
                  type="number"
                  value={courseData.assessment.time_limit_minutes}
                  onChange={(e) =>
                    setCourseData((prev) => ({
                      ...prev,
                      assessment: {
                        ...prev.assessment,
                        time_limit_minutes: parseInt(e.target.value, 10) || 0,
                      },
                    }))
                  }
                  min={0}
                  className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] focus:outline-none focus:border-[#6E879B]"
                />
              </div>
            </div>

            <h3 className="text-sm font-semibold text-[#141418]">Questions</h3>

            {courseData.assessment.questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-lg border border-[#E8EDF1]">
                <div className="w-12 h-12 rounded-full bg-[#E8EDF1] flex items-center justify-center mb-3">
                  <ListChecks className="w-6 h-6 text-[#6E879B]" />
                </div>
                <p className="text-sm text-[#141418]/60 mb-3">
                  No assessment questions yet.
                </p>
                <button
                  onClick={addQuestion}
                  className="flex items-center gap-1 text-sm text-[#6E879B] hover:text-[#5A7185]"
                >
                  <Plus className="w-4 h-4" /> Add Question
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {courseData.assessment.questions.map((q, qIdx) => (
                  <div
                    key={q.id}
                    className="bg-white rounded-lg border border-[#E8EDF1] p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-[#6E879B]">
                        Question {qIdx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <select
                          value={q.type}
                          onChange={(e) =>
                            updateQuestion(q.id, {
                              type: e.target.value as QuestionType,
                            })
                          }
                          className="text-xs border border-[#E8EDF1] rounded px-2 py-1 text-[#141418]/60 focus:outline-none focus:border-[#6E879B]"
                        >
                          <option value="multiple_choice">
                            Multiple Choice
                          </option>
                          <option value="true_false">True / False</option>
                          <option value="matching">Matching</option>
                          <option value="short_answer">Short Answer</option>
                        </select>
                        <button
                          onClick={() => removeQuestion(q.id)}
                          className="p-1 text-[#8E6464] hover:bg-[#8E6464]/10 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) =>
                        updateQuestion(q.id, { question: e.target.value })
                      }
                      className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-sm text-[#141418] mb-3 focus:outline-none focus:border-[#6E879B]"
                      placeholder="Enter question"
                    />
                    {(q.type === 'multiple_choice' ||
                      q.type === 'true_false') && (
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${q.id}`}
                              checked={q.correct_answer === opt && opt !== ''}
                              onChange={() =>
                                updateQuestion(q.id, { correct_answer: opt })
                              }
                              className="text-[#6E879B] focus:ring-[#6E879B]"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...q.options];
                                newOpts[optIdx] = e.target.value;
                                updateQuestion(q.id, { options: newOpts });
                              }}
                              className="flex-1 border border-[#E8EDF1] rounded px-2 py-1 text-xs text-[#141418] focus:outline-none focus:border-[#6E879B]"
                              placeholder={`Option ${optIdx + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    {q.type === 'short_answer' && (
                      <input
                        type="text"
                        value={q.correct_answer}
                        onChange={(e) =>
                          updateQuestion(q.id, {
                            correct_answer: e.target.value,
                          })
                        }
                        className="w-full border border-[#E8EDF1] rounded-lg px-3 py-2 text-xs text-[#141418] focus:outline-none focus:border-[#6E879B]"
                        placeholder="Expected answer"
                      />
                    )}
                  </div>
                ))}
                <button
                  onClick={addQuestion}
                  className="flex items-center gap-1 text-sm text-[#6E879B] hover:text-[#5A7185] border border-dashed border-[#E8EDF1] rounded-lg px-4 py-3 w-full justify-center hover:border-[#6E879B] transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Question
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Review ──────────────────────────────────────────────────── */}
        {step === 'review' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-[#E8EDF1] p-6">
              <h2 className="text-lg font-semibold text-[#141418] mb-4">
                Course Summary
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-xs text-[#141418]/50 mb-1">Modules</p>
                  <p className="text-2xl font-semibold text-[#141418]">
                    {courseData.modules.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#141418]/50 mb-1">Lessons</p>
                  <p className="text-2xl font-semibold text-[#141418]">
                    {totalLessons}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#141418]/50 mb-1">
                    Total Duration
                  </p>
                  <p className="text-2xl font-semibold text-[#141418]">
                    {totalDuration}m
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#141418]/50 mb-1">
                    Quiz Questions
                  </p>
                  <p className="text-2xl font-semibold text-[#141418]">
                    {courseData.assessment.questions.length}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-[#141418]/50">Title</p>
                  <p className="text-sm text-[#141418]">
                    {courseData.settings.title || 'Untitled'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[#141418]/50">
                    Description
                  </p>
                  <p className="text-sm text-[#141418]/70">
                    {courseData.settings.description || 'No description'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[#141418]/50">
                    Level
                  </p>
                  <p className="text-sm text-[#141418] capitalize">
                    {courseData.settings.level}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-[#141418]/50">
                    CE Credits
                  </p>
                  <p className="text-sm text-[#141418]">
                    {courseData.settings.ce_credits}
                  </p>
                </div>
                {courseData.settings.objectives.filter(Boolean).length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-[#141418]/50">
                      Objectives
                    </p>
                    <ul className="list-disc list-inside text-sm text-[#141418]/70 space-y-1">
                      {courseData.settings.objectives
                        .filter(Boolean)
                        .map((obj, i) => (
                          <li key={i}>{obj}</li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Module breakdown */}
            {courseData.modules.length > 0 && (
              <div className="bg-white rounded-lg border border-[#E8EDF1] p-6">
                <h3 className="text-sm font-semibold text-[#141418] mb-3">
                  Curriculum Structure
                </h3>
                {courseData.modules.map((mod, idx) => (
                  <div key={mod.id} className="mb-3 last:mb-0">
                    <p className="text-sm font-medium text-[#141418]">
                      Module {idx + 1}: {mod.title || 'Untitled'}
                    </p>
                    {mod.lessons.length > 0 && (
                      <ul className="ml-4 mt-1 space-y-0.5">
                        {mod.lessons.map((l) => (
                          <li
                            key={l.id}
                            className="text-xs text-[#141418]/60 flex items-center gap-1"
                          >
                            <span>
                              {l.title || 'Untitled lesson'} (
                              {LESSON_TYPE_LABELS[l.type]},{' '}
                              {l.duration_minutes}m)
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Publish ─────────────────────────────────────────────────── */}
        {step === 'publish' && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-[#5F8A72]/10 flex items-center justify-center mb-6">
              <Send className="w-10 h-10 text-[#5F8A72]" />
            </div>
            <h2 className="text-xl font-semibold text-[#141418] mb-2">
              Ready to publish?
            </h2>
            <p className="text-sm text-[#141418]/60 max-w-md mb-8">
              Publishing will make this course available in the Education hub.
              You can unpublish or edit it at any time.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 text-sm font-medium text-[#141418] border border-[#E8EDF1] rounded-lg hover:border-[#6E879B] transition-colors disabled:opacity-50"
              >
                Save as Draft
              </button>
              <button
                onClick={handlePublish}
                disabled={saving || publishDoc.isPending}
                className="px-6 py-2.5 text-sm font-medium text-white bg-[#5F8A72] rounded-lg hover:bg-[#4A7A5F] transition-colors disabled:opacity-50"
              >
                {publishDoc.isPending ? 'Publishing...' : 'Publish Course'}
              </button>
            </div>
          </div>
        )}

        {/* ── Navigation ──────────────────────────────────────────────── */}
        {step !== 'publish' && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#E8EDF1]">
            <button
              onClick={goBack}
              disabled={stepIndex === 0}
              className="flex items-center gap-1 text-sm text-[#6E879B] hover:text-[#5A7185] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={goNext}
              className="flex items-center gap-1 text-sm text-white bg-[#6E879B] hover:bg-[#5A7185] px-4 py-2 rounded-lg transition-colors"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
