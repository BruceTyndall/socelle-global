import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Package, AlertCircle, SlidersHorizontal, X } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { createScopedLogger } from '../../lib/logger';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import WordReveal from '../../components/motion/WordReveal';
import SiteFooter from '../../components/sections/SiteFooter';
import { TrustBadge } from '../../components/ui/TrustBadge';
import BrandCard from '../../components/BrandCard';
import {
  isBrandTrending,
  getBrandAdoptionCount,
  getBrandCategoryTags,
  brandPassesIntelFilter,
  BRAND_INTEL_FILTERS,
} from '../../lib/intelligence/brandIntelligence';
import type { BrandIntelFilter } from '../../lib/intelligence/brandIntelligence';
import { TrendingUp, Zap, Sparkles, Building2 } from 'lucide-react';

const log = createScopedLogger('Brands');

// ─── Types ────────────────────────────────────────────────────────────────────

interface BrandRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  logo_url: string | null;
  hero_image_url: string | null;
  category?: string | null;
  theme?: {
    colors: { primary: string; secondary: string; accent: string; surface: string; text: string };
  } | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_CHIPS = [
  { key: 'all', label: 'All' },
  { key: 'Skincare', label: 'Skincare' },
  { key: 'Haircare', label: 'Haircare' },
  { key: 'Body', label: 'Body' },
  { key: 'Wellness', label: 'Wellness' },
  { key: 'Makeup', label: 'Makeup' },
  { key: 'Nails', label: 'Nails' },
  { key: 'MedSpa', label: 'Med Spa' },
];

const SORT_OPTIONS = [
  { key: 'name', label: 'Name A\u2013Z' },
  { key: 'newest', label: 'Newest' },
  { key: 'top_rated', label: 'Top rated' },
];

type SortKey = 'name' | 'newest' | 'top_rated';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function BrandGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-card border border-[rgba(30,37,43,0.08)] overflow-hidden">
          <div className="h-36 w-full animate-pulse bg-mn-surface" />
          <div className="p-4 space-y-2">
            <div className="h-5 w-3/4 rounded animate-pulse bg-mn-surface" />
            <div className="h-3 w-1/2 rounded animate-pulse bg-mn-surface" />
            <div className="h-3 w-full rounded animate-pulse bg-mn-surface" />
            <div className="h-3 w-4/5 rounded animate-pulse bg-mn-surface" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Brands() {
  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'content' | 'network' | 'generic'>('generic');

  // Filters
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [filterNew, setFilterNew] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeIntelFilter, setActiveIntelFilter] = useState<BrandIntelFilter | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    setError(null);
    setErrorType('generic');

    if (!isSupabaseConfigured) {
      setError('Platform is being configured. Check back soon.');
      setErrorType('content');
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    try {
      const { data, error: supabaseError } = await supabase
        .from('brands')
        .select('id, name, slug, description, status, logo_url, hero_image_url, category, theme')
        .or('is_published.eq.true,status.eq.active')
        .order('name')
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (supabaseError) {
        log.warn('Supabase error fetching brands', { error: supabaseError });
        const isRls = ['PGRST301', 'PGRST116', '42501'].includes(supabaseError.code ?? '') ||
          supabaseError.message?.toLowerCase().includes('permission') ||
          supabaseError.message?.toLowerCase().includes('rls');

        if (isRls) {
          setError('Content is being prepared. Please check back shortly.');
          setErrorType('content');
        } else {
          throw supabaseError;
        }
      } else {
        setBrands(data || []);
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isAbort = err instanceof Error && err.name === 'AbortError';
      const isNetwork = err instanceof Error && (err.message.includes('fetch') || err.message.includes('network'));

      if (isAbort || isNetwork) {
        setError('Connection issue. Please check your internet and refresh.');
        setErrorType('network');
      } else {
        log.warn('Error fetching brands', { err });
        setError('Content is being prepared. Please check back shortly.');
        setErrorType('content');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Derived / filtered brands ─────────────────────────────────

  const filteredBrands = useMemo(() => {
    let result = [...brands];

    if (activeCategory !== 'all') {
      result = result.filter(
        (b) => b.category?.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    // "New" filter: crude proxy — first 10% alphabetically per category
    if (filterNew) {
      result = result.slice(0, Math.max(1, Math.ceil(result.length * 0.2)));
    }

    // Intelligence-based filter
    if (activeIntelFilter) {
      result = result.filter((b) => brandPassesIntelFilter(b.slug, activeIntelFilter));
    }

    switch (sortKey) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        // No created_at in query yet; reverse alphabetical as placeholder
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'top_rated':
        // No rating data yet; keep as-is
        break;
    }

    return result;
  }, [brands, activeCategory, sortKey, filterNew, activeIntelFilter]);

  const getAuthAwareHref = (brand: BrandRow) => {
    const target = `/portal/brands/${brand.slug}`;
    return user ? target : `/portal/login?returnTo=${encodeURIComponent(target)}`;
  };

  const activeFilterCount = (activeCategory !== 'all' ? 1 : 0) + (filterNew ? 1 : 0) + (activeIntelFilter ? 1 : 0);

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-mn-bg">
      <Helmet>
        <title>Browse Professional Beauty Brands — Socelle Wholesale</title>
        <meta name="description" content="Discover verified professional beauty brands offering wholesale pricing to licensed salons, spas, and medspas. Skincare, haircare, wellness, med spa, and more." />
        <meta property="og:title" content="Browse Professional Beauty Brands — Socelle" />
        <meta property="og:description" content="Verified wholesale brands for licensed salons, spas, and medspas. Skincare, haircare, body, wellness, and med spa categories." />
        <link rel="canonical" href="https://socelle.com/brands" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Professional Beauty Brands on Socelle",
            "description": "Verified professional beauty brands offering wholesale pricing to licensed salons, spas, and medspas.",
            "url": "https://socelle.com/brands",
            "numberOfItems": ${filteredBrands.length},
            "itemListElement": ${JSON.stringify(
          filteredBrands.slice(0, 10).map((brand, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": brand.name,
            "url": `https://socelle.com/brands/${brand.slug}`,
          }))
        )}
          }
        `}</script>
      </Helmet>
      <MainNav />

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <div className="bg-mn-dark py-20 lg:py-28 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <BlockReveal>
            <p className="text-[0.8125rem] uppercase tracking-[0.12em] font-medium text-accent font-sans mb-4">
              Curated for professionals
            </p>
          </BlockReveal>
          <WordReveal
            text="Brand Intelligence"
            as="h1"
            className="font-sans font-semibold text-hero text-[#F7F5F2] mb-4 justify-center"
          />
          <BlockReveal delay={200}>
            <p className="text-[rgba(247,245,242,0.55)] font-sans text-body max-w-xl mx-auto mb-8">
              Compare brands by category, adoption velocity, education depth, and operator footprint.
            </p>
          </BlockReveal>
          <BlockReveal delay={350}>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => { const el = document.getElementById('search-brands'); if (el) el.focus(); else window.scrollTo(0, 500); }}
                className="bg-[#F7F5F2] text-graphite rounded-full h-[52px] px-8 font-sans font-medium text-sm transition-all hover:bg-white hover:scale-[1.02]"
              >
                Search Brands
              </button>
              <Link to="/intelligence" className="inline-flex items-center justify-center rounded-full h-[52px] px-8 bg-white/10 text-[#F7F5F2] border border-[rgba(247,245,242,0.16)] font-sans font-medium text-sm hover:bg-white/15 transition-all duration-200">
                View Market Pulse
              </Link>
            </div>
          </BlockReveal>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Category filter chips ──────────────────────────────── */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
          {CATEGORY_CHIPS.map((chip) => (
            <button
              key={chip.key}
              onClick={() => setActiveCategory(chip.key)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-pill text-sm font-sans font-medium border transition-all duration-150
                ${activeCategory === chip.key
                  ? 'bg-[#1F2428] text-[#F7F5F2] border-[#1F2428]'
                  : 'bg-white text-[rgba(30,37,43,0.62)] border-[rgba(30,37,43,0.12)] hover:border-graphite hover:text-graphite'
                }
              `}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* ── Intelligence filter chips ──────────────────────────── */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
          <span className="flex-shrink-0 text-[0.8125rem] uppercase tracking-[0.12em] font-medium text-[rgba(30,37,43,0.42)] font-sans mr-1">
            Intelligence:
          </span>
          {BRAND_INTEL_FILTERS.map((filter) => {
            const isActive = activeIntelFilter === filter.key;
            const icons: Record<string, typeof TrendingUp> = {
              trending: TrendingUp,
              most_adopted: Building2,
              new_to_platform: Sparkles,
              medspa_recommended: Zap,
            };
            const Icon = icons[filter.key] ?? TrendingUp;
            return (
              <button
                key={filter.key}
                onClick={() => setActiveIntelFilter(isActive ? null : filter.key)}
                className={`
                  flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-pill text-xs font-sans font-medium border transition-all duration-150
                  ${isActive
                    ? 'bg-mn-dark text-[#F7F5F2] border-mn-dark shadow-panel'
                    : 'bg-white text-[rgba(30,37,43,0.62)] border-[rgba(30,37,43,0.12)] hover:border-accent hover:text-accent'
                  }
                `}
              >
                <Icon className="w-3 h-3" />
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* ── Filter bar ────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter toggle button */}
            <button
              onClick={() => setShowFilters((f) => !f)}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-pill text-sm font-sans font-medium border transition-all
                ${showFilters || activeFilterCount > 0
                  ? 'bg-[#1F2428] text-[#F7F5F2] border-[#1F2428]'
                  : 'bg-white text-[rgba(30,37,43,0.62)] border-[rgba(30,37,43,0.12)] hover:border-graphite hover:text-graphite'
                }
              `}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-0.5 w-4 h-4 bg-accent rounded-full text-[#F7F5F2] text-[10px] flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Active filter chips */}
            {filterNew && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-mn-surface text-graphite text-xs font-medium font-sans rounded-pill border border-[rgba(30,37,43,0.12)]">
                New brands
                <button onClick={() => setFilterNew(false)} className="hover:text-accent transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {activeIntelFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-mn-dark text-[#F7F5F2] text-xs font-medium font-sans rounded-pill border border-[rgba(247,245,242,0.15)]">
                {BRAND_INTEL_FILTERS.find((f) => f.key === activeIntelFilter)?.label}
                <button onClick={() => setActiveIntelFilter(null)} className="hover:text-accent transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[rgba(30,37,43,0.42)] font-sans">
              {filteredBrands.length} brand{filteredBrands.length !== 1 ? 's' : ''}
            </span>

            {/* Sort dropdown */}
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="text-sm font-sans text-graphite border border-[rgba(30,37,43,0.12)] rounded-lg px-3 py-1.5 bg-white focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Filter panel ──────────────────────────────────────── */}
        {showFilters && (
          <div className="bg-white border border-[rgba(30,37,43,0.08)] rounded-card p-5 mb-6 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-sans font-semibold text-graphite text-sm">Filter brands</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => { setFilterNew(false); setActiveCategory('all'); setActiveIntelFilter(null); }}
                  className="text-xs font-medium font-sans text-[rgba(30,37,43,0.42)] hover:text-graphite transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterNew}
                  onChange={(e) => setFilterNew(e.target.checked)}
                  className="accent-[#1F2428] w-4 h-4 rounded"
                />
                <span className="text-sm font-sans text-graphite">New brands</span>
              </label>
            </div>
          </div>
        )}

        {/* ── Main content ──────────────────────────────────────── */}
        {error ? (
          <div className="max-w-2xl mx-auto">
            <div
              className={`border rounded-card p-6 ${errorType === 'network'
                ? 'bg-red-50 border-red-200'
                : 'bg-mn-surface border-[rgba(30,37,43,0.08)]'
                }`}
            >
              <div className="flex items-start gap-3">
                <AlertCircle
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${errorType === 'network' ? 'text-red-600' : 'text-graphite'
                    }`}
                />
                <div>
                  <h3
                    className={`font-sans font-semibold mb-1 ${errorType === 'network' ? 'text-red-900' : 'text-graphite'
                      }`}
                  >
                    {errorType === 'network' ? 'Brand discovery unavailable' : 'Content being prepared'}
                  </h3>
                  <p className={`text-sm font-sans mb-4 ${errorType === 'network' ? 'text-red-700' : 'text-[rgba(30,37,43,0.62)]'
                    }`}>
                    {error}
                  </p>
                  <button
                    onClick={fetchBrands}
                    className="bg-[#1F2428] text-[#F7F5F2] rounded-full h-[42px] px-6 font-sans font-medium text-sm transition-colors hover:bg-graphite"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : loading ? (
          <BrandGridSkeleton />
        ) : filteredBrands.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[rgba(30,37,43,0.12)] rounded-card">
            <Package className="w-14 h-14 text-[rgba(30,37,43,0.2)] mx-auto mb-4" />
            <h3 className="font-sans font-semibold text-subsection text-graphite mb-2">No brands found</h3>
            <p className="font-sans text-[rgba(30,37,43,0.62)] text-sm mb-4">
              {activeCategory !== 'all'
                ? `No ${activeCategory} brands yet. Try a different category.`
                : 'No brands available yet. Check back soon.'}
            </p>
            {activeCategory !== 'all' && (
              <button
                onClick={() => setActiveCategory('all')}
                className="rounded-full h-[42px] px-6 bg-white/65 text-graphite border border-[rgba(30,37,43,0.12)] font-sans font-medium text-sm transition-colors hover:border-graphite"
              >
                View all brands
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Editorial moment: curated gallery feel */}
            <div className="mb-10 pb-8 border-b border-[rgba(30,37,43,0.08)]">
              <div className="flex justify-center mb-3">
                <TrustBadge variant="authorized" size="md" />
              </div>
              <p className="text-[rgba(30,37,43,0.62)] font-sans text-center text-sm max-w-xl mx-auto">
                All brands verified and authorized for professional distribution.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {filteredBrands.map((brand) => {
                const trending = isBrandTrending(brand.slug);
                const adoptionCount = getBrandAdoptionCount(brand.slug);
                const tags = getBrandCategoryTags(brand.slug);
                return (
                  <div key={brand.id} className="relative group/intel">
                    <BrandCard
                      id={brand.id}
                      name={brand.name}
                      slug={brand.slug}
                      description={brand.description}
                      logoUrl={brand.logo_url}
                      heroImageUrl={brand.hero_image_url}
                      category={brand.category ?? undefined}
                      href={getAuthAwareHref(brand)}
                      keyStat={undefined}
                    />
                    {/* Intelligence overlay — trending badge */}
                    {trending && (
                      <div className="absolute top-2 right-2 z-10 pointer-events-none">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-mn-dark text-[#F7F5F2] text-[10px] font-sans font-bold tracking-wider uppercase rounded-pill shadow-panel backdrop-blur-sm">
                          <TrendingUp className="w-3 h-3 text-signal-up" />
                          Trending
                        </span>
                      </div>
                    )}
                    {/* Intelligence overlay — category tags */}
                    {tags.length > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pointer-events-none">
                        <div className="flex flex-wrap gap-1">
                          {tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-mn-dark/80 text-[#F7F5F2] text-[10px] font-sans font-medium rounded-pill backdrop-blur-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── Guest signup CTA ──────────────────────────────────── */}
        {!user && !loading && !error && (
          <div className="mt-20 bg-mn-dark rounded-card p-10 sm:p-12 text-center shadow-panel">
            <h2 className="font-sans font-semibold text-section text-[#F7F5F2] mb-4">
              Ready to order wholesale?
            </h2>
            <p className="font-sans text-[rgba(247,245,242,0.55)] mb-7 max-w-xl mx-auto text-sm leading-relaxed">
              Create your free account to access all brands, access wholesale pricing,
              and get personalized protocol recommendations.
            </p>
            <Link
              to="/portal/signup"
              className="inline-flex items-center gap-2 bg-[#F7F5F2] text-graphite rounded-full h-[52px] px-8 font-sans font-medium text-sm transition-colors hover:bg-white"
            >
              Create free account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <SiteFooter />
    </div>
  );
}
