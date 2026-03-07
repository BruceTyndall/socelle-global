/**
 * useCourses — re-exports from education/useCourses + education/useCourse
 * Data source: courses, course_modules, course_lessons tables (LIVE when DB connected)
 */
export { useCourses } from './education/useCourses';
export type { CourseListItem, CourseLevel, CoursePricing, CourseSortKey } from './education/useCourses';
export { useCourse } from './education/useCourse';
export type { CourseDetail, CourseModule, CourseLesson } from './education/useCourse';
