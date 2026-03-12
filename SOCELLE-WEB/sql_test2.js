import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rumdmulxzmjtsplsjngi.supabase.co'
const envContent = fs.readFileSync('.env', 'utf-8')
const serviceRoleMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)
const supabase = createClient(supabaseUrl, serviceRoleMatch ? serviceRoleMatch[1] : '')

async function run() {
  const { data, error } = await supabase
    .from('market_signals')
    .select('id, title, tier_min, tier_visibility')
    .limit(10)
    
  console.log("Signals:", data)
}
run()
