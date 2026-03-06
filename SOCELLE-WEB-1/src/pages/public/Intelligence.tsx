import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight,
  BarChart3,
  TrendingUp,
  FlaskConical,
  Building2,
  MapPin,
  AlertTriangle,
  Lock,
  Eye,
} from 'lucide-react';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import WordReveal from '../../components/motion/WordReveal';
import SiteFooter from '../../components/sections/SiteFooter';
import MarketPulseBar from '../../components/intelligence/MarketPulseBar';
import SignalFilter from '../../components/intelligence/SignalFilter';
import SignalCard from '../../components/intelligence/SignalCard';
import { useIntelligence } from '../../lib/intelligence/useIntelligence';

// ── Intelligence category descriptions ──────────────────────────────
const CATEGORIES = [
  {
    icon: BarChart3,
    title: 'Product Velocity',
    description:
      'Real-time reorder rates, first-time adoption trends, and SKU-level purchasing patterns across professional accounts.',
  },
  {
    icon: TrendingUp,
    title: 'Treatment Trends',
    description:
      'Protocol adoption rates, emerging service formats, and treatment-room innovations gaining traction with top operators.',
  },
  {
    icon: FlaskConical,
    title: 'Ingredient Momentum',
    description:
      'Formulation trends, emerging actives gaining clinical traction, and ingredient shifts across professional-grade product lines.',
  },
  {
    icon: Building2,
    title: 'Brand Adoption',
    description:
      'New brand launches, professional account growth rates, and channel expansion patterns across the wholesale landscape.',
  },
  {
    icon: MapPin,
    title: 'Regional Signals',
    description:
      'Geographic demand patterns, regional category preferences, and location-specific purchasing behavior across markets.',
  },
  {
    icon: AlertTriangle,
    title: 'Regulatory Alerts',
    description:
      'Compliance requirements, ingredient regulation changes, and policy shifts affecting professional beauty purchasing.',
  },
];

// ── JSON-LD structured data ────────────────────────────────────────
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Intelligence Hub | Socelle',
  description:
    'Live intelligence from professional treatment rooms. See trending products, protocols, ingredients, and brand adoption signals updated weekly.',
  url: 'https://socelle.com/intelligence',
  publisher: {
    '@type': 'Organization',
    name: 'Socelle',
    url: 'https://socelle.com',
  },
};

export default function Intelligence() {
  const { signals, marketPulse, loading, isLive, activeFilter, setActiveFilter } =
    useIntelligence();

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>Intelligence Hub | Socelle Market Signals</title>
        <meta
          name="description"
          content="Live intelligence from professional treatment rooms. See trending products, protocols, ingredients, and brand adoption signals updated weekly."
        />
        <meta
          property="og:title"
          content="Intelligence Hub | Socelle Market Signals"
        />
        <meta
          property="og:description"
          content="What's trending in treatment rooms. What products top spas are stocking. What ingredients are gaining clinical traction."
        />
        <link rel="canonical" href="https://socelle.com/intelligence" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <MainNav />

      {/* ── Market Pulse Bar ────────────────────────────────────────── */}
      <MarketPulseBar pulse={marketPulse} />

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative py-20 lg:py-28 overflow-hidden bg-mn-bg">
        <img
          src="/images/photo-4.svg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-[0.07] pointer-events-none select-none"
        />
        <div className="relative section-container text-center">
          <BlockReveal>
            <p className="mn-eyebrow mb-5">Intelligence Hub</p>
          </BlockReveal>
          <WordReveal
            text="Intelligence Hub"
            as="h1"
            className="font-sans font-semibold text-hero text-graphite mb-6 justify-center"
          />
          <BlockReveal delay={200}>
            <p className="text-graphite/60 font-sans text-body-lg max-w-2xl mx-auto leading-relaxed">
              Daily signals across brands, treatments, and operator markets — verified, scored, and updated continuously.
            </p>
            <p className="mt-3 text-sm font-sans font-medium text-accent/80">
              {isLive ? 'Live data — updated as signals are curated' : 'Preview — sign in for your personalized intelligence feed'}
            </p>
          </BlockReveal>
          <BlockReveal delay={350}>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Link to="/portal/signup" className="btn-mineral-primary">
                Get Intelligence Access
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <a href="#daily-briefing" className="btn-mineral-secondary">
                View Today's Briefing
              </a>
            </div>
          </BlockReveal>
        </div>
      </section>

      {/* ── Filter + Signal Grid ────────────────────────────────────── */}
      <section className="pb-16 lg:pb-24">
        <div className="section-container">
          {/* Filter bar */}
          <BlockReveal>
            <div className="mb-8">
              <SignalFilter active={activeFilter} onChange={setActiveFilter} />
            </div>
          </BlockReveal>

          {/* PREVIEW banner — shown when serving mock data */}
          {!isLive && !loading && (
            <div className="flex items-start gap-3 bg-accent/[0.07] border border-accent/20 rounded-2xl px-5 py-4 mb-8">
              <Eye className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              <p className="text-sm font-sans text-graphite/70 leading-snug">
                <span className="font-semibold text-graphite/90">Preview mode.</span>{' '}
                These signals are illustrative examples of the intelligence Socelle surfaces for professional operators.{' '}
                <Link to="/portal/signup" className="text-accent hover:underline font-medium">
                  Sign in for your live feed →
                </Link>
              </p>
            </div>
          )}

          {/* Signal count */}
          <p className="text-graphite/40 text-sm font-sans font-medium mb-6">
            {loading ? (
              <span className="inline-block w-32 h-4 bg-graphite/10 rounded animate-pulse" />
            ) : (
              <>
                {signals.length} signal{signals.length !== 1 ? 's' : ''}{' '}
                {activeFilter !== 'all' ? 'in this category' : 'across all categories'}
              </>
            )}
          </p>

          {/* Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-white/60 border border-white/30 p-6 animate-pulse">
                  <div className="h-3 w-24 bg-graphite/10 rounded mb-4" />
                  <div className="h-5 w-3/4 bg-graphite/10 rounded mb-3" />
                  <div className="h-3 w-full bg-graphite/10 rounded mb-2" />
                  <div className="h-3 w-5/6 bg-graphite/10 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {signals.map((signal) => (
                <SignalCard key={signal.id} signal={signal} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Intelligence Categories ─────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-mn-surface rounded-section">
        <div className="section-container">
          <div className="text-center mb-14">
            <BlockReveal>
              <p className="mn-eyebrow mb-4">What We Track</p>
            </BlockReveal>
            <BlockReveal delay={100}>
              <h2 className="font-sans font-semibold text-section text-graphite">
                Six dimensions of market intelligence
              </h2>
            </BlockReveal>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CATEGORIES.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <BlockReveal key={cat.title} delay={i * 80}>
                  <div className="bg-white/60 backdrop-blur-[12px] border border-white/30 rounded-2xl p-7 transition-shadow hover:shadow-panel">
                    <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-accent/10 mb-5">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="font-sans text-lg font-semibold text-graphite mb-2">{cat.title}</h3>
                    <p className="text-sm text-graphite/60 font-sans leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </BlockReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Gated Access CTA ────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="section-container">
          <BlockReveal>
            <div className="relative bg-mn-dark rounded-section p-10 sm:p-14 text-center overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-accent/[0.06] rounded-bl-[80px]" />
              <div className="relative">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/[0.08] mx-auto mb-6">
                  <Lock className="w-5 h-5 text-accent" />
                </div>
                <h2 className="font-sans font-semibold text-subsection text-[#F7F5F2] mb-4">
                  Full intelligence access requires a professional account
                </h2>
                <p className="text-[rgba(247,245,242,0.55)] font-sans text-base max-w-xl mx-auto mb-8 leading-relaxed">
                  Operators see personalized signals filtered to their business profile,
                  location, and treatment room. Access market intelligence tailored to
                  how you buy.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/portal/signup" className="btn-mineral-dark">
                    Request Professional Access
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/brand/apply"
                    className="inline-flex items-center gap-2 rounded-full h-[52px] px-7 bg-white/[0.08] text-[#F7F5F2] font-sans font-medium text-sm border border-white/[0.12] transition-colors hover:bg-white/[0.14]"
                  >
                    Brand Partner Application
                  </Link>
                </div>
              </div>
            </div>
          </BlockReveal>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <SiteFooter />
    </div>
  );
}
