# SOCELLE GLOBAL — ONE SOURCE OF TRUTH
# This file IS the master plan. Every agent reads this FIRST.
# Last updated: March 8, 2026
# Canonical command docs: docs/command/* (20 documents)
# Skills: .claude/skills/ (51 installed, 78 required)

---

## §A — WHAT WE ARE

SOCELLE is a B2B intelligence platform for the professional beauty industry.
Intelligence platform FIRST. Marketplace second. Always.

**One-liner:** "Spate tracks consumers. SOCELLE tracks Licensed Pros."
**Value flow:** Intelligence → Trust → Transaction → Retention (non-negotiable order)
**Revenue model:** Tri-sided — SaaS subscriptions + wholesale affiliate commission + AI add-ons + B2B ad-tech
**Target:** $158,500/mo at 1,000 subscribers (~96% margin)

### Personas

| Persona | What they pay for | Tier |
|---------|------------------|------|
| Operator (spa/salon/medspa owner) | Market intelligence → menu optimization → revenue growth | $49-149/mo |
| Provider (esthetician/stylist/NP) | Signals + protocols + education + career intelligence | $49/mo |
| Brand (beauty company) | Market share + competitive intelligence + R&D Scout + partner enablement | $149-499/mo |
| Student | Treatment demand signals + job market data + education | Free-$49/mo |

### Pricing (locked)

| Tier | Price | Credits | Intelligence | AI tools | Exports |
|------|-------|---------|-------------|----------|---------|
| Free | $0 | 0 | Top 3 national signals, current week | Demo only | None |
| Starter | $49 | 500 | Full national + limited local, 30 days | Explain Signal + Search | CSV |
| Pro | $149 | 2,500 | All regions + historical + local | All 6 tools + briefs + plans | CSV + PDF + branded |
| Enterprise | $499 | 10,000 | Unlimited + API + custom feeds | Unlimited + R&D Scout + MoCRA | All + API + webhook |

---

## §B — CANONICAL AUTHORITY

These documents in `/docs/command/` are the sole source of truth. Nothing overrides them.

| Document | Governs |
|----------|---------|
| `SOCELLE_CANONICAL_DOCTRINE.md` | Platform thesis, style locks, banned language (67 terms), voice rules (9), CTAs (10 banned), visual rules |
| `SOCELLE_ENTITLEMENTS_PACKAGING.md` | Roles, tiers, free preview rules, mini-app unlock map, entitlement enforcement |
| `SOCELLE_DATA_PROVENANCE_POLICY.md` | Allowed/disallowed sources, attribution, confidence scoring, freshness SLAs |
| `SOCELLE_FIGMA_TO_CODE_HANDOFF.md` | Token naming parity (Figma→CSS→Tailwind→Flutter), breakpoints, grids |
| `SOCELLE_RELEASE_GATES.md` | Pre-merge (22 checks), pre-deploy (29 checks), rollback protocol |
| `GLOBAL_SITE_MAP.md` | Canonical route/screen index |
| `SITE_MAP.md` | Detailed routes with file paths, auth, data sources |
| `BRAND_SURFACE_INDEX.md` | Brand surfaces + SEO readiness |
| `AGENT_SCOPE_REGISTRY.md` | Agent boundaries, allowed/forbidden paths |

**Rule:** If ANY file contradicts a command doc, the command doc wins.

---

## §C — DOC GATE (every agent output must pass)

### FAIL conditions (any = reject output)

| # | Condition |
|---|-----------|
| FAIL-01 | External doc referenced as authority (only docs/command/* and this file) |
| FAIL-02 | New planning doc created outside build_tracker.md |
| FAIL-03 | Contradiction with command docs |
| FAIL-04 | Fake-live claims — numbers not tied to real updated_at |
| FAIL-05 | Omitted routes vs site map |
| FAIL-06 | Ecommerce elevated above Intelligence in IA or nav |
| FAIL-07 | Outreach/cold email content |

### PASS requirements (all = accept)

File paths cited. Diffs provided. LIVE/DEMO labels present. Command doc referenced. Coverage complete. Proof artifacts present. WO ID from build_tracker.md.

---

## §D — THE ANTI-SHELL RULE

**NO SHELLS.** Every page, component, hub, or feature must be FULLY FUNCTIONAL.

A shell is a page that: renders UI but doesn't query real data, has no write path when the hub requires one, doesn't enforce permissions, or lacks error/empty/loading states.

**Every hub must have ALL of these:**

| Requirement | What it means |
|-------------|-------------|
| Create action | User can create the primary object → row in DB |
| Library view | Browse all objects with sort/filter/search from Supabase |
| Detail view | Full detail of any object from DB |
| Edit + Delete | Update and remove/archive objects |
| Permissions | RLS + ModuleRoute with correct tier |
| Intelligence input | A signal can spawn an object in this hub |
| Proof/metrics | Dashboard with real aggregated data |
| Export | CSV minimum, PDF for Pro+ |
| Error/empty/loading | All three states are premium quality |
| Observability | Errors visible in Admin Hub dashboards |

---

## §E — TECH STACK (locked decisions)

### Current → Target (all upgrades required before launch)

| Package | Current | Target | Status |
|---------|---------|--------|--------|
| React | 18.3.1 | **19.x** | UPGRADE |
| Vite | 5.x | **6.x** | UPGRADE |
| TypeScript | 5.5.3 (strict OFF) | **5.5.3 strict ON** | UPGRADE |
| TanStack Query | NOT INSTALLED | **v5** | INSTALL |
| Sentry | REMOVED | **NOT USED — Admin Hub dashboards** | REMOVED |
| Supabase JS | 2.57.4 | Current | OK |
| Stripe | 5.6.1 / 8.9.0 | Current | OK |
| Recharts | Installed | Current | OK |
| Tailwind | 3.4 | Current | OK |

### Infrastructure

| System | Technology | Cost at launch |
|--------|-----------|---------------|
| Hosting | Cloudflare Pages | $20/mo |
| Database | Supabase (Pro) | $25/mo |
| AI gateway | ai-orchestrator via OpenRouter | Pay-per-query (~$0.60/user/mo) |
| AI caching | Upstash Redis (free tier) | $0 (free tier 10K commands/day) |
| Observability | Admin Hub dashboards + CMS Hub | $0 (built-in) |
| Analytics | PostHog free tier | $0 (1M events/mo) |
| Search | pgvector (in Supabase) | $0 (included) |
| Embeddings | OpenAI text-embedding-3-small | ~$0.02/1M tokens |
| Feed jobs | pg_cron (in Supabase) | $0 (included) |
| Geo intelligence | PostGIS (in Supabase) | $0 (included) |

### AI Models (all via ai-orchestrator → OpenRouter)

| Model | Purpose | Cost | Credit cost |
|-------|---------|------|------------|
| Claude Sonnet 4.6 | Intelligence Briefs, Activation Plans, Competitive Synthesis | $3/$15 per 1M tokens | 10-100 |
| GPT-4o | Signal summaries, Content Repurposer, Activation Plans | $3/$10 per 1M tokens | 15-40 |
| GPT-4o-mini | "Explain This Signal" quick advisor | $0.10/$0.40 per 1M tokens | 1 |
| Gemini 2.5 Pro | Long-context analysis (202 feeds), weekly briefs | Similar to Claude | 25 |
| Llama 3.3 70B | Real-time chat (<200ms) | Free model, compute only | 1 |
| text-embedding-3-small | Semantic search embeddings | $0.02/1M tokens | 0.5 |

---

## §F — DESIGN SYSTEM (Pearl Mineral V2)

**Canonical source: DOCTRINE** (not figma-make-source — figma must be updated to match)

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| background | `#F6F3EF` | Page backgrounds |
| graphite | `#141418` | Primary text |
| accent | `#6E879B` | Links, interactive |
| accent-hover | `#5A7185` | Hover states |
| accent-soft | `#E8EDF1` | Soft backgrounds |
| signal-up | `#5F8A72` | Positive trends |
| signal-warn | `#A97A4C` | Caution |
| signal-down | `#8E6464` | Negative trends |

### Banned
- font-serif on ANY public page
- Bootstrap/Material/Chakra default colors
- #000000 text on #FFFFFF background
- Hardcoded hex outside token system
- Non-SCL-prefixed custom utilities

### Glass system
`rgba(255,255,255,0.72)` bg, `blur(18px)`, `saturate(1.8)`, `brightness(1.06)`, `1px solid rgba(255,255,255,0.18)` border, `0 8px 32px rgba(0,0,0,0.06)` shadow, `1.25rem` radius

### Font
General Sans via `font-sans` only. No serif. No system defaults on public pages.

---

## §G — INTELLIGENCE HUB (the revenue surface)

### 10 Modules

| Module | Data source | Status |
|--------|-----------|--------|
| KPI Strip | useDataFeedStats + market_signals | Wire to figma-make-source/KPIStrip |
| Signal Table | useSalonSignals (sortable/filterable/exportable) | Wire to figma-make-source/SignalTable |
| Trend Stacks | useSignalCategories + Recharts | NEW — build |
| "What Changed" Timeline | useRssItems + signals | Wire to figma-make-source/NewsTicker |
| Opportunity Signals | get_salon_opportunities RPC | NEW — build |
| Confidence + Provenance | provenance columns on signals | Wire to figma-make-source/EvidenceStrip |
| Category Intelligence | Taxonomy-filtered signals | NEW — build |
| Competitive Benchmarking | useBenchmarkData | EXISTS — upgrade |
| Brand Health Monitor | useBrandIntelligence | EXISTS — upgrade |
| Local Market View | Geo-filtered signals | NEW — build |

### 7 AI Service Menu Engines (EXIST in codebase)

| Engine | File | Status |
|--------|------|--------|
| menuOrchestrator | src/lib/analysis/menuOrchestrator.ts | EXISTS — upgrade with live signal integration |
| PlanWizard | src/pages/business/PlanWizard.tsx | EXISTS |
| planOrchestrator | src/lib/analysis/planOrchestrator.ts | EXISTS |
| documentExtraction | src/lib/analysis/documentExtraction.ts | EXISTS |
| mappingEngine | src/lib/analysis/mappingEngine.ts | EXISTS |
| gapAnalysisEngine | src/lib/analysis/gapAnalysisEngine.ts | EXISTS |
| retailAttachEngine | src/lib/analysis/retailAttachEngine.ts | EXISTS |

### 6 AI Tools

| Tool | Model | Credits | Tier |
|------|-------|---------|------|
| Explain This Signal | GPT-4o-mini | 1 | Starter |
| Intelligence Brief | Claude Sonnet | 10 | Pro |
| Activation Plan | GPT-4o | 30 | Pro (requires provider signoff) |
| Content Repurposer | GPT-4o | varies | Pro |
| Competitive Synthesizer | Claude Sonnet | 40 | Enterprise |
| Semantic Search | embeddings + pgvector | 0.5 | All |

### Data Pipeline

```
100+ feeds (data_feeds table) → pg_cron hourly
    → feed-orchestrator (edge function)
    → ingest-rss (edge function)
    → rss-to-signals (promotes at confidence ≥ 0.50)
    → market_signals (with provenance: source_url, confidence, tier, is_live)
    → useIntelligence hook (TanStack Query)
    → UI surfaces (Signal Table, KPI Strip, etc.)
```

**Feed sources:** 37 RSS feeds + Open Beauty Facts API + PubMed + FDA + Google Trends proxy. 21 international feeds (APAC/EU/K-beauty) in Phase 2.

---

## §H — ALL HUBS (every hub must be fully functional — see §D anti-shell rule)

| Hub | Pages | Key features | Current state |
|-----|-------|-------------|---------------|
| **Intelligence** | 53 public + portal surfaces | 10 modules + 7 engines + 6 AI tools | PARTIAL — hooks + pipeline exist, figma modules not wired |
| **Jobs** | Public listings + portal | Pipeline, dedup, filters, apply, talent intelligence, job signals in Intelligence | PARTIAL — pipeline configured |
| **Brands** | 25 brand portal pages | Profiles, claim, messaging, brand intelligence, R&D Scout (Enterprise) | PARTIAL — 64% mock |
| **Professionals** | Pro profiles + directory | Credentials, portfolio, trust signals, tools by tier, CE tracking | SHELL — must build |
| **Admin** | 63 pages | Feeds, signals, API registry, content, subscriptions, AI admin, audit logs | PARTIAL — 50% mock |
| **CRM** | Contacts + timeline + deals | Unified objects, segments, tasks, intelligence-linked records, rebooking, churn risk | FUNCTIONAL — CRUD exists |
| **Education** | 10 pages + SCORM | Courses, paths, assessments, certificates, CE, brand academies, staff dashboard | FUNCTIONAL — lowest mock (30%) |
| **Commerce** | Cart + checkout + orders | Catalog, Stripe, affiliate wrapper, distributor verification, intelligence commerce | FUNCTIONAL — ready to toggle ON |
| **Marketing** | 8 pages | Campaigns, content studio, audience, distribution, attribution | PARTIAL — 62% mock |
| **Sales** | 6 pages | Pipeline, deals, proposals, commissions, RevOps | SHELL — must build |
| **Authoring Studio** | DOES NOT EXIST | Block editor, templates, brand kits, AI authoring, canvas, exports | NEW — must build entirely |

---

## §I — DATA LAYER

### Codebase scale

| Metric | Count |
|--------|-------|
| Pages | 220 |
| Components | 99 |
| Hooks | 75 |
| Edge functions | 30 |
| Routes in App.tsx | 241 |
| Protected routes | 205 |
| Tables in migrations | 137 |
| Tables in database.types.ts | 40 (**97 MISSING — must regenerate**) |
| Migrations | 150 web + 100 root |

### Known technical debt

| Issue | Severity | Fix |
|-------|----------|-----|
| `/` routes to PrelaunchQuiz | P0 | Change to Intelligence-focused Home |
| 97 tables missing from types | P0 | Run generate_typescript_types |
| TanStack Query not installed | P0 | Install + migrate all 75 hooks |
| Sentry MUST BE REMOVED | P0 | Remove all @sentry packages, Sentry.init(), vite plugin, CSP entries — use Admin Hub dashboards |
| 202 font-serif instances | P1 | Purge from all public pages |
| 6 duplicate hook pairs | P1 | Consolidate to subdirectory versions |
| 52-66% mock density across portals | P1 | Replace with real data per hub build |
| 14 figma-make-source modules not wired | P1 | Wire during Intelligence build |
| 9 broken nav links (BusinessNav) | P1 | Fix /portal/* references |
| Persona pages have 0 CTA buttons | P1 | Add clear CTAs |
| 20 banned terms on public pages | P2 | Replace per voice guidelines |
| 3 mock sk_live_ keys in mockApiData.ts | P2 | Clean up |

### 30 Edge Functions

| Function | Hub | Purpose |
|----------|-----|---------|
| ai-orchestrator | AI | 4-tier LLM routing via OpenRouter + credit deduction |
| ai-concierge | AI | Chat advisor |
| intelligence-briefing | Intelligence | Generate briefs |
| feed-orchestrator | Intelligence | Dispatch feed ingestion |
| ingest-rss | Intelligence | RSS feed parsing |
| rss-to-signals | Intelligence | Promote items to market_signals |
| generate-embeddings | Intelligence | pgvector embeddings |
| refresh-live-data | Intelligence | Data refresh |
| open-beauty-facts-sync | Intelligence | Product/ingredient sync |
| ingredient-search | Intelligence | Ingredient search |
| ingest-npi | Professionals | NPI registry lookup |
| jobs-search | Jobs | Job aggregation |
| create-checkout | Commerce | Stripe session |
| manage-subscription | Commerce | Subscription management |
| stripe-webhook | Commerce | Stripe webhook handler |
| subscription-webhook | Commerce | Subscription lifecycle |
| shop-checkout | Commerce | Shop checkout |
| shop-webhook | Commerce | Shop webhook |
| update-inventory | Commerce | Inventory updates |
| validate-discount | Commerce | Discount validation |
| send-email | Platform | Transactional email |
| magic-link | Auth | Passwordless login |
| generate-certificate | Education | Certificate generation |
| verify-certificate | Education | Certificate verification |
| process-scorm-upload | Education | SCORM upload |
| scorm-runtime | Education | SCORM playback |
| sitemap-generator | SEO | Dynamic sitemap |
| square-appointments-sync | Integration | BLOCKED — do not deploy |
| square-oauth-callback | Integration | BLOCKED — do not deploy |
| test-api-connection | Dev | API testing |

---

## §J — EXECUTION ORDER

```
PHASE 0: DESIGN EVERYTHING FIRST
    All hub specs + all docs → owner approves → THEN code
PHASE 1: INSTALL ALL SKILLS
    78 skills verified → THEN audit
PHASE 2: FULL AUDIT
    All artifacts produced → Command Agent proposes upgrades → owner approves
PHASE 3: TECH UPGRADES (all live before any feature code)
    React 19, Vite 6, strict TS, TanStack, Admin Hub observability, Redis, types regen, Sentry REMOVAL
PHASE 4: INTELLIGENCE CLOUD BUILD
    10 modules + 7 engines + 6 AI tools + feeds + credit economy + affiliate
PHASE 5: ALL HUBS FUNCTIONAL
    CRM, Education, Commerce, Marketing, Sales, Professionals, Authoring Studio
PHASE 6: MULTI-PLATFORM
    PWA → Flutter mobile → Tauri desktop
PHASE 7: LAUNCH
    16 non-negotiables pass → 72-hour launch window
```

**Rules:** No code before design. No features before upgrades. No launch before all gates pass. Quality outranks time.

---

## §K — LAUNCH NON-NEGOTIABLES (all must pass)

| # | Check | Command | Must return |
|---|-------|---------|------------|
| 1 | tsc clean | `npx tsc --noEmit` | Exit 0 |
| 2 | Build clean | `npm run build` | Exit 0 |
| 3 | `/` is Intelligence Home | Visit `/` | Intelligence page |
| 4 | Sentry REMOVED | `grep @sentry package.json` | 0 (must return nothing) |
| 5 | TanStack active | `grep @tanstack package.json` | ≥1 |
| 6 | PAYMENT_BYPASS off | Production env | false |
| 7 | 0 font-serif public | `grep -rn font-serif src/pages/public/` | 0 |
| 8 | 0 banned terms | Banned language linter | 0 violations |
| 9 | Stripe webhook works | Test webhook | Tier updates in DB |
| 10 | Signals fresh | SELECT from market_signals | ≥5 rows < 24h old |
| 11 | AI brief coherent | 10 canned inputs | 0 hallucinations |
| 12 | SEO complete | SEO scanner | 0 pages missing meta |
| 13 | Types current | Compare types vs migrations | 0 drift |
| 14 | Credits deduct | Trigger AI action | Balance decreases |
| 15 | Affiliate links work | Click distributor link | Tracked redirect |
| 16 | Smoke tests | 17-check suite | All pass |

---

## §L — AGENT ROSTER

| # | Agent | Owns | Phase |
|---|-------|------|-------|
| 1 | Command Agent | All — oversight + sequencing | All |
| 2 | Intelligence Architect | Intelligence Hub, AI tools, feed pipeline, signals | All |
| 3 | Platform Engineer | Build, types, caching, observability, CI, API | All |
| 4 | Design Guardian | Pearl Mineral V2, tokens, typography, glass, responsive | All |
| 5 | Design Canvas Agent | Authoring Studio, block editor, canvas, templates, exports | Phase 5+ |
| 6 | Security Agent | RLS, secrets, AI guardrails, legal, FTC compliance | All |
| 7 | QA Agent | E2E, smoke tests, payment flows, AI quality, visual regression | All |
| 8 | Copy Agent | Voice rules, banned terms, copy system, launch comms | Phase 3+ |
| 9 | Monetization Agent | Payments, credits, affiliate, onboarding, retention, SEO | Phase 3+ |
| 10 | Data Architect | Schema, types, hooks, materialized views, first-party events | Phase 2+ |
| 11 | CRM Agent | CRM Hub | Phase 5 |
| 12 | Education Agent | Education Hub, protocols, media library | Phase 5 |
| 13 | Marketing Agent | Marketing Hub | Phase 5 |
| 14 | Sales Agent | Sales Hub | Phase 5 |
| 15 | Ecommerce Agent | Commerce Hub, affiliate engine | Phase 5 |
| 16 | Multi-Platform Agent | PWA, Flutter, Tauri | Phase 6 |

**Rule of 3:** Max 3 agents active per phase. Others queued.

---

## §M — ECOMMERCE BOUNDARY (non-negotiable)

Commerce is a module, never the platform premise. Commerce routes: fully built, ready to toggle ON at any moment, but not in primary nav until Intelligence is established.

- No "Shop" in MainNav position 1
- No "Buy Now" / "Shop Now" as primary CTA on intelligence pages
- All commerce behind ProtectedRoute
- Flow: Intelligence → Trust → Transaction (always this order)
- Affiliate link wrapper: FTC "Commission-linked" badge required

---

## §N — LIVE/DEMO TRUTH

Every data surface labeled LIVE or DEMO. No exceptions.

- LIVE = real DB column with verifiable updated_at + source attribution + confidence
- DEMO = visible DEMO badge to end user
- MOCK without badge = VIOLATION
- isLive flag pattern (from useIntelligence) on ALL data hooks
- Never display animated indicators on static data

---

## §O — AI SAFETY

- Guardrails AI layer between LLM and user (all endpoints)
- "Generated by AI" disclosure on every output
- "Evidence & Logic" expandable section with source citations
- Hard block: no injection dosing, no diagnoses, no prescriptions
- Provider override: NPI → scope_of_practice → electronic signature → clinical rationale
- All AI interactions logged (exportable for insurance)
- Banned terms (67) enforced at generation time
- State AI disclosure compliance (CA, CO, UT)

---

## §P — NO OUTREACH

Acquisition is on-site only:
- Public pages → "Get Intelligence Access" → /request-access → access_requests table
- send-email is transactional ONLY (orders, passwords, access, briefs)
- No cold email, no DM scripts, no "partnership opportunity" copy

---

## §Q — COMPETITIVE POSITION

| Competitor | Price | SOCELLE advantage |
|-----------|-------|------------------|
| Spate | $5K-20K/mo | Operator-first at $149, actionable (signal→action→revenue) |
| Revieve | Enterprise | B2B intelligence layer vs consumer experience |
| Trendalytics | $2K-10K/mo | Pro-operator focus + AI action plans |
| Canva | $12.99/mo | Beauty-specific + intelligence-data-binding + clinical compliance |
| Zenoti/Meevo | $100-800/mo | Intelligence ON TOP of operations |

**Differentiator:** "Spate tracks consumers. SOCELLE tracks Licensed Pros."

**7 moats:** Pro Source Truth, Encoded Vertical Logic, MoCRA Compliance Loop, Data model + provenance, Workflows (signals → actions), Vertical ontologies, Compounding private signals (app_events).

---

## §R — DEFERRED TECHNOLOGIES (>$100/mo at launch without users)

These are VALID technologies but deferred until revenue supports the cost:

| Technology | Monthly cost | When to add | Trigger |
|-----------|-------------|-------------|---------|
| Perfect Corp SDK (AI skin analysis) | $200K-500K/yr | Phase 5 | 500+ subscribers |
| Haut.AI API (skin diagnostics) | Enterprise | Phase 5 | Brand Enterprise demand |
| Veo/Sora (AI video generation) | Per-generation | Phase 5 | Creative AI add-on demand |
| Glimpse (absolute search volumes) | $100+/mo | Phase 5 | When Google Trends proxy hits rate limits |
| X/Twitter API (social listening) | $200+/mo | Phase 5 | When Reddit + Instagram insufficient |
| Yelp Fusion API | $7.99+/1K calls | Phase 5 | When Google Places insufficient |
| Typesense (advanced search) | $29+/mo | Phase 5 | When pgvector FTS needs supplementing |
| Crisp chat (team support) | $29+/mo | 100+ subscribers | First support ticket overflow |
| LangGraph (complex AI workflows) | Compute cost | Phase 5 | Multi-step AI agent chains needed |
| LangSmith (prompt monitoring) | $39+/mo | Phase 5 | When AI eval needs production monitoring |
| Trigger.dev (background jobs) | $29+/mo | Phase 5 | When pg_cron insufficient |
| Meta Wearables SDK | Developer program | Phase 5 | AR beauty consultation demand |

**Rule:** Nothing in §R gets built until the revenue trigger is met. These are NOTED OPTIONS, not commitments.

---

## §S — REQUIRED DOCUMENTS

| # | Document | Must exist before |
|---|----------|------------------|
| 1 | INTELLIGENCE_CLOUD_V1_BRIEF.md | Phase 0 (design) |
| 2 | ENTITLEMENTS_TIER_MATRIX.md | Phase 0 |
| 3 | FEED_SOURCING_POLICY.md | Phase 0 |
| 4 | DESIGN_LOCK_SNAPSHOT.md | Phase 0 |
| 5 | SOCELLE_SITEMAP_V2.md | Phase 0 |
| 6 | AI_SAFETY_LEGAL_FRAMEWORK.md | Phase 3 |
| 7 | BRAND_VOICE_GUIDELINES.md | Phase 3 |
| 8 | MASTER_PROMPTING_GUIDELINE.md | Phase 3 |
| 9 | COPY_SYSTEM.md | Phase 3 |
| 10 | RELEASE_GATES_STANDARD.md | Phase 1 |
| 11 | SECURITY_BASELINE.md | Phase 1 |
| 12 | DATA_PROVENANCE_STANDARD.md | Phase 1 |
| 13 | QA_TEST_STRATEGY.md | Phase 1 |
| 14 | AGENT_OPERATING_MANUAL.md | Phase 1 |
| 15 | API_LOGIC_MAP.md | Phase 2 |
| 16 | DATA_MODEL_GLOSSARY.md | Phase 2 |
| 17 | RISK_REGISTER.md | Phase 2 |
| 18 | ADMIN_CONTROL_CENTER_SPEC.md | Phase 0 |
| 19 | LAUNCH_COMMS_PLAYBOOK.md | Phase 4 |
| 20 | INCIDENT_ROLLBACK_PLAYBOOK.md | Phase 3 |

Plus 16 hub design specs (one per hub/app) — all Phase 0.

---

## §T — STOP CONDITIONS

- **HALT** if shell detected (page with no DB query)
- **HALT** if secrets in committed code
- **HALT** if PAYMENT_BYPASS=true in committed env
- **HALT** if banned term in user-facing copy
- **HALT** if font-serif on public page
- **HALT** if build fails
- **ESCALATE** if Supabase access unavailable (mark DB checks UNKNOWN)
- **CONTINUE** past individual component errors (log + move to next)

---

*SOCELLE GLOBAL — One Source of Truth*
*Quality and revenue outrank time. Nothing ships average. No shells permitted.*
*Intelligence platform first. Always.*

# SOCELLE — ONE SOURCE OF TRUTH: ADDENDUM §U-§Z
# Integration Map + UI/UX System Architecture
# Append to SOCELLE_CLAUDE_MD_ONE_SOURCE_OF_TRUTH.md after §T

---

## §U — SYSTEM INTEGRATION MAP

### Master Data Flow (how everything connects)

```
                         ┌──────────────────────┐
                         │   100+ DATA FEEDS     │
                         │ RSS + APIs + Scraping  │
                         └──────────┬─────────────┘
                                    │ pg_cron hourly
                         ┌──────────▼─────────────┐
                         │   FEED-ORCHESTRATOR     │
                         │ dispatch by feed_type   │
                         │ retry/backoff/DLQ       │
                         │ logs to feed_run_log    │
                         └──────────┬─────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
           ┌────────▼──────┐ ┌─────▼──────┐ ┌──────▼────────┐
           │  INGEST-RSS   │ │ API SYNC   │ │ SCRAPER SYNC  │
           │ parse XML     │ │ PubMed     │ │ (future)      │
           │ → rss_items   │ │ FDA, OBF   │ │               │
           └────────┬──────┘ └─────┬──────┘ └───────────────┘
                    │              │
                    └──────┬───────┘
                           │ confidence ≥ 0.50
                    ┌──────▼───────────────┐
                    │   RSS-TO-SIGNALS     │
                    │ promote to           │
                    │ market_signals       │
                    │ with provenance      │
                    └──────┬───────────────┘
                           │
              ┌────────────▼────────────┐
              │     MARKET_SIGNALS      │
              │ source_url              │
              │ confidence_score        │
              │ tier_visibility         │
              │ is_live, is_duplicate   │
              │ category, region        │
              └────────────┬────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼─────┐    ┌─────▼──────┐    ┌─────▼──────┐
    │EMBEDDINGS│    │ AI ORCH    │    │ HOOKS      │
    │pgvector  │    │ 6 models   │    │ TanStack Q │
    │semantic  │    │ credits    │    │ isLive     │
    │search    │    │ guardrails │    │ tier gate  │
    └────┬─────┘    └─────┬──────┘    └─────┬──────┘
         │                │                 │
         └────────────────┼─────────────────┘
                          │
    ┌─────────────────────▼─────────────────────┐
    │            UI SURFACES (per portal)        │
    │                                            │
    │  PUBLIC          OPERATOR       BRAND      │
    │  ├ Intelligence  ├ Dashboard    ├ Dashboard │
    │  ├ Ingredients   ├ Intel Hub    ├ Intel Hub │
    │  ├ Protocols     ├ Benchmarks   ├ Reports   │
    │  ├ Brands        ├ AI Advisor   ├ AI Advisor│
    │  ├ Jobs          ├ Menu Wizard  ├ R&D Scout │
    │  ├ Events        ├ Alerts       ├ MoCRA     │
    │  └ Stories       ├ CRM          └ Analytics │
    │                  ├ Marketing                │
    │  ADMIN           ├ Sales                    │
    │  ├ Feeds         ├ Education                │
    │  ├ Signals       └ Commerce                 │
    │  ├ AI Cost                                  │
    │  ├ API Registry                             │
    │  └ Users                                    │
    └─────────────────────┬─────────────────────┘
                          │
    ┌─────────────────────▼─────────────────────┐
    │           CROSS-HUB ACTIONS                │
    │                                            │
    │ Signal → Create Deal (Sales)               │
    │ Signal → Create Campaign (Marketing)       │
    │ Signal → Create Training Kit (Education)   │
    │ Signal → Create Protocol Update (Education)│
    │ Signal → Create Brief (Authoring)          │
    │ Signal → Create Alert (Notifications)      │
    │ Signal → Update Menu Recommendation (AI)   │
    │ Signal → Price Alert (Commerce)            │
    │ Signal → Client Note (CRM)                 │
    │                                            │
    │ EVERY HUB RECEIVES INTELLIGENCE.           │
    │ Intelligence is the platform spine.        │
    └───────────────────────────────────────────┘
```

### Edge Function → Table → Hook → Page Map

| Edge function | Writes to | Read by hook | Rendered on |
|--------------|----------|-------------|------------|
| feed-orchestrator | data_feeds, market_signals, feed_run_log | useDataFeedStats, useIntelligence | AdminFeedsHub, Signal Table |
| ingest-rss | rss_items, rss_sources | useRssItems | Timeline, Stories |
| rss-to-signals | market_signals | useIntelligence, useSignalModules | Signal Table, KPI Strip, Trends |
| ai-orchestrator | tenant_balances, ai_concierge_chat_logs | useChatSession | AI Advisor, all AI tools |
| intelligence-briefing | stories | useStories | Briefs page, email, portal |
| generate-embeddings | market_signals (vector) | pgvector similarity | Semantic Search |
| open-beauty-facts-sync | ingredients, ingredient_identifiers | useIngredients | Ingredients pages |
| ingest-npi | businesses | useAuth | Provider verification |
| create-checkout | (Stripe session) | useSubscription | Plans → Stripe |
| stripe-webhook | subscriptions, user_profiles | useSubscription, useModuleAccess | All tier-gated surfaces |
| shop-checkout | orders, order_items | useShopOrders | Commerce checkout |
| generate-certificate | certificates | useCertificates | Education certificates |
| sitemap-generator | sitemap_entries | (SEO) | /sitemap.xml |

### Hub → Hub Integration Points

| From hub | To hub | Integration | Trigger |
|---------|--------|-------------|---------|
| Intelligence | Sales | "Create opportunity from signal" | Signal with high revenue potential detected |
| Intelligence | Marketing | "Create campaign from signal" | Trending signal matched to operator audience |
| Intelligence | Education | "Update curriculum from signal" | Regulatory change or new treatment trend |
| Intelligence | Commerce | "Price alert from signal" | Ingredient price or availability change |
| Intelligence | CRM | "Add signal to client note" | Signal relevant to specific client treatment |
| Intelligence | Authoring | "Generate brief from signals" | Weekly auto-brief or on-demand creation |
| Education | Professionals | "Verify credential" | Certificate issued → pro profile updated |
| Education | CRM | "Assign training to staff" | Compliance gap detected |
| CRM | Marketing | "Target segment" | CRM segment used as campaign audience |
| CRM | Sales | "Convert to deal" | CRM contact qualified for upsell |
| Commerce | Intelligence | "Inventory intelligence" | Price/availability data feeds back as signals |
| Authoring | ALL hubs | "Publish to [hub]" | Document published to CMS/Education/Marketing |

---

## §V — UI/UX ARCHITECTURE

### Portal System (4 portals + admin)

```
┌─────────────────────────────────────────────────────┐
│                    PUBLIC PORTAL                      │
│  MainNav: [Intelligence] [Brands] [Jobs] [Plans]     │
│  Layout: Pearl Mineral V2 (light bg, glass panels)   │
│  Auth: None required for browse, gated for deep data │
│  Footer: About, Privacy, Terms, API Docs              │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                  OPERATOR PORTAL (/portal/*)          │
│  BusinessNav: [Dashboard] [Intelligence] [AI Advisor] │
│    [Plans] [Account] [Login/Signup]                   │
│  Layout: BusinessLayout (sidebar + content area)     │
│  Auth: ProtectedRoute required                        │
│  Tier gate: ModuleRoute per feature                   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                  BRAND PORTAL (/brand/*)              │
│  BrandNav: [Dashboard] [Intelligence] [Reports]      │
│    [AI Advisor] [Plans]                               │
│  Layout: BrandLayout (sidebar + content area)        │
│  Auth: ProtectedRoute + brand role                    │
│  Tier gate: useBrandTier                              │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                  ADMIN PORTAL (/admin/*)              │
│  AdminNav: [Dashboard] [Feeds] [Signals] [Brands]    │
│    [Subscriptions] [Content] [AI] [API] [Settings]    │
│  Layout: AdminLayout (sidebar + content area)        │
│  Auth: admin role required                            │
└─────────────────────────────────────────────────────┘
```

### Page Composition System (how pages are built from modules)

Every page is composed from standardized modules. No freeform HTML.

```
PAGE = Layout + [Module, Module, Module, ...]

LAYOUT provides: nav, sidebar, footer, auth context, tier context
MODULE provides: one focused UI block with data binding

MODULE TYPES:
├── KPIStrip (metrics bar — useDataFeedStats)
├── SignalTable (sortable/filterable data — useIntelligence)
├── TrendStacks (Recharts bars — useSignalCategories)
├── Timeline (chronological events — useRssItems)
├── SpotlightPanel (featured content — useBrandIntelligence)
├── BigStatBanner (hero metric — usePlatformStats)
├── HeroMediaRail (hero images/video — media_library)
├── EditorialScroll (story cards — useStories)
├── CTASection (conversion block — static)
├── EvidenceStrip (provenance display — signal metadata)
├── NewsTicker (real-time feed — useRssItems)
├── StickyConversionBar (bottom CTA — static)
├── EmailCapture (lead form — access_requests)
├── SocialProof (testimonials — static initially, DB later)
├── ImageMosaic (visual grid — media_library)
├── FeaturedCardGrid (card layout — any data source)
├── ChartModule (Recharts embed — any numeric data)
├── TableModule (sortable/exportable — any array data)
├── FormModule (create/edit — any writable table)
├── DetailModule (single record view — any table)
└── EmptyState (premium empty state with conversion CTA)
```

### Intelligence Page Composition (from figma-make-source — the blueprint)

```
/intelligence (PUBLIC — the product showcase)
├── HeroMediaRail (headline + hero video/image)
├── NewsTicker (live signal stream — "What's happening now")
├── BigStatBanner (platform stats: signals, sources, freshness)
├── KPIStrip (4-6 key metrics at a glance)
├── EditorialScroll (latest stories/briefs)
├── SignalTable (top signals — gated: 3 free, full for Starter+)
├── ImageMosaic (visual trend grid)
├── SpotlightPanel (featured signal or brand)
├── CTASection ("Get Intelligence Access")

/portal/intelligence (OPERATOR — the daily tool)
├── KPIStrip (personalized: YOUR signals, YOUR metro)
├── SignalTable (full access per tier, filterable by category)
├── TrendStacks (7/30/90 day charts per category)
├── Timeline ("What Changed" — chronological signal movements)
├── OpportunitySignals ("You're missing $2,450/month")
├── CategoryIntelligence (drill-down by ingredient/treatment/brand)
├── CompetitiveBenchmarks (anonymized peer comparison)
├── LocalMarketView (geo-filtered intelligence)
├── ConfidenceProvenance (source, date, confidence on every signal)
├── AIToolbar (Explain Signal, Generate Brief, Activation Plan, Search)
```

### Onboarding Flow (4 screens — the "wow" moment)

```
SCREEN 1: Identity Scan
├── Zip code input
├── Business name input
├── NPI lookup (if medspa/medical)
├── Role selection (operator/provider/brand/student)
└── CTA: "Continue"

SCREEN 2: Shadow Menu Audit
├── AI scans operator's website URL
├── Detects: specialties, services, products
├── Shows: "We found 12 services on your menu"
├── Loading: premium animation, not spinner
└── Auto-advances when complete

SCREEN 3: Signal Match (THE WOW)
├── "We found 4 opportunities in [zip]"
├── Signal cards: "peptides +12% in your zip — you don't list this"
├── Revenue estimate: "$2,450/month in untapped demand"
├── Provenance: source, date, confidence on each signal
└── CTA: "See all your intelligence"

SCREEN 4: Tailored Gate
├── "14 more opportunities behind this wall"
├── Tier comparison (Starter $49 / Pro $149)
├── Value counter: "Operators who see these add $X/month"
├── Social proof: subscriber count + testimonial
└── CTA: "Get Intelligence Access — $49/mo"
```

### Paywall UX (where intelligence becomes revenue)

```
FREE USER sees:
├── Top 3 national signals (no local, no detail)
├── Signal Table with blur on rows 4+
├── "Upgrade to see 47 more signals" banner
├── AI tools: locked with "Pro feature" badge
├── Exports: locked
└── Every locked element is a conversion opportunity

STARTER USER ($49) sees:
├── Full national + limited local signals
├── Signal Table with 30-day history
├── Explain This Signal (1 credit) + Semantic Search (0.5 credits)
├── CSV export
├── 500 credits/month
└── Upgrade prompt when credits run low

PRO USER ($149) sees:
├── All regions + 1-year history + local deep-dive
├── All 6 AI tools + weekly auto-brief
├── PDF + branded exports
├── 2,500 credits/month
├── Provider override for Activation Plans
└── Full Signal Table with all filters + saved searches

ENTERPRISE ($499) sees:
├── Everything + API access + custom feeds + webhook alerts
├── R&D Scout + MoCRA Sentinel
├── 10,000 credits/month
├── Unlimited exports + branded reports
├── Dedicated support + custom onboarding
└── Embeddable intelligence widgets for own sites
```

### Responsive Behavior (web → tablet → mobile)

| Component | Desktop (>1024px) | Tablet (768-1024px) | Mobile (<768px) |
|-----------|-------------------|--------------------|-----------------| 
| Signal Table | Full table with all columns | Condensed columns (hide region, confidence) | Card list (one signal per card) |
| KPI Strip | 6 metrics in row | 3×2 grid | 2×3 grid or swipeable |
| Trend Stacks | Recharts stacked bar | Same (smaller) | Sparklines only |
| Timeline | Full timeline with details | Same | Compact (title + time only, expandable) |
| Navigation | Horizontal nav bar | Hamburger + dropdown | Bottom tab bar |
| Sidebar (portals) | Always visible | Collapsible | Bottom sheet or overlay |
| AI Tools | Inline panel alongside table | Below table | Full-screen modal |
| Exports | Dropdown menu | Same | Bottom sheet |
| Glass panels | Full glass effect | Same | Solid background (performance) |

### Empty State System

Every page must have a premium empty state. Not a browser default.

```
EMPTY STATE = Illustration + Headline + Body + CTA

Intelligence empty (no signals yet):
├── Illustration: abstract signal waves (Pearl Mineral V2 palette)
├── Headline: "Your intelligence is warming up"
├── Body: "We're ingesting signals from 37 sources. First results in ~15 minutes."
└── CTA: "Explore how intelligence works"

CRM empty (no contacts):
├── Illustration: connected dots network
├── Headline: "Your client relationships start here"
├── Body: "Add your first contact to begin tracking visits, preferences, and retention."
└── CTA: "Add first contact"

Commerce empty (no orders):
├── Illustration: supply chain flow
├── Headline: "Intelligence-powered procurement"
├── Body: "When you're ready, SOCELLE will recommend products based on your trending services."
└── CTA: "Explore trending products"
```

### Error State System

```
ERROR STATE = Icon + Headline + Body + Retry + Fallback

Network error:
├── Icon: wifi-off (lucide)
├── Headline: "Connection lost"
├── Body: "We'll keep trying. Your cached data is still available below."
├── Retry: "Try again" button
└── Fallback: Show last-cached data with "Last updated X ago" banner

Auth error:
├── Headline: "Session expired"
├── Body: "Please sign in again to continue."
└── CTA: "Sign in"

RLS/permission error:
├── Headline: "This requires [Tier Name]"
├── Body: "Upgrade to access [feature]."
└── CTA: "View plans"

AI error:
├── Headline: "Intelligence briefly unavailable"
├── Body: "Our AI tools are experiencing high demand. Try again in a moment."
├── Retry: "Try again" (with backoff)
└── Fallback: Show cached AI output if available
```

---

## §W — AUTHORING STUDIO UI/UX

The Authoring Studio is SOCELLE's Canva-competitor. It must feel premium and productive.

### Studio Layout

```
┌─────────────────────────────────────────────────┐
│ TOOLBAR: [New ▾] [Templates] [Brand Kit] [Export]│
├──────────┬──────────────────────┬───────────────┤
│ BLOCK    │                      │ PROPERTIES    │
│ PICKER   │    CANVAS / EDITOR   │ PANEL         │
│          │                      │               │
│ ├ Text   │  (blocks render here)│ ├ Typography  │
│ ├ KPI    │                      │ ├ Colors      │
│ ├ Signal │                      │ ├ Spacing     │
│ ├ Table  │                      │ ├ Data bind   │
│ ├ Media  │                      │ ├ Permissions │
│ ├ Chart  │                      │ └ Actions     │
│ ├ CTA    │                      │               │
│ └ More   │                      │               │
├──────────┴──────────────────────┴───────────────┤
│ STATUS BAR: Draft • Last saved 2m ago • v3      │
└─────────────────────────────────────────────────┘
```

### Design Canvas (for visual content creation)

```
┌─────────────────────────────────────────────────┐
│ CANVAS TOOLBAR: [Size ▾] [Zoom] [Grid] [Export] │
├──────────┬──────────────────────┬───────────────┤
│ LAYERS   │                      │ ELEMENT       │
│          │   ┌──────────────┐   │ PROPERTIES    │
│ ├ BG     │   │              │   │               │
│ ├ Image  │   │   CANVAS     │   │ ├ Position    │
│ ├ Text   │   │  (drag/drop  │   │ ├ Size        │
│ ├ Shape  │   │   elements)  │   │ ├ Color       │
│ ├ KPI    │   │              │   │ ├ Font        │
│ └ Signal │   └──────────────┘   │ ├ Data bind   │
│          │                      │ └ Effects     │
├──────────┴──────────────────────┴───────────────┤
│ Canvas: 1080×1080 (Instagram) ▾                  │
└─────────────────────────────────────────────────┘

CANVAS SIZES:
├── 1080×1080 (Instagram square)
├── 1200×628 (LinkedIn/Facebook)
├── 1080×1920 (Instagram Story/TikTok)
├── 800×418 (Twitter/X)
├── A4 (PDF print)
├── 5×7 (Staff training card)
└── Custom
```

---

## §X — MOBILE APP UI/UX

### Flutter App Architecture (181 dart files exist)

```
MOBILE NAV: Bottom tab bar
├── [Intelligence] — Signal cards, KPI strip, search
├── [Advisor] — AI chat + quick tools
├── [Alerts] — Notification feed + saved searches
├── [Profile] — Account, subscription, settings
└── [More] — Education, CRM, Commerce (when active)

MOBILE ADAPTATIONS:
├── Signal Table → Swipeable signal cards
├── KPI Strip → Horizontal scroll or 2×3 grid
├── Trend Stacks → Sparklines
├── Timeline → Compact list (expandable)
├── AI Tools → Full-screen bottom sheet
├── Exports → Share sheet (native OS)
├── Glass panels → Solid backgrounds (performance)
├── Onboarding → Same 4 screens, mobile-optimized
└── Push → Signal alerts, brief ready, subscription expiry
```

---

## §Y — DESKTOP APP UI/UX (Tauri)

```
DESKTOP LAYOUT: Title bar + sidebar + content (like Notion/Linear)
├── Title bar: SOCELLE logo + window controls + search
├── Sidebar: Hub navigation (collapsible)
│   ├── Intelligence
│   ├── AI Tools
│   ├── CRM
│   ├── Education
│   ├── Marketing
│   ├── Commerce
│   └── Settings
├── Content: Same as web portal (WebView)
└── Status bar: Connection status + sync + last updated

DESKTOP-SPECIFIC:
├── Cmd+K: Quick search (spotlight-style)
├── Cmd+P: Print any page
├── Cmd+E: Export current view
├── Drag-drop: Import menus (PDF/DOCX) from filesystem
├── Notifications: OS-native (macOS Notification Center, Windows Action Center)
├── Offline: Cached signals + client data available without network
├── Auto-update: Check every 24h, user-approved install
└── File exports: Save to user-chosen directory (not Downloads blob)
```

---

## §Z — COMPONENT LIBRARY STANDARD

Every UI element has ONE implementation. No duplicates. No overrides.

### Core Components (must exist before hub builds)

| Component | Purpose | Variants | Data binding |
|-----------|---------|----------|-------------|
| **Button** | All actions | primary, secondary, ghost, danger, CTA | onClick + optional loading state |
| **Input** | All text input | text, number, search, textarea, password | value + onChange + validation |
| **Select** | Dropdowns | single, multi, combobox, creatable | options from DB or static |
| **Table** | All data tables | sortable, filterable, paginated, selectable, exportable | TanStack Query data |
| **Card** | Content blocks | signal card, brand card, job card, product card, stat card | Entity data from hook |
| **Modal** | Overlays | confirmation, form, detail, full-screen | Content as children |
| **Toast** | Notifications | success, error, warning, info | Message + optional action |
| **EmptyState** | No data | per-hub illustration + CTA | None (static) |
| **ErrorState** | Failures | network, auth, RLS, AI, generic | Error type + retry |
| **LoadingState** | Fetching | skeleton, spinner, shimmer | None (auto from TanStack) |
| **Badge** | Labels | LIVE, DEMO, tier, status, confidence | Label + color |
| **Avatar** | User/brand | image, initials, placeholder | User/brand data |
| **Dropdown** | Menus | action menu, nav dropdown, filter dropdown | Items array |
| **Tabs** | Section switching | horizontal, vertical, pill | Items + active state |
| **Breadcrumb** | Navigation | auto-generated from route | Current route |
| **SearchBar** | Global search | with suggestions, with filters, minimal | Query + results |
| **GlassPanel** | Premium surfaces | card, sidebar, overlay | Children content |
| **KPICard** | Single metric | with delta, with sparkline, minimal | Numeric data + trend |
| **SignalCard** | Intelligence item | compact, expanded, detail | Market signal row |
| **ProvenanceBadge** | Source trust | HIGH (green), MODERATE (amber), LOW (red) | Confidence score |

### Component Rules
- ONE file per component in `src/components/ui/`
- ALL components accept className for Tailwind extension
- ALL components use Pearl Mineral V2 tokens (no hardcoded colors)
- ALL interactive components have focus states + keyboard support
- ALL components have TypeScript strict props (no `any`)
- NO component imports from `node_modules` UI kits (no Tremor, no shadcn overrides)
