// OrderDetail.tsx — /account/orders/:id — Order detail (LIVE — orders, order_items tables, protected route)
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft, Package, CheckCircle, Clock, Truck, CircleDot } from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useOrderDetail } from '../../lib/shop/useOrders';
import { formatCents } from '../../lib/shop/types';

const TIMELINE_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'] as const;
const TIMELINE_ICONS: Record<string, React.ElementType> = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { order, items, loading, error } = useOrderDetail(id);

  if (loading) {
    return (
      <>
        <MainNav />
        <div className="min-h-screen bg-mn-bg flex items-center justify-center">
          <div className="space-y-3 w-40">
            <div className="h-2.5 bg-graphite/10 rounded-full animate-pulse" />
            <div className="h-2.5 bg-graphite/10 rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <MainNav />
        <div className="min-h-screen bg-mn-bg flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-sans text-graphite/60">Order not found</p>
            <Link to="/account/orders" className="text-accent text-sm font-sans mt-4 inline-block hover:underline">Back to Orders</Link>
          </div>
        </div>
      </>
    );
  }

  const currentStepIdx = TIMELINE_STEPS.indexOf(order.status as typeof TIMELINE_STEPS[number]);

  return (
    <>
      <Helmet>
        <title>Order #{order.order_number} | Socelle</title>
      </Helmet>
      <MainNav />

      <main className="min-h-screen bg-mn-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <Link to="/account/orders" className="inline-flex items-center gap-1 text-sm font-sans text-accent hover:underline mb-6">
            <ChevronLeft className="w-4 h-4" /> All Orders
          </Link>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-subsection text-graphite">Order #{order.order_number}</h1>
              <p className="text-sm font-sans text-graphite/50 mt-1">
                Placed {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <span className="text-2xl font-sans font-bold text-graphite">{formatCents(order.total_cents)}</span>
          </div>

          {/* Status Timeline */}
          {order.status !== 'cancelled' && order.status !== 'refunded' && (
            <div className="bg-mn-card rounded-card p-6 shadow-soft mb-8">
              <p className="text-label text-graphite/60 mb-4">Order Status</p>
              <div className="flex items-center justify-between">
                {TIMELINE_STEPS.map((s, i) => {
                  const Icon = TIMELINE_ICONS[s] ?? CircleDot;
                  const isActive = i <= currentStepIdx;
                  return (
                    <div key={s} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-accent text-white' : 'bg-graphite/5 text-graphite/30'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-sans font-semibold uppercase mt-1.5 ${isActive ? 'text-accent' : 'text-graphite/30'}`}>
                          {s}
                        </span>
                      </div>
                      {i < TIMELINE_STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 ${i < currentStepIdx ? 'bg-accent' : 'bg-graphite/10'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="bg-mn-card rounded-card p-6 shadow-soft mb-8">
            <p className="text-label text-graphite/60 mb-4">Items</p>
            <div className="space-y-4">
              {items.map(item => {
                const snapshot = item.product_snapshot as Record<string, unknown> | null;
                return (
                  <div key={item.id} className="flex items-center justify-between py-3 border-b border-graphite/5 last:border-0">
                    <div>
                      <p className="text-sm font-sans font-semibold text-graphite">
                        {(snapshot?.name as string) ?? 'Product'}
                      </p>
                      <p className="text-xs font-sans text-graphite/50">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-sans font-bold text-graphite">{formatCents(item.total_price_cents)}</p>
                      <p className="text-xs font-sans text-graphite/40">{formatCents(item.unit_price_cents)} each</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="bg-mn-card rounded-card p-6 shadow-soft mb-8">
              <p className="text-label text-graphite/60 mb-3">Shipping Address</p>
              {(() => {
                const addr = order.shipping_address as Record<string, string>;
                return (
                  <div className="text-sm font-sans text-graphite/70 space-y-0.5">
                    <p className="font-semibold text-graphite">{addr.name}</p>
                    <p>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                    <p>{addr.city}, {addr.state} {addr.zip}</p>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Summary */}
          <div className="bg-mn-card rounded-card p-6 shadow-soft">
            <p className="text-label text-graphite/60 mb-4">Order Summary</p>
            <div className="space-y-2 text-sm font-sans">
              <div className="flex justify-between text-graphite/70"><span>Subtotal</span><span>{formatCents(order.subtotal_cents)}</span></div>
              {order.discount_cents > 0 && <div className="flex justify-between text-signal-up"><span>Discount</span><span>-{formatCents(order.discount_cents)}</span></div>}
              <div className="flex justify-between text-graphite/70"><span>Shipping</span><span>{formatCents(order.shipping_cents)}</span></div>
              <div className="flex justify-between text-graphite/70"><span>Tax</span><span>{formatCents(order.tax_cents)}</span></div>
              <div className="flex justify-between font-bold text-graphite text-base pt-3 border-t border-graphite/10">
                <span>Total</span><span>{formatCents(order.total_cents)}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
