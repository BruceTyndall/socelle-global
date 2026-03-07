/**
 * useEnrollment — enroll, get enrollment status, progress
 * Data source: course_enrollments table (LIVE)
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase';
import { useAuth } from '../auth';

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: 'active' | 'completed' | 'paused' | 'expired';
  progress_pct: number;
  enrolled_at: string;
  completed_at: string | null;
  last_accessed_at: string | null;
}

export function useEnrollment(courseId: string | undefined) {
  const { user } = useAuth();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const fetchEnrollment = useCallback(async () => {
    if (!courseId || !user?.id || !isSupabaseConfigured) {
      setEnrollment(null);
      setLoading(false);
      setIsLive(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('course_id', courseId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        setError(fetchError.message);
        setIsLive(false);
      } else {
        setEnrollment(data as Enrollment | null);
        setIsLive(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check enrollment');
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, [courseId, user?.id]);

  useEffect(() => {
    fetchEnrollment();
  }, [fetchEnrollment]);

  const enroll = useCallback(async () => {
    if (!courseId || !user?.id || !isSupabaseConfigured) return null;

    try {
      const { data, error: insertError } = await supabase
        .from('course_enrollments')
        .insert({
          course_id: courseId,
          user_id: user.id,
          status: 'active',
          progress_pct: 0,
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return null;
      }

      setEnrollment(data as Enrollment);
      return data as Enrollment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enroll');
      return null;
    }
  }, [courseId, user?.id]);

  const isEnrolled = !!enrollment;
  const isCompleted = enrollment?.status === 'completed';

  return { enrollment, isEnrolled, isCompleted, loading, error, isLive, enroll, refresh: fetchEnrollment };
}
