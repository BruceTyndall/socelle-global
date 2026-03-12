import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envContent = fs.readFileSync('.env', 'utf-8')
const anonKeyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/)
const supabase = createClient(
  'https://rumdmulxzmjtsplsjngi.supabase.co',
  anonKeyMatch ? anonKeyMatch[1] : ''
)

async function testDates() {
  const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  console.log("Cutoff date:", cutoff)
  
  const { data, error } = await supabase
    .from('market_signals')
    .select('id, title, updated_at, tier_min')
    .eq('tier_min', 'free')
    .gte('updated_at', cutoff)
    .limit(5)
    
  console.log("Free signals within 14 days:", data?.length, error?.message || '')
  
  const { data: q2 } = await supabase
    .from('market_signals')
    .select('id, title, updated_at, tier_min')
    .eq('tier_min', 'free')
    .order('updated_at', { ascending: false })
    .limit(1)
    
  console.log("Most recent free signal date:", q2?.[0]?.updated_at)
}
testDates()
