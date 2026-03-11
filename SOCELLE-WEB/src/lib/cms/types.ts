// ── CMS Type Definitions — WO-CMS-02 ─────────────────────────────────
// Typed interfaces derived from database.types.ts cms_* tables.
// All hooks in this directory use these types.

import type { Json } from '../database.types';

// ── Status enum ──────────────────────────────────────────────────────
export type CmsStatus = 'draft' | 'published' | 'archived';

// ── Block types (per CMS_CONTENT_MODEL.md §2) ───────────────────────
export type CmsBlockType =
  | 'hero'
  | 'text'
  | 'cta'
  | 'image'
  | 'video'
  | 'faq'
  | 'testimonial'
  | 'stats'
  | 'split_feature'
  | 'evidence_strip'
  | 'embed'
  | 'code';

// ── Row types ────────────────────────────────────────────────────────

export interface CmsSpace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  settings: Json | null;
  created_at: string;
  updated_at: string;
}

export interface CmsPage {
  id: string;
  space_id: string;
  template_id: string | null;
  title: string;
  slug: string;
  status: CmsStatus;
  scheduled_at: string | null;
  seo_twitter_card: string | null;
  published_at: string | null;
  author_id: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_og_image: string | null;
  seo_canonical: string | null;
  seo_schema_type: string | null;
  metadata: Json | null;
  created_at: string;
  updated_at: string;
}

export interface CmsBlock {
  id: string;
  type: string;
  name: string | null;
  content: Json;
  is_reusable: boolean | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CmsPageBlock {
  id: string;
  page_id: string;
  block_id: string;
  position: number;
  overrides: Json | null;
  created_at: string;
}

export interface CmsPost {
  id: string;
  space_id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  hero_image: string | null;
  author_id: string | null;
  category: string | null;
  tags: string[] | null;
  status: CmsStatus;
  scheduled_at: string | null;
  seo_twitter_card: string | null;
  published_at: string | null;
  reading_time: number | null;
  featured: boolean | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_og_image: string | null;
  seo_canonical: string | null;
  source_type: string | null;
  metadata: Json | null;
  created_at: string;
  updated_at: string;
}

export type CmsUsageRights = 'owner' | 'editorial' | 'brand_supplied' | 'licensed';

export interface CmsAsset {
  id: string;
  storage_path: string;
  filename: string;
  mime_type: string;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  caption: string | null;
  tags: string[] | null;
  usage_rights: CmsUsageRights | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface CmsDoc {
  id: string;
  space_id: string;
  title: string;
  slug: string;
  body: string | null;
  category: string | null;
  status: CmsStatus;
  scheduled_at: string | null;
  seo_twitter_card: string | null;
  author_id: string | null;
  metadata: Json | null;
  created_at: string;
  updated_at: string;
}

export interface CmsTemplate {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  block_schema: Json;
  seo_defaults: Json | null;
  preview_image: string | null;
  created_at: string;
  updated_at: string;
}

// ── Composed types (for PageRenderer) ────────────────────────────────

export interface CmsPageWithBlocks extends CmsPage {
  page_blocks: (CmsPageBlock & { block: CmsBlock })[];
}

// ── Insert/Update types ──────────────────────────────────────────────

export type CmsPageInsert = Omit<CmsPage, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type CmsPageUpdate = Partial<Omit<CmsPage, 'id' | 'created_at' | 'updated_at'>>;

export type CmsPostInsert = Omit<CmsPost, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type CmsPostUpdate = Partial<Omit<CmsPost, 'id' | 'created_at' | 'updated_at'>>;

export type CmsBlockInsert = Omit<CmsBlock, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type CmsBlockUpdate = Partial<Omit<CmsBlock, 'id' | 'created_at' | 'updated_at'>>;

export type CmsDocInsert = Omit<CmsDoc, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type CmsDocUpdate = Partial<Omit<CmsDoc, 'id' | 'created_at' | 'updated_at'>>;

export type CmsAssetInsert = Omit<CmsAsset, 'id' | 'created_at'> & {
  id?: string;
};

export type CmsSpaceInsert = Omit<CmsSpace, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type CmsSpaceUpdate = Partial<Omit<CmsSpace, 'id' | 'created_at' | 'updated_at'>>;

export type CmsTemplateInsert = Omit<CmsTemplate, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type CmsTemplateUpdate = Partial<Omit<CmsTemplate, 'id' | 'created_at' | 'updated_at'>>;

export interface ContentPlacement {
  id: string;
  placement_key: string;
  cms_post_id: string;
  display_order: number;
  is_pinned: boolean;
  expires_at: string | null;
  segment: string[] | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type ContentPlacementInsert = Omit<ContentPlacement, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type ContentPlacementUpdate = Partial<Omit<ContentPlacement, 'id' | 'created_at' | 'updated_at'>>;
