import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight } from 'lucide-react';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import WordReveal from '../../components/motion/WordReveal';
import GlassAccordion from '../../components/sections/GlassAccordion';
import SiteFooter from '../../components/sections/SiteFooter';

/* ── FAQ Data ────────────────────────────────────────────────── */
type Category = 'general' | 'platform' | 'intelligence' | 'pricing' | 'support';

interface FAQEntry {
  id: string;
  category: Category;
  question: string;
  answer: string;
}

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'platform', label: 'Platform' },
  { id: 'intelligence', label: 'Intelligence' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'support', label: 'Support' },
];

const FAQ_DATA: FAQEntry[] = [
  // General
  {
    id: 'gen-1',
    category: 'general',
    question: 'What is Socelle?',
    answer:
      'Socelle is a professional beauty intelligence platform paired with a verified wholesale marketplace. We surface real signals from treatment rooms -- trending products, protocol adoption, ingredient momentum -- and let you act on those signals with consolidated multi-brand purchasing.',
  },
  {
    id: 'gen-2',
    category: 'general',
    question: 'Who can access Socelle?',
    answer:
      'Licensed professionals only. We verify credentials for every operator account. This includes licensed estheticians, cosmetologists, spa owners, and medspa operators with valid professional credentials.',
  },
  {
    id: 'gen-3',
    category: 'general',
    question: 'What regions do you serve?',
    answer:
      'Currently US-focused with plans for international expansion. If you operate outside the US and want early access when we expand, submit a request and we will notify you.',
  },
  // Platform
  {
    id: 'plat-1',
    category: 'platform',
    question: 'Is this a marketplace or an intelligence platform?',
    answer:
      'Both. Intelligence first, marketplace second. You discover products through data -- treatment trends, velocity signals, peer benchmarks -- then purchase from every authorized brand in one place, one cart.',
  },
  {
    id: 'plat-2',
    category: 'platform',
    question: 'Can I order from multiple brands?',
    answer:
      'Yes. One cart, multiple brands, single checkout. No more logging into separate brand portals or managing fragmented orders. Every authorized brand ships from their own inventory.',
  },
  {
    id: 'plat-3',
    category: 'platform',
    question: 'How do brands join Socelle?',
    answer:
      'Apply through our brand partner application. We review for professional-grade quality, brand authorization, and alignment with the professional beauty channel. Approved brands get a dedicated storefront and onboarding support.',
  },
  {
    id: 'plat-4',
    category: 'platform',
    question: 'What about medspa compliance?',
    answer:
      'We categorize products with compliance awareness. FDA-cleared devices and medical-grade products are separated from cosmetic products, making it easier for your medical director to review procurement decisions.',
  },
  // Intelligence
  {
    id: 'intel-1',
    category: 'intelligence',
    question: 'What does Socelle Intelligence show me?',
    answer:
      'Treatment trends, product velocity, ingredient momentum, peer benchmarks, and brand adoption signals. Intelligence updates daily and is personalized to your business type, location, and purchasing history.',
  },
  {
    id: 'intel-2',
    category: 'intelligence',
    question: 'How does peer benchmarking work?',
    answer:
      'See anonymized data on what operators like you are stocking, spending, and trending toward. Benchmarks are segmented by business type, region, and size so comparisons are relevant to your operation.',
  },
  {
    id: 'intel-3',
    category: 'intelligence',
    question: 'How are intelligence signals different from marketing?',
    answer:
      'Intelligence signals are derived from real market activity -- actual purchase patterns, adoption rates, and protocol trends. They are not sponsored placements, paid features, or brand advertising.',
  },
  {
    id: 'intel-4',
    category: 'intelligence',
    question: 'How often are intelligence signals updated?',
    answer:
      'Signals are refreshed daily. Market-level trends and peer benchmarks are recalculated on a rolling basis so that you always see the most current picture of what is happening across the professional beauty landscape.',
  },
  // Pricing
  {
    id: 'price-1',
    category: 'pricing',
    question: 'Is Socelle free for operators?',
    answer:
      'Yes. Operators join free. There are no subscriptions or hidden fees. Intelligence and marketplace access are included with your verified professional account.',
  },
  {
    id: 'price-2',
    category: 'pricing',
    question: 'How is product pricing determined?',
    answer:
      'Brands set professional wholesale pricing on Socelle. We verify that pricing is authentic professional-only pricing, not inflated retail. You see real wholesale rates from authorized brands.',
  },
  {
    id: 'price-3',
    category: 'pricing',
    question: 'What is the commission structure for brands?',
    answer:
      '92% to you, 8% to Socelle. No listing fees. No monthly charges. No setup costs. You pay only when an operator places an order through your storefront.',
  },
  {
    id: 'price-4',
    category: 'pricing',
    question: 'Are there premium features?',
    answer:
      'Advanced intelligence features, benchmarking tiers, and campaign tools will have premium options as the platform matures. Core intelligence and marketplace access remain free for verified professionals.',
  },
  // Support
  {
    id: 'sup-1',
    category: 'support',
    question: 'Is my data secure?',
    answer:
      'Yes. We follow industry-standard security practices including encryption in transit and at rest. Operator data is anonymized in all intelligence outputs. We never sell personal data to third parties.',
  },
  {
    id: 'sup-2',
    category: 'support',
    question: 'How is operator data used in intelligence?',
    answer:
      'All operator data in intelligence outputs is anonymized and aggregated. No individual operator data is ever shared with brands or other operators. You see market-level trends, not individual behaviors.',
  },
  {
    id: 'sup-3',
    category: 'support',
    question: 'How do I contact support?',
    answer:
      'Email hello@socelle.com for any questions. We respond within one business day. For urgent account issues, use the support channel in your dashboard once you have access.',
  },
];

/* ── Build JSON-LD for FAQPage ───────────────────────────────── */
const FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_DATA.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

/* ── Page ─────────────────────────────────────────────────────── */
export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('general');

  const filteredItems = useMemo(
    () =>
      FAQ_DATA.filter((f) => f.category === activeCategory).map((f) => ({
        id: f.id,
        question: f.question,
        answer: <p>{f.answer}</p>,
      })),
    [activeCategory],
  );

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>FAQ — Socelle</title>
        <meta
          name="description"
          content="Frequently asked questions about Socelle. Everything operators and brand partners need to know about the professional beauty intelligence platform."
        />
        <meta property="og:title" content="FAQ — Socelle" />
        <meta
          property="og:description"
          content="Everything operators and brand partners need to know about Socelle intelligence, pricing, security, and commerce."
        />
        <meta property="og:image" content="https://socelle.com/og-image.svg" />
        <link rel="canonical" href="https://socelle.com/faq" />
        <script type="application/ld+json">{JSON.stringify(FAQ_JSONLD)}</script>
      </Helmet>
      <MainNav />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="min-h-[50vh] flex items-center justify-center py-20 lg:py-28">
        <div className="section-container text-center">
          <BlockReveal>
            <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-5">
              Frequently Asked Questions
            </p>
          </BlockReveal>
          <WordReveal
            text="Everything you need to know"
            as="h1"
            className="font-sans font-semibold text-hero text-graphite mb-6 max-w-2xl mx-auto justify-center"
          />
          <BlockReveal delay={200}>
            <p className="text-body-lg text-[rgba(30,37,43,0.62)] max-w-lg mx-auto">
              Answers for operators and brand partners across every part of the
              Socelle intelligence platform.
            </p>
          </BlockReveal>
        </div>
      </section>

      {/* ── Category Filter ───────────────────────────────────────── */}
      <section className="pb-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`rounded-full px-5 py-2.5 text-sm font-sans font-medium transition-all duration-200 ${isActive
                      ? 'bg-white/60 backdrop-blur-[12px] border border-white/30 text-graphite shadow-[0_2px_12px_rgba(19,24,29,0.06)]'
                      : 'bg-transparent border border-transparent text-graphite/50 hover:text-graphite hover:bg-white/30'
                    }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ Body ──────────────────────────────────────────────── */}
      <section className="py-12 lg:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <GlassAccordion items={filteredItems} allowMultiple />
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <BlockReveal>
            <div className="text-center">
              <h2 className="font-sans font-semibold text-section text-graphite mb-4">
                Still have questions?
              </h2>
              <p className="text-body text-[rgba(30,37,43,0.62)] max-w-md mx-auto mb-8">
                Reach out directly and we will get back to you within one
                business day.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/request-access" className="btn-mineral-primary">
                  Request Access
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a href="mailto:hello@socelle.com" className="btn-mineral-secondary">
                  Contact Us
                </a>
              </div>
            </div>
          </BlockReveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
