import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight, TrendingUp, Search, BarChart3,
  ShoppingCart, Users, Package, Activity,
  Layers, ChevronRight,
} from 'lucide-react';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import WordReveal from '../../components/motion/WordReveal';
import GradientMark from '../../components/motion/GradientMark';
import SplitPanel from '../../components/sections/SplitPanel';
import SiteFooter from '../../components/sections/SiteFooter';

/* ══════════════════════════════════════════════════════════════════
   ForSalons — Liquid Glass Visual System
   Treatment-room focused intelligence for salon and day spa operators
   ══════════════════════════════════════════════════════════════════ */

const FEATURE_CARDS = [
  {
    icon: TrendingUp,
    title: 'Treatment Trending',
    body: 'Real-time adoption data on services, add-ons, and protocols that are gaining velocity in rooms like yours.',
  },
  {
    icon: Search,
    title: 'Brand Discovery',
    body: 'Discover emerging brands and products through peer adoption data, not sales pitches. See what operators trust.',
  },
  {
    icon: BarChart3,
    title: 'Pricing Intelligence',
    body: 'Benchmark your service pricing against anonymized peer data segmented by region, practice size, and specialty.',
  },
  {
    icon: ShoppingCart,
    title: 'Retail Attach',
    body: 'Data-driven product recommendations that boost retail revenue per treatment with proven pairing strategies.',
  },
  {
    icon: Users,
    title: 'Client Analytics',
    body: 'Understand client demand patterns, seasonal trends, and service preferences to optimize your menu mix.',
  },
  {
    icon: Package,
    title: 'Inventory Optimization',
    body: 'Velocity-based reorder signals, waste reduction alerts, and cost-per-treatment analysis across your back bar.',
  },
];

const METRICS = [
  { value: '1,200+', label: 'Verified salon operators' },
  { value: '86%', label: 'Reorder accuracy' },
  { value: '24k+', label: 'Product signals tracked' },
  { value: '3.2x', label: 'Avg. retail attach lift' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Socelle for Day Spas & Salons | Treatment Room Intelligence',
  description:
    'Market intelligence and multi-brand procurement for day spa operators and salon professionals.',
  url: 'https://socelle.com/for-salons',
};

export default function ForSalons() {
  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>For Salons — Socelle</title>
        <meta
          name="description"
          content="Intelligence for the modern treatment room. Product trending, service benchmarking, and growth analytics for salon and day spa operators."
        />
        <meta property="og:title" content="Socelle for Day Spas & Salons | Treatment Room Intelligence" />
        <meta
          property="og:description"
          content="Intelligence to stock what is working and the marketplace to order it all in one place."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://socelle.com/for-salons" />
        <link rel="canonical" href="https://socelle.com/for-salons" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <MainNav />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden bg-mn-bg">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/foundation.mp4"
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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BlockReveal>
            <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-5">
              FOR SALONS
            </p>
          </BlockReveal>
          <WordReveal
            text="Intelligence for the modern treatment room"
            as="h1"
            className="font-sans font-semibold text-hero text-graphite mb-7 justify-center max-w-4xl mx-auto"
          />
          <BlockReveal delay={200}>
            <p className="text-body-lg text-graphite/60 max-w-2xl mx-auto mb-10">
              Stop guessing what to stock, how to price, or which brands to carry.
              Socelle delivers the market intelligence that lets salon operators make
              every purchasing decision with confidence.
            </p>
          </BlockReveal>
          <BlockReveal delay={350}>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/request-access" className="btn-mineral-primary">
                Request Access
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link to="/intelligence" className="btn-mineral-secondary">
                Explore Intelligence
              </Link>
            </div>
          </BlockReveal>
        </div>
      </section>

      {/* ── SplitPanel 1: Product Intelligence ────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <SplitPanel imagePosition="right" bgColor="bg-mn-surface">
          <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-4">
            PRODUCT INTELLIGENCE
          </p>
          <h2 className="font-sans font-semibold text-section text-graphite mb-5">
            <GradientMark>Category trends</GradientMark> that inform your back bar
          </h2>
          <p className="text-body text-graphite/60 mb-6">
            Ingredient performance data, brand comparison analytics, and category
            velocity signals. Understand what products are gaining traction in treatment
            rooms your size — and which ones your peers are quietly dropping.
          </p>
          <ul className="space-y-3">
            {['Category velocity tracking', 'Ingredient efficacy benchmarks', 'Peer-validated brand comparisons'].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Layers className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-sm text-graphite/70">{item}</span>
              </li>
            ))}
          </ul>
        </SplitPanel>
      </div>

      {/* ── SplitPanel 2: Service Optimization ────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <SplitPanel imagePosition="left" bgColor="bg-mn-surface">
          <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-4">
            SERVICE OPTIMIZATION
          </p>
          <h2 className="font-sans font-semibold text-section text-graphite mb-5">
            Price, position, and <GradientMark>optimize</GradientMark> your menu
          </h2>
          <p className="text-body text-graphite/60 mb-6">
            Treatment pricing benchmarks, service mix analysis, and client demand
            patterns from verified operators. Know whether your pricing is competitive,
            which add-ons drive the highest satisfaction, and where your menu has gaps.
          </p>
          <ul className="space-y-3">
            {['Treatment pricing benchmarks by region', 'Service mix and add-on analysis', 'Client demand pattern recognition'].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Activity className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-sm text-graphite/70">{item}</span>
              </li>
            ))}
          </ul>
        </SplitPanel>
      </div>

      {/* ── SplitPanel 3: Growth Analytics ────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <SplitPanel imagePosition="right" bgColor="bg-accent/5">
          <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-4">
            GROWTH ANALYTICS
          </p>
          <h2 className="font-sans font-semibold text-section text-graphite mb-5">
            <GradientMark>Revenue benchmarks</GradientMark> from verified peers
          </h2>
          <p className="text-body text-graphite/60 mb-6">
            Compare your revenue per treatment, retail attach rate, and client retention
            against anonymized peer data. Identify the expansion signals that indicate
            when your practice is ready for its next stage of growth.
          </p>
          <ul className="space-y-3">
            {['Revenue-per-treatment comparisons', 'Retail attach rate benchmarks', 'Market expansion readiness signals'].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <TrendingUp className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-sm text-graphite/70">{item}</span>
              </li>
            ))}
          </ul>
        </SplitPanel>
      </div>

      {/* ── Feature Grid ──────────────────────────────────────────── */}
      <section className="bg-mn-surface py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BlockReveal>
            <div className="text-center mb-16">
              <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-4">
                PLATFORM CAPABILITIES
              </p>
              <h2 className="font-sans font-semibold text-section text-graphite mb-5">
                Everything your treatment room needs
              </h2>
              <p className="text-body text-graphite/60 max-w-lg mx-auto">
                Intelligence tools designed for the operational realities of salon
                and day spa professionals.
              </p>
            </div>
          </BlockReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {FEATURE_CARDS.map((card, idx) => (
              <BlockReveal key={card.title} delay={idx * 80}>
                <div className="bg-white/60 backdrop-blur-[12px] border border-white/30 rounded-2xl p-7 h-full hover:shadow-[0_4px_24px_rgba(19,24,29,0.06)] transition-shadow duration-300">
                  <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                    <card.icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-sans font-semibold text-graphite text-base mb-2">
                    {card.title}
                  </h3>
                  <p className="text-sm text-graphite/60 leading-relaxed">
                    {card.body}
                  </p>
                </div>
              </BlockReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Metrics Row ───────────────────────────────────────────── */}
      <section className="bg-mn-bg py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {METRICS.map((m, idx) => (
              <BlockReveal key={m.label} delay={idx * 100}>
                <div className="text-center">
                  <p className="font-sans font-semibold text-[2.5rem] lg:text-[3rem] text-graphite leading-none mb-2">
                    {m.value}
                  </p>
                  <p className="text-sm text-graphite/50 font-sans">
                    {m.label}
                  </p>
                </div>
              </BlockReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cross-link ────────────────────────────────────────────── */}
      <section className="bg-mn-bg py-12 border-y border-[rgba(20,20,24,0.06)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-graphite/50 font-sans">
            Operate a medspa?{' '}
            <Link
              to="/for-medspas"
              className="text-accent font-medium hover:text-accent-hover transition-colors inline-flex items-center gap-1"
            >
              See Socelle for Medical Spas
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>
      </section>

      {/* ── Dark CTA Panel ────────────────────────────────────────── */}
      <section className="bg-mn-dark rounded-section mx-4 lg:mx-8 py-20 lg:py-28 mb-20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BlockReveal>
            <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-[rgba(247,245,242,0.45)] mb-5">
              PROFESSIONALS ONLY
            </p>
            <h2 className="font-sans font-semibold text-section text-[#F7F5F2] mb-5">
              Elevate your salon with intelligence
            </h2>
            <p className="text-body text-[rgba(247,245,242,0.65)] max-w-md mx-auto mb-10">
              Intelligence-driven purchasing for licensed estheticians, day spa
              owners, and salon operators. Data replaces guesswork.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/request-access"
                className="btn-mineral-secondary"
              >
                Request Access
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/for-buyers" className="btn-mineral-dark">
                All operator features
              </Link>
            </div>
          </BlockReveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
