import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function createAdmin() {
  const email = 'admin@socelle.local';
  const password = 'Password123!';
  
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    if (error.message.includes('already exists')) {
      console.log(`User already exists. You can log in with:
Email: ${email}
Password: ${password}`);
      // Force update password just in case
      await supabase.auth.admin.updateUserById(
        (await supabase.from('user_profiles').select('id').eq('email', email).single()).data?.id || (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === email).id,
        { password }
      );
      return;
    }
    console.error('Error creating user:', error);
    return;
  }

  // Set the user_profile role to 'admin'
  await supabase.from('user_profiles').update({ role: 'admin' }).eq('id', data.user.id);
  
  console.log(`Admin created successfully!
Login URL: http://localhost:5173/login
Email: ${email}
Password: ${password}`);
}

createAdmin();
