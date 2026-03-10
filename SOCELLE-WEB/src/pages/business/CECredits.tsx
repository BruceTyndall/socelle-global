/**
 * CECredits — /portal/ce-credits
 * EDU-WO-05: Wire CE credit tracking to live certificates + course_enrollments tables
 * Data: useCECredits hook (TanStack Query v5) — replaces mockProtocols
 */
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  GraduationCap,
  Download,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  BookOpen,
  AlertTriangle,
  ExternalLink,
  Award,
  RotateCcw,
} from 'lucide-react';
import { useToast } from '../../components/Toast';
import { useCECredits, type CECreditEntry } from '../../lib/education/useCECredits';
import { exportToCSV } from '../../lib/csvExport';

// ── Category colors for breakdown ─────────────────────────────────────

const CAT_COLORS: Record<string, string> = {
  treatment_protocols: 'bg-accent',
  ingredient_science: 'bg-signal-up',
  business_operations: 'bg-signal-warn',
  compliance_regulatory: 'bg-graphite/60',
  device_training: 'bg-accent-hover',
  retail_strategy: 'bg-signal-down',
  uncategorized: 'bg-graphite/30',
  education: 'bg-purple-400',
};

const CAT_LABELS: Record<string, string> = {
  treatment_protocols: 'Treatment Protocols',
  ingredient_science: 'Ingredient Science',
  business_operations: 'Business Operations',
  compliance_regulatory: 'Compliance & Regulatory',
  device_training: 'Device Training',
  retail_strategy: 'Retail Strategy',
  uncategorized: 'General',
  education: 'Education',
};

export default function CECredits() {
  const { addToast } = useToast();
  const { summary, allCredits, loading, error, isLive } = useCECredits();

  const progressPercent = summary.goal > 0
    ? Math.min((summary.totalEarned / summary.goal) * 100, 100)
    : 0;

  const handleExportCSV = () => {
    if (summary.credits.length === 0) {
      addToast('No credits to export', 'error');
      return;
    }
    exportToCSV(
      summary.credits.map((c: CECreditEntry) => ({
        date: new Date(c.earned_at).toLocaleDateString(),
        course: c.course_title ?? '—',
        category: (c.category ?? 'general').replace(/_/g, ' '),
        credits: c.ce_credits,
        expires: c.expires_at ? new Date(c.expires_at).toLocaleDateString() : '—',
      })),
      'socelle_ce_credits',
      [
        { key: 'date', label: 'Date Earned' },
        { key: 'course', label: 'Course' },
        { key: 'category', label: 'Category' },
        { key: 'credits', label: 'Credits' },
        { key: 'expires', label: 'Expiry Date' },
      ]
    );
    addToast('CE credits exported', 'success');
  };

  // ── Loading state: skeleton shimmer ─────────────────────────────────
  if (loading) {
    return (
      <div aria-busy="true" aria-label="Loading CE credits">
        <Helmet>
          <title>CE Credits | Socelle Portal</title>
        </Helmet>
        <div className="mb-8">
          <div className="h-4 w-24 bg-graphite/10 rounded animate-pulse mb-2" />
          <div className="h-7 w-48 bg-graphite/10 rounded animate-pulse mb-2" />
          <div className="h-3.5 w-72 bg-graphite/8 rounded animate-pulse" />
        </div>
        {/* KPI strip skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-xl border border-accent-soft p-6 space-y-4">
            <div className="h-4 w-40 bg-graphite/10 rounded animate-pulse" />
            <div className="h-10 w-28 bg-graphite/10 rounded animate-pulse" />
            <div className="h-3 bg-graphite/10 rounded-full animate-pulse" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-accent-soft p-5">
                <div className="h-3 w-20 bg-graphite/10 rounded animate-pulse mb-3" />
                <div className="h-8 w-12 bg-graphite/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        {/* Category breakdown skeleton */}
        <div className="bg-white rounded-xl border border-accent-soft p-6 mb-8 space-y-4">
          <div className="h-4 w-32 bg-graphite/10 rounded animate-pulse" />
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-28 bg-graphite/10 rounded animate-pulse" />
              <div className="h-2 bg-graphite/10 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
        {/* Table skeleton */}
        <div className="bg-white rounded-xl border border-accent-soft overflow-hidden">
          <div className="px-6 py-4 border-b border-accent-soft">
            <div className="h-4 w-28 bg-graphite/10 rounded animate-pulse" />
          </div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="px-6 py-3.5 border-b border-accent-soft/60">
              <div className="h-4 bg-graphite/8 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────
  if (error) {
    return (
      <div>
        <Helmet>
          <title>CE Credits | Socelle Portal</title>
        </Helmet>
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-signal-warn/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-signal-warn" />
          </div>
          <h3 className="text-base font-semibold text-graphite mb-2">Could not load CE credits</h3>
          <p className="text-graphite/60 text-sm mb-5">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-graphite text-mn-bg text-sm font-semibold rounded-full hover:bg-graphite/80 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Helmet>
        <title>CE Credits | Socelle Portal</title>
        <meta name="description" content="Track your continuing education credits, download certificates, and discover new CE-eligible protocols and courses." />
      </Helmet>

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="w-5 h-5 text-accent" />
          <span className="text-sm font-sans font-semibold text-accent uppercase tracking-wide">
            Continuing Education
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="font-sans text-2xl text-graphite">
            CE Credit Tracker
          </h1>
          {isLive ? (
            <span className="text-[10px] font-semibold bg-signal-up/10 text-signal-up px-2 py-0.5 rounded-full">LIVE</span>
          ) : (
            <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">No data yet</span>
          )}
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm font-sans text-graphite/60">
            Track your progress toward your renewal period CE requirements.
          </p>
          {summary.credits.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent border border-accent/30 rounded-lg hover:bg-accent/5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          )}
        </div>
      </div>

      {/* ── Empty state ─────────────────────────────────────────────── */}
      {!loading && !error && summary.credits.length === 0 && (
        <div className="text-center py-20 mb-8">
          <div className="w-20 h-20 bg-accent-soft rounded-3xl flex items-center justify-center mx-auto mb-5">
            <GraduationCap className="w-10 h-10 text-accent" />
          </div>
          <h3 className="text-lg font-semibold text-graphite mb-2">No CE credits earned yet</h3>
          <p className="text-graphite/60 max-w-md mx-auto mb-6 text-sm">
            Complete CE-eligible courses to start tracking your credits and compliance progress.
          </p>
          <Link
            to="/education/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-graphite text-mn-bg text-sm font-semibold rounded-full hover:bg-graphite/80 transition-colors"
          >
            Browse CE-eligible courses <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* ── Progress Overview ────────────────────────────────────────── */}
      {summary.credits.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main progress card */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-accent-soft p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-sans text-lg text-graphite">
                Current Period Progress
              </h2>
              <div className="flex items-center gap-1.5 text-xs font-sans text-graphite/60">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(summary.periodStart).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                {' — '}
                {new Date(summary.periodEnd).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            </div>

            <div className="flex items-end gap-4 mb-4">
              <div>
                <span className="text-4xl font-sans text-graphite">{summary.totalEarned}</span>
                <span className="text-lg font-sans text-graphite/60 ml-1">/ {summary.goal}</span>
              </div>
              <span className="text-sm font-sans text-graphite/60 mb-1">credits earned</span>
            </div>

            {/* Progress bar */}
            <div className="relative h-4 bg-accent-soft rounded-full overflow-hidden mb-3">
              <div
                className="absolute inset-y-0 left-0 bg-accent rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-sans text-graphite/60">
              <span>{progressPercent.toFixed(0)}% complete</span>
              <span>{Math.max(summary.goal - summary.totalEarned, 0)} credits remaining</span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-accent-soft p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-sans text-graphite">{summary.credits.length}</p>
                  <p className="text-xs font-sans text-graphite/60">Courses Completed</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-accent-soft p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-signal-up/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-signal-up" />
                </div>
                <div>
                  <p className="text-2xl font-sans text-graphite">{allCredits.length}</p>
                  <p className="text-xs font-sans text-graphite/60">Total Certificates</p>
                </div>
              </div>
            </div>
            {summary.expiringSoon.length > 0 && (
              <div className="bg-signal-warn/5 rounded-xl border border-signal-warn/20 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-signal-warn/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-signal-warn" />
                  </div>
                  <div>
                    <p className="text-2xl font-sans text-signal-warn">{summary.expiringSoon.length}</p>
                    <p className="text-xs font-sans text-graphite/60">Expiring Soon</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Category Breakdown ───────────────────────────────────────── */}
      {Object.keys(summary.byCategory).length > 0 && (
        <div className="bg-white rounded-xl border border-accent-soft p-6 mb-8">
          <h2 className="font-sans text-lg text-graphite mb-4">Credits by Category</h2>
          <div className="space-y-3">
            {Object.entries(summary.byCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, credits]) => {
                const label = CAT_LABELS[cat] ?? cat.replace(/_/g, ' ');
                const barColor = CAT_COLORS[cat] ?? 'bg-graphite/30';
                const pct = summary.totalEarned > 0 ? (credits / summary.totalEarned) * 100 : 0;
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between text-sm font-sans mb-1">
                      <span className="text-graphite font-medium capitalize">{label}</span>
                      <span className="text-graphite/60">{credits} credit{credits !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="h-2 bg-accent-soft rounded-full overflow-hidden">
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

      {/* ── Expiring soon warnings ───────────────────────────────────── */}
      {summary.expiringSoon.length > 0 && (
        <div className="bg-signal-warn/5 rounded-xl border border-signal-warn/20 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-signal-warn" />
            <h2 className="font-sans text-lg text-graphite">Expiring Within 90 Days</h2>
          </div>
          <div className="space-y-3">
            {summary.expiringSoon.map(credit => (
              <div key={credit.id} className="flex items-center justify-between bg-white rounded-xl p-4 border border-graphite/5">
                <div>
                  <p className="text-sm font-medium text-graphite">{credit.course_title ?? 'Course'}</p>
                  <p className="text-xs text-graphite/50 mt-0.5">
                    {credit.ce_credits} CE credit{credit.ce_credits !== 1 ? 's' : ''} — Expires{' '}
                    {credit.expires_at ? new Date(credit.expires_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-signal-warn font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {credit.expires_at
                    ? `${Math.ceil((new Date(credit.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days`
                    : '—'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Credit History Table ─────────────────────────────────────── */}
      {summary.credits.length > 0 && (
        <div className="bg-white rounded-xl border border-accent-soft overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-accent-soft flex items-center justify-between">
            <h2 className="font-sans text-lg text-graphite">Credit History</h2>
            <span className="text-xs text-graphite/50">{summary.credits.length} record{summary.credits.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-accent-soft/50">
                  <th className="text-left text-xs font-sans font-semibold text-graphite/60 uppercase tracking-wide px-6 py-3">Date</th>
                  <th className="text-left text-xs font-sans font-semibold text-graphite/60 uppercase tracking-wide px-6 py-3">Course</th>
                  <th className="text-left text-xs font-sans font-semibold text-graphite/60 uppercase tracking-wide px-6 py-3">Category</th>
                  <th className="text-right text-xs font-sans font-semibold text-graphite/60 uppercase tracking-wide px-6 py-3">Credits</th>
                  <th className="text-center text-xs font-sans font-semibold text-graphite/60 uppercase tracking-wide px-6 py-3">Expires</th>
                  <th className="text-center text-xs font-sans font-semibold text-graphite/60 uppercase tracking-wide px-6 py-3">Status</th>
                  <th className="text-center text-xs font-sans font-semibold text-graphite/60 uppercase tracking-wide px-6 py-3">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-accent-soft/60">
                {[...summary.credits].reverse().map((credit: CECreditEntry) => (
                  <tr key={credit.id} className="hover:bg-accent-soft/30 transition-colors">
                    <td className="px-6 py-3.5 text-sm font-sans text-graphite whitespace-nowrap">
                      {new Date(credit.earned_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-3.5 text-sm font-sans text-graphite font-medium">
                      {credit.course_title ?? '—'}
                    </td>
                    <td className="px-6 py-3.5 text-sm font-sans text-graphite/60 capitalize">
                      {(credit.category ?? 'general').replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-3.5 text-sm font-sans text-graphite font-semibold text-right">
                      {credit.ce_credits}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      {credit.expires_at ? (
                        <span className={`text-xs font-sans ${
                          new Date(credit.expires_at) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                            ? 'text-signal-warn font-medium'
                            : 'text-graphite/50'
                        }`}>
                          {new Date(credit.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      ) : (
                        <span className="text-graphite/30 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-sans font-medium text-signal-up bg-signal-up/10 rounded-full px-2.5 py-1">
                        <CheckCircle className="w-3 h-3" />
                        Completed
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      {credit.verification_token ? (
                        <Link
                          to={`/education/certificates/verify/${credit.verification_token}`}
                          className="inline-flex items-center gap-1 text-xs font-sans font-medium text-accent hover:text-accent-hover transition-colors"
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
        </div>
      )}

      {/* ── Discover more CE opportunities ───────────────────────────── */}
      <div className="bg-accent-soft/50 rounded-xl border border-accent-soft p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-accent" />
              <h2 className="font-sans text-sm font-semibold text-graphite">Discover More CE Courses</h2>
            </div>
            <p className="text-xs font-sans text-graphite/60">
              Browse CE-eligible protocols and courses to continue building your credits.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/education/courses"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-graphite text-mn-bg rounded-lg hover:bg-graphite/80 transition-colors"
            >
              Browse Courses <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
        <p className="text-xs font-sans text-graphite/50 mt-4">
          CE requirements vary by state and license type. Consult your state board for specific renewal requirements.
        </p>
      </div>

      {/* ── Period Info ──────────────────────────────────────────────── */}
      <div className="mt-6 text-center">
        <Calendar className="w-5 h-5 text-graphite/40 mx-auto mb-1" />
        <p className="text-xs font-sans text-graphite/50">
          Tracking period:{' '}
          <span className="font-medium text-graphite/70">
            {new Date(summary.periodStart).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          {' — '}
          <span className="font-medium text-graphite/70">
            {new Date(summary.periodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </p>
      </div>
    </div>
  );
}
