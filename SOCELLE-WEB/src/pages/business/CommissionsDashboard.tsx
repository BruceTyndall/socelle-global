import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { useCommissions } from '../../lib/useCommissions';

// ── WO-OVERHAUL-14: Commissions Dashboard (Business Portal) ─────────────
// Data source: commission_rules + commission_payouts (LIVE when DB-connected)

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(amount);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CommissionsDashboard() {
  const { rules, payouts, loading, isLive } = useCommissions();

  const metrics = useMemo(() => {
    const totalEarned = payouts
      .filter((p) => p.status === 'paid')
      .reduce((s, p) => s + p.amount, 0);
    const pendingAmount = payouts
      .filter((p) => p.status === 'pending')
      .reduce((s, p) => s + p.amount, 0);
    const approvedAmount = payouts
      .filter((p) => p.status === 'approved')
      .reduce((s, p) => s + p.amount, 0);
    const totalPayouts = payouts.length;
    return { totalEarned, pendingAmount, approvedAmount, totalPayouts };
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
        <Link to="/portal/sales" className="inline-flex items-center gap-1.5 text-sm font-sans text-graphite/50 hover:text-graphite transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Sales
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-sans font-semibold text-graphite">Commissions</h1>
          {!isLive && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-signal-warn/10 text-signal-warn font-sans">
              <AlertCircle className="w-3 h-3" />
              DEMO
            </span>
          )}
        </div>
        <p className="text-graphite/60 font-sans mt-1">Track your earnings, commission rules, and payout history.</p>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Earned', value: formatCurrency(metrics.totalEarned), icon: DollarSign, color: 'text-signal-up' },
          { label: 'Pending', value: formatCurrency(metrics.pendingAmount), icon: Clock, color: 'text-signal-warn' },
          { label: 'Approved', value: formatCurrency(metrics.approvedAmount), icon: CheckCircle2, color: 'text-accent' },
          { label: 'Total Payouts', value: String(metrics.totalPayouts), icon: TrendingUp, color: 'text-graphite' },
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
      <div className="bg-white rounded-2xl border border-graphite/8 overflow-hidden">
        <div className="px-6 py-4 border-b border-graphite/8">
          <h2 className="text-base font-sans font-semibold text-graphite">Commission Rules</h2>
        </div>
        {rules.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-graphite/50 font-sans">No commission rules configured.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-graphite/8">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-graphite/50 uppercase tracking-wider">Rule</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-graphite/50 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-graphite/50 uppercase tracking-wider">Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-graphite/50 uppercase tracking-wider">Applies To</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-graphite/50 uppercase tracking-wider">Deal Range</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-graphite/50 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite/5">
                {rules.map((r) => (
                  <tr key={r.id} className="hover:bg-mn-surface/50 transition-colors">
                    <td className="px-6 py-3 font-medium text-graphite">{r.name}</td>
                    <td className="px-6 py-3 text-graphite/70 capitalize">{r.rate_type}</td>
                    <td className="px-6 py-3 text-right text-graphite font-medium">
                      {r.rate_type === 'percentage' ? `${r.rate_value}%` : formatCurrency(r.rate_value)}
                    </td>
                    <td className="px-6 py-3 text-graphite/70">{r.applies_to ?? 'All'}</td>
                    <td className="px-6 py-3 text-graphite/70 text-xs">
                      {r.min_deal_value != null || r.max_deal_value != null
                        ? `${r.min_deal_value != null ? formatCurrency(r.min_deal_value) : '$0'} - ${r.max_deal_value != null ? formatCurrency(r.max_deal_value) : 'No limit'}`
                        : 'Any'}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                        r.is_active ? 'bg-signal-up/10 text-signal-up' : 'bg-graphite/10 text-graphite/50'
                      }`}>
                        {r.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout History */}
      <div className="bg-white rounded-2xl border border-graphite/8 overflow-hidden">
        <div className="px-6 py-4 border-b border-graphite/8 flex items-center justify-between">
          <h2 className="text-base font-sans font-semibold text-graphite">Payout History</h2>
          {payouts.some((p) => p.status === 'approved') && (
            <button className="inline-flex items-center gap-2 h-9 px-4 bg-graphite text-white text-xs font-sans font-semibold rounded-full hover:bg-graphite/90 transition-colors">
              <DollarSign className="w-3.5 h-3.5" />
              Request Payout
            </button>
          )}
        </div>
        {payouts.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-graphite/50 font-sans">No payouts yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-graphite/8">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-graphite/50 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-graphite/50 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-graphite/50 uppercase tracking-wider">Period</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-graphite/50 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-graphite/50 uppercase tracking-wider">Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite/5">
                {payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-mn-surface/50 transition-colors">
                    <td className="px-6 py-3 text-graphite/70">{formatDate(p.created_at)}</td>
                    <td className="px-6 py-3 text-right font-medium text-graphite">{formatCurrency(p.amount)}</td>
                    <td className="px-6 py-3 text-graphite/70 text-xs">
                      {p.period_start && p.period_end
                        ? `${formatDate(p.period_start)} - ${formatDate(p.period_end)}`
                        : 'One-time'}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <PayoutStatusBadge status={p.status} />
                    </td>
                    <td className="px-6 py-3 text-graphite/50 text-xs">
                      {p.paid_at ? formatDate(p.paid_at) : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
