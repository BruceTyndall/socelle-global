/**
 * CertificateVerify — /education/certificates/verify/:token
 * Public verification page (no auth required)
 * Calls verify-certificate edge function
 * Data: certificates table via edge function (LIVE)
 */
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  CheckCircle,
  XCircle,
  Award,
  Loader2,
  Calendar,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface VerifiedCertificate {
  valid: boolean;
  learner_name: string | null;
  course_title: string | null;
  issued_at: string | null;
  ce_credits: number | null;
}

export default function CertificateVerify() {
  const { token } = useParams<{ token: string }>();
  const [result, setResult] = useState<VerifiedCertificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        // Fallback: try direct table query
        setResult({ valid: false, learner_name: null, course_title: null, issued_at: null, ce_credits: null });
        setLoading(false);
        return;
      }

      try {
        // Try edge function first
        const { data, error: fnError } = await supabase.functions.invoke('verify-certificate', {
          body: { token },
        });

        if (cancelled) return;

        if (fnError) {
          // Fallback: direct table query
          const { data: cert, error: dbError } = await supabase
            .from('certificates')
            .select('learner_name, course_title, issued_at, ce_credits')
            .eq('verification_token', token)
            .maybeSingle();

          if (dbError || !cert) {
            setResult({ valid: false, learner_name: null, course_title: null, issued_at: null, ce_credits: null });
          } else {
            const c = cert as { learner_name: string | null; course_title: string | null; issued_at: string | null; ce_credits: number | null };
            setResult({ valid: true, learner_name: c.learner_name, course_title: c.course_title, issued_at: c.issued_at, ce_credits: c.ce_credits });
          }
        } else {
          setResult(data as VerifiedCertificate);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Verification failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    verify();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>Verify Certificate | Socelle Education</title>
        <meta name="description" content="Verify a Socelle professional education certificate." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <MainNav />

      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="section-container max-w-lg mx-auto text-center">
          {loading ? (
            <div className="py-20">
              <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-4" />
              <p className="text-graphite/60 text-sm">Verifying certificate...</p>
            </div>
          ) : error ? (
            <div className="py-20">
              <XCircle className="w-12 h-12 text-signal-down mx-auto mb-4" />
              <h1 className="text-2xl font-sans font-semibold text-graphite mb-2">Verification Error</h1>
              <p className="text-graphite/60 text-sm">{error}</p>
            </div>
          ) : result?.valid ? (
            <div className="bg-mn-card rounded-2xl border border-graphite/5 overflow-hidden">
              {/* Valid certificate */}
              <div className="p-8 bg-gradient-to-br from-signal-up/5 to-mn-surface">
                <CheckCircle className="w-14 h-14 text-signal-up mx-auto mb-4" />
                <h1 className="text-2xl font-sans font-semibold text-graphite mb-2">Certificate Verified</h1>
                <p className="text-graphite/60 text-sm">This is a valid Socelle professional education certificate.</p>
              </div>
              <div className="p-6 space-y-4">
                {result.learner_name && (
                  <div className="flex items-center gap-3 text-left">
                    <GraduationCap className="w-5 h-5 text-graphite/30 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-graphite/40 uppercase tracking-wider">Learner</p>
                      <p className="text-sm font-medium text-graphite">{result.learner_name}</p>
                    </div>
                  </div>
                )}
                {result.course_title && (
                  <div className="flex items-center gap-3 text-left">
                    <BookOpen className="w-5 h-5 text-graphite/30 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-graphite/40 uppercase tracking-wider">Course</p>
                      <p className="text-sm font-medium text-graphite">{result.course_title}</p>
                    </div>
                  </div>
                )}
                {result.issued_at && (
                  <div className="flex items-center gap-3 text-left">
                    <Calendar className="w-5 h-5 text-graphite/30 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-graphite/40 uppercase tracking-wider">Issued</p>
                      <p className="text-sm font-medium text-graphite">{new Date(result.issued_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                {result.ce_credits != null && result.ce_credits > 0 && (
                  <div className="flex items-center gap-3 text-left">
                    <Award className="w-5 h-5 text-graphite/30 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-graphite/40 uppercase tracking-wider">CE Credits</p>
                      <p className="text-sm font-medium text-graphite">{result.ce_credits}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-20">
              <XCircle className="w-14 h-14 text-signal-down mx-auto mb-4" />
              <h1 className="text-2xl font-sans font-semibold text-graphite mb-2">Invalid Certificate</h1>
              <p className="text-graphite/60 text-sm mb-6">
                This certificate could not be verified. It may be expired or the link may be incorrect.
              </p>
              <Link to="/education" className="btn-mineral-secondary">
                Back to Education
              </Link>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
