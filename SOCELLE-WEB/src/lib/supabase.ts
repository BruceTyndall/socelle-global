import { createClient } from '@supabase/supabase-js';

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const isSupabaseConfigured = !!(envUrl && envKey);
// When vars are missing, use placeholders so the app loads (UI-only); set VITE_SUPABASE_BYPASS=false to force config required
const bypass = import.meta.env.VITE_SUPABASE_BYPASS !== 'false' && !isSupabaseConfigured;

const supabaseUrl = envUrl || (bypass ? 'https://placeholder.supabase.co' : '');
const supabaseAnonKey = envKey || (bypass ? 'placeholder-anon-key' : '');

if (!isSupabaseConfigured && bypass) {
  console.warn('Supabase not configured: app running in UI-only mode. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for data.');
}

const unconfiguredProxy = new Proxy({} as ReturnType<typeof createClient>, {
  get(_, prop) {
    if (prop === 'auth') {
      return new Proxy({}, { get() { return () => Promise.resolve({ data: null, error: null }); } });
    }
    return () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } });
  }
});

export const supabase = (isSupabaseConfigured || bypass)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : unconfiguredProxy;
