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

### CMS Schema Authorization (PATCH 7)
The following schema changes are **explicitly authorized** by this pack. No additional WO required for these objects:

| Object | Operation | Authorized By |
|--------|-----------|---------------|
| `story_drafts` | CREATE TABLE + RLS | CMS-WO-07 |
| `content_placements` | CREATE TABLE + RLS | CMS-WO-10 |
| `sitemap_cache` | CREATE TABLE | CMS-WO-09 |
| `cms_posts.scheduled_at` | ADD COLUMN | CMS-WO-09 |
| `cms_posts.space_id` | existing — no change | — |
| `cms_versions` | existing — no change | — |
| `data_feeds.display_order` | ADD COLUMN | MERCH-INTEL-03-DB |

**Schema change rule:** Any table or column NOT in the list above requires a NEW explicitly named WO before implementation. This includes:
- Any new `cms_*` table not listed here
- Any ALTER on `market_signals`, `user_profiles`, `auth.users`, or any portal table
- Any new edge function that writes to tables outside its WO scope

**Migration naming rule:** All migrations from this pack use the prefix `20260313000031` through `20260313000039`. Migrations outside this range require Team 0 approval.

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
| **Team 2** | CMS + Editorial + Merchandising | CMS build, editorial pipeline, placements, block editing | CMS-SEED-01, CMS-WO-07, CMS-WO-08, CMS-WO-09, CMS-WO-10, CMS-WO-11, CMS-WO-12, DATA-PRESS-PROOF |
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

**Acceptance tests (PATCH 6 — scoped to avoid false FAILs)**
```sql
-- SCOPED: Only active signals in last 90 days must have fingerprint
-- (archived/draft signals pre-date the fingerprint column and are exempt)
SELECT COUNT(*) FROM market_signals
WHERE fingerprint IS NULL
  AND status = 'active'
  AND created_at >= NOW() - INTERVAL '90 days';
-- Expected: 0

-- display_order populated on enabled feeds
-- (disabled feeds get display_order=0 by default — acceptable)
SELECT COUNT(*) FROM data_feeds
WHERE display_order IS NULL
  AND is_enabled = true;
-- Expected: 0

-- Safety signals boosted — scoped to active + last 90 days
SELECT COUNT(*) FROM market_signals
WHERE signal_type = 'regulatory_alert'
  AND impact_score >= 0.8
  AND status = 'active'
  AND created_at >= NOW() - INTERVAL '90 days';
-- Expected: > 0 (if any regulatory_alert signals exist in window)
-- WARN (not FAIL) if 0 rows — means no regulatory signals in window, not a migration failure

-- Row count before vs after (record both in proof pack)
SELECT COUNT(*) FROM market_signals WHERE status = 'active';
SELECT COUNT(*) FROM market_signals WHERE status = 'archived';
-- Record as: { active_before: N, active_after: N, archived_count: N }
```

**Proof pack**
- File: `docs/qa/verify_MERCH-INTEL-03-DB.json`
- Required fields: wo_id, timestamp, sql_results (all 3 queries), row_counts_before_after, overall: PASS|FAIL

**Skills Required (PATCH 3)**
- `feed-pipeline-checker` — verifies feed data integrity
- `signal-data-validator` — verifies fingerprint coverage, confidence, freshness
- `provenance-checker` — verifies source attribution on all signals
- `build-gate` — tsc + build

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

**Skills Required (PATCH 3)**
- `feed-pipeline-checker` — verifies full pipeline wiring feed→signal
- `feed-source-auditor` — verifies all new sources comply with provenance tier rules
- `deduplication-logic-checker` — verifies fingerprint dedup is applied on all ingest paths
- `dlq-system-checker` — verifies DLQ writes on failure paths
- `signal-data-validator` — verifies confidence, vertical, topic populated on new signals
- `provenance-checker` — verifies source_domain, source_url, attribution populated
- `pg-cron-scheduler-validator` — verifies feed-orchestrator cron schedule active
- `build-gate` — tsc + build

**Implementation Contract (PATCH 5)**
Every API ingest path — GNews, Currents, NewsAPI, Reddit — MUST populate ALL of the following fields on every market_signals row. No exceptions. Missing fields = DLQ the item and log why:

| Field | Source | Rule |
|-------|--------|------|
| `title` | API response title | Truncate at 500 chars; must not be empty |
| `source_url` | Article URL | Must be a valid HTTP/HTTPS URL |
| `source_domain` | Extracted from source_url | Use regex `new URL(source_url).hostname` |
| `source_name` | API response source name | Use feed attribution_label if API doesn't provide |
| `published_at` | Article published date | Parse from item.publishedAt OR item.published OR item.created_utc |
| `fetched_at` | Ingest timestamp | `new Date().toISOString()` at ingest time |
| `confidence` | Computed from provenance_tier | tier1=0.9, tier2=0.7, tier3=0.5 (Reddit=0.45) |
| `vertical` | Inherited from data_feeds.vertical | Must not be NULL; default 'all' |
| `topic` | classifyTopic(title) | Must not be NULL; default 'general' |
| `fingerprint` | SHA-256(source_url + title) | Dedup: skip INSERT if fingerprint already exists |
| `thumbnail_url` | API response image/urlToImage | NULL if not provided; do not error |
| `tier_min` | Inherited from data_feeds.tier_min | Must not be NULL |
| `status` | Always 'active' on INSERT | Never 'draft' or 'archived' on initial ingest |

**Dedup rule:** Before every INSERT, check `SELECT id FROM market_signals WHERE fingerprint = $fingerprint`. If found → skip (not an error). If not found → INSERT.

**feed_run_log rule:** Every feed-orchestrator run MUST write a feed_run_log row: `{ feed_id, started_at, completed_at, items_fetched, items_inserted, items_skipped_dedup, items_failed, error_message }`.

**DLQ rule:** Any item that fails validation (missing required field, parse error, invalid URL) MUST be written to feed_dlq: `{ feed_id, raw_payload, error_type, error_message, created_at }`. Never silently drop.

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

**Skills Required (PATCH 3)**
- `database-types-generator` — regenerates and validates database.types.ts freshness
- `schema-drift-detector` — confirms no drift between types and migrations
- `build-gate` — tsc + build

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

**Skills Required (PATCH 3)**
- `live-demo-detector` — confirms editorial rail is LIVE (not DEMO fallback)
- `cms-status` — verifies cms_posts row counts, RLS, status=published gate
- `banned-term-scanner` — all seeded titles/excerpts pass banned term check
- `build-gate` — tsc + build

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

**Skills Required (PATCH 3)**
- `cms-status` — verifies story_drafts table, RLS, row counts
- `rls-auditor` — confirms RLS policies on story_drafts (no public read)
- `deduplication-logic-checker` — verifies raw_url dedup fires correctly
- `live-demo-detector` — editorial rail still LIVE after pipeline wired
- `build-gate` — tsc + build

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

**Skills Required (PATCH 3)**
- `cms-status` — verifies state machine transitions, promoted post created
- `authoring-core-schema-validator` — confirms cms_versions audit trail intact
- `live-demo-detector` — confirms published post appears on editorial rail
- `banned-term-scanner` — promoted content passes banned term gate
- `build-gate` — tsc + build

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

**Skills Required (PATCH 3)**
- `seo-audit` — confirms og:title, og:description, og:image, JSON-LD Article on /blog/:slug
- `pg-cron-scheduler-validator` — verifies publish-scheduled-posts job registered
- `cms-status` — confirms sitemap_cache populated on publish
- `build-gate` — tsc + build

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

**Skills Required (PATCH 3)**
- `rls-auditor` — confirms content_placements RLS (admin write, authenticated read)
- `live-demo-detector` — editorial rail reads from placements when they exist
- `cms-status` — confirms placement_keys seeded
- `build-gate` — tsc + build

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

**Skills Required (PATCH 3)**
- `pg-cron-scheduler-validator` — verifies daily-brief + weekly-memo cron jobs registered
- `edge-fn-health` — confirms daily-brief + weekly-memo edge functions deployed and healthy
- `cms-status` — confirms story_drafts rows created by edge function invocation
- `build-gate` — tsc + build

**Stop conditions**
- pg_cron not available → document blocker, use alternative scheduler, escalate to Team 0
- Edge function produces empty body → fix before deploying cron schedule

---

---

### WO: CMS-WO-12
**Team:** 2 — CMS + Editorial
**Priority:** P1
**Depends on:** CMS-WO-07, CMS-WO-10
**Note:** Added by PATCH 8 — CMS must be editable at block/layout/grid level, not just placement level.

**Owner goal / KPI**
Owner can add, remove, reorder, and configure blocks on any CMS-backed page without touching code. PageRenderer is block-extensible: new block types can be added to the block library without rewriting PageRenderer. Grid and rail layouts are configurable via the block system, not hardcoded.

**Exact requirements (PATCH 8)**
1. **Block editability**: Every block on a CMS-backed page must be:
   - Addable from block library (admin panel drag-from-library or click-to-add)
   - Removable (delete with confirmation)
   - Reorderable (drag/drop within page)
   - Configurable (block-level props editable inline, e.g. headline, CTA label, image, layout variant)
2. **Layout editability**: Grid and rail layouts must be selectable via block type, not hardcoded in PageRenderer. Example: `{ type: 'grid', columns: 3, gap: 'md' }` block wraps child blocks.
3. **Block library extensibility**: Adding a new block type requires:
   - Add to `BLOCK_REGISTRY` constant (new `{ type, label, defaultProps, component }` entry)
   - Add corresponding React component in `/src/components/cms/blocks/`
   - PageRenderer auto-picks it up via registry lookup — no PageRenderer changes needed
4. **Block registry** must exist at `src/lib/cms/blockRegistry.ts` as the single source of truth for all block types.
5. Current 12 block types (from AUTH-CORE-01..06) must all be registered in the registry.
6. Admin UI in CmsPageEdit: block palette sidebar + drag-onto-canvas (or click-to-append at bottom)
7. Each placed block shows: type label, edit button (inline props panel), move up/down handles, delete button

**Files / areas touched**
- `src/lib/cms/blockRegistry.ts` (new — block registry)
- `src/components/cms/PageRenderer.tsx` (refactor to use registry lookup)
- `src/pages/admin/cms/CmsPageEdit.tsx` (add block palette + reorder UI)
- `src/components/cms/blocks/` (existing block components — no changes if already exist)

**DB objects**
- `cms_posts.blocks` JSONB column (existing) — block data stored here as ordered array

**Acceptance tests**
- Block registry has >= 12 entries (all current block types)
- Adding new block type: add entry to BLOCK_REGISTRY → block appears in admin palette without PageRenderer edit
- Dragging block to new position → cms_posts.blocks JSONB array updated, page renders in new order
- Removing block → JSONB array updated, block no longer renders
- Editing block prop → JSONB updated, page renders updated value
- tsc=0

**Skills Required (PATCH 3)**
- `authoring-core-schema-validator` — block types coverage + registry completeness
- `cms-status` — confirms block JSONB structure valid on cms_posts
- `hub-shell-detector` — CmsPageEdit has all required states (loading/error/empty)
- `build-gate` — tsc + build

**Proof pack**
- File: `docs/qa/verify_CMS-WO-12.json`
- Required: block_registry_count, new_block_extensibility_test: PASS|FAIL, reorder_persists: true, tsc_exit: 0, overall: PASS|FAIL

**Stop conditions**
- PageRenderer requires edit to support new block types → STOP, fix registry pattern first
- Block reorder does not persist to DB → STOP, fix useMutation before marking DONE

---

### WO: DATA-PRESS-PROOF
**Team:** 2 — CMS + Editorial
**Priority:** P1
**Depends on:** NEWSAPI-INGEST-01 (must have run), CMS-WO-07 (story_drafts pipeline active)

**Owner goal / KPI**
Single proof artifact confirming Intelligence Hub has reached DATA density + PRESS credibility + VALUE per session targets. This is the gate before marking the OVERDRIVE sprint complete.

**Exact requirements (PATCH 9 — all criteria numeric)**
Generate `docs/qa/verify_DATA_PRESS_VALUE.json` containing — with numeric PASS thresholds:

| Metric | Query | PASS Threshold | WARN Threshold | FAIL |
|--------|-------|---------------|----------------|------|
| Total active signals | `SELECT COUNT(*) FROM market_signals WHERE status='active'` | >= 50 | 20-49 | < 20 |
| Signals last 24h | `SELECT COUNT(*) FROM market_signals WHERE status='active' AND created_at > NOW()-INTERVAL '24h'` | >= 5 | 1-4 | 0 |
| Signals last 6h (freshness) | `SELECT COUNT(*) FROM market_signals WHERE status='active' AND created_at > NOW()-INTERVAL '6h'` | >= 2 | 1 | 0 |
| Source layers covered | Count of distinct categories from: trade_pub, association, academic, operator_ops, market_pricing | = 5 | 4 | <= 3 |
| medspa vertical signals | `SELECT COUNT(*) WHERE vertical='medspa' AND status='active'` | >= 15 | 5-14 | < 5 |
| salon vertical signals | `SELECT COUNT(*) WHERE vertical='salon' AND status='active'` | >= 10 | 3-9 | < 3 |
| beauty_brand vertical signals | `SELECT COUNT(*) WHERE vertical='beauty_brand' AND status='active'` | >= 5 | 1-4 | 0 |
| Max single topic % | `SELECT topic, COUNT(*) * 100.0 / total FROM market_signals GROUP BY topic ORDER BY 2 DESC LIMIT 1` | <= 40% | 41-50% | > 50% |
| Fingerprint uniqueness rate | `(signals_with_fingerprint / total_active) * 100` | >= 95% | 90-94% | < 90% |
| Paid-depth ratio | paid_tier_signals / free_tier_signals per vertical per 7-day window | >= 1.0x (WARN if < 3x; FAIL not triggered — needs RSS volume) | < 3.0x | N/A (WARN only) |
| story_drafts created | `SELECT COUNT(*) FROM story_drafts WHERE status='draft'` | >= 1 | — | 0 |
| cms_posts published | `SELECT COUNT(*) FROM cms_posts WHERE status='published'` | >= 6 | 1-5 | 0 |
| Active placements | `SELECT COUNT(*) FROM content_placements WHERE is_active=true` | >= 1 | — | 0 |
| Avg confidence | `SELECT AVG(confidence) FROM market_signals WHERE status='active'` | >= 0.55 | 0.40-0.54 | < 0.40 |

**Baseline queries (record for % improvement tracking):**
```sql
-- Baseline: signals before NEWSAPI-INGEST-01 ran (from verify_INTEL-MEDSPA-01.json: 30 signals)
-- Record delta: current_total - 30 = improvement

-- Source layer baseline: check which categories are represented
SELECT category, COUNT(*) as signal_count, AVG(confidence) as avg_conf
FROM market_signals
WHERE status = 'active'
GROUP BY category
ORDER BY signal_count DESC;
```

**Overall PASS criteria (ALL must be true):**
- All 5 source layers present (= 5, not >= 4)
- Signals last 24h >= 5
- Max single topic % <= 40%
- Fingerprint uniqueness rate >= 95%
- cms_posts published >= 6
- story_drafts count >= 1

**Files / areas touched**
- `docs/qa/verify_DATA_PRESS_VALUE.json` (output artifact only)

**DB objects:** read-only queries

**Acceptance tests**
- 5 source layers present: true (FAIL if any missing)
- Signals last 24h >= 5 (FAIL if < 5)
- Topic max % <= 40% (FAIL if > 40%)
- Fingerprint uniqueness >= 95% (FAIL if < 95%)
- cms_posts published >= 6 (FAIL if < 6)

**Proof pack**
- File: `docs/qa/verify_DATA_PRESS_VALUE.json` (IS the proof pack)

**Skills Required (PATCH 3)**
- `intelligence-merchandiser` — runs all 12 MERCH rules, produces PASS/WARN/FAIL per rule
- `data-integrity-suite` — end-to-end pipeline validation
- `feed-source-auditor` — source layer coverage check
- `topic-distribution-checker` — confirms no topic > 40%
- `signal-data-validator` — confidence, freshness, provenance per signal

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

**Skills Required (PATCH 3)**
- `hub-shell-detector` — confirms EventDetail has all required states (loading/error/empty)
- `live-demo-detector` — LIVE badge when events in DB, DEMO banner when empty
- `seo-audit` — EventDetail has meta tags
- `route-mapper` — /events/:slug route registered in App.tsx
- `build-gate` — tsc + build

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

**Skills Required (PATCH 3)**
- `route-mapper` — confirms all redirects registered, no orphaned routes
- `smoke-test-suite` — /pricing /home /for-medspas all redirect correctly
- `build-gate` — tsc + build

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

**Skills Required (PATCH 3)**
- `cross-hub-dispatcher-validator` — confirms create_campaign action registered and fires correctly
- `audit-log-auditor` — audit_log entry confirmed for action_type='create_campaign'
- `build-gate` — tsc + build

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

**Skills Required (PATCH 3)**
- `stripe-integration-tester` — confirms checkout session creation, webhook processing
- `payment-flow-tester` — tests full upgrade flow end-to-end
- `build-gate` — tsc + build

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

**Skills Required (PATCH 3)**
- `dev-best-practice-checker` — confirms 0 raw useEffect+supabase.from() violations
- `loading-skeleton-enforcer` — confirms skeleton shimmers present (not Loader2)
- `empty-state-enforcer` — confirms empty states with CTA
- `error-state-enforcer` — confirms error states with retry
- `build-gate` — tsc + build

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

**Skills Required (PATCH 3)**
- `intelligence-merchandiser` — full 12-rule audit; must reach ≥ 10/12 PASS (MERCH-06 allowed WARN if feed volume insufficient)
- `pg-cron-scheduler-validator` — archive-old-signals cron job verified
- `provenance-checker` — source_url MAUDE permalink format confirmed on FDA signals

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

**Skills Required (PATCH 3)**
- `token-drift-scanner` — confirms brand-*/intel-* zero usages in src/
- `design-audit-suite` — full Pearl Mineral V2 compliance after removal
- `build-gate` — tsc + build + confirm 0 Tailwind class errors

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

**Skills Required (PATCH 3)**
- `hub-shell-detector` — run before + after; score must improve per batch
- `shared-state-components-auditor` — confirms EmptyState/ErrorState/LoadingSkeleton on all touched pages
- `loading-skeleton-enforcer` — no Loader2 spinners on touched pages
- `empty-state-enforcer` — illustrated empty states with CTA
- `error-state-enforcer` — retry buttons + fallback data
- `build-gate` — tsc + build

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

**Skills Required (PATCH 3)**
- `test-runner-suite` — runs smoke-test-suite + e2e-test-runner + playwright-crawler after upgrade
- `build-gate` — tsc + build

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

**Skills Required (PATCH 3)**
- `stripe-integration-tester` — confirms single handler, no double-write
- `billing-payments-suite` — full billing pipeline audit

**Proof pack**
- File: `docs/qa/verify_P2-STRIPE.json`

### Skill Creation Queue (MISSING skills — PATCH 3)
The following skills are referenced above but do not yet exist in `/.claude/skills/`. Create before executing the WOs that require them:

| Missing Skill | Needed By | Purpose |
|---------------|-----------|---------|
| `cms-status` | CMS-SEED-01, CMS-WO-07, CMS-WO-08, CMS-WO-10, CMS-WO-11 | Check CMS: list cms_* tables, count rows, RLS, status=published gate |
| `database-types-generator` | DB-TYPES-02 | Regenerates database.types.ts and validates freshness |
| `schema-drift-detector` | DB-TYPES-02 | Detects drift between database.types.ts and migrations |
| `cross-hub-dispatcher-validator` | BRAND-SIGNAL-WO | Validates CrossHubActionDispatcher action wiring |
| `payment-flow-tester` | PAY-UPGRADE-WO | Tests Stripe checkout session creation + redirect |

> Note: `cms-status`, `cross-hub-dispatcher-validator` already appear in skill list — verify before creating.

---

## §6 — VERIFICATION PROTOCOL (PATCH 4 — canonical standard)

Every WO follows this exact protocol before Team 0 marks it DONE.

### 6.1 — Required Proof Pack JSON Schema

Every WO proof pack MUST be saved at the exact path `docs/qa/verify_<WO_ID>.json` and contain ALL of the following fields:

```json
{
  "wo_id": "EXACT-WO-ID-FROM-THIS-DOC",
  "timestamp": "2026-03-10T00:00:00.000Z",
  "team": "Team 1|2|3|4|5",
  "skills_run": ["skill-name-1", "skill-name-2"],
  "results": {
    "skill-name-1": {
      "status": "PASS|FAIL|WARN",
      "failures": [],
      "evidence": "exact grep output / SQL result / build log line — no summaries"
    },
    "skill-name-2": {
      "status": "PASS|FAIL|WARN",
      "failures": [],
      "evidence": "..."
    }
  },
  "acceptance_tests": {
    "test_name_1": { "status": "PASS|FAIL", "evidence": "..." },
    "test_name_2": { "status": "PASS|FAIL", "evidence": "..." }
  },
  "commit_sha": "7-char SHA of the commit that implemented this WO",
  "tsc_exit_code": 0,
  "build_exit_code": 0,
  "banned_terms_scan": "PASS",
  "overall": "PASS|FAIL"
}
```

**Fields that cannot be omitted:**
- `wo_id` — must match WO ID exactly
- `skills_run` — must list every skill from the WO's "Skills Required" section
- `results` — must have one entry per skill in skills_run
- `acceptance_tests` — must have one entry per acceptance test bullet in the WO
- `commit_sha` — the implementing commit SHA (not the doc patch commit)
- `tsc_exit_code` — must be 0
- `build_exit_code` — must be 0
- `overall` — `PASS` only when all skills PASS/WARN and tsc=0 and build=0

### 6.2 — Proof Pack Validation Rules

- `overall: PASS` requires: ALL skills PASS or WARN, tsc_exit_code=0, build_exit_code=0, banned_terms_scan=PASS
- `overall: FAIL` if ANY skill returns FAIL (even if others pass)
- `overall: FAIL` if tsc_exit_code ≠ 0
- `overall: FAIL` if commit_sha is missing or invalid
- WARN is allowed for MERCH-INTEL-03-FINAL MERCH-06 (insufficient feed volume) and DATA-PRESS-PROOF paid-depth ratio (needs RSS volume time)

### 6.3 — Prohibited Patterns (STOP CONDITIONS per §9 CLAUDE.md)

- Writing `overall: PASS` without running all skills in the WO's Skills Required list
- Narrowing scope to avoid a failure ("scoped to portals" / "only applies to X")
- Fabricating SQL results or evidence strings (prior session violation — permanently banned)
- Marking DONE in build_tracker.md without a proof JSON in docs/qa/
- `tsc_exit_code` ≠ 0 in a PASS proof pack
- Missing `acceptance_tests` field — must be present even if empty object

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
