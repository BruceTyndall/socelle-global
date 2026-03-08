/**
 * useEnrollment — enroll, get enrollment status, progress
 * Data source: course_enrollments table (LIVE)
 * Migrated to TanStack Query v5 (V2-TECH-04).
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const queryKey = ['enrollment', courseId, user?.id];

  const { data: enrollment = null, isLoading: loading, error: queryError, refetch: refresh } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('course_id', courseId!)
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw new Error(error.message);
      return (data as Enrollment | null) ?? null;
    },
    enabled: isSupabaseConfigured && !!courseId && !!user?.id,
  });

  const enrollMut = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('course_enrollments')
        .insert({
          course_id: courseId!,
          user_id: user!.id,
          status: 'active',
          progress_pct: 0,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as Enrollment;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); },
  });

  const enroll = async () => {
    if (!courseId || !user?.id || !isSupabaseConfigured) return null;
    try {
      return await enrollMut.mutateAsync();
    } catch {
      return null;
    }
  };

  const isLive = !loading && !queryError;
  const isEnrolled = !!enrollment;
  const isCompleted = enrollment?.status === 'completed';
  const error = queryError instanceof Error ? queryError.message
    : enrollMut.error instanceof Error ? enrollMut.error.message
    : null;

  return { enrollment, isEnrolled, isCompleted, loading, error, isLive, enroll, refresh };
}
