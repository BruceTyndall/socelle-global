import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
  console.error('❌ Missing VITE_SUPABASE_URL');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_KEY');
  console.error('\nTo run this script, add your Supabase service role key to .env:');
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here\n');
  console.error('You can find it at: https://supabase.com/dashboard/project/gxfbdlikixrgnhtbxntu/settings/api\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const testUsers = [
  {
    email: 'test-business@platform.dev',
    password: 'TestPass123!',
    role: 'business' as const,
    full_name: 'Test Business User',
    business_name: 'Serenity Spa & Wellness',
    business_type: 'spa'
  },
  {
    email: 'test-brand@platform.dev',
    password: 'TestPass123!',
    role: 'brand' as const,
    full_name: 'Test Brand User',
    brand_id: '00000000-0000-0000-0000-000000000001'
  },
  {
    email: 'test-admin@platform.dev',
    password: 'TestPass123!',
    role: 'admin' as const,
    full_name: 'Test Admin User'
  }
];

async function seedTestUsers() {
  console.log('🌱 Seeding test user accounts...\n');

  for (const userData of testUsers) {
    console.log(`Creating ${userData.role} user: ${userData.email}`);

    try {
      const { data: existingUser, error: checkError } = await supabase.auth.admin.listUsers();

      if (checkError) {
        console.error(`  ❌ Error checking existing users: ${checkError.message}`);
        continue;
      }

      const exists = existingUser.users.find(u => u.email === userData.email);

      if (exists) {
        console.log(`  ⚠️  User already exists, deleting and recreating...`);
        await supabase.auth.admin.deleteUser(exists.id);
      }

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          full_name: userData.full_name
        }
      });

      if (authError) {
        console.error(`  ❌ Auth error: ${authError.message}`);
        continue;
      }

      if (!authData.user) {
        console.error(`  ❌ No user data returned`);
        continue;
      }

      const profileData: any = {
        id: authData.user.id,
        role: userData.role,
        full_name: userData.full_name
      };

      if (userData.role === 'business') {
        profileData.business_name = userData.business_name;
        profileData.business_type = userData.business_type;
      }

      if (userData.role === 'brand' && userData.brand_id) {
        profileData.brand_id = userData.brand_id;
      }

      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert(profileData);

      if (profileError) {
        console.error(`  ❌ Profile error: ${profileError.message}`);
        continue;
      }

      console.log(`  ✅ Created successfully`);
      console.log(`     Email: ${userData.email}`);
      console.log(`     Password: ${userData.password}`);
      console.log(`     Role: ${userData.role}\n`);

    } catch (err: any) {
      console.error(`  ❌ Unexpected error: ${err.message}\n`);
    }
  }

  console.log('✨ Test user seeding complete!\n');
  console.log('Login credentials:');
  console.log('─────────────────────────────────────────');
  console.log('Business User:');
  console.log('  Email: test-business@platform.dev');
  console.log('  Password: TestPass123!');
  console.log('  Redirect: /portal/dashboard\n');
  console.log('Brand User:');
  console.log('  Email: test-brand@platform.dev');
  console.log('  Password: TestPass123!');
  console.log('  Redirect: /brand/dashboard\n');
  console.log('Admin User:');
  console.log('  Email: test-admin@platform.dev');
  console.log('  Password: TestPass123!');
  console.log('  Redirect: /admin/inbox\n');
}

seedTestUsers().catch(console.error);
