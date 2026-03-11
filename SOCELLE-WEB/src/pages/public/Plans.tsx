import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Check, X, Star, ChevronDown } from 'lucide-react';
import { useSubscriptionPlans, type Plan } from '../../modules/_core/hooks/useSubscriptionPlans';
import { useSubscription } from '../../modules/_core/hooks/useSubscription';
import { useTier } from '../../hooks/useTier';
import { useAuth } from '../../lib/auth';
import { getModuleMeta } from '../../modules/_core/components/UpgradePrompt';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import WordReveal from '../../components/motion/WordReveal';
import GlassAccordion from '../../components/sections/GlassAccordion';
import SiteFooter from '../../components/sections/SiteFooter';
import { useDataFeedStats } from '../../lib/intelligence/useDataFeedStats';
import { usePlatformStats } from '../../lib/usePlatformStats';

/* ══════════════════════════════════════════════════════════════════
   Plans — DB-backed pricing page with tier awareness
   Intelligence-first pricing for operators and brands
   ══════════════════════════════════════════════════════════════════ */

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

// ── Helpers ──────────────────────────────────────────────────────

function getCtaLabel(plan: Plan, isCurrent: boolean, isLoggedIn: boolean): string {
  if (isCurrent) return 'Current Plan';
  if (plan.price_monthly === 0) return isLoggedIn ? 'Downgrade to Free' : 'Create free account';
  if (plan.trial_days > 0) return `Start ${plan.trial_days}-Day Trial`;
  if (plan.price_monthly >= 500) return 'Contact Sales';
  return isLoggedIn ? `Upgrade to ${plan.name}` : `Start ${plan.name}`;
}

function getCtaLink(plan: Plan, isLoggedIn: boolean): string {
  if (plan.price_monthly >= 500) return '/request-access';
  return isLoggedIn ? '/portal/subscription' : '/portal/signup';
}

// ── Page ─────────────────────────────────────────────────────────

export default function Plans() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const { plans, isLoading: plansLoading } = useSubscriptionPlans();
  const { plan: currentPlan, status, isPastDue, isTrialing } = useSubscription();
  const { tier, isDemo: tierIsDemo } = useTier();
  const { user } = useAuth();
  const { totalSignals, totalFeeds, isLive: feedsLive } = useDataFeedStats();
  const { stats, isLive: statsLive } = usePlatformStats();
  const socialProofLive = feedsLive || statsLive;
  const isSubscribed = status !== 'none' && currentPlan !== null;

  // All unique module keys across all plans
  const allModuleKeys = useMemo(() => {
    const keys = new Set<string>();
    plans.forEach((p) => p.modules_included?.forEach((m: string) => keys.add(m)));
    return Array.from(keys);
  }, [plans]);

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>Plans — Socelle</title>
        <meta
          name="description"
          content="Intelligence that scales with your business. Choose the right plan for your professional beauty business."
        />
        <meta property="og:title" content="Plans — Socelle" />
        <meta
          property="og:description"
          content="Transparent pricing for professional beauty intelligence. Start free, scale when ready."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://socelle.com/plans" />
        <meta property="og:image" content="https://socelle.com/og-image.svg" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://socelle.com/plans" />
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

      <main id="main-content">
        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section className="relative bg-mn-bg py-20 lg:py-28 overflow-hidden">
          <img
            src="/images/brand/photos/21.svg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-[0.05] pointer-events-none select-none"
          />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
                <p className="text-body-lg text-graphite/60 max-w-xl mx-auto mb-8">
                  Choose your access level. Upgrade when you need deeper intelligence and benchmarks.
                </p>
              </BlockReveal>

              {/* Current tier indicator for logged-in users */}
              {user && (
                <BlockReveal delay={250}>
                  <div className="flex justify-center mb-6">
                    <div className="inline-flex items-center gap-2 bg-white rounded-full border border-graphite/10 px-4 py-2 text-sm font-sans">
                      <span className="text-graphite/60">Your current plan:</span>
                      <span className="font-semibold text-accent capitalize">
                        {isSubscribed && currentPlan ? currentPlan.name : tier}
                      </span>
                      {isPastDue && (
                        <span className="text-[10px] font-bold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">
                          Past Due
                        </span>
                      )}
                      {isTrialing && (
                        <span className="text-[10px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                          Trial
                        </span>
                      )}
                    </div>
                  </div>
                </BlockReveal>
              )}

              {/* Billing toggle */}
              <BlockReveal delay={300}>
                <div className="inline-flex items-center bg-white rounded-full border border-graphite/10 p-1" role="group" aria-label="Billing period">
                  <button
                    type="button"
                    aria-pressed={billing === 'monthly'}
                    onClick={() => setBilling('monthly')}
                    className={`px-5 py-2 text-sm font-medium rounded-full transition-colors ${
                      billing === 'monthly'
                        ? 'bg-mn-dark text-white'
                        : 'text-graphite/60 hover:text-graphite'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    aria-pressed={billing === 'annual'}
                    onClick={() => setBilling('annual')}
                    className={`px-5 py-2 text-sm font-medium rounded-full transition-colors flex items-center gap-2 ${
                      billing === 'annual'
                        ? 'bg-mn-dark text-white'
                        : 'text-graphite/60 hover:text-graphite'
                    }`}
                  >
                    Annual
                    <span className="text-[10px] font-bold bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                      Save
                    </span>
                  </button>
                </div>
              </BlockReveal>
            </div>
          </div>
        </section>

        {/* ── Social Proof Strip ───────────────────────────────────── */}
        <section className="border-y border-graphite/6 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-14">
              {[
                { value: feedsLive ? totalSignals.toLocaleString() : '--', label: 'Signals tracked' },
                { value: statsLive ? stats.brandsCount.toLocaleString() : '--', label: 'Verified brands' },
                { value: feedsLive ? totalFeeds.toLocaleString() : '--', label: 'Data sources' },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <p className="font-sans font-semibold text-2xl text-graphite">{item.value}</p>
                  <p className="text-xs text-graphite/45 font-sans mt-0.5">{item.label}</p>
                </div>
              ))}
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${socialProofLive ? 'bg-signal-up/10 text-signal-up' : 'bg-signal-warn/10 text-signal-warn'}`}>
                {socialProofLive ? 'LIVE' : 'DEMO'}
              </span>
            </div>
          </div>
        </section>

        {/* ── Plan Cards (DB-backed) ──────────────────────────────── */}
        <section className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {plansLoading ? (
              <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white/60 backdrop-blur-[12px] rounded-2xl border border-white/30 p-8 lg:p-10 animate-pulse">
                    <div className="h-4 bg-graphite/10 rounded w-1/3 mb-4" />
                    <div className="h-10 bg-graphite/10 rounded w-1/2 mb-6" />
                    <div className="space-y-3 mb-8">
                      {[1, 2, 3, 4].map((j) => (
                        <div key={j} className="h-3 bg-graphite/5 rounded w-full" />
                      ))}
                    </div>
                    <div className="h-11 bg-graphite/10 rounded-full" />
                  </div>
                ))}
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-graphite/40 text-sm">No plans available at this time.</p>
                <span className="inline-block mt-2 text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                  DEMO
                </span>
              </div>
            ) : (
              <div className={`grid gap-6 max-w-5xl mx-auto ${
                plans.length <= 2 ? 'md:grid-cols-2' :
                plans.length === 3 ? 'md:grid-cols-3' :
                'md:grid-cols-2 lg:grid-cols-' + Math.min(plans.length, 4)
              }`}>
                {plans.map((plan: Plan, i: number) => {
                  const price = billing === 'monthly' ? plan.price_monthly : plan.price_annual;
                  const isCurrent = isSubscribed && currentPlan?.id === plan.id;
                  const annualSavings = plan.price_monthly > 0
                    ? Math.round((1 - plan.price_annual / (plan.price_monthly * 12)) * 100)
                    : 0;
                  const ctaLabel = getCtaLabel(plan, isCurrent, !!user);
                  const ctaLink = getCtaLink(plan, !!user);

                  return (
                    <BlockReveal key={plan.id} delay={i * 100}>
                      <div
                        className={`relative flex flex-col h-full rounded-2xl overflow-hidden transition-shadow duration-300 hover:shadow-md ${
                          plan.is_featured
                            ? 'bg-white/60 backdrop-blur-[12px] border-2 border-accent/30 shadow-md'
                            : 'bg-white/60 backdrop-blur-[12px] border border-white/30'
                        }`}
                      >
                        {plan.is_featured && <div className="h-[3px] bg-accent" />}

                        {/* Featured badge */}
                        {plan.is_featured && (
                          <div className="absolute top-4 right-4">
                            <span className="inline-flex items-center gap-1 bg-accent text-white text-[11px] font-semibold px-3 py-1 rounded-full">
                              <Star className="w-3 h-3" aria-hidden="true" />
                              Most Popular
                            </span>
                          </div>
                        )}

                        <div className="p-8 lg:p-10 flex-1 flex flex-col">
                          {/* Plan name */}
                          <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-3">
                            {plan.name}
                          </p>

                          {/* Price */}
                          <div className="flex items-baseline gap-1 mb-3">
                            {price === 0 ? (
                              <span className="font-sans font-semibold text-[2.5rem] text-graphite leading-none">
                                Free
                              </span>
                            ) : (
                              <>
                                <span className="font-sans font-semibold text-[2.5rem] text-graphite leading-none">
                                  ${price}
                                </span>
                                <span className="text-sm text-graphite/40 font-sans">
                                  /{billing === 'monthly' ? 'mo' : 'yr'}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Annual savings */}
                          {billing === 'annual' && annualSavings > 0 && (
                            <span className="inline-block w-fit mb-3 text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                              Save {annualSavings}% vs monthly
                            </span>
                          )}

                          {/* Description */}
                          {plan.description && (
                            <p className="text-sm text-graphite/60 leading-relaxed mb-8">
                              {plan.description}
                            </p>
                          )}

                          {/* Module features */}
                          <ul className="space-y-2.5 mb-8 flex-1">
                            {allModuleKeys.map((key) => {
                              const included = plan.modules_included?.includes(key);
                              const meta = getModuleMeta(key);
                              return (
                                <li key={key} className="flex items-center gap-2.5 text-sm">
                                  {included ? (
                                    <Check className="w-4 h-4 text-accent flex-shrink-0" aria-hidden="true" />
                                  ) : (
                                    <X className="w-4 h-4 text-graphite/20 flex-shrink-0" aria-hidden="true" />
                                  )}
                                  <span className={`font-sans ${included ? 'text-graphite' : 'text-graphite/30'}`}>
                                    {meta.label}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>

                          {/* CTA */}
                          {isCurrent ? (
                            <div className="w-full h-11 flex items-center justify-center bg-graphite/5 text-graphite text-sm font-semibold rounded-full">
                              Current Plan
                            </div>
                          ) : (
                            <Link
                              to={ctaLink}
                              className={`w-full h-11 flex items-center justify-center gap-2 text-sm font-semibold rounded-full transition-colors ${
                                plan.is_featured
                                  ? 'bg-mn-dark text-white hover:bg-graphite'
                                  : plan.price_monthly >= 500
                                    ? 'border border-accent text-accent hover:bg-accent/5'
                                    : 'bg-mn-dark text-white hover:bg-graphite'
                              }`}
                            >
                              {ctaLabel}
                              <ArrowRight className="w-4 h-4" aria-hidden="true" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </BlockReveal>
                  );
                })}
              </div>
            )}

            {/* Data source label */}
            <div className="text-center mt-8">
              <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                !plansLoading && plans.length > 0
                  ? 'bg-signal-up/10 text-signal-up'
                  : 'bg-signal-warn/10 text-signal-warn'
              }`}>
                {!plansLoading && plans.length > 0 ? 'LIVE' : 'DEMO'}
              </span>
            </div>
          </div>
        </section>

        {/* ── Module Comparison Table ──────────────────────────────── */}
        {!plansLoading && plans.length > 0 && allModuleKeys.length > 0 && (
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
                    Module comparison
                  </h2>
                </BlockReveal>
              </div>

              <BlockReveal delay={200}>
                <div className="max-w-4xl mx-auto overflow-x-auto">
                  <table className="w-full text-left bg-white rounded-2xl border border-graphite/10 overflow-hidden">
                    <thead>
                      <tr className="border-b border-graphite/10">
                        <th className="text-left text-sm font-medium text-graphite/50 px-6 py-4">Module</th>
                        {plans.map((p: Plan) => (
                          <th key={p.id} className={`text-center text-sm font-semibold px-4 py-4 ${
                            p.is_featured ? 'text-accent' : 'text-graphite'
                          }`}>
                            {p.name}
                            {isSubscribed && currentPlan?.id === p.id && (
                              <span className="block text-[10px] font-medium text-accent mt-0.5">
                                (Your plan)
                              </span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allModuleKeys.map((key, idx) => {
                        const meta = getModuleMeta(key);
                        return (
                          <tr key={key} className={idx % 2 === 0 ? '' : 'bg-mn-bg/50'}>
                            <td className="px-6 py-3 text-sm text-graphite">{meta.label}</td>
                            {plans.map((p: Plan) => (
                              <td key={p.id} className="text-center px-4 py-3">
                                {p.modules_included?.includes(key) ? (
                                  <Check className="w-4 h-4 text-green-600 mx-auto" aria-hidden="true" />
                                ) : (
                                  <X className="w-4 h-4 text-graphite/15 mx-auto" aria-hidden="true" />
                                )}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </BlockReveal>
            </div>
          </section>
        )}

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
                <p className="text-center text-sm text-graphite/60 font-sans mt-10">
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
              <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-mn-bg/45 mb-5">
                GET STARTED
              </p>
            </BlockReveal>
            <BlockReveal delay={100}>
              <h2 className="font-sans font-semibold text-section text-mn-bg mb-5">
                Ready to see the difference?
              </h2>
            </BlockReveal>
            <BlockReveal delay={200}>
              <p className="text-body text-mn-bg/55 max-w-md mx-auto mb-10">
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
      </main>

      <SiteFooter />
    </div>
  );
}
