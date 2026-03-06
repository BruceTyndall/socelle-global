# Content Strategy & Trends Page — Deep Dive

**Purpose:** Define marketing-savvy content rules, the role of the Insights page, and how to use APIs to port in latest professional beauty trends. Aligns with COMMUNITY_NEWS_AND_BEAUTY_INTELLIGENCE_DEEP_DIVE and the Master Prompt.

---

## 1. Content tone: education and excitement first

### 1.1 Principles

- **Lead with education and excitement.** Copy should make professionals feel they’re learning and that the platform is the place for “what’s next” in professional beauty.
- **No “reps” language in public marketing.** Don’t reference sales reps, rep visits, or rep-driven workflows. Use “direct relationships,” “your storefront,” “one platform,” “scattered touchpoints,” “manual processes,” or “distribution” instead. Reserve “reps” for internal or backend contexts only (e.g. admin, CRM).
- **No public brand pricing until login.** Do not show commission rates (e.g. 8%), reseller fee ($0), or example payout numbers on the public site. Pricing page and home should use “Simple terms,” “Apply to see your rate,” “Free to join — sign in to see pricing.” Brand product prices (wholesale/retail) are only visible to logged-in resellers on storefronts.

### 1.2 Where this applies

| Area | Rule |
|------|------|
| Home | Value props, testimonials, stats: education- and excitement-led; no 8% / $0 in hero or value cards. |
| About | Problem statements: “distribution,” “fragmented,” “manual” — no “reps.” Principles: “simple, transparent economics” without specific numbers. |
| Pricing | Hero + cards: “Simple terms,” “Free to join.” No commission % or dollar amounts. FAQ: “Apply to see your rate.” No example calculation with $ and %. |
| Brand storefront | Product prices and “Add to cart” only for logged-in resellers; guests see “Sign in to see pricing” / “Create free account to unlock wholesale pricing.” |
| Insights | Lead with “Stay ahead of the curve,” trends, and learning — not transactions. |

---

## 2. Key page: Insights (not Pricing as the main “value” page)

### 2.1 Why a separate Insights page

- **Pricing is gated.** We don’t show brand or platform pricing publicly, so Pricing becomes a “How it works” + CTAs (apply / sign up) rather than the main excitement page.
- **Insights = education + excitement.** A dedicated page for trends, ingredients, and market shifts positions Socelle as the place professionals go to stay current. It supports habit and return (see COMMUNITY_NEWS_AND_BEAUTY_INTELLIGENCE_DEEP_DIVE).
- **API-ready.** The Insights page is structured so trend cards can be filled from external APIs (news, RSS, trend datasets) so content stays fresh without manual copy.

### 2.2 Insights page logic

- **Hero:** “Professional beauty intelligence” / “Stay ahead of the curve” — one line on why this matters (trends that matter to pro beauty).
- **Categories:** e.g. Ingredients, Treatment room, Market & regulation. Used as filters or pills for future API-driven content.
- **Latest trends:** Grid of cards. Each card: title, summary, source, date, category. Data shape is API-ready (title, summary, source, date, category).
- **CTA:** Browse brands, Create free account. Optional later: “Get your personalized brief” (sign in).
- **Footer:** Same restrained footer as rest of site.

### 2.3 Personalization (later)

- Signed-in resellers: “Your brief” or “Trends for your brands” (filter by brands they carry).
- Signed-in brands: “Demand pulse” or “Trends in your category.”
- Phase 2–3 per COMMUNITY_NEWS_AND_BEAUTY_INTELLIGENCE_DEEP_DIVE.

---

## 3. APIs and data sources for trends

### 3.1 Goals

- Port in **latest** professional beauty and skincare trends so the Insights page isn’t static.
- Prefer structured APIs or RSS that can be polled or triggered (e.g. Edge Function, cron) and stored or rendered in the app.

### 3.2 Recommended sources (research-aligned)

| Source | Type | Use | Notes |
|--------|------|-----|--------|
| **NewsAPI.org** | REST API | Headlines + summaries for “professional beauty,” “skincare,” “wholesale beauty.” | Requires API key; rate limits on free tier. Filter by keyword and date. |
| **GNews API** | REST API | Same as above; alternative to NewsAPI. | Key required; good for “beauty industry,” “cosmetics,” “professional skincare.” |
| **Google News RSS** | RSS | Curated news for a query (e.g. “professional skincare trends”). | No key; parse RSS in Edge Function or server. |
| **Trade / industry RSS** | RSS | e.g. in-cosmetics, Cosmetic Index, industry blogs. | Manual list of RSS URLs; parse and normalize to card shape. |
| **Cosmetic product / trend datasets** | API or CSV | Ingredient trends, category growth (e.g. “niacinamide,” “peptides”). | Some vendors offer “cosmetic product API” or “beauty trend” data (e.g. Beauty Feeds, XByte, Arctechnolabs). Evaluate for pro-beauty relevance. |
| **RSS Cosmetic (rsscosmetic.com)** | Monitoring / newsletter | Professional monitoring; trend tracking. | Reference for what “pro” trend content looks like; may not offer public API. |

### 3.3 Data shape for Insights cards

Normalize all sources to a single shape so the UI stays simple:

```ts
interface TrendCard {
  id: string;
  title: string;
  summary: string;
  source: string;       // e.g. "Industry report", "GNews", "RSS"
  date: string;        // ISO or "2026"
  category: string;    // e.g. "Ingredients", "Treatment room", "Market"
  url?: string;        // optional link to full article
}
```

### 3.4 Implementation options

- **Option A (quick):** Edge Function or cron job fetches from one API (e.g. NewsAPI or GNews), filters by keywords (“professional beauty,” “skincare,” “cosmetics”), maps to `TrendCard`, stores in Supabase table `insights_trends` (or similar). Frontend reads from Supabase.
- **Option B (richer):** Multiple sources (NewsAPI + 1–2 RSS feeds). Edge Function normalizes to `TrendCard`, dedupes, stores. Optional: cache for 6–24 hours to limit API calls.
- **Option C (no backend yet):** Frontend calls a read-only Edge Function that fetches from one API and returns JSON; no DB. Simpler but less control over caching and rate limits.

### 3.5 Keywords for filtering (professional beauty)

- “professional beauty,” “professional skincare,” “wholesale beauty,” “salon skincare,” “spa skincare,” “cosmetics industry,” “skincare trends,” “ingredient trends,” “treatment room,” “esthetician,” “cosmetology,” “professional cosmetics.”

---

## 4. Summary: what was implemented

- **Tone:** Home, About, Pricing, testimonials updated to education- and excitement-led copy; all public “reps” language removed; no 8% / $0 or example payouts on public site.
- **Pricing page:** Reframed to “Simple terms” and “Free to join” with CTAs to apply or sign in; FAQ and example block no longer expose commission or dollar amounts.
- **Brand storefront:** Product prices and add-to-cart already gated to logged-in resellers (`showPrices = isReseller`).
- **New page:** `/insights` — “Professional beauty intelligence,” “Stay ahead of the curve,” categories, and an API-ready “Latest trends” grid with placeholder data. Route and nav link added.
- **Deep dive:** This doc — content rules, Insights page logic, and API strategy for trends so Gemini or future work can wire real APIs (NewsAPI, GNews, RSS) into the Insights page.

---

## 5. References

- `docs/platform/COMMUNITY_NEWS_AND_BEAUTY_INTELLIGENCE_DEEP_DIVE.md` — Habit loops, brief/pulse, news types.
- `docs/platform/UI_UX_SITE_DESIGN_DEEP_DIVE.md` — Tone and trust.
- Master Prompt Section 10 (Platform Intelligence) and Section 22 (Phases).
