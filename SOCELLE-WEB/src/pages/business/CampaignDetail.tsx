import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Eye,
  MousePointerClick,
  TrendingUp,
  Loader2,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  BarChart3,
} from 'lucide-react';
import { useCampaigns } from '../../lib/useCampaigns';
import type { CampaignStatusType } from '../../lib/useCampaigns';
import { useCampaignMetrics } from '../../lib/useCampaignMetrics';

// ── WO-OVERHAUL-15: Campaign Detail ─────────────────────────────────────
// Portal page — opt-in campaigns only (ZERO cold email/outreach).
// isLive pattern: DEMO badge when DB not connected.

const STATUS_TRANSITIONS: Record<CampaignStatusType, CampaignStatusType[]> = {
  draft: ['scheduled'],
  scheduled: ['active', 'draft'],
  active: ['paused', 'completed'],
  paused: ['active', 'completed'],
  completed: ['archived'],
  archived: [],
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  draft: Clock,
  scheduled: Clock,
  active: Play,
  paused: Pause,
  completed: CheckCircle2,
  archived: CheckCircle2,
};

function statusColor(status: CampaignStatusType): string {
  const map: Record<CampaignStatusType, string> = {
    draft: 'bg-pro-stone/30 text-pro-charcoal',
    scheduled: 'bg-blue-50 text-blue-700',
    active: 'bg-green-50 text-green-700',
    paused: 'bg-amber-50 text-amber-700',
    completed: 'bg-pro-cream text-pro-warm-gray',
    archived: 'bg-pro-stone/20 text-pro-warm-gray',
  };
  return map[status] ?? 'bg-pro-stone/20 text-pro-warm-gray';
}

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
    <div className="bg-white rounded-xl border border-pro-stone p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-pro-warm-gray" />
        <span className="text-xs font-sans text-pro-warm-gray uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-serif font-bold text-pro-charcoal">{value}</p>
      {sub && <p className="text-xs text-pro-warm-gray font-sans mt-1">{sub}</p>}
    </div>
  );
}

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { campaigns, isLive: campaignsLive, loading: campaignsLoading, updateCampaign } = useCampaigns();
  const { metrics, summary, isLive: metricsLive, loading: metricsLoading } = useCampaignMetrics(id);

  const campaign = useMemo(() => campaigns.find((c) => c.id === id), [campaigns, id]);
  const isLive = campaignsLive && metricsLive;
  const loading = campaignsLoading || metricsLoading;

  const handleStatusChange = async (newStatus: CampaignStatusType) => {
    if (!id) return;
    await updateCampaign(id, { status: newStatus });
  };

  // Simple SVG line chart for open rate over time
  const chartPoints = useMemo(() => {
    if (metrics.length < 2) return null;
    const maxRate = Math.max(...metrics.map((m) => m.open_rate), 1);
    const w = 600;
    const h = 200;
    const padding = 20;
    const points = metrics.map((m, i) => {
      const x = padding + (i / (metrics.length - 1)) * (w - 2 * padding);
      const y = h - padding - (m.open_rate / maxRate) * (h - 2 * padding);
      return `${x},${y}`;
    });
    return { path: `M${points.join(' L')}`, w, h, maxRate };
  }, [metrics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 text-pro-warm-gray animate-spin" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-24">
        <p className="text-sm text-pro-warm-gray font-sans mb-4">Campaign not found</p>
        <Link to="/portal/marketing" className="text-sm font-sans font-medium text-pro-navy hover:text-pro-navy/80">
          Back to Marketing
        </Link>
      </div>
    );
  }

  const transitions = STATUS_TRANSITIONS[campaign.status] ?? [];

  return (
    <>
      <Helmet>
        <title>{campaign.name} | Marketing | Socelle</title>
      </Helmet>

      <div className="space-y-8">
        {/* ── Back + Header ───────────────────────────────────── */}
        <div>
          <Link
            to="/portal/marketing"
            className="inline-flex items-center gap-1.5 text-sm font-sans text-pro-warm-gray hover:text-pro-charcoal transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketing
          </Link>

          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-serif text-3xl text-pro-charcoal">{campaign.name}</h1>
                {!isLive && (
                  <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-pill">
                    DEMO
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(campaign.status)}`}>
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </span>
                <span className="text-xs font-medium text-pro-warm-gray bg-pro-cream px-2 py-0.5 rounded">
                  {campaign.type.toUpperCase()}
                </span>
                {campaign.scheduled_at && (
                  <span className="text-xs text-pro-warm-gray font-sans">
                    Scheduled: {new Date(campaign.scheduled_at).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Status controls */}
            {transitions.length > 0 && (
              <div className="flex items-center gap-2">
                {transitions.map((t) => {
                  const Icon = STATUS_ICONS[t] ?? Play;
                  return (
                    <button
                      key={t}
                      onClick={() => handleStatusChange(t)}
                      className="inline-flex items-center gap-2 h-9 px-4 rounded-full border border-pro-stone text-sm font-sans font-medium text-pro-charcoal hover:bg-pro-cream transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Metrics Cards ───────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard
            label="Sends"
            value={summary?.totalSends.toLocaleString() ?? '0'}
            icon={Send}
          />
          <MetricCard
            label="Open Rate"
            value={summary ? `${summary.avgOpenRate.toFixed(1)}%` : '0%'}
            icon={Eye}
            sub={`${summary?.totalOpens.toLocaleString() ?? 0} opens`}
          />
          <MetricCard
            label="Click Rate"
            value={summary ? `${summary.avgClickRate.toFixed(1)}%` : '0%'}
            icon={MousePointerClick}
            sub={`${summary?.totalClicks.toLocaleString() ?? 0} clicks`}
          />
          <MetricCard
            label="Conversions"
            value={summary?.totalConversions.toLocaleString() ?? '0'}
            icon={TrendingUp}
            sub={summary ? `$${summary.totalRevenue.toLocaleString()} revenue` : undefined}
          />
        </div>

        {/* ── Open Rate Chart ─────────────────────────────────── */}
        {chartPoints && (
          <div className="bg-white rounded-xl border border-pro-stone p-6 shadow-sm">
            <h2 className="font-serif text-xl text-pro-charcoal mb-4">Open Rate Over Time</h2>
            <svg
              viewBox={`0 0 ${chartPoints.w} ${chartPoints.h}`}
              className="w-full h-48"
              preserveAspectRatio="none"
            >
              <path
                d={chartPoints.path}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-pro-navy"
              />
            </svg>
            <div className="flex justify-between mt-2 text-xs text-pro-warm-gray font-sans">
              <span>{metrics.length > 0 ? new Date(metrics[0].recorded_at).toLocaleDateString() : ''}</span>
              <span>{metrics.length > 0 ? new Date(metrics[metrics.length - 1].recorded_at).toLocaleDateString() : ''}</span>
            </div>
          </div>
        )}

        {/* ── Click Heatmap Placeholder ───────────────────────── */}
        <div className="bg-white rounded-xl border border-pro-stone p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-pro-navy" />
            <h2 className="font-serif text-xl text-pro-charcoal">Click Heatmap</h2>
          </div>
          <div className="flex items-center justify-center h-48 bg-pro-cream/50 rounded-lg border border-dashed border-pro-stone">
            <p className="text-sm text-pro-warm-gray font-sans">
              Click heatmap will be available once the campaign has sufficient click data
            </p>
          </div>
        </div>

        {/* ── Content Preview ─────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-pro-stone p-6 shadow-sm">
          <h2 className="font-serif text-xl text-pro-charcoal mb-4">Content Preview</h2>
          {campaign.subject && (
            <div className="mb-3">
              <span className="text-xs font-sans text-pro-warm-gray uppercase tracking-wider">Subject</span>
              <p className="text-sm font-sans text-pro-charcoal font-medium mt-1">{campaign.subject}</p>
            </div>
          )}
          {campaign.preview_text && (
            <div className="mb-3">
              <span className="text-xs font-sans text-pro-warm-gray uppercase tracking-wider">Preview Text</span>
              <p className="text-sm font-sans text-pro-charcoal mt-1">{campaign.preview_text}</p>
            </div>
          )}
          {campaign.body && (
            <div className="mt-4 p-4 bg-pro-cream/50 rounded-lg border border-pro-stone">
              <pre className="text-xs font-mono text-pro-charcoal whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(campaign.body, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
