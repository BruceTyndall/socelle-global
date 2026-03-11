/**
 * UpgradeGate — Hard paywall component with tier-based access control
 *
 * Wraps premium content. Checks user's actual subscription tier from DB.
 * If user meets or exceeds the required tier, children render normally.
 * If not, shows a blurred overlay with upgrade CTA.
 *
 * Supports:
 * - Tier-based gating (free, starter, pro, enterprise)
 * - Expired subscription handling
 * - Past-due payment warnings
 * - Trial ending notices
 * - Locked preview with value proposition
 *
 * Usage:
 *   <UpgradeGate feature="gap_detail" requiredTier="pro">
 *     <GapsTab data={outputs.gaps} />
 *   </UpgradeGate>
 */

import { type ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, ArrowRight, Loader2, AlertTriangle, Clock, Sparkles } from 'lucide-react';
import { useTier, type Tier } from '../hooks/useTier';
import { useSubscription } from '../lib/useSubscription';
import { PAYMENT_BYPASS } from '../lib/paymentBypass';
import { useAuth } from '../lib/auth';

interface UpgradeGateProps {
  children: ReactNode;
  feature?: string;
  /** Required tier to access this content. Defaults to 'pro'. */
  requiredTier?: Tier;
  /** Show a teaser preview (blurred) of the content */
  showPreview?: boolean;
  /** Custom message */
  message?: string;
}

const FEATURE_MESSAGES: Record<string, { title: string; bullets: string[] }> = {
  gap_detail: {
    title: 'Access Full Gap Analysis',
    bullets: [
      'See every revenue gap with dollar estimates',
      'Get protocol-specific recommendations',
      'Download your personalized action plan',
    ],
  },
  protocol_matches: {
    title: 'Access Protocol Matching',
    bullets: [
      'See all matched protocols with confidence scores',
      'Get implementation guides for each match',
      'Access brand-specific product pairings',
    ],
  },
  retail_attach: {
    title: 'Access Retail Recommendations',
    bullets: [
      'See product-to-service pairings',
      'Get estimated retail uplift per chair',
      'Generate your opening order automatically',
    ],
  },
  activation_assets: {
    title: 'Access Activation Kit',
    bullets: [
      'Access marketing materials and training guides',
      'Download implementation roadmap',
      'Get brand-specific activation timeline',
    ],
  },
  ai_advisor: {
    title: 'Intelligence Advisor',
    bullets: [
      'Get personalized market intelligence',
      'Ask questions about products and protocols',
      'Receive data-driven business recommendations',
    ],
  },
  ai_brief: {
    title: 'Intelligence Briefs',
    bullets: [
      'Receive curated market intelligence reports',
      'Trend analysis with competitive context',
      'Actionable business recommendations',
    ],
  },
  default: {
    title: 'Upgrade to unlock',
    bullets: [
      'Full revenue intelligence dashboard',
      'Protocol matching with intelligence tools',
      'Opening order generation',
    ],
  },
};

const TIER_LABELS: Record<Tier, string> = {
  free: 'Free',
  starter: 'Starter',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

export default function UpgradeGate({
  children,
  feature = 'default',
  requiredTier = 'pro',
  showPreview = true,
  message,
}: UpgradeGateProps) {
  const { isAdmin } = useAuth();
  const { tier, meetsMinimumTier, isLoading: tierLoading } = useTier();
  const { isPastDue, isCanceled, loading: subLoading, startCheckout } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Admin bypasses all gates
  if (isAdmin) return <>{children}</>;

  if (PAYMENT_BYPASS) return <>{children}</>;

  const loading = tierLoading || subLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12" role="status" aria-label="Loading subscription status">
        <Loader2 className="w-6 h-6 animate-spin text-graphite/60" />
      </div>
    );
  }

  // User meets the required tier — grant access
  if (meetsMinimumTier(requiredTier)) {
    // Past-due warning banner (still has access but payment failing)
    if (isPastDue) {
      return (
        <div>
          <div className="bg-signal-warn/10 border border-signal-warn/20 rounded-lg px-4 py-3 mb-4 flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-signal-warn flex-shrink-0" />
            <p className="text-sm text-graphite font-sans">
              Your payment is past due. Please{' '}
              <Link to="/portal/subscription" className="font-medium text-accent underline">
                update your payment method
              </Link>{' '}
              to avoid losing access.
            </p>
          </div>
          {children}
        </div>
      );
    }
    return <>{children}</>;
  }

  // Canceled but still active until period end
  if (isCanceled) {
    return (
      <div>
        <div className="bg-accent/5 border border-accent/20 rounded-lg px-4 py-3 mb-4 flex items-center gap-3">
          <Clock className="w-4 h-4 text-accent flex-shrink-0" />
          <p className="text-sm text-graphite font-sans">
            Your subscription is canceled. You have access until the end of your billing period.{' '}
            <Link to="/portal/subscription" className="font-medium text-accent underline">
              Resubscribe
            </Link>{' '}
            to keep access.
          </p>
        </div>
        {children}
      </div>
    );
  }

  const featureInfo = FEATURE_MESSAGES[feature] || FEATURE_MESSAGES.default;

  const handleUpgrade = async () => {
    setCheckoutLoading(true);
    try {
      await startCheckout(`${requiredTier}_monthly`);
    } catch (err) {
      console.error('Upgrade failed:', err);
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="relative" role="region" aria-label={`${featureInfo.title} — requires ${TIER_LABELS[requiredTier]} plan`}>
      {/* Blurred content preview */}
      {showPreview && (
        <div className="pointer-events-none select-none" aria-hidden="true">
          <div className="blur-[6px] opacity-30 max-h-72 overflow-hidden">
            {children}
          </div>
        </div>
      )}

      {/* Paywall overlay */}
      <div className={`${showPreview ? 'absolute inset-0 flex items-center justify-center' : ''}`}>
        <div className="bg-white rounded-xl shadow-elevated border border-graphite/20 p-8 md:p-10 max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-graphite rounded-lg flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-sans font-semibold text-graphite text-base leading-tight">
                {featureInfo.title}
              </h3>
              {message && (
                <p className="text-graphite/60 text-xs mt-0.5">{message}</p>
              )}
            </div>
          </div>

          {/* Tier comparison */}
          <div className="flex items-center gap-2 mb-5 text-sm font-sans">
            <span className="text-graphite/50 font-medium">{TIER_LABELS[tier]}</span>
            <ArrowRight className="w-3.5 h-3.5 text-graphite/30" />
            <span className="font-semibold text-accent">{TIER_LABELS[requiredTier]}</span>
          </div>

          <div className="space-y-2.5 mb-7">
            {featureInfo.bullets.map((bullet, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm font-sans text-graphite">
                <div className="w-1 h-1 rounded-full bg-accent mt-2 flex-shrink-0" />
                {bullet}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <button
              onClick={handleUpgrade}
              disabled={checkoutLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-graphite text-white rounded-lg font-sans font-medium text-sm hover:bg-graphite/90 transition-colors duration-150 disabled:opacity-50"
            >
              {checkoutLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Upgrade to {TIER_LABELS[requiredTier]}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <Link
              to="/pricing"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-graphite/15 text-graphite rounded-lg font-sans font-medium text-sm hover:bg-graphite/5 transition-colors duration-150"
            >
              <Sparkles className="w-4 h-4" />
              Compare all plans
            </Link>

            <p className="text-xs font-sans text-graphite/60 text-center">
              Cancel anytime. No commitment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
