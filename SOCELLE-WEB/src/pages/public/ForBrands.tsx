import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight, PieChart, Target, Users, Megaphone,
  Map, DollarSign,
} from 'lucide-react';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import WordReveal from '../../components/motion/WordReveal';
import GradientMark from '../../components/motion/GradientMark';
import SplitPanel from '../../components/sections/SplitPanel';
import SiteFooter from '../../components/sections/SiteFooter';

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

// ── Stats row ───────────────────────────────────────────────────
const STATS = [
  { value: '500+', label: 'Licensed operators' },
  { value: '92%', label: 'Revenue to you' },
  { value: '68%', label: 'Average reorder rate' },
  { value: '48h', label: 'Application review' },
];

export default function ForBrands() {
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

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative py-20 lg:py-28 overflow-hidden bg-mn-bg">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/tube.mp4"
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
                FOR BRANDS
              </p>
            </BlockReveal>
            <WordReveal
              text="For Brands"
              as="h1"
              className="font-sans font-semibold text-hero text-graphite mb-7 justify-center"
            />
            <BlockReveal delay={200}>
              <p className="text-body-lg text-[rgba(30,37,43,0.62)] max-w-2xl mx-auto mb-10">
                SOCELLE already tracks your footprint. Claim your page to control your narrative, publish education, and convert demand into orders.
              </p>
            </BlockReveal>
            <BlockReveal delay={350}>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/brand/apply" className="btn-mineral-primary">
                  Claim Your Brand Page
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <Link to="/brand/apply" className="btn-mineral-secondary">
                  Request Brand Access
                </Link>
              </div>
            </BlockReveal>
          </div>
        </div>
      </section>

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
        <p className="text-body text-[rgba(30,37,43,0.62)] mb-6">
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
        <p className="text-body text-[rgba(30,37,43,0.62)] mb-6">
          Target operators by segment, location, and purchase history. Multi-step
          campaigns with audience segmentation, scheduling, and performance
          tracking tied to real operator conversions and reorder revenue.
        </p>
        <Link to="/brand/apply" className="inline-flex items-center gap-1.5 text-accent font-sans font-medium text-sm hover:text-accent-hover transition-colors">
          See campaign tools
          <ArrowRight className="w-4 h-4" />
        </Link>
      </SplitPanel>

      {/* ── Feature Grid ─────────────────────────────────────────── */}
      <section className="bg-mn-bg py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <BlockReveal>
              <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-4">
                Brand Intelligence Suite
              </p>
            </BlockReveal>
            <BlockReveal delay={100}>
              <h2 className="font-sans font-semibold text-section text-graphite mb-5">
                Everything you need to grow your channel
              </h2>
            </BlockReveal>
            <BlockReveal delay={200}>
              <p className="text-body text-[rgba(30,37,43,0.62)] max-w-lg mx-auto">
                Six intelligence layers that turn market data into distribution
                growth for professional beauty brands.
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
