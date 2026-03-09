import { useCmsPosts, useCmsPostBySlug } from './useCmsPosts';

// ── useBrandsContent — WO-CMS-06: Brands Hub integration ────────────
// Thin wrapper over useCmsPosts filtered to space='brands'.
// Returns brand enablement content (training kits, launch materials)
// from cms_posts for the Brands Hub.

const SPACE = 'brands';

interface UseBrandsContentOptions {
  category?: string;
  status?: string;
  featured?: boolean;
  limit?: number;
}

export function useBrandsContent(options: UseBrandsContentOptions = {}) {
  const result = useCmsPosts({ spaceSlug: SPACE, ...options });
  return {
    content: result.posts,
    isLive: result.isLive,
    isLoading: result.isLoading,
    error: result.error,
    createContent: result.createPost,
    updateContent: result.updatePost,
    deleteContent: result.deletePost,
  };
}

export function useBrandsContentBySlug(slug: string) {
  return useCmsPostBySlug(slug, SPACE);
}
