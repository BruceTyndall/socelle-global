// ── Treatment Protocol & CE Credit Types ────────────────────────────

export type ProtocolCategory = 'facial' | 'body' | 'wellness' | 'clinical' | 'oncology';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface ProtocolProduct {
  name: string;
  brand: string;
  usage: string;
}

export interface ProtocolStep {
  stepNumber: number;
  title: string;
  description: string;
  durationMinutes: number;
  products: ProtocolProduct[];
}

export interface TreatmentProtocol {
  id: string;
  title: string;
  slug: string;
  category: ProtocolCategory;
  subcategory?: string;
  description: string;
  durationMinutes: number;
  skillLevel: SkillLevel;
  skinConcerns: string[];
  contraindications: string[];
  steps: ProtocolStep[];
  ceEligible: boolean;
  ceCredits?: number;
  brandName?: string;
  published: boolean;
  adoptionCount: number;
}

export interface CECredit {
  id: string;
  protocolId?: string;
  contentId?: string;
  creditsEarned: number;
  earnedAt: string;
  certificateUrl?: string;
}

export interface CEProgress {
  totalEarned: number;
  goal: number;
  periodStart: string;
  periodEnd: string;
  credits: CECredit[];
}
