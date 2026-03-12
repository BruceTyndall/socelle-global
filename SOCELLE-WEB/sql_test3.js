import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://rumdmulxzmjtsplsjngi.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

async function run() {
  const { data, error } = await supabase
    .from('market_signals')
    .select('tier_min')
  
  if (error) {
    console.error("Error:", error.message)
    return
  }
  
  const counts = { free: 0, paid: 0, pro: 0, enterprise: 0 }
  data.forEach(d => {
    if (counts[d.tier_min] !== undefined) counts[d.tier_min]++
    else counts[d.tier_min] = 1
  })
  
  console.log("Tier breakdown:", counts)
}
run()
