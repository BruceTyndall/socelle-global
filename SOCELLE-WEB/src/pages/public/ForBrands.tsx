import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight, PieChart, Target, Users, Megaphone,
  Map, DollarSign,
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
   ForBrands — Liquid Glass Visual System
   Intelligence-driven distribution for professional beauty brands
   ══════════════════════════════════════════════════════════════════ */

// ── Feature grid cards ──────────────────────────────────────────
const FEATURES = [
  {
    icon: PieChart,
    title: 'Portfolio Analytics',
    body: 'Revenue by SKU, region, and operator segment. See which products drive reorders and where white space exists in your catalog.',
  },
  {
    icon: Target,
    title: 'Market Positioning',
    body: 'Category-level benchmarks showing your share, growth trajectory, and competitive landscape relative to peer brands.',
  },
  {
    icon: Users,
    title: 'Operator Insights',
    body: 'Understand who is buying, who stopped, and who is primed for outreach. Pipeline management built for professional beauty.',
  },
  {
    icon: Megaphone,
    title: 'Campaign Intelligence',
    body: 'Multi-step campaign creation with audience segmentation, A/B testing, and performance tracking tied to real conversions.',
  },
  {
    icon: Map,
    title: 'Distribution Mapping',
    body: 'Geographic visualization of your reseller network. Identify underserved territories and high-density opportunity clusters.',
  },
  {
    icon: DollarSign,
    title: 'Revenue Attribution',
    body: 'Connect marketing spend to operator acquisition and reorder revenue. Know exactly which campaigns drive pipeline value.',
  },
];

export default function ForBrands() {
  /* W12-32: Live platform stats */
  const { stats, isLive: statsLive } = usePlatformStats();
  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>For Brands — Socelle</title>
        <meta
          name="description"
          content="Intelligence-driven distribution for professional beauty brands. Market position data, reseller insights, and campaign tools on one platform."
        />
        <meta property="og:title" content="For Brands — Socelle" />
        <meta
          property="og:description"
          content="See how the professional market perceives your portfolio. Reach verified operators through data, not cold outreach."
        />
        <link rel="canonical" href="https://socelle.com/for-brands" />
      </Helmet>
      <MainNav />

      {/* ── Hero (HeroMediaRail — W12-26) ──────────────────────────── */}
      <HeroMediaRail
        videoSrc="/videos/tube.mp4"
        poster="/videos/posters/tube-poster.jpg"
        overlay="light"
        minHeight="70svh"
        headline="For Brands"
        subtitle="SOCELLE already tracks your footprint. Claim your page to control your narrative, publish education, and convert demand into orders."
        eyebrow={<p className="mn-eyebrow">FOR BRANDS</p>}
        cta={
          <>
            <Link to="/brand/apply" className="btn-mineral-primary">
              Claim Your Brand Page
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link to="/brand/apply" className="btn-mineral-secondary">
              Request Brand Access
            </Link>
          </>
        }
      />

      {/* ── SplitPanel 1: Market Position ─────────────────────────── */}
      <SplitPanel imagePosition="right" bgColor="bg-mn-surface" className="mx-4 lg:mx-8 mb-6">
        <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-4">
          Market Position
        </p>
        <h2 className="font-sans font-semibold text-section text-graphite mb-5">
          Competitive landscape,{' '}
          <GradientMark>share of wallet</GradientMark>,{' '}
          brand perception
        </h2>
        <p className="text-body text-[rgba(20,20,24,0.62)] mb-6">
          Understand where your brand stands in every category you compete in.
          Category-level benchmarks reveal your share, growth trajectory, and the
          competitive landscape — so you know exactly where to invest.
        </p>
        <Link to="/request-access" className="inline-flex items-center gap-1.5 text-accent font-sans font-medium text-sm hover:text-accent-hover transition-colors">
          See your position
          <ArrowRight className="w-4 h-4" />
        </Link>
      </SplitPanel>

      {/* ── SplitPanel 2: Reseller Intelligence (dark) ────────────── */}
      <SplitPanel imagePosition="left" bgColor="bg-mn-dark" className="mx-4 lg:mx-8 mb-6">
        <div className="text-[#F7F5F2]">
          <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-[rgba(247,245,242,0.45)] mb-4">
            Reseller Intelligence
          </p>
          <h2 className="font-sans font-semibold text-section mb-5">
            Operator adoption, geographic distribution, activation patterns
          </h2>
          <p className="text-body text-[rgba(247,245,242,0.55)] mb-6">
            See who is buying, who stopped, and who is primed for outreach.
            Map your reseller network geographically. Identify underserved
            territories and high-density opportunity clusters in real time.
          </p>
          <Link to="/brand/apply" className="inline-flex items-center gap-1.5 text-accent font-sans font-medium text-sm hover:text-accent-hover transition-colors">
            Explore reseller data
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </SplitPanel>

      {/* ── SplitPanel 3: Campaign Performance ────────────────────── */}
      <SplitPanel imagePosition="right" bgColor="bg-mn-surface" className="mx-4 lg:mx-8 mb-6">
        <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-4">
          Campaign Performance
        </p>
        <h2 className="font-sans font-semibold text-section text-graphite mb-5">
          ROI tracking,{' '}
          <GradientMark>A/B testing</GradientMark>,{' '}
          conversion analytics
        </h2>
        <p className="text-body text-[rgba(20,20,24,0.62)] mb-6">
          Target operators by segment, location, and purchase history. Multi-step
          campaigns with audience segmentation, scheduling, and performance
          tracking tied to real operator conversions and reorder revenue.
        </p>
        <Link to="/brand/apply" className="inline-flex items-center gap-1.5 text-accent font-sans font-medium text-sm hover:text-accent-hover transition-colors">
          See campaign tools
          <ArrowRight className="w-4 h-4" />
        </Link>
      </SplitPanel>

      {/* ── Brand Intelligence (EvidenceStrip — W12-26) ───────────── */}
      <EvidenceStrip
        title="Brand Intelligence Suite"
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
        videoSrc="/videos/yellow-drops.mp4"
        poster="/videos/posters/yellow-drops-poster.jpg"
        mediaPosition="right"
        bg="surface"
      >
        <BlockReveal>
          <p className="mn-eyebrow mb-4">Brand Intelligence Suite</p>
          <h2 className="font-sans font-semibold text-section text-graphite mb-6">
            Everything you need to grow your channel
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
          { label: 'Licensed operators', value: `${stats.operatorsCount}+`, source: statsLive ? 'Live' : 'Preview' },
          { label: 'Revenue to you', value: '92%', source: 'Terms' },
          { label: 'Average reorder rate', value: '68%', source: 'Preview' },
          { label: 'Application review', value: '48h', source: 'SLA' },
        ]}
      />

      {/* ── Dark CTA ─────────────────────────────────────────────── */}
      <section className="bg-mn-dark rounded-section mx-4 lg:mx-8 py-24 lg:py-32 my-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BlockReveal>
            <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-[rgba(247,245,242,0.45)] mb-5">
              BRAND PARTNERS
            </p>
          </BlockReveal>
          <BlockReveal delay={100}>
            <h2 className="font-sans font-semibold text-section text-[#F7F5F2] mb-5">
              Elevate your brand intelligence
            </h2>
          </BlockReveal>
          <BlockReveal delay={200}>
            <p className="text-body text-[rgba(247,245,242,0.55)] max-w-md mx-auto mb-10">
              Join the intelligence platform connecting professional beauty brands
              with verified operators. 92/8 commission model planned. No listing fees. No monthly charges.
            </p>
          </BlockReveal>
          <BlockReveal delay={300}>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/brand/apply" className="btn-mineral-dark">
                Apply as Brand Partner
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
