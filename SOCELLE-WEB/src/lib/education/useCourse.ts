/**
 * useCourse — single course with modules and lessons
 * Data source: courses + course_modules + course_lessons (LIVE)
 */
import { useState, useEffect } from 'react';
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
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchCourse() {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        setCourse(null);
        setIsLive(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
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
          .eq('slug', slug)
          .single();

        if (cancelled) return;

        if (fetchError) {
          setError(fetchError.message);
          setCourse(null);
          setIsLive(false);
        } else {
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
          setCourse(sorted);
          setIsLive(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load course');
          setCourse(null);
          setIsLive(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchCourse();
    return () => { cancelled = true; };
  }, [slug]);

  return { course, loading, error, isLive };
}
