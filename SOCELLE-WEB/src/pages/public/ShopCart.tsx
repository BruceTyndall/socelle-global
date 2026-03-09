// ShopCart.tsx — /shop/cart — Shopping cart page
// Data: LIVE — carts + cart_items tables
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, Minus, Plus, Trash2, Tag, ArrowLeft, ArrowRight } from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useShopCart } from '../../lib/shop/useShopCart';
import { formatCents } from '../../lib/shop/types';

export default function ShopCart() {
  const { items, loading, summary, updateQuantity, removeItem, clearCart } = useShopCart();
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountError, setDiscountError] = useState('');

  const handleApplyDiscount = async () => {
    setDiscountError('');
    if (!discountCode.trim()) return;
    // Discount validation would call validate-discount edge function
    // For now, show feedback
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/validate-discount`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: discountCode.trim() }),
        }
      );
      if (!res.ok) {
        setDiscountError('Invalid or expired discount code.');
        return;
      }
      setDiscountApplied(true);
    } catch {
      setDiscountError('Unable to validate code. Please try again.');
    }
  };

  if (loading) {
    return (
      <>
        <MainNav />
        <main className="min-h-screen bg-mn-bg pt-28 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="space-y-4 animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 bg-mn-card rounded-xl" />
              ))}
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Shopping Cart | SOCELLE</title>
        <meta name="description" content="Review your cart and proceed to checkout on SOCELLE. Professional beauty products." />
        <meta property="og:title" content="Shopping Cart | SOCELLE" />
        <meta property="og:description" content="Review your cart and proceed to checkout on SOCELLE." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <MainNav />

      <main className="min-h-screen bg-mn-bg pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl sm:text-3xl font-sans font-semibold text-graphite">
              Shopping Cart
              {items.length > 0 && (
                <span className="text-graphite/40 text-lg ml-2">({summary.item_count} item{summary.item_count !== 1 ? 's' : ''})</span>
              )}
            </h1>
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-sm font-sans text-signal-down hover:text-signal-down/80 transition-colors"
              >
                Clear Cart
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-14 h-14 text-graphite/15 mx-auto mb-4" />
              <h2 className="text-xl font-sans font-semibold text-graphite mb-2">Your cart is empty</h2>
              <p className="text-sm font-sans text-graphite/50 mb-8">Discover products through our intelligence-driven marketplace.</p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 h-11 px-6 bg-mn-dark text-white text-sm font-sans font-semibold rounded-full hover:bg-graphite transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-3">
                {items.map(item => {
                  const images = (item.product?.images as string[]) ?? [];
                  const productName = item.product?.name ?? 'Product';
                  const variantName = item.variant?.name;
                  return (
                    <div key={item.id} className="bg-mn-card rounded-xl p-4 shadow-sm flex gap-4">
                      <div className="w-20 h-20 bg-mn-surface rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={images[0] ?? '/placeholder-product.svg'}
                          alt={productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Link
                              to={`/shop/product/${item.product?.slug ?? ''}`}
                              className="text-sm font-sans font-semibold text-graphite hover:text-accent transition-colors line-clamp-1"
                            >
                              {productName}
                            </Link>
                            {variantName && (
                              <p className="text-xs font-sans text-graphite/50 mt-0.5">{variantName}</p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-graphite/30 hover:text-signal-down transition-colors p-1"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-graphite/15 rounded-lg overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center text-graphite/60 hover:text-graphite transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm font-sans font-semibold text-graphite">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center text-graphite/60 hover:text-graphite transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-sm font-sans font-semibold text-graphite">
                            {formatCents(item.unit_price_cents * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-mn-card rounded-xl p-6 shadow-sm sticky top-28">
                  <h2 className="text-lg font-sans font-semibold text-graphite mb-4">Order Summary</h2>

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
                      <span>Shipping</span>
                      <span>{summary.shipping_cents > 0 ? formatCents(summary.shipping_cents) : 'Calculated at checkout'}</span>
                    </div>
                    <div className="flex justify-between text-graphite/70">
                      <span>Tax</span>
                      <span>{summary.tax_cents > 0 ? formatCents(summary.tax_cents) : 'Calculated at checkout'}</span>
                    </div>
                    <div className="border-t border-graphite/10 pt-3 flex justify-between font-semibold text-graphite">
                      <span>Estimated Total</span>
                      <span>{formatCents(summary.total_cents)}</span>
                    </div>
                  </div>

                  {/* Discount Code */}
                  <div className="mt-5">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-graphite/40" />
                        <input
                          type="text"
                          value={discountCode}
                          onChange={e => { setDiscountCode(e.target.value); setDiscountError(''); setDiscountApplied(false); }}
                          placeholder="Discount code"
                          className="w-full pl-9 pr-3 py-2 bg-mn-bg border border-graphite/10 rounded-lg text-sm font-sans text-graphite placeholder:text-graphite/40 focus:outline-none focus:ring-2 focus:ring-accent/30"
                        />
                      </div>
                      <button
                        onClick={handleApplyDiscount}
                        className="px-4 py-2 border border-graphite/15 rounded-lg text-sm font-sans font-semibold text-graphite hover:bg-mn-surface transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    {discountError && (
                      <p className="text-xs font-sans text-signal-down mt-1">{discountError}</p>
                    )}
                    {discountApplied && (
                      <p className="text-xs font-sans text-signal-up mt-1">Discount code applied.</p>
                    )}
                  </div>

                  <Link
                    to="/shop/checkout"
                    className="mt-5 w-full h-11 bg-mn-dark text-white text-sm font-sans font-semibold rounded-full hover:bg-graphite transition-colors flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to="/shop"
                    className="mt-3 w-full h-10 border border-graphite/15 text-graphite text-sm font-sans font-semibold rounded-full hover:bg-mn-surface transition-colors flex items-center justify-center"
                  >
                    Continue Shopping
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
