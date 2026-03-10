/**
 * CoursePlayer — /education/learn/:slug (enrolled only)
 * Split layout: sidebar (module/lesson tree) + main content area
 * Supports video, text, quiz, and SCORM lesson types
 * Data: courses, course_modules, course_lessons, lesson_progress, course_enrollments (LIVE)
 */
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Play,
  FileText,
  HelpCircle,
  Monitor,
  CheckCircle,
  Circle,
  Loader2,
  Menu,
  X,
  Award,
} from 'lucide-react';
import { useCourse, type CourseLesson, type CourseModule } from '../../lib/education/useCourse';
import { useEnrollment } from '../../lib/education/useEnrollment';
import { useLessonProgress } from '../../lib/education/useLessonProgress';
import { useAuth } from '../../lib/auth';
import QuizPlayer from './QuizPlayer';
import ScormPlayer from './ScormPlayer';

const LESSON_TYPE_ICON: Record<string, React.ElementType> = {
  video: Play,
  text: FileText,
  quiz: HelpCircle,
  scorm: Monitor,
};

export default function CoursePlayer() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { course, loading: courseLoading } = useCourse(slug);
  const { enrollment, isEnrolled, loading: enrollLoading } = useEnrollment(course?.id);
  const { progressMap, markComplete, updateProgress } = useLessonProgress(enrollment?.id);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const videoRef = useRef<HTMLVideoElement>(null);

  // Flatten all lessons in order
  const allLessons = useMemo(() => {
    if (!course?.course_modules) return [];
    return course.course_modules.flatMap(m => m.course_lessons || []);
  }, [course]);

  // Set initial lesson
  useEffect(() => {
    if (allLessons.length > 0 && !currentLessonId) {
      // Find first incomplete lesson or first lesson
      const firstIncomplete = allLessons.find(l => progressMap[l.id]?.status !== 'completed');
      setCurrentLessonId(firstIncomplete?.id || allLessons[0].id);
      // Expand all modules by default
      if (course?.course_modules) {
        setExpandedModules(new Set(course.course_modules.map(m => m.id)));
      }
    }
  }, [allLessons, currentLessonId, progressMap, course]);

  const currentLesson = useMemo(
    () => allLessons.find(l => l.id === currentLessonId) || null,
    [allLessons, currentLessonId]
  );

  const currentIndex = useMemo(
    () => allLessons.findIndex(l => l.id === currentLessonId),
    [allLessons, currentLessonId]
  );

  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Progress calculations
  const completedCount = useMemo(
    () => allLessons.filter(l => progressMap[l.id]?.status === 'completed').length,
    [allLessons, progressMap]
  );
  const overallProgress = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;

  const handleMarkComplete = useCallback(async () => {
    if (!currentLessonId) return;
    await markComplete(currentLessonId);
    // Auto-advance to next lesson
    if (nextLesson) {
      setCurrentLessonId(nextLesson.id);
    }
  }, [currentLessonId, markComplete, nextLesson]);

  const handleVideoProgress = useCallback(() => {
    if (!videoRef.current || !currentLessonId) return;
    const video = videoRef.current;
    const pct = (video.currentTime / video.duration) * 100;
    void updateProgress(currentLessonId, pct, video.currentTime);
  }, [currentLessonId, updateProgress]);

  const handleVideoEnded = useCallback(() => {
    if (currentLessonId) {
      void markComplete(currentLessonId);
    }
  }, [currentLessonId, markComplete]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const selectLesson = (lessonId: string) => {
    setCurrentLessonId(lessonId);
    setMobileSidebarOpen(false);
  };

  // Loading state
  if (courseLoading || enrollLoading) {
    return (
      <div className="min-h-screen bg-mn-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  // Not enrolled — redirect to course detail
  if (!isEnrolled && course) {
    return <Navigate to={`/education/courses/${slug}`} replace />;
  }

  if (!course || !user) {
    return <Navigate to="/education/courses" replace />;
  }

  const isCurrentCompleted = currentLessonId ? progressMap[currentLessonId]?.status === 'completed' : false;

  // Get module progress
  const getModuleProgress = (mod: CourseModule) => {
    const lessons = mod.course_lessons || [];
    const completed = lessons.filter(l => progressMap[l.id]?.status === 'completed').length;
    return { completed, total: lessons.length };
  };

  return (
    <div className="min-h-screen bg-mn-bg flex flex-col">
      <Helmet>
        <title>{course.title} | Socelle Learning</title>
      </Helmet>

      {/* ── Top bar ───────────────────────────────────────────────── */}
      <header className="h-14 bg-mn-card border-b border-graphite/5 flex items-center justify-between px-4 flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="lg:hidden p-1.5 rounded-lg text-graphite/50 hover:text-graphite hover:bg-mn-surface transition-colors"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Link to={`/education/courses/${slug}`} className="text-sm text-graphite/50 hover:text-accent transition-colors flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" /> Back to course
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-graphite/50">
            <span>{completedCount}/{allLessons.length} lessons</span>
            <div className="w-24 h-1.5 bg-graphite/10 rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
            </div>
            <span>{overallProgress}%</span>
          </div>
          {overallProgress === 100 && (
            <Link
              to="/education/certificates"
              className="text-xs text-accent hover:text-accent-hover flex items-center gap-1"
            >
              <Award className="w-3.5 h-3.5" /> Certificate
            </Link>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ─────────────────────────────────────────────── */}
        {/* Desktop */}
        <aside className={`hidden lg:flex flex-col bg-mn-card border-r border-graphite/5 transition-all duration-200 flex-shrink-0 ${
          sidebarOpen ? 'w-72' : 'w-0'
        }`}>
          {sidebarOpen && (
            <>
              <div className="p-4 border-b border-graphite/5">
                <h2 className="font-sans font-semibold text-sm text-graphite truncate">{course.title}</h2>
                <p className="text-xs text-graphite/50 mt-0.5">{overallProgress}% complete</p>
              </div>
              <nav className="flex-1 overflow-y-auto py-2">
                {course.course_modules?.map((mod, mi) => {
                  const isExpanded = expandedModules.has(mod.id);
                  const lessons = mod.course_lessons || [];
                  const modProgress = getModuleProgress(mod);
                  return (
                    <div key={mod.id}>
                      <button
                        onClick={() => toggleModule(mod.id)}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-mn-surface/50 transition-colors"
                      >
                        <div className="min-w-0">
                          <span className="text-[10px] text-graphite/40 font-medium">Module {mi + 1}</span>
                          <p className="text-xs font-semibold text-graphite truncate">{mod.title}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] text-graphite/40">{modProgress.completed}/{modProgress.total}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3 text-graphite/30" /> : <ChevronDown className="w-3 h-3 text-graphite/30" />}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="pb-1">
                          {lessons.map(lesson => {
                            const Icon = LESSON_TYPE_ICON[lesson.lesson_type] || FileText;
                            const isActive = currentLessonId === lesson.id;
                            const isDone = progressMap[lesson.id]?.status === 'completed';
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => selectLesson(lesson.id)}
                                className={`w-full flex items-center gap-2.5 px-6 py-2 text-left transition-colors ${
                                  isActive ? 'bg-accent/10 text-accent' : 'text-graphite/70 hover:bg-mn-surface/50'
                                }`}
                              >
                                {isDone ? (
                                  <CheckCircle className="w-3.5 h-3.5 text-signal-up flex-shrink-0" />
                                ) : isActive ? (
                                  <Icon className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                                ) : (
                                  <Circle className="w-3.5 h-3.5 text-graphite/20 flex-shrink-0" />
                                )}
                                <span className="text-xs truncate">{lesson.title}</span>
                                {lesson.duration_minutes != null && (
                                  <span className="text-[10px] text-graphite/30 ml-auto flex-shrink-0">{lesson.duration_minutes}m</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </>
          )}
        </aside>

        {/* Toggle sidebar button (desktop) */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex items-center justify-center w-5 bg-mn-surface/50 hover:bg-mn-surface border-r border-graphite/5 text-graphite/30 hover:text-graphite/50 transition-colors flex-shrink-0"
        >
          {sidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="absolute inset-0 bg-graphite/40" onClick={() => setMobileSidebarOpen(false)} />
            <aside className="relative w-72 bg-mn-card flex flex-col h-full shadow-xl">
              <div className="p-4 border-b border-graphite/5 flex items-center justify-between">
                <h2 className="font-sans font-semibold text-sm text-graphite truncate">{course.title}</h2>
                <button onClick={() => setMobileSidebarOpen(false)} className="p-1 text-graphite/40 hover:text-graphite">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto py-2">
                {course.course_modules?.map((mod, mi) => {
                  const isExpanded = expandedModules.has(mod.id);
                  const lessons = mod.course_lessons || [];
                  const modProgress = getModuleProgress(mod);
                  return (
                    <div key={mod.id}>
                      <button
                        onClick={() => toggleModule(mod.id)}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-mn-surface/50 transition-colors"
                      >
                        <div className="min-w-0">
                          <span className="text-[10px] text-graphite/40 font-medium">Module {mi + 1}</span>
                          <p className="text-xs font-semibold text-graphite truncate">{mod.title}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] text-graphite/40">{modProgress.completed}/{modProgress.total}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3 text-graphite/30" /> : <ChevronDown className="w-3 h-3 text-graphite/30" />}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="pb-1">
                          {lessons.map(lesson => {
                            const Icon = LESSON_TYPE_ICON[lesson.lesson_type] || FileText;
                            const isActive = currentLessonId === lesson.id;
                            const isDone = progressMap[lesson.id]?.status === 'completed';
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => selectLesson(lesson.id)}
                                className={`w-full flex items-center gap-2.5 px-6 py-2 text-left transition-colors ${
                                  isActive ? 'bg-accent/10 text-accent' : 'text-graphite/70 hover:bg-mn-surface/50'
                                }`}
                              >
                                {isDone ? (
                                  <CheckCircle className="w-3.5 h-3.5 text-signal-up flex-shrink-0" />
                                ) : isActive ? (
                                  <Icon className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                                ) : (
                                  <Circle className="w-3.5 h-3.5 text-graphite/20 flex-shrink-0" />
                                )}
                                <span className="text-xs truncate">{lesson.title}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* ── Main content ────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          {currentLesson ? (
            <div className="max-w-4xl mx-auto p-4 lg:p-8">
              {/* Lesson header */}
              <div className="mb-6">
                <p className="text-xs text-graphite/40 uppercase tracking-wider mb-1">
                  {currentLesson.lesson_type === 'video' ? 'Video Lesson' :
                   currentLesson.lesson_type === 'text' ? 'Reading' :
                   currentLesson.lesson_type === 'quiz' ? 'Quiz' :
                   currentLesson.lesson_type === 'scorm' ? 'Interactive Content' : 'Lesson'}
                </p>
                <h2 className="font-sans font-semibold text-xl text-graphite">{currentLesson.title}</h2>
              </div>

              {/* Video lesson */}
              {currentLesson.lesson_type === 'video' && currentLesson.video_url && (
                <div className="mb-6">
                  <video
                    ref={videoRef}
                    src={currentLesson.video_url}
                    controls
                    className="w-full rounded-xl bg-graphite"
                    onTimeUpdate={handleVideoProgress}
                    onEnded={handleVideoEnded}
                  />
                </div>
              )}

              {/* Text lesson */}
              {currentLesson.lesson_type === 'text' && currentLesson.content && (
                <div className="prose prose-sm max-w-none text-graphite/80 mb-6 bg-mn-card p-6 rounded-xl border border-graphite/5">
                  <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                </div>
              )}

              {/* Quiz lesson */}
              {currentLesson.lesson_type === 'quiz' && currentLesson.quiz_id && (
                <div className="mb-6">
                  <QuizPlayer
                    quizId={currentLesson.quiz_id}
                    onComplete={(passed) => {
                      if (passed && currentLessonId) {
                        void markComplete(currentLessonId);
                      }
                    }}
                  />
                </div>
              )}

              {/* SCORM lesson */}
              {currentLesson.lesson_type === 'scorm' && currentLesson.scorm_package_id && enrollment && (
                <div className="mb-6 bg-mn-card rounded-xl border border-graphite/5 overflow-hidden min-h-[500px]">
                  <ScormPlayer
                    scormPackageId={currentLesson.scorm_package_id}
                    enrollmentId={enrollment.id}
                    onComplete={() => {
                      if (currentLessonId) void markComplete(currentLessonId);
                    }}
                  />
                </div>
              )}

              {/* Mark complete + navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-graphite/5">
                <div>
                  {prevLesson && (
                    <button
                      onClick={() => selectLesson(prevLesson.id)}
                      className="flex items-center gap-2 text-sm text-graphite/60 hover:text-accent transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" /> {prevLesson.title}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {!isCurrentCompleted && currentLesson.lesson_type !== 'quiz' && (
                    <button
                      onClick={handleMarkComplete}
                      className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-accent border border-accent rounded-full hover:bg-accent/5 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" /> Mark Complete
                    </button>
                  )}
                  {nextLesson ? (
                    <button
                      onClick={() => selectLesson(nextLesson.id)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-mn-dark text-mn-bg text-sm font-semibold rounded-full hover:bg-graphite/80 transition-colors"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : overallProgress === 100 ? (
                    <Link
                      to="/education/certificates"
                      className="flex items-center gap-2 px-5 py-2.5 bg-signal-up text-white text-sm font-semibold rounded-full hover:bg-signal-up/90 transition-colors"
                    >
                      <Award className="w-4 h-4" /> View Certificate
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-graphite/40">Select a lesson to begin</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
