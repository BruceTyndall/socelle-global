// ShopCheckout.tsx — /shop/checkout — Multi-step checkout
// Data: LIVE — carts + cart_items + shipping_methods tables + shop-checkout edge function
import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ArrowRight, Check, Truck, CreditCard, ClipboardCheck, ShoppingBag } from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useShopCart } from '../../lib/shop/useShopCart';
import { useShippingMethods } from '../../lib/shop/useShippingMethods';
import { formatCents } from '../../lib/shop/types';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

type Step = 'shipping' | 'payment' | 'review' | 'confirmation';
const STEPS: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: 'shipping', label: 'Shipping', icon: Truck },
  { key: 'payment', label: 'Payment', icon: CreditCard },
  { key: 'review', label: 'Review', icon: ClipboardCheck },
  { key: 'confirmation', label: 'Confirmed', icon: Check },
];

interface ShippingInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

const EMPTY_SHIPPING: ShippingInfo = {
  first_name: '', last_name: '', email: '', phone: '',
  address_line1: '', address_line2: '', city: '', state: '', zip: '', country: 'US',
};

export default function ShopCheckout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, summary, clearCart, loading: cartLoading } = useShopCart();
  const { methods: shippingMethods, loading: shippingLoading } = useShippingMethods();

  const [step, setStep] = useState<Step>('shipping');
  const [shipping, setShipping] = useState<ShippingInfo>(EMPTY_SHIPPING);
  const [selectedShipping, setSelectedShipping] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);

  const currentStepIdx = STEPS.findIndex(s => s.key === step);

  const selectedMethod = useMemo(
    () => shippingMethods.find(m => m.id === selectedShipping),
    [shippingMethods, selectedShipping],
  );

  const getShippingPrice = (method?: { price_cents?: number; base_rate_cents?: number }) =>
    method?.price_cents ?? method?.base_rate_cents ?? 0;

  const shippingCost = getShippingPrice(selectedMethod);
  const estimatedTotal = summary.subtotal_cents + shippingCost;

  const shippingValid = shipping.first_name.trim() && shipping.last_name.trim() &&
    shipping.email.trim() && shipping.address_line1.trim() &&
    shipping.city.trim() && shipping.state.trim() && shipping.zip.trim();

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    setOrderError('');
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shop-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            shipping_address: shipping,
            shipping_method_id: selectedShipping || null,
          }),
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Checkout failed' }));
        throw new Error(err.error || 'Checkout failed');
      }

      const data = await res.json();
      setOrderId(data.order_id ?? null);
      await clearCart();
      setStep('confirmation');
    } catch (e: unknown) {
      setOrderError(e instanceof Error ? e.message : 'Checkout failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field: keyof ShippingInfo, value: string) => {
    setShipping(prev => ({ ...prev, [field]: value }));
  };

  if (cartLoading || shippingLoading) {
    return (
      <>
        <MainNav />
        <main className="min-h-screen bg-mn-bg pt-28 pb-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 animate-pulse space-y-6">
            <div className="h-10 bg-graphite/10 rounded w-1/3" />
            <div className="h-64 bg-mn-card rounded-xl" />
          </div>
        </main>
      </>
    );
  }

  if (items.length === 0 && step !== 'confirmation') {
    return (
      <>
        <MainNav />
        <main className="min-h-screen bg-mn-bg pt-28 pb-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center py-20">
            <ShoppingBag className="w-14 h-14 text-graphite/15 mx-auto mb-4" />
            <h1 className="text-xl font-sans font-semibold text-graphite mb-2">Your cart is empty</h1>
            <p className="text-sm font-sans text-graphite/50 mb-6">Add products to your cart before checking out.</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 h-11 px-6 bg-mn-dark text-white text-sm font-sans font-semibold rounded-full hover:bg-graphite transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Checkout | SOCELLE</title>
        <meta name="description" content="Complete your purchase on SOCELLE." />
      </Helmet>
      <MainNav />

      <main className="min-h-screen bg-mn-bg pt-28 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Step Progress */}
          <div className="flex items-center justify-between mb-10">
            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              const completed = idx < currentStepIdx;
              const active = idx === currentStepIdx;
              return (
                <div key={s.key} className="flex items-center gap-2 flex-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-sans font-semibold flex-shrink-0 ${completed ? 'bg-signal-up text-white' : active ? 'bg-mn-dark text-white' : 'bg-graphite/10 text-graphite/40'}`}>
                    {completed ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-xs font-sans font-medium hidden sm:block ${active ? 'text-graphite' : 'text-graphite/40'}`}>{s.label}</span>
                  {idx < STEPS.length - 1 && (
                    <div className={`flex-1 h-px mx-2 ${completed ? 'bg-signal-up' : 'bg-graphite/10'}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Shipping Step */}
          {step === 'shipping' && (
            <div className="bg-mn-card rounded-xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-sans font-semibold text-graphite mb-6">Shipping Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-sans font-medium text-graphite block mb-1">First Name *</label>
                  <input type="text" value={shipping.first_name} onChange={e => updateField('first_name', e.target.value)} className="w-full px-4 py-2.5 bg-mn-bg border border-graphite/10 rounded-lg text-sm font-sans text-graphite focus:outline-none focus:ring-2 focus:ring-accent/30" />
                </div>
                <div>
                  <label className="text-sm font-sans font-medium text-graphite block mb-1">Last Name *</label>
                  <input type="text" value={shipping.last_name} onChange={e => updateField('last_name', e.target.value)} className="w-full px-4 py-2.5 bg-mn-bg border border-graphite/10 rounded-lg text-sm font-sans text-graphite focus:outline-none focus:ring-2 focus:ring-accent/30" />
                </div>
                <div>
                  <label className="text-sm font-sans font-medium text-graphite block mb-1">Email *</label>
                  <input type="email" value={shipping.email} onChange={e => updateField('email', e.target.value)} className="w-full px-4 py-2.5 bg-mn-bg border border-graphite/10 rounded-lg text-sm font-sans text-graphite focus:outline-none focus:ring-2 focus:ring-accent/30" />
                </div>
                <div>
                  <label className="text-sm font-sans font-medium text-graphite block mb-1">Phone</label>
                  <input type="tel" value={shipping.phone} onChange={e => updateField('phone', e.target.value)} className="w-full px-4 py-2.5 bg-mn-bg border border-graphite/10 rounded-lg text-sm font-sans text-graphite focus:outline-none focus:ring-2 focus:ring-accent/30" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-sans font-medium text-graphite block mb-1">Address Line 1 *</label>
                  <input type="text" value={shipping.address_line1} onChange={e => updateField('address_line1', e.target.value)} className="w-full px-4 py-2.5 bg-mn-bg border border-graphite/10 rounded-lg text-sm font-sans text-graphite focus:outline-none focus:ring-2 focus:ring-accent/30" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-sans font-medium text-graphite block mb-1">Address Line 2</label>
                  <input type="text" value={shipping.address_line2} onChange={e => updateField('address_line2', e.target.value)} className="w-full px-4 py-2.5 bg-mn-bg border border-graphite/10 rounded-lg text-sm font-sans text-graphite focus:outline-none focus:ring-2 focus:ring-accent/30" />
                </div>
                <div>
                  <label className="text-sm font-sans font-medium text-graphite block mb-1">City *</label>
                  <input type="text" value={shipping.city} onChange={e => updateField('city', e.target.value)} className="w-full px-4 py-2.5 bg-mn-bg border border-graphite/10 rounded-lg text-sm font-sans text-graphite focus:outline-none focus:ring-2 focus:ring-accent/30" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-sans font-medium text-graphite block mb-1">State *</label>
                    <input type="text" value={shipping.state} onChange={e => updateField('state', e.target.value)} className="w-full px-4 py-2.5 bg-mn-bg border border-graphite/10 rounded-lg text-sm font-sans text-graphite focus:outline-none focus:ring-2 focus:ring-accent/30" />
                  </div>
                  <div>
                    <label className="text-sm font-sans font-medium text-graphite block mb-1">ZIP *</label>
                    <input type="text" value={shipping.zip} onChange={e => updateField('zip', e.target.value)} className="w-full px-4 py-2.5 bg-mn-bg border border-graphite/10 rounded-lg text-sm font-sans text-graphite focus:outline-none focus:ring-2 focus:ring-accent/30" />
                  </div>
                </div>
              </div>

              {/* Shipping Method */}
              {shippingMethods.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-sm font-sans font-semibold text-graphite mb-3">Shipping Method</h3>
                  <div className="space-y-2">
                    {shippingMethods.map(m => (
                      <label
                        key={m.id}
                        className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${selectedShipping === m.id ? 'border-accent bg-accent/5' : 'border-graphite/10 hover:border-graphite/20'}`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping"
                            value={m.id}
                            checked={selectedShipping === m.id}
                            onChange={() => setSelectedShipping(m.id)}
                            className="text-accent focus:ring-accent"
                          />
                          <div>
                            <p className="text-sm font-sans font-semibold text-graphite">{m.name}</p>
                            {m.description && (
                              <p className="text-xs font-sans text-graphite/50">{String(m.description)}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-sans font-semibold text-graphite">
                          {getShippingPrice(m) === 0 ? 'Free' : formatCents(getShippingPrice(m))}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <Link to="/shop/cart" className="flex items-center gap-2 text-sm font-sans text-graphite/60 hover:text-graphite transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back to Cart
                </Link>
                <button
                  onClick={() => setStep('payment')}
                  disabled={!shippingValid}
                  className="h-11 px-6 bg-mn-dark text-white text-sm font-sans font-semibold rounded-full hover:bg-graphite transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Continue to Payment <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Payment Step */}
          {step === 'payment' && (
            <div className="bg-mn-card rounded-xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-sans font-semibold text-graphite mb-6">Payment</h2>

              {!user && (
                <div className="bg-signal-warn/10 text-signal-warn text-sm font-sans px-4 py-3 rounded-lg mb-6">
                  <strong>Note:</strong> Sign in for faster checkout and order tracking.{' '}
                  <Link to="/portal/login" className="underline">Sign In</Link>
                </div>
              )}

              <div className="bg-mn-bg rounded-lg p-6 border border-graphite/10 text-center">
                <CreditCard className="w-10 h-10 text-graphite/20 mx-auto mb-3" />
                <p className="text-sm font-sans text-graphite/60 mb-1">
                  Payment processing will be handled securely via Stripe.
                </p>
                <p className="text-xs font-sans text-graphite/40">
                  Payment bypass is currently active for development. Orders will be created without charge.
                </p>
              </div>

              <div className="flex justify-between mt-8">
                <button onClick={() => setStep('shipping')} className="flex items-center gap-2 text-sm font-sans text-graphite/60 hover:text-graphite transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={() => setStep('review')}
                  className="h-11 px-6 bg-mn-dark text-white text-sm font-sans font-semibold rounded-full hover:bg-graphite transition-colors flex items-center gap-2"
                >
                  Review Order <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Review Step */}
          {step === 'review' && (
            <div className="bg-mn-card rounded-xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-sans font-semibold text-graphite mb-6">Review Your Order</h2>

              {/* Shipping Summary */}
              <div className="mb-6">
                <h3 className="text-sm font-sans font-semibold text-graphite/50 uppercase tracking-wider mb-2">Shipping To</h3>
                <p className="text-sm font-sans text-graphite">
                  {shipping.first_name} {shipping.last_name}<br />
                  {shipping.address_line1}{shipping.address_line2 ? `, ${shipping.address_line2}` : ''}<br />
                  {shipping.city}, {shipping.state} {shipping.zip}
                </p>
                {selectedMethod && (
                  <p className="text-sm font-sans text-graphite/60 mt-1">
                    {selectedMethod.name} — {getShippingPrice(selectedMethod) === 0 ? 'Free' : formatCents(getShippingPrice(selectedMethod))}
                  </p>
                )}
              </div>

              {/* Items Summary */}
              <div className="border-t border-graphite/10 pt-4 mb-6">
                <h3 className="text-sm font-sans font-semibold text-graphite/50 uppercase tracking-wider mb-3">Items ({summary.item_count})</h3>
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm font-sans">
                      <span className="text-graphite">
                        {item.product?.name ?? 'Product'} x{item.quantity}
                        {item.variant?.name ? ` (${item.variant.name})` : ''}
                      </span>
                      <span className="text-graphite font-semibold">{formatCents(item.unit_price_cents * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-graphite/10 pt-4 space-y-2 text-sm font-sans">
                <div className="flex justify-between text-graphite/70">
                  <span>Subtotal</span>
                  <span>{formatCents(summary.subtotal_cents)}</span>
                </div>
                <div className="flex justify-between text-graphite/70">
                  <span>Shipping</span>
                  <span>{shippingCost > 0 ? formatCents(shippingCost) : 'Free'}</span>
                </div>
                <div className="flex justify-between font-semibold text-graphite border-t border-graphite/10 pt-2">
                  <span>Total</span>
                  <span>{formatCents(estimatedTotal)}</span>
                </div>
              </div>

              {orderError && (
                <div className="mt-4 bg-signal-down/10 text-signal-down text-sm font-sans px-4 py-3 rounded-lg">
                  {orderError}
                </div>
              )}

              <div className="flex justify-between mt-8">
                <button onClick={() => setStep('payment')} className="flex items-center gap-2 text-sm font-sans text-graphite/60 hover:text-graphite transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                  className="h-11 px-8 bg-mn-dark text-white text-sm font-sans font-semibold rounded-full hover:bg-graphite transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? 'Placing Order...' : 'Place Order'}
                  {!submitting && <Check className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Confirmation Step */}
          {step === 'confirmation' && (
            <div className="bg-mn-card rounded-xl p-8 sm:p-12 shadow-sm text-center">
              <div className="w-16 h-16 bg-signal-up/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-signal-up" />
              </div>
              <h2 className="text-2xl font-sans font-semibold text-graphite mb-2">Order Confirmed</h2>
              <p className="text-sm font-sans text-graphite/60 mb-1">Thank you for your purchase.</p>
              {orderId && (
                <p className="text-sm font-sans text-graphite/50 mb-6">
                  Order ID: <span className="font-mono text-graphite">{orderId.slice(0, 8)}</span>
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {orderId && user && (
                  <button
                    onClick={() => navigate(`/shop/orders/${orderId}`)}
                    className="h-11 px-6 bg-mn-dark text-white text-sm font-sans font-semibold rounded-full hover:bg-graphite transition-colors"
                  >
                    View Order Details
                  </button>
                )}
                <Link
                  to="/shop"
                  className="h-11 px-6 border border-graphite/15 text-graphite text-sm font-sans font-semibold rounded-full hover:bg-mn-surface transition-colors flex items-center justify-center"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
