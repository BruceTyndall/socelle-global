/**
 * MyCertificates — User's earned certificates grid (requires auth)
 * Data source: certificates table (LIVE)
 * Route: /my-certificates (ProtectedRoute)
 */
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Award,
  Download,
  ExternalLink,
  BookOpen,
  ArrowLeft,
} from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useCertificates } from '../../lib/useCertificates';

export default function MyCertificates() {
  const { certificates, loading, error, isLive } = useCertificates();

  return (
    <>
      <Helmet>
        <title>My Certificates | Socelle</title>
        <meta name="description" content="View and download your earned professional education certificates on Socelle." />
        <meta property="og:title" content="My Certificates | Socelle" />
        <meta property="og:description" content="View and download your earned professional education certificates." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <MainNav />

      <main className="min-h-screen bg-mn-bg pt-20">
        <section className="max-w-5xl mx-auto px-4 py-12">
          <Link to="/courses" className="flex items-center gap-2 text-sm text-graphite/50 hover:text-graphite mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to courses
          </Link>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-sans font-semibold text-graphite mb-1">My Certificates</h1>
              <p className="text-sm text-graphite/50">Your earned professional education certificates</p>
            </div>
            {!isLive && !loading && (
              <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">
                DEMO
              </span>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 mb-6">
              {error}
            </div>
          )}

          {loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-graphite/8 p-6 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-graphite/5 mb-4" />
                  <div className="h-4 bg-graphite/10 rounded-full w-3/4 mb-3" />
                  <div className="h-3 bg-graphite/10 rounded-full w-1/2" />
                </div>
              ))}
            </div>
          )}

          {!loading && certificates.length === 0 && (
            <div className="text-center py-20">
              <Award className="w-16 h-16 text-graphite/15 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-graphite mb-2">No certificates yet</h2>
              <p className="text-sm text-graphite/50 mb-6">
                Complete a course to earn your first certificate.
              </p>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 h-10 px-6 bg-mn-dark text-white text-sm font-semibold rounded-full hover:bg-graphite transition-colors"
              >
                <BookOpen className="w-4 h-4" /> Browse Courses
              </Link>
            </div>
          )}

          {!loading && certificates.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map(cert => (
                <div
                  key={cert.id}
                  className="bg-white rounded-2xl border border-graphite/8 p-6 hover:shadow-lg transition-all"
                >
                  <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                    <Award className="w-7 h-7 text-accent" />
                  </div>

                  <h3 className="text-base font-semibold text-graphite mb-1 line-clamp-2">
                    {cert.course_title || 'Course Certificate'}
                  </h3>

                  {cert.learner_name && (
                    <p className="text-sm text-graphite/60 mb-2">{cert.learner_name}</p>
                  )}

                  <p className="text-xs text-graphite/40 mb-4">
                    Issued{' '}
                    {new Date(cert.issued_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>

                  {cert.ce_credits != null && cert.ce_credits > 0 && (
                    <p className="text-xs text-accent font-semibold mb-4 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      {cert.ce_credits} CE credits
                    </p>
                  )}

                  <div className="flex gap-2">
                    {cert.pdf_url && (
                      <a
                        href={cert.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-graphite border border-graphite/10 rounded-full hover:bg-graphite/2 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF
                      </a>
                    )}
                    <Link
                      to={`/certificates/verify/${cert.verification_token}`}
                      className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-accent border border-accent/20 rounded-full hover:bg-accent/5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Verify
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
