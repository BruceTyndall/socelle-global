import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Lock, Eye } from 'lucide-react';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import SiteFooter from '../../components/sections/SiteFooter';
import HeroMediaRail from '../../components/public/HeroMediaRail';
import SplitFeature from '../../components/public/SplitFeature';
import EvidenceStrip from '../../components/public/EvidenceStrip';
import MarketPulseBar from '../../components/intelligence/MarketPulseBar';
import SignalFilter from '../../components/intelligence/SignalFilter';
import SignalCard from '../../components/intelligence/SignalCard';
import { useIntelligence } from '../../lib/intelligence/useIntelligence';
import { useSignalCategories } from '../../lib/intelligence/useSignalCategories';

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
  const categories = useSignalCategories(signals);

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

      {/* ── Hero (Media Rail — W12-26) ─────────────────────────────── */}
      <HeroMediaRail
        videoSrc="/videos/blue-drops.mp4"
        poster="/videos/posters/blue-drops-poster.jpg"
        overlay="light"
        minHeight="70svh"
        headline="Intelligence Hub"
        subtitle="Daily signals across brands, treatments, and operator markets — verified, scored, and updated continuously."
        eyebrow={<p className="mn-eyebrow">{isLive ? 'Live data — updated as signals are curated' : 'Preview — sign in for your personalized intelligence feed'}</p>}
        cta={
          <>
            <Link to="/portal/signup" className="btn-mineral-primary">
              Get Intelligence Access
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <a href="#daily-briefing" className="btn-mineral-secondary">
              View Today's Briefing
            </a>
          </>
        }
      />

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

      {/* ── Intelligence Categories (Evidence Strip — W12-26) ────────── */}
      <EvidenceStrip
        title="What We Track"
        bg="dark"
        isLive={isLive}
        items={categories.slice(0, 6).map(cat => ({
          label: cat.title,
          value: cat.count > 0 ? `${cat.count} signal${cat.count !== 1 ? 's' : ''}` : cat.description.split(',')[0],
          source: isLive ? 'Live' : 'Intelligence',
        }))}
      />

      {/* ── Mid-page media (SplitFeature — W12-26) ────────────────── */}
      <SplitFeature
        videoSrc="/videos/air-bubbles.mp4"
        poster="/videos/posters/air-bubbles-poster.jpg"
        mediaPosition="right"
        bg="surface"
      >
        <BlockReveal>
          <p className="mn-eyebrow mb-4">Data-Driven Decisions</p>
          <h2 className="font-sans font-semibold text-section text-graphite mb-6">
            Six dimensions of market intelligence
          </h2>
          <div className="space-y-5">
            {categories.slice(0, 3).map(cat => {
              const Icon = cat.icon;
              return (
                <div key={cat.title} className="flex gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 flex-shrink-0">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-sans text-base font-semibold text-graphite">{cat.title}</h3>
                    <p className="text-sm text-graphite/60 font-sans leading-relaxed mt-1">{cat.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </BlockReveal>
      </SplitFeature>

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
                  <Link to="/brand/apply" className="btn-mineral-ghost">
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
