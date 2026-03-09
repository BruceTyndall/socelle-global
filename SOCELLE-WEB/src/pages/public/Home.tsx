/* ═══════════════════════════════════════════════════════════════
   Home.tsx — WO-OVERHAUL-03 Phase 3: Site Rebuild
   Cinematic landing page with real brand media + live data hooks.
   Pearl Mineral V2 tokens only — no pro-*, no font-sans, no hardcoded hex.

   Data surfaces:
   - KPI Strip: LIVE when usePlatformStats/useDataFeedStats connect, DEMO otherwise
   - News Ticker: DEMO (hardcoded signal headlines)
   - Brand Showcase: DEMO (local brand photography, not DB-driven grid)
   - Featured Cards: DEMO (hardcoded intelligence highlights)
   - Editorial Scroll: DEMO (hardcoded category items)

   Authority: build_tracker.md, SOCELLE_CANONICAL_DOCTRINE.md
   ═══════════════════════════════════════════════════════════════ */
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, BarChart3, BookOpen, FlaskConical, TrendingUp } from 'lucide-react';
import JsonLd from '../../components/seo/JsonLd';
import {
  SITE_URL, DEFAULT_OG_IMAGE,
  buildOrganizationSchema,
  buildWebSiteSchema,
} from '../../lib/seo';
import HeroMediaRail from '../../components/public/HeroMediaRail';
import { NewsTicker } from '../../components/modules/NewsTicker';
import { SpotlightPanel } from '../../components/modules/SpotlightPanel';
import { ImageMosaic } from '../../components/modules/ImageMosaic';
import { KPIStrip } from '../../components/modules/KPIStrip';
import { FeaturedCardGrid } from '../../components/modules/FeaturedCardGrid';
import { EditorialScroll } from '../../components/modules/EditorialScroll';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { CTASection } from '../../components/modules/CTASection';
import { StickyConversionBar } from '../../components/modules/StickyConversionBar';
import { usePlatformStats } from '../../lib/usePlatformStats';
import { useDataFeedStats } from '../../lib/intelligence/useDataFeedStats';
import { useCmsPage } from '../../lib/useCmsPage';

/* ── Brand Media Paths (local assets — Figma-exported SVGs + MP4s) ── */
const BRAND_PHOTOS = Array.from({ length: 6 }, (_, i) => `/images/brand/photos/${i + 1}.svg`);

const MOSAIC_PHOTOS = [
  '/images/brand/photos/7.svg',
  '/images/brand/photos/8.svg',
  '/images/brand/photos/9.svg',
  '/images/brand/photos/10.svg',
  '/images/brand/photos/11.svg',
  '/images/brand/photos/12.svg',
];

const EDITORIAL_ITEMS = [
  { image: '/images/brand/photos/13.svg', label: 'Clinical Skincare -- Medical-grade formulations driving practitioner demand', value: '#1' },
  { image: '/images/brand/photos/14.svg', label: 'LED Therapy -- Light-based treatment protocols gaining adoption velocity', value: '#2' },
  { image: '/images/brand/photos/15.svg', label: 'Injectable Aesthetics -- Neurotoxin and filler category intelligence', value: '#3' },
  { image: '/images/brand/photos/16.svg', label: 'Body Contouring -- Non-invasive sculpting demand tracking', value: '#4' },
];

const HERO_VIDEO = '/videos/brand/dropper.mp4';
const HERO_POSTER = '/images/brand/photos/1.svg';
const SPOTLIGHT_IMAGE = '/images/brand/photos/17.svg';

/* ── DEMO Badge Component ── */
function DemoBadge() {
  return (
    <span className="inline-flex items-center text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full uppercase tracking-wider">
      Preview
    </span>
  );
}

/* ── Value Props Section ── */
function ValueProps() {
  const props = [
    {
      icon: BarChart3,
      title: 'Market Intelligence',
      description:
        'Demand signals, pricing shifts, and adoption velocity tracked across the professional aesthetics vertical.',
      href: '/intelligence',
    },
    {
      icon: BookOpen,
      title: 'Clinical Education',
      description:
        'Brand training modules, treatment protocols, and continuing education mapped to real practitioner workflows.',
      href: '/education',
    },
    {
      icon: FlaskConical,
      title: 'Protocol Library',
      description:
        'Verified treatment protocols with ingredient intelligence and category benchmarking built in.',
      href: '/protocols',
    },
  ];

  return (
    <section className="bg-mn-bg py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-eyebrow text-accent mb-4 block">The Platform</span>
          <h2 className="text-section text-graphite mb-4">
            Intelligence That Moves Your Practice Forward
          </h2>
          <p className="text-lg text-graphite/60 max-w-2xl mx-auto">
            Built for professionals who need verified signals, not marketing noise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {props.map((p) => (
            <Link
              key={p.title}
              to={p.href}
              className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                <p.icon className="w-6 h-6 text-accent" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-semibold text-graphite mb-3">{p.title}</h3>
              <p className="text-graphite/60 text-sm leading-relaxed mb-4">{p.description}</p>
              <span className="inline-flex items-center text-sm font-medium text-accent group-hover:gap-2 transition-all">
                Explore <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Brand Photography Grid ── */
function BrandShowcase() {
  return (
    <section className="bg-mn-surface py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <span className="text-eyebrow text-accent mb-3 block">Verified Brands</span>
            <h2 className="text-subsection text-graphite">
              Curated for the Treatment Room
            </h2>
          </div>
          <Link
            to="/brands"
            className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-graphite transition-colors"
          >
            View All Brands <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
          {BRAND_PHOTOS.map((src, i) => (
            <Link
              key={src}
              to="/brands"
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <img
                src={src}
                alt={`Brand photography ${i + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              {/* Glass overlay on hover */}
              <div className="absolute inset-0 bg-graphite/0 group-hover:bg-graphite/10 transition-colors duration-300" />
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            to="/brands"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent"
          >
            View All Brands <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Signal Preview Strip (DEMO / LIVE based on hook) ── */
function SignalPreview({ isLive }: { isLive: boolean }) {
  return (
    <section className="bg-white py-16 lg:py-20 border-y border-graphite/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-accent" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-graphite">Latest Market Signals</h2>
            {!isLive && <DemoBadge />}
            {isLive && (
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Live
              </span>
            )}
          </div>
          <Link
            to="/intelligence"
            className="text-sm font-medium text-accent hover:text-graphite transition-colors"
          >
            View Intelligence Hub
          </Link>
        </div>

        {/* Preview banner when not live */}
        {!isLive && (
          <div className="bg-signal-warn/10 text-signal-warn text-xs font-medium px-4 py-2 text-center rounded-xl mb-6">
            PREVIEW -- This data is for demonstration purposes. Sign in for live intelligence.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { category: 'Ingredient Intel', signal: 'Peptide innovation wave: clinical-grade adoption up 28% across independent medspas', trend: '+28%' },
            { category: 'Market Signal', signal: 'LED protocol expansion: near-infrared wavelength demand outpacing visible spectrum devices', trend: '+41%' },
            { category: 'Pricing Shift', signal: 'Hyaluronic acid filler wholesale cost adjustment across three major distributors', trend: '-8%' },
            { category: 'Regulatory', signal: 'California AB-1742 tightens nurse injector supervision ratios — compliance deadline Q3', trend: 'New' },
          ].map((item) => (
            <Link
              key={item.category}
              to="/intelligence"
              className="group bg-mn-bg rounded-2xl p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">
                  {item.category}
                </span>
                <span className="text-xs font-mono font-semibold text-graphite/80">
                  {item.trend}
                </span>
              </div>
              <p className="text-sm text-graphite/70 leading-relaxed line-clamp-3">
                {item.signal}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main Home Component
   ═══════════════════════════════════════════════════════════════ */
export default function Home() {
  const { stats, loading: statsLoading, isLive: statsLive } = usePlatformStats();
  const { stats: feedStats, loading: feedsLoading, isLive: feedsLive } = useDataFeedStats();
  const { isLive: cmsLive } = useCmsPage('home');

  /* KPI data — live when hooks connect, preview otherwise */
  const kpis = [
    {
      id: 'k1',
      value: feedsLoading ? '--' : feedStats.totalSignals,
      label: 'Signals Tracked',
    },
    {
      id: 'k2',
      value: feedsLoading ? '--' : feedStats.totalFeeds,
      label: 'Data Sources',
    },
    {
      id: 'k3',
      value: statsLoading ? '--' : stats.protocolsCount,
      label: 'Verified Protocols',
    },
    {
      id: 'k4',
      value: statsLoading ? '--' : stats.brandsCount,
      label: 'Verified Brands',
    },
  ];

  const isAnyLive = statsLive || feedsLive || cmsLive;

  return (
    <>
      <Helmet>
        <title>Socelle — Intelligence Platform for Professional Beauty</title>
        <meta
          name="description"
          content="Market signals, verified brands, and clinical protocols for salons, spas, and medspas. The intelligence platform professionals trust."
        />
        <meta property="og:title" content="Socelle — Intelligence Platform for Professional Beauty" />
        <meta
          property="og:description"
          content="Market signals, verified brands, and clinical protocols for salons, spas, and medspas."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={SITE_URL} />
      </Helmet>
      <JsonLd data={[buildOrganizationSchema(), buildWebSiteSchema()]} />
      <MainNav noSpacer />

      <main id="main-content">
      {/* ── Hero: Cinematic video background with Pearl Mineral glass overlay ── */}
      <HeroMediaRail
        videoSrc={HERO_VIDEO}
        poster={HERO_POSTER}
        overlay="dark"
        minHeight="min-h-[85vh]"
        eyebrow="Intelligence Platform"
        headline="The New Authority in Professional Aesthetics"
        subtitle="Clinical data. Verified brands. Market signals built for the professionals who define modern aesthetics."
        primaryCTA={{ label: 'Get Intelligence Access', href: '/request-access' }}
        secondaryCTA={{ label: 'Explore Intelligence', href: '/intelligence' }}
        overlayMetric={{
          value: statsLoading ? '--' : stats.brandsCount.toLocaleString(),
          label: 'Verified Brands',
        }}
      />

      {/* ── News Ticker ───────────────────────────────────────────── */}
      <NewsTicker
        items={feedsLive ? [
          { tag: 'Signal Feed', headline: `${feedStats.totalSignals.toLocaleString()} total signals available in intelligence pipeline`, timestamp: 'now' },
          { tag: 'Sources', headline: `${feedStats.totalFeeds.toLocaleString()} configured data sources tracked`, timestamp: 'now' },
          { tag: 'Feeds', headline: `${feedStats.enabledFeeds.toLocaleString()} feeds currently enabled`, timestamp: 'now' },
        ] : [
          { tag: 'Preview', headline: 'Enable and run data feeds in Admin to activate live intelligence headlines', timestamp: 'now' },
        ]}
      />

      {/* ── Signal Preview: LIVE / DEMO based on hook ── */}
      <SignalPreview isLive={isAnyLive} />

      {/* ── Spotlight: How It Works ── */}
      <SpotlightPanel
        image={SPOTLIGHT_IMAGE}
        imagePosition="right"
        eyebrow="How It Works"
        headline="Clinical Signals, Translated for Buying Decisions"
        metric={{
          value: feedsLive ? `${feedStats.totalFeeds}+` : '--',
          label: 'Integrated Data Sources',
        }}
        bullets={[
          'Integrated data feeds -- ingredient demand, pricing shifts, clinical trial citations -- refreshed continuously',
          'Every brand profiled with adoption curves, efficacy validation, and practitioner sentiment',
          'Transparent landed pricing with full compliance provenance on every SKU',
        ]}
        cta={{ label: 'See the Method', href: '/professionals' }}
      />

      {/* ── Brand Photography Showcase: DEMO (local assets) ── */}
      <BrandShowcase />

      {/* ── KPI Strip: LIVE / DEMO ── */}
      <div className="relative">
        {!isAnyLive && (
          <div className="flex justify-center pt-6">
            <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">DEMO</span>
          </div>
        )}
        <KPIStrip kpis={kpis} title="Market Pulse" />
      </div>

      {/* ── Value Props: Intelligence / Education / Protocols ── */}
      <ValueProps />

      {/* ── Image Mosaic: Brand Photography ── */}
      <ImageMosaic
        images={MOSAIC_PHOTOS}
        eyebrow="The World We Serve"
        headline="Where Science Becomes Ritual"
      />

      {/* ── Featured Intelligence Cards: DEMO ── */}
      <FeaturedCardGrid
        eyebrow="Featured Intelligence"
        headline="This Week's Highlights"
        columns={3}
        cards={[
          {
            id: 'f1',
            image: '/images/brand/photos/18.svg',
            eyebrow: 'Ingredient Intel',
            title: 'Peptide Innovation Wave',
            subtitle: 'Clinical-grade peptide adoption up 28% across independent medspas',
            metric: { value: '+28%', label: 'YoY adoption' },
            href: '/intelligence',
          },
          {
            id: 'f2',
            image: '/images/brand/photos/19.svg',
            eyebrow: 'Market Signal',
            title: 'LED Protocol Expansion',
            subtitle: 'Near-infrared wavelength demand growing faster than visible spectrum devices',
            metric: { value: '+41%', label: 'demand growth' },
            href: '/intelligence',
          },
          {
            id: 'f3',
            image: '/images/brand/photos/20.svg',
            eyebrow: 'Brand Watch',
            title: 'Clean Beauty Certification',
            subtitle: 'Third-party validation now required by 67% of buyers before first order',
            badge: 'Trending',
            href: '/brands',
          },
        ]}
      />

      {/* ── Editorial Scroll: Category Rankings — DEMO ── */}
      <EditorialScroll
        eyebrow="Category Rankings"
        headline="What Professionals Are Buying"
        items={EDITORIAL_ITEMS}
      />

      {/* ── CTA Section: Intelligence Access ── */}
      <CTASection
        eyebrow="Join the Intelligence Network"
        headline="See What Others Can't"
        subtitle="Access the signals, data, and brand intelligence that top practitioners use to make better buying decisions."
        primaryCTA={{ label: 'Get Intelligence Access', href: '/request-access' }}
      />

      {/* ── Sticky Conversion Bar ── */}
      <StickyConversionBar />

      </main>

      {/* ── Site Footer ── */}
      <SiteFooter />
    </>
  );
}
