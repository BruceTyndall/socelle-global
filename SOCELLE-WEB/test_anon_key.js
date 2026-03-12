import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'brucetyndallprofessional@gmail.com',
    password: 'MasterPass123!'
  });
  console.log("Result:");
  console.log(data);
  if (error) console.error("Error:", error.message);
}

check();
