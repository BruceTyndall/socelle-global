import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing URL or Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  const email = 'brucetyndallprofessional@gmail.com';
  const password = 'MasterPass123!';
  
  // Create or get user
  const { data: existingUser } = await supabase.auth.admin.listUsers();
  let user = existingUser?.users.find(u => u.email === email);
  
  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: 'Bruce Master User' }
    });
    if (error) { console.error('Error creating user:', error); return; }
    user = data.user;
    console.log('Created auth user.');
  } else {
    // Update password just in case
    await supabase.auth.admin.updateUserById(user.id, { password });
    console.log('User already exists, updated password to MasterPass123!');
  }

  // To do everything, they either need "admin" role or a special role. Let's just give them "admin" and "business" and "brand" if possible, or print instructions. 
  // Let's verify the `user_profiles` schema first. We'll just set it to 'admin' for now.
  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert({
      id: user.id,
      role: 'admin',
      email: user.email
    });

  if (profileError) console.error('Profile error:', profileError);
  else console.log(`Master account ready: ${email} / ${password} (Role: admin)`);
}

run().catch(console.error);
