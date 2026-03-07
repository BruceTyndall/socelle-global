// Checkout.tsx — /checkout — Multi-step checkout with Stripe Elements (LIVE — orders, carts tables)
import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ChevronLeft, CheckCircle, Truck, CreditCard, ClipboardList, Loader2 } from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useShopCart } from '../../lib/shop/useShopCart';
import { useShippingMethods } from '../../lib/shop/useShippingMethods';
import { useAuth } from '../../lib/auth';
import { formatCents } from '../../lib/shop/types';
import { supabase } from '../../lib/supabase';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const STEPS = [
  { key: 'shipping', label: 'Shipping', icon: Truck },
  { key: 'payment', label: 'Payment', icon: CreditCard },
  { key: 'review', label: 'Review', icon: ClipboardList },
  { key: 'confirmation', label: 'Confirmation', icon: CheckCircle },
] as const;

type Step = typeof STEPS[number]['key'];

interface Address {
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

const emptyAddress: Address = { name: '', line1: '', line2: '', city: '', state: '', zip: '', country: 'US' };

function CheckoutForm() {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const { items, summary, cartId, clearCart } = useShopCart();
  const { methods: shippingMethods } = useShippingMethods();

  const [step, setStep] = useState<Step>('shipping');
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [selectedShipping, setSelectedShipping] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const selectedMethod = useMemo(
    () => shippingMethods.find(m => m.id === selectedShipping),
    [shippingMethods, selectedShipping]
  );

  const shippingCost = useMemo(() => {
    if (!selectedMethod) return 0;
    if (selectedMethod.free_above_cents && summary.subtotal_cents >= selectedMethod.free_above_cents) return 0;
    return selectedMethod.base_rate_cents + selectedMethod.per_item_rate_cents * summary.item_count;
  }, [selectedMethod, summary]);

  const totalWithShipping = summary.subtotal_cents + shippingCost + summary.tax_cents - summary.discount_cents;

  const canProceedShipping = address.name && address.line1 && address.city && address.state && address.zip && selectedShipping;

  const handlePlaceOrder = async () => {
    if (!stripe || !elements || !user) return;
    setProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      // Call shop-checkout edge function
      const { data, error: fnErr } = await supabase.functions.invoke('shop-checkout', {
        body: {
          cart_id: cartId,
          shipping_address: address,
          shipping_method_id: selectedShipping,
          user_id: user.id,
        },
      });
      if (fnErr) throw fnErr;

      const { client_secret, order_number } = data;

      if (client_secret) {
        const { error: stripeError } = await stripe.confirmCardPayment(client_secret, {
          payment_method: { card: cardElement },
        });
        if (stripeError) throw new Error(stripeError.message);
      }

      setOrderNumber(order_number);
      await clearCart();
      setStep('confirmation');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const stepIndex = STEPS.findIndex(s => s.key === step);

  if (items.length === 0 && step !== 'confirmation') {
    return (
      <div className="text-center py-20">
        <p className="text-lg font-sans text-graphite/60 mb-4">Your cart is empty</p>
        <Link to="/shop" className="text-accent text-sm font-sans hover:underline">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === stepIndex;
          const isComplete = i < stepIndex;
          return (
            <div key={s.key} className="flex items-center">
              {i > 0 && <div className={`w-8 lg:w-16 h-px mx-1 ${isComplete ? 'bg-accent' : 'bg-graphite/10'}`} />}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-xs font-sans font-semibold transition-colors ${
                isActive ? 'bg-accent/10 text-accent' : isComplete ? 'text-accent' : 'text-graphite/30'
              }`}>
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="bg-signal-down/10 text-signal-down text-sm font-sans p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* Step 1: Shipping */}
      {step === 'shipping' && (
        <div className="bg-mn-card rounded-card p-6 lg:p-8 shadow-soft">
          <h2 className="text-subsection text-graphite mb-6">Shipping Address</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-label text-graphite/60 mb-1 block">Full Name</label>
              <input value={address.name} onChange={e => setAddress(a => ({ ...a, name: e.target.value }))} className="w-full h-10 px-4 rounded-lg border border-graphite/10 text-sm font-sans text-graphite focus:outline-none focus:ring-1 focus:ring-accent" />
            </div>
            <div className="md:col-span-2">
              <label className="text-label text-graphite/60 mb-1 block">Address Line 1</label>
              <input value={address.line1} onChange={e => setAddress(a => ({ ...a, line1: e.target.value }))} className="w-full h-10 px-4 rounded-lg border border-graphite/10 text-sm font-sans text-graphite focus:outline-none focus:ring-1 focus:ring-accent" />
            </div>
            <div className="md:col-span-2">
              <label className="text-label text-graphite/60 mb-1 block">Address Line 2 (optional)</label>
              <input value={address.line2} onChange={e => setAddress(a => ({ ...a, line2: e.target.value }))} className="w-full h-10 px-4 rounded-lg border border-graphite/10 text-sm font-sans text-graphite focus:outline-none focus:ring-1 focus:ring-accent" />
            </div>
            <div>
              <label className="text-label text-graphite/60 mb-1 block">City</label>
              <input value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))} className="w-full h-10 px-4 rounded-lg border border-graphite/10 text-sm font-sans text-graphite focus:outline-none focus:ring-1 focus:ring-accent" />
            </div>
            <div>
              <label className="text-label text-graphite/60 mb-1 block">State</label>
              <input value={address.state} onChange={e => setAddress(a => ({ ...a, state: e.target.value }))} className="w-full h-10 px-4 rounded-lg border border-graphite/10 text-sm font-sans text-graphite focus:outline-none focus:ring-1 focus:ring-accent" />
            </div>
            <div>
              <label className="text-label text-graphite/60 mb-1 block">ZIP Code</label>
              <input value={address.zip} onChange={e => setAddress(a => ({ ...a, zip: e.target.value }))} className="w-full h-10 px-4 rounded-lg border border-graphite/10 text-sm font-sans text-graphite focus:outline-none focus:ring-1 focus:ring-accent" />
            </div>
            <div>
              <label className="text-label text-graphite/60 mb-1 block">Country</label>
              <input value={address.country} onChange={e => setAddress(a => ({ ...a, country: e.target.value }))} className="w-full h-10 px-4 rounded-lg border border-graphite/10 text-sm font-sans text-graphite focus:outline-none focus:ring-1 focus:ring-accent" />
            </div>
          </div>

          <h3 className="text-lg font-sans font-semibold text-graphite mt-8 mb-4">Shipping Method</h3>
          <div className="space-y-3">
            {shippingMethods.map(m => {
              const cost = (m.free_above_cents && summary.subtotal_cents >= m.free_above_cents) ? 0 : m.base_rate_cents + m.per_item_rate_cents * summary.item_count;
              return (
                <label key={m.id} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${selectedShipping === m.id ? 'border-accent bg-accent/5' : 'border-graphite/10 hover:border-graphite/20'}`}>
                  <input type="radio" name="shipping" value={m.id} checked={selectedShipping === m.id} onChange={() => setSelectedShipping(m.id)} className="text-accent focus:ring-accent" />
                  <div className="flex-1">
                    <p className="text-sm font-sans font-semibold text-graphite">{m.name}</p>
                    {m.description && <p className="text-xs font-sans text-graphite/50">{m.description}</p>}
                    {m.estimated_days_min != null && m.estimated_days_max != null && (
                      <p className="text-xs font-sans text-graphite/40 mt-0.5">{m.estimated_days_min}-{m.estimated_days_max} business days</p>
                    )}
                  </div>
                  <span className="text-sm font-sans font-semibold text-graphite">{cost === 0 ? 'FREE' : formatCents(cost)}</span>
                </label>
              );
            })}
          </div>

          <div className="flex justify-end mt-8">
            <button
              onClick={() => setStep('payment')}
              disabled={!canProceedShipping}
              className="h-12 px-8 bg-mn-dark text-white text-sm font-sans font-semibold rounded-pill hover:bg-graphite transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue to Payment
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Payment */}
      {step === 'payment' && (
        <div className="bg-mn-card rounded-card p-6 lg:p-8 shadow-soft">
          <h2 className="text-subsection text-graphite mb-6">Payment</h2>
          <div className="border border-graphite/10 rounded-xl p-4">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    fontFamily: '"General Sans", system-ui, sans-serif',
                    color: '#141418',
                    '::placeholder': { color: '#14141860' },
                  },
                  invalid: { color: '#8E6464' },
                },
              }}
            />
          </div>
          <div className="flex justify-between mt-8">
            <button onClick={() => setStep('shipping')} className="text-sm font-sans text-accent hover:underline flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => setStep('review')}
              className="h-12 px-8 bg-mn-dark text-white text-sm font-sans font-semibold rounded-pill hover:bg-graphite transition-colors"
            >
              Review Order
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 'review' && (
        <div className="bg-mn-card rounded-card p-6 lg:p-8 shadow-soft">
          <h2 className="text-subsection text-graphite mb-6">Review Your Order</h2>

          <div className="mb-6">
            <p className="text-label text-graphite/60 mb-2">Shipping To</p>
            <p className="text-sm font-sans text-graphite">{address.name}</p>
            <p className="text-sm font-sans text-graphite/70">{address.line1}{address.line2 ? `, ${address.line2}` : ''}</p>
            <p className="text-sm font-sans text-graphite/70">{address.city}, {address.state} {address.zip}</p>
          </div>

          {selectedMethod && (
            <div className="mb-6">
              <p className="text-label text-graphite/60 mb-2">Shipping Method</p>
              <p className="text-sm font-sans text-graphite">{selectedMethod.name} — {shippingCost === 0 ? 'FREE' : formatCents(shippingCost)}</p>
            </div>
          )}

          <div className="mb-6">
            <p className="text-label text-graphite/60 mb-3">Items ({summary.item_count})</p>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm font-sans">
                  <span className="text-graphite">{item.product?.name ?? 'Product'} x{item.quantity}</span>
                  <span className="font-semibold text-graphite">{formatCents(item.unit_price_cents * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-graphite/10 pt-4 space-y-2 text-sm font-sans">
            <div className="flex justify-between text-graphite/70"><span>Subtotal</span><span>{formatCents(summary.subtotal_cents)}</span></div>
            <div className="flex justify-between text-graphite/70"><span>Shipping</span><span>{shippingCost === 0 ? 'FREE' : formatCents(shippingCost)}</span></div>
            <div className="flex justify-between text-graphite/70"><span>Tax</span><span>{formatCents(summary.tax_cents)}</span></div>
            <div className="flex justify-between font-bold text-graphite text-base pt-2 border-t border-graphite/10">
              <span>Total</span><span>{formatCents(totalWithShipping)}</span>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button onClick={() => setStep('payment')} className="text-sm font-sans text-accent hover:underline flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handlePlaceOrder}
              disabled={processing}
              className="h-12 px-8 bg-mn-dark text-white text-sm font-sans font-semibold rounded-pill hover:bg-graphite transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : 'Place Order'}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 'confirmation' && (
        <div className="bg-mn-card rounded-card p-8 lg:p-12 shadow-soft text-center">
          <CheckCircle className="w-16 h-16 text-signal-up mx-auto mb-6" />
          <h2 className="text-section text-graphite mb-3">Order Confirmed</h2>
          <p className="text-body text-graphite/60 mb-2">Thank you for your order.</p>
          {orderNumber && (
            <p className="text-lg font-mono font-semibold text-graphite mb-8">
              Order #{orderNumber}
            </p>
          )}
          <div className="flex justify-center gap-4">
            <Link
              to="/account/orders"
              className="h-12 px-8 bg-mn-dark text-white text-sm font-sans font-semibold rounded-pill hover:bg-graphite transition-colors flex items-center justify-center"
            >
              View Orders
            </Link>
            <Link
              to="/shop"
              className="h-12 px-8 border border-graphite/15 text-graphite text-sm font-sans font-semibold rounded-pill hover:bg-mn-surface transition-colors flex items-center justify-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Checkout() {
  return (
    <>
      <Helmet>
        <title>Checkout | Socelle</title>
      </Helmet>
      <MainNav />
      <main className="min-h-screen bg-mn-bg">
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </main>
      <SiteFooter />
    </>
  );
}
