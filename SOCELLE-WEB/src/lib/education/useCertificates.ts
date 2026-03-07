/**
 * useCertificates — list user certificates
 * Data source: certificates table (LIVE)
 */
import { useState, useEffect } from 'react';
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
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!user?.id || !isSupabaseConfigured) {
      setCertificates([]);
      setLoading(false);
      setIsLive(false);
      return;
    }

    let cancelled = false;

    async function fetch() {
      setLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from('certificates')
          .select('*')
          .eq('user_id', user!.id)
          .order('issued_at', { ascending: false });

        if (cancelled) return;

        if (fetchError) {
          setError(fetchError.message);
          setIsLive(false);
        } else {
          setCertificates((data as Certificate[]) || []);
          setIsLive(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load certificates');
          setIsLive(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [user?.id]);

  return { certificates, loading, error, isLive };
}
