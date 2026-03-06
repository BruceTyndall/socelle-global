import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gxfbdlikixrgnhtbxntu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4ZmJkbGlraXhyZ25odGJ4bnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMTUyNzEsImV4cCI6MjA4NDU5MTI3MX0.1jskxiZbYd9yIUT9sHqBTSZXk03NrakUfgxdI60lp3k';

const supabase = createClient(supabaseUrl, supabaseKey);

const protocolFiles = [
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

async function ingestProtocol(fileName: string) {
  const protocolName = extractProtocolNameFromFilename(fileName);
  const category = categorizeProtocol(fileName);

  try {
    const { data: existing } = await supabase
      .from('canonical_protocols')
      .select('id')
      .eq('protocol_name', protocolName)
      .maybeSingle();

    if (existing) {
      console.log(`  SKIPPED: ${protocolName} (already exists)`);
      return { success: true, skipped: true };
    }

    const { data, error } = await supabase
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

    if (error) throw error;

    await supabase
      .from('document_ingestion_log')
      .insert({
        source_file: fileName,
        doc_type: 'protocol',
        status: 'completed',
        extraction_confidence: 'Low',
        extracted_at: new Date().toISOString(),
        exceptions: JSON.stringify(['Requires manual step completion']),
        metadata: {
          protocol_id: data.id,
          protocol_name: protocolName,
          category: category
        }
      });

    console.log(`  SUCCESS: ${protocolName}`);
    return { success: true, skipped: false, protocolId: data.id };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
    console.error(`  ERROR: ${protocolName} - ${errorMsg}`);
    return { success: false, skipped: false, error: errorMsg };
  }
}

async function main() {
  console.log('Starting protocol ingestion for', protocolFiles.length, 'files\n');

  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const file of protocolFiles) {
    const result = await ingestProtocol(file);
    if (result.skipped) {
      skippedCount++;
    } else if (result.success) {
      successCount++;
    } else {
      errorCount++;
    }
  }

  console.log('\n=== INGESTION COMPLETE ===');
  console.log(`Success: ${successCount}`);
  console.log(`Skipped (already exists): ${skippedCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Total: ${protocolFiles.length}`);

  process.exit(errorCount > 0 ? 1 : 0);
}

main().catch(console.error);
