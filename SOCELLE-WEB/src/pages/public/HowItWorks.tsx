import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, BarChart3, Layers, BookOpen, TrendingUp } from 'lucide-react';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import WordReveal from '../../components/motion/WordReveal';
import SiteFooter from '../../components/sections/SiteFooter';
import { useCmsPage } from '../../lib/useCmsPage';

/* ── Steps ─────────────────────────────────────────────────────── */
const STEPS = [
  {
    number: '01',
    title: 'Discover',
    body: 'Create your account and verify your professional credentials. Socelle is exclusively for licensed beauty professionals and authorized brands. Your intelligence profile is built from your business type, location, and specialties.',
    photo: '/images/brand/photos/15.svg',
  },
  {
    number: '02',
    title: 'Analyze',
    body: 'See what is actually trending in treatment rooms. Products gaining velocity, protocols gaining traction, ingredients with momentum. Real signals updated daily -- not marketing.',
    photo: '/images/brand/photos/16.svg',
  },
  {
    number: '03',
    title: 'Learn',
    body: 'Competitive benchmarks segmented by business type, region, and size. Compare your operation against relevant peers, not abstract industry averages.',
    photo: '/images/brand/photos/17.svg',
  },
  {
    number: '04',
    title: 'Grow',
    body: 'Discover products through intelligence, not brand rep pitches. Protocol-linked product pairings, reorder signals, and margin intelligence turn data into procurement decisions.',
    photo: '/images/brand/photos/18.svg',
  },
];

/* ── Feature Grid ──────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: BarChart3,
    title: 'Intelligence',
    body: 'Market signals, adoption velocity, demand shifts -- surfaced from the treatment room, refreshed daily.',
  },
  {
    icon: Layers,
    title: 'Brands',
    body: 'Verified brand directory with professional pricing, product catalogs, and performance signals.',
  },
  {
    icon: BookOpen,
    title: 'Protocols',
    body: 'Canonical treatment protocols linked to products, peer adoption data, and clinical context.',
  },
  {
    icon: TrendingUp,
    title: 'Education',
    body: 'Brand-authored training modules, certification tracking, and protocol intelligence for continuing education.',
  },
];

/* ── Page ─────────────────────────────────────────────────────── */
export default function HowItWorks() {
  const { isLive } = useCmsPage('how-it-works');

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>How It Works -- Socelle</title>
        <meta
          name="description"
          content="Four steps: Discover, Analyze, Learn, Grow. See how Socelle works for professional beauty."
        />
        <meta property="og:title" content="How It Works -- Socelle" />
        <meta
          property="og:description"
          content="From signal to strategy in four steps. Professional beauty procurement made smarter."
        />
        <meta property="og:image" content="https://socelle.com/og-image.svg" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://socelle.com/how-it-works" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://socelle.com/how-it-works" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How Socelle Works",
            "description": "Four steps to smarter professional beauty procurement: Discover, Analyze, Learn, Grow.",
            "step": [
              { "@type": "HowToStep", "position": 1, "name": "Discover", "text": "Create your account and verify your professional credentials." },
              { "@type": "HowToStep", "position": 2, "name": "Analyze", "text": "See what is trending in treatment rooms with real market signals." },
              { "@type": "HowToStep", "position": 3, "name": "Learn", "text": "Competitive benchmarks segmented by business type and region." },
              { "@type": "HowToStep", "position": 4, "name": "Grow", "text": "Turn intelligence into procurement decisions and track performance." }
            ]
          }
        `}</script>
      </Helmet>
      <MainNav />

      {/* ── Hero — video background with glass overlay ──────────── */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/yellow-drops.mp4"
          poster="/videos/posters/yellow-drops-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-white/60 backdrop-blur-xl"
          aria-hidden="true"
        />
        <div className="relative section-container text-center py-28 lg:py-36">
          <BlockReveal>
            <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-5">
              How It Works
            </p>
          </BlockReveal>
          <WordReveal
            text="From signal to strategy in four steps"
            as="h1"
            className="font-sans font-semibold text-hero text-graphite mb-8 max-w-3xl mx-auto justify-center"
          />
          <BlockReveal delay={200}>
            <p className="text-body-lg text-graphite/60 max-w-2xl mx-auto">
              Intelligence, discovery, and procurement working together to make
              professional beauty purchasing faster, smarter, and more
              transparent.
            </p>
          </BlockReveal>
        </div>
      </section>

      {/* ── 4-Step Process ───────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="section-container">
          {!isLive && (
            <div className="flex justify-center mb-4">
              <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">DEMO</span>
            </div>
          )}
          <div className="text-center mb-16">
            <BlockReveal>
              <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-5">
                The Process
              </p>
            </BlockReveal>
            <BlockReveal delay={100}>
              <h2 className="font-sans font-semibold text-section text-graphite">
                Four steps to better decisions
              </h2>
            </BlockReveal>
          </div>

          <div className="space-y-16 lg:space-y-24">
            {STEPS.map((step, i) => (
              <BlockReveal key={step.number} delay={i * 80}>
                <div
                  className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
                    i % 2 === 1 ? 'lg:direction-rtl' : ''
                  }`}
                >
                  {/* Image */}
                  <div className={`rounded-2xl overflow-hidden ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                    <img
                      src={step.photo}
                      alt={step.title}
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />
                  </div>
                  {/* Text */}
                  <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                    <div className="flex items-center gap-4 mb-5">
                      <span className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent text-sm font-semibold">
                        {step.number}
                      </span>
                      <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40">
                        Step {step.number}
                      </p>
                    </div>
                    <h3 className="font-sans font-semibold text-subsection text-graphite mb-4">
                      {step.title}
                    </h3>
                    <p className="text-body text-graphite/60 leading-relaxed">
                      {step.body}
                    </p>
                  </div>
                </div>
              </BlockReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Grid ─────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-mn-surface">
        <div className="section-container">
          <div className="text-center mb-16">
            <BlockReveal>
              <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-5">
                Built for Professional Beauty
              </p>
            </BlockReveal>
            <BlockReveal delay={100}>
              <h2 className="font-sans font-semibold text-section text-graphite">
                Every layer is purpose-built
              </h2>
            </BlockReveal>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <BlockReveal key={f.title} delay={i * 80}>
                <div className="rounded-2xl bg-white/60 backdrop-blur-xl border border-white/30 p-7 shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                    <f.icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-sans font-semibold text-graphite mb-2">
                    {f.title}
                  </h3>
                  <p className="text-graphite/60 text-sm leading-relaxed">
                    {f.body}
                  </p>
                </div>
              </BlockReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────── */}
      <section className="bg-mn-dark py-20 lg:py-24 rounded-section mx-4 lg:mx-8 mb-20">
        <div className="section-container text-center">
          <BlockReveal>
            <h2 className="font-sans font-semibold text-section text-mn-bg mb-5">
              Ready to get started?
            </h2>
          </BlockReveal>
          <BlockReveal delay={100}>
            <p className="text-body text-mn-bg/65 max-w-md mx-auto mb-10">
              Request access to Socelle and see professional beauty intelligence
              in action.
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
