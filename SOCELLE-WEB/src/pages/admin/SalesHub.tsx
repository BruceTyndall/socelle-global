import { useEffect, useState, useCallback } from 'react';
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
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ErrorState from '../../components/ErrorState';

// ── W12-11: Sales Hub — Admin Control Center ──────────────────────────────
// Data source: orders table (LIVE)
// isLive = true when DB-connected; false fallback shows DEMO badge

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
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export default function SalesHub() {
  const [rows, setRows] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('orders')
        .select('id, order_number, status, subtotal, commission_total, created_at, updated_at, brand_id, business_id')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error: dbError } = await query;
      if (dbError) throw dbError;
      setRows(data ?? []);
      setIsLive(true);
    } catch (err: any) {
      console.error('SalesHub: load error', err);
      const msg = err?.message?.toLowerCase() || '';
      if (msg.includes('does not exist') || err?.code === '42P01') {
        setIsLive(false);
        setRows([]);
      } else {
        setError('Failed to load sales data.');
      }
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (error) {
    return (
      <ErrorState
        icon={ShieldAlert}
        title="Sales Hub Unavailable"
        message={error}
        action={{ label: 'Retry', onClick: loadData }}
      />
    );
  }

  const totalRevenue = rows.reduce((sum, r) => sum + (r.subtotal || 0), 0);
  const totalCommission = rows.reduce((sum, r) => sum + (r.commission_total || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-serif text-pro-navy">
              Sales Hub<span className="text-pro-gold">.</span>
            </h1>
            {!isLive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 font-sans">
                <AlertCircle className="w-3 h-3" />
                DEMO
              </span>
            )}
          </div>
          <p className="text-pro-warm-gray font-sans mt-1">
            Order management and revenue tracking
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-pro-stone text-pro-charcoal hover:bg-pro-cream disabled:opacity-60 font-sans text-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary metrics */}
      {isLive && !loading && rows.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="bg-white border border-pro-stone rounded-xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-pro-warm-gray font-sans">Total Orders</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-pro-cream text-pro-navy">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-serif text-pro-navy">{rows.length}</p>
          </div>
          <div className="bg-white border border-pro-stone rounded-xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-pro-warm-gray font-sans">Revenue</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-pro-stone text-pro-gold">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-serif text-pro-navy">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="bg-white border border-pro-stone rounded-xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-pro-warm-gray font-sans">Commission</p>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-pro-ivory text-pro-charcoal">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-serif text-pro-navy">{formatCurrency(totalCommission)}</p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 bg-pro-stone/40 rounded-xl p-1 w-fit flex-wrap">
        {(['all', 'submitted', 'reviewing', 'confirmed', 'fulfilled', 'cancelled'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium font-sans transition-colors ${
              filter === f
                ? 'bg-white text-pro-navy shadow-sm'
                : 'text-pro-warm-gray hover:text-pro-charcoal'
            }`}
          >
            {f === 'sent_to_brand' ? 'Sent to Brand' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSkeleton />
      ) : !isLive ? (
        <ComingSoonCard />
      ) : rows.length === 0 ? (
        <EmptyState label={filter === 'all' ? 'No orders yet.' : `No ${filter} orders.`} />
      ) : (
        <div className="bg-white border border-pro-stone rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-pro-stone bg-pro-cream/50">
                  <th className="text-left px-4 py-3 font-medium text-pro-charcoal">Order #</th>
                  <th className="text-left px-4 py-3 font-medium text-pro-charcoal">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-pro-charcoal">Subtotal</th>
                  <th className="text-right px-4 py-3 font-medium text-pro-charcoal">Commission</th>
                  <th className="text-left px-4 py-3 font-medium text-pro-charcoal">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pro-stone/50">
                {rows.map((row) => {
                  const StatusIcon = STATUS_ICONS[row.status] || Clock;
                  return (
                    <tr key={row.id} className="hover:bg-pro-cream/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-pro-navy font-medium font-mono text-xs">
                          {row.order_number}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[row.status] || 'bg-pro-stone text-pro-charcoal'}`}>
                          <StatusIcon className="w-3 h-3" />
                          {row.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-pro-charcoal font-mono text-xs">
                        {formatCurrency(row.subtotal)}
                      </td>
                      <td className="px-4 py-3 text-right text-pro-warm-gray font-mono text-xs">
                        {formatCurrency(row.commission_total)}
                      </td>
                      <td className="px-4 py-3 text-pro-warm-gray text-xs">
                        {formatDate(row.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="bg-white border border-pro-stone rounded-xl p-5 space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 animate-pulse">
          <div className="w-20 h-4 bg-pro-stone rounded flex-shrink-0" />
          <div className="w-16 h-5 bg-pro-stone rounded-full" />
          <div className="flex-1" />
          <div className="w-16 h-4 bg-pro-stone rounded" />
          <div className="w-20 h-4 bg-pro-stone rounded" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="bg-white border border-pro-stone rounded-xl p-12 text-center">
      <ShoppingBag className="w-12 h-12 text-pro-stone mx-auto mb-4" />
      <p className="text-pro-warm-gray font-sans text-sm">{label}</p>
    </div>
  );
}

function ComingSoonCard() {
  return (
    <div className="bg-white border border-pro-stone rounded-xl p-12 text-center">
      <ShoppingBag className="w-12 h-12 text-pro-stone mx-auto mb-4" />
      <h3 className="text-lg font-serif text-pro-navy mb-2">Sales Hub</h3>
      <p className="text-pro-warm-gray font-sans text-sm max-w-md mx-auto">
        Orders table not available in this environment. Connect Supabase to activate live sales data.
      </p>
      <span className="inline-flex items-center gap-1 mt-4 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 font-sans">
        <AlertCircle className="w-3 h-3" />
        DEMO
      </span>
    </div>
  );
}
