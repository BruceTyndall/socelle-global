/**
 * useLessonProgress — track/update lesson progress
 * Data source: lesson_progress table (LIVE)
 */
import { useState, useEffect, useCallback } from 'react';
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
  const [progressMap, setProgressMap] = useState<Record<string, LessonProgress>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enrollmentId || !user?.id || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetch() {
      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('lesson_progress')
          .select('*')
          .eq('enrollment_id', enrollmentId)
          .eq('user_id', user!.id);

        if (cancelled) return;

        if (fetchError) {
          setError(fetchError.message);
        } else {
          const map: Record<string, LessonProgress> = {};
          (data as LessonProgress[])?.forEach(p => { map[p.lesson_id] = p; });
          setProgressMap(map);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load progress');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [enrollmentId, user?.id]);

  const markComplete = useCallback(async (lessonId: string) => {
    if (!enrollmentId || !user?.id || !isSupabaseConfigured) return;

    const existing = progressMap[lessonId];

    if (existing) {
      const { data } = await supabase
        .from('lesson_progress')
        .update({ status: 'completed', progress_pct: 100, completed_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();

      if (data) {
        setProgressMap(prev => ({ ...prev, [lessonId]: data as LessonProgress }));
      }
    } else {
      const { data } = await supabase
        .from('lesson_progress')
        .insert({
          user_id: user.id,
          lesson_id: lessonId,
          enrollment_id: enrollmentId,
          status: 'completed',
          progress_pct: 100,
          time_spent_seconds: 0,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (data) {
        setProgressMap(prev => ({ ...prev, [lessonId]: data as LessonProgress }));
      }
    }
  }, [enrollmentId, user?.id, progressMap]);

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
      const { data } = await supabase
        .from('lesson_progress')
        .update(updates)
        .eq('id', existing.id)
        .select()
        .single();

      if (data) {
        setProgressMap(prev => ({ ...prev, [lessonId]: data as LessonProgress }));
      }
    } else {
      const { data } = await supabase
        .from('lesson_progress')
        .insert({
          user_id: user.id,
          lesson_id: lessonId,
          enrollment_id: enrollmentId,
          time_spent_seconds: 0,
          ...updates,
        })
        .select()
        .single();

      if (data) {
        setProgressMap(prev => ({ ...prev, [lessonId]: data as LessonProgress }));
      }
    }
  }, [enrollmentId, user?.id, progressMap]);

  return { progressMap, loading, error, markComplete, updateProgress };
}
