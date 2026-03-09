import { Eye, Zap, ShoppingBag, DollarSign, Package } from 'lucide-react';
import { useBrandAnalytics } from '../../lib/intelligence/useBrandAnalytics';
import MetricCard from './MetricCard';
import SparklineChart from './SparklineChart';

function SkeletonRow() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="card p-5 space-y-3">
          <div className="skeleton h-3 w-24 rounded" />
          <div className="skeleton h-7 w-20 rounded" />
          <div className="skeleton h-5 w-28 rounded-full" />
        </div>
      ))}
    </div>
  );
}

interface BrandDashboardProps {
  brandId: string;
}

export default function BrandDashboard({ brandId }: BrandDashboardProps) {
  // W12-08: Live wiring via useBrandAnalytics hook with isLive flag
  const { data, loading, isLive } = useBrandAnalytics(brandId);

  if (loading) return <SkeletonRow />;

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="space-y-6">
      {/* ── W12-08: DEMO badge when not live ──────────────────── */}
      {!isLive && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-pill">Demo Data</span>
          <span className="font-sans text-xs text-graphite/60">Analytics will populate as orders are placed</span>
        </div>
      )}

      {/* ── KPI row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard label="Total Views"       kpi={data.kpis.totalViews}      icon={<Eye className="w-4 h-4" />} />
        <MetricCard label="Protocol Matches"  kpi={data.kpis.protocolMatches} icon={<Zap className="w-4 h-4" />} />
        <MetricCard label="Orders"            kpi={data.kpis.totalOrders}     icon={<ShoppingBag className="w-4 h-4" />} />
        <MetricCard label="Revenue"           kpi={data.kpis.totalRevenue}    format="currency" icon={<DollarSign className="w-4 h-4" />} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Businesses reached chart ──────────────────────── */}
        <div className="card p-5">
          <h3 className="font-sans font-semibold text-graphite text-sm mb-4">
            Businesses Reached — Last 30 Days
          </h3>
          <SparklineChart data={data.businessesReachedTrend} color="var(--color-accent)" height={140} />
        </div>

        {/* ── Match rate ────────────────────────────────────── */}
        <div className="card p-5">
          <h3 className="font-sans font-semibold text-graphite text-sm mb-4">
            Protocol Match Rate
          </h3>
          <div className="flex items-end gap-3 mb-3">
            <span className="font-sans text-4xl text-graphite">{data.matchRate}%</span>
            <span className="font-sans text-xs text-graphite/60 mb-1">of views result in a match</span>
          </div>
          <div className="relative h-3 bg-accent-soft rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-accent rounded-full transition-all duration-700"
              style={{ width: `${Math.min(data.matchRate, 100)}%` }}
            />
          </div>
          <p className="font-sans text-xs text-graphite/60 mt-2">
            Industry average: ~32%
          </p>
        </div>
      </div>

      {/* ── Recent orders ────────────────────────────────────── */}
      {data.recentOrders.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-accent-soft flex items-center gap-2">
            <Package className="w-4 h-4 text-graphite/60" />
            <h3 className="font-sans font-semibold text-graphite text-sm">Recent Orders</h3>
          </div>
          <div className="divide-y divide-accent-soft">
            {data.recentOrders.map((order) => (
              <div key={order.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="font-sans text-sm text-graphite font-medium">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="font-sans text-xs text-graphite/60">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-sans text-sm font-semibold text-graphite">
                    {formatCurrency(order.subtotal)}
                  </p>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full font-sans ${
                    order.status === 'fulfilled' ? 'bg-accent-soft text-graphite' :
                    order.status === 'submitted' ? 'bg-accent-pale text-graphite' :
                    'bg-accent-soft text-graphite/60'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
