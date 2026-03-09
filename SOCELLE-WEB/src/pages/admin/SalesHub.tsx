import { useState, useMemo } from 'react';
import {
  ShoppingBag,
  RefreshCw,
  ShieldAlert,
  AlertCircle,
  DollarSign,
  Clock,
  CheckCircle,
  Package,
  XCircle,
  Target,
  Settings,
  TrendingUp,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useDeals, type Deal } from '../../lib/useDeals';
import { usePipelines } from '../../lib/usePipelines';
import { useCommissions } from '../../lib/useCommissions';
import ErrorState from '../../components/ErrorState';
import { PageLoadingSkeleton } from '../../components/ui';

// ── WO-OVERHAUL-14: Admin Sales Hub — expanded with deals, pipeline config,
//    commission rules, and payout approvals ─────────────────────────────────
// Data source: orders (LIVE), deals (LIVE), sales_pipelines (LIVE),
//              commission_rules (LIVE), commission_payouts (LIVE)

interface Order {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  commission_total: number;
  created_at: string;
  updated_at: string;
  brand_id: string | null;
  business_id: string | null;
}

type AdminTab = 'orders' | 'deals' | 'pipeline' | 'commissions';

const STATUS_COLORS: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-800',
  reviewing: 'bg-amber-100 text-amber-800',
  sent_to_brand: 'bg-purple-100 text-purple-800',
  confirmed: 'bg-green-100 text-green-800',
  fulfilled: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
};

const STATUS_ICONS: Record<string, typeof Clock> = {
  submitted: Clock,
  reviewing: Clock,
  sent_to_brand: Package,
  confirmed: CheckCircle,
  fulfilled: CheckCircle,
  cancelled: XCircle,
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export default function SalesHub() {
  const [tab, setTab] = useState<AdminTab>('orders');
  const [orderFilter, setOrderFilter] = useState<string>('all');

  const { deals, loading: dealsLoading, isLive: dealsLive } = useDeals();
  const { pipelines, loading: pipelinesLoading, isLive: pipelinesLive } = usePipelines();
  const { rules, payouts, loading: commissionsLoading, isLive: commissionsLive } = useCommissions();

  const { data: ordersResult, isLoading: ordersLoading, error: ordersQueryError, refetch: refetchOrders } = useQuery({
    queryKey: ['admin', 'sales-orders', orderFilter],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select('id, order_number, status, subtotal, commission_total, created_at, updated_at, brand_id, business_id')
        .order('created_at', { ascending: false })
        .limit(100);
      if (orderFilter !== 'all') query = query.eq('status', orderFilter);
      const { data, error: dbError } = await query;
      if (dbError) {
        if ((dbError as { code?: string }).code === '42P01' || dbError.message?.toLowerCase().includes('does not exist')) {
          return { orders: [] as Order[], isLive: false };
        }
        throw dbError;
      }
      return { orders: (data ?? []) as Order[], isLive: true };
    },
  });

  const orders = ordersResult?.orders ?? [];
  const ordersLive = ordersResult?.isLive ?? false;
  const ordersError = ordersQueryError ? 'Failed to load orders.' : null;

  const totalRevenue = orders.reduce((s, r) => s + (r.subtotal || 0), 0);
  const totalCommission = orders.reduce((s, r) => s + (r.commission_total || 0), 0);

  const dealMetrics = useMemo(() => {
    const open = deals.filter((d) => d.status === 'open');
    const won = deals.filter((d) => d.status === 'won');
    const totalPipeline = open.reduce((s, d) => s + d.value, 0);
    const totalWon = won.reduce((s, d) => s + d.value, 0);
    return { openCount: open.length, wonCount: won.length, totalPipeline, totalWon };
  }, [deals]);

  const pendingPayouts = payouts.filter((p) => p.status === 'pending');

  if (ordersError && tab === 'orders') {
    return (
      <ErrorState
        icon={ShieldAlert}
        title="Sales Hub Unavailable"
        message={ordersError}
        action={{ label: 'Retry', onClick: () => void refetchOrders() }}
      />
    );
  }

  const isLive = tab === 'orders' ? ordersLive : tab === 'deals' ? dealsLive : tab === 'pipeline' ? pipelinesLive : commissionsLive;
  const isLoading = tab === 'orders' ? ordersLoading : tab === 'deals' ? dealsLoading : tab === 'pipeline' ? pipelinesLoading : commissionsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-sans text-graphite">
              Sales Hub<span className="text-accent">.</span>
            </h1>
            {!isLive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 font-sans">
                <AlertCircle className="w-3 h-3" />
                DEMO
              </span>
            )}
          </div>
          <p className="text-graphite/60 font-sans mt-1">
            Orders, deals, pipeline configuration, and commission management
          </p>
        </div>
        <button
          type="button"
          onClick={tab === 'orders' ? () => void refetchOrders() : undefined}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-accent-soft text-graphite hover:bg-accent-soft disabled:opacity-60 font-sans text-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 bg-accent-soft/40 rounded-xl p-1 w-fit flex-wrap">
        {([
          { key: 'orders' as const, label: 'Orders', icon: ShoppingBag },
          { key: 'deals' as const, label: 'All Deals', icon: Target },
          { key: 'pipeline' as const, label: 'Pipeline Config', icon: Settings },
          { key: 'commissions' as const, label: 'Commissions', icon: DollarSign },
        ]).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium font-sans transition-colors ${
              tab === t.key ? 'bg-white text-graphite shadow-sm' : 'text-graphite/60 hover:text-graphite'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Orders Tab ── */}
      {tab === 'orders' && (
        <>
          {ordersLive && !ordersLoading && orders.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-3">
              <MetricCard label="Total Orders" value={String(orders.length)} icon={ShoppingBag} />
              <MetricCard label="Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} />
              <MetricCard label="Commission" value={formatCurrency(totalCommission)} icon={DollarSign} />
            </div>
          )}

          <div className="flex gap-1 bg-accent-soft/40 rounded-xl p-1 w-fit flex-wrap">
            {(['all', 'submitted', 'reviewing', 'confirmed', 'fulfilled', 'cancelled'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setOrderFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium font-sans transition-colors ${
                  orderFilter === f ? 'bg-white text-graphite shadow-sm' : 'text-graphite/60 hover:text-graphite'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {ordersLoading ? (
            <PageLoadingSkeleton />
          ) : !ordersLive ? (
            <PlaceholderCard title="Orders" message="Orders table not available. Connect Supabase to activate." />
          ) : orders.length === 0 ? (
            <EmptyState label={orderFilter === 'all' ? 'No orders yet.' : `No ${orderFilter} orders.`} />
          ) : (
            <div className="bg-white border border-accent-soft rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-sans">
                  <thead>
                    <tr className="border-b border-accent-soft bg-accent-soft/50">
                      <th className="text-left px-4 py-3 font-medium text-graphite">Order #</th>
                      <th className="text-left px-4 py-3 font-medium text-graphite">Status</th>
                      <th className="text-right px-4 py-3 font-medium text-graphite">Subtotal</th>
                      <th className="text-right px-4 py-3 font-medium text-graphite">Commission</th>
                      <th className="text-left px-4 py-3 font-medium text-graphite">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-accent-soft/50">
                    {orders.map((row) => {
                      const StatusIcon = STATUS_ICONS[row.status] || Clock;
                      return (
                        <tr key={row.id} className="hover:bg-accent-soft/30 transition-colors">
                          <td className="px-4 py-3">
                            <span className="text-graphite font-medium font-mono text-xs">{row.order_number}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[row.status] || 'bg-accent-soft text-graphite'}`}>
                              <StatusIcon className="w-3 h-3" />
                              {row.status.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-graphite font-mono text-xs">{formatCurrency(row.subtotal)}</td>
                          <td className="px-4 py-3 text-right text-graphite/60 font-mono text-xs">{formatCurrency(row.commission_total)}</td>
                          <td className="px-4 py-3 text-graphite/60 text-xs">{formatDate(row.created_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Deals Tab ── */}
      {tab === 'deals' && (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            <MetricCard label="Open Deals" value={String(dealMetrics.openCount)} icon={Target} />
            <MetricCard label="Pipeline Value" value={formatCurrency(dealMetrics.totalPipeline)} icon={TrendingUp} />
            <MetricCard label="Won Deals" value={String(dealMetrics.wonCount)} icon={CheckCircle} />
            <MetricCard label="Won Revenue" value={formatCurrency(dealMetrics.totalWon)} icon={DollarSign} />
          </div>

          {dealsLoading ? (
            <PageLoadingSkeleton />
          ) : !dealsLive ? (
            <PlaceholderCard title="Deals" message="Deals table not available. Connect Supabase to activate." />
          ) : deals.length === 0 ? (
            <EmptyState label="No deals yet." />
          ) : (
            <div className="bg-white border border-accent-soft rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-sans">
                  <thead>
                    <tr className="border-b border-accent-soft bg-accent-soft/50">
                      <th className="text-left px-4 py-3 font-medium text-graphite">Title</th>
                      <th className="text-left px-4 py-3 font-medium text-graphite">Contact</th>
                      <th className="text-right px-4 py-3 font-medium text-graphite">Value</th>
                      <th className="text-left px-4 py-3 font-medium text-graphite">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-graphite">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-accent-soft/50">
                    {deals.map((d: Deal) => (
                      <tr key={d.id} className="hover:bg-accent-soft/30 transition-colors">
                        <td className="px-4 py-3 text-graphite font-medium">{d.title}</td>
                        <td className="px-4 py-3 text-graphite/60 text-xs">{d.contact_name ?? '--'}</td>
                        <td className="px-4 py-3 text-right text-graphite font-mono text-xs">{formatCurrency(d.value)}</td>
                        <td className="px-4 py-3">
                          <DealStatusBadge status={d.status} />
                        </td>
                        <td className="px-4 py-3 text-graphite/60 text-xs">{formatDate(d.updated_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Pipeline Config Tab ── */}
      {tab === 'pipeline' && (
        <>
          {pipelinesLoading ? (
            <PageLoadingSkeleton />
          ) : !pipelinesLive ? (
            <PlaceholderCard title="Pipeline Configuration" message="Pipeline tables not available. Connect Supabase to activate." />
          ) : pipelines.length === 0 ? (
            <EmptyState label="No pipelines configured." />
          ) : (
            <div className="space-y-6">
              {pipelines.map((p) => (
                <div key={p.id} className="bg-white border border-accent-soft rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-sans text-graphite">{p.name}</h3>
                    {p.is_default && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-accent-soft text-graphite">Default</span>
                    )}
                  </div>
                  {p.description && <p className="text-graphite/60 font-sans text-sm">{p.description}</p>}
                  <div className="flex flex-wrap gap-2">
                    {p.stages.map((s, si) => (
                      <div key={s.id} className="flex items-center gap-2 px-3 py-2 bg-accent-soft/50 rounded-lg">
                        <span className="text-xs font-mono text-graphite/60">{si + 1}</span>
                        {s.color && <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />}
                        <span className="text-sm font-sans text-graphite">{s.name}</span>
                        {s.is_won && <CheckCircle className="w-3 h-3 text-green-600" />}
                        {s.is_lost && <XCircle className="w-3 h-3 text-red-600" />}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Commissions Tab ── */}
      {tab === 'commissions' && (
        <>
          {commissionsLoading ? (
            <PageLoadingSkeleton />
          ) : !commissionsLive ? (
            <PlaceholderCard title="Commissions" message="Commission tables not available. Connect Supabase to activate." />
          ) : (
            <div className="space-y-6">
              {/* Rules */}
              <div>
                <h3 className="text-lg font-sans text-graphite mb-3">Commission Rules</h3>
                {rules.length === 0 ? (
                  <EmptyState label="No commission rules configured." />
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {rules.map((r) => (
                      <div key={r.id} className="bg-white border border-accent-soft rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-sans font-medium text-graphite">{r.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.is_active ? 'bg-green-100 text-green-800' : 'bg-accent-soft text-graphite/60'}`}>
                            {r.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-lg font-sans text-graphite">
                          {r.rate_type === 'percentage' ? `${r.rate_value}%` : formatCurrency(r.rate_value)}
                        </p>
                        <p className="text-xs font-sans text-graphite/60 mt-1">{r.applies_to ?? 'All deals'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending approvals */}
              <div>
                <h3 className="text-lg font-sans text-graphite mb-3">
                  Pending Payout Approvals ({pendingPayouts.length})
                </h3>
                {pendingPayouts.length === 0 ? (
                  <EmptyState label="No payouts pending approval." />
                ) : (
                  <div className="bg-white border border-accent-soft rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm font-sans">
                        <thead>
                          <tr className="border-b border-accent-soft bg-accent-soft/50">
                            <th className="text-left px-4 py-3 font-medium text-graphite">Deal</th>
                            <th className="text-right px-4 py-3 font-medium text-graphite">Amount</th>
                            <th className="text-left px-4 py-3 font-medium text-graphite">Status</th>
                            <th className="text-left px-4 py-3 font-medium text-graphite">Created</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-accent-soft/50">
                          {pendingPayouts.map((p) => (
                            <tr key={p.id} className="hover:bg-accent-soft/30 transition-colors">
                              <td className="px-4 py-3 text-graphite font-mono text-xs">{p.deal_id.slice(0, 8)}...</td>
                              <td className="px-4 py-3 text-right text-graphite font-mono text-xs">{formatCurrency(p.amount)}</td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">{p.status}</span>
                              </td>
                              <td className="px-4 py-3 text-graphite/60 text-xs">{formatDate(p.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────

function MetricCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof ShoppingBag }) {
  return (
    <div className="bg-white border border-accent-soft rounded-xl p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-graphite/60 font-sans">{label}</p>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-accent-soft text-graphite">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-sans text-graphite">{value}</p>
    </div>
  );
}

function DealStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    open: 'bg-blue-100 text-blue-800',
    won: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] ?? 'bg-accent-soft text-graphite'}`}>
      {status}
    </span>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="bg-white border border-accent-soft rounded-xl p-12 text-center">
      <ShoppingBag className="w-12 h-12 text-accent-soft mx-auto mb-4" />
      <p className="text-graphite/60 font-sans text-sm">{label}</p>
    </div>
  );
}

function PlaceholderCard({ title, message }: { title: string; message: string }) {
  return (
    <div className="bg-white border border-accent-soft rounded-xl p-12 text-center">
      <ShoppingBag className="w-12 h-12 text-accent-soft mx-auto mb-4" />
      <h3 className="text-lg font-sans text-graphite mb-2">{title}</h3>
      <p className="text-graphite/60 font-sans text-sm max-w-md mx-auto">{message}</p>
      <span className="inline-flex items-center gap-1 mt-4 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 font-sans">
        <AlertCircle className="w-3 h-3" />
        DEMO
      </span>
    </div>
  );
}
