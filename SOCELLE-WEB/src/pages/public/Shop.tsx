// Shop.tsx — /shop — Product catalog page (LIVE — products table)
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Search, SlidersHorizontal, Star, ShoppingBag, ChevronLeft, ChevronRight,
} from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import TrendingBadge from '../../components/commerce/TrendingBadge';
import AffiliateBadge from '../../components/commerce/AffiliateBadge';
import { useProducts } from '../../lib/shop/useProducts';
import { useCategories } from '../../lib/shop/useCategories';
import { useShopCart } from '../../lib/shop/useShopCart';
import { useProductSignals } from '../../lib/shop/useProductSignals';
import { formatCents } from '../../lib/shop/types';
import type { ProductFilters } from '../../lib/shop/types';

const SORT_OPTIONS: { value: ProductFilters['sort']; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Top Rated' },
];

const PER_PAGE = 12;

export default function Shop() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [sort, setSort] = useState<ProductFilters['sort']>('featured');
  const [inStock, setInStock] = useState(false);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const filters: ProductFilters = useMemo(() => ({
    search: search || undefined,
    category_id: selectedCategory,
    sort,
    in_stock: inStock || undefined,
    page,
    per_page: PER_PAGE,
  }), [search, selectedCategory, sort, inStock, page]);

  const { products, loading, total } = useProducts(filters);
  const { categories } = useCategories();
  const { addItem } = useShopCart();
  const { matches: signalMatches } = useProductSignals(products);
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <>
      <Helmet>
        <title>Shop Professional Products | Socelle</title>
        <meta name="description" content="Shop professional beauty and skincare products verified by industry intelligence. Curated for licensed salons, spas, and medspas." />
        <meta property="og:title" content="Shop Professional Products | Socelle" />
        <meta property="og:description" content="Shop professional beauty and skincare products verified by industry intelligence." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://socelle.com/shop" />
        <meta property="og:image" content="https://socelle.com/og-image.svg" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://socelle.com/shop" />
      </Helmet>
      <MainNav />

      <main className="min-h-screen bg-mn-bg">
        {/* Hero */}
        <section className="bg-mn-dark py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-eyebrow text-accent mb-4">Professional Products</p>
            <h1 className="text-section text-white mb-6">Shop Intelligence-Verified Products</h1>
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-graphite/40" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full h-12 pl-12 pr-4 rounded-pill bg-white text-graphite text-body font-sans focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar / Filters */}
            <aside className={`lg:w-56 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-mn-card rounded-card p-5 shadow-soft space-y-6">
                <div>
                  <p className="text-label text-graphite/60 mb-3">Categories</p>
                  <button
                    onClick={() => { setSelectedCategory(undefined); setPage(1); }}
                    className={`block w-full text-left text-sm font-sans py-1.5 px-2 rounded-md transition-colors ${!selectedCategory ? 'bg-accent/10 text-accent font-semibold' : 'text-graphite/70 hover:text-graphite'}`}
                  >
                    All Products
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
                      className={`block w-full text-left text-sm font-sans py-1.5 px-2 rounded-md transition-colors ${selectedCategory === cat.id ? 'bg-accent/10 text-accent font-semibold' : 'text-graphite/70 hover:text-graphite'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                <div>
                  <p className="text-label text-graphite/60 mb-3">Availability</p>
                  <label className="flex items-center gap-2 text-sm font-sans text-graphite/70 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStock}
                      onChange={e => { setInStock(e.target.checked); setPage(1); }}
                      className="rounded border-graphite/20 text-accent focus:ring-accent"
                    />
                    In Stock Only
                  </label>
                </div>
              </div>
            </aside>

            {/* Main Grid */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm font-sans text-graphite/60">
                  {total} product{total !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowFilters(f => !f)}
                    className="lg:hidden flex items-center gap-1.5 text-sm font-sans text-graphite/70 hover:text-graphite transition-colors"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                  </button>
                  <select
                    value={sort}
                    onChange={e => { setSort(e.target.value as ProductFilters['sort']); setPage(1); }}
                    className="text-sm font-sans text-graphite border border-graphite/10 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    {SORT_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Loading */}
              {loading && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-mn-card rounded-card p-4 animate-pulse">
                      <div className="aspect-square bg-graphite/5 rounded-xl mb-4" />
                      <div className="h-4 bg-graphite/5 rounded mb-2 w-3/4" />
                      <div className="h-4 bg-graphite/5 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              )}

              {/* Products Grid */}
              {!loading && products.length === 0 && (
                <div className="text-center py-20">
                  <ShoppingBag className="w-12 h-12 text-graphite/20 mx-auto mb-4" />
                  <p className="text-lg font-sans text-graphite/60">No products found</p>
                  <p className="text-sm font-sans text-graphite/40 mt-1">Try adjusting your filters or search term.</p>
                </div>
              )}

              {!loading && products.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {products.map(product => {
                    const images = (product.images as string[]) ?? [];
                    const firstImage = images[0] ?? '/placeholder-product.svg';
                    const signalMatch = signalMatches.get(product.id);
                    const hasAffiliate = !!(product as Record<string, unknown>).affiliate_url;
                    return (
                      <div key={product.id} className="group bg-mn-card rounded-card overflow-hidden shadow-soft hover:shadow-panel transition-shadow relative">
                        {/* Intelligence trending badge */}
                        {signalMatch && (
                          <div className="absolute top-3 left-3 z-10">
                            <TrendingBadge
                              direction={signalMatch.direction}
                              magnitude={signalMatch.magnitude}
                              size="sm"
                            />
                          </div>
                        )}
                        <Link to={`/shop/${product.slug}`} className="block">
                          <div className="aspect-square bg-mn-surface overflow-hidden">
                            <img
                              src={firstImage}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        </Link>
                        <div className="p-4">
                          <Link to={`/shop/${product.slug}`} className="block">
                            <h3 className="text-sm font-sans font-semibold text-graphite line-clamp-2 mb-1 group-hover:text-accent transition-colors">
                              {product.name}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm font-sans font-bold text-graphite">
                              {formatCents(product.price_cents)}
                            </span>
                            {product.compare_at_price_cents && product.compare_at_price_cents > product.price_cents && (
                              <span className="text-xs font-sans text-graphite/40 line-through">
                                {formatCents(product.compare_at_price_cents)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mb-3">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className="w-3.5 h-3.5 text-signal-warn fill-signal-warn" />
                            ))}
                          </div>
                          <button
                            onClick={() => addItem(product.id, null, 1, product.price_cents)}
                            disabled={(product.stock_quantity ?? 0) < 1}
                            className="w-full h-10 bg-mn-dark text-white text-sm font-sans font-semibold rounded-pill hover:bg-graphite transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {(product.stock_quantity ?? 0) < 1 ? 'Out of Stock' : 'Add to Cart'}
                          </button>
                          {hasAffiliate && (
                            <div className="mt-2">
                              <AffiliateBadge size="sm" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-10 h-10 rounded-full bg-mn-card flex items-center justify-center text-graphite/60 hover:text-graphite disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                    Math.max(0, page - 3),
                    Math.min(totalPages, page + 2)
                  ).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-full text-sm font-sans font-semibold transition-colors ${p === page ? 'bg-mn-dark text-white' : 'bg-mn-card text-graphite/60 hover:text-graphite'}`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-10 h-10 rounded-full bg-mn-card flex items-center justify-center text-graphite/60 hover:text-graphite disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
