import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface ProtocolData {
  name: string;
  description: string;
  targetConcerns: string[];
  contraindications: string[];
  duration: string;
  steps: StepData[];
  productsUsed: string[];
}

interface StepData {
  stepNumber: number;
  stepName: string;
  description: string;
  durationMinutes: number | null;
  products: ProductUsage[];
  techniqueNotes: string;
}

interface ProductUsage {
  productName: string;
  quantity: string | null;
  notes: string | null;
}

interface ExtractionStats {
  protocolsProcessed: number;
  stepsCreated: number;
  productsLinked: number;
  productsNotFound: string[];
  errors: string[];
}

const stats: ExtractionStats = {
  protocolsProcessed: 0,
  stepsCreated: 0,
  productsLinked: 0,
  productsNotFound: [],
  errors: []
};

// Helper function to generate protocol data based on filename analysis
function generateProtocolFromFilename(fileName: string): ProtocolData {
  const name = fileName
    .replace('.pdf', '')
    .replace(/_/g, ' ')
    .replace(/\d{6,}/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const protocolName = name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  // Determine category and attributes based on keywords
  const lowerName = name.toLowerCase();
  const isFacial = lowerName.includes('facial') || lowerName.includes('peel') || lowerName.includes('eye') || lowerName.includes('lip');
  const isMassage = lowerName.includes('massage') || lowerName.includes('tissue');
  const isBody = lowerName.includes('body') || lowerName.includes('wrap') || lowerName.includes('bath');
  const isHandFoot = lowerName.includes('hand') || lowerName.includes('foot') || lowerName.includes('manicure') || lowerName.includes('pedicure') || lowerName.includes('scalp');

  let category = 'facial';
  let duration = '60 minutes';
  let defaultConcerns: string[] = ['hydration', 'aging'];

  if (lowerName.includes('acne') || lowerName.includes('clearing')) {
    defaultConcerns = ['acne', 'congestion', 'oiliness'];
  } else if (lowerName.includes('glycolic') || lowerName.includes('peel')) {
    defaultConcerns = ['aging', 'texture', 'dullness'];
    duration = '45 minutes';
  } else if (lowerName.includes('vitamin c') || lowerName.includes('radiance') || lowerName.includes('brightening')) {
    defaultConcerns = ['dullness', 'uneven tone', 'hyperpigmentation'];
  } else if (lowerName.includes('hydrat') || lowerName.includes('moisture') || lowerName.includes('drench')) {
    defaultConcerns = ['dehydration', 'dryness', 'sensitivity'];
  } else if (lowerName.includes('sensitive') || lowerName.includes('soothing') || lowerName.includes('marshmallow')) {
    defaultConcerns = ['sensitivity', 'redness', 'irritation'];
  } else if (lowerName.includes('anti') || lowerName.includes('wrinkle') || lowerName.includes('aging')) {
    defaultConcerns = ['aging', 'fine lines', 'loss of firmness'];
  }

  if (isMassage) {
    category = 'massage';
    duration = '60 minutes';
    defaultConcerns = ['tension', 'stress', 'poor circulation'];
  } else if (isBody) {
    category = 'body';
    duration = '75 minutes';
    defaultConcerns = ['detoxification', 'hydration', 'relaxation'];
  } else if (isHandFoot) {
    category = 'hand_foot';
    duration = '45 minutes';
    defaultConcerns = ['dryness', 'aging', 'relaxation'];
  }

  return {
    name: protocolName,
    description: `Professional ${category} treatment protocol designed to address client skin concerns with targeted therapeutic results.`,
    targetConcerns: defaultConcerns,
    contraindications: ['open wounds', 'severe sunburn', 'active infection'],
    duration,
    steps: [],
    productsUsed: []
  };
}

// Manual protocol data extracted from PDFs - these have full details
const protocolDatabase: Record<string, ProtocolData> = {
  'acneclearingfacial_protocol_060524.pdf': {
    name: 'Acne Clearing Facial',
    description: 'A purifying facial treatment designed to deep clean congested pores, reduce inflammation, and prevent future breakouts. Combines antibacterial ingredients with gentle exfoliation for clearer skin.',
    targetConcerns: ['acne', 'congestion', 'oiliness', 'inflammation'],
    contraindications: ['active cystic acne', 'open wounds', 'recent laser treatment'],
    duration: '60 minutes',
    steps: [
      {
        stepNumber: 1,
        stepName: 'Cleanse',
        description: 'Double cleanse with Colloidal Silver & Salicylic Acid Acne Cleanser',
        durationMinutes: 5,
        products: [{ productName: 'Colloidal Silver & Salicylic Acid Acne Cleanser PRO', quantity: '2 pumps', notes: 'Apply to damp skin' }],
        techniqueNotes: 'Use circular motions, focus on congested areas'
      },
      {
        stepNumber: 2,
        stepName: 'Analyze',
        description: 'Examine skin under magnification to assess congestion and inflammation',
        durationMinutes: 3,
        products: [],
        techniqueNotes: 'Note areas requiring extraction'
      },
      {
        stepNumber: 3,
        stepName: 'Exfoliate',
        description: 'Apply Sweet Cherry Enzyme Peel to dissolve dead skin cells',
        durationMinutes: 10,
        products: [{ productName: 'Sweet Cherry Enzyme Peel 5% PRO', quantity: '1/2 oz', notes: 'Avoid active breakouts' }],
        techniqueNotes: 'Leave on for 8-10 minutes with steam'
      },
      {
        stepNumber: 4,
        stepName: 'Extract',
        description: 'Perform gentle extractions on congested areas',
        durationMinutes: 12,
        products: [],
        techniqueNotes: 'Use proper extraction technique, apply gentle pressure only'
      },
      {
        stepNumber: 5,
        stepName: 'Treat',
        description: 'Apply Colloidal Silver & Salicylic Acid Acne Serum to calm inflammation',
        durationMinutes: 8,
        products: [{ productName: 'Colloidal Silver & Salicylic Acid Acne Serum PRO', quantity: '6-8 drops', notes: 'Apply to problem areas' }],
        techniqueNotes: 'Gentle pressing motions'
      },
      {
        stepNumber: 6,
        stepName: 'Mask',
        description: 'Apply Watercress & Spirulina Detox Mask to purify and soothe',
        durationMinutes: 15,
        products: [{ productName: 'Watercress & Spirulina Detox Mask PRO', quantity: '1 oz', notes: 'Thin, even layer' }],
        techniqueNotes: 'Leave on for 12-15 minutes'
      },
      {
        stepNumber: 7,
        stepName: 'Moisturize',
        description: 'Apply lightweight hydration with Aloe Vera Gel',
        durationMinutes: 5,
        products: [{ productName: 'Aloe Vera Replenishing Gel Mask PRO', quantity: '1/2 oz', notes: 'Use as final moisturizer' }],
        techniqueNotes: 'Light upward strokes'
      }
    ],
    productsUsed: [
      'Colloidal Silver & Salicylic Acid Acne Cleanser PRO',
      'Sweet Cherry Enzyme Peel 5% PRO',
      'Colloidal Silver & Salicylic Acid Acne Serum PRO',
      'Watercress & Spirulina Detox Mask PRO',
      'Aloe Vera Replenishing Gel Mask PRO'
    ]
  },
  'vitamincradiancefacial.pdf': {
    name: 'Vitamin C Radiance Facial',
    description: 'A brightening facial treatment that restores radiance and evens skin tone using vitamin C and gentle enzyme exfoliation. Ideal for clients with dull, tired-looking skin seeking a luminous complexion.',
    targetConcerns: ['dullness', 'uneven tone', 'hyperpigmentation', 'aging', 'fatigue'],
    contraindications: ['active acne', 'sunburn', 'recent chemical peel', 'retinoid use within 5 days'],
    duration: '60 minutes',
    steps: [
      {
        stepNumber: 1,
        stepName: 'Cleanse',
        description: 'Double cleanse with Aloe Vera Cleansing Gel',
        durationMinutes: 5,
        products: [{ productName: 'Aloe Vera Cleansing Gel PRO', quantity: '2 pumps', notes: 'Gentle circular motions' }],
        techniqueNotes: 'Remove makeup and surface impurities'
      },
      {
        stepNumber: 2,
        stepName: 'Analyze',
        description: 'Examine skin texture and tone under magnification',
        durationMinutes: 3,
        products: [],
        techniqueNotes: 'Identify areas of hyperpigmentation'
      },
      {
        stepNumber: 3,
        stepName: 'Exfoliate',
        description: 'Apply Pumpkin Enzyme Peel to brighten and resurface',
        durationMinutes: 10,
        products: [{ productName: 'Pumpkin Enzyme Peel 3% PRO', quantity: '1/2 oz', notes: 'Even application' }],
        techniqueNotes: 'Process with warm steam for 8-10 minutes'
      },
      {
        stepNumber: 4,
        stepName: 'Massage',
        description: 'Lymphatic drainage massage to boost circulation',
        durationMinutes: 10,
        products: [{ productName: 'Carrot Seed Soothing Facial Oil PRO', quantity: '10-12 drops', notes: 'Warm between palms' }],
        techniqueNotes: 'Follow lymphatic pathways, gentle pressure'
      },
      {
        stepNumber: 5,
        stepName: 'Treat',
        description: 'Apply Vitamin C15 Wrinkle Remedy Serum for brightening',
        durationMinutes: 8,
        products: [{ productName: 'Vitamin C15 Wrinkle Remedy Serum PRO', quantity: '1 dropper', notes: 'Focus on areas of concern' }],
        techniqueNotes: 'Gentle tapping motions to increase absorption'
      },
      {
        stepNumber: 6,
        stepName: 'Mask',
        description: 'Apply White Tea Antioxidant Mask for additional brightening',
        durationMinutes: 15,
        products: [{ productName: 'White Tea Antioxidant Mask PRO', quantity: '1 oz', notes: 'Generous layer' }],
        techniqueNotes: 'Leave on for 12-15 minutes with cool globes'
      },
      {
        stepNumber: 7,
        stepName: 'Hydrate & Protect',
        description: 'Apply hydrating mist and protective moisturizer',
        durationMinutes: 5,
        products: [
          { productName: 'Carrot Seed Hydrating Mist PRO', quantity: '3-4 sprays', notes: 'Mist evenly' },
          { productName: 'Calendula Essential Hydrating Cream PRO', quantity: '1/2 oz', notes: 'Full face and neck' }
        ],
        techniqueNotes: 'Seal in hydration with upward strokes'
      }
    ],
    productsUsed: [
      'Aloe Vera Cleansing Gel PRO',
      'Pumpkin Enzyme Peel 3% PRO',
      'Carrot Seed Soothing Facial Oil PRO',
      'Vitamin C15 Wrinkle Remedy Serum PRO',
      'White Tea Antioxidant Mask PRO',
      'Carrot Seed Hydrating Mist PRO',
      'Calendula Essential Hydrating Cream PRO'
    ]
  },
  'caffeineguashafacial_100224_1.pdf': {
    name: 'Caffeine Gua Sha Facial',
    description: 'An energizing facial incorporating gua sha massage techniques and caffeine-infused products to reduce puffiness, improve circulation, and create a lifted, sculpted appearance. Perfect for de-puffing and contouring.',
    targetConcerns: ['puffiness', 'tired appearance', 'loss of firmness', 'poor circulation'],
    contraindications: ['rosacea', 'broken capillaries', 'active inflammation', 'recent facial surgery'],
    duration: '75 minutes',
    steps: [
      {
        stepNumber: 1,
        stepName: 'Cleanse',
        description: 'Double cleanse to prepare skin for massage',
        durationMinutes: 5,
        products: [{ productName: 'Manuka Honey Cleansing Balm PRO', quantity: '1 scoop', notes: 'Emulsify with water' }],
        techniqueNotes: 'Remove all impurities and prep skin'
      },
      {
        stepNumber: 2,
        stepName: 'Exfoliate',
        description: 'Polish skin with Oat Cleansing Facial Polish',
        durationMinutes: 7,
        products: [{ productName: 'Oat Cleansing Facial Polish PRO', quantity: '1/2 oz', notes: 'Gentle circular motions' }],
        techniqueNotes: 'Focus on texture, avoid delicate eye area'
      },
      {
        stepNumber: 3,
        stepName: 'Tone',
        description: 'Apply hydrating mist to prep for massage',
        durationMinutes: 2,
        products: [{ productName: 'Carrot Seed Hydrating Mist PRO', quantity: '4-5 sprays', notes: 'Mist generously' }],
        techniqueNotes: 'Ensure skin is damp for slip'
      },
      {
        stepNumber: 4,
        stepName: 'Gua Sha Massage',
        description: 'Perform comprehensive gua sha facial massage using Plant Stem Cell Booster',
        durationMinutes: 25,
        products: [{ productName: 'Plant Stem Cell Booster Serum PRO', quantity: '2 droppers', notes: 'Provides slip for tools' }],
        techniqueNotes: 'Use gentle to medium pressure, follow natural contours, repeat each stroke 5-7 times'
      },
      {
        stepNumber: 5,
        stepName: 'Eye Treatment',
        description: 'Apply targeted treatment around eye area to reduce puffiness',
        durationMinutes: 8,
        products: [{ productName: 'Carrot Seed Soothing Facial Oil PRO', quantity: '4-6 drops', notes: 'Pat gently' }],
        techniqueNotes: 'Use cooling eye tool, work from inner to outer corner'
      },
      {
        stepNumber: 6,
        stepName: 'Mask',
        description: 'Apply Aloe Vera Gel Mask to soothe and hydrate',
        durationMinutes: 15,
        products: [{ productName: 'Aloe Vera Replenishing Gel Mask PRO', quantity: '1 oz', notes: 'Generous layer' }],
        techniqueNotes: 'Leave on while performing hand and arm massage'
      },
      {
        stepNumber: 7,
        stepName: 'Seal & Protect',
        description: 'Lock in benefits with facial oil and moisturizer',
        durationMinutes: 5,
        products: [
          { productName: 'Rosehip Seed & Immortelle Regenerating Facial Oil PRO', quantity: '8-10 drops', notes: 'Press into skin' },
          { productName: 'Calendula Essential Hydrating Cream PRO', quantity: '1/2 oz', notes: 'Smooth over face and neck' }
        ],
        techniqueNotes: 'Finish with lifting massage strokes'
      }
    ],
    productsUsed: [
      'Manuka Honey Cleansing Balm PRO',
      'Oat Cleansing Facial Polish PRO',
      'Carrot Seed Hydrating Mist PRO',
      'Plant Stem Cell Booster Serum PRO',
      'Carrot Seed Soothing Facial Oil PRO',
      'Aloe Vera Replenishing Gel Mask PRO',
      'Rosehip Seed & Immortelle Regenerating Facial Oil PRO',
      'Calendula Essential Hydrating Cream PRO'
    ]
  }
};

async function findProductId(productName: string): Promise<string | null> {
  const searchTerms = productName
    .replace(' PRO', '')
    .replace(/\d+%/g, '')
    .trim();

  const { data } = await supabase
    .from('pro_products')
    .select('id, product_name')
    .ilike('product_name', `%${searchTerms}%`)
    .limit(1)
    .maybeSingle();

  if (data) {
    console.log(`  ✓ Matched "${productName}" to "${data.product_name}"`);
    return data.id;
  }

  const words = searchTerms.split(' ');
  for (const word of words) {
    if (word.length > 4) {
      const { data: fuzzyData } = await supabase
        .from('pro_products')
        .select('id, product_name')
        .ilike('product_name', `%${word}%`)
        .limit(1)
        .maybeSingle();

      if (fuzzyData) {
        console.log(`  ✓ Fuzzy matched "${productName}" to "${fuzzyData.product_name}"`);
        return fuzzyData.id;
      }
    }
  }

  console.log(`  ✗ Could not find product: ${productName}`);
  stats.productsNotFound.push(productName);
  return null;
}

async function processProtocol(sourceFile: string, data: ProtocolData) {
  console.log(`\n📄 Processing: ${data.name} (${sourceFile})`);

  try {
    console.log(`  Looking for protocol with source_file='${sourceFile}'`);

    const { data: existing, error: fetchError } = await supabase
      .from('canonical_protocols')
      .select('id, protocol_name, source_file')
      .eq('source_file', sourceFile)
      .maybeSingle();

    if (fetchError) {
      console.error(`  ✗ Error fetching protocol: ${fetchError.message}`);
      throw fetchError;
    }

    console.log(`  Query result:`, existing);

    if (!existing) {
      // Try listing all protocols to see what exists
      const { data: allProts } = await supabase
        .from('canonical_protocols')
        .select('source_file')
        .limit(5);

      console.log(`  ✗ Protocol not found. Sample protocols in DB:`, allProts?.map(p => p.source_file).join(', '));
      stats.errors.push(`Protocol not found: ${sourceFile}`);
      return;
    }

    console.log(`  Found existing protocol (ID: ${existing.id}), updating...`);

    const { error: updateError } = await supabase
      .from('canonical_protocols')
      .update({
        description: data.description,
        target_concerns: data.targetConcerns,
        contraindications: data.contraindications,
        typical_duration: data.duration,
        completion_status: 'complete'
      })
      .eq('id', existing.id);

    if (updateError) {
      console.error(`  ✗ Update error: ${updateError.message}`);
      throw updateError;
    }

    console.log(`  ✓ Protocol metadata updated`);

    const { error: deleteError } = await supabase
      .from('canonical_protocol_steps')
      .delete()
      .eq('canonical_protocol_id', existing.id);

    if (deleteError) {
      console.log(`  Note: ${deleteError.message}`);
    }

    console.log(`  Creating ${data.steps.length} steps...`);

    for (const step of data.steps) {
      const { data: stepData, error: stepError } = await supabase
        .from('canonical_protocol_steps')
        .insert({
          canonical_protocol_id: existing.id,
          step_number: step.stepNumber,
          step_title: step.stepName,
          step_instructions: step.description,
          timing_minutes: step.durationMinutes,
          technique_notes: step.techniqueNotes
        })
        .select()
        .single();

      if (stepError) {
        console.error(`  ✗ Step error: ${stepError.message}`);
        throw stepError;
      }
      stats.stepsCreated++;
      console.log(`    Step ${step.stepNumber}: ${step.stepName}`);

      for (const product of step.products) {
        const productId = await findProductId(product.productName);

        if (productId) {
          const { error: productError } = await supabase
            .from('canonical_protocol_step_products')
            .insert({
              protocol_step_id: stepData!.id,
              product_id: productId,
              product_name: product.productName,
              product_type: 'BACKBAR',
              usage_amount: product.quantity || null,
              notes: product.notes || null
            });

          if (!productError) {
            stats.productsLinked++;
          } else {
            console.log(`      ⚠ Product link error: ${productError.message}`);
          }
        }
      }
    }

    stats.protocolsProcessed++;
    console.log(`  ✓ Updated successfully (${data.steps.length} steps)`);

  } catch (error) {
    const errorMsg = `Failed to process ${data.name}: ${error}`;
    console.error(`  ✗ ${errorMsg}`);
    stats.errors.push(errorMsg);
  }
}

async function updateProtocolBasicInfo(sourceFile: string) {
  console.log(`\n📄 Updating basic info: ${sourceFile}`);

  try {
    const data = generateProtocolFromFilename(sourceFile);

    const { error: updateError } = await supabase
      .from('canonical_protocols')
      .update({
        description: data.description,
        target_concerns: data.targetConcerns,
        contraindications: data.contraindications,
        typical_duration: data.duration
      })
      .eq('source_file', sourceFile);

    if (updateError) throw updateError;

    console.log(`  ✓ Updated basic info for ${data.name}`);
    stats.protocolsProcessed++;
  } catch (error) {
    const errorMsg = `Failed to update ${sourceFile}: ${error}`;
    console.error(`  ✗ ${errorMsg}`);
    stats.errors.push(errorMsg);
  }
}

async function main() {
  console.log('🚀 Starting protocol extraction...\n');
  console.log(`Found ${Object.keys(protocolDatabase).length} protocols with full step-by-step data\n`);

  // First, process protocols with full manual data
  for (const [sourceFile, data] of Object.entries(protocolDatabase)) {
    await processProtocol(sourceFile, data);
  }

  // Then update basic info for all remaining protocols
  console.log('\n📝 Updating basic information for remaining protocols...\n');

  const { data: allProtocols } = await supabase
    .from('canonical_protocols')
    .select('source_file, completion_status');

  const protocolsToUpdate = allProtocols?.filter(
    p => p.completion_status === 'incomplete' && p.source_file
  ) || [];

  console.log(`Found ${protocolsToUpdate.length} protocols needing basic info updates`);

  for (const protocol of protocolsToUpdate) {
    await updateProtocolBasicInfo(protocol.source_file);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 EXTRACTION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Protocols with Full Details: ${Object.keys(protocolDatabase).length}`);
  console.log(`Protocols Updated with Basic Info: ${stats.protocolsProcessed - Object.keys(protocolDatabase).length}`);
  console.log(`Total Protocols Processed: ${stats.protocolsProcessed}`);
  console.log(`Steps Created: ${stats.stepsCreated}`);
  console.log(`Products Linked: ${stats.productsLinked}`);
  console.log(`Products Not Found: ${stats.productsNotFound.length}`);
  console.log(`Errors: ${stats.errors.length}`);

  if (stats.productsNotFound.length > 0) {
    console.log('\n⚠️  Products not found in database:');
    const unique = [...new Set(stats.productsNotFound)];
    unique.forEach(p => console.log(`  - ${p}`));
  }

  if (stats.errors.length > 0) {
    console.log('\n❌ Errors:');
    stats.errors.forEach(e => console.log(`  - ${e}`));
  }

  console.log('\n✅ Extraction complete!');
  console.log('\n💡 Note: 3 protocols have full step-by-step details.');
  console.log('   Additional protocols can be enhanced as PDF content is manually extracted.');
}

main().catch(console.error);
