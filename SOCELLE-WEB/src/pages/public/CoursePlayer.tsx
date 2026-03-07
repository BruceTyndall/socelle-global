/**
 * CoursePlayer — Course player (requires auth): lesson sidebar + content area
 * Lesson types: VideoLesson, TextLesson, QuizLesson, ScormLesson
 * Data source: courses, lesson_progress, quizzes, scorm_packages (LIVE)
 * Route: /courses/:slug/learn (ProtectedRoute)
 */
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Play,
  FileText,
  HelpCircle,
  Box,
  CheckCircle,
  Circle,
  ChevronDown,
  Clock,
  Award,
  Menu,
  X,
} from 'lucide-react';
import { useCourse } from '../../lib/useCourses';
import type { CourseLesson, CourseModule } from '../../lib/useCourses';
import { useEnrollment, useLessonProgress } from '../../lib/useEnrollments';
import { useQuiz } from '../../lib/useQuizzes';
import type { QuizQuestion } from '../../lib/useQuizzes';
import { useScormPackage, useScormRuntime } from '../../lib/useScorm';

/* ── Flat lesson list helper ───────────────────────────────────────── */

interface FlatLesson extends CourseLesson {
  moduleTitle: string;
  moduleIndex: number;
}

function flattenLessons(modules: CourseModule[]): FlatLesson[] {
  const result: FlatLesson[] = [];
  modules.forEach((mod, mi) => {
    (mod.course_lessons || []).forEach(lesson => {
      result.push({ ...lesson, moduleTitle: mod.title, moduleIndex: mi });
    });
  });
  return result;
}

/* ── Lesson type icons ─────────────────────────────────────────────── */

const LESSON_ICONS: Record<string, React.ElementType> = {
  video: Play,
  text: FileText,
  quiz: HelpCircle,
  scorm: Box,
};

/* ── VideoLesson ───────────────────────────────────────────────────── */

function VideoLesson({ lesson, onProgress }: { lesson: FlatLesson; onProgress: (pct: number, pos: number) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const pct = Math.round((v.currentTime / v.duration) * 100);
    onProgress(pct, v.currentTime);
  };

  return (
    <div className="w-full">
      {lesson.video_url ? (
        <video
          ref={videoRef}
          src={lesson.video_url}
          controls
          className="w-full aspect-video bg-black rounded-xl"
          onTimeUpdate={handleTimeUpdate}
        />
      ) : (
        <div className="w-full aspect-video bg-graphite/5 rounded-xl flex items-center justify-center">
          <Play className="w-12 h-12 text-graphite/20" />
          <p className="text-sm text-graphite/40 ml-3">Video not available</p>
        </div>
      )}
    </div>
  );
}

/* ── TextLesson ────────────────────────────────────────────────────── */

function TextLesson({ lesson }: { lesson: FlatLesson }) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="prose prose-sm text-graphite/80 max-w-none bg-white rounded-2xl border border-graphite/8 p-8">
        {lesson.content ? (
          lesson.content.split('\n').map((p, i) => (
            <p key={i}>{p}</p>
          ))
        ) : (
          <p className="text-graphite/40">No content available for this lesson.</p>
        )}
      </div>
    </div>
  );
}

/* ── QuizLesson ────────────────────────────────────────────────────── */

function QuizLesson({ lesson, onComplete }: { lesson: FlatLesson; onComplete: () => void }) {
  const { quiz, loading, submitting, result, canRetake, submitAttempt, setResult } = useQuiz(lesson.quiz_id || undefined);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    const res = await submitAttempt(answers);
    if (res?.passed) onComplete();
  };

  if (loading) {
    return <div className="text-center py-12"><p className="text-sm text-graphite/50">Loading quiz...</p></div>;
  }

  if (!quiz) {
    return <div className="text-center py-12"><p className="text-sm text-graphite/50">Quiz not available.</p></div>;
  }

  if (result) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className={`p-8 rounded-2xl border text-center mb-6 ${
          result.passed
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <h3 className="text-2xl font-semibold text-graphite mb-2">
            {result.passed ? 'Passed!' : 'Not quite...'}
          </h3>
          <p className="text-lg text-graphite/70 mb-1">Score: {result.score}%</p>
          <p className="text-sm text-graphite/50">
            Passing score: {quiz.passing_score}%
          </p>
        </div>

        {/* Question results */}
        <div className="space-y-4 mb-6">
          {result.questionResults.map((qr, i) => (
            <div key={qr.questionId} className={`p-4 rounded-xl border ${qr.correct ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
              <p className="text-sm font-medium text-graphite mb-1">
                Q{i + 1}: {quiz.quiz_questions.find(q => q.id === qr.questionId)?.question_text}
              </p>
              {!qr.correct && (
                <p className="text-xs text-graphite/50">
                  Your answer: {qr.userAnswer} | Correct: {qr.correctAnswer}
                </p>
              )}
              {qr.explanation && (
                <p className="text-xs text-graphite/60 mt-1 italic">{qr.explanation}</p>
              )}
            </div>
          ))}
        </div>

        {canRetake && !result.passed && (
          <button
            onClick={() => { setResult(null); setAnswers({}); }}
            className="w-full h-11 bg-mn-dark text-white text-sm font-semibold rounded-full hover:bg-graphite transition-colors"
          >
            Retake Quiz
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-graphite">{quiz.title}</h3>
        {quiz.description && <p className="text-sm text-graphite/60 mt-1">{quiz.description}</p>}
        <div className="flex gap-4 mt-2 text-xs text-graphite/40">
          <span>Passing: {quiz.passing_score}%</span>
          {quiz.time_limit_minutes && <span>Time limit: {quiz.time_limit_minutes}m</span>}
          {quiz.max_attempts && <span>Max attempts: {quiz.max_attempts}</span>}
        </div>
      </div>

      <div className="space-y-6">
        {quiz.quiz_questions.map((q: QuizQuestion, i: number) => (
          <div key={q.id} className="bg-white rounded-xl border border-graphite/8 p-5">
            <p className="text-sm font-medium text-graphite mb-3">
              <span className="text-accent font-semibold mr-2">Q{i + 1}.</span>
              {q.question_text}
            </p>

            {q.question_type === 'multiple_choice' && q.options && (
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <label key={oi} className="flex items-center gap-3 p-3 rounded-lg border border-graphite/8 hover:bg-graphite/2 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name={q.id}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => handleAnswer(q.id, opt)}
                      className="accent-accent"
                    />
                    <span className="text-sm text-graphite/70">{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {q.question_type === 'true_false' && (
              <div className="flex gap-3">
                {['True', 'False'].map(opt => (
                  <label key={opt} className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border border-graphite/8 hover:bg-graphite/2 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name={q.id}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => handleAnswer(q.id, opt)}
                      className="accent-accent"
                    />
                    <span className="text-sm text-graphite/70">{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {q.question_type === 'short_answer' && (
              <input
                type="text"
                value={answers[q.id] || ''}
                onChange={e => handleAnswer(q.id, e.target.value)}
                placeholder="Type your answer..."
                className="w-full h-10 px-3 border border-graphite/10 rounded-lg text-sm text-graphite placeholder:text-graphite/30 focus:outline-none focus:border-accent/40"
              />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || Object.keys(answers).length < quiz.quiz_questions.length}
        className="mt-6 w-full h-12 bg-mn-dark text-white text-sm font-semibold rounded-full hover:bg-graphite transition-colors disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit Answers'}
      </button>
    </div>
  );
}

/* ── ScormLesson ───────────────────────────────────────────────────── */

function ScormLesson({
  lesson,
  enrollmentId,
  onComplete,
}: {
  lesson: FlatLesson;
  enrollmentId: string | undefined;
  onComplete: () => void;
}) {
  const { pkg, loading } = useScormPackage(lesson.scorm_package_id || undefined);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { injectApis } = useScormRuntime({
    scormPackageId: lesson.scorm_package_id || undefined,
    enrollmentId,
    scormVersion: pkg?.scorm_version || 'scorm_12',
    onComplete,
  });

  const handleIframeLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    // Inject SCORM APIs
    injectApis(iframe.contentWindow);

    // Listen for postMessage from SCORM content
    const handler = (event: MessageEvent) => {
      if (event.source !== iframe.contentWindow) return;
      if (event.data?.type === 'scorm-complete') {
        onComplete();
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [injectApis, onComplete]);

  if (loading) {
    return <div className="text-center py-12"><p className="text-sm text-graphite/50">Loading SCORM content...</p></div>;
  }

  if (!pkg) {
    return (
      <div className="text-center py-12">
        <Box className="w-12 h-12 text-graphite/20 mx-auto mb-3" />
        <p className="text-sm text-graphite/50">SCORM package not available.</p>
      </div>
    );
  }

  const src = pkg.package_url.endsWith('/')
    ? `${pkg.package_url}${pkg.entry_point}`
    : `${pkg.package_url}/${pkg.entry_point}`;

  return (
    <div className="w-full">
      <iframe
        ref={iframeRef}
        src={src}
        title={lesson.title}
        onLoad={handleIframeLoad}
        className="w-full h-[70vh] border border-graphite/10 rounded-xl bg-white"
        allow="autoplay; fullscreen"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      />
    </div>
  );
}

/* ── Main CoursePlayer ─────────────────────────────────────────────── */

export default function CoursePlayer() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { course, loading: courseLoading, error } = useCourse(slug);
  const { enrollment, isEnrolled, loading: enrollLoading } = useEnrollment(course?.id);
  const { progressMap, markComplete, updateProgress } = useLessonProgress(enrollment?.id);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const flatLessons = useMemo(() => {
    if (!course?.course_modules) return [];
    return flattenLessons(course.course_modules);
  }, [course]);

  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const activeLesson = flatLessons[activeLessonIndex] ?? null;

  // Set initial lesson to first incomplete
  useEffect(() => {
    if (flatLessons.length === 0 || Object.keys(progressMap).length === 0) return;
    const firstIncomplete = flatLessons.findIndex(l => {
      const p = progressMap[l.id];
      return !p || p.status !== 'completed';
    });
    if (firstIncomplete >= 0) setActiveLessonIndex(firstIncomplete);
  }, [flatLessons.length, Object.keys(progressMap).length]); // eslint-disable-line react-hooks/exhaustive-deps

  const overallProgress = useMemo(() => {
    if (flatLessons.length === 0) return 0;
    const completed = flatLessons.filter(l => progressMap[l.id]?.status === 'completed').length;
    return Math.round((completed / flatLessons.length) * 100);
  }, [flatLessons, progressMap]);

  const handleMarkComplete = async () => {
    if (!activeLesson) return;
    await markComplete(activeLesson.id);
    // Auto-advance
    if (activeLessonIndex < flatLessons.length - 1) {
      setActiveLessonIndex(activeLessonIndex + 1);
    }
  };

  const handleVideoProgress = (pct: number, pos: number) => {
    if (!activeLesson) return;
    updateProgress(activeLesson.id, pct, pos);
  };

  const handleQuizComplete = () => {
    if (activeLesson) markComplete(activeLesson.id);
  };

  const handleScormComplete = () => {
    if (activeLesson) markComplete(activeLesson.id);
  };

  if (courseLoading || enrollLoading) {
    return (
      <div className="min-h-screen bg-mn-bg flex items-center justify-center">
        <div className="space-y-3 w-40">
          <div className="h-2.5 bg-graphite/10 rounded-full animate-pulse" />
          <div className="h-2.5 bg-graphite/10 rounded-full animate-pulse w-3/4" />
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-mn-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-graphite/50 mb-4">{error || 'Course not found.'}</p>
          <Link to="/courses" className="text-sm text-accent hover:underline">Back to courses</Link>
        </div>
      </div>
    );
  }

  if (!isEnrolled) {
    navigate(`/courses/${slug}`);
    return null;
  }

  return (
    <>
      <Helmet>
        <title>{activeLesson?.title ?? course.title} | Socelle Courses</title>
      </Helmet>

      <div className="min-h-screen bg-mn-bg flex flex-col">
        {/* Top bar */}
        <header className="h-14 bg-mn-dark text-white flex items-center px-4 gap-4 shrink-0 z-20">
          <Link to={`/courses/${slug}`} className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{course.title}</span>
          </Link>
          <div className="flex-1 mx-4">
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden max-w-md mx-auto">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
          <span className="text-xs text-white/50">{overallProgress}%</span>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-white/60 hover:text-white"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside
            className={`${
              sidebarOpen ? 'w-80' : 'w-0'
            } shrink-0 bg-white border-r border-graphite/8 overflow-y-auto transition-all duration-300 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            } absolute lg:relative z-10 h-[calc(100vh-3.5rem)] lg:h-auto`}
          >
            {sidebarOpen && course.course_modules?.map((mod, mi) => (
              <div key={mod.id}>
                <div className="px-4 py-3 bg-graphite/3 border-b border-graphite/8">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-graphite/40">
                    Module {mi + 1}
                  </p>
                  <p className="text-sm font-semibold text-graphite">{mod.title}</p>
                </div>
                {mod.course_lessons?.map(lesson => {
                  const progress = progressMap[lesson.id];
                  const isActive = activeLesson?.id === lesson.id;
                  const isCompleted = progress?.status === 'completed';
                  const Icon = LESSON_ICONS[lesson.lesson_type] || FileText;
                  const globalIndex = flatLessons.findIndex(l => l.id === lesson.id);

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLessonIndex(globalIndex)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm border-b border-graphite/4 transition-colors ${
                        isActive
                          ? 'bg-accent/5 text-accent border-l-2 border-l-accent'
                          : 'text-graphite/70 hover:bg-graphite/2'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-graphite/20 shrink-0" />
                      )}
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="flex-1 line-clamp-1">{lesson.title}</span>
                      {lesson.duration_minutes && (
                        <span className="text-xs text-graphite/30">{lesson.duration_minutes}m</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </aside>

          {/* Content area */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-10">
            {activeLesson ? (
              <div>
                {/* Lesson header */}
                <div className="mb-6">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-accent mb-1">
                    {activeLesson.moduleTitle}
                  </p>
                  <h2 className="text-2xl font-sans font-semibold text-graphite mb-2">
                    {activeLesson.title}
                  </h2>
                  <div className="flex items-center gap-4 text-xs text-graphite/40">
                    {activeLesson.duration_minutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {activeLesson.duration_minutes}m
                      </span>
                    )}
                    <span className="capitalize">{activeLesson.lesson_type} lesson</span>
                  </div>
                </div>

                {/* Lesson content */}
                {activeLesson.lesson_type === 'video' && (
                  <VideoLesson lesson={activeLesson} onProgress={handleVideoProgress} />
                )}
                {activeLesson.lesson_type === 'text' && (
                  <TextLesson lesson={activeLesson} />
                )}
                {activeLesson.lesson_type === 'quiz' && (
                  <QuizLesson lesson={activeLesson} onComplete={handleQuizComplete} />
                )}
                {activeLesson.lesson_type === 'scorm' && (
                  <ScormLesson
                    lesson={activeLesson}
                    enrollmentId={enrollment?.id}
                    onComplete={handleScormComplete}
                  />
                )}

                {/* Bottom nav */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-graphite/8">
                  <button
                    onClick={() => setActiveLessonIndex(Math.max(0, activeLessonIndex - 1))}
                    disabled={activeLessonIndex === 0}
                    className="flex items-center gap-2 text-sm text-graphite/60 hover:text-graphite disabled:opacity-30 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Previous
                  </button>

                  {progressMap[activeLesson.id]?.status !== 'completed' && (
                    <button
                      onClick={handleMarkComplete}
                      className="h-10 px-6 bg-accent text-white text-sm font-semibold rounded-full hover:bg-accent/90 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> Mark Complete
                    </button>
                  )}

                  <button
                    onClick={() => setActiveLessonIndex(Math.min(flatLessons.length - 1, activeLessonIndex + 1))}
                    disabled={activeLessonIndex >= flatLessons.length - 1}
                    className="flex items-center gap-2 text-sm text-graphite/60 hover:text-graphite disabled:opacity-30 transition-colors"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <BookOpen className="w-12 h-12 text-graphite/20 mx-auto mb-4" />
                <p className="text-sm text-graphite/50">Select a lesson to begin.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
