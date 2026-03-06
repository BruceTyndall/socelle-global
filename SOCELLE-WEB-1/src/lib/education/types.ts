export type ContentType = 'protocol' | 'article' | 'video' | 'webinar' | 'ce_course';

export type ContentCategory =
  | 'treatment_protocols'
  | 'ingredient_science'
  | 'business_operations'
  | 'compliance_regulatory'
  | 'device_training'
  | 'retail_strategy';

export interface EducationContent {
  id: string;
  title: string;
  content_type: ContentType;
  category: ContentCategory;
  tags: string[];
  summary: string;
  duration_minutes?: number;
  ce_eligible: boolean;
  ce_credits?: number;
  brand_name?: string;
  thumbnail_url?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  published_at: string;
}

export interface EducationProgress {
  content_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_pct: number;
  completed_at?: string;
  ce_credits_earned: number;
}

export type EducationFilterKey = ContentCategory | 'all';
export type ContentTypeFilter = ContentType | 'all';
export type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';
export type SortKey = 'newest' | 'ce_credits' | 'difficulty';
