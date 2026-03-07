// ── StoriesIndex — W15-05 ────────────────────────────────────────────
// Public editorial listing page: /stories
// Data label: LIVE — stories table (published only via RLS)

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Clock, ArrowRight, BookOpen } from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useStories } from '../../lib/editorial/useStories';
import { trackStoryClicked } from '../../lib/analytics/funnelEvents';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'Industry News', label: 'Industry' },
  { key: 'Ingredient Intel', label: 'Ingredients' },
  { key: 'Brand Watch', label: 'Brand Watch' },
  { key: 'Clinical Research', label: 'Clinical' },
  { key: 'Market Signals', label: 'Market' },
  { key: 'Practitioner Insights', label: 'Practitioner' },
  { key: 'Regulatory', label: 'Regulatory' },
  { key: 'Events', label: 'Events' },
];

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function StoriesIndex() {
  const [activeCategory, setActiveCategory] = useState('all');
  const { stories, featured, loading, isLive } = useStories({
    limit: 50,
    category: activeCategory === 'all' ? undefined : activeCategory,
  });

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>Stories — Intelligence Editorial | Socelle</title>
        <meta name="description" content="Curated editorial intelligence from the professional beauty and medical aesthetics industry. Expert analysis, trend reports, and market insights." />
        <meta property="og:title" content="Stories — Intelligence Editorial | Socelle" />
        <meta property="og:description" content="Curated editorial intelligence from the professional beauty and medical aesthetics industry." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://socelle.com/stories" />
        <meta property="og:image" content="https://socelle.com/og-image.svg" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://socelle.com/stories" />
        {/* W15-06: CollectionPage JSON-LD structured data */}
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Socelle Stories — Intelligence Editorial',
          description: 'Curated editorial intelligence from the professional beauty and medical aesthetics industry.',
          url: 'https://socelle.com/stories',
          publisher: { '@type': 'Organization', name: 'Socelle', url: 'https://socelle.com' },
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: stories.length,
            itemListElement: stories.slice(0, 10).map((s, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              url: `https://socelle.com/stories/${s.slug}`,
              name: s.title,
            })),
          },
        })}</script>
      </Helmet>
      <MainNav />

      {/* Hero */}
      <section className="relative bg-mn-dark pt-32 pb-16 lg:pb-20 overflow-hidden">
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-[0.08]"
          aria-hidden="true"
        >
          <source src="/videos/brand/foundation.mp4" type="video/mp4" />
        </video>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-eyebrow text-accent mb-4 block">Editorial Intelligence</span>
          <h1 className="text-section text-mn-bg mb-4">Stories</h1>
          <p className="text-mn-bg/60 max-w-2xl mx-auto text-lg">
            Expert analysis and curated intelligence from the professional beauty and medical aesthetics industry.
          </p>
          {!isLive && !loading && (
            <span className="inline-block mt-4 px-3 py-1 rounded-full bg-signal-warn/20 text-signal-warn text-xs font-mono">
              PREVIEW
            </span>
          )}
        </div>
      </section>

      {/* Featured story hero (if any) */}
      {featured.length > 0 && (
        <section className="bg-mn-bg py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link to={`/stories/${featured[0].slug}`} className="group block" onClick={() => trackStoryClicked(featured[0].id, featured[0].category)}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {featured[0].hero_image_url && (
                  <div className="rounded-card overflow-hidden aspect-[16/10]">
                    <img
                      src={featured[0].hero_image_url}
                      alt={featured[0].title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="eager"
                    />
                  </div>
                )}
                <div>
                  <span className="text-eyebrow text-accent mb-3 block">Featured</span>
                  <h2 className="text-subsection text-graphite mb-4 group-hover:text-accent transition-colors">
                    {featured[0].title}
                  </h2>
                  {featured[0].excerpt && (
                    <p className="text-graphite/60 mb-6 leading-relaxed">{featured[0].excerpt}</p>
                  )}
                  <div className="flex items-center gap-4 text-graphite/40 text-sm">
                    <span>{featured[0].author_name}</span>
                    <span>{formatDate(featured[0].published_at)}</span>
                    {featured[0].reading_time_minutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {featured[0].reading_time_minutes} min
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Category filters */}
      <section className="bg-mn-bg border-t border-graphite/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  activeCategory === cat.key
                    ? 'bg-graphite text-mn-bg'
                    : 'bg-graphite/5 text-graphite/60 hover:bg-graphite/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stories grid */}
      <section className="bg-mn-bg py-10 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-20">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-graphite/40 mt-4 text-sm">Loading stories...</p>
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-8 h-8 text-graphite/20 mx-auto mb-4" />
              <p className="text-graphite/40">No stories published yet. Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {stories.map((story) => (
                <Link
                  key={story.id}
                  to={`/stories/${story.slug}`}
                  onClick={() => trackStoryClicked(story.id, story.category)}
                  className="group bg-white rounded-card border border-graphite/5 overflow-hidden hover:shadow-panel transition-shadow"
                >
                  {story.hero_image_url && (
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={story.hero_image_url}
                        alt={story.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    {story.category && (
                      <span className="text-[10px] tracking-widest uppercase text-accent mb-2 block">
                        {story.category}
                      </span>
                    )}
                    <h3 className="text-graphite font-semibold text-base mb-2 group-hover:text-accent transition-colors line-clamp-2">
                      {story.title}
                    </h3>
                    {story.excerpt && (
                      <p className="text-graphite/50 text-sm leading-relaxed line-clamp-3 mb-4">
                        {story.excerpt}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-graphite/30 text-xs">
                      <span>{formatDate(story.published_at)}</span>
                      <span className="flex items-center gap-1 text-accent group-hover:translate-x-0.5 transition-transform">
                        Read <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
