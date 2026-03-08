import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../supabase';
import type { CmsAsset, CmsAssetInsert } from './types';

// ── useCmsAssets — WO-CMS-02: CMS assets hook ───────────────────────
// CRUD for cms_assets table + Supabase Storage upload.
// Public: read all. Admin: full CRUD + upload.

const QUERY_KEY = 'cms_assets';
const STORAGE_BUCKET = 'cms-media';

interface UseCmsAssetsOptions {
  mimeType?: string;
  limit?: number;
}

export function useCmsAssets(options: UseCmsAssetsOptions = {}) {
  const queryClient = useQueryClient();
  const { mimeType, limit } = options;

  const { data: assets = [], isLoading, error: queryError } = useQuery({
    queryKey: [QUERY_KEY, mimeType, limit],
    queryFn: async () => {
      let query = supabase.from('cms_assets').select('*');

      if (mimeType) query = query.ilike('mime_type', `${mimeType}%`);

      query = query.order('created_at', { ascending: false });

      if (limit) query = query.limit(limit);

      const { data, error } = await query;

      if (error) {
        if (error.code === '42P01') return [];
        throw new Error(error.message);
      }
      return (data ?? []) as CmsAsset[];
    },
    enabled: isSupabaseConfigured,
  });

  const isLive = assets.length > 0;
  const error = queryError instanceof Error ? queryError.message : null;

  const uploadAsset = useMutation({
    mutationFn: async (input: { file: File; altText?: string; caption?: string }) => {
      const { file, altText, caption } = input;
      const ext = file.name.split('.').pop() ?? '';
      const storagePath = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, file, { contentType: file.type });

      if (uploadError) throw new Error(uploadError.message);

      const record: CmsAssetInsert = {
        storage_path: storagePath,
        filename: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        alt_text: altText ?? null,
        caption: caption ?? null,
        uploaded_by: null,
      };

      const { data, error: insertError } = await supabase
        .from('cms_assets')
        .insert(record)
        .select()
        .single();

      if (insertError) throw new Error(insertError.message);
      return data as CmsAsset;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const deleteAsset = useMutation({
    mutationFn: async (asset: CmsAsset) => {
      await supabase.storage.from(STORAGE_BUCKET).remove([asset.storage_path]);

      const { error } = await supabase.from('cms_assets').delete().eq('id', asset.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  const updateAsset = useMutation({
    mutationFn: async ({ id, altText, caption }: { id: string; altText?: string; caption?: string }) => {
      const { data, error } = await supabase
        .from('cms_assets')
        .update({ alt_text: altText, caption })
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as CmsAsset;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });

  return { assets, isLive, isLoading, error, uploadAsset, deleteAsset, updateAsset };
}

export function getAssetPublicUrl(storagePath: string): string {
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}
