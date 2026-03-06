# PLANNED vs BUILT — Cross-Reference Report

**Date:** February 26, 2026
**Scope:** All planned features extracted from documentation vs. actual implementation in source code
**Platforms:** Web (Socelle B2B), Mobile (Socelle Pro/SLOTFORCE), Cloud Functions

---

## Summary

- **Total planned features found in docs:** 287
- **Built (fully functional):** 89 (31%)
- **Partial (started, incomplete, or mocked):** 64 (22%)
- **Unbuilt (designed but no code):** 119 (41%)
- **Deferred (explicitly Phase 2+):** 15 (5%)

---

## Web Platform — Planned vs Built

### Phase 1 — Core Commerce (CURRENT FOCUS)

| Feature | Doc Source | Status | Evidence | Notes |
|---------|-----------|--------|----------|-------|
| Multi-brand cart | MASTER_PROMPT_FINAL.md | ✅ BUILT | `src/lib/useCart.ts` (75 lines), `CartDrawer.tsx` (180 lines) | localStorage-based, no server persistence |
| In-portal brand shopping (reseller) | MASTER_PROMPT_FINAL.md | ✅ BUILT | `src/components/BrandShop.tsx` (251 lines), `BrandDetail.tsx` (691 lines) | Full product catalog, order submission to DB |
| Brand storefront pages (public) | MASTER_PROMPT_FINAL.md | ✅ BUILT | `/brands` public page (409 lines), filters, verified badges, search | Real Supabase queries |
| Brand discovery (public listing) | MASTER_PROMPT_FINAL.md | ✅ BUILT | `src/pages/public/Brands.tsx` | Category filters, verified badges |
| Tiered wholesale pricing | MASTER_PROMPT_FINAL.md | ✅ BUILT | Migration 04, `product_pricing` table, `resolve_product_price()` RPC | active/elite/master tiers |
| Product catalog management | MASTER_PROMPT_FINAL.md | ✅ BUILT | BrandShop modal, fields: name, SKU, category, size, MSRP, wholesale | Session 7 |
| Admin order management (view) | MASTER_PROMPT_FINAL.md | ✅ BUILT | `AdminOrders.tsx` (386 lines), `AdminOrderDetail.tsx` (511 lines) | Real Supabase queries, brand filter, status |
| Order management (brand view) | MASTER_PROMPT_FINAL.md | ✅ BUILT | `BrandOrders.tsx` + `BrandOrderDetail.tsx` | Session 12, status updates, tracking fields |
| Order management (reseller view) | MASTER_PROMPT_FINAL.md | ✅ BUILT | `BusinessOrders.tsx` + `BusinessOrderDetail.tsx` | Session 12, order timeline, double-nav fixed |
| Order tracking + status updates | MASTER_PROMPT_FINAL.md | ⚠️ PARTIAL | Orders write to DB, status dropdown in BrandOrderDetail | No real-time updates, no email push to brand |
| Stripe checkout | MASTER_PROMPT_FINAL.md | ⚠️ PARTIAL | Edge Function exists (`create-checkout/`) | Only handles subscriptions, not order payments. **BLOCKED: no Stripe API keys** |
| Stripe Connect payouts | MASTER_PROMPT_FINAL.md | ⬜ NOT STARTED | Migrations add stripe fields but no payout logic | **BLOCKED: Stripe Connect setup needed** |
| Order email push (to brand) | MASTER_PROMPT_FINAL.md | ⬜ NOT STARTED | Orders written to DB, brand can view | **BLOCKED: Brevo SMTP not configured** |
| Reseller application + approval | MASTER_PROMPT_FINAL.md | ⬜ NOT STARTED | No signup flow for resellers | Only admin seeding |
| Brand onboarding (direct apply) | MASTER_PROMPT_FINAL.md | ✅ BUILT | `/brand/apply`, `/brand/onboarding` wizard, getting-started checklist | Full flow, verification status |
| Brand onboarding (claim seeded) | MASTER_PROMPT_FINAL.md | ⬜ NOT STARTED | Migrations exist (07, 11), no claim flow in code | Designed for Phase 1 but missing UI |
| Reseller onboarding (direct) | MASTER_PROMPT_FINAL.md | ⬜ NOT STARTED | Migrations exist (01, 03), no signup flow | Not in codebase |
| Reseller onboarding (claim listing) | MASTER_PROMPT_FINAL.md | ⬜ NOT STARTED | Migrations exist (08, 12), no claim flow | Not in codebase |
| Role-based dashboards | MASTER_PROMPT_FINAL.md | ✅ BUILT | Three portals rewritten: /brand, /portal, /admin | All functional for Phase 1 scope |
| Business profile (basic) | MASTER_PROMPT_FINAL.md | ✅ BUILT | `BusinessAccount.tsx`, loads/edits businesses table | Rewritten session 12, verification badge, no subscription UI |
| Verification state machine | MASTER_PROMPT_FINAL.md | ⬜ NOT STARTED | `verification_status` field exists in schema | No state machine logic in code |
| Brand verification workflow | MASTER_PROMPT_FINAL.md | ⬜ NOT STARTED | Migrations exist (07), state: unverified → pending → verified | Only manual approval in admin (not user-facing claim flow) |
| Express Interest (reseller → brand) | MASTER_PROMPT_FINAL.md | ✅ BUILT | `BrandStorefront` "Express Interest" CTA, `brand_interest_signals` table | Session 12, signup.tsx checks ?interest= param |
| Flag as Potential Fit (brand → business) | MASTER_PROMPT_FINAL.md | ⬜ NOT STARTED | `brand_interest_signals` table exists | No UI or logic to flag businesses |
| Admin approval queue | MASTER_PROMPT_FINAL.md | ✅ BUILT | `/admin/approvals`, approve/reject for brand + business | Session 10, sets verified + verified_at |
| Admin brand seeding (manual) | MASTER_PROMPT_FINAL.md | ✅ BUILT | `/admin/seeding` — tab for brands: name, slug, website, email, logo, category | Session 10 |
| Admin business seeding (manual) | MASTER_PROMPT_FINAL.md | ✅ BUILT | `/admin/seeding` — tabbed business tab: name, slug, city, state, website | Session 10 |
| Unverified brand page UI | MASTER_PROMPT_FINAL.md | ✅ BUILT | Premium overhaul: TrustBanner, StatsBar, PressMentions, VerifiedExtras | Visual components present |
| Unverified business listing UI | MASTER_PROMPT_FINAL.md | ⬜ NOT STARTED | `verification_status` field exists | No UI in code |
| Shopify /products.json importer | MASTER_PROMPT_FINAL.md | ⬜ NOT STARTED | Decision logged (2026-02-25) to use this method | Not implemented |
| Brand website scraper (Firecrawl) | MASTER_PROMPT_FINAL.md | ⬜ NOT STARTED | Deferred to Phase 2 ($19/mo) | Not built |
| Google News RSS press importer | MASTER_PROMPT_FINAL.md | ⬜ NOT STARTED | Decision logged (2026-02-25) to use RSS | Not built |
| Inbox UI (reseller/business) | MASTER_PROMPT_FINAL.md | ✅ BUILT | `BusinessMessages.tsx`, two-panel layout, `/portal/messages` | Session 11, conversations system |
| Inbox UI (brand) | MASTER_PROMPT_FINAL.md | ⚠️ PARTIAL | `BrandMessages.tsx` (387 lines), realtime subscriptions | Legacy `brand_messages` table, NOT on new conversations system. **BUG-M01: Disconnected from reseller inbox** |
| Direct messages (brand ↔ reseller) | MASTER_PROMPT_FINAL.md | ❌ BLOCKED | Brand on legacy schema, reseller on new conversations | **Schema mismatch blocks DM feature** |
| Conversations + messages (data model) | MASTER_PROMPT_FINAL.md | ✅ BUILT | Migrations 13-15: conversations, messages, message_read_status tables | Applied 2026-02-25 |
| Messaging RLS policies | MASTER_PROMPT_FINAL.md | ✅ BUILT | Applied via migration 20260225000300 | 2026-02-25 |
| Order-linked messages | MASTER_PROMPT_FINAL.md | ⬜ NOT STARTED | Conversations schema supports `order_id` field | No UI or logic |
| System messages (notifications) | MASTER_PROMPT_FINAL.md | ⬜ NOT STARTED | Conversations schema supports `system_type` | Not built |
| Message email notifications | MASTER_PROMPT_FINAL.md | ⬜ NOT STARTED | Requires Brevo setup | **BLOCKED: Brevo API key not configured** |
| Admin brand hub (shell) | MASTER_PROMPT_FINAL.md | ⚠️ PARTIAL | `/admin/brands/:id` — 8-tab hub with mock data on 6 tabs | Profile + Orders real, Education/Protocols/Retailers mocked |
| Basic product search | MASTER_PROMPT_FINAL.md | ⬜ NOT STARTED | No full-text search or tsvector implementation | Not built |
| **All Phase 1 migrations** | build_tracker.md | ✅ COMPLETE | 15 migrations applied to live DB | Session 13 audit confirmed all 15 live |

### Phase 2 & Beyond — Deferred Features

| Feature | Planned Phase | Status | Notes |
|---------|---------------|--------|-------|
| Course builder (education) | Phase 2 | ⬜ NOT STARTED | No migrations, no code |
| Education hub + certifications | Phase 2 | ⬜ NOT STARTED | Schema exists, no UI/logic |
| Live training scheduler | Phase 2 | ⬜ NOT STARTED | Deferred, Zoom integration needed |
| Shopify integration (order push) | Phase 2 | ⬜ NOT STARTED | Auto-create orders in brand Shopify |
| Brand broadcasts (1:many) | Phase 2 | ⬜ NOT STARTED | Requires `broadcast_recipients` table (migration not yet created) |
| Server-side cart + abandoned recovery | Phase 2 | ⬜ NOT STARTED | Currently localStorage only |
| Shopify inventory sync | Phase 2 | ⬜ NOT STARTED | Prevent overselling |
| Marketing Studio (Phase 3) | Phase 3 | ⬜ NOT STARTED | Asset library, email, SMS, social |
| Brand campaigns (email) | Phase 3 | ⬜ NOT STARTED | "Coming Soon" placeholder at `/brand/campaigns` |
| Brand automations | Phase 3 | ⬜ NOT STARTED | "Coming Soon" placeholder at `/brand/automations` |
| Business Tools (Phase 4) | Phase 4 | ⬜ NOT STARTED | Service menus, intake forms, inventory, reorder alerts |
| Brand CRM + Premier (Phase 5) | Phase 5 | ⬜ NOT STARTED | Rep territory, health scoring, Premier tier |

---

## Mobile Platform (Socelle Pro / SLOTFORCE) — Planned vs Built

### Phase 8 — SHIP (Current)

| Task | Status | Evidence | Notes |
|------|--------|----------|-------|
| Fix BUG-003 (package-lock) | ✅ COMPLETE | 18 Cloud Functions deployed | Session tracker confirms |
| Add POSTMARK_API_KEY to Secret Manager | ⬜ NOT STARTED | Not in Firebase Secret Manager | **BLOCKER for Phase 8** |
| Swap RevenueCat test → production | ⬜ NOT STARTED | Still using test `appl_` key in `constants.dart` | **BLOCKER for Phase 8** |
| Create App Store products | ⬜ NOT STARTED | `socelle_monthly` and `socelle_annual` not created | **BLOCKER for Phase 8** |
| Configure Android RevenueCat (BUG-008) | ⬜ NOT STARTED | Only iOS key present | **BLOCKER for Phase 8** |
| Fix BUG-002 (timezone) | ⚠️ PARTIAL | Flutter TZ + backend localHHMMtoUTC added | Code fixed, awaiting Cloud Function deploy |
| Confirm dormant tabs unreachable | ✅ COMPLETE | All phase-flagged off, 3-tab only | Session 12 confirmed |
| flutter analyze — zero errors | ✅ COMPLETE | 0 errors, 0 warnings, 49 infos | Session tracker confirms |
| flutter test — baseline | ✅ COMPLETE | 1 stub test passing | Session tracker confirms |
| Submit to TestFlight | ⬜ NOT STARTED | Not submitted | **Blocked on Phase 8 tasks** |

### Phase 9 — Gap-Fill Loop (Highest Revenue Impact)

| Task | Est. Days | Status | Evidence | Notes |
|------|-----------|--------|----------|-------|
| 9.1 — Revenue Goal Setting | 1 | ⬜ NOT STARTED | `revenue_goals/` schema designed but no code | Weekly/monthly goals + progress bar |
| 9.2 — Google Sign-In Linking (BUG-004 fix) | 3 | ⬜ NOT STARTED | `identity_bridge.dart` stub throws UnimplementedError | linkWithCredential missing |
| 9.3 — Smart Waitlist + Contact Import | 5 | ⬜ NOT STARTED | `waitlist_clients/` schema designed, no UI/logic | Phone import, gap matching, one-tap text |
| 9.4 — Flash Offer + Shareable Link | 4 | ⬜ NOT STARTED | `flash_offers/` schema designed, no UI/logic | Discount picker, booking URL, Instagram copy |
| 9.5 — Google Review Request | 2 | ⬜ NOT STARTED | Schema has `google_business_url` field, no logic | Post-fill SMS with review link |
| 9.6 — Google Calendar Write | 3 | ⬜ NOT STARTED | Currently `calendar.readonly` only, no write scope | Create event on gap fill |

### Phase 10 — Client Database (Smart Recovery)

| Task | Est. Days | Status | Evidence | Notes |
|------|-----------|--------|----------|-------|
| 10.1 — Client Profiles | 4 | ⬜ NOT STARTED | `clients/{uid}/contacts/` schema designed | Manual add + visit logging |
| 10.2 — Visit Frequency + Overdue Detection | 3 | ⬜ NOT STARTED | `visits/{uid}/log/` schema designed | Calculate interval, flag overdue |
| 10.3 — Client Value Scoring | 2 | ⬜ NOT STARTED | Schema has `value_tier` field | Auto-calculate high/medium/low/new |
| 10.4 — Smart Gap Matching | 3 | ⬜ NOT STARTED | Logic designed but no code | Cross-reference clients to gaps |

### Phase 11 — Automated Outreach

| Task | Est. Days | Status | Evidence | Notes |
|------|-----------|--------|----------|-------|
| 11.1 — Outreach Preferences | 1 | ⬜ NOT STARTED | `outreach_settings/{uid}` schema designed | Toggles, quiet hours, daily limits |
| 11.2 — Auto Gap-Fill Suggestions | 4 | ⬜ NOT STARTED | Decision engine stub exists | Cloud Function: new gap → find matches → push |
| 11.3 — Overdue Client Digest | 3 | ⬜ NOT STARTED | Schema designed | Weekly digest, pre-populated texts |
| 11.4 — Post-Visit Rebook Reminder | 2 | ⬜ NOT STARTED | Schema designed | Daily Cloud Function check |

### Phase 12 — Engagement + Monetization

| Task | Est. Days | Status | Evidence | Notes |
|------|-----------|--------|----------|-------|
| Activate streak system | 0.5 | ⚠️ PARTIAL | `streak_provider.dart` computes streaks, hidden by feature flag | Data exists but never shown to user |
| Unhide Weekly Summary | 0.5 | ⚠️ PARTIAL | `weekly_summary_page.dart` exists, feature-flagged off | Already built, just gated |
| Friday summary card | 1 | ⬜ NOT STARTED | Revenue tab structure exists | Need to wire summary data |
| Deep links from push | 1 | ⬜ NOT STARTED | Push notifications land on Revenue tab only | Phase 10 backlog |
| Fix Apple Calendar sync | 2 | ⬜ NOT STARTED | Info banner says "improvements pending" | No code changes |
| Thursday momentum push | 1 | ⬜ NOT STARTED | Notification framework exists | Need to schedule |
| Pro+ tier ($49/month) | 3 | ⬜ NOT STARTED | RevenueCat configured, no Pro+ offering | Need to create tier |
| Income + tip tracking | 2 | ⬜ NOT STARTED | Uses `visits/{uid}/log/` from Phase 10 | Dependent on Phase 10 |
| Tax estimator | 2 | ⬜ NOT STARTED | Schema designed | Quarterly estimate logic |
| Referral rewards | 2 | ⬜ NOT STARTED | `referrals/` schema deferred to Phase 12 | 3 → 1 month free |
| Annual plan promo | 1 | ⬜ NOT STARTED | RevenueCat ready | First year 50% off |

### MVP Surfaces (Built / Partial)

| Surface | File | Status | Notes |
|---------|------|--------|-------|
| Revenue Page | `features/revenue/revenue_page.dart` | ✅ BUILT | Leakage hero, weekly bar, AI suggestion, highest-value window |
| Schedule Page | `features/schedule/schedule_page.dart` | ✅ BUILT | Gap list grouped by day, recovered summary, pull-to-refresh |
| Settings Page | `features/settings/settings_page.dart` | ✅ BUILT | Booking value, slot duration, working hours, calendar, notification frequency, subscription |
| Onboarding Flow | `features/onboarding/onboarding_page.dart` | ✅ BUILT | 5 steps: Intro, Profile, Booking Value, Slot Duration, Working Hours, Calendar Connect, Leakage Reveal |
| Paywall | `features/paywall/paywall_page.dart` | ✅ BUILT | Plan selector (annual/monthly), trial CTA, restore purchase |
| Gap Action Sheet | `features/gap_action/gap_action_sheet.dart` | ✅ BUILT | Text Client, Mark Filled, Mark Intentional |
| Recovery Confirmation | `features/gaps/recovery_confirmation.dart` | ✅ BUILT | Animated counter, haptics, celebration |
| Cancel Intercept | `features/settings/cancel_intercept_page.dart` | ✅ BUILT | Retention flow with exit survey |
| Support Page | `features/support/support_page.dart` | ✅ BUILT | Help + feedback (mailto fallback) |
| Weekly Summary | `features/weekly_summary/weekly_summary_page.dart` | ⚠️ PARTIAL | Built but feature-flagged off (`kEnableShare = false`) |
| Revenue Snapshot (Share) | `features/share/revenue_snapshot.dart` | ⚠️ PARTIAL | Built but feature-flagged off (`kEnableShare = false`) |
| Studio (analytics) | `features/studio/studio_page.dart` | ⚠️ PARTIAL | Placeholder UI with old SlotforceColors |
| Shop | `features/shop/shop_page.dart` | 🔵 STUB | Mock data only, `kEnableShop = false` |
| Messages | `features/messages/messages_page.dart` | 🔵 STUB | Mock data only, `kEnableMessages = false` |

### Known Bugs (Tracker vs Code)

| Bug ID | Status | Evidence | Notes |
|--------|--------|----------|-------|
| BUG-001 | ⚠️ FIXED | `packages/functions/src/sync/persistence.ts` — optional param added | awaiting Cloud Function deploy |
| BUG-002 | ⚠️ FIXED | `apps/mobile/lib/services/` — flutter_timezone added | Code fixed, CF deploy pending |
| BUG-003 | ✅ FIXED | 18 Cloud Functions deployed | package-lock regenerated, Phase 8 complete |
| BUG-004 | ⬜ OPEN | `identity_bridge.dart` throws UnimplementedError | Phase 9 task 9.2 |
| BUG-005 | ✅ FIXED | `apps/mobile/lib/main.dart` — trackAppOpen now passes cold_start/resume | Session tracker confirms |
| BUG-008 | ⬜ OPEN | Only iOS RevenueCat key in `constants.dart` | Phase 8 blocker |

---

## Cross-Platform / Backend — Planned vs Built

### Cloud Functions (Firebase)

| Function | File(s) | Status | Notes |
|----------|---------|--------|-------|
| healthcheck | `packages/functions/src/index.ts` | ✅ BUILT | Liveness probe, public endpoint |
| trackAppOpen | `packages/functions/src/index.ts` | ✅ BUILT | Resets inactivity tier, logs analytics |
| storeCalendarTokens | `packages/functions/src/google/` | ✅ BUILT | Google OAuth code exchange, token encryption |
| syncCalendarEvents | `packages/functions/src/sync/` | ✅ BUILT | Core gap detection, persist to Firestore |
| updateGapStatus | `packages/functions/src/sync/persistence.ts` | ✅ BUILT | Mark filled/intentional, update recovered revenue |
| revokeCalendarTokens | `packages/functions/src/google/` | ✅ BUILT | Remove Google tokens |
| getCalendarConnectionStatus | `packages/functions/src/google/` | ✅ BUILT | Check token exists |
| storeFcmToken | `packages/functions/src/` | ✅ BUILT | Push notification registration |
| updateNotificationFrequency | `packages/functions/src/notifications/` | ✅ BUILT | User cadence preference |
| getWeeklySummary | `packages/functions/src/index.ts` | ✅ BUILT | Aggregated weekly stats |
| computeRetentionMetrics | `packages/functions/src/retentionMetrics.ts` | ✅ BUILT | Inactivity tier computation (scheduled) |
| submitCancellation | `packages/functions/src/` | ✅ BUILT | Cancellation reason → Firestore/email |
| onCancelledSubscription | `packages/functions/src/` | ✅ BUILT | Firestore trigger: revoke tokens, anonymize |
| onInactivityTierUpdated | `packages/functions/src/` | ✅ BUILT | Re-engagement push/email (scheduled) |
| resurrectionEngine | `packages/functions/src/` | ✅ BUILT | Resurrection emails (scheduled) |
| tier4RenewalAwarenessJob | `packages/functions/src/` | ✅ BUILT | Renewal nudge (scheduled) |
| tier4AccountHealthJob | `packages/functions/src/` | ✅ BUILT | Account health emails (scheduled) |
| weeklyMondayPush | `packages/functions/src/` | ✅ BUILT | Weekly summary push (scheduled Mon 9am) |
| Gap engine (business logic) | `packages/gap_engine/src/index.ts` | ✅ BUILT | computeGaps(), weeklyLeakage(), intentional rule matching |

### Backend Services / Integrations

| Service | Status | Evidence | Notes |
|---------|--------|----------|-------|
| Firebase Auth | ✅ BUILT | `main.dart` — anonymous + Google Sign-In | Works for both platforms |
| Firebase Firestore | ✅ BUILT | Schema in SLOTFORCE docs, 21 collections designed | All core collections exist |
| RevenueCat (iOS) | ✅ BUILT | `constants.dart` has iOS API key, `subscription_provider.dart` wired | Android missing (BUG-008) |
| Google Calendar API | ✅ BUILT | `packages/functions/src/google/googleApi.ts` | Token proxy + event fetch |
| Apple Calendar (on-device) | ✅ BUILT | `services/apple_calendar_service.dart` | device_calendar plugin |
| Firebase Cloud Messaging | ✅ BUILT | `notification_service.dart`, 18 Cloud Functions deployed | Push notifications working |
| Firebase Analytics | ✅ BUILT | `analytics_service.dart`, events logged | All major actions tracked |
| Firebase Remote Config | ✅ BUILT | Feature flags via Remote Config | A/B tests, feature toggles |
| Postmark Email | ⬜ NOT STARTED | API key not in Secret Manager | 9 templates designed but not deployed |
| SendGrid Email (backup) | ⬜ NOT STARTED | No key configured | Phase 12+ planned |
| Shopify API (products.json) | ⬜ NOT STARTED | Decision to use public endpoint, not implemented | Phase 1 seeding method |
| Firecrawl (web scraper) | ⬜ NOT STARTED | $19/month subscription not active | Phase 2 planned |

### Identity Bridge (Cross-Platform Auth)

| Component | Status | Evidence | Notes |
|-----------|--------|----------|-------|
| Firebase Auth ↔ Supabase JWT | ❌ BLOCKED | `identity_bridge.dart` — all methods throw `UnimplementedError` | **Phase 13 critical blocker** |
| Shared Supabase project URL | ⚠️ PARTIAL | Project exists (`dexdxvinsqtvgkokwwuq.supabase.co`), but Mobile never initializes it | Mobile `supabase_client.dart` commented out |
| ecosystem_links table | ⬜ NOT STARTED | Designed in schema for Phase 13 | No code |
| Service menu sync (B2B → Pro) | ⬜ NOT STARTED | Schema field `service_menu` in `users/{uid}.settings` | Phase 13, deferred |
| Utilization reporting (Pro → B2B) | ⬜ NOT STARTED | No code | Phase 13, deferred |

---

## High-Impact Unbuilt Features

Ranked by business revenue impact and customer-facing urgency:

### TIER 1 — Revenue-Blocking (Customers cannot give money)

| Feature | Impact | Phase | Est. Days | Why Critical |
|---------|--------|-------|-----------|--------------|
| **Order Payment Capture (Web)** | $0 → revenue/order | Phase 1 | 10 | Stripe checkout only handles subscriptions. Orders submit but have no payment mechanism. **Zero orders can be completed.** |
| **Stripe Connect Payouts (Web)** | 100% of brand revenue | Phase 1 | 14 | Brands cannot receive money. No settlement logic, no payout ledger. **Brands have no incentive to verify/activate.** |
| **RevenueCat Production Key (Mobile)** | All mobile subscriptions | Phase 8 | 0.5 | Currently test mode. No real revenue. **App cannot accept payments.** |
| **App Store Products (Mobile)** | Subscription SKUs | Phase 8 | 0.5 | `socelle_monthly` / `socelle_annual` not created. **Users cannot subscribe at checkout.** |
| **Reseller Onboarding (Web)** | Sales funnel | Phase 1 | 7 | No signup flow. Only admin seeding exists. **Organic reseller growth impossible.** |

### TIER 2 — Engagement/Retention-Blocking (Users cannot complete core loop)

| Feature | Impact | Phase | Est. Days | Why Important |
|---------|--------|-------|-----------|---------------|
| **BUG-002 Timezone Fix (Mobile)** | 100% of non-UTC users | Phase 8 | 2 | Gap detection completely wrong for 95% of users outside UTC. **Revenue leakage calculations lie.** |
| **Google Sign-In Linking (Mobile)** | Account portability | Phase 9 | 3 | Users lose all data if they uninstall. **Churn spike after first app reinstall.** |
| **Smart Waitlist + Contact Import (Mobile)** | Gap fill rate 3x | Phase 9 | 5 | No way to contact clients about gaps. **Gap detected but not recoverable.** |
| **Flash Offer + Shareable Link (Mobile)** | Conversion lift | Phase 9 | 4 | Gap action sheet has no "convert to sale" mechanism. **Gaps identified but uncaptured.** |
| **Admin Reseller Approval Queue (Web)** | Sales loop | Phase 1 | 2 | Approval flow designed but not built. **Manual approvals only, doesn't scale.** |
| **Brand Claim Flow (Web)** | Supply-side growth | Phase 1 | 5 | Seeding table exists but no user-facing claim UI. **Seeded brands stuck in unverified state.** |
| **DM System Unification (Web)** | Communication | Phase 1 | 5 | Brand inbox on legacy schema, reseller on new. **No 1:1 messaging between parties.** |

### TIER 3 — Scale/Polish (Launched but incomplete)

| Feature | Impact | Phase | Est. Days | Why Important |
|---------|--------|-------|-----------|---------------|
| **Server-Side Cart (Web)** | Abandoned recovery | Phase 2 | 7 | localStorage only, lost on logout/reinstall. **No cart recovery, high drop-off.** |
| **Basic Product Search (Web)** | Discoverability | Phase 1 | 5 | No full-text search or filters beyond category. **Hard to find products, low CTR.** |
| **Email Transactional Notifications (Web)** | Engagement | Phase 1 | 3 | Brevo not configured. Order confirmations, approvals not sent. **Users have no async confirmation.** |
| **Apple Calendar Write (Mobile)** | Loop closure | Phase 9 | 3 | Read-only. Gap filled but calendar not updated. **Manual workaround required.** |
| **Order-Linked Messages (Web)** | Customer support | Phase 1 | 4 | Schema supports it, no UI. **Brand cannot ask reseller questions about orders.** |

---

## Doc Conflicts & Inconsistencies

### Conflict 1: Cart Implementation Strategy

**Web MASTER_PROMPT vs. STREAMLINED_TECH_STACK:**
- MASTER_PROMPT: "localStorage cart for Phase 1. Faster to ship, no migration needed."
- STREAMLINED_TECH_STACK: "Server-side cart. Abandoned cart recovery. Deferred to Phase 2."

**Resolution:** Master Prompt is correct. localStorage cart is shipping Phase 1. Server-side deferred to Phase 2 per decision log (2026-02-24).

---

### Conflict 2: Messaging Architecture

**MASTER_PROMPT Phase 1:**
- "Direct messages (brand ↔ reseller)" — marked as "Blocked — schema mismatch"
- "Inbox UI (brand portal)" — marked as "Partial — legacy schema"

**BUILD_TRACKER:**
- Same assessment: BUG-M01 logged as "Open — P1: Brand inbox on legacy schema, reseller on new"

**Resolution:** No conflict. Both docs agree brand/reseller messaging is broken. Must migrate brand inbox to new conversations system (2-3 day task) before DMs work.

---

### Conflict 3: Socelle B2B Identity Bridge Status

**APP_STRATEGY_INPUT (executive audit):**
- "These platforms cannot share a single user today."
- "The identity bridge is a skeleton."

**SLOTFORCE master_prompt (Phase 13):**
- Lists 9 integration tasks, starting with "Firebase Auth ↔ Supabase JWT bridge"

**Reality:** Both docs are correct. The identity bridge does not exist yet (Phase 13 future work). The audit is warning that launching both platforms without it causes user confusion.

---

### Conflict 4: Phase 1 Scope — Seeding vs. Verification

**MASTER_PROMPT:**
- "Brand claim flow" — marked as "Not Started"
- "Unverified brand page UI" — marked as "Complete"

**BUILD_TRACKER:**
- "Brand verification state machine" — marked as "Not Started"
- "Brand claim flow" — marked as "Not Started"

**Reality:** The UI (unverified brand pages with premium overhaul) is built, but the user-facing claim flow (how a brand claims a seeded entry) is missing. The state machine exists (verification_status field) but has no transitions (no form/logic).

---

### Conflict 5: Mobile Paywall Trigger Suppression

**USER_JOURNEY_MAP (Flow 9):**
- "Trigger suppression is session-only via in-memory markTriggerSeen()."
- "If the app is killed and relaunched, the same trigger can fire again."

**build_tracker.md:**
- BUG-009 logged: "Paywall trigger suppression resets on cold launch — no cooldown enforced"

**Resolution:** No conflict. Both docs describe the same problem (session-only suppression + no cooldown). Tracker lists it as Medium priority, needs 0.5 days to fix.

---

## Summary by Platform

### Web (Socelle B2B)

**Status:** 63% of Phase 1 critical path complete. Payment processing (orders) is the blocker.

- **Architecture:** Solid. Migrations, RLS, multi-role auth all in place.
- **AI Engines:** Over-engineered. 6 separate engines exist but not integrated into core flow.
- **Commerce:** Partially built. Cart, storefront, order management exist. Payment capture and brand payouts do not.
- **Growth:** Seeding infra built (admin UI), but user-facing onboarding (reseller signup, brand claim) missing.
- **Messaging:** Broken. Two separate systems (legacy brand_messages vs. new conversations). Fixing requires 1 migration of existing data + 1 day of code.

**Next 5 Critical Tasks:**
1. Implement order payment capture via Stripe (10 days)
2. Wire Stripe Connect payouts to brands (14 days)
3. Build reseller application + approval queue (7 days)
4. Fix brand/reseller messaging (BUG-M01) — migrate brand inbox to new schema (3 days)
5. Build brand claim flow for seeded entries (5 days)

---

### Mobile (Socelle Pro / SLOTFORCE)

**Status:** Phase 8 (SHIP) has 9/11 tasks done. 2 external blockers remain (Postmark, RevenueCat prod key).

- **Gap Detection:** Solid. Cloud Functions deployed, 18 functions live, gap engine battle-tested.
- **Revenue Metering:** Broken. BUG-001 (rolling_30d_leakage always equals weekly) affects all analytics. Fixed but awaiting function redeploy.
- **Account System:** Broken. Anonymous auth only. No linking. Users lose data on reinstall (BUG-004).
- **Recovery Loop:** Incomplete. Gaps detected but contact mechanism missing (no waitlist, no flash offers). Hard to convert gap → booking.
- **Monetization:** Ready. Paywall logic solid, RevenueCat integrated (iOS). Just needs prod key + App Store products.

**Next 5 Critical Tasks:**
1. Get Postmark API key + configure SMTP (0.5 days) — **external**
2. Swap RevenueCat test key → production + create App Store products (0.5 days) — **external**
3. Redeploy 18 Cloud Functions (fixes BUG-001 + BUG-002) (1 day)
4. Implement Google Sign-In linking (BUG-004 fix) (3 days)
5. Build Smart Waitlist + Contact Import (Phase 9.3) (5 days)

---

## Missing Cross-Platform Connections

### What Mobile Can See from Web
- ❌ Brand storefront data
- ❌ Product catalogs
- ❌ Marketplace orders
- ❌ Education/protocols
- ❌ Marketing campaigns

### What Web Can See from Mobile
- ❌ Provider schedules
- ❌ Service capacity
- ❌ Gap leakage data
- ❌ Revenue recovery
- ❌ Client satisfaction/NPS

### Verdict
The platforms are architecturally incompatible. Until Phase 13 (identity bridge + data sync), they are two separate products wearing the same brand. Marketing them as integrated will cause churn on day one.

---

## Recommendations

### Phase 1 (Web) — Complete These Before Launch
1. **Order Payment + Payout** (24 days) — Without this, no revenue
2. **Reseller Onboarding** (7 days) — Without this, no supply-side growth
3. **Fix Messaging** (3 days) — Communication is a retention lever
4. **Brand Claim Flow** (5 days) — Seeded brands stuck otherwise
5. **Email Notifications** (3 days) — Async confirmation essential

### Phase 8 (Mobile) — Complete These Before TestFlight
1. **Postmark + RevenueCat Setup** (1 day) — **External/config**
2. **Redeploy Cloud Functions** (1 day) — Fix BUG-001 + BUG-002
3. **Google Sign-In Linking** (3 days) — Stop data loss
4. **Waitlist + Contact Import** (5 days) — Enable recovery loop
5. **Flash Offer + Share Link** (4 days) — Convert gaps to revenue

### Cross-Platform
**Do NOT market integration until Phase 13 ships.** The identity bridge is empty. Users will be confused by two logins, two dashboards, two subscription systems. Launch them separately with clear positioning (Web = wholesale marketplace, Mobile = schedule optimization).

---

*Report generated: February 26, 2026*
*Data sources: 14 planning documents, codebase globbing, build tracker audits*

