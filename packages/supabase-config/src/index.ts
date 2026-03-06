import { createClient } from '@supabase/supabase-js';

// ─── Environment validation ───────────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// ─── Shared client ────────────────────────────────────────────────────────────
// Supports both Next.js (NEXT_PUBLIC_*) and Vite (VITE_*) env variable prefixes
// so both apps can consume this package without modification.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Types re-export ──────────────────────────────────────────────────────────
export type { SupabaseClient } from '@supabase/supabase-js';
