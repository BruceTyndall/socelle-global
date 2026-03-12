import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rumdmulxzmjtsplsjngi.supabase.co'
const envContent = fs.readFileSync('.env', 'utf-8')
const serviceRoleMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)
const supabase = createClient(supabaseUrl, serviceRoleMatch ? serviceRoleMatch[1] : '')

async function run() {
  const { data, error } = await supabase.rpc('get_policies', { table_name: 'market_signals' })
  if (error) {
     // Fallback if rpc doesn't exist
     const { data: qData, error: qErr } = await supabase.from('market_signals').select('*').limit(1)
     console.log('Admin fetch:', qData?.length)
  } else {
     console.log('Policies:', data)
  }
}
run()
