import { useState } from 'react';
import { Link } from 'react-router';
import { Clock, ArrowRight, ArrowUpRight } from 'lucide-react';
import { articles, ARTICLE_CATEGORIES, type Article } from '../data/articles';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { NewsTicker } from '../components/modules/NewsTicker';
import { CTASection } from '../components/modules/CTASection';

/*
 * SUPABASE INTEGRATION — ArticleFeed.tsx
 * ──────────────────────────────────────────────────────────────
 *
 * DATA FETCHING:
 *   Replace the static `articles` import with a Supabase query.
 *   Preferred approach: React Router loader (see routes.ts notes).
 *
 *   // Option A — React Router loader (best for SSR/streaming)
 *   export async function feedLoader() {
 *     const { data: articles } = await supabase
 *       .from('articles')
 *       .select('slug, title, subtitle, category, tag, image_url, published_at, read_time, excerpt, signal_label, signal_value, is_featured, author:authors(name, role, avatar_url)')
 *       .not('published_at', 'is', null)
 *       .lte('published_at', new Date().toISOString())
 *       .order('published_at', { ascending: false })
 *       .limit(20);
 *     const { data: categories } = await supabase
 *       .from('article_categories').select('*').order('sort_order');
 *     return { articles: (articles || []).map(mapArticle), categories };
 *   }
 *
 *   // Option B — useEffect (simpler, client-only)
 *   const [articles, setArticles] = useState<Article[]>([]);
 *   const [loading, setLoading] = useState(true);
 *   useEffect(() => {
 *     supabase.from('articles').select('...').then(({ data }) => {
 *       setArticles((data || []).map(mapArticle));
 *       setLoading(false);
 *     });
 *   }, []);
 *
 * PAGINATION:
 *   Add cursor-based pagination with a "Load more" button:
 *   const [cursor, setCursor] = useState<string | null>(null);
 *   // On "Load more":
 *   const { data: more } = await supabase.from('articles')
 *     .select('...')
 *     .lt('published_at', cursor)
 *     .limit(12);
 *   setArticles(prev => [...prev, ...more.map(mapArticle)]);
 *   setCursor(more[more.length - 1]?.published_at);
 *
 * CATEGORY FILTER:
 *   Currently client-side filtering. Keep it client-side for small
 *   datasets (<100 articles). For larger sets, add .eq('category', cat)
 *   to the Supabase query and refetch on category change.
 *
 * TICKER REALTIME:
 *   The NewsTicker could subscribe to Supabase Realtime to show
 *   new articles as they're published. See articles.ts notes.
 *
 * LOADING STATES:
 *   Add a skeleton grid while data loads:
 *   {loading ? <ArticleGridSkeleton /> : <ArticleGrid articles={filtered} />}
 *
 * NEWSLETTER SIDEBAR:
 *   The "Weekly Intelligence Brief" subscribe button should POST
 *   to a Supabase Edge Function or insert into a `newsletter_subscribers`
 *   table. See EmailCapture.tsx notes for the shared handler.
 * ──────────────────────────────────────────────────────────────
 */

const TAG_COLORS: Record<string, string> = {
  'Market Signal': 'bg-[#5F8A72]/15 text-[#5F8A72]',
  'Brand Intel': 'bg-[#3F5465]/15 text-[#8FAEC4]',
  'Clinical Data': 'bg-amber-500/10 text-amber-600',
  'Regulatory': 'bg-red-500/10 text-red-500',
  'Event': 'bg-cyan-500/10 text-cyan-600',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

function CategoryPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm transition-all cursor-pointer whitespace-nowrap ${
        active
          ? 'bg-[#1F2428] text-[#F7F5F2]'
          : 'bg-[#F3F0EB] text-[#141418]/60 hover:text-[#141418] hover:bg-[#EDE9E3]'
      }`}
    >
      {label}
    </button>
  );
}

function FeaturedHero({ article }: { article: Article }) {
  return (
    <Link to={`/intelligence/feed/${article.slug}`} className="group block">
      <div className="relative rounded-2xl overflow-hidden aspect-[21/9] lg:aspect-[21/8]">
        <ImageWithFallback
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F2428] via-[#1F2428]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1F2428]/60 via-transparent to-transparent" />

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
          <div className="max-w-3xl">
            {/* Meta */}
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-[10px] tracking-widest uppercase px-2.5 py-0.5 rounded-full ${TAG_COLORS[article.category] || 'bg-white/10 text-white/70'}`}>
                {article.category}
              </span>
              <span className="text-[#F7F5F2]/40 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
                {timeAgo(article.publishedAt)}
              </span>
              <span className="text-[#F7F5F2]/40 text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {article.readTime} min read
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-[#F7F5F2] text-2xl lg:text-4xl xl:text-5xl mb-3 max-w-2xl group-hover:text-white transition-colors">
              {article.title}
            </h2>
            <p className="text-[#F7F5F2]/60 text-sm lg:text-base max-w-xl mb-4 hidden sm:block">
              {article.subtitle}
            </p>

            {/* Author + signal */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {article.author.avatar && (
                  <ImageWithFallback
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-[#1F2428]"
                  />
                )}
                <div>
                  <span className="text-[#F7F5F2]/80 text-sm">{article.author.name}</span>
                  <span className="text-[#F7F5F2]/30 text-xs block">{article.author.role}</span>
                </div>
              </div>

              {article.relatedSignal && (
                <div className="hidden sm:flex items-center gap-2 glass-panel rounded-xl px-4 py-2">
                  <span className="text-[#5F8A72] text-sm" style={{ fontFamily: 'var(--font-mono)' }}>
                    {article.relatedSignal.value}
                  </span>
                  <span className="text-[#F7F5F2]/40 text-xs">{article.relatedSignal.label}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ArticleCard({ article, variant = 'default' }: { article: Article; variant?: 'default' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <Link to={`/intelligence/feed/${article.slug}`} className="group flex gap-4 py-4 border-b border-[#141418]/5 last:border-0">
        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
          <ImageWithFallback
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-full ${TAG_COLORS[article.category] || 'bg-gray-100 text-gray-500'}`}>
              {article.category}
            </span>
            <span className="text-[#141418]/30 text-[11px]" style={{ fontFamily: 'var(--font-mono)' }}>
              {timeAgo(article.publishedAt)}
            </span>
          </div>
          <h4 className="text-[#141418] text-sm line-clamp-2 group-hover:text-[#3F5465] transition-colors">
            {article.title}
          </h4>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/intelligence/feed/${article.slug}`} className="group block">
      <div className="card-mineral overflow-hidden">
        {/* Image */}
        <div className="aspect-[16/10] relative overflow-hidden">
          <ImageWithFallback
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1F2428]/60 via-transparent to-transparent" />

          {/* Category badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className={`text-[10px] tracking-widest uppercase px-2.5 py-0.5 rounded-full ${TAG_COLORS[article.category] || 'bg-white/10 text-white/70'}`}>
              {article.category}
            </span>
          </div>

          {/* Signal overlay */}
          {article.relatedSignal && (
            <div className="absolute bottom-4 right-4 z-10">
              <div className="glass-panel rounded-lg px-3 py-1.5">
                <span className="text-[#5F8A72] text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
                  {article.relatedSignal.value}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[#141418]/30 text-[11px]" style={{ fontFamily: 'var(--font-mono)' }}>
              {timeAgo(article.publishedAt)}
            </span>
            <span className="text-[#141418]/20">·</span>
            <span className="text-[#141418]/30 text-[11px] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.readTime} min
            </span>
          </div>
          <h3 className="text-[#141418] text-lg mb-2 line-clamp-2 group-hover:text-[#3F5465] transition-colors">
            {article.title}
          </h3>
          <p className="text-[#141418]/50 text-sm line-clamp-2 mb-4">
            {article.subtitle}
          </p>

          {/* Author */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {article.author.avatar ? (
                <ImageWithFallback
                  src={article.author.avatar}
                  alt={article.author.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#3F5465]/10 flex items-center justify-center text-[10px] text-[#3F5465]">S</div>
              )}
              <span className="text-[#141418]/50 text-xs">{article.author.name}</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#141418]/20 group-hover:text-[#3F5465] transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ArticleFeed() {
  const [activeCategory, setActiveCategory] = useState('All');

  const featured = articles.find((a) => a.isFeatured)!;
  const filtered = articles
    .filter((a) => !a.isFeatured)
    .filter((a) => activeCategory === 'All' || a.category === activeCategory);

  return (
    <>
      {/* Spacer for fixed nav */}
      <div className="h-24" />

      {/* Page header */}
      <section className="bg-[#FAF9F7] pt-8 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="eyebrow text-[#141418]/40 mb-3 block">Intelligence Wire</span>
              <h1 className="text-[#141418] text-3xl lg:text-5xl">The Feed</h1>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5F8A72] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5F8A72]" />
                </span>
                <span className="text-[#5F8A72] text-[11px] tracking-widest uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
                  Live
                </span>
              </span>
              <span className="text-[#141418]/20 text-xs">|</span>
              <span className="text-[#141418]/40 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
                {articles.length} stories
              </span>
            </div>
          </div>

          {/* Featured hero */}
          <FeaturedHero article={featured} />
        </div>
      </section>

      {/* Live ticker */}
      <NewsTicker
        items={articles.slice(0, 6).map((a) => ({
          tag: a.category,
          headline: a.title,
          timestamp: timeAgo(a.publishedAt),
        }))}
        speed={35}
      />

      {/* Feed grid */}
      <section className="bg-[#FAF9F7] py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category filter */}
          <div className="flex gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
            {ARTICLE_CATEGORIES.map((cat) => (
              <CategoryPill
                key={cat}
                label={cat}
                active={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
              />
            ))}
          </div>

          <div className="grid grid-cols-12 gap-8">
            {/* Main grid */}
            <div className="col-span-12 lg:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filtered.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-[#141418]/40 text-sm">No stories in this category yet.</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="col-span-12 lg:col-span-4">
              {/* Trending signals */}
              <div className="card-mineral-inset rounded-2xl p-6 mb-6">
                <span className="eyebrow text-[#141418]/40 mb-4 block">Trending Signals</span>
                <div className="space-y-3">
                  {articles.filter((a) => a.relatedSignal).slice(0, 5).map((a) => (
                    <Link
                      key={a.slug}
                      to={`/intelligence/feed/${a.slug}`}
                      className="flex items-center justify-between py-2 group"
                    >
                      <span className="text-[#141418]/70 text-sm group-hover:text-[#141418] transition-colors truncate mr-3">
                        {a.relatedSignal!.label}
                      </span>
                      <span className="text-[#5F8A72] text-sm shrink-0" style={{ fontFamily: 'var(--font-mono)' }}>
                        {a.relatedSignal!.value}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Latest stories compact list */}
              <div className="mb-6">
                <span className="eyebrow text-[#141418]/40 mb-4 block">Latest</span>
                {articles.slice(0, 5).map((a) => (
                  <ArticleCard key={a.slug} article={a} variant="compact" />
                ))}
              </div>

              {/* Newsletter signup */}
              <div
                className="rounded-2xl p-6 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(155deg, #1F2428, #15191D)',
                }}
              >
                <div className="relative z-10">
                  <span className="eyebrow text-[#F7F5F2]/40 mb-3 block">Stay Current</span>
                  <h4 className="text-[#F7F5F2] text-lg mb-2">Weekly Intelligence Brief</h4>
                  <p className="text-[#F7F5F2]/40 text-sm mb-4">
                    Market signals and clinical data — one email, every Friday.
                  </p>
                  <Link
                    to="#"
                    className="btn-liquid-glass btn-liquid-sm w-full text-center flex items-center justify-center gap-2"
                  >
                    Subscribe <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <CTASection
        eyebrow="Full Access"
        headline="Read the Market Before It Reads You."
        subtitle="Unlimited signal access, threshold alerts, and the editorial intelligence that 18,423 practitioners depend on."
        primaryCTA={{ label: 'Request Access', href: '#' }}
      />
    </>
  );
}