/**
 * TierGate — Tier-based access wrapper (V2-PLAT-05)
 *
 * If user meets or exceeds the required tier, renders children.
 * Otherwise renders fallback or default PaywallOverlay with upgrade prompt.
 * Handles loading state with a skeleton placeholder.
 */

import type { ReactNode } from 'react';
import { useTier, type Tier } from '../../hooks/useTier';
import { PaywallOverlay } from './PaywallOverlay';

interface TierGateProps {
  requiredTier: Tier;
  children: ReactNode;
  /** Custom fallback when user does not meet the tier requirement. */
  fallback?: ReactNode;
  /** Optional message shown in the default upgrade prompt. */
  contextMessage?: string;
}

export function TierGate({ requiredTier, children, fallback, contextMessage }: TierGateProps) {
  const { tier, meetsMinimumTier, isLoading } = useTier();

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4 py-8 px-4">
        <div className="h-4 bg-graphite/10 rounded w-3/4" />
        <div className="h-4 bg-graphite/10 rounded w-1/2" />
        <div className="h-32 bg-graphite/5 rounded-lg" />
      </div>
    );
  }

  // User meets requirement
  if (meetsMinimumTier(requiredTier)) {
    return <>{children}</>;
  }

  // Custom fallback
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default: blurred preview with upgrade prompt overlay
  return (
    <PaywallOverlay
      currentTier={tier}
      requiredTier={requiredTier}
      contextMessage={contextMessage}
    >
      {children}
    </PaywallOverlay>
  );
}
