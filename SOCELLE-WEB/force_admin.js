import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const email = 'admin@socelle.local';
  const password = 'Password123!';
  
  const { data: usersData } = await supabase.auth.admin.listUsers();
  const user = usersData?.users.find(u => u.email === email);
  
  if (user) {
     await supabase.auth.admin.updateUserById(user.id, { password });
     await supabase.from('user_profiles').update({ role: 'admin' }).eq('id', user.id);
     console.log('Admin password forced. Login: admin@socelle.local / Password123!');
  } else {
     const { data } = await supabase.auth.admin.createUser({ email, password, email_confirm: true });
     await supabase.from('user_profiles').update({ role: 'admin' }).eq('id', data.user.id);
     console.log('Admin newly created. Login: admin@socelle.local / Password123!');
  }
}
run();
