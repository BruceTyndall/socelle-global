import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, AlertCircle, RefreshCw, Brain, BarChart3, MapPin } from 'lucide-react';
import { StatCard, Card, CardHeader, CardTitle } from '../../components/ui';
import {
  getBrandPerformanceMetrics,
  getBrandCategoryPosition,
  getResellerIntelligence,
} from '../../lib/intelligence/brandPortalIntelligence';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

// Simple SVG sparkline
function Sparkline({ data, color = '#1E3A5F' }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 120;
  const h = 40;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 6) - 3;
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts.join(' ')} stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

interface MonthBucket { month: string; revenue: number; orders: number }
interface TopRetailer  { id: string; name: string; type: string | null; revenue: number; orders: number }
interface TopProduct   { id: string; name: string; units: number; revenue: number }

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function buildMonthBuckets(orders: { created_at: string; subtotal: number }[]): MonthBucket[] {
  const now = new Date();
  const buckets: MonthBucket[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ month: MONTHS_SHORT[d.getMonth()], revenue: 0, orders: 0 });
  }
  for (const order of orders) {
    const d = new Date(order.created_at);
    const monthsAgo = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    if (monthsAgo >= 0 && monthsAgo < 12) {
      const idx = 11 - monthsAgo;
      buckets[idx].revenue += order.subtotal || 0;
      buckets[idx].orders  += 1;
    }
  }
  return buckets;
}


// ── Intelligence Sub-component (WO-12) ─────────────────────────────

function PerformanceIntelligenceSection({ brandSlug }: { brandSlug: string }) {
  const metrics = getBrandPerformanceMetrics(brandSlug);
  const categoryData = getBrandCategoryPosition(brandSlug);
  const resellerData = getResellerIntelligence(brandSlug);

  const velocityColors = {
    active: 'bg-emerald-50 text-emerald-700',
    declining: 'bg-amber-50 text-amber-700',
    at_risk: 'bg-red-50 text-red-700',
  };

  const velocityLabels = {
    active: 'Active',
    declining: 'Declining',
    at_risk: 'At Risk',
  };

  return (
    <div className="space-y-6">
      {/* SKU Velocity Rankings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-pro-navy" />
            <CardTitle>Product Velocity Rankings</CardTitle>
          </div>
          <span className="text-xs text-pro-warm-gray font-sans">Based on reorder patterns (90 days)</span>
        </CardHeader>
        <div className="space-y-3">
          {metrics.skuPerformance.slice(0, 6).map((sku, i) => (
            <div key={sku.id} className="flex items-center gap-3">
              <span className="w-5 text-center text-xs font-bold text-pro-warm-gray font-sans">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-pro-charcoal text-sm font-sans truncate">{sku.name}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium font-sans ${velocityColors[sku.velocity]}`}>
                    {velocityLabels[sku.velocity]}
                  </span>
                </div>
                <p className="text-xs text-pro-warm-gray font-sans">{sku.category} &middot; {sku.unitsLast90d} units &middot; {sku.reorderRate}% reorder rate</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {sku.trend >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                )}
                <span className={`text-xs font-medium font-sans ${sku.trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {sku.trend > 0 ? '+' : ''}{sku.trend}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Category Position + Regional */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Position */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-pro-gold" />
              <CardTitle>Category Position</CardTitle>
            </div>
          </CardHeader>
          <div className="space-y-4">
            {categoryData.categories.map((cat) => {
              const positionColors = {
                leader: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                contender: 'bg-blue-50 text-blue-700 border-blue-200',
                emerging: 'bg-amber-50 text-amber-700 border-amber-200',
                niche: 'bg-pro-cream text-pro-charcoal border-pro-stone',
              };
              return (
                <div key={cat.categoryName} className="p-3 rounded-lg border border-pro-stone">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-pro-charcoal text-sm font-sans">{cat.categoryName}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold font-sans border capitalize ${positionColors[cat.competitivePosition]}`}>
                      {cat.competitivePosition}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-pro-warm-gray font-sans mb-2">
                    <span>Rank #{cat.rank} / {cat.totalBrands}</span>
                    <span>{cat.adoptionRate}% adoption (avg {cat.categoryAvg}%)</span>
                  </div>
                  <p className="text-xs text-pro-warm-gray font-sans italic">{cat.treatmentTrendImpact}</p>
                </div>
              );
            })}
            <p className="text-xs text-pro-warm-gray font-sans mt-2 px-1">{categoryData.overallMarketPosition}</p>
          </div>
        </Card>

        {/* Regional Adoption */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-pro-navy" />
              <CardTitle>Regional Adoption</CardTitle>
            </div>
            <span className="text-xs text-pro-warm-gray font-sans">Operator distribution</span>
          </CardHeader>
          <div className="space-y-3">
            {resellerData.geographicDistribution.map((region) => (
              <div key={region.region} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-pro-charcoal font-sans">{region.region}</p>
                    <p className="text-xs text-pro-warm-gray font-sans">{region.count} operators ({region.percentage}%)</p>
                  </div>
                  <div className="w-full bg-pro-stone/30 rounded-full h-1.5">
                    <div
                      className="bg-pro-navy rounded-full h-1.5 transition-all"
                      style={{ width: `${region.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Tier Distribution */}
            <div className="pt-3 border-t border-pro-stone mt-3">
              <p className="text-xs font-semibold text-pro-warm-gray font-sans uppercase tracking-wider mb-2">Operator Tier Mix</p>
              <div className="flex gap-3">
                {resellerData.tierDistribution.map((tier) => {
                  const tierColors = {
                    Pro: 'bg-pro-stone/30 text-pro-charcoal',
                    Premium: 'bg-pro-gold/10 text-pro-gold',
                    Enterprise: 'bg-purple-50 text-purple-700',
                  };
                  return (
                    <div key={tier.tier} className={`flex-1 rounded-lg p-2.5 text-center ${tierColors[tier.tier]}`}>
                      <p className="text-lg font-heading font-bold">{tier.count}</p>
                      <p className="text-[10px] font-sans font-medium uppercase tracking-wider">{tier.tier}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function BrandPerformance() {
  const { brandId } = useAuth();
  const [monthlyData, setMonthlyData] = useState<MonthBucket[]>([]);
  const [topRetailers, setTopRetailers] = useState<TopRetailer[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [totalPlans, setTotalPlans] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (brandId) fetchPerformance();
    else setLoading(false);
  }, [brandId]);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      setError(null);

      const since = new Date();
      since.setFullYear(since.getFullYear() - 1);

      const [ordersRes, plansRes] = await Promise.all([
        supabase
          .from('orders')
          .select('id, subtotal, status, created_at, business_id, businesses(name, type)')
          .eq('brand_id', brandId!)
          .neq('status', 'cancelled')
          .gte('created_at', since.toISOString())
          .order('created_at'),
        supabase
          .from('plans')
          .select('id', { count: 'exact', head: true })
          .eq('brand_id', brandId!),
      ]);

      if (ordersRes.error) throw ordersRes.error;

      const orders = ordersRes.data || [];
      setTotalPlans(plansRes.count ?? 0);
      setMonthlyData(buildMonthBuckets(orders));

      // Top retailers by revenue
      const retailerMap = new Map<string, TopRetailer>();
      for (const o of orders) {
        if (!o.business_id) continue;
        const biz = o.businesses as unknown as { name: string; type: string | null } | null;
        if (!retailerMap.has(o.business_id)) {
          retailerMap.set(o.business_id, { id: o.business_id, name: biz?.name ?? 'Unknown', type: biz?.type ?? null, revenue: o.subtotal || 0, orders: 1 });
        } else {
          const r = retailerMap.get(o.business_id)!;
          r.revenue += o.subtotal || 0;
          r.orders  += 1;
        }
      }
      setTopRetailers(Array.from(retailerMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5));

      // Top products from order_items
      if (orders.length > 0) {
        const orderIds = orders.map(o => o.id);
        const { data: items } = await supabase
          .from('order_items')
          .select('product_id, product_name, qty, line_total')
          .in('order_id', orderIds);

        const productMap = new Map<string, TopProduct>();
        for (const item of items ?? []) {
          if (!productMap.has(item.product_id)) {
            productMap.set(item.product_id, { id: item.product_id, name: item.product_name, units: item.qty || 0, revenue: item.line_total || 0 });
          } else {
            const p = productMap.get(item.product_id)!;
            p.units   += item.qty || 0;
            p.revenue += item.line_total || 0;
          }
        }
        setTopProducts(Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5));
      }
    } catch (err: any) {
      console.warn('Performance fetch error:', err);
      setError('Unable to load performance data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentMonth = monthlyData[monthlyData.length - 1];
  const prevMonth    = monthlyData[monthlyData.length - 2];
  const currentRevenue = currentMonth?.revenue ?? 0;
  const prevRevenue    = prevMonth?.revenue ?? 0;
  const revDelta = prevRevenue > 0 ? Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100) : 0;
  const totalOrders = monthlyData.reduce((s, m) => s + m.orders, 0);
  const totalRevenue = monthlyData.reduce((s, m) => s + m.revenue, 0);
  const maxRevenue = Math.max(...monthlyData.map(m => m.revenue), 1);
  const currentMonthLabel = MONTHS_SHORT[new Date().getMonth()];

  if (!brandId) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-pro-warm-gray font-sans">No brand associated with your account.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-pro-navy">Performance</h1>
        <p className="text-sm text-pro-warm-gray font-sans mt-0.5">Analytics for the last 12 months</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 font-sans text-sm flex-1">{error}</p>
          <button onClick={fetchPerformance} className="flex items-center gap-1.5 text-red-600 text-sm font-medium hover:text-red-800">
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={`Revenue (${currentMonthLabel})`}
          value={currentRevenue >= 1000 ? `$${(currentRevenue / 1000).toFixed(1)}k` : `$${currentRevenue}`}
          delta={revDelta || undefined}
          deltaLabel="vs prior month"
          icon={DollarSign}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard label="Orders (12 mo)" value={totalOrders} icon={ShoppingBag} />
        <StatCard label="Plans Created" value={totalPlans} icon={Users} />
        <StatCard
          label="Total Revenue"
          value={totalRevenue >= 1000 ? `$${(totalRevenue / 1000).toFixed(1)}k` : `$${totalRevenue}`}
          icon={TrendingUp}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
        />
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue (12 months)</CardTitle>
          {revDelta !== 0 && (
            <div className={`flex items-center gap-1.5 ${revDelta > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium font-sans">
                {revDelta > 0 ? '+' : ''}{revDelta}% this month
              </span>
            </div>
          )}
        </CardHeader>

        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-pro-stone border-t-pro-navy rounded-full animate-spin" />
          </div>
        ) : totalOrders === 0 ? (
          <div className="h-48 flex items-center justify-center text-pro-warm-gray font-sans text-sm">
            Revenue will appear here once orders are placed.
          </div>
        ) : (
          <div className="h-48 relative">
            <div className="absolute inset-0 flex items-end gap-1 px-1">
              {monthlyData.map((bucket, i) => {
                const pct = (bucket.revenue / maxRevenue) * 100;
                const isLast = i === monthlyData.length - 1;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <div
                      className={`w-full rounded-t-sm transition-all ${isLast ? 'bg-pro-navy' : 'bg-pro-stone group-hover:bg-pro-navy/40'}`}
                      style={{ height: `${Math.max(pct, 2)}%` }}
                      title={`${bucket.month}: $${bucket.revenue.toLocaleString()}`}
                    />
                    <span className="text-[10px] text-pro-warm-gray font-sans">{bucket.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Two columns */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Retailers</CardTitle>
            <span className="text-xs text-pro-warm-gray font-sans">by revenue</span>
          </CardHeader>

          {loading ? (
            <div className="space-y-3">
              {[0,1,2].map(i => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-5 h-3 bg-pro-stone/30 rounded" />
                  <div className="flex-1 h-4 bg-pro-stone/30 rounded" />
                  <div className="w-16 h-4 bg-pro-stone/30 rounded" />
                </div>
              ))}
            </div>
          ) : topRetailers.length === 0 ? (
            <p className="text-sm text-pro-warm-gray font-sans py-4 text-center">
              Retailer data will appear once orders are placed.
            </p>
          ) : (
            <div className="space-y-3">
              {topRetailers.map((r, i) => (
                <div key={r.id} className="flex items-center gap-3">
                  <span className="w-5 text-center text-xs font-bold text-pro-warm-gray font-sans">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-pro-charcoal text-sm font-sans truncate">{r.name}</p>
                    <p className="text-xs text-pro-warm-gray font-sans">
                      {[r.type, `${r.orders} order${r.orders !== 1 ? 's' : ''}`].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <p className="font-semibold text-pro-charcoal text-sm font-sans flex-shrink-0">
                    ${r.revenue.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <span className="text-xs text-pro-warm-gray font-sans">by revenue</span>
          </CardHeader>

          {loading ? (
            <div className="space-y-3">
              {[0,1,2].map(i => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-5 h-3 bg-pro-stone/30 rounded" />
                  <div className="flex-1 h-4 bg-pro-stone/30 rounded" />
                  <div className="w-16 h-4 bg-pro-stone/30 rounded" />
                </div>
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <p className="text-sm text-pro-warm-gray font-sans py-4 text-center">
              Product data will appear once orders are placed.
            </p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="w-5 text-center text-xs font-bold text-pro-warm-gray font-sans">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-pro-charcoal text-sm font-sans truncate">{p.name}</p>
                    <p className="text-xs text-pro-warm-gray font-sans">{p.units} units sold</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Sparkline
                      data={Array.from({ length: 6 }, () => Math.max(0, p.revenue / 6 + (Math.random() - 0.5) * p.revenue * 0.4))}
                    />
                    <p className="font-semibold text-pro-charcoal text-sm font-sans flex-shrink-0">
                      ${p.revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Intelligence Context — WO-12 ────────────────────── */}
      <div className="mt-8 space-y-6">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-pro-gold" />
          <h2 className="font-serif text-xl text-pro-navy">Intelligence Context</h2>
        </div>

        <PerformanceIntelligenceSection brandSlug={brandId || 'default'} />
      </div>
    </div>
  );
}
