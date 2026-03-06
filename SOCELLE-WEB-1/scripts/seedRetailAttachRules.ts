import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gxfbdlikixrgnhtbxntu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4ZmJkbGlraXhyZ25odGJ4bnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMTUyNzEsImV4cCI6MjA4NDU5MTI3MX0.1jskxiZbYd9yIUT9sHqBTSZXk03NrakUfgxdI60lp3k';

const supabase = createClient(supabaseUrl, supabaseKey);

interface RetailProduct {
  id: string;
  product_name: string;
  category: string;
  target_concerns: string[];
}

interface Protocol {
  id: string;
  protocol_name: string;
  category: string;
  target_concerns: string[];
}

const concernCategoryMap: Record<string, string[]> = {
  'aging': ['facial', 'eye_treatment'],
  'fine lines': ['facial', 'eye_treatment'],
  'wrinkles': ['facial', 'eye_treatment'],
  'hydration': ['facial', 'body_treatment', 'hand_treatment'],
  'dryness': ['facial', 'body_treatment', 'hand_treatment', 'foot_treatment'],
  'acne': ['facial'],
  'blemishes': ['facial'],
  'sensitivity': ['facial', 'body_treatment'],
  'redness': ['facial'],
  'dark circles': ['eye_treatment'],
  'puffiness': ['eye_treatment'],
  'firmness': ['facial', 'body_treatment', 'eye_treatment'],
  'elasticity': ['facial', 'body_treatment'],
  'brightness': ['facial'],
  'dullness': ['facial'],
  'hyperpigmentation': ['facial'],
  'uneven tone': ['facial'],
  'texture': ['facial', 'body_treatment'],
  'exfoliation': ['facial', 'body_treatment', 'hand_treatment', 'foot_treatment']
};

function matchesCategory(retail: RetailProduct, protocolCategory: string): boolean {
  if (!retail.target_concerns || retail.target_concerns.length === 0) {
    return retail.category.toLowerCase().includes('face') && protocolCategory === 'facial';
  }

  for (const concern of retail.target_concerns) {
    const concernLower = concern.toLowerCase();
    const matchedCategories = concernCategoryMap[concernLower] || [];
    if (matchedCategories.includes(protocolCategory)) {
      return true;
    }
  }

  return false;
}

function calculateRecommendationStrength(retail: RetailProduct, protocol: Protocol): 'high' | 'medium' | 'low' {
  const sharedConcerns = retail.target_concerns.filter(rc =>
    protocol.target_concerns.some(pc =>
      rc.toLowerCase() === pc.toLowerCase()
    )
  ).length;

  if (sharedConcerns >= 2) return 'high';
  if (sharedConcerns === 1) return 'medium';
  return 'low';
}

async function main() {
  console.log('Starting retail attach rules seeding...\n');

  const { data: retailProducts, error: retailError } = await supabase
    .from('retail_products')
    .select('id, product_name, category, target_concerns')
    .eq('status', 'Active');

  if (retailError) {
    console.error('Failed to fetch retail products:', retailError);
    process.exit(1);
  }

  const { data: protocols, error: protocolError } = await supabase
    .from('canonical_protocols')
    .select('id, protocol_name, category, target_concerns');

  if (protocolError) {
    console.error('Failed to fetch protocols:', protocolError);
    process.exit(1);
  }

  console.log(`Found ${retailProducts.length} retail products`);
  console.log(`Found ${protocols.length} protocols\n`);

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const retail of retailProducts) {
    for (const protocol of protocols) {
      if (!matchesCategory(retail, protocol.category)) {
        continue;
      }

      const { data: existing } = await supabase
        .from('retail_attach_rules')
        .select('id')
        .eq('protocol_id', protocol.id)
        .eq('retail_product_id', retail.id)
        .maybeSingle();

      if (existing) {
        skipped++;
        continue;
      }

      const recommendationStrength = calculateRecommendationStrength(retail, protocol);
      const attachRate = recommendationStrength === 'high' ? 0.25 :
                        recommendationStrength === 'medium' ? 0.15 :
                        0.10;

      const { error: insertError } = await supabase
        .from('retail_attach_rules')
        .insert({
          protocol_id: protocol.id,
          retail_product_id: retail.id,
          recommended_for_concerns: retail.target_concerns || [],
          recommendation_strength: recommendationStrength,
          attach_rate: attachRate,
          rationale: `${retail.product_name} complements ${protocol.protocol_name} for ${retail.target_concerns?.join(', ') || 'general care'}`
        });

      if (insertError) {
        console.error(`Error creating rule for ${retail.product_name} + ${protocol.protocol_name}:`, insertError.message);
        errors++;
      } else {
        created++;
      }
    }
  }

  console.log('\n=== SEED COMPLETE ===');
  console.log(`Created: ${created} rules`);
  console.log(`Skipped (already exists): ${skipped} rules`);
  console.log(`Errors: ${errors}`);

  process.exit(errors > 0 ? 1 : 0);
}

main().catch(console.error);
