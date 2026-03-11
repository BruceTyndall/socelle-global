// ── Intelligence Pricing Page ─────────────────────────────────────
// WO-24: Brand Intelligence Packages (Monetization)

import { Helmet } from 'react-helmet-async';
import {
  Check,
  X,
  Crown,
  Star,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';
import { useState } from 'react';
import { useBrandTier } from '../../lib/brandTiers/useBrandTier';
import { getTierPricing, getTierFeatures } from '../../__fixtures__/mockTierData';
import type { BrandTier } from '../../lib/brandTiers/types';

// ── FAQ Data ─────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'What happens to my data if I downgrade?',
    a: 'Your historical data is always preserved. When downgrading, you retain read access to previously generated reports. Real-time features revert to your new tier level.',
  },
  {
    q: 'Can I try Enterprise features before committing?',
    a: 'Yes — contact our team to request a 14-day Enterprise trial. You will get full access to competitive benchmarks, predictive insights, and custom reports.',
  },
  {
    q: 'How are intelligence reports generated?',
    a: 'Reports are generated automatically on the first business day of each month using aggregated marketplace signals, reseller data, and category trends. Enterprise plans include weekly digests.',
  },
  {
    q: 'Is there an annual billing discount?',
    a: 'Yes. Annual billing is available through sales-assisted plans with discounted pricing. Self-serve checkout defaults to monthly billing.',
  },
  {
    q: 'What does "anonymized competitor data" mean?',
    a: 'Competitive landscape data is aggregated and anonymized. You see category-level positioning and relative market share without identifying specific competitor brands by name.',
  },
];

// ── Tier icon mapping ────────────────────────────────────────────

const TIER_ICONS: Record<BrandTier, typeof Star> = {
  basic: Star,
  professional: Crown,
  enterprise: Sparkles,
};

const TIER_COLORS: Record<BrandTier, { card: string; badge: string; button: string; border: string }> = {
  basic: {
    card: 'bg-white',
    badge: 'bg-accent-soft/20 text-graphite/60',
    button: 'bg-accent-soft/30 text-graphite hover:bg-accent-soft/50',
    border: 'border-accent-soft',
  },
  professional: {
    card: 'bg-white ring-2 ring-accent/40',
    badge: 'bg-accent/10 text-accent',
    button: 'bg-accent text-white hover:bg-accent/90',
    border: 'border-accent',
  },
  enterprise: {
    card: 'bg-white ring-2 ring-graphite/30',
    badge: 'bg-graphite/10 text-graphite',
    button: 'bg-graphite text-white hover:bg-graphite/90',
    border: 'border-graphite',
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  intelligence: 'Intelligence & Analytics',
  reports: 'Reports & Exports',
  tools: 'Tools & Integrations',
  support: 'Support & Success',
};

export default function IntelligencePricing() {
  const { currentTier, upgrade } = useBrandTier();
  const pricing = getTierPricing();
  const features = getTierFeatures();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleUpgrade = (tier: BrandTier) => {
    const msg = upgrade(tier);
    // Simple toast-like alert — no external toast library required
    alert(msg);
  };

  const categories = ['intelligence', 'reports', 'tools', 'support'] as const;

  return (
    <>
      <Helmet>
        <title>Intelligence Plans | Socelle</title>
      </Helmet>

      <div className="max-w-6xl mx-auto space-y-12">
        {/* DEMO banner — pricing backed by mockTierData, not Stripe */}
        <div className="bg-signal-warn/10 text-signal-warn text-xs font-medium px-4 py-2 text-center rounded-lg">
          DEMO — Pricing plans shown for illustration. Stripe integration pending.
        </div>

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="text-center">
          <h1 className="text-3xl font-bold font-sans text-graphite">
            Intelligence Plans
          </h1>
          <p className="mt-2 text-graphite/60 max-w-2xl mx-auto">
            Choose the intelligence tier that matches your brand&apos;s growth stage.
            Upgrade or downgrade anytime — no long-term commitment.
          </p>
        </div>

        {/* ── Tier Cards ──────────────────────────────────────── */}
        <div className="grid md:grid-cols-3 gap-6">
          {pricing.map((plan) => {
            const planTier = plan.tier as BrandTier;
            const Icon = TIER_ICONS[planTier] || Star;
            const colors = TIER_COLORS[planTier] || TIER_COLORS.basic;
            const isCurrentPlan = plan.tier === currentTier;
            const tierFeatures = features.filter((f) => f.includedIn[plan.tier]);

            return (
              <div
                key={plan.tier}
                className={`relative rounded-xl border p-6 flex flex-col ${colors.card} ${colors.border}`}
              >
                {/* Popular badge */}
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {plan.highlight}
                    </span>
                  </div>
                )}

                {/* Current plan badge */}
                {isCurrentPlan && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 mb-4">
                  <Icon className={`w-5 h-5 ${plan.tier === 'professional' ? 'text-accent' : plan.tier === 'enterprise' ? 'text-graphite' : 'text-graphite/60'}`} />
                  <h2 className="text-xl font-semibold text-graphite">{plan.name}</h2>
                </div>

                <div className="mb-4">
                  {plan.monthlyPrice === 0 ? (
                    <div className="text-3xl font-bold text-graphite">Free</div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-graphite">
                        ${plan.monthlyPrice}
                      </span>
                      <span className="text-graphite/60 text-sm">/month</span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-graphite/60 mb-6 flex-grow">{plan.description}</p>

                {/* Feature summary */}
                <ul className="space-y-2 mb-6">
                  {tierFeatures.slice(0, 6).map((f) => (
                    <li key={f.key} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-graphite">{f.name}</span>
                    </li>
                  ))}
                  {tierFeatures.length > 6 && (
                    <li className="text-sm text-graphite/60 pl-6">
                      +{tierFeatures.length - 6} more features
                    </li>
                  )}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => !isCurrentPlan && handleUpgrade(plan.tier)}
                  disabled={isCurrentPlan}
                  className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${
                    isCurrentPlan
                      ? 'bg-accent-soft/20 text-graphite/60 cursor-not-allowed'
                      : colors.button
                  }`}
                >
                  {isCurrentPlan ? 'Current Plan' : plan.cta}
                  {!isCurrentPlan && plan.tier !== 'enterprise' && (
                    <ArrowRight className="inline-block w-4 h-4 ml-1" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* ── Feature Comparison Table ────────────────────────── */}
        <div>
          <h2 className="text-2xl font-bold font-sans text-graphite text-center mb-8">
            Full Feature Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-accent-soft">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-graphite w-1/3">
                    Feature
                  </th>
                  {pricing.map((p) => (
                    <th
                      key={p.tier}
                      className="py-3 px-4 text-center text-sm font-semibold text-graphite"
                    >
                      {p.name}
                      {p.tier === currentTier && (
                        <span className="ml-1 text-xs text-emerald-600">(You)</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => {
                  const catFeatures = features.filter((f) => f.category === cat);
                  return (
                    <tbody key={cat}>
                      <tr className="bg-background/50">
                        <td
                          colSpan={4}
                          className="py-2 px-4 text-xs font-semibold uppercase tracking-wider text-graphite/60"
                        >
                          {CATEGORY_LABELS[cat]}
                        </td>
                      </tr>
                      {catFeatures.map((f) => (
                        <tr key={f.key} className="border-b border-accent-soft/30 hover:bg-background/30">
                          <td className="py-3 px-4">
                            <div className="text-sm font-medium text-graphite">{f.name}</div>
                            <div className="text-xs text-graphite/60">{f.description}</div>
                          </td>
                          {(['basic', 'professional', 'enterprise'] as BrandTier[]).map((tier) => (
                            <td key={tier} className="py-3 px-4 text-center">
                              {f.includedIn[tier] ? (
                                <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                              ) : (
                                <X className="w-5 h-5 text-accent-soft mx-auto" />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── FAQ Section ─────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold font-sans text-graphite text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-accent-soft/30 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between py-4 px-5 text-left hover:bg-background/50 transition-colors"
                >
                  <span className="text-sm font-medium text-graphite">{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-4 h-4 text-graphite/60 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-graphite/60 flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-graphite/60">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
