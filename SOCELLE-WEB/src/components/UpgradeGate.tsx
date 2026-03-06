/**
 * UpgradeGate — Hard paywall component
 *
 * Wraps premium content. If user is Pro, children render normally.
 * If free, shows a blurred overlay with upgrade CTA.
 *
 * Usage:
 *   <UpgradeGate feature="gap_detail">
 *     <GapsTab data={outputs.gaps} />
 *   </UpgradeGate>
 */

import { ReactNode, useState } from 'react';
import { Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useSubscription } from '../lib/useSubscription';
import { PAYMENT_BYPASS } from '../lib/paymentBypass';

interface UpgradeGateProps {
  children: ReactNode;
  feature?: string;
  /** Show a teaser preview (blurred) of the content */
  showPreview?: boolean;
  /** Custom message */
  message?: string;
}

const FEATURE_MESSAGES: Record<string, { title: string; bullets: string[] }> = {
  gap_detail: {
    title: 'Unlock Full Gap Analysis',
    bullets: [
      'See every revenue gap with dollar estimates',
      'Get protocol-specific recommendations',
      'Download your personalized action plan',
    ],
  },
  protocol_matches: {
    title: 'Unlock Protocol Matching',
    bullets: [
      'See all matched protocols with confidence scores',
      'Get implementation guides for each match',
      'Access brand-specific product pairings',
    ],
  },
  retail_attach: {
    title: 'Unlock Retail Recommendations',
    bullets: [
      'See product-to-service pairings',
      'Get estimated retail uplift per chair',
      'Generate your opening order automatically',
    ],
  },
  activation_assets: {
    title: 'Unlock Activation Kit',
    bullets: [
      'Access marketing materials and training guides',
      'Download implementation roadmap',
      'Get brand-specific activation timeline',
    ],
  },
  default: {
    title: 'Upgrade to Socelle Pro',
    bullets: [
      'Full revenue intelligence dashboard',
      'Protocol matching with AI concierge',
      'Opening order generation',
    ],
  },
};

export default function UpgradeGate({
  children,
  feature = 'default',
  showPreview = true,
  message,
}: UpgradeGateProps) {
  const { isPro, loading, startCheckout } = useSubscription();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  if (PAYMENT_BYPASS) return <>{children}</>;

  // Pro users see everything
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-pro-warm-gray" />
      </div>
    );
  }

  if (isPro) {
    return <>{children}</>;
  }

  const featureInfo = FEATURE_MESSAGES[feature] || FEATURE_MESSAGES.default;

  const handleUpgrade = async () => {
    setCheckoutLoading(true);
    try {
      await startCheckout('pro_monthly');
    } catch (err) {
      console.error('Upgrade failed:', err);
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Blurred content preview */}
      {showPreview && (
        <div className="pointer-events-none select-none" aria-hidden="true">
          <div className="blur-[6px] opacity-30 max-h-72 overflow-hidden">
            {children}
          </div>
        </div>
      )}

      {/* Paywall overlay — intelligence-grade, not template */}
      <div className={`${showPreview ? 'absolute inset-0 flex items-center justify-center' : ''}`}>
        <div className="bg-white rounded-xl shadow-elevated border border-brand-border p-8 md:p-10 max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-pro-charcoal rounded-lg flex items-center justify-center flex-shrink-0">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-sans font-semibold text-pro-charcoal text-base leading-tight">
                {featureInfo.title}
              </h3>
              {message && (
                <p className="text-pro-warm-gray text-xs mt-0.5">{message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2.5 mb-7">
            {featureInfo.bullets.map((bullet, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm font-sans text-pro-charcoal">
                <div className="w-1 h-1 rounded-full bg-pro-gold mt-2 flex-shrink-0" />
                {bullet}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <button
              onClick={handleUpgrade}
              disabled={checkoutLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-pro-charcoal text-white rounded-lg font-sans font-medium text-sm hover:bg-pro-navy-dark transition-colors duration-150 disabled:opacity-50"
            >
              {checkoutLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Unlock for $29/mo
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-xs font-sans text-pro-warm-gray text-center">
              Cancel anytime. 7-day money-back guarantee.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
