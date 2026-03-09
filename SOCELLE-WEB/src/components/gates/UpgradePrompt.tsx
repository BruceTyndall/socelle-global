/**
 * UpgradePrompt — Reusable upgrade prompt card (V2-PLAT-05)
 *
 * Shows current tier vs required tier with feature comparison.
 * Pearl Mineral V2 styled. "View Plans" CTA links to /pricing.
 */

import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Tier } from '../../hooks/useTier';

// ── Tier Display Config ──────────────────────────────────────────────────────────

const TIER_DISPLAY: Record<Tier, { label: string; color: string }> = {
  free: { label: 'Free', color: 'text-graphite/50' },
  starter: { label: 'Starter', color: 'text-signal-warn' },
  pro: { label: 'Pro', color: 'text-accent' },
  enterprise: { label: 'Enterprise', color: 'text-signal-up' },
};

const TIER_FEATURES: Record<Tier, string[]> = {
  free: [
    'Top 3 national signals (current week)',
    'Demo-only AI tools',
  ],
  starter: [
    'Full national + limited local signals',
    'Explain Signal + Search AI tools',
    '500 credits/month',
    'CSV exports',
  ],
  pro: [
    'All regions + historical + local intelligence',
    'All 6 AI tools + briefs + plans',
    '2,500 credits/month',
    'CSV + PDF + branded exports',
  ],
  enterprise: [
    'Unlimited intelligence + API + custom feeds',
    'Unlimited AI tools + R&D Scout + MoCRA',
    '10,000 credits/month',
    'All exports + API + webhook',
  ],
};

// ── Props ────────────────────────────────────────────────────────────────────────

interface UpgradePromptProps {
  currentTier: Tier;
  requiredTier: Tier;
  /** Optional contextual message about what the user is trying to access. */
  contextMessage?: string;
}

// ── Component ────────────────────────────────────────────────────────────────────

export function UpgradePrompt({ currentTier, requiredTier, contextMessage }: UpgradePromptProps) {
  const required = TIER_DISPLAY[requiredTier];
  const features = TIER_FEATURES[requiredTier];

  return (
    <div className="bg-white rounded-xl border border-accent/20 shadow-sm p-6 md:p-8 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="font-sans font-semibold text-graphite text-base leading-tight">
            {requiredTier === 'enterprise'
              ? 'Enterprise access required'
              : `Upgrade to ${required.label}`}
          </h3>
          {contextMessage && (
            <p className="text-graphite/50 text-xs mt-0.5">{contextMessage}</p>
          )}
        </div>
      </div>

      {/* Tier comparison */}
      <div className="flex items-center gap-2 mb-5 text-sm font-sans">
        <span className={`font-medium ${TIER_DISPLAY[currentTier].color}`}>
          {TIER_DISPLAY[currentTier].label}
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-graphite/30" />
        <span className={`font-semibold ${required.color}`}>
          {required.label}
        </span>
      </div>

      {/* Features unlocked */}
      <div className="space-y-2 mb-6">
        <p className="text-xs font-medium text-graphite/50 uppercase tracking-wide">
          What you get
        </p>
        {features.map((feature, i) => (
          <div key={i} className="flex items-start gap-2.5 text-sm font-sans text-graphite">
            <div className="w-1 h-1 rounded-full bg-accent mt-2 flex-shrink-0" />
            {feature}
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link
        to="/pricing"
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-graphite text-white rounded-lg font-sans font-medium text-sm hover:bg-graphite/90 transition-colors duration-150"
      >
        View Plans
        <ArrowRight className="w-4 h-4" />
      </Link>

      <p className="text-xs font-sans text-graphite/40 text-center mt-3">
        Cancel anytime. No commitment.
      </p>
    </div>
  );
}
