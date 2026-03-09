// ── IntelligenceBriefDetail — V2-HUBS-14 ─────────────────────────────
// Single intelligence brief: /intelligence/briefs/:slug
// Data: cms_posts where space='intelligence', status='published'
// Pearl Mineral V2 tokens only.

import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Clock, Calendar, Tag, User } from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import {
  useIntelligenceBriefBySlug,
  useIntelligencePosts,
} from '../../lib/cms';
import type { CmsPost } from '../../lib/cms/types';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function estimateReadingTime(post: CmsPost): number {
  if (post.reading_time) return post.reading_time;
  const wordCount = (post.body ?? '').split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 250));
}

// ── Related Briefs ───────────────────────────────────────────────────

function RelatedBriefs({
  currentId,
  category,
}: {
  currentId: string;
  category: string | null;
}) {
  const { briefs } = useIntelligencePosts({
    status: 'published',
    limit: 20,
  });

  const related = useMemo(() => {
    return briefs
      .filter((p) => p.id !== currentId)
      .filter((p) => category && p.category === category)
      .slice(0, 3);
  }, [briefs, currentId, category]);

  if (related.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t border-[#141418]/10">
      <h2 className="text-xl font-bold text-[#141418] font-sans mb-6">
        Related Briefs
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {related.map((post: CmsPost) => (
          <Link
            key={post.id}
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

function BriefSkeleton() {
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

// ── Page ──────────────────────────────────────────────────────────────

export default function IntelligenceBriefDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { post, isLoading, isLive, error } = useIntelligenceBriefBySlug(
    slug ?? ''
  );

  const readTime = post ? estimateReadingTime(post) : 0;

  // Schema.org Article
  const schemaData = post
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.seo_description ?? post.excerpt ?? '',
        ...(post.hero_image ? { image: post.hero_image } : {}),
        author: {
          '@type': 'Organization',
          name: 'SOCELLE Intelligence',
        },
        publisher: {
          '@type': 'Organization',
          name: 'SOCELLE',
          url: 'https://socelle.com',
        },
        datePublished: post.published_at ?? post.created_at,
        dateModified: post.updated_at,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://socelle.com/intelligence/briefs/${post.slug}`,
        },
        ...(post.category ? { articleSection: post.category } : {}),
        ...(post.tags && post.tags.length > 0
          ? { keywords: post.tags.join(', ') }
          : {}),
      }
    : null;

  if (isLoading) {
    return (
      <>
        <MainNav />
        <main className="min-h-screen bg-[#F6F3EF]">
          <BriefSkeleton />
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
              Unable to load brief
            </p>
            <p className="text-[#141418]/60 font-sans text-sm mb-4">
              {error}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-[#6E879B] text-white text-sm font-sans font-medium hover:bg-[#5A7185] transition-colors mb-4"
            >
              Retry
            </button>
            <br />
            <Link
              to="/intelligence/briefs"
              className="inline-flex items-center gap-2 text-[#6E879B] font-sans text-sm font-medium hover:text-[#5A7185] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Briefs
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
              Brief not found
            </p>
            <Link
              to="/intelligence/briefs"
              className="inline-flex items-center gap-2 text-[#6E879B] font-sans text-sm font-medium hover:text-[#5A7185] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Briefs
            </Link>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

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
        {(post.seo_description ?? post.excerpt) && (
          <meta
            property="og:description"
            content={post.seo_description ?? post.excerpt ?? ''}
          />
        )}
        {post.seo_og_image && (
          <meta property="og:image" content={post.seo_og_image} />
        )}
        <meta property="og:type" content="article" />
        {post.published_at && (
          <meta
            property="article:published_time"
            content={post.published_at}
          />
        )}
        {schemaData && (
          <script type="application/ld+json">
            {JSON.stringify(schemaData)}
          </script>
        )}
      </Helmet>

      <MainNav />

      <main className="min-h-screen bg-[#F6F3EF] pt-24 pb-16">
        <article className="max-w-3xl mx-auto px-6">
          {/* Back link */}
          <Link
            to="/intelligence/briefs"
            className="inline-flex items-center gap-2 text-[#6E879B] font-sans text-sm font-medium hover:text-[#5A7185] transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Briefs
          </Link>

          {/* Category */}
          {post.category && (
            <span className="block text-xs font-semibold text-[#6E879B] font-sans uppercase tracking-wide mb-2">
              {post.category}
            </span>
          )}

          {/* DEMO badge */}
          {!isLive && (
            <span className="inline-block mb-3 text-[10px] font-semibold bg-[#A97A4C]/10 text-[#A97A4C] px-2 py-0.5 rounded-full">
              DEMO
            </span>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-[#141418] font-sans leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="mt-4 text-[#141418]/60 font-sans text-lg leading-relaxed border-l-2 border-[#6E879B]/30 pl-4">
              {post.excerpt}
            </p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-[#141418]/50 font-sans pb-8 border-b border-[#141418]/10">
            {post.author_id && (
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                SOCELLE Intelligence
              </span>
            )}
            {post.published_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(post.published_at)}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {readTime} min read
            </span>
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

          {/* Body — render HTML content or plain text paragraphs */}
          <div className="mt-10">
            {post.body && post.body.trim().startsWith('<') ? (
              <div
                className="prose max-w-none text-[#141418]/80 font-sans text-base md:text-lg leading-relaxed [&_h2]:text-[#141418] [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-[#141418] [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:mb-5 [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-2 [&_a]:text-[#6E879B] [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-[#6E879B]/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[#141418]/50"
                dangerouslySetInnerHTML={{ __html: post.body }}
              />
            ) : (
              <div className="space-y-5">
                {(post.body ?? '')
                  .split('\n')
                  .filter((p) => p.trim())
                  .map((p, i) => (
                    <p
                      key={i}
                      className="text-[#141418]/80 font-sans text-base md:text-lg leading-relaxed"
                    >
                      {p}
                    </p>
                  ))}
              </div>
            )}
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

          {/* Related briefs */}
          <RelatedBriefs currentId={post.id} category={post.category} />
        </article>
      </main>

      <SiteFooter />
    </>
  );
}
