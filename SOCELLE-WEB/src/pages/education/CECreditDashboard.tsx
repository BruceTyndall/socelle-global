/**
 * CECreditDashboard — /education/ce-credits
 * CE credit tracking: credits by category, expiry warnings, compliance dashboard
 * Data: course_enrollments + certificates + courses (LIVE)
 */
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  GraduationCap,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Clock,
  Award,
  ExternalLink,
  Loader2,
  BookOpen,
} from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useCECredits, type CECreditEntry } from '../../lib/education/useCECredits';
import { useAuth } from '../../lib/auth';

const CATEGORY_LABELS: Record<string, string> = {
  treatment_protocols: 'Treatment Protocols',
  ingredient_science: 'Ingredient Science',
  business_operations: 'Business Operations',
  compliance_regulatory: 'Compliance & Regulatory',
  device_training: 'Device Training',
  retail_strategy: 'Retail Strategy',
  uncategorized: 'General',
};

const CATEGORY_COLORS: Record<string, string> = {
  treatment_protocols: 'bg-accent',
  ingredient_science: 'bg-signal-up',
  business_operations: 'bg-signal-warn',
  compliance_regulatory: 'bg-graphite/60',
  device_training: 'bg-accent-hover',
  retail_strategy: 'bg-signal-down',
  uncategorized: 'bg-graphite/30',
};

export default function CECreditDashboard() {
  const { user } = useAuth();
  const { summary, allCredits, loading, error, isLive } = useCECredits();

  const progressPct = summary.goal > 0
    ? Math.min((summary.totalEarned / summary.goal) * 100, 100)
    : 0;

  const remaining = Math.max(summary.goal - summary.totalEarned, 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-mn-bg font-sans">
        <MainNav />
        <div className="pt-40 text-center">
          <GraduationCap className="w-10 h-10 text-graphite/20 mx-auto mb-4" />
          <h1 className="text-2xl font-sans font-semibold text-graphite mb-2">Sign in to track CE credits</h1>
          <p className="text-graphite/60 mb-6">Track your continuing education progress and compliance.</p>
          <Link to="/portal/login" className="btn-mineral-primary">Sign In</Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>CE Credit Tracker | Socelle Education</title>
        <meta name="description" content="Track your continuing education credits, compliance status, and certificate expirations." />
      </Helmet>

      <MainNav />

      {/* Header */}
      <section className="pt-32 pb-8 lg:pt-40 lg:pb-12">
        <div className="section-container">
          <div className="flex items-center gap-2 text-sm text-graphite/50 mb-4">
            <Link to="/education" className="hover:text-accent transition-colors">Education</Link>
            <span>/</span>
            <span className="text-graphite/80">CE Credits</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-sans font-semibold text-3xl lg:text-4xl text-graphite mb-2">
                CE Credit Tracker
              </h1>
              <p className="text-graphite/60 font-sans">
                Track your continuing education progress and maintain compliance.
              </p>
            </div>
            {isLive && (
              <span className="text-[10px] font-semibold text-signal-up bg-signal-up/10 px-2 py-0.5 rounded-full">LIVE</span>
            )}
          </div>
        </div>
      </section>

      {!isLive && !loading && (
        <div className="bg-signal-warn/10 text-signal-warn text-xs font-medium px-4 py-2 text-center">
          PREVIEW — CE credit data will populate as you complete courses.
        </div>
      )}

      <section className="py-8 lg:py-12">
        <div className="section-container">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <AlertTriangle className="w-8 h-8 text-signal-warn mx-auto mb-3" />
              <p className="text-graphite/60 text-sm">{error}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Progress overview */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Main progress card */}
                <div className="lg:col-span-2 bg-mn-card rounded-2xl border border-graphite/5 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-sans font-semibold text-graphite">Current Period Progress</h2>
                    <div className="flex items-center gap-1.5 text-xs text-graphite/50">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(summary.periodStart).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      {' — '}
                      {new Date(summary.periodEnd).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </div>
                  </div>

                  <div className="flex items-end gap-4 mb-4">
                    <div>
                      <span className="text-5xl font-sans font-bold text-graphite">{summary.totalEarned}</span>
                      <span className="text-xl text-graphite/40 ml-1">/ {summary.goal}</span>
                    </div>
                    <span className="text-sm text-graphite/50 mb-2">credits earned</span>
                  </div>

                  {/* Progress bar */}
                  <div className="relative h-3 bg-graphite/10 rounded-full overflow-hidden mb-3">
                    <div
                      className="absolute inset-y-0 left-0 bg-accent rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-graphite/50">
                    <span>{progressPct.toFixed(0)}% complete</span>
                    <span>{remaining} credits remaining</span>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="space-y-4">
                  <div className="bg-mn-card rounded-xl border border-graphite/5 p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-2xl font-sans font-bold text-graphite">{summary.credits.length}</p>
                        <p className="text-xs text-graphite/50">Courses Completed</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-mn-card rounded-xl border border-graphite/5 p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-signal-up/10 flex items-center justify-center">
                        <Award className="w-5 h-5 text-signal-up" />
                      </div>
                      <div>
                        <p className="text-2xl font-sans font-bold text-graphite">{allCredits.length}</p>
                        <p className="text-xs text-graphite/50">Total Certificates</p>
                      </div>
                    </div>
                  </div>
                  {summary.expiringSoon.length > 0 && (
                    <div className="bg-signal-warn/5 rounded-xl border border-signal-warn/20 p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-signal-warn/10 flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-signal-warn" />
                        </div>
                        <div>
                          <p className="text-2xl font-sans font-bold text-signal-warn">{summary.expiringSoon.length}</p>
                          <p className="text-xs text-graphite/50">Expiring Soon</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Category breakdown */}
              {Object.keys(summary.byCategory).length > 0 && (
                <div className="bg-mn-card rounded-2xl border border-graphite/5 p-6">
                  <h2 className="font-sans font-semibold text-graphite mb-5">Credits by Category</h2>
                  <div className="space-y-4">
                    {Object.entries(summary.byCategory)
                      .sort(([, a], [, b]) => b - a)
                      .map(([cat, credits]) => {
                        const label = CATEGORY_LABELS[cat] ?? cat.replace(/_/g, ' ');
                        const barColor = CATEGORY_COLORS[cat] ?? 'bg-graphite/30';
                        const pct = summary.totalEarned > 0 ? (credits / summary.totalEarned) * 100 : 0;
                        return (
                          <div key={cat}>
                            <div className="flex items-center justify-between text-sm mb-1.5">
                              <span className="font-medium text-graphite capitalize">{label}</span>
                              <span className="text-graphite/50">{credits} credit{credits !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="h-2 bg-graphite/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${barColor} rounded-full transition-all duration-500`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Expiring soon warnings */}
              {summary.expiringSoon.length > 0 && (
                <div className="bg-signal-warn/5 rounded-2xl border border-signal-warn/20 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-signal-warn" />
                    <h2 className="font-sans font-semibold text-graphite">Expiring Within 90 Days</h2>
                  </div>
                  <div className="space-y-3">
                    {summary.expiringSoon.map(credit => (
                      <div key={credit.id} className="flex items-center justify-between bg-white rounded-xl p-4 border border-graphite/5">
                        <div>
                          <p className="text-sm font-medium text-graphite">{credit.course_title ?? 'Course'}</p>
                          <p className="text-xs text-graphite/50 mt-0.5">
                            {credit.ce_credits} CE credit{credit.ce_credits !== 1 ? 's' : ''} — Expires {credit.expires_at ? new Date(credit.expires_at).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-signal-warn font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          {credit.expires_at ? `${Math.ceil((new Date(credit.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days` : '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Credit history */}
              <div className="bg-mn-card rounded-2xl border border-graphite/5 overflow-hidden">
                <div className="px-6 py-4 border-b border-graphite/5">
                  <h2 className="font-sans font-semibold text-graphite">Credit History</h2>
                </div>
                {summary.credits.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-graphite/5 bg-mn-surface/50">
                          <th className="text-left px-6 py-3 text-xs font-semibold text-graphite/50 uppercase tracking-wider">Date</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-graphite/50 uppercase tracking-wider">Course</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-graphite/50 uppercase tracking-wider">Category</th>
                          <th className="text-right px-6 py-3 text-xs font-semibold text-graphite/50 uppercase tracking-wider">Credits</th>
                          <th className="text-center px-6 py-3 text-xs font-semibold text-graphite/50 uppercase tracking-wider">Expires</th>
                          <th className="text-center px-6 py-3 text-xs font-semibold text-graphite/50 uppercase tracking-wider">Certificate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-graphite/5">
                        {summary.credits.map((credit: CECreditEntry) => (
                          <tr key={credit.id} className="hover:bg-mn-surface/30 transition-colors">
                            <td className="px-6 py-3.5 text-graphite whitespace-nowrap">
                              {new Date(credit.earned_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-3.5 text-graphite font-medium">
                              {credit.course_title ?? '—'}
                            </td>
                            <td className="px-6 py-3.5 text-graphite/60 capitalize">
                              {(credit.category ?? 'general').replace(/_/g, ' ')}
                            </td>
                            <td className="px-6 py-3.5 text-graphite font-semibold text-right">
                              {credit.ce_credits}
                            </td>
                            <td className="px-6 py-3.5 text-center">
                              {credit.expires_at ? (
                                <span className={`text-xs ${
                                  new Date(credit.expires_at) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                                    ? 'text-signal-warn font-medium'
                                    : 'text-graphite/50'
                                }`}>
                                  {new Date(credit.expires_at).toLocaleDateString()}
                                </span>
                              ) : '—'}
                            </td>
                            <td className="px-6 py-3.5 text-center">
                              {credit.verification_token ? (
                                <Link
                                  to={`/education/certificates/verify/${credit.verification_token}`}
                                  className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-hover"
                                >
                                  <ExternalLink className="w-3 h-3" /> View
                                </Link>
                              ) : (
                                <span className="text-xs text-graphite/30">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <GraduationCap className="w-10 h-10 text-graphite/20 mx-auto mb-4" />
                    <p className="text-graphite/60 mb-2">No CE credits earned this period</p>
                    <Link to="/education/courses" className="text-sm text-accent hover:text-accent-hover">
                      Browse CE-eligible courses
                    </Link>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/education/courses" className="btn-mineral-primary">
                  <BookOpen className="w-4 h-4 mr-2 inline" /> Browse Courses
                </Link>
                <Link to="/education/certificates" className="btn-mineral-secondary">
                  <Award className="w-4 h-4 mr-2 inline" /> My Certificates
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
