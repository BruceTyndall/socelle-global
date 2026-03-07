import { useMemo } from 'react';
import {
  AlertCircle,
  Loader2,
  DollarSign,
  TrendingUp,
  Target,
  Users,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useDeals } from '../../lib/useDeals';
import { usePipelines } from '../../lib/usePipelines';
import { useCommissions } from '../../lib/useCommissions';

// ── WO-OVERHAUL-14: Admin Sales Platform Hub ─────────────────────────────
// Data source: deals + pipelines + commission_rules + commission_payouts
// Cross-tenant admin view (LIVE when DB-connected)

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function AdminSalesPlatformHub() {
  const { deals, loading: dealsLoading, isLive: dealsLive } = useDeals();
  const { pipelines, loading: pipelinesLoading, isLive: pipelinesLive } = usePipelines();
  const { rules, payouts, loading: commissionsLoading, isLive: commissionsLive } = useCommissions();
  const loading = dealsLoading || pipelinesLoading || commissionsLoading;
  const isLive = dealsLive && pipelinesLive && commissionsLive;

  const dealMetrics = useMemo(() => {
    const totalDeals = deals.length;
    const openDeals = deals.filter((d) => d.status === 'open').length;
    const wonDeals = deals.filter((d) => d.status === 'won');
    const lostDeals = deals.filter((d) => d.status === 'lost');
    const totalRevenue = wonDeals.reduce((s, d) => s + d.value, 0);
    const pipelineValue = deals.filter((d) => d.status === 'open').reduce((s, d) => s + d.value, 0);
    const closedCount = wonDeals.length + lostDeals.length;
    const winRate = closedCount > 0 ? Math.round((wonDeals.length / closedCount) * 100) : 0;
    const avgDealSize = wonDeals.length > 0
      ? wonDeals.reduce((s, d) => s + d.value, 0) / wonDeals.length
      : 0;
    return { totalDeals, openDeals, totalRevenue, pipelineValue, winRate, avgDealSize };
  }, [deals]);

  const commissionMetrics = useMemo(() => {
    const totalPaid = payouts.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
    const pendingApproval = payouts.filter((p) => p.status === 'pending');
    const approvedPending = payouts.filter((p) => p.status === 'approved');
    return {
      totalPaid,
      pendingCount: pendingApproval.length,
      pendingAmount: pendingApproval.reduce((s, p) => s + p.amount, 0),
      approvedCount: approvedPending.length,
      approvedAmount: approvedPending.reduce((s, p) => s + p.amount, 0),
      activeRules: rules.filter((r) => r.is_active).length,
    };
  }, [rules, payouts]);

  // Recent deals (last 15)
  const recentDeals = useMemo(() => {
    return [...deals]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 15);
  }, [deals]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-sans font-semibold text-graphite">Sales Platform</h1>
        {!isLive && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-signal-warn/10 text-signal-warn font-sans">
            <AlertCircle className="w-3 h-3" />
            DEMO
          </span>
        )}
      </div>

      {/* Deal Analytics */}
      <div>
        <h2 className="text-base font-sans font-semibold text-graphite mb-3">Deal Analytics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total Deals', value: String(dealMetrics.totalDeals), icon: Users },
            { label: 'Open Deals', value: String(dealMetrics.openDeals), icon: Target },
            { label: 'Pipeline Value', value: formatCurrency(dealMetrics.pipelineValue), icon: TrendingUp },
            { label: 'Revenue (Won)', value: formatCurrency(dealMetrics.totalRevenue), icon: DollarSign },
            { label: 'Win Rate', value: `${dealMetrics.winRate}%`, icon: Target },
            { label: 'Avg Deal Size', value: formatCurrency(dealMetrics.avgDealSize), icon: DollarSign },
          ].map((m) => (
            <div key={m.label} className="bg-white rounded-xl border border-graphite/8 p-4">
              <div className="flex items-center gap-2 mb-1">
                <m.icon className="w-3.5 h-3.5 text-accent" />
                <span className="text-[10px] font-sans text-graphite/50 uppercase tracking-wider">{m.label}</span>
              </div>
              <p className="text-xl font-sans font-semibold text-graphite">{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pipelines Overview */}
      <div>
        <h2 className="text-base font-sans font-semibold text-graphite mb-3">Pipelines ({pipelines.length})</h2>
        {pipelines.length === 0 ? (
          <p className="text-sm text-graphite/50 font-sans">No pipelines configured.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pipelines.map((p) => {
              const pDeals = deals.filter((d) => d.pipeline_id === p.id && d.status === 'open');
              const pValue = pDeals.reduce((s, d) => s + d.value, 0);
              return (
                <div key={p.id} className="bg-white rounded-xl border border-graphite/8 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-sans font-semibold text-graphite">{p.name}</p>
                      {p.description && <p className="text-xs font-sans text-graphite/50 mt-0.5">{p.description}</p>}
                    </div>
                    {p.is_default && (
                      <span className="text-[10px] font-sans font-semibold bg-accent/10 text-accent px-2 py-0.5 rounded-full">DEFAULT</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs font-sans text-graphite/60">
                    <span>{pDeals.length} open deals</span>
                    <span>{formatCurrency(pValue)} value</span>
                    <span>{p.stages.length} stages</span>
                  </div>
                  {/* Stage bar */}
                  {p.stages.length > 0 && (
                    <div className="flex gap-1 mt-3">
                      {p.stages.map((stage) => {
                        const count = pDeals.filter((d) => d.stage_id === stage.id).length;
                        return (
                          <div key={stage.id} className="flex-1 text-center">
                            <div
                              className="h-1.5 rounded-full mb-1"
                              style={{ backgroundColor: stage.color ?? '#6E879B', opacity: count > 0 ? 1 : 0.2 }}
                            />
                            <span className="text-[9px] font-sans text-graphite/40 truncate block">{stage.name}</span>
                            <span className="text-[10px] font-sans font-medium text-graphite/60">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Commission Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Commission Rules */}
        <div className="bg-white rounded-xl border border-graphite/8 overflow-hidden">
          <div className="px-5 py-3 border-b border-graphite/8 flex items-center justify-between">
            <h2 className="text-sm font-sans font-semibold text-graphite">Commission Rules ({commissionMetrics.activeRules} active)</h2>
          </div>
          {rules.length === 0 ? (
            <div className="px-5 py-6 text-center">
              <p className="text-xs text-graphite/50 font-sans">No rules configured.</p>
            </div>
          ) : (
            <div className="divide-y divide-graphite/5">
              {rules.map((r) => (
                <div key={r.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-sans font-medium text-graphite">{r.name}</p>
                    <p className="text-xs font-sans text-graphite/50">
                      {r.rate_type === 'percentage' ? `${r.rate_value}%` : formatCurrency(r.rate_value)}
                      {r.applies_to ? ` on ${r.applies_to}` : ''}
                    </p>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    r.is_active ? 'bg-signal-up/10 text-signal-up' : 'bg-graphite/10 text-graphite/50'
                  }`}>
                    {r.is_active ? 'Active' : 'Off'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payout Approvals */}
        <div className="bg-white rounded-xl border border-graphite/8 overflow-hidden">
          <div className="px-5 py-3 border-b border-graphite/8">
            <h2 className="text-sm font-sans font-semibold text-graphite">Payout Approvals</h2>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-signal-warn" />
                <span className="text-sm font-sans text-graphite">Pending</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-sans font-semibold text-graphite">{formatCurrency(commissionMetrics.pendingAmount)}</p>
                <p className="text-[10px] font-sans text-graphite/50">{commissionMetrics.pendingCount} payouts</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span className="text-sm font-sans text-graphite">Approved (awaiting payment)</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-sans font-semibold text-graphite">{formatCurrency(commissionMetrics.approvedAmount)}</p>
                <p className="text-[10px] font-sans text-graphite/50">{commissionMetrics.approvedCount} payouts</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-graphite/8">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-signal-up" />
                <span className="text-sm font-sans text-graphite">Total Paid</span>
              </div>
              <p className="text-sm font-sans font-semibold text-graphite">{formatCurrency(commissionMetrics.totalPaid)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Deals Table */}
      <div className="bg-white rounded-xl border border-graphite/8 overflow-hidden">
        <div className="px-5 py-3 border-b border-graphite/8">
          <h2 className="text-sm font-sans font-semibold text-graphite">Recent Deals</h2>
        </div>
        {recentDeals.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-graphite/50 font-sans">No deals yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-graphite/8">
                  <th className="px-5 py-2.5 text-left text-xs font-semibold text-graphite/50 uppercase tracking-wider">Deal</th>
                  <th className="px-5 py-2.5 text-right text-xs font-semibold text-graphite/50 uppercase tracking-wider">Value</th>
                  <th className="px-5 py-2.5 text-left text-xs font-semibold text-graphite/50 uppercase tracking-wider">Contact</th>
                  <th className="px-5 py-2.5 text-center text-xs font-semibold text-graphite/50 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-2.5 text-left text-xs font-semibold text-graphite/50 uppercase tracking-wider">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite/5">
                {recentDeals.map((d) => (
                  <tr key={d.id} className="hover:bg-mn-surface/50 transition-colors">
                    <td className="px-5 py-2.5 font-medium text-graphite">{d.title}</td>
                    <td className="px-5 py-2.5 text-right text-graphite/70">{formatCurrency(d.value)}</td>
                    <td className="px-5 py-2.5 text-graphite/70">{d.contact_name ?? '--'}</td>
                    <td className="px-5 py-2.5 text-center">
                      <DealStatusBadge status={d.status} />
                    </td>
                    <td className="px-5 py-2.5 text-graphite/50 text-xs">{formatDate(d.updated_at)}</td>
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

function DealStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    open: 'bg-accent/10 text-accent',
    won: 'bg-signal-up/10 text-signal-up',
    lost: 'bg-signal-down/10 text-signal-down',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${colors[status] ?? 'bg-graphite/10 text-graphite/60'}`}>
      {status}
    </span>
  );
}
