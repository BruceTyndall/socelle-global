/* ═══════════════════════════════════════════════════════════════
   Brands.tsx — Brand Directory (V2-HUBS-03 Non-Shell Upgrade)
   Data: LIVE from Supabase `brands` table via TanStack Query v5
   Competitive Intelligence: LIVE from `market_signals` brand mentions
   Intelligence overlays: DEMO (mock brandIntelligence layer)
   Pearl Mineral V2 tokens only — no pro-*, no font-sans
   ═══════════════════════════════════════════════════════════════ */
import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Package,
  AlertCircle,
  SlidersHorizontal,
  X,
  TrendingUp,
  Zap,
  Sparkles,
  Building2,
  Search,
  Download,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import WordReveal from '../../components/motion/WordReveal';
import SiteFooter from '../../components/sections/SiteFooter';
import { TrustBadge } from '../../components/ui/TrustBadge';
import BrandCard from '../../components/BrandCard';
import {
  isBrandTrending,
  getBrandCategoryTags,
  brandPassesIntelFilter,
  BRAND_INTEL_FILTERS,
} from '../../lib/intelligence/brandIntelligence';
import type { BrandIntelFilter } from '../../lib/intelligence/brandIntelligence';
import { useActionableSignals } from '../../lib/intelligence/useActionableSignals';
import { CrossHubActionDispatcher } from '../../components/CrossHubActionDispatcher';

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

interface BrandMention {
  brandName: string;
  count: number;
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
  { key: 'name_desc', label: 'Name Z\u2013A' },
  { key: 'popularity', label: 'Most mentioned' },
];

type SortKey = 'name' | 'name_desc' | 'popularity';

/** Decorative brand photos for the hero collage */
const HERO_PHOTOS = [7, 8, 9, 10, 11, 12].map(
  (n) => `/images/brand/photos/${n}.svg`
);

/** Decorative fallback photos for the grid area */
const DECORATIVE_PHOTOS = [13, 14, 15, 16, 17, 18].map(
  (n) => `/images/brand/photos/${n}.svg`
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function BrandGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-graphite/8 overflow-hidden">
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

function CompetitiveIntelSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-graphite/8">
          <div className="h-4 w-32 rounded animate-pulse bg-mn-surface" />
          <div className="h-4 w-20 rounded animate-pulse bg-mn-surface" />
        </div>
      ))}
    </div>
  );
}

// ─── CSV Export ────────────────────────────────────────────────────────────────

function exportBrandsCSV(brands: BrandRow[]) {
  const headers = ['Name', 'Category', 'Description', 'URL'];
  const rows = brands.map((b) => [
    b.name,
    b.category ?? '',
    (b.description ?? '').replace(/"/g, '""'),
    `https://socelle.com/brands/${b.slug}`,
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `socelle-brand-directory-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useBrands() {
  return useQuery<BrandRow[], Error>({
    queryKey: ['brands', 'directory'],
    queryFn: async () => {
      if (!isSupabaseConfigured) {
        throw new Error('Platform is being configured. Check back soon.');
      }
      const { data, error } = await supabase
        .from('brands')
        .select('id, name, slug, description, status, logo_url, hero_image_url, category, theme')
        .or('is_published.eq.true,status.eq.active')
        .order('name');

      if (error) throw error;
      return (data ?? []) as BrandRow[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

function useBrandMentions(brandNames: string[]) {
  return useQuery<BrandMention[], Error>({
    queryKey: ['brand-mentions', brandNames.length],
    queryFn: async () => {
      if (!isSupabaseConfigured || brandNames.length === 0) return [];

      const { data, error } = await supabase
        .from('market_signals')
        .select('title, description')
        .eq('active', true);

      if (error) throw error;
      if (!data || data.length === 0) return [];

      // Count mentions of each brand name in signal titles/descriptions
      const mentionMap = new Map<string, number>();
      for (const name of brandNames) {
        mentionMap.set(name, 0);
      }

      for (const signal of data) {
        const text = `${signal.title} ${signal.description}`.toLowerCase();
        for (const name of brandNames) {
          if (text.includes(name.toLowerCase())) {
            mentionMap.set(name, (mentionMap.get(name) ?? 0) + 1);
          }
        }
      }

      return Array.from(mentionMap.entries())
        .map(([brandName, count]) => ({ brandName, count }))
        .filter((m) => m.count > 0)
        .sort((a, b) => b.count - a.count);
    },
    enabled: brandNames.length > 0,
    staleTime: 10 * 60 * 1000,
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Brands() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [filterNew, setFilterNew] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeIntelFilter, setActiveIntelFilter] = useState<BrandIntelFilter | null>(null);

  const { user } = useAuth();
  const {
    signals: actionableSignals,
    loading: signalsLoading,
    error: signalsError,
    refetch: refetchSignals,
  } = useActionableSignals(3);

  const { data: brands = [], isLoading: loading, error: queryError, refetch } = useBrands();

  const brandNames = useMemo(() => brands.map((b) => b.name), [brands]);
  const { data: brandMentions = [], isLoading: mentionsLoading } = useBrandMentions(brandNames);

  const mentionsByName = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of brandMentions) {
      map.set(m.brandName, m.count);
    }
    return map;
  }, [brandMentions]);

  const error = queryError?.message ?? null;
  const isNetworkError = queryError instanceof Error && (queryError.message.includes('fetch') || queryError.message.includes('network'));

  // ── Derived / filtered brands ─────────────────────────────────

  const filteredBrands = useMemo(() => {
    let result = [...brands];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          (b.description?.toLowerCase().includes(q) ?? false) ||
          (b.category?.toLowerCase().includes(q) ?? false)
      );
    }

    if (activeCategory !== 'all') {
      result = result.filter(
        (b) => b.category?.toLowerCase() === activeCategory.toLowerCase()
      );
    }

    if (filterNew) {
      result = result.slice(0, Math.max(1, Math.ceil(result.length * 0.2)));
    }

    if (activeIntelFilter) {
      result = result.filter((b) => brandPassesIntelFilter(b.slug, activeIntelFilter));
    }

    switch (sortKey) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'popularity':
        result.sort((a, b) => (mentionsByName.get(b.name) ?? 0) - (mentionsByName.get(a.name) ?? 0));
        break;
    }

    return result;
  }, [brands, activeCategory, sortKey, filterNew, activeIntelFilter, searchQuery, mentionsByName]);

  const handleExportCSV = useCallback(() => {
    exportBrandsCSV(filteredBrands);
  }, [filteredBrands]);

  const activeFilterCount = (activeCategory !== 'all' ? 1 : 0) + (filterNew ? 1 : 0) + (activeIntelFilter ? 1 : 0);

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-mn-bg">
      <Helmet>
        <title>Discover Professional Beauty Brands | Socelle</title>
        <meta name="description" content="Explore verified professional beauty brands with intelligence-backed profiles. Skincare, haircare, wellness, med spa, and more -- curated for licensed practitioners." />
        <meta property="og:title" content="Discover Professional Beauty Brands | Socelle" />
        <meta property="og:description" content="Intelligence-backed brand profiles for licensed salons, spas, and medspas." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://socelle.com/brands" />
        <meta property="og:image" content="https://socelle.com/og-image.svg" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://socelle.com/brands" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Professional Beauty Brands on Socelle",
            "description": "Verified professional beauty brands with intelligence profiles for licensed practitioners.",
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

      {/* ── Hero: Photo Collage + Glass Overlay ──────────────────── */}
      <section className="relative overflow-hidden bg-graphite">
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-1 opacity-40">
          {HERO_PHOTOS.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover"
              loading={i < 3 ? 'eager' : 'lazy'}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-graphite/60 via-graphite/80 to-graphite" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36 text-center">
          <BlockReveal>
            <p className="text-[0.8125rem] uppercase tracking-[0.12em] font-medium text-accent font-sans mb-4">
              Curated for professionals
            </p>
          </BlockReveal>
          <WordReveal
            text="Discover Professional Beauty Brands"
            as="h1"
            className="font-sans font-semibold text-hero text-white mb-5 justify-center"
          />
          <BlockReveal delay={200}>
            <p className="text-white/55 font-sans text-body max-w-2xl mx-auto mb-10">
              Intelligence-backed profiles for every brand. Compare by category, adoption velocity,
              education depth, and operator footprint.
            </p>
          </BlockReveal>
          <BlockReveal delay={350}>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => {
                  const el = document.getElementById('brand-search');
                  if (el) { el.scrollIntoView({ behavior: 'smooth' }); setTimeout(() => el.focus(), 400); }
                }}
                className="btn-mineral-primary"
              >
                Search Brands
              </button>
              <Link to="/intelligence" className="btn-mineral-glass">
                View Market Pulse
              </Link>
            </div>
          </BlockReveal>
        </div>

        <div className="relative z-10 flex justify-center gap-2 pb-8 px-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <img
              key={n}
              src={`/images/brand/swatches/${n}.svg`}
              alt=""
              aria-hidden="true"
              className="w-10 h-10 rounded-full border-2 border-white/20 object-cover"
              loading="lazy"
            />
          ))}
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Search bar ──────────────────────────────────────────── */}
        <div className="mb-6 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/40" />
            <input
              id="brand-search"
              type="text"
              placeholder="Search brands by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-graphite/12 bg-white text-sm font-sans text-graphite placeholder:text-graphite/40 focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-graphite/40 hover:text-graphite transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            disabled={filteredBrands.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-graphite/12 bg-white text-sm font-sans font-medium text-graphite/62 hover:border-graphite hover:text-graphite disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Export brand directory to CSV"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>

        {/* ── Category filter chips ──────────────────────────────── */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
          {CATEGORY_CHIPS.map((chip) => (
            <button
              key={chip.key}
              onClick={() => setActiveCategory(chip.key)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-full text-sm font-sans font-medium border transition-all duration-150
                ${activeCategory === chip.key
                  ? 'bg-graphite text-white border-graphite'
                  : 'bg-white text-graphite/62 border-graphite/12 hover:border-graphite hover:text-graphite'
                }
              `}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* ── Intelligence filter chips (DEMO) ────────────────────── */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
          <span className="flex-shrink-0 text-[0.8125rem] uppercase tracking-[0.12em] font-medium text-graphite/42 font-sans mr-1">
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
                  flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-sans font-medium border transition-all duration-150
                  ${isActive
                    ? 'bg-graphite text-white border-graphite shadow-sm'
                    : 'bg-white text-graphite/62 border-graphite/12 hover:border-accent hover:text-accent'
                  }
                `}
              >
                <Icon className="w-3 h-3" />
                {filter.label}
              </button>
            );
          })}
          <span className="flex-shrink-0 text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full ml-1">
            DEMO
          </span>
        </div>

        {/* ── Filter bar ────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowFilters((f) => !f)}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-sans font-medium border transition-all
                ${showFilters || activeFilterCount > 0
                  ? 'bg-graphite text-white border-graphite'
                  : 'bg-white text-graphite/62 border-graphite/12 hover:border-graphite hover:text-graphite'
                }
              `}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-0.5 w-4 h-4 bg-accent rounded-full text-white text-[10px] flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {filterNew && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-mn-surface text-graphite text-xs font-medium font-sans rounded-full border border-graphite/12">
                New brands
                <button onClick={() => setFilterNew(false)} className="hover:text-accent transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {activeIntelFilter && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-graphite text-white text-xs font-medium font-sans rounded-full border border-white/15">
                {BRAND_INTEL_FILTERS.find((f) => f.key === activeIntelFilter)?.label}
                <button onClick={() => setActiveIntelFilter(null)} className="hover:text-accent transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-graphite/42 font-sans">
              {filteredBrands.length} brand{filteredBrands.length !== 1 ? 's' : ''}
            </span>

            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="text-sm font-sans text-graphite border border-graphite/12 rounded-lg px-3 py-1.5 bg-white focus:border-accent focus:ring-1 focus:ring-accent/20 outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Filter panel ──────────────────────────────────────── */}
        {showFilters && (
          <div className="bg-white border border-graphite/8 rounded-2xl p-5 mb-6 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-sans font-semibold text-graphite text-sm">Filter brands</h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => { setFilterNew(false); setActiveCategory('all'); setActiveIntelFilter(null); }}
                  className="text-xs font-medium font-sans text-graphite/42 hover:text-graphite transition-colors"
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
                  className="accent-graphite w-4 h-4 rounded"
                />
                <span className="text-sm font-sans text-graphite">New brands</span>
              </label>
            </div>
          </div>
        )}

        {/* ── Competitive Intelligence Section ────────────────── */}
        {!error && !loading && brandMentions.length > 0 && (
          <div className="mb-10 bg-white border border-graphite/8 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-accent" />
              <h3 className="font-sans font-semibold text-graphite text-base">Competitive Intelligence</h3>
              <span className="text-[10px] font-semibold bg-signal-up/10 text-signal-up px-2 py-0.5 rounded-full ml-auto">
                LIVE
              </span>
            </div>
            <p className="text-xs text-graphite/50 font-sans mb-4">
              Brand mentions across active market signals this month
            </p>
            {mentionsLoading ? (
              <CompetitiveIntelSkeleton />
            ) : (
              <div className="space-y-2">
                {brandMentions.slice(0, 10).map((m) => {
                  const maxCount = brandMentions[0]?.count ?? 1;
                  const pct = Math.round((m.count / maxCount) * 100);
                  return (
                    <div key={m.brandName} className="flex items-center gap-3">
                      <span className="text-sm font-sans font-medium text-graphite w-40 truncate flex-shrink-0">
                        {m.brandName}
                      </span>
                      <div className="flex-1 h-2 bg-mn-surface rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-sans font-semibold text-graphite/60 w-20 text-right flex-shrink-0">
                        {m.count} mention{m.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Main content ──────────────────────────────────────── */}
        {error ? (
          <div className="max-w-2xl mx-auto">
            <div
              className={`border rounded-2xl p-6 ${isNetworkError
                ? 'bg-red-50 border-red-200'
                : 'bg-mn-surface border-graphite/8'
                }`}
            >
              <div className="flex items-start gap-3">
                <AlertCircle
                  className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isNetworkError ? 'text-red-600' : 'text-graphite'
                    }`}
                />
                <div>
                  <h3
                    className={`font-sans font-semibold mb-1 ${isNetworkError ? 'text-red-900' : 'text-graphite'
                      }`}
                  >
                    {isNetworkError ? 'Brand discovery unavailable' : 'Content being prepared'}
                  </h3>
                  <p className={`text-sm font-sans mb-4 ${isNetworkError ? 'text-red-700' : 'text-graphite/62'
                    }`}>
                    {error}
                  </p>
                  <button
                    onClick={() => refetch()}
                    className="btn-mineral-primary btn-mineral-sm"
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
          <div className="text-center py-20 border border-dashed border-graphite/12 rounded-2xl">
            <Package className="w-14 h-14 text-graphite/20 mx-auto mb-4" />
            <h3 className="font-sans font-semibold text-lg text-graphite mb-2">No brands found</h3>
            <p className="font-sans text-graphite/62 text-sm mb-4">
              {searchQuery
                ? `No brands matching "${searchQuery}". Try a different search.`
                : activeCategory !== 'all'
                  ? `No ${activeCategory} brands yet. Try a different category.`
                  : 'No brands available yet. Check back soon.'}
            </p>
            {(activeCategory !== 'all' || searchQuery) && (
              <button
                onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
                className="btn-mineral-accent btn-mineral-sm"
              >
                View all brands
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-10 pb-8 border-b border-graphite/8">
              <div className="flex items-center justify-center gap-3 mb-3">
                <TrustBadge variant="authorized" size="md" />
                <span className="text-[10px] font-semibold bg-signal-up/10 text-signal-up px-2 py-0.5 rounded-full">
                  LIVE
                </span>
              </div>
              <p className="text-graphite/62 font-sans text-center text-sm max-w-xl mx-auto">
                All brands verified and authorized for professional distribution.
              </p>
            </div>

            <div className="mb-8 bg-white rounded-2xl border border-graphite/8 p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-graphite">Signal-Driven Actions</h3>
                  <p className="text-xs text-graphite/50 mt-0.5">
                    Launch CRM, campaign, and sales actions from live intelligence signals.
                  </p>
                </div>
                <Link to="/intelligence" className="text-xs font-medium text-accent hover:text-accent-hover">
                  Open Intelligence
                </Link>
              </div>

              {signalsLoading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-10 rounded-lg bg-mn-surface" />
                  <div className="h-10 rounded-lg bg-mn-surface" />
                </div>
              ) : signalsError ? (
                <div className="flex items-center justify-between gap-3 bg-signal-down/5 border border-signal-down/20 rounded-lg px-3 py-2.5">
                  <p className="text-xs text-graphite/70">{signalsError}</p>
                  <button
                    onClick={() => {
                      void refetchSignals();
                    }}
                    className="inline-flex items-center gap-1 text-xs text-graphite/70 hover:text-graphite"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retry
                  </button>
                </div>
              ) : actionableSignals.length === 0 ? (
                <div className="text-center py-6">
                  <Zap className="w-6 h-6 text-graphite/20 mx-auto mb-2" />
                  <p className="text-xs text-graphite/60">No active signals right now</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {actionableSignals.map((signal) => (
                    <div key={signal.id} className="flex items-center gap-2 border border-graphite/8 rounded-lg px-3 py-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-graphite truncate">{signal.title}</p>
                        <p className="text-xs text-graphite/60">
                          {signal.category} • Δ {signal.delta.toFixed(1)} • {(signal.confidence * 100).toFixed(0)}% confidence
                        </p>
                      </div>
                      <CrossHubActionDispatcher
                        compact
                        signal={{
                          id: signal.id,
                          title: signal.title,
                          category: signal.category,
                          delta: signal.delta,
                          confidence: signal.confidence,
                          source: signal.source,
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Brand grid with Schema.org Organization JSON-LD per card */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
              {filteredBrands.map((brand, idx) => {
                const trending = isBrandTrending(brand.slug);
                const tags = getBrandCategoryTags(brand.slug);
                const fallbackImg = !brand.hero_image_url
                  ? DECORATIVE_PHOTOS[idx % DECORATIVE_PHOTOS.length]
                  : undefined;

                const orgSchema = {
                  '@context': 'https://schema.org',
                  '@type': 'Organization',
                  name: brand.name,
                  url: `https://socelle.com/brands/${brand.slug}`,
                  ...(brand.description && { description: brand.description }),
                  ...(brand.logo_url && { logo: brand.logo_url }),
                };

                return (
                  <div key={brand.id} className="relative group/intel">
                    <script
                      type="application/ld+json"
                      dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
                    />
                    <BrandCard
                      id={brand.id}
                      name={brand.name}
                      slug={brand.slug}
                      description={brand.description}
                      logoUrl={brand.logo_url}
                      heroImageUrl={brand.hero_image_url ?? fallbackImg ?? null}
                      category={brand.category ?? undefined}
                      href={`/brands/${brand.slug}`}
                      keyStat={undefined}
                    />
                    {trending && (
                      <div className="absolute top-2 right-2 z-10 pointer-events-none">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-graphite text-white text-[10px] font-sans font-bold tracking-wider uppercase rounded-full shadow-sm backdrop-blur-sm">
                          <TrendingUp className="w-3 h-3 text-signal-up" />
                          Trending
                        </span>
                      </div>
                    )}
                    {tags.length > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 pointer-events-none">
                        <div className="flex flex-wrap gap-1">
                          {tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-graphite/80 text-white text-[10px] font-sans font-medium rounded-full backdrop-blur-sm"
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

        {/* ── Decorative photo strip ─────────────────────────────── */}
        {!loading && !error && filteredBrands.length > 0 && (
          <div className="mt-16 mb-8">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 rounded-2xl overflow-hidden">
              {DECORATIVE_PHOTOS.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  aria-hidden="true"
                  className="w-full aspect-square object-cover"
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Guest signup CTA ──────────────────────────────────── */}
        {!user && !loading && !error && (
          <div className="mt-12 bg-graphite rounded-2xl p-10 sm:p-12 text-center shadow-sm">
            <h2 className="font-sans font-semibold text-2xl text-white mb-4">
              Get full brand intelligence
            </h2>
            <p className="font-sans text-white/55 mb-7 max-w-xl mx-auto text-sm leading-relaxed">
              Create your free account to access detailed brand profiles, adoption velocity data,
              and personalized protocol recommendations.
            </p>
            <Link to="/request-access" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-sm font-sans font-medium tracking-wide hover:bg-white/25 transition-all duration-300">
              Get Intelligence Access
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
