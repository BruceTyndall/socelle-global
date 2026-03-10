# API RUNTIME INVENTORY
**Generated:** 2026-03-10  
**Agent:** INTELLIGENCE-MERCHANDISER-17  
**Authority:** AGENT ACTIVATION GATE directive

---

## Active Edge Functions (Supabase — project: rumdmulxzmjtsplsjngi)

| Function | Version | Status | Purpose |
|----------|---------|--------|---------|
| `feed-orchestrator` | v11 | ACTIVE | RSS + API feed ingestion, signal creation, HTML detection |
| `rss-to-signals` | v11 | ACTIVE | RSS parsing, topic classification, impact scoring |
| `generate-embeddings` | v1 | ACTIVE | text-embedding-ada-002, 1536-dim vectors |
| `ai-orchestrator` | unknown | ACTIVE | Central AI routing |
| `ai-concierge` | unknown | ACTIVE | User-facing AI chat |
| `send-email` | unknown | ACTIVE (READ ONLY) | Transactional emails only |
| `magic-link` | unknown | ACTIVE (READ ONLY) | Auth flow |
| `create-checkout` | FROZEN | NEVER TOUCH | Commerce checkout |
| `stripe-webhook` | FROZEN | NEVER TOUCH | Stripe payment webhooks |
| `open-beauty-facts-sync` | v8 | ACTIVE | Ingredients table sync (2,950 rows) |
| `ingest-npi` | v10 | ACTIVE | NPI registry operator verification |
| `ingest-openfda` | v15 | ACTIVE | FDA MDR aesthetic device signals |
| `feeds-to-drafts` | NOT DEPLOYED | PENDING | CMS story draft auto-creation (CMS-WO-07 blocked) |

---

## External API Integrations

| Service | Key Location | Query Type | Rate Limit | Status |
|---------|-------------|------------|------------|--------|
| GNews | data_feeds.endpoint_url (embedded) | beauty keyword search: medspa OR skincare OR botox OR filler OR aesthetics | 100 req/day (free) | ACTIVE |
| NewsAPI | data_feeds.endpoint_url (embedded) | beauty keyword search: medspa OR skincare OR botox OR aesthetics | 100 req/day (free) | ACTIVE |
| Currents API | data_feeds.endpoint_url (embedded) | beauty-specific RSS feeds | unknown | ACTIVE |
| Reddit | data_feeds.endpoint_url (embedded) | r/SkincareAddiction, r/MedSpas | unknown | ACTIVE |
| OpenFDA | No key required | aesthetic device MDR: diode/fractional/alexandrite/Nd:YAG/CO2/IPL/RF-microneedling | 1000 req/day | ACTIVE |
| Open Beauty Facts | No key required | ingredients database pagination | unlimited | ACTIVE |
| NPI Registry | No key required | business NPI verification | unlimited | ACTIVE |
| OpenAI (embeddings) | OPENAI_API_KEY env var | text-embedding-ada-002 | pay-per-use | ACTIVE |
| OpenRouter | OPENROUTER_API_KEY env var | LLM routing for AI features | pay-per-use | ACTIVE |

---

## Database Feed Inventory (data_feeds table)

| Vertical | Enabled Count | Health Status Distribution |
|----------|---------------|---------------------------|
| medspa | 34 | 18 healthy, remainder variable |
| salon | 20 | partial healthy |
| beauty_brand | 11 | partial healthy |
| multi | varies | varies |
| **Total enabled** | **79** | 18 confirmed healthy (FEED-URL-01 audit) |

---

## Signal Inventory (market_signals table)

| Metric | Value | As-of |
|--------|-------|-------|
| Total active signals | 47–121 (variable per session) | 2026-03-10 |
| Free tier signals | 112 | 2026-03-10 |
| Paid tier signals | 6 | 2026-03-10 |
| Signals with image_url | 11 | 2026-03-10 |
| regulatory_alert ≥70 impact | 17 | MERCH-INTEL-03-DB |
| Null fingerprints | 0 | MERCH-INTEL-03-DB |

---

## API Key Status

| Key | Env Var | Location | Confirmed |
|-----|---------|----------|-----------|
| GNEWS_KEY | — | Embedded in data_feeds.endpoint_url | ✅ |
| NEWSAPI_KEY | — | Embedded in data_feeds.endpoint_url | ✅ |
| CURRENTS_KEY | — | Embedded in data_feeds.endpoint_url | ✅ |
| REDDIT_CLIENT_ID | — | Embedded or env var | ✅ |
| REDDIT_CLIENT_SECRET | — | Embedded or env var | ✅ |
| OPENAI_API_KEY | OPENAI_API_KEY | Supabase secrets | ✅ (generate-embeddings active) |
| OPENROUTER_API_KEY | OPENROUTER_API_KEY | Supabase secrets | ✅ (ai-orchestrator active) |
| STRIPE_SECRET_KEY | STRIPE_SECRET_KEY | Supabase secrets | BLOCKED — owner must configure |

---

## Known API Issues

1. **GNews topic=health (FIXED)** — Was querying all global health news. Fixed to beauty keyword search.
2. **{GNEWS_KEY} substitution mismatch (FIXED)** — feed-orchestrator substitution checked `{API_KEY}`, URL had `{GNEWS_KEY}`. Fixed by embedding keys directly in endpoint_url.
3. **feed-orchestrator JWT 401** — Direct invocation via service role key returned 401 Invalid JWT. Cron invocation from pg_cron uses internal auth (not affected).
4. **PRESS-INGEST-01 (OPEN)** — No article content pipeline. full_text and rich excerpt missing from signals. GUARDRAIL-02 blocks INTEL-UI-CLICK-IMAGE-01 final certification.
5. **Commercial feeds disabled** — Mintel, Euromonitor, CosmeticsDesign require paid API plans. 0 commercial paid signals available.

---

## pg_cron Scheduled Jobs

| Job Name | Schedule | Function | Status |
|----------|----------|----------|--------|
| `feed-orchestrator-hourly` | `0 * * * *` | feed-orchestrator | ACTIVE |
| `feeds-to-drafts-hourly` | `15 * * * *` | feeds-to-drafts | PENDING (not deployed) |
| `open-beauty-facts-pagination` | TBD | open-beauty-facts-sync | PENDING |
| `npi-30day-archive` | TBD | ingest-openfda | PENDING |

---

*API_RUNTIME_INVENTORY.md — Agent #17 INTELLIGENCE MERCHANDISER — 2026-03-10*
