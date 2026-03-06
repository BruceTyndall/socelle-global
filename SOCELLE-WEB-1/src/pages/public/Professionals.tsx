import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight, TrendingUp, Layers,
  Package, Activity, LineChart, Gauge,
} from 'lucide-react';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import WordReveal from '../../components/motion/WordReveal';
import GradientMark from '../../components/motion/GradientMark';
import SplitPanel from '../../components/sections/SplitPanel';
import SiteFooter from '../../components/sections/SiteFooter';

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

// ── Stats row ───────────────────────────────────────────────────
const STATS = [
  { value: '120+', label: 'Authorized brands' },
  { value: '34', label: 'Market signals' },
  { value: '500+', label: 'Licensed operators' },
  { value: '1', label: 'Cart, every brand' },
];

export default function ForBuyers() {
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

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative py-20 lg:py-28 overflow-hidden bg-mn-bg">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/blue-drops.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(160deg, rgba(246,244,241,0.91) 0%, rgba(246,244,241,0.78) 50%, rgba(246,244,241,0.90) 100%)',
          }}
          aria-hidden="true"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <BlockReveal>
              <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-5">
                FOR PROFESSIONALS
              </p>
            </BlockReveal>
            <WordReveal
              text="For Professionals"
              as="h1"
              className="font-sans font-semibold text-hero text-graphite mb-7 justify-center"
            />
            <BlockReveal delay={200}>
              <p className="text-body-lg text-[rgba(30,37,43,0.62)] max-w-2xl mx-auto mb-10">
                Benchmarks, pricing signals, and protocol intelligence built for operators who compete on knowledge.
              </p>
            </BlockReveal>
            <BlockReveal delay={350}>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/portal/signup" className="btn-mineral-primary">
                  Get Intelligence Access
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <Link to="/intelligence" className="btn-mineral-secondary">
                  Benchmark Your Market
                </Link>
              </div>
            </BlockReveal>
          </div>
        </div>
      </section>

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
        <p className="text-body text-[rgba(30,37,43,0.62)] mb-6">
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
        <p className="text-body text-[rgba(30,37,43,0.62)] mb-6">
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
        <p className="text-body text-[rgba(30,37,43,0.62)] mb-6">
          Multi-brand checkout in a single cart. Verified wholesale pricing from
          every authorized brand. Reorder signals based on your usage patterns and
          treatment room cadence — so you never run short.
        </p>
        <Link to="/brands" className="inline-flex items-center gap-1.5 text-accent font-sans font-medium text-sm hover:text-accent-hover transition-colors">
          Browse marketplace
          <ArrowRight className="w-4 h-4" />
        </Link>
      </SplitPanel>

      {/* ── Feature Grid ─────────────────────────────────────────── */}
      <section className="bg-mn-bg py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <BlockReveal>
              <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-4">
                Intelligence Suite
              </p>
            </BlockReveal>
            <BlockReveal delay={100}>
              <h2 className="font-sans font-semibold text-section text-graphite mb-5">
                Every decision backed by data
              </h2>
            </BlockReveal>
            <BlockReveal delay={200}>
              <p className="text-body text-[rgba(30,37,43,0.62)] max-w-lg mx-auto">
                Six intelligence layers working together to replace guesswork with
                evidence from verified professional operators.
              </p>
            </BlockReveal>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {FEATURES.map((card, i) => (
              <BlockReveal key={card.title} delay={i * 80}>
                <div className="bg-white/60 backdrop-blur-[12px] border border-white/30 rounded-2xl p-8 h-full hover:shadow-[0_4px_24px_rgba(19,24,29,0.06)] transition-shadow duration-300">
                  <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                    <card.icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-sans font-semibold text-graphite text-base mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm text-[rgba(30,37,43,0.62)] leading-relaxed">
                    {card.body}
                  </p>
                </div>
              </BlockReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Metrics Row ──────────────────────────────────────────── */}
      <section className="bg-mn-surface py-16 lg:py-20 border-y border-[rgba(30,37,43,0.06)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* W12-01: DEMO badge — stats are hardcoded, not DB-connected */}
          <div className="flex justify-center mb-8">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 font-sans">
              <span className="inline-flex rounded-full h-1.5 w-1.5 bg-amber-400" />
              Preview Data
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            {STATS.map((s) => (
              <BlockReveal key={s.label}>
                <p className="font-sans font-bold text-[2.5rem] text-graphite mb-1">
                  {s.value}
                </p>
                <p className="text-sm text-[rgba(30,37,43,0.52)] font-sans">
                  {s.label}
                </p>
              </BlockReveal>
            ))}
          </div>
        </div>
      </section>

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
              <Link
                to="/how-it-works"
                className="rounded-full h-[52px] px-7 bg-white/10 text-[#F7F5F2] border border-[rgba(247,245,242,0.16)] inline-flex items-center justify-center font-sans font-medium text-sm hover:bg-white/15 transition-all duration-200"
              >
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
