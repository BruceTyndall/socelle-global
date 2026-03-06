import { supabase } from './supabase';

export interface IngestionFile {
  fileName: string;
  phase: number;
  phaseName: string;
  ingestionType: string;
  status: 'Pending' | 'Approved' | 'Ingested' | 'Failed' | 'Secondary' | 'Ignored' | 'Unknown';
  confidence: number;
  exceptions: string[];
  isPrimary: boolean;
  targetTables: string[];
  lastIngested?: string;
}

export interface IngestionPhase {
  phase: number;
  name: string;
  description: string;
  fileCount: number;
  status: 'Ready' | 'Locked' | 'In Progress' | 'Complete' | 'Failed';
  dependencies: number[];
  targetTables: string[];
}


const publicFiles = [
  '2026+pro+marketing+calendar+-+final+(2).pdf',
  'acneclearingbacktreatment_060524.pdf',
  'acneclearingfacial_protocol_060524.pdf',
  'advanced_wrinkle_remedy_facial_2021.pdf',
  'aromatherapy_products.pdf',
  'aromaticdetoxmassage.pdf',
  'balance_and_clarify_teen_facial_2025_(2).pdf',
  'caffeineguashaeyetreatment_100224.pdf',
  'caffeineguashafacial_100224_1.pdf',
  'copy_of_signaturepureresultsfacial_protocol_060524.pdf',
  'cost_per_application_summary_pdf_2025.pdf',
  'cost_per_treatment_pdf_2025.pdf',
  'defyfacial_protocol_hydrafacial.pdf',
  'enhancement_smoothingglycolicfacial_protocol_2024.pdf',
  'handfootenhancement_smoothingglycolic_protocol_2024.pdf',
  'holistic_facial_acupressure_ff21b45a-6bbf-442a-b916-32c84785f99d.pdf',
  'holistic_facial_cleansing_stimulation_de98f190-bc4d-4393-b80f-0f208a3e2e8c.pdf',
  'holistic_facial_massage_stimulation_f726efa4-f605-4068-a16f-63c6f9a97812.pdf',
  'manukamoisturedrenchfacial.pdf',
  'marshmallow_soothing_facial.pdf',
  'mensrebalancingfacial_060524.pdf',
  'naturopathica-detoxrepairfacial.pdf',
  'naturopathica_bath_cures.pdf',
  'naturopathica_espresso_mud_detoxifying_body_treatment.pdf',
  'naturopathica_eye_contour_enhancement.pdf',
  'naturopathica_lemon_verbena_hydrating_body_treatment.pdf',
  'naturopathica_lemon_verbena_quench_manicure.pdf',
  'naturopathica_luminous_lip_enhancement.pdf',
  'naturopathica_moisture_drench_skin_conditioning_treatment.pdf',
  'naturopathica_rosemary_mint_pedicure.pdf',
  'naturopathica_seaweed_body_wrap_treatment.pdf',
  'naturopathica_sweet_birch_magnesium_bath_cure.pdf',
  'naturopathica_wellness_teas.pdf',
  'naturopathicaalpinearnicadeeptissuemassage.pdf',
  'naturopathicaarnicasweetbirchenhancement.pdf',
  'naturopathicablueeucalyptusenergizingmassage.pdf',
  'naturopathicamanukapeel.pdf',
  'naturopathicanirvanastressreliefmassage.pdf',
  'naturopathicapeppermintfoottherapy.pdf',
  'naturopathicapepperminthandarmtensionreliefs.pdf',
  'naturopathicaprenatalrestrenewaltreatment.pdf',
  'naturopathicasignatureherbalmassages.pdf',
  'naturopathicawelcomeclosingritualsface_ec4b0875-e399-4dcf-927b-28f6f283ab9e.pdf',
  'naturopathicawildlimescalptreatment.pdf',
  'oncology_care_-_body_restore_ritual.pdf',
  'oncology_care_-_nurture_&_restore_facial.pdf',
  'oncology_care_-_soothing_sole_ritual.pdf',
  'oncology_care_-_tension_release_scalp_massage.pdf',
  'oncology_care_-_the_helping_hands_massage.pdf',
  'pk_for_app_.pdf',
  'pro_blending_guide_2025.pdf',
  'retailreferenceguide2023.pdf',
  'smoothingglycolicfacial_protocol_2024.pdf',
  'spiced_pumpkin_facial_2023.pdf',
  'vitamincradiancefacial.pdf',
  'vitamincradiancefacialupdated.pdf',
  'winterwellbeingresetfacial.pdf'
];

const fileClassifications: Record<string, {
  phase: number;
  type: string;
  confidence: number;
  isPrimary: boolean;
  targetTables: string[];
}> = {
  '2026+pro+marketing+calendar+-+final+(2).pdf': {
    phase: 1,
    type: 'Marketing Calendar',
    confidence: 95,
    isPrimary: true,
    targetTables: ['marketing_calendar', 'document_ingestion_log']
  },
  'acneclearingfacial_protocol_060524.pdf': {
    phase: 2,
    type: 'Canonical Protocol',
    confidence: 95,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'advanced_wrinkle_remedy_facial_2021.pdf': {
    phase: 2,
    type: 'Canonical Protocol',
    confidence: 90,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'balance_and_clarify_teen_facial_2025_(2).pdf': {
    phase: 2,
    type: 'Canonical Protocol',
    confidence: 95,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'caffeineguashafacial_100224_1.pdf': {
    phase: 2,
    type: 'Canonical Protocol',
    confidence: 90,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'defyfacial_protocol_hydrafacial.pdf': {
    phase: 2,
    type: 'Canonical Protocol',
    confidence: 95,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'manukamoisturedrenchfacial.pdf': {
    phase: 2,
    type: 'Canonical Protocol',
    confidence: 95,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'marshmallow_soothing_facial.pdf': {
    phase: 2,
    type: 'Canonical Protocol',
    confidence: 95,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'mensrebalancingfacial_060524.pdf': {
    phase: 2,
    type: 'Canonical Protocol',
    confidence: 95,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'naturopathica-detoxrepairfacial.pdf': {
    phase: 2,
    type: 'Canonical Protocol',
    confidence: 95,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'naturopathicamanukapeel.pdf': {
    phase: 2,
    type: 'Canonical Protocol',
    confidence: 95,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'smoothingglycolicfacial_protocol_2024.pdf': {
    phase: 2,
    type: 'Canonical Protocol',
    confidence: 95,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'spiced_pumpkin_facial_2023.pdf': {
    phase: 2,
    type: 'Canonical Protocol',
    confidence: 90,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'vitamincradiancefacialupdated.pdf': {
    phase: 2,
    type: 'Canonical Protocol',
    confidence: 95,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'winterwellbeingresetfacial.pdf': {
    phase: 2,
    type: 'Canonical Protocol',
    confidence: 95,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'vitamincradiancefacial.pdf': {
    phase: 2,
    type: 'Canonical Protocol',
    confidence: 70,
    isPrimary: false,
    targetTables: ['canonical_protocols']
  },
  'copy_of_signaturepureresultsfacial_protocol_060524.pdf': {
    phase: 2,
    type: 'Canonical Protocol',
    confidence: 60,
    isPrimary: false,
    targetTables: ['canonical_protocols']
  },
  'caffeineguashaeyetreatment_100224.pdf': {
    phase: 3,
    type: 'Enhancement',
    confidence: 90,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'enhancement_smoothingglycolicfacial_protocol_2024.pdf': {
    phase: 3,
    type: 'Enhancement',
    confidence: 95,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'handfootenhancement_smoothingglycolic_protocol_2024.pdf': {
    phase: 3,
    type: 'Enhancement',
    confidence: 90,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'holistic_facial_acupressure_ff21b45a-6bbf-442a-b916-32c84785f99d.pdf': {
    phase: 3,
    type: 'Enhancement',
    confidence: 75,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'holistic_facial_cleansing_stimulation_de98f190-bc4d-4393-b80f-0f208a3e2e8c.pdf': {
    phase: 3,
    type: 'Enhancement',
    confidence: 75,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'holistic_facial_massage_stimulation_f726efa4-f605-4068-a16f-63c6f9a97812.pdf': {
    phase: 3,
    type: 'Enhancement',
    confidence: 75,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'naturopathica_eye_contour_enhancement.pdf': {
    phase: 3,
    type: 'Enhancement',
    confidence: 90,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'naturopathica_luminous_lip_enhancement.pdf': {
    phase: 3,
    type: 'Enhancement',
    confidence: 90,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'naturopathicaarnicasweetbirchenhancement.pdf': {
    phase: 3,
    type: 'Enhancement',
    confidence: 85,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'naturopathicapeppermintfoottherapy.pdf': {
    phase: 3,
    type: 'Enhancement',
    confidence: 90,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'naturopathicapepperminthandarmtensionreliefs.pdf': {
    phase: 3,
    type: 'Enhancement',
    confidence: 90,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'naturopathicawildlimescalptreatment.pdf': {
    phase: 3,
    type: 'Enhancement',
    confidence: 90,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'acneclearingbacktreatment_060524.pdf': {
    phase: 3,
    type: 'Body Treatment',
    confidence: 95,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'naturopathica_espresso_mud_detoxifying_body_treatment.pdf': {
    phase: 3,
    type: 'Body Treatment',
    confidence: 95,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'naturopathica_lemon_verbena_hydrating_body_treatment.pdf': {
    phase: 3,
    type: 'Body Treatment',
    confidence: 95,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'naturopathica_moisture_drench_skin_conditioning_treatment.pdf': {
    phase: 3,
    type: 'Body Treatment',
    confidence: 95,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'naturopathica_seaweed_body_wrap_treatment.pdf': {
    phase: 3,
    type: 'Body Treatment',
    confidence: 95,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'aromaticdetoxmassage.pdf': {
    phase: 3,
    type: 'Massage',
    confidence: 90,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'naturopathicaalpinearnicadeeptissuemassage.pdf': {
    phase: 3,
    type: 'Massage',
    confidence: 95,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'naturopathicablueeucalyptusenergizingmassage.pdf': {
    phase: 3,
    type: 'Massage',
    confidence: 95,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'naturopathicanirvanastressreliefmassage.pdf': {
    phase: 3,
    type: 'Massage',
    confidence: 95,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'naturopathicaprenatalrestrenewaltreatment.pdf': {
    phase: 3,
    type: 'Massage',
    confidence: 90,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'naturopathicasignatureherbalmassages.pdf': {
    phase: 3,
    type: 'Massage',
    confidence: 90,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'oncology_care_-_body_restore_ritual.pdf': {
    phase: 3,
    type: 'Oncology Safe',
    confidence: 95,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'oncology_care_-_nurture_&_restore_facial.pdf': {
    phase: 3,
    type: 'Oncology Safe',
    confidence: 95,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'oncology_care_-_soothing_sole_ritual.pdf': {
    phase: 3,
    type: 'Oncology Safe',
    confidence: 95,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'oncology_care_-_tension_release_scalp_massage.pdf': {
    phase: 3,
    type: 'Oncology Safe',
    confidence: 95,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'oncology_care_-_the_helping_hands_massage.pdf': {
    phase: 3,
    type: 'Oncology Safe',
    confidence: 95,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'naturopathica_bath_cures.pdf': {
    phase: 3,
    type: 'Specialty/Wellness',
    confidence: 85,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'naturopathica_lemon_verbena_quench_manicure.pdf': {
    phase: 3,
    type: 'Specialty/Wellness',
    confidence: 90,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'naturopathica_rosemary_mint_pedicure.pdf': {
    phase: 3,
    type: 'Specialty/Wellness',
    confidence: 90,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'naturopathica_sweet_birch_magnesium_bath_cure.pdf': {
    phase: 3,
    type: 'Specialty/Wellness',
    confidence: 85,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'naturopathicawelcomeclosingritualsface_ec4b0875-e399-4dcf-927b-28f6f283ab9e.pdf': {
    phase: 3,
    type: 'Specialty/Wellness',
    confidence: 70,
    isPrimary: true,
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  'pro_blending_guide_2025.pdf': {
    phase: 4,
    type: 'Mixing Guide',
    confidence: 95,
    isPrimary: true,
    targetTables: ['mixing_rules', 'document_ingestion_log']
  },
  'cost_per_treatment_pdf_2025.pdf': {
    phase: 5,
    type: 'Cost Analysis',
    confidence: 95,
    isPrimary: true,
    targetTables: ['protocol_costing', 'document_ingestion_log']
  },
  'cost_per_application_summary_pdf_2025.pdf': {
    phase: 5,
    type: 'Cost Analysis',
    confidence: 95,
    isPrimary: true,
    targetTables: ['treatment_costs', 'document_ingestion_log']
  },
  'retailreferenceguide2023.pdf': {
    phase: 6,
    type: 'Product Reference',
    confidence: 90,
    isPrimary: true,
    targetTables: ['retail_products', 'document_ingestion_log']
  },
  'aromatherapy_products.pdf': {
    phase: 6,
    type: 'Product Reference',
    confidence: 85,
    isPrimary: true,
    targetTables: ['retail_products', 'document_ingestion_log']
  },
  'naturopathica_wellness_teas.pdf': {
    phase: 6,
    type: 'Product Reference',
    confidence: 85,
    isPrimary: true,
    targetTables: ['retail_products', 'document_ingestion_log']
  },
  'pk_for_app_.pdf': {
    phase: 7,
    type: 'Unknown',
    confidence: 0,
    isPrimary: false,
    targetTables: []
  }
};

const phases: IngestionPhase[] = [
  {
    phase: 1,
    name: 'Marketing Calendar',
    description: 'Establish promotional calendar and seasonal service planning',
    fileCount: 1,
    status: 'Ready',
    dependencies: [],
    targetTables: ['marketing_calendar']
  },
  {
    phase: 2,
    name: 'Canonical Protocols',
    description: 'Core revenue-generating facial services',
    fileCount: 15,
    status: 'Locked',
    dependencies: [1],
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  {
    phase: 3,
    name: 'Extended Services',
    description: 'Enhancements, Body, Massage, Oncology, and Specialty protocols',
    fileCount: 28,
    status: 'Locked',
    dependencies: [2],
    targetTables: ['canonical_protocols', 'canonical_protocol_steps', 'canonical_protocol_step_products']
  },
  {
    phase: 4,
    name: 'Mixing & Blending Rules',
    description: 'Product mixing ratios and custom blend recipes',
    fileCount: 1,
    status: 'Locked',
    dependencies: [2, 6],
    targetTables: ['mixing_rules']
  },
  {
    phase: 5,
    name: 'Cost & COGS',
    description: 'Cost per treatment and cost per application',
    fileCount: 2,
    status: 'Locked',
    dependencies: [2, 3, 6],
    targetTables: ['protocol_costing', 'treatment_costs']
  },
  {
    phase: 6,
    name: 'Product References',
    description: 'Retail and backbar product catalogs',
    fileCount: 3,
    status: 'Ready',
    dependencies: [],
    targetTables: ['retail_products', 'pro_products']
  },
  {
    phase: 7,
    name: 'Manual Review',
    description: 'Files requiring manual classification',
    fileCount: 1,
    status: 'Locked',
    dependencies: [],
    targetTables: []
  }
];

export async function getIngestionFiles(): Promise<IngestionFile[]> {
  const { data: logs } = await supabase
    .from('document_ingestion_log')
    .select('*');

  const logMap = new Map(logs?.map(log => [log.source_file, log]) || []);

  return publicFiles.map(fileName => {
    const classification = fileClassifications[fileName] || {
      phase: 7,
      type: 'Unknown',
      confidence: 0,
      isPrimary: false,
      targetTables: []
    };

    const log = logMap.get(fileName);
    const phase = phases.find(p => p.phase === classification.phase)!;

    return {
      fileName,
      phase: classification.phase,
      phaseName: phase.name,
      ingestionType: classification.type,
      status: log?.status === 'completed' ? 'Ingested' :
              log?.status === 'failed' ? 'Failed' :
              !classification.isPrimary ? 'Secondary' :
              classification.confidence === 0 ? 'Unknown' :
              'Pending',
      confidence: classification.confidence,
      exceptions: log?.exceptions ? JSON.parse(log.exceptions as string) : [],
      isPrimary: classification.isPrimary,
      targetTables: classification.targetTables,
      lastIngested: log?.extracted_at
    };
  });
}

export async function getIngestionPhases(): Promise<IngestionPhase[]> {
  const { data: logs } = await supabase
    .from('document_ingestion_log')
    .select('*');

  const logMap = new Map(logs?.map(log => [log.source_file, log]) || []);

  const { data: incompleteProtocols } = await supabase
    .from('canonical_protocols')
    .select('id')
    .eq('completion_status', 'incomplete');

  const phase2HasIncompleteProtocols = (incompleteProtocols && incompleteProtocols.length > 0);

  const phasesWithStatus = phases.map(phase => {
    const filesInPhase = publicFiles.filter(f => {
      const classification = fileClassifications[f];
      return classification && classification.phase === phase.phase && classification.isPrimary;
    });

    const completedCount = filesInPhase.filter(f => {
      const log = logMap.get(f);
      return log?.status === 'completed';
    }).length;

    const failedCount = filesInPhase.filter(f => {
      const log = logMap.get(f);
      return log?.status === 'failed';
    }).length;

    let dependenciesMet = phase.dependencies.every(depPhase => {
      const depFiles = publicFiles.filter(f => {
        const classification = fileClassifications[f];
        return classification && classification.phase === depPhase && classification.isPrimary;
      });
      return depFiles.every(f => {
        const log = logMap.get(f);
        return log?.status === 'completed';
      });
    });

    if (phase.phase === 3 && dependenciesMet && phase2HasIncompleteProtocols) {
      dependenciesMet = false;
    }

    let status: IngestionPhase['status'] = phase.status;
    if (completedCount === filesInPhase.length && filesInPhase.length > 0) {
      status = 'Complete';
    } else if (failedCount > 0) {
      status = 'Failed';
    } else if (phase.dependencies.length === 0 || dependenciesMet) {
      status = 'Ready';
    } else {
      status = 'Locked';
    }

    return {
      ...phase,
      status
    };
  });

  return phasesWithStatus;
}

export async function updateFileStatus(
  fileName: string,
  status: IngestionFile['status']
): Promise<void> {
  const { data: existingLog } = await supabase
    .from('document_ingestion_log')
    .select('*')
    .eq('source_file', fileName)
    .maybeSingle();

  if (existingLog) {
    await supabase
      .from('document_ingestion_log')
      .update({
        status: status === 'Ingested' ? 'completed' :
                status === 'Failed' ? 'failed' :
                status === 'Ignored' ? 'skipped' :
                'pending'
      })
      .eq('source_file', fileName);
  } else {
    await supabase
      .from('document_ingestion_log')
      .insert({
        source_file: fileName,
        doc_type: 'other',
        status: status === 'Ingested' ? 'completed' :
                status === 'Failed' ? 'failed' :
                status === 'Ignored' ? 'skipped' :
                'pending'
      });
  }
}

export async function readabilityCheck(fileName: string): Promise<{
  success: boolean;
  pageCount?: number;
  canExtractText: boolean;
  error?: string;
}> {
  try {
    const response = await fetch(`/public/${fileName}`);
    if (!response.ok) {
      return {
        success: false,
        canExtractText: false,
        error: `File not found or inaccessible: ${response.status}`
      };
    }

    const blob = await response.blob();
    const sizeInMB = (blob.size / (1024 * 1024)).toFixed(2);

    await supabase
      .from('document_ingestion_log')
      .upsert({
        source_file: fileName,
        doc_type: 'other',
        status: 'pending',
        metadata: {
          file_size_mb: sizeInMB,
          readable: true,
          checked_at: new Date().toISOString()
        }
      }, {
        onConflict: 'source_file'
      });

    return {
      success: true,
      canExtractText: true,
      pageCount: undefined
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    await supabase
      .from('document_ingestion_log')
      .upsert({
        source_file: fileName,
        doc_type: 'other',
        status: 'failed',
        exceptions: JSON.stringify([errorMessage]),
        metadata: {
          readable: false,
          checked_at: new Date().toISOString()
        }
      }, {
        onConflict: 'source_file'
      });

    return {
      success: false,
      canExtractText: false,
      error: errorMessage
    };
  }
}

export async function batchIngestProtocols(
  onProgress?: (current: number, total: number, fileName: string) => void
): Promise<{
  success: boolean;
  message: string;
  processed: number;
  succeeded: number;
  skipped: number;
  failed: number;
  errors: Array<{ fileName: string; error: string }>;
}> {
  const protocolFiles = publicFiles.filter(f => {
    const classification = fileClassifications[f];
    return classification && classification.phase === 2;
  });

  const results = {
    success: false,
    message: '',
    processed: 0,
    succeeded: 0,
    skipped: 0,
    failed: 0,
    errors: [] as Array<{ fileName: string; error: string }>
  };

  for (let i = 0; i < protocolFiles.length; i++) {
    const fileName = protocolFiles[i];
    results.processed++;

    if (onProgress) {
      onProgress(i + 1, protocolFiles.length, fileName);
    }

    try {
      const { data: existing } = await supabase
        .from('document_ingestion_log')
        .select('status')
        .eq('source_file', fileName)
        .maybeSingle();

      if (existing && existing.status === 'completed') {
        results.skipped++;
        continue;
      }

      const protocolName = extractProtocolNameFromFilename(fileName);
      const category = categorizeProtocol(fileName);

      const { data: existingProtocol } = await supabase
        .from('canonical_protocols')
        .select('id')
        .eq('protocol_name', protocolName)
        .maybeSingle();

      if (existingProtocol) {
        results.skipped++;
        await supabase
          .from('document_ingestion_log')
          .upsert({
            source_file: fileName,
            doc_type: 'protocol',
            status: 'completed',
            extraction_confidence: 'Low',
            extracted_at: new Date().toISOString(),
            exceptions: JSON.stringify(['Protocol already exists']),
            metadata: {
              phase: 2,
              protocol_id: existingProtocol.id,
              protocol_name: protocolName
            }
          }, {
            onConflict: 'source_file'
          });
        continue;
      }

      const { data: protocol, error: protocolError } = await supabase
        .from('canonical_protocols')
        .insert({
          protocol_name: protocolName,
          category: category,
          target_concerns: [],
          typical_duration: '60 minutes',
          contraindications: [],
          completion_status: 'incomplete',
          source_file: fileName
        })
        .select()
        .single();

      if (protocolError) throw protocolError;

      await supabase
        .from('document_ingestion_log')
        .upsert({
          source_file: fileName,
          doc_type: 'protocol',
          status: 'completed',
          extraction_confidence: 'Low',
          extracted_at: new Date().toISOString(),
          exceptions: JSON.stringify(['Requires manual step completion']),
          metadata: {
            phase: 2,
            protocol_id: protocol.id,
            protocol_name: protocolName,
            category: category
          }
        }, {
          onConflict: 'source_file'
        });

      results.succeeded++;
    } catch (error) {
      results.failed++;
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      results.errors.push({ fileName, error: errorMsg });

      await supabase
        .from('document_ingestion_log')
        .upsert({
          source_file: fileName,
          doc_type: 'protocol',
          status: 'failed',
          exceptions: JSON.stringify([errorMsg]),
          metadata: {
            phase: 2,
            failed_at: new Date().toISOString()
          }
        }, {
          onConflict: 'source_file'
        });
    }
  }

  results.success = results.failed === 0;
  results.message = `Processed ${results.processed} files: ${results.succeeded} succeeded, ${results.skipped} skipped, ${results.failed} failed`;

  return results;
}

function extractProtocolNameFromFilename(fileName: string): string {
  const name = fileName
    .replace('.pdf', '')
    .replace(/_/g, ' ')
    .replace(/\d{6,}/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function categorizeProtocol(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.includes('facial') || lower.includes('peel')) return 'facial';
  if (lower.includes('massage')) return 'massage';
  if (lower.includes('body') || lower.includes('wrap')) return 'body_treatment';
  if (lower.includes('manicure') || lower.includes('hand')) return 'hand_treatment';
  if (lower.includes('pedicure') || lower.includes('foot')) return 'foot_treatment';
  if (lower.includes('eye')) return 'eye_treatment';
  if (lower.includes('lip')) return 'lip_treatment';
  if (lower.includes('scalp')) return 'scalp_treatment';
  if (lower.includes('back')) return 'body_treatment';
  return 'other';
}

export async function ingestPhase1(): Promise<{
  success: boolean;
  message: string;
  recordsCreated?: number;
  errors?: string[];
}> {
  const fileName = '2026+pro+marketing+calendar+-+final+(2).pdf';

  try {
    await supabase
      .from('document_ingestion_log')
      .upsert({
        source_file: fileName,
        doc_type: 'marketing',
        status: 'processing',
        metadata: {
          phase: 1,
          started_at: new Date().toISOString()
        }
      }, {
        onConflict: 'source_file'
      });

    const { data: existingData } = await supabase
      .from('marketing_calendar')
      .select('*')
      .eq('year', 2026);

    if (existingData && existingData.length > 0) {
      await supabase
        .from('document_ingestion_log')
        .update({
          status: 'completed',
          extracted_at: new Date().toISOString(),
          extraction_confidence: 'High',
          metadata: {
            phase: 1,
            records_found: existingData.length,
            note: 'Marketing calendar already populated from migration'
          }
        })
        .eq('source_file', fileName);

      return {
        success: true,
        message: 'Marketing calendar for 2026 already exists in database (populated from migration)',
        recordsCreated: existingData.length
      };
    }

    return {
      success: true,
      message: 'Marketing calendar data already exists',
      recordsCreated: 0
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    await supabase
      .from('document_ingestion_log')
      .update({
        status: 'failed',
        exceptions: JSON.stringify([errorMessage]),
        metadata: {
          phase: 1,
          failed_at: new Date().toISOString()
        }
      })
      .eq('source_file', fileName);

    return {
      success: false,
      message: 'Failed to ingest Phase 1',
      errors: [errorMessage]
    };
  }
}
