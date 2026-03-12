const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
  const { data, error } = await supabase
    .from('market_signals')
    .select('title')
    .eq('tier_min', 'free')
    .limit(1);
    
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success block:', data);
  }
}

testFetch();
