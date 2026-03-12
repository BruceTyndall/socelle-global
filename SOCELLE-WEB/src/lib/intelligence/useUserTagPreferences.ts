import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth';
import { supabase, isSupabaseConfigured } from '../supabase';
import type { UserTagPreference } from './personalization';

export function useUserTagPreferences(limit = 40) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user_tag_preferences', user?.id ?? null, limit],
    queryFn: async (): Promise<UserTagPreference[]> => {
      if (!isSupabaseConfigured || !user?.id) return [];

      const { data, error } = await supabase
        .from('user_tag_preferences' as any)
        .select('tag_code, score')
        .eq('user_id', user.id)
        .gt('score', 0)
        .order('score', { ascending: false })
        .limit(limit);

      if (error) {
        const message = error.message.toLowerCase();
        if (
          error.code === '42P01' ||
          error.code === '42703' ||
          message.includes('user_tag_preferences') ||
          message.includes('does not exist')
        ) {
          console.warn('[useUserTagPreferences] preference table not available yet.');
          return [];
        }

        throw error;
      }

      return (data ?? []) as UserTagPreference[];
    },
    enabled: isSupabaseConfigured && !!user?.id,
    staleTime: 60_000,
  });
}
