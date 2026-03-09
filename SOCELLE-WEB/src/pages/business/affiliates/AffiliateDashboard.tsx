import { useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Clock,
  LinkIcon,
  TrendingUp,
  AlertCircle,
  Loader2,
  Download,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useAffiliateData } from '../../../lib/affiliates/useAffiliateData';

// ── V2-HUBS-13: Affiliate Engine — Affiliate Dashboard ───────────────────
// Data source: affiliate_links (LIVE when DB-connected)
// DEMO badge shown when table is not available.
// FTC compliance: every commission-linked row displays "Commission-linked" badge.

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(amount);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AffiliateDashboard() {
  const { links, metrics, isLive, loading, error, reload } = useAffiliateData();

  const sortedLinks = useMemo(() => {
    return [...links].sort((a, b) => b.commission_earned - a.commission_earned);
  }, [links]);

  const exportCsv = useCallback(() => {
    const headers = ['Product', 'Category', 'Affiliate URL', 'Clicks', 'Conversions', 'Commission Earned', 'Created'];
    const rows = sortedLinks.map((l) => [
      l.product_name,
      l.product_category,
      l.affiliate_url,
      String(l.clicks),
      String(l.conversions),
      String(l.commission_earned),
      l.created_at,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `affiliate-links-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sortedLinks]);

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
          <h2 className="text-lg font-sans font-semibold text-graphite">Failed to load affiliate data</h2>
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
            <h1 className="text-3xl font-sans font-semibold text-graphite">Affiliate Engine</h1>
            {!isLive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-signal-warn/10 text-signal-warn font-sans">
                <AlertCircle className="w-3 h-3" />
                DEMO
              </span>
            )}
          </div>
          <p className="text-graphite/60 font-sans mt-1">
            Earn commissions by sharing product links with your network.
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
            to="/portal/affiliates/links"
            className="inline-flex items-center gap-2 h-10 px-5 bg-graphite text-white text-sm font-sans font-semibold rounded-full hover:bg-graphite/90 transition-colors"
          >
            <LinkIcon className="w-4 h-4" />
            Manage Links
          </Link>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Earned', value: formatCurrency(metrics.total_earned), icon: DollarSign, color: 'text-signal-up', demo: true },
          { label: 'Pending Payouts', value: formatCurrency(metrics.pending_payouts), icon: Clock, color: 'text-signal-warn', demo: true },
          { label: 'Active Links', value: String(metrics.active_links), icon: LinkIcon, color: 'text-accent', demo: false },
          { label: 'Click-Through Rate', value: `${metrics.click_through_rate}%`, icon: TrendingUp, color: 'text-graphite', demo: true },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-2xl border border-graphite/8 p-5">
            <div className="flex items-center gap-2 mb-2">
              <m.icon className={`w-4 h-4 ${m.color}`} />
              <span className="text-xs font-sans text-graphite/50 uppercase tracking-wider">{m.label}</span>
              {!isLive && m.demo && (
                <span className="text-[9px] font-semibold bg-signal-warn/10 text-signal-warn px-1.5 py-0.5 rounded-full font-sans">
                  DEMO
                </span>
              )}
            </div>
            <p className="text-2xl font-sans font-semibold text-graphite">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Affiliate Links Table */}
      <div className="bg-white rounded-2xl border border-graphite/8 overflow-hidden">
        <div className="px-6 py-4 border-b border-graphite/8 flex items-center justify-between">
          <h2 className="text-base font-sans font-semibold text-graphite">Affiliate Links</h2>
          <span className="text-xs font-sans text-graphite/40">{sortedLinks.length} links</span>
        </div>
        {sortedLinks.length === 0 ? (
          <div className="px-6 py-16 text-center space-y-3">
            <LinkIcon className="w-10 h-10 text-graphite/20 mx-auto" />
            <h3 className="text-base font-sans font-semibold text-graphite">No affiliate links yet</h3>
            <p className="text-sm text-graphite/50 font-sans max-w-sm mx-auto">
              Browse products to generate commission links and start earning.
            </p>
            <Link
              to="/portal/affiliates/links"
              className="inline-flex items-center gap-2 h-10 px-5 bg-graphite text-white text-sm font-sans font-semibold rounded-full hover:bg-graphite/90 transition-colors"
            >
              Generate Links
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-graphite/8">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-graphite/50 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-graphite/50 uppercase tracking-wider">Link</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-graphite/50 uppercase tracking-wider">Clicks</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-graphite/50 uppercase tracking-wider">Conversions</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-graphite/50 uppercase tracking-wider">Commission</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-graphite/50 uppercase tracking-wider">FTC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite/5">
                {sortedLinks.map((l) => (
                  <tr key={l.id} className="hover:bg-accent-soft/30 transition-colors">
                    <td className="px-6 py-3">
                      <p className="font-medium text-graphite">{l.product_name}</p>
                      <p className="text-xs text-graphite/40">{l.product_category}</p>
                    </td>
                    <td className="px-6 py-3 text-xs text-accent font-mono truncate max-w-[200px]">
                      {l.affiliate_url}
                    </td>
                    <td className="px-6 py-3 text-right text-graphite/70">{l.clicks.toLocaleString()}</td>
                    <td className="px-6 py-3 text-right text-graphite/70">{l.conversions.toLocaleString()}</td>
                    <td className="px-6 py-3 text-right font-semibold text-graphite">{formatCurrency(l.commission_earned)}</td>
                    <td className="px-6 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-signal-up/10 text-signal-up font-sans">
                        <ShieldCheck className="w-3 h-3" />
                        Commission-linked
                      </span>
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
