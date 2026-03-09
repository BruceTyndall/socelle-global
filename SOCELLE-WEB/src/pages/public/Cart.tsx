// Cart.tsx — /cart — Shopping cart (LIVE — carts, cart_items tables)
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, Minus, Plus, Trash2, Tag, ArrowRight, ChevronLeft } from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useShopCart } from '../../lib/shop/useShopCart';
import { formatCents } from '../../lib/shop/types';
import { supabase } from '../../lib/supabase';

export default function Cart() {
  const { items, loading, summary, updateQuantity, removeItem } = useShopCart();
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState<string | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [applyingDiscount, setApplyingDiscount] = useState(false);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    setApplyingDiscount(true);
    setDiscountError(null);
    try {
      const { data, error } = await supabase.functions.invoke('validate-discount', {
        body: { code: discountCode, subtotal_cents: summary.subtotal_cents },
      });
      if (error) throw error;
      if (data?.valid) {
        setDiscountApplied(discountCode);
        setDiscountCode('');
      } else {
        setDiscountError(data?.message ?? 'Invalid discount code');
      }
    } catch {
      setDiscountError('Unable to validate discount code');
    } finally {
      setApplyingDiscount(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Shopping Cart | Socelle</title>
        <meta name="description" content="Review the items in your Socelle shopping cart before checkout." />
        <meta property="og:title" content="Shopping Cart | Socelle" />
        <meta property="og:description" content="Review your cart and proceed to checkout on Socelle." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <MainNav />

      <main className="min-h-screen bg-mn-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <Link to="/shop" className="inline-flex items-center gap-1 text-sm font-sans text-accent hover:underline mb-6">
            <ChevronLeft className="w-4 h-4" /> Continue Shopping
          </Link>

          <h1 className="text-section text-graphite mb-8">Shopping Cart</h1>

          {loading && (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="bg-mn-card rounded-card p-6 animate-pulse flex gap-4">
                  <div className="w-24 h-24 bg-graphite/5 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-graphite/5 rounded w-1/3" />
                    <div className="h-4 bg-graphite/5 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="text-center py-20">
              <ShoppingBag className="w-16 h-16 text-graphite/15 mx-auto mb-4" />
              <p className="text-lg font-sans text-graphite/60 mb-2">Your cart is empty</p>
              <p className="text-sm font-sans text-graphite/40 mb-6">Browse our collection to find products you love.</p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 h-12 px-8 bg-mn-dark text-white text-sm font-sans font-semibold rounded-pill hover:bg-graphite transition-colors"
              >
                <ShoppingBag className="w-4 h-4" /> Shop Now
              </Link>
            </div>
          )}

          {!loading && items.length > 0 && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map(item => {
                  const images = item.product ? (item.product.images as string[]) ?? [] : [];
                  return (
                    <div key={item.id} className="bg-mn-card rounded-card p-5 shadow-soft flex gap-4">
                      <div className="w-24 h-24 rounded-xl bg-mn-surface overflow-hidden flex-shrink-0">
                        {images[0] ? (
                          <img src={images[0]} alt={item.product?.name ?? ''} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-6 h-6 text-graphite/10" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-sm font-sans font-semibold text-graphite truncate">
                              {item.product?.name ?? 'Product'}
                            </h3>
                            {item.variant && (
                              <p className="text-xs font-sans text-graphite/50 mt-0.5">{item.variant.name}</p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-graphite/30 hover:text-signal-down transition-colors ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-graphite/15 rounded-pill overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center text-graphite/60 hover:text-graphite transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-sans font-semibold text-graphite">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center text-graphite/60 hover:text-graphite transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-sans font-bold text-graphite">
                              {formatCents(item.unit_price_cents * item.quantity)}
                            </p>
                            {item.quantity > 1 && (
                              <p className="text-xs font-sans text-graphite/40">
                                {formatCents(item.unit_price_cents)} each
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cart Summary */}
              <div>
                <div className="bg-mn-card rounded-card p-6 shadow-soft sticky top-20">
                  <h2 className="text-lg font-sans font-semibold text-graphite mb-5">Order Summary</h2>

                  {/* Discount Code */}
                  <div className="mb-5">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/30" />
                        <input
                          type="text"
                          value={discountCode}
                          onChange={e => setDiscountCode(e.target.value.toUpperCase())}
                          placeholder="Discount code"
                          className="w-full h-10 pl-9 pr-3 rounded-lg border border-graphite/10 text-sm font-sans text-graphite focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                      </div>
                      <button
                        onClick={handleApplyDiscount}
                        disabled={applyingDiscount || !discountCode.trim()}
                        className="h-10 px-4 bg-mn-dark text-white text-sm font-sans font-semibold rounded-lg hover:bg-graphite transition-colors disabled:opacity-40"
                      >
                        Apply
                      </button>
                    </div>
                    {discountError && <p className="text-xs font-sans text-signal-down mt-1">{discountError}</p>}
                    {discountApplied && (
                      <p className="text-xs font-sans text-signal-up mt-1">Code "{discountApplied}" applied</p>
                    )}
                  </div>

                  <div className="space-y-3 text-sm font-sans">
                    <div className="flex justify-between text-graphite/70">
                      <span>Subtotal</span>
                      <span>{formatCents(summary.subtotal_cents)}</span>
                    </div>
                    {summary.discount_cents > 0 && (
                      <div className="flex justify-between text-signal-up">
                        <span>Discount</span>
                        <span>-{formatCents(summary.discount_cents)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-graphite/70">
                      <span>Estimated Shipping</span>
                      <span>{summary.shipping_cents > 0 ? formatCents(summary.shipping_cents) : 'Calculated at checkout'}</span>
                    </div>
                    <div className="flex justify-between text-graphite/70">
                      <span>Estimated Tax</span>
                      <span>{formatCents(summary.tax_cents)}</span>
                    </div>
                    <div className="border-t border-graphite/10 pt-3 flex justify-between font-bold text-graphite text-base">
                      <span>Total</span>
                      <span>{formatCents(summary.total_cents)}</span>
                    </div>
                  </div>

                  <Link
                    to="/checkout"
                    className="mt-6 w-full h-12 bg-mn-dark text-white text-sm font-sans font-semibold rounded-pill hover:bg-graphite transition-colors flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
