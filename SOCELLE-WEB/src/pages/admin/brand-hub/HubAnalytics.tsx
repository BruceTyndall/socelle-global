import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TrendingUp, DollarSign, ShoppingBag, Users } from 'lucide-react';
import { StatCard, Card, CardHeader, CardTitle } from '../../../components/ui';
import { supabase } from '../../../lib/supabase';

interface MonthBucket {
  month: string;   // 'YYYY-MM'
  label: string;   // 'Jan', 'Feb', etc.
  revenue: number;
  orders: number;
}

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  uniqueRetailers: number;
  avgOrderValue: number;
  monthly: MonthBucket[];
}

function buildMonthLabel(ym: string): string {
  const [y, m] = ym.split('-');
  return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString('en-US', { month: 'short' });
}

export default function HubAnalytics() {
  const { id: brandId } = useParams<{ id: string }>();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!brandId) return;
    (async () => {
      try {
        const { data: orders } = await supabase
          .from('orders')
          .select('total_amount, business_id, created_at')
          .eq('brand_id', brandId)
          .not('status', 'eq', 'cancelled');

        const rows = orders ?? [];

        // Monthly buckets (last 12 months)
        const bucketMap = new Map<string, MonthBucket>();
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          bucketMap.set(key, { month: key, label: buildMonthLabel(key), revenue: 0, orders: 0 });
        }

        let totalRevenue = 0;
        const uniqueBiz = new Set<string>();

        for (const o of rows) {
          const d = new Date(o.created_at);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          totalRevenue += o.total_amount ?? 0;
          if (o.business_id) uniqueBiz.add(o.business_id);
          if (bucketMap.has(key)) {
            const b = bucketMap.get(key)!;
            b.revenue += o.total_amount ?? 0;
            b.orders  += 1;
          }
        }

        setData({
          totalRevenue,
          totalOrders: rows.length,
          uniqueRetailers: uniqueBiz.size,
          avgOrderValue: rows.length > 0 ? Math.round(totalRevenue / rows.length) : 0,
          monthly: Array.from(bucketMap.values()),
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [brandId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-white rounded-xl border border-pro-stone animate-pulse" />)}
        </div>
        <div className="h-48 bg-white rounded-xl border border-pro-stone animate-pulse" />
      </div>
    );
  }

  if (!data) return null;

  const maxRevenue = Math.max(...data.monthly.map(m => m.revenue), 1);
  const lastMonth  = data.monthly[data.monthly.length - 1];
  const prevMonth  = data.monthly[data.monthly.length - 2];
  const momDelta   = prevMonth?.revenue > 0
    ? Math.round(((lastMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100)
    : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={`$${(data.totalRevenue / 1000).toFixed(1)}k`}
          icon={DollarSign}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          delta={momDelta ?? undefined}
          deltaLabel="vs prev month"
        />
        <StatCard label="Orders"            value={data.totalOrders}    icon={ShoppingBag} />
        <StatCard label="Retailers"         value={data.uniqueRetailers} icon={Users} />
        <StatCard label="Avg Order Value"   value={data.avgOrderValue > 0 ? `$${data.avgOrderValue.toLocaleString()}` : '—'} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue (Last 12 Months)</CardTitle>
          {momDelta !== null && (
            <div className={`flex items-center gap-1.5 ${momDelta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium font-sans">
                {momDelta >= 0 ? '+' : ''}{momDelta}% this month
              </span>
            </div>
          )}
        </CardHeader>

        {data.monthly.every(m => m.revenue === 0) ? (
          <p className="text-sm text-pro-warm-gray font-sans px-1 pb-4">No revenue data yet for this period.</p>
        ) : (
          <div className="h-48 relative">
            <div className="absolute inset-0 flex items-end gap-1 px-1">
              {data.monthly.map((m, i) => {
                const pct = (m.revenue / maxRevenue) * 100;
                const isLast = i === data.monthly.length - 1;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group">
                    <div
                      className={`w-full rounded-t-sm transition-all ${isLast ? 'bg-pro-navy' : 'bg-pro-stone group-hover:bg-pro-navy/40'}`}
                      style={{ height: `${Math.max(pct, 2)}%` }}
                      title={`${m.label}: $${m.revenue.toLocaleString()}`}
                    />
                    <span className="text-[10px] text-pro-warm-gray font-sans">{m.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>This Month</CardTitle></CardHeader>
          <div className="space-y-4">
            {[
              { label: 'Revenue',        value: `$${lastMonth.revenue.toLocaleString()}` },
              { label: 'Orders',         value: lastMonth.orders },
              { label: 'Avg Order',      value: lastMonth.orders > 0 ? `$${Math.round(lastMonth.revenue / lastMonth.orders).toLocaleString()}` : '—' },
            ].map(m => (
              <div key={m.label} className="flex justify-between items-center">
                <span className="text-sm font-sans text-pro-warm-gray">{m.label}</span>
                <span className="text-sm font-bold font-sans text-pro-charcoal">{m.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>All Time</CardTitle></CardHeader>
          <div className="space-y-4">
            {[
              { label: 'Total Revenue',     value: `$${data.totalRevenue.toLocaleString()}` },
              { label: 'Total Orders',      value: data.totalOrders },
              { label: 'Active Retailers',  value: data.uniqueRetailers },
              { label: 'Avg Order Value',   value: data.avgOrderValue > 0 ? `$${data.avgOrderValue.toLocaleString()}` : '—' },
            ].map(m => (
              <div key={m.label} className="flex justify-between items-center">
                <span className="text-sm font-sans text-pro-warm-gray">{m.label}</span>
                <span className="text-sm font-bold font-sans text-pro-charcoal">{m.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
