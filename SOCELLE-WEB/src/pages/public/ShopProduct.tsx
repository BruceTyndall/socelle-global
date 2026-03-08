// ShopProduct.tsx — /shop/product/:slug — Product detail page
// Data: LIVE — products + product_variants + reviews tables
import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Star, ShoppingBag, Heart, ChevronLeft, ChevronRight, ArrowLeft,
  Minus, Plus, Check, Package, FlaskConical, Activity, ArrowRight,
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

export default function ShopProduct() {
  const { slug } = useParams<{ slug: string }>();
  const { product, variants, relatedProducts, loading, error } = useProduct(slug);
  const { reviews, avgRating, submitReview, submitting } = useProductReviews(product?.id);
  const { addItem } = useShopCart();
  const { isInWishlist, toggleItem: toggleWishlist } = useWishlist();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const { relatedSignals: intelligenceContext } = useProductIntelligenceContext(product);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');

  const images = useMemo(() => {
    const imgs = (product?.images as string[]) ?? [];
    return imgs.length > 0 ? imgs : ['/placeholder-product.svg'];
  }, [product?.images]);

  const activeVariant = selectedVariant ?? (variants.length > 0 ? variants[0] : null);
  const displayPrice = activeVariant?.price_cents ?? product?.price_cents ?? 0;
  const inStock = activeVariant
    ? (activeVariant.stock_quantity ?? 0) > 0
    : (product?.stock_quantity ?? 0) > 0;

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product.id, activeVariant?.id ?? null, quantity, displayPrice);
  };

  const handleSubmitReview = async () => {
    await submitReview(reviewRating, reviewTitle, reviewBody);
    setShowReviewForm(false);
    setReviewTitle('');
    setReviewBody('');
    setReviewRating(5);
  };

  if (loading) {
    return (
      <>
        <MainNav />
        <main className="min-h-screen bg-mn-bg pt-28 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid md:grid-cols-2 gap-10 animate-pulse">
              <div className="aspect-square bg-mn-surface rounded-xl" />
              <div className="space-y-4 py-4">
                <div className="h-8 bg-graphite/10 rounded w-3/4" />
                <div className="h-4 bg-graphite/10 rounded w-1/4" />
                <div className="h-6 bg-graphite/10 rounded w-1/3" />
                <div className="h-24 bg-graphite/10 rounded" />
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <MainNav />
        <main className="min-h-screen bg-mn-bg pt-28 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center py-20">
            <ShoppingBag className="w-12 h-12 text-graphite/20 mx-auto mb-4" />
            <h1 className="text-2xl font-sans font-semibold text-graphite mb-2">Product Not Found</h1>
            <p className="text-graphite/60 font-sans mb-6">The product you are looking for does not exist or has been removed.</p>
            <Link to="/shop" className="inline-flex items-center gap-2 h-11 px-6 bg-mn-dark text-white text-sm font-sans font-semibold rounded-full hover:bg-graphite transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Shop
            </Link>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const wishlisted = isInWishlist(product.id);

  return (
    <>
      <Helmet>
        <title>{product.name} | SOCELLE Shop</title>
        <meta name="description" content={product.description ?? `Shop ${product.name} on SOCELLE.`} />
      </Helmet>
      <MainNav />

      <main className="min-h-screen bg-mn-bg pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm font-sans text-graphite/50 mb-6">
            <Link to="/shop" className="hover:text-graphite transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-graphite line-clamp-1">{product.name}</span>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Image Gallery */}
            <div className="space-y-3">
              <div className="relative aspect-square bg-mn-surface rounded-xl overflow-hidden">
                <img
                  src={images[activeImageIdx]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImageIdx(i => (i - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-graphite hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setActiveImageIdx(i => (i + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-graphite hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${idx === activeImageIdx ? 'border-accent' : 'border-transparent'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="py-2">
              <h1 className="text-2xl sm:text-3xl font-sans font-semibold text-graphite">{product.name}</h1>

              {/* Rating */}
              {avgRating > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.round(avgRating) ? 'text-signal-warn fill-signal-warn' : 'text-graphite/20'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-sans text-graphite/60">
                    {avgRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                  </span>
                </div>
              )}

              {/* Price */}
              <p className="text-2xl font-sans font-semibold text-graphite mt-4">
                {formatCents(displayPrice)}
              </p>

              {/* Stock Status */}
              <div className="flex items-center gap-2 mt-3">
                {inStock ? (
                  <>
                    <Check className="w-4 h-4 text-signal-up" />
                    <span className="text-sm font-sans text-signal-up font-medium">In Stock</span>
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4 text-signal-down" />
                    <span className="text-sm font-sans text-signal-down font-medium">Out of Stock</span>
                  </>
                )}
              </div>

              {/* Variants */}
              {variants.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs font-sans font-semibold uppercase tracking-wider text-graphite/50 mb-2">Options</p>
                  <div className="flex flex-wrap gap-2">
                    {variants.map(v => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-4 py-2 rounded-lg text-sm font-sans border transition-colors ${(activeVariant?.id === v.id) ? 'border-accent bg-accent/10 text-accent font-semibold' : 'border-graphite/15 text-graphite/70 hover:border-graphite/30'}`}
                      >
                        {v.name}
                        {v.price_cents !== product.price_cents && (
                          <span className="ml-1 text-graphite/50">({formatCents(v.price_cents)})</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity + Add to Cart */}
              <div className="flex items-center gap-4 mt-6">
                <div className="flex items-center border border-graphite/15 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-graphite/60 hover:text-graphite transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-sans font-semibold text-graphite">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-10 h-10 flex items-center justify-center text-graphite/60 hover:text-graphite transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="flex-1 h-11 bg-mn-dark text-white text-sm font-sans font-semibold rounded-full hover:bg-graphite transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </button>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`w-11 h-11 rounded-full border flex items-center justify-center transition-colors ${wishlisted ? 'border-signal-down bg-signal-down/10 text-signal-down' : 'border-graphite/15 text-graphite/40 hover:text-signal-down hover:border-signal-down/30'}`}
                  aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Description */}
              {product.description && (
                <div className="mt-8 border-t border-graphite/10 pt-6">
                  <h2 className="text-sm font-sans font-semibold uppercase tracking-wider text-graphite/50 mb-3">Description</h2>
                  <p className="text-sm font-sans text-graphite/70 leading-relaxed whitespace-pre-line">{product.description}</p>
                </div>
              )}

              {/* Ingredients link */}
              {product.category_id && (
                <div className="mt-4">
                  <Link
                    to="/ingredients"
                    className="inline-flex items-center gap-2 text-sm font-sans text-accent hover:text-accent-hover transition-colors"
                  >
                    <FlaskConical className="w-4 h-4" />
                    View Ingredient Intelligence
                  </Link>
                </div>
              )}

              {/* FTC Affiliate Badge */}
              {!!(product as Record<string, unknown>).affiliate_url && (
                <div className="mt-4">
                  <AffiliateBadge size="md" />
                </div>
              )}

              {/* Intelligence Context — signal-matched insights */}
              {intelligenceContext.length > 0 && (
                <div className="mt-6 border-t border-graphite/10 pt-6">
                  <p className="text-xs font-sans font-semibold uppercase tracking-wider text-graphite/50 mb-3 flex items-center gap-1.5">
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
          <section className="mt-16 border-t border-graphite/10 pt-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-sans font-semibold text-graphite">
                Reviews {reviews.length > 0 && <span className="text-graphite/40">({reviews.length})</span>}
              </h2>
              <button
                onClick={() => setShowReviewForm(v => !v)}
                className="text-sm font-sans font-semibold text-accent hover:text-accent-hover transition-colors"
              >
                Write a Review
              </button>
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <div className="bg-mn-card rounded-xl p-6 shadow-sm mb-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-sans font-medium text-graphite block mb-1">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(r => (
                        <button key={r} onClick={() => setReviewRating(r)}>
                          <Star className={`w-6 h-6 ${r <= reviewRating ? 'text-signal-warn fill-signal-warn' : 'text-graphite/20'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-sans font-medium text-graphite block mb-1">Title</label>
                    <input
                      type="text"
                      value={reviewTitle}
                      onChange={e => setReviewTitle(e.target.value)}
                      className="w-full px-4 py-2.5 bg-mn-bg border border-graphite/10 rounded-lg text-sm font-sans text-graphite focus:outline-none focus:ring-2 focus:ring-accent/30"
                      placeholder="Summarize your experience"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-sans font-medium text-graphite block mb-1">Review</label>
                    <textarea
                      value={reviewBody}
                      onChange={e => setReviewBody(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2.5 bg-mn-bg border border-graphite/10 rounded-lg text-sm font-sans text-graphite focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
                      placeholder="Share your thoughts about this product..."
                    />
                  </div>
                  <button
                    onClick={handleSubmitReview}
                    disabled={submitting}
                    className="h-10 px-6 bg-mn-dark text-white text-sm font-sans font-semibold rounded-full hover:bg-graphite transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </div>
            )}

            {/* Reviews List */}
            {reviews.length === 0 && !showReviewForm && (
              <p className="text-sm font-sans text-graphite/50 py-6">No reviews yet. Be the first to review this product.</p>
            )}
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="bg-mn-card rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-signal-warn fill-signal-warn' : 'text-graphite/20'}`} />
                      ))}
                    </div>
                    {review.is_verified_purchase && (
                      <span className="text-[10px] font-sans font-semibold bg-signal-up/10 text-signal-up px-2 py-0.5 rounded-full">Verified Purchase</span>
                    )}
                  </div>
                  {review.title && (
                    <h4 className="text-sm font-sans font-semibold text-graphite mb-1">{review.title}</h4>
                  )}
                  {review.body && (
                    <p className="text-sm font-sans text-graphite/70">{review.body}</p>
                  )}
                  <p className="text-xs font-sans text-graphite/40 mt-2">
                    {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-16 border-t border-graphite/10 pt-10">
              <h2 className="text-xl font-sans font-semibold text-graphite mb-6">Related Products</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.slice(0, 4).map(rp => {
                  const rpImages = (rp.images as string[]) ?? [];
                  return (
                    <Link key={rp.id} to={`/shop/product/${rp.slug}`} className="group bg-mn-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="aspect-square bg-mn-surface overflow-hidden">
                        <img
                          src={rpImages[0] ?? '/placeholder-product.svg'}
                          alt={rp.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-sans font-semibold text-graphite line-clamp-1">{rp.name}</h3>
                        <p className="text-sm font-sans text-graphite/70 mt-1">{formatCents(rp.price_cents)}</p>
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
