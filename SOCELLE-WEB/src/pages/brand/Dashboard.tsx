import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { Package, ShoppingBag, Users, DollarSign, ArrowRight, CheckCircle, Clock, AlertCircle, Sparkles, Brain, TrendingUp, TrendingDown } from 'lucide-react';
import { StatCardSkeleton, Skeleton } from '../../components/Skeleton';
import { getBrandMarketPosition, getBrandTopSignals, getBrandPerformanceMetrics } from '../../lib/intelligence/brandPortalIntelligence';

interface DashboardStats {
  ordersCount: number;
  revenueTotal: number;
  productsCount: number;
  resellersCount: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  created_at: string;
  business_name: string;
}

interface BrandInfo {
  name: string;
  verification_status: string;
}

const STATUS_COLORS: Record<string, string> = {
  submitted:      'bg-pro-cream text-pro-charcoal',
  reviewing:      'bg-pro-stone text-pro-charcoal',
  sent_to_brand:  'bg-blue-50 text-blue-700',
  confirmed:      'bg-green-50 text-green-700',
  fulfilled:      'bg-pro-ivory text-pro-navy',
  cancelled:      'bg-red-50 text-red-700',
};

const VERIFICATION_BADGE: Record<string, { label: string; icon: typeof CheckCircle; cls: string }> = {
  verified:             { label: 'Verified',             icon: CheckCircle, cls: 'text-green-600 bg-green-50' },
  pending_verification: { label: 'Pending Review',       icon: Clock,       cls: 'text-amber-600 bg-amber-50' },
  pending_claim:        { label: 'Claim Pending',        icon: Clock,       cls: 'text-amber-600 bg-amber-50' },
  unverified:           { label: 'Not Yet Verified',     icon: AlertCircle, cls: 'text-pro-warm-gray bg-pro-cream' },
  suspended:            { label: 'Suspended',            icon: AlertCircle, cls: 'text-red-600 bg-red-50' },
};


// ── Brand Intelligence Sub-components (WO-12) ──────────────────────

function BrandMarketPositionCard({ brandSlug }: { brandSlug: string }) {
  const position = getBrandMarketPosition(brandSlug);
  const metrics = getBrandPerformanceMetrics(brandSlug);

  const statusColors = {
    trending: 'bg-emerald-500',
    stable: 'bg-amber-500',
    declining: 'bg-red-500',
  };

  const statusLabels = {
    trending: 'Trending',
    stable: 'Stable',
    declining: 'Declining',
  };

  return (
    <div className="bg-pro-charcoal rounded-xl p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-pro-gold" />
          <h3 className="font-heading text-lg font-semibold">Market Position</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusColors[position.trendingStatus]}`} />
          <span className="text-sm font-sans text-white/80">{statusLabels[position.trendingStatus]}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/10 rounded-lg p-4">
          <p className="text-xs text-white/60 font-sans uppercase tracking-wider mb-1">Category Rank</p>
          <p className="text-2xl font-heading font-bold">
            #{position.categoryRanking}
            <span className="text-sm font-sans text-white/50 ml-1">/ {position.totalInCategory}</span>
          </p>
          <p className="text-xs text-white/50 font-sans mt-1">{position.categoryName}</p>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <p className="text-xs text-white/60 font-sans uppercase tracking-wider mb-1">Adoption Rate</p>
          <p className="text-2xl font-heading font-bold">{position.adoptionRate}%</p>
          <p className="text-xs text-white/50 font-sans mt-1">
            Category avg: {position.categoryAvgAdoption}%
          </p>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <p className="text-xs text-white/60 font-sans uppercase tracking-wider mb-1">Momentum</p>
          <p className="text-2xl font-heading font-bold">{metrics.momentumScore}</p>
          <div className="w-full bg-white/20 rounded-full h-1.5 mt-2">
            <div
              className="bg-pro-gold rounded-full h-1.5 transition-all"
              style={{ width: `${metrics.momentumScore}%` }}
            />
          </div>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <p className="text-xs text-white/60 font-sans uppercase tracking-wider mb-1">QoQ Growth</p>
          <div className="flex items-center gap-1.5">
            {position.quarterOverQuarterGrowth >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <p className={`text-2xl font-heading font-bold ${
              position.quarterOverQuarterGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {position.quarterOverQuarterGrowth > 0 ? '+' : ''}{position.quarterOverQuarterGrowth}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BrandTopSignalsCard({ brandSlug }: { brandSlug: string }) {
  const signals = getBrandTopSignals(brandSlug);

  if (signals.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-heading text-lg font-semibold text-pro-charcoal">Recent Market Signals</h3>
      <div className="grid gap-3 md:grid-cols-2">
        {signals.slice(0, 4).map((signal) => (
          <div
            key={signal.id}
            className="bg-white rounded-lg border border-pro-stone p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-sans font-medium text-sm text-pro-charcoal leading-tight">{signal.title}</h4>
              <div className={`flex items-center gap-1 flex-shrink-0 text-xs font-medium font-sans px-2 py-0.5 rounded-full ${
                signal.direction === 'up'
                  ? 'bg-emerald-50 text-emerald-700'
                  : signal.direction === 'down'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-pro-cream text-pro-warm-gray'
              }`}>
                {signal.direction === 'up' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : signal.direction === 'down' ? (
                  <TrendingDown className="w-3 h-3" />
                ) : null}
                {signal.magnitude > 0 ? `${signal.direction === 'down' ? '-' : '+'}${signal.magnitude}%` : 'Stable'}
              </div>
            </div>
            <p className="text-xs text-pro-warm-gray font-sans line-clamp-2">{signal.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BrandDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    ordersCount: 0,
    revenueTotal: 0,
    productsCount: 0,
    resellersCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [brandInfo, setBrandInfo] = useState<BrandInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.brand_id) fetchDashboardData();
    else setLoading(false);
  }, [profile?.brand_id]);

  const fetchDashboardData = async () => {
    if (!profile?.brand_id) return;

    try {
      const [ordersRes, productsRes, recentOrdersRes, brandRes] = await Promise.allSettled([
        supabase
          .from('orders')
          .select('subtotal, business_id')
          .eq('brand_id', profile.brand_id)
          .neq('status', 'cancelled'),

        supabase
          .from('pro_products')
          .select('id', { count: 'exact', head: true })
          .eq('brand_id', profile.brand_id),

        supabase
          .from('orders')
          .select('id, order_number, status, subtotal, created_at, businesses(name)')
          .eq('brand_id', profile.brand_id)
          .order('created_at', { ascending: false })
          .limit(5),

        supabase
          .from('brands')
          .select('name, verification_status')
          .eq('id', profile.brand_id)
          .maybeSingle(),
      ]);

      if (ordersRes.status === 'fulfilled' && ordersRes.value.data) {
        const orders = ordersRes.value.data;
        const uniqueResellers = new Set(orders.map(o => o.business_id).filter(Boolean));
        const revenue = orders.reduce((sum, o) => sum + (Number(o.subtotal) || 0), 0);
        setStats(prev => ({
          ...prev,
          ordersCount: orders.length,
          revenueTotal: revenue,
          resellersCount: uniqueResellers.size,
        }));
      }

      if (productsRes.status === 'fulfilled') {
        setStats(prev => ({ ...prev, productsCount: productsRes.value.count || 0 }));
      }

      if (recentOrdersRes.status === 'fulfilled' && recentOrdersRes.value.data) {
        setRecentOrders(
          recentOrdersRes.value.data.map(o => ({
            id: o.id,
            order_number: o.order_number,
            status: o.status,
            subtotal: Number(o.subtotal),
            created_at: o.created_at,
            business_name: (o.businesses as any)?.name || 'Unknown Business',
          }))
        );
      }

      if (brandRes.status === 'fulfilled' && brandRes.value.data) {
        setBrandInfo(brandRes.value.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const verificationBadge = brandInfo
    ? (VERIFICATION_BADGE[brandInfo.verification_status] || VERIFICATION_BADGE['unverified'])
    : null;

  const statCards = [
    {
      label: 'Orders',
      value: stats.ordersCount.toString(),
      icon: ShoppingBag,
      iconBg: 'bg-pro-cream',
      iconColor: 'text-pro-navy',
    },
    {
      label: 'Revenue',
      value: `$${stats.revenueTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      iconBg: 'bg-pro-ivory',
      iconColor: 'text-pro-charcoal',
    },
    {
      label: 'Products',
      value: stats.productsCount.toString(),
      icon: Package,
      iconBg: 'bg-pro-stone',
      iconColor: 'text-pro-gold',
    },
    {
      label: 'Resellers',
      value: stats.resellersCount.toString(),
      icon: Users,
      iconBg: 'bg-pro-cream',
      iconColor: 'text-pro-navy',
    },
  ];

  // Getting-started checklist — show when setup is incomplete
  const profileComplete = !!brandInfo?.name;
  const hasProducts = stats.productsCount > 0;
  const setupDone = profileComplete && hasProducts;
  const setupSteps = [
    {
      label: 'Complete your brand profile',
      done: profileComplete,
      to: '/brand/onboarding',
    },
    {
      label: 'Add your first product',
      done: hasProducts,
      to: '/brand/products',
    },
    {
      label: 'Preview your storefront',
      done: false, // always surfaced until they mark it manually
      to: '/brand/storefront',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-56 mb-2" />
          <Skeleton className="h-5 w-80" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[0, 1, 2, 3].map(i => <StatCardSkeleton key={i} />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-pro-stone p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="flex justify-between py-3 border-b border-pro-stone last:border-0">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg border border-pro-stone p-6">
            <Skeleton className="h-6 w-36 mb-4" />
            {[0, 1, 2].map(i => <Skeleton key={i} className="h-14 w-full rounded-lg mb-3" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-pro-navy mb-2">
            {brandInfo?.name || 'Brand Dashboard'}<span className="text-pro-gold">.</span>
          </h1>
          <p className="text-pro-warm-gray font-sans">
            {stats.ordersCount > 0
              ? `${stats.ordersCount} order${stats.ordersCount !== 1 ? 's' : ''} · ${stats.resellersCount} reseller${stats.resellersCount !== 1 ? 's' : ''} · $${stats.revenueTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })} revenue`
              : 'Your Socelle brand command center'}
          </p>
        </div>
        {verificationBadge && (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium font-sans ${verificationBadge.cls}`}>
            <verificationBadge.icon className="w-3.5 h-3.5" />
            {verificationBadge.label}
          </div>
        )}
      </div>

      {/* Getting-started checklist — shown until setup complete */}
      {!loading && !setupDone && (
        <div className="bg-white rounded-lg border border-amber-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-semibold text-amber-800 font-sans uppercase tracking-wide">
                Getting Started
              </h2>
            </div>
            <span className="text-xs text-pro-warm-gray font-sans">
              {setupSteps.filter(s => s.done).length}/{setupSteps.length} complete
            </span>
          </div>
          <div className="space-y-2">
            {setupSteps.map(step => (
              <Link
                key={step.to}
                to={step.to}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  step.done
                    ? 'opacity-60 cursor-default pointer-events-none'
                    : 'hover:bg-pro-cream'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                  step.done ? 'border-green-400 bg-green-400' : 'border-pro-stone bg-white'
                }`}>
                  {step.done && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                </div>
                <span className={`text-sm font-sans ${step.done ? 'line-through text-pro-warm-gray' : 'text-pro-charcoal font-medium'}`}>
                  {step.label}
                </span>
                {!step.done && <ArrowRight className="w-3.5 h-3.5 text-pro-warm-gray ml-auto" />}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-lg border border-pro-stone p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
              <p className="text-2xl font-serif text-pro-navy mb-1">{stat.value}</p>
              <p className="text-sm text-pro-warm-gray font-sans">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg border border-pro-stone p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif text-pro-navy">Recent Orders</h2>
            <Link
              to="/brand/orders"
              className="text-sm text-pro-gold hover:text-pro-navy font-medium font-sans flex items-center gap-1 transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-pro-warm-gray font-sans">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-pro-stone" />
              <p className="font-medium">No orders yet</p>
              <p className="text-sm mt-1">Orders from resellers will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-pro-stone">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-pro-charcoal font-sans text-sm">{order.business_name}</p>
                    <p className="text-xs text-pro-warm-gray font-sans">
                      {order.order_number} · {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium font-sans capitalize ${STATUS_COLORS[order.status] || 'bg-pro-cream text-pro-charcoal'}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm font-serif text-pro-navy">
                      ${order.subtotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-pro-stone p-6 shadow-sm">
          <h2 className="text-xl font-serif text-pro-navy mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { to: '/brand/orders',   label: 'Manage Orders',   sub: 'Review and fulfill reseller orders' },
              { to: '/brand/products', label: 'Product Catalog', sub: `${stats.productsCount} products listed` },
              { to: '/brand/messages', label: 'Messages',        sub: 'Chat with resellers' },
              { to: '/brand/profile',  label: 'Brand Profile',   sub: 'Edit your storefront details' },
            ].map(({ to, label, sub }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-center justify-between p-4 rounded-lg border border-pro-stone hover:border-pro-charcoal/30 hover:bg-pro-cream/50 transition-all"
              >
                <div>
                  <p className="font-medium text-pro-charcoal font-sans text-sm">{label}</p>
                  <p className="text-xs text-pro-warm-gray font-sans mt-0.5">{sub}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-pro-warm-gray group-hover:text-pro-charcoal transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Brand Intelligence — WO-12 ─────────────────────── */}
      <section className="mt-12 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl font-bold text-pro-charcoal">Your Brand Intelligence</h2>
          <Link
            to="/brand/intelligence"
            className="text-sm text-pro-gold hover:text-pro-navy font-medium font-sans flex items-center gap-1 transition-colors"
          >
            Full Intelligence Hub
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Market Position Card */}
        <BrandMarketPositionCard brandSlug={brandInfo?.name?.toLowerCase().replace(/\s+/g, '-') || 'default'} />

        {/* Top Signals */}
        <BrandTopSignalsCard brandSlug={brandInfo?.name?.toLowerCase().replace(/\s+/g, '-') || 'default'} />
      </section>
    </div>
  );
}
