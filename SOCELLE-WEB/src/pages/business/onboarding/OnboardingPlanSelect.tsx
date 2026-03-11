import { Check } from 'lucide-react';
import { useSubscriptionPlans } from '../../../modules/_core/hooks/useSubscriptionPlans';
import type { Plan } from '../../../modules/_core/hooks/useSubscriptionPlans';

export type SelectedPlanSlug = string | null;

interface OnboardingPlanSelectProps {
  selectedPlan: SelectedPlanSlug;
  onSelectPlan: (slug: string) => void;
  onNext: () => void;
  onBack: () => void;
}

function PlanCard({
  plan,
  isSelected,
  onSelect,
}: {
  plan: Plan;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isFree = plan.price_monthly === 0;

  return (
    <button
      onClick={onSelect}
      className={`relative flex flex-col items-start text-left p-5 rounded-xl border-2 transition-all ${
        isSelected
          ? 'border-accent bg-accent-soft/50 ring-1 ring-accent/20'
          : plan.is_featured
            ? 'border-accent/30 bg-white hover:border-accent/50'
            : 'border-graphite/10 bg-white hover:border-accent/30'
      }`}
    >
      {isSelected && (
        <span className="absolute top-3 right-3 bg-accent text-white rounded-full p-0.5">
          <Check className="w-3 h-3" />
        </span>
      )}

      {plan.is_featured && !isSelected && (
        <span className="absolute -top-2.5 left-4 text-[10px] font-semibold bg-accent text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
          Popular
        </span>
      )}

      <h3 className={`text-sm font-semibold ${isSelected ? 'text-accent' : 'text-graphite'}`}>
        {plan.name}
      </h3>

      <div className="mt-1.5 flex items-baseline gap-1">
        <span className={`text-xl font-bold ${isSelected ? 'text-accent' : 'text-graphite'}`}>
          {isFree ? 'Free' : `$${plan.price_monthly}`}
        </span>
        {!isFree && <span className="text-xs text-graphite/50">/mo</span>}
      </div>

      {plan.description && (
        <p className="text-xs text-graphite/60 mt-2 leading-relaxed line-clamp-2">
          {plan.description}
        </p>
      )}

      {plan.trial_days > 0 && (
        <span className="inline-block mt-2 text-[10px] font-medium text-signal-up bg-signal-up/10 px-2 py-0.5 rounded-full">
          {plan.trial_days}-day free trial
        </span>
      )}
    </button>
  );
}

export default function OnboardingPlanSelect({
  selectedPlan,
  onSelectPlan,
  onNext,
  onBack,
}: OnboardingPlanSelectProps) {
  const { plans, isLoading } = useSubscriptionPlans();

  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-semibold text-graphite tracking-tight">
          Choose your plan
        </h1>
        <p className="text-graphite/60 text-base">
          Start free and upgrade anytime as your needs grow.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : plans.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isSelected={selectedPlan === plan.slug}
              onSelect={() => onSelectPlan(plan.slug)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
          {/* Fallback when DB plans unavailable */}
          {[
            { slug: 'free', name: 'Free', price: 'Free', desc: 'Basic intelligence feed access' },
            { slug: 'starter', name: 'Starter', price: '$29', desc: 'Expanded signals and AI tools' },
            { slug: 'pro', name: 'Pro', price: '$79', desc: 'Full intelligence suite with unlimited access' },
            { slug: 'enterprise', name: 'Enterprise', price: 'Custom', desc: 'Dedicated support and custom integrations' },
          ].map((p) => (
            <button
              key={p.slug}
              onClick={() => onSelectPlan(p.slug)}
              className={`relative flex flex-col items-start text-left p-5 rounded-xl border-2 transition-all ${
                selectedPlan === p.slug
                  ? 'border-accent bg-accent-soft/50 ring-1 ring-accent/20'
                  : 'border-graphite/10 bg-white hover:border-accent/30'
              }`}
            >
              {selectedPlan === p.slug && (
                <span className="absolute top-3 right-3 bg-accent text-white rounded-full p-0.5">
                  <Check className="w-3 h-3" />
                </span>
              )}
              <h3 className={`text-sm font-semibold ${selectedPlan === p.slug ? 'text-accent' : 'text-graphite'}`}>
                {p.name}
              </h3>
              <span className={`text-xl font-bold mt-1 ${selectedPlan === p.slug ? 'text-accent' : 'text-graphite'}`}>
                {p.price}
              </span>
              {p.price !== 'Free' && p.price !== 'Custom' && (
                <span className="text-xs text-graphite/50">/mo</span>
              )}
              <p className="text-xs text-graphite/60 mt-2">{p.desc}</p>
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-graphite/40 text-center max-w-sm">
        You can change your plan at any time from Settings. All paid plans include a free trial.
      </p>

      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="text-graphite/60 hover:text-graphite font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!selectedPlan}
          className="bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium px-8 py-2.5 rounded-lg transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
