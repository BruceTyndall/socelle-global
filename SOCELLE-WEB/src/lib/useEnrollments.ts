/**
 * useEnrollments — re-exports from education/useEnrollment + education/useLessonProgress
 * Data source: course_enrollments + lesson_progress tables (LIVE)
 */
export { useEnrollment } from './education/useEnrollment';
export type { Enrollment } from './education/useEnrollment';
export { useLessonProgress } from './education/useLessonProgress';
export type { LessonProgress } from './education/useLessonProgress';
