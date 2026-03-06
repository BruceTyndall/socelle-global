# GEMINI DEEP RESEARCH PROTOCOLS — SOCELLE Platform

**Generated:** February 27, 2026
**Context:** Socelle operates two separate builds — a B2B beauty wholesale marketplace (React/Vite/TypeScript + Supabase, deployed on Netlify) and a mobile calendar gap-recovery tool for solo beauty pros (Flutter/Dart + Firebase, with RevenueCat subscriptions). The audit found 287 planned features, only 31% built, with zero payment capture on web and no cross-platform identity bridge. These four protocols are designed to be pasted directly into Gemini Deep Research for live web-crawling analysis.

---

## GEMINI DEEP RESEARCH PROMPT: Market Gap & Sentiment — Digital Ethnography

```
ROLE: You are a competitive intelligence analyst specializing in vertical SaaS for the beauty and wellness industry. Conduct a deep "digital ethnography" — crawling real user voices across Reddit, App Store/Google Play reviews, G2/Capterra, TrustPilot, Facebook Groups, and niche forums — to identify unmet needs that a B2B beauty wholesale marketplace + provider scheduling tool should address.

CONTEXT ON MY PRODUCT:
Socelle is a two-sided platform:
- WEB (Socelle B2B): A wholesale marketplace where spas/salons discover professional beauty brands, upload their service menus for AI-powered gap analysis (identifying missing treatment categories and revenue leakage), receive protocol-matched product recommendations, and place wholesale orders. Revenue model: 8-12% transaction commission + business SaaS subscriptions ($49-$799/mo) + brand listing tiers.
- MOBILE (Socelle Pro / SlotForce): A calendar gap-recovery app for solo beauty professionals (stylists, estheticians, massage therapists). It syncs Google/Apple calendars, detects empty appointment slots, calculates revenue leakage in dollars, and helps providers fill gaps via client outreach. Revenue model: $29/mo or $249/year via App Store/Play Store (RevenueCat).

The two products currently share NO user identity, NO data layer, and NO cross-platform authentication. They are effectively two separate businesses under one brand.

RESEARCH TASKS:

1. COMPETITOR LANDSCAPE CRAWL
Search for and analyze the following competitor categories. For EACH competitor, find:
- Their pricing model (free tier? per-seat? transaction-based?)
- Their most-praised features (from real user reviews)
- Their most-complained-about pain points (from 1-2 star reviews)
- Any features they've launched or deprecated in the last 12 months (2025-2026)

Categories to research:
A. B2B Beauty Wholesale Marketplaces: Boulevard, Mangomint, Vagaro, Fresha, GlossGenius, Booksy, Square Appointments — specifically their wholesale/product ordering features, NOT their booking features. Also search for: "beauty wholesale platform," "salon product ordering app," "professional beauty supply B2B."
B. Salon/Spa Management Suites (enterprise): Zenoti, Phorest, Meevo, Rosy Salon Software — their product ordering, inventory management, and vendor relationship features.
C. Schedule Optimization / Gap Recovery: Search for ANY tool (beauty-specific or not) that detects empty calendar slots and helps fill them. Check: "appointment gap filler," "schedule optimization beauty," "fill empty salon slots," "calendar revenue recovery."
D. AI-Powered Beauty Business Tools: Any tool using AI for service menu analysis, treatment recommendations, pricing optimization, or revenue forecasting in the beauty vertical.

2. REDDIT & FORUM ETHNOGRAPHY
Search these subreddits and forums for threads from the last 18 months (Jan 2025 - Feb 2026):
- r/Esthetics, r/HairStylist, r/NailTech, r/MassageTherapy, r/SalonOwners (if exists)
- r/BeautyIndustry, r/smallbusiness (filtered to beauty/salon threads)
- SalonGeek.com forums, BehindTheChair community, Beauty Launchpad forums
- Facebook Groups: "Salon Owners Club," "Estheticians Unite," "Solo Beauty Pros"

For each community, find threads where users express frustration about:
- Wholesale ordering (finding brands, comparing prices, minimum orders, shipping delays)
- Empty appointment slots and cancellations (how they currently handle no-shows and gaps)
- Software fatigue (too many tools, none that talk to each other)
- Pricing their services (not knowing if they're leaving money on the table)
- Discovering new professional products and treatments to add to their menu
- The gap between what enterprise salons get (Zenoti, Phorest) and what solos can afford

Extract EXACT QUOTES (with links) that express unmet needs. Categorize each quote as:
- PAIN: Something broken they're complaining about
- WISH: A feature they explicitly ask for
- HACK: A workaround they've built themselves (these are gold — they reveal unserved demand)

3. APP STORE / PLAY STORE REVIEW MINING
For the top 10 beauty booking/management apps (Boulevard, Vagaro, Fresha, GlossGenius, Booksy, Square Appointments, Schedulicity, StyleSeat, Acuity, SimplyBook), analyze their 1-3 star reviews from the last 12 months. Find patterns in complaints about:
- Product ordering / inventory management
- Schedule management / gap filling
- Integration issues (calendar sync, payment processing, multi-tool fatigue)
- Pricing transparency (hidden fees, expensive tiers for basic features)
- AI or smart features (or the lack thereof)

4. MARKET SIZING & WILLINGNESS TO PAY
Search for 2025-2026 data on:
- Total addressable market for beauty SaaS (US + global)
- Average monthly software spend per salon/spa
- What solo practitioners currently pay for scheduling + business tools
- B2B wholesale beauty market size (professional products distribution)
- Any surveys or reports on beauty professionals' tech adoption in 2025-2026

5. SYNTHESIS: THE GAP MAP
Based on all research above, create a ranked list of the top 15 unmet market needs that Socelle could address. For each:
- Describe the pain point in the user's own words
- Estimate severity (1-5 scale based on frequency and emotional intensity of complaints)
- Identify which current competitor comes closest to solving it (and why they fall short)
- Assess whether Socelle's existing architecture (AI gap analysis + wholesale marketplace + calendar gap detection) is positioned to solve it
- Flag any needs that represent a "blue ocean" (no current competitor addresses it at all)

OUTPUT FORMAT: Structured report with sections for each task. Include direct links to sources. Prioritize recency (2025-2026 data). When quoting users, include the platform, date, and link.
```

---

## GEMINI DEEP RESEARCH PROMPT: Feature Pruning & Unified UX Strategy

```
ROLE: You are a senior product strategist and UX architect specializing in multi-platform B2B SaaS products. Your mandate is to identify feature bloat, recommend cuts, and design a unified experience strategy for a platform that currently runs as two disconnected apps.

CONTEXT — CURRENT STATE OF BOTH BUILDS:

PRODUCT A — SOCELLE WEB (B2B Wholesale Marketplace):
- Framework: React 18 + Vite + TypeScript, Tailwind CSS, Supabase (PostgreSQL + Auth + Edge Functions + Realtime), deployed on Netlify
- Users: Spa/salon owners (buyers), professional beauty brands (sellers), platform admins
- 5 user roles: spa_user, business_user, brand_admin, admin, platform_admin
- 70+ React components, 68 page routes across 5 portals (admin, brand, business, spa, public)
- 6 AI engines built: Protocol Mapping (semantic + keyword via pgvector), Gap Analysis, Retail Attach, Phased Rollout Planner, Implementation Readiness, AI Concierge (5 intelligence modes via Claude API)
- Commerce: Multi-brand cart (localStorage only), tiered wholesale pricing (3 tiers), order management (view/status only) — BUT no payment capture, no Stripe Connect payouts, no commission ledger
- 30+ Supabase migrations applied, 5 Edge Functions (ai-concierge, create-checkout, generate-embeddings, send-email, stripe-webhook)
- Brand onboarding wizard, admin seeding tools, data ingestion pipeline (PDF/DOCX → protocol extraction)
- "Coming Soon" placeholders: Brand Campaigns, Brand Automations, Brand Promotions

PRODUCT B — SOCELLE PRO / SLOTFORCE (Mobile Gap Recovery):
- Framework: Flutter 3.3+ (Dart), Firebase (Auth, Firestore, Cloud Functions, Analytics, Messaging, Remote Config), RevenueCat for subscriptions
- Users: Solo beauty professionals (stylists, estheticians, massage therapists)
- Monorepo with 3 shared TypeScript packages: gap_engine (359 lines, battle-tested), shared (Zod validation schemas), functions (18 Cloud Functions for notifications, retention, sync, email)
- 102 Dart files across: features/ (12 modules), providers/ (11 Riverpod), services/ (10), models/ (15), repositories/ (6), core/ (design system)
- MVP screens built: Revenue page (leakage display), Schedule (gap list), Settings, Onboarding (8-step), Paywall, Gap Action Sheet, Recovery Confirmation, Cancel Intercept
- Feature-flagged OFF: Shop (mock data), Messages (mock data), Studio (placeholder), Streaks, Share, Dashboards, A/B Testing — 7 inactive flags total
- 3 critical stubs: IdentityBridge (Firebase ↔ Supabase), SupabaseProductRepository, SupabaseConversationRepository — all throw UnimplementedError
- Known bugs: BUG-002 (timezone makes gap detection wrong for non-UTC users), BUG-004 (anonymous auth only, data lost on reinstall)

CROSS-PLATFORM STATUS:
- No shared authentication (Web = Supabase Auth, Mobile = Firebase Auth)
- No shared data layer (Web = Supabase PostgreSQL, Mobile = Firestore)
- Identity bridge is an empty skeleton
- Two separate subscription/payment systems (Stripe vs RevenueCat)
- Two separate email systems (Brevo/Supabase Edge Functions vs Postmark/Firebase Functions)
- Designed as separate products under one brand name

AUDIT FINDINGS:
- 287 total planned features across both platforms
- Only 89 (31%) fully built
- 119 (41%) have ZERO implementation
- Web: 63% of Phase 1 critical path complete, but cannot collect payment on orders
- Mobile: Phase 8 (SHIP) at 9/11 tasks, blocked by external config (Postmark, RevenueCat prod keys)

RESEARCH TASKS:

1. FEATURE BLOAT ANALYSIS (By 2026 Market Standards)
For EACH of the following feature categories in our codebase, research whether this is table-stakes, differentiator, or bloat for a 2026 beauty SaaS platform. Use current competitor analysis (Boulevard, Vagaro, Fresha, GlossGenius, Zenoti, Phorest, Mangomint) as benchmarks:

WEB FEATURES TO EVALUATE:
- 6 AI analysis engines (Protocol Mapping, Gap Analysis, Retail Attach, Phased Rollout Planner, Implementation Readiness, AI Concierge) — Are these differentiators or over-engineering for pre-revenue?
- Custom PDF/DOCX ingestion pipeline for service menu parsing — Do competitors have this? Is it a moat or a nice-to-have?
- Brand campaigns, automations, promotions ("Coming Soon" placeholders) — At what user/brand count do these become necessary vs. premature?
- Custom order management system (view/status/tracking) — Should this be custom-built or replaced by Shopify B2B headless?
- AI Concierge with 5 intelligence modes — Does the market want AI chat in B2B wholesale, or is this a demo feature?
- Data ingestion pipeline (PDF → protocol extraction → catalog population) — Is this a competitive moat or over-investment?

MOBILE FEATURES TO EVALUATE:
- Shop screen (mock products, no backend) — Should this exist in a scheduling app? Do competitors bundle marketplace into provider tools?
- Messages screen (mock conversations, no backend) — Solo pros already have iMessage/WhatsApp. Is in-app messaging table-stakes or bloat?
- Studio page (analytics dashboard, placeholder) — Do solo pros use analytics dashboards? Or is a weekly email digest sufficient?
- Streak tracking / gamification — Does gamification work for beauty professionals? Research: retention patterns in service-industry apps.
- Daily ritual system — Is this differentiated or generic self-help bolted onto a calendar tool?
- A/B testing infrastructure — At what user count does this matter? Is it premature for <1000 users?
- 12-phase roadmap (Phases 8-12 include client database, automated outreach, income tracking, tax estimator, referral rewards, Pro+ tier) — Which of these are essential for a solo pro tool vs. scope creep?

2. KILL / KEEP / DEFER RECOMMENDATIONS
Based on your research, categorize EVERY feature listed above into:
- KILL: Remove from codebase entirely. Explain why (bloat, no market demand, wrong timing, duplicate of existing tool)
- KEEP: Essential for launch. Explain why (table-stakes, clear differentiator, revenue-generating)
- DEFER: Has value but wrong time. Specify WHEN it becomes relevant (user count threshold, revenue milestone, market signal)
- MERGE: Should be combined with another feature to reduce complexity

For each KILL recommendation, estimate lines of code that can be deleted and any downstream dependencies.

3. UNIFIED UX STRATEGY
Research how other multi-platform products (NOT just beauty — look at Shopify POS + Online, Square POS + Dashboard + Online, Toast Restaurant + Toast TakeOut, ServiceTitan mobile + web) create a cohesive cross-platform experience. Then design a "Unified UX Strategy" for Socelle that addresses:

A. INFORMATION ARCHITECTURE: How should the web dashboard and mobile app present overlapping data (e.g., revenue metrics, appointment gaps, product catalog) without feeling like two different products?

B. NAVIGATION PARITY: Should mobile mirror web's 5-portal structure? Or should mobile be a simplified "action layer" while web is the "management layer"? Research how Square and Shopify handle this split.

C. IDENTITY & ONBOARDING: Given the current Firebase + Supabase auth split, what's the optimal UX for a user who starts on one platform and needs to access the other? Research: "progressive account linking" patterns, "magic link" cross-platform flows, SSO for consumer products.

D. BRAND CONSISTENCY: The web uses Tailwind CSS with a plum/champagne/ivory palette. The mobile uses Flutter Material Design with a "SlotForce" branded design system (sf_button, sf_card, etc.). How do you unify visual language across React and Flutter without a shared rendering engine?

E. FEATURE ASYMMETRY: Some features only make sense on one platform (e.g., PDF upload = web, calendar sync = mobile). How should the UX handle features that exist on one platform but not the other? Research: progressive disclosure patterns, "available on web/mobile" indicators.

4. COMPETITIVE UX TEARDOWN
For the top 3 beauty SaaS competitors that have both web and mobile apps (Boulevard, Vagaro, Fresha), analyze:
- How does their mobile app relate to their web dashboard? (Mirror? Subset? Different product?)
- What's in mobile that's NOT in web, and vice versa?
- How do they handle cross-platform navigation? (Same login? SSO? Separate accounts?)
- What's their onboarding flow for a user who starts on mobile and later accesses web?
- Screenshots or descriptions of key UX patterns they use for cross-platform coherence.

5. RECOMMENDED UX ROADMAP
Based on all research, propose a phased UX unification plan:
- Phase 1 (Launch): Minimum viable coherence — what must be true for both apps to feel like "Socelle" even if they're technically separate?
- Phase 2 (Post-Identity-Bridge): What changes once users can log in with one account across both platforms?
- Phase 3 (Unified Product): What does the fully unified experience look like? Is it one app or two apps with shared identity?

OUTPUT FORMAT: Structured report. For the Kill/Keep/Defer analysis, use a table format with columns: Feature | Verdict | Rationale | Effort Impact | Dependencies. For UX recommendations, include wireframe descriptions or information architecture diagrams where useful.
```

---

## GEMINI DEEP RESEARCH PROMPT: Unified Build Architecture — Framework Evaluation & Migration Roadmap

```
ROLE: You are a senior mobile/web architect who has led 3+ cross-platform migrations. Evaluate framework options for unifying two separate codebases (React web + Flutter mobile) into a single shared codebase, given SPECIFIC technical constraints found in the existing code. This is NOT a generic framework comparison — it must account for the exact APIs, auth systems, databases, and dependencies already in production.

EXISTING TECHNICAL CONSTRAINTS:

WEB BUILD (React + Vite):
- React 18.3.1 + React Router 7.12 + TypeScript 5.5
- Supabase JS SDK v2.57.4 (auth, database, realtime, storage, edge functions)
- Tailwind CSS 3.4.1 for styling
- Vite 5.4.2 build system
- 5 Supabase Edge Functions (Deno runtime): ai-concierge (Claude API), create-checkout (Stripe), generate-embeddings (pgvector), send-email (Brevo SMTP), stripe-webhook
- 30+ Supabase PostgreSQL migrations with RLS policies
- pgvector for semantic search (protocol matching via embeddings)
- mammoth.js for DOCX parsing, pdfjs-dist for PDF parsing (client-side)
- Deployed on Netlify (static site + Supabase Edge Functions)
- Total: ~190 TypeScript/TSX files, 50,610 LOC

MOBILE BUILD (Flutter + Firebase):
- Flutter SDK >=3.3.0 <4.0.0 (Dart)
- Firebase suite: firebase_core 3.8, firebase_auth 5.3, cloud_functions 5.1, firebase_analytics 11.3, firebase_messaging 15.1, firebase_remote_config 5.1
- flutter_riverpod 2.5 for state management
- purchases_flutter 9.12 (RevenueCat for App Store/Play Store subscriptions)
- device_calendar 4.3.1 (Apple Calendar on-device access)
- google_sign_in 6.2.1
- flutter_timezone 3.0
- share_plus 12.0.1
- Monorepo with 3 shared TypeScript packages (built with tsup):
  - gap_engine: 359-line calendar gap detection algorithm
  - shared: Zod validation schemas for cross-function data contracts
  - functions: 18 Firebase Cloud Functions (Node.js runtime, scheduled + callable + triggered)
- Platform packages referenced in pubspec.yaml (PR0 scaffold, not yet functional):
  - platform_economics, platform_notifications, platform_analytics, platform_flutter_core, platform_experiments
- Total: 102 Dart files (22,376 LOC) + 43 TypeScript files (34,882 LOC)

CRITICAL INTEGRATION POINTS:
1. Supabase Auth (web) vs Firebase Auth (mobile) — no shared identity
2. Supabase PostgreSQL (web) vs Firestore (mobile) — different databases
3. Supabase Edge Functions (Deno) vs Firebase Cloud Functions (Node.js) — different serverless runtimes
4. Stripe (web payments) vs RevenueCat (mobile payments) — different payment systems
5. pgvector embeddings for semantic search — web only, requires PostgreSQL
6. Claude API integration for AI Concierge — web only, via Edge Function
7. Apple Calendar on-device access (device_calendar plugin) — mobile only, requires native bridge
8. Firebase Cloud Messaging for push notifications — mobile only
9. RevenueCat SDK for App Store/Play Store subscription management — mobile only
10. Google OAuth token exchange + encrypted token storage in Firestore — mobile only

RESEARCH TASKS:

1. FRAMEWORK EVALUATION (2026 STATE OF THE ART)
Evaluate these 4 options for unifying the codebase. For EACH option, assess compatibility with ALL 10 integration points listed above:

A. FLUTTER EVERYWHERE (Current Mobile Framework → Web + Desktop)
- Can Flutter Web replace the React web app? Evaluate: bundle size, SEO (critical for public brand pages), Supabase Flutter SDK maturity, Tailwind CSS equivalent in Flutter, web-specific features (PDF parsing, DOCX parsing, pgvector search)
- Can Flutter Web call Supabase Edge Functions? Or do those need migration?
- What's the state of flutter_web in 2026? Performance benchmarks vs React for data-heavy dashboards.
- How does Flutter Web handle: rich text editing, drag-and-drop, complex data tables, file upload/preview?
- Effort to port 190 TypeScript/TSX files + 50K LOC to Dart.

B. REACT NATIVE + EXPO (Web Framework → Mobile)
- Can React Native + Expo replace the Flutter app? Evaluate: Supabase React Native SDK, Firebase React Native SDK (via React Native Firebase), RevenueCat React Native SDK, device_calendar equivalent, push notification handling
- Can the existing React web components be shared with React Native via a monorepo? What percentage of code could realistically be shared?
- Expo's "universal" story in 2026: web + iOS + Android from one codebase. How mature is this for production B2B apps?
- How does Expo handle: Apple Calendar on-device access, Google Sign-In, background push notifications, offline-first data with Firestore?
- Effort to port 102 Dart files + 22K LOC to TypeScript/React Native.

C. KOTLIN MULTIPLATFORM (KMP) + Compose Multiplatform
- Can KMP handle both web (via Kotlin/JS or Compose for Web) and mobile (iOS + Android via Compose Multiplatform)?
- KMP's integration story with: Supabase (official Kotlin SDK?), Firebase (via official Firebase Kotlin SDK), RevenueCat, device_calendar
- How mature is Compose for Web in 2026? Can it replace a React dashboard?
- Effort to port BOTH codebases (TypeScript + Dart) to Kotlin.
- Is this realistic for a small team (1-3 engineers)?

D. KEEP SEPARATE + SHARED PACKAGES (Status Quo, Optimized)
- Keep React web + Flutter mobile, but extract shared business logic into platform-agnostic TypeScript packages consumed by both (via Firebase Functions for mobile, direct import for web).
- Use the existing monorepo pattern (packages/gap_engine, packages/shared) as the foundation.
- Add code generation from shared TypeScript types → Dart classes.
- Unify auth via an identity bridge service (shared Cloud Function or Edge Function).
- Estimated effort vs. full rewrite options.

2. INTEGRATION COMPATIBILITY MATRIX
For each framework option (A-D), create a compatibility assessment for each integration:

| Integration Point | Flutter Everywhere | React Native + Expo | KMP | Separate + Shared |
|---|---|---|---|---|
| Supabase Auth | ? | ? | ? | ? |
| Firebase Auth | ? | ? | ? | ? |
| Supabase PostgreSQL | ? | ? | ? | ? |
| Firestore | ? | ? | ? | ? |
| Supabase Edge Functions | ? | ? | ? | ? |
| Firebase Cloud Functions | ? | ? | ? | ? |
| Stripe Payments | ? | ? | ? | ? |
| RevenueCat | ? | ? | ? | ? |
| pgvector + embeddings | ? | ? | ? | ? |
| Claude API (AI Concierge) | ? | ? | ? | ? |
| Apple Calendar (device) | ? | ? | ? | ? |
| Firebase Cloud Messaging | ? | ? | ? | ? |
| PDF/DOCX client parsing | ? | ? | ? | ? |

Rate each: ✅ Native support / ⚠️ Possible with workaround / ❌ Not supported / 🔄 Requires migration

3. MIGRATION ROADMAP
For the TOP 2 recommended options, create a detailed migration roadmap:

Phase 0 (Week 0): Pre-migration audit — what must be preserved, what can be dropped
Phase 1 (Weeks 1-4): Foundation — shared project setup, auth unification, data layer
Phase 2 (Weeks 5-8): Core features — port critical screens and business logic
Phase 3 (Weeks 9-12): Integration — payment systems, push notifications, calendar sync
Phase 4 (Weeks 13-16): Polish — testing, performance, deployment pipeline

For each phase:
- Specific files/modules to migrate (reference the actual file paths from my codebase)
- Risk assessment (what could break)
- Rollback strategy
- Team size recommendation

4. BUILD SYSTEM & DEPLOYMENT
For the recommended option:
- Monorepo structure (what goes where)
- CI/CD pipeline (GitHub Actions? Codemagic? EAS Build?)
- How to deploy: web (Netlify/Vercel/Cloudflare), iOS (App Store), Android (Play Store) from one pipeline
- Environment variable management across platforms
- How to handle platform-specific code (e.g., device_calendar on iOS, PDF parsing on web)

5. COST-BENEFIT ANALYSIS
For each option, estimate:
- Engineering hours to complete migration
- Months to feature parity with current separate builds
- Ongoing maintenance cost reduction (% saved by sharing code)
- Risk of regression during migration
- Impact on time-to-market for new features post-migration

OUTPUT FORMAT: Structured report with the compatibility matrix as a core deliverable. Include specific library names and versions for 2026. Cite real-world case studies of companies that did similar migrations (beauty/wellness vertical preferred, but any B2B SaaS is relevant).
```

---

## GEMINI DEEP RESEARCH PROMPT: Agentic Dev-Ops — AI Agent Sync Architecture

```
ROLE: You are a senior DevOps architect specializing in AI-assisted development workflows and multi-agent systems. Design a production-ready system where AI agents autonomously maintain, sync, and propagate changes across two separate codebases (React web + Flutter mobile) that share business logic but use different languages and frameworks.

CONTEXT — CURRENT DEVELOPMENT REALITY:

We have two separate Git repositories:
1. SOCELLE WEB: React 18 + TypeScript + Supabase (190 TS/TSX files, 50K LOC)
   - Deployed on Netlify
   - Database: Supabase PostgreSQL (30+ migrations)
   - Backend: 5 Supabase Edge Functions (Deno runtime)
   - CI: None currently configured

2. SOCELLE MOBILE: Flutter/Dart + Firebase (monorepo structure)
   - apps/mobile/ — 102 Dart files (22K LOC)
   - packages/functions/ — 18 Firebase Cloud Functions (TypeScript, Node.js)
   - packages/gap_engine/ — Shared TypeScript business logic (359 lines)
   - packages/shared/ — Zod validation schemas (253 lines)
   - Deployed: Firebase Hosting + Cloud Functions
   - CI: None currently configured

SHARED CONCERNS (currently duplicated or diverged):
- User settings model (TypeScript interface in web vs Zod schema in packages/shared vs Dart class in mobile)
- Supabase client initialization (web: src/lib/supabase.ts vs mobile: services/supabase_client.dart — 85% similar logic, different languages)
- Constants (web: platformConfig.ts — matching thresholds, retry config vs mobile: constants.dart — pricing, working hours)
- Feature flags (web: none vs mobile: 7 flags in feature_flags.dart)
- Dashboard components (web: 3 role-specific dashboards with 50% structural overlap)
- Mapping engines (web: 2 engines with 70% code duplication — mappingEngine.ts + serviceMappingEngine.ts)
- Retention metrics (mobile: retentionMetrics.ts + reengagementNotifications.ts with 60% overlap)

KNOWN PAIN POINTS:
- Changes to shared Zod schemas in packages/shared require manual Dart model updates
- Database schema changes (Supabase migrations) have no corresponding Firestore schema update mechanism
- No automated testing across platforms (web has Vitest + Playwright; mobile has 1 stub test)
- No linting enforcement across repos
- No deployment pipeline — manual deploys to Netlify and Firebase
- Bug fixes in one codebase are not automatically reflected in the other (e.g., BUG-002 timezone fix was applied to Flutter code but requires separate Cloud Function deploy)

RESEARCH TASKS:

1. AI AGENT ARCHITECTURE EVALUATION
Research and compare these frameworks for building autonomous code-maintenance agents in 2026:

A. LANGGRAPH (LangChain)
- How would LangGraph agents be structured to monitor two Git repos, detect changes, and propagate updates?
- Can LangGraph agents: read/write code files, run tests, create PRs, deploy to Netlify/Firebase?
- What tools/integrations exist for: GitHub API, Supabase CLI, Firebase CLI, Flutter CLI, Vitest, Playwright?
- Example architectures for multi-repo code sync agents.
- Cost model: API calls per agent run, token consumption for code analysis.

B. GOOGLE AGENT ENGINE (Vertex AI Agent Builder)
- How would Google's agent platform handle cross-repo code maintenance?
- Integration with: Firebase (native), GitHub, Cloud Build, Artifact Registry
- Can it trigger on: Git push events, scheduled intervals, PR creation?
- Advantages for a Firebase-heavy stack (direct Firestore/Functions access)?
- Pricing model for continuous agent monitoring.

C. CREW AI
- Multi-agent orchestration for specialized roles (e.g., "Schema Agent," "Test Agent," "Deploy Agent")
- How would CrewAI agents collaborate on a cross-platform code change?
- Integration capabilities with development tools.

D. CUSTOM AGENTS (Claude API + GitHub Actions)
- Build lightweight agents using Claude API (Anthropic) triggered by GitHub Actions
- Workflow: push to main → Claude analyzes diff → generates corresponding changes for other platform → creates PR
- Cost-effective for small teams?
- How to handle: TypeScript → Dart translation, schema migration generation, test generation.

E. CLAUDE CODE + GITHUB ACTIONS (Native Workflow)
- Use Claude Code (Anthropic's CLI agent) as the execution layer within GitHub Actions
- Claude Code can: read files, write code, run bash commands, create commits
- Workflow: schema change detected → Claude Code agent generates Dart models, updates tests, runs linter → auto-PR
- How to structure .claude files and prompts for repeatable, reliable code generation.

2. THE SYNC-LOGIC WORKFLOW
Design a concrete "Sync-Logic" system where a change to core business logic is automatically propagated across all platforms. Specifically, design workflows for these 5 scenarios:

SCENARIO 1: SHARED TYPE/SCHEMA CHANGE
- Developer updates `packages/shared/src/index.ts` (adds a field to UserSettingsSchema)
- Agent must: (a) regenerate Dart model class in mobile, (b) update web TypeScript interface, (c) update Supabase migration if DB column needed, (d) run tests on both platforms, (e) create PRs for both repos

SCENARIO 2: BUSINESS LOGIC CHANGE
- Developer updates `packages/gap_engine/src/index.ts` (changes leakage calculation formula)
- Agent must: (a) run gap_engine tests, (b) verify mobile Cloud Functions still pass, (c) check if web references the same calculation (it does in gapAnalysisEngine.ts), (d) propagate formula change to web if applicable, (e) run web tests

SCENARIO 3: DATABASE MIGRATION
- Developer creates a new Supabase migration (e.g., adds `referral_code` column to `user_profiles`)
- Agent must: (a) check if mobile accesses this table (via identity bridge), (b) update Dart models if needed, (c) update Zod schemas if needed, (d) update RLS policies if this is a sensitive field, (e) run migration in staging, (f) create PRs

SCENARIO 4: BUG FIX PROPAGATION
- Developer fixes a timezone bug in Flutter (mobile)
- Agent must: (a) analyze if the same bug pattern exists in web code, (b) if yes, generate the equivalent fix for TypeScript, (c) if the fix requires a Cloud Function redeploy, trigger it, (d) create PRs for affected repos

SCENARIO 5: DEPENDENCY UPDATE
- A security advisory is published for `@supabase/supabase-js`
- Agent must: (a) check both repos for the affected dependency, (b) update package.json / pubspec.yaml, (c) run tests, (d) check for breaking API changes in the new version, (e) create PRs

For each scenario, specify:
- Trigger mechanism (webhook? cron? manual?)
- Agent steps (numbered, with tool calls)
- Validation gates (what must pass before the agent can merge?)
- Failure handling (what happens if tests fail? if the generated code doesn't compile?)
- Human-in-the-loop checkpoints (where does a human review before proceeding?)

3. INFRASTRUCTURE DESIGN
Design the infrastructure needed to run these agents:

A. CI/CD PIPELINE
- GitHub Actions workflows for both repos
- Automated testing: Vitest (web), Vitest (packages), Flutter test (mobile), Playwright e2e (web)
- Deployment: Netlify (web), Firebase Hosting + Functions (mobile)
- Environment management: staging vs production
- How to handle secrets (Supabase keys, Firebase service accounts, Stripe keys, RevenueCat keys)

B. AGENT HOSTING
- Where do the AI agents run? (GitHub Actions runners? Dedicated server? Cloud Functions?)
- How to manage agent state across runs (conversation history, context about codebase)
- Token budget management (prevent runaway API costs)
- Monitoring and alerting (agent failures, cost overruns, quality degradation)

C. QUALITY GATES
- How to validate agent-generated code before it's merged
- Automated code review (linting, type checking, test coverage)
- Human review triggers (when does the system escalate to a human?)
- Rollback mechanisms (if agent-generated code causes a production incident)

D. OBSERVABILITY
- Dashboard showing: agent runs, changes propagated, PRs created, test results, deployment status
- Cost tracking: API tokens consumed per agent run, per scenario type
- Quality metrics: % of agent PRs approved without changes, % of agent PRs that introduced regressions

4. PROGRESSIVE IMPLEMENTATION PLAN
Design a phased rollout for the agentic system:

PHASE 1 (Week 1-2): CI/CD Foundation
- Set up GitHub Actions for both repos
- Automated testing on every push
- Automated deployment to staging on merge to main

PHASE 2 (Week 3-4): Schema Sync Agent
- Single agent that watches packages/shared for schema changes
- Generates Dart models from Zod schemas
- Creates PRs in mobile repo
- Human review required

PHASE 3 (Week 5-8): Multi-Agent Expansion
- Add Bug Fix Propagation agent
- Add Dependency Update agent
- Add Database Migration agent
- Reduce human review to spot-checks for high-confidence changes

PHASE 4 (Week 9-12): Autonomous Operations
- Agents handle routine maintenance autonomously
- Human review only for: new features, architectural changes, security-sensitive code
- Cost optimization (batch similar changes, cache analysis results)

5. COST MODELING
For each agent framework (LangGraph, Google Agent Engine, CrewAI, Custom Claude, Claude Code):
- Estimated monthly cost for continuous monitoring of 2 repos
- Cost per scenario execution (schema change, bug fix, etc.)
- Break-even analysis: at what point does the agent system pay for itself vs. manual developer time?
- Scaling: how does cost change as the codebase grows from 100K LOC to 500K LOC?

OUTPUT FORMAT: Structured report. Include architecture diagrams (described in text/mermaid format). For the Sync-Logic workflows, use numbered step sequences with tool calls. For cost modeling, use tables with conservative/moderate/aggressive estimates. Cite real-world examples of companies using AI agents for cross-platform code maintenance in 2025-2026.
```

---

*Protocols generated from codebase analysis of 725 source files across SOCELLE WEB (React/TypeScript/Supabase) and SOCELLE Mobile (Flutter/Dart/Firebase). Technical specifics extracted from package.json, pubspec.yaml, source code, and 14 planning documents.*
