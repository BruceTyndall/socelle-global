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
  Beaker,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { useToast } from '../../components/Toast';
import { getCEProgress, getProtocols } from '../../lib/protocols/mockProtocols';
import { CATEGORY_LABELS } from '../../lib/protocols/useProtocols';
import type { ProtocolCategory } from '../../lib/protocols/types';

// ── Category colors for breakdown ───────────────────────────────────

const CAT_COLORS: Record<string, string> = {
  facial: 'bg-rose-400',
  body: 'bg-amber-400',
  wellness: 'bg-emerald-400',
  clinical: 'bg-blue-400',
  oncology: 'bg-violet-400',
  education: 'bg-purple-400',
};

// ── Mock credit source names (for table) ────────────────────────────

const CREDIT_SOURCES: Record<string, { title: string; type: 'protocol' | 'education' }> = {
  'proto-001': { title: 'Signature Brightening Facial', type: 'protocol' },
  'proto-002': { title: 'Advanced Chemical Peel Protocol', type: 'protocol' },
  'proto-004': { title: 'LED Light Therapy Add-On', type: 'protocol' },
  'proto-006': { title: 'Express Enzyme Renewal', type: 'protocol' },
  'proto-008': { title: 'Post-Procedure Recovery', type: 'protocol' },
  'edu-003': { title: 'Retinoid Delivery Systems Masterclass', type: 'education' },
  'edu-007': { title: 'MoCRA Compliance for Spas', type: 'education' },
};

export default function CECredits() {
  const { addToast } = useToast();
  const progress = getCEProgress();
  const protocols = getProtocols();

  const progressPercent = Math.min((progress.totalEarned / progress.goal) * 100, 100);

  // Category breakdown from earned credits
  const categoryBreakdown: Record<string, number> = {};
  progress.credits.forEach((c) => {
    if (c.protocolId) {
      const proto = protocols.find((p) => p.id === c.protocolId);
      const cat = proto?.category ?? 'other';
      categoryBreakdown[cat] = (categoryBreakdown[cat] ?? 0) + c.creditsEarned;
    } else if (c.contentId) {
      categoryBreakdown['education'] = (categoryBreakdown['education'] ?? 0) + c.creditsEarned;
    }
  });

  const handleDownloadCertificate = (creditId: string) => {
    const credit = progress.credits.find((c) => c.id === creditId);
    if (!credit) {
      addToast('Certificate record not found', 'error');
      return;
    }

    const protocol = credit.protocolId
      ? protocols.find((p) => p.id === credit.protocolId)
      : null;
    const title = protocol?.title ?? credit.contentId ?? 'Continuing Education';
    const completedAt = credit.earnedAt
      ? new Date(credit.earnedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

    const certificateText = [
      'SOCELLE Continuing Education Certificate',
      '',
      `Credit ID: ${credit.id}`,
      `Course: ${title}`,
      `Credits Earned: ${credit.creditsEarned}`,
      `Completed: ${completedAt}`,
    ].join('\n');

    const blob = new Blob([certificateText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `socelle-ce-certificate-${credit.id}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    addToast('Certificate downloaded', 'success');
  };

  // Upcoming CE opportunities
  const upcomingProtocols = protocols
    .filter((p) => p.ceEligible && !progress.credits.some((c) => c.protocolId === p.id))
    .slice(0, 4);

  return (
    <div>
      <Helmet>
        <title>CE Credits | Socelle</title>
        <meta name="description" content="Track your continuing education credits, download certificates, and discover new CE-eligible protocols and courses." />
      </Helmet>

      {/* ── Page Header ───────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="w-5 h-5 text-pro-gold" />
          <span className="text-sm font-sans font-semibold text-pro-gold uppercase tracking-wide">
            Continuing Education
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="font-serif text-2xl text-pro-charcoal">
            CE Credit Tracker
          </h1>
          <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-pill">Demo Data</span>
        </div>
        <p className="text-sm font-sans text-pro-warm-gray mt-1">
          Track your progress toward your renewal period CE requirements.
        </p>
      </div>

      {/* ── Progress Overview ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main progress card */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-pro-stone p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg text-pro-charcoal">
              Current Period Progress
            </h2>
            <div className="flex items-center gap-1.5 text-xs font-sans text-pro-warm-gray">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(progress.periodStart).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              {' — '}
              {new Date(progress.periodEnd).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
          </div>

          <div className="flex items-end gap-4 mb-4">
            <div>
              <span className="text-4xl font-serif text-pro-charcoal">{progress.totalEarned}</span>
              <span className="text-lg font-sans text-pro-warm-gray ml-1">/ {progress.goal}</span>
            </div>
            <span className="text-sm font-sans text-pro-warm-gray mb-1">credits earned</span>
          </div>

          {/* Progress bar */}
          <div className="relative h-4 bg-pro-cream rounded-full overflow-hidden mb-3">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-pro-gold to-pro-gold-light rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs font-sans text-pro-warm-gray">
            <span>{progressPercent.toFixed(0)}% complete</span>
            <span>{progress.goal - progress.totalEarned} credits remaining</span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-pro-stone p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pro-gold/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-pro-gold" />
              </div>
              <div>
                <p className="text-2xl font-serif text-pro-charcoal">{progress.credits.length}</p>
                <p className="text-xs font-sans text-pro-warm-gray">Credits Earned</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-pro-stone p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-serif text-pro-charcoal">
                  {progress.credits.filter((c) => c.protocolId).length}
                </p>
                <p className="text-xs font-sans text-pro-warm-gray">Protocols Completed</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-pro-stone p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-serif text-pro-charcoal">
                  {progress.credits.filter((c) => c.contentId).length}
                </p>
                <p className="text-xs font-sans text-pro-warm-gray">Courses Completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Category Breakdown ────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-pro-stone p-6 mb-8">
        <h2 className="font-serif text-lg text-pro-charcoal mb-4">Credits by Category</h2>
        <div className="space-y-3">
          {Object.entries(categoryBreakdown)
            .sort(([, a], [, b]) => b - a)
            .map(([cat, credits]) => {
              const label = cat === 'education' ? 'Education Courses' : CATEGORY_LABELS[cat as ProtocolCategory] ?? cat;
              const barColor = CAT_COLORS[cat] ?? 'bg-gray-400';
              const pct = (credits / progress.totalEarned) * 100;
              return (
                <div key={cat}>
                  <div className="flex items-center justify-between text-sm font-sans mb-1">
                    <span className="text-pro-charcoal font-medium">{label}</span>
                    <span className="text-pro-warm-gray">{credits} credits</span>
                  </div>
                  <div className="h-2 bg-pro-cream rounded-full overflow-hidden">
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

      {/* ── Credit History Table ──────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-pro-stone overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-pro-stone">
          <h2 className="font-serif text-lg text-pro-charcoal">Credit History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-pro-cream/50">
                <th className="text-left text-xs font-sans font-semibold text-pro-warm-gray uppercase tracking-wide px-6 py-3">
                  Date
                </th>
                <th className="text-left text-xs font-sans font-semibold text-pro-warm-gray uppercase tracking-wide px-6 py-3">
                  Source
                </th>
                <th className="text-left text-xs font-sans font-semibold text-pro-warm-gray uppercase tracking-wide px-6 py-3">
                  Type
                </th>
                <th className="text-right text-xs font-sans font-semibold text-pro-warm-gray uppercase tracking-wide px-6 py-3">
                  Credits
                </th>
                <th className="text-center text-xs font-sans font-semibold text-pro-warm-gray uppercase tracking-wide px-6 py-3">
                  Status
                </th>
                <th className="text-center text-xs font-sans font-semibold text-pro-warm-gray uppercase tracking-wide px-6 py-3">
                  Certificate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pro-stone/60">
              {[...progress.credits].reverse().map((credit) => {
                const sourceKey = credit.protocolId ?? credit.contentId ?? '';
                const source = CREDIT_SOURCES[sourceKey];
                return (
                  <tr key={credit.id} className="hover:bg-pro-cream/30 transition-colors">
                    <td className="px-6 py-3.5 text-sm font-sans text-pro-charcoal whitespace-nowrap">
                      {new Date(credit.earnedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-3.5 text-sm font-sans text-pro-charcoal font-medium">
                      {source?.title ?? 'Unknown Source'}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-sans font-medium rounded-full px-2.5 py-1 ${
                          source?.type === 'protocol'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-purple-50 text-purple-700'
                        }`}
                      >
                        {source?.type === 'protocol' ? (
                          <Beaker className="w-3 h-3" />
                        ) : (
                          <BookOpen className="w-3 h-3" />
                        )}
                        {source?.type === 'protocol' ? 'Protocol' : 'Education'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-sm font-sans text-pro-charcoal font-semibold text-right">
                      {credit.creditsEarned}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-sans font-medium text-emerald-700 bg-emerald-50 rounded-full px-2.5 py-1">
                        <CheckCircle className="w-3 h-3" />
                        Completed
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <button
                        onClick={() => handleDownloadCertificate(credit.id)}
                        className="inline-flex items-center gap-1 text-xs font-sans font-medium text-pro-navy hover:text-pro-gold transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Upcoming CE Opportunities ─────────────────────────────── */}
      {upcomingProtocols.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg text-pro-charcoal">
              Upcoming CE Opportunities
            </h2>
            <Link
              to="/protocols"
              className="text-sm font-sans font-medium text-pro-navy hover:text-pro-gold transition-colors flex items-center gap-1"
            >
              View All Protocols
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {upcomingProtocols.map((proto) => (
              <Link
                key={proto.id}
                to={`/protocols/${proto.slug}`}
                className="group bg-white rounded-xl border border-pro-stone p-5 hover:shadow-elevated hover:border-pro-gold/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-pro-gold/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-pro-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-sans text-sm font-semibold text-pro-charcoal group-hover:text-pro-navy transition-colors truncate">
                      {proto.title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5 text-xs font-sans text-pro-warm-gray">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {proto.durationMinutes} min
                      </span>
                      <span className="flex items-center gap-1 text-pro-gold font-medium">
                        <GraduationCap className="w-3 h-3" />
                        {proto.ceCredits} CE
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-pro-warm-gray/50 group-hover:text-pro-gold transition-colors flex-shrink-0 mt-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Period Info ────────────────────────────────────────────── */}
      <div className="bg-pro-cream/50 rounded-xl border border-pro-stone p-6 text-center">
        <Calendar className="w-6 h-6 text-pro-warm-gray mx-auto mb-2" />
        <p className="text-sm font-sans text-pro-warm-gray">
          Current renewal period:{' '}
          <span className="font-medium text-pro-charcoal">
            {new Date(progress.periodStart).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          {' — '}
          <span className="font-medium text-pro-charcoal">
            {new Date(progress.periodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </p>
        <p className="text-xs font-sans text-pro-warm-gray/70 mt-1">
          CE requirements vary by state and license type. Consult your state board for specific requirements.
        </p>
      </div>
    </div>
  );
}
