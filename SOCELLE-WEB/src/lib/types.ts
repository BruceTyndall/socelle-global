/**
 * Domain type definitions for the Beauty Platform.
 * Replaces all `any` usage across components and engines.
 */

import type { Json } from './database.types';

// ─── Brand & Theme ───────────────────────────────────────────────
export interface BrandThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  surface: string;
  text: string;
}

export interface BrandTheme {
  colors: BrandThemeColors;
  typography: 'luxury' | 'modern' | 'clinical';
  density: 'spacious' | 'balanced' | 'dense';
  hero_variant: 'full_bleed' | 'split' | 'video' | 'minimal' | 'editorial';
}

export interface Brand {
  id?: string;
  name: string;
  slug: string;
  description: string;
  long_description?: string | null;
  logo_url?: string | null;
  hero_image_url?: string | null;
  theme: BrandTheme;
  status?: string;
  is_published?: boolean;
}

export interface BrandListItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
}

// ─── Brand Page Modules ──────────────────────────────────────────
export interface ModuleConfig {
  headline?: string;
  subheadline?: string;
  button_label?: string;
  button_url?: string;
  background_image?: string;
  content?: string;
  images?: string[];
  stats?: StatItem[];
  body?: string;
  selected_protocol_ids?: string[];
  selected_pro_ids?: string[];
  selected_retail_ids?: string[];
}

export interface BrandModule {
  id: string;
  module_type: string;
  title: string;
  is_enabled: boolean;
  sort_order: number;
  layout_variant: string;
  config: ModuleConfig;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface TypographyStyles {
  headline: React.CSSProperties;
  body: React.CSSProperties;
}

export interface DensityStyles {
  padding: string;
  textSize: string;
}

// ─── Protocol & Products ─────────────────────────────────────────
export interface Protocol {
  id: string;
  name?: string;
  protocol_name?: string;
  category?: string;
  description?: string;
  duration?: string;
  typical_duration?: string | null;
  target_concerns?: string[];
  modalities_steps?: Json | null;
  allowed_products?: string[];
  contraindications?: string[];
  completion_status?: string;
  image_url?: string;
  /** Allow additional fields from Supabase queries */
  [key: string]: unknown;
}

export interface ProProduct {
  id: string;
  name?: string;
  product_name: string;
  product_function?: string;
  category?: string;
  key_ingredients?: string[];
  in_service_usage_allowed?: string;
  contraindications?: string[];
  unit_cost?: number | null;
  size?: string | null;
  image_url?: string;
  [key: string]: unknown;
}

export interface RetailProduct {
  id: string;
  name?: string;
  product_name: string;
  product_function?: string;
  category?: string;
  target_concerns?: string[];
  key_ingredients?: string[];
  regimen_placement?: string | null;
  retail_price?: number | null;
  size?: string | null;
  image_url?: string;
  [key: string]: unknown;
}

export interface BrandProducts {
  pro: ProProduct[];
  retail: RetailProduct[];
}

// ─── Sales Pipeline ──────────────────────────────────────────────
export interface Lead {
  id: string;
  spa_name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  lead_source: string;
  lead_status: string;
  estimated_value: number | null;
  current_plan_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  activity_type: string;
  description: string;
  created_at: string;
  created_by: string | null;
}

export interface NewActivity {
  activity_type: string;
  description: string;
}

// ─── AI Concierge ────────────────────────────────────────────────
export interface BudgetProfile {
  total_budget?: number;
  monthly_spend?: number;
  cost_target_per_service?: number;
  retail_revenue_goal?: number;
}

export interface ServiceMenuItem {
  name: string;
  category: string;
  duration: string | null;
  price: number | null;
  description: string | null;
}

// ─── Cart ────────────────────────────────────────────────────────
export interface CartItem {
  productId: string;
  productName: string;
  productType: 'pro' | 'retail';
  unitPrice: number;
  quantity: number;
  sku?: string;
  brandId?: string;
}

// ─── Mapping Engine ──────────────────────────────────────────────
export interface ParsedService {
  name: string;
  category: string;
  duration: string | null;
  price: number | null;
  description: string | null;
  keywords: string[];
}

export interface MappingMatch {
  solutionType: string;
  solutionReference: string;
  matchType: string;
  confidence: string;
  rationale: string;
  customBuildDetails: CustomBuildDetails | null;
  pricingGuidance: string;
}

export interface CustomBuildDetails {
  products?: string[];
  steps?: string[];
  preProducts?: string[];
  postProducts?: string[];
  retailExtension?: string[];
}

export interface COGSResult {
  status: 'Known' | 'Partial' | 'Unknown';
  amount: number | null;
}

// ─── Spa Onboarding ──────────────────────────────────────────────
export interface OnboardingState {
  step: number;
  spaName: string;
  spaType: string;
  menuText: string;
  menuId: string | null;
  mappings: ServiceMappingResult[];
  gaps: GapAnalysisItem[];
  rolloutPlanId: string | null;
}

export interface ServiceMappingResult {
  service_name: string;
  match_type: string;
  confidence_score: number;
  canonical_protocol_id: string | null;
  mapping_notes: string;
}

export interface GapAnalysisItem {
  gap_type: string;
  description: string;
  recommended_protocol: string | null;
  revenue_estimate: number | null;
  priority: string;
}

// ─── Treatment Costs ─────────────────────────────────────────────
export interface TreatmentCost {
  id: string;
  item_type: string;
  item_reference: string;
  cost_per_unit: number | null;
  unit_type: string | null;
  typical_usage_amount: number | null;
  notes: string | null;
}

// ─── MedSpa ──────────────────────────────────────────────────────
export interface MedSpaTreatment {
  id: string;
  treatment_name: string;
  why_popular: string;
  pre_treatment_products: string[];
  post_treatment_products: string[];
  retail_extension: string[];
}

export interface MedSpaProduct {
  id: string;
  product_name: string;
  medspa_application: string;
  priority: string;
}

// ─── Supabase query helpers ──────────────────────────────────────
export interface SupabaseQueryResult<T> {
  data: T[] | null;
  error: { message: string; code?: string } | null;
}
