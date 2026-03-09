// ShopWishlist.tsx — /shop/wishlist — Wishlist grid (requires auth)
// Data: LIVE — wishlists + wishlist_items + products tables
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Heart, ShoppingBag, Star, Trash2 } from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useWishlist } from '../../lib/shop/useWishlist';
import { useShopCart } from '../../lib/shop/useShopCart';
import { formatCents } from '../../lib/shop/types';

export default function ShopWishlist() {
  const { items, loading, removeItem } = useWishlist();
  const { addItem: addToCart } = useShopCart();

  return (
    <>
      <Helmet>
        <title>Wishlist | SOCELLE</title>
        <meta name="description" content="Your saved products on SOCELLE. View and manage your wishlist of professional beauty products." />
        <meta property="og:title" content="Wishlist | SOCELLE" />
        <meta property="og:description" content="Your saved products on SOCELLE." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <MainNav />

      <main className="min-h-screen bg-mn-bg pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-sans font-semibold text-graphite mb-8">
            My Wishlist
            {items.length > 0 && (
              <span className="text-graphite/40 text-lg ml-2">({items.length})</span>
            )}
          </h1>

          {loading && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-mn-card rounded-xl overflow-hidden">
                  <div className="aspect-square bg-mn-surface" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-graphite/10 rounded w-3/4" />
                    <div className="h-3 bg-graphite/10 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="text-center py-20">
              <Heart className="w-14 h-14 text-graphite/15 mx-auto mb-4" />
              <h2 className="text-xl font-sans font-semibold text-graphite mb-2">Your wishlist is empty</h2>
              <p className="text-sm font-sans text-graphite/50 mb-6">Save products you love for later.</p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 h-11 px-6 bg-mn-dark text-white text-sm font-sans font-semibold rounded-full hover:bg-graphite transition-colors"
              >
                Browse Products
              </Link>
            </div>
          )}

          {!loading && items.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map(item => {
                const product = item.product;
                if (!product) return null;
                const images = (product.images as string[]) ?? [];
                return (
                  <div key={item.id} className="group bg-mn-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative">
                    {/* Remove button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-graphite/40 hover:text-signal-down transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <Link to={`/shop/product/${product.slug}`} className="block">
                      <div className="aspect-square bg-mn-surface overflow-hidden">
                        <img
                          src={images[0] ?? '/placeholder-product.svg'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link to={`/shop/product/${product.slug}`}>
                        <h3 className="text-sm font-sans font-semibold text-graphite line-clamp-2 hover:text-accent transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      {product.avg_rating != null && Number(product.avg_rating) > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3.5 h-3.5 text-signal-warn fill-signal-warn" />
                          <span className="text-xs font-sans text-graphite/60">{Number(product.avg_rating).toFixed(1)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-sans font-semibold text-graphite">
                          {formatCents(product.price_cents)}
                        </span>
                        <button
                          onClick={() => addToCart(product.id, null, 1, product.price_cents)}
                          className="w-8 h-8 rounded-full bg-mn-dark text-white flex items-center justify-center hover:bg-graphite transition-colors"
                          aria-label="Add to cart"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
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
