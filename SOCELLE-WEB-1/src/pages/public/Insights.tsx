import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';

// ── Placeholder trend items (replace with API data: NewsAPI, GNews, RSS) ───
const TREND_PLACEHOLDERS = [
  {
    id: '1',
    title: 'Professional skincare shifts toward biotech actives',
    summary:
      'Peptides, fermented ingredients, and exosomes are moving from niche to mainstream in professional channels.',
    source: 'Industry report',
    date: 'Q1 2026',
    category: 'Ingredients',
  },
  {
    id: '2',
    title: 'Hyperpigmentation solutions see surge in demand',
    summary:
      'Treatment-room interest in even skin tone and targeted correction protocols continues to rise quarter-over-quarter.',
    source: 'Market intelligence',
    date: 'Q1 2026',
    category: 'Treatment room',
  },
  {
    id: '3',
    title: 'Clean formulations become baseline procurement criterion',
    summary:
      'Professional buyers are increasingly filtering for ingredient transparency and sustainability during brand evaluation.',
    source: 'Category pulse',
    date: 'Q1 2026',
    category: 'Market',
  },
];

const CATEGORIES = [
  { key: 'ingredients', label: 'Ingredients' },
  { key: 'treatment', label: 'Treatment room' },
  { key: 'market', label: 'Market & regulation' },
];

export default function Insights() {
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
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TREND_PLACEHOLDERS.map((t) => (
              <article
                key={t.id}
                className="bg-white rounded-2xl border border-graphite/10 p-6 shadow-card hover:shadow-card-hover transition-shadow"
              >
                <span className="text-[10px] font-sans font-semibold text-accent uppercase tracking-wider">
                  {t.category}
                </span>
                <h3 className="font-sans font-semibold text-lg text-graphite mt-2 mb-2 leading-snug">
                  {t.title}
                </h3>
                <p className="text-graphite/60 font-sans text-sm font-light leading-relaxed">
                  {t.summary}
                </p>
                <p className="text-graphite/40 text-xs font-sans mt-4">
                  {t.source} · {t.date}
                </p>
              </article>
            ))}
          </div>
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
