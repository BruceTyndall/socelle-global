import { supabase } from './supabase';

export interface ReadinessProfile {
  training_complexity: 'Low' | 'Medium' | 'High';
  estimated_training_hours: number | null;
  product_count_required: number;
  contraindication_sensitivity: 'Low' | 'Medium' | 'High';
  staff_skill_level_required: 'Entry' | 'Intermediate' | 'Advanced';
  overall_implementation_risk_score: number;
  confidence_level: 'High' | 'Medium' | 'Low' | 'Unknown';
  missing_data_flags: string[];
  source_trace: any;
  prerequisites: string | null;
  equipment_required: string[];
}

interface ProtocolData {
  id: string;
  protocol_name: string;
  category: string;
  contraindications: string[];
  allowed_products: string[];
  training_required: boolean;
  training_type: string | null;
  estimated_training_hours: number | null;
  certification_required: boolean;
  certification_type?: string;
  typical_duration: string | null;
}

async function getProtocolData(protocolId: string): Promise<ProtocolData | null> {
  const { data } = await supabase
    .from('canonical_protocols')
    .select('*')
    .eq('id', protocolId)
    .single();

  return data;
}

async function getProtocolProducts(protocolId: string): Promise<any[]> {
  const { data } = await supabase
    .from('canonical_protocol_step_products')
    .select('*, canonical_protocol_steps!inner(canonical_protocol_id)')
    .eq('canonical_protocol_steps.canonical_protocol_id', protocolId);

  return data || [];
}

function calculateTrainingComplexity(
  protocol: ProtocolData,
  productCount: number
): {
  complexity: 'Low' | 'Medium' | 'High';
  rationale: string;
} {
  const category = protocol.category.toUpperCase();
  const requiresTraining = protocol.training_required;
  const requiresCert = protocol.certification_required;
  const hasContraindications = protocol.contraindications.length > 0;

  let score = 0;
  const reasons: string[] = [];

  if (requiresCert) {
    score += 30;
    reasons.push('certification required');
  } else if (requiresTraining) {
    score += 15;
    reasons.push('formal training required');
  }

  if (hasContraindications && protocol.contraindications.length >= 3) {
    score += 20;
    reasons.push(`${protocol.contraindications.length} contraindications`);
  } else if (hasContraindications) {
    score += 10;
    reasons.push('some contraindications');
  }

  if (productCount >= 8) {
    score += 15;
    reasons.push(`${productCount} products`);
  } else if (productCount >= 5) {
    score += 8;
    reasons.push(`${productCount} products`);
  }

  if (['ENHANCEMENTS', 'EYE', 'HAND', 'FOOT'].includes(category)) {
    score += 5;
    reasons.push('quick add-on service');
  } else if (['MASSAGE', 'BODY'].includes(category)) {
    score += 10;
    reasons.push('technique-intensive');
  } else if (category.includes('ONCOLOGY')) {
    score += 25;
    reasons.push('specialized care protocols');
  }

  let complexity: 'Low' | 'Medium' | 'High';
  if (score >= 40) {
    complexity = 'High';
  } else if (score >= 20) {
    complexity = 'Medium';
  } else {
    complexity = 'Low';
  }

  return {
    complexity,
    rationale: reasons.join(', ')
  };
}

function calculateContraindicationSensitivity(
  contraindications: string[]
): 'Low' | 'Medium' | 'High' {
  if (contraindications.length === 0) {
    return 'Low';
  } else if (contraindications.length >= 4) {
    return 'High';
  } else {
    return 'Medium';
  }
}

function calculateStaffSkillLevel(
  protocol: ProtocolData,
  trainingComplexity: 'Low' | 'Medium' | 'High'
): 'Entry' | 'Intermediate' | 'Advanced' {
  if (protocol.certification_required) {
    return 'Advanced';
  }

  const category = protocol.category.toUpperCase();

  if (category.includes('ONCOLOGY')) {
    return 'Advanced';
  }

  if (trainingComplexity === 'High') {
    return 'Advanced';
  } else if (trainingComplexity === 'Medium') {
    return 'Intermediate';
  } else {
    return 'Entry';
  }
}

function calculateRiskScore(
  trainingComplexity: 'Low' | 'Medium' | 'High',
  contraindicationSensitivity: 'Low' | 'Medium' | 'High',
  staffSkillLevel: 'Entry' | 'Intermediate' | 'Advanced',
  productCount: number,
  missingData: string[]
): number {
  let risk = 0;

  const trainingRisk = {
    'Low': 10,
    'Medium': 25,
    'High': 40
  };
  risk += trainingRisk[trainingComplexity];

  const contraindicationRisk = {
    'Low': 5,
    'Medium': 15,
    'High': 25
  };
  risk += contraindicationRisk[contraindicationSensitivity];

  const skillRisk = {
    'Entry': 0,
    'Intermediate': 10,
    'Advanced': 20
  };
  risk += skillRisk[staffSkillLevel];

  if (productCount >= 10) {
    risk += 10;
  } else if (productCount >= 6) {
    risk += 5;
  }

  if (missingData.length > 0) {
    risk += missingData.length * 2;
  }

  return Math.min(100, risk);
}

function determineConfidence(
  missingDataFlags: string[],
  _protocol: ProtocolData
): 'High' | 'Medium' | 'Low' | 'Unknown' {
  if (missingDataFlags.length === 0) {
    return 'High';
  } else if (missingDataFlags.length <= 2) {
    return 'Medium';
  } else {
    return 'Low';
  }
}

export async function calculateImplementationReadiness(
  protocolId: string
): Promise<ReadinessProfile | null> {
  const protocol = await getProtocolData(protocolId);

  if (!protocol) {
    return null;
  }

  const products = await getProtocolProducts(protocolId);
  const productCount = products.length;

  const missingData: string[] = [];

  if (!protocol.training_required && protocol.training_required !== false) {
    missingData.push('training_required_flag');
  }

  if (protocol.training_required && !protocol.estimated_training_hours) {
    missingData.push('estimated_training_hours');
  }

  if (!protocol.allowed_products || protocol.allowed_products.length === 0) {
    missingData.push('allowed_products');
  }

  if (productCount === 0) {
    missingData.push('protocol_step_products');
  }

  const trainingComplexityResult = calculateTrainingComplexity(protocol, productCount);
  const contraindicationSensitivity = calculateContraindicationSensitivity(protocol.contraindications);
  const staffSkillLevel = calculateStaffSkillLevel(protocol, trainingComplexityResult.complexity);
  const riskScore = calculateRiskScore(
    trainingComplexityResult.complexity,
    contraindicationSensitivity,
    staffSkillLevel,
    productCount,
    missingData
  );
  const confidence = determineConfidence(missingData, protocol);

  const equipmentRequired: string[] = [];
  const category = protocol.category.toUpperCase();

  if (category.includes('MASSAGE') || category.includes('BODY')) {
    equipmentRequired.push('Massage table', 'Linens', 'Warming equipment');
  }
  if (category.includes('FACIAL')) {
    equipmentRequired.push('Facial bed', 'Steamer', 'Towel warmer');
  }

  let prerequisites = null;
  if (protocol.certification_required) {
    prerequisites = `Completion of ${protocol.certification_type || 'certification program'} required before performing this protocol`;
  } else if (staffSkillLevel === 'Advanced') {
    prerequisites = 'Advanced esthetician or therapist with specialized training';
  }

  const sourceTrace = {
    protocol_id: protocol.id,
    protocol_name: protocol.protocol_name,
    category: protocol.category,
    scoring_inputs: {
      training_required: protocol.training_required,
      certification_required: protocol.certification_required,
      contraindication_count: protocol.contraindications.length,
      product_count: productCount,
      allowed_products_count: protocol.allowed_products?.length || 0
    },
    scoring_logic: {
      training_complexity: {
        value: trainingComplexityResult.complexity,
        rationale: trainingComplexityResult.rationale
      },
      contraindication_sensitivity: {
        value: contraindicationSensitivity,
        based_on: `${protocol.contraindications.length} contraindications documented`
      },
      staff_skill_level: {
        value: staffSkillLevel,
        derived_from: `certification=${protocol.certification_required}, training=${trainingComplexityResult.complexity}`
      },
      risk_calculation: {
        training_component: trainingComplexityResult.complexity === 'High' ? 40 : trainingComplexityResult.complexity === 'Medium' ? 25 : 10,
        contraindication_component: contraindicationSensitivity === 'High' ? 25 : contraindicationSensitivity === 'Medium' ? 15 : 5,
        skill_component: staffSkillLevel === 'Advanced' ? 20 : staffSkillLevel === 'Intermediate' ? 10 : 0,
        product_component: productCount >= 10 ? 10 : productCount >= 6 ? 5 : 0,
        missing_data_penalty: missingData.length * 2
      }
    },
    algorithm_version: '1.0',
    calculated_at: new Date().toISOString()
  };

  return {
    training_complexity: trainingComplexityResult.complexity,
    estimated_training_hours: protocol.estimated_training_hours || null,
    product_count_required: productCount,
    contraindication_sensitivity: contraindicationSensitivity,
    staff_skill_level_required: staffSkillLevel,
    overall_implementation_risk_score: riskScore,
    confidence_level: confidence,
    missing_data_flags: missingData,
    source_trace: sourceTrace,
    prerequisites,
    equipment_required: equipmentRequired
  };
}

export async function generateReadinessForMapping(
  mappingId: string,
  spaMenuId: string
): Promise<void> {
  const { data: mapping } = await supabase
    .from('spa_service_mapping')
    .select('*, canonical_protocols(id)')
    .eq('id', mappingId)
    .single();

  if (!mapping || !mapping.canonical_protocols) {
    return;
  }

  const readiness = await calculateImplementationReadiness(mapping.canonical_protocols.id);

  if (!readiness) {
    return;
  }

  await supabase.from('implementation_readiness').upsert({
    spa_menu_id: spaMenuId,
    service_mapping_id: mappingId,
    canonical_protocol_id: mapping.canonical_protocols.id,
    training_complexity: readiness.training_complexity,
    estimated_training_hours: readiness.estimated_training_hours,
    product_count_required: readiness.product_count_required,
    contraindication_sensitivity: readiness.contraindication_sensitivity,
    staff_skill_level_required: readiness.staff_skill_level_required,
    overall_implementation_risk_score: readiness.overall_implementation_risk_score,
    confidence_level: readiness.confidence_level,
    missing_data_flags: readiness.missing_data_flags,
    source_trace: readiness.source_trace,
    prerequisites: readiness.prerequisites,
    equipment_required: readiness.equipment_required
  }, {
    onConflict: 'service_mapping_id',
    ignoreDuplicates: false
  });
}

export async function generateReadinessForGap(
  gapId: string,
  spaMenuId: string
): Promise<void> {
  const { data: gap } = await supabase
    .from('service_gap_analysis')
    .select('*, canonical_protocols(id)')
    .eq('id', gapId)
    .single();

  if (!gap || !gap.canonical_protocols) {
    return;
  }

  const readiness = await calculateImplementationReadiness(gap.canonical_protocols.id);

  if (!readiness) {
    return;
  }

  await supabase.from('implementation_readiness').upsert({
    spa_menu_id: spaMenuId,
    gap_id: gapId,
    canonical_protocol_id: gap.canonical_protocols.id,
    training_complexity: readiness.training_complexity,
    estimated_training_hours: readiness.estimated_training_hours,
    product_count_required: readiness.product_count_required,
    contraindication_sensitivity: readiness.contraindication_sensitivity,
    staff_skill_level_required: readiness.staff_skill_level_required,
    overall_implementation_risk_score: readiness.overall_implementation_risk_score,
    confidence_level: readiness.confidence_level,
    missing_data_flags: readiness.missing_data_flags,
    source_trace: readiness.source_trace,
    prerequisites: readiness.prerequisites,
    equipment_required: readiness.equipment_required
  }, {
    onConflict: 'gap_id',
    ignoreDuplicates: false
  });
}

export async function generateAllReadinessForMenu(spaMenuId: string): Promise<void> {
  const { data: mappings } = await supabase
    .from('spa_service_mapping')
    .select('id')
    .eq('spa_menu_id', spaMenuId)
    .not('canonical_protocol_id', 'is', null);

  if (mappings) {
    for (const mapping of mappings) {
      await generateReadinessForMapping(mapping.id, spaMenuId);
    }
  }

  const { data: gaps } = await supabase
    .from('service_gap_analysis')
    .select('id')
    .eq('spa_menu_id', spaMenuId)
    .not('recommended_protocol_id', 'is', null);

  if (gaps) {
    for (const gap of gaps) {
      await generateReadinessForGap(gap.id, spaMenuId);
    }
  }
}
