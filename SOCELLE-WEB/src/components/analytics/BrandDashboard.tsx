import { useEffect, useState } from 'react';
import { Eye, Zap, ShoppingBag, DollarSign, Package } from 'lucide-react';
import { getBrandAnalytics, type BrandAnalyticsData } from '../../lib/analyticsService';
import MetricCard from './MetricCard';
import SparklineChart from './SparklineChart';
import { createScopedLogger } from '../../lib/logger';

const log = createScopedLogger('BrandDashboard');

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
  const [data, setData] = useState<BrandAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!brandId) return;
    getBrandAnalytics(brandId)
      .then(setData)
      .catch((err) => log.error('Failed to load brand analytics', { err }))
      .finally(() => setLoading(false));
  }, [brandId]);

  if (loading) return <SkeletonRow />;
  if (!data) return (
    <div className="text-center py-10 text-pro-warm-gray font-sans text-sm">
      Analytics data not available yet.
    </div>
  );

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

  return (
    <div className="space-y-6">
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
          <h3 className="font-sans font-semibold text-pro-charcoal text-sm mb-4">
            Businesses Reached — Last 30 Days
          </h3>
          <SparklineChart data={data.businessesReachedTrend} color="#1E3A5F" height={140} />
        </div>

        {/* ── Match rate ────────────────────────────────────── */}
        <div className="card p-5">
          <h3 className="font-sans font-semibold text-pro-charcoal text-sm mb-4">
            Protocol Match Rate
          </h3>
          <div className="flex items-end gap-3 mb-3">
            <span className="font-serif text-4xl text-pro-navy">{data.matchRate}%</span>
            <span className="font-sans text-xs text-pro-warm-gray mb-1">of views result in a match</span>
          </div>
          <div className="relative h-3 bg-pro-stone rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-pro-gold rounded-full transition-all duration-700"
              style={{ width: `${Math.min(data.matchRate, 100)}%` }}
            />
          </div>
          <p className="font-sans text-xs text-pro-warm-gray mt-2">
            Industry average: ~32%
          </p>
        </div>
      </div>

      {/* ── Recent orders ────────────────────────────────────── */}
      {data.recentOrders.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-pro-stone flex items-center gap-2">
            <Package className="w-4 h-4 text-pro-warm-gray" />
            <h3 className="font-sans font-semibold text-pro-charcoal text-sm">Recent Orders</h3>
          </div>
          <div className="divide-y divide-pro-stone">
            {data.recentOrders.map((order) => (
              <div key={order.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="font-sans text-sm text-pro-charcoal font-medium">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="font-sans text-xs text-pro-warm-gray">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-sans text-sm font-semibold text-pro-navy">
                    {formatCurrency(order.subtotal)}
                  </p>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full font-sans ${
                    order.status === 'fulfilled' ? 'bg-pro-cream text-pro-navy' :
                    order.status === 'submitted' ? 'bg-pro-gold-pale text-pro-navy' :
                    'bg-pro-cream text-pro-warm-gray'
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
