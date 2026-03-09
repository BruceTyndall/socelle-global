import { supabase } from './supabase';

interface ReadinessItem {
  id: string;
  service_mapping_id: string | null;
  gap_id: string | null;
  canonical_protocol_id: string;
  training_complexity: string;
  estimated_training_hours: number | null;
  product_count_required: number;
  overall_implementation_risk_score: number;
  staff_skill_level_required: string;
  service_name?: string;
  protocol_name?: string;
  item_type?: string;
  estimated_revenue?: number | null;
}

interface PhaseAssignment {
  phase_number: number;
  phase_name: string;
  items: ReadinessItem[];
  total_training_hours: number;
  avg_risk_score: number;
  rationale: string;
}

function determinePhase(
  riskScore: number,
  trainingComplexity: string,
  skillLevel: string,
  isGap: boolean
): { phase: number; rationale: string } {
  if (riskScore <= 30 && trainingComplexity === 'Low' && skillLevel === 'Entry') {
    return {
      phase: 1,
      rationale: 'Low risk, minimal training, entry-level execution - ideal for immediate implementation'
    };
  }

  if (riskScore <= 25 && !isGap) {
    return {
      phase: 1,
      rationale: 'Existing service with low risk - quick win to build confidence'
    };
  }

  if (riskScore <= 45 && trainingComplexity !== 'High') {
    return {
      phase: 1,
      rationale: 'Moderate complexity with manageable risk - foundational service'
    };
  }

  if (riskScore <= 60 && skillLevel !== 'Advanced') {
    return {
      phase: 2,
      rationale: 'Moderate risk and training investment - implement after Phase 1 momentum'
    };
  }

  if (trainingComplexity === 'Medium' || skillLevel === 'Intermediate') {
    return {
      phase: 2,
      rationale: 'Requires additional training and skill development from Phase 1'
    };
  }

  if (trainingComplexity === 'High' || skillLevel === 'Advanced' || riskScore > 60) {
    return {
      phase: 3,
      rationale: 'High complexity or advanced requirements - implement after staff proficiency established'
    };
  }

  return {
    phase: 2,
    rationale: 'Standard implementation timing based on balanced risk profile'
  };
}

async function getReadinessItems(spaMenuId: string): Promise<ReadinessItem[]> {
  const { data: readiness } = await supabase
    .from('implementation_readiness')
    .select(`
      *,
      service_mapping:spa_service_mapping(service_name, service_price, estimated_monthly_revenue),
      gap:service_gap_analysis(gap_description, estimated_monthly_revenue),
      protocol:canonical_protocols(protocol_name)
    `)
    .eq('spa_menu_id', spaMenuId)
    .order('overall_implementation_risk_score');

  if (!readiness) return [];

  return readiness.map((r: any) => ({
    id: r.id,
    service_mapping_id: r.service_mapping_id,
    gap_id: r.gap_id,
    canonical_protocol_id: r.canonical_protocol_id,
    training_complexity: r.training_complexity,
    estimated_training_hours: r.estimated_training_hours,
    product_count_required: r.product_count_required,
    overall_implementation_risk_score: r.overall_implementation_risk_score,
    staff_skill_level_required: r.staff_skill_level_required,
    service_name: r.service_mapping?.service_name || r.gap?.gap_description,
    protocol_name: r.protocol?.protocol_name,
    item_type: r.service_mapping_id ? 'existing_service' : 'gap_recommendation',
    estimated_revenue: r.service_mapping?.estimated_monthly_revenue || r.gap?.estimated_monthly_revenue
  }));
}

function assignToPhases(items: ReadinessItem[]): PhaseAssignment[] {
  const phases: PhaseAssignment[] = [
    { phase_number: 1, phase_name: 'Phase 1: Foundation (Days 1-30)', items: [], total_training_hours: 0, avg_risk_score: 0, rationale: '' },
    { phase_number: 2, phase_name: 'Phase 2: Expansion (Days 31-60)', items: [], total_training_hours: 0, avg_risk_score: 0, rationale: '' },
    { phase_number: 3, phase_name: 'Phase 3: Mastery (Days 61-90)', items: [], total_training_hours: 0, avg_risk_score: 0, rationale: '' }
  ];

  for (const item of items) {
    const assignment = determinePhase(
      item.overall_implementation_risk_score,
      item.training_complexity,
      item.staff_skill_level_required,
      item.item_type === 'gap_recommendation'
    );

    const phase = phases[assignment.phase - 1];
    phase.items.push(item);
  }

  for (const phase of phases) {
    if (phase.items.length > 0) {
      phase.total_training_hours = phase.items.reduce(
        (sum, item) => sum + (item.estimated_training_hours || 0),
        0
      );
      phase.avg_risk_score = phase.items.reduce(
        (sum, item) => sum + item.overall_implementation_risk_score,
        0
      ) / phase.items.length;
    }
  }

  phases[0].rationale = 'Quick wins with minimal risk. Build staff confidence and operational momentum.';
  phases[1].rationale = 'Expand service portfolio with moderate-complexity offerings. Build on Phase 1 success.';
  phases[2].rationale = 'Implement advanced protocols requiring specialized training and higher skill levels.';

  return phases;
}

export async function generatePhasedRolloutPlan(
  spaMenuId: string,
  spaType: 'medspa' | 'spa' | 'hybrid'
): Promise<string | null> {
  const items = await getReadinessItems(spaMenuId);

  if (items.length === 0) {
    return null;
  }

  const phases = assignToPhases(items);

  const totalTrainingHours = phases.reduce((sum, p) => sum + p.total_training_hours, 0);
  const avgRiskScore = items.reduce((sum, i) => sum + i.overall_implementation_risk_score, 0) / items.length;
  const totalProducts = [...new Set(items.map(i => i.canonical_protocol_id))].length;

  const phaseAssignmentLogic = {
    algorithm: 'deterministic_risk_based_assignment',
    rules: [
      'Phase 1: Risk ≤ 45 AND (Training = Low OR Existing Service)',
      'Phase 2: Risk ≤ 60 AND Training ≠ High',
      'Phase 3: Risk > 60 OR Training = High OR Skill = Advanced'
    ],
    factors_considered: [
      'overall_implementation_risk_score',
      'training_complexity',
      'staff_skill_level_required',
      'item_type (existing vs gap)'
    ]
  };

  const sourceTrace = {
    spa_menu_id: spaMenuId,
    spa_type: spaType,
    total_items_evaluated: items.length,
    phase_assignment_logic: phaseAssignmentLogic,
    phase_summary: phases.map(p => ({
      phase: p.phase_number,
      items_count: p.items.length,
      avg_risk: Math.round(p.avg_risk_score),
      training_hours: p.total_training_hours
    })),
    algorithm_version: '1.0',
    generated_at: new Date().toISOString()
  };

  const { data: plan, error } = await supabase
    .from('phased_rollout_plans')
    .insert({
      spa_menu_id: spaMenuId,
      plan_name: `${spaType.charAt(0).toUpperCase() + spaType.slice(1)} Implementation Plan`,
      spa_type: spaType,
      total_services: items.length,
      total_phases: phases.filter(p => p.items.length > 0).length,
      avg_risk_score: avgRiskScore,
      total_training_hours: totalTrainingHours,
      total_products_required: totalProducts,
      phase_assignment_logic: phaseAssignmentLogic,
      source_trace: sourceTrace,
      status: 'draft'
    })
    .select()
    .single();

  if (error || !plan) {
    console.error('Error creating rollout plan:', error);
    return null;
  }

  for (const phase of phases) {
    if (phase.items.length === 0) continue;

    for (let i = 0; i < phase.items.length; i++) {
      const item = phase.items[i];
      const assignment = determinePhase(
        item.overall_implementation_risk_score,
        item.training_complexity,
        item.staff_skill_level_required,
        item.item_type === 'gap_recommendation'
      );

      await supabase.from('rollout_plan_items').insert({
        rollout_plan_id: plan.id,
        phase_number: phase.phase_number,
        phase_name: phase.phase_name,
        service_mapping_id: item.service_mapping_id,
        gap_id: item.gap_id,
        implementation_readiness_id: item.id,
        service_name: item.service_name || 'Unnamed Service',
        protocol_name: item.protocol_name,
        item_type: item.item_type || 'existing_service',
        phase_rationale: assignment.rationale,
        risk_score: item.overall_implementation_risk_score,
        training_hours: item.estimated_training_hours,
        estimated_revenue: item.estimated_revenue,
        sort_order: i
      });
    }
  }

  return plan.id;
}

export async function regeneratePhasedRolloutPlan(spaMenuId: string, spaType: 'medspa' | 'spa' | 'hybrid'): Promise<void> {
  await supabase
    .from('phased_rollout_plans')
    .delete()
    .eq('spa_menu_id', spaMenuId);

  await generatePhasedRolloutPlan(spaMenuId, spaType);
}

export async function getRolloutPlanSummary(planId: string): Promise<any> {
  const { data: plan } = await supabase
    .from('phased_rollout_plans')
    .select('*')
    .eq('id', planId)
    .single();

  if (!plan) return null;

  const { data: items } = await supabase
    .from('rollout_plan_items')
    .select('*')
    .eq('rollout_plan_id', planId)
    .order('phase_number, sort_order');

  const phases = [1, 2, 3].map(phaseNum => {
    const phaseItems = items?.filter(i => i.phase_number === phaseNum) || [];
    return {
      phase_number: phaseNum,
      phase_name: phaseItems[0]?.phase_name || `Phase ${phaseNum}`,
      items: phaseItems,
      count: phaseItems.length,
      total_training_hours: phaseItems.reduce((sum, i) => sum + (i.training_hours || 0), 0),
      avg_risk: phaseItems.length > 0
        ? phaseItems.reduce((sum, i) => sum + (i.risk_score || 0), 0) / phaseItems.length
        : 0,
      estimated_revenue: phaseItems.reduce((sum, i) => sum + (i.estimated_revenue || 0), 0)
    };
  });

  return {
    plan,
    phases: phases.filter(p => p.count > 0)
  };
}
