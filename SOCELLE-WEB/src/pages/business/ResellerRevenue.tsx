import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  DollarSign,
  AlertCircle,
  ArrowUpRight,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useResellerAccount, useResellerClients, useResellerRevenue } from '../../lib/useReseller';
import type { ResellerRevenueRow } from '../../lib/useReseller';

// ── B2B Reseller — Revenue Dashboard ────────────────────────────────────────
// Data source: reseller_revenue (LIVE when DB-connected)

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function PayoutStatusBadge({ status }: { status: ResellerRevenueRow['status'] }) {
  const config = {
    pending: { icon: Clock, className: 'bg-amber-50 text-amber-700 border-amber-200' },
    paid: { icon: CheckCircle, className: 'bg-green-50 text-green-700 border-green-200' },
    failed: { icon: XCircle, className: 'bg-red-50 text-red-700 border-red-200' },
  };
  const { icon: Icon, className } = config[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold font-sans border ${className}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}

export default function ResellerRevenue() {
  const { user } = useAuth();
  const { account } = useResellerAccount(user?.id);
  const { clients } = useResellerClients(account?.id);
  const { revenue, loading, isLive, totalRevenue, totalCommission, pendingPayout } = useResellerRevenue(account?.id);

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'failed'>('all');

  const filtered = statusFilter === 'all' ? revenue : revenue.filter(r => r.status === statusFilter);

  // Revenue by client
  const byClient = clients.map(c => {
    const clientRevenue = revenue.filter(r => r.client_id === c.id);
    const total = clientRevenue.reduce((sum, r) => sum + r.amount, 0);
    const commission = clientRevenue.reduce((sum, r) => sum + r.commission_amount, 0);
    return { ...c, totalRevenue: total, totalCommission: commission };
  }).sort((a, b) => b.totalRevenue - a.totalRevenue);

  const maxClientRevenue = Math.max(...byClient.map(c => c.totalRevenue), 1);

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Reseller Revenue | SOCELLE</title>
      </Helmet>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-sans font-semibold text-graphite">
            Revenue Dashboard
          </h1>
          {!isLive && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 font-sans">
              <AlertCircle className="w-3 h-3" />
              DEMO
            </span>
          )}
        </div>
        <p className="text-graphite/60 font-sans mt-1">
          Commission earnings and payout history
        </p>
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
          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-graphite/10 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-accent" />
                <span className="text-xs font-sans font-medium text-graphite/50 uppercase tracking-wider">Total Revenue</span>
              </div>
              <p className="text-2xl font-sans font-semibold text-graphite">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="bg-white border border-graphite/10 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span className="text-xs font-sans font-medium text-graphite/50 uppercase tracking-wider">Total Commission</span>
              </div>
              <p className="text-2xl font-sans font-semibold text-graphite">{formatCurrency(totalCommission)}</p>
              <p className="text-xs text-graphite/40 font-sans mt-1">{account?.commission_rate ?? 0}% rate</p>
            </div>
            <div className="bg-white border border-graphite/10 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-sans font-medium text-graphite/50 uppercase tracking-wider">Pending Payout</span>
              </div>
              <p className="text-2xl font-sans font-semibold text-graphite">{formatCurrency(pendingPayout)}</p>
              {pendingPayout > 0 && (
                <button className="mt-2 inline-flex items-center gap-1 text-xs font-sans font-semibold text-accent hover:text-accent/80 transition-colors">
                  <ArrowUpRight className="w-3 h-3" />
                  Request Payout
                </button>
              )}
            </div>
          </div>

          {/* Revenue by Client */}
          <div className="bg-white border border-graphite/10 rounded-xl p-6">
            <h2 className="text-sm font-sans font-semibold text-graphite mb-4">Revenue by Client</h2>
            {byClient.length === 0 ? (
              <p className="text-sm text-graphite/40 font-sans text-center py-6">No client revenue data yet.</p>
            ) : (
              <div className="space-y-3">
                {byClient.slice(0, 10).map(c => (
                  <div key={c.id} className="flex items-center gap-4">
                    <div className="w-32 shrink-0">
                      <p className="text-sm font-sans font-medium text-graphite truncate">{c.client_name}</p>
                    </div>
                    <div className="flex-1">
                      <div className="h-5 bg-graphite/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all"
                          style={{ width: `${(c.totalRevenue / maxClientRevenue) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-28 text-right shrink-0">
                      <p className="text-sm font-sans font-medium text-graphite">{formatCurrency(c.totalRevenue)}</p>
                      <p className="text-[10px] text-graphite/40 font-sans">{formatCurrency(c.totalCommission)} comm.</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payout History */}
          <div className="bg-white border border-graphite/10 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-graphite/10 flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-sm font-sans font-semibold text-graphite">Payout History</h2>
              <div className="flex gap-1">
                {(['all', 'pending', 'paid', 'failed'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1 text-xs font-sans font-medium rounded-full transition-colors ${
                      statusFilter === s
                        ? 'bg-graphite text-mn-bg'
                        : 'text-graphite/50 hover:text-graphite hover:bg-graphite/5'
                    }`}
                  >
                    {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="p-8 text-center">
                <DollarSign className="w-8 h-8 text-graphite/20 mx-auto mb-2" />
                <p className="text-sm text-graphite/50 font-sans">No payout records found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-graphite/[0.02]">
                      <th className="px-6 py-2.5 text-left text-[10px] font-sans font-semibold text-graphite/50 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-2.5 text-left text-[10px] font-sans font-semibold text-graphite/50 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-2.5 text-left text-[10px] font-sans font-semibold text-graphite/50 uppercase tracking-wider">Commission</th>
                      <th className="px-6 py-2.5 text-left text-[10px] font-sans font-semibold text-graphite/50 uppercase tracking-wider">Period</th>
                      <th className="px-6 py-2.5 text-left text-[10px] font-sans font-semibold text-graphite/50 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-graphite/5">
                    {filtered.map(row => (
                      <tr key={row.id} className="hover:bg-graphite/[0.01]">
                        <td className="px-6 py-3 text-sm font-sans text-graphite">{formatDate(row.created_at)}</td>
                        <td className="px-6 py-3 text-sm font-sans font-medium text-graphite">{formatCurrency(row.amount)}</td>
                        <td className="px-6 py-3 text-sm font-sans text-accent">{formatCurrency(row.commission_amount)}</td>
                        <td className="px-6 py-3 text-xs font-sans text-graphite/50">
                          {row.period_start && row.period_end
                            ? `${formatDate(row.period_start)} - ${formatDate(row.period_end)}`
                            : '--'}
                        </td>
                        <td className="px-6 py-3">
                          <PayoutStatusBadge status={row.status} />
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
  );
}
