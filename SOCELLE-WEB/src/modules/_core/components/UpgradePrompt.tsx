import { Link } from 'react-router-dom';
import { Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useSubscriptionPlans, type Plan } from '../hooks/useSubscriptionPlans';
import { MODULE_KEYS } from '../context/ModuleAccessContext';

// ── Module metadata ─────────────────────────────────────────────────────────

const MODULE_META: Record<string, { label: string; description: string }> = {
  MODULE_SHOP: {
    label: 'Shop',
    description: 'Access the professional product marketplace with wholesale pricing and direct ordering.',
  },
  MODULE_INGREDIENTS: {
    label: 'Ingredient Intelligence',
    description: 'Deep ingredient analysis, interaction checks, and formulation intelligence.',
  },
  MODULE_EDUCATION: {
    label: 'Education',
    description: 'Brand training modules, CE credit tracking, and protocol certification.',
  },
  MODULE_SALES: {
    label: 'Sales Tools',
    description: 'Pipeline management, proposal builder, and commission tracking.',
  },
  MODULE_MARKETING: {
    label: 'Marketing Suite',
    description: 'Campaign builder, audience segments, templates, and marketing calendar.',
  },
  MODULE_RESELLER: {
    label: 'Reseller Program',
    description: 'Wholesale access, tiered pricing, and reseller-exclusive promotions.',
  },
  MODULE_CRM: {
    label: 'CRM',
    description: 'Client management, communication tracking, and relationship intelligence.',
  },
  MODULE_MOBILE: {
    label: 'Mobile Access',
    description: 'Full platform access from the Socelle mobile app.',
  },
};

function getModuleMeta(moduleKey: string) {
  return MODULE_META[moduleKey] ?? { label: moduleKey, description: 'This module requires a subscription.' };
}

// ── Component ───────────────────────────────────────────────────────────────

interface UpgradePromptProps {
  moduleKey: string;
}

export default function UpgradePrompt({ moduleKey }: UpgradePromptProps) {
  const { plans, isLoading } = useSubscriptionPlans();
  const meta = getModuleMeta(moduleKey);

  // Find plans that include this module
  const matchingPlans = plans.filter((p: Plan) =>
    p.modules_included?.includes(moduleKey),
  );

  // Check if any plan offers a trial
  const trialPlan = matchingPlans.find((p: Plan) => p.trial_days > 0);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full bg-white rounded-2xl border border-graphite/10 p-8 text-center shadow-sm">
        {/* Lock icon */}
        <div className="mx-auto w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-6">
          <Lock className="w-6 h-6 text-accent" />
        </div>

        {/* Module name */}
        <h2 className="text-2xl font-semibold text-graphite mb-2">{meta.label}</h2>
        <p className="text-graphite/60 text-sm leading-relaxed mb-6">{meta.description}</p>

        {/* What's included teaser */}
        {!isLoading && matchingPlans.length > 0 && (
          <div className="bg-mn-bg rounded-xl p-4 mb-6 text-left">
            <p className="text-xs font-medium text-graphite/50 uppercase tracking-wider mb-3">
              Available in
            </p>
            <ul className="space-y-2">
              {matchingPlans.map((p: Plan) => (
                <li key={p.id} className="flex items-center gap-2 text-sm text-graphite">
                  <Sparkles className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  <span className="font-medium">{p.name}</span>
                  <span className="text-graphite/40 ml-auto">
                    ${p.price_monthly}/mo
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {isLoading && (
          <div className="space-y-2 mb-6">
            <div className="h-3 bg-graphite/5 rounded-full animate-pulse w-3/4 mx-auto" />
            <div className="h-3 bg-graphite/5 rounded-full animate-pulse w-1/2 mx-auto" />
          </div>
        )}

        {/* CTAs with Mobile App Bounds (MOBILE-POWER-01) */}
        {('__TAURI__' in window || window.matchMedia('(display-mode: standalone)').matches) ? (
          <div className="bg-mn-bg border border-graphite/10 rounded-xl p-4 mt-2">
            <p className="text-sm font-medium text-graphite">
              To unlock this module, please upgrade your plan at <strong>socelle.com</strong>
            </p>
            <p className="text-xs text-graphite/60 mt-1">
              In-app subscription management is temporarily unavailable.
            </p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/plans"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 bg-mn-dark text-white text-sm font-semibold rounded-full transition-colors hover:bg-graphite"
            >
            View Plans
            <ArrowRight className="w-4 h-4" />
          </Link>

          {trialPlan && (
            <Link
              to="/plans"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 border border-accent text-accent text-sm font-semibold rounded-full transition-colors hover:bg-accent/5"
            >
              Start {trialPlan.trial_days}-Day Free Trial
            </Link>
          )}
        </div>
        )}

        {/* DEMO label per governance */}
        <p className="mt-6 text-[10px] text-graphite/30 uppercase tracking-widest">
          Subscription gating — DEMO
        </p>
      </div>
    </div>
  );
}

export { MODULE_KEYS, MODULE_META, getModuleMeta };
