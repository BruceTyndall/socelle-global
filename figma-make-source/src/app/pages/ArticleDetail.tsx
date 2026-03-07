import { useParams, Link, Navigate } from 'react-router';
import { ArrowLeft, Clock, Share2, Bookmark, ArrowUpRight, TrendingUp } from 'lucide-react';
import { getArticleBySlug, getRelatedArticles, type Article } from '../data/articles';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { EmailCapture } from '../components/modules/EmailCapture';

/*
 * SUPABASE INTEGRATION — ArticleDetail.tsx
 * ──────────────────────────────────────────────────────────────
 *
 * DATA FETCHING:
 *   Replace getArticleBySlug/getRelatedArticles with Supabase queries.
 *   Best approach: React Router loader so the page never renders empty.
 *
 *   // routes.ts:
 *   {
 *     path: 'intelligence/feed/:slug',
 *     Component: ArticleDetail,
 *     loader: async ({ params }) => {
 *       const { data: article } = await supabase
 *         .from('articles')
 *         .select('*, author:authors(*)')
 *         .eq('slug', params.slug)
 *         .not('published_at', 'is', null)
 *         .single();
 *       if (!article) throw new Response('Not Found', { status: 404 });
 *       const { data: related } = await supabase
 *         .from('articles')
 *         .select('slug, title, category, image_url, read_time, published_at')
 *         .eq('category', article.category)
 *         .neq('slug', params.slug)
 *         .not('published_at', 'is', null)
 *         .order('published_at', { ascending: false })
 *         .limit(3);
 *       return { article: mapArticle(article), related: (related || []).map(mapArticle) };
 *     },
 *   }
 *
 *   // In this component:
 *   import { useLoaderData } from 'react-router';
 *   const { article, related } = useLoaderData() as { article: Article; related: Article[] };
 *
 * RICH BODY RENDERING:
 *   When body is stored as JSONB content blocks, replace the
 *   current string[] map with a block renderer:
 *
 *   function renderBlock(block: ContentBlock, i: number) {
 *     switch (block.type) {
 *       case 'paragraph': return <p key={i}>...</p>;
 *       case 'quote': return <blockquote key={i}>...</blockquote>;
 *       case 'image': return <figure key={i}><img src={block.url} /><figcaption>{block.caption}</figcaption></figure>;
 *       case 'heading': return <h2 key={i}>{block.text}</h2>;
 *       case 'callout': return <aside key={i} className="callout">...</aside>;
 *       case 'signal_embed': return <SignalCard key={i} signalId={block.signal_id} />;
 *     }
 *   }
 *
 * BOOKMARK BUTTON:
 *   The Bookmark button currently does nothing. Wire it to:
 *   await supabase.from('bookmarks').upsert({
 *     user_id: session.user.id,
 *     article_id: article.id,
 *   });
 *   Requires a `bookmarks` table and auth.
 *
 * SHARE BUTTON:
 *   Use navigator.clipboard.writeText(window.location.href) or
 *   the Web Share API for mobile.
 *
 * VIEW TRACKING (optional):
 *   Increment a view counter on load:
 *   await supabase.rpc('increment_article_views', { article_slug: slug });
 *   (Postgres function to avoid race conditions)
 *
 * EMAIL CAPTURE (end-of-article):
 *   The EmailCapture component at the bottom should INSERT into
 *   a `newsletter_subscribers` table. See EmailCapture.tsx notes.
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

function RelatedCard({ article }: { article: Article }) {
  return (
    <Link to={`/intelligence/feed/${article.slug}`} className="group flex gap-4">
      <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0">
        <ImageWithFallback
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="flex-1 min-w-0">
        <span className={`text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-full ${TAG_COLORS[article.category] || 'bg-gray-100 text-gray-500'}`}>
          {article.category}
        </span>
        <h4 className="text-[#141418] text-sm mt-1.5 line-clamp-2 group-hover:text-[#3F5465] transition-colors">
          {article.title}
        </h4>
        <span className="text-[#141418]/30 text-xs mt-1 block" style={{ fontFamily: 'var(--font-mono)' }}>
          {article.readTime} min read
        </span>
      </div>
    </Link>
  );
}

export function ArticleDetail() {
  const { slug } = useParams();
  const article = getArticleBySlug(slug || '');

  if (!article) {
    return <Navigate to="/intelligence/feed" replace />;
  }

  const related = getRelatedArticles(article.slug, 3);

  return (
    <>
      {/* Hero image */}
      <div className="relative h-[50vh] lg:h-[60vh] overflow-hidden">
        <ImageWithFallback
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F2428] via-[#1F2428]/50 to-[#1F2428]/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1F2428]/40 via-transparent to-transparent" />

        {/* Back nav */}
        <div className="absolute top-24 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              to="/intelligence/feed"
              className="inline-flex items-center gap-2 text-[#F7F5F2]/60 hover:text-[#F7F5F2] text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Feed
            </Link>
          </div>
        </div>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 lg:pb-14">
            <div className="max-w-3xl">
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`text-[10px] tracking-widest uppercase px-2.5 py-0.5 rounded-full ${TAG_COLORS[article.category] || 'bg-white/10 text-white/70'}`}>
                  {article.category}
                </span>
                <span className="text-[10px] tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-white/10 text-[#F7F5F2]/60">
                  {article.tag}
                </span>
              </div>

              <h1 className="text-[#F7F5F2] text-3xl lg:text-5xl mb-4">
                {article.title}
              </h1>
              <p className="text-[#F7F5F2]/60 text-lg max-w-2xl">
                {article.subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Article body */}
      <section className="bg-[#FAF9F7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-12 gap-8 lg:gap-12">
            {/* Main content */}
            <article className="col-span-12 lg:col-span-8 py-10 lg:py-14">
              {/* Article meta bar */}
              <div className="flex items-center justify-between pb-8 mb-8 border-b border-[#141418]/10">
                <div className="flex items-center gap-4">
                  {article.author.avatar ? (
                    <ImageWithFallback
                      src={article.author.avatar}
                      alt={article.author.name}
                      className="w-11 h-11 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-[#3F5465]/10 flex items-center justify-center text-sm text-[#3F5465]">S</div>
                  )}
                  <div>
                    <span className="text-[#141418] text-sm block">{article.author.name}</span>
                    <span className="text-[#141418]/40 text-xs">{article.author.role}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[#141418]/40 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
                    {formatDate(article.publishedAt)}
                  </span>
                  <span className="text-[#141418]/20">·</span>
                  <span className="text-[#141418]/40 text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.readTime} min read
                  </span>
                  <div className="hidden sm:flex items-center gap-2 ml-2">
                    <button className="p-2 rounded-lg hover:bg-[#141418]/5 text-[#141418]/30 hover:text-[#141418]/60 transition-colors cursor-pointer">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-[#141418]/5 text-[#141418]/30 hover:text-[#141418]/60 transition-colors cursor-pointer">
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Signal callout */}
              {article.relatedSignal && (
                <div className="card-mineral-inset rounded-xl p-5 mb-10 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#5F8A72]/10 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5 text-[#5F8A72]" />
                  </div>
                  <div>
                    <span className="text-[#141418]/40 text-xs block mb-0.5">Related Signal</span>
                    <span className="text-[#141418] text-sm">{article.relatedSignal.label}</span>
                  </div>
                  <span className="ml-auto text-[#5F8A72] text-xl" style={{ fontFamily: 'var(--font-mono)' }}>
                    {article.relatedSignal.value}
                  </span>
                </div>
              )}

              {/* Body paragraphs */}
              <div className="space-y-6">
                {article.body.map((paragraph, i) => {
                  // First paragraph gets a drop cap treatment
                  if (i === 0) {
                    return (
                      <p key={i} className="text-[#141418]/80 text-lg first-letter:text-5xl first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-[#141418]" style={{ lineHeight: '1.75' }}>
                        {paragraph}
                      </p>
                    );
                  }
                  // Check if paragraph starts with a quote
                  if (paragraph.startsWith('"')) {
                    return (
                      <blockquote key={i} className="border-l-2 border-[#3F5465]/30 pl-6 py-2 my-8">
                        <p className="text-[#141418] text-lg italic" style={{ lineHeight: '1.75' }}>
                          {paragraph}
                        </p>
                      </blockquote>
                    );
                  }
                  return (
                    <p key={i} className="text-[#141418]/70" style={{ lineHeight: '1.85' }}>
                      {paragraph}
                    </p>
                  );
                })}
              </div>

              {/* End-of-article CTA */}
              <div className="mt-14 pt-10 border-t border-[#141418]/10">
                <div className="rounded-2xl bg-[#1F2428] p-8 lg:p-10">
                  <span className="eyebrow text-[#F7F5F2]/40 mb-3 block">Stay ahead of the market</span>
                  <h3 className="text-[#F7F5F2] text-xl lg:text-2xl mb-2">Get stories like this every Friday.</h3>
                  <p className="text-[#F7F5F2]/40 text-sm mb-6">
                    Market signals, clinical data, and editorial intelligence — delivered to your inbox.
                  </p>
                  <EmailCapture
                    dark
                    compact
                    placeholder="Your professional email"
                    buttonLabel="Subscribe"
                    showTrust={false}
                    showSocialProof
                  />
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="col-span-12 lg:col-span-4 py-10 lg:py-14">
              {/* Sticky sidebar */}
              <div className="lg:sticky lg:top-28 space-y-8">
                {/* Related stories */}
                <div>
                  <span className="eyebrow text-[#141418]/40 mb-5 block">Related Intelligence</span>
                  <div className="space-y-5">
                    {related.map((r) => (
                      <RelatedCard key={r.slug} article={r} />
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <span className="eyebrow text-[#141418]/40 mb-4 block">Topics</span>
                  <div className="flex flex-wrap gap-2">
                    {[article.category, article.tag, 'Professional Aesthetics', 'Market Data'].map((t) => (
                      <Link
                        key={t}
                        to="/intelligence/feed"
                        className="text-xs px-3 py-1.5 rounded-full bg-[#F3F0EB] text-[#141418]/50 hover:text-[#141418] hover:bg-[#EDE9E3] transition-colors"
                      >
                        {t}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Back to feed */}
                <Link
                  to="/intelligence/feed"
                  className="flex items-center gap-2 text-[#3F5465] text-sm hover:text-[#141418] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  All stories
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
