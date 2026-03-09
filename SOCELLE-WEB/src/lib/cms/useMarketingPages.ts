import { useCmsPages, useCmsPageBySlug } from './useCmsPages';

// ── useMarketingPages — WO-CMS-06: Marketing Hub integration ────────
// Thin wrapper over useCmsPages filtered to space='marketing'.
// Returns marketing landing pages from cms_pages for the Marketing Hub.

const SPACE = 'marketing';

interface UseMarketingPagesOptions {
  status?: string;
}

export function useMarketingPages(options: UseMarketingPagesOptions = {}) {
  const result = useCmsPages({ spaceSlug: SPACE, ...options });
  return {
    landingPages: result.pages,
    isLive: result.isLive,
    isLoading: result.isLoading,
    error: result.error,
    createLandingPage: result.createPage,
    updateLandingPage: result.updatePage,
    deleteLandingPage: result.deletePage,
  };
}

export function useMarketingPageBySlug(slug: string) {
  return useCmsPageBySlug(slug, SPACE);
}
