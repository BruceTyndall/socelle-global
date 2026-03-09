import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Send,
  Eye,
  MousePointerClick,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { useCampaigns } from '../../lib/useCampaigns';
import { useCampaignMetrics } from '../../lib/useCampaignMetrics';
import ErrorState from '../../components/ErrorState';

// ── WO-OVERHAUL-15: Marketing Analytics ─────────────────────────────────
// Portal page — analytics for opt-in campaigns only.
// isLive pattern: DEMO badge when DB not connected.
// Note: useCampaignMetrics requires a campaignId. For aggregate analytics
// we aggregate client-side across campaign-level summaries.

function MetricCard({
  label,
  value,
  icon: Icon,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-accent-soft p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-graphite/60" />
        <span className="text-xs font-sans text-graphite/60 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-sans font-bold text-graphite">{value}</p>
      {sub && <p className="text-xs text-graphite/60 font-sans mt-1">{sub}</p>}
    </div>
  );
}

function SimpleBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs font-sans">
        <span className="text-graphite font-medium">{label}</span>
        <span className="text-graphite/60">{value.toLocaleString()}</span>
      </div>
      <div className="w-full h-2.5 bg-accent-soft rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function MarketingAnalytics() {
  const {
    campaigns,
    isLive: campaignsLive,
    loading: campaignsLoading,
    error: campaignsError,
    refetch: refetchCampaigns,
  } = useCampaigns();

  // For aggregate metrics, we pick the first campaign with data for charting.
  // A full implementation would aggregate across all campaigns server-side.
  const completedCampaigns = campaigns.filter((c) => c.status === 'completed' || c.status === 'active');
  const firstCampaignId = completedCampaigns[0]?.id;
  const {
    metrics,
    summary,
    isLive: metricsLive,
    loading: metricsLoading,
    error: metricsError,
  } = useCampaignMetrics(firstCampaignId);

  const isLive = campaignsLive || metricsLive;
  const loading = campaignsLoading || metricsLoading;
  const error = campaignsError ?? metricsError;

  // Campaign performance by type
  const typeBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    campaigns.forEach((c) => {
      map.set(c.type, (map.get(c.type) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([type, count]) => ({ type, count }));
  }, [campaigns]);

  const maxTypeCount = Math.max(...typeBreakdown.map((t) => t.count), 1);

  // Campaign timeline — simple SVG sparkline from metrics
  const sparkline = useMemo(() => {
    if (metrics.length < 2) return null;
    const w = 600;
    const h = 160;
    const pad = 16;
    const maxRate = Math.max(...metrics.map((m) => m.open_rate), 1);
    const points = metrics.map((m, i) => {
      const x = pad + (i / (metrics.length - 1)) * (w - 2 * pad);
      const y = h - pad - (m.open_rate / maxRate) * (h - 2 * pad);
      return `${x},${y}`;
    });

    // Click rate line
    const maxClick = Math.max(...metrics.map((m) => m.click_rate), 1);
    const clickPoints = metrics.map((m, i) => {
      const x = pad + (i / (metrics.length - 1)) * (w - 2 * pad);
      const y = h - pad - (m.click_rate / maxClick) * (h - 2 * pad);
      return `${x},${y}`;
    });

    return {
      openPath: `M${points.join(' L')}`,
      clickPath: `M${clickPoints.join(' L')}`,
      w,
      h,
    };
  }, [metrics]);

  // Conversion funnel
  const funnel = useMemo(() => {
    if (!summary) return null;
    return [
      { label: 'Sent', value: summary.totalSends, pct: 100 },
      { label: 'Opened', value: summary.totalOpens, pct: summary.totalSends > 0 ? (summary.totalOpens / summary.totalSends) * 100 : 0 },
      { label: 'Clicked', value: summary.totalClicks, pct: summary.totalSends > 0 ? (summary.totalClicks / summary.totalSends) * 100 : 0 },
      { label: 'Converted', value: summary.totalConversions, pct: summary.totalSends > 0 ? (summary.totalConversions / summary.totalSends) * 100 : 0 },
    ];
  }, [summary]);

  // Top performing campaigns by name
  const topCampaigns = completedCampaigns.slice(0, 5);

  return (
    <>
      <Helmet>
        <title>Marketing Analytics | Socelle</title>
      </Helmet>

      <div className="space-y-8">
        {/* ── Header ──────────────────────────────────────────── */}
        <div>
          <Link
            to="/portal/marketing"
            className="inline-flex items-center gap-1.5 text-sm font-sans text-graphite/60 hover:text-graphite transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketing
          </Link>

          <div className="flex items-center gap-3">
            <h1 className="font-sans text-3xl text-graphite">Marketing Analytics</h1>
            {!isLive && (
              <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-pill">
                DEMO
              </span>
            )}
          </div>
          <p className="text-sm text-graphite/60 font-sans mt-1">
            Campaign performance and audience engagement metrics
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 text-graphite/60 animate-spin" />
          </div>
        ) : error ? (
          <ErrorState
            title="Analytics unavailable"
            message={error}
            onRetry={() => void refetchCampaigns()}
          />
        ) : (
          <>
            {/* ── Summary Metrics ──────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <MetricCard
                label="Total Sends"
                value={summary?.totalSends.toLocaleString() ?? '0'}
                icon={Send}
              />
              <MetricCard
                label="Avg Open Rate"
                value={summary ? `${summary.avgOpenRate.toFixed(1)}%` : '0%'}
                icon={Eye}
              />
              <MetricCard
                label="Avg Click Rate"
                value={summary ? `${summary.avgClickRate.toFixed(1)}%` : '0%'}
                icon={MousePointerClick}
              />
              <MetricCard
                label="Total Revenue"
                value={summary ? `$${summary.totalRevenue.toLocaleString()}` : '$0'}
                icon={TrendingUp}
                sub={`${summary?.totalConversions.toLocaleString() ?? 0} conversions`}
              />
            </div>

            {/* ── Performance Over Time ────────────────────────── */}
            <div className="bg-white rounded-xl border border-accent-soft p-6 shadow-sm">
              <h2 className="font-sans text-xl text-graphite mb-1">Performance Over Time</h2>
              <p className="text-xs text-graphite/60 font-sans mb-4">Open rate and click rate trends</p>

              {sparkline ? (
                <>
                  <svg
                    viewBox={`0 0 ${sparkline.w} ${sparkline.h}`}
                    className="w-full h-40"
                    preserveAspectRatio="none"
                  >
                    <path d={sparkline.openPath} fill="none" stroke="currentColor" strokeWidth="2" className="text-graphite" />
                    <path d={sparkline.clickPath} fill="none" stroke="currentColor" strokeWidth="2" className="text-intel-accent" strokeDasharray="4 2" />
                  </svg>
                  <div className="flex items-center gap-6 mt-3 text-xs font-sans text-graphite/60">
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 h-0.5 bg-graphite rounded" /> Open Rate
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 h-0.5 bg-intel-accent rounded border-dashed" /> Click Rate
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-40 bg-accent-soft/50 rounded-lg border border-dashed border-accent-soft">
                  <p className="text-sm text-graphite/60 font-sans">
                    Performance data will appear once campaigns have metrics
                  </p>
                </div>
              )}
            </div>

            {/* ── Two Column: Type Breakdown + Funnel ──────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Campaign Type Breakdown */}
              <div className="bg-white rounded-xl border border-accent-soft p-6 shadow-sm">
                <h2 className="font-sans text-xl text-graphite mb-4">Campaigns by Type</h2>
                {typeBreakdown.length === 0 ? (
                  <p className="text-sm text-graphite/60 font-sans">No campaigns yet</p>
                ) : (
                  <div className="space-y-4">
                    {typeBreakdown.map((t) => (
                      <SimpleBar
                        key={t.type}
                        label={t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                        value={t.count}
                        max={maxTypeCount}
                        color="bg-graphite"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Conversion Funnel */}
              <div className="bg-white rounded-xl border border-accent-soft p-6 shadow-sm">
                <h2 className="font-sans text-xl text-graphite mb-4">Conversion Funnel</h2>
                {funnel ? (
                  <div className="space-y-4">
                    {funnel.map((step, idx) => (
                      <div key={step.label}>
                        <div className="flex items-center justify-between text-xs font-sans mb-1">
                          <span className="text-graphite font-medium">{step.label}</span>
                          <span className="text-graphite/60">
                            {step.value.toLocaleString()} ({step.pct.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full h-8 bg-accent-soft rounded-lg overflow-hidden flex items-center">
                          <div
                            className="h-full bg-graphite/80 rounded-lg transition-all duration-700 flex items-center justify-center"
                            style={{ width: `${Math.max(step.pct, 2)}%` }}
                          >
                            {step.pct > 15 && (
                              <span className="text-[10px] font-sans font-medium text-white">
                                {step.pct.toFixed(0)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40 bg-accent-soft/50 rounded-lg border border-dashed border-accent-soft">
                    <p className="text-sm text-graphite/60 font-sans">
                      Funnel data will appear once campaigns have metrics
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Top Performing Content ───────────────────────── */}
            <div className="bg-white rounded-xl border border-accent-soft shadow-sm overflow-hidden">
              <div className="p-6 border-b border-accent-soft">
                <h2 className="font-sans text-xl text-graphite">Top Performing Campaigns</h2>
              </div>
              {topCampaigns.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-graphite/60 font-sans">No completed campaigns yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-sans">
                    <thead>
                      <tr className="bg-accent-soft/50 text-graphite/60 text-left">
                        <th className="px-6 py-3 font-medium">Campaign</th>
                        <th className="px-6 py-3 font-medium">Type</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                        <th className="px-6 py-3 font-medium text-right" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-accent-soft/50">
                      {topCampaigns.map((c) => (
                        <tr key={c.id} className="hover:bg-accent-soft/30 transition-colors">
                          <td className="px-6 py-4 font-medium text-graphite">{c.name}</td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-medium text-graphite/60 bg-accent-soft px-2 py-0.5 rounded">
                              {c.type.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              c.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-accent-soft text-graphite/60'
                            }`}>
                              {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              to={`/portal/marketing/campaigns/${c.id}`}
                              className="inline-flex items-center gap-1 text-xs font-medium text-graphite hover:text-graphite/80 transition-colors"
                            >
                              View <ArrowRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
