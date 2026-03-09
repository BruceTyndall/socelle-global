// ── IntelligenceBriefs — V2-HUBS-14 ──────────────────────────────────
// Public intelligence briefs listing: /intelligence/briefs
// Data: cms_posts where space='intelligence', status='published'
// Pearl Mineral V2 tokens only.

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Clock, ArrowRight, Search, FileText } from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useIntelligencePosts } from '../../lib/cms';
import type { CmsPost } from '../../lib/cms/types';

const POSTS_PER_PAGE = 12;

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function estimateReadingTime(post: CmsPost): number {
  if (post.reading_time) return post.reading_time;
  const wordCount = (post.body ?? '').split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 250));
}

// ── Skeleton ──────────────────────────────────────────────────────────

function BriefCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-[#141418]/5 overflow-hidden animate-pulse">
      <div className="p-5 space-y-3">
        <div className="h-3 bg-[#141418]/5 rounded w-1/4" />
        <div className="h-5 bg-[#141418]/5 rounded w-3/4" />
        <div className="h-3 bg-[#141418]/5 rounded w-full" />
        <div className="h-3 bg-[#141418]/5 rounded w-1/2" />
      </div>
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────

function BriefCard({ post }: { post: CmsPost }) {
  const readTime = estimateReadingTime(post);

  return (
    <Link
      to={`/intelligence/briefs/${post.slug}`}
      className="group bg-white rounded-xl border border-[#141418]/5 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      {post.hero_image && (
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={post.hero_image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-5">
        {post.category && (
          <span className="text-xs font-semibold text-[#6E879B] font-sans uppercase tracking-wide">
            {post.category}
          </span>
        )}
        <h3 className="mt-1 text-lg font-bold text-[#141418] font-sans leading-snug group-hover:text-[#6E879B] transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 text-sm text-[#141418]/60 font-sans line-clamp-2">
            {post.excerpt}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#141418]/40 font-sans">
            {post.published_at && (
              <span>{formatDate(post.published_at)}</span>
            )}
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {readTime} min
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-[#6E879B] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────

export default function IntelligenceBriefs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { briefs, isLoading, isLive, error } = useIntelligencePosts({
    status: 'published',
  });

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    briefs.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats).sort();
  }, [briefs]);

  // Filter by search + category
  const filtered = useMemo(() => {
    let result = briefs;
    if (activeCategory) {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          (p.excerpt ?? '').toLowerCase().includes(term) ||
          (p.category ?? '').toLowerCase().includes(term)
      );
    }
    return result;
  }, [briefs, activeCategory, searchTerm]);

  // Paginate
  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * POSTS_PER_PAGE,
    page * POSTS_PER_PAGE
  );

  // Schema.org CollectionPage
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Intelligence Briefs | SOCELLE',
    description:
      'Market intelligence briefs, trend analyses, and signal reports for the professional beauty and medspa industry.',
    url: 'https://socelle.com/intelligence/briefs',
    publisher: {
      '@type': 'Organization',
      name: 'SOCELLE',
      url: 'https://socelle.com',
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: filtered.length,
      itemListElement: paginated.slice(0, 10).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `https://socelle.com/intelligence/briefs/${p.slug}`,
        name: p.title,
      })),
    },
  };

  return (
    <>
      <Helmet>
        <title>Intelligence Briefs | SOCELLE</title>
        <meta
          name="description"
          content="Market intelligence briefs, trend analyses, and signal reports for the professional beauty and medspa industry."
        />
        <meta property="og:title" content="Intelligence Briefs | SOCELLE" />
        <meta
          property="og:description"
          content="Market intelligence briefs, trend analyses, and signal reports for the professional beauty and medspa industry."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://socelle.com/intelligence/briefs" />
        <meta property="og:image" content="https://socelle.com/og-image.svg" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://socelle.com/intelligence/briefs" />
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>

      <MainNav />

      <main className="min-h-screen bg-[#F6F3EF] pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-[#141418] font-sans">
              Intelligence Briefs
            </h1>
            <p className="mt-3 text-[#141418]/60 font-sans text-lg max-w-xl mx-auto">
              Market signals, trend analyses, and strategic intelligence for
              beauty and medspa professionals.
            </p>
            {!isLive && !isLoading && (
              <span className="inline-block mt-3 text-[10px] font-semibold bg-[#A97A4C]/10 text-[#A97A4C] px-2 py-0.5 rounded-full">
                DEMO
              </span>
            )}
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#141418]/30" />
              <input
                type="text"
                placeholder="Search briefs..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#141418]/10 bg-white text-sm font-sans text-[#141418] placeholder:text-[#141418]/30 focus:outline-none focus:ring-2 focus:ring-[#6E879B]/30 focus:border-[#6E879B]"
              />
            </div>
          </div>

          {/* Category filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
              <button
                type="button"
                onClick={() => {
                  setActiveCategory(null);
                  setPage(1);
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-sans font-medium transition-colors ${
                  activeCategory === null
                    ? 'bg-[#6E879B] text-white'
                    : 'bg-white text-[#141418]/60 hover:text-[#141418] border border-[#141418]/10'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat);
                    setPage(1);
                  }}
                  className={`px-4 py-1.5 rounded-full text-sm font-sans font-medium transition-colors ${
                    activeCategory === cat
                      ? 'bg-[#6E879B] text-white'
                      : 'bg-white text-[#141418]/60 hover:text-[#141418] border border-[#141418]/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <BriefCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error state */}
          {!isLoading && error && (
            <div className="text-center py-20">
              <p className="text-[#8E6464] font-sans font-semibold text-lg mb-2">
                Unable to load briefs
              </p>
              <p className="text-[#141418]/60 font-sans text-sm mb-4">
                {error}
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-lg bg-[#6E879B] text-white text-sm font-sans font-medium hover:bg-[#5A7185] transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && filtered.length === 0 && (
            <div className="text-center py-20">
              <FileText className="w-8 h-8 text-[#141418]/20 mx-auto mb-4" />
              <p className="text-[#141418]/40 font-sans text-lg">
                {searchTerm || activeCategory
                  ? 'No briefs match your filters.'
                  : 'No intelligence briefs published yet.'}
              </p>
            </div>
          )}

          {/* Post grid */}
          {!isLoading && !error && paginated.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginated.map((post) => (
                <BriefCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 rounded-lg text-sm font-sans font-medium transition-colors ${
                    page === i + 1
                      ? 'bg-[#6E879B] text-white'
                      : 'bg-white text-[#141418]/60 hover:text-[#141418] border border-[#141418]/10'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
