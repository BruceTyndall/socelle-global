// ProductDetail.tsx — /shop/:slug — Product detail page (LIVE — products, product_variants, reviews tables)
import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Star, Heart, Minus, Plus, ShoppingBag, ChevronLeft, CheckCircle, AlertTriangle, XCircle,
  Activity, ArrowRight,
} from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import TrendingBadge from '../../components/commerce/TrendingBadge';
import AffiliateBadge from '../../components/commerce/AffiliateBadge';
import { useProduct } from '../../lib/shop/useProduct';
import { useShopCart } from '../../lib/shop/useShopCart';
import { useWishlist } from '../../lib/shop/useWishlist';
import { useProductReviews } from '../../lib/shop/useProductReviews';
import { useProductIntelligenceContext } from '../../lib/shop/useProductSignals';
import { formatCents } from '../../lib/shop/types';
import type { ProductVariant } from '../../lib/shop/types';

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star
          key={s}
          className={`${cls} ${s <= Math.round(rating) ? 'text-signal-warn fill-signal-warn' : 'text-graphite/15'}`}
        />
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { product, variants, relatedProducts, loading, error } = useProduct(slug);
  const { reviews, avgRating, submitReview, submitting } = useProductReviews(product?.id);
  const { addItem } = useShopCart();
  const { addItem: addToWishlist, isInWishlist } = useWishlist();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const { relatedSignals: intelligenceContext } = useProductIntelligenceContext(product);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);

  const images = useMemo(() => {
    if (!product) return [];
    return (product.images as string[]) ?? [];
  }, [product]);

  const activePrice = selectedVariant?.price_cents ?? product?.price_cents ?? 0;
  const activeStock = selectedVariant?.stock_quantity ?? product?.stock_quantity ?? 0;

  const stockStatus = useMemo(() => {
    if (activeStock <= 0) return { label: 'Out of Stock', color: 'text-signal-down', icon: XCircle };
    if (activeStock <= 5) return { label: `Low Stock (${activeStock} left)`, color: 'text-signal-warn', icon: AlertTriangle };
    return { label: 'In Stock', color: 'text-signal-up', icon: CheckCircle };
  }, [activeStock]);

  const StockIcon = stockStatus.icon;

  // JSON-LD
  const jsonLd = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: images[0],
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      price: (product.price_cents / 100).toFixed(2),
      priceCurrency: product.currency,
      availability: activeStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    aggregateRating: reviews.length > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: avgRating.toFixed(1),
      reviewCount: reviews.length,
    } : undefined,
  } : null;

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

  if (error || !product) {
    return (
      <>
        <MainNav />
        <div className="min-h-screen bg-mn-bg flex items-center justify-center">
          <div className="text-center">
            <ShoppingBag className="w-12 h-12 text-graphite/20 mx-auto mb-4" />
            <p className="text-lg font-sans text-graphite/60">Product not found</p>
            <Link to="/shop" className="text-accent text-sm font-sans mt-4 inline-block hover:underline">Back to Shop</Link>
          </div>
        </div>
      </>
    );
  }

  const handleAddToCart = () => {
    addItem(product.id, selectedVariant?.id ?? null, quantity, activePrice);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitReview(reviewForm.rating, reviewForm.title, reviewForm.body);
    setReviewForm({ rating: 5, title: '', body: '' });
    setShowReviewForm(false);
  };

  return (
    <>
      <Helmet>
        <title>{product.name} | Socelle Shop</title>
        <meta name="description" content={product.short_description ?? product.description ?? ''} />
        <meta property="og:title" content={`${product.name} | Socelle Shop`} />
        <meta property="og:description" content={product.short_description ?? product.description ?? ''} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={`https://socelle.com/shop/${product.slug}`} />
        <meta property="og:image" content={product.image_url ?? 'https://socelle.com/og-image.svg'} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://socelle.com/shop/${product.slug}`} />
        {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
      </Helmet>
      <MainNav />

      <main className="min-h-screen bg-mn-bg">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <Link to="/shop" className="inline-flex items-center gap-1 text-sm font-sans text-accent hover:underline">
            <ChevronLeft className="w-4 h-4" /> Back to Shop
          </Link>
        </div>

        {/* Product Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Image Gallery */}
            <div>
              <div className="aspect-square bg-mn-card rounded-card overflow-hidden mb-4">
                {images.length > 0 ? (
                  <img
                    src={images[activeImageIdx]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-mn-surface">
                    <ShoppingBag className="w-16 h-16 text-graphite/10" />
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIdx(i)}
                      className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-colors ${i === activeImageIdx ? 'border-accent' : 'border-transparent'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-subsection text-graphite mb-2">{product.name}</h1>

              {reviews.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <StarRating rating={avgRating} size="md" />
                  <span className="text-sm font-sans text-graphite/60">
                    {avgRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                  </span>
                </div>
              )}

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-2xl font-sans font-bold text-graphite">
                  {formatCents(activePrice)}
                </span>
                {product.compare_at_price_cents && product.compare_at_price_cents > activePrice && (
                  <span className="text-lg font-sans text-graphite/40 line-through">
                    {formatCents(product.compare_at_price_cents)}
                  </span>
                )}
              </div>

              <div className={`flex items-center gap-1.5 mb-6 ${stockStatus.color}`}>
                <StockIcon className="w-4 h-4" />
                <span className="text-sm font-sans font-medium">{stockStatus.label}</span>
              </div>

              {product.description && (
                <p className="text-body text-graphite/70 mb-6">{product.description}</p>
              )}

              {/* Variant Selector */}
              {variants.length > 0 && (
                <div className="mb-6">
                  <p className="text-label text-graphite/60 mb-2">Options</p>
                  <div className="flex flex-wrap gap-2">
                    {variants.map(v => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v.id === selectedVariant?.id ? null : v)}
                        className={`px-4 py-2 rounded-pill text-sm font-sans font-medium border transition-colors ${
                          selectedVariant?.id === v.id
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-graphite/15 text-graphite/70 hover:border-graphite/30'
                        }`}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity + Actions */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-graphite/15 rounded-pill overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-graphite/60 hover:text-graphite transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-sans font-semibold text-graphite">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-10 h-10 flex items-center justify-center text-graphite/60 hover:text-graphite transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={activeStock < 1}
                  className="flex-1 h-12 bg-mn-dark text-white text-sm font-sans font-semibold rounded-pill hover:bg-graphite transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </button>
                <button
                  onClick={() => addToWishlist(product.id)}
                  className={`w-12 h-12 rounded-pill border flex items-center justify-center transition-colors ${
                    isInWishlist(product.id)
                      ? 'border-signal-down bg-signal-down/5 text-signal-down'
                      : 'border-graphite/15 text-graphite/40 hover:text-signal-down hover:border-signal-down/30'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </button>
              </div>

              {product.sku && (
                <p className="text-xs font-mono text-graphite/30 mt-4">SKU: {product.sku}</p>
              )}

              {/* FTC Affiliate Badge + Disclosure */}
              {(!!(product as Record<string, unknown>).is_affiliated ||
                !!(product as Record<string, unknown>).affiliate_url) && (
                <div className="mt-4 space-y-1.5">
                  <AffiliateBadge size="md" />
                  <p className="text-[11px] font-sans text-graphite/45 leading-relaxed">
                    * Socelle may receive a commission on purchases through this link.
                    Recommendations are based on intelligence data and professional relevance,
                    not commission rates.{' '}
                    {(product as Record<string, unknown>).affiliate_disclosure
                      ? String((product as Record<string, unknown>).affiliate_disclosure)
                      : ''}
                  </p>
                </div>
              )}

              {/* Intelligence Context — signal-matched insights */}
              {intelligenceContext.length > 0 && (
                <div className="mt-6 border-t border-graphite/10 pt-6">
                  <p className="text-label text-graphite/60 mb-3 flex items-center gap-1.5">
                    <Activity className="w-4 h-4" />
                    Market Intelligence
                  </p>
                  <div className="space-y-2">
                    {intelligenceContext.slice(0, 3).map(signal => (
                      <div
                        key={signal.id}
                        className="bg-mn-bg rounded-lg p-3 border border-graphite/5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-sans text-graphite line-clamp-1">
                            {signal.title}
                          </p>
                          <TrendingBadge
                            direction={signal.direction as 'up' | 'down' | 'stable'}
                            magnitude={signal.magnitude as number}
                            size="sm"
                          />
                        </div>
                        {signal.region && (
                          <p className="text-xs font-sans text-graphite/40 mt-1">{signal.region}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <Link
                    to="/intelligence"
                    className="inline-flex items-center gap-1 text-xs font-sans text-accent hover:text-accent-hover transition-colors mt-2"
                  >
                    View full intelligence <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <section className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-subsection text-graphite">Reviews</h2>
              <button
                onClick={() => setShowReviewForm(f => !f)}
                className="text-sm font-sans font-semibold text-accent hover:underline"
              >
                Write a Review
              </button>
            </div>

            {showReviewForm && (
              <form onSubmit={handleSubmitReview} className="bg-mn-card rounded-card p-6 shadow-soft mb-8 space-y-4">
                <div>
                  <label className="text-label text-graphite/60 block mb-1">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setReviewForm(f => ({ ...f, rating: s }))}
                      >
                        <Star className={`w-6 h-6 ${s <= reviewForm.rating ? 'text-signal-warn fill-signal-warn' : 'text-graphite/15'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Review title (optional)"
                  value={reviewForm.title}
                  onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full h-10 px-4 rounded-lg border border-graphite/10 text-sm font-sans text-graphite focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <textarea
                  placeholder="Your review..."
                  value={reviewForm.body}
                  onChange={e => setReviewForm(f => ({ ...f, body: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-graphite/10 text-sm font-sans text-graphite focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-10 px-6 bg-mn-dark text-white text-sm font-sans font-semibold rounded-pill hover:bg-graphite transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}

            {reviews.length === 0 && (
              <p className="text-sm font-sans text-graphite/40 text-center py-10">No reviews yet. Be the first to review this product.</p>
            )}

            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="bg-mn-card rounded-xl p-5 shadow-soft">
                  <div className="flex items-center justify-between mb-2">
                    <StarRating rating={review.rating} />
                    <span className="text-xs font-mono text-graphite/30">{review.created_at ? new Date(review.created_at).toLocaleDateString() : '—'}</span>
                  </div>
                  {review.title && <p className="text-sm font-sans font-semibold text-graphite mb-1">{review.title}</p>}
                  {review.body && <p className="text-sm font-sans text-graphite/70">{review.body}</p>}
                  {review.is_verified_purchase && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-signal-up mt-2">
                      <CheckCircle className="w-3 h-3" /> Verified Purchase
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-16">
              <h2 className="text-subsection text-graphite mb-8">You May Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map(rp => {
                  const rpImages = (rp.images as string[]) ?? [];
                  return (
                    <Link key={rp.id} to={`/shop/${rp.slug}`} className="group bg-mn-card rounded-card overflow-hidden shadow-soft hover:shadow-panel transition-shadow">
                      <div className="aspect-square bg-mn-surface overflow-hidden">
                        {rpImages[0] ? (
                          <img src={rpImages[0]} alt={rp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-graphite/10" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-sans font-semibold text-graphite line-clamp-2 mb-1">{rp.name}</h3>
                        <span className="text-sm font-sans font-bold text-graphite">{formatCents(rp.price_cents)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
