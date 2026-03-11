import { useMemo, useCallback } from 'react';
import {
  Coins,
  TrendingUp,
  Gauge,
  AlertTriangle,
  AlertCircle,
  Loader2,
  Download,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCreditBalance } from '../../../lib/credits/useCreditBalance';

// ── V2-HUBS-12: Credit Economy — Credit Dashboard ────────────────────────
// Data source: credit_ledger (LIVE when DB-connected)
// DEMO badge shown when table is not available.

function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}

function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CreditDashboard() {
  const { balance, transactions, isLive, loading, error, reload } = useCreditBalance();

  const tierAllocations: Record<string, number> = { Starter: 50, Professional: 250, Enterprise: 1000, Custom: 5000 };
  const currentTier = 'Professional';

  const overageStatus = useMemo(() => {
    if (balance.credit_balance_usd < 0) return 'overage';
    if (balance.credit_balance_usd < 10) return 'low';
    return 'healthy';
  }, [balance]);

  const exportCsv = useCallback(() => {
    const headers = ['Feature', 'Amount (USD)', 'Model', 'Timestamp'];
    const rows = transactions.map((t) => [
      t.feature || 'Unknown',
      String(t.amount_usd),
      t.model || '',
      t.created_at,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `credit-usage-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transactions]);

  // ── Loading state (skeleton shimmer) ──
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="h-10 w-64 bg-graphite/5 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-graphite/8 p-5 space-y-3">
              <div className="h-4 w-24 bg-graphite/5 rounded animate-pulse" />
              <div className="h-8 w-20 bg-graphite/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-graphite/8 p-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-6 bg-graphite/5 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl border border-signal-down/20 p-10 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-signal-down mx-auto" />
          <h2 className="text-lg font-sans font-semibold text-graphite">Failed to load credit data</h2>
          <p className="text-sm text-graphite/60 font-sans max-w-md mx-auto">{error}</p>
          <button
            onClick={() => reload()}
            className="inline-flex items-center gap-2 h-10 px-5 bg-graphite text-white text-sm font-sans font-semibold rounded-full hover:bg-graphite/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-sans font-semibold text-graphite">Credit Economy</h1>
            {!isLive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-signal-warn/10 text-signal-warn font-sans">
                <AlertCircle className="w-3 h-3" />
                DEMO
              </span>
            )}
          </div>
          <p className="text-graphite/60 font-sans mt-1">
            Monitor credit usage, allocation, and overage status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 h-10 px-5 border border-graphite/15 text-graphite text-sm font-sans font-semibold rounded-full hover:bg-accent-soft transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <Link
            to="/portal/credits/purchase"
            className="inline-flex items-center gap-2 h-10 px-5 bg-graphite text-white text-sm font-sans font-semibold rounded-full hover:bg-graphite/90 transition-colors"
          >
            <Coins className="w-4 h-4" />
            Buy Credits
          </Link>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Balance Remaining',
            value: formatUsd(balance.credit_balance_usd),
            icon: Coins,
            color: overageStatus === 'overage' ? 'text-signal-down' : overageStatus === 'low' ? 'text-signal-warn' : 'text-signal-up',
          },
          { label: 'Lifetime Spent', value: formatUsd(balance.lifetime_spent_usd), icon: TrendingUp, color: 'text-accent' },
          { label: 'Lifetime Requests', value: formatNumber(balance.lifetime_requests), icon: Zap, color: 'text-graphite' },
          {
            label: 'Overage Status',
            value: overageStatus === 'overage' ? 'Over Limit' : overageStatus === 'low' ? 'Running Low' : 'Healthy',
            icon: AlertTriangle,
            color: overageStatus === 'overage' ? 'text-signal-down' : overageStatus === 'low' ? 'text-signal-warn' : 'text-signal-up',
          },
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

      {/* Tier Allocation Reference */}
      <div className="bg-white rounded-2xl border border-graphite/8 p-6">
        <h2 className="text-base font-sans font-semibold text-graphite mb-4">Credit Allocation by Tier</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(tierAllocations).map(([tier, credits]) => (
            <div
              key={tier}
              className={`rounded-xl border p-4 ${
                tier === currentTier
                  ? 'border-accent bg-accent-soft'
                  : 'border-graphite/8'
              }`}
            >
              <span className="text-xs font-sans font-semibold text-graphite/50 uppercase tracking-wider">
                {tier}
              </span>
              <p className="text-xl font-sans font-semibold text-graphite mt-1">
                {formatUsd(credits)}
              </p>
              <p className="text-xs text-graphite/40 font-sans">value/mo</p>
              {tier === currentTier && (
                <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-accent font-sans">
                  <Zap className="w-3 h-3" />
                  Current
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Usage History */}
      <div className="bg-white rounded-2xl border border-graphite/8 overflow-hidden">
        <div className="px-6 py-4 border-b border-graphite/8 flex items-center justify-between">
          <h2 className="text-base font-sans font-semibold text-graphite">Usage History</h2>
          <span className="text-xs font-sans text-graphite/40">{transactions.length} transactions</span>
        </div>
        {transactions.length === 0 ? (
          <div className="px-6 py-16 text-center space-y-3">
            <Coins className="w-10 h-10 text-graphite/20 mx-auto" />
            <h3 className="text-base font-sans font-semibold text-graphite">No credit usage yet</h3>
            <p className="text-sm text-graphite/50 font-sans max-w-sm mx-auto">
              Use AI tools like Explain Signal, Generate Brief, or Menu Optimization to start using your credits.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-graphite/8">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-graphite/50 uppercase tracking-wider">Feature</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-graphite/50 uppercase tracking-wider">Expense</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-graphite/50 uppercase tracking-wider">Model Used</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-graphite/50 uppercase tracking-wider">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite/5">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-accent-soft/30 transition-colors">
                    <td className="px-6 py-3 font-medium text-graphite">{t.feature || 'Unknown'}</td>
                    <td className="px-6 py-3 text-right text-graphite font-semibold">{formatUsd(t.amount_usd)}</td>
                    <td className="px-6 py-3 text-graphite/50 text-xs font-mono">
                      {t.model ?? '--'}
                    </td>
                    <td className="px-6 py-3 text-graphite/50 text-xs">{formatDate(t.created_at)}</td>
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
