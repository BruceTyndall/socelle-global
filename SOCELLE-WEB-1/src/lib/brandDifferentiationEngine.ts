import { supabase } from './supabase';

export interface BrandTalkingPoint {
  category: string;
  headline: string;
  supporting_points: string[];
  evidence_references: string[];
  grounded_in_protocols: string[];
  grounded_in_features: string[];
}

export async function getBrandTalkingPoints(spaType: 'medspa' | 'spa' | 'hybrid' | 'all' = 'all'): Promise<BrandTalkingPoint[]> {
  const { data } = await supabase
    .from('brand_differentiation_points')
    .select('*')
    .eq('is_active', true)
    .eq('is_verified', true)
    .in('spa_type', [spaType, 'all'])
    .order('point_category');

  if (!data) return [];

  return data.map(point => ({
    category: point.point_category,
    headline: point.headline,
    supporting_points: point.supporting_points || [],
    evidence_references: point.evidence_references || [],
    grounded_in_protocols: point.grounded_in_protocols || [],
    grounded_in_features: point.grounded_in_features || []
  }));
}

export async function generateBrandNarrative(
  spaType: 'medspa' | 'spa' | 'hybrid',
  planId: string
): Promise<{
  introduction: string;
  talking_points: BrandTalkingPoint[];
  plan_specific_highlights: string[];
  source_trace: any;
}> {
  const talkingPoints = await getBrandTalkingPoints(spaType);

  const { data: plan } = await supabase
    .from('phased_rollout_plans')
    .select(`
      *,
      rollout_plan_items(count)
    `)
    .eq('id', planId)
    .single();

  if (!plan) {
    return {
      introduction: 'This implementation plan provides a structured approach to spa service excellence.',
      talking_points: talkingPoints,
      plan_specific_highlights: [],
      source_trace: {}
    };
  }

  const itemCount = (plan as any).rollout_plan_items?.[0]?.count || 0;

  const spaTypeLabel = spaType === 'medspa' ? 'medical spa' : spaType === 'spa' ? 'day spa' : 'hybrid spa';

  const introduction = `This ${plan.total_phases}-phase implementation plan is specifically designed for ${spaTypeLabel} operations. ` +
    `It includes ${itemCount} service implementations with an average risk score of ${(plan.avg_risk_score || 0).toFixed(0)}/100, ` +
    `requiring ${(plan.total_training_hours || 0).toFixed(1)} total training hours. ` +
    `The phased approach minimizes operational disruption while building staff proficiency and client satisfaction.`;

  const planHighlights: string[] = [];

  if ((plan.avg_risk_score || 0) < 40) {
    planHighlights.push('Low-risk implementation profile enables confident adoption');
  }

  if ((plan.total_training_hours || 0) < 20) {
    planHighlights.push('Minimal training investment required for launch');
  }

  if (itemCount >= 5) {
    planHighlights.push(`Comprehensive ${itemCount}-service portfolio provides menu depth`);
  }

  if (plan.total_phases === 3) {
    planHighlights.push('90-day rollout allows measured, sustainable growth');
  }

  const sourceTrace = {
    rollout_plan_id: planId,
    spa_type: spaType,
    talking_points_count: talkingPoints.length,
    talking_points_sources: talkingPoints.map(tp => ({
      category: tp.category,
      evidence: tp.evidence_references,
      grounded_in: tp.grounded_in_features
    })),
    plan_metrics: {
      total_services: itemCount,
      avg_risk_score: plan.avg_risk_score,
      total_training_hours: plan.total_training_hours,
      phases: plan.total_phases
    },
    narrative_generation: 'template_based_with_plan_metrics',
    algorithm_version: '1.0',
    generated_at: new Date().toISOString()
  };

  return {
    introduction,
    talking_points: talkingPoints,
    plan_specific_highlights: planHighlights,
    source_trace: sourceTrace
  };
}

export async function getWhyThisBrandSection(spaType: 'medspa' | 'spa' | 'hybrid'): Promise<{
  headline: string;
  sections: Array<{
    title: string;
    content: string;
    grounding: string[];
  }>;
  source_trace: any;
}> {
  const talkingPoints = await getBrandTalkingPoints(spaType);

  const sections = talkingPoints.map(point => ({
    title: point.headline,
    content: point.supporting_points.join(' '),
    grounding: [
      ...point.evidence_references,
      ...point.grounded_in_features
    ]
  }));

  return {
    headline: 'Why Partner with Naturopathica',
    sections,
    source_trace: {
      spa_type: spaType,
      talking_points_used: talkingPoints.length,
      all_points_verified: true,
      database_source: 'brand_differentiation_points',
      generated_at: new Date().toISOString()
    }
  };
}
