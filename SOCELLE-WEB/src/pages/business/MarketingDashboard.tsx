import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Send,
  Mail,
  MousePointerClick,
  TrendingUp,
  Calendar,
  Plus,
  ArrowRight,
  Loader2,
  BarChart3,
  Users,
  FileText,
} from 'lucide-react';
import { useCampaigns } from '../../lib/useCampaigns';
import type { MarketingCampaign, CampaignStatusType } from '../../lib/useCampaigns';
import ErrorState from '../../components/ErrorState';

// ── WO-OVERHAUL-15: Marketing Dashboard ─────────────────────────────────
// Portal page — opt-in campaigns only (ZERO cold email/outreach).
// isLive pattern: DEMO badge when DB not connected.

function statusBadge(status: CampaignStatusType) {
  const map: Record<CampaignStatusType, { bg: string; label: string }> = {
    draft:     { bg: 'bg-accent-soft/30 text-graphite', label: 'Draft' },
    scheduled: { bg: 'bg-blue-50 text-blue-700', label: 'Scheduled' },
    active:    { bg: 'bg-green-50 text-green-700', label: 'Active' },
    paused:    { bg: 'bg-amber-50 text-amber-700', label: 'Paused' },
    completed: { bg: 'bg-accent-soft text-graphite/60', label: 'Completed' },
    archived:  { bg: 'bg-accent-soft/20 text-graphite/60', label: 'Archived' },
  };
  const s = map[status] ?? { bg: 'bg-accent-soft/20 text-graphite/60', label: status };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.bg}`}>
      {s.label}
    </span>
  );
}

function typeBadge(type: string) {
  const map: Record<string, string> = {
    email: 'Email',
    sms: 'SMS',
    push: 'Push',
    in_app: 'In-App',
    social: 'Social',
  };
  return (
    <span className="text-xs font-medium text-graphite/60 bg-accent-soft px-2 py-0.5 rounded">
      {map[type] ?? type}
    </span>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  suffix,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  suffix?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-accent-soft p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center">
          <Icon className="w-5 h-5 text-graphite" />
        </div>
        <span className="text-sm font-sans text-graphite/60">{label}</span>
      </div>
      <p className="text-3xl font-sans font-bold text-graphite">
        {value}{suffix && <span className="text-lg text-graphite/60 ml-0.5">{suffix}</span>}
      </p>
    </div>
  );
}

export default function MarketingDashboard() {
  const { campaigns, isLive, loading, error, refetch } = useCampaigns();
  const [statusFilter, setStatusFilter] = useState<CampaignStatusType | 'all'>('all');

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return campaigns;
    return campaigns.filter((c) => c.status === statusFilter);
  }, [campaigns, statusFilter]);

  const activeCampaigns = campaigns.filter((c) => c.status === 'active');
  const totalSends = activeCampaigns.length; // placeholder count per active campaign

  // Calendar preview — upcoming scheduled
  const upcoming = campaigns
    .filter((c) => c.status === 'scheduled' && c.scheduled_at)
    .sort((a, b) => new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime())
    .slice(0, 5);

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
              <h1 className="font-sans text-3xl text-graphite">Marketing</h1>
              {!isLive && (
                <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-pill">
                  DEMO
                </span>
              )}
            </div>
            <p className="text-sm text-graphite/60 font-sans mt-1">
              Manage opt-in campaigns for your consented contacts
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/portal/marketing/analytics"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-accent-soft text-sm font-sans font-medium text-graphite hover:bg-accent-soft transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Link>
            <Link
              to="/portal/marketing/campaigns/new"
              className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-graphite text-white text-sm font-sans font-medium hover:bg-graphite/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Campaign
            </Link>
          </div>
        </div>

        {/* ── Quick Nav ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { to: '/portal/marketing/segments', icon: Users, label: 'Segments' },
            { to: '/portal/marketing/templates', icon: FileText, label: 'Templates' },
            { to: '/portal/marketing/analytics', icon: BarChart3, label: 'Analytics' },
            { to: '/portal/marketing/campaigns/new', icon: Plus, label: 'New Campaign' },
          ].map((nav) => (
            <Link
              key={nav.to}
              to={nav.to}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-accent-soft shadow-sm hover:shadow-md transition-shadow"
            >
              <nav.icon className="w-5 h-5 text-graphite" />
              <span className="text-sm font-sans font-medium text-graphite">{nav.label}</span>
              <ArrowRight className="w-4 h-4 text-graphite/60 ml-auto" />
            </Link>
          ))}
        </div>

        {/* ── Key Metrics ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard label="Active Campaigns" value={activeCampaigns.length} icon={Send} />
          <MetricCard label="Total Campaigns" value={campaigns.length} icon={Mail} />
          <MetricCard label="Scheduled" value={upcoming.length} icon={Calendar} />
          <MetricCard
            label="Drafts"
            value={campaigns.filter((c) => c.status === 'draft').length}
            icon={FileText}
          />
        </div>

        {/* ── Campaign List ───────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-accent-soft shadow-sm overflow-hidden">
          <div className="p-6 border-b border-accent-soft flex items-center justify-between flex-wrap gap-4">
            <h2 className="font-sans text-xl text-graphite">Campaigns</h2>
            <div className="flex items-center gap-2">
              {(['all', 'active', 'scheduled', 'draft', 'completed'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-colors ${
                    statusFilter === s
                      ? 'bg-graphite text-white'
                      : 'bg-accent-soft text-graphite hover:bg-accent-soft/30'
                  }`}
                >
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-graphite/60 animate-spin" />
            </div>
          ) : error ? (
            <ErrorState
              title="Campaign data unavailable"
              message={error}
              onRetry={() => void refetch()}
            />
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Mail className="w-10 h-10 text-graphite/60/40 mx-auto mb-3" />
              <p className="text-sm text-graphite/60 font-sans">No campaigns found</p>
              <Link
                to="/portal/marketing/campaigns/new"
                className="inline-flex items-center gap-2 mt-4 text-sm font-sans font-medium text-graphite hover:text-graphite/80 transition-colors"
              >
                Create your first campaign <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans">
                <thead>
                  <tr className="bg-accent-soft/50 text-graphite/60 text-left">
                    <th className="px-6 py-3 font-medium">Campaign</th>
                    <th className="px-6 py-3 font-medium">Type</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium text-right">Created</th>
                    <th className="px-6 py-3 font-medium text-right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-accent-soft/50">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-accent-soft/30 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          to={`/portal/marketing/campaigns/${c.id}`}
                          className="font-medium text-graphite hover:text-graphite transition-colors"
                        >
                          {c.name}
                        </Link>
                        {c.subject && (
                          <p className="text-xs text-graphite/60 mt-0.5 truncate max-w-xs">{c.subject}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">{typeBadge(c.type)}</td>
                      <td className="px-6 py-4">{statusBadge(c.status)}</td>
                      <td className="px-6 py-4 text-right text-graphite/60">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/portal/marketing/campaigns/${c.id}`}
                          className="text-xs font-medium text-graphite hover:text-graphite/80 transition-colors"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Calendar Preview ────────────────────────────────── */}
        {upcoming.length > 0 && (
          <div className="bg-white rounded-xl border border-accent-soft p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-graphite" />
              <h2 className="font-sans text-xl text-graphite">Upcoming Scheduled</h2>
            </div>
            <div className="space-y-3">
              {upcoming.map((c) => (
                <Link
                  key={c.id}
                  to={`/portal/marketing/campaigns/${c.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent-soft/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-sm font-sans font-medium text-graphite">{c.name}</span>
                    {typeBadge(c.type)}
                  </div>
                  <span className="text-xs text-graphite/60 font-sans">
                    {c.scheduled_at ? new Date(c.scheduled_at).toLocaleDateString() : ''}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
