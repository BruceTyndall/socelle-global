import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight } from 'lucide-react';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import WordReveal from '../../components/motion/WordReveal';
import SplitPanel from '../../components/sections/SplitPanel';
import SiteFooter from '../../components/sections/SiteFooter';

/* ── Values ──────────────────────────────────────────────────── */
const VALUES = [
  {
    title: 'Intelligence First',
    body: 'Every feature, every signal, every recommendation is grounded in data.',
  },
  {
    title: 'Industry Native',
    body: 'Built by people who understand the language of professional beauty.',
  },
  {
    title: 'Operator Obsessed',
    body: 'We build for the practitioners and operators who move the industry.',
  },
  {
    title: 'Trust Through Transparency',
    body: 'Open methodology, clear sourcing, no black-box recommendations.',
  },
];

/* ── Page ─────────────────────────────────────────────────────── */
export default function About() {
  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>About -- Socelle</title>
        <meta
          name="description"
          content="Socelle is the intelligence platform for professional beauty. Real signals from treatment rooms, one place to act on them."
        />
        <meta
          property="og:title"
          content="About -- Socelle"
        />
        <meta
          property="og:description"
          content="The professional beauty supply chain is broken. Socelle is fixing it with intelligence first, marketplace second."
        />
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

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="section-container text-center">
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
            <p className="text-body-lg text-[rgba(30,37,43,0.62)] max-w-2xl mx-auto">
              Distribution is fragmented. Operators juggle multiple portals.
              Reorders are manual. Nobody has visibility into what is actually
              working in the treatment room. We built Socelle to change that --
              intelligence first, marketplace second.
            </p>
          </BlockReveal>
        </div>
      </section>

      {/* ── Mission ───────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <SplitPanel imagePosition="right" bgColor="bg-mn-surface">
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
            <p className="text-body text-[rgba(30,37,43,0.62)] mb-5">
              The professional beauty supply chain runs on phone calls, text
              threads, PDF price lists, and scattered touchpoints. It works
              because the people in it are talented. But it does not scale, and
              nobody has real intelligence on what is working.
            </p>
            <p className="text-body text-[rgba(30,37,43,0.62)]">
              Socelle brings real-time market signals, peer benchmarks, and
              verified wholesale commerce into one platform -- so operators and
              brands can move faster, together.
            </p>
          </BlockReveal>
        </SplitPanel>
      </section>

      {/* ── Values ────────────────────────────────────────────────── */}
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
                <div className="rounded-2xl bg-white/60 backdrop-blur-[12px] border border-white/30 p-8 shadow-[0_2px_12px_rgba(19,24,29,0.03)] hover:shadow-[0_4px_24px_rgba(19,24,29,0.06)] transition-shadow duration-300">
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

      {/* ── Team ──────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="section-container">
          <div className="text-center max-w-2xl mx-auto">
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
              <p className="text-body text-[rgba(30,37,43,0.62)] mb-4">
                Socelle is built by a team with deep roots in professional
                beauty, B2B marketplaces, and commerce technology. We are not
                outsiders guessing at the problem.
              </p>
              <p className="text-body text-[rgba(30,37,43,0.62)]">
                Deep expertise in vertical marketplaces and the beauty industry
                supply chain -- with key hires in engineering, data
                intelligence, and partnerships underway.
              </p>
            </BlockReveal>
          </div>
        </div>
      </section>

      {/* ── Dark CTA Panel ────────────────────────────────────────── */}
      <section className="bg-mn-dark py-20 lg:py-24 rounded-section mx-4 lg:mx-8 mb-20">
        <div className="section-container text-center">
          <BlockReveal>
            <h2 className="font-sans font-semibold text-section text-[#F7F5F2] mb-5">
              Join the intelligence movement
            </h2>
          </BlockReveal>
          <BlockReveal delay={100}>
            <p className="text-body text-[rgba(247,245,242,0.65)] max-w-md mx-auto mb-10">
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
