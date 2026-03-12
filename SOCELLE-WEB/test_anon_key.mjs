import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
console.log("URL:", url);
console.log("KEY LENGTH:", key ? key.length : 0);

try {
  const supabase = createClient(url, key);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'brucetyndallprofessional@gmail.com',
    password: 'MasterPass123!'
  });
  console.log("Auth Error:", error ? error.message : "None");
  if (data?.user) console.log("Logged in user:", data.user.id);
} catch (err) {
  console.error("Exception:", err.message);
}
