// WishlistPage.tsx — /account/wishlist — Wishlist page (LIVE — wishlists, wishlist_items tables, protected route)
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useWishlist } from '../../lib/shop/useWishlist';
import { useShopCart } from '../../lib/shop/useShopCart';
import { formatCents } from '../../lib/shop/types';

export default function WishlistPage() {
  const { items, loading, removeItem } = useWishlist();
  const { addItem } = useShopCart();

  return (
    <>
      <Helmet>
        <title>My Wishlist | Socelle</title>
        <meta name="description" content="View and manage your saved products on Socelle." />
        <meta property="og:title" content="My Wishlist | Socelle" />
        <meta property="og:description" content="View and manage your saved products on Socelle." />
        <meta property="og:type" content="website" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <MainNav />

      <main className="min-h-screen bg-mn-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <h1 className="text-section text-graphite mb-8">My Wishlist</h1>

          {loading && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-mn-card rounded-card p-4 animate-pulse">
                  <div className="aspect-square bg-graphite/5 rounded-xl mb-4" />
                  <div className="h-4 bg-graphite/5 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-graphite/5 rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="text-center py-20">
              <Heart className="w-16 h-16 text-graphite/15 mx-auto mb-4" />
              <p className="text-lg font-sans text-graphite/60 mb-2">Your wishlist is empty</p>
              <p className="text-sm font-sans text-graphite/40 mb-6">Save items you love for later.</p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 h-12 px-8 bg-mn-dark text-white text-sm font-sans font-semibold rounded-pill hover:bg-graphite transition-colors"
              >
                <ShoppingBag className="w-4 h-4" /> Browse Products
              </Link>
            </div>
          )}

          {!loading && items.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {items.map(item => {
                const product = item.product;
                if (!product) return null;
                const images = (product.images as string[]) ?? [];
                return (
                  <div key={item.id} className="bg-mn-card rounded-card overflow-hidden shadow-soft group">
                    <Link to={`/shop/${product.slug}`} className="block">
                      <div className="aspect-square bg-mn-surface overflow-hidden relative">
                        {images[0] ? (
                          <img src={images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-graphite/10" />
                          </div>
                        )}
                        <button
                          onClick={e => { e.preventDefault(); removeItem(item.id); }}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-graphite/40 hover:text-signal-down transition-colors shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link to={`/shop/${product.slug}`}>
                        <h3 className="text-sm font-sans font-semibold text-graphite line-clamp-2 mb-1 group-hover:text-accent transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-sm font-sans font-bold text-graphite mb-3">{formatCents(product.price_cents)}</p>
                      <button
                        onClick={() => addItem(product.id, item.variant_id, 1, product.price_cents)}
                        disabled={product.stock_quantity < 1}
                        className="w-full h-10 bg-mn-dark text-white text-sm font-sans font-semibold rounded-pill hover:bg-graphite transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {product.stock_quantity < 1 ? 'Out of Stock' : 'Add to Cart'}
                      </button>
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
