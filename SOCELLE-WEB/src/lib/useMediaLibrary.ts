import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

// ── useMediaLibrary — WO-OVERHAUL-03: Media library data hook ─────────
// Fetches assets from media_library table with optional type/search filters.
// Falls back gracefully when Supabase is unavailable.

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
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const type = options?.type;
  const search = options?.search;

  useEffect(() => {
    let cancelled = false;

    async function fetchAssets() {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        setAssets([]);
        setLoading(false);
        return;
      }

      try {
        let query = supabase
          .from('media_library')
          .select('id, file_name, file_url, file_type, alt_text, tags, uploaded_by, created_at, updated_at')
          .order('created_at', { ascending: false });

        if (type) {
          query = query.eq('file_type', type);
        }

        if (search) {
          query = query.ilike('file_name', `%${search}%`);
        }

        const { data, error: queryError } = await query;

        if (cancelled) return;

        if (queryError || !data) {
          setAssets([]);
          if (queryError) setError(queryError.message);
        } else {
          setAssets(data as MediaAsset[]);
        }
      } catch {
        if (!cancelled) {
          setAssets([]);
          setError('Failed to fetch media assets');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAssets();
    return () => { cancelled = true; };
  }, [type, search]);

  return { assets, loading, error };
}
