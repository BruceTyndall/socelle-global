import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight, TrendingUp, Layers,
  Package, Activity, LineChart, Gauge,
} from 'lucide-react';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import GradientMark from '../../components/motion/GradientMark';
import SplitPanel from '../../components/sections/SplitPanel';
import SiteFooter from '../../components/sections/SiteFooter';
import HeroMediaRail from '../../components/public/HeroMediaRail';
import EvidenceStrip from '../../components/public/EvidenceStrip';
import SplitFeature from '../../components/public/SplitFeature';
import { usePlatformStats } from '../../lib/usePlatformStats';

/* ══════════════════════════════════════════════════════════════════
   ForBuyers — Liquid Glass Visual System
   Procurement intelligence for salon, spa, and medspa operators
   ══════════════════════════════════════════════════════════════════ */

// ── Feature grid cards ──────────────────────────────────────────
const FEATURES = [
  {
    icon: Activity,
    title: 'Demand Forecasting',
    body: 'Anticipate category shifts before they hit. Seasonal demand curves, ingredient momentum, and protocol adoption rates mapped across your region.',
  },
  {
    icon: Gauge,
    title: 'Vendor Analytics',
    body: 'Evaluate supplier reliability, fulfillment speed, and pricing consistency. Make stocking decisions backed by verified operator data.',
  },
  {
    icon: Layers,
    title: 'Category Intelligence',
    body: 'Understand how product categories perform across treatment types. See what professional operators are adding, dropping, and reordering.',
  },
  {
    icon: LineChart,
    title: 'Pricing Optimization',
    body: 'Cost-per-use breakdowns, tier-level wholesale comparison, and margin analysis so every purchase decision connects to your bottom line.',
  },
  {
    icon: Package,
    title: 'Reorder Intelligence',
    body: 'Automated velocity tracking flags when stock runs low. Reorder signals based on your usage patterns and treatment room cadence.',
  },
  {
    icon: TrendingUp,
    title: 'Treatment Trending',
    body: 'See which protocols are gaining traction across verified treatment rooms. LED, scalp, peptide, retinoid — tracked in real time.',
  },
];

export default function ForBuyers() {
  /* W12-32: Live platform stats */
  const { stats, isLive: statsLive } = usePlatformStats();
  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>For Professionals — Socelle</title>
        <meta
          name="description"
          content="Procurement intelligence and multi-brand marketplace for licensed spa, salon, and medspa operators. Data-driven purchasing decisions."
        />
        <meta property="og:title" content="For Professionals — Socelle" />
        <meta
          property="og:description"
          content="Market intelligence that gives professional beauty operators an edge in purchasing decisions."
        />
        <link rel="canonical" href="https://socelle.com/for-buyers" />
      </Helmet>
      <MainNav />

      {/* ── Hero (HeroMediaRail — W12-26) ──────────────────────────── */}
      <HeroMediaRail
        videoSrc="/videos/blue-drops.mp4"
        poster="/videos/posters/blue-drops-poster.jpg"
        overlay="light"
        minHeight="70svh"
        headline="For Professionals"
        subtitle="Benchmarks, pricing signals, and protocol intelligence built for operators who compete on knowledge."
        eyebrow={<p className="mn-eyebrow">FOR PROFESSIONALS</p>}
        cta={
          <>
            <Link to="/portal/signup" className="btn-mineral-primary">
              Get Intelligence Access
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link to="/intelligence" className="btn-mineral-secondary">
              Benchmark Your Market
            </Link>
          </>
        }
      />

      {/* ── SplitPanel 1: Market Signals ──────────────────────────── */}
      <SplitPanel imagePosition="right" bgColor="bg-mn-surface" className="mx-4 lg:mx-8 mb-6">
        <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-4">
          Market Signals
        </p>
        <h2 className="font-sans font-semibold text-section text-graphite mb-5">
          Real-time demand tracking,{' '}
          <GradientMark>ingredient trends</GradientMark>,{' '}
          category shifts
        </h2>
        <p className="text-body text-[rgba(20,20,24,0.62)] mb-6">
          Know what is moving before your competitors do. Treatment room adoption
          rates, ingredient velocity, seasonal demand curves, and protocol momentum
          — distilled into signals you can act on today.
        </p>
        <Link to="/intelligence" className="inline-flex items-center gap-1.5 text-accent font-sans font-medium text-sm hover:text-accent-hover transition-colors">
          View live signals
          <ArrowRight className="w-4 h-4" />
        </Link>
      </SplitPanel>

      {/* ── SplitPanel 2: Competitive Benchmarks ─────────────────── */}
      <SplitPanel imagePosition="left" bgColor="bg-accent/5" className="mx-4 lg:mx-8 mb-6">
        <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-4">
          Competitive Benchmarks
        </p>
        <h2 className="font-sans font-semibold text-section text-graphite mb-5">
          Peer comparison, pricing intelligence,{' '}
          <GradientMark>performance context</GradientMark>
        </h2>
        <p className="text-body text-[rgba(20,20,24,0.62)] mb-6">
          See how your stock compares to operators like you. Anonymized peer data
          on category spending, brand adoption rates, and supply gaps reveals where
          you lead and where opportunity exists.
        </p>
        <Link to="/request-access" className="inline-flex items-center gap-1.5 text-accent font-sans font-medium text-sm hover:text-accent-hover transition-colors">
          See your benchmarks
          <ArrowRight className="w-4 h-4" />
        </Link>
      </SplitPanel>

      {/* ── SplitPanel 3: Smart Procurement ──────────────────────── */}
      <SplitPanel imagePosition="right" bgColor="bg-mn-surface" className="mx-4 lg:mx-8 mb-6">
        <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-4">
          Smart Procurement
        </p>
        <h2 className="font-sans font-semibold text-section text-graphite mb-5">
          Data-driven ordering,{' '}
          <GradientMark>optimized inventory</GradientMark>,{' '}
          vendor performance
        </h2>
        <p className="text-body text-[rgba(20,20,24,0.62)] mb-6">
          Multi-brand checkout in a single cart. Verified wholesale pricing from
          every authorized brand. Reorder signals based on your usage patterns and
          treatment room cadence — so you never run short.
        </p>
        <Link to="/brands" className="inline-flex items-center gap-1.5 text-accent font-sans font-medium text-sm hover:text-accent-hover transition-colors">
          Browse marketplace
          <ArrowRight className="w-4 h-4" />
        </Link>
      </SplitPanel>

      {/* ── Intelligence Suite (EvidenceStrip — W12-26) ───────────── */}
      <EvidenceStrip
        title="Intelligence Suite"
        bg="dark"
        isLive={false}
        items={FEATURES.slice(0, 6).map(f => ({
          label: f.title,
          value: f.body.split('.')[0],
          source: 'Intelligence',
        }))}
      />

      {/* ── Mid-page media (SplitFeature — W12-26) ────────────────── */}
      <SplitFeature
        videoSrc="/videos/foundation.mp4"
        poster="/videos/posters/foundation-poster.jpg"
        mediaPosition="left"
        bg="surface"
      >
        <BlockReveal>
          <p className="mn-eyebrow mb-4">Intelligence Suite</p>
          <h2 className="font-sans font-semibold text-section text-graphite mb-6">
            Every decision backed by data
          </h2>
          <div className="space-y-5">
            {FEATURES.slice(0, 3).map(card => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="flex gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/10 flex-shrink-0">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-sans text-base font-semibold text-graphite">{card.title}</h3>
                    <p className="text-sm text-graphite/60 font-sans leading-relaxed mt-1">{card.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </BlockReveal>
      </SplitFeature>

      {/* ── Metrics (EvidenceStrip — W12-26) ──────────────────────── */}
      <EvidenceStrip
        title="Platform Metrics"
        bg="surface"
        isLive={statsLive}
        items={[
          { label: 'Authorized brands', value: `${stats.brandsCount}+`, source: statsLive ? 'Live' : 'Preview' },
          { label: 'Market signals', value: String(stats.signalsCount), source: statsLive ? 'Live' : 'Preview' },
          { label: 'Licensed operators', value: `${stats.operatorsCount}+`, source: statsLive ? 'Live' : 'Preview' },
          { label: 'Cart, every brand', value: '1', source: 'Platform' },
        ]}
      />

      {/* ── Dark CTA ─────────────────────────────────────────────── */}
      <section className="bg-mn-dark rounded-section mx-4 lg:mx-8 py-24 lg:py-32 my-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BlockReveal>
            <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-[rgba(247,245,242,0.45)] mb-5">
              PROFESSIONALS ONLY
            </p>
          </BlockReveal>
          <BlockReveal delay={100}>
            <h2 className="font-sans font-semibold text-section text-[#F7F5F2] mb-5">
              Start making smarter decisions
            </h2>
          </BlockReveal>
          <BlockReveal delay={200}>
            <p className="text-body text-[rgba(247,245,242,0.55)] max-w-md mx-auto mb-10">
              Intelligence-driven purchasing for licensed estheticians,
              spa owners, and medspa operators. See your market position from day one.
            </p>
          </BlockReveal>
          <BlockReveal delay={300}>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/request-access" className="btn-mineral-dark">
                Request Access
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link to="/how-it-works" className="btn-mineral-ghost">
                See how it works
              </Link>
            </div>
          </BlockReveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
