/**
 * useCourse — single course with modules and lessons
 * Data source: courses + course_modules + course_lessons (LIVE)
 * Migrated to TanStack Query v5 (V2-TECH-04).
 */
import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../supabase';

export interface CourseLesson {
  id: string;
  module_id: string;
  title: string;
  slug: string;
  lesson_type: 'video' | 'text' | 'quiz' | 'scorm';
  content: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  sort_order: number;
  is_preview: boolean;
  quiz_id: string | null;
  scorm_package_id: string | null;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  course_lessons: CourseLesson[];
}

export interface CourseDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  long_description: string | null;
  category: string | null;
  level: string | null;
  thumbnail_url: string | null;
  trailer_url: string | null;
  author_name: string | null;
  author_bio: string | null;
  author_avatar_url: string | null;
  duration_minutes: number | null;
  ce_credits: number | null;
  price_cents: number | null;
  is_free: boolean;
  is_featured: boolean;
  is_published: boolean;
  rating_avg: number | null;
  enrollment_count: number | null;
  prerequisites: string[] | null;
  learning_outcomes: string[] | null;
  created_at: string;
  updated_at: string;
  course_modules: CourseModule[];
}

export function useCourse(slug: string | undefined) {
  const { data: course = null, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['course_detail', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          course_modules (
            id, course_id, title, description, sort_order,
            course_lessons (
              id, module_id, title, slug, lesson_type, content, video_url,
              duration_minutes, sort_order, is_preview, quiz_id, scorm_package_id
            )
          )
        `)
        .eq('slug', slug!)
        .single();

      if (error) throw new Error(error.message);

      // Sort modules and lessons by sort_order
      const sorted = data as CourseDetail;
      if (sorted.course_modules) {
        sorted.course_modules.sort((a: CourseModule, b: CourseModule) => a.sort_order - b.sort_order);
        sorted.course_modules.forEach((m: CourseModule) => {
          if (m.course_lessons) {
            m.course_lessons.sort((a: CourseLesson, b: CourseLesson) => a.sort_order - b.sort_order);
          }
        });
      }
      return sorted;
    },
    enabled: isSupabaseConfigured && !!slug,
  });

  const isLive = course !== null;
  const error = queryError instanceof Error ? queryError.message : null;

  return { course, loading, error, isLive };
}
