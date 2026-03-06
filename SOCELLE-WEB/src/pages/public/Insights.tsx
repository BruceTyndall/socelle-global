import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Sparkles, ArrowRight, TrendingUp, Newspaper } from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useRssItems } from '../../lib/useRssItems';

function formatPublishedAt(ts: string | null): string {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const CATEGORIES = [
  { key: 'ingredients', label: 'Ingredients' },
  { key: 'treatment', label: 'Treatment room' },
  { key: 'market', label: 'Market & regulation' },
];

export default function Insights() {
  const { items, loading, isLive } = useRssItems(12);

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>Insights — Professional Beauty Trends | Socelle</title>
        <meta
          name="description"
          content="Professional beauty intelligence: ingredients, treatment room trends, and market shifts curated for salons, spas, and medspas."
        />
        <meta property="og:title" content="Professional Beauty Insights — Socelle" />
        <meta
          property="og:description"
          content="Trends, ingredients, and market intelligence for professional beauty buyers. Curated for salons, spas, and medspas."
        />
        <link rel="canonical" href="https://socelle.com/insights" />
      </Helmet>
      <MainNav />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative bg-mn-dark py-20 lg:py-28 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        <div className="section-container text-center relative">
          <p className="text-accent text-[11px] font-sans font-medium tracking-[0.25em] uppercase mb-4">
            Professional beauty intelligence
          </p>
          <h1 className="font-sans font-semibold text-4xl lg:text-5xl text-[#F7F5F2] leading-tight tracking-tight mb-5">
            Stay ahead of the curve
          </h1>
          <div className="mx-auto w-10 h-px bg-accent/40 mb-6" />
          <p className="text-[rgba(247,245,242,0.60)] font-sans font-light text-lg max-w-xl mx-auto">
            Trends, ingredients, and market shifts that matter to professional beauty —
            curated so you can focus on what's next.
          </p>
        </div>
      </section>

      {/* ── Category tags ──────────────────────────────────────────── */}
      <section className="py-12 lg:py-16 border-b border-graphite/10">
        <div className="section-container">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {CATEGORIES.map((c) => (
              <span
                key={c.key}
                className="px-4 py-2 rounded-full bg-white border border-graphite/10 text-graphite/60 font-sans text-sm font-medium"
              >
                {c.label}
              </span>
            ))}
          </div>
          <p className="text-center text-graphite/50 font-light text-sm max-w-lg mx-auto">
            Curated from industry sources. Sign in for personalized intelligence filtered to your treatment room.
          </p>
        </div>
      </section>

      {/* ── Latest trends ──────────────────────────────────────────── */}
      <section className="py-16 lg:py-24">
        <div className="section-container">
          <div className="flex items-center gap-2 mb-10">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h2 className="font-sans font-semibold text-2xl text-graphite">Latest trends</h2>
            {isLive && (
              <span className="text-[10px] font-semibold bg-signal-up/10 text-signal-up px-2 py-0.5 rounded-pill">
                Live
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-graphite/10 p-6 animate-pulse"
                >
                  <div className="h-3 w-20 bg-graphite/10 rounded mb-3" />
                  <div className="h-5 w-full bg-graphite/10 rounded mb-2" />
                  <div className="h-5 w-3/4 bg-graphite/10 rounded mb-4" />
                  <div className="h-3 w-full bg-graphite/5 rounded mb-1" />
                  <div className="h-3 w-5/6 bg-graphite/5 rounded" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <Newspaper className="w-10 h-10 text-graphite/20 mx-auto mb-4" />
              <p className="font-sans text-graphite/40 text-sm">
                No intelligence feeds available yet. Check back soon.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => {
                const card = (
                  <article className="bg-white rounded-2xl border border-graphite/10 p-6 shadow-card hover:shadow-card-hover transition-shadow h-full flex flex-col">
                    <span className="text-[10px] font-sans font-semibold text-accent uppercase tracking-wider">
                      {item.category}
                    </span>
                    <h3 className="font-sans font-semibold text-lg text-graphite mt-2 mb-2 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-graphite/60 font-sans text-sm font-light leading-relaxed flex-1">
                      {item.description}
                    </p>
                    <p className="text-graphite/40 text-xs font-sans mt-4 truncate">
                      {item.attribution_text}
                      {item.published_at ? ` · ${formatPublishedAt(item.published_at)}` : ''}
                    </p>
                  </article>
                );

                return item.link ? (
                  <a
                    key={item.id}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    {card}
                  </a>
                ) : (
                  <div key={item.id}>{card}</div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="bg-mn-dark py-16 lg:py-20">
        <div className="section-container text-center">
          <Sparkles className="w-10 h-10 text-accent mx-auto mb-4" />
          <h2 className="font-sans font-semibold text-2xl text-[#F7F5F2] mb-3">
            Ready to connect with professional beauty?
          </h2>
          <p className="text-[rgba(247,245,242,0.55)] font-sans text-sm font-light max-w-md mx-auto mb-8">
            Join Socelle to browse verified brands, access wholesale pricing, and streamline procurement.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/brands"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-sans font-semibold px-6 py-3 rounded-full transition-colors"
            >
              Browse brands
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/portal/signup"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-[#F7F5F2] font-sans font-medium px-6 py-3 rounded-full border border-white/20 transition-colors"
            >
              Create free account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <SiteFooter />
    </div>
  );
}
