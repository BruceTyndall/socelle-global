import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Palette,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useResellerAccount, useResellerClients, useResellerRevenue } from '../../lib/useReseller';

// ── B2B Reseller Dashboard ──────────────────────────────────────────────────
// Data sources: reseller_accounts, reseller_clients, reseller_revenue (LIVE when DB-connected)

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export default function ResellerDashboard() {
  const { user } = useAuth();
  const { account, loading: acctLoading, isLive: acctLive } = useResellerAccount(user?.id);
  const { clients, loading: clientsLoading, isLive: clientsLive } = useResellerClients(account?.id);
  const { revenue, loading: revLoading, isLive: revLive, totalRevenue, totalCommission, pendingPayout } = useResellerRevenue(account?.id);

  const isLive = acctLive && clientsLive && revLive;
  const loading = acctLoading || clientsLoading || revLoading;

  const activeClients = clients.filter(c => c.status === 'active').length;

  // Monthly revenue for bar chart (last 6 months)
  const monthlyRevenue = (() => {
    const months: { label: string; amount: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      const monthStart = d.toISOString();
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString();
      const amount = revenue
        .filter(r => r.created_at >= monthStart && r.created_at <= monthEnd)
        .reduce((sum, r) => sum + r.amount, 0);
      months.push({ label, amount });
    }
    return months;
  })();

  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.amount), 1);

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Reseller Dashboard | SOCELLE</title>
      </Helmet>

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-sans font-semibold text-graphite">
              Reseller Dashboard
            </h1>
            {!isLive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 font-sans">
                <AlertCircle className="w-3 h-3" />
                DEMO
              </span>
            )}
          </div>
          <p className="text-graphite/60 font-sans mt-1">
            {account?.company_name ?? 'Your B2B reseller overview'}
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-medium text-graphite/60 hover:text-graphite border border-graphite/10 rounded-full transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-graphite/10 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-graphite/10 rounded w-1/2 mb-3" />
              <div className="h-8 bg-graphite/10 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* MRR */}
            <div className="bg-white border border-graphite/10 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-accent" />
                <span className="text-xs font-sans font-medium text-graphite/50 uppercase tracking-wider">Monthly Revenue</span>
              </div>
              <p className="text-2xl font-sans font-semibold text-graphite">
                {formatCurrency(totalRevenue)}
              </p>
              <p className="text-xs text-graphite/40 font-sans mt-1">
                {formatCurrency(pendingPayout)} pending payout
              </p>
            </div>

            {/* Client Count */}
            <div className="bg-white border border-graphite/10 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-accent" />
                <span className="text-xs font-sans font-medium text-graphite/50 uppercase tracking-wider">Active Clients</span>
              </div>
              <p className="text-2xl font-sans font-semibold text-graphite">
                {activeClients}
              </p>
              <p className="text-xs text-graphite/40 font-sans mt-1">
                {clients.length} total enrolled
              </p>
            </div>

            {/* Commission Earnings */}
            <div className="bg-white border border-graphite/10 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span className="text-xs font-sans font-medium text-graphite/50 uppercase tracking-wider">Commission Earned</span>
              </div>
              <p className="text-2xl font-sans font-semibold text-graphite">
                {formatCurrency(totalCommission)}
              </p>
              <p className="text-xs text-graphite/40 font-sans mt-1">
                {account?.commission_rate ?? 0}% commission rate
              </p>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white border border-graphite/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-accent" />
              <h2 className="text-sm font-sans font-semibold text-graphite">Revenue (Last 6 Months)</h2>
            </div>
            <div className="flex items-end gap-3 h-40">
              {monthlyRevenue.map((m) => (
                <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-sans text-graphite/50">
                    {m.amount > 0 ? formatCurrency(m.amount) : ''}
                  </span>
                  <div
                    className="w-full bg-accent/20 rounded-t transition-all"
                    style={{ height: `${Math.max((m.amount / maxRevenue) * 100, 4)}%` }}
                  >
                    <div
                      className="w-full bg-accent rounded-t transition-all"
                      style={{ height: '100%' }}
                    />
                  </div>
                  <span className="text-[10px] font-sans text-graphite/40">{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/portal/reseller/clients"
              className="bg-white border border-graphite/10 rounded-xl p-5 hover:border-accent/30 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm font-sans font-semibold text-graphite">Manage Clients</p>
                    <p className="text-xs text-graphite/50 font-sans">{clients.length} enrolled</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-graphite/30 group-hover:text-accent transition-colors" />
              </div>
            </Link>

            <Link
              to="/portal/reseller/revenue"
              className="bg-white border border-graphite/10 rounded-xl p-5 hover:border-accent/30 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm font-sans font-semibold text-graphite">Revenue Details</p>
                    <p className="text-xs text-graphite/50 font-sans">{formatCurrency(pendingPayout)} pending</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-graphite/30 group-hover:text-accent transition-colors" />
              </div>
            </Link>

            <Link
              to="/portal/reseller/white-label"
              className="bg-white border border-graphite/10 rounded-xl p-5 hover:border-accent/30 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm font-sans font-semibold text-graphite">White-Label Config</p>
                    <p className="text-xs text-graphite/50 font-sans">Customize your brand</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-graphite/30 group-hover:text-accent transition-colors" />
              </div>
            </Link>
          </div>

          {/* Client Summary Table */}
          <div className="bg-white border border-graphite/10 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-graphite/10">
              <h2 className="text-sm font-sans font-semibold text-graphite">Recent Clients</h2>
            </div>
            {clients.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-8 h-8 text-graphite/20 mx-auto mb-2" />
                <p className="text-sm text-graphite/50 font-sans">No clients yet. Add your first client to get started.</p>
              </div>
            ) : (
              <div className="divide-y divide-graphite/5">
                {clients.slice(0, 5).map(client => (
                  <div key={client.id} className="px-6 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-sans font-medium text-graphite">{client.client_name}</p>
                      <p className="text-xs text-graphite/40 font-sans">{client.company_name ?? client.client_email}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold font-sans ${
                      client.status === 'active'
                        ? 'bg-green-50 text-green-700'
                        : client.status === 'pending'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {client.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
