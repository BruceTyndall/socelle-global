import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Building2, RefreshCw, ShieldAlert, ShoppingBag, Users, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ErrorState from '../../components/ErrorState';
import AdminAnalyticsDashboard from '../../components/analytics/AdminDashboard';

interface HealthStats {
  brands: number | null;
  businesses: number | null;
  users: number | null;
  orders: number | null;
  pendingBrands: number | null;
  pendingBusinesses: number | null;
}

function isMissingTableError(error: any) {
  const message = error?.message?.toLowerCase() || '';
  return error?.code === '42P01' || message.includes('does not exist');
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<HealthStats>({
    brands: null,
    businesses: null,
    users: null,
    orders: null,
    pendingBrands: null,
    pendingBusinesses: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const results = await Promise.allSettled([
        supabase.from('brands').select('id', { count: 'exact', head: true }),
        supabase.from('businesses').select('id', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('brands').select('id', { count: 'exact', head: true }).eq('verification_status', 'pending_verification'),
        supabase.from('businesses').select('id', { count: 'exact', head: true }).eq('verification_status', 'pending_verification'),
      ]);

      const getCount = (r: PromiseSettledResult<{ count?: number | null; error?: any }>) => {
        if (r.status !== 'fulfilled') return null;
        const v = r.value as { count?: number | null; error?: any };
        if (v.error && !isMissingTableError(v.error)) return null;
        return v.count ?? null;
      };

      setStats({
        brands: getCount(results[0]),
        businesses: getCount(results[1]),
        users: getCount(results[2]),
        orders: getCount(results[3]),
        pendingBrands: getCount(results[4]),
        pendingBusinesses: getCount(results[5]),
      });
      setLastUpdated(new Date().toISOString());
    } catch (err: any) {
      console.error('Error loading admin dashboard stats:', err);
      const message = err?.message?.toLowerCase() || '';
      if (
        ['PGRST301', 'PGRST116', '42501'].includes(err?.code) ||
        message.includes('permission') ||
        message.includes('rls') ||
        message.includes('row-level security')
      ) {
        setError('Access denied while loading dashboard metrics.');
      } else if (
        message.includes('fetch') ||
        message.includes('network') ||
        message.includes('failed to fetch')
      ) {
        setError('Network issue while loading dashboard metrics.');
      } else {
        setError('Failed to load dashboard metrics.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (error) {
    return (
      <ErrorState
        icon={ShieldAlert}
        title="Dashboard Unavailable"
        message={error}
        action={{ label: 'Retry', onClick: loadStats }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-serif text-pro-navy">Control Plane<span className="text-pro-gold">.</span></h1>
          <p className="text-pro-warm-gray font-sans mt-1">Platform health and operational metrics</p>
        </div>
        <button
          type="button"
          onClick={loadStats}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-pro-stone text-pro-charcoal hover:bg-pro-cream disabled:opacity-60 font-sans text-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Building2}
          label="Brands"
          value={stats.brands}
          loading={loading}
          tone="navy"
        />
        <MetricCard
          icon={Users}
          label="Businesses"
          value={stats.businesses}
          loading={loading}
          tone="charcoal"
        />
        <MetricCard
          icon={Activity}
          label="User Profiles"
          value={stats.users}
          loading={loading}
          tone="gold"
        />
        <MetricCard
          icon={ShoppingBag}
          label="Orders"
          value={stats.orders}
          loading={loading}
          tone="warm"
        />
      </div>

      {/* Verification queue */}
      {((stats.pendingBrands ?? 0) > 0 || (stats.pendingBusinesses ?? 0) > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-semibold text-amber-800 font-sans">Verification Queue</h2>
            </div>
            <Link
              to="/admin/approvals"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 font-sans transition-colors"
            >
              Review now
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {(stats.pendingBrands ?? 0) > 0 && (
              <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-amber-100">
                <span className="text-sm text-pro-charcoal font-sans">Brands awaiting review</span>
                <span className="text-lg font-serif text-amber-700">{stats.pendingBrands}</span>
              </div>
            )}
            {(stats.pendingBusinesses ?? 0) > 0 && (
              <div className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-amber-100">
                <span className="text-sm text-pro-charcoal font-sans">Businesses awaiting review</span>
                <span className="text-lg font-serif text-amber-700">{stats.pendingBusinesses}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white border border-pro-stone rounded-xl p-5">
        <h2 className="text-lg font-serif text-pro-navy mb-2">System Notes</h2>
        <p className="text-sm text-pro-warm-gray font-sans">
          Missing counts show as <strong>N/A</strong> when optional tables are not present in the current environment.
        </p>
        {lastUpdated && (
          <p className="text-xs text-pro-warm-gray font-sans mt-3">
            Last refreshed: {new Date(lastUpdated).toLocaleString()}
          </p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-serif text-pro-navy mb-4">Platform Analytics</h2>
        <AdminAnalyticsDashboard />
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  loading,
  tone
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: number | null;
  loading: boolean;
  tone: 'navy' | 'charcoal' | 'gold' | 'warm';
}) {
  const toneClasses: Record<typeof tone, string> = {
    navy:    'bg-pro-cream text-pro-navy',
    charcoal:'bg-pro-ivory text-pro-charcoal',
    gold:    'bg-pro-stone text-pro-gold',
    warm:    'bg-pro-cream text-pro-warm-gray',
  };

  return (
    <div className="bg-white border border-pro-stone rounded-xl p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-pro-warm-gray font-sans">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${toneClasses[tone]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="mt-4 text-3xl font-serif text-pro-navy">
        {loading ? '—' : value === null ? 'N/A' : value.toLocaleString()}
      </p>
    </div>
  );
}
