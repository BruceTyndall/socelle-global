# SOCELLE Platform Model Update — QA Report

**Document type:** Quality Assurance and Model Alignment Report
**Agent:** Agent 8 — QA / Model Alignment Agent
**Date:** March 4, 2026
**Scope:** All 10 output files from Agents 1–7 (platform model update, March 2026)

---

## Section 1: Bug Fixes Applied

### Fix 1 (Critical): `deactivate_low_sentiment_affiliate_products()` — Incorrect Join

**File:** `platform/AFFILIATE_MIGRATION.sql`

**Root cause:** The function's `flagged_brands` CTE queried `socelle.brand_reviews` using a non-existent `brand` TEXT column. The `brand_reviews` table (defined in `BRAND_PROFILES_MIGRATION.sql`) stores `brand_id UUID` as a foreign key to `socelle.brands(id)` — not a text brand name. The CTE then matched `affiliate_products.brand` (TEXT) against `brand_reviews.brand` (TEXT), which would raise a PostgreSQL column-not-found error at runtime.

**Before (buggy):**
```sql
WITH flagged_brands AS (
    SELECT brand, AVG(rating) AS avg_rating
    FROM socelle.brand_reviews
    GROUP BY brand             -- ERROR: brand_reviews has no 'brand' TEXT column
    HAVING AVG(rating) < 3.0
),
deactivated AS (
    UPDATE socelle.affiliate_products ap
    ...
    FROM flagged_brands fb
    WHERE ap.brand = fb.brand  -- would never execute; CTE fails first
      AND ap.is_active = true
    ...
)
```

**After (corrected):**
```sql
WITH flagged_brands AS (
    SELECT b.name AS brand_name, AVG(br.rating) AS avg_rating
    FROM socelle.brand_reviews br
    JOIN socelle.brands b ON b.id = br.brand_id     -- UUID FK join
    GROUP BY b.name
    HAVING AVG(br.rating) < 3.0
),
deactivated AS (
    UPDATE socelle.affiliate_products ap
    ...
    FROM flagged_brands fb
    WHERE ap.brand = fb.brand_name    -- TEXT name match (correct)
      AND ap.is_active = true
    ...
)
```

**Correct join chain (as specified in the task brief):**
`affiliate_products.brand (TEXT)` → `socelle.brands.name (TEXT)` ← `socelle.brands.id (UUID)` ← `brand_reviews.brand_id (UUID FK)`

**Status:** Fixed in place in `AFFILIATE_MIGRATION.sql`.

---

### Fix 2 (Critical, secondary): `get_affiliate_sentiment_warnings()` — Same Join Bug

**File:** `platform/AFFILIATE_MIGRATION.sql`

**Root cause:** The warning-zone function had the identical structural bug as `deactivate_low_sentiment_affiliate_products()`. It joined `socelle.brand_reviews` on `br.brand` (non-existent TEXT column) to find brands in the 3.0–3.5 average rating warning zone.

**Before (buggy):**
```sql
SELECT
    br.brand,                    -- ERROR: no 'brand' column on brand_reviews
    ROUND(AVG(br.rating), 2)    AS avg_rating,
    COUNT(br.id)                AS review_count,
    COUNT(ap.id)                AS active_products
FROM socelle.brand_reviews br
JOIN socelle.affiliate_products ap
    ON ap.brand = br.brand AND ap.is_active = true  -- ERROR: br.brand does not exist
GROUP BY br.brand
HAVING AVG(br.rating) >= 3.0 AND AVG(br.rating) < 3.5
```

**After (corrected):**
```sql
SELECT
    b.name                          AS brand,
    ROUND(AVG(br.rating), 2)        AS avg_rating,
    COUNT(br.id)                    AS review_count,
    COUNT(ap.id)                    AS active_products
FROM socelle.brand_reviews br
JOIN socelle.brands b ON b.id = br.brand_id          -- UUID FK join
JOIN socelle.affiliate_products ap
    ON ap.brand = b.name AND ap.is_active = true      -- TEXT name match (correct)
GROUP BY b.name
HAVING AVG(br.rating) >= 3.0 AND AVG(br.rating) < 3.5
```

**Status:** Fixed in place in `AFFILIATE_MIGRATION.sql`.

---

### Fix 3 (Minor, pre-existing, no change needed): `set_updated_at()` Duplication

**Files:** `BRAND_PROFILES_MIGRATION.sql` (line 462) and `AFFILIATE_MIGRATION.sql` (line 438)

Both files define `socelle.set_updated_at()` using `CREATE OR REPLACE FUNCTION`, which is idempotent. The AFFILIATE_MIGRATION.sql file already uses `CREATE OR REPLACE FUNCTION` — confirmed at line 438. Running both migrations in sequence will silently re-define the same function, which is safe. Agent 7 flagged this as a code smell (Issue 3 in PLATFORM_MODEL_INTEGRATION_INDEX.md Section 7). No change required for correctness; extraction to a shared baseline migration is recommended as a follow-up improvement but not a blocking issue.

**Status:** No code change applied. Documented for follow-up (extract to `0073_socelle_shared_functions.sql`).

---

## Section 2: Model Completeness Results

### Attract Surfaces

| Surface | Documented | Location | Notes |
|---|---|---|---|
| Education content hub | ✅ | WAVE1_BUILD_STRATEGY_UPDATED.md (item 3), WORKING_CHANNEL_ROADMAP_UPDATED.md (Wave 1 pages), SOCELLE_AUTOMATION_SPEC.md (surface 6) | 22 mock content items in existing codebase, indexed by category and CE credit availability |
| Industry news feed | ✅ | WAVE1_BUILD_STRATEGY_UPDATED.md (item 1), SOCELLE_AUTOMATION_SPEC.md (surface 2, Queue 2: `socelle-aggregate-news`), WORKING_CHANNEL_ROADMAP_UPDATED.md | 33+ RSS feeds, every 6 hours, editorial featured slot |
| Public brand intelligence pages (/brands/[slug]) | ✅ | WAVE1_BUILD_STRATEGY_UPDATED.md (item 6), SOCELLE_BRAND_PROFILES_SPEC.md (complete spec), BRAND_PROFILES_MIGRATION.sql | 500+ auto-generated pages at launch, full SEO spec, claim CTA |
| Events calendar (/events) | ✅ | WAVE1_BUILD_STRATEGY_UPDATED.md (item in site architecture), SOCELLE_EVENTS_SPEC.md (complete spec), EVENTS_MIGRATION.sql | 17+ sources, 350–600 events/year, Queue 1: `socelle-crawl-events` |
| Live market signals / trend data | ✅ | WAVE1_BUILD_STRATEGY_UPDATED.md (automation surface 5), SOCELLE_AUTOMATION_SPEC.md (UC-7, Queue 8: `socelle-compute-brand-scores`) | Google Trends + social hashtag volume + Reddit velocity; materialized views `mv_trend_scores`, `mv_brand_trend_profile` |
| Polls and community data | ✅ | WAVE1_BUILD_STRATEGY_UPDATED.md (automation surface 9), WORKING_CHANNEL_ROADMAP_UPDATED.md (new tables: `polls`, `poll_votes`), SOCELLE_AUTOMATION_SPEC.md (Queue 7: `socelle-generate-polls`) | LLM-assisted generation, human approval required before publish |

All 6 attract surfaces: ✅ COMPLETE

---

### Retain Mechanisms

| Mechanism | Documented | Location | Notes |
|---|---|---|---|
| Daily briefing email (personalized) | ✅ | WAVE1_BUILD_STRATEGY_UPDATED.md (automation), WORKING_CHANNEL_ROADMAP_UPDATED.md (retention table), SOCELLE_AUTOMATION_SPEC.md (Queue 9: `socelle-send-briefings`) | Segmented by specialty via Brevo; Resend for transactional send |
| RSVP / save events with reminders | ✅ | SOCELLE_EVENTS_SPEC.md (event_saves table, personalized digest), EVENTS_MIGRATION.sql (`socelle.event_saves` table) | One save per user per event (unique constraint), weekly digest email |
| Profile personalization (specialty + location) | ✅ | WORKING_CHANNEL_ROADMAP_UPDATED.md (Explore Profile, new tables: `explore_profiles`), WAVE1_BUILD_STRATEGY_UPDATED.md (Wave 1 item 5), SOCELLE_AUTOMATION_SPEC.md (Queue 6: `socelle-enrich-profiles`) | 5-step onboarding flow, auto-enrichment from public license databases |
| Brand profile freshness (weekly updates) | ✅ | WAVE1_BUILD_STRATEGY_UPDATED.md (automation surface 1, monthly refresh + quarterly top-50 editorial), SOCELLE_AUTOMATION_SPEC.md (Queue 4: `socelle-assemble-brand-profiles` monthly, Queue 8 daily score refresh) | Stale data shown with age indicator; never hidden |
| Affiliate recommendations refresh | ✅ | WAVE1_BUILD_STRATEGY_UPDATED.md (automation surface 7, weekly), SOCELLE_AFFILIATE_SPEC.md (editorial curation workflow), WORKING_CHANNEL_ROADMAP_UPDATED.md (retention table: bi-weekly) | Bi-weekly curated refresh; 1 hr/week editorial curation |
| CE credit tracking | ✅ | WORKING_CHANNEL_ROADMAP_UPDATED.md (portal CE Credits page, WO-20 complete), SOCELLE_EVENTS_SPEC.md (`ce_credits_available`, `ce_credits_count` columns, NCEA/ASCP sources) | CE credit tracking exists in the portal (/portal/ce-credits); events system feeds CE data via specialty_tags and ce_credits_count |
| Benchmark comparisons (operator vs. peers) | ✅ | WAVE1_BUILD_STRATEGY_UPDATED.md (audience attract path), SOCELLE_AUTOMATION_SPEC.md (UC-4: `mv_business_scores`, UC-5: `mv_metro_benchmarks`) | WO-19 (Operator Benchmarking Dashboard) already built in codebase |
| Poll participation + results | ✅ | WORKING_CHANNEL_ROADMAP_UPDATED.md (new tables: `polls`, `poll_votes`), SOCELLE_AUTOMATION_SPEC.md (Queue 7: `socelle-generate-polls`, auto-publish permanently disabled) | Polls embedded in feed; 2–3 per week; brand-sponsored poll path via Stream 1 |
| Notification center | ✅ | WO-18 (Notification System) complete per CLAUDE.md wave tracker; NotificationCenter bell wired into all 3 portal layouts | Not in this spec stack (pre-existing WO), but confirmed complete |
| Saved intelligence / watchlist | ⚠️ | Not explicitly documented as a standalone retain mechanism in the new spec stack | `event_saves` covers events. A general "saved intelligence" or brand watchlist feature for the public intelligence portal is not specified in any of the 10 documents. Suggested addition: `socelle.saved_brands` table for public-profile watchlist. |

9 of 10 retain mechanisms: ✅ DOCUMENTED. 1 gap identified:
- **Gap:** Saved intelligence / watchlist for the public portal (not the business portal). Event saves are covered. Brand watchlist / content saves for unauthenticated or logged-in public users are not specified. Recommended action: Add a `socelle.saved_brands` table and a `socelle.saved_feed_items` table spec, or explicitly note that this feature is deferred to a post-Wave-1 enhancement.

---

### Monetize Streams

| Stream | Documented | Pricing | Location | Notes |
|---|---|---|---|---|
| Stream 0: Affiliate commerce | ✅ | Commission-based; 4–15% per network; $2K–$10K/mo aggregate at scale | SOCELLE_AFFILIATE_SPEC.md (complete), AFFILIATE_MIGRATION.sql (schema), WAVE1_BUILD_STRATEGY_UPDATED.md (Revenue Model section) | Placement map: 7 surfaces documented. Max 2 per page enforced. |
| Stream 1: Poll sponsorship | ✅ | $1,000–$5,000 per placement | WAVE1_BUILD_STRATEGY_UPDATED.md (Stream 1), WORKING_CHANNEL_ROADMAP_UPDATED.md (Stream 1 section) | Activation Month 2–3. Pricing consistent across both docs. |
| Stream 2: Brand intelligence reports | ✅ | $500–$5,000 per report | WAVE1_BUILD_STRATEGY_UPDATED.md (Stream 2), WORKING_CHANNEL_ROADMAP_UPDATED.md (Stream 2 section) | Activation Month 3–4. Pricing consistent across both docs. |
| Stream 3: Sponsored quizzes | ✅ | $5,000–$25,000 per study | WAVE1_BUILD_STRATEGY_UPDATED.md (Stream 3), WORKING_CHANNEL_ROADMAP_UPDATED.md (Stream 3 section) | Activation Month 4–6. Pricing consistent across both docs. |
| Stream 4: Brand claim subscriptions | ✅ | $199–$999/mo (Basic/Pro/Enterprise) | SOCELLE_BRAND_CLAIM_SPEC.md (complete), WAVE1_BUILD_STRATEGY_UPDATED.md (Revenue Model), WORKING_CHANNEL_ROADMAP_UPDATED.md (Stream 4), BRAND_PROFILES_MIGRATION.sql (monthly_price_cents constraint) | Pricing confirmed consistent — see Section 3 for detailed consistency check. |
| Stream 5: Premium operator subscriptions | ✅ | $49–$149/mo | WAVE1_BUILD_STRATEGY_UPDATED.md (Stream 5), WORKING_CHANNEL_ROADMAP_UPDATED.md (Stream 5 section) | Activation Month 6+. No dedicated spec document yet — acknowledged as in-progress in source docs. |

All 6 revenue streams: ✅ DOCUMENTED with pricing.

---

### Automate Surfaces

| Surface | Queue | Documented | Notes |
|---|---|---|---|
| Brand profiles auto-assembly | Queue 4: `socelle-assemble-brand-profiles` | ✅ | SOCELLE_AUTOMATION_SPEC.md Section 2. Monthly cadence. 8 pipeline use cases feed the assembly. |
| News RSS aggregation | Queue 2: `socelle-aggregate-news` | ✅ | 33+ feeds, every 6 hours, priority 8 (highest). SOCELLE_AUTOMATION_SPEC.md. |
| Events extraction | Queue 1: `socelle-crawl-events` | ✅ | 17 sources (Events Spec) / 14+ (Automation Spec — minor discrepancy, see Section 3). Weekly. |
| Category intelligence (materialized views) | Queue 8: `socelle-compute-brand-scores` | ✅ | Daily refresh of `mv_brand_sentiment`, `mv_brand_adoption`, `mv_brand_trend_profile`. UC-4 and UC-5 from shared pipeline. |
| Trend intelligence | Queue 3: `socelle-crawl-reddit` + shared UC-7 | ✅ | Google Trends + social hashtags + Reddit velocity. Weekly lifecycle review. |
| Education content index | Shared UC-8 pipeline | ✅ | YouTube Data API + RSS + PubMed + CE catalog scrape. Daily new content detection. |
| Affiliate auto-matching | Queue 5: `socelle-match-affiliates` | ✅ | Weekly; creates `status = 'pending_review'` placements only — human approves before publish. |
| Profile enrichment | Queue 6: `socelle-enrich-profiles` | ✅ | Event-triggered on signup. State license databases + social bios. Priority 7. |
| Poll generation (LLM draft, human review) | Queue 7: `socelle-generate-polls` | ✅ | MWF 8:00 AM ET. Auto-publish permanently disabled at database level via trigger. Human approval required. |
| Brand page analytics | Continuous event-driven + nightly aggregation | ✅ | `socelle.brand_page_analytics` table, `increment_brand_analytics()` function, nightly pg-boss job at 02:00 UTC. |

All 10 automation surfaces: ✅ DOCUMENTED.

---

### New Data Surfaces

| Surface | Status | Notes |
|---|---|---|
| Brand profiles: auto-generated + claimed sections spec'd | ✅ | SOCELLE_BRAND_PROFILES_SPEC.md covers both states completely. BRAND_PROFILES_MIGRATION.sql has all 5 tables + 2 materialized views. |
| Events: extraction + schema + SEO + cross-surface integration | ✅ | SOCELLE_EVENTS_SPEC.md covers 17 sources, normalization, deduplication. EVENTS_MIGRATION.sql has 5 tables. SEO template in WAVE1_BUILD_STRATEGY_UPDATED.md. Affiliate cross-surface integration in SOCELLE_AFFILIATE_SPEC.md. |
| Affiliate: 7 placement surfaces + trust guardrails + tracking | ✅ | SOCELLE_AFFILIATE_SPEC.md covers all 7 surfaces with max-per-page rules. Trust guardrails documented (all labeled "Socelle Pick," max 2 per page, `/about/recommendations` transparency page). Tracking via `affiliate_clicks` table with revenue firewall (service_role only). |

All new data surfaces: ✅ COMPLETE.

---

## Section 3: Contradiction Scan Results

### Check 1: Pricing Consistency — "$199/mo Basic" across documents

**Documents checked:** SOCELLE_BRAND_CLAIM_SPEC.md vs. SOCELLE_BRAND_PROFILES_SPEC.md vs. WAVE1_BUILD_STRATEGY_UPDATED.md vs. WORKING_CHANNEL_ROADMAP_UPDATED.md vs. BRAND_PROFILES_MIGRATION.sql

**Result: ✅ CONSISTENT across all documents**

| Document | Basic | Pro | Enterprise |
|---|---|---|---|
| SOCELLE_BRAND_PROFILES_SPEC.md (Revenue Model section) | $199/mo | $499/mo | $999/mo |
| SOCELLE_BRAND_CLAIM_SPEC.md (Section 2 tier matrix) | $199/mo | $499/mo | $999/mo |
| WAVE1_BUILD_STRATEGY_UPDATED.md (Stream 4 table) | $199/mo | $499/mo | $999/mo |
| WORKING_CHANNEL_ROADMAP_UPDATED.md (Brand Claim Subscriptions) | $199/mo | $499/mo | $999/mo |
| BRAND_PROFILES_MIGRATION.sql (monthly_price_cents constraint) | 19900 ($199) | 49900 ($499) | 99900 ($999) |

All five documents are in exact agreement. No pricing contradiction found.

---

### Check 2: Table Name Consistency — `socelle.events`

**Documents checked for `socelle.events` table name:** SOCELLE_AUTOMATION_SPEC.md, SOCELLE_EVENTS_SPEC.md, SOCELLE_AFFILIATE_SPEC.md

**Result: ✅ CONSISTENT**

All three documents use `socelle.events` consistently when referring to the events table. EVENTS_MIGRATION.sql creates `socelle.events` as the canonical name. SOCELLE_AUTOMATION_SPEC.md Queue 1 references `socelle.events` and `socelle.crawl_logs`. SOCELLE_AFFILIATE_SPEC.md references `socelle.events` as a surface entity for affiliate placements. No inconsistency found.

---

### Check 3: Queue Name Consistency

**Queues checked:** `socelle-crawl-events`, `socelle-aggregate-news`, `socelle-match-affiliates`

**Result: ✅ CONSISTENT with one minor note**

| Queue Name | SOCELLE_AUTOMATION_SPEC.md | SOCELLE_EVENTS_SPEC.md | SOCELLE_AFFILIATE_SPEC.md | PLATFORM_MODEL_INTEGRATION_INDEX.md |
|---|---|---|---|---|
| `socelle-crawl-events` | Queue 1 ✅ | Referenced as Queue 1 ✅ | Referenced ✅ | Section 5 ✅ |
| `socelle-aggregate-news` | Queue 2 ✅ | Not applicable | Not applicable | Section 5 ✅ |
| `socelle-match-affiliates` | Queue 5 ✅ | Not applicable | Referenced as automation worker ✅ | Section 5 ✅ |

Queue names are identical across all documents. No contradiction found.

**Minor note (pre-existing, from Agent 7 Issue 1):** SOCELLE_EVENTS_SPEC.md documents 17 primary sources for events extraction. SOCELLE_AUTOMATION_SPEC.md Queue 1 description reads "14+ sources" and lists 14 sources. Sources 15 (Dermascope), 16 (Skin Inc), and 17 (ABMP) are in the Events Spec but absent from the Automation Spec Queue 1 list. The Events Spec is the authoritative source; SOCELLE_AUTOMATION_SPEC.md Queue 1 should be updated to read "17+ sources" — this is a documentation gap, not a build-blocking issue.

---

### Check 4: "Intelligence Hub" Language Audit

**Search performed across all 10 documents for "intelligence hub" (body text).**

**Result: ✅ ZERO violations found in body text**

WORKING_CHANNEL_ROADMAP_UPDATED.md header explicitly notes: "All instances of 'intelligence hub' replaced with 'intelligence portal'" — this replacement was applied as part of the Agent 1 update (CHANGE_LOG.md confirms this as Change 2 for that document).

The only documented occurrence of "intelligence hub" in the document stack is in the CHANGE_LOG.md in the context of documenting the replacement that was made: "All instances of 'intelligence hub' replaced with 'intelligence portal'." This is a historical change note — not a violation.

The term used throughout all body text is: **"intelligence portal"** — which is correct per platform positioning.

No remediation needed.

---

### Check 5: Affiliate Page Cap — `can_add_placement()` Function Enforcement

**Document:** AFFILIATE_MIGRATION.sql, lines 558–575

**Result: ✅ CORRECTLY ENFORCES 2-PLACEMENT CAP**

The function is:

```sql
CREATE OR REPLACE FUNCTION socelle.can_add_placement(
    p_surface_type      TEXT,
    p_surface_entity_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT COUNT(*) < 2
    FROM socelle.affiliate_placements
    WHERE surface_type      = p_surface_type
      AND (
              (p_surface_entity_id IS NULL AND surface_entity_id IS NULL)
          OR  (surface_entity_id = p_surface_entity_id)
      )
      AND is_active = true;
$$;
```

Analysis:
- Returns `TRUE` if active placement count for the surface/entity combination is less than 2
- Returns `FALSE` (blocking) if count is already 2 or more
- Handles both global placements (`surface_entity_id IS NULL`) and entity-scoped placements correctly
- Only counts `is_active = true` placements (deactivated placements do not count toward the cap)
- Must be called by the application layer before INSERT — it is not a database constraint. This is documented in the function comment and the `affiliate_placements` table comment. The `position INT CHECK (position IN (1, 2))` column also enforces that no more than 2 positions (1 and 2) can exist per surface/entity pair, providing a second layer of enforcement.

**No issue found.** The function logic correctly implements the 2-per-page cap.

---

### Check 6: CE Credits — Events Spec vs. Existing Portal CE Tracking System

**Result: ✅ COMPATIBLE — minimal integration note**

The existing portal CE credit tracking system (WO-20, `/portal/ce-credits`) tracks CE credits earned by professionals through their portal activity. The SOCELLE_EVENTS_SPEC.md documents CE credit data at the event level: `ce_credits_available BOOLEAN`, `ce_credits_count NUMERIC(5,1)`, `ce_provider TEXT` extracted from event listings.

These two systems are complementary:
- The events system captures what CE credits are available at external events (NCEA, ASCP, state board CE)
- The portal CE tracking system (WO-20) tracks what CE credits a professional has earned through SOCELLE portal activities

The two systems do not conflict. However, there is a documented gap: no spec explicitly describes how a professional's attendance at a SOCELLE-indexed event is recorded in their CE credit tracking history. The bridge between "event discovered on SOCELLE" and "CE credit logged in portal" is not specified in any of the 10 documents.

**Recommended addition:** A `socelle.event_ce_completions` table or a field on `socelle.event_saves` (`ce_completed BOOLEAN`, `ce_completion_date`) that allows a professional to mark a saved event as completed and log the CE hours to their `/portal/ce-credits` tracker. This is a post-Wave-1 enhancement — the events system as specified is independently valuable without this bridge.

---

### Additional Contradiction Found: User Profile FK Inconsistency

**Documents:** AFFILIATE_MIGRATION.sql vs. BRAND_PROFILES_MIGRATION.sql vs. EVENTS_MIGRATION.sql

**Result:** ⚠️ MINOR INCONSISTENCY (pre-documented by Agent 7 as Issue 4)

`socelle.affiliate_clicks.user_id` references `auth.users(id)` with `ON DELETE SET NULL`. All other user-facing tables in the spec stack reference `socelle.user_profiles(id)`. This deliberate difference is noted in the PLATFORM_MODEL_INTEGRATION_INDEX.md Section 7 (Issue 4) with the correct rationale: click records need only the auth identity for anonymization on account deletion. No change required — documentation clarification is the appropriate fix (a SQL comment in AFFILIATE_MIGRATION.sql explaining the choice).

**Severity:** Minor. No functional impact. Recommended fix: Add the explanatory comment to AFFILIATE_MIGRATION.sql in a follow-up.

---

### Additional Check: Brevo vs. Resend Email Provider Split

**Documents:** WORKING_CHANNEL_ROADMAP_UPDATED.md vs. SOCELLE_AUTOMATION_SPEC.md (Queue 9)

**Result:** ⚠️ MAJOR GAP — architecture decision undocumented (pre-documented by Agent 7 as Issue 2)

WORKING_CHANNEL_ROADMAP_UPDATED.md specifies Brevo as the CRM/email/SMS platform. SOCELLE_AUTOMATION_SPEC.md specifies Resend (primary) + SendGrid (fallback) for `socelle-send-briefings`. These are not mutually exclusive, but the split architecture (Brevo for CRM/segmentation, Resend for transactional high-volume send) is not documented anywhere as an explicit decision.

**Severity:** Major for engineering planning. Does not affect the SQL migrations or the spec documents reviewed here. Needs a decision memo before engineering begins on Queue 9.

**Recommended action:** Create a one-paragraph infrastructure decision record confirming: "Brevo = CRM layer (contact management, Explore Profile attributes, list segmentation). Resend = transactional send layer (daily briefing volume). These operate in tandem." Add this to SOCELLE_AUTOMATION_SPEC.md Section 7 (open questions) or to a new infrastructure decisions document.

---

## Section 4: Orphaned Reference Results

### URL Pattern Orphan Check

| URL Pattern | Spec? | SQL Schema? | Status |
|---|---|---|---|
| `/brands/[slug]` | ✅ SOCELLE_BRAND_PROFILES_SPEC.md | ✅ `socelle.brand_profiles` | Complete |
| `/brands/[slug]/claim` | ✅ SOCELLE_BRAND_CLAIM_SPEC.md (Step 2 route: `/brands/[slug]/claim`) | ✅ `socelle.brand_claims` | Complete |
| `/events` | ✅ SOCELLE_EVENTS_SPEC.md | ✅ `socelle.events` | Complete |
| `/events/[slug]` | ✅ SOCELLE_EVENTS_SPEC.md | ✅ `socelle.events.slug` column | Complete |
| `/about/recommendations` | ⚠️ Mentioned as trust guardrail transparency page in WAVE1_BUILD_STRATEGY_UPDATED.md and SOCELLE_AFFILIATE_SPEC.md — but no page spec exists for this route | No SQL needed (static page) | Minor gap — page content spec needed |
| `/pro/[username]` | ⚠️ Listed in WORKING_CHANNEL_ROADMAP_UPDATED.md Wave 1 pages table as P1 | No SQL in this update (uses existing `user_profiles`) | Deferred — not in scope of this update |

**Summary:**
- ✅ `/brands/[slug]/claim` is spec'd in SOCELLE_BRAND_CLAIM_SPEC.md — no orphan
- ⚠️ `/about/recommendations` is referenced but not spec'd. Minor gap. Static page; no migration required.
- ⚠️ `/pro/[username]` is referenced in WORKING_CHANNEL_ROADMAP_UPDATED.md but deferred — acknowledged in that document as P1

---

### pg-boss Queue Orphan Check

All 10 queues named in SOCELLE_AUTOMATION_SPEC.md are accounted for in the integration index (PLATFORM_MODEL_INTEGRATION_INDEX.md Section 5). No queue names appear in any spec document that are absent from SOCELLE_AUTOMATION_SPEC.md's registry.

One queue name note: SOCELLE_AUTOMATION_SPEC.md references a `socelle-check-affiliate-sentiment` job in the comment header of `deactivate_low_sentiment_affiliate_products()` in AFFILIATE_MIGRATION.sql. This queue name does not appear in the 10-queue registry in SOCELLE_AUTOMATION_SPEC.md. The nightly sentiment check is described functionally in the Automation Spec (Queue 5: `socelle-match-affiliates` includes sentiment checking as a step), but the specific job name `socelle-check-affiliate-sentiment` is not registered as a standalone queue.

**Status:** ⚠️ Minor. Either (a) `socelle-check-affiliate-sentiment` is a sub-step of Queue 5 called as a function and does not need its own queue registration, or (b) it requires a dedicated nightly queue entry (priority 5, nightly at 03:00 AM ET). Recommend clarifying in SOCELLE_AUTOMATION_SPEC.md.

---

### Foreign Key Orphan Check

All FK references across the three migration files are accounted for:

| FK Reference | Source Table | Target Table | Defined In | Status |
|---|---|---|---|---|
| `brand_profiles.brand_id → socelle.brands(id)` | BRAND_PROFILES_MIGRATION.sql | Pre-existing WO-10 migration | N/A | ✅ |
| `brand_profiles.claimed_by → socelle.user_profiles(id)` | BRAND_PROFILES_MIGRATION.sql | Pre-existing auth migration | N/A | ✅ |
| `brand_claims.brand_id → socelle.brands(id)` | BRAND_PROFILES_MIGRATION.sql | Pre-existing WO-10 migration | N/A | ✅ |
| `brand_claims.claimant_user_id → socelle.user_profiles(id)` | BRAND_PROFILES_MIGRATION.sql | Pre-existing auth migration | N/A | ✅ |
| `brand_posts.brand_id → socelle.brands(id)` | BRAND_PROFILES_MIGRATION.sql | Pre-existing WO-10 migration | N/A | ✅ |
| `brand_reviews.brand_id → socelle.brands(id)` | BRAND_PROFILES_MIGRATION.sql | Pre-existing WO-10 migration | N/A | ✅ |
| `brand_page_analytics.brand_id → socelle.brands(id)` | BRAND_PROFILES_MIGRATION.sql | Pre-existing WO-10 migration | N/A | ✅ |
| `event_saves.user_id → socelle.user_profiles(id)` | EVENTS_MIGRATION.sql | Pre-existing auth migration | N/A | ✅ |
| `events.organizer_brand_id → socelle.brands(id)` | EVENTS_MIGRATION.sql | Pre-existing WO-10 migration | N/A | ✅ |
| `affiliate_placements.affiliate_product_id → socelle.affiliate_products(id)` | AFFILIATE_MIGRATION.sql | AFFILIATE_MIGRATION.sql | Same file ✅ | ✅ |
| `affiliate_clicks.placement_id → socelle.affiliate_placements(id)` | AFFILIATE_MIGRATION.sql | AFFILIATE_MIGRATION.sql | Same file ✅ | ✅ |
| `affiliate_clicks.user_id → auth.users(id)` | AFFILIATE_MIGRATION.sql | Supabase auth (always exists) | N/A | ✅ |
| `deactivate_low_sentiment...() → socelle.brand_reviews` | AFFILIATE_MIGRATION.sql (function) | BRAND_PROFILES_MIGRATION.sql | Execution order dependency | ✅ (with correct order) |
| `deactivate_low_sentiment...() → socelle.brands` | AFFILIATE_MIGRATION.sql (function) | Pre-existing WO-10 migration | N/A | ✅ |

All FK references are valid. No orphaned FK references found.

**Important note:** `AFFILIATE_MIGRATION.sql` must be run AFTER `BRAND_PROFILES_MIGRATION.sql` because the sentiment functions query `socelle.brand_reviews`. The correct execution order is documented in PLATFORM_MODEL_INTEGRATION_INDEX.md Section 8: Events → Brand Profiles → Affiliate.

---

## Section 5: Language Audit Results

### "Intelligence Hub" Instances

**Search across all 10 output documents:**

| Document | "intelligence hub" occurrences in body text |
|---|---|
| WAVE1_BUILD_STRATEGY_UPDATED.md | 0 |
| WORKING_CHANNEL_ROADMAP_UPDATED.md | 0 (header note confirms replacement was applied) |
| SOCELLE_BRAND_PROFILES_SPEC.md | 0 |
| BRAND_PROFILES_MIGRATION.sql | 0 (SQL file, n/a) |
| SOCELLE_BRAND_CLAIM_SPEC.md | 0 |
| SOCELLE_EVENTS_SPEC.md | 0 |
| EVENTS_MIGRATION.sql | 0 (SQL file, n/a) |
| SOCELLE_AFFILIATE_SPEC.md | 0 |
| AFFILIATE_MIGRATION.sql | 0 (SQL file, n/a) |
| SOCELLE_AUTOMATION_SPEC.md | 0 |
| PLATFORM_MODEL_INTEGRATION_INDEX.md | 0 |
| CHANGE_LOG.md | 1 — in change documentation only: "all instances of 'intelligence hub' replaced with 'intelligence portal'" |

**Result: 0 violations in body text. 1 historical reference in CHANGE_LOG.md (acceptable — documents the change that was made, not a positioning statement).**

---

### "Marketplace" Usage Audit

The word "marketplace" appears in several documents. Per the intelligence-first thesis, "marketplace" is not prohibited — it is the correct term for Wave 2 commerce activation. Usage is checked to ensure it is appropriately subordinated to intelligence.

**Compliant usages found:**
- WORKING_CHANNEL_ROADMAP_UPDATED.md: "We are pausing the SOCELLE marketplace app build" — correct framing, marketplace explicitly deferred
- WAVE1_BUILD_STRATEGY_UPDATED.md: "Full marketplace activation... Wave 2" in "What Is NOT in Wave 1" — correct
- WORKING_CHANNEL_ROADMAP_UPDATED.md: "Not a marketplace (that's Wave 2)" in "What we DON'T say we are" — correct
- PLATFORM_MODEL_INTEGRATION_INDEX.md: "$150K–$300K revenue (intelligence reports + brand claims + affiliate + marketplace commission)" — marketplace commission listed last, correct hierarchy

**Result: ✅ No positioning violations. "Marketplace" used correctly in all instances — always subordinated to intelligence, always positioned as Wave 2.**

---

### "SaaS" vs. "Intelligence Platform" Language Audit

The term "SaaS" appears in context of the revenue model description for recurring subscription streams (Stream 4 and Stream 5 are described as "SaaS MRR"). This is technically accurate (recurring software subscription revenue) and does not contradict the intelligence-first positioning.

The primary positioning language throughout all documents uses:
- "intelligence portal" (primary term — consistent)
- "intelligence platform" (appears in WAVE1_BUILD_STRATEGY_UPDATED.md and WORKING_CHANNEL_ROADMAP_UPDATED.md)
- "living beauty intelligence portal" (thesis statement in WAVE1_BUILD_STRATEGY_UPDATED.md)

**Result: ✅ No positioning violations. "SaaS" used only in revenue-model context; primary positioning language is intelligence-first throughout.**

---

## Section 6: Final Certification

```
## QA Certification — SOCELLE Platform Model Update

Date: March 4, 2026
QA Agent: Agent 8 — Model Alignment

PLATFORM MODEL: ✅ COMPLETE
- All 6 attract surfaces documented across the spec stack
- 9 of 10 retain mechanisms documented; 1 minor gap (public-portal saved content/watchlist)
- All 6 revenue streams documented with pricing (confirmed consistent across all documents)
- All 10 automation surfaces documented with pg-boss queue registrations
- All 13 new database tables defined with production-quality SQL migrations

CRITICAL BUGS: 0 remaining / 2 fixed
  - Fix 1: deactivate_low_sentiment_affiliate_products() — corrected brand_reviews join to go
    through socelle.brands via brand_id UUID FK, then match affiliate_products.brand on brands.name
  - Fix 2: get_affiliate_sentiment_warnings() — same join pattern corrected

MAJOR ISSUES: 0 remaining / 1 flagged for human decision
  - Email provider architecture (Brevo CRM + Resend transactional send) is undocumented
    as an explicit decision. Not blocking; requires a one-paragraph decision record
    before Queue 9 (socelle-send-briefings) engineering begins.

MINOR ISSUES: 6 — documented above, none blocking
  1. set_updated_at() duplication — extract to 0073_socelle_shared_functions.sql (follow-up)
  2. affiliate_clicks FK to auth.users vs. socelle.user_profiles — add explanatory SQL comment
  3. Events source count: 17 (Events Spec) vs. 14+ (Automation Spec Queue 1) — update Automation Spec
  4. /about/recommendations page spec missing — static page, write content spec before launch
  5. socelle-check-affiliate-sentiment queue not registered — clarify as Queue 5 sub-step or add queue
  6. CE credit bridge: no spec for recording event attendance in portal CE tracker — deferred to Wave 2

LANGUAGE AUDIT: ✅ CLEAN
  - "intelligence hub": 0 violations in body text
  - "marketplace": used correctly throughout, subordinated to intelligence-first framing
  - "SaaS": used correctly in revenue model context only

DOCUMENT STACK STATUS: ✅ READY FOR DEVELOPER HANDOFF

The SOCELLE platform model update is complete. The documentation stack accurately represents
the full platform model: attract → retain → monetize, with 90% automation and a 6–8 hr/week
human editorial budget.

Two SQL functions with critical runtime bugs have been fixed in AFFILIATE_MIGRATION.sql.
All other documents are accurate as authored by Agents 1–7, with minor gaps documented above.

Recommended next step: Begin Phase 1 database migrations in the sequence specified in
PLATFORM_MODEL_INTEGRATION_INDEX.md Section 8:
  1. Verify baseline migrations (socelle.brands, socelle.user_profiles)
  2. Run EVENTS_MIGRATION.sql
  3. Run BRAND_PROFILES_MIGRATION.sql
  4. Run AFFILIATE_MIGRATION.sql (now with corrected sentiment functions)
  5. Seed brand catalog (56 brands per SOCELLE_BRAND_PROFILES_SPEC.md Section 4)
  6. Seed affiliate product catalog (50 hero products with human relevance scores)
```

---

*QA Report prepared by Agent 8 — Model Alignment Agent*
*March 4, 2026*
*SOCELLE Platform Model Update — all critical bugs resolved, model completeness verified*
