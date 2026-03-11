// ── useBrandTier Hook ─────────────────────────────────────────────
// WO-24: Brand Intelligence Packages (Monetization)
// Local state only — no Supabase. Upgrade is stubbed.

import { useState, useCallback, useMemo } from 'react';
import type { BrandTier, BrandSubscription } from './types';
import {
  getCurrentSubscription,
  canAccessFeature,
  getRequiredTier,
  getTierFeatures,
} from '../../__fixtures__/mockTierData';

interface UseBrandTierReturn {
  /** Current subscription tier */
  currentTier: BrandTier;
  /** Full subscription object */
  subscription: BrandSubscription;
  /** Check if a feature is accessible on the current tier */
  canAccess: (featureKey: string) => boolean;
  /** Check if a feature is locked (not accessible) */
  isFeatureLocked: (featureKey: string) => boolean;
  /** Get the minimum tier required for a feature (null if feature not found) */
  requiredTierFor: (featureKey: string) => BrandTier | null;
  /** Stub upgrade function — returns a toast message */
  upgrade: (targetTier: BrandTier) => string;
  /** All available features for display */
  features: ReturnType<typeof getTierFeatures>;
}

export function useBrandTier(): UseBrandTierReturn {
  const [subscription] = useState<BrandSubscription>(getCurrentSubscription);

  const currentTier = subscription.tier;

  const canAccess = useCallback(
    (featureKey: string) => canAccessFeature(featureKey, currentTier),
    [currentTier],
  );

  const isFeatureLocked = useCallback(
    (featureKey: string) => !canAccessFeature(featureKey, currentTier),
    [currentTier],
  );

  const requiredTierFor = useCallback(
    (featureKey: string) => getRequiredTier(featureKey),
    [],
  );

  const upgrade = useCallback((_targetTier: BrandTier): string => {
    // STUB — billing integration deferred
    return 'Billing integration coming soon';
  }, []);

  const features = useMemo(() => getTierFeatures(), []);

  return {
    currentTier,
    subscription,
    canAccess,
    isFeatureLocked,
    requiredTierFor,
    upgrade,
    features,
  };
}
