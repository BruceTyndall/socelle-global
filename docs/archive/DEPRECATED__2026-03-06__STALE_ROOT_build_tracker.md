> **DEPRECATED — 2026-03-06**
> This file is no longer authoritative. Replaced by:
> - `SOCELLE-WEB/docs/build_tracker.md` (canonical per CLAUDE.md §D)
>
> Do not reference this file as authority. See `/.claude/CLAUDE.md` §B FAIL 1.

---

# SOCELLE — BUILD TRACKER
**Last Updated:** March 5, 2026 — Wave 10 Session 2
**Source of truth for:** session history, wave status, standup format, next priorities

---

## CURRENT PLATFORM STATE

| Check | Status |
|---|---|
| TypeScript (`npx tsc --noEmit`) | ✅ Zero errors |
| Vite build (`npm run build`) | ✅ Passes — 3.63s |
| `graphite` token | ✅ `#141418` |
| BG token | ✅ `#F6F3EF` |
| `font-serif` on public pages | ✅ 0 instances |
| Banned SaaS phrases | ✅ 0 instances |
| MainNav 8 required links | ✅ All present |
| Auth-aware portal pill | ✅ Implemented |
| RequestAccess → Supabase | ✅ Wired (W9-01) |
| Supabase migrations | ✅ 72 total — ADD ONLY |
| Edge functions deployed | ✅ 7 deployed |
| Events page | ✅ Live Supabase (W10-01) |
| Jobs page + Job Detail | ✅ Live Supabase (W10-02) |
| /insights redirect | ✅ → /intelligence (W10-06) |

---

## WAVE HISTORY

### Waves 1–8 — COMPLETE ✅ (March 3–4, 2026)
- WO-01 through WO-25: All 25 work orders complete
- 97 routes verified. Zero TypeScript errors at Wave 8 end.

### Wave 9 — COMPLETE ✅ (March 5, 2026)

| WO | Title | Status |
|---|---|---|
| W9-01 | Critical Regressions + Nav Fix | ✅ COMPLETE |
| W9-02 | Events Platform Phase 1 | ✅ COMPLETE |
| W9-03 | Jobs Platform Phase 1 Stub | ✅ COMPLETE |
| W9-04 | SEO Foundation (9 missing Helmets) | ✅ COMPLETE |
| W9-05 | Live Data — Signals Infrastructure | ✅ COMPLETE (market_signals table + admin UI deployed) |
| W9-06 | Remove Font-Serif Violations | ✅ COMPLETE |

### Wave 10 — IN PROGRESS 🔄 (March 5, 2026+)

| WO | Title | Status |
|---|---|---|
| W10-01 | Events Supabase table + wire Events.tsx | ✅ COMPLETE |
| W10-02 | Jobs live `job_postings` wire | ✅ COMPLETE |
| W10-03 | Intelligence Hub full live wire | ✅ COMPLETE |
| W10-04 | Home market pulse live wire | ⬜ Pending |
| W10-05 | Pricing → `subscription_plans` table | ⬜ Pending |
| W10-06 | Redirect `/insights` → `/intelligence` | ✅ COMPLETE (already in App.tsx) |
| W10-07 | ForgotPassword + ResetPassword `pro-*` token fix | ⬜ Pending |

---

## CURRENT ISSUES (Wave 10 Remaining)

### 🔴 Fix Before Real Users
| Issue | File | Notes |
|---|---|---|
| ~~Events mock data~~ | ~~`Events.tsx`~~ | ✅ DONE W10-01 — live Supabase |
| ~~Jobs mock data~~ | ~~`Jobs.tsx`, `JobDetail.tsx`~~ | ✅ DONE W10-02 — live Supabase `job_postings` |
| Brand adoption metrics | `BrandStorefront.tsx` | Hardcoded stats — needs DEMO label or live wire |
| ~~Intelligence Hub live wire~~ | ~~`Intelligence.tsx`~~ | ✅ DONE W10-03 — trending_category live, pro-* tokens fixed |
| ~~`Insights.tsx` orphaned~~ | ~~`/insights`~~ | ✅ DONE W10-06 — redirects to `/intelligence` |
| `pro-*` tokens | `ForgotPassword.tsx`, `ResetPassword.tsx` | Auth-critical, low design priority |

### 🟡 Wave 10 — Remaining (Short Term)
- ~~Supabase `events` table + seed 8 events~~ ✅ DONE
- ~~Supabase `job_postings` live listings (remove mock)~~ ✅ DONE W10-02
- ~~Intelligence Hub → full live market_signals wire~~ ✅ DONE W10-03
- Home.tsx market pulse → live signals (currently labeled DEMO)
- `rss_items`, `rss_sources`, `ingredient_data`, `enrichment_profiles` tables
- Pricing.tsx → wire to `subscription_plans` table

### 🔵 Wave 11 — Medium Term (1 month)
- RSS ingestion edge function
- NPI lookup edge function (provider verification)
- Open Beauty Facts sync
- Sitemap generator edge function
- Intelligence briefing edge function
- Jobs search edge function
- Brand claim subscription flow end-to-end

---

## PUBLIC PAGES — CURRENT STATUS

| Page | Route | Design | Data |
|---|---|---|---|
| Home | `/home` | ✅ Pearl V2 | Mock market pulse (labeled DEMO) |
| Intelligence Hub | `/intelligence` | ✅ Pearl V2 | ✅ Supabase live signals — trending_category derived from real data (W10-03) |
| Brands | `/brands` | ✅ Pearl V2 | Supabase `brands` live |
| Brand Storefront | `/brands/:slug` | ✅ Pearl V2 | Supabase live + hardcoded adoption metrics |
| For Buyers | `/for-buyers` | ✅ Pearl V2 | Static |
| For Brands | `/for-brands` | ✅ Pearl V2 | Static |
| For Medspas | `/for-medspas` | ✅ Pearl V2 | Static |
| For Salons | `/for-salons` | ✅ Pearl V2 | Static |
| How It Works | `/how-it-works` | ✅ Pearl V2 | Static |
| Pricing | `/pricing` | ✅ Pearl V2 | Static (hardcoded tiers) |
| About | `/about` | ✅ Pearl V2 | Static |
| Request Access | `/request-access` | ✅ Pearl V2 | ✅ Supabase `access_requests` live |
| FAQ | `/faq` | ✅ Pearl V2 | Static |
| Events | `/events` | ✅ Pearl V2 | ✅ Supabase `events` live (W10-01) |
| Jobs | `/jobs` | ✅ Pearl V2 | ✅ Supabase `job_postings` live (W10-02) |
| Job Detail | `/jobs/:slug` | ✅ Pearl V2 | ✅ Supabase live by slug (W10-02) |
| Protocols | `/protocols` | ✅ Pearl V2 | Supabase live |
| Protocol Detail | `/protocols/:slug` | ✅ Pearl V2 | Supabase live |
| Privacy | `/privacy` | ✅ Pearl V2 | Static |
| Terms | `/terms` | ✅ Pearl V2 | Static |
| Education | `/education` | ✅ Pearl V2 | Supabase `brand_training_modules` live |
| Insights | `/insights` | ✅ Redirects | → `/intelligence` (W10-06) |
| API Docs | `/api/docs` | ✅ Pearl V2 | Static |
| API Pricing | `/api/pricing` | ✅ Pearl V2 | Static |
| Forgot Password | `/forgot-password` | ⚠️ `pro-*` tokens | Supabase Auth — functional |
| Reset Password | `/reset-password` | ⚠️ `pro-*` tokens | Supabase Auth — functional |

---

## SUPABASE STATE

**72 migrations — ADD ONLY policy**

| Resource | Status |
|---|---|
| `brands` table | ✅ Live |
| `businesses` table | ✅ Live |
| `user_profiles` table | ✅ Live |
| `canonical_protocols` table | ✅ Live |
| `orders`, `messages` | ✅ Live |
| `access_requests` | ✅ Live |
| `market_signals` | ✅ Live (W9-05) |
| `events` table | ✅ Live — 8 events seeded (W10-01) |
| `job_postings` | ✅ Live — 12 jobs seeded (W10-02) |
| `rss_items`, `rss_sources` | 🔴 Missing |
| `ingredient_data` | 🔴 Missing |
| `enrichment_profiles` | 🔴 Missing |

**Edge Functions (7 deployed):**
ai-concierge, ai-orchestrator, create-checkout, generate-embeddings, magic-link, send-email, stripe-webhook

**Edge Functions needed:**
rss-ingestion, open-beauty-facts-sync, npi-lookup, sitemap-generator, intelligence-briefing, jobs-search

---

## SESSION LOG

### March 5, 2026 — Wave 9 Execution
- 9-agent parallel audit completed full platform sweep
- MASTER_STATUS.md created as live source of truth
- Wave 9 all 6 WOs complete
- Git SSH setup completed (new ed25519 key → GitHub)
- Agent onboarding chain defined (4-doc chain)
- SessionStart hook configured at `~/.claude/hooks/socelle-onboard.sh`
- `/onboard` slash command created at `.claude/commands/onboard.md`
- `build_tracker.md` written (this file)

### March 5, 2026 — Wave 10 Session 3
- W10-03: Updated useIntelligence.ts — trending_category now derived from most frequent category in live signals (was always mock)
- W10-03: Fixed MarketPulseBar.tsx — replaced pro-charcoal → mn-dark, pro-gold → accent (pro-* violations on public component)
- PREVIEW banner already conditional on isLive — correct, no change needed
- Build: `npx tsc --noEmit` zero errors ✅ | `npm run build` 3.46s ✅
- MASTER_STATUS.md + build_tracker.md updated
- **Next:** W10-04 — Home market pulse live wire

### March 5, 2026 — Wave 10 Session 2
- W10-02: Created `public.job_postings` table (migration 20260305000026)
- W10-02: Seeded 12 real industry jobs (migration 20260305000027)
- W10-02: Rewrote Jobs.tsx — Supabase live query replaces MOCK_JOBS, formatSalary now named export, loading skeleton added
- W10-02: Rewrote JobDetail.tsx — fetches by slug from Supabase, loading skeleton, not-found redirect, removed MOCK_JOBS dependency
- Build: `npx tsc --noEmit` zero errors ✅ | `npm run build` 3.63s ✅
- MASTER_STATUS.md + build_tracker.md updated
- **Next:** W10-04 — Home market pulse live wire

### March 5, 2026 — Wave 10 Session 1
- W10-01: Created `public.events` table (migration 20260305000024)
- W10-01: Seeded 8 real industry events (migration 20260305000025)
- W10-01: Updated Events.tsx — Supabase live query replaces MOCK_EVENTS, loading skeleton added
- W10-06: Confirmed `/insights` → `/intelligence` redirect already in App.tsx (complete)
- Build: `npx tsc --noEmit` zero errors ✅ | `npm run build` 3.84s ✅
- MASTER_STATUS.md + build_tracker.md updated
- **Next:** W10-02 — wire Jobs.tsx to live `job_postings` table

---

## STANDUP FORMAT (for future sessions)

```
## Standup — [Date]
**Last session:** [what was completed]
**Current wave:** Wave [N]
**Active WO:** [WO-XX: title]
**Blockers:** [any TS errors, missing deps, DB issues]
**Next:** [specific next task]
```

---

## AGENT ONBOARDING (reminder)
1. `CLAUDE.md` — rules, tokens, protected routes (auto-loaded)
2. `MASTER_STATUS.md` — live platform state
3. `build_tracker.md` — this file (session history + priorities)
4. `SOCELLE_MASTER_PROMPT_FINAL.md` — deep product spec (amendment block corrects stale content)
