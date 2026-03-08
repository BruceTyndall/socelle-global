/**
 * MyCertificates — /education/certificates
 * Lists user's earned certificates with download and share
 * Data: certificates table (LIVE)
 */
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Award,
  Download,
  ExternalLink,
  GraduationCap,
} from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useCertificates } from '../../lib/education/useCertificates';

export default function MyCertificates() {
  const { certificates, loading, error, isLive } = useCertificates();

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>My Certificates | Socelle Education</title>
        <meta name="description" content="View and download your earned professional certificates and CE credits." />
      </Helmet>

      <MainNav />

      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16">
        <div className="section-container">
          <div className="flex items-center gap-2 text-sm text-graphite/50 mb-4">
            <Link to="/education" className="hover:text-accent transition-colors">Education</Link>
            <span>/</span>
            <span className="text-graphite/80">Certificates</span>
          </div>
          <h1 className="font-sans font-semibold text-3xl lg:text-4xl text-graphite mb-3">
            My Certificates
          </h1>
          <p className="text-graphite/60 font-sans">
            Your earned certificates and continuing education credits.
          </p>
        </div>
      </section>

      {!isLive && !loading && (
        <div className="bg-signal-warn/10 text-signal-warn text-xs font-medium px-4 py-2 text-center">
          PREVIEW — Certificate data is for demonstration purposes.
        </div>
      )}

      <section className="py-8 lg:py-12">
        <div className="section-container">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-mn-card rounded-2xl border border-graphite/5 overflow-hidden">
                  <div className="p-6 bg-mn-surface space-y-3">
                    <div className="w-12 h-12 bg-graphite/10 rounded-full mx-auto animate-pulse" />
                    <div className="h-4 w-32 bg-graphite/10 rounded mx-auto animate-pulse" />
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="h-3 w-full bg-graphite/10 rounded animate-pulse" />
                    <div className="h-3 w-2/3 bg-graphite/10 rounded animate-pulse" />
                    <div className="flex gap-2 pt-2">
                      <div className="flex-1 h-8 bg-graphite/10 rounded-lg animate-pulse" />
                      <div className="flex-1 h-8 bg-graphite/10 rounded-lg animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-graphite/60 text-sm">{error}</p>
            </div>
          ) : certificates.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map(cert => (
                <div key={cert.id} className="bg-mn-card rounded-2xl border border-graphite/5 overflow-hidden">
                  {/* Certificate visual */}
                  <div className="p-6 bg-gradient-to-br from-accent/5 to-mn-surface text-center">
                    <Award className="w-12 h-12 text-accent mx-auto mb-3" />
                    <h3 className="font-sans font-semibold text-graphite text-sm">
                      {cert.course_title || 'Professional Certificate'}
                    </h3>
                    {cert.learner_name && (
                      <p className="text-xs text-graphite/50 mt-1">Awarded to {cert.learner_name}</p>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs text-graphite/50">
                      <span>Issued</span>
                      <span className="font-medium text-graphite">{new Date(cert.issued_at).toLocaleDateString()}</span>
                    </div>
                    {cert.ce_credits != null && cert.ce_credits > 0 && (
                      <div className="flex items-center justify-between text-xs text-graphite/50">
                        <span>CE Credits</span>
                        <span className="font-medium text-graphite">{cert.ce_credits}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      {cert.pdf_url && (
                        <a
                          href={cert.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-accent border border-accent/30 rounded-lg hover:bg-accent/5 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </a>
                      )}
                      <Link
                        to={`/education/certificates/verify/${cert.verification_token}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-graphite/60 border border-graphite/10 rounded-lg hover:bg-mn-surface transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Share
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-accent-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-graphite mb-2">No certificates yet</h3>
              <p className="text-graphite/60 max-w-md mx-auto mb-6">Complete courses to earn certificates and CE credits.</p>
              <Link to="/education/courses" className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover text-sm">
                Browse Courses →
              </Link>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
