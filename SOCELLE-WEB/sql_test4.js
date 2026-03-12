import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envContent = fs.readFileSync('.env', 'utf-8')
const anonKeyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/)
const supabase = createClient(
  'https://rumdmulxzmjtsplsjngi.supabase.co',
  anonKeyMatch ? anonKeyMatch[1] : ''
)

async function testFreeTier() {
  const { data, error } = await supabase
    .from('market_signals')
    .select('id, title, tier_min')
    .eq('tier_min', 'free')
    .limit(5)
  console.log("Free filter: ", data?.length, error?.message || '')
  
  const { data: q2, error: e2 } = await supabase
    .from('market_signals')
    .select('id, title, tier_min')
    .limit(5)
  console.log("No filter: ", q2?.length, e2?.message || '')
}
testFreeTier()
