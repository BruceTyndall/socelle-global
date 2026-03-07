// ── StoryDetail — W15-05 ─────────────────────────────────────────────
// Public single story page: /stories/:slug
// Data label: LIVE — stories table (published only via RLS)

import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Clock, Calendar, User } from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useStoryDetail } from '../../lib/editorial/useStories';
import { trackStoryViewed } from '../../lib/analytics/funnelEvents';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function StoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { story, loading, isLive, notFound } = useStoryDetail(slug);

  // W15-08: Track story_viewed when story loads
  useEffect(() => {
    if (!loading && story) {
      trackStoryViewed(story.id, story.slug, story.category);
    }
  }, [loading, story]);

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>{story?.seo_title ?? story?.title ?? 'Story'} | Socelle</title>
        {story?.seo_description && (
          <meta name="description" content={story.seo_description} />
        )}
        {story && (
          <>
            <meta property="og:title" content={story.seo_title ?? story.title} />
            <meta property="og:description" content={story.seo_description ?? story.excerpt ?? ''} />
            {story.hero_image_url && <meta property="og:image" content={story.hero_image_url} />}
            <meta property="og:type" content="article" />
            {story.published_at && <meta property="article:published_time" content={story.published_at} />}
            <meta property="og:url" content={`https://socelle.com/stories/${story.slug}`} />
            <meta name="robots" content="index, follow" />
            <link rel="canonical" href={`https://socelle.com/stories/${story.slug}`} />
            {/* W15-06: Article JSON-LD structured data */}
            <script type="application/ld+json">{JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: story.title,
              description: story.seo_description ?? story.excerpt ?? '',
              ...(story.hero_image_url ? { image: story.hero_image_url } : {}),
              author: { '@type': 'Organization', name: story.author_name || 'Socelle Editorial' },
              publisher: { '@type': 'Organization', name: 'Socelle', url: 'https://socelle.com' },
              datePublished: story.published_at ?? story.created_at,
              dateModified: story.updated_at,
              mainEntityOfPage: { '@type': 'WebPage', '@id': `https://socelle.com/stories/${story.slug}` },
              ...(story.category ? { articleSection: story.category } : {}),
              ...(story.tags.length > 0 ? { keywords: story.tags.join(', ') } : {}),
            })}</script>
          </>
        )}
      </Helmet>
      <MainNav />

      {loading && (
        <div className="pt-32 pb-20 text-center">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-graphite/40 mt-4 text-sm">Loading story...</p>
        </div>
      )}

      {!loading && notFound && (
        <div className="pt-32 pb-20 text-center">
          <h1 className="text-subsection text-graphite mb-4">Story not found</h1>
          <p className="text-graphite/50 mb-8">This story may have been removed or is not yet published.</p>
          <Link
            to="/stories"
            className="inline-flex items-center gap-2 text-accent hover:text-accent-hover text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Stories
          </Link>
        </div>
      )}

      {!loading && story && (
        <>
          {/* Hero image */}
          {story.hero_image_url && (
            <section className="pt-24">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="rounded-card overflow-hidden aspect-[21/9]">
                  <img
                    src={story.hero_image_url}
                    alt={story.title}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
              </div>
            </section>
          )}

          {/* Article header */}
          <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 lg:pt-14 pb-16 lg:pb-24">
            {/* Back link */}
            <Link
              to="/stories"
              className="inline-flex items-center gap-1.5 text-graphite/40 hover:text-accent text-sm mb-8 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> All Stories
            </Link>

            {/* Category + meta */}
            {story.category && (
              <span className="text-[10px] tracking-widest uppercase text-accent mb-4 block">
                {story.category}
              </span>
            )}

            <h1 className="text-section text-graphite mb-6">{story.title}</h1>

            {story.excerpt && (
              <p className="text-graphite/60 text-lg leading-relaxed mb-8 border-l-2 border-accent/30 pl-4">
                {story.excerpt}
              </p>
            )}

            {/* Author + date + read time */}
            <div className="flex flex-wrap items-center gap-4 text-graphite/40 text-sm mb-10 pb-8 border-b border-graphite/10">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> {story.author_name}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> {formatDate(story.published_at)}
              </span>
              {story.reading_time_minutes && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {story.reading_time_minutes} min read
                </span>
              )}
              {!isLive && (
                <span className="px-2 py-0.5 rounded-full bg-signal-warn/20 text-signal-warn text-xs font-mono">
                  PREVIEW
                </span>
              )}
            </div>

            {/* Body */}
            {story.body && (
              <div className="prose prose-graphite max-w-none text-graphite/80 leading-relaxed [&_h2]:text-graphite [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-graphite [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mt-8 [&_h3]:mb-3 [&_p]:mb-5 [&_ul]:mb-5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-2 [&_a]:text-accent [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-accent/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-graphite/50">
                {/* Render body as plain text with paragraph breaks */}
                {story.body.split('\n\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            )}

            {/* Tags */}
            {story.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-graphite/10">
                <div className="flex flex-wrap gap-2">
                  {story.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-graphite/5 text-graphite/50 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>
        </>
      )}

      <SiteFooter />
    </div>
  );
}
