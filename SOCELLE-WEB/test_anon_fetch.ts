import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
  const { data, error } = await supabase
    .from('market_signals')
    .select('*')
    .eq('tier_min', 'free')
    .order('updated_at', { ascending: false })
    .limit(10);
    
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success block (anon):', data?.length, 'records');
    if (data?.length > 0) {
      console.log('First record title:', data[0].title);
    }
  }
}

testFetch();
