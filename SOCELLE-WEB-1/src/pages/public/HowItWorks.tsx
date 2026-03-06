import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight } from 'lucide-react';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import WordReveal from '../../components/motion/WordReveal';
import StickyCardStack from '../../components/sections/StickyCardStack';
import SplitPanel from '../../components/sections/SplitPanel';
import SiteFooter from '../../components/sections/SiteFooter';

/* ── Sticky card content ─────────────────────────────────────── */
function StepCard({
  number,
  title,
  children,
  dark = false,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div className="max-w-xl">
      <p
        className={`text-[0.8125rem] tracking-[0.12em] font-medium uppercase mb-4 ${dark ? 'text-[rgba(247,245,242,0.4)]' : 'text-graphite/40'
          }`}
      >
        Step {number}
      </p>
      <h2
        className={`font-sans font-semibold text-section mb-6 ${dark ? 'text-[#F7F5F2]' : 'text-graphite'
          }`}
      >
        {title}
      </h2>
      <div
        className={`text-body leading-relaxed space-y-4 ${dark ? 'text-[rgba(247,245,242,0.65)]' : 'text-[rgba(30,37,43,0.62)]'
          }`}
      >
        {children}
      </div>
    </div>
  );
}

const STICKY_CARDS = [
  {
    id: 'step-1',
    bg: 'bg-white',
    content: (
      <StepCard number="01" title="Connect Your Operation">
        <p>
          Create your account and verify your professional credentials. Socelle
          is exclusively for licensed beauty professionals and authorized brands.
        </p>
        <p>
          Once verified, your operation is matched to relevant categories,
          intelligence signals, and peer benchmarks. Your personalized
          intelligence profile is built automatically from your business type,
          location, and specialties.
        </p>
      </StepCard>
    ),
  },
  {
    id: 'step-2',
    bg: 'bg-mn-surface',
    content: (
      <StepCard number="02" title="Receive Market Intelligence">
        <p>
          See what is actually trending in treatment rooms. Products gaining
          velocity, protocols gaining traction, ingredients with momentum. Real
          signals updated daily, not marketing.
        </p>
        <p>
          Competitive benchmarks are segmented by business type, region, and
          size -- so comparisons are relevant to your specific operation. Track
          category trends and adoption curves across the professional beauty
          landscape.
        </p>
      </StepCard>
    ),
  },
  {
    id: 'step-3',
    bg: 'bg-mn-dark',
    textColor: 'text-[#F7F5F2]',
    content: (
      <div data-dark-section>
        <StepCard number="03" title="Act on Insights" dark>
          <p>
            Discover products through intelligence, not brand rep pitches. Browse
            by treatment protocol, see what your peers are stocking, and compare
            options across every authorized brand.
          </p>
          <p>
            Actionable recommendations surface procurement optimization
            opportunities, protocol-linked product pairings, and inventory
            reorder signals -- so every decision is grounded in data.
          </p>
        </StepCard>
      </div>
    ),
  },
  {
    id: 'step-4',
    bg: 'bg-white',
    content: (
      <StepCard number="04" title="Grow With Confidence">
        <p>
          One cart, every authorized brand. Verified professional pricing.
          Consolidated procurement across your entire product mix. Order, track,
          and reorder from a single dashboard.
        </p>
        <p>
          Track performance against your own benchmarks and market-level trends.
          Measure ROI on procurement decisions. Scale your operation with the
          clarity that comes from real data.
        </p>
      </StepCard>
    ),
  },
];

/* ── Page ─────────────────────────────────────────────────────── */
export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>How It Works — Socelle</title>
        <meta
          name="description"
          content="Four steps: Connect, Receive Intelligence, Act on Insights, Grow. See how Socelle works for professional beauty."
        />
        <meta
          property="og:title"
          content="How It Works — Socelle"
        />
        <meta
          property="og:description"
          content="From signal to strategy in four steps. Professional beauty procurement made smarter."
        />
        <meta property="og:image" content="https://socelle.com/og-image.svg" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://socelle.com/how-it-works" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How Socelle Works",
            "description": "Four steps to smarter professional beauty procurement: Connect, Receive Intelligence, Act on Insights, Grow With Confidence.",
            "step": [
              { "@type": "HowToStep", "position": 1, "name": "Connect Your Operation", "text": "Create your account and verify your professional credentials." },
              { "@type": "HowToStep", "position": 2, "name": "Receive Market Intelligence", "text": "See what is trending in treatment rooms with real market signals." },
              { "@type": "HowToStep", "position": 3, "name": "Act on Insights", "text": "Discover products through intelligence and protocol-first discovery." },
              { "@type": "HowToStep", "position": 4, "name": "Grow With Confidence", "text": "Track performance, measure ROI, and scale with data." }
            ]
          }
        `}</script>
      </Helmet>
      <MainNav />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative py-20 lg:py-28 overflow-hidden bg-mn-bg">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/yellow-drops.mp4"
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
              'linear-gradient(160deg, rgba(246,244,241,0.92) 0%, rgba(246,244,241,0.80) 50%, rgba(246,244,241,0.92) 100%)',
          }}
          aria-hidden="true"
        />
        <div className="relative section-container text-center">
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
            <p className="text-body-lg text-[rgba(30,37,43,0.62)] max-w-2xl mx-auto">
              Intelligence, discovery, and procurement working together to make
              professional beauty purchasing faster, smarter, and more
              transparent.
            </p>
          </BlockReveal>
        </div>
      </section>

      {/* ── Sticky Steps ──────────────────────────────────────────── */}
      <StickyCardStack cards={STICKY_CARDS} />

      {/* ── Benefits ──────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="section-container text-center mb-16">
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

        <div className="space-y-8">
          <SplitPanel imagePosition="right" bgColor="bg-mn-surface">
            <BlockReveal>
              <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-4">
                Signals
              </p>
              <h3 className="font-sans font-semibold text-subsection text-graphite mb-4">
                Real-time market signals
              </h3>
              <p className="text-body text-[rgba(30,37,43,0.62)]">
                Socelle Intelligence surfaces real signals from the professional
                beauty market -- treatment trends, product velocity, ingredient
                momentum. These are not sponsored placements or paid features.
                They are derived from actual market activity, refreshed daily,
                and personalized to your operation.
              </p>
            </BlockReveal>
          </SplitPanel>

          <SplitPanel imagePosition="left" bgColor="bg-accent/5">
            <BlockReveal>
              <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-4">
                Benchmarks
              </p>
              <h3 className="font-sans font-semibold text-subsection text-graphite mb-4">
                Competitive benchmarking
              </h3>
              <p className="text-body text-[rgba(30,37,43,0.62)]">
                See anonymized data on what operators like you are stocking,
                spending, and trending toward. Benchmarks are segmented by
                business type, region, and size so comparisons are relevant to
                your operation -- not abstract industry averages.
              </p>
            </BlockReveal>
          </SplitPanel>

          <SplitPanel imagePosition="right" bgColor="bg-mn-surface">
            <BlockReveal>
              <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-4">
                Forecasting
              </p>
              <h3 className="font-sans font-semibold text-subsection text-graphite mb-4">
                Predictive analytics
              </h3>
              <p className="text-body text-[rgba(30,37,43,0.62)]">
                Forward-looking intelligence identifies emerging trends before
                they saturate the market. Reorder predictions, adoption velocity
                curves, and category momentum indicators help you stay ahead --
                not reactive.
              </p>
            </BlockReveal>
          </SplitPanel>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────── */}
      <section className="bg-mn-dark py-20 lg:py-24 rounded-section mx-4 lg:mx-8 mb-20">
        <div className="section-container text-center">
          <BlockReveal>
            <h2 className="font-sans font-semibold text-section text-[#F7F5F2] mb-5">
              Ready to get started?
            </h2>
          </BlockReveal>
          <BlockReveal delay={100}>
            <p className="text-body text-[rgba(247,245,242,0.65)] max-w-md mx-auto mb-10">
              Request access to Socelle and see professional beauty intelligence
              in action.
            </p>
          </BlockReveal>
          <BlockReveal delay={200}>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/request-access"
                className="inline-flex items-center justify-center gap-2 bg-[#F7F5F2] text-mn-dark rounded-full h-[52px] px-7 font-sans font-medium text-sm hover:scale-[1.01] transition-all duration-200"
                style={{ boxShadow: '0 2px 8px rgba(19,24,29,0.15)' }}
              >
                Request Access
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/brand/apply"
                className="inline-flex items-center justify-center gap-2 bg-white/10 text-[#F7F5F2] border border-[rgba(247,245,242,0.16)] rounded-full h-[52px] px-7 font-sans font-medium text-sm hover:bg-white/15 hover:scale-[1.01] transition-all duration-200"
              >
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
