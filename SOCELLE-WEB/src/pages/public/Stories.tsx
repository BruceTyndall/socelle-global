// ── Stories (CMS) — V2-HUBS-14 ───────────────────────────────────────
// Public case studies / success stories: /case-studies
// Data: cms_posts where space='stories' (falls back to DEMO stories)
// Pearl Mineral V2 tokens only.

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Search, TrendingUp, Sparkles } from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useCmsPosts } from '../../lib/cms';
import type { CmsPost } from '../../lib/cms/types';

// ── DEMO Stories ─────────────────────────────────────────────────────

interface StoryCard {
  id: string;
  slug: string;
  title: string;
  companyName: string;
  heroStat: string;
  heroStatLabel: string;
  excerpt: string;
  category: string;
  hero_image: string | null;
}

const DEMO_STORIES: StoryCard[] = [
  {
    id: 'demo-story-1',
    slug: 'luminous-medspa-signal-driven-menu',
    title: 'How Luminous MedSpa Used Signal Data to Redesign Their Service Menu',
    companyName: 'Luminous MedSpa',
    heroStat: '+34%',
    heroStatLabel: 'Revenue per treatment room',
    excerpt:
      'A 6-location medspa group in the Southeast used SOCELLE Intelligence signals to identify underperforming treatments and replace them with high-demand services. Within 90 days, average revenue per treatment room increased by 34% across all locations.',
    category: 'MedSpa',
    hero_image: null,
  },
  {
    id: 'demo-story-2',
    slug: 'bella-vita-salon-competitive-benchmarking',
    title: 'Bella Vita Salon Group Closes a Category Gap Worth $180K',
    companyName: 'Bella Vita Salon Group',
    heroStat: '$180K',
    heroStatLabel: 'Annual revenue captured',
    excerpt:
      'A premium salon group with 3 locations in Dallas used competitive benchmarking signals to discover they were missing an entire treatment category that neighboring competitors offered. Adding scalp therapy services filled the gap and generated $180K in new annual revenue.',
    category: 'Salon',
    hero_image: null,
  },
  {
    id: 'demo-story-3',
    slug: 'zen-day-spa-local-market-intelligence',
    title: 'Zen Day Spa Outperforms Market with Local Intelligence',
    companyName: 'Zen Day Spa',
    heroStat: '2.1x',
    heroStatLabel: 'Growth vs local market average',
    excerpt:
      'A single-location day spa in Portland used SOCELLE local market intelligence to time their seasonal menu changes to match emerging demand patterns. By launching spring facial treatments 6 weeks before competitors, they achieved 2.1x the local market growth rate.',
    category: 'Day Spa',
    hero_image: null,
  },
];

// ── Skeleton ──────────────────────────────────────────────────────────

function StoryCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-[#141418]/5 overflow-hidden animate-pulse">
      <div className="p-6 space-y-4">
        <div className="h-3 bg-[#141418]/5 rounded w-1/4" />
        <div className="h-6 bg-[#141418]/5 rounded w-3/4" />
        <div className="flex gap-3 items-baseline">
          <div className="h-10 bg-[#141418]/5 rounded w-20" />
          <div className="h-3 bg-[#141418]/5 rounded w-32" />
        </div>
        <div className="h-3 bg-[#141418]/5 rounded w-full" />
        <div className="h-3 bg-[#141418]/5 rounded w-2/3" />
      </div>
    </div>
  );
}

// ── Story Card Component ─────────────────────────────────────────────

function StoryCardDisplay({ story }: { story: StoryCard }) {
  return (
    <div className="group bg-white rounded-xl border border-[#141418]/5 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {story.hero_image && (
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={story.hero_image}
            alt={story.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-[#6E879B] font-sans uppercase tracking-wide">
            {story.category}
          </span>
          <span className="text-[10px] font-semibold bg-[#A97A4C]/10 text-[#A97A4C] px-2 py-0.5 rounded-full">
            DEMO
          </span>
        </div>
        <h3 className="text-lg font-bold text-[#141418] font-sans leading-snug mb-3 group-hover:text-[#6E879B] transition-colors">
          {story.title}
        </h3>

        {/* Hero stat */}
        <div className="flex items-baseline gap-2 mb-3 p-3 bg-[#5F8A72]/5 rounded-lg">
          <TrendingUp className="w-4 h-4 text-[#5F8A72] shrink-0 self-center" />
          <span className="text-2xl font-bold text-[#5F8A72] font-sans">
            {story.heroStat}
          </span>
          <span className="text-xs text-[#141418]/50 font-sans">
            {story.heroStatLabel}
          </span>
        </div>

        <p className="text-sm text-[#141418]/60 font-sans line-clamp-3 mb-4">
          {story.excerpt}
        </p>

        <span className="flex items-center gap-1 text-sm text-[#6E879B] font-sans font-medium">
          Read case study
          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </span>
      </div>
    </div>
  );
}

// ── Convert CmsPost to StoryCard ─────────────────────────────────────

function cmsPostToStoryCard(post: CmsPost): StoryCard {
  const metadata = post.metadata as Record<string, unknown> | null;
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    companyName:
      typeof metadata?.company_name === 'string'
        ? metadata.company_name
        : '',
    heroStat:
      typeof metadata?.hero_stat === 'string' ? metadata.hero_stat : '',
    heroStatLabel:
      typeof metadata?.hero_stat_label === 'string'
        ? metadata.hero_stat_label
        : '',
    excerpt: post.excerpt ?? '',
    category: post.category ?? 'Case Study',
    hero_image: post.hero_image,
  };
}

// ── Page ──────────────────────────────────────────────────────────────

export default function Stories() {
  const [searchTerm, setSearchTerm] = useState('');

  // Try loading CMS stories content
  const { posts, isLoading, isLive } = useCmsPosts({
    spaceSlug: 'stories',
    status: 'published',
  });

  // Use CMS data if available, otherwise DEMO
  const stories: StoryCard[] = useMemo(() => {
    if (isLive && posts.length > 0) {
      return posts.map(cmsPostToStoryCard);
    }
    return DEMO_STORIES;
  }, [posts, isLive]);

  const isDemo = !isLive || posts.length === 0;

  // Filter by search
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return stories;
    const term = searchTerm.toLowerCase();
    return stories.filter(
      (s) =>
        s.title.toLowerCase().includes(term) ||
        s.companyName.toLowerCase().includes(term) ||
        s.excerpt.toLowerCase().includes(term) ||
        s.category.toLowerCase().includes(term)
    );
  }, [stories, searchTerm]);

  return (
    <>
      <Helmet>
        <title>Case Studies | SOCELLE</title>
        <meta
          name="description"
          content="See how spa owners, medspa operators, and salon groups use SOCELLE Intelligence to grow revenue and make better business decisions."
        />
        <meta property="og:title" content="Case Studies | SOCELLE" />
        <meta
          property="og:description"
          content="See how spa owners, medspa operators, and salon groups use SOCELLE Intelligence to grow revenue and make better business decisions."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://socelle.com/case-studies" />
        <meta property="og:image" content="https://socelle.com/og-image.svg" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://socelle.com/case-studies" />
      </Helmet>

      <MainNav />

      <main className="min-h-screen bg-[#F6F3EF] pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-[#141418] font-sans">
              Case Studies
            </h1>
            <p className="mt-3 text-[#141418]/60 font-sans text-lg max-w-xl mx-auto">
              How beauty and medspa professionals use intelligence signals to
              drive measurable results.
            </p>
            {isDemo && !isLoading && (
              <span className="inline-block mt-3 text-[10px] font-semibold bg-[#A97A4C]/10 text-[#A97A4C] px-2 py-0.5 rounded-full">
                DEMO
              </span>
            )}
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto mb-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#141418]/30" />
              <input
                type="text"
                placeholder="Search case studies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#141418]/10 bg-white text-sm font-sans text-[#141418] placeholder:text-[#141418]/30 focus:outline-none focus:ring-2 focus:ring-[#6E879B]/30 focus:border-[#6E879B]"
              />
            </div>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <StoryCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-20">
              <Sparkles className="w-8 h-8 text-[#141418]/20 mx-auto mb-4" />
              <p className="text-[#141418]/40 font-sans text-lg">
                {searchTerm
                  ? 'No case studies match your search.'
                  : 'No case studies published yet.'}
              </p>
            </div>
          )}

          {/* Stories grid */}
          {!isLoading && filtered.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((story) => (
                <Link
                  key={story.id}
                  to={
                    story.id.startsWith('demo-')
                      ? '#'
                      : `/case-studies/${story.slug}`
                  }
                  className={
                    story.id.startsWith('demo-')
                      ? 'cursor-default'
                      : undefined
                  }
                >
                  <StoryCardDisplay story={story} />
                </Link>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 text-center p-8 bg-white rounded-xl border border-[#141418]/5">
            <TrendingUp className="w-8 h-8 text-[#6E879B] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#141418] font-sans mb-2">
              Ready to write your own success story?
            </h3>
            <p className="text-[#141418]/60 font-sans text-sm mb-4 max-w-md mx-auto">
              Join operators who use intelligence signals to make better
              business decisions and grow revenue.
            </p>
            <Link
              to="/request-access"
              className="inline-block px-6 py-2.5 rounded-lg bg-[#6E879B] text-white text-sm font-sans font-medium hover:bg-[#5A7185] transition-colors"
            >
              Get Intelligence Access
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
