import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });
const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!, { auth: { persistSession: false } });

async function run() {
  const email = 'brucetyndallprofessional@gmail.com';
  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users?.users.find(u => u.email === email);
  if (!user) { console.log('User not found in auth.users'); return; }
  console.log('User ID:', user.id);
  
  const { data: profile } = await supabase.from('user_profiles').select('*').eq('id', user.id).single();
  console.log('Profile:', profile);
}
run().catch(console.error);
