/**
 * useLessonProgress — track/update lesson progress
 * Data source: lesson_progress table (LIVE)
 * Migrated to TanStack Query v5 (V2-TECH-04).
 */
import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../supabase';
import { useAuth } from '../auth';

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  enrollment_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_pct: number;
  time_spent_seconds: number;
  completed_at: string | null;
  last_position: number | null;
}

export function useLessonProgress(enrollmentId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['lesson_progress', enrollmentId, user?.id];

  const { data: progressMap = {}, isLoading: loading, error: queryError } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('enrollment_id', enrollmentId!)
        .eq('user_id', user!.id);

      if (error) throw new Error(error.message);
      const map: Record<string, LessonProgress> = {};
      (data as LessonProgress[])?.forEach(p => { map[p.lesson_id] = p; });
      return map;
    },
    enabled: isSupabaseConfigured && !!enrollmentId && !!user?.id,
  });

  const markComplete = useCallback(async (lessonId: string) => {
    if (!enrollmentId || !user?.id || !isSupabaseConfigured) return;

    const existing = progressMap[lessonId];

    if (existing) {
      await supabase
        .from('lesson_progress')
        .update({ status: 'completed', progress_pct: 100, completed_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('lesson_progress')
        .insert({
          user_id: user.id,
          lesson_id: lessonId,
          enrollment_id: enrollmentId,
          status: 'completed',
          progress_pct: 100,
          time_spent_seconds: 0,
          completed_at: new Date().toISOString(),
        });
    }

    queryClient.invalidateQueries({ queryKey });
  }, [enrollmentId, user?.id, progressMap, queryClient, queryKey]);

  const updateProgress = useCallback(async (lessonId: string, pct: number, position?: number) => {
    if (!enrollmentId || !user?.id || !isSupabaseConfigured) return;

    const existing = progressMap[lessonId];
    const updates: Record<string, unknown> = {
      status: pct >= 100 ? 'completed' : 'in_progress',
      progress_pct: Math.min(pct, 100),
      ...(position !== undefined ? { last_position: position } : {}),
      ...(pct >= 100 ? { completed_at: new Date().toISOString() } : {}),
    };

    if (existing) {
      await supabase
        .from('lesson_progress')
        .update(updates)
        .eq('id', existing.id);
    } else {
      await supabase
        .from('lesson_progress')
        .insert({
          user_id: user.id,
          lesson_id: lessonId,
          enrollment_id: enrollmentId,
          time_spent_seconds: 0,
          ...updates,
        });
    }

    queryClient.invalidateQueries({ queryKey });
  }, [enrollmentId, user?.id, progressMap, queryClient, queryKey]);

  const error = queryError instanceof Error ? queryError.message : null;

  return { progressMap, loading, error, markComplete, updateProgress };
}
