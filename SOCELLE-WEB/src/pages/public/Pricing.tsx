import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Check, X, ChevronDown, Star, ArrowRight } from 'lucide-react';
import { useSubscriptionPlans, type Plan } from '../../modules/_core/hooks/useSubscriptionPlans';
import { useSubscription } from '../../modules/_core/hooks/useSubscription';
import { useAuth } from '../../lib/auth';
import { MODULE_META, getModuleMeta } from '../../modules/_core/components/UpgradePrompt';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';

// ── FAQ data ────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    q: 'Can I change my plan later?',
    a: 'Yes. You can upgrade or downgrade at any time. Changes take effect at the start of your next billing cycle.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Plans with trial availability will show a "Start Free Trial" option. Trial length varies by plan.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards. Enterprise plans can be invoiced with NET-30 terms.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel from your account settings. You retain access until the end of your current billing period.',
  },
  {
    q: 'Do annual plans include a discount?',
    a: 'Yes. Annual billing saves you money compared to monthly billing. The exact savings are shown on each plan card.',
  },
];

// ── Page ────────────────────────────────────────────────────────────────────

export default function Pricing() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { plans, isLoading } = useSubscriptionPlans();
  const { plan: currentPlan, status } = useSubscription();
  const { user } = useAuth();

  const isSubscribed = status !== 'none' && currentPlan !== null;

  // All unique module keys across all plans
  const allModuleKeys = useMemo(() => {
    const keys = new Set<string>();
    plans.forEach((p) => p.modules_included?.forEach((m: string) => keys.add(m)));
    return Array.from(keys);
  }, [plans]);

  return (
    <>
      <Helmet>
        <title>Pricing | Socelle</title>
        <meta name="description" content="Choose the right plan for your professional beauty business. Intelligence-first pricing with modular access to market signals and AI tools." />
        <meta property="og:title" content="Pricing | Socelle" />
        <meta property="og:description" content="Choose the right plan for your professional beauty business. Intelligence-first pricing with modular access." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://socelle.com/pricing" />
        <meta property="og:image" content="https://socelle.com/og-image.svg" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://socelle.com/pricing" />
      </Helmet>

      <MainNav />

      <main id="main-content" className="bg-mn-bg min-h-screen">
        {/* Hero */}
        <section className="pt-24 pb-12 px-4 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent mb-4">
            Pricing
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold text-graphite mb-4 max-w-2xl mx-auto leading-tight">
            The right plan for your practice
          </h1>
          <p className="text-graphite/60 text-lg max-w-xl mx-auto mb-8">
            Start free. Upgrade when you need deeper intelligence, more modules, or team access.
          </p>

          {/* Billing toggle */}
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
        </section>

        {/* Plan cards */}
        <section className="max-w-6xl mx-auto px-4 pb-16">
          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-graphite/10 p-8 animate-pulse">
                  <div className="h-5 bg-graphite/10 rounded w-1/3 mb-4" />
                  <div className="h-8 bg-graphite/10 rounded w-1/2 mb-6" />
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="h-3 bg-graphite/5 rounded w-full" />
                    ))}
                  </div>
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
            <div className={`grid gap-6 ${
              plans.length === 1 ? 'max-w-md mx-auto' :
              plans.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' :
              plans.length <= 4 ? 'md:grid-cols-3 lg:grid-cols-' + Math.min(plans.length, 4) :
              'md:grid-cols-3 lg:grid-cols-4'
            }`}>
              {plans.map((plan: Plan) => {
                const price = billing === 'monthly' ? plan.price_monthly : plan.price_annual;
                const isCurrent = isSubscribed && currentPlan?.id === plan.id;
                const annualSavings = plan.price_monthly > 0
                  ? Math.round((1 - plan.price_annual / (plan.price_monthly * 12)) * 100)
                  : 0;

                return (
                  <div
                    key={plan.id}
                    className={`relative bg-white rounded-2xl border p-8 flex flex-col ${
                      plan.is_featured
                        ? 'border-accent shadow-lg ring-1 ring-accent/20'
                        : 'border-graphite/10'
                    }`}
                  >
                    {/* Featured badge */}
                    {plan.is_featured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1 bg-accent text-white text-[11px] font-semibold px-3 py-1 rounded-full">
                          <Star className="w-3 h-3" aria-hidden="true" />
                          Most Popular
                        </span>
                      </div>
                    )}

                    {/* Plan name */}
                    <h3 className="text-lg font-semibold text-graphite mb-1">{plan.name}</h3>
                    {plan.description && (
                      <p className="text-sm text-graphite/50 mb-4">{plan.description}</p>
                    )}

                    {/* Price */}
                    <div className="mb-6">
                      {price === 0 ? (
                        <span className="text-3xl font-bold text-graphite">Free</span>
                      ) : (
                        <>
                          <span className="text-3xl font-bold text-graphite">${price}</span>
                          <span className="text-graphite/40 text-sm">
                            /{billing === 'monthly' ? 'mo' : 'yr'}
                          </span>
                          {billing === 'annual' && annualSavings > 0 && (
                            <span className="ml-2 text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                              Save {annualSavings}%
                            </span>
                          )}
                        </>
                      )}
                    </div>

                    {/* Modules included */}
                    <ul className="space-y-2.5 mb-8 flex-1">
                      {allModuleKeys.map((key) => {
                        const included = plan.modules_included?.includes(key);
                        const meta = getModuleMeta(key);
                        return (
                          <li key={key} className="flex items-center gap-2 text-sm">
                            {included ? (
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0" aria-hidden="true" />
                            ) : (
                              <X className="w-4 h-4 text-graphite/20 flex-shrink-0" aria-hidden="true" />
                            )}
                            <span className={included ? 'text-graphite' : 'text-graphite/30'}>
                              {meta.label}
                            </span>
                          </li>
                        );
                      })}
                    </ul>

                    {/* CTA */}
                    {isCurrent ? (
                      <div className="h-11 flex items-center justify-center bg-graphite/5 text-graphite text-sm font-semibold rounded-full">
                        Current Plan
                      </div>
                    ) : price === 0 ? (
                      <Link
                        to={user ? '/portal/subscription' : '/portal/signup'}
                        className="h-11 flex items-center justify-center gap-2 bg-mn-dark text-white text-sm font-semibold rounded-full hover:bg-graphite transition-colors"
                      >
                        Start Free
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </Link>
                    ) : plan.trial_days > 0 ? (
                      <Link
                        to={user ? '/portal/subscription' : '/portal/signup'}
                        className="h-11 flex items-center justify-center gap-2 bg-mn-dark text-white text-sm font-semibold rounded-full hover:bg-graphite transition-colors"
                      >
                        Start {plan.trial_days}-Day Trial
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </Link>
                    ) : plan.price_monthly >= 500 ? (
                      <Link
                        to="/request-access"
                        className="h-11 flex items-center justify-center gap-2 border border-accent text-accent text-sm font-semibold rounded-full hover:bg-accent/5 transition-colors"
                      >
                        Contact Us
                      </Link>
                    ) : (
                      <Link
                        to={user ? '/portal/subscription' : '/portal/signup'}
                        className="h-11 flex items-center justify-center gap-2 bg-mn-dark text-white text-sm font-semibold rounded-full hover:bg-graphite transition-colors"
                      >
                        Upgrade
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* DEMO label */}
          <div className="text-center mt-8">
            <span className="inline-block text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              DEMO
            </span>
          </div>
        </section>

        {/* Module comparison table */}
        {!isLoading && plans.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 pb-16">
            <h2 className="text-2xl font-semibold text-graphite text-center mb-8">
              Module comparison
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full bg-white rounded-2xl border border-graphite/10 overflow-hidden">
                <thead>
                  <tr className="border-b border-graphite/10">
                    <th className="text-left text-sm font-medium text-graphite/50 px-6 py-4">Module</th>
                    {plans.map((p: Plan) => (
                      <th key={p.id} className="text-center text-sm font-semibold text-graphite px-4 py-4">
                        {p.name}
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
          </section>
        )}

        {/* FAQ */}
        <section className="max-w-2xl mx-auto px-4 pb-24">
          <h2 className="text-2xl font-semibold text-graphite text-center mb-8">
            Frequently asked questions
          </h2>
          <div className="space-y-2">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="bg-white rounded-xl border border-graphite/10 overflow-hidden">
                <button
                  type="button"
                  aria-expanded={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="text-sm font-medium text-graphite">{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-graphite/40 transition-transform ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-graphite/60 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
