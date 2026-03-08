/**
 * useCertificates — re-exports from education/useCertificates + adds verify hook
 * Data source: certificates + certificate_templates tables (LIVE)
 * Migrated to TanStack Query v5 (V2-TECH-04).
 */
import { useQuery } from '@tanstack/react-query';
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
  const { data: templates = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ['certificate_templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certificate_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return (data as CertificateTemplate[]) ?? [];
    },
    enabled: isSupabaseConfigured,
  });

  const isLive = templates.length > 0;
  const error = queryError instanceof Error ? queryError.message : null;

  return { templates, loading, error, isLive, refresh: () => {} };
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
  const { data, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['verify_certificate', token],
    queryFn: async () => {
      if (!isSupabaseConfigured) return { certificate: null as VerifiedCertificate | null, isLive: false };

      try {
        // Try edge function first
        const { data: fnData, error: fnError } = await supabase.functions.invoke(
          'verify-certificate',
          { body: { token } },
        );

        if (!fnError && fnData) {
          return {
            certificate: { ...(fnData as VerifiedCertificate), valid: true },
            isLive: true,
          };
        }
      } catch {
        // Fall through to direct table lookup
      }

      // Fallback: direct table lookup
      const { data: row, error: fetchError } = await supabase
        .from('certificates')
        .select('id, course_title, learner_name, issued_at, ce_credits, verification_token')
        .eq('verification_token', token!)
        .maybeSingle();

      if (fetchError) throw new Error(fetchError.message);

      if (row) {
        return {
          certificate: { ...(row as Omit<VerifiedCertificate, 'valid'>), valid: true },
          isLive: true,
        };
      }

      return { certificate: null as VerifiedCertificate | null, isLive: true };
    },
    enabled: !!token,
  });

  const certificate = data?.certificate ?? null;
  const isLive = data?.isLive ?? false;
  const error = queryError instanceof Error ? queryError.message : null;

  return { certificate, loading, error, isLive };
}
