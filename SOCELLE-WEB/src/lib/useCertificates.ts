/**
 * useCertificates — re-exports from education/useCertificates + adds verify hook
 * Data source: certificates + certificate_templates tables (LIVE)
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

export { useCertificates } from './education/useCertificates';
export type { Certificate } from './education/useCertificates';

/* ── Certificate template types ────────────────────────────────────── */

export interface CertificateTemplate {
  id: string;
  name: string;
  description: string | null;
  html_template: string | null;
  is_default: boolean;
  created_at: string;
}

/* ── useCertificateTemplates — admin listing ───────────────────────── */

export function useCertificateTemplates() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const fetch = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setTemplates([]);
      setIsLive(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('certificate_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        setIsLive(false);
      } else {
        setTemplates((data as CertificateTemplate[]) || []);
        setIsLive(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { templates, loading, error, isLive, refresh: fetch };
}

/* ── useVerifyCertificate — public verification by token ───────────── */

export interface VerifiedCertificate {
  id: string;
  course_title: string | null;
  learner_name: string | null;
  issued_at: string;
  ce_credits: number | null;
  verification_token: string;
  valid: boolean;
}

export function useVerifyCertificate(token: string | undefined) {
  const [certificate, setCertificate] = useState<VerifiedCertificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function verify() {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        setCertificate(null);
        setIsLive(false);
        setLoading(false);
        return;
      }

      try {
        // Try edge function first
        const { data: fnData, error: fnError } = await supabase.functions.invoke(
          'verify-certificate',
          { body: { token } },
        );

        if (cancelled) return;

        if (!fnError && fnData) {
          setCertificate({ ...(fnData as VerifiedCertificate), valid: true });
          setIsLive(true);
        } else {
          // Fallback: direct table lookup
          const { data, error: fetchError } = await supabase
            .from('certificates')
            .select('id, course_title, learner_name, issued_at, ce_credits, verification_token')
            .eq('verification_token', token)
            .maybeSingle();

          if (cancelled) return;

          if (fetchError) {
            setError(fetchError.message);
            setIsLive(false);
          } else if (data) {
            setCertificate({ ...(data as Omit<VerifiedCertificate, 'valid'>), valid: true });
            setIsLive(true);
          } else {
            setCertificate(null);
            setIsLive(true); // DB connected, cert just doesn't exist
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Verification failed');
          setIsLive(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    verify();
    return () => { cancelled = true; };
  }, [token]);

  return { certificate, loading, error, isLive };
}
