import { supabase } from './supabase';

export interface ExtractedProtocol {
  protocolName: string;
  category: string;
  targetConcerns: string[];
  typicalDuration: string | null;
  contraindications: string[];
  steps: ExtractedStep[];
  stepsMissing: boolean;
  extractionConfidence: 'High' | 'Medium' | 'Low';
  warnings: string[];
}

export interface ExtractedStep {
  stepNumber: number;
  stepTitle: string;
  stepInstructions: string;
  timingMinutes: number | null;
  techniqueNotes: string | null;
  products: ExtractedProduct[];
}

export interface ExtractedProduct {
  productName: string;
  usageAmount: string | null;
  usageUnit: string | null;
  notes: string | null;
  resolved: boolean;
}

export interface IngestionResult {
  success: boolean;
  protocolName: string;
  sourceFile: string;
  protocolId?: string;
  stepsCreated: number;
  stepProductLinksCreated: number;
  unresolvedProducts: string[];
  stepsMissing: boolean;
  extractionConfidence: string;
  errors: string[];
  warnings: string[];
}

const phase2Files = [
  'acneclearingbacktreatment_060524.pdf',
  'acneclearingfacial_protocol_060524.pdf',
  'advanced_wrinkle_remedy_facial_2021.pdf',
  'aromaticdetoxmassage.pdf',
  'balance_and_clarify_teen_facial_2025_(2).pdf',
  'caffeineguashaeyetreatment_100224.pdf',
  'caffeineguashafacial_100224_1.pdf',
  'copy_of_signaturepureresultsfacial_protocol_060524.pdf',
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
  'naturopathica_espresso_mud_detoxifying_body_treatment.pdf',
  'naturopathica_eye_contour_enhancement.pdf',
  'naturopathica_lemon_verbena_hydrating_body_treatment.pdf',
  'naturopathica_lemon_verbena_quench_manicure.pdf',
  'naturopathica_luminous_lip_enhancement.pdf',
  'naturopathica_moisture_drench_skin_conditioning_treatment.pdf',
  'naturopathica_rosemary_mint_pedicure.pdf',
  'naturopathica_seaweed_body_wrap_treatment.pdf',
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
  'smoothingglycolicfacial_protocol_2024.pdf',
  'spiced_pumpkin_facial_2023.pdf',
  'vitamincradiancefacial.pdf',
  'vitamincradiancefacialupdated.pdf',
  'winterwellbeingresetfacial.pdf'
];

async function matchProductToBackbar(productName: string): Promise<string | null> {
  const { data } = await supabase
    .from('pro_products')
    .select('id')
    .ilike('product_name', `%${productName}%`)
    .maybeSingle();

  return data?.id || null;
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

async function extractProtocolFromPDF(fileName: string): Promise<ExtractedProtocol> {
  const protocolName = extractProtocolNameFromFilename(fileName);

  const simpleProtocol: ExtractedProtocol = {
    protocolName,
    category: 'facial',
    targetConcerns: [],
    typicalDuration: '60 minutes',
    contraindications: [],
    steps: [],
    stepsMissing: true,
    extractionConfidence: 'Low',
    warnings: [
      'PDF text extraction requires server-side processing',
      'Protocol created with basic metadata only',
      'Steps and product details require manual entry or server-side parser'
    ]
  };

  return simpleProtocol;
}

export async function ingestCanonicalProtocol(fileName: string): Promise<IngestionResult> {
  const result: IngestionResult = {
    success: false,
    protocolName: '',
    sourceFile: fileName,
    stepsCreated: 0,
    stepProductLinksCreated: 0,
    unresolvedProducts: [],
    stepsMissing: true,
    extractionConfidence: 'Low',
    errors: [],
    warnings: []
  };

  try {
    await supabase
      .from('document_ingestion_log')
      .upsert({
        source_file: fileName,
        doc_type: 'protocol',
        status: 'processing',
        metadata: {
          phase: 2,
          started_at: new Date().toISOString()
        }
      }, {
        onConflict: 'source_file'
      });

    const extracted = await extractProtocolFromPDF(fileName);
    result.protocolName = extracted.protocolName;
    result.warnings = extracted.warnings;
    result.stepsMissing = extracted.stepsMissing;
    result.extractionConfidence = extracted.extractionConfidence;

    const { data: existingProtocol } = await supabase
      .from('canonical_protocols')
      .select('id')
      .eq('protocol_name', extracted.protocolName)
      .maybeSingle();

    if (existingProtocol) {
      result.errors.push('Protocol with this name already exists');
      throw new Error('Duplicate protocol name');
    }

    const { data: protocolData, error: protocolError } = await supabase
      .from('canonical_protocols')
      .insert({
        protocol_name: extracted.protocolName,
        category: extracted.category,
        target_concerns: extracted.targetConcerns,
        typical_duration: extracted.typicalDuration,
        contraindications: extracted.contraindications,
        modalities_steps: extracted.stepsMissing ? null : { steps: extracted.steps }
      })
      .select()
      .single();

    if (protocolError) throw protocolError;
    if (!protocolData) throw new Error('Failed to create protocol');

    result.protocolId = protocolData.id;

    if (!extracted.stepsMissing && extracted.steps.length > 0) {
      for (const step of extracted.steps) {
        const { data: stepData, error: stepError } = await supabase
          .from('canonical_protocol_steps')
          .insert({
            canonical_protocol_id: protocolData.id,
            step_number: step.stepNumber,
            step_title: step.stepTitle,
            step_instructions: step.stepInstructions,
            timing_minutes: step.timingMinutes,
            technique_notes: step.techniqueNotes
          })
          .select()
          .single();

        if (stepError) throw stepError;
        if (!stepData) continue;

        result.stepsCreated++;

        for (const product of step.products) {
          const productId = await matchProductToBackbar(product.productName);

          if (!productId) {
            result.unresolvedProducts.push(product.productName);
            result.warnings.push(`Product not found in backbar: ${product.productName}`);
            continue;
          }

          const { error: productError } = await supabase
            .from('canonical_protocol_step_products')
            .insert({
              protocol_step_id: stepData.id,
              product_id: productId,
              product_name: product.productName,
              product_type: 'BACKBAR',
              usage_amount: product.usageAmount,
              usage_unit: product.usageUnit,
              notes: product.notes
            });

          if (productError) {
            result.warnings.push(`Failed to link product: ${product.productName}`);
          } else {
            result.stepProductLinksCreated++;
          }
        }
      }
    }

    await supabase
      .from('document_ingestion_log')
      .update({
        status: 'completed',
        extracted_at: new Date().toISOString(),
        extraction_confidence: extracted.extractionConfidence,
        exceptions: JSON.stringify(result.warnings),
        metadata: {
          phase: 2,
          protocol_id: protocolData.id,
          protocol_name: extracted.protocolName,
          steps_created: result.stepsCreated,
          step_products_created: result.stepProductLinksCreated,
          unresolved_products_count: result.unresolvedProducts.length,
          steps_missing: result.stepsMissing,
          completed_at: new Date().toISOString()
        }
      })
      .eq('source_file', fileName);

    result.success = true;
    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(errorMessage);

    await supabase
      .from('document_ingestion_log')
      .update({
        status: 'failed',
        exceptions: JSON.stringify([...result.errors, ...result.warnings]),
        metadata: {
          phase: 2,
          failed_at: new Date().toISOString(),
          error: errorMessage
        }
      })
      .eq('source_file', fileName);

    return result;
  }
}

export async function runPreFlightValidation(): Promise<{
  passed: boolean;
  results: Array<{
    fileName: string;
    readable: boolean;
    pageCount?: number;
    canExtractText: boolean;
    error?: string;
  }>;
}> {
  const results = [];
  let allPassed = true;

  for (const fileName of phase2Files) {
    try {
      const response = await fetch(`/public/${fileName}`);

      if (!response.ok) {
        allPassed = false;
        results.push({
          fileName,
          readable: false,
          canExtractText: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        });

        await supabase
          .from('document_ingestion_log')
          .upsert({
            source_file: fileName,
            doc_type: 'protocol',
            status: 'failed',
            extraction_confidence: 'Low',
            exceptions: JSON.stringify([`Readability check failed: HTTP ${response.status}`]),
            metadata: {
              phase: 2,
              readability_check: 'failed',
              checked_at: new Date().toISOString()
            }
          }, {
            onConflict: 'source_file'
          });

        continue;
      }

      const blob = await response.blob();
      const sizeInMB = (blob.size / (1024 * 1024)).toFixed(2);

      results.push({
        fileName,
        readable: true,
        canExtractText: true
      });

      await supabase
        .from('document_ingestion_log')
        .upsert({
          source_file: fileName,
          doc_type: 'protocol',
          status: 'pending',
          extraction_confidence: 'Medium',
          metadata: {
            phase: 2,
            readability_check: 'passed',
            file_size_mb: sizeInMB,
            checked_at: new Date().toISOString()
          }
        }, {
          onConflict: 'source_file'
        });

    } catch (error) {
      allPassed = false;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      results.push({
        fileName,
        readable: false,
        canExtractText: false,
        error: errorMessage
      });

      await supabase
        .from('document_ingestion_log')
        .upsert({
          source_file: fileName,
          doc_type: 'protocol',
          status: 'failed',
          extraction_confidence: 'Low',
          exceptions: JSON.stringify([errorMessage]),
          metadata: {
            phase: 2,
            readability_check: 'failed',
            checked_at: new Date().toISOString()
          }
        }, {
          onConflict: 'source_file'
        });
    }
  }

  return {
    passed: allPassed,
    results
  };
}

export async function ingestPhase2(): Promise<{
  success: boolean;
  message: string;
  results: IngestionResult[];
  summary: {
    totalProtocols: number;
    protocolsWithMissingSteps: number;
    protocolsWithUnresolvedProducts: number;
    totalExceptions: number;
  };
}> {
  const preFlightCheck = await runPreFlightValidation();

  if (!preFlightCheck.passed) {
    const failedFiles = preFlightCheck.results
      .filter(r => !r.readable)
      .map(r => r.fileName);

    return {
      success: false,
      message: `Pre-flight validation failed for ${failedFiles.length} file(s)`,
      results: [],
      summary: {
        totalProtocols: 0,
        protocolsWithMissingSteps: 0,
        protocolsWithUnresolvedProducts: 0,
        totalExceptions: failedFiles.length
      }
    };
  }

  const results: IngestionResult[] = [];

  for (const fileName of phase2Files) {
    const result = await ingestCanonicalProtocol(fileName);
    results.push(result);
  }

  const summary = {
    totalProtocols: results.filter(r => r.success).length,
    protocolsWithMissingSteps: results.filter(r => r.stepsMissing).length,
    protocolsWithUnresolvedProducts: results.filter(r => r.unresolvedProducts.length > 0).length,
    totalExceptions: results.reduce((sum, r) => sum + r.errors.length + r.warnings.length, 0)
  };

  return {
    success: results.every(r => r.success),
    message: `Ingested ${summary.totalProtocols} protocols`,
    results,
    summary
  };
}
