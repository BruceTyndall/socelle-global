import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Target, Users, Eye, Shield } from 'lucide-react';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import WordReveal from '../../components/motion/WordReveal';
import SplitPanel from '../../components/sections/SplitPanel';
import SiteFooter from '../../components/sections/SiteFooter';
import { useCmsPage } from '../../lib/useCmsPage';

/* ── Values ──────────────────────────────────────────────────── */
const VALUES = [
  {
    icon: Target,
    title: 'Intelligence First',
    body: 'Every feature, every signal, every recommendation is grounded in data — not marketing spend or pay-to-play placement.',
  },
  {
    icon: Users,
    title: 'Industry Native',
    body: 'Built by people who understand the language of professional beauty, from treatment rooms to distribution networks.',
  },
  {
    icon: Eye,
    title: 'Operator Obsessed',
    body: 'We build for the practitioners and operators who move the industry forward every day.',
  },
  {
    icon: Shield,
    title: 'Trust Through Transparency',
    body: 'Open methodology, clear sourcing, confidence scoring on every signal. No black-box recommendations.',
  },
];

/* ── Timeline Milestones ─────────────────────────────────────── */
const MILESTONES = [
  { year: '2024', label: 'Research & founding', detail: 'Deep market research across professional beauty supply chain pain points.' },
  { year: '2025', label: 'Platform development', detail: 'Intelligence engine, brand directory, protocol library, and procurement tools built.' },
  { year: '2026', label: 'Early access launch', detail: 'Invite-only rollout to verified practitioners and authorized brand partners.' },
  { year: 'Next', label: 'Market expansion', detail: 'Broader operator onboarding, expanded category intelligence, and predictive analytics.' },
];

/* ── Page ─────────────────────────────────────────────────────── */
export default function About() {
  const { isLive } = useCmsPage('about');

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>About -- Socelle</title>
        <meta
          name="description"
          content="Socelle is the intelligence platform for professional beauty. Real signals from treatment rooms, one place to act on them."
        />
        <meta property="og:title" content="About -- Socelle" />
        <meta
          property="og:description"
          content="The professional beauty supply chain is broken. Socelle is fixing it with intelligence first, marketplace second."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://socelle.com/about" />
        <meta property="og:image" content="https://socelle.com/og-image.svg" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://socelle.com/about" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Socelle",
            "url": "https://socelle.com",
            "logo": "https://socelle.com/favicon.svg",
            "description": "Professional beauty intelligence platform surfacing what is trending in treatment rooms and connecting verified brands with licensed operators.",
            "foundingDate": "2025",
            "sameAs": []
          }
        `}</script>
      </Helmet>
      <MainNav />

      {/* ── Hero — full-bleed photo with glass overlay ──────────── */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <img
          src="/images/brand/photos/13.svg"
          alt="Professional beauty workspace"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0 bg-white/60 backdrop-blur-xl"
          aria-hidden="true"
        />
        <div className="relative section-container text-center py-28 lg:py-36">
          <BlockReveal>
            <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-5">
              About Socelle
            </p>
          </BlockReveal>
          <WordReveal
            text="Building the intelligence infrastructure for professional beauty"
            as="h1"
            className="font-sans font-semibold text-hero text-graphite mb-8 max-w-3xl mx-auto justify-center"
          />
          <BlockReveal delay={200}>
            <p className="text-body-lg text-graphite/60 max-w-2xl mx-auto">
              Distribution is fragmented. Operators juggle multiple portals.
              Reorders are manual. Nobody has visibility into what is actually
              working in the treatment room. We built Socelle to change that --
              intelligence first, marketplace second.
            </p>
          </BlockReveal>
        </div>
      </section>

      {/* ── Mission — split layout with photo 14 ────────────────── */}
      <section className="py-20 lg:py-28">
        <SplitPanel
          imagePosition="right"
          bgColor="bg-mn-surface"
          imageSrc="/images/brand/photos/14.svg"
          imageAlt="Intelligence-first platform"
        >
          <BlockReveal>
            <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-5">
              Our Mission
            </p>
          </BlockReveal>
          <BlockReveal delay={100}>
            <h2 className="font-sans font-semibold text-section text-graphite mb-6">
              Make every procurement decision smarter
            </h2>
          </BlockReveal>
          <BlockReveal delay={200}>
            <p className="text-body text-graphite/60 mb-5">
              The professional beauty supply chain runs on phone calls, text
              threads, PDF price lists, and scattered touchpoints. It works
              because the people in it are talented. But it does not scale, and
              nobody has real intelligence on what is working.
            </p>
            <p className="text-body text-graphite/60">
              Socelle brings market signals, peer benchmarks, and
              verified wholesale commerce into one platform -- so operators and
              brands can move faster, together.
            </p>
          </BlockReveal>
        </SplitPanel>
      </section>

      {/* ── Values — 2x2 grid with icons ────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="section-container">
          <div className="text-center mb-16">
            <BlockReveal>
              <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-5">
                How We Think
              </p>
            </BlockReveal>
            <BlockReveal delay={100}>
              <h2 className="font-sans font-semibold text-section text-graphite">
                Our principles
              </h2>
            </BlockReveal>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {VALUES.map((v, i) => (
              <BlockReveal key={v.title} delay={i * 80}>
                <div className="rounded-2xl bg-white/60 backdrop-blur-xl border border-white/30 p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                    <v.icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-sans font-semibold text-lg text-graphite mb-3">
                    {v.title}
                  </h3>
                  <p className="text-graphite/60 text-[0.9375rem] leading-relaxed">
                    {v.body}
                  </p>
                </div>
              </BlockReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ─────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-mn-surface">
        <div className="section-container">
          {!isLive && (
            <div className="flex justify-center mb-4">
              <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">DEMO</span>
            </div>
          )}
          <div className="text-center mb-16">
            <BlockReveal>
              <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-5">
                Platform Journey
              </p>
            </BlockReveal>
            <BlockReveal delay={100}>
              <h2 className="font-sans font-semibold text-section text-graphite">
                Milestones
              </h2>
            </BlockReveal>
          </div>

          <div className="max-w-3xl mx-auto relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-graphite/10 hidden md:block" />

            <div className="space-y-10">
              {MILESTONES.map((m, i) => (
                <BlockReveal key={m.year} delay={i * 100}>
                  <div className="flex gap-6 md:gap-10 items-start">
                    <div className="relative shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center z-10">
                      <span className="text-accent text-xs font-semibold">{m.year}</span>
                    </div>
                    <div>
                      <h3 className="font-sans font-semibold text-graphite mb-1">
                        {m.label}
                      </h3>
                      <p className="text-graphite/60 text-sm leading-relaxed">
                        {m.detail}
                      </p>
                    </div>
                  </div>
                </BlockReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Team ──────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <BlockReveal>
                <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-5">
                  The Team
                </p>
              </BlockReveal>
              <BlockReveal delay={100}>
                <h2 className="font-sans font-semibold text-section text-graphite mb-5">
                  Built by people who know this industry
                </h2>
              </BlockReveal>
              <BlockReveal delay={200}>
                <p className="text-body text-graphite/60 mb-4">
                  Socelle is built by a team with deep roots in professional
                  beauty, B2B marketplaces, and commerce technology. We are not
                  outsiders guessing at the problem.
                </p>
                <p className="text-body text-graphite/60">
                  Deep expertise in vertical marketplaces and the beauty industry
                  supply chain -- with key hires in engineering, data
                  intelligence, and partnerships underway.
                </p>
              </BlockReveal>
            </div>
            <div className="order-1 lg:order-2 rounded-2xl overflow-hidden">
              <img
                src="/images/brand/photos/21.svg"
                alt="Socelle team"
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Dark CTA Panel ────────────────────────────────────────── */}
      <section className="bg-mn-dark py-20 lg:py-24 rounded-section mx-4 lg:mx-8 mb-20">
        <div className="section-container text-center">
          <BlockReveal>
            <h2 className="font-sans font-semibold text-section text-mn-bg mb-5">
              Join the intelligence movement
            </h2>
          </BlockReveal>
          <BlockReveal delay={100}>
            <p className="text-body text-mn-bg/65 max-w-md mx-auto mb-10">
              If you are a professional beauty brand or a licensed spa, medspa,
              or salon -- the Socelle intelligence platform was built for you.
            </p>
          </BlockReveal>
          <BlockReveal delay={200}>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/request-access" className="btn-mineral-dark">
                Request Access
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/brand/apply" className="btn-mineral-ghost">
                Apply as Brand Partner
              </Link>
            </div>
          </BlockReveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
