// ShopCategory.tsx — /shop/category/:slug — Category product listing with filters
// Data: LIVE — products + product_categories tables
import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Search, SlidersHorizontal, Star, ShoppingBag, ChevronLeft, ChevronRight, ArrowLeft,
} from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useProducts } from '../../lib/shop/useProducts';
import { useCategories } from '../../lib/shop/useCategories';
import { useShopCart } from '../../lib/shop/useShopCart';
import { formatCents } from '../../lib/shop/types';
import type { ProductFilters } from '../../lib/shop/types';

const SORT_OPTIONS: { value: ProductFilters['sort']; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Top Rated' },
];

const PRICE_RANGES = [
  { label: 'Under $25', min: 0, max: 2500 },
  { label: '$25 – $50', min: 2500, max: 5000 },
  { label: '$50 – $100', min: 5000, max: 10000 },
  { label: '$100 – $200', min: 10000, max: 20000 },
  { label: 'Over $200', min: 20000, max: undefined },
];

const PER_PAGE = 12;

export default function ShopCategory() {
  const { slug } = useParams<{ slug: string }>();
  const { categories, loading: catsLoading } = useCategories();
  const { addItem } = useShopCart();

  const category = useMemo(
    () => categories.find(c => c.slug === slug),
    [categories, slug],
  );

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<ProductFilters['sort']>('featured');
  const [inStock, setInStock] = useState(false);
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({});
  const [minRating, setMinRating] = useState<number | undefined>();
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const filters: ProductFilters = useMemo(() => ({
    search: search || undefined,
    category_id: category?.id,
    sort,
    in_stock: inStock || undefined,
    min_price_cents: priceRange.min,
    max_price_cents: priceRange.max,
    min_rating: minRating,
    page,
    per_page: PER_PAGE,
  }), [search, category?.id, sort, inStock, priceRange, minRating, page]);

  const { products, loading, total } = useProducts(filters);
  const totalPages = Math.ceil(total / PER_PAGE);

  const categoryName = category?.name ?? slug?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) ?? 'Category';

  return (
    <>
      <Helmet>
        <title>{categoryName} | SOCELLE Shop</title>
        <meta name="description" content={`Browse ${categoryName} products on SOCELLE — professional beauty intelligence marketplace.`} />
        <meta property="og:title" content={`${categoryName} | SOCELLE Shop`} />
        <meta property="og:description" content={`Browse ${categoryName} products on SOCELLE.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://socelle.com/shop/category/${slug}`} />
        <meta property="og:image" content="https://socelle.com/og-image.svg" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://socelle.com/shop/category/${slug}`} />
      </Helmet>
      <MainNav />

      <main className="min-h-screen bg-mn-bg pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm font-sans text-graphite/50 mb-6">
            <Link to="/shop" className="hover:text-graphite transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              Shop
            </Link>
            <span>/</span>
            <span className="text-graphite">{categoryName}</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-sans font-semibold text-graphite">{categoryName}</h1>
            {category?.description && (
              <p className="text-graphite/60 font-sans mt-2 max-w-2xl">{String(category.description)}</p>
            )}
            {!catsLoading && !category && (
              <div className="mt-4 bg-signal-warn/10 text-signal-warn text-xs font-medium px-4 py-2 rounded-lg inline-block">
                Category not found
              </div>
            )}
          </div>

          {/* Search + Sort Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/40" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 bg-mn-card border border-graphite/10 rounded-lg text-sm font-sans text-graphite placeholder:text-graphite/40 focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <select
              value={sort}
              onChange={e => { setSort(e.target.value as ProductFilters['sort']); setPage(1); }}
              className="px-4 py-2.5 bg-mn-card border border-graphite/10 rounded-lg text-sm font-sans text-graphite focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <button
              onClick={() => setShowFilters(v => !v)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-mn-card border border-graphite/10 rounded-lg text-sm font-sans text-graphite"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className={`lg:w-56 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-mn-card rounded-xl p-5 shadow-sm space-y-6">
                {/* Price Range */}
                <div>
                  <p className="text-xs font-sans font-semibold uppercase tracking-wider text-graphite/50 mb-3">Price Range</p>
                  {PRICE_RANGES.map(r => (
                    <button
                      key={r.label}
                      onClick={() => {
                        setPriceRange(prev =>
                          prev.min === r.min && prev.max === r.max ? {} : { min: r.min, max: r.max }
                        );
                        setPage(1);
                      }}
                      className={`block w-full text-left text-sm font-sans py-1.5 px-2 rounded-md transition-colors ${priceRange.min === r.min && priceRange.max === r.max ? 'bg-accent/10 text-accent font-semibold' : 'text-graphite/70 hover:text-graphite'}`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>

                {/* Rating Filter */}
                <div>
                  <p className="text-xs font-sans font-semibold uppercase tracking-wider text-graphite/50 mb-3">Min Rating</p>
                  {[4, 3, 2, 1].map(r => (
                    <button
                      key={r}
                      onClick={() => { setMinRating(prev => prev === r ? undefined : r); setPage(1); }}
                      className={`flex items-center gap-1.5 w-full text-left text-sm font-sans py-1.5 px-2 rounded-md transition-colors ${minRating === r ? 'bg-accent/10 text-accent font-semibold' : 'text-graphite/70 hover:text-graphite'}`}
                    >
                      {Array.from({ length: r }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                      <span>& up</span>
                    </button>
                  ))}
                </div>

                {/* In Stock */}
                <label className="flex items-center gap-2 text-sm font-sans text-graphite/70 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={e => { setInStock(e.target.checked); setPage(1); }}
                    className="rounded border-graphite/20 text-accent focus:ring-accent"
                  />
                  In Stock Only
                </label>

                {/* Clear Filters */}
                <button
                  onClick={() => { setPriceRange({}); setMinRating(undefined); setInStock(false); setSearch(''); setPage(1); }}
                  className="text-xs font-sans text-accent hover:text-accent-hover transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
              <p className="text-sm font-sans text-graphite/50 mb-4">
                {total} product{total !== 1 ? 's' : ''}
              </p>

              {loading && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-mn-card rounded-xl overflow-hidden shadow-sm animate-pulse">
                      <div className="aspect-square bg-mn-surface" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-graphite/10 rounded w-3/4" />
                        <div className="h-3 bg-graphite/10 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

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
                    return (
                      <div key={product.id} className="group bg-mn-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <Link to={`/shop/product/${product.slug}`} className="block">
                          <div className="aspect-square bg-mn-surface overflow-hidden">
                            <img
                              src={firstImage}
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
                          {product.avg_rating != null && product.avg_rating > 0 && (
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
                              onClick={() => addItem(product.id, null, 1, product.price_cents)}
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                    .map(p => (
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
