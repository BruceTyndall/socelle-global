import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight, Shield, FileCheck, Activity, FlaskConical,
  BarChart3, Users, AlertTriangle, BookOpen, TrendingUp,
  ChevronRight,
} from 'lucide-react';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import WordReveal from '../../components/motion/WordReveal';
import GradientMark from '../../components/motion/GradientMark';
import SplitPanel from '../../components/sections/SplitPanel';
import SiteFooter from '../../components/sections/SiteFooter';

/* ══════════════════════════════════════════════════════════════════
   ForMedspas — Liquid Glass Visual System
   Compliance-aware intelligence for medical aesthetics operators
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
    body: 'Real-time procedure adoption data across verified medspa operators segmented by region and practice size.',
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
    body: 'Cost-per-treatment analysis, reorder optimization, and vendor consolidation opportunities across your entire formulary.',
  },
];

const METRICS = [
  { value: '340+', label: 'Verified medspa operators' },
  { value: '98%', label: 'Compliance coverage' },
  { value: '12k+', label: 'Treatment signals tracked' },
  { value: '48hr', label: 'Average onboarding' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Socelle for Medical Spas | Clinical Intelligence Platform',
  description:
    'Compliance-aware product sourcing, clinical treatment intelligence, and peer benchmarking for medspa operators.',
  url: 'https://socelle.com/for-medspas',
};

export default function ForMedspas() {
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
        <link rel="canonical" href="https://socelle.com/for-medspas" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <MainNav />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden bg-mn-bg">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/air-bubbles.mp4"
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
              FOR MEDSPAS
            </p>
          </BlockReveal>
          <WordReveal
            text="Intelligence built for compliance-first operations"
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

      {/* ── SplitPanel 1: Compliance Intelligence ─────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <SplitPanel imagePosition="right" bgColor="bg-mn-surface">
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

      {/* ── SplitPanel 2: Treatment Analytics ─────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <SplitPanel imagePosition="left" bgColor="bg-accent/5">
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

      {/* ── SplitPanel 3: Vendor Performance ──────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <SplitPanel imagePosition="right" bgColor="bg-mn-surface">
          <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-4">
            VENDOR PERFORMANCE
          </p>
          <h2 className="font-sans font-semibold text-section text-graphite mb-5">
            <GradientMark>Supplier quality</GradientMark> you can actually measure
          </h2>
          <p className="text-body text-graphite/60 mb-6">
            Delivery reliability scores, cost optimization signals, and vendor
            consolidation opportunities. Stop guessing which suppliers deserve your
            loyalty and start benchmarking them against verified peer data.
          </p>
          <ul className="space-y-3">
            {['Delivery reliability scoring', 'Cost-per-treatment optimization', 'Vendor consolidation recommendations'].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <FileCheck className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
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
      <section className="bg-mn-bg py-12 border-y border-[rgba(30,37,43,0.06)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-graphite/50 font-sans">
            Not a medspa?{' '}
            <Link
              to="/for-salons"
              className="text-accent font-medium hover:text-accent-hover transition-colors inline-flex items-center gap-1"
            >
              See Socelle for Day Spas and Salons
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
              CLINICAL PROFESSIONALS
            </p>
            <h2 className="font-sans font-semibold text-section text-[#F7F5F2] mb-5">
              Operate with confidence
            </h2>
            <p className="text-body text-[rgba(247,245,242,0.65)] max-w-md mx-auto mb-10">
              Intelligence-driven sourcing for medical spa operators, medical
              directors, and clinical aesthetics professionals.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/request-access"
                className="inline-flex items-center justify-center gap-2 bg-[#F7F5F2] text-[#1F2428] rounded-full h-[52px] px-7 font-sans font-medium text-sm hover:scale-[1.01] transition-all duration-200"
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
