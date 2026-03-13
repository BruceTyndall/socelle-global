import { createClient } from '@supabase/supabase-js';

const PROD_SUPABASE_URL = 'https://rumdmulxzmjtsplsjngi.supabase.co';
const PROD_SUPABASE_PROJECT_REF = 'rumdmulxzmjtsplsjngi';
const PROD_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1bWRtdWx4em1qdHNwbHNqbmdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMjI4NDksImV4cCI6MjA4Nzc5ODg0OX0.2ri_IjtYp3U3EuyvHp6iNZ69C9zyP-8WmKJlvFBJb_E';

function extractProjectRef(url: string | undefined): string | null {
  if (!url) return null;
  const match = url.match(/^https:\/\/([a-z0-9-]+)\.supabase\.co/i);
  return match?.[1] ?? null;
}

function decodeJwtPayload(token: string | undefined): Record<string, unknown> | null {
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isAnonKeyForProject(token: string | undefined, projectRef: string | null): boolean {
  if (!token || !projectRef) return false;
  const payload = decodeJwtPayload(token);
  return payload?.ref === projectRef && payload?.role === 'anon';
}

const envUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
const productionFallbackAllowed = import.meta.env.PROD;
const resolvedUrl = envUrl || (productionFallbackAllowed ? PROD_SUPABASE_URL : '');
const resolvedProjectRef = extractProjectRef(resolvedUrl);
const hasValidEnvKey = isAnonKeyForProject(envKey, resolvedProjectRef);
const useBundledProdAnonKey = productionFallbackAllowed && resolvedProjectRef === PROD_SUPABASE_PROJECT_REF;

const resolvedKey = useBundledProdAnonKey
  ? PROD_SUPABASE_ANON_KEY
  : hasValidEnvKey
    ? envKey!
    : '';

export const isSupabaseConfigured = !!(resolvedUrl && resolvedKey);
// When vars are missing, use placeholders so the app loads (UI-only); set VITE_SUPABASE_BYPASS=false to force config required
const bypass = import.meta.env.VITE_SUPABASE_BYPASS !== 'false' && !isSupabaseConfigured;

const supabaseUrl = resolvedUrl || (bypass ? 'https://placeholder.supabase.co' : '');
const supabaseAnonKey = resolvedKey || (bypass ? 'placeholder-anon-key' : '');

if (!isSupabaseConfigured && bypass) {
  console.warn('Supabase not configured: app running in UI-only mode. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for data.');
} else if (productionFallbackAllowed && !hasValidEnvKey && resolvedProjectRef === PROD_SUPABASE_PROJECT_REF) {
  console.warn('Supabase anon key env invalid for production project. Falling back to bundled public anon key.');
} else if (useBundledProdAnonKey) {
  console.warn('Using bundled public anon key for the production Socelle Supabase project.');
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
        detectSessionInUrl: true,
        // Use plain localStorage to avoid navigator.locks contention in React Strict Mode.
        // Double-invoked effects cause concurrent getSession() calls that steal the lock.
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        // Override the internal auth lock with a no-op so React Strict Mode double-invocations
        // don't steal each other's locks and cause AbortError cascades.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lock: (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => fn(),
      }
    })
  : unconfiguredProxy;
