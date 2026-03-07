// ShopOrderDetail.tsx — /shop/orders/:id — Order detail with status timeline
// Data: LIVE — orders + order_items tables
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Package, Check, Truck, Clock, X as XIcon } from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useOrderDetail } from '../../lib/shop/useOrders';
import { formatCents } from '../../lib/shop/types';

const TIMELINE_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: Check },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Check },
] as const;

const STATUS_ORDER: Record<string, number> = {
  pending: 0, confirmed: 1, processing: 2, shipped: 3, delivered: 4,
  cancelled: -1, refunded: -1,
};

export default function ShopOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { order, items, loading, error } = useOrderDetail(id);

  if (loading) {
    return (
      <>
        <MainNav />
        <main className="min-h-screen bg-mn-bg pt-28 pb-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 animate-pulse space-y-6">
            <div className="h-8 bg-graphite/10 rounded w-1/3" />
            <div className="h-48 bg-mn-card rounded-xl" />
          </div>
        </main>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <MainNav />
        <main className="min-h-screen bg-mn-bg pt-28 pb-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center py-20">
            <Package className="w-12 h-12 text-graphite/20 mx-auto mb-4" />
            <h1 className="text-xl font-sans font-semibold text-graphite mb-2">Order Not Found</h1>
            <p className="text-sm font-sans text-graphite/50 mb-6">{error || 'This order does not exist or you do not have access.'}</p>
            <Link to="/shop/orders" className="inline-flex items-center gap-2 h-11 px-6 bg-mn-dark text-white text-sm font-sans font-semibold rounded-full hover:bg-graphite transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Orders
            </Link>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const currentStep = STATUS_ORDER[order.status] ?? -1;
  const isCancelled = order.status === 'cancelled' || order.status === 'refunded';

  return (
    <>
      <Helmet>
        <title>Order #{order.id.slice(0, 8)} | SOCELLE</title>
        <meta name="description" content="View your order details on SOCELLE." />
      </Helmet>
      <MainNav />

      <main className="min-h-screen bg-mn-bg pt-28 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <Link to="/shop/orders" className="flex items-center gap-2 text-sm font-sans text-graphite/50 hover:text-graphite transition-colors mb-6">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Orders
          </Link>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-sans font-semibold text-graphite">Order #{order.id.slice(0, 8)}</h1>
              <p className="text-sm font-sans text-graphite/50 mt-1">
                Placed on {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            {isCancelled && (
              <span className="inline-flex items-center gap-1.5 text-xs font-sans font-semibold bg-signal-down/10 text-signal-down px-3 py-1.5 rounded-full">
                <XIcon className="w-3.5 h-3.5" />
                {order.status === 'cancelled' ? 'Cancelled' : 'Refunded'}
              </span>
            )}
          </div>

          {/* Status Timeline */}
          {!isCancelled && (
            <div className="bg-mn-card rounded-xl p-6 shadow-sm mb-6">
              <h2 className="text-sm font-sans font-semibold text-graphite/50 uppercase tracking-wider mb-6">Order Status</h2>
              <div className="flex items-center justify-between">
                {TIMELINE_STEPS.map((s, idx) => {
                  const Icon = s.icon;
                  const completed = idx <= currentStep;
                  const active = idx === currentStep;
                  return (
                    <div key={s.key} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${completed ? (active ? 'bg-mn-dark text-white' : 'bg-signal-up text-white') : 'bg-graphite/10 text-graphite/30'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] font-sans font-medium mt-2 text-center ${completed ? 'text-graphite' : 'text-graphite/30'}`}>{s.label}</span>
                      </div>
                      {idx < TIMELINE_STEPS.length - 1 && (
                        <div className={`flex-1 h-px mx-2 -mt-5 ${idx < currentStep ? 'bg-signal-up' : 'bg-graphite/10'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-mn-card rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-sm font-sans font-semibold text-graphite/50 uppercase tracking-wider mb-4">Items</h2>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-graphite/5 last:border-0">
                  <div>
                    <p className="text-sm font-sans font-semibold text-graphite">
                      {item.product_name ?? `Product`}
                    </p>
                    {item.variant_name && (
                      <p className="text-xs font-sans text-graphite/50">{item.variant_name}</p>
                    )}
                    <p className="text-xs font-sans text-graphite/40">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-sans font-semibold text-graphite">
                    {formatCents(item.unit_price_cents * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-mn-card rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-sans font-semibold text-graphite/50 uppercase tracking-wider mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm font-sans">
              <div className="flex justify-between text-graphite/70">
                <span>Subtotal</span>
                <span>{formatCents(order.subtotal_cents)}</span>
              </div>
              {order.discount_cents > 0 && (
                <div className="flex justify-between text-signal-up">
                  <span>Discount</span>
                  <span>-{formatCents(order.discount_cents)}</span>
                </div>
              )}
              <div className="flex justify-between text-graphite/70">
                <span>Shipping</span>
                <span>{order.shipping_cents > 0 ? formatCents(order.shipping_cents) : 'Free'}</span>
              </div>
              {order.tax_cents > 0 && (
                <div className="flex justify-between text-graphite/70">
                  <span>Tax</span>
                  <span>{formatCents(order.tax_cents)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-graphite border-t border-graphite/10 pt-2">
                <span>Total</span>
                <span>{formatCents(order.total_cents)}</span>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shipping_address && (
              <div className="mt-6 pt-4 border-t border-graphite/10">
                <h3 className="text-xs font-sans font-semibold text-graphite/50 uppercase tracking-wider mb-2">Shipped To</h3>
                <p className="text-sm font-sans text-graphite/70 whitespace-pre-line">
                  {typeof order.shipping_address === 'object'
                    ? Object.values(order.shipping_address as Record<string, string>).filter(Boolean).join('\n')
                    : String(order.shipping_address)}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
