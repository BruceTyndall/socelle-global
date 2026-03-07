import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight, Shield, Activity, FileCheck, FlaskConical,
  AlertTriangle, BookOpen, TrendingUp, Users, BarChart3,
  ChevronRight,
} from 'lucide-react';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import WordReveal from '../../components/motion/WordReveal';
import GradientMark from '../../components/motion/GradientMark';
import SplitPanel from '../../components/sections/SplitPanel';
import SiteFooter from '../../components/sections/SiteFooter';
import AnimatedCounter from '../../components/public/AnimatedCounter';
import { useCmsPage } from '../../lib/useCmsPage';

/* ══════════════════════════════════════════════════════════════════
   ForMedspas — Pearl Mineral V2
   WO-OVERHAUL-03 Phase 3: Site Rebuild
   Brand media: photos 5-8, swatches 1-6, video "blue drops.mp4"
   All stats are DEMO — hardcoded, not DB-connected.
   ══════════════════════════════════════════════════════════════════ */

const FEATURE_CARDS = [
  {
    icon: AlertTriangle,
    title: 'Regulatory Alerts',
    body: 'FDA actions, state licensing changes, and scope-of-practice updates delivered before they affect your operations.',
  },
  {
    icon: BookOpen,
    title: 'Protocol Library',
    body: 'Clinical treatment protocols with ingredient safety data, contraindication flags, and medical director approval workflows.',
  },
  {
    icon: TrendingUp,
    title: 'Treatment Trending',
    body: 'Procedure adoption data across verified medspa operators segmented by region and practice size.',
  },
  {
    icon: FlaskConical,
    title: 'Ingredient Intelligence',
    body: 'Active ingredient performance data, safety profiles, and clinical evidence for every product in your treatment rooms.',
  },
  {
    icon: Users,
    title: 'Peer Benchmarking',
    body: 'Anonymized benchmarks from verified medspa operators. Compare spend, service mix, and vendor performance.',
  },
  {
    icon: BarChart3,
    title: 'Procurement Analytics',
    body: 'Cost-per-treatment analysis, reorder signals, and vendor consolidation opportunities across your entire formulary.',
  },
];

const PROTOCOLS_PREVIEW = [
  {
    title: 'HydraFacial MD Protocol',
    category: 'Medical-Grade Facial',
    description: 'Step-by-step cleanse, peel, extract, and infuse protocol with product pairing and contraindication flags.',
  },
  {
    title: 'Microneedling with PRP',
    category: 'Collagen Induction',
    description: 'Needle depth mapping, PRP preparation standards, and post-treatment care sequencing for optimal outcomes.',
  },
  {
    title: 'Chemical Peel — Medium Depth',
    category: 'Resurfacing',
    description: 'TCA concentration guidelines, Fitzpatrick-aware protocols, and recovery timeline benchmarks.',
  },
];

const METRICS = [
  { value: '340+', label: 'Verified medspa operators' },
  { value: '98%', label: 'Compliance coverage' },
  { value: '12k+', label: 'Treatment signals tracked' },
  { value: '48hr', label: 'Average onboarding' },
];

const SWATCHES = [1, 2, 3, 4, 5, 6];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Socelle for Medical Spas | Clinical Intelligence Platform',
  description:
    'Compliance-aware product sourcing, clinical treatment intelligence, and peer benchmarking for medspa operators.',
  url: 'https://socelle.com/for-medspas',
};

export default function ForMedspas() {
  const { isLive: _cmsLive } = useCmsPage('for-medspas');

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>For Medspas — Socelle</title>
        <meta
          name="description"
          content="Intelligence built for compliance-first medspa operations. Regulatory tracking, clinical trends, and peer benchmarking for medical aesthetics."
        />
        <meta property="og:title" content="Socelle for Medical Spas | Clinical Intelligence Platform" />
        <meta
          property="og:description"
          content="Compliance-aware sourcing, treatment intelligence, and peer benchmarks built for medical aesthetics."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://socelle.com/for-medspas" />
        <meta property="og:image" content="https://socelle.com/og-image.svg" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://socelle.com/for-medspas" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <MainNav />

      {/* ── Hero — Video Background ─────────────────────────────────── */}
      <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden bg-mn-bg">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/brand/blue drops.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-mn-bg/[0.88]"
          aria-hidden="true"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BlockReveal>
            <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-5">
              FOR MEDSPAS
            </p>
          </BlockReveal>
          <WordReveal
            text="Intelligence for Medical Aesthetics"
            as="h1"
            className="font-sans font-semibold text-hero text-graphite mb-7 justify-center max-w-4xl mx-auto"
          />
          <BlockReveal delay={200}>
            <p className="text-body-lg text-graphite/60 max-w-2xl mx-auto mb-10">
              Socelle understands the medspa operating environment — medical director
              oversight, regulatory requirements, and the clinical-grade products your
              treatment rooms demand. Intelligence that respects how you actually operate.
            </p>
          </BlockReveal>
          <BlockReveal delay={350}>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/request-access" className="btn-mineral-primary">
                Request Medspa Access
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link to="/intelligence" className="btn-mineral-secondary">
                Explore Intelligence
              </Link>
            </div>
          </BlockReveal>
        </div>
      </section>

      {/* ── SplitPanel 1: Compliance Intelligence — Photo 5 ─────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <SplitPanel
          imagePosition="right"
          imageSrc="/images/brand/photos/5.svg"
          imageAlt="Clinical skincare products"
          bgColor="bg-mn-surface"
        >
          <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-4">
            COMPLIANCE INTELLIGENCE
          </p>
          <h2 className="font-sans font-semibold text-section text-graphite mb-5">
            <GradientMark>Regulatory tracking</GradientMark> built into every workflow
          </h2>
          <p className="text-body text-graphite/60 mb-6">
            State-by-state scope of practice awareness, FDA classification filtering,
            and medical director approval context. Socelle surfaces the regulatory
            signals that define clinical procurement — before they become compliance risks.
          </p>
          <ul className="space-y-3">
            {['FDA-cleared device categorization', 'Scope of practice alerts by state', 'Ingredient safety signal monitoring'].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-sm text-graphite/70">{item}</span>
              </li>
            ))}
          </ul>
        </SplitPanel>
      </div>

      {/* ── SplitPanel 2: Treatment Analytics — Photo 6 ─────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <SplitPanel
          imagePosition="left"
          imageSrc="/images/brand/photos/6.svg"
          imageAlt="Treatment room products"
          bgColor="bg-accent/5"
        >
          <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-4">
            TREATMENT ANALYTICS
          </p>
          <h2 className="font-sans font-semibold text-section text-graphite mb-5">
            Know what <GradientMark>top practices</GradientMark> are adopting
          </h2>
          <p className="text-body text-graphite/60 mb-6">
            Procedure trending data, pricing benchmarks, and patient demand signals
            from verified medspa operators. Understand what treatments are gaining
            velocity and where the market is moving before your competitors do.
          </p>
          <ul className="space-y-3">
            {['Procedure adoption rates by region', 'Pricing benchmarks across practice sizes', 'Patient demand signals and seasonal patterns'].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Activity className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-sm text-graphite/70">{item}</span>
              </li>
            ))}
          </ul>
        </SplitPanel>
      </div>

      {/* ── SplitPanel 3: Vendor Performance — Photo 7 ──────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <SplitPanel
          imagePosition="right"
          imageSrc="/images/brand/photos/7.svg"
          imageAlt="Professional beauty products"
          bgColor="bg-mn-surface"
        >
          <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-4">
            VENDOR PERFORMANCE
          </p>
          <h2 className="font-sans font-semibold text-section text-graphite mb-5">
            <GradientMark>Supplier quality</GradientMark> you can actually measure
          </h2>
          <p className="text-body text-graphite/60 mb-6">
            Delivery reliability scores, cost signals, and vendor
            consolidation opportunities. Stop guessing which suppliers deserve your
            loyalty and start benchmarking them against verified peer data.
          </p>
          <ul className="space-y-3">
            {['Delivery reliability scoring', 'Cost-per-treatment analysis', 'Vendor consolidation recommendations'].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <FileCheck className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-sm text-graphite/70">{item}</span>
              </li>
            ))}
          </ul>
        </SplitPanel>
      </div>

      {/* ── Protocol Preview — DEMO ─────────────────────────────────── */}
      <section className="bg-mn-surface py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BlockReveal>
            <div className="text-center mb-4">
              <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">
                DEMO
              </span>
            </div>
            <div className="text-center mb-16">
              <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-4">
                PROTOCOL LIBRARY
              </p>
              <h2 className="font-sans font-semibold text-section text-graphite mb-5">
                Evidence-based treatment protocols
              </h2>
              <p className="text-body text-graphite/60 max-w-lg mx-auto">
                Clinical protocols validated by peer outcomes and ingredient science,
                structured for medspa treatment rooms.
              </p>
            </div>
          </BlockReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
            {PROTOCOLS_PREVIEW.map((proto, idx) => (
              <BlockReveal key={proto.title} delay={idx * 100}>
                <div className="bg-white rounded-2xl shadow-sm p-7 h-full">
                  <p className="text-[0.6875rem] tracking-[0.08em] font-medium uppercase text-accent mb-3">
                    {proto.category}
                  </p>
                  <h3 className="font-sans font-semibold text-graphite text-base mb-3">
                    {proto.title}
                  </h3>
                  <p className="text-sm text-graphite/60 leading-relaxed">
                    {proto.description}
                  </p>
                </div>
              </BlockReveal>
            ))}
          </div>

          <div className="text-center">
            <Link to="/protocols" className="btn-mineral-glass">
              Browse All Protocols
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Swatch Strip — Horizontal Scroll ────────────────────────── */}
      <section className="bg-mn-bg py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BlockReveal>
            <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-6 text-center">
              SKINCARE INTELLIGENCE
            </p>
          </BlockReveal>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {SWATCHES.map((num) => (
              <div
                key={num}
                className="flex-shrink-0 w-40 h-40 lg:w-48 lg:h-48 rounded-2xl overflow-hidden bg-mn-surface snap-start"
              >
                <img
                  src={`/images/brand/swatches/${num}.svg`}
                  alt={`Skincare swatch ${num}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Grid ────────────────────────────────────────────── */}
      <section className="bg-mn-surface py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BlockReveal>
            <div className="text-center mb-16">
              <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-4">
                PLATFORM CAPABILITIES
              </p>
              <h2 className="font-sans font-semibold text-section text-graphite mb-5">
                Clinical-grade intelligence tools
              </h2>
              <p className="text-body text-graphite/60 max-w-lg mx-auto">
                Every tool built specifically for the regulatory, clinical, and
                operational demands of medical aesthetic practices.
              </p>
            </div>
          </BlockReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {FEATURE_CARDS.map((card, idx) => (
              <BlockReveal key={card.title} delay={idx * 80}>
                <div className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-2xl p-7 h-full hover:shadow-sm transition-shadow duration-300">
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

      {/* ── Decorative Brand Photo — Photo 8 ────────────────────────── */}
      <section className="bg-mn-bg py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl overflow-hidden max-h-[320px]">
            <img
              src="/images/brand/photos/8.svg"
              alt="Brand imagery"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── Metrics Row — DEMO ──────────────────────────────────────── */}
      <section className="bg-mn-bg py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-8">
            <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">
              DEMO
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {METRICS.map((m, idx) => (
              <BlockReveal key={m.label} delay={idx * 100}>
                <div className="text-center">
                  <p className="font-sans font-semibold text-[2.5rem] lg:text-[3rem] text-graphite leading-none mb-2">
                    <AnimatedCounter value={m.value} />
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

      {/* ── Cross-link ──────────────────────────────────────────────── */}
      <section className="bg-mn-bg py-12 border-y border-graphite/6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-graphite/50 font-sans">
            Not a medspa?{' '}
            <Link
              to="/for-salons"
              className="text-accent font-medium hover:text-accent/80 transition-colors inline-flex items-center gap-1"
            >
              See Socelle for Day Spas and Salons
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>
      </section>

      {/* ── Dark CTA Panel ──────────────────────────────────────────── */}
      <section className="bg-mn-dark rounded-section mx-4 lg:mx-8 py-20 lg:py-28 mb-20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BlockReveal>
            <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-white/40 mb-5">
              CLINICAL PROFESSIONALS
            </p>
            <h2 className="font-sans font-semibold text-section text-white mb-5">
              Operate with confidence
            </h2>
            <p className="text-body text-white/60 max-w-md mx-auto mb-10">
              Intelligence-driven sourcing for medical spa operators, medical
              directors, and clinical aesthetics professionals.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/request-access" className="btn-mineral-accent">
                Request Access
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/intelligence" className="btn-mineral-ghost">
                View Intelligence
              </Link>
            </div>
          </BlockReveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
