/**
 * useCourses — list courses with filters (category, level, free/paid, featured)
 * Data source: courses table (LIVE when DB connected)
 * Migrated to TanStack Query v5 (V2-TECH-04).
 */
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../supabase';

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CoursePricing = 'free' | 'paid' | 'all';
export type CourseSortKey = 'newest' | 'popular' | 'rating';

export interface CourseListItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  level: CourseLevel | null;
  thumbnail_url: string | null;
  author_name: string | null;
  duration_minutes: number | null;
  ce_credits: number | null;
  price_cents: number | null;
  is_free: boolean;
  is_featured: boolean;
  is_published: boolean;
  rating_avg: number | null;
  enrollment_count: number | null;
  created_at: string;
  updated_at: string;
}

interface UseCoursesOptions {
  category?: string;
  level?: CourseLevel | 'all';
  pricing?: CoursePricing;
  featured?: boolean;
  sort?: CourseSortKey;
  search?: string;
}

export function useCourses(options: UseCoursesOptions = {}) {
  const { data: courses = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ['courses', options],
    queryFn: async () => {
      let query = supabase
        .from('courses')
        .select('id, title, slug, description, category, level, thumbnail_url, author_name, duration_minutes, ce_credits, price_cents, is_free, is_featured, is_published, rating_avg, enrollment_count, created_at, updated_at')
        .eq('is_published', true);

      if (options.category && options.category !== 'all') {
        query = query.eq('category', options.category);
      }
      if (options.level && options.level !== 'all') {
        query = query.eq('level', options.level);
      }
      if (options.pricing === 'free') {
        query = query.eq('is_free', true);
      } else if (options.pricing === 'paid') {
        query = query.eq('is_free', false);
      }
      if (options.featured) {
        query = query.eq('is_featured', true);
      }
      if (options.search) {
        query = query.ilike('title', `%${options.search}%`);
      }

      switch (options.sort) {
        case 'popular':
          query = query.order('enrollment_count', { ascending: false, nullsFirst: false });
          break;
        case 'rating':
          query = query.order('rating_avg', { ascending: false, nullsFirst: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return (data as CourseListItem[]) || [];
    },
    enabled: isSupabaseConfigured,
  });

  const isLive = courses.length > 0;
  const error = queryError instanceof Error ? queryError.message : null;

  const categories = useMemo(() => {
    const cats = new Set(courses.map(c => c.category).filter(Boolean) as string[]);
    return ['all', ...Array.from(cats).sort()];
  }, [courses]);

  return { courses, loading, error, isLive, categories };
}
