/**
 * CertificateVerify — Public certificate verification (no auth needed)
 * Data source: certificates table via verify-certificate edge function (LIVE)
 * Route: /certificates/verify/:token
 */
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Award, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useVerifyCertificate } from '../../lib/useCertificates';

export default function CertificateVerify() {
  const { token } = useParams<{ token: string }>();
  const { certificate, loading, error, isLive } = useVerifyCertificate(token);

  return (
    <>
      <Helmet>
        <title>Verify Certificate | Socelle</title>
        <meta name="description" content="Verify the authenticity of a Socelle professional education certificate." />
      </Helmet>

      <MainNav />

      <main className="min-h-screen bg-mn-bg pt-20 flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <Link to="/" className="flex items-center gap-2 text-sm text-graphite/50 hover:text-graphite mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Socelle
          </Link>

          {loading && (
            <div className="bg-white rounded-2xl border border-graphite/8 p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-graphite/5 mx-auto mb-4 animate-pulse" />
              <div className="h-4 bg-graphite/10 rounded-full w-1/2 mx-auto animate-pulse mb-3" />
              <div className="h-3 bg-graphite/10 rounded-full w-1/3 mx-auto animate-pulse" />
            </div>
          )}

          {!loading && error && (
            <div className="bg-white rounded-2xl border border-red-200 p-10 text-center">
              <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-xl font-sans font-semibold text-graphite mb-2">Verification Error</h1>
              <p className="text-sm text-graphite/60">{error}</p>
            </div>
          )}

          {!loading && !error && !certificate && (
            <div className="bg-white rounded-2xl border border-red-200 p-10 text-center">
              <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h1 className="text-xl font-sans font-semibold text-graphite mb-2">Certificate Not Found</h1>
              <p className="text-sm text-graphite/60 mb-6">
                This verification token does not match any certificate in our records.
              </p>
              <p className="text-xs text-graphite/40">
                If you believe this is an error, please contact support.
              </p>
            </div>
          )}

          {!loading && !error && certificate && (
            <div className="bg-white rounded-2xl border border-green-200 p-10 text-center">
              <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>

              <p className="font-mono text-[0.65rem] tracking-[0.2em] uppercase text-green-600 mb-2">
                Verified Certificate
              </p>
              <h1 className="text-xl font-sans font-semibold text-graphite mb-6">
                This certificate is authentic
              </h1>

              <div className="space-y-4 text-left bg-mn-bg rounded-xl p-6">
                {certificate.learner_name && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-graphite/40 mb-1">Recipient</p>
                    <p className="text-sm font-semibold text-graphite">{certificate.learner_name}</p>
                  </div>
                )}
                {certificate.course_title && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-graphite/40 mb-1">Course</p>
                    <p className="text-sm font-semibold text-graphite">{certificate.course_title}</p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-graphite/40 mb-1">Issued</p>
                  <p className="text-sm text-graphite">
                    {new Date(certificate.issued_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                {certificate.ce_credits != null && certificate.ce_credits > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-graphite/40 mb-1">CE Credits</p>
                    <p className="text-sm text-graphite flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-accent" /> {certificate.ce_credits} credits
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-graphite/40 mb-1">Verification ID</p>
                  <p className="text-xs font-mono text-graphite/50 break-all">{certificate.verification_token}</p>
                </div>
              </div>

              {!isLive && (
                <span className="mt-4 inline-block text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">
                  DEMO
                </span>
              )}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
