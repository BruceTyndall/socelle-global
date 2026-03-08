import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  DollarSign,
  TrendingUp,
  Target,
  Clock,
  BarChart3,
  Zap,
  ArrowRight,
  Download,
} from 'lucide-react';
import { useDeals } from '../../lib/useDeals';
import { usePipelines } from '../../lib/usePipelines';
import { exportToCSV } from '../../lib/csvExport';

// ── V2-HUBS-09: Revenue Analytics ───────────────────────────────────────
// Data source: deals + sales_pipelines (LIVE when DB-connected)
// Pipeline coverage, conversion rates by stage, cycle time, intelligence attribution.

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

function daysBetween(from: string, to: string) {
  return Math.max(0, Math.floor((new Date(to).getTime() - new Date(from).getTime()) / 86400000));
}

interface StageConversion {
  name: string;
  color: string | null;
  entered: number;
  exited: number;
  conversionRate: number;
  avgValue: number;
}

export default function RevenueAnalytics() {
  const { deals, loading: dealsLoading, isLive: dealsLive, error: dealsError, reload: dealsReload } = useDeals();
  const { pipelines, loading: pipelinesLoading, error: pipelinesError, reload: pipelinesReload } = usePipelines();
  const loading = dealsLoading || pipelinesLoading;
  const isLive = dealsLive;
  const error = dealsError || pipelinesError;

  const defaultPipeline = pipelines.find((p) => p.is_default) ?? pipelines[0];
  const stages = defaultPipeline?.stages ?? [];

  // Core metrics
  const metrics = useMemo(() => {
    const wonDeals = deals.filter((d) => d.status === 'won');
    const lostDeals = deals.filter((d) => d.status === 'lost');
    const openDeals = deals.filter((d) => d.status === 'open');
    const closedDeals = [...wonDeals, ...lostDeals];

    const totalRevenue = wonDeals.reduce((s, d) => s + d.value, 0);
    const pipelineValue = openDeals.reduce((s, d) => s + d.value, 0);
    const winRate = closedDeals.length > 0
      ? Math.round((wonDeals.length / closedDeals.length) * 100) : 0;

    const quarterlyTarget = totalRevenue > 0 ? totalRevenue * 4 : 100000;
    const coverageRatio = quarterlyTarget > 0 ? pipelineValue / (quarterlyTarget / 4) : 0;

    const cycleTimes = wonDeals.map((d) => daysBetween(d.created_at, d.updated_at));
    const avgCycleTime = cycleTimes.length > 0
      ? Math.round(cycleTimes.reduce((s, t) => s + t, 0) / cycleTimes.length) : 0;

    const avgDealSize = wonDeals.length > 0
      ? wonDeals.reduce((s, d) => s + d.value, 0) / wonDeals.length : 0;

    const intellDeals = wonDeals.filter((d) => d.title.includes('[Signal]'));
    const intellRevenue = intellDeals.reduce((s, d) => s + d.value, 0);
    const intellPct = totalRevenue > 0 ? Math.round((intellRevenue / totalRevenue) * 100) : 0;

    return {
      totalRevenue,
      pipelineValue,
      winRate,
      coverageRatio,
      avgCycleTime,
      avgDealSize,
      wonCount: wonDeals.length,
      lostCount: lostDeals.length,
      openCount: openDeals.length,
      intellDeals: intellDeals.length,
      intellRevenue,
      intellPct,
    };
  }, [deals]);

  // Conversion rates by stage
  const stageConversions = useMemo((): StageConversion[] => {
    if (stages.length === 0) return [];

    return stages.map((stage, idx) => {
      const inStage = deals.filter((d) => d.stage_id === stage.id);
      const entered = deals.filter((d) => {
        const stageIdx = stages.findIndex((s) => s.id === d.stage_id);
        return stageIdx >= idx || d.status === 'won' || d.status === 'lost';
      });
      const exited = entered.filter((d) => {
        const stageIdx = stages.findIndex((s) => s.id === d.stage_id);
        return stageIdx > idx || d.status === 'won' || d.status === 'lost';
      });
      const conversionRate = entered.length > 0 ? Math.round((exited.length / entered.length) * 100) : 0;
      const avgValue = inStage.length > 0 ? inStage.reduce((s, d) => s + d.value, 0) / inStage.length : 0;

      return {
        name: stage.name,
        color: stage.color,
        entered: entered.length,
        exited: exited.length,
        conversionRate,
        avgValue,
      };
    });
  }, [stages, deals]);

  // Monthly revenue trend (last 6 months)
  const monthlyRevenue = useMemo(() => {
    const wonDeals = deals.filter((d) => d.status === 'won');
    const months: { label: string; revenue: number; deals: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const label = monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const mDeals = wonDeals.filter((d) => {
        const dt = new Date(d.updated_at);
        return dt >= monthStart && dt <= monthEnd;
      });
      months.push({
        label,
        revenue: mDeals.reduce((s, d) => s + d.value, 0),
        deals: mDeals.length,
      });
    }
    return months;
  }, [deals]);

  const maxMonthlyRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue), 1);

  // Top deals by value
  const topDeals = useMemo(() => {
    return [...deals]
      .filter((d) => d.status === 'open')
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [deals]);

  // Win/loss reasons
  const reasons = useMemo(() => {
    const wonReasons: Record<string, number> = {};
    const lostReasons: Record<string, number> = {};
    for (const d of deals) {
      if (d.status === 'won' && d.won_reason) {
        const key = d.won_reason.slice(0, 50);
        wonReasons[key] = (wonReasons[key] ?? 0) + 1;
      }
      if (d.status === 'lost' && d.lost_reason) {
        const key = d.lost_reason.slice(0, 50);
        lostReasons[key] = (lostReasons[key] ?? 0) + 1;
      }
    }
    return { wonReasons, lostReasons };
  }, [deals]);

  const handleExport = () => {
    const exportData = deals.map((d) => ({
      title: d.title,
      value: d.value,
      status: d.status,
      probability: d.probability,
      contact: d.contact_name ?? '',
      company: d.company_name ?? '',
      expected_close: d.expected_close_date ?? '',
      won_reason: d.won_reason ?? '',
      lost_reason: d.lost_reason ?? '',
      created: d.created_at,
      updated: d.updated_at,
    }));
    exportToCSV(exportData, 'revenue-analytics');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header skeleton */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="h-8 w-56 bg-graphite/8 rounded-lg animate-pulse" />
            <div className="h-4 w-80 bg-graphite/5 rounded-lg animate-pulse mt-2" />
          </div>
          <div className="h-10 w-40 bg-graphite/8 rounded-full animate-pulse" />
        </div>
        {/* KPI strip skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-graphite/8 p-4">
              <div className="h-3 w-16 bg-graphite/8 rounded animate-pulse mb-2" />
              <div className="h-6 w-24 bg-graphite/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
        {/* Attribution skeleton */}
        <div className="bg-accent/5 rounded-2xl border border-accent/15 p-6">
          <div className="h-5 w-48 bg-graphite/8 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div className="h-3 w-28 bg-graphite/8 rounded animate-pulse mb-2" />
                <div className="h-7 w-20 bg-graphite/5 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-graphite/8 p-6">
              <div className="h-5 w-48 bg-graphite/8 rounded animate-pulse mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-6 bg-graphite/5 rounded-full animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-signal-down/5 border border-signal-down/20 rounded-xl p-6 text-center">
          <AlertCircle className="w-8 h-8 text-signal-down mx-auto mb-2" />
          <p className="text-graphite font-medium">Something went wrong</p>
          <p className="text-graphite/60 text-sm mt-1">{error}</p>
          <button onClick={() => { dealsReload(); pipelinesReload(); }} className="mt-3 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover text-sm">
            Try again
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
            <BarChart3 className="w-6 h-6 text-accent" />
            <h1 className="text-3xl font-sans font-semibold text-graphite">
              Revenue Analytics
            </h1>
            {!isLive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-signal-warn/10 text-signal-warn font-sans">
                <AlertCircle className="w-3 h-3" />
                DEMO
              </span>
            )}
          </div>
          <p className="text-graphite/60 font-sans mt-1">Pipeline health, conversion rates, and revenue attribution.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-accent hover:text-accent-hover border border-accent/20 rounded-lg hover:bg-accent-soft transition-colors">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <Link
            to="/sales/opportunities"
            className="inline-flex items-center gap-2 h-10 px-5 border border-graphite/15 text-graphite text-sm font-sans font-semibold rounded-full hover:bg-mn-surface transition-colors"
          >
            <Zap className="w-4 h-4" />
            Find Opportunities
          </Link>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Revenue', value: formatCurrency(metrics.totalRevenue), icon: DollarSign, color: 'text-signal-up' },
          { label: 'Pipeline Value', value: formatCurrency(metrics.pipelineValue), icon: TrendingUp, color: 'text-accent' },
          { label: 'Win Rate', value: `${metrics.winRate}%`, icon: Target, color: 'text-accent' },
          { label: 'Coverage Ratio', value: `${metrics.coverageRatio.toFixed(1)}x`, icon: BarChart3, color: metrics.coverageRatio >= 3 ? 'text-signal-up' : metrics.coverageRatio >= 1.5 ? 'text-signal-warn' : 'text-signal-down' },
          { label: 'Avg Cycle Time', value: `${metrics.avgCycleTime}d`, icon: Clock, color: 'text-graphite/70' },
          { label: 'Avg Deal Size', value: formatCurrency(metrics.avgDealSize), icon: DollarSign, color: 'text-graphite/70' },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-2xl border border-graphite/8 p-4">
            <div className="flex items-center gap-2 mb-1">
              <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
              <span className="text-[10px] font-sans text-graphite/50 uppercase tracking-wider">{m.label}</span>
            </div>
            <p className="text-xl font-sans font-semibold text-graphite">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Intelligence Attribution */}
      <div className="bg-accent/5 rounded-2xl border border-accent/15 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-sans font-semibold text-graphite">Intelligence Attribution</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className="text-xs font-sans text-graphite/50 uppercase tracking-wider">Deals from Signals</p>
            <p className="text-2xl font-sans font-semibold text-graphite mt-1">{metrics.intellDeals}</p>
          </div>
          <div>
            <p className="text-xs font-sans text-graphite/50 uppercase tracking-wider">Revenue from Signals</p>
            <p className="text-2xl font-sans font-semibold text-graphite mt-1">{formatCurrency(metrics.intellRevenue)}</p>
          </div>
          <div>
            <p className="text-xs font-sans text-graphite/50 uppercase tracking-wider">% Revenue from Intelligence</p>
            <p className="text-2xl font-sans font-semibold text-graphite mt-1">{metrics.intellPct}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Revenue Trend */}
        <div className="bg-white rounded-2xl border border-graphite/8 p-6">
          <h2 className="text-base font-sans font-semibold text-graphite mb-4">Monthly Revenue (Last 6 Months)</h2>
          <div className="space-y-3">
            {monthlyRevenue.map((m) => (
              <div key={m.label} className="flex items-center gap-3">
                <span className="w-14 text-xs font-sans text-graphite/50 flex-shrink-0">{m.label}</span>
                <div className="flex-1 bg-mn-surface rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full bg-accent/40 rounded-full flex items-center px-2"
                    style={{ width: `${Math.max((m.revenue / maxMonthlyRevenue) * 100, 2)}%` }}
                  >
                    {m.revenue > 0 && (
                      <span className="text-[10px] font-sans font-semibold text-graphite whitespace-nowrap">
                        {formatCurrency(m.revenue)}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-xs font-sans text-graphite/40 w-12 text-right flex-shrink-0">{m.deals} deals</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stage Conversion Funnel */}
        <div className="bg-white rounded-2xl border border-graphite/8 p-6">
          <h2 className="text-base font-sans font-semibold text-graphite mb-4">Stage Conversion Rates</h2>
          {stageConversions.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-accent-soft rounded-xl flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-accent" />
              </div>
              <p className="text-sm font-sans text-graphite/50">No pipeline stages configured.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stageConversions.map((sc, idx) => (
                <div key={sc.name} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-28 flex-shrink-0">
                    {sc.color && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: sc.color }} />}
                    <span className="text-xs font-sans text-graphite/70 truncate">{sc.name}</span>
                  </div>
                  <div className="flex-1 bg-mn-surface rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${sc.conversionRate}%`,
                        backgroundColor: sc.color ?? '#6E879B',
                        opacity: 0.6,
                      }}
                    />
                  </div>
                  <span className="text-xs font-sans font-semibold text-graphite w-10 text-right flex-shrink-0">
                    {sc.conversionRate}%
                  </span>
                  {idx < stageConversions.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-graphite/20 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Open Deals */}
        <div className="bg-white rounded-2xl border border-graphite/8 overflow-hidden">
          <div className="px-5 py-3 border-b border-graphite/8">
            <h2 className="text-base font-sans font-semibold text-graphite">Top Open Deals</h2>
          </div>
          {topDeals.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-accent-soft rounded-xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <p className="text-sm font-sans font-medium text-graphite">No open deals</p>
              <p className="text-xs font-sans text-graphite/50 mt-1">Open deals will appear here ranked by value.</p>
            </div>
          ) : (
            <div className="divide-y divide-graphite/5">
              {topDeals.map((d) => (
                <Link
                  key={d.id}
                  to={`/sales/deals/${d.id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-mn-surface/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-sans font-medium text-graphite truncate">{d.title}</p>
                    <p className="text-xs font-sans text-graphite/40 mt-0.5">
                      {d.probability}% prob
                      {d.expected_close_date && ` | Close: ${new Date(d.expected_close_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                    </p>
                  </div>
                  <span className="text-sm font-sans font-semibold text-graphite ml-3">{formatCurrency(d.value)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Win/Loss Reasons */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-graphite/8 p-5">
            <h3 className="text-base font-sans font-semibold text-graphite mb-3">
              Win Reasons ({metrics.wonCount} deals)
            </h3>
            {Object.keys(reasons.wonReasons).length === 0 ? (
              <p className="text-sm font-sans text-graphite/40">No win reasons recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(reasons.wonReasons)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([reason, count]) => (
                    <div key={reason} className="flex items-center gap-2">
                      <span className="text-xs font-sans text-graphite/60 flex-1 truncate">{reason}</span>
                      <span className="text-xs font-sans font-semibold text-signal-up">{count}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-graphite/8 p-5">
            <h3 className="text-base font-sans font-semibold text-graphite mb-3">
              Loss Reasons ({metrics.lostCount} deals)
            </h3>
            {Object.keys(reasons.lostReasons).length === 0 ? (
              <p className="text-sm font-sans text-graphite/40">No loss reasons recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(reasons.lostReasons)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([reason, count]) => (
                    <div key={reason} className="flex items-center gap-2">
                      <span className="text-xs font-sans text-graphite/60 flex-1 truncate">{reason}</span>
                      <span className="text-xs font-sans font-semibold text-signal-down">{count}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Deal Velocity */}
      <div className="bg-white rounded-2xl border border-graphite/8 p-6">
        <h2 className="text-base font-sans font-semibold text-graphite mb-4">Deal Status Distribution</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex rounded-full h-6 overflow-hidden bg-mn-surface">
              {metrics.wonCount + metrics.lostCount + metrics.openCount > 0 && (
                <>
                  {metrics.wonCount > 0 && (
                    <div
                      className="bg-signal-up/60 h-full flex items-center justify-center"
                      style={{ width: `${(metrics.wonCount / (metrics.wonCount + metrics.lostCount + metrics.openCount)) * 100}%` }}
                    >
                      <span className="text-[10px] font-sans font-semibold text-graphite whitespace-nowrap px-1">Won</span>
                    </div>
                  )}
                  {metrics.openCount > 0 && (
                    <div
                      className="bg-accent/30 h-full flex items-center justify-center"
                      style={{ width: `${(metrics.openCount / (metrics.wonCount + metrics.lostCount + metrics.openCount)) * 100}%` }}
                    >
                      <span className="text-[10px] font-sans font-semibold text-graphite whitespace-nowrap px-1">Open</span>
                    </div>
                  )}
                  {metrics.lostCount > 0 && (
                    <div
                      className="bg-signal-down/40 h-full flex items-center justify-center"
                      style={{ width: `${(metrics.lostCount / (metrics.wonCount + metrics.lostCount + metrics.openCount)) * 100}%` }}
                    >
                      <span className="text-[10px] font-sans font-semibold text-graphite whitespace-nowrap px-1">Lost</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex gap-4 text-xs font-sans text-graphite/50">
            <span>{metrics.wonCount} won</span>
            <span>{metrics.openCount} open</span>
            <span>{metrics.lostCount} lost</span>
          </div>
        </div>
      </div>
    </div>
  );
}
