# SOCELLE CMS — Architecture Specification

> Updated to align with `V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md` on 2026-03-08.
> Authority: `V3_BUILD_PLAN.md` → `V1SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md`
> WO: WO-CMS-01 (schema), WO-CMS-02 (client), WO-CMS-03 (hub UI), WO-CMS-04 (renderer)

---

## §1 — System Overview

SOCELLE CMS is an **internal headless CMS** built entirely on Supabase. It provides:

1. **Structured content storage** — `cms_*` tables with RLS
2. **Block-based page composition** — pages built from reusable blocks
3. **Space isolation** — each hub's content lives in a named space
4. **Admin UI** — full CRUD at `/admin/cms/*`
5. **Public rendering** — `PageRenderer` component reads CMS data and renders pages
6. **SEO-first** — every page has meta, OG, JSON-LD, canonical URL

### Why Internal (Not External)?

| Concern | External CMS (WordPress/Contentful) | SOCELLE Internal CMS |
|---------|--------------------------------------|---------------------|
| RLS | Not possible | Full Supabase RLS |
| Cost | $99-499/mo for headless CMS | $0 (Supabase tables) |
| Vendor lock-in | High | Zero |
| Intelligence integration | API bridge needed | Direct table joins |
| Auth | Separate auth system | Same Supabase Auth |
| Realtime | Webhook polling | Supabase Realtime |

---

## §2 — Table Architecture

### Entity Relationship

```
cms_spaces
  └── cms_pages (space_id FK)
        └── cms_page_blocks (page_id FK, block_id FK, position)
              └── cms_blocks (id)
  └── cms_posts (space_id FK, extends page concept)
  └── cms_docs (space_id FK)

cms_templates (standalone — referenced by cms_pages.template_id)
cms_assets (standalone — referenced by blocks/pages/posts via UUID)
```

### Table Definitions

#### `cms_spaces`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| name | TEXT NOT NULL | Human label ("Blog", "Education", "Intelligence") |
| slug | TEXT UNIQUE NOT NULL | URL-safe identifier |
| description | TEXT | |
| settings | JSONB DEFAULT '{}' | Space-specific config (default template, allowed block types) |
| created_at | TIMESTAMPTZ DEFAULT now() | |
| updated_at | TIMESTAMPTZ DEFAULT now() | |

#### `cms_pages`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| space_id | UUID FK → cms_spaces | |
| template_id | UUID FK → cms_templates NULL | |
| title | TEXT NOT NULL | |
| slug | TEXT NOT NULL | Unique within space |
| status | TEXT CHECK ('draft','published','archived') DEFAULT 'draft' | |
| published_at | TIMESTAMPTZ | Set when status → published |
| author_id | UUID FK → auth.users | |
| seo_title | TEXT | Override for <title> |
| seo_description | TEXT | Meta description |
| seo_og_image | TEXT | OG image URL |
| seo_canonical | TEXT | Canonical URL override |
| seo_schema_type | TEXT DEFAULT 'WebPage' | JSON-LD @type |
| metadata | JSONB DEFAULT '{}' | Extensible per-page data |
| created_at | TIMESTAMPTZ DEFAULT now() | |
| updated_at | TIMESTAMPTZ DEFAULT now() | |

Indexes:
- UNIQUE (space_id, slug)
- idx_cms_pages_status ON (status) WHERE status = 'published'
- idx_cms_pages_space_status ON (space_id, status)

#### `cms_blocks`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| type | TEXT NOT NULL | Block type identifier (see CMS_CONTENT_MODEL.md) |
| name | TEXT | Human label for reuse |
| content | JSONB NOT NULL DEFAULT '{}' | Block-type-specific structured data |
| is_reusable | BOOLEAN DEFAULT false | If true, appears in block library |
| created_by | UUID FK → auth.users | |
| created_at | TIMESTAMPTZ DEFAULT now() | |
| updated_at | TIMESTAMPTZ DEFAULT now() | |

Indexes:
- idx_cms_blocks_type ON (type)
- idx_cms_blocks_reusable ON (is_reusable) WHERE is_reusable = true

#### `cms_page_blocks`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| page_id | UUID FK → cms_pages ON DELETE CASCADE | |
| block_id | UUID FK → cms_blocks ON DELETE CASCADE | |
| position | INTEGER NOT NULL | Sort order (0-based) |
| overrides | JSONB DEFAULT '{}' | Per-placement overrides on reusable blocks |
| created_at | TIMESTAMPTZ DEFAULT now() | |

Indexes:
- UNIQUE (page_id, position)
- idx_cms_page_blocks_page ON (page_id)

#### `cms_posts`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| space_id | UUID FK → cms_spaces | |
| title | TEXT NOT NULL | |
| slug | TEXT NOT NULL | Unique within space |
| excerpt | TEXT | Short summary |
| body | TEXT | Markdown or structured content |
| hero_image | TEXT | Hero image URL |
| author_id | UUID FK → auth.users | |
| category | TEXT | |
| tags | TEXT[] DEFAULT '{}' | |
| status | TEXT CHECK ('draft','published','archived') DEFAULT 'draft' | |
| published_at | TIMESTAMPTZ | |
| reading_time | INTEGER | Estimated minutes |
| featured | BOOLEAN DEFAULT false | |
| seo_title | TEXT | |
| seo_description | TEXT | |
| seo_og_image | TEXT | |
| seo_canonical | TEXT | |
| source_type | TEXT | 'original', 'curated', 'ai_generated' |
| metadata | JSONB DEFAULT '{}' | |
| created_at | TIMESTAMPTZ DEFAULT now() | |
| updated_at | TIMESTAMPTZ DEFAULT now() | |

Indexes:
- UNIQUE (space_id, slug)
- idx_cms_posts_status ON (status) WHERE status = 'published'
- idx_cms_posts_category ON (category)
- idx_cms_posts_featured ON (featured) WHERE featured = true

#### `cms_assets`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| storage_path | TEXT NOT NULL | Supabase Storage path |
| filename | TEXT NOT NULL | Original filename |
| mime_type | TEXT NOT NULL | |
| size_bytes | INTEGER | |
| width | INTEGER | For images |
| height | INTEGER | For images |
| alt_text | TEXT | Accessibility |
| caption | TEXT | |
| uploaded_by | UUID FK → auth.users | |
| created_at | TIMESTAMPTZ DEFAULT now() | |

Indexes:
- idx_cms_assets_mime ON (mime_type)

#### `cms_docs`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| space_id | UUID FK → cms_spaces | |
| title | TEXT NOT NULL | |
| slug | TEXT NOT NULL | |
| body | TEXT | Markdown |
| category | TEXT | 'help', 'changelog', 'release_notes', 'internal' |
| status | TEXT CHECK ('draft','published','archived') DEFAULT 'draft' | |
| author_id | UUID FK → auth.users | |
| metadata | JSONB DEFAULT '{}' | |
| created_at | TIMESTAMPTZ DEFAULT now() | |
| updated_at | TIMESTAMPTZ DEFAULT now() | |

Indexes:
- UNIQUE (space_id, slug)

#### `cms_templates`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| name | TEXT NOT NULL | "Landing Page", "Article", "Hub Index" |
| slug | TEXT UNIQUE NOT NULL | |
| description | TEXT | |
| block_schema | JSONB NOT NULL DEFAULT '[]' | Ordered list of block type slots |
| seo_defaults | JSONB DEFAULT '{}' | Default SEO config for this template |
| preview_image | TEXT | Thumbnail |
| created_at | TIMESTAMPTZ DEFAULT now() | |
| updated_at | TIMESTAMPTZ DEFAULT now() | |

---

## §3 — RLS Policies

### Pattern: Admin Write, Public Read Published

```sql
-- cms_pages
ALTER TABLE cms_pages ENABLE ROW LEVEL SECURITY;

-- Admin: full access
CREATE POLICY "admin_all" ON cms_pages
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'platform_admin'))
  );

-- Public: read published only
CREATE POLICY "public_read_published" ON cms_pages
  FOR SELECT TO anon, authenticated
  USING (status = 'published');
```

Apply same pattern to: `cms_posts`, `cms_blocks` (via page join), `cms_assets`, `cms_docs` (authenticated read, not anon).

### cms_spaces
- Admin: full access
- Public: read all (spaces are metadata, not content)

### cms_templates
- Admin only: read/write
- No public access (templates are admin tooling)

### cms_page_blocks
- Admin: full access
- Public: read WHERE page status = 'published' (join through cms_pages)

---

## §4 — Client Architecture

### Hooks (TanStack Query v5)

All hooks follow established SOCELLE patterns:
- `useQuery` with `enabled: isSupabaseConfigured && !!requiredParam`
- `useMutation` with `queryClient.invalidateQueries` on success
- 42P01 graceful handling (table not found → empty data, `isLive: false`)
- `isLive` flag on all hooks

```
src/lib/cms/
  useCmsSpaces.ts      — CRUD for spaces (admin)
  useCmsPages.ts       — CRUD for pages, public read by slug
  useCmsBlocks.ts      — CRUD for blocks, block library
  useCmsPageBlocks.ts  — page-block junction management
  useCmsPosts.ts       — CRUD for posts, public read by slug/space
  useCmsAssets.ts      — upload/list/delete media
  useCmsDocs.ts        — CRUD for docs
  useCmsTemplates.ts   — CRUD for templates (admin)
  types.ts             — CMS type definitions
```

### PageRenderer Component

```
src/components/cms/PageRenderer.tsx
```

Responsibilities:
1. Accept `pageId` or `slug` + `spaceSlug`
2. Fetch page + page_blocks + blocks via single query (join)
3. Render blocks in position order using block type → React component map
4. Inject SEO via Helmet from page's `seo_*` fields
5. Handle loading/error/empty states with Pearl Mineral V2 styling

### Block Type → Component Map

```typescript
const BLOCK_COMPONENTS: Record<string, React.ComponentType<BlockProps>> = {
  hero: HeroBlock,
  text: TextBlock,
  cta: CtaBlock,
  image: ImageBlock,
  video: VideoBlock,
  faq: FaqBlock,
  testimonial: TestimonialBlock,
  stats: StatsBlock,
  split_feature: SplitFeatureBlock,
  evidence_strip: EvidenceStripBlock,
  embed: EmbedBlock,
  code: CodeBlock,
};
```

---

## §5 — Admin Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/admin/cms` | CmsDashboard | Overview: recent pages, posts, media stats |
| `/admin/cms/spaces` | CmsSpaces | Space list + CRUD |
| `/admin/cms/pages` | CmsPageList | Page list with space filter, status filter |
| `/admin/cms/pages/new` | CmsPageEditor | Create page |
| `/admin/cms/pages/:id` | CmsPageEditor | Edit page + block composer |
| `/admin/cms/posts` | CmsPostList | Post list with space/category filter |
| `/admin/cms/posts/new` | CmsPostEditor | Create post |
| `/admin/cms/posts/:id` | CmsPostEditor | Edit post |
| `/admin/cms/blocks` | CmsBlockLibrary | Reusable block library |
| `/admin/cms/media` | CmsMediaLibrary | Upload + browse media |
| `/admin/cms/templates` | CmsTemplateList | Template management |
| `/admin/cms/docs` | CmsDocList | Internal docs |

All admin routes protected by `ProtectedRoute` with admin role check.

---

## §6 — Public Routes

| Route | Source | Notes |
|-------|--------|-------|
| `/pages/:slug` | `cms_pages` WHERE space = 'general' | Generic CMS pages |
| `/blog` | `cms_posts` WHERE space = 'blog' | Blog index |
| `/blog/:slug` | `cms_posts` WHERE space = 'blog' | Blog detail |
| `/stories` | Existing — can migrate to CMS | Stories index |
| `/stories/:slug` | Existing — can migrate to CMS | Story detail |
| `/help/:slug` | `cms_docs` WHERE category = 'help' | Help articles |

Hub-specific content (intelligence briefs, education articles, etc.) renders within each hub's existing routes using `PageRenderer` or `PostRenderer` components embedded in the hub pages.

---

## §7 — Migration Strategy

### Existing Content → CMS

| Current Source | Target CMS Table | Migration Path |
|----------------|-----------------|----------------|
| `stories` table | `cms_posts` (space = "blog") | SQL migration: INSERT INTO cms_posts SELECT FROM stories |
| Hardcoded page content | `cms_pages` + `cms_blocks` | Manual: admin creates pages via UI |
| `rss_items` (curated) | `cms_posts` (space = "intelligence", source_type = "curated") | Edge function: promote RSS → CMS post |

### Backward Compatibility

- Existing `stories` routes continue working during migration
- `PageRenderer` is opt-in per route — no forced migration of existing pages
- CMS hooks gracefully handle missing tables (42P01 → empty data)

---

## §8 — Observability

- All CMS mutation errors logged and visible in Admin Hub system health dashboard
- `updated_at` trigger on all CMS tables (auto-update on row change)
- Admin dashboard shows: total pages, total posts, media storage used, last published
- Content freshness: `cms_posts` with `published_at` > 7 days flagged in admin

---

## §9 — Security Constraints

1. **No raw HTML storage.** Blocks use structured JSONB, not HTML strings.
2. **Media via Supabase Storage only.** No external CDN URLs in `cms_assets` (except existing Unsplash refs).
3. **RLS enforced.** No service-role key usage in client hooks.
4. **Author tracking.** Every page/post/block tracks `author_id` / `created_by`.
5. **No PII in CMS content.** CMS is for content, not user data.

---

*CMS Architecture v1.0 — 2026-03-08 — Governed by V3_BUILD_PLAN.md*
