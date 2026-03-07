/* ═══════════════════════════════════════════════════════════════
   ForBrands.tsx — "For Brands" Landing Page
   WO-OVERHAUL-03 Phase 3 rebuild
   Data: usePlatformStats() live counts with explicit preview fallback
   Pearl Mineral V2 tokens only — no pro-*, no font-serif
   Uses brand media from /images/brand/ and /videos/brand/
   ═══════════════════════════════════════════════════════════════ */
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import JsonLd from '../../components/seo/JsonLd';
import { DEFAULT_OG_IMAGE, buildCanonical, buildWebPageSchema } from '../../lib/seo';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  FlaskConical,
  Users,
  TrendingUp,
  Shield,
} from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import BlockReveal from '../../components/motion/BlockReveal';
import WordReveal from '../../components/motion/WordReveal';
import { usePlatformStats } from '../../lib/usePlatformStats';
import { useCmsPage } from '../../lib/useCmsPage';

// ─── Brand Media ──────────────────────────────────────────────────────────────

const HERO_VIDEO = '/videos/brand/foundation.mp4';
const HERO_POSTER = '/images/brand/photos/1.svg';

const VALUE_PROP_IMAGES = [
  '/images/brand/photos/2.svg',
  '/images/brand/photos/3.svg',
  '/images/brand/photos/4.svg',
];

const SUCCESS_PHOTOS = [19, 20, 21, 22, 23].map(
  (n) => `/images/brand/photos/${n}.svg`
);

const SWATCH_ROW = [7, 8, 9, 10, 11, 12].map(
  (n) => `/images/brand/swatches/${n}.svg`
);

// ─── Value Propositions ───────────────────────────────────────────────────────

const VALUE_PROPS = [
  {
    icon: BarChart3,
    title: 'Intelligence Exposure',
    description:
      'Your brand profiled with adoption curves, practitioner sentiment, and competitive positioning -- visible to every operator on the platform.',
    image: VALUE_PROP_IMAGES[0],
  },
  {
    icon: BookOpen,
    title: 'Education Platform',
    description:
      'Publish training modules, certifications, and treatment protocols directly to the practitioners who stock your products.',
    image: VALUE_PROP_IMAGES[1],
  },
  {
    icon: FlaskConical,
    title: 'Protocol Integration',
    description:
      'Your formulations embedded in canonical treatment protocols -- recommended by the intelligence layer, not by ad spend.',
    image: VALUE_PROP_IMAGES[2],
  },
];

// ─── Platform Differentiators ─────────────────────────────────────────────────

const DIFFERENTIATORS = [
  {
    icon: TrendingUp,
    label: 'Adoption Velocity',
    detail: 'Track how fast practitioners adopt and reorder your products across regions.',
  },
  {
    icon: Users,
    label: 'Practitioner Reach',
    detail: 'Connect with licensed estheticians, spa owners, medspa operators, and clinic buyers.',
  },
  {
    icon: Shield,
    label: 'Verified Distribution',
    detail: 'Every transaction verified. No gray market. Professional-only access enforced.',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ForBrands() {
  const { stats, loading: statsLoading, isLive } = usePlatformStats();
  const { isLive: cmsLive } = useCmsPage('for-brands');
  const isPageLive = isLive || cmsLive;

  return (
    <div className="min-h-screen bg-mn-bg">
      <Helmet>
        <title>For Brands | Amplify with Intelligence | Socelle</title>
        <meta name="description" content="Reach evidence-driven practitioners through intelligence -- not ads. Brand profiles, education tools, and protocol integration for professional beauty brands." />
        <meta property="og:title" content="For Brands | Socelle" />
        <meta property="og:description" content="Intelligence-first brand exposure to licensed practitioners. Adoption data, education platform, and protocol integration." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={buildCanonical('/for-brands')} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={buildCanonical('/for-brands')} />
      </Helmet>
      <JsonLd data={buildWebPageSchema({
        name: 'For Brands | Socelle',
        description: 'Reach evidence-driven practitioners through intelligence. Brand profiles, education tools, and protocol integration.',
        url: buildCanonical('/for-brands'),
      })} />
      <MainNav />

      {/* ══════════════════════════════════════════════════════════
          HERO — Video Background + Glass Overlay
          ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-graphite min-h-[90vh] flex items-center">
        {/* Video background */}
        <video
          className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-luminosity"
          src={HERO_VIDEO}
          poster={HERO_POSTER}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-graphite/50 via-graphite/75 to-graphite" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 text-center">
          <BlockReveal>
            <p className="text-[0.8125rem] uppercase tracking-[0.12em] font-medium text-accent font-sans mb-4">
              Brand Intelligence
            </p>
          </BlockReveal>
          <WordReveal
            text="Amplify Your Brand with Intelligence"
            as="h1"
            className="font-sans font-semibold text-hero text-white mb-5 justify-center"
          />
          <BlockReveal delay={200}>
            <p className="text-white/55 font-sans text-body max-w-2xl mx-auto mb-10">
              Reach practitioners who buy on evidence. Your brand profiled with adoption data,
              clinical validation, and practitioner sentiment -- updated continuously.
            </p>
          </BlockReveal>
          <BlockReveal delay={350}>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/request-access"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-sm font-sans font-medium tracking-wide hover:bg-white/25 transition-all duration-300"
              >
                Join as a Brand Partner
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/brands"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/15 text-white/70 text-sm font-sans font-medium tracking-wide hover:text-white hover:border-white/30 transition-all duration-300"
              >
                Explore the Directory
              </Link>
            </div>
          </BlockReveal>

          {/* Platform stat chips */}
          <BlockReveal delay={500}>
            <div className="flex flex-wrap justify-center gap-6 mt-12">
              {[
                { value: statsLoading ? '--' : stats.brandsCount.toLocaleString(), label: 'Verified Brands' },
                { value: statsLoading ? '--' : stats.operatorsCount.toLocaleString(), label: 'Active Practitioners' },
                { value: statsLoading ? '--' : stats.protocolsCount.toLocaleString(), label: 'Protocols' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-sans font-semibold text-white">{stat.value}</p>
                  <p className="text-xs font-sans text-white/45 mt-0.5">{stat.label}</p>
                </div>
              ))}
              {/* DEMO / LIVE label */}
              <span className={`self-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${isPageLive ? 'bg-signal-up/10 text-signal-up' : 'bg-signal-warn/10 text-signal-warn'}`}>
                {isPageLive ? 'LIVE' : 'DEMO'}
              </span>
            </div>
          </BlockReveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          VALUE PROPOSITIONS — 3 Columns
          ══════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[0.8125rem] uppercase tracking-[0.12em] font-medium text-accent font-sans mb-3">
              Why partner with Socelle
            </p>
            <h2 className="font-sans font-semibold text-3xl lg:text-4xl text-graphite mb-4">
              Intelligence-first brand distribution
            </h2>
            <p className="font-sans text-graphite/60 max-w-2xl mx-auto text-sm leading-relaxed">
              Practitioners discover your brand through data and evidence, not ad impressions.
              Three integrated channels work together to build trust and drive procurement.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {VALUE_PROPS.map((prop) => {
              const Icon = prop.icon;
              return (
                <div
                  key={prop.title}
                  className="bg-white rounded-2xl shadow-sm border border-graphite/8 overflow-hidden group hover:shadow-md transition-shadow duration-300"
                >
                  {/* Image header */}
                  <div className="h-48 overflow-hidden">
                    <img
                      src={prop.image}
                      alt=""
                      aria-hidden="true"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="font-sans font-semibold text-lg text-graphite mb-2">
                      {prop.title}
                    </h3>
                    <p className="font-sans text-graphite/60 text-sm leading-relaxed">
                      {prop.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          DIFFERENTIATORS — Horizontal strip
          ══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-16 border-y border-graphite/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-10">
            {DIFFERENTIATORS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-mn-surface flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-graphite" />
                  </div>
                  <div>
                    <h3 className="font-sans font-semibold text-graphite text-sm mb-1">
                      {item.label}
                    </h3>
                    <p className="font-sans text-graphite/60 text-sm leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          BRAND SUCCESS STORIES — Photo Grid (Decorative)
          ══════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[0.8125rem] uppercase tracking-[0.12em] font-medium text-accent font-sans mb-3">
              The Socelle Network
            </p>
            <h2 className="font-sans font-semibold text-3xl lg:text-4xl text-graphite mb-4">
              Where brands meet evidence
            </h2>
            <p className="font-sans text-graphite/60 max-w-xl mx-auto text-sm leading-relaxed">
              Brands in the Socelle network are profiled, compared, and recommended by data --
              building trust that converts to procurement.
            </p>
          </div>

          {/* Photo mosaic */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 rounded-2xl overflow-hidden">
            {SUCCESS_PHOTOS.map((src, i) => (
              <div
                key={i}
                className={`overflow-hidden ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
              >
                <img
                  src={src}
                  alt=""
                  aria-hidden="true"
                  className="w-full h-full object-cover aspect-square hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            ))}
          </div>

          {/* Swatch strip */}
          <div className="flex justify-center gap-3 mt-8">
            {SWATCH_ROW.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                aria-hidden="true"
                className="w-8 h-8 rounded-full border border-graphite/12 object-cover"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          VIDEO FEATURE — Secondary Video
          ══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Video */}
            <div className="rounded-2xl overflow-hidden shadow-sm">
              <video
                className="w-full aspect-video object-cover"
                src="/videos/brand/tube.mp4"
                poster="/images/brand/photos/5.svg"
                autoPlay
                muted
                loop
                playsInline
              />
            </div>
            {/* Copy */}
            <div>
              <p className="text-[0.8125rem] uppercase tracking-[0.12em] font-medium text-accent font-sans mb-3">
                Intelligence Dashboard
              </p>
              <h2 className="font-sans font-semibold text-3xl text-graphite mb-4">
                Your brand, through the lens of data
              </h2>
              <p className="font-sans text-graphite/60 text-sm leading-relaxed mb-6">
                See which practitioners stock your products, track reorder patterns, and understand
                how your brand compares on price, efficacy perception, and category share.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Adoption curves and practitioner sentiment by region',
                  'Competitive positioning and category share analysis',
                  'Custom monthly reports with procurement recommendations',
                ].map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2 text-sm font-sans text-graphite/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                    {bullet}
                  </li>
                ))}
              </ul>
              <Link
                to="/intelligence"
                className="btn-mineral-accent inline-flex items-center gap-2"
              >
                See Market Intelligence
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CTA — Join as a Brand Partner
          ══════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-graphite rounded-2xl p-10 sm:p-14 text-center shadow-sm relative overflow-hidden">
            {/* Decorative video background */}
            <video
              className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-luminosity"
              src="/videos/brand/yellow drops.mp4"
              autoPlay
              muted
              loop
              playsInline
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-graphite/40 to-graphite/90" />
            <div className="relative z-10">
              <p className="text-[0.8125rem] uppercase tracking-[0.12em] font-medium text-accent font-sans mb-4">
                Partner with us
              </p>
              <h2 className="font-sans font-semibold text-3xl lg:text-4xl text-white mb-4">
                Put your brand in front of evidence-driven buyers
              </h2>
              <p className="font-sans text-white/55 mb-8 max-w-xl mx-auto text-sm leading-relaxed">
                Join the intelligence network where practitioners discover, evaluate, and procure
                based on data -- not marketing. Application takes under 5 minutes.
              </p>
              <Link
                to="/request-access"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-sm font-sans font-medium tracking-wide hover:bg-white/25 transition-all duration-300"
              >
                Join as a Brand Partner
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
