import { useMemo } from 'react';
import {
  DollarSign,
  AlertCircle,
  Clock,
  CheckCircle,
  TrendingUp,
  Download,
} from 'lucide-react';
import { useCommissions } from '../../lib/useCommissions';
import { exportToCSV } from '../../lib/csvExport';

// ── WO-OVERHAUL-14: Commission Dashboard ────────────────────────────────
// Data source: commission_rules + commission_payouts (LIVE when DB-connected)

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CommissionDashboard() {
  const { rules, payouts, loading, isLive, error, reload } = useCommissions();

  const metrics = useMemo(() => {
    const totalEarned = payouts.reduce((s, p) => s + p.amount, 0);
    const pendingAmount = payouts.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
    const paidAmount = payouts.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
    return { totalEarned, pendingAmount, paidAmount };
  }, [payouts]);

  // Group payouts by period
  const periodGroups = useMemo(() => {
    const groups: Record<string, typeof payouts> = {};
    for (const p of payouts) {
      const key = p.period_start && p.period_end
        ? `${formatDate(p.period_start)} - ${formatDate(p.period_end)}`
        : 'Unscheduled';
      (groups[key] ??= []).push(p);
    }
    return groups;
  }, [payouts]);

  const handleExport = () => {
    const exportData = payouts.map((p) => ({
      deal_id: p.deal_id,
      amount: p.amount,
      status: p.status,
      period_start: p.period_start ?? '',
      period_end: p.period_end ?? '',
      paid_at: p.paid_at ?? '',
      created_at: p.created_at,
    }));
    exportToCSV(exportData, 'commissions');
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header skeleton */}
        <div>
          <div className="h-8 w-44 bg-graphite/8 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-graphite/5 rounded-lg animate-pulse mt-2" />
        </div>
        {/* Summary cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-graphite/8 p-5">
              <div className="h-3 w-20 bg-graphite/8 rounded animate-pulse mb-3" />
              <div className="h-7 w-28 bg-graphite/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
        {/* Rules skeleton */}
        <div>
          <div className="h-5 w-28 bg-graphite/8 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-graphite/8 p-4">
                <div className="h-4 w-32 bg-graphite/8 rounded animate-pulse mb-2" />
                <div className="h-3 w-24 bg-graphite/5 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        {/* Table skeleton */}
        <div>
          <div className="h-5 w-36 bg-graphite/8 rounded animate-pulse mb-4" />
          <div className="bg-white rounded-2xl border border-graphite/8 p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-4 w-24 bg-graphite/5 rounded animate-pulse" />
                <div className="h-4 w-20 bg-graphite/5 rounded animate-pulse" />
                <div className="h-4 w-16 bg-graphite/8 rounded-full animate-pulse" />
                <div className="h-4 w-24 bg-graphite/5 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-signal-down/5 border border-signal-down/20 rounded-xl p-6 text-center">
          <AlertCircle className="w-8 h-8 text-signal-down mx-auto mb-2" />
          <p className="text-graphite font-medium">Something went wrong</p>
          <p className="text-graphite/60 text-sm mt-1">{error}</p>
          <button onClick={() => reload()} className="mt-3 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover text-sm">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-sans font-semibold text-graphite">Commissions</h1>
            {!isLive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-signal-warn/10 text-signal-warn font-sans">
                <AlertCircle className="w-3 h-3" />
                DEMO
              </span>
            )}
          </div>
          <p className="text-graphite/60 font-sans mt-1">Earnings, payouts, and commission rules.</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-accent hover:text-accent-hover border border-accent/20 rounded-lg hover:bg-accent-soft transition-colors">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Earned', value: formatCurrency(metrics.totalEarned), icon: TrendingUp, color: 'text-signal-up' },
          { label: 'Pending', value: formatCurrency(metrics.pendingAmount), icon: Clock, color: 'text-signal-warn' },
          { label: 'Paid', value: formatCurrency(metrics.paidAmount), icon: CheckCircle, color: 'text-accent' },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-2xl border border-graphite/8 p-5">
            <div className="flex items-center gap-2 mb-2">
              <m.icon className={`w-4 h-4 ${m.color}`} />
              <span className="text-xs font-sans text-graphite/50 uppercase tracking-wider">{m.label}</span>
            </div>
            <p className="text-2xl font-sans font-semibold text-graphite">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Commission Rules */}
      <div>
        <h2 className="text-lg font-sans font-semibold text-graphite mb-4">Active Rules</h2>
        {rules.filter((r) => r.is_active).length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-accent-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-graphite mb-2">No active commission rules</h3>
            <p className="text-graphite/60 max-w-md mx-auto">Commission rules will appear here once configured in Admin settings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rules.filter((r) => r.is_active).map((rule) => (
              <div key={rule.id} className="bg-white rounded-xl border border-graphite/8 p-4">
                <h3 className="text-sm font-sans font-semibold text-graphite">{rule.name}</h3>
                <div className="flex items-center gap-2 mt-2 text-xs font-sans text-graphite/60">
                  <DollarSign className="w-3.5 h-3.5" />
                  {rule.rate_type === 'percentage'
                    ? `${rule.rate_value}%`
                    : formatCurrency(rule.rate_value)}
                  <span className="text-graphite/30">|</span>
                  <span>{rule.applies_to ?? 'All deals'}</span>
                </div>
                {(rule.min_deal_value || rule.max_deal_value) && (
                  <p className="text-xs font-sans text-graphite/40 mt-1">
                    Range: {rule.min_deal_value ? formatCurrency(rule.min_deal_value) : '$0'} - {rule.max_deal_value ? formatCurrency(rule.max_deal_value) : 'No limit'}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payout History */}
      <div>
        <h2 className="text-lg font-sans font-semibold text-graphite mb-4">Payout History</h2>
        {payouts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-accent-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-graphite mb-2">No payouts yet</h3>
            <p className="text-graphite/60 max-w-md mx-auto">Commission payouts will appear here as deals close and commissions are calculated.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(periodGroups).map(([period, items]) => (
              <div key={period}>
                <h3 className="text-sm font-sans font-semibold text-graphite/60 mb-2">{period}</h3>
                <div className="bg-white rounded-2xl border border-graphite/8 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm font-sans">
                      <thead>
                        <tr className="border-b border-graphite/8">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-graphite/50 uppercase tracking-wider">Deal</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-graphite/50 uppercase tracking-wider">Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-graphite/50 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-graphite/50 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-graphite/5">
                        {items.map((p) => (
                          <tr key={p.id}>
                            <td className="px-4 py-3 text-graphite">{p.deal_id.slice(0, 8)}...</td>
                            <td className="px-4 py-3 font-semibold text-graphite">{formatCurrency(p.amount)}</td>
                            <td className="px-4 py-3">
                              <PayoutStatusBadge status={p.status} />
                            </td>
                            <td className="px-4 py-3 text-graphite/50 text-xs">
                              {p.paid_at ? formatDate(p.paid_at) : formatDate(p.created_at)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PayoutStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-signal-warn/10 text-signal-warn',
    approved: 'bg-accent/10 text-accent',
    paid: 'bg-signal-up/10 text-signal-up',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${colors[status] ?? 'bg-graphite/10 text-graphite/60'}`}>
      {status}
    </span>
  );
}
