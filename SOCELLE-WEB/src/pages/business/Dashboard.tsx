import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, DollarSign, Store, ArrowRight, CheckCircle, Clock, AlertCircle, Sparkles, TrendingUp, BarChart3, AlertTriangle, Brain } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { getOperatorInsights } from '../../lib/intelligence/businessIntelligence';
import type { OperatorInsight } from '../../lib/intelligence/businessIntelligence';

interface DashboardStats {
  ordersCount: number;
  totalSpend: number;
  activeBrandsCount: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  created_at: string;
  brand_name: string;
  brand_slug: string;
}

interface BusinessInfo {
  name: string;
  verification_status: string;
}

const STATUS_COLORS: Record<string, string> = {
  submitted:      'bg-accent-soft text-graphite',
  reviewing:      'bg-accent-soft text-graphite',
  sent_to_brand:  'bg-blue-50 text-blue-700',
  confirmed:      'bg-green-50 text-green-700',
  fulfilled:      'bg-background text-graphite',
  cancelled:      'bg-red-50 text-red-700',
};

const VERIFICATION_BADGE: Record<string, { label: string; icon: typeof CheckCircle; cls: string }> = {
  verified:             { label: 'Verified Reseller',    icon: CheckCircle, cls: 'text-green-600 bg-green-50' },
  pending_verification: { label: 'Verification Pending', icon: Clock,       cls: 'text-amber-600 bg-amber-50' },
  pending_claim:        { label: 'Claim Pending',        icon: Clock,       cls: 'text-amber-600 bg-amber-50' },
  unverified:           { label: 'Not Yet Verified',     icon: AlertCircle, cls: 'text-graphite/60 bg-accent-soft' },
  suspended:            { label: 'Account Suspended',    icon: AlertCircle, cls: 'text-red-600 bg-red-50' },
};

const INSIGHT_CONFIG: Record<OperatorInsight['category'], { icon: typeof TrendingUp; borderColor: string; iconColor: string; badgeColor: string }> = {
  growth:    { icon: TrendingUp,    borderColor: 'border-l-accent',      iconColor: 'text-accent',    badgeColor: 'bg-accent/10 text-accent' },
  trend:     { icon: BarChart3,     borderColor: 'border-l-intel-accent',  iconColor: 'text-intel-accent', badgeColor: 'bg-intel-accent/10 text-intel-accent' },
  risk:      { icon: AlertTriangle, borderColor: 'border-l-amber-500',    iconColor: 'text-amber-500',   badgeColor: 'bg-amber-500/10 text-amber-600' },
  benchmark: { icon: BarChart3,     borderColor: 'border-l-graphite',     iconColor: 'text-graphite',    badgeColor: 'bg-graphite/10 text-graphite' },
  education: { icon: Brain,         borderColor: 'border-l-emerald-500',  iconColor: 'text-emerald-500', badgeColor: 'bg-emerald-500/10 text-emerald-600' },
};

export default function Dashboard() {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ ordersCount: 0, totalSpend: 0, activeBrandsCount: 0 });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchDashboardData();
    else setLoading(false);
  }, [user?.id]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      const [ordersRes, recentOrdersRes, businessRes] = await Promise.allSettled([
        supabase
          .from('orders')
          .select('subtotal, brand_id')
          .eq('created_by', user.id)
          .neq('status', 'cancelled'),

        supabase
          .from('orders')
          .select('id, order_number, status, subtotal, created_at, brands(name, slug)')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false })
          .limit(5),

        profile?.business_id
          ? supabase
              .from('businesses')
              .select('name, verification_status')
              .eq('id', profile.business_id)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);

      if (ordersRes.status === 'fulfilled' && ordersRes.value.data) {
        const orders = ordersRes.value.data;
        const uniqueBrands = new Set(orders.map(o => o.brand_id).filter(Boolean));
        const spend = orders.reduce((sum, o) => sum + (Number(o.subtotal) || 0), 0);
        setStats({ ordersCount: orders.length, totalSpend: spend, activeBrandsCount: uniqueBrands.size });
      }

      if (recentOrdersRes.status === 'fulfilled' && recentOrdersRes.value.data) {
        setRecentOrders(
          recentOrdersRes.value.data.map(o => ({
            id: o.id,
            order_number: o.order_number,
            status: o.status,
            subtotal: Number(o.subtotal),
            created_at: o.created_at,
            brand_name: (o.brands as any)?.name || 'Unknown Brand',
            brand_slug: (o.brands as any)?.slug || '',
          }))
        );
      }

      if (businessRes.status === 'fulfilled' && businessRes.value.data) {
        setBusinessInfo(businessRes.value.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const verificationBadge = businessInfo
    ? (VERIFICATION_BADGE[businessInfo.verification_status] || VERIFICATION_BADGE['unverified'])
    : null;

  const hasOrders = stats.ordersCount > 0;

  const statCards = [
    {
      label: 'Orders Placed',
      value: stats.ordersCount.toString(),
      icon: ShoppingBag,
      iconBg: 'bg-accent-soft',
      iconColor: 'text-graphite',
    },
    {
      label: 'Total Spend',
      value: `$${stats.totalSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      iconBg: 'bg-background',
      iconColor: 'text-graphite',
    },
    {
      label: 'Brands Ordered From',
      value: stats.activeBrandsCount.toString(),
      icon: Store,
      iconBg: 'bg-accent-soft',
      iconColor: 'text-accent',
    },
  ];

  // Intelligence data — static for V1, personalized from Supabase in V2
  const insights = getOperatorInsights();
  const topInsights = insights.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-sans font-semibold text-graphite tracking-tight">
            {businessInfo?.name || 'My Dashboard'}
          </h1>
          <p className="text-sm text-graphite/60 font-sans mt-1">
            {hasOrders
              ? `${stats.ordersCount} order${stats.ordersCount !== 1 ? 's' : ''} · $${stats.totalSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })} total spend`
              : 'Browse professional brands and start ordering wholesale'}
          </p>
        </div>
        {verificationBadge && (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium font-sans flex-shrink-0 ${verificationBadge.cls}`}>
            <verificationBadge.icon className="w-3.5 h-3.5" />
            {verificationBadge.label}
          </div>
        )}
      </div>

      {/* Metric strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-accent-soft rounded-xl overflow-hidden border border-accent-soft">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${stat.iconBg}`}>
                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-xs font-sans font-medium text-graphite/60 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-2xl font-sans font-semibold text-graphite tracking-tight mt-0.5">
                  {loading ? '—' : stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Verification application banner — shown for unverified resellers */}
      {!loading && businessInfo && businessInfo.verification_status === 'unverified' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-semibold font-sans text-amber-900 text-sm">Complete your wholesale account application</p>
            <p className="text-xs font-sans text-amber-700 mt-1">
              Apply for verification to unlock wholesale pricing and place orders with any brand on SOCELLE.
              Takes less than 2 minutes.
            </p>
          </div>
          <Link
            to="/portal/apply"
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-amber-700 text-white rounded-lg text-sm font-medium font-sans hover:bg-amber-800 transition-colors"
          >
            Apply Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Pending verification notice */}
      {!loading && businessInfo && businessInfo.verification_status === 'pending_verification' && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 flex items-start gap-3">
          <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold font-sans text-blue-900 text-sm">Application under review</p>
            <p className="text-xs font-sans text-blue-700 mt-1">
              Your wholesale account application is being reviewed. You&apos;ll receive an update within 1–2 business days.
            </p>
          </div>
        </div>
      )}

      {/* Browse brands CTA — when no orders yet */}
      {!loading && !hasOrders && (
        <div className="relative overflow-hidden rounded-xl bg-graphite p-8 md:p-10">
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }} />
          <div className="relative">
            <p className="text-xs font-sans font-medium text-accent-soft uppercase tracking-widest mb-3">
              Get started
            </p>
            <h2 className="text-xl font-sans font-semibold text-white mb-2">
              Discover professional brands
            </h2>
            <p className="text-sm text-accent-soft font-sans mb-6 max-w-lg">
              Browse curated professional beauty brands and place your first wholesale order.
              No minimums to get started.
            </p>
            <Link
              to="/portal/brands"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-graphite rounded-lg hover:bg-background transition-colors font-medium font-sans text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Browse Brands
            </Link>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-accent-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-sans text-graphite">Recent Orders</h2>
            <Link
              to="/portal/orders"
              className="text-sm text-accent hover:text-graphite font-medium font-sans flex items-center gap-1 transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {!loading && recentOrders.length === 0 ? (
            <div className="text-center py-8 text-graphite/60 font-sans">
              <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-accent-soft" />
              <p className="text-sm">No orders yet</p>
            </div>
          ) : (
            <div className="divide-y divide-accent-soft">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-graphite font-sans text-sm">{order.brand_name}</p>
                    <p className="text-xs text-graphite/60 font-sans">
                      {order.order_number} · {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium font-sans capitalize ${STATUS_COLORS[order.status] || 'bg-accent-soft text-graphite'}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm font-sans font-semibold text-graphite">
                      ${order.subtotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-accent-soft p-6">
          <h2 className="text-lg font-sans text-graphite mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {[
              { to: '/brands',          label: 'Browse Brands',    sub: 'Discover and shop professional brands' },
              { to: '/portal/orders',   label: 'My Orders',        sub: `${stats.ordersCount} order${stats.ordersCount !== 1 ? 's' : ''} placed` },
              { to: '/portal/messages', label: 'Messages',         sub: 'Chat with brands' },
              { to: '/portal/account',  label: 'Business Profile', sub: 'Manage your account details' },
            ].map(({ to, label, sub }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-center justify-between p-4 rounded-lg border border-accent-soft hover:border-graphite/30 hover:bg-accent-soft/50 transition-all"
              >
                <div>
                  <p className="font-medium text-graphite font-sans text-sm">{label}</p>
                  <p className="text-xs text-graphite/60 font-sans mt-0.5">{sub}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-graphite/60 group-hover:text-graphite transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── WO-11: Intelligence Brief ─────────────────────────────── */}
      <section className="mt-12 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-intel-dark flex items-center justify-center">
              <Brain className="w-5 h-5 text-intel-accent" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-graphite">Your Intelligence Brief</h2>
              <p className="text-xs text-graphite/60 font-sans">Personalized signals for your treatment room</p>
            </div>
          </div>
          <Link
            to="/portal/intelligence"
            className="text-sm text-graphite hover:text-accent transition-colors flex items-center gap-1 font-medium font-sans"
          >
            View Full Intelligence
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topInsights.map((insight) => {
            const config = INSIGHT_CONFIG[insight.category];
            const Icon = config.icon;
            return (
              <div
                key={insight.id}
                className={`bg-graphite rounded-xl p-5 border-l-4 ${config.borderColor} flex flex-col justify-between min-h-[180px]`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={`w-4 h-4 ${config.iconColor}`} />
                    <span className={`text-[10px] font-sans font-semibold uppercase tracking-wider ${config.iconColor}`}>
                      {insight.category}
                    </span>
                    {insight.urgency === 'high' && (
                      <span className="ml-auto text-[10px] font-sans font-semibold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                        Action needed
                      </span>
                    )}
                  </div>
                  <h3 className="font-sans font-semibold text-white text-sm leading-snug mb-2">
                    {insight.title}
                  </h3>
                  <p className="text-xs text-accent-soft/80 font-sans leading-relaxed line-clamp-3">
                    {insight.description}
                  </p>
                </div>
                {insight.actionLabel && insight.actionHref && (
                  <Link
                    to={insight.actionHref}
                    className="mt-4 inline-flex items-center gap-1 text-xs font-medium font-sans text-accent hover:text-white transition-colors"
                  >
                    {insight.actionLabel}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
