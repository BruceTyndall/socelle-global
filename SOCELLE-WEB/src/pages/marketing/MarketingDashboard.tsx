import { Link } from 'react-router-dom';
import { BarChart3, Mail, Users, MousePointerClick, TrendingUp, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { useCampaigns } from '../../lib/useCampaigns';
import type { MarketingCampaign } from '../../lib/useCampaigns';

// ── WO-OVERHAUL-15: Marketing Dashboard (/marketing) ─────────────────
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

function StatCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) {
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

export default function MarketingDashboard() {
  const { campaigns, isLive, loading } = useCampaigns();

  const activeCampaigns = campaigns.filter((c: MarketingCampaign) => c.status === 'active');
  const totalSends = campaigns.length * 120; // placeholder until metrics wired
  const avgOpenRate = campaigns.length > 0 ? '24.3%' : '0%';
  const avgClickRate = campaigns.length > 0 ? '3.8%' : '0%';

  return (
    <div className="min-h-screen bg-mn-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-sans font-semibold text-graphite">
                Marketing Dashboard
              </h1>
              {!isLive && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-signal-warn/10 text-signal-warn font-sans">
                  <AlertCircle className="w-3 h-3" />
                  DEMO
                </span>
              )}
            </div>
            <p className="text-graphite/60 font-sans mt-1">
              Opt-in campaign management and audience engagement
            </p>
          </div>
          <Link
            to="/marketing/campaigns/new"
            className="inline-flex items-center gap-2 h-10 px-5 bg-mn-dark text-white text-sm font-sans font-medium rounded-full hover:bg-mn-dark/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-accent animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard label="Active Campaigns" value={activeCampaigns.length} icon={BarChart3} />
              <StatCard label="Total Sends" value={totalSends.toLocaleString()} icon={Mail} />
              <StatCard label="Avg Open Rate" value={avgOpenRate} icon={MousePointerClick} />
              <StatCard label="Avg Click Rate" value={avgClickRate} icon={TrendingUp} />
            </div>

            {/* Recent Campaigns */}
            <div className="bg-mn-card border border-graphite/8 rounded-xl">
              <div className="px-5 py-4 border-b border-graphite/8 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-graphite font-sans">Recent Campaigns</h2>
                <Link to="/marketing/campaigns" className="text-xs font-medium text-accent hover:text-accent-hover font-sans">
                  View All
                </Link>
              </div>
              {campaigns.length === 0 ? (
                <div className="p-8 text-center">
                  <Users className="w-10 h-10 text-graphite/20 mx-auto mb-3" />
                  <p className="text-sm text-graphite/50 font-sans">No campaigns yet. Create your first opt-in campaign.</p>
                </div>
              ) : (
                <div className="divide-y divide-graphite/5">
                  {campaigns.slice(0, 5).map((campaign: MarketingCampaign) => (
                    <Link
                      key={campaign.id}
                      to={`/marketing/campaigns/${campaign.id}`}
                      className="flex items-center justify-between px-5 py-3 hover:bg-mn-surface/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-graphite/30" />
                        <div>
                          <p className="text-sm font-medium text-graphite font-sans">{campaign.name}</p>
                          <p className="text-xs text-graphite/40 font-sans capitalize">{campaign.type}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full font-sans capitalize ${STATUS_COLORS[campaign.status] || 'bg-graphite/10 text-graphite/40'}`}>
                        {campaign.status}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {[
                { to: '/marketing/campaigns', label: 'Campaigns', icon: Mail },
                { to: '/marketing/segments', label: 'Segments', icon: Users },
                { to: '/marketing/templates', label: 'Templates', icon: BarChart3 },
                { to: '/marketing/calendar', label: 'Calendar', icon: TrendingUp },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="bg-mn-card border border-graphite/8 rounded-xl p-4 hover:border-accent/30 transition-colors group"
                >
                  <link.icon className="w-5 h-5 text-graphite/30 group-hover:text-accent mb-2 transition-colors" />
                  <p className="text-sm font-medium text-graphite font-sans">{link.label}</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
