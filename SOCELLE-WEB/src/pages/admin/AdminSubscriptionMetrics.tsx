import { useEffect, useState, useCallback } from 'react';
import {
  DollarSign, Users, BarChart3, PieChart, Activity, Loader2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { MODULE_KEYS } from '../../modules/_core/context/ModuleAccessContext';
import { getModuleMeta } from '../../modules/_core/components/UpgradePrompt';

// ── Types ───────────────────────────────────────────────────────────────────

interface PlanMetric {
  plan_name: string;
  count: number;
  mrr: number;
  color: string;
}

interface ModuleMetric {
  module_key: string;
  label: string;
  count: number;
  percent: number;
}

interface SubEvent {
  id: string;
  account_id: string;
  status: string;
  plan_name: string;
  created_at: string;
}

const PLAN_COLORS = ['bg-accent', 'bg-blue-500', 'bg-green-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500'];

// ── Page ────────────────────────────────────────────────────────────────────

export default function AdminSubscriptionMetrics() {
  const [loading, setLoading] = useState(true);
  const [totalMrr, setTotalMrr] = useState(0);
  const [totalAccounts, setTotalAccounts] = useState(0);
  const [planMetrics, setPlanMetrics] = useState<PlanMetric[]>([]);
  const [moduleMetrics, setModuleMetrics] = useState<ModuleMetric[]>([]);
  const [recentEvents, setRecentEvents] = useState<SubEvent[]>([]);

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all active subscriptions with plan info
      const { data: subs } = await supabase
        .from('account_subscriptions')
        .select(`
          id, account_id, status, created_at,
          plan:subscription_plans (id, name, price_monthly)
        `)
        .in('status', ['active', 'trialing']);

      const subList = subs ?? [];
      const activeCount = subList.length;
      setTotalAccounts(activeCount);

      // Plan distribution + MRR
      const planMap: Record<string, { name: string; count: number; mrr: number }> = {};
      let mrr = 0;

      subList.forEach((s: Record<string, unknown>) => {
        const planObj = Array.isArray(s.plan) ? s.plan[0] : s.plan;
        const planId = (planObj as Record<string, unknown>)?.id as string ?? 'unknown';
        const planName = (planObj as Record<string, unknown>)?.name as string ?? 'Unknown';
        const price = (planObj as Record<string, unknown>)?.price_monthly as number ?? 0;

        if (!planMap[planId]) planMap[planId] = { name: planName, count: 0, mrr: 0 };
        planMap[planId].count += 1;
        planMap[planId].mrr += price;
        mrr += price;
      });

      setTotalMrr(mrr);
      setPlanMetrics(
        Object.values(planMap).map((p, i) => ({
          plan_name: p.name,
          count: p.count,
          mrr: p.mrr,
          color: PLAN_COLORS[i % PLAN_COLORS.length],
        })),
      );

      // Module adoption
      const { data: accessData } = await supabase
        .from('account_module_access')
        .select('module_key, account_id')
        .eq('is_active', true);

      const moduleMap: Record<string, Set<string>> = {};
      (accessData ?? []).forEach((a: { module_key: string; account_id: string }) => {
        if (!moduleMap[a.module_key]) moduleMap[a.module_key] = new Set();
        moduleMap[a.module_key].add(a.account_id);
      });

      setModuleMetrics(
        MODULE_KEYS.map((key) => {
          const count = moduleMap[key]?.size ?? 0;
          return {
            module_key: key,
            label: getModuleMeta(key).label,
            count,
            percent: activeCount > 0 ? Math.round((count / activeCount) * 100) : 0,
          };
        }).sort((a, b) => b.count - a.count),
      );

      // Recent events (last 20 subscription records)
      const { data: events } = await supabase
        .from('account_subscriptions')
        .select(`
          id, account_id, status, created_at,
          plan:subscription_plans (name)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      setRecentEvents(
        (events ?? []).map((e: Record<string, unknown>) => {
          const planObj = Array.isArray(e.plan) ? e.plan[0] : e.plan;
          return {
            id: e.id as string,
            account_id: (e.account_id as string).slice(0, 8) + '...',
            status: e.status as string,
            plan_name: (planObj as Record<string, unknown>)?.name as string ?? 'Unknown',
            created_at: e.created_at as string,
          };
        }),
      );
    } catch (err) {
      console.warn('[AdminSubscriptionMetrics] error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-5 h-5 text-graphite/30 animate-spin" />
      </div>
    );
  }

  const donutTotal = planMetrics.reduce((s, p) => s + p.count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-graphite">Subscription Metrics</h1>
          <p className="text-sm text-graphite/50 mt-1">Revenue and adoption overview</p>
        </div>
        <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
          DEMO
        </span>
      </div>

      {/* Metric cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-graphite/10 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-xs font-medium text-graphite/40 uppercase tracking-wider">Total MRR</p>
          </div>
          <p className="text-2xl font-bold text-graphite">${totalMrr.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-2xl border border-graphite/10 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xs font-medium text-graphite/40 uppercase tracking-wider">Active Accounts</p>
          </div>
          <p className="text-2xl font-bold text-graphite">{totalAccounts}</p>
        </div>

        <div className="bg-white rounded-2xl border border-graphite/10 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-accent" />
            </div>
            <p className="text-xs font-medium text-graphite/40 uppercase tracking-wider">Avg Revenue / Account</p>
          </div>
          <p className="text-2xl font-bold text-graphite">
            ${totalAccounts > 0 ? Math.round(totalMrr / totalAccounts) : 0}
          </p>
        </div>
      </div>

      {/* MRR by plan + Plan distribution */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* MRR by plan */}
        <div className="bg-white rounded-2xl border border-graphite/10 p-6">
          <h3 className="text-sm font-semibold text-graphite mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-graphite/30" />
            MRR by Plan
          </h3>
          {planMetrics.length === 0 ? (
            <p className="text-sm text-graphite/40 py-4 text-center">No data</p>
          ) : (
            <div className="space-y-3">
              {planMetrics.map((p) => (
                <div key={p.plan_name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-graphite">{p.plan_name}</span>
                    <span className="font-medium text-graphite">${p.mrr}/mo</span>
                  </div>
                  <div className="h-2 bg-graphite/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${p.color} transition-all`}
                      style={{ width: totalMrr > 0 ? `${(p.mrr / totalMrr) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Plan distribution (div-based donut) */}
        <div className="bg-white rounded-2xl border border-graphite/10 p-6">
          <h3 className="text-sm font-semibold text-graphite mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-graphite/30" />
            Plan Distribution
          </h3>
          {planMetrics.length === 0 ? (
            <p className="text-sm text-graphite/40 py-4 text-center">No data</p>
          ) : (
            <div className="flex items-center gap-6">
              {/* Stacked bar as simple visual */}
              <div className="flex-1">
                <div className="h-8 rounded-full overflow-hidden flex">
                  {planMetrics.map((p) => (
                    <div
                      key={p.plan_name}
                      className={`${p.color} transition-all`}
                      style={{ width: donutTotal > 0 ? `${(p.count / donutTotal) * 100}%` : '0%' }}
                      title={`${p.plan_name}: ${p.count}`}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-3 mt-4">
                  {planMetrics.map((p) => (
                    <div key={p.plan_name} className="flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${p.color}`} />
                      <span className="text-xs text-graphite/60">
                        {p.plan_name} ({p.count})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Module adoption */}
      <div className="bg-white rounded-2xl border border-graphite/10 p-6">
        <h3 className="text-sm font-semibold text-graphite mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-graphite/30" />
          Module Adoption
        </h3>
        {moduleMetrics.length === 0 ? (
          <p className="text-sm text-graphite/40 py-4 text-center">No data</p>
        ) : (
          <div className="space-y-3">
            {moduleMetrics.map((m) => (
              <div key={m.module_key}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-graphite">{m.label}</span>
                  <span className="text-graphite/50">
                    {m.count} accounts ({m.percent}%)
                  </span>
                </div>
                <div className="h-2 bg-graphite/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${m.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent events */}
      <div className="bg-white rounded-2xl border border-graphite/10 p-6">
        <h3 className="text-sm font-semibold text-graphite mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-graphite/30" />
          Recent Subscription Events
        </h3>
        {recentEvents.length === 0 ? (
          <p className="text-sm text-graphite/40 py-4 text-center">No events</p>
        ) : (
          <div className="space-y-2">
            {recentEvents.map((e) => {
              const statusColors: Record<string, string> = {
                active: 'text-green-600',
                trialing: 'text-blue-600',
                past_due: 'text-red-600',
                canceled: 'text-graphite/40',
              };
              return (
                <div key={e.id} className="flex items-center gap-3 text-sm py-2 border-b border-graphite/5 last:border-0">
                  <span className={`text-xs font-semibold uppercase ${statusColors[e.status] ?? 'text-graphite/40'}`}>
                    {e.status}
                  </span>
                  <span className="text-graphite/50">{e.account_id}</span>
                  <span className="text-graphite">{e.plan_name}</span>
                  <span className="text-graphite/30 ml-auto text-xs">
                    {new Date(e.created_at).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
