import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  ArrowRight,
  Code,
  Zap,
  Building2,
  HelpCircle,
} from 'lucide-react';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import WordReveal from '../../components/motion/WordReveal';
import SiteFooter from '../../components/sections/SiteFooter';
import { getApiPricing } from '../../__fixtures__/mockApiData';
import type { ApiPricingTier } from '../../lib/api/types';

// ── Feature comparison rows ─────────────────────────────────────────
const COMPARISON_FEATURES = [
  { feature: 'Market signals endpoint', starter: true, professional: true, enterprise: true },
  { feature: 'Category overview data', starter: true, professional: true, enterprise: true },
  { feature: 'Trend analysis + time-series', starter: false, professional: true, enterprise: true },
  { feature: 'Brand performance analytics', starter: false, professional: true, enterprise: true },
  { feature: 'Custom report generation', starter: false, professional: false, enterprise: true },
  { feature: 'Historical data (1 year)', starter: false, professional: true, enterprise: true },
  { feature: 'White-label formatting', starter: false, professional: false, enterprise: true },
  { feature: 'Webhook notifications', starter: false, professional: true, enterprise: true },
  { feature: 'Rate limit (req/min)', starter: '30', professional: '120', enterprise: '600+' },
  { feature: 'Monthly requests', starter: '10K', professional: '100K', enterprise: 'Unlimited' },
  { feature: 'SLA uptime', starter: '99.5%', professional: '99.9%', enterprise: '99.99%' },
  { feature: 'Support', starter: 'Community', professional: 'Priority email', enterprise: 'Dedicated + Slack' },
];

// ── FAQ items ───────────────────────────────────────────────────────
const API_FAQ = [
  {
    q: 'How do I get an API key?',
    a: 'Subscribe to any plan and your API key will be provisioned automatically. You can manage keys from your API dashboard.',
  },
  {
    q: 'Can I upgrade or downgrade my plan?',
    a: 'Yes. Plan changes take effect at the start of your next billing cycle. Upgrades are prorated for the remaining days.',
  },
  {
    q: 'What happens if I exceed my monthly quota?',
    a: 'Requests beyond your monthly quota return a 429 status. You can upgrade your plan or purchase additional request packs.',
  },
  {
    q: 'Is there a free trial?',
    a: 'We offer a 14-day free trial of the Professional tier with 5,000 requests. Contact sales to get started.',
  },
];

// ── Tier card ───────────────────────────────────────────────────────
function TierCard({
  tier,
  onSelect,
}: {
  tier: ApiPricingTier;
  onSelect: (tier: ApiPricingTier) => void;
}) {
  const isEnterprise = tier.tier === 'enterprise';

  return (
    <div
      className={`relative rounded-2xl p-8 flex flex-col bg-white/60 backdrop-blur-[12px] transition-shadow hover:shadow-panel ${
        tier.highlighted
          ? 'border-2 border-accent ring-4 ring-accent/10'
          : 'border border-white/30'
      }`}
    >
      {tier.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-accent text-mn-bg text-xs font-semibold px-4 py-1 rounded-full font-sans tracking-wide">
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-sans font-bold text-graphite mb-1">{tier.name}</h3>
        <p className="text-sm text-graphite/40 font-sans">{tier.requests}</p>
      </div>

      <div className="mb-6">
        <span className="text-metric-lg font-sans text-graphite">{tier.price}</span>
        <span className="text-sm text-graphite/40 font-sans ml-2">/{tier.priceNote}</span>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
            <span className="text-sm text-graphite font-sans">{feature}</span>
          </li>
        ))}
      </ul>

      {isEnterprise ? (
        <Link
          to="/request-access"
          className="btn-mineral-secondary w-full"
        >
          Contact Sales
        </Link>
      ) : (
        <button
          onClick={() => onSelect(tier)}
          className={`w-full ${
            tier.highlighted
              ? 'btn-mineral-primary'
              : 'btn-mineral-secondary'
          }`}
        >
          {tier.ctaLabel}
        </button>
      )}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────
export default function ApiPricing() {
  const tiers = getApiPricing();

  const handleSelect = (tier: ApiPricingTier) => {
    window.location.href = `/request-access?surface=api&tier=${tier.tier}`;
  };

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>API Pricing | Socelle Intelligence</title>
        <meta
          name="description"
          content="Choose the Socelle Intelligence API plan that fits your data needs. Starter, Professional, and Enterprise tiers for professional beauty market intelligence."
        />
        <meta property="og:title" content="API Pricing | Socelle Intelligence" />
        <meta property="og:description" content="Choose the Socelle Intelligence API plan that fits your data needs." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://socelle.com/api/pricing" />
        <meta property="og:image" content="https://socelle.com/og-image.svg" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://socelle.com/api/pricing" />
      </Helmet>
      <MainNav />

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="section-container text-center">
          <BlockReveal>
            <p className="mn-eyebrow mb-5">API Pricing</p>
          </BlockReveal>
          <WordReveal
            text="Intelligence at scale"
            as="h1"
            className="font-sans font-semibold text-hero text-graphite mb-6 justify-center"
          />
          <BlockReveal delay={200}>
            <p className="text-graphite/60 font-sans text-body-lg max-w-2xl mx-auto leading-relaxed">
              Choose the plan that matches your integration needs. From startup prototypes to
              enterprise-grade data pipelines.
            </p>
          </BlockReveal>
        </div>
      </section>

      {/* ── Pricing Cards ─────────────────────────────── */}
      <section className="section-container -mt-4 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <TierCard key={tier.tier} tier={tier} onSelect={handleSelect} />
          ))}
        </div>
      </section>

      {/* ── Feature Comparison ─────────────────────────── */}
      <section className="section-container pb-20">
        <BlockReveal>
          <h2 className="font-sans font-semibold text-section text-graphite text-center mb-12">
            Feature comparison
          </h2>
        </BlockReveal>
        <div className="bg-white/60 backdrop-blur-[12px] border border-white/30 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-graphite/[0.08] bg-mn-surface/50">
                  <th className="text-left py-4 px-6 font-semibold text-graphite font-sans w-1/3">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-graphite font-sans">
                    <div className="flex flex-col items-center gap-1">
                      <Zap className="w-4 h-4 text-graphite/40" />
                      Starter
                    </div>
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-graphite font-sans">
                    <div className="flex flex-col items-center gap-1">
                      <Code className="w-4 h-4 text-accent" />
                      Professional
                    </div>
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-graphite font-sans">
                    <div className="flex flex-col items-center gap-1">
                      <Building2 className="w-4 h-4 text-signal-warn" />
                      Enterprise
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={i < COMPARISON_FEATURES.length - 1 ? 'border-b border-graphite/[0.04]' : ''}
                  >
                    <td className="py-3 px-6 text-graphite font-sans">{row.feature}</td>
                    {(['starter', 'professional', 'enterprise'] as const).map((t) => {
                      const val = row[t];
                      return (
                        <td key={t} className="py-3 px-4 text-center">
                          {val === true ? (
                            <CheckCircle className="w-4 h-4 text-accent mx-auto" />
                          ) : val === false ? (
                            <span className="text-graphite/20">&mdash;</span>
                          ) : (
                            <span className="text-sm font-semibold text-graphite font-sans">
                              {val}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center gap-3 mb-8">
          <HelpCircle className="w-6 h-6 text-accent" />
          <h2 className="font-sans text-subsection text-graphite">
            Frequently asked questions
          </h2>
        </div>
        <div className="space-y-4">
          {API_FAQ.map((faq) => (
            <div key={faq.q} className="bg-white/60 backdrop-blur-[12px] border border-white/30 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-graphite font-sans mb-2">{faq.q}</h3>
              <p className="text-sm text-graphite/60 font-sans leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────── */}
      <section className="section-container pb-20">
        <BlockReveal>
          <div className="bg-mn-dark rounded-section p-12 text-center">
            <h2 className="font-sans font-semibold text-subsection text-mn-bg mb-4">Need a custom solution?</h2>
            <p className="text-mn-bg/55 font-sans mb-8 max-w-lg mx-auto">
              Enterprise clients get dedicated support, custom SLAs, white-label options, and
              unlimited access to our intelligence data.
            </p>
            <Link to="/request-access" className="btn-mineral-dark">
              Talk to Sales
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </BlockReveal>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <SiteFooter />
    </div>
  );
}
