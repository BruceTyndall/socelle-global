import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, BarChart3, MousePointerClick, TrendingUp, DollarSign, AlertCircle, Loader2 } from 'lucide-react';
import { useCampaigns } from '../../lib/useCampaigns';
import { useCampaignMetrics } from '../../lib/useCampaignMetrics';
import type { MarketingCampaign } from '../../lib/useCampaigns';
import ErrorState from '../../components/ErrorState';

// ── WO-OVERHAUL-15: Campaign Detail (/marketing/campaigns/:id) ───────
// Data source: campaigns + campaign_metrics tables
// isLive flag drives DEMO badge.

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-graphite/10 text-graphite/60',
  scheduled: 'bg-accent/10 text-accent',
  active: 'bg-signal-up/10 text-signal-up',
  paused: 'bg-signal-warn/10 text-signal-warn',
  completed: 'bg-graphite/10 text-graphite/40',
  archived: 'bg-graphite/5 text-graphite/30',
};

function MetricCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) {
  return (
    <div className="bg-mn-card border border-graphite/8 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-graphite/40 font-sans">{label}</span>
        <Icon className="w-4 h-4 text-accent" />
      </div>
      <p className="text-2xl font-semibold text-graphite font-sans">{value}</p>
    </div>
  );
}

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const {
    campaigns,
    isLive: campaignsLive,
    loading: campaignsLoading,
    error: campaignsError,
    refetch: refetchCampaigns,
  } = useCampaigns();
  const {
    summary,
    metrics,
    isLive: metricsLive,
    loading: metricsLoading,
    error: metricsError,
  } = useCampaignMetrics(id);

  const campaign = campaigns.find((c: MarketingCampaign) => c.id === id);
  const isLive = campaignsLive && metricsLive;
  const loading = campaignsLoading || metricsLoading;
  const error = campaignsError ?? metricsError;

  return (
    <div className="min-h-screen bg-mn-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/marketing/campaigns" className="p-2 rounded-lg text-graphite/40 hover:text-graphite hover:bg-mn-surface transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-sans font-semibold text-graphite">
                {campaign?.name || 'Campaign Detail'}
              </h1>
              {campaign && (
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize font-sans ${STATUS_COLORS[campaign.status] || ''}`}>
                  {campaign.status}
                </span>
              )}
              {!isLive && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-signal-warn/10 text-signal-warn font-sans">
                  <AlertCircle className="w-3 h-3" />
                  DEMO
                </span>
              )}
            </div>
            {campaign && (
              <p className="text-sm text-graphite/50 font-sans mt-0.5">
                {campaign.type.replace('_', ' ').toUpperCase()} campaign
                {campaign.scheduled_at && ` \u00B7 Scheduled for ${new Date(campaign.scheduled_at).toLocaleDateString()}`}
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
          </div>
        ) : error ? (
          <ErrorState
            title="Campaign unavailable"
            message={error}
            onRetry={() => void refetchCampaigns()}
          />
        ) : !campaign ? (
          <div className="bg-mn-card border border-graphite/8 rounded-xl p-12 text-center">
            <p className="text-sm text-graphite/50 font-sans">Campaign not found.</p>
          </div>
        ) : (
          <>
            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <MetricCard label="Sends" value={summary?.totalSends.toLocaleString() ?? '0'} icon={Mail} />
              <MetricCard label="Opens" value={summary?.totalOpens.toLocaleString() ?? '0'} icon={BarChart3} />
              <MetricCard label="Clicks" value={summary?.totalClicks.toLocaleString() ?? '0'} icon={MousePointerClick} />
              <MetricCard label="Conversions" value={summary?.totalConversions.toLocaleString() ?? '0'} icon={TrendingUp} />
              <MetricCard label="Revenue" value={summary ? `$${summary.totalRevenue.toLocaleString()}` : '$0'} icon={DollarSign} />
            </div>

            {/* Campaign Info */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Details */}
              <div className="bg-mn-card border border-graphite/8 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-graphite font-sans mb-4">Campaign Details</h2>
                <div className="space-y-3">
                  {[
                    { label: 'Type', value: campaign.type.replace('_', ' ') },
                    { label: 'Subject', value: campaign.subject || '(none)' },
                    { label: 'Preview Text', value: campaign.preview_text || '(none)' },
                    { label: 'Created', value: new Date(campaign.created_at).toLocaleDateString() },
                    { label: 'Updated', value: new Date(campaign.updated_at).toLocaleDateString() },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-graphite/5 last:border-0">
                      <span className="text-xs text-graphite/40 font-sans">{row.label}</span>
                      <span className="text-sm text-graphite font-sans capitalize">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metrics Timeline */}
              <div className="bg-mn-card border border-graphite/8 rounded-xl p-5">
                <h2 className="text-sm font-semibold text-graphite font-sans mb-4">Open Rate Timeline</h2>
                {metrics.length === 0 ? (
                  <div className="py-8 text-center">
                    <BarChart3 className="w-8 h-8 text-graphite/15 mx-auto mb-2" />
                    <p className="text-xs text-graphite/40 font-sans">No metrics data available yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {metrics.map((m) => (
                      <div key={m.id} className="flex items-center gap-3">
                        <span className="text-xs text-graphite/40 font-sans w-20 flex-shrink-0">
                          {new Date(m.recorded_at).toLocaleDateString()}
                        </span>
                        <div className="flex-1 bg-graphite/5 rounded-full h-4 overflow-hidden">
                          <div
                            className="h-full bg-accent/60 rounded-full transition-all"
                            style={{ width: `${Math.min(m.open_rate * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-graphite font-sans w-12 text-right">
                          {(m.open_rate * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
