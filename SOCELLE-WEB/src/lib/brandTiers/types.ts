// ── Brand Intelligence Tier Types ─────────────────────────────────
// WO-24: Brand Intelligence Packages (Monetization)

export type BrandTier = 'basic' | 'professional' | 'enterprise';

export type SubscriptionStatus = 'active' | 'trial' | 'past_due' | 'cancelled';

export interface TierFeature {
  /** Unique feature key used for access checks */
  key: string;
  /** Human-readable feature name */
  name: string;
  /** Short description shown in comparison tables */
  description: string;
  /** Whether each tier includes this feature */
  includedIn: Record<BrandTier, boolean>;
  /** Feature category for grouping in comparison table */
  category: 'intelligence' | 'reports' | 'tools' | 'support';
}

export interface BrandSubscription {
  brandId: string;
  tier: BrandTier;
  startDate: string;
  renewalDate: string;
  monthlyPrice: number;
  status: SubscriptionStatus;
  trialEndsAt?: string;
}

export interface ReportSection {
  id: string;
  title: string;
  summary: string;
  details: string[];
  /** Optional metric highlight */
  metric?: { label: string; value: string; trend?: 'up' | 'down' | 'flat' };
}

export interface IntelligenceReport {
  id: string;
  brandId: string;
  reportDate: string;
  title: string;
  sections: ReportSection[];
  pdfUrl?: string;
  generatedAt: string;
}

export interface TierPricing {
  tier: BrandTier;
  name: string;
  monthlyPrice: number;
  description: string;
  highlight?: string;
  cta: string;
}
