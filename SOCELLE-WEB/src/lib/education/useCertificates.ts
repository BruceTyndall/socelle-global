/**
 * useCertificates — list user certificates
 * Data source: certificates table (LIVE)
 * Migrated to TanStack Query v5 (V2-TECH-04).
 */
import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../supabase';
import { useAuth } from '../auth';

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  course_title: string | null;
  learner_name: string | null;
  issued_at: string;
  ce_credits: number | null;
  verification_token: string;
  pdf_url: string | null;
  template_id: string | null;
}

export function useCertificates() {
  const { user } = useAuth();

  const { data: certificates = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ['certificates', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user!.id)
        .order('issued_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data as Certificate[]) ?? [];
    },
    enabled: isSupabaseConfigured && !!user?.id,
  });

  const isLive = certificates.length > 0;
  const error = queryError instanceof Error ? queryError.message : null;

  return { certificates, loading, error, isLive };
}
