import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { Badge, EmptyState } from '../../components/ui';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  brand_name: string;
  items_count: number;
  subtotal: number;
  status: string;
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'amber' | 'gray' | 'green' | 'navy' | 'red' }> = {
  submitted:     { label: 'Submitted',     variant: 'amber' },
  reviewing:     { label: 'Reviewing',     variant: 'gray' },
  sent_to_brand: { label: 'Sent to Brand', variant: 'navy' },
  confirmed:     { label: 'Confirmed',     variant: 'green' },
  fulfilled:     { label: 'Fulfilled',     variant: 'green' },
  cancelled:     { label: 'Cancelled',     variant: 'red' },
};

export default function BusinessOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadOrders();
    else setLoading(false);
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data: ordersData, error: ordersErr } = await supabase
        .from('orders')
        .select('id, order_number, created_at, status, subtotal, brands(name)')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (ordersErr) throw ordersErr;

      const orderIds = (ordersData || []).map(o => o.id);
      const itemCountMap: Record<string, number> = {};

      if (orderIds.length > 0) {
        const { data: itemCounts } = await supabase
          .from('order_items')
          .select('order_id')
          .in('order_id', orderIds);

        for (const row of itemCounts || []) {
          itemCountMap[row.order_id] = (itemCountMap[row.order_id] || 0) + 1;
        }
      }

      setOrders((ordersData || []).map(o => ({
        id: o.id,
        order_number: o.order_number,
        created_at: o.created_at,
        status: o.status,
        subtotal: o.subtotal,
        brand_name: (o as any).brands?.name || '—',
        items_count: itemCountMap[o.id] || 0,
      })));
    } catch {
      setError('Unable to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        <div>
          <h1 className="text-2xl font-sans font-semibold text-graphite tracking-tight">Orders</h1>
          <p className="text-sm text-graphite/60 font-sans mt-1">Track and manage your product orders</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 font-sans text-sm flex-1">{error}</p>
            <button
              onClick={loadOrders}
              className="flex items-center gap-1.5 text-red-600 text-sm font-medium hover:text-red-800 flex-shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl border border-accent-soft overflow-hidden">
          {loading ? (
            <div className="divide-y divide-accent-soft/50">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                  <div className="w-10 h-10 rounded-lg bg-accent-soft/30 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-accent-soft/30 rounded w-36" />
                    <div className="h-3 bg-accent-soft/30 rounded w-24" />
                  </div>
                  <div className="h-5 bg-accent-soft/30 rounded w-20" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No orders yet"
              description="Browse brands and add products to place your first order."
            />
          ) : (
            <div className="divide-y divide-accent-soft/50">
              {orders.map(order => {
                const config = STATUS_CONFIG[order.status];
                return (
                  <Link
                    key={order.id}
                    to={`/portal/orders/${order.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-background/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-accent-soft" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-graphite font-sans">{order.order_number}</p>
                        {config && <Badge variant={config.variant}>{config.label}</Badge>}
                      </div>
                      <p className="text-xs text-graphite/60 font-sans">
                        {order.brand_name} · {order.items_count} item{order.items_count !== 1 ? 's' : ''} · {formatDate(order.created_at)}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <p className="hidden sm:block text-sm font-semibold text-graphite font-sans">
                        ${order.subtotal.toFixed(2)}
                      </p>
                      <ChevronRight className="w-4 h-4 text-accent-soft group-hover:text-graphite/60 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
    </div>
  );
}
