import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Mail, AlertCircle, Loader2, Filter, Search } from 'lucide-react';
import { useCampaigns } from '../../lib/useCampaigns';
import type { MarketingCampaign, CampaignType, CampaignStatusType } from '../../lib/useCampaigns';
import ErrorState from '../../components/ErrorState';

// ── WO-OVERHAUL-15: Campaign List (/marketing/campaigns) ─────────────
// Data source: campaigns table via useCampaigns()
// isLive flag drives DEMO badge. ZERO cold email — all campaigns opt-in only.

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-graphite/10 text-graphite/60',
  scheduled: 'bg-accent/10 text-accent',
  active: 'bg-signal-up/10 text-signal-up',
  paused: 'bg-signal-warn/10 text-signal-warn',
  completed: 'bg-graphite/10 text-graphite/40',
  archived: 'bg-graphite/5 text-graphite/30',
};

const CAMPAIGN_TYPES: CampaignType[] = ['email', 'sms', 'push', 'in_app', 'social'];
const CAMPAIGN_STATUSES: CampaignStatusType[] = ['draft', 'scheduled', 'active', 'paused', 'completed', 'archived'];

export default function CampaignList() {
  const { campaigns, isLive, loading, error, refetch } = useCampaigns();
  const [typeFilter, setTypeFilter] = useState<CampaignType | ''>('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatusType | ''>('');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = campaigns.filter((c: MarketingCampaign) => {
    if (typeFilter && c.type !== typeFilter) return false;
    if (statusFilter && c.status !== statusFilter) return false;
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-mn-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-sans font-semibold text-graphite">Campaigns</h1>
              {!isLive && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-signal-warn/10 text-signal-warn font-sans">
                  <AlertCircle className="w-3 h-3" />
                  DEMO
                </span>
              )}
            </div>
            <p className="text-graphite/60 font-sans mt-1">Manage opt-in marketing campaigns</p>
          </div>
          <Link
            to="/marketing/campaigns/new"
            className="inline-flex items-center gap-2 h-10 px-5 bg-mn-dark text-white text-sm font-sans font-medium rounded-full hover:bg-mn-dark/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Campaign
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/30" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-sm font-sans text-graphite bg-mn-card border border-graphite/10 rounded-lg focus:outline-none focus:border-accent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-graphite/30" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as CampaignType | '')}
              className="h-9 px-3 text-xs font-sans text-graphite bg-mn-card border border-graphite/10 rounded-lg focus:outline-none focus:border-accent"
            >
              <option value="">All Types</option>
              {CAMPAIGN_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CampaignStatusType | '')}
              className="h-9 px-3 text-xs font-sans text-graphite bg-mn-card border border-graphite/10 rounded-lg focus:outline-none focus:border-accent"
            >
              <option value="">All Statuses</option>
              {CAMPAIGN_STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
          </div>
        ) : error ? (
          <ErrorState
            title="Campaign list unavailable"
            message={error}
            onRetry={() => void refetch()}
          />
        ) : filtered.length === 0 ? (
          <div className="bg-mn-card border border-graphite/8 rounded-xl p-12 text-center">
            <Mail className="w-10 h-10 text-graphite/20 mx-auto mb-3" />
            <p className="text-sm text-graphite/50 font-sans">No campaigns found. Create your first opt-in campaign.</p>
            <Link
              to="/marketing/campaigns/new"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-mn-dark text-white text-sm font-sans font-medium hover:bg-mn-dark/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Campaign
            </Link>
          </div>
        ) : (
          <div className="bg-mn-card border border-graphite/8 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans">
                <thead>
                  <tr className="border-b border-graphite/8">
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-graphite/40">Name</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-graphite/40">Type</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-graphite/40">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-widest text-graphite/40">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-graphite/5">
                  {filtered.map((campaign: MarketingCampaign) => (
                    <tr key={campaign.id} className="hover:bg-mn-surface/50 transition-colors">
                      <td className="px-5 py-3">
                        <Link to={`/marketing/campaigns/${campaign.id}`} className="text-sm font-medium text-graphite hover:text-accent transition-colors">
                          {campaign.name}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-graphite/60 capitalize">{campaign.type.replace('_', ' ')}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[campaign.status] || ''}`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-graphite/40 text-xs">
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
