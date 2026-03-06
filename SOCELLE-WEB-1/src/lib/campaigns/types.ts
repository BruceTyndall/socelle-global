export type CampaignStatus = 'draft' | 'active' | 'scheduled' | 'completed' | 'archived';
export type DiscountType = 'percentage' | 'fixed';
export type OperatorTier = 'active' | 'elite' | 'master';
export type AutomationType = 'order_confirmation' | 'shipping_notification' | 'reorder_reminder';

export interface Campaign {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  discountType: DiscountType;
  discountValue: number;
  eligibleProducts: string[];
  eligibleTiers: OperatorTier[];
  status: CampaignStatus;
  targetOperatorCount: number;
  createdAt: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  type: AutomationType;
  enabled: boolean;
  triggerDays?: number; // for reorder reminder
  description: string;
  lastTriggered?: string;
  triggerCount: number;
}

export interface TierDiscount {
  id: string;
  tier: OperatorTier;
  discountPercent: number;
  minUnits?: number;
  description: string;
}

export interface VolumeDiscount {
  id: string;
  minUnits: number;
  maxUnits?: number;
  discountPercent: number;
}
