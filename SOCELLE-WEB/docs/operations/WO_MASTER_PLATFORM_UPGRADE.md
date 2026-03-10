# WO MASTER PLATFORM UPGRADE PACK
**Document ID:** WO-MASTER-PLATFORM-UPGRADE
**Issued:** 2026-03-10
**Authority:** Owner directive — Command Mode. Supersedes all prior regroup outputs.
**Execution Model:** Multi-lane parallel teams (Team 0–5). See §4.
**Tracker:** `SOCELLE-WEB/docs/build_tracker.md` is co-authoritative. Both must match.

---

## §1 — SCOPE + PRIMARY OBJECTIVES

### Primary Objective
Increase **DATA density**, **PRESS credibility**, and **value per session** on the Intelligence Hub.

Every WO in this pack either:
- Adds more live, sourced, vertically-classified signal data to the feed, OR
- Makes the editorial/CMS layer owner-controlled and WordPress-grade, OR
- Fixes journey dead-ends that prevent users from reaching value, OR
- Removes code debt that blocks the launch gate

### Secondary Objective
CMS becomes:
- **WordPress-grade**: posts, authors, revisions, editorial calendar, SEO meta, schema.org
- **API-wired**: auto-ingestion from feeds → story_drafts → approval → publish
- **Owner-merchandisable**: any placement on any page changed by owner without code deploy

### Out of Scope (this pack)
- New hub builds (covered by BUILD 4/5 separate WOs)
- Stripe dashboard configuration (owner prerequisite — blocks PAY-UPGRADE-WO only)
- Mobile/Tauri/PWA (BUILD 5 separate pack)
- Admin portal stub completion beyond what is required for CMS editorial flow

---

## §2 — NON-NEGOTIABLES

1. **No shells ship.** Every page touched must have error state, empty state, loading skeleton.
2. **No self-certification.** Agent that builds cannot write PASS. Verification skill must run.
3. **Proof pack required per WO.** `docs/qa/verify_<WO_ID>.json` with PASS/FAIL + evidence + commit SHA.
4. **Frozen paths — precise definition (PATCH 1).** The following are FROZEN and may NEVER be modified without explicit owner instruction:
   - `src/lib/auth.tsx` — AuthContext, NEVER MODIFY
   - `src/lib/useCart.ts` — cart state, NEVER MODIFY
   - Cart/checkout components: `CartDrawer`, `/portal/orders`, `/brand/orders`, checkout flows
   - Supabase migrations: ADD ONLY — never modify or delete existing migration files
   - `tailwind.config.js`: EXTEND ONLY — add tokens, do not remove or redefine existing Pearl Mineral V2 tokens
   - V2-TECH-01..07, V2-COMMAND-01..03, BUILD 0 Control Plane, BUILD 3 Growth: FROZEN — do not re-open
   - `/portal/*`, `/brand/*`, `/admin/*` are **NOT blanket frozen**. These routes may be touched ONLY when a WO in this pack explicitly names the file(s). If a WO does not name a file in these directories, that file is off-limits for that WO.
   - Authority source: `/.claude/CLAUDE.md §2`
5. **No raw useEffect + supabase.from() in new code.** TanStack Query v5 only.
6. **No banned terms in user-facing copy.** Run banned-term-scanner before marking any WO DONE.
7. **No invented WO IDs.** All IDs below are the canonical set. Do not create sub-IDs without owner approval.
8. **tsc=0 required** before marking any WO DONE.

---

## §2.1 — AUTHORITATIVE GATE DEFINITIONS (PATCH 2)

**Three gate tiers — no ambiguity:**

### LAUNCH GATE WOs (= P0 — hard blockers; nothing ships without these)
These WOs block all P1 work AND block production launch. They run in parallel where no dependency exists:

| WO ID | Why it's a launch gate |
|-------|----------------------|
| MERCH-INTEL-03-DB | Signal fingerprint integrity required for dedup correctness |
| NEWSAPI-INGEST-01 | >= 5 live API sources required before launch gate §16 item 10 |
| DB-TYPES-02 | tsc=0 impossible if database.types.ts is stale (§16 items 1+13) |

**Rule:** P1 work may not begin until ALL 3 P0 WOs have `overall: PASS` proof JSONs in `docs/qa/`.

### P1 WOs (start after P0 PASS — parallel lanes)
CMS lane (Team 2): CMS-SEED-01 → CMS-WO-07 → CMS-WO-08 → CMS-WO-09 → CMS-WO-10 → CMS-WO-11 → DATA-PRESS-PROOF
Routes lane (Team 3): EVT-WO-02, ROUTE-CLEANUP-WO, BRAND-SIGNAL-WO (all parallel)
Debt lane (Team 4): DEBT-TANSTACK-REAL-6, P1-3, STATE-AUDIT-01 (all parallel)
Feed lane (Team 1): MERCH-INTEL-03-FINAL (after MERCH-INTEL-03-DB)

### P2 WOs (start after P1 PASS)
Team 5: P2-1, P2-STRIPE (both parallel)
Team 3: PAY-UPGRADE-WO (after owner Stripe config)

### LAUNCH GATE CHECKLIST (§16 alignment)
Before production deploy, ALL 24 items in `/.claude/CLAUDE.md §16` must be GREEN. The proof packs from all WOs in this document are the evidence. Team 0 owns the launch gate review.

---

## §3 — DEPENDENCY GRAPH

```
P0 GATE (must be 100% PASS before P1 starts)
├── MERCH-INTEL-03-DB   ← no dependencies
├── NEWSAPI-INGEST-01   ← no dependencies (keys in hand)
└── DB-TYPES-02         ← depends on MERCH-INTEL-03-DB (new columns must be in types)

P1 GATE (starts when P0 PASS)
├── CMS-SEED-01         ← depends on DB-TYPES-02
├── CMS-WO-07           ← depends on CMS-SEED-01 (story_drafts references cms_posts)
├── CMS-WO-08           ← depends on CMS-WO-07
├── CMS-WO-09           ← depends on CMS-WO-08
├── CMS-WO-10           ← depends on CMS-WO-07 (placements reference cms_posts)
├── CMS-WO-11           ← depends on CMS-WO-07 + CMS-WO-10
├── DATA-PRESS-PROOF    ← depends on NEWSAPI-INGEST-01 + CMS-WO-07 (runs after pipeline has data)
├── EVT-WO-02           ← depends on P0 GATE only
├── ROUTE-CLEANUP-WO    ← depends on P0 GATE only
├── BRAND-SIGNAL-WO     ← depends on P0 GATE only
├── DEBT-TANSTACK-REAL-6 ← depends on P0 GATE only
├── MERCH-INTEL-03-FINAL ← depends on MERCH-INTEL-03-DB
├── P1-3                ← depends on P0 GATE only
└── STATE-AUDIT-01      ← depends on P0 GATE only

P2 GATE (starts when P1 PASS; PAY-UPGRADE-WO requires owner Stripe config)
├── P2-1                ← depends on P0 GATE only
├── P2-STRIPE           ← depends on P0 GATE only
└── PAY-UPGRADE-WO      ← depends on owner completing Stripe dashboard price config
```

---

## §4 — TEAM ASSIGNMENTS

| Team | Name | Owns | WO IDs |
|------|------|------|--------|
| **Team 0** | Command / QA Gatekeeping | build_tracker accuracy, proof pack validation, blocks any WO without proof | — (oversight) |
| **Team 1** | Data + Feeds + Press Ingestion | Feed pipeline, API wiring, signal quality | MERCH-INTEL-03-DB, NEWSAPI-INGEST-01, DB-TYPES-02, MERCH-INTEL-03-FINAL |
| **Team 2** | CMS + Editorial + Merchandising | CMS build, editorial pipeline, placements | CMS-SEED-01, CMS-WO-07, CMS-WO-08, CMS-WO-09, CMS-WO-10, CMS-WO-11, DATA-PRESS-PROOF |
| **Team 3** | Routes + Journey Dead-Ends | User journey completion, route hygiene | EVT-WO-02, ROUTE-CLEANUP-WO, BRAND-SIGNAL-WO, PAY-UPGRADE-WO |
| **Team 4** | Code Debt + State Completion | TanStack migration, token cleanup, state coverage | DEBT-TANSTACK-REAL-6, P1-3, STATE-AUDIT-01 |
| **Team 5** | Testing / CI | Test infrastructure, webhook audit | P2-1, P2-STRIPE |

**Rule:** No team may touch files outside its assigned WO scope. Cross-team file conflicts must be escalated to Team 0.

---

## §5 — WO DEFINITIONS

---

### WO: MERCH-INTEL-03-DB
**Team:** 1 — Data + Feeds
**Priority:** P0
**Depends on:** none
**Gates:** NEWSAPI-INGEST-01 (recommended after), DB-TYPES-02 (hard gate)

**Owner goal / KPI**
Migration 000027 was written but not applied due to Supabase MCP permission error. Applying it:
- Removes duplicate FDA MDR signals (MERCH-07 dedup)
- Boosts impact_score on safety/regulatory signals (MERCH-05)
- Adds display_order column to data_feeds for admin ordering (MERCH-11)
- Backfills fingerprint on all signals without one

**Exact requirements**
- Apply migration `supabase/migrations/20260313000027_merch_intel_03_dedup_and_quality.sql` to remote DB
- Confirm: `SELECT COUNT(*) FROM market_signals WHERE fingerprint IS NULL` returns 0
- Confirm: `SELECT COUNT(*) FROM data_feeds WHERE display_order IS NULL` returns 0
- Confirm: duplicate FDA MDR signals removed (count before vs after; owner approved deletion)
- Confirm: regulatory_alert signals have impact_score ≥ 0.8 after UPDATE

**Files / areas touched**
- `supabase/migrations/20260313000027_merch_intel_03_dedup_and_quality.sql` (apply only, do not modify)

**DB objects**
- `market_signals`: fingerprint backfill, impact_score UPDATE on regulatory_alert rows
- `data_feeds`: ADD COLUMN display_order INT, UPDATE with ordered values

**Acceptance tests**
```sql
-- All signals have fingerprint
SELECT COUNT(*) FROM market_signals WHERE fingerprint IS NULL;
-- Expected: 0

-- display_order populated
SELECT COUNT(*) FROM data_feeds WHERE display_order IS NULL;
-- Expected: 0

-- Safety signals boosted
SELECT COUNT(*) FROM market_signals WHERE signal_type='regulatory_alert' AND impact_score >= 0.8;
-- Expected: > 0
```

**Proof pack**
- File: `docs/qa/verify_MERCH-INTEL-03-DB.json`
- Required fields: wo_id, timestamp, sql_results (all 3 queries), row_counts_before_after, overall: PASS|FAIL

**Stop conditions**
- Migration fails with constraint violation → diagnose, do not retry blindly, escalate to Team 0
- DELETE step on FDA MDR dupes: only execute if owner previously approved (confirmed in session notes)

---

### WO: NEWSAPI-INGEST-01
**Team:** 1 — Data + Feeds
**Priority:** P0
**Depends on:** none (keys confirmed by owner)
**Gates:** DATA-PRESS-PROOF (hard gate)

**Owner goal / KPI**
Wire all 5 confirmed API credentials into the feed pipeline. Run first live ingest. Intelligence Hub shows press-sourced signals from multiple source layers. Reddit provides practitioner/operator voice layer unique to Socelle.

**Exact requirements**
1. Set Supabase secrets for all 5 keys:
   - `GNEWS_KEY` — GNews API
   - `CURRENTS_KEY` — Currents API
   - `REDDIT_CLIENT_ID` + `REDDIT_CLIENT_SECRET` — Reddit OAuth2
   - `NEWSAPI_KEY` — already set; confirm still active
2. Insert data_feeds rows for:
   - GNews — Beauty & Wellness (api, enabled, GNEWS_KEY, 720min, vertical=all, tier_min=free, provenance=3)
   - Currents — Beauty & Aesthetics (api, enabled, CURRENTS_KEY, 720min, vertical=all, tier_min=free, provenance=3)
   - Reddit — r/estheticians (api, enabled, REDDIT_CLIENT_ID, 360min, vertical=medspa, tier_min=free, provenance=2)
   - Reddit — r/MedSpa (api, enabled, REDDIT_CLIENT_ID, 360min, vertical=medspa, tier_min=free, provenance=2)
   - Reddit — r/SkinCare (api, enabled, REDDIT_CLIENT_ID, 480min, vertical=beauty_brand, tier_min=free, provenance=3)
3. Extend `feed-orchestrator` to handle:
   - **GNews format**: `GET https://gnews.io/api/v4/search?q=beauty+aesthetics+medspa&token={GNEWS_KEY}&lang=en&max=10` → `json.articles[].{title, description, url, publishedAt, source.name}`
   - **Currents format**: `GET https://api.currentsapi.services/v1/search?keywords=beauty+aesthetics+skincare&apiKey={CURRENTS_KEY}` → `json.news[].{title, description, url, published, author}`
   - **Reddit OAuth2**: POST token → GET `https://oauth.reddit.com/r/{subreddit}/hot.json?limit=25` → `json.data.children[].data.{title, selftext, url, created_utc, score, subreddit}`
   - Reddit signals: topic=community_signal, category=practitioner_voice, impact_score derived from score/upvote_ratio
4. Run feed-orchestrator against all enabled feeds (invoke via Supabase edge function invocation or manual trigger)
5. Confirm signals ingested: count by source/category before vs after
6. Confirm source_domain populated on all new signals
7. Confirm thumbnail_url populated where available (NewsAPI/GNews return image URLs)

**Files / areas touched**
- `supabase/functions/feed-orchestrator/index.ts` — add GNews/Currents/Reddit API handlers
- `supabase/migrations/20260313000031_api_feeds_gnews_currents_reddit.sql` — new data_feeds rows

**DB objects**
- `data_feeds`: 5 new rows (GNews, Currents, Reddit ×3)
- `market_signals`: new rows from ingest
- `feed_run_log`: new run records

**Acceptance tests**
```sql
-- New feeds present
SELECT name, feed_type, is_enabled FROM data_feeds
WHERE name ILIKE ANY(ARRAY['%GNews%','%Currents%','%Reddit%']);
-- Expected: 5 rows, all is_enabled=true

-- Signals ingested from new sources
SELECT source_name, COUNT(*) FROM market_signals
WHERE source_name ILIKE ANY(ARRAY['%GNews%','%Currents%','%Reddit%','%r/%'])
GROUP BY source_name;
-- Expected: rows with count > 0 per source

-- source_domain populated
SELECT COUNT(*) FROM market_signals WHERE source_domain IS NULL AND created_at > NOW() - INTERVAL '1 hour';
-- Expected: 0 (all new signals have source_domain)
```

**Proof pack**
- File: `docs/qa/verify_NEWSAPI-INGEST-01.json`
- Required: wo_id, timestamp, feeds_added, signals_before, signals_after, signals_by_source, reddit_oauth_status, overall: PASS|FAIL

**Stop conditions**
- Reddit OAuth2 fails → log to feed_dlq, mark feed health_status=degraded, do not block other feeds
- GNews/Currents returns 429 rate limit → set poll_interval_minutes=1440, log, continue
- Zero signals ingested from any single API after 3 attempts → escalate to Team 0

---

### WO: DB-TYPES-02
**Team:** 1 — Data + Feeds
**Priority:** P0
**Depends on:** MERCH-INTEL-03-DB (new columns must exist before regen)

**Owner goal / KPI**
`database.types.ts` reflects live DB schema including all columns from MERCH-INTEL-03-DB and NEWSAPI-INGEST-01 migrations. tsc=0.

**Exact requirements**
- Run `supabase gen types typescript --project-id rumdmulxzmjtsplsjngi > src/lib/database.types.ts`
- Run `npx tsc --noEmit` — must return exit 0
- Confirm new columns present in generated types: `display_order` on data_feeds, `fingerprint` on market_signals, `thumbnail_url`, `source_domain`, `image_url`, `why_it_matters` on market_signals

**Files / areas touched**
- `SOCELLE-WEB/src/lib/database.types.ts` (regenerated, not manually edited)

**DB objects:** read-only (gen types)

**Acceptance tests**
```bash
grep "display_order" src/lib/database.types.ts   # expected: found
grep "thumbnail_url" src/lib/database.types.ts   # expected: found
grep "source_domain" src/lib/database.types.ts   # expected: found
npx tsc --noEmit                                  # expected: exit 0
```

**Proof pack**
- File: `docs/qa/verify_DB-TYPES-02.json`
- Required: column_checks (all 4 columns found: true/false), tsc_exit_code: 0, overall: PASS|FAIL

**Stop conditions**
- tsc errors after regen → fix type errors before marking DONE (do not suppress)

---

### WO: CMS-SEED-01
**Team:** 2 — CMS + Editorial
**Priority:** P1
**Depends on:** DB-TYPES-02

**Owner goal / KPI**
`/intelligence` editorial rail shows LIVE content from cms_posts. Currently 0 rows → DEMO fallback. Seed 6 published editorial posts from top market_signals data. This proves the editorial pipeline works end-to-end before CMS-WO-07 builds automation.

**Exact requirements**
- Insert exactly 6 rows into `cms_posts` with:
  - `status='published'`
  - `source_type='automated'`
  - `published_at` = NOW() or recent timestamp
  - `category` = one of: medspa, salon, beauty_brand, regulatory, clinical, market_intelligence
  - `title` — intelligence-first headline (no banned terms)
  - `excerpt` — 1-2 sentence intelligence summary
  - `hero_image` — set to NULL (editorial rail uses fallback brand photos when null)
  - `slug` — URL-safe, unique
  - `featured` = true on at least 2 rows
  - `metadata` = `{"author_name": "Socelle Intelligence", "related_signal_ids": ["<actual signal UUID>"]}`
  - Related signal IDs must be real UUIDs from market_signals (SELECT id FROM market_signals LIMIT 10)
- After insert: verify `useStories({ limit: 6 })` returns 6 stories (EditorialScroll on /intelligence shows LIVE content)

**Files / areas touched**
- `supabase/migrations/20260313000032_seed_editorial_stories.sql` — INSERT statements only

**DB objects**
- `cms_posts`: 6 new rows

**Acceptance tests**
```sql
SELECT COUNT(*) FROM cms_posts WHERE status='published';
-- Expected: >= 6

SELECT COUNT(*) FROM cms_posts WHERE status='published' AND featured=true;
-- Expected: >= 2

SELECT COUNT(*) FROM cms_posts WHERE status='published' AND slug IS NOT NULL AND slug != '';
-- Expected: = total published count (all have slugs)
```
- Visual: load `/intelligence` in browser → EditorialScroll section shows story titles (not DEMO fallback text)

**Proof pack**
- File: `docs/qa/verify_CMS-SEED-01.json`
- Required: rows_inserted, featured_count, slugs_valid, editorial_rail_live: true/false, overall: PASS|FAIL

**Stop conditions**
- Duplicate slug constraint violation → fix slug, do not suppress
- related_signal_ids contain invalid UUIDs → look up real UUIDs first

---

### WO: CMS-WO-07
**Team:** 2 — CMS + Editorial
**Priority:** P1
**Depends on:** CMS-SEED-01

**Owner goal / KPI**
Auto-ingest pipeline creates editorial drafts from feed signals — owner reviews, not raw AI auto-publish. feed-orchestrator writes to `story_drafts` (not directly to cms_posts). Editorial rail stays LIVE from cms_posts while draft pipeline fills for review.

**Exact requirements**
1. Create `story_drafts` table:
   ```sql
   CREATE TABLE story_drafts (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     feed_id UUID REFERENCES data_feeds(id),
     source_signal_id UUID REFERENCES market_signals(id),
     raw_title TEXT NOT NULL,
     raw_excerpt TEXT,
     raw_url TEXT NOT NULL,
     raw_published_at TIMESTAMPTZ,
     source_citation TEXT NOT NULL,  -- NOT NULL: every draft must cite its source
     ai_headline TEXT,               -- rewritten on-brand headline (optional)
     ai_summary TEXT,                -- 2-3 sentence summary
     ai_key_takeaways TEXT[],        -- up to 5 bullet points
     suggested_ctas TEXT[],          -- suggested CTAs for editorial rail
     status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','approved','rejected','published')),
     duplicate_of UUID REFERENCES story_drafts(id),  -- NULL = not a duplicate
     auto_classified_vertical TEXT,
     auto_classified_topic TEXT,
     auto_classified_category TEXT,
     reviewer_id UUID REFERENCES auth.users(id),
     reviewer_notes TEXT,
     reviewed_at TIMESTAMPTZ,
     promoted_to_cms_post_id UUID REFERENCES cms_posts(id),
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );
   ```
2. RLS: platform_admin can SELECT/INSERT/UPDATE/DELETE. No public access.
3. Duplicate detection: on INSERT, check if raw_url already exists in story_drafts or cms_posts. If match, set duplicate_of and status='rejected'.
4. Extend `rss-to-signals` (or a new `stories-ingestor` edge function) to:
   - For each processed rss_item or api article: create a story_drafts row alongside the market_signals row
   - Populate: feed_id, source_signal_id, raw_title, raw_url, raw_published_at, source_citation (= feed attribution_label + url)
   - Dedup check on raw_url before INSERT
5. Admin UI stub: `StoryDraftsList.tsx` at `/admin/cms/story-drafts` — list view only (detail view in CMS-WO-08). TanStack Query from story_drafts. Shows: title, status badge, source_citation, created_at, duplicate_of indicator. Skeleton/error/empty states.
6. Route: add `/admin/cms/story-drafts` to App.tsx

**Files / areas touched**
- `supabase/migrations/20260313000033_story_drafts_table.sql`
- `supabase/functions/rss-to-signals/index.ts` (add story_drafts write path)
- `src/pages/admin/cms/StoryDraftsList.tsx` (new)
- `src/App.tsx` (new route)

**DB objects**
- `story_drafts`: new table + RLS
- `rss-to-signals`: v13 (story_drafts write path)

**Acceptance tests**
```sql
-- Table exists with correct structure
SELECT column_name FROM information_schema.columns
WHERE table_name='story_drafts' ORDER BY ordinal_position;
-- Expected: all columns above present

-- RLS enabled
SELECT relrowsecurity FROM pg_class WHERE relname='story_drafts';
-- Expected: true

-- After running feed-orchestrator: drafts created
SELECT COUNT(*) FROM story_drafts WHERE status='draft';
-- Expected: > 0
```

**Proof pack**
- File: `docs/qa/verify_CMS-WO-07.json`
- Required: table_created, rls_enabled, columns_verified, story_drafts_count_after_ingest, duplicate_detection_test: PASS|FAIL, overall: PASS|FAIL

**Stop conditions**
- source_citation is empty on any INSERT → block at DB level (NOT NULL constraint enforces)
- Story draft duplicates cms_posts slug → set duplicate_of and status=rejected, do not insert to cms_posts

---

### WO: CMS-WO-08
**Team:** 2 — CMS + Editorial
**Priority:** P1
**Depends on:** CMS-WO-07

**Owner goal / KPI**
Owner can open any story draft, edit headline/summary/key takeaways, add reviewer notes, see raw source vs AI rewrite diff, and approve → publish (writes to cms_posts) or reject. Source citation required and non-editable. Full state machine enforced.

**Exact requirements**
1. `StoryDraftDetail.tsx` at `/admin/cms/story-drafts/:id`:
   - Side-by-side: raw source title vs ai_headline (editable input)
   - ai_summary (editable textarea)
   - ai_key_takeaways (editable list, add/remove)
   - source_citation (read-only, cannot be edited — displayed prominently)
   - reviewer_notes (textarea)
   - Status actions: Approve (→ status='approved'), Reject (→ status='rejected' + reviewer_notes required), Request Review (→ status='review')
   - Duplicate indicator: if duplicate_of is set, show link to original
2. Promote to publish: when status=approved, "Publish" button:
   - Creates cms_posts row from draft fields (title=ai_headline or raw_title, excerpt=ai_summary, source_type='automated', status='published', metadata includes source_citation + related_signal_ids)
   - Sets story_drafts.promoted_to_cms_post_id = new post ID
   - Sets story_drafts.status = 'published'
   - Triggers cms_versions INSERT (version history per CMS-WO-09)
3. All state transitions write to cms_versions for audit trail
4. TanStack Query: useQuery to fetch draft, useMutation for state transitions
5. Skeleton/error/empty states on all async
6. Route `/admin/cms/story-drafts/:id` added to App.tsx

**Files / areas touched**
- `src/pages/admin/cms/StoryDraftDetail.tsx` (new)
- `src/pages/admin/cms/StoryDraftsList.tsx` (add link to detail)
- `src/App.tsx` (new route)
- `src/lib/cms/useStoryDrafts.ts` (new hook: useStoryDraft, useUpdateStoryDraft, usePromoteStoryDraft)

**DB objects**
- `story_drafts`: state machine transitions
- `cms_posts`: INSERT on promote
- `cms_versions`: INSERT on every state change

**Acceptance tests**
- Approve → publish: story_drafts.status='published', cms_posts row created, promoted_to_cms_post_id set
- Reject without notes: blocked (reviewer_notes required)
- source_citation: non-editable field present in UI, passes through to cms_posts metadata
- tsc=0

**Proof pack**
- File: `docs/qa/verify_CMS-WO-08.json`
- Required: state_machine_tests (approve/reject/publish all tested), source_citation_readonly: true, tsc_exit: 0, overall: PASS|FAIL

**Stop conditions**
- Publish without source_citation → STOP, block at application level before DB write

---

### WO: CMS-WO-09
**Team:** 2 — CMS + Editorial
**Priority:** P1
**Depends on:** CMS-WO-08

**Owner goal / KPI**
Blog/editorial posts have WordPress-grade SEO, OG/Twitter cards, schema.org Article markup, editorial calendar view, and newsletter-ready HTML export. Owner can schedule posts.

**Exact requirements**
1. **Blog post page SEO** (`/blog/:slug` or `/intelligence/story/:slug`):
   - Helmet: `og:title`, `og:description`, `og:image` (from seo_og_image or hero_image), `twitter:card=summary_large_image`, `og:type=article`, `article:published_time`, `article:author`
   - JSON-LD: schema.org `Article` or `BlogPosting` with `headline`, `datePublished`, `author.name`, `publisher.name`, `image`
   - Canonical link tag
2. **Scheduled publishing**: add `scheduled_at TIMESTAMPTZ` to cms_posts. pg_cron job: every 15 minutes, UPDATE cms_posts SET status='published' WHERE status='draft' AND scheduled_at <= NOW().
3. **Editorial Calendar**: `EditorialCalendar.tsx` at `/admin/cms/calendar` — monthly grid. Each day shows posts published/scheduled. Click post → opens StoryDraftDetail or CmsPostDetail. TanStack Query. Skeleton/error/empty.
4. **Newsletter export**: in CmsPostDetail, "Export Newsletter HTML" button — generates clean HTML (title + excerpt + body with inline styles, no Tailwind) downloadable as .html file. Client-side only (no edge function needed).
5. **Auto-sitemap update**: DB trigger on cms_posts INSERT/UPDATE WHERE status='published' → updates a `sitemap_cache` table row (or appends to existing JSON). Sitemap served by existing /sitemap.xml route reads from this table.

**Files / areas touched**
- Blog post page component (existing or new at `/src/pages/public/BlogPostPage.tsx`)
- `src/pages/admin/cms/EditorialCalendar.tsx` (new)
- `supabase/migrations/20260313000034_cms_scheduled_publishing.sql` (scheduled_at column + pg_cron + sitemap_cache)
- `src/App.tsx` (new route /admin/cms/calendar)

**DB objects**
- `cms_posts`: ADD COLUMN scheduled_at
- `sitemap_cache`: new table (id, slug, title, published_at, updated_at)
- pg_cron: `SELECT cron.schedule('publish-scheduled-posts', '*/15 * * * *', $$UPDATE cms_posts SET status=''published'' WHERE status=''draft'' AND scheduled_at <= NOW()$$)`

**Acceptance tests**
- `/blog/:slug` page: `<meta property="og:title">` present, JSON-LD with @type=Article present
- scheduled_at column exists on cms_posts
- Editorial calendar route loads, shows current month grid
- Newsletter export produces downloadable HTML with title + body

**Proof pack**
- File: `docs/qa/verify_CMS-WO-09.json`
- Required: seo_tags_verified, jsonld_present, calendar_route_live, newsletter_export_works, sitemap_cache_populated, overall: PASS|FAIL

**Stop conditions**
- JSON-LD contains incorrect @type or missing required fields → fix before marking DONE
- pg_cron extension not available → use alternative scheduling; escalate to Team 0

---

### WO: CMS-WO-10
**Team:** 2 — CMS + Editorial
**Priority:** P1
**Depends on:** CMS-WO-07 (references cms_posts)

**Owner goal / KPI**
Owner can change what appears on any page (Home, Intelligence Hub, category rails, featured slot) without code changes. A `content_placements` table is the source of truth for all editorial merchandising slots.

**Exact requirements**
1. Create `content_placements` table:
   ```sql
   CREATE TABLE content_placements (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     placement_key TEXT NOT NULL,  -- e.g. 'intel_hub_editorial_rail', 'home_featured', 'category_medspa_hero'
     cms_post_id UUID REFERENCES cms_posts(id) ON DELETE CASCADE,
     display_order INT NOT NULL DEFAULT 0,
     is_pinned BOOLEAN NOT NULL DEFAULT false,
     expires_at TIMESTAMPTZ,        -- NULL = no expiry
     segment TEXT[],                -- NULL = all users; ['medspa'] = medspa users only
     is_active BOOLEAN NOT NULL DEFAULT true,
     created_by UUID REFERENCES auth.users(id),
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     UNIQUE(placement_key, cms_post_id)
   );
   ```
2. RLS: platform_admin SELECT/INSERT/UPDATE/DELETE. Authenticated users SELECT WHERE is_active=true AND (expires_at IS NULL OR expires_at > NOW()).
3. Define canonical placement_keys (constants in code):
   - `intel_hub_editorial_rail` — editorial scroll on /intelligence
   - `home_featured` — featured content on / (Home)
   - `category_medspa_hero`, `category_salon_hero`, `category_beauty_brand_hero` — per-category featured
   - `daily_brief_slot` — daily brief featured position
4. **Merchandising Console** at `/admin/cms/placements`:
   - Group by placement_key
   - Drag/drop reorder within each group (updates display_order via mutation)
   - Pin/unpin toggle (is_pinned)
   - Expiration date picker (expires_at)
   - Segment selector (multi-select: medspa, salon, beauty_brand, free, pro)
   - Remove from placement (DELETE)
   - Add post to placement (search cms_posts by title → INSERT)
   - TanStack Query. Skeleton/error/empty states.
5. Wire Editorial Scroll on `/intelligence` to read from `content_placements WHERE placement_key='intel_hub_editorial_rail'` (falling back to useStories if no placements set).

**Files / areas touched**
- `supabase/migrations/20260313000035_content_placements.sql`
- `src/pages/admin/cms/MerchandisingConsole.tsx` (new)
- `src/lib/cms/useContentPlacements.ts` (new hook)
- `src/pages/public/Intelligence.tsx` (wire editorial scroll to placements)
- `src/App.tsx` (new route /admin/cms/placements)

**DB objects**
- `content_placements`: new table + RLS

**Acceptance tests**
```sql
SELECT COUNT(*) FROM content_placements;
-- Expected: >= 1 (seeded with intel_hub_editorial_rail placements from CMS-SEED-01 posts)

SELECT segment FROM content_placements WHERE placement_key='intel_hub_editorial_rail';
-- Expected: rows with segment data or NULL
```
- /intelligence editorial rail: if placements exist → shows placement order; if none → falls back to useStories

**Proof pack**
- File: `docs/qa/verify_CMS-WO-10.json`
- Required: table_created, rls_verified, placement_keys_defined, console_route_live, editorial_rail_reads_placements: true, overall: PASS|FAIL

**Stop conditions**
- Drag/drop reorder fails to persist → fix mutation before marking DONE
- Editorial rail reverts to DEMO when placements exist → STOP, debug useContentPlacements

---

### WO: CMS-WO-11
**Team:** 2 — CMS + Editorial
**Priority:** P1
**Depends on:** CMS-WO-07, CMS-WO-10

**Owner goal / KPI**
Intelligence Hub generates a Daily Brief post every morning and a Weekly Market Memo every Monday. Both land in story_drafts for owner review (not auto-published). Owner approves → published to editorial rail.

**Exact requirements**
1. Edge function `daily-brief`:
   - Queries `SELECT * FROM market_signals WHERE created_at > NOW() - INTERVAL '24 hours' AND status='active' ORDER BY impact_score DESC LIMIT 5`
   - Generates title: "Intelligence Brief — [Date]"
   - Generates excerpt: category distribution summary (e.g. "5 signals: 3 medspa, 1 clinical, 1 regulatory")
   - Generates body: structured HTML list of top 5 signals with source + confidence + timeAgo
   - Inserts to story_drafts (status='draft', source_citation='Socelle Intelligence Feed', auto_classified_category='daily-brief')
   - Inserts corresponding market_signals row (signal_type='editorial', category='daily-brief')
2. Edge function `weekly-memo`:
   - Same pattern but last 7 days, top 10 signals, plus category breakdown table
   - title: "Market Intelligence Memo — Week of [Date]"
3. pg_cron schedules:
   - `daily-brief`: `0 6 * * *` (06:00 UTC daily)
   - `weekly-memo`: `0 6 * * 1` (06:00 UTC Monday)
4. Admin UI in MerchandisingConsole: "Generated Briefs" tab showing story_drafts WHERE auto_classified_category IN ('daily-brief','weekly-memo')

**Files / areas touched**
- `supabase/functions/daily-brief/index.ts` (new edge function)
- `supabase/functions/weekly-memo/index.ts` (new edge function)
- `supabase/migrations/20260313000036_brief_cron_schedules.sql`
- `src/pages/admin/cms/MerchandisingConsole.tsx` (add Generated Briefs tab)

**DB objects**
- pg_cron: 2 new jobs
- `story_drafts`: rows created by edge functions
- `market_signals`: editorial signal rows

**Acceptance tests**
```sql
-- pg_cron jobs registered
SELECT jobname FROM cron.job WHERE jobname IN ('daily-brief','weekly-memo');
-- Expected: 2 rows

-- After manual invoke: draft created
SELECT COUNT(*) FROM story_drafts WHERE auto_classified_category='daily-brief';
-- Expected: >= 1
```
- Invoke `daily-brief` edge function manually → story_drafts row created with status='draft'

**Proof pack**
- File: `docs/qa/verify_CMS-WO-11.json`
- Required: cron_jobs_registered, brief_edge_fn_deployed, memo_edge_fn_deployed, manual_invoke_result, draft_created: true, overall: PASS|FAIL

**Stop conditions**
- pg_cron not available → document blocker, use alternative scheduler, escalate to Team 0
- Edge function produces empty body → fix before deploying cron schedule

---

### WO: DATA-PRESS-PROOF
**Team:** 2 — CMS + Editorial
**Priority:** P1
**Depends on:** NEWSAPI-INGEST-01 (must have run), CMS-WO-07 (story_drafts pipeline active)

**Owner goal / KPI**
Single proof artifact confirming Intelligence Hub has reached DATA density + PRESS credibility + VALUE per session targets. This is the gate before marking the OVERDRIVE sprint complete.

**Exact requirements**
Generate `docs/qa/verify_DATA_PRESS_VALUE.json` containing:
1. Feed counts by vertical/category/tier_min
2. Last 24h signal volume (total + by source layer)
3. Source layer coverage: all 5 layers must be represented (trade press, associations/regulators, academic/clinical, operator/business ops, market/pricing)
4. Topic distribution: confirm no single topic > 40% (MERCH-09 compliance)
5. Duplicate rate: fingerprint uniqueness rate > 95%
6. Sample 30 signal headlines with source_name + confidence + freshness + why_it_matters (if populated)
7. MERCH rules 1–12 status: PASS/WARN/FAIL per rule
8. story_drafts: count by status (draft/review/approved/published)
9. Editorial rail status: cms_posts published count + placements active count
10. Overall PASS/FAIL: PASS only if all 5 source layers present + duplicate rate > 95% + no single topic > 40%

**Files / areas touched**
- `docs/qa/verify_DATA_PRESS_VALUE.json` (output artifact only)

**DB objects:** read-only queries

**Acceptance tests**
- 5 source layers present: true
- Topic concentration < 40%: true
- Duplicate rate > 95%: true
- story_drafts count > 0: true

**Proof pack**
- File: `docs/qa/verify_DATA_PRESS_VALUE.json` (IS the proof pack)

**Stop conditions**
- Any source layer missing → identify gap, add feed, re-run after 1 ingest cycle before marking FAIL

---

### WO: EVT-WO-02
**Team:** 3 — Routes + Journeys
**Priority:** P1
**Depends on:** P0 GATE

**Owner goal / KPI**
Event listing → event detail → registration funnel is complete. No dead ends.

**Exact requirements**
1. `EventDetail.tsx` at `/events/:slug`:
   - TanStack Query: fetch single event by slug from `events` table
   - Hero section: event name, date, location (city/state), organizer
   - Description (rich text rendered from body column)
   - Related signals: useIntelligence({ vertical, limit: 3 }) — show 3 related market signals
   - Registration CTA: if external_url → "Register →" (opens new tab); if internal → navigate to /events/:slug/register
   - LIVE/DEMO guard: isLive badge if event from DB, DEMO banner if no events in DB
   - Skeleton/error/empty states (Pearl Mineral illustrated empty state)
2. Route `/events/:slug` added to App.tsx
3. Events listing page: each event card links to `/events/${event.slug}`

**Files / areas touched**
- `src/pages/public/EventDetail.tsx` (new)
- `src/pages/public/Events.tsx` (add slug links to cards)
- `src/App.tsx` (new route)
- `src/lib/events/useEvents.ts` (add useEventDetail hook)

**DB objects**
- `events`: SELECT by slug (read-only; no new tables)

**Acceptance tests**
- `/events` → click event card → navigates to `/events/[slug]` (no 404)
- EventDetail shows event name + date + description
- If events table empty: DEMO banner present
- tsc=0

**Proof pack**
- File: `docs/qa/verify_EVT-WO-02.json`

**Stop conditions**
- events table has no slug column → add column in migration before building UI

---

### WO: ROUTE-CLEANUP-WO
**Team:** 3 — Routes + Journeys
**Priority:** P1
**Depends on:** P0 GATE

**Owner goal / KPI**
Orphaned routes removed or redirected. Dual-path confusion eliminated. User never lands on a dead-end or duplicate page.

**Exact requirements**
1. Audit routes: /home, /for-medspas, /for-salons, /portal/marketing/*, /portal/marketing-hub/*, /pricing
2. For each:
   - `/home` → redirect to `/intelligence` (or confirm if this is intentional IntelligenceHome)
   - `/for-medspas`, `/for-salons` → redirect to `/professionals` (these are the same audience)
   - `/portal/marketing-hub/*` vs `/portal/marketing/*` → determine which is canonical, redirect other
   - `/pricing` → redirect to `/plans` (canonical)
3. Implement using React Router `<Navigate>` redirects in App.tsx
4. Remove orphaned page components if they have zero references after redirect (or keep with redirect wrapper)
5. Update MainNav if any links reference old paths

**Files / areas touched**
- `src/App.tsx` (add Navigate redirects)
- `src/components/MainNav.tsx` (audit for stale hrefs)

**DB objects:** none

**Acceptance tests**
- GET /pricing → redirects to /plans (no 404)
- GET /for-medspas → redirects to /professionals
- GET /home → redirects to /intelligence
- No duplicate marketing hub routes (one canonical, one redirect)

**Proof pack**
- File: `docs/qa/verify_ROUTE-CLEANUP-WO.json`

---

### WO: BRAND-SIGNAL-WO
**Team:** 3 — Routes + Journeys
**Priority:** P1
**Depends on:** P0 GATE

**Owner goal / KPI**
Brand portal users can act on intelligence signals → create campaigns directly. No dead end in BrandIntelligenceHub intelligence tab.

**Exact requirements**
1. In `BrandIntelligenceHub.tsx` intelligence tab: add "Create Campaign" action button on each signal card
2. Wire to CrossHubActionDispatcher with action_type='create_campaign', fromSignal context
3. CrossHubActionDispatcher 'create_campaign' → navigate to `/brand/marketing/campaigns/new?signal_id={id}` with signal context in router state
4. Campaign creation form receives signal context (pre-fills campaign headline from signal.title)
5. Verify action is logged to audit_log

**Files / areas touched**
- `src/pages/brand/BrandIntelligenceHub.tsx`
- `src/lib/intelligence/CrossHubActionDispatcher.ts` (add create_campaign action)
- Brand marketing campaign create page (add signal_id pre-fill)

**DB objects**
- `audit_log`: INSERT on dispatch

**Acceptance tests**
- Signal card in BrandIntelligenceHub shows "Create Campaign" button
- Click → navigates to campaign creation with signal context
- audit_log has entry for action_type='create_campaign'
- tsc=0

**Proof pack**
- File: `docs/qa/verify_BRAND-SIGNAL-WO.json`

---

### WO: PAY-UPGRADE-WO
**Team:** 3 — Routes + Journeys
**Priority:** P1 (BLOCKED until owner completes Stripe dashboard price config)
**Depends on:** Owner prerequisite: stripe_price_id values set in Stripe dashboard for each plan tier

**Owner goal / KPI**
TierGate upgrade CTA → real Stripe Checkout (not DEMO /plans page). User can actually upgrade.

**Owner prerequisite (cannot start without this)**
- Owner must set stripe_price_id on each plan in Stripe dashboard
- Owner must confirm Stripe webhook is pointing to the correct edge function URL

**Exact requirements**
1. Edge function `create-checkout-session`: accepts tier (starter/pro/enterprise), user JWT, returns Stripe Checkout Session URL
2. TierGate "Upgrade" CTA → calls create-checkout-session → redirects to Stripe hosted checkout
3. Success redirect → `/portal/dashboard?upgraded=true` → show success banner
4. Cancel redirect → returns to originating page
5. Verify stripe-webhook processes checkout.session.completed → updates user plan

**Files / areas touched**
- `supabase/functions/create-checkout-session/index.ts` (new)
- `src/components/ui/TierGate.tsx` (wire Upgrade CTA)

**DB objects**
- `tenant_balances` / `user_profiles`: plan updated on webhook

**Acceptance tests**
- TierGate upgrade → redirects to Stripe hosted checkout page (not /plans)
- Stripe test mode: complete checkout → user_profiles.plan updated
- stripe-webhook processes checkout.session.completed: true

**Proof pack**
- File: `docs/qa/verify_PAY-UPGRADE-WO.json`

**Stop conditions**
- stripe_price_id not configured in Stripe → STOP, cannot proceed, note blocker in build_tracker

---

### WO: DEBT-TANSTACK-REAL-6
**Team:** 4 — Code Debt
**Priority:** P1
**Depends on:** P0 GATE

**Owner goal / KPI**
Zero raw `useEffect` + `supabase.from()` patterns in src/. All 6 identified violations migrated to TanStack Query v5.

**Exact requirements**
For each file: BusinessRulesView, ReportsView, MappingView, PlanOutputView, ServiceIntelligenceView, MarketingCalendarView:
1. Replace useEffect + supabase.from() with useQuery(queryFn)
2. Add loading skeleton (not spinner)
3. Add error state with retry button
4. Add empty state with CTA
5. Verify with `dev-best-practice-checker` skill

**Files / areas touched**
- The 6 files identified in site-wide audit

**DB objects:** none (pattern change only)

**Acceptance tests**
```bash
grep -r "useEffect" src/ --include="*.tsx" | grep "supabase.from"
# Expected: 0 results
npx tsc --noEmit
# Expected: exit 0
```

**Proof pack**
- File: `docs/qa/verify_DEBT-TANSTACK-REAL-6.json`
- Required: violations_before: 6, violations_after: 0, tsc_exit: 0, overall: PASS|FAIL

---

### WO: MERCH-INTEL-03-FINAL
**Team:** 1 — Data + Feeds
**Priority:** P1
**Depends on:** MERCH-INTEL-03-DB

**Owner goal / KPI**
MERCH-INTEL-03 reaches 12/12 PASS. Currently 8/12 PASS after DB migration applied.

**Exact requirements**
1. **MERCH-01**: ingest-openfda — set source_url to canonical MAUDE permalink format per signal: `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfMAUDE/detail.cfm?mdrfoi__id={mdr_report_key}`
2. **MERCH-06**: Run feed-orchestrator against all 18+ enabled feeds to generate signal volume; target paid-depth ratio ≥ 3× free in same vertical/timeframe (requires RSS feeds to be running regularly)
3. **MERCH-10**: Timeline eligibility — add pg_cron job: `UPDATE market_signals SET status='archived' WHERE status='active' AND created_at < NOW() - INTERVAL '30 days'`. Signals older than 30 days archived from default feed.

**Files / areas touched**
- `supabase/functions/ingest-openfda/index.ts` (source_url MAUDE permalink format)
- `supabase/migrations/20260313000037_timeline_eligibility_cron.sql` (MERCH-10 pg_cron)

**DB objects**
- `market_signals`: source_url format update, status archiving
- pg_cron: 1 new job

**Acceptance tests**
```sql
SELECT source_url FROM market_signals WHERE data_source_name='FDA MAUDE' LIMIT 3;
-- Expected: URLs in format https://www.accessdata.fda.gov/scripts/cdrh/...

SELECT COUNT(*) FROM cron.job WHERE jobname='archive-old-signals';
-- Expected: 1
```
- Run intelligence-merchandiser skill: MERCH-01 PASS, MERCH-06 PASS (or WARN if insufficient feed volume), MERCH-10 PASS

**Proof pack**
- File: `docs/qa/verify_MERCH-INTEL-03-FINAL.json`
- Required: merch_rules_1_12 (each: PASS|WARN|FAIL), overall: PASS|FAIL

---

### WO: P1-3
**Team:** 4 — Code Debt
**Priority:** P1
**Depends on:** P0 GATE

**Owner goal / KPI**
Legacy token blocks (`brand-*`, `intel-*`) removed from tailwind.config.js. All usages were previously migrated. Cleanup removes dead config.

**Exact requirements**
1. Confirm 0 usages of `brand-*` and `intel-*` in src/:
   ```bash
   grep -r "brand-" src/ --include="*.tsx" --include="*.ts" --include="*.css" | grep -v "brand_" | grep -v "BrandAdmin" | grep -v "brand/"
   grep -r "intel-" src/ --include="*.tsx" --include="*.ts"
   ```
2. If 0 usages confirmed: remove brand-* and intel-* blocks from `tailwind.config.js`
3. Run `npx tsc --noEmit` and `npm run build` — both must pass
4. Run `token-drift-scanner` skill

**Files / areas touched**
- `tailwind.config.js`

**Acceptance tests**
```bash
npm run build     # exit 0
npx tsc --noEmit  # exit 0
grep "brand-" tailwind.config.js  # 0 results (or only in comments)
grep "intel-" tailwind.config.js  # 0 results
```

**Proof pack**
- File: `docs/qa/verify_P1-3.json`

---

### WO: STATE-AUDIT-01
**Team:** 4 — Code Debt
**Priority:** P1
**Depends on:** P0 GATE

**Owner goal / KPI**
23 identified shell/incomplete pages have Pearl Mineral illustrated empty states + retry error states. No page ships as a dead end.

**Priority order (high impact first):**
1. Protocols.tsx, Education.tsx, BlogPostPage.tsx, CoursePlayer.tsx (public — high traffic)
2. ApiDocs.tsx, ApiPricing.tsx (public — SEO indexed)
3. BenchmarkDashboard.tsx, LocationsDashboard.tsx (business portal — active users)
4. StudioHome.tsx, CourseBuilder.tsx (business portal — active users)
5. Remaining 13 from shell detector Category C

**Exact requirements per page:**
- Loading state: skeleton shimmer (3-block minimum, matches page layout)
- Empty state: Pearl Mineral illustration + bold headline + 1-sentence body + single CTA button
- Error state: "Something went wrong" + retry button + cached fallback data if available
- No Loader2 spinner (banned — must be skeleton shimmer)

**Files / areas touched**
- The 23 pages from DEBT-7 Category C list in CLAUDE.md §4.1

**Acceptance tests**
- Run `hub-shell-detector` skill after each batch — score must improve
- Run `shared-state-components-auditor` skill — 0 missing error/empty states on touched pages

**Proof pack**
- File: `docs/qa/verify_STATE-AUDIT-01.json`
- Required: pages_audited, pages_fixed, shell_detector_before, shell_detector_after, overall: PASS|FAIL

---

### WO: P2-1
**Team:** 5 — Testing / CI
**Priority:** P2
**Depends on:** P0 GATE

**Owner goal / KPI**
29 failing unit tests pass. React 19 + @testing-library/react v16 incompatibility resolved by upgrading to v17.

**Exact requirements**
1. `npm install @testing-library/react@^17.x --save-dev`
2. Run `npm run test` — must return ≥ 163 passing (was 163/192; adding v17 should fix the 29 React 19 compat failures)
3. Fix any test code that breaks with v17 API changes
4. tsc=0 after upgrade

**Files / areas touched**
- `package.json` (devDependencies)
- Test files that break with v17 (if any)

**Acceptance tests**
```bash
npm run test
# Expected: >= 163 passing, 0 failing due to React 19 compat
```

**Proof pack**
- File: `docs/qa/verify_P2-1.json`
- Required: tests_before (163 pass/29 fail), tests_after, overall: PASS|FAIL

---

### WO: P2-STRIPE
**Team:** 5 — Testing / CI
**Priority:** P2
**Depends on:** P0 GATE

**Owner goal / KPI**
Confirm exactly one Stripe webhook handler is registered and processing events. No double-write risk.

**Exact requirements**
1. Audit: grep for all Stripe webhook handlers in supabase/functions/
2. Confirm: only one function handles `checkout.session.completed` and `customer.subscription.*` events
3. If duplicates found: document which is canonical, disable other
4. Verify: webhook signing secret matches between Stripe dashboard and Supabase secret `STRIPE_WEBHOOK_SECRET`
5. Test: send test webhook from Stripe dashboard → confirm single handler processes it

**Files / areas touched**
- `supabase/functions/stripe-webhook/` and any other webhook handlers found

**Acceptance tests**
- grep `checkout.session.completed` in supabase/functions/ → exactly 1 handler
- Test webhook delivery → 200 response, single DB write

**Proof pack**
- File: `docs/qa/verify_P2-STRIPE.json`

---

## §6 — VERIFICATION PROTOCOL

Every WO follows this exact protocol before Team 0 marks it DONE:

```json
{
  "wo_id": "WO-ID",
  "timestamp": "ISO-8601",
  "team": "Team 0-5",
  "skills_run": ["skill-name"],
  "results": {
    "skill-name": {
      "status": "PASS|FAIL",
      "failures": [],
      "evidence": "grep output / SQL result / build log excerpt"
    }
  },
  "commit_sha": "abc1234",
  "tsc_exit_code": 0,
  "build_exit_code": 0,
  "overall": "PASS|FAIL"
}
```

**Prohibited patterns (STOP CONDITIONS — §9 CLAUDE.md):**
- Writing PASS without a proof JSON in docs/qa/
- Narrowing scope to avoid a failure ("scoped to portals")
- Fabricating SQL results (prior session violation — addressed)
- Marking DONE without tsc=0

---

## §7 — P0 LAUNCH GATE CHECKLIST

Before Build 1 is complete and Build 2 can start, ALL of the following must be GREEN:

| Gate | WO | Check |
|------|----|-------|
| tsc=0 | All WOs | `npx tsc --noEmit` exit 0 |
| Build passes | All WOs | `npm run build` exit 0 |
| DB types current | DB-TYPES-02 | database.types.ts matches live DB |
| Feed pipeline live | NEWSAPI-INGEST-01 | >= 5 API sources ingesting |
| Signal dedup clean | MERCH-INTEL-03-DB | fingerprint NULL = 0 |
| Editorial rail LIVE | CMS-SEED-01 | cms_posts published >= 6 |
| story_drafts pipeline active | CMS-WO-07 | story_drafts count > 0 |
| Owner can merchandise | CMS-WO-10 | content_placements table + console live |
| Event detail funnel | EVT-WO-02 | /events/:slug no 404 |
| Route orphans resolved | ROUTE-CLEANUP-WO | /pricing /home /for-medspas redirect cleanly |
| 0 raw useEffect+supabase | DEBT-TANSTACK-REAL-6 | grep returns 0 |
| Legacy tokens removed | P1-3 | brand-*/intel-* 0 usages |
| MERCH rules 12/12 | MERCH-INTEL-03-FINAL | intelligence-merchandiser skill PASS |
| Tests >= 163 passing | P2-1 | npm run test |
| Stripe single handler | P2-STRIPE | grep returns 1 handler |
| 0 banned terms | All WOs | banned-term-scanner 0 violations |
| Proof packs present | All WOs | docs/qa/verify_*.json for each WO |

---

*WO MASTER PLATFORM UPGRADE — v1.0 — 2026-03-10 — Governed by /.claude/CLAUDE.md*
