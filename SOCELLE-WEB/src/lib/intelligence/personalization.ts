import { supabase, isSupabaseConfigured } from '../supabase';
import { getSignalAnalyticsTagCodes } from './signalAnalytics';
import type { IntelligenceSignal } from './types';

type OnboardingRoleLike = 'operator' | 'provider' | 'brand' | 'student' | null;
type OnboardingVerticalLike = string | null;
type OnboardingInterestLike = string;

export type PreferenceSource = 'onboarding' | 'behavior' | 'manual';
export type PreferenceEventName =
  | 'signal_viewed'
  | 'signal_clicked'
  | 'signal_saved'
  | 'signal_liked'
  | 'signal_hidden';

export interface ApplyUserTagPreferenceDeltaInput {
  userId: string | null | undefined;
  tagCodes: string[];
  delta: number;
  source?: PreferenceSource;
  eventAt?: string;
}

export interface UserTagPreference {
  tag_code: string;
  score: number | null;
}

const VERTICAL_ENVIRONMENT_TAGS: Record<string, string[]> = {
  day_spa: ['day_spa', 'spa_market_trends'],
  medical_spa: ['medspa', 'medspa_market_trends'],
  hair_salon: ['hair_salon', 'salon_market_trends', 'hair_trends'],
  barbershop: ['barbershop', 'salon_market_trends', 'hair_trends'],
  nail_salon: ['nail_salon', 'nail_market_trends'],
  wellness_center: ['wellness_center', 'spa_market_trends', 'wellness_trends'],
  skincare_brand: ['professional_skincare_line', 'skincare_trends', 'professional_beauty_only'],
  haircare_brand: ['professional_haircare_line', 'hair_trends', 'professional_beauty_only'],
  professional_tools: ['professional_tools_equipment', 'beauty_industry_news', 'professional_beauty_only'],
  cosmetics: ['color_cosmetics', 'beauty_industry_news', 'professional_beauty_only'],
};

const ROLE_TAGS_BY_VERTICAL: Record<string, Partial<Record<string, string[]>>> = {
  operator: {
    medical_spa: ['medspa_owner'],
    day_spa: ['spa_owner'],
    hair_salon: ['salon_owner'],
    barbershop: ['salon_owner'],
    nail_salon: ['salon_owner'],
    wellness_center: ['spa_owner'],
  },
  provider: {
    esthetics: ['licensed_esthetician'],
    cosmetology: ['cosmetologist'],
    nursing: ['nurse_practitioner_aesthetic'],
    wellness_center: ['wellness_coach'],
  },
  student: {
    esthetics: ['student_trainee'],
    cosmetology: ['student_trainee'],
    nursing: ['student_trainee'],
    business_mgmt: ['student_trainee'],
  },
};

function getVerticalTrendTags(vertical: OnboardingVerticalLike): string[] {
  switch (vertical) {
    case 'medical_spa':
      return ['medspa_market_trends'];
    case 'day_spa':
    case 'wellness_center':
      return ['spa_market_trends', 'wellness_trends'];
    case 'hair_salon':
    case 'barbershop':
      return ['salon_market_trends', 'hair_trends'];
    case 'nail_salon':
      return ['nail_market_trends'];
    case 'skincare_brand':
      return ['skincare_trends', 'beauty_industry_news'];
    case 'haircare_brand':
      return ['hair_trends', 'beauty_industry_news'];
    case 'professional_tools':
    case 'cosmetics':
      return ['beauty_industry_news'];
    default:
      return ['beauty_industry_news', 'global_beauty_market'];
  }
}

function getInterestTags(
  interest: OnboardingInterestLike,
  vertical: OnboardingVerticalLike,
): string[] {
  switch (interest) {
    case 'market_intelligence':
      return ['beauty_industry_news', 'global_beauty_market'];
    case 'treatment_trends':
      return getVerticalTrendTags(vertical);
    case 'ingredient_research':
      return ['ingredient_trends', 'skincare_trends'];
    case 'competitive_analysis':
      return ['beauty_industry_news', 'global_beauty_market'];
    case 'revenue_optimization':
      return getVerticalTrendTags(vertical);
    case 'education_ce':
    case 'staff_training':
      return ['professional_education_trend'];
    case 'client_retention':
      return getVerticalTrendTags(vertical);
    default:
      return [];
  }
}

function dedupeTagCodes(tagCodes: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const tagCode of tagCodes) {
    if (!tagCode) continue;
    const normalized = tagCode.trim();
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    output.push(normalized);
  }

  return output;
}

export function buildOnboardingPreferenceSeedGroups(input: {
  role: OnboardingRoleLike;
  vertical: OnboardingVerticalLike;
  interests: OnboardingInterestLike[];
}): { primaryTags: string[]; secondaryTags: string[] } {
  const primaryTags = dedupeTagCodes([
    ...(input.vertical ? (VERTICAL_ENVIRONMENT_TAGS[input.vertical] ?? []) : []),
    ...(input.role && input.vertical
      ? (ROLE_TAGS_BY_VERTICAL[input.role]?.[input.vertical] ?? [])
      : input.role === 'student'
        ? ['student_trainee']
        : []),
  ]);

  const secondaryTags = dedupeTagCodes([
    ...getVerticalTrendTags(input.vertical),
    ...input.interests.flatMap((interest) => getInterestTags(interest, input.vertical)),
  ]).filter((tagCode) => !primaryTags.includes(tagCode));

  return { primaryTags, secondaryTags };
}

export const PREFERENCE_EVENT_WEIGHTS: Record<PreferenceEventName, number> = {
  signal_viewed: 0.5,
  signal_clicked: 1,
  signal_saved: 2,
  signal_liked: 1.5,
  signal_hidden: -3,
};

export async function applyUserTagPreferenceDelta(
  input: ApplyUserTagPreferenceDeltaInput,
): Promise<number> {
  const tagCodes = dedupeTagCodes(input.tagCodes);
  if (!isSupabaseConfigured || !input.userId || tagCodes.length === 0) {
    return 0;
  }

  const { data, error } = await supabase.rpc('apply_user_tag_preference_delta' as any, {
    p_user_id: input.userId,
    p_tag_codes: tagCodes,
    p_delta: input.delta,
    p_source: input.source ?? 'behavior',
    p_event_at: input.eventAt ?? new Date().toISOString(),
  });

  if (error) {
    throw error;
  }

  return typeof data === 'number' ? data : Number(data ?? 0);
}

export function buildPreferenceScoreMap(rows: UserTagPreference[]): Map<string, number> {
  const scoreMap = new Map<string, number>();

  for (const row of rows) {
    if (!row.tag_code) continue;
    const score = typeof row.score === 'number' ? row.score : 0;
    scoreMap.set(row.tag_code, (scoreMap.get(row.tag_code) ?? 0) + score);
  }

  return scoreMap;
}

export function getSignalPreferenceMatchScore(
  signal: IntelligenceSignal,
  scoreMap: ReadonlyMap<string, number>,
): number {
  if (scoreMap.size === 0) return 0;

  return getSignalAnalyticsTagCodes(signal).reduce((total, tagCode) => {
    const score = scoreMap.get(tagCode) ?? 0;
    return score > 0 ? total + score : total;
  }, 0);
}

export function applyPreferenceBoost(
  signal: IntelligenceSignal,
  baseRank: number,
  scoreMap: ReadonlyMap<string, number>,
): number {
  const matchScore = getSignalPreferenceMatchScore(signal, scoreMap);
  if (matchScore <= 0) return baseRank;

  const multiplier = 1 + Math.min(matchScore / 20, 0.35);
  return baseRank * multiplier;
}
