import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  X,
  ArrowRight,
  PackageSearch,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { buildCanonical } from '../../lib/seo';
import { searchBrands, searchProducts, type SearchFilters } from '../../lib/searchService';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import SiteFooter from '../../components/sections/SiteFooter';

/* ══════════════════════════════════════════════════════════════════
   SearchPage — unified brand + product search (/search?q=)
   Uses searchService (brands + products), TanStack Query v5,
   skeleton shimmer, empty + error states, Pearl Mineral V2
   ══════════════════════════════════════════════════════════════════ */

type Tab = 'brands' | 'products';

const TABS: { id: Tab; label: string }[] = [
  { id: 'brands', label: 'Brands' },
  { id: 'products', label: 'Products' },
];

function ResultSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 border border-[#141418]/5 animate-pulse flex gap-4">
      <div className="h-14 w-14 bg-[#141418]/[0.06] rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 bg-[#141418]/[0.06] rounded" />
        <div className="h-3 w-full bg-[#141418]/[0.04] rounded" />
        <div className="h-3 w-1/3 bg-[#141418]/[0.04] rounded" />
      </div>
    </div>
  );
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') ?? '';
  const [inputValue, setInputValue] = useState(initialQ);
  const [query, setQuery] = useState(initialQ);
  const [tab, setTab] = useState<Tab>('brands');

  // Sync input when URL changes externally
  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    setInputValue(q);
    setQuery(q);
  }, [searchParams]);

  const filters: SearchFilters = { query, pageSize: 40 };

  const brandsQuery = useQuery({
    queryKey: ['search-brands', query],
    queryFn: () => searchBrands(filters),
    enabled: query.trim().length > 0,
    staleTime: 60_000,
  });

  const productsQuery = useQuery({
    queryKey: ['search-products', query],
    queryFn: () => searchProducts(filters),
    enabled: query.trim().length > 0,
    staleTime: 60_000,
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = inputValue.trim();
      setQuery(trimmed);
      setSearchParams(trimmed ? { q: trimmed } : {});
    },
    [inputValue, setSearchParams],
  );

  const handleClear = useCallback(() => {
    setInputValue('');
    setQuery('');
    setSearchParams({});
  }, [setSearchParams]);

  const brands = brandsQuery.data?.data ?? [];
  const products = productsQuery.data?.data ?? [];
  const totalBrands = brandsQuery.data?.totalCount ?? 0;
  const totalProducts = productsQuery.data?.totalCount ?? 0;

  const isLoading =
    (tab === 'brands' && brandsQuery.isLoading) ||
    (tab === 'products' && productsQuery.isLoading);
  const hasError =
    (tab === 'brands' && !!brandsQuery.error) ||
    (tab === 'products' && !!productsQuery.error);

  const refetch =
    tab === 'brands' ? brandsQuery.refetch : productsQuery.refetch;

  const hasQuery = query.trim().length > 0;

  return (
    <div className="min-h-screen bg-[#F6F3EF] font-sans">
      <Helmet>
        <title>{query ? `"${query}" — Search` : 'Search'} - Socelle</title>
        <meta
          name="description"
          content={`Search professional beauty brands and products on Socelle.${query ? ` Results for "${query}".` : ''}`}
        />
        <meta name="robots" content="noindex" />
        <link rel="canonical" href={buildCanonical('/search')} />
      </Helmet>

      <MainNav />

      {/* ── Search bar section ────────────────────────────────── */}
      <section className="bg-white border-b border-[#141418]/5 py-10">
        <div className="section-container max-w-3xl">
          <BlockReveal>
            <h1 className="font-sans font-semibold text-subsection text-[#141418] mb-6">
              Search
            </h1>
          </BlockReveal>
          <form onSubmit={handleSubmit} role="search">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#141418]/30"
                aria-hidden="true"
              />
              <label htmlFor="global-search" className="sr-only">
                Search brands and products
              </label>
              <input
                id="global-search"
                type="search"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search brands, products, categories..."
                autoFocus
                className="w-full h-14 pl-12 pr-14 rounded-2xl border border-[#141418]/10 bg-[#F6F3EF] text-[#141418] text-base placeholder:text-[#141418]/30 outline-none focus:border-[#6E879B]/40 focus:bg-white transition-all"
              />
              {inputValue && (
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label="Clear search"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#141418]/30 hover:text-[#141418] cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              )}
            </div>
            <button type="submit" className="sr-only">
              Search
            </button>
          </form>
        </div>
      </section>

      <main id="main-content" className="section-container max-w-3xl py-10">
        {/* ── No query state ─────────────────────────────────── */}
        {!hasQuery && (
          <BlockReveal>
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-[#141418]/15 mx-auto mb-4" aria-hidden="true" />
              <p className="text-[#141418]/40 text-sm">
                Enter a brand name, product, or category to begin searching.
              </p>
            </div>
          </BlockReveal>
        )}

        {hasQuery && (
          <>
            {/* ── Tabs ──────────────────────────────────────────── */}
            <div className="flex items-center gap-1 mb-6 border-b border-[#141418]/5">
              {TABS.map((t) => {
                const count = t.id === 'brands' ? totalBrands : totalProducts;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                      tab === t.id
                        ? 'border-[#141418] text-[#141418]'
                        : 'border-transparent text-[#141418]/50 hover:text-[#141418]/70'
                    }`}
                  >
                    {t.label}
                    {!isLoading && count > 0 && (
                      <span
                        className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                          tab === t.id
                            ? 'bg-[#141418] text-white'
                            : 'bg-[#141418]/8 text-[#141418]/50'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Loading skeletons ─────────────────────────────── */}
            {isLoading && (
              <div className="space-y-3">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <ResultSkeleton key={i} />
                ))}
              </div>
            )}

            {/* ── Error state ───────────────────────────────────── */}
            {!isLoading && hasError && (
              <div className="text-center py-16">
                <AlertCircle className="w-10 h-10 text-[#8E6464] mx-auto mb-4" aria-hidden="true" />
                <h2 className="font-sans font-semibold text-[#141418] mb-2">
                  Search unavailable
                </h2>
                <p className="text-sm text-[#141418]/50 mb-6 max-w-md mx-auto">
                  We encountered an issue completing your search. Please try again.
                </p>
                <button
                  onClick={() => void refetch()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#6E879B] text-white text-sm font-medium hover:bg-[#5A7185] transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden="true" />
                  Retry
                </button>
              </div>
            )}

            {/* ── Empty state ───────────────────────────────────── */}
            {!isLoading && !hasError && tab === 'brands' && brands.length === 0 && (
              <div className="text-center py-16">
                <PackageSearch className="w-10 h-10 text-[#141418]/20 mx-auto mb-4" aria-hidden="true" />
                <h2 className="font-sans font-semibold text-[#141418] mb-2">
                  No brands found
                </h2>
                <p className="text-sm text-[#141418]/50 max-w-md mx-auto">
                  No brands match "{query}". Try a different search term or browse all brands.
                </p>
                <Link
                  to="/brands"
                  className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full border border-[#141418]/10 text-[#141418]/60 text-sm font-medium hover:border-[#141418]/20 transition-all"
                >
                  Browse all brands
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            )}

            {!isLoading && !hasError && tab === 'products' && products.length === 0 && (
              <div className="text-center py-16">
                <PackageSearch className="w-10 h-10 text-[#141418]/20 mx-auto mb-4" aria-hidden="true" />
                <h2 className="font-sans font-semibold text-[#141418] mb-2">
                  No products found
                </h2>
                <p className="text-sm text-[#141418]/50 max-w-md mx-auto">
                  No products match "{query}". Try a different search term.
                </p>
              </div>
            )}

            {/* ── Brand results ─────────────────────────────────── */}
            {!isLoading && !hasError && tab === 'brands' && brands.length > 0 && (
              <div className="space-y-3">
                {brands.map((brand, i) => (
                  <BlockReveal key={brand.id} delay={i * 30}>
                    <Link
                      to={`/brands/${brand.slug}`}
                      className="flex items-center gap-4 bg-white rounded-xl p-4 border border-[#141418]/5 shadow-sm hover:shadow-md transition-shadow group"
                    >
                      <div className="h-14 w-14 rounded-lg bg-[#F6F3EF] flex-shrink-0 overflow-hidden">
                        {brand.logo_url ? (
                          <img
                            src={brand.logo_url}
                            alt={brand.name}
                            className="h-full w-full object-contain p-1"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <span className="text-xl font-bold text-[#141418]/20">
                              {brand.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans font-medium text-[#141418] group-hover:text-[#6E879B] transition-colors">
                          {brand.name}
                        </p>
                        {brand.description && (
                          <p className="text-sm text-[#141418]/50 line-clamp-1 mt-0.5">
                            {brand.description}
                          </p>
                        )}
                        {brand.category && (
                          <span className="inline-block text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full bg-[#6E879B]/10 text-[#6E879B] mt-1.5 font-medium">
                            {brand.category}
                          </span>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#141418]/20 group-hover:text-[#6E879B] flex-shrink-0 transition-colors" aria-hidden="true" />
                    </Link>
                  </BlockReveal>
                ))}
                {totalBrands > brands.length && (
                  <p className="text-center text-xs text-[#141418]/35 pt-2">
                    Showing {brands.length} of {totalBrands} brands
                  </p>
                )}
              </div>
            )}

            {/* ── Product results ───────────────────────────────── */}
            {!isLoading && !hasError && tab === 'products' && products.length > 0 && (
              <div className="space-y-3">
                {products.map((product, i) => (
                  <BlockReveal key={product.id} delay={i * 30}>
                    <div className="flex items-center gap-4 bg-white rounded-xl p-4 border border-[#141418]/5 shadow-sm">
                      <div className="h-14 w-14 rounded-lg bg-[#F6F3EF] flex-shrink-0 overflow-hidden">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.product_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <PackageSearch className="w-6 h-6 text-[#141418]/15" aria-hidden="true" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans font-medium text-[#141418]">
                          {product.product_name}
                        </p>
                        <p className="text-sm text-[#141418]/50 mt-0.5">
                          {product.brand_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {product.category && (
                            <span className="text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full bg-[#141418]/8 text-[#141418]/50 font-medium">
                              {product.category}
                            </span>
                          )}
                          <span className={`text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full font-medium ${
                            product.product_type === 'pro'
                              ? 'bg-[#6E879B]/10 text-[#6E879B]'
                              : 'bg-[#5F8A72]/10 text-[#5F8A72]'
                          }`}>
                            {product.product_type === 'pro' ? 'Professional' : 'Retail'}
                          </span>
                        </div>
                      </div>
                      {product.price != null && (
                        <p className="text-sm font-semibold text-[#141418] flex-shrink-0">
                          ${product.price.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </BlockReveal>
                ))}
                {totalProducts > products.length && (
                  <p className="text-center text-xs text-[#141418]/35 pt-2">
                    Showing {products.length} of {totalProducts} products
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
