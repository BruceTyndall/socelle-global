import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight, Brain, BookOpen, GraduationCap, Award,
  ChevronRight, Sparkles,
} from 'lucide-react';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import WordReveal from '../../components/motion/WordReveal';
import GradientMark from '../../components/motion/GradientMark';
import SiteFooter from '../../components/sections/SiteFooter';
import AnimatedCounter from '../../components/public/AnimatedCounter';
import { useCmsPage } from '../../lib/useCmsPage';

/* ══════════════════════════════════════════════════════════════════
   Professionals — Pearl Mineral V2
   WO-OVERHAUL-03 Phase 3: Site Rebuild
   All stats are DEMO — hardcoded, not DB-connected.
   ══════════════════════════════════════════════════════════════════ */

const AUDIENCE_CARDS = [
  {
    title: 'Estheticians',
    description: 'Ingredient intelligence, treatment protocols, and continuing education designed for licensed skin care professionals.',
    href: '/for-salons',
    image: '/images/brand/photos/1.svg',
  },
  {
    title: 'Medspa Practitioners',
    description: 'Compliance-aware sourcing, clinical treatment data, and peer benchmarks built for medical aesthetics operators.',
    href: '/for-medspas',
    image: '/images/brand/photos/2.svg',
  },
  {
    title: 'Salon Professionals',
    description: 'Product trending, service benchmarks, and growth analytics for salon and day spa operators.',
    href: '/for-salons',
    image: '/images/brand/photos/3.svg',
  },
];

const FEATURES = [
  {
    icon: Brain,
    title: 'Intelligence Access',
    description: 'Market signals, ingredient demand data, and category adoption curves structured for professional decision-making.',
  },
  {
    icon: BookOpen,
    title: 'Protocol Library',
    description: 'Evidence-based treatment protocols with product pairing intelligence and clinical adoption tracking.',
  },
  {
    icon: GraduationCap,
    title: 'Education Modules',
    description: 'Brand training content, ingredient science, and application technique libraries from verified manufacturers.',
  },
  {
    icon: Award,
    title: 'Continuing Education',
    description: 'Track CE credits, access accredited coursework, and stay current with evolving treatment standards.',
  },
];

const METRICS = [
  { value: '340+', label: 'Verified practitioners' },
  { value: '47', label: 'Active protocols' },
  { value: '200+', label: 'Data sources monitored' },
  { value: '96%', label: 'Signal confidence' },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Socelle for Beauty & Wellness Professionals',
  description:
    'Intelligence, protocols, and education for licensed estheticians, medspa practitioners, and salon professionals.',
  url: 'https://socelle.com/professionals',
};

export default function Professionals() {
  const { isLive: _cmsLive } = useCmsPage('professionals');

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>For Professionals — Socelle</title>
        <meta
          name="description"
          content="Intelligence, protocols, and education for licensed estheticians, medspa practitioners, and salon professionals."
        />
        <meta property="og:title" content="Socelle for Beauty & Wellness Professionals" />
        <meta
          property="og:description"
          content="Market intelligence and clinical protocols built for beauty and wellness professionals."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://socelle.com/professionals" />
        <meta property="og:image" content="https://socelle.com/og-image.svg" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://socelle.com/professionals" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <MainNav />

      {/* ── Hero — Video Background ─────────────────────────────────── */}
      <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden bg-mn-bg">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/brand/dropper.mp4"
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
              FOR PROFESSIONALS
            </p>
          </BlockReveal>
          <WordReveal
            text="For Beauty & Wellness Professionals"
            as="h1"
            className="font-sans font-semibold text-hero text-graphite mb-7 justify-center max-w-4xl mx-auto"
          />
          <BlockReveal delay={200}>
            <p className="text-body-lg text-graphite/60 max-w-2xl mx-auto mb-10">
              Intelligence, protocols, and continuing education built for
              licensed practitioners who refuse to buy blind or treat without data.
            </p>
          </BlockReveal>
          <BlockReveal delay={350}>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/request-access" className="btn-mineral-primary">
                Get Intelligence Access
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link to="/intelligence" className="btn-mineral-secondary">
                Explore Intelligence
              </Link>
            </div>
          </BlockReveal>
        </div>
      </section>

      {/* ── Decorative Brand Photo ──────────────────────────────────── */}
      <section className="bg-mn-bg py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl overflow-hidden max-h-[320px]">
            <img
              src="/images/brand/photos/4.svg"
              alt="Brand imagery"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── Audience Cards ──────────────────────────────────────────── */}
      <section className="bg-mn-bg py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BlockReveal>
            <div className="text-center mb-16">
              <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-4">
                WHO WE SERVE
              </p>
              <h2 className="font-sans font-semibold text-section text-graphite mb-5">
                Intelligence for every <GradientMark>treatment room</GradientMark>
              </h2>
              <p className="text-body text-graphite/60 max-w-lg mx-auto">
                Whether you operate a medical spa, day spa, or salon — Socelle
                delivers the market data that informs better purchasing and treatment decisions.
              </p>
            </div>
          </BlockReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {AUDIENCE_CARDS.map((card, idx) => (
              <BlockReveal key={card.title} delay={idx * 100}>
                <Link
                  to={card.href}
                  className="group block bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  <div className="h-48 overflow-hidden bg-mn-surface">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-7">
                    <h3 className="font-sans font-semibold text-graphite text-lg mb-2 flex items-center gap-2">
                      {card.title}
                      <ChevronRight className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-sm text-graphite/60 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </Link>
              </BlockReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ───────────────────────────────────────────── */}
      <section className="bg-mn-surface py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BlockReveal>
            <div className="text-center mb-16">
              <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-4">
                PLATFORM CAPABILITIES
              </p>
              <h2 className="font-sans font-semibold text-section text-graphite mb-5">
                Built for professional practitioners
              </h2>
              <p className="text-body text-graphite/60 max-w-lg mx-auto">
                Every tool structured for the clinical, regulatory, and operational
                demands of licensed beauty and wellness professionals.
              </p>
            </div>
          </BlockReveal>

          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {FEATURES.map((feat, idx) => (
              <BlockReveal key={feat.title} delay={idx * 80}>
                <div className="bg-white/60 backdrop-blur-xl border border-white/30 rounded-2xl p-7 h-full hover:shadow-sm transition-shadow duration-300">
                  <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                    <feat.icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-sans font-semibold text-graphite text-base mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-graphite/60 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </BlockReveal>
            ))}
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

      {/* ── Cross-links ─────────────────────────────────────────────── */}
      <section className="bg-mn-bg py-12 border-y border-graphite/6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-center gap-x-10 gap-y-3">
          <Link
            to="/for-medspas"
            className="text-sm text-accent font-medium hover:text-accent/80 transition-colors inline-flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            For Medical Spas
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/for-salons"
            className="text-sm text-accent font-medium hover:text-accent/80 transition-colors inline-flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            For Salons &amp; Day Spas
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* ── Dark CTA Panel ──────────────────────────────────────────── */}
      <section className="bg-mn-dark rounded-section mx-4 lg:mx-8 py-20 lg:py-28 mb-20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BlockReveal>
            <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-white/40 mb-5">
              LICENSED PROFESSIONALS
            </p>
            <h2 className="font-sans font-semibold text-section text-white mb-5">
              Make every decision with data
            </h2>
            <p className="text-body text-white/60 max-w-md mx-auto mb-10">
              Intelligence-driven sourcing, protocols, and education for
              estheticians, medspa operators, and salon professionals.
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
