// OrderHistory.tsx — /account/orders — Order list (LIVE — orders table, protected route)
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useOrders } from '../../lib/shop/useOrders';
import { formatCents } from '../../lib/shop/types';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-signal-warn/10 text-signal-warn',
  confirmed: 'bg-accent/10 text-accent',
  processing: 'bg-accent/10 text-accent',
  shipped: 'bg-signal-up/10 text-signal-up',
  delivered: 'bg-signal-up/10 text-signal-up',
  cancelled: 'bg-signal-down/10 text-signal-down',
  refunded: 'bg-signal-down/10 text-signal-down',
};

export default function OrderHistory() {
  const { orders, loading } = useOrders();

  return (
    <>
      <Helmet>
        <title>My Orders | Socelle</title>
        <meta name="description" content="View your order history and track shipments on Socelle." />
        <meta property="og:title" content="My Orders | Socelle" />
        <meta property="og:description" content="View your order history and track shipments on Socelle." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <MainNav />

      <main className="min-h-screen bg-mn-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <h1 className="text-section text-graphite mb-8">My Orders</h1>

          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-mn-card rounded-card p-6 animate-pulse">
                  <div className="h-4 bg-graphite/5 rounded w-1/4 mb-2" />
                  <div className="h-4 bg-graphite/5 rounded w-1/3" />
                </div>
              ))}
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-graphite/15 mx-auto mb-4" />
              <p className="text-lg font-sans text-graphite/60 mb-2">No orders yet</p>
              <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-sans text-accent hover:underline">
                <ShoppingBag className="w-4 h-4" /> Start Shopping
              </Link>
            </div>
          )}

          {!loading && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map(order => (
                <Link
                  key={order.id}
                  to={`/account/orders/${order.id}`}
                  className="block bg-mn-card rounded-card p-5 shadow-soft hover:shadow-panel transition-shadow group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-mono font-semibold text-graphite">#{order.order_number}</p>
                      <p className="text-xs font-sans text-graphite/50 mt-0.5">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-semibold uppercase px-2.5 py-1 rounded-pill ${STATUS_COLORS[order.status] ?? 'bg-graphite/5 text-graphite/50'}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                      <span className="text-sm font-sans font-bold text-graphite">{formatCents(order.total_cents)}</span>
                      <ChevronRight className="w-4 h-4 text-graphite/30 group-hover:text-accent transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
