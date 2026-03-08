# SOCELLE CMS — Content Model Specification

> Updated to align with `V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` on 2026-03-08.
> Authority: `V3_BUILD_PLAN.md` → `CMS_ARCHITECTURE.md`
> Related: `MODULE_BOUNDARIES.md`, `GLOBAL_SITE_MAP.md`, `BRAND_SURFACE_INDEX.md`

---

## §1 — Content Types

### Spaces (Content Namespaces)

Spaces isolate content by hub. Each space has its own pages, posts, and docs.

| Space Slug | Hub Owner | Content Types Used | Public Routes |
|------------|-----------|-------------------|---------------|
| `blog` | Authoring Studio | posts | `/blog`, `/blog/:slug` |
| `intelligence` | Intelligence Hub | posts, pages | Embedded in `/intelligence` |
| `education` | Education Hub | posts, pages, docs | Embedded in `/education` |
| `marketing` | Marketing Hub | pages | Landing pages via `/pages/:slug` |
| `sales` | Sales Hub | docs | Internal only |
| `commerce` | Commerce Hub | pages, posts | `/pages/:slug` |
| `jobs` | Jobs Hub | posts | Embedded in `/jobs` |
| `crm` | CRM Hub | docs | Internal only |
| `help` | Admin Hub | docs | `/help/:slug` |
| `general` | Platform-wide | pages | `/pages/:slug` |

---

## §2 — Block Types

Blocks are the atomic content units. Each block has a `type` string and a `content` JSONB payload with a defined schema.

### Core Block Types

#### `hero`
Full-width hero section with headline, subheadline, CTA, and optional media.

```typescript
interface HeroBlockContent {
  headline: string;
  subheadline?: string;
  cta_text?: string;
  cta_url?: string;
  cta_style?: 'primary' | 'secondary' | 'ghost';
  media_type?: 'image' | 'video' | 'none';
  media_url?: string;
  media_alt?: string;
  layout?: 'center' | 'left' | 'split';
  overlay_opacity?: number; // 0-100
}
```

#### `text`
Rich text content block (Markdown or structured).

```typescript
interface TextBlockContent {
  body: string; // Markdown
  alignment?: 'left' | 'center' | 'right';
  max_width?: 'narrow' | 'medium' | 'full'; // maps to max-w-2xl / max-w-4xl / max-w-7xl
}
```

#### `cta`
Call-to-action block with button(s).

```typescript
interface CtaBlockContent {
  headline: string;
  description?: string;
  primary_text: string;
  primary_url: string;
  primary_style?: 'primary' | 'secondary';
  secondary_text?: string;
  secondary_url?: string;
  background?: 'light' | 'dark' | 'accent';
}
```

#### `image`
Single image with optional caption.

```typescript
interface ImageBlockContent {
  asset_id?: string; // FK to cms_assets
  url: string; // Direct URL (Supabase Storage or Unsplash)
  alt: string;
  caption?: string;
  width?: 'narrow' | 'medium' | 'full' | 'bleed';
  aspect_ratio?: '16:9' | '4:3' | '1:1' | 'auto';
}
```

#### `video`
Video embed block.

```typescript
interface VideoBlockContent {
  url: string; // Supabase Storage, YouTube, or Vimeo URL
  poster_url?: string;
  caption?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  width?: 'medium' | 'full';
}
```

#### `faq`
Accordion FAQ section.

```typescript
interface FaqBlockContent {
  heading?: string;
  items: Array<{
    question: string;
    answer: string; // Markdown
  }>;
  schema_markup?: boolean; // Emit FAQPage JSON-LD
}
```

#### `testimonial`
Customer/user testimonial.

```typescript
interface TestimonialBlockContent {
  quote: string;
  author_name: string;
  author_title?: string;
  author_company?: string;
  author_image?: string;
  rating?: number; // 1-5
}
```

#### `stats`
Key metrics strip (similar to EvidenceStrip).

```typescript
interface StatsBlockContent {
  items: Array<{
    label: string;
    value: string;
    suffix?: string; // "+", "%", etc.
    source?: string; // Data provenance
    is_live?: boolean;
  }>;
  layout?: 'horizontal' | 'grid';
}
```

#### `split_feature`
Two-column layout with media + text.

```typescript
interface SplitFeatureBlockContent {
  headline: string;
  body: string; // Markdown
  media_type: 'image' | 'video';
  media_url: string;
  media_alt?: string;
  media_position: 'left' | 'right';
  cta_text?: string;
  cta_url?: string;
}
```

#### `evidence_strip`
Horizontal scrolling evidence/proof strip.

```typescript
interface EvidenceStripBlockContent {
  items: Array<{
    icon?: string; // Lucide icon name
    label: string;
    value: string;
    is_live?: boolean;
  }>;
}
```

#### `embed`
External embed (iframe).

```typescript
interface EmbedBlockContent {
  url: string;
  title?: string;
  height?: number; // px
  allow_scripts?: boolean; // sandbox control
}
```

#### `code`
Code snippet with syntax highlighting.

```typescript
interface CodeBlockContent {
  code: string;
  language?: string;
  filename?: string;
  line_numbers?: boolean;
}
```

---

## §3 — Template Definitions

Templates define the block slot structure for a page. When an admin creates a page from a template, the template's `block_schema` pre-populates the page with empty block slots.

### Standard Templates

#### Landing Page
```json
{
  "name": "Landing Page",
  "slug": "landing-page",
  "block_schema": [
    { "type": "hero", "required": true, "label": "Hero Section" },
    { "type": "evidence_strip", "required": false, "label": "Social Proof" },
    { "type": "split_feature", "required": false, "label": "Feature 1", "repeat": true },
    { "type": "testimonial", "required": false, "label": "Testimonial" },
    { "type": "cta", "required": true, "label": "Call to Action" }
  ],
  "seo_defaults": {
    "schema_type": "WebPage"
  }
}
```

#### Article
```json
{
  "name": "Article",
  "slug": "article",
  "block_schema": [
    { "type": "hero", "required": true, "label": "Article Hero" },
    { "type": "text", "required": true, "label": "Article Body", "repeat": true },
    { "type": "image", "required": false, "label": "Inline Image", "repeat": true },
    { "type": "cta", "required": false, "label": "Related Content CTA" }
  ],
  "seo_defaults": {
    "schema_type": "Article"
  }
}
```

#### Hub Index
```json
{
  "name": "Hub Index",
  "slug": "hub-index",
  "block_schema": [
    { "type": "hero", "required": true, "label": "Hub Hero" },
    { "type": "stats", "required": false, "label": "Key Metrics" },
    { "type": "text", "required": false, "label": "Description" }
  ],
  "seo_defaults": {
    "schema_type": "CollectionPage"
  }
}
```

#### FAQ Page
```json
{
  "name": "FAQ Page",
  "slug": "faq-page",
  "block_schema": [
    { "type": "hero", "required": true, "label": "FAQ Hero" },
    { "type": "faq", "required": true, "label": "FAQ Section", "repeat": true }
  ],
  "seo_defaults": {
    "schema_type": "FAQPage"
  }
}
```

---

## §4 — Content Lifecycle

### Status Transitions

```
draft → published → archived
  ↑         ↓
  └── (unpublish) ←─┘ (restore)
```

| Transition | Who | Side Effects |
|-----------|-----|-------------|
| draft → published | Admin | Sets `published_at`, visible to public, sitemap updated |
| published → archived | Admin | Hidden from public, removed from sitemap |
| published → draft | Admin | "Unpublish" — hidden from public, `published_at` retained |
| archived → draft | Admin | "Restore" — returns to draft for re-editing |

### Versioning (Phase 5 — Authoring Studio)

Version history tracked via `cms_page_versions` table (future WO):
- Snapshot of `cms_page_blocks` + `cms_blocks.content` at publish time
- Rollback: restore previous version's blocks
- Diff view in admin (compare block content between versions)

---

## §5 — Media Model

### Supabase Storage Integration

```
Bucket: cms-media
  ├── images/
  │   ├── {uuid}.jpg
  │   └── {uuid}.webp
  ├── videos/
  │   └── {uuid}.mp4
  └── documents/
      └── {uuid}.pdf
```

### Upload Flow

1. Admin selects file in Media Library UI
2. Client uploads to Supabase Storage (`cms-media` bucket)
3. On success, create `cms_assets` row with storage_path, mime, dimensions
4. Asset `id` used in block content (e.g., `image.asset_id`)

### Image Processing (Deferred)

- Supabase Storage image transforms for thumbnails (when available on plan)
- WebP conversion on upload (future optimization)
- No external CDN until scale requires it

---

## §6 — Hub ↔ CMS Mapping

How each hub's existing data model connects to CMS content:

| Hub | Primary Data Table | CMS Content | Integration Point |
|-----|-------------------|-------------|-------------------|
| Intelligence | `market_signals` | Briefs, category descriptions | `cms_posts` (space="intelligence") embedded in Intelligence page |
| Jobs | `job_postings` | Career guides, market reports | `cms_posts` (space="jobs") linked from Jobs page |
| Brands | `brands` | Brand stories, buyer guides | `cms_posts` (space="commerce") on BrandStorefront |
| Education | `brand_training_modules` | Course intros, learning articles | `cms_posts` (space="education") on Education page |
| Marketing | `campaigns` | Landing pages, campaign content | `cms_pages` (space="marketing") as campaign destinations |
| Sales | N/A (future tables) | Playbooks, scripts, case studies | `cms_docs` (space="sales") internal only |
| Commerce | `products`, `orders` | Collection pages, buying guides | `cms_pages` (space="commerce") for curated collections |
| CRM | `contacts`, `companies` | Onboarding guides, help | `cms_docs` (space="crm") internal only |
| Admin | N/A | Platform help, changelogs | `cms_docs` (space="help") at `/help/:slug` |

---

## §7 — SEO Contract

Every CMS page/post MUST have:

| Field | Source | Fallback |
|-------|--------|----------|
| `<title>` | `seo_title` | `title` |
| `<meta description>` | `seo_description` | `excerpt` (posts) or first 160 chars of first text block |
| `og:title` | `seo_title` | `title` |
| `og:description` | `seo_description` | Same as meta description |
| `og:image` | `seo_og_image` | `hero_image` (posts) or first image block |
| `canonical` | `seo_canonical` | Current URL |
| JSON-LD `@type` | `seo_schema_type` or template default | `WebPage` |

### Sitemap Integration

Published CMS pages and posts automatically included in sitemap via `sitemap-generator` edge function:
- Query `cms_pages` WHERE status = 'published'
- Query `cms_posts` WHERE status = 'published'
- Use `updated_at` for `<lastmod>`

---

## §8 — Validation Rules

### Block Content Validation

- `hero.headline`: required, max 120 chars
- `text.body`: required, no empty strings
- `cta.primary_text`: required, max 40 chars
- `cta.primary_url`: required, valid URL or relative path
- `image.alt`: required (accessibility)
- `image.url`: required, valid URL
- `faq.items`: min 1 item, question + answer both required
- `stats.items`: min 1 item, label + value required

### Page Validation (before publish)

- Title: required, max 200 chars
- Slug: required, URL-safe, unique within space
- At least 1 block attached
- SEO description: recommended (warn if missing, don't block)

### Post Validation (before publish)

- Title: required
- Slug: required, unique within space
- Body or blocks: at least one must have content
- Category: recommended
- Excerpt: recommended

---

*CMS Content Model v1.0 — 2026-03-08 — Governed by CMS_ARCHITECTURE.md*
