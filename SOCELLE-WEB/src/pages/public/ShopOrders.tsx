// ShopOrders.tsx — /shop/orders — Order history (requires auth)
// Data: LIVE — orders table
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Package, ArrowRight, ShoppingBag } from 'lucide-react';
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

export default function ShopOrders() {
  const { orders, loading, error } = useOrders();

  return (
    <>
      <Helmet>
        <title>Order History | SOCELLE</title>
        <meta name="description" content="View your order history on SOCELLE. Track shipments and manage past purchases." />
        <meta property="og:title" content="Order History | SOCELLE" />
        <meta property="og:description" content="View your order history on SOCELLE." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <MainNav />

      <main className="min-h-screen bg-mn-bg pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-sans font-semibold text-graphite mb-8">Order History</h1>

          {loading && (
            <div className="space-y-4 animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 bg-mn-card rounded-xl" />
              ))}
            </div>
          )}

          {error && (
            <div className="bg-signal-down/10 text-signal-down text-sm font-sans px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="text-center py-20">
              <ShoppingBag className="w-14 h-14 text-graphite/15 mx-auto mb-4" />
              <h2 className="text-xl font-sans font-semibold text-graphite mb-2">No orders yet</h2>
              <p className="text-sm font-sans text-graphite/50 mb-6">When you place orders, they will appear here.</p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 h-11 px-6 bg-mn-dark text-white text-sm font-sans font-semibold rounded-full hover:bg-graphite transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          )}

          {!loading && orders.length > 0 && (
            <div className="space-y-3">
              {orders.map(order => {
                const statusClass = STATUS_COLORS[order.status] ?? 'bg-graphite/10 text-graphite/60';
                return (
                  <Link
                    key={order.id}
                    to={`/shop/orders/${order.id}`}
                    className="block bg-mn-card rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-mn-surface rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-graphite/40" />
                        </div>
                        <div>
                          <p className="text-sm font-sans font-semibold text-graphite">
                            Order #{order.id.slice(0, 8)}
                          </p>
                          <p className="text-xs font-sans text-graphite/50 mt-0.5">
                            {order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'short', day: 'numeric',
                            }) : '—'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-[10px] font-sans font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${statusClass}`}>
                          {order.status}
                        </span>
                        <span className="text-sm font-sans font-semibold text-graphite">
                          {formatCents(order.total_cents)}
                        </span>
                        <ArrowRight className="w-4 h-4 text-graphite/30" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
