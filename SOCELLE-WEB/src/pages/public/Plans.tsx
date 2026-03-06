import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Check } from 'lucide-react';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import WordReveal from '../../components/motion/WordReveal';
import GlassAccordion from '../../components/sections/GlassAccordion';
import SiteFooter from '../../components/sections/SiteFooter';

/* ══════════════════════════════════════════════════════════════════
   Pricing — Liquid Glass Visual System
   Three-tier intelligence pricing for operators and brands
   ══════════════════════════════════════════════════════════════════ */

// ── Tier definitions ────────────────────────────────────────────
interface PricingTier {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  ctaLink: string;
  featured: boolean;
}

const TIERS: PricingTier[] = [
  {
    name: 'Essentials',
    price: 'Free',
    period: 'forever',
    description:
      'Basic market signals and community access for licensed operators getting started with intelligence-driven procurement.',
    features: [
      'Core market signals (weekly)',
      'Category trend snapshots',
      'Multi-brand marketplace access',
      'Single-cart checkout',
      'Community forum access',
      'Basic business profile',
    ],
    cta: 'Create free account',
    ctaLink: '/portal/signup',
    featured: false,
  },
  {
    name: 'Professional',
    price: '$149',
    period: '/mo',
    description:
      'Full intelligence suite with competitive benchmarks, protocol library, and priority support for serious operators.',
    features: [
      'Real-time market signals (daily)',
      'Full competitive benchmarks',
      'Peer comparison dashboard',
      'Treatment protocol library',
      'Pricing optimization tools',
      'Vendor performance analytics',
      'Reorder intelligence alerts',
      'Priority email support',
    ],
    cta: 'Start Professional',
    ctaLink: '/request-access',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'pricing',
    description:
      'Dedicated intelligence, API access, custom integrations, and white-glove account management for multi-location operators.',
    features: [
      'Everything in Professional',
      'Dedicated intelligence analyst',
      'Custom data integrations',
      'Enterprise API access',
      'Multi-location management',
      'Custom reporting dashboards',
      'Quarterly business reviews',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
    ctaLink: '/request-access',
    featured: false,
  },
];

// ── Feature comparison ──────────────────────────────────────────
interface ComparisonRow {
  feature: string;
  essentials: string;
  professional: string;
  enterprise: string;
}

const COMPARISON: ComparisonRow[] = [
  { feature: 'Market signals', essentials: 'Weekly', professional: 'Daily', enterprise: 'Real-time' },
  { feature: 'Competitive benchmarks', essentials: 'Limited', professional: 'Full', enterprise: 'Full + Custom' },
  { feature: 'Peer comparison', essentials: '--', professional: 'Included', enterprise: 'Included' },
  { feature: 'Protocol library', essentials: '--', professional: 'Full access', enterprise: 'Full + Custom' },
  { feature: 'Marketplace access', essentials: 'Included', professional: 'Included', enterprise: 'Included' },
  { feature: 'Pricing optimization', essentials: '--', professional: 'Included', enterprise: 'Included' },
  { feature: 'API access', essentials: '--', professional: '--', enterprise: 'Included' },
  { feature: 'Multi-location support', essentials: '--', professional: '--', enterprise: 'Included' },
  { feature: 'Dedicated account manager', essentials: '--', professional: '--', enterprise: 'Included' },
  { feature: 'Support', essentials: 'Community', professional: 'Priority email', enterprise: 'Dedicated' },
];

// ── FAQ items ───────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    id: 'faq-1',
    question: 'Can I upgrade or downgrade at any time?',
    answer:
      'Yes. You can move between tiers at any point. Upgrades take effect immediately. Downgrades apply at the end of your current billing period. No penalties, no lock-in.',
  },
  {
    id: 'faq-2',
    question: 'Is there a contract or minimum commitment?',
    answer:
      'No contracts and no minimums. Professional is billed monthly with no annual commitment required. Enterprise terms are flexible and tailored to your organization.',
  },
  {
    id: 'faq-3',
    question: 'How does brand pricing work?',
    answer:
      'Brands operate on a 92/8 commission model. You keep 92% of every order. No listing fees, no monthly charges, no setup costs. Commission payouts to brand partners are processed on a scheduled basis. Payment processing infrastructure is in active development.',
  },
  {
    id: 'faq-4',
    question: 'What counts as a market signal?',
    answer:
      'Market signals include treatment trend data, ingredient velocity, category movement, peer adoption rates, supply alerts, and pricing shifts. Signals are derived from real professional purchasing behavior across the Socelle network.',
  },
  {
    id: 'faq-5',
    question: 'Do I need a license to access the platform?',
    answer:
      'Yes. Socelle is exclusively for licensed beauty professionals. Verification is required during onboarding. This ensures all intelligence data and marketplace access remains within the professional channel.',
  },
  {
    id: 'faq-6',
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards. Enterprise accounts can arrange invoice billing. All transactions are processed through PCI-compliant payment infrastructure.',
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>Plans — Socelle</title>
        <meta
          name="description"
          content="Intelligence that scales with your business. Free essentials, full professional suite at $149/mo, and custom enterprise plans for multi-location operators."
        />
        <meta property="og:title" content="Plans — Socelle" />
        <meta
          property="og:description"
          content="Transparent pricing for professional beauty intelligence. Start free, scale when ready."
        />
        <link rel="canonical" href="https://socelle.com/pricing" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              ${FAQ_ITEMS.map(
          (item) => `{
                "@type": "Question",
                "name": "${item.question}",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "${item.answer}"
                }
              }`,
        ).join(',')}
            ]
          }
        `}</script>
      </Helmet>
      <MainNav />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="bg-mn-bg py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <BlockReveal>
              <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-5">
                PLANS
              </p>
            </BlockReveal>
            <WordReveal
              text="Plans & Access"
              as="h1"
              className="font-sans font-semibold text-hero text-graphite mb-7 justify-center"
            />
            <BlockReveal delay={200}>
              <p className="text-body-lg text-[rgba(20,20,24,0.62)] max-w-xl mx-auto mb-10">
                Choose your access level. Upgrade when you need deeper intelligence and benchmarks.
              </p>
            </BlockReveal>
            <BlockReveal delay={350}>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/portal/signup" className="btn-mineral-primary">
                  Get Intelligence Access
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <Link to="/brand/apply" className="btn-mineral-secondary">
                  Claim Your Brand Page
                </Link>
              </div>
            </BlockReveal>
            {/* W12-02: DEMO badge — pricing tiers are hardcoded, not DB-connected */}
            <BlockReveal delay={450}>
              <div className="flex justify-center mt-6">
                <span className="inline-flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 font-sans">
                  <span className="inline-flex rounded-full h-1.5 w-1.5 bg-amber-400" />
                  Preview Pricing — Plans subject to change
                </span>
              </div>
            </BlockReveal>
          </div>
        </div>
      </section>

      {/* ── Pricing Cards ────────────────────────────────────────── */}
      <section className="pb-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {TIERS.map((tier, i) => (
              <BlockReveal key={tier.name} delay={i * 100}>
                <div
                  className={`relative flex flex-col h-full rounded-2xl overflow-hidden transition-shadow duration-300 hover:shadow-[0_4px_24px_rgba(19,24,29,0.06)] ${tier.featured
                    ? 'bg-white/60 backdrop-blur-[12px] border-2 border-accent/30 shadow-[0_4px_24px_rgba(19,24,29,0.08)]'
                    : 'bg-white/60 backdrop-blur-[12px] border border-white/30'
                    }`}
                >
                  {tier.featured && (
                    <div className="h-[3px] bg-accent" />
                  )}
                  <div className="p-8 lg:p-10 flex-1 flex flex-col">
                    <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-3">
                      {tier.name}
                    </p>
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="font-sans font-semibold text-[2.5rem] text-graphite leading-none">
                        {tier.price}
                      </span>
                      <span className="text-sm text-[rgba(20,20,24,0.42)] font-sans">
                        {tier.period}
                      </span>
                    </div>
                    <p className="text-sm text-[rgba(20,20,24,0.62)] leading-relaxed mb-8">
                      {tier.description}
                    </p>

                    <ul className="space-y-3 mb-8 flex-1">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                          <span className="text-sm font-sans text-graphite">{f}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      to={tier.ctaLink}
                      className={`w-full ${tier.featured
                        ? 'btn-mineral-primary'
                        : 'btn-mineral-secondary'
                        }`}
                    >
                      {tier.cta}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </BlockReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Comparison ───────────────────────────────────── */}
      <section className="bg-mn-surface py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <BlockReveal>
              <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-4">
                Compare Plans
              </p>
            </BlockReveal>
            <BlockReveal delay={100}>
              <h2 className="font-sans font-semibold text-section text-graphite">
                Feature breakdown by tier
              </h2>
            </BlockReveal>
          </div>

          <BlockReveal delay={200}>
            <div className="max-w-4xl mx-auto overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[rgba(20,20,24,0.08)]">
                    <th className="py-4 pr-8 text-sm font-sans font-medium text-graphite/40 uppercase tracking-wider">
                      Feature
                    </th>
                    <th className="py-4 px-4 text-sm font-sans font-medium text-graphite/40 uppercase tracking-wider text-center">
                      Essentials
                    </th>
                    <th className="py-4 px-4 text-sm font-sans font-medium text-accent uppercase tracking-wider text-center">
                      Professional
                    </th>
                    <th className="py-4 px-4 text-sm font-sans font-medium text-graphite/40 uppercase tracking-wider text-center">
                      Enterprise
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row) => (
                    <tr
                      key={row.feature}
                      className="border-b border-[rgba(20,20,24,0.06)]"
                    >
                      <td className="py-4 pr-8 text-sm font-sans text-graphite">
                        {row.feature}
                      </td>
                      <td className="py-4 px-4 text-sm font-sans text-[rgba(20,20,24,0.52)] text-center">
                        {row.essentials}
                      </td>
                      <td className="py-4 px-4 text-sm font-sans text-graphite font-medium text-center">
                        {row.professional}
                      </td>
                      <td className="py-4 px-4 text-sm font-sans text-[rgba(20,20,24,0.52)] text-center">
                        {row.enterprise}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </BlockReveal>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="bg-mn-bg py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <BlockReveal>
              <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-4">
                FAQ
              </p>
            </BlockReveal>
            <BlockReveal delay={100}>
              <h2 className="font-sans font-semibold text-section text-graphite">
                Common questions
              </h2>
            </BlockReveal>
          </div>

          <div className="max-w-3xl mx-auto">
            <BlockReveal delay={200}>
              <GlassAccordion items={FAQ_ITEMS} />
            </BlockReveal>
            <BlockReveal delay={300}>
              <p className="text-center text-sm text-[rgba(20,20,24,0.62)] font-sans mt-10">
                More questions?{' '}
                <a
                  href="mailto:hello@socelle.com"
                  className="font-medium text-graphite hover:underline"
                >
                  hello@socelle.com
                </a>
              </p>
            </BlockReveal>
          </div>
        </div>
      </section>

      {/* ── Dark CTA ─────────────────────────────────────────────── */}
      <section className="bg-mn-dark rounded-section mx-4 lg:mx-8 py-24 lg:py-32 mb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <BlockReveal>
            <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-[rgba(247,245,242,0.45)] mb-5">
              GET STARTED
            </p>
          </BlockReveal>
          <BlockReveal delay={100}>
            <h2 className="font-sans font-semibold text-section text-[#F7F5F2] mb-5">
              Ready to see the difference?
            </h2>
          </BlockReveal>
          <BlockReveal delay={200}>
            <p className="text-body text-[rgba(247,245,242,0.55)] max-w-md mx-auto mb-10">
              Start with a free Essentials account or apply as a brand partner.
              Intelligence and marketplace access from day one.
            </p>
          </BlockReveal>
          <BlockReveal delay={300}>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/portal/signup" className="btn-mineral-dark">
                Create free account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link
                to="/brand/apply"
                className="btn-mineral-ghost"
              >
                Apply as a brand
              </Link>
            </div>
          </BlockReveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
