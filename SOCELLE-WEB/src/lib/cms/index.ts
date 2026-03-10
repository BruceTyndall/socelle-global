// ── CMS Hooks — WO-CMS-02 ────────────────────────────────────────────
// Barrel export for all CMS hooks and types.

export * from './types';
export { useCmsSpaces, useCmsSpaceBySlug } from './useCmsSpaces';
export { useCmsPages, useCmsPageBySlug, useCmsPageWithBlocks } from './useCmsPages';
export { useCmsBlocks, useCmsBlock } from './useCmsBlocks';
export { useCmsPageBlocks } from './useCmsPageBlocks';
export { useCmsPosts, useCmsPostBySlug } from './useCmsPosts';
export { useCmsAssets, getAssetPublicUrl } from './useCmsAssets';
export { useCmsDocs, useCmsDocBySlug } from './useCmsDocs';
export { useCmsTemplates, useCmsTemplate } from './useCmsTemplates';

// ── Authoring Core — AUTH-CORE-05 ────────────────────────────────────
export { resolveBindings, resolveBindingsSync } from './DataBindingEngine';
export type { DataBinding, DataSource } from './DataBindingEngine';

// ── Hub Integration Hooks — WO-CMS-06 ────────────────────────────────
export { useIntelligencePosts, useIntelligenceBriefBySlug } from './useIntelligencePosts';
export { useEducationContent, useEducationArticleBySlug } from './useEducationContent';
export { useMarketingPages, useMarketingPageBySlug } from './useMarketingPages';
export { useSalesPlaybooks, useSalesPlaybookBySlug } from './useSalesPlaybooks';
export { useJobsContent, useJobsGuideBySlug } from './useJobsContent';
export { useBrandsContent, useBrandsContentBySlug } from './useBrandsContent';
