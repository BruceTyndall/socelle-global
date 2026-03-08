import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from './supabase';

// ── useMediaLibrary — WO-OVERHAUL-03: Media library data hook ─────────
// Fetches assets from media_library table with optional type/search filters.
// Falls back gracefully when Supabase is unavailable.
// Migrated to TanStack Query v5 (V2-TECH-04).

export interface MediaAsset {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  alt_text: string | null;
  tags: string[] | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

interface UseMediaLibraryOptions {
  type?: string;
  search?: string;
}

interface UseMediaLibraryReturn {
  assets: MediaAsset[];
  loading: boolean;
  error: string | null;
}

export function useMediaLibrary(options?: UseMediaLibraryOptions): UseMediaLibraryReturn {
  const type = options?.type;
  const search = options?.search;

  const { data: assets = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ['media_library', { type, search }],
    queryFn: async () => {
      let query = supabase
        .from('media_library')
        .select('id, file_name, file_url, file_type, alt_text, tags, uploaded_by, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (type) query = query.eq('file_type', type);
      if (search) query = query.ilike('file_name', `%${search}%`);

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return (data ?? []) as MediaAsset[];
    },
    enabled: isSupabaseConfigured,
  });

  const error = queryError instanceof Error ? queryError.message : null;

  return { assets, loading, error };
}
