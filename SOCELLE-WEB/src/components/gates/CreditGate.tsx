/**
 * CreditGate — Credit balance check wrapper (V2-PLAT-05)
 *
 * If user has sufficient credits, renders children.
 * If insufficient, shows a prompt with balance, cost, and purchase CTA.
 * Uses useCreditBalance from the Credit Economy module.
 */

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Coins, ArrowRight } from 'lucide-react';
import { useCreditBalance } from '../../lib/credits/useCreditBalance';
import { useAuth } from '../../lib/auth';

interface CreditGateProps {
  /** Number of credits this action costs. */
  cost: number;
  children: ReactNode;
  /** Called when user does not have enough credits. */
  onInsufficientCredits?: () => void;
}

export function CreditGate({ cost, children, onInsufficientCredits }: CreditGateProps) {
  const { isAdmin } = useAuth();
  const { balance, loading } = useCreditBalance();

  // Admin bypasses all credit gates — unlimited access for auditing/testing
  if (isAdmin) return <>{children}</>;

  // Loading skeleton
  if (loading) {
    return (
      <div className="animate-pulse space-y-4 py-8 px-4">
        <div className="h-4 bg-graphite/10 rounded w-3/4" />
        <div className="h-4 bg-graphite/10 rounded w-1/2" />
        <div className="h-20 bg-graphite/5 rounded-lg" />
      </div>
    );
  }

  // Sufficient credits
  if (balance.remaining >= cost) {
    return <>{children}</>;
  }

  // Insufficient credits — fire callback if provided
  if (onInsufficientCredits) {
    onInsufficientCredits();
  }

  return (
    <div className="bg-white rounded-xl border border-signal-warn/20 shadow-sm p-6 md:p-8 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-signal-warn/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <Coins className="w-5 h-5 text-signal-warn" />
        </div>
        <div>
          <h3 className="font-sans font-semibold text-graphite text-base leading-tight">
            Not enough credits
          </h3>
          <p className="text-graphite/50 text-xs mt-0.5">
            This action requires {cost} credits
          </p>
        </div>
      </div>

      {/* Balance breakdown */}
      <div className="bg-background rounded-lg p-4 mb-6 space-y-2">
        <div className="flex justify-between text-sm font-sans">
          <span className="text-graphite/60">Your balance</span>
          <span className="font-medium text-graphite">{balance.remaining.toLocaleString()} credits</span>
        </div>
        <div className="flex justify-between text-sm font-sans">
          <span className="text-graphite/60">Action cost</span>
          <span className="font-medium text-signal-warn">{cost.toLocaleString()} credits</span>
        </div>
        <div className="border-t border-graphite/10 pt-2 flex justify-between text-sm font-sans">
          <span className="text-graphite/60">Shortfall</span>
          <span className="font-medium text-signal-down">
            {(cost - balance.remaining).toLocaleString()} credits
          </span>
        </div>
      </div>

      {/* CTA */}
      <Link
        to="/portal/credits/purchase"
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-graphite text-white rounded-lg font-sans font-medium text-sm hover:bg-graphite/90 transition-colors duration-150"
      >
        Purchase Credits
        <ArrowRight className="w-4 h-4" />
      </Link>

      <p className="text-xs font-sans text-graphite/40 text-center mt-3">
        Credits are applied instantly after purchase.
      </p>
    </div>
  );
}
