import { useMemo } from 'react';
import {
  DollarSign,
  AlertCircle,
  Loader2,
  Clock,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { useCommissions } from '../../lib/useCommissions';

// ── WO-OVERHAUL-14: Commission Dashboard ────────────────────────────────
// Data source: commission_rules + commission_payouts (LIVE when DB-connected)

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CommissionDashboard() {
  const { rules, payouts, loading, isLive } = useCommissions();

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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
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
          <p className="text-graphite/50 font-sans text-sm">No active commission rules.</p>
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
          <p className="text-graphite/50 font-sans text-sm">No payouts yet.</p>
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
