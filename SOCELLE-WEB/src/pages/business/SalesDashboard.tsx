import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  Target,
  Activity,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { useDeals } from '../../lib/useDeals';
import { usePipelines } from '../../lib/usePipelines';

// ── WO-OVERHAUL-14: Sales Dashboard (Business Portal) ───────────────────
// Data source: deals + sales_pipelines (LIVE when DB-connected)
// DEMO badge shown when tables are not available

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

export default function SalesDashboard() {
  const { deals, loading: dealsLoading, isLive: dealsLive } = useDeals();
  const { pipelines, loading: pipelinesLoading } = usePipelines();
  const loading = dealsLoading || pipelinesLoading;
  const isLive = dealsLive;

  const metrics = useMemo(() => {
    const now = new Date();
    const mtdStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const qtdStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const ytdStart = new Date(now.getFullYear(), 0, 1);

    const wonDeals = deals.filter((d) => d.status === 'won');
    const closedDeals = deals.filter((d) => d.status === 'won' || d.status === 'lost');

    const mtdRevenue = wonDeals
      .filter((d) => new Date(d.updated_at) >= mtdStart)
      .reduce((s, d) => s + d.value, 0);
    const qtdRevenue = wonDeals
      .filter((d) => new Date(d.updated_at) >= qtdStart)
      .reduce((s, d) => s + d.value, 0);
    const ytdRevenue = wonDeals
      .filter((d) => new Date(d.updated_at) >= ytdStart)
      .reduce((s, d) => s + d.value, 0);

    const winRate = closedDeals.length > 0
      ? Math.round((wonDeals.length / closedDeals.length) * 100)
      : 0;
    const avgDealSize = wonDeals.length > 0
      ? wonDeals.reduce((s, d) => s + d.value, 0) / wonDeals.length
      : 0;

    return { mtdRevenue, qtdRevenue, ytdRevenue, winRate, avgDealSize };
  }, [deals]);

  // Build stage summary from pipelines + deals
  const stageSummary = useMemo(() => {
    if (pipelines.length === 0) return [];
    const defaultPipeline = pipelines.find((p) => p.is_default) ?? pipelines[0];
    return defaultPipeline.stages.map((stage) => {
      const stageDeals = deals.filter((d) => d.stage_id === stage.id && d.status === 'open');
      return {
        name: stage.name,
        count: stageDeals.length,
        value: stageDeals.reduce((s, d) => s + d.value, 0),
        color: stage.color,
      };
    });
  }, [pipelines, deals]);

  // Recent activity: last 10 updated deals
  const recentDeals = useMemo(() => {
    return [...deals].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 10);
  }, [deals]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-sans font-semibold text-graphite">
              Sales Dashboard
            </h1>
            {!isLive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-signal-warn/10 text-signal-warn font-sans">
                <AlertCircle className="w-3 h-3" />
                DEMO
              </span>
            )}
          </div>
          <p className="text-graphite/60 font-sans mt-1">Pipeline performance and revenue metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/portal/sales/commissions"
            className="inline-flex items-center gap-2 h-10 px-5 border border-graphite/15 text-graphite text-sm font-sans font-semibold rounded-full hover:bg-mn-surface transition-colors"
          >
            Commissions
          </Link>
          <Link
            to="/portal/sales/pipeline"
            className="inline-flex items-center gap-2 h-10 px-5 bg-graphite text-white text-sm font-sans font-semibold rounded-full hover:bg-graphite/90 transition-colors"
          >
            View Pipeline <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'MTD Revenue', value: formatCurrency(metrics.mtdRevenue), icon: DollarSign },
          { label: 'QTD Revenue', value: formatCurrency(metrics.qtdRevenue), icon: DollarSign },
          { label: 'YTD Revenue', value: formatCurrency(metrics.ytdRevenue), icon: TrendingUp },
          { label: 'Win Rate', value: `${metrics.winRate}%`, icon: Target },
          { label: 'Avg Deal Size', value: formatCurrency(metrics.avgDealSize), icon: Activity },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-2xl border border-graphite/8 p-5">
            <div className="flex items-center gap-2 mb-2">
              <m.icon className="w-4 h-4 text-accent" />
              <span className="text-xs font-sans text-graphite/50 uppercase tracking-wider">{m.label}</span>
            </div>
            <p className="text-2xl font-sans font-semibold text-graphite">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Pipeline Overview */}
      {stageSummary.length > 0 && (
        <div>
          <h2 className="text-lg font-sans font-semibold text-graphite mb-4">Pipeline Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {stageSummary.map((s) => (
              <div key={s.name} className="bg-white rounded-xl border border-graphite/8 p-4">
                <div className="flex items-center gap-2 mb-1">
                  {s.color && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />}
                  <span className="text-xs font-sans font-medium text-graphite/70 truncate">{s.name}</span>
                </div>
                <p className="text-lg font-sans font-semibold text-graphite">{s.count} deals</p>
                <p className="text-xs font-sans text-graphite/50">{formatCurrency(s.value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-sans font-semibold text-graphite mb-4">Recent Activity</h2>
        {recentDeals.length === 0 ? (
          <p className="text-graphite/50 font-sans text-sm">No deals yet.</p>
        ) : (
          <div className="bg-white rounded-2xl border border-graphite/8 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans">
                <thead>
                  <tr className="border-b border-graphite/8">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-graphite/50 uppercase tracking-wider">Deal</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-graphite/50 uppercase tracking-wider">Value</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-graphite/50 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-graphite/50 uppercase tracking-wider">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-graphite/5">
                  {recentDeals.map((d) => (
                    <tr key={d.id} className="hover:bg-mn-surface/50 transition-colors">
                      <td className="px-4 py-3">
                        <Link to={`/portal/sales/deals/${d.id}`} className="text-graphite font-medium hover:text-accent transition-colors">
                          {d.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-graphite/70">{formatCurrency(d.value)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={d.status} />
                      </td>
                      <td className="px-4 py-3 text-graphite/50 text-xs">
                        {new Date(d.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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

function StatusBadge({ status }: { status: string }) {
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
