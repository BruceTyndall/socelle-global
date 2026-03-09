import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Send,
  Users,
  FileText,
  Megaphone,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { useMarketingCampaigns } from '../../../lib/marketing/useMarketingCampaigns';
import { useAudienceSegments } from '../../../lib/useAudienceSegments';
import { useContentTemplates } from '../../../lib/useContentTemplates';

// ── V2-HUBS-08: Marketing Dashboard ────────────────────────────────
// KPI strip + recent campaigns + quick actions.
// Pearl Mineral V2 tokens. 3 states: skeleton, empty, error.
// ZERO cold email — all campaigns opt-in only.

/* ── Skeleton Shimmer ─────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-graphite/8 p-6 animate-pulse">
      <div className="h-3 w-24 bg-graphite/8 rounded mb-4" />
      <div className="h-8 w-16 bg-graphite/8 rounded" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-6 py-4 animate-pulse">
      <div className="h-4 w-48 bg-graphite/8 rounded" />
      <div className="h-4 w-20 bg-graphite/8 rounded ml-auto" />
    </div>
  );
}

/* ── KPI Card ─────────────────────────────────────────────────────── */
function KpiCard({
  label,
  value,
  icon: Icon,
  demo,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  demo?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-graphite/8 p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center">
          <Icon className="w-5 h-5 text-accent" />
        </div>
        <span className="text-sm font-sans text-graphite/60">{label}</span>
        {demo && (
          <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full ml-auto">
            DEMO
          </span>
        )}
      </div>
      <p className="text-3xl font-sans font-bold text-graphite">{value}</p>
    </div>
  );
}

export default function MarketingDashboard() {
  const {
    campaigns,
    isLive: campaignsLive,
    isLoading: campaignsLoading,
    error: campaignsError,
    refetch: refetchCampaigns,
  } = useMarketingCampaigns();
  const { segments, isLive: segmentsLive, loading: segmentsLoading } = useAudienceSegments();
  const { templates, isLive: templatesLive, loading: templatesLoading } = useContentTemplates();

  const isLive = campaignsLive || segmentsLive || templatesLive;
  const loading = campaignsLoading || segmentsLoading || templatesLoading;

  const activeCampaigns = campaigns.filter((c) => c.status === 'active');
  const recentCampaigns = campaigns.slice(0, 5);

  return (
    <>
      <Helmet>
        <title>Marketing | Socelle</title>
      </Helmet>

      <div className="space-y-8">
        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-sans font-semibold text-graphite">Marketing</h1>
              {!isLive && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-signal-warn/10 text-signal-warn font-sans">
                  <AlertCircle className="w-3 h-3" />
                  DEMO
                </span>
              )}
            </div>
            <p className="text-sm text-graphite/60 font-sans mt-1">
              Manage opt-in campaigns for your consented contacts
            </p>
          </div>
          <Link
            to="/portal/marketing/campaigns/new"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-accent text-white text-sm font-sans font-medium hover:bg-accent-hover transition-colors"
          >
            <Megaphone className="w-4 h-4" />
            New Campaign
          </Link>
        </div>

        {/* ── Error State ─────────────────────────────────────── */}
        {campaignsError && (
          <div className="bg-signal-down/5 border border-signal-down/20 rounded-xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-signal-down" />
              <div>
                <p className="text-sm font-sans font-medium text-graphite">Failed to load campaigns</p>
                <p className="text-xs text-graphite/50 font-sans mt-0.5">{campaignsError}</p>
              </div>
            </div>
            <button
              onClick={() => refetchCampaigns()}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-full border border-graphite/10 text-sm font-sans font-medium text-graphite hover:bg-graphite/5 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {/* ── KPI Strip ───────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard
              label="Active Campaigns"
              value={activeCampaigns.length}
              icon={Send}
            />
            <KpiCard
              label="Total Reach"
              value="--"
              icon={Megaphone}
              demo
            />
            <KpiCard
              label="Segments"
              value={segments.length}
              icon={Users}
            />
            <KpiCard
              label="Templates"
              value={templates.length}
              icon={FileText}
            />
          </div>
        )}

        {/* ── Quick Actions ───────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { to: '/portal/marketing/campaigns/new', icon: Megaphone, label: 'New Campaign' },
            { to: '/portal/marketing/segments', icon: Users, label: 'View Segments' },
            { to: '/portal/marketing/templates', icon: FileText, label: 'Browse Templates' },
          ].map((nav) => (
            <Link
              key={nav.to}
              to={nav.to}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-graphite/8 hover:border-accent/30 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-accent-soft flex items-center justify-center">
                <nav.icon className="w-4 h-4 text-accent" />
              </div>
              <span className="text-sm font-sans font-medium text-graphite">{nav.label}</span>
              <ArrowRight className="w-4 h-4 text-graphite/30 ml-auto" />
            </Link>
          ))}
        </div>

        {/* ── Recent Campaigns ────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-graphite/8 overflow-hidden">
          <div className="p-6 border-b border-graphite/8 flex items-center justify-between">
            <h2 className="text-lg font-sans font-semibold text-graphite">Recent Campaigns</h2>
            {campaigns.length > 5 && (
              <Link
                to="/portal/marketing/campaigns"
                className="text-xs font-sans font-medium text-accent hover:text-accent-hover transition-colors"
              >
                View all
              </Link>
            )}
          </div>

          {loading ? (
            <div className="divide-y divide-graphite/5">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : recentCampaigns.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Megaphone className="w-10 h-10 text-graphite/15 mx-auto mb-3" />
              <p className="text-sm text-graphite/50 font-sans mb-3">No campaigns yet</p>
              <Link
                to="/portal/marketing/campaigns/new"
                className="inline-flex items-center gap-2 text-sm font-sans font-medium text-accent hover:text-accent-hover transition-colors"
              >
                Create your first campaign <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans">
                <thead>
                  <tr className="border-b border-graphite/8">
                    <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-widest text-graphite/40">
                      Campaign
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-widest text-graphite/40">
                      Status
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-widest text-graphite/40">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-graphite/5">
                  {recentCampaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-accent-soft/30 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          to={`/portal/marketing/campaigns/${c.id}`}
                          className="font-medium text-graphite hover:text-accent transition-colors"
                        >
                          {c.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <CampaignStatusBadge status={c.status} />
                      </td>
                      <td className="px-6 py-4 text-right text-graphite/40 text-xs">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Status Badge ─────────────────────────────────────────────────── */
function CampaignStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-graphite/8 text-graphite/60',
    scheduled: 'bg-accent/10 text-accent',
    active: 'bg-signal-up/10 text-signal-up',
    paused: 'bg-signal-warn/10 text-signal-warn',
    completed: 'bg-graphite/8 text-graphite/40',
    archived: 'bg-graphite/5 text-graphite/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold font-sans capitalize ${
        styles[status] ?? 'bg-graphite/8 text-graphite/40'
      }`}
    >
      {status}
    </span>
  );
}
