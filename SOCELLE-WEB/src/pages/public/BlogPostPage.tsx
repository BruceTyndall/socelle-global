// ── BlogPostPage — WO-CMS-04 ─────────────────────────────────────────
// Single blog post: /blog/:slug
// Data: cms_posts where status='published'
// Pearl Mineral V2 tokens only.

import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Clock, Calendar, Tag } from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useCmsPostBySlug, useCmsPosts } from '../../lib/cms';
import type { CmsPost } from '../../lib/cms/types';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function RelatedPosts({ currentId, category, tags }: { currentId: string; category: string | null; tags: string[] | null }) {
  const { posts } = useCmsPosts({
    spaceSlug: 'blog',
    status: 'published',
    limit: 20,
  });

  const related = useMemo(() => {
    return posts
      .filter((p) => p.id !== currentId)
      .filter((p) => {
        if (category && p.category === category) return true;
        if (tags && p.tags) {
          return tags.some((t) => p.tags?.includes(t));
        }
        return false;
      })
      .slice(0, 3);
  }, [posts, currentId, category, tags]);

  if (related.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t border-[#141418]/10">
      <h2 className="text-xl font-bold text-[#141418] font-sans mb-6">
        Related Posts
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {related.map((post: CmsPost) => (
          <Link
            key={post.id}
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
            <div className="p-4">
              {post.category && (
                <span className="text-xs font-semibold text-[#6E879B] font-sans uppercase tracking-wide">
                  {post.category}
                </span>
              )}
              <h3 className="mt-1 text-sm font-bold text-[#141418] font-sans leading-snug group-hover:text-[#6E879B] transition-colors">
                {post.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────

function PostSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-6 pt-24 pb-16 animate-pulse">
      <div className="h-4 bg-[#141418]/5 rounded w-24 mb-8" />
      <div className="h-8 bg-[#141418]/5 rounded w-3/4 mb-4" />
      <div className="h-4 bg-[#141418]/5 rounded w-1/3 mb-8" />
      <div className="aspect-[16/9] bg-[#141418]/5 rounded-xl mb-8" />
      <div className="space-y-4">
        <div className="h-4 bg-[#141418]/5 rounded w-full" />
        <div className="h-4 bg-[#141418]/5 rounded w-full" />
        <div className="h-4 bg-[#141418]/5 rounded w-3/4" />
        <div className="h-4 bg-[#141418]/5 rounded w-full" />
        <div className="h-4 bg-[#141418]/5 rounded w-5/6" />
      </div>
    </div>
  );
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { post, isLoading, error } = useCmsPostBySlug(slug ?? '', 'blog');

  if (isLoading) {
    return (
      <>
        <MainNav />
        <main className="min-h-screen bg-[#F6F3EF]">
          <PostSkeleton />
        </main>
        <SiteFooter />
      </>
    );
  }

  if (error) {
    return (
      <>
        <MainNav />
        <main className="min-h-screen bg-[#F6F3EF] flex items-center justify-center">
          <div className="max-w-md text-center px-6">
            <p className="text-[#8E6464] font-sans font-semibold text-lg mb-2">
              Unable to load post
            </p>
            <p className="text-[#141418]/60 font-sans text-sm">{error}</p>
            <Link
              to="/blog"
              className="mt-6 inline-flex items-center gap-2 text-[#6E879B] font-sans text-sm font-medium hover:text-[#5A7185] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  if (!post) {
    return (
      <>
        <MainNav />
        <main className="min-h-screen bg-[#F6F3EF] flex items-center justify-center">
          <div className="max-w-md text-center px-6">
            <p className="text-[#141418]/40 font-sans text-lg mb-4">
              Post not found
            </p>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-[#6E879B] font-sans text-sm font-medium hover:text-[#5A7185] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const paragraphs = post.body?.split('\n').filter((p) => p.trim()) ?? [];

  return (
    <>
      <Helmet>
        <title>{post.seo_title ?? post.title} | SOCELLE</title>
        {post.seo_description && (
          <meta name="description" content={post.seo_description} />
        )}
        {post.seo_canonical && (
          <link rel="canonical" href={post.seo_canonical} />
        )}
        <meta
          property="og:title"
          content={post.seo_title ?? post.title}
        />
        {post.seo_description && (
          <meta property="og:description" content={post.seo_description} />
        )}
        {post.seo_og_image && (
          <meta property="og:image" content={post.seo_og_image} />
        )}
        <meta property="og:type" content="article" />
      </Helmet>

      <MainNav />

      <main className="min-h-screen bg-[#F6F3EF] pt-24 pb-16">
        <article className="max-w-3xl mx-auto px-6">
          {/* Back link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-[#6E879B] font-sans text-sm font-medium hover:text-[#5A7185] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {/* Category */}
          {post.category && (
            <span className="block text-xs font-semibold text-[#6E879B] font-sans uppercase tracking-wide mb-2">
              {post.category}
            </span>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-[#141418] font-sans leading-tight">
            {post.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-[#141418]/50 font-sans">
            {post.published_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(post.published_at)}
              </span>
            )}
            {post.reading_time && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.reading_time} min read
              </span>
            )}
          </div>

          {/* Hero image */}
          {post.hero_image && (
            <div className="mt-8 rounded-xl overflow-hidden">
              <img
                src={post.hero_image}
                alt={post.title}
                className="w-full object-cover"
              />
            </div>
          )}

          {/* Body */}
          <div className="mt-10 space-y-5">
            {paragraphs.map((p, i) => (
              <p
                key={i}
                className="text-[#141418]/80 font-sans text-base md:text-lg leading-relaxed"
              >
                {p}
              </p>
            ))}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-[#141418]/10 flex flex-wrap items-center gap-2">
              <Tag className="w-4 h-4 text-[#141418]/40" />
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-sans font-medium bg-[#E8EDF1] text-[#6E879B]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Related posts */}
          <RelatedPosts
            currentId={post.id}
            category={post.category}
            tags={post.tags}
          />
        </article>
      </main>

      <SiteFooter />
    </>
  );
}
