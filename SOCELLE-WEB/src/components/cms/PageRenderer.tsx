// ── PageRenderer — WO-CMS-04 ───────────────────────────────────────────
// Renders a CMS page by ID or slug. Fetches page + blocks, renders in
// position order, injects SEO via react-helmet-async.
// Only renders pages with status='published' (enforced by hooks + RLS).

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useCmsPageWithBlocks, useCmsPageBySlug } from '../../lib/cms';
import type { CmsPageWithBlocks } from '../../lib/cms/types';
import { BlockRenderer } from './BlockRenderer';

// ── Skeleton ────────────────────────────────────────────────────────────

const PageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-[#F6F3EF] animate-pulse">
    <div className="max-w-3xl mx-auto px-6 pt-20">
      <div className="h-10 bg-[#141418]/5 rounded-lg w-2/3 mb-4" />
      <div className="h-5 bg-[#141418]/5 rounded w-1/2 mb-8" />
      <div className="space-y-6">
        <div className="h-48 bg-[#141418]/5 rounded-lg" />
        <div className="h-32 bg-[#141418]/5 rounded-lg" />
        <div className="h-24 bg-[#141418]/5 rounded-lg" />
      </div>
    </div>
  </div>
);

// ── Error state ─────────────────────────────────────────────────────────

const PageError: React.FC<{ message: string }> = ({ message }) => (
  <div className="min-h-[50vh] flex items-center justify-center bg-[#F6F3EF]">
    <div className="max-w-md text-center px-6">
      <p className="text-[#8E6464] font-sans font-semibold text-lg mb-2">
        Unable to load page
      </p>
      <p className="text-[#141418]/60 font-sans text-sm">{message}</p>
    </div>
  </div>
);

// ── Empty state ─────────────────────────────────────────────────────────

const PageEmpty: React.FC = () => (
  <div className="min-h-[50vh] flex items-center justify-center bg-[#F6F3EF]">
    <div className="max-w-md text-center px-6">
      <p className="text-[#141418]/40 font-sans text-lg">
        This page has no content yet.
      </p>
    </div>
  </div>
);

// ── SEO Head ────────────────────────────────────────────────────────────

const PageSeo: React.FC<{ page: CmsPageWithBlocks }> = ({ page }) => (
  <Helmet>
    <title>{page.seo_title ?? page.title}</title>
    {page.seo_description && (
      <meta name="description" content={page.seo_description} />
    )}
    {page.seo_canonical && <link rel="canonical" href={page.seo_canonical} />}
    {/* Open Graph */}
    <meta property="og:title" content={page.seo_title ?? page.title} />
    {page.seo_description && (
      <meta property="og:description" content={page.seo_description} />
    )}
    {page.seo_og_image && (
      <meta property="og:image" content={page.seo_og_image} />
    )}
    {page.seo_schema_type && (
      <meta property="og:type" content={page.seo_schema_type} />
    )}
  </Helmet>
);

// ── Page body renderer ──────────────────────────────────────────────────

const PageBody: React.FC<{ page: CmsPageWithBlocks }> = ({ page }) => {
  const blocks = page.page_blocks ?? [];

  if (blocks.length === 0) return <PageEmpty />;

  return (
    <main className="min-h-screen bg-[#F6F3EF]">
      <PageSeo page={page} />
      {blocks.map((pb) => (
        <BlockRenderer
          key={pb.id}
          block={pb.block}
          pageBlock={pb}
        />
      ))}
    </main>
  );
};

// ── Inner: render by ID ─────────────────────────────────────────────────

const PageById: React.FC<{ pageId: string }> = ({ pageId }) => {
  const { page, isLoading, error } = useCmsPageWithBlocks(pageId);

  if (isLoading) return <PageSkeleton />;
  if (error) return <PageError message={error} />;
  if (!page) return <PageEmpty />;

  return <PageBody page={page} />;
};

// ── Inner: render by slug ───────────────────────────────────────────────

const PageBySlug: React.FC<{ slug: string; spaceSlug?: string }> = ({
  slug,
  spaceSlug,
}) => {
  const { page: pageMeta, isLoading: metaLoading, error: metaError } =
    useCmsPageBySlug(slug, spaceSlug);

  // Once we have the page metadata, fetch with blocks
  const {
    page: pageWithBlocks,
    isLoading: blocksLoading,
    error: blocksError,
  } = useCmsPageWithBlocks(pageMeta?.id ?? '');

  if (metaLoading || (pageMeta && blocksLoading)) return <PageSkeleton />;
  if (metaError) return <PageError message={metaError} />;
  if (blocksError) return <PageError message={blocksError} />;
  if (!pageMeta || !pageWithBlocks) return <PageEmpty />;

  return <PageBody page={pageWithBlocks} />;
};

// ── Public API ──────────────────────────────────────────────────────────

interface PageRendererProps {
  pageId?: string;
  slug?: string;
  spaceSlug?: string;
}

export const PageRenderer: React.FC<PageRendererProps> = ({
  pageId,
  slug,
  spaceSlug,
}) => {
  if (pageId) {
    return <PageById pageId={pageId} />;
  }

  if (slug) {
    return <PageBySlug slug={slug} spaceSlug={spaceSlug} />;
  }

  return <PageEmpty />;
};
