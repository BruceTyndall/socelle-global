// ── BlogListPage — WO-CMS-04 ─────────────────────────────────────────
// Public blog listing: /blog
// Data: cms_posts where status='published', space='blog'
// Pearl Mineral V2 tokens only.

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Clock, ArrowRight } from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useCmsPosts } from '../../lib/cms';
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

function PostCard({ post }: { post: CmsPost }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
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
            {post.reading_time && (
              <>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {post.reading_time} min
                </span>
              </>
            )}
          </div>
          <ArrowRight className="w-4 h-4 text-[#6E879B] opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </Link>
  );
}

export default function BlogListPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { posts, isLoading, isLive } = useCmsPosts({
    spaceSlug: 'blog',
    status: 'published',
  });

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    posts.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats).sort();
  }, [posts]);

  // Filter by category
  const filtered = useMemo(() => {
    if (!activeCategory) return posts;
    return posts.filter((p) => p.category === activeCategory);
  }, [posts, activeCategory]);

  // Paginate
  const totalPages = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const paginated = filtered.slice(
    (page - 1) * POSTS_PER_PAGE,
    page * POSTS_PER_PAGE
  );

  return (
    <>
      <Helmet>
        <title>Blog | SOCELLE</title>
        <meta
          name="description"
          content="Industry intelligence, treatment insights, and market signals for beauty and medspa professionals."
        />
        <meta property="og:title" content="Blog | SOCELLE" />
        <meta
          property="og:description"
          content="Industry intelligence, treatment insights, and market signals for beauty and medspa professionals."
        />
      </Helmet>

      <MainNav />

      <main className="min-h-screen bg-[#F6F3EF] pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-[#141418] font-sans">
              Blog
            </h1>
            <p className="mt-3 text-[#141418]/60 font-sans text-lg max-w-xl mx-auto">
              Intelligence briefs, treatment insights, and market signals for
              beauty and medspa professionals.
            </p>
            {!isLive && posts.length === 0 && !isLoading && (
              <span className="inline-block mt-3 text-[10px] font-semibold bg-[#A97A4C]/10 text-[#A97A4C] px-2 py-0.5 rounded-full">
                DEMO
              </span>
            )}
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
                <div
                  key={i}
                  className="bg-white rounded-xl border border-[#141418]/5 overflow-hidden animate-pulse"
                >
                  <div className="aspect-[16/9] bg-[#141418]/5" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 bg-[#141418]/5 rounded w-1/4" />
                    <div className="h-5 bg-[#141418]/5 rounded w-3/4" />
                    <div className="h-3 bg-[#141418]/5 rounded w-full" />
                    <div className="h-3 bg-[#141418]/5 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-[#141418]/40 font-sans text-lg">
                {activeCategory
                  ? `No posts found in "${activeCategory}".`
                  : 'No blog posts published yet.'}
              </p>
            </div>
          )}

          {/* Post grid */}
          {!isLoading && paginated.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginated.map((post) => (
                <PostCard key={post.id} post={post} />
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
